'use client';

// ============================================================
// FILE: components/layout/CalcStrip.tsx
// PURPOSE: Homepage calculator discovery strip — slot #1.5
// VERSION: v1.1 — Sales-oriented copy + moved above DardEngine
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// DATE: 2026-06-29
// CHANGES v1.0 → v1.1:
//   ✅ Sales-oriented header copy — "Your answer is one click away"
//   ✅ Sub-tagline added for benefit clarity
//   ✅ Paid card badge upgraded: "₹51 · AI Palm Read"
//   ✅ Free card sub-text upgraded to action-oriented copy
//   ✅ "All 30 tools →" upgraded to "See all 30 free tools →"
//   ✅ +24 more ghost card copy sharpened
// USAGE: Add <CalcStrip /> in app/page.tsx after <Hero />,
//        before <HomeClient />.
// ============================================================

import Link from 'next/link';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type CalcItem = {
  emoji: string;
  shortName: string;
  subText: string;    // sales-oriented micro-copy
  fullName: string;
  badge: string;
  paid: boolean;
  href: string;
};

const CALCS: CalcItem[] = [
  {
    emoji: '🖐️',
    shortName: 'AI Hast Rekha',
    subText: 'Palm reveals destiny',
    fullName: 'AI Hast Rekha Calculator — Palm Reading Report',
    badge: '₹51 · AI Report',
    paid: true,
    href: '/hast-rekha-calculator',
  },
  {
    emoji: '💠',
    shortName: 'Gemstone Fit',
    subText: 'Right stone = right energy',
    fullName: 'Free Gemstone Suitability Calculator',
    badge: 'FREE',
    paid: false,
    href: '/calculators/free-gemstone-suitability-calculator',
  },
  {
    emoji: '🐍',
    shortName: 'Kaal Sarp Dosh',
    subText: "Check if it's blocking you",
    fullName: 'Free Kaal Sarp Dosh Calculator',
    badge: 'FREE',
    paid: false,
    href: '/calculators/free-kaal-sarp-dosh-calculator',
  },
  {
    emoji: '🪔',
    shortName: 'Pitra Dosh',
    subText: 'Ancestral karma check',
    fullName: 'Free Pitra Dosh Calculator',
    badge: 'FREE',
    paid: false,
    href: '/calculators/free-pitra-dosh-calculator',
  },
  {
    emoji: '🕉️',
    shortName: 'Sade Sati',
    subText: 'Is Saturn testing you?',
    fullName: 'Free Sade Sati Calculator',
    badge: 'FREE',
    paid: false,
    href: '/calculators/free-sade-sati-calculator',
  },
  {
    emoji: '🔴',
    shortName: 'Manglik Dosh',
    subText: 'Marriage compatibility check',
    fullName: 'Free Manglik Dosh Calculator',
    badge: 'FREE',
    paid: false,
    href: '/calculators/free-manglik-dosh-calculator',
  },
];

export default function CalcStrip() {
  return (
    <>
      <style>{`
        @keyframes tvGoldPulse {
          0%   { box-shadow: 0 0  0px 0px rgba(212,175,55,0.00); }
          50%  { box-shadow: 0 0 20px 4px rgba(212,175,55,0.38); }
          100% { box-shadow: 0 0  0px 0px rgba(212,175,55,0.00); }
        }
        .tv-paid-pulse { animation: tvGoldPulse 3.2s ease-in-out infinite; }
        .tv-calc-scroll::-webkit-scrollbar { display: none; }
        .tv-calc-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <section
        aria-label="Free Vedic Calculators — Quick Answers"
        className="w-full px-4 py-4"
        style={{
          background: `linear-gradient(180deg, rgba(212,175,55,0.06) 0%, rgba(2,8,23,0.01) 100%)`,
          borderTop:    `1px solid ${GOLD_RGBA(0.15)}`,
          borderBottom: `1px solid ${GOLD_RGBA(0.1)}`,
        }}
      >
        <div className="max-w-6xl mx-auto">

          {/* ── Sales Header ── */}
          <div className="flex items-start justify-between mb-1.5">
            <div>
              <span
                className="text-[11px] font-bold tracking-[0.15em] uppercase"
                style={{ color: GOLD_RGBA(0.75) }}
              >
                ✦ Your answer is one click away
              </span>
              <p className="text-[10px] mt-0.5" style={{ color: GOLD_RGBA(0.4) }}>
                No signup · Instant results · Swiss Ephemeris accuracy
              </p>
            </div>
            <Link
              href="/calculators"
              className="text-[10px] font-semibold whitespace-nowrap mt-0.5 transition-opacity hover:opacity-100"
              style={{ color: GOLD_RGBA(0.55) }}
            >
              See all 30 free tools →
            </Link>
          </div>

          {/* ── Scroll wrapper ── */}
          <div className="relative mt-2">
            <div className="tv-calc-scroll flex gap-2 overflow-x-auto">

              {CALCS.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  aria-label={c.fullName}
                  className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                    transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]
                    ${c.paid ? 'tv-paid-pulse' : ''}`}
                  style={{
                    minWidth: '156px',
                    background: c.paid
                      ? `linear-gradient(135deg, ${GOLD_RGBA(0.2)} 0%, rgba(8,11,18,0.75) 100%)`
                      : 'rgba(255,255,255,0.035)',
                    border: c.paid
                      ? `1px solid ${GOLD_RGBA(0.6)}`
                      : `1px solid ${GOLD_RGBA(0.2)}`,
                  }}
                >
                  <span className="text-[22px] leading-none select-none" aria-hidden>
                    {c.emoji}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-[13px] font-semibold leading-tight truncate"
                      style={{ color: c.paid ? GOLD : '#e2e8f0' }}
                    >
                      {c.shortName}
                    </p>
                    <p
                      className="text-[10px] mt-[2px] truncate"
                      style={{ color: c.paid ? GOLD_RGBA(0.7) : '#94a3b8' }}
                    >
                      {c.subText}
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

              {/* Ghost card — mobile end */}
              <Link
                href="/calculators"
                aria-label="See all 30 free calculators"
                className="flex-shrink-0 flex flex-col items-center justify-center px-4 py-2.5
                  rounded-xl transition-opacity hover:opacity-100 opacity-60 md:hidden"
                style={{
                  minWidth: '84px',
                  border: `1px dashed ${GOLD_RGBA(0.28)}`,
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <span className="text-xl select-none" aria-hidden>🔮</span>
                <p className="text-[10px] font-bold mt-1 text-center leading-tight"
                  style={{ color: GOLD_RGBA(0.7) }}>
                  +24<br />more
                </p>
              </Link>
            </div>

            {/* Right-edge fade — mobile scroll hint */}
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
