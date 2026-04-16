import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PredictRequest {
  name: string;
  dob: string;
  birth_time?: string;
  city: string;
  generation: string;
  dashaPeriods: Array<{ planet: string; startYear: number; endYear: number; quality: string; theme: string }>;
  pillarScores: Record<string, number>;
  ashtakvargaWealth: number;
  varshphalFocus: string;
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

function buildPrompt(req: PredictRequest): string {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const activeDasha = req.dashaPeriods.find(
    (d) => d.startYear <= currentYear && d.endYear >= currentYear
  );

  return `You are Trikal Guru — a Vedic astrology AI that is polite, diplomatic, traditional yet practical.
You speak with warmth and authority. Avoid being vague — give specific, actionable predictions.

BIRTH DATA:
- Name: ${req.name}
- DOB: ${req.dob}
- City: ${req.city}
- Generation: ${req.generation} (${req.generation === "genz" ? "under 30 — use modern relatable language: burnout, red flags, manifestation, energy" : "over 30 — use deeper Vedic wisdom: Kul-Devta, Pitru-Dosha, Dharma-Karma balance"})
- Current Dasha: ${activeDasha ? `${activeDasha.planet} (${activeDasha.startYear}–${activeDasha.endYear}) — ${activeDasha.theme}` : "Unknown"}
- Ashtakvarga Wealth Bindus: ${req.ashtakvargaWealth}/32
- Varshphal Focus: ${req.varshphalFocus}
- Pillar Scores: Career=${req.pillarScores.career}, Love=${req.pillarScores.love}, Wealth=${req.pillarScores.wealth}

YOUR TASK: Analyze the dasha and transits. Predict windows for Job Change/Business Success, Relationship Milestones/Marriage, and Financial Gains/Sudden Wealth based on 1970–2015 demographic pain points.

Return ONLY valid JSON in this exact structure:
{
  "career": {
    "headline": "one powerful sentence about their career window",
    "window": "e.g. May–September 2026",
    "depth": "3–4 sentences of specific Vedic career prediction using 10th house and Saturn analysis. Be specific about what kind of change — promotion, pivot, business, or recognition.",
    "remedies": [
      { "level": "easy", "action": "specific low-cost mantra or nature-based act", "benefit": "what it unlocks", "frequency": "daily/weekly" },
      { "level": "medium", "action": "slightly deeper practice", "benefit": "what it unlocks", "frequency": "weekly" },
      { "level": "deep", "action": "committed Vedic practice or upaya", "benefit": "what it unlocks", "frequency": "40-day cycle or monthly" }
    ]
  },
  "love": {
    "headline": "one powerful sentence about their relationship window",
    "window": "e.g. July–November 2026",
    "depth": "3–4 sentences of specific prediction using 7th house and Venus/Jupiter transits. Address marriage, meeting a partner, or deepening existing bonds.",
    "remedies": [
      { "level": "easy", "action": "specific low-cost mantra or nature act", "benefit": "what it opens", "frequency": "daily/weekly" },
      { "level": "medium", "action": "slightly deeper", "benefit": "what it opens", "frequency": "weekly" },
      { "level": "deep", "action": "Kul-Devta or puja if elder gen, breathwork or journaling if gen z", "benefit": "what it opens", "frequency": "21-day or monthly" }
    ]
  },
  "wealth": {
    "headline": "one powerful sentence about their wealth window",
    "window": "e.g. April–December 2026",
    "depth": "3–4 sentences using 2nd and 11th house analysis and Ashtakvarga bindus. Distinguish between sudden gains vs mandatory savings periods.",
    "remedies": [
      { "level": "easy", "action": "specific low-cost wealth mantra or act", "benefit": "what it activates", "frequency": "daily" },
      { "level": "medium", "action": "slightly deeper", "benefit": "what it activates", "frequency": "monthly" },
      { "level": "deep", "action": "havan or ancestral clearing if elder, 90-day wealth tracker if gen z", "benefit": "what it activates", "frequency": "one-time or quarterly" }
    ]
  },
  "monthlyTimeline": [
    { "month": "May", "year": ${currentYear}, "vibe": "Career momentum builds — submit that application or pitch", "category": "career", "intensity": "high" },
    { "month": "June", "year": ${currentYear}, "vibe": "Venus warms your heart sector — stay open to connection", "category": "love", "intensity": "moderate" },
    { "month": "July", "year": ${currentYear}, "vibe": "Financial clarity arrives — review investments", "category": "wealth", "intensity": "high" },
    { "month": "August", "year": ${currentYear}, "vibe": "Peak career window — bold moves rewarded by Saturn", "category": "career", "intensity": "peak" },
    { "month": "September", "year": ${currentYear}, "vibe": "Relationship milestones possible — Jupiter blesses 7th house", "category": "love", "intensity": "peak" },
    { "month": "October", "year": ${currentYear}, "vibe": "Wealth accumulation phase — 11th house activated", "category": "wealth", "intensity": "peak" },
    { "month": "November", "year": ${currentYear}, "vibe": "General alignment — consolidate gains", "category": "general", "intensity": "moderate" },
    { "month": "December", "year": ${currentYear}, "vibe": "Year-end clarity — set intentions for the new solar cycle", "category": "general", "intensity": "high" },
    { "month": "January", "year": ${currentYear + 1}, "vibe": "New Varshphal energy activates — fresh professional start", "category": "career", "intensity": "high" },
    { "month": "February", "year": ${currentYear + 1}, "vibe": "Venus-Jupiter conjunction supports love and abundance", "category": "love", "intensity": "peak" },
    { "month": "March", "year": ${currentYear + 1}, "vibe": "2nd house gains — unexpected income channels open", "category": "wealth", "intensity": "high" },
    { "month": "April", "year": ${currentYear + 1}, "vibe": "Momentum across all pillars — decisive action rewarded", "category": "general", "intensity": "peak" }
  ],
  "guruMessage": "A warm, personal 2–3 sentence closing message from Trikal Guru addressed to ${req.name.split(" ")[0]} that ties their career, love, and wealth themes together with a specific piece of Vedic wisdom or mantra. Make it feel like a personal blessing, not generic advice."
}

Customize the monthlyTimeline based on ${req.name.split(" ")[0]}'s specific dasha, pillar scores, and generation. Start the timeline from the CURRENT month (month ${currentMonth}, year ${currentYear}).
Return ONLY the JSON. No markdown, no explanation.`;
}

function buildFallback(req: PredictRequest, currentYear: number): PredictResponse {
  const isGenZ = req.generation === "genz";
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const now = new Date();
  const monthlyTimeline: MonthForecast[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const categories: Array<"career" | "love" | "wealth" | "general"> = ["career","love","wealth","general","career","love","wealth","general","career","love","wealth","general"];
    const intensities: Array<"peak" | "high" | "moderate"> = ["high","moderate","peak","high","peak","moderate","high","peak","moderate","high","peak","moderate"];
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
    monthlyTimeline.push({ month: months[d.getMonth()], year: d.getFullYear(), vibe: vibes[i % vibes.length], category: categories[i], intensity: intensities[i] });
  }

  return {
    career: {
      headline: isGenZ ? "Your 10th house is fully activated — this is your era to stop playing small." : "Saturn's disciplined transit through your karma bhava marks a decisive Karma-Kanda shift in professional life.",
      window: `${months[now.getMonth()]}–${months[(now.getMonth() + 4) % 12]} ${currentYear}`,
      depth: isGenZ
        ? "The planetary alignment is pointing directly at a career identity upgrade. This isn't just about changing jobs — it's about stepping into the version of yourself that your work actually reflects. Saturn is building your professional character right now, not blocking it. The burnout you may be feeling is the old structure breaking down to make room for something aligned. Show up consistently and the cosmic timing will meet you halfway."
        : "The 10th lord's movement through your Varshphal chart indicates that professional decisions made in this window carry lasting Karmic weight. Whether this is an institutional elevation or the birth of an independent enterprise, the stars strongly favor bold, Dharmic action over cautious patience. Saturn asks you to audit whether your current role serves your soul's true purpose — the Shastras call this moment 'Karma Parivartan,' a righteous professional pivot.",
      remedies: [
        { level: "easy", action: isGenZ ? `Chant "Om Shanicharaya Namah" 19 times each Saturday morning` : `Chant "Om Shanicharaya Namah" 19 times every Saturday before noon`, benefit: "Pacifies Saturn's testing energy and removes professional obstacles", frequency: "Every Saturday" },
        { level: "medium", action: isGenZ ? "Spend 10 minutes journaling your authentic career vision before opening your phone each morning for 21 days" : "Perform Hanuman puja every Tuesday — recite the Hanuman Chalisa and offer sindoor", benefit: "Crystallizes your professional Dharma and sharpens purposeful intent", frequency: "21 consecutive days" },
        { level: "deep", action: isGenZ ? "Begin a 40-day morning sadhana: 15 minutes of silence, then write 3 professional intentions — no excuses, no breaks" : "Observe a 40-day Shani upaya — light a sesame oil lamp every Saturday evening and donate black sesame to a Shiva temple", benefit: "Deep-roots a new professional Karma cycle and dissolves ancestral career blocks", frequency: "40-day unbroken cycle" },
      ],
    },
    love: {
      headline: isGenZ ? "The red flags era is ending — Venus is finally delivering genuine green-flag energy to your orbit." : "Jupiter's benefic gaze on your 7th house opens a rare window of Vivah Yoga or deep partnership renewal.",
      window: `${months[(now.getMonth() + 2) % 12]}–${months[(now.getMonth() + 6) % 12]} ${currentYear}`,
      depth: isGenZ
        ? "The moon nodes are activating your relationship axis which means karmic connections are actively entering your orbit right now — some will be teachers, some will be genuine partners. Your job is to stay grounded enough to recognize the difference. The right person will match your energy without you having to shrink or perform. Stop manifesting a type and start manifesting alignment — the cosmos has already set the appointment."
        : "Venus and the 5th lord in mutual aspect weave a beautiful story of rekindled romance or meaningful emotional union. The Shastras call this 'Prem Labh' — love as a form of earned abundance that arrives when you have done sufficient inner work. For those already in partnership, this period is a rare invitation to deepen the Dharmic bond and resolve longstanding Karmic patterns between you. Do not let past disappointments build walls where planetary energy is constructing doors.",
      remedies: [
        { level: "easy", action: "Offer fresh white flowers to a Tulsi plant every Friday evening and chant \"Om Shukraya Namah\" 16 times", benefit: "Strengthens Venus energy and gently opens the heart to authentic connection", frequency: "Every Friday" },
        { level: "medium", action: isGenZ ? "Write a heartfelt manifestation letter to your future partner — specific and sincere, without attachment to form or timeline" : "Light a pure ghee diya in the northeast corner of your home each evening and offer a single marigold", benefit: "Sends a clear Sankalpa into the cosmos and activates the 7th house of partnership", frequency: "21 consecutive days" },
        { level: "deep", action: isGenZ ? "Commit to 21 days of So-Hum breathwork — 20 minutes each morning — to clear karmic debris from past relationships" : "Consult a Vedic astrologer about your Kul-Devta and arrange a puja — many deep relationship blocks trace to ancestral Pitru-Dosha that requires lineage-specific resolution", benefit: "Dissolves karmic residue from past connections and opens the heart chakra to receive genuine love", frequency: "21-day sadhana" },
      ],
    },
    wealth: {
      headline: isGenZ ? "Your money era is beginning — the 2nd and 11th houses are both lit and waiting for you to act." : `Your Ashtakvarga score of ${req.ashtakvargaWealth} bindus signals an active Dhan Yoga window — this is for building, not gambling.`,
      window: `${months[now.getMonth()]}–${months[(now.getMonth() + 7) % 12]} ${currentYear}`,
      depth: isGenZ
        ? `Your Ashtakvarga wealth sector is activated at ${req.ashtakvargaWealth} bindus — which in plain terms means the financial universe is paying attention to your moves right now. This is the time to start treating money as a spiritual practice, not just a transaction. Every conscious financial decision you make in this window is cosmically amplified. Side hustle, investing, learning a high-value skill — any of these started now will compound faster than usual.`
        : `Your Ashtakvarga analysis reveals ${req.ashtakvargaWealth} bindus in the 2nd house — a configuration the Shastras describe as 'Dhan Yoga Udbhav' when combined with the current Varshphal benefic placement. This is not a period for mandatory savings alone — it is an active cycle for strategic wealth creation through investment, property, or the crystallization of a long-nurtured financial vision. The 8th house lord's simultaneous activation counsels against speculative ventures — build deliberately, do not gamble.`,
      remedies: [
        { level: "easy", action: "Place a copper coin in your wallet and chant \"Om Lakshmiyai Namah\" 11 times each morning before spending any money", benefit: "Activates Lakshmi energy and keeps the wealth channel consciously open", frequency: "Every morning" },
        { level: "medium", action: isGenZ ? "Automate a daily saving — even ₹50 or $1 — and treat each deposit as an intentional offering to your future self" : "Perform a full Lakshmi puja on every Purnima (full moon) using marigolds, saffron milk, and ghee lamp", benefit: "Builds sustainable Dhan Yoga momentum through consistent intention aligned with action", frequency: "Monthly on Purnima" },
        { level: "deep", action: isGenZ ? "Begin a 90-day wealth consciousness practice: track every rupee or dollar with gratitude and time your biggest financial moves to your peak planetary months" : "Commission a Lakshmi Sahasranama Havan with 108 offerings — especially powerful if Pitru-Dosha is present in the 2nd house, which can silently block ancestral wealth transmission", benefit: "Dissolves deep karmic wealth blocks and activates multi-generational Labh flow", frequency: "One-time with annual reinforcement" },
      ],
    },
    monthlyTimeline,
    guruMessage: isGenZ
      ? `${req.name.split(" ")[0]}, your chart is genuinely alive right now — the cosmos is not making you wait, it is building you. Trust the process, protect your energy, and take the one aligned action you have been postponing. As the Vedas say: 'Udyamena hi sidhyanti karyani' — it is through effort that things are accomplished, not through wishful thinking.`
      : `Dear ${req.name.split(" ")[0]}, the Shastras remind us that 'Yatha drishti, tatha srishti' — as your vision, so your creation. Your chart carries genuine Yoga for the period ahead in career, love, and wealth. Honor your Dharma, acknowledge your Kul-Devta, and take the one decisive action you have been postponing. The cosmic appointment is set — it only awaits your presence.`,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: PredictRequest = await req.json();
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const currentYear = new Date().getFullYear();

    if (!geminiKey) {
      const fallback = buildFallback(body, currentYear);
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(body);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const fallback = buildFallback(body, currentYear);
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiRes.json();
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const fallback = buildFallback(body, currentYear);
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed: PredictResponse = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
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
