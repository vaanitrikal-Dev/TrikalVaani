'use client';

import { useEffect, useRef } from 'react';
import { Briefcase, Heart, Coins, Globe, Activity, Star } from 'lucide-react';
import type { LifeTimelineEvent, DashaPeriod } from '@/lib/vedic-astro';

type Props = {
  events: LifeTimelineEvent[];
  dashaPeriods: DashaPeriod[];
  name: string;
};

const CATEGORY_META = {
  career: { icon: Briefcase, color: '#60A5FA', label: 'Career' },
  love: { icon: Heart, color: '#F472B6', label: 'Love' },
  wealth: { icon: Coins, color: '#FACC15', label: 'Wealth' },
  foreign: { icon: Globe, color: '#34D399', label: 'Foreign' },
  health: { icon: Activity, color: '#FB923C', label: 'Health' },
  spiritual: { icon: Star, color: '#D4AF37', label: 'Spiritual' },
};

const INTENSITY_META = {
  peak: { label: 'Peak Energy', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)', dot: '#FACC15' },
  high: { label: 'High Energy', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)', dot: '#60A5FA' },
  moderate: { label: 'Moderate', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)', dot: '#94A3B8' },
};

const DASHA_QUALITY_META = {
  excellent: { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', label: 'Excellent' },
  good: { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', label: 'Good' },
  moderate: { color: '#FACC15', bg: 'rgba(250,204,21,0.1)', label: 'Moderate' },
  testing: { color: '#FB923C', bg: 'rgba(251,146,60,0.1)', label: 'Testing Phase' },
};

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

function TimelineNode({ event, index }: { event: LifeTimelineEvent; index: number }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const meta = CATEGORY_META[event.category];
  const intensityMeta = INTENSITY_META[event.intensity];
  const Icon = meta.icon;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && nodeRef.current) {
          nodeRef.current.style.opacity = '1';
          nodeRef.current.style.transform = 'translateX(0)';
        }
      },
      { threshold: 0.1 }
    );
    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={nodeRef}
      className="flex gap-4 relative"
      style={{
        opacity: 0,
        transform: 'translateX(-16px)',
        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
      }}
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0"
          style={{
            background: `${meta.color}18`,
            border: `2px solid ${meta.color}40`,
            boxShadow: event.intensity === 'peak' ? `0 0 16px ${meta.color}30` : 'none',
          }}
        >
          <Icon className="w-4 h-4" style={{ color: meta.color }} />
        </div>
        <div
          className="w-px flex-1 mt-1"
          style={{ background: 'rgba(255,255,255,0.06)', minHeight: '24px' }}
        />
      </div>

      <div
        className="flex-1 rounded-xl p-4 mb-4"
        style={{ background: intensityMeta.bg, border: `1px solid ${intensityMeta.border}` }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: meta.color }}
            >
              {event.year}
            </span>
            <h4 className="text-sm font-semibold text-white mt-0.5">{event.title}</h4>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: `${intensityMeta.dot}18`,
              color: intensityMeta.dot,
              border: `1px solid ${intensityMeta.dot}30`,
            }}
          >
            {intensityMeta.label}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
}

export default function LifeTimeline({ events, dashaPeriods, name }: Props) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(10,15,30,0.85)',
        border: `1px solid ${GOLD_RGBA(0.12)}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-4 h-4" style={{ color: GOLD }} />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: `${GOLD}99` }}
          >
            Life Timeline — Next 5 Years
          </span>
        </div>
        <h3 className="text-base font-semibold text-white">
          Planetary Roadmap for{' '}
          <span style={{ color: GOLD }}>{name.split(' ')[0]}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Major cosmic windows calculated from Gochar transits and Vimshottari Dasha
        </p>
      </div>

      {dashaPeriods.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
            Vimshottari Dasha Sequence
          </p>
          <div className="flex flex-wrap gap-2">
            {dashaPeriods.map((d) => {
              const qMeta = DASHA_QUALITY_META[d.quality];
              return (
                <div
                  key={`${d.planet}-${d.startYear}`}
                  className="rounded-lg px-3 py-2"
                  style={{ background: qMeta.bg, border: `1px solid ${qMeta.color}30` }}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: qMeta.color }}
                    />
                    <span className="text-xs font-semibold" style={{ color: qMeta.color }}>
                      {d.planet} Dasha
                    </span>
                    <span className="text-xs text-slate-500">
                      {d.startYear}–{d.endYear}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{d.theme}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">
          Major Life Windows
        </p>
        <div>
          {events.map((event, i) => (
            <TimelineNode key={`${event.year}-${event.title}`} event={event} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
