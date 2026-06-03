'use client';

// ============================================================
// File: app/calculators/free-lucky-day-calculator/page.tsx
// Version: v1.1 — Free Lucky Day Calculator
// API: /api/calc/kundali (calcType: 'lucky-day')
// Logic: strongest planet (Shadbala) → lucky day/color/number/metal/direction
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

// ─── Planet → Lucky attributes ────────────────────────────────
const LUCKY_DATA: Record<string, { day: string; day_hi: string; color: string; number: number; metal: string; direction: string; deity: string }> = {
  Sun:     { day: 'Sunday',    day_hi: 'रविवार',   color: 'Red / Orange',   number: 1, metal: 'Gold',   direction: 'East',       deity: 'Surya Dev'   },
  Moon:    { day: 'Monday',    day_hi: 'सोमवार',   color: 'White / Silver', number: 2, metal: 'Silver', direction: 'North-West', deity: 'Lord Shiva'  },
  Mars:    { day: 'Tuesday',   day_hi: 'मंगलवार',  color: 'Red',            number: 9, metal: 'Copper', direction: 'South',      deity: 'Hanuman ji'  },
  Mercury: { day: 'Wednesday', day_hi: 'बुधवार',   color: 'Green',          number: 5, metal: 'Bronze', direction: 'North',      deity: 'Ganesh ji'   },
  Jupiter: { day: 'Thursday',  day_hi: 'गुरुवार',  color: 'Yellow',         number: 3, metal: 'Gold',   direction: 'North-East', deity: 'Lord Vishnu' },
  Venus:   { day: 'Friday',    day_hi: 'शुक्रवार', color: 'White / Pink',   number: 6, metal: 'Silver', direction: 'South-East', deity: 'Maa Lakshmi' },
  Saturn:  { day: 'Saturday',  day_hi: 'शनिवार',   color: 'Black / Blue',   number: 8, metal: 'Iron',   direction: 'West',       deity: 'Shani Dev'   },
  Rahu:    { day: 'Saturday',  day_hi: 'शनिवार',   color: 'Blue / Smoke',   number: 4, metal: 'Lead',   direction: 'South-West', deity: 'Maa Durga'   },
  Ketu:    { day: 'Tuesday',   day_hi: 'मंगलवार',  color: 'Grey / Multi',   number: 7, metal: 'Iron',   direction: 'South',      deity: 'Ganesh ji'   },
};

const WEEKDAYS: { day: string; day_hi: string; planet: string }[] = [
  { day: 'Sunday',    day_hi: 'रविवार',   planet: 'Sun'     },
  { day: 'Monday',    day_hi: 'सोमवार',   planet: 'Moon'    },
  { day: 'Tuesday',   day_hi: 'मंगलवार',  planet: 'Mars'    },
  { day: 'Wednesday', day_hi: 'बुधवार',   planet: 'Mercury' },
  { day: 'Thursday',  day_hi: 'गुरुवार',  planet: 'Jupiter' },
  { day: 'Friday',    day_hi: 'शुक्रवार', planet: 'Venus'   },
  { day: 'Saturday',  day_hi: 'शनिवार',   planet: 'Saturn'  },
];

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
  { q: 'Lucky day kaise pata chalta hai?', a: 'Aapka lucky day aapki kundali ke sabse strong graha (Shadbala) se decide hota hai. Har planet ek weekday ka swami hai — Sun ka Sunday, Moon ka Monday, Mars ka Tuesday, etc. Jis planet ki strength sabse zyada, uska vaar aapka lucky day banta hai. Trikaal Vaani Swiss Ephemeris se ye calculate karta hai.' },
  { q: 'Mera lucky day konsa hai?', a: 'Date of Birth, exact Time of Birth aur Place of Birth daalo. Calculator aapki kundali banakar Shadbala se strongest planet nikaalta hai, aur uske swami-vaar ko aapka lucky day declare karta hai — saath mein lucky color, number, metal aur direction bhi.' },
  { q: 'Lucky color aur lucky number kaise nikalte hain?', a: 'Strongest planet se. Jaise Mars strong ho to lucky color Red, number 9, metal Copper. Sun strong ho to color Red/Orange, number 1, metal Gold. Har planet ke apne shubh rang, ank aur dhaatu Jyotish mein fixed hain.' },
  { q: 'Kya lucky day har kaam ke liye shubh hai?', a: 'Lucky day important decisions ke liye best hota hai — interview, business deal, naya kaam shuru karna, shopping, ya koi shubh aarambh. Roz-marra ke kaam kisi bhi din ho sakte hain, par bade decisions lucky day pe lene se shubh phal milte hain.' },
  { q: 'Lucky day by date of birth kaise nikalein?', a: 'Sirf DOB se approximate andaaza lagta hai, par accurate result ke liye time aur place of birth bhi chahiye — kyunki strongest planet exact birth chart (Shadbala) se hi nikalta hai. Trikaal Vaani teeno leke 99.9% astronomical accuracy deta hai.' },
  { q: 'Weekly calendar kya batata hai?', a: 'Calculator har weekday ko uske swami-graha ki strength ke hisaab se mark karta hai — Lucky (strong graha), Neutral, ya Challenging (weak graha). Isse aapko pata chalta hai ki hafte ke kis din kaam aasan rahega aur kis din careful rehna hai.' },
  { q: 'Kya ye Lucky Day Calculator free hai?', a: 'Haan, 100% free. Strongest planet, lucky day, lucky color, lucky number, lucky metal, lucky direction, weekly lucky/neutral/challenging calendar aur 3 Parashar remedies (Mantra, Ratna, Daan) — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + Shadbala (Parashar BPHS ki 6-fold planetary strength system) use karta hai with Lahiri Ayanamsha. Yahi system professional astrologers worldwide use karte hain — 99.9% astronomical accuracy.' },
];

export default function FreeLuckyDayCalculatorPage() {
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
          calcType: 'lucky-day',
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
  const strongest: string | null = result?.strongestPlanet || null;
  const lucky = strongest ? LUCKY_DATA[strongest] : null;
  const planets: any[] = result?.planets ?? [];
  const strengthOf = (planet: string): number | null => {
    const p = planets.find((x: any) => x.planet === planet);
    return typeof p?.strength === 'number' ? p.strength : null;
  };
  const classifyDay = (planet: string): 'lucky' | 'neutral' | 'challenging' => {
    const s = strengthOf(planet);
    if (s === null) return 'neutral';
    if (s >= 40) return 'lucky';
    if (s >= 25) return 'neutral';
    return 'challenging';
  };

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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-lucky-day-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Lucky Day Calculator — Find Your Luckiest Day of the Week',
    description:
      'Find your lucky day, lucky color, lucky number, lucky metal & direction based on your strongest planet (Shadbala). Free Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Lucky Day Calculator',
    aboutEntities: ['Lucky Day', 'Strongest Planet', 'Shadbala', 'Vaar-Swami'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Shadbala', 'Planetary Strength'],
    howToName: 'How to find your lucky day, color, number and metal',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Find the strongest planet', text: 'The calculator computes Shadbala for every planet using Swiss Ephemeris with Lahiri Ayanamsha and picks the strongest.' },
      { name: 'Get your result', text: 'See your lucky day, color, number, metal and direction, a weekly luck calendar and free remedies.' },
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
            <span style={{ color: GOLD }}>Free Lucky Day Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Lucky Day Calculator — Find Your Luckiest Day of the Week
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              Aapka <strong style={{ color: GOLD }}>Lucky Day</strong> aapki kundali ke sabse strong graha (Shadbala) se decide hota hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Lucky Day Calculator</strong> Swiss Ephemeris se aapke strongest planet ko nikaalta hai aur uske hisaab se aapka lucky day, lucky color, lucky number, lucky metal aur direction batata hai — bilkul free, turant.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Shadbala (Parashar BPHS) · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Lucky Day (Free)</h2>
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
                {loading ? '⟳ Finding Your Lucky Day...' : '🍀 Find My Lucky Day'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Shadbala · Parashar BPHS</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* LUCKY DAY VERDICT */}
              {lucky ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                  background: `linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                  border: `1px solid rgba(34,197,94,0.35)`,
                }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    {form.name ? `${form.name}'s ` : ''}Lucky Day
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-2" style={{ color: '#86EFAC' }}>
                    🍀 {lucky.day} <span className="text-2xl md:text-3xl text-slate-300">({lucky.day_hi})</span>
                  </div>
                  <div className="text-base text-slate-300">
                    Strongest Planet: <span style={{ color: GOLD }} className="font-bold">{strongest}</span>
                    {strengthOf(strongest!) !== null && <span className="text-slate-400"> · Strength {strengthOf(strongest!)}%</span>}
                  </div>
                  <div className="text-sm text-slate-400 mt-2 italic max-w-2xl mx-auto">
                    {lucky.deity} ka aashirvaad — {lucky.day} ko important kaam, naye aarambh aur shubh decisions ke liye best.
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Strongest planet calculate nahi ho paya. Kripya birth details dobara check karein.</p>
                </div>
              )}

              {/* LUCKY ATTRIBUTES GRID */}
              {lucky && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>✨ Your Lucky Attributes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DetailCell icon="🎨" label="Lucky Color" value={lucky.color} />
                    <DetailCell icon="🔢" label="Lucky Number" value={lucky.number} />
                    <DetailCell icon="🪙" label="Lucky Metal" value={lucky.metal} />
                    <DetailCell icon="🧭" label="Lucky Direction" value={lucky.direction} />
                    <DetailCell icon="🛕" label="Lucky Deity" value={lucky.deity} />
                    <DetailCell icon="⏰" label="Best Time" value={`${lucky.day} morning (sunrise)`} />
                  </div>
                </div>
              )}

              {/* WEEKLY CALENDAR */}
              {planets.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📅 Your Weekly Luck Calendar</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {WEEKDAYS.map((wd) => {
                      const cls = classifyDay(wd.planet);
                      const s = strengthOf(wd.planet);
                      const colors = {
                        lucky:       { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.4)',  text: '#86EFAC', tag: 'Lucky' },
                        neutral:     { bg: 'rgba(212,175,55,0.08)', border: GOLD_RGBA(0.3),          text: GOLD,      tag: 'Neutral' },
                        challenging: { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.35)', text: '#FCA5A5', tag: 'Care' },
                      }[cls];
                      const isLuckyDay = lucky && wd.day === lucky.day;
                      return (
                        <div key={wd.day} className="p-3 rounded-xl text-center" style={{ background: colors.bg, border: `1px solid ${isLuckyDay ? GOLD : colors.border}` }}>
                          <div className="text-xs text-slate-400">{wd.day_hi}</div>
                          <div className="text-sm font-bold mt-0.5" style={{ color: colors.text }}>{wd.day.slice(0, 3)}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{wd.planet}{s !== null ? ` ${s}%` : ''}</div>
                          <div className="text-[10px] font-semibold mt-1" style={{ color: colors.text }}>{isLuckyDay ? '⭐ Best' : colors.tag}</div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">Har din ka swami-graha aur uski Shadbala strength ke aadhar par — strong graha = lucky din.</p>
                </div>
              )}

              {/* DOS */}
              {dos.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos — Luck Badhane Ke Liye</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dos.map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                  </ul>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>🪔 3 Free Remedies — Strongest Planet Ko Aur Strong Karein</h3>
                  <p className="text-xs text-slate-400 mb-5">{strongest} ki kripa banaye rakhne ke liye (Parashar)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={mantra} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={ratna} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={daan} />}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Apni poori kundali ka deep analysis aur personalized remedies chahiye?</p>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Lucky Day Kaise Decide Hota Hai? — Shadbala Se Strongest Planet</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic Jyotish mein har vyakti ka <strong style={{ color: GOLD }}>lucky day</strong> uski kundali ke sabse balwan graha se nikalta hai. Maharishi Parashar ne <em>BPHS</em> mein <strong>Shadbala</strong> — graha ki 6-fold strength (Sthana, Dig, Kala, Cheshta, Naisargika, Drik Bal) — ka concept diya. Jis graha ki total Shadbala sabse zyada, wahi aapke jeevan mein sabse positive results deta hai, aur uska swami-vaar aapka lucky day banta hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Har graha ek weekday ka swami hai — yahi <em>Vaar-Swami</em> sambandh hai. Isi se lucky color, lucky number, lucky metal aur shubh direction bhi judi hoti hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Graha → Lucky Day, Color, Number Mapping</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Strongest Planet</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Lucky Day</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Color</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Number</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Metal</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].map((p) => (
                    <tr key={p} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td className="p-3 font-semibold" style={{ color: GOLD }}>{p}</td>
                      <td className="p-3">{LUCKY_DATA[p].day} ({LUCKY_DATA[p].day_hi})</td>
                      <td className="p-3">{LUCKY_DATA[p].color}</td>
                      <td className="p-3">{LUCKY_DATA[p].number}</td>
                      <td className="p-3">{LUCKY_DATA[p].metal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Apna Lucky Day Kaise Use Karein</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Lucky day par important decisions lein — naya business, job interview, property deal, ya koi shubh aarambh. Us din apna lucky color pehnein, lucky direction mein mukh karke kaam shuru karein, aur strongest planet ke mantra ka jaap karein. Yeh chhote upaay aapki natural planetary strength ko aur badhate hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk Lucky Day Calculator</h2>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Method</td><td className="p-3">Shadbala (6-fold strength)</td><td className="p-3 text-slate-500">Sun-sign / generic</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Weekly Luck Calendar</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lucky Color + Number + Metal</td><td className="p-3" style={{ color: GOLD }}>✓ All</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Lucky Day Calculator</h2>
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
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
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

function DetailCell({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="font-bold text-base" style={{ color: GOLD }}>{value ?? '—'}</div>
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
