'use client';

import { useState } from 'react';
import { HeartCrack, TriangleAlert as AlertTriangle, Sparkles, TrendingUp, Chrome as Home, Banknote, Baby, Users, Sunset, Crown, MoonStar, Loader as Loader2, ChevronRight, Heart, RefreshCw, CircleCheck as CheckCircle2, Circle as XCircle, Briefcase } from 'lucide-react';
import DualPartnerForm, { type PartnerFormData } from './DualPartnerForm';
import FlagDashboard from './FlagDashboard';

export type LifeSegment = {
  id: string;
  label: string;
  generation: 'genz' | 'millennial' | 'genx';
  icon: React.ElementType;
  color: string;
  description: string;
};

export type SegmentAnalysis = {
  segmentId: string;
  insight: string;
  timeline: string;
  upay: string[];
  whatsappText: string;
  flags?: Array<{ type: 'red' | 'green'; label: string; explanation: string }>;
  reunionProbability?: number;
  reunionMonth?: string;
  closureVerdict?: 'wait_reconnect' | 'accept_move_on';
  vibeMeters?: { energy: number; loyalty: number; passion: number };
};

type Props = {
  generation: 'genz' | 'millennial' | 'genx';
  name: string;
  onAnalyze: (segment: LifeSegment, partnerData?: PartnerFormData) => Promise<void>;
  analysis: SegmentAnalysis | null;
  loading: boolean;
  unlockedTiers?: Set<string>;
  onUnlock?: (id: string) => void;
};

const GENZ_SEGMENTS: LifeSegment[] = [
  { id: 'ex_back',      label: 'Ex-Back & Closure',    generation: 'genz', icon: HeartCrack,    color: '#F472B6', description: 'Venus & Moon karmic bond analysis' },
  { id: 'toxic_boss',   label: 'Toxic Boss Radar',     generation: 'genz', icon: AlertTriangle, color: '#FB923C', description: 'Saturn & Mars authority clash in karma bhava' },
  { id: 'manifestation',label: 'Manifestation & Luck', generation: 'genz', icon: Sparkles,      color: '#FACC15', description: 'Your current Sankalpa activation window' },
  { id: 'dream_career', label: 'Dream Career Pivot',   generation: 'genz', icon: TrendingUp,    color: '#60A5FA', description: '10th house + Rahu ambition transit' },
];

const MILLENNIAL_SEGMENTS: LifeSegment[] = [
  { id: 'property_yog',     label: 'Property & Home Yog',  generation: 'millennial', icon: Home,    color: '#34D399', description: '4th house & Jupiter blessing analysis' },
  { id: 'karz_mukti',       label: 'Karz Mukti (Debt)',    generation: 'millennial', icon: Banknote, color: '#FACC15', description: '6th house & Saturn Karma clearing' },
  { id: 'child_destiny',    label: "Child's Destiny",      generation: 'millennial', icon: Baby,    color: '#F472B6', description: '5th house Putra Bhava activation' },
  { id: 'parents_wellness', label: "Parents' Wellness",    generation: 'millennial', icon: Users,   color: '#60A5FA', description: '4th & 9th house ancestral protection' },
];

const GENX_SEGMENTS: LifeSegment[] = [
  { id: 'retirement_peace',   label: 'Retirement Peace',       generation: 'genx', icon: Sunset,   color: '#FB923C', description: '12th house & Jupiter final cycle' },
  { id: 'legacy_inheritance', label: 'Legacy & Inheritance',   generation: 'genx', icon: Crown,    color: '#FACC15', description: '8th & 2nd house Dhan-Karma' },
  { id: 'spiritual_innings',  label: 'Spiritual 2nd Innings',  generation: 'genx', icon: MoonStar, color: '#D4AF37', description: 'Ketu & 12th house moksha activation' },
];

const SEGMENT_MAP: Record<string, LifeSegment[]> = {
  genz: GENZ_SEGMENTS,
  millennial: MILLENNIAL_SEGMENTS,
  genx: GENX_SEGMENTS,
};

const GEN_LABELS = {
  genz: 'Gen Z (11–31)',
  millennial: 'Millennial (32–46)',
  genx: 'Gen X (47–56)',
};

const DUAL_SEGMENTS = new Set(['ex_back', 'compatibility', 'toxic_boss']);

const GOLD     = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;
const CRIMSON  = '#DC2626';
const PINK     = '#F472B6';
const ORANGE   = '#FB923C';

function ClosureVerdict({ verdict, reunionProbability, reunionMonth, name }: {
  verdict: 'wait_reconnect' | 'accept_move_on';
  reunionProbability?: number;
  reunionMonth?: string;
  name: string;
}) {
  const isWait = verdict === 'wait_reconnect';
  const color  = isWait ? '#22C55E' : '#F472B6';
  const colorRgba = isWait ? (a: number) => `rgba(34,197,94,${a})` : (a: number) => `rgba(244,114,182,${a})`;
  const Icon = isWait ? CheckCircle2 : XCircle;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: colorRgba(0.06),
        border: `1.5px solid ${colorRgba(0.3)}`,
        boxShadow: `0 0 24px ${colorRgba(0.12)}`,
      }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: color, opacity: 0.05, filter: 'blur(24px)', transform: 'translate(30%, -30%)' }}
      />

      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: colorRgba(0.12), border: `1.5px solid ${colorRgba(0.35)}` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: colorRgba(0.65) }}>
            Karmic Closure Algorithm
          </p>
          <p className="text-lg font-black mb-1" style={{ color }}>
            {isWait ? 'Wait & Reconnect' : 'Accept & Move On'}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isWait
              ? `The stars show an open karmic loop between you two. Venus retrograde window and 7th house alignment suggest a real reunion window${reunionMonth ? ` around ${reunionMonth}` : ''}.`
              : `The karmic debt between ${name.split(' ')[0]} and your ex has been settled. Your Moon's nakshatra has moved past the conjunction — the Guru says: release, rise, and receive something better.`}
          </p>
        </div>
      </div>

      {isWait && reunionProbability !== undefined && (
        <div
          className="mt-4 pt-4 flex items-center gap-4"
          style={{ borderTop: `1px solid ${colorRgba(0.15)}` }}
        >
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color }}>{reunionProbability}%</p>
            <p className="text-xs text-slate-500 leading-none mt-0.5">Reunion Probability</p>
          </div>
          {reunionMonth && (
            <div>
              <p className="text-xs font-semibold" style={{ color: GOLD }}>Best Window:</p>
              <p className="text-sm text-white font-bold">{reunionMonth}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToxicBossRadar({ flags }: { flags: Array<{ type: 'red' | 'green'; label: string; explanation: string }> }) {
  const greenFlags = [
    { label: 'Mentorship Potential', explanation: 'Jupiter aspect on your 10th house boss indicates genuine guidance capacity' },
    { label: 'Financial Growth', explanation: 'Their Saturn energy activates your 2nd Dhan house — salary growth is possible' },
    { label: 'Skill Transfer Window', explanation: 'Mercury-Sun alignment suggests knowledge will flow toward you this quarter' },
    ...flags.filter(f => f.type === 'green'),
  ].slice(0, 3);

  const redFlags = [
    { label: 'Micromanagement High', explanation: 'Their Mars squares your Moon — expect control-freak behavior in meetings' },
    { label: 'Ego Clash Alert', explanation: 'Competing Sun signs create a silent power war — pick your battles carefully' },
    { label: 'Credit Stealing Risk', explanation: 'Rahu in your 10th shows someone taking your achievements — document everything' },
    ...flags.filter(f => f.type === 'red'),
  ].slice(0, 3);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(251,146,60,0.04)', border: '1px solid rgba(251,146,60,0.18)' }}
    >
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <Briefcase className="w-4 h-4" style={{ color: ORANGE }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${ORANGE}99` }}>
          Toxic Boss Radar — Sun vs Saturn
        </p>
      </div>

      <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(34,197,94,0.7)' }}>
            Green Signals
          </p>
          {greenFlags.map((f, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-emerald-400 leading-tight mb-0.5">{f.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,77,77,0.7)' }}>
            Red Signals
          </p>
          {redFlags.map((f, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.12)' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400" />
                <div>
                  <p className="text-xs font-bold text-red-400 leading-tight mb-0.5">{f.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DardEngine({ generation, name, onAnalyze, analysis, loading, unlockedTiers, onUnlock }: Props) {
  const [selected, setSelected] = useState<LifeSegment | null>(null);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerData, setPartnerData] = useState<PartnerFormData | null>(null);
  const segments = SEGMENT_MAP[generation];

  function handleClick(seg: LifeSegment) {
    setSelected(seg);
    if (DUAL_SEGMENTS.has(seg.id)) {
      setShowPartnerForm(true);
    } else {
      setShowPartnerForm(false);
      setPartnerData(null);
      onAnalyze(seg);
    }
  }

  function handleReset() {
    setSelected(null);
    setShowPartnerForm(false);
    setPartnerData(null);
  }

  async function handlePartnerSubmit(pd: PartnerFormData) {
    setPartnerData(pd);
    if (selected) await onAnalyze(selected, pd);
  }

  const isDualSegment = selected && DUAL_SEGMENTS.has(selected.id);
  const isExBack      = selected?.id === 'ex_back';
  const isToxicBoss   = selected?.id === 'toxic_boss';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(6,10,24,0.95)',
        border: `1px solid ${GOLD_RGBA(0.12)}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: CRIMSON }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: `${GOLD}80` }}>
              The Dard Engine
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(220,38,38,0.15)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.3)' }}
            >
              {GEN_LABELS[generation]}
            </span>
          </div>
          {analysis && (
            <button
              onClick={handleReset}
              type="button"
              className="flex items-center gap-1 text-xs transition-colors duration-200"
              style={{ color: 'rgba(148,163,184,0.5)' }}
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
        <h3 className="text-base font-semibold text-white mb-1">
          What&apos;s on your mind, <span style={{ color: GOLD }}>{name.split(' ')[0]}</span>?
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Tap the question that&apos;s been living rent-free in your head — Trikal Guru will read your chart specifically for it.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {segments.map((seg) => {
            const Icon = seg.icon;
            const isSelected = selected?.id === seg.id;
            const isDual = DUAL_SEGMENTS.has(seg.id);
            return (
              <button
                key={seg.id}
                onClick={() => handleClick(seg)}
                disabled={loading && isSelected}
                className="relative text-left rounded-xl p-4 transition-all duration-200 group"
                style={{
                  background: isSelected ? `${seg.color}12` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSelected ? seg.color + '40' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isSelected ? `0 4px 20px ${seg.color}20` : 'none',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${seg.color}15`, border: `1px solid ${seg.color}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: seg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-semibold text-white leading-tight">{seg.label}</p>
                      {isDual && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                          style={{ background: `${seg.color}15`, color: seg.color, border: `1px solid ${seg.color}30` }}
                        >
                          Dual Chart
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>{seg.description}</p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{ color: isSelected ? seg.color : 'rgba(148,163,184,0.3)' }}
                  />
                </div>
                {isSelected && loading && (
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ background: `${seg.color}08` }}>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: seg.color }} />
                      <span className="text-xs font-medium" style={{ color: seg.color }}>
                        {isToxicBoss
                          ? 'Analyzing Boss karma...'
                          : isExBack
                          ? 'Running Closure Algorithm...'
                          : 'Guru is reading both charts...'}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {isDualSegment && showPartnerForm && !analysis && (
          <div
            className="mt-5 rounded-xl p-4"
            style={{
              background: `${isToxicBoss ? ORANGE : isExBack ? PINK : GOLD}08`,
              border: `1px solid ${isToxicBoss ? ORANGE : isExBack ? PINK : GOLD}20`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              {isToxicBoss ? (
                <Briefcase className="w-4 h-4" style={{ color: ORANGE }} />
              ) : isExBack ? (
                <HeartCrack className="w-4 h-4" style={{ color: PINK }} />
              ) : (
                <Heart className="w-4 h-4" style={{ color: GOLD }} />
              )}
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: isToxicBoss ? ORANGE : isExBack ? PINK : GOLD }}
              >
                {isToxicBoss ? "Enter Boss Details" : isExBack ? "Enter Their Details" : "Partner's Details"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-0">
              {isToxicBoss
                ? "Trikal Guru will analyze Sun–Saturn authority axis & workplace power dynamics."
                : isExBack
                ? "Trikal Guru will run the Karmic Closure Algorithm on Venus-Ketu axis & 7th house."
                : "Both charts will be compared using Ashta-Koota Vedic matching."}
            </p>
            <DualPartnerForm
              userName={name}
              mode={isToxicBoss ? 'toxic_boss' : isExBack ? 'ex_back' : 'compatibility'}
              loading={loading}
              onSubmit={handlePartnerSubmit}
            />
          </div>
        )}
      </div>

      {analysis && !loading && selected && (
        <AnalysisPanel
          analysis={analysis}
          segment={selected}
          name={name}
          partnerName={partnerData?.name}
          unlockedTiers={unlockedTiers}
          onUnlock={onUnlock}
        />
      )}
    </div>
  );
}

function AnalysisPanel({
  analysis,
  segment,
  name,
  partnerName,
  unlockedTiers,
  onUnlock,
}: {
  analysis: SegmentAnalysis;
  segment: LifeSegment;
  name: string;
  partnerName?: string;
  unlockedTiers?: Set<string>;
  onUnlock?: (id: string) => void;
}) {
  const whatsappUrl   = `https://wa.me/?text=${encodeURIComponent(analysis.whatsappText)}`;
  const isDual        = DUAL_SEGMENTS.has(segment.id);
  const isExBack      = segment.id === 'ex_back';
  const isToxicBoss   = segment.id === 'toxic_boss';
  const hasFlags      = Array.isArray(analysis.flags) && analysis.flags.length > 0;
  const showFlagTeaser= isDual && !unlockedTiers?.has('addon_redflag');

  return (
    <div className="border-t p-5 space-y-4" style={{ borderColor: `${segment.color}20` }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: segment.color }} />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: `${segment.color}80` }}>
          Trikal Guru on: {segment.label}
        </span>
      </div>

      {/* Dual-chart person pair header */}
      {isDual && partnerName && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: `${segment.color}08`, border: `1px solid ${segment.color}18` }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-center flex-shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-1"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.22)' }}
              >
                <span className="text-xs font-bold text-yellow-300">{name[0]}</span>
              </div>
              <p className="text-xs text-white font-medium leading-none">
                {isToxicBoss ? 'You' : name.split(' ')[0]}
              </p>
            </div>
            <div className="flex-1 h-px" style={{ background: `${segment.color}30` }} />
            {isToxicBoss ? (
              <Briefcase className="w-5 h-5 flex-shrink-0" style={{ color: segment.color }} />
            ) : isExBack ? (
              <HeartCrack className="w-5 h-5 flex-shrink-0" style={{ color: segment.color }} />
            ) : (
              <Heart className="w-5 h-5 flex-shrink-0" style={{ color: segment.color }} />
            )}
            <div className="flex-1 h-px" style={{ background: `${segment.color}30` }} />
            <div className="text-center flex-shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-1"
                style={{ background: `${segment.color}12`, border: `1px solid ${segment.color}22` }}
              >
                <span className="text-xs font-bold" style={{ color: segment.color }}>{partnerName[0]}</span>
              </div>
              <p className="text-xs text-white font-medium leading-none">
                {isToxicBoss ? 'Boss' : partnerName.split(' ')[0]}
              </p>
            </div>
          </div>
          {isExBack && analysis.reunionProbability !== undefined && (
            <div className="flex flex-col items-center ml-2 flex-shrink-0">
              <span className="text-2xl font-black" style={{ color: segment.color }}>{analysis.reunionProbability}%</span>
              <span className="text-xs text-slate-500 leading-none">Reunion</span>
            </div>
          )}
        </div>
      )}

      {/* Closure Algorithm Verdict — Ex-Back only */}
      {isExBack && analysis.closureVerdict && (
        <ClosureVerdict
          verdict={analysis.closureVerdict}
          reunionProbability={analysis.reunionProbability}
          reunionMonth={analysis.reunionMonth}
          name={name}
        />
      )}

      {/* Toxic Boss Radar — dedicated flag grid */}
      {isToxicBoss && (
        <ToxicBossRadar flags={analysis.flags ?? []} />
      )}

      {/* Dual Chart Vibe Meters */}
      {isDual && analysis.vibeMeters && (
        <div className="rounded-xl p-4" style={{ background: `${segment.color}06`, border: `1px solid ${segment.color}15` }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: `${segment.color}80` }}>
            {isToxicBoss ? 'Workplace Energy Meters' : 'Dual Chart Vibe Meters'}
          </p>
          <div className="space-y-2.5">
            {(isToxicBoss ? [
              { label: 'Authority Clash', score: analysis.vibeMeters.energy,  color: '#FB923C' },
              { label: 'Loyalty Score',   score: analysis.vibeMeters.loyalty, color: '#22C55E' },
              { label: 'Burn-out Risk',   score: analysis.vibeMeters.passion, color: '#F87171' },
            ] : [
              { label: 'Energy Sync',   score: analysis.vibeMeters.energy,  color: '#F472B6' },
              { label: 'Loyalty Bond',  score: analysis.vibeMeters.loyalty, color: '#22C55E' },
              { label: 'Passion Fire',  score: analysis.vibeMeters.passion, color: '#F59E0B' },
            ]).map(({ label, score, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-24 flex-shrink-0">{label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)` }}
                  />
                </div>
                <span className="text-xs font-semibold w-8 text-right flex-shrink-0" style={{ color }}>{score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The Insight */}
      <div
        className="rounded-xl p-4"
        style={{ background: `${segment.color}08`, border: `1px solid ${segment.color}20` }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: `${segment.color}70` }}>
          The Insight
        </p>
        <p className="text-sm text-slate-200 leading-relaxed">{analysis.insight}</p>
      </div>

      {/* The Timeline */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
          The Timeline
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(212,175,55,0.85)' }}>{analysis.timeline}</p>
      </div>

      {/* Standard Flag Dashboard — non-ToxicBoss dual segments */}
      {hasFlags && !isToxicBoss && (
        <FlagDashboard
          flags={analysis.flags!}
          showUnlockTeaser={showFlagTeaser}
          onUnlock={() => onUnlock?.('addon_redflag')}
          userName={name}
          partnerName={partnerName || 'Partner'}
          isExBack={isExBack}
        />
      )}

      {/* Upay */}
      {analysis.upay.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.18)' }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-emerald-400/70">
            The Upay (Remedy)
          </p>
          <ul className="space-y-2">
            {analysis.upay.map((u, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#4ADE80' }}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-slate-300 leading-relaxed">{u}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-center" style={{ color: GOLD_RGBA(0.35) }}>
        Vedic insight verified by{' '}
        <span className="font-semibold" style={{ color: GOLD_RGBA(0.65) }}>Rohiit Gupta</span>
        , Chief Vedic Architect.
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full h-12 rounded-xl text-sm font-bold transition-all duration-200 relative overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
        }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)' }} />
        <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="relative z-10">Share This on WhatsApp</span>
      </a>
    </div>
  );
}
