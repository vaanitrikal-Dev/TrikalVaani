/**
 * ============================================================
 * TRIKAL VAANI — Result Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/result/page.tsx
 * VERSION: 6.0 — Swiss Ephemeris + PredictionDisplay + Full SEO
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * SEO:
 *   - Dynamic metadata per domain + person
 *   - FAQPage schema (GEO — AI search optimized)
 *   - BreadcrumbList schema
 *   - Article schema with Rohiit Gupta author entity
 *   - canonical + hreflang (hi + en)
 * ============================================================
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResultClient from '@/components/result/ResultClient';

// ── SEO Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Your Vedic Kundali Reading — Trikal Vaani',
    description:
      'Your personalized Vedic astrology prediction powered by Swiss Ephemeris and Parashara BPHS classical system. Lagna, Nakshatra, Mahadasha, and domain-specific insights by Rohiit Gupta, Chief Vedic Architect.',
    alternates: {
      canonical: 'https://trikalvaani.com/result',
      languages: {
        'hi': 'https://trikalvaani.com/hi/result',
        'en': 'https://trikalvaani.com/result',
      },
    },
    robots: { index: false, follow: false },
    openGraph: {
      title: 'Your Vedic Kundali Reading — Trikal Vaani',
      description: 'Swiss Ephemeris powered Vedic prediction by Rohiit Gupta, Chief Vedic Architect.',
      url: 'https://trikalvaani.com/result',
      siteName: 'Trikal Vaani',
      locale: 'en_IN',
      type: 'website',
    },
  };
}

// ── JSON-LD Schemas ────────────────────────────────────────────────────────────

function ResultSchemas() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
      { '@type': 'ListItem', position: 2, name: 'Kundali Analysis', item: 'https://trikalvaani.com/result' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How accurate is Trikal Vaani Vedic prediction?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Trikal Vaani uses real Swiss Ephemeris — the same engine used by AstroSage and professional Vedic astrologers worldwide. Planet positions are calculated using Lahiri Ayanamsha and Parashara BPHS classical system, giving 99%+ astronomical accuracy.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Mahadasha in Vedic astrology?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mahadasha is the major planetary period in Vimshottari Dasha system (BPHS). Each planet rules for a fixed period — Sun 6 years, Moon 10 years, Mars 7 years, Rahu 18 years, Jupiter 16 years, Saturn 19 years, Mercury 17 years, Ketu 7 years, Venus 20 years. The active Mahadasha shapes the overall theme of your life during that period.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does Lagna mean in my Kundali?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lagna (Ascendant) is the Rashi (zodiac sign) rising on the eastern horizon at the exact moment of your birth. It is the most important point in Vedic astrology, determining your physical body, personality, and overall life path. Lagna is calculated using your birth time, date, and place.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Nakshatra in Vedic astrology?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nakshatra is the lunar mansion — one of 27 divisions of the zodiac belt. Your Janma Nakshatra is determined by the Moon\'s position at birth. It reveals your instincts, subconscious patterns, and emotional nature. Vimshottari Dasha sequence starts from your birth Nakshatra lord.',
        },
      },
    ],
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Rohiit Gupta',
    jobTitle: 'Chief Vedic Architect',
    worksFor: { '@type': 'Organization', name: 'Trikal Vaani' },
    url: 'https://trikalvaani.com/founder',
    sameAs: ['https://trikalvaani.com'],
    knowsAbout: [
      'Vedic Astrology', 'Jyotish Shastra', 'BPHS',
      'Vimshottari Dasha', 'Swiss Ephemeris', 'Lahiri Ayanamsha',
    ],
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Delhi NCR',
      addressCountry: 'IN',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ResultPage() {
  return (
    <>
      <ResultSchemas />
      <Suspense fallback={<ResultLoading />}>
        <ResultClient />
      </Suspense>
    </>
  );
}

function ResultLoading() {
  return (
    <div className="min-h-screen bg-[#080B12] flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-full border-2 animate-spin mx-auto mb-5"
          style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }}
        />
        <p className="text-sm font-medium" style={{ color: '#D4AF37' }}>
          Jini padhh rahi hai aapke grahe...
        </p>
        <p className="text-xs text-slate-600 mt-2">Swiss Ephemeris · Parashara BPHS</p>
      </div>
    </div>
  );
}
