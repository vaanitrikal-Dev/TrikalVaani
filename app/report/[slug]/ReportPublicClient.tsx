'use client'

/**
 * ============================================================
 * TRIKAL VAANI — Public SEO Report Client
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/report/[slug]/ReportPublicClient.tsx
 * VERSION: 4.0 — SEO + GEO + Maa Shakti + Conversion
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   Public-facing /report/[slug] page — indexed by Google + AI search
 *   Every prediction = one SEO page = organic traffic
 *   1000 predictions = 1000 indexed pages = SEO army 🔱
 *
 * SEO/GEO STRATEGY:
 *   → geoDirectAnswer in hero (AI search featured snippet)
 *   → Author schema signals (Rohiit Gupta E-E-A-T)
 *   → Swiss Ephemeris + BPHS + Bhrigu + Shadbala in meta
 *   → Domain keywords in every section
 *   → FAQPage schema via parent page.tsx
 *
 * CONVERSION STRATEGY:
 *   FREE visitors → See enough value → ₹51 unlock
 *   ALL visitors → See Maa Shakti → Devotional offering
 *
 * LAYOUT:
 *   S1  → Mahakaal Ka Ashirwad (Hero + GEO answer)
 *   S2  → Trikal Ka Sandesh (Summary)
 *   S3  → Kundali Stats (Lagna/Nakshatra/Dasha)
 *   S4  → Key Prediction (locked for paid)
 *   S5  → Trikal ne aur bhi dekha (₹51 CTA)
 *   S6  → Maa Shakti (PERMANENT — both)
 *   S7  → Author E-E-A-T + Trust signals
 *   S8  → Share + New Reading CTA
 * ============================================================
 */

import { useState } from 'react'
import Link          from 'next/link'
import SiteNav       from '@/components/layout/SiteNav'
import SiteFooter    from '@/components/layout/SiteFooter'
import { ArrowLeft, Lock, Star, Shield, Clock, Zap, BookOpen } from 'lucide-react'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const GOLD       = '#D4AF37'
const GOLD_RGBA  = (a: number) => `rgba(212,175,55,${a})`
const BG_DARK    = '#080B12'
const BG_CARD    = 'rgba(4,8,20,0.9)'

const ARZI_AMOUNTS      = [101, 201, 501, 1001, 2101, 5001, 11000, 21000, 51000, 108000]
const DHANYAWAD_AMOUNTS = [101, 251, 501, 1008, 2501, 5001, 10001, 21000, 51000, 108000]

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface SeoMeta {
  title:       string
  description: string
  canonical:   string
}

interface ReportPublicClientProps {
  report: Record<string, unknown>
  slug:   string
  meta:   SeoMeta
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function str(val: unknown, fallback = '—'): string {
  return typeof val === 'string' && val ? val : fallback
}

function getNestedStr(obj: Record<string, unknown>, ...keys: string[]): string {
  let current: unknown = obj
  for (const key of keys) {
    if (!current || typeof current !== 'object') return '—'
    current = (current as Record<string, unknown>)[key]
  }
  return str(current)
}

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────

function StatChip({ label, value, color = GOLD }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      padding:      '8px 14px',
      borderRadius: '10px',
      background:   `${color}10`,
      border:       `1px solid ${color}25`,
      textAlign:    'center',
    }}>
      <p style={{ margin: '0 0 2px', color: `${color}80`, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: 700 }}>{value}</p>
    </div>
  )
}

function AuthorityBadge({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           '4px',
      padding:       '4px 10px',
      borderRadius:  '20px',
      fontSize:      '10px',
      fontWeight:    600,
      background:    `${color}15`,
      border:        `1px solid ${color}30`,
      color,
    }}>
      {icon} {label}
    </span>
  )
}

// ─── MAA SHAKTI SECTION ───────────────────────────────────────────────────────

function MaaShaktiSection({ slug }: { slug: string }) {
  const [activeTab, setActiveTab] = useState<'arzi' | 'dhanyawad'>('arzi')

  const amounts  = activeTab === 'arzi' ? ARZI_AMOUNTS : DHANYAWAD_AMOUNTS
  const waBase   = activeTab === 'arzi'
    ? `Pranam%20Rohiit%20ji%2C%20Maa%20ko%20Arzi%20karna%20chahta%20hoon.%20Report:%20${slug}.%20Jai%20Maa%20Shakti!`
    : `Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20sun%20li.%20Dhanyawad%20dena%20chahta%20hoon.%20Report:%20${slug}.`

  return (
    <div style={{
      background:   `linear-gradient(135deg, ${GOLD_RGBA(0.07)} 0%, rgba(124,58,237,0.07) 100%)`,
      border:       `1px solid ${GOLD_RGBA(0.25)}`,
      borderRadius: '20px',
      padding:      '28px 20px',
      marginBottom: '16px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🙏</div>
        <h2 style={{
          margin:      '0 0 6px',
          color:       GOLD,
          fontSize:    '20px',
          fontFamily:  'Georgia, serif',
          fontWeight:  700,
        }}>
          Maa Shakti Ki Divya Seva
        </h2>
        <p style={{
          margin:     0,
          color:      GOLD_RGBA(0.65),
          fontSize:   '12px',
          lineHeight: 1.6,
          maxWidth:   '320px',
          margin:     '0 auto',
        }}>
          Yeh fees nahi — yeh dil ki dakshina hai,
          Maa ke charnon mein. Koi seema nahi devotion ki.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display:      'flex',
        gap:          '8px',
        marginBottom: '18px',
        background:   'rgba(0,0,0,0.35)',
        padding:      '4px',
        borderRadius: '12px',
      }}>
        {(['arzi', 'dhanyawad'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex:         1,
              padding:      '10px',
              borderRadius: '10px',
              border:       'none',
              cursor:       'pointer',
              background:   activeTab === tab
                ? `linear-gradient(135deg, ${GOLD}, #A8820A)`
                : 'transparent',
              color:        activeTab === tab ? '#080B12' : GOLD_RGBA(0.55),
              fontSize:     '13px',
              fontWeight:   700,
              transition:   'all 0.3s ease',
            }}
          >
            {tab === 'arzi' ? '🪔 Arzi to Maa' : '🌺 Dhanyawad to Maa'}
          </button>
        ))}
      </div>

      {/* Description */}
      <p style={{
        color:        '#94a3b8',
        fontSize:     '12px',
        margin:       '0 0 16px',
        lineHeight:   1.6,
        textAlign:    'center',
      }}>
        {activeTab === 'arzi'
          ? 'Apni deepest prayer Maa Shakti ke charnon mein rakhein. Rohiit ji personally Vedic mantra recitation ke dauran transmit karenge.'
          : 'Aapki prayer answer ho gayi? Maa ka Dhanyawad karein — gratitude hi sabse badi puja hai. Gratitude blessings ko multiply karta hai.'}
      </p>

      {/* Amount buttons */}
      <div style={{
        display:       'flex',
        flexWrap:      'wrap',
        gap:           '8px',
        justifyContent:'center',
        marginBottom:  '16px',
      }}>
        {amounts.map(amt => (
          <a
            key={amt}
            href={`https://wa.me/919211804111?text=${waBase}%20Dakshina%20Rs.${amt}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding:        '6px 14px',
              borderRadius:   '20px',
              border:         `1px solid ${GOLD_RGBA(0.3)}`,
              color:          GOLD,
              fontSize:       '12px',
              fontWeight:     600,
              textDecoration: 'none',
              background:     GOLD_RGBA(0.08),
              transition:     'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = GOLD_RGBA(0.2))}
            onMouseLeave={e => (e.currentTarget.style.background = GOLD_RGBA(0.08))}
          >
            ₹{amt.toLocaleString('en-IN')}
          </a>
        ))}
        <a
          href={`https://wa.me/919211804111?text=${waBase}%20(apni%20dakshina%20bataunga)`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding:        '6px 14px',
            borderRadius:   '20px',
            border:         `1px dashed ${GOLD_RGBA(0.3)}`,
            color:          GOLD,
            fontSize:       '12px',
            fontWeight:     600,
            textDecoration: 'none',
            background:     'transparent',
          }}
        >
          Apni dakshina ✦
        </a>
      </div>

      <p style={{ color: '#334155', fontSize: '10px', margin: '0 0 16px', textAlign: 'center' }}>
        Koi bhi raqam — dil se. Devotion ki koi seema nahi. Starting ₹101.
      </p>

      {/* Main CTA */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <a
          href={`https://wa.me/919211804111?text=${waBase}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:        'inline-block',
            padding:        '14px 32px',
            borderRadius:   '12px',
            background:     `linear-gradient(135deg, ${GOLD}, #F5D76E, ${GOLD})`,
            color:          '#080B12',
            fontSize:       '14px',
            fontWeight:     700,
            textDecoration: 'none',
            boxShadow:      `0 0 25px ${GOLD_RGBA(0.3)}`,
          }}
        >
          {activeTab === 'arzi' ? '🙏 Arzi Submit Karein' : '🌺 Dhanyawad Dein'}
        </a>
      </div>

      {/* Disclaimer */}
      <p style={{
        color:      '#1e293b',
        fontSize:   '10px',
        margin:     '14px 0 0',
        textAlign:  'center',
        lineHeight: 1.5,
      }}>
        Trikal Vaani dakshina se profit nahi karta. Sab Vedic puja samagri
        + charitable giving mein jaata hai. Rohiit Gupta intermediary hain — Maa Shakti recipient hain.
      </p>
    </div>
  )
}

// ─── LOCKED CONTENT SECTION ───────────────────────────────────────────────────

function LockedSection({ slug }: { slug: string }) {
  const upgradeUrl = `/upgrade?slug=${slug}&tier=basic`

  const features = [
    '✓ Complete planetary analysis (all 9 grahas)',
    '✓ Bhrigu Nandi pattern insights',
    '✓ Shadbala strength breakdown',
    '✓ 3 action windows with exact dates',
    '✓ Full remedy plan (mantra+dana+vrat)',
    '✓ 30-day roadmap',
    '✓ Panchang muhurta guidance',
    '✓ 800-1200 word deep analysis',
  ]

  return (
    <div style={{
      position:     'relative',
      borderRadius: '16px',
      overflow:     'hidden',
      marginBottom: '16px',
      border:       `1px solid ${GOLD_RGBA(0.15)}`,
    }}>
      {/* Blurred preview */}
      <div style={{
        padding:        '20px',
        filter:         'blur(5px)',
        pointerEvents:  'none',
        userSelect:     'none',
        background:     BG_CARD,
      }}>
        <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
          📊 Complete Planetary Analysis
        </p>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px' }}>
          Saturn in 6th house creates karmic debt pattern — Rahu amplifying financial anxiety...
        </p>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px' }}>
          Jupiter Mahadasha activates 9th house fortune — but Saturn Antardasha delays...
        </p>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px' }}>
          Vipreet Raj Yoga active — rise after adversity is guaranteed (BPHS Ch.38)...
        </p>
        <p style={{ color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>
          🗓 Action Window: 15 Jun 2026 – 30 Aug 2026...
        </p>
      </div>

      {/* Lock overlay */}
      <div style={{
        position:   'absolute',
        inset:      0,
        display:    'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding:    '24px',
        background: 'linear-gradient(to bottom, rgba(8,11,18,0.2) 0%, rgba(8,11,18,0.98) 35%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          {/* Lock icon */}
          <div style={{
            width:          '52px',
            height:         '52px',
            borderRadius:   '50%',
            background:     GOLD_RGBA(0.1),
            border:         `1px solid ${GOLD_RGBA(0.35)}`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 14px',
          }}>
            <Lock className="w-5 h-5" style={{ color: GOLD }} />
          </div>

          <p style={{ margin: '0 0 4px', color: '#fff', fontSize: '17px', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
            Trikal Ne Aur Bhi Dekha Hai
          </p>
          <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '12px', lineHeight: 1.6, maxWidth: '280px' }}>
            Aapki kundali mein complete analysis, yogas, remedies aur 30-day roadmap taiyaar hai
          </p>

          {/* Feature grid */}
          <div style={{
            display:               'grid',
            gridTemplateColumns:   '1fr 1fr',
            gap:                   '6px',
            marginBottom:          '20px',
            maxWidth:              '320px',
            margin:                '0 auto 20px',
            textAlign:             'left',
          }}>
            {features.map((f, i) => (
              <p key={i} style={{ margin: 0, color: '#94a3b8', fontSize: '11px', lineHeight: 1.5 }}>{f}</p>
            ))}
          </div>

          {/* CTA */}
          <Link
            href={upgradeUrl}
            style={{
              display:        'inline-block',
              padding:        '14px 32px',
              borderRadius:   '12px',
              background:     `linear-gradient(135deg, ${GOLD}, #F5D76E, ${GOLD})`,
              color:          '#080B12',
              fontSize:       '14px',
              fontWeight:     700,
              textDecoration: 'none',
              boxShadow:      `0 0 30px ${GOLD_RGBA(0.35)}`,
              marginBottom:   '10px',
              display:        'block',
            }}
          >
            🔓 Unlock Full Report — ₹51 Only
          </Link>
          <p style={{ margin: '8px 0 0', color: '#475569', fontSize: '10px' }}>
            One-time · Instant access · Razorpay secure payment
          </p>

          <a
            href="https://wa.me/919211804111?text=Rohiit%20ji%2C%20personal%20consultation%20chahiye%20—%20₹499"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:        'block',
              marginTop:      '10px',
              color:          '#25D366',
              fontSize:       '12px',
              textDecoration: 'none',
              fontWeight:     600,
            }}
          >
            📞 Ya Rohiit ji se seedha baat karein — ₹499
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ReportPublicClient({ report, slug, meta }: ReportPublicClientProps) {

  // Extract data safely
  const summaryText  = str(report.simple_summary as string)
  const predJson     = (report.prediction_json as Record<string, unknown>) ?? {}
  const simpleSummary = (predJson.simpleSummary as Record<string, unknown>) ?? {}
  const keyMessage   = str(simpleSummary.keyMessage as string)
  const mainAction   = str(simpleSummary.mainAction as string)
  const mainCaution  = str(simpleSummary.mainCaution as string)

  const geoAnswer    = str(report.geo_answer,
    str(report.geo_direct_answer, ''))

  const domainLabel  = str(report.domain_label, 'Vedic Reading')
  const personName   = str(report.person_name, 'Seeker')
  const birthCity    = str(report.birth_city, 'India')
  const lagna        = str(report.lagna as string) !== '—' ? str(report.lagna as string) : str((predJson as any)?.lagnaRashi)
  const nakshatra    = str(report.nakshatra)
  const mahadasha    = str(report.mahadasha)
  const antardasha   = str(report.antardasha)
  const tier         = str(report.tier, 'free')
  const language     = str(report.language, 'hinglish')
  const templateHtml = report.template_html as string | null

  const upgradeUrl   = `/upgrade?slug=${slug}&tier=basic`

  // Stats for display
  const stats = [
    { label: 'Lagna',      value: lagna },
    { label: 'Nakshatra',  value: nakshatra },
    { label: 'Mahadasha',  value: mahadasha },
    { label: 'Antardasha', value: antardasha },
  ]

  // Trust items
  const trustItems = [
    { icon: <Star className="w-3.5 h-3.5" />,   label: 'Swiss Ephemeris', sub: 'Precision engine' },
    { icon: <BookOpen className="w-3.5 h-3.5" />,label: 'BPHS Classical',  sub: 'Ancient texts' },
    { icon: <Zap className="w-3.5 h-3.5" />,    label: 'Bhrigu Nandi',    sub: 'Pattern engine' },
    { icon: <Shield className="w-3.5 h-3.5" />, label: 'Shadbala',        sub: 'Strength system' },
    { icon: <Clock className="w-3.5 h-3.5" />,  label: 'Instant Access',  sub: 'After payment' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: BG_DARK }}>
      <SiteNav />
      <main style={{ paddingTop: '96px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Link href="/" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#334155', fontSize: '12px' }}>›</span>
            <Link href="/services" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none' }}>Readings</Link>
            <span style={{ color: '#334155', fontSize: '12px' }}>›</span>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{domainLabel}</span>
          </nav>

          {/* ── S1: MAHAKAAL KA ASHIRWAD ────────────────────────────────── */}
          <div style={{
            background:   `linear-gradient(135deg, ${GOLD_RGBA(0.1)} 0%, rgba(8,11,18,0.95) 70%)`,
            border:       `1px solid ${GOLD_RGBA(0.2)}`,
            borderRadius: '20px',
            padding:      '24px 20px',
            marginBottom: '14px',
            textAlign:    'center',
          }}>
            {/* Mahakaal blessing bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ height: '1px', flex: 1, background: `linear-gradient(to right, transparent, ${GOLD_RGBA(0.3)})` }} />
              <span style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                🔱 Mahakaal Ka Ashirwad
              </span>
              <div style={{ height: '1px', flex: 1, background: `linear-gradient(to left, transparent, ${GOLD_RGBA(0.3)})` }} />
            </div>

            {/* Domain + type */}
            <p style={{ margin: '0 0 6px', color: GOLD_RGBA(0.6), fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Vedic Astrology Analysis · {domainLabel}
            </p>
            <h1 style={{ margin: '0 0 6px', color: '#fff', fontSize: '20px', fontFamily: 'Georgia, serif', fontWeight: 700 }}>
              {mahadasha} Mahadasha · {antardasha} Antardasha
            </h1>
            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '13px' }}>
              {birthCity} · {lagna} Lagna · {nakshatra} Nakshatra
            </p>

            {/* 4 Authority badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '12px' }}>
              <AuthorityBadge icon="⚡" label="Swiss Ephemeris" color="#60a5fa" />
              <AuthorityBadge icon="📖" label="BPHS Classical" color="#a78bfa" />
              <AuthorityBadge icon="🔮" label="Bhrigu Nandi" color="#f472b6" />
              <AuthorityBadge icon="⚖️" label="Shadbala" color="#34d399" />
            </div>

            {/* GEO Direct Answer — SEO gold */}
            {geoAnswer && (
              <div style={{
                background:   GOLD_RGBA(0.06),
                border:       `1px solid ${GOLD_RGBA(0.15)}`,
                borderRadius: '12px',
                padding:      '14px',
                marginTop:    '12px',
                textAlign:    'left',
              }}>
                <p style={{ margin: '0 0 6px', color: GOLD_RGBA(0.6), fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  🔮 Vedic Analysis — Trikal Ka Sandesh
                </p>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px', lineHeight: 1.8 }}>
                  {geoAnswer}
                </p>
                <p style={{ margin: '8px 0 0', color: '#334155', fontSize: '10px' }}>
                  By Rohiit Gupta, Chief Vedic Architect · trikalvaani.com
                </p>
              </div>
            )}
          </div>

          {/* ── S2: TRIKAL KA SANDESH ───────────────────────────────────── */}
          <div style={{
            background:   BG_CARD,
            border:       `1px solid ${GOLD_RGBA(0.12)}`,
            borderRadius: '16px',
            padding:      '20px',
            marginBottom: '14px',
          }}>
            <p style={{ margin: '0 0 14px', color: GOLD, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ✨ Trikal Ka Sandesh
            </p>

            {/* Summary text */}
            {summaryText && summaryText !== '—' && (
              <div style={{
                background:   GOLD_RGBA(0.04),
                border:       `1px solid ${GOLD_RGBA(0.1)}`,
                borderRadius: '10px',
                padding:      '14px',
                marginBottom: '14px',
              }}>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                  {summaryText}
                </p>
              </div>
            )}

            {/* Key message */}
            {keyMessage && keyMessage !== '—' && (
              <div style={{
                background:   `linear-gradient(135deg, ${GOLD_RGBA(0.12)}, ${GOLD_RGBA(0.04)})`,
                border:       `1px solid ${GOLD_RGBA(0.3)}`,
                borderRadius: '10px',
                padding:      '12px 14px',
                marginBottom: '12px',
              }}>
                <p style={{ margin: '0 0 4px', color: GOLD, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  🔑 Core Message
                </p>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>
                  {keyMessage}
                </p>
              </div>
            )}

            {/* Action + Caution */}
            {(mainAction !== '—' || mainCaution !== '—') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {mainAction !== '—' && (
                  <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ margin: '0 0 4px', color: '#22c55e', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em' }}>✓ ABHI KAREIN</p>
                    <p style={{ margin: 0, color: '#86efac', fontSize: '12px', lineHeight: 1.5 }}>{mainAction}</p>
                  </div>
                )}
                {mainCaution !== '—' && (
                  <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ margin: '0 0 4px', color: '#ef4444', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em' }}>✗ BACHEIN</p>
                    <p style={{ margin: 0, color: '#fca5a5', fontSize: '12px', lineHeight: 1.5 }}>{mainCaution}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── S2.5: TEMPLATE HTML (if available) ──────────────────────── */}
          {templateHtml && (
            <div style={{
              background:   BG_CARD,
              border:       `1px solid ${GOLD_RGBA(0.12)}`,
              borderRadius: '16px',
              padding:      '20px',
              marginBottom: '14px',
            }} dangerouslySetInnerHTML={{ __html: templateHtml }} />
          )}

          {/* ── S3: KUNDALI STATS ───────────────────────────────────────── */}
          <div style={{
            display:               'grid',
            gridTemplateColumns:   'repeat(2, 1fr)',
            gap:                   '10px',
            marginBottom:          '14px',
          }}>
            {stats.map(({ label, value }) => (
              <StatChip key={label} label={label} value={value} />
            ))}
          </div>

          {/* ── S4: LOCKED FULL ANALYSIS ────────────────────────────────── */}
          <LockedSection slug={slug} />

          {/* ── S5: TRUST SIGNALS ───────────────────────────────────────── */}
          <div style={{
            display:               'grid',
            gridTemplateColumns:   'repeat(3, 1fr)',
            gap:                   '8px',
            marginBottom:          '14px',
          }}>
            {trustItems.slice(0, 3).map((t, i) => (
              <div key={i} style={{
                background:   BG_CARD,
                border:       `1px solid rgba(255,255,255,0.06)`,
                borderRadius: '12px',
                padding:      '12px',
                textAlign:    'center',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', color: GOLD_RGBA(0.6) }}>
                  {t.icon}
                </div>
                <p style={{ margin: '0 0 2px', color: '#fff', fontSize: '11px', fontWeight: 700 }}>{t.label}</p>
                <p style={{ margin: 0, color: '#475569', fontSize: '9px' }}>{t.sub}</p>
              </div>
            ))}
          </div>

          {/* ── S6: MAA SHAKTI (PERMANENT — BOTH TIERS) ─────────────────── */}
          <MaaShaktiSection slug={slug} />

          {/* ── S7: AUTHOR E-E-A-T ──────────────────────────────────────── */}
          <div style={{
            background:   BG_CARD,
            border:       `1px solid rgba(255,255,255,0.06)`,
            borderRadius: '14px',
            padding:      '16px',
            marginBottom: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              {/* Author avatar */}
              <div style={{
                width:          '44px',
                height:         '44px',
                borderRadius:   '50%',
                overflow:       'hidden',
                flexShrink:     0,
                border:         `1px solid ${GOLD_RGBA(0.35)}`,
                background:     GOLD_RGBA(0.1),
              }}>
                <img
                  src="/rohiit-gupta.jpg"
                  alt="Rohiit Gupta — Chief Vedic Architect"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
              <div>
                <p style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: 700 }}>Rohiit Gupta</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>
                  Chief Vedic Architect · Trikal Vaani · Delhi NCR
                </p>
              </div>
            </div>
            <p style={{ margin: '0 0 10px', color: '#64748b', fontSize: '12px', lineHeight: 1.6 }}>
              This analysis is powered by Swiss Ephemeris — the same engine used by professional
              astrologers worldwide — combined with Brihat Parashara Hora Shastra classical rules,
              Bhrigu Nandi Nadi patterns, and Shadbala strength calculations.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['15+ Years Vedic Study', 'Parashara BPHS', 'Swiss Ephemeris', 'Delhi NCR'].map(tag => (
                <span key={tag} style={{
                  padding:    '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.04)',
                  border:     '1px solid rgba(255,255,255,0.08)',
                  color:      '#64748b',
                  fontSize:   '10px',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── S8: SHARE + NEW READING ─────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
              <a
                href={`https://wa.me/?text=Maine%20Trikal%20Vaani%20pe%20kundali%20padhi%20—%20bahut%20accurate!%20${encodeURIComponent('https://trikalvaani.com/report/' + slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding:        '10px 20px',
                  borderRadius:   '10px',
                  background:     'rgba(37,211,102,0.08)',
                  border:         '1px solid rgba(37,211,102,0.25)',
                  color:          '#25D366',
                  fontSize:       '12px',
                  fontWeight:     600,
                  textDecoration: 'none',
                }}
              >
                📱 WhatsApp Share
              </a>
              <Link
                href="/"
                style={{
                  padding:        '10px 20px',
                  borderRadius:   '10px',
                  background:     GOLD_RGBA(0.08),
                  border:         `1px solid ${GOLD_RGBA(0.25)}`,
                  color:          GOLD,
                  fontSize:       '12px',
                  fontWeight:     600,
                  textDecoration: 'none',
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '6px',
                }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Apni Reading Karein
              </Link>
            </div>

            <p style={{ margin: 0, color: '#1e293b', fontSize: '10px', lineHeight: 1.5 }}>
              🔱 Trikal Vaani — Kaal bada balwan hai, sabko nach nachaye<br />
              trikalvaani.com · Rohiit Gupta, Chief Vedic Architect, Delhi NCR
            </p>
          </div>

        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
