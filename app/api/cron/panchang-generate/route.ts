/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/api/cron/panchang-generate/route.ts
 * Version:     v1.0
 * Phase:       C3 — AI Content Engine (Daily Cron)
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com
 * GitHub:      vaanitrikal-Dev/TrikalVaani
 * Created:     May 09, 2026
 *
 * PURPOSE:
 *   Vercel cron job. Runs daily at 4:00 AM IST (22:30 UTC prev day).
 *   Generates 11 panchang rows: 1 hub (national, Gemini Pro)
 *                              + 10 city rows (Flash).
 *   Writes to Supabase, then triggers IndexNow for new URLs.
 *
 * SCHEDULE:
 *   Vercel cron expression in vercel.json: "30 22 * * *"
 *   = 22:30 UTC daily = 04:00 IST (UTC+5:30)
 *
 * COST PROFILE (CEO-approved, BALANCED scope):
 *   Hub (Pro):    1 row × ₹3.0  = ₹3.0/day
 *   Cities:       10 × ₹0.5     = ₹5.0/day  (revised from ₹2.5 — 10 rows not 5)
 *   Daily total:  ~₹8/day
 *   Monthly:      ~₹240/month   (all-in, conservative estimate)
 *
 * IRON RULES:
 *   1. Bearer auth via CRON_SECRET — Vercel injects this header automatically.
 *   2. Idempotent — Supabase UPSERT, safe to re-run.
 *   3. Each row generation is wrapped in try/catch — one failure does NOT abort batch.
 *   4. Every run logged to panchang_generation_log.
 *   5. NEVER imports gemini-prompt.ts (LOCKED). Uses gemini-prompt-panchang.ts.
 *
 * ENV VARS REQUIRED (Vercel project → Settings → Environment Variables):
 *   - CRON_SECRET                  (Vercel auto-generates, you mirror it)
 *   - GEMINI_API_KEY               (Google AI Studio)
 *   - SUPABASE_URL                 (already exists)
 *   - SUPABASE_SERVICE_ROLE_KEY    (already exists)
 *   - VM_PANCHANG_URL              ("http://34.14.164.105:8001")
 *   - SITE_URL                     ("https://trikalvaani.com")
 *   - INDEXNOW_KEY                 (32-char hex — see indexnow setup file)
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
export const maxDuration = 300; // 5 minutes — needed for 11 sequential AI calls

// ============================================================================
// CITIES — locked to blueprint
// ============================================================================

const CITIES: CityContext[] = [
  { slug: "delhi",     name: "Delhi NCR",  state: "Delhi",      lat: 28.6139, lon: 77.2090 },
  { slug: "mumbai",    name: "Mumbai",     state: "Maharashtra", lat: 19.0760, lon: 72.8777 },
  { slug: "noida",     name: "Noida",      state: "Uttar Pradesh", lat: 28.5355, lon: 77.3910 },
  { slug: "gurgaon",   name: "Gurgaon",    state: "Haryana",    lat: 28.4595, lon: 77.0266 },
  { slug: "bangalore", name: "Bangalore",  state: "Karnataka",  lat: 12.9716, lon: 77.5946 },
  { slug: "hyderabad", name: "Hyderabad",  state: "Telangana",  lat: 17.3850, lon: 78.4867 },
  { slug: "pune",      name: "Pune",       state: "Maharashtra", lat: 18.5204, lon: 73.8567 },
  { slug: "kolkata",   name: "Kolkata",    state: "West Bengal", lat: 22.5726, lon: 88.3639 },
  { slug: "chennai",   name: "Chennai",    state: "Tamil Nadu", lat: 13.0827, lon: 80.2707 },
  { slug: "ahmedabad", name: "Ahmedabad",  state: "Gujarat",    lat: 23.0225, lon: 72.5714 },
];

// ============================================================================
// CONFIG
// ============================================================================

const VM_URL = process.env.VM_PANCHANG_URL || "http://34.14.164.105:8001";
const SITE_URL = process.env.SITE_URL || "https://trikalvaani.com";
const TARGET_LANG: Lang = "en"; // Phase C launches with EN; HI added in C-bis
const CRON_SECRET = process.env.CRON_SECRET;

// ============================================================================
// HELPERS
// ============================================================================

function getTodayISO(): string {
  // Use IST date (cron fires at 4 AM IST → "today" is the IST calendar day)
  const now = new Date();
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).toISOString().split("T")[0];
}

async function fetchPanchangFromVM(
  date: string,
  lat?: number,
  lon?: number
): Promise<PanchangData> {
  const params = new URLSearchParams({ date });
  if (lat !== undefined) params.set("lat", String(lat));
  if (lon !== undefined) params.set("lon", String(lon));

  const url = `${VM_URL}/panchang/today?${params.toString()}`;
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
      maxOutputTokens, // 12000 — CEO-locked
      temperature,
      // thinkingBudget INTENTIONALLY OMITTED — never set to 0
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
  // Approx Gemini pricing (May 2026, INR paise per 1K tokens)
  if (model === "gemini-2.5-pro") {
    return Math.ceil(tokensIn * 0.105 + tokensOut * 0.42); // ~₹105/1M in, ₹420/1M out
  }
  // Flash
  return Math.ceil(tokensIn * 0.025 + tokensOut * 0.1); // ~₹25/1M in, ₹100/1M out
}

// ============================================================================
// SUPABASE CLIENT (service role — server-only, never expose)
// ============================================================================

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ============================================================================
// SINGLE-ROW GENERATION (used by both hub and city loops)
// ============================================================================

interface GenerationResult {
  date: string;
  city_slug: string;
  lang: Lang;
  status: "success" | "failed";
  url?: string;
  error?: string;
  cost_paise?: number;
}

async function generateOneRow(args: {
  date: string;
  citySlug: string;
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

  // Insert pending log row
  const { data: logRow } = await supabase
    .from("panchang_generation_log")
    .insert({
      date,
      city_slug: citySlug,
      lang,
      status: "pending",
      model_used: cfg.model,
    })
    .select("id, run_id")
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

    // UPSERT into panchang_daily
    const { error: upsertErr } = await supabase
      .from("panchang_daily")
      .upsert(
        {
          date,
          city_slug: citySlug,
          lang,
          tithi: panchang.tithi,
          nakshatra: panchang.nakshatra,
          yoga: panchang.yoga,
          karana: panchang.karana,
          vara: panchang.vara,
          sunrise: panchang.sunrise,
          sunset: panchang.sunset,
          rahu_kaal: panchang.rahu_kaal,
          abhijit_muhurat: panchang.abhijit_muhurat ?? null,
          yamaganda: panchang.yamaganda ?? null,
          gulika: panchang.gulika ?? null,
          moon_sign: panchang.moon_sign ?? null,
          sun_sign: panchang.sun_sign ?? null,
          geo_answer: content.geo_answer,
          intro_paragraph: content.intro_paragraph,
          spiritual_significance: content.spiritual_significance,
          dos_and_donts: content.dos_and_donts,
          remedies: content.remedies,
          faq_json: content.faq,
          meta_title: content.meta_title,
          meta_description: content.meta_description,
          schema_keywords: content.schema_keywords,
          generated_by: cfg.model,
          prompt_version: "panchang-v1.0",
          cost_inr_paise: costPaise,
        },
        { onConflict: "date,city_slug,lang" }
      );

    if (upsertErr) throw new Error(`Supabase upsert: ${upsertErr.message}`);

    // Mark log success
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

    return {
      date,
      city_slug: citySlug,
      lang,
      status: "success",
      url: publicUrl,
      cost_paise: costPaise,
    };
  } catch (err: any) {
    const errorMsg = err?.message ?? String(err);
    console.error(`[panchang-cron] ${citySlug}/${date}/${lang} FAILED:`, errorMsg);

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

    return { date, city_slug: citySlug, lang, status: "failed", error: errorMsg };
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(req: NextRequest) {
  // -------- AUTH --------
  const authHeader = req.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const date = getTodayISO();
  const results: GenerationResult[] = [];

  console.log(`[panchang-cron] START date=${date} cities=${CITIES.length}`);

  // -------- 1. HUB ROW (national, Gemini Pro) --------
  try {
    const nationalPanchang = await fetchPanchangFromVM(date); // no lat/lon = national/IST default
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
  } catch (err: any) {
    console.error(`[panchang-cron] HUB fetch failed:`, err?.message);
    results.push({
      date,
      city_slug: "national",
      lang: TARGET_LANG,
      status: "failed",
      error: err?.message,
    });
  }

  // -------- 2. CITY ROWS (10x, Gemini Flash, sequential to respect rate limits) --------
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
    } catch (err: any) {
      console.error(`[panchang-cron] city=${city.slug} fetch failed:`, err?.message);
      results.push({
        date,
        city_slug: city.slug,
        lang: TARGET_LANG,
        status: "failed",
        error: err?.message,
      });
    }
  }

  // -------- 3. INDEXNOW PUSH (only newly successful URLs) --------
  const successUrls = results.filter((r) => r.status === "success" && r.url).map((r) => r.url!);
  let indexnowResult: any = { skipped: true };

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

      // Mark indexnow_pushed = true for these log rows
      const supabase = getSupabaseAdmin();
      await supabase
        .from("panchang_generation_log")
        .update({ indexnow_pushed: true })
        .in("indexnow_url", successUrls)
        .eq("date", date)
        .eq("status", "success");
    } catch (err: any) {
      console.error(`[panchang-cron] IndexNow failed:`, err?.message);
      indexnowResult = { error: err?.message };
    }
  }

  // -------- 4. SUMMARY --------
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
// END — app/api/cron/panchang-generate/route.ts v1.0
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
