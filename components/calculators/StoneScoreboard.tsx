'use client';

// ============================================================
// File: components/calculators/StoneScoreboard.tsx
// Shared result UI: the ranked 9-stone suitability scoreboard
// (signature element) + DetailCell. Reused by all gemstone pages.
// ============================================================

import { VERDICT_COLOR, type StoneResult } from '@/lib/jyotish/gemstone';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export function StoneScoreboard({ stones, highlight }: { stones: StoneResult[]; highlight?: string }) {
  return (
    <div className="rounded-2xl p-4 md:p-6" style={{ background: 'rgba(13,17,30,0.7)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <h3 className="text-lg font-serif font-bold mb-4" style={{ color: GOLD }}>Saare 9 Ratna — Suitability Ranking</h3>
      <div className="space-y-2.5">
        {stones.map((s) => {
          const vc = VERDICT_COLOR[s.verdictKey];
          const isHi = highlight && s.graha === highlight;
          return (
            <div key={s.graha} className="rounded-xl p-3 md:p-4"
              style={{ background: isHi ? GOLD_RGBA(0.08) : 'rgba(2,8,23,0.5)', border: `1px solid ${isHi ? GOLD_RGBA(0.5) : vc.c + '33'}` }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <span className="font-semibold" style={{ color: '#e2e8f0' }}>{s.stone_en}</span>
                  <span className="text-slate-500 text-sm ml-1">({s.stone_hi})</span>
                  <span className="text-xs text-slate-500 ml-2">{s.graha}</span>
                  {isHi && <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded" style={{ background: GOLD, color: '#080B12' }}>YEH</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: s.risk >= 15 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)', color: s.risk >= 15 ? '#FCA5A5' : '#94a3b8' }}>Risk: {s.riskLabel}</span>
                  <span className="text-lg font-bold tabular-nums" style={{ color: vc.c }}>{s.score}</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: vc.c }} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: vc.bg, color: vc.c }}>{s.verdictLabel}</span>
                {s.flags.length > 0 && <span className="text-[11px] text-slate-500">{s.flags.join(' · ')}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-600 mt-3">Score = functional benefic + Shadbala + dignity + bhaav + dasha − affliction − risk. Strong ratna (Neelam/Gomed/Lehsunia) ka verdict suraksha ke liye "Expert Review" tak seemit hai.</p>
    </div>
  );
}

export function DetailCell({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="font-bold text-sm" style={{ color: GOLD }}>{value ?? '—'}</div>
    </div>
  );
}
