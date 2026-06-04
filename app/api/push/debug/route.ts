// ============================================================
// CEO: Rohiit Gupta | Trikaal Vaani
// FILE: app/api/push/debug/route.ts
// VERSION: v1.0 — TEMPORARY diagnostic. DELETE after we fix the cron.
// PURPOSE: Open in browser to see the EXACT OneSignal response.
//   Tries auth schemes (Key, Basic) x segments (Subscribed Users,
//   Total Subscriptions) and reports each attempt's status + body,
//   stopping at the first success. Sends a real (small) test push
//   to your own subscribers only.
// USAGE: https://trikalvaani.com/api/push/debug?t=trikaal_debug_2026
// SECURITY: guarded by a fixed token ?t=. Remove this file once fixed.
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TOKEN = "trikaal_debug_2026";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("t") !== TOKEN) {
    return NextResponse.json({ ok: false, error: "bad token" }, { status: 401 });
  }

  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !apiKey) {
    return NextResponse.json({ ok: false, error: "Missing env vars", hasAppId: !!appId, hasKey: !!apiKey });
  }

  const schemes: Array<"Key" | "Basic"> = ["Key", "Basic"];
  const segments = ["Subscribed Users", "Total Subscriptions"];
  const attempts: any[] = [];

  for (const seg of segments) {
    for (const scheme of schemes) {
      const body = JSON.stringify({
        app_id: appId,
        included_segments: [seg],
        headings: { en: "🔧 Trikaal debug test" },
        contents: { en: "Debug push — sab theek ho to ye notification aayegi." },
        url: "https://trikalvaani.com",
      });

      try {
        const res = await fetch("https://api.onesignal.com/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `${scheme} ${apiKey}`,
          },
          body,
        });
        const data = await res.json().catch(() => ({}));
        attempts.push({ segment: seg, scheme, status: res.status, ok: res.ok, body: data });

        if (res.ok) {
          return NextResponse.json({
            result: "SUCCESS",
            workingCombo: { segment: seg, scheme },
            successResponse: data,
            allAttempts: attempts,
          });
        }
      } catch (err: any) {
        attempts.push({ segment: seg, scheme, error: String(err?.message || err) });
      }
    }
  }

  return NextResponse.json({ result: "ALL_FAILED", appIdLen: appId.length, keyPrefix: apiKey.slice(0, 8), allAttempts: attempts });
}
