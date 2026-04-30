/**
 * ============================================================
 * TRIKAL VAANI — Public Report Client Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/report/[slug]/ReportPublicClient.tsx
 * VERSION: 1.0 — Gated SEO result page UI
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * WHAT GOOGLE SEES (indexed):
 *   ✅ geoDirectAnswer (40-60 words — GEO optimized)
 *   ✅ simpleSummary (full text — SEO content)
 *   ✅ Mahadasha + Antardasha + Lagna + Nakshatra
 *   ✅ Domain label + City
 *
 * WHAT IS GATED (blurred):
 *   🔒 professionalEnglish (full analysis)
 *   🔒 remedyPlan
 *   🔒 dashaAnalysis details
 *   🔒 actionWindows
 *
 * CTA: "Unlock Full Report — ₹51 only"
 * ============================================================
 */

'use client'

import Link from 'next/link'
import { ArrowLeft, Lock, Star, Shield, Clock } from 'lucide-react'
import SiteNav    from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'

const GOLD      = '#D4AF37'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`

interface ReportPublicClientProps {
  report: any
  slug:   string
  meta:   { title: string; description: string; canonical: string }
}

export default function ReportPublicClient({ report, slug, meta }: ReportPublicClientProps) {
  const summary      = report.simple_summary ?? {}
  const summaryText  = summary.text          ?? ''
  const keyMessage   = summary.keyMessage    ?? null
  const mainAction   = summary.mainAction    ?? null
  const mainCaution  = summary.mainCaution   ?? null
  const geoAnswer    = report.geo_answer ?? report.geo_direct_answer ?? ''
  const seoSignals   = report.seo_signals ?? {}
  const kundali      = report.kundali_meta ?? {}

  const upgradeUrl = `/upgrade?slug=${slug}&tier=basic`

  return (
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-yellow-400/70 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/report" className="hover:text-yellow-400/70 transition-colors">Reports</Link>
            <span>›</span>
            <span className="text-slate-400">{report.domain_label}</span>
          </div>

          {/* Hero */}
          <div className="rounded-2xl p-6 mb-5 text-center"
            style={{ background: 'rgba(4,8,20,0.9)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
            <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.55) }}>
              Vedic Astrology Analysis · {report.domain_label}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              {report.mahadasha} Mahadasha · {report.antardasha} Antardasha
            </h1>
            <p className="text-slate-400 text-sm">
              {report.birth_city} · {report.lagna} Lagna · {report.nakshatra} Nakshatra
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: GOLD_RGBA(0.1), color: GOLD, border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                ⚡ Swiss Ephemeris Precision
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
                📖 BPHS Classical Analysis
              </span>
            </div>
          </div>

          {/* GEO Direct Answer — Google loves this */}
          {geoAnswer && (
            <div className="rounded-2xl p-5 mb-5"
              style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.12)}` }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: GOLD_RGBA(0.6) }}>
                🔮 Vedic Analysis Summary
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">{geoAnswer}</p>
              <p className="text-xs text-slate-600 mt-3">
                By Rohiit Gupta, Chief Vedic Architect · Trikal Vaani · trikalvaani.com
              </p>
            </div>
          )}

          {/* Kundali Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              ['Lagna',      report.lagna      ?? '—'],
              ['Nakshatra',  report.nakshatra  ?? '—'],
              ['Mahadasha',  report.mahadasha  ?? '—'],
              ['Antardasha', report.antardasha ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* FREE — simpleSummary FULL (Google indexes this) */}
          <div className="rounded-2xl p-5 mb-5"
            style={{ background: 'rgba(4,8,20,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: GOLD_RGBA(0.6) }}>
              ✨ Your Prediction
            </p>

            {summaryText && (
              <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-line">
                {summaryText}
              </p>
            )}

            {keyMessage && (
              <div className="px-3 py-2.5 rounded-lg mb-3"
                style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <p className="text-xs font-semibold mb-1" style={{ color: GOLD }}>🔑 Key Message</p>
                <p className="text-white text-sm">{keyMessage}</p>
              </div>
            )}

            {mainAction && (
              <div className="px-3 py-2.5 rounded-lg mb-2"
                style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <p className="text-green-400 text-xs font-semibold mb-1">✓ Do This Now</p>
                <p className="text-slate-300 text-sm">{mainAction}</p>
              </div>
            )}

            {mainCaution && (
              <div className="px-3 py-2.5 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-red-400 text-xs font-semibold mb-1">✗ Avoid This</p>
                <p className="text-slate-300 text-sm">{mainCaution}</p>
              </div>
            )}
          </div>

          {/* GATED — blurred professional content */}
          <div className="relative rounded-2xl overflow-hidden mb-5"
            style={{ border: `1px solid ${GOLD_RGBA(0.15)}` }}>

            {/* Blurred preview content */}
            <div className="p-5 select-none" style={{ filter: 'blur(4px)', pointerEvents: 'none', background: 'rgba(4,8,20,0.8)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: GOLD_RGBA(0.6) }}>
                📊 Complete Planetary Analysis
              </p>
              <div className="space-y-2">
                {['Saturn in 6th house creates karmic debt patterns...', 'Jupiter Mahadasha activates 9th house fortune...', 'Rahu-Ketu axis indicates transformation...'].map((t, i) => (
                  <p key={i} className="text-slate-300 text-sm">{t}</p>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-green-400">🗓 Action Windows</p>
                <p className="text-slate-300 text-sm">15 Jun 2026 to 30 Aug 2026 — Peak favorable period...</p>
                <p className="text-slate-300 text-sm">Mantra: Om Namah Shivaya · 108x · Monday 6AM...</p>
              </div>
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6"
              style={{ background: 'linear-gradient(to bottom, rgba(8,11,18,0.3) 0%, rgba(8,11,18,0.97) 40%)' }}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: GOLD_RGBA(0.1), border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                  <Lock className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <p className="text-white font-bold text-lg mb-1">Full Analysis Locked</p>
                <p className="text-slate-400 text-sm mb-4">
                  Complete planetary analysis, remedies, action windows & 30-day roadmap
                </p>

                {/* What's inside */}
                <div className="grid grid-cols-2 gap-2 mb-5 text-left max-w-xs mx-auto">
                  {[
                    '✓ Complete Dasha Analysis',
                    '✓ Parashara Yogas',
                    '✓ Remedy Plan (Mantra/Dana)',
                    '✓ Action Windows',
                    '✓ Bhrigu Nandi Insights',
                    '✓ 30-Day Roadmap',
                  ].map((item, i) => (
                    <p key={i} className="text-xs text-slate-300">{item}</p>
                  ))}
                </div>

                {/* CTA */}
                <Link href={upgradeUrl}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD} 0%, #F5D76E 50%, ${GOLD} 100%)`,
                    color: '#080B12',
                    boxShadow: `0 0 30px ${GOLD_RGBA(0.3)}`,
                  }}>
                  🔓 Unlock Full Report — ₹51 only
                </Link>

                <p className="text-xs text-slate-600 mt-3">
                  One-time payment · Instant access · No subscription
                </p>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Star className="w-4 h-4" />, label: 'Swiss Ephemeris', sub: 'Precision engine' },
              { icon: <Shield className="w-4 h-4" />, label: 'BPHS Classical', sub: 'Ancient texts' },
              { icon: <Clock className="w-4 h-4" />, label: 'Instant Access', sub: 'After payment' },
            ].map((t, i) => (
              <div key={i} className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(4,8,20,0.6)', border: `1px solid rgba(255,255,255,0.06)` }}>
                <div className="flex justify-center mb-1" style={{ color: GOLD_RGBA(0.6) }}>{t.icon}</div>
                <p className="text-xs font-semibold text-white">{t.label}</p>
                <p className="text-xs text-slate-600">{t.sub}</p>
              </div>
            ))}
          </div>

          {/* Author attribution — E-E-A-T */}
          <div className="rounded-2xl p-4 mb-6"
            style={{ background: 'rgba(4,8,20,0.6)', border: `1px solid rgba(255,255,255,0.06)` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <img src="/images/founder.png" alt="Rohiit Gupta" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Rohiit Gupta</p>
                <p className="text-xs text-slate-500">Chief Vedic Architect · Trikal Vaani · Delhi NCR</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              This analysis is powered by Swiss Ephemeris — the same engine used by professional astrologers worldwide —
              combined with Brihat Parashara Hora Shastra classical rules and Bhrigu Nandi Nadi patterns.
            </p>
          </div>

          {/* New prediction CTA */}
          <div className="text-center">
            <Link href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium text-slate-500 hover:text-yellow-400/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Get your own prediction
            </Link>
          </div>

        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
