/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/services/page.tsx
 * Version: 1.0 — Services Index Page
 * SEO: Full EEAT + GEO + Schema + Canonical + OG + FAQPage
 */

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

/* ── SEO META ──────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Vedic Astrology Services by Rohiit Gupta | Trikal Vaani",
  description:
    "8 deep Vedic astrology readings by Chief Vedic Architect Rohiit Gupta — powered by Jini AI + Swiss Ephemeris. Love, career, property, wealth, child destiny, compatibility, spiritual purpose. Starting ₹51.",
  keywords: [
    "vedic astrology services India",
    "Rohiit Gupta astrologer Delhi",
    "Jini AI astrology reading",
    "deep vedic astrology reading online",
    "astrology consultation India ₹51",
    "Trikal Vaani services",
    "Swiss Ephemeris astrology India",
  ],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/about" }],
  openGraph: {
    title: "Vedic Astrology Services | Trikal Vaani — Rohiit Gupta",
    description:
      "8 AI-powered Vedic readings covering love, career, property, wealth, children, compatibility & spiritual purpose. Starting ₹51.",
    url: "https://trikalvaani.com/services",
    siteName: "Trikal Vaani",
    type: "website",
    locale: "en_IN",
  },
  alternates: { canonical: "https://trikalvaani.com/services" },
};

/* ── JSON-LD SCHEMA ────────────────────────────────────────────────── */
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      "@id": "https://trikalvaani.com/services",
      name: "Vedic Astrology Services by Rohiit Gupta — Trikal Vaani",
      description:
        "8 deep Vedic astrology readings powered by Jini AI and Swiss Ephemeris, designed by Chief Vedic Architect Rohiit Gupta.",
      numberOfItems: 8,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ex-Back Reading", url: "https://trikalvaani.com/services/ex-back-reading" },
        { "@type": "ListItem", position: 2, name: "Toxic Boss Radar", url: "https://trikalvaani.com/services/toxic-boss-radar" },
        { "@type": "ListItem", position: 3, name: "Career Pivot Reading", url: "https://trikalvaani.com/services/career-pivot" },
        { "@type": "ListItem", position: 4, name: "Property Yog Reading", url: "https://trikalvaani.com/services/property-yog" },
        { "@type": "ListItem", position: 5, name: "Compatibility Reading", url: "https://trikalvaani.com/services/compatibility" },
        { "@type": "ListItem", position: 6, name: "Child Destiny Reading", url: "https://trikalvaani.com/services/child-destiny" },
        { "@type": "ListItem", position: 7, name: "Wealth Reading", url: "https://trikalvaani.com/services/wealth-reading" },
        { "@type": "ListItem", position: 8, name: "Spiritual Purpose Reading", url: "https://trikalvaani.com/services/spiritual-purpose" },
      ],
    },
    {
      "@type": "Person",
      "@id": "https://trikalvaani.com/about",
      name: "Rohiit Gupta",
      jobTitle: "Chief Vedic Architect",
      url: "https://trikalvaani.com/about",
      worksFor: { "@type": "Organization", name: "Trikal Vaani", url: "https://trikalvaani.com" },
      knowsAbout: ["Vedic Astrology", "Vimshottari Dasha", "Jaimini Astrology", "Swiss Ephemeris", "Parashara BPHS"],
      description: "Rohiit Gupta has studied Vedic astrology for over 15 years under the Parashara BPHS tradition.",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What Vedic astrology services does Trikal Vaani offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Trikal Vaani offers 8 deep AI-powered Vedic readings: Ex-Back (love reunion), Toxic Boss Radar (workplace karma), Career Pivot (dharmic career), Property Yog (real estate timing), Compatibility (kundali matching), Child Destiny (talent reading), Wealth Reading (Dhana Yoga), and Spiritual Purpose (soul mission). All readings start at ₹51.",
          },
        },
        {
          "@type": "Question",
          name: "How accurate are Trikal Vaani readings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Trikal Vaani uses the Prokerala API with Lahiri Ayanamsha — the same computational engine used by AstroSage and professional Vedic astrologers. Readings are designed by Rohiit Gupta and powered by Jini AI (Gemini). Birth time accuracy within 15 minutes ensures the most precise results.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between ₹51 reading and ₹499 personal call?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The ₹51 Jini AI reading gives a 4096-token deep analysis specific to your birth chart and chosen topic. The ₹499 call connects you directly with Rohiit Gupta for a live personal session — ideal for complex life situations requiring human-level guidance and follow-up questions.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" },
        { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" },
      ],
    },
  ],
};

/* ── SERVICE CARDS DATA ────────────────────────────────────────────── */
const services = [
  {
    slug: "ex-back-reading",
    emoji: "♀",
    title: "Ex-Back Reading",
    question: "Will my ex come back?",
    desc: "Jini AI reads your Venus, 7th House & Vimshottari Dasha to reveal if reunion energy is active — and exactly when the window opens.",
    tags: ["Venus Analysis", "7th House", "Reunion Timing"],
    price: "₹51",
    glow: "from-rose-900/20",
  },
  {
    slug: "toxic-boss-radar",
    emoji: "♄",
    title: "Toxic Boss Radar",
    question: "Is my boss karmically toxic?",
    desc: "Your 10th House and Saturn reveal whether this workplace situation is a karmic lesson with an end date — or a cosmic signal to leave now.",
    tags: ["10th House", "Saturn Transit", "Job Change Timing"],
    price: "₹51",
    glow: "from-red-900/20",
  },
  {
    slug: "career-pivot",
    emoji: "♃",
    title: "Career Pivot",
    question: "Am I in the wrong career?",
    desc: "Your 10th House, Jupiter & Atmakaraka reveal your dharmic profession — and the exact Dasha window to pivot without financial risk.",
    tags: ["Atmakaraka", "D10 Dasamsa", "Pivot Window"],
    price: "₹51",
    glow: "from-amber-900/15",
  },
  {
    slug: "property-yog",
    emoji: "🏠",
    title: "Property Yog",
    question: "Is now the right time to buy property?",
    desc: "Your 4th House, Mars Karaka & Saturn transit reveal if Property Yog is active — or if buying now is a costly karmic mistake.",
    tags: ["4th House", "Mars Karaka", "Sade Sati Check"],
    price: "₹51",
    glow: "from-orange-900/15",
  },
  {
    slug: "compatibility",
    emoji: "⚖️",
    title: "Compatibility Reading",
    question: "Are we truly compatible?",
    desc: "Beyond 36 gunas — Jini reads both charts for Navamsa D9, Mangal Dosha, Nadi Dosha & Dasha synchronicity to reveal the soul-level truth.",
    tags: ["Navamsa D9", "Mangal Dosha", "Dasha Sync"],
    price: "₹51",
    glow: "from-rose-900/15",
  },
  {
    slug: "child-destiny",
    emoji: "👶",
    title: "Child Destiny",
    question: "What is my child born to become?",
    desc: "Your child's 5th House, Moon nakshatra & Mercury reveal hidden talents, ideal education stream & cosmic calling — before society decides for them.",
    tags: ["5th House Talent", "Moon Nakshatra", "Education Stream"],
    price: "₹51",
    glow: "from-blue-900/15",
  },
  {
    slug: "wealth-reading",
    emoji: "💰",
    title: "Wealth Reading",
    question: "When will I get rich?",
    desc: "Your 2nd House, Jupiter & Dhana Yoga combinations reveal your wealth timeline, peak earning years & which investment sectors your chart favors.",
    tags: ["Dhana Yoga", "Jupiter Transit", "Peak Earning Years"],
    price: "₹51",
    glow: "from-yellow-900/15",
  },
  {
    slug: "spiritual-purpose",
    emoji: "🕉",
    title: "Spiritual Purpose",
    question: "What is my soul's purpose?",
    desc: "Your Ketu, Atmakaraka & 12th House decode your past-life karma, present dharmic mission & the soul lesson you were born to complete.",
    tags: ["Atmakaraka", "Ketu Past Life", "Moksha Yoga"],
    price: "₹51",
    glow: "from-indigo-900/20",
  },
];

/* ── PAGE ──────────────────────────────────────────────────────────── */
export default function ServicesPage() {
  return (
    <>
      <Script
        id="services-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />

        {/* ── HERO ── */}
        <section className="relative overflow-hidden pt-28 pb-16 px-4">
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
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              Your Life&apos;s Biggest Questions
              <br />
              <span className="text-[#D4AF37]">Answered by Your Stars.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-4 leading-relaxed">
              8 AI-powered Vedic readings designed by{" "}
              <Link href="/about" className="text-[#D4AF37] hover:underline font-semibold">
                Rohiit Gupta
              </Link>{" "}
              — Chief Vedic Architect. Each reading uses Swiss Ephemeris precision and Jini AI to give you answers no generic astrology app can.
            </p>
            <p className="text-sm text-gray-500 mb-10">
              Powered by Swiss Ephemeris · Lahiri Ayanamsha · Prokerala API · All readings from ₹51
            </p>

            {/* Trust bar */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {[
                "15+ Years Vedic Study",
                "Parashara BPHS Tradition",
                "Swiss Ephemeris Precision",
                "AstroSage-Level Accuracy",
                "Delhi NCR Based",
              ].map((t) => (
                <span
                  key={t}
                  className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1.5 rounded-full bg-[#D4AF37]/5"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8 SERVICE CARDS ── */}
        <section className="py-12 px-4 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {services.map((s, i) => (
                <article
                  key={s.slug}
                  className="group relative border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(212,175,55,0.08)]"
                >
                  {/* Gold gradient top glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.glow} to-transparent opacity-60 pointer-events-none`} />

                  <div className="relative p-7">
                    {/* Number + Emoji */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{s.emoji}</span>
                        <div>
                          <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium">
                            Reading {String(i + 1).padStart(2, "0")}
                          </p>
                          <h2 className="font-serif text-xl font-bold text-white">{s.title}</h2>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-gray-500 text-xs line-through">₹499</p>
                        <p className="text-[#D4AF37] text-xl font-bold">{s.price}</p>
                      </div>
                    </div>

                    {/* The question */}
                    <p className="text-[#D4AF37]/80 text-sm italic mb-3 font-medium">
                      &ldquo;{s.question}&rdquo;
                    </p>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">{s.desc}</p>

                    {/* Tags */}
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

                    {/* CTAs */}
                    <div className="flex gap-3">
                      <Link
                        href={`/?segment=${s.slug}`}
                        className="flex-1 text-center bg-[#D4AF37] text-[#080B12] font-bold py-3 rounded-lg text-sm hover:bg-[#e8c84a] transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                      >
                        Get Reading — ₹51
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
                Need a Personal Reading with <span className="text-[#D4AF37]">Rohiit Gupta?</span>
              </h3>
              <p className="text-gray-400 max-w-xl mx-auto mb-6 text-sm leading-relaxed">
                For complex life situations — marriage decisions, career crossroads, major property purchases, or spiritual guidance — book a direct 1-on-1 call with Rohiit ji. He brings 15+ years of Vedic study and Delhi NCR real estate expertise to every session.
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
                  href="/about"
                  className="inline-flex items-center justify-center border border-white/20 text-white font-semibold px-8 py-4 rounded-lg text-base hover:bg-white/5 transition-all duration-200"
                >
                  About Rohiit Gupta →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 px-4 bg-[#0D1020]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Common Questions</p>
              <h2 className="font-serif text-3xl font-bold">
                Frequently Asked <span className="text-[#D4AF37]">Questions</span>
              </h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "What Vedic astrology services does Trikal Vaani offer?",
                  a: "Trikal Vaani offers 8 deep AI-powered Vedic readings: Ex-Back (love reunion), Toxic Boss Radar (workplace karma), Career Pivot (dharmic career), Property Yog (real estate timing), Compatibility (kundali matching), Child Destiny (talent reading), Wealth Reading (Dhana Yoga), and Spiritual Purpose (soul mission). All readings start at ₹51.",
                },
                {
                  q: "How accurate are Trikal Vaani's readings?",
                  a: "Trikal Vaani uses the Prokerala API with Lahiri Ayanamsha — the same computational engine used by AstroSage and professional Vedic astrologers. Readings are designed by Rohiit Gupta with 15+ years of Parashara BPHS tradition. Birth time accuracy within 15 minutes ensures the most precise results.",
                },
                {
                  q: "What is the difference between the ₹51 reading and the ₹499 personal call?",
                  a: "The ₹51 Jini AI reading gives a 4096-token deep analysis specific to your birth chart and chosen topic — delivered instantly. The ₹499 call connects you directly with Rohiit Gupta for a live personal session — ideal for complex life situations requiring human-level guidance and follow-up questions.",
                },
                {
                  q: "What birth details do I need for any reading?",
                  a: "Date of birth, exact time of birth (ideally within 30 minutes), and place of birth. The more precise your birth time, the more accurate your house placements and Dasha timing will be.",
                },
                {
                  q: "Are these readings available in Hindi?",
                  a: "Currently, Jini AI readings are delivered in English. For Hindi readings, book a direct WhatsApp call with Rohiit ji at ₹499 — he conducts sessions in both Hindi and English.",
                },
              ].map((f, i) => (
                <details
                  key={i}
                  className="border border-white/10 rounded-xl p-5 bg-white/[0.02] group cursor-pointer"
                >
                  <summary className="font-semibold text-white text-sm md:text-base list-none flex justify-between items-center gap-4">
                    {f.q}
                    <span className="text-[#D4AF37] text-lg flex-shrink-0 group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="text-gray-400 text-sm leading-relaxed mt-4">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
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
              Pick the question that matters most to you right now. Enter your birth details. Let Jini AI — powered by 15+ years of Rohiit Gupta's Vedic wisdom — give you the clarity you have been looking for.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#D4AF37] text-[#080B12] font-bold px-10 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_40px_rgba(212,175,55,0.25)]"
            >
              Enter Birth Details → Get Reading
            </Link>
            <p className="text-gray-600 text-xs mt-6">
              Powered by Swiss Ephemeris · Lahiri Ayanamsha · Prokerala API · Reading framework by Rohiit Gupta
            </p>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
