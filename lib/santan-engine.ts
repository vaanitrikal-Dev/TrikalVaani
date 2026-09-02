/**
 * ============================================================
 * TRIKAL VAANI — Santan Yog Engine
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/santan-engine.ts
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

export interface SantanResult extends YogResult {
  /** Dasha periods that support santan yog. Paid tier. */
  timing: { period: string; why: string }[];
  /** Chart-specific upay directions. Paid tier. Never medical. */
  directionHints: { hint: string; reason: string }[];
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

// ─────────────────────────────────────────────────────────────────────────────

export function scoreSantan(data: CalcData): SantanResult {
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
  return {
    ...base,
    band,
    bandHi,
    // The shared disclaimer has no medical sentence; santan must carry one.
    disclaimer: SANTAN_DISCLAIMER,
    timing: buildTiming(data, keyPlanets),
    directionHints: buildHints(data, { l5, PK: PK?.planet ?? null, nodeInFifth: nodeInFifth.length > 0, pitra: pitraSignals.length > 0 }),
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

// ── Upay direction (never medical) ───────────────────────────────────────────

function buildHints(
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
