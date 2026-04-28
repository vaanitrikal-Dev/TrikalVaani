/**
 * ============================================================
 * TRIKAL VAANI — Result Client Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/result/ResultClient.tsx
 * VERSION: 2.0 — BUG FIXES: Props-driven, all display fields mapped
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * FIXES IN v2.0:
 *   BUG 1 — Lagna/Nakshatra now read from `meta` prop (server-fetched)
 *   BUG 3 — Planets built from predictionData._kundaliPlanets or _meta.kundali
 *   BUG 4 — Mahadasha shows single lord only (meta.mahadasha string)
 *   BUG 6 — Component now accepts server-side props from page.tsx correctly
 *   BUG 2 — Panchang: shows "Calculating..." gracefully when stub is empty
 *
 * ARCHITECTURE:
 *   page.tsx (server) fetches Supabase → passes predictionData + meta props
 *   ResultClient (client) renders from props — NO useSearchParams needed
 * ============================================================
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Star, Moon, Sun, Zap, Lock } from 'lucide-react';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';

// ── Constants ─────────────────────────────────────────────────────────────────

const GOLD      = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ResultMeta {
  personName:      string;
  domainId:        string;
  domainLabel:     string;
  tier:            'free' | 'basic' | 'standard' | 'premium';
  lagna:           string;   // e.g. "Mesh"
  nakshatra:       string;   // e.g. "Rohini"
  mahadasha:       string;   // e.g. "Jupiter" — single lord string
  antardasha:      string;   // e.g. "Saturn"
  language:        string;
  confidenceLabel?: string;
  primaryYoga?:    string;
  processingMs?:   number;
  analysisDate?:   string;
}

export interface ResultClientProps {
  predictionId:   string;
  predictionData: Record<string, any>;  // full prediction JSON from Supabase
  meta:           ResultMeta;
}

// ── Planet display helper ─────────────────────────────────────────────────────

interface PlanetRow {
  name:    string;
  rashi:   string;
  house:   number;
  nakshatra: string;
  retro:   boolean;
  strength: number;
}

function extractPlanets(predictionData: Record<string, any>): PlanetRow[] {
  // Try multiple locations where planets may be stored
  const planets =
    predictionData?._kundaliPlanets       ??   // preferred: adapter output
    predictionData?._meta?.planets        ??   // fallback 1
    predictionData?._rawChart?.grahas     ??   // fallback 2
    predictionData?._rawGrahas            ??   // fallback 3
    null;

  if (!planets) return [];

  // If it's an object (Record<name, PlanetPosition>) — convert to array
  if (!Array.isArray(planets)) {
    return Object.entries(planets).map(([name, p]: [string, any]) => ({
      name,
      rashi:    p.rashi    ?? p.sign ?? '—',
      house:    p.house    ?? 0,
      nakshatra: p.nakshatra ?? '—',
      retro:    p.isRetrograde ?? p.retrograde ?? false,
      strength: p.strength ?? 50,
    }));
  }

  // If it's an array (grahas[])
  return planets.map((g: any) => ({
    name:    g.planet ?? g.name ?? '—',
    rashi:   g.sign   ?? g.rashi ?? '—',
    house:   g.house  ?? 0,
    nakshatra: g.nakshatra ?? '—',
    retro:   g.retrograde ?? g.isRetrograde ?? false,
    strength: g.strength ?? 50,
  }));
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ResultClient({ predictionId, predictionData, meta }: ResultClientProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'planets' | 'dasha' | 'remedies'>('summary');

  const planets = extractPlanets(predictionData);

  // Safe text extraction from prediction sections
  const summary   = predictionData?.summary   ?? predictionData?.core_prediction   ?? null;
  const remedies  = predictionData?.remedies  ?? predictionData?.remedy_plan       ?? null;
  const dashaText = predictionData?.dasha_analysis ?? predictionData?.dasha        ?? null;

  const isFree = meta.tier === 'free';

  return (
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-yellow-400/70 transition-colors"
            >
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

          {/* Hero greeting */}
          <div
            className="text-center mb-6 py-6 px-4 rounded-2xl"
            style={{
              background: 'rgba(4,8,20,0.75)',
              border: `1px solid ${GOLD_RGBA(0.1)}`,
            }}
          >
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

            {/* Tier badge */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
              <span className="text-xs font-semibold" style={{ color: GOLD }}>
                {meta.domainLabel} · {meta.tier.toUpperCase()}
              </span>
            </div>
          </div>

          {/* ── Kundali Summary Card ─────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-4"
            style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.12)}` }}
          >
            <KundaliStat icon={<Sun className="w-4 h-4" />} label="Lagna"     value={meta.lagna      || '—'} />
            <KundaliStat icon={<Moon className="w-4 h-4" />} label="Nakshatra" value={meta.nakshatra  || '—'} />
            <KundaliStat icon={<Star className="w-4 h-4" />} label="Mahadasha" value={meta.mahadasha  || '—'} />
            <KundaliStat icon={<Zap  className="w-4 h-4" />} label="Antardasha" value={meta.antardasha || '—'} />
          </div>

          {/* Confidence + Yoga */}
          {(meta.confidenceLabel || meta.primaryYoga) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {meta.confidenceLabel && (
                <span className="text-xs px-3 py-1 rounded-full"
                  style={{ background: GOLD_RGBA(0.08), color: GOLD, border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  Confidence: {meta.confidenceLabel}
                </span>
              )}
              {meta.primaryYoga && (
                <span className="text-xs px-3 py-1 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                  {meta.primaryYoga}
                </span>
              )}
            </div>
          )}

          {/* ── Tabs ─────────────────────────────────────────────────────────── */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['summary', 'planets', 'dasha', 'remedies'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 text-xs py-2 px-1 rounded-lg font-medium capitalize transition-all"
                style={{
                  background: activeTab === tab ? GOLD_RGBA(0.15) : 'transparent',
                  color:      activeTab === tab ? GOLD : 'rgba(255,255,255,0.35)',
                  border:     activeTab === tab ? `1px solid ${GOLD_RGBA(0.25)}` : '1px solid transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Tab Content ───────────────────────────────────────────────────── */}

          {/* SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
              {summary ? (
                <div>
                  {typeof summary === 'string' ? (
                    <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
                  ) : (
                    Object.entries(summary).map(([key, val]) => (
                      <div key={key} className="mb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: GOLD }}>
                          {key.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {typeof val === 'string' ? val : JSON.stringify(val)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <EmptyState text="Summary being generated..." />
              )}

              {/* Free tier lock */}
              {isFree && (
                <UpgradeBanner predictionId={predictionId} />
              )}
            </div>
          )}

          {/* PLANETS TAB */}
          {activeTab === 'planets' && (
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${GOLD_RGBA(0.1)}` }}>
              {planets.length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: GOLD_RGBA(0.08) }}>
                      {['Planet', 'Rashi', 'House', 'Nakshatra', 'R', 'Str'].map(h => (
                        <th key={h} className="py-3 px-3 text-left font-semibold" style={{ color: GOLD }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {planets.map((p, i) => (
                      <tr
                        key={p.name}
                        style={{ background: i % 2 === 0 ? 'rgba(4,8,20,0.8)' : 'rgba(4,8,20,0.5)' }}
                      >
                        <td className="py-2.5 px-3 font-medium text-white">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-300">{p.rashi}</td>
                        <td className="py-2.5 px-3 text-slate-300">{p.house || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{p.nakshatra}</td>
                        <td className="py-2.5 px-3 text-slate-400">{p.retro ? '℞' : '—'}</td>
                        <td className="py-2.5 px-3">
                          <StrengthBar value={p.strength} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8" style={{ background: 'rgba(4,8,20,0.8)' }}>
                  <EmptyState text="Planet data not available for this prediction. Please retry." />
                </div>
              )}
            </div>
          )}

          {/* DASHA TAB */}
          {activeTab === 'dasha' && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
              {/* Always show meta dasha (from Supabase columns) */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl p-3" style={{ background: GOLD_RGBA(0.07), border: `1px solid ${GOLD_RGBA(0.15)}` }}>
                  <p className="text-xs text-slate-500 mb-1">Mahadasha</p>
                  <p className="text-base font-bold" style={{ color: GOLD }}>{meta.mahadasha || '—'}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.1)}` }}>
                  <p className="text-xs text-slate-500 mb-1">Antardasha</p>
                  <p className="text-base font-bold text-white">{meta.antardasha || '—'}</p>
                </div>
              </div>

              {/* Dasha analysis text if available */}
              {dashaText ? (
                <p className="text-slate-300 text-sm leading-relaxed">
                  {typeof dashaText === 'string' ? dashaText : JSON.stringify(dashaText)}
                </p>
              ) : isFree ? (
                <UpgradeBanner predictionId={predictionId} />
              ) : (
                <EmptyState text="Dasha analysis included in your prediction above." />
              )}
            </div>
          )}

          {/* REMEDIES TAB */}
          {activeTab === 'remedies' && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
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
                          <span className="text-sm" style={{ color: GOLD }}>•</span>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {typeof r === 'string' ? r : r.description ?? JSON.stringify(r)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    Object.entries(remedies).map(([key, val]) => (
                      <div key={key} className="mb-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: GOLD }}>
                          {key.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
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
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium text-slate-500 hover:text-yellow-400/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
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
  const pct = Math.min(100, Math.max(0, value));
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
    <div
      className="mt-5 rounded-xl p-4 text-center"
      style={{ background: GOLD_RGBA(0.07), border: `1px solid ${GOLD_RGBA(0.2)}` }}
    >
      <Lock className="w-5 h-5 mx-auto mb-2" style={{ color: GOLD }} />
      <p className="text-sm font-semibold text-white mb-1">Unlock Full Prediction</p>
      <p className="text-xs text-slate-400 mb-3">
        Get complete analysis, dasha details & personalised remedies
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        <a
          href={`/upgrade?id=${predictionId}&tier=basic`}
          className="px-4 py-2 rounded-full text-xs font-bold"
          style={{ background: GOLD_RGBA(0.15), color: GOLD, border: `1px solid ${GOLD_RGBA(0.3)}` }}
        >
          ₹51 — Basic
        </a>
        <a
          href={`/upgrade?id=${predictionId}&tier=standard`}
          className="px-4 py-2 rounded-full text-xs font-bold"
          style={{ background: GOLD_RGBA(0.2), color: GOLD, border: `1px solid ${GOLD_RGBA(0.4)}` }}
        >
          ₹99 — Standard
        </a>
        <a
          href={`/upgrade?id=${predictionId}&tier=premium`}
          className="px-4 py-2 rounded-full text-xs font-bold text-[#080B12]"
          style={{ background: `linear-gradient(135deg, ${GOLD}, #F5D76E)` }}
        >
          ₹499 — Premium ✦
        </a>
      </div>
    </div>
  );
}
