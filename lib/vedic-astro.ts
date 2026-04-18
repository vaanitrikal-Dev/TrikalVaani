/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 14.5 (GOD-LEVEL - MULTI-PLANET + CHOGHADIYA + DASHA-READY)
 * SIGNED: ROHIIT GUPTA, CEO
 * ANY UNAUTHORIZED CHANGE WILL BREAK VEDIC CALCULATIONS.
 */

// --- 1. CORE TYPES & INTERFACES ---
export type Category = 'JOB' | 'KIDS' | 'RETIREMENT' | 'LOVE' | 'WEALTH' | 'HEALTH' | 'FOREIGN' | 'EX_BACK' | 'TOXIC_BOSS';

export interface PlanetData {
  name: string;
  strength: number;
  is_retrograde: boolean;
  house?: number;
}

export interface VedicResponse {
  energyScore: number | null;
  mainInsight: string;
  flags: { type: 'RED' | 'GREEN'; msg: string; planet: string }[];
  panchang: {
    abhijeet: { start: string; end: string };
    rahuKaal: { start: string; end: string };
    choghadiya: { name: string; type: 'GOOD' | 'NEUTRAL' | 'BAD'; meaning: string };
  };
  remedies: { level: 'Easy' | 'Medium' | 'Advanced'; action: string; benefit: string }[];
  isDataIncomplete: boolean;
}

// --- 2. CATEGORY RULES (MULTI-PLANET WEIGHTING) ---
const CATEGORY_RULES: Record<Category, { planets: string[]; label: string }> = {
  JOB: { planets: ['Saturn', 'Sun'], label: 'Karma & Career' },
  KIDS: { planets: ['Jupiter', 'Moon'], label: 'Santana Bhava' },
  RETIREMENT: { planets: ['Saturn', 'Jupiter'], label: 'Moksha/Settlement' },
  LOVE: { planets: ['Venus', 'Moon'], label: 'Vivaha/Prem' },
  WEALTH: { planets: ['Jupiter', 'Venus'], label: 'Dhan/Labh' },
  HEALTH: { planets: ['Sun', 'Mars'], label: 'Tanum Bhava' },
  FOREIGN: { planets: ['Rahu', 'Saturn'], label: 'Videsh Yoga' },
  EX_BACK: { planets: ['Venus', 'Mars'], label: 'Karmic Love' },
  TOXIC_BOSS: { planets: ['Sun', 'Saturn'], label: 'Authority Struggle' }
};

// --- 3. HIGH-PRECISION PANCHANG & CHOGHADIYA (The Math) ---
const DAY_CHOGHADIYA_SEQ: Record<number, string[]> = {
  0: ['UDVEG', 'CHAL', 'LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG'], // Sun
  1: ['AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAL', 'LABH', 'AMRIT'], // Mon
  2: ['ROG', 'UDVEG', 'CHAL', 'LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG'],   // Tue
  3: ['CHAL', 'LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAL'], // Wed
  4: ['LABH', 'AMRIT', 'KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAL', 'LABH'], // Thu
  5: ['SHUBH', 'ROG', 'UDVEG', 'CHAL', 'LABH', 'AMRIT', 'KAAL', 'SHUBH'], // Fri
  6: ['KAAL', 'SHUBH', 'ROG', 'UDVEG', 'CHAL', 'LABH', 'AMRIT', 'KAAL'], // Sat
};

const CHOGHADIYA_META: any = {
  AMRIT: { type: 'GOOD', meaning: 'Sarva-Siddhi (Best for all work)' },
  LABH: { type: 'GOOD', meaning: 'Excellent for Gains' },
  SHUBH: { type: 'GOOD', meaning: 'Good for auspicious starts' },
  CHAL: { type: 'NEUTRAL', meaning: 'Neutral - Good for routine work' },
  UDVEG: { type: 'BAD', meaning: 'High Anxiety/Stress' },
  ROG: { type: 'BAD', meaning: 'Health/Conflict Risks' },
  KAAL: { type: 'BAD', meaning: 'Major Hurdles/Losses' },
};

export function calculateVedicTimings(sunrise: string, sunset: string, dayOfWeek: number) {
  const parse = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  
  const rise = parse(sunrise);
  const set = parse(sunset);
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const dinman = set - rise;
  
  const format = (min: number) => {
    const h = Math.floor(min / 60) % 24;
    const m = Math.round(min % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Choghadiya Logic
  const isDay = now >= rise && now < set;
  const seq = DAY_CHOGHADIYA_SEQ[dayOfWeek];
  const activeSeq = isDay ? seq : [...seq.slice(5), ...seq.slice(0, 5)];
  const duration = isDay ? dinman : (1440 - set + rise);
  const elapsed = isDay ? (now - rise) : (now >= set ? now - set : 1440 - set + now);
  const idx = Math.min(Math.floor(elapsed / (duration / 8)), 7);
  const choghadiyaName = activeSeq[idx];

  return {
    abhijeet: { start: format(rise + (7 * (dinman/15))), end: format(rise + (8 * (dinman/15))) },
    rahuKaal: { start: format(rise + ([1, 5, 1, 4, 3, 2, 0][dayOfWeek] * (dinman/8))), end: format(rise + (([1, 5, 1, 4, 3, 2, 0][dayOfWeek] + 1) * (dinman/8))) },
    choghadiya: { name: choghadiyaName, ...CHOGHADIYA_META[choghadiyaName] }
  };
}

// --- 4. THE INTERPRETATION ENGINE (Multi-Planet Weighted) ---
export function generateVedicInsight(apiData: any, category: Category): VedicResponse {
  try {
    const rule = CATEGORY_RULES[category];
    const flags: any[] = [];
    let totalStrength = 0;
    let validPlanets = 0;

    // NULL GUARD & MULTI-PLANET LOOP
    rule.planets.forEach((pName) => {
      const p = apiData.planets?.[pName];
      if (p) {
        validPlanets++;
        totalStrength += p.strength;
        if (p.is_retrograde) flags.push({ type: 'RED', msg: `${pName} Vakri hai—delay possible.`, planet: pName });
        if (p.strength > 70) flags.push({ type: 'GREEN', msg: `${pName} Balwaan hai—Siddhi nishchit hai.`, planet: pName });
      }
    });

    const isDataIncomplete = validPlanets === 0;
    const avgScore = isDataIncomplete ? null : Math.round(totalStrength / validPlanets);

    // Dynamic Remedies
    const mainPlanet = rule.planets[0];
    const remedies: any[] = [
      { level: 'Easy', action: `Chant ${mainPlanet} Beej Mantra 108 times.`, benefit: 'Calms the cosmic energy.' },
      { level: 'Medium', action: `Donate food on ${mainPlanet === 'Saturn' ? 'Saturday' : 'Sunday'}.`, benefit: 'Reduces Karmic debt.' },
      { level: 'Advanced', action: `Perform a dedicated Navagraha Shanti Puja.`, benefit: 'Total planetary alignment.' }
    ];

    return {
      energyScore: avgScore,
      mainInsight: isDataIncomplete ? "Birth data insufficient for analysis." : `Rohiit Gupta ji ka framework batata hai ki aapke ${rule.label} ke swami prabhavi hain.`,
      flags,
      panchang: calculateVedicTimings(apiData.sunrise || "06:00", apiData.sunset || "18:00", new Date().getDay()),
      remedies,
      isDataIncomplete
    };
  } catch (err) {
    return { energyScore: null, mainInsight: "System Overload. Try again.", flags: [], panchang: {} as any, remedies: [], isDataIncomplete: true };
  }
}

export const CEO_VARS = { FOUNDER: "Rohiit Gupta", VERSION: "14.5-GOLD" };