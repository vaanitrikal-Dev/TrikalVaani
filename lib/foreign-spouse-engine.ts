/**
 * ============================================================
 * TRIKAL VAANI — Foreign Spouse / NRI Marriage Yog Engine
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/foreign-spouse-engine.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Scores 100. Same rule as the other two engines: points and reason are
 * awarded in one call, so the score can never drift from the explanation.
 *
 * Classical basis
 *    7th house  — the spouse. Everything starts here.
 *    D-9 Navamsa — marriage is judged in the Navamsa the way career is judged
 *                  in the Dasamsa. A 7th-house promise the Navamsa does not
 *                  confirm is a weak promise, and the engine scores it that way.
 *   12th house  — distant lands. Its link to the 7th is what turns "marriage"
 *                  into "marriage far from home".
 *   Darakaraka  — Jaimini's spouse significator, the LOWEST degree of the seven
 *        Rahu   — the outsider. Rahu touching the 7th is the single most
 *                  quoted signal for a spouse from another culture.
 *       Venus   — the karaka of marriage itself
 *
 * WHERE THIS ENDS
 * ---------------
 * This measures the yog for a spouse from another country or culture. It says
 * nothing about whether a particular match will work — that is Kundali Milan,
 * and the result hands over to it rather than pretending to answer it.
 * ============================================================
 */

import {
  ord,
  CalcData, ScoreSheet, YogResult,
  planet, houseLord, houseOf, ratio, ratioScore, ratioWord,
  dignityScore, dignityWord, karakas, conjunct, exchange, dashaPair,
  drishtiOnHouse, drishtiOnPlanet, drishtiWord, capabilities,
  d9, d9HouseLord, isVargottama, PLANET_HI, KENDRA,
} from './yog-engine';

export interface SpouseResult extends YogResult {
  /** Where the spouse is likely to come from, in broad terms. */
  directionHints: { hint: string; reason: string }[];
  timing: { period: string; why: string }[];
  /** The handoff. This engine deliberately stops short of compatibility. */
  nextStep: { title: string; body: string; href: string; price: string };
}

export function scoreForeignSpouse(data: CalcData): SpouseResult {
  const s = new ScoreSheet();
  const cap = capabilities(data);
  const { DK } = karakas(data);
  const { maha, antar } = dashaPair(data);

  const l7 = houseLord(data, 7);
  const l12 = houseLord(data, 12);
  const p7 = planet(data, l7);
  const ven = planet(data, 'Venus');
  const rahu = planet(data, 'Rahu');

  // ── BLOCK A — 7th house, the spouse (20) ───────────────────────────────────

  if (l7 && p7) {
    const r = ratio(p7);
    s.add('7th House', '7th lord ki taakat', 10 * (dignityScore(p7) * 0.45 + ratioScore(r) * 0.55), 10,
      `Aapka 7th house ${data.houses.find(h => h.house === 7)?.sign} ka hai, swami ${PLANET_HI[l7]}. ` +
      `Wo ${ord(p7.house)} house mein hai, ${dignityWord(p7)}, Shadbala ${r !== null ? r.toFixed(2) : 'n/a'} (${ratioWord(r)}). ` +
      `7th house jeevansaathi ka ghar hai — har shaadi ka yog yahin se shuru hota hai.`);
  } else {
    s.add('7th House', '7th lord ki taakat', 0, 10, '7th house ka swami chart se nahi mila.');
  }

  // The core rule: the 7th must reach the houses of distance.
  const l7h = houseOf(data, l7);
  const far = [12, 9].includes(l7h ?? -1);
  const swap = exchange(data, 7, 12) || exchange(data, 7, 9);
  s.add('7th House', '7th lord ka videsh se sambandh', far || swap ? 10 : 0, 10,
    far || swap
      ? `Aapka 7th lord ${PLANET_HI[l7!]} ${swap ? 'parivartan yog mein videsh sthan se juda hai' : `${ord(l7h)} house mein baitha hai`} — ` +
        `yaani jeevansaathi ka ghar door desh ke ghar se jud raha hai. **Yehi videshi jeevansaathi ka mool yog hai.**`
      : `Aapka 7th lord ${PLANET_HI[l7 ?? '?']} ${ord(l7h)} house mein hai — 9th ya 12th mein nahi. ` +
        `Shaadi ka yog apni jagah hai, par usme door desh ka rang seedha nahi dikh raha.`);

  // ── BLOCK B — Navamsa D-9, where marriage is actually judged (22) ──────────

  if (cap.hasNavamsa && data.navamsa) {
    const d9l = data.navamsa.lagna.sign_lord;
    const pd9 = planet(data, d9l);
    s.add('Navamsa D-9', 'D-9 lagna lord', 7 * ratioScore(ratio(pd9)), 7,
      `Aapka Navamsa lagna ${data.navamsa.lagna.sign} hai, swami ${PLANET_HI[d9l]}, ` +
      `Shadbala ${ratio(pd9)?.toFixed(2) ?? 'n/a'} (${ratioWord(ratio(pd9))}). ` +
      `Shaadi Navamsa mein padhi jati hai, jaise career Dasamsa mein — rasi chart akela kaafi nahi.`);

    const d9l7 = d9HouseLord(data, 7);
    const pd97 = planet(data, d9l7);
    s.add('Navamsa D-9', 'D-9 ka 7th lord', 8 * ratioScore(ratio(pd97)), 8,
      d9l7
        ? `Navamsa ke 7th house ka swami ${PLANET_HI[d9l7]} hai, Shadbala ${ratio(pd97)?.toFixed(2) ?? 'n/a'} (${ratioWord(ratio(pd97))}). ` +
          `Ye jeevansaathi ka asli sanket hai — rasi ke 7th se bhi gehra.`
        : 'Navamsa ka 7th swami nahi nikal paya.');

    const g = d9(data, l7);
    const conf = g && (KENDRA.includes(g.house) || [9, 12].includes(g.house));
    s.add('Navamsa D-9', 'Rasi 7th lord D-9 mein', conf ? 7 : 0, 7,
      g
        ? `Rasi ka 7th lord ${PLANET_HI[l7!]} Navamsa mein ${g.sign} (${ord(g.house)} house) mein hai` +
          (g.vargottama ? ' aur **vargottama** hai — D-1 aur D-9 dono mein ek hi rashi, ye bahut mazboot mana jata hai' : '') +
          `. ` + (conf
            ? `Navamsa rasi ke vaade ko confirm kar raha hai.`
            : `Navamsa is vaade ko confirm nahi kar raha — yahi wo jaanch hai jo zyadatar sites chhod deti hain.`)
        : 'Rasi 7th lord Navamsa mein locate nahi hua.');
  } else {
    s.add('Navamsa D-9', 'D-9 vishleshan', 0, 22,
      'Navamsa chart is samay available nahi hai. Shaadi ka sahi vishleshan iske bina adhoora rehta hai.');
  }

  // ── BLOCK C — Rahu, the outsider (18) ──────────────────────────────────────

  const rahu7 = rahu?.house === 7;
  const rahuAsp7 = drishtiOnHouse(data, 7, ['Rahu']);
  if (rahu7) {
    s.add('Rahu', 'Rahu ka 7th se sambandh', 12, 12,
      `Rahu seedha aapke 7th house mein baitha hai. Rahu bahar ka, anjaan ka aur alag sanskriti ka karak hai — ` +
      `7th house mein hona videshi ya apni jaati/desh se bahar ke jeevansaathi ka sabse zyada quote kiya jaane wala yog hai.`);
  } else if (rahuAsp7 && rahuAsp7.virupas >= 15) {
    s.add('Rahu', 'Rahu ka 7th se sambandh', 12 * (rahuAsp7.virupas / 60), 12,
      `Rahu aapke 7th house ko ${drishtiWord(rahuAsp7.virupas)} se dekh raha hai — ${rahuAsp7.virupas} virupas, ` +
      `${rahuAsp7.strength_pct}% taakat. Baithne jitna seedha nahi, par asar wahi hai.`);
  } else {
    s.add('Rahu', 'Rahu ka 7th se sambandh', 0, 12,
      `Rahu ${ord(rahu?.house)} house mein hai aur 7th ko asardar drishti se nahi dekh raha. ` +
      `Videshi jeevansaathi ka sabse bada sanket yahan nahi mil raha.`);
  }

  const venRahu = conjunct(data, 'Venus', 'Rahu');
  const venRahuAsp = drishtiOnPlanet(data, 'Venus', ['Rahu']).find((r) => r.virupas >= 30);
  s.add('Rahu', 'Shukra-Rahu sambandh', venRahu ? 6 : venRahuAsp ? 4 : 0, 6,
    venRahu
      ? `Shukra aur Rahu dono ${ord(houseOf(data, 'Venus'))} house mein ek saath hain. Shukra shaadi ka karak hai ` +
        `aur Rahu videsh ka — inka milna videshi rishte ka seedha yog banata hai.`
      : venRahuAsp
        ? `Rahu Shukra ko ${drishtiWord(venRahuAsp.virupas)} se dekh raha hai (${venRahuAsp.virupas} virupas).`
        : `Shukra aur Rahu mein na yuti hai na asardar drishti — prem aur videsh ka seedha jodh nahi ban raha.`);

  // ── BLOCK D — 12th house link (12) ─────────────────────────────────────────

  const l12h = houseOf(data, l12);
  s.add('12th House', '12th ka 7th se jud\u2019av', [7, 1].includes(l12h ?? -1) ? 12 : 0, 12,
    l12
      ? `12th house ka swami ${PLANET_HI[l12]} ${ord(l12h)} house mein hai. ` +
        ([7, 1].includes(l12h ?? -1)
          ? `Wo 7th/1st tak pahunch raha hai — videsh aur shaadi ka do-tarfa sambandh. Ye yog ko pakka karta hai.`
          : `Wo 7th ya 1st tak nahi pahunch raha; videsh ka ghar shaadi ke ghar se seedha nahi jud raha.`)
      : '12th house ka swami nahi mila.');

  // ── BLOCK E — Venus and Darakaraka (18) ────────────────────────────────────

  const rVen = ratio(ven);
  s.add('Shukra + DK', 'Shukra ki taakat', 8 * ratioScore(rVen), 8,
    `Shukra ${ven?.sign} mein ${ord(ven?.house)} house mein hai, ${dignityWord(ven)}, ` +
    `Shadbala ${rVen !== null ? rVen.toFixed(2) : 'n/a'} (${ratioWord(rVen)})` +
    (isVargottama(data, 'Venus') ? ', aur **vargottama** hai' : '') + `. ` +
    `Shukra hi vivah ka karak hai — kaisa bhi yog ho, Shukra kamzor ho toh phal mein der lagti hai.`);

  if (DK) {
    const dkFar = [9, 12].includes(DK.house);
    s.add('Shukra + DK', 'Darakaraka ki sthiti', dkFar ? 10 : 4, 10,
      `Aapka Darakaraka ${PLANET_HI[DK.planet]} hai — Jaimini mein sabse kam degree wala graha ` +
      `(${DK.degree_in_sign?.toFixed(2)}°), jo jeevansaathi ka pratinidhi hota hai. Wo ${ord(DK.house)} house mein hai. ` +
      (dkFar
        ? `9th/12th mein hona seedha ishara hai ki jeevansaathi door se aayega.`
        : `Ye 9th ya 12th mein nahi hai, toh jeevansaathi ke door se aane ka seedha sanket nahi milta.`));
  } else {
    s.add('Shukra + DK', 'Darakaraka ki sthiti', 0, 10, 'Darakaraka compute nahi ho paya.');
  }

  // ── BLOCK F — Dasha (10) ───────────────────────────────────────────────────

  const keys = [l7, l12, 'Venus', 'Rahu', DK?.planet].filter(Boolean) as string[];
  const hit = [maha, antar].filter((x): x is string => Boolean(x) && keys.includes(x!));
  s.add('Dasha', 'Vivah grahon ki dasha', hit.length ? 10 : 0, 10,
    hit.length
      ? `${hit.map(h => PLANET_HI[h]).join(' aur ')} abhi aapki dasha mein hai — ` +
        `aur yehi aapke vivah grahas hain (7th lord ${PLANET_HI[l7 ?? '']}, Shukra, Rahu, Darakaraka ${PLANET_HI[DK?.planet ?? '']}). ` +
        `Rishta banne ki sambhavna in dashaon mein sabse zyada hoti hai.`
      : `Abhi ${maha ? PLANET_HI[maha] : '?'}-${antar ? PLANET_HI[antar] : '?'} chal raha hai. ` +
        `Aapke vivah grahas abhi active nahi hain — yog chart mein hai, par samay abhi nahi aaya.`);

  const base = s.finish();

  return {
    ...base,
    directionHints: buildHints(data),
    timing: buildTiming(data, keys),
    nextStep: {
      title: 'Yog hai — par kya YE rishta chalega?',
      body:
        'Ye calculator sirf itna batata hai ki aapke chart mein videshi jeevansaathi ka yog kitna prabal hai. ' +
        'Ye nahi bata sakta ki jis vyakti ki baat chal rahi hai, unke saath nibhegi ya nahi — uske liye dono ' +
        'kundaliyan milani padti hain. Kundali Milan mein Ashtakoot ke 36 gun, Manglik dosh, aur dono ke ' +
        '7th house aur Navamsa ka aapsi milaan dekha jata hai.',
      href: '/kundali-milan',
      price: '₹51',
    },
  };
}

// ── Broad origin hints ───────────────────────────────────────────────────────
// Deliberately BROAD. Naming a country from a chart is not something this
// engine can honestly do, and saying so is better than inventing a map.

function buildHints(data: CalcData) {
  const out: { hint: string; reason: string }[] = [];
  const l7 = houseLord(data, 7);
  const p7 = planet(data, l7);
  const rahu = planet(data, 'Rahu');

  const DIR: Record<string, string> = {
    Sun: 'Poorv (East)', Moon: 'Uttar-Paschim (North-West)', Mars: 'Dakshin (South)',
    Mercury: 'Uttar (North)', Jupiter: 'Uttar-Poorv (North-East)',
    Venus: 'Dakshin-Poorv (South-East)', Saturn: 'Paschim (West)',
    Rahu: 'Dakshin-Paschim (South-West)', Ketu: 'Dakshin-Paschim (South-West)',
  };

  if (p7) {
    out.push({
      hint: `Disha: ${DIR[p7.planet] ?? 'spasht nahi'}`,
      reason: `Aapka 7th lord ${PLANET_HI[p7.planet]} hai, jiski disha ${DIR[p7.planet] ?? '—'} maani jati hai. ` +
        `Ye janm sthan se disha ka ishara hai — kisi desh ka naam nahi.`,
    });
  }
  if (rahu) {
    out.push({
      hint: 'Sanskriti: apne samaj se bahar',
      reason: `Rahu ${ord(rahu.house)} house mein hai. Rahu ka kaam hi seemaayein todna hai — bhasha, jaati, ` +
        `dharm ya desh, kisi bhi tarah ki. Rishta parichit dayre se bahar se aane ki sambhavna banti hai.`,
    });
  }
  out.push({
    hint: 'Kisi desh ka naam nahi',
    reason: 'Kundali se kisi ek desh ka naam nikalna imaandari se mumkin nahi hai. Jo koi bhi tool ' +
      'aapko seedha desh bata de, wo anumaan bech raha hai. Disha aur sanskriti ka ishara asli hai; naam nahi.',
  });
  return out;
}

function buildTiming(data: CalcData, keys: string[]) {
  const { maha, antar } = dashaPair(data);
  const out: { period: string; why: string }[] = [];
  if (maha) {
    out.push({
      period: `${PLANET_HI[maha]} Mahadasha (abhi chal rahi)`,
      why: keys.includes(maha)
        ? `${PLANET_HI[maha]} aapke vivah grahon mein hai — ye poori mahadasha rishte ke liye khuli hui hai.`
        : `Ye mahadasha vivah ke liye tatasth hai. Antardasha par nazar rakho.`,
    });
  }
  if (antar) {
    out.push({
      period: `${PLANET_HI[antar]} Antardasha`,
      why: keys.includes(antar)
        ? `${PLANET_HI[antar]} aapka vivah graha hai — is antardasha mein baat aage badhne ki sambhavna sabse zyada.`
        : `${PLANET_HI[antar]} vivah grahon mein nahi hai; is daur mein jaldbaazi se bachein.`,
    });
  }
  return out;
}
