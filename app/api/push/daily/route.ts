// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: app/api/push/daily/route.ts
// VERSION: v1.0 — Scheduled web-push engine (Vercel Cron → OneSignal)
// DATE: 2026-06-04
// WHAT IT DOES:
//   Called automatically by Vercel Cron at fixed times. Each cron entry
//   passes ?slot=<id>. The route looks up that slot's title/message/link
//   from the SLOTS map and sends a web push to ALL subscribers via the
//   OneSignal REST API. Fully hands-off — no dashboard work needed.
// SECURITY:
//   Protected by CRON_SECRET. Vercel Cron auto-sends
//   "Authorization: Bearer <CRON_SECRET>". Anyone without it gets 401,
//   so the public cannot trigger spam blasts.
// ENV REQUIRED (already in Vercel: APP_ID + REST_API_KEY; add CRON_SECRET):
//   ONESIGNAL_APP_ID
//   ONESIGNAL_REST_API_KEY
//   CRON_SECRET
// EDIT COPY: change titles/messages/links in the SLOTS map below, then
//   redeploy. (Later step: move copy to Supabase so no redeploy needed.)
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SITE = "https://trikalvaani.com";

// ── Notification slots ──────────────────────────────────────
// Add / remove / edit freely. Each key is referenced by ?slot=<key>
// from vercel.json cron entries.
const SLOTS: Record<
  string,
  { title: string; message: string; url: string }
> = {
  morning: {
    title: "🌞 Aaj ka Rashifal taiyaar hai",
    message:
      "Trikaal Vaani par aaj ke graha aapke liye kya kehte hain — abhi dekhiye.",
    url: `${SITE}/`,
  },
  evening: {
    title: "🕉️ Kal ka Panchang & Shubh Muhurat",
    message:
      "Kal ke shubh-ashubh samay, Rahu Kaal aur tithi — pehle se jaan lijiye.",
    url: `${SITE}/panchang`,
  },
  // Example optional 3rd slot — keep disabled in vercel.json unless needed:
  // midday: {
  //   title: "⏳ Aaj ka Rahu Kaal",
  //   message: "Aaj kaun se samay naya kaam shuru na karein — abhi check karein.",
  //   url: `${SITE}/panchang`,
  // },
};

export async function GET(req: NextRequest) {
  // 1) Auth — only Vercel Cron (or holder of CRON_SECRET) can fire this
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // 2) Which slot?
  const slot = req.nextUrl.searchParams.get("slot") || "";
  const payload = SLOTS[slot];
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: `Unknown slot: ${slot}` },
      { status: 400 }
    );
  }

  // 3) Env check
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing OneSignal env vars" },
      { status: 500 }
    );
  }

  // 4) Send to all subscribers via OneSignal REST API
  try {
    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["Total Subscriptions"],
        headings: { en: payload.title },
        contents: { en: payload.message },
        url: payload.url,
        web_url: payload.url,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, slot, status: res.status, onesignal: data },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, slot, onesignal: data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, slot, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
