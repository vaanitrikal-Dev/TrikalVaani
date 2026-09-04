import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getSeoPageBySlug,
  getClusterPages,
  getRelatedPages,
  getAllPublishedSlugs,
} from '@/lib/seo-content'
import SeoPageLayout from '@/components/seo/SeoPageLayout'

/* ============================================================
   FIX (this session):
   1. `export const revalidate = 86400` added below — previously
      this route had NO revalidate export, so it was fully static:
      any Supabase content update to an existing /learn/ slug would
      NOT appear on trikalvaani.com until the next Vercel deploy.
      86400s (24h) matches the existing pattern already used on
      app/blog/[slug]/page.tsx for the same reason.
   2. `?lang=hi` now actually does something. Previously title_hi
      and body_content_hi were stored in Supabase but never read by
      any code in this route — every visitor saw English regardless
      of the query param. This fix reads `searchParams.lang` and, if
      it's "hi" AND the row actually has title_hi + body_content_hi
      filled in, swaps those fields into the page before rendering
      (falls back to English if either Hindi field is empty, so
      thin/English-only rows are unaffected).
   KNOWN REMAINING GAP: faq_block is a single field (no faq_block_hi
   column exists in the schema), so FAQs stay in English even on the
   Hindi view. Fixing that needs a schema change, not just this file.
   ALTERNATIVE worth considering instead of this approach: mirror
   blog_posts' proven pattern (app/blog/[slug]/page.tsx) — fully
   separate published rows with their own Hindi slug, paired via an
   alt_lang_slug-style field, with real hreflang between two real
   URLs. That's more work (duplicating every existing body_content_hi
   into a new row) but is the pattern already battle-tested on this
   codebase for blog_posts, and gives Hindi pages their own indexable
   URL rather than a query-param variant of the English one.
   ============================================================ */

export const revalidate = 86400

interface Props {
  params: { slug: string }
  searchParams: { lang?: string }
}

/* ── generateStaticParams ── */
export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

/* ── generateMetadata ── */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const page = await getSeoPageBySlug(params.slug)
  if (!page) return {}

  const isHindiView = searchParams?.lang === 'hi' && !!page.title_hi && !!page.body_content_hi
  const displayTitle = isHindiView ? page.title_hi : page.title_en

  const canonical = `https://trikalvaani.com/learn/${page.slug}${isHindiView ? '?lang=hi' : ''}`

  return {
    // FIX (Sep 2026): was `title: \`${displayTitle} | Trikaal Vaani\``, a plain
    // string. A plain string is passed through the ROOT layout's title template
    // (app/layout.tsx -> title.template = "%s | Trikaal Vaani"), so every single
    // /learn/ page was shipping a DOUBLE brand suffix in <title>, e.g.
    //   "Inheritance Wealth Prediction ... | Trikaal Vaani | Trikaal Vaani"
    // That is 32 wasted characters on every page and pushed real titles past
    // Google's ~60-char display limit — a direct cause of high-impression /
    // zero-click behaviour on /learn/ pages. `{ absolute: ... }` bypasses the
    // template, which is the same pattern app/blog/[slug]/page.tsx already uses.
    title: { absolute: `${displayTitle} | Trikaal Vaani` },
    description: page.meta_description,
    keywords: [page.primary_keyword, ...page.secondary_keywords, ...page.lsi_keywords].join(', '),
    authors: [{ name: page.eeat_author, url: 'https://trikalvaani.com/about' }],
    alternates: {
      canonical,
      languages: {
        'en-IN': `https://trikalvaani.com/learn/${page.slug}`,
        // Only advertise the hi-IN alternate if there is real Hindi content behind it.
        ...(page.title_hi && page.body_content_hi
          ? { 'hi-IN': `https://trikalvaani.com/learn/${page.slug}?lang=hi` }
          : {}),
      },
    },
    openGraph: {
      title: displayTitle,
      description: page.meta_description,
      url: canonical,
      siteName: 'Trikaal Vaani',
      locale: isHindiView ? 'hi_IN' : 'en_IN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description: page.meta_description,
      site: '@trikalvaani',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1 },
    },
  }
}

/* ── Page Component ── */
export default async function SeoLearnPage({ params, searchParams }: Props) {
  const [page, clusterPages] = await Promise.all([
    getSeoPageBySlug(params.slug),
    getSeoPageBySlug(params.slug).then(p => p ? getClusterPages(p.cluster) : []),
  ])

  if (!page) notFound()

  const relatedPages = await getRelatedPages(page.cluster, page.slug)

  // ── Hindi swap: only if the row actually has real Hindi content ──
  const isHindiView = searchParams?.lang === 'hi' && !!page.title_hi && !!page.body_content_hi
  const displayPage = isHindiView
    ? { ...page, title_en: page.title_hi, body_content: page.body_content_hi as string }
    : page
  const hasHindiVersion = !!page.title_hi && !!page.body_content_hi

  /* ── JSON-LD Schemas ── */
  const schemas: object[] = []

  // Article schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: displayPage.title_en,
    description: page.meta_description,
    author: {
      '@type': 'Person',
      name: 'Rohiit Gupta',
      jobTitle: 'Chief Vedic Architect',
      url: 'https://trikalvaani.com/about',
      worksFor: { '@type': 'Organization', name: 'Trikaal Vaani' },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Trikaal Vaani',
      url: 'https://trikalvaani.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://trikalvaani.com/logo.png',
      },
    },
    dateModified: page.created_at,
    mainEntityOfPage: `https://trikalvaani.com/learn/${page.slug}`,
    inLanguage: isHindiView ? 'hi-IN' : 'en-IN',
    keywords: page.primary_keyword,
  })

  // FAQPage schema (English only for now — see KNOWN REMAINING GAP note above)
  if (page.faq_block?.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq_block.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    })
  }

  // BreadcrumbList schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: 'https://trikalvaani.com/learn' },
      { '@type': 'ListItem', position: 3, name: page.cluster, item: `https://trikalvaani.com/learn?cluster=${page.cluster}` },
      { '@type': 'ListItem', position: 4, name: displayPage.title_en, item: `https://trikalvaani.com/learn/${page.slug}` },
    ],
  })

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* ── Hindi link ──────────────────────────────────────────────────────
          FIX (4 Sep 2026): this block used to be driven by
          `hasHindiVersion = !!title_hi && !!body_content_hi`, i.e. the legacy
          `?lang=hi` query-param mechanism. Under the Path A bilingual pattern
          this site actually uses, Hindi lives as a fully separate lang='hi'
          row in blog_posts with its own indexable /blog/<slug> URL, and
          body_content_hi is left NULL — so this toggle was dead on every Path A
          page and readers had no way in from /learn.

          It now prefers the real Hindi URL via the new `hindi_slug` column, and
          only falls back to the legacy ?lang=hi toggle on older rows that
          genuinely have body_content_hi filled in. */}
      {page.hindi_slug ? (
        <div style={{ maxWidth: '900px', margin: '12px auto 0', padding: '0 16px', textAlign: 'right' }}>
          <Link
            href={`/blog/${page.hindi_slug}`}
            hrefLang="hi"
            style={{ fontSize: '14px', color: '#A08050', textDecoration: 'underline' }}
          >
            हिंदी में पढ़ें →
          </Link>
        </div>
      ) : hasHindiVersion ? (
        <div style={{ maxWidth: '900px', margin: '12px auto 0', padding: '0 16px', textAlign: 'right' }}>
          <Link
            href={isHindiView ? `/learn/${page.slug}` : `/learn/${page.slug}?lang=hi`}
            style={{ fontSize: '14px', color: '#A08050', textDecoration: 'underline' }}
          >
            {isHindiView ? 'Read in English →' : 'हिंदी में पढ़ें →'}
          </Link>
        </div>
      ) : null}

      <SeoPageLayout
        page={displayPage}
        clusterPages={clusterPages}
        relatedPages={relatedPages}
      />
    </>
  )
}
