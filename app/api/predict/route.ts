/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 11.0 — COMPLETE REBUILD
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ── WHAT v11.0 FIXES vs v10.1 ────────────────────────────────
 *   ✅ Template engine data correctly merged INTO predictionJson
 *   ✅ planetTable, dashaTimeline, actionWindows, remedyPlan,
 *      panchang, geoDirectAnswer — all extracted from template
 *      and merged with Gemini output before Supabase save
 *   ✅ templateHtml = null (no raw object dump — React renders)
 *   ✅ Lagna extracted from rawChart.lagna.sign → saved to DB
 *   ✅ Nakshatra extracted from rawChart → saved to DB
 *   ✅ Mahadasha/Antardasha from rawChart → saved to DB
 *   ✅ SEO meta description uses geoDirectAnswer.text (not null)
 *   ✅ geo_answer saved to Supabase correctly
 *   ✅ domain_label saved from domainConfig.label
 *   ✅ All VM field names verified against actual VM endpoints
 *   ✅ /synthesize uses correct camelCase fields
 *   ✅ /template uses correct {domain, kundaliData, sessionId, lang}
 *
 * ── IRON RULES — NEVER VIOLATE ───────────────────────────────
 *   🔒 NEVER touch gemini-prompt.ts
 *   🔒 NEVER use thinkingBudget:0
 *   🔒 MAX_TOKENS = 12000 — CEO approved, never change
 *   🔒 verifiedTier logic — CEO approval required to change
 *   🔒 Always deliver complete files, never partial patches
 *   🔒 CEO protection header on every file
 *
 * ── FULL FLOW v11.0 ──────────────────────────────────────────
 *   Step 1  → /kundali   (GCP VM — Swiss Ephemeris)
 *   Step 2  → /synthesize (GCP VM — Bhrigu+Parashara+Panchang)
 *   Step 3  → /template  (GCP VM — Template Engine v2.0)
 *   Step 4  → buildPredictionPrompt() — LOCKED
 *   Step 5  → Gemini (Flash=free / Pro=paid)
 *   Step 6  → parseGeminiJSON()
 *   Step 7  → MERGE: template data + Gemini output → finalJson
 *   Step 8  → Claude Sonnet 4.6 polish (paid only)
 *   Step 9  → generateSlug + generateSeoMeta
 *   Step 10 → saveToSupabase (all columns populated correctly)
 *   Step 11 → notifyGoogleIndexing (fire and forget)
 *   Step 12 → Return response
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient }              from '@supabase/supabase-js';
import { getDomainConfig }           from '@/lib/domain-config';
import { buildPredictionPrompt }     from '@/lib/gemini-prompt';
import { polishPrediction }          from '@/lib/claude-polish';
import { generatePredictionSlug, generateSeoMeta } from '@/lib/slug';
import { notifyGoogleIndexing }      from '@/lib/google-indexing';
import { buildKundali }              from '@/lib/swiss-ephemeris';
import type { KundaliData, BirthData } from '@/lib/swiss-ephemeris';
import type { DomainConfig, DomainId } from '@/lib/domain-config';
import type { UserTier, UserContext }   from '@/lib/gemini-prompt';

export const maxDuration = 300;

// ── Model Config ──────────────────────────────────────────────────────────────
const GEMINI_FLASH    = 'gemini-2.5-flash';
const GEMINI_PRO      = 'gemini-2.5-pro';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_API_KEY  = process.env.GEMINI_API_KEY  ?? '';
const EPHE_API_URL    = process.env.EPHE_API_URL    ?? '';
const EPHE_API_KEY    = process.env.EPHE_API_KEY    ?? '';

// ── CEO APPROVED: MAX_TOKENS = 12000 — NEVER CHANGE ──────────────────────────
const MAX_TOKENS = 12000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Types ─────────────────────────────────────────────────────────────────────

type PredictionTier = 'free' | 'paid' | 'voice';

interface PredictRequest {
  userId?:         string;
  sessionId:       string;
  domainId:        DomainId;
  domainLabel?:    string;
  predictionTier?: PredictionTier;
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
    segment:              'genz' | 'millennial' | 'genx';
    employment:           string;
    sector:               string;
    language:             'hindi' | 'hinglish' | 'english';
    city:                 string;
    currentCity?:         string;
    relationshipStatus?:  string;
    situationNote?:       string;
    mobile?:              string;
    person2Name?:         string | null;
    person2City?:         string | null;
    person2CurrentCity?:  string | null;
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

async function callVM(
  endpoint: string,
  body: object,
  timeoutMs = 30000,
): Promise<any> {
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
      throw new Error(`VM ${endpoint} → ${res.status}: ${text.slice(0, 300)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ── callGemini ────────────────────────────────────────────────────────────────

async function callGemini(
  model:        string,
  systemPrompt: string,
  userMessage:  string,
  jsonMode      = true,
): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const body: any = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: {
      maxOutputTokens: MAX_TOKENS,   // CEO LOCKED — never change
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
  if (start === -1 || end === -1)
    throw new Error(`No JSON found. Raw (${cleaned.length}): ${cleaned.slice(0, 200)}`);

  cleaned = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try fixing trailing commas
    const fixed = cleaned.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(fixed);
    } catch {
      throw new Error(`JSON parse failed. Raw (${cleaned.length}): ${cleaned.slice(0, 300)}`);
    }
  }
}

// ── mergeTemplateWithGemini ───────────────────────────────────────────────────
// CRITICAL FIX v11.0:
// Template engine returns rich structured data (planetTable, geoDirectAnswer,
// actionWindows, remedyPlan, panchang, dashaTimeline, templateStyle).
// Gemini returns summary/prediction text fields.
// We merge BOTH so ReportPublicClient has everything it needs.

function mergeTemplateWithGemini(
  templateObj: Record<string, any> | null,
  geminiObj:   Record<string, any>,
): Record<string, any> {

  if (!templateObj || typeof templateObj !== 'object') {
    console.warn('[TV-v11] No template data — using Gemini only');
    return geminiObj;
  }

  // Template fields that Gemini does NOT generate — always take from template
  const templatePrimary = {
    planetTable:      templateObj.planetTable      ?? [],
    dashaTimeline:    templateObj.dashaTimeline     ?? {},
    actionWindows:    templateObj.actionWindows     ?? [],
    avoidWindows:     templateObj.avoidWindows      ?? [],
    remedyPlan:       templateObj.remedyPlan        ?? {},
    panchang:         templateObj.panchang          ?? {},
    geoDirectAnswer:  templateObj.geoDirectAnswer   ?? {},
    geoFaq:           templateObj.geoFaq            ?? [],
    howtoSteps:       templateObj.howtoSteps        ?? [],
    templateStyle:    templateObj.templateStyle     ?? {},
    searchIntents:    templateObj.searchIntents     ?? {},
    confidenceBadge:  templateObj.confidenceBadge   ?? {},
    domainAnalysis:   templateObj.domainAnalysis    ?? {},
    dashaWindowMeta:  templateObj.dashaWindowMeta   ?? {},
    seoSchema:        templateObj.seoSchema         ?? {},
    cta:              templateObj.cta               ?? {},
    meta:             templateObj.meta              ?? {},
  };

  // Gemini fields that template does NOT generate — always take from Gemini
  const geminiPrimary = {
    // Gemini summary/prediction text
    coreMessage:          geminiObj.coreMessage          ?? null,
    doAction:             geminiObj.doAction             ?? null,
    avoidAction:          geminiObj.avoidAction          ?? null,
    summary:              geminiObj.summary              ?? null,
    simpleSummary:        geminiObj.simpleSummary        ?? null,
    trikal_sandesh:       geminiObj.trikal_sandesh       ?? null,
    headline:             geminiObj.headline             ?? null,
    // Paid tier full analysis
    professionalEnglish:  geminiObj.professionalEnglish  ?? null,
    fullAnalysis:         geminiObj.fullAnalysis         ?? null,
    yogasFound:           geminiObj.yogasFound           ?? null,
    // Any other Gemini-specific fields
    confidence:           geminiObj.confidence           ?? null,
  };

  const merged = {
    ...templatePrimary,
    ...geminiPrimary,
    // Mark as merged
    _source: 'template+gemini',
    _version: '11.0',
  };

  console.log(`[TV-v11] Merged | templateKeys:${Object.keys(templatePrimary).length} | geminiKeys:${Object.keys(geminiPrimary).length}`);
  return merged;
}

// ── extractFromRawChart ───────────────────────────────────────────────────────
// Extract lagna, nakshatra, mahadasha, antardasha from VM /kundali response
// These are saved as flat columns in Supabase for fast querying + SEO meta

function extractFromRawChart(rawChart: any): {
  lagna:      string | null;
  nakshatra:  string | null;
  mahadasha:  string | null;
  antardasha: string | null;
} {
  if (!rawChart) return { lagna: null, nakshatra: null, mahadasha: null, antardasha: null };

  // Lagna — VM returns rawChart.lagna.sign
  const lagna = rawChart?.lagna?.sign
             ?? rawChart?.lagna?.rashi
             ?? rawChart?.lagnaSign
             ?? null;

  // Moon nakshatra
  const moonPlanet = rawChart?.grahas?.find?.((g: any) =>
    g.planet === 'Moon' || g.name === 'Moon'
  );
  const nakshatra = moonPlanet?.nakshatra
                 ?? rawChart?.moonNakshatra
                 ?? null;

  // Mahadasha from dasha
  const mahadasha = rawChart?.dasha?.mahadasha?.lord
                 ?? rawChart?.currentDasha?.mahadasha
                 ?? rawChart?.mahadasha
                 ?? null;

  const antardasha = rawChart?.dasha?.antardasha?.lord
                  ?? rawChart?.currentDasha?.antardasha
                  ?? rawChart?.antardasha
                  ?? null;

  return { lagna, nakshatra, mahadasha, antardasha };
}

// ── buildSeoGeoMeta ───────────────────────────────────────────────────────────
// Build complete SEO + GEO meta from merged prediction data
// Used for: seo_title, seo_description, geo_answer in Supabase
// And: generateMetadata() in page.tsx

function buildSeoGeoMeta(
  slug:         string,
  domainId:     string,
  domainLabel:  string,
  mahadasha:    string,
  antardasha:   string,
  cityName:     string,
  mergedJson:   Record<string, any>,
): {
  title:       string;
  description: string;
  canonical:   string;
  geoAnswer:   string;
} {
  // GEO Direct Answer — 40-60 words for AI search (Google SGE, Perplexity, ChatGPT)
  const geoAnswerText = typeof mergedJson.geoDirectAnswer === 'object'
    ? (mergedJson.geoDirectAnswer?.text ?? '')
    : (mergedJson.geoDirectAnswer ?? '');

  // SEO title — keyword rich, under 60 chars
  const title = `${domainLabel} Prediction — ${mahadasha}-${antardasha} Dasha | ${cityName} | Trikal Vaani`;

  // SEO description — 150-160 chars, includes GEO answer
  const description = geoAnswerText
    ? `${geoAnswerText.slice(0, 140)}... Rohiit Gupta, Chief Vedic Architect.`
    : `Vedic astrology ${domainLabel} analysis for ${cityName}. ${mahadasha} Mahadasha, ${antardasha} Antardasha. Swiss Ephemeris + BPHS classical. Rohiit Gupta, Trikal Vaani.`;

  const canonical = `https://trikalvaani.com/report/${slug}`;

  return {
    title:       title.slice(0, 70),
    description: description.slice(0, 165),
    canonical,
    geoAnswer:   geoAnswerText,
  };
}

// ── saveToSupabase ────────────────────────────────────────────────────────────
// v11.0: All columns populated correctly
// CEO approved null guard — returns temp ID if insert fails

async function saveToSupabase(p: {
  sessionId:       string;
  userId?:         string;
  domainId:        string;
  domainLabel:     string;
  predictionTier:  PredictionTier;
  birthData:       BirthData;
  userContext:     any;
  kundaliData:     KundaliData | null;
  rawChart:        any;
  synthesisData:   any;
  predictionJson:  Record<string, any>;  // merged template+gemini
  geminiModel:     string;
  polished:        boolean;
  processingMs:    number;
  publicSlug:      string;
  seoMeta:         ReturnType<typeof buildSeoGeoMeta>;
  chartExtract:    ReturnType<typeof extractFromRawChart>;
}): Promise<string> {

  // ── SEO/GEO fields from merged JSON ──────────────────────────────────────
  const geoFaq        = p.predictionJson.geoFaq        ?? [];
  const howtoSteps    = p.predictionJson.howtoSteps     ?? [];
  const searchIntents = p.predictionJson.searchIntents  ?? {};
  const templateStyle = p.predictionJson.templateStyle  ?? {};

  // ── simple_summary for SEO — Gemini text or GEO answer ───────────────────
  const simpleSummary =
    p.predictionJson.coreMessage      ??
    p.predictionJson.summary          ??
    p.predictionJson.trikal_sandesh   ??
    p.seoMeta.geoAnswer               ??
    null;

  const insertPayload = {

    // ── Core identifiers ──────────────────────────────────────────────────
    session_id:       p.sessionId,
    domain_id:        p.domainId,
    domain_label:     p.domainLabel,
    tier:             p.predictionTier === 'paid' ? 'premium' : 'free',
    prediction_tier:  p.predictionTier,
    user_id:          p.userId ?? null,

    // ── Birth fields ──────────────────────────────────────────────────────
    person_name:      p.birthData.name     ?? null,
    dob:              p.birthData.dob      ?? null,
    birth_time:       p.birthData.tob      ?? null,
    birth_city:       p.birthData.cityName ?? null,
    birth_lat:        p.birthData.lat      ?? null,
    birth_lng:        p.birthData.lng      ?? null,
    birth_timezone:   p.birthData.timezone ?? null,

    // ── Kundali flat columns (from rawChart — Swiss Ephemeris accurate) ───
    lagna:            p.chartExtract.lagna      ?? p.kundaliData?.lagna?.rashi ?? null,
    nakshatra:        p.chartExtract.nakshatra  ?? p.kundaliData?.planets?.['Moon']?.nakshatra ?? null,
    mahadasha:        p.chartExtract.mahadasha  ?? p.kundaliData?.currentMahadasha?.lord ?? null,
    antardasha:       p.chartExtract.antardasha ?? p.kundaliData?.currentAntardasha?.lord ?? null,

    // ── User context ──────────────────────────────────────────────────────
    language:         p.userContext.language   ?? null,
    segment:          p.userContext.segment    ?? null,
    employment:       p.userContext.employment ?? null,
    sector:           p.userContext.sector     ?? null,

    // ── Chart source ──────────────────────────────────────────────────────
    chart_source:     p.rawChart ? 'swiss-ephemeris-vm' : 'swiss-ephemeris-meeus',

    // ── Prediction output — MERGED template+gemini ────────────────────────
    prediction:       p.predictionJson,
    prediction_json:  p.predictionJson,

    // ── SEO/GEO columns ───────────────────────────────────────────────────
    simple_summary:   simpleSummary,
    headline:         p.predictionJson.headline ?? null,
    geo_answer:       p.seoMeta.geoAnswer       ?? null,
    geo_faq:          geoFaq.length > 0         ? geoFaq        : null,
    howto_steps:      howtoSteps.length > 0     ? howtoSteps    : null,
    search_intents:   Object.keys(searchIntents).length > 0 ? searchIntents : null,
    template_style:   Object.keys(templateStyle).length > 0 ? templateStyle : null,

    // ── Confidence ────────────────────────────────────────────────────────
    confidence:       p.predictionJson.confidenceBadge?.score
                   ?? p.predictionJson.confidence
                   ?? null,

    // ── Rich data columns ─────────────────────────────────────────────────
    birth_data:       p.birthData,
    user_context:     p.userContext,
    kundali_data:     p.kundaliData,
    synthesis_data:   p.synthesisData,
    template_html:    null,   // v11.0: always null — React renders from prediction_json

    // ── Processing meta ───────────────────────────────────────────────────
    gemini_model:     p.geminiModel,
    polished:         p.polished,
    search_used:      false,
    processing_ms:    p.processingMs,

    // ── SEO page meta ─────────────────────────────────────────────────────
    public_slug:      p.publicSlug,
    seo_title:        p.seoMeta.title       ?? null,
    seo_description:  p.seoMeta.description ?? null,
    is_public:        true,
    is_indexed:       false,

    created_at:       new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('predictions')
    .insert(insertPayload)
    .select('id')
    .single();

  // ── CEO APPROVED NULL GUARD — never crashes prediction flow ───────────
  if (error || !data) {
    console.error('[TV-v11-Supabase] Insert failed:', error?.message ?? 'null data');
    console.error('[TV-v11-Supabase] Failed payload keys:', Object.keys(insertPayload).join(', '));
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  return data.id as string;
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startMs = Date.now();

  // ── Parse body ──────────────────────────────────────────────────────────
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
    predictionTier = 'free',
    birthData,
    userContext,
    person2Data,
  } = body;

  // ── Voice guard ─────────────────────────────────────────────────────────
  if (predictionTier === 'voice') {
    return NextResponse.json(
      { error: 'Voice predictions use /api/voice endpoint' },
      { status: 400 },
    );
  }

  // ── Env checks ──────────────────────────────────────────────────────────
  if (!GEMINI_API_KEY)
    return NextResponse.json({ error: 'Gemini API key missing' }, { status: 500 });
  if (!EPHE_API_URL)
    return NextResponse.json({ error: 'Ephemeris API URL not configured' }, { status: 500 });

  // ── Gemini model selection ──────────────────────────────────────────────
  const geminiModel = predictionTier === 'paid' ? GEMINI_PRO : GEMINI_FLASH;
  const usePolish   = predictionTier === 'paid';

  console.log(`[TV-v11] START | tier:${predictionTier} | domain:${domainId} | model:${geminiModel} | session:${sessionId}`);

  // ── Build BirthData ─────────────────────────────────────────────────────
  const localBirthData: BirthData = {
    name:     birthData.name     ?? 'Anonymous',
    dob:      birthData.dob,
    tob:      birthData.tob,
    lat:      birthData.lat,
    lng:      birthData.lng,
    cityName: birthData.cityName ?? 'India',
    timezone: birthData.timezone ?? 5.5,
  };

  // ── Domain config ───────────────────────────────────────────────────────
  let domainConfig: DomainConfig;
  try {
    domainConfig = getDomainConfig(domainId);
  } catch {
    return NextResponse.json({ error: `Unknown domain: ${domainId}` }, { status: 400 });
  }

  // ── CEO LOCKED: verifiedTier — DO NOT CHANGE ────────────────────────────
  const verifiedTier: UserTier = predictionTier === 'paid' ? 'premium' : 'free';

  // ── Build local kundali (Meeus fallback) ────────────────────────────────
  const kundaliData: KundaliData = buildKundali(localBirthData);

  // ── State variables ─────────────────────────────────────────────────────
  let rawChart:     any = null;
  let synthesisData:any = null;
  let templateData: any = null;   // template engine object (NOT HTML string)

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 1: /kundali — GCP VM Swiss Ephemeris
  // ──────────────────────────────────────────────────────────────────────────
  try {
    rawChart = await callVM('/kundali', {
      dob:      localBirthData.dob,
      tob:      localBirthData.tob,
      lat:      localBirthData.lat,
      lng:      localBirthData.lng,
      timezone: birthData.timezone ?? 5.5,
      ayanamsa: 1,  // Lahiri
    }, 25000);

    console.log(`[TV-v11] /kundali OK | lagna:${rawChart?.lagna?.sign} | ms:${Date.now() - startMs}`);

  } catch (err: any) {
    console.error(`[TV-v11] /kundali failed (Meeus fallback active): ${err.message}`);
    // rawChart = null → Meeus values from buildKundali() used downstream
  }

  // Extract chart values early for use throughout
  const chartExtract = extractFromRawChart(rawChart);
  console.log(`[TV-v11] Chart extract | lagna:${chartExtract.lagna} | nakshatra:${chartExtract.nakshatra} | MD:${chartExtract.mahadasha}`);

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 2: /synthesize — GCP VM (Bhrigu + Parashara + Panchang + Confidence)
  // ──────────────────────────────────────────────────────────────────────────
  try {
    synthesisData = await callVM('/synthesize', {
      // VM expects camelCase — verified against main.py
      kundaliData:  rawChart,
      birthData: {
        dob:      localBirthData.dob,
        tob:      localBirthData.tob,
        lat:      localBirthData.lat,
        lng:      localBirthData.lng,
        timezone: birthData.timezone ?? 5.5,
      },
      domainId:    domainId,
      person2Data: person2Data ?? null,
    }, 25000);

    console.log(`[TV-v11] /synthesize OK | yogas:${synthesisData?.parashara?.totalActiveYogas ?? 0} | ms:${Date.now() - startMs}`);

  } catch (err: any) {
    console.warn(`[TV-v11] /synthesize failed (non-fatal): ${err.message}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 3: /template — GCP VM Template Engine v2.0
  // Returns: {success: true, template: {planetTable, geoDirectAnswer, ...}}
  // ──────────────────────────────────────────────────────────────────────────
  try {
    const templateRes = await callVM('/template', {
      // VM expects exactly: domain, kundaliData, sessionId, lang
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

    // VM returns {success: true, template: {...rich object...}}
    // Extract the template object — NOT the wrapper
    templateData = templateRes?.template ?? templateRes?.html ?? null;

    if (templateData && typeof templateData === 'object') {
      console.log(`[TV-v11] /template OK | keys:${Object.keys(templateData).join(',')} | ms:${Date.now() - startMs}`);
    } else {
      console.warn(`[TV-v11] /template returned unexpected format:`, typeof templateData);
      templateData = null;
    }

  } catch (err: any) {
    console.warn(`[TV-v11] /template failed (non-fatal): ${err.message}`);
    templateData = null;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 4: Build Gemini prompt
  // 🔒 IRON RULE: gemini-prompt.ts is NEVER touched — CEO LOCKED
  // ──────────────────────────────────────────────────────────────────────────
  const promptUserContext: UserContext = {
    tier:               verifiedTier,   // CEO LOCKED — never change
    segment:            userContext.segment,
    employment:         userContext.employment,
    sector:             userContext.sector,
    language:           userContext.language,
    city:               userContext.city,
    currentCity:        userContext.currentCity       || userContext.city,
    relationshipStatus: userContext.relationshipStatus ?? '',
    situationNote:      (userContext.situationNote    ?? '').slice(0, 100),
    mobile:             userContext.mobile             ?? '',
    person2Name:        userContext.person2Name        ?? null,
    person2City:        userContext.person2City        ?? null,
    person2CurrentCity: userContext.person2CurrentCity ?? null,
  };

  const { systemPrompt, userMessage } = buildPredictionPrompt(
    kundaliData,
    localBirthData,
    domainConfig,
    promptUserContext,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 5: Call Gemini
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`[TV-v11] Calling Gemini ${geminiModel} | maxTokens:${MAX_TOKENS} | ms:${Date.now() - startMs}`);

  let geminiJson: Record<string, any>;

  try {
    const rawGemini = await callGemini(geminiModel, systemPrompt, userMessage, true);
    console.log(`[TV-v11] Gemini raw length:${rawGemini.length} | ms:${Date.now() - startMs}`);

    geminiJson = parseGeminiJSON(rawGemini);
    console.log(`[TV-v11] Gemini parsed OK | keys:${Object.keys(geminiJson).join(',')} | ms:${Date.now() - startMs}`);

  } catch (err: any) {
    console.error(`[TV-v11] Gemini failed: ${err.message}`);
    return NextResponse.json(
      { error: `Prediction generation failed: ${err.message}` },
      { status: 500 },
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 6 (CRITICAL v11.0 FIX): MERGE template + Gemini → finalPredictionJson
  //
  // This is the ROOT FIX for:
  // - Raw JSON dump on report page (templateHtml was object, now null)
  // - Missing planetTable, geoDirectAnswer, actionWindows, remedyPlan, panchang
  // - Missing coreMessage, doAction, avoidAction
  // ──────────────────────────────────────────────────────────────────────────
  const finalPredictionJson = mergeTemplateWithGemini(templateData, geminiJson);
  console.log(`[TV-v11] Final merged JSON | keys:${Object.keys(finalPredictionJson).join(',')} | ms:${Date.now() - startMs}`);

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 7: Claude Sonnet 4.6 polish — PAID only
  // ──────────────────────────────────────────────────────────────────────────
  let predictionJson = finalPredictionJson;
  let polished       = false;

  if (usePolish) {
    try {
      console.log(`[TV-v11] Claude Sonnet 4.6 polish starting | ms:${Date.now() - startMs}`);

      const polishedResult = await polishPrediction(
        predictionJson,
        userContext.language,
        localBirthData.name ?? 'Anonymous',
        domainConfig?.label ?? domainId,
        verifiedTier,
      );

      if (polishedResult?.polished && polishedResult.prediction) {
        // Re-merge after polish to preserve template structure
        predictionJson = mergeTemplateWithGemini(templateData, polishedResult.prediction);
        polished       = true;
        console.log(`[TV-v11] Claude polish OK | ms:${Date.now() - startMs}`);
      }
    } catch (err: any) {
      console.warn(`[TV-v11] Claude polish failed (non-fatal): ${err.message}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 8: Generate SEO slug + complete SEO/GEO meta
  // ──────────────────────────────────────────────────────────────────────────
  const processingMs = Date.now() - startMs;

  // Use chart extract → kundaliData fallback for slug
  const mahadashaPlanet  = chartExtract.mahadasha  ?? kundaliData?.currentMahadasha?.lord  ?? 'rahu';
  const antardashaPlanet = chartExtract.antardasha ?? kundaliData?.currentAntardasha?.lord ?? 'saturn';

  const publicSlug = generatePredictionSlug({
    domainId,
    mahadasha:  mahadashaPlanet,
    antardasha: antardashaPlanet,
    city:       localBirthData.cityName ?? 'india',
  });

  // Build complete SEO/GEO meta from merged JSON
  const seoMeta = buildSeoGeoMeta(
    publicSlug,
    domainId,
    domainConfig.label ?? domainId,
    mahadashaPlanet,
    antardashaPlanet,
    localBirthData.cityName ?? 'India',
    predictionJson,
  );

  console.log(`[TV-v11] SEO | slug:${publicSlug} | title:${seoMeta.title.slice(0, 50)} | geo:${seoMeta.geoAnswer.slice(0, 50)}`);

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 9: Save to Supabase — all columns correctly populated
  // ──────────────────────────────────────────────────────────────────────────
  let predictionId: string;

  try {
    predictionId = await saveToSupabase({
      sessionId,
      userId,
      domainId,
      domainLabel:    domainConfig.label ?? domainId,
      predictionTier,
      birthData:      localBirthData,
      userContext:    promptUserContext,
      kundaliData,
      rawChart,
      synthesisData,
      predictionJson, // MERGED template+gemini
      geminiModel,
      polished,
      processingMs,
      publicSlug,
      seoMeta,
      chartExtract,
    });

    console.log(`[TV-v11] Saved to Supabase | id:${predictionId} | slug:${publicSlug}`);

  } catch (err: any) {
    console.error(`[TV-v11] Supabase unexpected throw: ${err.message}`);
    predictionId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 10: Notify Google Indexing API (fire and forget — non-fatal)
  // Every new prediction = new SEO page = Google notified immediately
  // ──────────────────────────────────────────────────────────────────────────
  try {
    notifyGoogleIndexing(`https://trikalvaani.com/report/${publicSlug}`);
  } catch {
    // Non-fatal — Google Indexing failure never blocks user
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 11: Return response to client
  // ──────────────────────────────────────────────────────────────────────────
  const reportUrl = `https://trikalvaani.com/report/${publicSlug}`;

  console.log(`[TV-v11] COMPLETE | tier:${predictionTier} | model:${geminiModel} | polished:${polished} | ms:${processingMs}`);

  return NextResponse.json({
    success:      true,
    prediction:   predictionJson,   // full merged JSON for client
    templateHtml: null,             // v11.0: always null — no raw object dump
    _meta: {
      predictionId,
      publicSlug,
      reportUrl,
      predictionTier,
      geminiModel,
      polished,
      processingMs,
      domainId,
      domainLabel:    domainConfig.label ?? domainId,
      lagna:          chartExtract.lagna,
      nakshatra:      chartExtract.nakshatra,
      mahadasha:      mahadashaPlanet,
      antardasha:     antardashaPlanet,
      seoTitle:       seoMeta.title,
      seoDescription: seoMeta.description,
      geoAnswer:      seoMeta.geoAnswer,
    },
  });
}
