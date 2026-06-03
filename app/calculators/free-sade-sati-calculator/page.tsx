'use client';

// ============================================================
// File: app/calculators/free-sade-sati-calculator/page.tsx
// Version: v1.1 — Free Sade Sati Calculator
// VM endpoint: /sade-sati (dedicated, 100% accurate)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.1 (2026-06-02) — Gold-standard JSON-LD ADDED (page had none):
//        buildCalcJsonLd() helper emits 8 @id-linked nodes (Organization
//        +real sameAs, WebSite, linkable Person /founder, WebPage
//        isPartOf #website, BreadcrumbList, WebApplication, HowTo,
//        FAQPage). Added `.tv-aeo-answer` class to above-fold answer for
//        speakable. Brand fix: visible/schema brand normalised to the
//        double-a spelling; legal single-a kept inside helper only. No
//        logic/UI/form/API change.
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

function formatDate(d: any): string {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { }
  return String(d);
}

const FAQS = [
  { q: 'Sade Sati kya hoti hai?', a: 'Sade Sati Shani (Saturn) ka 7.5 saal ka transit period hai. Jab Shani aapki Chandra Rashi se 12th, 1st, aur 2nd house mein transit karta hai — har house mein 2.5 saal — total 7.5 saal. Yeh aapke jeevan ka sabse important Saturn period hota hai per Parashar BPHS.' },
  { q: 'Sade Sati ke 3 phases kya hain?', a: '(1) Rising/Aaroh (12th from Moon, 2.5 saal) — losses, expenses, foreign travel. (2) Peak/Madhya (Moon sign, 2.5 saal) — most intense, health/relationships test. (3) Setting/Avaroh (2nd from Moon, 2.5 saal) — financial recovery, family matters.' },
  { q: 'Apni Sade Sati kaise check karein?', a: 'Date of Birth, exact Time of Birth, aur Place of Birth chahiye. Trikaal Vaani Calculator Swiss Ephemeris se Saturn ki current transit position calculate karta hai aur Chandra Rashi se compare karke status, phase, aur dates deta hai — bilkul free.' },
  { q: 'Sade Sati hamesha bura hota hai?', a: 'Nahi. Sade Sati transformation ka period hai, sirf bura nahi. Strong Saturn = career growth, discipline, spiritual gain. Weak Saturn = challenges. Yeh aapke chart mein Saturn ki position pe depend karta hai. Parashar ke according — Sade Sati karma ka time hai, lessons ka period.' },
  { q: 'Sade Sati mein kya karna chahiye?', a: '(1) Daily Hanuman Chalisa path. (2) Shani mantra "Om Sham Shanaicharaya Namah" 108 times. (3) Black sesame, mustard oil, iron daan on Saturday. (4) Old age home/poor ki seva. (5) Discipline maintain karein, shortcuts avoid. (6) Anger control. Trikaal Vaani 3 personalized remedies free deta hai.' },
  { q: 'Sade Sati kab aati hai jeevan mein?', a: 'Sade Sati har 30 saal mein ek baar aati hai (Saturn 30 saal mein zodiac complete karta hai). Average life mein 2-3 Sade Sati cycles hote hain — childhood, mid-life, old age. Trikaal Vaani Calculator aapke poore jeevan ke saare Sade Sati cycles past + future dikhata hai.' },
  { q: 'Kya Sade Sati Calculator bilkul free hai?', a: 'Haan. 100% free. Current Sade Sati status (Yes/No), active phase (Rising/Peak/Setting), exact start-end dates, days remaining, past + future cycles, aur 3 Parashar remedies (Mantra, Ratna, Daan) — sab free.' },
  { q: 'Sade Sati result kitne accurate hain?', a: 'Trikaal Vaani VM par dedicated /sade-sati endpoint hai jo Swiss Ephemeris (NASA-grade) se Saturn ki exact transit position calculate karta hai with Lahiri Ayanamsha. 99.9% astronomical accuracy. Same engine professional astrologers worldwide use karte hain.' },
];

export default function FreeSadeSatiCalculatorPage() {
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
      const res = await fetch('/api/calc/sade-sati', {
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

  // ─── Sade Sati extraction ───────────────────────────────────
  const ss = result?.sadeSati;
  const inSadeSati = ss?.currentlyInSadeSati || false;
  const moonRashi = ss?.moonRashi || null;
  const currentCycle = ss?.currentCycle || null;
  const allCycles: any[] = ss?.allCycles || [];
  const phaseInfo = ss?.phaseInfo || null;

  // Past and future cycles
  const today = new Date();
  const pastCycles = allCycles.filter((c: any) => new Date(c.end) < today);
  const futureCycles = allCycles.filter((c: any) => new Date(c.start) > today);

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

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-sade-sati-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: "Free Sade Sati Calculator — Check Saturn's 7.5 Year Period Online",
    description:
      "Check your current Sade Sati status, active phase (Rising/Peak/Setting), exact start-end dates, all life cycles and 3 free Parashar remedies. Free Vedic Saturn calculator by Trikaal Vaani.",
    breadcrumbName: 'Free Sade Sati Calculator',
    aboutEntities: ['Sade Sati', 'Saturn', 'Moon Sign', 'Saturn Transit'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Sade Sati', 'Saturn Transit'],
    howToName: 'How to check your Sade Sati period',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Analyse the Saturn transit', text: "The calculator finds Saturn's current transit relative to your Moon sign using Swiss Ephemeris with Lahiri Ayanamsha." },
      { name: 'Get your result', text: 'See your Sade Sati status, active phase, exact dates, days remaining, all life cycles and 3 free Parashar remedies.' },
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
            <span style={{ color: GOLD }}>Free Sade Sati Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Sade Sati Calculator — Check Saturn's 7.5 Year Period Online
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Sade Sati Calculator</strong> aapki current Sade Sati status Swiss Ephemeris se calculate karta hai. Date, time, place daalo — Yes/No verdict, active phase (Rising/Peak/Setting), exact start-end dates, days remaining, past + future cycles, aur 3 Parashar remedies turant milte hain. 100% free, BPHS classical rules ke according.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS · Lahiri Ayanamsha · Saturn Transit Logic</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Sade Sati Status (Free)</h2>
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
                {loading ? '⟳ Checking Sade Sati...' : '🪐 Check My Sade Sati'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Saturn Transit Logic</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* SADE SATI VERDICT */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                background: inSadeSati
                  ? `linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(2,8,23,0.6) 100%)`
                  : `linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                border: `1px solid ${inSadeSati ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'}`
              }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                  {form.name ? `${form.name}'s ` : ''}Sade Sati Status
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: inSadeSati ? '#FCA5A5' : '#86EFAC' }}>
                  {inSadeSati ? '⚠️ YES — In Sade Sati' : '✅ NO — Not in Sade Sati'}
                </div>
                {moonRashi && (
                  <div className="text-base text-slate-300">
                    Chandra Rashi: <span style={{ color: GOLD }} className="font-bold">{moonRashi}</span>
                  </div>
                )}
                {inSadeSati && phaseInfo && (
                  <div className="text-sm text-slate-300 mt-3 italic max-w-2xl mx-auto">"{phaseInfo.phaseDescription}"</div>
                )}
              </div>

              {/* CURRENT CYCLE DETAILS */}
              {inSadeSati && currentCycle && phaseInfo && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📍 Current Sade Sati Cycle</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <DetailCell icon="🎯" label="Active Phase" value={phaseInfo.phase} />
                    <DetailCell icon="⏳" label="Days Remaining" value={`${phaseInfo.daysRemaining.toLocaleString()} days`} />
                    <DetailCell icon="📅" label="Cycle Start" value={formatDate(currentCycle.start)} />
                    <DetailCell icon="📅" label="Cycle End" value={formatDate(currentCycle.end)} />
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>Progress: {phaseInfo.progress}%</span>
                      <span>Total: 7.5 saal cycle</span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full transition-all duration-1000" style={{
                        width: `${phaseInfo.progress}%`,
                        background: `linear-gradient(90deg, ${GOLD} 0%, #FFA500 50%, #FF4500 100%)`,
                      }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                      <span>Rising (0-33%)</span>
                      <span>Peak (33-66%)</span>
                      <span>Setting (66-100%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3 PHASES EXPLANATION */}
              {inSadeSati && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪐 3 Phases of Sade Sati (Parashar BPHS)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PhaseCard icon="🌅" title="Rising (Aaroh)" duration="2.5 saal" desc="Saturn in 12th from Moon. Losses, expenses, foreign travel, sleep issues, fear." active={phaseInfo?.phase.includes('Rising')} />
                    <PhaseCard icon="🔥" title="Peak (Madhya)" duration="2.5 saal" desc="Saturn in Moon sign. Most intense. Health, mental peace, relationships tested." active={phaseInfo?.phase.includes('Peak')} />
                    <PhaseCard icon="🌇" title="Setting (Avaroh)" duration="2.5 saal" desc="Saturn in 2nd from Moon. Financial recovery, family matters, lessons consolidate." active={phaseInfo?.phase.includes('Setting')} />
                  </div>
                </div>
              )}

              {/* ALL LIFE CYCLES */}
              {allCycles.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📜 All Your Life Sade Sati Cycles</h3>

                  {pastCycles.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Past Cycles ({pastCycles.length})</p>
                      <div className="space-y-2">
                        {pastCycles.map((c: any, i: number) => (
                          <CycleRow key={`p${i}`} cycle={c} status="past" />
                        ))}
                      </div>
                    </div>
                  )}

                  {currentCycle && (
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>Current Cycle</p>
                      <div className="mt-3">
                        <CycleRow cycle={currentCycle} status="current" />
                      </div>
                    </div>
                  )}

                  {futureCycles.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Future Cycles ({futureCycles.length})</p>
                      <div className="space-y-2">
                        {futureCycles.map((c: any, i: number) => (
                          <CycleRow key={`f${i}`} cycle={c} status="future" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Sade Sati Kya Hoti Hai? — Shani Ka 7.5 Saal Ka Period</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Sade Sati</strong> Vedic Jyotish ka sabse important Saturn period hai. Sanskrit mein "Sade Sati" = 7.5 (saade saat). Jab Shani (Saturn) aapki Chandra Rashi se <strong>12th, 1st (Moon sign), aur 2nd house</strong> mein transit karta hai — total 7.5 saal — usse Sade Sati kehte hain. Maharishi Parashar ne <em>BPHS</em> mein iska detailed varnan kiya hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Shani ke transit ke teen phases hote hain — har phase 2.5 saal ka. Sade Sati har 30 saal mein ek baar aati hai (kyunki Saturn 30 saal mein 12 zodiac complete karta hai). Average life mein 2-3 Sade Sati cycles aate hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>3 Phases of Sade Sati — Detailed Effects</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Phase 1 — Rising (Aaroh) — 2.5 saal:</strong> Saturn 12th house mein from Moon. Yeh phase ka effect — unexpected expenses, foreign travel, sleep issues, hospital visits, hidden enemies activate hote hain. Mind disturbed rehta hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Phase 2 — Peak (Madhya) — 2.5 saal:</strong> Saturn Moon sign mein. Most intense phase. Health major concern. Marriage strain. Job changes. Mental peace lost. But — spiritual breakthrough, discipline build hoti hai. Karma cleansing ka time.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Phase 3 — Setting (Avaroh) — 2.5 saal:</strong> Saturn 2nd house from Moon. Financial recovery start hoti hai. Family matters dominant. Speech issues. Career stability return karti hai. Sade Sati ke lessons consolidate hote hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Sade Sati Ke 7 Powerful Parashar Remedies</h2>
            <ol className="text-slate-300 leading-relaxed mb-4 space-y-2 list-decimal pl-5">
              <li><strong style={{ color: GOLD }}>Hanuman Chalisa</strong> daily — Hanuman ji Shani ke malik mane jaate hain.</li>
              <li><strong style={{ color: GOLD }}>Shani Mantra:</strong> "Om Sham Shanaicharaya Namah" 108 times daily, especially Saturday.</li>
              <li><strong style={{ color: GOLD }}>Shani Daan:</strong> Black sesame (til), mustard oil, iron, black cloth on Saturday to poor/needy.</li>
              <li><strong style={{ color: GOLD }}>Old age home / orphanage</strong> ki seva — Shani inhi karakas hai.</li>
              <li><strong style={{ color: GOLD }}>Neelam (Blue Sapphire)</strong> only after expert consultation — risky stone.</li>
              <li><strong style={{ color: GOLD }}>Shanivar vrat</strong> — fasting on Saturdays with restraint.</li>
              <li><strong style={{ color: GOLD }}>Discipline & honesty</strong> — Saturn rewards integrity, punishes shortcuts.</li>
            </ol>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk Sade Sati Calculator</h2>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Phase Detection (Rising/Peak/Setting)</td><td className="p-3" style={{ color: GOLD }}>✓ Auto-calculated</td><td className="p-3 text-slate-500">✗ Manual</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Days Remaining</td><td className="p-3" style={{ color: GOLD }}>✓ Exact</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">All Life Cycles</td><td className="p-3" style={{ color: GOLD }}>✓ Past + Future</td><td className="p-3 text-slate-500">✗ Current only</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Sade Sati Calculator</h2>
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
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
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

function PhaseCard({ icon, title, duration, desc, active }: { icon: string; title: string; duration: string; desc: string; active?: boolean }) {
  return (
    <div className="p-4 rounded-xl" style={{
      background: active ? `${GOLD_RGBA(0.15)}` : 'rgba(2,8,23,0.4)',
      border: `1px solid ${active ? GOLD : GOLD_RGBA(0.15)}`,
      transform: active ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 0.3s'
    }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1" style={{ color: GOLD }}>{title} {active && <span className="text-xs ml-1 px-2 py-0.5 rounded-full" style={{ background: GOLD, color: '#080B12' }}>ACTIVE</span>}</div>
      <div className="text-xs text-slate-400 mb-2">{duration}</div>
      <div className="text-xs text-slate-300 leading-relaxed">{desc}</div>
    </div>
  );
}

function CycleRow({ cycle, status }: { cycle: any; status: 'past' | 'current' | 'future' }) {
  const colors = {
    past: { bg: 'rgba(100,116,139,0.05)', border: 'rgba(100,116,139,0.2)', text: '#64748b' },
    current: { bg: 'rgba(212,175,55,0.1)', border: GOLD, text: GOLD },
    future: { bg: 'rgba(96,165,250,0.05)', border: 'rgba(96,165,250,0.2)', text: '#94a3b8' },
  };
  const c = colors[status];
  const start = new Date(cycle.start);
  const end = new Date(cycle.end);
  const years = ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="text-xs uppercase tracking-wide font-bold" style={{ color: c.text, minWidth: '60px' }}>{status}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold" style={{ color: c.text }}>{formatDate(cycle.start)} → {formatDate(cycle.end)}</div>
        <div className="text-xs text-slate-500 mt-0.5">{years} years</div>
      </div>
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
