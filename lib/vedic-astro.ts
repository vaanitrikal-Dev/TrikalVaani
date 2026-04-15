/**
 * VedicAstro API & Gemini Flash Integration Placeholders
 * Replace these stubs with actual API calls when ready.
 */

export type BirthData = {
  name: string;
  dob: string;
  birth_time: string;
  city: string;
};

export type PillarScore = {
  wealth: number;
  career: number;
  love: number;
  health: number;
  students: number;
  peace: number;
};

export type TrikalResult = {
  energyScore: number;
  pillarScores: PillarScore;
  insight: string;
  dailyRashi: string;
  luckyColor: string;
  luckyNumber: number;
};

function digitSum(n: number): number {
  return String(n)
    .split('')
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
}

function normalize(val: number, min = 45, max = 95): number {
  return Math.min(max, Math.max(min, val));
}

export function computeEnergyScore(dob: string, today: Date = new Date()): number {
  const parts = dob.split('-');
  if (parts.length < 3) return 72;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  const lifeNumber = digitSum(year + month + day) % 9 || 9;
  const dailyVibration = digitSum(todayDay + todayMonth) % 9 || 9;
  const combined = (lifeNumber * 7 + dailyVibration * 5 + (month * 3)) % 51;

  return normalize(50 + combined);
}

export function computePillarScores(dob: string, today: Date = new Date()): PillarScore {
  const base = computeEnergyScore(dob, today);
  const seed = dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);

  return {
    wealth: normalize(base + ((seed * 3) % 20) - 10),
    career: normalize(base + ((seed * 7) % 18) - 9),
    love: normalize(base + ((seed * 11) % 22) - 11),
    health: normalize(base + ((seed * 5) % 16) - 8),
    students: normalize(base + ((seed * 9) % 14) - 7),
    peace: normalize(base + ((seed * 13) % 20) - 10),
  };
}

const INSIGHTS: string[] = [
  "The cosmic tides align in your favor today — trust your instincts and act before the evening hour. A hidden opportunity emerges from an unexpected conversation.",
  "Saturn's gaze sharpens your focus today. Channel this disciplined energy into one meaningful task and watch mountains yield to your persistence.",
  "Venus casts her golden light on your relationships. Express gratitude to someone close — it will unlock a wave of abundance you have been quietly awaiting.",
  "The lunar current amplifies your intuition to its peak. Keep a journal today; the ideas that surface carry seeds of long-term transformation.",
  "Jupiter expands your horizon with quiet grace. A seemingly small decision made today carries outsized consequences — choose with clarity, not haste.",
  "Mars fuels your vitality and courage. Begin that difficult conversation or project you have been postponing — the stars back your boldness.",
  "Mercury sharpens communication and wit. Negotiate, write, or pitch today and you will find words land exactly where they need to.",
  "The Sun illuminates your dharma path. Dedicate even thirty minutes to your truest calling and the universe will conspire to clear your road.",
];

export function getTrikalInsight(dob: string, today: Date = new Date()): string {
  const seed = dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const idx = (seed + dayOfYear) % INSIGHTS.length;
  return INSIGHTS[idx];
}

const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const COLORS = ['Golden', 'Ivory', 'Crimson', 'Emerald', 'Saffron', 'Sky Blue', 'Rose', 'Violet', 'Bronze', 'Silver'];

export async function getVedicAnalysis(birthData: BirthData): Promise<TrikalResult> {
  const today = new Date();
  const energyScore = computeEnergyScore(birthData.dob, today);
  const pillarScores = computePillarScores(birthData.dob, today);
  const insight = getTrikalInsight(birthData.dob, today);

  const seed = birthData.dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const dailyRashi = RASHIS[seed % RASHIS.length];
  const luckyColor = COLORS[(seed + today.getDate()) % COLORS.length];
  const luckyNumber = (seed % 9) + 1;

  return {
    energyScore,
    pillarScores,
    insight,
    dailyRashi,
    luckyColor,
    luckyNumber,
  };
}

export async function callVedicAstroAPI(_birthData: BirthData) {
  throw new Error('VedicAstroAPI integration not yet configured. Replace this stub.');
}

export async function callGeminiFlash(_prompt: string): Promise<string> {
  throw new Error('Gemini Flash integration not yet configured. Replace this stub.');
}
