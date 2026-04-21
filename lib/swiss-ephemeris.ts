/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 2.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: CORE VEDIC CALCULATION ENGINE ONLY
 * WARNING: DO NOT ADD JINI CODE HERE — JINI LIVES IN jini-engine.ts
 *
 * v2.0 CHANGES:
 *   - KundaliData interface: added currentPratyantar + currentSookshma
 *   - calcDasha(): now calculates all 4 levels:
 *       Level 1: Mahadasha     (years)
 *       Level 2: Antardasha    (months)
 *       Level 3: Pratyantar    (days — 3-7 day precision windows)
 *       Level 4: Sookshma      (hours — ultra precision)
 *   - DashaPeriod interface: unchanged — reused at all 4 levels
 *   - All levels follow Parashara BPHS proportional formula
 */

export const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
] as const;

export const NAKSHATRA_LORDS = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu',
  'Jupiter','Saturn','Mercury','Ketu','Venus','Sun',
  'Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  'Ketu','Venus','Sun','Moon','Mars','Rahu',
  'Jupiter','Saturn','Mercury'
] as const;

export const RASHIS = [
  'Mesh','Vrishabh','Mithun','Kark',
  'Simha','Kanya','Tula','Vrischik',
  'Dhanu','Makar','Kumbh','Meen'
] as const;

export const RASHI_LORDS: Record<string, string> = {
  Mesh:'Mars', Vrishabh:'Venus', Mithun:'Mercury', Kark:'Moon',
  Simha:'Sun', Kanya:'Mercury', Tula:'Venus', Vrischik:'Mars',
  Dhanu:'Jupiter', Makar:'Saturn', Kumbh:'Saturn', Meen:'Jupiter',
};

export const DASHA_YEARS: Record<string, number> = {
  Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7,
  Rahu:18, Jupiter:16, Saturn:19, Mercury:17,
};

// Total Vimshottari cycle = 120 years
export const VIMSHOTTARI_TOTAL = 120;

export const DASHA_SEQUENCE = [
  'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'
];

export interface BirthData {
  name: string;
  dob: string;
  tob: string;
  lat: number;
  lng: number;
  cityName: string;
}

export interface PlanetPosition {
  name: string;
  siderealLongitude: number;
  rashi: string;
  degree: number;
  nakshatra: string;
  nakshatraPada: number;
  nakshatraLord: string;
  isRetrograde: boolean;
  house: number;
  strength: number;
}

export interface DashaPeriod {
  lord: string;
  startDate: Date;
  endDate: Date;
}

// ─── NEW v2.0: Extended Dasha Period with quality ─────────────────────────────
export interface DashaPeriodExtended extends DashaPeriod {
  durationDays: number;   // how long this period lasts in days
  quality: 'Shubh' | 'Ashubh' | 'Madhyam'; // auspiciousness
  remainingDays: number;  // days remaining from today
}

export interface PanchangData {
  vara: string;
  tithi: string;
  yoga: string;
  nakshatra: string;
  sunrise: string;
  sunset: string;
  rahuKaal: { start: string; end: string };
  abhijeetMuhurta: { start: string; end: string };
  choghadiya: { name: string; type: 'Good' | 'Bad' | 'Neutral' };
}

// ─── UPDATED v2.0: KundaliData now includes all 4 Dasha levels ───────────────
export interface KundaliData {
  lagna: string;
  lagnaLord: string;
  planets: Record<string, PlanetPosition>;
  nakshatra: string;
  nakshatraLord: string;
  // Level 1
  currentMahadasha: DashaPeriod;
  // Level 2
  currentAntardasha: DashaPeriod;
  // Level 3 — NEW ✅
  currentPratyantar: DashaPeriodExtended;
  // Level 4 — NEW ✅
  currentSookshma: DashaPeriodExtended;
  // All Antardasha periods within current Mahadasha (for display table)
  antardashas: DashaPeriod[];
  // All Pratyantar periods within current Antardasha (for display table)
  pratyantar: DashaPeriodExtended[];
  dashaBalance: string;
  panchang: PanchangData;
  birthData: BirthData;
}

// ─── AYANAMSHA ────────────────────────────────────────────────────────────────
function getLahiriAyanamsha(year: number): number {
  return 23.853 + (year - 2000) * 0.01396;
}

// ─── JULIAN DAY ───────────────────────────────────────────────────────────────
function toJulianDay(year: number, month: number, day: number, hourUTC: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y
    + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn + (hourUTC - 12) / 24;
}

function toSidereal(tropical: number, year: number): number {
  const s = tropical - getLahiriAyanamsha(year);
  return ((s % 360) + 360) % 360;
}

function getNakshatraData(lng: number) {
  const norm  = ((lng % 360) + 360) % 360;
  const idx   = Math.floor(norm / (360 / 27));
  const inNak = norm % (360 / 27);
  const pada  = Math.min(4, Math.floor(inNak / (360 / 108)) + 1);
  return {
    nakshatra:     NAKSHATRAS[idx] ?? 'Ashwini',
    nakshatraLord: NAKSHATRA_LORDS[idx] ?? 'Ketu',
    nakshatraPada: pada,
  };
}

function getRashiData(lng: number) {
  const norm = ((lng % 360) + 360) % 360;
  const idx  = Math.floor(norm / 30);
  return { rashi: RASHIS[idx] ?? 'Mesh', rashiIndex: idx, degree: norm % 30 };
}

function getHouse(planetLng: number, lagnaLng: number): number {
  return Math.floor(((planetLng - lagnaLng + 360) % 360) / 30) + 1;
}

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

function getStrength(planet: string, rashiIdx: number, isRetrograde: boolean): number {
  let s = 50;
  if (EXALT_RASHI[planet] === rashiIdx) s += 30;
  if (DEBIL_RASHI[planet] === rashiIdx) s -= 25;
  if (OWN_RASHIS[planet]?.includes(rashiIdx)) s += 20;
  if (isRetrograde && planet !== 'Rahu' && planet !== 'Ketu') s += 8;
  return Math.min(100, Math.max(5, s));
}

// ─── DASHA QUALITY CLASSIFIER ─────────────────────────────────────────────────
// Parashara classical rules for Dasha quality
const SHUBH_LORDS  = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
const ASHUBH_LORDS = new Set(['Saturn', 'Rahu', 'Ketu', 'Sun', 'Mars']);

function getDashaQuality(
  mdLord: string,
  adLord: string,
  pdLord?: string
): 'Shubh' | 'Ashubh' | 'Madhyam' {
  const lords = pdLord ? [mdLord, adLord, pdLord] : [mdLord, adLord];
  const shubhCount  = lords.filter(l => SHUBH_LORDS.has(l)).length;
  const ashubhCount = lords.filter(l => ASHUBH_LORDS.has(l)).length;
  if (shubhCount > ashubhCount) return 'Shubh';
  if (ashubhCount > shubhCount) return 'Ashubh';
  return 'Madhyam';
}

// ─── CORE DASHA CALCULATOR — ALL 4 LEVELS ────────────────────────────────────
/**
 * Parashara BPHS Vimshottari Dasha formula:
 *
 * Mahadasha duration    = DASHA_YEARS[lord] / 120 × 120 years
 * Antardasha duration   = MD_duration × (AD_lord_years / 120)
 * Pratyantar duration   = AD_duration × (PD_lord_years / 120)
 * Sookshma duration     = PD_duration × (SD_lord_years / 120)
 *
 * Starting lord for sub-periods = the dasha lord itself
 * (each level starts with its own lord)
 */
export function calcDasha(moonSiderealLng: number, dob: Date): {
  currentMahadasha:  DashaPeriod;
  currentAntardasha: DashaPeriod;
  currentPratyantar: DashaPeriodExtended;
  currentSookshma:   DashaPeriodExtended;
  antardashas:       DashaPeriod[];
  pratyantar:        DashaPeriodExtended[];
  dashaBalance:      string;
} {
  const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
  const now         = new Date();

  // ── Level 1: Mahadasha ──────────────────────────────────────────────────────
  const nakLen   = 360 / 27;
  const posInNak = (moonSiderealLng % nakLen) / nakLen;
  const nakIdx   = Math.floor(((moonSiderealLng % 360) + 360) % 360 / nakLen);
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

  const curMD  = mahadashas.find(d => d.startDate <= now && d.endDate > now) ?? mahadashas[0]!;
  const mdDurMs = curMD.endDate.getTime() - curMD.startDate.getTime();
  const mdIdx  = DASHA_SEQUENCE.indexOf(curMD.lord);

  // ── Level 2: Antardasha ─────────────────────────────────────────────────────
  // Starts with Mahadasha lord itself (Parashara rule)
  const antardashas: DashaPeriod[] = [];
  let adCur = new Date(curMD.startDate);
  for (let i = 0; i < 9; i++) {
    const adLord = DASHA_SEQUENCE[(mdIdx + i) % 9]!;
    const adDurMs = mdDurMs * (DASHA_YEARS[adLord]! / VIMSHOTTARI_TOTAL);
    const adEnd  = new Date(adCur.getTime() + adDurMs);
    antardashas.push({ lord: adLord, startDate: new Date(adCur), endDate: adEnd });
    adCur = new Date(adEnd);
  }

  const curAD    = antardashas.find(d => d.startDate <= now && d.endDate > now) ?? antardashas[0]!;
  const adDurMs  = curAD.endDate.getTime() - curAD.startDate.getTime();
  const adIdx    = DASHA_SEQUENCE.indexOf(curAD.lord);

  // ── Level 3: Pratyantar Dasha ───────────────────────────────────────────────
  // Starts with Antardasha lord itself (Parashara rule)
  const pratyantar: DashaPeriodExtended[] = [];
  let pdCur = new Date(curAD.startDate);
  for (let i = 0; i < 9; i++) {
    const pdLord  = DASHA_SEQUENCE[(adIdx + i) % 9]!;
    const pdDurMs = adDurMs * (DASHA_YEARS[pdLord]! / VIMSHOTTARI_TOTAL);
    const pdEnd   = new Date(pdCur.getTime() + pdDurMs);
    const pdDays  = Math.round(pdDurMs / (24 * 60 * 60 * 1000));
    const remMs   = pdEnd.getTime() - now.getTime();
    const remDays = Math.max(0, Math.round(remMs / (24 * 60 * 60 * 1000)));
    pratyantar.push({
      lord:         pdLord,
      startDate:    new Date(pdCur),
      endDate:      pdEnd,
      durationDays: pdDays,
      quality:      getDashaQuality(curMD.lord, curAD.lord, pdLord),
      remainingDays: remDays,
    });
    pdCur = new Date(pdEnd);
  }

  const curPD   = pratyantar.find(d => d.startDate <= now && d.endDate > now) ?? pratyantar[0]!;
  const pdDurMs = curPD.endDate.getTime() - curPD.startDate.getTime();
  const pdIdx   = DASHA_SEQUENCE.indexOf(curPD.lord);

  // ── Level 4: Sookshma Dasha ─────────────────────────────────────────────────
  // Starts with Pratyantar lord itself (Parashara rule)
  const sookshmaList: DashaPeriodExtended[] = [];
  let sdCur = new Date(curPD.startDate);
  for (let i = 0; i < 9; i++) {
    const sdLord  = DASHA_SEQUENCE[(pdIdx + i) % 9]!;
    const sdDurMs = pdDurMs * (DASHA_YEARS[sdLord]! / VIMSHOTTARI_TOTAL);
    const sdEnd   = new Date(sdCur.getTime() + sdDurMs);
    const sdDays  = Math.round(sdDurMs / (24 * 60 * 60 * 1000) * 10) / 10; // 1 decimal
    const remMs   = sdEnd.getTime() - now.getTime();
    const remDays = Math.max(0, Math.round(remMs / (24 * 60 * 60 * 1000)));
    sookshmaList.push({
      lord:         sdLord,
      startDate:    new Date(sdCur),
      endDate:      sdEnd,
      durationDays: sdDays,
      quality:      getDashaQuality(curMD.lord, curAD.lord, sdLord),
      remainingDays: remDays,
    });
    sdCur = new Date(sdEnd);
  }

  const curSD = sookshmaList.find(d => d.startDate <= now && d.endDate > now) ?? sookshmaList[0]!;

  // ── Dasha balance string ────────────────────────────────────────────────────
  const rem  = curMD.endDate.getTime() - now.getTime();
  const remY = Math.floor(rem / MS_PER_YEAR);
  const remM = Math.floor((rem % MS_PER_YEAR) / (30.44 * 24 * 60 * 60 * 1000));

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

// ─── PLANET LONGITUDES (Meeus approximation) ──────────────────────────────────
function getTropicalLongitudes(jd: number): Record<string, number> {
  const T    = (jd - 2451545.0) / 36525;
  const norm = (x: number) => ((x % 360) + 360) % 360;
  const L0   = norm(280.46646 + 36000.76983 * T);
  const M    = (357.52911 + 35999.05029 * T) * Math.PI / 180;
  const sun  = norm(L0 + (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M));
  const Lm   = 218.3165 + 481267.8813 * T;
  const Mm   = (134.9634 + 477198.8676 * T) * Math.PI / 180;
  const moon = norm(Lm + 6.289 * Math.sin(Mm));
  const rahu = norm(125.045 - 1934.136 * T);
  return {
    Sun: sun, Moon: moon,
    Mars:    norm(355.433 + 19140.299 * T),
    Mercury: norm(252.251 + 149472.675 * T),
    Jupiter: norm(34.351  + 3034.906  * T),
    Venus:   norm(181.979 + 58517.816 * T),
    Saturn:  norm(50.077  + 1222.114  * T),
    Rahu: rahu, Ketu: norm(rahu + 180),
  };
}

function getLagnaLongitude(jd: number, lat: number, lng: number): number {
  const T    = (jd - 2451545.0) / 36525;
  const GMST = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T;
  const LST  = ((GMST + lng) % 360 + 360) % 360;
  const eps  = (23.439291 - 0.013004 * T) * Math.PI / 180;
  const latR = lat * Math.PI / 180;
  const lstR = LST * Math.PI / 180;
  const y    = -Math.cos(lstR);
  const x    = Math.sin(eps) * Math.tan(latR) + Math.cos(eps) * Math.sin(lstR);
  const asc  = Math.atan2(y, x) * 180 / Math.PI;
  return ((asc % 360) + 360) % 360;
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

function calcPanchang(sunLng: number, moonLng: number): PanchangData {
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
    nakshatra: getNakshatraData(moonLng).nakshatra,
    sunrise:   fmt(rise),
    sunset:    fmt(set),
    rahuKaal:        { start: fmt(rahuStart), end: fmt(rahuStart + segLen) },
    abhijeetMuhurta: { start: fmt(abStart),   end: fmt(abEnd) },
    choghadiya:      { name: cgName, type: CG_TYPE[cgName] ?? 'Neutral' },
  };
}

// ─── MAIN KUNDALI BUILDER ─────────────────────────────────────────────────────
export function buildKundali(data: BirthData): KundaliData {
  const [year, month, day] = data.dob.split('-').map(Number) as [number,number,number];
  const [hour, min]        = data.tob.split(':').map(Number) as [number,number];
  const utcHour            = hour + min / 60 - 5.5;
  const jd       = toJulianDay(year, month!, day!, utcHour);
  const tropical = getTropicalLongitudes(jd);
  const sidereal: Record<string,number> = {};
  for (const [p, lng] of Object.entries(tropical)) {
    sidereal[p] = toSidereal(lng, year);
  }
  const lagnaT = getLagnaLongitude(jd, data.lat, data.lng);
  const lagnaS = toSidereal(lagnaT, year);
  const lagnaR = getRashiData(lagnaS);

  const planets: Record<string, PlanetPosition> = {};
  for (const [name, sLng] of Object.entries(sidereal)) {
    const rData   = getRashiData(sLng);
    const nData   = getNakshatraData(sLng);
    const isRetro = name === 'Rahu' || name === 'Ketu';
    planets[name] = {
      name,
      siderealLongitude: sLng,
      rashi:         rData.rashi,
      degree:        Math.round(rData.degree * 10) / 10,
      nakshatra:     nData.nakshatra,
      nakshatraPada: nData.nakshatraPada,
      nakshatraLord: nData.nakshatraLord,
      isRetrograde:  isRetro,
      house:         getHouse(sLng, lagnaS),
      strength:      getStrength(name, rData.rashiIndex, isRetro),
    };
  }

  const moonS = sidereal['Moon'] ?? 0;
  const moonN = getNakshatraData(moonS);
  const dob   = new Date(`${data.dob}T${data.tob}:00+05:30`);
  const dasha = calcDasha(moonS, dob);
  const panch = calcPanchang(sidereal['Sun'] ?? 0, moonS);

  return {
    lagna:              lagnaR.rashi,
    lagnaLord:          RASHI_LORDS[lagnaR.rashi] ?? 'Mars',
    planets,
    nakshatra:          moonN.nakshatra,
    nakshatraLord:      moonN.nakshatraLord,
    currentMahadasha:   dasha.currentMahadasha,
    currentAntardasha:  dasha.currentAntardasha,
    currentPratyantar:  dasha.currentPratyantar,  // ✅ NEW
    currentSookshma:    dasha.currentSookshma,    // ✅ NEW
    antardashas:        dasha.antardashas,         // ✅ NEW — full list
    pratyantar:         dasha.pratyantar,          // ✅ NEW — full list
    dashaBalance:       dasha.dashaBalance,
    panchang:           panch,
    birthData:          data,
  };
}