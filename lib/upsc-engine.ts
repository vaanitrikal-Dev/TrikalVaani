/**
 * ============================================================
 * TRIKAL VAANI — IAS / UPSC / Sarkari Naukri Yog Engine
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/upsc-engine.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Scores 100 across seven blocks. Every rule states its reason with the real
 * figure it used — see lib/yog-engine.ts for why that is structural and not a
 * nicety.
 *
 * Classical basis, all of it already written up in the Government Job hub:
 *   10th house  — karma, profession, public standing
 *   6th house   — competition, service, the exam itself
 *   9th house   — bhagya, and the Dharma-Karmadhipati link with the 10th
 *   Sun         — authority, the state, administrative office
 *   Saturn      — discipline, long service, the machinery of government
 *   Dasamsa     — BPHS Ch.6 names D-10 as the varga read for career
 *   Amatyakaraka in the 6th — the Jaimini signal specific to competitive exams
 *
 * This returns a YOG STRENGTH SCORE. It does not predict an exam result.
 * ============================================================
 */

import {
  ord,
  CalcData, ScoreSheet, YogResult,
  planet, houseLord, houseOf, ratio, ratioScore, ratioWord,
  dignityScore, dignityWord, karakas, mahapurusha, conjunct, exchange,
  dashaPair, drishtiOnHouse, allDrishtiOnHouse, netDrishtiOnHouse, drishtiWord,
  d10, d10HouseLord, capabilities,
  PLANET_HI, KENDRA, TRIKONA,
} from './yog-engine';

export interface UpscResult extends YogResult {
  /** Which government track the chart leans toward, strongest first. */
  direction: { track: string; score: number; reason: string }[];
  /** Dasha periods that look supportive. Paid tier. */
  timing: { period: string; why: string }[];
}

const GOVT_PLANETS = ['Sun', 'Saturn', 'Mars', 'Jupiter'];

export function scoreUpsc(data: CalcData): UpscResult {
  const s = new ScoreSheet();
  const cap = capabilities(data);
  const { AmK } = karakas(data);
  const { maha, antar } = dashaPair(data);

  const l10 = houseLord(data, 10);
  const l6 = houseLord(data, 6);
  const l9 = houseLord(data, 9);
  const p10 = planet(data, l10);
  const sun = planet(data, 'Sun');
  const sat = planet(data, 'Saturn');

  // ── BLOCK A — 10th house in the rasi chart (15) ────────────────────────────

  if (l10 && p10) {
    const dg = dignityScore(p10);
    const r = ratio(p10);
    const pts = 10 * (dg * 0.5 + ratioScore(r) * 0.5);
    s.add('10th House', '10th lord ki taakat', pts, 10,
      `Aapka 10th house ${data.houses.find(h => h.house === 10)?.sign} ka hai, toh iska swami ${PLANET_HI[l10]} hua. ` +
      `Wo ${ord(p10.house)} house mein baitha hai, ${dignityWord(p10)}, aur uski Shadbala ${r !== null ? r.toFixed(2) : 'available nahi'}` +
      `${r !== null ? ` (1.00 se upar mazboot mana jata hai) — yaani ${ratioWord(r)}` : ''}.`);
  } else {
    s.add('10th House', '10th lord ki taakat', 0, 10, '10th house ka swami chart se nahi mila.');
  }

  const inTenth = data.planets.filter((p) => p.house === 10 && GOVT_PLANETS.includes(p.planet));
  if (inTenth.length) {
    const best = inTenth.reduce((a, b) => (ratioScore(ratio(b)) > ratioScore(ratio(a)) ? b : a));
    s.add('10th House', 'Sarkari graha 10th house mein', 5, 5,
      `${inTenth.map(p => PLANET_HI[p.planet]).join(' aur ')} aapke 10th house mein hai. ` +
      `${PLANET_HI[best.planet]} sabse mazboot hai (Shadbala ${ratio(best)?.toFixed(2) ?? 'n/a'}). ` +
      `Sun sarkari adhikar, Saturn lambi sewa, Mars anushasan aur Jupiter niti ka karak hai.`);
  } else {
    s.add('10th House', 'Sarkari graha 10th house mein', 0, 5,
      'Aapke 10th house mein Sun, Saturn, Mars ya Jupiter mein se koi nahi baitha. Ye ghatak nahi hai — ' +
      '10th lord ki taakat isse zyada mayne rakhti hai.');
  }

  // ── BLOCK B — Dasamsa D-10 (20) ────────────────────────────────────────────

  if (cap.hasDasamsa && data.dasamsa) {
    const d10LagnaLord = data.dasamsa.lagna.sign_lord;
    const pdl = planet(data, d10LagnaLord);
    const rdl = ratio(pdl);
    s.add('Dasamsa D-10', 'D-10 lagna lord', 7 * ratioScore(rdl), 7,
      `Aapka Dasamsa lagna ${data.dasamsa.lagna.sign} hai, jiska swami ${PLANET_HI[d10LagnaLord]} hai — ` +
      `uski Shadbala ${rdl !== null ? rdl.toFixed(2) : 'n/a'} (${ratioWord(rdl)}). ` +
      `BPHS Ch.6 kehta hai career Dasamsa se padha jata hai, rasi chart se nahi.`);

    const d10L10 = d10HouseLord(data, 10);
    const pd10 = planet(data, d10L10);
    const rd10 = ratio(pd10);
    s.add('Dasamsa D-10', 'D-10 ka 10th lord', 8 * ratioScore(rd10), 8,
      d10L10
        ? `Dasamsa ke 10th house ka swami ${PLANET_HI[d10L10]} hai, Shadbala ${rd10 !== null ? rd10.toFixed(2) : 'n/a'} (${ratioWord(rd10)}). ` +
          `Ye karma ka karma hai — sarkari sewa ke liye sabse gehra signal.`
        : 'Dasamsa ka 10th swami nahi nikal paya.');

    const g = d10(data, l10);
    if (g && (KENDRA.includes(g.house) || TRIKONA.includes(g.house))) {
      s.add('Dasamsa D-10', 'Rasi 10th lord D-10 mein mazboot', 5, 5,
        `Aapka rasi 10th lord ${PLANET_HI[l10!]} Dasamsa mein ${g.sign} (${ord(g.house)} house) mein hai — ` +
        `kendra/trikona. Rasi ka vaada D-10 mein confirm ho raha hai.`);
    } else {
      s.add('Dasamsa D-10', 'Rasi 10th lord D-10 mein mazboot', 0, 5,
        g ? `Rasi 10th lord ${PLANET_HI[l10!]} Dasamsa mein ${ord(g.house)} house mein hai — kendra ya trikona nahi. ` +
            `Career mein mehnat zyada lagegi.`
          : 'Rasi 10th lord Dasamsa mein locate nahi hua.');
    }
  } else {
    s.add('Dasamsa D-10', 'D-10 vishleshan', 0, 20,
      'Dasamsa chart is samay available nahi hai.');
  }

  // ── BLOCK C — 6th house, the competition (15) ──────────────────────────────

  if (AmK) {
    if (AmK.house === 6) {
      s.add('6th House', 'Amatyakaraka 6th house mein', 8, 8,
        `Aapka Amatyakaraka ${PLANET_HI[AmK.planet]} hai (Jaimini ka career karak — sabse zyada degree wale ke baad ` +
        `doosra graha, ${AmK.degree_in_sign?.toFixed(2)}°) aur wo 6th house mein baitha hai. ` +
        `Ye competitive exam ka sabse khaas classical signal hai — UPSC jaisi pratiyogita ke liye.`);
    } else {
      s.add('6th House', 'Amatyakaraka 6th house mein', 0, 8,
        `Aapka Amatyakaraka ${PLANET_HI[AmK.planet]} hai par wo ${ord(AmK.house)} house mein hai, 6th mein nahi. ` +
        `6th house pratiyogita ka ghar hai — ye yog na hone se exam route thoda kam natural hota hai.`);
    }
  } else {
    s.add('6th House', 'Amatyakaraka 6th house mein', 0, 8, 'Amatyakaraka compute nahi ho paya.');
  }

  if (l6) {
    const p6 = planet(data, l6);
    const linked = [6, 10, 11].includes(houseOf(data, l6) ?? -1);
    const pts = 7 * (dignityScore(p6) * 0.5 + (linked ? 0.5 : 0));
    s.add('6th House', '6th lord ka sambandh', pts, 7,
      `6th house ka swami ${PLANET_HI[l6]} hai, ${ord(p6?.house)} house mein, ${dignityWord(p6)}. ` +
      (linked
        ? `Wo 6/10/11 se juda hai — pratiyogita, karma aur labh ka seedha sambandh.`
        : `Wo 6/10/11 se nahi juda — pratiyogita ka phal karma tak pahunchne mein der lagti hai.`));
  } else {
    s.add('6th House', '6th lord ka sambandh', 0, 7, '6th house ka swami nahi mila.');
  }

  // ── BLOCK D — Sun and Saturn (15) ──────────────────────────────────────────

  const rSun = ratio(sun);
  s.add('Sun + Saturn', 'Surya ki taakat', 8 * ratioScore(rSun), 8,
    `Surya ${sun?.sign} mein ${ord(sun?.house)} house mein hai, ${dignityWord(sun)}, Shadbala ${rSun !== null ? rSun.toFixed(2) : 'n/a'} (${ratioWord(rSun)}). ` +
    `Surya hi sarkar, adhikar aur rajya ka karak hai — sarkari naukri mein iski taakat sabse zyada mayne rakhti hai.`);

  const rSat = ratio(sat);
  s.add('Sun + Saturn', 'Shani ki taakat', 7 * ratioScore(rSat), 7,
    `Shani ${sat?.sign} mein ${ord(sat?.house)} house mein hai, ${dignityWord(sat)}, Shadbala ${rSat !== null ? rSat.toFixed(2) : 'n/a'} (${ratioWord(rSat)}). ` +
    `Shani anushasan, lambi taiyari aur sarkari tantra ka karak hai — UPSC jaisi lambi ladai iske bina mushkil hai.`);

  // ── BLOCK E — Yogas (16) ───────────────────────────────────────────────────

  const shasha = mahapurusha(data, 'Saturn');
  s.add('Yogas', 'Shasha Yoga (Shani)', shasha.present ? 6 : 0, 6,
    shasha.present
      ? `Shasha Yoga bana hai — ${shasha.detail}. Ye prashasanik pad, IAS aur senior sarkari bhumika ka yog hai.`
      : `Shasha Yoga nahi bana. ${shasha.detail}.`);

  const ruchaka = mahapurusha(data, 'Mars');
  s.add('Yogas', 'Ruchaka Yoga (Mangal)', ruchaka.present ? 6 : 0, 6,
    ruchaka.present
      ? `Ruchaka Yoga bana hai — ${ruchaka.detail}. Ye IPS, defence aur police line ka yog hai.`
      : `Ruchaka Yoga nahi bana. ${ruchaka.detail}.`);

  const budhAditya = conjunct(data, 'Sun', 'Mercury');
  const dka = (l9 && l10 && conjunct(data, l9, l10)) || exchange(data, 9, 10);
  const extra = (budhAditya ? 2 : 0) + (dka ? 2 : 0);
  s.add('Yogas', 'Budh-Aditya / Dharma-Karmadhipati', extra, 4,
    [
      budhAditya
        ? `Budh-Aditya Yoga hai — Surya aur Budh dono ${ord(houseOf(data, 'Sun'))} house mein. Buddhi ke saath adhikar.`
        : 'Budh-Aditya Yoga nahi hai (Surya aur Budh alag houses mein).',
      dka
        ? `Dharma-Karmadhipati Yoga hai — 9th aur 10th ke swami jude hue hain. Bhagya aur karma ek saath.`
        : 'Dharma-Karmadhipati Yoga nahi bana (9th aur 10th ke swami na sath hain, na parivartan mein).',
    ].join(' '));

  // ── BLOCK F — Drishti on the 10th (9) ──────────────────────────────────────

  if (cap.hasDrishti) {
    const good = drishtiOnHouse(data, 10, ['Saturn', 'Jupiter']);
    if (good) {
      s.add('Drishti', 'Shani/Guru ki 10th par drishti', 5 * (good.virupas / 60), 5,
        `${PLANET_HI[good.from]} aapke 10th house ko ${drishtiWord(good.virupas)} se dekh raha hai — ` +
        `${good.virupas} virupas, yaani ${good.strength_pct}% taakat (poori drishti 60 hoti hai). ` +
        `Zyadatar sites sirf "dekh raha hai" batati hain; asli baat ye hai ki kitni taakat se.`);
    } else {
      s.add('Drishti', 'Shani/Guru ki 10th par drishti', 0, 5,
        'Shani ya Guru ki aapke 10th house par koi asardar drishti nahi hai.');
    }

    const net = netDrishtiOnHouse(data, 10);
    const penalty = net < 0 ? Math.max(-4, net / 30) : 0;
    s.add('Drishti', '10th house par kul dabaav', penalty + 4, 4,
      net >= 0
        ? `Aapke 10th house par shubh grahon ki drishti bhari hai — net +${net} virupas. Karma sthan ko sahara mil raha hai.`
        : `Aapke 10th house par paap grahon ki drishti zyada hai — net ${net} virupas. ` +
          // Only the MALEFIC contributors belong in this sentence. Listing the
          // strongest aspects regardless of nature put Jupiter in the evidence
          // for a malefic verdict, which read as a contradiction.
          `Dabaav ${allDrishtiOnHouse(data, 10)
              .filter(r => !r.is_node && ['Sun', 'Mars', 'Saturn'].includes(r.from))
              .slice(0, 2)
              .map(r => `${PLANET_HI[r.from]} ${r.virupas}v`)
              .join(', ') || 'paap grahon'} se aa raha hai. ` +
          `Iska matlab rukavat, der ya baar-baar prayaas.`);
  } else {
    s.add('Drishti', 'Drishti vishleshan', 0, 9, 'Drishti data is samay available nahi hai.');
  }

  // ── BLOCK G — Dasha window (10) ────────────────────────────────────────────

  const govtDasha = ['Sun', 'Saturn', 'Rahu'];
  if (maha && govtDasha.includes(maha)) {
    s.add('Dasha', 'Sarkari mahadasha chal rahi', 5, 5,
      `Abhi ${PLANET_HI[maha]} ki mahadasha chal rahi hai. Sarkari niyukti sabse zyada ` +
      `Shani (19 saal), Surya (6 saal) aur Rahu (18 saal) ki mahadasha mein hoti hai.`);
  } else {
    s.add('Dasha', 'Sarkari mahadasha chal rahi', 0, 5,
      `Abhi ${maha ? PLANET_HI[maha] : 'unknown'} ki mahadasha chal rahi hai — ye teen sarkari mahadashaon ` +
      `(Shani, Surya, Rahu) mein se nahi hai.`);
  }

  const key = [l10, l6, AmK?.planet].filter(Boolean) as string[];
  const hit = [maha, antar].filter((x): x is string => Boolean(x) && key.includes(x!));
  s.add('Dasha', 'Key graha ki dasha', hit.length ? 5 : 0, 5,
    hit.length
      ? `${hit.map(h => PLANET_HI[h]).join(' aur ')} abhi aapki dasha mein hai — aur yehi aapke chart ka ` +
        `key career graha hai (10th lord ${PLANET_HI[l10 ?? '']}, 6th lord ${PLANET_HI[l6 ?? '']}, Amatyakaraka ${PLANET_HI[AmK?.planet ?? '']}).`
      : `Abhi ${maha ? PLANET_HI[maha] : '?'}-${antar ? PLANET_HI[antar] : '?'} chal raha hai. Aapke career grahas — ` +
        `10th lord ${PLANET_HI[l10 ?? '']}, 6th lord ${PLANET_HI[l6 ?? '']}, Amatyakaraka ${PLANET_HI[AmK?.planet ?? '']} — ` +
        `abhi active nahi hain.`);

  // ── Direction: which government track the chart leans toward ───────────────

  const direction = buildDirection(data);
  const timing = buildTiming(data, key);

  return { ...s.finish(), direction, timing };
}

// ── Track mapping ────────────────────────────────────────────────────────────

function buildDirection(data: CalcData) {
  const out: { track: string; score: number; reason: string }[] = [];
  const push = (track: string, score: number, reason: string) => out.push({ track, score, reason });

  const sat = planet(data, 'Saturn');
  const mars = planet(data, 'Mars');
  const merc = planet(data, 'Mercury');
  const jup = planet(data, 'Jupiter');
  const ven = planet(data, 'Venus');

  const shasha = mahapurusha(data, 'Saturn').present;
  const ruchaka = mahapurusha(data, 'Mars').present;

  push('IAS / Prashasanik Sewa',
    (shasha ? 40 : 0) + ratioScore(ratio(sat)) * 35 + ratioScore(ratio(planet(data, 'Sun'))) * 25,
    shasha
      ? 'Shasha Yoga aur Shani ki taakat prashasanik pad ki taraf le jaati hai.'
      : `Shani ki Shadbala ${ratio(sat)?.toFixed(2) ?? 'n/a'} aur Surya ki ${ratio(planet(data, 'Sun'))?.toFixed(2) ?? 'n/a'} — prashasanik line ka aadhaar yahi hai.`);

  push('IPS / Defence / Police',
    (ruchaka ? 40 : 0) + ratioScore(ratio(mars)) * 45 + (conjunct(data, 'Sun', 'Mars') ? 15 : 0),
    ruchaka
      ? 'Ruchaka Yoga — Mangal ki taakat vardi wali sewa ki taraf ishara karti hai.'
      : `Mangal ki Shadbala ${ratio(mars)?.toFixed(2) ?? 'n/a'}. Vardi wali sewa mein Mangal hi nirnayak hai.`);

  push('Banking / PSU',
    ratioScore(ratio(merc)) * 45 + ratioScore(ratio(ven)) * 25 + (conjunct(data, 'Mercury', 'Venus') ? 30 : 0),
    conjunct(data, 'Mercury', 'Venus')
      ? 'Budh-Shukra ek sath hain — banking sector ka classical yog.'
      : `Budh ki Shadbala ${ratio(merc)?.toFixed(2) ?? 'n/a'} — banking aur accounts Budh se chalte hain.`);

  push('SSC / Railway / Clerical',
    ratioScore(ratio(merc)) * 35 + ratioScore(ratio(sat)) * 35 + 20,
    `Budh ${ratio(merc)?.toFixed(2) ?? 'n/a'} aur Shani ${ratio(sat)?.toFixed(2) ?? 'n/a'} — ` +
    `SSC aur Railway mein in dono ka mel dekha jata hai. Iski shart UPSC se halki hoti hai.`);

  push('Judiciary / Teaching',
    ratioScore(ratio(jup)) * 60 + (mahapurusha(data, 'Jupiter').present ? 40 : 0),
    `Guru ki Shadbala ${ratio(jup)?.toFixed(2) ?? 'n/a'} — nyay aur shiksha Guru ke adhikar mein hain.`);

  return out
    .map((d) => ({ ...d, score: Math.round(Math.min(100, d.score)) }))
    .sort((a, b) => b.score - a.score);
}

// ── Timing ───────────────────────────────────────────────────────────────────

function buildTiming(data: CalcData, keyPlanets: string[]) {
  const { maha, antar } = dashaPair(data);
  const out: { period: string; why: string }[] = [];

  if (maha) {
    const good = ['Sun', 'Saturn', 'Rahu'].includes(maha) || keyPlanets.includes(maha);
    out.push({
      period: `${PLANET_HI[maha]} Mahadasha (abhi chal rahi)`,
      why: good
        ? `Ye aapke liye supportive mahadasha hai — ${['Sun', 'Saturn', 'Rahu'].includes(maha)
            ? 'sarkari niyukti ki teen classical mahadashaon mein se ek'
            : 'aapka apna career graha'}.`
        : `Ye mahadasha career ke liye tatasth hai. Antardasha par nazar rakho.`,
    });
  }
  if (antar) {
    out.push({
      period: `${PLANET_HI[antar]} Antardasha`,
      why: keyPlanets.includes(antar)
        ? `${PLANET_HI[antar]} aapka key career graha hai — ye antardasha sabse behtar window hai.`
        : `${PLANET_HI[antar]} aapke career grahon mein nahi hai; is antardasha mein sthirta zyada, badlaav kam.`,
    });
  }
  return out;
}
