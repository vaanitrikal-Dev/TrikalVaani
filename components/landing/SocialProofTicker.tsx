/**
 * ============================================================
 * TRIKAL VAANI — Marketing CTA Ticker (Visible-Only)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/SocialProofTicker.tsx
 * VERSION: 2.1 — 256-bit false claim removed (Claude audit June 2026)
 * ============================================================
 * v2.1 changes vs v2.0 (CEO-approved):
 *   ✅ FIX: "256-bit SSL · PCI-DSS compliant checkout" removed — false claim.
 *      Razorpay is PCI-DSS certified; Trikaal Vaani platform itself is not.
 *      Replaced with: "Secured by Razorpay · MSME Registered · One-time payment"
 *      — 100% verifiable, E-E-A-T compliant.
 *   PROTECTED (untouched): all other CTA_LINES, animation logic, gold palette,
 *      dot colours, fade masks, component name/export.
 * ============================================================
 * v2.0 changes (CEO-approved, IR-0 compliant):
 *   ✅ FAKE SOCIAL PROOF REMOVED: all fabricated named-person activities deleted.
 *   ✅ CONVERTED TO MARKETING CTA TICKER: every line is a real, defensible claim.
 * ============================================================
 */

'use client';
import { useEffect, useRef } from 'react';

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
  { text: 'Limited launch pricing — ₹51 won\'t last forever', type: 'offer' },
  { text: 'Daily readings are capped — secure your slot today', type: 'value' },

  // ── GUARANTEE / REASSURANCE CTAs ────────────────────────
  // v2.1 FIX: "256-bit SSL · PCI-DSS compliant checkout" removed — false claim
  // Razorpay is PCI-DSS certified; Trikaal Vaani platform is not independently certified
  { text: 'Secured by Razorpay · MSME Registered · One-time payment', type: 'action' },
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
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #030712 0%, transparent 100%)' }}
      />
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

// ============================================================
// END — components/SocialProofTicker.tsx v2.1
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================
