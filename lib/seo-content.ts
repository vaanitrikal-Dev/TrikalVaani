import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/* ────────────────────────────────────────────────────────────────────────────
   FIX v2 (4 Sep 2026) — "I edited Supabase but /learn/<slug> still shows the
   old text."

   THE BUG
   supabase-js issues PostgREST queries through the global `fetch`. Inside the
   Next.js App Router that fetch is patched, and an un-annotated GET is stored
   in the Next.js / Vercel Data Cache. The stored entry inherits the route's
   `export const revalidate` — 86400 on app/learn/[slug]/page.tsx — and the
   Vercel Data Cache SURVIVES A NEW DEPLOYMENT. So a Supabase content edit
   could stay invisible for 24 hours and redeploying did not clear it.

   WHY v1 OF THIS FIX DID NOT WORK
   v1 passed `next: { revalidate: 300 }`. That only sets the TTL on entries
   written AFTER the change. It does not evict the entry already sitting there
   with an 86400 TTL, and it does not alter the cache key, so the stale entry
   kept winning. Confirmed live: /learn/inheritance-wealth-prediction still
   served the old 1,157-word body and "7 min read" after that deploy went READY.

   THE ACTUAL FIX
   `cache: 'no-store'` on the Supabase client's fetch. The Data Cache is
   bypassed outright, so there is no stale entry to evict and no TTL to wait
   out. Supabase content edits are live on the next request.

   WHY THIS IS AFFORDABLE HERE
   app/learn/[slug]/page.tsx already reads `searchParams`, so that route is
   rendered per request regardless — this changes where the data comes from,
   not how often the page renders. These are small indexed single-row lookups.
   React's `cache()` would de-duplicate the repeated getSeoPageBySlug calls
   (it is called three times per render: once in generateMetadata and twice in
   the page's Promise.all), but this repo pins react 18.2.0 and `cache` is not
   available there — adding it would crash the route at runtime. Leave the
   functions plain. If query volume ever matters, first de-duplicate the two
   getSeoPageBySlug calls inside app/learn/[slug]/page.tsx's Promise.all.

   IF DATABASE LOAD EVER BECOMES A CONCERN
   Do not go back to a bare revalidate. Use `next: { tags: ['seo-pages'] }`
   here plus a revalidateTag() route hit after each Supabase write — that keeps
   caching AND stays correct.

   NOTE: /blog/[slug] reads blog_posts through its own data layer with the same
   un-annotated pattern and the same 86400 route revalidate. It has the same
   bug. NOT touched here, to keep this commit to one file.
   ──────────────────────────────────────────────────────────────────────────── */
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (input: any, init?: any) =>
      fetch(input, { ...(init || {}), cache: 'no-store' } as any),
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
