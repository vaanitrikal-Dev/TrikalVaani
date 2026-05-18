// ============================================================
// File: app/api/calc/kundali/route.ts
// Purpose: VM bridge for Kundali Calculator (FREE forever)
// Version: v1.1 — Fixed instant.nakshatra + current_dasha paths
// Calls: VM /kundali + VM /template (domain="kundali")
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
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

// ─── Find current Mahadasha by date comparison ───────────────────────────────
// VM's is_current is always false — must detect by comparing today's date
function getCurrentDasha(mahaList: any[]): { mahadasha: string | null; antardasha: string | null } {
  if (!Array.isArray(mahaList) || mahaList.length === 0) {
    return { mahadasha: null, antardasha: null };
  }
  const today = new Date();
  let currentMaha: any = null;

  for (const m of mahaList) {
    const start = new Date(m.start);
    const end = new Date(m.end);
    if (today >= start && today <= end) {
      currentMaha = m;
      break;
    }
  }

  // Fallback to last item if nothing found (should not happen)
  if (!currentMaha) currentMaha = mahaList[mahaList.length - 1];

  // Find current Antardasha inside current Mahadasha
  const antarList = currentMaha?.antar ?? [];
  let currentAntar: any = null;
  for (const a of antarList) {
    const aStart = new Date(a.start);
    const aEnd = new Date(a.end);
    if (today >= aStart && today <= aEnd) {
      currentAntar = a;
      break;
    }
  }
  if (!currentAntar && antarList.length > 0) currentAntar = antarList[0];

  return {
    mahadasha: currentMaha?.planet || null,
    antardasha: currentAntar?.planet || null,
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
          domain: 'career',
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

    // ─── Get current dasha via date comparison ───────────────────────────────
    // VM structure: kundaliData.dasha.maha_dasha[] with .planet, .start, .end, .antar[]
    // is_current is always false in VM — must compare dates
    const mahaList = kundaliData?.dasha?.maha_dasha ?? [];
    const { mahadasha: currentMahadasha, antardasha: currentAntardasha } = getCurrentDasha(mahaList);

    // ─── Moon graha for correct nakshatra ───────────────────────────────────
    // Janma Nakshatra = Moon's nakshatra (NOT Lagna nakshatra)
    const moonGraha = kundaliData?.grahas?.find((g: any) => g.planet === 'Moon');

    // Build clean response for frontend
    const result = {
      success: true,
      sessionId,
      input: {
        name: body.name || null,
        gender: body.gender || null,
      },
      instant: {
        // Lagna fields (for Kundali calculator)
        lagna: kundaliData.lagna?.sign || null,
        lagna_en: kundaliData.lagna?.sign_en || null,
        lagna_lord: kundaliData.lagna?.sign_lord || null,

        // ✅ FIXED: Janma Nakshatra = Moon's nakshatra (not Lagna)
        nakshatra: moonGraha?.nakshatra || null,
        nakshatra_lord: moonGraha?.nakshatra_lord || null,
        pada: moonGraha?.pada || null,

        // Moon + Sun signs
        chandra_rashi: moonGraha?.sign || null,
        surya_rashi: kundaliData.grahas?.find((g: any) => g.planet === 'Sun')?.sign || null,

        // ✅ FIXED: Current dasha via date comparison (is_current always false in VM)
        current_dasha: currentMahadasha,
        current_antardasha: currentAntardasha,
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
