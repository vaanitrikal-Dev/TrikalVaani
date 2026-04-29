/**
 * ============================================================
 * TRIKAL VAANI — Result Client Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/result/ResultClient.tsx
 * VERSION: 3.2 — Timing Score reframe + 5 line summary + blur teaser
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES IN v3.2:
 *   - "Prediction Confidence" → "Timing Score" (positive reframe)
 *   - Score shown as timing context, not accuracy indicator
 *   - Summary lines: 5 (was 3)
 *   - Timing guidance replaces raw score reason
 *   - Score color logic: green=act now, gold=prepare, red=wait
 * ============================================================
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Sun, Moon, Star, Zap, Lock, Clock } from 'lucide-react';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';

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

// ── Planet helper ─────────────────────────────────────────────────────────────

interface PlanetRow {
  name:      string;
  rashi:     string;
  house:     number;
  nakshatra: string;
  retro:     boolean;
  strength:  number;
}

function extractPlanets(predictionData: Record<string, any>): PlanetRow[] {
  const planets =
    predictionData?._meta?.planets    ??
    predictionData?._kundaliPlanets   ??
    predictionData?._rawChart?.grahas ??
    null;

  if (!planets) return [];

  if (Array.isArray(planets)) {
    return planets.map((p: any) => ({
      name:      p.name      ?? p.planet ?? '—',
      rashi:     p.rashi     ?? p.sign   ?? '—',
      house:     p.house     ?? 0,
      nakshatra: p.nakshatra ?? '—',
      retro:     p.isRetrograde ?? p.retrograde ?? false,
      strength:  p.strength  ?? 50,
    }));
  }

  return Object.entries(planets).map(([name, p]: [string, any]) => ({
    name,
    rashi:     p.rashi     ?? '—',
    house:     p.house     ?? 0,
    nakshatra: p.nakshatra ?? '—',
    retro:     p.isRetrograde ?? false,
    strength:  p.strength  ?? 50,
  }));
}

// ── Timing Score helpers ──────────────────────────────────────────────────────

function getTimingColor(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return GOLD;
  return '#ef4444';
}

function getTimingPhase(score: number): {
  phase: string;
  icon:  string;
  advice: string;
  color: string;
} {
  if (score >= 70) return {
    phase:  'Shubh Kaal — Act Now',
    icon:   '🟢',
    advice: 'Graha alignment is favorable. Major decisions and new ventures are supported.',
    color:  '#22c55e',
  };
  if (score >= 40) return {
    phase:  'Madhyam Kaal — Prepare',
    icon:   '🟡',
    advice: 'Mixed planetary signals. Plan carefully, avoid impulsive decisions.',
    color:  GOLD,
  };
  return {
    phase:  'Saavdhani Kaal — Wait & Prepare',
    icon:   '🔴',
    advice: 'Current Dasha period advises patience. This is a preparation phase — not an action phase. Your chart foundation is strong; timing will align.',
    color:  '#ef4444',
  };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ResultClient({ predictionId, predictionData, meta }: ResultClientProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'planets' | 'dasha' | 'remedies'>('summary');

  const planets = extractPlanets(predictionData);
  const isFree  = meta.tier === 'free';
  const isPaid  = !isFree;

  // ── Extract Gemini fields ─────────────────────────────────────────────────
  const simpleSummary = predictionData?.simpleSummary ?? null;
  const summaryText   = simpleSummary?.text        ?? predictionData?.summary ?? null;
  const keyMessage    = simpleSummary?.keyMessage  ?? null;
  const mainAction    = simpleSummary?.mainAction  ?? null;
  const mainCaution   = simpleSummary?.mainCaution ?? null;
  const dosList       = simpleSummary?.dos         ?? null;
  const dontsList     = simpleSummary?.donts       ?? null;
  const remedies      = predictionData?.remedies   ?? predictionData?.remedy_plan ?? null;
  const dashaText     = predictionData?.dasha_analysis ?? predictionData?.dasha   ?? null;
  const panchang      = predictionData?._meta?.synthesis?.panchang ?? null;

  // ── Timing Score ──────────────────────────────────────────────────────────
  const timingScore: number =
    predictionData?._meta?.synthesis?.confidence?.score ??
    predictionData?._meta?.confidence?.score ??
    0;

  const timingPhase = getTimingPhase(timingScore);
  const timingColor = getTimingColor(timingScore);

  // Tie breaker advice (when available)
  const tieBreakerText: string =
    predictionData?._meta?.synthesis?.confidence?.tie_breaker ??
    predictionData?._meta?.synthesis?.synthesis?.tie_breaker  ??
    '';

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
              {meta.analysisDate && ` · ${new Date(meta.analysisDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}`}
            </span>
          </div>

          {/* Hero */}
          <div className="text-center mb-6 py-6 px-4 rounded-2xl"
            style={{ background: 'rgba(4,8,20,0.75)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
            <p className="text-xs font-medium tracking-widest uppercase mb-2"
              style={{ color: GOLD_RGBA(0.55) }}>
              Your Cosmic Report · {meta.domainLabel}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="text-white">Namaste, </span>
              <span style={{ color: GOLD }}>{meta.personName?.split(' ')[0] ?? 'Friend'}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
              <span className="text-xs font-semibold" style={{ color: GOLD }}>
                {meta.domainLabel} · {meta.tier.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Kundali Stats */}
          <div className="rounded-2xl p-5 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
            style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.12)}` }}>
            <KundaliStat icon={<Sun className="w-4 h-4" />}  label="Lagna"      value={meta.lagna      || '—'} />
            <KundaliStat icon={<Moon className="w-4 h-4" />} label="Nakshatra"  value={meta.nakshatra  || '—'} />
            <KundaliStat icon={<Star className="w-4 h-4" />} label="Mahadasha"  value={meta.mahadasha  || '—'} />
            <KundaliStat icon={<Zap className="w-4 h-4" />}  label="Antardasha" value={meta.antardasha || '—'} />
          </div>

          {/* ── TIMING SCORE — ALL TIERS ── */}
          <div className="rounded-2xl p-4 mb-5"
            style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${timingColor}22` }}>

            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: timingColor }} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: timingColor }}>
                    Graha Timing Score
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {timingPhase.icon} {timingPhase.phase}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold" style={{ color: timingColor }}>
                  {Math.round(timingScore)}
                </span>
                <span className="text-sm text-slate-500">/100</span>
              </div>
            </div>

            {/* Score bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden mb-2"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width:      `${Math.max(4, Math.round(timingScore))}%`,
                  background: `linear-gradient(90deg, ${timingColor}66, ${timingColor})`,
                }} />
            </div>

            {/* Scale labels */}
            <div className="flex justify-between text-xs text-slate-600 mb-3">
              <span>🔴 Saavdhani</span>
              <span>🟡 Madhyam</span>
              <span>🟢 Shubh</span>
            </div>

            {/* Timing advice */}
            <div className="px-3 py-2.5 rounded-xl text-xs leading-relaxed"
              style={{
                background: `${timingColor}0D`,
                border:     `1px solid ${timingColor}22`,
                color:      'rgba(255,255,255,0.7)',
              }}>
              {timingPhase.advice}
              {tieBreakerText && (
                <span className="text-slate-500"> {tieBreakerText}</span>
              )}
            </div>

            {/* Important note for low score */}
            {timingScore < 40 && (
              <p className="text-xs text-slate-600 mt-2 text-center">
                ⚡ Chart strength is separate from timing — your foundation is being assessed accurately
              </p>
            )}
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
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
              {summaryText ? (
                <div>
                  {/* Summary text — 5 lines for free, full for paid */}
                  <div className="relative mb-4">
                    <p className="text-slate-300 leading-relaxed"
                      style={{
                        fontSize:            '0.8rem',
                        display:             '-webkit-box',
                        WebkitLineClamp:     isFree ? 5 : 999,
                        WebkitBoxOrient:     'vertical' as any,
                        overflow:            'hidden',
                      }}>
                      {summaryText}
                    </p>
                    {isFree && (
                      <div className="absolute bottom-0 left-0 right-0 h-10 rounded-b-lg"
                        style={{ background: 'linear-gradient(transparent, rgba(4,8,20,0.98))' }} />
                    )}
                  </div>

                  {/* Key Message — blurred for free */}
                  {keyMessage && (
                    <div className="relative px-3 py-2.5 rounded-lg mb-3"
                      style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                      <p className="text-xs font-semibold mb-1.5" style={{ color: GOLD }}>
                        🔑 Key Message
                      </p>
                      <p className="text-white text-sm"
                        style={{
                          filter:     isFree ? 'blur(5px)' : 'none',
                          userSelect: isFree ? 'none' : 'auto',
                        }}>
                        {keyMessage}
                      </p>
                      {isFree && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                          <a href={`/upgrade?id=${predictionId}&tier=basic`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
                            style={{
                              background: 'rgba(4,8,20,0.9)',
                              border:     `1px solid ${GOLD_RGBA(0.4)}`,
                            }}>
                            <Lock className="w-3 h-3" style={{ color: GOLD }} />
                            <span className="text-xs font-bold" style={{ color: GOLD }}>
                              Unlock — ₹51
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Do This — blurred for free */}
                  {mainAction && (
                    <div className="relative px-3 py-2.5 rounded-lg mb-2"
                      style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                      <p className="text-green-400 text-xs font-semibold mb-1.5">✓ Do This</p>
                      <p className="text-slate-300 text-sm"
                        style={{
                          filter:     isFree ? 'blur(5px)' : 'none',
                          userSelect: isFree ? 'none' : 'auto',
                        }}>
                        {mainAction}
                      </p>
                      {isFree && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                          <a href={`/upgrade?id=${predictionId}&tier=basic`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
                            style={{ background: 'rgba(4,8,20,0.9)', border: '1px solid rgba(74,222,128,0.4)' }}>
                            <Lock className="w-3 h-3 text-green-400" />
                            <span className="text-xs font-bold text-green-400">Unlock — ₹51</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Avoid This — blurred for free */}
                  {mainCaution && (
                    <div className="relative px-3 py-2.5 rounded-lg mb-4"
                      style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <p className="text-red-400 text-xs font-semibold mb-1.5">✗ Avoid This</p>
                      <p className="text-slate-300 text-sm"
                        style={{
                          filter:     isFree ? 'blur(5px)' : 'none',
                          userSelect: isFree ? 'none' : 'auto',
                        }}>
                        {mainCaution}
                      </p>
                      {isFree && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                          <a href={`/upgrade?id=${predictionId}&tier=basic`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
                            style={{ background: 'rgba(4,8,20,0.9)', border: '1px solid rgba(239,68,68,0.4)' }}>
                            <Lock className="w-3 h-3 text-red-400" />
                            <span className="text-xs font-bold text-red-400">Unlock — ₹51</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dos & Donts — paid only */}
                  {isPaid && Array.isArray(dosList) && dosList.length > 0 && (
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

                  {isPaid && Array.isArray(dontsList) && dontsList.length > 0 && (
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
              ) : (
                <EmptyState text="Summary loading..." />
              )}

              {isFree && <UpgradeBanner predictionId={predictionId} />}
            </div>
          )}

          {/* ── PLANETS TAB ── */}
          {activeTab === 'planets' && (
            <div className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${GOLD_RGBA(0.1)}` }}>
              {planets.length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: GOLD_RGBA(0.08) }}>
                      {['Planet', 'Rashi', 'House', 'Nakshatra', 'R', 'Str'].map(h => (
                        <th key={h} className="py-3 px-3 text-left font-semibold"
                          style={{ color: GOLD }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {planets.map((p, i) => (
                      <tr key={p.name}
                        style={{ background: i % 2 === 0 ? 'rgba(4,8,20,0.8)' : 'rgba(4,8,20,0.5)' }}>
                        <td className="py-2.5 px-3 font-medium text-white">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-300">{p.rashi}</td>
                        <td className="py-2.5 px-3 text-slate-300">{p.house || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{p.nakshatra}</td>
                        <td className="py-2.5 px-3 text-slate-400">{p.retro ? '℞' : '—'}</td>
                        <td className="py-2.5 px-3"><StrengthBar value={p.strength} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8" style={{ background: 'rgba(4,8,20,0.8)' }}>
                  <EmptyState text="Planet data not available. Please retry prediction." />
                </div>
              )}
            </div>
          )}

          {/* ── DASHA TAB ── */}
          {activeTab === 'dasha' && (
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

              {/* Panchang */}
              {panchang && (
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: GOLD_RGBA(0.6) }}>
                    🗓 Aaj Ka Panchang
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ['Vara',      panchang.vara],
                      ['Tithi',     panchang.tithi],
                      ['Nakshatra', panchang.nakshatra],
                      ['Yoga',      panchang.yoga],
                      ['Sunrise',   panchang.sunrise],
                      ['Sunset',    panchang.sunset],
                      ['Rahu Kaal', panchang.rahuKaal
                        ? `${panchang.rahuKaal.start} – ${panchang.rahuKaal.end}`
                        : null],
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

              {dashaText ? (
                <p className="text-slate-300 text-sm leading-relaxed">
                  {typeof dashaText === 'string' ? dashaText : JSON.stringify(dashaText)}
                </p>
              ) : isFree ? (
                <UpgradeBanner predictionId={predictionId} />
              ) : (
                <EmptyState text="Detailed Dasha analysis included in full prediction." />
              )}
            </div>
          )}

          {/* ── REMEDIES TAB ── */}
          {activeTab === 'remedies' && (
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
              {isFree ? (
                <UpgradeBanner predictionId={predictionId} />
              ) : remedies ? (
                <div>
                  {typeof remedies === 'string' ? (
                    <p className="text-slate-300 text-sm leading-relaxed">{remedies}</p>
                  ) : Array.isArray(remedies) ? (
                    <ul className="space-y-3">
                      {remedies.map((r: any, i: number) => (
                        <li key={i} className="flex gap-3">
                          <span style={{ color: GOLD }}>•</span>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {typeof r === 'string' ? r : r.description ?? JSON.stringify(r)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    Object.entries(remedies).map(([key, val]) => (
                      <div key={key} className="mb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider mb-1"
                          style={{ color: GOLD }}>
                          {key.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-slate-300 text-sm">
                          {typeof val === 'string' ? val : JSON.stringify(val)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <EmptyState text="Remedies not available in your current plan." />
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
      <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-slate-500">{pct}</span>
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

function UpgradeBanner({ predictionId }: { predictionId: string }) {
  return (
    <div className="mt-5 rounded-xl p-4 text-center"
      style={{ background: GOLD_RGBA(0.07), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <Lock className="w-5 h-5 mx-auto mb-2" style={{ color: GOLD }} />
      <p className="text-sm font-semibold text-white mb-1">Unlock Full Prediction</p>
      <p className="text-xs text-slate-400 mb-3">
        Complete analysis · Dasha details · Personalised remedies
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        <a href={`/upgrade?id=${predictionId}&tier=basic`}
          className="px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
          style={{ background: GOLD_RGBA(0.15), color: GOLD, border: `1px solid ${GOLD_RGBA(0.3)}` }}>
          ₹51 — Basic
        </a>
        <a href={`/upgrade?id=${predictionId}&tier=standard`}
          className="px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
          style={{ background: GOLD_RGBA(0.2), color: GOLD, border: `1px solid ${GOLD_RGBA(0.4)}` }}>
          ₹99 — Standard
        </a>
        <a href={`/upgrade?id=${predictionId}&tier=premium`}
          className="px-4 py-2 rounded-full text-xs font-bold text-[#080B12] transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${GOLD}, #F5D76E)` }}>
          ₹499 — Premium ✦
        </a>
      </div>
    </div>
  );
}
