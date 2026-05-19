/**
 * ============================================================
 * TRIKAL VAANI — Milan Narrative Generator API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/milan-narrative/route.ts
 * VERSION: 1.1 — Wired to polishMilanNarrative (claude-polish.ts v2.2)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Called from /milan/[slug] result page after payment verification.
 *
 * Flow:
 *   1. Load Milan record by slug from Supabase
 *   2. If gemini_narrative already exists → return cached (idempotent)
 *   3. Pick model by tier:
 *        basic_51         → Gemini 2.5 Flash · MAX_TOKENS=4000  · ~400w
 *        deep_101_couple  → Gemini 2.5 Pro   · MAX_TOKENS=8000  · ~1000w
 *        deep_101_parent  → Gemini 2.5 Pro   · MAX_TOKENS=8000  · ~1000w
 *        both_151         → Gemini 2.5 Pro   · MAX_TOKENS=12000 · ~1500w
 *   4. Pick prompt by audience: couple | parent | both
 *   5. Generate via Gemini → polish via Claude Sonnet 4.6 (polishMilanNarrative)
 *   6. Save to kundali_milan.gemini_narrative
 *   7. Return narrative to result page
 *
 * Iron Rule: NEVER set thinkingBudget:0
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildMilanCouplePrompt } from '@/lib/kundali-milan-prompt-couple';
import { buildMilanParentPrompt } from '@/lib/kundali-milan-prompt-parent';
import { buildMilanBothPrompt }   from '@/lib/kundali-milan-prompt-both';
import { polishMilanNarrative }   from '@/lib/claude-polish';

// ── Tier configuration (CEO LOCKED) ──────────────────────────
type Tier      = 'basic_51' | 'deep_101_couple' | 'deep_101_parent' | 'both_151';
type Audience  = 'couple' | 'parent' | 'both';

interface TierConfig {
  model:       string;
  maxTokens:   number;
  wordTarget:  number;
  usePolish:   boolean;
}

const TIER_CONFIG: Record<Tier, TierConfig> = {
  basic_51: {
    model:      'gemini-2.5-flash',
    maxTokens:  4000,
    wordTarget: 400,
    usePolish:  true,
  },
  deep_101_couple: {
    model:      'gemini-2.5-pro',
    maxTokens:  8000,
    wordTarget: 1000,
    usePolish:  true,
  },
  deep_101_parent: {
    model:      'gemini-2.5-pro',
    maxTokens:  8000,
    wordTarget: 1000,
    usePolish:  true,
  },
  both_151: {
    model:      'gemini-2.5-pro',
    maxTokens:  12000,
    wordTarget: 1500,
    usePolish:  true,
  },
};

// ── Clients ──────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? ''
);

// ── Request shape ────────────────────────────────────────────
interface NarrativeRequest {
  slug: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: NarrativeRequest = await req.json();
    const { slug } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }

    // ── Load Milan record ──────────────────────────────────
    const { data: milan, error: loadErr } = await supabase
      .from('kundali_milan')
      .select('*')
      .eq('slug', slug)
      .single();

    if (loadErr || !milan) {
      console.error('[Trikal] Milan record not found:', slug, loadErr?.message);
      return NextResponse.json({ error: 'Reading not found.' }, { status: 404 });
    }

    // ── Idempotency: return cached narrative if exists ─────
    if (milan.gemini_narrative && milan.gemini_narrative.length > 200) {
      return NextResponse.json({
        success:   true,
        slug,
        tier:      milan.tier,
        audience:  milan.audience,
        narrative: milan.gemini_narrative,
        cached:    true,
      });
    }

    // ── Validate tier + audience ───────────────────────────
    const tier     = milan.tier     as Tier;
    const audience = milan.audience as Audience;

    if (!TIER_CONFIG[tier]) {
      return NextResponse.json({ error: 'Invalid tier on record.' }, { status: 500 });
    }

    if (!['couple', 'parent', 'both'].includes(audience)) {
      return NextResponse.json({ error: 'Invalid audience on record.' }, { status: 500 });
    }

    const cfg = TIER_CONFIG[tier];

    // ── Engine data sanity ─────────────────────────────────
    if (!milan.ashtakoot_data || !milan.manglik_data || !milan.remedies_data) {
      console.error('[Trikal] Milan engine data missing for slug:', slug);
      return NextResponse.json(
        { error: 'Reading data incomplete. Please contact support.' },
        { status: 500 }
      );
    }

    // ── Build the prompt by audience ───────────────────────
    const bride = milan.bride_data;
    const groom = milan.groom_data;

    let prompt: string;

    if (audience === 'couple') {
      prompt = buildMilanCouplePrompt({
        bride_name:      bride.name,
        groom_name:      groom.name,
        bride_place:     bride.place,
        groom_place:     groom.place,
        ashtakoot_score: milan.ashtakoot_score ?? 0,
        ashtakoot_data:  milan.ashtakoot_data,
        manglik_data:    milan.manglik_data,
        remedies_data:   milan.remedies_data,
        tier:            tier as 'basic_51' | 'deep_101_couple' | 'both_151',
        word_target:     cfg.wordTarget,
      });
    } else if (audience === 'parent') {
      prompt = buildMilanParentPrompt({
        bride_name:      bride.name,
        groom_name:      groom.name,
        bride_place:     bride.place,
        groom_place:     groom.place,
        ashtakoot_score: milan.ashtakoot_score ?? 0,
        ashtakoot_data:  milan.ashtakoot_data,
        manglik_data:    milan.manglik_data,
        remedies_data:   milan.remedies_data,
        tier:            tier as 'basic_51' | 'deep_101_parent' | 'both_151',
        word_target:     cfg.wordTarget,
      });
    } else {
      // audience === 'both'
      prompt = buildMilanBothPrompt({
        bride_name:      bride.name,
        groom_name:      groom.name,
        bride_place:     bride.place,
        groom_place:     groom.place,
        ashtakoot_score: milan.ashtakoot_score ?? 0,
        ashtakoot_data:  milan.ashtakoot_data,
        manglik_data:    milan.manglik_data,
        remedies_data:   milan.remedies_data,
        word_target:     cfg.wordTarget,
      });
    }

    // ── Call Gemini ────────────────────────────────────────
    let geminiText = '';
    try {
      const model = genAI.getGenerativeModel({
        model: cfg.model,
        generationConfig: {
          maxOutputTokens: cfg.maxTokens,
          temperature:     0.85,
          topP:            0.95,
        },
        // Iron Rule: never set thinkingBudget:0
      });

      const result = await model.generateContent(prompt);
      geminiText   = result.response.text();

      if (!geminiText || geminiText.length < 200) {
        throw new Error('Gemini returned empty or too-short response.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown Gemini error';
      console.error('[Trikal] Gemini error:', msg);
      return NextResponse.json(
        { error: 'Narrative engine failed. Please refresh — your payment is safe and we will retry.' },
        { status: 502 }
      );
    }

    // ── Claude Sonnet 4.6 polish via polishMilanNarrative ──
    let finalText  = geminiText;
    let polishMs   = 0;
    let didPolish  = false;

    if (cfg.usePolish) {
      const polishResult = await polishMilanNarrative({
        rawNarrative: geminiText,
        audience,
        tier,
      });

      finalText = polishResult.narrative;       // graceful: raw if polish failed
      polishMs  = polishResult.polishMs ?? 0;
      didPolish = polishResult.polished;

      if (!polishResult.polished && polishResult.error) {
        console.warn('[Trikal] Milan polish skipped:', polishResult.error);
      }
    }

    // ── Save to Supabase ───────────────────────────────────
    const { error: saveErr } = await supabase
      .from('kundali_milan')
      .update({
        gemini_narrative: finalText,
        updated_at:       new Date().toISOString(),
      })
      .eq('slug', slug);

    if (saveErr) {
      console.error('[Trikal] Milan narrative save failed:', saveErr.message);
      // Still return — user shouldn't lose the reading
    }

    return NextResponse.json({
      success:   true,
      slug,
      tier,
      audience,
      narrative: finalText,
      cached:    false,
      polished:  didPolish,
      polishMs,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Trikal] /api/milan-narrative error:', msg);
    return NextResponse.json(
      { error: 'Server error generating narrative.' },
      { status: 500 }
    );
  }
}
