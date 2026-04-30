/**
 * ============================================================
 * TRIKAL VAANI — Public SEO Result Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/report/[slug]/page.tsx
 * VERSION: 1.0 — SSR + Schema + GEO indexable result page
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * SEO STRATEGY:
 *   - Google sees: geoDirectAnswer + simpleSummary + seoSignals
 *   - User sees: teaser + "Unlock ₹51" CTA
 *   - Schema: Article + FAQ + BreadcrumbList + Person
 *   - Canonical: trikalvaani.com/report/[slug]
 *   - Sensitive data: NEVER exposed (no mobile, no exact birth time)
 * ============================================================
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ReportPublicClient from './ReportPublicClient'
import { generateSeoMeta, isValidSlug } from '@/lib/slug'

// ── Supabase server client ─────────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Fetch report data ─────────────────────────────────────────────────────────

async function getReport(slug: string) {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('public_report_view')
    .select('*')
    .eq('public_slug', slug)
    .single()

  if (error || !data) return null

  // Increment view count (fire and forget)
  supabase
    .from('predictions')
    .update({ public_views: (data.public_views ?? 0) + 1 })
    .eq('public_slug', slug)
    .then(() => {})

  return data
}

// ── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  if (!isValidSlug(params.slug)) return { title: 'Report Not Found | Trikal Vaani' }

  const report = await getReport(params.slug)
  if (!report) return { title: 'Report Not Found | Trikal Vaani' }

  const meta = generateSeoMeta(
    params.slug,
    report.domain_id,
    report.mahadasha,
    report.antardasha,
    report.birth_city ?? 'India',
    report.geo_answer ?? report.geo_direct_answer,
  )

  const geoAnswer = report.geo_answer
    ?? report.geo_direct_answer
    ?? `Vedic astrology ${report.domain_label} analysis for ${report.birth_city}. Powered by Swiss Ephemeris.`

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
        url:   'https://trikalvaani.com/og-report.jpg',
        width: 1200, height: 630,
        alt:   `${report.domain_label} Vedic Astrology Report | Trikal Vaani`,
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
      googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
    },
    other: {
      'geo.region':   'IN-DL',
      'geo.placename':'Delhi NCR',
    },
  }
}

// ── JSON-LD Schema builder ────────────────────────────────────────────────────

function buildSchema(report: any, slug: string, meta: ReturnType<typeof generateSeoMeta>) {
  const url         = meta.canonical
  const datePublished = report.created_at ?? new Date().toISOString()
  const geoAnswer   = report.geo_answer ?? report.geo_direct_answer ?? ''
  const summary     = report.simple_summary?.text ?? ''
  const targetQ     = report.seo_signals?.targetQuestion ?? `What does Vedic astrology say about ${report.domain_label}?`

  // Article Schema
  const articleSchema = {
    '@context':       'https://schema.org',
    '@type':          'Article',
    headline:         meta.title,
    description:      meta.description,
    url,
    datePublished,
    dateModified:     datePublished,
    inLanguage:       'en-IN',
    author: {
      '@type': 'Person',
      name:    'Rohiit Gupta',
      jobTitle:'Chief Vedic Architect',
      url:     'https://trikalvaani.com/founder',
      sameAs:  ['https://trikalvaani.com/founder'],
    },
    publisher: {
      '@type': 'Organization',
      name:    'Trikal Vaani',
      url:     'https://trikalvaani.com',
      logo: {
        '@type': 'ImageObject',
        url:     'https://trikalvaani.com/images/founder.png',
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    about: {
      '@type': 'Thing',
      name:    `${report.domain_label} Vedic Astrology Analysis`,
    },
    mentions: [
      { '@type': 'Thing', name: 'Vedic Astrology' },
      { '@type': 'Thing', name: 'Swiss Ephemeris' },
      { '@type': 'Thing', name: 'Brihat Parashara Hora Shastra' },
      { '@type': 'Thing', name: report.mahadasha + ' Mahadasha' },
    ],
    keywords: [
      ...(report.seo_signals?.primaryKeywords ?? []),
      ...(report.seo_signals?.transactionalKeywords ?? []),
      'vedic astrology', 'kundali', 'jyotish', 'trikal vaani',
    ].join(', '),
  }

  // FAQ Schema — from geoDirectAnswer + targetQuestion
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name:    targetQ,
        acceptedAnswer: {
          '@type': 'Answer',
          text:    geoAnswer || summary.slice(0, 300),
        },
      },
      {
        '@type': 'Question',
        name:    `What is ${report.mahadasha} Mahadasha effect on ${report.domain_label}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:    `According to Vedic astrology (BPHS), ${report.mahadasha} Mahadasha combined with ${report.antardasha} Antardasha creates specific planetary influences on ${report.domain_label}. This analysis by Rohiit Gupta at Trikal Vaani uses Swiss Ephemeris for precise calculations.`,
        },
      },
      {
        '@type': 'Question',
        name:    `How accurate is Vedic astrology for ${report.domain_label} prediction?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:    'Trikal Vaani uses Swiss Ephemeris — the same engine used by professional astrologers worldwide — combined with Brihat Parashara Hora Shastra (BPHS) classical rules for maximum accuracy.',
        },
      },
    ],
  }

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',          item: 'https://trikalvaani.com' },
      { '@type': 'ListItem', position: 2, name: 'Reports',       item: 'https://trikalvaani.com/report' },
      { '@type': 'ListItem', position: 3, name: report.domain_label, item: url },
    ],
  }

  // Person Schema — Rohiit Gupta authority
  const personSchema = {
    '@context':  'https://schema.org',
    '@type':     'Person',
    name:        'Rohiit Gupta',
    jobTitle:    'Chief Vedic Architect',
    description: 'Vedic Astrologer and founder of Trikal Vaani — AI-powered Vedic Astrology platform. Expert in Brihat Parashara Hora Shastra, Swiss Ephemeris, and Bhrigu Nandi Nadi.',
    url:         'https://trikalvaani.com/founder',
    worksFor: {
      '@type': 'Organization',
      name:    'Trikal Vaani',
      url:     'https://trikalvaani.com',
    },
    address: {
      '@type':           'PostalAddress',
      addressLocality:   'Delhi NCR',
      addressCountry:    'IN',
    },
    knowsAbout: ['Vedic Astrology', 'Jyotish', 'BPHS', 'Swiss Ephemeris', 'Bhrigu Nandi Nadi'],
  }

  return [articleSchema, faqSchema, breadcrumbSchema, personSchema]
}

// ── Page Component ────────────────────────────────────────────────────────────

export default async function ReportPage(
  { params }: { params: { slug: string } }
) {
  // Validate slug format
  if (!isValidSlug(params.slug)) notFound()

  const report = await getReport(params.slug)
  if (!report) notFound()

  const meta = generateSeoMeta(
    params.slug,
    report.domain_id,
    report.mahadasha,
    report.antardasha,
    report.birth_city ?? 'India',
    report.geo_answer ?? report.geo_direct_answer,
  )

  const schemas = buildSchema(report, params.slug, meta)

  return (
    <>
      {/* JSON-LD Schema injection */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Public report UI */}
      <ReportPublicClient
        report={report}
        slug={params.slug}
        meta={meta}
      />
    </>
  )
}

// ── ISR — revalidate every 24 hours ──────────────────────────────────────────
export const revalidate = 86400
