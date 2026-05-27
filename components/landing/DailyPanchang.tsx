'use client';

// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — DailyPanchang Component
// File:    components/landing/DailyPanchang.tsx
// Version: v2.0 — REAL Swiss Ephemeris data via /api/panchang/today
// Owner:   Rohiit Gupta, Chief Vedic Architect
// ════════════════════════════════════════════════════════════════════
// v2.0 CHANGES vs v1.x:
//   ✅ Removed fake client-side computePanchang() pseudo-math.
//   ✅ Now fetches REAL panchang from /api/panchang/today (VM Swiss
//      Ephemeris engine). Footer accuracy claim is now truthful.
//   ✅ Added Karana + Rahu Kaal (real fields the engine returns).
//   ✅ "Delhi NCR" location credential removed → shown as India (IST).
//   ✅ Graceful loading + error states (hides rather than faking data).
// ════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { Sun, Moon, Star, Clock } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ── Shape returned by /api/panchang/today (VM Swiss Ephemeris) ────────
interface PanchangData {
  date:      string;
  weekday:   string;
  tithi:     { name: string; index: number; paksha: string };
  nakshatra: { name: string; pada: number };
  yoga:      { name: string };
  karana:    { name: string };
  sunrise:   string;
  sunset:    string;
  rahu_kaal: string;
  ayanamsha: string;
  engine:    string;
  version:   string;
}

export default function DailyPanchang() {
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [dateStr, setDateStr]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [failed, setFailed]     = useState(false);

  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/panchang/today', { cache: 'no-store' });
        if (!res.ok) throw new Error('panchang fetch failed');
        const data = await res.json();
        if (!cancelled) {
          if (data && data.tithi && data.nakshatra) {
            setPanchang(data as PanchangData);
          } else {
            setFailed(true);
          }
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // If the engine is unreachable, hide the section entirely rather than
  // show fabricated values (accuracy is the brand promise).
  if (failed) return null;

  const rows = panchang ? [
    { icon: Moon,  label: 'Tithi',                            value: `${panchang.tithi.paksha} ${panchang.tithi.name}` },
    { icon: Star,  label: 'Nakshatra',                        value: `${panchang.nakshatra.name} (Pada ${panchang.nakshatra.pada})` },
    { icon: Sun,   label: 'Yoga',                             value: panchang.yoga.name },
    { icon: Star,  label: 'Karana',                           value: panchang.karana.name },
    { icon: Clock, label: 'Rahu Kaal (राहु काल — avoid)',     value: panchang.rahu_kaal },
    { icon: Sun,   label: 'Sunrise / Sunset',                 value: `${panchang.sunrise} / ${panchang.sunset}` },
  ] : [];

  return (
    <section className="py-14 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.6) }}>
            Aaj Ka Panchang
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Daily Vedic <span style={{ color: GOLD }}>Panchang</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2">{dateStr}</p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(11,16,26,0.85)',
            border: `1px solid ${GOLD_RGBA(0.2)}`,
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{ borderBottom: `1px solid ${GOLD_RGBA(0.12)}`, background: GOLD_RGBA(0.06) }}
          >
            <Star className="w-4 h-4" style={{ color: GOLD }} />
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: GOLD_RGBA(0.8) }}>
              Panchangam — Five Vedic Time Elements
            </p>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center">
              <span className="inline-block animate-spin text-2xl" style={{ color: GOLD }}>🔱</span>
              <p className="text-xs text-slate-500 mt-3">Aaj ka panchang calculate ho raha hai…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: GOLD_RGBA(0.06) }}>
              {rows.map(({ icon: Icon, label, value }, i) => (
                <div
                  key={i}
                  className="px-5 py-4"
                  style={{ background: 'rgba(8,11,18,0.9)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD_RGBA(0.55) }} />
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-3" style={{ background: GOLD_RGBA(0.03), borderTop: `1px solid ${GOLD_RGBA(0.1)}` }}>
            <p className="text-xs text-slate-600 text-center">
              Computed with Swiss Ephemeris · Lahiri Ayanamsha · IST. Verified by Rohiit Gupta.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
