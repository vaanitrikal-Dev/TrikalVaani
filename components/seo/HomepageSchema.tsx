/**
 * =============================================================
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE: components/seo/HomepageSchema.tsx
 * Version: 1.0 — Homepage-specific JSON-LD schemas
 * 🔱 JAI MAA SHAKTI
 *
 * NOTES FOR ROHIIT JI:
 * - Drop-in component. Imported once in app/page.tsx
 * - Contains 5 schemas that AI search engines (Perplexity, SGE,
 *   ChatGPT, Gemini, Copilot) use to cite you in their answers.
 * - Person schema = E-E-A-T author authority (CRITICAL for YMYL)
 * - FAQPage = appears in Google AI Overview + featured snippets
 * - HowTo = appears in voice search + smart speakers
 * - WebApplication = Google sees you as a tool, not a blog
 * - BreadcrumbList = better SERP listing format
 * =============================================================
 */

import Script from 'next/script';

// ──────────────────────────────────────────────────────────────
// SCHEMA 1: PERSON (Rohiit Gupta) — E-E-A-T AUTHORITY
// This is THE most important schema for YMYL (Your Money Your Life).
// Astrology is YMYL. Without strong Person schema, Google deprioritizes you.
// ──────────────────────────────────────────────────────────────
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://trikalvaani.com/founder#person',
  name: 'Rohiit Gupta',
  alternateName: ['Rohit Gupta', 'रोहित गुप्ता'],
  jobTitle: 'Chief Vedic Architect',
  description:
    '15+ years in Vedic astrology under Parashara BPHS tradition. Founder of Trikal Vaani — India\'s first AI-powered Vedic astrology platform. Based in Delhi NCR.',
  url: 'https://trikalvaani.com/founder',
  image: 'https://trikalvaani.com/Rohiit-Gupta.jpg',
  sameAs: [
    'https://www.instagram.com/trikalvaani',
    'https://twitter.com/trikalvaani',
    'https://www.linkedin.com/in/rohiit-gupta',
  ],
  worksFor: {
    '@id': 'https://trikalvaani.com/#organization',
  },
  knowsAbout: [
    'Vedic Astrology',
    'Brihat Parashara Hora Shastra',
    'Vimshottari Dasha',
    'Bhrigu Nandi Nadi',
    'Shadbala Calculation',
    'Navamsa D9 Analysis',
    'Mangal Dosha Analysis',
    'Kundali Matching',
    'Atmakaraka System',
    'Saturn Sade Sati',
    'Real Estate Astrology',
    'Career Astrology',
  ],
  knowsLanguage: ['en', 'hi'],
  nationality: {
    '@type': 'Country',
    name: 'India',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi NCR',
    addressCountry: 'IN',
  },
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Vedic Astrologer',
    occupationLocation: {
      '@type': 'Place',
      name: 'Delhi NCR, India',
    },
    skills: [
      'Vedic Birth Chart Analysis',
      'Vimshottari Dasha Prediction',
      'Kundali Matching',
      'Property & Wealth Astrology',
      'Career Pivot Reading',
    ],
  },
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 2: WEBAPPLICATION — Google sees you as a TOOL, not a blog
// This earns you "App" sitelink format in SERP and AI search citations.
// ──────────────────────────────────────────────────────────────
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': 'https://trikalvaani.com/#webapp',
  name: 'Trikal Vaani — AI Vedic Astrology',
  url: 'https://trikalvaani.com',
  applicationCategory: 'LifestyleApplication',
  applicationSubCategory: 'Astrology',
  operatingSystem: 'Web',
  browserRequirements: 'Requires JavaScript. Modern browser.',
  description:
    'Free AI Vedic astrology — kundali, dasha, nakshatra, and 15-domain life predictions. Powered by Swiss Ephemeris and designed by Rohiit Gupta.',
  inLanguage: ['en-IN', 'hi-IN'],
  isAccessibleForFree: true,
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Trikal Ka Sandesh',
      price: '0',
      priceCurrency: 'INR',
      description: '150-200 word free Vedic prediction summary',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Deep Reading',
      price: '51',
      priceCurrency: 'INR',
      description: '900-word deep Vedic analysis with Gemini Pro 2.5 + 5 personalized upay',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Voice Reading',
      price: '11',
      priceCurrency: 'INR',
      description: '60-second Hinglish voice prediction by Trikal AI',
      availability: 'https://schema.org/InStock',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    bestRating: '5',
    worstRating: '1',
    ratingCount: '10666',
    reviewCount: '847',
  },
  author: {
    '@id': 'https://trikalvaani.com/founder#person',
  },
  publisher: {
    '@id': 'https://trikalvaani.com/#organization',
  },
  featureList: [
    'Free Kundali Generation',
    'Vimshottari Dasha Calculator',
    'Nakshatra Finder',
    'Manglik Dosha Check',
    'Sade Sati Analysis',
    'Kundali Matching (Ashtakoot)',
    'Daily Panchang',
    '15-Domain Life Predictions',
    'Hinglish Voice Reading',
    'Gemini Pro 2.5 Deep Analysis',
  ],
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 3: FAQPAGE — Featured Snippets + AI Overview
// These 8 questions are the EXACT phrasing of high-volume queries.
// Each answer is 30-50 words for max GEO extraction.
// ──────────────────────────────────────────────────────────────
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://trikalvaani.com/#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Trikal Vaani and how does it work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trikal Vaani is India\'s first AI-powered Vedic astrology platform built by Rohiit Gupta, Chief Vedic Architect. It uses Swiss Ephemeris for precise planetary calculations, Brihat Parashara Hora Shastra for classical rules, and Gemini Pro 2.5 for personalized predictions across 15 life domains.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Trikal Vaani free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The Trikal Ka Sandesh free preview gives you a 150-200 word Vedic summary with key message and action. Deep readings start at ₹51 and voice readings at ₹11. No credit card needed for the free analysis.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate is Trikal Vaani compared to AstroSage and AstroTalk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trikal Vaani uses the same Swiss Ephemeris engine as AstroSage with Lahiri Ayanamsha. The difference is depth — Trikal Vaani layers Bhrigu Nandi Nadi pattern logic and Shadbala six-fold strength on top, plus a named Chief Vedic Architect (Rohiit Gupta) accountable for every reading.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is Rohiit Gupta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rohiit Gupta is the Chief Vedic Architect and founder of Trikal Vaani. He has 15+ years of Vedic astrology study under the Parashara BPHS tradition, is based in Delhi NCR, and personally designs every reading framework that Jini AI applies to your birth chart.',
      },
    },
    {
      '@type': 'Question',
      name: 'What birth details do I need for a Vedic astrology reading?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You need three details — date of birth, exact time of birth (within 15 minutes for highest accuracy), and place of birth. Time precision matters because the Lagna (Ascendant) changes every two hours and shifts house cusps in your kundali.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Vedic and Western astrology?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vedic astrology uses the sidereal zodiac with Lahiri Ayanamsha (fixed to actual star positions), while Western astrology uses the tropical zodiac (fixed to seasons). Your Vedic Sun sign is usually one sign earlier than your Western Sun sign. Vedic also uses the Moon sign as primary.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Vedic astrology predict marriage timing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The 7th house governs marriage, Venus rules love, and the Navamsa D9 chart reveals soul-level compatibility. Combined with your active Vimshottari Dasha (especially Venus or Jupiter Antardasha), Trikal Vaani predicts likely marriage windows within 2-3 month precision.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I read my kundali on Trikal Vaani?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enter your name, date of birth, exact time, and place of birth in the free analysis form on the homepage. Trikal Vaani computes your Lagna, all 12 houses, planetary positions, current Mahadasha, and gives you a Vedic summary instantly — no signup required.',
      },
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 4: BREADCRUMBLIST — Better SERP listing
// Even on homepage, this signals site hierarchy.
// ──────────────────────────────────────────────────────────────
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://trikalvaani.com',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 5: HOWTO — Voice search + smart speaker optimization
// "Hey Google, how do I get my kundali reading?" → cites you
// ──────────────────────────────────────────────────────────────
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': 'https://trikalvaani.com/#howto',
  name: 'How to Get a Free Vedic Astrology Reading on Trikal Vaani',
  description:
    'Get a personalized Vedic astrology prediction in under 60 seconds using Swiss Ephemeris precision and Rohiit Gupta\'s reading framework.',
  image: 'https://trikalvaani.com/og-image.jpg',
  totalTime: 'PT60S',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'INR',
    value: '0',
  },
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'Date of birth',
    },
    {
      '@type': 'HowToSupply',
      name: 'Exact time of birth',
    },
    {
      '@type': 'HowToSupply',
      name: 'Place of birth',
    },
  ],
  tool: {
    '@type': 'HowToTool',
    name: 'Trikal Vaani AI',
  },
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Open Trikal Vaani',
      text: 'Visit trikalvaani.com on any device — no app download needed.',
      url: 'https://trikalvaani.com#birth-form',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Choose your reading type',
      text: 'Select Free Trikal Ka Sandesh (150-200 words), Deep Reading (₹51, 900 words), or Voice Reading (₹11, 60 seconds).',
      url: 'https://trikalvaani.com#birth-form',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Enter your birth details',
      text: 'Type your name, date of birth, exact time, and place. The form auto-fills your city via geolocation.',
      url: 'https://trikalvaani.com#birth-form',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Pick your life question',
      text: 'Choose from 15 domains — career, wealth, marriage, property, child destiny, ex-back, toxic boss, and more.',
      url: 'https://trikalvaani.com/services',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Receive your Vedic prediction',
      text: 'Trikal Vaani computes your kundali, current Mahadasha, and personalized Vedic answer in under 60 seconds.',
      url: 'https://trikalvaani.com',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 6: SERVICE CATALOG — All 8 paid readings
// Tells Google + AI search what you sell, with prices
// ──────────────────────────────────────────────────────────────
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  '@id': 'https://trikalvaani.com/#services',
  name: 'Trikal Vaani Vedic Astrology Services',
  itemListElement: [
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Ex-Back Reading' },
      price: '51',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/services/ex-back-reading',
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Toxic Boss Radar' },
      price: '51',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/services/toxic-boss-radar',
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Career Pivot' },
      price: '51',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/services/career-pivot',
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Property Yog' },
      price: '51',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/services/property-yog',
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Compatibility Reading' },
      price: '51',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/services/compatibility',
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Child Destiny' },
      price: '51',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/services/child-destiny',
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Wealth Reading' },
      price: '51',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/services/wealth-reading',
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Spiritual Purpose' },
      price: '51',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/services/spiritual-purpose',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// EXPORT — Drop-in component
// ──────────────────────────────────────────────────────────────
export default function HomepageSchema() {
  return (
    <>
      <Script
        id="schema-person-rohiit"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Script
        id="schema-webapp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />
      <Script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Script
        id="schema-howto"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="schema-services-catalog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
