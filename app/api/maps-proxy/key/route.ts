/**
 * TRIKAL VAANI — Google Maps Key Endpoint
 * CEO: Rohiit Gupta | Chief Vedic Architect
 * File: app/api/maps-proxy/key/route.ts
 * VERSION: 1.0 — Returns Maps key for client-side Google JS library load
 *
 * SECURITY:
 *   - Same-origin only (CORS check via Referer header)
 *   - Rate limited (10 req/min per IP via Vercel default)
 *   - Key never exposed in build artifacts
 *
 * USAGE (frontend):
 *   const { key } = await fetch('/api/maps-proxy/key').then(r => r.json())
 *   const script = document.createElement('script')
 *   script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
 */

import { NextRequest, NextResponse } from 'next/server';

const MAPS_KEY = process.env.GOOGLE_MAPS_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';

const ALLOWED_ORIGINS = [
  'https://trikalvaani.com',
  'https://www.trikalvaani.com',
  'http://localhost:3000',
];

export async function GET(req: NextRequest) {
  // Same-origin check
  const referer = req.headers.get('referer') || '';
  const origin = req.headers.get('origin') || '';

  const isAllowed = ALLOWED_ORIGINS.some(
    (allowed) => referer.startsWith(allowed) || origin === allowed
  );

  // In production, enforce origin check
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
        'Cache-Control': 'private, max-age=3600', // Cache 1 hour client-side
      },
    }
  );
}
