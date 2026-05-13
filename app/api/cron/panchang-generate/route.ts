/**
 * ============================================================================
 * TRIKAL VAANI — CEO PROTECTION HEADER
 * File:    app/api/cron/panchang-generate/route.ts
 * Version: v2.2 — VM normalization fix
 * Owner:   Rohiit Gupta, Chief Vedic Architect
 *
 * ROOT CAUSE FIXED:
 *   VM returns: { tithi: { name: "Ekadashi", paksha: "Krishna" } }
 *   Gemini needs: { tithi: "Ekadashi (Krishna Paksha)" }
 *   Without fix: Gemini got "[object Object]" -> parse fail -> gemini_content empty
 *   Fix: normalizeVMResponse() converts nested VM objects to flat strings
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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

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

const VM_URL = process.env.VM_PANCHANG_URL || "http://34.14.164.105:8001";
const SITE_URL = process.env.SITE_URL || "https://trikalvaani.com";
const TARGET_LANG: Lang = "en";
const CRON_SECRET = process.env.CRON_SECRET;

function getTodayISO(): string {
  const now = new Date();
  return new Date(now.getTime() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];
}

// VM returns nested objects — this interface captures what VM actually sends
interface VMRaw {
  tithi?: { name: string; paksha: string } | string;
  nakshatra?: { name: string; pada: number } | string;
  yoga?: { name: string } | string;
  karana?: { name: string } | string;
  vara?: string; weekday?: string;
  sunrise?: string; sunset?: string; moonrise?: string; moonset?: string;
  rahu_kaal?: string; abhijit_muhurat?: string;
  gulika?: string; gulika_kaal?: string;
  yamaganda?: string; moon_sign?: string; sun_sign?: string;
  festivals?: object[];
}

// THE FIX: convert VM nested objects to flat strings PanchangData expects
function normalizeVM(raw: VMRaw, date: string): PanchangData {
  const str = (v: { name: string } | string | undefined): string => {
    if (!v) return "";
    if (typeof v === "string") return v;
    return v.name;
  };

  let tithi = "";
  if (typeof raw.tithi === "object" && raw.tithi) {
    tithi = raw.tithi.paksha ? raw.tithi.name + " (" + raw.tithi.paksha + ")" : raw.tithi.name;
  } else tithi = str(raw.tithi);

  let nakshatra = "";
  if (typeof raw.nakshatra === "object" && raw.nakshatra) {
    nakshatra = raw.nakshatra.pada ? raw.nakshatra.name + " Pada " + raw.nakshatra.pada : raw.nakshatra.name;
  } else nakshatra = str(raw.nakshatra);

  return {
    date,
    tithi,
    nakshatra,
    yoga:    str(raw.yoga),
    karana:  str(raw.karana),
    vara:    raw.weekday ?? raw.vara ?? "",
    sunrise: raw.sunrise ?? "",
    sunset:  raw.sunset ?? "",
    rahu_kaal: raw.rahu_kaal ?? "",
    abhijit_muhurat: raw.abhijit_muhurat ?? "",
    yamaganda: raw.yamaganda,
    gulika: raw.gulika ?? raw.gulika_kaal,
    moon_sign: raw.moon_sign,
    sun_sign: raw.sun_sign,
  };
}

async function fetchVM(date: string, lat?: number, lon?: number): Promise<{ raw: VMRaw; n: PanchangData }> {
  const p = new URLSearchParams({ date });
  if (lat !== undefined) p.set("lat", String(lat));
  if (lon !== undefined) p.set("lon", String(lon));
  const res = await fetch(VM_URL + "/panchang?" + p.toString(), {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("VM " + res.status);
  const raw = await res.json() as VMRaw;
  return { raw, n: normalizeVM(raw, date) };
}

async function callGemini(apiKey: string, model: string, prompt: string, maxTokens: number, temp: number) {
  const g = new GoogleGenerativeAI(apiKey);
  const m = g.getGenerativeModel({ model, generationConfig: { maxOutputTokens: maxTokens, temperature: temp, responseMimeType: "application/json" } });
  const r = await m.generateContent(prompt);
  return { text: r.response.text(), tokensIn: r.response.usageMetadata?.promptTokenCount, tokensOut: r.response.usageMetadata?.candidatesTokenCount };
}

function costPaise(model: string, i = 0, o = 0): number {
  return model === "gemini-2.5-pro" ? Math.ceil(i * 0.105 + o * 0.42) : Math.ceil(i * 0.025 + o * 0.1);
}

function adminSupa() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

interface Result { date: string; city: string; status: "success" | "failed"; url?: string; error?: string; cost_paise?: number; }

async function generateRow(args: { date: string; citySlug: string; lang: Lang; prompt: string; raw: VMRaw; n: PanchangData; modelKey: keyof typeof GEMINI_CONFIG; publicUrl: string; }): Promise<Result> {
  const { date, citySlug, lang, prompt, raw, n, modelKey, publicUrl } = args;
  const supa = adminSupa();
  const cfg = GEMINI_CONFIG[modelKey];
  const apiKey = process.env.GEMINI_API_KEY!;

  const { data: log } = await supa.from("panchang_generation_log")
    .insert({ date, city_slug: citySlug, lang, status: "pending", model_used: cfg.model })
    .select("id").single();

  try {
    const { text, tokensIn, tokensOut } = await callGemini(apiKey, cfg.model, prompt, cfg.maxOutputTokens, cfg.temperature);
    const c: GeminiPanchangResponse = parseGeminiPanchangResponse(text);
    const cp = costPaise(cfg.model, tokensIn, tokensOut);

    const { error } = await supa.from("panchang_daily").upsert({
      date, city: citySlug,
      tithi: n.tithi, nakshatra: n.nakshatra, yoga: n.yoga, karana: n.karana, vara: n.vara,
      sunrise: n.sunrise, sunset: n.sunset, moonrise: raw.moonrise ?? null, moonset: raw.moonset ?? null,
      rahu_kaal: n.rahu_kaal, gulika_kaal: raw.gulika ?? raw.gulika_kaal ?? null,
      shubh_muhurat: n.abhijit_muhurat ?? null, festivals: raw.festivals ?? [],
      gemini_content: c.intro_paragraph ?? "",
      seo_title: c.meta_title, seo_description: c.meta_description,
      geo_answer: c.geo_answer, faq_schema: c.faq ?? [],
      page_url: publicUrl, indexnow_submitted: false,
    }, { onConflict: "date,city" });

    if (error) throw new Error("Supabase: " + error.message);

    if (log?.id) await supa.from("panchang_generation_log").update({
      status: "success", tokens_in: tokensIn, tokens_out: tokensOut,
      cost_inr_paise: cp, run_finished_at: new Date().toISOString(), indexnow_url: publicUrl,
    }).eq("id", log.id);

    return { date, city: citySlug, status: "success", url: publicUrl, cost_paise: cp };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[panchang-cron]", citySlug, date, msg);
    if (log?.id) await supa.from("panchang_generation_log").update({
      status: "failed", error_message: msg.slice(0, 1000), run_finished_at: new Date().toISOString(),
    }).eq("id", log.id);
    return { date, city: citySlug, status: "failed", error: msg };
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const isCron = req.headers.get("x-vercel-cron") === "1";
  if (!isCron && auth !== "Bearer " + CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  const date = getTodayISO();
  const results: Result[] = [];
  console.log("[panchang-cron] START v2.2 date=" + date);

  // 1. HUB — national, Gemini Pro
  try {
    const { raw, n } = await fetchVM(date);
    console.log("[panchang-cron] HUB tithi=" + n.tithi + " nakshatra=" + n.nakshatra);
    results.push(await generateRow({
      date, citySlug: "national", lang: TARGET_LANG,
      prompt: buildPanchangHubPrompt(n, TARGET_LANG),
      raw, n, modelKey: "hub", publicUrl: SITE_URL + "/panchang/" + date,
    }));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    results.push({ date, city: "national", status: "failed", error: msg });
  }

  // 2. CITIES — 10 cities, Gemini Flash
  for (const city of CITIES) {
    try {
      const { raw, n } = await fetchVM(date, city.lat, city.lon);
      results.push(await generateRow({
        date, citySlug: city.slug, lang: TARGET_LANG,
        prompt: buildPanchangCityPrompt(n, city, TARGET_LANG),
        raw, n, modelKey: "city", publicUrl: SITE_URL + "/" + city.slug + "/panchang",
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ date, city: city.slug, status: "failed", error: msg });
    }
  }

  // 3. IndexNow
  const urls = results.filter(r => r.status === "success" && r.url).map(r => r.url!);
  let inResult: Record<string, unknown> = { skipped: true };
  if (urls.length > 0) {
    try {
      const ir = await fetch(SITE_URL + "/api/cron/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + CRON_SECRET },
        body: JSON.stringify({ urls }),
        signal: AbortSignal.timeout(30000),
      });
      inResult = await ir.json();
      await adminSupa().from("panchang_daily")
        .update({ indexnow_submitted: true, indexnow_at: new Date().toISOString() })
        .in("page_url", urls).eq("date", date);
    } catch (e: unknown) {
      inResult = { error: e instanceof Error ? e.message : String(e) };
    }
  }

  const summary = {
    date, duration_ms: Date.now() - t0,
    rows_attempted: results.length,
    rows_success: results.filter(r => r.status === "success").length,
    rows_failed: results.filter(r => r.status === "failed").length,
    total_cost_inr: (results.reduce((s, r) => s + (r.cost_paise ?? 0), 0) / 100).toFixed(2),
    indexnow: inResult, results,
  };

  console.log("[panchang-cron] DONE", JSON.stringify(summary));
  return NextResponse.json(summary);
}

// END — route.ts v2.2 | Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
