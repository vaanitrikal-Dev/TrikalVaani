// ============================================================
// File: app/api/calc/muhurat/route.ts
// Version: v1.0 — Muhurat Finder API proxy
// Proxies to VM /muhurat-finder endpoint
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

const VM_URL = process.env.VM_ENGINE_URL || 'http://34.14.164.105:8001';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation — all required for a meaningful muhurat
    const required = ['year', 'month', 'day', 'latitude', 'longitude'];
    for (const f of required) {
      if (body[f] === undefined || body[f] === null) {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 });
      }
    }

    const payload = {
      year: Number(body.year),
      month: Number(body.month),
      day: Number(body.day),
      window_start_hour: Number(body.window_start_hour ?? 9),
      window_start_minute: Number(body.window_start_minute ?? 0),
      window_end_hour: Number(body.window_end_hour ?? 13),
      window_end_minute: Number(body.window_end_minute ?? 0),
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      timezone: Number(body.timezone ?? 5.5),
      step_minutes: Number(body.step_minutes ?? 10),
      full_day: body.full_day !== false, // default true
    };

    const res = await fetch(`${VM_URL}/muhurat-finder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // muhurat scan can take a few seconds (many slots)
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return NextResponse.json(
        { error: 'Muhurat engine error', detail: errText.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    const msg = e?.name === 'TimeoutError'
      ? 'Calculation timed out. Please try a smaller time window.'
      : (e?.message || 'Server error');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
