/**
 * ============================================================
 * TRIKAL VAANI — Pricing Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/pricing/page.tsx
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Sparkles, Zap, Crown, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — Trikal Vaani Vedic AI Astrology',
  description: 'Choose your Trikal Vaani plan. Free Vedic AI analysis, or unlock deep predictions from ₹51/month. Swiss Ephemeris powered, Parashara classical system.',
  alternates: { canonical: 'https://trikalvaani.com/pricing' },
};

const GOLD = '#D4AF37';

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    tagline: 'Your first cosmic glimpse',
    icon: Sparkles,
    color: '#94A3B8',
    features: [
      '150–200 word plain-language summary',
      'Key message + Do this + Avoid this',
      'Swiss Ephemeris chart calculation',
      'All 11 Dard Engine domains',
      'Hinglish / Hindi / English output',
      'Upgrade prompt with locked insights',
    ],
    locked: [
      'Full planetary analysis',
      'Action & Avoid windows with dates',
      'Classical remedies (Parashara)',
      'Yoga detection',
    ],
    cta: 'Start Free',
    ctaHref: '/#birth-form',
    highlight: false,
  },
  {
    name: 'Basic',
    price: '₹51',
    period: 'per month',
    tagline: 'Deep dive into your karma',
    icon: Zap,
    color: GOLD,
    features: [
      '500–800 word detailed summary',
      'Full planetary analysis with citations',
      'Action windows with exact dates',
      'Avoid windows — what to skip & when',
      'Classical remedies (Parashara BPHS)',
      'Yoga detection with classical basis',
      'All 11 Dard Engine domains',
      'PDF Kundali export',
      'World context search grounding',
    ],
    locked: [],
    cta: 'Unlock Deep Reading',
    ctaHref: '/#birth-form',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '₹99',
    period: 'per month',
    tagline: 'Full Vedic intelligence system',
    icon: Crown,
    color: '#A78BFA',
    features: [
      'Everything in Basic',
      'Domain-specific extra insights',
      'Full reasoning audit trail',
      'WhatsApp weekly forecast',
      'Jini AI unlimited conversations',
      'Priority support',
      'Pratyantar Dasha precision (3–7 day)',
      'Sookshma Dasha (hourly precision)',
    ],
    locked: [],
    cta: 'Go Pro',
    ctaHref: '/#birth-form',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '₹499',
    period: 'per month',
    tagline: 'Personal Vedic architect on call',
    icon: Star,
    color: '#F472B6',
    features: [
      'Everything in Pro',
      '1-on-1 session with Rohiit Gupta (1hr/mo)',
      'Custom Muhurta calculations',
      'Business astrology reports',
      'API access (500 calls/month)',
      'NRI & international support',
      'Dedicated WhatsApp line',
    ],
    locked: [],
    cta: 'Book Premium',
    ctaHref: 'https://wa.me/919211804111?text=Namaste%20Rohiit%20ji%2C%20I%20want%20Premium%20plan',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#080B12] px-4 py-24">

      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: GOLD }}>
              Transparent Pricing
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF' }}
          >
            Choose Your{' '}
            <span style={{ color: GOLD }}>Cosmic Path</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Powered by Swiss Ephemeris — the same engine used by professional astrologers worldwide.
            Start free, upgrade when you need deeper answers.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-500">100% free during our launch window — no card required</span>
          </div>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                    ? `1px solid rgba(212,175,55,0.35)`
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: plan.highlight
                    ? '0 0 40px rgba(212,175,55,0.12)'
                    : 'none',
                }}
              >
                {/* Most Popular badge */}
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
                    style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: plan.color }} />
                  </div>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: `${plan.color}99` }}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  </div>
                  <p className="text-xs text-slate-500">{plan.tagline}</p>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                      <span className="text-xs text-slate-300 leading-relaxed">{f}</span>
                    </div>
                  ))}
                  {plan.locked.map((f) => (
                    <div key={f} className="flex items-start gap-2 opacity-35">
                      <div className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                        <div className="w-2.5 h-px bg-slate-600" />
                      </div>
                      <span className="text-xs text-slate-500 leading-relaxed line-through">{f}</span>
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
                          boxShadow: `0 0 20px rgba(212,175,55,0.3)`,
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
              </div>
            );
          })}
        </div>

        {/* Trust row */}
        <div className="mt-14 text-center">
          <p className="text-xs text-slate-600 mb-4">
            Tier verified from Supabase — cannot be spoofed · Expires automatically if not renewed
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['Swiss Ephemeris Engine', 'Parashara BPHS Classical', 'Lahiri Ayanamsha', 'No Card Required'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full" style={{ background: GOLD }} />
                <span className="text-xs text-slate-500">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-xs text-slate-600 hover:text-yellow-400/70 transition-colors"
          >
            ← Back to Trikal Vaani
          </Link>
        </div>

      </div>
    </main>
  );
}