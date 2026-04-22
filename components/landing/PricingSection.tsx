'use client';

import { CircleCheck as CheckCircle, Zap, Star, Crown, Gift, Phone } from 'lucide-react';
import Link from 'next/link';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ✅ FIXED: Pricing updated to match result page (₹51 deep reading added)
// Consistent with PersonalizedPrediction.tsx unlock pricing
const tiers = [
  {
    icon: Zap,
    name: 'Quick Insight',
    price: 51,                    // ✅ was ₹21 — now matches result page
    strikethrough: 199,
    badge: null,
    tagline: '1 Deep Life Reading',
    color: '#3B82F6',
    features: [
      'AI Deep Reading — your specific question',
      'Key dates + action advice',
      'Gochar + natal chart analysis',
      'Remedy for your current phase',
      'PDF report download',
    ],
  },
  {
    icon: Star,
    name: 'Detailed Guidance',
    price: 99,
    strikethrough: 499,
    badge: 'MOST POPULAR',
    tagline: '4-Week Master Forecast',
    color: GOLD,
    features: [
      'Everything in Quick Insight',
      'Full 4-week prediction + Upay',
      'Pratyantar Dasha precision timing',
      'Vimshottari Dasha 10-year timeline',
      'Nakshatra compatibility report',
      'Career + Wealth predictions',
      'PDF report with watermark-free download',
    ],
  },
  {
    icon: Crown,
    name: 'Personal Call',
    price: 499,
    strikethrough: null,
    badge: 'COMPLETE',
    tagline: '8-10 Min with Rohiit Gupta ji',
    color: '#10B981',
    features: [
      'Everything in Detailed Guidance',
      'Live 8-10 min personal reading',
      'Master data analysis (CEO only)',
      'Mobile numerology cross-match',
      'Sector-specific predictions',
      'WhatsApp follow-up summary',
      'Priority booking slot',
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="py-14 px-4" id="pricing">
      <div className="max-w-5xl mx-auto">

        {/* ✅ FIXED: Removed "100% FREE FOR 30 DAYS" — replaced with honest launch offer */}
        <div
          className="rounded-2xl px-5 py-4 mb-10 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(124,58,237,0.08) 100%)',
            border: `1px solid ${GOLD_RGBA(0.3)}`,
          }}
        >
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
            <div>
              <p className="text-sm font-bold" style={{ color: GOLD }}>
                🚀 LAUNCH OFFER — Start Free, Upgrade Anytime
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Basic Kundali + Panchang is always free. Deep readings from ₹51 only.
              </p>
            </div>
          </div>
          <Link
            href="/#birth-form"
            className="flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
            style={{
              background: GOLD_RGBA(0.15),
              border: `1px solid ${GOLD_RGBA(0.4)}`,
              color: GOLD,
            }}
          >
            START FREE NOW
          </Link>
        </div>

        <div className="text-center mb-10">
          <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.6) }}>
            Choose Your Path
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Trikal Vaani <span style={{ color: GOLD }}>Pricing</span>
          </h2>
          {/* ✅ FIXED: Removed "Currently 100% free" — honest description */}
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Transparent, merit-based pricing. Free Kundali always. Deep readings start at ₹51.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {tiers.map(({ icon: Icon, name, price, strikethrough, badge, tagline, color, features }) => {
            const isFeatured = badge === 'MOST POPULAR';
            const isCall     = badge === 'COMPLETE';
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
                        : 'rgba(16,185,129,0.1)',
                      color:      isFeatured ? GOLD : '#10B981',
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
                    {isCall
                      ? <Phone className="w-5 h-5" style={{ color }} />
                      : <Icon className="w-5 h-5" style={{ color }} />
                    }
                  </div>
                  <p className="font-serif font-bold text-white text-lg">{name}</p>
                  <p className="text-xs text-slate-500 mb-4">{tagline}</p>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-serif font-bold text-3xl text-white">₹{price}</span>
                    {strikethrough && (
                      <span className="text-sm text-slate-600 line-through">₹{strikethrough}</span>
                    )}
                  </div>
                  {/* ✅ FIXED: Honest per-tier CTA instead of "FREE" for all */}
                  <p className="text-xs mb-5 font-semibold" style={{ color: isFeatured ? GOLD : '#94a3b8' }}>
                    {isFeatured ? 'Best value — most chosen' : isCall ? 'Book via WhatsApp' : 'Unlock after free reading'}
                  </p>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={isCall ? 'https://wa.me/919999999999?text=I+want+to+book+a+personal+reading' : '/#birth-form'}
                    target={isCall ? '_blank' : undefined}
                    rel={isCall ? 'noopener noreferrer' : undefined}
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
                    {isCall ? '📞 Book on WhatsApp' : isFeatured ? 'Start Free → Upgrade' : 'Start Free Reading'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          No credit card required for free reading · Secure payments via Razorpay · For educational purposes
        </p>
      </div>
    </section>
  );
}
