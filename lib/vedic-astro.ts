/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 13.1 (GOD-LEVEL)
 * SIGNED: ROHIIT GUPTA, CEO
 * ANY UNAUTHORIZED CHANGE WILL BREAK VEDIC CALCULATIONS.
 */
/**
 * TRIKAL VAANI - UNIVERSAL VEDIC ENGINE V13.0
 * Architect: Rohiit Gupta (CEO)
 * Standard: Prokerala API Integration + Universal interpretation
 */

// --- 1. CORE TYPES ---
export type Category = 'JOB' | 'KIDS' | 'RETIREMENT' | 'LOVE' | 'WEALTH' | 'HEALTH' | 'FOREIGN' | 'EX_BACK' | 'TOXIC_BOSS';

export interface VedicResponse {
  energyScore: number;
  mainInsight: string;
  flags: { type: 'RED' | 'GREEN'; msg: string }[];
  panchang: {
    abhijeet: { start: string; end: string };
    rahuKaal: { start: string; end: string };
    choghadiya: string;
  };
  remedies: { level: string; action: string; benefit: string }[];
}

// --- 2. UNIVERSAL CATEGORY MAPPING (The Brain) ---
const CATEGORY_RULES: Record<Category, { houses: number[]; planets: string[]; label: string }> = {
  JOB: { houses: [6, 10], planets: ['Saturn', 'Sun'], label: 'Karma & Career' },
  KIDS: { houses: [5, 9], planets: ['Jupiter'], label: 'Santana Bhava' },
  RETIREMENT: { houses: [8, 12], planets: ['Saturn', 'Jupiter'], label: 'Moksha/Settlement' },
  LOVE: { houses: [5, 7], planets: ['Venus'], label: 'Vivaha/Prem' },
  WEALTH: { houses: [2, 11], planets: ['Jupiter', 'Venus'], label: 'Dhan/Labh' },
  HEALTH: { houses: [1, 6], planets: ['Sun', 'Mars'], label: 'Tanum Bhava' },
  FOREIGN: { houses: [9, 12], planets: ['Rahu'], label: 'Videsh Yoga' },
  EX_BACK: { houses: [7, 8], planets: ['Venus', 'Mars'], label: 'Karmic Love' },
  TOXIC_BOSS: { houses: [10, 6], planets: ['Sun', 'Saturn'], label: 'Authority Struggle' }
};

// --- 3. HIGH-PRECISION PANCHANG CALCULATION (Fixes 6 PM Error) ---
export function calculateVedicTimings(sunrise: string, sunset: string, dayOfWeek: number) {
  const parse = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const rise = parse(sunrise);
  const set = parse(sunset);
  const dinman = set - rise;
  
  const format = (min: number) => {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Rahu Kaal Segments (Vedic Standard)
  const rahuSegments = [1, 5, 1, 4, 3, 2, 0]; // Mon-Sun
  const segmentDuration = dinman / 8;
  const rahuStart = rise + (rahuSegments[dayOfWeek] * segmentDuration);

  return {
    abhijeet: { 
      start: format(rise + (7 * (dinman/15))), 
      end: format(rise + (8 * (dinman/15))) 
    },
    rahuKaal: { 
      start: format(rahuStart), 
      end: format(rahuStart + segmentDuration) 
    }
  };
}

// --- 4. THE INTERPRETATION ENGINE (Universal Answers) ---
export function generateVedicInsight(apiData: any, category: Category): VedicResponse {
  const rule = CATEGORY_RULES[category];
  const planet = apiData.planets[rule.planets[0]];
  const flags: { type: 'RED' | 'GREEN'; msg: string }[] = [];
  
  // Logic for Red/Green Flags
  if (planet.is_retrograde) {
    flags.push({ type: 'RED', msg: `${planet.name} Vakri (Retrograde) hai—purane karmo ki rukaawat hai.` });
  } else if (planet.strength > 65) {
    flags.push({ type: 'GREEN', msg: `${planet.name} Balwaan hai—is kshetra mein siddhi nishchit hai.` });
  }

  // Category-specific Logic
  let insight = "";
  if (category === 'EX_BACK') {
    insight = planet.strength > 50 ? "Shukra ki sthiti anukool hai, prayaas safal ho sakte hain." : "Abhi 'No Contact' hi behtar hai, grah vipreet hain.";
  } else if (category === 'JOB') {
    insight = "Dasham bhav ka swami mazboot hai, naye avsar milenge.";
  } else {
    insight = `Aapke ${rule.label} ka vishleshan batata hai ki samay parivartan-sheel hai.`;
  }

  return {
    energyScore: Math.round(planet.strength) || 75,
    mainInsight: insight,
    flags: flags,
    panchang: calculateVedicTimings(apiData.sunrise, apiData.sunset, new Date().getDay()),
    remedies: [
      { level: 'Easy', action: `Chant ${planet.name} mantra 108 times.`, benefit: 'Removes primary obstacles' }
    ]
  };
}

// --- 5. E-E-A-T AUTHORITY LOGIC ---
export const CEO_VARS = {
  FOUNDER: "Rohiit Gupta",
  ENGINE: "Trikal-Vaani-Core-V13",
  TIMEZONE: "Asia/Kolkata"
};