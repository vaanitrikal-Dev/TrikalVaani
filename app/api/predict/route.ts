/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 5.1 — Supabase save moved here (server-side fix)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDomainConfig } from '@/lib/domain-config';
import { buildPredictionPrompt } from '@/lib/gemini-prompt';
import {
  calcDasha,
  NAKSHATRA_LORDS,
  RASHI_LORDS,
  NAKSHATRAS,
} from '@/lib/swiss-ephemeris';
import type { KundaliData, BirthData, PlanetPosition } from '@/lib/swiss-ephemeris';
import type { DomainId } from '@/lib/domain-config';
import type { UserTier, UserContext } from '@/lib/gemini-prompt';

export const maxDuration = 300;

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

// ── Supabase admin — server only, safe here ───────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Request Type ──────────────────────────────────────────────────────────────

interface PredictRequest {
  userId?:   string;
  sessionId: string;
  domainId:  DomainId;
  birthData: {
    name?:     string;
    dob:       string;
    tob:       string;
    lat:       number;
    lng:       number;
    cityName?: string;
    timezone?: number;
  };
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
  domainLabel?: string;
}

// ── Helpers (unchanged from v5.0) ─────────────────────────────────────────────

function getNakshatraLord(nakshatraName: string): string {
  const idx = (NAKSHATRAS as readonly string[]).indexOf(nakshatraName);
  return idx >= 0 ? (NAKSHATRA_LORDS[idx] ?? 'Ketu') : 'Ketu';
}

const EXALT_SIGN: Record<string, string> = {
  Sun:'Mesh', Moon:'Vrishabh', Mars:'Makar', Mercury:'Kanya',
  Jupiter:'Kark', Venus:'Meen', Saturn:'Tula',
};
const DEBIL_SIGN: Record<string, string> = {
  Sun:'Tula', Moon:'Vrischik', Mars:'Kark', Mercury:'Meen',
  Jupiter:'Makar', Venus:'Kanya', Saturn:'Mesh',
};
const OWN_SIGNS: Record<string, string[]> = {
  Sun:['Simha'], Moon:['Kark'], Mars:['Mesh','Vrischik'],
  Mercury:['Mithun','Kanya'], Jupiter:['Dhanu','Meen'],
  Venus:['Vrishabh','Tula'], Saturn:['Makar','Kumbh'],
};

function computeStrength(planet: string, sign: string, isRetrograde: boolean): number {
  let s = 50;
  if (EXALT_SIGN[planet] === sign) s += 30;
  if (DEBIL_SIGN[planet]  === sign) s -= 25;
  if (OWN_SIGNS[planet]?.includes(sign)) s += 20;
  if (isRetrograde && planet !== 'Rahu' && planet !== 'Ketu') s += 8;
  return Math.min(100, Math.max(5, s));
}

function buildPanchangStub() {
  return {
    vara: '', tithi: '', yoga: '', nakshatra: '',
    sunrise: '', sunset: '',
    rahuKaal:        { start: '', end: '' },
    abhijeetMuhurta: { start: '', end: '' },
    choghadiya:      { name: '', type: 'Neutral' as const },
  };
}

function adaptSwissToKundali(chart: any, birthData: BirthData): KundaliData {
  const grahas: any[] = Array.isArray(chart.grahas) ? chart.grahas : [];
  const planets: Record<string, PlanetPosition> = {};

  for (const g of grahas) {
    const name: string = g.planet;
    planets[name] = {
      name,
      siderealLongitude: g.longitude        ?? 0,
      rashi:             g.sign             ?? 'Mesh',
      degree:            g.degree_in_sign   ?? 0,
      nakshatra:         g.nakshatra        ?? 'Ashwini',
      nakshatraPada:     g.pada             ?? 1,
      nakshatraLord:     g.nakshatra_lord   ?? 'Ketu',
      isRetrograde:      g.retrograde       ?? (name === 'Rahu' || name === 'Ketu'),
      house:             g.house            ?? 1,
      strength:          computeStrength(name, g.sign ?? 'Mesh', g.retrograde ?? false),
    };
  }

  const lagnaSign  = chart.lagna?.sign      ?? 'Mesh';
  const lagnaLord  = chart.lagna?.sign_lord ?? RASHI_LORDS[lagnaSign] ?? 'Mars';
  const moonGraha  = grahas.find(g => g.planet === 'Moon') ?? {};
  const nakshatra  = moonGraha.nakshatra     ?? 'Ashwini';
  const nakshatraLord = moonGraha.nakshatra_lord ?? getNakshatraLord(nakshatra);
  const moonLongitude = moonGraha.longitude ?? 0;
  const dob = new Date(`${birthData.dob}T${birthData.tob}:00+05:30`);
  const dasha = calcDasha(moonLongitude, dob);

  return {
    lagna: lagnaSign, lagnaLord, planets, nakshatra, nakshatraLord,
    currentMahadasha:  dasha.currentMahadasha,
    currentAntardasha: dasha.currentAntardasha,
    currentPratyantar: dasha.currentPratyantar,
    currentSookshma:   dasha.currentSookshma,
    antardashas:       dasha.antardashas,
    pratyantar:        dasha.pratyantar,
    dashaBalance:      dasha.dashaBalance,
    panchang:          buildPanchangStub(),
    birthData,
  };
}

async function getVerifiedTier(userId: string): Promise<UserTier> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('tier, tier_expires_at')
      .eq('id', userId)
      .single();
    if (error || !data) return 'free';
    if (data.tier_expires_at && new Date(data.tier_expires_at) < new Date()) return 'free';
    const validTiers: UserTier[] = ['free', 'basic', 'pro', 'premium'];
    return validTiers.includes(data.tier) ? data.tier : 'free';
  } catch {
    return 'free';
  }
}

// ── Save to Supabase (server-side — safe) ─────────────────────────────────────

async function saveToSupabase(params: {
  sessionId:    string;
  userId?:      string;
  domainId:     string;
  domainLabel:  string;
  birthData:    PredictRequest['birthData'];
  kundali:      KundaliData;
  tier:         UserTier;
  prediction:   Record<string, unknown>;
  processingMs: number;
  userContext:  PredictRequest['userContext'];
}): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .insert([{
        session_id:      params.sessionId,
        user_id:         params.userId     ?? null,
        domain_id:       params.domainId,
        domain_label:    params.domainLabel,
        person_name:     params.birthData.name     ?? 'User',
        dob:             params.birthData.dob,
        birth_city:      params.birthData.cityName ?? '',
        birth_time:      params.birthData.tob,
        birth_lat:       params.birthData.lat,
        birth_lng:       params.birthData.lng,
        birth_timezone:  params.birthData.timezone ?? 5.5,
        lagna:           params.kundali.lagna,
        nakshatra:       params.kundali.nakshatra,
        mahadasha:       params.kundali.currentMahadasha.lord,
        antardasha:      params.kundali.currentAntardasha.lord,
        tier:            params.tier,
        language:        params.userContext.language  ?? 'hinglish',
        segment:         params.userContext.segment   ?? 'millennial',
        chart_source:    'swiss_ephemeris_render',
        prediction_json: params.prediction,
        processing_ms:   params.processingMs,
        gemini_model:    GEMINI_MODEL,
        search_used:     false,
      }])
      .select('id')
      .single();

    if (error) {
      console.error('[TV] Supabase save error:', error.message, '| code:', error.code);
      return null;
    }

    console.log('[TV] Prediction saved to Supabase:', data.id);
    return data.id as string;

  } catch (err) {
    console.error('[TV] Supabase save exception:', err);
    return null;
  }
}

// ── Main Handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json() as PredictRequest;
    const { userId, sessionId, domainId, birthData, userContext, domainLabel } = body;

    if (!sessionId)      return NextResponse.json({ error: 'sessionId required' },              { status: 400 });
    if (!domainId)       return NextResponse.json({ error: 'domainId required' },               { status: 400 });
    if (!birthData?.dob) return NextResponse.json({ error: 'birthData.dob required' },          { status: 400 });
    if (!birthData?.tob) return NextResponse.json({ error: 'birthData.tob required' },          { status: 400 });
    if (!birthData?.lat) return NextResponse.json({ error: 'birthData.lat required' },          { status: 400 });
    if (!GEMINI_API_KEY) return NextResponse.json({ error: 'Prediction engine not configured' },{ status: 500 });
    if (!EPHE_API_URL)   return NextResponse.json({ error: 'Ephemeris API not configured' },    { status: 500 });

    const verifiedTier = userId ? await getVerifiedTier(userId) : 'free';

    let domain;
    try {
      domain = getDomainConfig(domainId);
    } catch {
      return NextResponse.json({ error: `Unknown domainId: ${domainId}` }, { status: 400 });
    }

    // ── Step 1: Swiss Ephemeris API ───────────────────────────────────────────
    const [year, month, day] = birthData.dob.split('-').map(Number);
    const [hour, minute]     = birthData.tob.split(':').map(Number);

    const swissPayload = {
      year, month, day, hour, minute, second: 0,
      latitude:  birthData.lat,
      longitude: birthData.lng,
      timezone:  birthData.timezone ?? 5.5,
      ayanamsa:  'lahiri',
    };

    let chart: any;
    try {
      const res = await fetch(`${EPHE_API_URL}/kundali`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(EPHE_API_KEY ? { 'X-Api-Key': EPHE_API_KEY } : {}),
        },
        body:   JSON.stringify(swissPayload),
        signal: AbortSignal.timeout(240000),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Swiss API ${res.status}: ${err.detail ?? res.statusText}`);
      }

      chart = await res.json();
      console.log(`[TV] Swiss API OK — lagna:${chart.lagna?.sign} grahas:${chart.grahas?.length}`);
    } catch (err) {
      console.error('[TV] Swiss API failed:', err);
      return NextResponse.json(
        { error: 'Chart calculation failed. Please check birth details and try again.' },
        { status: 502 }
      );
    }

    // ── Step 2: Adapt → KundaliData ───────────────────────────────────────────
    const localBirthData: BirthData = {
      name:     birthData.name     || 'User',
      dob:      birthData.dob,
      tob:      birthData.tob,
      lat:      birthData.lat,
      lng:      birthData.lng,
      cityName: birthData.cityName || userContext.city || 'India',
    };

    let kundali: KundaliData;
    try {
      kundali = adaptSwissToKundali(chart, localBirthData);
      console.log(`[TV] Kundali built — Lagna:${kundali.lagna} Nakshatra:${kundali.nakshatra} Maha:${kundali.currentMahadasha.lord}`);
    } catch (err) {
      console.error('[TV] Adapter failed:', err);
      return NextResponse.json({ error: 'Chart processing failed. Please retry.' }, { status: 500 });
    }

    // ── Step 3: Gemini prompt ─────────────────────────────────────────────────
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

    const { systemPrompt, userMessage, useSearch } = buildPredictionPrompt(
      kundali, localBirthData, domain, verifiedUserContext
    );

    // ── Step 4: Gemini ────────────────────────────────────────────────────────
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
      console.error(`[TV] Gemini HTTP ${geminiRes.status}`);
      return NextResponse.json({ error: 'Prediction engine unavailable' }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? '')
      .join('') ?? '';

    if (!rawText) return NextResponse.json({ error: 'Empty prediction response' }, { status: 502 });

    // ── Step 5: Parse prediction ──────────────────────────────────────────────
    let prediction: Record<string, unknown>;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim();
      prediction = JSON.parse(cleaned);
    } catch {
      console.error('[TV] JSON parse failed:', rawText.slice(0, 300));
      return NextResponse.json({ error: 'Invalid prediction format. Please retry.' }, { status: 502 });
    }

    const processingMs = Date.now() - startTime;

    // ── Step 6: Save to Supabase (SERVER-SIDE — correct) ─────────────────────
    const predictionId = await saveToSupabase({
      sessionId,
      userId,
      domainId,
      domainLabel: domainLabel ?? domain.label ?? domainId,
      birthData,
      kundali,
      tier:         verifiedTier,
      prediction,
      processingMs,
      userContext,
    });

    // ── Step 7: Return ────────────────────────────────────────────────────────
    return NextResponse.json({
      ...prediction,
      _meta: {
        domainId,
        predictionId,           // ← now returned from server, no client save needed
        tier:         verifiedTier,
        chartSource:  'swiss_ephemeris_render',
        model:        GEMINI_MODEL,
        searchUsed:   useSearch,
        processingMs,
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
    console.error('[TV] Unhandled:', msg);
    return NextResponse.json({ error: 'Cosmic disturbance. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status:      'operational',
    engine:      'Trikal Vaani Predict v5.1',
    chartSource: 'swiss_ephemeris_render',
    model:       GEMINI_MODEL,
    domains:     11,
  });
}
