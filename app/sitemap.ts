/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/sitemap.ts
 * Version:     v6.0
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * Changes v5.9 → v6.0 (2026-06-02):
 *   GOAL: Index the 10 new free calculators so GSC + Bing discover them.
 *   FIX:  ADDED 10 calculator slugs to CALCULATORS (now 18 total):
 *           free-kaal-sarp-dosh-calculator, free-pitra-dosh-calculator,
 *           free-gemstone-calculator, free-numerology-calculator,
 *           free-baby-name-by-nakshatra, free-lucky-day-calculator,
 *           free-weak-planet-finder, free-graha-bal-calculator,
 *           free-kundali-strength-calculator, free-lagna-bal-calculator.
 *   UNTOUCHED: everything else — static routes, dynamic domains/panchang/
 *              compatibility/blog/cities/festivals/reports, all priorities
 *              and changeFrequencies from v5.9.
 *
 * ── Earlier history (unchanged) ─────────────────────────────────────────────
 *   v5.9: DYNAMIC domains (domain_pages), panchang (panchang_daily, ~365),
 *         public reports (/report/{slug}).
 *   v5.8: ADDED 'free-child-birth-muhurat-calculator' to CALCULATORS.
 *   v5.7: ADDED /kundali-milan + /karmic-background-reading to STATIC_ROUTES.
 *   v5.6: REMOVED /astrologer-{city} entries (IR-20 / Plan §5.9).
 *   v5.5: ADDED /compatibility/* programmatic SEO pages (dynamic).
 *   v5.4: calculators hub + 7 calc pages; domains priority 0.9; panchang 30d.
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
  '/kundali-milan',               // v5.7: Milan pillar
  '/karmic-background-reading',   // v5.7: Karmic Background Reading pillar
];

const CALCULATORS = [
  'free-kundali-calculator',
  'free-child-birth-muhurat-calculator',  // v5.8: Child Birth Muhurat (free)
  'free-dasha-calculator',
  'free-nakshatra-calculator',
  'free-rashi-calculator',
  'free-lagna-calculator',
  'free-sade-sati-calculator',
  'free-manglik-dosh-calculator',
  // ── v6.0: 10 new free calculators ──
  'free-kaal-sarp-dosh-calculator',
  'free-pitra-dosh-calculator',
  'free-gemstone-calculator',
  'free-numerology-calculator',
  'free-baby-name-by-nakshatra',
  'free-lucky-day-calculator',
  'free-weak-planet-finder',
  'free-graha-bal-calculator',
  'free-kundali-strength-calculator',
  'free-lagna-bal-calculator',
];

// v5.9: kept ONLY as a safety fallback. Live list now comes from domain_pages.
const DOMAINS_FALLBACK = [
  'career', 'wealth', 'health', 'relationships', 'family',
  'education', 'home', 'legal', 'travel', 'spirituality',
  'wellbeing', 'marriage', 'business', 'foreign-settlement', 'digital-career',
];

type CityRow = { slug: string };
type FestivalRow = { slug: string; date?: string };

// ── Shared anon Supabase client (public-read only) ──────────────────────────
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

// v5.9: 15 domain pages, dynamic from domain_pages (fallback to hardcoded list)
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

// v5.9: every panchang date that actually has a page (fallback to next-30)
async function readPanchangDates(): Promise<string[]> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('panchang_daily')
      .select('date');
    if (error || !data || data.length === 0) return nextNDates(30);
    const set = new Set<string>();
    for (const row of data as { date: string }[]) {
      if (typeof row.date === 'string' && row.date.length >= 10) {
        set.add(row.date.slice(0, 10)); // normalise to YYYY-MM-DD
      }
    }
    const dates = Array.from(set).sort();
    return dates.length > 0 ? dates : nextNDates(30);
  } catch {
    return nextNDates(30);
  }
}

// v5.9: public report pages — /report/{public_slug}
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

  // ── 15 Pillar Domain Pages (v5.9: dynamic from domain_pages) ───────
  const domainSlugs = await readDomainSlugs();
  for (const d of domainSlugs) {
    entries.push({
      url: `${BASE}/${d}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
  }

  // ── Compatibility pages (programmatic SEO) ─────────────────────────
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
        url: `${BASE}/compatibility/${row.slug}?lang=hi`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // ── Blog posts (auto-includes the 5 new Milan spokes) ──────────────
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
  // v5.6 FIX 1: /astrologer-{city} REMOVED (IR-20 / Plan §5.9).
  // City landing + panchang RETAINED.
  const cities = readCities();
  for (const c of cities) {
    entries.push({ url: `${BASE}/${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 });
    entries.push({ url: `${BASE}/${c.slug}/panchang`, lastModified: now, changeFrequency: 'daily', priority: 0.8 });
  }

  // ── Festival/event pages ───────────────────────────────────────────
  const festivals = readFestivals();
  for (const f of festivals) {
    entries.push({ url: `${BASE}/events/${f.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 });
  }

  // ── Panchang date pages (v5.9: every date that has a page) ─────────
  const panchangDates = await readPanchangDates();
  for (const date of panchangDates) {
    entries.push({ url: `${BASE}/panchang/${date}`, lastModified: now, changeFrequency: 'daily', priority: 0.5 });
  }

  // ── Public report pages (v5.9: /report/{slug}) ─────────────────────
  const reports = await readReportSlugs();
  for (const r of reports) {
    entries.push({
      url: `${BASE}/report/${r.slug}`,
      lastModified: r.updatedAt ? new Date(r.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return entries;
}
