// ============================================================
// File: app/api/calc/sade-sati/route.ts
// Purpose: VM bridge for Sade Sati Calculator (FREE forever)
// Version: v1.1 — VM calls routed through lib/callVM.ts (X-Trikal-Key auto)
// Calls: VM /sade-sati + VM /kundali + VM /template (domain="career")
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================
// CHANGE v1.1: All three VM calls (/sade-sati, /kundali, /template) now go
// through lib/callVM.ts so the X-Trikal-Key auth header is injected
// automatically. Phase logic, validation, and response shaping unchanged.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';

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

// ─── Determine current Sade Sati phase from start/end + Moon rashi ─────
// Parashar: 12th from Moon = Rising, Moon sign = Peak, 2nd from Moon = Setting
function getCurrentPhase(currentCycle: any): { phase: string; progress: number; daysRemaining: number; phaseDescription: string } {
  if (!currentCycle?.start || !currentCycle?.end) {
    return { phase: 'Unknown', progress: 0, daysRemaining: 0, phaseDescription: '' };
  }
  const today = new Date();
  const start = new Date(currentCycle.start);
  const end = new Date(currentCycle.end);
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const progress = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
  const daysRemaining = Math.max(0, Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  let phase: string;
  let phaseDescription: string;
  if (progress < 33.33) {
    phase = 'Rising (Aaroh)';
    phaseDescription = 'Saturn is in 12th from your Moon. Beginning of Sade Sati. Watch for losses, expenses, sleep issues, foreign travel possibilities.';
  } else if (progress < 66.66) {
    phase = 'Peak (Madhya)';
    phaseDescription = 'Saturn is in your Moon sign. Most intense phase. Health, mental peace, and relationships need extra care. Spiritual growth opportunity.';
  } else {
    phase = 'Setting (Avaroh)';
    phaseDescription = 'Saturn is in 2nd from your Moon. Final phase. Financial recovery begins, family matters may demand attention, lessons consolidate.';
  }

  return { phase, progress: Math.round(progress), daysRemaining, phaseDescription };
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
    };

    // 1) Call VM /sade-sati
    const ssRes = await callVM(`${VM_BASE}/sade-sati`, {
      method: 'POST',
      body: JSON.stringify(vmPayload),
    });
    if (!ssRes.ok) {
      const errText = await ssRes.text();
      console.error('[sade-sati] VM /sade-sati failed:', errText);
      return NextResponse.json({ error: 'Sade Sati engine error', detail: errText }, { status: 502 });
    }
    const sadeSatiData = await ssRes.json();

    // 2) Call VM /kundali — needed for template engine
    const kRes = await callVM(`${VM_BASE}/kundali`, {
      method: 'POST',
      body: JSON.stringify({ ...vmPayload, house_system: 'P' }),
    });
    const kundaliData = kRes.ok ? await kRes.json() : {};

    // 3) Call VM /template (Dos/Don'ts + Remedies via Parashar)
    const sessionId = `calc_ss_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let templateData: any = null;
    try {
      const tRes = await callVM(`${VM_BASE}/template`, {
        method: 'POST',
        body: JSON.stringify({
          domain: 'career',
          kundaliData,
          sessionId,
          lang: 'hi',
        }),
      });
      if (tRes.ok) {
        const tJson = await tRes.json();
        templateData = tJson?.template ?? tJson;
      }
    } catch (e) {
      console.warn('[sade-sati] /template error, continuing:', e);
    }

    // Calculate phase if currently in Sade Sati
    const phaseInfo = sadeSatiData?.currently_in_sade_sati && sadeSatiData?.current_cycle
      ? getCurrentPhase(sadeSatiData.current_cycle)
      : null;

    // Build clean response
    const result = {
      success: true,
      sessionId,
      input: {
        name: body.name || null,
        gender: body.gender || null,
      },
      sadeSati: {
        moonRashi: sadeSatiData?.moon_rashi || null,
        currentlyInSadeSati: sadeSatiData?.currently_in_sade_sati || false,
        currentCycle: sadeSatiData?.current_cycle || null,
        allCycles: sadeSatiData?.cycles || [],
        phaseInfo,
      },
      template: templateData,
    };

    return NextResponse.json(result, { status: 200 });

  } catch (err: any) {
    console.error('[sade-sati] Fatal:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err?.message || err) }, { status: 500 });
  }
}
