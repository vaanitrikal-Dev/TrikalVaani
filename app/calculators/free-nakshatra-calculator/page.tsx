'use client';

// ============================================================
// File: app/calculators/free-nakshatra-calculator/page.tsx
// Version: v2.0 — BirthForm v9.2 style + /api/maps-proxy
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

interface ApiResult {
  success: boolean;
  sessionId: string;
  instant: any;
  kundali: any;
  template: any;
}

const NAKSHATRA_DATA: Record<string, any> = {
  'Ashwini': { lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse head', gana: 'Deva', yoni: 'Horse', nadi: 'Aadi', trait: 'Healer, swift, pioneering' },
  'Bharani': { lord: 'Shukra', deity: 'Yama', symbol: 'Yoni', gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya', trait: 'Bearer, transformative, intense' },
  'Krittika': { lord: 'Surya', deity: 'Agni', symbol: 'Razor/Flame', gana: 'Rakshasa', yoni: 'Sheep', nadi: 'Antya', trait: 'Sharp, purifying, leader' },
  'Rohini': { lord: 'Chandra', deity: 'Brahma', symbol: 'Chariot', gana: 'Manushya', yoni: 'Serpent', nadi: 'Antya', trait: 'Beautiful, creative, magnetic' },
  'Mrigashira': { lord: 'Mangal', deity: 'Soma', symbol: 'Deer head', gana: 'Deva', yoni: 'Serpent', nadi: 'Madhya', trait: 'Seeker, curious, gentle' },
  'Ardra': { lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop', gana: 'Manushya', yoni: 'Dog', nadi: 'Aadi', trait: 'Stormy, transformative, intense' },
  'Punarvasu': { lord: 'Guru', deity: 'Aditi', symbol: 'Bow & quiver', gana: 'Deva', yoni: 'Cat', nadi: 'Aadi', trait: 'Renewer, optimistic, philosophical' },
  'Pushya': { lord: 'Shani', deity: 'Brihaspati', symbol: 'Cow udder', gana: 'Deva', yoni: 'Sheep', nadi: 'Madhya', trait: 'Nurturing, scholarly, most auspicious' },
  'Ashlesha': { lord: 'Budh', deity: 'Nagas', symbol: 'Coiled snake', gana: 'Rakshasa', yoni: 'Cat', nadi: 'Antya', trait: 'Mystical, hypnotic, deep wisdom' },
  'Magha': { lord: 'Ketu', deity: 'Pitru', symbol: 'Throne', gana: 'Rakshasa', yoni: 'Rat', nadi: 'Antya', trait: 'Royal, ancestral, authoritative' },
  'Purva Phalguni': { lord: 'Shukra', deity: 'Bhaga', symbol: 'Hammock', gana: 'Manushya', yoni: 'Rat', nadi: 'Madhya', trait: 'Pleasure-loving, creative, charming' },
  'Uttara Phalguni': { lord: 'Surya', deity: 'Aryaman', symbol: 'Bed', gana: 'Manushya', yoni: 'Cow', nadi: 'Aadi', trait: 'Generous, helpful, leader' },
  'Hasta': { lord: 'Chandra', deity: 'Savitar', symbol: 'Hand/Fist', gana: 'Deva', yoni: 'Buffalo', nadi: 'Aadi', trait: 'Skilled, dexterous, witty' },
  'Chitra': { lord: 'Mangal', deity: 'Vishwakarma', symbol: 'Pearl/Jewel', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Madhya', trait: 'Artistic, brilliant, attractive' },
  'Swati': { lord: 'Rahu', deity: 'Vayu', symbol: 'Sword/Coral', gana: 'Deva', yoni: 'Buffalo', nadi: 'Antya', trait: 'Independent, diplomatic, restless' },
  'Vishakha': { lord: 'Guru', deity: 'Indra-Agni', symbol: 'Triumphal arch', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Antya', trait: 'Ambitious, goal-driven, determined' },
  'Anuradha': { lord: 'Shani', deity: 'Mitra', symbol: 'Lotus', gana: 'Deva', yoni: 'Deer', nadi: 'Madhya', trait: 'Devoted, friendly, balanced' },
  'Jyeshtha': { lord: 'Budh', deity: 'Indra', symbol: 'Earring', gana: 'Rakshasa', yoni: 'Deer', nadi: 'Aadi', trait: 'Eldest, protective, occult-inclined' },
  'Mula': { lord: 'Ketu', deity: 'Nirriti', symbol: 'Bundle of roots', gana: 'Rakshasa', yoni: 'Dog', nadi: 'Aadi', trait: 'Investigator, root-seeker, intense' },
  'Purva Ashadha': { lord: 'Shukra', deity: 'Apah', symbol: 'Fan/Tusk', gana: 'Manushya', yoni: 'Monkey', nadi: 'Madhya', trait: 'Invincible, persuasive, fearless' },
  'Uttara Ashadha': { lord: 'Surya', deity: 'Vishvedevas', symbol: 'Elephant tusk', gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya', trait: 'Universal leader, righteous, victorious' },
  'Shravana': { lord: 'Chandra', deity: 'Vishnu', symbol: 'Ear', gana: 'Deva', yoni: 'Monkey', nadi: 'Antya', trait: 'Listener, learned, fame-oriented' },
  'Dhanishta': { lord: 'Mangal', deity: 'Vasus', symbol: 'Drum/Flute', gana: 'Rakshasa', yoni: 'Lion', nadi: 'Madhya', trait: 'Musical, wealthy, rhythmic' },
  'Shatabhisha': { lord: 'Rahu', deity: 'Varuna', symbol: 'Empty circle', gana: 'Rakshasa', yoni: 'Horse', nadi: 'Aadi', trait: 'Healer, mystic, hundred-physicians' },
  'Purva Bhadrapada': { lord: 'Guru', deity: 'Aja Ekapada', symbol: 'Two-faced man', gana: 'Manushya', yoni: 'Lion', nadi: 'Aadi', trait: 'Transformative, fiery, dualistic' },
  'Uttara Bhadrapada': { lord: 'Shani', deity: 'Ahirbudhnya', symbol: 'Serpent in deep', gana: 'Manushya', yoni: 'Cow', nadi: 'Madhya', trait: 'Deep wisdom, mystical, kundalini' },
  'Revati': { lord: 'Budh', deity: 'Pushan', symbol: 'Fish', gana: 'Deva', yoni: 'Elephant', nadi: 'Antya', trait: 'Wealthy, kind, protector' },
};

// ─── Google Maps via /api/maps-proxy ──────────
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
    const fields = 'location,displayName';
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}`;
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const lat = data.location?.latitude ?? null;
    const lng = data.location?.longitude ?? null;
    const city = data.displayName?.text ?? '';
    if (lat === null || lng === null) return null;
    return { lat, lng, city };
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
    const totalOffset = (data.rawOffset + data.dstOffset) / 3600;
    return Math.round(totalOffset * 4) / 4;
  } catch { return 5.5; }
}

function CityInput({
  id, label, required, value, onSelect, error, placeholder,
}: {
  id: string; label?: string; required?: boolean; value: string;
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void;
  error?: string; placeholder?: string;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  const handleChange = (val: string) => {
    setQuery(val);
    setSelected(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await fetchPlaceSuggestions(val);
      setSuggestions(results);
      setLoading(false);
    }, 400);
  };

  const handleSelect = async (s: PlaceSuggestion) => {
    setQuery(s.main_text);
    setSuggestions([]);
    setSelected(true);
    setLoading(true);
    const details = await fetchPlaceDetails(s.place_id);
    if (details) {
      const tz = await fetchTimezone(details.lat, details.lng);
      onSelect(details.city || s.main_text, details.lat, details.lng, tz);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
          {label} {required && <span className="text-yellow-400">*</span>}
        </label>
      )}
      <div className="relative">
        <input id={id} type="search" autoComplete="off"
          placeholder={placeholder ?? 'Type city name...'}
          value={query}
          onChange={e => handleChange(e.target.value)}
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
            <li key={i} onClick={() => handleSelect(s)}
              className="px-4 py-3 text-sm cursor-pointer"
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

const FAQS_DISPLAY = [
  { q: 'Nakshatra kya hota hai?', a: 'Nakshatra Vedic Jyotish ka sabse important unit hai. Aakash ko 27 equal divisions mein baata gaya hai. Aapka Janma Nakshatra wahi hai jismein aapke janm samay Chandra (Moon) sthit tha.' },
  { q: 'Janma Nakshatra kaise pata karein?', a: 'Date of Birth, exact Time of Birth, aur Place of Birth chahiye. Trikal Vaani Calculator mein details daalo aur 5 second mein result milega — bilkul free.' },
  { q: 'Pada kya hota hai?', a: 'Har Nakshatra ko 4 equal parts mein divide kiya gaya hai — inhe Pada kehte hain. 27 nakshatras × 4 padas = 108 micro-divisions.' },
  { q: 'Gana, Yoni, aur Nadi kya hai?', a: 'Gana 3 prakar ka (Deva, Manushya, Rakshasa) — swabhav. Yoni 14 prakar ki — primitive nature. Nadi 3 (Aadi, Madhya, Antya) — marriage compatibility ke liye.' },
  { q: 'Kya Nakshatra Calculator bilkul free hai?', a: 'Haan. 100% free. Nakshatra naam, Pada, lord, deity, symbol, gana, yoni, nadi, 3 Dos, 3 Donts, aur 3 remedies — sab free.' },
  { q: 'Nakshatra ka kya prabhav padta hai?', a: 'Aapka swabhav, career, marriage compatibility, Vimshottari Mahadasha sequence, aur auspicious muhurta — sab Janma Nakshatra se decide hote hain.' },
];

export default function FreeNakshatraCalculatorPage() {
  const [form, setForm] = useState<FormData>({
    name: '', gender: '', date: '', time: '12:00', unknownTime: false,
    placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const set = useCallback((key: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
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
          latitude: form.latitude,
          longitude: form.longitude,
          timezone: form.timezone,
          name: form.name || null,
          gender: form.gender || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }
      const data: ApiResult = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Nakshatra extraction ────────────────────────────────────
  const nakshatra = result?.instant?.nakshatra
    || result?.kundali?.lagna?.nakshatra
    || result?.kundali?.grahas?.find((g: any) => g.planet === 'Moon')?.nakshatra
    || null;
  const pada = result?.instant?.pada
    || result?.kundali?.lagna?.pada
    || result?.kundali?.grahas?.find((g: any) => g.planet === 'Moon')?.pada
    || null;
  const nakDetails = nakshatra ? NAKSHATRA_DATA[nakshatra] || {} : {};
  const nakLord = result?.kundali?.nakshatra_details?.lord || result?.kundali?.lagna?.nakshatra_lord || nakDetails.lord || null;
  const nakDeity = result?.kundali?.nakshatra_details?.deity || nakDetails.deity || null;
  const nakSymbol = result?.kundali?.nakshatra_details?.symbol || nakDetails.symbol || null;
  const nakGana = result?.kundali?.nakshatra_details?.gana || nakDetails.gana || null;
  const nakYoni = result?.kundali?.nakshatra_details?.yoni || nakDetails.yoni || null;
  const nakNadi = result?.kundali?.nakshatra_details?.nadi || nakDetails.nadi || null;
  const nakTrait = result?.kundali?.nakshatra_details?.trait || nakDetails.trait || null;
  const chandraRashi = result?.instant?.chandra_rashi || result?.kundali?.grahas?.find((g: any) => g.planet === 'Moon')?.sign || null;

  const template = result?.template;
  const dos: string[] = template?.dos || template?.do_list || template?.do || [];
  const donts: string[] = template?.donts || template?.dont_list || template?.dont || template?.donot || [];
  const remedies = template?.remedies || template?.remedy || {};
  const mantra = remedies?.mantra || remedies?.mantras || template?.mantra;
  const ratna = remedies?.ratna || remedies?.gemstone || template?.ratna;
  const daan = remedies?.daan || remedies?.charity || template?.daan;

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

          <nav className="text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Free Nakshatra Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Nakshatra Calculator — Find Your Janma Nakshatra Online
          </h1>

          <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikal Vaani ka Free Nakshatra Calculator</strong> aapka Janma Nakshatra Swiss Ephemeris se calculate karta hai. Sirf date, time, aur place daalo — Nakshatra, Pada, ruling planet (lord), presiding deity, symbol, gana, yoni, nadi, personality traits, aur 3 free Parashar remedies (Mantra, Ratna, Daan) turant milte hain. 100% free, BPHS classical rules ke according.
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

          {/* FORM — BirthForm v9.2 style */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Janma Nakshatra (Free)</h2>

            <div className="grid gap-5">
              <div>
                <label htmlFor="tv-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-yellow-400">*</span></label>
                <input id="tv-name" type="text" placeholder="Enter your full name"
                  value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle(!!errors.name)} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth <span className="text-yellow-400">*</span></label>
                <input id="tv-dob" type="date" value={form.date}
                  onChange={e => set('date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle(!!errors.date)} />
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
                  onChange={e => set('time', e.target.value)}
                  disabled={form.unknownTime}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ ...inputStyle(!!errors.time), opacity: form.unknownTime ? 0.4 : 1 }} />
                {form.unknownTime && <p className="text-slate-500 text-xs mt-1">Solar chart will be used (12:00 noon)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gender <span className="text-slate-500 text-xs ml-1">(for personalized remedies)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'male', label: '♂ Male', color: '#60a5fa' },
                    { value: 'female', label: '♀ Female', color: '#f472b6' },
                    { value: 'other', label: '⊕ Other', color: '#94a3b8' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => set('gender', opt.value)}
                      className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center"
                      style={{ background: form.gender === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${form.gender === opt.value ? `${opt.color}60` : 'rgba(255,255,255,0.1)'}`, color: form.gender === opt.value ? opt.color : '#64748b' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Place of Birth <span className="text-yellow-400">*</span>
                </label>
                <CityInput
                  id="tv-place"
                  value={form.placeQuery}
                  placeholder="Type city of birth..."
                  error={errors.latitude}
                  onSelect={(city, lat, lng, tz) => {
                    setForm(prev => ({ ...prev, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz }));
                    setErrors(prev => ({ ...prev, latitude: undefined }));
                  }}
                />
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
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#22c55e' }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-4 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: loading ? GOLD_RGBA(0.3) : `linear-gradient(135deg,rgba(212,175,55,0.8) 0%,${GOLD} 100%)`, color: '#080B12', fontSize: '15px' }}>
                {loading ? '⟳ Finding Nakshatra...' : '⭐ Find My Nakshatra'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Shadbala · Bhrigu Nandi</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">{form.name ? `${form.name}'s ` : ''}Janma Nakshatra</div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: GOLD }}>⭐ {nakshatra || '—'}</div>
                {pada && <div className="text-base text-slate-300">Pada <span style={{ color: GOLD }} className="font-bold">{pada}</span> of 4</div>}
                {chandraRashi && <div className="text-sm text-slate-400 mt-2">Chandra Rashi: <span style={{ color: GOLD }}>{chandraRashi}</span></div>}
                {nakTrait && <div className="text-sm text-slate-300 mt-4 italic">"{nakTrait}"</div>}
              </div>

              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>Nakshatra Details (Parashar BPHS)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DetailCell icon="🪐" label="Ruling Planet (Lord)" value={nakLord} />
                  <DetailCell icon="🙏" label="Presiding Deity" value={nakDeity} />
                  <DetailCell icon="🔱" label="Symbol" value={nakSymbol} />
                  <DetailCell icon="✨" label="Gana (Nature)" value={nakGana} />
                  <DetailCell icon="🐾" label="Yoni (Animal)" value={nakYoni} />
                  <DetailCell icon="💨" label="Nadi (Dosha Check)" value={nakNadi} />
                </div>
                <p className="text-xs text-slate-500 mt-4 italic">27 nakshatras × 4 padas = 108 micro-divisions. Aapki Pada se aapka exact karma blueprint banta hai.</p>
              </div>

              {(dos.length > 0 || donts.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos (Parashar Niyam)</h4>
                    {dos.length > 0 ? (
                      <ul className="space-y-2 text-sm text-slate-300">
                        {dos.slice(0, 3).map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                      </ul>
                    ) : <p className="text-sm text-slate-500">Loading...</p>}
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#FCA5A5' }}>❌ 3 Donts (Parashar Vivarjan)</h4>
                    {donts.length > 0 ? (
                      <ul className="space-y-2 text-sm text-slate-300">
                        {donts.slice(0, 3).map((d, i) => <li key={i} className="flex gap-2"><span className="text-red-400">•</span><span>{d}</span></li>)}
                      </ul>
                    ) : <p className="text-sm text-slate-500">Loading...</p>}
                  </div>
                </div>
              )}

              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪔 Your 3 Free Remedies (Parashar)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={typeof mantra === 'string' ? mantra : JSON.stringify(mantra)} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={typeof ratna === 'string' ? ratna : JSON.stringify(ratna)} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={typeof daan === 'string' ? daan : JSON.stringify(daan)} />}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PILLAR CONTENT */}
          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Janma Nakshatra Kya Hota Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic Jyotish mein aakash ko 360 degree mein 27 equal divisions mein baata gaya hai — har division 13°20' ka hota hai. In 27 divisions ko Nakshatra kehte hain. Aapka <strong style={{ color: GOLD }}>Janma Nakshatra</strong> wahi hai jismein aapke janm samay Chandra (Moon) sthit tha.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>27 Nakshatras Ki List</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic astrology ke 27 Nakshatras — Ashwini, Bharani, Krittika, Rohini, Mrigashira, Ardra, Punarvasu, Pushya, Ashlesha, Magha, Purva Phalguni, Uttara Phalguni, Hasta, Chitra, Swati, Vishakha, Anuradha, Jyeshtha, Mula, Purva Ashadha, Uttara Ashadha, Shravana, Dhanishta, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, aur Revati.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Nakshatra Calculator</h2>
            <div className="space-y-3">
              {FAQS_DISPLAY.map((faq, i) => (
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
                { slug: 'free-rashi-calculator', name: 'Rashi Calculator' },
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
