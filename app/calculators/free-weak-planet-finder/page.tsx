'use client';

// ============================================================
// File: app/calculators/free-weak-planet-finder/page.tsx
// Version: v1.1 — Free Weak Planet Finder
// API: /api/calc/kundali (calcType: 'weak-planet')
// Logic: weakest planet (Shadbala) → life areas + remedies to strengthen
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

// ─── Planet → Life areas it governs ───────────────────────────
const PLANET_LIFE_AREAS: Record<string, string[]> = {
  Sun:     ['Career & Authority', 'Father relationship', 'Government matters', 'Health & Vitality'],
  Moon:    ['Mental peace', 'Mother relationship', 'Emotions & Intuition', 'Home & comfort'],
  Mars:    ['Energy & Courage', 'Siblings', 'Property & Land', 'Relationships'],
  Mercury: ['Communication', 'Business & Trade', 'Education', 'Intelligence'],
  Jupiter: ['Wealth & Fortune', 'Children', 'Spirituality', 'Knowledge'],
  Venus:   ['Marriage & Love', 'Luxury & Comfort', 'Arts & Beauty', 'Vehicles'],
  Saturn:  ['Career longevity', 'Discipline', 'Service', 'Chronic health'],
  Rahu:    ['Foreign connections', 'Sudden gains', 'Technology', 'Unconventional paths'],
  Ketu:    ['Spirituality', 'Past life karma', 'Moksha', 'Hidden knowledge'],
};

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
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
  { q: 'Weak planet kya hota hai?', a: 'Weak planet wo graha hai jiski Shadbala (6-fold strength) minimum required se kam hai. Aisa graha apne karak (jo cheezein wo control karta hai) ke poore positive results nahi de pata — us life-area mein rukawat, delay ya struggle aati hai. Trikaal Vaani Swiss Ephemeris se har graha ki exact strength nikaalta hai.' },
  { q: 'Mera sabse weak planet konsa hai?', a: 'Date of Birth, exact Time of Birth aur Place of Birth daalo. Calculator aapki kundali ke saare grahas ki Shadbala strength compare karke sabse kamzor graha identify karta hai, aur batata hai ki kis life-area par iska asar hai.' },
  { q: 'Weak planet ke effects kya hote hain?', a: 'Har graha kuch life-areas control karta hai. Jaise weak Jupiter = wealth/children/knowledge mein rukawat; weak Mars = energy/property/courage mein kami; weak Venus = marriage/comfort mein delay. Weak planet us area mein extra mehnat maangta hai.' },
  { q: 'Weak planet ko strong kaise karein?', a: 'Us graha ka mantra jaap, uske vaar ko vrat aur daan, uska deity worship, aur (expert salaah ke baad) gemstone — ye Parashar remedies graha ko strengthen karte hain. Trikaal Vaani aapke weakest planet ke liye 3 personalized free remedies deta hai.' },
  { q: 'Weak planet aur debilitated planet mein kya antar hai?', a: 'Debilitation (neech) sirf rashi-based ek factor hai. Shadbala overall strength hai jo position, direction, time, motion, nature aur aspects — sab milakar nikaalti hai. Ek debilitated planet bhi Shadbala mein strong ho sakta hai, aur exalted planet weak. Isliye Shadbala zyada accurate hai.' },
  { q: 'Kya weak planet ke liye gemstone safe hai?', a: 'Gemstone se planet ki energy badhti hai, par har stone har kisi ke liye safe nahi. Neelam (Saturn), Heera (Venus) jaise stones expert consultation ke bina nahi pehenne chahiye. Calculator suggestion deta hai, par professional confirmation zaroori hai.' },
  { q: 'Kya ye Weak Planet Finder free hai?', a: 'Haan, 100% free. Aapka weakest planet, uski Shadbala strength vs minimum, affected life-areas, all-planet strength ranking, aur 3 Parashar remedies (Mantra, Ratna, Daan) — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + Shadbala (Parashar BPHS) use karta hai with Lahiri Ayanamsha — 99.9% astronomical accuracy. Yahi system professional astrologers worldwide use karte hain.' },
];

export default function FreeWeakPlanetFinderPage() {
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
          calcType: 'weak-planet',
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
  const weakest: string | null = result?.weakestPlanet || null;
  const weakGraha = weakest ? planets.find((p: any) => p.planet === weakest) : null;
  const weakStrength: number | null = typeof weakGraha?.strength === 'number' ? weakGraha.strength : null;
  const weakRatio: number | null =
    typeof weakGraha?.shadbala?.strengthRatio === 'number' ? weakGraha.shadbala.strengthRatio : null;
  const lifeAreas: string[] = weakest ? (PLANET_LIFE_AREAS[weakest] ?? []) : [];

  // All-planet ranking (core 7), weakest first
  const ranking = CORE_PLANETS
    .map((p) => {
      const g = planets.find((x: any) => x.planet === p);
      return { planet: p, strength: typeof g?.strength === 'number' ? g.strength : null };
    })
    .filter((r) => r.strength !== null)
    .sort((a, b) => (a.strength as number) - (b.strength as number));

  const whyWeak = (() => {
    if (!weakest) return '';
    if (weakRatio !== null && weakRatio < 1) {
      return `${weakest} ki Shadbala minimum required se sirf ${(weakRatio).toFixed(2)}× hi hai — yaani required strength se kam. Isliye ye graha apne karak (life-areas) ke poore positive results dene mein sangharsh karta hai.`;
    }
    if (weakStrength !== null) {
      return `${weakest} ki overall strength sirf ${weakStrength}% hai — baaki grahas ke mukable kamzor. Is graha ke karak life-areas mein extra dhyaan aur upaay chahiye.`;
    }
    return `${weakest} aapki kundali ka sabse kamzor graha hai — iske karak life-areas par focus aur remedies zaroori hain.`;
  })();

  // ─── Remedies / Dos ─────────────────────────────────────────
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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-weak-planet-finder';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Weak Planet Finder — Find & Fix Weak Planets in Kundali',
    description:
      'Find your weakest planet using Shadbala, the life areas it affects, and 3 free Parashar remedies to strengthen it. Free Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Weak Planet Finder',
    aboutEntities: ['Weak Planet', 'Shadbala', 'Planetary Strength', 'Planetary Remedies'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Shadbala', 'Planetary Remedies'],
    howToName: 'How to find and strengthen the weak planet in your kundali',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Compare planetary strength', text: 'The calculator computes Shadbala for every planet using Swiss Ephemeris with Lahiri Ayanamsha and finds the weakest one.' },
      { name: 'Get your result', text: 'See your weakest planet, the life areas it affects and 3 free Parashar remedies to strengthen it.' },
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
            <span style={{ color: GOLD }}>Free Weak Planet Finder</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Weak Planet Finder — Find &amp; Fix Weak Planets in Your Kundali
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Weak planet</strong> wo graha hai jiski <strong style={{ color: GOLD }}>Shadbala</strong> minimum se kam ho — wo apne life-areas ke poore results nahi de pata. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Weak Planet Finder</strong> Swiss Ephemeris se aapka sabse kamzor graha, affected life-areas, aur use strong karne ke 3 Parashar remedies turant deta hai — bilkul free.
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
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Weakest Planet (Free)</h2>
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
                {loading ? '⟳ Finding Weak Planet...' : '🔍 Find My Weak Planet'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Shadbala · Parashar BPHS</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* WEAKEST PLANET VERDICT */}
              {weakest ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                  background: `linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                  border: `1px solid rgba(239,68,68,0.35)`,
                }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    {form.name ? `${form.name}'s ` : ''}Weakest Planet
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-2" style={{ color: '#FCA5A5' }}>
                    {weakest} <span className="text-2xl md:text-3xl text-slate-300">({PLANET_HI[weakest]})</span>
                  </div>
                  {weakStrength !== null && (
                    <div className="text-base text-slate-300">Strength: <span style={{ color: GOLD }} className="font-bold">{weakStrength}%</span>
                      {weakRatio !== null && <span className="text-slate-400"> · Shadbala ratio {weakRatio.toFixed(2)}× of minimum</span>}
                    </div>
                  )}
                  <div className="text-sm text-slate-400 mt-3 italic max-w-2xl mx-auto">{whyWeak}</div>

                  {/* Strength meter */}
                  {weakStrength !== null && (
                    <div className="mt-5 max-w-md mx-auto">
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Weak</span><span>Strong</span>
                      </div>
                      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full transition-all duration-1000" style={{
                          width: `${Math.max(4, Math.min(100, weakStrength))}%`,
                          background: `linear-gradient(90deg, #FF4500 0%, #FFA500 60%, ${GOLD} 100%)`,
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Weakest planet calculate nahi ho paya. Kripya birth details dobara check karein.</p>
                </div>
              )}

              {/* LIFE AREAS AFFECTED */}
              {lifeAreas.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>⚠️ Affected Life Areas</h3>
                  <p className="text-xs text-slate-400 mb-5">{weakest} weak hone se in areas par asar pad sakta hai:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {lifeAreas.map((area, i) => (
                      <div key={i} className="p-3 rounded-xl text-center text-sm" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ALL-PLANET RANKING */}
              {ranking.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📊 All Planets — Strength Ranking</h3>
                  <div className="space-y-3">
                    {ranking.map((r) => {
                      const s = r.strength as number;
                      const isWeak = r.planet === weakest;
                      const barColor = s >= 40 ? '#22c55e' : s >= 25 ? GOLD : '#ef4444';
                      return (
                        <div key={r.planet}>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: isWeak ? '#FCA5A5' : '#cbd5e1', fontWeight: isWeak ? 700 : 500 }}>
                              {r.planet} ({PLANET_HI[r.planet]}){isWeak ? ' — weakest' : ''}
                            </span>
                            <span className="text-slate-400">{s}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="h-full transition-all duration-700" style={{ width: `${Math.max(3, Math.min(100, s))}%`, background: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-4">Shadbala-based strength (Rahu/Ketu chhode gaye — classical Shadbala 7 grahas par lagti hai).</p>
                </div>
              )}

              {/* DOS */}
              {dos.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos — {weakest} Ko Strong Karne Ke Liye</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dos.map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                  </ul>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>🪔 3 Free Remedies — Weak Planet Ko Strong Karein</h3>
                  <p className="text-xs text-slate-400 mb-5">{weakest} ko balwan banane ke liye (Parashar)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={mantra} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={ratna} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={daan} />}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Poori kundali ka deep analysis aur har graha ke liye personalized remedies chahiye?</p>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Weak Planet Kya Hota Hai? — Shadbala Aur Minimum Strength</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic Jyotish mein har graha ki ek <strong style={{ color: GOLD }}>Shadbala</strong> hoti hai — chhah prakaar ki strength (Sthana, Dig, Kala, Cheshta, Naisargika, Drik Bal) ka yog. Har graha ke liye ek <em>minimum required strength</em> hoti hai. Jab kisi graha ki Shadbala us minimum se kam ho, to wo graha <strong>weak (nirbal)</strong> mana jaata hai aur apne karak (jis cheezon ka wo malik hai) ke poore positive results nahi de pata.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Yahi reason hai ki kabhi-kabhi ek "achhi" position wala graha bhi expected results nahi deta — kyunki uski overall Shadbala kam hai. Trikaal Vaani har graha ki exact Shadbala calculate karke aapka sabse weak graha identify karta hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Kaunsa Graha Kis Life-Area Ko Control Karta Hai</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Graha</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Weak Hone Par Affected Areas</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {CORE_PLANETS.map((p) => (
                    <tr key={p} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td className="p-3 font-semibold" style={{ color: GOLD }}>{p} ({PLANET_HI[p]})</td>
                      <td className="p-3">{PLANET_LIFE_AREAS[p].join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Weak Planet Ko Strong Kaise Karein — Parashar Remedies</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Weak graha ko balwan banane ke liye uske <strong style={{ color: GOLD }}>mantra ka niyamit jaap</strong>, uske <strong>vaar ko vrat aur daan</strong>, uske <strong>deity ki upasana</strong>, aur expert salaah ke baad uska <strong>gemstone</strong> — ye sab classical upaay hain. Weak Mars ke liye Hanuman ji, weak Jupiter ke liye guru-puja aur peela daan, weak Saturn ke liye Shani-seva — har graha ka apna remedy-set hai.
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Strength Method</td><td className="p-3">Full Shadbala (6-fold)</td><td className="p-3 text-slate-500">Only debilitation check</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Strength vs Minimum</td><td className="p-3" style={{ color: GOLD }}>✓ Shown</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">All-Planet Ranking</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Weak Planet Finder</h2>
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
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra Finder' },
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

function Remedy({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1.5" style={{ color: GOLD }}>{title}</div>
      <div className="text-sm text-slate-300 leading-relaxed">{content}</div>
    </div>
  );
}
