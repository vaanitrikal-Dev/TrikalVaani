/**
 * ============================================================
 * TRIKAL VAANI — Public SEO Result Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/report/[slug]/page.tsx
 * VERSION: 3.0 — TypeScript clean, Next.js 13.5 compatible
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ReportPublicClient from './ReportPublicClient'
import { generateSeoMeta, isValidSlug } from '@/lib/slug'

// ── Types ─────────────────────────────────────────────────────────────────────

type ReportRow = {
  id:                  string
  public_slug:         string
  domain_id:           string
  domain_label:        string
  person_name:         string
  dob:                 string
  birth_city:          string
  lagna:               string
  nakshatra:           string
  mahadasha:           string
  antardasha:          string
  tier:                string
  language:            string
  seo_title:           string | null
  seo_description:     string | null
  geo_answer:          string | null
  faq_schema:          unknown
  geo_direct_answer:   unknown
  simple_summary:      unknown
  seo_signals:         unknown
  professional_english:unknown
  synthesis:           unknown
  kundali_meta:        unknown
  created_at:          string
  public_views:        number
}

// ── Supabase ──────────────────────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getReport(slug: string): Promise<ReportRow | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single()

  if (error || !data) return null

  // Fire and forget view count
  supabase
    .from('predictions')
    .update({ public_views: ((data as ReportRow).public_views ?? 0) + 1 })
    .eq('public_slug', slug)
    .then(() => {})

  return data as ReportRow
}

// ── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  if (!isValidSlug(params.slug)) {
    return { title: 'Report Not Found | Trikal Vaani' }
  }

  const report = await getReport(params.slug)
  if (!report) return { title: 'Report Not Found | Trikal Vaani' }

  const geoAnswer = report.geo_answer ?? `Vedic astrology ${report.domain_label} analysis for ${report.birth_city}. Powered by Swiss Ephemeris.`

  const meta = generateSeoMeta(
    params.slug,
    report.domain_id,
    report.mahadasha,
    report.antardasha,
    report.birth_city ?? 'India',
    geoAnswer,
  )

  return {
    title:       meta.title,
    description: meta.description,
    alternates:  { canonical: meta.canonical },
    openGraph: {
      title:       meta.title,
      description: meta.description,
      url:         meta.canonical,
      siteName:    'Trikal Vaani',
      locale:      'en_IN',
      type:        'article',
      images: [{
        url:    'https://trikalvaani.com/og-report.jpg',
        width:  1200,
        height: 630,
        alt:    `${report.domain_label} Vedic Astrology Report | Trikal Vaani`,
      }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       meta.title,
      description: meta.description,
    },
    robots: {
      index:  true,
      follow: true,
      googleBot: {
        index:               true,
        follow:              true,
        'max-snippet':       -1,
        'max-image-preview': 'large',
      },
    },
    other: {
      'geo.region':    'IN-DL',
      'geo.placename': 'Delhi NCR',
    },
  }
}

// ── Schema builder ────────────────────────────────────────────────────────────

function buildSchema(report: ReportRow, meta: ReturnType<typeof generateSeoMeta>) {
  const url          = meta.canonical
  const datePublished = report.created_at ?? new Date().toISOString()
  const geoAnswer    = report.geo_answer ?? ''
  const ss           = report.simple_summary as Record<string, unknown> | null
  const summaryText  = (ss?.text as string) ?? ''
  const seoSig       = report.seo_signals as Record<string, unknown> | null
  const targetQ      = (seoSig?.targetQuestion as string) ?? `What does Vedic astrology say about ${report.domain_label}?`
  const primaryKw    = (seoSig?.primaryKeywords as string[]) ?? []
  const transKw      = (seoSig?.transactionalKeywords as string[]) ?? []

  const articleSchema = {
    '@context':  'https://schema.org',
    '@type':     'Article',
    headline:    meta.title,
    description: meta.description,
    url,
    datePublished,
    dateModified: datePublished,
    inLanguage:  'en-IN',
    author: {
      '@type':   'Person',
      name:      'Rohiit Gupta',
      jobTitle:  'Chief Vedic Architect',
      url:       'https://trikalvaani.com/founder',
    },
    publisher: {
      '@type': 'Organization',
      name:    'Trikal Vaani',
      url:     'https://trikalvaani.com',
      logo: { '@type': 'ImageObject', url: 'https://trikalvaani.com/images/founder.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: [...primaryKw, ...transKw, 'vedic astrology', 'kundali', 'jyotish', 'trikal vaani'].join(', '),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name:    targetQ,
        acceptedAnswer: {
          '@type': 'Answer',
          text:    geoAnswer || summaryText.slice(0, 300),
        },
      },
      {
        '@type': 'Question',
        name:    `What is ${report.mahadasha} Mahadasha effect on ${report.domain_label}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:    `According to Vedic astrology (BPHS), ${report.mahadasha} Mahadasha combined with ${report.antardasha} Antardasha creates specific planetary influences on ${report.domain_label}. Analyzed by Rohiit Gupta at Trikal Vaani using Swiss Ephemeris.`,
        },
      },
    ],
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://trikalvaani.com' },
      { '@type': 'ListItem', position: 2, name: 'Reports', item: 'https://trikalvaani.com/report' },
      { '@type': 'ListItem', position: 3, name: report.domain_label, item: url },
    ],
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type':    'Person',
    name:       'Rohiit Gupta',
    jobTitle:   'Chief Vedic Architect',
    url:        'https://trikalvaani.com/founder',
    worksFor: { '@type': 'Organization', name: 'Trikal Vaani', url: 'https://trikalvaani.com' },
    address:  { '@type': 'PostalAddress', addressLocality: 'Delhi NCR', addressCountry: 'IN' },
    knowsAbout: ['Vedic Astrology', 'Jyotish', 'BPHS', 'Swiss Ephemeris', 'Bhrigu Nandi Nadi'],
  }

  return [articleSchema, faqSchema, breadcrumbSchema, personSchema]
}

// ── Page Component ────────────────────────────────────────────────────────────

export default async function ReportPage(
  { params }: { params: { slug: string } }
) {
  if (!isValidSlug(params.slug)) notFound()

  const report = await getReport(params.slug)
  if (!report) notFound()

  const geoAnswer = report.geo_answer ?? ''
  const meta = generateSeoMeta(
    params.slug,
    report.domain_id,
    report.mahadasha,
    report.antardasha,
    report.birth_city ?? 'India',
    geoAnswer,
  )

  const schemas = buildSchema(report, meta)

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ReportPublicClient
        report={report as unknown as Record<string, unknown>}
        slug={params.slug}
        meta={meta}
      />
    </>
  )
}

export const revalidate = 0
// v5.0 cache bust — May 5 2026
