/**
 * ============================================================
 * TRIKAL VAANI — Santan Yog Engine
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/santan-engine.ts
 * VERSION: 2.3 (3 Sep 2026)
 *   v2.3 — TWO UPAY BOTH CLAIMED TO BE THE WEAKEST GRAHA. On a live paid
 *   report, upay 3 said of Surya "ye aapke chart ka sabse kam bal wala graha
 *   hai" and upay 5 said exactly the same of Chandra. Both cannot be true, and
 *   a reader who notices stops trusting the rest. Cause: substitute() returns
 *   a fixed basis string, and on the second call the graha it picks is the
 *   next weakest, not the weakest. It now says which.
 * VERSION: 2.2 (3 Sep 2026)
 *   v2.2 — THREE DEFECTS FOUND IN A REAL PAID REPORT. All three were visible
 *   to a paying customer, and the first one short-changed her.
 *
 *   A. FIVE UPAY, TWO OF THEM REAL. On a Simha lagna the 5th is Dhanu, so the
 *   Panchamesh is Guru; Guru is also the natural Santan Karaka; and on that
 *   chart Guru was the Jaimini Putrakaraka too. Three of the five slots
 *   therefore printed the same graha and the SAME MANTRA, and the Shadbala
 *   slot made it four. The v2.0 guard only skipped an already-used graha in
 *   slot 5, which does nothing when every candidate is the same planet.
 *   Not rare either — roughly one chart in thirty.
 *   FIX: one `used` set across all five slots, and a substitute chosen the way
 *   Rohiit directed on 3 Sep 2026 (Option 1): a graha sitting in the 5th
 *   house, and if the 5th is empty, the Saptamsa lagna lord. The substituted
 *   upay says openly WHY it was substituted — that two roles landed on one
 *   graha is a real finding about the chart, not something to paper over.
 *
 *   B. WINDOWS RUNNING TO 2094. The reader was born in 2004 and was shown
 *   dasha windows in 2080 and 2094 — ages 76 and 90. buildWindows only
 *   dropped windows that had already ENDED; it had no upper bound at all.
 *   FIX: windows must START within roughly 45 years of birth. This is a
 *   readability bound, not a medical claim — a window nobody can act on is
 *   noise, and printing it costs trust.
 *
 *   C. THE REPORT CONTRADICTED ITSELF. It called Guru "sabse kamzor" at
 *   Shadbala 1.18 while three other lines on the same page called 1.18
 *   "mazboot"; and "5th lord ki taakat" said "mazboot" while awarding 5.3/12,
 *   with no hint that the Enemy Sign was the reason.
 *   FIX: "sabse kam bal of the three" when the ratio is still above 1.00, and
 *   the 5th-lord line now names the split when dignity and Shadbala disagree.
 * VERSION: 2.1 (3 Sep 2026)
 *   v2.1 — PLAIN LANGUAGE, and the reader's name. Found on the live free
 *   report: the summary read "paap drishti ka dabaav aur santan graha ki dasha
 *   raah mein rukavat paida kar rahi hai". Those two phrases are the ENGINE'S
 *   OWN RULE LABELS, handed to Gemini in `facts` — while the same prompt told
 *   it to avoid jargon. I gave it jargon and asked it not to use jargon.
 *   Worse, one of them was misleading: "santan graha ki dasha" scoring zero
 *   means the CURRENT period does not belong to the santan planets, not that a
 *   dasha is blocking anything, and the summary said the latter.
 *   Fixed by translating every label through PLAIN below before it leaves the
 *   engine. The same label has two forms — a rule can appear as support or as
 *   a blocker, and "Guru ki taakat" means opposite things in each — so both
 *   are written out rather than negated at runtime.
 *   Also: `facts.name` so a 73-word personal reading can use the person's name.
 * VERSION: 2.0 (2 Sep 2026)
 *   v2.0 — THE ANSWER, NOT THE ARITHMETIC. Rohiit judged v1.x too technical:
 *   "normal person will not understand... they do not planet numbers, they
 *   want direct answer." The keyword evidence agreed — of ~150 Radar keywords
 *   in cluster svc-child-destiny, the largest bucket (~18) asks KAB, then
 *   KITNE (~7), then UPAY (~6). Not one asks about Shadbala, virupas,
 *   Saptamsa or Putrakaraka. The scoring below is unchanged and still correct;
 *   what v2.0 adds is everything a person actually came for:
 *     verdict   — a three-way plain answer (see VERDICT below)
 *     sankhya   — a santan-count RANGE, never a number
 *     windows   — real dasha dates, taken from the VM's own timeline
 *     upay      — five chart-specific Trikaal Upay (2 BPHS, 2 Bhrigu, 1 Shadbala)
 *   `directionHints` is REPLACED by `upay`. Nothing else was removed.
 *
 *   VERDICT — the one line I would not write. Rohiit asked for "yes, no or
 *   chances". There is no "no". A calculator telling someone they will not
 *   have children is not a claim Parashara makes, it is not medically true,
 *   and the person reading it may stop seeing a doctor. The three-way answer
 *   is haan / sambhavna / abhi kathin — just as decisive, and honest. He
 *   accepted this.
 *
 *   HONEST LABELLING OF THE UPAY SOURCES. BPHS upay 1-2 are the classical
 *   graha remedies (mantra, daan, vaar) applied to this chart's Panchamesh
 *   and to Guru as Santan Karaka. The two marked Bhrigu are karaka-chain
 *   remedies in the BHRIGU NANDI NADI STYLE, derived from this chart — they
 *   are NOT verbatim quotations from a Bhrigu text held in hand, and must
 *   never be advertised as such. The Shadbala one is pure computation: the
 *   weakest of the three santan grahas by measured ratio.
 * VERSION: 1.1 (2 Sep 2026)
 *   v1.1 — SANTAN-SPECIFIC BANDS. See BANDS below. The shared 60/48/36 in
 *   yog-engine.ts were calibrated on the OTHER three engines and are wrong
 *   for this one; measured, not felt. Nothing else changed — the 100-point
 *   table Rohiit approved is untouched.
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Scores 100 across seven blocks, per the table Rohiit approved on
 * 2 Sep 2026:
 *
 *   A  5th bhava (rasi)          22
 *   B  Saptamsa D-7              24   <- the paid hook
 *   C  Guru, Santan Karaka       18
 *   D  Putrakaraka (Jaimini)      8
 *   E  Drishti on the 5th        12   (can go negative)
 *   F  Baadhaayein / doshas      10
 *   G  Dasha window               6
 *
 * Classical basis:
 *   5th house   — Putra Bhava; santan, its lord and its occupants
 *   Jupiter     — Santan Karaka, the natural significator of progeny
 *   Saptamsa    — BPHS Ch.6 s.11 names D-7 as the varga for CHILDREN.
 *                 The D-9 in CalcData is the MARRIAGE varga; reading
 *                 progeny there would be reading the wrong chart.
 *   Putrakaraka — Jaimini's chara karaka for children (sapta scheme,
 *                 5th highest degree — see karakas() in yog-engine.ts)
 *   Rahu/Ketu on the 5th — the classical Putra Dosh axis
 *   Pitra Dosh  — ancestral affliction repeatedly linked to santan baadha
 *
 * ------------------------------------------------------------
 * THE MEDICAL LINE — DO NOT REMOVE
 * ------------------------------------------------------------
 * Progeny is a MEDICAL subject before it is an astrological one. This
 * engine returns a YOG STRENGTH SCORE and a timing window. It must never
 * state, imply or hint that a person cannot have children, and it must
 * never name a medical cause. Every response carries a disclaimer that
 * says so and points a low score at a doctor, not at a remedy alone.
 * The same rule already governs app/api/predict/route.ts.
 * ============================================================
 */

import {
  ord,
  CalcData, ScoreSheet, YogResult,
  planet, houseLord, houseOf, ratio, ratioScore, ratioWord,
  dignityScore, dignityWord, karakas, conjunct,
  dashaPair, drishtiOnHouse, netDrishtiOnHouse, drishtiWord, drishtiOnPlanet,
  d7, d7HouseLord, isD7Vargottama, capabilities,
  PLANET_HI, KENDRA, TRIKONA, DUSTHANA,
} from './yog-engine';

/** One Vimshottari period as the VM returns it, dates included. */
export interface DashaPeriod {
  planet: string;
  start: string;
  end: string;
  antar?: { planet: string; start: string; end: string }[];
}

export interface SantanVerdict {
  key: 'haan' | 'sambhavna' | 'kathin';
  /** Plain Hinglish, shown as the headline. */
  label: string;
  /** Devanagari, for the Hindi surface. */
  labelHi: string;
  /** One ordinary sentence. No graha, no number. */
  line: string;
}

export interface SantanSankhya {
  min: number;
  max: number;
  /** Which classical rule produced it, in plain words. */
  basis: string;
}

export interface SantanWindow {
  label: string;
  /** ISO yyyy-mm-dd. The page formats them. */
  from: string;
  to: string;
  why: string;
}

export interface TrikaalUpay {
  n: number;
  source: 'BPHS' | 'Bhrigu' | 'Shadbala';
  title: string;
  /** What to actually do. */
  what: string;
  /** When to do it. */
  when: string;
  /** Why THIS chart gets this one. */
  why: string;
}

export interface SantanResult extends YogResult {
  /** The direct answer. Free tier shows this. */
  verdict: SantanVerdict;
  /** Dasha periods that support santan yog. Paid tier. */
  timing: { period: string; why: string }[];
  /** Real dated windows from the VM dasha timeline. Paid tier. */
  windows: SantanWindow[];
  /** Santan count RANGE per shastra. Paid tier. */
  sankhya: SantanSankhya | null;
  /** Five chart-specific Trikaal Upay. Paid tier. Never medical. */
  upay: TrikaalUpay[];
  /** Everything Gemini is allowed to see when writing the summary. */
  facts: SantanFacts;
}

/**
 * The ONLY thing handed to Gemini. Note what is absent: no birth details, no
 * raw chart, no free text. Gemini is a writer here, not a calculator — every
 * number and name it may use is in this object, and lib/santan-summary.ts
 * rejects any output that introduces one that is not.
 */
export interface SantanFacts {
  /** First name, when given. Gemini may use it once. */
  name: string | null;
  verdict: string;
  verdictLine: string;
  score: number;
  band: string;
  supportedBy: string[];
  blockedBy: string[];
  sankhya: string | null;
  firstWindow: string | null;
  upayTitles: string[];
  saptamsaRead: boolean;
}

/**
 * The santan disclaimer REPLACES the shared one. It is not an add-on: a
 * progeny score without the medical sentence is not safe to publish.
 */
export const SANTAN_DISCLAIMER =
  'Ye score aapke chart ke santan yogon ki strength batata hai — kisi natije ki ' +
  'guarantee nahi, aur ye koi medical raay nahi hai. Jyotish santan ke samay aur ' +
  'upay par roshni daalta hai; santan se judi kisi bhi shaaririk chinta ke liye ' +
  'kripya qualified doctor se hi salah lein. Kam score ka matlab "santan nahi hogi" ' +
  'kabhi nahi hota — iska matlab hai ki yog ko samay aur upay ka sahara chahiye.';

/**
 * ── SANTAN BAND THRESHOLDS ──────────────────────────────────────────────────
 *
 * These OVERRIDE the shared VERY_STRONG / STRONG / MODERATE in yog-engine.ts.
 * That is deliberate and it is measured, not a preference.
 *
 * The shared 60/48/36 were calibrated against 4,000 charts run through the
 * UPSC, Videsh and Foreign-Spouse engines, whose median lands around 42-45.
 * This engine scores higher for a structural reason: Block F awards its full
 * 10 points whenever a chart is simply CLEAN of Putra Dosh, combustion and
 * Pitra Dosh signals — and most charts are clean of all three at once. An
 * empty 5th house also scores 4 of 6 rather than 0.
 *
 * Run on 4,000 simulated charts, 2 Sep 2026:
 *   median 55  ·  p25 47  ·  p75 62  ·  p90 68  ·  p97 74
 *   under 60/48/36 : Very Strong 34.1%  Strong 39.7%  Moderate 22.0%  Weak 4.1%
 *   under 70/60/46 : Very Strong  7.4%  Strong 24.9%  Moderate 46.5%  Weak 21.1%
 *
 * The second row is what the shared bands were MEANT to produce — top few per
 * cent, top quarter, a broad middle. One chart in three being told its progeny
 * yog is "बहुत प्रबल" is not a calibration quirk on this subject; it is false
 * reassurance about children, which is the one thing this engine must not do.
 *
 * HONEST LIMIT: those 4,000 charts are SIMULATED, not real births. They prove
 * the SHIFT (median 42-45 -> 55 cannot be noise); they do not prove the exact
 * cut points. Re-run against real charts once enough have passed through, and
 * move these three numbers if the data says so. Do not move them by feel.
 * ────────────────────────────────────────────────────────────────────────────
 */
const SANTAN_VERY_STRONG = 70;
const SANTAN_STRONG = 60;
const SANTAN_MODERATE = 46;

function santanBand(score: number): { band: YogResult['band']; bandHi: string } {
  if (score >= SANTAN_VERY_STRONG) return { band: 'Very Strong', bandHi: 'बहुत प्रबल' };
  if (score >= SANTAN_STRONG) return { band: 'Strong', bandHi: 'प्रबल' };
  if (score >= SANTAN_MODERATE) return { band: 'Moderate', bandHi: 'मध्यम' };
  return { band: 'Weak', bandHi: 'कमज़ोर' };
}

/** Natural benefics and malefics, as used for the 5th house and its drishti. */
const BENEFIC = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const MALEFIC_IN_HOUSE = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];

/**
 * Combustion orbs in degrees, BPHS. Used only to flag an afflicted 5th lord —
 * a combust lord is the classical "yog hai par jal gaya" signal.
 */
const COMBUST_ORB: Record<string, number> = {
  Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15,
};

/** Shortest angular separation between two longitudes, 0..180. */
function sep(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** True when a planet is combust (asta) — burnt by the Sun's proximity. */
function isCombust(data: CalcData, name: string | null): { yes: boolean; deg: number | null } {
  const p = planet(data, name);
  const sun = planet(data, 'Sun');
  if (!p || !sun || name === 'Sun') return { yes: false, deg: null };
  if (typeof p.longitude !== 'number' || typeof sun.longitude !== 'number') {
    return { yes: false, deg: null };
  }
  const orb = COMBUST_ORB[p.planet];
  if (!orb) return { yes: false, deg: null };
  const d = sep(p.longitude, sun.longitude);
  return { yes: d <= orb, deg: Math.round(d * 100) / 100 };
}

/** House `n` counted forward from a base house, wrapping 1..12. */
function houseFrom(base: number, n: number): number {
  return ((base + n - 2) % 12) + 1;
}

function signOfHouse(data: CalcData, house: number): string | null {
  return data.houses.find((h) => h.house === house)?.sign ?? null;
}

/** Is the D-7 actually present? capabilities() predates D-7, so check here. */
function hasSaptamsa(data: CalcData): boolean {
  return Boolean(data.saptamsa?.grahas?.length);
}


// ── v2.0 — VERDICT, SANKHYA, WINDOWS, TRIKAAL UPAY ──────────────────────────

/**
 * Fruitful / barren / neutral signs for the 5th house.
 *
 * The classical division, and the basis Rohiit approved on 2 Sep 2026 for a
 * santan COUNT RANGE. Bahu-santan are the watery signs; alpa-santan are the
 * ones classical texts call barren. Everything else is sama. The range is then
 * adjusted by the 5th lord's measured strength and by the D-7, exactly as he
 * asked — sign alone is too blunt to act on.
 */
const BAHU_SANTAN = ['Karka', 'Vrishchika', 'Meena'];
const ALPA_SANTAN = ['Mesha', 'Simha', 'Kanya'];

/** Classical graha remedies. Mantra, daan, day. Used by the BPHS upay. */
const PLANET_REMEDY: Record<string, { mantra: string; daan: string; vaar: string; rang: string }> = {
  Sun:     { mantra: 'ॐ घृणिः सूर्याय नमः',      daan: 'gehu, gud, tamba',          vaar: 'Ravivar',   rang: 'laal' },
  Moon:    { mantra: 'ॐ सों सोमाय नमः',          daan: 'chawal, doodh, chandi',     vaar: 'Somvar',    rang: 'safed' },
  Mars:    { mantra: 'ॐ अं अंगारकाय नमः',        daan: 'masoor dal, gud, tamba',    vaar: 'Mangalvar', rang: 'laal' },
  Mercury: { mantra: 'ॐ बुं बुधाय नमः',           daan: 'moong dal, hari sabzi',     vaar: 'Budhvar',   rang: 'hara' },
  Jupiter: { mantra: 'ॐ बृं बृहस्पतये नमः',       daan: 'chana dal, haldi, kesar',   vaar: 'Guruvar',   rang: 'peela' },
  Venus:   { mantra: 'ॐ शुं शुक्राय नमः',         daan: 'chawal, mishri, safed vastra', vaar: 'Shukravar', rang: 'safed' },
  Saturn:  { mantra: 'ॐ शं शनैश्चराय नमः',       daan: 'kala til, sarson ka tel',   vaar: 'Shanivar',  rang: 'kaala' },
  Rahu:    { mantra: 'ॐ रां राहवे नमः',           daan: 'kambal, kale til, nariyal', vaar: 'Shanivar',  rang: 'dhuandhla' },
  Ketu:    { mantra: 'ॐ कें केतवे नमः',           daan: 'kambal, tirangi vastra',    vaar: 'Mangalvar', rang: 'chitkabra' },
};

/**
 * The three-way answer.
 *
 * Cut points are the santan bands (70 / 46), so the verdict and the band can
 * never disagree. The `line` is written for someone who has never heard the
 * word Shadbala: no graha name, no number, no jargon.
 */
function verdictFor(score: number): SantanVerdict {
  if (score >= SANTAN_VERY_STRONG) {
    return {
      key: 'haan',
      label: 'Haan — yog prabal hai',
      labelHi: 'हाँ — योग प्रबल है',
      line: 'Aapki kundali santan ke maamle mein saath de rahi hai. Jo cheezein is baat ko sambhalti hain, wo aapke chart mein mazboot hain.',
    };
  }
  if (score >= SANTAN_MODERATE) {
    return {
      key: 'sambhavna',
      label: 'Sambhavna hai — samay aur upay chahiye',
      labelHi: 'संभावना है — समय और उपाय चाहिए',
      line: 'Yog aapki kundali mein maujood hai, par abhi uspar kuch dabaav bhi hai. Aise chart mein baat samay par bhi nirbhar karti hai, aur upay se rasta khulta hai.',
    };
  }
  return {
    key: 'kathin',
    label: 'Abhi kathin hai — yog par bhaari rukavat hai',
    labelHi: 'अभी कठिन है — योग पर भारी रुकावट है',
    line: 'Is samay aapke chart par kaafi dabaav dikh raha hai. Iska matlab inkaar nahi hai — iska matlab hai ki raah lambi hai, aur usme samay, upay aur doctor ki salah teenon lagti hain.',
  };
}

/**
 * Santan count as a RANGE — never a number.
 *
 * Sign class sets the base; the 5th lord's Shadbala ratio and the D-7 then
 * move it. A single figure would be a claim the shastra does not make and
 * that modern life (medicine, money, choice) does not obey, so the range is
 * deliberately the widest honest statement available.
 */
function sankhyaRange(
  data: CalcData,
  sign5: string | null,
  l5: string | null,
): SantanSankhya | null {
  if (!sign5) return null;

  let min = 2, max = 3, cls = 'sama';
  if (BAHU_SANTAN.includes(sign5)) { min = 3; max = 4; cls = 'bahu-santan'; }
  else if (ALPA_SANTAN.includes(sign5)) { min = 1; max = 2; cls = 'alpa-santan'; }

  const notes: string[] = [`Aapka panchma bhava ${sign5} ka hai, jo shastra mein ${cls} rashi kehlati hai`];

  const r = ratio(planet(data, l5));
  if (r !== null && r >= 1.2) { max += 1; notes.push(`panchmesh ${PLANET_HI[l5 ?? '']} mazboot hai (Shadbala ${r.toFixed(2)})`); }
  else if (r !== null && r < 0.8) { min = Math.max(1, min - 1); notes.push(`panchmesh ${PLANET_HI[l5 ?? '']} kamzor hai (Shadbala ${r.toFixed(2)})`); }

  if (hasSaptamsa(data)) {
    const g = d7(data, l5);
    if (g && (KENDRA.includes(g.house) || TRIKONA.includes(g.house))) {
      max += 1;
      notes.push('aur Saptamsa D-7 ise sahara de rahi hai');
    } else if (g) {
      max = Math.max(min, max - 1);
      notes.push('par Saptamsa D-7 utna sahara nahi de rahi');
    }
  }

  // BUG FOUND BY TEST, 2 Sep 2026: on the reference chart the D-7 penalty
  // pulled max down to equal min and the output read "2-2". A range whose two
  // ends are the same is not a range, it is a number — which is precisely the
  // claim this function exists to avoid making. The span is therefore always
  // at least one, widened upward so the honest uncertainty stays visible.
  min = Math.max(1, Math.min(min, 5));
  max = Math.min(5, Math.max(max, min + 1));
  if (max <= min) min = Math.max(1, max - 1);
  return { min, max, basis: notes.join(', ') + '.' };
}

/**
 * Dated windows, from the VM's own Vimshottari timeline.
 *
 * These dates were ALREADY being computed and thrown away: the route read
 * maha.start and maha.end only to work out which period is running now, then
 * passed the planet names on and dropped the dates. "Kab" is the single most
 * searched santan question, and the answer was in the response all along.
 *
 * Only windows that have not finished are returned, newest last, capped at
 * four so the paid table stays readable.
 */
/**
 * How far ahead a window is still worth printing, in years from birth.
 *
 * v2.2. A real report showed a reader born in 2004 windows starting in 2080
 * and 2094. Those are arithmetically correct and completely useless. This is a
 * READABILITY bound, not a statement about anyone's body — the engine simply
 * stops listing periods the reader cannot plan around.
 */
const WINDOW_HORIZON_YEARS = 45;

function buildWindows(
  timeline: DashaPeriod[] | undefined,
  keyPlanets: string[],
  birthYear?: number,
): SantanWindow[] {
  if (!Array.isArray(timeline) || !timeline.length) return [];
  const today = new Date();
  // No birth year (older callers) falls back to a horizon from today, so the
  // bound can never silently vanish.
  const maxStartYear = (birthYear ?? today.getUTCFullYear()) + WINDOW_HORIZON_YEARS;
  const out: SantanWindow[] = [];

  for (const maha of timeline) {
    if (!maha?.start || !maha?.end) continue;
    const mEnd = new Date(maha.end);
    if (mEnd < today) continue;

    if (Number(String(maha.start).slice(0, 4)) > maxStartYear) continue;

    if (keyPlanets.includes(maha.planet)) {
      out.push({
        label: `${PLANET_HI[maha.planet] ?? maha.planet} Mahadasha`,
        from: String(maha.start).slice(0, 10),
        to: String(maha.end).slice(0, 10),
        why: `${PLANET_HI[maha.planet] ?? maha.planet} aapke santan grahon mein hai, isliye ye poora daur anukool mana jata hai.`,
      });
    }

    for (const antar of maha.antar ?? []) {
      if (!antar?.start || !antar?.end) continue;
      if (new Date(antar.end) < today) continue;
      if (Number(String(antar.start).slice(0, 4)) > maxStartYear) continue;
      if (!keyPlanets.includes(antar.planet)) continue;
      if (keyPlanets.includes(maha.planet) && maha.planet === antar.planet) continue;
      out.push({
        label: `${PLANET_HI[maha.planet] ?? maha.planet} — ${PLANET_HI[antar.planet] ?? antar.planet}`,
        from: String(antar.start).slice(0, 10),
        to: String(antar.end).slice(0, 10),
        why: `${PLANET_HI[antar.planet] ?? antar.planet} ki antardasha — ye chhoti aur teekhi khidki hoti hai, isliye ispar nazar rakhiye.`,
      });
    }
  }

  out.sort((a, b) => a.from.localeCompare(b.from));
  return out.slice(0, 4);
}

/**
 * The five Trikaal Upay: 2 BPHS, 2 Bhrigu, 1 Shadbala — the split Rohiit set.
 *
 * Every one is chosen BY THIS CHART. That is the whole point: an upay that is
 * the same for everybody cannot be connected to anybody's grahas, which is
 * exactly what the "kaunsa totka karein" searches keep landing on.
 */
function buildUpay(
  data: CalcData,
  ctx: {
    l5: string | null;
    PK: string | null;
    nodeInFifth: boolean;
    pitra: boolean;
    saturnInFifth: boolean;
    combustL5: boolean;
    d7LagnaLord: string | null;
  },
): TrikaalUpay[] {
  const out: TrikaalUpay[] = [];
  const rem = (pl: string | null) => (pl ? PLANET_REMEDY[pl] : undefined);

  // v2.2: ONE used-set across all five slots. The v2.0 version only checked
  // slot 5, which is useless on a chart where the Panchamesh, the Santan
  // Karaka and the Putrakaraka are all the same graha — a real paid report
  // printed the same mantra four times out of five.
  const used = new Set<string>();

  /**
   * Rohiit's Option 1, 3 Sep 2026: when a slot's natural graha is already
   * spoken for, fall to a graha SITTING IN THE 5TH HOUSE; if the 5th is empty,
   * to the Saptamsa lagna lord; and only then to the weakest unused graha.
   * Returns the graha and a plain reason the reader can follow.
   */
  // v2.3: how many substitutions have already been made, so the reason line
  // can stay true on the second and third call.
  let subCount = 0;

  function substitute(): { pl: string; basis: string } | null {
    // Rahu and Ketu are excluded EVERYWHERE here, not just in the last tier.
    // Caught in testing: on a chart with Ketu in the 5th, the substitute picked
    // "Ketu ka upay" to strengthen — while slot 4 was simultaneously prescribing
    // Putra Dosh shanti for that very placement. A node on the 5th is an
    // affliction to pacify, never a graha to feed.
    const NODES = ['Rahu', 'Ketu'];
    const inFifth = data.planets
      .filter((x) => x.house === 5 && PLANET_REMEDY[x.planet] && !used.has(x.planet) && !NODES.includes(x.planet))
      .map((x) => ({ pl: x.planet, r: ratio(x) ?? 1 }))
      .sort((a, b) => a.r - b.r);
    if (inFifth.length) {
      subCount += 1;
      return {
        pl: inFifth[0].pl,
        basis: `wo aapke panchma bhava mein khud baitha hai`,
      };
    }
    if (ctx.d7LagnaLord && PLANET_REMEDY[ctx.d7LagnaLord] && !used.has(ctx.d7LagnaLord)
        && !NODES.includes(ctx.d7LagnaLord)) {
      subCount += 1;
      return {
        pl: ctx.d7LagnaLord,
        basis: `aapka panchma bhava khaali hai, isliye santan ki apni kundali ka lagnesh liya gaya hai`,
      };
    }
    const rest = Object.keys(PLANET_REMEDY)
      .filter((pl) => !used.has(pl) && !NODES.includes(pl))
      .map((pl) => ({ pl, r: ratio(planet(data, pl)) ?? 1 }))
      .sort((a, b) => a.r - b.r);
    if (!rest.length) return null;
    subCount += 1;
    return {
      pl: rest[0].pl,
      basis: subCount > 1
        ? 'upar chune gaye grahon ke baad, aapke chart mein sabse kam bal isi ka hai'
        : 'ye aapke chart ka sabse kam bal wala graha hai',
    };
  }

  /** Standard graha remedy body, so every slot reads the same way. */
  function body(pl: string) {
    const r = PLANET_REMEDY[pl];
    return {
      what: `${r.mantra} — 108 baar. Daan: ${r.daan}. ${r.rang} rang dharan karein.`,
      when: `Har ${r.vaar}, subah snan ke baad, ek hi samay par.`,
    };
  }

  // ── BPHS 1 — the Panchamesh ──
  if (ctx.l5 && PLANET_REMEDY[ctx.l5]) {
    used.add(ctx.l5);
    out.push({
      n: 1, source: 'BPHS',
      title: `Panchamesh ${PLANET_HI[ctx.l5]} ka upay`,
      ...body(ctx.l5),
      why: `Aapke chart mein santan ka swami ${PLANET_HI[ctx.l5]} hai. Isiliye aam "santan upay" aap par kaam nahi karega — upay usi graha ka hona chahiye jo aapki kundali mein ye bhava sambhalta hai.`,
    });
  }

  // ── BPHS 2 — the Santan Karaka, or a substitute when Guru is already used ──
  if (!used.has('Jupiter')) {
    used.add('Jupiter');
    const rj = PLANET_REMEDY.Jupiter;
    out.push({
      n: out.length + 1, source: 'BPHS',
      title: 'Santan Karaka Guru ka upay',
      what: `${rj.mantra} — 108 baar, aur Santan Gopal mantra ka niyam. Daan: ${rj.daan}.`,
      when: 'Har Guruvar. Niyamitta sankhya se zyada mayne rakhti hai.',
      why: 'Guru har kundali mein santan ka karak graha hai — panchma bhava chahe kitna bhi achha ho, kamzor Guru uska phal der se deta hai.',
    });
  } else {
    const sub = substitute();
    if (sub) {
      used.add(sub.pl);
      out.push({
        n: out.length + 1, source: 'BPHS',
        title: `${PLANET_HI[sub.pl]} ka upay`,
        ...body(sub.pl),
        why: `Aapke chart mein Guru khud hi panchma bhava ka swami hai — yaani karak aur swami, dono bhoomikayein ek hi graha par. Uska upay upar aa chuka hai, isliye doosra upay ${PLANET_HI[sub.pl]} par rakha gaya hai: ${sub.basis}. Ek hi mantra do baar likh dena aapko paanch ki jagah chaar upay dena hota.`,
      });
    }
  }

  // ── Bhrigu 1 — the chara karaka, or a substitute ──
  if (ctx.PK && PLANET_REMEDY[ctx.PK] && !used.has(ctx.PK)) {
    used.add(ctx.PK);
    const rpk = PLANET_REMEDY[ctx.PK];
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: `Putrakaraka ${PLANET_HI[ctx.PK]} ki upasana`,
      what: `${rpk.mantra} ka jaap, aur ${PLANET_HI[ctx.PK]} se judi vastu ka daan (${rpk.daan}).`,
      when: `Har ${rpk.vaar}.`,
      why: `Karak-paddhati mein aapka Putrakaraka ${PLANET_HI[ctx.PK]} hai — ye har kundali mein badalta hai, aur isi wajah se ye upay sirf aapke chart ka hai.`,
    });
  } else {
    const sub = substitute();
    if (sub) {
      used.add(sub.pl);
      out.push({
        n: out.length + 1, source: 'Bhrigu',
        title: `${PLANET_HI[sub.pl]} ki upasana`,
        ...body(sub.pl),
        why: `Aapka Putrakaraka ${ctx.PK ? PLANET_HI[ctx.PK] : 'wahi graha'} hai, jiska upay upar aa chuka hai — aapke chart mein do bhoomikayein ek hi graha par aa gayi hain. Isliye ye upay ${PLANET_HI[sub.pl]} par hai: ${sub.basis}.`,
      });
    }
  }

  // ── Bhrigu 2 — the biggest actual blocker. Rarely a graha mantra, so it
  //    almost never collides with the slots above. ──
  if (ctx.nodeInFifth) {
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: 'Chhaya grahon ki shanti (Putra Dosh)',
      what: 'Naag-Naagin ki shanti, Rahu-Ketu ka daan (kambal, kale til, nariyal), aur behte jal mein nariyal pravah.',
      when: 'Shanivar ya Amavasya.',
      why: 'Aapke panchma-ekadash axis par Rahu/Ketu baithe hain. Ye alag shreni ki baadha hai — iska upay chhaya grahon ka hota hai, panchmesh ka nahi, aur yahi antar zyadatar jagah chhoot jata hai.',
    });
  } else if (ctx.pitra) {
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: 'Pitra shanti',
      what: 'Purvajon ke naam tarpan aur shraddh, Amavasya par anna-daan, aur peepal ko jal.',
      when: 'Amavasya, aur Pitru Paksha ke dauran.',
      why: 'Aapke chart mein Pitra Dosh ke sanket hain. Karak-paddhati santan baadha ko purvajon se seedha jodti hai, aur is sthiti mein ye upay panchmesh wale upay se pehle aata hai.',
    });
  } else if (ctx.saturnInFifth) {
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: 'Shani ko shant karna',
      what: 'Kale til aur sarson ka tel daan, Hanuman Chalisa ka niyam, aur shramikon ki seva.',
      when: 'Har Shanivar, suryast ke baad.',
      why: 'Shani aapke panchma bhava par hai. Wo mana nahi karta — wo samay lamba karta hai; isliye upay ka maqsad rasta kholna nahi, intezaar ko chhota karna hai.',
    });
  } else if (ctx.combustL5) {
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: 'Asta panchmesh ko bal dena',
      what: `Surya ko arghya, aur ${ctx.l5 ? PLANET_HI[ctx.l5] : 'panchmesh'} ka mantra jaap.`,
      when: 'Suryoday ke samay, roz.',
      why: 'Aapka panchmesh Surya ke bahut paas hai — yaani asta. Karak-paddhati kehti hai asta graha ka yog maujood rehta hai par dabaa hua, jab tak uski dasha na aaye.',
    });
  } else {
    const jup = planet(data, 'Jupiter');
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: 'Guru ke swami ko bal dena',
      what: 'Guru jis rashi mein hai, us rashi ke swami ka mantra aur uska daan.',
      when: `Us graha ke vaar par.${jup ? ` Aapka Guru ${jup.sign} mein hai.` : ''}`,
      why: 'Aapke chart par koi bhaari dosh nahi hai, isliye karak-paddhati agla kadam yahi bataati hai — karak ke aashray ko mazboot karna, taaki jo yog hai wo bina rukavat chale.',
    });
  }

  // ── Shadbala — pure computation, and never a repeat ──
  const trio = [ctx.l5, 'Jupiter', ctx.PK].filter(Boolean) as string[];
  const ranked = trio
    .map((pl) => ({ pl, r: ratio(planet(data, pl)) }))
    .filter((x): x is { pl: string; r: number } => x.r !== null)
    .sort((a, b) => a.r - b.r);

  const fresh = ranked.find((x) => !used.has(x.pl));
  const chosen = fresh ?? null;

  if (chosen) {
    used.add(chosen.pl);
    const rw = PLANET_REMEDY[chosen.pl];
    // v2.2 wording: 1.18 is not "kamzor". A live report said "sabse kamzor —
    // 1.18" on a page that called 1.18 "mazboot" three times over.
    const weakAbs = chosen.r < 1;
    out.push({
      n: out.length + 1, source: 'Shadbala',
      title: weakAbs
        ? `Sabse kamzor santan graha — ${PLANET_HI[chosen.pl]}`
        : `Teen mein sabse kam bal — ${PLANET_HI[chosen.pl]}`,
      what: `${rw.mantra}, ${rw.daan} ka daan, aur ${rw.rang} rang.`,
      when: `Har ${rw.vaar}, kam se kam 40 din lagataar.`,
      why: weakAbs
        ? `Aapke teen santan grahon mein ${PLANET_HI[chosen.pl]} ki Shadbala sabse kam hai — ${chosen.r.toFixed(2)}, jo 1.00 ke shastriya न्यूनतम se neeche hai. Ye upay kisi kitab se nahi, aapke apne chart ki ganit se nikla hai.`
        : `Aapke teen santan grahon mein ${PLANET_HI[chosen.pl]} ka bal sabse kam hai — Shadbala ${chosen.r.toFixed(2)}. Ye 1.00 ke shastriya न्यूनतम se upar hai, yaani kamzor nahi; bas teenon mein sabse peeche. Ye upay kisi kitab se nahi, aapke apne chart ki ganit se nikla hai.`,
    });
  } else {
    const sub = substitute();
    if (sub) {
      used.add(sub.pl);
      out.push({
        n: out.length + 1, source: 'Shadbala',
        title: `Bal badhane ke liye — ${PLANET_HI[sub.pl]}`,
        ...body(sub.pl),
        why: `Aapke teenon santan grahan — panchmesh, karak aur Putrakaraka — ek hi graha par aa gaye hain, jiska upay upar diya ja chuka hai. Ye ek asli baat hai aapke chart ki, aur iska matlab hai ki poora bhaar ek graha par hai. Isliye paanchva upay ${PLANET_HI[sub.pl]} par rakha gaya hai: ${sub.basis}.`,
      });
    }
  }

  return out;
}

/**
 * Rule label -> ordinary Hinglish, in both directions.
 *
 * `up` is how the rule reads when it is CARRYING the chart; `down` is how it
 * reads when it is holding it back. Written out rather than derived, because
 * the negation of a classical statement is rarely its opposite in plain speech.
 *
 * A label with no entry falls through to itself. That is deliberate: a missing
 * translation should read slightly technical, never crash and never vanish.
 */
const PLAIN: Record<string, { up: string; down: string }> = {
  '5th lord ki taakat': {
    up: 'santan bhava ka swami mazboot hai',
    down: 'santan bhava ka swami abhi kamzor hai',
  },
  '5th house mein graha': {
    up: 'santan ke ghar mein shubh graha baithe hain',
    down: 'santan ke ghar par paap grahon ka dabaav hai',
  },
  '5th lord ki sthiti': {
    up: 'santan ka swami achhe sthaan par hai',
    down: 'santan ka swami kamzor sthaan par chala gaya hai',
  },
  'D-7 lagna lord': {
    up: 'santan ki apni kundali ka aadhaar mazboot hai',
    down: 'santan ki apni kundali ka aadhaar kamzor hai',
  },
  'D-7 ka panchma bhava': {
    up: 'santan ki apni kundali saath de rahi hai',
    down: 'santan ki apni kundali utna saath nahi de rahi',
  },
  'Rasi 5th lord D-7 mein mazboot': {
    up: 'dono kundaliyan ek hi baat keh rahi hain',
    down: 'mukhya kundali ka vaada doosri kundali confirm nahi kar rahi',
  },
  'D-7 vishleshan': {
    up: 'santan ki apni kundali padhi ja chuki hai',
    down: 'santan ki apni kundali is samay padhi nahi ja saki',
  },
  'Guru ki taakat': { up: 'Guru mazboot hai', down: 'Guru abhi kamzor hai' },
  'Guru ki sthiti': {
    up: 'Guru achhe ghar mein baitha hai',
    down: 'Guru aise ghar mein hai jahan wo apna phal der se deta hai',
  },
  'Guru vargottama (D-1 ↔ D-7)': {
    up: 'Guru ko dohri taakat mili hai',
    down: 'Guru ko wo extra sahara nahi mila',
  },
  'Guru ki drishti panchma par': {
    up: 'Guru ki nazar santan ke ghar par hai',
    down: 'Guru ki nazar santan ke ghar par nahi padti',
  },
  'Paap drishti ka dabaav': {
    up: 'santan ke ghar par koi bhaari dabaav nahi hai',
    down: 'santan ke ghar par kuch grahon ka bhaari dabaav hai',
  },
  'Drishti vishleshan': {
    up: 'grahon ki nazar ka hisaab ho chuka hai',
    down: 'grahon ki nazar ka hisaab is samay nahi mil paya',
  },
  'PK ki taakat aur sthiti': {
    up: 'santan ka doosra karak graha mazboot hai',
    down: 'santan ka doosra karak graha kamzor hai',
  },
  'PK se panchma': {
    up: 'us karak se bhi santan ka ghar saath de raha hai',
    down: 'us karak se santan ka ghar kamzor hai',
  },
  'Putra Dosh (Rahu-Ketu axis)': {
    up: 'Rahu-Ketu santan ke ghar se door hain',
    down: 'Rahu-Ketu santan ke ghar par baithe hain',
  },
  '5th lord asta ya vakri': {
    up: 'santan ka swami apna phal dene ki halat mein hai',
    down: 'santan ka swami Surya ke taap mein dabaa hua hai',
  },
  'Pitra Dosh ka sanket': {
    up: 'purvajon se judi koi baadha nahi dikh rahi',
    down: 'purvajon se judi baadha ke sanket hain',
  },
  'Santan graha ki dasha': {
    up: 'abhi jo daur chal raha hai wo santan grahon ka hai',
    down: 'abhi jo daur chal raha hai wo santan grahon ka nahi hai',
  },
};

function plain(label: string, dir: 'up' | 'down'): string {
  return PLAIN[label]?.[dir] ?? label;
}

/** Everything Gemini may see. Nothing else reaches the prompt. */
function toFacts(
  base: YogResult,
  verdict: SantanVerdict,
  sankhya: SantanSankhya | null,
  windows: SantanWindow[],
  upay: TrikaalUpay[],
  saptamsaRead: boolean,
  name: string | null,
): SantanFacts {
  return {
    name: name && name.trim() ? name.trim().split(/\s+/)[0] : null,
    verdict: verdict.label,
    verdictLine: verdict.line,
    score: base.score,
    band: base.band,
    // v2.1: translated, not raw. These are the sentences Gemini writes from.
    supportedBy: (base.highlights ?? []).map((h) => plain(h.label, 'up')),
    blockedBy: (base.blockers ?? []).map((b) => plain(b.label, 'down')),
    sankhya: sankhya ? `${sankhya.min}-${sankhya.max}` : null,
    firstWindow: windows.length ? `${windows[0].label} (${windows[0].from} se ${windows[0].to})` : null,
    upayTitles: upay.map((u) => u.title),
    saptamsaRead,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export function scoreSantan(
  data: CalcData,
  timeline?: DashaPeriod[],
  name?: string | null,
  birthYear?: number,
): SantanResult {
  const s = new ScoreSheet();
  const cap = capabilities(data);
  const { PK } = karakas(data);
  const { maha, antar } = dashaPair(data);

  const l5 = houseLord(data, 5);
  const p5 = planet(data, l5);
  const jup = planet(data, 'Jupiter');
  const sign5 = signOfHouse(data, 5);

  // ── BLOCK A — 5th bhava in the rasi chart (22) ─────────────────────────────

  if (l5 && p5) {
    const dg = dignityScore(p5);
    const r = ratio(p5);
    const pts = 12 * (dg * 0.5 + ratioScore(r) * 0.5);
    s.add('Panchma Bhava', '5th lord ki taakat', pts, 12,
      `Aapka 5th house ${sign5 ?? 'unknown'} ka hai, toh santan ka swami ${PLANET_HI[l5]} hua. ` +
      `Wo ${ord(p5.house)} house mein baitha hai, ${dignityWord(p5)}, aur uski Shadbala ` +
      `${r !== null ? r.toFixed(2) : 'available nahi'}` +
      `${r !== null ? ` (1.00 se upar mazboot mana jata hai) — yaani ${ratioWord(r)}` : ''}. ` +
      // v2.2: when Shadbala and dignity disagree, SAY SO. The live report read
      // "Shadbala 1.18 — yaani mazboot" and then awarded 5.3 of 12, which looks
      // like a contradiction until you know the sign is the reason.
      `${r !== null && r >= 1.0 && dg <= 0.4
        ? `Dhyan dijiye — bal to mazboot hai, par rashi ke hisaab se wo ${dignityWord(p5)} mein hai, aur isi wajah se poore ank nahi mile. `
        : ''}` +
      `Panchma bhava ko shastra mein Putra Bhava kaha gaya hai, aur uske swami ki halat ` +
      `santan yog ka pehla paimana hai.`);
  } else {
    s.add('Panchma Bhava', '5th lord ki taakat', 0, 12,
      '5th house ka swami chart se nahi mila.');
  }

  const inFifth = data.planets.filter((p) => p.house === 5);
  const benInFifth = inFifth.filter((p) => BENEFIC.includes(p.planet));
  const malInFifth = inFifth.filter((p) => MALEFIC_IN_HOUSE.includes(p.planet));

  if (benInFifth.length && !malInFifth.length) {
    s.add('Panchma Bhava', '5th house mein graha', 6, 6,
      `${benInFifth.map((p) => PLANET_HI[p.planet]).join(' aur ')} aapke 5th house mein hai aur koi ` +
      `paap graha wahan nahi — santan bhava saaf hai. ` +
      `${benInFifth.map((p) => `${PLANET_HI[p.planet]} ki Shadbala ${ratio(p)?.toFixed(2) ?? 'n/a'}`).join(', ')}.`);
  } else if (benInFifth.length && malInFifth.length) {
    s.add('Panchma Bhava', '5th house mein graha', 3, 6,
      `Aapke 5th house mein shubh aur paap dono hain — ${benInFifth.map((p) => PLANET_HI[p.planet]).join(', ')} ` +
      `ke saath ${malInFifth.map((p) => PLANET_HI[p.planet]).join(', ')}. ` +
      `Shastra ise mishrit phal kehta hai: yog banta hai, par saath mein deri ya chinta bhi aati hai.`);
  } else if (malInFifth.length) {
    s.add('Panchma Bhava', '5th house mein graha', 0, 6,
      `Aapke 5th house mein ${malInFifth.map((p) => PLANET_HI[p.planet]).join(' aur ')} baitha hai aur koi ` +
      `shubh graha wahan nahi. Ye santan bhava par dabaav hai — khaas taur par ` +
      `${malInFifth.some((p) => p.planet === 'Saturn') ? 'Shani, jo mana nahi karta, samay lamba kar deta hai' :
        'paap grahon ka yahan hona deri ka classical sanket hai'}.`);
  } else {
    s.add('Panchma Bhava', '5th house mein graha', 4, 6,
      `Aapka 5th house khaali hai — na koi shubh graha, na paap. Ye achha hai: ab poora phal ` +
      `5th lord ${PLANET_HI[l5 ?? '']} aur Guru par jata hai, jo neeche alag se gine gaye hain.`);
  }

  if (p5) {
    if (KENDRA.includes(p5.house) || TRIKONA.includes(p5.house)) {
      s.add('Panchma Bhava', '5th lord ki sthiti', 4, 4,
        `Santan ka swami ${PLANET_HI[l5!]} ${ord(p5.house)} house mein hai — ` +
        `${KENDRA.includes(p5.house) ? 'kendra' : 'trikona'}. Yahan baitha lord apna phal deta hai, rokta nahi.`);
    } else if (DUSTHANA.includes(p5.house)) {
      s.add('Panchma Bhava', '5th lord ki sthiti', 0, 4,
        `Santan ka swami ${PLANET_HI[l5!]} ${ord(p5.house)} house mein hai — dusthana (6/8/12). ` +
        `Iska matlab yog ka na hona nahi hai; iska matlab hai ki phal der se aur mehnat ke baad aata hai.`);
    } else {
      s.add('Panchma Bhava', '5th lord ki sthiti', 2, 4,
        `Santan ka swami ${PLANET_HI[l5!]} ${ord(p5.house)} house mein hai — na kendra-trikona, na dusthana. ` +
        `Tatasth sthiti.`);
    }
  } else {
    s.add('Panchma Bhava', '5th lord ki sthiti', 0, 4, '5th lord chart mein locate nahi hua.');
  }

  // ── BLOCK B — Saptamsa D-7 (24) ────────────────────────────────────────────
  // BPHS Ch.6 s.11. This is the block that separates this calculator from
  // every free tool that reads only the rasi chart.

  if (hasSaptamsa(data) && data.saptamsa) {
    const d7Lagna = data.saptamsa.lagna;
    const d7LagnaLord = d7Lagna?.sign_lord ?? null;
    const pdl = planet(data, d7LagnaLord);
    const rdl = ratio(pdl);
    s.add('Saptamsa D-7', 'D-7 lagna lord', 8 * ratioScore(rdl), 8,
      d7Lagna
        ? `Aapka Saptamsa lagna ${d7Lagna.sign} hai, jiska swami ${PLANET_HI[d7LagnaLord ?? '']} hai — ` +
          `uski Shadbala ${rdl !== null ? rdl.toFixed(2) : 'n/a'} (${ratioWord(rdl)}). ` +
          `BPHS Ch.6 kehta hai santan Saptamsa se padhi jati hai, rasi chart se nahi — ` +
          `isliye ye poore score ka sabse gehra hissa hai.`
        : 'Saptamsa lagna nahi mila.');

    const d7Fifth = data.saptamsa.fifth_lord ?? d7HouseLord(data, 5);
    const d7FifthSign = data.saptamsa.fifth_sign ?? null;
    const pd5 = planet(data, d7Fifth);
    const rd5 = ratio(pd5);
    s.add('Saptamsa D-7', 'D-7 ka panchma bhava', 10 * ratioScore(rd5), 10,
      d7Fifth
        ? `Saptamsa ke 5th house ${d7FifthSign ? `(${d7FifthSign}) ` : ''}ka swami ${PLANET_HI[d7Fifth]} hai, ` +
          `Shadbala ${rd5 !== null ? rd5.toFixed(2) : 'n/a'} (${ratioWord(rd5)}). ` +
          `Ye santan ke andar ki santan hai — santan ki sankhya, unka sukh aur unki disha ` +
          `yahin se padhi jati hai.`
        : 'Saptamsa ka 5th swami nahi nikal paya.');

    const g = d7(data, l5);
    if (g && (KENDRA.includes(g.house) || TRIKONA.includes(g.house))) {
      s.add('Saptamsa D-7', 'Rasi 5th lord D-7 mein mazboot', 6, 6,
        `Aapka rasi 5th lord ${PLANET_HI[l5!]} Saptamsa mein ${g.sign} (${ord(g.house)} house) mein hai — ` +
        `${KENDRA.includes(g.house) ? 'kendra' : 'trikona'}. Rasi ka vaada D-7 mein confirm ho raha hai, ` +
        `aur do chart ka ek hi jawab dena sabse bharosemand sanket hai.`);
    } else {
      s.add('Saptamsa D-7', 'Rasi 5th lord D-7 mein mazboot', 0, 6,
        g
          ? `Rasi 5th lord ${PLANET_HI[l5!]} Saptamsa mein ${ord(g.house)} house mein hai — kendra ya trikona nahi. ` +
            `Rasi chart jo vaada karta hai, D-7 use poora sahara nahi de raha.`
          : 'Rasi 5th lord Saptamsa mein locate nahi hua.');
    }
  } else {
    s.add('Saptamsa D-7', 'D-7 vishleshan', 0, 24,
      'Saptamsa (D-7) chart is samay available nahi hai, isliye is block ke 24 point nahi diye gaye. ' +
      'Ye aapke chart ki kami nahi hai — ye hamari taraf ka data gap hai.');
  }

  // ── BLOCK C — Guru, the Santan Karaka (18) ─────────────────────────────────

  const rj = ratio(jup);
  s.add('Guru — Santan Karaka', 'Guru ki taakat', 8 * ratioScore(rj), 8,
    jup
      ? `${PLANET_HI.Jupiter} santan ka karak graha hai. Aapke chart mein wo ${jup.sign} mein, ` +
        `${ord(jup.house)} house mein hai, ${dignityWord(jup)}, Shadbala ${rj !== null ? rj.toFixed(2) : 'n/a'} ` +
        `(${ratioWord(rj)}). Panchma bhava kitna bhi achha ho, kamzor Guru uska phal der se deta hai.`
      : 'Guru chart mein nahi mila.');

  if (jup) {
    const GOOD_J = [1, 2, 4, 5, 7, 9, 11];
    if (GOOD_J.includes(jup.house)) {
      s.add('Guru — Santan Karaka', 'Guru ki sthiti', 6, 6,
        `${PLANET_HI.Jupiter} ${ord(jup.house)} house mein hai — santan ke liye ye shubh sthaan hai` +
        `${jup.house === 5 ? ', aur 5th house mein hona to karak ka apne ghar mein hona hai' : ''}.`);
    } else if (DUSTHANA.includes(jup.house)) {
      s.add('Guru — Santan Karaka', 'Guru ki sthiti', 0, 6,
        `${PLANET_HI.Jupiter} ${ord(jup.house)} house mein hai — dusthana. ` +
        `Karak graha yahan ho to santan sukh mein deri ya door rehna dikhta hai. ` +
        `Ye rukavat hai, inkaar nahi.`);
    } else {
      s.add('Guru — Santan Karaka', 'Guru ki sthiti', 3, 6,
        `${PLANET_HI.Jupiter} ${ord(jup.house)} house mein hai — na shubh sthaan, na dusthana. Tatasth.`);
    }
  } else {
    s.add('Guru — Santan Karaka', 'Guru ki sthiti', 0, 6, 'Guru ki sthiti nahi mili.');
  }

  if (hasSaptamsa(data)) {
    const vg = isD7Vargottama(data, 'Jupiter');
    const gj = d7(data, 'Jupiter');
    s.add('Guru — Santan Karaka', 'Guru vargottama (D-1 ↔ D-7)', vg ? 4 : 0, 4,
      vg
        ? `${PLANET_HI.Jupiter} vargottama hai — rasi aur Saptamsa dono mein ${jup?.sign} mein. ` +
          `Ek hi rashi do chart mein aana karak ki taakat ko dugna kar deta hai.`
        : gj
          ? `${PLANET_HI.Jupiter} rasi mein ${jup?.sign} aur Saptamsa mein ${gj.sign} — vargottama nahi. ` +
            `Ye kami nahi hai, bas ek extra sahara nahi mila.`
          : 'Guru Saptamsa mein locate nahi hua.');
  } else {
    s.add('Guru — Santan Karaka', 'Guru vargottama (D-1 ↔ D-7)', 0, 4,
      'Saptamsa available nahi, isliye vargottama check nahi ho paya.');
  }

  // ── BLOCK D — Putrakaraka, Jaimini (8) ─────────────────────────────────────

  if (PK) {
    const rpk = ratio(PK);
    const good = KENDRA.includes(PK.house) || TRIKONA.includes(PK.house);
    const pts = 5 * (ratioScore(rpk) * 0.6 + (good ? 0.4 : 0));
    s.add('Putrakaraka', 'PK ki taakat aur sthiti', pts, 5,
      `Jaimini ke anusaar aapka Putrakaraka ${PLANET_HI[PK.planet]} hai — saat grahon mein paanchve ` +
      `sabse zyada ansh (${PK.degree_in_sign?.toFixed(2) ?? 'n/a'}°) par hone ke kaaran. ` +
      `Wo ${ord(PK.house)} house mein hai${good ? ' — kendra/trikona' : ''}, ` +
      `Shadbala ${rpk !== null ? rpk.toFixed(2) : 'n/a'} (${ratioWord(rpk)}).`);

    const fromPk5 = houseFrom(PK.house, 5);
    const lpk5 = houseLord(data, fromPk5);
    const ppk5 = planet(data, lpk5);
    const rpk5 = ratio(ppk5);
    s.add('Putrakaraka', 'PK se panchma', 3 * ratioScore(rpk5), 3,
      lpk5
        ? `Putrakaraka se paanchva bhava aapka ${ord(fromPk5)} house hai, jiska swami ${PLANET_HI[lpk5]} hai — ` +
          `Shadbala ${rpk5 !== null ? rpk5.toFixed(2) : 'n/a'} (${ratioWord(rpk5)}). ` +
          `Jaimini paddhati mein karak se paanchva bhava wahi kaam karta hai jo lagna se paanchva.`
        : 'Putrakaraka se paanchve ka swami nahi mila.');
  } else {
    s.add('Putrakaraka', 'PK ki taakat aur sthiti', 0, 5, 'Putrakaraka nikala nahi ja saka.');
    s.add('Putrakaraka', 'PK se panchma', 0, 3, 'Putrakaraka nahi mila, isliye ye rule nahi chala.');
  }

  // ── BLOCK E — Drishti on the 5th (12, can go negative) ─────────────────────

  if (cap.hasDrishti) {
    const jd = drishtiOnHouse(data, 5, ['Jupiter']);
    if (jd && jd.virupas > 0) {
      s.add('Drishti', 'Guru ki drishti panchma par', 6 * Math.min(1, jd.virupas / 45), 6,
        `${PLANET_HI.Jupiter} ki drishti aapke 5th house par ${jd.virupas.toFixed(2)} virupas ki hai ` +
        `(60 = poori drishti), yaani ${drishtiWord(jd.virupas)} — ` +
        `${Math.round((jd.virupas / 60) * 100)}% taakat. Shastra mein Guru ki drishti panchma par ` +
        `santan yog ka sabse shubh sanket mani gayi hai.`);
    } else {
      s.add('Drishti', 'Guru ki drishti panchma par', 0, 6,
        `${PLANET_HI.Jupiter} ki koi drishti aapke 5th house par nahi hai. ` +
        `Guru ki sthiti upar alag se gini ja chuki hai — ye sirf drishti ka hissa hai.`);
    }

    // Jupiter is excluded so the credit above is not counted twice.
    const net = netDrishtiOnHouse(data, 5, ['Jupiter']);
    const lordPressure = l5
      ? drishtiOnPlanet(data, l5, ['Saturn', 'Mars', 'Sun'])
          .reduce((sum, r) => sum + r.virupas, 0)
      : 0;

    if (net >= 0 && lordPressure < 20) {
      s.add('Drishti', 'Paap drishti ka dabaav', 6, 6,
        `Aapke 5th house par shubh aur paap drishti ka net hisaab ${net >= 0 ? '+' : ''}${net.toFixed(2)} ` +
        `virupas hai, aur 5th lord ${PLANET_HI[l5 ?? '']} par Shani/Mangal/Surya ka kul dabaav ` +
        `sirf ${lordPressure.toFixed(2)} virupas. Santan bhava par koi bhaari paap drishti nahi hai.`);
    } else {
      const heavy = Math.min(6, (Math.max(0, -net) + Math.max(0, lordPressure - 20)) / 12);
      s.add('Drishti', 'Paap drishti ka dabaav', -heavy, 6,
        `Aapke 5th house par net drishti ${net.toFixed(2)} virupas hai` +
        `${lordPressure >= 20 ? `, aur 5th lord ${PLANET_HI[l5 ?? '']} par Shani/Mangal/Surya ka dabaav ` +
          `${lordPressure.toFixed(2)} virupas` : ''}. ` +
        `Paap drishti santan yog ko todti nahi, use aage khiska deti hai — isliye timing ` +
        `is chart mein score se zyada mayne rakhti hai.`);
    }
  } else {
    s.add('Drishti', 'Drishti vishleshan', 0, 12, 'Drishti data is samay available nahi hai.');
  }

  // ── BLOCK F — Baadhaayein / doshas (10) ────────────────────────────────────

  const nodeInFifth = data.planets.filter(
    (p) => (p.planet === 'Rahu' || p.planet === 'Ketu') && (p.house === 5 || p.house === 11),
  );
  if (!nodeInFifth.length) {
    s.add('Baadha', 'Putra Dosh (Rahu-Ketu axis)', 4, 4,
      'Rahu ya Ketu aapke 5th-11th axis par nahi hain. Ye achhi khabar hai — ' +
      'chhaya grahon ka panchma par hona santan baadha ka sabse aam classical kaaran hai.');
  } else {
    const on5 = nodeInFifth.filter((p) => p.house === 5);
    s.add('Baadha', 'Putra Dosh (Rahu-Ketu axis)', 0, 4,
      `${nodeInFifth.map((p) => `${PLANET_HI[p.planet]} ${ord(p.house)} house mein`).join(' aur ')} hai — ` +
      `panchma-ekadash axis par. ` +
      `${on5.length
        ? `${on5.map((p) => PLANET_HI[p.planet]).join(' aur ')} ka seedha 5th house mein hona Putra Dosh kehlata hai.`
        : 'Ekadash se axis ka asar 5th par padta hai.'} ` +
      `Iska ilaaj shastra mein bataya gaya hai — ye sthayi rukavat nahi hai.`);
  }

  const comb = isCombust(data, l5);
  const retroDusthana = Boolean(p5?.is_retrograde && DUSTHANA.includes(p5.house));
  if (!comb.yes && !retroDusthana) {
    s.add('Baadha', '5th lord asta ya vakri', 3, 3,
      `Santan ka swami ${PLANET_HI[l5 ?? '']} na Surya se asta (combust) hai` +
      `${comb.deg !== null ? ` — Surya se ${comb.deg.toFixed(2)}° door hai` : ''}` +
      `, na dusthana mein vakri. Lord apna phal dene ki halat mein hai.`);
  } else {
    s.add('Baadha', '5th lord asta ya vakri', 0, 3,
      comb.yes
        ? `Santan ka swami ${PLANET_HI[l5 ?? '']} Surya se sirf ${comb.deg?.toFixed(2)}° door hai — ` +
          `asta (combust). Shastra kehta hai asta graha ka yog maujood to rehta hai par uska phal ` +
          `dabaa hua rehta hai, jab tak uski dasha na aaye.`
        : `Santan ka swami ${PLANET_HI[l5 ?? '']} ${ord(p5!.house)} house (dusthana) mein vakri hai — ` +
          `phal ulta aur der se milta hai.`);
  }

  const sunRahu = conjunct(data, 'Sun', 'Rahu');
  const ninthOccupied = data.planets.some(
    (p) => p.house === 9 && ['Sun', 'Rahu', 'Saturn', 'Ketu'].includes(p.planet),
  );
  const l9 = houseLord(data, 9);
  const h9 = houseOf(data, l9);
  const ninthLordAfflicted = h9 !== null && DUSTHANA.includes(h9);
  const pitraSignals = [
    sunRahu ? `${PLANET_HI.Sun} aur ${PLANET_HI.Rahu} ek saath` : null,
    ninthOccupied ? `9th house mein paap graha` : null,
    ninthLordAfflicted ? `9th lord ${PLANET_HI[l9 ?? '']} ${ord(h9!)} house (dusthana) mein` : null,
  ].filter(Boolean) as string[];

  if (!pitraSignals.length) {
    s.add('Baadha', 'Pitra Dosh ka sanket', 3, 3,
      'Aapke chart mein Pitra Dosh ke teen classical sanket — Surya-Rahu yuti, 9th house mein ' +
      'paap graha, aur 9th lord ka dusthana mein hona — mein se koi nahi hai. ' +
      'Pitra Dosh ka santan baadha se seedha sambandh shastra mein bataya gaya hai.');
  } else {
    s.add('Baadha', 'Pitra Dosh ka sanket', 0, 3,
      `Pitra Dosh ke ${pitraSignals.length} sanket mile: ${pitraSignals.join(', ')}. ` +
      `Purvajon se judi ye baadha santan yog par asar daalti hai, aur iska upay alag hota hai — ` +
      `5th house ke upay se ye theek nahi hoti.`);
  }

  // ── BLOCK G — Dasha window (6) ─────────────────────────────────────────────

  const keyPlanets = [l5, 'Jupiter', PK?.planet].filter(Boolean) as string[];
  const hit = [maha, antar].filter((x): x is string => Boolean(x) && keyPlanets.includes(x as string));
  s.add('Dasha', 'Santan graha ki dasha', hit.length ? 6 : 0, 6,
    hit.length
      ? `${hit.map((h) => PLANET_HI[h]).join(' aur ')} abhi aapki dasha mein chal raha hai — aur yehi ` +
        `aapke chart ka santan graha hai (5th lord ${PLANET_HI[l5 ?? '']}, karak ${PLANET_HI.Jupiter}, ` +
        `Putrakaraka ${PLANET_HI[PK?.planet ?? '']}). Yog ko chalne ke liye uski dasha chahiye hoti hai.`
      : `Abhi ${maha ? PLANET_HI[maha] : '?'}-${antar ? PLANET_HI[antar] : '?'} chal raha hai. ` +
        `Aapke santan grahas — 5th lord ${PLANET_HI[l5 ?? '']}, karak ${PLANET_HI.Jupiter}, ` +
        `Putrakaraka ${PLANET_HI[PK?.planet ?? '']} — abhi active nahi hain. ` +
        `Iska matlab yog kamzor hona nahi, uska samay abhi na aana hai.`);

  // ── Result ─────────────────────────────────────────────────────────────────

  const base = s.finish();
  // finish() applies the SHARED bands. Re-band with the santan thresholds —
  // the score itself is not touched, only the label it is given.
  const { band, bandHi } = santanBand(base.score);
  const rebanded = { ...base, band, bandHi };

  const verdict = verdictFor(base.score);
  const sankhya = sankhyaRange(data, sign5, l5);
  const windows = buildWindows(timeline, keyPlanets, birthYear);
  const upay = buildUpay(data, {
    l5,
    PK: PK?.planet ?? null,
    nodeInFifth: nodeInFifth.length > 0,
    pitra: pitraSignals.length > 0,
    saturnInFifth: inFifth.some((x) => x.planet === 'Saturn'),
    combustL5: comb.yes,
    // v2.2 Option 1: the substitute falls to the Saptamsa lagna lord when the
    // 5th house is empty, so buildUpay needs to know it.
    d7LagnaLord: data.saptamsa?.lagna?.sign_lord ?? null,
  });

  return {
    ...rebanded,
    // The shared disclaimer has no medical sentence; santan must carry one.
    disclaimer: SANTAN_DISCLAIMER,
    verdict,
    timing: buildTiming(data, keyPlanets),
    windows,
    sankhya,
    upay,
    facts: toFacts(rebanded, verdict, sankhya, windows, upay, hasSaptamsa(data), name ?? null),
  };
}

// ── Timing ───────────────────────────────────────────────────────────────────

function buildTiming(data: CalcData, keyPlanets: string[]) {
  const { maha, antar } = dashaPair(data);
  const out: { period: string; why: string }[] = [];

  if (maha) {
    const good = keyPlanets.includes(maha);
    out.push({
      period: `${PLANET_HI[maha]} Mahadasha (abhi chal rahi)`,
      why: good
        ? `${PLANET_HI[maha]} aapka santan graha hai — ye mahadasha santan yog ko seedha sahara deti hai.`
        : `Ye mahadasha santan ke liye tatasth hai. Asli window antardasha se banegi — neeche dekho.`,
    });
  }
  if (antar) {
    out.push({
      period: `${PLANET_HI[antar]} Antardasha`,
      why: keyPlanets.includes(antar)
        ? `${PLANET_HI[antar]} aapke santan grahon mein hai — ye antardasha sabse anukool samay hai.`
        : `${PLANET_HI[antar]} santan grahon mein nahi hai; is antardasha mein taiyari zyada, ghatna kam.`,
    });
  }

  const jup = planet(data, 'Jupiter');
  if (jup) {
    out.push({
      period: `${PLANET_HI.Jupiter} ka gochar 5th house par`,
      why: `Guru har 12 saal mein ek baar aapke 5th house se gujarta hai aur har saal us par drishti ` +
        `daal sakta hai. Dasha ke saath jab ye gochar milta hai, wahi santan yog ka sabse mazboot ` +
        `window hota hai.`,
    });
  }
  return out;
}

// ── RETIRED in v2.0 ──────────────────────────────────────────────────────────
// buildHints() produced the old one-line "direction" hints. buildUpay() above
// replaces it with five sourced, chart-specific Trikaal Upay. Kept out rather
// than left dead — nothing calls it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _retiredBuildHints(
  data: CalcData,
  ctx: { l5: string | null; PK: string | null; nodeInFifth: boolean; pitra: boolean },
) {
  const out: { hint: string; reason: string }[] = [];
  const jup = planet(data, 'Jupiter');
  const rj = ratio(jup);

  if (rj !== null && rj < 1) {
    out.push({
      hint: 'Guru ko balvaan karna',
      reason: `Aapke Guru ki Shadbala ${rj.toFixed(2)} hai, 1.00 se neeche. Santan ka karak kamzor ho to ` +
        `sabse pehla kaam usi ko sahara dena hota hai — Brihaspati mantra aur Guruwar ka niyam.`,
    });
  }
  if (ctx.l5) {
    out.push({
      hint: `5th lord ${PLANET_HI[ctx.l5]} ka upay`,
      reason: `Aapke chart mein santan ka swami ${PLANET_HI[ctx.l5]} hai, isliye aam "santan upay" nahi — ` +
        `upay ${PLANET_HI[ctx.l5]} ka hona chahiye. Yahi wajah hai ki ek hi upay sab par kaam nahi karta.`,
    });
  }
  if (ctx.nodeInFifth) {
    out.push({
      hint: 'Putra Dosh ka alag upay',
      reason: 'Rahu/Ketu ka panchma axis par hona alag shreni ki baadha hai; iska upay chhaya grahon ka ' +
        'hota hai, 5th lord ka nahi.',
    });
  }
  if (ctx.pitra) {
    out.push({
      hint: 'Pitra shanti',
      reason: 'Aapke chart mein Pitra Dosh ke sanket hain. Shastra santan baadha ko purvajon se jodta hai, ' +
        'aur is sthiti mein shraddh/tarpan wale upay pehle aate hain.',
    });
  }
  if (ctx.PK) {
    out.push({
      hint: `Putrakaraka ${PLANET_HI[ctx.PK]} ki upasana`,
      reason: `Jaimini paddhati mein santan ka chara karak ${PLANET_HI[ctx.PK]} hai — iski upasana ` +
        `karak ko seedha balvaan karti hai.`,
    });
  }
  return out;
}
