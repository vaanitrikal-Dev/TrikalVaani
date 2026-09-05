/**
 * ============================================================
 * TRIKAAL VAANI — SEO Domain Pages Generator
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/[domain]/page.tsx (dynamic engine for all 15 domains)
 * VERSION: 2.7 — SUPABASE MIGRATION (data moved to domain_pages table)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * v2.6 -> v2.7 CHANGES:
 *   - Removed hardcoded DOMAIN_PAGES object (~15 domains) — now fetched from
 *     Supabase table public.domain_pages (slug PK, public-read RLS).
 *   - Removed hardcoded CALCULATOR_LINKS object — now stored per-row in the
 *     calculator_links jsonb column and read from the fetched row.
 *   - Added getDomainPage(slug): fetches one row, maps snake_case -> camelCase
 *     so ALL downstream JSX field names stay identical to v2.6.
 *   - Added getOtherDomains(slug): "Explore Other Life Domains" now queries the
 *     table ordered by sort_order (deterministic), excluding current slug, limit 6.
 *   - generateStaticParams now reads slugs from the table.
 *   - DomainPage is now an async Server Component (awaits the row fetch).
 *   - Uses the CEO-locked shared client from lib/supabase.ts (NOT edited).
 *   - ALL 5 JSON-LD schema blocks, ALL JSX, colors (#080B12 / #D4AF37),
 *     RESERVED_SLUGS guard, ISR revalidate=86400 — UNCHANGED from v2.6.
 *   - IR-0 SAFE: no Delhi NCR, no LocalBusiness/PostalAddress, areaServed
 *     = India + Worldwide, brand text "Trikaal Vaani", logo /Trikal_Logo.png.
 * ============================================================
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export const revalidate = 86400;

const RESERVED_SLUGS = [
  'upcoming-events', 'panchang', 'events', 'blog', 'services',
  'report', 'result', 'founder', 'pricing', 'privacy', 'refund',
  'terms', 'contact', 'about', 'my-cosmic-records', 'hi',
  'calculators', 'api',
];

// ─── Shapes ───────────────────────────────────────────────────────────────────

interface CalculatorLink {
  slug:  string;
  name:  string;
  emoji: string;
}

interface DomainPageConfig {
  slug:            string;
  title:           string;
  h1:              string;
  geoAnswer:       string;
  description:     string;
  planet:          string;
  house:           string;
  bphsRef:         string;
  content:         string;
  faqs:            { q: string; a: string }[];
  ctaText:         string;
  icon:            string;
  keywords:        string[];
  calculatorLinks: CalculatorLink[];
}

interface OtherDomain {
  slug: string;
  icon: string;
  h1:   string;
}

// Raw row shape as stored in Supabase (snake_case)
interface DomainPageRow {
  slug:             string;
  sort_order:       number;
  icon:             string;
  title:            string;
  h1:               string;
  geo_answer:       string;
  description:      string;
  planet:           string;
  house:            string;
  bphs_ref:         string;
  content:          string;
  faqs:             { q: string; a: string }[] | null;
  cta_text:         string;
  keywords:         string[] | null;
  calculator_links: CalculatorLink[] | null;
}

// ─── Mapping: snake_case row -> camelCase config (keeps all JSX field names same)

function mapRowToConfig(row: DomainPageRow): DomainPageConfig {
  return {
    slug:            row.slug,
    title:           row.title,
    h1:              row.h1,
    geoAnswer:       row.geo_answer,
    description:     row.description,
    planet:          row.planet,
    house:           row.house,
    bphsRef:         row.bphs_ref,
    content:         row.content,
    faqs:            row.faqs            ?? [],
    ctaText:         row.cta_text,
    icon:            row.icon,
    keywords:        row.keywords        ?? [],
    calculatorLinks: row.calculator_links ?? [],
  };
}

// ─── Data fetchers ──────────────────────────────────────────────────────────────

async function getDomainPage(slug: string): Promise<DomainPageConfig | null> {
  // v2.8 (05 Sep 2026) — .single() -> .maybeSingle().
  //
  // WHY: this is a catch-all route, so EVERY non-existent top-level URL lands
  // here — old links, typos, bot scans. .single() treats "zero rows" as a
  // failure and returns PostgREST error PGRST116, so each of those logged
  // "[TV-Supabase] getDomainPage error: Cannot coerce the result to a single
  // JSON object". Vercel counted 1,976 of them across 7 days to 05 Sep 2026,
  // the single loudest error on the project — and every one was a URL that was
  // always meant to 404. The behaviour was already correct (null -> notFound(),
  // the visitor got a proper 404 page); only the logging was wrong, and the
  // noise buried real errors like the FestivalPillar may_eat crash.
  //
  // .maybeSingle() returns data: null with NO error for zero rows, so a missing
  // page is silent and a genuine fault (network, RLS, bad column) still logs.
  // Verified 05 Sep 2026: domain_pages holds 15 rows and 15 distinct slugs, so
  // the multiple-rows case this guard also covers cannot currently fire.
  const { data, error } = await supabase
    .from('domain_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[TV-Supabase] getDomainPage error:', error.message);
    return null;
  }
  if (!data) return null;   // no such domain page — notFound() handles it
  return mapRowToConfig(data as DomainPageRow);
}

async function getOtherDomains(slug: string): Promise<OtherDomain[]> {
  const { data, error } = await supabase
    .from('domain_pages')
    .select('slug, icon, h1, sort_order')
    .neq('slug', slug)
    .order('sort_order', { ascending: true })
    .limit(6);

  if (error || !data) {
    if (error) console.error('[TV-Supabase] getOtherDomains error:', error.message);
    return [];
  }
  return (data as { slug: string; icon: string; h1: string }[]).map(d => ({
    slug: d.slug,
    icon: d.icon,
    h1:   d.h1,
  }));
}

interface Props {
  params: { domain: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = await getDomainPage(params.domain);
  if (!config) return { title: 'Trikaal Vaani' };

  return {
    // ⬇ FIX 6 (v2.1): title.absolute prevents layout.tsx template from adding | Trikaal Vaani suffix
    title: { absolute: config.title },
    description: config.description,
    keywords:    config.keywords,
    authors:     [{ name: 'Rohiit Gupta', url: 'https://trikalvaani.com/founder' }],
    alternates: {
      canonical: `https://trikalvaani.com/${config.slug}`,
      languages: {
        'hi': `https://trikalvaani.com/hi/${config.slug}`,
        'en': `https://trikalvaani.com/${config.slug}`,
      },
    },
    openGraph: {
      title:       config.title,
      description: config.description,
      url:         `https://trikalvaani.com/${config.slug}`,
      siteName:    'Trikaal Vaani',
      locale:      'en_IN',
      type:        'article',
      images: [
        {
          url: 'https://trikalvaani.com/og-image.png',
          width: 1200,
          height: 630,
          alt: config.h1,
        },
      ],
    },
    twitter: {
      card:        'summary_large_image',
      title:       config.title,
      description: config.description,
      images: ['https://trikalvaani.com/og-image.png'],
    },
  };
}

export async function generateStaticParams() {
  const { data, error } = await supabase
    .from('domain_pages')
    .select('slug');

  if (error || !data) {
    if (error) console.error('[TV-Supabase] generateStaticParams error:', error.message);
    return [];
  }
  return (data as { slug: string }[]).map(row => ({ domain: row.slug }));
}

export default async function DomainPage({ params }: Props) {
  if (RESERVED_SLUGS.includes(params.domain)) notFound();

  const config = await getDomainPage(params.domain);
  if (!config) notFound();

  const otherDomains = await getOtherDomains(config.slug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://trikalvaani.com' },
      { '@type': 'ListItem', position: 2, name: config.h1, item: `https://trikalvaani.com/${config.slug}` },
    ],
  };

  const articleSchema = {
    '@context':       'https://schema.org',
    '@type':          'Article',
    headline:          config.h1,
    description:       config.description,
    image: {
      '@type': 'ImageObject',
      url:     'https://trikalvaani.com/og-image.png',
      width:   1200,
      height:  630,
    },
    author: {
      '@type':   'Person',
      name:      'Rohiit Gupta',
      jobTitle:  'Chief Vedic Architect',
      url:       'https://trikalvaani.com/founder',
      knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'BPHS', 'Swiss Ephemeris', 'Vimshottari Dasha'],
    },
    publisher: {
      '@type': 'Organization',
      name:    'Trikaal Vaani',
      url:     'https://trikalvaani.com',
      logo:    'https://trikalvaani.com/Trikal_Logo.png',
    },
    mainEntityOfPage: `https://trikalvaani.com/${config.slug}`,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: config.faqs.map(faq => ({
      '@type': 'Question',
      name:    faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const serviceSchema = {
    '@context':  'https://schema.org',
    '@type':     'Service',
    name:         `${config.h1} — Trikaal Vaani`,
    description:  config.description,
    provider: {
      '@type':   'Person',
      '@id':     'https://trikalvaani.com/#rohiit-gupta',
      name:      'Rohiit Gupta',
      jobTitle:  'Chief Vedic Architect',
      url:       'https://trikalvaani.com/founder',
    },
    serviceType: 'Vedic Astrology Prediction',
    areaServed:  ['India', 'Worldwide'],
    url:         `https://trikalvaani.com/${config.slug}`,
  };

  // ⬇ SESSION E2: HowTo Schema for voice search + smart speaker citation
  const howToSchema = {
    '@context':    'https://schema.org',
    '@type':       'HowTo',
    name:           `How to Get a Vedic ${config.h1} Reading on Trikaal Vaani`,
    description:    `Get a personalized Vedic astrology reading for ${config.h1.toLowerCase()} using Swiss Ephemeris precision and Rohiit Gupta's BPHS framework.`,
    image:          'https://trikalvaani.com/og-image.png',
    totalTime:      'PT60S',
    estimatedCost: {
      '@type':    'MonetaryAmount',
      currency:   'INR',
      value:      '0',
    },
    supply: [
      { '@type': 'HowToSupply', name: 'Date of birth' },
      { '@type': 'HowToSupply', name: 'Exact time of birth' },
      { '@type': 'HowToSupply', name: 'Place of birth' },
    ],
    tool: { '@type': 'HowToTool', name: 'Trikaal Vaani AI' },
    step: [
      {
        '@type':   'HowToStep',
        position:  1,
        name:      'Open Trikaal Vaani',
        text:      'Visit trikalvaani.com — no signup, no credit card required.',
        url:       'https://trikalvaani.com#birth-form',
      },
      {
        '@type':   'HowToStep',
        position:  2,
        name:      'Enter your birth details',
        text:      'Type your name, date of birth, exact time, and place of birth. The form auto-completes your city.',
        url:       'https://trikalvaani.com#birth-form',
      },
      {
        '@type':   'HowToStep',
        position:  3,
        name:      `Select ${config.h1}`,
        text:      `Choose the ${config.h1.toLowerCase()} life domain — analysis focuses on ${config.house} and ${config.planet}.`,
        url:       `https://trikalvaani.com/${config.slug}`,
      },
      {
        '@type':   'HowToStep',
        position:  4,
        name:      'Receive Vedic prediction',
        text:      `Trikaal Vaani computes your kundali and delivers a personalized ${config.h1.toLowerCase()} reading based on ${config.bphsRef}.`,
        url:       'https://trikalvaani.com',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <div className="min-h-screen" style={{ background: '#080B12', color: '#e2e8f0' }}>

        <div className="max-w-4xl mx-auto px-4 pt-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color: '#D4AF37' }}>{config.h1}</span>
          </nav>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">{config.icon}</div>
            <h1 className="text-3xl font-bold text-white mb-3">{config.h1}</h1>
            <div className="max-w-2xl mx-auto mt-4 p-4 rounded-xl text-left"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-xs text-amber-500 font-semibold mb-2 uppercase tracking-wider">Vedic Astrology Answer</p>
              <p className="text-sm text-slate-300 leading-relaxed">{config.geoAnswer}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { label: 'Key Planet', value: config.planet },
              { label: 'Primary House', value: config.house },
              { label: 'Classical Source', value: config.bphsRef },
            ].map(chip => (
              <div key={chip.label} className="px-4 py-2 rounded-full text-xs"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <span style={{ color: '#64748b' }}>{chip.label}: </span>
                <span style={{ color: '#D4AF37' }}>{chip.value}</span>
              </div>
            ))}
          </div>

          <div className="text-center mb-10">
            <Link href="/#birth-form"
              className="inline-block px-8 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}>
              {config.ctaText} — Free 🔱
            </Link>
            <p className="text-xs text-slate-500 mt-2">Swiss Ephemeris accuracy | BPHS classical analysis</p>
          </div>

          <article className="rounded-2xl p-6 sm:p-8 mb-8"
            style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-4 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                By Rohiit Gupta, Chief Vedic Architect
              </span>
            </div>
            <div className="prose prose-invert max-w-none">
              {config.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-slate-300 mb-4">{para}</p>
              ))}
            </div>
          </article>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-5">Frequently Asked Questions — {config.h1}</h2>
            <div className="space-y-4">
              {config.faqs.map((faq, i) => (
                <div key={i} className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 className="text-sm font-semibold text-white flex items-start gap-2">
                      <span style={{ color: '#D4AF37', flexShrink: 0 }}>Q.</span>
                      {faq.q}
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                      <span style={{ color: '#22c55e', flexShrink: 0 }}>A.</span>
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))', border: '1px solid rgba(212,175,55,0.25)' }}>
            <div className="text-3xl mb-3">🔱</div>
            <h2 className="text-xl font-bold text-white mb-2">Get Your Personal {config.h1} Reading</h2>
            <p className="text-sm text-slate-400 mb-5">
              Swiss Ephemeris accuracy + BPHS classical analysis + Bhrigu Nandi patterns.<br/>
              By Rohiit Gupta, Chief Vedic Architect
            </p>
            <Link href="/#birth-form"
              className="inline-block px-8 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}>
              {config.ctaText} — Free Reading 🔱
            </Link>
            <p className="text-xs text-slate-600 mt-3">No credit card. Instant results.</p>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Related Free Calculators</h3>
            <div className="flex flex-wrap gap-2">
              {(config.calculatorLinks || []).map(calc => (
                <Link key={calc.slug} href={`/calculators/${calc.slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs hover:text-amber-300 transition-colors"
                  style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}>
                  {calc.emoji} {calc.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Explore Other Life Domains</h3>
            <div className="flex flex-wrap gap-2">
              {otherDomains.map(d => (
                <Link key={d.slug} href={`/${d.slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-amber-400 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {d.icon} {d.h1.split(' ')[0]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
