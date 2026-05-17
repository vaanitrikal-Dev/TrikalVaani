// ============================================================
// File: app/calculators/page.tsx
// Purpose: Calculators Hub — SEO/GEO/AEO landing page
// Version: v1.0
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import SiteNav from '@/components/layout/SiteNav';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export const metadata: Metadata = {
  title: 'Free Vedic Astrology Calculators — Kundli, Dasha, Nakshatra | Trikal Vaani',
  description:
    'Free Vedic astrology calculators powered by Swiss Ephemeris. Get accurate Kundli, Vimshottari Dasha, Nakshatra, Rashi, Lagna, Sade Sati, and Manglik Dosh results instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'vedic astrology calculator',
    'free kundli calculator',
    'dasha calculator',
    'nakshatra calculator',
    'rashi calculator',
    'lagna calculator',
    'sade sati calculator',
    'manglik dosh calculator',
    'jyotish calculator',
    'birth chart calculator',
  ],
  alternates: {
    canonical: 'https://trikalvaani.com/calculators',
  },
  openGraph: {
    title: 'Free Vedic Astrology Calculators | Trikal Vaani',
    description: '7 free Vedic astrology calculators powered by Swiss Ephemeris. Accurate, instant, 100% free.',
    url: 'https://trikalvaani.com/calculators',
    type: 'website',
  },
};

const CALCULATORS = [
  {
    slug: 'free-kundali-calculator',
    emoji: '🔮',
    name: 'Free Kundli Calculator',
    desc: 'Get your complete Janm Kundali — Lagna, Nakshatra, all 9 planets, Dasha, and Parashar remedies.',
    badge: 'Most Popular',
    live: true,
  },
  {
    slug: 'dasha-calculator',
    emoji: '🪐',
    name: 'Vimshottari Dasha Calculator',
    desc: 'Find your current Mahadasha, Antardasha, and Pratyantar Dasha — with timeline for next 20 years.',
    badge: null,
    live: false,
  },
  {
    slug: 'nakshatra-calculator',
    emoji: '⭐',
    name: 'Nakshatra Calculator',
    desc: 'Discover your birth Nakshatra, Pada, lord planet, deity, and key personality traits.',
    badge: null,
    live: false,
  },
  {
    slug: 'rashi-calculator',
    emoji: '🌙',
    name: 'Rashi Calculator',
    desc: 'Find your Moon Sign (Chandra Rashi) — the foundation of all Vedic astrology predictions.',
    badge: null,
    live: false,
  },
  {
    slug: 'lagna-calculator',
    emoji: '⬆️',
    name: 'Lagna Calculator',
    desc: 'Calculate your Ascendant (Lagna) — your outer personality, body, and life direction.',
    badge: null,
    live: false,
  },
  {
    slug: 'sade-sati-calculator',
    emoji: '🕉️',
    name: 'Sade Sati Calculator',
    desc: 'Check if Saturn\'s 7.5 year Sade Sati is active for you — Rising, Peak, or Setting phase.',
    badge: 'Trending',
    live: false,
  },
  {
    slug: 'manglik-dosh-calculator',
    emoji: '🔴',
    name: 'Manglik Dosh Calculator',
    desc: 'Check Mangal Dosha status — severity level, cancellation rules, and Parashar remedies.',
    badge: null,
    live: false,
  },
];

const FAQS = [
  {
    q: 'Are these calculators really free?',
    a: 'Yes, 100% free. All 7 calculators give complete results without any payment, signup, or hidden charges. Trikal Vaani believes Vedic wisdom should be accessible to everyone.',
  },
  {
    q: 'How accurate are Trikal Vaani calculators?',
    a: 'All calculators use Swiss Ephemeris — the same astronomical library used by NASA and world-class astrology software. Calculations are based on Lahiri Ayanamsha (Government of India standard) and BPHS (Brihat Parashara Hora Shastra) classical rules.',
  },
  {
    q: 'What information do I need to use these calculators?',
    a: 'Most calculators need: (1) Date of birth, (2) Time of birth (as exact as possible), (3) Place of birth (city name — auto-suggested via Google Maps). Some calculators like Sade Sati only need date and place.',
  },
  {
    q: 'Why is the birth time so important?',
    a: 'Birth time determines your Lagna (Ascendant), which changes every 2 hours. Even 15-minute difference can shift your Lagna and house positions, changing the entire prediction. Use birth certificate time when possible.',
  },
  {
    q: 'Can I save my Kundli results?',
    a: 'Free calculators show instant results. If you want to permanently save your birth chart with personalized predictions, get the ₹51 Trikal Ka Sandesh — it saves your chart to "My Vault" for life.',
  },
  {
    q: 'Do these calculators work for non-Indian birth places?',
    a: 'Yes. The Google Maps integration supports any city worldwide — New York, London, Dubai, Singapore. Timezone is automatically calculated for accurate results.',
  },
];

export default function CalculatorsHubPage() {
  return (
    <>
      <SiteNav />

      {/* ── JSON-LD: CollectionPage ── */}
      <Script
        id="calculators-collection-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Free Vedic Astrology Calculators',
            description: '7 free Vedic astrology calculators powered by Swiss Ephemeris',
            url: 'https://trikalvaani.com/calculators',
            creator: {
              '@type': 'Person',
              name: 'Rohiit Gupta',
              jobTitle: 'Chief Vedic Architect',
              url: 'https://trikalvaani.com/founder',
            },
            hasPart: CALCULATORS.map((c) => ({
              '@type': 'SoftwareApplication',
              name: c.name,
              applicationCategory: 'LifestyleApplication',
              url: `https://trikalvaani.com/calculators/${c.slug}`,
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
            })),
          }),
        }}
      />

      {/* ── JSON-LD: FAQPage ── */}
      <Script
        id="calculators-faq-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      {/* ── JSON-LD: BreadcrumbList ── */}
      <Script
        id="calculators-breadcrumb-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
              { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
            ],
          }),
        }}
      />

      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-5xl mx-auto">

          {/* ── BREADCRUMB ── */}
          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Calculators</span>
          </nav>

          {/* ── H1 ── */}
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Vedic Astrology Calculators
          </h1>

          <p className="text-base md:text-lg text-slate-300 mb-6">
            7 free calculators · Swiss Ephemeris accuracy · BPHS classical rules · 100% free, forever.
          </p>

          {/* ── GEO DIRECT ANSWER (40-60 words) ── */}
          <div
            className="rounded-xl p-5 mb-8"
            style={{
              background: 'rgba(212,175,55,0.06)',
              border: `1px solid ${GOLD_RGBA(0.2)}`,
            }}
          >
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikal Vaani offers 7 free Vedic astrology calculators</strong> — Kundli, Dasha, Nakshatra, Rashi, Lagna, Sade Sati, and Manglik Dosh. All calculators are powered by Swiss Ephemeris (NASA-grade accuracy), use Lahiri Ayanamsha, and follow BPHS classical rules. No signup. No payment. Instant results.
            </p>
          </div>

          {/* ── E-E-A-T AUTHOR STRIP ── */}
          <div
            className="flex items-center gap-3 mb-10 p-4 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ background: GOLD, color: '#080B12' }}
            >
              RG
            </div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Engine: Swiss Ephemeris · Lahiri Ayanamsha · BPHS Classical Rules
              </div>
            </div>
          </div>

          {/* ── CALCULATOR CARDS GRID ── */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>
              Choose Your Calculator
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CALCULATORS.map((calc) => (
                <Link
                  key={calc.slug}
                  href={`/calculators/${calc.slug}`}
                  className="group relative p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${calc.live ? GOLD_RGBA(0.3) : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {/* Badge */}
                  {calc.badge && (
                    <span
                      className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: GOLD,
                        color: '#080B12',
                      }}
                    >
                      {calc.badge}
                    </span>
                  )}

                  {/* Coming Soon */}
                  {!calc.live && (
                    <span
                      className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(148,163,184,0.15)',
                        color: '#94A3B8',
                        border: '1px solid rgba(148,163,184,0.25)',
                      }}
                    >
                      Coming Soon
                    </span>
                  )}

                  <div className="text-3xl mb-3">{calc.emoji}</div>

                  <h3
                    className="text-lg font-serif font-bold mb-2 transition-colors"
                    style={{ color: GOLD }}
                  >
                    {calc.name}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    {calc.desc}
                  </p>

                  <div
                    className="text-sm font-medium inline-flex items-center gap-1.5 transition-all"
                    style={{ color: GOLD_RGBA(0.85) }}
                  >
                    {calc.live ? (
                      <>
                        <span>Use Calculator</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </>
                    ) : (
                      <span className="text-slate-500">Available soon</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── WHY TRIKAL VAANI ── */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>
              Why Trikal Vaani Calculators?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Pillar
                emoji="🎯"
                title="NASA-Grade Accuracy"
                desc="Swiss Ephemeris engine — the same astronomical library used by professional astrology software worldwide."
              />
              <Pillar
                emoji="📚"
                title="BPHS Classical Rules"
                desc="Every calculation follows Brihat Parashara Hora Shastra — the foundation text of Vedic astrology written by Maharishi Parashar."
              />
              <Pillar
                emoji="🆓"
                title="100% Free Forever"
                desc="No signup. No payment. No hidden charges. Instant results. Trikal Vaani believes wisdom should be accessible."
              />
            </div>
          </section>

          {/* ── EDUCATIONAL CONTENT ── */}
          <section className="mb-12 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>
              What Is Vedic Astrology?
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic astrology (Jyotish Shastra) is one of the six Vedangas — the supplementary disciplines of the Vedas. Unlike Western astrology which uses the tropical zodiac, Vedic astrology uses the sidereal zodiac with Lahiri Ayanamsha, accounting for the precession of equinoxes. This makes Vedic calculations astronomically accurate to the actual planetary positions in the sky.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Maharishi Parashar, the father of Vedic astrology, wrote <em>Brihat Parashara Hora Shastra (BPHS)</em> over 5,000 years ago. This text laid down the classical rules for analyzing birth charts (Kundali), Dasha periods, Nakshatras, and remedies (upay). Trikal Vaani\'s calculators implement these classical rules with modern computational precision.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>
              How Our Calculators Work
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              When you enter your birth date, time, and place, our engine performs these steps: (1) Converts birth location to latitude, longitude, and timezone via Google Maps. (2) Calculates astronomical positions of all 9 planets using Swiss Ephemeris. (3) Applies Lahiri Ayanamsha correction. (4) Determines your Lagna, Nakshatra, Rashi, and houses. (5) Computes Vimshottari Dasha periods. (6) Identifies key yogas and doshas per BPHS rules. All this happens in under 5 seconds.
            </p>
          </section>

          {/* ── FAQs ── */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  className="p-4 rounded-xl cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── CTA: ₹51 PREDICTION ── */}
          <section
            className="p-6 md:p-8 rounded-2xl text-center"
            style={{
              background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`,
              border: `1px solid ${GOLD_RGBA(0.35)}`,
            }}
          >
            <h3 className="text-xl md:text-2xl font-serif font-bold mb-2" style={{ color: GOLD }}>
              Want More Than Just Calculations?
            </h3>
            <p className="text-slate-300 mb-1">Get your complete <strong>Jeevan Bhavishyavani</strong> with timing predictions.</p>
            <ul className="text-sm text-slate-400 my-4 space-y-1">
              <li>✓ Full life prediction with action windows</li>
              <li>✓ Career, Marriage, Health timing</li>
              <li>✓ 50+ personalized remedies</li>
              <li>✓ Voice prediction in Hinglish</li>
            </ul>
            <Link
              href="/#birth-form"
              className="inline-block mt-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
              }}
            >
              🔮 Trikal Ka Sandesh — Sirf Aapke Liye — ₹51 →
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}

function Pillar({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <h3 className="font-serif font-bold mb-2" style={{ color: GOLD }}>{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
