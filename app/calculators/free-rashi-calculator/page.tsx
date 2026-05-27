'use client';

// ============================================================
// File: app/calculators/free-rashi-calculator/page.tsx
// Version: v1.0 — Free Rashi (Moon Sign) Calculator
// Engine: Swiss Ephemeris + Parashar BPHS + Shadbala + Bhrigu
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

// ─── 12 Rashi Reference (Parashar BPHS) ───────────────────────
const RASHI_DATA: Record<string, any> = {
  'Mesha':      { en: 'Aries',       lord: 'Mars',    element: 'Fire',  symbol: 'Ram',           colors: 'Red, Coral',         days: 'Tuesday', mantra: 'Om Mangalaya Namah',     trait: 'Energetic, pioneering, courageous, impulsive leader' },
  'Vrishabha':  { en: 'Taurus',      lord: 'Venus',   element: 'Earth', symbol: 'Bull',          colors: 'White, Pink, Cream', days: 'Friday',  mantra: 'Om Shukraya Namah',      trait: 'Patient, sensual, loyal, materialistic builder' },
  'Mithuna':    { en: 'Gemini',      lord: 'Mercury', element: 'Air',   symbol: 'Twins',         colors: 'Green, Light Blue',  days: 'Wednesday', mantra: 'Om Budhaya Namah',     trait: 'Curious, witty, dual-natured, communicative' },
  'Karka':      { en: 'Cancer',      lord: 'Moon',    element: 'Water', symbol: 'Crab',          colors: 'White, Silver, Pearl', days: 'Monday', mantra: 'Om Chandraya Namah',    trait: 'Emotional, nurturing, intuitive, family-oriented' },
  'Simha':      { en: 'Leo',         lord: 'Sun',     element: 'Fire',  symbol: 'Lion',          colors: 'Gold, Orange, Red',   days: 'Sunday',  mantra: 'Om Suryaya Namah',      trait: 'Royal, generous, proud, charismatic leader' },
  'Kanya':      { en: 'Virgo',       lord: 'Mercury', element: 'Earth', symbol: 'Maiden',        colors: 'Green, White',        days: 'Wednesday', mantra: 'Om Budhaya Namah',     trait: 'Analytical, perfectionist, service-oriented, modest' },
  'Tula':       { en: 'Libra',       lord: 'Venus',   element: 'Air',   symbol: 'Scales',        colors: 'White, Pink, Blue',   days: 'Friday',  mantra: 'Om Shukraya Namah',     trait: 'Balanced, diplomatic, artistic, indecisive' },
  'Vrishchika': { en: 'Scorpio',     lord: 'Mars',    element: 'Water', symbol: 'Scorpion',      colors: 'Red, Maroon, Black',  days: 'Tuesday', mantra: 'Om Mangalaya Namah',    trait: 'Intense, mysterious, passionate, transformative' },
  'Dhanu':      { en: 'Sagittarius', lord: 'Jupiter', element: 'Fire',  symbol: 'Archer',        colors: 'Yellow, Orange',      days: 'Thursday', mantra: 'Om Gurave Namah',      trait: 'Philosophical, optimistic, freedom-loving, adventurous' },
  'Makara':     { en: 'Capricorn',   lord: 'Saturn',  element: 'Earth', symbol: 'Sea-goat',      colors: 'Black, Blue, Brown',  days: 'Saturday', mantra: 'Om Shanaye Namah',     trait: 'Disciplined, ambitious, patient, status-conscious' },
  'Kumbha':     { en: 'Aquarius',    lord: 'Saturn',  element: 'Air',   symbol: 'Water-bearer',  colors: 'Blue, Black, Purple', days: 'Saturday', mantra: 'Om Shanaye Namah',     trait: 'Innovative, humanitarian, eccentric, intellectual' },
  'Meena':      { en: 'Pisces',      lord: 'Jupiter', element: 'Water', symbol: 'Fish',          colors: 'Yellow, Sea Green',   days: 'Thursday', mantra: 'Om Gurave Namah',       trait: 'Compassionate, intuitive, spiritual, dreamy' },
};

// ─── Google Maps via /api/maps-proxy ──────────────────────────
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

const FAQS = [
  { q: 'Rashi kya hoti hai?', a: 'Rashi (Moon Sign / Chandra Rashi) Vedic Jyotish ka sabse important zodiac sign hai. Aakash ko 12 equal divisions mein baata gaya hai — har 30° ka ek Rashi. Aapki Chandra Rashi wahi hai jismein aapke janm samay Chandra (Moon) sthit tha. Indian astrology mein predictions zyadatar Chandra Rashi pe based hoti hain.' },
  { q: 'Chandra Rashi aur Surya Rashi mein kya antar hai?', a: 'Chandra Rashi = Moon Sign — aapka mann, emotions, mother. Vedic astrology ka primary sign. Surya Rashi = Sun Sign — Western astrology mein use hota hai, identity aur ego dikhata hai. India mein "Rashi" ka matlab aksar Chandra Rashi hota hai.' },
  { q: 'Apni Rashi kaise pata karein?', a: 'Apni Chandra Rashi jaanne ke liye Date of Birth, exact Time of Birth, aur Place of Birth chahiye. Trikal Vaani Calculator Swiss Ephemeris se Moon ki exact position calculate karta hai aur aapki Chandra Rashi turant nikalta hai — bilkul free.' },
  { q: '12 Rashis kaun se hain?', a: '12 Rashis hain — Mesha (Aries), Vrishabha (Taurus), Mithuna (Gemini), Karka (Cancer), Simha (Leo), Kanya (Virgo), Tula (Libra), Vrishchika (Scorpio), Dhanu (Sagittarius), Makara (Capricorn), Kumbha (Aquarius), aur Meena (Pisces). Har Rashi ka apna lord planet, element, aur swabhav hai.' },
  { q: 'Rashi se kya predict hota hai?', a: 'Aapki Chandra Rashi se predict hota hai — (1) Emotional patterns aur mann ki state, (2) Mother ke saath rishta, (3) Marriage compatibility (rashi koot matching), (4) Sade Sati aur Saturn transit ka effect, (5) Daily horoscope aur muhurta. Vimshottari Dasha bhi Janma Nakshatra (jo Chandra Rashi mein hi hota hai) se calculate hoti hai.' },
  { q: 'Kya Rashi Calculator bilkul free hai?', a: 'Haan. 100% free. Chandra Rashi naam, ruling planet, element, symbol, favorable colors, lucky days, mantra, personality traits, 3 Parashar Dos, 3 Donts, aur 3 personalized remedies (Mantra, Ratna, Daan) — sab free.' },
  { q: 'Rashi ke result kitne accurate hain?', a: 'Trikal Vaani Swiss Ephemeris use karta hai — NASA-grade astronomical library. Lahiri Ayanamsha (Government of India standard) + BPHS classical rules — 99.9% astronomical accuracy. Same engine professional astrologers worldwide use karte hain.' },
];

export default function FreeRashiCalculatorPage() {
  const [form, setForm] = useState<FormData>({
    name: '', gender: '', date: '', time: '12:00', unknownTime: false,
    placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const set = useCallback((key: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.date) errs.date = 'Date of birth is required';
    if (!form.unknownTime && !form.time) errs.time = 'Time of birth is required';
    if (form.latitude === null) errs.latitude = 'Please select a city from suggestions';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;
    const [year, month, day] = form.date.split('-').map(Number);
    const tob = form.unknownTime ? '12:00' : form.time;
    const [hour, minute] = tob.split(':').map(Number);
    setLoading(true);
    try {
      const res = await fetch('/api/calc/kundali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day, hour, minute,
          latitude: form.latitude, longitude: form.longitude, timezone: form.timezone,
          name: form.name || null, gender: form.gender || null,
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

  // ─── RASHI extraction ─── Chandra Rashi = Moon's sign ────────
  const grahas: any[] = result?.kundali?.grahas ?? [];
  const moonGraha = grahas.find((g: any) => g.planet === 'Moon') ?? null;
  const sunGraha = grahas.find((g: any) => g.planet === 'Sun') ?? null;

  const chandraRashi = moonGraha?.sign ?? null;
  const suryaRashi = sunGraha?.sign ?? null;
  const moonNakshatra = moonGraha?.nakshatra ?? null;
  const moonHouse = moonGraha?.house ?? null;

  const rashiDetails = chandraRashi ? RASHI_DATA[chandraRashi] || {} : {};

  // ─── Template data ──────────────────────────────────────────
  const template = result?.template;
  const actionWindows: any[] = template?.actionWindows ?? [];
  const dos: string[] = actionWindows.slice(0, 3).map((w: any) => `${w.window}: ${w.reason}`);
  const avoidWindows: any[] = template?.avoidWindows ?? [];
  let donts: string[] = avoidWindows.slice(0, 3).map((w: any) => `${w.window}: ${w.reason}`);
  const remedyList: any[] = template?.remedyPlan?.remedies ?? [];
  const mantraObj = remedyList.find((r: any) => r.type === 'mantra');
  const gemObj = remedyList.find((r: any) => r.type === 'gemstone');
  const daanObj = remedyList.find((r: any) => r.type === 'daan' || r.type === 'dana' || r.type === 'charity');
  const vratObj = remedyList.find((r: any) => r.type === 'vrat');
  const specialObj = remedyList.find((r: any) => r.type === 'special');
  const mantra = mantraObj ? `${mantraObj.mantra} — ${mantraObj.count}, ${mantraObj.time}. ${mantraObj.special || ''}`.trim() : null;
  const ratna = gemObj ? `${gemObj.lagna_stone?.stone || gemObj.dasha_stone?.stone} (${gemObj.lagna_stone?.metal || 'Gold'}, ${gemObj.lagna_stone?.finger || 'Index finger'}) — ${gemObj.lagna_stone?.for || gemObj.dasha_stone?.for || ''}` : null;
  const daan = daanObj ? `${daanObj.items} — On ${daanObj.day}, give to ${daanObj.recipient}. ${daanObj.note || ''}`.trim() : null;
  if (donts.length === 0) {
    if (vratObj) donts.push(`Vrat (Fast): ${vratObj.name} on ${vratObj.day} — Deity: ${vratObj.deity}. Prasad: ${vratObj.prasad}`);
    if (specialObj) donts.push(`${specialObj.text || ''} — Focus: ${specialObj.focus || ''}`);
    if (mantraObj?.special) donts.push(`Avoid: Do not chant mantra after consuming non-veg or alcohol. Best time: ${mantraObj.time}`);
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

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
            <span style={{ color: GOLD }}>Free Rashi Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Rashi Calculator — Find Your Moon Sign (Chandra Rashi) Online
          </h1>

          <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikal Vaani ka Free Rashi Calculator</strong> aapki Chandra Rashi (Moon Sign) Swiss Ephemeris se calculate karta hai — Chandra ki exact position se. Date, time, aur place daalo — Rashi, ruling planet, element, symbol, favorable colors, lucky days, personality traits, aur 3 free Parashar remedies (Mantra, Ratna, Daan) turant milte hain. 100% free, BPHS classical rules ke according.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS · Lahiri Ayanamsha · Shadbala · Bhrigu Nandi</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Chandra Rashi (Free)</h2>
            <div className="grid gap-5">
              <div>
                <label htmlFor="tv-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-yellow-400">*</span></label>
                <input id="tv-name" type="text" placeholder="Enter your full name"
                  value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.name)} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth <span className="text-yellow-400">*</span></label>
                <input id="tv-dob" type="date" value={form.date}
                  onChange={e => set('date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.date)} />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="tv-tob" className="text-sm font-medium text-slate-300">
                    Time of Birth {!form.unknownTime && <span className="text-yellow-400">*</span>}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                    <input type="checkbox" checked={form.unknownTime} onChange={e => set('unknownTime', e.target.checked)} className="rounded" />
                    Unknown time
                  </label>
                </div>
                <input id="tv-tob" type="time" value={form.time}
                  onChange={e => set('time', e.target.value)} disabled={form.unknownTime}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ ...inputStyle(!!errors.time), opacity: form.unknownTime ? 0.4 : 1 }} />
                {form.unknownTime && <p className="text-slate-500 text-xs mt-1">Solar chart will be used (12:00 noon)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Gender <span className="text-slate-500 text-xs ml-1">(for personalized remedies)</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: 'male', label: '♂ Male', color: '#60a5fa' }, { value: 'female', label: '♀ Female', color: '#f472b6' }, { value: 'other', label: '⊕ Other', color: '#94a3b8' }].map(opt => (
                    <button key={opt.value} type="button" onClick={() => set('gender', opt.value)}
                      className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center"
                      style={{ background: form.gender === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${form.gender === opt.value ? `${opt.color}60` : 'rgba(255,255,255,0.1)'}`, color: form.gender === opt.value ? opt.color : '#64748b' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Place of Birth <span className="text-yellow-400">*</span></label>
                <CityInput id="tv-place" value={form.placeQuery} error={errors.latitude}
                  onSelect={(city, lat, lng, tz) => {
                    setForm(prev => ({ ...prev, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz }));
                    setErrors(prev => { const n = { ...prev }; delete n.latitude; return n; });
                  }} />
              </div>

              {form.latitude !== null && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Latitude', value: form.latitude.toFixed(4) },
                    { label: 'Longitude', value: form.longitude!.toFixed(4) },
                    { label: 'Timezone', value: `UTC ${form.timezone >= 0 ? '+' : ''}${form.timezone}` },
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
                {loading ? '⟳ Finding Rashi...' : '🌙 Find My Rashi'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Shadbala · Bhrigu Nandi</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* RASHI HERO */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                  {form.name ? `${form.name}'s ` : ''}Chandra Rashi (Moon Sign)
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: GOLD }}>
                  🌙 {chandraRashi || '—'}
                </div>
                {rashiDetails.en && (
                  <div className="text-base text-slate-300">
                    ({rashiDetails.en}) <span style={{ color: GOLD }} className="mx-2">·</span> Symbol: <span style={{ color: GOLD }}>{rashiDetails.symbol}</span>
                  </div>
                )}
                {moonNakshatra && (
                  <div className="text-sm text-slate-400 mt-2">
                    Janma Nakshatra: <span style={{ color: GOLD }}>{moonNakshatra}</span>
                  </div>
                )}
                {suryaRashi && (
                  <div className="text-sm text-slate-400 mt-1">
                    Surya Rashi (Sun Sign): <span style={{ color: GOLD }}>{suryaRashi}</span>
                  </div>
                )}
                {rashiDetails.trait && (
                  <div className="text-sm text-slate-300 mt-4 italic">"{rashiDetails.trait}"</div>
                )}
              </div>

              {/* RASHI DETAILS */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>Rashi Details (Parashar BPHS)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DetailCell icon="🪐" label="Ruling Planet (Lord)" value={rashiDetails.lord} />
                  <DetailCell icon="🔥" label="Element (Tatva)" value={rashiDetails.element} />
                  <DetailCell icon="🏠" label="Moon House" value={moonHouse ? `${moonHouse}th Bhava` : null} />
                  <DetailCell icon="🎨" label="Favorable Colors" value={rashiDetails.colors} />
                  <DetailCell icon="📅" label="Lucky Day" value={rashiDetails.days} />
                  <DetailCell icon="🔱" label="Daily Mantra" value={rashiDetails.mantra} />
                </div>
                <p className="text-xs text-slate-500 mt-4 italic">
                  Chandra Rashi = Moon's exact zodiac position at birth. Primary basis for Vedic predictions, Dasha, and compatibility.
                </p>
              </div>

              {/* DOS & DONTS */}
              {(dos.length > 0 || donts.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos (Parashar Niyam)</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {dos.slice(0, 3).map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                    </ul>
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#FCA5A5' }}>❌ 3 Donts (Parashar Vivarjan)</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {donts.slice(0, 3).map((d, i) => <li key={i} className="flex gap-2"><span className="text-red-400">•</span><span>{d}</span></li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪔 Your 3 Free Remedies (Parashar)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={mantra} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={ratna} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={daan} />}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* PILLAR CONTENT */}
          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Chandra Rashi Kya Hai? — Vedic Astrology Ka Primary Sign</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic Jyotish mein <strong style={{ color: GOLD }}>Rashi (Chandra Rashi)</strong> aapka Moon Sign hai — janm samay Chandra (Moon) jis 30° wide zodiac section mein tha. Maharishi Parashar ne <em>BPHS</em> mein bataya hai ki Indian astrology predictions zyadatar Moon Sign pe based hoti hain, kyunki Chandra aapke <strong>mann (mind), emotions, aur mother</strong> ka karak hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Chandra Rashi se hi <strong style={{ color: GOLD }}>Vimshottari Dasha</strong> calculate hoti hai, marriage compatibility (Ashtakoot, Rashi Koot) check hoti hai, aur Sade Sati ka effect determine hota hai. Yahi reason hai ki India mein "Rashi" word ka matlab default Chandra Rashi hota hai — Surya Rashi nahi (jo Western astrology mein use hota hai).
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>12 Rashis aur Unke Lord Planets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 not-prose">
              {Object.entries(RASHI_DATA).map(([rashi, data]: [string, any]) => (
                <div key={rashi} className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.5)', border: `1px solid ${GOLD}33` }}>
                  <div className="font-bold" style={{ color: GOLD }}>{rashi} <span className="text-slate-400 font-normal text-xs">({data.en})</span></div>
                  <div className="text-xs text-slate-400 mt-1">Lord: {data.lord} · {data.element}</div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Chandra Rashi vs Surya Rashi vs Lagna Rashi</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Chandra Rashi (Moon Sign):</strong> Janm samay Chandra ki rashi. Vedic astrology ka primary sign — mann, emotions, mother. Indian predictions ka basis.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Surya Rashi (Sun Sign):</strong> Janm samay Surya ki rashi. Western astrology use karta hai — identity, ego, father. India mein secondary.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Lagna Rashi (Ascendant):</strong> Janm samay purvi kshitij pe udit ho rahi rashi. Physical body, personality, life direction.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong>Trikal Vaani calculator</strong> hamesha Chandra Rashi dikhata hai — Parashar BPHS ke according primary sign yahi hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikal Vaani vs AstroSage vs AstroTalk Rashi Calculator</h2>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Element + Lord + Symbol</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Favorable Colors/Days</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Parashar Dos/Donts</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Mantra+Ratna+Daan</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Rashi Calculator</h2>
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
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Check' },
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh' },
              ].map((c) => (
                <Link key={c.slug} href={`/calculators/${c.slug}`}
                  className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: GOLD }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

function DetailCell({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="font-bold text-base" style={{ color: GOLD }}>{value || '—'}</div>
    </div>
  );
}

function Remedy({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1.5" style={{ color: GOLD }}>{title}</div>
      <div className="text-sm text-slate-300 leading-relaxed">{content}</div>
    </div>
  );
}
