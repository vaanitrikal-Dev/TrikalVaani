/**
 * ============================================================
 * TRIKAL VAANI — Render Keep-Alive Cron
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/keep-alive/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   Pings Render every 10 minutes to prevent cold start.
 *   Called by Vercel Cron (vercel.json config below).
 * ============================================================
 */

import { NextResponse } from 'next/server';

const EPHE_API_URL = process.env.EPHE_API_URL ?? '';

export const maxDuration = 10;

export async function GET() {
  if (!EPHE_API_URL) {
    return NextResponse.json({ status: 'skipped', reason: 'EPHE_API_URL not set' });
  }

  try {
    const start = Date.now();
    const res = await fetch(`${EPHE_API_URL}/health`, {
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    const ms = Date.now() - start;

    console.log(`[TV-KeepAlive] Render ping OK — ${ms}ms — ${JSON.stringify(data)}`);

    return NextResponse.json({
      status:  'ok',
      render:  data,
      ping_ms: ms,
      time:    new Date().toISOString(),
    });
  } catch (err) {
    console.error('[TV-KeepAlive] Render ping failed:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}
