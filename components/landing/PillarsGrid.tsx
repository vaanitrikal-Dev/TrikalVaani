import {
  Coins,
  Briefcase,
  Heart,
  Activity,
  GraduationCap,
  Leaf,
} from 'lucide-react';

const PILLARS = [
  {
    key: 'wealth',
    label: 'Wealth',
    subLabel: 'Dhana & Lakshmi',
    icon: Coins,
    gradient: 'from-yellow-500/20 to-amber-600/10',
    iconColor: 'text-yellow-400',
    borderColor: 'rgba(250,204,21,0.2)',
    hoverGlow: 'rgba(250,204,21,0.15)',
    description: 'Financial flow, abundance, and material prosperity aligned with your karma.',
  },
  {
    key: 'career',
    label: 'Career',
    subLabel: 'Karma & Dharma',
    icon: Briefcase,
    gradient: 'from-blue-500/20 to-cyan-600/10',
    iconColor: 'text-blue-300',
    borderColor: 'rgba(96,165,250,0.2)',
    hoverGlow: 'rgba(96,165,250,0.15)',
    description: 'Professional destiny, purpose, and the right time to rise in your field.',
  },
  {
    key: 'love',
    label: 'Love',
    subLabel: 'Venus & Moon',
    icon: Heart,
    gradient: 'from-rose-500/20 to-pink-600/10',
    iconColor: 'text-rose-400',
    borderColor: 'rgba(244,114,182,0.2)',
    hoverGlow: 'rgba(244,114,182,0.15)',
    description: 'Relationship harmony, soulmate timing, and Venus-guided romance insights.',
  },
  {
    key: 'health',
    label: 'Health',
    subLabel: 'Aarogya & Prana',
    icon: Activity,
    gradient: 'from-emerald-500/20 to-green-600/10',
    iconColor: 'text-emerald-400',
    borderColor: 'rgba(52,211,153,0.2)',
    hoverGlow: 'rgba(52,211,153,0.15)',
    description: 'Vital energy, body cycles, and Ayurvedic alignment with planetary rhythms.',
  },
  {
    key: 'students',
    label: 'Students',
    subLabel: 'Vidya & Mercury',
    icon: GraduationCap,
    gradient: 'from-orange-500/20 to-amber-600/10',
    iconColor: 'text-orange-400',
    borderColor: 'rgba(251,146,60,0.2)',
    hoverGlow: 'rgba(251,146,60,0.15)',
    description: 'Learning power, exam success, and Mercury\'s blessing for academic excellence.',
  },
  {
    key: 'peace',
    label: 'Peace',
    subLabel: 'Moksha & Shanti',
    icon: Leaf,
    gradient: 'from-teal-500/20 to-cyan-600/10',
    iconColor: 'text-teal-300',
    borderColor: 'rgba(45,212,191,0.2)',
    hoverGlow: 'rgba(45,212,191,0.15)',
    description: 'Mental clarity, inner peace, and the soul\'s path toward liberation.',
  },
];

export default function PillarsGrid() {
  return (
    <section id="pillars" className="relative py-24 px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(76,29,149,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-yellow-400/60 mb-4">
            The Six Domains of Life
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-gold">Life Pillars</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
            Vedic Jyotish maps the cosmos across six essential life domains.
            Your birth chart reveals the strength of each pillar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.key}
                className="pillar-card rounded-2xl p-6 cursor-default"
                style={{
                  background: 'rgba(10,15,30,0.6)',
                  border: `1px solid ${pillar.borderColor}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${pillar.gradient}`}
                    style={{ border: `1px solid ${pillar.borderColor}` }}
                  >
                    <Icon className={`w-6 h-6 ${pillar.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-base font-semibold text-white">
                        {pillar.label}
                      </h3>
                      <span className="text-xs text-slate-500 italic font-serif">
                        {pillar.subLabel}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${pillar.borderColor}` }}>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Your Score</span>
                    <span className={pillar.iconColor}>Unlock with analysis</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${pillar.gradient}`}
                      style={{ width: '0%', transition: 'width 0.4s ease' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#birth-form"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(250,204,21,0.15) 0%, rgba(76,29,149,0.15) 100%)',
              border: '1px solid rgba(250,204,21,0.3)',
              color: '#FACC15',
            }}
          >
            Unlock All Pillar Scores — Free
          </a>
        </div>
      </div>
    </section>
  );
}
