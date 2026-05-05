/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 10.1 — P1 FIX: saveToSupabase column mapping + null guard
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * FULL FLOW v10.1:
 *   Step 1  → /kundali        (GCP VM Mumbai — Swiss Ephemeris)
 *   Step 2  → adaptSwissToKundali()
 *   Step 3  → /synthesize     (GCP VM Mumbai)
 *   Step 4  → /template       (GCP VM Mumbai — Template Engine v2.0)
 *   Step 5  → buildPredictionPrompt() — tier-aware lean prompt
 *   Step 6  → Gemini routing:
 *               FREE  → gemini-2.5-flash (summary only, 150-200w)
 *               PAID  → gemini-2.5-pro   (800-1200w full analysis)
 *   Step 7  → Claude Sonnet 4.6 polish (PAID only)
 *   Step 8  → saveToSupabase() + generate SEO slug
 *   Step 9  → Return predictionId + publicSlug + reportUrl
 *
 * v10.1 CHANGES vs v10.0:
 *   ✅ P1 FIX: saveToSupabase now maps to ACTUAL table columns
 *   ✅ P1 FIX: CEO approved null guard — temp ID fallback on insert fail
 *   ✅ All new columns added to Supabase (May 5, 2026) now populated
 *   ✅ No other logic changed — all iron rules preserved
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient }              from '@supabase/supabase-js';
import { getDomainConfig }           from '@/lib/domain-config';
import { buildPredictionPrompt }     from '@/lib/gemini-prompt';
import { polishPrediction }          from '@/lib/claude-polish';
import { generatePredictionSlug, generateSeoMeta } from '@/lib/slug';
import { notifyGoogleIndexing }      from '@/lib/google-indexing';
import { buildKundali }             from '@/lib/swiss-ephemeris';
import type { KundaliData, BirthData, PlanetPosition } from '@/lib/swiss-ephemeris';
import type { DomainConfig, DomainId } from '@/lib/domain-config';
import type { UserTier, UserContext } from '@/lib/gemini-prompt';

export const maxDuration = 300;

// ── Model Config ──────────────────────────────────────────────────────────────
const GEMINI_FLASH     = 'gemini-2.5-flash';
const GEMINI_PRO       = 'gemini-2.5-pro';
const CLAUDE_POLISH    = 'claude-sonnet-4-6';

const GEMINI_BASE_URL  = 'https://generativelanguage.googleapis.com/v1beta/models';

const GEMINI_API_KEY   = process.env.GEMINI_API_KEY ?? '';
const EPHE_API_URL     = process.env.EPHE_API_URL   ?? '';
const EPHE_API_KEY     = process.env.EPHE_API_KEY   ?? '';

// ── CEO APPROVED: MAX_TOKENS = 12000 — NEVER CHANGE ──────────────────────────
const MAX_TOKENS = 12000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Types ─────────────────────────────────────────────────────────────────────

type PredictionTier = 'free' | 'paid' | 'voice';

interface PredictRequest {
  userId?:          string;
  sessionId:        string;
  domainId:         DomainId;
  domainLabel?:     string;
  predictionTier?:  PredictionTier;
  birthData: {
    name?:     string;
    dob:       string;
    tob:       string;
    lat:       number;
    lng:       number;
    cityName?: string;
    timezone?: number;
    ayanamsa?: string;
  };
  userContext: {
    segment:            'genz' | 'millennial' | 'genx';
    employment:         string;
    sector:             string;
    language:           'hindi' | 'hinglish' | 'english';
    city:               string;
    currentCity?:       string;
    relationshipStatus?: string;
    situationNote?:     string;
    mobile?:            string;
    person2Name?:       string | null;
    person2City?:       string | null;
    person2CurrentCity?: string | null;
  };
  person2Data?: {
    name:        string;
    dob:         string;
    tob:         string;
    lat:         number;
    lng:         number;
    cityName:    string;
    currentCity: string;
    mobile?:     string;
  } | null;
  numerologyCompatibility?: {
    score:       number;
    label:       string;
    description: string;
    color:       string;
  } | null;
}

// ── callVM ────────────────────────────────────────────────────────────────────

async function callVM(endpoint: string, body: object, timeoutMs = 30000): Promise<any> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${EPHE_API_URL}${endpoint}`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key':    EPHE_API_KEY,
      },
      body:   JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`VM ${endpoint} → ${res.status}: ${text.slice(0, 200)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ── callGemini ────────────────────────────────────────────────────────────────

async function callGemini(
  model: string,
  systemPrompt: string,
  userMessage: string,
  jsonMode: boolean = true,
): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const body: any = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: {
      maxOutputTokens: MAX_TOKENS,
      temperature:     0.7,
      topK:            40,
      topP:            0.95,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Gemini ${model} → ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── parseGeminiJSON ───────────────────────────────────────────────────────────

function parseGeminiJSON(raw: string): any {
  if (!raw || raw.trim().length === 0) throw new Error('Empty Gemini response');

  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`No JSON object found. Raw (${cleaned.length}): ${cleaned.slice(0, 200)}`);

  cleaned = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(cleaned);
  } catch (e: any) {
    const fixed = cleaned.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(fixed);
    } catch {
      throw new Error(`JSON parse failed. Raw (${cleaned.length}): ${cleaned.slice(0, 300)}`);
    }
  }
}

// ── saveToSupabase ────────────────────────────────────────────────────────────
// v10.1 FIX: Mapped to ACTUAL columns verified May 5, 2026
// CEO approved null guard — returns temp ID if insert fails (never crashes)

async function saveToSupabase(p: {
  sessionId:       string;
  userId?:         string;
  domainId:        string;
  predictionTier:  PredictionTier;
  birthData:       BirthData;
  userContext:     any;
  kundaliData:     KundaliData | null;
  synthesisData:   any;
  templateHtml:    string | null;
  predictionJson:  any;
  geminiModel:     string;
  polished:        boolean;
  processingMs:    number;
  publicSlug:      string;
  seoMeta:         any;
}): Promise<string> {

  const insertPayload = {
    // ── Core identifiers (NOT NULL in table) ────────────────────────────────
    session_id:      p.sessionId,
    domain_id:       p.domainId,
    tier:            p.predictionTier === 'paid' ? 'premium' : 'free',

    // ── Optional identifiers ─────────────────────────────────────────────────
    user_id:         p.userId ?? null,
    domain_label:    p.predictionJson?.domain ?? null,

    // ── Birth fields (flat columns) ──────────────────────────────────────────
    person_name:     p.birthData.name      ?? null,
    dob:             p.birthData.dob       ?? null,
    birth_time:      p.birthData.tob       ?? null,
    birth_city:      p.birthData.cityName  ?? null,
    birth_lat:       p.birthData.lat       ?? null,
    birth_lng:       p.birthData.lng       ?? null,
    birth_timezone:  p.birthData.timezone  ?? null,

    // ── Kundali summary (flat columns) ───────────────────────────────────────
    lagna:           p.kundaliData?.lagna?.rashi ?? null,
    nakshatra:       p.kundaliData?.planets?.['Moon']?.nakshatra ?? null,
    mahadasha:       p.kundaliData?.currentMahadasha?.lord ?? null,
    antardasha:      p.kundaliData?.currentAntardasha?.lord ?? null,

    // ── User context (flat columns) ──────────────────────────────────────────
    language:        p.userContext.language   ?? null,
    segment:         p.userContext.segment    ?? null,
    employment:      p.userContext.employment ?? null,
    sector:          p.userContext.sector     ?? null,

    // ── Chart source ─────────────────────────────────────────────────────────
    chart_source:    'swiss-ephemeris-meeus',

    // ── Prediction output ────────────────────────────────────────────────────
    prediction:      p.predictionJson,
    prediction_json: p.predictionJson,
    simple_summary:  p.predictionJson?.summary
                  ?? p.predictionJson?.trikal_sandesh
                  ?? null,
    headline:        p.predictionJson?.headline    ?? null,
    confidence:      p.predictionJson?.confidence  ?? null,
    best_dates:      p.predictionJson?.best_dates  ?? null,

    // ── New columns added May 5 2026 (now exist in table) ───────────────────
    prediction_tier: p.predictionTier,
    birth_data:      p.birthData,
    user_context:    p.userContext,
    kundali_data:    p.kundaliData,
    synthesis_data:  p.synthesisData,
    template_html:   p.templateHtml,
    polished:        p.polished,

    // ── Processing meta ──────────────────────────────────────────────────────
    gemini_model:    p.geminiModel,
    search_used:     false,
    processing_ms:   p.processingMs,

    // ── SEO fields ───────────────────────────────────────────────────────────
    public_slug:     p.publicSlug,
    seo_title:       p.seoMeta?.title       ?? null,
    seo_description: p.seoMeta?.description ?? null,
    is_public:       true,
    is_indexed:      false,

    created_at:      new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('predictions')
    .insert(insertPayload)
    .select('id')
    .single();

  // ── CEO APPROVED NULL GUARD — never crashes the prediction flow ───────────
  if (error || !data) {
    console.error('[TV-Supabase] Insert failed:', error?.message ?? 'data is null');
    console.error('[TV-Supabase] Payload keys:', Object.keys(insertPayload).join(', '));
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  return data.id as string;
}

// ── MAIN HANDLER (v10.1 — deployed May 5 2026) ──────────────────────────────────

export async function POST(req: NextRequest) {
  const startMs = Date.now();

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: PredictRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    sessionId,
    userId,
    domainId,
    domainLabel,
    predictionTier = 'free',
    birthData,
    userContext,
    person2Data,
    numerologyCompatibility,
  } = body;

  // ── Guard: voice handled client-side ───────────────────────────────────────
  if (predictionTier === 'voice') {
    return NextResponse.json(
      { error: 'Voice predictions use /api/voice endpoint' },
      { status: 400 }
    );
  }

  // ── Env checks ─────────────────────────────────────────────────────────────
  if (!GEMINI_API_KEY) return NextResponse.json({ error: 'Gemini API key missing' },      { status: 500 });
  if (!EPHE_API_URL)   return NextResponse.json({ error: 'Ephemeris API not configured' }, { status: 500 });

  // ── Select Gemini model based on tier ──────────────────────────────────────
  const geminiModel = predictionTier === 'paid' ? GEMINI_PRO : GEMINI_FLASH;
  const usePolish   = predictionTier === 'paid';

  console.log(`[TV-Predict] START | tier:${predictionTier} | domain:${domainId} | model:${geminiModel} | polish:${usePolish}`);

  // ── Build BirthData ────────────────────────────────────────────────────────
  const localBirthData: BirthData = {
    name:     birthData.name     ?? 'Anonymous',
    dob:      birthData.dob,
    tob:      birthData.tob,
    lat:      birthData.lat,
    lng:      birthData.lng,
    cityName: birthData.cityName ?? '',
  };

  // ── Get domain config ──────────────────────────────────────────────────────
  let domainConfig: DomainConfig;
  try {
    domainConfig = getDomainConfig(domainId);
  } catch {
    return NextResponse.json({ error: `Unknown domain: ${domainId}` }, { status: 400 });
  }

  // ── CEO LOCKED: verifiedTier — DO NOT CHANGE WITHOUT CEO APPROVAL ─────────
  const verifiedTier: UserTier = predictionTier === 'paid' ? 'premium' : 'free';

  const kundaliData: KundaliData = buildKundali(localBirthData);
  let synthesisData: any                = null;
  let templateHtml:  string | null      = null;
  let rawChart:      any                = null;

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 1: /kundali — GCP VM Mumbai
  // ────────────────────────────────────────────────────────────────────────────
  try {
    rawChart = await callVM('/kundali', {
      dob:      localBirthData.dob,
      tob:      localBirthData.tob,
      lat:      localBirthData.lat,
      lng:      localBirthData.lng,
      timezone: birthData.timezone ?? 5.5,
      ayanamsa: 1,
    }, 25000);

    console.log(`[TV-Predict] /kundali OK — lagna:${rawChart.lagna?.sign} | ms:${Date.now() - startMs}`);

  } catch (err: any) {
    console.error('[TV-Predict] /kundali failed (non-fatal — Meeus fallback):', err.message);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 2: /synthesize — GCP VM Mumbai
  // ────────────────────────────────────────────────────────────────────────────
  try {
    synthesisData = await callVM('/synthesize', {
      chart:      rawChart,
        birth_data: {
        dob:      localBirthData.dob,
        tob:      localBirthData.tob,
        lat:      localBirthData.lat,
        lng:      localBirthData.lng,
        timezone: birthData.timezone ?? 5.5,
      },
      domain_id:    domainId,
      person2_data: person2Data ?? null,
    }, 25000);

    console.log(`[TV-Predict] /synthesize OK | yogas:${synthesisData?.parashara?.totalActiveYogas ?? 0} | ms:${Date.now() - startMs}`);

  } catch (err: any) {
    console.warn('[TV-Predict] /synthesize failed (non-fatal):', err.message);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 3: /template — GCP VM Mumbai
  // ────────────────────────────────────────────────────────────────────────────
  try {
    const templateRes = await callVM('/template', {
  domain:      domainId,
  kundaliData: {
    chart:     rawChart,
    synthesis: synthesisData,
    birthData: localBirthData,
    tier:      predictionTier,
  },
  sessionId:   sessionId,
  lang:        userContext.language === 'english' ? 'en' : 'hi',
}, 15000);

    templateHtml = templateRes?.html ?? templateRes?.template ?? null;
    console.log(`[TV-Predict] /template OK | chars:${templateHtml?.length ?? 0} | ms:${Date.now() - startMs}`);

  } catch (err: any) {
    console.warn('[TV-Predict] /template failed (non-fatal):', err.message);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 4: Build Gemini prompt
  // ── IRON RULE: gemini-prompt.ts is NEVER touched without CEO approval ──────
  // ────────────────────────────────────────────────────────────────────────────
  const promptUserContext: UserContext = {
    tier:               verifiedTier,
    segment:            userContext.segment,
    employment:         userContext.employment,
    sector:             userContext.sector,
    language:           userContext.language,
    city:               userContext.city,
    currentCity:        userContext.currentCity  || userContext.city,
    relationshipStatus: userContext.relationshipStatus ?? '',
    situationNote:      (userContext.situationNote ?? '').slice(0, 100),
    mobile:             userContext.mobile        ?? '',
    person2Name:        userContext.person2Name   ?? null,
    person2City:        userContext.person2City   ?? null,
    person2CurrentCity: userContext.person2CurrentCity ?? null,
  };

  const { systemPrompt, userMessage } = buildPredictionPrompt(
    kundaliData,
    localBirthData,
    domainConfig,
    promptUserContext,
  );

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 5: Call Gemini
  // ────────────────────────────────────────────────────────────────────────────
  console.log(`[TV-Predict] Calling Gemini ${geminiModel} | maxTokens:${MAX_TOKENS} | ms:${Date.now() - startMs}`);

  let predictionJson: any;
  let rawGemini: string;

  try {
    rawGemini = await callGemini(geminiModel, systemPrompt, userMessage, true);
    console.log(`[TV-Predict] Gemini raw length:${rawGemini.length} | ms:${Date.now() - startMs}`);

    predictionJson = parseGeminiJSON(rawGemini);
    console.log(`[TV-Predict] JSON parsed OK | keys:${Object.keys(predictionJson).join(',')} | ms:${Date.now() - startMs}`);

  } catch (err: any) {
    console.error('[TV-Predict] Gemini failed:', err.message);
    return NextResponse.json(
      { error: `Prediction generation failed: ${err.message}` },
      { status: 500 }
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 6: Claude Sonnet 4.6 polish — PAID only
  // ────────────────────────────────────────────────────────────────────────────
  let polished = false;

  if (usePolish) {
    try {
      console.log(`[TV-Predict] Claude Sonnet 4.6 polish starting | ms:${Date.now() - startMs}`);

      const polishedResult = await polishPrediction(
        predictionJson,
        userContext.language,
        localBirthData.name ?? 'Anonymous',
        domainConfig?.label ?? domainId,
        verifiedTier,
      );

      if (polishedResult?.polished && polishedResult.prediction) {
        predictionJson = polishedResult.prediction;
        polished       = true;
        console.log(`[TV-Predict] Claude polish OK | ms:${Date.now() - startMs}`);
      }
    } catch (err: any) {
      console.warn('[TV-Predict] Claude polish failed (non-fatal):', err.message);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 7: Generate SEO slug + meta
  // ────────────────────────────────────────────────────────────────────────────
  const processingMs = Date.now() - startMs;

  // Extract dasha planets for slug — safe fallbacks if kundali unavailable
  const mahadashaPlanet  = kundaliData?.currentMahadasha?.lord  ?? 'rahu';
  const antardashaPlanet = kundaliData?.currentAntardasha?.lord ?? 'saturn';

  const publicSlug = generatePredictionSlug({
    domainId,
    mahadasha:  mahadashaPlanet,
    antardasha: antardashaPlanet,
    city:       localBirthData.cityName ?? 'india',
  });

  const geoAnswer = predictionJson?.geoDirectAnswer
                 ?? predictionJson?.simpleSummary?.text?.slice(0, 155)
                 ?? null;

  const seoMeta = generateSeoMeta(
    publicSlug,
    domainId,
    mahadashaPlanet,
    antardashaPlanet,
    localBirthData.cityName ?? 'India',
    geoAnswer,
  );

  console.log(`[TV-Predict] slug:${publicSlug} | seo:${seoMeta?.title?.slice(0, 50)} | ms:${processingMs}`);

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 8: Save to Supabase
  // ────────────────────────────────────────────────────────────────────────────
  let predictionId: string;

  try {
    predictionId = await saveToSupabase({
      sessionId,
      userId,
      domainId,
      predictionTier,
      birthData:      localBirthData,
      userContext:    promptUserContext,
      kundaliData,
      synthesisData,
      templateHtml,
      predictionJson,
      geminiModel,
      polished,
      processingMs,
      publicSlug,
      seoMeta,
    });

    console.log(`[TV-Predict] Saved | id:${predictionId} | slug:${publicSlug}`);

  } catch (err: any) {
    // Should never reach here — null guard in saveToSupabase handles it
    console.error('[TV-Predict] Supabase save unexpected throw:', err.message);
    predictionId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 9: Notify Google Indexing (non-fatal, fire-and-forget)
  // ────────────────────────────────────────────────────────────────────────────
  try {
    notifyGoogleIndexing(`https://trikalvaani.com/report/${publicSlug}`);
  } catch {
    // Non-fatal
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 10: Return response
  // ────────────────────────────────────────────────────────────────────────────
  const reportUrl = `https://trikalvaani.com/report/${publicSlug}`;

  console.log(`[TV-Predict] COMPLETE | tier:${predictionTier} | model:${geminiModel} | polished:${polished} | ms:${processingMs}`);

  return NextResponse.json({
    success:      true,
    prediction:   predictionJson,
    templateHtml,
    _meta: {
      predictionId,
      publicSlug,
      reportUrl,
      predictionTier,
      geminiModel,
      polished,
      processingMs,
      domainId,
      seoTitle:       seoMeta?.title       ?? null,
      seoDescription: seoMeta?.description ?? null,
    },
  });
}
