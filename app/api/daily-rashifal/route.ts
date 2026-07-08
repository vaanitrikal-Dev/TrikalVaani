// ============================================================
// FILE: app/api/daily-rashifal/route.ts
// VERSION: 1.1 — Proxy to VM /daily-rashifal
//
// CHANGE v1.0 → v1.1 (2026-07-08):
//   FIXED BUILD FAILURE. Removed the top-level `export const revalidate
//   = 3600`. That export made Next.js treat this route as STATIC, so
//   `next build` tried to execute this handler — and wait on the live
//   VM call to Gemini — at BUILD TIME. When Gemini returned a truncated
//   JSON array for the 12-rashi prediction, the VM call hung past
//   Next.js's static-generation timeout (60s x 3 retries), which failed
//   the entire production deployment.
//
//   The route is now correctly DYNAMIC — executed only at request time,
//   never during build. The VM is still only hit roughly once per hour,
//   because the inner `fetch(..., { next: { revalidate: 3600 } })` call
//   below already handles that caching on its own. That was always the
//   real caching mechanism; the top-level export was redundant and was
//   the actual cause of the build hang.
//
//   No other logic changed from v1.0.
// ============================================================
import { NextResponse } from 'next/server';

const VM_BASE = process.env.TRIKAL_VM_URL || 'http://34.47.182.227:8001';
const VM_KEY  = process.env.TRIKAL_VM_KEY  || '';

export async function GET() {
  try {
    const res = await fetch(`${VM_BASE}/daily-rashifal`, {
      method:  'GET',
      headers: {
        'X-Trikal-Key': VM_KEY,
        'Content-Type': 'application/json',
      },
      // Next.js fetch cache — revalidate every hour. This is the only
      // caching mechanism this route needs; it keeps the VM call out
      // of the build entirely while still limiting VM hits to roughly
      // once per hour.
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[daily-rashifal API] VM error:', res.status, text);
      return NextResponse.json(
        { error: 'VM unavailable', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    console.error('[daily-rashifal API] fetch error:', err?.message);
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }
}
