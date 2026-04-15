'use client';

import { useEffect, useState } from 'react';
import { Loader as Loader2, CircleCheck as CheckCircle2 } from 'lucide-react';

type Props = { name: string };

const STEPS = [
  'Locating birth Lagna (Ascendant)...',
  'Mapping 27 Nakshatras...',
  'Calculating Vimshottari Dasha cycle...',
  'Analysing Rahu-Ketu transit axis...',
  'Cross-referencing Gochar positions...',
  'Computing pillar resonance scores...',
];

export default function NakshatraAnalysis({ name }: Props) {
  const firstName = name.split(' ')[0];
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (stepIndex < STEPS.length - 1) {
      const t = setTimeout(() => setStepIndex((i) => i + 1), 420);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(t);
    }
  }, [stepIndex]);

  return (
    <div
      className="rounded-2xl px-6 py-5"
      style={{
        background: 'rgba(6,12,28,0.85)',
        border: '1px solid rgba(212,175,55,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {!done ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#D4AF37' }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(212,175,55,0.75)' }}>
              Analysing 27 Nakshatras for {firstName}
            </span>
          </div>

          <div className="space-y-1.5">
            {STEPS.slice(0, stepIndex + 1).map((step, i) => (
              <div
                key={step}
                className="flex items-center gap-2 text-xs"
                style={{
                  color: i === stepIndex ? 'rgba(212,175,55,0.9)' : 'rgba(100,116,139,0.6)',
                  animation: i === stepIndex ? 'fade-in 0.3s ease-out' : 'none',
                }}
              >
                {i === stepIndex ? (
                  <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" style={{ color: '#D4AF37' }} />
                ) : (
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                )}
                {step}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">
              Analysis Complete for {firstName}
            </span>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: 'rgba(212,175,55,0.06)',
              border: '1px solid rgba(212,175,55,0.18)',
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,220,160,0.9)' }}>
              <span className="font-semibold" style={{ color: '#D4AF37' }}>
                Analysing 27 Nakshatras for {firstName}
              </span>
              {' '}— Success. Your current{' '}
              <span className="font-medium text-white">Rahu-Ketu transit</span>{' '}
              suggests a period of deep transition and soul-level realignment. The
              nodes are activating your{' '}
              <span className="font-medium" style={{ color: '#D4AF37' }}>
                karmic axis
              </span>
              , making this an extraordinarily powerful window for decisive action.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
