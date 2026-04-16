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
  remedy: string;
  practicalTip: string;
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

type GuruInsight = {
  insight: string;
  remedy: string;
  practicalTip: string;
};

const GURU_INSIGHTS: GuruInsight[] = [
  {
    insight: "The cosmic tides are aligned in your favor today, dear seeker. Saturn's disciplined gaze meets Jupiter's grace — a rare confluence that sharpens both your Karma and your Labh. Trust the quiet voice within; it carries the wisdom of the Shastras.",
    remedy: "Chant the Gayatri Mantra 21 times at sunrise, facing east. Offer water to the rising Sun — this strengthens your Surya energy and clears mental fog.",
    practicalTip: "Avoid signing any major contracts or making large financial commitments on this day. Instead, use today to prepare, research, and refine your plans.",
  },
  {
    insight: "I understand the weight you may be carrying right now. The stars reveal a Karmic Learning phase — not a setback, but an invitation from the cosmos to realign your Dharma with deeper intention. Shanti comes not from stillness but from purposeful motion.",
    remedy: "Feed green grass or spinach leaves to a cow before noon. This act of seva pacifies Saturn's influence and opens channels of unexpected Labh.",
    practicalTip: "In your workplace today, listen twice before you speak once. Agreements made in patience carry far greater success than those born from urgency.",
  },
  {
    insight: "Venus casts her golden light across your relationship axis today. The Shastras speak of a moment when the heart and the stars sing the same song — this is such a moment for you. Your authentic expression of care will unlock abundance you have long awaited.",
    remedy: "Light a ghee diya near a Tulsi plant this evening and offer a marigold flower. Recite 'Om Shri Lakshmiyai Namah' 11 times to invite harmony into your home.",
    practicalTip: "Reach out to a mentor, elder, or collaborator today with a genuine word of gratitude. This single gesture will create positive energy in your professional karma.",
  },
  {
    insight: "The lunar current is amplifying your intuition to its absolute peak today. In Vedic thought, this is what the Rishis called 'Prajna' — the moment when inner knowing surpasses outer knowing. Do not dismiss the quiet nudges you feel.",
    remedy: "Place a glass of water near your bed tonight and offer it to a Peepal tree the following morning. This ritual purifies the Chandra energy in your chart.",
    practicalTip: "Keep a small notebook close today and write down every idea that surfaces — even fleeting ones. The seeds planted today can grow into your greatest future endeavour.",
  },
  {
    insight: "Jupiter expands your horizon with quiet, deliberate grace today. The Brihat Parashara Hora Shastra reminds us that seemingly small decisions carry the largest Karmic weight. You are at precisely such a crossroads. Choose with clarity, not haste.",
    remedy: "Chant 'Om Gram Greem Graum Sah Gurave Namah' 27 times before any important meeting or decision. This invokes Jupiter's blessings for wisdom and right judgment.",
    practicalTip: "Avoid being swayed by the opinions of the crowd today. Trust your own research and conviction. Big decisions deserve quiet reflection, not borrowed certainty.",
  },
  {
    insight: "Mars fuels your vitality and moral courage today with exceptional force. The Shastras speak of 'Veera Shakti' — the warrior's inner fire — and yours is fully lit. The Energy Shift you have been sensing is ready to become visible action.",
    remedy: "Begin the morning by offering red flowers to Lord Hanuman and chanting the Hanuman Chalisa. This channels Mars's raw energy into disciplined, purposeful strength.",
    practicalTip: "Take on the one task you have been postponing with courage. Begin it before noon. The momentum you create in these hours will carry you through the entire week.",
  },
  {
    insight: "Mercury governs communication, commerce, and clarity of thought today — and his position in your chart is exceptionally auspicious. The Shastras call this a 'Budha Uday' moment, where words become bridges between your vision and the world's response.",
    remedy: "Offer green moong dal to a cow or distribute it to those in need. Chant 'Om Budhaya Namah' 17 times before any important conversation or presentation.",
    practicalTip: "This is an ideal day for negotiation, writing proposals, or having that important conversation you have been delaying. Your words will carry unusual persuasive power today.",
  },
  {
    insight: "The Sun illuminates your Dharma path with particular brilliance today. In the great wisdom of the Upanishads, it is said: 'Tamaso ma jyotirgamaya' — lead me from darkness into light. Today, you are that light. Even thirty minutes devoted to your truest calling will set the cosmos in motion on your behalf.",
    remedy: "Offer Arghya to the Sun at dawn — cup water in both hands, face east, and let it fall as you chant 'Om Suryaya Namah' 12 times. This charges your solar plexus and will energy.",
    practicalTip: "Avoid Tuesday for starting new health routines or financial investments this week. Instead, use today — a Sun-favoured day — to make that single decision you have been postponing.",
  },
];

export function getGuruInsight(dob: string, today: Date = new Date()): GuruInsight {
  const seed = dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const idx = (seed + dayOfYear) % GURU_INSIGHTS.length;
  return GURU_INSIGHTS[idx];
}

const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const COLORS = ['Golden', 'Ivory', 'Crimson', 'Emerald', 'Saffron', 'Sky Blue', 'Rose', 'Bronze', 'Silver', 'Turmeric'];

export async function getVedicAnalysis(birthData: BirthData): Promise<TrikalResult> {
  const today = new Date();
  const energyScore = computeEnergyScore(birthData.dob, today);
  const pillarScores = computePillarScores(birthData.dob, today);
  const guruInsight = getGuruInsight(birthData.dob, today);

  const seed = birthData.dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const dailyRashi = RASHIS[seed % RASHIS.length];
  const luckyColor = COLORS[(seed + today.getDate()) % COLORS.length];
  const luckyNumber = (seed % 9) + 1;

  return {
    energyScore,
    pillarScores,
    insight: guruInsight.insight,
    remedy: guruInsight.remedy,
    practicalTip: guruInsight.practicalTip,
    dailyRashi,
    luckyColor,
    luckyNumber,
  };
}
