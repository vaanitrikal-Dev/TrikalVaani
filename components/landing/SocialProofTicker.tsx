/**
 * ============================================================
 * TRIKAL VAANI — Marketing CTA Ticker (Visible-Only)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/SocialProofTicker.tsx
 * VERSION: 2.0 — Fake activity feed REMOVED, converted to
 *                honest marketing CTA ticker (IR-0 compliant)
 * SIGNED: ROHIIT GUPTA, CEO
 * DATE: 2026-06-03
 * ============================================================
 * v2.0 changes vs v1.x (CEO-approved, IR-0 compliant):
 *   ✅ FAKE SOCIAL PROOF REMOVED (IR-0): all 15 fabricated
 *      "Rohit from Delhi / Anjali from Noida..." named-person
 *      activities deleted. With 2–3 real clients/day, a feed
 *      claiming live named activity is fabricated proof and a
 *      brand-credibility risk for a premium positioning.
 *   ✅ CONVERTED TO MARKETING CTA TICKER: every line is now a
 *      real, defensible offer / USP / call-to-action. Covers
 *      all CTA types — offer, scarcity, authority, value-
 *      compare, feature, action, guarantee.
 *   ✅ All claims true: ₹51 pricing, Swiss Ephemeris (self-
 *      hosted), BPHS classical, personalized 5-upay by segment,
 *      Razorpay-secured one-time payment, MSME registered.
 *   ✅ No competitor brand named on-site. Value framing only.
 *   ✅ Component name kept (SocialProofTicker) so existing
 *      imports in parent layout/page do NOT break. Display
 *      label / intent is now marketing.
 *   ✅ Animation, edge gradient masks, GOLD palette, dot
 *      colours — all preserved 1:1 from prior file.
 *
 * NOTE: filename + export unchanged on purpose (no parent edit
 *       needed). If you want a cleaner name later, rename the
 *       file + its single import together in one commit.
 * ============================================================
 */

'use client';
import { useEffect, useRef } from 'react';

/**
 * Marketing CTA lines.
 * Each entry: { text, cta } — cta drives the dot colour accent:
 *   'offer'   -> gold
 *   'action'  -> green (go / book)
 *   'value'   -> pink (highlight / hook)
 * Mix is intentional for visual rhythm.
 */
const CTA_LINES: { text: string; type: 'offer' | 'action' | 'value' }[] = [
  // ── OFFER CTAs ──────────────────────────────────────────
  { text: 'Your full Vedic life-reading — launch price just ₹51', type: 'offer' },
  { text: '900-word deep analysis on Swiss Ephemeris precision — ₹51 only', type: 'offer' },
  { text: 'One-time payment · No subscription · No hidden charges', type: 'offer' },

  // ── VALUE / HOOK CTAs ───────────────────────────────────
  { text: 'Deep readings others charge ₹500+ for — yours at ₹51', type: 'value' },
  { text: 'Not an auto-report — human-led Jyotish, personalized to your chart', type: 'value' },
  { text: 'Get 5 personalized upay (remedies) mapped to your segment', type: 'value' },
  { text: 'Built on BPHS classical method + Shadbala strength analysis', type: 'value' },

  // ── AUTHORITY / TRUST CTAs ──────────────────────────────
  { text: 'Swiss Ephemeris (self-hosted) · Lahiri Ayanamsha · NASA-grade math', type: 'value' },
  { text: 'MSME Registered Enterprise · Govt of India · Razorpay-secured', type: 'offer' },

  // ── ACTION CTAs ─────────────────────────────────────────
  { text: 'Enter your birth details → get your reading in minutes', type: 'action' },
  { text: 'Ask your real question — Career, Marriage, Wealth, Legal, Health', type: 'action' },
  { text: 'Talk to us on WhatsApp +91 92118 04111 — anytime', type: 'action' },

  // ── SCARCITY / URGENCY CTAs ─────────────────────────────
  { text: 'Limited launch pricing — ₹51 won’t last forever', type: 'offer' },
  { text: 'Daily readings are capped — secure your slot today', type: 'value' },

  // ── GUARANTEE / REASSURANCE CTAs ────────────────────────
  { text: '256-bit SSL · PCI-DSS compliant checkout · your data stays private', type: 'action' },
];

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function SocialProofTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    let raf: number;
    const speed = 0.45;
    function animate() {
      pos -= speed;
      const half = track!.scrollWidth / 2;
      if (Math.abs(pos) >= half) pos = 0;
      track!.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Duplicate for seamless infinite loop
  const items = [...CTA_LINES, ...CTA_LINES];

  const dotColor = (type: 'offer' | 'action' | 'value') =>
    type === 'action' ? '#22C55E' : type === 'value' ? '#F472B6' : GOLD;

  return (
    <div
      className="relative overflow-hidden py-3"
      style={{
        background: 'rgba(6,10,24,0.85)',
        borderTop: `1px solid ${GOLD_RGBA(0.1)}`,
        borderBottom: `1px solid ${GOLD_RGBA(0.1)}`,
      }}
      aria-label="Trikaal Vaani offers and highlights"
    >
      {/* Left fade mask */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #030712 0%, transparent 100%)' }}
      />
      {/* Right fade mask */}
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #030712 0%, transparent 100%)' }}
      />

      <div ref={trackRef} className="flex items-center gap-0 whitespace-nowrap will-change-transform">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-5 flex-shrink-0">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
              style={{ background: dotColor(item.type) }}
            />
            <span className="text-xs" style={{ color: 'rgba(148,163,184,0.85)' }}>
              {item.text}
            </span>
            <span className="text-slate-700 mx-2">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
