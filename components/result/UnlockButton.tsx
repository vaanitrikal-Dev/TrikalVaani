'use client';

import { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';

type Props = {
  label: string;
  price: number;
  contentId: string;
  onUnlock: (contentId: string) => void;
  isUnlocked?: boolean;
};

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function UnlockButton({ label, price, contentId, onUnlock, isUnlocked = false }: Props) {
  const [hovered, setHovered] = useState(false);

  if (isUnlocked) {
    return null;
  }

  return (
    <div
      className="relative my-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute inset-0 rounded-xl blur-sm transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${GOLD_RGBA(0.15)} 0%, ${GOLD_RGBA(0.05)} 100%)`,
          opacity: hovered ? 1 : 0.5,
        }}
      />
      <button
        onClick={() => onUnlock(contentId)}
        className="relative w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(6,10,24,0.9)',
          border: `1px solid ${GOLD_RGBA(0.2)}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: GOLD_RGBA(0.1) }}
          >
            <Lock className="w-3.5 h-3.5" style={{ color: GOLD }} />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-white">{label}</p>
            <p className="text-xs text-slate-500">Unlock this section</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} />
          <span
            className="text-sm font-bold px-3 py-1 rounded-lg"
            style={{ background: GOLD_RGBA(0.15), color: GOLD }}
          >
            ₹{price}
          </span>
        </div>
      </button>
    </div>
  );
}
