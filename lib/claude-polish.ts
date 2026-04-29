/**
 * ============================================================
 * TRIKAL VAANI — Claude Haiku Polish Layer
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/claude-polish.ts
 * VERSION: 2.0 — Dharma Guru tone + suspense endings + activated from ₹51
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * DHARMA GURU PHILOSOPHY:
 *   - Speaks like a wise, compassionate senior Jyotishi
 *   - Soft, warm, never alarmist
 *   - Ends every tier with a suspense hook pulling to next tier
 *   - Free  → "Ek aur raaz hai jo sirf aapke liye hai..."
 *   - ₹51   → "Aapki kundali mein ek aur gehri baat chhipi hai..."
 *   - ₹99   → "Rohiit Gupta ji ke saath seedha baat karna chahoge?"
 *
 * ACTIVATED FROM ₹51 (was ₹99+ only)
 * Cost per call: ~₹0.08 — negligible vs ₹51 revenue
 * ============================================================
 */

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
const CLAUDE_MODEL   = 'claude-haiku-4-5-20251001';
const CLAUDE_URL     = 'https://api.anthropic.com/v1/messages';

export interface PolishResult {
  polished:   boolean;
  prediction: Record<string, unknown>;
  polishMs?:  number;
  error?:     string;
}

// ── Suspense Hooks per Tier ───────────────────────────────────────────────────

const SUSPENSE_HOOKS = {
  free: {
    hinglish: 'Lekin... aapki kundali mein ek aur raaz chhipa hai jo sirf aapke liye likha gaya hai. Kya aap jaanna chahenge? Jini ne dekha hai — par yeh akele aapka hai. ₹51 mein poora raaz khulega. 🔮',
    hindi:    'परंतु... आपकी कुंडली में एक और रहस्य छिपा है जो केवल आपके लिए है। क्या आप जानना चाहेंगे? जिनी ने देखा है — पर यह केवल आपका है। ₹51 में पूरा रहस्य खुलेगा। 🔮',
    english:  'But there is more... Your chart holds a deeper pattern that speaks directly to your situation. Jini has seen it — and it is yours alone. Unlock the full reading for ₹51. 🔮',
  },
  basic: {
    hinglish: 'Aur ek baat... Aapki kundali mein Parashara ke classical yogas aur Bhrigu ke patterns ne kuch aur bhi reveal kiya hai — jo 30-day ka poora roadmap deta hai. Exact dates, exact actions. ₹99 mein dekhein. ✨',
    hindi:    'और एक बात... आपकी कुंडली में पाराशरीय योगों और भृगु के patterns ने कुछ और भी प्रकट किया है — जो 30 दिनों का पूरा मार्गदर्शन देता है। सटीक तिथियां, सटीक कार्य। ₹99 में देखें। ✨',
    english:  'And there is more... The classical Parashara yogas and Bhrigu patterns in your chart reveal a precise 30-day roadmap with exact action dates. Upgrade to ₹99 to see it all. ✨',
  },
  standard: {
    hinglish: 'Aapki journey yahan khatam nahi hoti... Rohiit Gupta ji ke saath seedha 1-on-1 baat karna chahoge? Aapki kundali ke sabse gehre raaz, gemstone selection, aur business timing — sab ek call mein. ₹499 Premium. 🔱',
    hindi:    'आपकी यात्रा यहाँ समाप्त नहीं होती... रोहित गुप्ता जी के साथ सीधे 1-on-1 बात करना चाहेंगे? आपकी कुंडली के सबसे गहरे रहस्य, रत्न चयन, और व्यापार मुहूर्त — सब एक call में। ₹499 Premium। 🔱',
    english:  'Your journey does not end here... Would you like a direct 1-on-1 session with Rohiit Gupta, Chief Vedic Architect? Your chart\'s deepest patterns, gemstone guidance, and business timing — all in one session. ₹499 Premium. 🔱',
  },
};

// ── Main Polish Function ──────────────────────────────────────────────────────

export async function polishPrediction(
  prediction:  Record<string, unknown>,
  language:    'hindi' | 'hinglish' | 'english',
  personName:  string,
  domainLabel: string,
  tier:        'basic' | 'standard' | 'premium',
): Promise<PolishResult> {

  if (!CLAUDE_API_KEY) {
    console.warn('[Polish] No ANTHROPIC_API_KEY — skipping polish');
    return { polished: false, prediction };
  }

  const startMs = Date.now();

  try {
    const systemPrompt = buildPolishSystemPrompt(language, domainLabel, tier);
    const userMessage  = buildPolishUserMessage(prediction, personName, language, tier);

    const res = await fetch(CLAUDE_URL, {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      CLAUDE_MODEL,
        max_tokens: tier === 'premium' ? 16000 : 8192,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userMessage }],
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Claude API ${res.status}: ${JSON.stringify(err)}`);
    }

    const data    = await res.json();
    const rawText = data?.content
      ?.map((c: { type: string; text?: string }) => c.text ?? '')
      .join('') ?? '';

    if (!rawText) throw new Error('Empty Claude response');

    let polishedPrediction: Record<string, unknown>;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim();
      polishedPrediction = JSON.parse(cleaned);
    } catch {
      console.warn('[Polish] JSON parse failed — returning original');
      return { polished: false, prediction, error: 'Parse failed' };
    }

    const polishMs = Date.now() - startMs;
    console.log(`[Polish] OK — tier:${tier} ms:${polishMs} model:${CLAUDE_MODEL}`);

    return { polished: true, prediction: polishedPrediction, polishMs };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Polish] Error:', msg);
    return { polished: false, prediction, error: msg };
  }
}

// ── System Prompt — Dharma Guru ───────────────────────────────────────────────

function buildPolishSystemPrompt(
  language:   string,
  domainLabel: string,
  tier:       string,
): string {

  const toneGuide = {
    hinglish: `
DHARMA GURU TONE — HINGLISH:
You speak like a wise, senior Jyotishi who has seen thousands of charts.
Your voice is: warm, compassionate, clear, never alarming.
You speak directly to the person — "aap", "aapki", never third person.
Sentence rhythm: Short. Pause. Revelation. Like a Guru speaking after meditation.

STYLE EXAMPLES:
❌ Wrong: "Your Saturn is in 6th house causing debt problems."
✅ Right: "Shani dev aapke 6th bhav mein hain — yeh karza ka greh hai. Lekin Guru ki drishti hai. Mushkil hai, par raasta hai."

❌ Wrong: "You should do remedies."
✅ Right: "Ek chhota sa upay — sirf shanivar ko — aapki dishaa badal sakta hai."

Never use: "will definitely", "guaranteed", "100%"
Always use: "ek pravaah hai", "sanket hai", "sambhavana hai"`,

    hindi: `
धर्म गुरु स्वर — हिंदी:
आप एक वरिष्ठ ज्योतिषाचार्य की तरह बोलते हैं — शांत, करुणामय, स्पष्ट।
हर वाक्य में गहराई हो, भय न हो।
सीधे व्यक्ति से बात करें — "आप", "आपकी"।

उदाहरण:
❌ गलत: "शनि से समस्याएं होंगी।"
✅ सही: "शनि देव साधना करा रहे हैं — कठिनाई है, पर यही आपकी शक्ति बनेगी।"`,

    english: `
DHARMA GURU TONE — ENGLISH:
Speak like a wise, compassionate astrologer — warm, direct, never alarming.
Use present tense: "Your chart shows..." not "You will..."
Short sentences. Gentle revelations. Never clinical or cold.

Examples:
❌ Wrong: "Saturn is causing problems."
✅ Right: "Saturn is teaching, not punishing. The path forward is clear."`,
  };

  return `You are the language polishing specialist for Trikal Vaani — India's most precise Vedic astrology platform by Rohiit Gupta, Chief Vedic Architect.

DOMAIN: ${domainLabel}
LANGUAGE: ${language.toUpperCase()}
TIER: ${tier.toUpperCase()}

${toneGuide[language as keyof typeof toneGuide] ?? toneGuide.hinglish}

════════════════════════════════════════════════════════════
WHAT TO POLISH:
════════════════════════════════════════════════════════════

1. simpleSummary.text
   → Rewrite in Dharma Guru voice
   → More personal, warm, direct
   → Short sentences — like spoken wisdom
   → End with the SUSPENSE HOOK for this tier (see below)

2. simpleSummary.keyMessage
   → One powerful sentence — like a Guru's final word
   → Should feel like a blessing, not a diagnosis

3. simpleSummary.dos and donts
   → Each point specific and actionable
   → dos: empowering ("Karo — kyunki...")
   → donts: gentle warning ("Abhi nahi — kyunki...")

4. simpleSummary.mainAction + mainCaution
   → Clear, specific, timing-based

${tier !== 'basic' ? `5. professionalEnglish.executiveSummary
   → More authoritative, warm, Trikal Vaani voice
   → Less clinical, more personal

6. professionalEnglish.remedyPlan.remedies[].dos/donts
   → More specific, classical feel` : ''}

${language !== 'english' && tier === 'standard' ? `7. professionalHindi key sections
   → Purer देवनागरी, better flow` : ''}

════════════════════════════════════════════════════════════
SUSPENSE HOOK — ADD TO END OF simpleSummary.text:
════════════════════════════════════════════════════════════
${tier === 'basic' ? SUSPENSE_HOOKS.basic[language as keyof typeof SUSPENSE_HOOKS.basic] ?? SUSPENSE_HOOKS.basic.hinglish :
  tier === 'standard' ? SUSPENSE_HOOKS.standard[language as keyof typeof SUSPENSE_HOOKS.standard] ?? SUSPENSE_HOOKS.standard.hinglish :
  SUSPENSE_HOOKS.standard[language as keyof typeof SUSPENSE_HOOKS.standard] ?? SUSPENSE_HOOKS.standard.hinglish}

Add this as a new paragraph at the very END of simpleSummary.text.

════════════════════════════════════════════════════════════
STRICT RULES — NEVER CHANGE:
════════════════════════════════════════════════════════════
✗ Never change planet names, house numbers, Rashi names
✗ Never change dates or date ranges
✗ Never change classicalBasis citations
✗ Never change JSON structure or field names
✗ Never change geoDirectAnswer
✗ Never change locked/teaser fields
✗ Never add new content beyond suspense hook
✗ Never change confidence levels, yoga names
✗ Numbers (strength scores, counts) remain identical
✗ Never use: "will definitely", "guaranteed", "100% sure"
✗ Never alarm the person — always compassionate

OUTPUT: Return ONLY the complete polished JSON.
Must start with { and end with }.
Must pass JSON.parse() without modification.`;
}

// ── User Message ──────────────────────────────────────────────────────────────

function buildPolishUserMessage(
  prediction: Record<string, unknown>,
  personName: string,
  language:   string,
  tier:       string,
): string {

  // Send only sections needing polish — saves tokens
  const toPolish: Record<string, unknown> = {
    simpleSummary: prediction.simpleSummary,
  };

  if (prediction.professionalEnglish && typeof prediction.professionalEnglish === 'object') {
    const eng = prediction.professionalEnglish as Record<string, unknown>;
    if (!eng.locked) {
      toPolish.professionalEnglish = {
        executiveSummary: eng.executiveSummary,
        periodSummary:    eng.periodSummary,
        remedyPlan:       eng.remedyPlan,
        bhriguInsights:   eng.bhriguInsights,
        seoSignals:       eng.seoSignals,
      };
    }
  }

  if (language !== 'english' && prediction.professionalHindi && typeof prediction.professionalHindi === 'object') {
    const hin = prediction.professionalHindi as Record<string, unknown>;
    if (!hin.locked) {
      toPolish.professionalHindi = {
        karyakariSarvekshan: hin.karyakariSarvekshan,
        sheershak:           hin.sheershak,
        upayYojana:          hin.upayYojana,
      };
    }
  }

  return `Person: ${personName} | Language: ${language} | Tier: ${tier}

Polish ONLY these sections in Dharma Guru voice.
Add suspense hook at end of simpleSummary.text as instructed.
Merge polished sections back into the complete JSON.

SECTIONS TO POLISH:
${JSON.stringify(toPolish, null, 2)}

COMPLETE ORIGINAL JSON (return this with polished sections merged in):
${JSON.stringify(prediction, null, 2)}

Return the COMPLETE JSON with polished language. Start { End }.`;
}

// ── Cost Estimator ────────────────────────────────────────────────────────────

export function estimatePolishCost(predictionJson: Record<string, unknown>): {
  estimatedTokens:  number;
  estimatedCostUsd: number;
  estimatedCostInr: number;
} {
  const jsonStr      = JSON.stringify(predictionJson);
  const inputTokens  = Math.ceil(jsonStr.length / 4) + 800;
  const outputTokens = Math.ceil(jsonStr.length / 4);
  const costUsd      = (inputTokens / 1_000_000 * 1) + (outputTokens / 1_000_000 * 5);
  const costInr      = costUsd * 85;
  return {
    estimatedTokens:  inputTokens + outputTokens,
    estimatedCostUsd: Math.round(costUsd * 10000) / 10000,
    estimatedCostInr: Math.round(costInr * 100) / 100,
  };
}
