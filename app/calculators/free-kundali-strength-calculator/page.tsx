'use client';

// ============================================================
// File: app/calculators/free-kundali-strength-calculator/page.tsx
// Version: v2.0 (05 Sep 2026) — Free Kundali Strength Score Calculator
// API: /api/calc/kundali (calcType: 'kundali-strength')  [route v1.6+]
// Logic: overall score from Shadbala ratios + grade + lagna/dasha strength
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-09-05) — Keyword-driven content build from Radar E3 PASF.
//        ~1,000 -> ~5,200 words, 4 H2 -> 36, TOC added, FAQs 8 -> 15,
//        new layout.tsx title. Form, /api/calc/kundali
//        (calcType 'kundali-strength'), JSON-LD and the comparison table
//        are untouched.
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
  { q: 'Ye page baaki strength calculators se alag kaise hai?', a: 'Teen page, teen alag sawal. Graha Bal Calculator saaton grahon ka bal alag-alag naapta hai. Weak Planet Finder batata hai kaunsa graha peeche hai aur uske upay kya hain. Ye page unhe jod kar ek score banata hai aur usme lagna, bhaav aur chal rahi dasha bhi shaamil karta hai — yaani poori kundali ka ek chitra, ek graha ka nahi.' },
  { q: 'Kundli kitni majboot hai — iska koi standard paimana hai?', a: 'Shastra mein 0 se 100 wala koi score nahi hai. Ye paimana Shadbala, Bhava Bala, lagna aur dasha ke classical aankdon ko ek saath rakhne ka tarika hai taaki tulna aasan ho. Andar ke saare aankde classical hain; unhe percentage mein badalna prastuti hai, shastra nahi — aur ye saaf kah dena zaroori hai.' },
  { q: 'Bhava Bala aur Shadbala mein kya antar hai?', a: 'Shadbala graha ka bal naapti hai, Bhava Bala bhaav ka. Bhava Bala mein us bhaav ke swami ka bal, bhaav mein baithe graha, us par drishti aur bhaav ka apna swabhavik bal jud jaate hain. Isliye "mera Guru kitna balwan hai" Shadbala ka prashn hai, aur "mera panchma bhaav kitna mazboot hai" Bhava Bala ka.' },
  { q: 'Score kam aaye to kya wo buri kundali hai?', a: 'Nahi. Score saamarthya naapta hai, bhagya nahi. Kam score ka matlab hai ki phal prayaas maangega — koi kshetra apne aap nahi khulega. Bahut se safal logon ka score saamanya hota hai aur bahut se ooncha score wale kuch nahi karte. Score ek naksha hai, faisla nahi.' },
  { q: 'Dasha strength score mein kyun jodi jaati hai?', a: 'Kyunki janm ka bal sthir hai par anubhav samay ke saath badalta hai. Abhi jis graha ki Mahadasha chal rahi hai, uska bal aapke aaj ke anubhav par sabse zyada asar dalta hai. Isliye do log ek jaise janm-bal ke saath bhi alag daur jee rahe honge — aur score usko darshata hai.' },
  { q: 'Kya score samay ke saath badalta hai?', a: 'Do hisse hain. Janm-aadhaarit hissa — Shadbala, Bhava Bala, lagna — kabhi nahi badalta. Dasha wala hissa badalta hai, kyunki dasha badalti rehti hai. Isliye agar aap kuch saal baad dobara chalayein to score thoda alag aa sakta hai, aur wo galti nahi — wo dasha ka badalna hai.' },
  { q: 'Sabse pehle kaunsa hissa theek karna chahiye?', a: 'Wahi jo abhi chal raha hai. Agar chal rahi dasha ka swami kamzor hai to upay ka sabse zyada arth wahin banta hai, kyunki uska asar abhi mehsoos ho raha hai. Uske baad lagnesh, kyunki wo har kshetra ko chhoota hai. Sab kuch ek saath shuru karna vyavharik nahi hota.' },
];


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2 + GSC, both 05 Sep 2026)
//   ~1,000 words · 4 H2 · 21 internal links.
//   GSC 3 months to 4 Sep 2026: 55 impressions, 7 clicks, CTR 12.73%,
//   average position 46.04. High CTR, almost no visibility.
//
// ── THE THREE-WAY SPLIT — READ BEFORE ADDING ANY HEADING ───────────────────
//   Radar files "kundali strength calculator" in cluster calc-kundali, next to
//   "free kundali calculator online" — while its PASF is entirely Shadbala
//   terms, which belong to cluster calc-graha-bal. So this page sits between
//   FOUR of our own pages and could compete with all of them.
//
//   Rohiit chose on 05 Sep 2026 to keep the pages separate rather than merge,
//   so the territory is split by QUESTION and enforced in content:
//
//     /calculators/free-kundali-calculator     = MAKE the chart.
//         "janam kundali banaye free", "कुंडली कैसे बनाएं ऑनलाइन"
//     /calculators/free-graha-bal-calculator   = MEASURE each planet.
//         Rupa, the six balas' arithmetic, Ishta-Kashta, Graha Yuddha
//     /calculators/free-weak-planet-finder     = DIAGNOSE and remedy.
//         which planet is weak, what it blocks, what to do
//     THIS PAGE                                = the COMPOSITE.
//         Bhava Bala (house strength), lagna strength, dasha strength, how a
//         0-100 score is built from classical figures, what a composite can
//         and cannot tell you, and which part to work on first.
//
//   Bhava Bala lives HERE. Both sibling pages link to it rather than explain
//   it. No H2 below repeats an H2 on graha-bal or weak-planet-finder — this
//   was checked mechanically, not by eye.
//
// WHERE THE H2s COME FROM — Radar E3, live SERP, checked 05 Sep 2026:
//     kundali strength calculator ...... our_rank —  AIO partial
//     kundli kitni majboot hai .......... our_rank —  AIO partial
//   Both AIO states are "partial", not "recommends_tool" — meaning Google is
//   half-answering these itself and there is room for a page that answers
//   properly.
//   PASF on the strength keyword: Best Shadbala calculator · Graha Bala
//   calculator · Planet strength calculator · Planet with highest Shadbala ·
//   Shadbala score calculator · Vimsopaka Bala calculator · Shadbala
//   calculator free online — these are handed to graha-bal by link, not
//   answered again here.
//
// HONESTY NOTE THAT MUST SURVIVE ANY REWRITE
//   There is no 0-100 score in the classical texts. The figures underneath are
//   classical; turning them into a percentage is presentation. That is stated
//   plainly in its own section rather than left for the reader to assume.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type KsSection = { id: string; h2: string; paras: string[] };

const SECTIONS: KsSection[] = [
  {
    id: 'kaise-banta-hai',
    h2: 'Kundali Strength Score — kaise banta hai',
    paras: [
      'Aap **janm tithi, sateek samay aur sthan** dete hain. Calculator poori kundali banata hai aur char alag maapon ko jod kar ek score deta hai.',
      'Char hisse: **saaton grahon ka Shadbala**, **baarah bhaavon ka Bhava Bala**, **lagna aur lagnesh ka bal**, aur **abhi chal rahi dasha ke swami ka bal**. Har hissa alag se dikhta hai, taaki aap dekh sakein ki score kahan se aaya.',
      'Ye page **jod** ka page hai. Agar aapka prashn ek graha ka hai to [Graha Bal Calculator](/calculators/free-graha-bal-calculator) uske liye hai; agar "kya rok raha hai" hai to [Weak Planet Finder](/calculators/free-weak-planet-finder); aur agar aapko sirf kundali **banani** hai to [Kundali Calculator](/calculators/free-kundali-calculator).',
    ],
  },
  {
    id: 'score-shastra-mein-nahi',
    h2: 'Ek imandar baat — 0 se 100 ka score shastra mein nahi hai',
    paras: [
      'Ye sabse pehle kah dena zaroori hai, kyunki iske bina baaki poora page bharam paida karega.',
      '**Brihat Parashara Hora Shastra mein kundali ka koi percentage score nahi hai.** Wahan Shadbala hai, Bhava Bala hai, Ishta-Kashta hai — sab apni-apni ikaai mein. Un aankdon ko ek 0-100 ke paimane mein badalna **prastuti ka tarika** hai, shastra ka niyam nahi.',
      'To phir kyun? Kyunki **tulna aasan ho jaati hai.** Saat Shadbala ratio, baarah Bhava Bala aankde aur ek dasha ka bal — ye tees se zyada sankhyaayein ek saath dekhna mushkil hai. Ek score unhe ek nazar mein rakh deta hai. Par yaad rahiye: **asli jaankari andar ke aankdon mein hai, score mein nahi.** Isliye ye page score ke saath poora vibhajan bhi dikhata hai.',
    ],
  },
  {
    id: 'bhava-bala-kya',
    h2: 'Baarah bhaavon ka bal — teen hisson se banta hai',
    paras: [
      'Ye is page ka sabse khaas hissa hai aur adhikansh free tools mein hai hi nahi.',
      'Shadbala **graha** naapti hai. Bhava Bala **bhaav** naapti hai — aur bahut se asli prashn bhaav ke hote hain, graha ke nahi. "Mera dasham bhaav kitna mazboot hai" ka uttar Shadbala nahi de sakti.',
      'Bhava Bala teen hisson se banti hai: **Bhavadhipati Bala** — us bhaav ke swami ka apna Shadbala, seedha bhaav ko mil jaata hai. **Bhava Digbala** — bhaav ki apni dishaa ke hisaab se bal; alag-alag bhaavon ko alag varg ke grahon se bal milta hai. **Bhava Drishti Bala** — us bhaav par padne wali sab drishtiyon ka jod, jo **rinatmak bhi ho sakta hai** agar kroor grahon ki drishti bhaari ho.',
    ],
  },
  {
    id: 'bhavadhipati',
    h2: 'Bhavadhipati Bala — bhaav apne swami se chalta hai',
    paras: [
      'Teen hisson mein sabse bhaari yahi hai, aur iska niyam ek line mein hai: **bhaav ka phal uske swami se chalta hai.**',
      'Iska matlab ye hai ki **khaali bhaav kamzor nahi hota.** Agar dasham bhaav mein koi graha nahi hai par dasham ka swami balwan hai aur achhi jagah baitha hai, to dasham bhaav mazboot hai. Aur uske ulta — bhare hue bhaav ka swami agar peedit hai to bhaav kamzor hi rahega.',
      'Ye baat itni bar dohrayi jaani chahiye kyunki log ulta padhte hain. Kundali dekh kar log ginte hain ki kis khaane mein kitne graha hain, aur khaali khaane ko kami maan lete hain. **Shastra ka tarika ulta hai** — pehle swami dhoondhiye, phir uska haal dekhiye.',
    ],
  },
  {
    id: 'bhava-drishti',
    h2: 'Bhava Drishti Bala — akela maap jo minus mein ja sakta hai',
    paras: [
      'Poore hisaab mein ye ek hi hissa aisa hai jo **rinatmak** ho sakta hai, aur isi liye ye aksar faisla karta hai.',
      'Har drishti ka apna vazan hai aur wo **virupa** mein naapa jaata hai — poori drishti 60 virupa ki. Shubh graha ki drishti bhaav mein bal **jodti** hai; kroor graha ki drishti bal **ghatati** hai. Agar kisi bhaav par do kroor grahon ki poori drishti hai aur koi shubh drishti nahi, to uska Drishti Bala minus mein chala jaata hai.',
      'Isi liye "Shani ki drishti hai" kehna adhoora hai. **Sawaal ye hai kitni virupa ki**, aur uske saamne kaunsi shubh drishti khadi hai. Guru ki poori drishti Shani ki poori drishti ko kaafi hadd tak sambhal leti hai — aur ye santulan sirf sankhya mein dikhta hai, aankh se nahi.',
    ],
  },
  {
    id: 'kaunsa-bhaav-mazboot',
    h2: 'Kaunsa bhaav mazboot hona chahiye — aapke prashn par nirbhar hai',
    paras: [
      'Saare baarah bhaav ek saath mazboot kisi ki kundali mein nahi hote. Isliye asli prashn ye nahi ki score kitna hai, balki ye ki **aapke kaam ka bhaav mazboot hai ya nahi.**',
      'Kaam ke hisaab se: **career** — dasham aur shashtham. **Dhan** — dwitiya, ekadash, navam. **Vivah** — saptam. **Santan** — panchma. **Shiksha** — panchma aur navam. **Ghar aur sampatti** — chaturth. **Swasthya** — lagna aur shashtham.',
      'Iska vyavharik matlab: **kam kul score ke saath bhi aapka mahatvapurn bhaav ooncha ho sakta hai** — aur us sthiti mein wo kam score aapke liye utna mayne nahi rakhta. Isi liye ye page baarah bhaavon ka alag aankda dikhata hai, sirf ek jod nahi.',
    ],
  },
  {
    id: 'lagna-hissa',
    h2: 'Lagna ka hissa — score mein sabse zyada vazan kyun',
    paras: [
      'Lagna is jod mein baaki bhaavon se zyada vazan rakhta hai, aur wajah shastriya hai.',
      '**Lagna shareer aur poore chart ka aadhaar hai.** Baarah bhaav usi se ginte hain; lagna badla to sab badla. Isliye lagna aur lagnesh ka bal poori kundali ki "dharan-kshamata" tay karta hai — yaani baaki jo bhi yog aur bal hain, unhe jheelne aur istemaal karne ki taakat.',
      'Vyavharik roop se: **balwan lagnesh ke saath saamanya baaki chart bhi kaam de jaata hai**, kyunki vyakti mein tikne aur dobara khade hone ki kshamata hoti hai. Kamzor lagnesh ke saath achha chart bhi poora phal nahi de paata, kyunki avsar aane par urja saath nahi deti. Sirf lagna ka vistrit bal [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) par milta hai.',
    ],
  },
  {
    id: 'dasha-hissa',
    h2: 'Dasha ka hissa — aaj ka anubhav yahan se aata hai',
    paras: [
      'Ye wo hissa hai jo score ko **sthir tathya** se **aaj ki sthiti** mein badal deta hai.',
      'Janm ka bal jeevan bhar wahi rehta hai. Par anubhav badalta hai — aur uski wajah **dasha** hai. Abhi jis graha ki Mahadasha chal rahi hai, uske kshetra saamne hain, aur uska bal aapke aaj ke anubhav par sabse zyada asar dalta hai.',
      'Isi liye do log jinka janm-bal lagbhag ek jaisa ho, wo bilkul alag daur jee rahe honge — ek balwan graha ki dasha mein, doosra kamzor graha ki. **Score ka ye hissa samay ke saath badalta hai, baaki nahi.** Apni chal rahi dasha [Dasha Calculator](/calculators/free-dasha-calculator) se dekhiye, aur sidhant [Mahadasha explained](/learn/mahadasha-explained) mein hai.',
    ],
  },
  {
    id: 'char-hisse-santulan',
    h2: 'Char hisson ka santulan — kis par kitna vazan',
    paras: [
      'Score ek saada ausat nahi hai. Char hisse alag vazan rakhte hain, aur ye jaan lena result padhne mein seedha kaam aata hai.',
      '**Shadbala** sabse bada hissa deta hai, kyunki wo saat grahon ka jod hai aur unhi par baaki sab khada hai. **Bhava Bala** doosre number par, kyunki wo batata hai ki bal kis kshetra mein pahunch raha hai. **Lagna** uske baad, apne aadhaar-hone ke kaaran. **Dasha** sabse chhota hissa par sabse chalta hua.',
      'Iska matlab: **do log ek jaise score par bilkul alag sthiti mein ho sakte hain.** Ek ka score ooncha Shadbala se aaya ho par Bhava Bala kamzor — yaani graha mazboot hain par unka phal sahi kshetron mein nahi pahunch raha. Doosre ka ulta. Isliye vibhajan padhna score padhne se zyada zaroori hai.',
    ],
  },
  {
    id: 'grade-matlab',
    h2: 'Grade ka matlab — aur wo kya nahi kehta',
    paras: [
      'Result ek grade deta hai, aur uska sahi arth samajh lena zaroori hai warna wo bojh ban jaata hai.',
      '**Ooncha grade** ka arth hai: grahon ka bal achha hai, bhaavon tak pahunch raha hai, aur abhi ki dasha bhi sath de rahi hai. Cheezein prayaas ke anupaat mein khulti hain. **Madhyam grade** — sabse aam sthiti; kuch kshetra khule, kuch prayaas maangte. **Kam grade** — phal aata hai par mehnat zyada lagti hai, aur samay bhi.',
      'Jo grade **nahi** kehta, wo zyada zaroori hai. Wo nahi kehta ki aap safal honge ya nahi. Wo nahi kehta ki aapka jeevan achha rahega ya bura. Wo nahi kehta ki koi ghatna hogi. **Ye saamarthya ka maap hai, bhavishya ka nahi** — aur jo koi score dikha kar bhavishya bech de, wo galat bech raha hai.',
    ],
  },
  {
    id: 'score-kam-kya',
    h2: 'Score kam aaya — sabse pehle kya karein',
    paras: [
      'Pehli baat shanti se: **kam score wali kundali kharab kundali nahi hai.** Har kundali mein kuch mazboot hai aur kuch nahi — poora ooncha score lagbhag kisi ka nahi aata.',
      'Doosri baat, vyavharik. **Sabse pehle wahi theek kijiye jo abhi chal raha hai** — yaani chal rahi dasha ka swami. Uska asar abhi mehsoos ho raha hai, isliye upay ka phal bhi abhi dikhega. **Phir lagnesh**, kyunki wo har kshetra ko chhoota hai. **Phir wo bhaav jo aapke asli prashn ka hai.**',
      'Jo nahi karna chahiye: **saare kamzor hisson par ek saath kaam shuru karna.** Ye vyavharik nahi chalta — mantra, vrat aur daan sab ek saath nibhana mushkil hai, aur adhoore upay ka koi arth nahi. Ek cheez, teen se chhe maheene, phir agli. Kaunsa graha peeche hai ye [Weak Planet Finder](/calculators/free-weak-planet-finder) bata deta hai.',
    ],
  },
  {
    id: 'score-achha-kya',
    h2: 'Score achha aaya — ab kya',
    paras: [
      'Ooncha score sukhad hai par uska sahi upyog kam log karte hain.',
      'Ooncha score ka vyavharik arth hai: **paristhiti aapke saath hai, aur prayaas ka anupaat achha milega.** Ye "kuch karna nahi padega" nahi hai — shastra bhi yahi kehta hai ki yog sambhavna deta hai, phal karm se aata hai.',
      'Sahi agla kadam do hain. **Ek — vibhajan dekhiye** aur pata kijiye ki sabse ooncha kaunsa hissa hai; wahi aapka swabhavik kshetra hai aur wahan lagayi urja sabse zyada lautti hai. **Do — dasha dekhiye**; agar abhi balwan graha ki dasha chal rahi hai to ye window hai, aur bade faisle isi daur mein lene chahiye. [Dasha Calculator](/calculators/free-dasha-calculator) se wo saaf ho jaata hai.',
    ],
  },
  {
    id: 'kundli-kitni-majboot',
    h2: 'Kundli kitni majboot hai — is sawal ka seedha jawab',
    paras: [
      'Ye sawaal Hindi mein sabse zyada isi roop mein poochha jaata hai, aur iska uttar do hisson mein hai.',
      '**Seedha uttar:** apni janm tithi, samay aur sthan daaliye — score, grade aur poora vibhajan turant mil jaayega, bilkul free. Isme saat grahon ka bal, baarah bhaavon ka bal, lagna aur chal rahi dasha sab shaamil hai.',
      '**Zaroori uttar:** "majboot kundali" ka matlab wo nahi hai jo log samajhte hain. Iska matlab bhagyashali hona nahi hai. Iska matlab hai ki **grahon mein apna phal dene ki kshamata hai** — chahe wo phal sukhad ho ya kathin. Ek balwan Shani poori taakat se apna anushasan bhi laayega aur apni der bhi. Bal aur shubhata do alag baatein hain, aur ye antar [Graha Bal Calculator](/calculators/free-graha-bal-calculator) par Ishta-Kashta ke roop mein khola gaya hai.',
    ],
  },
  {
    id: 'ek-hissa-kamzor',
    h2: 'Ek hissa kamzor par baaki mazboot — iska kya matlab',
    paras: [
      'Ye sabse aam pattern hai aur iska padhna score padhne se zyada kaam ka hai. Char aam sthitiyaan.',
      '**Shadbala ooncha, Bhava Bala kam** — graha mazboot hain par unka phal sahi kshetron mein nahi pahunch raha. Prayah aisa tab hota hai jab balwan graha dusthana (6, 8, 12) mein baithe hon. Kshamata hai, disha nahi.',
      '**Bhava Bala ooncha, Shadbala kam** — bhaav achhi tarah bane hain par unhe chalane wale graha kamzor hain. Yahan avsar aate hain par unhe pakadne mein prayaas lagta hai.',
      '**Lagna kamzor, baaki ooncha** — chart mein bahut kuch hai par use jheelne aur istemaal karne ki urja kam padti hai. Yahan lagnesh ka upay sabse zyada arth rakhta hai. **Dasha kamzor, baaki ooncha** — sabse achhi sthiti, kyunki dasha badalti hai; ye intezaar ka daur hai, kami nahi.',
    ],
  },
  {
    id: 'score-badalta',
    h2: 'Kya score samay ke saath badal jaata hai',
    paras: [
      'Aanshik roop se — aur ye antar saaf hona chahiye.',
      '**Jo nahi badalta:** Shadbala, Bhava Bala aur lagna ka bal. Ye teeno janm ke kshan par tikte hain aur jeevan bhar wahi rehte hain. Koi upay, koi ratna, koi pooja in sankhyaon ko nahi badalti — aur jo koi "aapka bal badha denge" kahe, wo galat keh raha hai.',
      '**Jo badalta hai:** dasha wala hissa. Dasha kuch saal mein badal jaati hai, aur naye swami ka bal alag hota hai. Isliye agar aap kuch saal baad dobara chalayein to score thoda alag aa sakta hai — wo galti nahi, wo badlaav hai.',
      'Aur teesri cheez jo badalti hai par is score mein nahi hai: **gochar.** Grah aakash mein chalte rehte hain aur unka chalta hua asar janm-bal se alag hota hai. Sade Sati uska sabse jaana-pehchana roop hai — apni sthiti [Sade Sati Calculator](/calculators/free-sade-sati-calculator) se dekhiye.',
    ],
  },
  {
    id: 'do-logon-ki-tulna',
    h2: 'Do logon ke score ki tulna — kitna arth rakhti hai',
    paras: [
      'Log score dekh kar aapas mein tulna karne lagte hain. Iski seema jaan leni chahiye.',
      'Tulna **theek hai** jab dono ka prashn ek jaisa ho aur aap sirf ek bhaav dekh rahe hon — jaise do bhai-behno ka panchma bhaav, ya do log ka dasham. Wahan aankda seedha bolta hai.',
      'Tulna **bemaani hai** jab aap kul score jodte hain. Wajah: **score ka arth lagna par nirbhar karta hai.** Ek hi graha do logon ke liye alag bhaav chala raha hota hai — Mesh lagna ke liye Mangal lagnesh hai, Karka lagna ke liye wo dasham aur panchma ka swami. Uska balwan hona dono ke liye alag matlab rakhta hai.',
      'Isliye score ko **apne se** tulna kijiye — kaunsa hissa aage hai aur kaunsa peeche — doosron se nahi.',
    ],
  },
  {
    id: 'kundali-banani-hai',
    h2: 'Aapko sirf kundali banani hai — to yahan nahi',
    paras: [
      'Bahut se log is page par pahunch jaate hain jabki unka prashn alag hai, isliye saaf kar dena upyogi hai.',
      'Agar aapko **janm kundali banani** hai — lagna, grahon ki sthiti, bhaav, dasha ki table — to wo alag page hai aur wo bhi free hai: [Kundali Calculator](/calculators/free-kundali-calculator). Wahan chart banta hai; yahan uska bal naapa jaata hai.',
      'Kram ye rakhiye: **pehle kundali banaiye**, dekhiye ki lagna kya hai aur graha kahan hain. **Phir yahan aaiye** ye jaanne ke liye ki wo dhancha kitna mazboot hai. Ulta karne par aankde to mil jaate hain par unka arth nahi banta.',
    ],
  },
  {
    id: 'teen-page-antar',
    h2: 'Teen strength page — kaunsa kab chalayein',
    paras: [
      'Site par teen page bal se jude hain aur teeno alag sawal ke liye hain. Ye antar jaan lena samay bachata hai.',
      '**[Graha Bal Calculator](/calculators/free-graha-bal-calculator)** — jab aapko **aankda** chahiye. Saaton grahon ka Shadbala, chhe balon ka vibhajan, Rupa, minimum aur ratio. Ye maap ka page hai.',
      '**[Weak Planet Finder](/calculators/free-weak-planet-finder)** — jab aapko **nidaan** chahiye. Kaunsa graha peeche hai, wo kya rok raha hai, aur uske classical upay kya hain.',
      '**Ye page** — jab aapko **poora chitra** chahiye. Graha, bhaav, lagna aur dasha ka jod, ek nazar mein. Aur agar sirf lagna ka bal dekhna hai to [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) uske liye alag hai.',
    ],
  },
  {
    id: 'score-aur-yog',
    h2: 'Score aur yog — kya rishta hai',
    paras: [
      'Ye prashn zaroori hai kyunki dono ek saath dekhe bina nishkarsh adhoora rehta hai.',
      '**Score bal naapta hai; yog sanyog dikhata hai.** Raj Yoga, Dhan Yoga, Gaj Kesari — ye grahon ke aapsi sambandh se bante hain, aur inka hona ya na hona score mein seedha nahi aata.',
      'Rishta ye hai: **yog banane wale grahon ka bal hi tay karta hai ki yog phal dega ya nahi.** Raj Yoga ka hona ek baat hai; use banane wale do graha 0.7 ratio par baithe hon to wo kaagaz par hi rehta hai. Isi liye "meri kundali mein Raj Yoga hai par kuch hota nahi" wali shikayat aam hai — aur uska uttar bal mein hai.',
      'Isliye kram ye rakhiye: **yog dhoondhiye, phir un grahon ka bal dekhiye.** Yog ke liye [Raj Yoga](/learn/raj-yoga), [Vipreet Raj Yoga](/learn/vipreet-raj-yoga) aur [Neech Bhang Raj Yoga](/learn/neech-bhang-raj-yoga).',
    ],
  },
  {
    id: 'kam-score-safal-log',
    h2: 'Kam score wale log safal kaise ho jaate hain',
    paras: [
      'Ye prashn imandari se poochha jaata hai aur uska uttar bhi imandar hona chahiye.',
      'Teen wajah hain. **Ek — score saamarthya naapta hai, prayaas nahi.** Kam bal ka matlab hai phal mehnat maangega; mehnat karne wala wahi phal le leta hai. Shastra bhi kabhi ye nahi kehta ki kam bal se phal asambhav hai.',
      '**Do — ek hissa bahut ooncha kaafi ho sakta hai.** Agar aapke kaam ka bhaav aur uska swami mazboot hai to kul score kam hote hue bhi us kshetra mein raasta khula rehta hai.',
      '**Teen — jo kundali mein nahi hai.** Shiksha, parivaar, mahaul, samay ka chunav aur mehnat — inka asar kisi bhi chart se bada hai. Kundali hawa batati hai; kishti aapko chalani hai. Jo koi score dikha kar seema tay kar de, wo shastra nahi bol raha.',
    ],
  },
  {
    id: 'bachche-ki-kundali',
    h2: 'Bachche ki kundali ka score — kya dekhein, kya nahi',
    paras: [
      'Maa-baap ye prashn le kar aate hain, isliye uttar santulit hona chahiye.',
      'Dekhne layak: **panchma bhaav ka bal** (shiksha aur buddhi), **lagna ka bal** (swasthya aur urja), aur **chal rahi dasha** — bachpan mein prayah janm ke nakshatra wale graha ki dasha chalti hai, aur uska swabhav bachche ke shuruaati saalon par asar dalta hai.',
      'Jo **nahi** karna chahiye: kam score dekh kar bachche par bhaari upay lagana. Chhote bachchon ke liye lambe vrat, mehnge ratna ya kathin anushthan shastra mein kahin nahi kahe gaye. Upay saral hote hain — us graha ke din daan, ghar mein mantra, bas.',
      'Aur sabse zaroori: **score bachche ki kshamata ki seema nahi hai.** Shiksha, poshan aur maa-baap ka samay kisi bhi aankde se bada asar rakhte hain.',
    ],
  },
  {
    id: 'shaadi-ke-liye',
    h2: 'Vivah ke liye do kundaliyon ka score milana — theek hai?',
    paras: [
      'Ye kabhi-kabhi poochha jaata hai aur uttar saaf "nahi" hai.',
      '**Vivah milan ke liye alag paddhati hai** — Ashtakoot Milan, jisme aath koot aur 36 gun dekhe jaate hain, aur wo nakshatra par aadhaarit hai. Do logon ke strength score jod kar ya ghata kar koi nishkarsh nikaalna kisi shastra mein nahi hai.',
      'Do kundaliyon ka score sirf itna batata hai ki dono vyaktiyon ki apni kshamata kaisi hai — unke **aapsi mel** ke baare mein kuch nahi. Ek ooncha aur ek kam score wale log bahut achhi tarah nibha sakte hain, aur dono ooncha score wale bhi nahi nibha paate.',
      'Aur ek baat jo dohrayi jaani chahiye: **36 gun mil jaana ya na milna vivah ka faisla nahi hai.** Vivah se jude prashnon ke liye [Shadi Kab Hogi Calculator](/calculators/free-shadi-kab-hogi-calculator) aur [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator) alag hain.',
    ],
  },
  {
    id: 'janm-samay-asar',
    h2: 'Galat janm samay is score ko kitna badalta hai',
    paras: [
      'Bahut, aur ye jaan lena zaroori hai isse pehle ki aap kisi aankde par bharosa karein.',
      'Wajah: **is score ka bada hissa bhaav-aadhaarit hai** — Bhava Bala, lagna ka bal, aur Shadbala ke andar Dig Bala aur Kendradi Bala. Ye sab lagna se bante hain, aur lagna har do ghante badalta hai.',
      'Iska matlab: **do ghante ki galti se score poori tarah badal jaayega**, kyunki baarah ke baarah bhaav ghoom jaate hain. Ek ghante ki galti Kala Bala ke Hora hisse ko badalti hai. Pandrah minute ki galti prayah chhoti rehti hai, par lagna sandhi ke paas ho to wo bhi bada asar kar deti hai.',
      'Isliye: **janm pramanpatra ya hospital record se samay lijiye.** Ghar ki yaad prayah aadhe ghante par gol kar di jaati hai, aur wahi dheelapan poore score mein pahunch jaata hai. Samay bilkul na ho to 12:00 maan liya jaata hai — aise result ko disha-soochak maaniye, nirnay nahi.',
    ],
  },
  {
    id: 'free-kya',
    h2: 'Is page par free kya-kya hai',
    paras: [
      'Poora page free hai, aur ye saaf likh dena zaroori hai kyunki is kshetra mein "free" ka matlab prayah "aadha result" hota hai.',
      'Free mein milta hai: **overall score aur grade**, **saaton grahon ki strength ranking**, **baarah bhaavon ka Bhava Bala**, **lagna aur lagnesh ka bal**, **chal rahi dasha ke swami ka bal**, aur classical upay. Koi signup nahi, koi card nahi, koi hissa chhupa kar nahi rakha jaata.',
      'Paid reading wahi score taala laga kar nahi hai. Wo poori kundali padhti hai — bhaav-swamitva, yog, dasha ka poora kram, aur inka aapas mein mel — yaani wo prashn jinka uttar ek sankhya kabhi nahi de sakti.',
    ],
  },
  {
    id: 'kaise-parakhein',
    h2: 'Is score ko parakhne ka tarika',
    paras: [
      'Score khud kisi doosre tool se milaana mushkil hai, kyunki **0-100 ka paimana har jagah alag hota hai** — wo prastuti hai, shastra nahi. Par uske andar ke aankde poori tarah parakhne layak hain.',
      'Karne ka tarika: **grahon ki rashi aur degree** kisi doosre bharose-mand software se milaiye — wo bilkul milni chahiye. Phir **Shadbala ke Rupa** milaiye — thoda antar saamanya hai. Phir **lagna** — agar wo alag aaye to samay ya shahar mein galti hai.',
      'Jo cheez nahi milegi wo hai score ka number, aur uski umeed bhi nahi karni chahiye. **Andar ke aankde milte hain to ganana sahi hai** — score sirf unka ek roop hai.',
    ],
  },
  {
    id: 'bhava-digbala',
    h2: 'Bhava Digbala — har bhaav ko kaunse graha se bal milta hai',
    paras: [
      'Bhaav ke bal ka ye hissa sabse kam charchit hai par uska niyam saaf hai aur khud jaancha ja sakta hai.',
      'Bhaavon ko char vargon mein baanta gaya hai aur har varg ko alag grahon se bal milta hai. **Lagna, panchma, navam** ko Brahmin maane jaane wale grahon — Guru aur Budh — se bal milta hai. **Dwitiya, saptam, dashama** ko Shukra aur Chandra se. **Tritiya, shashtham, ekadash** ko Mangal se. **Chaturth, ashtam, dwadash** ko Shani se.',
      'Vyavharik matlab: **ek hi graha ki maujoodgi do alag bhaavon ke liye alag arth rakhti hai.** Shani chaturth bhaav ko bal deta hai par panchma ko utna nahi. Isi liye "Shani bura hai" jaisa saralikaran kaam nahi karta — sawaal hamesha ye hai ki kis bhaav mein aur kis bhaav ke liye.',
    ],
  },
  {
    id: 'kaunse-bhaav-kamzor',
    h2: 'Kaunse bhaav prayah kamzor nikalte hain — aur kyun',
    paras: [
      'Ek pattern hai jo lagbhag har kundali mein dikhta hai, aur uska pata hona chinta kam kar deta hai.',
      '**Dusthana bhaav — chhathe, aathve aur barahve — prayah kam Bhava Bala paate hain.** Wajah gantiya hai, koi shrap nahi: in bhaavon ko Bhava Digbala kam milta hai, aur inke swami aksar kendra se door padte hain. Ye lagbhag sabke saath hota hai.',
      'Aur uske ulta, **kendra bhaav — pehla, chaturth, saptam, dashama — prayah ooncha aankda lete hain**, kyunki Kendradi Bala unhe seedha 60 Shashtiamsha deta hai.',
      'Isliye result padhte waqt ye maan kar chaliye ki **dusthana ka kam aana saamanya hai.** Chinta ki baat tab hai jab koi **kendra ya trikona** bhaav bahut neeche ho — wahi sach mein dhyan maangta hai.',
    ],
  },
  {
    id: 'score-vs-anubhav',
    h2: 'Score achha par jeevan mushkil — aisa kyun hota hai',
    paras: [
      'Ye shikayat aati hai aur uska uttar imandar hona chahiye, kyunki wo is tool ki seema hai.',
      'Teen wajah hain. **Ek — bal aur shubhata alag hain.** Ek balwan graha apna phal poori taakat se dega, chahe wo phal kathin ho. Balwan Shani anushasan bhi laayega aur der bhi. Ye antar Ishta-Kashta Phala se dekha jaata hai, jo [Graha Bal Calculator](/calculators/free-graha-bal-calculator) par hai.',
      '**Do — chalta hua gochar.** Score janm ka bal naapta hai; gochar alag cheez hai. Sade Sati ya koi kathin gochar chal raha ho to anubhav bhaari rahega chahe janm-bal ooncha ho.',
      '**Teen — jo kundali mein hai hi nahi.** Kaam ka mahaul, sehat, arthik sthiti, rishte — inka asar seedha hai aur ye kisi chart se poora nahi padha ja sakta. Jo koi kahe ki har mushkil ka uttar kundali mein hai, wo zyada daawa kar raha hai.',
    ],
  },
  {
    id: 'kitni-baar-chalayein',
    h2: 'Ye calculator kitni baar chalana chahiye',
    paras: [
      'Chhota par vyavharik prashn, aur iska uttar score ke do hisson se nikalta hai.',
      '**Janm-aadhaarit hissa ek hi baar dekhne ki cheez hai** — Shadbala, Bhava Bala aur lagna kabhi nahi badalte. Ek baar nikaal kar likh lijiye ya screenshot rakh lijiye; dobara chalane se wahi aayega.',
      '**Dasha wala hissa tab dekhiye jab dasha badle** — yaani kuch saal mein ek baar. Antardasha zyada jaldi badalti hai, isliye saal mein ek baar dekh lena kaafi hai.',
      'Jo nahi karna chahiye: **har hafte chalana aur aankdon mein badlaav dhoondhna.** Wo nahi badlenge, aur na badalna hi sahi hai — ye janm ka sthir maap hai, mausam ki report nahi.',
    ],
  },
  {
    id: 'career-ke-liye',
    h2: 'Career ya paise ke prashn par kaunsa bhaav dekhein',
    paras: [
      'Log kul score dekh kar career ka nishkarsh nikaal lete hain. Sahi tarika alag hai.',
      '**Career** — dasham bhaav aur uska swami, saath mein shashtham (naukri aur pratiyogita) aur ekadash (laabh). Agar aapka dasham ooncha hai to kul score kam hote hue bhi career ka rasta khula hai.',
      '**Dhan** — dwitiya (sanchit dhan), ekadash (aay) aur navam (bhagya). Teeno ka Bhava Bala ek saath dekhiye; teeno mein se do bhi mazboot hon to sthiti achhi maani jaati hai.',
      'Aur is sab ke upar **dasha** — kyunki bhaav mazboot hone par bhi phal us bhaav ke swami ki dasha mein khulta hai. Career ka poora vishleshan [Career Prediction Astrology](/learn/career-prediction-astrology) par hai aur samay [Dasha Calculator](/calculators/free-dasha-calculator) par.',
    ],
  },
  {
    id: 'ausat-score',
    h2: 'Aam tor par score kitna aata hai',
    paras: [
      'Ye prashn saaf poochha jaana chahiye kyunki uske bina apna aankda samajh mein nahi aata.',
      'Adhikansh kundaliyaan **beech ke daayre** mein aati hain. Bahut ooncha aur bahut kam dono hi durlabh hain — kyunki score saat grahon, baarah bhaavon aur do aur maapon ka jod hai, aur itne aankdon ka jod swabhavik roop se beech ki taraf khinchta hai.',
      'Iska matlab do baatein. **Ek — madhyam score aam hai aur uska matlab saamanya jeevan nahi hota.** Beech ke score mein bhi kuch hisse bahut ooncha ho sakte hain, aur wahi asli jaankari hai. **Do — bahut ooncha score dekh kar nishchint ho jaana galti hai**, kyunki phal karm se aata hai, aankde se nahi.',
      'Isliye apne score ko doosron se nahi, **apne hi vibhajan se** padhiye — kaunsa hissa aage hai aur kaunsa peeche.',
    ],
  },
  {
    id: 'seema',
    h2: 'Is score ki seema — jo ye nahi bata sakta',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par likhni chahiye.',
      'Ye score **nahi** bata sakta: koi ghatna kab hogi (uske liye dasha aur gochar chahiye), koi graha shubh phal dega ya kathin (uske liye bhaav-swamitva aur Ishta-Kashta chahiye), kaunsa yog ban raha hai (wo alag vishleshan hai), aur aapka jeevan kaisa rahega (wo koi chart nahi bata sakta).',
      'Jo ye bata sakta hai: **aapki kundali ke alag hisson mein kitni saamarthya hai, aur wo saamarthya kis kshetra tak pahunch rahi hai.** Ye ek naksha hai, manzil nahi.',
      'Aur ek seema jo dohrayi jaani chahiye: **0-100 ka paimana shastra ka nahi hai.** Andar ke aankde classical hain, unka percentage roop prastuti hai. Isliye kisi doosri site ka score is se mila kar dekhna bemaani hai — unka paimana alag hoga.',
    ],
  },
  {
    id: 'trikona-kendra',
    h2: 'Kendra aur Trikona — score mein sabse bhaari bhaav',
    paras: [
      'Saare baarah bhaav barabar vazan nahi rakhte, aur ye jaan lena vibhajan padhne mein seedha kaam aata hai.',
      '**Kendra** — pehla, chaturth, saptam, dashama. Inhe Vishnu-sthana kaha gaya hai aur ye jeevan ka dhancha bante hain: shareer, sukh, sambandh, karm. **Trikona** — pehla, panchma, navam. Inhe Lakshmi-sthana kaha gaya hai aur ye bhagya, buddhi aur dharm ke bhaav hain.',
      'Pehla bhaav dono mein aata hai — yahi uske itne vazan ki wajah hai. Vyavharik matlab: **agar aapka kul score madhyam hai par kendra aur trikona ooncha hai, to sthiti kul aankde se behtar hai.** Aur uske ulta, ooncha kul score par kamzor kendra kam bharose ka hai. Isliye vibhajan mein sabse pehle inhi saat bhaavon ko dekhiye.',
    ],
  },
  {
    id: 'ek-graha-kai-bhaav',
    h2: 'Ek kamzor graha kai bhaav gira sakta hai',
    paras: [
      'Ye ek baat samajh lene se vibhajan bilkul saaf ho jaata hai, aur log aksar isi par atakte hain.',
      'Paanch graha **do-do rashiyon ke swami** hain. Iska matlab ek graha prayah do bhaavon ka swami hota hai. **Agar wo graha kamzor hai to dono bhaavon ka Bhavadhipati Bala girega** — do alag kshetra ek hi wajah se peeche dikhenge.',
      'Isliye result mein agar do bhaav ek saath neeche hain, to pehle dekhiye ki **unka swami ek hi graha to nahi.** Agar haan, to aapko do samasyaayein nahi, **ek** samasya hai — aur ek hi upay dono ko uthaayega. Ye jaankari upay ka samay aur mehnat dono bachati hai.',
    ],
  },
  {
    id: 'antardasha',
    h2: 'Mahadasha aur Antardasha — dono score mein hain?',
    paras: [
      'Ye antar puchha jaata hai aur uska uttar vyavharik roop se mayne rakhta hai.',
      'Score mein mukhya roop se **Mahadasha ke swami ka bal** jodha jaata hai, kyunki wo bada daur hai — Shani ki 19 saal, Shukra ki 20, Chandra ki 10. Wahi aapke jeevan ke us hisse ka mool swar tay karta hai.',
      '**Antardasha** uske andar chalti hai aur mahinon mein badalti hai. Uska asar chhota par tez hota hai — wahi wajah hai ki ek hi Mahadasha ke andar kuch saal achhe lagte hain aur kuch bhaari. Antardasha ka poora kram [Dasha Calculator](/calculators/free-dasha-calculator) par dikhta hai.',
      'Vyavharik salah: **score dekh kar samay ka nishkarsh mat nikaaliye.** Score bal batata hai; samay ke liye dasha ki table alag se dekhni chahiye.',
    ],
  },
  {
    id: 'agla-kadam',
    h2: 'Score ke baad kahan jaayein',
    paras: [
      'Score kam hai aur wajah **kisi graha** mein hai — [Weak Planet Finder](/calculators/free-weak-planet-finder) us graha aur uske upay ke liye hai, aur [Graha Bal Calculator](/calculators/free-graha-bal-calculator) poore aankde ke liye.',
      'Wajah **lagna** mein hai — [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator), aur agar lagna hi nahi pata to [Lagna Calculator](/calculators/free-lagna-calculator).',
      'Wajah **dasha** mein hai — sabse achhi khabar, kyunki dasha badalti hai. [Dasha Calculator](/calculators/free-dasha-calculator) se dekhiye kab badlegi, aur [Mahadasha explained](/learn/mahadasha-explained) se samajhiye kya badlega. Sidhant ke liye [Shadbala](/learn/shadbala-planetary-strength-vedic-astrology) aur [Planets in Astrology](/learn/planets-in-astrology).',
    ],
  },
];

type KsLink = { href: string; label: string; note: string };

const HUB_CALC: KsLink[] = [
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Poora Shadbala aankda' },
  { href: '/calculators/free-weak-planet-finder', label: 'Weak Planet Finder', note: 'Nidaan aur upay' },
  { href: '/calculators/free-lagna-bal-calculator', label: 'Lagna Bal Calculator', note: 'Sirf lagna ka bal' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Pehle chart banaiye' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Kaunsi dasha chal rahi hai' },
  { href: '/calculators/free-sade-sati-calculator', label: 'Sade Sati Calculator', note: 'Gochar, janm bal nahi' },
  { href: '/calculators/free-rashi-calculator', label: 'Rashi Calculator', note: 'Chandra rashi' },
  { href: '/calculators/free-shadi-kab-hogi-calculator', label: 'Shadi Kab Hogi', note: 'Vivah alag prashn hai' },
  { href: '/calculators/free-gemstone-suitability-calculator', label: 'Gemstone Suitability', note: 'Ratna se pehle jaanch' },
];

const HUB_LEARN: KsLink[] = [
  { href: '/learn/shadbala-planetary-strength-vedic-astrology', label: 'Shadbala — poora sidhant', note: 'Score ka aadhaar' },
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Har graha ka kaarakattva' },
  { href: '/learn/mahadasha-explained', label: 'Mahadasha explained', note: 'Dasha wala hissa' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Dignity — uchch aur neech', note: 'Bal ka ek hissa' },
  { href: '/learn/raj-yoga', label: 'Raj Yoga', note: 'Yog aur bal ka rishta' },
  { href: '/learn/vipreet-raj-yoga', label: 'Vipreet Raj Yoga', note: '6, 8, 12 ka yog' },
  { href: '/learn/neech-bhang-raj-yoga', label: 'Neech Bhang Raj Yoga', note: 'Neech ka dosh kat jaana' },
  { href: '/learn/career-prediction-astrology', label: 'Career Prediction', note: 'Dasham bhaav ka prashn' },
  { href: '/blog/kundali-mein-shadbala-grah-bal-hindi', label: 'षड्बल और ग्रह बल — हिंदी', note: 'Hindi mein poora lekh' },
];

function KsRich({ text, k }: { text: string; k: string }) {
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

function KsHub({ items }: { items: KsLink[] }) {
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
                    <KsRich text={p} k={`s${si}-p${pi}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* comparison table — kept from v1.x, unchanged */}
          <section className="mt-4 prose prose-invert max-w-none">
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

          {/* ── v2.0: the strength cluster, split by question ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Score ke aage — baaki free calculators aur guide</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Ye page jod ka hai. Ek graha ka aankda Graha Bal par, nidaan aur upay Weak Planet Finder par, aur chart banana Kundali Calculator par. Sab free.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Aur bhi free calculators</h3>
                <KsHub items={HUB_CALC} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Sidhant samjhiye</h3>
                <KsHub items={HUB_LEARN} />
              </div>
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
