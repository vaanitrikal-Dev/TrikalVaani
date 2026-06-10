// ============================================================
// FILE: app/api/daily-rashifal/route.ts
// VERSION: 1.0 — Proxy to VM /daily-rashifal
// Caches response at Edge for 1 hour (Next.js cache)
// so VM is only hit once per hour max from Vercel side
// (VM handles its own Supabase daily cache)
// ============================================================

import { NextResponse } from 'next/server';

const VM_BASE = process.env.TRIKAL_VM_URL || 'http://34.47.182.227:8001';
const VM_KEY  = process.env.TRIKAL_VM_KEY  || '';

export const revalidate = 3600; // Edge cache: 1 hour

export async function GET() {
  try {
    const res = await fetch(`${VM_BASE}/daily-rashifal`, {
      method:  'GET',
      headers: {
        'X-Trikal-Key': VM_KEY,
        'Content-Type': 'application/json',
      },
      // Next.js fetch cache — revalidate every hour
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
