// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: app/api/push/daily/route.ts
// VERSION: v1.5 — Correct segment "Total Subscriptions" (exists in this app)
// DATE: 2026-06-05
// CHANGES vs v1.4:
//   ✅ included_segments -> "Total Subscriptions" (this app's DEFAULT
//      segment that actually contains the push subscribers). "Subscribed
//      Users" does NOT exist in this account, which caused
//      "All included players are not subscribed" -> 0 recipients.
//   Auth: "Key" confirmed working (debug returned 200). Basic fallback kept.
// SECURITY: CRON_SECRET (Vercel Cron sends Bearer header). No secret = 401.
// ENV (all in Vercel): ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY, CRON_SECRET
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SITE = "https://trikalvaani.com";
const SEGMENT = "Total Subscriptions";

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
    included_segments: [SEGMENT],
    headings: { en: payload.title },
    contents: { en: payload.message },
    url: payload.url,
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

  let res = await doFetch("Key");
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

    // Treat "0 recipients / not subscribed" as a real failure too
    const noRecipients = !data?.id || (Array.isArray(data?.errors) && data.errors.length > 0);

    if (!res.ok || noRecipients) {
      console.error(`PUSH_ERR slot=${slot} status=${res.status} body=${JSON.stringify(data)}`);
      return NextResponse.json({ ok: false, slot, status: res.status, onesignal: data }, { status: res.ok ? 200 : 502 });
    }

    console.log(`PUSH_OK slot=${slot} id=${data?.id} recipients=${data?.recipients ?? "?"}`);
    return NextResponse.json({ ok: true, slot, onesignal: data });
  } catch (err: any) {
    console.error(`PUSH_ERR slot=${slot} EXCEPTION ${String(err?.message || err)}`);
    return NextResponse.json({ ok: false, slot, error: String(err?.message || err) }, { status: 500 });
  }
}
