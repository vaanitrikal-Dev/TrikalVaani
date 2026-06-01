/**
 * =============================================================
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE: components/seo/HomepageSchema.tsx
 * Version: 2.1 — Accuracy FAQ de-risked (competitor names dropped, schema-synced)
 * Date: 2026-06-01
 * 🔱 JAI MAA SHAKTI
 *
 * CHANGES vs v2.0 (CEO-approved):
 *   ✅ FAQPage Q3 reworded to match HomepageGEO v2.2: dropped AstroSage /
 *      AstroTalk names + the unverifiable "same engine as AstroSage" claim.
 *      New Q is non-branded; new A states only what Trikaal Vaani does. Visible
 *      FAQ (HomepageGEO #faq) and this FAQPage schema remain byte-identical in
 *      Q&A text (AEO requires visible == structured).
 *   ✅ FAQPage dateModified bumped to 2026-06-01.
 *   (Service dateModified also bumped to 2026-06-01 for freshness consistency.)
 *
 *   ⚠️ KNOWN ISSUES TO RESOLVE NEXT (not touched here):
 *      - #rohiit-gupta Person is fully defined in BOTH this file AND
 *        SchemaScript.tsx, and the two DISAGREE (different knowsAbout lists;
 *        sameAs has LinkedIn here but /founder there). Same @id with conflicting
 *        data can muddy the entity graph — pick ONE canonical Person, make the
 *        other a bare {@id} reference.
 *      - sameAs LinkedIn (/in/rohiit-gupta) must point to a REAL, live profile,
 *        else it weakens entity trust. Verify or remove.
 *      - HowTo image uses /og-image.jpg while OG/Product use /og-default.jpg —
 *        confirm /og-image.jpg exists (possible 404).
 *
 * CHANGES vs v1.1 (carried from v2.0, CEO-approved):
 *   ✅ Brand flip Trikaal Vaani; persona Trikaal AI / Trikaal Ka Sandesh.
 *   ✅ Local SEO removed (Delhi NCR PostalAddress + occupationLocation).
 *   ✅ Service schema with areaServed [India, Worldwide] (structured global signal).
 *   ✅ E-E-A-T: hasCredential; speakable; entity graph cross-linked by @id.
 *   ❌ aggregateRating NOT added — no fake stars.
 *   ⚠️ FAQPage rich result deprecated 7 May 2026; FAQPage KEPT for AEO citation.
 *
 * SCHEMA OWNERSHIP MAP (no duplicates across site):
 *   - Organization → layout.tsx (#organization) — referenced here by @id only
 *   - WebApplication → layout.tsx (#webapp)
 *   - Person (Rohiit ji) → THIS FILE (#rohiit-gupta) — homepage authority
 *     (NOTE: also defined in SchemaScript.tsx — see Known Issues above)
 *   - FAQPage → THIS FILE (#faq) — homepage FAQ
 *   - Service (areaServed: global) → THIS FILE (#service)
 *   - BreadcrumbList → THIS FILE
 *   - HowTo → THIS FILE (#howto)
 *   - OfferCatalog (services) → THIS FILE (#services)
 * =============================================================
 */

import Script from 'next/script';

// ──────────────────────────────────────────────────────────────
// SCHEMA 1: PERSON (Rohiit Gupta) — E-E-A-T AUTHORITY
// ──────────────────────────────────────────────────────────────
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://trikalvaani.com/#rohiit-gupta',
  name: 'Rohiit Gupta',
  alternateName: ['Rohit Gupta', 'रोहित गुप्ता'],
  jobTitle: 'Chief Vedic Architect',
  description:
    'Vedic astrologer with 15+ years of study under the Parashara BPHS tradition. Founder of Trikaal Vaani — an AI-powered Vedic astrology platform offering free kundli and accurate predictions to seekers across India and worldwide.',
  url: 'https://trikalvaani.com/founder',
  image: 'https://trikalvaani.com/Rohiit-Gupta.jpg',
  sameAs: [
    'https://www.instagram.com/thetrikalvaani',
    'https://www.youtube.com/@TheTrikalVaani',
    'https://www.facebook.com/people/Trikal-Vaani-Voice',
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
    'Muhurat Selection',
    'Karmic Background Reading',
    'Panchang & Gochar',
  ],
  knowsLanguage: ['Hindi', 'English'],
  nationality: {
    '@type': 'Country',
    name: 'India',
  },
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Professional Experience',
    name: '15+ years of Vedic astrology practice (Parashara BPHS tradition)',
  },
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Vedic Astrologer',
    skills: [
      'Vedic Birth Chart Analysis',
      'Vimshottari Dasha Prediction',
      'Kundali Matching',
      'Muhurat Selection',
      'Karmic Pattern Reading',
    ],
  },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['#author-byline-heading'],
  },
};

// ──────────────────────────────────────────────────────────────
// SCHEMA 2: SERVICE — GLOBAL REACH
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
// SCHEMA 3: FAQPAGE — AEO citation extraction
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
// SCHEMA 4: BREADCRUMBLIST
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
// SCHEMA 5: HOWTO — voice / AI parsing (no rich result since 2024; kept for AEO)
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
// SCHEMA 6: OFFERCATALOG — service prices
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
