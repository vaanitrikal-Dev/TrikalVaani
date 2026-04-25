/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 1.0-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   Receives domain + birth data → builds chart → calls Gemini → returns JSON
 *   Gemini prompt lives in: lib/gemini-prompt.ts (built separately)
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildKundaliFromProkerala }  from '@/lib/prokerala';
import { buildKundali }               from '@/lib/swiss-ephemeris';
import { getDomainConfig }            from '@/lib/domain-config';
import type { BirthData }             from '@/lib/swiss-ephemeris';
import type { DomainId }              from '@/lib/domain-config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ─── REQUEST SHAPE ────────────────────────────────────────────────────────────
interface PredictRequest {
  domainId:    DomainId;
  birthData:   BirthData;
  userContext: {
    segment:    'genz' | 'millennial' | 'genx';
    employment: string;
    sector:     string;
    language:   'hindi' | 'hinglish' | 'english';
  };
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {

    // ── 1. Parse request ─────────────────────────────────────────────────────
    const body = await req.json() as PredictRequest;
    const { domainId, birthData, userContext } = body;

    // ── 2. Basic validation ──────────────────────────────────────────────────
    if (!domainId)         return NextResponse.json({ error: 'domainId required' },          { status: 400 });
    if (!birthData?.dob)   return NextResponse.json({ error: 'birthData.dob required' },     { status: 400 });
    if (!birthData?.lat)   return NextResponse.json({ error: 'birthData.lat required' },     { status: 400 });
    if (!GEMINI_API_KEY)   return NextResponse.json({ error: 'Gemini API key missing' },     { status: 500 });

    // ── 3. Validate domain exists ────────────────────────────────────────────
    let domain;
    try {
      domain = getDomainConfig(domainId);
    } catch {
      return NextResponse.json({ error: `Unknown domainId: ${domainId}` }, { status: 400 });
    }

    // ── 4. Build Kundali — Prokerala first, Meeus fallback ───────────────────
    let kundali;
    let chartSource = 'prokerala_swiss_ephemeris';

    try {
      kundali = await buildKundaliFromProkerala(birthData);
    } catch (err) {
      console.warn('[TV-Predict] Prokerala failed, using Meeus fallback:', err);
      kundali     = buildKundali(birthData);
      chartSource = 'meeus_fallback';
    }

    // ── 5. Build the prompt (imported from lib/gemini-prompt.ts) ─────────────
    // TODO: replace this placeholder once lib/gemini-prompt.ts is built
    const { buildPredictionPrompt } = await import('@/lib/gemini-prompt');
    const { systemPrompt, userMessage, useSearch } = buildPredictionPrompt(
      kundali,
      birthData,
      domain,
      userContext,
    );

    // ── 6. Call Gemini ───────────────────────────────────────────────────────
    const geminiBody: Record<string, unknown> = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents:           [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature:      0.4,
        maxOutputTokens:  4096,
        topP:             0.85,
        responseMimeType: 'application/json',
      },
    };

    // Inject Google Search grounding for market/realestate domains
    if (useSearch) {
      geminiBody['tools'] = [{ googleSearch: {} }];
    }

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('[TV-Predict] Gemini HTTP error:', err);
      return NextResponse.json({ error: 'Prediction engine unavailable' }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText    = geminiData?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? '')
      .join('') ?? '';

    if (!rawText) {
      return NextResponse.json({ error: 'Empty response from prediction engine' }, { status: 502 });
    }

    // ── 7. Parse JSON response ───────────────────────────────────────────────
    let prediction: Record<string, unknown>;
    try {
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      prediction    = JSON.parse(cleaned);
    } catch {
      console.error('[TV-Predict] JSON parse failed. Raw:', rawText.slice(0, 300));
      return NextResponse.json({ error: 'Invalid prediction format. Please retry.' }, { status: 502 });
    }

    // ── 8. Return enriched response ──────────────────────────────────────────
    return NextResponse.json({
      ...prediction,
      _meta: {
        domainId,
        chartSource,
        model: GEMINI_MODEL,
      },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TV-Predict] Unhandled:', msg);
    return NextResponse.json(
      { error: 'Cosmic disturbance. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── GET — health check ───────────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status:  'operational',
    engine:  'Trikal Vaani Predict v1.0',
    message: 'POST with domainId + birthData + userContext',
  });
}