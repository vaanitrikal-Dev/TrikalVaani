/**
 * TRIKAL VAANI — Maps Key Endpoint for Browser
 * CEO: Rohiit Gupta | Chief Vedic Architect
 * File: app/api/maps-key/route.ts
 * VERSION: 1.0
 *
 * Why: Browser cannot read GOOGLE_MAPS_KEY (server-only env var).
 * This endpoint securely passes the key to the browser ONLY for trikalvaani.com requests.
 * SECURITY: Origin/referer check blocks misuse from other domains.
 */

import { NextRequest, NextResponse } from 'next/server';

const MAPS_KEY = process.env.GOOGLE_MAPS_KEY ?? '';

const ALLOWED_ORIGINS = [
  'https://trikalvaani.com',
  'https://www.trikalvaani.com',
  'http://localhost:3000',
];

export async function GET(req: NextRequest) {
  const referer = req.headers.get('referer') || '';
  const origin = req.headers.get('origin') || '';

  const isAllowed = ALLOWED_ORIGINS.some(
    (allowed) => referer.startsWith(allowed) || origin === allowed
  );

  if (process.env.NODE_ENV === 'production' && !isAllowed) {
    return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
  }

  if (!MAPS_KEY) {
    return NextResponse.json({ error: 'Maps key not configured' }, { status: 500 });
  }

  return NextResponse.json(
    { key: MAPS_KEY },
    {
      headers: {
        'Cache-Control': 'private, max-age=3600',
      },
    }
  );
}
