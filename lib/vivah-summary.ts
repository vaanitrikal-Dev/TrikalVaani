/**
 * ============================================================================
 * TRIKAL VAANI — Vivah Yog summary ("Shadi kab hogi")
 * File:    lib/vivah-summary.ts
 * VERSION: 1.1 (3 Sep 2026)
 *   v1.1 — TWO DEFECTS, BOTH CAUGHT BY THE ATTACK SUITE BEFORE SHIPPING.
 *
 *   1. MY OWN TEMPLATE FAILED MY OWN VALIDATOR. The paid fallback closed with
 *      `kam score ka matlab "shadi nahi hogi" kabhi nahi hota` — the reassuring
 *      line — and the ban on that exact phrase fired on it. Identical in shape
 *      to the Santan bug where the prompt demanded the word "guarantee" and the
 *      validator rejected every draft for containing it.
 *      Here the fix is the other way round from Santan's: the phrase itself is
 *      too dangerous to allow under any wrapping, so the TEMPLATE was reworded
 *      to make the same point without quoting it. A regex cannot reliably tell
 *      "we never say X" from "X" in Hinglish, and on this sentence the cost of
 *      guessing wrong is much higher than losing a turn of phrase.
 *
 *   2. "spouse ki jaati brahmin hogi" WAS ALLOWED. The caste pattern required
 *      the caste word and the verb to be adjacent, and one word between them
 *      was enough to slip through. The bare words are now banned outright: a
 *      legitimate marriage summary has no reason to write "jaati" or "caste"
 *      at all, so there is nothing to lose by refusing them.
 * VERSION: 1.0 (3 Sep 2026)
 * Owner:   Rohiit Gupta, Chief Vedic Architect
 * ============================================================================
 *
 * All the machinery — the Gemini call, the validator, the tier narrowing that
 * makes the paywall real, the retries, the timeouts, the truncation guard —
 * lives in lib/yog-summary.ts and is shared with Santan. This file carries
 * only what belongs to marriage.
 *
 * Every hardening in the shared core was paid for by a live Santan defect on
 * 2-3 Sep 2026: a summary that shipped cut off mid-word; a validator that
 * rejected our own safety sentence for containing "guarantee"; a free tier
 * that recited all three supports and all three blockers while the lock card
 * beneath offered to sell them. Vivah inherits every one of those fixes on
 * day one instead of rediscovering them in front of customers.
 *
 * WHAT IS MARRIAGE-SPECIFIC HERE
 *   - the four prohibitions below, which are stronger than Santan's
 *   - the age-band framing ("kis umar mein"), which is this product's answer
 *     to the most-searched question in the cluster
 *   - the Navamsa D-9 sentence
 *   - the deterministic template's wording
 *
 * THE FOUR PROHIBITIONS — none of them negotiable
 *   1. Never "shadi nahi hogi". Parashara does not claim it, and a calculator
 *      saying it to an anxious 29-year-old is a cruelty with no basis.
 *   2. No divorce, no separation, no widowhood. The texts do carry rules. We
 *      do not publish them: they sell through fear and are read by frightened
 *      people.
 *   3. No caste, community, religion or country of the spouse. A chart cannot
 *      honestly name one, and the attempt is discriminatory whatever it says.
 *   4. No sex of the spouse, and no assumption about it.
 * ============================================================================
 */

import type { VivahFacts } from './vivah-engine';
import {
  buildSummary, narrowFacts, validate,
  FREE_TARGET, PAID_TARGET, MODEL_FREE, MODEL_PAID,
  type SummaryFacts, type SummaryProduct, type YogSummary,
} from './yog-summary';

export const VIVAH_MODEL_FREE = MODEL_FREE;
export const VIVAH_MODEL_PAID = MODEL_PAID;
export type VivahSummary = YogSummary;

/**
 * VivahFacts -> the generic shape. `umar` is an age band and lands in the
 * shared `range` slot, where Santan puts a child count. The core does not need
 * to know which; only the prompts and the template do.
 */
function toShared(f: VivahFacts): SummaryFacts {
  return {
    name: f.name,
    verdict: f.verdict,
    verdictLine: f.verdictLine,
    supportedBy: f.supportedBy,
    blockedBy: f.blockedBy,
    range: f.umar,
    firstWindow: f.firstWindow,
    upayTitles: f.upayTitles,
    vargaRead: f.navamsaRead,
  };
}

const SHARED_RULES = `
You are writing for Trikaal Vaani, a Vedic astrology site. You are a WRITER, not an astrologer and not a calculator.

ABSOLUTE RULES — breaking any one makes the whole answer unusable:
1. Use ONLY the facts in the JSON given to you. Invent nothing.
2. Do NO astrology yourself. Do not name a planet, house, sign, dasha or figure that is not in the JSON.
3. Never say or imply that someone will not marry. Delay is not refusal, and this engine measures delay.
4. Never mention divorce, separation, a second marriage, or the death or illness of a spouse. Not even to reassure.
5. Never describe the spouse's caste, community, religion, country, or sex — not even a hint, not even as a possibility.
6. Never promise or guarantee an outcome.
7. Write no number that is not in the JSON.

VOICE: simple spoken Hinglish, the way a kind older relative explains something at the kitchen table. Short sentences. No jargon — no "Shadbala", no "virupa", no "Navamsa", no "D-9", no "Darakaraka", no "Kalatra Karaka". The supportedBy and blockedBy lines are ALREADY in plain language: use them close to as they are written, do not translate them back into astrology terms.

NAME: if "name" is present in the JSON, address the reader by it ONCE, naturally, near the start. If it is null, do not invent one and do not write a greeting.

SCRIPT: write in Latin script throughout (Hinglish). Do not drop a Devanagari word into the middle of a Latin sentence. Graha names that arrive in Devanagari inside the JSON stay as they are; everything you write yourself is Latin.

NUMBERS: never write a score, a percentage or a band name. The page shows those in their own place, and repeating a low number in a sentence about someone's marriage is unkind and unnecessary.

TONE: people who search this question are often being asked about it by their family, and they are tired of being asked. Be calm and matter of fact. Do not add urgency, do not add sympathy they did not ask for, and never suggest that time is running out.

Do not greet, do not sign off, do not use headings or bullet points unless asked. Return plain text only.
`.trim();

const FREE_PROMPT = `${SHARED_RULES}

TASK: write EXACTLY about ${FREE_TARGET} words, one single paragraph.

IMPORTANT: the verdict is ALREADY printed on the page, directly above your text, in two languages. Do NOT open by restating it — that makes the reader see the same sentence three times. Assume they have just read it.

You have been given exactly ONE helping point and ONE blocking point. That is deliberate. Write about those two and nothing else — do not invent a second one, and do not hint that more exist.

Say, in this order:
- start with the ONE thing HELPING this chart, in ordinary language
- then the ONE thing holding it back, gently
- one line on what that combination means for them in practice
- close by saying this shows the strength of the yog and its timing, and is not a guarantee

DO NOT mention any date, any month, any year, any age, any remedy, any mantra. Those are in the paid reading. Do not tease them either — simply leave them out.`;

const PAID_PROMPT = `${SHARED_RULES}

TASK: write about ${PAID_TARGET} words in flowing paragraphs, no headings.

The verdict is already printed above your text. Do not restate it as your opening sentence — begin with what it MEANS for this person instead.

Cover, in this order:
- what the verdict means for this person, plainly
- what in the chart is carrying it, said without jargon
- what is holding it back, said gently and without alarm
- the age band from the JSON, always as a RANGE and always described as a window rather than a date. Say plainly that if nothing happens in that window the yog waits for the next one — it does not expire
- the timing window, using ONLY the window given in the JSON
- that remedies follow, chosen for this chart specifically — name them by their titles only, do not explain them, because they are listed separately on the page
- close on the boundary: this is the strength of the yog and its timing, not a guarantee

Be warm and direct. Someone who has been asked "shadi kab kar rahe ho" one too many times is reading this.`;

/**
 * Marriage's own prohibitions, on top of the universal gender and promise bans
 * in the shared core. Written as phrases rather than single keywords: "talaak"
 * alone would also catch a sentence explaining that we do NOT discuss it.
 */
const VIVAH_BANNED: RegExp[] = [
  /(shadi|shaadi|vivah|marriage)\s+(nahi|nahin)\s+(hogi|hoga|ho\s*payegi)/i,
  /(शादी|विवाह)\s*(नहीं\s*होगी|नहीं\s*होगा)/,
  /\b(talaak|talaq|divorce|separation)\b/i,
  /\b(तलाक|विधवा|वैधव्य)\b/i,
  /\b(vidhwa|vaidhavya|widow|widower)\b/i,
  /\b(second|doosri|dusri)\s+(marriage|shadi|shaadi)\b/i,
  /(spouse|jeevansaathi|pati|patni)\s+(ki|ka)\s+(mrityu|death|beemari)/i,
  // v1.1: bare words, not adjacency. "spouse ki jaati brahmin hogi" passed the
  // earlier version because one word sat between "jaati" and "hogi". A summary
  // about marriage timing never needs these words, so refusing them outright
  // costs nothing and closes the whole class.
  /\b(caste|jaati|jati|gotra)\b/i,
  /\b(जाति|गोत्र)\b/,
  /(religion|dharm|community)\s+(hogi|hoga|milega|milegi|of the spouse|ka pata)/i,
];

/**
 * Deterministic fallback. Reads plainly on its own — a person should not be
 * able to tell which path they got. It does NOT open with the verdict label,
 * because the page prints that twice directly above.
 */
export function templateSummary(f: SummaryFacts, paid: boolean): string {
  const help = f.supportedBy.length ? f.supportedBy[0] : null;
  const block = f.blockedBy.length ? f.blockedBy[0] : null;

  const free =
    `${f.verdictLine} ` +
    (help ? `Achhi baat ye hai ki ${help}. ` : '') +
    (block ? `Rukavat ye hai ki ${block}. ` : '') +
    `Yaad rakhiye — ye yog ka bal aur uska samay batata hai, kisi natije ki guarantee nahi.`;

  if (!paid) return free;

  return (
    `${f.verdictLine}\n\n` +
    (help ? `Aapke chart mein sabse bada sahara ye hai ki ${help}. ` : '') +
    (block ? `Aur raah jahan rukti hai wo ye hai ki ${block} — ye rukavat hai, inkaar nahi.\n\n` : '\n\n') +
    (f.range ? `Shastra ke sanket aapke chart mein ${f.range} saal ki umar ke beech sabse anukool samay batate hain. Ye ek window hai, koi tay tareekh nahi — aur agar us dauran baat na bane, to yog khatam nahi hota, wo agli khidki ka intezaar karta hai.\n\n` : '') +
    (f.firstWindow ? `Samay ki baat karein to sabse anukool khidki ${f.firstWindow} hai. Neeche di gayi table mein poori suchi hai.\n\n` : '') +
    (f.upayTitles.length ? `Upay aapke apne chart se chune gaye hain, kisi aam suchi se nahi: ${f.upayTitles.join('; ')}. Har ek ka poora vidhi, samay aur wajah neeche di gayi hai. Do upay Brihat Parashara Hora Shastra ke shastriya graha-upay hain, do karak-paddhati se aate hain, aur aakhri seedha aapke chart ki ganit se nikla hai.\n\n` : '') +
    (f.vargaRead ? `Ek baat jo zyadatar jagah nahi hoti: ye vishleshan Navamsa (D-9) padh kar kiya gaya hai, jise shastra vivah ke liye niyat karta hai. Kai jagah sirf rasi chart dekh kar jawab de diya jata hai, jo aadha kaam hai.\n\n` : '') +
    // v1.1: this used to quote the very sentence the validator bans, and so
    // failed its own check. The point is made without the phrase.
    `Aakhir mein ek zaroori baat. Ye poora vishleshan aapke yog ka bal aur uska samay batata hai — kisi natije ki guarantee nahi. ` +
    `Kam score ka matlab inkaar nahi, deri hai; aur deri ka ilaaj samay aur upay dono se hota hai.`
  );
}

export const VIVAH_PRODUCT: SummaryProduct = {
  key: 'vivah',
  sharedRules: SHARED_RULES,
  freePrompt: FREE_PROMPT,
  paidPrompt: PAID_PROMPT,
  extraBanned: VIVAH_BANNED,
  template: templateSummary,
};

/** Kept for tests and for anything that validates Vivah drafts directly. */
export function validateSummary(text: string, f: VivahFacts, paid: boolean) {
  return validate(text, narrowFacts(toShared(f), paid), paid, VIVAH_PRODUCT);
}

export async function buildVivahSummary(f: VivahFacts, paid: boolean): Promise<VivahSummary> {
  return buildSummary(toShared(f), paid, VIVAH_PRODUCT);
}
