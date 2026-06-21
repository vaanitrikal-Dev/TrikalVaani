/**
 * =============================================================
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE: components/seo/HomepageSchema.tsx
 * Version: 2.2 — Person de-dup: #rohiit-gupta now lives ONLY in the
 *               single canonical author entity (SchemaScript.tsx)
 * 🔱 JAI MAA SHAKTI
 *
 * CHANGES vs v2.1 (CEO-approved):
 *   ✅ REMOVED the full Person (#rohiit-gupta) definition from this file.
 *      It is now owned solely by SchemaScript.tsx (sitewide canonical).
 *      Why this was a problem before:
 *        • The SAME @id was fully defined here AND in SchemaScript with
 *          DIFFERENT data (different knowsAbout, different sameAs). One @id
 *          with conflicting data muddies the entity graph and weakens
 *          disambiguation — the exact opposite of what we want.
 *        • This file's Person carried a WRONG LinkedIn vanity URL
 *          (/in/rohiit-gupta). The real, verified profile lives in the
 *          canonical: /in/rohiit-gupta-918268415.
 *      Nothing is lost: the canonical holds the full E-E-A-T data
 *      (knowsAbout union, hasOccupation, speakable, hasCredential, correct
 *      LinkedIn, 16+ yrs). The #service author reference below still
 *      resolves to it by @id across the page's JSON-LD graph.
 *
 *   ⚠️ STILL TO VERIFY (not blockers):
 *      - Founder image: canonical Person uses /images/founder.png; this file
 *        previously used /Rohiit-Gupta.jpg. Confirm which path is actually
 *        live so the canonical does not 404.
 *      - HowTo image uses /og-image.jpg while OG/Product use /og-default.jpg
 *        — confirm /og-image.jpg exists (possible 404).
 *      - FAQ "Who is Rohiit Gupta?" answer still says "15+ years". To match
 *        the new 16+ everywhere, update it in BOTH HomepageGEO.tsx (visible)
 *        AND this FAQPage together — they must stay byte-identical for AEO.
 *
 * CHANGES carried from v2.1 / v2.0 (CEO-approved):
 *   ✅ Brand flip Trikaal Vaani; persona Trikaal AI / Trikaal Ka Sandesh.
 *   ✅ FAQ Q3 non-branded (competitor brand names dropped); visible == schema.
 *   ✅ Local geo schema removed (no PostalAddress / occupationLocation).
 *   ✅ Service areaServed [India, Worldwide] (structured global signal).
 *   ❌ aggregateRating NOT added — no fake stars.
 *   ⚠️ FAQPage rich result deprecated 7 May 2026; FAQPage KEPT for AEO.
 *
 * SCHEMA OWNERSHIP MAP (no duplicates across site):
 *   - Organization → layout.tsx (#organization) — referenced here by @id
 *   - WebApplication → layout.tsx (#webapp)
 *   - Person (Rohiit) → SchemaScript.tsx (#rohiit-gupta) — SINGLE canonical
 *   - WebSite / Service(#service-readings) / Product → SchemaScript.tsx
 *   - FAQPage → THIS FILE (#faq)
 *   - Service (#service, homepage) → THIS FILE
 *   - BreadcrumbList → THIS FILE
 *   - HowTo → THIS FILE (#howto)
 *   - OfferCatalog (#services) → THIS FILE
 * =============================================================
 */

import Script from 'next/script';

// ──────────────────────────────────────────────────────────────
// SCHEMA 1: SERVICE — GLOBAL REACH
// (Person #rohiit-gupta is referenced by @id only — defined canonically
//  in SchemaScript.tsx, never re-defined here.)
// ──────────────────────────────────────────────────────────────
const serviceGlobalSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://trikalvaani.com/#service',
  name: 'Trikaal Vaani AI Vedic Astrology',
  serviceType: 'Vedic Astrology Prediction & Kundli Analysis',
  description:
    'AI-powered Vedic astrology: free kundli, accurate life predictions across 15 domains, Kundali Milan, Child Birth Muhurat, Karmic Reading and voice guidance — computed with Swiss Ephemeris precision and Brihat Parashara Hora Shastra classical rules, in English, Hindi and Hinglish.',
  provider: {
    '@id': 'https://trikalvaani.com/#organization',
  },
  author: {
    '@id': 'https://trikalvaani.com/#rohiit-gupta',
  },
  url: 'https://trikalvaani.com',
  dateModified: '2026-06-01',
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://trikalvaani.com',
    availableLanguage: ['en', 'hi'],
  },
  areaServed: [
    { '@type': 'Country', name: 'India' },
    { '@type': 'Place', name: 'Worldwide' },
  ],
  audience: {
    '@type': 'Audience',
    audienceType: 'Vedic astrology seekers in India and the global diaspora',
  },
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 2: FAQPAGE — AEO citation extraction
// SYNCED EXACTLY to visible FAQ in HomepageGEO.tsx v2.2.
// ──────────────────────────────────────────────────────────────
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://trikalvaani.com/#faq',
  inLanguage: ['en-IN', 'hi-IN'],
  dateModified: '2026-06-01',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I get a free AI kundli and horoscope on Trikaal Vaani?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Open trikalvaani.com, enter your name, date of birth, exact time of birth, and place of birth in the free analysis form. Trikaal Vaani computes your Lagna, all 12 houses, planetary positions, current Mahadasha, and gives you a Vedic kundli summary instantly — no signup or credit card required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Trikaal Vaani free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The Trikaal Ka Sandesh free preview gives you a 150–200 word AI kundli and horoscope summary with key message and action. Deep readings start at ₹51 and voice readings at ₹11. Free analysis is unlimited.',
      },
    },
    {
      '@type': 'Question',
      name: "How accurate are Trikaal Vaani's AI horoscope predictions?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trikaal Vaani computes your chart with the Swiss Ephemeris engine and Lahiri Ayanamsha — the astronomical standard for sidereal Vedic calculation. Accuracy comes from depth: it layers Bhrigu Nandi Nadi pattern logic and Shadbala six-fold planetary strength on top of classical BPHS rules, and every reading framework is designed by a named Chief Vedic Architect, Rohiit Gupta, who is accountable for it.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is Rohiit Gupta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rohiit Gupta is the Chief Vedic Architect and founder of Trikaal Vaani. He has 15+ years of Vedic astrology study under the Parashara BPHS tradition, and personally designs every kundli reading framework that Trikaal AI applies to your birth chart.',
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
        text: 'Yes. The 7th house governs marriage, Venus rules love, and the Navamsa D9 chart reveals soul-level compatibility. Combined with your active Vimshottari Dasha (especially Venus or Jupiter Antardasha), Trikaal Vaani predicts likely marriage windows within 2-3 month precision.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the AI horoscope different from a daily Rashi horoscope?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "A daily Rashi horoscope gives one prediction for ~10 crore people sharing your Moon sign. Trikaal Vaani's AI kundli is computed from YOUR exact birth time and place, so the prediction is unique to your chart — like the difference between a clothing size XL and a tailored suit.",
      },
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 3: BREADCRUMBLIST
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
// SCHEMA 4: HOWTO — voice / AI parsing (no rich result since 2024; kept for AEO)
// ──────────────────────────────────────────────────────────────
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': 'https://trikalvaani.com/#howto',
  name: 'How to Get a Free AI Kundli & Horoscope Reading on Trikaal Vaani',
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
  tool: { '@type': 'HowToTool', name: 'Trikaal Vaani AI' },
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Open Trikaal Vaani',
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
      text: 'Trikaal Vaani computes your kundali, current Mahadasha, and personalized Vedic answer in under 60 seconds.',
      url: 'https://trikalvaani.com',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 5: OFFERCATALOG — service prices
// ──────────────────────────────────────────────────────────────
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  '@id': 'https://trikalvaani.com/#services',
  name: 'Trikaal Vaani Vedic Astrology Services',
  provider: {
    '@id': 'https://trikalvaani.com/#organization',
  },
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
// Person (#rohiit-gupta) is intentionally NOT emitted here — it is the
// single canonical author entity in SchemaScript.tsx (sitewide).
// ──────────────────────────────────────────────────────────────
export default function HomepageSchema() {
  return (
    <>
      <Script
        id="schema-service-global"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceGlobalSchema) }}
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
