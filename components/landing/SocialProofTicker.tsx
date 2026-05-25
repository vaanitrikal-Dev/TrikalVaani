'use client';

import { useEffect, useRef } from 'react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ── Honest scrolling signpost: TRUST + CTA-direction + OFFER ────────────────
// Non-clickable by design (no moving tap targets). Each CTA line tells the user
// WHAT they want and WHERE to go for it — a wayfinding nudge, not fake activity.
// Layout: 4 trust signals + ALL engine CTAs + 4 offers.
// NOTE: position is NORMAL FLOW (relative). It does NOT use fixed/sticky and
//   does NOT touch TrikalVoice (the fixed floating mic lives independently).
type Item = { kind: 'trust' | 'cta' | 'offer'; text: string };

const ITEMS: Item[] = [
  // ── 4 TRUST ──
  { kind: 'trust', text: 'Swiss Ephemeris precision' },
  { kind: 'trust', text: 'BPHS classical rules' },
  { kind: 'trust', text: 'Razorpay secured payments' },
  { kind: 'trust', text: 'MSME registered — UDYAM-DL-10-0119070' },

  // ── ALL CTAs (every engine — where to go) ──
  { kind: 'cta', text: 'Free Kundli? Open the Calculators section' },
  { kind: 'cta', text: 'Shaadi compatibility? Go to Kundali Milan — 36 Guna' },
  { kind: 'cta', text: 'Best wedding/event time? Open the Muhurat Finder' },
  { kind: 'cta', text: 'Dasha & Nakshatra? Use the free Calculators' },
  { kind: 'cta', text: 'Rashi & Lagna? Check the free Calculators' },
  { kind: 'cta', text: 'Sade Sati or Manglik Dosh? Open the Calculators' },
  { kind: 'cta', text: 'Deep karmic patterns? Try the Karmic Background Reading' },
  { kind: 'cta', text: 'Full 900-word reading? Fill the birth form below' },
  { kind: 'cta', text: 'Want it in voice? Tap the mic for Trikaal ki Awaaz' },
  { kind: 'cta', text: 'Daily Panchang & Rashifal? Scroll down the homepage' },

  // ── 4 OFFERS ──
  { kind: 'offer', text: 'New: Karmic Background Reading is now live' },
  { kind: 'offer', text: '8 free calculators — Kundali, Dasha, Nakshatra & more' },
  { kind: 'offer', text: 'Voice Reading from just ₹11' },
  { kind: 'offer', text: 'Daily Panchang & Rashifal updated every morning' },
];

const DOT: Record<Item['kind'], string> = {
  trust: '#22C55E',  // green — credibility
  cta:   GOLD,       // gold — direction
  offer: '#F472B6',  // pink — what's new
};

export default function SocialProofTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    let raf: number;
    const speed = 0.4;
    function animate() {
      pos -= speed;
      const half = track!.scrollWidth / 2;
      if (Math.abs(pos) >= half) pos = 0;
      track!.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(animate);
    }
    // Start after layout so scrollWidth is measured correctly
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...ITEMS, ...ITEMS];

  return (
    <div
      className="relative flex items-stretch overflow-hidden"
      style={{
        // Distinct gold-tinted band so it stands out between dark sections
        background: `linear-gradient(90deg, ${GOLD_RGBA(0.10)} 0%, rgba(6,10,24,0.92) 18%, rgba(6,10,24,0.92) 82%, ${GOLD_RGBA(0.10)} 100%)`,
        borderTop: `1px solid ${GOLD_RGBA(0.22)}`,
        borderBottom: `1px solid ${GOLD_RGBA(0.22)}`,
        zIndex: 1,
      }}
    >
      {/* ── Pinned static label (left) — anchors the eye, always visible ── */}
      <div
        className="flex items-center gap-1.5 px-3 sm:px-4 flex-shrink-0 z-20"
        style={{
          background: `linear-gradient(135deg, ${GOLD} 0%, #A8862A 100%)`,
          color: '#080B12',
        }}
      >
        <span className="text-xs sm:text-sm" aria-hidden>🔱</span>
        <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap">
          Trikaal
        </span>
      </div>

      {/* ── Scrolling track ── */}
      <div className="relative flex-1 overflow-hidden py-2.5">
        {/* left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 sm:w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(6,10,24,0.92) 0%, transparent 100%)' }}
        />
        {/* right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-10 sm:w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(6,10,24,0.92) 0%, transparent 100%)' }}
        />
        <div ref={trackRef} className="flex items-center gap-0 whitespace-nowrap will-change-transform">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-4 sm:px-5 flex-shrink-0">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ background: DOT[item.kind] }}
              />
              <span className="text-xs" style={{ color: 'rgba(203,213,225,0.82)' }}>
                {item.text}
              </span>
              <span className="text-slate-700 mx-2">·</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
