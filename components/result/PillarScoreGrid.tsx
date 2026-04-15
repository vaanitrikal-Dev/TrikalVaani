'use client';

import { useEffect, useRef } from 'react';
import type { ComponentType, CSSProperties } from 'react';
import { Coins, Briefcase, Heart, Activity, GraduationCap, Leaf } from 'lucide-react';

type PillarScores = {
  wealth: number;
  career: number;
  love: number;
  health: number;
  students: number;
  peace: number;
};

type Props = { scores: PillarScores };

const PILLAR_META = [
  { key: 'wealth' as const, label: 'Wealth', icon: Coins, color: '#FACC15', glow: 'rgba(250,204,21,0.3)' },
  { key: 'career' as const, label: 'Career', icon: Briefcase, color: '#60A5FA', glow: 'rgba(96,165,250,0.3)' },
  { key: 'love' as const, label: 'Love', icon: Heart, color: '#F472B6', glow: 'rgba(244,114,182,0.3)' },
  { key: 'health' as const, label: 'Health', icon: Activity, color: '#34D399', glow: 'rgba(52,211,153,0.3)' },
  { key: 'students' as const, label: 'Students', icon: GraduationCap, color: '#FB923C', glow: 'rgba(251,146,60,0.3)' },
  { key: 'peace' as const, label: 'Peace', icon: Leaf, color: '#2DD4BF', glow: 'rgba(45,212,191,0.3)' },
];

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Moderate';
  return 'Needs Care';
}

function BarRow({
  label,
  score,
  icon: Icon,
  color,
  glow,
}: {
  label: string;
  score: number;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  color: string;
  glow: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (barRef.current) {
        barRef.current.style.width = `${score}%`;
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [score]);

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-slate-300">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: `${color}80` }}>
              {getScoreLabel(score)}
            </span>
            <span className="text-sm font-bold tabular-nums" style={{ color }}>
              {score}
            </span>
          </div>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            ref={barRef}
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: '0%',
              background: `linear-gradient(90deg, ${color}80 0%, ${color} 100%)`,
              boxShadow: `0 0 8px ${glow}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function PillarScoreGrid({ scores }: Props) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(10,15,30,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white">Life Pillar Scores</h3>
        <p className="text-xs text-slate-500 mt-1">Based on your birth data and today&apos;s planetary positions</p>
      </div>

      <div className="space-y-5">
        {PILLAR_META.map((meta) => (
          <BarRow
            key={meta.key}
            label={meta.label}
            score={scores[meta.key]}
            icon={meta.icon}
            color={meta.color}
            glow={meta.glow}
          />
        ))}
      </div>
    </div>
  );
}
