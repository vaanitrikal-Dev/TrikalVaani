import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
  partner?: { name: string; dob: string; birth_time?: string; city: string };
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
}

interface CompatibilityResponse {
  score: number;
  vibeMeters: {
    energy: number;
    loyalty: number;
    passion: number;
  };
  flags: Array<{ type: "red" | "green"; label: string; explanation: string }>;
  vibe: string;
  verdict: string;
  whatsappText: string;
}

function getActiveDasha(dashaPeriods: PredictRequest["dashaPeriods"], currentYear: number) {
  return dashaPeriods?.find((d) => d.startYear <= currentYear && d.endYear >= currentYear);
}

function buildPredictPrompt(req: PredictRequest, tier: string = "free"): string {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const activeDasha = getActiveDasha(req.dashaPeriods, currentYear);
  const isGenZ = req.generation === "genz";
  const isPaid = tier !== "free";

  const cliffhangerNote = !isPaid
    ? `IMPORTANT: End each section with a CLIFFHANGER hook. Mention a specific planetary transit (Saturn Return, Rahu's Shadow, Jupiter's Blessing, Ketu's Release) that is "locked" and only revealed in the premium reading. Example: "But there's a deeper Saturn transit in ${currentYear + 1} that will either accelerate or block this — the exact timing is in your full reading."`
    : "";

  return `You are Trikal Guru — polite, diplomatic, traditional yet practical Vedic AI. Speak with warmth and authority. Be specific, not vague.

BIRTH DATA:
- Name: ${req.name}
- DOB: ${req.dob}, City: ${req.city}
- Generation: ${req.generation} (${isGenZ ? "use modern language: burnout, red flags, manifestation" : "use deep Vedic: Kul-Devta, Pitru-Dosha, Dharma-Karma"})
- Moon Sign (Rashi): ${req.rashi || "Unknown"}
- Current Dasha: ${activeDasha ? `${activeDasha.planet} Dasha (${activeDasha.startYear}–${activeDasha.endYear}) — ${activeDasha.theme}` : "Unknown"}
- Ashtakvarga Wealth Bindus: ${req.ashtakvargaWealth}/32
- Varshphal: ${req.varshphalFocus}
- Pillar Scores: Career=${req.pillarScores?.career}, Love=${req.pillarScores?.love}, Wealth=${req.pillarScores?.wealth}

${cliffhangerNote}

Return ONLY valid JSON — no markdown, no commentary:
{
  "career": {
    "headline": "one powerful sentence about career window",
    "window": "e.g. May–Sept 2026",
    "depth": "3–4 sentences, 10th house + Saturn, specific: promotion/pivot/business/recognition${!isPaid ? ". End with a cliffhanger about a locked transit." : ""}",
    "remedies": [
      {"level":"easy","action":"specific low-cost mantra or nature act","benefit":"what it unlocks","frequency":"daily/weekly"},
      {"level":"medium","action":"deeper practice","benefit":"what it unlocks","frequency":"weekly"},
      {"level":"deep","action":"committed Vedic upaya","benefit":"what it unlocks","frequency":"40-day cycle"}
    ]
  },
  "love": {
    "headline": "one powerful sentence about relationship window",
    "window": "e.g. July–Nov 2026",
    "depth": "3–4 sentences, 7th house + Venus/Jupiter, address marriage/partner/deepening${!isPaid ? ". End with a cliffhanger about a locked transit." : ""}",
    "remedies": [
      {"level":"easy","action":"specific low-cost mantra or nature act","benefit":"what it opens","frequency":"daily/weekly"},
      {"level":"medium","action":"deeper","benefit":"what it opens","frequency":"weekly"},
      {"level":"deep","action":"${isGenZ ? "breathwork or journaling" : "Kul-Devta puja"}","benefit":"what it opens","frequency":"21-day"}
    ]
  },
  "wealth": {
    "headline": "one powerful sentence about wealth window",
    "window": "e.g. Apr–Dec 2026",
    "depth": "3–4 sentences, 2nd & 11th house + Ashtakvarga ${req.ashtakvargaWealth} bindus, distinguish sudden gains vs savings${!isPaid ? ". End with a cliffhanger about a locked transit." : ""}",
    "remedies": [
      {"level":"easy","action":"wealth mantra or act","benefit":"what it activates","frequency":"daily"},
      {"level":"medium","action":"deeper","benefit":"what it activates","frequency":"monthly"},
      {"level":"deep","action":"${isGenZ ? "90-day wealth tracker" : "havan or ancestral clearing"}","benefit":"what it activates","frequency":"one-time/quarterly"}
    ]
  },
  "monthlyTimeline": [
    {"month":"${new Date(new Date().getFullYear(), new Date().getMonth()).toLocaleString("default",{month:"long"})}","year":${currentYear},"vibe":"specific planetary event for ${req.name.split(" ")[0]} this month","category":"career","intensity":"high"}
  ],
  "guruMessage": "warm 2–3 sentence personal blessing for ${req.name.split(" ")[0]} tying career+love+wealth with a Vedic mantra or wisdom quote${!isPaid ? ". End with a cliffhanger about what's locked in the premium reading." : ""}"
}
Generate 12 monthlyTimeline entries starting month ${currentMonth} year ${currentYear}. Customize each entry specifically for ${req.name.split(" ")[0]}'s dasha and scores.`;
}

function buildSegmentPrompt(req: PredictRequest, tier: string = "free"): string {
  const isGenZ = req.generation === "genz";
  const isMillennial = req.generation === "millennial";
  const currentYear = new Date().getFullYear();
  const activeDasha = getActiveDasha(req.dashaPeriods, currentYear);
  const isPaid = tier !== "free";

  const segmentContext: Record<string, string> = {
    ex_back: "Venus karaka analysis for past karmic bonds, Moon-Rahu axis, 7th house unfinished karma",
    toxic_boss: "Saturn-Mars tension in 10th/6th house, Rahu workplace karma, power dynamics at work",
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

  const cliffhangerNote = !isPaid
    ? `IMPORTANT: End the "insight" with a CLIFFHANGER hook. Mention a specific planetary transit (Saturn Return, Rahu's Shadow Phase, Jupiter's Blessing Window, Ketu's Karmic Release) that is "locked" and only revealed in the premium reading. Example: "But there's a critical Rahu transit in ${currentYear + 1} that will determine whether this resolves smoothly or requires deeper work — the exact timing is in your full reading."`
    : "";

  return `You are Trikal Guru — warm, specific, personalized Vedic AI.

BIRTH DATA for ${req.name}:
- DOB: ${req.dob}, City: ${req.city}
- Generation: ${req.generation}
- Moon Sign: ${req.rashi || "Unknown"}
- Current Dasha: ${activeDasha ? `${activeDasha.planet} (${activeDasha.startYear}–${activeDasha.endYear}) — ${activeDasha.theme}` : "Unknown"}
- Pillar Scores: Career=${req.pillarScores?.career}, Love=${req.pillarScores?.love}, Wealth=${req.pillarScores?.wealth}

SPECIFIC QUESTION ASKED: "${req.segmentLabel}"
VEDIC ANALYSIS CONTEXT: ${ctx}

${cliffhangerNote}

Give ${req.name.split(" ")[0]} a deeply personal answer to their specific question using ${isGenZ ? "modern relatable language (burnout, red flags, manifestation, energy alignment)" : isMillennial ? "balanced language mixing practical + Vedic wisdom" : "deep Vedic wisdom (Dharma, Karma, Pitru-Dosha, Kul-Devta)"}.

Return ONLY valid JSON:
{
  "segmentId": "${req.segmentId}",
  "insight": "3–4 deeply personal sentences answering their specific question using the Vedic house analysis context. Address their pain point directly. Use their name once.${!isPaid ? " End with a cliffhanger about a locked transit." : ""}",
  "timeline": "2–3 specific sentences with month/year windows for when their specific situation will shift or resolve. Be concrete: 'Between July and October 2026...'",
  "upay": [
    "Upay 1: specific low-cost mantra or nature-based remedy for their exact question",
    "Upay 2: one specific action or ritual directly addressing their pain point"
  ],
  "whatsappText": "Guru says [one-liner about their specific question result] in [month year]! Check yours free at TrikalVaani.com"
}`;
}

function buildCompatibilityPrompt(req: PredictRequest, tier: string = "free"): string {
  const p = req.partner!;
  const p1Year = parseInt(req.dob.split("-")[0], 10);
  const p2Year = parseInt(p.dob.split("-")[0], 10);
  const isPaid = tier !== "free";

  const cliffhangerNote = !isPaid
    ? `IMPORTANT: End the "vibe" section with a CLIFFHANGER hook. Mention a specific planetary clash or blessing (Mars-Venus tension, Saturn's relationship test, Rahu's karmic bond) that is "locked" and only revealed in the Red Flag Deep Dive. Example: "But there's a hidden Mars-Saturn tension that could surface during arguments — the exact trigger points are in your full Red Flag Alert reading."`
    : "";

  return `You are Trikal Guru doing Vedic Ashta-Koota compatibility analysis.

PERSON 1: ${req.name}, DOB: ${req.dob}, City: ${req.city}
PERSON 2: ${p.name}, DOB: ${p.dob}, City: ${p.city}

Calculate compatibility using:
- Varna (spiritual compatibility) — 1 point
- Vashya (mutual attraction) — 2 points
- Tara (birth star harmony) — 3 points
- Yoni (temperament match) — 4 points
- Graha Maitri (planetary friendship) — 5 points
- Gana (nature compatibility) — 6 points
- Bhakoot (love and prosperity) — 7 points
- Nadi (health and progeny) — 8 points

Total = 36 points. Convert to percentage. Identify 2–3 green flags and 1–2 red flags based on their DOBs and generation (${p1Year >= 1996 || p2Year >= 1996 ? "Gen Z couple — use modern relationship language: twin flame, ghosting probability, red flag detector, vibe check" : "mature couple — use Vedic marriage wisdom: Dharma, Karmic bond, spiritual partnership"}).

${cliffhangerNote}

Return ONLY valid JSON:
{
  "score": number between 0-100 (based on Ashta-Koota out of 36 converted to percentage),
  "vibeMeters": {
    "energy": number 0-100 (physical and emotional chemistry),
    "loyalty": number 0-100 (commitment and trust potential),
    "passion": number 0-100 (romantic and physical intensity)
  },
  "flags": [
    {"type":"green","label":"flag name in Gen Z terms like 'Twin Flame Match' or 'Green Flag Detector'","explanation":"one sentence why this is positive for them"},
    {"type":"green","label":"flag name","explanation":"one sentence"},
    {"type":"red","label":"flag name like 'Ghosting Probability' or 'Red Flag Alert'","explanation":"one sentence about challenge to watch for"}
  ],
  "vibe": "2 sentences describing the energy and attraction dynamic between ${req.name.split(" ")[0]} and ${p.name.split(" ")[0]} — be poetic but specific${!isPaid ? ". End with a cliffhanger about a locked planetary clash." : ""}",
  "verdict": "2–3 sentences of Trikal Guru's personal verdict on their compatibility — include one actionable remedy or advice to strengthen their bond",
  "whatsappText": "Guru says ${req.name.split(" ")[0]} and ${p.name.split(" ")[0]}'s Vedic compatibility score is [score]/100! [one fun insight about their vibe]. Check yours free at TrikalVaani.com"
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
        { level: "medium", action: isGenZ ? "Journal your authentic career vision for 10 minutes every morning before checking your phone" : "Perform Hanuman puja every Tuesday — recite the Hanuman Chalisa and offer sindoor", benefit: "Sharpens Dharmic clarity and professional intent", frequency: "21 consecutive days" },
        { level: "deep", action: isGenZ ? "40-day morning sadhana: 15 minutes of silence, then write 3 professional intentions" : "40-day Shani upaya: sesame oil lamp every Saturday + donate black sesame to Shani temple", benefit: "Deep-roots a new professional Karma cycle", frequency: "40-day unbroken cycle" },
      ],
    },
    love: {
      headline: isGenZ ? "The red flags era is ending — Venus is finally delivering genuine green-flag energy." : "Jupiter's benefic gaze on your 7th house opens a rare Vivah Yoga window.",
      window: `${months[(now.getMonth() + 2) % 12]}–${months[(now.getMonth() + 6) % 12]} ${currentYear}`,
      depth: isGenZ ? "The moon nodes are activating your relationship axis — karmic connections are entering your orbit right now. Some will be teachers, some genuine partners. Stay grounded enough to recognize the difference. The right person will match your energy without you having to shrink or perform." : "Venus and the 5th lord in mutual aspect weave a story of rekindled romance or meaningful emotional union. The Shastras call this 'Prem Labh' — love as earned abundance. For those partnered, this period is a rare invitation to deepen the Dharmic bond.",
      remedies: [
        { level: "easy", action: `Offer white flowers to Tulsi every Friday and chant "Om Shukraya Namah" 16 times`, benefit: "Strengthens Venus energy and opens the heart", frequency: "Every Friday" },
        { level: "medium", action: isGenZ ? "Write a heartfelt manifestation letter to your future partner — specific, sincere, without attachment" : "Light a pure ghee diya in the northeast corner every evening", benefit: "Activates 7th house and sends a clear Sankalpa", frequency: "21 consecutive days" },
        { level: "deep", action: isGenZ ? "21 days of So-Hum breathwork — 20 minutes each morning" : "Consult astrologer about Kul-Devta puja for ancestral Pitru-Dosha clearing", benefit: "Dissolves karmic residue from past relationships", frequency: "21-day sadhana" },
      ],
    },
    wealth: {
      headline: isGenZ ? "Your money era is beginning — the 2nd and 11th houses are both lit." : `Your Ashtakvarga score of ${req.ashtakvargaWealth} bindus signals an active Dhan Yoga window.`,
      window: `${months[now.getMonth()]}–${months[(now.getMonth() + 7) % 12]} ${currentYear}`,
      depth: isGenZ ? `Your Ashtakvarga wealth sector is activated at ${req.ashtakvargaWealth} bindus — the financial universe is paying attention. This is the time to treat money as a spiritual practice. Side hustle, investing, learning a high-value skill — any started now will compound faster than usual.` : `Your Ashtakvarga reveals ${req.ashtakvargaWealth} bindus — a configuration the Shastras describe as Dhan Yoga Udbhav. This is not a period for savings alone — it is an active cycle for wealth creation through investment, property, or crystallizing a long-nurtured financial vision.`,
      remedies: [
        { level: "easy", action: `Place a copper coin in your wallet and chant "Om Lakshmiyai Namah" 11 times each morning`, benefit: "Activates Lakshmi energy and keeps the wealth channel open", frequency: "Every morning" },
        { level: "medium", action: isGenZ ? "Automate a daily saving — even ₹50 — and treat it as an offering to your future self" : "Perform Lakshmi puja on every Purnima using marigolds, saffron milk, and ghee lamp", benefit: "Builds Dhan Yoga momentum through consistent intention", frequency: "Monthly on Purnima" },
        { level: "deep", action: isGenZ ? "90-day wealth tracking practice: record every income/expense with gratitude" : "Commission a Lakshmi Sahasranama Havan — powerful if Pitru-Dosha blocks ancestral wealth", benefit: "Dissolves deep karmic wealth blocks", frequency: "One-time with annual reinforcement" },
      ],
    },
    monthlyTimeline,
    guruMessage: isGenZ ? `${req.name.split(" ")[0]}, your chart is genuinely alive right now — the cosmos is building you, not making you wait. Trust the process, protect your energy, and take that one aligned action you've been postponing. As the Vedas say: 'Udyamena hi sidhyanti karyani.'` : `Dear ${req.name.split(" ")[0]}, 'Yatha drishti, tatha srishti' — as your vision, so your creation. Your chart carries genuine Yoga ahead. Honor your Dharma, acknowledge your Kul-Devta, and take the one decisive step you have been delaying.`,
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

  const fallbacks: Record<string, SegmentResponse> = {
    ex_back: {
      segmentId: "ex_back",
      insight: isGenZ
        ? `${firstName}, the Venus-Rahu axis in your chart reveals this past connection carries unresolved karmic weight — and that's exactly why it keeps surfacing in your thoughts. The moon nodes don't allow unfinished business to stay buried forever. Your chart shows a rare 'closure window' in the next few months where either reconciliation or genuine emotional release becomes possible. The cosmos is asking you to choose healing over holding on.`
        : `${firstName}, the 7th house analysis shows a classic Pitru-Dosha pattern in your relationship karma — where ancestral relationship patterns play out in your current bonds. This connection has a karmic purpose beyond its surface form. The Venus transit entering your 5th house in the coming months will bring either a meaningful reunion or — more powerfully — a full emotional release that frees you for a higher Prem Yoga.`,
      timeline: `Between ${futureMonth1} and ${futureMonth2} ${year}, Venus enters a powerful aspect with your natal Moon — this is the definitive closure or rekindling window. If nothing shifts by ${futureMonth2}, the cosmic door on this chapter closes completely and a new, higher-quality connection opens in its place.`,
      upay: [
        isGenZ ? `Write a "release letter" to this person — honest, specific, without sending it. Burn it on a Friday evening. This is a genuine Vedic Sankalpa ritual for emotional release.` : `On the next Purnima (full moon), offer white flowers to flowing water while consciously releasing this person's energy from your life. Chant "Om Shukraya Namah" 16 times.`,
        isGenZ ? `Chant "Om Chandraya Namah" 11 times before sleeping for 21 days — this directly works on the Moon-governed emotional layer and speeds karmic resolution.` : `Consult about your Kul-Devta — many persistent relationship entanglements trace to unresolved ancestral bonds that need a lineage-specific puja to dissolve.`,
      ],
      whatsappText: `Guru says my ex situation will reach cosmic resolution by ${futureMonth1} ${year}! The stars don't do drama — they do closure. Check yours free at TrikalVaani.com`,
    },
    toxic_boss: {
      segmentId: "toxic_boss",
      insight: isGenZ
        ? `${firstName}, your Saturn placement in relation to the 10th house is creating a testing phase that feels like it's about your boss — but it's actually about your professional identity. The toxic dynamic you're experiencing is Saturn's way of asking: "Is this the environment your soul's work deserves?" The chart says clearly: this situation has a defined end date, and your next chapter is significantly more aligned.`
        : `${firstName}, the Saturn-Mars tension in your karma bhava reveals a classic 'Karma Kshetra' test — where the workplace becomes the arena for resolving past-life power dynamics. Your current authority figure carries the karmic mirror of patterns you are meant to transcend, not endure indefinitely. The Shastras speak of 'Karma Parivartan' — and your chart strongly indicates this transition is imminent.`,
      timeline: `Saturn moves away from its challenging aspect to your 10th house between ${futureMonth1} and ${futureMonth2} ${year}. This is your professional liberation window — either the dynamic shifts dramatically or you successfully exit to something significantly better. Either way, the situation changes in your favor by ${futureMonth2}.`,
      upay: [
        isGenZ ? `Every Monday morning before entering your workspace, chant "Om Hanumate Namah" 11 times. This activates Mars protection and prevents others' negative energy from affecting your aura.` : `Perform a Hanuman puja every Tuesday — the Panchamukhi Hanuman specifically protects against 'Karma Kshetra' adversaries. Offer red flowers and recite the Sankat Mochan Hanuman Ashtak.`,
        `Document everything. The karmic lesson Saturn is teaching includes the practical wisdom of protecting yourself legally and professionally. Keep records — this is part of your upaya.`,
      ],
      whatsappText: `Guru says my toxic boss situation will change by ${futureMonth1} ${year}! Saturn is finishing this lesson — yours might be ending too. Check at TrikalVaani.com`,
    },
    manifestation: {
      segmentId: "manifestation",
      insight: `${firstName}, your 11th house activation combined with the current Jupiter transit creates what Vedic astrology calls a "Sankalpa Siddhi" window — a rare period where clearly stated intentions backed by consistent action carry exponentially more cosmic weight than usual. The universe is not testing your faith right now; it is actively building your reality based on the dominant thoughts and feelings you're broadcasting.`,
      timeline: `Your peak manifestation window opens in ${futureMonth1} ${year} and peaks in ${futureMonth2}. Intentions set during this period — especially around the full moon — carry 3x their normal karmic weight. The Shastras call this 'Sankalpa Kaal' and it occurs only 2–3 times in a decade for any given chart.`,
      upay: [
        `Write your top 3 manifestation intentions on paper — not your phone — every morning for 40 consecutive days before the ${futureMonth1} window opens. Place the paper under a glass of water overnight and drink it with conscious intention in the morning.`,
        `Offer yellow flowers to Lord Jupiter every Thursday and chant "Om Guruve Namah" 16 times. Jupiter governs expansion and abundance — direct communication strengthens the manifestation channel.`,
      ],
      whatsappText: `Guru says my manifestation window opens in ${futureMonth1} ${year} — and this one's a peak cycle! Check your Sankalpa Kaal window free at TrikalVaani.com`,
    },
    dream_career: {
      segmentId: "dream_career",
      insight: isGenZ
        ? `${firstName}, the Rahu-10th house activation in your chart is a classic "Dream Career Pivot" indicator — and right now, that Rahu is conjunct ambition. The cosmic message is clear: the career you've been quietly imagining isn't just a dream, it's a Dharmic destination your chart has been building toward. The fear of making the leap is Saturn testing your conviction, not the universe saying no.`
        : `${firstName}, the 10th lord's movement combined with your current Dasha creates what the Shastras call 'Karma Yoga Udbhav' — a destined professional pivot where the role you were truly born to inhabit becomes accessible. This isn't ambition; it is your soul's pre-birth career intention finally aligning with external planetary timing.`,
      timeline: `Between ${futureMonth1} and ${futureMonth2} ${year}, your 10th house receives benefic aspects that create a genuine "permission window" for bold career moves. Any application, pitch, or professional leap made in this period has significantly higher cosmic backing than at any other time this year.`,
      upay: [
        `Every Sunday, write one concrete action toward your dream career that you will complete that week. Not a goal — an action. Chant "Om Suryaya Namah" 12 times after writing. This activates the Sun's career and authority energy.`,
        isGenZ ? `Build a "dream career" vision board and look at it for 2 minutes each morning before checking your phone. This is a genuine Drishtikon (visual Sankalpa) practice from the Vedas.` : `Visit a Surya (Sun) temple on any Sunday in the coming month and specifically ask for clarity and courage in your career Dharma. The Sun governs the 10th house in most Vedic charts.`,
      ],
      whatsappText: `Guru says my Dream Career Pivot window opens ${futureMonth1} ${year}! Saturn is done blocking, now it's building. Check yours at TrikalVaani.com`,
    },
    property_yog: {
      segmentId: "property_yog",
      insight: `${firstName}, the 4th house analysis reveals a classic Property Yog pattern in your chart — with Jupiter casting a benefic gaze that the Shastras associate specifically with "Bhumi Labh" (land and property gains). The emotional pull you feel toward owning a home is not merely material desire; it is your chart's karmic intelligence recognizing that stable roots will amplify every other area of your life. The timing is approaching.`,
      timeline: `The strongest property acquisition window in your chart runs from ${futureMonth1} through ${futureMonth2} ${year}. Saturn's discipline combined with Jupiter's expansion creates a 'Grihasthi Yoga' — the foundational home-building energy. Any serious inquiry, down payment, or registration during this window carries disproportionate cosmic support.`,
      upay: [
        `Perform a Vastu Puja before entering any property you are seriously considering — even before making an offer. This establishes your intention with the land's energy and reveals hidden incompatibilities early.`,
        `Chant "Om Bhomaye Namah" (Mars/Bhumi mantra) 19 times on Tuesday mornings — Mars governs property and land in Vedic astrology and this directly activates your 4th house energy.`,
      ],
      whatsappText: `Guru says my Property Yog peaks between ${futureMonth1}–${futureMonth2} ${year}! Jupiter + 4th house = home energy is real. Check your Property Yog at TrikalVaani.com`,
    },
    karz_mukti: {
      segmentId: "karz_mukti",
      insight: `${firstName}, the 6th house analysis reveals a 'Rin Bandhan' (debt bondage) pattern that has deeper Karmic roots than just financial decisions — many financial burdens carry ancestral Pitru-Dosha energies where family money patterns are being resolved through you. The Shastras teach that Karz Mukti (debt liberation) requires both practical action and spiritual clearing of the ancestral debt-karma simultaneously.`,
      timeline: `Saturn's transit through your 6th house completes its debt-reduction phase between ${futureMonth1} and ${futureMonth2} ${year}. This is your most powerful window for making decisive progress on debt — whether through negotiation, consolidation, or a breakthrough income stream. The momentum you build in this period compounds powerfully through the following year.`,
      upay: [
        `On the next Amavasya (new moon), offer sesame seeds mixed with water to the Sun in the morning while mentally acknowledging any family members who struggled financially — this begins to dissolve ancestral Rin-Dosha patterns.`,
        `Chant "Om Shanicharaya Namah" 19 times every Saturday and donate black sesame or mustard oil to those in need. Saturn governs the 6th house of debts and this directly accelerates debt karma resolution.`,
      ],
      whatsappText: `Guru says my Karz Mukti window peaks ${futureMonth1} ${year}! Saturn's debt-clearing phase is ending soon. Check your Karz Mukti timing at TrikalVaani.com`,
    },
    child_destiny: {
      segmentId: "child_destiny",
      insight: `${firstName}, the 5th house Putra Bhava analysis reveals a deeply auspicious pattern in your chart regarding children and their cosmic destiny. Jupiter's placement confirms that your children — born or future — carry significant planetary blessings for their own path. The Shastras teach that parents and children choose each other karmically; the souls that come to you carry specific Yoga that complements your own chart.`,
      timeline: `The 5th house activation peak runs from ${futureMonth1} through ${futureMonth2} ${year} — this is the optimal window for important decisions regarding children's education, health, or for those awaiting a child's arrival, this period carries enhanced 'Santana Yoga' energy. Intentions set and actions taken for a child's wellbeing during this window carry triple their normal karmic potency.`,
      upay: [
        `Recite the Santana Gopala mantra "Om Devaki-Suta Govinda Vasudeva Jagat-Pate, Dehi Me Tanayam Krishna Tvam-Aham Sharanam Gatah" 21 times daily for 21 consecutive days — this is the classical Vedic invocation for child wellbeing and destiny blessing.`,
        `Offer yellow sweets (modak or besan laddoo) to Lord Ganesha every Wednesday and specifically pray for your child's clear path and cosmic protection.`,
      ],
      whatsappText: `Guru says my child's cosmic destiny window opens ${futureMonth1} ${year}! The 5th house blessing is real. Check your Putra Bhava at TrikalVaani.com`,
    },
    parents_wellness: {
      segmentId: "parents_wellness",
      insight: `${firstName}, the 4th and 9th house analysis reveals a strong ancestral protection mandate in your chart — your parents and grandparents' wellbeing is cosmically connected to the Pitru-Dosha resolution work that your generation is meant to complete. The worry you feel for your parents' health is not just emotional; it is your chart's karmic intelligence recognizing an ancestral healing task that only you can initiate.`,
      timeline: `The 4th house benefic transit between ${futureMonth1} and ${futureMonth2} ${year} creates a powerful window for ancestral healing and parental wellbeing support. Medical decisions, health interventions, or simply increased presence and prayer during this window carry disproportionate positive impact for your parents' trajectory.`,
      upay: [
        `On every Amavasya (new moon), offer water with sesame seeds to the Sun while mentally honoring your ancestors by name. This is the classical Tarpan practice and directly addresses Pitru-Dosha affecting parental wellness.`,
        `Organize or participate in a Pitru-Puja (ancestral prayer ceremony) — even a simple one — before the ${futureMonth1} window. Feeding Brahmins, birds, or cows on behalf of ancestors is one of the most powerful karmic interventions available for protecting living family members.`,
      ],
      whatsappText: `Guru says the ${futureMonth1} ${year} window is key for my parents' wellness protection! The 9th house ancestral shield is real. Check yours at TrikalVaani.com`,
    },
    retirement_peace: {
      segmentId: "retirement_peace",
      insight: `${firstName}, the 12th house and Jupiter's final cycle in your chart reveal a beautiful 'Sanyasa Yoga' that the Shastras describe as the natural evolution from Grihastha (householder) to Vanaprastha (sage) energy. The restlessness or questioning you may feel around retirement isn't anxiety — it is your soul's intelligence beginning to orient toward its deeper purpose beyond professional identity. Your chart says this transition, when embraced consciously, leads to your most fulfilling years.`,
      timeline: `The Vanaprastha energy in your chart becomes fully activated between ${futureMonth1} ${year} and the following 18 months. Decisions made about retirement structure, asset legacy, and spiritual practice during this window establish the foundation for the quality of your next life chapter. The peace you seek is available — but it requires intentional navigation of this transition.`,
      upay: [
        `Begin a daily practice of sitting in silence for 15 minutes at sunrise — facing east. This is a classical Sandhya Vandanam practice that activates the 12th house's moksha energy and brings the inner peace that retirement's external changes cannot provide alone.`,
        `Revisit your Kul-Devta temple — or arrange for a puja at your ancestral deity's shrine. Many elders find that the restlessness of this life phase dissolves when ancestral blessings are formally renewed. This is both spiritual and deeply practical.`,
      ],
      whatsappText: `Guru says my Retirement Peace window opens ${futureMonth1} ${year} — the Vanaprastha energy is activating! Check your 12th house peace window at TrikalVaani.com`,
    },
    legacy_inheritance: {
      segmentId: "legacy_inheritance",
      insight: `${firstName}, the 8th and 2nd house analysis reveals a 'Dhan-Karma' configuration that connects your personal wealth destiny to the ancestral inheritance patterns of your lineage. Whether this manifests as financial inheritance, the transmission of wisdom and values, or the resolution of ancestral property karma — your chart clearly indicates that legacy matters are reaching an important inflection point. The Shastras teach that how we steward what we inherit determines what we transmit.`,
      timeline: `The 8th house Jupiter transit between ${futureMonth1} and ${futureMonth2} ${year} creates the most powerful legacy and inheritance window in your chart for the next several years. Legal, financial, or family conversations about assets, wills, or ancestral property have significantly better outcomes when initiated or concluded during this window.`,
      upay: [
        `Commission a Pitru-Tarpan ceremony — especially if there are unresolved ancestral property disputes or if family wealth has diminished across generations. This addresses the root Pitru-Dosha that often underlies inheritance complications.`,
        `Chant "Om Yamaaya Namah" 19 times on Saturdays — Yama governs the 8th house of inheritance and this mantra brings clarity, fairness, and smooth resolution to legacy matters.`,
      ],
      whatsappText: `Guru says my Legacy & Inheritance window peaks ${futureMonth1} ${year}! The 8th house karma is clearing. Check your Legacy Yog at TrikalVaani.com`,
    },
    spiritual_innings: {
      segmentId: "spiritual_innings",
      insight: `${firstName}, the Ketu and 12th house activation in your chart is one of the most beautiful configurations in Vedic astrology — what the ancient Rishis called 'Moksha Yoga Udbhav.' The spiritual calling you feel at this stage of life is not a retreat from the world; it is the universe recognizing that you have sufficient worldly wisdom to now be of service at a higher level. Your second innings is spiritual leadership, not spiritual escape.`,
      timeline: `Ketu completes its current transit and enters a powerful conjunction with your 12th house activator between ${futureMonth1} and ${futureMonth2} ${year}. This is your "Diksha window" — the optimal time to formally commit to a meditation practice, take initiation from a Guru, or establish the daily spiritual routine that will define your second innings. Commitments made in this window stick for life.`,
      upay: [
        `Begin reciting the Mahamrityunjaya Mantra 108 times daily — ideally at dawn. This is the master mantra for the spiritual second innings, combining health protection with moksha energy. Use a rudraksha mala if available.`,
        `Visit a significant Shiva temple or a Kashi-type pilgrimage site before ${futureMonth1} if possible. The darshan (sacred witnessing) during this cosmic period accelerates your spiritual second innings activation by years.`,
      ],
      whatsappText: `Guru says my Spiritual Second Innings formally begins ${futureMonth1} ${year} — Ketu + 12th house is activated! Check your Moksha Yoga at TrikalVaani.com`,
    },
  };

  return fallbacks[req.segmentId || "ex_back"] || fallbacks["ex_back"];
}

function buildFallbackCompatibility(req: PredictRequest): CompatibilityResponse {
  const p1 = req.name.split(" ")[0];
  const p2 = req.partner!.name.split(" ")[0];
  const p1Seed = req.dob.replace(/-/g,"").split("").reduce((a,c)=>a+parseInt(c,10),0);
  const p2Seed = req.partner!.dob.replace(/-/g,"").split("").reduce((a,c)=>a+parseInt(c,10),0);
  const rawScore = ((p1Seed + p2Seed) % 37) + 45;
  const score = Math.min(92, rawScore);

  const energyScore = Math.min(95, ((p1Seed * 3) % 30) + 60);
  const loyaltyScore = Math.min(92, ((p2Seed * 2) % 25) + 65);
  const passionScore = Math.min(94, ((p1Seed + p2Seed) % 35) + 55);

  return {
    score,
    vibeMeters: {
      energy: energyScore,
      loyalty: loyaltyScore,
      passion: passionScore,
    },
    flags: [
      { type: "green", label: "Twin Flame Match", explanation: `Your ruling planets carry natural friendship — communication flows easily between ${p1} and ${p2}.` },
      { type: "green", label: "Green Flag Detector: On", explanation: "Both charts share temperamental alignment — your approaches to life don't fundamentally clash." },
      { type: "red", label: "Ghosting Probability: Low", explanation: "Watch for health-related stress patterns — this can be mitigated with the right Vedic remedy." },
    ],
    vibe: `${p1} and ${p2} carry a magnetic attraction that has real cosmic roots — there's genuine Prem Yoga here. But there's a hidden Mars-Saturn tension that could surface during arguments — the exact trigger points are in your full Red Flag Alert reading.`,
    verdict: `The Ashta-Koota analysis reveals a compatibility of ${score}/100 — which places this relationship in the ${score >= 70 ? "highly auspicious" : score >= 50 ? "moderately compatible" : "karmically challenging"} range. ${score >= 70 ? "The Shastras recommend moving forward with clear communication and the commitment ritual below." : "Work consciously on the Nadi tension — a shared Mahamrityunjaya mantra practice for 21 days will significantly strengthen the bond."}`,
    whatsappText: `Guru says ${p1} and ${p2}'s Vedic compatibility score is ${score}/100! ${score >= 70 ? "Green flags are real" : "Work to do but the love is genuine"}. Check yours free at TrikalVaani.com`,
  };
}

async function callGemini(prompt: string, geminiKey: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 2048 },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
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

    let result: PredictResponse | SegmentResponse | CompatibilityResponse;

    if (mode === "segment") {
      if (!geminiKey) {
        result = buildFallbackSegment(body);
      } else {
        const prompt = buildSegmentPrompt(body);
        const rawText = await callGemini(prompt, geminiKey);
        if (!rawText) {
          result = buildFallbackSegment(body);
        } else {
          const match = rawText.match(/\{[\s\S]*\}/);
          result = match ? JSON.parse(match[0]) : buildFallbackSegment(body);
        }
      }
    } else if (mode === "compatibility") {
      if (!body.partner) {
        return new Response(JSON.stringify({ error: "Partner data required" }), {
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
          result = buildFallbackCompatibility(body);
        } else {
          const match = rawText.match(/\{[\s\S]*\}/);
          result = match ? JSON.parse(match[0]) : buildFallbackCompatibility(body);
        }
      }
    } else {
      if (!geminiKey) {
        result = buildFallbackPredict(body, currentYear);
      } else {
        const prompt = buildPredictPrompt(body);
        const rawText = await callGemini(prompt, geminiKey);
        if (!rawText) {
          result = buildFallbackPredict(body, currentYear);
        } else {
          const match = rawText.match(/\{[\s\S]*\}/);
          result = match ? JSON.parse(match[0]) : buildFallbackPredict(body, currentYear);
        }
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("trikal-predict error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
