'use client';

// ============================================================
// File: app/calculators/free-lagna-calculator/page.tsx
// Version: v1.0 — Free Lagna (Ascendant) Calculator
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

// ─── 12 Lagna Reference (Parashar BPHS — Personality + Body) ──
const LAGNA_DATA: Record<string, any> = {
  'Mesha':      { en: 'Aries',       lord: 'Mars',    element: 'Fire',  body: 'Medium height, athletic build, sharp features, prominent forehead', personality: 'Bold, energetic, pioneering, impulsive, natural leader, quick-tempered', career: 'Military, sports, surgery, engineering, entrepreneurship' },
  'Vrishabha':  { en: 'Taurus',      lord: 'Venus',   element: 'Earth', body: 'Strong neck, full lips, broad shoulders, attractive features',     personality: 'Patient, steady, sensual, loyal, materialistic, stubborn when crossed', career: 'Finance, agriculture, art, music, real estate, food industry' },
  'Mithuna':    { en: 'Gemini',      lord: 'Mercury', element: 'Air',   body: 'Tall, slim, long arms, expressive hands, youthful appearance',     personality: 'Witty, curious, dual-natured, communicative, adaptable, restless', career: 'Writing, journalism, sales, teaching, IT, communication' },
  'Karka':      { en: 'Cancer',      lord: 'Moon',    element: 'Water', body: 'Round face, fair complexion, soft features, average height',       personality: 'Emotional, nurturing, intuitive, family-oriented, sensitive, moody', career: 'Hospitality, nursing, hotel industry, food business, real estate' },
  'Simha':      { en: 'Leo',         lord: 'Sun',     element: 'Fire',  body: 'Broad chest, regal posture, lion-like features, strong frame',      personality: 'Royal, generous, proud, charismatic, dramatic, attention-seeking', career: 'Politics, government, entertainment, leadership roles, jewelry' },
  'Kanya':      { en: 'Virgo',       lord: 'Mercury', element: 'Earth', body: 'Petite frame, refined features, youthful, neat appearance',         personality: 'Analytical, perfectionist, service-oriented, modest, critical, anxious', career: 'Healthcare, accounting, editing, research, analysis, hygiene products' },
  'Tula':       { en: 'Libra',       lord: 'Venus',   element: 'Air',   body: 'Symmetrical features, attractive face, well-proportioned, graceful', personality: 'Diplomatic, balanced, artistic, indecisive, peace-loving, romantic', career: 'Law, diplomacy, fashion, design, beauty, partnerships, art dealing' },
  'Vrishchika': { en: 'Scorpio',     lord: 'Mars',    element: 'Water', body: 'Penetrating eyes, broad shoulders, intense gaze, magnetic presence', personality: 'Intense, mysterious, passionate, transformative, secretive, vengeful', career: 'Research, investigation, medicine, psychology, occult, defense' },
  'Dhanu':      { en: 'Sagittarius', lord: 'Jupiter', element: 'Fire',  body: 'Tall, well-built, prominent thighs, athletic, oval face',           personality: 'Philosophical, optimistic, freedom-loving, adventurous, blunt, restless', career: 'Teaching, law, religion, publishing, travel, higher education' },
  'Makara':     { en: 'Capricorn',   lord: 'Saturn',  element: 'Earth', body: 'Tall, thin, prominent bones, serious expression, ages well',         personality: 'Disciplined, ambitious, patient, status-conscious, pessimistic, hardworking', career: 'Business, government, administration, mining, real estate, leadership' },
  'Kumbha':     { en: 'Aquarius',    lord: 'Saturn',  element: 'Air',   body: 'Tall, lean, unique features, intellectual appearance, gentle eyes',  personality: 'Innovative, humanitarian, eccentric, intellectual, detached, rebellious', career: 'Technology, science, social work, astrology, research, innovation' },
  'Meena':      { en: 'Pisces',      lord: 'Jupiter', element: 'Water', body: 'Large eyes, soft features, dreamy expression, medium height',         personality: 'Compassionate, intuitive, spiritual, dreamy, empathetic, escapist', career: 'Spirituality, healing, art, music, charity, ocean-related, dance' },
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
  { q: 'Lagna kya hota hai?', a: 'Lagna (Ascendant ya Rising Sign) Vedic Jyotish ka sabse important point hai. Janm samay purvi kshitij (eastern horizon) par jo Rashi udit ho rahi thi, woh aapka Lagna hai. Yeh aapka physical body, personality, outer self, aur jeevan ki overall direction decide karta hai.' },
  { q: 'Lagna kaise calculate hota hai?', a: 'Lagna calculate karne ke liye exact birth time (ghante aur minute), date of birth, aur birth place chahiye. Har 2 ghante mein Lagna badalta hai — isliye birth time accurate hona zaroori hai. Trikaal Vaani Swiss Ephemeris se exact Lagna nikalta hai using Lahiri Ayanamsha.' },
  { q: 'Lagna aur Rashi mein kya antar hai?', a: 'Lagna = Ascendant — janm samay east horizon par udit Rashi. Outer body aur personality dikhata hai. Rashi (Chandra Rashi) = Moon Sign — Chandra ki position. Mann aur emotions dikhata hai. Dono alag hote hain — predictions ke liye dono important hain.' },
  { q: 'Birth time exact nahi pata, kya phir bhi Lagna nikal sakta hai?', a: 'Lagna har 2 ghante mein badalta hai — exact birth time bahut zaroori hai. 15-30 minute ki bhi galti se Lagna change ho sakta hai. Approximate time se Lagna deviation possible hai. Best — birth certificate ya parents se confirm karein. Agar bilkul nahi pata, toh "Unknown time" option use karein (12:00 noon solar chart).' },
  { q: 'Lagna se kya predict hota hai?', a: 'Lagna se predict hota hai — (1) Physical body, face, body type, complexion, (2) Personality aur outer behavior, (3) Health aur longevity, (4) Career direction aur life path, (5) Marriage timing aur partner type, (6) Spiritual inclination. Lagna lord ki strength bahut decisive hoti hai.' },
  { q: 'Lagna kitne types ke hote hain?', a: '12 Lagnas hain — Mesha (Aries), Vrishabha (Taurus), Mithuna (Gemini), Karka (Cancer), Simha (Leo), Kanya (Virgo), Tula (Libra), Vrishchika (Scorpio), Dhanu (Sagittarius), Makara (Capricorn), Kumbha (Aquarius), aur Meena (Pisces). Har Lagna ka apna lord planet, body type, personality, aur favorable careers hote hain.' },
  { q: 'Kya Lagna Calculator bilkul free hai?', a: 'Haan. 100% free. Lagna naam, Lagna lord, element, body type, personality traits, favorable careers, aur 3 Parashar remedies (Mantra, Ratna, Daan) — sab free. Koi signup ya payment nahi.' },
  { q: 'Lagna calculator ke result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) use karta hai with Lahiri Ayanamsha (Government of India standard). House system = Placidus. Birth time se direct calculation. 99.9% astronomical accuracy provided birth time accurate ho.' },
];

export default function FreeLagnaCalculatorPage() {
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

  // ─── LAGNA extraction ─── Ascendant = lagna.sign ────────────
  const lagnaSign = result?.kundali?.lagna?.sign ?? null;
  const lagnaSignEn = result?.kundali?.lagna?.sign_en ?? null;
  const lagnaLord = result?.kundali?.lagna?.sign_lord ?? null;
  const lagnaDegree = result?.kundali?.lagna?.degree_in_sign ?? null;
  const lagnaNakshatra = result?.kundali?.lagna?.nakshatra ?? null;
  const lagnaPada = result?.kundali?.lagna?.pada ?? null;

  const lagnaDetails = lagnaSign ? LAGNA_DATA[lagnaSign] || {} : {};

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
            <span style={{ color: GOLD }}>Free Lagna Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Lagna Calculator — Find Your Ascendant (Rising Sign) Online
          </h1>

          <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Lagna Calculator</strong> aapka Ascendant (Lagna Rashi) Swiss Ephemeris se calculate karta hai — janm samay east horizon par udit Rashi se. Date, exact birth time, aur place daalo — Lagna, lord planet, element, body type, personality traits, favorable careers, aur 3 free Parashar remedies (Mantra, Ratna, Daan) turant milte hain. 100% free, BPHS classical rules.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS · Lahiri Ayanamsha · Shadbala · Bhrigu Nandi</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Lagna / Ascendant (Free)</h2>
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
                <p className="text-xs mt-1" style={{ color: form.unknownTime ? '#fbbf24' : '#64748b' }}>
                  {form.unknownTime ? '⚠️ Lagna changes every 2 hours. Without exact time, Lagna will be approximate (noon solar chart).' : '⏰ Exact birth time is CRITICAL for accurate Lagna. Even 15 min difference can change result.'}
                </p>
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
                {loading ? '⟳ Finding Lagna...' : '⬆️ Find My Lagna'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Shadbala · Bhrigu Nandi</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* LAGNA HERO */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                  {form.name ? `${form.name}'s ` : ''}Lagna (Ascendant)
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: GOLD }}>
                  ⬆️ {lagnaSign || '—'}
                </div>
                {lagnaSignEn && (
                  <div className="text-base text-slate-300">
                    ({lagnaSignEn}) <span style={{ color: GOLD }} className="mx-2">·</span> Lagna Lord: <span style={{ color: GOLD }} className="font-bold">{lagnaLord}</span>
                  </div>
                )}
                {lagnaDegree !== null && (
                  <div className="text-sm text-slate-400 mt-2">
                    Lagna Degree: <span style={{ color: GOLD }}>{lagnaDegree.toFixed(2)}°</span> in {lagnaSign}
                  </div>
                )}
                {lagnaNakshatra && (
                  <div className="text-sm text-slate-400 mt-1">
                    Lagna Nakshatra: <span style={{ color: GOLD }}>{lagnaNakshatra}</span> {lagnaPada && `(Pada ${lagnaPada})`}
                  </div>
                )}
                {lagnaDetails.personality && (
                  <div className="text-sm text-slate-300 mt-4 italic max-w-2xl mx-auto">"{lagnaDetails.personality}"</div>
                )}
              </div>

              {/* BODY + PERSONALITY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>🧍 Body Type (Sharir Lakshana)</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{lagnaDetails.body || '—'}</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>💼 Favorable Careers</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{lagnaDetails.career || '—'}</p>
                </div>
              </div>

              {/* LAGNA DETAILS */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>Lagna Details (Parashar BPHS)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DetailCell icon="🪐" label="Lagna Lord (Ruler)" value={lagnaLord} />
                  <DetailCell icon="🔥" label="Element (Tatva)" value={lagnaDetails.element} />
                  <DetailCell icon="📐" label="Lagna Degree" value={lagnaDegree !== null ? `${lagnaDegree.toFixed(2)}°` : null} />
                  <DetailCell icon="⭐" label="Lagna Nakshatra" value={lagnaNakshatra} />
                  <DetailCell icon="🎯" label="Pada" value={lagnaPada ? `${lagnaPada} of 4` : null} />
                  <DetailCell icon="🌍" label="English Name" value={lagnaSignEn} />
                </div>
                <p className="text-xs text-slate-500 mt-4 italic">
                  Lagna changes every ~2 hours. Lagna lord's house position determines major life themes per Parashar BPHS.
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Lagna Kya Hota Hai? — Janm Kundali Ka Sabse Important Point</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic Jyotish mein <strong style={{ color: GOLD }}>Lagna (Ascendant)</strong> janm kundali ka sabse pehla aur sabse important point hai. Jab aapka janm hua, us exact moment par purvi kshitij (eastern horizon) par jo Rashi udit ho rahi thi — woh aapka Lagna hai. Maharishi Parashar ne <em>BPHS</em> mein bataya hai ki Lagna se hi 12 bhavas (houses) ki ginti shuru hoti hai aur poori kundali Lagna par based hoti hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Lagna har 2 ghante mein badalta hai — isliye twins (jamne wale) ke kundali mein sirf Lagna ke kuch minutes ka antar bhi life completely different bana deta hai. Yahi reason hai ki <strong style={{ color: GOLD }}>exact birth time</strong> Lagna calculation ke liye non-negotiable hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>12 Lagnas aur Unke Body Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 not-prose">
              {Object.entries(LAGNA_DATA).map(([lagna, data]: [string, any]) => (
                <div key={lagna} className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.5)', border: `1px solid ${GOLD}33` }}>
                  <div className="font-bold" style={{ color: GOLD }}>{lagna} <span className="text-slate-400 font-normal text-xs">({data.en})</span></div>
                  <div className="text-xs text-slate-400 mt-1">Lord: {data.lord} · {data.element}</div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Lagna vs Chandra Rashi vs Surya Rashi</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Lagna (Ascendant):</strong> Janm samay east horizon par udit Rashi. Physical body, outer personality, life direction. Har 2 hour badalta hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Chandra Rashi (Moon Sign):</strong> Janm samay Chandra ki Rashi. Mann, emotions, mother. 2-2.5 din mein badalta hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Surya Rashi (Sun Sign):</strong> Janm samay Surya ki Rashi. Identity, ego, father. ~30 din mein badalta hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Tinno alag aspects dikhate hain — par <strong>Vedic predictions ka primary basis Lagna + Chandra Rashi</strong> hai. Western astrology mein Surya Rashi primary hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Lagna Lord — Aapke Jeevan Ka Karak</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Lagna ka ruler planet (lord) aapke jeevan ka master karak hai. Yeh jis bhava mein baitha hai, woh area aapke life mein dominant hota hai. Strong Lagna lord = strong personality, good health, success. Weak Lagna lord = health issues, identity struggles, low energy. Parashar BPHS Chapter 7 mein Lagna lord ke effects detail mein diye gaye hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk Lagna Calculator</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Feature</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Trikaal Vaani</th>
                    <th className="p-3 text-left text-slate-400">Others</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lagna Degree + Nakshatra</td><td className="p-3" style={{ color: GOLD }}>✓ Precise</td><td className="p-3 text-slate-500">✗ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Body Type + Personality</td><td className="p-3" style={{ color: GOLD }}>✓ Detailed</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Favorable Careers</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Mantra+Ratna+Daan</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Lagna Calculator</h2>
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
                { slug: 'free-rashi-calculator', name: 'Rashi Calculator' },
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
