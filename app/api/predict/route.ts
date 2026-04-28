/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 5.2 — Full Synthesis Engine (Parashari + Bhrigu + Panchang + Confidence)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ARCHITECTURE v5.2:
 *   1. Swiss Ephemeris API (Render) → planet positions
 *   2. /synthesize API (Render)     → Parashari + Bhrigu + Panchang + Confidence
 *   3. buildPredictionPrompt()      → inject enriched synthesis data
 *   4. Gemini 2.5 Flash             → dual language prediction
 *   5. Supabase                     → save prediction
 *
 * WHAT'S NEW in v5.2:
 *   - Calls /synthesize on Render after /kundali
 *   - Injects Parashari Yogas, Ashtakavarga, Bhrigu signals,
 *     Panchang, Confidence score into Gemini prompt
 *   - Handles person2Data for dual chart domains
 *   - Handles numerologyCompatibility from BirthForm
 *   - Updated tier map (free/basic/standard/premium)
 *   - Supabase save server-side (v5.1 pattern)
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

// ── Config ────────────────────────────────────────────────────────────────────

export const maxDuration = 300;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_MODEL   = 'gemini-2.5-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const EPHE_API_URL   = process.env.EPHE_API_URL ?? '';
const EPHE_API_KEY   = process.env.EPHE_API_KEY ?? '';

const MAX_TOKENS: Record<UserTier, number> = {
  free:     4096,
  basic:    8192,
  standard: 12288,
  premium:  16384,
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Request Type ──────────────────────────────────────────────────────────────

interface PredictRequest {
  userId?:     string;
  sessionId:   string;
  domainId:    DomainId;
  domainLabel?: string;
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
    mobile?:       string;
    businessName?: string;
    person2Name?:  string;
    person2City?:  string;
  };
  person2Data?: {
    name:     string;
    dob:      string;
    tob:      string;
    lat:      number;
    lng:      number;
    cityName: string;
    mobile?:  string;
  } | null;
  numerologyCompatibility?: {
    score:       number;
    label:       string;
    description: string;
  } | null;
}

// ── Planet Strength ───────────────────────────────────────────────────────────

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

function getNakshatraLord(name: string): string {
  const idx = (NAKSHATRAS as readonly string[]).indexOf(name);
  return idx >= 0 ? (NAKSHATRA_LORDS[idx] ?? 'Ketu') : 'Ketu';
}

// ── Swiss → KundaliData Adapter ───────────────────────────────────────────────

function adaptSwissToKundali(chart: any, birthData: BirthData): KundaliData {
  const grahas: any[] = Array.isArray(chart.grahas) ? chart.grahas : [];
  const planets: Record<string, PlanetPosition> = {};

  for (const g of grahas) {
    const name: string = g.planet;
    planets[name] = {
      name,
      siderealLongitude: g.longitude       ?? 0,
      rashi:             g.sign            ?? 'Mesh',
      degree:            g.degree_in_sign  ?? 0,
      nakshatra:         g.nakshatra       ?? 'Ashwini',
      nakshatraPada:     g.pada            ?? 1,
      nakshatraLord:     g.nakshatra_lord  ?? 'Ketu',
      isRetrograde:      g.retrograde      ?? (name === 'Rahu' || name === 'Ketu'),
      house:             g.house           ?? 1,
      strength:          computeStrength(name, g.sign ?? 'Mesh', g.retrograde ?? false),
    };
  }

  const lagnaSign  = chart.lagna?.sign      ?? 'Mesh';
  const lagnaLord  = chart.lagna?.sign_lord ?? RASHI_LORDS[lagnaSign] ?? 'Mars';
  const moonGraha  = grahas.find(g => g.planet === 'Moon') ?? {};
  const nakshatra  = moonGraha.nakshatra     ?? 'Ashwini';
  const nakshatraLord = moonGraha.nakshatra_lord ?? getNakshatraLord(nakshatra);
  const moonLongitude = moonGraha.longitude ?? 0;
  const dob        = new Date(`${birthData.dob}T${birthData.tob}:00+05:30`);
  const dasha      = calcDasha(moonLongitude, dob);

  return {
    lagna: lagnaSign, lagnaLord, planets, nakshatra, nakshatraLord,
    currentMahadasha:  dasha.currentMahadasha,
    currentAntardasha: dasha.currentAntardasha,
    currentPratyantar: dasha.currentPratyantar,
    currentSookshma:   dasha.currentSookshma,
    antardashas:       dasha.antardashas,
    pratyantar:        dasha.pratyantar,
    dashaBalance:      dasha.dashaBalance,
    panchang: {
      vara: '', tithi: '', yoga: '', nakshatra: '',
      sunrise: '', sunset: '',
      rahuKaal:        { start: '', end: '' },
      abhijeetMuhurta: { start: '', end: '' },
      choghadiya:      { name: '', type: 'Neutral' as const },
    },
    birthData,
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
    if (data.tier_expires_at && new Date(data.tier_expires_at) < new Date()) return 'free';
    const valid: UserTier[] = ['free', 'basic', 'standard', 'premium'];
    return valid.includes(data.tier) ? data.tier : 'free';
  } catch { return 'free'; }
}

// ── Call Swiss Ephemeris ──────────────────────────────────────────────────────

async function callSwissEphemeris(birthData: PredictRequest['birthData']): Promise<any> {
  const [year, month, day] = birthData.dob.split('-').map(Number);
  const [hour, minute]     = birthData.tob.split(':').map(Number);

  const payload = {
    year, month, day, hour, minute, second: 0,
    latitude:  birthData.lat,
    longitude: birthData.lng,
    timezone:  birthData.timezone ?? 5.5,
    ayanamsa:  'lahiri',
  };

  const res = await fetch(`${EPHE_API_URL}/kundali`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(EPHE_API_KEY ? { 'X-Api-Key': EPHE_API_KEY } : {}),
    },
    body:   JSON.stringify(payload),
    signal: AbortSignal.timeout(240000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Swiss API ${res.status}: ${err.detail ?? res.statusText}`);
  }

  return res.json();
}

// ── Call Synthesis Engine ─────────────────────────────────────────────────────

async function callSynthesizeEngine(
  domainId:    string,
  birthData:   PredictRequest['birthData'],
  kundaliData: any,
  userContext: PredictRequest['userContext'],
): Promise<any> {
  try {
    const res = await fetch(`${EPHE_API_URL}/synthesize`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(EPHE_API_KEY ? { 'X-Api-Key': EPHE_API_KEY } : {}),
      },
      body: JSON.stringify({
        domainId,
        birthData: {
          dob:      birthData.dob,
          tob:      birthData.tob,
          lat:      birthData.lat,
          lng:      birthData.lng,
          cityName: birthData.cityName ?? '',
          timezone: birthData.timezone ?? 5.5,
          name:     birthData.name ?? 'User',
        },
        kundaliData,
        userContext,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.warn(`[TV] Synthesize API ${res.status} — proceeding without enrichment`);
      return null;
    }

    const data = await res.json();
    console.log(`[TV] Synthesize OK — confidence: ${data.enriched?.confidence?.label} | ms: ${data.processing_ms}`);
    return data.enriched ?? null;

  } catch (err) {
    // Non-fatal — if synthesis fails, prediction still works
    console.warn('[TV] Synthesize failed (non-fatal):', err);
    return null;
  }
}

// ── Supabase Save ─────────────────────────────────────────────────────────────

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
  synthesis?:   any;
}): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .insert([{
        session_id:      params.sessionId,
        user_id:         params.userId       ?? null,
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
        confidence_label: params.synthesis?.confidence?.label ?? null,
        primary_yoga:    params.synthesis?.synthesis?.primary_yoga ?? null,
      }])
      .select('id')
      .single();

    if (error) {
      console.error('[TV] Supabase save error:', error.message);
      return null;
    }

    console.log('[TV] Prediction saved:', data.id);
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
    const {
      userId, sessionId, domainId, domainLabel,
      birthData, userContext,
      person2Data, numerologyCompatibility,
    } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!sessionId)      return NextResponse.json({ error: 'sessionId required' },              { status: 400 });
    if (!domainId)       return NextResponse.json({ error: 'domainId required' },               { status: 400 });
    if (!birthData?.dob) return NextResponse.json({ error: 'birthData.dob required' },          { status: 400 });
    if (!birthData?.tob) return NextResponse.json({ error: 'birthData.tob required' },          { status: 400 });
    if (!birthData?.lat) return NextResponse.json({ error: 'birthData.lat required' },          { status: 400 });
    if (!GEMINI_API_KEY) return NextResponse.json({ error: 'Prediction engine not configured' },{ status: 500 });
    if (!EPHE_API_URL)   return NextResponse.json({ error: 'Ephemeris API not configured' },    { status: 500 });

    // ── Tier ──────────────────────────────────────────────────────────────────
    const verifiedTier = userId ? await getVerifiedTier(userId) : 'free';

    // ── Domain ────────────────────────────────────────────────────────────────
    let domain;
    try { domain = getDomainConfig(domainId); }
    catch { return NextResponse.json({ error: `Unknown domainId: ${domainId}` }, { status: 400 }); }

    // ── Step 1: Swiss Ephemeris ───────────────────────────────────────────────
    let chart: any;
    try {
      chart = await callSwissEphemeris(birthData);
      console.log(`[TV] Swiss OK — lagna:${chart.lagna?.sign} grahas:${chart.grahas?.length}`);
    } catch (err) {
      console.error('[TV] Swiss failed:', err);
      return NextResponse.json(
        { error: 'Chart calculation failed. Please check birth details and try again.' },
        { status: 502 }
      );
    }

    // ── Step 2: Build KundaliData ─────────────────────────────────────────────
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
      console.log(`[TV] Kundali — Lagna:${kundali.lagna} Maha:${kundali.currentMahadasha.lord} Antar:${kundali.currentAntardasha.lord}`);
    } catch (err) {
      console.error('[TV] Adapter failed:', err);
      return NextResponse.json({ error: 'Chart processing failed. Please retry.' }, { status: 500 });
    }

    // ── Step 3: Synthesis Engine (Render) ─────────────────────────────────────
    // NON-FATAL — if it fails, prediction still works with basic data
    const synthesis = await callSynthesizeEngine(domainId, birthData, chart, userContext);

    // ── Step 4: Build Gemini Prompt ───────────────────────────────────────────
    const verifiedUserContext: UserContext = {
      tier:         verifiedTier,
      segment:      userContext.segment    || 'millennial',
      employment:   userContext.employment || '',
      sector:       userContext.sector     || '',
      language:     userContext.language   || 'hinglish',
      city:         userContext.city       || birthData.cityName || 'India',
      businessName: userContext.businessName,
      person2Name:  userContext.person2Name  || person2Data?.name,
      person2City:  userContext.person2City  || person2Data?.cityName,
    };

    const { systemPrompt, userMessage, useSearch } = buildPredictionPrompt(
      kundali,
      localBirthData,
      domain,
      verifiedUserContext,
      synthesis?.parashara ?? undefined,
      synthesis?.panchang  ?? undefined,
    );

    // ── Step 5: Call Gemini ───────────────────────────────────────────────────
    // Build enhanced user message with synthesis data
    const enhancedUserMessage = buildEnhancedUserMessage(
      userMessage, synthesis, person2Data, numerologyCompatibility
    );

    const geminiBody: Record<string, unknown> = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: enhancedUserMessage }] }],
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
      ?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';

    if (!rawText) return NextResponse.json({ error: 'Empty prediction response' }, { status: 502 });

    // ── Step 6: Parse Prediction ──────────────────────────────────────────────
    let prediction: Record<string, unknown>;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
      prediction = JSON.parse(cleaned);
    } catch {
      console.error('[TV] JSON parse failed:', rawText.slice(0, 300));
      return NextResponse.json({ error: 'Invalid prediction format. Please retry.' }, { status: 502 });
    }

    const processingMs = Date.now() - startTime;

    // ── Step 7: Save to Supabase ──────────────────────────────────────────────
    const predictionId = await saveToSupabase({
      sessionId,
      userId,
      domainId,
      domainLabel: domainLabel ?? domain.displayName ?? domainId,
      birthData,
      kundali,
      tier:         verifiedTier,
      prediction,
      processingMs,
      userContext,
      synthesis,
    });

    // ── Step 8: Return ────────────────────────────────────────────────────────
    return NextResponse.json({
      ...prediction,
      _meta: {
        domainId,
        predictionId,
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
        synthesis: synthesis ? {
          confidenceLabel:  synthesis.confidence?.label,
          confidenceBadge:  synthesis.confidence?.badge,
          karmicMarker:     synthesis.synthesis?.karmic_marker,
          primaryYoga:      synthesis.synthesis?.primary_yoga,
          bhriguTheme:      synthesis.synthesis?.bhrigu_theme,
          agreementPoints:  synthesis.synthesis?.agreement_points,
        } : null,
      },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TV] Unhandled:', msg);
    return NextResponse.json({ error: 'Cosmic disturbance. Please try again.' }, { status: 500 });
  }
}

// ── Enhanced User Message Builder ─────────────────────────────────────────────

function buildEnhancedUserMessage(
  baseMessage:             string,
  synthesis:               any,
  person2Data:             PredictRequest['person2Data'],
  numerologyCompatibility: PredictRequest['numerologyCompatibility'],
): string {
  const parts = [baseMessage];

  if (synthesis) {
    parts.push(`
SYNTHESIS ENGINE RESULTS (use these in your analysis):
Confidence: ${synthesis.confidence?.label ?? 'Moderate'}
Badge: ${synthesis.confidence?.badge ?? ''}
Gemini Note: ${synthesis.synthesis?.gemini_note ?? ''}
Karmic Marker: ${synthesis.synthesis?.karmic_marker ? 'YES — add 🔱 subtle mention' : 'NO'}
Karmic Text: ${synthesis.synthesis?.karmic_text ?? ''}
Primary Yoga: ${synthesis.synthesis?.primary_yoga ?? 'None detected'}
Bhrigu Theme: ${synthesis.synthesis?.bhrigu_theme ?? ''}
Agreement Points: ${synthesis.synthesis?.agreement_points ?? 0}/10
Conflict: ${synthesis.synthesis?.conflicts?.length > 0 ? synthesis.synthesis.conflicts[0] : 'None'}
Strong Planets: ${(synthesis.synthesis?.strong_planets ?? []).join(', ') || 'None'}
Weak Planets: ${(synthesis.synthesis?.weak_planets ?? []).join(', ') || 'None'}
Best Houses: ${(synthesis.synthesis?.best_houses ?? []).join(', ') || 'None'}
Panchang Today: Vara=${synthesis.panchang?.vara ?? ''} Tithi=${synthesis.panchang?.tithi ?? ''} Yoga=${synthesis.panchang?.yoga ?? ''} Nakshatra=${synthesis.panchang?.nakshatra ?? ''}
Rahu Kaal: ${synthesis.panchang?.rahuKaal?.start ?? ''} to ${synthesis.panchang?.rahuKaal?.end ?? ''}
`);
  }

  if (person2Data) {
    parts.push(`
PERSON 2 DATA (for dual chart analysis):
Name: ${person2Data.name}
DOB: ${person2Data.dob}
TOB: ${person2Data.tob}
City: ${person2Data.cityName}
Lat: ${person2Data.lat} | Lng: ${person2Data.lng}
`);
  }

  if (numerologyCompatibility) {
    parts.push(`
MOBILE NUMBER NUMEROLOGY COMPATIBILITY:
Score: ${numerologyCompatibility.score}%
Label: ${numerologyCompatibility.label}
Description: ${numerologyCompatibility.description}
Include this as a supporting data point in the compatibility analysis.
`);
  }

  return parts.join('\n');
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    status:      'operational',
    engine:      'Trikal Vaani Predict v5.2',
    chartSource: 'swiss_ephemeris_render',
    synthesis:   'parashari + bhrigu + panchang + confidence',
    model:       GEMINI_MODEL,
    domains:     11,
  });
}
