// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: app/api/push/daily/route.ts
// VERSION: v2.0 — 2 panchang-linked slots (morning + evening)
// DATE: 2026-06-05
// CHANGES vs v1.5:
//   ✅ Reduced to 2 daily slots (morning 7AM + evening 7PM IST)
//   ✅ Both slots fetch REAL tithi/nakshatra/rahu_kaal from
//      Supabase panchang_daily table (Delhi row, today's date)
//   ✅ Morning: tithi-aware message (Amavasya/Ekadashi/Purnima/normal)
//   ✅ Evening: tomorrow's panchang + nakshatra + kundali CTA
//   ✅ Notification links to actual dated panchang page
//   Segment confirmed: "Total Subscriptions" (verified working)
//   Auth confirmed: "Key" scheme (verified working)
// CRON SCHEDULE (vercel.json — update to just 2 entries):
//   {"path":"/api/push/daily?slot=morning","schedule":"30 1 * * *"}  → 7:00AM IST
//   {"path":"/api/push/daily?slot=evening","schedule":"30 13 * * *"} → 7:00PM IST
// SECURITY: CRON_SECRET. ENV: ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY,
//   CRON_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SITE = "https://trikalvaani.com";
const SEGMENT = "Total Subscriptions";

// ── Supabase fetch: today's Delhi panchang ──────────────────
async function fetchTodayPanchang() {
  const url = process.env.SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const res = await fetch(
    `${url}/rest/v1/panchang_daily?date=eq.${today}&city=eq.delhi&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0] ?? null;
}

// ── Tomorrow's date string ──────────────────────────────────
function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// ── Tithi classifier ────────────────────────────────────────
function classifyTithi(tithi: string): "amavasya" | "ekadashi" | "purnima" | "normal" {
  const t = tithi.toLowerCase();
  if (t.includes("amavasya"))  return "amavasya";
  if (t.includes("ekadashi"))  return "ekadashi";
  if (t.includes("purnima"))   return "purnima";
  return "normal";
}

// ── Build morning notification payload ─────────────────────
function buildMorning(p: any): { title: string; message: string; url: string } {
  const tithi     = p?.tithi     ?? "Aaj ki tithi";
  const nakshatra = p?.nakshatra ?? "";
  const rahu      = p?.rahu_kaal ?? "";
  const pageUrl   = p?.page_url  ?? `${SITE}/panchang`;
  const festivals: string[] = p?.festivals ?? [];
  const festName  = p?.festival_name ?? "";

  const kind = classifyTithi(tithi);

  // Special tithi messages
  if (kind === "amavasya") {
    return {
      title:   "🌑 Aaj Amavasya hai",
      message: `Pitru tarpan, diya jagran aur shanti path ka shubh din. Rahu Kaal: ${rahu}. Aaj kya karein, kya na karein — jaaniye.`,
      url: pageUrl,
    };
  }
  if (kind === "ekadashi") {
    return {
      title:   "🌿 Aaj Ekadashi hai — vrat ke niyam jaaniye",
      message: `Ekadashi vrat ke do's & don'ts, shubh muhurat aur Rahu Kaal ${rahu} — sab ek jagah.`,
      url: pageUrl,
    };
  }
  if (kind === "purnima") {
    return {
      title:   "🌕 Aaj Purnima hai",
      message: `Dev puja, Satyanarayan katha aur shubh kaam ka uttam din. Nakshatra: ${nakshatra}. Rahu Kaal: ${rahu}. Aaj ka panchang dekhiye.`,
      url: pageUrl,
    };
  }
  // Festival override
  if (festName || festivals.length > 0) {
    const fest = festName || festivals[0];
    return {
      title:   `🪔 Aaj ${fest} hai`,
      message: `Tithi: ${tithi} · Nakshatra: ${nakshatra} · Rahu Kaal: ${rahu}. Shubh muhurat aur niyam jaaniye.`,
      url: pageUrl,
    };
  }
  // Normal day
  return {
    title:   `🌞 Aaj ki Tithi: ${tithi}`,
    message: `Nakshatra: ${nakshatra} · Rahu Kaal: ${rahu} · Shubh muhurat aur aaj ka margdarshan — Trikaal Vaani par dekhiye.`,
    url: pageUrl,
  };
}

// ── Build evening notification payload ─────────────────────
function buildEvening(p: any): { title: string; message: string; url: string } {
  const nakshatra = p?.nakshatra ?? "";
  const rahu      = p?.rahu_kaal ?? "";
  const tomorrow  = getTomorrow();
  const tomorrowUrl = `${SITE}/panchang/${tomorrow}`;

  return {
    title:   "🔔 Kal ka Panchang taiyaar hai",
    message: `Nakshatra: ${nakshatra} · Kal ka Rahu Kaal: ${rahu}. Apni kundali se jaaniye kal ke graha aap par kya asar dalenge.`,
    url: tomorrowUrl,
  };
}

// ── OneSignal sender ────────────────────────────────────────
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
  if (res.status === 401 || res.status === 403) res = await doFetch("Basic");
  return res;
}

// ── Handler ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const slot = req.nextUrl.searchParams.get("slot") || "";
  if (slot !== "morning" && slot !== "evening") {
    return NextResponse.json({ ok: false, error: `Unknown slot: ${slot}` }, { status: 400 });
  }

  const appId  = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!appId || !apiKey) {
    return NextResponse.json({ ok: false, error: "Missing OneSignal env vars" }, { status: 500 });
  }

  // Fetch panchang (today for morning, today for evening showing tomorrow's URL)
  const panchang = await fetchTodayPanchang();
  if (!panchang) {
    console.error(`PUSH_ERR slot=${slot} panchang fetch failed`);
    // Still send with fallback
  }

  const payload = slot === "morning" ? buildMorning(panchang) : buildEvening(panchang);

  try {
    const res  = await sendOneSignal(appId, apiKey, payload);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(`PUSH_ERR slot=${slot} status=${res.status} body=${JSON.stringify(data)}`);
      return NextResponse.json({ ok: false, slot, status: res.status, onesignal: data }, { status: 502 });
    }

    console.log(`PUSH_OK slot=${slot} id=${data?.id} recipients=${data?.recipients ?? "?"} title="${payload.title}"`);
    return NextResponse.json({ ok: true, slot, payload, onesignal: data });
  } catch (err: any) {
    console.error(`PUSH_ERR slot=${slot} EXCEPTION ${String(err?.message || err)}`);
    return NextResponse.json({ ok: false, slot, error: String(err?.message || err) }, { status: 500 });
  }
}
