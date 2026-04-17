'use client';

import { useState } from 'react';
import { Sparkles, Lock, Zap, Calendar, Flag, Crown, Check } from 'lucide-react';

export type PricingTier = 'base' | 'addon_redflag' | 'addon_timeline' | 'bundle';

export type PricingSelection = {
  tier: PricingTier;
  amount: number;
  label: string;
};

type Props = {
  name: string;
  onSelect: (selection: PricingSelection) => void;
  unlockedTiers?: PricingTier[];
};

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const TIERS = [
  {
    id: 'base' as PricingTier,
    price: 21,
    label: 'Vibe Score + Compatibility Heatmap',
    description: 'Quick cosmic compatibility snapshot',
    features: ['Overall compatibility score', 'Energy/Loyalty/Passion meters', 'Green & Red flag summary'],
    icon: Zap,
    popular: false,
  },
  {
    id: 'addon_redflag' as PricingTier,
    price: 11,
    label: 'Red Flag Alert',
    description: 'Deep dive into planetary clashes',
    features: ['Hidden Mars-Saturn triggers', 'Argument timing predictions', 'Specific remedy for each clash'],
    icon: Flag,
    popular: false,
    isAddon: true,
  },
  {
    id: 'addon_timeline' as PricingTier,
    price: 11,
    label: 'Secret Timeline',
    description: 'Exact dates for major life events',
    features: ['Marriage/career pivot dates', 'Planetary transit windows', 'Month-by-month predictions'],
    icon: Calendar,
    popular: false,
    isAddon: true,
  },
  {
    id: 'bundle' as PricingTier,
    price: 51,
    label: 'Full 20-Page Deep Report',
    description: 'Everything unlocked at 35% off',
    features: ['All tiers included', 'Personalized PDF report', 'Priority Guru access', 'Lifetime updates'],
    icon: Crown,
    popular: true,
  },
];

export default function PricingLadder({ name, onSelect, unlockedTiers = [] }: Props) {
  const [selectedAddons, setSelectedAddons] = useState<Set<PricingTier>>(new Set());

  function toggleAddon(tierId: PricingTier) {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(tierId)) {
        next.delete(tierId);
      } else {
        next.add(tierId);
      }
      return next;
    });
  }

  function calculateTotal(): { amount: number; tiers: PricingTier[] } {
    if (selectedAddons.has('bundle')) {
      return { amount: 51, tiers: ['bundle'] };
    }
    let total = 21;
    const tiers: PricingTier[] = ['base'];
    if (selectedAddons.has('addon_redflag')) {
      total += 11;
      tiers.push('addon_redflag');
    }
    if (selectedAddons.has('addon_timeline')) {
      total += 11;
      tiers.push('addon_timeline');
    }
    return { amount: total, tiers };
  }

  const { amount, tiers } = calculateTotal();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(6,10,24,0.95)',
        border: `1px solid ${GOLD_RGBA(0.18)}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="p-5 border-b" style={{ borderColor: GOLD_RGBA(0.1) }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: GOLD_RGBA(0.7) }}>
            Unlock Your Full Reading
          </span>
        </div>
        <h3 className="text-base font-semibold text-white">
          {name.split(' ')[0]}, go deeper with premium insights
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Choose what you want to unlock — pay only for what you need
        </p>
      </div>

      <div className="p-4 space-y-3">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const isUnlocked = unlockedTiers.includes(tier.id);
          const isSelected = tier.id === 'bundle'
            ? selectedAddons.has('bundle')
            : tier.id === 'base' || selectedAddons.has(tier.id);

          if (tier.isAddon && selectedAddons.has('bundle')) return null;

          return (
            <button
              key={tier.id}
              onClick={() => {
                if (isUnlocked) return;
                if (tier.id === 'bundle') {
                  setSelectedAddons(new Set(['bundle']));
                } else if (tier.isAddon) {
                  toggleAddon(tier.id);
                }
              }}
              disabled={isUnlocked}
              className={`w-full text-left rounded-xl p-4 transition-all duration-200 ${
                isUnlocked ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              style={{
                background: tier.popular
                  ? 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)'
                  : isSelected && !tier.isAddon
                  ? GOLD_RGBA(0.08)
                  : 'rgba(255,255,255,0.02)',
                border: tier.popular
                  ? `1px solid ${GOLD_RGBA(0.35)}`
                  : isSelected && !tier.isAddon
                  ? `1px solid ${GOLD_RGBA(0.25)}`
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: tier.popular ? `0 4px 20px ${GOLD_RGBA(0.15)}` : 'none',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: tier.popular ? GOLD_RGBA(0.15) : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${tier.popular ? GOLD_RGBA(0.3) : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: tier.popular ? GOLD : 'rgba(255,255,255,0.6)' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{tier.label}</p>
                      {tier.popular && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: GOLD_RGBA(0.2), color: GOLD }}
                        >
                          BEST VALUE
                        </span>
                      )}
                      {isUnlocked && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-400">
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{tier.description}</p>
                    <ul className="mt-2 space-y-1">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Check className="w-3 h-3" style={{ color: tier.popular ? GOLD : '#22C55E' }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {tier.isAddon ? (
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: GOLD_RGBA(0.2) }}
                        >
                          <Check className="w-3 h-3" style={{ color: GOLD }} />
                        </div>
                      )}
                      <span className="text-sm font-bold" style={{ color: GOLD }}>
                        +₹{tier.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold" style={{ color: tier.popular ? GOLD : 'white' }}>
                      ₹{tier.price}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="p-4 border-t"
        style={{ borderColor: GOLD_RGBA(0.1), background: GOLD_RGBA(0.03) }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-xl font-bold text-white">₹{amount}</p>
          </div>
          {amount < 51 && amount > 21 && (
            <p className="text-xs text-slate-500">
              Or get everything for <span style={{ color: GOLD }}>₹51</span> (save ₹{32 + 11 - amount})
            </p>
          )}
        </div>
        <button
          onClick={() => onSelect({ tier: tiers.length > 1 ? 'bundle' : tiers[0], amount, label: TIERS.find(t => t.id === (tiers.length > 1 ? 'bundle' : tiers[0]))?.label || '' })}
          className="w-full h-12 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${GOLD} 0%, #B8860B 100%)`,
            color: '#030712',
            boxShadow: `0 4px 20px ${GOLD_RGBA(0.3)}`,
          }}
        >
          <Lock className="w-4 h-4" />
          Unlock Now — ₹{amount}
        </button>
        <p className="text-xs text-slate-600 text-center mt-2">
          Secure payment via Razorpay. Instant unlock.
        </p>
      </div>
    </div>
  );
}
