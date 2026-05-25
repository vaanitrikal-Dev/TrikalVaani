'use client';

import { Sparkles, ShieldCheck, BookOpenText } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function LiveTrustBar() {
  return (
    <div
      className="py-3 px-4"
      style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}`, background: 'rgba(8,11,18,0.6)' }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
          <span className="text-xs text-slate-400">Swiss Ephemeris precision</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpenText className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
          <span className="text-xs text-slate-400">BPHS classical rules</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
          <span className="text-xs text-slate-400">Razorpay secured payments</span>
        </div>
      </div>
    </div>
  );
}
