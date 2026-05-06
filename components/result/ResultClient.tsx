'use client';

/**
 * ============================================================
 * TRIKAL VAANI — Prediction Result Client
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/result/ResultClient.tsx
 * VERSION: 3.0 — Complete Prediction Layout
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * LAYOUT (11 Sections):
 *   S1  → Mahakaal Ka Ashirwad (Identity Bar)
 *   S2  → Trikal Ka Sandesh (Gemini Summary)
 *   S3  → Kundali Chart (Full — both tiers)
 *   S4  → Planet Table (All 9 + Shadbala — both tiers)
 *   S5  → Dasha Timeline (MD+AD+PD+SD)
 *   S6  → Domain Analysis (Yogas + Ashtakavarga)
 *   S7  → Remedy Plan
 *   S8  → Panchang Today
 *   S9  → Conversion CTA (FREE only — "Trikal ne aur bhi dekha")
 *   S10 → Maa Shakti Section (BOTH tiers — PERMANENT)
 *   S11 → Share + Return
 *
 * CONVERSION STRATEGY:
 *   FREE  → S3+S4 full data shown → curiosity → S9 converts to ₹51
 *   PAID  → S2 800-1200w full → S10 Maa Shakti → WhatsApp ₹499
 * ============================================================
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SiteNav    from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const GOLD       = '#D4AF37';
const GOLD_LIGHT = 'rgba(212,175,55,0.15)';
const GOLD_BORDER= 'rgba(212,175,55,0.25)';
const BG_CARD    = 'rgba(11,16,26,0.9)';
const BG_DARK    = '#080B12';

const ARZI_AMOUNTS    = [101, 201, 501, 1001, 2101, 5001, 11000, 21000, 51000, 108000];
const DHANYAWAD_AMOUNTS = [101, 251, 501, 1008, 2501, 5001, 10001, 21000, 51000, 108000];

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const PLANET_HINDI: Record<string, string> = {
  Sun: 'Surya', Moon: 'Chandra', Mars: 'Mangal', Mercury: 'Budh',
  Jupiter: 'Guru', Venus: 'Shukra', Saturn: 'Shani', Rahu: 'Rahu', Ketu: 'Ketu',
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface PlanetData {
  name:        string;
  rashi:       string;
  house:       number;
  strength:    number;
  isRetrograde: boolean;
  nakshatra:   string;
  shadbala?:   { classification: string; isStrong: boolean; total: number; } | null;
}

interface ResultMeta {
  personName:      string;
  domainId:        string;
  domainLabel:     string;
  tier:            'free' | 'basic' | 'pro' | 'premium';
  lagna:           string;
  nakshatra:       string;
  mahadasha:       string;
  antardasha:      string;
  language:        string;
  confidenceLabel?: string;
  primaryYoga?:    string;
  processingMs?:   number;
  analysisDate?:   string;
}

interface ResultClientProps {
  predictionId:   string;
  predictionData: Record<string, any>;
  meta:           ResultMeta;
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function SectionCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background:   BG_CARD,
      border:       `1px solid ${GOLD_BORDER}`,
      borderRadius: '16px',
      padding:      '24px',
      marginBottom: '16px',
      backdropFilter: 'blur(10px)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: `1px solid rgba(212,175,55,0.12)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: 700, fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}>
            {title}
          </h2>
          {subtitle && <p style={{ margin: '2px 0 0', color: GOLD, fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function StrengthBar({ value }: { value: number }) {
  const color = value >= 70 ? '#22c55e' : value >= 45 ? GOLD : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 1s ease' }} />
      </div>
      <span style={{ color, fontSize: '11px', fontWeight: 700, minWidth: '32px' }}>{value}%</span>
    </div>
  );
}

function Badge({ label, color = GOLD }: { label: string; color?: string }) {
  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      padding:      '3px 10px',
      borderRadius: '20px',
      fontSize:     '10px',
      fontWeight:   600,
      letterSpacing: '0.05em',
      background:   `${color}18`,
      border:       `1px solid ${color}35`,
      color,
    }}>
      {label}
    </span>
  );
}

// ─── NORTH INDIAN KUNDALI CHART ───────────────────────────────────────────────

function KundaliChart({ lagna, planets }: { lagna: string; planets: Record<string, PlanetData> }) {
  // House positions for North Indian chart
  const HOUSE_POSITIONS = [
    { house: 12, x: 0,    y: 0,    w: 120, h: 120 },
    { house: 1,  x: 120,  y: 0,    w: 160, h: 120 },
    { house: 2,  x: 280,  y: 0,    w: 120, h: 120 },
    { house: 11, x: 0,    y: 120,  w: 120, h: 160 },
    { house: 3,  x: 280,  y: 120,  w: 120, h: 160 },
    { house: 10, x: 0,    y: 280,  w: 120, h: 120 },
    { house: 9,  x: 120,  y: 280,  w: 160, h: 120 },
    { house: 8,  x: 280,  y: 280,  w: 120, h: 120 },
    { house: 4,  x: 120,  y: 120,  w: 80,  h: 80  },
    { house: 5,  x: 200,  y: 120,  w: 80,  h: 80  },
    { house: 6,  x: 120,  y: 200,  w: 80,  h: 80  },
    { house: 7,  x: 200,  y: 200,  w: 80,  h: 80  },
  ];

  // Group planets by house
  const houseMap: Record<number, string[]> = {};
  Object.entries(planets).forEach(([name, p]) => {
    if (!houseMap[p.house]) houseMap[p.house] = [];
    houseMap[p.house].push(PLANET_HINDI[name] || name);
  });

  return (
    <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
      <svg width="400" height="400" viewBox="0 0 400 400" style={{ maxWidth: '100%' }}>
        {/* Background */}
        <rect width="400" height="400" fill="rgba(6,10,20,0.8)" rx="8" />

        {/* House cells */}
        {HOUSE_POSITIONS.map(({ house, x, y, w, h }) => (
          <g key={house}>
            <rect
              x={x} y={y} width={w} height={h}
              fill={house === 1 ? 'rgba(212,175,55,0.08)' : 'transparent'}
              stroke="rgba(212,175,55,0.3)"
              strokeWidth="1"
            />
            {/* House number */}
            <text
              x={x + 8} y={y + 16}
              fill="rgba(212,175,55,0.4)"
              fontSize="10"
              fontFamily="Georgia, serif"
            >
              {house}
            </text>
            {/* Planets in house */}
            {(houseMap[house] || []).map((planet, i) => (
              <text
                key={planet}
                x={x + w / 2}
                y={y + h / 2 + i * 14 - ((houseMap[house].length - 1) * 7)}
                fill={house === 1 ? GOLD : '#94a3b8'}
                fontSize="10"
                fontFamily="Georgia, serif"
                textAnchor="middle"
                fontWeight={house === 1 ? '700' : '400'}
              >
                {planet}
              </text>
            ))}
            {/* Lagna marker */}
            {house === 1 && (
              <text x={x + w - 8} y={y + h - 8} fill={GOLD} fontSize="11" textAnchor="end" fontWeight="700">L</text>
            )}
          </g>
        ))}

        {/* Center diagonal lines for North Indian style */}
        <line x1="120" y1="120" x2="200" y2="200" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
        <line x1="280" y1="120" x2="200" y2="200" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
        <line x1="120" y1="280" x2="200" y2="200" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
        <line x1="280" y1="280" x2="200" y2="200" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />

        {/* Lagna label center */}
        <text x="200" y="208" fill="rgba(212,175,55,0.3)" fontSize="9" textAnchor="middle">
          {lagna} Lagna
        </text>
      </svg>
    </div>
  );
}

// ─── MAA SHAKTI SECTION ───────────────────────────────────────────────────────

function MaaShaktiSection() {
  const [activeTab, setActiveTab] = useState<'arzi' | 'dhanyawad'>('arzi');

  const amounts    = activeTab === 'arzi' ? ARZI_AMOUNTS : DHANYAWAD_AMOUNTS;
  const waText     = activeTab === 'arzi'
    ? 'Pranam%20Rohiit%20ji%2C%20Maa%20ko%20Arzi%20karna%20chahta%20hoon.%20Jai%20Maa%20Shakti!'
    : 'Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20sun%20li.%20Dhanyawad%20dena%20chahta%20hoon.';

  return (
    <div style={{
      background:   'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(124,58,237,0.06) 100%)',
      border:       `1px solid ${GOLD_BORDER}`,
      borderRadius: '20px',
      padding:      '28px 24px',
      marginBottom: '16px',
      textAlign:    'center',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🙏</div>
        <h2 style={{ margin: '0 0 6px', color: GOLD, fontSize: '20px', fontFamily: 'Georgia, serif', fontWeight: 700 }}>
          Maa Shakti Ki Divya Seva
        </h2>
        <p style={{ margin: 0, color: 'rgba(212,175,55,0.7)', fontSize: '12px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Yeh fees nahi — yeh dil ki dakshina hai, Maa ke charnon mein. Koi seema nahi devotion ki.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' }}>
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
              background:   activeTab === tab ? `linear-gradient(135deg, ${GOLD}, #A8820A)` : 'transparent',
              color:        activeTab === tab ? '#080B12' : 'rgba(212,175,55,0.6)',
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
      <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 16px', lineHeight: 1.6 }}>
        {activeTab === 'arzi'
          ? 'Apni deepest prayer Maa Shakti ke charnon mein rakhein. Rohiit ji personally transmit karenge Vedic prayer ke dauran.'
          : 'Aapki prayer answer ho gayi? Maa Shakti ka Dhanyawad karein — gratitude hi sabse badi puja hai.'}
      </p>

      {/* Amount buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
        {amounts.map(amt => (
          <a
            key={amt}
            href={`https://wa.me/919211804111?text=${waText}%20Dakshina%20₹${amt}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding:      '6px 14px',
              borderRadius: '20px',
              border:       `1px solid ${GOLD_BORDER}`,
              color:        GOLD,
              fontSize:     '12px',
              fontWeight:   600,
              textDecoration: 'none',
              background:   GOLD_LIGHT,
              transition:   'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = GOLD_LIGHT)}
          >
            ₹{amt.toLocaleString('en-IN')}
          </a>
        ))}
        <a
          href={`https://wa.me/919211804111?text=${waText}%20(apni%20dakshina%20bataunga)`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding:      '6px 14px',
            borderRadius: '20px',
            border:       `1px dashed ${GOLD_BORDER}`,
            color:        GOLD,
            fontSize:     '12px',
            fontWeight:   600,
            textDecoration: 'none',
            background:   'transparent',
          }}
        >
          Apni dakshina ✦
        </a>
      </div>

      <p style={{ color: '#475569', fontSize: '10px', margin: '0 0 16px' }}>
        Koi bhi raqam — dil se. Devotion ki koi seema nahi.
      </p>

      {/* CTA Button */}
      <a
        href={`https://wa.me/919211804111?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display:      'inline-block',
          padding:      '14px 32px',
          borderRadius: '12px',
          background:   `linear-gradient(135deg, ${GOLD}, #F5D76E, ${GOLD})`,
          color:        '#080B12',
          fontSize:     '14px',
          fontWeight:   700,
          textDecoration: 'none',
          boxShadow:    `0 0 25px rgba(212,175,55,0.3)`,
        }}
      >
        {activeTab === 'arzi' ? '🙏 Arzi Submit Karein' : '🌺 Dhanyawad Dein'}
      </a>

      <p style={{ color: '#334155', fontSize: '10px', margin: '12px 0 0', lineHeight: 1.5 }}>
        Rohiit Gupta ji intermediary hain — Maa Shakti recipient hain.<br />
        Sab dakshina Vedic puja samagri + charitable giving mein jaati hai.
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ResultClient({ predictionId, predictionData, meta }: ResultClientProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isFree    = meta.tier === 'free';
  const isPaid    = !isFree;

  // Extract prediction data
// Multi-path extraction — handles all Gemini response structures
const simpleSummary  = predictionData?.simple_summary 
                    ?? predictionData?.simpleSummary
                    ?? predictionData?.trikal_sandesh
                    ?? predictionData?.trikalkaSandesh;

const summaryText    = typeof simpleSummary === 'string' 
                     ? simpleSummary 
                     : simpleSummary?.text 
                    ?? predictionData?.summary 
                    ?? predictionData?.geoDirectAnswer 
                    ?? '';

const keyMessage     = simpleSummary?.keyMessage 
                    ?? predictionData?.coreMessage
                    ?? predictionData?.core_message ?? '';

const mainAction     = simpleSummary?.mainAction 
                    ?? predictionData?.doAction
                    ?? predictionData?.do_action ?? '';

const mainCaution    = simpleSummary?.mainCaution 
                    ?? predictionData?.avoidAction
                    ?? predictionData?.avoid_action ?? '';
  const dos            = simpleSummary?.dos ?? [];
  const donts          = simpleSummary?.donts ?? [];
  const geoAnswer      = predictionData?.geoDirectAnswer ?? predictionData?.geo_direct_answer ?? '';

  const metaKundali    = predictionData?._meta?.kundali ?? {};
  const planets        = predictionData?._meta?.planets ?? [];
  const synthesis      = predictionData?._meta?.synthesis ?? {};
  const confidence     = synthesis?.confidence ?? {};
  const panchang       = synthesis?.panchang ?? {};

  // Dasha data
  const mahadasha      = meta.mahadasha || metaKundali.mahadasha || '—';
  const antardasha     = meta.antardasha || metaKundali.antardasha || '—';
  const pratyantar     = predictionData?._meta?.kundali?.pratyantar ?? '—';

  // Yogas
  const yogas          = synthesis?.yogas ?? [];
  const bhrigu         = synthesis?.bhrigu ?? [];
  const shadbala       = synthesis?.shadbala ?? {};

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: BG_DARK, color: '#e2e8f0' }}>
      <SiteNav />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px 40px' }}>

        {/* ── SECTION 1: MAHAKAAL KA ASHIRWAD ───────────────────────────── */}
        <div style={{
          background:   'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(8,11,18,0.95) 60%)',
          border:       `1px solid ${GOLD_BORDER}`,
          borderRadius: '20px',
          padding:      '24px',
          marginBottom: '16px',
          textAlign:    'center',
        }}>
          {/* Mahakaal blessing */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ height: '1px', flex: 1, background: `linear-gradient(to right, transparent, ${GOLD_BORDER})` }} />
            <span style={{ color: GOLD, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              🔱 Mahakaal Ka Ashirwad
            </span>
            <div style={{ height: '1px', flex: 1, background: `linear-gradient(to left, transparent, ${GOLD_BORDER})` }} />
          </div>

          {/* Person + domain */}
          <h1 style={{ margin: '0 0 6px', color: '#fff', fontSize: '22px', fontFamily: 'Georgia, serif', fontWeight: 700 }}>
            {meta.personName}'s {meta.domainLabel} Reading
          </h1>
          <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '13px' }}>
            {meta.lagna} Lagna · {meta.nakshatra} Nakshatra · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {/* 4 Authority Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
            {[
              { label: '⚡ Swiss Ephemeris', color: '#60a5fa' },
              { label: '📖 BPHS Classical', color: '#a78bfa' },
              { label: '🔮 Bhrigu Nandi', color: '#f472b6' },
              { label: '⚖️ Shadbala', color: '#34d399' },
            ].map(b => (
              <Badge key={b.label} label={b.label} color={b.color} />
            ))}
          </div>

          {/* Confidence badge */}
          {meta.confidenceLabel && (
            <Badge label={`✓ ${meta.confidenceLabel}`} color={GOLD} />
          )}
        </div>
{/* ── POLISH DEFERRED BADGE — v12.0 ─────────────────────────────── */}
        {(meta as any)?.polishDeferred && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 16px', marginBottom: '12px',
            borderRadius: '10px',
            background: 'rgba(212,175,55,0.06)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}>
            <span style={{ fontSize: '16px', animation: 'spin 2s linear infinite' }}>✨</span>
            <p style={{ margin: 0, color: 'rgba(212,175,55,0.8)', fontSize: '12px', lineHeight: 1.5 }}>
              Trikal aapki reading ko aur gehri bana raha hai... kuch hi pal mein aur sashakt ho jayegi.
            </p>
          </div>
        )}
        {/* ── SECTION 2: TRIKAL KA SANDESH ──────────────────────────────── */}
        <SectionCard style={{ background: 'rgba(11,16,26,0.95)' }}>
          <SectionTitle icon="✨" title="Trikal Ka Sandesh" subtitle="Aapke liye — seedha dil se" />

          {/* GEO Answer (hidden visually but in DOM for SEO) */}
          {geoAnswer && (
            <p style={{ display: 'none' }} aria-hidden="false">
              {geoAnswer}
            </p>
          )}

          {/* Main summary text */}
          {summaryText && (
            <div style={{
              background:   'rgba(212,175,55,0.04)',
              border:       `1px solid rgba(212,175,55,0.12)`,
              borderRadius: '12px',
              padding:      '16px',
              marginBottom: '16px',
            }}>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                {summaryText}
              </p>
            </div>
          )}

          {/* Key message */}
          {keyMessage && (
            <div style={{
              background:   'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))',
              border:       `1px solid rgba(212,175,55,0.3)`,
              borderRadius: '12px',
              padding:      '14px 16px',
              marginBottom: '12px',
            }}>
              <p style={{ margin: '0 0 4px', color: GOLD, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                🔑 Trikal Ka Core Message
              </p>
              <p style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: 600, fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>
                {keyMessage}
              </p>
            </div>
          )}

          {/* Action + Caution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            {mainAction && (
              <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px' }}>
                <p style={{ margin: '0 0 4px', color: '#22c55e', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em' }}>✓ ABHI KAREIN</p>
                <p style={{ margin: 0, color: '#86efac', fontSize: '12px', lineHeight: 1.5 }}>{mainAction}</p>
              </div>
            )}
            {mainCaution && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px' }}>
                <p style={{ margin: '0 0 4px', color: '#ef4444', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em' }}>✗ BACHEIN</p>
                <p style={{ margin: 0, color: '#fca5a5', fontSize: '12px', lineHeight: 1.5 }}>{mainCaution}</p>
              </div>
            )}
          </div>

          {/* Dos and Donts */}
          {(dos.length > 0 || donts.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {dos.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', color: '#22c55e', fontSize: '11px', fontWeight: 700 }}>DO'S</p>
                  {dos.map((d: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ color: '#22c55e', flexShrink: 0, fontSize: '11px' }}>✓</span>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px', lineHeight: 1.5 }}>{d}</p>
                    </div>
                  ))}
                </div>
              )}
              {donts.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>DON'TS</p>
                  {donts.map((d: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ color: '#ef4444', flexShrink: 0, fontSize: '11px' }}>✗</span>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px', lineHeight: 1.5 }}>{d}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Paid tier extra content hint */}
          {isPaid && (
            <div style={{
              marginTop:    '16px',
              paddingTop:   '14px',
              borderTop:    `1px solid rgba(255,255,255,0.06)`,
              display:      'flex',
              alignItems:   'center',
              gap:          '8px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>
                Complete 800-1200 word analysis below — Powered by Gemini 2.5 Pro + Claude Sonnet 4.6
              </p>
            </div>
          )}
        </SectionCard>

        {/* ── SECTION 3: KUNDALI CHART ────────────────────────────────────── */}
        <SectionCard>
          <SectionTitle icon="🪐" title="Aapki Kundali" subtitle="North Indian — Lahiri Ayanamsha" />
          <KundaliChart
            lagna={meta.lagna}
            planets={Object.fromEntries(
              planets.map((p: PlanetData) => [p.name, p])
            )}
          />
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '10px', margin: '12px 0 0' }}>
            Swiss Ephemeris precision · Lahiri Ayanamsha · Shadbala calculated
          </p>
        </SectionCard>

        {/* ── SECTION 4: PLANET TABLE (ALL 9 — BOTH TIERS) ───────────────── */}
        <SectionCard>
          <SectionTitle icon="⚡" title="Graha Vishleshan" subtitle="All 9 Planets + Shadbala" />

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid rgba(212,175,55,0.15)` }}>
                  {['Graha', 'Rashi', 'House', 'Strength', 'Shadbala', 'Status'].map(h => (
                    <th key={h} style={{ padding: '8px 6px', color: GOLD, fontWeight: 600, textAlign: 'left', fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planets.map((p: PlanetData, i: number) => (
                  <tr key={p.name} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background:   i % 2 === 0 ? 'rgba(212,175,55,0.02)' : 'transparent',
                  }}>
                    <td style={{ padding: '10px 6px', color: '#fff', fontWeight: 600 }}>
                      <span style={{ color: GOLD, marginRight: '6px' }}>{PLANET_GLYPHS[p.name]}</span>
                      {PLANET_HINDI[p.name] || p.name}
                      {p.isRetrograde && <span style={{ color: '#f59e0b', fontSize: '9px', marginLeft: '4px' }}>® Vakri</span>}
                    </td>
                    <td style={{ padding: '10px 6px', color: '#94a3b8' }}>{p.rashi}</td>
                    <td style={{ padding: '10px 6px', color: '#94a3b8' }}>{p.house}th</td>
                    <td style={{ padding: '10px 6px', minWidth: '100px' }}>
                      <StrengthBar value={p.strength} />
                    </td>
                    <td style={{ padding: '10px 6px', color: '#64748b', fontSize: '10px' }}>
                      {p.shadbala?.classification || '—'}
                    </td>
                    <td style={{ padding: '10px 6px' }}>
                      <span style={{
                        color:      p.strength >= 65 ? '#22c55e' : p.strength >= 45 ? GOLD : '#ef4444',
                        fontSize:   '10px',
                        fontWeight: 600,
                      }}>
                        {p.strength >= 65 ? '● Strong' : p.strength >= 45 ? '◐ Moderate' : '○ Weak'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shadbala note */}
          <p style={{ margin: '12px 0 0', color: '#334155', fontSize: '10px', lineHeight: 1.5 }}>
            ⚖️ Shadbala = Classical 6-component strength system (BPHS Ch.27). Strength% = Shadbala ratio normalized to 0-100.
          </p>
        </SectionCard>

        {/* ── SECTION 5: DASHA TIMELINE ────────────────────────────────────── */}
        <SectionCard>
          <SectionTitle icon="⏰" title="Aapka Dasha Kaal" subtitle="Vimshottari System — 4 Levels" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Mahadasha', lord: mahadasha, level: 1, years: '16-19 years', color: '#60a5fa' },
              { label: 'Antardasha', lord: antardasha, level: 2, years: '1-3 years', color: '#a78bfa' },
              { label: 'Pratyantar', lord: typeof pratyantar === 'string' ? pratyantar : predictionData?._meta?.kundali?.pratyantar || '—', level: 3, years: '3-7 weeks', color: GOLD },
              { label: 'Sookshma', lord: '—', level: 4, years: 'Days', color: '#34d399' },
            ].map(({ label, lord, level, years, color }) => (
              <div key={label} style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '12px',
                padding:      '12px',
                background:   'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                border:       `1px solid rgba(255,255,255,0.06)`,
              }}>
                <div style={{
                  width:        '28px',
                  height:       '28px',
                  borderRadius: '50%',
                  background:   `${color}20`,
                  border:       `1px solid ${color}40`,
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  flexShrink:   0,
                  color,
                  fontSize:     '11px',
                  fontWeight:   700,
                }}>
                  L{level}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ margin: '2px 0 0', color: '#fff', fontSize: '14px', fontWeight: 700 }}>{lord}</p>
                </div>
                <span style={{ color: '#475569', fontSize: '10px' }}>{years}</span>
              </div>
            ))}
          </div>

          {/* Action/Avoid windows */}
          {synthesis?.summary?.best_houses && (
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px' }}>
                <p style={{ margin: '0 0 4px', color: '#22c55e', fontSize: '10px', fontWeight: 700 }}>🟢 ACTION WINDOW</p>
                <p style={{ margin: 0, color: '#86efac', fontSize: '12px' }}>
                  {predictionData?.actionWindow || 'Check complete report'}
                </p>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px' }}>
                <p style={{ margin: '0 0 4px', color: '#ef4444', fontSize: '10px', fontWeight: 700 }}>🔴 AVOID WINDOW</p>
                <p style={{ margin: 0, color: '#fca5a5', fontSize: '12px' }}>
                  {predictionData?.avoidWindow || 'Check complete report'}
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── SECTION 6: DOMAIN ANALYSIS ──────────────────────────────────── */}
        {yogas.length > 0 && (
          <SectionCard>
            <SectionTitle icon="🎯" title={`${meta.domainLabel} Vishleshan`} subtitle="Yogas + Bhrigu Patterns" />

            {yogas.slice(0, isPaid ? yogas.length : 2).map((yoga: any, i: number) => (
              <div key={i} style={{
                padding:      '14px',
                background:   'rgba(212,175,55,0.04)',
                borderRadius: '10px',
                marginBottom: '10px',
                border:       `1px solid rgba(212,175,55,0.12)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ color: '#22c55e', fontSize: '12px' }}>✓</span>
                  <p style={{ margin: 0, color: GOLD, fontSize: '13px', fontWeight: 700 }}>{yoga.name}</p>
                  <Badge label={yoga.strength || 'active'} color="#22c55e" />
                </div>
                <p style={{ margin: '0 0 6px', color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 }}>{yoga.effect}</p>
                <p style={{ margin: 0, color: '#475569', fontSize: '10px' }}>📖 {yoga.classicalBasis || yoga.basis}</p>
              </div>
            ))}

            {/* Bhrigu signals */}
            {bhrigu.slice(0, 2).map((signal: any, i: number) => (
              <div key={i} style={{
                padding:      '12px',
                background:   'rgba(124,58,237,0.06)',
                borderRadius: '10px',
                marginBottom: '10px',
                border:       '1px solid rgba(124,58,237,0.15)',
              }}>
                <p style={{ margin: '0 0 4px', color: '#a78bfa', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                  🔮 Bhrigu Pattern
                </p>
                <p style={{ margin: 0, color: '#c4b5fd', fontSize: '12px', lineHeight: 1.5 }}>{signal.description}</p>
              </div>
            ))}
          </SectionCard>
        )}

        {/* ── SECTION 7: REMEDY PLAN ───────────────────────────────────────── */}
        <SectionCard>
          <SectionTitle icon="🙏" title="Upay — Remedy Plan" subtitle="BPHS Ch.86 Classical Remedies" />

          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              {
                icon:  '🕉️',
                label: 'Mantra',
                value: predictionData?.professionalEnglish?.remedyPlan?.remedies?.[0]?.mantra?.text
                       || 'Om Namah Shivaya — 108x daily at sunrise',
                sub:   'Saturday · Sunrise · West direction',
                color: '#60a5fa',
              },
              {
                icon:  '🌾',
                label: 'Dana (Charity)',
                value: predictionData?.professionalEnglish?.remedyPlan?.remedies?.[0]?.dana?.item
                       || 'Black sesame + mustard oil',
                sub:   'Saturday morning · Poor person / temple',
                color: '#34d399',
              },
              {
                icon:  '🪔',
                label: 'Vrat (Fast)',
                value: predictionData?.professionalEnglish?.remedyPlan?.remedies?.[0]?.vrat?.day
                       || 'Saturday fast — Shani Dev worship',
                sub:   'Sunrise to sunset · Oil lamp offering',
                color: GOLD,
              },
            ].map(({ icon, label, value, sub, color }) => (
              <div key={label} style={{
                display:      'flex',
                gap:          '12px',
                padding:      '14px',
                background:   `${color}08`,
                border:       `1px solid ${color}20`,
                borderRadius: '12px',
              }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ margin: '0 0 2px', color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ margin: '0 0 4px', color: '#e2e8f0', fontSize: '13px', fontWeight: 500 }}>{value}</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── SECTION 8: PANCHANG TODAY ─────────────────────────────────────── */}
        <SectionCard>
          <SectionTitle icon="📅" title="Aaj Ka Panchang" subtitle="Daily Muhurta Guide" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
            {[
              { label: 'Tithi', value: panchang?.tithi || '—' },
              { label: 'Vara', value: panchang?.vara || '—' },
              { label: 'Nakshatra', value: panchang?.nakshatra || '—' },
              { label: 'Yoga', value: panchang?.yoga || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ margin: '0 0 2px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: 600 }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px' }}>
              <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>🕐 Rahu Kaal</span>
              <span style={{ color: '#fca5a5', fontSize: '12px' }}>
                {panchang?.rahuKaal ? `${panchang.rahuKaal.start} – ${panchang.rahuKaal.end}` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600 }}>✨ Abhijeet Muhurta</span>
              <span style={{ color: '#86efac', fontSize: '12px' }}>
                {panchang?.abhijeetMuhurta ? `${panchang.abhijeetMuhurta.start} – ${panchang.abhijeetMuhurta.end}` : '—'}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 9: FREE CONVERSION CTA ──────────────────────────────── */}
        {isFree && (
          <div style={{
            background:   'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(124,58,237,0.08) 100%)',
            border:       `1px solid rgba(212,175,55,0.3)`,
            borderRadius: '20px',
            padding:      '28px 24px',
            marginBottom: '16px',
            textAlign:    'center',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔮</div>
            <h3 style={{ margin: '0 0 8px', color: '#fff', fontSize: '18px', fontFamily: 'Georgia, serif', fontWeight: 700 }}>
              Trikal Ne Aur Bhi Dekha Hai...
            </h3>
            <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
              Aapki kundali mein 3 aur yogas hain jo seedha aapke sawal ka jawab dete hain.
              Gemini 2.5 Pro + Claude Sonnet 4.6 ne poora vishleshan kiya hai — sirf aapke liye.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '20px', maxWidth: '360px', margin: '0 auto 20px' }}>
              {[
                '✓ Complete planetary analysis',
                '✓ 3 action windows with dates',
                '✓ Full remedy plan (dana+vrat)',
                '✓ Panchang muhurta guidance',
                '✓ Bhrigu pattern insights',
                '✓ 800-1200 word deep reading',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', textAlign: 'left' }}>
                  <span style={{ color: '#22c55e', fontSize: '11px', flexShrink: 0 }}>✓</span>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px' }}>{f.replace('✓ ', '')}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <Link
                href={`/upgrade?from=${predictionId}&tier=basic`}
                style={{
                  display:      'inline-block',
                  padding:      '16px 40px',
                  borderRadius: '14px',
                  background:   `linear-gradient(135deg, ${GOLD}, #F5D76E, ${GOLD})`,
                  color:        '#080B12',
                  fontSize:     '15px',
                  fontWeight:   700,
                  textDecoration: 'none',
                  boxShadow:    `0 0 30px rgba(212,175,55,0.35)`,
                }}
              >
                🔓 Poora Jawab Unlock Karein — ₹51
              </Link>
              <p style={{ margin: 0, color: '#475569', fontSize: '11px' }}>
                One-time · Instant access · Razorpay secure
              </p>
              <a
                href="https://wa.me/919211804111?text=Rohiit%20ji%2C%20personal%20consultation%20chahiye"
                target="_blank"
                rel="noopener noreferrer"
                style={{
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
        )}

        {/* ── SECTION 10: MAA SHAKTI (BOTH TIERS — PERMANENT) ─────────────── */}
        <MaaShaktiSection />

        {/* ── SECTION 11: SHARE + RETURN ───────────────────────────────────── */}
        <SectionCard>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '12px' }}>
              📤 Apni reading share karein
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/?text=Maine%20Trikal%20Vaani%20pe%20apni%20kundali%20padhi%20—%20amazing%20accuracy!%20trikalvaani.com`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding:      '10px 20px',
                  borderRadius: '10px',
                  background:   '#25D36618',
                  border:       '1px solid #25D36640',
                  color:        '#25D366',
                  fontSize:     '12px',
                  fontWeight:   600,
                  textDecoration: 'none',
                }}
              >
                📱 WhatsApp Share
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                style={{
                  padding:      '10px 20px',
                  borderRadius: '10px',
                  background:   GOLD_LIGHT,
                  border:       `1px solid ${GOLD_BORDER}`,
                  color:        GOLD,
                  fontSize:     '12px',
                  fontWeight:   600,
                  cursor:       'pointer',
                }}
              >
                🔗 Copy Link
              </button>
            </div>

            {/* Author */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: '0 0 4px', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                Rohiit Gupta — Chief Vedic Architect
              </p>
              <p style={{ margin: '0 0 8px', color: '#475569', fontSize: '11px' }}>
                trikalvaani.com · Delhi NCR · 🔱 Powered by Mahakaal
              </p>
              <Link href="/" style={{ color: GOLD, fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>
                ← Nai Reading Karein
              </Link>
            </div>
          </div>
        </SectionCard>

      </main>
      <SiteFooter />
    </div>
  );
}
