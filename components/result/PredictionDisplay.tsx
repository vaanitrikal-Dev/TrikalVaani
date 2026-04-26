/**
 * ============================================================
 * TRIKAL VAANI — Prediction Display Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/result/PredictionDisplay.tsx
 * VERSION: 1.0-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   Renders the two-layer prediction output from /api/predict:
 *   Layer 1 — simpleSummary (plain language, everyone understands)
 *   Layer 2 — professional (full structured analysis, paid tiers)
 *
 *   Called from app/result/page.tsx
 *   Fetches prediction from Supabase by predictionId or sessionId+domainId
 * ============================================================
 */

'use client';

import { useEffect, useState } from 'react';
import {
  getPredictionById,
  getPredictionBySession,
  type PredictionRecord,
} from '@/lib/supabase';
import {
  Sparkles, Brain, Calendar, AlertTriangle,
  CheckCircle, ChevronDown, ChevronUp, Loader2,
  BookOpen, Target, Shield, TrendingUp,
} from 'lucide-react';

const GOLD      = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface SimpleSummary {
  text:        string;
  keyMessage:  string;
  bestDates?:  string;
  mainAction?: string;
  mainCaution?:string;
}

interface KeyInfluence {
  planet:         string;
  position:       string;
  effect:         string;
  classicalBasis: string;
  strength?:      number;
  isRetrograde?:  boolean;
}

interface ActionWindow {
  dateRange:      string;
  action:         string;
  planetaryBasis: string;
  quality:        'peak' | 'favorable' | 'moderate';
}

interface AvoidWindow {
  dateRange:   string;
  reason:      string;
  whatToAvoid: string;
}

interface Remedy {
  remedy:         string;
  classicalBasis: string;
  effort:         'easy' | 'moderate' | 'intensive';
  timing:         string;
  purpose:        string;
}

interface Professional {
  headline:       string;
  periodSummary:  string;
  keyInfluences:  KeyInfluence[];
  actionWindows:  ActionWindow[];
  avoidWindows:   AvoidWindow[];
  remedies:       Remedy[];
  jinaGuidance:   string;
  confidenceLevel:'high' | 'medium' | 'low';
  confidenceReason:string;
  worldContext?: {
    available: boolean;
    summary:   string | null;
    sources:   string[];
  };
  locked?: {
    message:    string;
    upgradeUrl: string;
  };
}

interface PredictionData {
  simpleSummary: SimpleSummary;
  professional:  Professional;
  _meta?: {
    tier:        string;
    domainId:    string;
    analysisDate:string;
  };
}

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface PredictionDisplayProps {
  predictionId?: string;   // from URL param
  sessionId?:    string;   // from URL param
  domainId?:     string;   // from URL param
}

// ─── CONFIDENCE BADGE ─────────────────────────────────────────────────────────
function ConfidenceBadge({ level }: { level: string }) {
  const config = {
    high:   { color: '#22C55E', label: 'High Confidence', bg: 'rgba(34,197,94,0.1)' },
    medium: { color: GOLD,      label: 'Medium Confidence', bg: GOLD_RGBA(0.1) },
    low:    { color: '#94A3B8', label: 'Approximate Analysis', bg: 'rgba(148,163,184,0.1)' },
  }[level] ?? { color: GOLD, label: 'Analysis Complete', bg: GOLD_RGBA(0.1) };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}
    >
      <CheckCircle className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─── QUALITY BADGE ────────────────────────────────────────────────────────────
function QualityBadge({ quality }: { quality: string }) {
  const config = {
    peak:      { color: '#22C55E', label: '✦ Peak Window' },
    favorable: { color: GOLD,      label: '✓ Favorable' },
    moderate:  { color: '#60A5FA', label: '◎ Moderate' },
  }[quality] ?? { color: GOLD, label: quality };

  return (
    <span className="text-xs font-bold" style={{ color: config.color }}>
      {config.label}
    </span>
  );
}

// ─── EFFORT BADGE ─────────────────────────────────────────────────────────────
function EffortBadge({ effort }: { effort: string }) {
  const config = {
    easy:      { color: '#22C55E', label: 'Easy' },
    moderate:  { color: GOLD,      label: 'Moderate' },
    intensive: { color: '#F472B6', label: 'Intensive' },
  }[effort] ?? { color: GOLD, label: effort };

  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: `${config.color}15`, color: config.color, border: `1px solid ${config.color}30` }}
    >
      {config.label}
    </span>
  );
}

// ─── SIMPLE SUMMARY LAYER ─────────────────────────────────────────────────────
function SimpleSummaryCard({ data, tier }: { data: SimpleSummary; tier: string }) {
  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{
        background:     'rgba(4,8,20,0.9)',
        border:         `1px solid ${GOLD_RGBA(0.2)}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.3)}` }}
          >
            <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD_RGBA(0.6) }}>
              Your Reading
            </p>
            <p className="text-xs text-slate-500">Plain language — easy to understand</p>
          </div>
        </div>
      </div>

      {/* Key message */}
      {data.keyMessage && (
        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}
        >
          <p className="text-sm font-semibold leading-relaxed" style={{ color: GOLD }}>
            ✦ {data.keyMessage}
          </p>
        </div>
      )}

      {/* Main text */}
      <div className="prose prose-sm max-w-none">
        {data.text.split('\n').filter(Boolean).map((para, i) => (
          <p key={i} className="text-sm text-slate-300 leading-relaxed mb-3">
            {para}
          </p>
        ))}
      </div>

      {/* Action + Caution grid */}
      {(data.mainAction || data.mainCaution) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {data.mainAction && (
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-bold text-green-400 uppercase tracking-wide">
                  Do This
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{data.mainAction}</p>
            </div>
          )}
          {data.mainCaution && (
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">
                  Avoid This
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{data.mainCaution}</p>
            </div>
          )}
        </div>
      )}

      {/* Best dates */}
      {data.bestDates && (
        <div
          className="mt-4 rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}
        >
          <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wide">
              Best Dates
            </p>
            <p className="text-xs text-slate-300">{data.bestDates}</p>
          </div>
        </div>
      )}

      {/* Free tier upgrade prompt */}
      {tier === 'free' && (
        <div
          className="mt-5 rounded-xl p-4 flex items-center justify-between gap-3"
          style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}
        >
          <div>
            <p className="text-xs font-bold" style={{ color: GOLD }}>
              Want the full deep analysis?
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              House positions, classical citations, action windows, remedies
            </p>
          </div>
          <a
            href="/pricing"
            className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: GOLD, color: '#020817' }}
          >
            Unlock ₹51 →
          </a>
        </div>
      )}
    </div>
  );
}

// ─── PROFESSIONAL LAYER ───────────────────────────────────────────────────────
function ProfessionalCard({ data, tier }: { data: Professional; tier: string }) {
  const [showRemedies, setShowRemedies]       = useState(false);
  const [showAvoidWindows, setShowAvoidWindows] = useState(false);

  // Free tier — show locked state
  if (data.locked) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(4,8,20,0.7)', border: `1px solid ${GOLD_RGBA(0.12)}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4" style={{ color: GOLD }} />
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD_RGBA(0.6) }}>
            Professional Analysis
          </p>
        </div>
        <div className="text-center py-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: GOLD_RGBA(0.1), border: `1px solid ${GOLD_RGBA(0.3)}` }}
          >
            <Shield className="w-6 h-6" style={{ color: GOLD }} />
          </div>
          <p className="text-sm font-semibold text-white mb-2">{data.locked.message}</p>
          <p className="text-xs text-slate-500 mb-4">
            House positions · Classical citations · Action windows · Remedies
          </p>
          <a
            href={data.locked.upgradeUrl}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #A8862A)`, color: '#020817' }}
          >
            <Sparkles className="w-4 h-4" />
            Unlock Full Analysis — ₹51
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${GOLD_RGBA(0.15)}` }}
    >
      {/* Header */}
      <div
        className="p-6"
        style={{
          background: `linear-gradient(135deg, rgba(4,8,20,0.95), rgba(10,15,30,0.95))`,
          borderBottom: `1px solid ${GOLD_RGBA(0.1)}`,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" style={{ color: GOLD }} />
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD_RGBA(0.6) }}>
              Professional Analysis
            </p>
          </div>
          <ConfidenceBadge level={data.confidenceLevel} />
        </div>

        {/* Headline */}
        <h3
          className="font-serif text-lg sm:text-xl font-bold leading-snug mb-3"
          style={{ color: GOLD }}
        >
          {data.headline}
        </h3>

        {/* Period summary */}
        <p className="text-sm text-slate-300 leading-relaxed">
          {data.periodSummary}
        </p>
      </div>

      {/* Key Influences */}
      {data.keyInfluences?.length > 0 && (
        <div
          className="p-6"
          style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}`, background: 'rgba(4,8,20,0.85)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: GOLD }} />
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD_RGBA(0.5) }}>
              Key Planetary Influences
            </p>
          </div>
          <div className="space-y-3">
            {data.keyInfluences.map((influence, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{ background: GOLD_RGBA(0.04), border: `1px solid ${GOLD_RGBA(0.1)}` }}
              >
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{influence.planet}</span>
                    {influence.isRetrograde && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,146,60,0.1)', color: '#FB923C' }}>
                        Vakri
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{influence.position}</span>
                  </div>
                  {influence.strength !== undefined && (
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: influence.strength >= 70 ? '#22C55E'
                             : influence.strength >= 45 ? GOLD
                             : '#F472B6'
                      }}
                    >
                      Strength: {influence.strength}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {influence.effect}
                </p>
                <div className="flex items-start gap-1.5">
                  <BookOpen className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: GOLD_RGBA(0.4) }} />
                  <p className="text-xs italic" style={{ color: GOLD_RGBA(0.5) }}>
                    {influence.classicalBasis}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Windows */}
      {data.actionWindows?.length > 0 && (
        <div
          className="p-6"
          style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}`, background: 'rgba(4,8,20,0.85)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-green-400" />
            <p className="text-xs font-bold tracking-widest uppercase text-green-400">
              Action Windows
            </p>
          </div>
          <div className="space-y-3">
            {data.actionWindows.map((window, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="text-xs font-bold text-green-400">{window.dateRange}</span>
                  <QualityBadge quality={window.quality} />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-1">{window.action}</p>
                <p className="text-xs text-slate-500">{window.planetaryBasis}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avoid Windows — collapsible */}
      {data.avoidWindows?.length > 0 && (
        <div
          className="p-6"
          style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}`, background: 'rgba(4,8,20,0.85)' }}
        >
          <button
            onClick={() => setShowAvoidWindows(!showAvoidWindows)}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <p className="text-xs font-bold tracking-widest uppercase text-orange-400">
                Avoid Windows ({data.avoidWindows.length})
              </p>
            </div>
            {showAvoidWindows
              ? <ChevronUp className="w-4 h-4 text-slate-500" />
              : <ChevronDown className="w-4 h-4 text-slate-500" />
            }
          </button>
          {showAvoidWindows && (
            <div className="space-y-3">
              {data.avoidWindows.map((window, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.15)' }}
                >
                  <span className="text-xs font-bold text-orange-400">{window.dateRange}</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1 mb-1">{window.whatToAvoid}</p>
                  <p className="text-xs text-slate-500">{window.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Remedies — collapsible */}
      {data.remedies?.length > 0 && (
        <div
          className="p-6"
          style={{ background: 'rgba(4,8,20,0.85)' }}
        >
          <button
            onClick={() => setShowRemedies(!showRemedies)}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: GOLD }} />
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD_RGBA(0.5) }}>
                Classical Remedies ({data.remedies.length})
              </p>
            </div>
            {showRemedies
              ? <ChevronUp className="w-4 h-4 text-slate-500" />
              : <ChevronDown className="w-4 h-4 text-slate-500" />
            }
          </button>
          {showRemedies && (
            <div className="space-y-3">
              {data.remedies.map((remedy, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: GOLD_RGBA(0.04), border: `1px solid ${GOLD_RGBA(0.12)}` }}
                >
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <EffortBadge effort={remedy.effort} />
                    <span className="text-xs text-slate-500">{remedy.timing}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{remedy.remedy}</p>
                  <p className="text-xs text-slate-500 mb-1">{remedy.purpose}</p>
                  <div className="flex items-start gap-1.5">
                    <BookOpen className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: GOLD_RGBA(0.4) }} />
                    <p className="text-xs italic" style={{ color: GOLD_RGBA(0.5) }}>
                      {remedy.classicalBasis}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* World context */}
      {data.worldContext?.available && data.worldContext.summary && (
        <div
          className="p-6"
          style={{ borderTop: `1px solid ${GOLD_RGBA(0.08)}`, background: 'rgba(4,8,20,0.85)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <p className="text-xs font-bold tracking-widest uppercase text-blue-400">
              World Context
            </p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.worldContext.summary}
          </p>
          {data.worldContext.sources?.length > 0 && (
            <p className="text-xs text-slate-600 mt-2">
              Sources: {data.worldContext.sources.join(' · ')}
            </p>
          )}
        </div>
      )}

      {/* Jini guidance */}
      {data.jinaGuidance && (
        <div
          className="p-4 m-4 rounded-xl"
          style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.15)}` }}
        >
          <p className="text-xs text-slate-400 leading-relaxed">
            🔮 <span style={{ color: GOLD }}>Jini says:</span> {data.jinaGuidance}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PredictionDisplay({
  predictionId,
  sessionId,
  domainId,
}: PredictionDisplayProps) {
  const [record,  setRecord]  = useState<PredictionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrediction() {
      setLoading(true);
      setError(null);

      try {
        let result: PredictionRecord | null = null;

        // Try predictionId first (most reliable)
        if (predictionId) {
          result = await getPredictionById(predictionId);
        }

        // Fallback to sessionId + domainId
        if (!result && sessionId && domainId) {
          result = await getPredictionBySession(sessionId, domainId);
        }

        setRecord(result);

      } catch (err) {
        console.error('[PredictionDisplay] Fetch error:', err);
        setError('Could not load prediction. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (predictionId || (sessionId && domainId)) {
      fetchPrediction();
    } else {
      setLoading(false);
    }
  }, [predictionId, sessionId, domainId]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="rounded-2xl p-8 flex items-center justify-center gap-3"
        style={{ background: 'rgba(4,8,20,0.85)', border: `1px solid ${GOLD_RGBA(0.12)}` }}
      >
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: GOLD }} />
        <p className="text-sm text-slate-400">Loading your cosmic analysis...</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: 'rgba(4,8,20,0.85)', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-slate-300">{error}</p>
      </div>
    );
  }

  // ── No prediction found ────────────────────────────────────────────────────
  if (!record) {
    return null;  // Silent — caller shows fallback content
  }

  // ── Parse prediction JSON ──────────────────────────────────────────────────
  const prediction = record.prediction as PredictionData;
  const { simpleSummary, professional } = prediction;
  const tier = (record.tier as string) || 'free';

  if (!simpleSummary) return null;

  return (
    <div className="space-y-5">
      {/* Layer 1 — Aam Aadmi Summary */}
      <SimpleSummaryCard data={simpleSummary} tier={tier} />

      {/* Layer 2 — Professional Analysis */}
      {professional && (
        <ProfessionalCard data={professional} tier={tier} />
      )}
    </div>
  );
}
