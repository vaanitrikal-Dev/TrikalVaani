'use client';

// ============================================================
// FILE: components/landing/DardEngineShowcase.tsx
// VERSION: v2.0 — FULL SALES REWRITE
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// DATE: 2026-06-29
// CHANGES v1.0 → v2.0:
//   ✅ Card descriptions: technical jargon → pain-point / emotional copy
//   ✅ Header: social proof micro-signal added below main description
//   ✅ Card CTA: "Analyze Karma" → "Yes, This Is My Issue →"
//   ✅ Bottom helper text: weak → urgency + benefit driven
//   ✅ Bottom CTA: rewritten + trust signals added below button
//   ✅ Selected banner: "Scroll to Form ↓" → "Get My Reading ↓"
//   ✅ ALL LOGIC PRESERVED: useState, handleSegmentClick, scroll, props
//   ✅ ALL ICONS/IMPORTS: identical to v1.0
// ============================================================

import { useState } from 'react';
import { HeartCrack, TriangleAlert as AlertTriangle, Sparkles, TrendingUp, Chrome as Home, Banknote, Baby, Users, Sunset, Crown, MoonStar, ChevronRight, Zap, CircleCheck as CheckCircle2 } from 'lucide-react';
import type { SelectedCategory } from '@/app/page';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type Generation = 'genz' | 'millennial' | 'genx';

type Segment = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;      // sales-first pain-point copy
  subDesc: string;          // astrology credibility (smaller text)
  isDual?: boolean;
};

// ── ALL 11 DOMAIN IDs MATCH domain-config.ts EXACTLY ─────────────────────────
const SEGMENTS: Record<Generation, Segment[]> = {
  genz: [
    {
      id: 'genz_ex_back',
      label: 'Ex-Back & Closure',
      icon: HeartCrack,
      color: '#F472B6',
      description: 'Is this love worth fighting for — or a karmic trap to escape? Your chart knows the truth.',
      subDesc: 'Venus & Moon karmic bond · Dual chart analysis',
      isDual: true,
    },
    {
      id: 'genz_toxic_boss',
      label: 'Toxic Boss / Workplace',
      icon: AlertTriangle,
      color: '#FB923C',
      description: 'Is your workplace draining you because of your karma — or theirs? Saturn shows the exit window.',
      subDesc: 'Saturn & Mars clash · Karma bhava analysis',
      isDual: true,
    },
    {
      id: 'genz_manifestation',
      label: 'Manifestation & Luck',
      icon: Sparkles,
      color: '#FACC15',
      description: "You're working hard. But is the universe actually backing you right now? Find your luck window.",
      subDesc: 'Sankalpa activation · Current transit window',
    },
    {
      id: 'genz_dream_career',
      label: 'Dream Career Pivot',
      icon: TrendingUp,
      color: '#60A5FA',
      description: 'Is this career change written in your stars — or are you jumping too early? Rahu reveals it.',
      subDesc: '10th house + Rahu ambition transit reading',
    },
  ],
  millennial: [
    {
      id: 'mill_property_yog',
      label: 'Property & Home Yog',
      icon: Home,
      color: '#34D399',
      description: 'Is property yog active in your chart this year — or should you wait? The 4th house answers.',
      subDesc: '4th house & Jupiter blessing · Timing analysis',
    },
    {
      id: 'mill_karz_mukti',
      label: 'Karz Mukti (Debt Relief)',
      icon: Banknote,
      color: '#FACC15',
      description: 'Debt weighing you down? Saturn shows exactly when — and how — your financial karma clears.',
      subDesc: '6th house & Saturn karma · Clearing window',
    },
    {
      id: 'mill_childs_destiny',
      label: "Child's Destiny",
      icon: Baby,
      color: '#F472B6',
      description: "What gift did your child bring into this life? Their destiny is readable from your own chart.",
      subDesc: "5th house Putra Bhava · Parent's chart reading",
    },
    {
      id: 'mill_parents_wellness',
      label: "Parents' Wellness",
      icon: Users,
      color: '#60A5FA',
      description: "Worried about a parent's health or safety? The ancestral house shows risks and protections.",
      subDesc: '4th & 9th house · Ancestral protection reading',
    },
  ],
  genx: [
    {
      id: 'genx_retirement_peace',
      label: 'Retirement Planning',
      icon: Sunset,
      color: '#FB923C',
      description: "Have you built enough — or does karma still have a lesson? Jupiter's final cycle tells the truth.",
      subDesc: '12th house & Jupiter final cycle · Peace timing',
    },
    {
      id: 'genx_legacy_inheritance',
      label: 'Legacy & Inheritance',
      icon: Crown,
      color: '#FACC15',
      description: 'What wealth will you leave — and receive? The Dhan-Karma houses reveal the full picture.',
      subDesc: '8th & 2nd house Dhan-Karma · Transfer timing',
    },
    {
      id: 'genx_spiritual_innings',
      label: 'Spiritual 2nd Innings',
      icon: MoonStar,
      color: GOLD,
      description: 'Your most powerful chapter is still ahead. Ketu shows exactly what this innings is meant for.',
      subDesc: 'Ketu & 12th house moksha · Purpose activation',
    },
  ],
};

const GEN_OPTIONS: { key: Generation; label: string; sub: string }[] = [
  { key: 'genz',       label: 'Gen Z',      sub: 'Age 11–31' },
  { key: 'millennial', label: 'Millennial', sub: 'Age 32–46' },
  { key: 'genx',       label: 'Gen X+',     sub: 'Age 47+' },
];

type Props = {
  selectedCategory: SelectedCategory;
  onSelectCategory: (cat: SelectedCategory) => void;
};

export default function DardEngineShowcase({ selectedCategory, onSelectCategory }: Props) {
  const [activeGen, setActiveGen] = useState<Generation>('genz');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const segments = SEGMENTS[activeGen];

  function handleSegmentClick(seg: Segment) {
    onSelectCategory({ id: seg.id, label: seg.label, color: seg.color });
  }

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

        {/* ── Header ── */}
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

          {/* v2.0: Sales sub-copy — benefit first, then method */}
          <p className="text-slate-300 max-w-xl mx-auto text-base leading-relaxed mb-3">
            Pick the one question that&apos;s been gnawing at you.
            <span className="text-white font-semibold"> We read your chart specifically for that</span>{' '}
            — not a generic sun-sign horoscope.
          </p>

          {/* v2.0: Social proof micro-signal */}
          <p className="text-xs" style={{ color: GOLD_RGBA(0.55) }}>
            ✦ Swiss Ephemeris accuracy · BPHS classical rules · Free to start
          </p>
        </div>

        {/* ── Selected state banner ── */}
        {selectedCategory && (
          <div
            className="mb-6 rounded-2xl px-5 py-3 flex items-center gap-3 transition-all duration-300"
            style={{
              background: `${selectedCategory.color}0d`,
              border: `1px solid ${selectedCategory.color}35`,
            }}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: selectedCategory.color }} />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: `${selectedCategory.color}99` }}>
                Your Topic Selected
              </span>
              <p className="text-sm font-semibold text-white leading-tight">{selectedCategory.label}</p>
            </div>
            <a
              href="#birth-form"
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200"
              style={{
                background: `${selectedCategory.color}18`,
                color: selectedCategory.color,
                border: `1px solid ${selectedCategory.color}40`,
              }}
            >
              Get My Reading ↓
            </a>
          </div>
        )}

        {/* ── Generation tabs ── */}
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

        {/* ── Segment cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {segments.map((seg) => {
            const Icon = seg.icon;
            const isHovered = hoveredId === seg.id;
            const isActive = selectedCategory?.id === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => handleSegmentClick(seg)}
                onMouseEnter={() => setHoveredId(seg.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="insight-card group relative rounded-2xl p-5 cursor-pointer text-left transition-all duration-300"
                style={{
                  background: isActive
                    ? `${seg.color}10`
                    : isHovered
                    ? 'rgba(11,14,20,0.92)'
                    : 'rgba(11,16,26,0.78)',
                  border: `1px solid ${isActive ? seg.color + '50' : isHovered ? seg.color + '40' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isActive
                    ? `0 0 0 2px ${seg.color}22, 0 16px 48px rgba(0,0,0,0.4)`
                    : isHovered
                    ? `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${seg.color}20, inset 0 1px 0 ${seg.color}10`
                    : '0 4px 16px rgba(0,0,0,0.25)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: `${seg.color}12`,
                      border: `1px solid ${seg.color}${isHovered || isActive ? '45' : '22'}`,
                      boxShadow: isHovered || isActive ? `0 0 20px ${seg.color}22, inset 0 1px 0 ${seg.color}15` : 'none',
                    }}
                  >
                    <Icon
                      className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ color: seg.color }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-bold text-white leading-snug">
                        {seg.label}
                      </p>
                      {seg.isDual && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                          style={{ background: `${seg.color}15`, color: seg.color, border: `1px solid ${seg.color}30` }}
                        >
                          Dual Chart
                        </span>
                      )}
                    </div>
                    {/* v2.0: Sales-first description */}
                    <p className="text-sm leading-relaxed text-slate-300 mb-1">
                      {seg.description}
                    </p>
                    {/* v2.0: Jargon as credibility signal (smaller, muted) */}
                    <p className="text-xs" style={{ color: `${seg.color}60` }}>
                      {seg.subDesc}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 flex items-center justify-between gap-3"
                  style={{ borderTop: `1px solid ${seg.color}12` }}
                >
                  <span className="text-xs text-slate-600">
                    {isActive ? '✓ Topic locked — enter birth details below' : 'Free chart reading for this topic'}
                  </span>
                  <div
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 flex-shrink-0"
                    style={{
                      background: isActive ? `${seg.color}22` : isHovered ? `${seg.color}18` : `${seg.color}0a`,
                      color: seg.color,
                      border: `1px solid ${seg.color}${isActive ? '55' : isHovered ? '45' : '25'}`,
                      boxShadow: isHovered || isActive ? `0 0 12px ${seg.color}18` : 'none',
                    }}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Selected ✓
                      </>
                    ) : (
                      <>
                        Yes, This Is My Issue
                        <ChevronRight
                          className="w-3 h-3 transition-transform duration-300"
                          style={{ transform: isHovered ? 'translateX(2px)' : 'none' }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── v2.0: Bottom CTA — sales rewrite ── */}
        <div className="mt-10 text-center">
          {/* Urgency + benefit hook */}
          <p className="text-sm text-slate-400 mb-1">
            60 seconds to fill. <span className="text-white font-semibold">Lifetime of clarity</span> to gain.
          </p>
          <p className="text-xs text-slate-600 mb-6">
            No signup required · No credit card · 100% free to start
          </p>

          <a
            href="#birth-form"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #A8862A 100%)`,
              color: '#020817',
              boxShadow: `0 0 28px ${GOLD_RGBA(0.35)}`,
            }}
          >
            <Sparkles className="w-4 h-4" />
            Get My Free Kundali Reading →
          </a>

          {/* Trust signals below button */}
          <p className="text-xs mt-4" style={{ color: GOLD_RGBA(0.4) }}>
            Swiss Ephemeris · BPHS Classical Rules · Lahiri Ayanamsha · By Rohiit Gupta, Chief Vedic Architect
          </p>
        </div>

      </div>
    </section>
  );
}
