'use client';

import { useRef, useEffect } from 'react';
import { Briefcase, Heart, Coins, Sparkles } from 'lucide-react';

export type MonthForecast = {
  month: string;
  year: number;
  vibe: string;
  category: 'career' | 'love' | 'wealth' | 'general';
  intensity: 'peak' | 'high' | 'moderate';
};

type Props = {
  forecasts: MonthForecast[];
  name: string;
};

const CATEGORY_META = {
  career: { icon: Briefcase, color: '#60A5FA', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', label: 'Career' },
  love: { icon: Heart, color: '#F472B6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.2)', label: 'Love' },
  wealth: { icon: Coins, color: '#FACC15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)', label: 'Wealth' },
  general: { icon: Sparkles, color: '#D4AF37', bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.2)', label: 'Cosmic' },
};

const INTENSITY_LABELS = {
  peak: { label: 'Peak', dot: '#FACC15' },
  high: { label: 'High', dot: '#60A5FA' },
  moderate: { label: 'Moderate', dot: '#94A3B8' },
};

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

function ForecastCard({ forecast, index }: { forecast: MonthForecast; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const meta = CATEGORY_META[forecast.category];
  const Icon = meta.icon;
  const intensityMeta = INTENSITY_LABELS[forecast.intensity];

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="flex gap-3 items-start"
      style={{
        opacity: 0,
        transform: 'translateY(12px)',
        transition: `opacity 0.4s ease ${Math.min(index * 0.06, 0.5)}s, transform 0.4s ease ${Math.min(index * 0.06, 0.5)}s`,
      }}
    >
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: meta.bg,
            border: `1.5px solid ${meta.border}`,
            boxShadow: forecast.intensity === 'peak' ? `0 0 12px ${meta.color}25` : 'none',
          }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
        </div>
        <div className="w-px flex-1 mt-1 min-h-[20px]" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>

      <div
        className="flex-1 rounded-xl p-3 mb-3"
        style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
      >
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-xs font-bold tabular-nums" style={{ color: meta.color }}>
            {forecast.month} {forecast.year}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: `${intensityMeta.dot}15`,
                color: intensityMeta.dot,
                border: `1px solid ${intensityMeta.dot}30`,
              }}
            >
              {intensityMeta.label}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: `${meta.color}10`,
                color: `${meta.color}90`,
                border: `1px solid ${meta.color}20`,
              }}
            >
              {meta.label}
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-snug">{forecast.vibe}</p>
      </div>
    </div>
  );
}

export default function FutureTimeline({ forecasts, name }: Props) {
  const now = new Date();
  const currentMonthKey = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(10,15,30,0.85)',
        border: `1px solid ${GOLD_RGBA(0.12)}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: `${GOLD}80` }}
          >
            Future Timeline
          </span>
        </div>
        <h3 className="text-base font-semibold text-white">
          Month-by-Month Forecast for{' '}
          <span style={{ color: GOLD }}>{name.split(' ')[0]}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Planetary vibes for each upcoming month based on Gochar transits and Dasha cycles
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(['career', 'love', 'wealth', 'general'] as const).map((cat) => {
          const m = CATEGORY_META[cat];
          const Icon = m.icon;
          return (
            <div
              key={cat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: m.bg, border: `1px solid ${m.border}` }}
            >
              <Icon className="w-3 h-3" style={{ color: m.color }} />
              <span className="text-xs" style={{ color: m.color }}>{m.label}</span>
            </div>
          );
        })}
      </div>

      <div>
        {forecasts.map((f, i) => {
          const isNow = `${f.month} ${f.year}` === currentMonthKey;
          return (
            <div key={`${f.month}-${f.year}`} className="relative">
              {isNow && (
                <div
                  className="absolute -left-2 top-2 text-xs px-1.5 py-0.5 rounded-r-full z-10 font-semibold"
                  style={{ background: GOLD, color: '#030712', fontSize: '10px' }}
                >
                  NOW
                </div>
              )}
              <ForecastCard forecast={f} index={i} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
