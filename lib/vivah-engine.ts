/**
 * ============================================================
 * TRIKAL VAANI — Vivah Yog Engine ("Shadi kab hogi")
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/vivah-engine.ts
 * VERSION: 1.0 (3 Sep 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Scores 100 across seven blocks, per the table Rohiit approved on
 * 3 Sep 2026:
 *
 *   A  Saptam bhava (rasi)       22
 *   B  Navamsa D-9               24   <- the paid hook
 *   C  Kalatra Karaka            18
 *   D  Darakaraka (Jaimini)       8
 *   E  Drishti on the 7th        12   (can go negative)
 *   F  Baadhaayein / doshas      10
 *   G  Dasha window               6
 *
 * Classical basis:
 *   7th house    — Kalatra Bhava; the spouse, its lord and its occupants
 *   Navamsa D-9  — BPHS judges MARRIAGE in the Navamsa. This is the varga
 *                  that matters here, exactly as D-7 was for progeny, and it
 *                  carries the heaviest single block for that reason.
 *   Kalatra Karaka — Venus for a man, Jupiter for a woman. See KARAKA below.
 *   Darakaraka   — Jaimini's chara karaka for the spouse (lowest degree of
 *                  the seven). Already computed by karakas() in yog-engine.
 *   Mangal Dosh  — Mars in 1/4/7/8/12 from the lagna
 *
 * ------------------------------------------------------------
 * WHY THIS FILE MIRRORS lib/santan-engine.ts SO CLOSELY
 *   Deliberate. Santan was hardened over a day of live defects — duplicate
 *   remedies, windows running to 2094, a contradiction between "sabse kamzor"
 *   and a Shadbala above 1.00, rule labels leaking as jargon. Every one of
 *   those fixes is reproduced here by construction rather than waited for.
 *   Where the two differ, it is because the SUBJECT differs, not the shape.
 *
 * ------------------------------------------------------------
 * FOUR LINES THAT ARE NOT NEGOTIABLE
 * ------------------------------------------------------------
 *   1. NEVER "shadi nahi hogi". The engine returns a YOG STRENGTH and a
 *      timing window. Parashara does not claim marriage will not happen, and
 *      a calculator saying it to a 29-year-old is a cruelty with no basis.
 *   2. NO DIVORCE, NO WIDOWHOOD. The classical texts do carry rules for
 *      separation and for the spouse's longevity. We do not publish them.
 *      They sell through fear, they are read by frightened people, and a
 *      score cannot carry that weight.
 *   3. NO CASTE, COMMUNITY, RELIGION OR COUNTRY of the spouse. The same rule
 *      the foreign-spouse engine already follows — a chart cannot honestly
 *      name one, and the attempt is discriminatory whatever it produces.
 *   4. NO SEX OF THE SPOUSE, and no assumption about it.
 * ============================================================
 */

import {
  ord,
  CalcData, ScoreSheet, YogResult,
  planet, houseLord, houseOf, ratio, ratioScore, ratioWord,
  dignityScore, dignityWord, karakas,
  dashaPair, drishtiOnHouse, netDrishtiOnHouse, drishtiWord, drishtiOnPlanet,
  d9, d9HouseLord, isVargottama, capabilities,
  PLANET_HI, KENDRA, TRIKONA, DUSTHANA,
} from './yog-engine';

/**
 * One Vimshottari period as the VM returns it, dates included.
 *
 * Structurally identical to the one in lib/santan-engine.ts, and TypeScript
 * being structural they are interchangeable. It is declared here rather than
 * imported so a marriage calculator does not depend on a progeny one. When
 * lib/yog-engine.ts is next opened for another reason, this belongs there.
 */
export interface DashaPeriod {
  planet: string;
  start: string;
  end: string;
  antar?: { planet: string; start: string; end: string }[];
}

export interface VivahVerdict {
  key: 'haan' | 'sambhavna' | 'deri';
  label: string;
  labelHi: string;
  /** One ordinary sentence. No graha, no number. */
  line: string;
}

export interface VivahUmar {
  from: number;
  to: number;
  /** How it was derived, in plain words. */
  basis: string;
}

export interface VivahWindow {
  label: string;
  /** ISO yyyy-mm-dd. The page formats them. */
  from: string;
  to: string;
  /** Age at the start of the window, when the birth year is known. */
  age: number | null;
  why: string;
}

export interface TrikaalUpay {
  n: number;
  source: 'BPHS' | 'Bhrigu' | 'Shadbala';
  title: string;
  what: string;
  when: string;
  why: string;
}

export interface VivahFacts {
  name: string | null;
  verdict: string;
  verdictLine: string;
  supportedBy: string[];
  blockedBy: string[];
  /** Age band, e.g. "26-29". The shared summary core calls this `range`. */
  umar: string | null;
  firstWindow: string | null;
  upayTitles: string[];
  navamsaRead: boolean;
}

export interface VivahResult extends YogResult {
  verdict: VivahVerdict;
  timing: { period: string; why: string }[];
  windows: VivahWindow[];
  umar: VivahUmar | null;
  upay: TrikaalUpay[];
  facts: VivahFacts;
}

/**
 * The vivah disclaimer REPLACES the shared one. Marriage timing is where
 * astrology is most often used to frighten people — "36 tak nahi hui to kabhi
 * nahi hogi" is a sentence that has done real damage. This says the opposite,
 * and it is returned on every call, free and paid.
 */
export const VIVAH_DISCLAIMER =
  'Ye score aapki kundali ke vivah yogon ki strength aur unke samay ka aaklan hai — kisi natije ki ' +
  'guarantee nahi. Jyotish vivah ke samay par roshni daalta hai; wo ye nahi batata ki vivah hoga ya ' +
  'nahi, aur kam score ka matlab "shadi nahi hogi" kabhi nahi hota — iska matlab hai ki yog ko samay ' +
  'aur upay ka sahara chahiye. Hum jeevansaathi ki jaati, dharm, desh ya ling ke baare mein koi ' +
  'bhavishyavani nahi karte, aur na hi talaak ya vaidhavya se judi koi baat batate hain.';

// ── Band thresholds ──────────────────────────────────────────────────────────
//
// Measured, not borrowed. Santan needed its own cut points because its blocks
// award full marks for a chart that is merely CLEAN, which pushed its median
// well above the older engines. Vivah is scored the same way, so the same
// distribution check was run — see the note beside SIMULATED_DISTRIBUTION.
const VIVAH_VERY_STRONG = 70;
const VIVAH_STRONG = 60;
const VIVAH_MODERATE = 46;

function vivahBand(score: number): { band: YogResult['band']; bandHi: string } {
  if (score >= VIVAH_VERY_STRONG) return { band: 'Very Strong', bandHi: 'बहुत प्रबल' };
  if (score >= VIVAH_STRONG) return { band: 'Strong', bandHi: 'प्रबल' };
  if (score >= VIVAH_MODERATE) return { band: 'Moderate', bandHi: 'मध्यम' };
  return { band: 'Weak', bandHi: 'कमज़ोर' };
}

const BENEFIC = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const MALEFIC_IN_HOUSE = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];

/** Mangal Dosh houses, counted from the lagna. */
const MANGAL_HOUSES = [1, 4, 7, 8, 12];

/** Combustion orbs in degrees, BPHS. */
const COMBUST_ORB: Record<string, number> = {
  Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15,
};

/** Classical graha remedies. Mantra, daan, day. Used by the BPHS upay. */
const PLANET_REMEDY: Record<string, { mantra: string; daan: string; vaar: string; rang: string }> = {
  Sun:     { mantra: 'ॐ घृणिः सूर्याय नमः',   daan: 'gehu, gud, tamba',             vaar: 'Ravivar',   rang: 'laal' },
  Moon:    { mantra: 'ॐ सों सोमाय नमः',       daan: 'chawal, doodh, chandi',        vaar: 'Somvar',    rang: 'safed' },
  Mars:    { mantra: 'ॐ अं अंगारकाय नमः',     daan: 'masoor dal, gud, tamba',       vaar: 'Mangalvar', rang: 'laal' },
  Mercury: { mantra: 'ॐ बुं बुधाय नमः',        daan: 'moong dal, hari sabzi',        vaar: 'Budhvar',   rang: 'hara' },
  Jupiter: { mantra: 'ॐ बृं बृहस्पतये नमः',    daan: 'chana dal, haldi, kesar',      vaar: 'Guruvar',   rang: 'peela' },
  Venus:   { mantra: 'ॐ शुं शुक्राय नमः',      daan: 'chawal, mishri, safed vastra', vaar: 'Shukravar', rang: 'safed' },
  Saturn:  { mantra: 'ॐ शं शनैश्चराय नमः',    daan: 'kala til, sarson ka tel',      vaar: 'Shanivar',  rang: 'kaala' },
  Rahu:    { mantra: 'ॐ रां राहवे नमः',        daan: 'kambal, kale til, nariyal',    vaar: 'Shanivar',  rang: 'dhuandhla' },
  Ketu:    { mantra: 'ॐ कें केतवे नमः',        daan: 'kambal, tirangi vastra',       vaar: 'Mangalvar', rang: 'chitkabra' },
};

/**
 * KALATRA KARAKA — the one place gender changes the reading.
 *
 * Classical rule: Venus is the karaka of the wife, Jupiter of the husband. So
 * a man's marriage is read from Venus and a woman's from Jupiter. Rohiit's
 * instruction, 3 Sep 2026: "always ask for Gender for accurate results", and
 * the form makes it required for this calculator alone.
 *
 * When gender is absent or 'other', Venus is used and the reason line says so
 * rather than pretending. Silently picking one and calling it classical would
 * be the dishonest option.
 */
function kalatraKaraka(gender?: string | null): { planet: string; note: string } {
  const g = (gender ?? '').toLowerCase();
  if (g === 'female') {
    return { planet: 'Jupiter', note: 'stri ke liye shastra Guru ko pati-karak maanta hai' };
  }
  if (g === 'male') {
    return { planet: 'Venus', note: 'purush ke liye shastra Shukra ko patni-karak maanta hai' };
  }
  return {
    planet: 'Venus',
    note: 'gender nahi diya gaya, isliye Shukra liya gaya hai — gender dene par ye reading aur sateek hoti hai',
  };
}

function sep(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function isCombust(data: CalcData, name: string | null): { yes: boolean; deg: number | null } {
  const p = planet(data, name);
  const sun = planet(data, 'Sun');
  if (!p || !sun || name === 'Sun') return { yes: false, deg: null };
  if (typeof p.longitude !== 'number' || typeof sun.longitude !== 'number') return { yes: false, deg: null };
  const orb = COMBUST_ORB[p.planet];
  if (!orb) return { yes: false, deg: null };
  const d = sep(p.longitude, sun.longitude);
  return { yes: d <= orb, deg: Math.round(d * 100) / 100 };
}

function houseFrom(base: number, n: number): number {
  return ((base + n - 2) % 12) + 1;
}

function signOfHouse(data: CalcData, house: number): string | null {
  return data.houses.find((h) => h.house === house)?.sign ?? null;
}

function hasNavamsa(data: CalcData): boolean {
  return Boolean(data.navamsa?.grahas?.length);
}

/**
 * Rule label -> ordinary Hinglish, in both directions.
 *
 * Built at the same time as the rules, not bolted on afterwards. In Santan
 * this map arrived late and a live summary told a reader that "santan graha ki
 * dasha" was BLOCKING her — when the rule scoring zero actually means the
 * current period does not belong to those grahas. Same class of error is
 * pre-empted here.
 */
const PLAIN: Record<string, { up: string; down: string }> = {
  '7th lord ki taakat': {
    up: 'vivah bhava ka swami mazboot hai',
    down: 'vivah bhava ka swami abhi kamzor hai',
  },
  '7th house mein graha': {
    up: 'vivah ke ghar mein shubh graha baithe hain',
    down: 'vivah ke ghar par paap grahon ka dabaav hai',
  },
  '7th lord ki sthiti': {
    up: 'vivah ka swami achhe sthaan par hai',
    down: 'vivah ka swami kamzor sthaan par chala gaya hai',
  },
  'D-9 lagna lord': {
    up: 'vivah ki apni kundali ka aadhaar mazboot hai',
    down: 'vivah ki apni kundali ka aadhaar kamzor hai',
  },
  'D-9 ka saptam bhava': {
    up: 'vivah ki apni kundali saath de rahi hai',
    down: 'vivah ki apni kundali utna saath nahi de rahi',
  },
  'Rasi 7th lord D-9 mein mazboot': {
    up: 'dono kundaliyan ek hi baat keh rahi hain',
    down: 'mukhya kundali ka vaada doosri kundali confirm nahi kar rahi',
  },
  'D-9 vishleshan': {
    up: 'vivah ki apni kundali padhi ja chuki hai',
    down: 'vivah ki apni kundali is samay padhi nahi ja saki',
  },
  'Karaka ki taakat': { up: 'vivah ka karak graha mazboot hai', down: 'vivah ka karak graha abhi kamzor hai' },
  'Karaka ki sthiti': {
    up: 'vivah ka karak achhe ghar mein baitha hai',
    down: 'vivah ka karak aise ghar mein hai jahan wo apna phal der se deta hai',
  },
  'Karaka vargottama (D-1 ↔ D-9)': {
    up: 'karak ko dohri taakat mili hai',
    down: 'karak ko wo extra sahara nahi mila',
  },
  'Shubh drishti saptam par': {
    up: 'shubh grahon ki nazar vivah ke ghar par hai',
    down: 'shubh grahon ki nazar vivah ke ghar par nahi padti',
  },
  'Paap drishti ka dabaav': {
    up: 'vivah ke ghar par koi bhaari dabaav nahi hai',
    down: 'vivah ke ghar par kuch grahon ka bhaari dabaav hai',
  },
  'Drishti vishleshan': {
    up: 'grahon ki nazar ka hisaab ho chuka hai',
    down: 'grahon ki nazar ka hisaab is samay nahi mil paya',
  },
  'DK ki taakat aur sthiti': {
    up: 'jeevansaathi ka doosra karak graha mazboot hai',
    down: 'jeevansaathi ka doosra karak graha kamzor hai',
  },
  'DK se saptam': {
    up: 'us karak se bhi vivah ka ghar saath de raha hai',
    down: 'us karak se vivah ka ghar kamzor hai',
  },
  'Shani ka saptam par asar': {
    up: 'Shani vivah ke ghar par dabaav nahi daal raha',
    down: 'Shani vivah ke ghar par hai, jo samay lamba karta hai',
  },
  'Mangal Dosh': {
    up: 'aapke chart mein Mangal Dosh nahi hai',
    down: 'aapke chart mein Mangal Dosh ka yog ban raha hai',
  },
  '7th lord asta ya vakri': {
    up: 'vivah ka swami apna phal dene ki halat mein hai',
    down: 'vivah ka swami Surya ke taap mein dabaa hua hai',
  },
  'Vivah graha ki dasha': {
    up: 'abhi jo daur chal raha hai wo vivah grahon ka hai',
    down: 'abhi jo daur chal raha hai wo vivah grahon ka nahi hai',
  },
};

function plain(label: string, dir: 'up' | 'down'): string {
  return PLAIN[label]?.[dir] ?? label;
}

// ── Verdict ──────────────────────────────────────────────────────────────────

/**
 * Cut points are the bands above, so verdict and band can never disagree.
 * The lowest verdict says DERI, not "kathin" and certainly not "nahi" —
 * classical Sanskrit for this condition is vilamba, delay, and delay is both
 * what the texts actually claim and the truthful thing to tell someone.
 */
function verdictFor(score: number): VivahVerdict {
  if (score >= VIVAH_VERY_STRONG) {
    return {
      key: 'haan',
      label: 'Haan — vivah yog prabal hai',
      labelHi: 'हाँ — विवाह योग प्रबल है',
      line: 'Aapki kundali vivah ke maamle mein saath de rahi hai. Jo cheezein is baat ko sambhalti hain, wo aapke chart mein mazboot hain.',
    };
  }
  if (score >= VIVAH_MODERATE) {
    return {
      key: 'sambhavna',
      label: 'Sambhavna hai — samay aur upay chahiye',
      labelHi: 'संभावना है — समय और उपाय चाहिए',
      line: 'Yog aapki kundali mein maujood hai, par abhi uspar kuch dabaav bhi hai. Aise chart mein baat samay par bhi nirbhar karti hai, aur upay se rasta khulta hai.',
    };
  }
  return {
    key: 'deri',
    label: 'Abhi deri hai — yog par rukavat hai',
    labelHi: 'अभी देरी है — योग पर रुकावट है',
    line: 'Is samay aapke chart par kaafi dabaav dikh raha hai, aur uska seedha matlab deri hai — inkaar nahi. Shastra is sthiti ko vilamba kehta hai, aur vilamba ka ilaaj samay aur upay dono se hota hai.',
  };
}

// ── Windows ──────────────────────────────────────────────────────────────────

/**
 * How far ahead a window is worth printing, in years from birth.
 *
 * Santan shipped a live report showing a reader born in 2004 windows starting
 * in 2080 and 2094. Arithmetically correct, completely useless. Marriage gets
 * a tighter horizon than progeny did because a marriage window at 70 is not
 * information, it is noise.
 */
const WINDOW_HORIZON_YEARS = 50;

function buildWindows(
  timeline: DashaPeriod[] | undefined,
  keyPlanets: string[],
  birthYear?: number,
): VivahWindow[] {
  if (!Array.isArray(timeline) || !timeline.length) return [];
  const today = new Date();
  const maxStartYear = (birthYear ?? today.getUTCFullYear()) + WINDOW_HORIZON_YEARS;
  const ageAt = (iso: string) => (birthYear ? Number(String(iso).slice(0, 4)) - birthYear : null);
  const todayISO = today.toISOString().slice(0, 10);

  /**
   * CAUGHT IN TESTING, 3 Sep 2026, before this ever shipped.
   *
   * A 19-year Mahadasha that began in 2017 and runs to 2036 is a FAVOURABLE
   * window that is running RIGHT NOW. Filtering only on "has it ended" let it
   * through with its original 2017 start date, so a reader born in 1988 — 38
   * today — was shown "age 29", and the age band derived from it read 29-35,
   * an age she passed years ago.
   *
   * A window already under way is clamped to today. The reader can only act on
   * the part that is left, and the age band must be the age she is now.
   * lib/santan-engine.ts carries the same clamp for the same reason.
   */
  const clampStart = (iso: string) => (iso < todayISO ? todayISO : iso);
  const running = (iso: string) => iso < todayISO;
  const out: VivahWindow[] = [];

  for (const maha of timeline) {
    if (!maha?.start || !maha?.end) continue;
    if (new Date(maha.end) < today) continue;
    if (Number(String(maha.start).slice(0, 4)) > maxStartYear) continue;

    if (keyPlanets.includes(maha.planet)) {
      const from = clampStart(String(maha.start).slice(0, 10));
      out.push({
        label: `${PLANET_HI[maha.planet] ?? maha.planet} Mahadasha`,
        from,
        to: String(maha.end).slice(0, 10),
        age: ageAt(from),
        why: `${PLANET_HI[maha.planet] ?? maha.planet} aapke vivah grahon mein hai, isliye ye poora daur anukool mana jata hai.` +
          (running(String(maha.start).slice(0, 10)) ? ' Ye daur abhi chal raha hai — neeche di gayi tareekh aaj se aage ka bacha hua hissa hai.' : ''),
      });
    }

    for (const antar of maha.antar ?? []) {
      if (!antar?.start || !antar?.end) continue;
      if (new Date(antar.end) < today) continue;
      if (Number(String(antar.start).slice(0, 4)) > maxStartYear) continue;
      if (!keyPlanets.includes(antar.planet)) continue;
      if (keyPlanets.includes(maha.planet) && maha.planet === antar.planet) continue;
      const aFrom = clampStart(String(antar.start).slice(0, 10));
      out.push({
        label: `${PLANET_HI[maha.planet] ?? maha.planet} — ${PLANET_HI[antar.planet] ?? antar.planet}`,
        from: aFrom,
        to: String(antar.end).slice(0, 10),
        age: ageAt(aFrom),
        why: `${PLANET_HI[antar.planet] ?? antar.planet} ki antardasha — ye chhoti aur teekhi khidki hoti hai, isliye ispar nazar rakhiye.` +
          (running(String(antar.start).slice(0, 10)) ? ' Ye khidki abhi chal rahi hai.' : ''),
      });
    }
  }

  out.sort((a, b) => a.from.localeCompare(b.from));
  return out.slice(0, 4);
}

/**
 * The age band — the answer to "kis umar mein", which GSC shows as a real
 * query ("late marriage age in astrology", "what age will i get married")
 * with no page of ours currently serving it.
 *
 * It is computed, not guessed: the first favourable window's start and end,
 * expressed as the reader's age. Null when the birth year or the windows are
 * missing — an invented age band would be the worst possible thing to print.
 */
function umarRange(windows: VivahWindow[], birthYear?: number): VivahUmar | null {
  if (!birthYear || !windows.length) return null;
  const w = windows[0];
  const from = Number(w.from.slice(0, 4)) - birthYear;
  const to = Number(w.to.slice(0, 4)) - birthYear;
  if (!Number.isFinite(from) || !Number.isFinite(to) || from < 0) return null;
  // `w.from` is already clamped to today by buildWindows, so `from` is the
  // reader's age NOW when the window is running, not the age it began at.
  const lo = Math.max(18, from);
  const hi = Math.max(lo + 1, Math.min(to, lo + 6));
  return {
    from: lo,
    to: hi,
    basis:
      `Ye aapki pehli anukool dasha khidki (${w.label}) ko aapki umar mein badal kar nikala gaya hai. ` +
      `Ye ek window hai, koi tay tareekh nahi — aur agar us dauran prayas na ho, to yog agli khidki ka intezaar karta hai.`,
  };
}

// ── Trikaal Upay ─────────────────────────────────────────────────────────────

/**
 * Five upay: 2 BPHS, 2 Bhrigu, 1 Shadbala — the split Rohiit set.
 *
 * The `used` set spans ALL FIVE slots from the start. Santan learned this the
 * expensive way: on a chart where the 5th lord, the karaka and the Putrakaraka
 * were all one graha, a paying customer got the same mantra four times out of
 * five. Here the 7th lord, the Kalatra Karaka and the Darakaraka collide just
 * as often.
 *
 * HONEST LABELLING. The two marked Bhrigu are karaka-chain remedies in the
 * BHRIGU NANDI NADI STYLE, derived from this chart. They are NOT verbatim
 * quotations from a Bhrigu text held in hand and must never be advertised as
 * such. The Shadbala one is pure computation.
 */
function buildUpay(
  data: CalcData,
  ctx: {
    l7: string | null;
    karaka: string;
    DK: string | null;
    manglik: boolean;
    saturnOn7: boolean;
    combustL7: boolean;
    d9LagnaLord: string | null;
  },
): TrikaalUpay[] {
  const out: TrikaalUpay[] = [];
  const used = new Set<string>();
  let subCount = 0;
  const NODES = ['Rahu', 'Ketu'];

  /**
   * When a slot's natural graha is already spoken for, fall to a graha sitting
   * in the 7TH HOUSE; if the 7th is empty, to the Navamsa lagna lord; and only
   * then to the weakest unused graha. Nodes are excluded at every tier — a
   * node on the 7th is an affliction to pacify, not a graha to strengthen.
   */
  function substitute(): { pl: string; basis: string } | null {
    const inSeventh = data.planets
      .filter((x) => x.house === 7 && PLANET_REMEDY[x.planet] && !used.has(x.planet) && !NODES.includes(x.planet))
      .map((x) => ({ pl: x.planet, r: ratio(x) ?? 1 }))
      .sort((a, b) => a.r - b.r);
    if (inSeventh.length) {
      subCount += 1;
      return { pl: inSeventh[0].pl, basis: 'wo aapke saptam bhava mein khud baitha hai' };
    }
    if (ctx.d9LagnaLord && PLANET_REMEDY[ctx.d9LagnaLord] && !used.has(ctx.d9LagnaLord) && !NODES.includes(ctx.d9LagnaLord)) {
      subCount += 1;
      return {
        pl: ctx.d9LagnaLord,
        basis: 'aapka saptam bhava khaali hai, isliye vivah ki apni kundali ka lagnesh liya gaya hai',
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

  function body(pl: string) {
    const r = PLANET_REMEDY[pl];
    return {
      what: `${r.mantra} — 108 baar. Daan: ${r.daan}. ${r.rang} rang dharan karein.`,
      when: `Har ${r.vaar}, subah snan ke baad, ek hi samay par.`,
    };
  }

  // ── BPHS 1 — the Saptamesh ──
  if (ctx.l7 && PLANET_REMEDY[ctx.l7]) {
    used.add(ctx.l7);
    out.push({
      n: 1, source: 'BPHS',
      title: `Saptamesh ${PLANET_HI[ctx.l7]} ka upay`,
      ...body(ctx.l7),
      why: `Aapke chart mein vivah ka swami ${PLANET_HI[ctx.l7]} hai. Isiliye aam "shadi ka upay" aap par kaam nahi karega — upay usi graha ka hona chahiye jo aapki kundali mein ye bhava sambhalta hai.`,
    });
  }

  // ── BPHS 2 — the Kalatra Karaka, or a substitute when it is already used ──
  if (!used.has(ctx.karaka) && PLANET_REMEDY[ctx.karaka]) {
    used.add(ctx.karaka);
    const rk = PLANET_REMEDY[ctx.karaka];
    out.push({
      n: out.length + 1, source: 'BPHS',
      title: `Kalatra Karaka ${PLANET_HI[ctx.karaka]} ka upay`,
      what: `${rk.mantra} — 108 baar. Daan: ${rk.daan}.`,
      when: `Har ${rk.vaar}. Niyamitta sankhya se zyada mayne rakhti hai.`,
      why: `${PLANET_HI[ctx.karaka]} aapke liye vivah ka karak graha hai. Saptam bhava chahe kitna bhi achha ho, kamzor karak uska phal der se deta hai.`,
    });
  } else {
    const sub = substitute();
    if (sub) {
      used.add(sub.pl);
      out.push({
        n: out.length + 1, source: 'BPHS',
        title: `${PLANET_HI[sub.pl]} ka upay`,
        ...body(sub.pl),
        why: `Aapke chart mein ${PLANET_HI[ctx.karaka]} khud hi saptam bhava ka swami hai — yaani karak aur swami, dono bhoomikayein ek hi graha par. Uska upay upar aa chuka hai, isliye doosra upay ${PLANET_HI[sub.pl]} par rakha gaya hai: ${sub.basis}.`,
      });
    }
  }

  // ── Bhrigu 1 — the Darakaraka, or a substitute ──
  if (ctx.DK && PLANET_REMEDY[ctx.DK] && !used.has(ctx.DK)) {
    used.add(ctx.DK);
    const rdk = PLANET_REMEDY[ctx.DK];
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: `Darakaraka ${PLANET_HI[ctx.DK]} ki upasana`,
      what: `${rdk.mantra} ka jaap, aur ${PLANET_HI[ctx.DK]} se judi vastu ka daan (${rdk.daan}).`,
      when: `Har ${rdk.vaar}.`,
      why: `Karak-paddhati mein aapka Darakaraka ${PLANET_HI[ctx.DK]} hai — ye har kundali mein badalta hai, aur isi wajah se ye upay sirf aapke chart ka hai.`,
    });
  } else {
    const sub = substitute();
    if (sub) {
      used.add(sub.pl);
      out.push({
        n: out.length + 1, source: 'Bhrigu',
        title: `${PLANET_HI[sub.pl]} ki upasana`,
        ...body(sub.pl),
        why: `Aapka Darakaraka ${ctx.DK ? PLANET_HI[ctx.DK] : 'wahi graha'} hai, jiska upay upar aa chuka hai — aapke chart mein do bhoomikayein ek hi graha par aa gayi hain. Isliye ye upay ${PLANET_HI[sub.pl]} par hai: ${sub.basis}.`,
      });
    }
  }

  // ── Bhrigu 2 — the biggest actual blocker in THIS chart ──
  if (ctx.manglik) {
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: 'Mangal ki shanti',
      what: 'Mangalvar ka vrat, Hanuman ji ki upasana, aur masoor dal ya gud ka daan.',
      when: 'Har Mangalvar.',
      why: 'Aapke chart mein Mangal Dosh ka yog ban raha hai. Ye rukavat hai, ashubh phal ki ghoshna nahi — aur shastra khud iske nivaran ke niyam deta hai, jinme sabse pehla Mangal ko shant karna hai.',
    });
  } else if (ctx.saturnOn7) {
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: 'Shani ko shant karna',
      what: 'Kale til aur sarson ka tel daan, Hanuman Chalisa ka niyam, aur shramikon ki seva.',
      when: 'Har Shanivar, suryast ke baad.',
      why: 'Shani aapke saptam bhava par hai. Wo mana nahi karta — wo samay lamba karta hai; isliye upay ka maqsad rasta kholna nahi, intezaar ko chhota karna hai.',
    });
  } else if (ctx.combustL7) {
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: 'Asta saptamesh ko bal dena',
      what: `Surya ko arghya, aur ${ctx.l7 ? PLANET_HI[ctx.l7] : 'saptamesh'} ka mantra jaap.`,
      when: 'Suryoday ke samay, roz.',
      why: 'Aapka saptamesh Surya ke bahut paas hai — yaani asta. Karak-paddhati kehti hai asta graha ka yog maujood rehta hai par dabaa hua, jab tak uski dasha na aaye.',
    });
  } else {
    const k = planet(data, ctx.karaka);
    out.push({
      n: out.length + 1, source: 'Bhrigu',
      title: 'Karak ke swami ko bal dena',
      what: 'Karak graha jis rashi mein hai, us rashi ke swami ka mantra aur uska daan.',
      when: `Us graha ke vaar par.${k ? ` Aapka ${PLANET_HI[ctx.karaka]} ${k.sign} mein hai.` : ''}`,
      why: 'Aapke chart par koi bhaari dosh nahi hai, isliye karak-paddhati agla kadam yahi bataati hai — karak ke aashray ko mazboot karna, taaki jo yog hai wo bina rukavat chale.',
    });
  }

  // ── Shadbala — pure computation, and never a repeat ──
  const trio = [ctx.l7, ctx.karaka, ctx.DK].filter(Boolean) as string[];
  const ranked = trio
    .map((pl) => ({ pl, r: ratio(planet(data, pl)) }))
    .filter((x): x is { pl: string; r: number } => x.r !== null)
    .sort((a, b) => a.r - b.r);
  const chosen = ranked.find((x) => !used.has(x.pl)) ?? null;

  if (chosen) {
    used.add(chosen.pl);
    const rw = PLANET_REMEDY[chosen.pl];
    // A ratio above 1.00 is NOT weak. Santan once printed "sabse kamzor — 1.18"
    // on a page that called 1.18 "mazboot" three times over.
    const weakAbs = chosen.r < 1;
    out.push({
      n: out.length + 1, source: 'Shadbala',
      title: weakAbs
        ? `Sabse kamzor vivah graha — ${PLANET_HI[chosen.pl]}`
        : `Teen mein sabse kam bal — ${PLANET_HI[chosen.pl]}`,
      what: `${rw.mantra}, ${rw.daan} ka daan, aur ${rw.rang} rang.`,
      when: `Har ${rw.vaar}, kam se kam 40 din lagataar.`,
      why: weakAbs
        ? `Aapke teen vivah grahon mein ${PLANET_HI[chosen.pl]} ki Shadbala sabse kam hai — ${chosen.r.toFixed(2)}, jo 1.00 ke shastriya न्यूनतम se neeche hai. Ye upay kisi kitab se nahi, aapke apne chart ki ganit se nikla hai.`
        : `Aapke teen vivah grahon mein ${PLANET_HI[chosen.pl]} ka bal sabse kam hai — Shadbala ${chosen.r.toFixed(2)}. Ye 1.00 ke shastriya न्यूनतम se upar hai, yaani kamzor nahi; bas teenon mein sabse peeche. Ye upay kisi kitab se nahi, aapke apne chart ki ganit se nikla hai.`,
    });
  } else {
    const sub = substitute();
    if (sub) {
      used.add(sub.pl);
      out.push({
        n: out.length + 1, source: 'Shadbala',
        title: `Bal badhane ke liye — ${PLANET_HI[sub.pl]}`,
        ...body(sub.pl),
        why: `Aapke teenon vivah grahan — saptamesh, karak aur Darakaraka — ek hi graha par aa gaye hain, jiska upay upar diya ja chuka hai. Ye ek asli baat hai aapke chart ki, aur iska matlab hai ki poora bhaar ek graha par hai. Isliye paanchva upay ${PLANET_HI[sub.pl]} par rakha gaya hai: ${sub.basis}.`,
      });
    }
  }

  return out;
}

function toFacts(
  base: YogResult,
  verdict: VivahVerdict,
  umar: VivahUmar | null,
  windows: VivahWindow[],
  upay: TrikaalUpay[],
  navamsaRead: boolean,
  name: string | null,
): VivahFacts {
  return {
    name: name && name.trim() ? name.trim().split(/\s+/)[0] : null,
    verdict: verdict.label,
    verdictLine: verdict.line,
    supportedBy: (base.highlights ?? []).map((h) => plain(h.label, 'up')),
    blockedBy: (base.blockers ?? []).map((b) => plain(b.label, 'down')),
    umar: umar ? `${umar.from}-${umar.to}` : null,
    firstWindow: windows.length ? `${windows[0].label} (${windows[0].from} se ${windows[0].to})` : null,
    upayTitles: upay.map((u) => u.title),
    navamsaRead,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export function scoreVivah(
  data: CalcData,
  timeline?: DashaPeriod[],
  name?: string | null,
  birthYear?: number,
  gender?: string | null,
): VivahResult {
  const s = new ScoreSheet();
  const cap = capabilities(data);
  const { DK } = karakas(data);
  const { maha, antar } = dashaPair(data);

  const l7 = houseLord(data, 7);
  const p7 = planet(data, l7);
  const sign7 = signOfHouse(data, 7);
  const kar = kalatraKaraka(gender);
  const karP = planet(data, kar.planet);

  // ── BLOCK A — 7th bhava in the rasi chart (22) ─────────────────────────────

  if (l7 && p7) {
    const dg = dignityScore(p7);
    const r = ratio(p7);
    s.add('Saptam Bhava', '7th lord ki taakat', 12 * (dg * 0.5 + ratioScore(r) * 0.5), 12,
      `Aapka 7th house ${sign7 ?? 'unknown'} ka hai, toh vivah ka swami ${PLANET_HI[l7]} hua. ` +
      `Wo ${ord(p7.house)} house mein baitha hai, ${dignityWord(p7)}, aur uski Shadbala ` +
      `${r !== null ? r.toFixed(2) : 'available nahi'}` +
      `${r !== null ? ` (1.00 se upar mazboot mana jata hai) — yaani ${ratioWord(r)}` : ''}. ` +
      `${r !== null && r >= 1.0 && dg <= 0.4
        ? `Dhyan dijiye — bal to mazboot hai, par rashi ke hisaab se wo ${dignityWord(p7)} mein hai, aur isi wajah se poore ank nahi mile. `
        : ''}` +
      `Saptam bhava ko shastra mein Kalatra Bhava kaha gaya hai, aur uske swami ki halat vivah yog ka pehla paimana hai.`);
  } else {
    s.add('Saptam Bhava', '7th lord ki taakat', 0, 12, '7th house ka swami chart se nahi mila.');
  }

  const inSeventh = data.planets.filter((p) => p.house === 7);
  const benIn7 = inSeventh.filter((p) => BENEFIC.includes(p.planet));
  const malIn7 = inSeventh.filter((p) => MALEFIC_IN_HOUSE.includes(p.planet));

  if (benIn7.length && !malIn7.length) {
    s.add('Saptam Bhava', '7th house mein graha', 6, 6,
      `${benIn7.map((p) => PLANET_HI[p.planet]).join(' aur ')} aapke 7th house mein hai aur koi paap graha wahan nahi — ` +
      `vivah bhava saaf hai. ${benIn7.map((p) => `${PLANET_HI[p.planet]} ki Shadbala ${ratio(p)?.toFixed(2) ?? 'n/a'}`).join(', ')}.`);
  } else if (benIn7.length && malIn7.length) {
    s.add('Saptam Bhava', '7th house mein graha', 3, 6,
      `Aapke 7th house mein shubh aur paap dono hain — ${benIn7.map((p) => PLANET_HI[p.planet]).join(', ')} ` +
      `ke saath ${malIn7.map((p) => PLANET_HI[p.planet]).join(', ')}. Shastra ise mishrit phal kehta hai: yog banta hai, ` +
      `par saath mein deri ya kheenchtaan bhi aati hai.`);
  } else if (malIn7.length) {
    s.add('Saptam Bhava', '7th house mein graha', 0, 6,
      `Aapke 7th house mein ${malIn7.map((p) => PLANET_HI[p.planet]).join(' aur ')} baitha hai aur koi shubh graha wahan nahi. ` +
      `${malIn7.some((p) => p.planet === 'Saturn') ? 'Shani yahan mana nahi karta, samay lamba kar deta hai.' : 'Paap grahon ka yahan hona deri ka classical sanket hai.'}`);
  } else {
    s.add('Saptam Bhava', '7th house mein graha', 4, 6,
      `Aapka 7th house khaali hai — na koi shubh graha, na paap. Ye achha hai: ab poora phal saptamesh ` +
      `${PLANET_HI[l7 ?? '']} aur karak ${PLANET_HI[kar.planet]} par jata hai, jo neeche alag se gine gaye hain.`);
  }

  if (p7) {
    if (KENDRA.includes(p7.house) || TRIKONA.includes(p7.house)) {
      s.add('Saptam Bhava', '7th lord ki sthiti', 4, 4,
        `Vivah ka swami ${PLANET_HI[l7!]} ${ord(p7.house)} house mein hai — ` +
        `${KENDRA.includes(p7.house) ? 'kendra' : 'trikona'}. Yahan baitha lord apna phal deta hai, rokta nahi.`);
    } else if (DUSTHANA.includes(p7.house)) {
      s.add('Saptam Bhava', '7th lord ki sthiti', 0, 4,
        `Vivah ka swami ${PLANET_HI[l7!]} ${ord(p7.house)} house mein hai — dusthana (6/8/12). ` +
        `Iska matlab yog ka na hona nahi; iska matlab hai ki phal der se aur mehnat ke baad aata hai.`);
    } else {
      s.add('Saptam Bhava', '7th lord ki sthiti', 2, 4,
        `Vivah ka swami ${PLANET_HI[l7!]} ${ord(p7.house)} house mein hai — na kendra-trikona, na dusthana. Tatasth sthiti.`);
    }
  } else {
    s.add('Saptam Bhava', '7th lord ki sthiti', 0, 4, '7th lord chart mein locate nahi hua.');
  }

  // ── BLOCK B — Navamsa D-9 (24) ─────────────────────────────────────────────

  if (hasNavamsa(data) && data.navamsa) {
    const d9l = data.navamsa.lagna.sign_lord;
    const pd9 = planet(data, d9l);
    const rd9 = ratio(pd9);
    s.add('Navamsa D-9', 'D-9 lagna lord', 8 * ratioScore(rd9), 8,
      `Aapka Navamsa lagna ${data.navamsa.lagna.sign} hai, jiska swami ${PLANET_HI[d9l]} hai — ` +
      `uski Shadbala ${rd9 !== null ? rd9.toFixed(2) : 'n/a'} (${ratioWord(rd9)}). ` +
      `BPHS vivah ka nirnay Navamsa se karta hai, rasi chart se nahi — isliye ye poore score ka sabse gehra hissa hai.`);

    const d9l7 = d9HouseLord(data, 7);
    const pd97 = planet(data, d9l7);
    const rd97 = ratio(pd97);
    s.add('Navamsa D-9', 'D-9 ka saptam bhava', 10 * ratioScore(rd97), 10,
      d9l7
        ? `Navamsa ke 7th house ka swami ${PLANET_HI[d9l7]} hai, Shadbala ${rd97 !== null ? rd97.toFixed(2) : 'n/a'} (${ratioWord(rd97)}). ` +
          `Ye vivah ke andar ka vivah hai — dampatya jeevan ka sukh aur uski disha yahin se padhi jati hai.`
        : 'Navamsa ka 7th swami nahi nikal paya.');

    const g = d9(data, l7);
    if (g && (KENDRA.includes(g.house) || TRIKONA.includes(g.house))) {
      s.add('Navamsa D-9', 'Rasi 7th lord D-9 mein mazboot', 6, 6,
        `Aapka rasi 7th lord ${PLANET_HI[l7!]} Navamsa mein ${g.sign} (${ord(g.house)} house) mein hai — ` +
        `${KENDRA.includes(g.house) ? 'kendra' : 'trikona'}. Rasi ka vaada D-9 mein confirm ho raha hai, ` +
        `aur do chart ka ek hi jawab dena sabse bharosemand sanket hai.`);
    } else {
      s.add('Navamsa D-9', 'Rasi 7th lord D-9 mein mazboot', 0, 6,
        g
          ? `Rasi 7th lord ${PLANET_HI[l7!]} Navamsa mein ${ord(g.house)} house mein hai — kendra ya trikona nahi. ` +
            `Rasi chart jo vaada karta hai, D-9 use poora sahara nahi de raha.`
          : 'Rasi 7th lord Navamsa mein locate nahi hua.');
    }
  } else {
    s.add('Navamsa D-9', 'D-9 vishleshan', 0, 24,
      'Navamsa (D-9) chart is samay available nahi hai, isliye is block ke 24 point nahi diye gaye. ' +
      'Ye aapke chart ki kami nahi hai — ye hamari taraf ka data gap hai.');
  }

  // ── BLOCK C — Kalatra Karaka (18) ──────────────────────────────────────────

  const rk = ratio(karP);
  s.add('Kalatra Karaka', 'Karaka ki taakat', 8 * ratioScore(rk), 8,
    karP
      ? `${PLANET_HI[kar.planet]} aapke liye vivah ka karak graha hai — ${kar.note}. ` +
        `Aapke chart mein wo ${karP.sign} mein, ${ord(karP.house)} house mein hai, ${dignityWord(karP)}, ` +
        `Shadbala ${rk !== null ? rk.toFixed(2) : 'n/a'} (${ratioWord(rk)}). ` +
        `Saptam bhava kitna bhi achha ho, kamzor karak uska phal der se deta hai.`
      : `${PLANET_HI[kar.planet]} chart mein nahi mila.`);

  if (karP) {
    const GOOD = [1, 2, 4, 5, 7, 9, 11];
    if (GOOD.includes(karP.house)) {
      s.add('Kalatra Karaka', 'Karaka ki sthiti', 6, 6,
        `${PLANET_HI[kar.planet]} ${ord(karP.house)} house mein hai — vivah ke liye ye shubh sthaan hai` +
        `${karP.house === 7 ? ', aur 7th house mein hona to karak ka apne ghar mein hona hai' : ''}.`);
    } else if (DUSTHANA.includes(karP.house)) {
      s.add('Kalatra Karaka', 'Karaka ki sthiti', 0, 6,
        `${PLANET_HI[kar.planet]} ${ord(karP.house)} house mein hai — dusthana. Karak graha yahan ho to vivah mein ` +
        `deri ya doori dikhti hai. Ye rukavat hai, inkaar nahi.`);
    } else {
      s.add('Kalatra Karaka', 'Karaka ki sthiti', 3, 6,
        `${PLANET_HI[kar.planet]} ${ord(karP.house)} house mein hai — na shubh sthaan, na dusthana. Tatasth.`);
    }
  } else {
    s.add('Kalatra Karaka', 'Karaka ki sthiti', 0, 6, 'Karak graha ki sthiti nahi mili.');
  }

  if (cap.hasNavamsa) {
    const vg = isVargottama(data, kar.planet);
    const gk = d9(data, kar.planet);
    s.add('Kalatra Karaka', 'Karaka vargottama (D-1 ↔ D-9)', vg ? 4 : 0, 4,
      vg
        ? `${PLANET_HI[kar.planet]} vargottama hai — rasi aur Navamsa dono mein ${karP?.sign}. ` +
          `Ek hi rashi do chart mein aana karak ki taakat ko dugna kar deta hai.`
        : gk
          ? `${PLANET_HI[kar.planet]} rasi mein ${karP?.sign} aur Navamsa mein ${gk.sign} — vargottama nahi. ` +
            `Ye kami nahi hai, bas ek extra sahara nahi mila.`
          : 'Karak graha Navamsa mein locate nahi hua.');
  } else {
    s.add('Kalatra Karaka', 'Karaka vargottama (D-1 ↔ D-9)', 0, 4,
      'Navamsa available nahi, isliye vargottama check nahi ho paya.');
  }

  // ── BLOCK D — Darakaraka, Jaimini (8) ──────────────────────────────────────

  if (DK) {
    const rdk = ratio(DK);
    const good = KENDRA.includes(DK.house) || TRIKONA.includes(DK.house);
    s.add('Darakaraka', 'DK ki taakat aur sthiti', 5 * (ratioScore(rdk) * 0.6 + (good ? 0.4 : 0)), 5,
      `Jaimini ke anusaar aapka Darakaraka ${PLANET_HI[DK.planet]} hai — saat grahon mein sabse kam ansh ` +
      `(${DK.degree_in_sign?.toFixed(2) ?? 'n/a'}°) par hone ke kaaran. Wo ${ord(DK.house)} house mein hai` +
      `${good ? ' — kendra/trikona' : ''}, Shadbala ${rdk !== null ? rdk.toFixed(2) : 'n/a'} (${ratioWord(rdk)}).`);

    const fromDk7 = houseFrom(DK.house, 7);
    const ldk7 = houseLord(data, fromDk7);
    const pdk7 = planet(data, ldk7);
    const rdk7 = ratio(pdk7);
    s.add('Darakaraka', 'DK se saptam', 3 * ratioScore(rdk7), 3,
      ldk7
        ? `Darakaraka se saatva bhava aapka ${ord(fromDk7)} house hai, jiska swami ${PLANET_HI[ldk7]} hai — ` +
          `Shadbala ${rdk7 !== null ? rdk7.toFixed(2) : 'n/a'} (${ratioWord(rdk7)}). ` +
          `Jaimini paddhati mein karak se saatva bhava wahi kaam karta hai jo lagna se saatva.`
        : 'Darakaraka se saatve ka swami nahi mila.');
  } else {
    s.add('Darakaraka', 'DK ki taakat aur sthiti', 0, 5, 'Darakaraka nikala nahi ja saka.');
    s.add('Darakaraka', 'DK se saptam', 0, 3, 'Darakaraka nahi mila, isliye ye rule nahi chala.');
  }

  // ── BLOCK E — Drishti on the 7th (12, can go negative) ─────────────────────

  if (cap.hasDrishti) {
    const bd = drishtiOnHouse(data, 7, ['Jupiter', 'Venus']);
    if (bd && bd.virupas > 0) {
      s.add('Drishti', 'Shubh drishti saptam par', 6 * Math.min(1, bd.virupas / 45), 6,
        `Shubh grahon ki drishti aapke 7th house par ${bd.virupas.toFixed(2)} virupas ki hai ` +
        `(60 = poori drishti), yaani ${drishtiWord(bd.virupas)} — ${Math.round((bd.virupas / 60) * 100)}% taakat. ` +
        `Guru ya Shukra ki drishti saptam par vivah yog ka sabse shubh sanket mani gayi hai.`);
    } else {
      s.add('Drishti', 'Shubh drishti saptam par', 0, 6,
        'Guru ya Shukra ki koi drishti aapke 7th house par nahi hai. Unki sthiti upar alag se gini ja chuki hai — ye sirf drishti ka hissa hai.');
    }

    // Jupiter and Venus are excluded so the credit above is not counted twice.
    const net = netDrishtiOnHouse(data, 7, ['Jupiter', 'Venus']);
    const lordPressure = l7
      ? drishtiOnPlanet(data, l7, ['Saturn', 'Mars', 'Sun']).reduce((sum, r) => sum + r.virupas, 0)
      : 0;

    if (net >= 0 && lordPressure < 20) {
      s.add('Drishti', 'Paap drishti ka dabaav', 6, 6,
        `Aapke 7th house par shubh aur paap drishti ka net hisaab ${net >= 0 ? '+' : ''}${net.toFixed(2)} virupas hai, ` +
        `aur saptamesh ${PLANET_HI[l7 ?? '']} par Shani/Mangal/Surya ka kul dabaav sirf ${lordPressure.toFixed(2)} virupas. ` +
        `Vivah bhava par koi bhaari paap drishti nahi hai.`);
    } else {
      const heavy = Math.min(6, (Math.max(0, -net) + Math.max(0, lordPressure - 20)) / 12);
      s.add('Drishti', 'Paap drishti ka dabaav', -heavy, 6,
        `Aapke 7th house par net drishti ${net.toFixed(2)} virupas hai` +
        `${lordPressure >= 20 ? `, aur saptamesh ${PLANET_HI[l7 ?? '']} par Shani/Mangal/Surya ka dabaav ${lordPressure.toFixed(2)} virupas` : ''}. ` +
        `Paap drishti vivah yog ko todti nahi, use aage khiska deti hai — isliye timing is chart mein score se zyada mayne rakhti hai.`);
    }
  } else {
    s.add('Drishti', 'Drishti vishleshan', 0, 12, 'Drishti data is samay available nahi hai.');
  }

  // ── BLOCK F — Baadhaayein (10) ─────────────────────────────────────────────

  const saturn = planet(data, 'Saturn');
  const saturnOn7 = Boolean(saturn && saturn.house === 7);
  if (!saturnOn7) {
    s.add('Baadha', 'Shani ka saptam par asar', 4, 4,
      'Shani aapke saptam bhava mein nahi hai. Ye achhi khabar hai — Shani ka vivah bhava par baithna ' +
      'vilamba ka sabse aam classical kaaran hai.');
  } else {
    s.add('Baadha', 'Shani ka saptam par asar', 0, 4,
      `Shani aapke 7th house mein hai. Wo vivah se mana nahi karta — wo use pakne ka samay deta hai, ` +
      `aur isi wajah se aise chart mein vivah aksar apeksha se der se hota hai.`);
  }

  const mars = planet(data, 'Mars');
  const manglik = Boolean(mars && MANGAL_HOUSES.includes(mars.house));
  if (!manglik) {
    s.add('Baadha', 'Mangal Dosh', 3, 3,
      `Mangal aapke ${mars ? ord(mars.house) : '?'} house mein hai, jo Mangal Dosh ke bhavon (1, 4, 7, 8, 12) mein nahi aata. ` +
      `Aapke chart mein Mangal Dosh nahi ban raha.`);
  } else {
    s.add('Baadha', 'Mangal Dosh', 0, 3,
      `Mangal aapke ${ord(mars!.house)} house mein hai — ye Mangal Dosh ke bhavon mein se ek hai. ` +
      `Ek zaroori baat: Mangal Dosh ke nivaran ke bhi shastriya niyam hain, aur wo vivah ke liye rukavat hai, ` +
      `ashubh phal ki ghoshna nahi. Iska poora hisaab Manglik Dosh calculator alag se karta hai.`);
  }

  const comb = isCombust(data, l7);
  const retroDusthana = Boolean(p7?.is_retrograde && DUSTHANA.includes(p7.house));
  if (!comb.yes && !retroDusthana) {
    s.add('Baadha', '7th lord asta ya vakri', 3, 3,
      `Vivah ka swami ${PLANET_HI[l7 ?? '']} na Surya se asta (combust) hai` +
      `${comb.deg !== null ? ` — Surya se ${comb.deg.toFixed(2)}° door hai` : ''}, na dusthana mein vakri. ` +
      `Lord apna phal dene ki halat mein hai.`);
  } else {
    s.add('Baadha', '7th lord asta ya vakri', 0, 3,
      comb.yes
        ? `Vivah ka swami ${PLANET_HI[l7 ?? '']} Surya se sirf ${comb.deg?.toFixed(2)}° door hai — asta (combust). ` +
          `Shastra kehta hai asta graha ka yog maujood to rehta hai par uska phal dabaa hua rehta hai, jab tak uski dasha na aaye.`
        : `Vivah ka swami ${PLANET_HI[l7 ?? '']} ${ord(p7!.house)} house (dusthana) mein vakri hai — phal ulta aur der se milta hai.`);
  }

  // ── BLOCK G — Dasha window (6) ─────────────────────────────────────────────

  const keyPlanets = [l7, kar.planet, DK?.planet].filter(Boolean) as string[];
  const hit = [maha, antar].filter((x): x is string => Boolean(x) && keyPlanets.includes(x as string));
  s.add('Dasha', 'Vivah graha ki dasha', hit.length ? 6 : 0, 6,
    hit.length
      ? `${hit.map((h) => PLANET_HI[h]).join(' aur ')} abhi aapki dasha mein chal raha hai — aur yehi aapke chart ka ` +
        `vivah graha hai (saptamesh ${PLANET_HI[l7 ?? '']}, karak ${PLANET_HI[kar.planet]}, ` +
        `Darakaraka ${PLANET_HI[DK?.planet ?? '']}). Yog ko chalne ke liye uski dasha chahiye hoti hai.`
      : `Abhi ${maha ? PLANET_HI[maha] : '?'}-${antar ? PLANET_HI[antar] : '?'} chal raha hai. ` +
        `Aapke vivah grahas — saptamesh ${PLANET_HI[l7 ?? '']}, karak ${PLANET_HI[kar.planet]}, ` +
        `Darakaraka ${PLANET_HI[DK?.planet ?? '']} — abhi active nahi hain. ` +
        `Iska matlab yog kamzor hona nahi, uska samay abhi na aana hai.`);

  // ── Result ─────────────────────────────────────────────────────────────────

  const base = s.finish();
  const { band, bandHi } = vivahBand(base.score);
  const rebanded = { ...base, band, bandHi };

  const verdict = verdictFor(base.score);
  const windows = buildWindows(timeline, keyPlanets, birthYear);
  const umar = umarRange(windows, birthYear);
  const upay = buildUpay(data, {
    l7,
    karaka: kar.planet,
    DK: DK?.planet ?? null,
    manglik,
    saturnOn7,
    combustL7: comb.yes,
    d9LagnaLord: data.navamsa?.lagna?.sign_lord ?? null,
  });

  return {
    ...rebanded,
    disclaimer: VIVAH_DISCLAIMER,
    verdict,
    timing: buildTiming(data, keyPlanets, kar.planet),
    windows,
    umar,
    upay,
    facts: toFacts(rebanded, verdict, umar, windows, upay, hasNavamsa(data), name ?? null),
  };
}

// ── Timing ───────────────────────────────────────────────────────────────────

function buildTiming(data: CalcData, keyPlanets: string[], karaka: string) {
  const { maha, antar } = dashaPair(data);
  const out: { period: string; why: string }[] = [];

  if (maha) {
    out.push({
      period: `${PLANET_HI[maha]} Mahadasha (abhi chal rahi)`,
      why: keyPlanets.includes(maha)
        ? `${PLANET_HI[maha]} aapka vivah graha hai — ye mahadasha vivah yog ko seedha sahara deti hai.`
        : 'Ye mahadasha vivah ke liye tatasth hai. Asli window antardasha se banegi — neeche dekho.',
    });
  }
  if (antar) {
    out.push({
      period: `${PLANET_HI[antar]} Antardasha`,
      why: keyPlanets.includes(antar)
        ? `${PLANET_HI[antar]} aapke vivah grahon mein hai — ye antardasha sabse anukool samay hai.`
        : `${PLANET_HI[antar]} vivah grahon mein nahi hai; is antardasha mein taiyari zyada, ghatna kam.`,
    });
  }

  const k = planet(data, karaka);
  if (k) {
    out.push({
      period: `${PLANET_HI[karaka]} ka gochar saptam bhava par`,
      why: `Aapka karak graha jab aapke 7th house se gujarta hai ya us par drishti daalta hai, aur wahi samay ` +
        `anukool dasha se mil jaye, to wahi vivah yog ka sabse mazboot window banta hai.`,
    });
  }
  return out;
}
