// =============================================================================
// TRIKAAL VAANI · Dream Engine · Component 2: THE RESOLVER
// -----------------------------------------------------------------------------
// Takes the extraction JSON (Component 1) and returns the ONE matched table row
// that will be composed into a reading. Meaning always comes from the table —
// this file only *finds* the right row, it never invents meaning.
//
// Runs on Vercel (TypeScript). Reads Supabase (public-read RLS = anon key is
// fine). The Supabase client and the Gemini sub-type picker are passed IN
// (dependency injection) so this file stays decoupled and wires cleanly later.
//
// Independent of the locked gemini-prompt.ts. Never modifies it.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';

// ---- Shape of the extraction handed over by Component 1 ----------------------
export interface DreamExtraction {
  primary_symbol: string | null;
  secondary_symbols: string[];
  category_fallback: string;
  descriptors: { form: string | null; action: string | null; count: string | null };
  dreamer_context: string;   // general|unmarried|married|pregnant|student|non_student
  setting_occasion: string;  // general|temple|street|terahvi|enemy_house|friend_house|home|celebration
  emotional_tone: string;    // calm|fearful|joyful|neutral|distressed
  prahar_hint: string;       // brahma_muhurta|early_night|unknown
  recurrence: boolean;
  safety: { minor_sexual: boolean; gender_identity_theme: boolean };
  raw_dream_summary: string;
}

// ---- A row from dream_symbols (only the columns the engine uses) -------------
export interface DreamRow {
  id: number;
  category: string;
  symbol_key: string;
  symbol_en: string;
  symbol_hi: string;
  sub_type: string;
  dreamer_context: string;
  setting_occasion: string;
  base_tendency: string;      // auspicious|inauspicious|context_dependent
  flip_allowed: boolean;
  meaning_en: string;
  meaning_hi: string;
  graha: string | null;
  life_area: string | null;
  prahar_weight: string;      // lean_high|standard|lean_low
  recurrence_flag: boolean;
  recurrence_target: string | null;
  paid_hook: string;
  remedy_free: string | null;
  source_ref: string;
  confidence_tier: string;
  public_citation: string | null;
  disclaimer_tags: string;
}

// ---- What the resolver returns ----------------------------------------------
export type ResolveResult =
  | { status: 'refuse_minor' }                                             // Rule 0 hard stop
  | { status: 'gender_silent' }                                            // Rule 0 honest fallback
  | { status: 'matched'; row: DreamRow; matchLevel: 'exact' | 'category_fallback' }
  | { status: 'no_match'; category: string };                             // nothing found (rare)

// ---- The constrained Gemini picker (injected). MUST return an id that is one
//      of the candidate rows. Reference prompt is at the bottom of this file. --
export type SubTypePicker = (
  dreamSummary: string,
  extraction: DreamExtraction,
  candidates: DreamRow[]
) => Promise<number>;

const COLS =
  'id,category,symbol_key,symbol_en,symbol_hi,sub_type,dreamer_context,setting_occasion,' +
  'base_tendency,flip_allowed,meaning_en,meaning_hi,graha,life_area,prahar_weight,' +
  'recurrence_flag,recurrence_target,paid_hook,remedy_free,source_ref,confidence_tier,' +
  'public_citation,disclaimer_tags';

// =============================================================================
// MAIN ENTRY
// =============================================================================
export async function resolveDream(
  extraction: DreamExtraction,
  supabase: SupabaseClient,
  pickSubType: SubTypePicker
): Promise<ResolveResult> {
  // --- 1) Rule 0 safety gates FIRST — before any database lookup ---
  if (extraction.safety?.minor_sexual) return { status: 'refuse_minor' };
  if (extraction.safety?.gender_identity_theme) return { status: 'gender_silent' };

  // --- Build the context/setting filters (always include 'general') ---
  const ctxFilter = ['general'];
  if (extraction.dreamer_context && extraction.dreamer_context !== 'general') {
    ctxFilter.push(extraction.dreamer_context);
  }
  const setFilter = ['general'];
  if (extraction.setting_occasion && extraction.setting_occasion !== 'general') {
    setFilter.push(extraction.setting_occasion);
  }

  // --- 2) Layer 1: look up the primary symbol ---
  if (extraction.primary_symbol) {
    const { data, error } = await supabase
      .from('dream_symbols')
      .select(COLS)
      .eq('symbol_key', extraction.primary_symbol)
      .in('dreamer_context', ctxFilter)
      .in('setting_occasion', setFilter);
    if (error) throw error;

    const rows = (data ?? []) as unknown as DreamRow[];

    if (rows.length === 1) {
      return { status: 'matched', row: rows[0], matchLevel: 'exact' };
    }
    if (rows.length > 1) {
      // Prefer the most context/setting-specific rows, then let Gemini pick the sub_type
      const ranked = rankBySpecificity(rows, extraction);
      const chosenId = await pickSubType(extraction.raw_dream_summary, extraction, ranked);
      const chosen = ranked.find((r) => r.id === chosenId) ?? ranked[0];
      return { status: 'matched', row: chosen, matchLevel: 'exact' };
    }
    // primary symbol produced no rows under these filters → fall through to Layer 2
  }

  // --- 3) Layer 2: category fallback (never leave the user with nothing) ---
  const cat = extraction.category_fallback;
  if (cat) {
    const { data, error } = await supabase
      .from('dream_symbols')
      .select(COLS)
      .eq('category', cat)
      .eq('dreamer_context', 'general')
      .eq('setting_occasion', 'general');
    if (error) throw error;

    const rows = (data ?? []) as unknown as DreamRow[];
    if (rows.length > 0) {
      const chosenId = await pickSubType(extraction.raw_dream_summary, extraction, rows);
      const chosen = rows.find((r) => r.id === chosenId) ?? rows[0];
      return { status: 'matched', row: chosen, matchLevel: 'category_fallback' };
    }
  }

  // --- 4) Genuinely nothing (should be very rare) ---
  return { status: 'no_match', category: cat ?? 'unknown' };
}

// =============================================================================
// Rank candidates: a row that matches the dreamer's specific context/setting
// beats a 'general' row. (A pregnant dreamer's cow row beats the generic cow.)
// =============================================================================
function rankBySpecificity(rows: DreamRow[], ex: DreamExtraction): DreamRow[] {
  const score = (r: DreamRow) =>
    (r.dreamer_context === ex.dreamer_context && ex.dreamer_context !== 'general' ? 2 : 0) +
    (r.setting_occasion === ex.setting_occasion && ex.setting_occasion !== 'general' ? 1 : 0);
  return [...rows].sort((a, b) => score(b) - score(a));
}

// =============================================================================
// REFERENCE: the constrained sub-type picker prompt (wired at Component 5 with
// your Gemini setup). Gemini chooses ONLY from the candidate rows — never invents.
// -----------------------------------------------------------------------------
// You are the sub-type selector of a Vedic dream engine. You are given the
// user's dream and a NUMBERED list of candidate interpretations from our
// database. Choose the ONE whose sub_type best matches the dream's specific
// details (form, action, count, feeling). You MUST choose from the list —
// never invent, never explain. Output ONLY the chosen id as a bare number.
//
// Dream: "<raw_dream_summary>"
// Details: form=<form>, action=<action>, count=<count>, tone=<tone>
//
// Candidates:
// [id 41] "Snake biting you"
// [id 42] "Snake entering the house"
// ...
//
// Output only the id number.
// =============================================================================
