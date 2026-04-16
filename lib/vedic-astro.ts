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

export type DashaPeriod = {
  planet: string;
  startYear: number;
  endYear: number;
  quality: 'excellent' | 'good' | 'testing' | 'moderate';
  theme: string;
};

export type LifeTimelineEvent = {
  year: number;
  title: string;
  description: string;
  category: 'career' | 'love' | 'wealth' | 'foreign' | 'health' | 'spiritual';
  intensity: 'peak' | 'high' | 'moderate';
};

export type RemedyItem = {
  level: 'easy' | 'medium' | 'deep';
  action: string;
  benefit: string;
  frequency: string;
};

export type PredictiveModule = {
  id: 'career' | 'love' | 'wealth' | 'foreign';
  title: string;
  subtitle: string;
  prediction: string;
  window: string;
  confidence: number;
  remedies: RemedyItem[];
};

export type GuruInsight = {
  insight: string;
  remedy: string;
  practicalTip: string;
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
  dashaPeriods: DashaPeriod[];
  lifeTimeline: LifeTimelineEvent[];
  predictiveModules: PredictiveModule[];
  generationLabel: 'genz' | 'millennial' | 'genx';
  ashtakvargaWealth: number;
  varshphalFocus: string;
};

function digitSum(n: number): number {
  return String(n)
    .split('')
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
}

function normalize(val: number, min = 45, max = 95): number {
  return Math.min(max, Math.max(min, val));
}

function getGeneration(birthYear: number): 'genz' | 'millennial' | 'genx' {
  if (birthYear >= 1996) return 'genz';
  if (birthYear >= 1981) return 'millennial';
  return 'genx';
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
  const combined = (lifeNumber * 7 + dailyVibration * 5 + month * 3) % 51;
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

const VIMSHOTTARI_SEQUENCE: { planet: string; years: number }[] = [
  { planet: 'Sun', years: 6 },
  { planet: 'Moon', years: 10 },
  { planet: 'Mars', years: 7 },
  { planet: 'Rahu', years: 18 },
  { planet: 'Jupiter', years: 16 },
  { planet: 'Saturn', years: 19 },
  { planet: 'Mercury', years: 17 },
  { planet: 'Ketu', years: 7 },
  { planet: 'Venus', years: 20 },
];

const DASHA_QUALITY: Record<string, { quality: DashaPeriod['quality']; theme: string }> = {
  Sun: { quality: 'good', theme: 'Authority, recognition & career elevation' },
  Moon: { quality: 'moderate', theme: 'Emotional growth, intuition & family bonds' },
  Mars: { quality: 'good', theme: 'Courage, ambition & dynamic action' },
  Rahu: { quality: 'testing', theme: 'Material desires, foreign connections & karmic lessons' },
  Jupiter: { quality: 'excellent', theme: 'Expansion, wisdom, wealth & spiritual growth' },
  Saturn: { quality: 'testing', theme: 'Discipline, Karmic Learning & long-term foundations' },
  Mercury: { quality: 'good', theme: 'Intelligence, communication, trade & learning' },
  Ketu: { quality: 'moderate', theme: 'Spiritual detachment, research & inner transformation' },
  Venus: { quality: 'excellent', theme: 'Love, luxury, creativity & sustained Labh' },
};

export function computeDashaPeriods(dob: string, currentYear: number): DashaPeriod[] {
  const seed = dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const birthYear = parseInt(dob.split('-')[0], 10);
  const startOffset = seed % 120;
  let cumulativeYears = 0;
  let startSeq = 0;
  for (let i = 0; i < VIMSHOTTARI_SEQUENCE.length; i++) {
    cumulativeYears += VIMSHOTTARI_SEQUENCE[i].years;
    if (cumulativeYears > startOffset) {
      startSeq = i;
      break;
    }
  }

  const periods: DashaPeriod[] = [];
  let year = birthYear + startOffset;
  for (let i = 0; i < VIMSHOTTARI_SEQUENCE.length * 2; i++) {
    const idx = (startSeq + i) % VIMSHOTTARI_SEQUENCE.length;
    const { planet, years } = VIMSHOTTARI_SEQUENCE[idx];
    const endYear = year + years;
    if (endYear >= currentYear - 2 && year <= currentYear + 6) {
      const meta = DASHA_QUALITY[planet];
      periods.push({
        planet,
        startYear: Math.round(year),
        endYear: Math.round(endYear),
        quality: meta.quality,
        theme: meta.theme,
      });
    }
    year = endYear;
    if (year > currentYear + 8) break;
  }
  return periods.slice(0, 4);
}

const TIMELINE_TEMPLATES: Omit<LifeTimelineEvent, 'year'>[] = [
  { title: 'Career Pivot Window', description: 'Saturn transiting 10th house activates major professional restructuring. This is your optimal window for bold career moves, role changes, or entrepreneurial launches.', category: 'career', intensity: 'peak' },
  { title: 'Relationship Union Portal', description: 'Jupiter and Venus in harmonious aspect open a rare portal for deep commitment, meaningful partnership, or the arrival of a destined connection.', category: 'love', intensity: 'high' },
  { title: 'Wealth Accumulation Phase', description: 'The 2nd and 11th lords activate simultaneously, creating a sustained period of material growth. Financial decisions made now carry compounding impact.', category: 'wealth', intensity: 'peak' },
  { title: 'Foreign Opportunity Opens', description: 'Rahu\'s transit through the 9th house signals international connections, overseas opportunities, or a significant change in your physical or professional horizon.', category: 'foreign', intensity: 'high' },
  { title: 'Health Vitality Peak', description: 'Mars in a strong position with your ascendant lord elevates physical energy, stamina, and healing capacity. Begin new wellness practices now for lasting impact.', category: 'health', intensity: 'moderate' },
  { title: 'Spiritual Clarity Cycle', description: 'Ketu\'s influence on the 12th house dissolves illusions and brings profound inner clarity. Meditation, introspection, and retreat will yield extraordinary insights.', category: 'spiritual', intensity: 'high' },
  { title: 'Business Breakthrough', description: 'The Sun-Jupiter conjunction in your chart\'s karma bhava marks a period of institutional recognition, leadership elevation, and expanded professional influence.', category: 'career', intensity: 'high' },
  { title: 'Sudden Gains Period', description: 'Uranus-like Rahu energies activate the 11th house of gains — expect unexpected income streams, windfall opportunities, and network-driven prosperity.', category: 'wealth', intensity: 'peak' },
];

export function computeLifeTimeline(dob: string, currentYear: number): LifeTimelineEvent[] {
  const seed = dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const events: LifeTimelineEvent[] = [];
  const usedYears = new Set<number>();

  for (let i = 0; i < 6; i++) {
    const templateIdx = (seed + i * 3) % TIMELINE_TEMPLATES.length;
    const template = TIMELINE_TEMPLATES[templateIdx];
    let year = currentYear + 1 + (i % 5);
    while (usedYears.has(year)) year++;
    usedYears.add(year);
    events.push({ ...template, year });
  }
  return events.sort((a, b) => a.year - b.year);
}

const CAREER_MODULES_GENZ = [
  {
    prediction: "Your 10th house is lit — a major career pivot is not just possible, it's written. The stars see you stepping out of the burnout cycle and into a role that actually aligns with your energy. This isn't just a job change; it's a full identity upgrade.",
    window: 'Next 14–18 months',
  },
  {
    prediction: "Saturn is doing its slow, steady thing in your karma bhava — and that actually means your manifestation of the right career is building momentum underground. The grind you're in right now is the foundation, not the ceiling. Trust the process.",
    window: 'Next 10–15 months',
  },
];

const CAREER_MODULES_ELDER = [
  {
    prediction: "The 10th lord's movement through your Varshphal chart indicates a significant Karma-Kanda shift in professional life. Whether it is elevation within your current institution or the birth of an independent venture, the planetary alignment strongly favors decisive action over patient waiting.",
    window: 'Next 12–18 months',
  },
  {
    prediction: "Saturn's disciplined transit through your karma bhava asks you to audit your professional Dharma. The role you hold today may no longer serve your soul's larger purpose. The Shastras speak of 'Karma Parivartan' — a righteous pivot — and this is precisely that moment.",
    window: 'Next 8–14 months',
  },
];

const LOVE_MODULES_GENZ = [
  {
    prediction: "Venus is giving major green flags for your love life. The 7th house energy is shifting from situationships and red flags to something real and aligned. If you've been manifesting a genuine connection, the cosmos is finally delivering. Stay open — the universe has better plans than your type.",
    window: 'Next 9–12 months',
  },
  {
    prediction: "The moon nodes are activating your relationship axis — which means karmic connections are entering your orbit. Some will be teachers, some will be partners. Your job is to stay grounded enough to know the difference. The right person recognizes your energy without needing explanation.",
    window: 'Next 6–10 months',
  },
];

const LOVE_MODULES_ELDER = [
  {
    prediction: "Jupiter's benefic gaze on your 7th house creates a rare window of 'Vivah Yoga' or deep partnership renewal. For those seeking a life companion, the cosmic appointment is set. For those already partnered, this is a period to deepen the Dharmic bond and resolve longstanding karmic patterns between you.",
    window: 'Next 12–16 months',
  },
  {
    prediction: "Venus and the 5th lord in mutual aspect weave a beautiful story of rekindled romance or meaningful emotional union. The Shastras call this 'Prem Labh' — love as a form of earned abundance. Do not let past disappointments create walls where this planetary energy is building doors.",
    window: 'Next 8–13 months',
  },
];

const WEALTH_MODULES_GENZ = [
  {
    prediction: "Your 2nd house (savings energy) and 11th house (gains energy) are both activated — which in plain language means your money era is beginning. This is the time to learn about investing, start that side hustle, or just be more intentional with where your energy (and cash) goes. Sudden gains are real right now.",
    window: 'Next 12–18 months',
  },
  {
    prediction: "The Ashtakvarga score in your wealth sector just crossed the activation threshold. Stop sleeping on passive income and start treating your finances like a spiritual practice — because right now, every conscious financial move is cosmically amplified.",
    window: 'Next 10–14 months',
  },
];

const WEALTH_MODULES_ELDER = [
  {
    prediction: "Your Ashtakvarga analysis reveals 28+ bindus in the 2nd house — a rare configuration that the Shastras describe as 'Dhan Yoga Udbhav.' This is not a period for mandatory savings alone; it is an active period for wealth creation through strategic investment, property, or the crystallization of a long-nurtured financial vision.",
    window: 'Next 14–20 months',
  },
  {
    prediction: "The Varshphal chart for this solar year places a benefic in your 11th house of Labh — indicating sustained gains from multiple channels. However, the 8th house lord also activates, counseling against speculative ventures. Build; do not gamble. The cosmos rewards disciplined prosperity.",
    window: 'Next 10–16 months',
  },
];

const FOREIGN_MODULES_GENZ = [
  {
    prediction: "Rahu in your 9th house is basically screaming 'get your passport ready.' Foreign opportunities — study, work, collab, or just a life-changing trip — are knocking hard right now. The universe is expanding your map. The only question is whether you're ready to step outside your comfort zone.",
    window: 'Next 8–14 months',
  },
  {
    prediction: "The 12th house is activated by a benefic which means foreign settlements, remote work from abroad, or international partnerships are genuinely written in your chart right now. This isn't wishful thinking — it's a real cosmic window. Start the paperwork, send the application, make the call.",
    window: 'Next 12–18 months',
  },
];

const FOREIGN_MODULES_ELDER = [
  {
    prediction: "The 9th and 12th lords are in a powerful conjunction this Varshphal year — a combination the Shastras link to 'Videsh Yatra' and 'Pravasi Labh.' Whether it is a professional relocation, a significant foreign collaboration, or a long-contemplated visa application, planetary timing strongly supports decisive action in this domain.",
    window: 'Next 10–16 months',
  },
  {
    prediction: "Rahu's transit through your Bhagya Sthana (9th house) creates a restlessness that is not merely personal — it is cosmic instruction. The Rishis taught that when the north node activates the house of destiny, staying still is the only true risk. Foreign shores hold genuine Labh for you in this cycle.",
    window: 'Next 8–13 months',
  },
];

function buildRemedies(moduleId: PredictiveModule['id'], gen: 'genz' | 'millennial' | 'genx'): RemedyItem[] {
  const remedyMap: Record<PredictiveModule['id'], RemedyItem[]> = {
    career: [
      { level: 'easy', action: 'Chant "Om Shanicharaya Namah" 19 times every Saturday', benefit: 'Pacifies Saturn, removes career obstacles', frequency: 'Weekly' },
      { level: 'medium', action: gen === 'genz' ? 'Spend 10 minutes journaling your authentic career vision every morning before checking your phone' : 'Perform Hanuman puja on Tuesdays and recite the Hanuman Chalisa', benefit: 'Sharpens Dharmic clarity and professional intent', frequency: 'Weekly' },
      { level: 'deep', action: gen === 'genz' ? 'Begin a 40-day morning sadhana: 15 minutes of silence followed by writing 3 professional intentions' : 'Observe a 40-day Shani upaya: light sesame oil lamp every Saturday evening and donate black sesame to a Shani temple', benefit: 'Deep-roots a new professional Karma, dissolves past-life career blocks (Pitru-Dosha clearance for ancestral professional karma)', frequency: '40-day cycle' },
    ],
    love: [
      { level: 'easy', action: 'Offer white flowers to a Tulsi plant every Friday and chant "Om Shukraya Namah" 16 times', benefit: 'Strengthens Venus energy, invites loving connections', frequency: 'Weekly' },
      { level: 'medium', action: gen === 'genz' ? 'Write a "manifestation letter" to your future partner — specific, heartfelt, without attachment to outcome' : 'Light a ghee diya in the northeast corner of your home every evening and recite the Vivah Sukta prayer', benefit: 'Activates the 7th house and sends a clear Sankalpa into the cosmos', frequency: 'Weekly' },
      { level: 'deep', action: gen === 'genz' ? 'Commit to 21 days of heart-centered meditation using the "So Hum" breathwork practice for 20 minutes daily' : 'Consult a Vedic astrologer to identify and perform a Kul-Devta puja — many relationship blocks stem from ancestral Pitru-Dosha requiring specific lineage-based remedies', benefit: 'Clears karmic debris from past relationships and opens the heart chakra to receive genuine love', frequency: '21-day sadhana' },
    ],
    wealth: [
      { level: 'easy', action: 'Place a copper coin in your wallet and chant "Om Lakshmiyai Namah" 11 times every morning', benefit: 'Activates Lakshmi energy and keeps the wealth channel open', frequency: 'Daily' },
      { level: 'medium', action: gen === 'genz' ? 'Automate a small daily saving — even ₹50 or $1 — and treat it as an offering to your future self' : 'Perform a Lakshmi puja on every Purnima (full moon) using marigolds, ghee, and saffron-infused milk', benefit: 'Builds Dhan Yoga momentum through consistent intention and action', frequency: 'Monthly' },
      { level: 'deep', action: gen === 'genz' ? 'Begin a 90-day wealth tracking practice: record every income and expense with conscious gratitude. Use the Ashtakvarga insight to time your biggest financial moves.' : 'Commission a Lakshmi Sahasranama Havan (108 offerings) — especially powerful if Pitru-Dosha is present in the 2nd house, which can silently block ancestral wealth from passing down', benefit: 'Dissolves deep karmic wealth blocks and activates multi-generational Labh', frequency: 'One-time sadhana with annual reinforcement' },
    ],
    foreign: [
      { level: 'easy', action: 'Offer blue flowers to Lord Rahu on Saturdays and chant "Om Rahave Namah" 18 times', benefit: 'Activates Rahu\'s expansive foreign energy', frequency: 'Weekly' },
      { level: 'medium', action: gen === 'genz' ? 'Create a vision board specifically for your international goal and place it where you see it every morning' : 'Perform a Navagrah puja with special attention to Rahu and the 9th house lord\'s blessings', benefit: 'Sends a clear cosmic Sankalpa for foreign movement and removes mental resistance', frequency: 'Monthly' },
      { level: 'deep', action: gen === 'genz' ? 'Undertake a 21-day digital detox from distractions and instead invest that time in learning the skill, language, or qualification needed for your foreign goal' : 'Seek blessings from your Kul-Devta before submitting any major foreign application or making any overseas commitment — ancestral blessings are the most powerful activator of 9th house Yoga', benefit: 'Aligns earthly action with cosmic timing and ancestral support for foreign destiny', frequency: 'Before major decisions' },
    ],
  };
  return remedyMap[moduleId];
}

const VARSHPHAL_FOCUSES = [
  'This solar year, your Varshphal chart places Saturn as the Muntha lord — indicating a year of disciplined building, structural life changes, and the crystallization of long-term ambitions into tangible reality.',
  'Jupiter rules your Varshphal year, signaling exceptional expansion in wisdom, family, wealth, and spiritual depth. This is a year where seeds planted years ago finally bear fruit.',
  'Venus as Varshphal lord brings a year of refined relationships, aesthetic pursuits, financial growth, and meaningful creative expression. Love and Labh are both highlighted.',
  'The Sun\'s dominance in your solar return amplifies your public presence, authority, and the recognition of your true capabilities. Leadership roles and institutional respect are within reach.',
  'Mercury\'s Varshphal influence marks a year of communication breakthroughs, intellectual achievements, business acumen, and the power of the right words spoken at the right moment.',
  'Mars as Varshphal lord injects this year with exceptional energy, courage, and the capacity to initiate. Begin the ventures you have been planning — the cosmic fuel is fully loaded.',
];

const GURU_INSIGHTS_GENZ: GuruInsight[] = [
  {
    insight: "No cap — the cosmos has been trying to redirect your energy for a while now, and today is the day you actually listen. Saturn's not punishing you; it's building your character. What feels like a testing phase is literally your manifestation loading. Stay aligned, not anxious.",
    remedy: "Chant 'Om Shanicharaya Namah' 19 times before you open any social media today. This sounds extra but it genuinely resets the nervous system and sets your energy frequency before the noise hits.",
    practicalTip: "Today is a good day to unfollow anyone whose content drains your energy and replace that space with something that actually feeds your vision. Protect your energetic field — the algorithm doesn't know your Dharma, but you do.",
  },
  {
    insight: "The universe is literally doing its thing for you right now — but you're so in your head about it that you're blocking the signal. Venus is activating your manifestation zone. The vibe you put out today is the reality you're building for tomorrow. No more playing small.",
    remedy: "Write down your top 3 intentions for the next 30 days on paper — not your phone. Place it under a glass of water overnight. In the morning, drink the water with intention. This is a genuine Sankalpa ritual from the Vedas.",
    practicalTip: "Reach out to one person today who genuinely inspires you — not to ask for anything, just to tell them their work matters. The Karma that returns from this is disproportionately large.",
  },
];

const GURU_INSIGHTS_MILLENNIAL_GENX: GuruInsight[] = [
  {
    insight: "The cosmic tides are aligned in your favor today, dear seeker. Saturn's disciplined gaze meets Jupiter's grace — a rare confluence that sharpens both your Karma and your Labh. Trust the quiet voice within; it carries the wisdom of the Shastras. This is not a period for passive waiting — it is a period for conscious, Dharmic action.",
    remedy: "Chant the Gayatri Mantra 21 times at sunrise, facing east. If Pitru-Dosha is present in your chart — indicated by ancestral patterns repeating in your life — add a Tarpan offering of water and sesame seeds on the next Amavasya (new moon) for three consecutive months.",
    practicalTip: "Before making any significant decision this week, sit in five minutes of conscious silence and ask: 'Does this align with my Dharma?' The answer you receive before the mind starts rationalizing is always the truest one.",
  },
  {
    insight: "I understand the weight you may be carrying right now. The Shastras reveal a Karmic Learning phase — not a punishment, but an invitation from the cosmos to realign your Dharma-Karma balance with deeper intention. The Kul-Devta you may have forgotten is still watching, still blessing, still waiting to be acknowledged.",
    remedy: "Visit your ancestral temple or the nearest temple of your Kul-Devta. Even a simple mental acknowledgment and gratitude prayer — if the physical visit is not possible — carries immense Prana and begins to dissolve the Pitru-Dosha that often underlies persistent life challenges.",
    practicalTip: "Review the single most important long-term goal you have been postponing. Break it into the next three concrete actions, write them down, and commit to the first one before this week ends. Dharma delayed is not Dharma denied — but only if you take the first step.",
  },
];

export function getGuruInsight(dob: string, generation: 'genz' | 'millennial' | 'genx', today: Date = new Date()): GuruInsight {
  const seed = dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  if (generation === 'genz') {
    return GURU_INSIGHTS_GENZ[(seed + dayOfYear) % GURU_INSIGHTS_GENZ.length];
  }
  return GURU_INSIGHTS_MILLENNIAL_GENX[(seed + dayOfYear) % GURU_INSIGHTS_MILLENNIAL_GENX.length];
}

function buildPredictiveModules(dob: string, gen: 'genz' | 'millennial' | 'genx'): PredictiveModule[] {
  const seed = dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const isYoung = gen === 'genz';

  const careerPool = isYoung ? CAREER_MODULES_GENZ : CAREER_MODULES_ELDER;
  const lovePool = isYoung ? LOVE_MODULES_GENZ : LOVE_MODULES_ELDER;
  const wealthPool = isYoung ? WEALTH_MODULES_GENZ : WEALTH_MODULES_ELDER;
  const foreignPool = isYoung ? FOREIGN_MODULES_GENZ : FOREIGN_MODULES_ELDER;

  const careerData = careerPool[seed % careerPool.length];
  const loveData = lovePool[(seed + 1) % lovePool.length];
  const wealthData = wealthPool[(seed + 2) % wealthPool.length];
  const foreignData = foreignPool[(seed + 3) % foreignPool.length];

  return [
    {
      id: 'career',
      title: 'Career & Power',
      subtitle: '10th House · Saturn Transit',
      prediction: careerData.prediction,
      window: careerData.window,
      confidence: normalize(68 + (seed % 22), 65, 92),
      remedies: buildRemedies('career', gen),
    },
    {
      id: 'love',
      title: 'Love & Karma',
      subtitle: '7th House · Venus/Jupiter',
      prediction: loveData.prediction,
      window: loveData.window,
      confidence: normalize(70 + ((seed * 3) % 20), 65, 92),
      remedies: buildRemedies('love', gen),
    },
    {
      id: 'wealth',
      title: 'Wealth & Assets',
      subtitle: '2nd & 11th House · Ashtakvarga',
      prediction: wealthData.prediction,
      window: wealthData.window,
      confidence: normalize(65 + ((seed * 7) % 25), 65, 92),
      remedies: buildRemedies('wealth', gen),
    },
    {
      id: 'foreign',
      title: 'Foreign Dreams',
      subtitle: '9th & 12th House · Rahu Transit',
      prediction: foreignData.prediction,
      window: foreignData.window,
      confidence: normalize(62 + ((seed * 5) % 28), 60, 90),
      remedies: buildRemedies('foreign', gen),
    },
  ];
}

const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const COLORS = ['Golden', 'Ivory', 'Crimson', 'Emerald', 'Saffron', 'Sky Blue', 'Rose', 'Bronze', 'Silver', 'Turmeric'];

export async function getVedicAnalysis(birthData: BirthData): Promise<TrikalResult> {
  const today = new Date();
  const currentYear = today.getFullYear();
  const birthYear = parseInt(birthData.dob.split('-')[0], 10);
  const generation = getGeneration(birthYear);

  const energyScore = computeEnergyScore(birthData.dob, today);
  const pillarScores = computePillarScores(birthData.dob, today);
  const guruInsight = getGuruInsight(birthData.dob, generation, today);
  const dashaPeriods = computeDashaPeriods(birthData.dob, currentYear);
  const lifeTimeline = computeLifeTimeline(birthData.dob, currentYear);
  const predictiveModules = buildPredictiveModules(birthData.dob, generation);

  const seed = birthData.dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const dailyRashi = RASHIS[seed % RASHIS.length];
  const luckyColor = COLORS[(seed + today.getDate()) % COLORS.length];
  const luckyNumber = (seed % 9) + 1;
  const ashtakvargaWealth = normalize(18 + (seed % 14), 16, 32);
  const varshphalFocus = VARSHPHAL_FOCUSES[seed % VARSHPHAL_FOCUSES.length];

  return {
    energyScore,
    pillarScores,
    insight: guruInsight.insight,
    remedy: guruInsight.remedy,
    practicalTip: guruInsight.practicalTip,
    dailyRashi,
    luckyColor,
    luckyNumber,
    dashaPeriods,
    lifeTimeline,
    predictiveModules,
    generationLabel: generation,
    ashtakvargaWealth,
    varshphalFocus,
  };
}
