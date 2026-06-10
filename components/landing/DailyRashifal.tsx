'use client';

// ============================================================
// FILE: components/landing/DailyRashifal.tsx
// VERSION: v2.0 — Dynamic Swiss Ephemeris Gochar (June 2026)
// CHANGES vs v1.1:
//   ✅ Full dynamic — fetches from VM /daily-rashifal endpoint
//   ✅ Real Gochar transits via Swiss Ephemeris on VM
//   ✅ Gemini 2.5 Flash generates predictions from real transit data
//   ✅ Supabase daily cache — VM called once/day, instant after
//   ✅ Skeleton loading state — no layout shift
//   ✅ Graceful fallback — shows static message if VM unavailable
//   ✅ "Trikaal AI Tip" label preserved from v1.1 IR fix
//   ✅ Disclaimer removed — content is now real, not illustrative
// PROTECTED: all UI layout, colors, symbols, navigation, animations
// ============================================================

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ── Static rashi metadata (symbols, colors, lords) ───────────
// Predictions + tips come from VM dynamically
const RASHI_META = [
  { id: 'mesh',     name: 'Mesh',     hindi: 'मेष',     symbol: '♈', sign: 'Aries',        lord: 'Mars',           element: 'Fire',  color: '#EF4444' },
  { id: 'vrishabh', name: 'Vrishabh', hindi: 'वृषभ',    symbol: '♉', sign: 'Taurus',       lord: 'Venus',          element: 'Earth', color: '#10B981' },
  { id: 'mithun',   name: 'Mithun',   hindi: 'मिथुन',   symbol: '♊', sign: 'Gemini',       lord: 'Mercury',        element: 'Air',   color: '#3B82F6' },
  { id: 'kark',     name: 'Kark',     hindi: 'कर्क',    symbol: '♋', sign: 'Cancer',       lord: 'Moon',           element: 'Water', color: '#8B5CF6' },
  { id: 'simha',    name: 'Simha',    hindi: 'सिंह',    symbol: '♌', sign: 'Leo',          lord: 'Sun',            element: 'Fire',  color: '#F59E0B' },
  { id: 'kanya',    name: 'Kanya',    hindi: 'कन्या',   symbol: '♍', sign: 'Virgo',        lord: 'Mercury',        element: 'Earth', color: '#06B6D4' },
  { id: 'tula',     name: 'Tula',     hindi: 'तुला',    symbol: '♎', sign: 'Libra',        lord: 'Venus',          element: 'Air',   color: '#EC4899' },
  { id: 'vrischik', name: 'Vrischik', hindi: 'वृश्चिक', symbol: '♏', sign: 'Scorpio',      lord: 'Mars + Ketu',    element: 'Water', color: '#DC2626' },
  { id: 'dhanu',    name: 'Dhanu',    hindi: 'धनु',     symbol: '♐', sign: 'Sagittarius',  lord: 'Jupiter',        element: 'Fire',  color: '#7C3AED' },
  { id: 'makar',    name: 'Makar',    hindi: 'मकर',     symbol: '♑', sign: 'Capricorn',    lord: 'Saturn',         element: 'Earth', color: '#64748B' },
  { id: 'kumbh',    name: 'Kumbh',    hindi: 'कुम्भ',   symbol: '♒', sign: 'Aquarius',     lord: 'Saturn + Rahu',  element: 'Air',   color: '#0EA5E9' },
  { id: 'meen',     name: 'Meen',     hindi: 'मीन',     symbol: '♓', sign: 'Pisces',       lord: 'Jupiter + Ketu', element: 'Water', color: '#2DD4BF' },
];

interface RashiData {
  id: string;
  name: string;
  hindi: string;
  symbol: string;
  sign: string;
  lord: string;
  element: string;
  color: string;
  prediction: string;
  tip: string;
}

type LoadState = 'loading' | 'ready' | 'error';

// ── Skeleton card ──────────────────────────────────────────────
function SkeletonPulse({ w, h }: { w: string; h: string }) {
  return (
    <div
      className="rounded animate-pulse"
      style={{ width: w, height: h, background: 'rgba(255,255,255,0.06)' }}
    />
  );
}

export default function DailyRashifal() {
  const [active, setActive]     = useState(0);
  const [today, setToday]       = useState('');
  const [rashis, setRashis]     = useState<RashiData[]>([]);
  const [loadState, setLoad]    = useState<LoadState>('loading');
  const [fromCache, setFromCache] = useState(false);

  // ── Fetch today's rashifal from VM ────────────────────────
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    );

    async function fetchRashifal() {
      try {
        const res = await fetch('/api/daily-rashifal', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // 30s timeout via AbortController
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.rashis && Array.isArray(data.rashis) && data.rashis.length === 12) {
          // Merge VM predictions with static metadata (symbol, color etc.)
          const merged: RashiData[] = data.rashis.map((r: any, i: number) => ({
            ...RASHI_META[i],
            prediction: r.prediction || '',
            tip:        r.tip        || '',
          }));
          setRashis(merged);
          setFromCache(data.from_cache ?? false);
          setLoad('ready');
        } else {
          throw new Error('Invalid rashis response');
        }
      } catch (err) {
        console.error('[DailyRashifal] fetch error:', err);
        setLoad('error');
      }
    }

    fetchRashifal();
  }, []);

  const rashi = loadState === 'ready' ? rashis[active] : null;
  const meta  = RASHI_META[active]; // always available for skeleton colors

  const prev = () => setActive((a) => (a - 1 + 12) % 12);
  const next = () => setActive((a) => (a + 1) % 12);

  return (
    <section className="py-14 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.6) }}>
            Aaj Ka Rashifal
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Daily <span style={{ color: GOLD }}>Horoscope</span> — 12 Rashis
          </h2>
          {today && <p className="text-slate-500 text-sm mt-2">{today}</p>}
          {/* v2.0: Real Swiss Ephemeris Gochar — no disclaimer needed */}
          <p className="text-xs mt-1" style={{ color: GOLD_RGBA(0.45) }}>
            ⚡ Swiss Ephemeris Gochar · Real transit predictions by Rohiit Gupta
          </p>
        </div>

        {/* ── Rashi selector tabs ────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {RASHI_META.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setActive(i)}
              className="flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: active === i ? `${r.color}22` : 'rgba(11,16,26,0.7)',
                border:     `1px solid ${active === i ? r.color : GOLD_RGBA(0.1)}`,
                minWidth:   '52px',
              }}
            >
              <span className="text-base leading-none">{r.symbol}</span>
              <span className="text-xs font-medium" style={{ color: active === i ? r.color : '#94a3b8' }}>
                {r.name}
              </span>
            </button>
          ))}
        </div>

        {/* ── Main card ──────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background:  'rgba(11,16,26,0.9)',
            border:      `1px solid ${meta.color}33`,
            boxShadow:   `0 0 40px ${meta.color}11`,
          }}
        >
          {/* Card header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${meta.color}22`, background: `${meta.color}0a` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{meta.symbol}</span>
              <div>
                <p className="font-serif font-bold text-lg text-white">
                  {meta.name}{' '}
                  <span className="text-base font-normal text-slate-400">({meta.hindi})</span>
                </p>
                <p className="text-xs text-slate-500">
                  {meta.sign} · Lord: {meta.lord} · {meta.element}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Previous rashi"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}
              >
                <ChevronLeft className="w-4 h-4" style={{ color: GOLD }} />
              </button>
              <button
                onClick={next}
                aria-label="Next rashi"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: GOLD }} />
              </button>
            </div>
          </div>

          {/* Card body */}
          <div className="px-6 py-5">

            {/* Loading skeleton */}
            {loadState === 'loading' && (
              <div className="space-y-3">
                <SkeletonPulse w="100%" h="16px" />
                <SkeletonPulse w="90%"  h="16px" />
                <SkeletonPulse w="75%"  h="16px" />
                <div className="mt-4 rounded-xl px-4 py-3" style={{ background: `${meta.color}0d`, border: `1px solid ${meta.color}33` }}>
                  <SkeletonPulse w="40%" h="12px" />
                  <div className="mt-2">
                    <SkeletonPulse w="85%" h="14px" />
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {loadState === 'error' && (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm mb-2">
                  Today's Gochar predictions are being computed.
                </p>
                <p className="text-xs text-slate-600">
                  Please refresh in a moment — Swiss Ephemeris is calculating today's transits.
                </p>
              </div>
            )}

            {/* Dynamic prediction */}
            {loadState === 'ready' && rashi && (
              <>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">
                  {rashi.prediction}
                </p>

                {/* Trikaal AI Tip */}
                <div
                  className="rounded-xl px-4 py-3"
                  style={{ background: `${rashi.color}0d`, border: `1px solid ${rashi.color}33` }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: rashi.color }}>
                    Trikaal AI Tip (ट्रिकाल टिप)
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">{rashi.tip}</p>
                </div>
              </>
            )}
          </div>

          {/* Card footer */}
          <div className="px-6 pb-4 flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Rashi {active + 1} of 12
            </p>
            <p className="text-xs text-slate-600">
              {fromCache ? '⚡ Today\'s cache' : '🔄 Fresh today'} · Rohiit Gupta, Chief Vedic Architect
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
