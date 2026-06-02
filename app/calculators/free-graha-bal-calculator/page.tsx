'use client';

// ============================================================
// File: app/calculators/free-graha-bal-calculator/page.tsx
// Version: v1.1 — Free Graha Bal Calculator (Shadbala showcase)
// API: /api/calc/kundali (calcType: 'graha-bal')  [route v1.7+]
// Logic: strongest + weakest planet, full Shadbala 6-bala breakdown
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

const PLANET_LIFE_AREAS: Record<string, string[]> = {
  Sun:     ['Career & Authority', 'Father', 'Government', 'Vitality'],
  Moon:    ['Mental peace', 'Mother', 'Emotions', 'Home'],
  Mars:    ['Energy & Courage', 'Siblings', 'Property', 'Drive'],
  Mercury: ['Communication', 'Business', 'Education', 'Intellect'],
  Jupiter: ['Wealth & Fortune', 'Children', 'Wisdom', 'Spirituality'],
  Venus:   ['Marriage & Love', 'Luxury', 'Arts', 'Vehicles'],
  Saturn:  ['Career longevity', 'Discipline', 'Service', 'Endurance'],
  Rahu:    ['Foreign', 'Sudden gains', 'Technology', 'Ambition'],
  Ketu:    ['Spirituality', 'Past karma', 'Moksha', 'Detachment'],
};

const CORE_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const BALA_LABELS: Record<string, string> = {
  sthanaBala: 'Sthana Bala — स्थान (Positional)',
  digBala: 'Dig Bala — दिग् (Directional)',
  kalaBala: 'Kala Bala — काल (Temporal)',
  cheshtaBala: 'Cheshta Bala — चेष्टा (Motional)',
  naisargikaBala: 'Naisargika Bala — नैसर्गिक (Natural)',
  drikBala: 'Drik Bala — दृक् (Aspectual)',
};
const BALA_ORDER = ['sthanaBala', 'digBala', 'kalaBala', 'cheshtaBala', 'naisargikaBala', 'drikBala'];

// Normalize top-level shadbala (array OR object OR {planets:{...}}) → keyed map
function shadbalaMap(raw: any): Record<string, any> {
  const map: Record<string, any> = {};
  if (!raw) return map;
  if (Array.isArray(raw)) {
    raw.forEach((e) => { if (e?.planet) map[e.planet] = e; });
    return map;
  }
  const obj = raw.planets ?? raw;
  if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([k, v]: any) => {
      const planet = v?.planet ?? k;
      if (planet) map[planet] = v;
    });
  }
  return map;
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
  { q: 'Graha Bal kya hota hai?', a: 'Graha Bal yaani graha ki shakti — kisi planet ki kundali mein kitni strength hai. Maharishi Parashar ki Shadbala system isse 6 prakaar se naapti hai: Sthana, Dig, Kala, Cheshta, Naisargika aur Drik Bal. Inka yog batata hai ki graha apne results dene mein kitna samarth hai.' },
  { q: 'Mera sabse strong planet konsa hai?', a: 'Date, time aur place of birth daalo. Calculator aapke saare grahas ki Shadbala calculate karke unki ranking deta hai — sabse strong se sabse weak tak — aur har graha ka 6-fold breakdown bhi.' },
  { q: 'Shadbala ke 6 bal konse hain?', a: 'Sthana Bala (positional strength), Dig Bala (directional), Kala Bala (time-based), Cheshta Bala (motion), Naisargika Bala (natural/inherent) aur Drik Bala (aspect-based). Sabka yog = total Shadbala, jise minimum required se compare karte hain.' },
  { q: 'Strong planet ka kya fayda hai?', a: 'Strong graha apne karak life-areas (jaise Jupiter = wealth/knowledge, Venus = relationships) mein achhe aur poore results deta hai. Strongest planet aapki natural strength aur success ka area dikhata hai.' },
  { q: 'Graha kab strong mana jaata hai?', a: 'Jab graha ki total Shadbala uski minimum required strength se zyada ho (ratio 1.0 se upar), tab wo strong (balwan) mana jaata hai. Ratio 1.0 se kam = weak. Calculator ye ratio aur "isStrong" status dono dikhata hai.' },
  { q: 'Weak planet ko strong kaise karein?', a: 'Weak graha ke liye uska mantra jaap, uske vaar ko vrat-daan, deity worship aur expert salaah ke baad gemstone. Calculator aapke sabse weak planet ke liye 3 personalized free remedies deta hai.' },
  { q: 'Kya ye Graha Bal Calculator free hai?', a: 'Haan, 100% free. Strongest + weakest planet, all-planet strength ranking, har graha ka Shadbala 6-bala breakdown, total vs minimum, aur 3 Parashar remedies — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + complete Shadbala (Parashar BPHS) use karta hai with Lahiri Ayanamsha — 99.9% astronomical accuracy. Yahi method professional astrologers use karte hain.' },
];

export default function FreeGrahaBalCalculatorPage() {
  const [form, setForm] = useState<FormData>({
    name: '', gender: '', date: '', time: '12:00', unknownTime: false,
    placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const set = useCallback((key: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  useEffect(() => {
    if (result?.strongestPlanet) setSelectedPlanet(result.strongestPlanet);
  }, [result]);

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
          calcType: 'graha-bal',
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
  const strongest: string | null = result?.strongestPlanet || null;
  const weakest: string | null = result?.weakestPlanet || null;
  const sbMap = shadbalaMap(result?.shadbala);

  const strengthOf = (planet: string): number | null => {
    const p = planets.find((x: any) => x.planet === planet);
    return typeof p?.strength === 'number' ? p.strength : null;
  };

  const ranking = CORE_PLANETS
    .map((p) => ({ planet: p, strength: strengthOf(p) }))
    .filter((r) => r.strength !== null)
    .sort((a, b) => (b.strength as number) - (a.strength as number));

  // Selected planet Shadbala detail (prefer top-level for breakdown)
  const selTop = selectedPlanet ? sbMap[selectedPlanet] : null;
  const selPlanetObj = selectedPlanet ? planets.find((p: any) => p.planet === selectedPlanet) : null;
  const selSb = selPlanetObj?.shadbala ?? null;
  const breakdown: Record<string, number> | null = selTop?.breakdown ?? null;
  const selTotal = selTop?.totalShadbala ?? selSb?.total ?? null;
  const selMin = selTop?.minimumRequired ?? selSb?.minimum ?? null;
  const selRatio = selTop?.strengthRatio ?? selSb?.ratio ?? null;
  const selClass = selTop?.classification ?? selSb?.classification ?? null;
  const selIsStrong = (selTop?.isStrong ?? selSb?.isStrong) ?? null;
  const breakdownMax = breakdown ? Math.max(...Object.values(breakdown).map((v) => Number(v) || 0), 1) : 1;

  // ─── Remedies / Dos (for weakest planet via route v1.7) ─────
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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-graha-bal-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Graha Bal Calculator — Find Your Strongest & Weakest Planet (Shadbala)',
    description:
      'Find your strongest and weakest planet with full Shadbala 6-fold breakdown (Sthana, Dig, Kala, Cheshta, Naisargika, Drik Bal) and free remedies. Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Graha Bal Calculator',
    aboutEntities: ['Shadbala', 'Sthana Bala', 'Dig Bala', 'Graha Bala', 'Planetary Strength'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Shadbala', 'Planetary Strength Analysis'],
    howToName: 'How to find your strongest and weakest planet using Shadbala',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Calculate Shadbala', text: 'The calculator computes full Shadbala for every planet using Swiss Ephemeris with Lahiri Ayanamsha.' },
      { name: 'Get your result', text: 'See your strongest and weakest planet, all-planet strength ranking and the 6-fold Shadbala breakdown with free remedies.' },
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
            <span style={{ color: GOLD }}>Free Graha Bal Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Graha Bal Calculator — Strongest &amp; Weakest Planet (Shadbala)
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Graha Bal</strong> har planet ki kundali mein shakti hai, jise <strong style={{ color: GOLD }}>Shadbala</strong> (6-fold strength) se naapa jaata hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Graha Bal Calculator</strong> Swiss Ephemeris se aapke strongest aur weakest planet, sabhi grahas ki strength ranking, aur har graha ka poora Sthana–Dig–Kala–Cheshta–Naisargika–Drik breakdown turant deta hai — bilkul free.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Complete Shadbala (Parashar BPHS) · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Graha Bal (Free)</h2>
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
                {form.unknownTime && <p className="text-slate-500 text-xs mt-1">Solar chart will be used (12:00 noon). Note: Dig & Kala Bal time-based hote hain — accurate result ke liye exact time best hai.</p>}
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
                {loading ? '⟳ Calculating Graha Bal...' : '🪐 Check My Graha Bal'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Complete Shadbala · Parashar BPHS</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* STRONGEST + WEAKEST */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strongest && (
                  <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: `linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid rgba(34,197,94,0.35)` }}>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Strongest Planet 💪</div>
                    <div className="text-3xl md:text-4xl font-serif font-bold mb-1" style={{ color: '#86EFAC' }}>
                      {strongest} <span className="text-xl text-slate-300">({PLANET_HI[strongest]})</span>
                    </div>
                    {strengthOf(strongest) !== null && <div className="text-sm text-slate-300 mb-2">Strength: <span style={{ color: GOLD }} className="font-bold">{strengthOf(strongest)}%</span></div>}
                    <div className="text-xs text-slate-400">{(PLANET_LIFE_AREAS[strongest] ?? []).join(' · ')}</div>
                    <div className="text-[11px] text-slate-500 mt-2 italic">In areas mein aapki natural strength hai.</div>
                  </div>
                )}
                {weakest && (
                  <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: `linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid rgba(239,68,68,0.35)` }}>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Weakest Planet ⚠️</div>
                    <div className="text-3xl md:text-4xl font-serif font-bold mb-1" style={{ color: '#FCA5A5' }}>
                      {weakest} <span className="text-xl text-slate-300">({PLANET_HI[weakest]})</span>
                    </div>
                    {strengthOf(weakest) !== null && <div className="text-sm text-slate-300 mb-2">Strength: <span style={{ color: GOLD }} className="font-bold">{strengthOf(weakest)}%</span></div>}
                    <div className="text-xs text-slate-400">{(PLANET_LIFE_AREAS[weakest] ?? []).join(' · ')}</div>
                    <div className="text-[11px] text-slate-500 mt-2 italic">In areas par dhyaan aur remedies chahiye.</div>
                  </div>
                )}
              </div>

              {/* RANKING */}
              {ranking.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📊 Planet Strength Ranking</h3>
                  <div className="space-y-3">
                    {ranking.map((r) => {
                      const s = r.strength as number;
                      const barColor = s >= 40 ? '#22c55e' : s >= 25 ? GOLD : '#ef4444';
                      return (
                        <div key={r.planet}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-200 font-medium">{r.planet} ({PLANET_HI[r.planet]})</span>
                            <span className="text-slate-400">{s}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="h-full transition-all duration-700" style={{ width: `${Math.max(3, Math.min(100, s))}%`, background: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SHADBALA BREAKDOWN — interactive */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                <h3 className="text-xl font-serif font-bold mb-1" style={{ color: GOLD }}>🔬 Shadbala Breakdown</h3>
                <p className="text-xs text-slate-400 mb-4">Kisi bhi graha ko select karke uska 6-fold strength breakdown dekhein:</p>

                {/* selector */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {CORE_PLANETS.map((p) => {
                    const active = selectedPlanet === p;
                    return (
                      <button key={p} type="button" onClick={() => setSelectedPlanet(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: active ? GOLD : 'rgba(255,255,255,0.04)', color: active ? '#080B12' : '#cbd5e1', border: `1px solid ${active ? GOLD : 'rgba(255,255,255,0.1)'}` }}>
                        {p}
                      </button>
                    );
                  })}
                </div>

                {selectedPlanet && (
                  <>
                    {/* summary row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      <SbCell label="Total Shadbala" value={selTotal !== null ? `${Number(selTotal).toFixed(1)}` : '—'} />
                      <SbCell label="Minimum Req." value={selMin !== null ? `${Number(selMin).toFixed(0)}` : '—'} />
                      <SbCell label="Ratio" value={selRatio !== null ? `${Number(selRatio).toFixed(2)}×` : '—'} />
                      <SbCell label="Status" value={selIsStrong === null ? (selClass || '—') : (selIsStrong ? 'Strong ✓' : 'Weak')} highlight={selIsStrong} />
                    </div>

                    {/* breakdown bars */}
                    {breakdown ? (
                      <div className="space-y-3">
                        {BALA_ORDER.filter((k) => breakdown[k] !== undefined).map((k) => {
                          const v = Number(breakdown[k]) || 0;
                          return (
                            <div key={k}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300">{BALA_LABELS[k] ?? k}</span>
                                <span className="text-slate-400">{v.toFixed(1)}</span>
                              </div>
                              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <div className="h-full transition-all duration-700" style={{ width: `${Math.max(3, (v / breakdownMax) * 100)}%`, background: `linear-gradient(90deg, ${GOLD} 0%, #FFA500 100%)` }} />
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-[11px] text-slate-500 mt-3">Values Shashtiamsa (Rupas) mein. Sabka yog = Total Shadbala. {selClass ? `Dignity: ${selClass}.` : ''}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Is graha ka detailed breakdown abhi available nahi — summary stats upar dikhaye gaye hain.</p>
                    )}
                  </>
                )}
              </div>

              {/* DOS */}
              {dos.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos — {weakest} (Weakest) Ko Strong Karne Ke Liye</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dos.map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                  </ul>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>🪔 3 Free Remedies — Weakest Planet Ke Liye</h3>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Graha Bal Kya Hota Hai? — Shadbala Ka Vigyaan</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Graha Bal</strong> yaani graha ki shakti — kundali mein kisi planet ki kitni samarthya hai apne results dene ki. Maharishi Parashar ne <em>BPHS</em> mein <strong>Shadbala</strong> ("shad" = chhah) system diya, jo har graha ki strength ko 6 alag-alag tareeke se naapta hai aur unka yog nikaalta hai. Yahi se pata chalta hai ki konsa graha balwan hai aur konsa nirbal.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Shadbala Ke 6 Bal — Detailed</h2>
            <ol className="text-slate-300 leading-relaxed mb-4 space-y-2 list-decimal pl-5">
              <li><strong style={{ color: GOLD }}>Sthana Bala (Positional):</strong> graha apni rashi, uchcha-neecha, varga mein kitna achha baitha hai.</li>
              <li><strong style={{ color: GOLD }}>Dig Bala (Directional):</strong> graha kis disha (house) mein hai — har graha ko ek disha mein full bal milta hai.</li>
              <li><strong style={{ color: GOLD }}>Kala Bala (Temporal):</strong> din/raat, paksha, varsh-maas-din ke aadhar par bal.</li>
              <li><strong style={{ color: GOLD }}>Cheshta Bala (Motional):</strong> graha ki gati (retrograde/direct) se milne wala bal.</li>
              <li><strong style={{ color: GOLD }}>Naisargika Bala (Natural):</strong> har graha ka inherent natural bal (Sun sabse zyada).</li>
              <li><strong style={{ color: GOLD }}>Drik Bala (Aspectual):</strong> doosre grahas ki drishti (aspect) se milne ya ghatne wala bal.</li>
            </ol>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Strong vs Weak Graha — Ratio Ka Matlab</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Har graha ki ek <strong>minimum required Shadbala</strong> hoti hai. Total Shadbala ÷ minimum = <strong style={{ color: GOLD }}>ratio</strong>. Ratio <strong>1.0 se zyada</strong> = strong (balwan), <strong>1.0 se kam</strong> = weak (nirbal). Strong graha apne life-areas mein poore positive results deta hai; weak graha ko remedies se support karna padta hai.
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Full 6-Bala Breakdown</td><td className="p-3" style={{ color: GOLD }}>✓ Interactive</td><td className="p-3 text-slate-500">✗ / paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Total vs Minimum + Ratio</td><td className="p-3" style={{ color: GOLD }}>✓ Shown</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Strongest + Weakest</td><td className="p-3" style={{ color: GOLD }}>✓ Both</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Graha Bal Calculator</h2>
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
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
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

function SbCell({ label, value, highlight }: { label: string; value: any; highlight?: boolean | null }) {
  const color = highlight === true ? '#86EFAC' : highlight === false ? '#FCA5A5' : GOLD;
  return (
    <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-[11px] text-slate-400 mb-1">{label}</div>
      <div className="font-bold text-sm" style={{ color }}>{value}</div>
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
