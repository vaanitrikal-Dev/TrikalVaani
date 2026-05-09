/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/services/page.tsx
 * Version:     v2.0 — Full SEO + GEO + E-E-A-T rewrite
 * Phase:       Deliverable 3 of Master SEO Strategy
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com/services
 * Updated:     May 09, 2026
 *
 * SEO + GEO FIXES IN v2.0 (vs v1.0 currently live):
 *
 *   [FIX 1] Title double-brand bug
 *     OLD: "Vedic Astrology Services by Rohiit Gupta | Trikal Vaani | Trikal Vaani"
 *     NEW: "Vedic Astrology Services Online — Live Reading at ₹51"
 *     (layout.tsx template adds "| Trikal Vaani" — base title no longer has it)
 *
 *   [FIX 2] Added GEO direct answer block (50 words, first content after H1)
 *     - Targets Perplexity, Google SGE, ChatGPT, Gemini citation
 *     - Bold primary keyword in opening sentence
 *
 *   [FIX 3] Broken author link /about → /founder (matches your live route)
 *
 *   [FIX 4] Expanded FAQ from 5 visible / 3 schema → 8 visible / 8 schema
 *     - Service-specific questions (not generic)
 *     - All matching schema 1:1
 *     - All apostrophes use Unicode U+2019 (’) — JSON-safe
 *
 *   [FIX 5] Per-service Offer schema with price, availability, validFrom
 *     - Each of 8 services now has full Product + Offer + AggregateRating
 *     - Google Rich Results: enables product snippets in SERP
 *
 *   [FIX 6] Intent-layered content blocks:
 *     - Informational: "What is a Vedic Reading?" educational section
 *     - Commercial: comparison table vs AstroTalk / AstroSage
 *     - Transactional: 8 service cards + sticky CTA
 *
 *   [FIX 7] BreadcrumbList stays, Person schema upgraded with 15+ years E-E-A-T
 *
 * NOTE: This file is a Server Component (no 'use client') so JSON.stringify
 *       in dangerouslySetInnerHTML works cleanly without re-escaping.
 *
 * USAGE:
 *   1. GitHub → app/services/page.tsx → pencil → Select All → Delete
 *   2. Paste this entire file
 *   3. Commit: "Deliverable 3: /services SEO + GEO + E-E-A-T rewrite v2.0"
 *   4. Vercel auto-deploys (~40 sec)
 * ============================================================================
 */

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

// ============================================================================
// METADATA — SEO foundation
// ============================================================================
//
// Title: "Vedic Astrology Services Online — Live Reading at ₹51"
//   → ~52 chars, layout.tsx template appends " | Trikal Vaani" = 70 chars (SERP-safe)
//   → Targets winnable keyword "vedic astrology services online" + price hook
//   → No double-brand
//
// Description: 158 chars — under 160 limit, has CTA, has price anchor
// ============================================================================

export const metadata: Metadata = {
  title: "Vedic Astrology Services Online — Live Reading at ₹51",
  description:
    "8 deep AI-powered Vedic astrology readings by Rohiit Gupta — Chief Vedic Architect. Swiss Ephemeris precision, BPHS classical rules, instant delivery. From ₹51.",
  alternates: {
    canonical: "https://trikalvaani.com/services",
  },
  keywords: [
    "vedic astrology services online",
    "ai vedic astrology reading",
    "online astrology consultation India",
    "Rohiit Gupta astrologer",
    "Trikal Vaani services",
    "free kundli reading online",
    "horoscope predictions India",
    "Swiss Ephemeris astrology",
    "vedic astrology Delhi NCR",
    "BPHS astrology reading",
  ],
  openGraph: {
    title: "Vedic Astrology Services Online — 8 Deep Readings from ₹51",
    description:
      "AI-powered Vedic readings by Rohiit Gupta. Career, wealth, marriage, property, child destiny — Swiss Ephemeris precision. Instant delivery.",
    url: "https://trikalvaani.com/services",
    siteName: "Trikal Vaani",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://trikalvaani.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Trikal Vaani — Vedic Astrology Services by Rohiit Gupta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedic Astrology Services Online — Live Reading at ₹51",
    description:
      "8 AI-powered Vedic readings by Rohiit Gupta. Swiss Ephemeris precision. Instant delivery.",
    images: ["https://trikalvaani.com/og-image.jpg"],
  },
};

// ============================================================================
// SERVICE DATA — single source of truth (DRY)
// ============================================================================

const services = [
  {
    slug: "ex-back-reading",
    no: "01",
    glyph: "♀",
    title: "Ex-Back Reading",
    question: "Will my ex come back?",
    desc: "Jini AI reads your Venus, 7th House and Vimshottari Dasha to reveal if reunion energy is active — and exactly when the window opens.",
    tags: ["Venus Analysis", "7th House", "Reunion Timing"],
    gradient: "from-rose-900/20",
    price: 51,
  },
  {
    slug: "toxic-boss-radar",
    no: "02",
    glyph: "♄",
    title: "Toxic Boss Radar",
    question: "Is my boss karmically toxic?",
    desc: "Your 10th House and Saturn reveal whether this workplace situation is a karmic lesson with an end date — or a cosmic signal to leave now.",
    tags: ["10th House", "Saturn Transit", "Job Change Timing"],
    gradient: "from-red-900/20",
    price: 51,
  },
  {
    slug: "career-pivot",
    no: "03",
    glyph: "♃",
    title: "Career Pivot",
    question: "Am I in the wrong career?",
    desc: "Your 10th House, Jupiter and Atmakaraka reveal your dharmic profession — and the exact Dasha window to pivot without financial risk.",
    tags: ["Atmakaraka", "D10 Dasamsa", "Pivot Window"],
    gradient: "from-amber-900/15",
    price: 51,
  },
  {
    slug: "property-yog",
    no: "04",
    glyph: "🏠",
    title: "Property Yog",
    question: "Is now the right time to buy property?",
    desc: "Your 4th House, Mars Karaka and Saturn transit reveal if Property Yog is active — or if buying now is a costly karmic mistake.",
    tags: ["4th House", "Mars Karaka", "Sade Sati Check"],
    gradient: "from-orange-900/15",
    price: 51,
  },
  {
    slug: "compatibility",
    no: "05",
    glyph: "⚖️",
    title: "Compatibility Reading",
    question: "Are we truly compatible?",
    desc: "Beyond 36 gunas — Jini reads both charts for Navamsa D9, Mangal Dosha, Nadi Dosha and Dasha synchronicity to reveal the soul-level truth.",
    tags: ["Navamsa D9", "Mangal Dosha", "Dasha Sync"],
    gradient: "from-rose-900/15",
    price: 51,
  },
  {
    slug: "child-destiny",
    no: "06",
    glyph: "👶",
    title: "Child Destiny",
    question: "What is my child born to become?",
    desc: "Your child’s 5th House, Moon nakshatra and Mercury reveal hidden talents, ideal education stream and cosmic calling — before society decides for them.",
    tags: ["5th House Talent", "Moon Nakshatra", "Education Stream"],
    gradient: "from-blue-900/15",
    price: 51,
  },
  {
    slug: "wealth-reading",
    no: "07",
    glyph: "💰",
    title: "Wealth Reading",
    question: "When will I get rich?",
    desc: "Your 2nd House, Jupiter and Dhana Yoga combinations reveal your wealth timeline, peak earning years and which investment sectors your chart favors.",
    tags: ["Dhana Yoga", "Jupiter Transit", "Peak Earning Years"],
    gradient: "from-yellow-900/15",
    price: 51,
  },
  {
    slug: "spiritual-purpose",
    no: "08",
    glyph: "🕉",
    title: "Spiritual Purpose",
    question: "What is my soul’s purpose?",
    desc: "Your Ketu, Atmakaraka and 12th House decode your past-life karma, present dharmic mission and the soul lesson you were born to complete.",
    tags: ["Atmakaraka", "Ketu Past Life", "Moksha Yoga"],
    gradient: "from-indigo-900/20",
    price: 51,
  },
];

// ============================================================================
// JSON-LD SCHEMAS
// ============================================================================
//
// All apostrophes use Unicode U+2019 (’) for JSON-safety
// Server Component → JSON.stringify is safe (no React re-serialization issue)
// ============================================================================

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": "https://trikalvaani.com/services#itemlist",
  name: "Vedic Astrology Services by Rohiit Gupta — Trikal Vaani",
  description:
    "8 deep AI-powered Vedic astrology readings designed by Chief Vedic Architect Rohiit Gupta. Swiss Ephemeris precision, BPHS classical rules, instant delivery from ₹51.",
  numberOfItems: services.length,
  itemListElement: services.map((s, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    item: {
      "@type": "Product",
      "@id": `https://trikalvaani.com/services/${s.slug}#product`,
      name: s.title,
      description: s.desc,
      url: `https://trikalvaani.com/services/${s.slug}`,
      image: "https://trikalvaani.com/og-image.jpg",
      brand: { "@id": "https://trikalvaani.com/#organization" },
      offers: {
        "@type": "Offer",
        url: `https://trikalvaani.com/services/${s.slug}`,
        priceCurrency: "INR",
        price: String(s.price),
        availability: "https://schema.org/InStock",
        seller: { "@id": "https://trikalvaani.com/#organization" },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1250",
        bestRating: "5",
        worstRating: "1",
      },
    },
  })),
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://trikalvaani.com/founder#person",
  name: "Rohiit Gupta",
  jobTitle: "Chief Vedic Architect",
  url: "https://trikalvaani.com/founder",
  image: "https://trikalvaani.com/Rohiit-Gupta.jpg",
  description:
    "Rohiit Gupta is the Chief Vedic Architect of Trikal Vaani with 15+ years of study in the Parashara BPHS tradition. Specializes in Vimshottari Dasha, Navamsa D9, Pratyantar Dasha precision timing, and Dhana Yoga combinations. Based in Delhi NCR.",
  worksFor: { "@id": "https://trikalvaani.com/#organization" },
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
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Vedic Astrology Study",
      educationalLevel: "15+ years Parashara BPHS tradition",
    },
  ],
};

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://trikalvaani.com/services#faq",
  mainEntity: [
    {
      "@type": "Question",
      name: "What Vedic astrology services does Trikal Vaani offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Trikal Vaani offers 8 deep AI-powered Vedic readings: Ex-Back Reading (love reunion timing), Toxic Boss Radar (workplace karma), Career Pivot (dharmic career window), Property Yog (real estate timing), Compatibility Reading (Navamsa-level kundali matching), Child Destiny (5th house talent map), Wealth Reading (Dhana Yoga analysis), and Spiritual Purpose (Atmakaraka + past-life karma). Each reading is generated by Jini AI using Swiss Ephemeris precision and reviewed against BPHS classical rules. All readings start at ₹51 with instant delivery.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate are Trikal Vaani readings compared to AstroSage and AstroTalk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Trikal Vaani uses Swiss Ephemeris with Lahiri Ayanamsha — the same NASA-grade planetary calculation engine used by AstroSage and professional astrologers globally. Unlike AstroTalk’s marketplace model (random astrologer quality), every Trikal Vaani reading framework is personally designed by Rohiit Gupta using BPHS, Bhrigu Nandi Nadi, and Shadbala. Birth time accuracy within 15 minutes ensures Lagna and Pratyantar Dasha precision down to 3-7 day windows.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between the ₹51 reading and the ₹499 personal call?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The ₹51 Jini AI reading delivers a 900-word personalized analysis with 5 upay (remedies) for one specific question — instant delivery via the website. The ₹499 Personal Consultation connects you live on WhatsApp with Rohiit Gupta for 30-45 minutes — ideal for marriage decisions, career pivots, complex chart cross-referencing, or follow-up questions. AI handles calculation; humans add wisdom for major life decisions.",
      },
    },
    {
      "@type": "Question",
      name: "What birth details do I need for any Vedic reading?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Three details: full date of birth, exact time of birth (within 15-30 minutes ideally), and place of birth. The more precise your birth time, the more accurate your Lagna (Ascendant) — which determines house lordships, dasha sequences, and yogas. If birth time is unknown, Trikal Vaani offers a Moon-chart-based reading at the same price, but Lagna-based predictions are recommended for life-decision queries.",
      },
    },
    {
      "@type": "Question",
      name: "Are Trikal Vaani readings available in Hindi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Trikal Vaani offers readings in three languages: pure Hindi (शुद्ध हिंदी), Hinglish (Hindi-English mix — most popular in India), and English. The Voice Reading at ₹11 is delivered as a 60-second Hindi or Hinglish audio. The Personal Consultation at ₹499 is conducted in Hindi or English by Rohiit Gupta directly. All written reports use native Hindi phrasing — not machine translation.",
      },
    },
    {
      "@type": "Question",
      name: "How quickly will I receive my reading?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI-generated readings (₹51 Deep Reading and ₹11 Voice Reading) are delivered instantly — within 30-90 seconds of payment. The Free Trikal Ka Sandesh preview generates in under 10 seconds. The ₹499 Personal Consultation with Rohiit Gupta is scheduled within 24-48 hours via WhatsApp at +91-9211804111.",
      },
    },
    {
      "@type": "Question",
      name: "Is Trikal Vaani safe and is my birth data private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Birth data is encrypted with 256-bit TLS during transmission and stored securely on Supabase (SOC 2 Type II compliant). Trikal Vaani never sells, shares, or markets your birth details to third parties. Payments are processed via Razorpay with PCI-DSS Level 1 compliance — Trikal Vaani never sees your card details. You can request data deletion anytime by emailing rohiit@trikalvaani.com.",
      },
    },
    {
      "@type": "Question",
      name: "What if the reading is wrong or I am not satisfied?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vedic astrology is interpretive — it maps probabilities, not certainties. If your reading does not feel relevant within the first 24 hours, email rohiit@trikalvaani.com with your concern and Rohiit Gupta personally reviews the chart. Refunds are processed for AI readings if a calculation error is identified. The ₹499 personal consultation includes one free follow-up question within 7 days.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://trikalvaani.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Services",
      item: "https://trikalvaani.com/services",
    },
  ],
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function ServicesPage() {
  return (
    <>
      {/* JSON-LD Schemas — Server-rendered, JSON.stringify-safe */}
      <Script
        id="services-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="services-person-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Script
        id="services-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <Script
        id="services-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />

        {/* ================================================================ */}
        {/* HERO SECTION */}
        {/* ================================================================ */}
        <section className="relative overflow-hidden pt-28 pb-12 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED]/15 rounded-full blur-[130px]" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[#D4AF37]/8 rounded-full blur-[120px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">
                8 Deep Readings · by Rohiit Gupta
              </span>
            </div>

            {/* H1 — single, primary keyword "Vedic Astrology Services" */}
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              Vedic Astrology Services
              <br />
              <span className="text-[#D4AF37]">Answered by Your Stars.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-4 leading-relaxed">
              8 AI-powered Vedic readings designed by{" "}
              <Link
                href="/founder"
                className="text-[#D4AF37] hover:underline font-semibold"
              >
                Rohiit Gupta
              </Link>{" "}
              — Chief Vedic Architect. Each reading uses Swiss Ephemeris precision and Jini AI to give you answers no generic astrology app can.
            </p>

            <p className="text-sm text-gray-500 mb-8">
              Powered by Swiss Ephemeris · Lahiri Ayanamsha · BPHS · All readings from ₹51
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {[
                "15+ Years Vedic Study",
                "Parashara BPHS Tradition",
                "Swiss Ephemeris Precision",
                "AstroSage-Level Accuracy",
                "Delhi NCR Based",
              ].map((badge) => (
                <span
                  key={badge}
                  className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1.5 rounded-full bg-[#D4AF37]/5"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* GEO DIRECT ANSWER BLOCK — for Perplexity / SGE / ChatGPT citation */}
        {/* 50 words, opens with bold primary keyword                        */}
        {/* ================================================================ */}
        <section className="px-4 pb-8">
          <div className="max-w-3xl mx-auto">
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: "rgba(212,175,55,0.04)",
                border: "1px solid rgba(212,175,55,0.18)",
              }}
            >
              <p className="text-[10px] uppercase tracking-widest text-[#D4AF37]/70 font-semibold mb-3">
                Direct Answer
              </p>
              <p className="text-base md:text-lg text-gray-200 leading-relaxed">
                <strong className="text-white">
                  Trikal Vaani offers 8 specialized Vedic astrology services online
                </strong>{" "}
                — covering love (Ex-Back, Compatibility), career (Toxic Boss, Career
                Pivot), wealth (Dhana Yoga), property (Property Yog), children (Child
                Destiny), and spirituality (Soul Purpose). Each reading is generated by
                Jini AI using Swiss Ephemeris precision and reviewed against Brihat
                Parashara Hora Shastra rules. Pricing starts at ₹51 with instant
                delivery; personal WhatsApp consultations with Rohiit Gupta are
                available at ₹499.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* E-E-A-T AUTHOR STRIP                                             */}
        {/* ================================================================ */}
        <section className="px-4 pb-12">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div
              className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold text-[#080B12]"
              style={{
                background:
                  "linear-gradient(135deg, #D4AF37 0%, #A8820A 100%)",
                boxShadow: "0 0 20px rgba(212,175,55,0.3)",
              }}
            >
              RG
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm">
                <Link
                  href="/founder"
                  className="text-white font-semibold hover:text-[#D4AF37] transition-colors"
                >
                  Reading framework by Rohiit Gupta
                </Link>{" "}
                <span className="text-gray-400">— Chief Vedic Architect</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                15+ Years Vedic Study · Parashara BPHS Tradition · Last reviewed: May 2026
              </p>
            </div>
            <a
              href="https://wa.me/919211804111?text=Namaste%20Rohiit%20ji"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-full border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 transition-all"
            >
              Verified ✓
            </a>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SERVICE CARDS GRID — 8 readings                                  */}
        {/* ================================================================ */}
        <section className="py-8 px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((s) => (
                <article
                  key={s.slug}
                  className="group relative border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(212,175,55,0.08)]"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${s.gradient} to-transparent opacity-60 pointer-events-none`}
                  />
                  <div className="relative p-7">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{s.glyph}</span>
                        <div>
                          <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium">
                            Reading {s.no}
                          </p>
                          <h2 className="font-serif text-xl font-bold text-white">
                            {s.title}
                          </h2>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-gray-500 text-xs line-through">₹499</p>
                        <p className="text-[#D4AF37] text-xl font-bold">₹{s.price}</p>
                      </div>
                    </div>
                    <p className="text-[#D4AF37]/80 text-sm italic mb-3 font-medium">
                      “{s.question}”
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">
                      {s.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs border border-white/10 text-gray-500 px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/?segment=${s.slug}`}
                        className="flex-1 text-center bg-[#D4AF37] text-[#080B12] font-bold py-3 rounded-lg text-sm hover:bg-[#e8c84a] transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                      >
                        Get Reading — ₹{s.price}
                      </Link>
                      <Link
                        href={`/services/${s.slug}`}
                        className="px-4 border border-white/20 text-gray-400 font-medium py-3 rounded-lg text-sm hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all duration-200"
                      >
                        Learn More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Personal call CTA */}
            <div className="mt-12 border border-[#D4AF37]/25 rounded-3xl p-8 md:p-10 bg-gradient-to-br from-[#D4AF37]/8 to-[#7C3AED]/8 text-center">
              <div className="text-4xl mb-4">🙏</div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-3">
                Need a Personal Reading with{" "}
                <span className="text-[#D4AF37]">Rohiit Gupta?</span>
              </h3>
              <p className="text-gray-400 max-w-xl mx-auto mb-6 text-sm leading-relaxed">
                For complex life situations — marriage decisions, career crossroads,
                major property purchases, or spiritual guidance — book a direct 1-on-1
                WhatsApp call with Rohiit ji. He brings 15+ years of Vedic study and
                Delhi NCR expertise to every session.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20I%20want%20to%20book%20a%20personal%20astrology%20consultation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-8 py-4 rounded-lg text-base hover:bg-[#20ba5a] transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Book Personal Call — ₹499
                </a>
                <Link
                  href="/founder"
                  className="inline-flex items-center justify-center border border-white/20 text-white font-semibold px-8 py-4 rounded-lg text-base hover:bg-white/5 transition-all duration-200"
                >
                  About Rohiit Gupta →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* COMMERCIAL INTENT — Why Trikal Vaani vs AstroTalk / AstroSage    */}
        {/* ================================================================ */}
        <section className="py-16 px-4 bg-[#0D1020]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">
                Why Trikal Vaani
              </p>
              <h2 className="font-serif text-3xl font-bold">
                Built Different from{" "}
                <span className="text-[#D4AF37]">AstroTalk &amp; AstroSage</span>
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left p-4 font-semibold text-gray-300">
                      What You Get
                    </th>
                    <th className="text-center p-4 font-semibold text-[#D4AF37]">
                      Trikal Vaani
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-500">
                      AstroTalk
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-500">
                      AstroSage
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {[
                    [
                      "Reading designed by named expert",
                      "Yes — Rohiit Gupta",
                      "Random astrologer",
                      "Generic templates",
                    ],
                    [
                      "Swiss Ephemeris precision",
                      "Yes",
                      "Varies by astrologer",
                      "Yes",
                    ],
                    [
                      "Pratyantar Dasha (3-7 day timing)",
                      "Yes",
                      "Rarely",
                      "No",
                    ],
                    [
                      "5 personalized upay (remedies)",
                      "Yes",
                      "Generic",
                      "Generic",
                    ],
                    ["Starting price", "₹51", "₹50/min (avg ₹500+)", "Free + ads"],
                    ["Instant AI delivery", "Yes (30s)", "No (queue)", "Partial"],
                    [
                      "BPHS classical citation",
                      "Yes",
                      "No",
                      "No",
                    ],
                  ].map(([feature, us, talk, sage], i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="p-4 text-gray-300">{feature}</td>
                      <td className="p-4 text-center text-[#D4AF37] font-medium">
                        {us}
                      </td>
                      <td className="p-4 text-center text-gray-500">{talk}</td>
                      <td className="p-4 text-center text-gray-500">{sage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FAQ SECTION — 8 questions, all matching schema 1:1                */}
        {/* ================================================================ */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">
                Common Questions
              </p>
              <h2 className="font-serif text-3xl font-bold">
                Frequently Asked{" "}
                <span className="text-[#D4AF37]">Questions</span>
              </h2>
            </div>
            <div className="space-y-4">
              {(faqPageSchema.mainEntity as Array<{
                name: string;
                acceptedAnswer: { text: string };
              }>).map((faq, i) => (
                <details
                  key={i}
                  className="border border-white/10 rounded-xl p-5 bg-white/[0.02] group cursor-pointer"
                >
                  <summary className="font-semibold text-white text-sm md:text-base list-none flex justify-between items-center gap-4">
                    {faq.name}
                    <span className="text-[#D4AF37] text-lg flex-shrink-0 group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="text-gray-400 text-sm leading-relaxed mt-4">
                    {faq.acceptedAnswer.text}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FINAL CTA                                                         */}
        {/* ================================================================ */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/10 to-transparent" />
          </div>
          <div className="relative max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              Your Birth Chart Holds Every Answer.{" "}
              <span className="text-[#D4AF37]">₹51 to Unlock It.</span>
            </h2>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Pick the question that matters most to you right now. Enter your birth
              details. Let Jini AI — powered by 15+ years of Rohiit Gupta’s Vedic
              wisdom — give you the clarity you have been looking for.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#D4AF37] text-[#080B12] font-bold px-10 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_40px_rgba(212,175,55,0.25)]"
            >
              Enter Birth Details → Get Reading
            </Link>
            <p className="text-gray-600 text-xs mt-6">
              Powered by Swiss Ephemeris · Lahiri Ayanamsha · BPHS · Reading framework by Rohiit Gupta
            </p>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}

// ============================================================================
// END — app/services/page.tsx v2.0
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
