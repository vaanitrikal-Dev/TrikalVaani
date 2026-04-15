import { Cpu, BookOpen, Globe, ShieldCheck } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const PILLARS = [
  {
    icon: BookOpen,
    title: '5,000 Years of Parashara Logic',
    body: 'Our foundational layer is built on Brihat Parashara Hora Shastra — the oldest and most comprehensive Vedic astrological text. Every planetary weight, house lordship, and dasha cycle is derived directly from these classical sutras.',
  },
  {
    icon: Cpu,
    title: 'Hybrid Neural Architecture',
    body: 'A proprietary transformer model trained on anonymized planetary configurations and outcome correlations refines classical predictions. The result is probability-weighted insights that classical Jyotish alone cannot produce at scale.',
  },
  {
    icon: Globe,
    title: 'Real-Time Gochar Integration',
    body: 'Planetary positions are computed in real time using Swiss Ephemeris data. Every reading reflects today\'s exact transit positions against your natal chart — not generic Sun-sign horoscopes.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent Methodology',
    body: 'We publish our scoring methodology, Nakshatra weights, and Dasha calculation logic openly. Trikal Vaani is not a black box — every insight is traceable to a classical Jyotish source or a documented statistical model.',
  },
];

export default function AIManifesto() {
  return (
    <section
      id="about"
      aria-label="About Trikal Vaani AI — Research and Methodology"
      className="relative py-24 px-4"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(76,29,149,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: GOLD_RGBA(0.6) }}>
            Research &amp; Methodology
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-5 text-white">
            The{' '}
            <span className="text-gradient-gold">Trikal AI</span>
            {' '}Engine
          </h2>

          <div
            className="max-w-3xl mx-auto rounded-2xl px-6 py-5 text-left"
            style={{
              background: GOLD_RGBA(0.04),
              border: `1px solid ${GOLD_RGBA(0.15)}`,
            }}
          >
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              <strong className="font-semibold" style={{ color: GOLD }}>
                Trikal Vaani uses a proprietary Hybrid-AI model
              </strong>{' '}
              that merges 5,000-year-old Parashara Vedic logic with advanced Neural Networks
              to provide high-probability life path predictions. By cross-referencing the
              27 Nakshatra system, Vimshottari Dasha cycles, and real-time Gochar transits,
              our engine delivers personalized cosmic intelligence at a depth that no single
              astrologer — however skilled — can compute in real time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(6,12,28,0.7)',
                  border: `1px solid ${GOLD_RGBA(0.1)}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: GOLD_RGBA(0.1), border: `1px solid ${GOLD_RGBA(0.2)}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: GOLD }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">{pillar.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{pillar.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 text-center"
          style={{
            background: 'rgba(6,12,28,0.8)',
            border: `1px solid ${GOLD_RGBA(0.12)}`,
          }}
        >
          <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: GOLD_RGBA(0.5) }}>
            Founded by
          </p>
          <p className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
            Rohiit Gupta
          </p>
          <p className="text-sm text-slate-400 mb-1">Chief Vedic Architect &amp; AI Researcher</p>
          <p className="text-xs text-slate-600">
            Trikal Vaani Global Headquarters · Delhi NCR, India
          </p>

          <div
            className="mt-5 pt-5 flex flex-wrap justify-center gap-4 text-xs text-slate-500"
            style={{ borderTop: `1px solid ${GOLD_RGBA(0.08)}` }}
          >
            <span>Vedic Shastra AI</span>
            <span style={{ color: GOLD_RGBA(0.3) }}>·</span>
            <span>Parashara Logic Engine v3</span>
            <span style={{ color: GOLD_RGBA(0.3) }}>·</span>
            <span>27-Nakshatra Neural Mapping</span>
            <span style={{ color: GOLD_RGBA(0.3) }}>·</span>
            <span>Global Destiny Predictions</span>
          </div>
        </div>
      </div>
    </section>
  );
}
