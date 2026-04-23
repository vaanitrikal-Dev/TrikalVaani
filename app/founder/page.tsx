/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/founder/page.tsx (REPLACE EXISTING)
 * Version: 2.0 — Full SEO + EEAT + Schema — Critical for Google authority
 */

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Rohiit Gupta — Chief Vedic Architect | Trikal Vaani",
  description: "Rohiit Gupta — 15+ years Vedic astrology under Parashara BPHS tradition. Founder of Trikal Vaani and Star Properties Delhi NCR. Chief Vedic Architect behind Jini AI.",
  keywords: ["Rohiit Gupta astrologer Delhi", "Trikal Vaani founder", "vedic astrologer Delhi NCR", "Chief Vedic Architect", "Rohiit Gupta real estate astrology"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  alternates: { canonical: "https://trikalvaani.com/founder" },
  openGraph: {
    title: "Rohiit Gupta — Chief Vedic Architect | Trikal Vaani",
    description: "15+ years Vedic astrology. Founder of Trikal Vaani. Chief Vedic Architect behind Jini AI.",
    url: "https://trikalvaani.com/founder",
    siteName: "Trikal Vaani",
    type: "profile",
    locale: "en_IN",
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
      description: "Rohiit Gupta has studied Vedic astrology for over 15 years under the Parashara BPHS tradition. Founder of Trikal Vaani and Star Properties Delhi NCR.",
      url: "https://trikalvaani.com/founder",
      email: "rohiit@trikalvaani.com",
      telephone: "+919211804111",
      address: { "@type": "PostalAddress", addressLocality: "Delhi NCR", addressCountry: "IN" },
      worksFor: { "@type": "Organization", name: "Trikal Vaani", url: "https://trikalvaani.com" },
      knowsAbout: ["Vedic Astrology", "Vimshottari Dasha", "Parashara BPHS", "Jaimini Astrology", "Swiss Ephemeris", "Navamsa D9", "Real Estate Delhi NCR"],
    },
    {
      "@type": "Organization",
      name: "Trikal Vaani",
      url: "https://trikalvaani.com",
      founder: { "@type": "Person", name: "Rohiit Gupta" },
      description: "India's first AI-powered Vedic Astrology platform combining Swiss Ephemeris precision with Gemini AI reasoning.",
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
      <Script id="founder-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />

        {/* HERO */}
        <section className="relative overflow-hidden pt-28 pb-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px]" style={{ background: "rgba(124,58,237,0.15)" }} />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-[100px]" style={{ background: "rgba(212,175,55,0.08)" }} />
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.2)]" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.3), rgba(124,58,237,0.2))", border: `2px solid rgba(212,175,55,0.5)` }}>
                  <span className="font-serif text-5xl font-bold" style={{ color: GOLD }}>RG</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: GOLD }}>Chief Vedic Architect</p>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">Rohiit Gupta</h1>
                <p className="text-gray-400 text-lg mb-5">Founder, Trikal Vaani · Founder, Star Properties Delhi NCR</p>
                <div className="flex flex-wrap gap-3">
                  {["15+ Years Vedic Study", "Parashara BPHS Tradition", "Swiss Ephemeris", "Delhi NCR Based", "Real Estate Expert"].map((t) => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full" style={{ border: `1px solid rgba(212,175,55,0.3)`, color: GOLD, background: `rgba(212,175,55,0.05)` }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-14 text-gray-400 text-sm leading-relaxed">

            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>The Journey</p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">Where Ancient Wisdom Meets Modern Intelligence</h2>
              <p className="mb-4">Rohiit Gupta&apos;s journey with Vedic astrology began over 15 years ago — not in a classroom, but through personal transformation. Facing major life crossroads in career, relationships, and purpose, he turned to the ancient science of Jyotish. What he discovered changed the trajectory of his life.</p>
              <p className="mb-4">Studying under the Parashara Brihat Hora Shastra (BPHS) tradition — the oldest and most authoritative school of Vedic astrology — Rohiit spent years mastering the Vimshottari Dasha system, Navamsa chart analysis, Pratyantar Dasha timing, and the detection of powerful yogas including Shoola, Amrita, and Visha yogas.</p>
              <p>Parallel to his Vedic studies, Rohiit built Star Properties Delhi NCR — a real estate business serving clients across Noida, Faridabad, Gurgaon, and Delhi. This unique combination of Vedic precision and real-world business experience is what makes Trikal Vaani&apos;s readings — especially for property, career, and wealth — unlike anything else available online.</p>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>The Vision</p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">Why He Built Trikal Vaani</h2>
              <p className="mb-4">Rohiit saw a gap — millions of Indians turning to astrology apps that gave generic, inaccurate readings based on Sun signs alone. Real Vedic astrology requires the Lagna (Ascendant), Moon sign, precise birth time, Vimshottari Dasha calculations, and divisional charts. Most apps ignored all of this.</p>
              <p className="mb-4">In 2025, Rohiit combined his 15+ years of Vedic knowledge with modern AI — specifically Google Gemini — to create <span style={{ color: GOLD }} className="font-semibold">Jini</span>, the AI soul of Trikal Vaani. Jini applies Rohiit&apos;s complete Vedic framework to each user&apos;s unique birth chart, delivering a personalised reading that a professional astrologer would take hours to prepare — in minutes, starting at ₹51.</p>
              <p>The computational backbone — Swiss Ephemeris with Lahiri Ayanamsha via the Prokerala API — gives Trikal Vaani the same planetary calculation accuracy used by AstroSage, the largest Vedic astrology platform in India.</p>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>Expertise</p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">Areas of Deep Study</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { area: "Vimshottari Dasha System", detail: "120-year planetary timeline for precise life event timing" },
                  { area: "Navamsa D9 Chart", detail: "Soul-level reading for relationships and spiritual path" },
                  { area: "Pratyantar Dasha (Level 3)", detail: "3-7 day precision timing using Parashara BPHS formula" },
                  { area: "Dhana Yoga Analysis", detail: "32+ wealth combinations for financial destiny mapping" },
                  { area: "Property Yog", detail: "4th house, Mars Karaka, Saturn transit for real estate timing" },
                  { area: "Shoola/Amrita/Visha Yoga", detail: "Key differentiator yogas for life quality assessment" },
                  { area: "Atmakaraka & Jaimini", detail: "Soul purpose and past-life karma decoding" },
                  { area: "Compatibility & Synastry", detail: "Beyond guna milan — Navamsa, Nadi, Dasha synchronicity" },
                ].map((e, i) => (
                  <div key={i} className="border border-white/10 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <p className="font-semibold text-sm mb-1" style={{ color: GOLD }}>{e.area}</p>
                    <p className="text-gray-500 text-xs">{e.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>Ventures</p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">What Rohiit Builds</h2>
              <div className="space-y-4">
                <div className="border rounded-xl p-6" style={{ borderColor: `rgba(212,175,55,0.25)`, background: `rgba(212,175,55,0.05)` }}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">🔮</span>
                    <div>
                      <h3 className="font-serif text-lg font-bold mb-1" style={{ color: GOLD }}>Trikal Vaani</h3>
                      <p className="text-gray-300 text-sm mb-2">India&apos;s first AI-powered Vedic astrology platform. 8 deep reading categories. Swiss Ephemeris precision. Jini AI powered by Gemini. Starting ₹51.</p>
                      <Link href="/" style={{ color: GOLD }} className="text-xs hover:underline">trikalvaani.com →</Link>
                    </div>
                  </div>
                </div>
                <div className="border border-white/10 rounded-xl p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">🏠</span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white mb-1">Star Properties Delhi NCR</h3>
                      <p className="text-gray-400 text-sm">Real estate advisory for residential and commercial property across Delhi, Noida, Gurgaon, and Faridabad. Combining Vedic timing analysis with on-ground market expertise.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="rounded-2xl p-8 text-center" style={{ border: `1px solid rgba(212,175,55,0.2)`, background: `linear-gradient(135deg, rgba(212,175,55,0.08), rgba(124,58,237,0.08))` }}>
              <p className="font-serif text-2xl font-bold mb-3" style={{ color: GOLD }}>&ldquo;Kaal bada balwan hai.&rdquo;</p>
              <p className="text-gray-400 text-sm">Time is the greatest force. — Trikal Vaani Tagline</p>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>Get in Touch</p>
              <h2 className="font-serif text-2xl font-bold text-white mb-5">Talk to Rohiit Ji</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20I%20want%20to%20book%20a%20personal%20consultation" target="_blank" rel="noopener noreferrer" className="border rounded-xl p-5 flex items-center gap-4 transition-all duration-200 hover:opacity-90" style={{ borderColor: "rgba(37,211,102,0.4)", background: "rgba(37,211,102,0.05)" }}>
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="text-green-400 font-semibold text-sm">WhatsApp</p>
                    <p className="text-gray-400 text-xs">+91 92118 04111</p>
                    <p className="text-gray-500 text-xs mt-1">Personal consultation — ₹499</p>
                  </div>
                </a>
                <a href="mailto:rohiit@trikalvaani.com" className="border border-white/10 rounded-xl p-5 flex items-center gap-4 transition-all duration-200 hover:border-white/20" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="text-white font-semibold text-sm">Email</p>
                    <p className="text-gray-400 text-xs">rohiit@trikalvaani.com</p>
                    <p className="text-gray-500 text-xs mt-1">Business enquiries</p>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-[#0D1020]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Ready for Your <span style={{ color: GOLD }}>Reading?</span></h2>
            <p className="text-gray-400 mb-8 text-sm">Start with your free Kundali or unlock a deep Jini AI reading from ₹51.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services" className="font-bold px-8 py-4 rounded-lg text-base transition-all duration-200" style={{ background: GOLD, color: "#080B12" }}>View All Services →</Link>
              <Link href="/" className="border border-white/20 text-white font-semibold px-8 py-4 rounded-lg text-base hover:bg-white/5 transition-all duration-200">Free Kundali →</Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
