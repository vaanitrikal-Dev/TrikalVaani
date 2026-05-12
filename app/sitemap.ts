/**
 * ============================================================
 * TRIKAL VAANI — Sitemap (Fully Dynamic)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/sitemap.ts
 * VERSION: 4.0 — Pulls blog slugs from Supabase automatically
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Add new blog in Supabase → appears in sitemap within 1 hour.
 * No code change ever needed for new blogs.
 * ============================================================
 */
import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog-posts';

const BASE = 'https://trikalvaani.com';

// Revalidate sitemap every 1 hour (3600s) so new Supabase posts get indexed fast
export const revalidate = 3600;

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static routes
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : path === '/voice-pricing' ? 0.95 : 0.8,
  }));

  // 2. Domain pages + panchang sub-pages
  const domainEntries: MetadataRoute.Sitemap = DOMAINS.flatMap((d) => [
    {
      url: `${BASE}/${d}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${BASE}/${d}/panchang`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.75,
    },
  ]);

  // 3. Blog posts — pulled live from Supabase, always current
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPosts();
    blogEntries = posts.map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error('[sitemap] Failed to load blog posts from Supabase:', err);
    // Sitemap still works even if Supabase is temporarily down
  }

  return [...staticEntries, ...domainEntries, ...blogEntries];
}
