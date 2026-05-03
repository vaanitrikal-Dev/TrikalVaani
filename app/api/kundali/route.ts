/**
 * ============================================================
 * TRIKAL VAANI — Kundali API Route
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/kundali/route.ts
 * VERSION: 2.0-MASTER
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v2.0 CHANGES (CEO Decision — May 2026):
 *   - Prokerala REMOVED completely (API keys deleted by CEO)
 *   - Now uses Swiss Ephemeris (Meeus) exclusively via buildKundali()
 *   - No external API calls — zero latency, zero dependency
 *   - source field = 'swiss_ephemeris_meeus'
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildKundali }   from '../../../lib/swiss-ephemeris';
import type { BirthData } from '../../../lib/swiss-ephemeris';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BirthData;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!body.dob) {
      return NextResponse.json(
        { error: 'Missing required field: dob' },
        { status: 400 }
      );
    }
    if (!body.tob) {
      return NextResponse.json(
        { error: 'Missing required field: tob' },
        { status: 400 }
      );
    }
    if (!body.lat) {
      return NextResponse.json(
        { error: 'Missing required field: lat' },
        { status: 400 }
      );
    }
    if (!body.lng) {
      return NextResponse.json(
        { error: 'Missing required field: lng' },
        { status: 400 }
      );
    }

    // ── Build Kundali — Swiss Ephemeris (Meeus) ───────────────────────────────
    // CEO Decision May 2026: Prokerala removed. Meeus is the sole engine.
    const kundali = buildKundali(body);
    const source  = 'swiss_ephemeris_meeus';

    return NextResponse.json({ kundali, source });

  } catch (err: unknown) {
    console.error('[TV-Kundali] Error:', err);
    return NextResponse.json(
      { error: 'Kundali calculation failed. Please check birth data and retry.' },
      { status: 500 }
    );
  }
}
