/**
 * ============================================================
 * TRIKAL VAANI — Videsh Yog / Foreign Settlement Engine
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/foreign-settlement-engine.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Scores 100. Same discipline as the IAS engine: no rule awards a point
 * without stating its reason and the number behind it.
 *
 * Classical basis
 *   12th house — vyaya, distant lands, life away from the birthplace. The
 *                single most important house for settlement abroad.
 *    9th house — long journeys, and the bhagya that carries a person there
 *    4th house — home and homeland. A WEAK 4th supports leaving; a very
 *                strong one roots a person. This is the one place where less
 *                is more, and the engine says so out loud.
 *    3rd house — shorter journeys, initiative, the act of moving
 *        Rahu — the outsider, the unfamiliar, the crossing of boundaries.
 *                No planet matters more here.
 *        Moon — the mind's willingness to be far from home
 *
 * This is a YOG STRENGTH SCORE, not a visa prediction and not immigration
 * advice. Nothing here should be read as a legal or procedural opinion.
 * ============================================================
 */

import {
  ord,
  CalcData, ScoreSheet, YogResult,
  planet, houseLord, houseOf, ratio, ratioScore, ratioWord,
  dignityScore, dignityWord, conjunct, exchange, dashaPair,
  drishtiOnHouse, netDrishtiOnHouse, drishtiWord, capabilities,
  d10, isVargottama, PLANET_HI, KENDRA, TRIKONA,
} from './yog-engine';

export interface ForeignResult extends YogResult {
  /** Which route abroad the chart leans toward, strongest first. */
  routes: { route: string; score: number; reason: string }[];
  timing: { period: string; why: string }[];
}

export function scoreForeignSettlement(data: CalcData): ForeignResult {
  const s = new ScoreSheet();
  const cap = capabilities(data);
  const { maha, antar } = dashaPair(data);

  const l12 = houseLord(data, 12);
  const l9 = houseLord(data, 9);
  const l4 = houseLord(data, 4);
  const l3 = houseLord(data, 3);
  const p12 = planet(data, l12);
  const p9 = planet(data, l9);
  const p4 = planet(data, l4);
  const rahu = planet(data, 'Rahu');
  const moon = planet(data, 'Moon');

  // ── BLOCK A — 12th house, the house of distant lands (25) ──────────────────

  if (l12 && p12) {
    const r = ratio(p12);
    const pts = 12 * (dignityScore(p12) * 0.45 + ratioScore(r) * 0.55);
    s.add('12th House', '12th lord ki taakat', pts, 12,
      `Aapka 12th house ${data.houses.find(h => h.house === 12)?.sign} ka hai, swami ${PLANET_HI[l12]}. ` +
      `Wo ${ord(p12.house)} house mein hai, ${dignityWord(p12)}, Shadbala ${r !== null ? r.toFixed(2) : 'n/a'} (${ratioWord(r)}). ` +
      `12th house hi videsh, door desh aur janmbhoomi se door jeevan ka ghar hai — videsh yog mein iska sabse bada haath hai.`);
  } else {
    s.add('12th House', '12th lord ki taakat', 0, 12, '12th house ka swami chart se nahi mila.');
  }

  const occ12 = data.planets.filter((p) => p.house === 12 && !['Ketu'].includes(p.planet));
  if (occ12.length) {
    const hasRahu = occ12.some((p) => p.planet === 'Rahu');
    s.add('12th House', 'Graha 12th house mein', hasRahu ? 8 : 5, 8,
      `${occ12.map(p => PLANET_HI[p.planet]).join(', ')} aapke 12th house mein hai. ` +
      (hasRahu
        ? `Rahu ka 12th house mein hona videsh yog ka sabse seedha aur mazboot sanket hai.`
        : `Ye videsh ki taraf jhukav banata hai, par Rahu jitna seedha nahi.`));
  } else {
    s.add('12th House', 'Graha 12th house mein', 0, 8,
      'Aapke 12th house mein koi graha nahi baitha. Yog phir bhi ban sakta hai — 12th lord ki sthiti se.');
  }

  if (l12 && [9, 12, 3].includes(houseOf(data, l12) ?? -1)) {
    s.add('12th House', '12th lord ka yatra-sthanon se sambandh', 5, 5,
      `12th lord ${PLANET_HI[l12]} khud ${ord(houseOf(data, l12))} house mein hai — yatra aur videsh ke gharon mein. ` +
      `Ye aapas mein judte hain, jo yog ko pakka karta hai.`);
  } else {
    s.add('12th House', '12th lord ka yatra-sthanon se sambandh', 0, 5,
      `12th lord ${l12 ? PLANET_HI[l12] : '?'} ${ord(houseOf(data, l12))} house mein hai — 3/9/12 mein nahi. ` +
      `Videsh ka sambandh seedha nahi ban raha.`);
  }

  // ── BLOCK B — Rahu, the crosser of boundaries (20) ─────────────────────────

  const rahuHouse = rahu?.house ?? null;
  const rahuGood = [1, 3, 7, 9, 10, 12].includes(rahuHouse ?? -1);
  s.add('Rahu', 'Rahu ki sthiti', rahuGood ? 12 : 4, 12,
    rahuGood
      ? `Rahu aapke ${ord(rahuHouse)} house mein hai — videsh ke liye ye sabse anukool sthanon mein se ek. ` +
        `Rahu bahar ka, anjaan ka aur seemaon ko paar karne ka karak hai; videsh yog mein isse bada koi graha nahi.`
      : `Rahu aapke ${ord(rahuHouse)} house mein hai. Ye videsh ke liye 1/3/7/9/10/12 jitna anukool nahi, ` +
        `par yog poori tarah band nahi hota.`);

  const moonRahu = conjunct(data, 'Moon', 'Rahu');
  const rahuAsp = (data.drishti?.on_planets ?? []).find(
    (r) => r.from === 'Rahu' && r.to === 'Moon' && r.virupas >= 30);
  if (moonRahu || rahuAsp) {
    s.add('Rahu', 'Chandra-Rahu sambandh', 8, 8,
      moonRahu
        ? `Chandra aur Rahu dono ${ord(houseOf(data, 'Moon'))} house mein ek saath hain. Man ka door desh se juda hona — ` +
          `videsh mein basne walon ke charts mein ye baar-baar milta hai.`
        : `Rahu Chandra ko ${drishtiWord(rahuAsp!.virupas)} se dekh raha hai (${rahuAsp!.virupas} virupas). ` +
          `Man par videsh ka rang chadhta hai.`);
  } else {
    s.add('Rahu', 'Chandra-Rahu sambandh', 0, 8,
      `Chandra aur Rahu ke beech na yuti hai na asardar drishti. Man ka jhukav videsh ki taraf ` +
      `utna prabal nahi — ghar chhodne ka faisla soch-samajh kar hoga, bhaav mein bahkar nahi.`);
  }

  // ── BLOCK C — 9th house, long journeys and bhagya (15) ─────────────────────

  if (l9 && p9) {
    const r = ratio(p9);
    s.add('9th House', '9th lord ki taakat', 9 * ratioScore(r), 9,
      `9th house ka swami ${PLANET_HI[l9]} hai, ${ord(p9.house)} house mein, Shadbala ${r !== null ? r.toFixed(2) : 'n/a'} (${ratioWord(r)}). ` +
      `9th house lambi yatra aur bhagya ka ghar hai — videsh tak pahunchane wala rasta yahin se banta hai.`);
  } else {
    s.add('9th House', '9th lord ki taakat', 0, 9, '9th house ka swami nahi mila.');
  }

  const link = (l9 && houseOf(data, l9) === 12) || (l12 && houseOf(data, l12) === 9) || exchange(data, 9, 12);
  s.add('9th House', '9th-12th ka sambandh', link ? 6 : 0, 6,
    link
      ? `9th aur 12th house aapas mein jude hue hain${exchange(data, 9, 12) ? ' (parivartan yog — dono swami ek doosre ke ghar mein)' : ''}. ` +
        `Bhagya aur videsh ka milna — ye videsh yog ka classical combination hai.`
      : `9th aur 12th house ke swamiyon mein koi seedha sambandh nahi hai. Videsh ka yog kamzor nahi hai, ` +
        `par bhagya se uska jud'av seedha nahi.`);

  // ── BLOCK D — 4th house, the pull of home (12) ─────────────────────────────
  // The one block where a WEAK result scores HIGHER. Said plainly so the
  // reader is never confused by a low number reading as a good thing.

  if (l4 && p4) {
    const r4 = ratio(p4);
    const rootedness = ratioScore(r4);
    const pts = 12 * (1 - rootedness);
    s.add('4th House', 'Ghar ki pakad (ulta niyam)', pts, 12,
      `4th house ghar aur matribhoomi ka hai, iska swami ${PLANET_HI[l4]} hai — Shadbala ${r4 !== null ? r4.toFixed(2) : 'n/a'} (${ratioWord(r4)}). ` +
      `Yahan niyam ulta hai: **kamzor 4th house videsh ke liye behtar hai**, kyunki mazboot 4th insaan ko ` +
      `apni mitti se baandh deta hai. ` +
      (rootedness > 0.6
        ? `Aapka 4th mazboot hai — ghar ki pakad gehri hai, isliye is block mein kam ank mile.`
        : `Aapka 4th kamzor hai — ghar ki pakad dheeli hai, jo videsh ke liye anukool hai.`));
  } else {
    s.add('4th House', 'Ghar ki pakad (ulta niyam)', 0, 12, '4th house ka swami nahi mila.');
  }

  // ── BLOCK E — 3rd house and Moon (10) ──────────────────────────────────────

  const rMoon = ratio(moon);
  s.add('Chandra + 3rd', 'Chandra ki sthiti', 5 * ratioScore(rMoon), 5,
    `Chandra ${moon?.sign} mein ${ord(moon?.house)} house mein hai, Shadbala ${rMoon !== null ? rMoon.toFixed(2) : 'n/a'} (${ratioWord(rMoon)}). ` +
    `Chandra man hai — door desh mein tikne ke liye man ka mazboot hona zaroori hai.`);

  const l3h = houseOf(data, l3);
  s.add('Chandra + 3rd', '3rd lord ka jhukav', [9, 12].includes(l3h ?? -1) ? 5 : 0, 5,
    l3
      ? `3rd house ka swami ${PLANET_HI[l3]} ${ord(l3h)} house mein hai. ` +
        ([9, 12].includes(l3h ?? -1)
          ? `9th/12th se juda hua — chhoti yatra lambi yatra mein badalti hai.`
          : `9th ya 12th se nahi juda — pahal aur yatra ka sambandh videsh se seedha nahi.`)
      : '3rd house ka swami nahi mila.');

  // ── BLOCK F — D-10 and drishti (8) ─────────────────────────────────────────

  if (cap.hasDasamsa) {
    const g12 = d10(data, l12);
    s.add('Confirmation', 'D-10 mein 12th lord', g12 && [1, 9, 10, 12].includes(g12.house) ? 4 : 0, 4,
      g12
        ? `Dasamsa mein aapka 12th lord ${PLANET_HI[l12!]} ${g12.sign} (${ord(g12.house)} house) mein hai. ` +
          ([1, 9, 10, 12].includes(g12.house)
            ? `Ye videsh mein kaam ka yog pakka karta hai — sirf ghoomna nahi, wahan kamaana.`
            : `Career chart mein videsh ka sambandh utna spasht nahi.`)
        : 'D-10 mein 12th lord locate nahi hua.');
  } else {
    s.add('Confirmation', 'D-10 mein 12th lord', 0, 4, 'D-10 available nahi hai.');
  }

  if (cap.hasDrishti) {
    const d = drishtiOnHouse(data, 12);
    s.add('Confirmation', '12th house par drishti', d ? 4 * (d.virupas / 60) : 0, 4,
      d
        ? `${PLANET_HI[d.from]} aapke 12th house ko ${drishtiWord(d.virupas)} se dekh raha hai — ` +
          `${d.virupas} virupas, ${d.strength_pct}% taakat. Videsh sthan par sakriya dabaav.`
        : 'Aapke 12th house par koi asardar drishti nahi hai.');
  } else {
    s.add('Confirmation', '12th house par drishti', 0, 4, 'Drishti data available nahi hai.');
  }

  // ── BLOCK G — Dasha (10) ───────────────────────────────────────────────────

  const keys = [l12, l9, 'Rahu'].filter(Boolean) as string[];
  const hit = [maha, antar].filter((x): x is string => Boolean(x) && keys.includes(x!));
  s.add('Dasha', 'Videsh grahon ki dasha', hit.length ? 10 : 0, 10,
    hit.length
      ? `${hit.map(h => PLANET_HI[h]).join(' aur ')} abhi aapki dasha mein chal raha hai — ` +
        `aur yehi aapke videsh grahas hain (12th lord ${PLANET_HI[l12 ?? '']}, 9th lord ${PLANET_HI[l9 ?? '']}, Rahu). ` +
        `Videsh ka faisla in dashaon mein hi pakta hai.`
      : `Abhi ${maha ? PLANET_HI[maha] : '?'}-${antar ? PLANET_HI[antar] : '?'} chal raha hai. ` +
        `Aapke videsh grahas — 12th lord ${PLANET_HI[l12 ?? '']}, 9th lord ${PLANET_HI[l9 ?? '']}, Rahu — abhi active nahi hain. ` +
        `Yog chart mein hai; window abhi khuli nahi.`);

  return { ...s.finish(), routes: buildRoutes(data), timing: buildTiming(data, keys) };
}

// ── Which route abroad ───────────────────────────────────────────────────────

function buildRoutes(data: CalcData) {
  const out: { route: string; score: number; reason: string }[] = [];
  const l12 = houseLord(data, 12);
  const l9 = houseLord(data, 9);
  const rahu = planet(data, 'Rahu');
  const merc = planet(data, 'Mercury');
  const jup = planet(data, 'Jupiter');
  const ven = planet(data, 'Venus');
  const sat = planet(data, 'Saturn');

  out.push({
    route: 'Job / Work Visa',
    score: Math.min(100, ratioScore(ratio(planet(data, l12))) * 40 +
      ([10, 6, 2].includes(houseOf(data, l12) ?? -1) ? 30 : 0) +
      ratioScore(ratio(sat)) * 30),
    reason: `12th lord ${PLANET_HI[l12 ?? '']} ${ord(houseOf(data, l12))} house mein, aur Shani ki Shadbala ` +
      `${ratio(sat)?.toFixed(2) ?? 'n/a'}. Naukri ke rasta videsh jaane mein karma aur anushasan bolte hain.`,
  });

  out.push({
    route: 'Higher Studies / Student Visa',
    score: Math.min(100, ratioScore(ratio(jup)) * 45 + ratioScore(ratio(merc)) * 30 +
      ([4, 5, 9].includes(houseOf(data, l9) ?? -1) ? 25 : 0)),
    reason: `Guru ki Shadbala ${ratio(jup)?.toFixed(2) ?? 'n/a'} aur Budh ki ${ratio(merc)?.toFixed(2) ?? 'n/a'}. ` +
      `Shiksha ke liye videsh jaane mein Guru gyaan ka aur Budh pariksha ka karak hai.`,
  });

  out.push({
    route: 'Shaadi ke through',
    score: Math.min(100, ratioScore(ratio(ven)) * 40 +
      ([7, 12, 9].includes(houseOf(data, 'Rahu') ?? -1) ? 35 : 0) +
      (conjunct(data, 'Venus', 'Rahu') ? 25 : 0)),
    reason: conjunct(data, 'Venus', 'Rahu')
      ? `Shukra aur Rahu ek saath hain — videshi jeevansaathi ka classical yog. Iske liye alag calculator dekho.`
      : `Shukra ki Shadbala ${ratio(ven)?.toFixed(2) ?? 'n/a'} aur Rahu ${ord(rahu?.house)} house mein.`,
  });

  out.push({
    route: 'Business / Self-employed',
    score: Math.min(100, ratioScore(ratio(merc)) * 35 +
      ([7, 10, 11].includes(houseOf(data, l12) ?? -1) ? 35 : 0) + 30),
    reason: `Budh ki Shadbala ${ratio(merc)?.toFixed(2) ?? 'n/a'} aur 12th lord ka ` +
      `${ord(houseOf(data, l12))} house mein hona — vyapar ke raste videsh.`,
  });

  return out.map((r) => ({ ...r, score: Math.round(r.score) })).sort((a, b) => b.score - a.score);
}

function buildTiming(data: CalcData, keys: string[]) {
  const { maha, antar } = dashaPair(data);
  const out: { period: string; why: string }[] = [];
  if (maha) {
    out.push({
      period: `${PLANET_HI[maha]} Mahadasha (abhi chal rahi)`,
      why: keys.includes(maha)
        ? `${PLANET_HI[maha]} aapke videsh grahon mein hai — ye poori mahadasha ek khuli window hai.`
        : `Ye mahadasha videsh ke liye tatasth hai. Antardasha ya Rahu ke gochar par nazar rakho.`,
    });
  }
  if (antar) {
    out.push({
      period: `${PLANET_HI[antar]} Antardasha`,
      why: keys.includes(antar)
        ? `${PLANET_HI[antar]} aapka videsh graha hai — is antardasha mein prayaas ka phal milne ki sambhavna sabse zyada.`
        : `${PLANET_HI[antar]} videsh grahon mein nahi hai; is daur mein tayyari karo, faisla agle mein.`,
    });
  }
  return out;
}
