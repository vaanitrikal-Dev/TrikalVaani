'use client';

// ============================================================
// File: app/calculators/free-child-birth-muhurat-calculator/page.tsx
// Version: v1.0 — Free Child Birth Muhurat Calculator
// VM endpoint: /muhurat-finder (master-grade)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface PlaceSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

// ─── Google Maps via /api/maps-proxy ──────────────────────────
async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `/api/maps-proxy?url=${encodeURIComponent('https://places.googleapis.com/v1/places:autocomplete')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: query, languageCode: 'en' }),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? [])
      .filter((s: any) => s.placePrediction)
      .map((s: any) => ({
        place_id: s.placePrediction.placeId ?? '',
        description: s.placePrediction.text?.text ?? '',
        main_text: s.placePrediction.structuredFormat?.mainText?.text ?? s.placePrediction.text?.text ?? '',
        secondary_text: s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
      }));
  } catch { return []; }
}

async function fetchPlaceDetails(placeId: string): Promise<{ lat: number; lng: number; city: string } | null> {
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

function PlaceInput({ id, placeholder, onSelect, error }: {
  id: string; placeholder: string;
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        <input id={id} type="search" autoComplete="off" placeholder={placeholder}
          value={query} onChange={e => handleChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-10"
          style={{ background: '#0d1120', border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          {loading ? <span style={{ color: GOLD }}>⟳</span> : selected ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#475569' }}>🏥</span>}
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

const FAQS = [
  { q: 'C-section ke liye shubh muhurat kaise nikalta hai?', a: 'C-section ya planned delivery ka muhurat aapke doctor dwara di gayi safe time window ke ANDAR nikala jaata hai. Trikal Vaani har 10 minute ka Lagna, Nakshatra, Tithi, Yoga, aur 8th house check karke sabse auspicious slot batata hai — sirf us window mein jo doctor ne approve ki hai. Medical safety pehle, muhurat uske andar.' },
  { q: 'Kya yeh tool doctor ki advice replace karta hai?', a: 'Bilkul nahi. Delivery date aur safe time window 100% aapke doctor decide karte hain — maa aur bachche ki health ke according. Yeh tool sirf us approved window ke andar sabse shubh moment dhoondta hai. Yeh medical advice nahi hai.' },
  { q: 'Best nakshatra for baby birth kaunse hain?', a: 'Classical Jyotish ke according Pushya, Rohini, Hasta, Anuradha, aur Swati nakshatra child birth ke liye sabse auspicious mane jaate hain. Trikal Vaani in sabhi ko score karta hai aur strong Lagna lord + clean 8th house ko bhi check karta hai.' },
  { q: 'Naamakshar (lucky name letter) kya hota hai?', a: 'Jis nakshatra aur pada mein bachcha paida hota hai, uske according ek shubh starting syllable (Naamakshar) milta hai — jaise "Cho", "La", "Mi". Iss syllable se shuru hone wala naam bachche ke liye auspicious mana jaata hai. Paid report mein hum boy + girl naam suggestions bhi dete hain.' },
  { q: 'Kya yeh IVF delivery ke liye bhi kaam karta hai?', a: 'Haan. Chahe C-section ho ya IVF embryo transfer/planned delivery — jab bhi date aur time pehle se decide ho sakti ho, yeh tool us window mein sabse shubh moment batata hai.' },
  { q: 'Result kitne accurate hain?', a: 'Trikal Vaani Swiss Ephemeris (NASA-grade) + Lahiri Ayanamsha use karta hai, aur master-grade Muhurta logic se 9 factors check karta hai: Lagna nakshatra, Lagna lord ka house + dignity, 8th house affliction, kendra/trikona benefics, Moon strength, Yoga, Tithi, Karana, aur Rahu Kaal. Yeh wahi method hai jo experienced astrologers use karte hain.' },
];

interface SlotData {
  score: number;
  time: string;
  lagna_sign: string;
  lagna_lord: string;
  lagna_lord_house: number;
  lagna_lord_dignity: string;
  lagna_nakshatra: string;
  naamakshar: string;
  moon_nakshatra: string;
  tithi: string;
  yoga: string;
  karana: string;
  eighth_house_malefics: string[];
  reasons: string[];
  cautions: string[];
}

export default function FreeChildBirthMuhuratPage() {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [timezone, setTimezone] = useState(5.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFullDay, setShowFullDay] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!date) e.date = 'Delivery date is required';
    if (!startTime) e.start = 'Window start time required';
    if (!endTime) e.end = 'Window end time required';
    if (lat === null) e.place = 'Please select hospital/city from suggestions';
    if (startTime && endTime && endTime <= startTime) e.end = 'End time must be after start time';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;
    const [year, month, day] = date.split('-').map(Number);
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    setLoading(true);
    try {
      const res = await fetch('/api/calc/muhurat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day,
          window_start_hour: sh, window_start_minute: sm,
          window_end_hour: eh, window_end_minute: em,
          latitude: lat, longitude: lng, timezone,
          full_day: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }
      const data = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0', colorScheme: 'dark' as const,
  });

  const best: SlotData | null = result?.best_slot || null;
  const topSlots: SlotData[] = result?.top_slots || [];
  const fullDay = result?.full_day || null;

  return (
    <>
      <SiteNav />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Child Birth Muhurat Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Child Birth Muhurat Calculator — Auspicious C-Section & Delivery Time by Date
          </h1>

          {/* GEO DIRECT ANSWER (40-60w) */}
          <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              A <strong style={{ color: GOLD }}>child birth muhurat</strong> is the most auspicious moment to deliver a baby, chosen using Vedic astrology. For a planned C-section or IVF delivery, the muhurat is selected <strong>within the safe time window your doctor approves</strong> — based on a strong Lagna (ascendant), favourable Nakshatra and Tithi, and a clean 8th house. Trikal Vaani finds the best slot inside that window using Swiss Ephemeris and BPHS classical rules.
            </p>
          </div>

          {/* SAFETY BANNER — EEAT trust signal */}
          <div className="rounded-xl p-4 mb-6 flex gap-3" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.3)' }}>
            <span className="text-xl">🩺</span>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong style={{ color: '#93c5fd' }}>Medical safety comes first.</strong> Your doctor decides the delivery date and the safe time window based on the mother's and baby's health. This tool only finds the most auspicious moment <em>inside</em> that doctor-approved window. It is guidance to discuss with your doctor — not medical advice.
            </p>
          </div>

          {/* AUTHOR CARD — EEAT */}
          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · BPHS Muhurta · Lahiri Ayanamsha · 9-Factor Master Analysis</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Auspicious Delivery Time (Free)</h2>
            <div className="grid gap-5">

              <div>
                <label htmlFor="m-date" className="block text-sm font-medium text-slate-300 mb-1.5">Delivery Date <span className="text-yellow-400">*</span> <span className="text-slate-500 text-xs">(as planned with your doctor)</span></label>
                <input id="m-date" type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.date)} />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="m-start" className="block text-sm font-medium text-slate-300 mb-1.5">Window Start <span className="text-yellow-400">*</span></label>
                  <input id="m-start" type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.start)} />
                </div>
                <div>
                  <label htmlFor="m-end" className="block text-sm font-medium text-slate-300 mb-1.5">Window End <span className="text-yellow-400">*</span></label>
                  <input id="m-end" type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.end)} />
                  {errors.end && <p className="text-red-400 text-xs mt-1">{errors.end}</p>}
                </div>
              </div>
              <p className="text-xs text-slate-500 -mt-3">⏱️ Enter the time window your doctor has cleared as safe (e.g. 9:00 AM to 1:00 PM).</p>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Hospital / City <span className="text-yellow-400">*</span> <span className="text-slate-500 text-xs">(for exact location accuracy)</span></label>
                <PlaceInput id="m-place" placeholder="Type hospital or city name..." error={errors.place}
                  onSelect={(c, la, ln, tz) => {
                    setCity(c); setLat(la); setLng(ln); setTimezone(tz);
                    setErrors(prev => { const n = { ...prev }; delete n.place; return n; });
                  }} />
              </div>

              {lat !== null && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Latitude', value: lat.toFixed(4) },
                    { label: 'Longitude', value: lng!.toFixed(4) },
                    { label: 'Timezone', value: `UTC ${timezone >= 0 ? '+' : ''}${timezone}` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-xs text-slate-500 mb-1">{label}</label>
                      <div className="px-3 py-2 rounded-lg text-xs font-mono text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#22c55e' }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {error && <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: loading ? GOLD_RGBA(0.3) : `linear-gradient(135deg,rgba(212,175,55,0.8) 0%,${GOLD} 100%)`, color: '#080B12', fontSize: '15px' }}>
                {loading ? '⟳ Finding auspicious time...' : '🕉️ Find Auspicious Muhurat'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · BPHS Muhurta · Within your doctor's window</p>
            </div>
          </div>

          {/* RESULT */}
          {result && best && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* BEST SLOT — primary recommendation */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                background: `linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(2,8,23,0.6) 100%)`,
                border: `1px solid ${GOLD_RGBA(0.4)}`
              }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Most Auspicious Time (within your window)</div>
                <div className="text-5xl font-serif font-bold mb-2" style={{ color: GOLD }}>{best.time}</div>
                <div className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4"
                  style={{ background: GOLD_RGBA(0.15), color: GOLD, border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                  {result.best_band} · {best.score}/100
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-left">
                  <Cell label="Lagna" value={best.lagna_sign} />
                  <Cell label="Nakshatra" value={best.lagna_nakshatra} />
                  <Cell label="Tithi" value={best.tithi} />
                  <Cell label="Lucky Letter" value={best.naamakshar} highlight />
                </div>
              </div>

              {/* WHY THIS TIME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ Favourable Factors</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {best.reasons.map((r, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{r}</span></li>)}
                  </ul>
                </div>
                {best.cautions.length > 0 && (
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#FCA5A5' }}>⚠️ Points of Caution</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {best.cautions.map((c, i) => <li key={i} className="flex gap-2"><span className="text-red-400">•</span><span>{c}</span></li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* TOP ALTERNATIVE SLOTS */}
              {topSlots.length > 1 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-4" style={{ color: GOLD }}>🕐 Other Good Times in Your Window</h3>
                  <div className="space-y-2">
                    {topSlots.slice(1, 5).map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.12)}` }}>
                        <div>
                          <span className="font-bold text-base" style={{ color: GOLD }}>{s.time}</span>
                          <span className="text-xs text-slate-500 ml-3">{s.lagna_sign} Lagna · {s.lagna_nakshatra}</span>
                        </div>
                        <span className="text-sm font-mono" style={{ color: s.score >= 60 ? '#86EFAC' : s.score >= 45 ? GOLD : '#FCA5A5' }}>{s.score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PAID CTA — ₹101 */}
              <div className="rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.12), rgba(2,8,23,0.5))`, border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>🔮 Unlock the Full Muhurat Report — ₹101</h3>
                <p className="text-sm text-slate-300 mb-4 max-w-xl mx-auto">
                  Get a detailed life prediction for a child born at this time, the lucky name letter with boy & girl name suggestions, full slot-by-slot ranking, and a downloadable PDF to share with your family and doctor.
                </p>
                <button className="px-8 py-3 rounded-xl font-bold" style={{ background: GOLD, color: '#080B12' }}>
                  Get Full Report · ₹101
                </button>
              </div>

              {/* FULL DAY — EDUCATIONAL, collapsed by default */}
              {fullDay && fullDay.best_slot && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => setShowFullDay(!showFullDay)} className="w-full flex items-center justify-between text-left">
                    <span className="text-sm font-semibold text-slate-400">📚 Educational: most auspicious time across the whole day</span>
                    <span style={{ color: GOLD }}>{showFullDay ? '−' : '+'}</span>
                  </button>
                  {showFullDay && (
                    <div className="mt-4">
                      <div className="rounded-lg p-4 mb-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <p className="text-xs text-red-200 leading-relaxed">{fullDay.note}</p>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(2,8,23,0.4)' }}>
                        <span className="font-bold" style={{ color: GOLD }}>{fullDay.best_slot.time}</span>
                        <span className="text-xs text-slate-500">{fullDay.best_slot.lagna_sign} · {fullDay.best_slot.lagna_nakshatra}</span>
                        <span className="text-sm font-mono text-slate-400">{fullDay.best_slot.score}/100</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DISCLAIMER */}
              {result.disclaimer && (
                <p className="text-xs text-slate-500 leading-relaxed p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {result.disclaimer}
                </p>
              )}
            </div>
          )}

          {/* PILLAR CONTENT */}
          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Child Birth Muhurat Kya Hota Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Child birth muhurat</strong> woh shubh samay hai jab bachche ka janam sabse favourable planetary alignment mein ho. Vedic Jyotish mein maana jaata hai ki janam ke samay ka Lagna, Nakshatra, aur grah sthiti bachche ke swabhav, health, aur bhavishya ko shape karte hain. C-section ya IVF mein, jab time pehle se choose kiya ja sakta hai, parents us shubh moment ko select kar sakte hain — lekin <strong>hamesha doctor ki approved safe window ke andar</strong>.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Muhurat Kis Cheez Par Depend Karta Hai? (9 Factors)</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Trikal Vaani master-grade analysis karta hai: (1) Lagna Nakshatra ki quality — Pushya, Rohini, Hasta jaise auspicious nakshatra. (2) Lagna lord ka house — kendra/trikona mein strong. (3) Lagna lord ki dignity — exalted ya own sign. (4) 8th house affliction — malefic 8th house mein ho toh avoid. (5) Kendra/trikona mein benefics. (6) Moon ki strength. (7) Shubh Yoga. (8) Purna Tithi. (9) Rahu Kaal avoidance. Yeh sab milkar 0-100 ka muhurat score banate hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Naamakshar — Bachche Ka Lucky Naam Letter</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Har nakshatra ke 4 pada hote hain, aur har pada ka ek shubh starting syllable hota hai. Jaise Pushya nakshatra ke padas se "Hu", "He", "Ho", "Da" aate hain. Jis muhurat mein bachcha paida hota hai, uska Lagna nakshatra-pada bachche ke naam ka lucky letter decide karta hai. Trikal Vaani ki paid report mein hum is letter se shuru hone wale auspicious boy aur girl names suggest karte hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikal Vaani vs Other Muhurat Sites</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Feature</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Trikal Vaani</th>
                    <th className="p-3 text-left text-slate-400">Others</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Personalised to your window</td><td className="p-3" style={{ color: GOLD }}>✓ Exact</td><td className="p-3 text-slate-500">✗ Generic date lists</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">8th house affliction check</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Instant result</td><td className="p-3" style={{ color: GOLD }}>✓ Seconds</td><td className="p-3 text-slate-500">✗ Manual consult</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Doctor-safety first</td><td className="p-3" style={{ color: GOLD }}>✓ Built-in</td><td className="p-3 text-slate-500">✗ Footnote</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lucky name letter</td><td className="p-3" style={{ color: GOLD }}>✓ Naamakshar</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="p-4 rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra Finder' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati' },
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
              ].map((c) => (
                <Link key={c.slug} href={`/calculators/${c.slug}`}
                  className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: GOLD }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ SCHEMA (AEO) */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }) }} />

        </div>
      </main>
    </>
  );
}

function Cell({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${highlight ? GOLD : GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="font-bold text-base" style={{ color: GOLD }}>{value || '—'}</div>
    </div>
  );
}
