// ============================================================
// File: app/api/calc/manglik-dosh/route.ts
// Purpose: VM bridge for Manglik Dosh Calculator (FREE forever)
// Version: v1.3
// Changelog v1.3: Fixed callVM signature (method+body in init object).
//   v1.2 was calling callVM('/manglik-dosh', vmPayload) — wrong.
//   Correct: callVM('/manglik-dosh', { method:'POST', body: JSON.stringify(vmPayload) })
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

// ─── House meaning per Parashar BPHS ────────────────────────────────────────
function getHouseEffect(house: number): string {
  const effects: Record<number, string> = {
    1: 'Lagna (Self) — Personality, body, temperament. Mars here = aggressive, dominant nature.',
    2: 'Dhana (Wealth) — Family wealth, speech. Mars here = harsh speech, family discord.',
    4: 'Sukha (Home) — Domestic happiness, mother, property. Mars here = home tensions, peace disturbed.',
    7: 'Kalatra (Spouse) — Marriage, partnership. Mars here = marital conflict, spouse health issues.',
    8: 'Ayur (Longevity) — Spouse longevity, in-laws. Mars here = sudden challenges, accident risk to spouse.',
    12: 'Vyaya (Loss) — Bed pleasures, expenses, foreign. Mars here = marital intimacy issues, loss of peace.',
  };
  return effects[house] || `House ${house} — affected by Mars placement.`;
}

function getSeverityColor(severity: string): string {
  if (severity === 'High') return '#FCA5A5';
  if (severity === 'Medium') return '#FBBF24';
  if (severity === 'Low') return '#86EFAC';
  return '#94a3b8';
}

// ─── Map VM remedy list to frontend remedyPlan format ───────────────────────
function buildTemplateFromVMRemedies(vmRemedies: any[]): any {
  if (!vmRemedies?.length) return null;
  return {
    remedyPlan: {
      remedies: vmRemedies.map((r: any) => {
        const base = { type: r.type, planet: r.planet ?? 'Mars' };
        if (r.type === 'mantra') {
          return { ...base, mantra: 'ॐ अंगारकाय नमः', count: '108', time: 'मंगलवार सुबह', special: r.detail };
        }
        if (r.type === 'daan') {
          return { ...base, items: 'मसूर दाल, गुड़, तांबा, लाल वस्त्र', day: 'मंगलवार', recipient: 'गरीब या जरूरतमंद', note: r.detail };
        }
        if (r.type === 'vrat') {
          return { ...base, name: 'मंगलवार व्रत', day: 'Tuesday', deity: 'Hanuman ji', prasad: 'Red lentils, jaggery, red flowers' };
        }
        if (r.type === 'gemstone') {
          return { ...base, lagna_stone: { stone: 'Red Coral (Moonga)', metal: 'Gold', finger: 'Ring finger', for: r.detail } };
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

    // 1) Call VM /manglik-dosh — returns Mars-specific remedies via remedy_master v1.1
    const mdRes = await callVM('/manglik-dosh', {
      method: 'POST',
      body: JSON.stringify(vmPayload),
    });
    if (!mdRes.ok) {
      const errText = await mdRes.text();
      console.error('[manglik-dosh] VM /manglik-dosh failed:', errText);
      return NextResponse.json({ error: 'Manglik engine error', detail: errText }, { status: 502 });
    }
    const manglikData = await mdRes.json();

    // Enrich house meaning
    const houseEffect = manglikData?.is_manglik && manglikData?.mars_house
      ? getHouseEffect(manglikData.mars_house)
      : null;

    // Build templateData from VM Mars remedies
    const vmRemedies: any[] = manglikData?.remedies?.remedies ?? [];
    const templateData = buildTemplateFromVMRemedies(vmRemedies);

    const sessionId = `calc_md_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      success: true,
      sessionId,
      input: {
        name: body.name || null,
        gender: body.gender || null,
      },
      manglik: {
        isManglik: manglikData?.is_manglik || false,
        severity: manglikData?.severity || null,
        severityColor: getSeverityColor(manglikData?.severity || ''),
        marsHouse: manglikData?.mars_house || null,
        marsSign: manglikData?.mars_sign || null,
        marsLongitude: manglikData?.mars_longitude || null,
        houseEffect,
        cancellationConditions: manglikData?.cancellation_conditions || [],
        manglikHousesAffected: manglikData?.manglik_houses_affected || [1, 2, 4, 7, 8, 12],
      },
      template: templateData,
    }, { status: 200 });

  } catch (err: any) {
    console.error('[manglik-dosh] Fatal:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err?.message || err) }, { status: 500 });
  }
}
