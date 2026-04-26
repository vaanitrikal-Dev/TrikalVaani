/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 3.1 — Swiss Ephemeris ONLY + Timeout Fix
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDomainConfig } from '@/lib/domain-config';
import { buildPredictionPrompt } from '@/lib/gemini-prompt';
import type { DomainId } from '@/lib/domain-config';
import type { UserTier, UserContext } from '@/lib/gemini-prompt';

// ── Allow 30s for this route (Render cold start fix) ─────────────────────────
export const maxDuration = 30;

// ── Constants ─────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_MODEL   = 'gemini-2.5-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const EPHE_API_URL   = process.env.EPHE_API_URL ?? '';
const EPHE_API_KEY   = process.env.EPHE_API_KEY ?? '';

const MAX_TOKENS: Record<UserTier, number> = {
  free:    4096,
  basic:   8192,
  pro:     8192,
  premium: 8192,
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface BirthData {
  dob: string;       // "YYYY-MM-DD"
  tob: string;       // "HH:MM"
  lat: number;
  lng: number;
  cityName?: string;
  timezone?: number; // UTC offset, default 5.5
  ayanamsa?: string;
}

interface PredictRequest {
  userId?:    string;
  sessionId:  string;
  domainId:   DomainId;
  birthData:  BirthData;
  userContext: {
    segment:       'genz' | 'millennial' | 'genx';
    employment:    string;
    sector:        string;
    language:      'hindi' | 'hinglish' | 'english';
    city?:         string;
    businessName?: string;
    person2Name?:  string;
    person2City?:  string;
  };
}

// ── Tier Fetcher ──────────────────────────────────────────────────────────────

async function getVerifiedTier(userId: string): Promise<UserTier> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('tier, tier_expires_at')
      .eq('id', userId)
      .single();

    if (error || !data) return 'free';

    if (data.tier_expires_at && new Date(data.tier_expires_at) < new Date()) {
      return 'free';
    }

    const validTiers: UserTier[] = ['free', 'basic', 'pro', 'premium'];
    return validTiers.includes(data.tier) ? data.tier : 'free';
  } catch {
    return 'free';
  }
}

// ── Swiss Ephemeris Chart Builder ─────────────────────────────────────────────

async function buildKundaliFromSwiss(birthData: BirthData) {
  if (!EPHE_API_URL) throw new Error('EPHE_API_URL not configured');

  const [year, month, day] = birthData.dob.split('-').map(Number);
  const [hour, minute]     = birthData.tob.split(':').map(Number);

  const payload = {
    year, month, day,
    hour, minute, second: 0,
    latitude:  birthData.lat,
    longitude: birthData.lng,
    timezone:  birthData.timezone ?? 5.5,
    ayanamsa:  birthData.ayanamsa ?? 'lahiri',
  };

  const res = await fetch(`${EPHE_API_URL}/kundali`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(EPHE_API_KEY ? { 'X-Api-Key': EPHE_API_KEY } : {}),
    },
    body:   JSON.stringify(payload),
    signal: AbortSignal.timeout(25000), // ← 25s timeout for Render cold start
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Swiss API error: ${err.detail ?? res.statusText}`);
  }

  const chart = await res.json();

  // Normalize to match gemini-prompt expectations
  return {
    lagna:             chart.lagna?.sign ?? 'Unknown',
    lagnaLord:         chart.lagna?.sign_lord ?? 'Unknown',
    nakshatra:         chart.grahas?.find((g: any) => g.planet === 'Moon')?.nakshatra ?? 'Unknown',
    moonSign:          chart.grahas?.find((g: any) => g.planet === 'Moon')?.sign ?? 'Unknown',
    sunSign:           chart.grahas?.find((g: any) => g.planet === 'Sun')?.sign ?? 'Unknown',
    currentMahadasha:  { lord: chart.dasha?.maha_dasha?.find((d: any) => d.is_current)?.planet ?? 'Unknown' },
    currentAntardasha: { lord: chart.dasha?.maha_dasha?.find((d: any) => d.is_current)?.antar?.find((a: any) => a.is_current)?.planet ?? 'Unknown' },
    grahas:            chart.grahas ?? [],
    bhavas:            chart.bhavas ?? [],
    yogas:             chart.yogas ?? [],
    rawChart:          chart,
  };
}

// ── Main Handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json() as PredictRequest;
    const { userId, sessionId, domainId, birthData, userContext } = body;

    // Validate
    if (!sessionId)      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    if (!domainId)       return NextResponse.json({ error: 'domainId required' }, { status: 400 });
    if (!birthData?.dob) return NextResponse.json({ error: 'birthData.dob required' }, { status: 400 });
    if (!birthData?.lat) return NextResponse.json({ error: 'birthData.lat required' }, { status: 400 });
    if (!GEMINI_API_KEY) return NextResponse.json({ error: 'Prediction engine not configured' }, { status: 500 });

    // Tier
    const verifiedTier = userId ? await getVerifiedTier(userId) : 'free';

    // Domain
    let domain;
    try {
      domain = getDomainConfig(domainId);
    } catch {
      return NextResponse.json({ error: `Unknown domainId: ${domainId}` }, { status: 400 });
    }

    // Chart — Swiss Ephemeris ONLY
    let kundali;
    try {
      kundali = await buildKundaliFromSwiss(birthData);
      console.log(`[TV-Predict] Swiss chart built for ${domainId}`);
    } catch (err) {
      console.error('[TV-Predict] Swiss Ephemeris failed:', err);
      return NextResponse.json(
        { error: 'Chart calculation failed. Please check birth details and try again.' },
        { status: 502 }
      );
    }

    // User context
    const verifiedUserContext: UserContext = {
      tier:         verifiedTier,
      segment:      userContext.segment    || 'millennial',
      employment:   userContext.employment || '',
      sector:       userContext.sector     || '',
      language:     userContext.language   || 'hinglish',
      city:         userContext.city       || birthData.cityName || 'India',
      businessName: userContext.businessName,
      person2Name:  userContext.person2Name,
      person2City:  userContext.person2City,
    };

    // Gemini prompt
    const { systemPrompt, userMessage, useSearch } = buildPredictionPrompt(
      kundali, birthData, domain, verifiedUserContext
    );

    // Gemini call
    const geminiBody: Record<string, unknown> = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature:      0.4,
        maxOutputTokens:  MAX_TOKENS[verifiedTier],
        topP:             0.85,
        responseMimeType: 'application/json',
      },
    };

    if (useSearch) geminiBody['tools'] = [{ googleSearch: {} }];

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      console.error(`[TV-Predict] Gemini HTTP ${geminiRes.status}`);
      return NextResponse.json({ error: 'Prediction engine unavailable' }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? '')
      .join('') ?? '';

    if (!rawText) return NextResponse.json({ error: 'Empty prediction response' }, { status: 502 });

    // Parse JSON from Gemini
    let prediction: Record<string, unknown>;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim();
      prediction = JSON.parse(cleaned);
    } catch {
      console.error('[TV-Predict] JSON parse failed:', rawText.slice(0, 300));
      return NextResponse.json({ error: 'Invalid prediction format. Please retry.' }, { status: 502 });
    }

    return NextResponse.json({
      ...prediction,
      _meta: {
        domainId,
        tier:         verifiedTier,
        chartSource:  'swiss_ephemeris',
        model:        GEMINI_MODEL,
        searchUsed:   useSearch,
        processingMs: Date.now() - startTime,
        kundali: {
          lagna:      kundali.lagna,
          nakshatra:  kundali.nakshatra,
          mahadasha:  kundali.currentMahadasha.lord,
          antardasha: kundali.currentAntardasha.lord,
        },
      },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TV-Predict] Unhandled:', msg);
    return NextResponse.json({ error: 'Cosmic disturbance. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status:      'operational',
    engine:      'Trikal Vaani Predict v3.1',
    chartSource: 'Swiss Ephemeris (Render)',
    model:       GEMINI_MODEL,
    domains:     11,
  });
}