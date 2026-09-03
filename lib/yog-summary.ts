/**
 * ============================================================================
 * TRIKAL VAANI — shared summary writer for the yog calculators
 * File:    lib/yog-summary.ts
 * VERSION: 1.0 (3 Sep 2026)
 * Owner:   Rohiit Gupta, Chief Vedic Architect
 * ============================================================================
 *
 * WHY THIS FILE EXISTS
 *   lib/santan-summary.ts was written for one calculator and then hardened
 *   over a long day of live defects: the truncation guard, the retry, the tier
 *   narrowing that made the paywall real, the guarantee regex that was
 *   rejecting our own safety sentence, the token budget, the timeouts. Every
 *   one of those fixes is generic. Copying that file for Vivah Yog would mean
 *   every future fix has to be made twice — and on 3 Sep alone three defects
 *   came from exactly that shape of mistake: a rule changed in one of a pair
 *   and missed in the other (the order route's own whitelist, the lock teaser,
 *   the Trikaal Upay heading).
 *
 *   So the machinery lives here once. A product supplies only what is
 *   genuinely its own: model names, prompts, extra banned patterns, and the
 *   deterministic template.
 *
 * WHAT IS PRODUCT-SPECIFIC AND STAYS OUT OF THIS FILE
 *   - the wording of the prompts
 *   - the fallback template
 *   - any ban that belongs to one subject (PCPNDT gender rules for santan,
 *     divorce and caste for vivah)
 *   Everything else — narrowing, validation, cache, retries, budgets — is here.
 *
 * THE RULES THAT ARE NOT NEGOTIABLE, WHATEVER THE PRODUCT
 *   1. Gemini WRITES. It never calculates. It sees only the facts object.
 *   2. The free tier is narrowed at the DATA level, not by asking the model
 *      nicely. A paywall enforced by a prompt is not a paywall.
 *   3. Every draft is validated before a human sees it, and anything that
 *      fails falls back to the deterministic template.
 *   4. Failure is never fatal. No key, a timeout, a rejected draft — the
 *      calculator always answers.
 *
 * MODELS — checked against Google's own models page on 2 Sep 2026
 *   FREE  → gemini-3.7-flash   (Stable)
 *   PAID  → gemini-3.8-flash   (Stable, Google's most intelligent Flash)
 *   There is no Gemini 3.6 Pro; 3.6 is a Flash. The only Gemini 3 Pro is
 *   gemini-3.1-pro-preview — February 2026 and still preview, which is the
 *   wrong footing for a paid path.
 *   SEPARATELY AND URGENTLY: gemini-2.5-flash and gemini-2.5-pro, still used
 *   in ~26 places elsewhere in this repo, SHUT DOWN ON 16 OCTOBER 2026.
 * ============================================================================
 */

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

export const MODEL_FREE = 'gemini-3.7-flash';
export const MODEL_PAID = 'gemini-3.8-flash';

export const FREE_TARGET = 75;
export const PAID_TARGET = 500;

/** Generous bands. Rejecting a good summary for being eight words long is silly. */
const FREE_MIN = 45, FREE_MAX = 130;
const PAID_MIN = 200, PAID_MAX = 750;

/**
 * Per-call ceilings. Measured live: 6-9s for a fresh free call. An earlier 10s
 * was set from the mean with no margin and sent one call in three to the
 * template. Paid writes 500 words plus reasoning and needs materially more.
 */
const TIMEOUT_MS_FREE = 20000;
const TIMEOUT_MS_PAID = 32000;
/** Total Gemini budget for one request. The route's ceiling is 60s. */
const TOTAL_BUDGET_MS = 50000;

/**
 * Free takes one attempt, paid two. Free worst case is what a waiting stranger
 * feels, and the template is decent. Paid users paid; a longer wait is the
 * lesser harm.
 */
const ATTEMPTS_FREE = 1;
const ATTEMPTS_PAID = 2;

/**
 * Output token budget, far larger than the prose needs. Gemini 3.x reasons
 * before it writes and that reasoning is charged to the SAME budget, so a
 * tight cap truncates the visible answer rather than the thinking. A live free
 * summary once shipped ending "...Yeh aak".
 */
const MAX_TOKENS_FREE = 4096;
const MAX_TOKENS_PAID = 12288;

// ── The shape every yog product hands over ───────────────────────────────────

/**
 * Everything Gemini may see. Note what is absent: no birth details, no chart,
 * no free text. Every number and name it is allowed to use is in here, and
 * validate() rejects any output that introduces one that is not.
 *
 * `range` is deliberately generic — for Santan it is a child count, for Vivah
 * an age band. The machinery does not need to know which.
 */
export interface SummaryFacts {
  /** First name, when given. The model may use it once. */
  name: string | null;
  verdict: string;
  verdictLine: string;
  supportedBy: string[];
  blockedBy: string[];
  /** Santan: "2-3" children. Vivah: "26-29" years of age. Null when unknown. */
  range: string | null;
  firstWindow: string | null;
  upayTitles: string[];
  /** Was the product's own divisional chart actually read? D-7 / D-9. */
  vargaRead: boolean;
}

export interface SummaryProduct {
  /** For log lines only. */
  key: string;
  /** Voice, absolute rules, and any subject-specific prohibition. */
  sharedRules: string;
  freePrompt: string;
  paidPrompt: string;
  /** Bans that belong to THIS subject, on top of the universal ones below. */
  extraBanned: RegExp[];
  /** Deterministic fallback. Must read well on its own. */
  template: (f: SummaryFacts, paid: boolean) => string;
}

export interface YogSummary {
  text: string;
  /** Which model wrote it, or 'template' when the fallback was used. */
  source: string;
  words: number;
}

// ── Universal validation ─────────────────────────────────────────────────────

/**
 * Gender. Both scripts, and the phrasings people actually use. A bare "putra"
 * is NOT here on purpose — "putra yog" is a legitimate classical term and
 * banning it would reject correct output. What is banned is a PREDICTION.
 */
const GENDER_PATTERNS: RegExp[] = [
  /\b(ladka|ladkaa|beta|boy|son)\s+(hoga|hogaa|milega|aayega|will)/i,
  /\b(ladki|beti|girl|daughter)\s+(hogi|hogii|milegi|aayegi|will)/i,
  /पुत्र\s*(होगा|ही होगा|प्राप्त होगा)/,
  /पुत्री\s*(होगी|ही होगी|प्राप्त होगी)/,
  /\b(male|female)\s+child\b/i,
  /(ling|लिंग)\s*(pata|batayen|prediction|निर्धारण)/i,
];

/**
 * Promises. The word "guarantee" itself is NOT banned — the prompts require
 * the closing line "this is not a guarantee", and a lookahead cannot reliably
 * tell a denial from a promise in Hinglish, where the negation often arrives
 * several words later. A live build spent hours rejecting every draft for
 * obeying its own instruction. What is banned is the affirmative form.
 * No \b before Devanagari: JavaScript word boundaries are ASCII-only.
 */
const PROMISE_PATTERNS: RegExp[] = [
  /\b(guarantee|guaranteed)\s+(dete|deta|di ja sakti|hai ki|karte)\b/i,
  /(हम|मैं)\s*(गारंटी|guarantee)\s*(देते|देता|देंगे|दूंगा)/i,
  /(पक्का|ज़रूर|जरूर)\s*(होगा|होगी|मिलेगा|मिलेगी)/,
  /\b(pakka|pakkaa)\s+(hoga|hogi|milega|milegi)\b/i,
  /\bzaroor\s+(hoga|hogi|milega|milegi)\b/i,
  /\b(definitely|certainly|surely)\s+will\b/i,
  /\b100\s*%\s*(sure|pakka|guarantee)/i,
];

/**
 * Every number the model may write, gathered from the facts it was given.
 * Anything else it prints is something it made up — on these subjects, exactly
 * the failure worth failing loudly on. The score is deliberately NOT here: the
 * page shows it in its own card, and repeating a low number in a sentence
 * about someone's children or marriage is unkind and unnecessary.
 */
function allowedNumbers(f: SummaryFacts): Set<string> {
  const ok = new Set<string>();
  if (f.range) for (const n of f.range.split('-')) ok.add(n.trim());
  if (f.firstWindow) for (const n of f.firstWindow.match(/\d+/g) ?? []) ok.add(n);
  for (const n of ['1', '2', '3', '4', '5', '7', '9', '12', '108']) ok.add(n);
  return ok;
}

export interface ValidationResult { ok: boolean; reason?: string }

export function validate(
  text: string,
  f: SummaryFacts,
  paid: boolean,
  product: SummaryProduct,
): ValidationResult {
  const t = (text ?? '').trim();
  if (!t) return { ok: false, reason: 'empty' };

  const words = t.split(/\s+/).length;
  const [min, max] = paid ? [PAID_MIN, PAID_MAX] : [FREE_MIN, FREE_MAX];
  if (words < min || words > max) return { ok: false, reason: `length ${words} outside ${min}-${max}` };

  // TRUNCATION. A cut-off draft can still pass the word count — a live free
  // summary ended "...Yeh aak" at 51 words and was let through. Anything that
  // does not finish a sentence is not an answer.
  if (!/[.!?।]["')\]]?$/.test(t)) return { ok: false, reason: 'truncated — no terminal punctuation' };

  for (const re of GENDER_PATTERNS) if (re.test(t)) return { ok: false, reason: `gender: ${re}` };
  for (const re of PROMISE_PATTERNS) if (re.test(t)) return { ok: false, reason: `promise: ${re}` };
  for (const re of product.extraBanned) if (re.test(t)) return { ok: false, reason: `${product.key}: ${re}` };

  const ok = allowedNumbers(f);
  for (const n of t.match(/\d+/g) ?? []) {
    if (!ok.has(n)) return { ok: false, reason: `invented number ${n}` };
  }

  // The free tier must not leak what the paid tier sells.
  if (!paid) {
    if (/\d{4}-\d{2}-\d{2}/.test(t)) return { ok: false, reason: 'free tier leaked a date' };
    if (/(mantra|daan|jaap|उपाय|मंत्र|दान)/i.test(t)) return { ok: false, reason: 'free tier leaked an upay' };
  }
  return { ok: true };
}

// ── Tier narrowing — THE PAYWALL ─────────────────────────────────────────────

/**
 * What each tier is allowed to KNOW, not merely what it is asked to say.
 *
 * The free reader gets the verdict, the single strongest thing carrying the
 * chart, and the single biggest thing holding it back. Not the range, not the
 * timing, not one remedy name. Those are the three locks on the page, and a
 * lock whose contents have already been read aloud is decoration.
 */
export function narrowFacts(f: SummaryFacts, paid: boolean): SummaryFacts {
  if (paid) return f;
  return {
    name: f.name,
    verdict: f.verdict,
    verdictLine: f.verdictLine,
    supportedBy: f.supportedBy.slice(0, 1),
    blockedBy: f.blockedBy.slice(0, 1),
    range: null,
    firstWindow: null,
    upayTitles: [],
    vargaRead: f.vargaRead,
  };
}

// ── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(
  model: string, systemPrompt: string, userMessage: string, maxTokens: number, timeoutMs: number,
): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.6, topK: 40, topP: 0.95 },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Gemini ${model} → ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── Cache ────────────────────────────────────────────────────────────────────

const CACHE = new Map<string, YogSummary>();
const CACHE_MAX = 500;

function cacheKey(product: string, f: SummaryFacts, paid: boolean): string {
  return `${product}|${paid ? 'p' : 'f'}|${JSON.stringify(f)}`;
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function buildSummary(
  productFacts: SummaryFacts,
  paid: boolean,
  product: SummaryProduct,
): Promise<YogSummary> {
  // Narrow FIRST. Everything downstream — prompt, cache key, validator,
  // template — then works from the facts this tier is actually entitled to.
  const f = narrowFacts(productFacts, paid);

  const key = cacheKey(product.key, f, paid);
  const hit = CACHE.get(key);
  if (hit) return hit;

  const fallback = (): YogSummary => {
    const text = product.template(f, paid);
    return { text, source: 'template', words: text.split(/\s+/).length };
  };

  if (!GEMINI_API_KEY) {
    console.warn(`[${product.key}-summary] GEMINI_API_KEY missing — using template.`);
    return fallback();
  }

  const model = paid ? MODEL_PAID : MODEL_FREE;
  const system = paid ? product.paidPrompt : product.freePrompt;
  const user = `Here are the ONLY facts you may use:\n\n${JSON.stringify(f, null, 2)}`;
  const maxTokens = paid ? MAX_TOKENS_PAID : MAX_TOKENS_FREE;
  const perCall = paid ? TIMEOUT_MS_PAID : TIMEOUT_MS_FREE;
  const maxAttempts = paid ? ATTEMPTS_PAID : ATTEMPTS_FREE;

  const started = Date.now();
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Only retry if there is real time left. Better a good template now than a
    // second draft that arrives after the function has been killed.
    if (attempt > 1 && Date.now() - started > TOTAL_BUDGET_MS - perCall) {
      console.warn(`[${product.key}-summary] no time budget for a retry — using template.`);
      break;
    }
    try {
      const raw = await callGemini(model, system, user, maxTokens, perCall);
      const text = raw.replace(/^```[a-z]*\n?|```$/g, '').trim();
      const check = validate(text, f, paid, product);
      if (!check.ok) {
        console.warn(`[${product.key}-summary] REJECTED ${model} draft, attempt ${attempt} (${check.reason})`);
        continue;
      }
      const out: YogSummary = { text, source: model, words: text.split(/\s+/).length };
      if (CACHE.size >= CACHE_MAX) CACHE.clear();
      CACHE.set(key, out);
      return out;
    } catch (e) {
      console.error(`[${product.key}-summary] Gemini failed, attempt ${attempt}:`, e);
    }
  }
  console.warn(`[${product.key}-summary] both attempts unusable — using template.`);
  return fallback();
}
