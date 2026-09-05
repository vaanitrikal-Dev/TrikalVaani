/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        next.config.js
 * Version:     v1.8 — GSC 404 recovery: 55 legacy root URLs + 9 festival
 *              slug renames (pillar + 10 cities each) reconnected
 * Date:        2026-09-05
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * WHERE THIS FILE GOES: repo root -> next.config.js  (replace existing file)
 *
 * CHANGES vs v1.7 — 5 Sep 2026:
 *   Source of truth: GSC "Not found (404)" drilldown export, 458 URLs,
 *   2026-09-05. Every one of those 458 was re-tested live on 5 Sep 2026.
 *   Result: 232 already return 200 (stale GSC data, just needs Validate Fix),
 *   5 already redirect, 221 were still dead. This release reconnects them.
 *
 *   BLOCK A — 55 legacy root URLs (301).
 *     These are pre-migration URLs Google still holds with accumulated link
 *     equity. The content exists, only the path moved, and no redirect was
 *     ever written. Examples: /sade-sati-calculator moved under
 *     /calculators/free-*, /nakshatra-guide moved under /learn/*,
 *     /kundali-matching became /kundali-milan, /privacy-policy became
 *     /privacy. EVERY destination in this block was curl-verified as 200
 *     on 5 Sep 2026 before being written here — a redirect pointing at a
 *     404 is worse than the original 404 (soft-404 penalty).
 *
 *   BLOCK B — 9 festival slug renames (301), each x 11 URLs
 *     (1 pillar + 10 city variants) = 99 URLs recovered.
 *     Root cause: festivals migrated from app/data/festivals.json to the
 *     Supabase festivals_master table and the slugs were renamed in the
 *     process, with no redirects. Confirmed by querying festivals_master
 *     on 5 Sep 2026. The most expensive one:
 *        karwa-chauth-2026  ->  karva-chauth-2026
 *     "karwa" is the dominant Indian search spelling and it is the slug
 *     Google has indexed. Karwa Chauth 2026 falls on 29 Oct 2026, so this
 *     redirect must be live well before October.
 *     All 9 destinations verified 200, and the 10 city variants of
 *     karva-chauth-2026 verified 200, on 5 Sep 2026.
 *
 *   BLOCK C — 12 festivals that no longer exist anywhere (301 -> /panchang).
 *     akshaya-tritiya, buddha-purnima, mauni-amavasya, tulsi-vivah,
 *     varuthini-ekadashi, ganga-saptami, shravan-somvar, guru-pradosh,
 *     pradosh-vrat, and the generic monthly amavasya/purnima/ekadashi pages
 *     are absent from festivals_master entirely. /panchang is the closest
 *     genuinely relevant live page (/events has no hub page — it 404s).
 *     This is a HOLDING redirect. The real fix is to add these rows back to
 *     festivals_master; when that happens, delete the matching lines here.
 *
 *   BLOCK D — 15 retired /<domain>/panchang routes (301 -> /panchang).
 *
 *   NOT FIXED HERE — deliberately, needs a build not a redirect:
 *     1. /delhi /mumbai /pune /noida /chennai /kolkata /bangalore /hyderabad
 *        /gurgaon /ahmedabad — the 10 city hub pages are IN sitemap.xml but
 *        return 404. Their ~280 child /<city>/events/* pages are live but
 *        orphaned with no parent. Redirecting them would only convert a
 *        "404" error into a "Page with redirect" error while the sitemap
 *        still lists them. They must be BUILT.
 *     2. /events — no hub page exists (404), same reasoning.
 *     3. /hi — the Hindi homepage does not exist, while 410 /hi/* URLs sit
 *        in the sitemap. Awaiting Rohiit's build-or-redirect decision;
 *        intentionally left out of this file.
 * ============================================================================
 * CHANGES vs v1.6 — 5 Sep 2026:
 *   KEPT: the 2 indexed /learn/ 404s redirected to their /blog/ twins
 *      (/learn/saturn-transit-2026, /learn/raksha-bandhan-shubh-muhurat-2026).
 *   KEPT (v1.5): /learn/sibling-prediction-astrology?lang=hi lives in
 *      middleware.ts, NOT here, because redirects() always forwards the
 *      incoming query string. Deploy middleware.ts alongside this file.
 *   KEPT (v1.4): all 21 Hindi-slug-rename redirects.
 *   KEPT (v1.3): /diagrams/ 1-year immutable Cache-Control headers.
 *   KEPT (v1.2): /upcoming-events, /predict, /birth-form, /karmic-reading.
 *   KEPT: eslint.ignoreDuringBuilds, typescript.ignoreBuildErrors,
 *      images.unoptimized
 * ============================================================================
 */
/** @type {import('next').NextConfig} */

// ────────────────────────────────────────────────────────────────────
// The 10 cities that have /<city>/events/<festival> fan-out pages.
// Used to expand each festival rename across every city in one place,
// so a future city addition is a one-word edit.
// ────────────────────────────────────────────────────────────────────
const CITIES = [
  'delhi', 'mumbai', 'pune', 'noida', 'chennai',
  'kolkata', 'bangalore', 'hyderabad', 'gurgaon', 'ahmedabad',
];

// Old indexed festival slug -> current live slug in festivals_master.
// All destinations verified HTTP 200 on 5 Sep 2026.
const FESTIVAL_RENAMES = {
  'karwa-chauth-2026':          'karva-chauth-2026',
  'krishna-janmashtami-2026':   'janmashtami-2026',
  'vijayadashami-2026':         'dussehra-2026',
  'vasant-panchami-2026':       'basant-panchami-2026',
  'jagannath-rath-yatra-2026':  'rath-yatra-2026',
  'dev-uthani-ekadashi-2026':   'devutthana-ekadashi-2026',
  'republic-day-panchang-2026': 'republic-day-2026',
  'shivratri-monthly-2026':     'maha-shivratri-2026',
  'durga-ashtami-2026':         'durga-puja-2026',
};

// Festivals Google has indexed that are absent from festivals_master.
// HOLDING redirect to /panchang until the rows are restored.
const FESTIVALS_RETIRED = [
  'akshaya-tritiya-2026',
  'buddha-purnima-2026',
  'mauni-amavasya-2026',
  'tulsi-vivah-2026',
  'varuthini-ekadashi-2026',
  'ganga-saptami-2026',
  'shravan-somvar-2026',
  'guru-pradosh-2026',
  'pradosh-vrat-2026',
  'amavasya-monthly-2026',
  'purnima-monthly-2026',
  'ekadashi-monthly-2026',
];

// Life-domain prefixes whose /<domain>/panchang child route was retired.
const DOMAINS_WITH_DEAD_PANCHANG = [
  'career', 'business', 'digital-career', 'education', 'family',
  'foreign-settlement', 'health', 'home', 'legal', 'marriage',
  'relationships', 'spirituality', 'travel', 'wealth', 'wellbeing',
];

/** Expand one festival rename into its pillar URL + all 10 city URLs. */
function festivalRenameRedirects() {
  const out = [];
  for (const [oldSlug, newSlug] of Object.entries(FESTIVAL_RENAMES)) {
    out.push({
      source: `/events/${oldSlug}`,
      destination: `/events/${newSlug}`,
      permanent: true,
    });
    for (const city of CITIES) {
      out.push({
        source: `/${city}/events/${oldSlug}`,
        destination: `/${city}/events/${newSlug}`,
        permanent: true,
      });
    }
  }
  return out;
}

/** Retired festivals -> /panchang, pillar + all 10 city URLs. */
function retiredFestivalRedirects() {
  const out = [];
  for (const slug of FESTIVALS_RETIRED) {
    out.push({ source: `/events/${slug}`, destination: '/panchang', permanent: true });
    for (const city of CITIES) {
      out.push({
        source: `/${city}/events/${slug}`,
        destination: '/panchang',
        permanent: true,
      });
    }
  }
  return out;
}

/** Retired /<domain>/panchang routes -> /panchang. */
function domainPanchangRedirects() {
  return DOMAINS_WITH_DEAD_PANCHANG.map((d) => ({
    source: `/${d}/panchang`,
    destination: '/panchang',
    permanent: true,
  }));
}

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
      // ══════════════════════════════════════════════════════════════
      // EXISTING REDIRECTS (v1.2 - v1.7) — UNCHANGED
      // ══════════════════════════════════════════════════════════════
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

      // ── HINDI SLUG RENAME (3 Sep 2026) — Kundali Authority Hub (10) ──
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

      // ── Property Learn Hub (10) ──
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

      // ── Wealth Learn Hub (1) ──
      { source: '/blog/wealth-prediction-astrology-hindi', destination: '/blog/dhan-bhavishyavani-jyotish', permanent: true },

      // NOTE (5 Sep 2026): the /learn/sibling-prediction-astrology?lang=hi ->
      // /blog/kitne-bhai-bahan-honge-kundali-se redirect lives in middleware.ts
      // now, NOT here — see that file's header comment for why.

      // ══════════════════════════════════════════════════════════════
      // v1.8 BLOCK A — 55 legacy root URLs from the GSC 404 export.
      // Every destination curl-verified 200 on 5 Sep 2026.
      // ══════════════════════════════════════════════════════════════
      { source: '/what-is-vedic-astrology', destination: '/learn/what-is-vedic-astrology', permanent: true },
      { source: '/ascendant-lagna', destination: '/learn/ascendant-lagna', permanent: true },
      { source: '/planets-in-astrology', destination: '/learn/planets-in-astrology', permanent: true },
      { source: '/nakshatra-guide', destination: '/learn/nakshatra-guide', permanent: true },
      { source: '/navamsa-chart-guide', destination: '/learn/navamsa-chart-guide', permanent: true },
      { source: '/moon-sign', destination: '/learn/moon-sign', permanent: true },
      { source: '/sade-sati-calculator', destination: '/calculators/free-sade-sati-calculator', permanent: true },
      { source: '/rashi-calculator', destination: '/calculators/free-rashi-calculator', permanent: true },
      { source: '/nakshatra-calculator', destination: '/calculators/free-nakshatra-calculator', permanent: true },
      { source: '/lagna-calculator', destination: '/calculators/free-lagna-calculator', permanent: true },
      { source: '/dasha-calculator', destination: '/calculators/free-dasha-calculator', permanent: true },
      { source: '/manglik-dosh-calculator', destination: '/calculators/free-manglik-dosh-calculator', permanent: true },
      { source: '/free-child-birth-muhurat-calculator', destination: '/calculators/free-child-birth-muhurat-calculator', permanent: true },
      { source: '/child-birth-muhurat', destination: '/calculators/free-child-birth-muhurat-calculator', permanent: true },
      { source: '/kundali-matching', destination: '/kundali-milan', permanent: true },
      { source: '/compatibility', destination: '/kundali-milan', permanent: true },
      { source: '/about', destination: '/founder', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/refund-policy', destination: '/refund', permanent: true },
      { source: '/astrologer-gurugram', destination: '/astrologer-gurgaon', permanent: true },
      { source: '/astrologer-chennai', destination: '/services', permanent: true },
      { source: '/astrologer-ahmedabad', destination: '/services', permanent: true },
      { source: '/astrologer-faridabad', destination: '/astrologer-delhi', permanent: true },
      { source: '/career-prediction-astrology', destination: '/career', permanent: true },
      { source: '/promotion-prediction-astrology', destination: '/career', permanent: true },
      { source: '/best-career-birth-chart', destination: '/career', permanent: true },
      { source: '/private-job-vs-business-prediction', destination: '/career', permanent: true },
      { source: '/digital-career', destination: '/career', permanent: true },
      { source: '/business-success-prediction', destination: '/business', permanent: true },
      { source: '/health-prediction-astrology', destination: '/health', permanent: true },
      { source: '/family-life-prediction-astrology', destination: '/family', permanent: true },
      { source: '/number-of-children-prediction', destination: '/family', permanent: true },
      { source: '/child-birth-prediction', destination: '/family', permanent: true },
      { source: '/second-marriage-possibility', destination: '/marriage', permanent: true },
      { source: '/legal-case-prediction', destination: '/legal', permanent: true },
      { source: '/land-dispute-resolution', destination: '/legal', permanent: true },
      { source: '/dhan-yoga', destination: '/wealth', permanent: true },
      { source: '/dhan-yoga-analysis', destination: '/wealth', permanent: true },
      { source: '/millionaire-yoga-prediction', destination: '/wealth', permanent: true },
      { source: '/sudden-wealth-prediction', destination: '/wealth', permanent: true },
      { source: '/wealth-growth-timing', destination: '/wealth', permanent: true },
      { source: '/financial-loss-prediction', destination: '/wealth', permanent: true },
      { source: '/investment-success-prediction', destination: '/wealth', permanent: true },
      { source: '/property-prediction-astrology', destination: '/home', permanent: true },
      { source: '/property-investment-prediction', destination: '/home', permanent: true },
      { source: '/real-estate-success-prediction', destination: '/home', permanent: true },
      { source: '/best-time-to-buy-property', destination: '/home', permanent: true },
      { source: '/saturn-transit-2026', destination: '/blog/saturn-transit-2026', permanent: true },
      { source: '/navratri-astrology-2026', destination: '/events/sharad-navratri-2026', permanent: true },
      { source: '/guru-purnima-astrology', destination: '/events/guru-purnima-2026', permanent: true },
      { source: '/amavasya-significance-astrology', destination: '/panchang', permanent: true },
      { source: '/report', destination: '/pricing', permanent: true },
      { source: '/blog/rahu-ketu-axis-2026-karmic-shift', destination: '/blog', permanent: true },
      { source: '/blog/shani-gochar-2026-saturn-transit', destination: '/blog/saturn-transit-2026', permanent: true },
      { source: '/learn/raksha-bandhan-swapna-shastra', destination: '/swapna', permanent: true },

      // ══════════════════════════════════════════════════════════════
      // v1.8 BLOCK B — festival slug renames (99 URLs). See header.
      // ══════════════════════════════════════════════════════════════
      ...festivalRenameRedirects(),

      // ══════════════════════════════════════════════════════════════
      // v1.8 BLOCK C — festivals missing from festivals_master (132 URLs).
      // HOLDING redirect. Delete a line once its row is restored.
      // ══════════════════════════════════════════════════════════════
      ...retiredFestivalRedirects(),

      // ══════════════════════════════════════════════════════════════
      // v1.8 BLOCK D — retired /<domain>/panchang routes (15 URLs).
      // ══════════════════════════════════════════════════════════════
      ...domainPanchangRedirects(),
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
