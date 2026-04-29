/**
 * ============================================================
 * TRIKAL VAANI — Result Client Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/result/ResultClient.tsx
 * VERSION: 4.0 — Full integration of ALL components
 * SIGNED: ROHIIT GUPTA, CEO
 * 🔒 LOCKED — DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * WIRES IN v4.0:
 *   ✅ PratayantarDasha — 4-level Dasha with Jini insights
 *   ✅ PersonalizedPrediction — 3-layer AI prediction
 *   ✅ NakshatraAnalysis — Loading animation
 *   ✅ Shadbala table — 6-component classical strength
 *   ✅ Parashara Yogas — from synthesis data
 *   ✅ Bhrigu insights — karmic marker + domain signals
 *   ✅ Remedies — full Mantra/Dana/Vrat/Rudraksha/Ratna
 *   ✅ isFree = false (testing — all tiers see full)
 * ============================================================
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Sun, Moon, Star, Zap, Clock } from 'lucide-react';
import SiteNav    from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import PratayantarDasha   from '@/components/result/PratayantarDasha';
import PersonalizedPrediction from '@/components/result/PersonalizedPrediction';
import NakshatraAnalysis  from '@/components/result/NakshatraAnalysis';

const GOLD      = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ResultMeta {
  personName:       string;
  domainId:         string;
  domainLabel:      string;
  tier:             'free' | 'basic' | 'standard' | 'premium';
  lagna:            string;
  nakshatra:        string;
  mahadasha:        string;
  antardasha:       string;
  language:         string;
  confidenceLabel?: string;
  primaryYoga?:     string;
  processingMs?:    number;
  analysisDate?:    string;
}

export interface ResultClientProps {
  predictionId:   string;
  predictionData: Record<string, any>;
  meta:           ResultMeta;
}

// ── Data extractors ───────────────────────────────────────────────────────────

function extractPlanets(p: Record<string, any>) {
  const planets =
    p?._meta?.planets ??
    p?._kundaliPlanets ??
    null;

  if (!planets) return [];

  const arr = Array.isArray(planets)
    ? planets
    : Object.entries(planets).map(([name, v]: [string, any]) => ({ name, ...v }));

  return arr.map((g: any) => ({
    name:           g.name      ?? g.planet ?? '—',
    rashi:          g.rashi     ?? g.sign   ?? '—',
    house:          g.house     ?? 0,
    nakshatra:      g.nakshatra ?? '—',
    retro:          g.isRetrograde ?? g.retrograde ?? false,
    strength:       g.strength  ?? 50,
    degree:         g.degree    ?? g.degree_in_sign ?? 0,
    isRetrograde:   g.isRetrograde ?? g.retrograde ?? false,
    classification: g.shadbala?.classification ?? '—',
    shadbala:       g.shadbala ?? null,
  }));
}

function extractPratyantar(p: Record<string, any>) {
  // allPratyantar from dasha in prediction chart object
  const all =
    p?._meta?.kundali?.pratyantar ??
    p?.chart?.dasha?.allPratyantar ??
    null;

  if (!Array.isArray(all) || all.length === 0) return null;

  return all.map((pd: any) => ({
    lord:         pd.lord,
    startDate:    pd.startDate,
    endDate:      pd.endDate,
    durationDays: pd.durationDays ?? 7,
    quality:      pd.quality ?? 'Madhyam',
    remainingDays: pd.remainingDays ?? 0,
  }));
}

function findCurrentPratyantar(periods: any[]) {
  const now = new Date();
  return periods.find(pd => {
    const s = new Date(pd.startDate);
    const e = new Date(pd.endDate);
    return s <= now && e > now;
  }) ?? periods[0];
}

function extractYogas(p: Record<string, any>) {
  return (
    p?._meta?.synthesis?.yogas ??
    p?._meta?.synthesis?.synthesis?.activeYogas ??
    p?.professionalEnglish?.yogasFound ??
    []
  );
}

function extractBhrigu(p: Record<string, any>) {
  return (
    p?._meta?.synthesis?.bhrigu ??
    p?._meta?.synthesis?.summary ??
    null
  );
}

function extractRemedies(p: Record<string, any>) {
  return (
    p?.professionalEnglish?.remedyPlan ??
    p?.remedyPlan ??
    null
  );
}

function extractDasha(p: Record<string, any>) {
  return p?.professionalEnglish?.dashaAnalysis ?? null;
}

function extractActionWindows(p: Record<string, any>) {
  return p?.professionalEnglish?.actionWindows ?? null;
}

function getTimingScore(p: Record<string, any>): number {
  return (
    p?._meta?.synthesis?.confidence?.score ??
    p?._meta?.confidence?.score ??
    0
  );
}

function getTimingPhase(score: number) {
  if (score >= 70) return { phase: 'Shubh Kaal — Act Now',         icon: '🟢', color: '#22c55e', advice: 'Graha alignment is favorable. Major decisions are supported.' };
  if (score >= 40) return { phase: 'Madhyam Kaal — Prepare',       icon: '🟡', color: GOLD,      advice: 'Mixed signals. Plan carefully, avoid impulsive decisions.' };
  return               { phase: 'Saavdhani Kaal — Wait & Prepare', icon: '🔴', color: '#ef4444', advice: 'Patience advised. Preparation phase — your chart foundation is strong.' };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ResultClient({ predictionId, predictionData, meta }: ResultClientProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'planets' | 'dasha' | 'remedies'>('summary');

  // isFree = false → all tiers see full prediction during testing
  const isFree = false;

  // Extract all data
  const planets       = useMemo(() => extractPlanets(predictionData),     [predictionData]);
  const yogas         = useMemo(() => extractYogas(predictionData),        [predictionData]);
  const bhrigu        = useMemo(() => extractBhrigu(predictionData),       [predictionData]);
  const remedyData    = useMemo(() => extractRemedies(predictionData),     [predictionData]);
  const dashaData     = useMemo(() => extractDasha(predictionData),        [predictionData]);
  const actionWindows = useMemo(() => extractActionWindows(predictionData),[predictionData]);
  const pratyantar    = useMemo(() => extractPratyantar(predictionData),   [predictionData]);
  const currentPD     = useMemo(() => pratyantar ? findCurrentPratyantar(pratyantar) : null, [pratyantar]);

  const simpleSummary = predictionData?.simpleSummary ?? null;
  const summaryText   = simpleSummary?.text        ?? null;
  const keyMessage    = simpleSummary?.keyMessage  ?? null;
  const mainAction    = simpleSummary?.mainAction  ?? null;
  const mainCaution   = simpleSummary?.mainCaution ?? null;
  const dosList       = simpleSummary?.dos         ?? [];
  const dontsList     = simpleSummary?.donts       ?? [];
  const panchang      = predictionData?._meta?.synthesis?.panchang
    ?? predictionData?.professionalEnglish?.panchang
    ?? null;

  const timingScore = getTimingScore(predictionData);
  const timingPhase = getTimingPhase(timingScore);
  const confidence  = predictionData?._meta?.synthesis?.confidence ?? null;
  const karmicMarker = predictionData?._meta?.synthesis?.summary?.karmic_marker
    ?? confidence?.karmic_marker
    ?? false;

  // Build planet props for PersonalizedPrediction
  const planetProps = planets.map((p: any) => ({
    name:         p.name,
    rashi:        p.rashi,
    house:        p.house,
    strength:     p.strength,
    isRetrograde: p.isRetrograde,
    nakshatra:    p.nakshatra,
    degree:       p.degree,
  }));

  const lang = (meta.language ?? 'hinglish') as 'hindi' | 'hinglish' | 'english';

  // Domain segment mapping
  const segmentMap: Record<string, string> = {
    genz_ex_back:           'ex_back',
    genz_toxic_boss:        'toxic_boss',
    genz_manifestation:     'manifestation',
    genz_dream_career:      'dream_career',
    mill_property_yog:      'property_yog',
    mill_karz_mukti:        'karz_mukti',
    mill_childs_destiny:    'childs_destiny',
    mill_parents_wellness:  'parents_wellness',
    genx_retirement_peace:  'retirement_peace',
    genx_legacy_inheritance:'legacy_inheritance',
    genx_spiritual_innings: 'spiritual_innings',
  };
  const autoSegment = segmentMap[meta.domainId] ?? 'default';

  return (
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-3">
            <Link href="/"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-yellow-400/70 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              New Analysis
            </Link>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600">
              {meta.personName}
              {meta.analysisDate && ` · ${new Date(meta.analysisDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </span>
          </div>

          {/* Hero */}
          <div className="text-center mb-6 py-6 px-4 rounded-2xl"
            style={{ background: 'rgba(4,8,20,0.75)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
            <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.55) }}>
              Your Cosmic Report · {meta.domainLabel}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="text-white">Namaste, </span>
              <span style={{ color: GOLD }}>{meta.personName?.split(' ')[0] ?? 'Friend'}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
                <span className="text-xs font-semibold" style={{ color: GOLD }}>
                  {meta.domainLabel} · {meta.tier.toUpperCase()}
                </span>
              </div>
              {karmicMarker && (
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <span className="text-xs font-semibold text-purple-300">🔱 Karmic Marker</span>
                </div>
              )}
            </div>
          </div>

          {/* Nakshatra Analysis loading animation */}
          <div className="mb-4">
            <NakshatraAnalysis name={meta.personName} />
          </div>

          {/* Kundali Stats */}
          <div className="rounded-2xl p-5 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
            style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.12)}` }}>
            <KundaliStat icon={<Sun className="w-4 h-4" />}  label="Lagna"      value={meta.lagna      || '—'} />
            <KundaliStat icon={<Moon className="w-4 h-4" />} label="Nakshatra"  value={meta.nakshatra  || '—'} />
            <KundaliStat icon={<Star className="w-4 h-4" />} label="Mahadasha"  value={meta.mahadasha  || '—'} />
            <KundaliStat icon={<Zap className="w-4 h-4" />}  label="Antardasha" value={meta.antardasha || '—'} />
          </div>

          {/* Timing Score */}
          <div className="rounded-2xl p-4 mb-4"
            style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${timingPhase.color}22` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: timingPhase.color }} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: timingPhase.color }}>
                    Graha Timing Score
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{timingPhase.icon} {timingPhase.phase}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold" style={{ color: timingPhase.color }}>{Math.round(timingScore)}</span>
                <span className="text-sm text-slate-500">/100</span>
              </div>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(4, Math.round(timingScore))}%`, background: `linear-gradient(90deg, ${timingPhase.color}66, ${timingPhase.color})` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-600 mb-2">
              <span>🔴 Saavdhani</span><span>🟡 Madhyam</span><span>🟢 Shubh</span>
            </div>
            <p className="text-xs leading-relaxed px-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {timingPhase.advice}
            </p>
            {confidence?.action_guidance && (
              <p className="text-xs mt-2 italic" style={{ color: GOLD_RGBA(0.6) }}>
                {confidence.action_guidance}
              </p>
            )}
          </div>

          {/* Personalized Prediction — 3-layer AI */}
          <div className="mb-4">
            <PersonalizedPrediction
              name={meta.personName}
              lagna={meta.lagna}
              mahadasha={meta.mahadasha}
              antardasha={meta.antardasha}
              nakshatra={meta.nakshatra}
              planets={planetProps}
              autoSegment={autoSegment}
              autoSegmentLabel={meta.domainLabel}
              lang={lang}
              isPaid={!isFree}
              onUnlockClick={() => window.location.href = `/upgrade?id=${predictionId}&tier=basic`}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['summary', 'planets', 'dasha', 'remedies'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex-1 text-xs py-2 px-1 rounded-lg font-medium capitalize transition-all"
                style={{
                  background: activeTab === tab ? GOLD_RGBA(0.15) : 'transparent',
                  color:      activeTab === tab ? GOLD : 'rgba(255,255,255,0.35)',
                  border:     activeTab === tab ? `1px solid ${GOLD_RGBA(0.25)}` : '1px solid transparent',
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── SUMMARY TAB ── */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>

                {summaryText && (
                  <p className="text-slate-300 leading-relaxed mb-4" style={{ fontSize: '0.8rem' }}>
                    {summaryText}
                  </p>
                )}

                {keyMessage && (
                  <div className="px-3 py-2.5 rounded-lg mb-3"
                    style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: GOLD }}>🔑 Key Message</p>
                    <p className="text-white text-sm">{keyMessage}</p>
                  </div>
                )}

                {mainAction && (
                  <div className="px-3 py-2.5 rounded-lg mb-2"
                    style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                    <p className="text-green-400 text-xs font-semibold mb-1.5">✓ Do This</p>
                    <p className="text-slate-300 text-sm">{mainAction}</p>
                  </div>
                )}

                {mainCaution && (
                  <div className="px-3 py-2.5 rounded-lg mb-4"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="text-red-400 text-xs font-semibold mb-1.5">✗ Avoid This</p>
                    <p className="text-slate-300 text-sm">{mainCaution}</p>
                  </div>
                )}

                {dosList.length > 0 && (
                  <div className="mt-3">
                    <p className="text-green-400 text-xs font-semibold mb-2">✓ Action Steps</p>
                    <ul className="space-y-1.5">
                      {dosList.map((d: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-green-400 mt-0.5">•</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {dontsList.length > 0 && (
                  <div className="mt-3">
                    <p className="text-red-400 text-xs font-semibold mb-2">✗ Avoid These</p>
                    <ul className="space-y-1.5">
                      {dontsList.map((d: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-red-400 mt-0.5">•</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Parashara Yogas */}
              {Array.isArray(yogas) && yogas.length > 0 && (
                <div className="rounded-2xl p-5"
                  style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: GOLD_RGBA(0.7) }}>
                    🏛 Parashara Yogas — BPHS Classical
                  </p>
                  <div className="space-y-3">
                    {yogas.slice(0, 5).map((y: any, i: number) => (
                      <div key={i} className="px-3 py-3 rounded-xl"
                        style={{ background: GOLD_RGBA(0.04), border: `1px solid ${GOLD_RGBA(0.1)}` }}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-bold" style={{ color: GOLD }}>{y.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            y.strength === 'strong' ? 'bg-green-500/10 text-green-400' :
                            y.strength === 'weak'   ? 'bg-red-500/10 text-red-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>{y.strength}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{y.effect}</p>
                        {y.classicalBasis && (
                          <p className="text-xs italic" style={{ color: GOLD_RGBA(0.45) }}>
                            📖 {y.classicalBasis}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bhrigu Insights */}
              {bhrigu && (
                <div className="rounded-2xl p-5"
                  style={{ background: 'rgba(4,8,20,0.8)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-purple-300">
                    🔱 Bhrigu Nandi Analysis
                  </p>
                  {bhrigu.current_life_theme && (
                    <div className="px-3 py-2.5 rounded-xl mb-3"
                      style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                      <p className="text-xs text-slate-500 mb-1">Current Life Theme</p>
                      <p className="text-sm text-purple-200">{bhrigu.current_life_theme}</p>
                    </div>
                  )}
                  {bhrigu.bhrigu_theme && !bhrigu.current_life_theme && (
                    <div className="px-3 py-2.5 rounded-xl mb-3"
                      style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                      <p className="text-xs text-slate-500 mb-1">Bhrigu Theme</p>
                      <p className="text-sm text-purple-200">{bhrigu.bhrigu_theme}</p>
                    </div>
                  )}
                  {Array.isArray(bhrigu.domain_signals) && bhrigu.domain_signals.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Domain Signals</p>
                      <div className="space-y-1.5">
                        {bhrigu.domain_signals.slice(0, 3).map((s: any, i: number) => (
                          <div key={i} className="flex gap-2 text-xs text-slate-300">
                            <span className="text-purple-400">•</span>
                            {typeof s === 'string' ? s : s.signal ?? s.description ?? JSON.stringify(s)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {bhrigu.karmic_description && (
                    <p className="text-xs italic mt-3 text-purple-300/70">{bhrigu.karmic_description}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PLANETS TAB (with Shadbala) ── */}
          {activeTab === 'planets' && (
            <div className="space-y-4">
              {/* Planet table with Shadbala */}
              <div className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${GOLD_RGBA(0.1)}` }}>
                {planets.length > 0 ? (
                  <>
                    <div className="px-4 py-3"
                      style={{ background: GOLD_RGBA(0.06), borderBottom: `1px solid ${GOLD_RGBA(0.1)}` }}>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: GOLD }}>
                        ⭐ Shadbala — 6-Component Classical Strength
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Per BPHS Ch.27 · Swiss Ephemeris precision
                      </p>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ background: GOLD_RGBA(0.04) }}>
                          {['Planet', 'Rashi', 'H', 'Nakshatra', 'R', 'Classification', 'Str'].map(h => (
                            <th key={h} className="py-2.5 px-2 text-left font-semibold"
                              style={{ color: GOLD_RGBA(0.7) }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {planets.map((p: any, i: number) => (
                          <tr key={p.name}
                            style={{ background: i % 2 === 0 ? 'rgba(4,8,20,0.8)' : 'rgba(4,8,20,0.5)' }}>
                            <td className="py-2.5 px-2 font-bold text-white">{p.name}</td>
                            <td className="py-2.5 px-2 text-slate-300">{p.rashi}</td>
                            <td className="py-2.5 px-2 text-slate-400">{p.house || '—'}</td>
                            <td className="py-2.5 px-2 text-slate-400" style={{ fontSize: '0.65rem' }}>{p.nakshatra}</td>
                            <td className="py-2.5 px-2 text-slate-500">{p.retro ? '℞' : '—'}</td>
                            <td className="py-2.5 px-2">
                              <ClassificationBadge value={p.classification} />
                            </td>
                            <td className="py-2.5 px-2">
                              <StrengthBar value={p.strength} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Shadbala breakdown for top planets */}
                    <div className="p-4" style={{ borderTop: `1px solid ${GOLD_RGBA(0.08)}` }}>
                      <p className="text-xs font-semibold mb-3" style={{ color: GOLD_RGBA(0.6) }}>
                        📊 Shadbala Breakdown (Shashtiamshas)
                      </p>
                      <div className="space-y-3">
                        {planets.filter((p: any) => p.shadbala).slice(0, 4).map((p: any) => (
                          <ShadbalaMiniCard key={p.name} planet={p} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 mt-3 text-center italic">
                        Sthana · Dig · Kala · Cheshta · Naisargika · Drik — 6 classical components
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-8" style={{ background: 'rgba(4,8,20,0.8)' }}>
                    <EmptyState text="Planet data not available. Please retry prediction." />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DASHA TAB ── */}
          {activeTab === 'dasha' && (
            <div className="space-y-4">
              {/* PratayantarDasha component — full 4-level */}
              {pratyantar && currentPD ? (
                <PratayantarDasha
                  name={meta.personName}
                  mahadasha={meta.mahadasha}
                  antardasha={meta.antardasha}
                  pratyantar={pratyantar}
                  currentPratyantar={currentPD}
                  currentSookshma={currentPD} // approximation if sookshma not available
                  lang={lang}
                />
              ) : (
                /* Fallback — Panchang + basic dasha */
                <div className="rounded-2xl p-5"
                  style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-xl p-3"
                      style={{ background: GOLD_RGBA(0.07), border: `1px solid ${GOLD_RGBA(0.15)}` }}>
                      <p className="text-xs text-slate-500 mb-1">Mahadasha</p>
                      <p className="text-base font-bold" style={{ color: GOLD }}>{meta.mahadasha || '—'}</p>
                    </div>
                    <div className="rounded-xl p-3"
                      style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.1)}` }}>
                      <p className="text-xs text-slate-500 mb-1">Antardasha</p>
                      <p className="text-base font-bold text-white">{meta.antardasha || '—'}</p>
                    </div>
                  </div>

                  {dashaData?.combinedDashaReading && (
                    <div className="px-3 py-3 rounded-xl mb-4"
                      style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.1)}` }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: GOLD }}>🔮 Combined Dasha Reading</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{dashaData.combinedDashaReading}</p>
                    </div>
                  )}

                  {/* Action Windows */}
                  {Array.isArray(actionWindows) && actionWindows.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-green-400">
                        🟢 Action Windows
                      </p>
                      <div className="space-y-2">
                        {actionWindows.map((w: any, i: number) => (
                          <div key={i} className="px-3 py-2.5 rounded-xl"
                            style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                            <p className="text-green-400 text-xs font-semibold">{w.dateRange}</p>
                            <p className="text-slate-300 text-xs mt-1">{w.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <EmptyState text="Submit a new prediction to see full 4-level Pratyantar Dasha." />
                </div>
              )}

              {/* Panchang */}
              {panchang && (
                <div className="rounded-2xl p-5"
                  style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: GOLD_RGBA(0.6) }}>🗓 Aaj Ka Panchang</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ['Vara',       panchang.vara],
                      ['Tithi',      panchang.tithi],
                      ['Nakshatra',  panchang.nakshatra],
                      ['Yoga',       panchang.yoga],
                      ['Sunrise',    panchang.sunrise],
                      ['Sunset',     panchang.sunset],
                      ['Rahu Kaal',  panchang.rahuKaal ? `${panchang.rahuKaal.start} – ${panchang.rahuKaal.end}` : null],
                      ['Choghadiya', panchang.choghadiya?.name ?? null],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label as string}
                        className="flex justify-between px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-300 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REMEDIES TAB ── */}
          {activeTab === 'remedies' && (
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
              {remedyData ? (
                <div>
                  {remedyData.remedySummary && (
                    <div className="px-3 py-3 rounded-xl mb-4"
                      style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.15)}` }}>
                      <p className="text-slate-300 text-sm leading-relaxed">{remedyData.remedySummary}</p>
                    </div>
                  )}

                  {Array.isArray(remedyData.remedies) && remedyData.remedies.map((r: any, i: number) => (
                    <div key={i} className="mb-5 rounded-xl p-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.08)}` }}>
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold" style={{ color: GOLD }}>
                          {r.planet} — Priority {r.priority}
                        </p>
                        {r.affliction && <span className="text-xs text-slate-500 italic">{r.affliction}</span>}
                      </div>

                      <div className="space-y-2 text-xs">
                        {r.mantra?.text && <RemedyRow emoji="🕉" label="Mantra"
                          value={`${r.mantra.text} · ${r.mantra.count}x on ${r.mantra.day}, facing ${r.mantra.direction ?? 'East'}`} />}
                        {r.dana?.item && <RemedyRow emoji="🙏" label="Dana"
                          value={`${r.dana.item} on ${r.dana.day} to ${r.dana.recipient ?? 'needy person'}`} />}
                        {r.vrat?.day && <RemedyRow emoji="🌙" label="Vrat"
                          value={`${r.vrat.day} for ${r.vrat.deity ?? 'deity'} — ${r.vrat.rules ?? ''}`} />}
                        {r.rudraksha?.mukhi && <RemedyRow emoji="📿" label="Rudraksha"
                          value={`${r.rudraksha.mukhi} Mukhi — ${r.rudraksha.reason ?? ''}`} />}
                        {r.ratna?.gem && (
                          <div className="flex gap-2 p-2 rounded-lg"
                            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                            <span>💎</span>
                            <div>
                              <p className="text-slate-400 font-medium">Ratna: {r.ratna.gem}</p>
                              <p className="text-slate-500 mt-0.5">{r.ratna.metal} · {r.ratna.finger} · {r.ratna.weight}</p>
                              {r.ratna.caution && <p className="text-red-400/70 mt-1 italic">⚠ {r.ratna.caution}</p>}
                            </div>
                          </div>
                        )}
                      </div>

                      {Array.isArray(r.dos) && r.dos.length > 0 && (
                        <div className="mt-3">
                          <p className="text-green-400 text-xs font-semibold mb-1.5">✓ Do This</p>
                          <ul className="space-y-1">
                            {r.dos.map((d: string, j: number) => (
                              <li key={j} className="flex gap-2 text-xs text-slate-400">
                                <span className="text-green-400">•</span>{d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(r.donts) && r.donts.length > 0 && (
                        <div className="mt-3">
                          <p className="text-red-400 text-xs font-semibold mb-1.5">✗ Avoid</p>
                          <ul className="space-y-1">
                            {r.donts.map((d: string, j: number) => (
                              <li key={j} className="flex gap-2 text-xs text-slate-400">
                                <span className="text-red-400">•</span>{d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {r.classicalBasis && (
                        <p className="text-xs italic mt-2" style={{ color: GOLD_RGBA(0.4) }}>
                          📖 {r.classicalBasis}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Submit a new prediction to see personalized remedies." />
              )}
            </div>
          )}

          {/* New analysis CTA */}
          <div className="text-center mt-10">
            <Link href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium text-slate-500 hover:text-yellow-400/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <RefreshCw className="w-3.5 h-3.5" />
              Analyse another domain
            </Link>
          </div>

        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KundaliStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-1" style={{ color: GOLD_RGBA(0.6) }}>{icon}</div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function StrengthBar({ value }: { value: number }) {
  const pct   = Math.min(100, Math.max(0, value));
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? GOLD : '#ef4444';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-10 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-slate-500">{pct}</span>
    </div>
  );
}

function ClassificationBadge({ value }: { value: string }) {
  const color =
    value === 'Exalted' || value === 'Exact Exaltation' ? '#22c55e' :
    value === 'Debilitated' ? '#ef4444' :
    value === 'Own Sign' || value === 'Moolatrikona' ? GOLD :
    'rgba(255,255,255,0.3)';
  const bg =
    value === 'Exalted' || value === 'Exact Exaltation' ? 'rgba(34,197,94,0.1)' :
    value === 'Debilitated' ? 'rgba(239,68,68,0.1)' :
    value === 'Own Sign' || value === 'Moolatrikona' ? GOLD_RGBA(0.1) :
    'rgba(255,255,255,0.04)';

  return (
    <span className="px-1.5 py-0.5 rounded text-center"
      style={{ background: bg, color, fontSize: '0.6rem', fontWeight: 600 }}>
      {value !== '—' ? value.replace(' Sign', '') : '—'}
    </span>
  );
}

function ShadbalaMiniCard({ planet }: { planet: any }) {
  const sb = planet.shadbala;
  if (!sb) return null;
  const color = sb.isStrong ? '#22c55e' : GOLD;
  return (
    <div className="rounded-xl p-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.05)` }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-white">{planet.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color }}>{sb.classification}</span>
          <span className="text-xs text-slate-500">{sb.total?.toFixed(0) ?? '—'} / {sb.minimum ?? '—'} sha</span>
        </div>
      </div>
      {sb.breakdown && (
        <div className="grid grid-cols-6 gap-1">
          {[
            ['St', sb.breakdown.sthana],
            ['Di', sb.breakdown.dig],
            ['Ka', sb.breakdown.kala],
            ['Ch', sb.breakdown.cheshta],
            ['Na', sb.breakdown.naisargika],
            ['Dr', sb.breakdown.drik],
          ].map(([label, val]) => (
            <div key={label as string} className="text-center">
              <p className="text-slate-600" style={{ fontSize: '0.55rem' }}>{label}</p>
              <p className="text-white font-medium" style={{ fontSize: '0.65rem' }}>
                {typeof val === 'number' ? val.toFixed(0) : '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RemedyRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <span>{emoji}</span>
      <div><span className="text-slate-500 font-medium">{label}: </span><span className="text-slate-300">{value}</span></div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}
