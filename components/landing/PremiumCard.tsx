import { Lock, Sparkles, Check, TrendingUp } from 'lucide-react';

const PREMIUM_FEATURES = [
  'Complete Kundali chart with all 12 houses',
  'Vimshottari Dasha timeline for 10 years',
  'Navamsha (D9) — Marriage & Dharma chart',
  'Gemstone recommendations with rationale',
  'Planetary transit alerts for 2024–2025',
  'Compatibility analysis (Guna Milan)',
  'Audio reading by certified Jyotishi',
  'Priority WhatsApp support',
];

export default function PremiumCard() {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
          style={{
            background: 'rgba(10,15,30,0.9)',
            border: '1px solid rgba(76,29,149,0.5)',
            boxShadow: '0 0 60px rgba(76,29,149,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(76,29,149,0.2) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(250,204,21,0.12)',
                      border: '1px solid rgba(250,204,21,0.3)',
                      color: '#FACC15',
                    }}
                  >
                    <TrendingUp className="w-3 h-3" />
                    Launching Soon
                  </div>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Premium Deep Report
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  For the first 100,000 members only
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500 line-through mb-1">₹2,999</div>
                <div className="text-2xl font-bold text-yellow-400">Early Access</div>
                <div className="text-xs text-yellow-400/60">Limited Spots</div>
              </div>
            </div>

            <div
              className="rounded-2xl p-5 mb-8"
              style={{
                background: 'rgba(76,29,149,0.15)',
                border: '1px solid rgba(76,29,149,0.3)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-yellow-400/60" />
                <span className="text-sm font-medium text-yellow-400/80">
                  Exclusive to First 100K Members
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                The complete Vedic life blueprint — 40+ pages of personalized Jyotish analysis,
                designed for those serious about understanding their cosmic path.
                Reserve your spot now by completing your free analysis above.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {PREMIUM_FEATURES.map((feature) => (
                <div key={feature} className="flex items-start gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(250,204,21,0.12)',
                      border: '1px solid rgba(250,204,21,0.25)',
                    }}
                  >
                    <Check className="w-3 h-3 text-yellow-400" />
                  </div>
                  <span className="text-sm text-slate-400">{feature}</span>
                </div>
              ))}
            </div>

            <div
              className="w-full h-14 rounded-xl flex items-center justify-center gap-3 relative overflow-hidden cursor-not-allowed"
              style={{
                background: 'rgba(76,29,149,0.2)',
                border: '1px dashed rgba(76,29,149,0.5)',
              }}
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-500">
                Launching for First 100K Members
              </span>
              <Sparkles className="w-4 h-4 text-slate-500" />
            </div>

            <p className="text-center text-xs text-slate-600 mt-4">
              Get your free score first — early access unlocks automatically when we hit 100K
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
