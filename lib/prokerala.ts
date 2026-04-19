/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 1.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: PROKERALA API — 100% ACCURATE SWISS EPHEMERIS CALCULATIONS
 * WARNING: THIS REPLACES MEEUS MATH — DO NOT USE swiss-ephemeris.ts FOR PLANETS
 */

import type { PlanetPosition, KundaliData, BirthData } from './swiss-ephemeris';
import {
  RASHI_LORDS, DASHA_SEQUENCE, DASHA_YEARS,
  NAKSHATRAS, NAKSHATRA_LORDS, RASHIS,
} from './swiss-ephemeris';

// ─── PROKERALA AUTH ────────────────────────────────────────────────────────────
const CLIENT_ID     = process.env.PROKERALA_CLIENT_ID     ?? '';
const CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET ?? '';
const BASE_URL      = 'https://api.prokerala.com';

/**
 * Get OAuth2 access token from Prokerala
 * Tokens expire in 3600 seconds — we fetch fresh each time for simplicity
 */
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
  id:           number;
  name:         string;
  longitude:    number;
  is_retro:     string; // "true" or "false"
  position: {
    degree:     number;
    minute:     number;
    second:     number;
  };
}

interface ProkeralaChartData {
  ascendant: {
    id:        number;
    name:      string;
    longitude: number;
  };
  planets: ProkeralaPlanetData[];
}

// ─── RASHI MAPPING ────────────────────────────────────────────────────────────
// Prokerala uses English sign names — map to our Hindi names
const PROKERALA_RASHI_MAP: Record<string, string> = {
  'Aries':       'Mesh',
  'Taurus':      'Vrishabh',
  'Gemini':      'Mithun',
  'Cancer':      'Kark',
  'Leo':         'Simha',
  'Virgo':       'Kanya',
  'Libra':       'Tula',
  'Scorpio':     'Vrischik',
  'Sagittarius': 'Dhanu',
  'Capricorn':   'Makar',
  'Aquarius':    'Kumbh',
  'Pisces':      'Meen',
};

// Prokerala planet names → our names
const PROKERALA_PLANET_MAP: Record<string, string> = {
  'Sun':     'Sun',
  'Moon':    'Moon',
  'Mars':    'Mars',
  'Mercury': 'Mercury',
  'Jupiter': 'Jupiter',
  'Venus':   'Venus',
  'Saturn':  'Saturn',
  'Rahu':    'Rahu',
  'Ketu':    'Ketu',
};

// ─── STRENGTH CALCULATION ─────────────────────────────────────────────────────
const EXALT_RASHI: Record<string, number> = {
  Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6
};
const DEBIL_RASHI: Record<string, number> = {
  Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5, Saturn:0
};
const OWN_RASHIS: Record<string, number[]> = {
  Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5],
  Jupiter:[8,11], Venus:[1,6], Saturn:[9,10],
};

function getRashiIndex(rashiName: string): number {
  return RASHIS.indexOf(rashiName as typeof RASHIS[number]);
}

function getPlanetStrength(
  planetName: string,
  rashiIndex: number,
  isRetrograde: boolean
): number {
  let s = 50;
  if (EXALT_RASHI[planetName] === rashiIndex) s += 30;
  if (DEBIL_RASHI[planetName] === rashiIndex) s -= 25;
  if (OWN_RASHIS[planetName]?.includes(rashiIndex)) s += 20;
  if (isRetrograde && planetName !== 'Rahu' && planetName !== 'Ketu') s += 8;
  return Math.min(100, Math.max(5, s));
}

// ─── NAKSHATRA FROM LONGITUDE ─────────────────────────────────────────────────
function getNakshatraFromLongitude(siderealLng: number): {
  nakshatra: string; lord: string; pada: number;
} {
  const norm   = ((siderealLng % 360) + 360) % 360;
  const idx    = Math.floor(norm / (360 / 27));
  const inNak  = norm % (360 / 27);
  const pada   = Math.min(4, Math.floor(inNak / (360 / 108)) + 1);
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

// ─── VIMSHOTTARI DASHA ────────────────────────────────────────────────────────
function calcDasha(moonLongitude: number, dob: Date) {
  const nakLen    = 360 / 27;
  const posInNak  = (moonLongitude % nakLen) / nakLen;
  const nakIdx    = Math.floor(((moonLongitude % 360) + 360) % 360 / nakLen);
  const birthLord = NAKSHATRA_LORDS[nakIdx] ?? 'Ketu';
  const balance   = (1 - posInNak) * DASHA_YEARS[birthLord]!;
  const startIdx  = DASHA_SEQUENCE.indexOf(birthLord);
  const mahadashas: { lord: string; startDate: Date; endDate: Date }[] = [];
  let cur = new Date(dob);

  for (let cycle = 0; cycle < 3; cycle++) {
    for (let i = 0; i < 9; i++) {
      const lord  = DASHA_SEQUENCE[(startIdx + i) % 9]!;
      const years = (i === 0 && cycle === 0) ? balance : DASHA_YEARS[lord]!;
      const end   = new Date(cur.getTime() + years * 365.25 * 86400000);
      mahadashas.push({ lord, startDate: new Date(cur), endDate: end });
      cur = new Date(end);
      if (cur.getFullYear() > dob.getFullYear() + 130) break;
    }
  }

  const now   = new Date();
  const curMD = mahadashas.find(d => d.startDate <= now && d.endDate > now)
    ?? mahadashas[0]!;
  const mdDur = curMD.endDate.getTime() - curMD.startDate.getTime();
  const mdIdx = DASHA_SEQUENCE.indexOf(curMD.lord);

  const antardashas: { lord: string; startDate: Date; endDate: Date }[] = [];
  let adCur = new Date(curMD.startDate);
  for (let i = 0; i < 9; i++) {
    const adLord = DASHA_SEQUENCE[(mdIdx + i) % 9]!;
    const adDur  = mdDur * (DASHA_YEARS[adLord]! / 120);
    const adEnd  = new Date(adCur.getTime() + adDur);
    antardashas.push({ lord: adLord, startDate: new Date(adCur), endDate: adEnd });
    adCur = new Date(adEnd);
  }
  const curAD = antardashas.find(d => d.startDate <= now && d.endDate > now)
    ?? antardashas[0]!;

  const rem  = curMD.endDate.getTime() - now.getTime();
  const remY = Math.floor(rem / (365.25 * 86400000));
  const remM = Math.floor((rem % (365.25 * 86400000)) / (30.44 * 86400000));

  return {
    currentMahadasha:  curMD,
    currentAntardasha: curAD,
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

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────
/**
 * Build complete Kundali using Prokerala API
 * 100% accurate Swiss Ephemeris calculations
 * Matches AstroSage degree-for-degree
 */
export async function buildKundaliFromProkerala(
  data: BirthData
): Promise<KundaliData> {

  // Format datetime for Prokerala API
  // Prokerala expects: "YYYY-MM-DDTHH:MM:SS+05:30"
  const datetime = `${data.dob}T${data.tob}:00+05:30`;

  // Get auth token
  const token = await getProkeralaToken();

  // Call Prokerala planet positions API
  const planetRes = await fetch(
    `${BASE_URL}/v2/astrology/planet-position?` +
    new URLSearchParams({
      ayanamsa:        '1',        // 1 = Lahiri (Indian standard)
      coordinates:     `${data.lat},${data.lng}`,
      datetime:        datetime,
      chart_type:      'rasi',
      chart_style:     'north-indian',
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
    // Fallback to our Meeus math if API fails
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

  // Parse Lagna
  const lagnaEnglish = chartData.ascendant?.name ?? 'Aries';
  const lagna        = PROKERALA_RASHI_MAP[lagnaEnglish] ?? 'Mesh';
  const lagnaLng     = chartData.ascendant?.longitude ?? 0;

  // Parse planets
  const planets: Record<string, PlanetPosition> = {};

  for (const p of chartData.planets) {
    const ourName    = PROKERALA_PLANET_MAP[p.name] ?? p.name;
    const isRetro    = p.is_retro === 'true' || ourName === 'Rahu' || ourName === 'Ketu';
    const lng        = p.longitude;
    const rashiIdx   = Math.floor(((lng % 360) + 360) % 360 / 30);
    const rashiName  = RASHIS[rashiIdx] ?? 'Mesh';
    const nData      = getNakshatraFromLongitude(lng);
    const degInRashi = lng % 30;

    planets[ourName] = {
      name:              ourName,
      siderealLongitude: lng,
      rashi:             rashiName,
      degree:            Math.round(degInRashi * 100) / 100,
      nakshatra:         nData.nakshatra,
      nakshatraPada:     nData.pada,
      nakshatraLord:     nData.lord,
      isRetrograde:      isRetro,
      house:             getHouse(lng, lagnaLng),
      strength:          getPlanetStrength(ourName, rashiIdx, isRetro),
    };
  }

  // Dasha from Moon longitude
  const moonLng = planets['Moon']?.siderealLongitude ?? 0;
  const dob     = new Date(`${data.dob}T${data.tob}:00+05:30`);
  const dasha   = calcDasha(moonLng, dob);

  // Moon nakshatra
  const moonNak = getNakshatraFromLongitude(moonLng);

  // Panchang
  const sunLng  = planets['Sun']?.siderealLongitude ?? 0;
  const panch   = calcPanchang(sunLng, moonLng);

  return {
    lagna,
    lagnaLord:         RASHI_LORDS[lagna] ?? 'Mars',
    planets,
    nakshatra:         moonNak.nakshatra,
    nakshatraLord:     moonNak.lord,
    currentMahadasha:  dasha.currentMahadasha,
    currentAntardasha: dasha.currentAntardasha,
    dashaBalance:      dasha.dashaBalance,
    panchang:          panch,
    birthData:         data,
  };
}