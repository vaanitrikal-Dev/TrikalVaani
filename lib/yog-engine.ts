/**
 * ============================================================
 * TRIKAL VAANI — Yog Scoring Foundation
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/yog-engine.ts
 * VERSION: 1.3
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Shared by all three yog calculators:
 *   lib/upsc-engine.ts               -> IAS / UPSC / Sarkari Naukri
 *   lib/foreign-settlement-engine.ts -> Videsh Yog
 *   lib/foreign-spouse-engine.ts     -> NRI / Foreign Spouse
 *
 * THE ONE DESIGN RULE
 * -------------------
 * A rule may never award points without also stating WHY, with the real
 * number it used. `addRule()` takes both in one call, and the score is the
 * sum of the rules — it is never written separately. That makes it
 * structurally impossible for the score and the explanation to disagree.
 *
 * Every other astrology site returns a number. This returns the reasoning.
 *
 * HONESTY RULE
 * ------------
 * This is a YOG STRENGTH SCORE, not a probability. It measures how many
 * classical combinations for the given outcome are present in the chart and
 * how strong they are. It does not and cannot predict whether someone will
 * clear an exam or move abroad. Wording throughout stays on that side of the
 * line, and `DISCLAIMER` below is rendered on every result.
 * ============================================================
 */

// ── Types coming back from /api/calc/kundali (v1.9) ──────────────────────────

export interface CalcPlanet {
  planet: string;
  sign: string | null;
  sign_en: string | null;
  house: number;
  nakshatra: string | null;
  is_retrograde: boolean;
  dignity: string | null;
  strength: number | null;          // 0-100, mapped from the Shadbala ratio
  shadbala: {
    total?: number;
    minimum?: number;
    ratio?: number;
    classification?: string;
    isStrong?: boolean;
  } | null;
  longitude: number | null;
  degree_in_sign: number | null;
}

export interface CalcHouse {
  house: number;
  sign: string | null;
}

export interface DrishtiRow {
  from: string;
  to?: string;
  house?: number;
  angle: number;
  virupas: number;
  strength_pct: number;
  house_distance?: number;
  aspect?: string;
  is_full: boolean;
  is_node: boolean;
}

export interface DasamsaGraha {
  planet: string;
  sign: string;
  sign_en: string;
  sign_lord: string;
  house: number;
}

export interface NavamsaGraha extends DasamsaGraha {
  /** Same sign in D-1 and D-9 — a classical mark of strength. */
  vargottama: boolean;
}

export interface CalcData {
  instant: {
    lagna: string | null;
    lagna_en: string | null;
    lagna_lord: string | null;
    current_dasha: string | null;
    current_antardasha: string | null;
    [k: string]: unknown;
  };
  planets: CalcPlanet[];
  houses: CalcHouse[];
  dasha: { mahadasha: string | null; antardasha: string | null };
  drishti: { on_planets: DrishtiRow[]; on_houses: DrishtiRow[] } | null;
  dasamsa: {
    lagna: { sign: string; sign_en: string; sign_lord: string };
    grahas: DasamsaGraha[];
  } | null;
  navamsa: {
    lagna: { sign: string; sign_en: string; sign_lord: string };
    grahas: NavamsaGraha[];
  } | null;
}

// ── Scoring primitives ───────────────────────────────────────────────────────

export interface ScoredRule {
  block: string;
  label: string;
  points: number;
  max: number;
  /** Plain-language reason with the actual figure the rule used. */
  reason: string;
  /** True when the rule found nothing — still shown, so absence is explained. */
  absent: boolean;
}

export interface YogResult {
  score: number;
  band: 'Very Strong' | 'Strong' | 'Moderate' | 'Weak';
  bandHi: string;
  rules: ScoredRule[];
  /** The strongest positive findings, for the free tier. */
  highlights: ScoredRule[];
  /** What is holding the chart back — the paid hook. */
  blockers: ScoredRule[];
  disclaimer: string;
}

export const DISCLAIMER =
  'Ye score aapke chart mein maujood classical yogas ki strength batata hai — ' +
  'kisi natije ki guarantee nahi. Mehnat aur taiyari ki jagah koi yog nahi le sakta.';

/**
 * Band thresholds, calibrated 29 Aug 2026 against 4,000 simulated charts run
 * through all three engines — not chosen by feel.
 *
 * The first thresholds (75 / 55 / 35) were wrong, and measurably so: across
 * 4,000 charts NOT ONE reached 75, the highest score seen was 69, and 93% of
 * charts landed in Moderate or Weak. "Very Strong" was unreachable.
 *
 * The cause is structural rather than a bug. Roughly 25 of the 100 points sit
 * behind combinations that are genuinely rare — the Mahapurusha yogas, the
 * Amatyakaraka falling in the 6th, a divisional-chart confirmation. Most
 * charts will never hold them, which is exactly what makes them worth points.
 * So the scoring is left alone and the BANDS are set to what the scoring
 * actually produces.
 *
 * Measured percentiles (4,000 charts):
 *   IAS / UPSC        p25 37   median 42   p75 48   p90 55   p97 58
 *   Videsh Settlement p25 37   median 45   p75 52   p90 59   p97 66
 *   Foreign Spouse    p25 36   median 44   p75 51   p90 58   p97 64
 *
 * The three sit close enough that one shared set is honest for all of them.
 * A score of 42 is an ORDINARY chart and should read as Moderate, not as a
 * failure — telling most people their chart is Weak would be both
 * discouraging and untrue.
 */
export const VERY_STRONG = 60;   // top ~3-9%
export const STRONG = 48;        // top ~25%
export const MODERATE = 36;      // ~55% band; below this is the bottom ~22%

export class ScoreSheet {
  private rules: ScoredRule[] = [];

  add(block: string, label: string, points: number, max: number, reason: string) {
    this.rules.push({
      block,
      label,
      points: Math.round(points * 100) / 100,
      max,
      reason,
      absent: points <= 0,
    });
  }

  get total(): number {
    return Math.round(this.rules.reduce((s, r) => s + r.points, 0));
  }

  finish(): YogResult {
    const score = Math.max(0, Math.min(100, this.total));
    const band: YogResult['band'] =
      score >= VERY_STRONG ? 'Very Strong'
      : score >= STRONG ? 'Strong'
      : score >= MODERATE ? 'Moderate'
      : 'Weak';
    const bandHi =
      score >= VERY_STRONG ? 'बहुत प्रबल'
      : score >= STRONG ? 'प्रबल'
      : score >= MODERATE ? 'मध्यम'
      : 'कमज़ोर';

    const scored = this.rules.filter((r) => !r.absent);
    const highlights = [...scored].sort((a, b) => b.points / b.max - a.points / a.max).slice(0, 3);
    const blockers = this.rules
      .filter((r) => r.max >= 5 && r.points / r.max < 0.35)
      .sort((a, b) => a.points / a.max - b.points / b.max)
      .slice(0, 3);

    return { score, band, bandHi, rules: this.rules, highlights, blockers, disclaimer: DISCLAIMER };
  }
}

// ── Chart helpers ────────────────────────────────────────────────────────────

const SIGN_ORDER = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

const SIGN_LORD: Record<string, string> = {
  Mesha: 'Mars', Vrishabha: 'Venus', Mithuna: 'Mercury', Karka: 'Moon',
  Simha: 'Sun', Kanya: 'Mercury', Tula: 'Venus', Vrishchika: 'Mars',
  Dhanu: 'Jupiter', Makara: 'Saturn', Kumbha: 'Saturn', Meena: 'Jupiter',
};

export const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

/** 1st, 2nd, 3rd, 4th... A chart full of "3th house" reads as careless. */
export function ord(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '?';
  const v = Number(n);
  const s = ['th', 'st', 'nd', 'rd'];
  const k = v % 100;
  return `${v}${s[(k - 20) % 10] || s[k] || s[0]}`;
}

export const KENDRA = [1, 4, 7, 10];
export const TRIKONA = [1, 5, 9];
export const DUSTHANA = [6, 8, 12];
export const UPACHAYA = [3, 6, 10, 11];

/** The ruling planet of a given house, read from the house's sign. */
export function houseLord(data: CalcData, house: number): string | null {
  const h = data.houses.find((x) => x.house === house);
  if (!h?.sign) return null;
  return SIGN_LORD[h.sign] ?? null;
}

export function planet(data: CalcData, name: string | null): CalcPlanet | null {
  if (!name) return null;
  return data.planets.find((p) => p.planet === name) ?? null;
}

/** Which house a given planet occupies. */
export function houseOf(data: CalcData, name: string | null): number | null {
  return planet(data, name)?.house ?? null;
}

/**
 * Shadbala ratio, where 1.00 is the BPHS threshold for a planet being strong.
 * Rahu and Ketu have no Shadbala; they return null and callers must handle it.
 */
export function ratio(p: CalcPlanet | null): number | null {
  const r = p?.shadbala?.ratio;
  return typeof r === 'number' ? r : null;
}

/** 0..1 score from a Shadbala ratio, anchored on the classical bands. */
export function ratioScore(r: number | null): number {
  if (r === null) return 0.4;                 // unknown: neither rewarded nor punished
  if (r <= 0.5) return 0;
  if (r >= 1.5) return 1;
  return (r - 0.5) / 1.0;
}

export function ratioWord(r: number | null): string {
  if (r === null) return 'unknown';
  if (r >= 1.5) return 'bahut mazboot';
  if (r >= 1.0) return 'mazboot';
  if (r >= 0.7) return 'thoda kamzor';
  return 'kamzor';
}

/** 0..1 from the dignity string the VM returns. */
export function dignityScore(p: CalcPlanet | null): number {
  const d = (p?.shadbala?.classification || p?.dignity || '').toLowerCase();
  if (d.includes('exact exalt')) return 1;
  if (d.includes('exalt')) return 0.95;
  if (d.includes('moolatrikona')) return 0.9;
  if (d.includes('own')) return 0.8;
  if (d.includes('friend')) return 0.55;
  if (d.includes('neutral')) return 0.4;
  if (d.includes('enemy')) return 0.2;
  if (d.includes('debilit')) return 0;
  return 0.4;
}

export function dignityWord(p: CalcPlanet | null): string {
  return p?.shadbala?.classification || p?.dignity || 'Neutral Sign';
}

// ── Drishti helpers ──────────────────────────────────────────────────────────

/** Strongest aspect (in virupas) cast on a house, optionally by named planets. */
export function drishtiOnHouse(
  data: CalcData,
  house: number,
  fromPlanets?: string[],
): DrishtiRow | null {
  const rows = (data.drishti?.on_houses ?? []).filter(
    (r) => r.house === house && (!fromPlanets || fromPlanets.includes(r.from)),
  );
  if (!rows.length) return null;
  return rows.reduce((a, b) => (b.virupas > a.virupas ? b : a));
}

/** All aspects on a house above a virupa floor, strongest first. */
export function allDrishtiOnHouse(data: CalcData, house: number, min = 15): DrishtiRow[] {
  return (data.drishti?.on_houses ?? [])
    .filter((r) => r.house === house && r.virupas >= min)
    .sort((a, b) => b.virupas - a.virupas);
}

export function drishtiOnPlanet(
  data: CalcData,
  target: string,
  fromPlanets?: string[],
): DrishtiRow[] {
  return (data.drishti?.on_planets ?? [])
    .filter((r) => r.to === target && (!fromPlanets || fromPlanets.includes(r.from)))
    .sort((a, b) => b.virupas - a.virupas);
}

/** Net benefic-minus-malefic pressure on a house, in virupas. */
export function netDrishtiOnHouse(
  data: CalcData,
  house: number,
  /**
   * Planets to leave out. Needed because a planet can be classically GOOD for
   * one house in one context and still be a natural malefic — Saturn aspecting
   * the 10th supports a government career, so crediting it in one rule and
   * then counting it as pressure in the next both double-counts it and
   * contradicts the first rule.
   */
  exclude: (string | null | undefined)[] = [],
): number {
  const BEN = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const MAL = ['Sun', 'Mars', 'Saturn'];
  const skip = new Set(exclude.filter(Boolean) as string[]);
  let net = 0;
  for (const r of data.drishti?.on_houses ?? []) {
    if (r.house !== house || r.is_node || skip.has(r.from)) continue;
    if (BEN.includes(r.from)) net += r.virupas;
    else if (MAL.includes(r.from)) net -= r.virupas;
  }
  return Math.round(net * 100) / 100;
}

/** Human phrasing for an aspect's strength — the differentiator in one line. */
export function drishtiWord(virupas: number): string {
  // Bands sit at the MIDPOINT between the classical quarters, so the word
  // always agrees with the percentage shown beside it. The old thresholds
  // called 57.64 virupas "teen-chauthai" while printing "96% taakat".
  if (virupas >= 52.5) return 'poori drishti';       // ~88%+
  if (virupas >= 37.5) return 'teen-chauthai drishti';
  if (virupas >= 22.5) return 'aadhi drishti';
  if (virupas >= 8) return 'chauthai drishti';
  return 'halki drishti';
}

// ── Dasamsa (D-10) helpers ───────────────────────────────────────────────────

export function d10(data: CalcData, name: string | null): DasamsaGraha | null {
  if (!name || !data.dasamsa) return null;
  return data.dasamsa.grahas.find((g) => g.planet === name) ?? null;
}

/** The lord of a house in the D-10 chart. */
export function d10HouseLord(data: CalcData, house: number): string | null {
  if (!data.dasamsa) return null;
  const lagnaIdx = SIGN_ORDER.indexOf(data.dasamsa.lagna.sign);
  if (lagnaIdx < 0) return null;
  const sign = SIGN_ORDER[(lagnaIdx + house - 1) % 12];
  return SIGN_LORD[sign] ?? null;
}

// ── Navamsa (D-9) helpers ────────────────────────────────────────────────────
// Marriage is judged in the Navamsa the way career is judged in the Dasamsa.

export function d9(data: CalcData, name: string | null): NavamsaGraha | null {
  if (!name || !data.navamsa) return null;
  return data.navamsa.grahas.find((g) => g.planet === name) ?? null;
}

/** The lord of a house in the D-9 chart. */
export function d9HouseLord(data: CalcData, house: number): string | null {
  if (!data.navamsa) return null;
  const lagnaIdx = SIGN_ORDER.indexOf(data.navamsa.lagna.sign);
  if (lagnaIdx < 0) return null;
  const sign = SIGN_ORDER[(lagnaIdx + house - 1) % 12];
  return SIGN_LORD[sign] ?? null;
}

export function isVargottama(data: CalcData, name: string | null): boolean {
  return d9(data, name)?.vargottama === true;
}

// ── Jaimini karakas ──────────────────────────────────────────────────────────

const KARAKA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/**
 * Atmakaraka and Amatyakaraka by highest / second-highest degree in sign.
 * Amatyakaraka is the career significator, and its placement in the 6th is the
 * classical competitive-exam signal used by the IAS engine.
 */
export function karakas(data: CalcData): {
  AK: CalcPlanet | null;
  AmK: CalcPlanet | null;
  DK: CalcPlanet | null;
} {
  const ranked = data.planets
    .filter((p) => KARAKA_PLANETS.includes(p.planet) && typeof p.degree_in_sign === 'number')
    .sort((a, b) => (b.degree_in_sign as number) - (a.degree_in_sign as number));
  return {
    AK: ranked[0] ?? null,
    AmK: ranked[1] ?? null,
    // Darakaraka: the LOWEST degree of the seven — the spouse significator.
    DK: ranked.length ? ranked[ranked.length - 1] : null,
  };
}

// ── Pancha Mahapurusha Yogas ─────────────────────────────────────────────────

const MAHAPURUSHA: Record<string, { name: string; nameHi: string }> = {
  Saturn:  { name: 'Shasha',  nameHi: 'शश' },
  Mars:    { name: 'Ruchaka', nameHi: 'रुचक' },
  Jupiter: { name: 'Hamsa',   nameHi: 'हंस' },
  Mercury: { name: 'Bhadra',  nameHi: 'भद्र' },
  Venus:   { name: 'Malavya', nameHi: 'मालव्य' },
};

/** Own or exalted, and sitting in a kendra from the lagna. */
export function mahapurusha(
  data: CalcData,
  planetName: string,
): { present: boolean; name: string; nameHi: string; detail: string } {
  const meta = MAHAPURUSHA[planetName];
  const p = planet(data, planetName);
  const fallback = { present: false, name: meta?.name ?? '', nameHi: meta?.nameHi ?? '', detail: '' };
  if (!meta || !p) return fallback;

  const dg = dignityWord(p).toLowerCase();
  const dignified = dg.includes('exalt') || dg.includes('own') || dg.includes('moolatrikona');
  const inKendra = KENDRA.includes(p.house);

  if (dignified && inKendra) {
    return {
      present: true,
      name: meta.name,
      nameHi: meta.nameHi,
      detail: `${PLANET_HI[planetName]} ${p.sign} mein (${dignityWord(p)}) aur ${ord(p.house)} house yaani kendra mein`,
    };
  }
  return {
    ...fallback,
    detail: !dignified
      ? `${PLANET_HI[planetName]} ${dignityWord(p)} hai — Mahapurusha yog ke liye own ya exalted chahiye`
      : `${PLANET_HI[planetName]} ${ord(p.house)} house mein hai — kendra (1/4/7/10) chahiye`,
  };
}

// ── Conjunction / exchange ───────────────────────────────────────────────────

export function conjunct(data: CalcData, a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const ha = houseOf(data, a);
  const hb = houseOf(data, b);
  return ha !== null && ha === hb;
}

/** Parivartana: two house lords sitting in each other's houses. */
export function exchange(data: CalcData, houseA: number, houseB: number): boolean {
  const la = houseLord(data, houseA);
  const lb = houseLord(data, houseB);
  if (!la || !lb) return false;
  return houseOf(data, la) === houseB && houseOf(data, lb) === houseA;
}

// ── Dasha ────────────────────────────────────────────────────────────────────

export function dashaPair(data: CalcData): { maha: string | null; antar: string | null } {
  return {
    maha: data.dasha?.mahadasha ?? data.instant?.current_dasha ?? null,
    antar: data.dasha?.antardasha ?? data.instant?.current_antardasha ?? null,
  };
}

// ── Guard ────────────────────────────────────────────────────────────────────

/**
 * Drishti and Dasamsa are null until the VM patch is deployed everywhere.
 * Engines call this so a missing field degrades the score honestly rather
 * than silently scoring zero and blaming the chart.
 */
export function capabilities(data: CalcData) {
  return {
    hasDrishti: Boolean(data.drishti?.on_houses?.length),
    hasDasamsa: Boolean(data.dasamsa?.grahas?.length),
    hasNavamsa: Boolean(data.navamsa?.grahas?.length),
    hasShadbala: data.planets.some((p) => typeof p.shadbala?.ratio === 'number'),
  };
}
