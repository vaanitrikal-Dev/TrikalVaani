// 🔱 TRIKAL VAANI | components/landing/PricingSection.tsx | v2.0
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-05-25
// ============================================================================
// REBUILD (v1.x → v2.0):
//
//   ❌ OLD v1.x: 3 fake tiers (₹21/₹99/₹499) + struck-through MRP +
//      "INAUGURAL OFFER 100% FREE" banner. All removed.
//
//   ✅ NEW v2.0: 5 real product cards, honest live INR pricing, NO fake MRP.
//      1. Prediction (Free → ₹51/domain)   → /#birth-form
//      2. Kundali Milan (₹51/101/151)        → /kundali-milan#kundali-milan-form
//      3. Birth Muhurat (Free/₹101/₹151)     → /free-child-birth-muhurat-calculator
//      4. Karmic Reading (₹251)              → /karmic-background-reading
//      5. Voice Guidance (₹11/51/101)        → /#birth-form (floating mic)
//
//   ✅ SEO/GEO/AEO/E-E-A-T baked in:
//      - AEO 40–60 word direct-answer paragraph above the grid (AI-liftable).
//      - Self-contained OfferCatalog JSON-LD (@id="#pricing-offers"), real
//        INR prices, provider = Person Rohiit Gupta (E-E-A-T). Unique @id —
//        no collision with HomepageSchema.
//      - entity-rich copy (Ashtakoot, BPHS, Bhrigu Nandi Nadi, Swiss Ephemeris).
//
//   STYLE: matches site tokens — bg #080B12, gold #D4AF37, serif headings.
//   NOTE: NOT re-imported into page.tsx yet. Add when CEO confirms placement.
// ============================================================================

import {
  CircleCheck as CheckCircle,
  Sparkles,
  HeartHandshake,
  Baby,
  Infinity as InfinityIcon,
  Mic,
} from 'lucide-react';
import Link from 'next/link';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ── Product cards (real, honest pricing — no fake MRP) ────────────────────────
const products = [
  {
    icon: Sparkles,
    name: 'Life Prediction',
    price: 'Free',
    sub: 'then ₹51 / extra domain',
    badge: null,
    tagline: 'Start with your free AI-Vedic reading',
    accent: '#3B82F6',
    href: '/#birth-form',
    cta: 'Get Free Reading',
    features: [
      '15 life domains — career, wealth, marriage & more',
      'Swiss Ephemeris + Shadbala accuracy',
      'Instant AI-Vedic analysis in seconds',
      '₹51 to unlock each additional domain',
    ],
  },
  {
    icon: HeartHandshake,
    name: 'Kundali Milan',
    price: '₹51',
    sub: '₹51 · ₹101 · ₹151 tiers',
    badge: 'MOST POPULAR',
    tagline: 'Marriage compatibility, the classical way',
    accent: GOLD,
    href: '/kundali-milan#kundali-milan-form',
    cta: 'Match Kundalis',
    features: [
      'Full 8-koot Ashtakoot + Manglik Dosh check',
      'Deep ₹101 reading: 1000-word + 10 remedies',
      '₹151 Both: Couple + Parent narratives',
      'PDF on WhatsApp, Email & shareable link',
    ],
  },
  {
    icon: Baby,
    name: 'Birth Muhurat',
    price: 'Free',
    sub: '₹101 report · ₹151 + remedies',
    badge: 'NEW',
    tagline: 'Auspicious birth window for your child',
    accent: '#10B981',
    href: '/free-child-birth-muhurat-calculator',
    cta: 'Find the Muhurat',
    features: [
      'Best birth time within doctor-approved window',
      '9-factor BPHS muhurat scan',
      '₹101: full report · ₹151: + 10 remedies',
      'Medical safety always comes first',
    ],
  },
  {
    icon: InfinityIcon,
    name: 'Karmic Reading',
    price: '₹251',
    sub: 'one deep reading',
    badge: null,
    tagline: 'Who they truly are, beneath the surface',
    accent: '#A855F7',
    href: '/karmic-background-reading',
    cta: 'Read the Karma',
    features: [
      '6 karmic dimensions via Bhrigu Nandi Nadi',
      'Personality, fidelity, finances, family & more',
      'Available in 3 languages',
      'Patterns, never verdicts — understanding to prepare',
    ],
  },
  {
    icon: Mic,
    name: 'Voice Guidance',
    price: '₹11',
    sub: '₹11 · ₹51 · ₹101 packs',
    badge: null,
    tagline: 'Ask Trikal aloud, hear the answer',
    accent: '#F59E0B',
    href: '/#birth-form',
    cta: 'Ask by Voice',
    features: [
      'Spoken answers in natural Hinglish',
      '₹11: 1 question · 1 day',
      '₹51: 5 questions · 7 days',
      '₹101: 12 questions · 30 days',
    ],
  },
];

// ── OfferCatalog JSON-LD — real prices, E-E-A-T provider ──────────────────────
const offerSchema = {
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  '@id': 'https://trikalvaani.com/#pricing-offers',
  name: 'Trikal Vaani Vedic Astrology Services',
  url: 'https://trikalvaani.com/',
  provider: {
    '@type': 'Person',
    name: 'Rohiit Gupta',
    jobTitle: 'Chief Vedic Architect',
    url: 'https://trikalvaani.com/founder',
    worksFor: {
      '@type': 'Organization',
      name: 'Trikal Vaani',
      url: 'https://trikalvaani.com',
    },
  },
  itemListElement: [
    {
      '@type': 'Offer',
      name: 'Life Prediction',
      description:
        'Free AI-Vedic life prediction across 15 domains, powered by Swiss Ephemeris and Shadbala. Additional domains at ₹51 each.',
      price: '0',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/#birth-form',
    },
    {
      '@type': 'Offer',
      name: 'Kundali Milan',
      description:
        'Vedic marriage compatibility with full 8-koot Ashtakoot, Manglik Dosh analysis and remedies. Tiers at ₹51, ₹101 and ₹151.',
      price: '51',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/kundali-milan',
    },
    {
      '@type': 'Offer',
      name: 'Child Birth Muhurat',
      description:
        'Auspicious birth-window finder using a 9-factor BPHS scan within the doctor-approved delivery window. Free calculator; full report ₹101, with remedies ₹151.',
      price: '0',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/free-child-birth-muhurat-calculator',
    },
    {
      '@type': 'Offer',
      name: 'Karmic Background Reading',
      description:
        'A six-dimension karmic reading via Bhrigu Nandi Nadi covering personality, conduct, finances and life patterns. ₹251.',
      price: '251',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/karmic-background-reading',
    },
    {
      '@type': 'Offer',
      name: 'Voice Guidance',
      description:
        'Spoken Vedic guidance in Hinglish. Packs at ₹11 (1 question), ₹51 (5 questions) and ₹101 (12 questions).',
      price: '11',
      priceCurrency: 'INR',
      url: 'https://trikalvaani.com/#birth-form',
    },
  ],
};

export default function PricingSection() {
  return (
    <section className="py-16 px-4" id="pricing">
      {/* OfferCatalog schema — self-contained, unique @id, no collisions */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />

      <div className="max-w-6xl mx-auto">

        {/* ── Heading ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <p
            className="text-xs font-medium tracking-widest uppercase mb-2"
            style={{ color: GOLD_RGBA(0.6) }}
          >
            Choose Your Path
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Trikal Vaani <span style={{ color: GOLD }}>Services &amp; Pricing</span>
          </h2>
        </div>

        {/* ── AEO direct-answer paragraph (40–60 words, AI-liftable) ──────────
            Written so Perplexity / SGE / Gemini can extract a clean,
            accurate one-paragraph answer to "How much does Trikal Vaani cost?" */}
        <p className="text-center text-sm sm:text-base text-slate-300/80 max-w-3xl mx-auto leading-relaxed mb-12">
          Trikal Vaani offers AI-powered Vedic astrology with honest, transparent pricing.
          Life predictions start free, with extra domains at ₹51. Kundali Milan ranges ₹51–₹151,
          Child Birth Muhurat reports ₹101–₹151, a Karmic Background Reading is ₹251, and voice
          guidance starts at just ₹11 — all guided by Rohiit Gupta, Chief Vedic Architect.
        </p>

        {/* ── Cards grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(
            ({ icon: Icon, name, price, sub, badge, tagline, accent, href, cta, features }) => {
              const isFeatured = badge === 'MOST POPULAR';
              return (
                <div
                  key={name}
                  className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'rgba(11,16,26,0.9)',
                    border: `1px solid ${isFeatured ? GOLD_RGBA(0.35) : 'rgba(148,163,184,0.1)'}`,
                    boxShadow: isFeatured ? `0 0 40px ${GOLD_RGBA(0.1)}` : 'none',
                  }}
                >
                  {badge && (
                    <div
                      className="px-4 py-1.5 text-center text-xs font-bold tracking-widest"
                      style={{
                        background: isFeatured
                          ? `linear-gradient(135deg, ${GOLD_RGBA(0.18)} 0%, ${GOLD_RGBA(0.08)} 100%)`
                          : `${accent}1a`,
                        color: isFeatured ? GOLD : accent,
                        borderBottom: `1px solid ${isFeatured ? GOLD_RGBA(0.2) : `${accent}33`}`,
                      }}
                    >
                      {badge}
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>

                    <p className="font-serif font-bold text-white text-lg">{name}</p>
                    <p className="text-xs text-slate-500 mb-4">{tagline}</p>

                    <div className="flex items-baseline gap-2">
                      <span className="font-serif font-bold text-3xl text-white">{price}</span>
                    </div>
                    <p className="text-xs mb-5 font-medium" style={{ color: GOLD_RGBA(0.75) }}>
                      {sub}
                    </p>

                    <ul className="space-y-2.5 flex-1 mb-6">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle
                            className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                            style={{ color: accent }}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={href}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all duration-300 hover:scale-[1.02] block"
                      style={
                        isFeatured
                          ? {
                              background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                              color: '#080B12',
                            }
                          : {
                              background: `${accent}14`,
                              border: `1px solid ${accent}33`,
                              color: accent,
                            }
                      }
                    >
                      {cta}
                    </Link>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* ── Trust line ──────────────────────────────────────────────────── */}
        <p className="text-center text-xs text-slate-600 mt-8">
          Honest pricing · No hidden fees · Powered by Swiss Ephemeris · BPHS classical methods
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// END — components/landing/PricingSection.tsx v2.0
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// 5 real products · honest INR pricing · OfferCatalog schema · AEO answer
// ============================================================================
