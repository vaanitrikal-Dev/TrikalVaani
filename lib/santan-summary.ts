/**
 * ============================================================================
 * TRIKAL VAANI — Santan Yog summary writer
 * File:    lib/santan-summary.ts
 * VERSION: 1.2 (3 Sep 2026)
 *   v1.2 — TIME BUDGET. v1.1 allowed two attempts at 15s each, so the worst
 *   case was 30s of Gemini inside a route that now has a 30s ceiling — the
 *   retry could eat the entire function and leave nothing for a response.
 *   Per-call timeout is 10s and the retry only happens if the budget still
 *   allows it. Warm measurements on the live site: 0.4s cached, 7-9s fresh.
 * VERSION: 1.1 (2 Sep 2026)
 *   v1.1 — FOUND ON THE LIVE SITE WITHIN MINUTES OF DEPLOY, not in testing.
 *   The free summary came back as "...Yeh aak" — cut off mid-word. Cause:
 *   maxOutputTokens was 2048, and Gemini 3.x models spend output tokens on
 *   reasoning before they write. 75 words needs almost nothing; the REASONING
 *   needs room, and without it the visible text is what gets truncated.
 *   Four changes, all of them things testing should have caught:
 *     1. Token budget raised well above what the prose needs.
 *     2. The validator now REJECTS text that does not end in terminal
 *        punctuation. A half-sentence passed the word count and reached a real
 *        customer, which is the worst kind of pass.
 *     3. ONE RETRY before the fallback. A single rejected draft was dropping
 *        straight to the template, and the template repeated the verdict the
 *        page had already printed twice — so the reader saw the same sentence
 *        three times. Retrying first makes that rare.
 *     4. The template no longer opens with the verdict label, because the page
 *        prints it directly above.
 * VERSION: 1.0 (2 Sep 2026)
 * Owner:   Rohiit Gupta, Chief Vedic Architect
 * ============================================================================
 *
 * WHAT THIS IS
 *   Gemini writes the Santan Yog summary. It does NOT compute it. Every fact
 *   it is allowed to use arrives in a SantanFacts object built by
 *   lib/santan-engine.ts; the prompt forbids inventing anything else, and the
 *   validator below REJECTS output that does anyway.
 *
 *   Rohiit's instruction, 2 Sep 2026: "Let Gemini write only summary based on
 *   the data shared by our VM. Gemini should never do his own calculation."
 *   That sentence is the whole design of this file.
 *
 * MODELS — checked against Google's own models page on 2 Sep 2026, not recalled
 *   FREE  75 words  → gemini-3.7-flash   (Stable)
 *   PAID  500 words → gemini-3.8-flash   (Stable, Google's most intelligent Flash)
 *
 *   Why not Pro: there is no Gemini 3.6 Pro — 3.6 is a Flash. `gemini-3-pro-preview`
 *   is shut down. The only Gemini 3 Pro is `gemini-3.1-pro-preview`, which is
 *   February 2026 and still PREVIEW, meaning tighter rate limits and only two
 *   weeks of deprecation notice. Putting a paid, revenue-bearing path on a
 *   preview endpoint is the wrong trade. 3.8 Flash is newer AND stable.
 *
 *   SEPARATELY AND URGENTLY: gemini-2.5-flash and gemini-2.5-pro, which the rest
 *   of this repo still uses in ~26 places, SHUT DOWN ON 16 OCTOBER 2026.
 *
 * WHY A VALIDATOR AND NOT JUST A GOOD PROMPT
 *   Progeny is a medical subject. A single hallucinated sentence here is a real
 *   liability, not a typo. So the model's output is checked before a human ever
 *   sees it, and anything that fails falls back to a deterministic template.
 *   Three classes of failure are caught:
 *     1. GENDER  — any attempt to say a boy or girl is coming. Criminal in India
 *                  under the PCPNDT Act, 1994. Non-negotiable.
 *     2. MEDICAL — "santan nahi hogi", "banjh", "infertile", any diagnosis.
 *     3. INVENTED NUMBERS — any figure or year not present in the facts. This is
 *                  what stops Gemini quietly doing astrology of its own.
 *
 * COST
 *   The free tier is open to anyone, forever, including bots, so an uncached
 *   model call per submit is an unbounded cost against zero revenue. Identical
 *   facts therefore reuse the same summary from an in-process cache.
 *
 * FAILURE IS NEVER FATAL
 *   No API key, a timeout, a 500, a rejected draft — every path returns the
 *   deterministic template. The calculator must always answer.
 * ============================================================================
 */

import type { SantanFacts } from './santan-engine';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

export const SANTAN_MODEL_FREE = 'gemini-3.7-flash';
export const SANTAN_MODEL_PAID = 'gemini-3.8-flash';

const FREE_TARGET = 75;
const PAID_TARGET = 500;

/** Generous bands. Rejecting a good summary for being 8 words long is silly. */
const FREE_MIN = 45, FREE_MAX = 130;
// PAID_MIN was 300 and the deterministic fallback came in at 210, so the
// fallback would have failed its own gate. Gemini is still ASKED for ~500;
// the floor only has to be low enough that a safe, complete answer passes.
const PAID_MIN = 200, PAID_MAX = 750;

const TIMEOUT_MS = 10000;
/** Total Gemini budget for one request. The route's ceiling is 30s. */
const TOTAL_BUDGET_MS = 22000;

/**
 * Output token budget. Far larger than the prose needs, and deliberately so:
 * Gemini 3.x reasons before it writes and that reasoning is charged to the
 * SAME budget, so a tight cap truncates the visible answer rather than the
 * thinking. 75 words is roughly 120 tokens; the rest is headroom.
 */
const MAX_TOKENS_FREE = 4096;
const MAX_TOKENS_PAID = 12288;

export interface SantanSummary {
  text: string;
  /** Which model wrote it, or 'template' when the fallback was used. */
  source: string;
  words: number;
}

// ── Validator ────────────────────────────────────────────────────────────────

/**
 * Gender. Both scripts, and the phrasings people actually use. Bare "putra"
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

/** Anything that reads as a medical verdict, in either direction. */
const MEDICAL_PATTERNS: RegExp[] = [
  /santan\s+nahi\s+ho/i,
  /संतान\s+नहीं\s+हो/,
  /\b(banjh|baanjh|बांझ|बाँझ)\b/i,
  /\b(infertil|sterile|barren\s+woman)/i,
  // BUG FOUND BY TEST, 2 Sep 2026: a bare /guarantee/ blocked our own safety
  // sentence "kisi natije ki guarantee nahi" — the exact opposite of a claim.
  // Only AFFIRMATIVE guarantees are banned; the negation is allowed through.
  /\b(guarantee|guaranteed)\b(?!\s*(nahi|nhi|not|नहीं))/i,
  /\b(pakka\s+hoga|zaroor\s+hoga|definitely\s+will)\b/i,
  /(ilaaj|treatment|dawa)\s+(ki zarurat nahi|not needed|nahi chahiye)/i,
];

/**
 * Every number the model is allowed to write, gathered from the facts it was
 * given. Anything else it prints is something it made up — which, on this
 * subject, is exactly the failure mode worth failing loudly on.
 */
function allowedNumbers(f: SantanFacts): Set<string> {
  const ok = new Set<string>();
  ok.add(String(f.score));
  if (f.sankhya) for (const n of f.sankhya.split('-')) ok.add(n.trim());
  if (f.firstWindow) for (const n of f.firstWindow.match(/\d+/g) ?? []) ok.add(n);
  // Small counting words a writer will legitimately reach for.
  for (const n of ['1', '2', '3', '4', '5', '7', '9', '12', '108']) ok.add(n);
  return ok;
}

export interface ValidationResult { ok: boolean; reason?: string }

export function validateSummary(text: string, f: SantanFacts, paid: boolean): ValidationResult {
  const t = (text ?? '').trim();
  if (!t) return { ok: false, reason: 'empty' };

  const words = t.split(/\s+/).length;
  const [min, max] = paid ? [PAID_MIN, PAID_MAX] : [FREE_MIN, FREE_MAX];
  if (words < min || words > max) return { ok: false, reason: `length ${words} outside ${min}-${max}` };

  // TRUNCATION. A cut-off draft can still pass the word count — the live free
  // summary that shipped on 2 Sep ended "...Yeh aak" at 51 words and was let
  // through. Anything that does not finish a sentence is not an answer.
  if (!/[.!?।]["')\]]?$/.test(t)) return { ok: false, reason: 'truncated — no terminal punctuation' };

  for (const re of GENDER_PATTERNS) if (re.test(t)) return { ok: false, reason: `gender: ${re}` };
  for (const re of MEDICAL_PATTERNS) if (re.test(t)) return { ok: false, reason: `medical: ${re}` };

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

// ── Prompts ──────────────────────────────────────────────────────────────────

const SHARED_RULES = `
You are writing for Trikaal Vaani, a Vedic astrology site. You are a WRITER, not an astrologer and not a calculator.

ABSOLUTE RULES — breaking any one makes the whole answer unusable:
1. Use ONLY the facts in the JSON given to you. Invent nothing.
2. Do NO astrology yourself. Do not name a planet, house, sign, dasha or figure that is not in the JSON.
3. Never state or hint at the sex of a child. This is a criminal offence in India (PCPNDT Act, 1994).
4. Never say or imply that someone cannot have children. Never give a medical opinion or a diagnosis.
5. Never promise or guarantee an outcome.
6. Write no number that is not in the JSON.

VOICE: simple spoken Hinglish, the way a kind older relative explains something at the kitchen table. Short sentences. No jargon — no "Shadbala", no "virupa", no "Saptamsa", no "D-7", no "Putrakaraka". If the JSON names a technical thing, say what it MEANS instead.
Do not greet, do not sign off, do not use headings or bullet points unless asked. Return plain text only.
`.trim();

function freePrompt(): string {
  return `${SHARED_RULES}

TASK: write EXACTLY about ${FREE_TARGET} words, one single paragraph.

Say, in this order:
- the verdict, in plain words
- one line on what is helping, in ordinary language
- one line on what is holding it back, in ordinary language
- close by saying this shows the strength of the yog, is not a guarantee, and is not medical advice

DO NOT mention any date, any month, any year, any remedy, any mantra, and do not say how many children. Those are in the paid reading. Do not tease them either — simply leave them out.`;
}

function paidPrompt(): string {
  return `${SHARED_RULES}

TASK: write about ${PAID_TARGET} words in flowing paragraphs, no headings.

Cover, in this order:
- the verdict and what it means for this person, plainly
- what in the chart is carrying it, said without jargon
- what is holding it back, said gently and without alarm
- the likely range for the number of children, always as a RANGE and always described as a classical indication rather than a count
- the timing window, using ONLY the window given in the JSON
- that remedies follow, chosen for this chart specifically — name them by their titles only, do not explain them, because they are listed separately on the page
- close on the boundary: this is the strength of the yog and its timing, not a guarantee, and for anything physical a doctor comes first

Be warm and direct. A worried person is reading this.`;
}

// ── Deterministic fallback ───────────────────────────────────────────────────

/**
 * Used whenever Gemini is unavailable or its draft is rejected. Reads plainly
 * on its own — a person should not be able to tell which path they got.
 */
export function templateSummary(f: SantanFacts, paid: boolean): string {
  const help = f.supportedBy.length ? f.supportedBy[0] : null;
  const block = f.blockedBy.length ? f.blockedBy[0] : null;

  // v1.1: the page prints verdict.labelHi and verdict.label immediately above
  // this text. Opening with the label again made the reader see one sentence
  // three times over. Start at the LINE instead.
  const free =
    `${f.verdictLine} ` +
    (help ? `Aapke chart mein sahara mil raha hai. ` : '') +
    (block ? `Ek rukavat bhi hai, jispar dhyan dena hoga. ` : '') +
    `Yaad rakhiye — ye yog ka bal batata hai, kisi natije ki guarantee nahi, aur ye medical raay bhi nahi hai. ` +
    `Santan se judi kisi bhi shaaririk chinta ke liye doctor se hi salah lein.`;

  if (!paid) return free;

  return (
    `${f.verdictLine}\n\n` +
    (help ? `Aapke chart mein sabse mazboot sahara wahan se aa raha hai jise hum ${help} kehte hain. ` : '') +
    (block ? `Aur jo cheez raah rok rahi hai, wo ${block} hai — ye rukavat hai, inkaar nahi.\n\n` : '\n\n') +
    (f.sankhya ? `Shastra ke sanket aapke chart mein ${f.sankhya} santan ki taraf jaate hain. Ye ek anuman hai, ginti nahi — aur aaj ke samay mein sankhya sirf grahon par nirbhar nahi karti.\n\n` : '') +
    (f.firstWindow ? `Samay ki baat karein to sabse anukool khidki ${f.firstWindow} hai. Neeche di gayi table mein poori suchi hai.\n\n` : '') +
    (f.upayTitles.length ? `Upay aapke apne chart se chune gaye hain, kisi aam suchi se nahi: ${f.upayTitles.join('; ')}. Har ek ka poora vidhi, samay aur wajah neeche di gayi hai. Do upay Brihat Parashara Hora Shastra ke shastriya graha-upay hain, do karak-paddhati se aate hain, aur aakhri poori tarah aapke chart ki ganit se nikla hai — us graha ka jiska bal aapke teen santan grahon mein sabse kam nikla.\n\n` : '') +
    (f.saptamsaRead ? `Ek baat jo zyadatar jagah nahi hoti: ye vishleshan Saptamsa (D-7) padh kar kiya gaya hai, jise shastra santan ke liye niyat karta hai. Kai jagah santan Navamsa se padhi jaati hai, jo asal mein vivah ka vibhag hai.\n\n` : '') +
    `Aakhir mein ek zaroori baat. Ye poora vishleshan aapke yog ka bal aur uska samay batata hai — kisi natije ki guarantee nahi. ` +
    `Santan ka prashna sabse pehle chikitsa ka hai; kisi bhi shaaririk chinta ke liye qualified doctor se hi salah lijiye.`
  );
}

// ── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(model: string, systemPrompt: string, userMessage: string, maxTokens: number): Promise<string> {
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
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Gemini ${model} → ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── Cache ────────────────────────────────────────────────────────────────────

const CACHE = new Map<string, SantanSummary>();
const CACHE_MAX = 500;

function cacheKey(f: SantanFacts, paid: boolean): string {
  return `${paid ? 'p' : 'f'}|${JSON.stringify(f)}`;
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function buildSantanSummary(f: SantanFacts, paid: boolean): Promise<SantanSummary> {
  const key = cacheKey(f, paid);
  const hit = CACHE.get(key);
  if (hit) return hit;

  const fallback = (): SantanSummary => {
    const text = templateSummary(f, paid);
    return { text, source: 'template', words: text.split(/\s+/).length };
  };

  if (!GEMINI_API_KEY) {
    console.warn('[santan-summary] GEMINI_API_KEY missing — using template.');
    return fallback();
  }

  const model = paid ? SANTAN_MODEL_PAID : SANTAN_MODEL_FREE;
  const system = paid ? paidPrompt() : freePrompt();
  const user = `Here are the ONLY facts you may use:\n\n${JSON.stringify(f, null, 2)}`;

  const maxTokens = paid ? MAX_TOKENS_PAID : MAX_TOKENS_FREE;

  // Two attempts, then the template. One rejected draft used to drop straight
  // to the fallback, and the fallback is noticeably flatter prose — worth one
  // more call before accepting that.
  const started = Date.now();
  for (let attempt = 1; attempt <= 2; attempt++) {
    // Only retry if there is real time left. Better a good template now than a
    // second draft that arrives after the function has been killed.
    if (attempt === 2 && Date.now() - started > TOTAL_BUDGET_MS - TIMEOUT_MS) {
      console.warn('[santan-summary] no time budget for a retry — using template.');
      break;
    }
    try {
      const raw = await callGemini(model, system, user, maxTokens);
      const text = raw.replace(/^```[a-z]*\n?|```$/g, '').trim();
      const check = validateSummary(text, f, paid);
      if (!check.ok) {
        console.warn(`[santan-summary] REJECTED ${model} draft, attempt ${attempt} (${check.reason})`);
        continue;
      }
      const out: SantanSummary = { text, source: model, words: text.split(/\s+/).length };
      if (CACHE.size >= CACHE_MAX) CACHE.clear();
      CACHE.set(key, out);
      return out;
    } catch (e) {
      console.error(`[santan-summary] Gemini failed, attempt ${attempt}:`, e);
    }
  }
  console.warn('[santan-summary] both attempts unusable — using template.');
  return fallback();
}
