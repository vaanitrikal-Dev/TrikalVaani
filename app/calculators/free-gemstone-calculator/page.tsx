'use client';

// ============================================================
// File: app/calculators/free-gemstone-calculator/page.tsx
// Version: v1.1 — Free Gemstone (Ratna) Calculator
//   v1.1: BRIDGE to the new Gemstone Suitability Calculator —
//         result now carries a prominent "is this safe?" banner +
//         CTA, Life Stone overclaim softened, related grid + 1 FAQ
//         added. Resolves the contradiction between this (Lagna-swami
//         overview) and the deep 8-niyam suitability engine.
// API: /api/calc/kundali (calcType: 'gemstone') — already live
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const ORG_ID = 'https://trikalvaani.com/#organization';
const WEBSITE_ID = 'https://trikalvaani.com/#website';
const AUTHOR_ID = 'https://trikalvaani.com/#rohiit-gupta';
const REAL_SAMEAS = [
  'https://www.instagram.com/thetrikalvaani',
  'https://www.youtube.com/@TheTrikalVaani',
  'https://www.facebook.com/people/Trikal-Vaani-Voice',
];

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

interface GemInfo {
  stone: string; hi: string; planet_hi: string;
  metal: string; finger: string; day: string; mantra: string;
  caution: 'low' | 'medium' | 'high';
}

const GEM: Record<string, GemInfo> = {
  Sun:     { stone: 'Ruby',           hi: 'माणिक',    planet_hi: 'सूर्य', metal: 'Gold / Copper',        finger: 'Ring finger',   day: 'Sunday (at sunrise)',   mantra: 'ॐ सूर्याय नमः',       caution: 'low' },
  Moon:    { stone: 'Pearl',          hi: 'मोती',     planet_hi: 'चंद्र', metal: 'Silver',               finger: 'Little finger', day: 'Monday (evening)',      mantra: 'ॐ चंद्राय नमः',       caution: 'low' },
  Mars:    { stone: 'Red Coral',      hi: 'मूंगा',    planet_hi: 'मंगल', metal: 'Gold / Copper',        finger: 'Ring finger',   day: 'Tuesday (morning)',     mantra: 'ॐ अं अंगारकाय नमः',   caution: 'low' },
  Mercury: { stone: 'Emerald',        hi: 'पन्ना',    planet_hi: 'बुध',  metal: 'Gold',                 finger: 'Little finger', day: 'Wednesday (morning)',   mantra: 'ॐ बुं बुधाय नमः',     caution: 'low' },
  Jupiter: { stone: 'Yellow Sapphire',hi: 'पुखराज',   planet_hi: 'गुरु', metal: 'Gold',                 finger: 'Index finger',  day: 'Thursday (morning)',    mantra: 'ॐ गुं गुरवे नमः',     caution: 'low' },
  Venus:   { stone: 'Diamond',        hi: 'हीरा',     planet_hi: 'शुक्र', metal: 'Silver / Platinum',    finger: 'Middle finger', day: 'Friday (morning)',      mantra: 'ॐ शुं शुक्राय नमः',   caution: 'medium' },
  Saturn:  { stone: 'Blue Sapphire',  hi: 'नीलम',     planet_hi: 'शनि',  metal: 'Silver / Panchdhatu',  finger: 'Middle finger', day: 'Saturday (evening)',    mantra: 'ॐ शं शनैश्चराय नमः',  caution: 'high' },
  Rahu:    { stone: 'Hessonite',      hi: 'गोमेद',    planet_hi: 'राहु', metal: 'Silver',               finger: 'Middle finger', day: 'Saturday (evening)',    mantra: 'ॐ रां राहवे नमः',     caution: 'high' },
  Ketu:    { stone: "Cat's Eye",      hi: 'लहसुनिया', planet_hi: 'केतु', metal: 'Silver',               finger: 'Ring finger',   day: 'Thursday (evening)',    mantra: 'ॐ कें केतवे नमः',     caution: 'high' },
};

const PLANET_ALIASES: Record<string, string> = {
  sun: 'Sun', surya: 'Sun',
  moon: 'Moon', chandra: 'Moon', chandrama: 'Moon',
  mars: 'Mars', mangal: 'Mars', kuja: 'Mars',
  mercury: 'Mercury', budh: 'Mercury', budha: 'Mercury',
  jupiter: 'Jupiter', guru: 'Jupiter', brihaspati: 'Jupiter', brhaspati: 'Jupiter',
  venus: 'Venus', shukra: 'Venus', shukr: 'Venus',
  saturn: 'Saturn', shani: 'Saturn', shanaishchara: 'Saturn',
  rahu: 'Rahu',
  ketu: 'Ketu',
};

function resolvePlanet(name?: string | null): string | null {
  if (!name) return null;
  const n = String(name).toLowerCase().replace(/[^a-z]/g, '');
  if (GEM[name as string]) return name as string;
  return PLANET_ALIASES[n] || null;
}

const CAUTION_TEXT: Record<string, string> = {
  low: 'Generally shubh ratna — fir bhi original, certified stone aur expert salaah behtar.',
  medium: 'Pehnane se pehle thode din trial karein; original certified stone hi lein.',
  high: 'Strong ratna — bina jaankaar astrologer ki salaah ke NA pehnein. 3 din ka trial zaroori. Galat dharan haani kar sakta hai.',
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
  { q: 'Mera lucky gemstone (ratna) kaunsa hai?', a: 'Aapka mukhya "Life Stone" aapke Lagna (ascendant) ke swami graha ka ratna hota hai. Trikaal Vaani Swiss Ephemeris se aapka lagna aur lagna-swami nikaalta hai, phir uska ratna (jaise Lagna swami Guru ho to Pukhraj) batata hai — saath mein metal, ungli, din aur mantra.' },
  { q: 'Is calculator aur "Gemstone Suitability Calculator" mein kya farak hai?', a: 'Yeh calculator aapka mukhya Life Stone (Lagna-swami ka ratna) batata hai — ek quick overview. Gemstone Suitability Calculator usse aage jaakar har ratna ko 0–100 score deta hai: functional benefic/malefic, Shadbala, dushthana (8th lord), combustion aur risk check karke batata hai ki konsa ratna aapke liye safe hai ya avoid karein. Ratna pehnne se pehle suitability calculator zaroor use karein.' },
  { q: 'Life Stone (Lagna Ratna) kya hota hai?', a: 'Life Stone aapke Lagna ke swami graha ka ratna hai — aam taur par yeh sabse mukhya sujhav mana jaata hai kyunki yeh aapke lagna (self, vyaktitva, swasthya) ko balshali karta hai. Phir bhi, pehnne se pehle suitability (functional nature, bal, dushthana, combustion) check karna zaroori hai.' },
  { q: 'Konsa ratna kis graha ka hai?', a: 'Surya–Manik (Ruby), Chandra–Moti (Pearl), Mangal–Moonga (Red Coral), Budh–Panna (Emerald), Guru–Pukhraj (Yellow Sapphire), Shukra–Heera (Diamond), Shani–Neelam (Blue Sapphire), Rahu–Gomed (Hessonite), Ketu–Lehsunia (Cat\'s Eye).' },
  { q: 'Kya Neelam (Blue Sapphire) pehnana safe hai?', a: 'Neelam (Shani), Gomed (Rahu) aur Lehsunia (Ketu) bahut "strong" ratna hain — yeh bina jaankaar astrologer ki salaah ke nahi pehne jaate, aur 3 din ka trial zaroori hai. Galat dharan haani kar sakta hai. Apne liye check karne ke liye Gemstone Suitability Calculator use karein.' },
  { q: 'Gemstone kaise pehnein — metal, ungli, din?', a: 'Har ratna ka apna metal (jaise Pukhraj-sona), ungli (Pukhraj-tarjani/index), aur din (Pukhraj-guruvar) hota hai. Shukla paksha mein, us graha ke din, subah snan ke baad, ratna ko doodh/gangajal se shuddh karke, mantra jaap ke saath dharan karte hain. Calculator aapko aapke ratna ke ye details deta hai.' },
  { q: 'Kitne carat / ratti ka ratna pehnein?', a: 'Aam taur par body-weight aur ratna ke hisaab se ~1 ratti per 10-12 kg (motbhed hai) sujhaya jaata hai, par sahi weight individual chart par nirbhar karta hai. Original, certified (lab-tested), bina daag wala stone hi lein, aur weight expert se confirm karein.' },
  { q: 'Kya ye Gemstone Calculator free hai?', a: 'Haan, 100% free. Aapka Lagna, Lagna swami, Life Stone, current mahadasha ka ratna, metal/ungli/din/mantra aur caution — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) se Lahiri Ayanamsha ke saath aapka lagna aur graha positions exact nikaalta hai — 99.9% astronomical accuracy. Yeh page Lagna-swami aadharit overview deta hai; deep suitability ke liye Gemstone Suitability Calculator use karein.' },
];

export default function FreeGemstoneCalculatorPage() {
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
          calcType: 'gemstone',
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

  const lagna: string | null = result?.instant?.lagna || null;
  const lagnaLordRaw: string | null = result?.instant?.lagna_lord || null;
  const mahadashaRaw: string | null = result?.dasha?.mahadasha || result?.instant?.current_dasha || null;

  const lagnaLord = resolvePlanet(lagnaLordRaw);
  const mahaLord = resolvePlanet(mahadashaRaw);
  const lifeGem = lagnaLord ? GEM[lagnaLord] : null;
  const periodGem = mahaLord ? GEM[mahaLord] : null;
  const samePlanet = lagnaLord && mahaLord && lagnaLord === mahaLord;
  const anyHighCaution = (lifeGem?.caution === 'high') || (periodGem?.caution === 'high' && !samePlanet);

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  const PAGE_URL = 'https://trikalvaani.com/calculators/free-gemstone-calculator';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': ORG_ID, name: 'Trikaal Vaani', legalName: 'Trikal Vaani', url: 'https://trikalvaani.com', sameAs: REAL_SAMEAS },
      { '@type': 'WebSite', '@id': WEBSITE_ID, name: 'Trikaal Vaani', url: 'https://trikalvaani.com', publisher: { '@id': ORG_ID }, inLanguage: 'en-IN' },
      { '@type': 'Person', '@id': AUTHOR_ID, name: 'Rohiit Gupta', url: 'https://trikalvaani.com', jobTitle: 'Chief Vedic Architect', worksFor: { '@id': ORG_ID },
        knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Gemstone Astrology (Ratna Vigyan)', 'Kundali Analysis', 'Lal Kitab'] },
      { '@type': 'WebPage', '@id': `${PAGE_URL}#webpage`, url: PAGE_URL,
        name: 'Free Gemstone Calculator — Your Lucky Ratna by Date of Birth',
        description: 'Find your lucky gemstone (life stone) based on your ascendant lord, with metal, finger, day and mantra to wear it. Free Vedic Ratna calculator by Trikaal Vaani.',
        inLanguage: 'en-IN', dateModified: '2026-06-17', isPartOf: { '@id': WEBSITE_ID }, author: { '@id': AUTHOR_ID }, publisher: { '@id': ORG_ID },
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
        about: [{ '@type': 'Thing', name: 'Gemstone Astrology' }, { '@type': 'Thing', name: 'Yellow Sapphire' }, { '@type': 'Thing', name: 'Ascendant Lord' }],
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.tv-aeo-answer'] } },
      { '@type': 'BreadcrumbList', '@id': `${PAGE_URL}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
        { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
        { '@type': 'ListItem', position: 3, name: 'Free Gemstone Calculator', item: PAGE_URL },
      ] },
      { '@type': 'WebApplication', '@id': `${PAGE_URL}#app`, name: 'Free Gemstone (Ratna) Calculator', url: PAGE_URL,
        applicationCategory: 'LifestyleApplication', operatingSystem: 'All', browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, provider: { '@id': ORG_ID },
        featureList: 'Life stone by ascendant lord, mahadasha gemstone, metal, finger, day & mantra' },
      { '@type': 'HowTo', '@id': `${PAGE_URL}#howto`, name: 'How to find your lucky gemstone by date of birth',
        description: 'Find your Vedic life gemstone using your birth details and ascendant lord.', totalTime: 'PT1M',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Enter birth details', text: 'Enter your full name, date of birth, exact time of birth and place of birth.' },
          { '@type': 'HowToStep', position: 2, name: 'Calculate the chart', text: 'The calculator computes your ascendant (lagna) and its ruling planet using Swiss Ephemeris with Lahiri Ayanamsha.' },
          { '@type': 'HowToStep', position: 3, name: 'Get your gemstone', text: 'See your life gemstone (the ascendant lord\'s stone) along with the metal, finger, day and mantra recommended to wear it.' },
        ] },
      { '@type': 'FAQPage', '@id': `${PAGE_URL}#faq`, mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

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
            <span style={{ color: GOLD }}>Free Gemstone Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Gemstone Calculator — Your Lucky Ratna by Date of Birth
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              Aapka mukhya <strong style={{ color: GOLD }}>"Life Stone"</strong> aapke <strong style={{ color: GOLD }}>Lagna (ascendant) ke swami graha</strong> ka ratna hota hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Gemstone Calculator</strong> Swiss Ephemeris se aapka lagna aur lagna-swami nikaalkar aapka lucky ratna batata hai — saath mein metal, ungli, din, mantra aur zaroori savdhaani. Bilkul free.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Lagna-Swami + Mahadasha · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Lucky Gemstone (Free)</h2>
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
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Life Stone Lagna par nirbhar hai — Lagna sahi tabhi aata hai jab exact birth time ho.</p>
                  : <p className="text-slate-500 text-xs mt-1">Lagna (ascendant) ke liye exact time zaroori hai.</p>}
                {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Gender <span className="text-slate-500 text-xs ml-1">(optional)</span></label>
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
                {loading ? '⟳ Finding Your Ratna...' : '💎 Find My Lucky Gemstone'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Lagna-Swami + Mahadasha</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* CONTEXT */}
              <div className="rounded-xl p-4 text-center text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <span className="text-slate-400">Lagna: </span><span style={{ color: GOLD }} className="font-semibold">{lagna || '—'}</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-slate-400">Lagna Swami: </span><span style={{ color: GOLD }} className="font-semibold">{lagnaLordRaw || '—'}</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-slate-400">Mahadasha: </span><span style={{ color: GOLD }} className="font-semibold">{mahadashaRaw || '—'}</span>
              </div>

              {/* LIFE STONE */}
              {lifeGem ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.4)}` }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Your Life Stone (Lagna Ratna)</div>
                  <div className="text-5xl mb-2">💎</div>
                  <div className="text-3xl md:text-4xl font-serif font-bold mb-1" style={{ color: GOLD }}>{lifeGem.stone} <span className="text-2xl text-slate-300">({lifeGem.hi})</span></div>
                  <div className="text-sm text-slate-300">Lagna swami <strong style={{ color: GOLD }}>{lagnaLordRaw} ({lifeGem.planet_hi})</strong> ka ratna — aam taur par sabse mukhya sujhav. <span style={{ color: '#fbbf24' }}>Pehnne se pehle suitability zaroor check karein.</span></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-left">
                    <DetailCell icon="🔗" label="Metal" value={lifeGem.metal} />
                    <DetailCell icon="✋" label="Finger" value={lifeGem.finger} />
                    <DetailCell icon="📅" label="Day" value={lifeGem.day} />
                    <DetailCell icon="🕉️" label="Mantra" value={lifeGem.mantra} />
                  </div>
                  <div className="mt-4 text-xs rounded-lg p-3 text-left" style={{ background: lifeGem.caution === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${lifeGem.caution === 'high' ? 'rgba(239,68,68,0.3)' : GOLD_RGBA(0.15)}`, color: lifeGem.caution === 'high' ? '#FCA5A5' : '#94a3b8' }}>
                    {lifeGem.caution === 'high' ? '⚠️ ' : 'ℹ️ '}{CAUTION_TEXT[lifeGem.caution]}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Lagna swami resolve nahi ho paya — exact birth time ke saath try karein.</p>
                </div>
              )}

              {/* BRIDGE → Gemstone Suitability Calculator (resolves the "is it safe?" gap) */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)' }}>
                <p className="text-sm text-amber-200/90 mb-1">⚠️ Yeh sujhav sirf aapke <strong>Lagna-swami</strong> par aadharit hai — yeh nahi batata ki yeh ratna aapke liye <strong>safe</strong> hai ya nahi.</p>
                <p className="text-sm text-slate-300 mb-3">Kya aapko yeh ratna <strong>pehnna chahiye</strong>? Functional benefic/malefic, dushthana (8th lord), combustion aur risk — sab 0–100 score ke saath check karein:</p>
                <Link href="/calculators/free-gemstone-suitability-calculator"
                  className="inline-block px-6 py-3 rounded-xl font-bold text-sm"
                  style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.85) 0%,${GOLD} 100%)`, color: '#080B12' }}>
                  💠 Check Gemstone Suitability (0–100) →
                </Link>
              </div>

              {/* PERIOD STONE */}
              {periodGem && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>
                    {samePlanet ? '✨ Bonus: Yahi ratna aapke current period ke liye bhi' : '⏳ Current Period Stone (Mahadasha Ratna)'}
                  </h3>
                  {samePlanet ? (
                    <p className="text-sm text-slate-300">Sanyog se aapki current Mahadasha bhi <strong style={{ color: GOLD }}>{mahadashaRaw}</strong> ki hai — yani <strong style={{ color: GOLD }}>{periodGem.stone} ({periodGem.hi})</strong> aapke Life Stone aur current period dono ke liye sujhaya jaata hai. 💎</p>
                  ) : (
                    <>
                      <p className="text-sm text-slate-300 mb-3">
                        Abhi aapki <strong style={{ color: GOLD }}>{mahadashaRaw} Mahadasha</strong> chal rahi hai. Iska sambandhit ratna <strong style={{ color: GOLD }}>{periodGem.stone} ({periodGem.hi})</strong> hai — yeh chalti dasha ke liye sujhaya jaata hai.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <DetailCell icon="🔗" label="Metal" value={periodGem.metal} />
                        <DetailCell icon="✋" label="Finger" value={periodGem.finger} />
                        <DetailCell icon="📅" label="Day" value={periodGem.day} />
                        <DetailCell icon="🕉️" label="Mantra" value={periodGem.mantra} />
                      </div>
                      <div className="mt-3 text-xs rounded-lg p-3" style={{ background: periodGem.caution === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${periodGem.caution === 'high' ? 'rgba(239,68,68,0.3)' : GOLD_RGBA(0.15)}`, color: periodGem.caution === 'high' ? '#FCA5A5' : '#94a3b8' }}>
                        {periodGem.caution === 'high' ? '⚠️ ' : 'ℹ️ '}{CAUTION_TEXT[periodGem.caution]} Mahadasha ratna pehnane se pehle apni poori kundali expert se confirm karein — kyunki dasha swami har kundali mein shubh ho, zaroori nahi.
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* GLOBAL CAUTION */}
              {anyHighCaution && (
                <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                  ⚠️ <strong>Mahatvapurna:</strong> Aapke sujhav mein ek "strong" ratna (Neelam/Gomed/Lehsunia) hai. Aise ratna kabhi bhi bina jaankaar astrologer ki salaah aur 3-din trial ke nahi pehne jaate. Pehle Gemstone Suitability Calculator se check karein.
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Poori kundali ke aadhar par personalized ratna-paramarsh chahiye?</p>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Lucky Gemstone Kaise Chuna Jaata Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic Jyotish mein sabse mukhya ratna <strong style={{ color: GOLD }}>Life Stone (Lagna Ratna)</strong> hota hai — yeh aapke <strong>Lagna (ascendant) ke swami graha</strong> ka ratna hai. Kyunki Lagna self, swasthya aur poore jeevan ka aadhar hai, iska swami balshali hone par poori kundali ko sahara milta hai. Isliye Lagna swami ka ratna aam taur par sabse mukhya sujhav mana jaata hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Lekin sirf Lagna-swami kaafi nahi. Wo graha aapke liye <strong>functional benefic hai ya malefic</strong>, kisi <strong>dushthana (6/8/12)</strong> ka swami toh nahi, <strong>combust</strong> toh nahi — yeh sab dekhna zaroori hai. Isi liye ratna pehnne se pehle hamare <Link href="/calculators/free-gemstone-suitability-calculator" style={{ color: GOLD }}>Gemstone Suitability Calculator</Link> se poora 0–100 suitability check karein.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Navagraha — Ratna Table</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Graha</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Ratna</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Metal</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Finger / Day</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {Object.entries(GEM).map(([planet, g]) => (
                    <tr key={planet} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td className="p-3">{planet} ({g.planet_hi})</td>
                      <td className="p-3 font-semibold" style={{ color: GOLD }}>{g.stone} ({g.hi}){g.caution === 'high' ? ' ⚠️' : ''}</td>
                      <td className="p-3">{g.metal}</td>
                      <td className="p-3">{g.finger} · {g.day.split(' ')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-slate-500 mt-2">⚠️ = Strong ratna — expert salaah ke bina na pehnein.</p>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Ratna Dharan Vidhi (How to Wear)</h2>
            <ol className="text-slate-300 leading-relaxed mb-4 space-y-2 list-decimal pl-5">
              <li>Original, certified (lab-tested), bina daag-dhabbe wala ratna lein.</li>
              <li>Sahi metal (sona/chandi) mein, sahi ungli ke liye banwayein.</li>
              <li>Us graha ke din, Shukla paksha mein, subah snan ke baad.</li>
              <li>Ratna ko kachche doodh + Gangajal se shuddh karein.</li>
              <li>Graha mantra 108 baar jaap karke dharan karein.</li>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Basis</td><td className="p-3">Lagna swami + Suitability engine</td><td className="p-3 text-slate-500">Sun-sign / generic</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Safety Caution</td><td className="p-3" style={{ color: GOLD }}>✓ Strong-stone warnings</td><td className="p-3 text-slate-500">✗ Often missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Wearing Method</td><td className="p-3" style={{ color: GOLD }}>✓ Metal/finger/day/mantra</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Price</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid / upsell</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Gemstone / Ratna</h2>
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
                { slug: 'free-gemstone-suitability-calculator', name: 'Gemstone Suitability' },
                { slug: 'free-should-i-wear-neelam', name: 'Should I Wear Neelam?' },
                { slug: 'free-should-i-wear-pukhraj', name: 'Should I Wear Pukhraj?' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
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
