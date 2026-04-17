'use client';

import type { DashaPeriod } from '@/lib/vedic-astro';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const QUALITY_STYLES: Record<DashaPeriod['quality'], { label: string; color: string; bg: string; border: string }> = {
  excellent: { label: 'Excellent', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)'  },
  good:      { label: 'Good',      color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)'  },
  moderate:  { label: 'Moderate',  color: GOLD,      bg: GOLD_RGBA(0.1),          border: GOLD_RGBA(0.28)          },
  testing:   { label: 'Testing',   color: '#FB923C', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.3)'  },
};

const ANTARDASHA_SEQUENCE = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus'];

function getAntardasha(mahadasha: DashaPeriod): { planet: string; start: number; end: number }[] {
  const totalMonths = (mahadasha.endYear - mahadasha.startYear) * 12;
  const startIdx = ANTARDASHA_SEQUENCE.indexOf(mahadasha.planet);
  const result: { planet: string; start: number; end: number }[] = [];
  let cursor = mahadasha.startYear;

  for (let i = 0; i < 5; i++) {
    const planet = ANTARDASHA_SEQUENCE[(startIdx + i) % ANTARDASHA_SEQUENCE.length];
    const months = Math.round(totalMonths / 9);
    const end = cursor + months / 12;
    result.push({ planet, start: Math.round(cursor * 10) / 10, end: Math.round(end * 10) / 10 });
    cursor = end;
    if (cursor >= mahadasha.endYear) break;
  }
  return result;
}

type Props = {
  dashaPeriods: DashaPeriod[];
  currentYear: number;
  name: string;
};

export default function VimshottariDashaTable({ dashaPeriods, currentYear, name }: Props) {
  if (!dashaPeriods || dashaPeriods.length === 0) return null;

  const currentDasha = dashaPeriods.find(
    (d) => d.startYear <= currentYear && d.endYear > currentYear
  ) ?? dashaPeriods[0];

  const antardasha = getAntardasha(currentDasha);

  return (
    <div className="rounded-2xl overflow-hidden card-glass-strong flex flex-col">
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: GOLD_RGBA(0.5) }}>
            Vimshottari Dasha
          </p>
          <h3 className="text-base font-bold text-white">
            {name.split(' ')[0]}&apos;s Dasha Sequence
          </h3>
        </div>
        <div
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-semibold"
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.28)',
            color: '#4ADE80',
            boxShadow: '0 0 12px rgba(34,197,94,0.12)',
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          Live: {currentDasha.planet} Mahadasha
        </div>
      </div>

      <div
        className="mx-5 mb-4 rounded-xl px-4 py-3"
        style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.12)}` }}
      >
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold" style={{ color: GOLD }}>{currentDasha.planet} Mahadasha</span>
          {' '}({currentDasha.startYear}–{currentDasha.endYear})
          {' '}— {currentDasha.theme}
        </p>
      </div>

      <div className="px-5 pb-1 overflow-x-auto">
        <table className="w-full min-w-[380px]" cellSpacing={0}>
          <thead>
            <tr>
              {['Planet', 'Start', 'End', 'Quality'].map((h) => (
                <th
                  key={h}
                  className="text-left py-2.5 pr-4 text-xs font-semibold tracking-widest uppercase"
                  style={{
                    color: GOLD_RGBA(0.45),
                    borderBottom: `1px solid ${GOLD_RGBA(0.12)}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dashaPeriods.map((period, i) => {
              const qStyle = QUALITY_STYLES[period.quality];
              const isActive = period.planet === currentDasha.planet;
              const isAlt = i % 2 === 1;
              return (
                <tr
                  key={`${period.planet}-${i}`}
                  className={isActive ? 'dasha-row-active' : isAlt ? 'dasha-row-alt' : ''}
                  style={{ transition: 'background 0.2s' }}
                >
                  <td className="py-3 pr-4" style={{ borderBottom: `1px solid ${GOLD_RGBA(0.06)}` }}>
                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <span className="relative flex h-2 w-2 flex-shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                      ) : (
                        <span className="w-2 flex-shrink-0" />
                      )}
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isActive ? GOLD : 'rgb(203,213,225)' }}
                      >
                        {period.planet}
                      </span>
                      {isActive && (
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ADE80' }}>
                          Now
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className="py-3 pr-4 text-sm tabular-nums"
                    style={{ color: isActive ? 'rgb(203,213,225)' : 'rgb(100,116,139)', borderBottom: `1px solid ${GOLD_RGBA(0.06)}` }}
                  >
                    {period.startYear}
                  </td>
                  <td
                    className="py-3 pr-4 text-sm tabular-nums"
                    style={{ color: isActive ? 'rgb(203,213,225)' : 'rgb(100,116,139)', borderBottom: `1px solid ${GOLD_RGBA(0.06)}` }}
                  >
                    {period.endYear}
                  </td>
                  <td className="py-3" style={{ borderBottom: `1px solid ${GOLD_RGBA(0.06)}` }}>
                    <span
                      className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: qStyle.color, background: qStyle.bg, border: `1px solid ${qStyle.border}` }}
                    >
                      {qStyle.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 mt-1" style={{ borderTop: `1px solid ${GOLD_RGBA(0.08)}` }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD_RGBA(0.35) }}>
          Antardasha — within {currentDasha.planet} Mahadasha
        </p>
        <div className="space-y-2">
          {antardasha.map((sub, i) => {
            const isCurrentSub = sub.start <= currentYear && sub.end > currentYear;
            return (
              <div
                key={`sub-${sub.planet}-${i}`}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors duration-200"
                style={{
                  background: isCurrentSub ? 'rgba(34,197,94,0.07)' : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  border: `1px solid ${isCurrentSub ? 'rgba(34,197,94,0.22)' : GOLD_RGBA(0.06)}`,
                  boxShadow: isCurrentSub ? '0 0 12px rgba(34,197,94,0.08)' : 'none',
                }}
              >
                {isCurrentSub ? (
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                ) : (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: GOLD_RGBA(0.2) }}
                  />
                )}
                <div className="flex-1 flex items-center justify-between gap-3">
                  <span
                    className="text-sm font-medium"
                    style={{ color: isCurrentSub ? '#86EFAC' : 'rgb(100,116,139)' }}
                  >
                    {sub.planet} Antardasha
                    {isCurrentSub && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ADE80' }}>
                        Active
                      </span>
                    )}
                  </span>
                  <span className="text-xs flex-shrink-0 tabular-nums" style={{ color: 'rgba(100,116,139,0.6)' }}>
                    {sub.start.toFixed(1)} – {sub.end.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
