import { Sparkles } from 'lucide-react';

type Props = {
  insight: string;
  rashi: string;
  luckyColor: string;
  luckyNumber: number;
  name: string;
};

export default function TrikalInsight({
  insight,
  rashi,
  luckyColor,
  luckyNumber,
  name,
}: Props) {
  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'rgba(10,15,30,0.8)',
          border: '1px solid rgba(250,204,21,0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 0% 0%, rgba(250,204,21,0.05) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-semibold tracking-widest uppercase text-yellow-400/70">
              Today&apos;s Trikal Insight
            </span>
          </div>

          <blockquote className="font-serif text-base sm:text-lg text-slate-200 leading-relaxed italic">
            &ldquo;{insight}&rdquo;
          </blockquote>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-slate-500">
              Personalized for{' '}
              <span className="text-yellow-400/70 font-medium">
                {name.split(' ')[0]}
              </span>
              {' '}·{' '}
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Rashi',
            value: rashi,
            sub: 'Moon Sign',
            color: 'rgba(250,204,21,0.12)',
            border: 'rgba(250,204,21,0.2)',
            textColor: '#FACC15',
          },
          {
            label: 'Lucky Color',
            value: luckyColor,
            sub: 'Wear today',
            color: 'rgba(76,29,149,0.15)',
            border: 'rgba(76,29,149,0.3)',
            textColor: '#C4B5FD',
          },
          {
            label: 'Lucky Number',
            value: String(luckyNumber),
            sub: 'Today\'s vibration',
            color: 'rgba(34,197,94,0.1)',
            border: 'rgba(34,197,94,0.2)',
            textColor: '#4ADE80',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-4 text-center"
            style={{ background: item.color, border: `1px solid ${item.border}` }}
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
