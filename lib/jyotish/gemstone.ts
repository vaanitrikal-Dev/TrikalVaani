// ============================================================
// File: lib/jyotish/gemstone.ts
// Version: v2.0 — Gemologist Brain (pure chart-based, no user feedback)
// Single source of truth for all gemstone pages.
//
// LOGICAL BASE: strength (Shadbala ratio, inverted) + dignity + house + dasha.
// GEMOLOGIST BRAIN (7 niyam, computed from lordships — not a hand table):
//   1. Dushthana/Maraka VETO  — 8th(randhresh)=avoid, 12th=caution,
//      6th=mild, 2nd/7th(maraka)=trial. Stone wakes a planet's WHOLE portfolio.
//   2. Yogakaraka premium      — kendra+trikona (no dushthana) → big bonus that
//      overrides enemy-sign / bhava weakness.
//   3. Node intelligence       — Rahu/Ketu judged by house + dispositor's
//      functional nature (NOT auto-zeroed). Always expert-gated.
//   4. Mitra/Shatru modulation — friend/enemy/own sign modulates (dignity).
//   5. Marana Karaka Sthana    — planet in its death-house → strong penalty + avoid.
//   6. Badhakesh               — obstacle lord → mild caution (skipped if YK).
//   7. Papakartari             — planet hemmed by malefics → mild (skipped if YK).
//   RISK is a VERDICT CAP, not a score penalty (strong stones → Expert Review).
// Validated against a full 9-stone real-life test chart (all 9 matched).
// NOTE: Combustion / temporal-friendship / avastha need planetary DEGREES,
//       which the API does not yet expose → planned for v2.1 (VM passthrough).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const SIGN_LORD: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
  Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};
// VM returns Sanskrit rashi names — map to English
const SIGN_EN: Record<string, string> = {
  Mesha: 'Aries', Vrishabha: 'Taurus', Mithuna: 'Gemini', Karka: 'Cancer', Simha: 'Leo', Kanya: 'Virgo',
  Tula: 'Libra', Vrishchika: 'Scorpio', Dhanu: 'Sagittarius', Makara: 'Capricorn', Kumbha: 'Aquarius', Meena: 'Pisces',
};
const toEn = (s?: string) => (s ? SIGN_EN[s] ?? s : s);

export interface StoneInfo { en: string; hi: string; planet_hi: string; risk: number; metal: string; finger: string; day: string; mantra: string; upratna: string; }
export const STONE: Record<string, StoneInfo> = {
  Sun:     { en: 'Ruby',            hi: 'माणिक',    planet_hi: 'सूर्य', risk: 5,  metal: 'Gold / Copper',       finger: 'Ring finger',   day: 'Sunday',    mantra: 'ॐ सूर्याय नमः',      upratna: 'Red Garnet, Sunstone' },
  Moon:    { en: 'Pearl',           hi: 'मोती',     planet_hi: 'चंद्र', risk: 0,  metal: 'Silver',              finger: 'Little finger', day: 'Monday',    mantra: 'ॐ चंद्राय नमः',      upratna: 'Moonstone, White Coral' },
  Mars:    { en: 'Red Coral',       hi: 'मूंगा',    planet_hi: 'मंगल', risk: 5,  metal: 'Gold / Copper',       finger: 'Ring finger',   day: 'Tuesday',   mantra: 'ॐ अं अंगारकाय नमः',  upratna: 'Carnelian, Red Jasper' },
  Mercury: { en: 'Emerald',         hi: 'पन्ना',    planet_hi: 'बुध',  risk: 0,  metal: 'Gold',                finger: 'Little finger', day: 'Wednesday', mantra: 'ॐ बुं बुधाय नमः',    upratna: 'Peridot, Green Onyx' },
  Jupiter: { en: 'Yellow Sapphire', hi: 'पुखराज',   planet_hi: 'गुरु', risk: 5,  metal: 'Gold',                finger: 'Index finger',  day: 'Thursday',  mantra: 'ॐ गुं गुरवे नमः',    upratna: 'Yellow Topaz, Citrine (Sunela)' },
  Venus:   { en: 'Diamond',         hi: 'हीरा',     planet_hi: 'शुक्र', risk: 5,  metal: 'Silver / Platinum',   finger: 'Middle finger', day: 'Friday',    mantra: 'ॐ शुं शुक्राय नमः',  upratna: 'White Sapphire, White Zircon, Opal' },
  Saturn:  { en: 'Blue Sapphire',   hi: 'नीलम',     planet_hi: 'शनि',  risk: 15, metal: 'Silver / Panchdhatu', finger: 'Middle finger', day: 'Saturday',  mantra: 'ॐ शं शनैश्चराय नमः', upratna: 'Amethyst (Jamunia), Blue Spinel' },
  Rahu:    { en: 'Hessonite',       hi: 'गोमेद',    planet_hi: 'राहु', risk: 20, metal: 'Silver',              finger: 'Middle finger', day: 'Saturday',  mantra: 'ॐ रां राहवे नमः',    upratna: 'Orange Garnet, Tourmaline' },
  Ketu:    { en: "Cat's Eye",       hi: 'लहसुनिया', planet_hi: 'केतु', risk: 20, metal: 'Silver',              finger: 'Ring finger',   day: 'Thursday',  mantra: 'ॐ कें केतवे नमः',    upratna: 'Chrysoberyl variants (true substitute rare)' },
};

const OWNS: Record<string, string[]> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mars: ['Aries', 'Scorpio'], Mercury: ['Gemini', 'Virgo'],
  Jupiter: ['Sagittarius', 'Pisces'], Venus: ['Taurus', 'Libra'], Saturn: ['Capricorn', 'Aquarius'],
};
const NAT_BEN = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const NAT_MAL = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
const MKS: Record<string, number> = { Sun: 12, Moon: 8, Mars: 7, Mercury: 7, Jupiter: 3, Venus: 6, Saturn: 1, Rahu: 9 };
const MA: Record<string, number[]> = { Sun: [6], Mars: [3, 6, 7], Saturn: [2, 6, 9], Rahu: [4, 6, 8], Ketu: [4, 6, 8] };

function houseOf(signEn: string, lagnaEn: string): number {
  return ((SIGNS.indexOf(signEn) - SIGNS.indexOf(lagnaEn) + 12) % 12) + 1;
}
function ownedHouses(graha: string, lagnaEn: string): number[] {
  return (OWNS[graha] || []).map((s) => houseOf(s, lagnaEn));
}
function badhakaHouse(lagnaEn: string): number {
  if (['Aries', 'Cancer', 'Libra', 'Capricorn'].includes(lagnaEn)) return 11; // movable
  if (['Taurus', 'Leo', 'Scorpio', 'Aquarius'].includes(lagnaEn)) return 9;   // fixed
  return 7;                                                                    // dual
}

type Cap = 'avoid' | 'caution' | 'trial';
interface Functional { score: number; flags: string[]; caps: Cap[]; yk: boolean; }

// Rules 1 + 2 + kendradhipati — functional nature computed from lordships
function computeFunctional(graha: string, lagnaEn: string): Functional {
  const hs = ownedHouses(graha, lagnaEn);
  const flags: string[] = []; const caps: Cap[] = []; let score = 0; let yk = false;
  const has = (h: number) => hs.includes(h);
  const trikona = hs.some((h) => [5, 9].includes(h));
  const ownsKendraNon1 = hs.some((h) => [4, 7, 10].includes(h));

  if (ownsKendraNon1 && trikona && !hs.some((h) => [6, 8, 12].includes(h))) {
    yk = true; score += 55; flags.push('yogakaraka');
  } else {
    for (const h of hs) {
      if (h === 1) score += 18;
      else if (h === 5 || h === 9) score += 18;
      else if (h === 4 || h === 10) score += 6;
      else if (h === 8) { score -= 35; caps.push('avoid'); flags.push('randhresh (8th) lord'); }
      else if (h === 12) { score -= 18; caps.push('caution'); flags.push('12th (vyaya) lord'); }
      else if (h === 6) { score -= 7; flags.push('6th (ripu) lord'); }
      else if (h === 2 || h === 7) { score -= 11; caps.push('trial'); flags.push(`maraka (${h}th) lord`); }
      else if (h === 3) score -= 6;
      else if (h === 11) score -= 4;
    }
    if (NAT_BEN.includes(graha) && ownsKendraNon1 && !trikona && !has(1)) {
      score -= 12; flags.push('kendradhipati dosha');
    }
  }
  return { score, flags, caps, yk };
}

function strengthScore(r: number | null): number {
  if (r == null) return 0;
  if (r < 0.40) return 25; if (r < 0.60) return 20; if (r < 0.80) return 12; if (r < 1.0) return 6; return 0;
}
function strengthLabel(r: number | null): string {
  if (r == null) return 'N/A (node)';
  if (r < 0.40) return 'Very weak'; if (r < 0.60) return 'Weak'; if (r < 0.80) return 'Moderate'; if (r < 1.0) return 'Near-strong'; return 'Strong';
}
function dignityScore(c?: string | null): { s: number; debil?: boolean } {
  const x = (c || '').toLowerCase();
  if (x.includes('exalt')) return { s: 20 };
  if (x.includes('own') || x.includes('mooltrikona')) return { s: 15 };
  if (x.includes('friend')) return { s: 8 };
  if (x.includes('enemy')) return { s: -8 };
  if (x.includes('debilit')) return { s: -20, debil: true };
  return { s: 0 };
}
function houseScore(h: number): number {
  if ([1, 5, 9, 10, 11].includes(h)) return 15;
  if ([2, 3, 4, 7].includes(h)) return 5;
  if ([6, 8, 12].includes(h)) return -10;
  return 0;
}
function maleficAspectCount(targetHouse: number, planets: any[]): number {
  let n = 0;
  for (const p of planets) {
    const off = MA[p.planet]; if (!off || p.house === targetHouse) continue;
    for (const o of off) { if (((p.house - 1 + o) % 12) + 1 === targetHouse) { n++; break; } }
  }
  return n;
}
function papakartari(house: number, planets: any[]): boolean {
  const prev = ((house - 2 + 12) % 12) + 1, next = (house % 12) + 1;
  const malIn = (h: number) => planets.some((p) => NAT_MAL.includes(p.planet) && p.house === h);
  return malIn(prev) && malIn(next);
}

export type VerdictKey = 'recommended' | 'trial' | 'caution' | 'neutral' | 'avoid' | 'reject';
const GOOD: Record<string, number> = { recommended: 5, trial: 4, caution: 3, neutral: 2, avoid: 1, reject: 0 };
const KEY_BY_GOOD: Record<number, VerdictKey> = { 5: 'recommended', 4: 'trial', 3: 'caution', 2: 'neutral', 1: 'avoid', 0: 'reject' };
const VLABEL: Record<VerdictKey, string> = {
  recommended: 'Recommended — Shubh', trial: 'Trial First (3 din)', caution: 'Caution — Expert Review',
  neutral: 'Neutral / Optional', avoid: 'Avoid — chart ke khilaaf', reject: 'Aapke Lagna ke liye nahi',
};
export const VERDICT_COLOR: Record<VerdictKey, { c: string; bg: string }> = {
  recommended: { c: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  trial:       { c: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  caution:     { c: '#f97316', bg: 'rgba(249,115,22,0.14)' },
  neutral:     { c: '#94a3b8', bg: 'rgba(148,163,184,0.10)' },
  avoid:       { c: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  reject:      { c: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
};
function scoreGood(score: number): number {
  if (score >= 65) return 5; if (score >= 50) return 4; if (score >= 35) return 3; return 2;
}

export interface StoneResult {
  graha: string; stone_en: string; stone_hi: string; planet_hi: string;
  gate: string; gateLabel: string; score: number;
  ratio: number | null; strengthLabel: string; classification: string | null; house: number | null;
  risk: number; riskLabel: string;
  verdictKey: VerdictKey; verdictLabel: string; flags: string[]; info: StoneInfo;
}
export interface EngineResult { lagna: string; lagnaLord: string; MD: string; AD: string; stones: StoneResult[]; }

export function runEngine(data: any): EngineResult | null {
  const lagna = toEn(data?.instant?.lagna_en) || toEn(data?.instant?.lagna);
  if (!lagna || SIGNS.indexOf(lagna) === -1) return null;
  const MD = data?.instant?.current_dasha;
  const AD = data?.instant?.current_antardasha;
  const planets: any[] = (data?.planets || []).map((p: any) => ({ ...p, signEn: toEn(p.sign) }));
  const rahu = planets.find((p) => p.planet === 'Rahu');
  const ketu = planets.find((p) => p.planet === 'Ketu');

  const stones: StoneResult[] = [];
  for (const graha of Object.keys(STONE)) {
    const p = planets.find((x) => x.planet === graha);
    if (!p) continue;
    const isNode = graha === 'Rahu' || graha === 'Ketu';
    const flags: string[] = []; const caps: Cap[] = []; let score = 0; let yk = false;
    const ratio = typeof p.shadbala?.ratio === 'number' ? p.shadbala.ratio : null;
    const classification = p.shadbala?.classification ?? null;

    if (isNode) {
      // Rule 3: node intelligence — house + dispositor's functional nature
      const h = p.house;
      if ([1, 4, 7, 10].includes(h)) { score += 18; flags.push('kendra placement'); }
      else if ([5, 9].includes(h)) { score += 18; flags.push('trikona placement'); }
      else if ([6, 8, 12].includes(h)) { score -= 12; flags.push('dushthana placement'); }
      else score += 3;
      const dl = SIGN_LORD[p.signEn]; const df = computeFunctional(dl, lagna);
      if (df.yk) { score += 30; flags.push(`dispositor ${dl} = yogakaraka`); }
      else if (df.score >= 15) { score += 12; flags.push(`dispositor ${dl} benefic`); }
      else if (df.score <= -10) { score -= 8; flags.push(`dispositor ${dl} malefic`); }
      caps.push('caution'); // nodes always expert-gated
    } else {
      const f = computeFunctional(graha, lagna);
      score += Math.min(f.score, 60); flags.push(...f.flags); caps.push(...f.caps); yk = f.yk;
      score += strengthScore(ratio);                                   // S2 (inverted)
      const dg = dignityScore(classification);                         // S3 + Rule 4
      if (!(yk && dg.s < 0)) score += dg.s;                            // YK ignores enemy-sign
      if (dg.debil) { flags.push('debilitated'); caps.push('trial'); }
      score += houseScore(p.house);                                    // S4
      if (MKS[graha] === p.house) { score -= 22; caps.push('avoid'); flags.push('Marana Karaka Sthana'); }       // Rule 5
      if (!yk && ownedHouses(graha, lagna).includes(badhakaHouse(lagna))) { score -= 6; flags.push('badhakesh'); } // Rule 6
      if (!yk && papakartari(p.house, planets)) { score -= 5; flags.push('papakartari'); }                       // Rule 7
      if (rahu && p.signEn === rahu.signEn) { score -= 10; flags.push('Rahu-conjunct'); }
      if (ketu && p.signEn === ketu.signEn) { score -= 10; flags.push('Ketu-conjunct'); }
      if (maleficAspectCount(p.house, planets) >= 2) { score -= 8; flags.push('malefic aspects'); }
    }
    if (graha === MD) { score += 8; flags.push('Mahadasha'); }         // S6
    if (graha === AD) { score += 4; flags.push('Antardasha'); }
    if (STONE[graha].risk >= 15) caps.push('caution');                 // RISK = verdict cap (not score penalty)

    score = Math.max(0, Math.min(100, Math.round(score)));
    let g = scoreGood(score);
    for (const c of caps) g = Math.min(g, GOOD[c]);
    if (g === 1) score = Math.min(score, 18); // floor display for 'avoid'
    const verdictKey = KEY_BY_GOOD[g];

    // gate (compat with pages: 'M' hides wearing-details for avoid/reject)
    let gate = 'N'; let gateLabel = 'Neutral';
    if (verdictKey === 'avoid' || verdictKey === 'reject') { gate = 'M'; gateLabel = 'Functional Malefic / Avoid'; }
    else if (isNode) { gate = 'node'; gateLabel = 'Chhaya graha (node)'; }
    else if (yk) { gate = 'YK'; gateLabel = 'Yogakaraka'; }
    else { const fn = computeFunctional(graha, lagna).score; if (fn >= 15) { gate = 'B'; gateLabel = 'Functional Benefic'; } else if (fn > 0) { gate = 'b'; gateLabel = 'Mild Benefic'; } }

    stones.push({
      graha, stone_en: STONE[graha].en, stone_hi: STONE[graha].hi, planet_hi: STONE[graha].planet_hi,
      gate, gateLabel, score, ratio, strengthLabel: strengthLabel(ratio), classification, house: p.house ?? null,
      risk: STONE[graha].risk, riskLabel: STONE[graha].risk >= 20 ? 'Very High' : STONE[graha].risk >= 15 ? 'High' : 'Low',
      verdictKey, verdictLabel: VLABEL[verdictKey], flags, info: STONE[graha],
    });
  }
  stones.sort((a, b) => b.score - a.score);
  return { lagna, lagnaLord: SIGN_LORD[lagna], MD, AD, stones };
}

/** Plain-Hinglish gemologist reasoning for one stone — used by focused pages. */
export function reasonHi(s: StoneResult, lagna: string): string {
  const f = s.flags;
  if (f.includes('randhresh (8th) lord'))
    return `${s.graha} aapke ${lagna} lagna mein 8ve ghar (randhra — aayu/achaanak sankat) ka swami hai. Ratna graha ke poore prabhav ko jagaता hai, isliye iska ratna (${s.stone_hi}) is sanvedansheel ghar ko sakriya kar sakta hai — score ${s.score}/100, verdict: Avoid.`;
  if (f.includes('Marana Karaka Sthana'))
    return `${s.graha} apne Marana-Karaka-Sthana (mrityu-bhaav) mein baitha hai — yahan iska ratna kashta ko badha sakta hai. Verdict: Avoid. Score ${s.score}/100.`;
  if (f.includes('yogakaraka'))
    return `Shubh sanyog — ${s.graha} aapke ${lagna} lagna ke liye yogakaraka hai (kendra + trikona dono ka swami). Isliye enemy-sign ya bhaav ki halki kami ke bawajood iska ratna (${s.stone_hi}) aapke liye sabse uttam hai. Score ${s.score}/100 — ${s.verdictLabel}.`;
  const bits: string[] = [`${s.graha} aapke ${lagna} lagna ke liye ${s.gateLabel.toLowerCase()} hai`];
  if (s.ratio != null) bits.push(`bal ${s.strengthLabel.toLowerCase()}`);
  if (s.classification) bits.push(`${s.classification.toLowerCase()} mein`);
  if (s.house) bits.push(`${s.house}ve bhaav mein`);
  const dl = f.find((x) => x.startsWith('dispositor'));
  if (dl) bits.push(dl);
  let txt = bits.join(', ') + '. ';
  const aff = f.filter((x) => ['Rahu-conjunct', 'Ketu-conjunct', 'malefic aspects', 'maraka', 'badhakesh', 'papakartari', '12th (vyaya) lord', '6th (ripu) lord'].some((k) => x.includes(k)));
  if (aff.length) txt += `Dhyaan: ${aff.join(', ')}. `;
  if (s.risk >= 15) txt += `Yeh strong ratna hai — verdict suraksha ke liye "Expert Review" tak seemit. `;
  txt += `Final: ${s.score}/100 — ${s.verdictLabel}.`;
  return txt;
}
