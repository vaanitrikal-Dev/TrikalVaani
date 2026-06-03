import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getSeoPageBySlug,
  getClusterPages,
  getRelatedPages,
  getAllPublishedSlugs,
} from '@/lib/seo-content'
import SeoPageLayout from '@/components/seo/SeoPageLayout'

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

  const canonical = `https://trikalvaani.com/learn/${page.slug}`

  return {
    title: `${page.title_en} | Trikaal Vaani`,
    description: page.meta_description,
    keywords: [page.primary_keyword, ...page.secondary_keywords, ...page.lsi_keywords].join(', '),
    authors: [{ name: page.eeat_author, url: 'https://trikalvaani.com/about' }],
    alternates: {
      canonical,
      languages: { 'hi-IN': `https://trikalvaani.com/learn/${page.slug}?lang=hi` },
    },
    openGraph: {
      title: page.title_en,
      description: page.meta_description,
      url: canonical,
      siteName: 'Trikaal Vaani',
      locale: 'en_IN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title_en,
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
  const [page, clusterPages] = await Promise.all([
    getSeoPageBySlug(params.slug),
    getSeoPageBySlug(params.slug).then(p => p ? getClusterPages(p.cluster) : []),
  ])

  if (!page) notFound()

  const relatedPages = await getRelatedPages(page.cluster, page.slug)

  /* ── JSON-LD Schemas ── */
  const schemas: object[] = []

  // Article schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title_en,
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

  // FAQPage schema
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
      { '@type': 'ListItem', position: 4, name: page.title_en, item: `https://trikalvaani.com/learn/${page.slug}` },
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
      <SeoPageLayout
        page={page}
        clusterPages={clusterPages}
        relatedPages={relatedPages}
      />
    </>
  )
}
