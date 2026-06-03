/**
 * ============================================================
 * TRIKAAL VAANI — LiveTrustBar
 * VERSION: 2.0 — IR-0 cleanup: ALL fake stats removed
 *
 * v2.0 CHANGES vs v1.x:
 *   ❌ REMOVED "4.9 ★ average rating" (no real review system — fake)
 *   ❌ REMOVED auto-incrementing "10,666+ seekers analysed" (fabricated counter)
 *   ❌ REMOVED fake live activity toasts ("Seeker from X just unlocked...")
 *   ✅ Replaced with TRUE, verifiable methodology trust signals
 *   ✅ Same export name + visual style — no import changes needed anywhere
 * ============================================================
 */

'use client';

import { Sparkles } from 'lucide-react';

const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// Real, verifiable methodology — no numbers claimed, no fabricated stats
const TRUST_SIGNALS = [
  'Swiss Ephemeris precision',
  'BPHS Classical',
  'Bhrigu Nandi Nadi',
  'Shadbala scoring',
];

export default function LiveTrustBar() {
  return (
    <div
      className="py-3 px-4"
      style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}`, background: 'rgba(8,11,18,0.6)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {TRUST_SIGNALS.map((signal) => (
          <div key={signal} className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
            <span className="text-xs text-slate-400">{signal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
