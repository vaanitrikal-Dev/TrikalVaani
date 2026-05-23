/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/sitemap.ts
 * Version:     v5.8
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * Changes v5.7 → v5.8 (2026-05-23):
 *   FIX 1: ADDED 'free-child-birth-muhurat-calculator' to CALCULATORS.
 *          Free muhurat calculator now crawlable. priority 0.85, monthly.
 *   NOTE: The paid /muhurat/[slug] result pages stay noindex (private),
 *         so they are intentionally NOT in the sitemap.
 *   UNTOUCHED: all v5.7 routes and logic.
 *
 * Changes v5.6 → v5.7 (2026-05-22):
 *   FIX 1: ADDED /kundali-milan (Milan pillar) to STATIC_ROUTES.
 *   FIX 2: ADDED /karmic-background-reading (Karmic pillar) to STATIC_ROUTES.
 *          Both now crawlable/indexable. priority 0.8, weekly.
 *   UNTOUCHED: all v5.6 routes and logic.
 *
 * Changes v5.5 → v5.6 (2026-05-22):
 *   FIX 1: REMOVED /astrologer-{city} entries — violates IR-20 / Plan §5.9
 *           (no LocalBusiness, no /astrologer-* pages; national + AI-search
 *           authority only). City pages (/{slug}) and /{slug}/panchang RETAINED.
 *   NOTE: This only removes them from the sitemap. If the /astrologer-{city}
 *         route still renders, kill or 308-redirect it separately so the URLs
 *         drop out of the index.
 *
 *   UNTOUCHED: All v5.5 routes — static, calculators, 15 domains,
 *              compatibility pages, blog, cities, festivals, panchang dates.
 * ============================================================================
 *
 * Changes v5.4 → v5.5 (2026-05-20):
 *   FIX 1: ADDED /compatibility/* programmatic SEO pages (dynamic from Supabase)
 *           - English: /compatibility/{slug}            (priority 0.8)
 *           - Hindi:    /compatibility/{slug}?lang=hi    (priority 0.7)
 *           - Auto-grows as new rows are added (no code change needed)
 * ============================================================================
 *
 * Changes v5.3 → v5.4 (2026-05-18):
 *   FIX 1: REMOVED '/upcoming-events' (now 308-redirects to /panchang)
 *   FIX 2: ADDED '/calculators' hub page (priority 0.9)
 *   FIX 3: ADDED 7 calculator detail pages (priority 0.85)
 *   FIX 4: RAISED 15 domain pages priority 0.85 → 0.9
 *   FIX 5: REMOVED '/{domain}/panchang' compound routes (404)
 *   FIX 6: Changed 15 domain pages changeFrequency 'weekly' → 'monthly'
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
];

const DOMAINS = [
  'career', 'wealth', 'health', 'relationships', 'family',
  'education', 'home', 'legal', 'travel', 'spirituality',
  'wellbeing', 'marriage', 'business', 'foreign-settlement', 'digital-career',
];

type CityRow = { slug: string };
type FestivalRow = { slug: string; date?: string };

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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('compatibility_pages')
      .select('slug, lang');
    if (error || !data) return [];
    return data as { slug: string; lang: string }[];
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

  // ── 15 Pillar Domain Pages ─────────────────────────────────────────
  for (const d of DOMAINS) {
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

  // ── Panchang date pages (next 30 days) ─────────────────────────────
  for (const date of nextNDates(30)) {
    entries.push({ url: `${BASE}/panchang/${date}`, lastModified: now, changeFrequency: 'daily', priority: 0.5 });
  }

  return entries;
}
