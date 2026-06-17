/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        next.config.js
 * Version:     v1.2 — CTA dead-link redirects added (conversion fix, Jun 2026)
 * Date:        2026-06-18
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * CHANGES vs v1.1.1:
 *   ✅ ADDED 3 redirects that fix dead CTA targets found in a conversion audit:
 *        /predict        → /#birth-form               (307 temporary)
 *        /birth-form     → /#birth-form               (307 temporary)
 *        /karmic-reading → /karmic-background-reading (301 permanent)
 *      WHY: festival/event + domain page CTAs pointed to /predict (404), and
 *      some blog CTAs to /karmic-reading (404). These silently sent visitors
 *      to dead pages and killed conversions. One redirect layer fixes every
 *      code reference at once — no need to hunt through templates.
 *      /predict & /birth-form use 307 (temporary) in case a dedicated birth
 *      landing page is built later; /karmic-reading uses 301 because
 *      /karmic-background-reading is the permanent canonical page.
 *   ✅ KEPT (v1.1.1): 301 /upcoming-events → /panchang
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
};
module.exports = nextConfig;
