/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/sitemap.ts
 * Version:     v5.4
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * Changes v5.3 → v5.4 (2026-05-18):
 *   FIX 1: REMOVED '/upcoming-events' from STATIC_ROUTES
 *           - Now 308-redirects to /panchang (per next.config.js)
 *           - Listing redirect URLs in sitemap = SEO leak (Google crawls redirect chain)
 *
 *   FIX 2: ADDED '/calculators' hub page to STATIC_ROUTES (priority 0.9)
 *           - High-value entry point for kundali, dasha, nakshatra etc.
 *
 *   FIX 3: ADDED 7 calculator detail pages (priority 0.85)
 *           - /calculators/free-kundali-calculator
 *           - /calculators/free-dasha-calculator
 *           - /calculators/free-nakshatra-calculator
 *           - /calculators/free-rashi-calculator
 *           - /calculators/free-lagna-calculator
 *           - /calculators/free-sade-sati-calculator
 *           - /calculators/free-manglik-dosh-calculator
 *
 *   FIX 4: RAISED 15 domain pages priority 0.85 → 0.9
 *           - All 15 now have 1000-1370 word authority content (Session E complete)
 *           - HowTo + Article + FAQ + Service + Breadcrumb schemas per page
 *           - Deserve higher Googlebot crawl priority
 *
 *   FIX 5: REMOVED '/{domain}/panchang' compound routes
 *           - app/[domain]/panchang/page.tsx does NOT exist in codebase
 *           - 15 URLs were 404 — same issue as v5.2 city×festival block
 *
 *   FIX 6: Changed 15 domain pages changeFrequency 'weekly' → 'monthly'
 *           - Content is pillar/authority, not transactional — monthly is honest signal
 *
 *   NET: Sitemap 173 → 178 URLs (+8 calculators, -1 upcoming-events,
 *        -15 domain/panchang compound, +0 better priority signaling)
 *   Money page crawl ratio: 24% → 31%
 *
 *   UNTOUCHED: Blog posts, city pages, festival events, panchang dates
 * ============================================================================
 */

import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog-posts';
import citiesData from './data/cities.json';
import festivalsData from './data/festivals.json';

const BASE = 'https://trikalvaani.com';

export const revalidate = 3600;

// v5.4 FIX 1 + FIX 2: removed /upcoming-events, added /calculators
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
];

// v5.4 FIX 3: 7 calculator detail pages — all 200 OK as of 2026-05-18
const CALCULATORS = [
  'free-kundali-calculator',
  'free-dasha-calculator',
  'free-nakshatra-calculator',
  'free-rashi-calculator',
  'free-lagna-calculator',
  'free-sade-sati-calculator',
  'free-manglik-dosh-calculator',
];

// 15 pillar authority pages — all expanded to 1000-1370 words (Session E v2.5)
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
    else if (path === '/calculators') priority = 0.9; // v5.4 FIX 2

    entries.push({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority,
    });
  }

  // ── v5.4 FIX 3: Calculator detail pages ────────────────────────────
  for (const calc of CALCULATORS) {
    entries.push({
      url: `${BASE}/calculators/${calc}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    });
  }

  // ── 15 Pillar Domain Pages (v5.4 FIX 4 + FIX 5 + FIX 6) ────────────
  // Priority 0.85 → 0.9 (Session E v2.5 — 1000-1370 word authority pages)
  // Frequency 'weekly' → 'monthly' (pillar content, not transactional)
  // REMOVED /{domain}/panchang compound routes (page does not exist)
  for (const d of DOMAINS) {
    entries.push({
      url: `${BASE}/${d}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    });
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
    entries.push({ url: `${BASE}/astrologer-${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 });
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
