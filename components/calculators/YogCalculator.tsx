'use client';

// ============================================================
// File: components/calculators/YogCalculator.tsx
// Version: v1.0
// Purpose: One form + one result renderer, shared by all three yog
//          calculators (IAS/UPSC, Videsh Settlement, Foreign Spouse).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ------------------------------------------------------------
// WHY SHARED
//   The three pages differ in copy, not in behaviour. Duplicating ~700 lines
//   three times would mean fixing every bug three times. Each page.tsx now
//   carries only its own words, SEO and JSON-LD, and hands the rest here.
//
// THE POINT OF THIS COMPONENT
//   Rendering the score is the easy half. The half that matters is rendering
//   the REASON beside every rule, with the real figure. Other tools stop at
//   the number. The result panel below is built so a reason can never be
//   dropped — it iterates the rules the engine returns, and the engine
//   cannot produce a rule without one.
//
//   The city input, place lookup and timezone fetch follow the exact pattern
//   already used by the other free calculators, so behaviour stays familiar.
// ============================================================

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ── Types mirroring the /api/calc/yog response ───────────────────────────────

interface ScoredRule {
  block: string;
  label: string;
  points: number;
  max: number;
  reason: string;
  absent: boolean;
}

interface YogPayload {
  score: number;
  band: string;
  bandHi: string;
  rules: ScoredRule[];
  highlights: ScoredRule[];
  blockers: ScoredRule[];
  disclaimer: string;
  direction?: { track: string; score: number; reason: string }[];
  routes?: { route: string; score: number; reason: string }[];
  directionHints?: { hint: string; reason: string }[];
  timing?: { period: string; why: string }[];
  nextStep?: { title: string; body: string; href: string; price: string };
}

interface ApiResponse {
  success: boolean;
  type: string;
  chart: {
    lagna: string | null;
    lagna_en: string | null;
    lagna_lord: string | null;
    mahadasha: string | null;
    antardasha: string | null;
    dasamsaLagna: string | null;
    navamsaLagna: string | null;
  };
  result: YogPayload;
}

export interface YogCalculatorConfig {
  /** Matches the `type` the API expects. */
  type: 'upsc' | 'foreign-settlement' | 'foreign-spouse';
  scoreLabel: string;
  /** Heading above the per-rule breakdown. */
  breakdownHeading: string;
  /** Heading for the direction / routes list, when the engine returns one. */
  secondaryHeading?: string;
  ctaHref: string;
  ctaLabel: string;
  ctaPrice: string;
  ctaBlurb: string;
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface FormData {
  name: string;
  gender: 'male' | 'female' | 'other' | '';
  date: string;
  time: string;
  unknownTime: boolean;
  placeQuery: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  timezone: number;
}

// ── Google Maps via /api/maps-proxy (same as the other calculators) ──────────

async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `/api/maps-proxy?url=${encodeURIComponent('https://places.googleapis.com/v1/places:autocomplete')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: query,
          includedPrimaryTypes: ['locality', 'administrative_area_level_3'],
          languageCode: 'en',
        }),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? []).map((s: any) => ({
      place_id: s.placePrediction?.placeId ?? '',
      description: s.placePrediction?.text?.text ?? '',
      main_text: s.placePrediction?.structuredFormat?.mainText?.text ?? '',
      secondary_text: s.placePrediction?.structuredFormat?.secondaryText?.text ?? '',
    }));
  } catch { return []; }
}

async function fetchPlaceDetails(placeId: string) {
  if (!placeId) return null;
  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=location,displayName`;
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const lat = data.location?.latitude ?? null;
    const lng = data.location?.longitude ?? null;
    if (lat === null || lng === null) return null;
    return { lat, lng, city: data.displayName?.text ?? '' };
  } catch { return null; }
}

async function fetchTimezone(lat: number, lng: number): Promise<number> {
  try {
    const ts = Math.floor(Date.now() / 1000);
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}`;
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) return 5.5;
    const data = await res.json();
    if (data.status !== 'OK') return 5.5;
    return Math.round(((data.rawOffset + data.dstOffset) / 3600) * 4) / 4;
  } catch { return 5.5; }
}

function CityInput({ id, value, onSelect, error }: {
  id: string; value: string;
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void;
  error?: string;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  const handleChange = (val: string) => {
    setQuery(val); setSelected(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSuggestions(await fetchPlaceSuggestions(val));
      setLoading(false);
    }, 400);
  };

  const handleSelect = async (s: PlaceSuggestion) => {
    setQuery(s.main_text); setSuggestions([]); setSelected(true); setLoading(true);
    const details = await fetchPlaceDetails(s.place_id);
    if (details) {
      const tz = await fetchTimezone(details.lat, details.lng);
      onSelect(details.city || s.main_text, details.lat, details.lng, tz);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input id={id} type="search" autoComplete="off" placeholder="Type city of birth..."
          value={query} onChange={e => handleChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-10"
          style={{ background: '#0d1120', border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          {loading ? <span style={{ color: GOLD }}>⟳</span> : selected ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#475569' }}>📍</span>}
        </span>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
          style={{ background: '#0d1120', border: '1px solid rgba(212,175,55,0.2)', maxHeight: '200px', overflowY: 'auto' }}>
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => handleSelect(s)} className="px-4 py-3 text-sm cursor-pointer"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = GOLD_RGBA(0.08))}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 600 }}>{s.main_text}</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>{s.secondary_text}</p>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Small presentational bits ────────────────────────────────────────────────

function bandColor(band: string) {
  if (band === 'Very Strong') return '#86EFAC';
  if (band === 'Strong') return '#86EFAC';
  if (band === 'Moderate') return GOLD;
  return '#FCA5A5';
}

/** Renders **bold** segments the engines use for emphasis, nothing else. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i} style={{ color: '#E5E7EB' }}>{p}</strong> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

function RuleRow({ r }: { r: ScoredRule }) {
  const pct = r.max ? Math.round((r.points / r.max) * 100) : 0;
  const col = pct >= 70 ? '#86EFAC' : pct >= 35 ? GOLD : '#FCA5A5';
  return (
    <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <p className="text-sm font-semibold m-0" style={{ color: '#e2e8f0' }}>{r.label}</p>
        <span className="text-xs font-mono shrink-0" style={{ color: col }}>
          {r.points.toFixed(1)} / {r.max}
        </span>
      </div>
      <div className="h-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: col }} />
      </div>
      <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
        <Rich text={r.reason} />
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function YogCalculator({ config }: { config: YogCalculatorConfig }) {
  const [form, setForm] = useState<FormData>({
    name: '', gender: '', date: '', time: '', unknownTime: false,
    placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Date of birth zaroori hai';
    if (!form.unknownTime && !form.time) e.time = 'Time of birth zaroori hai (ya "pata nahi" chunein)';
    if (form.latitude === null || form.longitude === null) e.city = 'List mein se apna janm sthan chunein';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setApiError(null);
    setLoading(true);
    setData(null);
    try {
      const [year, month, day] = form.date.split('-').map(Number);
      const [hour, minute] = (form.unknownTime ? '12:00' : form.time).split(':').map(Number);
      const res = await fetch('/api/calc/yog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.type,
          year, month, day, hour, minute,
          latitude: form.latitude, longitude: form.longitude, timezone: form.timezone,
          name: form.name || null, gender: form.gender || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setApiError(json.error || 'Kuch galat ho gaya. Dobara koshish karein.');
      } else {
        setData(json);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      }
    } catch {
      setApiError('Network error. Dobara koshish karein.');
    } finally {
      setLoading(false);
    }
  };

  const r = data?.result;
  const secondary = r?.direction ?? r?.routes ?? null;

  return (
    <>
      {/* ── FORM ───────────────────────────────────────────────── */}
      <section className="rounded-2xl p-5 md:p-6 mb-8"
        style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.18)}` }}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="yog-name" className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Naam (optional)</label>
            <input id="yog-name" type="text" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
          </div>
          <div>
            <label htmlFor="yog-gender" className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Gender (optional)</label>
            <select id="yog-gender" value={form.gender}
              onChange={e => setForm(p => ({ ...p, gender: e.target.value as FormData['gender'] }))}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', colorScheme: 'dark' }}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="yog-date" className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Date of Birth *</label>
            <input id="yog-date" type="date" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#0d1120', border: `1px solid ${errors.date ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="yog-time" className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Time of Birth *</label>
            <input id="yog-time" type="time" value={form.time} disabled={form.unknownTime}
              onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none disabled:opacity-40"
              style={{ background: '#0d1120', border: `1px solid ${errors.time ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
            <label className="flex items-center gap-2 mt-1.5 text-xs cursor-pointer" style={{ color: '#64748b' }}>
              <input type="checkbox" checked={form.unknownTime}
                onChange={e => setForm(p => ({ ...p, unknownTime: e.target.checked }))} />
              Time pata nahi (12:00 PM maan lenge)
            </label>
            {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="yog-city" className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Place of Birth *</label>
            <CityInput id="yog-city" value={form.placeQuery} error={errors.city}
              onSelect={(city, lat, lng, tz) =>
                setForm(p => ({ ...p, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz }))} />
          </div>
        </div>

        {form.unknownTime && (
          <p className="text-xs mt-4 p-3 rounded-lg" style={{ background: GOLD_RGBA(0.06), color: '#94a3b8' }}>
            Time ke bina lagna aur houses badal sakte hain, isliye score approximate rahega. Sahi samay se
            result kaafi zyada bharosemand hota hai.
          </p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full mt-5 py-3 rounded-lg font-semibold text-sm transition disabled:opacity-50"
          style={{ background: GOLD, color: '#0B0F1A' }}>
          {loading ? 'Chart padha ja raha hai…' : config.ctaLabel}
        </button>

        {apiError && <p className="text-red-400 text-sm mt-3 text-center">{apiError}</p>}
      </section>

      {/* ── RESULT ─────────────────────────────────────────────── */}
      {r && data && (
        <div ref={resultRef}>
          {/* Score */}
          <section className="rounded-2xl p-6 mb-6 text-center"
            style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
            <p className="text-xs uppercase tracking-widest m-0" style={{ color: '#64748b' }}>{config.scoreLabel}</p>
            <p className="m-0 leading-none" style={{ fontSize: '58px', fontWeight: 800, color: bandColor(r.band) }}>
              {r.score}
              <span style={{ fontSize: '20px', color: '#475569' }}> / 100</span>
            </p>
            <p className="m-0 mt-1 text-lg font-semibold" style={{ color: bandColor(r.band) }}>
              {r.band} · {r.bandHi}
            </p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-4 text-xs" style={{ color: '#64748b' }}>
              <span>Lagna: <b style={{ color: '#94a3b8' }}>{data.chart.lagna}</b></span>
              {data.chart.dasamsaLagna && <span>D-10 Lagna: <b style={{ color: '#94a3b8' }}>{data.chart.dasamsaLagna}</b></span>}
              {data.chart.navamsaLagna && <span>D-9 Lagna: <b style={{ color: '#94a3b8' }}>{data.chart.navamsaLagna}</b></span>}
              <span>Dasha: <b style={{ color: '#94a3b8' }}>{data.chart.mahadasha}–{data.chart.antardasha}</b></span>
            </div>
          </section>

          {/* The differentiator */}
          <section className="rounded-2xl p-5 md:p-6 mb-6"
            style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-1" style={{ color: GOLD }}>{config.breakdownHeading}</h2>
            <p className="text-xs m-0 mb-3" style={{ color: '#64748b' }}>
              Har point ke saath wajah aur asli number diya gaya hai — sirf score nahi.
            </p>
            {r.rules.map((rule, i) => <RuleRow key={i} r={rule} />)}
          </section>

          {/* Blockers */}
          {r.blockers.length > 0 && (
            <section className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 className="text-base font-bold m-0 mb-3" style={{ color: '#FCA5A5' }}>Kya rok raha hai</h2>
              {r.blockers.map((b, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <p className="text-sm font-semibold m-0 mb-1" style={{ color: '#e2e8f0' }}>{b.label}</p>
                  <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}><Rich text={b.reason} /></p>
                </div>
              ))}
            </section>
          )}

          {/* Direction or routes */}
          {secondary && secondary.length > 0 && (
            <section className="rounded-2xl p-5 mb-6"
              style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>
                {config.secondaryHeading ?? 'Kaunsa raasta khula hai'}
              </h2>
              {secondary.map((d: any, i: number) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold m-0" style={{ color: '#e2e8f0' }}>{d.track ?? d.route}</p>
                    <span className="text-xs font-mono" style={{ color: GOLD }}>{d.score}</span>
                  </div>
                  <p className="text-xs m-0 mt-0.5" style={{ color: '#94a3b8' }}><Rich text={d.reason} /></p>
                </div>
              ))}
            </section>
          )}

          {/* Origin hints — foreign spouse only */}
          {r.directionHints && r.directionHints.length > 0 && (
            <section className="rounded-2xl p-5 mb-6"
              style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>Jeevansaathi kahan se</h2>
              {r.directionHints.map((h, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <p className="text-sm font-semibold m-0 mb-1" style={{ color: '#e2e8f0' }}>{h.hint}</p>
                  <p className="text-xs m-0" style={{ color: '#94a3b8' }}><Rich text={h.reason} /></p>
                </div>
              ))}
            </section>
          )}

          {/* Timing */}
          {r.timing && r.timing.length > 0 && (
            <section className="rounded-2xl p-5 mb-6"
              style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>Samay</h2>
              {r.timing.map((t, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <p className="text-sm font-semibold m-0 mb-1" style={{ color: '#e2e8f0' }}>{t.period}</p>
                  <p className="text-xs m-0" style={{ color: '#94a3b8' }}><Rich text={t.why} /></p>
                </div>
              ))}
            </section>
          )}

          {/* Next step */}
          <section className="rounded-2xl p-5 md:p-6 mb-6 text-center"
            style={{ background: GOLD_RGBA(0.07), border: `1px solid ${GOLD_RGBA(0.3)}` }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>
              {r.nextStep?.title ?? config.ctaBlurb}
            </h2>
            {r.nextStep && (
              <p className="text-xs leading-relaxed m-0 mb-4 max-w-xl mx-auto" style={{ color: '#94a3b8' }}>
                {r.nextStep.body}
              </p>
            )}
            <Link href={r.nextStep?.href ?? config.ctaHref}
              className="inline-block px-6 py-3 rounded-lg font-semibold text-sm"
              style={{ background: GOLD, color: '#0B0F1A' }}>
              {r.nextStep ? `Kundali Milan — ${r.nextStep.price}` : `${config.ctaBlurb} — ${config.ctaPrice}`}
            </Link>
          </section>

          {/* Always rendered. The engine returns it on every call. */}
          <p className="text-xs text-center leading-relaxed mb-4" style={{ color: '#475569' }}>
            {r.disclaimer}
          </p>
        </div>
      )}
    </>
  );
}
