/**
 * ============================================================
 * TRIKAL VAANI — Claude Polish Layer
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/claude-polish.ts
 * VERSION: 2.2 — Added polishMilanNarrative for Kundali Milan
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v2.2 (additive — predictions flow untouched):
 *   ✅ NEW: polishMilanNarrative() for Milan flowing-prose narratives
 *   ✅ NEW: Uses Claude Sonnet 4.6 (claude-sonnet-4-5-20250929) for premium Milan polish
 *   ✅ NEW: Preserves Milan's built-in suspense + Maa Shakti dual hooks (no injection)
 *   ✅ NEW: Accepts plain text in, returns plain text out (NOT JSON)
 *   ✅ UNCHANGED: polishPrediction(), SUSPENSE_HOOKS, all prediction polish logic
 *   ✅ UNCHANGED: Haiku 4.5 model + 90s timeout for predictions
 *
 * CHANGES v2.1:
 *   ✅ AbortSignal.timeout: 45000 → 90000ms
 *   ✅ Model: claude-haiku-4-5-20251001 (unchanged)
 *
 * DHARMA GURU PHILOSOPHY:
 *   - Speaks like a wise, compassionate senior Jyotishi
 *   - Soft, warm, never alarmist
 *   - Free  → suspense hook at end
 *   - Paid  → no hook, full clarity
 *
 * Cost per prediction polish (Haiku 4.5): ~₹0.08
 * Cost per Milan polish (Sonnet 4.6):     ~₹0.50-₹1.20 — premium feel
 * ============================================================
 */

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';

// Prediction polish model (UNCHANGED)
const CLAUDE_MODEL_PREDICTION = 'claude-haiku-4-5-20251001';

// Milan polish model (NEW — premium Sonnet 4.6)
const CLAUDE_MODEL_MILAN      = 'claude-sonnet-4-5-20250929';

const CLAUDE_URL              = 'https://api.anthropic.com/v1/messages';

// v2.1: 90s timeout for prediction polish (large responses)
const POLISH_TIMEOUT_MS       = 90000;

// v2.2: 120s for Milan polish (1500w Both tier can take longer)
const MILAN_POLISH_TIMEOUT_MS = 120000;

export interface PolishResult {
  polished:   boolean;
  prediction: Record<string, unknown>;
  polishMs?:  number;
  error?:     string;
}

// ── Suspense Hooks per Tier (UNCHANGED — prediction flow only) ───────────────

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

// ════════════════════════════════════════════════════════════════════════════
// PREDICTION POLISH (UNCHANGED FROM v2.1)
// ════════════════════════════════════════════════════════════════════════════

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
        model:      CLAUDE_MODEL_PREDICTION,
        max_tokens: tier === 'premium' ? 16000 : 8192,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userMessage }],
      }),
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
    console.log(`[Polish] OK | tier:${tier} | ms:${polishMs} | model:${CLAUDE_MODEL_PREDICTION}`);
    return { polished: true, prediction: polishedPrediction, polishMs };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Polish] Error:', msg);
    return { polished: false, prediction, error: msg };
  }
}

// ── System Prompt — Dharma Guru (UNCHANGED) ───────────────────────────────────

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

// ── User Message (UNCHANGED) ──────────────────────────────────────────────────

function buildPolishUserMessage(
  prediction: Record<string, unknown>,
  personName: string, language: string, tier: string,
): string {
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

// ── Cost Estimator (UNCHANGED) ────────────────────────────────────────────────

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

// ════════════════════════════════════════════════════════════════════════════
// MILAN POLISH — v2.2 NEW (for Kundali Milan flowing-prose narratives)
// Premium Claude Sonnet 4.6 model · plain text in → plain text out
// Preserves Gemini's built-in suspense + Maa Shakti dual hooks
// ════════════════════════════════════════════════════════════════════════════

export interface MilanPolishResult {
  polished:  boolean;
  narrative: string;
  polishMs?: number;
  error?:    string;
}

export type MilanAudience = 'couple' | 'parent' | 'both';
export type MilanTier     = 'basic_51' | 'deep_101_couple' | 'deep_101_parent' | 'both_151';

/**
 * Polish Milan narrative — plain text in, plain text out.
 * Sonnet 4.6 elevates prose to premium register WITHOUT touching:
 *   - Astrological facts (Ashtakoot score, doshas, planets, remedies)
 *   - Built-in suspense hooks (already in Gemini output)
 *   - Maa Shakti Arzi + Dhanyawad dual positioning
 *   - Karmic teaser for ₹251 upsell
 *   - Next-tier hook
 */
export async function polishMilanNarrative(params: {
  rawNarrative: string;
  audience:     MilanAudience;
  tier:         MilanTier;
}): Promise<MilanPolishResult> {

  const { rawNarrative, audience, tier } = params;

  if (!CLAUDE_API_KEY) {
    console.warn('[MilanPolish] No ANTHROPIC_API_KEY — returning raw');
    return { polished: false, narrative: rawNarrative };
  }

  if (!rawNarrative || rawNarrative.trim().length < 200) {
    console.warn('[MilanPolish] Raw narrative too short — skipping polish');
    return { polished: false, narrative: rawNarrative, error: 'Input too short' };
  }

  const startMs = Date.now();

  try {
    const systemPrompt = buildMilanPolishSystemPrompt(audience, tier);
    const userMessage  = buildMilanPolishUserMessage(rawNarrative, audience, tier);

    // Token budget by tier (CEO LOCKED)
    const maxTokens =
      tier === 'both_151'  ? 14000 :   // ~1500w + headroom
      tier === 'basic_51'  ? 5000  :   // ~400w + headroom
                             10000;    // deep_101_* — ~1000w + headroom

    const res = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      CLAUDE_MODEL_MILAN,   // Sonnet 4.6
        max_tokens: maxTokens,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userMessage }],
      }),
      signal: AbortSignal.timeout(MILAN_POLISH_TIMEOUT_MS),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Claude API ${res.status}: ${JSON.stringify(err)}`);
    }

    const data    = await res.json();
    const rawText = data?.content
      ?.map((c: { type: string; text?: string }) => c.text ?? '')
      .join('') ?? '';

    if (!rawText || rawText.trim().length < 200) {
      throw new Error('Empty or too-short Claude response');
    }

    // Strip any stray code fences (defensive — shouldn't happen with prose)
    const cleaned = rawText
      .replace(/^```[a-z]*\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();

    const polishMs = Date.now() - startMs;
    console.log(`[MilanPolish] OK | tier:${tier} | audience:${audience} | ms:${polishMs} | model:${CLAUDE_MODEL_MILAN}`);
    return { polished: true, narrative: cleaned, polishMs };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[MilanPolish] Error:', msg);
    // Graceful fallback — return raw Gemini text so user reading is never blocked
    return { polished: false, narrative: rawNarrative, error: msg };
  }
}

// ── Milan polish — Dharma Guru system prompt ─────────────────────────────────

function buildMilanPolishSystemPrompt(audience: MilanAudience, tier: MilanTier): string {
  const isParent  = audience === 'parent';
  const isBoth    = audience === 'both';
  const isHindi   = isParent;        // Parent narrative is Shudh Hindi
  const isHinglish = !isParent;      // Couple narrative is Hinglish

  const languageGuide = isBoth
    ? `Part A (Couple Version) is in HINGLISH. Part B (Parent Version) is in SHUDH HINDI.
You MUST preserve both languages exactly. Do NOT translate. Do NOT mix.
The marker lines "═══ COUPLE VERSION ═══" and "═══ PARENT VERSION ═══" MUST stay intact.`
    : isHindi
      ? `Language is SHUDH HINDI (शुद्ध हिन्दी, संस्कृतनिष्ठ, परम्परागत).
Do NOT add English words. Do NOT modernize. Keep classical Vedic register.`
      : `Language is HINGLISH (Hindi + English mix, modern Indian couple register).
Examples of correct register: "Bhakoot Dosha aapke rishtedari mein hai — yeh financial stress laata hai."
Do NOT shift to pure Hindi or pure English.`;

  return `You are the language polishing specialist for Trikal Vaani — India's most authoritative Vedic astrology platform by Rohiit Gupta, Chief Vedic Architect.

You are polishing a KUNDALI MILAN narrative (marriage compatibility reading) for a paying client.

AUDIENCE: ${audience.toUpperCase()} | TIER: ${tier.toUpperCase()}

═══════════════════════════════════════════════════════════════
LANGUAGE
═══════════════════════════════════════════════════════════════

${languageGuide}

═══════════════════════════════════════════════════════════════
DHARMA GURU TONE
═══════════════════════════════════════════════════════════════

You speak like a wise, senior Jyotishi who has read thousands of marriage kundalis.
Voice: warm, compassionate, grounded, classical — never alarmist, never clinical.
Rhythm: Short sentence. Pause. Revelation. Short sentence. Pause.
Direct address: "aap", "aap dono", "${isParent ? 'आदरणीय माता-पिता' : 'ji'}".

✅ Right: "Nadi Dosha gambhir hai — lekin Trikal ke remedies se yeh neutralize ho jaata hai."
❌ Wrong: "There is a Nadi Dosha which may cause health complications."

✅ Right (Hindi): "नाड़ी दोष विद्यमान है — परन्तु शास्त्रोक्त उपायों से इसका निवारण सम्भव है।"
❌ Wrong (Hindi): "नाड़ी दोष से स्वास्थ्य पर असर पड़ता है।"

Never use: "will definitely", "guaranteed", "100%", "मैं वादा करता हूँ"
Always use: "Vedic shastra ka vachan hai", "Maa ki kripa se", "sambhavana prabal hai", "वैदिक शास्त्र का वचन है"

═══════════════════════════════════════════════════════════════
WHAT TO POLISH (your job)
═══════════════════════════════════════════════════════════════

✅ Smooth awkward transitions between paragraphs
✅ Elevate vocabulary where prose feels mechanical
✅ Improve rhythm — vary sentence length naturally
✅ Strengthen emotional resonance in the suspense + Maa Shakti sections
✅ Polish flow without changing meaning
✅ Make the prose feel like a wise elder is speaking, not an AI

═══════════════════════════════════════════════════════════════
ABSOLUTE PRESERVATION RULES (DO NOT CHANGE THESE)
═══════════════════════════════════════════════════════════════

✗ Do NOT change the Ashtakoot score number (e.g. "${tier} score 24/36" stays exact)
✗ Do NOT change planet names, house numbers, Rashi/Nakshatra names
✗ Do NOT change Sanskrit dosha names (Manglik, Bhakoot, Nadi, Gana, Yoni, Varna, Vashya, Tara, Graha Maitri)
✗ Do NOT change the 10 remedies content — keep all 4 Parashar + 4 Bhrigu + 2 Shadbala references
✗ Do NOT remove the Maa Shakti Arzi paragraph (pre-marriage)
✗ Do NOT remove the Maa Shakti Dhanyawad paragraph (post-marriage return)
✗ Do NOT remove the Karmic Background Reading teaser (future ₹251 upsell)
✗ Do NOT remove the next-tier hook${tier === 'both_151' ? ' (but both_151 has no next-tier hook to remove — top tier)' : ''}
✗ Do NOT add disclaimers ("consult a doctor", "for entertainment only")
✗ Do NOT add markdown — no "*", "#", "-", no bullets, no headers
✗ Do NOT add code fences
✗ Do NOT add any preamble or meta-commentary ("Here is the polished narrative:")
✗ Do NOT suggest divorce, separation, or breaking the engagement
${isBoth ? '✗ Do NOT remove the marker lines "═══ COUPLE VERSION ═══" or "═══ PARENT VERSION ═══"' : ''}

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Return ONLY the polished narrative. Pure flowing prose.
No JSON. No code fences. No preamble. No "Here is..."
Start directly with the first word of the polished narrative.
End directly with the last word of the blessing line.

The polished output must be approximately the same length as the input (±10%).`;
}

// ── Milan polish — user message ──────────────────────────────────────────────

function buildMilanPolishUserMessage(
  rawNarrative: string,
  audience: MilanAudience,
  tier: MilanTier,
): string {
  return `Polish the following Kundali Milan narrative.

Audience: ${audience}
Tier: ${tier}

Preserve all facts, all doshas, all remedies, all Maa Shakti positioning, all suspense hooks, all Karmic teasers.
Elevate the prose to premium Dharma Guru register.
Return ONLY the polished prose — no preamble, no JSON, no code fences.

═══════════════════════════════════════════════════════════════
RAW NARRATIVE TO POLISH:
═══════════════════════════════════════════════════════════════

${rawNarrative}

═══════════════════════════════════════════════════════════════

Return the complete polished narrative now. Start with the first word. End with the last word.`;
}
