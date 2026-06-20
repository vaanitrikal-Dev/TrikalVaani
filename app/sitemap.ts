/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/sitemap.ts
 * Version:     v7.5
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * Changes v7.4 → v7.5 (2026-06-20):
 *   CONTENT CLUSTERS CONFIRMED — NO CODE CHANGE REQUIRED:
 *   All new /learn/[slug] pages are auto-picked up by readSeoLearnSlugs()
 *   which queries seo_pillar_pages WHERE published = true. Zero manual sitemap
 *   edits needed for new content — just INSERT with published=true.
 *
 *   Clusters now live in seo_pillar_pages (all published: true):
 *   ┌─────────────────────────────────────┬───────┬────────────────────────────┐
 *   │ Cluster                             │ Pages │ URL Pattern                │
 *   ├─────────────────────────────────────┼───────┼────────────────────────────┤
 *   │ Guru Singh Rashi Gochar 2026        │  14   │ /learn/jupiter-*           │
 *   │   — 1 pillar + 1 summary + 12 rashi │       │ /learn/guru-gochar-2026-*  │
 *   ├─────────────────────────────────────┼───────┼────────────────────────────┤
 *   │ Budh Vakri (Mercury Retrograde)     │  14   │ /learn/mercury-retrograde- │
 *   │   June 2026                         │       │ /learn/budh-vakri-2026-*   │
 *   │   — 1 pillar + 12 rashi + 1 upay   │       │                            │
 *   ├─────────────────────────────────────┼───────┼────────────────────────────┤
 *   │ Other transit pages (saturn, rahu-  │   5   │ /learn/saturn-transit-*    │
 *   │ ketu, older clusters)               │       │ /learn/rahu-ketu-*  etc.   │
 *   └─────────────────────────────────────┴───────┴────────────────────────────┘
 *   Total seo_pillar_pages published: 33 pages → all at /learn/[slug]
 *
 *   Blog posts (blog_posts table, is_published=true): auto-picked via
 *   getAllPosts() → /blog/[slug]. No redeployment needed for new blogs.
 *
 *   ⚠️  VERCEL REDEPLOYMENT NOTE:
 *   /learn/[slug] uses generateStaticParams → new slugs need ONE Vercel
 *   redeploy to generate static HTML. After redeployment, slugs are live
 *   and sitemap auto-includes them on next revalidation (3600s).
 *
 * Changes v7.3 → v7.4 (2026-06-19):
 *   FESTIVAL 404 FIX: the festival loop now emits URLs ONLY for is_indexed=true
 *     festivals. Previously the all-India /events/{slug} URL was pushed for EVERY
 *     row — including is_indexed=false festivals (pongal, ugadi, navratri
 *     day-1..9, durga-puja) that have no content and return 404. Those ~12 dead
 *     URLs are no longer submitted to Google (saves crawl budget + quality
 *     signal). The city fan-out was already is_indexed-gated; the all-India URL
 *     is now gated too via a single `if (!f.is_indexed) continue;`.
 *
 * Changes v7.2 → v7.3 (2026-06-16):
 *   GEMSTONE: Added the Gemstone Suitability ecosystem (10 new URLs) to the
 *             CALCULATORS array — 1 main suitability calculator + 9 stone-
 *             specific "should I wear X" pages (neelam, cats-eye, pukhraj,
 *             gomed, moonga, panna, moti, manik, heera). Calculator total 18 → 28.
 *   NOTE:     CALCULATORS is a manual list — every NEW calculator must be added
 *             here or it will be missing from the sitemap.
 *
 * Changes v7.1 → v7.2 (2026-06-14):
 *   WIN 1: Compatibility Hindi — proper /hi/compatibility/[slug] URLs instead
 *          of ?lang=hi query params. Google indexes clean URLs reliably.
 *   WIN 3: Panchang — only future dates (today + 365 days). Past dates removed
 *          from sitemap to save crawl budget. DB still has 545 rows but we
 *          filter to future only via date >= today.
 *   ALSO:  festivals_master is_indexed now 35 (was 24) after DB update.
 *          City fan-out now 350 URLs (was 240).
 *
 * ── Earlier history (unchanged) ─────────────────────────────────────────────
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
import { getAllPosts } from '@/lib/blog-posts';
import { createClient } from '@supabase/supabase-js';
import citiesData from './data/cities.json';
import festivalsData from './data/festivals.json';

const BASE = 'https://trikalvaani.com';

export const revalidate = 3600;

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
  '/panchang',
  '/kundali-milan',
  '/karmic-background-reading',
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

function festivalInState(scope: string | null, homeStates: string[] | null, state: string): boolean {
  if (scope === 'regional' && Array.isArray(homeStates) && homeStates.length > 0) {
    return homeStates.includes(state);
  }
  return true;
}

// WIN 1: Returns both EN and HI slug rows
// EN → /compatibility/[slug]
// HI → /hi/compatibility/[slug]  (clean URL, not ?lang=hi)
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

// WIN 3: Only future dates — today onwards, max 365 days
// Saves crawl budget — past panchang pages have no search intent value
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

// ─────────────────────────────────────────────────────────────────────────────
// AUTO-PICKUP: All rows in seo_pillar_pages WHERE published = true are served
// at /learn/[slug] and included in the sitemap automatically.
//
// Current clusters (as of v7.5 — 2026-06-20):
//   transit   → Jupiter Gochar 2026 (14 pages) + Budh Vakri June 2026 (14 pages)
//               + Saturn Transit + Rahu-Ketu Transit (5 pages)
//   knowledge → Vedic astrology reference pages
//   trending  → Trending astrology topics
//   festival  → Festival-specific SEO pages
//
// To add new /learn pages: INSERT into seo_pillar_pages with published=true.
// Then trigger ONE Vercel redeploy for generateStaticParams to pick up new slugs.
// ─────────────────────────────────────────────────────────────────────────────
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

    entries.push({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority,
    });
  }

  // ── Calculator detail pages ────────────────────────────────────────
  for (const calc of CALCULATORS) {
    entries.push({
      url: `${BASE}/calculators/${calc}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
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
  // EN: /compatibility/[slug]          — priority 0.8
  // HI: /hi/compatibility/[slug]       — clean URL, priority 0.7
  // NOTE: /hi/compatibility/[slug] route must exist in Next.js app dir
  const compatRows = await readCompatibilitySlugs();
  for (const row of compatRows) {
    if (row.lang === 'en') {
      entries.push({
        url: `${BASE}/compatibility/${row.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    } else if (row.lang === 'hi') {
      entries.push({
        url: `${BASE}/hi/compatibility/${row.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // ── Blog posts ─────────────────────────────────────────────────────
  try {
    const posts = await getAllPosts();
    for (const post of posts) {
      entries.push({
        url: `${BASE}/blog/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch (err) {
    console.error('[sitemap] blog fetch failed:', err);
  }

  // ── City pages ─────────────────────────────────────────────────────
  const cities = readCities();
  for (const c of cities) {
    entries.push({ url: `${BASE}/${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 });
    entries.push({ url: `${BASE}/${c.slug}/panchang`, lastModified: now, changeFrequency: 'daily', priority: 0.8 });
  }

  // ── Festival/event pages ───────────────────────────────────────────
  // v7.4 FIX: emit URLs ONLY for is_indexed=true festivals. is_indexed=false
  // rows (pongal, ugadi, navratri day-1..9, durga-puja…) have no generated
  // content and 404 — keeping them out of the sitemap stops Google crawling
  // dead pages and wasting crawl budget. This now gates BOTH the all-India
  // page and the city fan-out (single guard below).
  const dbFestivals = await readFestivalsFromDB();
  if (dbFestivals.length > 0) {
    for (const f of dbFestivals) {
      if (!f.is_indexed) continue; // skip no-content festivals entirely

      // All-India single page
      entries.push({
        url: `${BASE}/events/${f.festival_slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.75,
      });
      // City fan-out (scope-aware)
      for (const c of cities) {
        if (festivalInState(f.festival_scope, f.home_states, c.state)) {
          entries.push({
            url: `${BASE}/${c.slug}/events/${f.festival_slug}`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
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
  // Past dates removed — zero search intent, wastes crawl budget
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

  // ── /learn hub + SEO knowledge pages ──────────────────────────────
  // v7.5: 33 published pages auto-picked up from seo_pillar_pages.
  // Clusters: Guru Singh Rashi 2026 (14) + Budh Vakri June 2026 (14)
  //           + Saturn/Rahu-Ketu/other transit (5).
  // New clusters: INSERT with published=true → auto-included next revalidation.
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

  return entries;
}
