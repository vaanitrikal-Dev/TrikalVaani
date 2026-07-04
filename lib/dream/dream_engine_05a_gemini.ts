// =============================================================================
// TRIKAAL VAANI · Dream Engine · Component 5a: THE GEMINI CALLER
// -----------------------------------------------------------------------------
// The dream engine's OWN Gemini caller — fully separate from the locked
// gemini-prompt.ts. Nothing here touches your prediction path.
//
// Anti-hallucination design (as requested):
//   • Extraction + sub-type pick run at temperature 0 (deterministic parsing).
//   • JSON response mode forces clean, parseable output.
//   • Gemini never decides meaning — it picks only from ACTUAL table rows, and
//     the composer is locked to the table's exact meaning.
//   • Free = Gemini 2.5 Flash (~2 paise/dream). Paid = Gemini 2.5 Pro.
//
// SDK NOTE: this file uses `@google/generative-ai`. Your project already has a
// Gemini SDK installed; if it happens to be the newer `@google/genai`, only the
// import + call lines in THIS one file change — tell me and I'll swap it.
// KEY NOTE: set your Gemini key under one of the env names below (Vercel).
// =============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DreamExtraction, SubTypePicker } from './dream_engine_02_resolver';

const GEMINI_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  '';

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const FLASH = 'gemini-2.5-flash';
const PRO = 'gemini-2.5-pro';

function cleanJson(s: string): string {
  let t = s.replace(/```json/gi, '').replace(/```/g, '').trim();
  // Slice to the outermost JSON object in case the model adds stray prose.
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a !== -1 && b !== -1 && b > a) t = t.slice(a, b + 1);
  return t;
}

// ── The extraction prompt (Component 1). Gemini extracts SIGNALS only. ────────
const EXTRACTION_PROMPT = `You are the extraction unit of a Vedic Swapna Shastra (dream) engine.
Convert the user's dream into structured JSON signals ONLY. You DO NOT interpret
or give any meaning. Output ONLY the JSON object — no markdown, no commentary.

Map the dream to the closest symbol_key from this fixed VOCABULARY. Pick the best
primary_symbol; list any others as secondary_symbols. If nothing matches, set
primary_symbol to null and set category_fallback to the closest category.

VOCABULARY (symbol_key : category)
snake : snake
own_death, living_person_death, deceased_relative, funeral, corpse, cremation : death
deity_general, prasad, deity_blessing, vishnu, shiva, lakshmi, durga, hanuman, ganesha, saraswati, surya, deity_angry, idol_broken, temple : deity
water, drowning, river, flood, sea, rain, well, ganga : water
teeth, hair, flying, falling, chased, naked, blood : body
faeces, toilet, urine : bodily_function
intimacy, nude_desire, romantic : sexual
fight, attacked, wounded, weapon, war, argument, police : conflict
cat, cow, crow, dog, elephant, fish, horse, insects, lion, monkey, owl, peacock, scorpion : animal
birth_omen, dancing, eating, exam, exercise, foreign, gold, house, journey, loss, lost, makeup, marriage, money, monkey, pilgrimage, pregnancy, vehicle, wedding, worship_female_deity, worship_male_deity, cow : life_event
alcohol, bitter_food, cooking, eating, feast, feeding, hunger, meat, milk, overeating, prasad, rotten_served, sweet_food, sweets : food
earthquake, eclipse, fire, land, moon, mountain, rainbow, sky, star, stars, storm, sun, tree : celestial

RULES
- dreamer_context ∈ {general, unmarried, married, pregnant, student, non_student}. Non-general ONLY if clearly indicated.
- setting_occasion ∈ {general, temple, street, terahvi, enemy_house, friend_house, home, celebration}. Non-general ONLY if clearly indicated.
- emotional_tone ∈ {calm, fearful, joyful, neutral, distressed} — the feeling IN the dream.
- prahar_hint ∈ {brahma_muhurta, early_night, unknown} — only if time stated.
- recurrence = true only if the user signals the dream repeats.
- safety.minor_sexual = true if a minor is involved in any sexual/intimate way.
- safety.gender_identity_theme = true if the central theme is gender identity, transition, or same-gender intimacy.

Return exactly:
{"primary_symbol":null,"secondary_symbols":[],"category_fallback":"","descriptors":{"form":null,"action":null,"count":null},"dreamer_context":"general","setting_occasion":"general","emotional_tone":"neutral","prahar_hint":"unknown","recurrence":false,"safety":{"minor_sexual":false,"gender_identity_theme":false},"raw_dream_summary":""}`;

// ── 1) EXTRACTION (Flash, deterministic) ─────────────────────────────────────
export async function runExtraction(dreamText: string): Promise<DreamExtraction> {
  const model = genAI.getGenerativeModel({
    model: FLASH,
    // 2000 = headroom for Gemini 2.5 internal thinking + the ~200-token JSON.
    generationConfig: { temperature: 0, responseMimeType: 'application/json', maxOutputTokens: 2000 },
  });
  try {
    const res = await model.generateContent(`${EXTRACTION_PROMPT}\n\nDREAM:\n"${dreamText}"`);
    return JSON.parse(cleanJson(res.response.text())) as DreamExtraction;
  } catch (err) {
    console.error('[dream:extraction] failed, using category fallback:', err);
    // Safe fallback — treat as unmatched, no safety flags triggered
    return {
      primary_symbol: null,
      secondary_symbols: [],
      category_fallback: 'life_event',
      descriptors: { form: null, action: null, count: null },
      dreamer_context: 'general',
      setting_occasion: 'general',
      emotional_tone: 'neutral',
      prahar_hint: 'unknown',
      recurrence: false,
      safety: { minor_sexual: false, gender_identity_theme: false },
      raw_dream_summary: dreamText.slice(0, 120),
    };
  }
}

// ── 2) SUB-TYPE PICKER (Flash, deterministic, chooses only from candidates) ───
export function makeSubTypePicker(): SubTypePicker {
  return async (dreamSummary, extraction, candidates) => {
    const list = candidates.map((c) => `[id ${c.id}] "${c.sub_type}"`).join('\n');
    const prompt =
      'You are the sub-type selector for a Vedic dream engine. Choose the ONE candidate whose sub_type best matches the dream. You MUST choose from the list — never invent, never explain. Output ONLY the id number.\n\n' +
      `Dream: "${dreamSummary}"\n` +
      `Details: form=${extraction.descriptors.form}, action=${extraction.descriptors.action}, count=${extraction.descriptors.count}, tone=${extraction.emotional_tone}\n\n` +
      `Candidates:\n${list}\n\nOutput only the id number.`;
    const model = genAI.getGenerativeModel({
      model: FLASH,
      // NOTE: Gemini 2.5 spends internal "thinking" from this same budget.
      // A tiny cap (was 10) returned EMPTY text → silent fallback to the first
      // candidate row (wrong sub-types). 1024 gives thinking headroom; the
      // visible output is still just one id number.
      generationConfig: { temperature: 0, maxOutputTokens: 1024 },
    });
    try {
      const res = await model.generateContent(prompt);
      const m = res.response.text().match(/\d+/);
      const n = m ? parseInt(m[0], 10) : NaN;
      if (!Number.isFinite(n)) {
        console.error('[dream:picker] no id in response, falling back to first candidate');
        return candidates[0].id;
      }
      return n;
    } catch (err) {
      console.error('[dream:picker] error:', err);
      return candidates[0].id;
    }
  };
}

// ── 3) COMPOSER (Flash free / Pro paid) ──────────────────────────────────────
// Returns the GeminiComposeFn that Component 4 calls. Length + the free sales
// hook are owned by buildComposePrompt (Component 4). Token caps are generous
// so Gemini 2.5's internal "thinking" never eats the visible JSON output — this
// is what was silently forcing free readings to fall back to raw table text.
export function makeComposer(tier: 'free' | 'paid') {
  const modelName = tier === 'paid' ? PRO : FLASH;
  return async (prompt: string): Promise<string> => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.4,
        // Cap "thinking" so it can't consume the whole budget and starve the
        // JSON (the silent-truncation bug). Positive, never 0 (iron rule).
        // @ts-expect-error thinkingConfig is valid for 2.5 models in the SDK
        thinkingConfig: { thinkingBudget: tier === 'paid' ? 2048 : 512 },
        maxOutputTokens: tier === 'paid' ? 8192 : 3000,
      },
    });
    const res = await model.generateContent(prompt);
    const out = res.response.text();
    // Visibility: if output is empty/blocked, log the real reason (finishReason)
    // instead of silently falling back to table text.
    if (!out || out.trim().length === 0) {
      const fr = res.response.candidates?.[0]?.finishReason ?? 'UNKNOWN';
      console.error(`[dream:composer] empty output. tier=${tier} finishReason=${fr}`);
    }
    return out;
  };
}
