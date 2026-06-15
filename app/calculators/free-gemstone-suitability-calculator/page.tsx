'use client';

// ============================================================
// File: app/calculators/free-gemstone-suitability-calculator/page.tsx
// Version: v1.0 — Gemstone Suitability Engine (0–100 score, all 9 ratna)
// API: /api/calc/kundali (calcType: 'gemstone') — already live
//
// ENGINE (client-side, ported from tested v1 spec):
//   GATE first (functional benefic/malefic by Lagna) → then 9-step score.
//   Strength = shadbala.ratio (inverted: weak benefic scores higher).
//   Dignity  = shadbala.classification ('dignity' field is null).
//   Strong stones (Neelam/Gomed/Lehsunia) cap at Expert Review.
//
// ⭐ GOLD-STANDARD SEO/GEO/AEO/EEAT: full @graph + direct-answer block.
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
const PAGE_URL = 'https://trikalvaani.com/calculators/free-gemstone-suitability-calculator';

// ────────────────────────────────────────────────────────────
// ENGINE
// ────────────────────────────────────────────────────────────
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const SIGN_LORD: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
  Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

interface StoneInfo { en: string; hi: string; planet_hi: string; risk: number; metal: string; finger: string; day: string; mantra: string; }
const STONE: Record<string, StoneInfo> = {
  Sun:     { en: 'Ruby',           hi: 'माणिक',    planet_hi: 'सूर्य', risk: 5,  metal: 'Gold / Copper',       finger: 'Ring finger',   day: 'Sunday',    mantra: 'ॐ सूर्याय नमः' },
  Moon:    { en: 'Pearl',          hi: 'मोती',     planet_hi: 'चंद्र', risk: 0,  metal: 'Silver',              finger: 'Little finger', day: 'Monday',    mantra: 'ॐ चंद्राय नमः' },
  Mars:    { en: 'Red Coral',      hi: 'मूंगा',    planet_hi: 'मंगल', risk: 5,  metal: 'Gold / Copper',       finger: 'Ring finger',   day: 'Tuesday',   mantra: 'ॐ अं अंगारकाय नमः' },
  Mercury: { en: 'Emerald',        hi: 'पन्ना',    planet_hi: 'बुध',  risk: 0,  metal: 'Gold',                finger: 'Little finger', day: 'Wednesday', mantra: 'ॐ बुं बुधाय नमः' },
  Jupiter: { en: 'Yellow Sapphire',hi: 'पुखराज',   planet_hi: 'गुरु', risk: 5,  metal: 'Gold',                finger: 'Index finger',  day: 'Thursday',  mantra: 'ॐ गुं गुरवे नमः' },
  Venus:   { en: 'Diamond',        hi: 'हीरा',     planet_hi: 'शुक्र', risk: 5,  metal: 'Silver / Platinum',   finger: 'Middle finger', day: 'Friday',    mantra: 'ॐ शुं शुक्राय नमः' },
  Saturn:  { en: 'Blue Sapphire',  hi: 'नीलम',     planet_hi: 'शनि',  risk: 15, metal: 'Silver / Panchdhatu', finger: 'Middle finger', day: 'Saturday',  mantra: 'ॐ शं शनैश्चराय नमः' },
  Rahu:    { en: 'Hessonite',      hi: 'गोमेद',    planet_hi: 'राहु', risk: 20, metal: 'Silver',              finger: 'Middle finger', day: 'Saturday',  mantra: 'ॐ रां राहवे नमः' },
  Ketu:    { en: "Cat's Eye",      hi: 'लहसुनिया', planet_hi: 'केतु', risk: 20, metal: 'Silver',              finger: 'Ring finger',   day: 'Thursday',  mantra: 'ॐ कें केतवे नमः' },
};

// §3 Functional gate (YK +35, B +25, b +15, N 0, M reject) — all 12 lagnas
const F: Record<string, Record<string, string>> = {
  Aries:      { Sun: 'B', Moon: 'b', Mars: 'B',  Mercury: 'M', Jupiter: 'B', Venus: 'N',  Saturn: 'N' },
  Taurus:     { Sun: 'b', Moon: 'M', Mars: 'M',  Mercury: 'b', Jupiter: 'M', Venus: 'B',  Saturn: 'YK' },
  Gemini:     { Sun: 'M', Moon: 'N', Mars: 'M',  Mercury: 'B', Jupiter: 'M', Venus: 'b',  Saturn: 'b' },
  Cancer:     { Sun: 'N', Moon: 'B', Mars: 'YK', Mercury: 'M', Jupiter: 'b', Venus: 'M',  Saturn: 'M' },
  Leo:        { Sun: 'B', Moon: 'N', Mars: 'YK', Mercury: 'N', Jupiter: 'b', Venus: 'M',  Saturn: 'M' },
  Virgo:      { Sun: 'M', Moon: 'M', Mars: 'M',  Mercury: 'B', Jupiter: 'M', Venus: 'b',  Saturn: 'N' },
  Libra:      { Sun: 'M', Moon: 'b', Mars: 'M',  Mercury: 'b', Jupiter: 'M', Venus: 'B',  Saturn: 'YK' },
  Scorpio:    { Sun: 'B', Moon: 'B', Mars: 'b',  Mercury: 'M', Jupiter: 'b', Venus: 'M',  Saturn: 'N' },
  Sagittarius:{ Sun: 'B', Moon: 'M', Mars: 'b',  Mercury: 'M', Jupiter: 'B', Venus: 'M',  Saturn: 'N' },
  Capricorn:  { Sun: 'M', Moon: 'N', Mars: 'N',  Mercury: 'b', Jupiter: 'M', Venus: 'YK', Saturn: 'B' },
  Aquarius:   { Sun: 'M', Moon: 'M', Mars: 'N',  Mercury: 'b', Jupiter: 'N', Venus: 'YK', Saturn: 'B' },
  Pisces:     { Sun: 'M', Moon: 'B', Mars: 'b',  Mercury: 'M', Jupiter: 'B', Venus: 'M',  Saturn: 'M' },
};
const FSCORE: Record<string, number> = { YK: 35, B: 25, b: 15, N: 0 };

function strengthScore(ratio: number | null): number {
  if (ratio == null) return 0;
  if (ratio < 0.40) return 25;
  if (ratio < 0.60) return 20;
  if (ratio < 0.80) return 12;
  if (ratio < 1.00) return 6;
  return 0;
}
function dignityScore(c?: string | null): { s: number; debil?: boolean } {
  const x = (c || '').toLowerCase();
  if (x.includes('exalt')) return { s: 20 };
  if (x.includes('own') || x.includes('mooltrikona')) return { s: 15 };
  if (x.includes('friend')) return { s: 8 };
  if (x.includes('enemy')) return { s: -8 };
  if (x.includes('debilit')) return { s: -20, debil: true };
  return { s: 0 };
}
function houseScore(h: number): number {
  if ([1, 5, 9, 10, 11].includes(h)) return 15;
  if ([2, 3, 4, 7].includes(h)) return 5;
  if ([6, 8, 12].includes(h)) return -10;
  return 0;
}
const MAL_ASPECTS: Record<string, number[]> = { Sun: [6], Mars: [3, 6, 7], Saturn: [2, 6, 9], Rahu: [4, 6, 8], Ketu: [4, 6, 8] };
function maleficAspectCount(targetHouse: number, planets: any[]): number {
  let n = 0;
  for (const p of planets) {
    const off = MAL_ASPECTS[p.planet];
    if (!off || p.house === targetHouse) continue;
    for (const o of off) { if (((p.house - 1 + o) % 12) + 1 === targetHouse) { n++; break; } }
  }
  return n;
}

type VerdictKey = 'recommended' | 'trial' | 'caution' | 'expert' | 'not' | 'reject';
function verdict(score: number, gate: string, risk: number, debil?: boolean): { key: VerdictKey; label: string } {
  if (gate === 'M') return { key: 'reject', label: 'Aapke Lagna ke liye nahi' };
  let key: VerdictKey;
  if (score >= 70) key = 'recommended';
  else if (score >= 55) key = 'trial';
  else if (score >= 40) key = 'caution';
  else key = 'not';
  const goodness: Record<VerdictKey, number> = { recommended: 3, trial: 2, caution: 1, expert: 1, not: 0, reject: 0 };
  if (risk >= 15 && goodness[key] > 1) key = 'expert';       // strong-stone safety cap
  if (debil && goodness[key] > 2) key = 'trial';             // debilitation amplification cap
  if (gate === 'N' && goodness[key] > 2) key = 'trial';      // neutral ceiling
  const label: Record<VerdictKey, string> = {
    recommended: 'Recommended — Shubh', trial: 'Trial First (3 din)',
    caution: 'Caution — Expert Review', expert: 'Expert Review Zaroori',
    not: 'Not Recommended', reject: 'Aapke Lagna ke liye nahi',
  };
  return { key, label: label[key] };
}

interface StoneResult {
  graha: string; stone_en: string; stone_hi: string; planet_hi: string;
  gate: string; score: number; risk: number; riskLabel: string;
  verdictKey: VerdictKey; verdictLabel: string; flags: string[]; info: StoneInfo;
}
function runEngine(data: any): { lagna: string; lagnaLord: string; MD: string; AD: string; stones: StoneResult[] } | null {
  const lagna = data?.instant?.lagna_en;
  if (!lagna || SIGNS.indexOf(lagna) === -1) return null;
  const li = SIGNS.indexOf(lagna);
  const lord9 = SIGN_LORD[SIGNS[(li + 8) % 12]];
  const lord10 = SIGN_LORD[SIGNS[(li + 9) % 12]];
  const MD = data?.instant?.current_dasha;
  const AD = data?.instant?.current_antardasha;
  const planets: any[] = data?.planets || [];
  const rahu = planets.find((p) => p.planet === 'Rahu');
  const ketu = planets.find((p) => p.planet === 'Ketu');

  const stones: StoneResult[] = [];
  for (const graha of Object.keys(STONE)) {
    const p = planets.find((x) => x.planet === graha);
    if (!p) continue;
    const isNode = graha === 'Rahu' || graha === 'Ketu';
    const gate = isNode ? 'N' : F[lagna][graha];
    const flags: string[] = [];
    let score = 0;
    score += isNode ? 0 : (FSCORE[gate] ?? 0);                          // S1
    const ratio = p.shadbala?.ratio ?? null;
    score += strengthScore(ratio);                                      // S2
    const dg = dignityScore(p.shadbala?.classification);                // S3
    score += dg.s; if (dg.debil) flags.push('debilitated');
    score += houseScore(p.house);                                       // S4
    if (!isNode) {                                                      // S5
      if (rahu && p.sign === rahu.sign) { score -= 10; flags.push('Rahu-conjunct'); }
      if (ketu && p.sign === ketu.sign) { score -= 10; flags.push('Ketu-conjunct'); }
    }
    if (maleficAspectCount(p.house, planets) >= 2) { score -= 10; flags.push('malefic aspects'); }
    if (graha === MD) { score += 10; flags.push('Mahadasha'); }         // S6
    if (graha === AD) { score += 5; flags.push('Antardasha'); }
    if (graha === lord9 || graha === lord10) { score += 10; flags.push('Dharma-Karma lord'); } // S7
    score -= STONE[graha].risk;                                         // S8
    // S9 user-experience handled in UI layer (default 0)
    if (gate === 'M') score = Math.min(score, 25);
    score = Math.max(0, Math.min(100, Math.round(score)));
    const v = verdict(score, gate, STONE[graha].risk, dg.debil);
    stones.push({
      graha, stone_en: STONE[graha].en, stone_hi: STONE[graha].hi, planet_hi: STONE[graha].planet_hi,
      gate, score, risk: STONE[graha].risk,
      riskLabel: STONE[graha].risk >= 20 ? 'Very High' : STONE[graha].risk >= 15 ? 'High' : 'Low',
      verdictKey: v.key, verdictLabel: v.label, flags, info: STONE[graha],
    });
  }
  stones.sort((a, b) => b.score - a.score);
  return { lagna, lagnaLord: SIGN_LORD[lagna], MD, AD, stones };
}

const VERDICT_COLOR: Record<VerdictKey, { c: string; bg: string }> = {
  recommended: { c: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  trial:       { c: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  caution:     { c: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  expert:      { c: '#f97316', bg: 'rgba(249,115,22,0.14)' },
  not:         { c: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
  reject:      { c: '#94a3b8', bg: 'rgba(148,163,184,0.10)' },
};

// ────────────────────────────────────────────────────────────
// Google Maps via /api/maps-proxy
// ────────────────────────────────────────────────────────────
interface PlaceSuggestion { place_id: string; description: string; main_text: string; secondary_text: string; }
async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent('https://places.googleapis.com/v1/places:autocomplete')}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: query, includedPrimaryTypes: ['locality', 'administrative_area_level_3'], languageCode: 'en' }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? []).filter((s: any) => s.placePrediction).map((s: any) => ({
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
    const lat = data.location?.latitude ?? null, lng = data.location?.longitude ?? null;
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
  id: string; value: string; error?: string;
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void;
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
    debounceRef.current = setTimeout(async () => { setLoading(true); setSuggestions(await fetchPlaceSuggestions(val)); setLoading(false); }, 400);
  };
  const handleSelect = async (s: PlaceSuggestion) => {
    setQuery(s.main_text); setSuggestions([]); setSelected(true); setLoading(true);
    const details = await fetchPlaceDetails(s.place_id);
    if (details) { const tz = await fetchTimezone(details.lat, details.lng); onSelect(details.city || s.main_text, details.lat, details.lng, tz); }
    setLoading(false);
  };
  return (
    <div className="relative">
      <div className="relative">
        <input id={id} type="search" autoComplete="off" placeholder="Type city of birth..."
          value={query} onChange={(e) => handleChange(e.target.value)}
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
              onMouseEnter={(e) => (e.currentTarget.style.background = GOLD_RGBA(0.08))}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
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

// ────────────────────────────────────────────────────────────
// FAQ (AEO — high-intent extractable answers)
// ────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Gemstone suitability score kaise nikalta hai?', a: 'Trikaal Vaani har ratna ko 0–100 score deta hai. Sabse pehle dekha jaata hai ki uss graha ka aapke Lagna ke liye functional swabhav (benefic/malefic) kya hai — malefic graha ka ratna reject. Phir uski Shadbala strength, sign dignity, bhaav (house), dasha aur afflictions (Rahu/Ketu yuti, papi drishti) jod-ghata kar final score banta hai, saath mein risk aur verdict.' },
  { q: 'Mera Mahadasha planet ka ratna pehnna sahi hai?', a: 'Zaroori nahi. Aam dharna hai ki current Mahadasha ke graha ka ratna pehno — par yeh tabhi sahi hai jab wo graha aapke Lagna ke liye functional benefic ho. Agar wo functional malefic hai (jaise Virgo lagna ke liye Guru), toh Mahadasha hone par bhi uska ratna (Pukhraj) nuksaandeh ho sakta hai. Isiliye yeh calculator pehle gate check karta hai.' },
  { q: 'Exalted (uccha) planet ka ratna hamesha shubh hota hai?', a: 'Nahi. Exalted hona astronomical dignity hai, par ratna ke liye sabse pehle functional swabhav dekha jaata hai. Ek functional malefic agar exalted bhi ho, toh uska ratna phir bhi suit nahi karta — uska bal aapke jeevan ke galat kshetra ko mazboot kar sakta hai.' },
  { q: 'Kya mujhe Neelam (Blue Sapphire) pehnna chahiye?', a: 'Neelam (Shani) sabse strong ratna hai — yeh tabhi pehna jaata hai jab Shani aapke Lagna ke liye functional benefic ya yogakaraka ho (jaise Taurus, Libra, Capricorn, Aquarius lagna), wo balheen ho aur achhe bhaav mein ho. Galat kundali mein Neelam turant haani kar sakta hai. Isiliye iska verdict hamesha "Expert Review" tak hi seemit rakha gaya hai — 3 din trial zaroori.' },
  { q: 'Strong ratna (Neelam, Gomed, Lehsunia) kab pehnein?', a: 'Yeh teeno bahut shaktishaali hain aur inka asar tez. Inhe kabhi bhi sirf score dekh kar auto-approve nahi kiya jaata — chahe score ucha ho, verdict "Expert Review Zaroori" rehta hai. Poori kundali jaankaar astrologer se confirm karke, 3 din ka trial le kar hi dharan karein.' },
  { q: 'Pehle koi ratna pehna tha jisse nuksaan hua — ab kya?', a: 'Calculator mein aap har ratna ke liye apna purana anubhav bata sakte hain (Excellent / Some / No / Negative). Negative anubhav score ghata deta hai — kyunki aapka vyaktigat anubhav classical niyamon se bhi mahatvapurna hai. Yeh feature lagभग kisi astrology site par nahi hai.' },
  { q: 'Kya yeh Gemstone Suitability Calculator free hai?', a: 'Haan, 100% free. Saare 9 ratna ka suitability score, risk aur verdict bilkul muft — koi upsell nahi.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) se Lahiri Ayanamsha ke saath aapka lagna, graha positions aur Shadbala exact nikaalta hai. Suitability logic classical Jyotish niyamon (functional benefic, Shadbala, dignity, bhaav, dasha) par aadharit hai — sirf sun-sign ya Mahadasha guesswork nahi.' },
];

// ────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────
interface FormData {
  name: string; gender: 'male' | 'female' | 'other' | '';
  date: string; time: string; unknownTime: boolean;
  placeQuery: string; city: string; latitude: number | null; longitude: number | null; timezone: number;
}

export default function GemstoneSuitabilityPage() {
  const [form, setForm] = useState<FormData>({
    name: '', gender: '', date: '', time: '12:00', unknownTime: false,
    placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof runEngine>>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const set = useCallback((key: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour, minute, latitude: form.latitude, longitude: form.longitude, timezone: form.timezone, calcType: 'gemstone' }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Server error'); }
      const data = await res.json();
      const engine = runEngine(data);
      if (!engine) throw new Error('Lagna resolve nahi hua — exact birth time ke saath try karein.');
      setResult(engine);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120', border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark',
  });

  const eligible = result?.stones.filter((s) => ['YK', 'B', 'b'].includes(s.gate) && (s.verdictKey === 'recommended' || s.verdictKey === 'trial')) ?? [];
  const primary = eligible[0] ?? null;
  const lifeStone = result ? result.stones.find((s) => s.graha === result.lagnaLord) ?? null : null;

  // ─── JSON-LD (gold-standard @graph) ───
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': ORG_ID, name: 'Trikaal Vaani', legalName: 'Trikal Vaani', url: 'https://trikalvaani.com', sameAs: REAL_SAMEAS },
      { '@type': 'WebSite', '@id': WEBSITE_ID, name: 'Trikaal Vaani', url: 'https://trikalvaani.com', publisher: { '@id': ORG_ID }, inLanguage: 'en-IN' },
      { '@type': 'Person', '@id': AUTHOR_ID, name: 'Rohiit Gupta', url: 'https://trikalvaani.com', jobTitle: 'Chief Vedic Architect', worksFor: { '@id': ORG_ID },
        knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Gemstone Astrology (Ratna Vigyan)', 'Functional Benefic Analysis', 'Shadbala', 'Kundali Analysis'] },
      { '@type': 'WebPage', '@id': `${PAGE_URL}#webpage`, url: PAGE_URL,
        name: 'Free Gemstone Suitability Calculator — Should You Wear It? (0–100 Score)',
        description: 'Free Vedic gemstone suitability calculator. Scores all 9 ratna 0–100 using your Lagna functional benefics, Shadbala strength, dignity, house, dasha and afflictions — with risk and verdict.',
        inLanguage: 'en-IN', dateModified: '2026-06-15', isPartOf: { '@id': WEBSITE_ID }, author: { '@id': AUTHOR_ID }, publisher: { '@id': ORG_ID },
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
        about: [{ '@type': 'Thing', name: 'Gemstone Astrology' }, { '@type': 'Thing', name: 'Functional Benefic' }, { '@type': 'Thing', name: 'Shadbala' }],
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.tv-aeo-answer'] } },
      { '@type': 'BreadcrumbList', '@id': `${PAGE_URL}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
        { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
        { '@type': 'ListItem', position: 3, name: 'Free Gemstone Suitability Calculator', item: PAGE_URL },
      ] },
      { '@type': 'WebApplication', '@id': `${PAGE_URL}#app`, name: 'Free Gemstone Suitability Calculator', url: PAGE_URL,
        applicationCategory: 'LifestyleApplication', operatingSystem: 'All', browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, provider: { '@id': ORG_ID },
        featureList: 'Functional benefic gate, Shadbala strength, dignity, house, dasha, affliction & risk scoring for all 9 gemstones' },
      { '@type': 'HowTo', '@id': `${PAGE_URL}#howto`, name: 'How to check if a gemstone suits you',
        description: 'Check the Vedic suitability of all 9 gemstones from your birth details.', totalTime: 'PT1M',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Enter birth details', text: 'Enter your name, date, exact time and place of birth.' },
          { '@type': 'HowToStep', position: 2, name: 'Compute chart', text: 'The engine computes your ascendant, planetary Shadbala and dignities using Swiss Ephemeris with Lahiri Ayanamsha.' },
          { '@type': 'HowToStep', position: 3, name: 'Read suitability scores', text: 'Each gemstone gets a 0–100 suitability score with a risk level and a clear verdict.' },
        ] },
      { '@type': 'FAQPage', '@id': `${PAGE_URL}#faq`, mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link><span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link><span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Free Gemstone Suitability Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Gemstone Suitability Calculator — Should You Wear It?
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              Har ratna har kisi ke liye shubh nahi hota. <strong style={{ color: GOLD }}>Trikaal Vaani ka Gemstone Suitability Calculator</strong> aapke <strong style={{ color: GOLD }}>Lagna ke functional benefic/malefic</strong>, graha ki <strong>Shadbala strength</strong>, dignity, bhaav, dasha aur afflictions check karke har ratna ko <strong style={{ color: GOLD }}>0–100 suitability score</strong> deta hai — saath mein risk aur saaf verdict. Bilkul free, Swiss Ephemeris based.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Functional Benefic + Shadbala + Dignity + Dasha · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Gemstone Suitability (Free)</h2>
            <div className="grid gap-5">
              <div>
                <label htmlFor="tv-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-yellow-400">*</span></label>
                <input id="tv-name" type="text" placeholder="Enter your full name" value={form.name} onChange={(e) => set('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.name)} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth <span className="text-yellow-400">*</span></label>
                <input id="tv-dob" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.date)} />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="tv-tob" className="text-sm font-medium text-slate-300">Time of Birth {!form.unknownTime && <span className="text-yellow-400">*</span>}</label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                    <input type="checkbox" checked={form.unknownTime} onChange={(e) => set('unknownTime', e.target.checked)} className="rounded" /> Unknown time
                  </label>
                </div>
                <input id="tv-tob" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} disabled={form.unknownTime}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ ...inputStyle(!!errors.time), opacity: form.unknownTime ? 0.4 : 1 }} />
                {form.unknownTime
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Suitability poori tarah Lagna par nirbhar hai — exact birth time ke bina result bharosemand nahi.</p>
                  : <p className="text-slate-500 text-xs mt-1">Lagna (ascendant) ke liye exact time zaroori hai.</p>}
                {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Gender <span className="text-slate-500 text-xs ml-1">(optional)</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: 'male', label: '♂ Male', color: '#60a5fa' }, { value: 'female', label: '♀ Female', color: '#f472b6' }, { value: 'other', label: '⊕ Other', color: '#94a3b8' }].map((opt) => (
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
                    setForm((prev) => ({ ...prev, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz }));
                    setErrors((prev) => { const n = { ...prev }; delete n.latitude; return n; });
                  }} />
              </div>
              {form.latitude !== null && (
                <div className="grid grid-cols-3 gap-2">
                  {[{ label: 'Latitude', value: form.latitude.toFixed(4) }, { label: 'Longitude', value: form.longitude!.toFixed(4) }, { label: 'Timezone', value: `UTC ${form.timezone >= 0 ? '+' : ''}${form.timezone}` }].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-xs text-slate-500 mb-1">{label}</label>
                      <div className="px-3 py-2 rounded-lg text-xs font-mono text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#22c55e' }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}
              {error && <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: loading ? GOLD_RGBA(0.3) : `linear-gradient(135deg,rgba(212,175,55,0.8) 0%,${GOLD} 100%)`, color: '#080B12', fontSize: '15px' }}>
                {loading ? '⟳ Analysing Your Chart...' : '💎 Check My Gemstone Suitability'}
              </button>
              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Functional Benefic + Shadbala</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">
              <div className="rounded-xl p-4 text-center text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <span className="text-slate-400">Lagna: </span><span style={{ color: GOLD }} className="font-semibold">{result.lagna}</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-slate-400">Lagna Swami: </span><span style={{ color: GOLD }} className="font-semibold">{result.lagnaLord}</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-slate-400">Mahadasha: </span><span style={{ color: GOLD }} className="font-semibold">{result.MD || '—'}</span>
              </div>

              {/* PRIMARY */}
              {primary ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.4)}` }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Sabse Suitable Ratna</div>
                  <div className="text-5xl mb-2">💎</div>
                  <div className="text-3xl md:text-4xl font-serif font-bold mb-1" style={{ color: GOLD }}>{primary.stone_en} <span className="text-2xl text-slate-300">({primary.stone_hi})</span></div>
                  <div className="text-sm text-slate-300 mb-3">{primary.graha} ({primary.planet_hi}) ka ratna · Suitability <strong style={{ color: GOLD }}>{primary.score}/100</strong> · Verdict: <strong style={{ color: VERDICT_COLOR[primary.verdictKey].c }}>{primary.verdictLabel}</strong></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-left">
                    <DetailCell icon="🔗" label="Metal" value={primary.info.metal} />
                    <DetailCell icon="✋" label="Finger" value={primary.info.finger} />
                    <DetailCell icon="📅" label="Day" value={primary.info.day} />
                    <DetailCell icon="🕉️" label="Mantra" value={primary.info.mantra} />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <div className="text-3xl mb-2">🛡️</div>
                  <p className="text-slate-200 font-semibold mb-1">Abhi koi ratna strongly suitable nahi.</p>
                  <p className="text-sm text-slate-400">Yeh achhi baat hai — hum aapko galat ratna nahi bechte. Aapke functional benefics is samay balheen ya afflicted hain. Niche poori ranking dekhein, aur poori kundali ke aadhar par expert salaah lein.</p>
                </div>
              )}

              {/* SCOREBOARD — signature element */}
              <div className="rounded-2xl p-4 md:p-6" style={{ background: 'rgba(13,17,30,0.7)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-lg font-serif font-bold mb-4" style={{ color: GOLD }}>Saare 9 Ratna — Suitability Ranking</h3>
                <div className="space-y-2.5">
                  {result.stones.map((s) => {
                    const vc = VERDICT_COLOR[s.verdictKey];
                    return (
                      <div key={s.graha} className="rounded-xl p-3 md:p-4" style={{ background: 'rgba(2,8,23,0.5)', border: `1px solid ${vc.c}33` }}>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <span className="font-semibold" style={{ color: '#e2e8f0' }}>{s.stone_en}</span>
                            <span className="text-slate-500 text-sm ml-1">({s.stone_hi})</span>
                            <span className="text-xs text-slate-500 ml-2">{s.graha}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: s.risk >= 15 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)', color: s.risk >= 15 ? '#FCA5A5' : '#94a3b8' }}>Risk: {s.riskLabel}</span>
                            <span className="text-lg font-bold tabular-nums" style={{ color: vc.c }}>{s.score}</span>
                          </div>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: vc.c }} />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: vc.bg, color: vc.c }}>{s.verdictLabel}</span>
                          {s.flags.length > 0 && <span className="text-[11px] text-slate-500">{s.flags.join(' · ')}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-600 mt-3">Score = functional benefic + Shadbala + dignity + bhaav + dasha − affliction − risk. Strong ratna (Neelam/Gomed/Lehsunia) ka verdict suraksha ke liye "Expert Review" tak seemit hai.</p>
              </div>

              {/* LIFE STONE note */}
              {lifeStone && (
                <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}`, color: '#cbd5e1' }}>
                  ℹ️ <strong style={{ color: GOLD }}>Life Stone (Lagna Ratna):</strong> Aapke Lagna swami {result.lagnaLord} ka ratna <strong style={{ color: GOLD }}>{lifeStone.stone_en} ({lifeStone.stone_hi})</strong> — score {lifeStone.score}/100, verdict <strong style={{ color: VERDICT_COLOR[lifeStone.verdictKey].c }}>{lifeStone.verdictLabel}</strong>. Lagna ratna aam taur par sabse surakshit jeevan-bhar ka ratna mana jaata hai.
                </div>
              )}

              {/* CTA → kundali */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-1 font-semibold">Sahi ratna ka faisla poori kundali maangta hai.</p>
                <p className="text-sm text-slate-400 mb-3">Combust, yoga aur poore bhaav-vishleshan ke saath apni complete kundali banayein — phir hi koi strong ratna dharan karein.</p>
                <Link href="/calculators/free-kundali-calculator" className="inline-block px-6 py-3 rounded-xl font-bold text-sm" style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.85) 0%,${GOLD} 100%)`, color: '#080B12' }}>
                  Free Poori Kundali Banayein →
                </Link>
              </div>
            </div>
          )}

          {/* PILLAR CONTENT */}
          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Ratna Suitability Kaise Tay Hoti Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Zyadातर astrology sites sirf <strong>Lagna swami</strong> ya <strong>current Mahadasha</strong> dekh kar ratna bata dete hain. Yeh adhoora aur kabhi-kabhi khatarnaak hai. Vedic Jyotish mein sabse pehla niyam hai <strong style={{ color: GOLD }}>functional benefic</strong> — har graha kisi bhi Lagna ke liye <em>shubh (benefic)</em> ya <em>ashubh (malefic)</em> hota hai, jo uski bhaav-swamitva (house lordship) se tay hota hai. Ek functional malefic graha ka ratna, chahe wo graha exalted ya Mahadasha mein hi kyun na ho, aapke jeevan ke galat kshetra ko balshali karke nuksaan kar sakta hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Isliye Trikaal Vaani ka engine pehle <strong style={{ color: GOLD }}>gate</strong> lagata hai: functional malefic ka ratna reject. Phir benefic graha ke liye uski <strong>Shadbala</strong> (asli bal), <strong>dignity</strong> (uccha/swa/mitra/shatru/neecha), <strong>bhaav sthiti</strong>, chalti <strong>dasha</strong>, aur <strong>afflictions</strong> (Rahu/Ketu yuti, papi drishti) ko jod-ghata kar 0–100 score banta hai. Doctrine seedhi hai — <strong style={{ color: GOLD }}>ratna ek balheen shubh graha ko mazboot karta hai</strong>; jo graha pehle se balwan hai, use ratna ki zaroorat nahi.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Navagraha — Ratna Table</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead><tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                  <th className="p-3 text-left" style={{ color: GOLD }}>Graha</th>
                  <th className="p-3 text-left" style={{ color: GOLD }}>Ratna</th>
                  <th className="p-3 text-left" style={{ color: GOLD }}>Metal / Finger</th>
                  <th className="p-3 text-left" style={{ color: GOLD }}>Risk</th>
                </tr></thead>
                <tbody className="text-slate-300">
                  {Object.entries(STONE).map(([planet, g]) => (
                    <tr key={planet} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td className="p-3">{planet} ({g.planet_hi})</td>
                      <td className="p-3 font-semibold" style={{ color: GOLD }}>{g.en} ({g.hi})</td>
                      <td className="p-3">{g.metal} · {g.finger}</td>
                      <td className="p-3">{g.risk >= 20 ? 'Very High ⚠️' : g.risk >= 15 ? 'High ⚠️' : 'Low'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead><tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                  <th className="p-3 text-left" style={{ color: GOLD }}>Feature</th>
                  <th className="p-3 text-left" style={{ color: GOLD }}>Trikaal Vaani</th>
                  <th className="p-3 text-left text-slate-400">Others</th>
                </tr></thead>
                <tbody className="text-slate-300">
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Basis</td><td className="p-3">Functional benefic + Shadbala</td><td className="p-3 text-slate-500">Lagna-lord / Mahadasha only</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Functional malefic check</td><td className="p-3" style={{ color: GOLD }}>✓ Hard reject</td><td className="p-3 text-slate-500">✗ Often missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Suitability score</td><td className="p-3" style={{ color: GOLD }}>✓ 0–100, all 9 stones</td><td className="p-3 text-slate-500">✗ Single suggestion</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Strong-stone safety</td><td className="p-3" style={{ color: GOLD }}>✓ Expert-review cap</td><td className="p-3 text-slate-500">✗ Auto-approve</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Price</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid / upsell</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Gemstone Suitability</h2>
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
                { slug: 'free-gemstone-calculator', name: 'Lucky Gemstone' },
                { slug: 'free-should-i-wear-neelam', name: 'Should I Wear Neelam?' },
                { slug: 'free-should-i-wear-cats-eye', name: "Should I Wear Cat's Eye?" },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
              ].map((c) => (
                <Link key={c.slug} href={`/calculators/${c.slug}`} className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
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
