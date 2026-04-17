'use client';

import type { DashaPeriod } from '@/lib/vedic-astro';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const QUALITY_STYLES: Record<DashaPeriod['quality'], { label: string; color: string; bg: string; border: string }> = {
  excellent: { label: 'Excellent', color: '#4ADE80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)' },
  good:      { label: 'Good',      color: '#60A5FA', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)' },
  moderate:  { label: 'Moderate',  color: GOLD,      bg: GOLD_RGBA(0.07),         border: GOLD_RGBA(0.22)          },
  testing:   { label: 'Testing',   color: '#FB923C', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)' },
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
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(4,8,20,0.95)',
        border: `1px solid ${GOLD_RGBA(0.15)}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between flex-wrap gap-3">
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
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ADE80' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active: {currentDasha.planet} Mahadasha
        </div>
      </div>

      <div className="px-5 pb-4">
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: GOLD_RGBA(0.04), border: `1px solid ${GOLD_RGBA(0.12)}` }}
        >
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold" style={{ color: GOLD }}>{currentDasha.planet} Mahadasha</span>
            {' '}({currentDasha.startYear}–{currentDasha.endYear}){' '}
            — {currentDasha.theme}
          </p>
        </div>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr>
                <th
                  className="text-left pb-3 pr-4 text-xs font-semibold tracking-widest uppercase"
                  style={{ color: GOLD_RGBA(0.4), borderBottom: `1px solid ${GOLD_RGBA(0.1)}` }}
                >
                  Planet
                </th>
                <th
                  className="text-left pb-3 pr-4 text-xs font-semibold tracking-widest uppercase"
                  style={{ color: GOLD_RGBA(0.4), borderBottom: `1px solid ${GOLD_RGBA(0.1)}` }}
                >
                  Start
                </th>
                <th
                  className="text-left pb-3 pr-4 text-xs font-semibold tracking-widest uppercase"
                  style={{ color: GOLD_RGBA(0.4), borderBottom: `1px solid ${GOLD_RGBA(0.1)}` }}
                >
                  End
                </th>
                <th
                  className="text-left pb-3 text-xs font-semibold tracking-widest uppercase"
                  style={{ color: GOLD_RGBA(0.4), borderBottom: `1px solid ${GOLD_RGBA(0.1)}` }}
                >
                  Quality
                </th>
              </tr>
            </thead>
            <tbody>
              {dashaPeriods.map((period, i) => {
                const style = QUALITY_STYLES[period.quality];
                const isActive = period.planet === currentDasha.planet;
                return (
                  <tr
                    key={`${period.planet}-${i}`}
                    style={{
                      background: isActive ? GOLD_RGBA(0.04) : 'transparent',
                    }}
                  >
                    <td className="py-3 pr-4" style={{ borderBottom: `1px solid ${GOLD_RGBA(0.05)}` }}>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        )}
                        <span className={`text-sm font-semibold ${isActive ? '' : 'text-slate-300'}`}
                          style={isActive ? { color: GOLD } : {}}>
                          {period.planet}
                        </span>
                        {isActive && (
                          <span className="text-xs text-emerald-400/70">(Current)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-slate-400" style={{ borderBottom: `1px solid ${GOLD_RGBA(0.05)}` }}>
                      {period.startYear}
                    </td>
                    <td className="py-3 pr-4 text-sm text-slate-400" style={{ borderBottom: `1px solid ${GOLD_RGBA(0.05)}` }}>
                      {period.endYear}
                    </td>
                    <td className="py-3" style={{ borderBottom: `1px solid ${GOLD_RGBA(0.05)}` }}>
                      <span
                        className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: style.color, background: style.bg, border: `1px solid ${style.border}` }}
                      >
                        {style.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD_RGBA(0.35) }}>
            Antardasha within {currentDasha.planet} Mahadasha
          </p>
          <div className="space-y-2">
            {antardasha.map((sub, i) => {
              const isCurrentSub = sub.start <= currentYear && sub.end > currentYear;
              return (
                <div
                  key={`sub-${sub.planet}-${i}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: isCurrentSub ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isCurrentSub ? 'rgba(34,197,94,0.2)' : GOLD_RGBA(0.06)}`,
                  }}
                >
                  {isCurrentSub && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />}
                  <div className="flex-1 flex items-center justify-between gap-4">
                    <span className={`text-sm font-medium ${isCurrentSub ? 'text-emerald-300' : 'text-slate-400'}`}>
                      {sub.planet} Antardasha
                    </span>
                    <span className="text-xs text-slate-600 flex-shrink-0">
                      {sub.start.toFixed(1)} – {sub.end.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
