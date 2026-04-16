'use client';

import { useState } from 'react';
import { Check, Leaf, Flame, Star } from 'lucide-react';
import type { RemedyItem } from '@/lib/vedic-astro';

type Props = {
  remedies: RemedyItem[];
  moduleTitle: string;
};

const LEVEL_META = {
  easy: {
    label: 'Easy',
    icon: Leaf,
    color: '#4ADE80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.2)',
    description: '5 min daily',
  },
  medium: {
    label: 'Medium',
    icon: Flame,
    color: '#FACC15',
    bg: 'rgba(250,204,21,0.08)',
    border: 'rgba(250,204,21,0.2)',
    description: '15–30 min',
  },
  deep: {
    label: 'Deep Sadhana',
    icon: Star,
    color: '#D4AF37',
    bg: 'rgba(212,175,55,0.08)',
    border: 'rgba(212,175,55,0.22)',
    description: 'Committed practice',
  },
};

function RemedyCard({ item }: { item: RemedyItem }) {
  const [checked, setChecked] = useState(false);
  const meta = LEVEL_META[item.level];
  const Icon = meta.icon;

  return (
    <div
      className="rounded-xl p-4 transition-all duration-200"
      style={{
        background: checked ? `${meta.color}08` : meta.bg,
        border: `1px solid ${checked ? meta.color + '40' : meta.border}`,
        opacity: checked ? 0.7 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => setChecked((c) => !c)}
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
          style={{
            background: checked ? meta.color : 'transparent',
            border: `1.5px solid ${checked ? meta.color : meta.color + '50'}`,
          }}
          aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
        >
          {checked && <Check className="w-3 h-3 text-black" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}
            >
              <Icon className="w-2.5 h-2.5" style={{ color: meta.color }} />
              <span className="text-xs font-semibold" style={{ color: meta.color }}>
                {meta.label}
              </span>
            </div>
            <span className="text-xs text-slate-600">{meta.description}</span>
          </div>

          <p
            className="text-sm text-slate-300 leading-relaxed"
            style={{ textDecoration: checked ? 'line-through' : 'none', color: checked ? '#475569' : undefined }}
          >
            {item.action}
          </p>

          <div
            className="mt-2 pt-2 flex items-start gap-1.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="text-xs text-slate-600 leading-relaxed">
              <span style={{ color: `${meta.color}80` }}>Benefit: </span>
              {item.benefit}
            </span>
          </div>

          <div className="mt-1">
            <span className="text-xs" style={{ color: `${meta.color}60` }}>
              {item.frequency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RemedyChecklist({ remedies, moduleTitle }: Props) {
  const completed = remedies.filter((_, i) => i < 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-widest">
          Remedy Checklist · {moduleTitle}
        </p>
        <span className="text-xs text-slate-600">
          {completed}/{remedies.length} done
        </span>
      </div>
      <div className="space-y-3">
        {remedies.map((item) => (
          <RemedyCard key={item.level} item={item} />
        ))}
      </div>
    </div>
  );
}
