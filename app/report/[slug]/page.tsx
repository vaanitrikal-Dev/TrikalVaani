/**
 * ============================================================
 * TRIKAAL VAANI — Public SEO Result Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/report/[slug]/page.tsx
 * VERSION: 3.3 — indexability follows is_public ONLY (v3.2 read a dead column)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * v3.1 -> v3.2 CHANGES (09 Sep 2026):
 *   TWO changes, and together they turn two dead database columns into a
 *   working publish switch.
 *
 *   1. getReport() no longer filters on is_public. It used to, and that made
 *      the flag self-defeating: marking a report is_public=false to keep it out
 *      of Google ALSO hid it from the customer who had paid for it. So every
 *      report had to stay public, and selective publishing was impossible.
 *      Access is now the slug itself, which carries a 5-character random uid
 *      (lib/slug.ts) — the unlisted-link model.
 *
 *   2. The robots meta was hardcoded index:true, so a report could never be
 *      excluded from the index at all. It now follows is_public.
 *
 *   v3.2 -> v3.3 CORRECTION (same day): v3.2 required is_indexed !== false as
 *   well. That was a mistake made without checking the data. route.ts has
 *   written is_indexed:false on every row since it was built and nothing read
 *   it, so the value means "never set", not "do not index" — 456 of 526 rows
 *   carry it. v3.2 would therefore have put a noindex on 87% of the published
 *   reports while app/sitemap.ts kept submitting them, which is the site
 *   telling Google two opposite things about one page. v3.3 reads is_public
 *   only, which is the same column the sitemap selects on, so the two can
 *   never disagree.
 *
 *   BEHAVIOUR FOR EXISTING ROWS IS UNCHANGED. Both checks use `!== false`, so
 *   a null or true keeps today's behaviour exactly. Only a row explicitly
 *   flagged false behaves differently — and no such row exists yet.
 *
 *   WHY IT WAS NEEDED: a minor's reading, carrying a name, birth date and city,
 *   is currently submitted to Google, Bing and every AI crawler like any other
 *   page. There was no mechanism to exclude one. Now there is; the route change
 *   that uses it is separate and comes next.
 * ============================================================
 * v3.0 -> v3.1 CHANGES (CEO approved):
 *   - REMOVED `other: { geo.region: 'IN-DL', geo.placename: 'Delhi NCR' }`
 *     (local-business geo-targeting signal — violates IR-0).
 *   - REMOVED PostalAddress block from personSchema (LocalBusiness signal).
 *   - Visible brand "Trikaal Vaani" -> "Trikaal Vaani" in OG siteName,
 *     publisher name, worksFor name, OG image alt, not-found titles.
 *   - keywords token 'trikal vaani' -> 'trikaal vaani'.
 *   - Domain/URLs trikalvaani.com, logo & founder URLs: UNTOUCHED.
 *   - All v3.0 data-fetch, schema, and render logic preserved.
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
  // v3.2 — the two flags this page now actually honours. They were always in
  // the row (the query is select('*')); they were simply never read.
  is_public:           boolean | null
  is_indexed:          boolean | null
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
    // v3.2 — is_public NO LONGER GATES DELIVERY.
    // It used to. That made the flag unusable: setting is_public=false to keep
    // a report out of Google also hid it from the person who had PAID for it,
    // so in practice every report had to stay is_public=true and there was no
    // way to publish selectively at all.
    // The slug is the access control. lib/slug.ts builds it as
    // [domain]-[mahadasha]-[antardasha]-[city]-[year]-[5char-uid]; the uid makes
    // it unguessable, which is the same "unlisted link" model used for a private
    // video. is_public and is_indexed now decide DISCOVERABILITY only —
    // the sitemap and the robots meta below — never access.
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
    return { title: { absolute: 'Report Not Found | Trikaal Vaani' } }
  }

  const report = await getReport(params.slug)
  if (!report) return { title: { absolute: 'Report Not Found | Trikaal Vaani' } }

  // v3.3 — ONE FLAG, ONE MEANING. This reads is_public ONLY.
  //
  // v3.2 also required is_indexed !== false, which was wrong and would have
  // been damaging. app/api/predict/route.ts has written is_indexed:false on
  // every row since it was built and nothing ever read it, so `false` there
  // does not mean "do not index" — it means "nobody ever set this". At the
  // time of writing 456 of 526 rows carry that value. Honouring it would have
  // put a noindex on 87% of the published reports, and app/sitemap.ts would
  // have gone on submitting the same URLs — the site telling Google two
  // opposite things about the same page.
  //
  // is_public is now the single switch, and it is the SAME column sitemap.ts
  // already selects on, so the sitemap and the robots meta can never disagree.
  // is_indexed is left in the type and untouched; if it is ever populated
  // deliberately it can be added back here, but not before the data means
  // something.
  const indexable = (report.is_public !== false)

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
    // v6.1 (06 Sep 2026): `absolute` bypasses app/layout.tsx's
    // title.template = "%s | Trikaal Vaani". A plain string here got the brand
    // appended on top of the brand generateSeoMeta already carried, rendering
    // "... | Trikaal Vaani | Trikaal Vaani" at 102 chars. lib/slug.ts v1.2 now
    // owns the whole title, brand included, and keeps it inside 58 chars —
    // so nothing further may be appended to it.
    title:       { absolute: meta.title },
    description: meta.description,
    alternates:  { canonical: meta.canonical },
    openGraph: {
      title:       meta.title,
      description: meta.description,
      url:         meta.canonical,
      siteName:    'Trikaal Vaani',
      locale:      'en_IN',
      type:        'article',
      images: [{
        url:    'https://trikalvaani.com/og-report.jpg',
        width:  1200,
        height: 630,
        alt:    `${report.domain_label} Vedic Astrology Report | Trikaal Vaani`,
      }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       meta.title,
      description: meta.description,
    },
    // v3.2 — was hardcoded index:true, which meant the is_indexed column was
    // written on every row and read by nothing. A report could be marked
    // not-indexed in the database and still tell Google to index it.
    // Now: a report is indexable only when BOTH flags allow it. Anything else
    // is served normally to whoever holds the link and told not to be indexed.
    robots: indexable
      ? {
          index:  true,
          follow: true,
          googleBot: {
            index:               true,
            follow:              true,
            'max-snippet':       -1,
            'max-image-preview': 'large',
          },
        }
      : {
          index:  false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false },
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
      name:    'Trikaal Vaani',
      url:     'https://trikalvaani.com',
      logo: { '@type': 'ImageObject', url: 'https://trikalvaani.com/images/founder.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: [...primaryKw, ...transKw, 'vedic astrology', 'kundali', 'jyotish', 'trikaal vaani'].join(', '),
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
          text:    `According to Vedic astrology (BPHS), ${report.mahadasha} Mahadasha combined with ${report.antardasha} Antardasha creates specific planetary influences on ${report.domain_label}. Analyzed by Rohiit Gupta at Trikaal Vaani using Swiss Ephemeris.`,
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
    worksFor: { '@type': 'Organization', name: 'Trikaal Vaani', url: 'https://trikalvaani.com' },
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
