/**
 * ============================================================
 * TRIKAL VAANI — Sitemap
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/sitemap.ts
 * VERSION: 3.0 — Added /voice-pricing for SEO
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

import type { MetadataRoute } from 'next';

const BASE = 'https://trikalvaani.com';

const DOMAINS = [
  'career', 'wealth', 'health', 'relationships', 'family',
  'education', 'home', 'legal', 'travel', 'spirituality',
  'wellbeing', 'marriage', 'business', 'foreign-settlement', 'digital-career',
];

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url       : `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority  : path === '' ? 1.0 : path === '/voice-pricing' ? 0.95 : 0.8,
  }));

  const domainEntries: MetadataRoute.Sitemap = DOMAINS.flatMap((d) => [
    {
      url            : `${BASE}/${d}`,
      lastModified   : now,
      changeFrequency: 'weekly',
      priority       : 0.85,
    },
    {
      url            : `${BASE}/${d}/panchang`,
      lastModified   : now,
      changeFrequency: 'daily',
      priority       : 0.75,
    },
  ]);

  return [...staticEntries, ...domainEntries];
}
