/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        lib/gemini-prompt-panchang.ts
 * Version:     v1.0
 * Phase:       C1 — AI Content Engine (Panchang Generation)
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com
 * GitHub:      vaanitrikal-Dev/TrikalVaani
 * Created:     May 09, 2026
 *
 * PURPOSE:
 *   Builds Gemini prompts for daily panchang SEO/GEO content generation.
 *   Powers /panchang/[date], /[city]/panchang, and /events/[slug] pages.
 *
 * IRON RULES — DO NOT VIOLATE:
 *   1. This file is SEPARATE from gemini-prompt.ts (which is LOCKED v5.0).
 *   2. NEVER import or modify gemini-prompt.ts from this file.
 *   3. maxOutputTokens = 12000 (approved). NEVER reduce.
 *   4. thinkingBudget:0 = PERMANENTLY FORBIDDEN.
 *   5. Hub uses Gemini 2.5 Pro. Cities use Gemini 2.5 Flash. Per CEO decision.
 *   6. Every prompt MUST enforce 40–60 word GEO direct answer block.
 *   7. Every prompt MUST return strict JSON (parseable, no markdown fences).
 *
 * SEO/GEO REQUIREMENTS:
 *   - Entity-rich: Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Abhijit Muhurat
 *   - FAQ block: 5 questions, AI-extractable structure
 *   - E-E-A-T: Author = Rohiit Gupta, Chief Vedic Architect
 *   - Outranks: AstroSage, AstroTalk via depth + personalization
 *
 * COST PROFILE (BALANCED scope, CEO-approved):
 *   - 1 hub row/day (Pro)        → ~₹3.0/day
 *   - 10 city rows/day (Flash)   → ~₹2.5/day
 *   - Daily total                → ~₹5.5
 *   - Monthly total              → ~₹165
 * ============================================================================
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PanchangData {
  date: string; // YYYY-MM-DD
  tithi: string; // e.g. "Shukla Paksha Tritiya"
  nakshatra: string; // e.g. "Rohini"
  yoga: string; // e.g. "Siddhi"
  karana: string; // e.g. "Bava"
  vara: string; // e.g. "Saturday"
  sunrise: string; // HH:MM
  sunset: string; // HH:MM
  rahu_kaal: string; // e.g. "09:00 - 10:30"
  abhijit_muhurat: string; // e.g. "11:55 - 12:45"
  yamaganda?: string;
  gulika?: string;
  moon_sign?: string;
  sun_sign?: string;
}

export interface CityContext {
  slug: string; // e.g. "delhi"
  name: string; // e.g. "Delhi NCR"
  state: string; // e.g. "Delhi"
  lat: number;
  lon: number;
}

export type Lang = "en" | "hi";

export interface GeminiPanchangResponse {
  geo_answer: string; // 40-60 words, MUST start every page
  intro_paragraph: string; // 100-150 words SEO body
  spiritual_significance: string; // 150-200 words
  dos_and_donts: { dos: string[]; donts: string[] };
  remedies: string[]; // 3-5 actionable remedies
  faq: Array<{ question: string; answer: string }>; // exactly 5
  meta_title: string; // 55-60 chars
  meta_description: string; // 150-160 chars
  schema_keywords: string[]; // for JSON-LD
}

// ============================================================================
// SHARED CONSTRAINTS — INJECTED INTO EVERY PROMPT
// ============================================================================

const BRAND_VOICE = `
BRAND: Trikal Vaani (trikalvaani.com)
AUTHOR: Rohiit Gupta, Chief Vedic Architect
TAGLINE: "Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye."
TONE: Authoritative, classical Vedic, accessible to mass-market Indian readers.
CITATIONS: Reference BPHS (Brihat Parashara Hora Shastra), Bhrigu Samhita, Surya Siddhanta where relevant.
NEVER: Generic "horoscope app" tone. NEVER copy AstroSage/AstroTalk style.
`.trim();

const GEO_RULES = `
GEO (Generative Engine Optimization) RULES — NON-NEGOTIABLE:
1. geo_answer field MUST be 40-60 words, factual, entity-rich, no fluff.
2. geo_answer MUST mention at minimum: Tithi, Nakshatra, Yoga, the date.
3. Use entities Google/Perplexity/SearchGPT can extract: planet names, house numbers, dasha lords.
4. faq.question MUST be phrased as real user search queries (e.g. "Kya aaj shubh muhurat hai?").
5. faq.answer MUST be 30-60 words, self-contained (no "see above"), citation-backed.
6. NEVER hallucinate timings — use ONLY the panchang data provided.
`.trim();

const OUTPUT_CONTRACT = `
OUTPUT CONTRACT — STRICT:
Return ONLY a valid JSON object. No markdown fences. No preamble. No commentary.
The JSON MUST match this exact shape:
{
  "geo_answer": string,
  "intro_paragraph": string,
  "spiritual_significance": string,
  "dos_and_donts": { "dos": string[], "donts": string[] },
  "remedies": string[],
  "faq": [{ "question": string, "answer": string }, ... exactly 5 ...],
  "meta_title": string,
  "meta_description": string,
  "schema_keywords": string[]
}
Any deviation = parse failure = wasted ₹3 cost. BE STRICT.
`.trim();

// ============================================================================
// PROMPT 1: HUB PROMPT (Today's national panchang) — Gemini 2.5 Pro
// ============================================================================

export function buildPanchangHubPrompt(
  panchang: PanchangData,
  lang: Lang = "en"
): string {
  const langInstruction =
    lang === "hi"
      ? "Write ALL output in Hindi (Devanagari script). Use natural conversational Hindi, not pure Sanskrit. Hinglish terms allowed where natural (e.g. 'shubh muhurat')."
      : "Write ALL output in English. Use English with native Vedic Sanskrit terms transliterated (e.g. 'Tithi', 'Nakshatra', 'Rahu Kaal').";

  return `
You are Rohiit Gupta, Chief Vedic Architect of Trikal Vaani.
You are writing the AUTHORITATIVE national panchang content for ${panchang.date}.
This page must outrank AstroSage and AstroTalk for "aaj ka panchang" and "today's panchang".

${BRAND_VOICE}

${langInstruction}

PANCHANG DATA (use ONLY this — do NOT invent values):
- Date: ${panchang.date}
- Vara (Day): ${panchang.vara}
- Tithi: ${panchang.tithi}
- Nakshatra: ${panchang.nakshatra}
- Yoga: ${panchang.yoga}
- Karana: ${panchang.karana}
- Sunrise: ${panchang.sunrise}
- Sunset: ${panchang.sunset}
- Rahu Kaal: ${panchang.rahu_kaal}
- Abhijit Muhurat: ${panchang.abhijit_muhurat}
${panchang.yamaganda ? `- Yamaganda: ${panchang.yamaganda}` : ""}
${panchang.gulika ? `- Gulika Kaal: ${panchang.gulika}` : ""}
${panchang.moon_sign ? `- Moon Sign: ${panchang.moon_sign}` : ""}
${panchang.sun_sign ? `- Sun Sign: ${panchang.sun_sign}` : ""}

${GEO_RULES}

ADDITIONAL HUB-SPECIFIC RULES:
- spiritual_significance: Explain what THIS specific Tithi + Nakshatra + Yoga combo means classically.
  Cite BPHS or Bhrigu where the combination has named significance.
- dos_and_donts: 4 dos, 4 donts. Tied to the specific Tithi + Nakshatra of the day.
- remedies: 3-5 remedies SPECIFIC to today's planetary lords.
  Format: "Action — Why (planetary reason)". Example: "Light til oil diya facing south — Shani is the karaka of ${panchang.vara}".
- meta_title: Format "Aaj Ka Panchang ${panchang.date} — [unique hook] | Trikal Vaani"
- meta_description: Include Tithi + Nakshatra + a benefit promise. 150-160 chars.
- faq questions MUST include: shubh muhurat today, what to avoid today, best time for puja today, Rahu Kaal meaning today, remedies for today.

${OUTPUT_CONTRACT}
`.trim();
}

// ============================================================================
// PROMPT 2: CITY PROMPT (Local panchang per city) — Gemini 2.5 Flash
// ============================================================================

export function buildPanchangCityPrompt(
  panchang: PanchangData,
  city: CityContext,
  lang: Lang = "en"
): string {
  const langInstruction =
    lang === "hi"
      ? `Write ALL output in Hindi (Devanagari). Use city name '${city.name}' naturally in content.`
      : `Write ALL output in English. Use city name '${city.name}' naturally — local SEO target keyword.`;

  return `
You are Rohiit Gupta, Chief Vedic Architect of Trikal Vaani.
You are writing the LOCAL panchang for ${city.name} on ${panchang.date}.
TARGET KEYWORDS: "aaj ka panchang ${city.slug}", "panchang ${city.slug} today", "${city.slug} muhurat today".
This page MUST outrank AstroSage's city pages.

${BRAND_VOICE}

${langInstruction}

CITY: ${city.name}, ${city.state} (lat ${city.lat}, lon ${city.lon})
PANCHANG (calculated for ${city.name}'s coordinates — sunrise/sunset are LOCAL):
- Date: ${panchang.date}
- Vara: ${panchang.vara}
- Tithi: ${panchang.tithi}
- Nakshatra: ${panchang.nakshatra}
- Yoga: ${panchang.yoga}
- Karana: ${panchang.karana}
- Sunrise (${city.name}): ${panchang.sunrise}
- Sunset (${city.name}): ${panchang.sunset}
- Rahu Kaal (${city.name}): ${panchang.rahu_kaal}
- Abhijit Muhurat (${city.name}): ${panchang.abhijit_muhurat}

${GEO_RULES}

CITY-SPECIFIC RULES:
- geo_answer MUST mention "${city.name}" by name and the local sunrise time.
- intro_paragraph MUST explain WHY local panchang differs from national (longitude → sunrise → muhurat shift).
- spiritual_significance: Tie today's Tithi+Nakshatra to ${city.name}'s cultural temple traditions where natural.
  (Delhi → Chhatarpur, Mumbai → Siddhivinayak, Hyderabad → Birla Mandir, etc. Only if genuinely relevant.)
- dos_and_donts: 3 dos, 3 donts. Practical, actionable.
- remedies: 3 remedies. Mention nearest sacred direction or local-context practice.
- meta_title: "Aaj Ka Panchang ${city.name} ${panchang.date} | Trikal Vaani"
- meta_description: Local sunrise + tithi + benefit. 150-160 chars. Include "${city.name}".
- faq MUST include 1 question about local sunrise/sunset difference.
- KEEP TOTAL LENGTH MODERATE — Flash model, ~600-800 words total content.

${OUTPUT_CONTRACT}
`.trim();
}

// ============================================================================
// PROMPT 3: FESTIVAL PROMPT (Event/festival pages) — Gemini 2.5 Flash
// ============================================================================

export function buildPanchangFestivalPrompt(
  festivalName: string,
  festivalSlug: string,
  panchang: PanchangData,
  planetaryRuler: string,
  lang: Lang = "en"
): string {
  const langInstruction =
    lang === "hi"
      ? "Write in Hindi (Devanagari). Festival name in Hindi where applicable."
      : "Write in English. Use Hindi festival name with English explanation in parentheses on first mention.";

  return `
You are Rohiit Gupta, Chief Vedic Architect of Trikal Vaani.
You are writing the AUTHORITATIVE astrological guide for ${festivalName} on ${panchang.date}.
TARGET KEYWORDS: "${festivalSlug} ${new Date(panchang.date).getFullYear()} astrology", "${festivalSlug} muhurat", "${festivalSlug} puja vidhi".

${BRAND_VOICE}

${langInstruction}

FESTIVAL: ${festivalName}
DATE: ${panchang.date}
PLANETARY RULER: ${planetaryRuler}
PANCHANG ON FESTIVAL DATE:
- Tithi: ${panchang.tithi}
- Nakshatra: ${panchang.nakshatra}
- Yoga: ${panchang.yoga}
- Sunrise: ${panchang.sunrise}
- Sunset: ${panchang.sunset}
- Rahu Kaal (avoid): ${panchang.rahu_kaal}
- Abhijit Muhurat (auspicious): ${panchang.abhijit_muhurat}

${GEO_RULES}

FESTIVAL-SPECIFIC RULES:
- geo_answer: What is ${festivalName}, when, ruling planet, key muhurat. 40-60 words.
- intro_paragraph: Origin/legend (cite Puranic source if applicable — Skanda Purana, Bhavishya Purana, etc.).
- spiritual_significance: 200 words on ${planetaryRuler}'s influence and how the day's Tithi+Nakshatra amplifies the festival's energy.
- dos_and_donts: Puja-specific. 5 dos, 5 donts.
- remedies: 3-5 personal remedies linked to ${planetaryRuler}.
- meta_title: "${festivalName} ${new Date(panchang.date).getFullYear()} — Date, Muhurat, Puja Vidhi | Trikal Vaani"
- meta_description: Date + muhurat + ruling planet + benefit. 150-160 chars.
- faq MUST include: when is ${festivalName}, what to do, what to avoid, which planet rules, who should observe.

${OUTPUT_CONTRACT}
`.trim();
}

// ============================================================================
// GEMINI MODEL CONFIG — CEO-APPROVED
// ============================================================================

export const GEMINI_CONFIG = {
  hub: {
    model: "gemini-2.5-pro",
    maxOutputTokens: 12000, // CEO-locked. NEVER reduce.
    temperature: 0.7,
    // thinkingBudget OMITTED — Pro uses default reasoning. NEVER set to 0.
  },
  city: {
    model: "gemini-2.5-flash",
    maxOutputTokens: 12000,
    temperature: 0.65,
  },
  festival: {
    model: "gemini-2.5-flash",
    maxOutputTokens: 12000,
    temperature: 0.7,
  },
} as const;

// ============================================================================
// SAFE JSON PARSER — strips fences if Gemini misbehaves
// ============================================================================

export function parseGeminiPanchangResponse(
  raw: string
): GeminiPanchangResponse {
  let cleaned = raw.trim();
  // Strip ```json ... ``` if Gemini wraps despite instructions
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  // Strip leading non-JSON characters
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace > 0) cleaned = cleaned.substring(firstBrace, lastBrace + 1);

  const parsed = JSON.parse(cleaned) as GeminiPanchangResponse;

  // Defensive validation — fail loud if shape is wrong
  if (!parsed.geo_answer || parsed.geo_answer.split(/\s+/).length < 30) {
    throw new Error("geo_answer too short or missing — GEO rule violation");
  }
  if (!parsed.faq || parsed.faq.length !== 5) {
    throw new Error(`FAQ must have exactly 5 entries, got ${parsed.faq?.length ?? 0}`);
  }
  if (!parsed.meta_title || !parsed.meta_description) {
    throw new Error("meta_title or meta_description missing");
  }
  return parsed;
}

// ============================================================================
// END — gemini-prompt-panchang.ts v1.0
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
