/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        lib/gemini-prompt-festival.ts
 * Version:     v1.0
 * Phase:       Golden Engine — Festival Page Content (festivals_master)
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com
 *
 * PURPOSE:
 *   Builds the Gemini prompt that produces CLEAN, ACCURATE festival content
 *   written into festivals_master. Replaces the old unused buildPanchangFestival
 *   Prompt. Implements the locked Festival Content Template v1.0.
 *
 * IRON RULES — DO NOT VIOLATE:
 *   1. SEPARATE from gemini-prompt.ts (LOCKED v5.0) and gemini-prompt-panchang.ts.
 *      NEVER import or modify those.
 *   2. maxOutputTokens = 12000 (CEO-approved). NEVER reduce. thinkingBudget:0 FORBIDDEN.
 *   3. ACCURACY LOCK: the festival's tithi is passed IN as `definingTithi`.
 *      The prompt MUST NEVER state the specific date's nakshatra / yoga / exact
 *      tithi timing — those belong to the Swiss Ephemeris panchang engine, not
 *      Gemini. (This is what produced the wrong "Dashami / Dhanishtha" content.)
 *   4. Remedies are NOT generated here — they come from the planet_remedies
 *      table (ruling-planet generic, same everywhere). Chart-specific remedies
 *      stay in the ₹151 paid product.
 *   5. BRAND in body text = "Trikaal Vaani" (double-a). NEVER "Trikal Vaani",
 *      a competitor name, or any AI model name.
 *
 * TEMPLATE (fixed boxes + word budgets):
 *   geo_answer 45-60w · spiritual_significance 100-130w · puja_vidhi 5 steps
 *   · dos 5 · donts 4 · faq 3 (answers 25-45w) · seo_title <=60 · seo_desc 150-160
 * ============================================================================
 */

// ============================================================================
// TYPES
// ============================================================================

export type Lang = "en" | "hi";

export interface FestivalInput {
  festivalName: string; // may include the year; cleaned internally
  year: number;
  definingTithi: string; // e.g. "Kartik Amavasya" OR "Makara Sankranti (solar — ...)"
  deity: string | null; // primary deity; if null, prompt uses the festival's well-known deity
  planetRuler: string | null;
  lang?: Lang;
}

export interface FestivalContent {
  geo_answer: string;
  spiritual_significance: string;
  puja_vidhi: string[]; // exactly 5
  dos: string[]; // exactly 5
  donts: string[]; // exactly 4
  faq: Array<{ question: string; answer: string }>; // exactly 3
  seo_title: string;
  seo_description: string;
}

export interface RegionalCustomsInput {
  festivalName: string;
  year: number;
  stateName: string; // e.g. "Maharashtra"
  cityExamples: string; // e.g. "Mumbai, Pune"
  lang?: Lang;
}

export interface RegionalCustoms {
  regional_intro: string; // 40-70w — how this STATE celebrates
  local_customs: string[]; // 3-5 customs
  local_special: string; // one signature local dish / ritual line
}

// ============================================================================
// SHARED RULE BLOCKS
// ============================================================================

const BANNED =
  "profound, profoundly, exceptionally, deeply impactful, magnify, magnifies, " +
  "cosmic forces, authoritative guide, potent, resonates, unleash, harness";

const CORE_RULES = `
NON-NEGOTIABLE RULES:
- ACCURACY FIRST. Use ONLY the festival's defining tithi given below as the lunar/
  solar marker. NEVER state the specific date's Nakshatra, Yoga, or exact tithi
  end-time — you do not have that data and must not guess it. If unsure of any
  fact, omit it. Do not invent Puranic citations.
- If the defining tithi says "solar" or "Gregorian", do NOT force a lunar tithi/
  paksha — describe it as the solar transit or calendar date it is.
- NO superlatives or filler. Banned words: ${BANNED}.
- NO first-person grandiose preamble. NEVER write "I, Rohiit Gupta, present..."
  or "From the wisdom of...". Start directly with the fact.
- BRAND is "Trikaal Vaani" (double-a). NEVER write "Trikal Vaani" in body text.
  NEVER name a competitor (AstroSage/AstroTalk/Drik Panchang) or any AI model.
- Plain, warm, factual Indian English. Content must be UNIQUE to THIS festival.
- GEO/AEO: the FIRST sentence must answer "what + when" so AI engines can extract it.
`.trim();

const OUTPUT_CONTRACT = `
OUTPUT — STRICT. Return ONLY a valid JSON object (no markdown fences, no preamble):
{
  "geo_answer": string,            // 45-60 words. S1: festival + full date + defining tithi. S2: primary deity + what is done. S3: core meaning. No brand name, no preamble.
  "spiritual_significance": string,// 100-130 words, ONE paragraph: origin/story + meaning + why the tithi matters. No date-specific nakshatra.
  "puja_vidhi": [string x5],       // exactly 5 ordered ritual steps, 6-12 words each
  "dos": [string x5],              // exactly 5, 3-6 words each, imperative
  "donts": [string x4],            // exactly 4, 3-6 words each, imperative
  "faq": [{"question": string, "answer": string} x3], // exactly 3; answers 25-45 words; festival-level
  "seo_title": string,             // <=60 chars: "{Festival} {Year}: Date, Puja Vidhi & <key> | Trikaal Vaani"
  "seo_description": string        // 150-160 chars: date + defining tithi + deity + one benefit + "by Rohiit Gupta"
}
Any deviation = parse failure. BE STRICT.
`.trim();

// strip a trailing year from a festival name ("Holi 2026" -> "Holi")
function cleanName(name: string): string {
  return name.replace(/\s*(?:19|20)\d{2}\s*$/, "").trim();
}

// ============================================================================
// PROMPT 1 — FESTIVAL CONTENT (writes festivals_master)
// ============================================================================

export function buildFestivalPrompt(input: FestivalInput): string {
  const name = cleanName(input.festivalName);
  const lang = input.lang ?? "en";
  const langInstruction =
    lang === "hi"
      ? "Write ALL output in natural Hindi (Devanagari). Conversational, not pure Sanskrit."
      : "Write ALL output in plain English. Transliterate Sanskrit terms (Tithi, Puja, Muhurat).";

  const deityLine = input.deity
    ? `Primary deity: ${input.deity}`
    : `Primary deity: (not supplied) — use this festival's universally-established primary deity. If genuinely unknown, omit deity references. NEVER invent one.`;

  const rulerLine = input.planetRuler
    ? `Ruling planet (for context only, do NOT over-explain): ${input.planetRuler}`
    : `Ruling planet: (not supplied) — do not speculate.`;

  return `
You are writing the festival guide for ${name} ${input.year} for Trikaal Vaani.

${langInstruction}

FESTIVAL FACTS (use ONLY these):
- Festival: ${name}
- Year: ${input.year}
- Defining tithi / marker: ${input.definingTithi}
- ${deityLine}
- ${rulerLine}

${CORE_RULES}

${OUTPUT_CONTRACT}
`.trim();
}

// ============================================================================
// PROMPT 2 — REGIONAL CUSTOMS (Layer 3, per state) — CULTURE ONLY, NOT astrology
// Route should enable google_search grounding for this call.
// Output MUST be human-verified before publish.
// ============================================================================

export function buildRegionalCustomsPrompt(input: RegionalCustomsInput): string {
  const name = cleanName(input.festivalName);
  const lang = input.lang ?? "en";
  const langInstruction =
    lang === "hi" ? "Write in natural Hindi (Devanagari)." : "Write in plain English.";

  return `
Describe how the state of ${input.stateName} (cities like ${input.cityExamples}) traditionally
celebrates ${name} ${input.year}. CULTURE AND CUSTOMS ONLY.

${langInstruction}

HARD RULES:
- This is about regional CULTURE — local rituals, names, foods, processions. NOT astrology.
- Do NOT mention Parashari / Bhrigu / Shadbala / any "remedy" — those are universal, not regional.
- Do NOT state a tithi, nakshatra, or planetary detail here.
- Use only well-established, verifiable regional customs. If you are not confident a
  custom is real for ${input.stateName}, OMIT it. Do NOT invent local temples or rituals.
- BRAND "Trikaal Vaani" (double-a). No competitor names, no AI model names. Plain factual tone.

Return ONLY this JSON (no fences, no preamble):
{
  "regional_intro": string,   // 40-70 words: how ${input.stateName} specifically celebrates ${name}
  "local_customs": [string],  // 3-5 short bullet-style customs specific to ${input.stateName}
  "local_special": string     // one line: a signature local dish or ritual
}
`.trim();
}

// ============================================================================
// MODEL CONFIG — CEO-APPROVED
// ============================================================================

export const FESTIVAL_GEMINI_CONFIG = {
  // Festival content: Flash is enough; LOW temperature for factual consistency
  content: {
    model: "gemini-2.5-flash",
    maxOutputTokens: 12000, // CEO-locked. NEVER reduce.
    temperature: 0.45, // low → factual, less fluff. (Old festival prompt used 0.7.)
  },
  // Regional customs: Flash + google_search grounding (route adds the tool)
  regional: {
    model: "gemini-2.5-flash",
    maxOutputTokens: 12000,
    temperature: 0.5,
  },
} as const;

// ============================================================================
// STRICT PARSER + VALIDATION
// ============================================================================

function stripFences(raw: string): string {
  let c = raw.trim();
  c = c.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const a = c.indexOf("{");
  const b = c.lastIndexOf("}");
  if (a > 0 && b > a) c = c.substring(a, b + 1);
  return c;
}

const words = (s: string) => (s ? s.trim().split(/\s+/).length : 0);

export function parseFestivalContent(raw: string): FestivalContent {
  const parsed = JSON.parse(stripFences(raw)) as FestivalContent;

  const w = words(parsed.geo_answer);
  if (!parsed.geo_answer || w < 40 || w > 75) {
    throw new Error(`geo_answer must be ~45-60 words, got ${w}`);
  }
  if (!Array.isArray(parsed.puja_vidhi) || parsed.puja_vidhi.length !== 5) {
    throw new Error(`puja_vidhi must have exactly 5 steps, got ${parsed.puja_vidhi?.length ?? 0}`);
  }
  if (!Array.isArray(parsed.dos) || parsed.dos.length !== 5) {
    throw new Error(`dos must have exactly 5 items, got ${parsed.dos?.length ?? 0}`);
  }
  if (!Array.isArray(parsed.donts) || parsed.donts.length !== 4) {
    throw new Error(`donts must have exactly 4 items, got ${parsed.donts?.length ?? 0}`);
  }
  if (!Array.isArray(parsed.faq) || parsed.faq.length !== 3) {
    throw new Error(`faq must have exactly 3 entries, got ${parsed.faq?.length ?? 0}`);
  }
  if (!parsed.spiritual_significance || words(parsed.spiritual_significance) < 70) {
    throw new Error("spiritual_significance too short");
  }
  if (!parsed.seo_title || !parsed.seo_description) {
    throw new Error("seo_title or seo_description missing");
  }
  // Brand-leak guard — fail loud if single-a slips through
  const blob = JSON.stringify(parsed).toLowerCase();
  if (/\btrikal\s+vaani\b/.test(blob)) {
    throw new Error("Brand leak: 'Trikaal Vaani' (single-a) found — must be 'Trikaal Vaani'");
  }
  return parsed;
}

export function parseRegionalCustoms(raw: string): RegionalCustoms {
  const parsed = JSON.parse(stripFences(raw)) as RegionalCustoms;
  if (!parsed.regional_intro || words(parsed.regional_intro) < 30) {
    throw new Error("regional_intro too short");
  }
  if (!Array.isArray(parsed.local_customs) || parsed.local_customs.length < 3) {
    throw new Error("local_customs must have at least 3 items");
  }
  return parsed;
}

// ============================================================================
// END — gemini-prompt-festival.ts v1.0
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
