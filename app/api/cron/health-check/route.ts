// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     app/api/cron/health-check/route.ts
// Version:  v1.0 (28 Aug 2026)
// Owner:    Rohiit Gupta, Chief Vedic Architect
//
// ── WHY THIS EXISTS ────────────────────────────────────────────────────────
//
// Alerting on failure is not enough, because the worst failure is the one that
// raises nothing at all. If the panchang cron stops being invoked — a bad
// deployment, a removed vercel.json entry, a Vercel delivery miss — then no job
// runs, no row is written, no error is thrown, and no alert can fire. The site
// simply goes quiet, exactly as it did between 4 June and 28 August 2026.
//
// This route is the dead man's switch. It does not watch for errors. It watches
// for ABSENCE, and absence is what actually happened.
//
// ── WHAT IT CHECKS ─────────────────────────────────────────────────────────
//
//   1. panchang freshness — is there a row for today, for every city?
//   2. cron liveness      — has any run succeeded in the last 36 hours?
//   3. forward cover      — do festivals exist far enough into the future?
//   4. undelivered alarms — did an earlier alert fail to reach anyone?
//
// Each is a question whose wrong answer was invisible before today.
//
// ── SCHEDULE ───────────────────────────────────────────────────────────────
// vercel.json:
//   { "path": "/api/cron/health-check", "schedule": "30 4 * * *" }
//   (10:00 IST — after the nightly panchang run, early enough to act on)
// ════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { raiseAlertOnce } from "@/lib/alert";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

// The ten cities plus the national hub, as the panchang cron writes them.
const EXPECTED_CITIES = [
  "national", "delhi", "mumbai", "noida", "gurgaon", "bangalore",
  "hyderabad", "pune", "kolkata", "chennai", "ahmedabad",
];

// A run older than this means the job is not running, not merely slow.
const STALE_RUN_HOURS = 36;
// Festivals should always be materialised well beyond this.
const MIN_FOREWARN_DAYS = 90;

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function istToday(): string {
  return new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supa = admin();
  const today = istToday();
  const problems: string[] = [];
  const checks: Record<string, unknown> = {};

  // ── 1. Is today's panchang there, for every city? ─────────────────────────
  try {
    const { data } = await supa
      .from("panchang_daily").select("city").eq("date", today);
    const have = new Set((data ?? []).map(r => r.city as string));
    const missing = EXPECTED_CITIES.filter(c => !have.has(c));
    checks.panchang_today = { present: have.size, missing };
    if (missing.length) {
      problems.push(
        `Panchang missing for ${today}: ${missing.join(", ")} ` +
        `(${missing.length} of ${EXPECTED_CITIES.length} cities have no row).`
      );
    }
  } catch (e) {
    problems.push(`Could not read panchang_daily: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── 2. Has the generator succeeded recently at all? ───────────────────────
  //    This is the check that would have fired on 5 June 2026.
  try {
    const { data } = await supa
      .from("panchang_generation_log")
      .select("created_at,status")
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1);
    const last = data?.[0]?.created_at as string | undefined;
    const ageH = last ? (Date.now() - new Date(last).getTime()) / 3600_000 : Infinity;
    checks.last_success = { at: last ?? null, hours_ago: Number.isFinite(ageH) ? Math.round(ageH) : null };
    if (ageH > STALE_RUN_HOURS) {
      problems.push(
        last
          ? `No successful panchang generation for ${Math.round(ageH / 24)} days ` +
            `(last was ${last}). The cron is failing or is not being invoked.`
          : `panchang_generation_log has no successful run on record at all.`
      );
    }
  } catch (e) {
    problems.push(`Could not read panchang_generation_log: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── 3. Recent failures worth knowing about ────────────────────────────────
  try {
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const { data } = await supa
      .from("panchang_generation_log")
      .select("city_slug,error_message")
      .eq("status", "failed")
      .gte("created_at", since);
    const fails = data ?? [];
    checks.failures_24h = fails.length;
    if (fails.length) {
      const sample = (fails[0].error_message ?? "").slice(0, 200);
      problems.push(`${fails.length} generation failures in the last 24h. First error: ${sample}`);
    }
  } catch { /* covered by check 2 */ }

  // ── 4. Is the festival calendar still stocked ahead? ──────────────────────
  try {
    const horizon = new Date(Date.now() + MIN_FOREWARN_DAYS * 86400_000)
      .toISOString().slice(0, 10);
    const { count } = await supa
      .from("festivals_master")
      .select("festival_slug", { count: "exact", head: true })
      .gte("date", horizon);
    checks.festivals_beyond_horizon = count ?? 0;
    if (!count) {
      problems.push(
        `No festivals in festivals_master beyond ${horizon}. ` +
        `Run materialise_festival_year.py for the next year.`
      );
    }
  } catch (e) {
    problems.push(`Could not read festivals_master: ${e instanceof Error ? e.message : String(e)}`);
  }

  // ── 5. Did an earlier alarm fail to reach anyone? ─────────────────────────
  //    An undelivered alert is a silent alert, which is the whole problem.
  try {
    const since = new Date(Date.now() - 7 * 86400_000).toISOString();
    const { count } = await supa
      .from("ops_alerts")
      .select("id", { count: "exact", head: true })
      .eq("delivered", false)
      .gte("fired_at", since);
    checks.undelivered_alerts_7d = count ?? 0;
    if (count && count > 0) {
      problems.push(
        `${count} alerts in the last 7 days were recorded but not emailed. ` +
        `Check ALERT_WEBHOOK_URL / ALERT_WEBHOOK_KEY in Vercel.`
      );
    }
  } catch { /* non-fatal */ }

  // ── report ────────────────────────────────────────────────────────────────
  const healthy = problems.length === 0;
  if (!healthy) {
    await raiseAlertOnce({
      severity: "critical",
      source: "health-check",
      subject: `Daily health check found ${problems.length} problem(s)`,
      body: problems.map((p, i) => `${i + 1}. ${p}`).join("\n\n"),
    }, 12);
  }

  console.log("[health-check]", healthy ? "OK" : `${problems.length} problems`, JSON.stringify(checks));

  // Non-200 when unhealthy, so the Vercel cron log shows red rather than green.
  // The 4 June run returned 200 with everything broken; that will not recur.
  return NextResponse.json(
    { date: today, healthy, problems, checks },
    { status: healthy ? 200 : 500 }
  );
}

// END — health-check/route.ts v1.0 | Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
