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
   TRIKAL VAANI — /learn/[slug]
   VERSION: 2.0 — PATH A BILINGUAL (5 Sep 2026)
   SIGNED: ROHIIT GUPTA, CEO
   ============================================================
   WHY v2.0 EXISTS — this route was throwing 500s in production:

     GET /learn/inheritance-wealth-prediction  500 [error/serverless]
       Page changed from static to dynamic at runtime,
       reason: searchParams.lang
     GET /learn/jupiter-leo-2026-12-rashis     500 [error/serverless]
       Page changed from static to dynamic at runtime,
       reason: no-store fetch .../seo_pillar_pages?select=*&slug=eq...

   TWO CAUSES, BOTH FIXED:
     (1) THIS FILE read `searchParams.lang` in generateMetadata AND in the page
         component, while also exporting generateStaticParams() + revalidate.
         Next.js prerenders such a route; touching searchParams at runtime is a
         hard contradiction and Next bails with a 500. v2.0 removes searchParams
         from this file entirely.
     (2) lib/seo-content.ts forced `cache: 'no-store'`, which is the same
         contradiction from the data side. Fixed there in v3 of that file
         (now `next: { revalidate: 300, tags: ['seo-pages'] }`).
         BOTH files must ship together — fixing only one leaves the 500.

   WHAT THIS MEANS FOR HINDI — PATH A, decided by Rohiit:
     The legacy `?lang=hi` query-param toggle is GONE. Hindi now lives the way
     it already does everywhere else on this codebase: a fully separate row with
     its own indexable URL, pointed to by the `hindi_slug` column. The
     "हिंदी में पढ़ें" link below already preferred hindi_slug; it is now the
     only mechanism, so there is one Hindi URL per page and Google can index it.

     Query-param language variants were never going to rank — Google treats
     /learn/x and /learn/x?lang=hi as the same URL. A real Hindi slug is the
     whole point of Path A.

   MIGRATION STATE AT TIME OF WRITING (measured against Supabase, 5 Sep 2026):
     seo_pillar_pages: 133 rows, all published
       • 16 rows have hindi_slug  -> Path A ready, Hindi link works
       • 41 rows have legacy title_hi + body_content_hi
       • only 2 rows have both
     So ~39 pages lose their (unindexable) ?lang=hi view until a hindi_slug is
     filled in for them. Their Hindi TEXT is not deleted — body_content_hi and
     title_hi stay in the table, untouched, ready to be promoted into real
     Hindi rows. This is a content task, not a code task.

   ALSO FIXED HERE: getSeoPageBySlug was being called THREE times per render
     (once in generateMetadata, twice inside the page's own Promise.all — the
     second call re-fetched the identical row purely to read .cluster). With
     no-store that was 3 uncached Postgres round trips per request. The page
     now fetches once.
   ============================================================ */

export const revalidate = 86400

interface Props {
  params: { slug: string }
}

/* ── generateStaticParams ── */
export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

/* ── generateMetadata ── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getSeoPageBySlug(params.slug)
  if (!page) return {}

  // v2.0: one page, one language, one canonical. The Hindi twin is its own
  // URL (see hindi_slug) and carries its own metadata.
  const displayTitle = page.title_en
  const canonical = `https://trikalvaani.com/learn/${page.slug}`

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
        // v2.0: hreflang now points at the REAL Hindi URL (Path A). Previously
        // it advertised ?lang=hi, which Google folds into the English URL —
        // an hreflang pair that pointed at itself.
        ...(page.hindi_slug
          ? { 'hi-IN': `https://trikalvaani.com/blog/${page.hindi_slug}` }
          : {}),
      },
    },
    openGraph: {
      title: displayTitle,
      description: page.meta_description,
      url: canonical,
      siteName: 'Trikaal Vaani',
      locale: 'en_IN',
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
export default async function SeoLearnPage({ params }: Props) {
  // v2.0: ONE fetch. The old code called getSeoPageBySlug twice inside this
  // Promise.all — the second call re-fetched the same row only to read
  // .cluster — and generateMetadata makes a third. React's cache() would have
  // de-duplicated them but this repo pins react 18.2.0, where cache() is not
  // available. Sequencing the cluster/related fetches off the single row is
  // the fix that works here.
  const page = await getSeoPageBySlug(params.slug)

  if (!page) notFound()

  const [clusterPages, relatedPages] = await Promise.all([
    getClusterPages(page.cluster),
    getRelatedPages(page.cluster, page.slug),
  ])

  // v2.0: no ?lang=hi swap. This page is the English page; Hindi is its own
  // URL. displayPage is kept as a named binding so SeoPageLayout and the
  // schema blocks below stay byte-identical to v1.
  const displayPage = page

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
    inLanguage: 'en-IN',
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

      {/* ── Hindi link — Path A only (v2.0) ────────────────────────────────
          The legacy `?lang=hi` fallback branch is removed. It rendered a link
          to a URL that now 500s, and even when it worked Google folded it into
          the English URL, so it never earned a Hindi ranking.

          Rows that still carry title_hi / body_content_hi but no hindi_slug
          simply show no Hindi link until their Hindi twin row is created and
          hindi_slug is filled in. Their Hindi text is still in the table. */}
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
      ) : null}

      <SeoPageLayout
        page={displayPage}
        clusterPages={clusterPages}
        relatedPages={relatedPages}
      />
    </>
  )
}
