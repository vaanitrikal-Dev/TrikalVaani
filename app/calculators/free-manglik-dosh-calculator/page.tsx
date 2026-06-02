'use client';

// ============================================================
// File: app/calculators/free-manglik-dosh-calculator/page.tsx
// Version: v1.1 — Free Manglik Dosh Calculator
// VM endpoint: /manglik-dosh (dedicated, 100% accurate)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.1 (2026-06-02) — Gold-standard JSON-LD ADDED (page had none):
//        buildCalcJsonLd() helper emits 8 @id-linked nodes (Organization
//        +real sameAs, WebSite, linkable Person /founder, WebPage
//        isPartOf #website, BreadcrumbList, WebApplication, HowTo,
//        FAQPage). Added `.tv-aeo-answer` class to above-fold answer for
//        speakable. Brand fix: visible/schema brand normalised to the
//        double-a spelling; legal single-a kept inside helper only. No logic/
//        UI/form/API change.
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

// ─── Manglik House Reference (Parashar BPHS) ──────────────────
const MANGLIK_HOUSES: Record<number, { name: string; sanskrit: string; effect: string }> = {
  1: { name: '1st House', sanskrit: 'Lagna (Self)',     effect: 'Aggressive personality, dominant nature, leadership but irritability' },
  2: { name: '2nd House', sanskrit: 'Dhana (Wealth)',   effect: 'Harsh speech, family discord, financial volatility' },
  4: { name: '4th House', sanskrit: 'Sukha (Home)',     effect: 'Domestic tensions, mother health, peace disturbed' },
  7: { name: '7th House', sanskrit: 'Kalatra (Spouse)', effect: 'Marital conflict, spouse health issues, partnership tension (STRONGEST Manglik)' },
  8: { name: '8th House', sanskrit: 'Ayur (Longevity)', effect: 'Sudden challenges, accident risk to spouse, in-laws issues' },
  12:{ name: '12th House',sanskrit: 'Vyaya (Loss)',     effect: 'Marital intimacy issues, expenses, foreign travel separations' },
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
  { q: 'Manglik Dosh kya hota hai?', a: 'Manglik Dosh (Mangal Dosha / Kuja Dosha / Bhauma Dosha) Vedic Jyotish ka woh dosha hai jab Mangal (Mars) janm kundali ke 1st, 2nd, 4th, 7th, 8th, ya 12th house mein sthit ho. Ye dosha mukhya roop se marriage compatibility ko affect karta hai per Parashar BPHS.' },
  { q: 'Manglik kaise check karein?', a: 'Date of Birth, exact Time of Birth, aur Place of Birth chahiye. Trikaal Vaani Calculator Swiss Ephemeris se Mangal ki exact house position calculate karta hai aur 6 Manglik houses (1,2,4,7,8,12) se compare karke verdict deta hai with severity.' },
  { q: 'Manglik Dosh ki severity kya hoti hai?', a: '(1) High Severity — Mars in 7th house (most affects marriage). (2) Medium — Mars in 1st, 4th, or 8th house. (3) Low — Mars in 2nd or 12th house. Severity zyada hai toh remedies aur cancellation check zaroori hai.' },
  { q: 'Manglik Dosh ka shadi par kya effect hai?', a: 'Manglik dosh mukhya roop se 4 areas affect karta hai — (1) Marriage delay, (2) Spouse health issues, (3) Marital conflicts/divorce risk, (4) Spouse longevity concerns. Yeh effects severity aur cancellation rules pe depend karte hain.' },
  { q: 'Manglik Dosh kab cancel hota hai?', a: 'Cancellation rules per Parashar: (1) Both partners Manglik hain — dosh cancels each other. (2) Mars in own sign (Mesha/Vrishchika) — dosh weakens. (3) Mars in exaltation (Makara) — dosh nullifies. (4) Mars aspected by Jupiter or Moon — dosh reduces. (5) After age 28 — dosh effect minimal. Trikaal Vaani Calculator auto-detects active cancellations.' },
  { q: 'Manglik Dosh ke remedies kya hain?', a: '(1) Mangal Mantra "Om Mangalaya Namah" 108 times Tuesday. (2) Hanuman Chalisa daily — Hanuman ji Mars ke malik. (3) Coral (Moonga) gemstone after expert consultation. (4) Kumbh Vivah ritual (marriage with pot/tree) for unmarried Manglik. (5) Red lentils, jaggery daan on Tuesday. Trikaal Vaani 3 personalized remedies free deta hai.' },
  { q: 'Kya Manglik aur non-Manglik ki shadi ho sakti hai?', a: 'Haan, ho sakti hai per Parashar — bashart ki dosha cancellation rules apply hon ya proper Kumbh Vivah ritual perform ho. Modern times mein medical compatibility, emotional connection, aur dosha cancellations zyada important hote hain than blind dosha matching.' },
  { q: 'Kya Manglik Calculator bilkul free hai?', a: 'Haan. 100% free. Manglik Yes/No verdict, severity (High/Medium/Low), Mars house + sign + degree, all 6 affected houses, cancellation conditions, aur 3 Parashar remedies (Mantra, Ratna, Daan) — sab free, koi signup nahi.' },
];

export default function FreeManglikDoshCalculatorPage() {
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
      const res = await fetch('/api/calc/manglik-dosh', {
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

  // ─── Manglik extraction ─────────────────────────────────────
  const m = result?.manglik;
  const isManglik = m?.isManglik || false;
  const severity = m?.severity || null;
  const severityColor = m?.severityColor || '#94a3b8';
  const marsHouse = m?.marsHouse || null;
  const marsSign = m?.marsSign || null;
  const marsLongitude = m?.marsLongitude || null;
  const houseEffect = m?.houseEffect || null;
  const cancellations: any[] = m?.cancellationConditions || [];
  const affectedHouses: number[] = m?.manglikHousesAffected || [1, 2, 4, 7, 8, 12];

  const houseDetails = marsHouse && MANGLIK_HOUSES[marsHouse] ? MANGLIK_HOUSES[marsHouse] : null;

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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-manglik-dosh-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Manglik Dosh Calculator — Check Mangal Dosha Online',
    description:
      'Check your Manglik Dosh (Mangal Dosha) from your birth chart — Yes/No verdict, severity, Mars house & sign, cancellation conditions and 3 free Parashar remedies. Free Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Manglik Dosh Calculator',
    aboutEntities: ['Manglik Dosh', 'Mars', 'Seventh House', 'Mangal Dosha'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Manglik Dosh', 'Dosha Remedies'],
    howToName: 'How to check Manglik Dosh in your kundali',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Analyse the Mars house', text: 'The calculator finds the exact house of Mars using Swiss Ephemeris with Lahiri Ayanamsha and checks it against the six Manglik houses (1, 2, 4, 7, 8, 12).' },
      { name: 'Get your result', text: 'See a Yes/No Manglik verdict, severity, affected houses, cancellation conditions and 3 free Parashar remedies.' },
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
            <span style={{ color: GOLD }}>Free Manglik Dosh Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Manglik Dosh Calculator — Check Mangal Dosha Online
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Manglik Dosh Calculator</strong> aapki Manglik status Swiss Ephemeris se calculate karta hai. Date, time, place daalo — Yes/No verdict, severity (High/Medium/Low), Mars house + sign, all 6 affected houses, cancellation conditions, aur 3 Parashar remedies turant milte hain. 100% free, BPHS classical rules ke according.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS · Lahiri Ayanamsha · Mars House Logic</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Manglik Status (Free)</h2>
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
                  {form.unknownTime ? '⚠️ Manglik depends on Mars house — without exact time, result may be approximate.' : '⏰ Exact birth time is needed for accurate Mars house position.'}
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
                {loading ? '⟳ Checking Manglik...' : '🔴 Check My Manglik Status'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Mars House Logic</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* MANGLIK VERDICT */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                background: isManglik
                  ? `linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(2,8,23,0.6) 100%)`
                  : `linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                border: `1px solid ${isManglik ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'}`
              }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                  {form.name ? `${form.name}'s ` : ''}Manglik Status
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: isManglik ? '#FCA5A5' : '#86EFAC' }}>
                  {isManglik ? '⚠️ YES — Manglik' : '✅ NOT Manglik'}
                </div>
                {isManglik && severity && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: `${severityColor}20`, border: `1px solid ${severityColor}60` }}>
                    <span className="text-xs uppercase tracking-wide" style={{ color: severityColor }}>Severity:</span>
                    <span className="font-bold" style={{ color: severityColor }}>{severity}</span>
                  </div>
                )}
                {!isManglik && (
                  <p className="text-sm text-slate-300 mt-3 italic">"Mars is favorably placed in your chart. No Manglik Dosh active."</p>
                )}
              </div>

              {/* MARS POSITION */}
              {isManglik && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🔴 Mangal (Mars) Position</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <DetailCell icon="🏠" label="House" value={marsHouse ? `${marsHouse}${marsHouse === 1 ? 'st' : marsHouse === 2 ? 'nd' : marsHouse === 3 ? 'rd' : 'th'} Bhava` : null} />
                    <DetailCell icon="♈" label="Rashi" value={marsSign} />
                    <DetailCell icon="📐" label="Degree" value={marsLongitude !== null ? `${marsLongitude.toFixed(2)}°` : null} />
                    <DetailCell icon="⚠️" label="Severity" value={severity} />
                  </div>

                  {houseDetails && (
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                      <div className="font-bold mb-1" style={{ color: '#FCA5A5' }}>
                        {houseDetails.name} — {houseDetails.sanskrit}
                      </div>
                      <p className="text-sm text-slate-300">{houseDetails.effect}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 6 MANGLIK HOUSES */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📍 6 Manglik Houses (Parashar BPHS)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {affectedHouses.map((houseNum: number) => {
                    const house = MANGLIK_HOUSES[houseNum];
                    if (!house) return null;
                    const isActive = isManglik && marsHouse === houseNum;
                    return (
                      <div key={houseNum} className="p-3 rounded-xl" style={{
                        background: isActive ? `rgba(239,68,68,0.15)` : 'rgba(2,8,23,0.4)',
                        border: `1px solid ${isActive ? '#FCA5A5' : GOLD_RGBA(0.15)}`,
                      }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-bold text-sm" style={{ color: isActive ? '#FCA5A5' : GOLD }}>
                            {house.name} ({house.sanskrit})
                          </div>
                          {isActive && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#FCA5A5', color: '#080B12', fontWeight: 700 }}>YOUR MARS</span>}
                        </div>
                        <p className="text-xs text-slate-400">{house.effect}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CANCELLATION CONDITIONS */}
              {isManglik && cancellations.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h3 className="text-xl font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ Active Cancellation Conditions</h3>
                  <p className="text-sm text-slate-400 mb-4">Per Parashar BPHS, ye conditions aapke Manglik Dosh ko reduce/cancel karte hain:</p>
                  <ul className="space-y-2">
                    {cancellations.map((c: any, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-300">
                        <span className="text-green-400 flex-shrink-0">✓</span>
                        <span>{typeof c === 'string' ? c : c.description || c.condition || JSON.stringify(c)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isManglik && cancellations.length === 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)' }}>
                  <h3 className="text-xl font-serif font-bold mb-3" style={{ color: '#FBBF24' }}>⚠️ No Automatic Cancellation</h3>
                  <p className="text-sm text-slate-300">Aapke chart mein automatic Manglik cancellation rules apply nahi ho rahe. Marriage compatibility ke liye:</p>
                  <ul className="space-y-2 mt-3 text-sm text-slate-300">
                    <li className="flex gap-2"><span className="text-yellow-400">•</span><span>Partner ka chart bhi check karein — agar partner bhi Manglik ho toh dosh cancel ho jata hai</span></li>
                    <li className="flex gap-2"><span className="text-yellow-400">•</span><span>Kumbh Vivah ritual perform karein before marriage</span></li>
                    <li className="flex gap-2"><span className="text-yellow-400">•</span><span>Niche remedies follow karein consistently</span></li>
                  </ul>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Manglik Dosh Kya Hota Hai? — Mangal Ki Sthiti Ka Jyotish Vishleshan</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Manglik Dosh</strong> (also known as Mangal Dosha, Kuja Dosha, or Bhauma Dosha) Vedic Jyotish ka woh dosha hai jo Mangal (Mars) ki kundali mein specific houses mein sthiti se banta hai. Maharishi Parashar ne <em>BPHS</em> mein bataya hai ki jab Mars 1st, 2nd, 4th, 7th, 8th, ya 12th house mein ho — Manglik Dosh utpann hota hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Yeh dosha mukhya roop se <strong style={{ color: GOLD }}>marriage compatibility, spouse health, aur marital harmony</strong> ko affect karta hai. Modern Vedic Jyotish mein Manglik Dosh check kundali matching ka essential part hai — agar non-Manglik se Manglik ki shadi ho toh proper cancellation rules ya remedies follow karne padte hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Mars Ki 6 Manglik Houses — Detailed Effects</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>1st House (Lagna):</strong> Mars yahan = aggressive personality, dominant nature. Marriage mein control issues. Severity = Medium.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>2nd House (Dhana):</strong> Mars yahan = harsh speech, family discord. Wealth volatility. Severity = Low.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>4th House (Sukha):</strong> Mars yahan = domestic tensions, mother's health, peace disturbed. Severity = Medium.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>7th House (Kalatra):</strong> Mars yahan = STRONGEST Manglik effect. Marital conflict, spouse health, partnership tension. Severity = High.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>8th House (Ayur):</strong> Mars yahan = sudden challenges, accident risk to spouse, in-laws issues. Severity = High.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>12th House (Vyaya):</strong> Mars yahan = marital intimacy issues, expenses, foreign separations. Severity = Low.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Manglik Dosh Cancellation Rules (Parashar BPHS)</h2>
            <ol className="text-slate-300 leading-relaxed mb-4 space-y-2 list-decimal pl-5">
              <li><strong style={{ color: GOLD }}>Both Manglik Rule:</strong> Agar dono partners Manglik hain — dosh apne aap cancel ho jata hai.</li>
              <li><strong style={{ color: GOLD }}>Mars in Own Sign:</strong> Mangal Mesha ya Vrishchika mein ho — dosh weakens.</li>
              <li><strong style={{ color: GOLD }}>Mars in Exaltation:</strong> Mangal Makara (Capricorn) mein ho — dosh nullifies.</li>
              <li><strong style={{ color: GOLD }}>Jupiter/Moon Aspect:</strong> Strong Jupiter ya Moon ka aspect ho Mars pe — dosh reduces.</li>
              <li><strong style={{ color: GOLD }}>Age After 28:</strong> 28 saal ke baad Manglik effect significantly minimal ho jata hai per classical texts.</li>
              <li><strong style={{ color: GOLD }}>Kumbh Vivah:</strong> Marriage with pot/banana tree ritual — Vedic remedy for strong Manglik.</li>
            </ol>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Manglik Dosh Ke 7 Powerful Remedies</h2>
            <ol className="text-slate-300 leading-relaxed mb-4 space-y-2 list-decimal pl-5">
              <li><strong style={{ color: GOLD }}>Mangal Mantra:</strong> "Om Mangalaya Namah" 108 times daily, especially Tuesday morning.</li>
              <li><strong style={{ color: GOLD }}>Hanuman Chalisa:</strong> Daily path — Hanuman ji Mars ke malik aur Manglik dosha ke counter karak.</li>
              <li><strong style={{ color: GOLD }}>Moonga (Red Coral):</strong> Mars gemstone, copper finger ring — only after expert consultation.</li>
              <li><strong style={{ color: GOLD }}>Mangal Daan:</strong> Red lentils (masoor dal), jaggery (gud), red cloth, copper utensils on Tuesday.</li>
              <li><strong style={{ color: GOLD }}>Kumbh Vivah:</strong> For strong Manglik before marriage — symbolic marriage with pot/peepal tree.</li>
              <li><strong style={{ color: GOLD }}>Tuesday Vrat:</strong> Fasting on Tuesdays with restraint and Hanuman worship.</li>
              <li><strong style={{ color: GOLD }}>Anger Management:</strong> Mars rules aggression — yoga, meditation, peaceful environment.</li>
            </ol>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk Manglik Calculator</h2>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Severity (High/Med/Low)</td><td className="p-3" style={{ color: GOLD }}>✓ Auto-detected</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Mars House + Sign + Degree</td><td className="p-3" style={{ color: GOLD }}>✓ All shown</td><td className="p-3 text-slate-500">✗ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Cancellation Auto-Check</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">House Effect Explanation</td><td className="p-3" style={{ color: GOLD }}>✓ Detailed</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Manglik Dosh Calculator</h2>
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
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Check' },
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
