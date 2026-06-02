/**
 * ============================================================
 * TRIKAL VAANI — Claude Polish Layer
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/claude-polish.ts
 * VERSION: 2.5 — Adds Child Birth Muhurat report polish (language-aware)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v2.5 (additive — predictions + Milan + Karmic flows 100% untouched):
 *   NEW: polishMuhuratNarrative() for Child Birth Muhurat paid report (Rs101/151).
 *        Sonnet 4.6, language-aware (hinglish|hindi|english). Hopeful, blessing,
 *        parents-facing tone. Preserves dimension markers + MAA SHAKTI marker.
 *        Medical-safety: never overrides doctor; muhurat is WITHIN doctor window.
 *   UNCHANGED: polishPrediction(), polishMilanNarrative(), polishKarmicNarrative(),
 *        all models, timeouts, token budgets, SUSPENSE_HOOKS, cost estimator.
 *
 * CHANGES v2.4: polishKarmicNarrative() (Karmic Rs251, patterns-not-verdicts).
 * CHANGES v2.3: polishMilanNarrative() takes explicit `language` param.
 * CHANGES v2.2: polishMilanNarrative() added (Sonnet 4.6).
 * CHANGES v2.1: prediction polish timeout 45000 -> 90000ms.
 * ============================================================
 */

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';

// Prediction polish model (UNCHANGED)
const CLAUDE_MODEL_PREDICTION = 'claude-haiku-4-5-20251001';

// Milan + Karmic + Muhurat polish model (Sonnet 4.6)
const CLAUDE_MODEL_MILAN      = 'claude-sonnet-4-5-20250929';
const CLAUDE_MODEL_KARMIC     = 'claude-sonnet-4-5-20250929';
const CLAUDE_MODEL_MUHURAT    = 'claude-sonnet-4-5-20250929';

const CLAUDE_URL              = 'https://api.anthropic.com/v1/messages';

const POLISH_TIMEOUT_MS         = 90000;
const MILAN_POLISH_TIMEOUT_MS   = 120000;
const KARMIC_POLISH_TIMEOUT_MS  = 120000;
const MUHURAT_POLISH_TIMEOUT_MS = 120000;

export interface PolishResult {
  polished:   boolean;
  prediction: Record<string, unknown>;
  polishMs?:  number;
  error?:     string;
}

// -- Suspense Hooks per Tier (UNCHANGED - prediction flow only) ---------------

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

// ============================================================================
// PREDICTION POLISH (UNCHANGED FROM v2.1)
// ============================================================================

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

// -- System Prompt - Dharma Guru (UNCHANGED) ---------------------------------

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

  return `You are the language polishing specialist for Trikaal Vaani — India's most precise Vedic astrology platform by Rohiit Gupta, Chief Vedic Architect.

DOMAIN: ${domainLabel} | LANGUAGE: ${language.toUpperCase()} | TIER: ${tier.toUpperCase()}

${toneGuide[language as keyof typeof toneGuide] ?? toneGuide.hinglish}

WHAT TO POLISH:
1. simpleSummary.text → Dharma Guru voice, warm, short sentences
2. simpleSummary.keyMessage → One powerful Guru sentence
3. simpleSummary.dos + donts → Specific, actionable
4. simpleSummary.mainAction + mainCaution → Clear, specific
${tier !== 'basic' ? `5. professionalEnglish.executiveSummary → Authoritative Trikaal Vaani voice` : ''}

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

// -- User Message (UNCHANGED) ------------------------------------------------

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

// -- Cost Estimator (UNCHANGED) ----------------------------------------------

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

// ============================================================================
// MILAN POLISH — v2.3 (LANGUAGE-AWARE)  [UNCHANGED IN v2.4 / v2.5]
// ============================================================================

export interface MilanPolishResult {
  polished:  boolean;
  narrative: string;
  polishMs?: number;
  error?:    string;
}

export type MilanAudience = 'couple' | 'parent' | 'both';
export type MilanTier     = 'basic_51' | 'deep_101_couple' | 'deep_101_parent' | 'both_151';
export type MilanLanguage = 'hinglish' | 'hindi' | 'english';

export async function polishMilanNarrative(params: {
  rawNarrative: string;
  audience:     MilanAudience;
  tier:         MilanTier;
  language?:    MilanLanguage;
}): Promise<MilanPolishResult> {

  const { rawNarrative, audience, tier, language = 'hinglish' } = params;

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
    const systemPrompt = buildMilanPolishSystemPrompt(audience, tier, language);
    const userMessage  = buildMilanPolishUserMessage(rawNarrative, audience, tier, language);

    const maxTokens =
      tier === 'both_151'  ? 14000 :
      tier === 'basic_51'  ? 5000  :
                             10000;

    const res = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      CLAUDE_MODEL_MILAN,
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

    const cleaned = rawText
      .replace(/^```[a-z]*\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();

    const polishMs = Date.now() - startMs;
    console.log(`[MilanPolish] OK | tier:${tier} | audience:${audience} | lang:${language} | ms:${polishMs} | model:${CLAUDE_MODEL_MILAN}`);
    return { polished: true, narrative: cleaned, polishMs };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[MilanPolish] Error:', msg);
    return { polished: false, narrative: rawNarrative, error: msg };
  }
}

function buildMilanPolishSystemPrompt(
  audience: MilanAudience,
  tier: MilanTier,
  language: MilanLanguage,
): string {
  const isParent = audience === 'parent';
  const isBoth   = audience === 'both';

  const LANG_GUIDE: Record<MilanLanguage, string> = {
    hinglish: `The narrative is written in HINGLISH (natural Hindi + English mix, modern Indian register).
PRESERVE HINGLISH EXACTLY. Do NOT shift to pure Hindi or pure English. Do NOT translate.
Correct register example: "Bhakoot Dosha aapke rishtedari mein hai — yeh financial stress laata hai."`,
    hindi: `The narrative is written in SHUDH HINDI (शुद्ध हिन्दी, संस्कृतनिष्ठ, परम्परागत).
PRESERVE SHUDH HINDI EXACTLY. Do NOT add English words. Do NOT modernize. Do NOT translate.
Correct register example: "नाड़ी दोष विद्यमान है — परन्तु शास्त्रोक्त उपायों से इसका निवारण सम्भव है।"`,
    english: `The narrative is written in ENGLISH (clear, dignified, for clients comfortable in English).
PRESERVE ENGLISH EXACTLY. Do NOT shift to Hindi or Hinglish. Do NOT translate.
Keep Sanskrit/Vedic technical terms (Ashtakoot, Bhakoot, Nadi, Manglik, Shadbala, Gana, Yoni, etc.) untranslated.
Correct register example: "There is a Bhakoot Dosha in this match — it brings financial strain unless remedied."`,
  };

  const languageGuide = isBoth
    ? `${LANG_GUIDE[language]}

IMPORTANT: This is a BOTH VERSIONS reading. It contains two sections separated by marker lines.
BOTH sections — Couple and Parent — are in the SAME language (${language.toUpperCase()}).
The marker lines "═══ COUPLE VERSION ═══" and "═══ PARENT VERSION ═══" MUST stay intact, exactly.
Do NOT translate either section. Keep both in ${language.toUpperCase()}.`
    : LANG_GUIDE[language];

  const toneExamples =
    language === 'hindi'
      ? `✅ सही: "नाड़ी दोष गम्भीर है — परन्तु त्रिकाल के उपायों से इसका निवारण सम्भव है।"
❌ ग़लत: "नाड़ी दोष से स्वास्थ्य पर असर पड़ता है।" (clinical, flat)`
      : language === 'english'
      ? `✅ Right: "The Nadi Dosha is serious — yet Trikaal's remedies can neutralise it."
❌ Wrong: "There is a Nadi Dosha which may cause health complications." (clinical, flat)`
      : `✅ Right: "Nadi Dosha gambhir hai — lekin Trikaal ke remedies se yeh neutralize ho jaata hai."
❌ Wrong: "There is a Nadi Dosha which may cause health complications." (clinical, flat)`;

  const neverAlways =
    language === 'hindi'
      ? `Never: "मैं वादा करता हूँ", "100%", "गारंटी". Always: "वैदिक शास्त्र का वचन है", "माँ की कृपा से", "सम्भावना प्रबल है".`
      : language === 'english'
      ? `Never: "I promise", "100%", "guaranteed". Always: "the word of Vedic shastra", "by the grace of Maa", "the likelihood is strong".`
      : `Never: "main vaada karta hoon", "100%", "guaranteed". Always: "Vedic shastra ka vachan hai", "Maa ki kripa se", "sambhavana prabal hai".`;

  return `You are the language polishing specialist for Trikaal Vaani — India's most authoritative Vedic astrology platform by Rohiit Gupta, Chief Vedic Architect.

You are polishing a KUNDALI MILAN narrative (marriage compatibility reading) for a paying client.

AUDIENCE: ${audience.toUpperCase()} | TIER: ${tier.toUpperCase()} | LANGUAGE: ${language.toUpperCase()}

═══════════════════════════════════════════════════════════════
LANGUAGE LOCK (HIGHEST PRIORITY)
═══════════════════════════════════════════════════════════════

${languageGuide}

If you are ever unsure, KEEP THE ORIGINAL LANGUAGE OF THE INPUT. Never translate.

═══════════════════════════════════════════════════════════════
DHARMA GURU TONE
═══════════════════════════════════════════════════════════════

You speak like a wise, senior Jyotishi who has read thousands of marriage kundalis.
Voice: warm, compassionate, grounded, classical — never alarmist, never clinical.
Rhythm: Short sentence. Pause. Revelation. Short sentence. Pause.
Direct address: "aap", "aap dono", "${isParent ? 'आदरणीय माता-पिता' : 'ji'}".

${toneExamples}

${neverAlways}

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

✗ Do NOT change the LANGUAGE. Output language = input language = ${language.toUpperCase()}.
✗ Do NOT change the Ashtakoot score number (it stays exact)
✗ Do NOT change planet names, house numbers, Rashi/Nakshatra names
✗ Do NOT change Sanskrit dosha names (Manglik, Bhakoot, Nadi, Gana, Yoni, Varna, Vashya, Tara, Graha Maitri)
✗ Do NOT change the 10 remedies content — keep all 4 Parashar + 4 Bhrigu + 2 Shadbala references
✗ Do NOT remove the Maa Shakti Arzi paragraph (pre-marriage)
✗ Do NOT remove the Maa Shakti Dhanyawad paragraph (post-marriage return)
✗ Do NOT remove the Karmic Background Reading teaser (future ₹251 upsell)
✗ Do NOT remove the next-tier hook${tier === 'both_151' ? ' (both_151 has no next-tier hook — top tier)' : ''}
✗ Do NOT add disclaimers ("consult a doctor", "for entertainment only")
✗ Do NOT add markdown — no "*", "#", "-", no bullets, no headers
✗ Do NOT add code fences
✗ Do NOT add any preamble or meta-commentary ("Here is the polished narrative:")
✗ Do NOT suggest divorce, separation, or breaking the engagement
${isBoth ? '✗ Do NOT remove the marker lines "═══ COUPLE VERSION ═══" or "═══ PARENT VERSION ═══"' : ''}

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Return ONLY the polished narrative. Pure flowing prose, in ${language.toUpperCase()}.
No JSON. No code fences. No preamble. No "Here is..."
Start directly with the first word of the polished narrative.
End directly with the last word of the blessing line.

The polished output must be approximately the same length as the input (±10%).`;
}

function buildMilanPolishUserMessage(
  rawNarrative: string,
  audience: MilanAudience,
  tier: MilanTier,
  language: MilanLanguage,
): string {
  return `Polish the following Kundali Milan narrative.

Audience: ${audience}
Tier: ${tier}
Language: ${language}  ← KEEP THIS LANGUAGE EXACTLY. Do NOT translate.

Preserve all facts, all doshas, all remedies, all Maa Shakti positioning, all suspense hooks, all Karmic teasers.
Keep the narrative in ${language.toUpperCase()}.
Elevate the prose to premium Dharma Guru register.
Return ONLY the polished prose — no preamble, no JSON, no code fences.

═══════════════════════════════════════════════════════════════
RAW NARRATIVE TO POLISH:
═══════════════════════════════════════════════════════════════

${rawNarrative}

═══════════════════════════════════════════════════════════════

Return the complete polished narrative now, in ${language.toUpperCase()}. Start with the first word. End with the last word.`;
}

// ============================================================================
// KARMIC POLISH — v2.4 (Karmic Background Reading Rs251)  [UNCHANGED IN v2.5]
// Sonnet 4.6 . language-aware . preserves 6 dimension markers + MAA SHAKTI
// ENFORCES the CEO tone rule: patterns not verdicts (DPDP + defamation shield)
// ============================================================================

export interface KarmicPolishResult {
  polished:  boolean;
  narrative: string;
  polishMs?: number;
  error?:    string;
}

export type KarmicLanguage = 'hinglish' | 'hindi' | 'english';

export async function polishKarmicNarrative(params: {
  rawNarrative: string;
  language?:    KarmicLanguage;
}): Promise<KarmicPolishResult> {

  const { rawNarrative, language = 'hinglish' } = params;

  if (!CLAUDE_API_KEY) {
    console.warn('[KarmicPolish] No ANTHROPIC_API_KEY — returning raw');
    return { polished: false, narrative: rawNarrative };
  }

  if (!rawNarrative || rawNarrative.trim().length < 200) {
    console.warn('[KarmicPolish] Raw narrative too short — skipping polish');
    return { polished: false, narrative: rawNarrative, error: 'Input too short' };
  }

  const startMs = Date.now();

  try {
    const systemPrompt = buildKarmicPolishSystemPrompt(language);
    const userMessage  = buildKarmicPolishUserMessage(rawNarrative, language);

    const res = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      CLAUDE_MODEL_KARMIC,
        max_tokens: 14000,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userMessage }],
      }),
      signal: AbortSignal.timeout(KARMIC_POLISH_TIMEOUT_MS),
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

    const cleaned = rawText
      .replace(/^```[a-z]*\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();

    const polishMs = Date.now() - startMs;
    console.log(`[KarmicPolish] OK | lang:${language} | ms:${polishMs} | model:${CLAUDE_MODEL_KARMIC}`);
    return { polished: true, narrative: cleaned, polishMs };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[KarmicPolish] Error:', msg);
    return { polished: false, narrative: rawNarrative, error: msg };
  }
}

function buildKarmicPolishSystemPrompt(language: KarmicLanguage): string {
  const LANG_GUIDE: Record<KarmicLanguage, string> = {
    hinglish: `The reading is written in HINGLISH (natural Hindi + English mix, modern Indian register).
PRESERVE HINGLISH EXACTLY. Do NOT shift to pure Hindi or pure English. Do NOT translate.`,
    hindi: `The reading is written in SHUDH HINDI (शुद्ध हिन्दी, संस्कृतनिष्ठ, परम्परागत).
PRESERVE SHUDH HINDI EXACTLY. Do NOT add English words. Do NOT translate.`,
    english: `The reading is written in ENGLISH (clear, dignified).
PRESERVE ENGLISH EXACTLY. Do NOT shift to Hindi or Hinglish. Do NOT translate.
Keep Sanskrit/Vedic terms (Lagna, Navamsa, Rahu, Ketu, dasha, karaka, etc.) untranslated.`,
  };

  const toneSeal =
    language === 'hindi'
      ? `✅ सही: "कुंडली में धन के प्रति एक सतर्क झुकाव दिखता है।" ❌ ग़लत: "यह व्यक्ति कंजूस है।"`
      : language === 'english'
      ? `✅ Right: "The chart indicates a cautious tendency toward money." ❌ Wrong: "This person is stingy."`
      : `✅ Right: "Chart mein paise ke prati ek cautious jhukav dikhta hai." ❌ Wrong: "Yeh vyakti kanjoos hai."`;

  return `You are the language polishing specialist for Trikaal Vaani — India's most authoritative Vedic astrology platform by Rohiit Gupta, Chief Vedic Architect.

You are polishing a premium KARMIC BACKGROUND READING (Rs251) — a Bhrigu Nandi Nadi analysis
of ONE person's birth chart across 6 karmic dimensions, for a paying client.

LANGUAGE: ${language.toUpperCase()}

═══════════════════════════════════════════════════════════════
LANGUAGE LOCK (HIGHEST PRIORITY)
═══════════════════════════════════════════════════════════════

${LANG_GUIDE[language]}

If unsure, KEEP THE ORIGINAL LANGUAGE OF THE INPUT. Never translate.

═══════════════════════════════════════════════════════════════
CEO-LOCKED TONE RULE — NON-NEGOTIABLE (legal shield)
═══════════════════════════════════════════════════════════════

"Trikaal does not judge — Trikaal reveals patterns so you can prepare."
Findings are KARMIC PATTERNS / TENDENCIES, never verdicts about a real person.

${toneSeal}

✗ Do NOT turn any tendency into a verdict. Never "he is dishonest / she is unfaithful / greedy / disloyal".
✗ Do NOT state any real-world fact about the person as certain.
✗ Do NOT suggest rejecting, leaving, distrusting, or breaking a relationship with the person.
✗ Do NOT mention divorce, detective work, or "background check" as investigation.
✗ Keep all phrasing as: "the chart indicates a tendency...", "a karmic pattern of...", "this placement can incline one to...".
If the raw text drifts into a verdict anywhere, SOFTEN it back to a chart-based tendency while keeping the meaning.

═══════════════════════════════════════════════════════════════
DHARMA GURU TONE
═══════════════════════════════════════════════════════════════

Wise, calm, compassionate Jyotishi. Never sensational, never accusatory, never alarmist.
Rhythm: short sentence, pause, revelation. Elevate flow, vary sentence length.

═══════════════════════════════════════════════════════════════
ABSOLUTE PRESERVATION RULES (DO NOT CHANGE THESE)
═══════════════════════════════════════════════════════════════

✗ Do NOT change the LANGUAGE. Output language = input language = ${language.toUpperCase()}.
✗ Do NOT remove or rename any of the SIX dimension marker headings
  ("═══ 1. CORE PERSONALITY ═══" ... "═══ 6. MARRIAGE OUTLOOK & LONGEVITY ═══") — keep them VERBATIM.
✗ Do NOT remove the "═══ MAA SHAKTI ═══" marker, the Arzi paragraph, or the Dhanyawad paragraph.
✗ Do NOT remove any "how to work with this pattern" close — these are mandatory (legal + value).
✗ Do NOT change planet names, house numbers, Rashi/Nakshatra names, or Vedic terms.
✗ Do NOT claim "100%" / "guaranteed" / "I promise". Use "the chart indicates", "karmic tendency".
✗ Do NOT add markdown — no "*", "#", "-", no bullets. Pure flowing prose under each marker.
✗ Do NOT add disclaimers ("consult a doctor/lawyer", "for entertainment only").
✗ Do NOT add code fences, preamble, or meta-commentary ("Here is the polished reading:").

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Return ONLY the polished reading, in ${language.toUpperCase()}, with all 6 dimension markers and the
MAA SHAKTI marker intact. No JSON, no code fences, no preamble.
Approximately the same length as the input (±10%).`;
}

function buildKarmicPolishUserMessage(
  rawNarrative: string,
  language: KarmicLanguage,
): string {
  return `Polish the following Karmic Background Reading.

Language: ${language}  ← KEEP THIS LANGUAGE EXACTLY. Do NOT translate.

Preserve: all 6 dimension marker headings, the MAA SHAKTI marker, the Arzi + Dhanyawad paragraphs,
every "how to work with this pattern" close, all chart facts and Vedic terms.
Enforce the tone rule: patterns/tendencies only — never verdicts, never suggest rejecting the person.
Elevate the prose to premium Dharma Guru register.
Return ONLY the polished prose — no preamble, no JSON, no code fences.

═══════════════════════════════════════════════════════════════
RAW READING TO POLISH:
═══════════════════════════════════════════════════════════════

${rawNarrative}

═══════════════════════════════════════════════════════════════

Return the complete polished reading now, in ${language.toUpperCase()}. Start with the first word. End with the last word.`;
}

// ============================================================================
// MUHURAT POLISH — v2.5 NEW (Child Birth Muhurat paid report Rs101/151)
// Sonnet 4.6 . language-aware . hopeful, blessing, parents-facing tone
// MEDICAL-SAFETY: muhurat is WITHIN the doctor-approved window, never overrides
// ============================================================================

export interface MuhuratPolishResult {
  polished:  boolean;
  narrative: string;
  polishMs?: number;
  error?:    string;
}

export type MuhuratLanguage = 'hinglish' | 'hindi' | 'english';

export async function polishMuhuratNarrative(params: {
  rawNarrative: string;
  language?:    MuhuratLanguage;
}): Promise<MuhuratPolishResult> {

  const { rawNarrative, language = 'hinglish' } = params;

  if (!CLAUDE_API_KEY) {
    console.warn('[MuhuratPolish] No ANTHROPIC_API_KEY — returning raw');
    return { polished: false, narrative: rawNarrative };
  }

  if (!rawNarrative || rawNarrative.trim().length < 200) {
    console.warn('[MuhuratPolish] Raw narrative too short — skipping polish');
    return { polished: false, narrative: rawNarrative, error: 'Input too short' };
  }

  const startMs = Date.now();

  try {
    const systemPrompt = buildMuhuratPolishSystemPrompt(language);
    const userMessage  = buildMuhuratPolishUserMessage(rawNarrative, language);

    const res = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      CLAUDE_MODEL_MUHURAT,
        max_tokens: 14000,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userMessage }],
      }),
      signal: AbortSignal.timeout(MUHURAT_POLISH_TIMEOUT_MS),
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

    const cleaned = rawText
      .replace(/^```[a-z]*\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();

    const polishMs = Date.now() - startMs;
    console.log(`[MuhuratPolish] OK | lang:${language} | ms:${polishMs} | model:${CLAUDE_MODEL_MUHURAT}`);
    return { polished: true, narrative: cleaned, polishMs };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[MuhuratPolish] Error:', msg);
    return { polished: false, narrative: rawNarrative, error: msg };
  }
}

function buildMuhuratPolishSystemPrompt(language: MuhuratLanguage): string {
  const LANG_GUIDE: Record<MuhuratLanguage, string> = {
    hinglish: `The report is written in HINGLISH (natural Hindi + English mix, modern Indian register).
PRESERVE HINGLISH EXACTLY. Do NOT shift to pure Hindi or pure English. Do NOT translate.`,
    hindi: `The report is written in SHUDH HINDI (शुद्ध हिन्दी, संस्कृतनिष्ठ, परम्परागत).
PRESERVE SHUDH HINDI EXACTLY. Do NOT add English words. Do NOT translate.`,
    english: `The report is written in ENGLISH (clear, dignified, warm).
PRESERVE ENGLISH EXACTLY. Do NOT shift to Hindi or Hinglish. Do NOT translate.
Keep Sanskrit/Vedic terms (Lagna, Nakshatra, Tithi, Naamakshar, Rashi, etc.) untranslated.`,
  };

  const toneSeal =
    language === 'hindi'
      ? `✅ सही: "इस शुभ मुहूर्त में जन्मे शिशु की कुंडली में नेतृत्व का प्रबल योग दिखता है।" ❌ ग़लत: "यह बच्चा अमीर बनेगा।"`
      : language === 'english'
      ? `✅ Right: "A child born in this auspicious muhurat shows a strong leadership inclination in the chart." ❌ Wrong: "This child will definitely become rich."`
      : `✅ Right: "Is shubh muhurat mein janme bachche ki kundali mein leadership ka strong yog dikhta hai." ❌ Wrong: "Yeh bachcha ameer banega."`;

  return `You are the language polishing specialist for Trikaal Vaani — India's most authoritative Vedic astrology platform by Rohiit Gupta, Chief Vedic Architect.

You are polishing a premium CHILD BIRTH MUHURAT REPORT (Rs101/151) for expecting parents
who have chosen an auspicious delivery time WITHIN their doctor-approved window.
The report describes the life potential of a child born at the chosen muhurat, plus doshas to be
aware of and remedies. The tone is HOPEFUL, BLESSING, and PARENTS-FACING.

LANGUAGE: ${language.toUpperCase()}

═══════════════════════════════════════════════════════════════
LANGUAGE LOCK (HIGHEST PRIORITY)
═══════════════════════════════════════════════════════════════

${LANG_GUIDE[language]}

If unsure, KEEP THE ORIGINAL LANGUAGE OF THE INPUT. Never translate.

═══════════════════════════════════════════════════════════════
MEDICAL-SAFETY RULE — NON-NEGOTIABLE
═══════════════════════════════════════════════════════════════

✗ Do NOT override, contradict, or second-guess the doctor.
✗ Do NOT tell parents to change the delivery date or time outside medical advice.
✗ Do NOT remove any line that says the muhurat is WITHIN the doctor-approved window.
The muhurat is guidance to discuss WITH the doctor — never a medical instruction.

═══════════════════════════════════════════════════════════════
TONE RULE — TENDENCIES, NOT GUARANTEES
═══════════════════════════════════════════════════════════════

Findings are CHART INDICATIONS about a child's potential, never guarantees about a real future.

${toneSeal}

✗ Never "will definitely", "guaranteed", "100%", "this child will be rich/famous".
✓ Always "the chart indicates", "a strong inclination toward", "the potential for", "shubh yog dikhta hai".
Keep it warm and hopeful — these are joyful expecting parents, never alarm them.

═══════════════════════════════════════════════════════════════
DHARMA GURU TONE
═══════════════════════════════════════════════════════════════

Wise, warm, blessing Jyotishi speaking to expecting parents. Never clinical, never alarmist.
Rhythm: short sentence, pause, revelation. Elevate flow, vary sentence length.

═══════════════════════════════════════════════════════════════
ABSOLUTE PRESERVATION RULES (DO NOT CHANGE THESE)
═══════════════════════════════════════════════════════════════

✗ Do NOT change the LANGUAGE. Output language = input language = ${language.toUpperCase()}.
✗ Do NOT change the chosen muhurat time, Lagna, Nakshatra, Tithi, score, or Naamakshar (lucky letter).
✗ Do NOT change planet names, house numbers, Rashi/Nakshatra names, or Vedic terms.
✗ Do NOT remove or rename any section marker headings — keep them VERBATIM.
✗ Do NOT remove the "═══ MAA SHAKTI ═══" marker, the Arzi paragraph, or the Dhanyawad paragraph if present.
✗ Do NOT change the doshas content or the remedies content (keep all remedy references intact).
✗ Do NOT change the boy/girl name suggestions tied to the Naamakshar.
✗ Do NOT claim "100%" / "guaranteed" / "I promise".
✗ Do NOT add markdown — no "*", "#", "-", no bullets. Pure flowing prose under each marker.
✗ Do NOT add disclaimers beyond the medical-safety line already present.
✗ Do NOT add code fences, preamble, or meta-commentary ("Here is the polished report:").

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Return ONLY the polished report, in ${language.toUpperCase()}, with all section markers intact.
No JSON, no code fences, no preamble.
Approximately the same length as the input (±10%).`;
}

function buildMuhuratPolishUserMessage(
  rawNarrative: string,
  language: MuhuratLanguage,
): string {
  return `Polish the following Child Birth Muhurat report.

Language: ${language}  ← KEEP THIS LANGUAGE EXACTLY. Do NOT translate.

Preserve: the chosen muhurat time, Lagna, Nakshatra, Tithi, score, Naamakshar (lucky letter),
boy/girl name suggestions, all doshas, all remedies, the MAA SHAKTI marker if present, and the
medical-safety line (muhurat is within the doctor-approved window).
Enforce the tone rule: chart indications and potential — never guarantees. Keep it warm and hopeful.
Never override the doctor.
Elevate the prose to premium Dharma Guru register.
Return ONLY the polished prose — no preamble, no JSON, no code fences.

═══════════════════════════════════════════════════════════════
RAW REPORT TO POLISH:
═══════════════════════════════════════════════════════════════

${rawNarrative}

═══════════════════════════════════════════════════════════════

Return the complete polished report now, in ${language.toUpperCase()}. Start with the first word. End with the last word.`;
}
