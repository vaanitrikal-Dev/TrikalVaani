/**
 * ============================================================
 * TRIKAL VAANI — Visitor Country Detection
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/geo/route.ts
 * VERSION: 1.1 (24 Nov 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * v1.1 (24 Nov 2026, Rohiit approved — Vercel->Cloudflare move): also reads
 *   Cloudflare's `cf-ipcountry` header, so foreign visitors still get USD/PayPal
 *   on Cloudflare. Vercel header is checked first (unchanged on Vercel).
 *   Cloudflare sends "XX"/"T1" for unknown/Tor — those fall back to 'IN' as before.
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
  const cf = req.headers.get('cf-ipcountry')?.toUpperCase();
  const country =
    req.headers.get('x-vercel-ip-country')?.toUpperCase() ||
    (cf && cf !== 'XX' && cf !== 'T1' ? cf : '') ||
    'IN';

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
