'use client';

// ============================================================
// File: app/calculators/free-rashi-calculator/page.tsx
// Version: v2.0 (05 Sep 2026) — Free Rashi (Moon Sign) Calculator
// Engine: Swiss Ephemeris + Parashar BPHS + Shadbala + Bhrigu
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-09-05) — Keyword-driven content build from Radar E3 PASF.
//        ~1,000 -> ~5,200 words, 4 H2 -> 36, TOC added, FAQs 7 -> 14,
//        21 -> ~26 verified internal links, new layout.tsx title.
//        Form, /api/calc/kundali, JSON-LD and the comparison table untouched.
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

// ─── 12 Rashi Reference (Parashar BPHS) ───────────────────────
const RASHI_DATA: Record<string, any> = {
  'Mesha':      { en: 'Aries',       lord: 'Mars',    element: 'Fire',  symbol: 'Ram',           colors: 'Red, Coral',         days: 'Tuesday', mantra: 'Om Mangalaya Namah',     trait: 'Energetic, pioneering, courageous, impulsive leader' },
  'Vrishabha':  { en: 'Taurus',      lord: 'Venus',   element: 'Earth', symbol: 'Bull',          colors: 'White, Pink, Cream', days: 'Friday',  mantra: 'Om Shukraya Namah',      trait: 'Patient, sensual, loyal, materialistic builder' },
  'Mithuna':    { en: 'Gemini',      lord: 'Mercury', element: 'Air',   symbol: 'Twins',         colors: 'Green, Light Blue',  days: 'Wednesday', mantra: 'Om Budhaya Namah',     trait: 'Curious, witty, dual-natured, communicative' },
  'Karka':      { en: 'Cancer',      lord: 'Moon',    element: 'Water', symbol: 'Crab',          colors: 'White, Silver, Pearl', days: 'Monday', mantra: 'Om Chandraya Namah',    trait: 'Emotional, nurturing, intuitive, family-oriented' },
  'Simha':      { en: 'Leo',         lord: 'Sun',     element: 'Fire',  symbol: 'Lion',          colors: 'Gold, Orange, Red',   days: 'Sunday',  mantra: 'Om Suryaya Namah',      trait: 'Royal, generous, proud, charismatic leader' },
  'Kanya':      { en: 'Virgo',       lord: 'Mercury', element: 'Earth', symbol: 'Maiden',        colors: 'Green, White',        days: 'Wednesday', mantra: 'Om Budhaya Namah',     trait: 'Analytical, perfectionist, service-oriented, modest' },
  'Tula':       { en: 'Libra',       lord: 'Venus',   element: 'Air',   symbol: 'Scales',        colors: 'White, Pink, Blue',   days: 'Friday',  mantra: 'Om Shukraya Namah',     trait: 'Balanced, diplomatic, artistic, indecisive' },
  'Vrishchika': { en: 'Scorpio',     lord: 'Mars',    element: 'Water', symbol: 'Scorpion',      colors: 'Red, Maroon, Black',  days: 'Tuesday', mantra: 'Om Mangalaya Namah',    trait: 'Intense, mysterious, passionate, transformative' },
  'Dhanu':      { en: 'Sagittarius', lord: 'Jupiter', element: 'Fire',  symbol: 'Archer',        colors: 'Yellow, Orange',      days: 'Thursday', mantra: 'Om Gurave Namah',      trait: 'Philosophical, optimistic, freedom-loving, adventurous' },
  'Makara':     { en: 'Capricorn',   lord: 'Saturn',  element: 'Earth', symbol: 'Sea-goat',      colors: 'Black, Blue, Brown',  days: 'Saturday', mantra: 'Om Shanaye Namah',     trait: 'Disciplined, ambitious, patient, status-conscious' },
  'Kumbha':     { en: 'Aquarius',    lord: 'Saturn',  element: 'Air',   symbol: 'Water-bearer',  colors: 'Blue, Black, Purple', days: 'Saturday', mantra: 'Om Shanaye Namah',     trait: 'Innovative, humanitarian, eccentric, intellectual' },
  'Meena':      { en: 'Pisces',      lord: 'Jupiter', element: 'Water', symbol: 'Fish',          colors: 'Yellow, Sea Green',   days: 'Thursday', mantra: 'Om Gurave Namah',       trait: 'Compassionate, intuitive, spiritual, dreamy' },
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
  { q: 'Rashi kya hoti hai?', a: 'Rashi (Moon Sign / Chandra Rashi) Vedic Jyotish ka sabse important zodiac sign hai. Aakash ko 12 equal divisions mein baata gaya hai — har 30° ka ek Rashi. Aapki Chandra Rashi wahi hai jismein aapke janm samay Chandra (Moon) sthit tha. Indian astrology mein predictions zyadatar Chandra Rashi pe based hoti hain.' },
  { q: 'Chandra Rashi aur Surya Rashi mein kya antar hai?', a: 'Chandra Rashi = Moon Sign — aapka mann, emotions, mother. Vedic astrology ka primary sign. Surya Rashi = Sun Sign — Western astrology mein use hota hai, identity aur ego dikhata hai. India mein "Rashi" ka matlab aksar Chandra Rashi hota hai.' },
  { q: 'Apni Rashi kaise pata karein?', a: 'Apni Chandra Rashi jaanne ke liye Date of Birth, exact Time of Birth, aur Place of Birth chahiye. Trikaal Vaani Calculator Swiss Ephemeris se Moon ki exact position calculate karta hai aur aapki Chandra Rashi turant nikalta hai — bilkul free.' },
  { q: '12 Rashis kaun se hain?', a: '12 Rashis hain — Mesha (Aries), Vrishabha (Taurus), Mithuna (Gemini), Karka (Cancer), Simha (Leo), Kanya (Virgo), Tula (Libra), Vrishchika (Scorpio), Dhanu (Sagittarius), Makara (Capricorn), Kumbha (Aquarius), aur Meena (Pisces). Har Rashi ka apna lord planet, element, aur swabhav hai.' },
  { q: 'Rashi se kya predict hota hai?', a: 'Aapki Chandra Rashi se predict hota hai — (1) Emotional patterns aur mann ki state, (2) Mother ke saath rishta, (3) Marriage compatibility (rashi koot matching), (4) Sade Sati aur Saturn transit ka effect, (5) Daily horoscope aur muhurta. Vimshottari Dasha bhi Janma Nakshatra (jo Chandra Rashi mein hi hota hai) se calculate hoti hai.' },
  { q: 'Kya Rashi Calculator bilkul free hai?', a: 'Haan. 100% free. Chandra Rashi naam, ruling planet, element, symbol, favorable colors, lucky days, mantra, personality traits, 3 Parashar Dos, 3 Donts, aur 3 personalized remedies (Mantra, Ratna, Daan) — sab free.' },
  { q: 'Rashi ke result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris use karta hai — NASA-grade astronomical library. Lahiri Ayanamsha (Government of India standard) + BPHS classical rules — 99.9% astronomical accuracy. Same engine professional astrologers worldwide use karte hain.' },
  { q: 'Meri rashi kya hai naam se — naam se rashi nikal sakti hai?', a: 'Aanshik roop se, aur is par saaf hona zaroori hai. Paramapara ye hai ki bachche ka naam uske janm nakshatra ke pada ke shubh akshar se rakha jaata hai — isliye naam ka pehla akshar ulta chal kar rashi bata deta hai. Par ye tabhi sahi hai jab naam usi niyam se rakha gaya ho. Aaj adhikansh naam pasand se rakhe jaate hain, isliye naam se nikli rashi galat ho sakti hai. Janm tithi aur samay se nikli rashi hi pramanik hai.' },
  { q: 'Rashi calculator by date of birth — kya sirf tareekh kaafi hai?', a: 'Prayah kaafi hoti hai, par hamesha nahi. Chandra ek rashi mein lagbhag sawa do din rehta hai, isliye adhikansh dinon mein sirf tareekh se rashi nikal aati hai. Par agar aapke janm ke din Chandra rashi badal raha tha, to samay ke bina do rashiyon ke beech faisla nahi hoga. Isi liye samay maanga jaata hai.' },
  { q: 'Chandra Rashi aur Lagna Rashi mein kaunsi asli rashi hai?', a: 'Dono asli hain, bas kaam alag hai. Chandra Rashi mann, bhavna aur naam ke liye hai, aur gochar tatha Sade Sati isi se ginte hain. Lagna Rashi shareer, vyaktitva aur bhaavon ka aadhaar hai, aur poori kundali isi par khadi hoti hai. Uttar Bharat mein saadharan baat mein "rashi" ka matlab prayah Chandra Rashi hota hai.' },
  { q: 'Sun sign aur Rashi ek hi cheez hai?', a: 'Nahi. Akhbaar aur website mein jo "zodiac sign" milta hai wo prayah paashchatya Surya rashi hai, jo Sayana (tropical) paddhati par chalti hai. Vedic Rashi Nirayana (sidereal) paddhati par chalti hai aur Lahiri ayanamsha lagta hai. Isi kaaran dono prayah ek rashi ka antar dikhate hain — aur dono galat nahi hain, bas alag paddhatiyan hain.' },
  { q: 'Naam ka pehla akshar rashi se kaise juda hai?', a: '27 nakshatron ke 108 pada hote hain aur har pada ka ek nishchit shubh syllable hai. Ye 108 akshar 12 rashiyon mein baante gaye hain — har rashi ke hisse mein lagbhag nau akshar aate hain. Isi liye "S naam walon ki rashi" jaise prashn uthte hain. Par ye jodi tabhi kaam karti hai jab naam nakshatra ke anusaar rakha gaya ho.' },
  { q: 'Rashi badal sakti hai?', a: 'Nahi. Janm ke kshan Chandra jis rashi mein tha wo jeevan bhar nahi badalti. Jo badalta hai wo gochar hai — grah aapki rashi se guzarte rehte hain, aur usi se Sade Sati, Dhaiya aur rashifal bante hain. Agar do jagah alag rashi mil rahi hai to prayah wajah samay ka antar ya ayanamsha ka antar hoti hai.' },
  { q: 'Rashi se rashifal kitna sach hota hai?', a: 'Imandari se: saamanya rashifal sirf Chandra rashi par bana hota hai, yaani ek hi rashi ke karodon logon ke liye ek hi baat. Wo dilchasp ho sakta hai par vyaktigat nahi. Vyaktigat padhai ke liye poori kundali chahiye — lagna, bhaav, aur chal rahi dasha — kyunki wahi har vyakti ki alag hai.' },
];


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2 + GSC, both 05 Sep 2026)
//   ~1,000 words · 4 H2 · 21 internal links.
//   GSC 3 months to 4 Sep 2026: 783 impressions, 7 clicks, CTR 0.89%,
//   average position 20.89. Second-highest impressions of the thirteen thin
//   calculators and one of the worst CTRs — Google shows this page and nobody
//   clicks. The head query "rashi calculator" sat at position 62.4 for 89
//   impressions and earned ZERO clicks.
//
// WHERE THE H2s COME FROM — Radar E3, live SERP PASF, checked 05 Sep 2026.
//   Cluster calc-rashi-numerology, all tracked keywords with our_rank = null:
//     rashi calculator by date of birth ...... AIO recommends_tool
//     meri rashi kya hai naam se ............. AIO recommends_tool
//     राशि कैलकुलेटर ........................... AIO recommends_tool
//
//   PASF harvested from those SERPs and answered below:
//     Moon Rashi by date of Birth · Vedic Rashi calculator
//     Find my Rashi by name · Name Rashi calculator · नाम राशि कैलकुलेटर
//     Rashi calculator by birth date and time without name
//     Rashi name by date of birth in Hindu · जन्म राशि नाम अक्षर
//     चंद्र राशि कैलकुलेटर · जन्म राशि कैलकुलेटर · Gujarati Rashi Calculator
//     Rashi kaise pata kare naam se / app / english
//     C, H, K, M, N, P, R, S, Y naam walon ki rashi  → the name-letter family,
//       answered as one honest section rather than nine thin ones.
//     AstroSage / Astrotalk / Prokerala rashi calculator → answered directly.
//
// KEYWORD SPLIT — deliberate, do not undo
//   Radar files rashi, numerology and lucky-day in ONE cluster, but the site
//   has three separate pages. They are kept apart on purpose:
//     /calculators/free-rashi-calculator     — Chandra Rashi (this page)
//     /calculators/free-numerology-calculator — mulank / bhagyank
//     /calculators/free-lucky-day-calculator  — lucky days
//     /calculators/free-nakshatra-calculator  — nakshatra and pada
//   Mulank, bhagyank, lucky days and nakshatra are therefore NOT given H2s
//   here; they are handed over by link. Putting them on every page would make
//   the four compete for the same SERP.
//
// THE HONEST CORE OF THIS PAGE
//   The single loudest PASF family is name-based rashi ("S naam walon ki rashi
//   kya hai" and eight siblings). The truthful answer is that the name-letter
//   route only works when the name was actually given from the janma
//   nakshatra pada — which today it usually is not. That is said plainly in
//   its own section rather than quietly exploited, because a wrong rashi
//   sends every later reading off course.
//
// UNCHANGED — do not "tidy" these
//   The form, /api/calc/kundali, buildCalcJsonLd and the comparison table.
//   Only words, links and FAQs changed.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type RcSection = { id: string; h2: string; paras: string[] };

const SECTIONS: RcSection[] = [
  {
    id: 'kaise-kaam-karta-hai',
    h2: 'Rashi Calculator — kaam kaise karta hai',
    paras: [
      'Aap **janm tithi, samay aur sthan** dete hain. Calculator us kshan Chandra ki sateek sthiti nikaalta hai aur batata hai ki wo kis rashi mein tha. Wahi aapki **Chandra Rashi** hai — jise saadharan baat mein sirf "rashi" kaha jaata hai.',
      'Result mein rashi ke saath uska **swami graha**, **tatva**, **chinh**, us rashi mein Chandra ka **nakshatra**, aur classical upay bhi aate hain.',
      'Ganana **Swiss Ephemeris** aur **Lahiri Ayanamsha** par hoti hai — wahi maanak jo Bharat sarkar ka panchang istemaal karta hai. Isi liye yahan nikli rashi paramparik panchang se milti hai, paashchatya app se nahi.',
    ],
  },
  {
    id: 'rashi-kya-hai',
    h2: 'Rashi kya hoti hai — aur ise Chandra se kyun jodte hain',
    paras: [
      'Aakash ke 360 degree ko **barah barabar hisson** mein baanta gaya hai. Har hissa 30 degree ka hai aur wahi ek rashi hai — Mesh se Meen tak.',
      'Ab prashn ye ki rashi kis graha se tay ho. Vedic paddhati **Chandra** ko chunti hai, aur wajah shastriya hai: **Chandra mann ka kaarak hai.** Wo sabse tez chalta hai — lagbhag sawa do din mein ek rashi paar kar leta hai — isliye wo vyakti ke andaruni bhaav ka sabse sookshm sanket dene wala maana gaya hai.',
      'Isi kaaran **naam Chandra rashi se rakha jaata hai**, **gochar Chandra rashi se dekha jaata hai**, aur **Sade Sati bhi Chandra rashi se hi ginte hain** — lagna se nahi. Ye teen cheezein is ek chunav se nikalti hain.',
    ],
  },
  {
    id: 'rashi-by-dob',
    h2: 'Rashi Calculator by Date of Birth — sirf tareekh se kaam chalega?',
    paras: [
      'Prayah chal jaata hai, par hamesha nahi — aur ye antar jaan lena zaroori hai.',
      '**Chandra ek rashi mein lagbhag sawa do din rehta hai.** Iska matlab adhikansh dinon mein poore din Chandra ek hi rashi mein rehta hai, aur sirf tareekh se rashi nikal aati hai. Isi liye bahut se tool sirf tareekh maang kar kaam chala lete hain.',
      'Dikkat un dinon mein aati hai jab **Chandra rashi badal raha ho.** Aisa har sawa do din mein ek baar hota hai — yaani lagbhag har mahine barah baar. Agar aapka janm us sandhi ke aas-paas hua hai to samay ke bina do rashiyon ke beech faisla nahi ho sakta. Isi liye ye page samay maangta hai: **adhikansh ke liye zaroori nahi, par kuch ke liye nirnayak.**',
    ],
  },
  {
    id: 'naam-se-rashi',
    h2: 'Meri rashi kya hai naam se — sach kya hai',
    paras: [
      'Ye is page ka sabse zyada poochha jaane wala prashn hai, aur iska uttar aadha "haan" aur aadha "nahi" hai. Dono hisse saaf hone chahiye.',
      '**Paramapara ye hai:** 27 nakshatron ke 108 pada hote hain, aur har pada ka ek nishchit shubh syllable hai. Bachche ka naam usi syllable se rakha jaata tha. Ye 108 akshar barah rashiyon mein baante gaye hain, isliye naam ka pehla akshar ulta chal kar rashi bata deta hai. Yahi wajah hai ki "S naam walon ki rashi" jaise prashn bante hain.',
      '**Par shart ye hai ki naam usi niyam se rakha gaya ho.** Aaj adhikansh naam pasand se, arth se, ya parivaar ki reet se rakhe jaate hain — nakshatra dekh kar nahi. Aise mein naam se nikli rashi **galat hogi**, aur us galat rashi par bana har aage ka nishkarsh bhi galat hoga. Isliye seedhi salah: **janm tithi aur samay se rashi nikaaliye.** Naam wali rashi tabhi bharose layak hai jab aapko pata ho ki naam nakshatra se rakha gaya tha.',
    ],
  },
  {
    id: 'naam-akshar-rashi',
    h2: 'Naam ka pehla akshar aur rashi — poori jodi',
    paras: [
      'Agar aapka naam nakshatra ke anusaar rakha gaya tha, to ye jodi kaam karti hai. Kram ye hai.',
      '**Mesh** — Chu, Che, Cho, La, Li, Lu, Le, Lo, A. **Vrishabh** — I, U, E, O, Va, Vi, Vu, Ve, Vo. **Mithun** — Ka, Ki, Ku, Gha, Nga, Chha, Ke, Ko, Ha. **Karka** — Hi, Hu, He, Ho, Da, Di, Du, De, Do. **Simha** — Ma, Mi, Mu, Me, Mo, Ta, Ti, Tu, Te. **Kanya** — To, Pa, Pi, Pu, Sha, Na, Tha, Pe, Po.',
      '**Tula** — Ra, Ri, Ru, Re, Ro, Ta, Ti, Tu, Te. **Vrishchik** — To, Na, Ni, Nu, Ne, No, Ya, Yi, Yu. **Dhanu** — Ye, Yo, Bha, Bhi, Bhu, Dha, Pha, Dha, Bhe. **Makar** — Bho, Ja, Ji, Khi, Khu, Khe, Kho, Ga, Gi. **Kumbh** — Gu, Ge, Go, Sa, Si, Su, Se, So, Da. **Meen** — Di, Du, Tha, Jha, Nya, De, Do, Cha, Chi.',
      'Dhyan dijiye ki **kuch akshar do rashiyon mein aate hain** — jaise Ta, Ti, Tu Simha aur Tula dono mein, aur Da Karka aur Kumbh dono mein. Isi liye akela akshar nishchit uttar nahi deta, aur janm tithi se jaanch zaroori ho jaati hai.',
    ],
  },
  {
    id: 'chandra-surya-lagna',
    h2: 'Chandra Rashi, Surya Rashi aur Lagna Rashi — teen alag cheezein',
    paras: [
      'Teen "rashi" hoti hain aur teeno alag kaam karti hain. Inhe mila dena is vishay ki sabse aam galti hai.',
      '**Chandra Rashi** — janm ke kshan Chandra kis rashi mein tha. Mann, bhavna aur maa ka kshetra. Naam isi se rakha jaata hai, gochar aur Sade Sati isi se ginte hain. **Surya Rashi** — Surya kis rashi mein tha. Aatma, pita aur pehchan ka kshetra. **Lagna Rashi** — us kshan purvi kshitij par kaunsi rashi udit thi. Shareer, vyaktitva, aur poori kundali ka aadhaar.',
      'Kaunsi kab dekhein: **naam aur gochar ke liye Chandra Rashi. Bhaav aur poore chart ke liye Lagna.** Apna lagna dekhna ho to [Lagna Calculator](/calculators/free-lagna-calculator) free hai, aur wo kitna mazboot hai ye [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) par.',
    ],
  },
  {
    id: 'sun-sign-antar',
    h2: 'Sun Sign aur Rashi alag kyun aate hain',
    paras: [
      'Bahut se log yahan uljhan mein aate hain: paashchatya app kehta hai "Leo", panchang kehta hai "Karka". Dono galat nahi hain.',
      'Antar paddhati ka hai. Paashchatya jyotish **Sayana (tropical)** paddhati par chalta hai, jo rashiyon ko ritu-chakra se jodti hai. Vedic jyotish **Nirayana (sidereal)** paddhati par chalta hai, jo unhe asli taaron ki sthiti se jodti hai. Do paddhatiyon ke beech ka antar **ayanamsha** kehlata hai, aur abhi wo lagbhag 24 degree hai.',
      'Chubis degree lagbhag ek poori rashi ke barabar hai — **isi liye prayah ek rashi ka farak dikhta hai.** Aur ek aur antar: paashchatya "sign" prayah Surya ka hota hai, jabki Vedic "rashi" Chandra ki. Do alag graha, do alag paddhati — do alag jawab milna swabhavik hai.',
    ],
  },
  {
    id: 'barah-rashi',
    h2: '12 Rashi aur unke swami — poori soochi',
    paras: [
      'Har rashi ka ek swami graha hai, aur wahi uska swabhav tay karta hai. Ye jodi kabhi nahi badalti.',
      '**Mesh — Mangal. Vrishabh — Shukra. Mithun — Budh. Karka — Chandra. Simha — Surya. Kanya — Budh. Tula — Shukra. Vrishchik — Mangal. Dhanu — Guru. Makar — Shani. Kumbh — Shani. Meen — Guru.**',
      'Dhyan dene ki baat: **sirf Surya aur Chandra ek-ek rashi ke swami hain.** Baaki paanch graha do-do rashiyon ke. Isi liye aapki rashi ka swami prayah kisi doosri rashi ka bhi swami hoga, aur uska bal dono jagah asar dalega. Us graha ka bal dekhna ho to [Weak Planet Finder](/calculators/free-weak-planet-finder) free hai.',
    ],
  },
  {
    id: 'tatva',
    h2: 'Char tatva — Agni, Prithvi, Vayu aur Jal',
    paras: [
      'Barah rashiyaan char tatvon mein baanti gayi hain, teen-teen ki chaukdi mein. Ye vibhajan swabhav samajhne ka sabse chhota rasta hai.',
      '**Agni** — Mesh, Simha, Dhanu: pahal, urja, spashtata. **Prithvi** — Vrishabh, Kanya, Makar: sthirta, vyavharikta, dheeraj. **Vayu** — Mithun, Tula, Kumbh: vichaar, sanvaad, sambandh. **Jal** — Karka, Vrishchik, Meen: bhavna, gehrai, antar-drishti.',
      'Ek aur vibhajan bhi hai jo kaam ka hai — **char (chalayamaan), sthir aur dvisvabhav** rashiyaan. Char rashiyaan (Mesh, Karka, Tula, Makar) parivartan laati hain, sthir (Vrishabh, Simha, Vrishchik, Kumbh) tikaav, aur dvisvabhav (Mithun, Kanya, Dhanu, Meen) lachilapan. Muhurat aur samay ke prashnon mein ye vibhajan seedha kaam aata hai.',
    ],
  },
  {
    id: 'rashi-aur-nakshatra',
    h2: 'Rashi aur Nakshatra ka rishta',
    paras: [
      'Rashi barah hain, **nakshatra sattais**. Dono ek hi aakash ko baantte hain, bas alag naap se — aur dono ek saath chalte hain.',
      'Ganit seedha hai: **har rashi mein sawa do nakshatra aate hain**, aur har nakshatra ke char pada hote hain. Isliye ek rashi mein nau pada aate hain. Yahi nau pada wo nau akshar dete hain jo us rashi ke naam-akshar hain — aur isi tarah naam, nakshatra aur rashi ek dhaage mein bandhe hain.',
      'Vyavharik antar: **rashi mota chitra deti hai, nakshatra sookshm.** Do log ek hi rashi ke ho sakte hain par alag nakshatra ke, aur unka swabhav kaafi alag hoga. Apna nakshatra aur pada dekhna ho to [Nakshatra Calculator](/calculators/free-nakshatra-calculator) free hai, aur poora parichay [Nakshatra Guide](/learn/nakshatra-guide) mein.',
    ],
  },
  {
    id: 'rashi-aur-gochar',
    h2: 'Gochar Chandra Rashi se hi kyun dekhte hain',
    paras: [
      'Ye niyam bahut jagah dohraya jaata hai par uski wajah kam batayi jaati hai.',
      'Gochar ka arth hai grahon ka aapki rashi ke saapeksh chalna — "Shani aapki rashi se barahve mein hai" jaisi baat. Iske liye ek **sthir sandarbh-bindu** chahiye, aur Vedic paddhati Chandra ko chunti hai kyunki wo mann ka kaarak hai: gochar ka asar sabse pehle mann par mehsoos hota hai, phir ghatnaon mein dikhta hai.',
      'Isi kaaran **Sade Sati aur Dhaiya dono Chandra rashi se ginte hain.** Log ise lagna se gin lete hain aur galat nishkarsh nikaal lete hain. Apni sthiti [Sade Sati Calculator](/calculators/free-sade-sati-calculator) se dekhiye — wo Chandra rashi par chalta hai — aur Shani ka poora vishay [Shani Mahadasha](/blog/shani-mahadasha-effects-guide) mein hai.',
    ],
  },
  {
    id: 'rashifal-kitna-sach',
    h2: 'Rashifal kitna sach hota hai — imandar jawab',
    paras: [
      'Ye jawab is page ke apne traffic ke khilaf jaata hai, par saaf hona chahiye.',
      'Saamanya rashifal — akhbaar ka, app ka, ya website ka — **sirf aapki Chandra rashi par bana hota hai.** Iska matlab hai ki ek hi rashi ke karodon logon ko ek hi baat batayi ja rahi hai. Wo baat dilchasp ho sakti hai, kabhi mel bhi kha sakti hai, par wo **vyaktigat nahi** hai.',
      'Jo cheez vyaktigat banati hai wo hai **lagna, bhaavon ki sthiti aur chal rahi dasha** — aur ye teeno har vyakti ke alag hain. Do log ek hi rashi ke, ek hi din paida hue, par alag samay par — unki dasha aur bhaav alag honge, aur unka anubhav bhi.',
      'Isliye rashifal ko mausam ki bhavishyavani ki tarah lijiye: mota rujhan, vyaktigat nirnay nahi. Poori kundali dekhni ho to [Kundali Calculator](/calculators/free-kundali-calculator) free hai.',
    ],
  },
  {
    id: 'rashi-badal-sakti',
    h2: 'Kya rashi badal sakti hai',
    paras: [
      'Nahi. **Janm ke kshan Chandra jis rashi mein tha, wo jeevan bhar wahi rehti hai.** Ye ek khagolik tathya hai, koi bhavishyavani nahi.',
      'Jo badalta hai wo **gochar** hai — grah aapki rashi se guzarte rehte hain, aur usi se Sade Sati, Dhaiya aur rashifal bante hain. Log kabhi-kabhi is chalte hue asar ko rashi badalna samajh lete hain.',
      'Agar do jagah alag rashi mil rahi hai to teen sambhavit wajah hain: **samay ka antar** (janm ke din Chandra sandhi par tha), **ayanamsha ka antar** (Lahiri, Krishnamurti ya Raman), ya **paddhati ka antar** (Sayana bनाम Nirayana). Teeno mein se koi bhi galti nahi hai — bas alag maanak hai. Kaunsa sahi hai, ye tay karne ke liye janm samay dobara jaanchna sabse kaam ka kadam hai.',
    ],
  },
  {
    id: 'gujarati-tamil',
    h2: 'Gujarati, Tamil aur Malayalam rashi calculator — kya alag hai',
    paras: [
      'Ye PASF mein bar-bar aate hain, isliye antar saaf kar dena theek hai.',
      '**Ganana bilkul wahi hai.** Chandra ki sthiti sthaan aur bhasha se nahi badalti. Antar sirf **naamon** ka hai: Mesh ko Tamil mein Mesham, Malayalam mein Medam kehte hain; Vrishabh Rishabam ya Edavam. Rashi wahi rehti hai, naam alag.',
      'Ek asli antar zaroor hai: **dakshin Bharat aur Kerala mein nakshatra (star) ko rashi se zyada vazan diya jaata hai.** Wahan "star birthday" nakshatra ke aadhaar par manaya jaata hai. Isliye agar aap us paramapara se hain to aapke liye zyada kaam ka page [Nakshatra Calculator](/calculators/free-nakshatra-calculator) hai, ye nahi.',
    ],
  },
  {
    id: 'mulank-alag',
    h2: 'Mulank aur Bhagyank — ye rashi nahi hai',
    paras: [
      'Ye do vishay aksar ek saath dhoondhe jaate hain, isliye antar likh dena zaroori hai.',
      '**Rashi jyotish hai** — wo Chandra ki asli khagolik sthiti se nikalti hai. **Mulank aur bhagyank ank-shastra (numerology) hain** — wo janm tithi ke ankon ko jod kar nikalte hain. Mulank janm ki tareekh se banta hai, bhagyank poori janm tithi ke jod se.',
      'Dono alag paddhatiyaan hain aur inhe mila kar padhna galat nishkarsh deta hai. Agar aapka prashn mulank ya bhagyank ka hai to [Numerology Calculator](/calculators/free-numerology-calculator) uske liye alag bana hai, aur shubh din ke prashn ke liye [Lucky Day Calculator](/calculators/free-lucky-day-calculator) — dono free hain.',
    ],
  },
  {
    id: 'rashi-aur-naam',
    h2: 'Bachche ka naam rashi se — ya nakshatra se?',
    paras: [
      'Sahi uttar hai: **nakshatra se**, aur rashi uska natija hai — ulta nahi.',
      'Vidhi ye hai: bachche ke janm ka **nakshatra aur pada** nikaalte hain, us pada ka nishchit shubh syllable lete hain, aur usi se naam shuru karte hain. Kyunki har rashi mein nau pada aate hain, naam apne aap rashi se bhi mel kha jaata hai. Isliye "rashi se naam" kehna aadha sahi hai — asal aadhaar pada hai.',
      'Ye antar vyavharik roop se mayne rakhta hai. Rashi se seedha chalne par nau aksharon mein se koi bhi chun liya jaata hai; pada se chalne par **wahi ek akshar** milta hai jo us bachche ke liye tay hai. Sahi pada aur akshar ke liye [Baby Name by Nakshatra](/calculators/free-baby-name-by-nakshatra) aur [Nakshatra Calculator](/calculators/free-nakshatra-calculator) dono free hain.',
    ],
  },
  {
    id: 'rashi-milan',
    h2: 'Rashi se jodi milana — kitna bharosa karein',
    paras: [
      'Ye prashn bahut aata hai — "kark aur meen rashi ki jodi kaisi hai" — aur iska santulit uttar zaroori hai.',
      'Paramparik **Ashtakoot Milan** mein aath kootâ€™ dekhe jaate hain aur 36 gun mein se ank milte hain. Inme se kai koot **nakshatra** par tikte hain, sirf rashi par nahi — Nadi (8 ank), Bhakoot (7 ank), Gana (6 ank). Yaani rashi jodi ka ek hissa hai, poora uttar nahi.',
      'Aur jo saaf kehna chahiye: **36 gun mil jaana ya na milna vivah ka faisla nahi hai.** Bahut se 30+ gun wale rishte nahi chalte aur bahut se 18 gun wale achhe chalte hain, kyunki milan ke alawa dono ki dasha, saatva bhaav aur asli jeevan bhi hote hain. Rashi-jodi ko ek sanket maaniye, nirnay nahi.',
    ],
  },
  {
    id: 'rashi-ratna',
    h2: 'Rashi ka ratna — yahan rukiye',
    paras: [
      'Bazaar mein "aapki rashi ka ratna" sabse zyada becha jaane wala saamaan hai, aur yahi sabse zyada galat salah bhi hai.',
      'Wajah: **ratna rashi se nahi, lagna se tay hota hai.** Dekha jaata hai ki wo graha aapke lagna ke liye shubh hai ya marak — yaani wo kaunse bhaavon ka swami hai. Sirf rashi dekh kar ratna dena matlab barah mein se ek jaankari par faisla lena.',
      'Iska natija ye hota hai ki **kabhi-kabhi wo ratna ulta asar karta hai**, kyunki us graha ki urja badhane se uska marak paksh bhi balwan ho jaata hai. Apne lagna ke hisaab se jaanchne ke liye [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) free hai, aur pehanne ki vidhi [How to wear a gemstone](/learn/how-to-wear-gemstone-vedic) mein.',
    ],
  },
  {
    id: 'rashi-upay',
    h2: 'Rashi ke swami graha ke liye classical upay',
    paras: [
      'Upay rashi ke liye nahi, **rashi ke swami graha** ke liye hote hain. Ye antar zaroori hai warna upay galat jagah lag jaata hai.',
      'Char maarg hain, aur teen mein paisa nahi lagta. **Mantra** — us graha ka beej ya vedic mantra. **Vaar aur vrat** — us graha ke din sanyam. **Daan** — us graha se judi vastu ka daan, usi din. **Devta** — us graha ke adhishthata devta ki upasana. Chautha maarg ratna hai, aur uski shart upar likhi hai.',
      'Ek imandar baat jo dohrayi jaani chahiye: **upay se karm ka phal halka hota hai, samapt nahi.** Jo koi mehnga upay bech kar poore samadhan ka wada kare, wo dar bech raha hai — chahe wo koi bhi ho.',
    ],
  },
  {
    id: 'vs-others',
    h2: 'AstroSage, Astrotalk aur Prokerala rashi calculator se farak',
    paras: [
      'Google in naamon ko is keyword ke saath bar-bar dikhata hai, isliye seedha uttar — aur usme wo bhi jo hamare paksh mein nahi jaata.',
      '**Rashi ke aankde mein antar nahi milega.** Adhikansh gambhir tool wahi Swiss Ephemeris aur wahi Lahiri Ayanamsha use karte hain. Rashi milni chahiye. Antar aaye to prayah ayanamsha ka chunav alag hai, jo kisi ki galti nahi. Un sites ke paas **zyada tool, zyada bhashaayein aur zyada purana domain authority** bhi hai — ye maan lena chahiye.',
      'Antar do jagah hai. **Ek** — adhikansh tool sirf tareekh maang kar rashi de dete hain, jo Chandra ke rashi badalne wale din galat nikal sakti hai; yahan samay maanga jaata hai aur wajah bata di jaati hai. **Do** — yahan naam-se-rashi ki seema chhupayi nahi jaati. Yahi daawa hai; baaki tulna aap khud kar lijiye.',
    ],
  },
  {
    id: 'sandhi',
    h2: 'Rashi sandhi — jab Chandra do rashiyon ke beech ho',
    paras: [
      'Ye sthiti aam hai aur iska pata na hone se galat rashi tay ho jaati hai.',
      'Chandra har **sawa do din** mein rashi badalta hai. Agar aapka janm us badlaav ke kuch ghanton ke andar hua hai, to **sirf tareekh se rashi tay nahi ho sakti** — do rashiyaan sambhav hain aur samay hi faisla karega.',
      'Iska ek vishesh roop **Gandanta** hai — jal aur agni rashiyon ki sandhi (Karka-Simha, Vrishchik-Dhanu, Meen-Mesh). Ise sookshm sthiti maana gaya hai aur kuch paramparaein wahan shanti-vidhi kehti hain. Par ghabrane ki baat nahi: **ye ashubh janm nahi hai**, sirf ek sandhi hai jise dhyan se padha jaata hai. Aisi sthiti mein sabse zaroori kaam yahi hai ki **janm samay hospital record se pukka kar liya jaaye.**',
    ],
  },
  {
    id: 'janm-samay',
    h2: 'Samay na pata ho to kya karein',
    paras: [
      'Rashi ke liye samay ki zaroorat lagna jitni sakht nahi hai, aur ye achhi khabar hai.',
      '**Adhikansh dinon mein sirf tareekh se rashi nikal aayegi**, kyunki Chandra poore din ek hi rashi mein rehta hai. Samay bilkul na ho to 12:00 maan liya jaata hai aur nateeja prayah sahi rehta hai.',
      'Do sthitiyon mein samay zaroori ho jaata hai. **Ek** — janm us din hua jab Chandra rashi badal raha tha. **Do** — aapko nakshatra aur pada bhi chahiye, kyunki wo har ek ghante mein badalta hai. Aur agar aage chal kar lagna, bhaav ya kundali dekhni hai to samay wahan **anivarya** hai — isliye ek baar janm pramanpatra se nikaal lena hamesha behtar hai.',
    ],
  },
  {
    id: 'free-kya',
    h2: 'Free mein kya milta hai',
    paras: [
      'Poora page free hai, aur ye saaf likh dena zaroori hai kyunki is kshetra mein "free" ka matlab prayah "aadha result" hota hai.',
      'Free mein milta hai: **Chandra Rashi**, uska **swami graha**, **tatva aur chinh**, us kshan ka **nakshatra**, anukool rang aur ank, aur classical upay. Koi signup nahi, koi card nahi, koi hissa chhupa kar nahi rakha jaata.',
      'Paid reading wahi output taala laga kar nahi hai. Wo poori kundali padhti hai — lagna, saare bhaav, yog, aur dasha ka kram — jo ek rashi-calculator kabhi nahi kar sakta, chahe kitna vistrit ho jaaye.',
    ],
  },
  {
    id: 'verify',
    h2: 'Result ko khud jaanchne ka tarika',
    paras: [
      'Kisi bhi tool par bharosa karne se pehle use parakhna chahiye. Yahan ka aankda parakhne layak hai.',
      'Wahi janm tithi, samay aur shahar kisi doosre bharose-mand software mein daaliye, ya **paramparik panchang** dekhiye. Chandra rashi milni chahiye — dono taraf Lahiri ayanamsha ho to antar nahi aayega.',
      'Agar alag aaye to teen jagah dekhiye: **ayanamsha** (Lahiri, Krishnamurti aur Raman alag aankde dete hain), **paddhati** (paashchatya app Sayana chalta hai, isliye prayah ek rashi ka farak aayega), aur **samay** (Chandra sandhi ke aas-paas janm ho to samay hi faisla karta hai). Teeno mein se koi galti nahi, bas alag maanak hai — par samay hamesha pehle jaanchiye.',
    ],
  },
  {
    id: 'barah-rashi-swabhav',
    h2: 'Barah rashi ka swabhav — ek-ek line mein',
    paras: [
      '**Mesh** — pahal, gati, seedhi baat; swami Mangal. **Vrishabh** — sthirta, sukh, dheeraj; swami Shukra. **Mithun** — jigyasa, sanvaad, chapalta; swami Budh. **Karka** — poshan, smriti, bhavuktа; swami Chandra.',
      '**Simha** — aatmvishwas, netritva, sammaan; swami Surya. **Kanya** — vishleshan, seva, sookshmata; swami Budh. **Tula** — santulan, sauhard, nyay; swami Shukra. **Vrishchik** — gehrai, sanyam, parivartan; swami Mangal.',
      '**Dhanu** — vistaar, darshan, yatra; swami Guru. **Makar** — anushasan, mehnat, dhairya; swami Shani. **Kumbh** — mauliktā, samuh, doorddrishti; swami Shani. **Meen** — karuna, kalpana, samarpan; swami Guru. Ye mote sanket hain — poora swabhav rashi ke saath **nakshatra aur lagna** milane par hi banta hai.',
    ],
  },
  {
    id: 'rashi-swami-ka-bal',
    h2: 'Rashi ka swami kitna balwan hai — asli sawal yahi hai',
    paras: [
      'Rashi jaan lena pehla kadam hai. Doosra kadam prayah chhod diya jaata hai: **us rashi ka swami graha aapki kundali mein kitna balwan hai.**',
      'Wajah seedhi hai — rashi ka phal uske swami se chalta hai. Karka rashi ka swami Chandra hai; agar aapka Chandra balwan hai to Karka ke gun khul kar aate hain, aur kamzor hai to wahi gun dabe rehte hain. Do log ek hi rashi ke, par swami ke bal mein antar — aur anubhav bilkul alag.',
      'Ye bal Shadbala se naapa jaata hai — chhe drishtikonon se, aur us graha ke apne classical minimum ke saamne. Apne rashi swami ka bal dekhna ho to [Weak Planet Finder](/calculators/free-weak-planet-finder) free hai, aur sidhant [Shadbala](/learn/shadbala-planetary-strength-vedic-astrology) mein.',
    ],
  },
  {
    id: 'rashi-aur-dasha',
    h2: 'Rashi aur Dasha — vyaktigat samay yahan se aata hai',
    paras: [
      'Agar aap ye soch rahe hain ki "meri rashi to pata chal gayi, ab mera samay kaisa hai" — to jawab rashi mein nahi, **dasha** mein hai.',
      'Rashi ek sthir tathya hai; wo jeevan bhar nahi badalti aur isliye wo samay ke bare mein kuch nahi bata sakti. **Vimshottari Dasha** wo paddhati hai jo samay batati hai — kaunse graha ka daur chal raha hai aur kab badlega. Aur wo har vyakti ki alag hoti hai, kyunki wo **janm ke nakshatra** se shuru hoti hai.',
      'Yahi wajah hai ki ek hi rashi ke do log ek hi saal mein bilkul alag anubhav karte hain. Apni chal rahi dasha [Dasha Calculator](/calculators/free-dasha-calculator) se dekhiye; kram ka sidhant [Mahadasha explained](/learn/mahadasha-explained) mein hai.',
    ],
  },
  {
    id: 'app-alag-rashi',
    h2: 'Do app do alag rashi bata rahe hain — kya karein',
    paras: [
      'Ye shikayat aam hai aur iska hal seedha hai. Char sambhavit wajah hain, aur unhe isi kram mein jaanchiye.',
      '**Ek — paddhati.** Agar ek app paashchatya (Sayana) hai aur doosra Vedic (Nirayana), to lagbhag ek rashi ka farak hoga. Ye sabse aam wajah hai. **Do — kaunsa graha.** Kuch app Surya rashi dete hain, Vedic tool Chandra rashi. Alag graha, alag jawab.',
      '**Teen — ayanamsha.** Lahiri, Krishnamurti aur Raman thoda alag aankda dete hain, aur sandhi ke aas-paas isse rashi badal sakti hai. **Char — samay.** Agar aapke janm ke din Chandra rashi badal raha tha to samay hi faisla karega, aur galat samay galat rashi degi.',
      'Kya karein: **pehle samay pukka kijiye** (janm pramanpatra se), phir dekhiye ki tool Vedic hai ya paashchatya, aur ayanamsha Lahiri hai ya nahi. Teen jaanch ke baad prayah uljhan khatm ho jaati hai.',
    ],
  },
  {
    id: 'rashi-rang-ank',
    h2: 'Rashi ke anukool rang, din aur ank',
    paras: [
      'Ye jaankari result mein aati hai, aur iska aadhaar rashi ka **swami graha** hai — rashi khud nahi.',
      '**Surya** — laal aur narangi, Ravivar. **Chandra** — safed aur silver, Somwar. **Mangal** — laal, Mangalwar. **Budh** — hara, Budhwar. **Guru** — peela, Guruwar. **Shukra** — safed aur gulabi, Shukrawar. **Shani** — neela aur kaala, Shanivar. Aapki rashi ka jo swami hai, wahi rang aur din aapke liye anukool maane jaate hain.',
      'Kitna vazan dena chahiye — imandari se, **bahut zyada nahi.** Ye sahayak sanket hain, niyam nahi. Anukool rang pehanne se kisi kamzor graha ka bal nahi badalta; wo mantra, vrat aur daan jaise classical upayon se hota hai. Rang ko ek chhota sa sahara maaniye, samadhan nahi.',
    ],
  },
  {
    id: 'seema',
    h2: 'Sirf rashi se poora faisla mat kijiye',
    paras: [
      'Aakhri baat, aur wo bhi utni hi seedhi honi chahiye jitni baaki page hai.',
      'Rashi barah mein se ek hai. Iska matlab hai ki **duniya ke har barahve vyakti ki rashi aapki hi hai** — aur unka jeevan aapke jaisa nahi hai. Isliye rashi se vyaktigat bhavishyavani nahi ban sakti, chahe wo kitni bhi vistrit likhi jaaye.',
      'Vyaktigat cheez teen se banti hai: **lagna** (jo har do ghante badalta hai), **bhaavon ki sthiti**, aur **dasha ka kram** (jo janm nakshatra se shuru hoti hai). Teeno milne ki sambhavna do ajnabiyon mein lagbhag na ke barabar hai — aur wahi aapka apna chart hai. Poori kundali free banane ke liye [Kundali Calculator](/calculators/free-kundali-calculator).',
    ],
  },
  {
    id: 'rashi-aur-maa',
    h2: 'Rashi aur maa ka rishta — Chandra ka doosra kaarakattva',
    paras: [
      'Chandra sirf mann ka kaarak nahi hai — wo **maa** ka bhi kaarak hai, aur isi kaaran rashi ka ek pahlu maa se juda hua padha jaata hai.',
      'Shastriya sanket ye hai: **balwan Chandra** ko maa ke saath sahaj sambandh aur bhavnaatmak sahare se joda jaata hai; **peedit Chandra** ko us kshetra mein doori ya kami se. Isme chaturth bhaav bhi jud jaata hai, kyunki wo bhi maa aur ghar ka bhaav hai.',
      'Par yahan seema saaf rakhni chahiye. **Ye kisi rishte ka nirnay nahi hai.** Maa ke saath ka sambandh paristhiti, swabhav aur jeevan ki ghatnaon se banta hai — kundali usme se ek parat dikhati hai, poora chitra nahi. Chandra ki dasha ka vistaar [Chandra Mahadasha](/blog/chandra-mahadasha-mental-health) mein hai.',
    ],
  },
  {
    id: 'rashi-vrat-din',
    h2: 'Rashi ke hisaab se vrat aur din — kya aadhaar hai',
    paras: [
      'Log poochhte hain "meri rashi ke liye kaunsa vrat karna chahiye". Aadhaar rashi nahi, **rashi ka swami graha** hai.',
      'Kram ye hai: apni rashi ka swami dekhiye, phir us graha ka **vaar**. Surya — Ravivar. Chandra — Somwar. Mangal — Mangalwar. Budh — Budhwar. Guru — Guruwar. Shukra — Shukrawar. Shani — Shanivar. Usi din ka vrat aur us graha se judi vastu ka daan classical upay maane jaate hain.',
      'Ek zaroori sudhar: **vrat kamzor graha ke liye kiya jaata hai, har graha ke liye nahi.** Agar aapki rashi ka swami pehle se balwan hai to uska vrat karne se koi vishesh laabh nahi — mehnat wahan lagni chahiye jahan kami hai. Kaun kamzor hai, ye [Weak Planet Finder](/calculators/free-weak-planet-finder) bata deta hai.',
    ],
  },
  {
    id: 'rashi-career',
    h2: 'Rashi se career — kitna maanein',
    paras: [
      'Internet par "aapki rashi ke liye best career" jaisi soochiyaan bahut milti hain. Inka aadhaar kamzor hai aur wajah samajh leni chahiye.',
      'Career ka bhaav **dasham** hai, aur uska vishleshan **dasham bhaav, uska swami, Dasamsa (D-10) aur chal rahi dasha** se hota hai — rashi se nahi. Rashi barah mein se ek hai; agar rashi se career tay hota to duniya ke har barahve vyakti ka kaam ek jaisa hota.',
      'Rashi ka itna hissa zaroor hai ki uska **swami graha** aapke jhukav mein dikhta hai — Budh pradhan ho to vishleshan aur sanvaad, Mangal pradhan ho to kriya aur takniki. Par ye jhukav hai, disha nahi. Sahi vishleshan [Best career from your birth chart](/learn/best-career-birth-chart) aur [Career Prediction Astrology](/learn/career-prediction-astrology) par hai.',
    ],
  },
  {
    id: 'bachche-ki-rashi',
    h2: 'Bachche ki rashi nikalna — kis cheez ka dhyan rakhein',
    paras: [
      'Naye bachche ke liye ye page prayah naamkaran ke sandarbh mein khola jaata hai, isliye kram bata dena upyogi hai.',
      '**Pehle sateek janm samay likh lijiye** — hospital record se, yaad se nahi. **Phir rashi aur nakshatra dono nikaaliye**, kyunki naam ka akshar rashi se nahi, **nakshatra ke pada** se aata hai. Rashi us pada ke saath apne aap mel kha jaati hai.',
      'Do cheezein alag se dekh lijiye. **Gandmool** — agar nakshatra Ashwini, Ashlesha, Magha, Jyeshtha, Mula ya Revati hai to paramapara mein 27 din baad Mool Shanti ki vidhi hai; ye ashubh janm nahi, sirf ek vidhi ka sanket hai. **Rashi sandhi** — agar Chandra rashi badalne ke aas-paas janm hua ho to samay hi faisla karega. Sahi pada aur akshar [Baby Name by Nakshatra](/calculators/free-baby-name-by-nakshatra) par milta hai.',
    ],
  },
  {
    id: 'rashi-list-chart',
    h2: 'Rashi Nakshatra list — poora naksha ek jagah',
    paras: [
      'Puri list yaad rakhna zaroori nahi, par dhancha samajh lena kaam ka hai.',
      'Ganit ye hai: **sattais nakshatra, har ek 13 degree 20 minute ka. Barah rashi, har ek 30 degree ki.** Isliye ek rashi mein **do poore nakshatra aur ek nakshatra ka ek chauthai hissa** aata hai — kul sawa do nakshatra, yaani nau pada.',
      'Kram is tarah chalta hai: **Mesh** — Ashwini, Bharani, aur Krittika ka pehla pada. **Vrishabh** — Krittika ke baaki teen pada, Rohini, aur Mrigashira ke do pada. Isi kram mein aage. Isi liye ek hi nakshatra do rashiyon mein pad sakta hai, aur pada dekhna zaroori ho jaata hai. Poori soochi [Nakshatra Guide](/learn/nakshatra-guide) mein hai.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Aage kya padhein',
    paras: [
      'Rashi ke baad agla swabhavik kadam — nakshatra aur pada ke liye [Nakshatra Calculator](/calculators/free-nakshatra-calculator), poori kundali ke liye [Kundali Calculator](/calculators/free-kundali-calculator), aur lagna ke liye [Lagna Calculator](/calculators/free-lagna-calculator).',
      'Rashi se jude sawal — Sade Sati ke liye [Sade Sati Calculator](/calculators/free-sade-sati-calculator), bachche ke naam ke liye [Baby Name by Nakshatra](/calculators/free-baby-name-by-nakshatra), aur ratna ke liye [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator).',
      'Ank-shastra alag vishay hai — [Numerology Calculator](/calculators/free-numerology-calculator) aur [Lucky Day Calculator](/calculators/free-lucky-day-calculator). Sidhant samajhna ho to [Planets in Astrology](/learn/planets-in-astrology) aur [Nakshatra Guide](/learn/nakshatra-guide).',
    ],
  },
];

type RcLink = { href: string; label: string; note: string };

const HUB_CALC: RcLink[] = [
  { href: '/calculators/free-nakshatra-calculator', label: 'Nakshatra Calculator', note: 'Rashi se sookshm' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Doosri "rashi"' },
  { href: '/calculators/free-lagna-bal-calculator', label: 'Lagna Bal Calculator', note: 'Lagna kitna mazboot' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-sade-sati-calculator', label: 'Sade Sati Calculator', note: 'Chandra rashi se chalti hai' },
  { href: '/calculators/free-baby-name-by-nakshatra', label: 'Baby Name by Nakshatra', note: 'Naam ka shubh akshar' },
  { href: '/calculators/free-numerology-calculator', label: 'Numerology Calculator', note: 'Mulank aur bhagyank' },
  { href: '/calculators/free-lucky-day-calculator', label: 'Lucky Day Calculator', note: 'Shubh din' },
  { href: '/calculators/free-weak-planet-finder', label: 'Weak Planet Finder', note: 'Rashi swami ka bal' },
];

const HUB_LEARN: RcLink[] = [
  { href: '/learn/nakshatra-guide', label: 'Nakshatra Guide', note: 'Sattais nakshatra' },
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Rashi swami ka kaarakattva' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Dignity — uchch aur neech', note: 'Rashi mein graha ka bal' },
  { href: '/learn/mahadasha-explained', label: 'Mahadasha explained', note: 'Vyaktigat samay' },
  { href: '/learn/how-to-wear-gemstone-vedic', label: 'Ratna pehanne ki vidhi', note: 'Faisle ke baad' },
  { href: '/learn/gemstone-astrology-vedic', label: 'Gemstone Astrology', note: 'Ratna ka sidhant' },
  { href: '/blog/shani-mahadasha-effects-guide', label: 'Shani Mahadasha', note: 'Sade Sati se alag' },
  { href: '/learn/raj-yoga', label: 'Raj Yoga', note: 'Yog ka sidhant' },
  { href: '/learn/shadbala-planetary-strength-vedic-astrology', label: 'Shadbala', note: 'Bal naapne ka tarika' },
];

function RcRich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <Link key={`${k}-l-${i}`} href={link[2]} className="font-semibold underline underline-offset-2 hover:opacity-80" style={{ color: GOLD }}>
              {link[1]}
            </Link>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${k}-b-${i}`} style={{ color: GOLD }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={`${k}-s-${i}`}>{part}</span>;
      })}
    </>
  );
}

function RcHub({ items }: { items: RcLink[] }) {
  return (
    <ul className="space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="group block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold" style={{ color: GOLD }}>{i.label}</span>
            <span className="block text-xs text-slate-500">{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function FreeRashiCalculatorPage() {
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

  // ─── RASHI extraction ─── Chandra Rashi = Moon's sign ────────
  const grahas: any[] = result?.kundali?.grahas ?? [];
  const moonGraha = grahas.find((g: any) => g.planet === 'Moon') ?? null;
  const sunGraha = grahas.find((g: any) => g.planet === 'Sun') ?? null;

  const chandraRashi = moonGraha?.sign ?? null;
  const suryaRashi = sunGraha?.sign ?? null;
  const moonNakshatra = moonGraha?.nakshatra ?? null;
  const moonHouse = moonGraha?.house ?? null;

  const rashiDetails = chandraRashi ? RASHI_DATA[chandraRashi] || {} : {};

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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-rashi-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Rashi Calculator — Find Your Moon Sign (Chandra Rashi) Online',
    description:
      'Find your Chandra Rashi (Moon Sign) from your birth chart — ruling planet, element, symbol, favorable colors, lucky days, mantra, personality traits and 3 free Parashar remedies. Free Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Rashi Calculator',
    aboutEntities: ['Rashi', 'Moon', 'Chandra Rashi', 'Moon Sign'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Moon Sign', 'Rashi'],
    howToName: 'How to find your Chandra Rashi (Moon Sign)',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Locate the Moon', text: "The calculator computes the Moon's exact zodiac position using Swiss Ephemeris with Lahiri Ayanamsha to find your Chandra Rashi." },
      { name: 'Get your result', text: 'See your Moon sign, ruling planet, element, symbol, favorable colors, lucky days, mantra and 3 free Parashar remedies.' },
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
            <span style={{ color: GOLD }}>Free Rashi Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Rashi Calculator — Find Your Moon Sign (Chandra Rashi) Online
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Rashi Calculator</strong> aapki Chandra Rashi (Moon Sign) Swiss Ephemeris se calculate karta hai — Chandra ki exact position se. Date, time, aur place daalo — Rashi, ruling planet, element, symbol, favorable colors, lucky days, personality traits, aur 3 free Parashar remedies (Mantra, Ratna, Daan) turant milte hain. 100% free, BPHS classical rules ke according.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS · Lahiri Ayanamsha · Shadbala · Bhrigu Nandi</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Chandra Rashi (Free)</h2>
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
                {loading ? '⟳ Finding Rashi...' : '🌙 Find My Rashi'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Shadbala · Bhrigu Nandi</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* RASHI HERO */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                  {form.name ? `${form.name}'s ` : ''}Chandra Rashi (Moon Sign)
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: GOLD }}>
                  🌙 {chandraRashi || '—'}
                </div>
                {rashiDetails.en && (
                  <div className="text-base text-slate-300">
                    ({rashiDetails.en}) <span style={{ color: GOLD }} className="mx-2">·</span> Symbol: <span style={{ color: GOLD }}>{rashiDetails.symbol}</span>
                  </div>
                )}
                {moonNakshatra && (
                  <div className="text-sm text-slate-400 mt-2">
                    Janma Nakshatra: <span style={{ color: GOLD }}>{moonNakshatra}</span>
                  </div>
                )}
                {suryaRashi && (
                  <div className="text-sm text-slate-400 mt-1">
                    Surya Rashi (Sun Sign): <span style={{ color: GOLD }}>{suryaRashi}</span>
                  </div>
                )}
                {rashiDetails.trait && (
                  <div className="text-sm text-slate-300 mt-4 italic">"{rashiDetails.trait}"</div>
                )}
              </div>

              {/* RASHI DETAILS */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>Rashi Details (Parashar BPHS)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DetailCell icon="🪐" label="Ruling Planet (Lord)" value={rashiDetails.lord} />
                  <DetailCell icon="🔥" label="Element (Tatva)" value={rashiDetails.element} />
                  <DetailCell icon="🏠" label="Moon House" value={moonHouse ? `${moonHouse}th Bhava` : null} />
                  <DetailCell icon="🎨" label="Favorable Colors" value={rashiDetails.colors} />
                  <DetailCell icon="📅" label="Lucky Day" value={rashiDetails.days} />
                  <DetailCell icon="🔱" label="Daily Mantra" value={rashiDetails.mantra} />
                </div>
                <p className="text-xs text-slate-500 mt-4 italic">
                  Chandra Rashi = Moon's exact zodiac position at birth. Primary basis for Vedic predictions, Dasha, and compatibility.
                </p>
              </div>

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

          {/* ── v2.0: TABLE OF CONTENTS ─────────────────────────── */}
          <nav aria-label="Is page par kya hai" className="mt-16 rounded-2xl p-5 md:p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <h2 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>Is Page Par Kya Hai</h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
              {SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <a href={`#${sec.id}`} className="hover:underline underline-offset-2" style={{ color: '#cbd5e1' }}>{sec.h2}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── v2.0: PILLAR CONTENT — keyword-driven H2 sections ── */}
          <section className="mt-12">
            {SECTIONS.map((sec, si) => (
              <div key={sec.id} id={sec.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{sec.h2}</h2>
                {sec.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">
                    <RcRich text={p} k={`s${si}-p${pi}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* comparison table — kept from v1.x, unchanged */}
          <section className="mt-4 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk Rashi Calculator</h2>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Element + Lord + Symbol</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Favorable Colors/Days</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Parashar Dos/Donts</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Mantra+Ratna+Daan</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── v2.0: the rashi cluster this page was barely linked to ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Rashi ke aage — baaki free calculators aur guide</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Rashi mota chitra hai. Sookshm chitra nakshatra se aata hai, aur poora chitra lagna aur kundali se. Sab free.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Aur bhi free calculators</h3>
                <RcHub items={HUB_CALC} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Sidhant samjhiye</h3>
                <RcHub items={HUB_LEARN} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Rashi Calculator</h2>
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
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Check' },
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

function Remedy({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1.5" style={{ color: GOLD }}>{title}</div>
      <div className="text-sm text-slate-300 leading-relaxed">{content}</div>
    </div>
  );
}
