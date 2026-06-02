'use client';

// ============================================================
// File: app/calculators/free-lagna-bal-calculator/page.tsx
// Version: v1.1 — Free Lagna Bal Calculator
// API: /api/calc/kundali (calcType: 'lagna-bal')  [route v1.6+]
// Logic: lagna lord placement + strength (= personality strength)
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

// Natural benefic / malefic (simplified classical)
const NATURAL_BENEFIC = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const NATURAL_MALEFIC = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

const HOUSE_MEANING: Record<number, string> = {
  1: 'Self & personality', 2: 'Wealth & family', 3: 'Courage & siblings',
  4: 'Home & mother', 5: 'Children & intellect', 6: 'Enemies & health',
  7: 'Marriage & partners', 8: 'Transformation & longevity', 9: 'Fortune & dharma',
  10: 'Career & status', 11: 'Gains & network', 12: 'Loss & moksha',
};

const CORE_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

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
  { q: 'Lagna Bal kya hota hai?', a: 'Lagna (ascendant) aapki janma-kundali ka pehla bhaav hai — jo birth ke samay purab mein udit rashi se banta hai. Lagna Bal yaani lagna aur uske swami (lagna lord) ki shakti, jo aapke vyaktitva, sharir, aatm-vishwas aur jeevan ki disha ko represent karti hai. Strong lagna = mazboot foundation.' },
  { q: 'Mera lagna lord kaise pata chalega?', a: 'Lagna lord aapki lagna-rashi ka swami graha hai (jaise Mesh lagna ka Mars, Vrishabha ka Venus). Calculator aapki birth details se lagna nikaalta hai, uska swami batata hai, aur us graha ki strength aur house placement dikhata hai.' },
  { q: 'Strong lagna lord ke kya fayde hain?', a: 'Strong lagna lord = mazboot personality, achhi health & vitality, leadership, aatm-vishwas, aur jeevan mein clear direction. Aap challenges ka achha samna karte hain aur apni identity strong rehti hai.' },
  { q: 'Weak lagna lord ke effects?', a: 'Weak lagna lord se aatm-vishwas mein kami, health par dhyaan dena padta hai, identity/direction mein confusion, aur shuruaat mein zyada mehnat. Remedies (lagna lord ka mantra, daan, deity worship) se ise strengthen kiya jaata hai.' },
  { q: 'Lagna (1st house) mein planets ka kya asar?', a: 'Pehle bhaav mein baithe grahas seedhe aapke vyaktitva aur sharir ko prabhavit karte hain. Benefic grahas (Jupiter, Venus, Mercury, Moon) achha asar dete hain; malefic grahas (Sun, Mars, Saturn, Rahu, Ketu) intensity ya challenges la sakte hain — par house aur strength par depend karta hai.' },
  { q: 'Lagna ko strong kaise karein?', a: 'Lagna lord ka mantra jaap, uske vaar ko vrat-daan, deity ki upasana, aur (expert salaah ke baad) gemstone. Calculator aapke lagna lord ke liye 3 personalized free remedies deta hai.' },
  { q: 'Kya ye Lagna Bal Calculator free hai?', a: 'Haan, 100% free. Lagna sign, lagna lord + house placement + strength, 1st-house planets, strong/weak effects aur 3 Parashar remedies — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + Shadbala (Parashar BPHS) use karta hai with Lahiri Ayanamsha. Lagna time-sensitive hai — har ~2 ghante mein badalta hai — isliye exact time of birth bahut zaroori hai accurate result ke liye.' },
];

export default function FreeLagnaBalCalculatorPage() {
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
          calcType: 'lagna-bal',
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
  const lagnaSign: string | null = result?.instant?.lagna || null;
  const lagnaEn: string | null = result?.instant?.lagna_en || null;
  const lagnaLord: string | null = result?.instant?.lagna_lord || null;
  const janmaNakshatra: string | null = result?.instant?.nakshatra || null;
  const janmaPada: number | null = result?.instant?.pada ?? null;

  const lordObj = lagnaLord ? planets.find((p: any) => p.planet === lagnaLord) : null;
  const lordHouse: number | null = lordObj?.house ?? null;
  const lordStrength: number | null = typeof lordObj?.strength === 'number' ? lordObj.strength : null;
  const lordIsStrong: boolean = lordObj?.shadbala?.isStrong === true;
  const lordRatio: number | null = typeof lordObj?.shadbala?.ratio === 'number' ? lordObj.shadbala.ratio : null;

  const firstHousePlanets = planets.filter((p: any) => p.house === 1);

  const strengthLabel = (() => {
    if (lordStrength === null) return null;
    if (lordIsStrong || lordStrength >= 45) return { label: 'Strong', color: '#86EFAC' };
    if (lordStrength >= 30) return { label: 'Moderate', color: GOLD };
    return { label: 'Weak', color: '#FCA5A5' };
  })();

  const effectText = (() => {
    if (!lagnaLord || lordStrength === null) return '';
    if (lordIsStrong || lordStrength >= 45) {
      return `Aapka lagna lord ${lagnaLord} balwan hai — mazboot personality, achhi vitality, aatm-vishwas aur jeevan mein clear direction. Challenges ka aap achha samna karte hain.`;
    }
    if (lordStrength >= 30) {
      return `Aapka lagna lord ${lagnaLord} moderate strength rakhta hai — personality balanced hai, par kuch areas mein remedies se aur mazbooti aa sakti hai.`;
    }
    return `Aapka lagna lord ${lagnaLord} kamzor hai — aatm-vishwas aur health par dhyaan dena, aur lagna lord ki remedies karna faydemand rahega. Mehnat se ye improve hota hai.`;
  })();

  // ─── Remedies / Dos (lagna lord via route) ──────────────────
  const template = result?.template;
  const remedyList: any[] = template?.remedyPlan?.remedies ?? [];
  const mantraObj = remedyList.find((r: any) => r.type === 'mantra');
  const gemObj = remedyList.find((r: any) => r.type === 'gemstone');
  const daanObj = remedyList.find((r: any) => r.type === 'daan');
  const mantra = mantraObj ? `${mantraObj.mantra} — ${mantraObj.count}, ${mantraObj.time}. ${mantraObj.special || ''}`.trim() : null;
  const ratna = gemObj ? `${gemObj.lagna_stone?.stone} (${gemObj.lagna_stone?.metal}, ${gemObj.lagna_stone?.finger}) — ${gemObj.lagna_stone?.for || ''}`.trim() : null;
  const daan = daanObj ? `${daanObj.items} — ${daanObj.day} ko ${daanObj.recipient} ko. ${daanObj.note || ''}`.trim() : null;
  const actionWindows: any[] = template?.actionWindows ?? [];
  const dos: string[] = actionWindows.slice(0, 3).map((w: any) => `${w.window}: ${w.reason}`);

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-lagna-bal-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Lagna Bal Calculator — Ascendant & Lagna Lord Strength',
    description:
      'Find your lagna (ascendant), lagna lord, its house placement & strength, and the planets in your 1st house — with free remedies. Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Lagna Bal Calculator',
    aboutEntities: ['Ascendant', 'Lagna Lord', 'First House', 'Shadbala'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Lagna Analysis', 'Shadbala'],
    howToName: 'How to find your lagna lord placement and strength',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Calculate the lagna', text: 'The calculator finds your ascendant and lagna lord with Shadbala using Swiss Ephemeris with Lahiri Ayanamsha.' },
      { name: 'Get your result', text: "See your lagna, the lagna lord's house placement and strength, 1st-house planets and free remedies." },
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
            <span style={{ color: GOLD }}>Free Lagna Bal Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Lagna Bal Calculator — Ascendant &amp; Lagna Lord Strength
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Lagna Bal</strong> aapki lagna (ascendant) aur uske swami graha ki shakti hai, jo aapke vyaktitva, health aur jeevan ki disha ko represent karti hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Lagna Bal Calculator</strong> Swiss Ephemeris se aapki lagna, lagna lord, uska house & strength, aur pehle bhaav ke grahas turant batata hai — free remedies ke saath.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Shadbala (Parashar BPHS) · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Lagna Bal (Free)</h2>
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
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Lagna har ~2 ghante mein badalti hai — exact time ke bina lagna galat ho sakti hai. Time daalna best hai.</p>
                  : <p className="text-slate-500 text-xs mt-1">Lagna time-sensitive hai — exact time of birth zaroori.</p>}
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
                {loading ? '⟳ Calculating Lagna Bal...' : '🜂 Check My Lagna Bal'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Shadbala · Parashar BPHS</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* LAGNA VERDICT */}
              {lagnaSign ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                  background: `linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                  border: `1px solid ${GOLD_RGBA(0.35)}`,
                }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    {form.name ? `${form.name}'s ` : ''}Lagna (Ascendant)
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-2" style={{ color: GOLD }}>
                    {lagnaSign}{lagnaEn ? <span className="text-2xl text-slate-300"> ({lagnaEn})</span> : null}
                  </div>
                  {lagnaLord && (
                    <div className="text-base text-slate-300">
                      Lagna Lord: <span style={{ color: GOLD }} className="font-bold">{lagnaLord} ({PLANET_HI[lagnaLord]})</span>
                      {strengthLabel && <span style={{ color: strengthLabel.color }} className="font-semibold"> · {strengthLabel.label}</span>}
                    </div>
                  )}
                  {janmaNakshatra && (
                    <div className="text-xs text-slate-500 mt-2">Janma Nakshatra (Moon): {janmaNakshatra}{janmaPada ? ` · Pada ${janmaPada}` : ''}</div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Lagna calculate nahi ho payi. Exact time of birth ke saath dobara try karein.</p>
                </div>
              )}

              {/* LAGNA LORD DETAIL */}
              {lagnaLord && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🜂 Lagna Lord — {lagnaLord} ki Sthiti</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                    <DetailCell icon="🏠" label="House Placement" value={lordHouse ? `House ${lordHouse}` : '—'} />
                    <DetailCell icon="📜" label="House Meaning" value={lordHouse ? (HOUSE_MEANING[lordHouse] || '—') : '—'} />
                    <DetailCell icon="💪" label="Strength" value={lordStrength !== null ? `${lordStrength}%` : '—'} />
                  </div>
                  {lordStrength !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Lagna Lord Strength</span>
                        <span>{lordRatio !== null ? `Ratio ${lordRatio.toFixed(2)}×` : ''}</span>
                      </div>
                      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full transition-all duration-1000" style={{ width: `${Math.max(4, Math.min(100, lordStrength))}%`, background: `linear-gradient(90deg, #ef4444 0%, ${GOLD} 55%, #22c55e 100%)` }} />
                      </div>
                    </div>
                  )}
                  {effectText && <p className="text-sm text-slate-300 leading-relaxed italic">{effectText}</p>}
                </div>
              )}

              {/* 1ST HOUSE PLANETS */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-xl font-serif font-bold mb-4" style={{ color: GOLD }}>🪐 Planets in Lagna (1st House)</h3>
                {firstHousePlanets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {firstHousePlanets.map((p: any) => {
                      const benefic = NATURAL_BENEFIC.includes(p.planet);
                      const malefic = NATURAL_MALEFIC.includes(p.planet);
                      const c = benefic ? '#86EFAC' : malefic ? '#FCA5A5' : GOLD;
                      const tag = benefic ? 'Benefic 🌼' : malefic ? 'Malefic 🔥' : 'Neutral';
                      return (
                        <div key={p.planet} className="p-3 rounded-xl flex items-center justify-between"
                          style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${c}33` }}>
                          <div>
                            <div className="font-semibold" style={{ color: c }}>{p.planet} ({PLANET_HI[p.planet]})</div>
                            <div className="text-xs text-slate-400">{p.sign}{typeof p.strength === 'number' ? ` · ${p.strength}%` : ''}</div>
                          </div>
                          <span className="text-xs font-medium" style={{ color: c }}>{tag}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Pehle bhaav (lagna) mein koi graha nahi — aapka vyaktitva mukhya roop se lagna lord ({lagnaLord || '—'}) se shape hota hai.</p>
                )}
              </div>

              {/* DOS */}
              {dos.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos — Lagna Lord ({lagnaLord}) Ko Strong Karein</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dos.map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                  </ul>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>🪔 3 Free Remedies — Lagna Lord {lagnaLord ? `(${lagnaLord})` : ''}</h3>
                  <p className="text-xs text-slate-400 mb-5">Lagna ko balwan banane ke liye (Parashar)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={mantra} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={ratna} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={daan} />}
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Lagna Bal Kya Hota Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Lagna (ascendant)</strong> aapki kundali ka <strong>pehla bhaav</strong> hai — birth ke samay purab kshitij par jo rashi udit ho rahi thi. Yeh aapke <strong>vyaktitva, sharir, swabhav aur jeevan ki disha</strong> ka aadhar hai. <strong style={{ color: GOLD }}>Lagna Bal</strong> = lagna aur uske <em>lagna lord</em> (lagna-rashi ka swami) ki shakti. Strong lagna lord = mazboot foundation.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Lagna Lord Ka Role Aur House Placement</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Lagna lord jis bhaav mein baitha hai, us area ko aapke jeevan mein zyada importance milti hai. Jaise lagna lord 10th house mein = career-focused personality; 7th house mein = relationships-driven. Lagna lord ki <strong>strength (Shadbala)</strong> batati hai ki aapki core identity kitni mazboot hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Strong vs Weak Lagna Lord</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: '#86EFAC' }}>Strong lagna lord:</strong> aatm-vishwas, achhi health, leadership, clear direction. <strong style={{ color: '#FCA5A5' }}>Weak lagna lord:</strong> self-doubt, health par dhyaan, identity confusion — par remedies (mantra, daan, deity worship) se ise mazboot kiya jaa sakta hai. Pehle bhaav mein baithe grahas bhi vyaktitva ko shape karte hain.
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lagna Lord Strength (Shadbala)</td><td className="p-3" style={{ color: GOLD }}>✓ Shown</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lagna Lord House Placement</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">1st-House Planets (benefic/malefic)</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Lagna Bal Calculator</h2>
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
                { slug: 'free-kundali-strength-calculator', name: 'Kundali Strength' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day Calculator' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
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

function DetailCell({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="font-bold text-sm" style={{ color: GOLD }}>{value ?? '—'}</div>
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
