// ============================================================
// File: app/api/calc/kundali/route.ts
// Purpose: VM bridge for Kundali Calculator (FREE forever)
// Version: v1.0
// Calls: VM /kundali + VM /template (domain="kundali")
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

const VM_BASE = 'http://34.14.164.105:8001';

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

    // Validate
    const required = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'];
    for (const f of required) {
      if (body[f as keyof CalcInput] === undefined || body[f as keyof CalcInput] === null) {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 });
      }
    }

    // Build VM payload
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

    // 1) Call VM /kundali
    const kRes = await fetch(`${VM_BASE}/kundali`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vmPayload),
      cache: 'no-store',
    });

    if (!kRes.ok) {
      const errText = await kRes.text();
      console.error('[kundali] VM /kundali failed:', errText);
      return NextResponse.json({ error: 'Kundali engine error', detail: errText }, { status: 502 });
    }

    const kundaliData = await kRes.json();

    // 2) Call VM /template (Dos/Don'ts + Remedies via Parashar)
    const sessionId = `calc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let templateData: any = null;
    try {
      const tRes = await fetch(`${VM_BASE}/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: 'kundali',
          kundaliData,
          sessionId,
          lang: 'hi',
        }),
        cache: 'no-store',
      });
      if (tRes.ok) {
        templateData = await tRes.json();
      } else {
        console.warn('[kundali] /template non-200, continuing without it');
      }
    } catch (e) {
      console.warn('[kundali] /template error, continuing:', e);
    }

    // Build clean response for frontend
    const result = {
      success: true,
      sessionId,
      input: {
        name: body.name || null,
        gender: body.gender || null,
      },
      // Instant card data
      instant: {
        lagna: kundaliData.lagna?.sign || null,
        lagna_en: kundaliData.lagna?.sign_en || null,
        lagna_lord: kundaliData.lagna?.sign_lord || null,
        nakshatra: kundaliData.lagna?.nakshatra || null,
        pada: kundaliData.lagna?.pada || null,
        chandra_rashi: kundaliData.grahas?.find((g: any) => g.planet === 'Moon')?.sign || null,
        surya_rashi: kundaliData.grahas?.find((g: any) => g.planet === 'Sun')?.sign || null,
        current_dasha: kundaliData.dasha?.current?.mahadasha?.lord || null,
        current_antardasha: kundaliData.dasha?.current?.antardasha?.lord || null,
      },
      // Full data
      kundali: kundaliData,
      // Dos/Don'ts + Remedies
      template: templateData,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[kundali] Fatal:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err?.message || err) }, { status: 500 });
  }
}
