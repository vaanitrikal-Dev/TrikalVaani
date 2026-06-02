// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: components/SchemaScript.tsx
// VERSION: v3.0 — Fake rating removed + brand flip + global GEO/AEO/E-E-A-T
// DATE: 2026-05-27
// CHANGES vs v2.1 (CEO-approved, IR-0 compliant):
//   REMOVED (landmines):
//     ❌ Fake aggregateRating (4.9 / 10666) — DELETED. No fake stats (IR-0).
//        Re-add only with real Razorpay-verified reviews.
//     ❌ FAQPage block — REMOVED. Owned by HomepageSchema v2.0 (#faq,
//        homepage-only). Keeping it here duplicated the @id sitewide AND
//        re-injected Delhi NCR + ₹499 + vendor names on every page.
//     ❌ ₹499 Personal Consultation offer — removed from Service catalog.
//     ❌ Delhi NCR PostalAddress pin — removed from Person.
//     ❌ Vendor names (Gemini Pro 2.5 / Google Gemini / Trikaal AI engine)
//        — replaced with "premium AI engine with expert polish".
//   ADDED (SEO/GEO/AEO/E-E-A-T firepower):
//     ✅ BRAND FLIP "Trikaal Vaani" -> "Trikaal Vaani" (WebSite, Service,
//        Product, brand names). alternateName arrays keep both spellings.
//     ✅ GLOBAL: Service + Product areaServed/description -> India + Worldwide.
//     ✅ E-E-A-T: Person hasCredential (15+ yrs BPHS), nationality India,
//        knowsLanguage, expanded knowsAbout, real sameAs (IG/YT/FB).
//     ✅ Service: dateModified freshness, availableChannel, author cross-link
//        to #rohiit-gupta, 3-language availability, entity-rich description.
//     ✅ WebSite: SearchAction kept, global description, both brand spellings.
//   SCHEMA OWNERSHIP (no sitewide collisions):
//     SchemaScript (sitewide) → WebSite + Service + Product
//     HomepageSchema (homepage) → Person + FAQPage + HowTo + Breadcrumb
//     layout.tsx → Organization + WebApplication
//   NOTE: Person #rohiit-gupta kept here as the sitewide author entity;
//   it matches HomepageSchema's #rohiit-gupta exactly (same @id, consistent
//   data) so the two reinforce rather than conflict.
//   All schemas cross-reference via @id for knowledge graph coherence.
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
      name: "Trikaal Vaani",
      alternateName: ["Trikal Vaani", "Trikalvaani", "Trikaalvaani"],
      description: "AI-powered Vedic astrology — past, present, and future decoded. Free kundli and accurate predictions across India and worldwide.",
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
      alternateName: ["Rohit Gupta", "रोहित गुप्ता"],
      jobTitle: "Chief Vedic Architect",
      description:
        "15+ years of Vedic astrology study under the Parashara BPHS tradition. Founder of Trikaal Vaani (legally Trikaal Vaani Global) — a Government of India MSME registered enterprise (UDYAM-DL-10-0119070) serving seekers across India and worldwide. Specialist in Bhrigu Nandi Nadi karmic analysis, Shadbala six-fold strength, and AI-powered Vedic astrology.",
      url: "https://trikalvaani.com/founder",
      image: "https://trikalvaani.com/images/founder.png",
      worksFor: { "@id": "https://trikalvaani.com/#organization" },
      nationality: { "@type": "Country", name: "India" },
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Professional Experience",
        name: "15+ years of Vedic astrology practice (Parashara BPHS tradition)",
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
        "Kundali Matching",
        "Muhurat Selection",
        "AI Astrology Systems",
      ],
      knowsLanguage: ["Hindi", "English"],
      sameAs: [
        "https://www.instagram.com/thetrikalvaani",
        "https://www.youtube.com/@TheTrikalVaani",
        "https://www.facebook.com/people/Trikal-Vaani-Voice",
        "https://trikalvaani.com/founder",
      ],
    },

    // ── 3. Service Schema (sitewide) ──────────────────────────
    // Owns #service-readings. Person + FAQPage are owned by HomepageSchema
    // (homepage-only) to avoid sitewide @id collision.
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": "https://trikalvaani.com/#service-readings",
      name: "Trikaal Vaani Vedic Astrology Prediction Service",
      serviceType: "AI Vedic Astrology Reading",
      description:
        "AI-powered Vedic astrology: free kundli, accurate predictions across 15 life domains, Kundali Milan, Child Birth Muhurat, Karmic Reading and voice guidance — computed with Swiss Ephemeris precision and Brihat Parashara Hora Shastra classical rules, in English, Hindi and Hinglish.",
      provider: { "@id": "https://trikalvaani.com/#organization" },
      author: { "@id": "https://trikalvaani.com/#rohiit-gupta" },
      url: "https://trikalvaani.com",
      dateModified: "2026-05-27",
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "Place", name: "Worldwide" },
      ],
      audience: {
        "@type": "Audience",
        audienceType:
          "Individuals seeking Vedic astrology guidance on career, marriage, wealth, health, and legal matters",
      },
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: "https://trikalvaani.com",
        availableLanguage: ["en", "hi"],
      },
      availableLanguage: [
        { "@type": "Language", name: "Hindi" },
        { "@type": "Language", name: "English" },
        { "@type": "Language", name: "Hinglish" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Trikaal Vaani Vedic Reading Tiers",
        itemListElement: [
          {
            "@type": "Offer",
            name: "Trikaal Ka Sandesh — Free Preview",
            price: "0",
            priceCurrency: "INR",
            description:
              "150–200 word free AI kundli summary with key message and action step",
          },
          {
            "@type": "Offer",
            name: "Voice Reading — Trikaal ki Awaaz",
            price: "11",
            priceCurrency: "INR",
            description:
              "60-second Hindi/Hinglish voice reading by Trikaal AI",
          },
          {
            "@type": "Offer",
            name: "Deep Reading — Full Analysis",
            price: "51",
            priceCurrency: "INR",
            description:
              "900-word analysis with 5 personalised upay and action windows, premium AI engine with expert polish",
          },
        ],
      },
    },

    // ── 4. Product Schema ─────────────────────────────────────
    // NOTE: aggregateRating intentionally REMOVED — no fake ratings.
    // Re-add ONLY when real Razorpay-verified reviews accumulate.
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "https://trikalvaani.com/#product",
      name: "Trikaal Vaani AI Vedic Astrology",
      alternateName: [
        "Trikaal Vaani AI Astrology",
        "Trikalvaani Kundli AI",
        "Trikaal Vaani Jyotish AI",
      ],
      description:
        "AI-powered Vedic astrology readings by Rohiit Gupta — Chief Vedic Architect. Swiss Ephemeris precision, BPHS Parashara classical rules, Bhrigu Nandi Nadi, Shadbala, and Pratyantar Dasha timing. Serving India and worldwide. Government of India MSME registered (UDYAM-DL-10-0119070).",
      image: "https://trikalvaani.com/og-default.jpg",
      url: "https://trikalvaani.com",
      brand: {
        "@type": "Brand",
        name: "Trikaal Vaani",
        "@id": "https://trikalvaani.com/#organization",
      },
      manufacturer: { "@id": "https://trikalvaani.com/#organization" },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0",
        highPrice: "251",
        priceCurrency: "INR",
        offerCount: "6",
        availability: "https://schema.org/InStock",
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
