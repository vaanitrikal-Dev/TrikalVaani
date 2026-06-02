'use client';

// ============================================================
// File: app/calculators/free-kaal-sarp-dosh-calculator/page.tsx
// Version: v1.1 — Free Kaal Sarp Dosh Calculator
// API: /api/calc/doshas (VM /doshas — exact longitude arc logic)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.1 (2026-06-02) — Gold-standard JSON-LD: swapped inline 4-node
//        @graph for buildCalcJsonLd() helper (8 @id-linked nodes:
//        Organization+real sameAs, WebSite, linkable Person /founder,
//        WebPage isPartOf #website [no longer dangling], BreadcrumbList,
//        WebApplication, HowTo, FAQPage). No logic/UI/form/API change.
//   v1.0 — initial build.
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';

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

// 12 Kaal Sarp types by Rahu's house
const KAAL_SARP_TYPES: Record<number, { name: string; hi: string; theme: string }> = {
  1: { name: 'Anant', hi: 'अनंत', theme: 'Self, personality, struggles in early life' },
  2: { name: 'Kulik', hi: 'कुलिक', theme: 'Wealth, family, speech' },
  3: { name: 'Vasuki', hi: 'वासुकि', theme: 'Courage, siblings, efforts' },
  4: { name: 'Shankhpal', hi: 'शंखपाल', theme: 'Home, mother, property, peace' },
  5: { name: 'Padma', hi: 'पद्म', theme: 'Children, education, intellect' },
  6: { name: 'Mahapadma', hi: 'महापद्म', theme: 'Enemies, health, debts (often improves with effort)' },
  7: { name: 'Takshak', hi: 'तक्षक', theme: 'Marriage, partnerships, business' },
  8: { name: 'Karkotak', hi: 'कर्कोटक', theme: 'Sudden events, longevity, transformation' },
  9: { name: 'Shankhachur', hi: 'शंखचूड़', theme: 'Fortune, father, dharma' },
  10: { name: 'Ghatak', hi: 'घातक', theme: 'Career, status, authority' },
  11: { name: 'Vishdhar', hi: 'विषधर', theme: 'Gains, income, network' },
  12: { name: 'Sheshnag', hi: 'शेषनाग', theme: 'Expenses, foreign, moksha, sleep' },
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

// match a dosha by keyword(s) in its name (works for hi/en)
function findDosha(doshas: any[], keywords: string[]): any | null {
  for (const d of doshas) {
    const nm = String(d?.name || '').toLowerCase();
    if (keywords.some((k) => nm.includes(k.toLowerCase()))) return d;
  }
  return null;
}

const OTHER_DOSHA_LINKS: { keywords: string[]; label: string; slug?: string }[] = [
  { keywords: ['पितृ', 'pitra'], label: 'Pitra Dosh', slug: 'free-pitra-dosh-calculator' },
  { keywords: ['मंगल', 'manglik', 'mangal'], label: 'Manglik Dosh', slug: 'free-manglik-dosh-calculator' },
  { keywords: ['चांडाल', 'chandal'], label: 'Guru Chandal Dosh' },
  { keywords: ['ग्रहण', 'grahan'], label: 'Grahan Dosh' },
];

const FAQS = [
  { q: 'Kaal Sarp Dosh kya hota hai?', a: 'Kaal Sarp Dosh tab banta hai jab kundali ke saaton mukhya grahas (Sun se Saturn) Rahu aur Ketu ke beech ek hi taraf aa jaate hain — yaani saare grahas Rahu-Ketu axis ke ek hi ardh-bhag mein. Trikaal Vaani exact graha longitudes (Swiss Ephemeris) se ise calculate karta hai, sirf andaaze se nahi.' },
  { q: 'Mujhe Kaal Sarp Dosh hai ya nahi, kaise pata karein?', a: 'Date of Birth, exact Time of Birth aur Place of Birth daalo. Calculator har graha ki exact position Rahu-Ketu axis ke against check karke Yes/No verdict deta hai, aur agar dosh hai to uska prakaar (12 types mein se) bhi batata hai.' },
  { q: 'Kaal Sarp Dosh ke 12 prakaar konse hain?', a: 'Rahu jis bhaav (house) mein hota hai, uske hisaab se 12 naam hain: Anant, Kulik, Vasuki, Shankhpal, Padma, Mahapadma, Takshak, Karkotak, Shankhachur, Ghatak, Vishdhar aur Sheshnag. Har prakaar alag life-area ko prabhavit karta hai.' },
  { q: 'Kya Kaal Sarp Dosh hamesha bura hota hai?', a: 'Nahi. Kaal Sarp Dosh sangharsh aur mehnat-bhara samay la sakta hai, par yeh "shraap" nahi hai. Bahut se safal log Kaal Sarp ke saath hain — yeh discipline aur late-but-strong success bhi deta hai. Naag puja aur upayon se iska negative asar kaafi shaant ho jaata hai.' },
  { q: 'Kaal Sarp Dosh ke upay kya hain?', a: '(1) Maha Mrityunjaya / Rahu mantra ka jaap. (2) Naag Panchami par Naag devta ki puja, chandi/tambe ke naag-naagin behte jal mein visarjan. (3) Shanivar ko Rahu daan (nariyal, neela/kala vastra, urad). (4) Shiv abhishek. Trikaal Vaani aapko 3 personalized free upay deta hai.' },
  { q: 'Partial Kaal Sarp Dosh kya hota hai?', a: 'Jab koi ek graha axis ke thoda bahar ho to kuch astrologer ise "partial/aanshik" Kaal Sarp kehte hain. Trikaal Vaani classical full-arc rule follow karta hai (saare 7 grahas ek taraf), taaki verdict accurate aur consistent rahe — galat dar paida na ho.' },
  { q: 'Kya ye Kaal Sarp Calculator bilkul free hai?', a: 'Haan, 100% free. Yes/No verdict, dosh ka prakaar (Rahu house se), Rahu-Ketu houses, 3 Naag-puja remedies, aur baaki doshas ka quick check — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) se har graha ki exact longitude nikaalta hai aur Rahu-Ketu axis ke against check karta hai with Lahiri Ayanamsha — 99.9% astronomical accuracy. Yahi reason hai ki result reliable hote hain.' },
];

export default function FreeKaalSarpDoshCalculatorPage() {
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
      const res = await fetch('/api/calc/doshas', {
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

  // ─── Result extraction ──────────────────────────────────────
  const doshas: any[] = result?.doshas ?? [];
  const kaalSarp = findDosha(doshas, ['सर्प', 'sarp', 'kaal']);
  const present: boolean = kaalSarp?.present === true;
  const detail: string | null = kaalSarp?.detail ?? null;
  const rahuHouse: number | null = result?.rahu_house ?? null;
  const ketuHouse: number | null = result?.ketu_house ?? null;
  const sarpType = present && rahuHouse ? KAAL_SARP_TYPES[rahuHouse] : null;

  // other present doshas (exclude kaal sarp)
  const otherPresent = doshas.filter((d: any) => d?.present && !(['सर्प', 'sarp', 'kaal'].some(k => String(d?.name || '').toLowerCase().includes(k))));

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-kaal-sarp-dosh-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Kaal Sarp Dosh Calculator — Check & Remedies',
    description:
      'Check if you have Kaal Sarp Dosh using exact planetary longitudes, find its type (Anant to Sheshnag) by Rahu house, and get free Naag-puja remedies. Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Kaal Sarp Dosh Calculator',
    aboutEntities: ['Kaal Sarp Dosh', 'Rahu', 'Ketu', 'Rahu-Ketu Axis'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Kaal Sarp Dosh', 'Dosha Remedies'],
    howToName: 'How to check Kaal Sarp Dosh in your kundali',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Check the Rahu-Ketu axis', text: "The calculator checks every planet's exact longitude against the Rahu-Ketu axis using Swiss Ephemeris with Lahiri Ayanamsha." },
      { name: 'Get your result', text: 'See a Yes/No Kaal Sarp verdict, its type (Anant to Sheshnag) by Rahu house, and free Naag-puja remedies.' },
    ],
    faqs: FAQS,
  });

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Free Kaal Sarp Dosh Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Kaal Sarp Dosh Calculator — Check &amp; Remedies
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Kaal Sarp Dosh</strong> tab banta hai jab saaton mukhya grahas Rahu-Ketu axis ke ek hi taraf aa jaayein. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Kaal Sarp Calculator</strong> har graha ki exact longitude (Swiss Ephemeris) se Yes/No verdict, dosh ka prakaar (Anant se Sheshnag), aur Naag-puja remedies turant deta hai — bilkul free, andaaze se nahi.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Exact Rahu-Ketu Axis · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Kaal Sarp Dosh (Free)</h2>
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
                {form.unknownTime
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Dosh type Rahu ke house se nikalta hai — house ke liye exact time best hai.</p>
                  : <p className="text-slate-500 text-xs mt-1">Exact time se dosh ka prakaar (house) accurate aata hai.</p>}
                {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
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
                {loading ? '⟳ Checking Kaal Sarp...' : '🐍 Check My Kaal Sarp Dosh'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Exact Rahu-Ketu Axis</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* VERDICT */}
              {kaalSarp ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                  background: present
                    ? `linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(2,8,23,0.6) 100%)`
                    : `linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                  border: `1px solid ${present ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'}`,
                }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    {form.name ? `${form.name}'s ` : ''}Kaal Sarp Dosh Status
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: present ? '#FCA5A5' : '#86EFAC' }}>
                    {present ? '🐍 YES — Present' : '✅ NO — Not Present'}
                  </div>
                  {present && sarpType && (
                    <div className="text-base text-slate-300">
                      Type: <span style={{ color: GOLD }} className="font-bold">{sarpType.name} Kaal Sarp ({sarpType.hi})</span>
                    </div>
                  )}
                  {(rahuHouse || ketuHouse) && (
                    <div className="text-xs text-slate-500 mt-2">
                      Rahu: House {rahuHouse ?? '—'} · Ketu: House {ketuHouse ?? '—'}
                    </div>
                  )}
                  {detail && <div className="text-sm text-slate-300 mt-3 italic max-w-2xl mx-auto">{detail}</div>}
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Result calculate nahi ho paya. Kripya birth details dobara check karein.</p>
                </div>
              )}

              {/* TYPE DETAIL */}
              {present && sarpType && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-3" style={{ color: GOLD }}>🐍 {sarpType.name} Kaal Sarp ({sarpType.hi})</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Aapka Rahu <strong style={{ color: GOLD }}>House {rahuHouse}</strong> mein hai, isliye yeh <strong>{sarpType.name}</strong> prakaar ka Kaal Sarp hai. Iska mukhya prabhav-kshetra: <strong style={{ color: GOLD }}>{sarpType.theme}</strong>. Yaad rakhein — yeh shraap nahi, ek karmic pattern hai jo upayon aur discipline se shaant hota hai.
                  </p>
                </div>
              )}

              {/* REMEDIES (Kaal Sarp specific) */}
              {present && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪔 3 Free Remedies — Kaal Sarp Shanti</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Remedy icon="🔱" title="Mantra" content="Maha Mrityunjaya Mantra aur 'ॐ राहवे नमः' ka jaap — somvar/shanivar ko 108 baar. Shiv ji ki upasana sabse prabhavi." />
                    <Remedy icon="🐍" title="Naag Puja" content="Naag Panchami par Naag devta ki puja. Chandi ya tambe ke naag-naagin jode ka behte jal (nadi) mein visarjan." />
                    <Remedy icon="🙏" title="Daan" content="Shanivar ko Rahu daan — nariyal, neela/kala vastra, urad dal. Shiv mandir mein jal-abhishek aur seva." />
                  </div>
                </div>
              )}

              {/* WHEN NOT PRESENT — reassurance + CTA */}
              {kaalSarp && !present && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h3 className="text-lg font-serif font-bold mb-2" style={{ color: '#86EFAC' }}>✅ Aapki kundali mein Kaal Sarp Dosh nahi hai</h3>
                  <p className="text-sm text-slate-300">Aapke grahas Rahu-Ketu axis ke dono taraf bante hue hain. Phir bhi apni poori kundali ki strength jaanna ho to neeche diye calculators try karein.</p>
                </div>
              )}

              {/* OTHER DOSHAS STRIP */}
              {otherPresent.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>⚠️ Aapki kundali ke anya doshas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherPresent.map((d: any, i: number) => {
                      const link = OTHER_DOSHA_LINKS.find((o) => o.keywords.some((k) => String(d?.name || '').toLowerCase().includes(k.toLowerCase())));
                      const inner = (
                        <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <div className="font-semibold text-sm" style={{ color: '#FCA5A5' }}>{d?.name} — present</div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2">{d?.detail}</div>
                          {link?.slug && <div className="text-xs mt-1" style={{ color: GOLD }}>Detail dekhein →</div>}
                        </div>
                      );
                      return link?.slug
                        ? <Link key={i} href={`/calculators/${link.slug}`}>{inner}</Link>
                        : <div key={i}>{inner}</div>;
                    })}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Poori kundali ka deep analysis aur personalized remedies chahiye?</p>
                <Link href="/calculators/free-kundali-calculator"
                  className="inline-block px-6 py-3 rounded-xl font-bold text-sm"
                  style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.85) 0%,${GOLD} 100%)`, color: '#080B12' }}>
                  Free Kundali Banayein →
                </Link>
              </div>

            </div>
          )}

          {/* PILLAR CONTENT */}
          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Kaal Sarp Dosh Kya Hota Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Kaal Sarp Dosh</strong> ek vishesh graha-yog hai jo tab banta hai jab kundali ke <strong>saaton mukhya grahas</strong> (Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani) <strong>Rahu aur Ketu ke beech</strong> ek hi taraf aa jaate hain. Rahu-Ketu ko sarp (naag) ka sir aur poonchh mana jaata hai — jab saare grahas inke "mooh" mein aa jaayein, to use Kaal Sarp kehte hain.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Trikaal Vaani isse <strong>exact graha longitudes</strong> se calculate karta hai (sirf rashi/house se nahi), isliye verdict bharosemand hota hai — jab koi graha Rahu/Ketu ki same rashi mein ho tab bhi sahi result aata hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>12 Prakaar — Rahu Ke House Se</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Rahu House</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Type</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Prabhav-kshetra</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {Object.entries(KAAL_SARP_TYPES).map(([h, t]) => (
                    <tr key={h} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td className="p-3">House {h}</td>
                      <td className="p-3 font-semibold" style={{ color: GOLD }}>{t.name} ({t.hi})</td>
                      <td className="p-3">{t.theme}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Kaal Sarp Ke Upay (Remedies)</h2>
            <ol className="text-slate-300 leading-relaxed mb-4 space-y-2 list-decimal pl-5">
              <li><strong style={{ color: GOLD }}>Maha Mrityunjaya Mantra</strong> aur <strong>"ॐ राहवे नमः"</strong> ka niyamit jaap.</li>
              <li><strong style={{ color: GOLD }}>Naag Panchami puja</strong> — chandi/tambe ke naag-naagin jode ka behte jal mein visarjan.</li>
              <li><strong style={{ color: GOLD }}>Shiv abhishek</strong> — somvar ko jal/doodh se Shivling abhishek.</li>
              <li><strong style={{ color: GOLD }}>Rahu daan</strong> — shanivar ko nariyal, neela/kala vastra, urad dal.</li>
              <li><strong style={{ color: GOLD }}>Discipline & seva</strong> — Kaal Sarp mehnat se shubh phal deta hai; shortcuts se bachein.</li>
            </ol>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk</h2>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Detection Method</td><td className="p-3">Exact longitude arc (Rahu-Ketu)</td><td className="p-3 text-slate-500">Sign/house only</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Type (Anant–Sheshnag)</td><td className="p-3" style={{ color: GOLD }}>✓ Auto from Rahu house</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Other Doshas Check</td><td className="p-3" style={{ color: GOLD }}>✓ Included</td><td className="p-3 text-slate-500">✗ Separate/paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Kaal Sarp Dosh</h2>
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
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Calculator' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-kundali-strength-calculator', name: 'Kundali Strength' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
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

function Remedy({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1.5" style={{ color: GOLD }}>{title}</div>
      <div className="text-sm text-slate-300 leading-relaxed">{content}</div>
    </div>
  );
}
