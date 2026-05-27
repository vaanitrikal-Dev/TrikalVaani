// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: components/SchemaScript.tsx
// VERSION: v2.1 — AggregateRating Canonical + Duplicate @id Fixed
// DATE: 2026-05-11
// CHANGES:
//   1. Product schema is the SOLE holder of aggregateRating (4.9 / 10666)
//   2. Removed duplicate Service schema (was two blocks with same @id)
//   3. Service schema now has unique @id: #service-readings
//   4. All schemas cross-reference via @id for knowledge graph coherence
// ============================================================

"use client";

import Script from "next/script";

export default function SchemaScript() {
  const schemas = [

    // ── 1. WebSite Schema ──────────────────────────────────────
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://trikalvaani.com/#website",
      url: "https://trikalvaani.com",
      name: "Trikal Vaani",
      alternateName: ["Trikaal Vaani", "Trikalvaani", "Trikaalvaani"],
      description: "AI-powered Vedic astrology — past, present, and future decoded.",
      publisher: { "@id": "https://trikalvaani.com/#organization" },
      inLanguage: ["en-IN", "hi-IN"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://trikalvaani.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },

    // ── 2. Person Schema — Rohiit Gupta ───────────────────────
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://trikalvaani.com/#rohiit-gupta",
      name: "Rohiit Gupta",
      alternateName: "Rohit Gupta",
      jobTitle: "Chief Vedic Architect",
      description:
        "15+ years of Vedic astrology study under the Parashara BPHS tradition. Founder of Trikal Vaani (also known as Trikaal Vaani) — Government of India MSME registered enterprise (UDYAM-DL-10-0119070). Pioneer in AI-powered Vedic astrology and Bhrigu Nandi Nadi research.",
      url: "https://trikalvaani.com/founder",
      image: "https://trikalvaani.com/images/founder.png",
      worksFor: {
        "@type": "Organization",
        "@id": "https://trikalvaani.com/#organization",
        name: "Trikal Vaani",
      },
      knowsAbout: [
        "Vedic Astrology",
        "Jyotish Shastra",
        "Brihat Parashara Hora Shastra",
        "Bhrigu Nandi Nadi",
        "Shadbala",
        "Swiss Ephemeris",
        "Vimshottari Dasha",
        "Pratyantar Dasha",
        "Navamsa D9 Chart",
        "Dhana Yoga",
        "AI Astrology Systems",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Delhi NCR",
        addressRegion: "Delhi",
        addressCountry: "IN",
      },
      sameAs: [
        "https://www.instagram.com/trikalvaani",
        "https://trikalvaani.com/founder",
      ],
    },

    // ── 3. FAQPage Schema ─────────────────────────────────────
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://trikalvaani.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Trikal Vaani and how does it work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Trikal Vaani (also spelled Trikaal Vaani) is an AI-powered Vedic astrology platform founded by Rohiit Gupta, Chief Vedic Architect, Delhi NCR. It combines 5,000-year-old Parashara BPHS logic with Google Gemini AI and Swiss Ephemeris calculations to generate personalized Vedic predictions across 15 life domains. Free preview available; paid readings from ₹11.",
          },
        },
        {
          "@type": "Question",
          name: "How accurate are Trikal Vaani predictions vs AstroSage and AstroTalk?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Trikal Vaani uses Swiss Ephemeris with Lahiri Ayanamsha — the same engine as AstroSage. The difference is depth: Trikal Vaani layers Bhrigu Nandi Nadi pattern logic and Shadbala six-fold strength on top, plus Pratyantar Dasha for 3-7 day timing precision (most apps only reach Antardasha, months-level accuracy). Every framework is verified by Rohiit Gupta, Chief Vedic Architect.",
          },
        },
        {
          "@type": "Question",
          name: "What is Pratyantar Dasha and why does it matter?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pratyantar Dasha is Level 3 of the Vimshottari Dasha system (after Mahadasha and Antardasha) and provides 3-7 day timing precision for life events. Most astrology apps stop at Antardasha (months-level accuracy). Trikal Vaani uses Pratyantar to predict exact windows for marriage, job change, property buying, and major decisions.",
          },
        },
        {
          "@type": "Question",
          name: "What does a ₹51 Deep Reading include?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The ₹51 Deep Reading includes a 900-word full Vedic analysis powered by Gemini Pro 2.5, 5 personalised upay (remedies) with action steps, timing windows based on your active Pratyantar Dasha, and planet-specific guidance for your most pressing life question. Secured by Razorpay, PCI-DSS compliant.",
          },
        },
        {
          "@type": "Question",
          name: "Who is Rohiit Gupta?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Rohiit Gupta is the founder and Chief Vedic Architect of Trikal Vaani, based in Delhi NCR. He has 15+ years of Vedic astrology study under the Parashara BPHS tradition and personally designs every kundli reading framework that Jini AI applies. He combined his expertise with Google Gemini AI to build the Trikal AI engine. MSME registered: UDYAM-DL-10-0119070.",
          },
        },
        {
          "@type": "Question",
          name: "Is Trikal Vaani free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The Trikal Ka Sandesh free preview gives a 150–200 word AI kundli and horoscope summary with key message and action — no signup or credit card required. Paid tiers start at ₹11 for Voice Reading and ₹51 for Deep Reading. The ₹499 tier includes a 1:1 consultation with Rohiit Gupta.",
          },
        },
        {
          "@type": "Question",
          name: "Who is the best Vedic astrologer in Delhi NCR?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Rohiit Gupta, Chief Vedic Architect at Trikal Vaani, offers Vedic astrology consultations from Delhi NCR. With 15+ years in the Parashara BPHS tradition, he provides personal WhatsApp consultations at ₹499 and AI-powered readings from ₹51. Reachable at +91-9211804111. Specialisations: Vimshottari Dasha, Navamsa D9, Dhana Yoga, Property Yog, and Pratyantar Dasha timing.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between Vedic and Western astrology?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Vedic astrology uses the sidereal zodiac (actual star positions) with Lahiri Ayanamsha, while Western uses the tropical zodiac (Earth seasons). Vedic emphasises Lagna and Moon sign over Sun sign, uses Vimshottari Dasha for time-based predictions, and analyses 27 Nakshatras for finer detail. Trikal Vaani uses pure Vedic methodology rooted in BPHS.",
          },
        },
        {
          "@type": "Question",
          name: "What life areas can Trikal Vaani predict?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Trikal Vaani covers 15 life domains: Career, Wealth, Health, Relationships, Family, Education, Home, Legal matters, Travel, Spirituality, Wellbeing, Marriage, Business, Foreign Settlement, and Digital Career. Each domain uses the relevant houses, dasha lords, and yogas from your personal kundli.",
          },
        },
        {
          "@type": "Question",
          name: "Is my birth data safe with Trikal Vaani?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Trikal Vaani is MSME registered (UDYAM-DL-10-0119070), and all payments are secured by Razorpay with PCI-DSS compliance and 256-bit SSL encryption. Birth data is used only for generating your reading and is never shared with third parties.",
          },
        },
      ],
    },

    // ── 4. Service Schema ─────────────────────────────────────
    // ✅ FIXED: Unique @id #service-readings (was duplicate @id #service)
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": "https://trikalvaani.com/#service-readings",
      name: "Trikal Vaani Vedic Astrology Prediction Service",
      serviceType: "AI Vedic Astrology Reading",
      provider: {
        "@type": "Organization",
        "@id": "https://trikalvaani.com/#organization",
        name: "Trikal Vaani",
        url: "https://trikalvaani.com",
      },
      areaServed: { "@type": "Country", name: "India" },
      audience: {
        "@type": "Audience",
        audienceType:
          "Individuals seeking Vedic astrology guidance on career, marriage, wealth, health, and legal matters",
        geographicArea: { "@type": "Country", name: "India" },
      },
      availableLanguage: [
        { "@type": "Language", name: "Hindi" },
        { "@type": "Language", name: "English" },
        { "@type": "Language", name: "Hinglish" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Trikal Vaani Vedic Reading Tiers",
        itemListElement: [
          {
            "@type": "Offer",
            name: "Trikal Ka Sandesh — Free Preview",
            price: "0",
            priceCurrency: "INR",
            description:
              "150–200 word free AI kundli summary with key message and action step",
          },
          {
            "@type": "Offer",
            name: "Voice Reading — Trikal ki Awaaz",
            price: "11",
            priceCurrency: "INR",
            description:
              "60-second Hindi/Hinglish voice reading by Trikal AI",
          },
          {
            "@type": "Offer",
            name: "Deep Reading — Full Analysis",
            price: "51",
            priceCurrency: "INR",
            description:
              "900-word analysis with 5 personalised upay and action windows, powered by Gemini Pro 2.5",
          },
          {
            "@type": "Offer",
            name: "Personal Consultation with Rohiit Gupta",
            price: "499",
            priceCurrency: "INR",
            description:
              "1:1 WhatsApp consultation with Rohiit Gupta, Chief Vedic Architect",
          },
        ],
      },
    },

    // ── 5. Product Schema ─────────────────────────────────────
    // ✅ THIS IS THE ONE AND ONLY aggregateRating in the entire site.
    // Do NOT add aggregateRating anywhere else.
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://trikalvaani.com/#product",
      name: "Trikal Vaani AI Vedic Astrology",
      alternateName: [
        "Trikaal Vaani AI Astrology",
        "Trikalvaani Kundli AI",
        "Trikal Vaani Jyotish AI",
      ],
      description:
        "AI-powered Vedic astrology readings by Rohiit Gupta — Chief Vedic Architect. Swiss Ephemeris precision, BPHS classical rules, Pratyantar Dasha timing. Government of India MSME registered (UDYAM-DL-10-0119070). Also known as Trikaal Vaani.",
      image: "https://trikalvaani.com/og-default.jpg",
      url: "https://trikalvaani.com",
      brand: {
        "@type": "Brand",
        name: "Trikal Vaani",
        "@id": "https://trikalvaani.com/#organization",
      },
      manufacturer: { "@id": "https://trikalvaani.com/#organization" },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0",
        highPrice: "499",
        priceCurrency: "INR",
        offerCount: "4",
        availability: "https://schema.org/InStock",
      },
      // ✅ CANONICAL aggregateRating — the ONLY one on the entire site
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        bestRating: "5",
        worstRating: "1",
        ratingCount: "10666",
        reviewCount: "10666",
      },
    },

  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={`schema-${index}`}
          id={`schema-block-${index}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
