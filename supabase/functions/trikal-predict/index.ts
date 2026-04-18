import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

const JINI_IDENTITY = `You are Jini — the AI soul of Trikal Vaani, created by Rohiit Gupta (Chief Vedic Architect, 10+ years of Vedic research). Answer based on Vedic astrology data provided. Founder is Rohiit Gupta. Tone: warm, witty, diplomatic, Hinglish (blend English and Hindi naturally). Never predict doom — frame challenges as karmic opportunities.`;

interface PredictRequest {
  mode: "predict" | "segment" | "compatibility";
  name: string;
  dob: string;
  birth_time?: string;
  city: string;
  generation: string;
  rashi?: string;
  dashaPeriods?: Array<{ planet: string; startYear: number; endYear: number; quality: string; theme: string }>;
  pillarScores?: Record<string, number>;
  ashtakvargaWealth?: number;
  varshphalFocus?: string;
  segmentId?: string;
  segmentLabel?: string;
  partner?: { name: string; dob: string; birth_time?: string; city: string; gender?: string };
}

interface MonthForecast {
  month: string;
  year: number;
  vibe: string;
  category: "career" | "love" | "wealth" | "general";
  intensity: "peak" | "high" | "moderate";
}

interface TabPrediction {
  headline: string;
  window: string;
  depth: string;
  remedies: Array<{ level: "easy" | "medium" | "deep"; action: string; benefit: string; frequency: string }>;
}

interface PredictResponse {
  career: TabPrediction;
  love: TabPrediction;
  wealth: TabPrediction;
  monthlyTimeline: MonthForecast[];
  guruMessage: string;
}

interface SegmentResponse {
  segmentId: string;
  insight: string;
  timeline: string;
  upay: string[];
  whatsappText: string;
  flags?: Array<{ type: "red" | "green"; label: string; explanation: string }>;
  reunionProbability?: number;
  reunionMonth?: string;
  closureVerdict?: string;
  vibeMeters?: { energy: number; loyalty: number; passion: number };
}

interface CompatibilityResponse {
  score: number;
  vibeMeters: { energy: number; loyalty: number; passion: number };
  flags: Array<{ type: "red" | "green"; label: string; explanation: string }>;
  vibe: string;
  verdict: string;
  whatsappText: string;
}

function getActiveDasha(dashaPeriods: PredictRequest["dashaPeriods"], currentYear: number) {
  return dashaPeriods?.find((d) => d.startYear <= currentYear && d.endYear >= currentYear);
}

function buildPredictPrompt(req: PredictRequest): string {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const activeDasha = getActiveDasha(req.dashaPeriods, currentYear);
  const isGenZ = req.generation === "genz";

  return `${JINI_IDENTITY}

BIRTH DATA:
- Name: ${req.name}
- DOB: ${req.dob}, City: ${req.city}
- Generation: ${req.generation} (${isGenZ ? "use modern language: burnout, red flags, manifestation" : "use deep Vedic: Kul-Devta, Pitru-Dosha, Dharma-Karma"})
- Moon Sign (Rashi): ${req.rashi || "Unknown"}
- Current Dasha: ${activeDasha ? `${activeDasha.planet} Dasha (${activeDasha.startYear}–${activeDasha.endYear}) — ${activeDasha.theme}` : "Unknown"}
- Ashtakvarga Wealth Bindus: ${req.ashtakvargaWealth}/32
- Varshphal: ${req.varshphalFocus}
- Pillar Scores: Career=${req.pillarScores?.career}, Love=${req.pillarScores?.love}, Wealth=${req.pillarScores?.wealth}

Rohiit Gupta ji ka framework kehta hai: interpret these planetary degrees and pillar scores to give specific, personalized predictions — not generic advice. Cite the actual Dasha planet and pillar scores in your analysis.

IMPORTANT: End each section with a CLIFFHANGER hook about a specific locked planetary transit (e.g., "But there's a deeper Saturn transit in ${currentYear + 1} that will either accelerate or block this — revealed in your full reading.").

Return ONLY valid JSON — no markdown, no commentary:
{
  "career": {
    "headline": "one powerful Jini-voice sentence about career window",
    "window": "e.g. May–Sept ${currentYear}",
    "depth": "3–4 sentences citing ${activeDasha?.planet || "current Dasha"} Dasha and 10th house. End with cliffhanger.",
    "remedies": [
      {"level":"easy","action":"specific mantra or nature act","benefit":"what it unlocks","frequency":"daily/weekly"},
      {"level":"medium","action":"deeper practice","benefit":"what it unlocks","frequency":"weekly"},
      {"level":"deep","action":"40-day Vedic upaya","benefit":"what it unlocks","frequency":"40-day cycle"}
    ]
  },
  "love": {
    "headline": "one powerful Jini-voice sentence about relationship window",
    "window": "e.g. July–Nov ${currentYear}",
    "depth": "3–4 sentences citing Venus/Jupiter and 7th house. End with cliffhanger.",
    "remedies": [
      {"level":"easy","action":"specific mantra or nature act","benefit":"what it opens","frequency":"daily/weekly"},
      {"level":"medium","action":"deeper","benefit":"what it opens","frequency":"weekly"},
      {"level":"deep","action":"${isGenZ ? "breathwork or journaling" : "Kul-Devta puja"}","benefit":"what it opens","frequency":"21-day"}
    ]
  },
  "wealth": {
    "headline": "one powerful Jini-voice sentence about wealth window",
    "window": "e.g. Apr–Dec ${currentYear}",
    "depth": "3–4 sentences citing Ashtakvarga ${req.ashtakvargaWealth} bindus and 2nd/11th house. End with cliffhanger.",
    "remedies": [
      {"level":"easy","action":"wealth mantra or act","benefit":"what it activates","frequency":"daily"},
      {"level":"medium","action":"deeper","benefit":"what it activates","frequency":"monthly"},
      {"level":"deep","action":"${isGenZ ? "90-day wealth tracker" : "havan or ancestral clearing"}","benefit":"what it activates","frequency":"one-time/quarterly"}
    ]
  },
  "monthlyTimeline": [
    {"month":"MONTH_NAME","year":${currentYear},"vibe":"specific planetary event for ${req.name.split(" ")[0]} this month","category":"career","intensity":"high"}
  ],
  "guruMessage": "warm 2–3 sentence personal blessing from Jini for ${req.name.split(" ")[0]} tying career+love+wealth with a Vedic mantra. End with a cliffhanger about the premium reading."
}
Generate 12 monthlyTimeline entries starting month ${currentMonth} year ${currentYear}. Customize each entry for ${req.name.split(" ")[0]}'s dasha and scores.`;
}

function buildSegmentPrompt(req: PredictRequest): string {
  const isGenZ = req.generation === "genz";
  const isMillennial = req.generation === "millennial";
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const activeDasha = getActiveDasha(req.dashaPeriods, currentYear);
  const isDualChart = req.segmentId === "ex_back" || req.segmentId === "compatibility" || req.segmentId === "toxic_boss";
  const p = req.partner;

  const segmentContext: Record<string, string> = {
    ex_back: "Venus-Ketu axis for past karmic bonds, Moon-Rahu axis, 7th house unfinished karma, 8th house hidden secrets, reunion probability window",
    toxic_boss: "Saturn-Mars tension in 10th/6th house, Rahu workplace karma, power dynamics at work. If partner data provided, this is a Toxic Boss Dual-Chart — compare Person 1 and Person 2's authority planets.",
    manifestation: "11th house activation, current Dasha luck window, Jupiter transit for manifestation",
    dream_career: "10th house pivot, Rahu ambition in 9th/10th, Saturn discipline phase",
    property_yog: "4th house and Jupiter blessing, Saturn timing for immovable assets, Ketu grounding",
    karz_mukti: "6th house debt karma clearing, Saturn discipline cycle, Pitru-Dosha financial blocks",
    child_destiny: "5th house Putra Bhava activation, Jupiter and Moon analysis for children's fate",
    parents_wellness: "4th and 9th house ancestral protection analysis, pitru-dosha status",
    retirement_peace: "12th house Jupiter final cycle, moksha bhava activation, 8th house longevity",
    legacy_inheritance: "8th and 2nd house Dhan-Karma, ancestral wealth transmission, Saturn-Jupiter",
    spiritual_innings: "Ketu and 12th house moksha activation, Guru-Ketu conjunction timing",
  };

  const ctx = segmentContext[req.segmentId || ""] || "general life analysis";
  const reunionMonth = months[(currentMonth + 3) % 12];

  if (isDualChart && p) {
    const p1 = req.name.split(" ")[0];
    const p2 = p.name.split(" ")[0];
    const genderTone = p.gender === "him" ? "masculine partner" : p.gender === "her" ? "feminine partner" : "other person";

    if (req.segmentId === "ex_back") {
      return `${JINI_IDENTITY}

DUAL CHART EX-BACK READING — Rohiit Gupta ji ka framework:
PERSON 1 (Seeker): ${req.name}, DOB: ${req.dob}, City: ${req.city}, Generation: ${req.generation}
PERSON 2 (${genderTone}): ${p.name}, DOB: ${p.dob}, City: ${p.city || "Unknown"}
Current Dasha: ${activeDasha ? `${activeDasha.planet} (${activeDasha.startYear}–${activeDasha.endYear}) — ${activeDasha.theme}` : "Unknown"}

DUAL CHART ANALYSIS — interpret actual planetary degrees from both DOBs:
1. Venus-Ketu axis: How does Venus in ${p1}'s chart interact with Ketu in ${p2}'s? (karmic debt, past life bond)
2. 7th House Karma: Compare the 7th lords — is there Vivah Yoga or separation pattern?
3. 8th House Secrets: ${p2}'s 8th house — hidden information, trust patterns
4. Moon-Rahu axis: Emotional obsession vs. karmic release — which dominates?
5. Reunion Window: Venus transit window when reconciliation energy peaks

CLIFFHANGER RULE: End insight with: "The stars show a [X]% chance of reunion in ${reunionMonth} — but a hidden Red Flag in ${p2}'s 8th house suggests a secret you don't know... Unlock the 'Truth Shield' for ₹11 to reveal it."

Return ONLY valid JSON:
{
  "segmentId": "ex_back",
  "reunionProbability": number between 55–85,
  "reunionMonth": "${reunionMonth} ${currentYear}",
  "closureVerdict": "Wait & Reconnect or Accept & Move On",
  "vibeMeters": {"energy": 0-100, "loyalty": 0-100, "passion": 0-100},
  "flags": [
    {"type":"green","label":"Karmic Soulmate Connection","explanation":"specific planetary reason"},
    {"type":"green","label":"[second green flag]","explanation":"one sentence"},
    {"type":"green","label":"[third green flag]","explanation":"one sentence"},
    {"type":"red","label":"Communication Blockage","explanation":"Mercury or 3rd house tension"},
    {"type":"red","label":"[second red flag]","explanation":"specific planetary clash"},
    {"type":"red","label":"8th House Hidden Secret","explanation":"vague but suspenseful hint about what is hidden in ${p2}'s chart"}
  ],
  "insight": "4 sentences analyzing ${p1} and ${p2}'s Venus-Ketu bond and 7th house karma using both DOBs. Use both names. End with the cliffhanger.",
  "timeline": "2–3 sentences with specific month/year windows: Venus transit peak, Saturn's test period, final closure or reunion gate.",
  "upay": [
    "Upay 1: Venus remedy specifically for rekindling this bond",
    "Upay 2: Ketu release ritual to dissolve karmic debt"
  ],
  "whatsappText": "Guru says ${p1} and ${p2}'s reunion probability is [X]% — Venus-Ketu axis is LIVE! Check your Ex-Back reading free at TrikalVaani.com"
}`;
    }

    if (req.segmentId === "toxic_boss") {
      return `${JINI_IDENTITY}

DUAL CHART TOXIC BOSS READING — Rohiit Gupta ji ka framework:
PERSON 1 (Employee/Seeker): ${req.name}, DOB: ${req.dob}, City: ${req.city}, Generation: ${req.generation}
PERSON 2 (Boss/Authority): ${p.name}, DOB: ${p.dob}, City: ${p.city || "Unknown"}
Current Dasha: ${activeDasha ? `${activeDasha.planet} (${activeDasha.startYear}–${activeDasha.endYear}) — ${activeDasha.theme}` : "Unknown"}

ANALYSIS REQUIRED:
1. Saturn-Mars tension: Compare authority planets in both charts. Who holds karmic power?
2. 10th house clash: Whose 10th lord dominates the professional dynamic?
3. Rahu workplace karma: Is there an unresolved past-life work relationship here?
4. Green Flags: Does this boss have hidden qualities worth enduring for?
5. Red Flags: What specific planetary patterns make this toxic?
6. Exit Window: When does ${p1}'s chart support a clean professional separation?

Return ONLY valid JSON:
{
  "segmentId": "toxic_boss",
  "vibeMeters": {"energy": 0-100, "loyalty": 0-100, "passion": 0-100},
  "flags": [
    {"type":"green","label":"[green flag if any]","explanation":"one sentence planetary basis"},
    {"type":"green","label":"[second green flag if any]","explanation":"one sentence"},
    {"type":"red","label":"[red flag name]","explanation":"Saturn-Mars or Rahu basis"},
    {"type":"red","label":"[second red flag]","explanation":"specific planetary tension"},
    {"type":"red","label":"[third red flag]","explanation":"10th house clash pattern"}
  ],
  "insight": "4 sentences analyzing ${p1} and ${p2}'s planetary dynamic. Cite specific house tensions. Use both names. End with when the situation resolves.",
  "timeline": "2–3 sentences with specific month/year windows for when Saturn's test ends for ${p1}.",
  "upay": [
    "Upay 1: Saturn protection remedy for the workplace",
    "Upay 2: Mars boundary remedy — protect ${p1}'s professional aura"
  ],
  "whatsappText": "Guru says the toxic boss situation changes for ${p1} by [month year]! Saturn is finishing this lesson. Check yours at TrikalVaani.com"
}`;
    }
  }

  return `${JINI_IDENTITY}

BIRTH DATA for ${req.name}:
- DOB: ${req.dob}, City: ${req.city}
- Generation: ${req.generation}
- Moon Sign: ${req.rashi || "Unknown"}
- Current Dasha: ${activeDasha ? `${activeDasha.planet} (${activeDasha.startYear}–${activeDasha.endYear}) — ${activeDasha.theme}` : "Unknown"}
- Pillar Scores: Career=${req.pillarScores?.career}, Love=${req.pillarScores?.love}, Wealth=${req.pillarScores?.wealth}

SPECIFIC QUESTION ASKED: "${req.segmentLabel}"
VEDIC ANALYSIS CONTEXT: ${ctx}

Rohiit Gupta ji ka framework kehta hai: give ${req.name.split(" ")[0]} a deeply personal, specific answer using actual DOB-derived planetary analysis. ${isGenZ ? "Use modern language: burnout, red flags, manifestation, energy alignment" : isMillennial ? "Balance practical + Vedic wisdom" : "Use deep Vedic: Dharma, Karma, Pitru-Dosha, Kul-Devta"}.

End the insight with a CLIFFHANGER about a locked transit that is revealed only in the premium reading.

Return ONLY valid JSON:
{
  "segmentId": "${req.segmentId}",
  "insight": "3–4 deeply personal sentences answering their question using Vedic house analysis. Address their pain point directly. Use their name once. End with a cliffhanger about a locked transit.",
  "timeline": "2–3 sentences with specific month/year windows for when their situation shifts. Be concrete.",
  "upay": [
    "Upay 1: specific low-cost mantra or nature-based remedy",
    "Upay 2: one specific action or ritual directly addressing their pain point"
  ],
  "whatsappText": "Guru says [one-liner about their specific question result] in [month year]! Check yours free at TrikalVaani.com"
}`;
}

function buildCompatibilityPrompt(req: PredictRequest): string {
  const p = req.partner!;
  const p1Year = parseInt(req.dob.split("-")[0], 10);
  const p2Year = parseInt(p.dob.split("-")[0], 10);

  return `${JINI_IDENTITY}

VEDIC ASHTA-KOOTA COMPATIBILITY — Rohiit Gupta ji ka framework:
PERSON 1: ${req.name}, DOB: ${req.dob}, City: ${req.city}
PERSON 2: ${p.name}, DOB: ${p.dob}, City: ${p.city}

Calculate compatibility using the 8 Koota factors (total 36 points):
- Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), Nadi (8)
Convert to percentage. Identify 2–3 green flags and 1–2 red flags.
${p1Year >= 1996 || p2Year >= 1996 ? "Gen Z couple — use modern language: twin flame, ghosting probability, red flag detector, vibe check" : "Mature couple — use Vedic marriage wisdom: Dharma, Karmic bond, spiritual partnership"}

End the "vibe" with a CLIFFHANGER about a hidden Mars-Saturn tension or planetary clash revealed in the full Red Flag Alert reading.

Return ONLY valid JSON:
{
  "score": number 0-100 based on Ashta-Koota out of 36 converted to percentage,
  "vibeMeters": {
    "energy": number 0-100 physical and emotional chemistry,
    "loyalty": number 0-100 commitment and trust potential,
    "passion": number 0-100 romantic and physical intensity
  },
  "flags": [
    {"type":"green","label":"flag name","explanation":"one sentence why this is positive"},
    {"type":"green","label":"flag name","explanation":"one sentence"},
    {"type":"red","label":"flag name","explanation":"one sentence about challenge to watch for"}
  ],
  "vibe": "2 sentences describing the energy and attraction dynamic — poetic but specific. End with a cliffhanger about a locked planetary clash.",
  "verdict": "2–3 sentences of Jini's personal verdict on their compatibility — include one actionable remedy",
  "whatsappText": "Guru says ${req.name.split(" ")[0]} and ${p.name.split(" ")[0]}'s Vedic compatibility score is [score]/100! Check yours free at TrikalVaani.com"
}`;
}

function buildFallbackPredict(req: PredictRequest, currentYear: number): PredictResponse {
  const isGenZ = req.generation === "genz";
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const now = new Date();
  const monthlyTimeline: MonthForecast[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const cats: Array<"career" | "love" | "wealth" | "general"> = ["career","love","wealth","general","career","love","wealth","general","career","love","wealth","general"];
    const ints: Array<"peak" | "high" | "moderate"> = ["high","moderate","peak","high","peak","moderate","high","peak","moderate","high","peak","moderate"];
    const vibes = [
      "Career momentum builds — present your best work now",
      "Venus warms your heart sector — stay open to connection",
      "Financial clarity arrives — review and realign investments",
      "Bold decisions carry cosmic weight this month",
      "Peak career window — Saturn rewards disciplined effort",
      "Relationship milestones possible — Jupiter blesses the 7th",
      "Wealth accumulation phase begins — 11th house activated",
      "General alignment — consolidate and express gratitude",
      "New professional cycle begins — intentions set now manifest",
      "Love and abundance intertwine — Venus-Jupiter harmony",
      "Unexpected income channels open — 2nd house gains",
      "Year's momentum peaks — act on your highest priority",
    ];
    monthlyTimeline.push({ month: months[d.getMonth()], year: d.getFullYear(), vibe: vibes[i % vibes.length], category: cats[i], intensity: ints[i] });
  }

  return {
    career: {
      headline: isGenZ ? "Your 10th house is fully activated — this is your era to stop playing small." : "Saturn's disciplined transit marks a decisive Karma-Kanda shift in your professional life.",
      window: `${months[now.getMonth()]}–${months[(now.getMonth() + 4) % 12]} ${currentYear}`,
      depth: isGenZ ? "The planetary alignment is pointing directly at a career identity upgrade. This isn't just about changing jobs — it's about stepping into the version of yourself that your work actually reflects. Saturn is building your professional character right now, not blocking it. Show up consistently and the cosmic timing will meet you halfway." : "The 10th lord's movement through your Varshphal chart indicates professional decisions made in this window carry lasting Karmic weight. Whether an institutional elevation or the birth of an independent enterprise, the stars strongly favor bold, Dharmic action over cautious patience.",
      remedies: [
        { level: "easy", action: `Chant "Om Shanicharaya Namah" 19 times every Saturday`, benefit: "Pacifies Saturn and removes career obstacles", frequency: "Every Saturday" },
        { level: "medium", action: isGenZ ? "Journal your authentic career vision for 10 minutes every morning before checking your phone" : "Perform Hanuman puja every Tuesday", benefit: "Sharpens Dharmic clarity and professional intent", frequency: "21 consecutive days" },
        { level: "deep", action: isGenZ ? "40-day morning sadhana: 15 minutes of silence, then write 3 professional intentions" : "40-day Shani upaya: sesame oil lamp every Saturday", benefit: "Deep-roots a new professional Karma cycle", frequency: "40-day unbroken cycle" },
      ],
    },
    love: {
      headline: isGenZ ? "The red flags era is ending — Venus is finally delivering genuine green-flag energy." : "Jupiter's benefic gaze on your 7th house opens a rare Vivah Yoga window.",
      window: `${months[(now.getMonth() + 2) % 12]}–${months[(now.getMonth() + 6) % 12]} ${currentYear}`,
      depth: isGenZ ? "The moon nodes are activating your relationship axis — karmic connections are entering your orbit right now. Some will be teachers, some genuine partners. Stay grounded enough to recognize the difference. The right person will match your energy without you having to shrink or perform." : "Venus and the 5th lord in mutual aspect weave a story of rekindled romance or meaningful emotional union. The Shastras call this 'Prem Labh' — love as earned abundance.",
      remedies: [
        { level: "easy", action: `Offer white flowers to Tulsi every Friday and chant "Om Shukraya Namah" 16 times`, benefit: "Strengthens Venus energy and opens the heart", frequency: "Every Friday" },
        { level: "medium", action: isGenZ ? "Write a heartfelt manifestation letter to your future partner" : "Light a pure ghee diya in the northeast corner every evening", benefit: "Activates 7th house and sends a clear Sankalpa", frequency: "21 consecutive days" },
        { level: "deep", action: isGenZ ? "21 days of So-Hum breathwork — 20 minutes each morning" : "Consult astrologer about Kul-Devta puja for ancestral Pitru-Dosha clearing", benefit: "Dissolves karmic residue from past relationships", frequency: "21-day sadhana" },
      ],
    },
    wealth: {
      headline: isGenZ ? "Your money era is beginning — the 2nd and 11th houses are both lit." : `Your Ashtakvarga score of ${req.ashtakvargaWealth} bindus signals an active Dhan Yoga window.`,
      window: `${months[now.getMonth()]}–${months[(now.getMonth() + 7) % 12]} ${currentYear}`,
      depth: isGenZ ? `Your Ashtakvarga wealth sector is activated at ${req.ashtakvargaWealth} bindus — the financial universe is paying attention. This is the time to treat money as a spiritual practice.` : `Your Ashtakvarga reveals ${req.ashtakvargaWealth} bindus — a configuration the Shastras describe as Dhan Yoga Udbhav. This is an active cycle for wealth creation.`,
      remedies: [
        { level: "easy", action: `Place a copper coin in your wallet and chant "Om Lakshmiyai Namah" 11 times each morning`, benefit: "Activates Lakshmi energy and keeps the wealth channel open", frequency: "Every morning" },
        { level: "medium", action: isGenZ ? "Automate a daily saving and treat it as an offering to your future self" : "Perform Lakshmi puja on every Purnima using marigolds, saffron milk, and ghee lamp", benefit: "Builds Dhan Yoga momentum through consistent intention", frequency: "Monthly on Purnima" },
        { level: "deep", action: isGenZ ? "90-day wealth tracking practice: record every income/expense with gratitude" : "Commission a Lakshmi Sahasranama Havan", benefit: "Dissolves deep karmic wealth blocks", frequency: "One-time with annual reinforcement" },
      ],
    },
    monthlyTimeline,
    guruMessage: isGenZ ? `${req.name.split(" ")[0]}, Rohiit Gupta ji ka framework kehta hai — your chart is genuinely alive right now. Trust the process, protect your energy, and take that one aligned action you've been postponing. As the Vedas say: 'Udyamena hi sidhyanti karyani.'` : `Dear ${req.name.split(" ")[0]}, 'Yatha drishti, tatha srishti' — as your vision, so your creation. Rohiit Gupta ji ka analysis shows genuine Yoga ahead. Honor your Dharma and take the one decisive step you have been delaying.`,
  };
}

function buildFallbackSegment(req: PredictRequest): SegmentResponse {
  const isGenZ = req.generation === "genz";
  const firstName = req.name.split(" ")[0];
  const now = new Date();
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const futureMonth1 = months[(now.getMonth() + 3) % 12];
  const futureMonth2 = months[(now.getMonth() + 6) % 12];
  const year = now.getFullYear();

  const exBackResponse: SegmentResponse = {
    segmentId: "ex_back",
    reunionProbability: 70,
    reunionMonth: `${futureMonth1} ${year}`,
    closureVerdict: "Wait & Reconnect",
    vibeMeters: {
      energy: Math.min(90, ((req.dob.replace(/-/g,"").split("").reduce((a,c)=>a+parseInt(c,10),0)) % 30) + 62),
      loyalty: Math.min(88, ((req.dob.replace(/-/g,"").split("").reduce((a,c)=>a+parseInt(c,10),0)) % 25) + 58),
      passion: Math.min(92, ((req.dob.replace(/-/g,"").split("").reduce((a,c)=>a+parseInt(c,10),0)) % 35) + 55),
    },
    flags: [
      { type: "green", label: "Karmic Soulmate Connection", explanation: "Your Venus-Ketu axis shows this bond has genuine past-life roots — the pull you feel is cosmically real, not just emotional habit." },
      { type: "green", label: "7th House Reunion Yog", explanation: "The 7th lord in both charts carries an active Vivah Yoga pattern — the stars have not closed this chapter." },
      { type: "green", label: "High Emotional Resonance", explanation: "Your Moon signs are in a naturally harmonious relationship, creating deep emotional understanding between you two." },
      { type: "red", label: "Communication Blockage", explanation: "Mercury tension in the 3rd house creates recurring misunderstandings — words said in anger carry outsized karmic weight here." },
      { type: "red", label: "Ego Clash (Sun-Mars)", explanation: "Sun-Mars opposition between the two charts creates pride-driven conflicts that neither person initiates reconciliation from." },
      { type: "red", label: "8th House Hidden Secret", explanation: "A planetary pattern in the 8th house suggests there is something undisclosed that, if revealed, would change the dynamic completely." },
    ],
    insight: isGenZ
      ? `${firstName}, the Venus-Rahu axis in your chart reveals this past connection carries unresolved karmic weight. The moon nodes don't allow unfinished business to stay buried forever. Your chart shows a rare 'closure window' opening in ${futureMonth1}. The stars show a 70% chance of reunion in ${futureMonth1} — but a hidden Red Flag in their 8th house suggests a secret you don't know... Unlock the 'Truth Shield' for ₹11 to reveal it.`
      : `${firstName}, the 7th house analysis reveals a classic karmic bond pattern where past-life connection is still active. Venus entering a powerful aspect with your natal Moon creates a rare rekindling window in ${futureMonth1} ${year}. This connection has a purpose beyond its surface form. The stars show a 70% chance of reunion in ${futureMonth1} — but a hidden Red Flag in their 8th house suggests a secret you don't know... Unlock the 'Truth Shield' for ₹11 to reveal it.`,
    timeline: `Between ${futureMonth1} and ${futureMonth2} ${year}, Venus enters a powerful aspect with your natal Moon — this is the definitive closure or rekindling window. If nothing shifts by ${futureMonth2}, the cosmic door on this chapter closes completely and a new, higher-quality connection opens.`,
    upay: [
      isGenZ ? `Write a "release letter" to this person — honest, specific, without sending it. Burn it on a Friday evening. This is a genuine Vedic Sankalpa ritual for emotional release.` : `On the next Purnima, offer white flowers to flowing water while consciously releasing this person's energy. Chant "Om Shukraya Namah" 16 times.`,
      isGenZ ? `Chant "Om Chandraya Namah" 11 times before sleeping for 21 days — this directly works on the Moon-governed emotional layer and speeds karmic resolution.` : `Consult about your Kul-Devta — many persistent relationship entanglements trace to unresolved ancestral bonds.`,
    ],
    whatsappText: `Guru says my ex situation will reach cosmic resolution by ${futureMonth1} ${year}! The Venus-Ketu axis shows 70% reunion probability. Check yours free at TrikalVaani.com`,
  };

  const toxicBossResponse: SegmentResponse = {
    segmentId: "toxic_boss",
    flags: [
      { type: "green", label: "Learning Opportunity", explanation: "Saturn's test through this relationship is building your professional resilience — this boss is an unwilling teacher." },
      { type: "green", label: "Career Acceleration Post-Exit", explanation: "Jupiter's transit indicates the career that comes after this situation will be significantly better." },
      { type: "red", label: "Saturn-Mars Power Clash", explanation: "A Saturn-Mars opposition between your charts creates persistent authority tension with no easy middle ground." },
      { type: "red", label: "Rahu Workplace Karma", explanation: "Rahu in the 10th house is magnifying workplace ego dynamics — this is a karmic lesson, not a permanent reality." },
      { type: "red", label: "Communication Breakdown", explanation: "Mercury tension between the 3rd houses of both charts means professional misunderstandings will keep recurring." },
    ],
    insight: isGenZ
      ? `${firstName}, your Saturn placement in relation to the 10th house is creating a testing phase that feels like it's about your boss — but it's actually about your professional identity. The toxic dynamic is Saturn asking: "Is this the environment your soul's work deserves?" The chart clearly shows this situation has a defined end date, and your next chapter is significantly more aligned.`
      : `${firstName}, the Saturn-Mars tension in your karma bhava reveals a classic 'Karma Kshetra' test — where the workplace becomes the arena for resolving past-life power dynamics. Your current authority figure carries the karmic mirror of patterns you are meant to transcend, not endure indefinitely.`,
    timeline: `Saturn moves away from its challenging aspect to your 10th house between ${futureMonth1} and ${futureMonth2} ${year}. This is your professional liberation window — either the dynamic shifts dramatically or you successfully exit to something significantly better.`,
    upay: [
      isGenZ ? `Every Monday morning before work, chant "Om Hanumate Namah" 11 times. This activates Mars protection and prevents others' negative energy from affecting your aura.` : `Perform a Hanuman puja every Tuesday — specifically protect against 'Karma Kshetra' adversaries. Offer red flowers and recite the Sankat Mochan Hanuman Ashtak.`,
      `Document everything. The karmic lesson Saturn is teaching includes the practical wisdom of protecting yourself legally and professionally. Keep records — this is part of your upaya.`,
    ],
    whatsappText: `Guru says my toxic boss situation will change by ${futureMonth1} ${year}! Saturn is finishing this lesson. Check yours at TrikalVaani.com`,
  };

  const genericResponse: SegmentResponse = {
    segmentId: req.segmentId || "general",
    insight: `${firstName}, Rohiit Gupta ji ka framework kehta hai — your current Dasha period is creating a powerful activation window for this area of your life. The planetary alignment suggests this is not a random challenge but a precisely timed cosmic opportunity. Trust the timing, take aligned action, and the results will compound. Your chart specifically shows significant positive movement beginning in ${futureMonth1} ${year}.`,
    timeline: `Between ${futureMonth1} and ${futureMonth2} ${year}, the planetary configuration creates your strongest window for positive shifts in this area. Act on the most important decision you have been postponing — the cosmic support is highest in this period.`,
    upay: [
      `Chant "Om Namah Shivaya" 108 times daily for 21 consecutive days — this is the master mantra that activates all planetary corrections simultaneously.`,
      `Offer water to the rising Sun each morning while stating your specific intention for this area of life — this activates the Sun's clarity and authority to accelerate your outcome.`,
    ],
    whatsappText: `Guru says my ${req.segmentLabel || "life"} situation will shift by ${futureMonth1} ${year}! Check yours free at TrikalVaani.com`,
  };

  if (req.segmentId === "ex_back") return exBackResponse;
  if (req.segmentId === "toxic_boss") return toxicBossResponse;
  return genericResponse;
}

function buildFallbackCompatibility(req: PredictRequest): CompatibilityResponse {
  const p1 = req.name.split(" ")[0];
  const p2 = req.partner!.name.split(" ")[0];
  const p1Seed = req.dob.replace(/-/g,"").split("").reduce((a,c)=>a+parseInt(c,10),0);
  const p2Seed = req.partner!.dob.replace(/-/g,"").split("").reduce((a,c)=>a+parseInt(c,10),0);
  const rawScore = ((p1Seed + p2Seed) % 37) + 45;
  const score = Math.min(92, rawScore);

  return {
    score,
    vibeMeters: {
      energy: Math.min(95, ((p1Seed * 3) % 30) + 60),
      loyalty: Math.min(92, ((p2Seed * 2) % 25) + 65),
      passion: Math.min(94, ((p1Seed + p2Seed) % 35) + 55),
    },
    flags: [
      { type: "green", label: "Twin Flame Match", explanation: `Your ruling planets carry natural friendship — communication flows easily between ${p1} and ${p2}.` },
      { type: "green", label: "Green Flag Detector: On", explanation: "Both charts share temperamental alignment — your approaches to life don't fundamentally clash." },
      { type: "red", label: "Mars Tension Alert", explanation: "Watch for ego-driven conflicts — this can be mitigated with the right Vedic remedy." },
    ],
    vibe: `${p1} and ${p2} carry a magnetic attraction that has real cosmic roots — there's genuine Prem Yoga here. But there's a hidden Mars-Saturn tension that could surface during arguments — the exact trigger points are in your full Red Flag Alert reading.`,
    verdict: `Rohiit Gupta ji ka analysis reveals a compatibility of ${score}/100 — ${score >= 70 ? "highly auspicious. The Shastras recommend moving forward with the commitment ritual below." : "karmically challenging — work consciously on the Nadi tension with a shared Mahamrityunjaya mantra practice for 21 days."}`,
    whatsappText: `Guru says ${p1} and ${p2}'s Vedic compatibility score is ${score}/100! Check yours free at TrikalVaani.com`,
  };
}

async function callGemini(prompt: string, geminiKey: string): Promise<string | null> {
  console.log(`[Gemini] Sending request — prompt length: ${prompt.length}, model: gemini-1.5-pro`);
  try {
    const res = await fetch(
      `${GEMINI_URL}?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[Gemini] FAIL — HTTP ${res.status}: ${errBody.slice(0, 400)}`);
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    if (!text) {
      console.error(`[Gemini] FAIL — no text in response. Full response: ${JSON.stringify(data).slice(0, 400)}`);
      return null;
    }
    console.log(`[Gemini] SUCCESS — response length: ${text.length}`);
    return text;
  } catch (err) {
    console.error(`[Gemini] EXCEPTION: ${err}`);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: PredictRequest = await req.json();
    const mode = body.mode || "predict";
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const currentYear = new Date().getFullYear();

    console.log(`[trikal-predict] Request — mode: ${mode}, name: ${body.name}, segment: ${body.segmentId || "N/A"}, partner: ${!!body.partner}, geminiKey: ${geminiKey ? "SET" : "NOT SET"}`);

    if (!geminiKey) {
      console.warn(`[trikal-predict] GEMINI_API_KEY not set — using fallback response for mode: ${mode}`);
    }

    let result: PredictResponse | SegmentResponse | CompatibilityResponse;

    if (mode === "segment") {
      if (!geminiKey) {
        result = buildFallbackSegment(body);
      } else {
        const prompt = buildSegmentPrompt(body);
        const rawText = await callGemini(prompt, geminiKey);
        if (!rawText) {
          console.warn(`[trikal-predict] Gemini returned null for segment ${body.segmentId} — using fallback`);
          result = buildFallbackSegment(body);
        } else {
          try {
            const match = rawText.match(/\{[\s\S]*\}/);
            result = match ? JSON.parse(match[0]) : buildFallbackSegment(body);
          } catch (parseErr) {
            console.error(`[trikal-predict] JSON parse failed: ${parseErr}. Raw: ${rawText.slice(0, 200)}`);
            result = buildFallbackSegment(body);
          }
        }
      }
    } else if (mode === "compatibility") {
      if (!body.partner) {
        return new Response(JSON.stringify({ error: "Partner data required for compatibility mode" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!geminiKey) {
        result = buildFallbackCompatibility(body);
      } else {
        const prompt = buildCompatibilityPrompt(body);
        const rawText = await callGemini(prompt, geminiKey);
        if (!rawText) {
          console.warn("[trikal-predict] Gemini returned null for compatibility — using fallback");
          result = buildFallbackCompatibility(body);
        } else {
          try {
            const match = rawText.match(/\{[\s\S]*\}/);
            result = match ? JSON.parse(match[0]) : buildFallbackCompatibility(body);
          } catch (parseErr) {
            console.error(`[trikal-predict] JSON parse failed: ${parseErr}`);
            result = buildFallbackCompatibility(body);
          }
        }
      }
    } else {
      if (!geminiKey) {
        result = buildFallbackPredict(body, currentYear);
      } else {
        const prompt = buildPredictPrompt(body);
        const rawText = await callGemini(prompt, geminiKey);
        if (!rawText) {
          console.warn("[trikal-predict] Gemini returned null for predict — using fallback");
          result = buildFallbackPredict(body, currentYear);
        } else {
          try {
            const match = rawText.match(/\{[\s\S]*\}/);
            result = match ? JSON.parse(match[0]) : buildFallbackPredict(body, currentYear);
          } catch (parseErr) {
            console.error(`[trikal-predict] JSON parse failed: ${parseErr}`);
            result = buildFallbackPredict(body, currentYear);
          }
        }
      }
    }

    console.log(`[trikal-predict] Returning result for mode: ${mode}`);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`[trikal-predict] Unhandled exception: ${err}`);
    return new Response(JSON.stringify({ error: "Internal error", detail: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
