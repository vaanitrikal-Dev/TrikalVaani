/**
 * ============================================================
 * TRIKAL VAANI — Root Layout
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/layout.tsx
 * VERSION: 3.0 — Jini + Trikal Voice mounted sitewide + Razorpay preload + GEO schema
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v3.0 CHANGES (May 10, 2026):
 *   - Mounted <TrikalChat /> sitewide (bottom-left floating)
 *   - Mounted <TrikalVoice /> sitewide (bottom-right floating)
 *   - Both lazy-loaded via next/dynamic (ssr:false) — zero LCP impact
 *   - Razorpay checkout.js preloaded for instant modal
 *   - Added Organization + WebApplication + Person JSON-LD (GEO)
 *   - geo.region IN-DL, hreflang hi+en confirmed
 *   - TrustStrip preserved sitewide
 *   - Footer still renders inside each page.tsx (unchanged)
 * ============================================================
 */

import type { Metadata } from 'next';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import './globals.css';

import TrustStrip from '@/components/TrustStrip';

// ── Lazy-load heavy floating widgets — no SSR, no LCP impact ──
const TrikalChat = dynamic(() => import('@/components/Trikal/TrikalChat'), {
  ssr: false,
});
const TrikalVoice = dynamic(() => import('@/components/Trikal/TrikalVoice'), {
  ssr: false,
});

// ── Sitewide metadata (SEO + GEO) ─────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://trikalvaani.com'),
  title: {
    default: 'Trikal Vaani — AI Vedic Astrology by Rohiit Gupta | Delhi NCR',
    template: '%s | Trikal Vaani',
  },
  description:
    'Trikal Vaani is India\'s most accurate AI Vedic astrology platform. Get personalised predictions for career, wealth, marriage, health, and legal matters from Chief Vedic Architect Rohiit Gupta. Voice and text readings starting at ₹11.',
  keywords: [
    'Vedic astrology India',
    'AI astrology prediction',
    'Trikal Vaani',
    'Rohiit Gupta astrologer',
    'voice astrology Hindi',
    'best astrologer Delhi NCR',
    'astrology near me',
    'kundali analysis online',
    'Mahadasha prediction',
    'Vimshottari Dasha reading',
  ],
  authors: [{ name: 'Rohiit Gupta', url: 'https://trikalvaani.com/founder' }],
  creator: 'Rohiit Gupta',
  publisher: 'Trikal Vaani',
  alternates: {
    canonical: '/',
    languages: {
      'en-IN': '/',
      'hi-IN': '/hi',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['hi_IN'],
    url: 'https://trikalvaani.com',
    siteName: 'Trikal Vaani',
    title: 'Trikal Vaani — AI Vedic Astrology by Rohiit Gupta',
    description:
      'India\'s most accurate AI Vedic astrology. Voice & text predictions from ₹11. Powered by Swiss Ephemeris.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Trikal Vaani — AI Vedic Astrology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trikal Vaani — AI Vedic Astrology',
    description: 'India\'s most accurate AI Vedic astrology. From ₹11.',
    images: ['/og-default.jpg'],
    creator: '@TrikalVaani',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'REPLACE_WITH_GSC_TOKEN',
  },
  category: 'Vedic Astrology',
};

// ── GEO + Organization + Person + WebApplication JSON-LD ──────
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://trikalvaani.com/#organization',
  name: 'Trikal Vaani',
  alternateName: 'त्रिकाल वाणी',
  url: 'https://trikalvaani.com',
  logo: 'https://trikalvaani.com/logo.png',
  description:
    'AI-powered Vedic astrology prediction platform serving India. Specialising in career, marriage, wealth, and legal predictions using authentic BPHS classical methods.',
  founder: {
    '@type': 'Person',
    '@id': 'https://trikalvaani.com/founder#person',
    name: 'Rohiit Gupta',
    jobTitle: 'Chief Vedic Architect',
    url: 'https://trikalvaani.com/founder',
    worksFor: { '@id': 'https://trikalvaani.com/#organization' },
    knowsAbout: [
      'Vedic Astrology',
      'Jyotish Shastra',
      'Vimshottari Dasha',
      'Brihat Parashara Hora Shastra',
      'Pratyantar Dasha',
    ],
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9211804111',
    contactType: 'Customer Service',
    areaServed: 'IN',
    availableLanguage: ['Hindi', 'English'],
  },
  areaServed: { '@type': 'Country', name: 'India' },
  sameAs: [
    'https://www.instagram.com/trikalvaani',
    'https://www.youtube.com/@trikalvaani',
    'https://twitter.com/trikalvaani',
  ],
};

const WEBAPPLICATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': 'https://trikalvaani.com/#webapp',
  name: 'Trikal Vaani — AI Vedic Astrology',
  url: 'https://trikalvaani.com',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: [
    {
      '@type': 'Offer',
      name: 'Voice Prediction',
      price: '11',
      priceCurrency: 'INR',
      description: '1 voice question with 90–120 word voice reply by Trikal',
    },
    {
      '@type': 'Offer',
      name: 'Voice Pack 5',
      price: '51',
      priceCurrency: 'INR',
      description: '5 voice or text questions, 7-day validity',
    },
    {
      '@type': 'Offer',
      name: 'Voice Pack 12',
      price: '101',
      priceCurrency: 'INR',
      description: '12 voice or text questions, 30-day validity',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1247',
  },
};

const LOCALBUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://trikalvaani.com/#localbusiness',
  name: 'Trikal Vaani — Best Astrologer Delhi NCR',
  image: 'https://trikalvaani.com/logo.png',
  url: 'https://trikalvaani.com',
  telephone: '+91-9211804111',
  priceRange: '₹11 – ₹501',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    postalCode: '110001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 28.6139,
    longitude: 77.2090,
  },
  areaServed: [
    { '@type': 'City', name: 'New Delhi' },
    { '@type': 'City', name: 'Gurugram' },
    { '@type': 'City', name: 'Noida' },
    { '@type': 'City', name: 'Faridabad' },
    { '@type': 'City', name: 'Ghaziabad' },
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
};

// ── Root Layout ───────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* Sitewide JSON-LD — Organization + WebApp + LocalBusiness */}
        <Script
          id="org-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
        <Script
          id="webapp-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBAPPLICATION_SCHEMA) }}
        />
        <Script
          id="localbusiness-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCALBUSINESS_SCHEMA) }}
        />

        {/* Razorpay checkout — preload sitewide for instant modal */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

        {/* Geo + hreflang */}
        <link rel="alternate" hrefLang="en-IN" href="https://trikalvaani.com" />
        <link rel="alternate" hrefLang="hi-IN" href="https://trikalvaani.com/hi" />
        <link rel="alternate" hrefLang="x-default" href="https://trikalvaani.com" />
        <meta name="geo.region" content="IN-DL" />
        <meta name="geo.placename" content="New Delhi" />
        <meta name="geo.position" content="28.6139;77.2090" />
        <meta name="ICBM" content="28.6139, 77.2090" />

        {/* Preconnects — performance */}
        <link rel="preconnect" href="https://api.razorpay.com" />
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>

      <body className="bg-[#080B12] text-white antialiased">
        {/* Page content */}
        {children}

        {/* Sitewide TrustStrip */}
        <TrustStrip />

        {/* Sitewide floating widgets — Jini (left) + Trikal Voice (right) */}
        <TrikalChat />
        <TrikalVoice />

        {/* NOTE: Footer renders inside each page.tsx — no change needed */}
      </body>
    </html>
  );
}
