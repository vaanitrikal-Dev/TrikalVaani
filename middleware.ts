/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        middleware.ts
 * Version:     v1.1 — adds ?lang=hi → /hi/compatibility/ redirect (144 pairs)
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
 *   The `matcher` below scopes this middleware to only the paths it needs
 *   (v1.1 added the compatibility pair pages) — it does not run on any other
 *   request, so there is zero performance impact anywhere else on the site.
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

  // ── v1.1: compatibility Hindi consolidation (5 Sep 2026) ──────────────────
  //
  // /compatibility/{pair}?lang=hi and /hi/compatibility/{pair} served the SAME
  // Hindi page, both returned 200, and each declared itself canonical. GSC over
  // the 3 months to 2 Sep 2026 shows the ?lang=hi variants holding thousands of
  // impressions at 0.30-0.70% CTR — the classic signature of a split signal
  // that Google never consolidated.
  //
  // app/compatibility/[pair]/page.tsx v1.5 stops ADVERTISING the query URL
  // (canonical, hreflang, toggle, related links). This redirect stops it
  // EXISTING, which is what actually collapses the duplicate.
  //
  // Safe for the wrapper: app/hi/compatibility/[pair]/page.tsx imports the
  // component and calls it with searchParams {lang:'hi'} in-process. That is a
  // function call, not an HTTP request, so it never reaches middleware and
  // cannot loop.
  if (pathname.startsWith('/compatibility/') && searchParams.get('lang') === 'hi') {
    const pair = pathname.slice('/compatibility/'.length);
    // Guard against a trailing slash or a nested path producing a broken target.
    if (pair && !pair.includes('/')) {
      // new URL(...) built by hand so the ?lang=hi is NOT carried over — the
      // same reason this file exists at all (see the note above).
      const destination = new URL(`/hi/compatibility/${pair}`, origin);
      return NextResponse.redirect(destination, 308);
    }
  }

  return NextResponse.next();
}

// Scoped matcher — this middleware runs ONLY for these paths. Every other
// request on the site bypasses this file entirely, so there is no measurable
// performance cost site-wide.
//
// '/compatibility/:pair' matches exactly one segment after /compatibility/,
// which is every pair page and nothing deeper.
export const config = {
  matcher: ['/learn/sibling-prediction-astrology', '/compatibility/:pair'],
};
