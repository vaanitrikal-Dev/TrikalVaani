// ============================================================
// File: app/api/calc/sade-sati/route.ts
// Purpose: VM bridge for Sade Sati Calculator (FREE forever)
// Version: v1.3
// Changelog v1.3: Fixed callVM signature — method+body passed in init object.
//   v1.2 was calling callVM('/sade-sati', vmPayload) — wrong.
//   Correct: callVM('/sade-sati', { method:'POST', body: JSON.stringify(vmPayload) })
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
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

// ─── Determine current Sade Sati phase ──────────────────────────────────────
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

// ─── Map VM remedy list to frontend remedyPlan format ───────────────────────
function buildTemplateFromVMRemedies(vmRemedies: any[]): any {
  if (!vmRemedies?.length) return null;
  return {
    remedyPlan: {
      remedies: vmRemedies.map((r: any) => {
        const base = { type: r.type, planet: r.planet ?? 'Saturn' };
        if (r.type === 'mantra') {
          return { ...base, mantra: 'ॐ शनैश्चराय नमः', count: '108', time: 'शनिवार सूर्योदय से पहले', special: r.detail };
        }
        if (r.type === 'daan') {
          return { ...base, items: 'काला तिल, उड़द दाल, लोहा, सरसों तेल', day: 'शनिवार', recipient: 'गरीब या जरूरतमंद', note: r.detail };
        }
        if (r.type === 'vrat') {
          return { ...base, name: 'शनिवार व्रत', day: 'Saturday', deity: 'Shani Dev', prasad: 'Black sesame, urad dal, mustard oil' };
        }
        if (r.type === 'gemstone') {
          return { ...base, lagna_stone: { stone: 'Blue Sapphire (Neelam)', metal: 'Silver', finger: 'Middle finger', for: r.detail } };
        }
        return { ...base, text: r.detail };
      }),
    },
    actionWindows: [],
    avoidWindows: [],
  };
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

    // 1) Call VM /sade-sati — Saturn-specific remedies via remedy_master v1.1
    const ssRes = await callVM('/sade-sati', {
      method: 'POST',
      body: JSON.stringify(vmPayload),
    });
    if (!ssRes.ok) {
      const errText = await ssRes.text();
      console.error('[sade-sati] VM /sade-sati failed:', errText);
      return NextResponse.json({ error: 'Sade Sati engine error', detail: errText }, { status: 502 });
    }
    const sadeSatiData = await ssRes.json();

    const phaseInfo = sadeSatiData?.currently_in_sade_sati && sadeSatiData?.current_cycle
      ? getCurrentPhase(sadeSatiData.current_cycle)
      : null;

    const vmRemedies: any[] = sadeSatiData?.remedies?.remedies ?? [];
    const templateData = buildTemplateFromVMRemedies(vmRemedies);

    const sessionId = `calc_ss_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      success: true,
      sessionId,
      input: { name: body.name || null, gender: body.gender || null },
      sadeSati: {
        moonRashi: sadeSatiData?.moon_rashi || null,
        currentlyInSadeSati: sadeSatiData?.currently_in_sade_sati || false,
        currentCycle: sadeSatiData?.current_cycle || null,
        allCycles: sadeSatiData?.cycles || [],
        phaseInfo,
      },
      template: templateData,
    }, { status: 200 });

  } catch (err: any) {
    console.error('[sade-sati] Fatal:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err?.message || err) }, { status: 500 });
  }
}
