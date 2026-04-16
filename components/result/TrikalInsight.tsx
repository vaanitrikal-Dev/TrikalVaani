'use client';

import { Sparkles, Flame, Zap } from 'lucide-react';

type Props = {
  insight: string;
  remedy: string;
  practicalTip: string;
  rashi: string;
  luckyColor: string;
  luckyNumber: number;
  name: string;
};

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function TrikalInsight({
  insight,
  remedy,
  practicalTip,
  rashi,
  luckyColor,
  luckyNumber,
  name,
}: Props) {
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'rgba(10,15,30,0.85)',
          border: `1px solid ${GOLD_RGBA(0.18)}`,
          backdropFilter: 'blur(16px)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 0% 0%, ${GOLD_RGBA(0.06)} 0%, transparent 65%)`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: `${GOLD}99` }}
            >
              Trikal Guru Speaks
            </span>
          </div>

          <div
            className="text-xs mb-4"
            style={{ color: `${GOLD}55` }}
          >
            Personalized for{' '}
            <span style={{ color: `${GOLD}99` }}>{name.split(' ')[0]}</span>
            {' '}·{' '}
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>

          <blockquote
            className="font-serif text-base sm:text-[17px] leading-relaxed italic"
            style={{ color: 'rgba(226,232,240,0.92)' }}
          >
            &ldquo;{insight}&rdquo;
          </blockquote>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div
          className="rounded-xl p-5 relative overflow-hidden"
          style={{
            background: 'rgba(8,20,10,0.85)',
            border: '1px solid rgba(34,197,94,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 100% 0%, rgba(34,197,94,0.05) 0%, transparent 65%)',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400/70">
                Vedic Remedy (Upay)
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{remedy}</p>
          </div>
        </div>

        <div
          className="rounded-xl p-5 relative overflow-hidden"
          style={{
            background: 'rgba(10,15,30,0.85)',
            border: `1px solid ${GOLD_RGBA(0.16)}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 100% 0%, ${GOLD_RGBA(0.04)} 0%, transparent 65%)`,
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: GOLD_RGBA(0.1), border: `1px solid ${GOLD_RGBA(0.22)}` }}
              >
                <Zap className="w-3.5 h-3.5" style={{ color: GOLD }} />
              </div>
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: `${GOLD}70` }}
              >
                Practical Wisdom (Vyavahar)
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{practicalTip}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Rashi',
            value: rashi,
            sub: 'Moon Sign',
            bg: GOLD_RGBA(0.08),
            border: GOLD_RGBA(0.18),
            textColor: GOLD,
          },
          {
            label: 'Shubh Rang',
            value: luckyColor,
            sub: 'Wear today',
            bg: 'rgba(15,23,42,0.9)',
            border: 'rgba(148,163,184,0.15)',
            textColor: '#94a3b8',
          },
          {
            label: 'Shubh Ank',
            value: String(luckyNumber),
            sub: "Today's vibration",
            bg: 'rgba(34,197,94,0.07)',
            border: 'rgba(34,197,94,0.18)',
            textColor: '#4ADE80',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-3.5 text-center"
            style={{ background: item.bg, border: `1px solid ${item.border}` }}
          >
            <div className="text-xs text-slate-500 mb-1">{item.label}</div>
            <div
              className="text-sm font-semibold leading-tight"
              style={{ color: item.textColor }}
            >
              {item.value}
            </div>
            <div className="text-xs text-slate-600 mt-1">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
