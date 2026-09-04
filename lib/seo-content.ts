import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/* ────────────────────────────────────────────────────────────────────────────
   FIX (4 Sep 2026) — "I edited Supabase but the /learn page still shows the
   old text."

   THE BUG
   supabase-js issues its PostgREST queries with the global `fetch`. Inside the
   Next.js App Router that `fetch` is patched, and an un-annotated GET is stored
   in the Next.js / Vercel **Data Cache**. Two things then bite:

     1. The cached entry inherits the route's `export const revalidate`, which on
        app/learn/[slug]/page.tsx is 86400 — so a Supabase content edit could
        stay invisible for a full 24 hours.
     2. The Vercel Data Cache SURVIVES A NEW DEPLOYMENT. Pushing a commit does
        NOT clear it, so "just redeploy" did not fix it either. Confirmed live
        on 4 Sep 2026: /learn (index) showed the new title while
        /learn/inheritance-wealth-prediction still served the old title AND the
        old body, from the same database row.

   THE FIX
   Give the Supabase client its own fetch that tags every query with
   `next: { revalidate: 300 }`. Content edits now go live within ~5 minutes with
   no deploy and no cache purge. 300s matches app/blog/page.tsx, which already
   uses `export const revalidate = 300`.

   WHY NOT `cache: 'no-store'`
   That would hit Supabase on every single request for all 90+ /learn/ pages.
   A 5-minute window costs at most one query per 5 minutes per distinct query
   and keeps the route cacheable.

   NOTE: this only covers seo_pillar_pages (/learn/). The blog_posts data layer
   used by /blog/[slug] has the same pattern and the same 86400 route
   revalidate, so it will need the same treatment — NOT changed here, to keep
   this commit to one file.
   ──────────────────────────────────────────────────────────────────────────── */
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (input: any, init?: any) =>
      fetch(input, { ...(init || {}), next: { revalidate: 300 } } as any),
  },
})

// FIX (this session): added `faq_block_hi` — a new nullable jsonb column added to
// seo_pillar_pages this session (ALTER TABLE ... ADD COLUMN faq_block_hi jsonb).
// Existing rows have it as null until backfilled; app/learn/[slug]/page.tsx (also
// updated this session) falls back to the English faq_block when it's null.
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
