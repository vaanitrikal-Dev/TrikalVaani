'use client';

// ============================================================
// FILE: components/layout/CalcStrip.tsx
// PURPOSE: Homepage calculator discovery strip — 6 high-value tools
// VERSION: v1.0
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// DATE: 2026-06-29
// USAGE: Add <CalcStrip /> in app/page.tsx, right after the hero
//        section, before the birth form section.
// ============================================================

import Link from 'next/link';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type CalcItem = {
  emoji: string;
  shortName: string;
  fullName: string;   // used for aria-label (accessibility)
  badge: string;
  paid: boolean;
  href: string;
};

const CALCS: CalcItem[] = [
  {
    emoji: '🖐️',
    shortName: 'AI Hast Rekha',
    fullName: 'AI Hast Rekha Calculator — Palm Reading',
    badge: '₹51 · AI',
    paid: true,
    href: '/hast-rekha-calculator',
  },
  {
    emoji: '💠',
    shortName: 'Gemstone Fit',
    fullName: 'Free Gemstone Suitability Calculator',
    badge: 'FREE',
    paid: false,
    href: '/calculators/free-gemstone-suitability-calculator',
  },
  {
    emoji: '🐍',
    shortName: 'Kaal Sarp Dosh',
    fullName: 'Free Kaal Sarp Dosh Calculator',
    badge: 'FREE',
    paid: false,
    href: '/calculators/free-kaal-sarp-dosh-calculator',
  },
  {
    emoji: '🪔',
    shortName: 'Pitra Dosh',
    fullName: 'Free Pitra Dosh Calculator',
    badge: 'FREE',
    paid: false,
    href: '/calculators/free-pitra-dosh-calculator',
  },
  {
    emoji: '🕉️',
    shortName: 'Sade Sati',
    fullName: 'Free Sade Sati Calculator',
    badge: 'FREE',
    paid: false,
    href: '/calculators/free-sade-sati-calculator',
  },
  {
    emoji: '🔴',
    shortName: 'Manglik Dosh',
    fullName: 'Free Manglik Dosh Calculator',
    badge: 'FREE',
    paid: false,
    href: '/calculators/free-manglik-dosh-calculator',
  },
];

export default function CalcStrip() {
  return (
    <>
      {/* ── Keyframes: only runs for the paid card ── */}
      <style>{`
        @keyframes tvGoldPulse {
          0%   { box-shadow: 0 0  0px 0px rgba(212,175,55,0.00); }
          50%  { box-shadow: 0 0 18px 3px rgba(212,175,55,0.32); }
          100% { box-shadow: 0 0  0px 0px rgba(212,175,55,0.00); }
        }
        .tv-paid-pulse {
          animation: tvGoldPulse 3.2s ease-in-out infinite;
        }
        /* hide native scrollbar everywhere */
        .tv-calc-scroll::-webkit-scrollbar { display: none; }
        .tv-calc-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <section
        aria-label="Quick Vedic Calculators"
        className="w-full py-3.5 px-4"
        style={{
          background: `linear-gradient(180deg, rgba(212,175,55,0.04) 0%, rgba(2,8,23,0) 100%)`,
          borderTop:    `1px solid ${GOLD_RGBA(0.12)}`,
          borderBottom: `1px solid ${GOLD_RGBA(0.08)}`,
        }}
      >
        <div className="max-w-6xl mx-auto">

          {/* ── Header row ── */}
          <div className="flex items-center justify-between mb-2.5">
            <span
              className="text-[10px] font-bold tracking-[0.18em] uppercase select-none"
              style={{ color: GOLD_RGBA(0.55) }}
            >
              ✦ Try a Calculator
            </span>
            <Link
              href="/calculators"
              className="text-[10px] font-semibold transition-opacity hover:opacity-100"
              style={{ color: GOLD_RGBA(0.5), letterSpacing: '0.05em' }}
            >
              All 30 tools →
            </Link>
          </div>

          {/* ── Scroll wrapper with right-edge fade hint on mobile ── */}
          <div className="relative">

            {/* Cards row */}
            <div className="tv-calc-scroll flex gap-2 overflow-x-auto scroll-smooth">
              {CALCS.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  aria-label={c.fullName}
                  className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                    transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]
                    ${c.paid ? 'tv-paid-pulse' : ''}`}
                  style={{
                    minWidth: '148px',
                    background: c.paid
                      ? `linear-gradient(135deg, ${GOLD_RGBA(0.18)} 0%, rgba(8,11,18,0.7) 100%)`
                      : 'rgba(255,255,255,0.035)',
                    border: c.paid
                      ? `1px solid ${GOLD_RGBA(0.55)}`
                      : `1px solid ${GOLD_RGBA(0.2)}`,
                  }}
                >
                  {/* Emoji */}
                  <span className="text-[22px] leading-none select-none" aria-hidden>
                    {c.emoji}
                  </span>

                  {/* Text */}
                  <div className="min-w-0">
                    <p
                      className="text-[13px] font-semibold leading-tight truncate"
                      style={{ color: c.paid ? GOLD : '#e2e8f0' }}
                    >
                      {c.shortName}
                    </p>
                    <p
                      className="text-[10px] font-bold mt-[3px] tracking-wide"
                      style={{ color: c.paid ? GOLD : '#4ade80' }}
                    >
                      {c.badge}
                    </p>
                  </div>
                </Link>
              ))}

              {/* "See all" ghost card — only on mobile end of scroll */}
              <Link
                href="/calculators"
                aria-label="See all 30 calculators"
                className="flex-shrink-0 flex flex-col items-center justify-center px-4 py-2.5
                  rounded-xl transition-opacity hover:opacity-100 opacity-70 md:hidden"
                style={{
                  minWidth: '80px',
                  border: `1px dashed ${GOLD_RGBA(0.25)}`,
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <span className="text-xl select-none" aria-hidden>🔮</span>
                <p className="text-[10px] font-bold mt-1 text-center" style={{ color: GOLD_RGBA(0.7) }}>
                  +24 more
                </p>
              </Link>
            </div>

            {/* Right-edge fade — mobile only scroll hint */}
            <div
              className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none md:hidden"
              style={{
                background: `linear-gradient(to right, transparent 0%, rgba(2,8,23,0.92) 100%)`,
              }}
              aria-hidden
            />
          </div>

        </div>
      </section>
    </>
  );
}
