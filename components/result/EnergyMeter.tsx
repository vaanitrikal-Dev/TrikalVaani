'use client';

import { useEffect, useState } from 'react';

type Props = {
  score: number;
  name: string;
};

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Highly Auspicious', color: '#22C55E' };
  if (score >= 70) return { label: 'Favorable', color: '#FACC15' };
  if (score >= 55) return { label: 'Moderate', color: '#FB923C' };
  return { label: 'Challenging', color: '#F87171' };
}

export default function EnergyMeter({ score, name }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { label, color } = getScoreLabel(score);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 1800;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * 0.75 * (1 - animatedScore / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-56">
        <svg
          className="w-full h-full -rotate-[135deg]"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          />

          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="url(#energyGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={dashOffset}
            style={{ transition: 'none' }}
          />

          <defs>
            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-5xl font-bold font-sans tabular-nums leading-none"
            style={{ color }}
          >
            {animatedScore}
          </div>
          <div className="text-sm text-slate-400 mt-1 font-medium">/ 100</div>
          <div
            className="text-xs font-semibold tracking-wide mt-2 px-3 py-1 rounded-full"
            style={{
              color,
              background: `${color}18`,
              border: `1px solid ${color}40`,
            }}
          >
            {label}
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none"
          aria-hidden="true"
          style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
        />
      </div>

      <p className="mt-4 text-sm text-slate-400 text-center">
        <span className="text-yellow-400/80 font-medium">{name.split(' ')[0]}</span>
        {`'s Daily Cosmic Energy — `}
        {new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>

      <div className="mt-6 flex items-center gap-8 text-center">
        {[
          { level: 0, label: 'Low', active: score < 55 },
          { level: 1, label: 'Medium', active: score >= 55 && score < 70 },
          { level: 2, label: 'High', active: score >= 70 && score < 85 },
          { level: 3, label: 'Peak', active: score >= 85 },
        ].map((item) => (
          <div key={item.level} className="flex flex-col items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: item.active ? color : 'rgba(255,255,255,0.1)',
                boxShadow: item.active ? `0 0 6px ${color}` : 'none',
              }}
            />
            <span
              className="text-xs"
              style={{ color: item.active ? color : 'rgba(255,255,255,0.25)' }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
