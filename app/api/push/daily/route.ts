// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: app/api/push/daily/route.ts
// VERSION: v1.3 — Robust OneSignal auth (Key + Basic fallback) + error logging
// DATE: 2026-06-04
// CHANGES vs v1.2:
//   ✅ FIX: cron fired but OneSignal returned non-2xx (502 in our logs).
//      Root cause: auth header format mismatch. New OneSignal keys use
//      "Authorization: Key <key>"; legacy REST API keys use
//      "Authorization: Basic <key>". We now TRY "Key" first and, on
//      401/403, automatically RETRY with "Basic" — works with either key.
//   ✅ console.error logs the exact OneSignal status + body so failures
//      are visible in Vercel runtime logs.
//   Slots/schedule unchanged from v1.2.
// SECURITY: CRON_SECRET (Vercel Cron sends Bearer header). No secret = 401.
// ENV (all already in Vercel): ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY, CRON_SECRET
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SITE = "https://trikalvaani.com";

const SLOTS: Record<
  string,
  { title: string; message: string; url: string }
> = {
  festival: {
    title: "🪔 Aaj ka Vrat, Tithi & Niyam",
    message:
      "Aaj kya karein, kya na karein — Ekadashi/Amavasya/Purnima ke shubh niyam jaaniye.",
    url: `${SITE}/panchang`,
  },
  muhurat: {
    title: "🕉️ Aaj ka Shubh Muhurat & Rahu Kaal",
    message:
      "Naya kaam shuru karne se pehle aaj ka shubh-ashubh samay jaan lijiye.",
    url: `${SITE}/panchang`,
  },
  rashifal: {
    title: "🌞 Aaj ka Rashifal taiyaar hai",
    message:
      "Aaj ke graha aapke liye kya kehte hain — Trikaal Vaani par abhi dekhiye.",
    url: `${SITE}/`,
  },
  panchang: {
    title: "🔔 Kal ka Panchang & Nakshatra Gochar",
    message:
      "Kal ka tithi, shubh muhurat aur bade graha-nakshatra badlaav — pehle se taiyaar rahiye.",
    url: `${SITE}/panchang`,
  },
  cta: {
    title: "🌙 Nakshatra badal raha hai — aap taiyaar hain?",
    message:
      "Is gochar ka aap par kya asar? Apni free kundali se do's & don'ts jaaniye.",
    url: `${SITE}/`,
  },
};

async function sendOneSignal(appId: string, apiKey: string, payload: { title: string; message: string; url: string }) {
  const body = JSON.stringify({
    app_id: appId,
    included_segments: ["Total Subscriptions"],
    target_channel: "push",
    headings: { en: payload.title },
    contents: { en: payload.message },
    url: payload.url,
    web_url: payload.url,
  });

  const doFetch = (scheme: "Key" | "Basic") =>
    fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `${scheme} ${apiKey}`,
      },
      body,
    });

  // Try modern "Key" auth first
  let res = await doFetch("Key");
  // Legacy keys need "Basic" — retry on auth failure
  if (res.status === 401 || res.status === 403) {
    res = await doFetch("Basic");
  }
  return res;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const slot = req.nextUrl.searchParams.get("slot") || "";
  const payload = SLOTS[slot];
  if (!payload) {
    return NextResponse.json({ ok: false, error: `Unknown slot: ${slot}` }, { status: 400 });
  }

  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !apiKey) {
    return NextResponse.json({ ok: false, error: "Missing OneSignal env vars" }, { status: 500 });
  }

  try {
    const res = await sendOneSignal(appId, apiKey, payload);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(`[push/${slot}] OneSignal FAILED status=${res.status} body=${JSON.stringify(data)}`);
      return NextResponse.json({ ok: false, slot, status: res.status, onesignal: data }, { status: 502 });
    }

    console.log(`[push/${slot}] OneSignal OK id=${data?.id ?? "?"} recipients=${data?.recipients ?? "?"}`);
    return NextResponse.json({ ok: true, slot, onesignal: data });
  } catch (err: any) {
    console.error(`[push/${slot}] ERROR ${String(err?.message || err)}`);
    return NextResponse.json({ ok: false, slot, error: String(err?.message || err) }, { status: 500 });
  }
}
