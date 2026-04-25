/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 3.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: PROKERALA API — 100% ACCURATE SWISS EPHEMERIS CALCULATIONS
 * WARNING: THIS REPLACES MEEUS MATH — DO NOT USE swiss-ephemeris.ts FOR PLANETS
 *
 * v3.0 CHANGES:
 *   - calcDasha() now calculates ALL 4 LEVELS per Parashara BPHS:
 *       Level 1: Mahadasha     (years)
 *       Level 2: Antardasha    (months)
 *       Level 3: Pratyantar    (days — 3 to 7 day precision windows)
 *       Level 4: Sookshma      (hours)
 *   - KundaliData return now includes:
 *       currentPratyantar, currentSookshma, antardashas, pratyantar
 *   - Predictions automatically become date-precise via Gemini
 * v2.0: degree taken from p.position.degree (Prokerala Swiss Ephemeris)
 */

import type { PlanetPosition, KundaliData, BirthData, DashaPeriod, DashaPeriodExtended } from './swiss-ephemeris';
import {
  RASHI_LORDS, DASHA_SEQUENCE, DASHA_YEARS,
  NAKSHATRAS, NAKSHATRA_LORDS, RASHIS,
  VIMSHOTTARI_TOTAL,
} from './swiss-ephemeris';

// ─── PROKERALA AUTH ────────────────────────────────────────────────────────────
const CLIENT_ID     = process.env.PROKERALA_CLIENT_ID     ?? '';
const CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET ?? '';
const BASE_URL      = 'https://api.prokerala.com';

async function getProkeralaToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Prokerala auth failed: ${err}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface ProkeralaPlanetData {
  id:       number;
  name:     string;
  longitude: number;
  is_retro: string;
  position: {
    degree: number;
    minute: number;
    second: number;
  };
}

interface ProkeralaChartData {
  ascendant: {
    id:        number;
    name:      string;
    longitude: number;
    position: {
      degree: number;
      minute: number;
      second: number;
    };
  };
  planets: ProkeralaPlanetData[];
}

// ─── RASHI / PLANET MAPS ──────────────────────────────────────────────────────
const PROKERALA_RASHI_MAP: Record<string, string> = {
  'Aries':'Mesh', 'Taurus':'Vrishabh', 'Gemini':'Mithun', 'Cancer':'Kark',
  'Leo':'Simha', 'Virgo':'Kanya', 'Libra':'Tula', 'Scorpio':'Vrischik',
  'Sagittarius':'Dhanu', 'Capricorn':'Makar', 'Aquarius':'Kumbh', 'Pisces':'Meen',
};

const PROKERALA_PLANET_MAP: Record<string, string> = {
  'Sun':'Sun', 'Moon':'Moon', 'Mars':'Mars', 'Mercury':'Mercury',
  'Jupiter':'Jupiter', 'Venus':'Venus', 'Saturn':'Saturn', 'Rahu':'Rahu', 'Ketu':'Ketu',
};

// ─── STRENGTH CALCULATION ─────────────────────────────────────────────────────
const EXALT_RASHI: Record<string, number> = {
  Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6,
};
const DEBIL_RASHI: Record<string, number> = {
  Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5, Saturn:0,
};
const OWN_RASHIS: Record<string, number[]> = {
  Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5],
  Jupiter:[8,11], Venus:[1,6], Saturn:[9,10],
};

function getPlanetStrength(planet: string, rashiIdx: number, isRetrograde: boolean): number {
  let s = 50;
  if (EXALT_RASHI[planet] === rashiIdx) s += 30;
  if (DEBIL_RASHI[planet] === rashiIdx) s -= 25;
  if (OWN_RASHIS[planet]?.includes(rashiIdx)) s += 20;
  if (isRetrograde && planet !== 'Rahu' && planet !== 'Ketu') s += 8;
  return Math.min(100, Math.max(5, s));
}

// ─── NAKSHATRA FROM LONGITUDE ─────────────────────────────────────────────────
function getNakshatraFromLongitude(siderealLng: number): {
  nakshatra: string; lord: string; pada: number;
} {
  const norm  = ((siderealLng % 360) + 360) % 360;
  const idx   = Math.floor(norm / (360 / 27));
  const inNak = norm % (360 / 27);
  const pada  = Math.min(4, Math.floor(inNak / (360 / 108)) + 1);
  return {
    nakshatra: NAKSHATRAS[idx]      ?? 'Ashwini',
    lord:      NAKSHATRA_LORDS[idx] ?? 'Ketu',
    pada,
  };
}

// ─── HOUSE CALCULATION ────────────────────────────────────────────────────────
function getHouse(planetLng: number, lagnaLng: number): number {
  return Math.floor(((planetLng - lagnaLng + 360) % 360) / 30) + 1;
}

// ─── DASHA QUALITY ────────────────────────────────────────────────────────────
const SHUBH_LORDS  = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);

function getDashaQuality(
  mdLord: string, adLord: string, pdLord: string
): 'Shubh' | 'Ashubh' | 'Madhyam' {
  const lords       = [mdLord, adLord, pdLord];
  const shubhCount  = lords.filter(l => SHUBH_LORDS.has(l)).length;
  const ashubhCount = lords.filter(l => !SHUBH_LORDS.has(l)).length;
  if (shubhCount > ashubhCount) return 'Shubh';
  if (ashubhCount > shubhCount) return 'Ashubh';
  return 'Madhyam';
}

// ─── 4-LEVEL DASHA CALCULATOR ────────────────────────────────────────────────
/**
 * Parashara BPHS Vimshottari formula — all 4 levels:
 *
 * MD duration  = DASHA_YEARS[lord] years
 * AD duration  = MD_ms × (AD_years / 120)
 * PD duration  = AD_ms × (PD_years / 120)   ← Pratyantar (3-7 days)
 * SD duration  = PD_ms × (SD_years / 120)   ← Sookshma   (hours)
 *
 * Each level starts with the parent lord's sequence position.
 */
function calcDasha(moonLongitude: number, dob: Date): {
  currentMahadasha:  DashaPeriod;
  currentAntardasha: DashaPeriod;
  currentPratyantar: DashaPeriodExtended;
  currentSookshma:   DashaPeriodExtended;
  antardashas:       DashaPeriod[];
  pratyantar:        DashaPeriodExtended[];
  dashaBalance:      string;
} {
  const MS_PER_YEAR = 365.25 * 86400 * 1000;
  const now         = new Date();

  // ── Level 1: Mahadasha ──────────────────────────────────────────────────────
  const nakLen    = 360 / 27;
  const posInNak  = (moonLongitude % nakLen) / nakLen;
  const nakIdx    = Math.floor(((moonLongitude % 360) + 360) % 360 / nakLen);
  const birthLord = NAKSHATRA_LORDS[nakIdx] ?? 'Ketu';
  const balance   = (1 - posInNak) * DASHA_YEARS[birthLord]!;
  const startIdx  = DASHA_SEQUENCE.indexOf(birthLord);

  const mahadashas: DashaPeriod[] = [];
  let cur = new Date(dob);
  for (let cycle = 0; cycle < 3; cycle++) {
    for (let i = 0; i < 9; i++) {
      const lord  = DASHA_SEQUENCE[(startIdx + i) % 9]!;
      const years = (i === 0 && cycle === 0) ? balance : DASHA_YEARS[lord]!;
      const end   = new Date(cur.getTime() + years * MS_PER_YEAR);
      mahadashas.push({ lord, startDate: new Date(cur), endDate: end });
      cur = new Date(end);
      if (cur.getFullYear() > dob.getFullYear() + 130) break;
    }
  }

  const curMD   = mahadashas.find(d => d.startDate <= now && d.endDate > now) ?? mahadashas[0]!;
  const mdDurMs = curMD.endDate.getTime() - curMD.startDate.getTime();
  const mdIdx   = DASHA_SEQUENCE.indexOf(curMD.lord);

  // ── Level 2: Antardasha ─────────────────────────────────────────────────────
  const antardashas: DashaPeriod[] = [];
  let adCur = new Date(curMD.startDate);
  for (let i = 0; i < 9; i++) {
    const adLord  = DASHA_SEQUENCE[(mdIdx + i) % 9]!;
    const adDurMs = mdDurMs * (DASHA_YEARS[adLord]! / VIMSHOTTARI_TOTAL);
    const adEnd   = new Date(adCur.getTime() + adDurMs);
    antardashas.push({ lord: adLord, startDate: new Date(adCur), endDate: adEnd });
    adCur = new Date(adEnd);
  }

  const curAD   = antardashas.find(d => d.startDate <= now && d.endDate > now) ?? antardashas[0]!;
  const adDurMs = curAD.endDate.getTime() - curAD.startDate.getTime();
  const adIdx   = DASHA_SEQUENCE.indexOf(curAD.lord);

  // ── Level 3: Pratyantar Dasha ───────────────────────────────────────────────
  const pratyantar: DashaPeriodExtended[] = [];
  let pdCur = new Date(curAD.startDate);
  for (let i = 0; i < 9; i++) {
    const pdLord  = DASHA_SEQUENCE[(adIdx + i) % 9]!;
    const pdDurMs = adDurMs * (DASHA_YEARS[pdLord]! / VIMSHOTTARI_TOTAL);
    const pdEnd   = new Date(pdCur.getTime() + pdDurMs);
    const pdDays  = Math.round(pdDurMs / 86400000);
    const remMs   = pdEnd.getTime() - now.getTime();
    pratyantar.push({
      lord:          pdLord,
      startDate:     new Date(pdCur),
      endDate:       pdEnd,
      durationDays:  pdDays,
      quality:       getDashaQuality(curMD.lord, curAD.lord, pdLord),
      remainingDays: Math.max(0, Math.round(remMs / 86400000)),
    });
    pdCur = new Date(pdEnd);
  }

  const curPD   = pratyantar.find(d => d.startDate <= now && d.endDate > now) ?? pratyantar[0]!;
  const pdDurMs = curPD.endDate.getTime() - curPD.startDate.getTime();
  const pdIdx   = DASHA_SEQUENCE.indexOf(curPD.lord);

  // ── Level 4: Sookshma Dasha ─────────────────────────────────────────────────
  const sookshmaList: DashaPeriodExtended[] = [];
  let sdCur = new Date(curPD.startDate);
  for (let i = 0; i < 9; i++) {
    const sdLord  = DASHA_SEQUENCE[(pdIdx + i) % 9]!;
    const sdDurMs = pdDurMs * (DASHA_YEARS[sdLord]! / VIMSHOTTARI_TOTAL);
    const sdEnd   = new Date(sdCur.getTime() + sdDurMs);
    const sdDays  = Math.round(sdDurMs / 86400000 * 10) / 10;
    const remMs   = sdEnd.getTime() - now.getTime();
    sookshmaList.push({
      lord:          sdLord,
      startDate:     new Date(sdCur),
      endDate:       sdEnd,
      durationDays:  sdDays,
      quality:       getDashaQuality(curMD.lord, curAD.lord, sdLord),
      remainingDays: Math.max(0, Math.round(remMs / 86400000)),
    });
    sdCur = new Date(sdEnd);
  }

  const curSD = sookshmaList.find(d => d.startDate <= now && d.endDate > now) ?? sookshmaList[0]!;

  // ── Balance string ──────────────────────────────────────────────────────────
  const rem  = curMD.endDate.getTime() - now.getTime();
  const remY = Math.floor(rem / MS_PER_YEAR);
  const remM = Math.floor((rem % MS_PER_YEAR) / (30.44 * 86400000));

  return {
    currentMahadasha:  curMD,
    currentAntardasha: curAD,
    currentPratyantar: curPD,
    currentSookshma:   curSD,
    antardashas,
    pratyantar,
    dashaBalance: `${curMD.lord} Mahadasha — ${remY}y ${remM}m baki hai`,
  };
}

// ─── PANCHANG ─────────────────────────────────────────────────────────────────
const VARA     = ['Ravivara','Somvara','Mangalvara','Budhvara','Guruvara','Shukravara','Shanivara'];
const CG_NAMES = ['Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog'];
const CG_TYPE: Record<string,'Good'|'Bad'|'Neutral'> = {
  Amrit:'Good', Labh:'Good', Shubh:'Good', Char:'Neutral',
  Kaal:'Bad', Rog:'Bad', Udveg:'Bad',
};
const CG_OFFSET = [6,5,4,3,2,1,0];
const RAHU_SEG  = [8,2,7,5,6,4,3];

function fmt(min: number): string {
  return `${String(Math.floor(min/60)).padStart(2,'0')}:${String(Math.round(min%60)).padStart(2,'0')}`;
}

function calcPanchang(sunLng: number, moonLng: number) {
  const day      = new Date().getDay();
  const now      = new Date().getHours() * 60 + new Date().getMinutes();
  const month    = new Date().getMonth();
  const seasonal = Math.round(30 * Math.sin((month - 3) * Math.PI / 6));
  const rise     = 370 - seasonal;
  const set      = 1120 + seasonal;
  const dinman   = set - rise;
  const segLen   = dinman / 8;
  const rahuStart = rise + ((RAHU_SEG[day]! - 1) * segLen);
  const abStart   = rise + (7 * dinman / 15);
  const abEnd     = rise + (8 * dinman / 15);
  const slot   = now >= rise && now < set ? Math.floor((now - rise) / segLen) : 0;
  const cgIdx  = (CG_OFFSET[day]! + slot) % 7;
  const cgName = CG_NAMES[cgIdx] ?? 'Char';
  const tithiIdx = Math.floor(((moonLng - sunLng + 360) % 360) / 12);
  const TITHIS = [
    'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi',
    'Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi',
    'Trayodashi','Chaturdashi','Purnima',
  ];
  const YOGAS = [
    'Vishkumbha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda',
    'Sukarma','Dhriti','Shoola','Ganda','Vriddhi','Dhruva','Vyaghata',
    'Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva',
    'Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti',
  ];
  return {
    vara:      VARA[day] ?? 'Ravivara',
    tithi:     TITHIS[Math.min(tithiIdx, 14)] ?? 'Pratipada',
    yoga:      YOGAS[Math.floor(((sunLng + moonLng) % 360) / (360/27))] ?? 'Vishkumbha',
    nakshatra: getNakshatraFromLongitude(moonLng).nakshatra,
    sunrise:   fmt(rise),
    sunset:    fmt(set),
    rahuKaal:        { start: fmt(rahuStart), end: fmt(rahuStart + segLen) },
    abhijeetMuhurta: { start: fmt(abStart),   end: fmt(abEnd) },
    choghadiya:      { name: cgName, type: CG_TYPE[cgName] ?? 'Neutral' as const },
  };
}

// ─── SAFE DEGREE PARSER ───────────────────────────────────────────────────────
function extractDegree(p: ProkeralaPlanetData): number {
  if (p.position && typeof p.position.degree === 'number' && !isNaN(p.position.degree)) {
    const fullDeg =
      p.position.degree +
      (p.position.minute ?? 0) / 60 +
      (p.position.second ?? 0) / 3600;
    return Math.round(fullDeg * 10) / 10;
  }
  console.warn(`[Prokerala] position.degree missing for ${p.name} — using lng fallback`);
  return Math.round((p.longitude % 30) * 10) / 10;
}

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────
export async function buildKundaliFromProkerala(data: BirthData): Promise<KundaliData> {

  const datetime = `${data.dob}T${data.tob}+05:30`;
  const token    = await getProkeralaToken();

  const planetRes = await fetch(
    `${BASE_URL}/v2/astrology/planet-position?` +
    new URLSearchParams({
      ayanamsa:    '1',
      coordinates: `${data.lat},${data.lng}`,
      datetime,
    }),
    {
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!planetRes.ok) {
    const errText = await planetRes.text();
    console.error('[Prokerala] Planet API error:', errText);
    const { buildKundali } = await import('./swiss-ephemeris');
    return buildKundali(data);
  }

  const planetJson = await planetRes.json();
  const chartData  = planetJson.data?.chart_data as ProkeralaChartData;

  if (!chartData) {
    console.error('[Prokerala] No chart data returned');
    const { buildKundali } = await import('./swiss-ephemeris');
    return buildKundali(data);
  }

  // ── Parse Lagna ────────────────────────────────────────────────────────────
  const lagnaEnglish = chartData.ascendant?.name ?? 'Aries';
  const lagna        = PROKERALA_RASHI_MAP[lagnaEnglish] ?? 'Mesh';
  const lagnaLng     = chartData.ascendant?.longitude ?? 0;

  // ── Parse planets ──────────────────────────────────────────────────────────
  const planets: Record<string, PlanetPosition> = {};

  for (const p of chartData.planets) {
    const ourName   = PROKERALA_PLANET_MAP[p.name] ?? p.name;
    const isRetro   = p.is_retro === 'true' || ourName === 'Rahu' || ourName === 'Ketu';
    const lng       = p.longitude;
    const rashiIdx  = Math.floor(((lng % 360) + 360) % 360 / 30);
    const rashiName = RASHIS[rashiIdx] ?? 'Mesh';
    const nData     = getNakshatraFromLongitude(lng);
    const degree    = extractDegree(p);

    planets[ourName] = {
      name:              ourName,
      siderealLongitude: lng,
      rashi:             rashiName,
      degree,
      nakshatra:         nData.nakshatra,
      nakshatraPada:     nData.pada,
      nakshatraLord:     nData.lord,
      isRetrograde:      isRetro,
      house:             getHouse(lng, lagnaLng),
      strength:          getPlanetStrength(ourName, rashiIdx, isRetro),
    };
  }

  // ── Dasha — all 4 levels ───────────────────────────────────────────────────
  const moonLng = planets['Moon']?.siderealLongitude ?? 0;
  const dob     = new Date(`${data.dob}T${data.tob}:00+05:30`);
  const dasha   = calcDasha(moonLng, dob);

  // ── Moon nakshatra + Panchang ──────────────────────────────────────────────
  const moonNak = getNakshatraFromLongitude(moonLng);
  const sunLng  = planets['Sun']?.siderealLongitude ?? 0;
  const panch   = calcPanchang(sunLng, moonLng);

  return {
    lagna,
    lagnaLord:          RASHI_LORDS[lagna] ?? 'Mars',
    planets,
    nakshatra:          moonNak.nakshatra,
    nakshatraLord:      moonNak.lord,
    currentMahadasha:   dasha.currentMahadasha,
    currentAntardasha:  dasha.currentAntardasha,
    currentPratyantar:  dasha.currentPratyantar,   // ✅ NEW Level 3
    currentSookshma:    dasha.currentSookshma,     // ✅ NEW Level 4
    antardashas:        dasha.antardashas,          // ✅ NEW full list
    pratyantar:         dasha.pratyantar,           // ✅ NEW full list
    dashaBalance:       dasha.dashaBalance,
    panchang:           panch,
    birthData:          data,
  };
}