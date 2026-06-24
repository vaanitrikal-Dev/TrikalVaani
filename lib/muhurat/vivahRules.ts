// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    lib/muhurat/vivahRules.ts
// Version: v1.0
// Owner:   Rohiit Gupta, Chief Vedic Architect
// Purpose: STRICT-CLASSICAL Vivah (marriage) muhurat rule engine — the
//          "brain" that decides whether a given DAY is auspicious for
//          marriage. PURE logic: no DB, no VM, no network, no React.
//          → Fully testable in isolation.
//          → /api/calc/vivah-muhurat gathers the inputs (panchang_daily,
//            festivals_master, VM windows) and calls evaluateVivahDay().
//
// WHERE EACH FACTOR COMES FROM (this file fetches NONE of them — it only
// receives a panchang row + a set of "active window" flags):
//   ✅ panchang_daily   — nakshatra, tithi, vara, yoga, karana (Bhadra)
//   🔧 festivals_master — Chaturmas, Holashtak  (date-range windows)
//   🆕 VM engine        — Adhik Maas, Kharmas, Guru/Shukra Ast, Grahan,
//                         Sankranti, Pitru Paksha  (slow-moving bodies,
//                         computed ONCE per year & cached — never per slot,
//                         so no timeout risk)
//
// STRICT-CLASSICAL basis: Muhurta Chintamani / standard North-Indian
// panchang vivah rules. Every block below is classical — nothing invented.
// Accuracy is the USP.
//
// ─ Vocabulary is VERIFIED against panchang_daily (city='delhi', 2026):
//     nakshatra stored as "<Name> Pada N"        → strip " Pada N"
//     tithi     stored as "<Name> (<Paksha> Paksha)"
//     vara      stored as Hindi translit "<Planet>var"
//     yoga / karana stored as clean English
// ════════════════════════════════════════════════════════════════════

// ── POSITIVE (must-have) filters ──────────────────────────────────────
// All 11 classical Vivah nakshatras (exact DB spellings):
export const VIVAH_NAKSHATRAS = [
  'Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati',
  'Anuradha', 'Mula', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati',
] as const;

// Auspicious vivah tithis — 2,3,5,7,10,11,13 (exact DB names):
export const VIVAH_TITHIS = [
  'Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami', 'Ekadashi', 'Trayodashi',
] as const;

// Favourable vaar — Mon, Wed, Thu, Fri (exact DB Hindi translit):
export const VIVAH_VARAS = ['Somvar', 'Budhvar', 'Guruvar', 'Shukravar'] as const;

// ── NEGATIVE (day-level) filters — all from panchang_daily ────────────
// The 9 inauspicious yogas (exact DB spellings):
export const FORBIDDEN_YOGAS = [
  'Vishkambha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata',
  'Vajra', 'Vyatipata', 'Parigha', 'Vaidhriti',
] as const;

// Rikta tithis (4, 9, 14) — always avoided:
export const RIKTA_TITHIS = ['Chaturthi', 'Navami', 'Chaturdashi'] as const;

// Bhadra = Vishti karana (exact DB value):
export const BHADRA_KARANA = 'Vishti';

// ── Types ─────────────────────────────────────────────────────────────
// One row as stored in panchang_daily (only the fields the brain needs):
export type PanchangInput = {
  date: string;       // 'YYYY-MM-DD'
  nakshatra: string;  // e.g. 'Rohini Pada 3'
  tithi: string;      // e.g. 'Dashami (Shukla Paksha)'
  vara: string;       // e.g. 'Budhvar'
  yoga: string;       // e.g. 'Shiva'
  karana: string;     // e.g. 'Garaja'
};

// Period-window flags for a given date. TRUE = that forbidden window is
// active on this date. Supplied by the API route from VM engine + festivals.
export type WindowFlags = {
  adhikMaas?: boolean;    // 🆕 VM — intercalary lunar month
  kharmas?: boolean;      // 🆕 VM — Sun in Dhanu/Meen
  guruAst?: boolean;      // 🆕 VM — Jupiter combust
  shukraAst?: boolean;    // 🆕 VM — Venus combust
  grahan?: boolean;       // 🆕 VM — eclipse day
  sankranti?: boolean;    // 🆕 VM — Sun changes sign
  pitruPaksha?: boolean;  // 🆕 VM — Shraddh fortnight
  chaturmas?: boolean;    // 🔧 festivals_master — Devshayani→Devuthani Ekadashi
  holashtak?: boolean;    // 🔧 festivals_master — 8 days before Holi
};

export type VivahVerdict = {
  date: string;
  nakshatra: string;
  tithi: string;
  paksha: string;
  vara: string;
  yoga: string;
  auspicious: boolean;
  blockers: string[];   // every reason this day is NOT auspicious (transparency)
  positives: string[];  // what is favourable on this day
};

// ── DB string parsers ─────────────────────────────────────────────────
export function nakName(raw: string): string {
  return (raw || '').split(' Pada')[0].trim();
}
export function tithiName(raw: string): string {
  return (raw || '').split(' (')[0].trim();
}
export function tithiPaksha(raw: string): string {
  const m = (raw || '').match(/\(([^)]+)\)/);
  return m ? m[1].trim() : '';
}

// ── THE BRAIN ─────────────────────────────────────────────────────────
// Pure function. Give it one panchang row + the active window flags;
// it returns a full strict-classical verdict with transparent reasons.
export function evaluateVivahDay(
  row: PanchangInput,
  windows: WindowFlags = {}
): VivahVerdict {
  const nak = nakName(row.nakshatra);
  const tit = tithiName(row.tithi);
  const paksha = tithiPaksha(row.tithi);
  const yoga = (row.yoga || '').trim();
  const karana = (row.karana || '').trim();
  const vara = (row.vara || '').trim();

  const blockers: string[] = [];
  const positives: string[] = [];

  // 1) PERIOD WINDOWS (engine + festival derived) — hard blocks
  if (windows.adhikMaas)   blockers.push('Adhik Maas (Malmaas) — no vivah in the intercalary month');
  if (windows.kharmas)     blockers.push('Kharmas — Sun in Dhanu/Meen, vivah prohibited');
  if (windows.guruAst)     blockers.push('Guru Ast — Jupiter is combust');
  if (windows.shukraAst)   blockers.push('Shukra Ast — Venus is combust');
  if (windows.grahan)      blockers.push('Grahan (eclipse) period');
  if (windows.sankranti)   blockers.push('Sankranti — Sun changes sign (day avoided)');
  if (windows.pitruPaksha) blockers.push('Pitru Paksha (Shraddh) — inauspicious for vivah');
  if (windows.chaturmas)   blockers.push('Chaturmas — Dev Shayan Kaal, vivah prohibited');
  if (windows.holashtak)   blockers.push('Holashtak — 8 days before Holi');

  // 2) DAY-LEVEL BLOCKS (from panchang_daily)
  if (karana === BHADRA_KARANA) blockers.push('Bhadra (Vishti karana) active');
  if ((FORBIDDEN_YOGAS as readonly string[]).includes(yoga)) blockers.push(`Inauspicious yoga: ${yoga}`);

  const isRikta = (RIKTA_TITHIS as readonly string[]).includes(tit);
  if (isRikta) blockers.push(`Rikta tithi: ${tit}`);
  if (tit === 'Amavasya') blockers.push('Amavasya — new moon, avoided');
  if (tit === 'Purnima') blockers.push('Purnima — avoided for vivah (strict)');

  // 3) POSITIVE (must-have) CHECKS
  const nakOk = (VIVAH_NAKSHATRAS as readonly string[]).includes(nak);
  const titOk = (VIVAH_TITHIS as readonly string[]).includes(tit);
  const varOk = (VIVAH_VARAS as readonly string[]).includes(vara);

  if (nakOk) positives.push(`Vivah nakshatra: ${nak}`);
  else blockers.push(`${nak || 'Nakshatra'} is not a vivah nakshatra`);

  if (titOk) positives.push(`Auspicious tithi: ${tit} (${paksha})`);
  else if (!isRikta && tit !== 'Amavasya' && tit !== 'Purnima')
    blockers.push(`${tit || 'Tithi'} is not a preferred vivah tithi`);

  if (varOk) positives.push(`Favourable vaar: ${vara}`);
  else blockers.push(`${vara || 'Vaar'} is not favourable for vivah`);

  const auspicious = blockers.length === 0 && nakOk && titOk && varOk;

  return { date: row.date, nakshatra: nak, tithi: tit, paksha, vara, yoga, auspicious, blockers, positives };
}

// ════════════════════════════════════════════════════════════════════
// PHASE-2 REFINEMENT (documented, NOT enabled yet — validate date counts
// first). These vaar+tithi / vaar+nakshatra dosha combos are ALSO classical
// and fully derivable from data we already have (vara + tithi + nakshatra):
//   • Dagdha, Visha, Hutashana yogas (vaar + tithi)
//   • Mrityu, Yamaghata yogas        (vaar + nakshatra)
// Enabling them makes the filter even stricter. We add after confirming the
// core filter leaves a healthy number of dates per month.
// ════════════════════════════════════════════════════════════════════
