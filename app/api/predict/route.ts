/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 11.1 — Polish timeout 90s + correct field mapping
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v11.1 vs v11.0:
 *   ✅ Claude polish timeout: 45s → 90s (was timing out on paid)
 *   ✅ Polish called for 'paid' predictionTier (was checking wrong var)
 *   ✅ simpleSummary merged into predictionJson root for ReportPublicClient
 *   ✅ geo_answer saved correctly from geoDirectAnswer.text
 *   ✅ simple_summary saved from simpleSummary.text (Gemini/polished)
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

async function callVM(endpoint: string, body: object, timeoutMs = 30000): Promise<any> {
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
// CRITICAL: Template engine gives structure/analysis
// Gemini gives personalised summary text
// Both merged into one predictionJson for ReportPublicClient

function mergeTemplateWithGemini(
  templateObj: Record<string,any> | null,
  geminiObj:   Record<string,any>,
): Record<string,any> {
  if (!templateObj || typeof templateObj !== 'object') {
    console.warn('[TV-v11] No template data — Gemini only');
    return geminiObj;
  }

  // ── Extract simpleSummary fields to ROOT level for easy access ────────────
  // ReportPublicClient reads: coreMessage, doAction, avoidAction (from template)
  // AND: simpleSummary.text, simpleSummary.keyMessage (from Gemini)
  const ss = geminiObj.simpleSummary ?? {};

  const merged = {
    // ── Template primary fields (Vedic analysis) ──────────────────────────
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
    // Template-generated core message (for S2 do/avoid cards)
    coreMessage:      templateObj.coreMessage       ?? null,
    doAction:         templateObj.doAction          ?? null,
    avoidAction:      templateObj.avoidAction       ?? null,

    // ── Gemini primary fields (personalised summary) ──────────────────────
    simpleSummary:    ss,
    // Promote key Gemini fields to root for easy extraction
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
    // Keep action windows from Gemini as text hint (template has structured ones)
    actionWindowText: geminiObj.actionWindow         ?? null,
    avoidWindowText:  geminiObj.avoidWindow          ?? null,

    // ── Metadata ──────────────────────────────────────────────────────────
    _source:  'template+gemini',
    _version: '11.1',
  };

  console.log(`[TV-v11] Merged OK | template:${Object.keys(templateObj).length} keys | gemini:${Object.keys(geminiObj).length} keys`);
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
  const nakshatra = moonPlanet?.nakshatra ?? null;
  const mahadasha = rawChart?.dasha?.mahadasha?.lord ?? null;
  const antardasha= rawChart?.dasha?.antardasha?.lord ?? null;
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

async function saveToSupabase(p: {
  sessionId:string; userId?:string; domainId:string; domainLabel:string;
  predictionTier:PredictionTier; birthData:BirthData; userContext:any;
  kundaliData:KundaliData|null; rawChart:any; synthesisData:any;
  predictionJson:Record<string,any>; geminiModel:string; polished:boolean;
  processingMs:number; publicSlug:string;
  seoMeta:ReturnType<typeof buildSeoGeoMeta>;
  chartExtract:ReturnType<typeof extractFromRawChart>;
}): Promise<string> {

  // Extract best text for simple_summary column
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

  const { data, error } = await supabase
    .from('predictions').insert(insertPayload).select('id').single();

  if (error || !data) {
    console.error('[TV-v11-Supabase] Insert failed:', error?.message ?? 'null data');
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return data.id as string;
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
  // v11.1: usePolish = true for ANY paid prediction
  const usePolish   = predictionTier === 'paid';

  console.log(`[TV-v11] START | tier:${predictionTier} | domain:${domainId} | model:${geminiModel} | polish:${usePolish}`);

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

  // ── STEP 1: /kundali ─────────────────────────────────────────────────────
  try {
    rawChart = await callVM('/kundali', {
      dob: localBirthData.dob, tob: localBirthData.tob,
      lat: localBirthData.lat, lng: localBirthData.lng,
      timezone: birthData.timezone ?? 5.5, ayanamsa: 1,
    }, 25000);
    console.log(`[TV-v11] /kundali OK | lagna:${rawChart?.lagna?.sign} | ms:${Date.now()-startMs}`);
  } catch (err: any) {
    console.error(`[TV-v11] /kundali failed (Meeus fallback): ${err.message}`);
  }

  const chartExtract = extractFromRawChart(rawChart);
  console.log(`[TV-v11] chartExtract | lagna:${chartExtract.lagna} | MD:${chartExtract.mahadasha}`);

  // ── STEP 2: /synthesize ───────────────────────────────────────────────────
  try {
    synthesisData = await callVM('/synthesize', {
      kundaliData: rawChart,
      birthData: {
        dob: localBirthData.dob, tob: localBirthData.tob,
        lat: localBirthData.lat, lng: localBirthData.lng,
        timezone: birthData.timezone ?? 5.5,
      },
      domainId, person2Data: person2Data ?? null,
    }, 25000);
    console.log(`[TV-v11] /synthesize OK | ms:${Date.now()-startMs}`);
  } catch (err: any) {
    console.warn(`[TV-v11] /synthesize failed: ${err.message}`);
  }

  // ── STEP 3: /template ─────────────────────────────────────────────────────
  try {
    const templateRes = await callVM('/template', {
      domain:      domainId,
      kundaliData: { chart: rawChart, synthesis: synthesisData, birthData: localBirthData, tier: predictionTier },
      sessionId,
      lang: userContext.language === 'english' ? 'en' : 'hi',
    }, 15000);

    templateData = templateRes?.template ?? templateRes?.html ?? null;
    if (templateData && typeof templateData === 'object') {
      console.log(`[TV-v11] /template OK | keys:${Object.keys(templateData).join(',')} | ms:${Date.now()-startMs}`);
    } else {
      console.warn('[TV-v11] /template unexpected format');
      templateData = null;
    }
  } catch (err: any) {
    console.warn(`[TV-v11] /template failed: ${err.message}`);
  }

  // ── STEP 4: Build Gemini prompt (LOCKED — never touch gemini-prompt.ts) ──
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

  // ── STEP 5: Call Gemini ───────────────────────────────────────────────────
  console.log(`[TV-v11] Gemini ${geminiModel} | maxTokens:${MAX_TOKENS} | ms:${Date.now()-startMs}`);

  let geminiJson: Record<string,any>;
  try {
    const rawGemini = await callGemini(geminiModel, systemPrompt, userMessage, true);
    console.log(`[TV-v11] Gemini raw:${rawGemini.length}chars | ms:${Date.now()-startMs}`);
    geminiJson = parseGeminiJSON(rawGemini);
    console.log(`[TV-v11] Gemini parsed | keys:${Object.keys(geminiJson).join(',')} | ms:${Date.now()-startMs}`);
  } catch (err: any) {
    console.error(`[TV-v11] Gemini failed: ${err.message}`);
    return NextResponse.json({ error: `Prediction failed: ${err.message}` }, { status: 500 });
  }

  // ── STEP 6: MERGE template + Gemini ──────────────────────────────────────
  let predictionJson = mergeTemplateWithGemini(templateData, geminiJson);

  // ── STEP 7: Claude polish — PAID only ─────────────────────────────────────
  // v11.1 FIX: timeout increased to 90s (was 45s — was timing out)
  let polished = false;

  if (usePolish) {
    try {
      console.log(`[TV-v11] Claude polish starting | ms:${Date.now()-startMs}`);

      // Set global timeout override for this request
      process.env.CLAUDE_POLISH_TIMEOUT = '90000';

      const polishedResult = await polishPrediction(
        predictionJson,
        userContext.language,
        localBirthData.name ?? 'Anonymous',
        domainConfig?.label ?? domainId,
        verifiedTier,
      );

      if (polishedResult?.polished && polishedResult.prediction) {
        // Re-merge after polish — preserve template structure
        predictionJson = mergeTemplateWithGemini(
          templateData,
          polishedResult.prediction as Record<string,any>
        );
        polished = true;
        console.log(`[TV-v11] Claude polish OK | ms:${Date.now()-startMs}`);
      } else {
        console.warn(`[TV-v11] Claude polish returned unpolished: ${polishedResult?.error}`);
      }
    } catch (err: any) {
      console.warn(`[TV-v11] Claude polish failed (non-fatal): ${err.message}`);
    }
  }

  // ── STEP 8: SEO slug + meta ───────────────────────────────────────────────
  const processingMs     = Date.now() - startMs;
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

  console.log(`[TV-v11] SEO | slug:${publicSlug} | geo:${seoMeta.geoAnswer.slice(0,40)}`);

  // ── STEP 9: Save to Supabase ──────────────────────────────────────────────
  let predictionId: string;
  try {
    predictionId = await saveToSupabase({
      sessionId, userId, domainId,
      domainLabel:    domainConfig.label ?? domainId,
      predictionTier, birthData: localBirthData,
      userContext:    promptUserContext,
      kundaliData, rawChart, synthesisData,
      predictionJson, geminiModel, polished,
      processingMs, publicSlug, seoMeta, chartExtract,
    });
    console.log(`[TV-v11] Saved | id:${predictionId} | slug:${publicSlug}`);
  } catch (err: any) {
    console.error(`[TV-v11] Supabase throw: ${err.message}`);
    predictionId = `temp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  }

  // ── STEP 10: Google Indexing ──────────────────────────────────────────────
  try { notifyGoogleIndexing(`https://trikalvaani.com/report/${publicSlug}`); }
  catch { /* non-fatal */ }

  // ── STEP 11: Return ───────────────────────────────────────────────────────
  const reportUrl = `https://trikalvaani.com/report/${publicSlug}`;
  console.log(`[TV-v11] COMPLETE | tier:${predictionTier} | polished:${polished} | ms:${processingMs}`);

  return NextResponse.json({
    success:      true,
    prediction:   predictionJson,
    templateHtml: null,
    _meta: {
      predictionId, publicSlug, reportUrl,
      predictionTier, geminiModel, polished, processingMs, domainId,
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
