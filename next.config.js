/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        next.config.js
 * Version:     v1.7 — 2 indexed /learn/ 404s redirected to their /blog/ twins
 * Date:        2026-09-05
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * CHANGES vs v1.6 — 5 Sep 2026:
 *   ✅ ADDED 2 redirects for /learn/ URLs that Google has indexed but that
 *      have NEVER existed in seo_pillar_pages — both return 404 today:
 *        /learn/saturn-transit-2026                 1,911 impr, 19 clicks
 *        /learn/raksha-bandhan-shubh-muhurat-2026     873 impr,  3 clicks
 *      (GSC, 3 months to 2 Sep 2026.) Both have a real, live twin under
 *      /blog/ with the identical slug, so the content the searcher wanted
 *      exists — only the path was wrong. A 404 that keeps earning
 *      impressions is the worst case available: crawl budget spent, click
 *      thrown away, and the clicks it does get land on an error page.
 *      Verified before writing: /learn/saturn-transit-2026 → 404,
 *      /blog/saturn-transit-2026 → 200.
 *      Query-string carry-over (the v1.6 problem) does not apply here —
 *      these URLs are hit without a query string.
 * ============================================================================
 * CHANGES vs v1.5:
 *   ✅ REMOVED the /learn/sibling-prediction-astrology?lang=hi redirect
 *      added in v1.5. next.config.js redirects() ALWAYS forward the
 *      incoming query string to the destination (documented Next.js
 *      behaviour, no config option to stop it) — so that redirect landed
 *      on /blog/kitne-bhai-bahan-honge-kundali-se?lang=hi instead of the
 *      clean URL. The page rendered fine either way (this was cosmetic
 *      only), but the clean-URL version of this redirect now lives in a
 *      NEW file, middleware.ts (repo root), which can build the
 *      destination URL without carrying over ?lang=hi. Deploy middleware.ts
 *      ALONGSIDE this file — the redirect only works with both in place.
 *   ✅ KEPT (v1.4): all 20 Hindi-slug-rename redirects (Kundali/Property/
 *      Wealth hubs), unchanged.
 *   ✅ KEPT (v1.3): the /diagrams/ 1-year immutable Cache-Control headers.
 *   ✅ KEPT (v1.2): all 4 original redirects — /upcoming-events, /predict,
 *      /birth-form, /karmic-reading — unchanged.
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
      // ── v1.7: indexed /learn/ 404s → their existing /blog/ twins ──
      {
        source: '/learn/saturn-transit-2026',
        destination: '/blog/saturn-transit-2026',
        permanent: true, // 301 — page never existed at /learn/, content lives at /blog/
      },
      {
        source: '/learn/raksha-bandhan-shubh-muhurat-2026',
        destination: '/blog/raksha-bandhan-shubh-muhurat-2026',
        permanent: true, // 301 — same case as above
      },
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

      // ──────────────────────────────────────────────────────────────
      // HINDI SLUG RENAME (3 Sep 2026) — old "-hindi"-suffix slugs →
      // new pure-transliterated-Hindi slugs. All 301 (permanent): these
      // are genuine renames of live content, not retired pages, so the
      // old URL's SEO equity should transfer fully to the new URL.
      // ──────────────────────────────────────────────────────────────

      // Kundali Authority Hub (10)
      { source: '/blog/kundali-kaise-dekhein-step-by-step-hindi', destination: '/blog/kundali-kaise-dekhein-step-by-step', permanent: true },
      { source: '/blog/kundali-ke-12-bhav-hindi', destination: '/blog/kundali-ke-12-bhav', permanent: true },
      { source: '/blog/kundali-ke-9-grah-hindi', destination: '/blog/kundali-ke-9-grah', permanent: true },
      { source: '/blog/free-kundli-kitni-sahi-hoti-hai-hindi', destination: '/blog/free-kundli-kitni-sahi-hoti-hai', permanent: true },
      { source: '/blog/kundali-mein-shadbala-grah-bal-hindi', destination: '/blog/kundali-mein-shadbala-grah-bal', permanent: true },
      { source: '/blog/kundali-mein-dhan-yog-hindi', destination: '/blog/kundali-mein-dhan-yog', permanent: true },
      { source: '/blog/kundali-mein-dosh-kaise-dekhein-hindi', destination: '/blog/kundali-mein-dosh-kaise-dekhein', permanent: true },
      { source: '/blog/kundali-mein-vivah-yog-hindi', destination: '/blog/kundali-mein-vivah-yog', permanent: true },
      { source: '/blog/kundali-janm-samay-shuddhata-hindi', destination: '/blog/kundali-janm-samay-shuddhata', permanent: true },
      { source: '/blog/janam-kundali-hindi', destination: '/blog/meri-janam-kundali', permanent: true },

      // Property Learn Hub (10)
      { source: '/blog/property-prediction-astrology-hindi', destination: '/blog/sampatti-bhavishyavani-jyotish', permanent: true },
      { source: '/blog/will-i-own-a-house-hindi', destination: '/blog/kya-mera-ghar-hoga', permanent: true },
      { source: '/blog/best-time-to-buy-property-hindi', destination: '/blog/sampatti-kharidne-ka-sabse-accha-samay', permanent: true },
      { source: '/blog/property-investment-prediction-hindi', destination: '/blog/sampatti-nivesh-bhavishyavani', permanent: true },
      { source: '/blog/multiple-properties-yoga-hindi', destination: '/blog/kai-sampattiyon-ka-yog', permanent: true },
      { source: '/blog/property-dispute-prediction-hindi', destination: '/blog/sampatti-vivad-bhavishyavani', permanent: true },
      { source: '/blog/foreign-property-prediction-hindi', destination: '/blog/videsh-mein-sampatti-bhavishyavani', permanent: true },
      { source: '/blog/renovation-construction-timing-hindi', destination: '/blog/grih-nirman-aur-navinikaran-ka-samay', permanent: true },
      { source: '/blog/land-dispute-resolution-hindi', destination: '/blog/bhoomi-vivad-samadhan', permanent: true },
      { source: '/blog/vehicle-purchase-prediction-hindi', destination: '/blog/vahan-kharid-bhavishyavani', permanent: true },

      // Wealth Learn Hub (1 so far — more will be added as the hub is built)
      { source: '/blog/wealth-prediction-astrology-hindi', destination: '/blog/dhan-bhavishyavani-jyotish', permanent: true },

      // NOTE (5 Sep 2026): the /learn/sibling-prediction-astrology?lang=hi ->
      // /blog/kitne-bhai-bahan-honge-kundali-se redirect lives in middleware.ts
      // now, NOT here — see that file's header comment for why.
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
