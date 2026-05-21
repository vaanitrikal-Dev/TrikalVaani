'use client';

// 🔱 TRIKAL VAANI | components/landing/KundaliMilanTeaser.tsx | v2.1
// Owner: Rohiit Gupta, Chief Vedic Architect
// ============================================================================
// CHANGE LOG (v2.0 → v2.1):
//   Established-feature framing — removed all "live / new / launch / Day 8" tags.
//   - Badge: "Now Live · Try Free" → "India's Trusted Kundali Milan"
//   - Headline: "Try It Free Today" → "Trusted Vedic Compatibility"
//   - Subhead reworded to confident, evergreen tone (no "try" urgency).
//   - CTAs, pricing cards, feature strip, trust line, colors, IR-12 slot unchanged.
//   - Footer note de-dated.
// ============================================================================

import { Heart, Sparkles, FileText, Share2, ShieldCheck, ArrowRight } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function KundaliMilanTeaser() {
  return (
    <section
      id="kundali-milan-teaser"
      className="py-16 sm:py-20 px-4"
      style={{ background: '#080B12' }}
    >
      <div className="max-w-5xl mx-auto">

        {/* ── HEADER BADGE ────────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full"
            style={{
              color: GOLD,
              border: `1px solid ${GOLD_RGBA(0.3)}`,
              background: GOLD_RGBA(0.06),
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            India&apos;s Trusted Kundali Milan
          </span>
        </div>

        {/* ── HEADLINE ────────────────────────────────────────────────── */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center leading-tight">
          Kundali Milan —{' '}
          <span style={{ color: GOLD }}>Trusted Vedic Compatibility</span>
        </h2>

        <p className="text-center text-slate-400 mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          Vedic compatibility analysis with personalized remedies. Computed using
          Swiss Ephemeris precision and BPHS classical rules — by Rohiit Gupta,
          Chief Vedic Architect.
        </p>

        {/* ── PRICING PREVIEW CARD ────────────────────────────────────── */}
        <div
          className="mt-10 rounded-2xl p-6 sm:p-8"
          style={{
            background: 'rgba(13,17,30,0.85)',
            border: `1px solid ${GOLD_RGBA(0.18)}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
          }}
        >
          {/* Pricing Tiers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

            {/* Free Preview */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                Free Preview
              </div>
              <div className="text-2xl font-bold text-white">₹0</div>
              <div className="text-xs text-slate-500 mt-1">36 Guna score</div>
            </div>

            {/* Basic Milan */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: GOLD_RGBA(0.04),
                border: `1px solid ${GOLD_RGBA(0.2)}`,
              }}
            >
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: GOLD_RGBA(0.7) }}>
                Basic Milan
              </div>
              <div className="text-2xl font-bold" style={{ color: GOLD }}>₹51</div>
              <div className="text-xs text-slate-500 mt-1">Full Ashtakoot</div>
            </div>

            {/* Deep Milan — MOST POPULAR */}
            <div
              className="rounded-xl p-4 text-center relative"
              style={{
                background: GOLD_RGBA(0.08),
                border: `1px solid ${GOLD_RGBA(0.4)}`,
              }}
            >
              <span
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: GOLD, color: '#080B12' }}
              >
                Most Popular
              </span>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: GOLD_RGBA(0.9) }}>
                Deep Milan
              </div>
              <div className="text-2xl font-bold" style={{ color: GOLD }}>₹101</div>
              <div className="text-xs text-slate-500 mt-1">10 Remedies</div>
            </div>

            {/* Both Versions */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: GOLD_RGBA(0.04),
                border: `1px solid ${GOLD_RGBA(0.2)}`,
              }}
            >
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: GOLD_RGBA(0.7) }}>
                Both Versions
              </div>
              <div className="text-2xl font-bold" style={{ color: GOLD }}>₹151</div>
              <div className="text-xs text-slate-500 mt-1">Couple + Parent</div>
            </div>

          </div>

          {/* ── FEATURE STRIP ─────────────────────────────────────────── */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: GOLD_RGBA(0.1) }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                36 Guna
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                Mangal Dosh
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                Nadi Dosh
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                Dos &amp; Don&apos;ts
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                10 Remedies
              </div>
              <div className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                PDF + WhatsApp
              </div>
            </div>
          </div>

          {/* ── CTAs ──────────────────────────────────────────────────── */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/kundali-milan"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
              }}
            >
              Start Your Kundali Milan
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/kundali-milan#pricing"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                color: GOLD,
                border: `1px solid ${GOLD_RGBA(0.3)}`,
                background: GOLD_RGBA(0.06),
              }}
            >
              See Pricing →
            </a>
          </div>

          <p className="text-center text-[11px] text-slate-500 mt-4">
            Free preview instantly · Paid readings in 60 seconds · No login required
          </p>

        </div>

        {/* ── TRUST LINE ──────────────────────────────────────────────── */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Reading framework by Rohiit Gupta, Chief Vedic Architect · Delhi NCR ·
          Powered by Swiss Ephemeris &amp; BPHS Classical rules
        </p>

      </div>
    </section>
  );
}

// ============================================================================
// END — components/landing/KundaliMilanTeaser.tsx v2.1
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// 🔒 EARNING LOCKED (IR-12)
// ============================================================================
