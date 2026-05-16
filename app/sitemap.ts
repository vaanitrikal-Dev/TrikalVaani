/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/sitemap.ts
 * Version:     v5.3
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Changes v5.2 → v5.3 (2026-05-17):
 *   FIX 1: Removed city×festival URL block (was 500 URLs: 10 cities × 50 festivals)
 *           app/[city]/events/[slug] does NOT exist → all 500 were returning 404
 *           500 crawl errors = serious GSC quality signal damage
 *   FIX 2: Reduced panchang date pages from 365 → 30 (next 30 days only)
 *           365 thin date-index pages consumed 36% of crawl budget
 *           30 days is sufficient for freshness signals
 *   NET:    Sitemap 1008 → 173 URLs. Money page crawl ratio 4% → 24%
 *   UNTOUCHED: All static routes, domains, blog, city pages, events — identical to v5.2
 * ============================================================================
 */

import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog-posts';
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
  '/upcoming-events',
  '/panchang',
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

// FIX 2: Reduced from 365 → 30 days
// 365 thin date-index pages was consuming 36% of Googlebot crawl budget.
// 30 days gives sufficient freshness signals for daily panchang content.
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
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1.0 : path === '/voice-pricing' ? 0.95 : 0.8,
    });
  }

  // ── Domain pages ───────────────────────────────────────────────────
  for (const d of DOMAINS) {
    entries.push({ url: `${BASE}/${d}`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 });
    entries.push({ url: `${BASE}/${d}/panchang`, lastModified: now, changeFrequency: 'daily', priority: 0.75 });
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

  // FIX 1: REMOVED city×festival block that was here in v5.2
  // Was generating 500 URLs: /delhi/events/diwali, /mumbai/events/navratri etc.
  // app/[city]/events/[slug]/page.tsx does NOT exist in the codebase.
  // All 500 URLs were returning 404 — confirmed via GitHub repo structure audit.
  // 500 crawl errors = GSC quality damage. Removed entirely.

  // ── Panchang date pages (next 30 days only) ────────────────────────
  // FIX 2: was nextNDates(365), now nextNDates(30)
  for (const date of nextNDates(30)) {
    entries.push({ url: `${BASE}/panchang/${date}`, lastModified: now, changeFrequency: 'daily', priority: 0.5 });
  }

  return entries;
}
