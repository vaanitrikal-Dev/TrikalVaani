'use client';

import { useState } from 'react';
import { HeartCrack, TriangleAlert as AlertTriangle, Sparkles, TrendingUp, Chrome as Home, Banknote, Baby, Users, Sunset, Crown, MoonStar, ChevronRight, Zap } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type Generation = 'genz' | 'millennial' | 'genx';

type Segment = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
};

const SEGMENTS: Record<Generation, Segment[]> = {
  genz: [
    { id: 'ex_back', label: 'Ex-Back & Closure', icon: HeartCrack, color: '#F472B6', description: 'Venus & Moon karmic bond analysis' },
    { id: 'toxic_boss', label: 'Toxic Boss Radar', icon: AlertTriangle, color: '#FB923C', description: 'Saturn & Mars clash in your karma bhava' },
    { id: 'manifestation', label: 'Manifestation & Luck', icon: Sparkles, color: '#FACC15', description: 'Your current Sankalpa activation window' },
    { id: 'dream_career', label: 'Dream Career Pivot', icon: TrendingUp, color: '#60A5FA', description: '10th house + Rahu ambition transit' },
  ],
  millennial: [
    { id: 'property_yog', label: 'Property & Home Yog', icon: Home, color: '#34D399', description: '4th house & Jupiter blessing analysis' },
    { id: 'karz_mukti', label: 'Karz Mukti (Debt)', icon: Banknote, color: '#FACC15', description: '6th house & Saturn Karma clearing' },
    { id: 'child_destiny', label: "Child's Destiny", icon: Baby, color: '#F472B6', description: '5th house Putra Bhava activation' },
    { id: 'parents_wellness', label: "Parents' Wellness", icon: Users, color: '#60A5FA', description: '4th & 9th house ancestral protection' },
  ],
  genx: [
    { id: 'retirement_peace', label: 'Retirement Peace', icon: Sunset, color: '#FB923C', description: '12th house & Jupiter final cycle' },
    { id: 'legacy_inheritance', label: 'Legacy & Inheritance', icon: Crown, color: '#FACC15', description: '8th & 2nd house Dhan-Karma' },
    { id: 'spiritual_innings', label: 'Spiritual 2nd Innings', icon: MoonStar, color: GOLD, description: 'Ketu & 12th house moksha activation' },
  ],
};

const GEN_OPTIONS: { key: Generation; label: string; sub: string }[] = [
  { key: 'genz', label: 'Gen Z', sub: 'Age 11–31' },
  { key: 'millennial', label: 'Millennial', sub: 'Age 32–46' },
  { key: 'genx', label: 'Gen X', sub: 'Age 47–56' },
];

export default function DardEngineShowcase() {
  const [activeGen, setActiveGen] = useState<Generation>('genz');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const segments = SEGMENTS[activeGen];

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(220,38,38,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.25)',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-red-400">
              The Dard Engine — Live
            </span>
            <Zap className="w-3.5 h-3.5 text-red-400" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-5 text-white">
            What&apos;s living{' '}
            <span className="text-gradient-gold">rent-free</span>
            {' '}in your head?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Tap your life stage. Pick the question that&apos;s been gnawing at you.
            Trikal Guru reads your chart specifically for it — not a generic horoscope.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10 flex-wrap">
          {GEN_OPTIONS.map((gen) => (
            <button
              key={gen.key}
              onClick={() => setActiveGen(gen.key)}
              className="relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
              style={
                activeGen === gen.key
                  ? {
                      background: `linear-gradient(135deg, ${GOLD_RGBA(0.2)} 0%, rgba(220,38,38,0.15) 100%)`,
                      border: `1px solid ${GOLD_RGBA(0.45)}`,
                      color: GOLD,
                      boxShadow: `0 0 20px ${GOLD_RGBA(0.2)}`,
                    }
                  : {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(148,163,184,0.7)',
                    }
              }
            >
              <span>{gen.label}</span>
              <span className="ml-1.5 text-xs opacity-60">{gen.sub}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {segments.map((seg) => {
            const Icon = seg.icon;
            const isHovered = hoveredId === seg.id;
            return (
              <a
                key={seg.id}
                href="#birth-form"
                className="group relative rounded-2xl p-5 transition-all duration-300 cursor-pointer block"
                onMouseEnter={() => setHoveredId(seg.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: isHovered ? `${seg.color}0e` : 'rgba(6,10,24,0.7)',
                  border: `1px solid ${isHovered ? seg.color + '35' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isHovered ? `0 8px 32px ${seg.color}18` : 'none',
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: `${seg.color}15`,
                      border: `1px solid ${seg.color}${isHovered ? '50' : '28'}`,
                      boxShadow: isHovered ? `0 0 16px ${seg.color}20` : 'none',
                    }}
                  >
                    <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: seg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white mb-1 leading-snug">
                      {seg.label}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {seg.description}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0 mt-1 transition-all duration-300"
                    style={{
                      color: isHovered ? seg.color : 'rgba(148,163,184,0.2)',
                      transform: isHovered ? 'translateX(2px)' : 'none',
                    }}
                  />
                </div>

                <div
                  className="mt-4 pt-3 flex items-center justify-between"
                  style={{ borderTop: `1px solid ${seg.color}12` }}
                >
                  <span className="text-xs" style={{ color: `${seg.color}60` }}>
                    Tap to unlock your chart reading
                  </span>
                  <div
                    className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300"
                    style={{
                      background: isHovered ? `${seg.color}18` : 'transparent',
                      color: seg.color,
                      border: `1px solid ${seg.color}${isHovered ? '40' : '20'}`,
                    }}
                  >
                    Free
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-slate-600 mb-3">
            Complete your free birth-data analysis above to unlock all Dard Engine readings
          </p>
          <a
            href="#birth-form"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #A8862A 100%)`,
              color: '#020817',
              boxShadow: `0 0 28px ${GOLD_RGBA(0.35)}`,
            }}
          >
            <Sparkles className="w-4 h-4" />
            Start Free — Get All Answers
          </a>
        </div>
      </div>
    </section>
  );
}
