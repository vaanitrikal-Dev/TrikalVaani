/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:    app/api/cron/festival-generate/route.ts
 * Version: v1.1
 * Owner:   Rohiit Gupta, Chief Vedic Architect
 * Domain:  trikalvaani.com
 *
 * PURPOSE:
 *   Generates CLEAN festival page content into festivals_master using the
 *   locked template prompt (lib/gemini-prompt-festival.ts). "Golden Engine"
 *   Layer-1 generator.
 *
 * ── Changes vs v1.0 ────────────────────────────────────────────────
 *   1. Simple MANUAL_KEY ("trikaal-engine-2026") so it can be triggered from
 *      a browser without the Vercel CRON_SECRET. (Vercel's scheduled cron
 *      still auto-authenticates via its own Bearer CRON_SECRET — no key needed.)
 *   2. Default/cron mode now only fills MISSING festivals (is_indexed=false)
 *      inside the window — cheap, self-healing. force=all regenerates all.
 *
 * HOW TO RUN (manual, browser/mobile):
 *   • Everything now:   /api/cron/festival-generate?force=all&limit=50&key=trikaal-engine-2026
 *   • One festival:     /api/cron/festival-generate?slug=diwali-2026&key=trikaal-engine-2026
 *   • Fill only new:    /api/cron/festival-generate?key=trikaal-engine-2026
 *
 * AUTO (Vercel cron): add to vercel.json crons →
 *   { "path": "/api/cron/festival-generate", "schedule": "0 1 * * 1" }   // weekly
 *   Vercel injects Authorization: Bearer CRON_SECRET automatically; the cron
 *   run fills only missing upcoming festivals (cheap).
 *
 * IRON RULES:
 *   - Uses gemini-prompt-festival.ts ONLY. Never touches gemini-prompt.ts or
 *     gemini-prompt-panchang.ts.
 *   - maxOutputTokens stays 12000 (set in FESTIVAL_GEMINI_CONFIG). NEVER reduce.
 *   - Per-festival try/catch: a bad row logs + is skipped, NEVER wipes existing
 *     content. Brand-leak / shape violations are caught by the parser.
 *   - Writes English content (festival pages stay EN — they rank on EN/Roman
 *     queries). Hindi (?lang=hi) versions are a separate future track.
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildFestivalPrompt,
  parseFestivalContent,
  FESTIVAL_GEMINI_CONFIG,
  type FestivalContent,
} from "@/lib/gemini-prompt-festival";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const SITE_URL = process.env.SITE_URL || "https://trikalvaani.com";
const CRON_SECRET = process.env.CRON_SECRET;
const MANUAL_KEY = "trikaal-engine-2026"; // simple browser-trigger key (rotate later if you like)
const DEFAULT_DAYS = 90; // rich-content window
const DEFAULT_LIMIT = 12; // cap per run to stay under maxDuration

const SELECT_COLS =
  "festival_slug,festival_name,year,date,defining_tithi,deity,planet_ruler,festival_scope";

interface FestivalRow {
  festival_slug: string;
  festival_name: string;
  year: number | null;
  date: string;
  defining_tithi: string | null;
  deity: string | null;
  planet_ruler: string | null;
  festival_scope: string | null;
}

function adminSupa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function isAuthorized(req: NextRequest): boolean {
  if (req.headers.get("x-vercel-cron") === "1") return true;
  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth === "Bearer " + CRON_SECRET) return true;
  const key = req.nextUrl.searchParams.get("key");
  if (key && key === MANUAL_KEY) return true;
  if (CRON_SECRET && key === CRON_SECRET) return true;
  return false;
}

async function callGemini(apiKey: string, prompt: string): Promise<{ text: string; tIn?: number; tOut?: number }> {
  const cfg = FESTIVAL_GEMINI_CONFIG.content;
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
  return {
    text: r.response.text(),
    tIn: r.response.usageMetadata?.promptTokenCount,
    tOut: r.response.usageMetadata?.candidatesTokenCount,
  };
}

// Flash pricing (paise) — rough, for the run summary only
function costPaise(i = 0, o = 0): number {
  return Math.ceil(i * 0.025 + o * 0.1);
}

interface Result {
  slug: string;
  status: "success" | "failed" | "skipped";
  error?: string;
  cost_paise?: number;
}

async function generateOne(row: FestivalRow, apiKey: string): Promise<Result> {
  const slug = row.festival_slug;

  if (!row.defining_tithi) {
    return { slug, status: "skipped", error: "no defining_tithi" };
  }

  const supa = adminSupa();
  try {
    const prompt = buildFestivalPrompt({
      festivalName: row.festival_name,
      year: row.year ?? Number(row.date.slice(0, 4)),
      definingTithi: row.defining_tithi,
      deity: row.deity,
      planetRuler: row.planet_ruler,
      lang: "en",
    });

    const { text, tIn, tOut } = await callGemini(apiKey, prompt);
    const c: FestivalContent = parseFestivalContent(text); // throws on shape/brand violation

    const { error } = await supa
      .from("festivals_master")
      .update({
        geo_answer: c.geo_answer,
        dos: c.dos,
        donts: c.donts,
        puja_vidhi: c.puja_vidhi,
        seo_title: c.seo_title,
        seo_description: c.seo_description,
        gemini_content: c, // full clean object (jsonb)
        is_indexed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("festival_slug", slug);

    if (error) throw new Error("Supabase: " + error.message);

    return { slug, status: "success", cost_paise: costPaise(tIn, tOut) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[festival-generate]", slug, msg);
    return { slug, status: "failed", error: msg.slice(0, 300) };
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });
  }

  const sp = req.nextUrl.searchParams;
  const slug = sp.get("slug");
  const force = sp.get("force");
  const days = Number(sp.get("days") ?? DEFAULT_DAYS);
  const limit = Number(sp.get("limit") ?? DEFAULT_LIMIT);

  const t0 = Date.now();
  const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];
  const supa = adminSupa();

  // ── Build the target list ──
  let rows: FestivalRow[] = [];
  try {
    if (slug) {
      const { data } = await supa.from("festivals_master").select(SELECT_COLS).eq("festival_slug", slug).single();
      if (data) rows = [data as FestivalRow];
    } else {
      let q = supa.from("festivals_master").select(SELECT_COLS).not("defining_tithi", "is", null);
      if (force !== "all") {
        const end = new Date(Date.now() + 5.5 * 60 * 60 * 1000 + days * 86400 * 1000)
          .toISOString()
          .split("T")[0];
        q = q.gte("date", today).lte("date", end).eq("is_indexed", false); // only fill missing
      }
      const { data } = await q.order("date", { ascending: true }).limit(limit);
      rows = (data as FestivalRow[]) ?? [];
    }
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ message: "No matching festivals", slug, force, days, today });
  }

  // ── Generate sequentially (Flash; stays under maxDuration for ~12 rows) ──
  const results: Result[] = [];
  for (const row of rows) {
    results.push(await generateOne(row, apiKey));
  }

  const summary = {
    mode: slug ? "single" : force === "all" ? "all" : `window_${days}d`,
    today,
    attempted: results.length,
    success: results.filter((r) => r.status === "success").length,
    failed: results.filter((r) => r.status === "failed").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    total_cost_inr: (results.reduce((s, r) => s + (r.cost_paise ?? 0), 0) / 100).toFixed(2),
    duration_ms: Date.now() - t0,
    site: SITE_URL,
    results,
  };

  console.log("[festival-generate] DONE", JSON.stringify(summary));
  return NextResponse.json(summary);
}

// END — festival-generate/route.ts v1.0 | Trikaal Vaani | Rohiit Gupta
