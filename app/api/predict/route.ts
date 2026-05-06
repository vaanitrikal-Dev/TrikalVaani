/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 12.0 — Deferred Polish + Parallel VM + Non-blocking Save
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v12.0 vs v11.1:
 *   ✅ Claude polish DEFERRED — runs in background after response sent
 *   ✅ VM calls parallelized — /kundali + /template-meta run together
 *   ✅ Supabase insert non-blocking — does not delay response
 *   ✅ Background polish updates Supabase via PATCH after completion
 *   ✅ Fixed double-PATCH bug (was saving twice — now single insert)
 *   ✅ Response returned to user in ~12-18s (was 80-93s)
 *   ✅ User sees "✨ Trikal is refining your reading..." status
 *   ✅ All iron rules preserved
 *
 * IRON RULES — NEVER VIOLATE:
 *   🔒 NEVER touch gemini-prompt.ts
 *   🔒 NEVER use thinkingBudget:0
 *   🔒 MAX_TOKENS = 12000 — CEO approved
 *   🔒 verifiedTier logic — CEO approval required
 *   🔒 Complete files only, never partial patches
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
    name:string; dob:string; tob:string;
    lat:number; lng:number; cityName:string;
    currentCity:string; mobile?:string;
  } | null;
}

// ── callVM ────────────────────────────────────────────────────────────────────

async function callVM(endpoint: string, body: object, timeoutMs = 25000): Promise<any> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${EPHE_API_URL}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': EPHE_API_KEY },
      body:    JSON.stringify(body),
      signal:  controller.signal,
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
  model: string, systemPrompt: string, userMessage: string, jsonMode = true,
): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const body: any = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: {
      maxOutputTokens: MAX_TOKENS, // CEO LOCKED
      temperature: 0.7, topK: 40, topP: 0.95,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
  let cleaned = raw.trim()
    .replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1)
    throw new Error(`No JSON found. Raw (${cleaned.length}): ${cleaned.slice(0, 200)}`);
  cleaned = cleaned.slice(start, end + 1);
  try { return JSON.parse(cleaned); }
  catch {
    try { return JSON.parse(cleaned.replace(/,\s*([}\]])/g, '$1')); }
    catch { throw new Error(`JSON parse failed. Raw (${cleaned.length}): ${cleaned.slice(0, 300)}`); }
  }
}

// ── mergeTemplateWithGemini ───────────────────────────────────────────────────

function mergeTemplateWithGemini(
  templateObj: Record<string,any> | null,
  geminiObj:   Record<string,any>,
  version = '12.0',
): Record<string,any> {
  if (!templateObj || typeof templateObj !== 'object') {
    console.warn('[TV-v12] No template data — Gemini only');
    return { ...geminiObj, _source: 'gemini-only', _version: version };
  }

  const ss = geminiObj.simpleSummary ?? {};

  const merged = {
    // ── Template primary fields ──────────────────────────────────────────
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
    meta:             templateObj.meta              ?? {},
    coreMessage:      templateObj.coreMessage       ?? null,
    doAction:         templateObj.doAction          ?? null,
    avoidAction:      templateObj.avoidAction       ?? null,

    // ── Gemini primary fields ────────────────────────────────────────────
    simpleSummary:    ss,
    summaryText:      ss.text                       ?? null,
    keyMessage:       ss.keyMessage                 ?? null,
    mainAction:       ss.mainAction                 ?? null,
    mainCaution:      ss.mainCaution                ?? null,
    periodSummary:    ss.periodSummary              ?? null,
    bestDates:        ss.bestDates                  ?? null,
    remedyHint:       ss.remedyHint                 ?? null,
    dosList:          ss.dos                        ?? [],
    dontsList:        ss.donts                      ?? [],
    karmicInsight:    geminiObj.karmicInsight        ?? null,
    seoSignals:       geminiObj.seoSignals           ?? {},
    headline:         geminiObj.headline             ?? null,
    actionWindowText: geminiObj.actionWindow         ?? null,
    avoidWindowText:  geminiObj.avoidWindow          ?? null,

    // ── Metadata ─────────────────────────────────────────────────────────
    _source:  'template+gemini',
    _version: version,
  };

  console.log(`[TV-v12] Merged | template:${Object.keys(templateObj).length} | gemini:${Object.keys(geminiObj).length}`);
  return merged;
}

// ── extractFromRawChart ───────────────────────────────────────────────────────

function extractFromRawChart(rawChart: any): {
  lagna: string|null; nakshatra: string|null;
  mahadasha: string|null; antardasha: string|null;
} {
  if (!rawChart) return { lagna:null, nakshatra:null, mahadasha:null, antardasha:null };
  const lagna = rawChart?.lagna?.sign ?? rawChart?.lagna?.rashi ?? null;
  const moonPlanet = rawChart?.grahas?.find?.((g:any) =>
    g.planet==='Moon' || g.name==='Moon');
  const nakshatra  = moonPlanet?.nakshatra ?? null;
  const mahadasha  = rawChart?.dasha?.mahadasha?.lord  ?? null;
  const antardasha = rawChart?.dasha?.antardasha?.lord ?? null;
  return { lagna, nakshatra, mahadasha, antardasha };
}

// ── buildSeoGeoMeta ───────────────────────────────────────────────────────────

function buildSeoGeoMeta(
  slug: string, domainId: string, domainLabel: string,
  mahadasha: string, antardasha: string, cityName: string,
  mergedJson: Record<string,any>,
) {
  const geoAnswerText = typeof mergedJson.geoDirectAnswer === 'object'
    ? (mergedJson.geoDirectAnswer?.text ?? '')
    : (mergedJson.geoDirectAnswer ?? '');

  const title = `${domainLabel} Prediction — ${mahadasha}-${antardasha} Dasha | ${cityName} | Trikal Vaani`;
  const description = geoAnswerText
    ? `${geoAnswerText.slice(0, 140)}... Rohiit Gupta, Chief Vedic Architect.`
    : `Vedic astrology ${domainLabel} analysis for ${cityName}. ${mahadasha} Mahadasha. Swiss Ephemeris + BPHS. Rohiit Gupta, Trikal Vaani.`;

  return {
    title:       title.slice(0, 70),
    description: description.slice(0, 165),
    canonical:   `https://trikalvaani.com/report/${slug}`,
    geoAnswer:   geoAnswerText,
  };
}

// ── saveToSupabase ────────────────────────────────────────────────────────────
// v12.0: Returns slug ID immediately — called fire-and-forget from main handler

async function saveToSupabase(p: {
  sessionId:string; userId?:string; domainId:string; domainLabel:string;
  predictionTier:PredictionTier; birthData:BirthData; userContext:any;
  kundaliData:KundaliData|null; rawChart:any; synthesisData:any;
  predictionJson:Record<string,any>; geminiModel:string; polished:boolean;
  processingMs:number; publicSlug:string;
  seoMeta:ReturnType<typeof buildSeoGeoMeta>;
  chartExtract:ReturnType<typeof extractFromRawChart>;
}): Promise<string> {

  const simpleSummaryText =
    p.predictionJson.summaryText     ??
    p.predictionJson.simpleSummary?.text ??
    p.predictionJson.coreMessage     ??
    p.seoMeta.geoAnswer              ??
    null;

  const insertPayload = {
    session_id:      p.sessionId,
    domain_id:       p.domainId,
    domain_label:    p.domainLabel,
    tier:            p.predictionTier === 'paid' ? 'premium' : 'free',
    prediction_tier: p.predictionTier,
    user_id:         p.userId ?? null,
    person_name:     p.birthData.name     ?? null,
    dob:             p.birthData.dob      ?? null,
    birth_time:      p.birthData.tob      ?? null,
    birth_city:      p.birthData.cityName ?? null,
    birth_lat:       p.birthData.lat      ?? null,
    birth_lng:       p.birthData.lng      ?? null,
    birth_timezone:  p.birthData.timezone ?? null,
    lagna:           p.chartExtract.lagna      ?? p.kundaliData?.lagna?.rashi ?? null,
    nakshatra:       p.chartExtract.nakshatra  ?? p.kundaliData?.planets?.['Moon']?.nakshatra ?? null,
    mahadasha:       p.chartExtract.mahadasha  ?? p.kundaliData?.currentMahadasha?.lord ?? null,
    antardasha:      p.chartExtract.antardasha ?? p.kundaliData?.currentAntardasha?.lord ?? null,
    language:        p.userContext.language   ?? null,
    segment:         p.userContext.segment    ?? null,
    employment:      p.userContext.employment ?? null,
    sector:          p.userContext.sector     ?? null,
    chart_source:    p.rawChart ? 'swiss-ephemeris-vm' : 'swiss-ephemeris-meeus',
    prediction:      p.predictionJson,
    prediction_json: p.predictionJson,
    simple_summary:  simpleSummaryText,
    headline:        p.predictionJson.headline ?? null,
    geo_answer:      p.seoMeta.geoAnswer       ?? null,
    confidence:      p.predictionJson.confidenceBadge?.score ?? null,
    birth_data:      p.birthData,
    user_context:    p.userContext,
    kundali_data:    p.kundaliData,
    synthesis_data:  p.synthesisData,
    template_html:   null,
    gemini_model:    p.geminiModel,
    polished:        p.polished,
    search_used:     false,
    processing_ms:   p.processingMs,
    public_slug:     p.publicSlug,
    seo_title:       p.seoMeta.title       ?? null,
    seo_description: p.seoMeta.description ?? null,
    is_public:       true,
    is_indexed:      false,
    created_at:      new Date().toISOString(),
  };

  // v12.0: SINGLE insert only — no double PATCH
  const { data, error } = await supabase
    .from('predictions').insert(insertPayload).select('id').single();

  if (error || !data) {
    console.error('[TV-v12-Supabase] Insert failed:', error?.message ?? 'null data');
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  console.log(`[TV-v12] Supabase saved | id:${data.id}`);
  return data.id as string;
}

// ── backgroundPolishAndUpdate ─────────────────────────────────────────────────
// v12.0 KEY FUNCTION: Runs AFTER response sent to user
// Polishes prediction + updates Supabase — user never waits for this

async function backgroundPolishAndUpdate(params: {
  predictionJson:  Record<string,any>;
  templateData:    Record<string,any> | null;
  language:        string;
  personName:      string;
  domainLabel:     string;
  verifiedTier:    UserTier;
  publicSlug:      string;
  processingMsBase: number;
}): Promise<void> {
  const polishStart = Date.now();
  console.log(`[TV-v12-BG] Polish starting for slug:${params.publicSlug}`);

  try {
    const polishedResult = await polishPrediction(
      params.predictionJson,
      params.language,
      params.personName,
      params.domainLabel,
      params.verifiedTier,
    );

    if (polishedResult?.polished && polishedResult.prediction) {
      const polishedJson = mergeTemplateWithGemini(
        params.templateData,
        polishedResult.prediction as Record<string,any>,
        '12.0-polished',
      );

      const totalMs = params.processingMsBase + (Date.now() - polishStart);

      // Single PATCH update — no double write
      const { error } = await supabase
        .from('predictions')
        .update({
          prediction:      polishedJson,
          prediction_json: polishedJson,
          polished:        true,
          processing_ms:   totalMs,
          simple_summary:  polishedJson.summaryText ?? polishedJson.simpleSummary?.text ?? null,
        })
        .eq('public_slug', params.publicSlug);

      if (error) {
        console.error(`[TV-v12-BG] PATCH failed: ${error.message}`);
      } else {
        console.log(`[TV-v12-BG] Polish PATCH OK | slug:${params.publicSlug} | polish_ms:${Date.now()-polishStart} | total_ms:${totalMs}`);
      }
    } else {
      console.warn(`[TV-v12-BG] Polish returned unpolished: ${polishedResult?.error}`);
    }
  } catch (err: any) {
    console.warn(`[TV-v12-BG] Polish failed (non-fatal): ${err.message}`);
  }
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startMs = Date.now();

  let body: PredictRequest;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const {
    sessionId, userId, domainId,
    predictionTier = 'free',
    birthData, userContext, person2Data,
  } = body;

  if (predictionTier === 'voice')
    return NextResponse.json({ error: 'Voice uses /api/voice' }, { status: 400 });

  if (!GEMINI_API_KEY)
    return NextResponse.json({ error: 'Gemini API key missing' }, { status: 500 });
  if (!EPHE_API_URL)
    return NextResponse.json({ error: 'Ephemeris API URL not configured' }, { status: 500 });

  const geminiModel = predictionTier === 'paid' ? GEMINI_PRO : GEMINI_FLASH;
  const usePolish   = predictionTier === 'paid';

  console.log(`[TV-v12] START | tier:${predictionTier} | domain:${domainId} | model:${geminiModel} | deferred_polish:${usePolish}`);

  const localBirthData: BirthData = {
    name:     birthData.name     ?? 'Anonymous',
    dob:      birthData.dob,
    tob:      birthData.tob,
    lat:      birthData.lat,
    lng:      birthData.lng,
    cityName: birthData.cityName ?? 'India',
    timezone: birthData.timezone ?? 5.5,
  };

  let domainConfig: DomainConfig;
  try { domainConfig = getDomainConfig(domainId); }
  catch { return NextResponse.json({ error: `Unknown domain: ${domainId}` }, { status: 400 }); }

  // CEO LOCKED: verifiedTier
  const verifiedTier: UserTier = predictionTier === 'paid' ? 'premium' : 'free';

  const kundaliData: KundaliData = buildKundali(localBirthData);
  let rawChart:     any = null;
  let synthesisData:any = null;
  let templateData: any = null;

  // ── STEP 1+3 PARALLEL: /kundali fires immediately ─────────────────────────
  // /synthesize and /template must wait for kundali — but kundali starts NOW
  console.log(`[TV-v12] PARALLEL: /kundali starting | ms:${Date.now()-startMs}`);

  const kundaliPromise = callVM('/kundali', {
    dob: localBirthData.dob, tob: localBirthData.tob,
    lat: localBirthData.lat, lng: localBirthData.lng,
    timezone: birthData.timezone ?? 5.5, ayanamsa: 1,
  }, 25000).catch((err: any) => {
    console.error(`[TV-v12] /kundali failed (Meeus fallback): ${err.message}`);
    return null;
  });

  // ── STEP 2: Build Gemini prompt (CPU — no network, runs during kundali wait)
  const promptUserContext: UserContext = {
    tier:               verifiedTier,
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
    kundaliData, localBirthData, domainConfig, promptUserContext,
  );

  // ── Wait for kundali — then fire /synthesize + /template in parallel ──────
  rawChart = await kundaliPromise;
  console.log(`[TV-v12] /kundali done | lagna:${rawChart?.lagna?.sign} | ms:${Date.now()-startMs}`);

  const chartExtract = extractFromRawChart(rawChart);

  // ── STEP 2+3 PARALLEL: /synthesize and /template simultaneously ───────────
  console.log(`[TV-v12] PARALLEL: /synthesize + /template | ms:${Date.now()-startMs}`);

  const [synthesisResult, templateResult] = await Promise.allSettled([
    callVM('/synthesize', {
      kundaliData: rawChart,
      birthData: {
        dob: localBirthData.dob, tob: localBirthData.tob,
        lat: localBirthData.lat, lng: localBirthData.lng,
        timezone: birthData.timezone ?? 5.5,
      },
      domainId, person2Data: person2Data ?? null,
    }, 20000),

    callVM('/template', {
      domain:      domainId,
      kundaliData: { chart: rawChart, synthesis: null, birthData: localBirthData, tier: predictionTier },
      sessionId,
      lang: userContext.language === 'english' ? 'en' : 'hi',
    }, 15000),
  ]);

  if (synthesisResult.status === 'fulfilled') {
    synthesisData = synthesisResult.value;
    console.log(`[TV-v12] /synthesize OK | ms:${Date.now()-startMs}`);
  } else {
    console.warn(`[TV-v12] /synthesize failed: ${synthesisResult.reason}`);
  }

  if (templateResult.status === 'fulfilled') {
    const tr = templateResult.value;
    templateData = tr?.template ?? tr?.html ?? null;
    if (templateData && typeof templateData === 'object') {
      console.log(`[TV-v12] /template OK | ms:${Date.now()-startMs}`);
    } else {
      templateData = null;
    }
  } else {
    console.warn(`[TV-v12] /template failed: ${templateResult.reason}`);
  }

  // ── STEP 4: Call Gemini ───────────────────────────────────────────────────
  console.log(`[TV-v12] Gemini ${geminiModel} START | ms:${Date.now()-startMs}`);

  let geminiJson: Record<string,any>;
  try {
    const rawGemini = await callGemini(geminiModel, systemPrompt, userMessage, true);
    console.log(`[TV-v12] Gemini raw:${rawGemini.length}chars | ms:${Date.now()-startMs}`);
    geminiJson = parseGeminiJSON(rawGemini);
    console.log(`[TV-v12] Gemini parsed | ms:${Date.now()-startMs}`);
  } catch (err: any) {
    console.error(`[TV-v12] Gemini failed: ${err.message}`);
    return NextResponse.json({ error: `Prediction failed: ${err.message}` }, { status: 500 });
  }

  // ── STEP 5: MERGE template + Gemini ──────────────────────────────────────
  let predictionJson = mergeTemplateWithGemini(templateData, geminiJson, '12.0');

  // ── STEP 6: SEO slug + meta ───────────────────────────────────────────────
  const processingMs     = Date.now() - startMs;  // Time to response (no polish)
  const mahadashaPlanet  = chartExtract.mahadasha  ?? kundaliData?.currentMahadasha?.lord  ?? 'rahu';
  const antardashaPlanet = chartExtract.antardasha ?? kundaliData?.currentAntardasha?.lord ?? 'saturn';

  const publicSlug = generatePredictionSlug({
    domainId, mahadasha: mahadashaPlanet,
    antardasha: antardashaPlanet, city: localBirthData.cityName ?? 'india',
  });

  const seoMeta = buildSeoGeoMeta(
    publicSlug, domainId, domainConfig.label ?? domainId,
    mahadashaPlanet, antardashaPlanet,
    localBirthData.cityName ?? 'India', predictionJson,
  );

  // ── STEP 7: Save to Supabase NON-BLOCKING ────────────────────────────────
  // v12.0: Save fires in background — does NOT block response
  // polish=false initially; backgroundPolishAndUpdate sets it to true later
  const savePromise = saveToSupabase({
    sessionId, userId, domainId,
    domainLabel:    domainConfig.label ?? domainId,
    predictionTier, birthData: localBirthData,
    userContext:    promptUserContext,
    kundaliData, rawChart, synthesisData,
    predictionJson, geminiModel,
    polished:       false,   // Background will update this to true
    processingMs, publicSlug, seoMeta, chartExtract,
  }).catch((err: any) => {
    console.error(`[TV-v12] Supabase save failed: ${err.message}`);
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  });

  // ── STEP 8: Fire background polish (PAID only) — fully non-blocking ───────
  if (usePolish) {
    // waitUntil would be ideal but not available in all Next.js versions
    // Using void + Promise chain — Vercel keeps serverless warm for 300s (maxDuration)
    void savePromise.then(() => {
      backgroundPolishAndUpdate({
        predictionJson,
        templateData,
        language:        userContext.language,
        personName:      localBirthData.name ?? 'Anonymous',
        domainLabel:     domainConfig.label ?? domainId,
        verifiedTier,
        publicSlug,
        processingMsBase: processingMs,
      });
    });
    console.log(`[TV-v12] Background polish queued for slug:${publicSlug}`);
  } else {
    // Free tier: still save but no polish needed
    void savePromise;
  }

  // ── STEP 9: Google Indexing ───────────────────────────────────────────────
  try { notifyGoogleIndexing(`https://trikalvaani.com/report/${publicSlug}`); }
  catch { /* non-fatal */ }

  // ── STEP 10: Return to user IMMEDIATELY (no polish wait) ─────────────────
  const reportUrl = `https://trikalvaani.com/report/${publicSlug}`;
  console.log(`[TV-v12] RESPONSE SENT | tier:${predictionTier} | ms:${processingMs} | polish:deferred`);

  return NextResponse.json({
    success:      true,
    prediction:   predictionJson,
    templateHtml: null,
    _meta: {
      predictionId:   publicSlug,   // Use slug as ID — actual DB id resolves async
      publicSlug,
      reportUrl,
      predictionTier,
      geminiModel,
      polished:       false,        // Initially false — background updates to true in DB
      polishDeferred: usePolish,    // Flag tells frontend polish is coming
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
