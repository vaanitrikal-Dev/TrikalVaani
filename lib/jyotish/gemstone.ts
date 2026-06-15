// ============================================================
// File: lib/jyotish/gemstone.ts
// Version: v1.1 — Shared Gemstone Suitability Engine (the brain)
// Consolidates spec §3 (functional gate) + §6 (9-step scoring).
// Used by: free-gemstone-suitability-calculator, free-should-i-wear-neelam,
//          free-should-i-wear-cats-eye (and future stone pages).
// v1.1: engine extracted to lib + S9 user-experience hook baked in.
// Iron rule: fix here once = fixed everywhere.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const SIGN_LORD: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
  Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

export interface StoneInfo { en: string; hi: string; planet_hi: string; risk: number; metal: string; finger: string; day: string; mantra: string; }
export const STONE: Record<string, StoneInfo> = {
  Sun:     { en: 'Ruby',            hi: 'माणिक',    planet_hi: 'सूर्य', risk: 5,  metal: 'Gold / Copper',       finger: 'Ring finger',   day: 'Sunday',    mantra: 'ॐ सूर्याय नमः' },
  Moon:    { en: 'Pearl',           hi: 'मोती',     planet_hi: 'चंद्र', risk: 0,  metal: 'Silver',              finger: 'Little finger', day: 'Monday',    mantra: 'ॐ चंद्राय नमः' },
  Mars:    { en: 'Red Coral',       hi: 'मूंगा',    planet_hi: 'मंगल', risk: 5,  metal: 'Gold / Copper',       finger: 'Ring finger',   day: 'Tuesday',   mantra: 'ॐ अं अंगारकाय नमः' },
  Mercury: { en: 'Emerald',         hi: 'पन्ना',    planet_hi: 'बुध',  risk: 0,  metal: 'Gold',                finger: 'Little finger', day: 'Wednesday', mantra: 'ॐ बुं बुधाय नमः' },
  Jupiter: { en: 'Yellow Sapphire', hi: 'पुखराज',   planet_hi: 'गुरु', risk: 5,  metal: 'Gold',                finger: 'Index finger',  day: 'Thursday',  mantra: 'ॐ गुं गुरवे नमः' },
  Venus:   { en: 'Diamond',         hi: 'हीरा',     planet_hi: 'शुक्र', risk: 5,  metal: 'Silver / Platinum',   finger: 'Middle finger', day: 'Friday',    mantra: 'ॐ शुं शुक्राय नमः' },
  Saturn:  { en: 'Blue Sapphire',   hi: 'नीलम',     planet_hi: 'शनि',  risk: 15, metal: 'Silver / Panchdhatu', finger: 'Middle finger', day: 'Saturday',  mantra: 'ॐ शं शनैश्चराय नमः' },
  Rahu:    { en: 'Hessonite',       hi: 'गोमेद',    planet_hi: 'राहु', risk: 20, metal: 'Silver',              finger: 'Middle finger', day: 'Saturday',  mantra: 'ॐ रां राहवे नमः' },
  Ketu:    { en: "Cat's Eye",       hi: 'लहसुनिया', planet_hi: 'केतु', risk: 20, metal: 'Silver',              finger: 'Ring finger',   day: 'Thursday',  mantra: 'ॐ कें केतवे नमः' },
};

// §3 Functional gate — YK (yogakaraka) / B (benefic) / b (mild) / N (neutral) / M (malefic, reject)
export const F: Record<string, Record<string, string>> = {
  Aries:      { Sun: 'B', Moon: 'b', Mars: 'B',  Mercury: 'M', Jupiter: 'B', Venus: 'N',  Saturn: 'N' },
  Taurus:     { Sun: 'b', Moon: 'M', Mars: 'M',  Mercury: 'b', Jupiter: 'M', Venus: 'B',  Saturn: 'YK' },
  Gemini:     { Sun: 'M', Moon: 'N', Mars: 'M',  Mercury: 'B', Jupiter: 'M', Venus: 'b',  Saturn: 'b' },
  Cancer:     { Sun: 'N', Moon: 'B', Mars: 'YK', Mercury: 'M', Jupiter: 'b', Venus: 'M',  Saturn: 'M' },
  Leo:        { Sun: 'B', Moon: 'N', Mars: 'YK', Mercury: 'N', Jupiter: 'b', Venus: 'M',  Saturn: 'M' },
  Virgo:      { Sun: 'M', Moon: 'M', Mars: 'M',  Mercury: 'B', Jupiter: 'M', Venus: 'b',  Saturn: 'N' },
  Libra:      { Sun: 'M', Moon: 'b', Mars: 'M',  Mercury: 'b', Jupiter: 'M', Venus: 'B',  Saturn: 'YK' },
  Scorpio:    { Sun: 'B', Moon: 'B', Mars: 'b',  Mercury: 'M', Jupiter: 'b', Venus: 'M',  Saturn: 'N' },
  Sagittarius:{ Sun: 'B', Moon: 'M', Mars: 'b',  Mercury: 'M', Jupiter: 'B', Venus: 'M',  Saturn: 'N' },
  Capricorn:  { Sun: 'M', Moon: 'N', Mars: 'N',  Mercury: 'b', Jupiter: 'M', Venus: 'YK', Saturn: 'B' },
  Aquarius:   { Sun: 'M', Moon: 'M', Mars: 'N',  Mercury: 'b', Jupiter: 'N', Venus: 'YK', Saturn: 'B' },
  Pisces:     { Sun: 'M', Moon: 'B', Mars: 'b',  Mercury: 'M', Jupiter: 'B', Venus: 'M',  Saturn: 'M' },
};
const FSCORE: Record<string, number> = { YK: 35, B: 25, b: 15, N: 0 };
export const GATE_LABEL: Record<string, string> = { YK: 'Yogakaraka', B: 'Functional Benefic', b: 'Mild Benefic', N: 'Neutral', M: 'Functional Malefic' };

// S9 user-experience
export type ExpKey = 'excellent' | 'some' | 'no' | 'negative';
const EXP_SCORE: Record<ExpKey, number> = { excellent: 15, some: 8, no: 0, negative: -15 };

function strengthScore(ratio: number | null): number {
  if (ratio == null) return 0;
  if (ratio < 0.40) return 25;
  if (ratio < 0.60) return 20;
  if (ratio < 0.80) return 12;
  if (ratio < 1.00) return 6;
  return 0;
}
function strengthLabel(ratio: number | null): string {
  if (ratio == null) return 'N/A (node)';
  if (ratio < 0.40) return 'Very weak';
  if (ratio < 0.60) return 'Weak';
  if (ratio < 0.80) return 'Moderate';
  if (ratio < 1.00) return 'Near-strong';
  return 'Strong';
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
const MAL_ASPECTS: Record<string, number[]> = { Sun: [6], Mars: [3, 6, 7], Saturn: [2, 6, 9], Rahu: [4, 6, 8], Ketu: [4, 6, 8] };
function maleficAspectCount(targetHouse: number, planets: any[]): number {
  let n = 0;
  for (const p of planets) {
    const off = MAL_ASPECTS[p.planet];
    if (!off || p.house === targetHouse) continue;
    for (const o of off) { if (((p.house - 1 + o) % 12) + 1 === targetHouse) { n++; break; } }
  }
  return n;
}

export type VerdictKey = 'recommended' | 'trial' | 'caution' | 'expert' | 'not' | 'reject';
function verdict(score: number, gate: string, risk: number, debil?: boolean): { key: VerdictKey; label: string } {
  if (gate === 'M') return { key: 'reject', label: 'Aapke Lagna ke liye nahi' };
  let key: VerdictKey;
  if (score >= 70) key = 'recommended';
  else if (score >= 55) key = 'trial';
  else if (score >= 40) key = 'caution';
  else key = 'not';
  const goodness: Record<VerdictKey, number> = { recommended: 3, trial: 2, caution: 1, expert: 1, not: 0, reject: 0 };
  if (risk >= 15 && goodness[key] > 1) key = 'expert';
  if (debil && goodness[key] > 2) key = 'trial';
  if (gate === 'N' && goodness[key] > 2) key = 'trial';
  const label: Record<VerdictKey, string> = {
    recommended: 'Recommended — Shubh', trial: 'Trial First (3 din)',
    caution: 'Caution — Expert Review', expert: 'Expert Review Zaroori',
    not: 'Not Recommended', reject: 'Aapke Lagna ke liye nahi',
  };
  return { key, label: label[key] };
}

export interface StoneResult {
  graha: string; stone_en: string; stone_hi: string; planet_hi: string;
  gate: string; gateLabel: string; score: number;
  ratio: number | null; strengthLabel: string; classification: string | null; house: number | null;
  risk: number; riskLabel: string;
  verdictKey: VerdictKey; verdictLabel: string; flags: string[]; info: StoneInfo;
}
export interface EngineResult { lagna: string; lagnaLord: string; MD: string; AD: string; stones: StoneResult[]; }

export const VERDICT_COLOR: Record<VerdictKey, { c: string; bg: string }> = {
  recommended: { c: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  trial:       { c: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  caution:     { c: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  expert:      { c: '#f97316', bg: 'rgba(249,115,22,0.14)' },
  not:         { c: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
  reject:      { c: '#94a3b8', bg: 'rgba(148,163,184,0.10)' },
};

/**
 * Runs the suitability engine on the /api/calc/kundali response.
 * @param experience optional S9 map { [graha]: ExpKey } from the "worn before?" selector.
 */
export function runEngine(data: any, experience: Record<string, ExpKey> = {}): EngineResult | null {
  const lagna = data?.instant?.lagna_en;
  if (!lagna || SIGNS.indexOf(lagna) === -1) return null;
  const li = SIGNS.indexOf(lagna);
  const lord9 = SIGN_LORD[SIGNS[(li + 8) % 12]];
  const lord10 = SIGN_LORD[SIGNS[(li + 9) % 12]];
  const MD = data?.instant?.current_dasha;
  const AD = data?.instant?.current_antardasha;
  const planets: any[] = data?.planets || [];
  const rahu = planets.find((p) => p.planet === 'Rahu');
  const ketu = planets.find((p) => p.planet === 'Ketu');

  const stones: StoneResult[] = [];
  for (const graha of Object.keys(STONE)) {
    const p = planets.find((x) => x.planet === graha);
    if (!p) continue;
    const isNode = graha === 'Rahu' || graha === 'Ketu';
    const gate = isNode ? 'N' : F[lagna][graha];
    const flags: string[] = [];
    let score = 0;
    score += isNode ? 0 : (FSCORE[gate] ?? 0);                          // S1
    const ratio = typeof p.shadbala?.ratio === 'number' ? p.shadbala.ratio : null;
    score += strengthScore(ratio);                                      // S2
    const dg = dignityScore(p.shadbala?.classification);                // S3
    score += dg.s; if (dg.debil) flags.push('debilitated');
    score += houseScore(p.house);                                       // S4
    if (!isNode) {                                                      // S5
      if (rahu && p.sign === rahu.sign) { score -= 10; flags.push('Rahu-conjunct'); }
      if (ketu && p.sign === ketu.sign) { score -= 10; flags.push('Ketu-conjunct'); }
    }
    if (maleficAspectCount(p.house, planets) >= 2) { score -= 10; flags.push('malefic aspects'); }
    if (graha === MD) { score += 10; flags.push('Mahadasha'); }         // S6
    if (graha === AD) { score += 5; flags.push('Antardasha'); }
    if (graha === lord9 || graha === lord10) { score += 10; flags.push('Dharma-Karma lord'); } // S7
    score -= STONE[graha].risk;                                         // S8
    const exp = experience[graha];                                     // S9
    if (exp) { score += EXP_SCORE[exp]; if (exp !== 'no') flags.push(`anubhav: ${exp}`); }
    if (gate === 'M') score = Math.min(score, 25);
    score = Math.max(0, Math.min(100, Math.round(score)));
    const v = verdict(score, gate, STONE[graha].risk, dg.debil);
    stones.push({
      graha, stone_en: STONE[graha].en, stone_hi: STONE[graha].hi, planet_hi: STONE[graha].planet_hi,
      gate, gateLabel: isNode ? 'Chhaya graha (node)' : GATE_LABEL[gate], score,
      ratio, strengthLabel: strengthLabel(ratio), classification: p.shadbala?.classification ?? null, house: p.house ?? null,
      risk: STONE[graha].risk, riskLabel: STONE[graha].risk >= 20 ? 'Very High' : STONE[graha].risk >= 15 ? 'High' : 'Low',
      verdictKey: v.key, verdictLabel: v.label, flags, info: STONE[graha],
    });
  }
  stones.sort((a, b) => b.score - a.score);
  return { lagna, lagnaLord: SIGN_LORD[lagna], MD, AD, stones };
}

/** Plain-language Hinglish reason for a single stone's verdict — reused by the focused pages. */
export function reasonHi(s: StoneResult, lagna: string): string {
  if (s.gate === 'M') return `${s.stone_hi} (${s.stone_en}) ${s.graha} ka ratna hai, aur ${s.graha} aapke ${lagna} lagna ke liye functional malefic hai — isliye yeh ratna aapke liye recommend nahi kiya jaata, chahe ${s.graha} kitna hi balwan ya Mahadasha mein kyun na ho.`;
  const bits: string[] = [];
  bits.push(`${s.graha} aapke ${lagna} lagna ke liye ${s.gateLabel.toLowerCase()} hai`);
  if (s.ratio != null) bits.push(`uska bal ${s.strengthLabel.toLowerCase()} hai`);
  if (s.classification) bits.push(`${s.classification.toLowerCase()} mein hai`);
  if (s.house) bits.push(`${s.house}ve bhaav mein`);
  const aff = s.flags.filter((f) => ['debilitated', 'Rahu-conjunct', 'Ketu-conjunct', 'malefic aspects'].includes(f));
  let txt = bits.join(', ') + '. ';
  if (aff.length) txt += `Saath hi ${aff.join(', ')} jaisi afflictions hain. `;
  if (s.risk >= 15) txt += `Yeh ek strong ratna hai — isliye verdict suraksha ke liye "Expert Review" tak seemit hai. `;
  txt += `Final suitability: ${s.score}/100 — ${s.verdictLabel}.`;
  return txt;
}
