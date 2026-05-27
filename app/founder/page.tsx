/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/founder/page.tsx
 * Version:     v4.3 — Brand Spelling Consolidation (Trikal = Trikaal)
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com
 * Updated:     May 10, 2026
 *
 * WHAT CHANGED FROM v4.2:
 *   ✅ Metadata title includes both spellings (Trikal + Trikaal)
 *   ✅ Description mentions both spellings for AI extraction
 *   ✅ Keywords expanded with Trikaal Vaani variants
 *   ✅ Person schema alternateName: Trikaal Vaani spellings
 *   ✅ Organization schema alternateName array (7 spellings)
 *   ✅ Person sameAs links Instagram @thetrikalvaani
 *   ✅ NEW "The Origin" section — Sanskrit etymology + spelling
 *   ✅ Hero credential pill: "Trikaal Vaani Founder"
 *   ✅ Vision section: brand consolidation paragraph added
 *   ✅ FAQPage schema with 4 spelling-specific Q&As (NEW)
 *   ✅ Tagline footer mentions both spellings
 *
 * PRESERVED FROM v4.2:
 *   ✅ All MSME UDYAM-DL-10-0119070 content
 *   ✅ Image path /Rohiit-Gupta.jpg (3 places)
 *   ✅ Trust & Verification section
 *   ✅ All CTAs and pricing
 *   ✅ Layout, colors, animations
 * ============================================================================
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

const UDYAM_NUMBER = "UDYAM-DL-10-0119070";
const UDYAM_VERIFY_URL = "https://udyamregistration.gov.in/Udyam_Verify.aspx";
const INSTAGRAM_URL = "https://instagram.com/thetrikalvaani";

export const metadata: Metadata = {
  title: "Rohiit Gupta — Chief Vedic Architect | Trikal Vaani (Trikaal Vaani)",
  description:
    "Rohiit Gupta — Founder of Trikal Vaani (also known as Trikaal Vaani). 15+ years Vedic astrology under Parashara BPHS tradition. Government of India MSME registered (UDYAM-DL-10-0119070). Chief Vedic Architect behind Jini AI — India's first AI-powered Vedic astrology platform, Delhi NCR.",
  keywords: [
    "Rohiit Gupta",
    "Rohiit Gupta astrologer Delhi",
    "Trikal Vaani founder",
    "Trikaal Vaani founder",
    "Trikal Vaani Rohiit Gupta",
    "Trikaal Vaani Rohiit Gupta",
    "vedic astrologer Delhi NCR",
    "Chief Vedic Architect",
    "Rohiit Gupta vedic astrology",
    "MSME registered astrology",
    "Udyam registered Vedic platform",
    "AI Vedic astrology India",
    "Jini AI astrology",
  ],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  alternates: {
    canonical: "https://trikalvaani.com/founder",
    languages: {
      "en-IN": "https://trikalvaani.com/founder",
      "hi-IN": "https://trikalvaani.com/hi/founder",
      "x-default": "https://trikalvaani.com/founder",
    },
  },
  openGraph: {
    title: "Rohiit Gupta — Founder of Trikal Vaani (Trikaal Vaani)",
    description:
      "15+ years Vedic astrology. Founder of Trikal Vaani (also Trikaal Vaani) — MSME registered (UDYAM-DL-10-0119070). Chief Vedic Architect behind Jini AI.",
    url: "https://trikalvaani.com/founder",
    siteName: "Trikal Vaani",
    type: "profile",
    locale: "en_IN",
    images: [
      {
        url: "https://trikalvaani.com/Rohiit-Gupta.jpg",
        width: 800,
        height: 800,
        alt: "Rohiit Gupta — Chief Vedic Architect, Trikal Vaani (Trikaal Vaani)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rohiit Gupta — Founder of Trikal Vaani (Trikaal Vaani)",
    description:
      "15+ years Vedic astrology. Founder of Trikal Vaani / Trikaal Vaani. MSME Registered. Delhi NCR.",
    site: "@thetrikalvaani",
    images: ["https://trikalvaani.com/Rohiit-Gupta.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

// ============================================================================
// JSON-LD SCHEMAS — Page-specific GEO + Brand consolidation
// ============================================================================

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    // ── Person Schema (Rohiit Gupta — E-E-A-T) ──
    {
      "@type": "Person",
      "@id": "https://trikalvaani.com/founder#rohiit-gupta",
      name: "Rohiit Gupta",
      alternateName: "Rohit Gupta",
      jobTitle: "Chief Vedic Architect",
      image: "https://trikalvaani.com/Rohiit-Gupta.jpg",
      description:
        "Rohiit Gupta has studied Vedic astrology for over 15 years under the Parashara BPHS tradition. He is the founder of Trikal Vaani (also known as Trikaal Vaani) — India's first AI-powered Vedic astrology platform, registered as a Government of India MSME enterprise (UDYAM-DL-10-0119070).",
      url: "https://trikalvaani.com/founder",
      email: "rohiit@trikalvaani.com",
      telephone: "+919211804111",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Delhi NCR",
        addressRegion: "Delhi",
        addressCountry: "IN",
      },
      worksFor: {
        "@type": "Organization",
        "@id": "https://trikalvaani.com/#organization",
        name: "Trikal Vaani",
        alternateName: ["Trikaal Vaani", "Trikalvaani", "Trikaalvaani"],
        url: "https://trikalvaani.com",
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
        "Bhrigu Nandi Nadi",
        "Shadbala",
        "Dhana Yoga",
        "Property Yog",
        "Atmakaraka Analysis",
      ],
      knowsLanguage: ["en", "hi"],
      sameAs: [
        INSTAGRAM_URL,
        "https://trikalvaani.com",
        "https://trikalvaani.com/trikaal-vaani",
      ],
    },
    // ── Organization Schema (Brand spelling consolidation) ──
    {
      "@type": "Organization",
      "@id": "https://trikalvaani.com/#organization",
      name: "Trikal Vaani",
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
      logo: "https://trikalvaani.com/logo.png",
      founder: {
        "@type": "Person",
        "@id": "https://trikalvaani.com/founder#rohiit-gupta",
        name: "Rohiit Gupta",
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
      description:
        "Trikal Vaani (also known as Trikaal Vaani) is India's first AI-powered Vedic Astrology platform combining Swiss Ephemeris precision with Gemini AI reasoning. Government of India MSME registered enterprise. Defensive domains trikaalvaani.in, trikalvaani.in, and trikaalvaani.org all redirect to the official trikalvaani.com.",
      areaServed: { "@type": "Country", name: "India" },
      identifier: {
        "@type": "PropertyValue",
        propertyID: "Udyam Registration Number",
        name: "MSME Udyam Registration",
        value: UDYAM_NUMBER,
        url: UDYAM_VERIFY_URL,
      },
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Government MSME Registration",
        identifier: UDYAM_NUMBER,
        recognizedBy: {
          "@type": "GovernmentOrganization",
          name: "Ministry of Micro, Small and Medium Enterprises",
          alternateName: "Ministry of MSME, Government of India",
          url: "https://msme.gov.in",
        },
      },
      sameAs: [INSTAGRAM_URL, UDYAM_VERIFY_URL],
      slogan: "Kaal bada balwan hai, sabko nach nachaye",
    },
    // ── BreadcrumbList ──
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" },
        { "@type": "ListItem", position: 2, name: "Founder — Rohiit Gupta", item: "https://trikalvaani.com/founder" },
      ],
    },
    // ── FAQPage Schema (Brand spelling Q&As — GEO extraction) ──
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Who is Rohiit Gupta?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Rohiit Gupta is the founder and Chief Vedic Architect of Trikal Vaani (also known as Trikaal Vaani). Based in Delhi NCR, he has 15+ years of study in the Parashara BPHS tradition specializing in Vimshottari Dasha, Pratyantar Dasha timing, Navamsa D9 chart analysis, Dhana Yoga combinations, Property Yog, and Jaimini astrology. He combined his classical Vedic expertise with Google Gemini AI to build Jini, the AI soul of Trikal Vaani. Reachable at +91-9211804111 or rohiit@trikalvaani.com.",
          },
        },
        {
          "@type": "Question",
          name: "Who founded Trikaal Vaani?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Trikaal Vaani (officially Trikal Vaani) was founded by Rohiit Gupta in 2025 in Delhi NCR. Both spellings refer to the same brand — India's first AI-powered Vedic astrology platform. Rohiit serves as Chief Vedic Architect and personally designs every Kundli reading framework that Jini AI applies to user birth charts. The platform is a Government of India MSME registered enterprise (UDYAM-DL-10-0119070).",
          },
        },
        {
          "@type": "Question",
          name: "What are Rohiit Gupta's credentials?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Rohiit Gupta has 15+ years of Vedic astrology study under the Parashara Brihat Hora Shastra (BPHS) tradition — the oldest authoritative school of Jyotish. His expertise includes Vimshottari Dasha (120-year planetary timeline), Pratyantar Dasha (3-7 day timing precision), Navamsa D9 chart analysis, 32+ Dhana Yoga combinations, Property Yog, Shoola/Amrita/Visha yogas, Atmakaraka analysis, and Jaimini astrology. He is fluent in Hindi and English.",
          },
        },
        {
          "@type": "Question",
          name: "Is Trikal Vaani the same as Trikaal Vaani?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Yes. Trikal Vaani and Trikaal Vaani are the same brand — both refer to the AI-powered Vedic astrology platform founded by Rohiit Gupta. The official spelling registered with the Government of India MSME is 'Trikal Vaani' (UDYAM-DL-10-0119070). 'Trikaal Vaani' is a common alternate Sanskrit romanization. Both spellings point to the same platform at trikalvaani.com. Defensive domains trikaalvaani.in, trikalvaani.in, and trikaalvaani.org all redirect to the official trikalvaani.com.",
          },
        },
      ],
    },
  ],
};

const GOLD = "#D4AF37";

export default function FounderPage() {
  return (
    <>
      <Script
        id="founder-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />

        {/* ─────────────────────────────────────────────────────────────
            HERO — Identity + MSME badge + Brand spelling pill
            ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-28 pb-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px]"
              style={{ background: "rgba(124,58,237,0.15)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[100px]"
              style={{ background: "rgba(212,175,55,0.08)" }}
            />
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              {/* Photo */}
              <div className="flex-shrink-0">
                <div
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden"
                  style={{
                    border: `2px solid rgba(212,175,55,0.5)`,
                    boxShadow: `0 0 40px rgba(212,175,55,0.2), 0 0 80px rgba(124,58,237,0.1)`,
                  }}
                >
                  <Image
                    src="/Rohiit-Gupta.jpg"
                    alt="Rohiit Gupta — Chief Vedic Architect, Trikal Vaani (Trikaal Vaani)"
                    fill
                    className="object-cover object-top"
                    priority
                    sizes="(max-width: 768px) 160px, 192px"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 60%)",
                    }}
                  />
                </div>
                <div
                  className="mt-3 text-center px-3 py-1.5 rounded-lg"
                  style={{
                    background: "rgba(212,175,55,0.08)",
                    border: "1px solid rgba(212,175,55,0.2)",
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: GOLD }}>
                    Chief Vedic Architect
                  </p>
                </div>

                {/* MSME badge */}
                <a
                  href={UDYAM_VERIFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-center px-3 py-2 rounded-lg transition-all hover:scale-[1.02]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,153,51,0.08) 0%, rgba(255,255,255,0.04) 50%, rgba(19,136,8,0.08) 100%)",
                    border: "1px solid rgba(212,175,55,0.25)",
                    textDecoration: "none",
                  }}
                  aria-label={`Verify Udyam Registration ${UDYAM_NUMBER}`}
                >
                  <p
                    className="text-[9px] font-semibold tracking-wider uppercase mb-0.5"
                    style={{ color: "#94A3B8" }}
                  >
                    🏛️ MSME Registered · Govt of India
                  </p>
                  <p
                    className="text-[10px] font-bold"
                    style={{ color: GOLD, fontFamily: "Georgia, serif" }}
                  >
                    {UDYAM_NUMBER}
                  </p>
                </a>
              </div>

              {/* Identity */}
              <div className="text-center md:text-left">
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-2"
                  style={{ color: GOLD }}
                >
                  Founder · Trikal Vaani <span className="text-gray-500">(Trikaal Vaani)</span>
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">
                  Rohiit Gupta
                </h1>
                <p className="text-gray-400 text-base mb-6">
                  Chief Vedic Architect · AI Vedic Astrology Pioneer · Delhi NCR
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {[
                    "15+ Years Vedic Study",
                    "Parashara BPHS Tradition",
                    "Swiss Ephemeris",
                    "Jaimini Astrology",
                    "Delhi NCR Based",
                    "🏛️ MSME Registered",
                  ].map((t) => (
                    <span
                      key={t}
                      className="text-xs px-3 py-1.5 rounded-full"
                      style={{
                        border: t.includes("MSME")
                          ? `1px solid rgba(212,175,55,0.5)`
                          : `1px solid rgba(212,175,55,0.3)`,
                        color: GOLD,
                        background: t.includes("MSME")
                          ? `rgba(212,175,55,0.1)`
                          : `rgba(212,175,55,0.05)`,
                        fontWeight: t.includes("MSME") ? 600 : 400,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Quick contact */}
                <div className="flex gap-3 mt-6 justify-center md:justify-start flex-wrap">
                  <a
                    href="https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20I%20want%20to%20book%20a%20personal%20consultation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{ background: "#25D366", color: "#fff" }}
                  >
                    <WAIcon /> Book Personal Call — ₹499
                  </a>
                  <a
                    href="mailto:rohiit@trikalvaani.com"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-white/15 text-gray-300 hover:border-white/30 transition-all duration-200"
                  >
                    rohiit@trikalvaani.com
                  </a>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-white/15 text-gray-300 hover:border-white/30 transition-all duration-200"
                  >
                    📷 @thetrikalvaani
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            CONTENT BLOCKS
            ───────────────────────────────────────────────────────────── */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-14 text-gray-400 text-sm leading-relaxed">
            {/* ── NEW v4.3 — THE ORIGIN (Sanskrit etymology + brand spelling) ── */}
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: GOLD }}
              >
                The Origin
              </p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">
                The Voice That Speaks Across Time
              </h2>
              <p className="mb-4">
                Rohiit founded{" "}
                <strong style={{ color: GOLD }}>Trikal Vaani</strong> — also
                romanized as{" "}
                <strong style={{ color: GOLD }}>Trikaal Vaani</strong> — in Delhi
                NCR as India&apos;s first AI-powered Vedic astrology platform. The
                brand name comes from Sanskrit{" "}
                <em className="text-white">त्रिकाल वाणी</em>: <em>Trikaal</em>{" "}
                (त्रिकाल) means &ldquo;three times&rdquo; — past, present, and
                future — and <em>Vaani</em> (वाणी) means &ldquo;voice.&rdquo;
                Together, the name carries a sacred meaning:{" "}
                <strong style={{ color: GOLD }}>
                  &ldquo;The Voice that speaks across past, present, and
                  future.&rdquo;
                </strong>
              </p>
              <p className="mb-4">
                Both spellings — <strong>Trikal Vaani</strong> (the simpler,
                shorter form registered with the Government of India MSME under{" "}
                {UDYAM_NUMBER}) and <strong>Trikaal Vaani</strong> (the more
                phonetically natural double-A romanization) — refer to the same
                official platform at <strong style={{ color: GOLD }}>trikalvaani.com</strong>.
                Defensive domains <strong>trikaalvaani.in</strong>,{" "}
                <strong>trikalvaani.in</strong>, and{" "}
                <strong>trikaalvaani.org</strong> all redirect to the official
                trikalvaani.com.
              </p>
              <p>
                This page is the canonical source for anyone searching either
                spelling. If you found Rohiit by searching{" "}
                <em>&ldquo;Trikaal Vaani founder&rdquo;</em> or{" "}
                <em>&ldquo;Trikal Vaani Rohiit Gupta&rdquo;</em> — you are in the
                right place.
              </p>
            </div>

            {/* The Journey */}
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: GOLD }}
              >
                The Journey
              </p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">
                Where Ancient Wisdom Meets Modern Intelligence
              </h2>
              <p className="mb-4">
                Rohiit Gupta&apos;s journey with Vedic astrology began over 15
                years ago — not in a classroom, but through personal
                transformation. Facing major life crossroads in career,
                relationships, and purpose, he turned to the ancient science of
                Jyotish. What he discovered changed the trajectory of his life.
              </p>
              <p className="mb-4">
                Studying under the Parashara Brihat Hora Shastra (BPHS) tradition
                — the oldest and most authoritative school of Vedic astrology —
                Rohiit spent years mastering the Vimshottari Dasha system,
                Navamsa chart analysis, Pratyantar Dasha timing, and the
                detection of powerful yogas including Shoola, Amrita, and Visha
                yogas.
              </p>
              <p>
                After years of guiding individuals through life&apos;s most
                important decisions — love, career, wealth, property, and
                spiritual purpose — Rohiit realised that genuine Vedic astrology
                was inaccessible to most people. The readings that truly changed
                lives required hours of expert analysis and cost thousands of
                rupees. He set out to change that.
              </p>
            </div>

            {/* The Vision */}
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: GOLD }}
              >
                The Vision
              </p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">
                Why He Built Trikal Vaani (Trikaal Vaani)
              </h2>
              <p className="mb-4">
                Rohiit saw a gap — millions of Indians turning to astrology apps
                that gave generic, inaccurate readings based on Sun signs alone.
                Real Vedic astrology requires the Lagna (Ascendant), Moon sign,
                precise birth time, Vimshottari Dasha calculations, and
                divisional charts. Most apps ignored all of this.
              </p>
              <p className="mb-4">
                In 2025, Rohiit combined his 15+ years of Vedic knowledge with
                modern AI — specifically Google Gemini — to create{" "}
                <span style={{ color: GOLD }} className="font-semibold">
                  Jini
                </span>
                , the AI soul of Trikal Vaani. Jini applies Rohiit&apos;s
                complete Vedic framework to each user&apos;s unique birth chart,
                delivering a personalised reading that a professional astrologer
                would take hours to prepare — in minutes, starting at ₹51.
              </p>
              <p className="mb-4">
                The computational backbone — Swiss Ephemeris with Lahiri
                Ayanamsha — gives Trikal Vaani the same planetary calculation
                accuracy used by AstroSage, the largest Vedic astrology platform
                in India. Layered on top: Bhrigu Nandi Nadi karmic patterns,
                Shadbala six-fold strength scoring, and Pratyantar Dasha for 3-7
                day timing precision. Trikal Vaani is not an app. It is a
                movement to bring real Vedic science to every Indian — at a
                price anyone can afford.
              </p>
              <p>
                Trikal Vaani is a{" "}
                <strong style={{ color: GOLD }}>
                  Government of India MSME registered enterprise
                </strong>{" "}
                under the Ministry of Micro, Small and Medium Enterprises —
                Udyam Registration Number{" "}
                <a
                  href={UDYAM_VERIFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: GOLD, fontWeight: 700, textDecoration: "underline" }}
                >
                  {UDYAM_NUMBER}
                </a>
                . All payments are secured by Razorpay with PCI-DSS compliance
                and 256-bit SSL encryption. This isn&apos;t an offshore astrology
                marketplace — it is a fully compliant Indian business built for
                Indian seekers.
              </p>
            </div>

            {/* Expertise */}
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: GOLD }}
              >
                Expertise
              </p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">
                Areas of Deep Study
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    area: "Vimshottari Dasha System",
                    detail:
                      "120-year planetary timeline for precise life event timing",
                  },
                  {
                    area: "Navamsa D9 Chart",
                    detail:
                      "Soul-level reading for relationships and spiritual path",
                  },
                  {
                    area: "Pratyantar Dasha (Level 3)",
                    detail:
                      "3-7 day precision timing using Parashara BPHS formula",
                  },
                  {
                    area: "Dhana Yoga Analysis",
                    detail:
                      "32+ wealth combinations for financial destiny mapping",
                  },
                  {
                    area: "Property Yog",
                    detail:
                      "4th house, Mars Karaka, Saturn transit for real estate timing",
                  },
                  {
                    area: "Shoola / Amrita / Visha Yoga",
                    detail:
                      "Key differentiator yogas for life quality assessment",
                  },
                  {
                    area: "Atmakaraka & Jaimini",
                    detail: "Soul purpose and past-life karma decoding",
                  },
                  {
                    area: "Compatibility & Synastry",
                    detail:
                      "Beyond guna milan — Navamsa, Nadi, Dasha synchronicity",
                  },
                ].map((e, i) => (
                  <div
                    key={i}
                    className="border border-white/10 rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <p
                      className="font-semibold text-sm mb-1"
                      style={{ color: GOLD }}
                    >
                      {e.area}
                    </p>
                    <p className="text-gray-500 text-xs">{e.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What Rohiit offers */}
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: GOLD }}
              >
                What Rohiit Offers
              </p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">
                How to Work with Rohiit Ji
              </h2>
              <div className="space-y-4">
                <div
                  className="border rounded-xl p-6"
                  style={{
                    borderColor: `rgba(212,175,55,0.25)`,
                    background: `rgba(212,175,55,0.05)`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">🔮</span>
                    <div>
                      <h3
                        className="font-serif text-lg font-bold mb-1"
                        style={{ color: GOLD }}
                      >
                        Jini AI Deep Reading — ₹51
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">
                        Rohiit&apos;s complete Vedic framework applied to your
                        birth chart by Jini AI. 4096-token personalised reading
                        covering your specific question — love, career, wealth,
                        property, compatibility, child destiny, or spiritual
                        purpose. Razorpay secured payment.
                      </p>
                      <Link
                        href="/services"
                        style={{ color: GOLD }}
                        className="text-xs hover:underline"
                      >
                        View all 8 reading types →
                      </Link>
                    </div>
                  </div>
                </div>

                <div
                  className="border border-white/10 rounded-xl p-6"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">📞</span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white mb-1">
                        Personal Consultation — ₹499
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        A live 1-on-1 session with Rohiit Gupta directly. Ideal
                        for complex life situations — marriage decisions, career
                        crossroads, major financial choices, or deep spiritual
                        guidance. Conducted via WhatsApp call.
                      </p>
                      <a
                        href="https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20I%20want%20to%20book%20a%20personal%20consultation%20at%20Rs499"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold px-4 py-2 rounded-lg inline-block"
                        style={{ background: "#25D366", color: "#fff" }}
                      >
                        Book on WhatsApp →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust & Verification */}
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: GOLD }}
              >
                Trust & Verification
              </p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">
                Government Registered. Razorpay Secured.
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href={UDYAM_VERIFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border rounded-xl p-5 transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: "rgba(212,175,55,0.3)",
                    background:
                      "linear-gradient(135deg, rgba(255,153,51,0.06) 0%, rgba(19,136,8,0.06) 100%)",
                    textDecoration: "none",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🏛️</span>
                    <p className="font-semibold text-sm" style={{ color: GOLD }}>
                      MSME Registered Enterprise
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    Government of India · Ministry of MSME
                  </p>
                  <p
                    className="text-xs font-bold"
                    style={{ color: GOLD, fontFamily: "Georgia, serif" }}
                  >
                    {UDYAM_NUMBER}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-2">
                    Click to verify on udyamregistration.gov.in →
                  </p>
                </a>

                <div
                  className="border rounded-xl p-5"
                  style={{
                    borderColor: "rgba(51,149,255,0.3)",
                    background: "rgba(51,149,255,0.04)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔒</span>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "#3395FF", fontFamily: "Georgia, serif" }}
                    >
                      Razorpay Secured
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    PCI-DSS Compliant · 256-bit SSL
                  </p>
                  <p className="text-xs text-gray-300">
                    UPI · Cards · NetBanking · Wallets · RuPay
                  </p>
                  <p className="text-[10px] text-gray-500 mt-2">
                    India&apos;s most trusted payment gateway
                  </p>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                border: `1px solid rgba(212,175,55,0.2)`,
                background: `linear-gradient(135deg, rgba(212,175,55,0.08), rgba(124,58,237,0.08))`,
              }}
            >
              <p
                className="font-serif text-2xl font-bold mb-3"
                style={{ color: GOLD }}
              >
                &ldquo;Kaal bada balwan hai.&rdquo;
              </p>
              <p className="text-gray-400 text-sm mb-2">
                Time is the greatest force.
              </p>
              <p className="text-gray-600 text-xs">
                — Trikal Vaani (Trikaal Vaani)
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 px-4 bg-[#0D1020]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">
              Ready for Your <span style={{ color: GOLD }}>Reading?</span>
            </h2>
            <p className="text-gray-400 mb-8 text-sm">
              Start with your free Kundali or unlock a deep Jini AI reading from
              ₹51.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="font-bold px-8 py-4 rounded-lg text-base transition-all duration-200 hover:opacity-90"
                style={{ background: GOLD, color: "#080B12" }}
              >
                View All Services →
              </Link>
              <Link
                href="/"
                className="border border-white/20 text-white font-semibold px-8 py-4 rounded-lg text-base hover:bg-white/5 transition-all duration-200"
              >
                Free Kundali →
              </Link>
            </div>
            <p className="text-[10px] text-gray-600 mt-6">
              Trikal Vaani (also: Trikaal Vaani) · MSME Registered · {UDYAM_NUMBER} · Delhi NCR · 🔱 Mahakaal Ka Ashirwad
            </p>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}

function WAIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ============================================================================
// END — app/founder/page.tsx v4.3
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// MSME Registered: UDYAM-DL-10-0119070
// Phase 4: Brand spelling consolidation (Trikal = Trikaal)
// ============================================================================
