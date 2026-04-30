/**
 * ============================================================
 * TRIKAL VAANI — Render Keep-Alive Cron
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/keep-alive/route.ts
 * VERSION: 2.0 — Dual Render warm-up + /kundali pre-heat
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   Pings BOTH Render services every 10 minutes to prevent cold start.
 *   v2.0: Also fires a dummy /kundali call to warm the Python process,
 *   not just the HTTP server. This cuts real user wait from ~46s to ~20s.
 *
 * VERCEL CRON (vercel.json) — keep as-is:
 *   { "path": "/api/keep-alive", "schedule": "every 10 minutes" }
 * ============================================================
 */
import { NextResponse } from 'next/server';

const EPHE_API_URL     = process.env.EPHE_API_URL ?? '';               // trikal-ephemeris (Python)
const BACKEND_API_URL  = process.env.BACKEND_API_URL ?? '';            // trikal-vaani-backend (Node)
const EPHE_API_KEY     = process.env.EPHE_API_KEY ?? '';

export const maxDuration = 25; // enough for both pings + kundali warm-up

// ── Ping /health ──────────────────────────────────────────────────────────────
async function pingHealth(url: string, label: string) {
  const start = Date.now();
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(8000) });
    const data = await res.json().catch(() => ({}));
    const ms   = Date.now() - start;
    console.log(`[TV-KeepAlive] ${label} /health OK — ${ms}ms`);
    return { ok: true, ms, data };
  } catch (err) {
    console.warn(`[TV-KeepAlive] ${label} /health FAILED:`, err);
    return { ok: false, ms: Date.now() - start, error: String(err) };
  }
}

// ── Warm /kundali with dummy data ─────────────────────────────────────────────
// This wakes up the actual Swiss Ephemeris Python process inside Render,
// not just the HTTP layer. Real user request then hits a warm process.
async function warmKundali(url: string) {
  const start = Date.now();
  try {
    const res = await fetch(`${url}/kundali`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(EPHE_API_KEY ? { 'X-Api-Key': EPHE_API_KEY } : {}),
      },
      body: JSON.stringify({
        year: 1990, month: 1, day: 1,
        hour: 12, minute: 0, second: 0,
        latitude: 28.6139, longitude: 77.2090, // Delhi
        timezone: 5.5, ayanamsa: 'lahiri',
      }),
      signal: AbortSignal.timeout(15000),
    });
    const ms = Date.now() - start;
    if (res.ok) {
      console.log(`[TV-KeepAlive] /kundali warm-up OK — ${ms}ms`);
      return { ok: true, ms };
    } else {
      console.warn(`[TV-KeepAlive] /kundali warm-up ${res.status} — ${ms}ms`);
      return { ok: false, ms, status: res.status };
    }
  } catch (err) {
    console.warn(`[TV-KeepAlive] /kundali warm-up FAILED:`, err);
    return { ok: false, ms: Date.now() - start, error: String(err) };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
export async function GET() {
  if (!EPHE_API_URL) {
    return NextResponse.json({ status: 'skipped', reason: 'EPHE_API_URL not set' });
  }

  const t = Date.now();

  // Fire all pings in parallel — don't wait for one before starting next
  const [ephemerisHealth, backendHealth, kundaliWarm] = await Promise.allSettled([
    pingHealth(EPHE_API_URL, 'trikal-ephemeris'),
    BACKEND_API_URL ? pingHealth(BACKEND_API_URL, 'trikal-vaani-backend') : Promise.resolve({ ok: true, ms: 0, skipped: true }),
    warmKundali(EPHE_API_URL),
  ]);

  const totalMs = Date.now() - t;
  console.log(`[TV-KeepAlive] Done — total ${totalMs}ms`);

  return NextResponse.json({
    status:   'ok',
    total_ms: totalMs,
    time:     new Date().toISOString(),
    services: {
      ephemeris: ephemerisHealth.status === 'fulfilled' ? ephemerisHealth.value : { ok: false },
      backend:   backendHealth.status   === 'fulfilled' ? backendHealth.value   : { ok: false },
      kundali:   kundaliWarm.status     === 'fulfilled' ? kundaliWarm.value     : { ok: false },
    },
  });
}
