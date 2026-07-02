// =============================================================================
// TRIKAAL VAANI · Dream Engine · Component 3: THE MODIFIER LAYER (Layer 3)
// -----------------------------------------------------------------------------
// Takes the matched row (Component 2) + the extraction (Component 1) and tunes
// it into a final "ResolvedReading" that the composer (Component 4) turns into
// prose. This layer does NOT write text and has NO external connections
// (no Supabase, no Gemini) — it is pure, deterministic logic.
//
// It applies three real Jyotish modifiers:
//   1. FLIP        — resolves auspicious/inauspicious using the dreamer's tone
//   2. PRAHAR      — weights the signal by WHEN the dream came (Brahma-muhurta ↑)
//   3. RECURRENCE  — flags a deeper pattern (Kaal Sarp / Pitra Dosha funnels)
// =============================================================================

import type { DreamExtraction, DreamRow } from './dream_engine_02_resolver';

// ---- What the composer (Component 4) receives --------------------------------
export interface ResolvedReading {
  meaning_en: string;
  meaning_hi: string;

  effective_tendency: 'auspicious' | 'inauspicious' | 'balanced';
  flip_applied: boolean;

  signal_strength: 'high' | 'normal' | 'low';
  prahar_note_en: string;
  prahar_note_hi: string;

  emphasize_recurrence: boolean;
  recurrence_target: string | null;

  graha: string | null;
  life_area: string | null;

  match_level: 'exact' | 'category_fallback';
  tentative: boolean;

  paid_hook: string;
  confidence_tier: string;
  public_citation: string | null;
  source_ref: string;

  disclaimer_tags: string[];
}

// =============================================================================
// MAIN ENTRY
// =============================================================================
export function applyModifiers(
  row: DreamRow,
  extraction: DreamExtraction,
  matchLevel: 'exact' | 'category_fallback'
): ResolvedReading {
  const [effective_tendency, flip_applied] = resolveTendency(
    row.base_tendency,
    row.flip_allowed,
    extraction.emotional_tone
  );

  const signal_strength = computeSignalStrength(row.prahar_weight, extraction.prahar_hint);
  const { en: prahar_note_en, hi: prahar_note_hi } = praharNote(extraction.prahar_hint);

  const emphasize_recurrence = Boolean(extraction.recurrence && row.recurrence_flag);
  const recurrence_target = emphasize_recurrence ? row.recurrence_target ?? null : null;

  const tentative = matchLevel === 'category_fallback' || signal_strength === 'low';

  const disclaimer_tags = (row.disclaimer_tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t !== 'none');

  return {
    meaning_en: row.meaning_en,
    meaning_hi: row.meaning_hi,
    effective_tendency,
    flip_applied,
    signal_strength,
    prahar_note_en,
    prahar_note_hi,
    emphasize_recurrence,
    recurrence_target,
    graha: row.graha,
    life_area: row.life_area,
    match_level: matchLevel,
    tentative,
    paid_hook: row.paid_hook,
    confidence_tier: row.confidence_tier,
    public_citation: row.public_citation,
    source_ref: row.source_ref,
    disclaimer_tags,
  };
}

// =============================================================================
// 1) FLIP — how the dreamer's feeling resolves the direction
//    base_tendency is the default lean; flip_allowed says tone may invert it.
//    context_dependent fully resolves by tone; a directional base only SOFTENS
//    (never wildly inverts), and locks completely when flip_allowed = false.
// =============================================================================
function resolveTendency(
  base: string,
  flipAllowed: boolean,
  tone: string
): ['auspicious' | 'inauspicious' | 'balanced', boolean] {
  const calmSide = tone === 'calm' || tone === 'joyful';
  const fearSide = tone === 'fearful' || tone === 'distressed';

  if (base === 'context_dependent') {
    if (calmSide) return ['auspicious', true];
    if (fearSide) return ['inauspicious', true];
    return ['balanced', false]; // neutral tone → sit in the middle
  }

  if (!flipAllowed) {
    return [base === 'auspicious' ? 'auspicious' : 'inauspicious', false];
  }

  // directional base with flip allowed → tone can soften to balanced
  if (base === 'auspicious') {
    return fearSide ? ['balanced', true] : ['auspicious', false];
  }
  if (base === 'inauspicious') {
    return calmSide ? ['balanced', true] : ['inauspicious', false];
  }
  return ['balanced', false];
}

// =============================================================================
// 2) PRAHAR — weight the signal by when the dream came.
//    Row's prahar_weight = the symbol's inherent strength.
//    prahar_hint = the actual time the user reported.
// =============================================================================
function computeSignalStrength(
  praharWeight: string,
  praharHint: string
): 'high' | 'normal' | 'low' {
  let level = praharWeight === 'lean_high' ? 3 : praharWeight === 'lean_low' ? 1 : 2;
  if (praharHint === 'brahma_muhurta') level = Math.min(3, level + 1);
  else if (praharHint === 'early_night') level = Math.max(1, level - 1);
  return level >= 3 ? 'high' : level === 2 ? 'normal' : 'low';
}

function praharNote(praharHint: string): { en: string; hi: string } {
  if (praharHint === 'brahma_muhurta') {
    return {
      en: 'This dream came in the Brahma-muhurta (pre-dawn) — the tradition holds such dreams as the most telling, so its signal is taken seriously.',
      hi: 'यह स्वप्न ब्रह्म-मुहूर्त (भोर) में आया — परंपरा इसे सबसे प्रभावशाली मानती है, इसलिए इसका संकेत गंभीरता से लिया जाता है।',
    };
  }
  if (praharHint === 'early_night') {
    return {
      en: 'This dream came in the early night; such dreams are held to be lighter and less firm in what they indicate.',
      hi: 'यह स्वप्न रात्रि के आरंभ में आया; ऐसे स्वप्न हल्के और कम निश्चित माने जाते हैं।',
    };
  }
  return { en: '', hi: '' };
}
