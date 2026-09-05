import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/* ────────────────────────────────────────────────────────────────────────────
   FIX v3 (5 Sep 2026) — `cache: 'no-store'` was crashing /learn/[slug] with a
   500 AND sending every single request straight to Postgres.

   WHAT THE LOGS SHOWED (Vercel, 5 Sep 2026):
     GET /learn/jupiter-leo-2026-12-rashis  500  [error/serverless]
       Page changed from static to dynamic at runtime, reason: no-store fetch
       https://<ref>.supabase.co/rest/v1/seo_pillar_pages?select=*&slug=eq....
     (same 500 on /learn/education-prediction-astrology,
      /learn/rahu-ketu-transit-2026, /learn/how-to-wear-gemstone-vedic, ...)

   WHY v2 BROKE IT:
     app/learn/[slug]/page.tsx has generateStaticParams() + revalidate 86400,
     so Next.js prerenders it. A `no-store` fetch inside a prerendered route is
     a hard contradiction — Next bails out at runtime with exactly that error.
     v2's own note said no-store was "affordable here" because the route was
     already per-request thanks to searchParams. That premise is gone: page.tsx
     v2.0 removes searchParams (Path A bilingual), so the route is static again
     and no-store is now actively fatal.

     Second cost: no-store means ZERO caching. getSeoPageBySlug alone was firing
     up to 3x per render, uncached, against a nano Postgres that fell over on
     5 Sep. This is the same class of mistake as blog_posts' select('*').

   THE FIX:
     `next: { revalidate: 300, tags: ['seo-pages'] }`
       • revalidate 300 — Supabase content edits go live within 5 minutes.
         v2 was right that a bare 86400 was too slow; 300s is not.
       • The 86400 Data Cache entries v2 could not evict expired long ago,
         so the stale-entry problem v2 was fighting no longer exists.
       • tags: ['seo-pages'] — when you want an edit live INSTANTLY instead of
         within 5 minutes, hit a route that calls revalidateTag('seo-pages').
         That is the approach v2's own closing note recommended.

   NOT CHANGED: getSeoPageBySlug still does select('*'). It is a single row
   looked up on an indexed unique slug — unlike blog_posts' getAllPosts, which
   pulled 737 rows. One row here is cheap and the page genuinely renders most
   of its columns.
   ──────────────────────────────────────────────────────────────────────────── */
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (input: any, init?: any) =>
      fetch(input, {
        ...(init || {}),
        next: { revalidate: 300, tags: ['seo-pages'] },
      } as any),
  },
})

// FIX (earlier session): added `faq_block_hi` — a nullable jsonb column on
// seo_pillar_pages. Existing rows have it as null until backfilled;
// app/learn/[slug]/page.tsx falls back to the English faq_block when it's null.
export type SeoPage = {
  id: number
  slug: string
  category: string
  cluster: string
  page_type: 'pillar' | 'cluster'
  title_en: string
  title_hi: string
  meta_description: string
  geo_answer: string
  primary_keyword: string
  secondary_keywords: string[]
  lsi_keywords: string[]
  search_intent: string
  internal_links: string[]
  faq_block: { q: string; a: string }[]
  faq_block_hi: { q: string; a: string }[] | null
  schema_type: string
  cta_text: string
  cta_href: string
  body_content: string | null
  body_content_hi: string | null
  word_count: number
  classical_ref: string | null
  eeat_author: string
  reading_time_min: number | null
  published: boolean
  priority: number
  created_at: string
  /* Path A bilingual pairing (column added 4 Sep 2026). Slug of this English
     page's Hindi twin, which is a separate lang='hi' row in blog_posts and
     renders at /blog/<hindi_slug>. NULL when no Hindi version exists yet.
     This is what drives the "हिंदी में पढ़ें" link on /learn and /learn/[slug];
     the older title_hi / body_content_hi + ?lang=hi mechanism is legacy and is
     left NULL under Path A. */
  hindi_slug: string | null
}

/** Fetch a single published page by slug */
export async function getSeoPageBySlug(slug: string): Promise<SeoPage | null> {
  const { data, error } = await supabase
    .from('seo_pillar_pages')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !data) return null
  return data as SeoPage
}

/** Fetch all pages in a cluster (for sidebar nav) */
export async function getClusterPages(cluster: string): Promise<Pick<SeoPage, 'slug' | 'title_en' | 'page_type'>[]> {
  const { data, error } = await supabase
    .from('seo_pillar_pages')
    .select('slug, title_en, page_type')
    .eq('cluster', cluster)
    .eq('published', true)
    .order('page_type', { ascending: false }) // pillar first
    .order('title_en')

  if (error || !data) return []
  return data
}

/** Fetch pillar pages for a category (for category index) */
export async function getCategoryPillars(category: string): Promise<Pick<SeoPage, 'slug' | 'title_en' | 'cluster' | 'meta_description'>[]> {
  const { data, error } = await supabase
    .from('seo_pillar_pages')
    .select('slug, title_en, cluster, meta_description')
    .eq('category', category)
    .eq('page_type', 'pillar')
    .eq('published', true)
    .order('priority', { ascending: false })

  if (error || !data) return []
  return data
}

/** Fetch all published slugs — used for sitemap + generateStaticParams */
export async function getAllPublishedSlugs(): Promise<{ slug: string; category: string }[]> {
  const { data, error } = await supabase
    .from('seo_pillar_pages')
    .select('slug, category')
    .eq('published', true)
    .order('priority', { ascending: false })

  if (error || !data) return []
  return data
}

/** Fetch related pages (same cluster, different slug) */
export async function getRelatedPages(cluster: string, currentSlug: string): Promise<Pick<SeoPage, 'slug' | 'title_en' | 'meta_description'>[]> {
  const { data, error } = await supabase
    .from('seo_pillar_pages')
    .select('slug, title_en, meta_description')
    .eq('cluster', cluster)
    .eq('published', true)
    .neq('slug', currentSlug)
    .limit(4)

  if (error || !data) return []
  return data
}
