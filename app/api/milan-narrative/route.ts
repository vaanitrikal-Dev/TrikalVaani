/**
 * ============================================================
 * TRIKAL VAANI — Milan Narrative Generator API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/milan-narrative/route.ts
 * VERSION: 1.5
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * CHANGE LOG (v1.4 → v1.5):
 *   Pass `language` into polishMilanNarrative() so Claude Sonnet preserves
 *   the language and never translates/drifts. Closes the language chain
 *   end-to-end (builders → Gemini → Sonnet polish all language-locked).
 *
 * CHANGE LOG (v1.3 → v1.4):
 *   WIRE LANGUAGE: read milan.language ('hinglish' | 'hindi' | 'english'),
 *   default 'hinglish', pass into all 3 prompt builders. Pass `tier` into
 *   buildMilanBothPrompt.
 *
 * CHANGE LOG (v1.1 → v1.3):
 *   FIX 1: API key order corrected — GEMINI_API_KEY first, GOOGLE_API_KEY second.
 *   FIX 2: manglik_data removed from hard require gate (null → safe fallback).
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
type Language  = 'hinglish' | 'hindi' | 'english';

interface TierConfig {
  model:       string;
  maxTokens:   number;
  wordTarget:  number;
  usePolish:   boolean;
}

const TIER_CONFIG: Record<Tier, TierConfig> = {
  basic_51:        { model: 'gemini-2.5-flash', maxTokens: 4000,  wordTarget: 400,  usePolish: true },
  deep_101_couple: { model: 'gemini-2.5-pro',   maxTokens: 8000,  wordTarget: 1000, usePolish: true },
  deep_101_parent: { model: 'gemini-2.5-pro',   maxTokens: 8000,  wordTarget: 1000, usePolish: true },
  both_151:        { model: 'gemini-2.5-pro',   maxTokens: 12000, wordTarget: 1500, usePolish: true },
};

// ── Valid language whitelist (defensive) ─────────────────────
const VALID_LANGUAGES: Language[] = ['hinglish', 'hindi', 'english'];

// ── Safe fallback for manglik_data when null/missing ─────────
const MANGLIK_FALLBACK = {
  evaluated:     false,
  bride:         { is_manglik: null, strength: 'Not evaluated' },
  groom:         { is_manglik: null, strength: 'Not evaluated' },
  combined:      { status: 'NONE', verdict: 'Manglik evaluation not available.', verdict_hi: '', recommendation: '' },
};

// ── Clients ──────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// FIX 1: GEMINI_API_KEY first — GOOGLE_API_KEY is Maps key, invalid for Gemini
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? ''
);

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

    // ── Resolve language (WIRE v1.4) ───────────────────────
    // DB column has a CHECK constraint, but we defend here too.
    const language: Language = VALID_LANGUAGES.includes(milan.language as Language)
      ? (milan.language as Language)
      : 'hinglish';

    const cfg = TIER_CONFIG[tier];

    // ── Engine data sanity — manglik_data now OPTIONAL ─────
    if (!milan.ashtakoot_data || !milan.remedies_data) {
      console.error('[Trikal] Milan core engine data missing for slug:', slug);
      return NextResponse.json(
        { error: 'Reading data incomplete. Please contact support.' },
        { status: 500 }
      );
    }

    const manglikData = milan.manglik_data ?? MANGLIK_FALLBACK;
    if (!milan.manglik_data) {
      console.warn('[Trikal] manglik_data null for slug — using fallback:', slug);
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
        manglik_data:    manglikData,
        remedies_data:   milan.remedies_data,
        tier:            tier as 'basic_51' | 'deep_101_couple' | 'both_151',
        word_target:     cfg.wordTarget,
        language,
      });
    } else if (audience === 'parent') {
      prompt = buildMilanParentPrompt({
        bride_name:      bride.name,
        groom_name:      groom.name,
        bride_place:     bride.place,
        groom_place:     groom.place,
        ashtakoot_score: milan.ashtakoot_score ?? 0,
        ashtakoot_data:  milan.ashtakoot_data,
        manglik_data:    manglikData,
        remedies_data:   milan.remedies_data,
        tier:            tier as 'basic_51' | 'deep_101_parent' | 'both_151',
        word_target:     cfg.wordTarget,
        language,
      });
    } else {
      prompt = buildMilanBothPrompt({
        bride_name:      bride.name,
        groom_name:      groom.name,
        bride_place:     bride.place,
        groom_place:     groom.place,
        ashtakoot_score: milan.ashtakoot_score ?? 0,
        ashtakoot_data:  milan.ashtakoot_data,
        manglik_data:    manglikData,
        remedies_data:   milan.remedies_data,
        word_target:     cfg.wordTarget,
        tier:            tier as 'basic_51' | 'both_151',
        language,
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
    let finalText = geminiText;
    let polishMs  = 0;
    let didPolish = false;

    if (cfg.usePolish) {
      const polishResult = await polishMilanNarrative({
        rawNarrative: geminiText,
        audience,
        tier,
        language,           // v1.5 — preserve language, no drift in polish
      });

      finalText = polishResult.narrative;
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
    }

    return NextResponse.json({
      success:   true,
      slug,
      tier,
      audience,
      language,
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
