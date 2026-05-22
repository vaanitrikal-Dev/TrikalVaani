/**
 * ============================================================
 * TRIKAL VAANI — Karmic Background Reading — Generate API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/karmic-reading/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Per Strategic Plan v2.0 §4 — Initiative C (Rs251 premium).
 *
 * PIPELINE (single person):
 *   VM /kundali (Swiss Ephemeris + Shadbala + D9 + dasha)
 *     -> buildKarmicReadingPrompt() [Parashara + Bhrigu interpretation]
 *     -> Gemini 2.5 Pro
 *     -> polishKarmicNarrative() [Claude Sonnet 4.6, tone-locked]
 *     -> save to karmic_readings
 *
 * Input: { slug } — slug of a PAID karmic order's reading row.
 * The reading row already holds person_data + language.
 * This route computes the chart, generates the 6-dimension reading, stores it.
 *
 * Mirrors the proven Milan narrative route: idempotency cache,
 * VM AbortController timeout, graceful errors.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildKarmicReadingPrompt } from '@/lib/karmic-reading-prompt';
import { polishKarmicNarrative }    from '@/lib/claude-polish';

// VM single-person chart endpoint (returns Shadbala + D9 + dasha)
const VM_KUNDALI_ENDPOINT =
  process.env.VM_KUNDALI_ENDPOINT ?? 'http://34.14.164.105:8001/kundali';

// Generation config (CEO LOCKED)
const GEMINI_MODEL   = 'gemini-2.5-pro';   // premium tier
const GEMINI_MAX_TOK = 12000;              // MAX_TOKENS CEO locked
const WORD_TARGET    = 1600;               // ~1400-1800 across 6 dimensions

type Language = 'hinglish' | 'hindi' | 'english';
const VALID_LANGUAGES: Language[] = ['hinglish', 'hindi', 'english'];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GEMINI_API_KEY first — GOOGLE_API_KEY is the Maps key (invalid for Gemini)
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? ''
);

interface KarmicRequest {
  slug: string;
}

interface PersonData {
  name:       string;
  dob:        string;   // YYYY-MM-DD
  tob:        string;   // HH:MM
  lat?:       number;
  latitude?:  number;
  lng?:       number;
  longitude?: number;
  timezone:   number;
  cityName?:  string;
  place?:     string;
}

// Build VM /kundali payload from person_data (BirthInput shape)
function buildKundaliPayload(p: PersonData) {
  const latitude  = p.latitude  ?? p.lat;
  const longitude = p.longitude ?? p.lng;
  const place     = p.place     ?? p.cityName ?? '';

  return {
    year:      Number(p.dob.slice(0, 4)),
    month:     Number(p.dob.slice(5, 7)),
    day:       Number(p.dob.slice(8, 10)),
    hour:      Number(p.tob.slice(0, 2)),
    minute:    Number(p.tob.slice(3, 5)),
    latitude:  latitude as number,
    longitude: longitude as number,
    timezone:  p.timezone,
    place,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: KarmicRequest = await req.json();
    const { slug } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }

    // Load the reading row (created by verify-payment)
    const { data: reading, error: loadErr } = await supabase
      .from('karmic_readings')
      .select('*')
      .eq('slug', slug)
      .single();

    if (loadErr || !reading) {
      console.error('[Trikal] Karmic reading row not found:', slug, loadErr?.message);
      return NextResponse.json({ error: 'Reading not found.' }, { status: 404 });
    }

    // Idempotency: return cached narrative if already generated
    if (reading.gemini_narrative && reading.gemini_narrative.length > 200) {
      return NextResponse.json({
        success:   true,
        slug,
        language:  reading.language,
        narrative: reading.gemini_narrative,
        cached:    true,
      });
    }

    // Resolve language (defensive; DB has CHECK constraint)
    const language: Language = VALID_LANGUAGES.includes(reading.language as Language)
      ? (reading.language as Language)
      : 'hinglish';

    const person = reading.person_data as PersonData;
    if (!person || !person.dob || !person.tob) {
      return NextResponse.json(
        { error: 'Reading data incomplete. Please contact support.' },
        { status: 500 }
      );
    }

    // 1) Compute full chart via VM /kundali (incl. Shadbala)
    let kundaliData: unknown = reading.kundali_data ?? null;

    if (!kundaliData) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      let vmRes: Response;
      try {
        vmRes = await fetch(VM_KUNDALI_ENDPOINT, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(buildKundaliPayload(person)),
          signal:  controller.signal,
          cache:   'no-store',
        });
      } catch (e: unknown) {
        clearTimeout(timeout);
        console.error('[Trikal] VM /kundali fetch failed:', e);
        return NextResponse.json(
          { error: 'Chart engine unreachable. Please try again — your payment is safe.' },
          { status: 502 }
        );
      }
      clearTimeout(timeout);

      if (!vmRes.ok) {
        const txt = await vmRes.text().catch(() => '');
        console.error('[Trikal] VM /kundali error:', vmRes.status, txt);
        return NextResponse.json(
          { error: 'Chart engine returned an error. Your payment is safe; we will retry.' },
          { status: 502 }
        );
      }

      kundaliData = await vmRes.json();

      // Persist the chart so a retry never recomputes
      await supabase
        .from('karmic_readings')
        .update({ kundali_data: kundaliData, updated_at: new Date().toISOString() })
        .eq('slug', slug);
    }

    // 2) Build the 6-dimension prompt (Parashara + Bhrigu interpretation)
    const personName  = person.name ?? 'This person';
    const personPlace = person.place ?? person.cityName ?? '';

    const prompt = buildKarmicReadingPrompt({
      person_name:  personName,
      person_place: personPlace,
      kundali_data: kundaliData,
      word_target:  WORD_TARGET,
      language,
    });

    // 3) Gemini 2.5 Pro
    let geminiText = '';
    try {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          maxOutputTokens: GEMINI_MAX_TOK,
          temperature:     0.85,
          topP:            0.95,
        },
        // Iron Rule: never set thinkingBudget:0
      });

      const result = await model.generateContent(prompt);
      geminiText   = result.response.text();

      if (!geminiText || geminiText.length < 300) {
        throw new Error('Gemini returned empty or too-short response.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown Gemini error';
      console.error('[Trikal] Karmic Gemini error:', msg);
      return NextResponse.json(
        { error: 'Reading engine failed. Please refresh — your payment is safe and we will retry.' },
        { status: 502 }
      );
    }

    // 4) Claude Sonnet 4.6 polish (tone-locked, language-locked)
    let finalText = geminiText;
    let didPolish = false;
    let polishMs  = 0;

    const polishResult = await polishKarmicNarrative({
      rawNarrative: geminiText,
      language,
    });

    finalText = polishResult.narrative;
    didPolish = polishResult.polished;
    polishMs  = polishResult.polishMs ?? 0;

    if (!polishResult.polished && polishResult.error) {
      console.warn('[Trikal] Karmic polish skipped:', polishResult.error);
    }

    // 5) Extract a GEO answer (first non-marker line) for the page
    const geoAnswer = finalText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .find((l) => !l.startsWith('═══')) ?? '';

    // 6) Save
    const { error: saveErr } = await supabase
      .from('karmic_readings')
      .update({
        gemini_narrative: finalText,
        geo_answer:       geoAnswer.slice(0, 400),
        updated_at:       new Date().toISOString(),
      })
      .eq('slug', slug);

    if (saveErr) {
      console.error('[Trikal] Karmic narrative save failed:', saveErr.message);
    }

    return NextResponse.json({
      success:   true,
      slug,
      language,
      narrative: finalText,
      cached:    false,
      polished:  didPolish,
      polishMs,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Trikal] /api/karmic-reading error:', msg);
    return NextResponse.json(
      { error: 'Server error generating reading.' },
      { status: 500 }
    );
  }
}
