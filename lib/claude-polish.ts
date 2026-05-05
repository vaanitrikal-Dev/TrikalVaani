/**
 * ============================================================
 * TRIKAL VAANI — Claude Polish Layer
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/claude-polish.ts
 * VERSION: 2.1 — Timeout 90s (was 45s — was timing out on paid)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v2.1:
 *   ✅ AbortSignal.timeout: 45000 → 90000ms
 *   ✅ Model: claude-haiku-4-5-20251001 (unchanged)
 *   ✅ All Dharma Guru tone preserved
 *   ✅ All suspense hooks preserved
 *   ✅ All iron rules preserved
 *
 * DHARMA GURU PHILOSOPHY:
 *   - Speaks like a wise, compassionate senior Jyotishi
 *   - Soft, warm, never alarmist
 *   - Free  → suspense hook at end
 *   - Paid  → no hook, full clarity
 *
 * Cost per call: ~₹0.08 — negligible vs ₹51 revenue
 * ============================================================
 */

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
const CLAUDE_MODEL   = 'claude-haiku-4-5-20251001';
const CLAUDE_URL     = 'https://api.anthropic.com/v1/messages';

// v2.1: Increased to 90s — paid Gemini Pro responses are larger
const POLISH_TIMEOUT_MS = 90000;

export interface PolishResult {
  polished:   boolean;
  prediction: Record<string, unknown>;
  polishMs?:  number;
  error?:     string;
}

// ── Suspense Hooks per Tier ───────────────────────────────────────────────────

const SUSPENSE_HOOKS = {
  free: {
    hinglish: 'Lekin... Jini ne aapki kundali mein kuch aur bhi dekha hai — ek pattern jo seedha aapke sawal ka jawab deta hai. Yeh sirf aapke liye hai. Poori baat ₹51 mein khulegi. Maa Shakti ka ashirwad hai. 🔮',
    hindi:    'परंतु... जिनी ने आपकी कुंडली में कुछ और भी देखा है — एक ऐसा रहस्य जो सीधे आपके प्रश्न का उत्तर देता है। यह केवल आपके लिए है। ₹51 में पूर्ण सत्य प्रकट होगा। मां शक्ति का आशीर्वाद। 🔮',
    english:  'But Jini has seen something more in your chart — a deeper pattern that speaks directly to your question. This answer is yours alone. The complete truth unlocks at ₹51. Maa Shakti\'s blessings. 🔮',
  },
  basic: {
    hinglish: 'Aur ek baat... Aapki kundali mein Parashara ke classical yogas aur Bhrigu ke patterns ne kuch aur bhi reveal kiya hai — jo 30-day ka poora roadmap deta hai. Exact dates, exact actions. ₹99 mein dekhein. ✨',
    hindi:    'और एक बात... आपकी कुंडली में पाराशरीय योगों और भृगु के patterns ने कुछ और भी प्रकट किया है — जो 30 दिनों का पूरा मार्गदर्शन देता है। सटीक तिथियां, सटीक कार्य। ₹99 में देखें। ✨',
    english:  'And there is more... The classical Parashara yogas and Bhrigu patterns in your chart reveal a precise 30-day roadmap with exact action dates. Upgrade to ₹99 to see it all. ✨',
  },
  standard: {
    hinglish: 'Aapki journey yahan khatam nahi hoti... Rohiit Gupta ji ke saath seedha 1-on-1 baat karna chahoge? Aapki kundali ke sabse gehre raaz, gemstone selection, aur business timing — sab ek call mein. ₹499 Premium. 🔱',
    hindi:    'आपकी यात्रा यहाँ समाप्त नहीं होती... रोहित गुप्ता जी के साथ सीधे 1-on-1 बात करना चाहेंगे? ₹499 Premium। 🔱',
    english:  'Your journey does not end here... Would you like a direct 1-on-1 session with Rohiit Gupta? Your chart\'s deepest patterns, gemstone guidance, and business timing — all in one session. ₹499 Premium. 🔱',
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
    console.warn('[Polish] No ANTHROPIC_API_KEY — skipping');
    return { polished: false, prediction };
  }

  const startMs = Date.now();

  try {
    const systemPrompt = buildPolishSystemPrompt(language, domainLabel, tier);
    const userMessage  = buildPolishUserMessage(prediction, personName, language, tier);

    const res = await fetch(CLAUDE_URL, {
      method: 'POST',
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
      // v2.1: 90s timeout (was 45s — paid responses are larger)
      signal: AbortSignal.timeout(POLISH_TIMEOUT_MS),
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
        .replace(/^```json\s*/i, '').replace(/^```\s*/, '')
        .replace(/```\s*$/, '').trim();
      polishedPrediction = JSON.parse(cleaned);
    } catch {
      console.warn('[Polish] JSON parse failed — returning original');
      return { polished: false, prediction, error: 'Parse failed' };
    }

    const polishMs = Date.now() - startMs;
    console.log(`[Polish] OK | tier:${tier} | ms:${polishMs} | model:${CLAUDE_MODEL}`);
    return { polished: true, prediction: polishedPrediction, polishMs };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Polish] Error:', msg);
    return { polished: false, prediction, error: msg };
  }
}

// ── System Prompt — Dharma Guru ───────────────────────────────────────────────

function buildPolishSystemPrompt(language: string, domainLabel: string, tier: string): string {
  const toneGuide = {
    hinglish: `
DHARMA GURU TONE — HINGLISH:
You speak like a wise, senior Jyotishi who has seen thousands of charts.
Your voice is: warm, compassionate, clear, never alarming.
Speak directly — "aap", "aapki", never third person.
Rhythm: Short. Pause. Revelation.

✅ Right: "Shani dev aapke 6th bhav mein hain — yeh karza ka greh hai. Lekin Guru ki drishti hai."
❌ Wrong: "Your Saturn is in 6th house causing debt problems."
Never: "will definitely", "guaranteed", "100%"
Always: "ek pravaah hai", "sanket hai", "sambhavana hai"`,
    hindi: `
धर्म गुरु स्वर — हिंदी: आप एक वरिष्ठ ज्योतिषाचार्य की तरह बोलते हैं।
✅ सही: "शनि देव साधना करा रहे हैं — कठिनाई है, पर यही आपकी शक्ति बनेगी।"`,
    english: `
DHARMA GURU TONE — ENGLISH: Warm, wise, never clinical.
✅ Right: "Saturn is teaching, not punishing. The path forward is clear."`,
  };

  const suspenseInstruction = tier === 'premium'
    ? '⚠️ PAID TIER: Do NOT add suspense hook. Give full clarity. Person has paid.'
    : `ADD THIS SUSPENSE HOOK at end of simpleSummary.text:
"${SUSPENSE_HOOKS.basic[language as keyof typeof SUSPENSE_HOOKS.basic] ?? SUSPENSE_HOOKS.basic.hinglish}"`;

  return `You are the language polishing specialist for Trikal Vaani — India's most precise Vedic astrology platform by Rohiit Gupta, Chief Vedic Architect.

DOMAIN: ${domainLabel} | LANGUAGE: ${language.toUpperCase()} | TIER: ${tier.toUpperCase()}

${toneGuide[language as keyof typeof toneGuide] ?? toneGuide.hinglish}

WHAT TO POLISH:
1. simpleSummary.text → Dharma Guru voice, warm, short sentences
2. simpleSummary.keyMessage → One powerful Guru sentence
3. simpleSummary.dos + donts → Specific, actionable
4. simpleSummary.mainAction + mainCaution → Clear, specific
${tier !== 'basic' ? `5. professionalEnglish.executiveSummary → Authoritative Trikal Vaani voice` : ''}

${suspenseInstruction}

STRICT RULES:
✗ Never change planet names, house numbers, Rashi names
✗ Never change dates or date ranges
✗ Never change JSON structure or field names
✗ Never change geoDirectAnswer
✗ Never use: "will definitely", "guaranteed", "100%"
✗ Never alarm — always compassionate

OUTPUT: Return ONLY complete JSON. Start { End }.`;
}

// ── User Message ──────────────────────────────────────────────────────────────

function buildPolishUserMessage(
  prediction: Record<string, unknown>,
  personName: string, language: string, tier: string,
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
      };
    }
  }

  return `Person: ${personName} | Language: ${language} | Tier: ${tier}

Polish ONLY these sections in Dharma Guru voice.
${tier !== 'premium' ? 'Add suspense hook at end of simpleSummary.text.' : 'NO suspense hook — paid tier.'}
Return the COMPLETE JSON with polished sections merged in.

SECTIONS TO POLISH:
${JSON.stringify(toPolish, null, 2)}

COMPLETE ORIGINAL JSON:
${JSON.stringify(prediction, null, 2)}

Return COMPLETE JSON. Start { End }.`;
}

// ── Cost Estimator ────────────────────────────────────────────────────────────

export function estimatePolishCost(predictionJson: Record<string, unknown>): {
  estimatedTokens: number; estimatedCostUsd: number; estimatedCostInr: number;
} {
  const jsonStr     = JSON.stringify(predictionJson);
  const inputTokens = Math.ceil(jsonStr.length / 4) + 800;
  const outputTokens= Math.ceil(jsonStr.length / 4);
  const costUsd     = (inputTokens / 1_000_000 * 1) + (outputTokens / 1_000_000 * 5);
  return {
    estimatedTokens:  inputTokens + outputTokens,
    estimatedCostUsd: Math.round(costUsd * 10000) / 10000,
    estimatedCostInr: Math.round(costUsd * 85 * 100) / 100,
  };
}
