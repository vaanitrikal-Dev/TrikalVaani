/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        next.config.js
 * Version:     v1.1.1 — 301 redirect added for /upcoming-events → /panchang
 * Date:        2026-05-18
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * CHANGES vs v1.0:
 *   ✅ ADDED: async redirects() function with 301 permanent redirect
 *      /upcoming-events  →  /panchang
 *      → Preserves any link equity Google indexed for /upcoming-events
 *      → Prevents 404 errors after we delete the duplicate page
 *      → Tells Google "this content moved permanently"
 *   ✅ KEPT: eslint.ignoreDuringBuilds (allows production builds with warnings)
 *   ✅ KEPT: typescript.ignoreBuildErrors (allows TS warnings during build)
 *   ✅ KEPT: images.unoptimized (your existing image strategy)
 *
 * WHY 301 (PERMANENT) NOT 302 (TEMPORARY):
 *   - 301 transfers SEO equity to /panchang
 *   - 302 keeps equity on /upcoming-events (we don't want that — we're killing it)
 *   - Google treats 301 as the strongest "this URL is gone forever" signal
 * ============================================================================
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },

  // ──────────────────────────────────────────────────────────────────
  // SEO REDIRECTS — 301 permanent for retired pages
  // Vercel handles these at the edge (zero overhead, server-level)
  // ──────────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/upcoming-events',
        destination: '/panchang',
        permanent: true, // 301 redirect (preserves SEO equity to /panchang)
      },
    ];
  },
};

module.exports = nextConfig;
