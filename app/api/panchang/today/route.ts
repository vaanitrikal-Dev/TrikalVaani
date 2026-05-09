// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/api/panchang/today/route.ts
// Version:     v1.1
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
// Purpose:     Vercel proxy → GCP VM panchang engine (port 8001)
//              v1.0 → today only
//              v1.1 → forwards ?date=YYYY-MM-DD&lat=&lon= to VM
//                     for /panchang/[date] archive (Phase B1)
// Stack:       Next.js 13.5 App Router + Vercel Pro
// VM:          34.14.164.105:8001
// Lock Status: gemini-prompt.ts = PERMANENTLY LOCKED (do not touch)
// Last Update: 2026-05-09 (Phase B1)
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // never cache the proxy itself
export const revalidate = 0;

const VM_BASE = process.env.VM_PANCHANG_BASE || "http://34.14.164.105:8001";
const TIMEOUT_MS = 8000;

// ── Validation ───────────────────────────────────────────────────────
function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  if (isNaN(d.getTime())) return false;
  const y = d.getUTCFullYear();
  return y >= 1950 && y <= 2100;
}

function isValidLatLon(lat: string | null, lon: string | null): boolean {
  if (lat === null && lon === null) return true; // optional
  if (lat === null || lon === null) return false;
  const la = Number(lat);
  const lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return false;
  return la >= -90 && la <= 90 && lo >= -180 && lo <= 180;
}

// ── Handler ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // Validate inputs early — reject bad input before hitting VM
  if (date && !isValidDate(date)) {
    return NextResponse.json(
      { error: "Invalid date. Expected YYYY-MM-DD between 1950 and 2100." },
      { status: 400 },
    );
  }

  if (!isValidLatLon(lat, lon)) {
    return NextResponse.json(
      { error: "Invalid lat/lon. Provide both, valid ranges -90..90 / -180..180." },
      { status: 400 },
    );
  }

  // Build VM query string
  const vmParams = new URLSearchParams();
  if (date) vmParams.set("date", date);
  if (lat) vmParams.set("lat", lat);
  if (lon) vmParams.set("lon", lon);

  const url = `${VM_BASE}/panchang/today${vmParams.toString() ? "?" + vmParams.toString() : ""}`;

  // Call VM with timeout
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const vmRes = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(t);

    if (!vmRes.ok) {
      const body = await vmRes.text().catch(() => "");
      return NextResponse.json(
        { error: "VM panchang engine error", status: vmRes.status, detail: body.slice(0, 300) },
        { status: 502 },
      );
    }

    const data = await vmRes.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        // ISR-friendly: 24h fresh, 7d stale-while-revalidate
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: unknown) {
    clearTimeout(t);
    const message = err instanceof Error ? err.message : "Unknown error";
    const isAbort = message.includes("aborted") || message.includes("timeout");
    return NextResponse.json(
      { error: isAbort ? "VM timeout" : "VM unreachable", detail: message },
      { status: isAbort ? 504 : 502 },
    );
  }
}
