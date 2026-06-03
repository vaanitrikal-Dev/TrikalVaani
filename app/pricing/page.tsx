/**
 * ============================================================
 * TRIKAAL VAANI — Pricing Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/pricing/page.tsx
 * VERSION: 2.1
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 * ============================================================
 * v2.0 -> v2.1 changes (CEO approved):
 * - REMOVED ghost subscription plans: Pro ₹99/mo and Premium ₹499/mo.
 *   These did not exist anywhere else on the live site. Whole model is
 *   ONE-TIME pricing — no monthly subscriptions.
 * - Replaced with the ACTUAL product lineup (verified against homepage):
 *   Free Preview · Deep Reading ₹51 · Voice (₹11/₹51/₹101) ·
 *   Kundali Milan (₹51/₹101/₹151) · Birth Muhurat (Free/₹101/₹151) ·
 *   Karmic Reading ₹251.
 * - Removed "Jini AI" line (Jini permanently off roadmap → Trikaal AI).
 * - IR-0 fixes: visible brand "Trikaal Vaani" -> "Trikaal Vaani" (title,
 *   schema name, back link); domain/URL trikalvaani.com untouched.
 * - "11 Dard Engine domains" -> "15 life domains".
 * - areaServed: India -> India + Worldwide.
 * - Service + Offer JSON-LD rebuilt with real one-time prices.
 * - Grid changed 4-col -> 3-col to fit 6 product cards cleanly.
 * - Razorpay trust badge kept on every paid card.
 * ============================================================
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Sparkles, Zap, Mic, Heart, Baby, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — Trikaal Vaani Vedic AI Astrology',
  description:
    'Choose your Trikaal Vaani reading. Free Vedic AI analysis, deep readings from ₹51, voice from ₹11, Kundali Milan ₹51–₹151, Karmic Reading ₹251. One-time pricing, no subscriptions. Swiss Ephemeris powered, Parashara classical system. Payments secured by Razorpay.',
  alternates: { canonical: 'https://trikalvaani.com/pricing' },
};

const GOLD = '#D4AF37';

const PLANS = [
  {
    name: 'Free Preview',
    price: '₹0',
    period: 'forever',
    tagline: 'Trikaal Ka Sandesh — your first cosmic glimpse',
    icon: Sparkles,
    color: '#94A3B8',
    paid: false,
    features: [
      '150–200 word plain-language summary',
      'Key message + Do this + Avoid this',
      'Swiss Ephemeris chart calculation',
      'All 15 life domains',
      'Hinglish / Hindi / English output',
      'Instant results — no signup, no card',
    ],
    locked: [],
    cta: 'Start Free',
    ctaHref: '/#birth-form',
    highlight: false,
  },
  {
    name: 'Deep Reading',
    price: '₹51',
    period: 'one-time · per domain',
    tagline: 'Deep dive into your karma',
    icon: Zap,
    color: GOLD,
    paid: true,
    features: [
      '900 word full Vedic analysis',
      'Full planetary analysis with citations',
      'Action windows with exact dates',
      'Avoid windows — what to skip & when',
      'Classical remedies (Parashara BPHS)',
      '5 personalised Upay (remedies)',
      'Yoga detection with classical basis',
      'premium AI engine + expert polish',
    ],
    locked: [],
    cta: 'Unlock Deep Reading — ₹51',
    ctaHref: '/#birth-form',
    highlight: true,
  },
  {
    name: 'Voice Guidance',
    price: '₹11',
    period: '₹11 · ₹51 · ₹101 packs',
    tagline: 'Ask Trikaal aloud, hear the answer',
    icon: Mic,
    color: '#38BDF8',
    paid: true,
    features: [
      '60-second spoken answer',
      'Natural Hindi / Hinglish',
      '₹11 — 1 question · 1 day',
      '₹51 — 5 questions · 7 days',
      '₹101 — 12 questions · 30 days',
      'Powered by Trikaal AI',
    ],
    locked: [],
    cta: 'Ask by Voice — ₹11',
    ctaHref: '/#birth-form',
    highlight: false,
  },
  {
    name: 'Kundali Milan',
    price: '₹51',
    period: '₹51 · ₹101 · ₹151 tiers',
    tagline: 'Marriage compatibility, the classical way',
    icon: Heart,
    color: '#F472B6',
    paid: true,
    features: [
      'Full 8-koot Ashtakoot (36 Guna)',
      'Manglik Dosh + Nadi Dosh check',
      '₹51 Basic — full Ashtakoot',
      '₹101 Deep — 1000-word + 10 remedies',
      '₹151 Both — Couple + Parent narratives',
      'PDF on WhatsApp, Email & shareable link',
    ],
    locked: [],
    cta: 'Match Kundalis',
    ctaHref: '/kundali-milan',
    highlight: false,
  },
  {
    name: 'Birth Muhurat',
    price: 'Free',
    period: '₹101 report · ₹151 + remedies',
    tagline: 'Auspicious birth window for your child',
    icon: Baby,
    color: '#A78BFA',
    paid: true,
    features: [
      'Best birth time in doctor-approved window',
      '9-factor BPHS muhurat scan',
      '₹101 — full report',
      '₹151 — report + 10 remedies',
      'Medical safety always comes first',
      'Hindi / Hinglish / English',
    ],
    locked: [],
    cta: 'Find the Muhurat',
    ctaHref: '/free-child-birth-muhurat-calculator',
    highlight: false,
  },
  {
    name: 'Karmic Reading',
    price: '₹251',
    period: 'one deep reading',
    tagline: 'Who they truly are, beneath the surface',
    icon: Star,
    color: '#FBBF24',
    paid: true,
    features: [
      '6 karmic dimensions via Bhrigu Nandi Nadi',
      'Personality, fidelity, finances & family',
      'Patterns, never verdicts',
      'Available in 3 languages',
      'PDF on WhatsApp, Email & shareable link',
    ],
    locked: [],
    cta: 'Read the Karma — ₹251',
    ctaHref: '/karmic-background-reading',
    highlight: false,
  },
];

// ── Razorpay trust badge (paid plans only) ──
function RazorpayBadge() {
  return (
    <div
      style={{
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '6px 10px',
        borderRadius: '8px',
        background: 'rgba(51,149,255,0.06)',
        border: '1px solid rgba(51,149,255,0.15)',
      }}
    >
      <span style={{ fontSize: '10px' }}>🔒</span>
      <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>
        Secured by{' '}
        <span style={{ color: '#3395FF', fontWeight: 700 }}>Razorpay</span>
        {' · '}UPI · Cards · Wallets
      </span>
    </div>
  );
}

// ── JSON-LD: Service + Offers for SEO/GEO ──
const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Vedic Astrology Prediction',
  provider: {
    '@type': 'Organization',
    name: 'Trikaal Vaani',
    url: 'https://trikalvaani.com',
  },
  areaServed: ['India', 'Worldwide'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Trikaal Vaani Readings',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Free Vedic Analysis (Trikaal Ka Sandesh)',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Deep Reading',
        price: '51',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Voice Guidance',
        price: '11',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Kundali Milan',
        price: '51',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Child Birth Muhurat Report',
        price: '101',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Karmic Background Reading',
        price: '251',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    ],
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#080B12] px-4 py-24">
      {/* JSON-LD for Google SGE / Perplexity / SearchGPT */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.2)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: GOLD }}
            />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: GOLD }}
            >
              Transparent Pricing
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF' }}
          >
            Choose Your <span style={{ color: GOLD }}>Cosmic Path</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Powered by Swiss Ephemeris — the same engine used by professional
            astrologers worldwide. One-time pricing, no subscriptions. Start free,
            pay only when you want deeper answers.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-slate-500">
                Free preview always · Paid readings secured by{' '}
                <span style={{ color: '#3395FF', fontWeight: 600 }}>Razorpay</span>
                {' '}— India&apos;s most trusted payment gateway
              </span>
            </div>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className="relative rounded-2xl p-6 flex flex-col"
                style={{
                  background: plan.highlight
                    ? 'rgba(212,175,55,0.06)'
                    : 'rgba(13,17,30,0.8)',
                  border: plan.highlight
                    ? '1px solid rgba(212,175,55,0.35)'
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: plan.highlight
                    ? '0 0 40px rgba(212,175,55,0.12)'
                    : 'none',
                }}
              >
                {plan.highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                    style={{ background: GOLD, color: '#080B12' }}
                  >
                    MOST POPULAR
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `${plan.color}15`,
                      border: `1px solid ${plan.color}30`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: plan.color }} />
                  </div>
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-1"
                    style={{ color: `${plan.color}99` }}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  </div>
                  <p className="text-xs text-slate-500">{plan.tagline}</p>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check
                        className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                        style={{ color: plan.color }}
                      />
                      <span className="text-xs text-slate-300 leading-relaxed">
                        {f}
                      </span>
                    </div>
                  ))}
                  {plan.locked.map((f) => (
                    <div key={f} className="flex items-start gap-2 opacity-35">
                      <div className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                        <div className="w-2.5 h-px bg-slate-600" />
                      </div>
                      <span className="text-xs text-slate-500 leading-relaxed line-through">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <a
                  href={plan.ctaHref}
                  className="block w-full py-3 rounded-xl text-sm font-bold text-center transition-all duration-300"
                  style={
                    plan.highlight
                      ? {
                          background: `linear-gradient(135deg, ${GOLD} 0%, #F5D76E 50%, ${GOLD} 100%)`,
                          color: '#080B12',
                          boxShadow: '0 0 20px rgba(212,175,55,0.3)',
                        }
                      : {
                          background: `${plan.color}12`,
                          color: plan.color,
                          border: `1px solid ${plan.color}30`,
                        }
                  }
                >
                  {plan.cta}
                </a>

                {/* Razorpay badge — paid plans only */}
                {plan.paid && <RazorpayBadge />}
              </div>
            );
          })}
        </div>

        {/* Trust footer row */}
        <div className="mt-14 text-center">
          <p className="text-xs text-slate-600 mb-4">
            Tier verified from Supabase — cannot be spoofed · One-time payments, nothing auto-renews
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              'Swiss Ephemeris Engine',
              'Parashara BPHS Classical',
              'Lahiri Ayanamsha',
              'Payments via Razorpay',
              'PCI-DSS Secure',
            ].map((t) => {
              const isPaymentTrust = t.includes('Razorpay') || t.includes('PCI');
              return (
                <div key={t} className="flex items-center gap-1.5">
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ background: isPaymentTrust ? '#3395FF' : GOLD }}
                  />
                  <span
                    className="text-xs"
                    style={{
                      color: isPaymentTrust ? '#3395FF' : '#64748B',
                      fontWeight: t.includes('Razorpay') ? 600 : 400,
                    }}
                  >
                    {t}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-xs text-slate-600 hover:text-yellow-400/70 transition-colors"
          >
            ← Back to Trikaal Vaani
          </Link>
        </div>
      </div>
    </main>
  );
}
