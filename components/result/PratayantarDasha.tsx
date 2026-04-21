/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 1.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: PRATYANTAR + SOOKSHMA DASHA DISPLAY — PHASE 2 KUNDALI TAB
 * POSITION: Below VimshottariDashaTable in Phase 2
 *
 * SHOWS:
 *   - Current Dasha Chain: MD → AD → PD → SD (4 levels)
 *   - All 9 Pratyantar periods within current Antardasha
 *   - Current Pratyantar highlighted with progress bar
 *   - Exact start/end dates + days remaining
 *   - Quality badge: Shubh / Madhyam / Ashubh
 *   - Sookshma Dasha (Level 4) — current period
 */

'use client';

import { useState } from 'react';

const GOLD        = '#D4AF37';
const GOLD_RGBA   = (a: number) => `rgba(212,175,55,${a})`;
const PURPLE      = '#7C3AED';
const PURPLE_RGBA = (a: number) => `rgba(124,58,237,${a})`;
const GREEN       = '#22C55E';
const GREEN_RGBA  = (a: number) => `rgba(34,197,94,${a})`;
const RED         = '#EF4444';
const RED_RGBA    = (a: number) => `rgba(239,68,68,${a})`;
const BLUE        = '#60A5FA';
const BLUE_RGBA   = (a: number) => `rgba(96,165,250,${a})`;
const ORANGE      = '#FB923C';

// ─── PLANET COLORS ───────────────────────────────────────────────────────────
const PLANET_COLORS: Record<string, string> = {
  Sun:     '#FB923C',
  Moon:    '#C4B5FD',
  Mars:    '#F87171',
  Mercury: '#6EE7B7',
  Jupiter: '#FCD34D',
  Venus:   '#F9A8D4',
  Saturn:  '#94A3B8',
  Rahu:    '#A78BFA',
  Ketu:    '#FCA5A5',
};

// ─── PLANET HINDI NAMES ───────────────────────────────────────────────────────
const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

const PLANET_EMOJI: Record<string, string> = {
  Sun:'☀️', Moon:'🌙', Mars:'♂️', Mercury:'☿', Jupiter:'♃', Venus:'♀️', Saturn:'♄', Rahu:'☊', Ketu:'☋',
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type DashaPeriodExtended = {
  lord: string;
  startDate: Date | string;
  endDate: Date | string;
  durationDays: number;
  quality: 'Shubh' | 'Ashubh' | 'Madhyam';
  remainingDays: number;
};

export type PratayantarDashaProps = {
  name: string;
  mahadasha: string;
  antardasha: string;
  pratyantar: DashaPeriodExtended[];       // all 9 Pratyantar periods
  currentPratyantar: DashaPeriodExtended;  // currently active
  currentSookshma: DashaPeriodExtended;    // Level 4
  lang?: 'hindi' | 'hinglish' | 'english';
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function fmtDate(d: Date | string): string {
  return toDate(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtDateShort(d: Date | string): string {
  return toDate(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  });
}

function progressPct(period: DashaPeriodExtended): number {
  const start   = toDate(period.startDate).getTime();
  const end     = toDate(period.endDate).getTime();
  const now     = Date.now();
  const elapsed = now - start;
  const total   = end - start;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

function qualityConfig(q: 'Shubh' | 'Ashubh' | 'Madhyam') {
  if (q === 'Shubh')   return { color: GREEN,  bg: GREEN_RGBA(0.12),  label: '✅ Shubh',   labelEn: '✅ Auspicious' };
  if (q === 'Ashubh')  return { color: RED,    bg: RED_RGBA(0.12),    label: '⚠️ Ashubh',  labelEn: '⚠️ Challenging' };
  return                      { color: ORANGE, bg: `rgba(251,146,60,0.12)`, label: '🔸 Madhyam', labelEn: '🔸 Mixed' };
}

// ─── DASHA CHAIN HEADER ───────────────────────────────────────────────────────
function DashaChain({
  mahadasha, antardasha, pratyantar, sookshma,
}: { mahadasha: string; antardasha: string; pratyantar: string; sookshma: string }) {
  const lords = [
    { level: 'MD', lord: mahadasha, label: 'Maha' },
    { level: 'AD', lord: antardasha, label: 'Antar' },
    { level: 'PD', lord: pratyantar, label: 'Pratyantar' },
    { level: 'SD', lord: sookshma, label: 'Sookshma' },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: 4, flexWrap: 'wrap' as const,
      padding: '12px 16px',
      background: 'rgba(6,12,28,0.8)',
      border: `1px solid ${GOLD_RGBA(0.15)}`,
      borderRadius: 12, marginBottom: 12,
    }}>
      {lords.map((item, i) => {
        const color = PLANET_COLORS[item.lord] ?? GOLD;
        return (
          <div key={item.level} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              padding: '4px 10px',
              background: `${color}12`,
              border: `1px solid ${color}30`,
              borderRadius: 8,
            }}>
              <span style={{ fontSize: 9, color: `${color}80`, fontWeight: 600, letterSpacing: '0.05em' }}>
                {item.label}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>
                {PLANET_EMOJI[item.lord]} {item.lord}
              </span>
            </div>
            {i < lords.length - 1 && (
              <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.3)', padding: '0 2px' }}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── CURRENT PRATYANTAR CARD ──────────────────────────────────────────────────
function CurrentPratayantarCard({
  period, lang,
}: { period: DashaPeriodExtended; lang: 'hindi' | 'hinglish' | 'english' }) {
  const color    = PLANET_COLORS[period.lord] ?? GOLD;
  const qConfig  = qualityConfig(period.quality);
  const progress = progressPct(period);
  const remDays  = period.remainingDays;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}08, rgba(6,12,28,0.98))`,
      border: `1.5px solid ${color}35`,
      borderRadius: 14, padding: '18px 20px',
      marginBottom: 12, position: 'relative', overflow: 'hidden',
    }}>
      {/* Active glow line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>
            {lang === 'hindi' ? '▶ वर्तमान प्रत्यंतर दशा' : '▶ Current Pratyantar Dasha'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{PLANET_EMOJI[period.lord]}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color }}>
                {lang === 'hindi' ? PLANET_HI[period.lord] : period.lord}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>
                {lang === 'hindi' ? 'प्रत्यंतर' : 'Pratyantar Dasha'}
              </div>
            </div>
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          background: qConfig.bg,
          border: `1px solid ${qConfig.color}30`,
          borderRadius: 20, fontSize: 11, fontWeight: 700, color: qConfig.color,
        }}>
          {lang === 'english' ? qConfig.labelEn : qConfig.label}
        </div>
      </div>

      {/* Date range */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8, marginBottom: 14,
      }}>
        {[
          { label: lang === 'hindi' ? 'शुरू' : 'Starts', value: fmtDate(period.startDate) },
          { label: lang === 'hindi' ? 'समाप्त' : 'Ends', value: fmtDate(period.endDate) },
          { label: lang === 'hindi' ? 'बाकी दिन' : 'Remaining', value: `${remDays} days` },
        ].map(item => (
          <div key={item.label} style={{
            padding: '8px 10px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
            border: `1px solid rgba(255,255,255,0.06)`,
            textAlign: 'center' as const,
          }}>
            <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.4)', marginBottom: 3, textTransform: 'uppercase' as const }}>{item.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)' }}>
            {lang === 'hindi' ? 'दशा प्रगति' : 'Period progress'}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color }}>{progress}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: `linear-gradient(90deg, ${color}60, ${color})`,
            borderRadius: 3, transition: 'width 1s ease',
          }} />
        </div>
      </div>

      {/* Duration info */}
      <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(148,163,184,0.45)' }}>
        {lang === 'hindi'
          ? `कुल अवधि: ${period.durationDays} दिन`
          : `Total duration: ${period.durationDays} days`}
      </div>
    </div>
  );
}

// ─── SOOKSHMA CARD ────────────────────────────────────────────────────────────
function SookshmaCard({
  period, lang,
}: { period: DashaPeriodExtended; lang: 'hindi' | 'hinglish' | 'english' }) {
  const color   = PLANET_COLORS[period.lord] ?? PURPLE;
  const qConfig = qualityConfig(period.quality);

  return (
    <div style={{
      background: PURPLE_RGBA(0.06),
      border: `1px solid ${PURPLE_RGBA(0.2)}`,
      borderRadius: 12, padding: '14px 16px',
      marginBottom: 12,
    }}>
      <div style={{ fontSize: 10, color: PURPLE_RGBA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>
        ✨ {lang === 'hindi' ? 'सूक्ष्म दशा (Level 4)' : 'Sookshma Dasha — Level 4'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{PLANET_EMOJI[period.lord]}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color }}>
              {lang === 'hindi' ? PLANET_HI[period.lord] : period.lord}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.45)' }}>
              {fmtDateShort(period.startDate)} – {fmtDateShort(period.endDate)}
              {' · '}{period.durationDays} days
            </div>
          </div>
        </div>
        <div style={{
          padding: '3px 8px', fontSize: 10, fontWeight: 700,
          color: qConfig.color,
          background: qConfig.bg,
          border: `1px solid ${qConfig.color}30`,
          borderRadius: 20,
        }}>
          {qConfig.label}
        </div>
      </div>
    </div>
  );
}

// ─── ALL 9 PRATYANTAR TABLE ───────────────────────────────────────────────────
function PratayantarTable({
  periods, currentLord, lang,
}: {
  periods: DashaPeriodExtended[];
  currentLord: string;
  lang: 'hindi' | 'hinglish' | 'english';
}) {
  const [expanded, setExpanded] = useState(false);
  const display = expanded ? periods : periods.slice(0, 5);

  return (
    <div style={{
      background: 'rgba(6,12,28,0.8)',
      border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: 14, overflow: 'hidden',
      marginBottom: 12,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: GOLD_RGBA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
          📊 {lang === 'hindi' ? 'सभी 9 प्रत्यंतर दशाएं' : 'All 9 Pratyantar Periods'}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)' }}>
          {lang === 'hindi' ? 'वर्तमान अंतर्दशा के भीतर' : 'Within current Antardasha'}
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '100px 1fr 1fr 70px',
        gap: 8, padding: '8px 16px',
        borderBottom: `1px solid rgba(255,255,255,0.04)`,
      }}>
        {['Planet', 'Start', 'End', 'Days'].map(h => (
          <span key={h} style={{ fontSize: 9, color: 'rgba(148,163,184,0.35)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {display.map((p, i) => {
        const color    = PLANET_COLORS[p.lord] ?? GOLD;
        const isCurrent = p.lord === currentLord &&
          toDate(p.startDate) <= new Date() && toDate(p.endDate) > new Date();
        const qConfig  = qualityConfig(p.quality);
        const isPast   = toDate(p.endDate) < new Date();
        const isFuture = toDate(p.startDate) > new Date();

        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '100px 1fr 1fr 70px',
            gap: 8, padding: '10px 16px', alignItems: 'center',
            borderBottom: i < display.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
            background: isCurrent ? `${color}08` : 'transparent',
            opacity: isPast ? 0.45 : 1,
          }}>
            {/* Planet */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isCurrent && (
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: color, boxShadow: `0 0 6px ${color}`,
                  flexShrink: 0,
                }} />
              )}
              <span style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? color : 'rgba(226,232,240,0.7)' }}>
                {PLANET_EMOJI[p.lord]} {lang === 'hindi' ? PLANET_HI[p.lord] : p.lord}
              </span>
            </div>
            {/* Dates */}
            <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.55)' }}>
              {fmtDateShort(p.startDate)}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.55)' }}>
              {fmtDateShort(p.endDate)}
            </span>
            {/* Days + quality */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(226,232,240,0.7)' }}>
                {p.durationDays}d
              </span>
              <span style={{ fontSize: 9, color: qConfig.color, fontWeight: 600 }}>
                {p.quality}
              </span>
            </div>
          </div>
        );
      })}

      {/* Show more */}
      {periods.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%', padding: '10px',
            background: 'transparent', border: 'none',
            borderTop: `1px solid rgba(255,255,255,0.04)`,
            cursor: 'pointer', fontSize: 11,
            color: GOLD_RGBA(0.5),
          }}
        >
          {expanded
            ? '▲ Show less'
            : `▼ Show all ${periods.length} periods`}
        </button>
      )}
    </div>
  );
}

// ─── JINI INSIGHT FOR PRATYANTAR ─────────────────────────────────────────────
function PratayantarInsight({
  mahadasha, antardasha, pratyantar, sookshma, lang,
}: {
  mahadasha: string; antardasha: string;
  pratyantar: string; sookshma: string;
  lang: 'hindi' | 'hinglish' | 'english';
}) {
  const INSIGHTS: Record<string, Record<'hindi' | 'hinglish' | 'english', string>> = {
    Jupiter: {
      hinglish: 'Guru ki Pratyantar Dasha — wisdom, expansion aur luck ka peak time. Important decisions ke liye yeh window use karein.',
      hindi:    'गुरु की प्रत्यंतर दशा — ज्ञान, विस्तार और भाग्य का चरम समय। महत्वपूर्ण निर्णयों के लिए यह खिड़की उपयोग करें।',
      english:  'Jupiter Pratyantar — wisdom, expansion and luck at peak. Use this window for important decisions.',
    },
    Venus: {
      hinglish: 'Shukra ki Pratyantar Dasha — relationships, creativity aur luxury ke liye excellent time. Love aur beauty ka phase.',
      hindi:    'शुक्र की प्रत्यंतर दशा — रिश्तों, रचनात्मकता और विलास के लिए उत्कृष्ट समय।',
      english:  'Venus Pratyantar — excellent for relationships, creativity and luxury. A phase of love and beauty.',
    },
    Saturn: {
      hinglish: 'Shani ki Pratyantar Dasha — karmic lessons aur discipline ka waqt. Patience rakho — results zaroor aayenge.',
      hindi:    'शनि की प्रत्यंतर दशा — कार्मिक पाठ और अनुशासन का समय। धैर्य रखें — परिणाम अवश्य आएंगे।',
      english:  'Saturn Pratyantar — time for karmic lessons and discipline. Be patient — results will come.',
    },
    Rahu: {
      hinglish: 'Rahu ki Pratyantar Dasha — sudden changes aur unexpected events ka time. Grounded raho, impulsive mat bano.',
      hindi:    'राहु की प्रत्यंतर दशा — अचानक परिवर्तन और अप्रत्याशित घटनाओं का समय। स्थिर रहें।',
      english:  'Rahu Pratyantar — time of sudden changes and unexpected events. Stay grounded, avoid impulsive decisions.',
    },
    Moon: {
      hinglish: 'Chandra ki Pratyantar Dasha — emotions, intuition aur family ka time. Inner peace important hai.',
      hindi:    'चंद्र की प्रत्यंतर दशा — भावनाओं, अंतर्ज्ञान और परिवार का समय।',
      english:  'Moon Pratyantar — time of emotions, intuition and family. Inner peace is essential.',
    },
    Sun: {
      hinglish: 'Surya ki Pratyantar Dasha — confidence, authority aur recognition ka time. Leadership roles mein aage aao.',
      hindi:    'सूर्य की प्रत्यंतर दशा — आत्मविश्वास, अधिकार और मान्यता का समय।',
      english:  'Sun Pratyantar — time of confidence, authority and recognition. Step into leadership roles.',
    },
    Mars: {
      hinglish: 'Mangal ki Pratyantar Dasha — energy, courage aur action ka time. Bold decisions lene ka sahi waqt.',
      hindi:    'मंगल की प्रत्यंतर दशा — ऊर्जा, साहस और कार्य का समय।',
      english:  'Mars Pratyantar — time of energy, courage and action. Right time for bold decisions.',
    },
    Mercury: {
      hinglish: 'Budh ki Pratyantar Dasha — communication, business aur learning ka time. Contracts sign karne ke liye shubh.',
      hindi:    'बुध की प्रत्यंतर दशा — संचार, व्यवसाय और सीखने का समय।',
      english:  'Mercury Pratyantar — time of communication, business and learning. Auspicious for signing contracts.',
    },
    Ketu: {
      hinglish: 'Ketu ki Pratyantar Dasha — spiritual insights aur detachment ka time. Material desires se thodi door raho.',
      hindi:    'केतु की प्रत्यंतर दशा — आध्यात्मिक अंतर्दृष्टि और वैराग्य का समय।',
      english:  'Ketu Pratyantar — time of spiritual insights and detachment. Step back from material desires.',
    },
  };

  const insight = INSIGHTS[pratyantar]?.[lang]
    ?? `${pratyantar} Pratyantar Dasha — a significant 3-7 day precision window in your cosmic timeline.`;

  return (
    <div style={{
      padding: '14px 16px',
      background: GOLD_RGBA(0.05),
      border: `1px solid ${GOLD_RGBA(0.12)}`,
      borderRadius: 12, marginBottom: 12,
      display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>🔮</span>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: GOLD_RGBA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 5 }}>
          Jini — Pratyantar Insight
        </div>
        <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.85)', lineHeight: 1.7, margin: 0 }}>
          {insight}
        </p>
        <p style={{ fontSize: 11, color: GOLD_RGBA(0.5), margin: '6px 0 0', fontStyle: 'italic' }}>
          {lang === 'hindi'
            ? `${mahadasha}→${antardasha}→${pratyantar}→${sookshma} — चार स्तरीय काल गणना`
            : `${mahadasha}→${antardasha}→${pratyantar}→${sookshma} — 4-level time precision`}
        </p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PratayantarDasha({
  name, mahadasha, antardasha,
  pratyantar, currentPratyantar, currentSookshma,
  lang = 'hinglish',
}: PratayantarDashaProps) {

  // Safety check
  if (!currentPratyantar || !pratyantar?.length) {
    return (
      <div style={{
        padding: '20px', textAlign: 'center',
        background: 'rgba(6,12,28,0.8)',
        border: `1px solid rgba(255,255,255,0.06)`,
        borderRadius: 14,
      }}>
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.5)' }}>
          {lang === 'hindi'
            ? 'प्रत्यंतर दशा डेटा उपलब्ध नहीं है'
            : 'Pratyantar Dasha data not available. Please submit birth form again.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: PURPLE_RGBA(0.12),
          border: `1px solid ${PURPLE_RGBA(0.3)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>⚡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#C4B5FD' }}>
            {lang === 'hindi' ? 'प्रत्यंतर + सूक्ष्म दशा' : 'Pratyantar + Sookshma Dasha'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)' }}>
            {lang === 'hindi'
              ? 'स्तर 3 + 4 — 3-7 दिन की सटीक खिड़कियां'
              : 'Level 3 + 4 — 3 to 7 day precision windows'}
          </div>
        </div>
        <div style={{
          marginLeft: 'auto', padding: '3px 10px',
          background: PURPLE_RGBA(0.12),
          border: `1px solid ${PURPLE_RGBA(0.3)}`,
          borderRadius: 20, fontSize: 10,
          color: '#C4B5FD', fontWeight: 600,
        }}>
          Parashara BPHS
        </div>
      </div>

      {/* 4-level dasha chain */}
      <DashaChain
        mahadasha={mahadasha}
        antardasha={antardasha}
        pratyantar={currentPratyantar.lord}
        sookshma={currentSookshma.lord}
      />

      {/* Jini insight */}
      <PratayantarInsight
        mahadasha={mahadasha}
        antardasha={antardasha}
        pratyantar={currentPratyantar.lord}
        sookshma={currentSookshma.lord}
        lang={lang}
      />

      {/* Current Pratyantar card */}
      <CurrentPratayantarCard period={currentPratyantar} lang={lang} />

      {/* Sookshma card */}
      {currentSookshma && (
        <SookshmaCard period={currentSookshma} lang={lang} />
      )}

      {/* All 9 Pratyantar table */}
      <PratayantarTable
        periods={pratyantar}
        currentLord={currentPratyantar.lord}
        lang={lang}
      />

      {/* Accuracy note */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(6,12,28,0.7)',
        border: `1px solid rgba(255,255,255,0.05)`,
        borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 12 }}>🛡️</span>
        <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)' }}>
          {lang === 'hindi'
            ? 'परशर BPHS सूत्र के अनुसार गणना · Lahiri Ayanamsha · Swiss Ephemeris accuracy'
            : 'Calculated per Parashara BPHS formula · Lahiri Ayanamsha · Swiss Ephemeris accuracy'}
        </span>
      </div>
    </div>
  );
}
