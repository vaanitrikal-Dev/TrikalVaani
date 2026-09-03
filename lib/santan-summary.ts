/**
 * ============================================================================
 * TRIKAL VAANI — Santan Yog summary writer
 * File:    lib/santan-summary.ts
 * VERSION: 1.6 (3 Sep 2026)
 *   v1.6 — THE VALIDATOR WAS BANNING THE SENTENCE THE PROMPT DEMANDS.
 *   Vercel logs, 3 Sep, every santan call for hours:
 *     REJECTED gemini-3.8-flash draft (medical: /guarantee.../)
 *     REJECTED gemini-3.7-flash draft (medical: /guarantee.../)
 *     both attempts unusable — using template.
 *   The prompt instructs the model to close by saying the reading "is not a
 *   guarantee". The validator then rejected it for containing the word. The
 *   v1.1 lookahead only forgave "guarantee nahi" as ADJACENT words, and real
 *   Hinglish puts the negation further along — "guarantee ke roop mein nahi",
 *   "guarantee kabhi nahi di jaati". So the model obeyed, and was punished for
 *   obeying, on every single call.
 *   Same class of mistake as v2.1's jargon: I set two rules that contradict
 *   each other and only one of them was visible in the output.
 *   FIX: stop policing the WORD. Ban the affirmative PROMISE instead —
 *   "guarantee dete hain", "pakka hoga", "100% ". A negated sentence about
 *   guarantees is the safety line, not a claim, and must always pass.
 *
 *   Also raised the paid per-call timeout. The logs show attempt 1 on
 *   gemini-3.8-flash hitting the 20s ceiling: 500 words plus reasoning needs
 *   more room than 75 words does. Free stays at 20s, paid gets 32s.
 * VERSION: 1.5 (3 Sep 2026)
 *   v1.5 — THE TEMPLATE'S GRAMMAR BROKE, and I broke it. santan-engine v2.1
 *   turned supportedBy / blockedBy from short rule LABELS into full plain-
 *   language SENTENCES. This template was written in v1.0 around the labels
 *   and wraps them as noun phrases, so a live paid report read:
 *     "...wo santan ke ghar par kuch grahon ka bhaari dabaav hai hai"
 *     "...sahara wahan se aa raha hai jise hum Guru achhe ghar mein baitha
 *      hai kehte hain"
 *   I changed the inputs and never re-read the consumer. The template now
 *   treats them as the sentences they are.
 * VERSION: 1.4 (3 Sep 2026)
 *   v1.4 — THE TIMEOUT WAS TOO TIGHT, and it was my own doing. v1.2 cut the
 *   per-call timeout to 10s to make two attempts fit inside a 30s route
 *   ceiling. Live Gemini calls measure 6-9s. That is no margin at all, and on
 *   three consecutive live runs one fell back to the template — the reader got
 *   the flat deterministic text while the other two got a proper personalised
 *   summary. Fixing the nine-minute hang had quietly broken the writing.
 *   Now: 20s per call, and the FREE tier takes ONE attempt rather than two.
 *   Reasoning — free worst case is what a waiting stranger actually feels, and
 *   the template is decent since v1.1, so one good try then fall back. PAID
 *   keeps two attempts: they paid, and a longer wait is the lesser harm.
 *   Worst case: free ~21s, paid ~42s. Route ceiling raised to 50s to match.
 * VERSION: 1.3 (3 Sep 2026)
 *   v1.3 — THE VERDICT WAS PRINTED THREE TIMES. The page shows it in
 *   Devanagari, then in Hinglish, and then the prompt asked Gemini to open by
 *   stating it again. The model was obeying. The instruction is now the
 *   opposite: the verdict is already on screen, so start with what is CARRYING
 *   the chart. Also: use the reader's first name once when it is given — a
 *   73-word personal reading that never says the name reads like a form letter.
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

/**
 * Per-call ceiling. Measured on the live site: 6-9s for a fresh call. 20s is
 * deliberately more than double that — a timeout here costs the reader the
 * good summary, and the previous 10s was chosen from the mean with no margin.
 */
/** Free: 75 words. Paid: 500 words plus reasoning — the logs showed 20s cut it off. */
const TIMEOUT_MS = 20000;
const TIMEOUT_MS_PAID = 32000;
/** Total Gemini budget for one request. The route's ceiling is 60s. */
const TOTAL_BUDGET_MS = 50000;
/** Free gets one attempt; paid gets two. See the v1.4 note above. */
const ATTEMPTS_FREE = 1;
const ATTEMPTS_PAID = 2;

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
  // v1.6: the word "guarantee" is NOT banned. The prompt requires the closing
  // line "this is not a guarantee", and a lookahead cannot reliably tell a
  // denial from a promise in Hinglish, where the negation often arrives several
  // words later. What is banned is an affirmative promise, matched on its own
  // wording rather than on one keyword.
  /\b(guarantee|guaranteed)\s+(dete|deta|di ja sakti|hai ki|karte)\b/i,
  // No \b before Devanagari: JavaScript word boundaries are ASCII-only, so
  // \bहम never matches. Caught in testing — "हम गारंटी देते हैं" sailed through.
  /(हम|मैं)\s*(गारंटी|guarantee)\s*(देते|देता|देंगे|दूंगा)/i,
  /(पक्का|ज़रूर|जरूर)\s*(होगा|होगी|मिलेगा|मिलेगी)/,
  /\b(pakka|pakkaa)\s+(hoga|hogi|milega|milegi)\b/i,
  /\bzaroor\s+(hoga|hogi|milega|milegi)\b/i,
  /\b(definitely|certainly|surely)\s+will\b/i,
  /\b100\s*%\s*(sure|pakka|guarantee)/i,
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

VOICE: simple spoken Hinglish, the way a kind older relative explains something at the kitchen table. Short sentences. No jargon — no "Shadbala", no "virupa", no "Saptamsa", no "D-7", no "Putrakaraka". The supportedBy and blockedBy lines are ALREADY in plain language: use them close to as they are written, do not translate them back into astrology terms.

NAME: if "name" is present in the JSON, address the reader by it ONCE, naturally, near the start. If it is null, do not invent one and do not write a greeting.
Do not greet, do not sign off, do not use headings or bullet points unless asked. Return plain text only.
`.trim();

function freePrompt(): string {
  return `${SHARED_RULES}

TASK: write EXACTLY about ${FREE_TARGET} words, one single paragraph.

IMPORTANT: the verdict is ALREADY printed on the page, directly above your text, in two languages. Do NOT open by restating it — that makes the reader see the same sentence three times. Assume they have just read it.

Say, in this order:
- start with what is HELPING this chart, in ordinary language
- then what is holding it back, gently
- one line on what that combination means for them in practice
- close by saying this shows the strength of the yog, is not a guarantee, and is not medical advice

DO NOT mention any date, any month, any year, any remedy, any mantra, and do not say how many children. Those are in the paid reading. Do not tease them either — simply leave them out.`;
}

function paidPrompt(): string {
  return `${SHARED_RULES}

TASK: write about ${PAID_TARGET} words in flowing paragraphs, no headings.

The verdict is already printed above your text. Do not restate it as your opening sentence — begin with what it MEANS for this person instead.

Cover, in this order:
- what the verdict means for this person, plainly
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
  // v1.5: `help` and `block` are complete sentences now. Print them as
  // sentences; do not wrap them in a phrase that adds another verb.
  const free =
    `${f.verdictLine} ` +
    (help ? `Achhi baat ye hai ki ${help}. ` : '') +
    (block ? `Rukavat ye hai ki ${block}. ` : '') +
    `Yaad rakhiye — ye yog ka bal batata hai, kisi natije ki guarantee nahi, aur ye medical raay bhi nahi hai. ` +
    `Santan se judi kisi bhi shaaririk chinta ke liye doctor se hi salah lein.`;

  if (!paid) return free;

  return (
    `${f.verdictLine}\n\n` +
    (help ? `Aapke chart mein sabse bada sahara ye hai ki ${help}. ` : '') +
    (block ? `Aur raah jahan rukti hai wo ye hai ki ${block} — ye rukavat hai, inkaar nahi.\n\n` : '\n\n') +
    (f.sankhya ? `Shastra ke sanket aapke chart mein ${f.sankhya} santan ki taraf jaate hain. Ye ek anuman hai, ginti nahi — aur aaj ke samay mein sankhya sirf grahon par nirbhar nahi karti.\n\n` : '') +
    (f.firstWindow ? `Samay ki baat karein to sabse anukool khidki ${f.firstWindow} hai. Neeche di gayi table mein poori suchi hai.\n\n` : '') +
    (f.upayTitles.length ? `Upay aapke apne chart se chune gaye hain, kisi aam suchi se nahi: ${f.upayTitles.join('; ')}. Har ek ka poora vidhi, samay aur wajah neeche di gayi hai. Do upay Brihat Parashara Hora Shastra ke shastriya graha-upay hain, do karak-paddhati se aate hain, aur aakhri poori tarah aapke chart ki ganit se nikla hai — us graha ka jiska bal aapke teen santan grahon mein sabse kam nikla.\n\n` : '') +
    (f.saptamsaRead ? `Ek baat jo zyadatar jagah nahi hoti: ye vishleshan Saptamsa (D-7) padh kar kiya gaya hai, jise shastra santan ke liye niyat karta hai. Kai jagah santan Navamsa se padhi jaati hai, jo asal mein vivah ka vibhag hai.\n\n` : '') +
    `Aakhir mein ek zaroori baat. Ye poora vishleshan aapke yog ka bal aur uska samay batata hai — kisi natije ki guarantee nahi. ` +
    `Santan ka prashna sabse pehle chikitsa ka hai; kisi bhi shaaririk chinta ke liye qualified doctor se hi salah lijiye.`
  );
}

// ── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(model: string, systemPrompt: string, userMessage: string, maxTokens: number, timeoutMs: number): Promise<string> {
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
  const perCall = paid ? TIMEOUT_MS_PAID : TIMEOUT_MS;

  // Two attempts, then the template. One rejected draft used to drop straight
  // to the fallback, and the fallback is noticeably flatter prose — worth one
  // more call before accepting that.
  const started = Date.now();
  const maxAttempts = paid ? ATTEMPTS_PAID : ATTEMPTS_FREE;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Only retry if there is real time left. Better a good template now than a
    // second draft that arrives after the function has been killed.
    if (attempt > 1 && Date.now() - started > TOTAL_BUDGET_MS - perCall) {
      console.warn('[santan-summary] no time budget for a retry — using template.');
      break;
    }
    try {
      const raw = await callGemini(model, system, user, maxTokens, perCall);
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
