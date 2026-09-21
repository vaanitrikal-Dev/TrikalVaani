/**
 * ============================================================
 * File: lib/second-marriage-engine.ts
 * Version: v1.0 — Second Marriage (Doosra Vivah) Yog — 21 Sep 2026
 * ============================================================
 *
 * ROHIIT KI MANZOOR 100-ANK TABLE (21 Sep 2026) — har niyam granth se:
 *
 *   A  BPHS 18.19 — do-vivah ka mool yog                               24
 *        7va swami NEECH ho, ya PAAP-RAASHI mein PAAP GRAH ke saath ho,
 *        AUR 7va bhav ya 7va Navamsa NAPUNSAK grah (Budh/Shani) ka ho.
 *        Santhanam: "napunsak = Mithun, Kanya, Makar, Kumbh"
 *   B  7ve mein Chandra / Guru / Shukra                                18
 *        Bhrigu Sutram 2.44 · 5.36 · 6.40 — "do vivah ka yog"
 *        Phaladipika 10.5 — "saath baithe grahon se vivah ki sankhya"
 *   C  Rahu 7ve mein                                                  12
 *        Bhrigu Sutram 8.20 — "NIYAM SE do vivah hote hain"
 *   D  Shukra dvi-swabhav raashi mein                                  12
 *        BPHS 18.21
 *   E  Navamsa D-9 ka 7va swami kamzor                                 14
 *        BPHS 18.19 (Navamsa)
 *   F  Lagna-swami 1 / 2 / 3 / 6 mein                                  10
 *        BPHS 24.1-3, 24.6 — "do / anek patni"
 *   G  Dasha — 7va swami / Shukra / Rahu                               10
 *        parampara (granth nahi)
 *                                                                    ────
 *                                                                     100
 *
 * ROHIIT KE NIYAM:
 *   * DIVORCE nahi — DOOSRA VIVAH. Bharat mein doosra vivah talaak ke
 *     baad hi hota hai, isliye ye calculator doosre vivah ka yog dekhta hai.
 *   * Sirf "doosra vivah". BPHS 18.20-21 ka "3 patni / anek patni" NAHI —
 *     Santhanam khud: "aaj ke samaj mein vyavaharik nahi".
 *   * Jawab HAAN / YES (granth ka faisla VM se aata hai — ye engine sirf ank).
 *
 * ⚠️ Ye engine sirf SCORE deta hai. Saar, faisla, KAB aur upay VM ke
 * /granth/product ('second-marriage') se aate hain — wahan 8 chhupi lines
 * (vaidhavya ke baad punarvivah) sirf isi calculator par khulti hain.
 * ============================================================
 */

import {
  CalcData, CalcPlanet, ScoreSheet, YogResult,
  planet, houseLord, houseOf, conjunct, d9, d9HouseLord, dashaPair,
  PLANET_HI, ord,
} from './yog-engine';

export type SecondMarriageResult = YogResult;

// BPHS 18.19 — napunsak grah: Budh aur Shani
const NAPUNSAK = ['Mercury', 'Saturn'];
// paap grah
const PAAP = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
// paap-raashi — Mangal, Shani, Surya ki raashi
const PAAP_RAASHI = ['Mesha', 'Vrishchika', 'Makara', 'Kumbha', 'Simha'];
// BPHS 18.21 — dvi-swabhav raashi
const DVI = ['Mithuna', 'Kanya', 'Dhanu', 'Meena'];
// neech raashi
const NEECH: Record<string, string> = {
  Sun: 'Tula', Moon: 'Vrishchika', Mars: 'Karka', Mercury: 'Meena',
  Jupiter: 'Makara', Venus: 'Kanya', Saturn: 'Mesha',
};

const hi = (g: string | null | undefined) => (g ? PLANET_HI[g] ?? g : '—');

function isNeech(p: CalcPlanet | null): boolean {
  if (!p) return false;
  const d = (p.shadbala?.classification || p.dignity || '').toLowerCase();
  if (d.includes('debilit')) return true;
  return !!(p.planet && p.sign && NEECH[p.planet] === p.sign);
}

export function scoreSecondMarriage(data: CalcData): SecondMarriageResult {
  const s = new ScoreSheet();

  const l7 = houseLord(data, 7);
  const p7 = planet(data, l7);
  const l7d9 = data.navamsa ? d9HouseLord(data, 7) : null;

  // ── A — BPHS 18.19: do-vivah ka mool yog (24) ─────────────────────────
  const neech7 = isNeech(p7);
  const paapSaath = !!(p7 && p7.sign && PAAP_RAASHI.includes(p7.sign) &&
    PAAP.some((m) => m !== l7 && conjunct(data, l7, m)));
  const swamiShart = neech7 || paapSaath;
  const napD1 = !!(l7 && NAPUNSAK.includes(l7));
  const napD9 = !!(l7d9 && NAPUNSAK.includes(l7d9));
  const napunsak = napD1 || napD9;
  const a = swamiShart && napunsak ? 24 : swamiShart ? 12 : napunsak ? 8 : 0;
  s.add('BPHS 18.19 — mool yog', '7va swami + napunsak 7va', a, 24,
    a === 24
      ? `7va swami ${hi(l7)} ${neech7 ? 'neech' : 'paap-raashi mein paap grah ke saath'} hai, aur 7va ${napD9 ? 'Navamsa' : 'bhav'} napunsak grah ka hai — BPHS 18.19 ka poora yog.`
      : a === 12
        ? `7va swami ${hi(l7)} ${neech7 ? 'neech' : 'paap-raashi mein paap grah ke saath'} hai — BPHS 18.19 ka aadha yog (napunsak 7va nahi).`
        : a === 8
          ? `7va ${napD9 ? 'Navamsa' : 'bhav'} napunsak grah (${hi(napD9 ? l7d9 : l7)}) ka hai — BPHS 18.19 ka aadha yog.`
          : 'BPHS 18.19 ka mool yog nahi banta.');

  // ── B — 7ve mein Chandra / Guru / Shukra (18) ─────────────────────────
  const saat = ['Moon', 'Jupiter', 'Venus'].filter((g) => houseOf(data, g) === 7);
  s.add('7ve mein grah', 'Chandra / Guru / Shukra', Math.min(18, saat.length * 6), 18,
    saat.length
      ? `7ve ghar mein ${saat.map(hi).join(', ')} — Bhrigu Sutram (2.44 / 5.36 / 6.40) "do vivah ka yog"; Phaladipika 10.5 ke anusar saath baithe grahon se sankhya.`
      : '7ve ghar mein Chandra, Guru ya Shukra nahi.');

  // ── C — Rahu 7ve mein (12) ────────────────────────────────────────────
  const rahu7 = houseOf(data, 'Rahu') === 7;
  s.add('Rahu', 'Rahu 7ve mein', rahu7 ? 12 : 0, 12,
    rahu7 ? 'Rahu 7ve ghar mein — Bhrigu Sutram 8.20: "niyam se do vivah hote hain".'
      : 'Rahu 7ve ghar mein nahi.');

  // ── D — Shukra dvi-swabhav raashi mein (12) ───────────────────────────
  const ven = planet(data, 'Venus');
  const venDvi = !!(ven?.sign && DVI.includes(ven.sign));
  s.add('Shukra', 'Shukra dvi-swabhav raashi', venDvi ? 12 : 0, 12,
    venDvi ? `Shukra ${ven?.sign} (dvi-swabhav raashi) mein — BPHS 18.21.`
      : 'Shukra dvi-swabhav raashi mein nahi.');

  // ── E — Navamsa D-9 ka 7va swami kamzor (14) ──────────────────────────
  if (l7d9) {
    const g9 = d9(data, l7d9);
    const neech9 = !!(g9 && NEECH[l7d9] === g9.sign);
    const dus9 = !!(g9 && [6, 8, 12].includes(g9.house));
    const e = neech9 ? 14 : dus9 ? 10 : 0;
    s.add('Navamsa D-9', 'D-9 ka 7va swami', e, 14,
      neech9 ? `Navamsa mein 7va swami ${hi(l7d9)} neech hai — vivah ka D-9 kamzor (BPHS 18.19).`
        : dus9 ? `Navamsa mein 7va swami ${hi(l7d9)} ${ord(g9!.house)} ghar (dusthana) mein — vivah ka D-9 kamzor.`
          : `Navamsa mein 7va swami ${hi(l7d9)} theek sthiti mein.`);
  } else {
    s.add('Navamsa D-9', 'D-9 ka 7va swami', 0, 14, 'Navamsa ka data nahi mila.');
  }

  // ── F — Lagna-swami 1 / 2 / 3 / 6 mein (10) ───────────────────────────
  const l1 = houseLord(data, 1);
  const h1 = houseOf(data, l1);
  const lagnaSthan = !!(h1 && [1, 2, 3, 6].includes(h1));
  s.add('Lagna-swami', 'Lagna-swami 1/2/3/6 mein', lagnaSthan ? 10 : 0, 10,
    lagnaSthan ? `Lagna-swami ${hi(l1)} ${ord(h1!)} ghar mein — BPHS 24.${h1 === 6 ? '6' : h1} "do / anek vivah".`
      : `Lagna-swami ${hi(l1)} ${h1 ? ord(h1) + ' ghar' : ''} mein — BPHS 24 ka ye yog nahi.`);

  // ── G — Dasha (10) — parampara ────────────────────────────────────────
  const { maha, antar } = dashaPair(data);
  const keys = [l7, 'Venus', 'Rahu'].filter(Boolean) as string[];
  const g = maha && keys.includes(maha) ? 10 : antar && keys.includes(antar) ? 6 : 0;
  s.add('Dasha', '7va swami / Shukra / Rahu ki dasha', g, 10,
    g === 10 ? `Abhi ${hi(maha)} ki mahadasha — vivah ke grah ka samay (parampara).`
      : g === 6 ? `Abhi ${hi(antar)} ki antardasha — vivah ke grah ka samay (parampara).`
        : 'Abhi vivah ke grahon ki dasha nahi (parampara).');

  // ⭐ 21 Sep — APNI SEEMA (Rohiit ne manzoor ki). Saajha ScoreSheet ki seema
  // (60/48/36) doosre calculators ke liye hai jinke ank UPAR jaate hain.
  // Doosre vivah ka yog DURLABH hai — asli kundaliyon par 12, 26, 28 aaye;
  // us seema par HAR grahak "Weak" dikhta. Granth ke hisaab se "prabal" =
  // BPHS 18.19 ka poora yog (24) + Rahu 7ve mein (12) = 36.
  const base = s.finish();
  const sc = base.score;
  const [band, bandHi]: [YogResult['band'], string] =
    sc >= 36 ? ['Strong', 'प्रबल']
    : sc >= 24 ? ['Moderate', 'मध्यम']
    : sc >= 12 ? ['Weak', 'हल्का']
    : ['Weak', 'कमज़ोर'];
  return { ...base, band, bandHi };
}
