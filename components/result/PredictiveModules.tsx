'use client';

import { useState } from 'react';
import { Briefcase, Heart, Coins, Globe, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import type { PredictiveModule } from '@/lib/vedic-astro';
import RemedyChecklist from './RemedyChecklist';

type Props = {
  modules: PredictiveModule[];
  varshphalFocus: string;
  ashtakvargaWealth: number;
  name: string;
};

const MODULE_META = {
  career: {
    icon: Briefcase,
    color: '#60A5FA',
    glow: 'rgba(96,165,250,0.2)',
    bg: 'rgba(96,165,250,0.06)',
    border: 'rgba(96,165,250,0.18)',
  },
  love: {
    icon: Heart,
    color: '#F472B6',
    glow: 'rgba(244,114,182,0.2)',
    bg: 'rgba(244,114,182,0.06)',
    border: 'rgba(244,114,182,0.18)',
  },
  wealth: {
    icon: Coins,
    color: '#FACC15',
    glow: 'rgba(250,204,21,0.2)',
    bg: 'rgba(250,204,21,0.06)',
    border: 'rgba(250,204,21,0.18)',
  },
  foreign: {
    icon: Globe,
    color: '#34D399',
    glow: 'rgba(52,211,153,0.2)',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.18)',
  },
};

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}60, ${color})`,
          }}
        />
      </div>
      <span className="text-xs tabular-nums" style={{ color: `${color}90` }}>
        {value}%
      </span>
    </div>
  );
}

function ModuleCard({ module }: { module: PredictiveModule }) {
  const [expanded, setExpanded] = useState(false);
  const meta = MODULE_META[module.id];
  const Icon = meta.icon;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(10,15,30,0.85)',
        border: `1px solid ${expanded ? meta.color + '30' : meta.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: expanded ? `0 8px 32px ${meta.glow}` : 'none',
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
            >
              <Icon className="w-5 h-5" style={{ color: meta.color }} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{module.title}</h4>
              <p className="text-xs" style={{ color: `${meta.color}70` }}>
                {module.subtitle}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-400">{module.window}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Cosmic Confidence</span>
          </div>
          <ConfidenceBar value={module.confidence} color={meta.color} />
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          {module.prediction}
        </p>
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors duration-200"
        style={{
          borderTop: `1px solid ${meta.border}`,
          color: expanded ? meta.color : `${meta.color}70`,
          background: expanded ? `${meta.color}06` : 'transparent',
        }}
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            Hide Remedy Checklist
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            View Remedy Checklist (Easy · Medium · Deep)
          </>
        )}
      </button>

      {expanded && (
        <div
          className="px-5 pb-5 pt-4"
          style={{ borderTop: `1px solid ${meta.border}` }}
        >
          <RemedyChecklist remedies={module.remedies} moduleTitle={module.title} />
        </div>
      )}
    </div>
  );
}

export default function PredictiveModules({ modules, varshphalFocus, ashtakvargaWealth, name }: Props) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(6,10,24,0.9)',
        border: `1px solid ${GOLD_RGBA(0.1)}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: GOLD }}
          />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: `${GOLD}80` }}
          >
            Predictive Life Modules
          </span>
        </div>
        <h3 className="text-base font-semibold text-white">
          Deep Forecast for <span style={{ color: GOLD }}>{name.split(' ')[0]}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Powered by 10th, 7th, 2nd, 11th, 9th & 12th house analysis · Tap any module for remedies
        </p>
      </div>

      <div
        className="rounded-xl p-4 mb-6"
        style={{
          background: GOLD_RGBA(0.05),
          border: `1px solid ${GOLD_RGBA(0.15)}`,
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: `${GOLD}80` }}
              >
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
            <div className="text-lg font-bold" style={{ color: GOLD }}>
              {ashtakvargaWealth}
            </div>
            <div className="text-xs text-slate-500">Bindus</div>
            <div className="text-xs" style={{ color: `${GOLD}60` }}>Ashtakvarga</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
}
