// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    app/api/admin/festival-content-generate/route.ts
// Version: v1.0 — ONE-TIME USE
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// PURPOSE:
//   Generates Gemini Flash content for all festivals in festivals_master
//   where gemini_content IS NULL.
//   Calls VM for panchang data per festival date.
//   Stores full JSON in festivals_master.gemini_content.
//
// AFTER USE: Delete this file from GitHub immediately.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildPanchangFestivalPrompt,
  GEMINI_CONFIG,
  type PanchangData,
  type Lang,
} from "@/lib/gemini-prompt-panchang";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const VM_URL = process.env.VM_PANCHANG_URL || "http://34.14.164.105:8001";
const SECRET = "FESTIVAL_GEN_2026"; // hardcoded — delete after use
const TARGET_LANG: Lang = "en";

function adminSupa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── VM fetch + normalize ──────────────────────────────────────────────
interface VMRaw {
  tithi?: { name: string; paksha: string } | string;
  nakshatra?: { name: string; pada: number } | string;
  yoga?: { name: string } | string;
  karana?: { name: string } | string;
  vara?: string; weekday?: string;
  sunrise?: string; sunset?: string;
  rahu_kaal?: string; abhijit_muhurat?: string;
  yamaganda?: string; gulika?: string; gulika_kaal?: string;
  moon_sign?: string; sun_sign?: string;
}

function str(v: { name: string } | string | undefined): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.name;
}

function normalizeVM(raw: VMRaw, date: string): PanchangData {
  let tithi = "";
  if (typeof raw.tithi === "object" && raw.tithi) {
    tithi = raw.tithi.paksha
      ? `${raw.tithi.name} (${raw.tithi.paksha})`
      : raw.tithi.name;
  } else tithi = str(raw.tithi);

  let nakshatra = "";
  if (typeof raw.nakshatra === "object" && raw.nakshatra) {
    nakshatra = raw.nakshatra.pada
      ? `${raw.nakshatra.name} Pada ${raw.nakshatra.pada}`
      : raw.nakshatra.name;
  } else nakshatra = str(raw.nakshatra);

  return {
    date,
    tithi,
    nakshatra,
    yoga:            str(raw.yoga),
    karana:          str(raw.karana),
    vara:            raw.weekday ?? raw.vara ?? "",
    sunrise:         raw.sunrise ?? "",
    sunset:          raw.sunset ?? "",
    rahu_kaal:       raw.rahu_kaal ?? "",
    abhijit_muhurat: raw.abhijit_muhurat ?? "",
    yamaganda:       raw.yamaganda,
    gulika:          raw.gulika ?? raw.gulika_kaal,
    moon_sign:       raw.moon_sign,
    sun_sign:        raw.sun_sign,
  };
}

async function fetchVM(date: string): Promise<PanchangData | null> {
  try {
    const res = await fetch(`${VM_URL}/panchang?date=${date}`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as VMRaw;
    return normalizeVM(raw, date);
  } catch {
    return null;
  }
}

// ── Gemini call ───────────────────────────────────────────────────────
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const cfg = GEMINI_CONFIG.festival;
  const g = new GoogleGenerativeAI(apiKey);
  const m = g.getGenerativeModel({
    model: cfg.model,
    generationConfig: {
      maxOutputTokens: cfg.maxOutputTokens,
      temperature: cfg.temperature,
      responseMimeType: "application/json",
    },
  });
  const r = await m.generateContent(prompt);
  return r.response.text();
}

function parseGemini(raw: string): Record<string, unknown> | null {
  try {
    let c = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const s = c.indexOf("{"), e = c.lastIndexOf("}");
    if (s < 0 || e < 0) return null;
    return JSON.parse(c.slice(s, e + 1));
  } catch {
    return null;
  }
}

// ── Main handler ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supa = adminSupa();
  const t0 = Date.now();

  // Fetch all festivals where gemini_content is null
  const { data: festivals, error } = await supa
    .from("festivals_master")
    .select("id,date,festival_name,festival_slug,planet_ruler")
    .is("gemini_content", null)
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!festivals || festivals.length === 0) {
    return NextResponse.json({ message: "All festivals already have content!", total: 0 });
  }

  const results: { id: number; festival: string; date: string; status: string; error?: string }[] = [];

  for (const festival of festivals) {
    const { id, date, festival_name, festival_slug, planet_ruler } = festival;

    try {
      // 1. Get panchang from VM for this date
      const panchang = await fetchVM(date);
      if (!panchang) {
        results.push({ id, festival: festival_name, date, status: "failed", error: "VM returned null" });
        await new Promise(r => setTimeout(r, 300));
        continue;
      }

      // 2. Build festival prompt
      const prompt = buildPanchangFestivalPrompt(
        festival_name,
        festival_slug,
        panchang,
        planet_ruler ?? "Sun",
        TARGET_LANG
      );

      // 3. Call Gemini Flash
      const rawText = await callGemini(prompt);
      const geminiContent = parseGemini(rawText);

      if (!geminiContent) {
        results.push({ id, festival: festival_name, date, status: "failed", error: "Gemini parse failed" });
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      // 4. Store in Supabase
      const { error: updateError } = await supa
        .from("festivals_master")
        .update({
          gemini_content:  geminiContent,
          geo_answer:      (geminiContent.geo_answer as string) ?? null,
          seo_title:       (geminiContent.meta_title as string) ?? null,
          seo_description: (geminiContent.meta_description as string) ?? null,
          updated_at:      new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        results.push({ id, festival: festival_name, date, status: "failed", error: updateError.message });
      } else {
        results.push({ id, festival: festival_name, date, status: "success" });
      }

      // Small delay — be gentle on Gemini API
      await new Promise(r => setTimeout(r, 800));

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ id, festival: festival_name, date, status: "failed", error: msg.slice(0, 200) });
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return NextResponse.json({
    total_festivals: festivals.length,
    success: results.filter(r => r.status === "success").length,
    failed:  results.filter(r => r.status === "failed").length,
    duration_ms: Date.now() - t0,
    results,
  });
}

// END — festival-content-generate/route.ts v1.0
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// DELETE AFTER USE
