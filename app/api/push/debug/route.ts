// ============================================================
// CEO: Rohiit Gupta | Trikaal Vaani
// FILE: app/api/push/debug/route.ts
// VERSION: v2.0 — TEMPORARY diagnostic. DELETE after fix confirmed.
// PURPOSE: Try real send to each EXISTING segment and report the
//   recipients count + errors. Success = a notification with a real id
//   and recipients > 0 (NOT just HTTP 200).
// USAGE: https://trikalvaani.com/api/push/debug?t=trikaal_debug_2026
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
    return NextResponse.json({ ok: false, error: "Missing env vars" });
  }

  // Segments that actually exist in this OneSignal app
  const segments = ["Total Subscriptions", "Active Subscriptions", "Subscribed Users"];
  const attempts: any[] = [];
  let working: string | null = null;

  for (const seg of segments) {
    const body = JSON.stringify({
      app_id: appId,
      included_segments: [seg],
      headings: { en: "🔧 Trikaal debug" },
      contents: { en: `Debug push via segment: ${seg}` },
      url: "https://trikalvaani.com",
    });

    try {
      const res = await fetch("https://api.onesignal.com/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Key ${apiKey}`,
        },
        body,
      });
      const data = await res.json().catch(() => ({}));
      const recipients = data?.recipients ?? 0;
      const realSuccess = !!data?.id && recipients > 0;
      attempts.push({ segment: seg, status: res.status, id: data?.id || "", recipients, errors: data?.errors || null });
      if (realSuccess && !working) working = seg;
    } catch (err: any) {
      attempts.push({ segment: seg, error: String(err?.message || err) });
    }
  }

  return NextResponse.json({
    workingSegment: working,
    verdict: working ? `USE THIS SEGMENT: ${working}` : "NO SEGMENT DELIVERED — devices may need re-subscribe",
    attempts,
  });
}
