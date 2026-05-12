/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/sitemap.ts
 * Version:     v5.1 — FULLY DYNAMIC (relative JSON imports for build safety)
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com
 * GitHub:      vaanitrikal-Dev/TrikalVaani
 * Updated:     May 13, 2026
 *
 * SITEMAP DOCTRINE — locked from this version forward:
 *   Sitemap is generated from DATA SOURCES, not hardcoded arrays.
 *   You will never edit this file again to add a blog, festival, city,
 *   or daily panchang. Only edit if a NEW ROUTE FAMILY launches
 *   (e.g. /courses/[slug], /astrologers/[id]).
 *
 * URL GENERATION (auto, ~1,007 URLs from current data):
 *   Static routes ............... 12
 *   Domain mains (15)          .. 15      /career, /wealth, ...
 *   Domain panchang (15)       .. 15      /career/panchang, ...
 *   Blog posts (Supabase)      .. dynamic (currently 20)
 *   City mains (10)            .. 10      /delhi, /mumbai, ...
 *   City panchang (10)         .. 10      /delhi/panchang, ...
 *   Astrologer + city (10)     .. 10      /astrologer-delhi, ...
 *   National festival pages    .. 50      /events/diwali-2026, ...
 *   City × festival combos     .. 500     /delhi/events/diwali-2026, ...
 *   Daily panchang (365 days)  .. 365     /panchang/2026-05-13, ...
 *   -----------------------------------------------
 *   TOTAL                      ~ 1,007 URLs
 *
 * DATA SOURCES:
 *   - Supabase blog_posts table (via getAllPosts())
 *   - data/cities.json (10 cities)
 *   - data/festivals.json (50 festivals)
 *   - Date generator (rolling 365-day window starting today)
 *
 * AUTO-UPDATE BEHAVIOR:
 *   - Add blog row in Supabase → sitemap updates within 1 hour (ISR revalidate)
 *   - Add festival to JSON + redeploy → 11 new URLs (1 national + 10 city)
 *   - Add city to JSON + redeploy → ~52 new URLs
 *   - Daily panchang URLs roll forward automatically — no maintenance
 *
 * FAILURE TOLERANCE:
 *   - Supabase down → blog URLs skipped, rest still ships
 *   - cities.json malformed → city URLs skipped, rest still ships
 *   - festivals.json malformed → event URLs skipped, rest still ships
 *
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================================
 */

import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog-posts';
import citiesData from '../data/cities.json';
import festivalsData from '../data/festivals.json';

const BASE = 'https://trikalvaani.com';

// ISR — sitemap rebuilds every 1 hour. New content goes live to Google fast.
export const revalidate = 3600;

// ────────────────────────────────────────────────────────────────────────────
// ROUTE FAMILY 1 — Static pages
// ────────────────────────────────────────────────────────────────────────────
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
  '/upcoming-events',
  '/panchang',
];

// ────────────────────────────────────────────────────────────────────────────
// ROUTE FAMILY 2 — Life domain pages
// ────────────────────────────────────────────────────────────────────────────
const DOMAINS = [
  'career', 'wealth', 'health', 'relationships', 'family',
  'education', 'home', 'legal', 'travel', 'spirituality',
  'wellbeing', 'marriage', 'business', 'foreign-settlement', 'digital-career',
];

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // 1. Static routes
  for (const path of STATIC_ROUTES) {
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1.0 : path === '/voice-pricing' ? 0.95 : 0.8,
    });
  }

  // 2. Life domain pages + their /panchang sub-pages
  for (const d of DOMAINS) {
    entries.push({
      url: `${BASE}/${d}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
    entries.push({
      url: `${BASE}/${d}/panchang`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.75,
    });
  }

  // 3. Blog posts from Supabase (currently ~20)
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
    console.error('[sitemap] Supabase blog fetch failed:', err);
  }

  // 4. City pages, city panchang, and astrologer-{city} (10 cities × 3 = 30)
  const cities = readCities();
  for (const c of cities) {
    entries.push({
      url: `${BASE}/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
    entries.push({
      url: `${BASE}/${c.slug}/panchang`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    });
    entries.push({
      url: `${BASE}/astrologer-${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9, // local SEO = high commercial intent
    });
  }

  // 5. National festival pages (50)
  const festivals = readFestivals();
  for (const f of festivals) {
    entries.push({
      url: `${BASE}/events/${f.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    });
  }

  // 6. City × Festival combos (10 × 50 = 500)
  for (const c of cities) {
    for (const f of festivals) {
      entries.push({
        url: `${BASE}/${c.slug}/events/${f.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.65,
      });
    }
  }

  // 7. Daily Panchang URLs — next 365 days, rolls forward each hour
  for (const date of nextNDates(365)) {
    entries.push({
      url: `${BASE}/panchang/${date}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.5,
    });
  }

  return entries;
}
