/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 1.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: KUNDALI API ROUTE — PROKERALA SERVER-SIDE CALL
 * WARNING: PROKERALA CREDENTIALS ARE SERVER-ONLY — NEVER EXPOSE TO BROWSER
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildKundaliFromProkerala } from '../../../lib/prokerala';
import type { BirthData } from '../../../lib/swiss-ephemeris';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BirthData;

    // Validate required fields
    if (!body.dob || !body.tob || !body.lat || !body.lng) {
      return NextResponse.json(
        { error: 'Missing required birth data' },
        { status: 400 }
      );
    }

    const kundali = await buildKundaliFromProkerala(body);

    return NextResponse.json({ kundali });

  } catch (err: unknown) {
    console.error('[Trikal] Kundali API error:', err);
    return NextResponse.json(
      { error: 'Kundali calculation failed' },
      { status: 500 }
    );
  }
}