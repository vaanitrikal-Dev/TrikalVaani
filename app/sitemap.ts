/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/sitemap.ts
 * Version:     v5.2
 * Owner:       Rohiit Gupta, Chief Vedic Architect
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

  for (const path of STATIC_ROUTES) {
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1.0 : path === '/voice-pricing' ? 0.95 : 0.8,
    });
  }

  for (const d of DOMAINS) {
    entries.push({ url: `${BASE}/${d}`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 });
    entries.push({ url: `${BASE}/${d}/panchang`, lastModified: now, changeFrequency: 'daily', priority: 0.75 });
  }

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

  const cities = readCities();
  for (const c of cities) {
    entries.push({ url: `${BASE}/${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 });
    entries.push({ url: `${BASE}/${c.slug}/panchang`, lastModified: now, changeFrequency: 'daily', priority: 0.8 });
    entries.push({ url: `${BASE}/astrologer-${c.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 });
  }

  const festivals = readFestivals();
  for (const f of festivals) {
    entries.push({ url: `${BASE}/events/${f.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 });
  }

  for (const c of cities) {
    for (const f of festivals) {
      entries.push({ url: `${BASE}/${c.slug}/events/${f.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.65 });
    }
  }

  for (const date of nextNDates(365)) {
    entries.push({ url: `${BASE}/panchang/${date}`, lastModified: now, changeFrequency: 'daily', priority: 0.5 });
  }

  return entries;
}
