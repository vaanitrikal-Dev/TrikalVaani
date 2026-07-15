/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        next.config.js
 * Version:     v1.3 — long-cache immutable headers for /diagrams/ (perf, Jul 2026)
 * Date:        2026-07-16
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * CHANGES vs v1.2:
 *   ✅ ADDED async headers() that sets a 1-year immutable Cache-Control on
 *      every file under /diagrams/ (all 31 hast-rekha SVGs, EN + HI).
 *        Cache-Control: public, max-age=31536000, immutable
 *      WHY: these SVGs were served with "max-age=0, must-revalidate", forcing
 *      the browser to re-check every diagram on every page view. They are
 *      immutable static assets — a changed diagram always ships under a NEW
 *      filename (e.g. -hi.svg), never a mutated one — so they are safe to cache
 *      hard. This cuts repeat-visit load time and Vercel edge bandwidth with
 *      zero risk of stale content. Applied only to /diagrams/, nothing else.
 *   ✅ KEPT (v1.2): all 4 redirects — /upcoming-events, /predict, /birth-form,
 *      /karmic-reading — unchanged.
 *   ✅ KEPT: eslint.ignoreDuringBuilds, typescript.ignoreBuildErrors,
 *      images.unoptimized
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
  // SEO + CONVERSION REDIRECTS
  // Vercel handles these at the edge (zero overhead, server-level)
  // ──────────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/upcoming-events',
        destination: '/panchang',
        permanent: true, // 301 — retired page, preserve SEO equity to /panchang
      },
      {
        source: '/predict',
        destination: '/#birth-form',
        permanent: false, // 307 — CTA target was 404; send to the free kundli form
      },
      {
        source: '/birth-form',
        destination: '/#birth-form',
        permanent: false, // 307 — legacy CTA target was 404; send to the form
      },
      {
        source: '/karmic-reading',
        destination: '/karmic-background-reading',
        permanent: true, // 301 — typo/legacy slug → permanent canonical page
      },
    ];
  },
  // ──────────────────────────────────────────────────────────────────
  // STATIC ASSET CACHING
  // /diagrams/ holds immutable hast-rekha SVGs (EN + HI). A changed diagram
  // always ships under a new filename, so these can be cached for 1 year.
  // ──────────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/diagrams/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
