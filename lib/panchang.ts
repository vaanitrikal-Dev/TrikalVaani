/**
 * FILE: lib/panchang.ts
 * Trikal Vaani — Real Panchang Calculator
 * CEO: Rohiit Gupta | Chief Vedic Architect
 * Version: 1.0 | Date: 2026-04-27
 *
 * Calculates from Sun + Moon sidereal longitudes:
 *   Tithi, Vara, Nakshatra, Yoga, Karana,
 *   Rahu Kaal, Abhijeet Muhurta, Choghadiya
 */

export interface PanchangData {
  vara:            string;   // Day lord
  varaLord:        string;
  tithi:           string;   // Lunar day 1-30
  tithiNumber:     number;
  tithiPaksha:     'Shukla' | 'Krishna';
  nakshatra:       string;   // Moon nakshatra
  nakshatraLord:   string;
  yoga:            string;   // Nitya Yoga
  yogaType:        'Shubh' | 'Ashubh' | 'Madhyam';
  karana:          string;
  rahuKaal:        { start: string; end: string; avoid: string };
  abhijeetMuhurta: { start: string; end: string };
  choghadiya:      { name: string; type: 'Shubh' | 'Ashubh' | 'Madhyam' };
  yamaghanta:      { start: string; end: string };
  guliKaal:        { start: string; end: string };
  sunrise:         string;
  sunset:          string;
  moonPhase:       string;
  paksha:          'Shukla Paksha' | 'Krishna Paksha';
  isAmavasya:      boolean;
  isPurnima:       boolean;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TITHIS = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya',
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

const NAKSHATRA_LORDS = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter',
  'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
  'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

const NITYA_YOGAS = [
  { name: 'Vishkambha', type: 'Ashubh'  },
  { name: 'Priti',      type: 'Shubh'   },
  { name: 'Ayushman',   type: 'Shubh'   },
  { name: 'Saubhagya',  type: 'Shubh'   },
  { name: 'Shobhana',   type: 'Shubh'   },
  { name: 'Atiganda',   type: 'Ashubh'  },
  { name: 'Sukarma',    type: 'Shubh'   },
  { name: 'Dhriti',     type: 'Shubh'   },
  { name: 'Shula',      type: 'Ashubh'  },
  { name: 'Ganda',      type: 'Ashubh'  },
  { name: 'Vriddhi',    type: 'Shubh'   },
  { name: 'Dhruva',     type: 'Shubh'   },
  { name: 'Vyaghata',   type: 'Ashubh'  },
  { name: 'Harshana',   type: 'Shubh'   },
  { name: 'Vajra',      type: 'Ashubh'  },
  { name: 'Siddhi',     type: 'Shubh'   },
  { name: 'Vyatipata',  type: 'Ashubh'  },
  { name: 'Variyana',   type: 'Madhyam' },
  { name: 'Parigha',    type: 'Ashubh'  },
  { name: 'Shiva',      type: 'Shubh'   },
  { name: 'Siddha',     type: 'Shubh'   },
  { name: 'Sadhya',     type: 'Shubh'   },
  { name: 'Shubha',     type: 'Shubh'   },
  { name: 'Shukla',     type: 'Shubh'   },
  { name: 'Brahma',     type: 'Shubh'   },
  { name: 'Indra',      type: 'Shubh'   },
  { name: 'Vaidhriti',  type: 'Ashubh'  },
];

const KARANAS = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara',
  'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
];

const VARA_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const VARA_NAMES = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'];

// Rahu Kaal timing by day (fraction of day from sunrise, duration = 1/8 of day)
const RAHU_KAAL_ORDER = [8, 2, 7, 5, 6, 4, 3]; // Sun=8th, Mon=2nd... (1-indexed period)

// Choghadiya sequence for day and night
const CHOGHADIYA_DAY: Array<{ name: string; type: 'Shubh' | 'Ashubh' | 'Madhyam' }> = [
  { name: 'Udveg',  type: 'Ashubh'  },
  { name: 'Char',   type: 'Madhyam' },
  { name: 'Labh',   type: 'Shubh'   },
  { name: 'Amrit',  type: 'Shubh'   },
  { name: 'Kaal',   type: 'Ashubh'  },
  { name: 'Shubh',  type: 'Shubh'   },
  { name: 'Rog',    type: 'Ashubh'  },
  { name: 'Udveg',  type: 'Ashubh'  },
];

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function calculatePanchang(
  sunLongitude:  number,  // sidereal
  moonLongitude: number,  // sidereal
  date:          Date,
  lat:           number = 28.6139,  // default Delhi
  lng:           number = 77.2090,
): PanchangData {

  // ── Vara (day of week) ───────────────────────────────────────────────────
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...
  const vara      = VARA_NAMES[dayOfWeek];
  const varaLord  = VARA_LORDS[dayOfWeek];

  // ── Tithi ────────────────────────────────────────────────────────────────
  let elongation = moonLongitude - sunLongitude;
  if (elongation < 0) elongation += 360;

  const tithiNum    = Math.floor(elongation / 12) + 1; // 1-30
  const tithiIndex  = (tithiNum - 1) % 15;
  const isPurnima   = tithiNum === 15;
  const isAmavasya  = tithiNum === 30;
  const paksha      = tithiNum <= 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  const tithiPaksha = tithiNum <= 15 ? 'Shukla' : 'Krishna';

  let tithiName = TITHIS[tithiIndex];
  if (tithiNum === 15) tithiName = 'Purnima';
  if (tithiNum === 30) tithiName = 'Amavasya';

  // ── Nakshatra ────────────────────────────────────────────────────────────
  const nakshatraIndex = Math.floor(moonLongitude / (360 / 27));
  const nakshatra      = NAKSHATRAS[nakshatraIndex] ?? 'Ashwini';
  const nakshatraLord  = NAKSHATRA_LORDS[nakshatraIndex] ?? 'Ketu';

  // ── Yoga (Nitya) ─────────────────────────────────────────────────────────
  const yogaValue = ((sunLongitude + moonLongitude) % 360) / (360 / 27);
  const yogaIndex = Math.floor(yogaValue) % 27;
  const yogaData  = NITYA_YOGAS[yogaIndex] ?? NITYA_YOGAS[0];

  // ── Karana ───────────────────────────────────────────────────────────────
  const karanaNum   = Math.floor(elongation / 6);
  const karanaIndex = karanaNum % 11;
  const karana      = KARANAS[karanaIndex] ?? 'Bava';

  // ── Sunrise / Sunset (approximate for given lat/lng) ─────────────────────
  const { sunrise, sunset } = approximateSunriseSunset(date, lat, lng);

  // ── Rahu Kaal ────────────────────────────────────────────────────────────
  const dayDuration  = sunset - sunrise; // in minutes
  const periodLength = dayDuration / 8;
  const rahuPeriod   = RAHU_KAAL_ORDER[dayOfWeek] - 1; // 0-indexed
  const rahuStart    = sunrise + rahuPeriod * periodLength;
  const rahuEnd      = rahuStart + periodLength;

  const rahuKaal = {
    start:  minutesToTime(rahuStart),
    end:    minutesToTime(rahuEnd),
    avoid:  'Avoid starting new work, travel, or investments during Rahu Kaal',
  };

  // ── Abhijeet Muhurta ─────────────────────────────────────────────────────
  const noon        = (sunrise + sunset) / 2;
  const abhijeetStart = noon - 24; // 24 minutes before noon
  const abhijeetEnd   = noon + 24;

  const abhijeetMuhurta = {
    start: minutesToTime(abhijeetStart),
    end:   minutesToTime(abhijeetEnd),
  };

  // ── Choghadiya (current) ─────────────────────────────────────────────────
  const nowMinutes      = date.getHours() * 60 + date.getMinutes();
  const choghadiyaIndex = Math.floor((nowMinutes - sunrise) / (periodLength)) % 8;
  const safeIndex       = Math.max(0, Math.min(7, choghadiyaIndex));
  const choghadiya      = CHOGHADIYA_DAY[safeIndex] ?? CHOGHADIYA_DAY[0];

  // ── Yamaghanta ───────────────────────────────────────────────────────────
  const yamaOrder     = [5, 4, 3, 2, 1, 0, 6]; // period index by day
  const yamaPeriod    = yamaOrder[dayOfWeek] ?? 0;
  const yamaStart     = sunrise + yamaPeriod * periodLength;
  const yamaEnd       = yamaStart + periodLength;

  // ── Guli Kaal ────────────────────────────────────────────────────────────
  const guliOrder     = [6, 5, 4, 3, 2, 1, 0];
  const guliPeriod    = guliOrder[dayOfWeek] ?? 0;
  const guliStart     = sunrise + guliPeriod * periodLength;
  const guliEnd       = guliStart + periodLength;

  // ── Moon phase ───────────────────────────────────────────────────────────
  const moonPhase = getMoonPhase(elongation);

  return {
    vara,
    varaLord,
    tithi:           tithiName,
    tithiNumber:     tithiNum,
    tithiPaksha,
    nakshatra,
    nakshatraLord,
    yoga:            yogaData.name,
    yogaType:        yogaData.type as 'Shubh' | 'Ashubh' | 'Madhyam',
    karana,
    rahuKaal,
    abhijeetMuhurta,
    choghadiya,
    yamaghanta:      { start: minutesToTime(yamaStart), end: minutesToTime(yamaEnd) },
    guliKaal:        { start: minutesToTime(guliStart),  end: minutesToTime(guliEnd)  },
    sunrise:         minutesToTime(sunrise),
    sunset:          minutesToTime(sunset),
    moonPhase,
    paksha,
    isAmavasya,
    isPurnima,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function approximateSunriseSunset(
  date: Date,
  lat:  number,
  lng:  number,
): { sunrise: number; sunset: number } {
  // Solar declination
  const dayOfYear   = getDayOfYear(date);
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180);

  // Hour angle
  const latRad    = lat * Math.PI / 180;
  const declRad   = declination * Math.PI / 180;
  const cosH      = -Math.tan(latRad) * Math.tan(declRad);
  const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosH))) * 180 / Math.PI;

  // UTC offset from longitude
  const utcOffset = lng / 15;

  // Sunrise/sunset in minutes from midnight (local time)
  const sunriseUTC = 12 - hourAngle / 15;
  const sunsetUTC  = 12 + hourAngle / 15;

  // Convert to IST (UTC+5:30 = +5.5 hours)
  const IST_OFFSET = 5.5;
  const sunrise    = (sunriseUTC + IST_OFFSET - utcOffset) * 60;
  const sunset     = (sunsetUTC  + IST_OFFSET - utcOffset) * 60;

  return {
    sunrise: Math.round(sunrise),
    sunset:  Math.round(sunset),
  };
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff  = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function minutesToTime(minutes: number): string {
  const h   = Math.floor(minutes / 60) % 24;
  const m   = Math.floor(minutes % 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getMoonPhase(elongation: number): string {
  if (elongation < 45)  return 'Waxing Crescent';
  if (elongation < 90)  return 'First Quarter';
  if (elongation < 135) return 'Waxing Gibbous';
  if (elongation < 180) return 'Full Moon';
  if (elongation < 225) return 'Waning Gibbous';
  if (elongation < 270) return 'Last Quarter';
  if (elongation < 315) return 'Waning Crescent';
  return 'New Moon';
}
