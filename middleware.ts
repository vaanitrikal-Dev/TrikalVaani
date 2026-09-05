/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        middleware.ts
 * Version:     v1.0 — clean redirect for sibling-prediction Hindi page (Sep 2026)
 * Date:        2026-09-05
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * WHY THIS FILE EXISTS:
 *   next.config.js `redirects()` ALWAYS forwards the original request's
 *   query string to the destination (this is documented, unconditional
 *   Next.js behaviour — there is no config option to strip it). That made
 *   the old /learn/sibling-prediction-astrology?lang=hi redirect land on
 *   /blog/kitne-bhai-bahan-honge-kundali-se?lang=hi instead of the clean
 *   URL. The page still rendered correctly (200) either way — this was
 *   purely cosmetic — but Rohiit asked for the exact clean URL.
 *
 *   Middleware runs before next.config.js redirects and lets us build the
 *   destination URL manually (new URL(pathname, origin)) WITHOUT copying
 *   the incoming search params, which is the only way to actually drop
 *   ?lang=hi during the redirect.
 *
 *   The `matcher` below scopes this middleware to ONLY this one exact path
 *   — it does not run on any other request, so there is zero performance
 *   impact anywhere else on the site.
 *
 * ACTION NEEDED IN next.config.js:
 *   The now-redundant entry added in v1.5 (source:
 *   '/learn/sibling-prediction-astrology' with the ?lang=hi `has` match)
 *   should be REMOVED from next.config.js's redirects() array, since this
 *   middleware now owns that redirect and having both is dead/confusing
 *   config. A matching v1.6 next.config.js is provided separately with
 *   that one entry removed — everything else unchanged.
 * ============================================================================
 */
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams, origin } = request.nextUrl;

  if (
    pathname === '/learn/sibling-prediction-astrology' &&
    searchParams.get('lang') === 'hi'
  ) {
    // Clean destination — no leftover query string.
    const destination = new URL('/blog/kitne-bhai-bahan-honge-kundali-se', origin);
    return NextResponse.redirect(destination, 308); // 308 = permanent, same as next.config.js redirects
  }

  return NextResponse.next();
}

// Scoped matcher — this middleware ONLY runs for this exact path.
// Every other request on the site bypasses this file entirely.
export const config = {
  matcher: '/learn/sibling-prediction-astrology',
};
