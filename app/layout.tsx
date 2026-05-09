/**
 * =============================================================
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE: app/layout.tsx
 * Version: 2.1 — Title aligned to "Free AI Kundli & Horoscope Predictions"
 * Last Updated: May 2026
 * 🔱 JAI MAA SHAKTI
 *
 * NOTES FOR ROHIIT JI:
 * - REPLACES: existing app/layout.tsx
 * - All metadata threaded with new title for consistent SEO signal
 * - Sitewide schemas: Organization + WebSite (with SearchAction)
 * - Hindi locale alternate + Delhi NCR geo signals
 * - DOES NOT TOUCH: gemini-prompt.ts (LOCKED), verifiedTier, BirthForm
 * =============================================================
 */

import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css'; // your existing globals — keep path same

// ──────────────────────────────────────────────────────────────
// SITEWIDE METADATA DEFAULTS (overridden per page)
// ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://trikalvaani.com'),
  title: {
    default: 'Free AI Kundli & Horoscope Predictions | Trikal Vaani',
    template: '%s | Trikal Vaani',
  },
  description:
    'Get your free AI kundli and horoscope predictions instantly. Swiss Ephemeris–powered Vedic astrology by Rohiit Gupta, Chief Vedic Architect (Delhi NCR). 8 deep readings starting ₹51.',
  authors: [{ name: 'Rohiit Gupta', url: 'https://trikalvaani.com/founder' }],
  creator: 'Rohiit Gupta',
  publisher: 'Trikal Vaani',
  applicationName: 'Trikal Vaani',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
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
  alternates: {
    canonical: 'https://trikalvaani.com',
    languages: {
      'en-IN': 'https://trikalvaani.com',
      'hi-IN': 'https://trikalvaani.com/hi',
      'x-default': 'https://trikalvaani.com',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['hi_IN'],
    url: 'https://trikalvaani.com',
    siteName: 'Trikal Vaani',
    title: 'Free AI Kundli & Horoscope Predictions | Trikal Vaani',
    description:
      'Get your free AI kundli and horoscope instantly. Swiss Ephemeris Vedic astrology by Rohiit Gupta, Chief Vedic Architect.',
    images: [
      {
        url: '/og-image.jpg', // place 1200x630 og image at /public/og-image.jpg
        width: 1200,
        height: 630,
        alt: 'Trikal Vaani — Free AI Kundli & Horoscope Predictions by Rohiit Gupta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@trikalvaani',
    creator: '@trikalvaani',
    title: 'Free AI Kundli & Horoscope Predictions | Trikal Vaani',
    description:
      'Free AI kundli and horoscope predictions instantly. Swiss Ephemeris Vedic astrology by Rohiit Gupta.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  category: 'astrology',
  keywords: [
    'free AI kundli',
    'AI horoscope predictions',
    'free kundli online',
    'horoscope by date of birth',
    'AI vedic astrology India',
    'kundli AI generator',
    'free horoscope India',
    'Rohiit Gupta astrologer',
    'best astrologer Delhi NCR',
    'swiss ephemeris vedic',
    'जन्म कुंडली ऑनलाइन',
    'राशिफल AI',
    'वैदिक ज्योतिष',
  ],
  verification: {
    // add your verification tokens here
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN',
    yandex: 'YOUR_YANDEX_TOKEN',
    other: {
      'msvalidate.01': 'YOUR_BING_TOKEN',
    },
  },
};

// ──────────────────────────────────────────────────────────────
// SITEWIDE JSON-LD SCHEMAS (Organization + WebSite + SearchAction)
// These appear on EVERY page — they verify your brand entity
// to Google, Bing, Perplexity, ChatGPT, Gemini.
// ──────────────────────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://trikalvaani.com/#organization',
  name: 'Trikal Vaani',
  alternateName: ['त्रिकाल वाणी', 'Trikal Vaani Global'],
  url: 'https://trikalvaani.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://trikalvaani.com/logo.png',
    width: 512,
    height: 512,
  },
  image: 'https://trikalvaani.com/og-image.jpg',
  description:
    'Free AI kundli and horoscope predictions powered by Swiss Ephemeris and classical Parashara BPHS, Bhrigu Nandi Nadi, and Shadbala wisdom.',
  founder: {
    '@type': 'Person',
    '@id': 'https://trikalvaani.com/founder#person',
    name: 'Rohiit Gupta',
    jobTitle: 'Chief Vedic Architect',
    url: 'https://trikalvaani.com/founder',
  },
  foundingDate: '2026',
  foundingLocation: {
    '@type': 'Place',
    name: 'Delhi NCR, India',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    addressCountry: 'IN',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-9211804111',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Hinglish'],
      contactOption: 'TollFree',
    },
  ],
  sameAs: [
    'https://www.instagram.com/trikalvaani',
    'https://twitter.com/trikalvaani',
    'https://www.linkedin.com/company/trikalvaani',
    'https://www.youtube.com/@trikalvaani',
  ],
  knowsAbout: [
    'Vedic Astrology',
    'AI Kundli Generation',
    'Horoscope Predictions',
    'Jyotish Shastra',
    'Vimshottari Dasha',
    'Brihat Parashara Hora Shastra',
    'Bhrigu Nandi Nadi',
    'Shadbala',
    'Swiss Ephemeris',
    'Lahiri Ayanamsha',
    'Navamsa D9',
    'Kundali Matching',
  ],
  slogan:
    'Kaal bada balwan hai, sabko nach nachaye — raja ka beta bhi bhiksha mangne jaye.',
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://trikalvaani.com/#website',
  url: 'https://trikalvaani.com',
  name: 'Trikal Vaani',
  description:
    'Free AI Kundli & Horoscope Predictions by Rohiit Gupta — Swiss Ephemeris precision for Indian seekers.',
  publisher: {
    '@id': 'https://trikalvaani.com/#organization',
  },
  inLanguage: ['en-IN', 'hi-IN'],
  // SearchAction gives you a sitelinks search box in Google SERP
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://trikalvaani.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// ──────────────────────────────────────────────────────────────
// LAYOUT
// ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* Sitewide schemas — Organization + WebSite */}
        <Script
          id="schema-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          id="schema-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* DNS prefetch for performance — TTFB improvement */}
        <link rel="dns-prefetch" href="https://api.prokerala.com" />
        <link
          rel="dns-prefetch"
          href="https://generativelanguage.googleapis.com"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        {/* Geo signals for local SEO */}
        <meta name="geo.region" content="IN-DL" />
        <meta name="geo.placename" content="New Delhi" />
        <meta name="geo.position" content="28.6139;77.2090" />
        <meta name="ICBM" content="28.6139, 77.2090" />
      </head>
      <body className="bg-[#080B12] text-white antialiased">{children}</body>
    </html>
  );
}
