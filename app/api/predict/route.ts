/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 10.0 — Free/Paid/Voice routing + Gemini Flash/Pro + Template Engine
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * FULL FLOW v10.0:
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
 * v10.0 CHANGES vs v9.5:
 *   ✅ predictionTier from BirthForm v8.0 (free | paid | voice)
 *   ✅ FREE  → gemini-2.5-flash  (no polish, fast, ₹0)
 *   ✅ PAID  → gemini-2.5-pro    (+ Claude Sonnet 4.6 polish, ₹51)
 *   ✅ VOICE → handled client-side (redirect to /voice route)
 *   ✅ Template Engine v2.0 integrated (/template endpoint on VM)
 *   ✅ Template HTML injected into Supabase + result pages
 *   ✅ EPHE_API_URL now = GCP VM Mumbai (replaces Render)
 *   ✅ Model strings: gemini-2.5-flash | gemini-2.5-pro
 *   ✅ MAX_TOKENS = 12000 all tiers (CEO approved, never change)
 *   ✅ verifiedTier logic preserved (CEO locked)
 *   ✅ SEO slug + Google indexing notification preserved
 *   ✅ person2Data + numerologyCompatibility preserved
 *   ✅ currentCity + relationshipStatus + situationNote preserved
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient }              from '@supabase/supabase-js';
import { getDomainConfig }           from '@/lib/domain-config';
import { buildPredictionPrompt }     from '@/lib/gemini-prompt';
import { polishPrediction }          from '@/lib/claude-polish';
import { generatePredictionSlug, generateSeoMeta } from '@/lib/slug';
import { notifyGoogleIndexing }      from '@/lib/google-indexing';
import {
  calcDasha,
  NAKSHATRA_LORDS,
  RASHI_LORDS,
  NAKSHATRAS,
} from '@/lib/swiss-ephemeris';
import type { KundaliData, BirthData, PlanetPosition } from '@/lib/swiss-ephemeris';
import type { DomainId }   from '@/lib/domain-config';
import type { UserTier, UserContext } from '@/lib/gemini-prompt';

export const maxDuration = 300;

// ── Model Config ──────────────────────────────────────────────────────────────
// v10.0: Two models. Flash for free (fast+cheap). Pro for paid (depth+quality).
const GEMINI_FLASH     = 'gemini-2.5-flash';
const GEMINI_PRO       = 'gemini-2.5-pro';
const CLAUDE_POLISH    = 'claude-sonnet-4-6';  // Paid polish only

const GEMINI_BASE_URL  = 'https://generativelanguage.googleapis.com/v1beta/models';

const GEMINI_API_KEY   = process.env.GEMINI_API_KEY ?? '';
const EPHE_API_URL     = process.env.EPHE_API_URL   ?? '';  // GCP VM Mumbai
const EPHE_API_KEY     = process.env.EPHE_API_KEY   ?? '';

// ── CEO APPROVED: MAX_TOKENS = 12000 across all tiers — NEVER CHANGE ─────────
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
  predictionTier?:  PredictionTier;   // NEW v10.0 — from BirthForm v8
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

// ── adaptSwissToKundali ───────────────────────────────────────────────────────

function adaptSwissToKundali(chart: any, birthData: BirthData): KundaliData {
  const planets: PlanetPosition[] = [];

  const PLANET_MAP: Record<string, string> = {
    sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury',
    jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn',
    rahu: 'Rahu', ketu: 'Ketu',
  };

  for (const [key, name] of Object.entries(PLANET_MAP)) {
    const p = chart.planets?.[key];
    if (!p) continue;
    const lon = typeof p.longitude === 'number' ? p.longitude : 0;
    const rashiIdx = Math.floor(lon / 30);
    const degree   = lon % 30;
    const naksIdx  = Math.floor(lon / (360 / 27));

    planets.push({
      name:          name as any,
      longitude:     lon,
      rashi:         p.rashi || p.sign || ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][rashiIdx] || 'Aries',
      rashiIndex:    rashiIdx,
      degree,
      house:         p.house ?? 1,
      isRetrograde:  p.isRetrograde ?? false,
      nakshatra:     NAKSHATRAS[naksIdx] ?? 'Ashwini',
      nakshatraLord: NAKSHATRA_LORDS[naksIdx] ?? 'Ketu',
      shadbala:      p.shadbala ?? null,
    });
  }

  const moonPlanet  = planets.find(p => p.name === 'Moon');
  const moonLon     = moonPlanet?.longitude ?? 0;
  const dashaResult = calcDasha(moonLon, birthData.dob);

  const lagnaLon      = chart.lagna?.longitude ?? chart.ascendant?.longitude ?? 0;
  const lagnaRashiIdx = Math.floor(lagnaLon / 30);

  return {
    planets,
    dasha: dashaResult,
    lagna: {
      longitude:  lagnaLon,
      rashi:      chart.lagna?.sign ?? ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][lagnaRashiIdx] ?? 'Aries',
      rashiIndex: lagnaRashiIdx,
      degree:     lagnaLon % 30,
      lord:       RASHI_LORDS[lagnaRashiIdx] ?? 'Mars',
    },
    birthData,
    chart,
  };
}

// ── callVM ────────────────────────────────────────────────────────────────────
// Generic helper to call GCP VM Mumbai endpoints

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

  // Strip markdown fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

  // Find first { ... }
  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`No JSON object found. Raw (${cleaned.length}): ${cleaned.slice(0, 200)}`);

  cleaned = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(cleaned);
  } catch (e: any) {
    // Attempt to fix trailing commas
    const fixed = cleaned.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(fixed);
    } catch {
      throw new Error(`JSON parse failed. Raw (${cleaned.length}): ${cleaned.slice(0, 300)}`);
    }
  }
}

// ── saveToSupabase ────────────────────────────────────────────────────────────

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
  const { data, error } = await supabase
    .from('predictions')
    .insert({
      session_id:       p.sessionId,
      user_id:          p.userId ?? null,
      domain_id:        p.domainId,
      prediction_tier:  p.predictionTier,
      birth_data:       p.birthData,
      user_context:     p.userContext,
      kundali_data:     p.kundaliData,
      synthesis_data:   p.synthesisData,
      template_html:    p.templateHtml,
      prediction_json:  p.predictionJson,
      gemini_model:     p.geminiModel,
      polished:         p.polished,
      processing_ms:    p.processingMs,
      public_slug:      p.publicSlug,
      seo_title:        p.seoMeta?.title        ?? null,
      seo_description:  p.seoMeta?.description  ?? null,
      created_at:       new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw new Error(`Supabase save failed: ${error.message}`);
  return data.id as string;
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────

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
    predictionTier = 'free',   // Default to free if not sent
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
  if (!GEMINI_API_KEY) return NextResponse.json({ error: 'Gemini API key missing' },     { status: 500 });
  if (!EPHE_API_URL)   return NextResponse.json({ error: 'Ephemeris API not configured' }, { status: 500 });

  // ── Select Gemini model based on tier ──────────────────────────────────────
  // FREE  → gemini-2.5-flash (fast, cheap, 150-200w summary)
  // PAID  → gemini-2.5-pro   (deep, 800-1200w + Claude Sonnet 4.6 polish)
  const geminiModel  = predictionTier === 'paid' ? GEMINI_PRO : GEMINI_FLASH;
  const usePolish    = predictionTier === 'paid';

  console.log(`[TV-Predict] START | tier:${predictionTier} | domain:${domainId} | model:${geminiModel} | polish:${usePolish}`);

  // ── Build BirthData ────────────────────────────────────────────────────────
  const localBirthData: BirthData = {
    name:     birthData.name     ?? 'Anonymous',
    dob:      birthData.dob,
    tob:      birthData.tob,
    lat:      birthData.lat,
    lng:      birthData.lng,
    cityName: birthData.cityName ?? '',
    timezone: birthData.timezone ?? 5.5,
    ayanamsa: 'lahiri',
  };

  // ── Get domain config ──────────────────────────────────────────────────────
  let domainConfig: any;
  try {
    domainConfig = getDomainConfig(domainId);
  } catch {
    return NextResponse.json({ error: `Unknown domain: ${domainId}` }, { status: 400 });
  }

  // ── CEO LOCKED: verifiedTier ───────────────────────────────────────────────
  // verifiedTier drives Supabase tier storage + UI depth display
  // DO NOT change without CEO approval
  const verifiedTier: UserTier = predictionTier === 'paid' ? 'premium' : 'free';

  let kundaliData:   KundaliData | null = null;
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
      timezone: localBirthData.timezone,
      ayanamsa: 1,  // Lahiri
    }, 25000);

    console.log(`[TV-Predict] /kundali OK — lagna:${rawChart.lagna?.sign} | shadbala:${
      rawChart.shadbala ? 'yes' : 'no'
    } | ms:${Date.now() - startMs}`);

    kundaliData = adaptSwissToKundali(rawChart, localBirthData);

  } catch (err: any) {
    console.error('[TV-Predict] /kundali failed (non-fatal — using Meeus fallback):', err.message);
    // Meeus fallback — kundaliData stays null, gemini-prompt handles gracefully
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 2: /synthesize — GCP VM Mumbai (Parashara + Bhrigu + Shadbala)
  // ────────────────────────────────────────────────────────────────────────────
  try {
    synthesisData = await callVM('/synthesize', {
      chart:      rawChart,
      birth_data: {
        dob:      localBirthData.dob,
        tob:      localBirthData.tob,
        lat:      localBirthData.lat,
        lng:      localBirthData.lng,
        timezone: localBirthData.timezone,
      },
      domain_id:    domainId,
      person2_data: person2Data ?? null,
    }, 25000);

    console.log(`[TV-Predict] /synthesize OK | yogas:${synthesisData?.parashara?.totalActiveYogas ?? 0} | ms:${Date.now() - startMs}`);

  } catch (err: any) {
    console.warn('[TV-Predict] /synthesize failed (non-fatal):', err.message);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 3: /template — GCP VM Mumbai (Template Engine v2.0)
  // ────────────────────────────────────────────────────────────────────────────
  try {
    const templateRes = await callVM('/template', {
      domain_id:     domainId,
      chart:         rawChart,
      synthesis:     synthesisData,
      birth_data:    localBirthData,
      user_context:  userContext,
      tier:          predictionTier,
    }, 15000);

    templateHtml = templateRes?.html ?? templateRes?.template ?? null;
    console.log(`[TV-Predict] /template OK | chars:${templateHtml?.length ?? 0} | ms:${Date.now() - startMs}`);

  } catch (err: any) {
    console.warn('[TV-Predict] /template failed (non-fatal):', err.message);
    // Template failure is non-fatal — prediction still delivers without it
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 4: Build Gemini prompt (lean v5.0 — no JSON schema, summary focused)
  // ────────────────────────────────────────────────────────────────────────────
  const promptUserContext: UserContext = {
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

  // Always pass tier:'basic' to gemini-prompt (controls output length token use)
  // geminiModel (Flash vs Pro) controls actual AI quality independently
  const { systemPrompt, userMessage } = buildPredictionPrompt(
    domainId,
    kundaliData,
    synthesisData,
    promptUserContext,
    'basic',           // prompt tier = lean always (truncation fix)
    predictionTier,    // prediction tier = for prompt personalisation hints
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
        {
          tier:     'premium',
          language: userContext.language,
          domain:   domainId,
        }
      );

      if (polishedResult) {
        predictionJson = polishedResult;
        polished       = true;
        console.log(`[TV-Predict] Claude polish OK | ms:${Date.now() - startMs}`);
      }
    } catch (err: any) {
      console.warn('[TV-Predict] Claude polish failed (non-fatal):', err.message);
      // Polish failure is non-fatal — Gemini Pro result still delivered
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 7: Generate SEO slug + meta
  // ────────────────────────────────────────────────────────────────────────────
  const processingMs = Date.now() - startMs;

  const publicSlug = generatePredictionSlug({
    domainId,
    kundaliData,
    cityName: localBirthData.cityName,
  });

  const seoMeta = generateSeoMeta({
    domainId,
    domainLabel:   domainLabel ?? domainConfig?.label ?? domainId,
    cityName:      localBirthData.cityName ?? '',
    predictionJson,
  });

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
    console.error('[TV-Predict] Supabase save failed:', err.message);
    return NextResponse.json(
      { error: `Failed to save prediction: ${err.message}` },
      { status: 500 }
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 9: Notify Google Indexing (non-fatal, fire-and-forget)
  // ────────────────────────────────────────────────────────────────────────────
  try {
    notifyGoogleIndexing(`https://trikalvaani.com/report/${publicSlug}`);
  } catch {
    // Non-fatal — indexing notification is best-effort
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 10: Return response
  // ────────────────────────────────────────────────────────────────────────────
  const reportUrl = `https://trikalvaani.com/report/${publicSlug}`;

  console.log(`[TV-Predict] COMPLETE | tier:${predictionTier} | model:${geminiModel} | polished:${polished} | ms:${processingMs}`);

  return NextResponse.json({
    success:       true,
    prediction:    predictionJson,
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
