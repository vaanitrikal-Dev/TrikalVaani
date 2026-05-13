// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    app/api/admin/panchang-backfill/route.ts
// Version: v1.0 — ONE-TIME USE
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// PURPOSE:
//   Fills ALL dates Jan 1 – Dec 31 2026 into panchang_daily table.
//   Calls GCP VM for ephemeris data. Skips dates already in DB.
//   Run ONCE by hitting: GET /api/admin/panchang-backfill?secret=BACKFILL_2026
//
// AFTER USE: Delete this file from GitHub immediately.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300; // 5 min max on Vercel Pro

const VM_URL = "http://34.14.164.105:8001";
const SITE_URL = "https://trikalvaani.com";
const BACKFILL_SECRET = "BACKFILL_2026"; // hardcoded — delete file after use

type VMPanchang = {
  tithi: { name: string; paksha: string };
  nakshatra: { name: string; pada: number };
  yoga: { name: string };
  karana: { name: string };
  weekday?: string;
  vara?: string;
  sunrise: string;
  sunset: string;
  moonrise?: string;
  moonset?: string;
  rahu_kaal: string;
  gulika?: string;
  abhijit_muhurat?: string;
  festivals?: object[];
};

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function getAllDates2026(): string[] {
  const dates: string[] = [];
  const start = new Date("2026-01-01T00:00:00Z");
  const end = new Date("2026-12-31T00:00:00Z");
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

function formatHuman(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

async function fetchVM(date: string): Promise<VMPanchang | null> {
  try {
    const res = await fetch(`${VM_URL}/panchang?date=${date}`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return (await res.json()) as VMPanchang;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  // Auth check
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== BACKFILL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Optional: start from a specific date
  const fromParam = req.nextUrl.searchParams.get("from");
  // Optional: limit batch size to avoid timeout
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : 365;

  const supabase = getSupabaseAdmin();
  const allDates = getAllDates2026();

  // Check which dates already exist in DB
  const { data: existing } = await supabase
    .from("panchang_daily")
    .select("date")
    .eq("city", "delhi");

  const existingDates = new Set((existing ?? []).map((r: { date: string }) => r.date));

  // Filter to only missing dates, optionally starting from a date
  let toProcess = allDates.filter((d) => !existingDates.has(d));
  if (fromParam) {
    toProcess = toProcess.filter((d) => d >= fromParam);
  }
  toProcess = toProcess.slice(0, limit);

  const results: { date: string; status: string; error?: string }[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const date of toProcess) {
    const vm = await fetchVM(date);

    if (!vm) {
      results.push({ date, status: "failed", error: "VM returned null" });
      failCount++;
      // Small delay to not hammer VM
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }

    const human = formatHuman(date);
    const tithi = `${vm.tithi.name} (${vm.tithi.paksha})`;
    const nakshatra = `${vm.nakshatra.name} Pada ${vm.nakshatra.pada}`;
    const vara = vm.weekday ?? vm.vara ?? "";

    const geoAnswer = `On ${human}, Tithi is ${vm.tithi.name} (${vm.tithi.paksha}), Nakshatra is ${nakshatra}, Yoga ${vm.yoga.name}, Karana ${vm.karana.name}. Sunrise: ${vm.sunrise}, Sunset: ${vm.sunset}, Rahu Kaal: ${vm.rahu_kaal} (Delhi NCR). Swiss Ephemeris, Lahiri Ayanamsha.`;

    const seoTitle = `Aaj Ka Panchang ${human} | Tithi Nakshatra Rahu Kaal`;
    const seoDescription = `Vedic Panchang for ${human}: Tithi ${vm.tithi.name}, Nakshatra ${vm.nakshatra.name}, Rahu Kaal ${vm.rahu_kaal}. Swiss Ephemeris, Lahiri Ayanamsha. By Rohiit Gupta, Chief Vedic Architect.`;

    const faqSchema = [
      {
        "@type": "Question",
        name: `What is the Tithi on ${human}?`,
        acceptedAnswer: { "@type": "Answer", text: `${tithi}, calculated using Swiss Ephemeris with Lahiri Ayanamsha.` },
      },
      {
        "@type": "Question",
        name: `What is the Nakshatra on ${human}?`,
        acceptedAnswer: { "@type": "Answer", text: `${nakshatra}.` },
      },
      {
        "@type": "Question",
        name: `What is Rahu Kaal on ${human}?`,
        acceptedAnswer: { "@type": "Answer", text: `Rahu Kaal is ${vm.rahu_kaal} (Delhi NCR). Avoid auspicious work during this window.` },
      },
      {
        "@type": "Question",
        name: `What time is sunrise on ${human}?`,
        acceptedAnswer: { "@type": "Answer", text: `Sunrise: ${vm.sunrise} IST, Sunset: ${vm.sunset} IST (Delhi NCR).` },
      },
    ];

    const { error } = await supabase.from("panchang_daily").upsert(
      {
        date,
        city: "delhi",
        tithi,
        nakshatra,
        yoga: vm.yoga.name,
        karana: vm.karana.name,
        vara,
        sunrise: vm.sunrise,
        sunset: vm.sunset,
        moonrise: vm.moonrise ?? null,
        moonset: vm.moonset ?? null,
        rahu_kaal: vm.rahu_kaal,
        gulika_kaal: vm.gulika ?? null,
        shubh_muhurat: vm.abhijit_muhurat ?? null,
        festivals: vm.festivals ?? [],
        geo_answer: geoAnswer,
        seo_title: seoTitle,
        seo_description: seoDescription,
        faq_schema: faqSchema,
        page_url: `${SITE_URL}/panchang/${date}`,
        indexnow_submitted: false,
      },
      { onConflict: "date,city" }
    );

    if (error) {
      results.push({ date, status: "failed", error: error.message });
      failCount++;
    } else {
      results.push({ date, status: "ok" });
      successCount++;
    }

    // Delay between VM calls — be gentle on the VM
    await new Promise((r) => setTimeout(r, 300));
  }

  return NextResponse.json({
    total_in_db_before: existingDates.size,
    processed: toProcess.length,
    success: successCount,
    failed: failCount,
    skipped_already_exists: allDates.length - existingDates.size - toProcess.length,
    results,
  });
}
