/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/sitemap.ts
 * Version:     v7.7
 * Owner:       Rohiit Gupta, Chief Vedic Architect
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
  const dbFestivals = await readFestivalsFromDB();
  if (dbFestivals.length > 0) {
    for (const f of dbFestivals) {
      if (!f.is_indexed) continue; // skip no-content festivals entirely

      entries.push({
        url: `${BASE}/events/${f.festival_slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.75,
      });
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
