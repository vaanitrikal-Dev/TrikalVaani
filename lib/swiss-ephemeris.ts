/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 1.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: CORE VEDIC CALCULATION ENGINE ONLY
 * WARNING: DO NOT ADD JINI CODE HERE — JINI LIVES IN jini-engine.ts
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

export interface KundaliData {
  lagna: string;
  lagnaLord: string;
  planets: Record<string, PlanetPosition>;
  nakshatra: string;
  nakshatraLord: string;
  currentMahadasha: DashaPeriod;
  currentAntardasha: DashaPeriod;
  dashaBalance: string;
  panchang: PanchangData;
  birthData: BirthData;
}

function getLahiriAyanamsha(year: number): number {
  return 23.853 + (year - 2000) * 0.01396;
}

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
  Sun:4, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6
};
const DEBIL_RASHI: Record<string, number> = {
  Sun:10, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5, Saturn:0
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

function calcDasha(moonSiderealLng: number, dob: Date) {
  const nakLen    = 360 / 27;
  const posInNak  = (moonSiderealLng % nakLen) / nakLen;
  const nakIdx    = Math.floor(((moonSiderealLng % 360) + 360) % 360 / nakLen);
  const birthLord = NAKSHATRA_LORDS[nakIdx] ?? 'Ketu';
  const balance   = (1 - posInNak) * DASHA_YEARS[birthLord]!;
  const startIdx  = DASHA_SEQUENCE.indexOf(birthLord);
  const mahadashas: DashaPeriod[] = [];
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
  const curMD = mahadashas.find(d => d.startDate <= now && d.endDate > now) ?? mahadashas[0]!;
  const mdDur = curMD.endDate.getTime() - curMD.startDate.getTime();
  const mdIdx = DASHA_SEQUENCE.indexOf(curMD.lord);
  const antardashas: DashaPeriod[] = [];
  let adCur = new Date(curMD.startDate);
  for (let i = 0; i < 9; i++) {
    const adLord = DASHA_SEQUENCE[(mdIdx + i) % 9]!;
    const adDur  = mdDur * (DASHA_YEARS[adLord]! / 120);
    const adEnd  = new Date(adCur.getTime() + adDur);
    antardashas.push({ lord: adLord, startDate: new Date(adCur), endDate: adEnd });
    adCur = new Date(adEnd);
  }
  const curAD = antardashas.find(d => d.startDate <= now && d.endDate > now) ?? antardashas[0]!;
  const rem   = curMD.endDate.getTime() - now.getTime();
  const remY  = Math.floor(rem / (365.25 * 86400000));
  const remM  = Math.floor((rem % (365.25 * 86400000)) / (30.44 * 86400000));
  return {
    currentMahadasha:  curMD,
    currentAntardasha: curAD,
    dashaBalance: `${curMD.lord} Mahadasha — ${remY}y ${remM}m baki hai`,
  };
}

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
    yoga:      YOGAS[Math.floor(((sunLng + moonLng) % 360) / (360 / 27))] ?? 'Vishkumbha',
    nakshatra: getNakshatraData(moonLng).nakshatra,
    sunrise:   fmt(rise),
    sunset:    fmt(set),
    rahuKaal:        { start: fmt(rahuStart), end: fmt(rahuStart + segLen) },
    abhijeetMuhurta: { start: fmt(abStart),   end: fmt(abEnd) },
    choghadiya:      { name: cgName, type: CG_TYPE[cgName] ?? 'Neutral' },
  };
}

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
    lagna:             lagnaR.rashi,
    lagnaLord:         RASHI_LORDS[lagnaR.rashi] ?? 'Mars',
    planets,
    nakshatra:         moonN.nakshatra,
    nakshatraLord:     moonN.nakshatraLord,
    currentMahadasha:  dasha.currentMahadasha,
    currentAntardasha: dasha.currentAntardasha,
    dashaBalance:      dasha.dashaBalance,
    panchang:          panch,
    birthData:         data,
  };
}