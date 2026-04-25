/**
 * ============================================================
 * TRIKAL VAANI — Kundali API Route
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/kundali/route.ts
 * VERSION: 1.1-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * PURPOSE:
 *   Prokerala server-side call — credentials never exposed to browser.
 *   Receives birth data → returns full KundaliData object.
 *
 * v1.1 CHANGES:
 *   - Fixed corrupted body.lat validation (markdown link corruption)
 *   - Added lng validation explicitly
 *   - Added Meeus fallback if Prokerala fails
 *   - Cleaner error messages
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildKundaliFromProkerala } from '../../../lib/prokerala';
import { buildKundali }              from '../../../lib/swiss-ephemeris';
import type { BirthData }            from '../../../lib/swiss-ephemeris';

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

    // ── Build Kundali — Prokerala first, Meeus fallback ───────────────────────
    let kundali;
    let source = 'prokerala_swiss_ephemeris';

    try {
      kundali = await buildKundaliFromProkerala(body);
    } catch (prokeralaErr) {
      console.warn('[TV-Kundali] Prokerala failed — using Meeus fallback:', prokeralaErr);
      kundali = buildKundali(body);
      source  = 'meeus_fallback';
    }

    return NextResponse.json({ kundali, source });

  } catch (err: unknown) {
    console.error('[TV-Kundali] Error:', err);
    return NextResponse.json(
      { error: 'Kundali calculation failed. Please check birth data and retry.' },
      { status: 500 }
    );
  }
}