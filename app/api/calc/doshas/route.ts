// ============================================================
// File: app/api/calc/doshas/route.ts
// Purpose: VM bridge for Dosha Calculators (Kaal Sarp, Pitra, etc.)
// Version: v1.0
// Calls VM POST /doshas (additive endpoint) → returns doshas list
//   + rahu/ketu houses + lagna for the dosha pages.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CalcInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone: number;
  name?: string;
  gender?: 'male' | 'female' | 'other';
}

export async function POST(req: NextRequest) {
  try {
    const body: CalcInput = await req.json();

    const required = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'];
    for (const f of required) {
      if (body[f as keyof CalcInput] === undefined || body[f as keyof CalcInput] === null) {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 });
      }
    }

    const vmPayload = {
      year: body.year,
      month: body.month,
      day: body.day,
      hour: body.hour,
      minute: body.minute,
      second: 0,
      latitude: body.latitude,
      longitude: body.longitude,
      timezone: body.timezone,
      ayanamsa: 'lahiri',
      house_system: 'P',
    };

    const res = await callVM('/doshas', {
      method: 'POST',
      body: JSON.stringify(vmPayload),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[doshas] VM /doshas failed:', errText);
      return NextResponse.json({ error: 'Dosha engine error', detail: errText }, { status: 502 });
    }
    const data = await res.json();

    const sessionId = `calc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      success: true,
      sessionId,
      input: { name: body.name || null, gender: body.gender || null },
      doshas: Array.isArray(data?.doshas) ? data.doshas : [],
      rahu_house: data?.rahu_house ?? null,
      ketu_house: data?.ketu_house ?? null,
      lagna: data?.lagna ?? null,
    }, { status: 200 });

  } catch (err: any) {
    console.error('[doshas] Fatal:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err?.message || err) }, { status: 500 });
  }
}
