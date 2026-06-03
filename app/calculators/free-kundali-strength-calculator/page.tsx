'use client';

// ============================================================
// File: app/calculators/free-kundali-strength-calculator/page.tsx
// Version: v1.1 — Free Kundali Strength Score Calculator
// API: /api/calc/kundali (calcType: 'kundali-strength')  [route v1.6+]
// Logic: overall score from Shadbala ratios + grade + lagna/dasha strength
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

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

const PLANET_AREAS: Record<string, string> = {
  Sun: 'Career, Authority, Vitality',
  Moon: 'Mind, Mother, Emotions',
  Mars: 'Energy, Courage, Property',
  Mercury: 'Intellect, Business, Speech',
  Jupiter: 'Wealth, Wisdom, Children',
  Venus: 'Love, Marriage, Comfort',
  Saturn: 'Discipline, Career longevity',
};

const CORE_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

function gradeFor(score: number): { label: string; hi: string; color: string } {
  if (score >= 85) return { label: 'Excellent', hi: 'उत्कृष्ट', color: '#86EFAC' };
  if (score >= 70) return { label: 'Strong', hi: 'बलवान', color: '#86EFAC' };
  if (score >= 55) return { label: 'Average', hi: 'संतुलित', color: GOLD };
  return { label: 'Needs Strengthening', hi: 'मज़बूती की ज़रूरत', color: '#FCA5A5' };
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
  { q: 'Kundali strength score kya hota hai?', a: 'Kundali strength score aapki poori janma-kundali ki overall mazbooti ka ek number (0-100%) hai. Trikaal Vaani har graha ki Shadbala (uski actual strength ÷ minimum required) leke unka average nikaalta hai — yeh batata hai ki aapki kundali ke grahas apne results dene mein samuchcha roop se kitne samarth hain.' },
  { q: 'Mera kundali score kaise nikalta hai?', a: 'Date, time aur place of birth se aapki kundali banti hai. Phir saat mukhya grahas (Sun se Saturn) ki Shadbala ratio (minimum strength ka kitna %) ka average liya jaata hai. 100% = saare grahas apni minimum required strength tak pahunche hue.' },
  { q: 'Achha kundali score kya mana jaata hai?', a: 'Excellent (85+): grahas bahut balwan. Strong (70-84): majboot kundali. Average (55-69): santulit, kuch grahas support maangte hain. Needs Strengthening (55 se kam): kai grahas minimum se neeche — remedies zaroori. Score ka matlab "bura bhagya" nahi, balki kahan kaam karna hai yeh dikhata hai.' },
  { q: 'Score kam ho to kya karein?', a: 'Kam score ka matlab hai ki kuch grahas ko strengthen karna hai. Sabse weak grahas ke liye mantra, daan, vrat aur (expert salaah ke baad) gemstone karein. Calculator current Mahadasha lord ke liye 3 free remedies bhi deta hai, kyunki abhi uska time chal raha hai.' },
  { q: 'Lagna strength kya batati hai?', a: 'Lagna (ascendant) aapke poore vyaktitva aur sharir ka aadhar hai. Lagna lord (lagna ki rashi ka swami) ki strength batati hai ki aapki personality, health aur overall life-direction kitni mazboot hai. Strong lagna lord = self-confidence aur resilience.' },
  { q: 'Dasha strength kya hai?', a: 'Abhi jo Mahadasha (mukhya graha-period) chal raha hai, uske swami graha ki strength. Strong mahadasha lord = abhi ka samay zyada favourable; weak = is period mein remedies aur dhyaan chahiye. Yeh "ab" ka most important factor hai.' },
  { q: 'Kya ye Kundali Strength Calculator free hai?', a: 'Haan, 100% free. Overall score, grade, saare grahas ki strength ranking, strongest 3 + weakest 3 grahas, lagna strength, dasha strength, aur Mahadasha lord ke 3 remedies — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + complete Shadbala (Parashar BPHS) use karta hai with Lahiri Ayanamsha — 99.9% astronomical accuracy. Accurate time of birth se result sabse precise hota hai.' },
];

export default function FreeKundaliStrengthCalculatorPage() {
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
          calcType: 'kundali-strength',
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
  const planets: any[] = result?.planets ?? [];
  const strengthOf = (planet: string): number | null => {
    const p = planets.find((x: any) => x.planet === planet);
    return typeof p?.strength === 'number' ? p.strength : null;
  };
  const ratioOf = (planet: string): number | null => {
    const p = planets.find((x: any) => x.planet === planet);
    const r = p?.shadbala?.ratio;
    return typeof r === 'number' ? r : null;
  };
  const isStrongOf = (planet: string): boolean => {
    const p = planets.find((x: any) => x.planet === planet);
    return p?.shadbala?.isStrong === true;
  };

  // Overall score = avg( min(ratio,1) ) * 100 across core 7  (100% = all meet minimum)
  const coreRatios = CORE_PLANETS.map(ratioOf).filter((r): r is number => r !== null);
  const overallScore = coreRatios.length
    ? Math.round((coreRatios.reduce((s, r) => s + Math.min(r, 1), 0) / coreRatios.length) * 100)
    : null;
  const grade = overallScore !== null ? gradeFor(overallScore) : null;
  const strongCount = CORE_PLANETS.filter(isStrongOf).length;

  const rankedDesc = CORE_PLANETS
    .map((p) => ({ planet: p, strength: strengthOf(p) }))
    .filter((r) => r.strength !== null)
    .sort((a, b) => (b.strength as number) - (a.strength as number));
  const top3 = rankedDesc.slice(0, 3);
  const bottom3 = [...rankedDesc].reverse().slice(0, 3);

  const lagnaLord: string | null = result?.instant?.lagna_lord || null;
  const lagnaSign: string | null = result?.instant?.lagna || null;
  const lagnaStrength = lagnaLord ? strengthOf(lagnaLord) : null;
  const mahadasha: string | null = result?.dasha?.mahadasha || null;
  const dashaStrength = mahadasha ? strengthOf(mahadasha) : null;

  // ─── Remedies (Mahadasha lord via route) ────────────────────
  const template = result?.template;
  const remedyList: any[] = template?.remedyPlan?.remedies ?? [];
  const mantraObj = remedyList.find((r: any) => r.type === 'mantra');
  const gemObj = remedyList.find((r: any) => r.type === 'gemstone');
  const daanObj = remedyList.find((r: any) => r.type === 'daan');
  const mantra = mantraObj ? `${mantraObj.mantra} — ${mantraObj.count}, ${mantraObj.time}. ${mantraObj.special || ''}`.trim() : null;
  const ratna = gemObj ? `${gemObj.lagna_stone?.stone} (${gemObj.lagna_stone?.metal}, ${gemObj.lagna_stone?.finger}) — ${gemObj.lagna_stone?.for || ''}`.trim() : null;
  const daan = daanObj ? `${daanObj.items} — ${daanObj.day} ko ${daanObj.recipient} ko. ${daanObj.note || ''}`.trim() : null;

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-kundali-strength-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Kundali Strength Calculator — Overall Horoscope Score',
    description:
      'Get your overall Kundali strength score (0-100%) based on Shadbala, with planet-wise ranking, lagna & dasha strength and free remedies. Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Kundali Strength Calculator',
    aboutEntities: ['Kundali Strength', 'Shadbala', 'Lagna', 'Mahadasha'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Shadbala', 'Kundali Analysis'],
    howToName: 'How to check your overall Kundali strength score',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Calculate the score', text: 'The calculator averages the Shadbala ratio of all seven planets using Swiss Ephemeris with Lahiri Ayanamsha.' },
      { name: 'Get your result', text: 'See your overall strength score and grade, planet-wise ranking, lagna and dasha strength, and free remedies.' },
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
            <span style={{ color: GOLD }}>Free Kundali Strength Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Kundali Strength Calculator — Overall Horoscope Score
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              Aapka <strong style={{ color: GOLD }}>Kundali Strength Score</strong> poori janma-kundali ki overall mazbooti ka ek number (0-100%) hai, jo har graha ki <strong style={{ color: GOLD }}>Shadbala</strong> se nikalta hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Kundali Strength Calculator</strong> aapko overall score + grade, har graha ki strength, strongest aur weakest grahas, lagna strength, dasha strength aur free remedies turant deta hai.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Complete Shadbala (Parashar BPHS) · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Kundali Strength (Free)</h2>
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
                {form.unknownTime && <p className="text-slate-500 text-xs mt-1">Solar chart (12:00 noon). Lagna & Dasha strength ke liye exact time best hai.</p>}
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
                {loading ? '⟳ Calculating Score...' : '⭐ Check My Kundali Strength'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Complete Shadbala · Parashar BPHS</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* OVERALL SCORE */}
              {overallScore !== null && grade ? (
                <div className="rounded-2xl p-6 md:p-8 text-center" style={{
                  background: `linear-gradient(135deg, ${grade.color}1f 0%, rgba(2,8,23,0.6) 100%)`,
                  border: `1px solid ${grade.color}59`,
                }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    {form.name ? `${form.name}'s ` : ''}Overall Kundali Strength
                  </div>
                  <div className="text-6xl md:text-7xl font-serif font-bold mb-1" style={{ color: grade.color }}>{overallScore}<span className="text-3xl">%</span></div>
                  <div className="text-xl font-bold mb-3" style={{ color: grade.color }}>{grade.label} <span className="text-base text-slate-300">({grade.hi})</span></div>
                  {/* big bar */}
                  <div className="max-w-lg mx-auto">
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full transition-all duration-1000" style={{ width: `${Math.max(3, overallScore)}%`, background: `linear-gradient(90deg, #ef4444 0%, ${GOLD} 55%, #22c55e 100%)` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                      <span>Needs Work</span><span>Average</span><span>Strong</span><span>Excellent</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 mt-4">
                    7 mein se <span style={{ color: GOLD }} className="font-bold">{strongCount}</span> grahas apni minimum required strength tak pahunche hain.
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Score calculate nahi ho paya. Kripya birth details dobara check karein.</p>
                </div>
              )}

              {/* LAGNA + DASHA STRENGTH */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">🜂 Lagna Strength</div>
                  <div className="text-lg font-bold" style={{ color: GOLD }}>
                    {lagnaSign || '—'}{lagnaLord ? ` · Lord: ${lagnaLord} (${PLANET_HI[lagnaLord] || ''})` : ''}
                  </div>
                  {lagnaStrength !== null ? (
                    <>
                      <div className="text-sm text-slate-300 mt-1 mb-2">Strength: <span style={{ color: GOLD }} className="font-bold">{lagnaStrength}%</span></div>
                      <Bar value={lagnaStrength} />
                    </>
                  ) : <div className="text-sm text-slate-500 mt-1">Strength data unavailable</div>}
                  <p className="text-[11px] text-slate-500 mt-2">Personality, health aur life-direction ka aadhar.</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">⏳ Current Dasha Strength</div>
                  <div className="text-lg font-bold" style={{ color: GOLD }}>
                    {mahadasha ? `${mahadasha} (${PLANET_HI[mahadasha] || ''}) Mahadasha` : '—'}
                  </div>
                  {dashaStrength !== null ? (
                    <>
                      <div className="text-sm text-slate-300 mt-1 mb-2">Strength: <span style={{ color: GOLD }} className="font-bold">{dashaStrength}%</span></div>
                      <Bar value={dashaStrength} />
                    </>
                  ) : <div className="text-sm text-slate-500 mt-1">Strength data unavailable</div>}
                  <p className="text-[11px] text-slate-500 mt-2">Abhi chal rahe period ka mukhya graha.</p>
                </div>
              </div>

              {/* PLANET-WISE BREAKDOWN */}
              {rankedDesc.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📊 Planet-wise Strength</h3>
                  <div className="space-y-3">
                    {rankedDesc.map((r) => (
                      <div key={r.planet}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-200 font-medium">{r.planet} ({PLANET_HI[r.planet]}){isStrongOf(r.planet) ? ' ✓' : ''}</span>
                          <span className="text-slate-400">{r.strength}%</span>
                        </div>
                        <Bar value={r.strength as number} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STRONGEST 3 + WEAKEST 3 */}
              {top3.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>💪 Strongest 3 — Aapki Shakti</h4>
                    <div className="space-y-2">
                      {top3.map((r) => (
                        <div key={r.planet} className="text-sm">
                          <span className="font-semibold" style={{ color: '#86EFAC' }}>{r.planet} ({r.strength}%)</span>
                          <span className="text-slate-400"> — {PLANET_AREAS[r.planet]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#FCA5A5' }}>⚠️ Weakest 3 — Dhyaan Dein</h4>
                    <div className="space-y-2">
                      {bottom3.map((r) => (
                        <div key={r.planet} className="text-sm">
                          <span className="font-semibold" style={{ color: '#FCA5A5' }}>{r.planet} ({r.strength}%)</span>
                          <span className="text-slate-400"> — {PLANET_AREAS[r.planet]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>🪔 3 Free Remedies — Current Dasha Lord {mahadasha ? `(${mahadasha})` : ''}</h3>
                  <p className="text-xs text-slate-400 mb-5">Abhi chal rahe Mahadasha ke graha ke liye (Parashar)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={mantra} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={ratna} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={daan} />}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Har graha ke liye detailed analysis aur personalized remedies chahiye?</p>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Kundali Strength Score Kaise Nikalta Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Har graha ki ek <strong style={{ color: GOLD }}>Shadbala</strong> hoti hai aur ek <strong>minimum required strength</strong>. Trikaal Vaani har graha ka <em>ratio = actual ÷ minimum</em> nikaalta hai (1.0 = minimum poora). In ratios ka average (100% par cap) lekar overall <strong style={{ color: GOLD }}>Kundali Strength Score</strong> banta hai. 100% ka matlab — saare grahas apni minimum strength tak pahunch gaye.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Score Grades Ka Matlab</h2>
            <ul className="text-slate-300 leading-relaxed mb-4 space-y-2 list-disc pl-5">
              <li><strong style={{ color: '#86EFAC' }}>Excellent (85+):</strong> grahas bahut balwan, natural support strong.</li>
              <li><strong style={{ color: '#86EFAC' }}>Strong (70-84):</strong> majboot kundali, kam remedies chahiye.</li>
              <li><strong style={{ color: GOLD }}>Average (55-69):</strong> santulit, kuch grahas support maangte hain.</li>
              <li><strong style={{ color: '#FCA5A5' }}>Needs Strengthening (&lt;55):</strong> kai grahas minimum se neeche — remedies par focus.</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong>Yaad rakhein:</strong> kam score "bura bhagya" nahi hai. Yeh sirf dikhata hai ki kahan mehnat aur remedies chahiye. Discipline, upaay aur sahi timing se kamzor kundali bhi shaandaar results de sakti hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Lagna Aur Dasha Strength Kyun Important Hain</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Lagna strength</strong> aapke vyaktitva, health aur life-foundation ki mazbooti batati hai. <strong style={{ color: GOLD }}>Dasha strength</strong> — abhi chal rahe Mahadasha ke graha ki shakti — batati hai ki <em>is samay</em> aapke liye situation kitni favourable hai. Strong lagna + strong current dasha = best phase.
            </p>

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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Overall Score Method</td><td className="p-3">Shadbala ratio average</td><td className="p-3 text-slate-500">Ad-hoc / none</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lagna + Dasha Strength</td><td className="p-3" style={{ color: GOLD }}>✓ Both</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Strongest 3 + Weakest 3</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Dasha-based</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Kundali Strength Calculator</h2>
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
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Calculator' },
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
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

function Bar({ value }: { value: number }) {
  const barColor = value >= 40 ? '#22c55e' : value >= 25 ? GOLD : '#ef4444';
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div className="h-full transition-all duration-700" style={{ width: `${Math.max(3, Math.min(100, value))}%`, background: barColor }} />
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
