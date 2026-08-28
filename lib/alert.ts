// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     lib/alert.ts
// Version:  v1.0 (28 Aug 2026)
// Owner:    Rohiit Gupta, Chief Vedic Architect
//
// ── WHY THIS EXISTS ────────────────────────────────────────────────────────
//
// On 4 June 2026 the panchang cron ran, every one of its eleven Gemini calls
// came back "429 prepayment credits are depleted", it wrote 33 failed rows to
// panchang_generation_log, and it returned HTTP 200. Vercel therefore recorded
// a successful run. Ten cities stopped getting panchang data. Nobody found out
// for eighty-five days, and only then because someone went looking for an
// unrelated reason.
//
// The failure was recorded the whole time. Recording is not alerting. A log is
// something you have to remember to open; an alert is something that arrives.
//
// ── HOW IT WORKS ───────────────────────────────────────────────────────────
//
// Two things happen on every alert, in this order, and the second never blocks
// the first:
//
//   1. a row in ops_alerts — the permanent record, written even if email fails
//   2. a POST to ALERT_WEBHOOK_URL — a Google Apps Script web app that mails
//      the CEO from his own Gmail
//
// Apps Script rather than an email service because it needs no new account, no
// domain verification, and mail from the owner's own address does not land in
// spam. Any webhook that accepts {key, subject, body} works just as well —
// Slack, Telegram, Google Chat — so the transport can change without touching
// callers.
//
// If ALERT_WEBHOOK_URL is unset the alert is still recorded and the caller
// still succeeds. Silence about the alerting itself would repeat the original
// mistake, so delivered=false is stored and the health check surfaces it.
//
// ── SETUP ──────────────────────────────────────────────────────────────────
//   ALERT_WEBHOOK_URL   the Apps Script /exec URL
//   ALERT_WEBHOOK_KEY   the shared secret the script checks
// ════════════════════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

export type Severity = "info" | "warning" | "critical";

export interface AlertInput {
  severity: Severity;
  /** which job raised this — "panchang-cron", "festival-content", "health-check" */
  source: string;
  subject: string;
  body: string;
}

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Raise an alert. Never throws — an alert failing must not take down the job
 * that was trying to report a problem.
 *
 * Returns whether the email actually went out, so a caller that cares can say
 * so in its own response.
 */
export async function raiseAlert(a: AlertInput): Promise<{ logged: boolean; delivered: boolean }> {
  const supa = admin();
  let rowId: number | null = null;
  let logged = false;

  // 1. RECORD FIRST. If the webhook is down, or the key is wrong, or Apps
  //    Script has hit its daily quota, the alert must still exist somewhere.
  try {
    const { data } = await supa
      .from("ops_alerts")
      .insert({
        severity: a.severity,
        source: a.source,
        subject: a.subject,
        body: a.body,
      })
      .select("id")
      .single();
    rowId = data?.id ?? null;
    logged = true;
  } catch (e) {
    console.error("[alert] could not write ops_alerts:", e);
  }

  // 2. DELIVER.
  const url = process.env.ALERT_WEBHOOK_URL;
  const key = process.env.ALERT_WEBHOOK_KEY;
  if (!url || !key) {
    console.warn("[alert] ALERT_WEBHOOK_URL/KEY not set — alert recorded but not sent");
    if (rowId) {
      await supa.from("ops_alerts")
        .update({ delivery_err: "ALERT_WEBHOOK_URL or ALERT_WEBHOOK_KEY not configured" })
        .eq("id", rowId).then(() => {}, () => {});
    }
    return { logged, delivered: false };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        subject: `[${a.severity.toUpperCase()}] ${a.subject}`,
        body: `${a.body}\n\n—\nsource: ${a.source}\nraised: ${new Date().toISOString()}\ntrikalvaani.com ops`,
      }),
      // Apps Script answers in a second or two; if it does not, the job the
      // alert is reporting on matters more than the alert.
      signal: AbortSignal.timeout(10_000),
      redirect: "follow", // Apps Script /exec always 302s to its content host
    });
    const ok = res.ok;
    if (rowId) {
      await supa.from("ops_alerts")
        .update(ok
          ? { delivered: true }
          : { delivery_err: `webhook HTTP ${res.status}` })
        .eq("id", rowId).then(() => {}, () => {});
    }
    if (!ok) console.error("[alert] webhook returned", res.status);
    return { logged, delivered: ok };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[alert] webhook threw:", msg);
    if (rowId) {
      await supa.from("ops_alerts")
        .update({ delivery_err: msg.slice(0, 500) })
        .eq("id", rowId).then(() => {}, () => {});
    }
    return { logged, delivered: false };
  }
}

/**
 * Raise an alert only if the same subject has not already been raised in the
 * last `hours`. A job that fails every hour should not send twenty-four emails
 * a day — after the second or third the CEO stops reading them, which puts us
 * back where we started.
 */
export async function raiseAlertOnce(a: AlertInput, hours = 12) {
  try {
    const since = new Date(Date.now() - hours * 3600_000).toISOString();
    const { data } = await admin()
      .from("ops_alerts")
      .select("id")
      .eq("subject", a.subject)
      .gte("fired_at", since)
      .limit(1);
    if (data && data.length > 0) {
      console.log("[alert] suppressed duplicate:", a.subject);
      return { logged: false, delivered: false, suppressed: true };
    }
  } catch {
    // If the de-dupe check itself fails, send. An extra email beats silence.
  }
  return { ...(await raiseAlert(a)), suppressed: false };
}

// END — lib/alert.ts v1.0 | Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
