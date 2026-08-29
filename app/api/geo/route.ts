/**
 * ============================================================
 * TRIKAL VAANI — Visitor Country Detection
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/geo/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Reads Vercel's own geo header. Free, no external API, no key.
 *
 * WHY A ROUTE AND NOT MIDDLEWARE:
 *   Pages are statically generated / ISR. Reading the header inside a page
 *   would force it dynamic and kill caching. A tiny client-side fetch to this
 *   route keeps every existing page exactly as fast as it is today.
 *
 * FALLBACK: if the header is missing (local dev, odd proxy) we return 'IN'.
 *   India is the safe default — the visitor then sees the existing Razorpay
 *   flow, which is what happens today anyway. Nothing breaks.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { isIndia } from '@/lib/pricing-intl';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const country =
    req.headers.get('x-vercel-ip-country')?.toUpperCase() || 'IN';

  return NextResponse.json(
    {
      country,
      isIndia: isIndia(country),
      currency: isIndia(country) ? 'INR' : 'USD',
    },
    {
      headers: {
        // Never cache — the answer differs per visitor.
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
