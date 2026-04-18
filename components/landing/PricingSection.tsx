'use client';

import { CircleCheck as CheckCircle, Zap, Star, Crown, Gift } from 'lucide-react';
import Link from 'next/link';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const tiers = [
  {
    icon: Zap,
    name: 'Quick Insight',
    price: 21,
    strikethrough: null,
    badge: null,
    tagline: '1 Focused Life Question',
    color: '#3B82F6',
    features: [
      'Answer to 1 Dard Engine question',
      'Vibe score + flag summary',
      'Instant AI-Vedic analysis',
      'Remedy for your current phase',
    ],
  },
  {
    icon: Star,
    name: 'Detailed Guidance',
    price: 99,
    strikethrough: 499,
    badge: 'MOST POPULAR',
    tagline: 'Deep Dive + Full Remedies',
    color: GOLD,
    features: [
      'Full 6 Life Pillar analysis',
      'Vimshottari Dasha timeline',
      'Nakshatra compatibility report',
      'Personalised Upay checklist',
      'Career + Wealth predictions',
      'Downloadable insight summary',
    ],
  },
  {
    icon: Crown,
    name: 'Premium Life Report',
    price: 499,
    strikethrough: null,
    badge: 'COMPLETE',
    tagline: 'Full Report + 1:1 Consultation',
    color: '#10B981',
    features: [
      'Everything in Detailed Guidance',
      '20-page PDF life report',
      '1:1 Guru session with Rohiit Gupta',
      'Gochar transit forecast (12 months)',
      'Relationship karmic compatibility',
      'Priority support channel',
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="py-14 px-4" id="pricing">
      <div className="max-w-5xl mx-auto">

        <div
          className="rounded-2xl px-5 py-4 mb-10 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(212,175,55,0.08) 100%)',
            border: '1px solid rgba(34,197,94,0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300">
                INAUGURAL OFFER: 100% FREE FOR 30 DAYS
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                All premium features unlocked at no cost during our launch window. No card required.
              </p>
            </div>
          </div>
          <Link
            href="/#birth-form"
            className="flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
            style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.4)', color: '#34d399' }}
          >
            GET PREMIUM REPORT NOW
          </Link>
        </div>

        <div className="text-center mb-10">
          <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.6) }}>
            Choose Your Path
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Trikal Vaani <span style={{ color: GOLD }}>Pricing</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Transparent, merit-based pricing. Currently 100% free during our inaugural launch window.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {tiers.map(({ icon: Icon, name, price, strikethrough, badge, tagline, color, features }) => {
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
                      background: isFeatured ? `linear-gradient(135deg, ${GOLD_RGBA(0.18)} 0%, ${GOLD_RGBA(0.08)} 100%)` : 'rgba(16,185,129,0.1)',
                      color: isFeatured ? GOLD : '#10B981',
                      borderBottom: `1px solid ${isFeatured ? GOLD_RGBA(0.2) : 'rgba(16,185,129,0.2)'}`,
                    }}
                  >
                    {badge}
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${color}18`, border: `1px solid ${color}33` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <p className="font-serif font-bold text-white text-lg">{name}</p>
                  <p className="text-xs text-slate-500 mb-4">{tagline}</p>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-serif font-bold text-3xl text-white">₹{price}</span>
                    {strikethrough && (
                      <span className="text-sm text-slate-600 line-through">₹{strikethrough}</span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-400 mb-5 font-semibold">FREE during launch offer</p>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/#birth-form"
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all duration-300 hover:scale-[1.02] block"
                    style={
                      isFeatured
                        ? {
                            background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                            color: '#080B12',
                          }
                        : {
                            background: `${color}14`,
                            border: `1px solid ${color}33`,
                            color,
                          }
                    }
                  >
                    Get Free Access
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          No credit card required · No hidden fees · For educational purposes
        </p>
      </div>
    </section>
  );
}
