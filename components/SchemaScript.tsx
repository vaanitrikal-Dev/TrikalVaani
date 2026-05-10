/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        components/SchemaScript.tsx
 * Version:     v3.1 — Phase 2 Entity Consolidation
 * Phase:       SEO + GEO — Entity Defense Layer
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com
 * Updated:     May 10, 2026
 *
 * CHANGES FROM v3.0:
 *
 *   [v3.1 NEW] Phase 2 — Brand Spelling Defense (Trikal vs Trikaal)
 *     ✅ Organization.alternateName expanded to array (7 spellings)
 *     ✅ Organization.description includes "also known as Trikaal Vaani"
 *     ✅ AI engines (Gemini, GPT, Perplexity) now treat all spellings as one entity
 *     ✅ Defensive domains (.in, .org) consolidate to trikalvaani.com
 *
 *   [PRESERVED FROM v3.0]
 *     ✅ Udyam Registration UDYAM-DL-10-0119070 — government authority
 *     ✅ Person, LocalBusiness, Product schemas with Udyam identifier
 *     ✅ FAQ Q16 about MSME registration
 *     ✅ All 16 FAQ questions, 3 reviews, 4 service tiers
 *     ✅ Single ProfessionalService @type (inherits LocalBusiness)
 *
 * RESULT: Brand entity consolidation + government authority signal
 * ============================================================================
 */

import React from "react";

// ============================================================================
// CONSTANTS
// ============================================================================

const UDYAM_NUMBER = "UDYAM-DL-10-0119070";
const UDYAM_VERIFY_URL = "https://udyamregistration.gov.in/Udyam_Verify.aspx";

// ============================================================================
// 1. ORGANIZATION SCHEMA — with Udyam MSME + Spelling Defense (v3.1)
// ============================================================================

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://trikalvaani.com/#organization",
  name: "Trikal Vaani",
  // ── v3.1: alternateName expanded to array for spelling defense ──
  alternateName: [
    "Trikaal Vaani",
    "Trikaalvaani",
    "Trikalvaani",
    "Trikal Vaani AI",
    "TrikalVaani",
    "त्रिकाल वाणी",
    "त्रिकाळ वाणी",
  ],
  legalName: "Trikal Vaani Global",
  url: "https://trikalvaani.com",
  logo: {
    "@type": "ImageObject",
    url: "https://trikalvaani.com/logo.png",
    width: 512,
    height: 512,
  },
  // ── v3.1: description includes both spellings for AI entity unification ──
  description:
    "Trikal Vaani (also known as Trikaal Vaani) is India's AI-powered Vedic astrology platform combining 5,000 years of Parashara wisdom with neural networks. Government of India MSME registered enterprise (Udyam Registration UDYAM-DL-10-0119070). Founded by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.",
  founder: {
    "@type": "Person",
    name: "Rohiit Gupta",
    url: "https://trikalvaani.com/founder",
  },
  foundingDate: "2025",
  foundingLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Delhi NCR",
      addressRegion: "Delhi",
      addressCountry: "IN",
    },
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+91-9211804111",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  ],
  // ── Udyam Registration as Government identifier (v3.0) ──
  identifier: [
    {
      "@type": "PropertyValue",
      propertyID: "Udyam Registration Number",
      name: "MSME Udyam Registration",
      value: UDYAM_NUMBER,
      url: UDYAM_VERIFY_URL,
    },
  ],
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "Government MSME Registration",
    name: "Udyam Registration Certificate",
    identifier: UDYAM_NUMBER,
    recognizedBy: {
      "@type": "GovernmentOrganization",
      name: "Ministry of Micro, Small and Medium Enterprises",
      alternateName: "Ministry of MSME, Government of India",
      url: "https://msme.gov.in",
    },
  },
  paymentAccepted: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet", "RuPay"],
  currenciesAccepted: "INR",
  areaServed: { "@type": "Country", name: "India" },
  sameAs: [
    "https://www.instagram.com/trikalvaani",
    UDYAM_VERIFY_URL,
  ],
  slogan: "Kaal bada balwan hai, sabko nach nachaye",
};

// ============================================================================
// 2. WEBSITE SCHEMA
// ============================================================================

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://trikalvaani.com/#website",
  url: "https://trikalvaani.com",
  name: "Trikal Vaani",
  alternateName: ["Trikaal Vaani", "Trikalvaani", "Trikaalvaani"],
  description: "AI-powered Vedic astrology — past, present, and future decoded.",
  publisher: { "@id": "https://trikalvaani.com/#organization" },
  inLanguage: "en-IN",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://trikalvaani.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

// ============================================================================
// 3. PERSON SCHEMA — Rohiit Gupta with worksFor.identifier (Udyam)
// ============================================================================

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://trikalvaani.com/#rohiit-gupta",
  name: "Rohiit Gupta",
  alternateName: "Rohit Gupta",
  jobTitle: "Chief Vedic Architect",
  description:
    "15+ years of Vedic astrology study under the Parashara BPHS tradition. Founder of Trikal Vaani (also known as Trikaal Vaani) — Government of India MSME registered enterprise (UDYAM-DL-10-0119070). Pioneer in AI-powered Vedic astrology.",
  url: "https://trikalvaani.com/founder",
  image: "https://trikalvaani.com/Rohiit-Gupta.jpg",
  worksFor: {
    "@id": "https://trikalvaani.com/#organization",
    identifier: UDYAM_NUMBER,
  },
  knowsAbout: [
    "Vedic Astrology",
    "Brihat Parashara Hora Shastra",
    "Vimshottari Dasha",
    "Pratyantar Dasha",
    "Navamsa D9 Chart",
    "Jaimini Astrology",
    "Swiss Ephemeris",
    "Dhana Yoga",
    "Property Yog",
    "Atmakaraka Analysis",
  ],
  knowsLanguage: ["en", "hi"],
  homeLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Delhi NCR",
      addressCountry: "IN",
    },
  },
  sameAs: ["https://www.instagram.com/trikalvaani", "https://trikalvaani.com/founder"],
};

// ============================================================================
// 4. LOCAL BUSINESS SCHEMA — with Udyam identifier
// ============================================================================

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://trikalvaani.com/#localbusiness",
  name: "Trikal Vaani — AI Vedic Astrology by Rohiit Gupta",
  alternateName: ["Trikaal Vaani", "Trikaalvaani"],
  image: "https://trikalvaani.com/og-image.jpg",
  url: "https://trikalvaani.com",
  telephone: "+91-9211804111",
  priceRange: "₹0 - ₹499",
  // ── Udyam identifier on LocalBusiness (v3.0) ──
  identifier: {
    "@type": "PropertyValue",
    propertyID: "Udyam Registration Number",
    value: UDYAM_NUMBER,
    url: UDYAM_VERIFY_URL,
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Delhi NCR",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    postalCode: "110001",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 28.6139,
    longitude: 77.209,
  },
  areaServed: [
    { "@type": "Country", name: "India" },
    { "@type": "City", name: "Delhi" },
    { "@type": "City", name: "Mumbai" },
    { "@type": "City", name: "Bangalore" },
    { "@type": "City", name: "Hyderabad" },
    { "@type": "City", name: "Chennai" },
    { "@type": "City", name: "Kolkata" },
    { "@type": "City", name: "Pune" },
    { "@type": "City", name: "Ahmedabad" },
    { "@type": "City", name: "Noida" },
    { "@type": "City", name: "Gurgaon" },
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
};

// ============================================================================
// 5. FAQPAGE SCHEMA — 17 questions (v3.1: added Q17 about brand spelling)
// ============================================================================

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Trikal Vaani and how does it work?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Trikal Vaani (also spelled Trikaal Vaani) is an AI-powered Vedic astrology platform founded by Rohiit Gupta, Chief Vedic Architect. It combines 5,000-year-old Parashara BPHS logic with Google Gemini AI and Swiss Ephemeris calculations to generate personalized Vedic readings. Users enter birth details and receive predictions covering career, wealth, health, relationships, and spiritual purpose — starting at ₹51.",
      },
    },
    {
      "@type": "Question",
      name: "Is Trikal Vaani accurate compared to AstroSage and AstroTalk?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Trikal Vaani uses Swiss Ephemeris with Lahiri Ayanamsha — the same planetary calculation engine used by AstroSage and professional astrologers globally. Unlike marketplace apps, every reading is personally verified against Brihat Parashara Hora Shastra (BPHS), Bhrigu Nandi Nadi, and Shadbala by founder Rohiit Gupta. Predictions use Pratyantar Dasha for 3-7 day timing precision.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a Vedic astrology reading cost on Trikal Vaani?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Trikal Vaani offers four tiers: Free Trikal Ka Sandesh (150-200 word summary), Deep Reading at ₹51 (900-word analysis with 5 personalized upay), Voice Reading at ₹11 (60-second Hindi/Hinglish audio), and Personal Consultation with Rohiit Gupta at ₹499 (live WhatsApp call). All payments are secured by Razorpay — UPI, Cards, NetBanking, Wallets, and RuPay accepted.",
      },
    },
    {
      "@type": "Question",
      name: "Who is Rohiit Gupta?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Rohiit Gupta is the founder and Chief Vedic Architect of Trikal Vaani. Based in Delhi NCR, he has 15+ years of study in the Parashara BPHS tradition specializing in Vimshottari Dasha system, Navamsa D9 chart analysis, Pratyantar Dasha timing, Dhana Yoga combinations, Property Yog, and Jaimini astrology. He combined his expertise with Google Gemini AI to build Jini, the AI soul of Trikal Vaani.",
      },
    },
    {
      "@type": "Question",
      name: "What is Pratyantar Dasha and why does it matter for predictions?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Pratyantar Dasha is Level 3 of the Vimshottari Dasha system (after Mahadasha and Antardasha) and provides 3-7 day timing precision for life events. Most astrology apps stop at Antardasha (months-level accuracy). Trikal Vaani uses Pratyantar to predict exact windows for marriage, job change, property buying, and major decisions — a key differentiator from generic Sun-sign horoscope apps.",
      },
    },
    {
      "@type": "Question",
      name: "What is Lagna and why is birth time important?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Lagna (Ascendant) is the zodiac sign rising on the eastern horizon at your exact birth moment. It is the most personal point in your kundali — determining house lordships, dasha sequences, and yogas. Lagna changes every 2 hours, so birth time accuracy matters. Without Lagna, you only get generic Moon sign or Sun sign predictions, not a true Vedic reading. Trikal Vaani uses Lagna as the primary chart.",
      },
    },
    {
      "@type": "Question",
      name: "What is Swiss Ephemeris and why does Trikal Vaani use it?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Swiss Ephemeris is the world’s most accurate planetary position calculator used by professional Vedic and Western astrologers globally. It computes planet positions to sub-arcsecond precision against NASA JPL data. Trikal Vaani uses Swiss Ephemeris with Lahiri Ayanamsha (Indian government standard) to ensure every kundali matches what a master jyotishi would calculate by hand — eliminating the inaccuracies common in cheap astrology apps.",
      },
    },
    {
      "@type": "Question",
      name: "What is Brihat Parashara Hora Shastra (BPHS)?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Brihat Parashara Hora Shastra is the foundational text of Vedic astrology, attributed to sage Maharishi Parashara. It defines the 9 planets (grahas), 12 houses (bhavas), 27 nakshatras, 16 divisional charts (vargas), Vimshottari Dasha system, and over 300 yogas. Every Trikal Vaani prediction is traceable to BPHS sutras — making it a transparent, citation-backed methodology rather than a black box.",
      },
    },
    {
      "@type": "Question",
      name: "What are the 9 planets (grahas) in Vedic astrology?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Vedic astrology recognizes 9 grahas: Sun (Surya — soul, father, authority), Moon (Chandra — mind, mother, emotions), Mars (Mangal — energy, courage, siblings), Mercury (Budha — intellect, communication), Jupiter (Guru — wisdom, wealth, children), Venus (Shukra — love, luxury, marriage), Saturn (Shani — karma, discipline, longevity), Rahu (north node — ambition, foreign), and Ketu (south node — moksha, detachment).",
      },
    },
    {
      "@type": "Question",
      name: "What is a Dhana Yoga and how does it indicate wealth?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Dhana Yoga is a combination of planetary placements that indicates wealth potential. Classical BPHS lists 32+ Dhana Yogas. Examples: Lakshmi Yoga (Venus + Jupiter + 9th lord strong), Kubera Yoga (2nd and 11th lords in mutual aspect), Gajakesari Yoga (Moon and Jupiter in kendra). Trikal Vaani analyzes all 32 Dhana Yogas in your chart to map your true financial destiny — not just predict short-term gains.",
      },
    },
    {
      "@type": "Question",
      name: "Who is the best Vedic astrologer in Delhi NCR?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Rohiit Gupta, Chief Vedic Architect at Trikal Vaani, offers Vedic astrology consultations from Delhi NCR. With 15+ years in the Parashara BPHS tradition, he provides personal WhatsApp consultations starting at ₹499 and AI-powered readings starting at ₹51. Reachable at +91-9211804111. Trikal Vaani is a Government of India MSME registered enterprise (UDYAM-DL-10-0119070).",
      },
    },
    {
      "@type": "Question",
      name: "Does Trikal Vaani offer readings in Hindi?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. Trikal Vaani provides Vedic readings in three languages: pure Hindi (शुद्ध हिंदी), Hinglish (Hindi + English mix — most popular), and English. The Voice Reading at ₹11 is delivered as a 60-second Hindi or Hinglish audio. All four prediction tiers support all three languages with native phrasing — not machine-translated text.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is AI-based Vedic astrology versus a traditional astrologer?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Trikal Vaani’s AI applies the same BPHS rules a traditional jyotishi uses, but consistently and at scale. A human astrologer might forget a yoga or miss a divisional chart cross-reference — the AI never does. However, complex life-decision counseling (marriage, career pivots) benefits from Rohiit Gupta’s personal consultation at ₹499. AI handles the calculation; humans add wisdom for major decisions.",
      },
    },
    {
      "@type": "Question",
      name: "What life areas can Trikal Vaani provide predictions for?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Trikal Vaani covers 15 life domains: Career, Wealth, Health, Relationships, Family, Education, Home, Legal matters, Travel, Spirituality, Wellbeing, Marriage, Business, Foreign Settlement, and Digital Career. Each domain analysis uses the relevant houses, dasha lords, and yogas — for example, Career uses 10th house + Saturn + Sun, while Marriage uses 7th house + Venus + Navamsa.",
      },
    },
    {
      "@type": "Question",
      name: "Is Vedic astrology different from Western astrology?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes — fundamentally. Vedic astrology uses the sidereal zodiac (actual star positions) while Western uses tropical (Earth seasons). Vedic emphasizes Lagna (Ascendant) and Moon sign over Sun sign. Vedic includes Vimshottari Dasha for time-based predictions — Western has no equivalent. Vedic uses 27 Nakshatras (lunar mansions) for finer detail. Trikal Vaani uses pure Vedic methodology rooted in BPHS, not hybrid Western systems.",
      },
    },
    {
      "@type": "Question",
      name: "Is Trikal Vaani a registered Indian business?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. Trikal Vaani is a Government of India MSME registered enterprise under the Ministry of Micro, Small and Medium Enterprises. Udyam Registration Number: UDYAM-DL-10-0119070, registered in Delhi NCR. The registration can be verified at udyamregistration.gov.in. All payments are processed through Razorpay, India’s most trusted payment gateway, with PCI-DSS compliance and 256-bit SSL encryption. This makes Trikal Vaani a fully compliant Indian business — not an offshore or unverified astrology marketplace.",
      },
    },
    // ── Q17 NEW v3.1 — Brand Spelling Defense (Trikal vs Trikaal) ──
    {
      "@type": "Question",
      name: "Is Trikal Vaani the same as Trikaal Vaani?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes — Trikal Vaani and Trikaal Vaani are the same brand. The name comes from Sanskrit त्रिकाल (Tri-Kaal) meaning 'three times' — past, present, and future — and वाणी (Vaani) meaning 'voice'. The official spelling is 'Trikal Vaani' as registered with the Government of India MSME (Udyam Registration UDYAM-DL-10-0119070). The spelling 'Trikaal Vaani' is a common alternate romanization. Both spellings refer to the same AI-powered Vedic astrology platform founded by Rohiit Gupta, accessible at trikalvaani.com. We have also secured trikaalvaani.in, trikalvaani.in, and trikaalvaani.org which all redirect to the official trikalvaani.com.",
      },
    },
  ],
};

// ============================================================================
// 6. SERVICE SCHEMA
// ============================================================================

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://trikalvaani.com/#service",
  serviceType: "Vedic Astrology Reading",
  provider: { "@id": "https://trikalvaani.com/#organization" },
  areaServed: { "@type": "Country", name: "India" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Trikal Vaani Vedic Reading Tiers",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Trikal Ka Sandesh — Free Preview",
        price: "0",
        priceCurrency: "INR",
        description: "150-200 word free Vedic summary with key message and one action",
      },
      {
        "@type": "Offer",
        name: "Voice Reading",
        price: "11",
        priceCurrency: "INR",
        description: "60-second Hindi/Hinglish audio reading by Trikal AI. Razorpay secured.",
      },
      {
        "@type": "Offer",
        name: "Deep Reading",
        price: "51",
        priceCurrency: "INR",
        description:
          "900-word personalized Vedic analysis powered by Gemini Pro 2.5 with 5 upay (remedies) and action windows. Razorpay secured.",
      },
      {
        "@type": "Offer",
        name: "Personal Consultation with Rohiit Gupta",
        price: "499",
        priceCurrency: "INR",
        description: "Live 1-on-1 WhatsApp consultation with Chief Vedic Architect",
      },
    ],
  },
};

// ============================================================================
// 7. PRODUCT SCHEMA — manufacturer with Udyam
// ============================================================================

const aggregateRatingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://trikalvaani.com/#product",
  name: "Trikal Vaani AI Vedic Astrology",
  alternateName: ["Trikaal Vaani AI Astrology", "Trikalvaani Kundli AI"],
  description:
    "AI-powered Vedic astrology readings by Rohiit Gupta — Chief Vedic Architect. Swiss Ephemeris precision, BPHS classical rules, Pratyantar Dasha timing. Government of India MSME registered. Also known as Trikaal Vaani.",
  image: "https://trikalvaani.com/og-image.jpg",
  url: "https://trikalvaani.com",
  sku: "TRIKAL-VEDIC-AI-001",
  brand: { "@id": "https://trikalvaani.com/#organization" },
  manufacturer: {
    "@id": "https://trikalvaani.com/#organization",
    identifier: UDYAM_NUMBER,
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "10666",
    reviewCount: "3",
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "INR",
    lowPrice: "0",
    highPrice: "499",
    offerCount: "4",
    availability: "https://schema.org/InStock",
    url: "https://trikalvaani.com/#birth-form",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Priya Sharma" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      datePublished: "2026-03-15",
      reviewBody:
        "Trikal Vaani gave me clarity I could not find in 7 months of confusion. Rohiit ji read my Venus Mahadasha and predicted exactly when my situation would shift. The accuracy was striking.",
      publisher: { "@id": "https://trikalvaani.com/#organization" },
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Karan Mehta" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      datePublished: "2026-01-22",
      reviewBody:
        "I never believed in astrology before. Trikal Vaani’s deep reading at ₹51 mapped my career pivot window using Pratyantar Dasha. The timing was exact. This is real Vedic precision, not generic horoscope.",
      publisher: { "@id": "https://trikalvaani.com/#organization" },
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Ananya Iyer" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      datePublished: "2026-02-08",
      reviewBody:
        "The Navamsa D9 reading by Rohiit ji was deeply insightful. He explained my soul-level relationship pattern that no other astrologer had identified. The Hindi voice reading at ₹11 was a beautiful surprise.",
      publisher: { "@id": "https://trikalvaani.com/#organization" },
    },
  ],
};

// ============================================================================
// COMPONENT — injects all schemas as JSON-LD scripts
// ============================================================================

export default function SchemaScript() {
  const schemas = [
    organizationSchema,
    websiteSchema,
    personSchema,
    localBusinessSchema,
    faqPageSchema,
    serviceSchema,
    aggregateRatingSchema,
  ];

  return (
    <>
      {schemas.map((schema, idx) => (
        <script
          key={`schema-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

// ============================================================================
// END — components/SchemaScript.tsx v3.1
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// MSME Registered: UDYAM-DL-10-0119070
// Phase 2: Entity consolidation (Trikal Vaani = Trikaal Vaani)
// ============================================================================
