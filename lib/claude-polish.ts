/**
 * ============================================================
 * TRIKAL VAANI — Claude Haiku Polish Layer
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/claude-polish.ts
 * VERSION: 1.0 — Haiku 4.5 Language Polishing for ₹99+ tiers
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   Takes Gemini prediction JSON → polishes language quality
 *   using Claude Haiku 4.5 API
 *
 * WHEN CALLED:
 *   tier === 'standard' or 'premium' ONLY
 *   Called AFTER Gemini generates prediction
 *   Called BEFORE saving to Supabase
 *
 * COST:
 *   ~₹1.25/call at Haiku 4.5 rates ($1/$5 per MTok)
 *   Total with Gemini: ₹4.75/call at ₹99 tier
 *   Margin: 95%+
 *
 * WHAT IT POLISHES:
 *   1. simpleSummary.text — warmer, more personal language
 *   2. professionalEnglish sections — crisper prose
 *   3. professionalHindi — purer देवनागरी, better flow
 *   4. Remedy language — more specific and actionable
 *   Does NOT change: dates, planet names, citations, schema
 * ============================================================
 */

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
const CLAUDE_MODEL   = 'claude-haiku-4-5-20251001';
const CLAUDE_URL     = 'https://api.anthropic.com/v1/messages';

export interface PolishResult {
  polished:    boolean;
  prediction:  Record<string, unknown>;
  polishMs?:   number;
  error?:      string;
}

// ── Main Polish Function ──────────────────────────────────────────────────────

export async function polishPrediction(
  prediction:  Record<string, unknown>,
  language:    'hindi' | 'hinglish' | 'english',
  personName:  string,
  domainLabel: string,
  tier:        'standard' | 'premium',
): Promise<PolishResult> {

  if (!CLAUDE_API_KEY) {
    console.warn('[Polish] No ANTHROPIC_API_KEY — skipping polish');
    return { polished: false, prediction };
  }

  const startMs = Date.now();

  try {
    const systemPrompt = buildPolishSystemPrompt(language, domainLabel);
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
        max_tokens: 8192,
        system:     systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Claude API ${res.status}: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const rawText = data?.content
      ?.map((c: { type: string; text?: string }) => c.text ?? '')
      .join('') ?? '';

    if (!rawText) throw new Error('Empty Claude response');

    // Parse polished JSON
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
    console.log(`[Polish] OK — ms: ${polishMs} | model: ${CLAUDE_MODEL}`);

    return {
      polished:   true,
      prediction: polishedPrediction,
      polishMs,
    };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Polish] Error:', msg);
    // Non-fatal — return original prediction
    return { polished: false, prediction, error: msg };
  }
}

// ── System Prompt ─────────────────────────────────────────────────────────────

function buildPolishSystemPrompt(language: string, domainLabel: string): string {
  return `You are a language polishing specialist for Trikal Vaani, an Indian Vedic astrology platform.

Your job: Take a Gemini-generated prediction JSON and POLISH the language quality.

DOMAIN: ${domainLabel}
LANGUAGE: ${language.toUpperCase()}

WHAT TO POLISH:
1. simpleSummary.text → warmer, more personal, conversational
2. simpleSummary.dos and donts → more specific, actionable
3. professionalEnglish.executiveSummary → crisper, authoritative prose
4. professionalEnglish.remedyPlan.remedies[].dos/donts → more specific
${language !== 'english' ? `5. professionalHindi sections → purer देवनागरी, better flow, more natural Hindi` : ''}

WHAT TO NOT CHANGE (STRICT):
✗ Never change planet names, house numbers, or Rashi names
✗ Never change dates or date ranges
✗ Never change classicalBasis citations
✗ Never change JSON structure or field names
✗ Never change geoDirectAnswer
✗ Never change schema/locked fields
✗ Never add new content — only improve existing language
✗ Never change confidence levels, yoga names, or technical terms
✗ Numbers (strength scores, counts) must remain identical

TONE RULES:
Hinglish: Warm trusted friend — "Bhai/behen, sun lo..." energy
Hindi: Respectful senior Jyotishi — "आपको बताना चाहूँगा..."
English: Knowledgeable, warm, direct — no corporate jargon

OUTPUT: Return ONLY the complete polished JSON. Nothing else.
Must pass JSON.parse() without modification.`;
}

// ── User Message ──────────────────────────────────────────────────────────────

function buildPolishUserMessage(
  prediction:  Record<string, unknown>,
  personName:  string,
  language:    string,
  tier:        string,
): string {

  // Only send the sections that need polishing — saves tokens
  const toPolish: Record<string, unknown> = {
    geoDirectAnswer:     prediction.geoDirectAnswer,
    simpleSummary:       prediction.simpleSummary,
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

  if (prediction.professionalHindi && typeof prediction.professionalHindi === 'object') {
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

Polish the language in these sections only. Return the COMPLETE original JSON with ONLY the language improved in the sections I've highlighted. All other sections must remain exactly as provided.

SECTIONS TO POLISH:
${JSON.stringify(toPolish, null, 2)}

COMPLETE ORIGINAL JSON (merge polished sections back into this):
${JSON.stringify(prediction, null, 2)}

Return the complete JSON with polished language. Start with {. End with }.`;
}

// ── Token Estimator ───────────────────────────────────────────────────────────

export function estimatePolishCost(predictionJson: Record<string, unknown>): {
  estimatedTokens: number;
  estimatedCostUsd: number;
  estimatedCostInr: number;
} {
  const jsonStr = JSON.stringify(predictionJson);
  // Rough estimate: 1 token ≈ 4 characters
  const inputTokens  = Math.ceil(jsonStr.length / 4) + 500; // +500 for system prompt
  const outputTokens = Math.ceil(jsonStr.length / 4);       // similar size output

  // Haiku 4.5: $1/MTok input, $5/MTok output
  const costUsd = (inputTokens / 1_000_000 * 1) + (outputTokens / 1_000_000 * 5);
  const costInr = costUsd * 83; // approximate INR conversion

  return {
    estimatedTokens:  inputTokens + outputTokens,
    estimatedCostUsd: Math.round(costUsd * 10000) / 10000,
    estimatedCostInr: Math.round(costInr * 100) / 100,
  };
}
