/**
 * ============================================================
 * TRIKAL VAANI — Prediction Display Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/result/PredictionDisplay.tsx
 * VERSION: 1.0 — Swiss Ephemeris + Gemini 2.5 Flash Output
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * RENDERS:
 *   1. Kundali Summary Card (KundaliDisplay)
 *   2. Jini Plain Language Prediction (simpleSummary)
 *   3. Key Influences (keyInfluences) with classical citations
 *   4. Planet Positions Table (from kundali._meta)
 *   5. Vimshottari Dasha Table (VimshottariDashaTable)
 *   6. Action Windows (paid only — blurred free)
 *   7. Avoid Windows (paid only — blurred free)
 *   8. Remedies (paid only — blurred free)
 *   9. Yogas Found (paid only)
 *  10. Upgrade CTA (free tier only)
 *
 * DATA SOURCE:
 *   prediction — full Gemini JSON from /api/predict
 *   kundali    — from prediction._meta.kundali
 *   grahas     — from prediction._meta.grahas (Swiss API)
 *   dasha      — from calcDasha() via swiss-ephemeris.ts
 * ============================================================
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Lock, Sparkles, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertTriangle, Star,
  Calendar, Shield, TrendingUp, Zap
} from 'lucide-react';
import KundaliDisplay from '@/components/result/KundaliDisplay';
import VimshottariDashaTable from '@/components/result/VimshottariDashaTable';
import type { DashaPeriod } from '@/lib/vedic-astro';

// ── Constants ──────────────────────────────────────────────────────────────────

const GOLD      = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const PLANET_COLORS: Record<string, string> = {
  Sun: '#FB923C', Moon: '#C4B5FD', Mars: '#F87171',
  Mercury: '#6EE7B7', Jupiter: '#FCD34D', Venus: '#F9A8D4',
  Saturn: '#94A3B8', Rahu: '#A78BFA', Ketu: '#FCA5A5',
};

// Dasha quality map for VimshottariDashaTable
const DASHA_QUALITY_MAP: Record<string, DashaPeriod['quality']> = {
  Sun: 'testing', Moon: 'good', Mars: 'testing',
  Mercury: 'good', Jupiter: 'excellent', Venus: 'excellent',
  Saturn: 'moderate', Rahu: 'testing', Ketu: 'moderate',
};

const DASHA_THEME_MAP: Record<string, string> = {
  Sun:     'Authority, father, career clarity',
  Moon:    'Emotions, home, mother, peace',
  Mars:    'Action, property, courage, conflict',
  Mercury: 'Business, communication, skills',
  Jupiter: 'Wisdom, children, wealth expansion',
  Venus:   'Relationships, luxury, creativity',
  Saturn:  'Karma, discipline, delays, longevity',
  Rahu:    'Obsession, foreign, sudden change',
  Ketu:    'Detachment, moksha, past karma',
};

const VIMSHOTTARI_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

const DASHA_SEQUENCE = [
  'Ketu','Venus','Sun','Moon','Mars',
  'Rahu','Jupiter','Saturn','Mercury'
];

// ── Types ──────────────────────────────────────────────────────────────────────

interface KeyInfluence {
  planet: string;
  position: string;
  effect: string;
  classicalBasis: string;
  strength?: number;
  isRetrograde?: boolean;
}

interface ActionWindow {
  dateRange: string;
  action: string;
  planetaryBasis: string;
  quality: 'peak' | 'favorable' | 'moderate';
}

interface AvoidWindow {
  dateRange: string;
  reason: string;
  whatToAvoid: string;
}

interface Remedy {
  remedy: string;
  classicalBasis: string;
  effort: 'easy' | 'moderate' | 'intensive';
  timing: string;
  purpose: string;
}

interface YogaFound {
  name: string;
  planets: string[];
  present: boolean;
  effect: string;
  classicalBasis: string;
}

interface SimpleSummary {
  text: string;
  keyMessage: string;
  bestDates?: string;
  mainAction: string;
  mainCaution: string;
}

interface Professional {
  domainId: string;
  personName: string;
  analysisDate: string;
  headline: string;
  periodSummary: string;
  keyInfluences: KeyInfluence[];
  yogasFound?: YogaFound[];
  actionWindows?: ActionWindow[];
  avoidWindows?: AvoidWindow[];
  remedies?: Remedy[];
  confidenceLevel: 'high' | 'medium' | 'low';
  confidenceReason: string;
  jinaGuidance?: string;
  locked?: { message: string; upgradeUrl: string };
}

interface PredictionMeta {
  domainId: string;
  tier: 'free' | 'basic' | 'pro' | 'premium';
  chartSource: string;
  model: string;
  processingMs: number;
  kundali: {
    lagna: string;
    nakshatra: string;
    mahadasha: string;
    antardasha: string;
  };
}

interface PredictionData {
  simpleSummary: SimpleSummary;
  professional: Professional;
  _meta: PredictionMeta;
}

// Graha shape from Swiss API (via route.ts adapter)
interface GrahaData {
  planet: string;
  sign: string;
  sign_en: string;
  degree_in_sign: number;
  nakshatra: string;
  nakshatra_lord: string;
  pada: number;
  retrograde: boolean;
  house: number;
  sign_lord: string;
}

interface PredictionDisplayProps {
  prediction:   PredictionData;
  grahas?:      GrahaData[];       // from Swiss API rawChart
  dashaData?:   any;               // from calcDasha()
  birthData: {
    name:     string;
    dob:      string;
    cityName: string;
    tob:      string;
  };
  // Panchang from KundaliData
  panchang?: {
    vara: string; tithi: string; yoga: string; nakshatra: string;
    sunrise: string; sunset: string;
    rahuKaal: { start: string; end: string };
    abhijeetMuhurta: { start: string; end: string };
    choghadiya: { name: string; type: 'Good' | 'Bad' | 'Neutral' };
  };
}

// ── Dasha Adapter ──────────────────────────────────────────────────────────────
// Converts calcDasha() output → DashaPeriod[] for VimshottariDashaTable

function buildDashaPeriods(
  mahadasha: string,
  dob: string,
): DashaPeriod[] {
  const dobDate = new Date(dob);
  const birthYear = dobDate.getFullYear();
  const startIdx = DASHA_SEQUENCE.indexOf(mahadasha);
  if (startIdx === -1) return [];

  const periods: DashaPeriod[] = [];
  let cursor = birthYear;

  for (let cycle = 0; cycle < 2; cycle++) {
    for (let i = 0; i < 9; i++) {
      const planet = DASHA_SEQUENCE[(startIdx + i) % 9]!;
      const years  = VIMSHOTTARI_YEARS[planet] ?? 7;
      periods.push({
        planet,
        startYear: Math.round(cursor),
        endYear:   Math.round(cursor + years),
        quality:   DASHA_QUALITY_MAP[planet] ?? 'moderate',
        theme:     DASHA_THEME_MAP[planet]   ?? '',
      });
      cursor += years;
      if (cursor > birthYear + 120) break;
    }
  }
  return periods;
}

// ── Planet → KundaliDisplay Planet shape ──────────────────────────────────────

function adaptGrahasToKundali(grahas: GrahaData[]) {
  return grahas.map(g => ({
    name:        g.planet,
    rashi:       g.sign      ?? g.sign_en ?? 'Unknown',
    house:       g.house     ?? 1,
    strength:    computeStrengthSimple(g.planet, g.sign, g.retrograde),
    isRetrograde: g.retrograde ?? (g.planet === 'Rahu' || g.planet === 'Ketu'),
    nakshatra:   g.nakshatra ?? 'Unknown',
    degree:      g.degree_in_sign ?? 0,
  }));
}

function computeStrengthSimple(planet: string, sign: string, retro: boolean): number {
  const EXALT: Record<string,string> = {
    Sun:'Mesh', Moon:'Vrishabh', Mars:'Makar', Mercury:'Kanya',
    Jupiter:'Kark', Venus:'Meen', Saturn:'Tula',
  };
  const DEBIL: Record<string,string> = {
    Sun:'Tula', Moon:'Vrischik', Mars:'Kark', Mercury:'Meen',
    Jupiter:'Makar', Venus:'Kanya', Saturn:'Mesh',
  };
  let s = 50;
  if (EXALT[planet] === sign) s += 30;
  if (DEBIL[planet]  === sign) s -= 25;
  if (retro && planet !== 'Rahu' && planet !== 'Ketu') s += 8;
  return Math.min(100, Math.max(5, s));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, color = GOLD }: {
  icon: React.ElementType; title: string; subtitle?: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Card({ children, highlight = false, className = '' }: {
  children: React.ReactNode; highlight?: boolean; className?: string;
}) {
  return (
    <div className={`rounded-2xl p-6 ${className}`} style={{
      background:     highlight ? 'rgba(212,175,55,0.05)' : 'rgba(6,12,28,0.95)',
      border:         `1px solid ${highlight ? GOLD_RGBA(0.25) : 'rgba(255,255,255,0.07)'}`,
      backdropFilter: 'blur(12px)',
      boxShadow:      highlight ? `0 0 40px ${GOLD_RGBA(0.08)}` : 'none',
    }}>
      {children}
    </div>
  );
}

function LockedSection({ message, upgradeUrl }: { message: string; upgradeUrl: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred preview */}
      <div className="filter blur-sm pointer-events-none select-none p-6"
        style={{ background: 'rgba(6,12,28,0.95)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="space-y-3">
          {[120, 90, 110, 80].map((w, i) => (
            <div key={i} className="h-3 rounded-full" style={{
              width: `${w}%`, background: 'rgba(255,255,255,0.06)',
            }} />
          ))}
        </div>
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: 'rgba(6,12,28,0.85)', backdropFilter: 'blur(4px)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
          style={{ background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.3)}` }}>
          <Lock className="w-4 h-4" style={{ color: GOLD }} />
        </div>
        <p className="text-xs text-slate-400 text-center mb-3 max-w-xs px-4">{message}</p>
        <Link href={upgradeUrl}
          className="px-5 py-2.5 rounded-full text-xs font-bold transition-all"
          style={{
            background: `linear-gradient(135deg, ${GOLD}, #F5D76E)`,
            color: '#080B12',
            boxShadow: `0 0 20px ${GOLD_RGBA(0.3)}`,
          }}>
          Upgrade — ₹51/month
        </Link>
      </div>
    </div>
  );
}

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const map = {
    high:   { color: '#4ADE80', label: 'High Confidence', bg: 'rgba(74,222,128,0.1)' },
    medium: { color: GOLD,      label: 'Medium Confidence', bg: GOLD_RGBA(0.1) },
    low:    { color: '#FB923C', label: 'Low Confidence (birth time unknown)', bg: 'rgba(251,146,60,0.1)' },
  };
  const s = map[level];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
      <Shield className="w-3 h-3" />
      {s.label}
    </span>
  );
}

function QualityBadge({ quality }: { quality: 'peak' | 'favorable' | 'moderate' }) {
  const map = {
    peak:      { color: '#4ADE80', label: '⚡ Peak' },
    favorable: { color: GOLD,      label: '✨ Favorable' },
    moderate:  { color: '#94A3B8', label: '〜 Moderate' },
  };
  const s = map[quality];
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
      {s.label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PredictionDisplay({
  prediction, grahas = [], dashaData, birthData, panchang,
}: PredictionDisplayProps) {
  const [showAllInfluences, setShowAllInfluences] = useState(false);

  const { simpleSummary, professional, _meta } = prediction;
  const tier     = _meta?.tier ?? 'free';
  const isPaid   = tier !== 'free';
  const kundali  = _meta?.kundali;

  // Build planet list for KundaliDisplay
  const planets = grahas.length > 0
    ? adaptGrahasToKundali(grahas)
    : [];

  // Build dasha periods for VimshottariDashaTable
  const dashaPeriods = buildDashaPeriods(
    kundali?.mahadasha ?? 'Jupiter',
    birthData.dob,
  );

  // Panchang fallback
  const panch = panchang ?? {
    vara: '', tithi: '', yoga: '',
    nakshatra: kundali?.nakshatra ?? '',
    sunrise: '', sunset: '',
    rahuKaal: { start: '', end: '' },
    abhijeetMuhurta: { start: '', end: '' },
    choghadiya: { name: '', type: 'Neutral' as const },
  };

  const keyInfluences = professional?.keyInfluences ?? [];
  const displayedInfluences = showAllInfluences
    ? keyInfluences
    : keyInfluences.slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* ══════════════════════════════════════════════════
          SECTION 1 — KUNDALI DISPLAY
          Lagna · Nakshatra · Mahadasha · Panchang
      ══════════════════════════════════════════════════ */}
      {kundali && (
        <KundaliDisplay
          name={birthData.name}
          dob={birthData.dob}
          city={birthData.cityName}
          lagna={kundali.lagna}
          lagnaLord={professional?.keyInfluences?.[0]?.planet ?? ''}
          nakshatra={kundali.nakshatra}
          nakshatraLord={''}
          mahadasha={kundali.mahadasha}
          antardasha={kundali.antardasha}
          dashaBalance={`${kundali.mahadasha} Mahadasha chal rahi hai`}
          choghadiya={panch.choghadiya.name}
          choghadiyaType={panch.choghadiya.type}
          tithi={panch.tithi}
          vara={panch.vara}
          yoga={panch.yoga}
          rahuStart={panch.rahuKaal.start}
          rahuEnd={panch.rahuKaal.end}
          abhijeetStart={panch.abhijeetMuhurta.start}
          abhijeetEnd={panch.abhijeetMuhurta.end}
          planets={planets}
        />
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 2 — JINI PLAIN LANGUAGE PREDICTION
          The USP — what users love about Trikal Vaani
      ══════════════════════════════════════════════════ */}
      <Card highlight>
        <SectionHeader icon={Sparkles} title="Jini ka Analysis" subtitle="Plain language — zero jargon" />

        {/* Headline */}
        {professional?.headline && (
          <div className="mb-4 pb-4" style={{ borderBottom: `1px solid ${GOLD_RGBA(0.1)}` }}>
            <p className="text-base font-semibold leading-snug" style={{ color: GOLD }}>
              {professional.headline}
            </p>
          </div>
        )}

        {/* Main summary text */}
        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          {simpleSummary?.text}
        </p>

        {/* Key message */}
        {simpleSummary?.keyMessage && (
          <div className="mb-3 px-4 py-3 rounded-xl"
            style={{ background: GOLD_RGBA(0.07), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-xs font-semibold mb-1" style={{ color: GOLD }}>
              🔑 Key Message
            </p>
            <p className="text-sm text-white font-medium">{simpleSummary.keyMessage}</p>
          </div>
        )}

        {/* Best dates — paid only */}
        {isPaid && simpleSummary?.bestDates && (
          <div className="mb-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <p className="text-xs font-semibold mb-1 text-blue-400">📅 Best Dates</p>
            <p className="text-sm text-slate-300">{simpleSummary.bestDates}</p>
          </div>
        )}

        {/* Do / Avoid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {simpleSummary?.mainAction && (
            <div className="px-4 py-3 rounded-xl"
              style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <p className="text-xs font-semibold mb-1 text-green-400">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                Do This
              </p>
              <p className="text-sm text-slate-300">{simpleSummary.mainAction}</p>
            </div>
          )}
          {simpleSummary?.mainCaution && (
            <div className="px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs font-semibold mb-1 text-red-400">
                <XCircle className="w-3 h-3 inline mr-1" />
                Avoid This
              </p>
              <p className="text-sm text-slate-300">{simpleSummary.mainCaution}</p>
            </div>
          )}
        </div>

        {/* Confidence + period summary */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <ConfidenceBadge level={professional?.confidenceLevel ?? 'high'} />
          <span className="text-xs text-slate-600">
            Swiss Ephemeris · {_meta?.model ?? 'Gemini 2.5 Flash'}
          </span>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — PERIOD SUMMARY
      ══════════════════════════════════════════════════ */}
      {professional?.periodSummary && (
        <Card>
          <SectionHeader icon={Calendar} title="Current Dasha Period" subtitle="Your cosmic timing window" />
          <p className="text-sm text-slate-300 leading-relaxed">
            {professional.periodSummary}
          </p>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 4 — KEY INFLUENCES
          Planet cards with classical citations
      ══════════════════════════════════════════════════ */}
      {keyInfluences.length > 0 && (
        <Card>
          <SectionHeader
            icon={Star}
            title="Key Planetary Influences"
            subtitle="Classical BPHS analysis"
          />
          <div className="space-y-4">
            {displayedInfluences.map((inf, i) => {
              const color = PLANET_COLORS[inf.planet] ?? GOLD;
              return (
                <div key={i} className="rounded-xl p-4"
                  style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{
                        background: color,
                        boxShadow: `0 0 8px ${color}`,
                      }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold" style={{ color }}>
                          {inf.planet}
                        </span>
                        <span className="text-xs text-slate-500">{inf.position}</span>
                        {inf.isRetrograde && (
                          <span className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}>
                            ℞ Vakri
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed mb-2">
                        {inf.effect}
                      </p>
                      <p className="text-xs text-slate-500 italic">
                        📖 {inf.classicalBasis}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more — only if paid and more than 2 */}
          {isPaid && keyInfluences.length > 2 && (
            <button
              onClick={() => setShowAllInfluences(!showAllInfluences)}
              className="mt-4 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              style={{ background: GOLD_RGBA(0.06), color: GOLD, border: `1px solid ${GOLD_RGBA(0.15)}` }}>
              {showAllInfluences ? (
                <><ChevronUp className="w-3 h-3" /> Show Less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> Show All {keyInfluences.length} Influences</>
              )}
            </button>
          )}

          {/* Lock for free — only show 2 */}
          {!isPaid && keyInfluences.length > 2 && (
            <div className="mt-3 px-4 py-2.5 rounded-xl text-center text-xs text-slate-500"
              style={{ background: GOLD_RGBA(0.04), border: `1px solid ${GOLD_RGBA(0.1)}` }}>
              +{keyInfluences.length - 2} more influences unlocked at ₹51
            </div>
          )}
        </Card>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 5 — VIMSHOTTARI DASHA TABLE
      ══════════════════════════════════════════════════ */}
      {dashaPeriods.length > 0 && (
        <VimshottariDashaTable
          dashaPeriods={dashaPeriods}
          currentYear={new Date().getFullYear()}
          name={birthData.name}
        />
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 6 — ACTION WINDOWS (paid only)
      ══════════════════════════════════════════════════ */}
      {isPaid && (professional?.actionWindows?.length ?? 0) > 0 ? (
        <Card>
          <SectionHeader
            icon={TrendingUp}
            title="Shubh Action Windows"
            subtitle="Exact dates — when to move"
            color="#4ADE80"
          />
          <div className="space-y-3">
            {professional!.actionWindows!.map((w, i) => (
              <div key={i} className="rounded-xl p-4"
                style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-green-400">📅 {w.dateRange}</span>
                  <QualityBadge quality={w.quality} />
                </div>
                <p className="text-sm text-slate-300 mb-1">{w.action}</p>
                <p className="text-xs text-slate-500 italic">{w.planetaryBasis}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : !isPaid ? (
        <LockedSection
          message="Unlock exact action dates — when to take major decisions, sign deals, start ventures"
          upgradeUrl="/pricing"
        />
      ) : null}

      {/* ══════════════════════════════════════════════════
          SECTION 7 — AVOID WINDOWS (paid only)
      ══════════════════════════════════════════════════ */}
      {isPaid && (professional?.avoidWindows?.length ?? 0) > 0 ? (
        <Card>
          <SectionHeader
            icon={AlertTriangle}
            title="Avoid Windows"
            subtitle="When to wait — protect your karma"
            color="#FB923C"
          />
          <div className="space-y-3">
            {professional!.avoidWindows!.map((w, i) => (
              <div key={i} className="rounded-xl p-4"
                style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <span className="text-xs font-bold text-red-400 block mb-1">⚠️ {w.dateRange}</span>
                <p className="text-sm text-slate-300 mb-1">{w.reason}</p>
                <p className="text-xs text-red-400/70">{w.whatToAvoid}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : !isPaid ? (
        <LockedSection
          message="Know when NOT to act — avoid losses, delays, and karmic pitfalls with exact dates"
          upgradeUrl="/pricing"
        />
      ) : null}

      {/* ══════════════════════════════════════════════════
          SECTION 8 — YOGAS FOUND (paid only)
      ══════════════════════════════════════════════════ */}
      {isPaid && (professional?.yogasFound?.filter(y => y.present).length ?? 0) > 0 && (
        <Card>
          <SectionHeader icon={Zap} title="Yoga Detection" subtitle="BPHS classical Yoga analysis" color="#A78BFA" />
          <div className="space-y-3">
            {professional!.yogasFound!.filter(y => y.present).map((y, i) => (
              <div key={i} className="rounded-xl p-4"
                style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-purple-400">✦ {y.name}</span>
                  <span className="text-xs text-slate-500">
                    {y.planets.join(' + ')}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-1">{y.effect}</p>
                <p className="text-xs text-slate-500 italic">📖 {y.classicalBasis}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 9 — REMEDIES (paid only)
      ══════════════════════════════════════════════════ */}
      {isPaid && (professional?.remedies?.length ?? 0) > 0 ? (
        <Card>
          <SectionHeader icon={Shield} title="Classical Remedies" subtitle="Parashara BPHS — tested by time" color={GOLD} />
          <div className="space-y-3">
            {professional!.remedies!.map((r, i) => (
              <div key={i} className="rounded-xl p-4"
                style={{ background: GOLD_RGBA(0.04), border: `1px solid ${GOLD_RGBA(0.15)}` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: GOLD }}>🕯 Remedy {i + 1}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: r.effort === 'easy' ? 'rgba(74,222,128,0.1)' : r.effort === 'moderate' ? GOLD_RGBA(0.1) : 'rgba(239,68,68,0.1)',
                      color: r.effort === 'easy' ? '#4ADE80' : r.effort === 'moderate' ? GOLD : '#F87171',
                    }}>
                    {r.effort}
                  </span>
                </div>
                <p className="text-sm text-white font-medium mb-1">{r.remedy}</p>
                <p className="text-xs text-slate-400 mb-1">⏰ {r.timing}</p>
                <p className="text-xs text-slate-500 mb-1">🎯 {r.purpose}</p>
                <p className="text-xs text-slate-600 italic">📖 {r.classicalBasis}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : !isPaid ? (
        <LockedSection
          message="Unlock Parashara classical remedies — specific mantras, gemstones, and rituals for your chart"
          upgradeUrl="/pricing"
        />
      ) : null}

      {/* ══════════════════════════════════════════════════
          SECTION 10 — UPGRADE CTA (free only)
      ══════════════════════════════════════════════════ */}
      {!isPaid && (
        <div className="rounded-2xl p-6 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(6,12,28,0.95) 100%)',
            border: `1px solid ${GOLD_RGBA(0.25)}`,
            boxShadow: `0 0 40px ${GOLD_RGBA(0.08)}`,
          }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.3)}` }}>
            <Sparkles className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {professional?.locked?.message ?? 'Gehri jaankari ke liye upgrade karein'}
          </h3>
          <p className="text-sm text-slate-400 mb-5 max-w-sm mx-auto">
            Action windows, avoid dates, classical remedies, yoga detection — sab ₹51/month mein
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing"
              className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: `linear-gradient(135deg, ${GOLD}, #F5D76E)`,
                color: '#080B12',
                boxShadow: `0 0 20px ${GOLD_RGBA(0.3)}`,
              }}>
              Upgrade — ₹51/month
            </Link>
            <Link href="/"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Try Another Domain
            </Link>
          </div>
          <p className="text-xs text-slate-600 mt-4">
            Powered by Swiss Ephemeris · Parashara BPHS · Rohiit Gupta, Chief Vedic Architect
          </p>
        </div>
      )}

    </div>
  );
}
