/**
 * ============================================================
 * TRIKAAL VAANI — AI Fallback Helper (paid products)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/ai-fallback.ts   (NEW FILE)
 * VERSION: 1.0 (29 Sep 2026)
 * ============================================================
 * KYUN: 27-29 Sep ko Google Gemini par baar-baar "HTTP 503 — high demand"
 * aaya. Karmic, Milan, Child Birth Muhurat aur Voice sirf EK Gemini call
 * karte the — 503 aate hi customer ko error, report nahi. Hast Rekha
 * (VM palmistry_engine v1.8.1) mein yahi pattern 29 Sep ko live pass hua.
 *
 * KYA KARTA HAI (generateWithFallback):
 *   1. Gemini models ek-ek karke (default 3.8 → 3.7). Bheed/overload
 *      (503/429/500) par USI model ko 2s ruk kar EK baar dobara.
 *   2. Dono Gemini haar jaayein aur time bacha ho → Claude Sonnet 5.
 *   3. Har call par hard timeout; poori chain ek deadline ke andar.
 *   4. Har step ka time log: "[ai-fallback] <tag> <model> OK 12.3s".
 *   Lautata hai { text, model, fallback } — fallback=true matlab Claude ne
 *   likha (tab route ko alag se Claude polish NAHI karna chahiye).
 *
 * Gemini REST: nested camelCase generationConfig; thinking default (koi
 * thinkingBudget:0 nahi — Iron Rule). includeThoughts kabhi true nahi.
 * ============================================================
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY ?? '';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';

export const FALLBACK_CLAUDE_MODEL = 'claude-sonnet-5'; // CEO rule: newest model
const RETRY_WAIT_MS = 2000;
const TRANSIENT = [429, 500, 503];

export interface FallbackOptions {
  tag: string;                     // log label, e.g. "karmic"
  prompt: string;                  // user message
  systemInstruction?: string;      // optional system prompt
  models?: string[];               // Gemini order (default 3.8 → 3.7)
  maxOutputTokens: number;         // Gemini budget (thinking included)
  temperature?: number;
  topP?: number;
  perCallTimeoutMs: number;        // ek Gemini call ki hard limit
  deadlineMs: number;              // absolute Date.now() deadline for whole chain
  claudeMaxTokens: number;         // Claude fallback budget
  claudeMinMs: number;             // itna time bacha ho tabhi Claude
  minChars?: number;               // isse chhota jawab = fail
}

export interface FallbackResult {
  text: string;
  model: string;
  fallback: boolean;               // true = Claude ne likha
}

class HttpError extends Error {
  constructor(public status: number, msg: string) { super(msg); }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const secs = (t0: number) => ((Date.now() - t0) / 1000).toFixed(1);

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), Math.max(1000, ms));
  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callGeminiOnce(model: string, o: FallbackOptions, timeoutMs: number): Promise<string> {
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: o.prompt }] }],
    generationConfig: {
      maxOutputTokens: o.maxOutputTokens,
      ...(o.temperature !== undefined ? { temperature: o.temperature } : {}),
      ...(o.topP !== undefined ? { topP: o.topP } : {}),
    },
  };
  if (o.systemInstruction) body.system_instruction = { parts: [{ text: o.systemInstruction }] };

  const res = await fetchWithTimeout(`${GEMINI_BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
    body: JSON.stringify(body),
  }, timeoutMs);

  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 200);
    throw new HttpError(res.status, `HTTP ${res.status}: ${detail}`);
  }
  const data: any = await res.json();
  const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.filter(p => !p?.thought).map(p => p?.text ?? '').join('').trim();
  if (text.length < (o.minChars ?? 1)) {
    throw new Error(`too short (${text.length} chars), finishReason=${data?.candidates?.[0]?.finishReason}`);
  }
  return text;
}

async function callClaude(o: FallbackOptions, timeoutMs: number): Promise<string> {
  if (!CLAUDE_KEY) throw new Error('ANTHROPIC_API_KEY missing');
  const res = await fetchWithTimeout(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: FALLBACK_CLAUDE_MODEL,
      max_tokens: o.claudeMaxTokens,
      ...(o.systemInstruction ? { system: o.systemInstruction } : {}),
      messages: [{ role: 'user', content: o.prompt }],
    }),
  }, timeoutMs);
  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 200);
    throw new HttpError(res.status, `Claude HTTP ${res.status}: ${detail}`);
  }
  const data: any = await res.json();
  if (data?.stop_reason === 'max_tokens') throw new Error('Claude output cut at max_tokens');
  const text = (data?.content ?? []).map((b: any) => b?.text ?? '').join('').trim();
  if (text.length < (o.minChars ?? 1)) throw new Error(`Claude too short (${text.length} chars)`);
  return text;
}

/** Gemini (retry on overload) → next Gemini → Claude Sonnet 5. Throws if all fail. */
export async function generateWithFallback(o: FallbackOptions): Promise<FallbackResult> {
  const models = o.models?.length ? o.models : ['gemini-3.8-flash', 'gemini-3.7-flash'];
  const errors: string[] = [];
  const left = () => o.deadlineMs - Date.now();

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const timeout = Math.min(o.perCallTimeoutMs, left() - 3000);
      if (timeout < 8000) { errors.push(`${model}: skipped (time)`); break; }
      const t0 = Date.now();
      try {
        const text = await callGeminiOnce(model, o, timeout);
        console.log(`[ai-fallback] ${o.tag} ${model} OK ${secs(t0)}s`);
        return { text, model, fallback: false };
      } catch (e: any) {
        const msg = e?.name === 'AbortError' ? 'timeout' : String(e?.message ?? e);
        console.warn(`[ai-fallback] ${o.tag} ${model} try${attempt} FAIL ${secs(t0)}s | ${msg.slice(0, 160)}`);
        errors.push(`${model}#${attempt}: ${msg.slice(0, 160)}`);
        const transient = e instanceof HttpError && TRANSIENT.includes(e.status);
        if (!transient || attempt === 2 || left() - RETRY_WAIT_MS < 15000) break;
        await sleep(RETRY_WAIT_MS);
      }
    }
  }

  const claudeTimeout = left() - 2000;
  if (claudeTimeout < o.claudeMinMs) {
    console.warn(`[ai-fallback] ${o.tag} ${FALLBACK_CLAUDE_MODEL} SKIPPED (${Math.round(claudeTimeout / 1000)}s left)`);
    throw new Error(`All AI failed: ${errors.join(' | ')} | claude skipped (time)`);
  }
  const t0 = Date.now();
  try {
    const text = await callClaude(o, claudeTimeout);
    console.log(`[ai-fallback] ${o.tag} ${FALLBACK_CLAUDE_MODEL} OK ${secs(t0)}s (FALLBACK)`);
    return { text, model: FALLBACK_CLAUDE_MODEL, fallback: true };
  } catch (e: any) {
    const msg = e?.name === 'AbortError' ? 'timeout' : String(e?.message ?? e);
    console.error(`[ai-fallback] ${o.tag} ${FALLBACK_CLAUDE_MODEL} FAIL ${secs(t0)}s | ${msg.slice(0, 160)}`);
    throw new Error(`All AI failed: ${errors.join(' | ')} | claude: ${msg.slice(0, 160)}`);
  }
}
// END — lib/ai-fallback.ts v1.0
