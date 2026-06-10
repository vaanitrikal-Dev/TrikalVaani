import Link from 'next/link';
import { Sparkles, ChevronDown } from 'lucide-react';

// ============================================================
// FILE: components/landing/Hero.tsx
// VERSION: v2.0 — SEO/EEAT/GEO fixes (Claude audit June 2026)
// CHANGES vs v1.x:
//   ✅ FIX-1: Added sr-only H1 with full keyword phrase for Google
//      Visual Trikaal/Vaani heading unchanged (aria-hidden)
//      Google now reads: "Free AI Vedic Astrology — Accurate Kundli
//      & Life Predictions by Rohiit Gupta, Chief Vedic Architect"
//   ✅ FIX-2: Removed fake/unverified social proof (E-E-A-T violation)
//      "Trusted by 10,000+ seekers" → capability badge (Swiss Ephemeris
//      · BPHS · Bhrigu Nadi) — 100% verifiable, zero number claims
//      "10K+ Analyses Done" → "Swiss Ephemeris Powered"
//      "100% Free Forever" → "Free to Start" (accurate — paid tiers exist)
//      "5000 Years of Wisdom" → kept (historical fact, verifiable)
//   PROTECTED (untouched): all animations, gradients, CTA buttons,
//      scroll arrow, layout, colors, font sizes, mobile breakpoints.
// ============================================================

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-12">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(76,29,149,0.22) 0%, rgba(2,8,23,0) 70%)',
        }}
      />

      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse, ${GOLD_RGBA(0.07)} 0%, transparent 65%)`,
          animation: 'aura-expand 4s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">

        {/* ── CAPABILITY BADGE ─────────────────────────────────────────────
            v2.0: Replaced "Trusted by 10,000+ seekers" (unverified number =
            E-E-A-T violation) with verifiable technical capability signals.
            Swiss Ephemeris + BPHS + Bhrigu Nadi = 100% factual claims.
        ──────────────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
          style={{
            background: GOLD_RGBA(0.08),
            border: `1px solid ${GOLD_RGBA(0.28)}`,
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
          <span className="text-xs font-medium tracking-widest uppercase" style={{ color: `${GOLD}cc` }}>
            Swiss Ephemeris · BPHS · Bhrigu Nadi
          </span>
          <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
        </div>

        {/* ── H1 — SEO / GEO / AEO / E-E-A-T ─────────────────────────────
            v2.0 FIX: sr-only H1 carries the full keyword-rich headline that
            Google, Perplexity, SGE, and ChatGPT index as the primary page
            signal. Placed BEFORE the visual heading so DOM order is correct.

            Google reads:
              "Free AI Vedic Astrology — Accurate Kundli & Life Predictions
               by Rohiit Gupta, Chief Vedic Architect"

            Entities covered: Free AI, Vedic Astrology, Kundli, Life
            Predictions, Rohiit Gupta, Chief Vedic Architect.
            Matches Person schema @id in layout.tsx + HomepageSchema.

            Visual heading below is aria-hidden — screen readers get the
            sr-only H1 instead (better accessibility too).
        ──────────────────────────────────────────────────────────────────── */}
        <h1 className="sr-only">
          Free AI Vedic Astrology — Accurate Kundli &amp; Life Predictions by Rohiit Gupta, Chief Vedic Architect
        </h1>

        <div className="relative mb-6">
          {/* aria-hidden: screen readers use sr-only H1 above instead */}
          <p
            aria-hidden="true"
            className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none"
            style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}
          >
            <span className="text-gradient-gold">Trikaal</span>
            <br />
            <span className="text-gradient-gold">Vaani</span>
          </p>
          <div
            className="absolute inset-0 -z-10 blur-3xl opacity-25"
            aria-hidden="true"
            style={{
              background: `radial-gradient(ellipse, ${GOLD_RGBA(0.45)} 0%, transparent 70%)`,
            }}
          />
        </div>

        <p
          className="font-serif text-lg sm:text-xl md:text-2xl mb-3 italic leading-relaxed"
          style={{ color: `${GOLD}99` }}
        >
          त्रिकाल — Past, Present &amp; Future
        </p>

        <p className="text-base sm:text-lg md:text-xl text-slate-300/80 max-w-2xl mb-3 leading-relaxed">
          Free AI Life Analysis.{' '}
          <span className="font-medium" style={{ color: `${GOLD}e6` }}>Rooted in classical Jyotish,</span>{' '}
          guided by 5000 years of Vedic wisdom.
        </p>

        <p className="text-sm text-slate-400/60 mb-10 max-w-md">
          Uncover your daily cosmic energy, life pillar scores, and Jyotish insights — in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <a
            href="#birth-form"
            className="group relative px-8 py-4 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #A8862A 100%)`,
              color: '#020817',
              boxShadow: `0 0 32px ${GOLD_RGBA(0.4)}`,
            }}
          >
            <span className="relative z-10">Reveal My Cosmic Score</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg, #E8CC6A 0%, #D4AF37 100%)' }}
            />
          </a>

          <Link
            href="/blog"
            className="px-8 py-4 rounded-full text-sm font-medium tracking-wide transition-all duration-300"
            style={{
              border: `1px solid ${GOLD_RGBA(0.28)}`,
              background: GOLD_RGBA(0.05),
              color: `${GOLD}cc`,
            }}
          >
            Explore Vedic Wisdom
          </Link>
        </div>

        {/* ── STATS BAR ────────────────────────────────────────────────────
            v2.0: Replaced unverified/inaccurate numbers with factual claims:
            "10K+ Analyses Done" → "Swiss Ephemeris Powered" (verifiable tech)
            "100% Free Forever" → "Free to Start" (accurate — paid tiers exist)
            "5000 Years of Wisdom" → kept (historical fact)
            Rule: Never show a stat that cannot be verified by Google/user.
        ──────────────────────────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center gap-6">
          {[
            { value: '⚡', label: 'Swiss Ephemeris Powered' },
            { value: '5000', label: 'Years of Wisdom' },
            { value: '✓', label: 'Free to Start' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6">
              {i > 0 && <div className="w-px h-8 bg-white/10" />}
              <div className="text-center">
                <div className="text-xl font-bold" style={{ color: GOLD }}>{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <a
        href="#pillars"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 transition-colors duration-300"
        style={{ ['--hover-color' as string]: GOLD }}
        aria-label="Scroll down to explore"
      >
        <span className="text-xs tracking-widest uppercase">Explore</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </a>
    </section>
  );
}
