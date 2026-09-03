/**
 * ============================================================================
 * TRIKAL VAANI — Santan Yog summary
 * File:    lib/santan-summary.ts
 * VERSION: 2.0 (3 Sep 2026)
 * Owner:   Rohiit Gupta, Chief Vedic Architect
 * ============================================================================
 *
 * v2.0 — the machinery moved to lib/yog-summary.ts. Nothing about Santan's
 * behaviour changes: same models, same prompts, same bans, same template, same
 * narrowing, same validation. What is left here is only what belongs to this
 * subject.
 *
 * WHY THE MOVE. Vivah Yog needs the identical machinery, and copying it would
 * mean every future fix has to be made twice. On 3 Sep alone, three live
 * defects came from exactly that shape — a rule changed in one of a pair and
 * missed in the other: the order route kept its own type whitelist and Santan
 * could not take payment for a day; the lock teaser and the Trikaal Upay
 * heading said different things about the same fifth remedy. Duplication is
 * the bug generator here, so the machinery lives in one file now.
 *
 * WHAT IS STILL SANTAN'S, AND ONLY SANTAN'S
 *   - the PCPNDT gender rule and the medical prohibition
 *   - the "how many children" framing in the paid prompt
 *   - the Saptamsa D-7 sentence
 *   - the deterministic template's wording
 *
 * THE MEDICAL LINE — DO NOT REMOVE. Progeny is a medical subject before it is
 * an astrological one. Nothing written here may state, imply or hint that a
 * person cannot have children, and no medical cause is ever named.
 * ============================================================================
 */

import type { SantanFacts } from './santan-engine';
import {
  buildSummary, narrowFacts, validate,
  FREE_TARGET, PAID_TARGET, MODEL_FREE, MODEL_PAID,
  type SummaryFacts, type SummaryProduct, type YogSummary,
} from './yog-summary';

export const SANTAN_MODEL_FREE = MODEL_FREE;
export const SANTAN_MODEL_PAID = MODEL_PAID;
export type SantanSummary = YogSummary;

/**
 * SantanFacts -> the generic shape. Kept as a mapping rather than renaming the
 * engine's fields, so lib/santan-engine.ts is not touched by this refactor at
 * all. `sankhya` is a child count; `range` is the neutral name the shared core
 * uses because Vivah puts an age band in the same slot.
 */
function toShared(f: SantanFacts): SummaryFacts {
  return {
    name: f.name,
    verdict: f.verdict,
    verdictLine: f.verdictLine,
    supportedBy: f.supportedBy,
    blockedBy: f.blockedBy,
    range: f.sankhya,
    firstWindow: f.firstWindow,
    upayTitles: f.upayTitles,
    vargaRead: f.saptamsaRead,
  };
}

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

SCRIPT: write in Latin script throughout (Hinglish). Do not drop a Devanagari word into the middle of a Latin sentence — a live summary read "sahara dene wale paksh bhi मौजूद hain", which looks careless. Graha names that arrive in Devanagari inside the JSON stay as they are; everything you write yourself is Latin.

NUMBERS: never write a score, a percentage or a band name. The page already shows those in their own place, and repeating a low number in a sentence about someone's children is unkind and unnecessary.

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
- close by saying this shows the strength of the yog, is not a guarantee, and is not medical advice

DO NOT mention any date, any month, any year, any remedy, any mantra, and do not say how many children. Those are in the paid reading. Do not tease them either — simply leave them out.`;

const PAID_PROMPT = `${SHARED_RULES}

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

/** Santan's own prohibitions, on top of the universal gender and promise bans. */
const SANTAN_BANNED: RegExp[] = [
  /santan\s+nahi\s+ho/i,
  /संतान\s+नहीं\s+हो/,
  /\b(banjh|baanjh|बांझ|बाँझ)\b/i,
  /\b(infertil|sterile|barren\s+woman)/i,
  /(ilaaj|treatment|dawa)\s+(ki zarurat nahi|not needed|nahi chahiye)/i,
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
    `Yaad rakhiye — ye yog ka bal batata hai, kisi natije ki guarantee nahi, aur ye medical raay bhi nahi hai. ` +
    `Santan se judi kisi bhi shaaririk chinta ke liye doctor se hi salah lein.`;

  if (!paid) return free;

  return (
    `${f.verdictLine}\n\n` +
    (help ? `Aapke chart mein sabse bada sahara ye hai ki ${help}. ` : '') +
    (block ? `Aur raah jahan rukti hai wo ye hai ki ${block} — ye rukavat hai, inkaar nahi.\n\n` : '\n\n') +
    (f.range ? `Shastra ke sanket aapke chart mein ${f.range} santan ki taraf jaate hain. Ye ek anuman hai, ginti nahi — aur aaj ke samay mein sankhya sirf grahon par nirbhar nahi karti.\n\n` : '') +
    (f.firstWindow ? `Samay ki baat karein to sabse anukool khidki ${f.firstWindow} hai. Neeche di gayi table mein poori suchi hai.\n\n` : '') +
    (f.upayTitles.length ? `Upay aapke apne chart se chune gaye hain, kisi aam suchi se nahi: ${f.upayTitles.join('; ')}. Har ek ka poora vidhi, samay aur wajah neeche di gayi hai. Do upay Brihat Parashara Hora Shastra ke shastriya graha-upay hain, do karak-paddhati se aate hain, aur aakhri poori tarah aapke chart ki ganit se nikla hai.\n\n` : '') +
    // v2.0: the old text ended "— us graha ka jiska bal aapke teen santan
    // grahon mein sabse kam nikla". Since engine v2.2 the fifth upay can be a
    // SUBSTITUTE when all three santan grahas turn out to be one planet, so
    // that clause is not always true. Removed for the same reason the Trikaal
    // Upay heading was corrected — this is the ONLY behavioural difference
    // between v1.7 and v2.0, and it is a correction, not a regression.
    (f.vargaRead ? `Ek baat jo zyadatar jagah nahi hoti: ye vishleshan Saptamsa (D-7) padh kar kiya gaya hai, jise shastra santan ke liye niyat karta hai. Kai jagah santan Navamsa se padhi jaati hai, jo asal mein vivah ka vibhag hai.\n\n` : '') +
    `Aakhir mein ek zaroori baat. Ye poora vishleshan aapke yog ka bal aur uska samay batata hai — kisi natije ki guarantee nahi. ` +
    `Santan ka prashna sabse pehle chikitsa ka hai; kisi bhi shaaririk chinta ke liye qualified doctor se hi salah lijiye.`
  );
}

export const SANTAN_PRODUCT: SummaryProduct = {
  key: 'santan',
  sharedRules: SHARED_RULES,
  freePrompt: FREE_PROMPT,
  paidPrompt: PAID_PROMPT,
  extraBanned: SANTAN_BANNED,
  template: templateSummary,
};

/** Kept for tests and for anything that validated Santan drafts directly. */
export function validateSummary(text: string, f: SantanFacts, paid: boolean) {
  return validate(text, narrowFacts(toShared(f), paid), paid, SANTAN_PRODUCT);
}

export async function buildSantanSummary(f: SantanFacts, paid: boolean): Promise<SantanSummary> {
  return buildSummary(toShared(f), paid, SANTAN_PRODUCT);
}
