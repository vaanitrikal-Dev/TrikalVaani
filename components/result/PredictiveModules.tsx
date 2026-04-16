'use client';

import { useState } from 'react';
import { Briefcase, Heart, Coins, Clock, Loader as Loader2, Sparkles } from 'lucide-react';
import RemedyChecklist from './RemedyChecklist';
import type { RemedyItem } from '@/lib/vedic-astro';

export type TabPrediction = {
  headline: string;
  window: string;
  depth: string;
  remedies: RemedyItem[];
};

export type PredictiveTabsData = {
  career: TabPrediction;
  love: TabPrediction;
  wealth: TabPrediction;
  guruMessage: string;
};

type Props = {
  data: PredictiveTabsData | null;
  loading: boolean;
  varshphalFocus: string;
  ashtakvargaWealth: number;
  name: string;
};

const TABS = [
  {
    id: 'career' as const,
    label: 'Career & Power',
    icon: Briefcase,
    color: '#60A5FA',
    glow: 'rgba(96,165,250,0.15)',
    bg: 'rgba(96,165,250,0.06)',
    border: 'rgba(96,165,250,0.18)',
    activeBorder: 'rgba(96,165,250,0.5)',
  },
  {
    id: 'love' as const,
    label: 'Love & Karma',
    icon: Heart,
    color: '#F472B6',
    glow: 'rgba(244,114,182,0.15)',
    bg: 'rgba(244,114,182,0.06)',
    border: 'rgba(244,114,182,0.18)',
    activeBorder: 'rgba(244,114,182,0.5)',
  },
  {
    id: 'wealth' as const,
    label: 'Wealth & Gains',
    icon: Coins,
    color: '#FACC15',
    glow: 'rgba(250,204,21,0.15)',
    bg: 'rgba(250,204,21,0.06)',
    border: 'rgba(250,204,21,0.18)',
    activeBorder: 'rgba(250,204,21,0.5)',
  },
];

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

function TabContent({ tab, prediction }: { tab: typeof TABS[number]; prediction: TabPrediction }) {
  return (
    <div className="space-y-5">
      <div
        className="rounded-xl p-4"
        style={{ background: tab.bg, border: `1px solid ${tab.activeBorder}`, boxShadow: `0 4px 24px ${tab.glow}` }}
      >
        <p className="text-base font-semibold leading-snug" style={{ color: tab.color }}>
          {prediction.headline}
        </p>
        <div
          className="flex items-center gap-1.5 mt-2"
          style={{ borderTop: `1px solid ${tab.color}20`, paddingTop: '8px' }}
        >
          <Clock className="w-3 h-3" style={{ color: `${tab.color}70` }} />
          <span className="text-xs font-medium" style={{ color: `${tab.color}90` }}>
            {prediction.window}
          </span>
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-3">
          Trikal Guru Analysis
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">{prediction.depth}</p>
      </div>

      {prediction.remedies?.length > 0 && (
        <RemedyChecklist
          remedies={prediction.remedies}
          moduleTitle={tab.label}
        />
      )}
    </div>
  );
}

function SkeletonLoader({ color }: { color: string }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-xl p-4" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
        <div className="h-4 rounded-full mb-2" style={{ background: `${color}20`, width: '80%' }} />
        <div className="h-4 rounded-full mb-2" style={{ background: `${color}15`, width: '60%' }} />
        <div className="h-3 rounded-full mt-3" style={{ background: `${color}10`, width: '30%' }} />
      </div>
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="h-3 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.05)', width: '40%' }} />
        <div className="space-y-2">
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '100%' }} />
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '92%' }} />
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '85%' }} />
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', width: '78%' }} />
        </div>
      </div>
    </div>
  );
}

export default function PredictiveModules({ data, loading, varshphalFocus, ashtakvargaWealth, name }: Props) {
  const [activeTab, setActiveTab] = useState<'career' | 'love' | 'wealth'>('career');
  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(6,10,24,0.92)',
        border: `1px solid ${GOLD_RGBA(0.1)}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: `${GOLD}80` }}
          >
            {loading ? 'Consulting the stars...' : 'Predictive Life Modules'}
          </span>
          {loading && <Loader2 className="w-3 h-3 animate-spin" style={{ color: `${GOLD}80` }} />}
        </div>
        <h3 className="text-base font-semibold text-white mb-1">
          Deep Forecast for <span style={{ color: GOLD }}>{name.split(' ')[0]}</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Powered by Gemini AI · Dasha + Gochar + Ashtakvarga analysis
        </p>

        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.15)}` }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: `${GOLD}80` }}>
                  Varshphal · Solar Year Focus
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: GOLD_RGBA(0.1), color: GOLD, border: `1px solid ${GOLD_RGBA(0.2)}` }}
                >
                  This Year
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{varshphalFocus}</p>
            </div>
            <div
              className="flex-shrink-0 rounded-xl px-3 py-2 text-center"
              style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}
            >
              <div className="text-lg font-bold" style={{ color: GOLD }}>{ashtakvargaWealth}</div>
              <div className="text-xs text-slate-500">Bindus</div>
              <div className="text-xs" style={{ color: `${GOLD}60` }}>Ashtakvarga</div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-0" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                  background: isActive ? `${tab.color}12` : 'transparent',
                  color: isActive ? tab.color : 'rgba(148,163,184,0.6)',
                  border: isActive ? `1px solid ${tab.color}30` : '1px solid transparent',
                  boxShadow: isActive ? `0 2px 12px ${tab.glow}` : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 pt-4">
        {loading ? (
          <SkeletonLoader color={activeTabMeta.color} />
        ) : data ? (
          <TabContent tab={activeTabMeta} prediction={data[activeTab]} />
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500">Analysis unavailable. Please try again.</p>
          </div>
        )}
      </div>

      {data?.guruMessage && !loading && (
        <div
          className="mx-5 mb-5 rounded-xl p-4"
          style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.18)}` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: `${GOLD}80` }}>
              Trikal Guru Blessing
            </span>
          </div>
          <p className="text-sm italic leading-relaxed" style={{ color: `${GOLD}cc` }}>
            &ldquo;{data.guruMessage}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
