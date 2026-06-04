// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: app/api/push/daily/route.ts
// VERSION: v1.2 — CEO-final 5-slot themes
// DATE: 2026-06-04
// SLOT SCHEDULE (IST):
//   07:30  festival  -> Festival/Ekadashi/Amavasya + Do's & Don'ts
//   10:00  muhurat   -> Shubh Muhurat / Rahu Kaal
//   13:00  rashifal  -> Aaj ka Rashifal
//   19:30  panchang  -> Kal ka Panchang / bade nakshatra gochar
//   21:00  cta       -> Kundali CTA for nakshatra movement + Do's & Don'ts
// NOTE: 'festival' & 'panchang' copy is generic for v1. Next step: make
//   these dynamic by pulling tithi/festival/nakshatra from Supabase.
// SECURITY: CRON_SECRET (Vercel Cron sends Bearer header). No secret = 401.
// ENV (all already in Vercel): ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY, CRON_SECRET
// EDIT COPY: change SLOTS below, then redeploy.
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SITE = "https://trikalvaani.com";

const SLOTS: Record<
  string,
  { title: string; message: string; url: string }
> = {
  // 07:30 AM IST
  festival: {
    title: "🪔 Aaj ka Vrat, Tithi & Niyam",
    message:
      "Aaj kya karein, kya na karein — Ekadashi/Amavasya/Purnima ke shubh niyam jaaniye.",
    url: `${SITE}/panchang`,
  },
  // 10:00 AM IST
  muhurat: {
    title: "🕉️ Aaj ka Shubh Muhurat & Rahu Kaal",
    message:
      "Naya kaam shuru karne se pehle aaj ka shubh-ashubh samay jaan lijiye.",
    url: `${SITE}/panchang`,
  },
  // 01:00 PM IST
  rashifal: {
    title: "🌞 Aaj ka Rashifal taiyaar hai",
    message:
      "Aaj ke graha aapke liye kya kehte hain — Trikaal Vaani par abhi dekhiye.",
    url: `${SITE}/`,
  },
  // 07:30 PM IST
  panchang: {
    title: "🔔 Kal ka Panchang & Nakshatra Gochar",
    message:
      "Kal ka tithi, shubh muhurat aur bade graha-nakshatra badlaav — pehle se taiyaar rahiye.",
    url: `${SITE}/panchang`,
  },
  // 09:00 PM IST
  cta: {
    title: "🌙 Nakshatra badal raha hai — aap taiyaar hain?",
    message:
      "Is gochar ka aap par kya asar? Apni free kundali se do's & don'ts jaaniye.",
    url: `${SITE}/`,
  },
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const slot = req.nextUrl.searchParams.get("slot") || "";
  const payload = SLOTS[slot];
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: `Unknown slot: ${slot}` },
      { status: 400 }
    );
  }

  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing OneSignal env vars" },
      { status: 500 }
    );
  }

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
