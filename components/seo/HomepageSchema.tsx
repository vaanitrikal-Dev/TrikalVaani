/**
 * =============================================================
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE: components/seo/HomepageSchema.tsx
 * Version: 1.1 — Schema collision fixes + integrity cleanup
 * Date: 2026-05-18
 * 🔱 JAI MAA SHAKTI
 *
 * CHANGES vs v1.0:
 *   ❌ REMOVED: WebApplication schema (DUPLICATE — layout.tsx already owns #webapp)
 *   ❌ REMOVED: aggregateRating (10666/847 was placeholder — Google penalty risk)
 *      → Will be re-added authentically once real Razorpay-verified reviews accumulate
 *   ✅ FIXED: Person @id unified to "https://trikalvaani.com/#rohiit-gupta"
 *      (was "/founder#person" — conflicted with layout.tsx Organization founder reference)
 *   ✅ ADDED: inLanguage ["en-IN","hi-IN"] to FAQPage (AEO Hindi extraction)
 *   ✅ ADDED: inLanguage to Person knowsLanguage standardized to ["Hindi","English"]
 *      (matches layout.tsx v2.7 — single source of truth)
 *   ✅ SLIMMED: featureList trimmed to only LIVE pages
 *      (kundali, dasha, nakshatra, rashi, lagna, sade-sati, manglik-dosh, panchang)
 *   ✅ KEPT: HowTo schema (downgraded by Google Sept 2023 but still works on mobile)
 *
 * SCHEMA OWNERSHIP MAP (no duplicates across site):
 *   - Organization → layout.tsx (#organization)
 *   - WebApplication → layout.tsx (#webapp)
 *   - LocalBusiness → layout.tsx (#localbusiness)
 *   - Person (Rohiit ji) → THIS FILE (#rohiit-gupta) — homepage authority
 *   - FAQPage → THIS FILE (#faq) — homepage FAQ
 *   - BreadcrumbList → THIS FILE
 *   - HowTo → THIS FILE (#howto)
 *   - OfferCatalog (services) → THIS FILE (#services)
 * =============================================================
 */

import Script from 'next/script';

// ──────────────────────────────────────────────────────────────
// SCHEMA 1: PERSON (Rohiit Gupta) — E-E-A-T AUTHORITY
// CRITICAL for YMYL (astrology = YMYL category).
// @id unified to #rohiit-gupta to match layout.tsx Organization.founder reference.
// ──────────────────────────────────────────────────────────────
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://trikalvaani.com/#rohiit-gupta',
  name: 'Rohiit Gupta',
  alternateName: ['Rohit Gupta', 'रोहित गुप्ता'],
  jobTitle: 'Chief Vedic Architect',
  description:
    "15+ years in Vedic astrology under Parashara BPHS tradition. Founder of Trikal Vaani — India's first AI-powered Vedic astrology platform offering free kundli and accurate predictions. Based in Delhi NCR.",
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
  knowsLanguage: ['Hindi', 'English'],
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
// SCHEMA 2: FAQPAGE — Featured Snippets + AI Overview
// inLanguage added for bilingual AEO extraction.
// Visible FAQ in HomepageGEO.tsx will be synced exactly to these in Session B.
// ──────────────────────────────────────────────────────────────
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://trikalvaani.com/#faq',
  inLanguage: ['en-IN', 'hi-IN'],
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I get a free AI kundli and horoscope on Trikal Vaani?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Open trikalvaani.com, enter your name, date of birth, exact time of birth, and place of birth in the free analysis form. Trikal Vaani computes your Lagna, all 12 houses, planetary positions, current Mahadasha, and gives you a Vedic kundli summary instantly — no signup or credit card required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Trikal Vaani free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The Trikal Ka Sandesh free preview gives you a 150–200 word AI kundli and horoscope summary with key message and action. Deep readings start at ₹51 and voice readings at ₹11. Free analysis is unlimited.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate are Trikal Vaani horoscope predictions vs AstroSage and AstroTalk?',
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
        text: 'Rohiit Gupta is the Chief Vedic Architect and founder of Trikal Vaani. He has 15+ years of Vedic astrology study under the Parashara BPHS tradition, is based in Delhi NCR, and personally designs every kundli reading framework that Jini AI applies to your birth chart.',
      },
    },
    {
      '@type': 'Question',
      name: 'What birth details do I need for an AI kundli reading?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You need three details — date of birth, exact time of birth (within 15 minutes for highest accuracy), and place of birth. Time precision matters because the Lagna (Ascendant) changes every two hours and shifts house cusps in your kundli.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Vedic and Western horoscope predictions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vedic astrology uses the sidereal zodiac with Lahiri Ayanamsha (fixed to actual star positions), while Western astrology uses the tropical zodiac (fixed to seasons). Your Vedic Sun sign is usually one sign earlier than your Western Sun sign. Vedic also uses the Moon sign as primary.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can the AI kundli predict marriage timing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The 7th house governs marriage, Venus rules love, and the Navamsa D9 chart reveals soul-level compatibility. Combined with your active Vimshottari Dasha (especially Venus or Jupiter Antardasha), Trikal Vaani predicts likely marriage windows within 2-3 month precision.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the AI horoscope different from a daily Rashi horoscope?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "A daily Rashi horoscope gives one prediction for ~10 crore people sharing your Moon sign. Trikal Vaani's AI kundli is computed from YOUR exact birth time and place, so the prediction is unique to your chart — like the difference between a clothing size XL and a tailored suit.",
      },
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 3: BREADCRUMBLIST — Better SERP listing
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
// SCHEMA 4: HOWTO — Voice search + smart speaker citation
// Note: Google deprecated HowTo desktop rich results in Sept 2023.
// Still functions on mobile. Kept minimal — not worth expanding.
// ──────────────────────────────────────────────────────────────
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': 'https://trikalvaani.com/#howto',
  name: 'How to Get a Free AI Kundli & Horoscope Reading on Trikal Vaani',
  description:
    "Get a personalized Vedic astrology prediction in under 60 seconds using Swiss Ephemeris precision and Rohiit Gupta's reading framework.",
  image: 'https://trikalvaani.com/og-image.jpg',
  totalTime: 'PT60S',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'INR',
    value: '0',
  },
  supply: [
    { '@type': 'HowToSupply', name: 'Date of birth' },
    { '@type': 'HowToSupply', name: 'Exact time of birth' },
    { '@type': 'HowToSupply', name: 'Place of birth' },
  ],
  tool: { '@type': 'HowToTool', name: 'Trikal Vaani AI' },
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
      name: 'Enter birth details',
      text: 'Type your name, date of birth, exact time, and place. The form auto-fills your city via geolocation.',
      url: 'https://trikalvaani.com#birth-form',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Pick your life question',
      text: 'Choose from 15 life domains — career, wealth, marriage, property, child destiny, and more.',
      url: 'https://trikalvaani.com',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Receive your Vedic prediction',
      text: 'Trikal Vaani computes your kundali, current Mahadasha, and personalized Vedic answer in under 60 seconds.',
      url: 'https://trikalvaani.com',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 5: OFFERCATALOG — Service prices for AI search citation
// Kept as-is. Will be cross-verified against live /services/* pages in Session D.
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
// 5 schemas total (WebApplication removed — owned by layout.tsx)
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
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
