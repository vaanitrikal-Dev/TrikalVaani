/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/founder/page.tsx
 * Version:     v4.1
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com
 *
 * WHAT CHANGED FROM v4.0:
 *   ✅ FIXED image path: /images/founder.png/Rohiit_Gupta.jpg → /Rohiit-Gupta.jpg
 *   ✅ Fixed in 3 places: og:image metadata, JSON-LD schema, and <Image> component
 * ============================================================================
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Rohiit Gupta — Chief Vedic Architect | Trikal Vaani",
  description:
    "Rohiit Gupta — 15+ years Vedic astrology under the Parashara BPHS tradition. Founder of Trikal Vaani. Chief Vedic Architect behind Jini AI — India's first AI-powered Vedic astrology platform.",
  keywords: [
    "Rohiit Gupta astrologer Delhi",
    "Trikal Vaani founder",
    "vedic astrologer Delhi NCR",
    "Chief Vedic Architect",
    "Rohiit Gupta vedic astrology",
  ],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  alternates: { canonical: "https://trikalvaani.com/founder" },
  openGraph: {
    title: "Rohiit Gupta — Chief Vedic Architect | Trikal Vaani",
    description:
      "15+ years Vedic astrology. Founder of Trikal Vaani. Chief Vedic Architect behind Jini AI.",
    url: "https://trikalvaani.com/founder",
    siteName: "Trikal Vaani",
    type: "profile",
    locale: "en_IN",
    images: [
      {
        url: "https://trikalvaani.com/Rohiit-Gupta.jpg",
        width: 800,
        height: 800,
        alt: "Rohiit Gupta — Chief Vedic Architect, Trikal Vaani",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rohiit Gupta — Chief Vedic Architect | Trikal Vaani",
    description: "15+ years Vedic astrology. Founder of Trikal Vaani.",
    site: "@trikalvaani",
    images: ["https://trikalvaani.com/Rohiit-Gupta.jpg"],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://trikalvaani.com/founder",
      name: "Rohiit Gupta",
      jobTitle: "Chief Vedic Architect",
      image: "https://trikalvaani.com/Rohiit-Gupta.jpg",
      description:
        "Rohiit Gupta has studied Vedic astrology for over 15 years under the Parashara BPHS tradition. He is the founder of Trikal Vaani — India's first AI-powered Vedic astrology platform.",
      url: "https://trikalvaani.com/founder",
      email: "rohiit@trikalvaani.com",
      telephone: "+919211804111",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Delhi NCR",
        addressCountry: "IN",
      },
      worksFor: {
        "@type": "Organization",
        name: "Trikal Vaani",
        url: "https://trikalvaani.com",
      },
      knowsAbout: [
        "Vedic Astrology",
        "Vimshottari Dasha",
        "Parashara BPHS",
        "Jaimini Astrology",
        "Swiss Ephemeris",
        "Navamsa D9",
        "Pratyantar Dasha",
      ],
    },
    {
      "@type": "Organization",
      name: "Trikal Vaani",
      url: "https://trikalvaani.com",
      founder: { "@type": "Person", name: "Rohiit Gupta" },
      description:
        "India's first AI-powered Vedic Astrology platform combining Swiss Ephemeris precision with Gemini AI reasoning.",
      areaServed: "IN",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" },
        { "@type": "ListItem", position: 2, name: "Founder", item: "https://trikalvaani.com/founder" },
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

        {/* ── HERO ── */}
        <section className="relative overflow-hidden pt-28 pb-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px]"
              style={{ background: "rgba(124,58,237,0.15)" }} />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[100px]"
              style={{ background: "rgba(212,175,55,0.08)" }} />
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
                    alt="Rohiit Gupta — Chief Vedic Architect, Trikal Vaani"
                    fill
                    className="object-cover object-top"
                    priority
                    sizes="(max-width: 768px) 160px, 192px"
                  />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 60%)" }} />
                </div>
                <div className="mt-3 text-center px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <p className="text-xs font-medium" style={{ color: GOLD }}>Chief Vedic Architect</p>
                </div>
              </div>

              {/* Identity */}
              <div className="text-center md:text-left">
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: GOLD }}>
                  Founder · Trikal Vaani
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
                  ].map((t) => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full"
                      style={{ border: `1px solid rgba(212,175,55,0.3)`, color: GOLD, background: `rgba(212,175,55,0.05)` }}>
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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-14 text-gray-400 text-sm leading-relaxed">

            {/* The Journey */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>
                The Journey
              </p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">
                Where Ancient Wisdom Meets Modern Intelligence
              </h2>
              <p className="mb-4">
                Rohiit Gupta&apos;s journey with Vedic astrology began over 15 years ago — not in a classroom, but through personal transformation. Facing major life crossroads in career, relationships, and purpose, he turned to the ancient science of Jyotish. What he discovered changed the trajectory of his life.
              </p>
              <p className="mb-4">
                Studying under the Parashara Brihat Hora Shastra (BPHS) tradition — the oldest and most authoritative school of Vedic astrology — Rohiit spent years mastering the Vimshottari Dasha system, Navamsa chart analysis, Pratyantar Dasha timing, and the detection of powerful yogas including Shoola, Amrita, and Visha yogas.
              </p>
              <p>
                After years of guiding individuals through life&apos;s most important decisions — love, career, wealth, property, and spiritual purpose — Rohiit realised that genuine Vedic astrology was inaccessible to most people. The readings that truly changed lives required hours of expert analysis and cost thousands of rupees. He set out to change that.
              </p>
            </div>

            {/* The Vision */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>
                The Vision
              </p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">
                Why He Built Trikal Vaani
              </h2>
              <p className="mb-4">
                Rohiit saw a gap — millions of Indians turning to astrology apps that gave generic, inaccurate readings based on Sun signs alone. Real Vedic astrology requires the Lagna (Ascendant), Moon sign, precise birth time, Vimshottari Dasha calculations, and divisional charts. Most apps ignored all of this.
              </p>
              <p className="mb-4">
                In 2025, Rohiit combined his 15+ years of Vedic knowledge with modern AI — specifically Google Gemini — to create <span style={{ color: GOLD }} className="font-semibold">Jini</span>, the AI soul of Trikal Vaani. Jini applies Rohiit&apos;s complete Vedic framework to each user&apos;s unique birth chart, delivering a personalised reading that a professional astrologer would take hours to prepare — in minutes, starting at ₹51.
              </p>
              <p>
                The computational backbone — Swiss Ephemeris with Lahiri Ayanamsha via the Prokerala API — gives Trikal Vaani the same planetary calculation accuracy used by AstroSage, the largest Vedic astrology platform in India. Trikal Vaani is not an app. It is a movement to bring real Vedic science to every Indian — at a price anyone can afford.
              </p>
            </div>

            {/* Expertise */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>
                Expertise
              </p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">
                Areas of Deep Study
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { area: "Vimshottari Dasha System", detail: "120-year planetary timeline for precise life event timing" },
                  { area: "Navamsa D9 Chart", detail: "Soul-level reading for relationships and spiritual path" },
                  { area: "Pratyantar Dasha (Level 3)", detail: "3-7 day precision timing using Parashara BPHS formula" },
                  { area: "Dhana Yoga Analysis", detail: "32+ wealth combinations for financial destiny mapping" },
                  { area: "Property Yog", detail: "4th house, Mars Karaka, Saturn transit for real estate timing" },
                  { area: "Shoola / Amrita / Visha Yoga", detail: "Key differentiator yogas for life quality assessment" },
                  { area: "Atmakaraka & Jaimini", detail: "Soul purpose and past-life karma decoding" },
                  { area: "Compatibility & Synastry", detail: "Beyond guna milan — Navamsa, Nadi, Dasha synchronicity" },
                ].map((e, i) => (
                  <div key={i} className="border border-white/10 rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <p className="font-semibold text-sm mb-1" style={{ color: GOLD }}>{e.area}</p>
                    <p className="text-gray-500 text-xs">{e.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What Rohiit offers */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>
                What Rohiit Offers
              </p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">
                How to Work with Rohiit Ji
              </h2>
              <div className="space-y-4">
                <div className="border rounded-xl p-6"
                  style={{ borderColor: `rgba(212,175,55,0.25)`, background: `rgba(212,175,55,0.05)` }}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">🔮</span>
                    <div>
                      <h3 className="font-serif text-lg font-bold mb-1" style={{ color: GOLD }}>
                        Jini AI Deep Reading — ₹51
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">
                        Rohiit&apos;s complete Vedic framework applied to your birth chart by Jini AI. 4096-token personalised reading covering your specific question — love, career, wealth, property, compatibility, child destiny, or spiritual purpose.
                      </p>
                      <Link href="/services" style={{ color: GOLD }} className="text-xs hover:underline">
                        View all 8 reading types →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="border border-white/10 rounded-xl p-6"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">📞</span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white mb-1">
                        Personal Consultation — ₹499
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        A live 1-on-1 session with Rohiit Gupta directly. Ideal for complex life situations — marriage decisions, career crossroads, major financial choices, or deep spiritual guidance. Conducted via WhatsApp call.
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

            {/* Tagline */}
            <div className="rounded-2xl p-8 text-center"
              style={{
                border: `1px solid rgba(212,175,55,0.2)`,
                background: `linear-gradient(135deg, rgba(212,175,55,0.08), rgba(124,58,237,0.08))`,
              }}>
              <p className="font-serif text-2xl font-bold mb-3" style={{ color: GOLD }}>
                &ldquo;Kaal bada balwan hai.&rdquo;
              </p>
              <p className="text-gray-400 text-sm">
                Time is the greatest force. — Trikal Vaani
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
              Start with your free Kundali or unlock a deep Jini AI reading from ₹51.
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
// END — app/founder/page.tsx v4.1
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
