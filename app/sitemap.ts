/* ═══════════════════════════════════════════════════════════════════════════
   LASTMOD FIX, PART 2 — 26 September 2026 (v9.4)

   WHAT WAS STILL WRONG (live sitemap, 26 Sep 2026, 5,641 URLs)
     Part 1 (06 Sep) fixed blog / learn / compatibility / report. The other
     3,676 URLs — 65% of the file — still carried `lastModified: now`:
       city event pages + city hubs   2,973
       /events/ national              288
       /hi/ festival pages            266
       /panchang/<date>               98
       calculators 39, services 9, static routes, local, vivah, swapna, domains
     So on every fetch two out of three URLs still said "changed this second",
     and Google keeps discounting the whole field — including the honest blog
     dates the nightly content run depends on.

   WHAT THIS CHANGES — every URL now gets a lastmod it can defend:
     • DB-driven pages → the row's own updated_at:
         festivals (national, Hindi, every city copy) = latest of
           festivals_master.updated_at, festival_content.updated_at (en + hi)
           and the festival template's last code change
         domain pillars = domain_pages.updated_at
         /panchang/<date> = panchang_daily.updated_at for that date
         /swapna/<symbol>, /swapna/category/<c> = dream_symbols.updated_at
         /vivah-muhurat/<year> = latest of muhurat_windows.created_at for that
           year and the page's last code change
         today's /rashifal = daily_rashifal_cache.generated_at for today
     • Hub pages → the newest child: /blog, /learn, /swapna, /calculators,
       /services.
     • Code-only pages (calculators, services, static, /astrologer-*) → the
       date of the page's last git commit, held in CODE_LASTMOD below.
     • Pages whose content really changes every day (home, /panchang hub,
       the 10 city hubs and /<city>/panchang) → 00:00 IST today. That date
       is stable for the whole day, so repeated fetches no longer disagree.
     • No row date available → the code date, never `now`.

   MAINTENANCE RULE (one line, for whoever edits a code page next):
     When you change app/calculators/<x>, app/services/<x>, a static page or
     the festival template, set its date in CODE_LASTMOD to the commit date.
     A path missing from the map falls back to CODE_LASTMOD_DEFAULT.
     Adding a new calculator: add it to CALCULATORS AND to CODE_LASTMOD.

   NEXT STEP AFTER DEPLOY
     Search Console → Sitemaps → submit sitemap.xml again (no need to remove).
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   LASTMOD FIX — 06 September 2026

   WHAT WAS WRONG
     Every URL in this sitemap carried `lastModified: now` — the moment the
     sitemap was generated. Live output, 06 Sep 2026:

       <loc>https://trikalvaani.com</loc>
       <lastmod>2026-09-06T12:59:23.126Z</lastmod>
       <loc>https://trikalvaani.com/pricing</loc>
       <lastmod>2026-09-06T12:59:23.126Z</lastmod>   <-- the same second

     22 of the 24 lastModified lines in this file used `now`; only the report
     loop used a real timestamp. So on every fetch, all ~5,300 URLs claimed to
     have changed simultaneously.

   WHY THAT IS WORSE THAN NO LASTMOD AT ALL
     Google only uses lastmod when it is consistently accurate. A sitemap that
     says everything changed just now, every time, teaches the crawler to
     ignore the field completely — which means the handful of pages that DID
     genuinely change get no signal at all. They are buried under thousands of
     false ones. This is a large part of why so much of the site is crawled
     rarely.

   WHAT THIS CHANGES
     The two biggest DB-driven groups now emit their real `updated_at`:
       /learn/<slug>          133 rows, seo_pillar_pages
       /compatibility/<slug>  288 rows, compatibility_pages
     Both tables already have an updated_at column — it simply was never
     selected. The pattern copies the report loop, which was already correct:
       lastModified: row.updatedAt ? new Date(row.updatedAt) : now

     /blog/<slug> was ALREADY correct (post.updatedAt) and is untouched.

   WHAT STILL USES `now`, AND WHY THAT IS FINE
     Genuinely dated or daily pages — /panchang/<date>, /rashifal/<today>,
     vivah-muhurat years, city pages — plus the static routes. Those are
     either regenerated daily or change rarely enough that `now` does no harm
     once the bulk of the sitemap is honest.

   NEXT STEP AFTER DEPLOY
     Search Console -> Sitemaps -> remove sitemap.xml, then add it again.
     That forces a full re-read rather than an incremental one.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/sitemap.ts
 * Version:     v9.4 — honest lastmod for every URL, part 2 (26 Sep 2026)
 * Version:     v9.3 — free-shubh-muhurat-calculator juda (23 Sep 2026)
 * Version:     v9.2 — free-life-span-calculator juda (22 Sep 2026)
 * Version:     v9.1 — free-love-or-arranged-marriage-calculator juda (22 Sep 2026)
 * Version:     v9.0 — free-health-prediction-calculator juda (22 Sep 2026)
 * Version:     v8.9 — free-second-marriage-calculator juda (21 Sep 2026)
 *
 * Changes v8.7 -> v8.8 (2026-09-03):
 *   1. VIVAH YOG CALCULATOR added to CALCULATORS. Count 32 -> 33.
 *      Added BY HAND, for the reason the v8.2 note gives and every note since
 *      repeats: static routes are NOT auto-discovered in this file. Without
 *      this line the page would never enter the sitemap, however many times
 *      the site is deployed. Fifth yog calculator, same shape as the other
 *      four — the page is fully crawlable, the paywall sits on the API
 *      response and not on the page.
 *      The slug is free-shadi-kab-hogi-calculator, which does NOT match the
 *      page's own title ("Vivah Yog Calculator"). That is deliberate and is
 *      explained in the page header: the slug carries the most-asked question
 *      in Radar's marriage set, the title keeps the phrase this site already
 *      ranks for in GSC (marriage yoga in kundali, position 9.93, with no
 *      tool behind it). Do not "fix" the mismatch.
 *      CANNIBALISATION NOTE: /learn/why-is-my-marriage-delayed earns 173
 *      impressions at position 6.75. The calculator deliberately does not
 *      chase that phrase in its title or metadata — the two target different
 *      intent and support each other.
 *   2. No other logic, loop, query, priority or de-dupe behaviour changed.
 *      Built on the deployed v8.7 source.
 *
 * Version (previous): v8.7
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * Changes v8.6 -> v8.7 (2026-09-02):
 *   1. SANTAN YOG CALCULATOR added to CALCULATORS. Count 31 -> 32.
 *      Added BY HAND for the reason the v8.2 note gives and the v8.3 note
 *      repeats: static routes are NOT auto-discovered in this file. Without
 *      this line the page would never enter the sitemap, however many times
 *      the site is deployed. It is the fourth yog calculator and behaves
 *      exactly like the other three — the page is fully crawlable, the
 *      paywall sits on the API response, not on the page.
 *      Verified before adding, not assumed: the page returns HTTP 200 and
 *      renders (144 KB), and POST /api/calc/yog with type "santan" returns
 *      200 with a real D-7 score.
 *      WHY IT MATTERS HERE MORE THAN USUAL: Radar (30 Aug 2026) ranked Santan
 *      Yog the number one calculator to build, and /learn/number-of-children-
 *      prediction already earns 3,815 impressions and 155 clicks at position
 *      5.23 with no tool behind it. The two pages target different intent —
 *      that learn page owns the English "how many children" phrasing, the
 *      calculator owns the tool phrasing — so they support each other rather
 *      than compete.
 *   2. No other logic, loop, query, priority or de-dupe behaviour changed.
 *      Built on the deployed v8.6 source.
 *
 * Changes v8.5 -> v8.6 (2026-08-31):
 *   1. DAILY RASHIFAL ADDED — it was absent from the sitemap entirely, the
 *      same gap /services/ had. /rashifal is linked from 3 published blog
 *      posts and /rashifal/<date> returns HTTP 200, so Google has been
 *      finding it by internal link alone.
 *      WHAT IS EMITTED, and the reasoning, because this one needed a
 *      judgement call rather than a loop:
 *        • ONLY TODAY'S DATED PAGE, /rashifal/<today>. That URL is the
 *          canonical (verified: it self-canonicalises), it returns 200, and
 *          because this file revalidates hourly the entry rolls forward on
 *          its own. No cron, no seeding, no maintenance.
 *        • NOT the bare /rashifal hub. It 307-redirects to today's dated
 *          page, and a redirecting URL in a sitemap is reported in Search
 *          Console as "Page with redirect" — a soft error that helps nobody.
 *          Google still reaches the hub through the 3 internal links.
 *        • NOT the 83 past dates sitting in daily_rashifal_cache. A daily
 *          horoscope is stale the morning after; 83 near-identical thin
 *          pages would spend crawl budget to rank for nothing. Radar's whole
 *          finding was about crawl efficiency, and this would work against it.
 *        • NOT future dates either. /rashifal/2026-09-15 does return 200, but
 *          the content is generated on demand and does not meaningfully exist
 *          yet, so submitting it would be submitting an empty page.
 *      Deliberate contrast with the Panchang block below, which DOES emit
 *      today + 365: panchang_daily is pre-seeded and future panchang is
 *      genuinely useful for muhurat planning. Rashifal is the opposite —
 *      only today has any value. Same site, opposite correct answer.
 *   2. No other logic, loop, query, priority or de-dupe behaviour changed.
 *      Built on the deployed v8.5 source.
 *
 * Changes v8.4 -> v8.5 (2026-08-31):
 *   1. PAID SERVICE PAGES ADDED — they were never in the sitemap at all.
 *      Audit on 31 Aug 2026 of the live sitemap (5,074 <loc> entries) found
 *      ZERO URLs under /services/. Meanwhile all eight service pages return
 *      HTTP 200 and are linked from 99 published blog posts via cta_href:
 *        ex-back-reading 23 · career-pivot 20 · wealth-reading 17
 *        toxic-boss-radar 14 · child-destiny 11 · property-yog 8
 *        compatibility 3 · spiritual-purpose 3
 *      So these are the Rs 51 conversion pages — the only pages on the site
 *      that take money — and Google has been finding them by crawling
 *      internal links alone, never from the sitemap. Radar (30 Aug) shows
 *      "property yog in kundli" stuck at rank 11; this is one plausible
 *      contributor, though not proven to be the cause.
 *      This is the exact failure mode the v8.2 note warned about: static
 *      routes are NOT auto-discovered here. /services (the hub) sat in
 *      STATIC_ROUTES since v5.x, but no loop ever emitted its children.
 *      Fix: new SERVICE_ROUTES array + its own emit loop, mirroring
 *      LOCAL_ROUTES exactly.
 *      Honest scope note: being absent from a sitemap does not stop a page
 *      being indexed when it is internally linked, and sitemap `priority` is
 *      largely ignored by Google. So treat this as closing a real discovery
 *      and crawl-scheduling gap, not as a guaranteed ranking fix.
 *   2. No other logic, loop, query, priority or de-dupe behaviour changed.
 *      Built directly on the deployed v8.4 source, not on any earlier draft.
 *
 * Changes v8.3 -> v8.4 (2026-08-30):
 *   1. BLOG URLS RESTORED (this is the big one).
 *      The live sitemap carried 612 /blog/ URLs at 10:00 UTC and ZERO at
 *      13:21 UTC on the same day, from the same code. Intermittent, not
 *      constant — which rules out bad credentials and points at load.
 *      getAllPosts() does select('*') on blog_posts: 546 rows, ~5.9 MB, the
 *      `sections` JSONB alone being 3.4 MB, then regex-parses every row. That
 *      runs inside this one function, which already fires ~10 other Supabase
 *      queries. When it times out getAllPosts does NOT throw — it logs and
 *      returns [] — so the catch below never fired and 546 URLs vanished in
 *      complete silence for weeks.
 *      Fix: call getPostsForSitemap() from lib/blog-posts.ts v3.6, which pulls
 *      4 narrow columns (~50 KB, ~120x smaller), uses the ANON key like every
 *      other loop in this file, paginates with .range(), and RETURNS ITS ERROR
 *      so a failure can never be silent again. REQUIRES lib/blog-posts.ts
 *      v3.6+ to be deployed — v8.3 of this file plus v3.5 of that one will not
 *      build.
 *   2. DUPLICATE URLS REMOVED.
 *      The 30 Aug sitemap held 5,611 <loc> entries but only 4,987 unique ones
 *      — 624 duplicates, e.g. /hi/delhi/navratri-day-4-kushmanda-kab-hai
 *      emitted by both the Hindi loop and the city loop. Duplicate <loc>
 *      entries waste crawl budget. A single de-dupe pass now runs before
 *      return, keeping the FIRST occurrence of each URL.
 *
 * Changes v8.2 -> v8.3 (2026-08-29):
 *   THREE YOG CALCULATORS added to CALCULATORS: IAS astrology, foreign
 *   settlement and foreign spouse. Count 28 -> 31.
 *   Added by hand because, as the v8.2 note warns, static routes are NOT
 *   auto-discovered here — only the DB-driven ones are. Without this edit the
 *   three pages would never have entered the sitemap no matter how often the
 *   site was deployed.
 *   Search Console already shows demand landing on /learn/ pages for these
 *   exact queries ("ias astrology calculator", "foreign settlement
 *   astrology", "foreign spouse calculator") with no tool behind them until
 *   now, so getting them indexed is the point of the whole build.
 *
 * Changes v8.1 → v8.2 (2026-07-12):
 *   LOCAL SEO RESTORED. /astrologer-{city} pages are RE-ADDED, reversing the
 *   v5.6 removal made under IR-20. IR-20 ("global not local") was SUPERSEDED by
 *   CEO order in July 2026 after the Google Business Profile was approved
 *   (Trikaal Vaani — Astrologer in Delhi, Dwarka 110075).
 *   New LOCAL_ROUTES array + its own emit loop. Delhi is the flagship (0.9);
 *   Noida/Gurgaon/Ghaziabad are satellites (0.8). Weekly changeFrequency.
 *   NOTE: static routes are NOT auto-discovered — only DB-driven routes (blog,
 *   swapna, learn, compatibility) are. Any new static page MUST be listed here
 *   or it will never appear in the sitemap, no matter how many times we deploy.
 *   Requires: app/astrologer-{city}/page.tsx to exist for each listed slug.
 *
 * Changes v8.0 → v8.1 (2026-07-09):
 *   BILINGUAL BLOG hreflang. Blog loop now emits per-post alternate
 *   hreflang pairs from post.lang + post.altLangSlug, so Google treats the
 *   EN and HI versions as language alternates of each other. Posts without a
 *   translation (altLangSlug = null) emit exactly as before. Requires
 *   lib/blog-posts.ts v3.3 (BlogPost.lang + BlogPost.altLangSlug).
 *
 * Changes v7.9 → v8.0 (2026-07-03):
 *   SWAPNA SPOKES — PERMANENT AUTO. readDreamSymbols() queries DISTINCT
 *   symbol_key + category from dream_symbols; emits /swapna/{symbol} (0.8,
 *   weekly) and /swapna/category/{category} (0.75, weekly). Any symbol ever
 *   added to the table is auto-indexed — zero manual sitemap edits.
 *
 * Changes v7.8 → v7.9 (2026-07-03):
 *   SWAPNA SHASTRA added to STATIC_ROUTES (/swapna). Free Vedic dream-decoding
 *   hub with ₹51 personal reading — emitted at priority 0.9, weekly. No other
 *   logic changed.
 *
 * Changes v7.7 → v7.8 (2026-06-28):
 *   AI HAST REKHA CALCULATOR added to STATIC_ROUTES (/hast-rekha-calculator).
 *   Paid ₹51 palm-reading tool — emitted at priority 0.85, weekly. No other
 *   logic changed.
 *
 * Changes v7.6 → v7.7 (2026-06-27):
 *   VIVAH MUHURAT now PERMANENT-AUTO. readVivahYears() returns a ROLLING range
 *   (2026 .. current year + 6) UNION any DISTINCT years still present in
 *   muhurat_windows. The VM engine auto-computes forbidden windows for any
 *   year, so future-year pages (2029, 2030, 2031 …) are emitted to the sitemap
 *   WITHOUT needing a seeded DB row. Hand-validated years (2026/27/28) keep
 *   their DB override on the page. Zero manual sitemap edits ever again.
 *
 * Changes v7.5 → v7.6 (2026-06-25):
 *   VIVAH MUHURAT (year-dynamic) added. readVivahYears() queried DISTINCT years
 *   from muhurat_windows; emitted /vivah-muhurat + /vivah-muhurat/{year}.
 *
 * Changes v7.4 → v7.5 (2026-06-20):
 *   CONTENT CLUSTERS CONFIRMED — NO CODE CHANGE REQUIRED:
 *   All new /learn/[slug] pages are auto-picked up by readSeoLearnSlugs()
 *   which queries seo_pillar_pages WHERE published = true.
 *
 * Changes v7.3 → v7.4 (2026-06-19):
 *   FESTIVAL 404 FIX: festival loop emits URLs ONLY for is_indexed=true.
 *
 * Changes v7.2 → v7.3 (2026-06-16):
 *   GEMSTONE: Added Gemstone Suitability ecosystem (10 URLs). Calc total 18→28.
 *
 * Changes v7.1 → v7.2 (2026-06-14):
 *   WIN 1: Compatibility Hindi clean /hi/compatibility/[slug] URLs.
 *   WIN 3: Panchang future dates only (today + 365 days).
 *
 * ── Earlier history (unchanged) ─────────────────────────────────────────────
 *   v8.2 (2026-08-28):
 *     - Hindi festival URLs (/hi/[slug], /hi/[city]/[slug]) with hreflang,
 *       read from festival_content. They went live that morning and the
 *       sitemap did not know they existed.
 *     - Compatibility now emits hreflang pairs, which it never had. The
 *       /hi/compatibility/[pair] route it has advertised since June was built
 *       the same day; until then all 144 of those URLs returned 404.
 *   v7.1: festivals live from festivals_master + city fan-out.
 *   v7.0: /learn hub + 90 /learn/[slug] SEO pages from seo_pillar_pages.
 *   v6.0: 10 new free calculators added (18 total).
 *   v5.9: DYNAMIC domains, panchang, public reports.
 *   v5.8: 'free-child-birth-muhurat-calculator' added.
 *   v5.7: /kundali-milan + /karmic-background-reading added.
 *   v5.6: REMOVED /astrologer-{city} entries (IR-20).
 *   v5.5: /compatibility/* programmatic SEO pages.
 *   v5.4: calculators hub + 7 calc pages.
 * ============================================================================
 */

import type { MetadataRoute } from 'next';
import { getPostsForSitemap } from '@/lib/blog-posts';
import { createClient } from '@supabase/supabase-js';
import citiesData from './data/cities.json';
import festivalsData from './data/festivals.json';

const BASE = 'https://trikalvaani.com';

export const revalidate = 3600;

const VIVAH_START = 2026;

const STATIC_ROUTES = [
  '',
  '/voice-pricing',
  '/pricing',
  '/founder',
  '/contact',
  '/privacy',
  '/terms',
  '/refund',
  '/blog',
  '/services',
  '/calculators',
  '/hast-rekha-calculator',
  '/swapna',
  '/panchang',
  '/kundali-milan',
  '/karmic-background-reading',
];

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL SEO (v8.2) — /astrologer-{city} landing pages.
// Reverses the v5.6 removal (IR-20). Local SEO is now permitted and encouraged
// following Google Business Profile approval (July 2026).
//
// NAP for every one of these pages is the SAME single verified address —
// 724, Pocket 3, Sector 19, Dwarka, New Delhi 110075 — with the other cities
// covered via schema `areaServed`. We deliberately do NOT invent a local street
// address per city: fabricated NAPs are the fastest way to lose local ranking.
//
// Adding a city here WITHOUT creating app/astrologer-{city}/page.tsx will emit
// a 404 into the sitemap. Create the page first, then add the slug.
// ─────────────────────────────────────────────────────────────────────────────
const LOCAL_ROUTES = [
  '/astrologer-delhi',
  '/astrologer-noida',
  '/astrologer-gurgaon',
  '/astrologer-ghaziabad',
];

// ─────────────────────────────────────────────────────────────────────────────
// PAID SERVICE PAGES (v8.5) — /services/{slug}.
//
// These are the Rs 51 conversion pages. Until 31 Aug 2026 not one of them was
// in the sitemap: /services (the hub) has been in STATIC_ROUTES since v5.x,
// but nothing ever emitted its children. All eight verified HTTP 200 on
// 31 Aug 2026 and are the cta_href target of 99 published blog posts, so they
// were being discovered by internal links alone.
//
// This list is HAND-MAINTAINED, exactly like LOCAL_ROUTES and CALCULATORS.
// There is no `services` table in Supabase to read from (checked 31 Aug 2026),
// so it cannot be made auto like blog / learn / swapna / compatibility are.
//
// RULE, same as LOCAL_ROUTES: create app/services/{slug}/page.tsx FIRST, then
// add the slug here. Adding a slug with no page emits a 404 into the sitemap,
// which is worse than the page being missing.
//
// Do NOT try to generate this list from blog_posts.cta_href — a typo in one
// blog row would silently push a 404 into the sitemap, and CTA data is not a
// route registry.
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_ROUTES = [
  'career-pivot',
  'child-destiny',
  'compatibility',
  'ex-back-reading',
  'property-yog',
  'spiritual-purpose',
  'toxic-boss-radar',
  'wealth-reading',
];

const CALCULATORS = [
  'free-janam-kundali-calculator',
  'free-child-birth-muhurat-calculator',
  'free-dasha-calculator',
  'free-nakshatra-calculator',
  'free-rashi-calculator',
  'free-lagna-calculator',
  'free-sade-sati-calculator',
  'free-manglik-dosh-calculator',
  'free-kaal-sarp-dosh-calculator',
  'free-pitra-dosh-calculator',
  'free-gemstone-calculator',
  // ── Gemstone Suitability ecosystem (v7.3) ──
  'free-gemstone-suitability-calculator',
  'free-should-i-wear-neelam',
  'free-should-i-wear-cats-eye',
  'free-should-i-wear-pukhraj',
  'free-should-i-wear-gomed',
  'free-should-i-wear-moonga',
  'free-should-i-wear-panna',
  'free-should-i-wear-moti',
  'free-should-i-wear-manik',
  'free-should-i-wear-heera',
  // ────────────────────────────────────────────
  'free-numerology-calculator',
  'free-baby-name-by-nakshatra',
  'free-lucky-day-calculator',
  'free-weak-planet-finder',
  'free-graha-bal-calculator',
  'free-kundali-strength-calculator',
  'free-lagna-bal-calculator',
  // ── Yog calculators (v8.3) ──
  // Free score with reasoning; the full report is paid (Rs 51 / $7). The page
  // itself is fully crawlable — the paywall sits on the API response, not on
  // the page — so these belong in the sitemap exactly like the others.
  'free-ias-astrology-calculator',
  'free-foreign-settlement-calculator',
  'free-foreign-spouse-calculator',
  // ── Santan Yog (v8.7) ──
  'free-santan-yog-calculator',
  // ── Vivah Yog / "Shadi kab hogi" (v8.8) ──
  'free-shadi-kab-hogi-calculator',
  // ── Second Marriage / Doosra Vivah (v8.9 — 21 Sep 2026) ──
  'free-second-marriage-calculator',
  'free-health-prediction-calculator',
  'free-love-or-arranged-marriage-calculator',
  'free-life-span-calculator',
  // ── Shubh Muhurat (v9.3 — 23 Sep 2026) ──
  'free-shubh-muhurat-calculator',
];

const DOMAINS_FALLBACK = [
  'career', 'wealth', 'health', 'relationships', 'family',
  'education', 'home', 'legal', 'travel', 'spirituality',
  'wellbeing', 'marriage', 'business', 'foreign-settlement', 'digital-career',
];

// ─────────────────────────────────────────────────────────────────────────────
// v9.4 — CODE_LASTMOD: last git commit date (YYYY-MM-DD) of each page that is
// built from code, not from a Supabase row. Read from `git log -1 --format=%cs`
// on 26 Sep 2026. Update the date when you change that page (see header).
// ─────────────────────────────────────────────────────────────────────────────
const CODE_LASTMOD_DEFAULT = '2026-09-26';
const CODE_LASTMOD: Record<string, string> = {
  // static routes
  '/voice-pricing': '2026-09-12',
  '/pricing': '2026-09-12',
  '/founder': '2026-09-12',
  '/contact': '2026-09-12',
  '/privacy': '2026-09-12',
  '/terms': '2026-09-12',
  '/refund': '2026-09-12',
  '/services': '2026-09-08',
  '/calculators': '2026-09-23',
  '/hast-rekha-calculator': '2026-09-12',
  '/kundali-milan': '2026-09-12',
  '/karmic-background-reading': '2026-09-12',
  '/blog': '2026-09-12',
  '/learn': '2026-09-12',
  '/swapna': '2026-09-12',
  '/swapna/[symbol]': '2026-09-08',
  '/swapna/category': '2026-07-04',
  '/panchang/[date]': '2026-09-05',
  '/rashifal': '2026-09-12',
  '/vivah-muhurat': '2026-06-27',
  '/vivah-muhurat/[year]': '2026-09-24',
  '/[domain]': '2026-09-05',
  // festival template (components/festival/FestivalPillar.tsx) — shared by
  // /events/, /hi/ and every city copy, so a template change is a real change
  'festival-template': '2026-09-26',
  // local SEO
  '/astrologer-delhi': '2026-09-12',
  '/astrologer-noida': '2026-09-12',
  '/astrologer-gurgaon': '2026-09-12',
  '/astrologer-ghaziabad': '2026-09-12',
  // services
  '/services/career-pivot': '2026-09-08',
  '/services/child-destiny': '2026-09-08',
  '/services/compatibility': '2026-09-12',
  '/services/ex-back-reading': '2026-09-08',
  '/services/property-yog': '2026-09-08',
  '/services/spiritual-purpose': '2026-09-08',
  '/services/toxic-boss-radar': '2026-09-08',
  '/services/wealth-reading': '2026-09-12',
  // calculators
  '/calculators/free-janam-kundali-calculator': '2026-09-08',
  '/calculators/free-child-birth-muhurat-calculator': '2026-09-08',
  '/calculators/free-dasha-calculator': '2026-09-12',
  '/calculators/free-nakshatra-calculator': '2026-09-12',
  '/calculators/free-rashi-calculator': '2026-09-08',
  '/calculators/free-lagna-calculator': '2026-09-08',
  '/calculators/free-sade-sati-calculator': '2026-09-12',
  '/calculators/free-manglik-dosh-calculator': '2026-09-21',
  '/calculators/free-kaal-sarp-dosh-calculator': '2026-09-12',
  '/calculators/free-pitra-dosh-calculator': '2026-09-12',
  '/calculators/free-gemstone-calculator': '2026-09-21',
  '/calculators/free-gemstone-suitability-calculator': '2026-09-08',
  '/calculators/free-should-i-wear-neelam': '2026-09-21',
  '/calculators/free-should-i-wear-cats-eye': '2026-09-05',
  '/calculators/free-should-i-wear-pukhraj': '2026-09-21',
  '/calculators/free-should-i-wear-gomed': '2026-09-05',
  '/calculators/free-should-i-wear-moonga': '2026-09-21',
  '/calculators/free-should-i-wear-panna': '2026-09-21',
  '/calculators/free-should-i-wear-moti': '2026-09-21',
  '/calculators/free-should-i-wear-manik': '2026-09-21',
  '/calculators/free-should-i-wear-heera': '2026-09-21',
  '/calculators/free-numerology-calculator': '2026-09-08',
  '/calculators/free-baby-name-by-nakshatra': '2026-09-08',
  '/calculators/free-lucky-day-calculator': '2026-09-08',
  '/calculators/free-weak-planet-finder': '2026-09-08',
  '/calculators/free-graha-bal-calculator': '2026-09-08',
  '/calculators/free-kundali-strength-calculator': '2026-09-08',
  '/calculators/free-lagna-bal-calculator': '2026-09-08',
  '/calculators/free-ias-astrology-calculator': '2026-09-12',
  '/calculators/free-foreign-settlement-calculator': '2026-09-08',
  '/calculators/free-foreign-spouse-calculator': '2026-09-05',
  '/calculators/free-santan-yog-calculator': '2026-09-08',
  '/calculators/free-shadi-kab-hogi-calculator': '2026-09-08',
  '/calculators/free-second-marriage-calculator': '2026-09-21',
  '/calculators/free-health-prediction-calculator': '2026-09-22',
  '/calculators/free-love-or-arranged-marriage-calculator': '2026-09-22',
  '/calculators/free-life-span-calculator': '2026-09-22',
  '/calculators/free-shubh-muhurat-calculator': '2026-09-24',
};

function codeMod(key: string): Date {
  return new Date(`${CODE_LASTMOD[key] ?? CODE_LASTMOD_DEFAULT}T00:00:00.000Z`);
}

/** Newest valid date among the arguments; null if none is valid. */
function latest(...vals: (Date | string | null | undefined)[]): Date | null {
  let best: Date | null = null;
  for (const v of vals) {
    if (!v) continue;
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) continue;
    if (!best || d > best) best = d;
  }
  return best;
}

/** 00:00 IST today, as a Date. Stable for the whole IST day — used only for
 *  pages whose content genuinely changes every day. */
function istDayStart(): Date {
  const IST_MS = 330 * 60 * 1000;
  const ist = new Date(Date.now() + IST_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_MS);
}

type CityRow = { slug: string; state: string };
type FestivalRow = { slug: string; date?: string };

type DbFestivalRow = {
  festival_slug: string;
  date: string;
  festival_scope: string | null;
  home_states: string[] | null;
  is_indexed: boolean | null;
  updated_at?: string | null;
};

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function readCities(): CityRow[] {
  try {
    const arr = (citiesData as { cities?: CityRow[] }).cities;
    return Array.isArray(arr) ? arr.filter((c) => typeof c.slug === 'string') : [];
  } catch {
    return [];
  }
}

function readFestivals(): FestivalRow[] {
  try {
    const arr = (festivalsData as { festivals?: FestivalRow[] }).festivals;
    return Array.isArray(arr) ? arr.filter((f) => typeof f.slug === 'string') : [];
  } catch {
    return [];
  }
}

async function readFestivalsFromDB(): Promise<DbFestivalRow[]> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('festivals_master')
      .select('festival_slug, date, festival_scope, home_states, is_indexed, updated_at');
    if (error || !data || data.length === 0) return [];
    return (data as DbFestivalRow[]).filter((r) => typeof r.festival_slug === 'string');
  } catch {
    return [];
  }
}

/**
 * The Hindi slug for each festival, from festival_content.
 *
 * Added 28 Aug 2026. The Hindi festival routes went live that day and the
 * sitemap did not know they existed — it handled /hi/compatibility/ and
 * nothing else, so every Hindi festival page was invisible to Google from the
 * moment it was published.
 *
 * English slugs carry the year (ganesh-chaturthi-2026); Hindi slugs are
 * authority slugs with no year (ganesh-chaturthi-kab-hai), so the two cannot
 * be derived from each other and the pairing is read from the table.
 */
type HiSlugRow = { base_slug: string; page_slug: string };

async function readHindiFestivalSlugs(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('festival_content')
      .select('base_slug, page_slug')
      .eq('lang', 'hi')
      .eq('is_published', true);
    if (error || !data) return out;
    for (const r of data as HiSlugRow[]) {
      if (r.base_slug && r.page_slug) out.set(r.base_slug, r.page_slug);
    }
  } catch {
    /* sitemap must still build */
  }
  return out;
}

/** v9.4 — newest festival_content.updated_at per base_slug (en + hi rows). */
async function readFestivalContentDates(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('festival_content')
      .select('base_slug, updated_at')
      .eq('is_published', true);
    if (error || !data) return out;
    for (const r of data as { base_slug: string; updated_at: string | null }[]) {
      if (!r.base_slug || !r.updated_at) continue;
      const prev = out.get(r.base_slug);
      if (!prev || r.updated_at > prev) out.set(r.base_slug, r.updated_at);
    }
  } catch {
    /* sitemap must still build */
  }
  return out;
}

const baseSlugOf = (s: string) => s.replace(/-20\d\d$/, '');

function festivalInState(scope: string | null, homeStates: string[] | null, state: string): boolean {
  if (scope === 'regional' && Array.isArray(homeStates) && homeStates.length > 0) {
    return homeStates.includes(state);
  }
  return true;
}

async function readCompatibilitySlugs(): Promise<{ slug: string; lang: string; updated_at?: string | null }[]> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('compatibility_pages')
      // v-fix 06 Sep 2026: updated_at added so the 288 compatibility URLs can
      // carry a real lastmod instead of `now`. The column already existed.
      .select('slug, lang, updated_at');
    if (error || !data) return [];
    return data as { slug: string; lang: string; updated_at?: string | null }[];
  } catch {
    return [];
  }
}

async function readDomainSlugs(): Promise<{ slug: string; updatedAt: string | null }[]> {
  const fallback = DOMAINS_FALLBACK.map((slug) => ({ slug, updatedAt: null }));
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('domain_pages')
      // v9.4: updated_at added for a real lastmod
      .select('slug, updated_at')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return fallback;
    const rows = (data as { slug: string; updated_at: string | null }[])
      .filter((r) => typeof r.slug === 'string' && r.slug.length > 0)
      .map((r) => ({ slug: r.slug, updatedAt: r.updated_at ?? null }));
    return rows.length > 0 ? rows : fallback;
  } catch {
    return fallback;
  }
}

async function readPanchangDates(): Promise<{ dates: string[]; mods: Map<string, string> }> {
  const mods = new Map<string, string>();
  try {
    const supabase = anonClient();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const futureLimit = new Date(today);
    futureLimit.setUTCDate(today.getUTCDate() + 365);
    const futureLimitStr = futureLimit.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('panchang_daily')
      // v9.4: updated_at added for a real lastmod per date
      .select('date, updated_at')
      .gte('date', todayStr)
      .lte('date', futureLimitStr)
      .order('date', { ascending: true });

    if (error || !data || data.length === 0) return { dates: nextNDates(30), mods };
    const set = new Set<string>();
    for (const row of data as { date: string; updated_at: string | null }[]) {
      if (typeof row.date === 'string' && row.date.length >= 10) {
        const d = row.date.slice(0, 10);
        set.add(d);
        if (row.updated_at) {
          const prev = mods.get(d);
          if (!prev || row.updated_at > prev) mods.set(d, row.updated_at);
        }
      }
    }
    const dates = Array.from(set).sort();
    return { dates: dates.length > 0 ? dates : nextNDates(30), mods };
  } catch {
    return { dates: nextNDates(30), mods };
  }
}

async function readReportSlugs(): Promise<{ slug: string; updatedAt: string | null }[]> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('predictions')
      .select('public_slug, updated_at')
      .eq('is_public', true)
      .not('public_slug', 'is', null);
    if (error || !data) return [];
    return (data as { public_slug: string; updated_at: string | null }[])
      .filter((r) => typeof r.public_slug === 'string' && r.public_slug.length > 0)
      .map((r) => ({ slug: r.public_slug, updatedAt: r.updated_at ?? null }));
  } catch {
    return [];
  }
}

type SeoPageRow = { slug: string; category: string; priority: number; updated_at?: string | null };

async function readSeoLearnSlugs(): Promise<SeoPageRow[]> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('seo_pillar_pages')
      // v-fix 06 Sep 2026: updated_at added so /learn/ URLs can carry a real
      // lastmod instead of `now`. The column already existed.
      .select('slug, category, priority, updated_at')
      .eq('published', true)
      .order('priority', { ascending: false });
    if (error || !data) return [];
    return (data as SeoPageRow[]).filter(
      (r) => typeof r.slug === 'string' && r.slug.length > 0
    );
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VIVAH MUHURAT (v7.7) — PERMANENT AUTO. Rolling range 2026 .. (current+6),
// UNION any years still seeded in muhurat_windows. VM auto-computes windows for
// every year, so future-year pages are emitted without a DB row. Hand-validated
// years (2026/27/28) keep their DB override on the page. No hardcode, no manual
// sitemap edits.
// ─────────────────────────────────────────────────────────────────────────────
async function readVivahYears(): Promise<{ years: number[]; mods: Map<number, string> }> {
  const set = new Set<number>();
  const mods = new Map<number, string>();
  const end = new Date().getFullYear() + 6;
  for (let y = VIVAH_START; y <= end; y++) set.add(y);
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('muhurat_windows')
      // v9.4: created_at added (the table has no updated_at) for a real lastmod
      .select('year, created_at');
    if (!error && data) {
      for (const r of data as { year: number; created_at: string | null }[]) {
        if (typeof r.year === 'number' && r.year >= VIVAH_START && r.year <= 2100) {
          set.add(r.year);
          if (r.created_at) {
            const prev = mods.get(r.year);
            if (!prev || r.created_at > prev) mods.set(r.year, r.created_at);
          }
        }
      }
    }
  } catch {
    /* rolling range alone is fine */
  }
  return { years: Array.from(set).sort((a, b) => a - b), mods };
}

// ─────────────────────────────────────────────────────────────────────────────
// SWAPNA SPOKES (v8.0) — PERMANENT AUTO. Distinct symbol_key + category from
// dream_symbols drive /swapna/{symbol} and /swapna/category/{category}. Any
// symbol added to the table is auto-emitted. No manual sitemap edits.
// ─────────────────────────────────────────────────────────────────────────────
type DreamRead = {
  symbols: string[];
  categories: string[];
  symbolMods: Map<string, string>;
  categoryMods: Map<string, string>;
};

async function readDreamSymbols(): Promise<DreamRead> {
  const symbolMods = new Map<string, string>();
  const categoryMods = new Map<string, string>();
  const bump = (m: Map<string, string>, k: string, v: string | null) => {
    if (!v) return;
    const prev = m.get(k);
    if (!prev || v > prev) m.set(k, v);
  };
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('dream_symbols')
      // v9.4: updated_at added for a real lastmod per symbol and per category
      .select('symbol_key, category, updated_at');
    if (error || !data) return { symbols: [], categories: [], symbolMods, categoryMods };
    const symbols = new Set<string>();
    const categories = new Set<string>();
    for (const r of data as { symbol_key: string; category: string; updated_at: string | null }[]) {
      if (typeof r.symbol_key === 'string' && r.symbol_key.length > 0) {
        symbols.add(r.symbol_key);
        bump(symbolMods, r.symbol_key, r.updated_at);
      }
      if (typeof r.category === 'string' && r.category.length > 0) {
        categories.add(r.category);
        bump(categoryMods, r.category, r.updated_at);
      }
    }
    return {
      symbols: Array.from(symbols).sort(),
      categories: Array.from(categories).sort(),
      symbolMods,
      categoryMods,
    };
  } catch {
    return { symbols: [], categories: [], symbolMods, categoryMods };
  }
}

/** v9.4 — when today's Rashifal was generated (newest row for today), or null. */
async function readRashifalGeneratedAt(date: string): Promise<string | null> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('daily_rashifal_cache')
      .select('generated_at')
      .eq('date', date)
      .order('generated_at', { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return (data[0] as { generated_at: string | null }).generated_at ?? null;
  } catch {
    return null;
  }
}

/**
 * v8.6 — today's date as YYYY-MM-DD, used for the single Rashifal URL.
 * Uses UTC like every other date helper in this file so the sitemap does not
 * flip between two dates depending on which region the build runs in.
 */
function todayISO(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function nextNDates(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() + i);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

function learnChangeFreq(category: string): MetadataRoute.Sitemap[0]['changeFrequency'] {
  if (category === 'transit') return 'weekly';
  if (category === 'festival') return 'yearly';
  if (category === 'trending') return 'monthly';
  return 'monthly';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // v9.4: `now` is gone. Daily pages use istDayStart(); everything else uses a
  // real row date or its code date. Hub pages are patched at the end with the
  // date of their newest child (see "HUB LASTMOD PATCH" below).
  const today = istDayStart();
  const entries: MetadataRoute.Sitemap = [];
  const hubMods: Record<string, Date | null> = {};

  // ── Static routes ──────────────────────────────────────────────────
  for (const path of STATIC_ROUTES) {
    let priority = 0.8;
    if (path === '') priority = 1.0;
    else if (path === '/voice-pricing') priority = 0.95;
    else if (path === '/calculators') priority = 0.9;
    else if (path === '/hast-rekha-calculator') priority = 0.85;
    else if (path === '/swapna') priority = 0.9;

    // v9.4: home and the /panchang hub change daily; the rest are code pages.
    const staticMod = path === '' || path === '/panchang' ? today : codeMod(path);
    entries.push({
      url: `${BASE}${path}`,
      lastModified: staticMod,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority,
    });
  }

  // ── LOCAL SEO: /astrologer-{city} (v8.2) ───────────────────────────
  // Delhi = flagship (GBP city, real NAP). Others = NCR satellites.
  for (const path of LOCAL_ROUTES) {
    entries.push({
      url: `${BASE}${path}`,
      lastModified: codeMod(path),
      changeFrequency: 'weekly',
      priority: path === '/astrologer-delhi' ? 0.9 : 0.8,
    });
  }

  // ── PAID SERVICE PAGES (v8.5) ──────────────────────────────────────
  // The Rs 51 conversion pages. Absent from every sitemap before v8.5.
  // Priority 0.9 puts them level with the domain pillars and above blog
  // posts (0.7), which reflects their commercial role — with the caveat
  // noted in the header that Google largely ignores this field.
  // changeFrequency is monthly: the copy is stable, only pricing moves.
  for (const slug of SERVICE_ROUTES) {
    entries.push({
      url: `${BASE}/services/${slug}`,
      lastModified: codeMod(`/services/${slug}`),
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  }
  console.log(`[sitemap] services OK — ${SERVICE_ROUTES.length} URLs`);
  hubMods['/services'] = latest(codeMod('/services'), ...SERVICE_ROUTES.map((s) => codeMod(`/services/${s}`)));

  // ── Calculator detail pages ────────────────────────────────────────
  for (const calc of CALCULATORS) {
    entries.push({
      url: `${BASE}/calculators/${calc}`,
      lastModified: codeMod(`/calculators/${calc}`),
      changeFrequency: 'monthly',
      priority: 0.85,
    });
  }

  hubMods['/calculators'] = latest(codeMod('/calculators'), ...CALCULATORS.map((c) => codeMod(`/calculators/${c}`)));

  // ── Vivah Muhurat (PERMANENT AUTO) — v7.7 ──────────────────────────
  // /vivah-muhurat (index → current year) + /vivah-muhurat/{year} per rolling year.
  const { years: vivahYears, mods: vivahMods } = await readVivahYears();
  if (vivahYears.length > 0) {
    entries.push({
      url: `${BASE}/vivah-muhurat`,
      lastModified: latest(codeMod('/vivah-muhurat'), codeMod('/vivah-muhurat/[year]'), ...Array.from(vivahMods.values())) ?? codeMod('/vivah-muhurat'),
      changeFrequency: 'monthly',
      priority: 0.85,
    });
    for (const y of vivahYears) {
      entries.push({
        url: `${BASE}/vivah-muhurat/${y}`,
        lastModified: latest(codeMod('/vivah-muhurat/[year]'), vivahMods.get(y)) ?? codeMod('/vivah-muhurat/[year]'),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  // ── 15 Pillar Domain Pages ─────────────────────────────────────────
  const domainSlugs = await readDomainSlugs();
  for (const d of domainSlugs) {
    entries.push({
      url: `${BASE}/${d.slug}`,
      lastModified: latest(d.updatedAt) ?? codeMod('/[domain]'),
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  }

  // ── WIN 1: Compatibility pages ─────────────────────────────────────
  //
  // Both languages, each pointing at the other through hreflang — which the
  // blog has had since v8.1 and this block never did, so Google was left to
  // treat the two as competing duplicates rather than one page in two
  // languages.
  //
  // The /hi/compatibility/[pair] route these URLs need was listed here from
  // June 2026 and only built on 28 Aug 2026. Every Hindi compatibility URL in
  // this sitemap returned 404 in between.
  const compatRows = await readCompatibilitySlugs();
  const compatSlugs = new Set<string>();
  for (const row of compatRows) compatSlugs.add(row.slug);

  for (const row of compatRows) {
    const enUrl = `${BASE}/compatibility/${row.slug}`;
    const hiUrl = `${BASE}/hi/compatibility/${row.slug}`;
    const languages = { 'en-IN': enUrl, 'hi-IN': hiUrl };

    // v-fix 06 Sep 2026: real updated_at instead of `now`. See the header note.
    const compatMod = latest(row.updated_at) ?? codeMod(CODE_LASTMOD_DEFAULT);
    if (row.lang === 'en') {
      entries.push({
        url: enUrl,
        lastModified: compatMod,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: { languages },
      });
    } else if (row.lang === 'hi') {
      entries.push({
        url: hiUrl,
        lastModified: compatMod,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  // ── Blog posts (v8.4: lightweight anon reader; v8.1 hreflang unchanged) ──
  try {
    const { rows: posts, error: blogError } = await getPostsForSitemap();

    if (blogError) {
      console.error('[sitemap] BLOG QUERY FAILED —', blogError,
        `| emitted ${posts.length} blog URLs (partial)`);
    } else if (posts.length === 0) {
      console.error('[sitemap] BLOG RETURNED ZERO ROWS — no query error. ' +
        'Check is_published and the blog_posts RLS SELECT policy.');
    } else {
      console.log(`[sitemap] blog OK — ${posts.length} URLs`);
    }

    hubMods['/blog'] = latest(codeMod('/blog'), ...posts.map((x) => x.updatedAt));
    for (const post of posts) {
      const entry: MetadataRoute.Sitemap[0] = {
        url: `${BASE}/blog/${post.slug}`,
        lastModified: latest(post.updatedAt) ?? codeMod('/blog'),
        changeFrequency: 'weekly',
        priority: 0.7,
      };
      if (post.altLangSlug) {
        entry.alternates = {
          languages: {
            'en-IN': post.lang === 'hi' ? `${BASE}/blog/${post.altLangSlug}` : `${BASE}/blog/${post.slug}`,
            'hi-IN': post.lang === 'hi' ? `${BASE}/blog/${post.slug}` : `${BASE}/blog/${post.altLangSlug}`,
          },
        };
      }
      entries.push(entry);
    }
  } catch (err) {
    // getPostsForSitemap does not throw, but a module-level client failure
    // (a missing NEXT_PUBLIC_SUPABASE_ANON_KEY) would land here.
    console.error('[sitemap] BLOG BLOCK THREW:', err);
  }

  // ── City pages ─────────────────────────────────────────────────────
  const cities = readCities();
  for (const c of cities) {
    // v9.4: both show today's panchang / upcoming events → 00:00 IST today.
    entries.push({ url: `${BASE}/${c.slug}`, lastModified: today, changeFrequency: 'weekly', priority: 0.85 });
    entries.push({ url: `${BASE}/${c.slug}/panchang`, lastModified: today, changeFrequency: 'daily', priority: 0.8 });
  }

  // ── Festival/event pages ───────────────────────────────────────────
  const dbFestivals = await readFestivalsFromDB();
  const hiSlugs = await readHindiFestivalSlugs();
  const festContentMods = await readFestivalContentDates();
  if (dbFestivals.length > 0) {
    for (const f of dbFestivals) {
      if (!f.is_indexed) continue; // skip no-content festivals entirely

      // v9.4: one honest date for the national EN/HI pages and every city copy
      const festMod =
        latest(f.updated_at, festContentMods.get(baseSlugOf(f.festival_slug)), codeMod('festival-template')) ??
        codeMod('festival-template');

      const hi = hiSlugs.get(baseSlugOf(f.festival_slug)) || null;

      // national — English, and Hindi where a published Hindi page exists
      const enUrl = `${BASE}/events/${f.festival_slug}`;
      const hiUrl = hi ? `${BASE}/hi/${hi}` : null;
      const natLangs = hi
        ? { languages: { 'en-IN': enUrl, 'hi-IN': hiUrl! } }
        : undefined;

      entries.push({
        url: enUrl, lastModified: festMod, changeFrequency: 'monthly',
        priority: 0.75, ...(natLangs ? { alternates: natLangs } : {}),
      });
      if (hiUrl) {
        entries.push({
          url: hiUrl, lastModified: festMod, changeFrequency: 'monthly',
          priority: 0.75, alternates: natLangs,
        });
      }

      for (const c of cities) {
        if (!festivalInState(f.festival_scope, f.home_states, c.state)) continue;

        const enCity = `${BASE}/${c.slug}/events/${f.festival_slug}`;
        const hiCity = hi ? `${BASE}/hi/${c.slug}/${hi}` : null;
        const cityLangs = hi
          ? { languages: { 'en-IN': enCity, 'hi-IN': hiCity! } }
          : undefined;

        entries.push({
          url: enCity, lastModified: festMod, changeFrequency: 'monthly',
          priority: 0.8, ...(cityLangs ? { alternates: cityLangs } : {}),
        });
        if (hiCity) {
          entries.push({
            url: hiCity, lastModified: festMod, changeFrequency: 'monthly',
            priority: 0.8, alternates: cityLangs,
          });
        }
      }
    }
  } else {
    const festivals = readFestivals();
    for (const f of festivals) {
      entries.push({ url: `${BASE}/events/${f.slug}`, lastModified: codeMod('festival-template'), changeFrequency: 'monthly', priority: 0.75 });
    }
  }

  // ── WIN 3: Panchang — future dates only (today + 365 days) ────────
  const { dates: panchangDates, mods: panchangMods } = await readPanchangDates();
  for (const date of panchangDates) {
    entries.push({
      url: `${BASE}/panchang/${date}`,
      lastModified: latest(panchangMods.get(date), codeMod('/panchang/[date]')) ?? codeMod('/panchang/[date]'),
      changeFrequency: 'daily',
      priority: 0.5,
    });
  }

  // ── DAILY RASHIFAL (v8.6) ──────────────────────────────────────────
  // Exactly one URL: today's dated page. See the header note for why the
  // bare /rashifal hub, the 83 cached past dates and the on-demand future
  // dates are all deliberately excluded.
  const rashifalGen = await readRashifalGeneratedAt(todayISO());
  entries.push({
    url: `${BASE}/rashifal/${todayISO()}`,
    lastModified: latest(rashifalGen) ?? today,
    changeFrequency: 'daily',
    priority: 0.7,
  });
  console.log('[sitemap] rashifal OK — 1 URL');

  // ── Public report pages ────────────────────────────────────────────
  const reports = await readReportSlugs();
  for (const r of reports) {
    entries.push({
      url: `${BASE}/report/${r.slug}`,
      lastModified: latest(r.updatedAt) ?? codeMod(CODE_LASTMOD_DEFAULT),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // ── SWAPNA SPOKES (PERMANENT AUTO) — v8.0 ──────────────────────────
  // /swapna/{symbol} + /swapna/category/{category}, live from dream_symbols.
  const dreams = await readDreamSymbols();
  hubMods['/swapna'] = latest(codeMod('/swapna'), ...Array.from(dreams.symbolMods.values()));
  for (const s of dreams.symbols) {
    entries.push({
      url: `${BASE}/swapna/${s}`,
      lastModified: latest(dreams.symbolMods.get(s), codeMod('/swapna/[symbol]')) ?? codeMod('/swapna/[symbol]'),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }
  for (const c of dreams.categories) {
    entries.push({
      url: `${BASE}/swapna/category/${c}`,
      lastModified: latest(dreams.categoryMods.get(c), codeMod('/swapna/category')) ?? codeMod('/swapna/category'),
      changeFrequency: 'weekly',
      priority: 0.75,
    });
  }

  // ── /learn hub + SEO knowledge pages ──────────────────────────────
  const seoPages = await readSeoLearnSlugs();
  entries.push({
    url: `${BASE}/learn`,
    // v9.4: the hub lists every /learn/ page → its newest page's date
    lastModified: latest(codeMod('/learn'), ...seoPages.map((x) => x.updated_at)) ?? codeMod('/learn'),
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  for (const page of seoPages) {
    entries.push({
      url: `${BASE}/learn/${page.slug}`,
      lastModified: latest(page.updated_at) ?? codeMod('/learn'),
      changeFrequency: learnChangeFreq(page.category),
      priority: page.priority ?? 0.8,
    });
  }

  // ── v9.4: HUB LASTMOD PATCH — /blog, /calculators, /services, /swapna are
  // emitted early (static routes) before their children are read; give each
  // the date of its newest child now.
  for (const e of entries) {
    const path = String(e.url).replace(BASE, '');
    const hub = hubMods[path];
    if (hub) e.lastModified = hub;
  }

  // ── v8.4: de-dupe. 624 URLs were emitted twice on 30 Aug because the
  // Hindi loop and the city loop both produce /hi/<city>/<festival> paths.
  // Keep the first occurrence, which carries the richer hreflang alternates.
  const seen = new Set<string>();
  const unique = entries.filter((e) => {
    const url = String(e.url);
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });

  if (unique.length !== entries.length) {
    console.log(`[sitemap] removed ${entries.length - unique.length} duplicate URLs`);
  }
  console.log(`[sitemap] emitting ${unique.length} URLs`);

  return unique;
}
