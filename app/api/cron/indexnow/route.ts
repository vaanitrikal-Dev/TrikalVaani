/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/api/cron/indexnow/route.ts
 * Version:     v1.0
 * Phase:       C4 — AI Content Engine (Instant Indexing)
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com
 * GitHub:      vaanitrikal-Dev/TrikalVaani
 * Created:     May 09, 2026
 *
 * PURPOSE:
 *   Submits URLs to IndexNow protocol for instant indexing by:
 *     - Bing  (which feeds Google via partnership)
 *     - Yandex
 *     - Naver
 *     - Seznam
 *   Google does NOT directly support IndexNow (May 2026), but Bing pushes
 *   discoveries to Google. Result: 24–48 hour indexing vs 1–4 weeks normal.
 *
 * HOW IT WORKS:
 *   1. Verification key file lives at trikalvaani.com/{INDEXNOW_KEY}.txt
 *   2. POST to https://api.indexnow.org/indexnow with key + URL list
 *   3. Bing crawls within minutes
 *
 * IRON RULES:
 *   1. Bearer auth via CRON_SECRET — same secret as panchang-generate.
 *   2. Max 10,000 URLs per call (IndexNow protocol limit).
 *   3. CEO-approved scope = LEAN: only newly generated URLs (no daily resubmit).
 *   4. Idempotent — IndexNow accepts duplicate submissions, no penalty.
 *
 * USAGE:
 *   POST /api/cron/indexnow
 *   Authorization: Bearer ${CRON_SECRET}
 *   Body: { "urls": ["https://trikalvaani.com/panchang/2026-05-09", ...] }
 *
 * ENV VARS:
 *   - INDEXNOW_KEY    (32-char hex, also placed at public/{KEY}.txt)
 *   - CRON_SECRET
 *   - SITE_URL        (https://trikalvaani.com)
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// ============================================================================
// CONFIG
// ============================================================================

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const SITE_URL = process.env.SITE_URL || "https://trikalvaani.com";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const HOST = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

// ============================================================================
// VALIDATION
// ============================================================================

function validateUrls(urls: unknown): { ok: true; urls: string[] } | { ok: false; error: string } {
  if (!Array.isArray(urls)) {
    return { ok: false, error: "Body 'urls' must be an array" };
  }
  if (urls.length === 0) {
    return { ok: false, error: "Body 'urls' is empty" };
  }
  if (urls.length > 10000) {
    return { ok: false, error: "Max 10,000 URLs per call (IndexNow protocol limit)" };
  }

  const cleaned: string[] = [];
  for (const u of urls) {
    if (typeof u !== "string") {
      return { ok: false, error: `Non-string URL: ${JSON.stringify(u)}` };
    }
    // IndexNow requires URLs to be on the same host as the key file
    if (!u.startsWith(SITE_URL)) {
      return { ok: false, error: `URL must start with ${SITE_URL}: ${u}` };
    }
    cleaned.push(u);
  }
  return { ok: true, urls: cleaned };
}

// ============================================================================
// MAIN HANDLER — POST
// ============================================================================

export async function POST(req: NextRequest) {
  // -------- AUTH --------
  const authHeader = req.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!INDEXNOW_KEY) {
    return NextResponse.json(
      { error: "INDEXNOW_KEY env var not set. Generate at https://www.bing.com/indexnow/getstarted" },
      { status: 500 }
    );
  }

  // -------- PARSE BODY --------
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const v = validateUrls(body?.urls);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  // -------- BUILD INDEXNOW PAYLOAD --------
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: v.urls,
  };

  // -------- SUBMIT --------
  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });

    // IndexNow status codes:
    //   200 = OK, all URLs accepted
    //   202 = Accepted, validation pending (key not yet propagated)
    //   400 = Bad request (malformed)
    //   403 = Forbidden (key file mismatch)
    //   422 = Unprocessable (URL doesn't match host)
    //   429 = Rate limited
    const responseBody = await res.text();

    return NextResponse.json(
      {
        success: res.status === 200 || res.status === 202,
        status: res.status,
        urls_submitted: v.urls.length,
        host: HOST,
        keyLocation: payload.keyLocation,
        indexnow_response: responseBody.substring(0, 500),
        urls: v.urls.slice(0, 5), // echo first 5 for log readability
      },
      { status: res.status === 200 || res.status === 202 ? 200 : 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `IndexNow submission failed: ${err?.message ?? err}` },
      { status: 502 }
    );
  }
}

// ============================================================================
// GET — health check / single-URL ping (per IndexNow spec)
// ============================================================================

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: "INDEXNOW_KEY not set" }, { status: 500 });
  }

  return NextResponse.json({
    status: "ready",
    host: HOST,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    note: "POST { urls: string[] } with Bearer auth to submit",
  });
}

// ============================================================================
// END — app/api/cron/indexnow/route.ts v1.0
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
