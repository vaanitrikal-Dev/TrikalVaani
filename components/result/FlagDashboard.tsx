'use client';

import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Lock } from 'lucide-react';

const GREEN = '#00E676';
const RED = '#FF4D4D';

export type FlagItem = {
  type: 'red' | 'green';
  label: string;
  explanation: string;
};

type Props = {
  flags: FlagItem[];
  showUnlockTeaser?: boolean;
  onUnlock?: () => void;
  userName: string;
  partnerName: string;
  isExBack?: boolean;
};

export default function FlagDashboard({ flags, showUnlockTeaser, onUnlock, userName, partnerName, isExBack }: Props) {
  const greens = flags.filter(f => f.type === 'green').slice(0, 3);
  const reds = flags.filter(f => f.type === 'red').slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(148,163,184,0.35)' }}>
          Flag Dashboard
        </span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,230,118,0.04)', border: '1px solid rgba(0,230,118,0.15)' }}>
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: GREEN }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${GREEN}99` }}>
              Green Flags
            </p>
            <span
              className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,230,118,0.1)', color: GREEN, border: '1px solid rgba(0,230,118,0.22)' }}
            >
              {greens.length}
            </span>
          </div>
          <div className="px-4 pb-4 space-y-3">
            {greens.map((flag, i) => (
              <div
                key={i}
                className="rounded-xl p-3 transition-all duration-200"
                style={{ background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.1)' }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(0,230,118,0.15)' }}
                  >
                    <CheckCircle2 className="w-3 h-3" style={{ color: GREEN }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight mb-1" style={{ color: GREEN }}>{flag.label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>{flag.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
            {greens.length === 0 && (
              <p className="text-xs text-slate-600 italic px-1">No green flags detected yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,77,77,0.04)', border: '1px solid rgba(255,77,77,0.15)' }}>
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: RED }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${RED}99` }}>
              Red Flags
            </p>
            <span
              className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,77,77,0.1)', color: RED, border: '1px solid rgba(255,77,77,0.22)' }}
            >
              {reds.length}
            </span>
          </div>
          <div className="px-4 pb-4 space-y-3">
            {reds.map((flag, i) => (
              <div
                key={i}
                className="rounded-xl p-3 transition-all duration-200"
                style={{ background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.1)' }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,77,77,0.15)' }}
                  >
                    <AlertTriangle className="w-3 h-3" style={{ color: RED }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight mb-1" style={{ color: RED }}>{flag.label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>{flag.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
            {reds.length === 0 && (
              <p className="text-xs text-slate-600 italic px-1">No red flags detected.</p>
            )}
          </div>
        </div>
      </div>

      {showUnlockTeaser && isExBack && (
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: 'rgba(255,77,77,0.06)', border: '1px solid rgba(255,77,77,0.2)' }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: RED, filter: 'blur(24px)', transform: 'translate(30%, -30%)' }} />
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.25)' }}
            >
              <Lock className="w-4 h-4" style={{ color: RED }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold mb-1" style={{ color: RED }}>
                Hidden Red Flag Detected in {partnerName.split(' ')[0]}&apos;s 8th House
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                The stars show a 70% chance of reunion — but a secret hidden in {partnerName.split(' ')[0]}&apos;s 8th house suggests something you don&apos;t know yet. The Truth Shield reveals it.
              </p>
              <button
                onClick={onUnlock}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, ${RED} 0%, #CC0000 100%)`,
                  color: '#fff',
                  boxShadow: `0 4px 16px rgba(255,77,77,0.35)`,
                }}
              >
                <Lock className="w-3 h-3" />
                Unlock Truth Shield — ₹11
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnlockTeaser && !isExBack && (
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.18)' }}
        >
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: RED }} />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-0.5" style={{ color: RED }}>Full Red Flag Alert Locked</p>
              <p className="text-xs text-slate-500">Planetary clash analysis — exact trigger points, timing, and resolution rituals.</p>
            </div>
            <button
              onClick={onUnlock}
              className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${RED} 0%, #CC0000 100%)`,
                color: '#fff',
                boxShadow: `0 2px 12px rgba(255,77,77,0.3)`,
              }}
            >
              ₹11
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
