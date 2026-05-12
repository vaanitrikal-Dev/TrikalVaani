/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/api/cron/panchang-generate/route.ts
 * Version:     v2.2 — FIXED (column names match actual Supabase schema)
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com
 * GitHub:      vaanitrikal-Dev/TrikalVaani
 *
 * FIXES vs v1.0:
 *   1. panchang_daily uses `city` not `city_slug` — fixed throughout
 *   2. onConflict changed to "date,city" (matches actual unique constraint)
 *   3. Removed `lang` (no such column in panchang_daily)
 *   4. Removed non-existent columns: intro_paragraph, spiritual_significance,
 *      dos_and_donts, remedies, faq_json, meta_title, meta_description,
 *      schema_keywords, generated_by, prompt_version, cost_inr_paise,
 *      abhijit_muhurat, yamaganda, moon_sign, sun_sign, gulika
 *   5. Uses actual columns: gemini_content, seo_title, seo_description,
 *      geo_answer, faq_schema, page_url, festivals, gulika_kaal, shubh_muhurat
 *   6. SUPABASE_URL env var (not NEXT_PUBLIC_SUPABASE_URL) for server-only client
 *   7. VM endpoint corrected to /panchang (not /panchang/today)
 *   8. panchang_generation_log uses city_slug (that table IS correct)
 *
 * SCHEDULE: vercel.json cron "30 22 * * *" = 04:00 IST daily
 *
 * ENV VARS REQUIRED:
 *   CRON_SECRET, GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
 *   SUPABASE_SERVICE_ROLE_KEY, VM_PANCHANG_URL, SITE_URL, INDEXNOW_KEY
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildPanchangHubPrompt,
  buildPanchangCityPrompt,
  GEMINI_CONFIG,
  parseGeminiPanchangResponse,
  type PanchangData,
  type CityContext,
  type GeminiPanchangResponse,
  type Lang,
} from "@/lib/gemini-prompt-panchang";

// ============================================================================
// VERCEL ROUTE CONFIG
// ============================================================================

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

// ============================================================================
// CITIES
// ============================================================================

const CITIES: CityContext[] = [
  { slug: "delhi",     name: "Delhi NCR",   state: "Delhi",           lat: 28.6139, lon: 77.2090 },
  { slug: "mumbai",    name: "Mumbai",      state: "Maharashtra",     lat: 19.0760, lon: 72.8777 },
  { slug: "noida",     name: "Noida",       state: "Uttar Pradesh",   lat: 28.5355, lon: 77.3910 },
  { slug: "gurgaon",   name: "Gurgaon",     state: "Haryana",         lat: 28.4595, lon: 77.0266 },
  { slug: "bangalore", name: "Bangalore",   state: "Karnataka",       lat: 12.9716, lon: 77.5946 },
  { slug: "hyderabad", name: "Hyderabad",   state: "Telangana",       lat: 17.3850, lon: 78.4867 },
  { slug: "pune",      name: "Pune",        state: "Maharashtra",     lat: 18.5204, lon: 73.8567 },
  { slug: "kolkata",   name: "Kolkata",     state: "West Bengal",     lat: 22.5726, lon: 88.3639 },
  { slug: "chennai",   name: "Chennai",     state: "Tamil Nadu",      lat: 13.0827, lon: 80.2707 },
  { slug: "ahmedabad", name: "Ahmedabad",   state: "Gujarat",         lat: 23.0225, lon: 72.5714 },
];

// ============================================================================
// CONFIG
// ============================================================================

const VM_URL = process.env.VM_PANCHANG_URL || "http://34.14.164.105:8001";
const SITE_URL = process.env.SITE_URL || "https://trikalvaani.com";
const TARGET_LANG: Lang = "en";
const CRON_SECRET = process.env.CRON_SECRET;

// ============================================================================
// HELPERS
// ============================================================================

function getTodayISO(): string {
  const now = new Date();
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).toISOString().split("T")[0];
}

// FIX: endpoint is /panchang not /panchang/today
async function fetchPanchangFromVM(
  date: string,
  lat?: number,
  lon?: number
): Promise<PanchangData> {
  const params = new URLSearchParams({ date });
  if (lat !== undefined) params.set("lat", String(lat));
  if (lon !== undefined) params.set("lon", String(lon));

  const url = `${VM_URL}/panchang?${params.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`VM panchang fetch failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as PanchangData;
}

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  maxOutputTokens: number,
  temperature: number
): Promise<{ text: string; tokensIn?: number; tokensOut?: number }> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const m = genAI.getGenerativeModel({
    model,
    generationConfig: {
      maxOutputTokens,
      temperature,
      responseMimeType: "application/json",
    },
  });

  const result = await m.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const usage = response.usageMetadata;

  return {
    text,
    tokensIn: usage?.promptTokenCount,
    tokensOut: usage?.candidatesTokenCount,
  };
}

function estimateCostPaise(model: string, tokensIn = 0, tokensOut = 0): number {
  if (model === "gemini-2.5-pro") {
    return Math.ceil(tokensIn * 0.105 + tokensOut * 0.42);
  }
  return Math.ceil(tokensIn * 0.025 + tokensOut * 0.1);
}

// FIX: use NEXT_PUBLIC_SUPABASE_URL (that's the actual Vercel env var name)
// with service_role key so RLS write policy allows INSERT
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ============================================================================
// RESULT TYPE
// ============================================================================

interface GenerationResult {
  date: string;
  city: string;           // FIX: renamed from city_slug to match panchang_daily
  status: "success" | "failed";
  url?: string;
  error?: string;
  cost_paise?: number;
}

// ============================================================================
// SINGLE ROW GENERATOR
// ============================================================================

async function generateOneRow(args: {
  date: string;
  citySlug: string;       // used for panchang_generation_log (that table has city_slug)
  lang: Lang;
  prompt: string;
  panchang: PanchangData;
  modelKey: keyof typeof GEMINI_CONFIG;
  publicUrl: string;
}): Promise<GenerationResult> {
  const { date, citySlug, lang, prompt, panchang, modelKey, publicUrl } = args;
  const supabase = getSupabaseAdmin();
  const cfg = GEMINI_CONFIG[modelKey];
  const apiKey = process.env.GEMINI_API_KEY!;

  // Log row — panchang_generation_log DOES have city_slug and lang columns
  const { data: logRow } = await supabase
    .from("panchang_generation_log")
    .insert({
      date,
      city_slug: citySlug,
      lang,
      status: "pending",
      model_used: cfg.model,
    })
    .select("id")
    .single();

  try {
    const { text, tokensIn, tokensOut } = await callGemini(
      apiKey,
      cfg.model,
      prompt,
      cfg.maxOutputTokens,
      cfg.temperature
    );

    const content: GeminiPanchangResponse = parseGeminiPanchangResponse(text);
    const costPaise = estimateCostPaise(cfg.model, tokensIn, tokensOut);

    // FIX: only insert columns that EXIST in panchang_daily
    // Column mapping: city (not city_slug), gemini_content (not intro_paragraph etc.)
    // onConflict: "date,city" — matches the unique constraint we fixed in Supabase
    const { error: upsertErr } = await supabase
      .from("panchang_daily")
      .upsert(
        {
          date,
          city: citySlug,                          // FIX: `city` not `city_slug`
          tithi: panchang.tithi,
          nakshatra: panchang.nakshatra,
          yoga: panchang.yoga,
          karana: panchang.karana,
          vara: panchang.vara,
          sunrise: panchang.sunrise,
          sunset: panchang.sunset,
          moonrise: panchang.moonrise ?? null,
          moonset: panchang.moonset ?? null,
          rahu_kaal: panchang.rahu_kaal,
          gulika_kaal: panchang.gulika ?? null,    // FIX: DB col is gulika_kaal
          shubh_muhurat: panchang.abhijit_muhurat ?? null,
          festivals: panchang.festivals ?? [],
          gemini_content: content.intro_paragraph ?? text, // FIX: store full Gemini text in gemini_content
          seo_title: content.meta_title,
          seo_description: content.meta_description,
          geo_answer: content.geo_answer,
          faq_schema: content.faq ?? [],           // FIX: DB col is faq_schema not faq_json
          page_url: publicUrl,
          indexnow_submitted: false,
        },
        { onConflict: "date,city" }               // FIX: matches actual constraint
      );

    if (upsertErr) throw new Error(`Supabase upsert: ${upsertErr.message}`);

    // Update log row
    if (logRow?.id) {
      await supabase
        .from("panchang_generation_log")
        .update({
          status: "success",
          tokens_in: tokensIn,
          tokens_out: tokensOut,
          cost_inr_paise: costPaise,
          run_finished_at: new Date().toISOString(),
          indexnow_url: publicUrl,
        })
        .eq("id", logRow.id);
    }

    return { date, city: citySlug, status: "success", url: publicUrl, cost_paise: costPaise };

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[panchang-cron] ${citySlug}/${date} FAILED:`, errorMsg);

    if (logRow?.id) {
      await supabase
        .from("panchang_generation_log")
        .update({
          status: "failed",
          error_message: errorMsg.substring(0, 1000),
          run_finished_at: new Date().toISOString(),
        })
        .eq("id", logRow.id);
    }

    return { date, city: citySlug, status: "failed", error: errorMsg };
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(req: NextRequest) {
  // Auth — Vercel injects Authorization: Bearer <CRON_SECRET> automatically
  const authHeader = req.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const date = getTodayISO();
  const results: GenerationResult[] = [];

  console.log(`[panchang-cron] START date=${date} cities=${CITIES.length}`);

  // 1. HUB ROW (national, Gemini Pro)
  try {
    const nationalPanchang = await fetchPanchangFromVM(date);
    const hubPrompt = buildPanchangHubPrompt(nationalPanchang, TARGET_LANG);
    const hubResult = await generateOneRow({
      date,
      citySlug: "national",
      lang: TARGET_LANG,
      prompt: hubPrompt,
      panchang: nationalPanchang,
      modelKey: "hub",
      publicUrl: `${SITE_URL}/panchang/${date}`,
    });
    results.push(hubResult);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[panchang-cron] HUB fetch failed:`, msg);
    results.push({ date, city: "national", status: "failed", error: msg });
  }

  // 2. CITY ROWS (10 cities, Gemini Flash, sequential)
  for (const city of CITIES) {
    try {
      const cityPanchang = await fetchPanchangFromVM(date, city.lat, city.lon);
      const cityPrompt = buildPanchangCityPrompt(cityPanchang, city, TARGET_LANG);
      const r = await generateOneRow({
        date,
        citySlug: city.slug,
        lang: TARGET_LANG,
        prompt: cityPrompt,
        panchang: cityPanchang,
        modelKey: "city",
        publicUrl: `${SITE_URL}/${city.slug}/panchang`,
      });
      results.push(r);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[panchang-cron] city=${city.slug} fetch failed:`, msg);
      results.push({ date, city: city.slug, status: "failed", error: msg });
    }
  }

  // 3. INDEXNOW PUSH for successful URLs
  const successUrls = results
    .filter((r) => r.status === "success" && r.url)
    .map((r) => r.url!);

  let indexnowResult: Record<string, unknown> = { skipped: true };

  if (successUrls.length > 0) {
    try {
      const indexnowRes = await fetch(`${SITE_URL}/api/cron/indexnow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CRON_SECRET}`,
        },
        body: JSON.stringify({ urls: successUrls }),
        signal: AbortSignal.timeout(30000),
      });
      indexnowResult = await indexnowRes.json();

      // Mark indexnow_submitted in panchang_daily
      const supabase = getSupabaseAdmin();
      await supabase
        .from("panchang_daily")
        .update({ indexnow_submitted: true, indexnow_at: new Date().toISOString() })
        .in("page_url", successUrls)
        .eq("date", date);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[panchang-cron] IndexNow failed:`, msg);
      indexnowResult = { error: msg };
    }
  }

  // 4. SUMMARY
  const totalCostPaise = results.reduce((s, r) => s + (r.cost_paise ?? 0), 0);
  const summary = {
    date,
    duration_ms: Date.now() - startedAt,
    rows_attempted: results.length,
    rows_success: results.filter((r) => r.status === "success").length,
    rows_failed: results.filter((r) => r.status === "failed").length,
    total_cost_inr: (totalCostPaise / 100).toFixed(2),
    indexnow: indexnowResult,
    results,
  };

  console.log(`[panchang-cron] DONE`, JSON.stringify(summary));
  return NextResponse.json(summary, { status: 200 });
}

// ============================================================================
// END — app/api/cron/panchang-generate/route.ts v2.1
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
