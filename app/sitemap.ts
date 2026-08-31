/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/sitemap.ts
 * Version:     v8.5
 * Owner:       Rohiit Gupta, Chief Vedic Architect
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
  'free-kundali-calculator',
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
];

const DOMAINS_FALLBACK = [
  'career', 'wealth', 'health', 'relationships', 'family',
  'education', 'home', 'legal', 'travel', 'spirituality',
  'wellbeing', 'marriage', 'business', 'foreign-settlement', 'digital-career',
];

type CityRow = { slug: string; state: string };
type FestivalRow = { slug: string; date?: string };

type DbFestivalRow = {
  festival_slug: string;
  date: string;
  festival_scope: string | null;
  home_states: string[] | null;
  is_indexed: boolean | null;
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
      .select('festival_slug, date, festival_scope, home_states, is_indexed');
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

const baseSlugOf = (s: string) => s.replace(/-20\d\d$/, '');

function festivalInState(scope: string | null, homeStates: string[] | null, state: string): boolean {
  if (scope === 'regional' && Array.isArray(homeStates) && homeStates.length > 0) {
    return homeStates.includes(state);
  }
  return true;
}

async function readCompatibilitySlugs(): Promise<{ slug: string; lang: string }[]> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('compatibility_pages')
      .select('slug, lang');
    if (error || !data) return [];
    return data as { slug: string; lang: string }[];
  } catch {
    return [];
  }
}

async function readDomainSlugs(): Promise<string[]> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('domain_pages')
      .select('slug')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return DOMAINS_FALLBACK;
    const slugs = (data as { slug: string }[])
      .map((r) => r.slug)
      .filter((s) => typeof s === 'string' && s.length > 0);
    return slugs.length > 0 ? slugs : DOMAINS_FALLBACK;
  } catch {
    return DOMAINS_FALLBACK;
  }
}

async function readPanchangDates(): Promise<string[]> {
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
      .select('date')
      .gte('date', todayStr)
      .lte('date', futureLimitStr)
      .order('date', { ascending: true });

    if (error || !data || data.length === 0) return nextNDates(30);
    const set = new Set<string>();
    for (const row of data as { date: string }[]) {
      if (typeof row.date === 'string' && row.date.length >= 10) {
        set.add(row.date.slice(0, 10));
      }
    }
    const dates = Array.from(set).sort();
    return dates.length > 0 ? dates : nextNDates(30);
  } catch {
    return nextNDates(30);
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

type SeoPageRow = { slug: string; category: string; priority: number };

async function readSeoLearnSlugs(): Promise<SeoPageRow[]> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('seo_pillar_pages')
      .select('slug, category, priority')
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
async function readVivahYears(): Promise<number[]> {
  const set = new Set<number>();
  const end = new Date().getFullYear() + 6;
  for (let y = VIVAH_START; y <= end; y++) set.add(y);
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('muhurat_windows')
      .select('year');
    if (!error && data) {
      for (const r of data as { year: number }[]) {
        if (typeof r.year === 'number' && r.year >= VIVAH_START && r.year <= 2100) set.add(r.year);
      }
    }
  } catch {
    /* rolling range alone is fine */
  }
  return Array.from(set).sort((a, b) => a - b);
}

// ─────────────────────────────────────────────────────────────────────────────
// SWAPNA SPOKES (v8.0) — PERMANENT AUTO. Distinct symbol_key + category from
// dream_symbols drive /swapna/{symbol} and /swapna/category/{category}. Any
// symbol added to the table is auto-emitted. No manual sitemap edits.
// ─────────────────────────────────────────────────────────────────────────────
async function readDreamSymbols(): Promise<{ symbols: string[]; categories: string[] }> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('dream_symbols')
      .select('symbol_key, category');
    if (error || !data) return { symbols: [], categories: [] };
    const symbols = new Set<string>();
    const categories = new Set<string>();
    for (const r of data as { symbol_key: string; category: string }[]) {
      if (typeof r.symbol_key === 'string' && r.symbol_key.length > 0) symbols.add(r.symbol_key);
      if (typeof r.category === 'string' && r.category.length > 0) categories.add(r.category);
    }
    return { symbols: Array.from(symbols).sort(), categories: Array.from(categories).sort() };
  } catch {
    return { symbols: [], categories: [] };
  }
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
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // ── Static routes ──────────────────────────────────────────────────
  for (const path of STATIC_ROUTES) {
    let priority = 0.8;
    if (path === '') priority = 1.0;
    else if (path === '/voice-pricing') priority = 0.95;
    else if (path === '/calculators') priority = 0.9;
    else if (path === '/hast-rekha-calculator') priority = 0.85;
    else if (path === '/swapna') priority = 0.9;

    entries.push({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority,
    });
  }

  // ── LOCAL SEO: /astrologer-{city} (v8.2) ───────────────────────────
  // Delhi = flagship (GBP city, real NAP). Others = NCR satellites.
  for (const path of LOCAL_ROUTES) {
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now,
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
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  }
  console.log(`[sitemap] services OK — ${SERVICE_ROUTES.length} URLs`);

  // ── Calculator detail pages ────────────────────────────────────────
  for (const calc of CALCULATORS) {
    entries.push({
      url: `${BASE}/calculators/${calc}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
  }

  // ── Vivah Muhurat (PERMANENT AUTO) — v7.7 ──────────────────────────
  // /vivah-muhurat (index → current year) + /vivah-muhurat/{year} per rolling year.
  const vivahYears = await readVivahYears();
  if (vivahYears.length > 0) {
    entries.push({
      url: `${BASE}/vivah-muhurat`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
    for (const y of vivahYears) {
      entries.push({
        url: `${BASE}/vivah-muhurat/${y}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  // ── 15 Pillar Domain Pages ─────────────────────────────────────────
  const domainSlugs = await readDomainSlugs();
  for (const d of domainSlugs) {
    entries.push({
      url: `${BASE}/${d}`,
      lastModified: now,
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

    if (row.lang === 'en') {
      entries.push({
        url: enUrl,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: { languages },
      });
    } else if (row.lang === 'hi') {
      entries.push({
        url: hiUrl,
        lastModified: now,
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

    for (const post of posts) {
      const entry: MetadataRoute.Sitemap[0] = {
        url: `${BASE}/blog/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
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
    entries.push({ url: `${BASE}/${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 });
    entries.push({ url: `${BASE}/${c.slug}/panchang`, lastModified: now, changeFrequency: 'daily', priority: 0.8 });
  }

  // ── Festival/event pages ───────────────────────────────────────────
  const dbFestivals = await readFestivalsFromDB();
  const hiSlugs = await readHindiFestivalSlugs();
  if (dbFestivals.length > 0) {
    for (const f of dbFestivals) {
      if (!f.is_indexed) continue; // skip no-content festivals entirely

      const hi = hiSlugs.get(baseSlugOf(f.festival_slug)) || null;

      // national — English, and Hindi where a published Hindi page exists
      const enUrl = `${BASE}/events/${f.festival_slug}`;
      const hiUrl = hi ? `${BASE}/hi/${hi}` : null;
      const natLangs = hi
        ? { languages: { 'en-IN': enUrl, 'hi-IN': hiUrl! } }
        : undefined;

      entries.push({
        url: enUrl, lastModified: now, changeFrequency: 'monthly',
        priority: 0.75, ...(natLangs ? { alternates: natLangs } : {}),
      });
      if (hiUrl) {
        entries.push({
          url: hiUrl, lastModified: now, changeFrequency: 'monthly',
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
          url: enCity, lastModified: now, changeFrequency: 'monthly',
          priority: 0.8, ...(cityLangs ? { alternates: cityLangs } : {}),
        });
        if (hiCity) {
          entries.push({
            url: hiCity, lastModified: now, changeFrequency: 'monthly',
            priority: 0.8, alternates: cityLangs,
          });
        }
      }
    }
  } else {
    const festivals = readFestivals();
    for (const f of festivals) {
      entries.push({ url: `${BASE}/events/${f.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 });
    }
  }

  // ── WIN 3: Panchang — future dates only (today + 365 days) ────────
  const panchangDates = await readPanchangDates();
  for (const date of panchangDates) {
    entries.push({ url: `${BASE}/panchang/${date}`, lastModified: now, changeFrequency: 'daily', priority: 0.5 });
  }

  // ── Public report pages ────────────────────────────────────────────
  const reports = await readReportSlugs();
  for (const r of reports) {
    entries.push({
      url: `${BASE}/report/${r.slug}`,
      lastModified: r.updatedAt ? new Date(r.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // ── SWAPNA SPOKES (PERMANENT AUTO) — v8.0 ──────────────────────────
  // /swapna/{symbol} + /swapna/category/{category}, live from dream_symbols.
  const dreams = await readDreamSymbols();
  for (const s of dreams.symbols) {
    entries.push({
      url: `${BASE}/swapna/${s}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }
  for (const c of dreams.categories) {
    entries.push({
      url: `${BASE}/swapna/category/${c}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    });
  }

  // ── /learn hub + SEO knowledge pages ──────────────────────────────
  entries.push({
    url: `${BASE}/learn`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  const seoPages = await readSeoLearnSlugs();
  for (const page of seoPages) {
    entries.push({
      url: `${BASE}/learn/${page.slug}`,
      lastModified: now,
      changeFrequency: learnChangeFreq(page.category),
      priority: page.priority ?? 0.8,
    });
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
