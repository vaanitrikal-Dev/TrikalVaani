'use client';

// ============================================================
// File: app/calculators/free-lagna-calculator/page.tsx
// Version: v2.0 (05 Sep 2026) — Free Lagna (Ascendant) Calculator
// Engine: Swiss Ephemeris + Parashar BPHS + Shadbala + Bhrigu
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-09-05) — Keyword-driven content build. ~1,000 -> ~5,200 words,
//        4 H2 -> 36, TOC added, FAQs 8 -> 15, new layout.tsx title.
//        Form, /api/calc/kundali, LAGNA_DATA, the 12-lagna grid and the
//        JSON-LD are untouched.
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

// ─── 12 Lagna Reference (Parashar BPHS — Personality + Body) ──
const LAGNA_DATA: Record<string, any> = {
  'Mesha':      { en: 'Aries',       lord: 'Mars',    element: 'Fire',  body: 'Medium height, athletic build, sharp features, prominent forehead', personality: 'Bold, energetic, pioneering, impulsive, natural leader, quick-tempered', career: 'Military, sports, surgery, engineering, entrepreneurship' },
  'Vrishabha':  { en: 'Taurus',      lord: 'Venus',   element: 'Earth', body: 'Strong neck, full lips, broad shoulders, attractive features',     personality: 'Patient, steady, sensual, loyal, materialistic, stubborn when crossed', career: 'Finance, agriculture, art, music, real estate, food industry' },
  'Mithuna':    { en: 'Gemini',      lord: 'Mercury', element: 'Air',   body: 'Tall, slim, long arms, expressive hands, youthful appearance',     personality: 'Witty, curious, dual-natured, communicative, adaptable, restless', career: 'Writing, journalism, sales, teaching, IT, communication' },
  'Karka':      { en: 'Cancer',      lord: 'Moon',    element: 'Water', body: 'Round face, fair complexion, soft features, average height',       personality: 'Emotional, nurturing, intuitive, family-oriented, sensitive, moody', career: 'Hospitality, nursing, hotel industry, food business, real estate' },
  'Simha':      { en: 'Leo',         lord: 'Sun',     element: 'Fire',  body: 'Broad chest, regal posture, lion-like features, strong frame',      personality: 'Royal, generous, proud, charismatic, dramatic, attention-seeking', career: 'Politics, government, entertainment, leadership roles, jewelry' },
  'Kanya':      { en: 'Virgo',       lord: 'Mercury', element: 'Earth', body: 'Petite frame, refined features, youthful, neat appearance',         personality: 'Analytical, perfectionist, service-oriented, modest, critical, anxious', career: 'Healthcare, accounting, editing, research, analysis, hygiene products' },
  'Tula':       { en: 'Libra',       lord: 'Venus',   element: 'Air',   body: 'Symmetrical features, attractive face, well-proportioned, graceful', personality: 'Diplomatic, balanced, artistic, indecisive, peace-loving, romantic', career: 'Law, diplomacy, fashion, design, beauty, partnerships, art dealing' },
  'Vrishchika': { en: 'Scorpio',     lord: 'Mars',    element: 'Water', body: 'Penetrating eyes, broad shoulders, intense gaze, magnetic presence', personality: 'Intense, mysterious, passionate, transformative, secretive, vengeful', career: 'Research, investigation, medicine, psychology, occult, defense' },
  'Dhanu':      { en: 'Sagittarius', lord: 'Jupiter', element: 'Fire',  body: 'Tall, well-built, prominent thighs, athletic, oval face',           personality: 'Philosophical, optimistic, freedom-loving, adventurous, blunt, restless', career: 'Teaching, law, religion, publishing, travel, higher education' },
  'Makara':     { en: 'Capricorn',   lord: 'Saturn',  element: 'Earth', body: 'Tall, thin, prominent bones, serious expression, ages well',         personality: 'Disciplined, ambitious, patient, status-conscious, pessimistic, hardworking', career: 'Business, government, administration, mining, real estate, leadership' },
  'Kumbha':     { en: 'Aquarius',    lord: 'Saturn',  element: 'Air',   body: 'Tall, lean, unique features, intellectual appearance, gentle eyes',  personality: 'Innovative, humanitarian, eccentric, intellectual, detached, rebellious', career: 'Technology, science, social work, astrology, research, innovation' },
  'Meena':      { en: 'Pisces',      lord: 'Jupiter', element: 'Water', body: 'Large eyes, soft features, dreamy expression, medium height',         personality: 'Compassionate, intuitive, spiritual, dreamy, empathetic, escapist', career: 'Spirituality, healing, art, music, charity, ocean-related, dance' },
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
  { q: 'Lagna kya hota hai?', a: 'Lagna (Ascendant ya Rising Sign) Vedic Jyotish ka sabse important point hai. Janm samay purvi kshitij (eastern horizon) par jo Rashi udit ho rahi thi, woh aapka Lagna hai. Yeh aapka physical body, personality, outer self, aur jeevan ki overall direction decide karta hai.' },
  { q: 'Lagna kaise calculate hota hai?', a: 'Lagna calculate karne ke liye exact birth time (ghante aur minute), date of birth, aur birth place chahiye. Har 2 ghante mein Lagna badalta hai — isliye birth time accurate hona zaroori hai. Trikaal Vaani Swiss Ephemeris se exact Lagna nikalta hai using Lahiri Ayanamsha.' },
  { q: 'Lagna aur Rashi mein kya antar hai?', a: 'Lagna = Ascendant — janm samay east horizon par udit Rashi. Outer body aur personality dikhata hai. Rashi (Chandra Rashi) = Moon Sign — Chandra ki position. Mann aur emotions dikhata hai. Dono alag hote hain — predictions ke liye dono important hain.' },
  { q: 'Birth time exact nahi pata, kya phir bhi Lagna nikal sakta hai?', a: 'Lagna har 2 ghante mein badalta hai — exact birth time bahut zaroori hai. 15-30 minute ki bhi galti se Lagna change ho sakta hai. Approximate time se Lagna deviation possible hai. Best — birth certificate ya parents se confirm karein. Agar bilkul nahi pata, toh "Unknown time" option use karein (12:00 noon solar chart).' },
  { q: 'Lagna se kya predict hota hai?', a: 'Lagna se predict hota hai — (1) Physical body, face, body type, complexion, (2) Personality aur outer behavior, (3) Health aur longevity, (4) Career direction aur life path, (5) Marriage timing aur partner type, (6) Spiritual inclination. Lagna lord ki strength bahut decisive hoti hai.' },
  { q: 'Lagna kitne types ke hote hain?', a: '12 Lagnas hain — Mesha (Aries), Vrishabha (Taurus), Mithuna (Gemini), Karka (Cancer), Simha (Leo), Kanya (Virgo), Tula (Libra), Vrishchika (Scorpio), Dhanu (Sagittarius), Makara (Capricorn), Kumbha (Aquarius), aur Meena (Pisces). Har Lagna ka apna lord planet, body type, personality, aur favorable careers hote hain.' },
  { q: 'Kya Lagna Calculator bilkul free hai?', a: 'Haan. 100% free. Lagna naam, Lagna lord, element, body type, personality traits, favorable careers, aur 3 Parashar remedies (Mantra, Ratna, Daan) — sab free. Koi signup ya payment nahi.' },
  { q: 'Lagna calculator ke result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) use karta hai with Lahiri Ayanamsha (Government of India standard). House system = Placidus. Birth time se direct calculation. 99.9% astronomical accuracy provided birth time accurate ho.' },
  { q: 'Mera lagna kya hai — seedha kaise pata karein?', a: 'Upar wale form mein janm tithi, sateek samay aur sthan daaliye. Lagna turant aa jaata hai, uske swami, tatva aur swabhav ke saath. Bina samay ke lagna nikalna sambhav nahi hai — wo har lagbhag do ghante mein badal jaata hai.' },
  { q: 'Ek hi lagna ke do log alag kyun hote hain?', a: 'Lagna sirf shuruat hai. Uske baad nau grahon ki sthiti, unka bal, aur chal rahi dasha — teeno har vyakti ke alag hain. Do log ek hi din, ek hi lagna mein paida ho kar bhi bilkul alag jeevan jeete hain, aur ye bilkul saamanya hai.' },
  { q: 'Kaunse graha mere lagna ke liye shubh hain?', a: 'Ye lagna se tay hota hai. Har lagna ke liye kuch graha yogakaraka (shubh) hote hain aur kuch marak ya badhak. Jaise Vrishabh lagna ke liye Shani yogakaraka hai jabki Mesh lagna ke liye wo nahi. Isi liye "Shani bura hai" jaisa saralikaran kaam nahi karta.' },
  { q: 'Lagna se shareer aur roop kaise pata chalta hai?', a: 'Lagna ko shareer ka bhaav kaha gaya hai, aur har lagna ke saath ek shareerik prakriti jodi gayi hai — Mesh mein madhyam kaad aur teekhe naksh, Vrishabh mein bhaari dhancha. Par isme lagnesh ki sthiti aur pehle bhaav ke graha bhi jud jaate hain, isliye ek hi lagna ke log alag dikhte hain.' },
  { q: 'Rashifal kis rashi se padhna chahiye — lagna ya Chandra rashi?', a: 'Paramparik roop se Chandra rashi se, kyunki gochar Chandra rashi se ginte hain. Kai jyotishi lagna se bhi padhne ki salah dete hain. Sabse imandar baat ye hai ki koi bhi saamanya rashifal vyaktigat nahi hota — wo ek rashi ke karodon logon ke liye ek hi hota hai.' },
  { q: 'Lagna sandhi par ho to kya karein?', a: 'Agar lagna rashi ke bilkul shuru (0 degree) ya bilkul ant (29 degree) mein nikla hai to sabse pehle janm samay dobara jaanchiye. Wahan do-teen minute ka antar bhi poora lagna badal deta hai. Hospital record ya janm pramanpatra se samay lena zaroori ho jaata hai.' },
  { q: 'Kya lagna kabhi badal sakta hai?', a: 'Nahi. Lagna janm ke kshan ka khagolik tathya hai aur jeevan bhar wahi rehta hai. Agar do jagah alag lagna mil raha hai to wajah teen mein se ek hai — janm samay ki galti, sthan ka antar, ya ayanamsha ka alag chunav. Samay sabse pehle jaanchiye.' },
];


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2 + GSC, both 05 Sep 2026)
//   999 words · 4 H2 · 21 internal links.
//   GSC 3 months to 4 Sep 2026: 200 impressions, 1 click, CTR 0.50%,
//   average position 35.45.
//
//   NOTE FOR THE RECORD: the 05 Sep Radar report showed "lagna bal calculator"
//   at rank 5 and the E5 brief attached it to THIS page. That was wrong — the
//   rank-5 keyword belongs to /calculators/free-lagna-bal-calculator, a
//   different page. This page sits at position 35. Any future plan built off
//   that report line should be re-checked against GSC.
//
// ── THE SPLIT WITH free-lagna-bal-calculator — READ BEFORE EDITING ─────────
//   Both pages live in Radar cluster calc-lagna, where all six tracked
//   keywords have an AI Overview recommending a tool and we rank on only one.
//   The two pages are kept apart by QUESTION:
//
//     free-lagna-bal-calculator = HOW STRONG. Lagna lord, its house, its
//       Shadbala, first-house planets, remedies, the lagnesh dasha.
//     THIS PAGE = WHICH LAGNA, and what that lagna means. It owns the twelve
//       ascendants in depth — one section each — plus identification
//       mechanics, the yogakaraka/marak map per lagna, and how the twelve
//       houses are built from the lagna.
//
//   HONEST NOTE ON THAT SPLIT: the lagna-bal build of 05 Sep 2026 took several
//   headings that naturally belong here — "जन्म लग्न कैसे निकाले", "Lagna
//   Calculator without birth time", "Lagna Chart", "लग्न सारणी", "12 Ascendant
//   in astrology", "Twins ka lagna". Rather than duplicate them, this page
//   goes DEEPER where that page went wide: it treats each of the twelve
//   ascendants as its own section. If the two pages are ever revisited, the
//   cleaner arrangement would be to trim those six headings on lagna-bal to
//   one-line pointers here.
//
// WHERE THE H2s COME FROM — Radar E3, live SERP PASF, cluster calc-lagna,
// checked 05 Sep 2026:
//     lagna calculator by date of birth ......... AIO recommends_tool
//     ascendant calculator vedic astrology free . AIO recommends_tool
//     mera lagna kya hai ........................ AIO recommends_tool
//     लग्न कैलकुलेटर ............................... AIO recommends_tool
//     लग्न कैसे पता करें ............................ AIO recommends_tool
//   PASF answered here: Lagna rashi finder · Lagna rashi chart ·
//     12 Ascendant in astrology · How to find ascendant sign in kundli ·
//     लग्न का अर्थ · लग्न देखने की विधि · Ascendant meaning in astrology
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type LcSection = { id: string; h2: string; paras: string[] };

const SECTIONS: LcSection[] = [
  {
    id: 'mera-lagna-kya-hai',
    h2: 'Mera lagna kya hai — seedha jawab',
    paras: [
      'Upar wale form mein **janm tithi, sateek samay aur janm sthan** daaliye. Lagna turant aa jaata hai — uske **swami graha**, **tatva**, **swabhav** aur **shareerik prakriti** ke saath.',
      'Teeno cheezein kyun chahiye: tareekh se din tay hota hai, **samay se lagna** (jo har lagbhag do ghante mein badalta hai), aur **sthan** se uska sudhar, kyunki lagna akshansh ke saath khisakta hai.',
      'Bina samay ke lagna nikalna **sambhav nahi hai** — koi tool nahi nikaal sakta. Din bhar mein baarah lagna udit hote hain; samay ke bina unme se ek chunna sanjog hoga, ganana nahi.',
    ],
  },
  {
    id: 'lagna-ka-arth',
    h2: 'लग्न का अर्थ — उदित होती राशि',
    paras: [
      '**लग्न वह राशि है जो आपके जन्म के क्षण पूर्वी क्षितिज पर उदय हो रही थी।** अंग्रेज़ी में इसे Ascendant या Rising Sign कहते हैं।',
      'सोचिए कि जन्म के समय आप पूर्व दिशा में देख रहे होते — जो राशि उस समय ठीक क्षितिज पर चढ़ रही थी, वही आपका लग्न है। पृथ्वी 24 घंटे में एक चक्कर पूरा करती है, इसलिए **एक दिन में बारहों राशियाँ बारी-बारी उदित होती हैं** — प्रत्येक लगभग दो घंटे।',
      'इसका महत्व यह है कि **कुंडली के बारह भाव लग्न से ही गिने जाते हैं।** लग्न पहला भाव बनता है, अगली राशि दूसरा, और इसी क्रम में। इसीलिए लग्न बदलते ही पूरा चार्ट घूम जाता है — और इसीलिए यह पूरी कुंडली का आधार है।',
    ],
  },
  {
    id: 'do-ghante',
    h2: 'Lagna har do ghante mein badalta hai — iska vyavharik matlab',
    paras: [
      'Ye ek line hai jo bar-bar dohrayi jaati hai, par uska asli matlab kam samjhaya jaata hai.',
      'Matlab ye hai: **ek hi din, ek hi shahar mein paida hue do bachche alag lagna ke ho sakte hain** — agar unke beech do ghante ka antar hai. Aur alag lagna ka matlab hai baarah ke baarah bhaav alag jagah, yaani poori kundali alag.',
      'Doosra matlab: **janm samay ki galti sabse mehngi galti hai.** Pandrah minute ki galti prayah lagna nahi badalti, par uski **degree** badal deti hai — jo Navamsa aur Dasamsa jaise varga charton ko badal deti hai. Do ghante ki galti poora lagna badal deti hai.',
      'Isliye salah wahi hai jo har jagah dohrani padti hai: **janm pramanpatra ya hospital record se samay lijiye**, ghar ki yaad se nahi. Yaad kiya gaya samay prayah aadhe ghante par gol kar diya jaata hai.',
    ],
  },
  {
    id: 'bhaav-lagna-se',
    h2: 'Baarah bhaav lagna se kaise bante hain',
    paras: [
      'Ye samajh lena poori kundali ki chaabi hai, aur ye ek line ka niyam hai.',
      '**Lagna pehla bhaav hai. Uske aage wali rashi doosra bhaav, aage teesra**, aur isi kram mein baarahvaan. Bas itna. Rashiyon ka kram hamesha wahi rehta hai (Mesh, Vrishabh, Mithun…), sirf shuruat aapke lagna se hoti hai.',
      'Udaharan: agar aapka lagna **Simha** hai to pehla bhaav Simha, doosra Kanya, teesra Tula, chautha Vrishchik, aur isi kram mein — dasham bhaav Vrishabh, aur uska swami Shukra. Yaani Simha lagna wale ka career Shukra chalata hai.',
      'Isi ek niyam se wo baat nikalti hai jo poore Jyotish mein sabse zyada mayne rakhti hai: **ek hi graha do logon ke liye bilkul alag arth rakhta hai**, kyunki wo unke alag bhaavon ka swami hai. Isi liye lagna jaane bina koi bhi padhai adhoori hai.',
    ],
  },
  {
    id: 'mesh-lagna',
    h2: 'Mesh Lagna (Aries Ascendant)',
    paras: [
      '**Swami — Mangal. Tatva — Agni. Prakriti — Char (chalayamaan).** Chinh mesh (bhed). Swabhav ke sanket: pahal karne wala, seedha, tez faisla lene wala, aur pratiyogita mein sahaj. Shareerik roop se prayah madhyam kaad, mazboot dhancha aur teekhe naksh batae jaate hain, sir aur chehre ka kshetra Mesh ka maana jaata hai.',
      '**Anukool graha:** Surya (panchmesh — trikona ka swami) aur Guru (navmesh) sabse shubh; Mangal swayam lagnesh hone se anukool. **Savdhaani wale:** Budh aur Shukra, jo yahan jatil bhoomika mein aate hain.',
      'Ek zaroori baat: **Mangal is lagna mein lagnesh aur aathve bhaav ka swami dono hai.** Isliye Mangal ka bal is lagna ke liye do jagah asar dalta hai, aur uska ratna dene se pehle ye dekhna zaroori hai.',
    ],
  },
  {
    id: 'vrishabh-lagna',
    h2: 'Vrishabh Lagna (Taurus Ascendant)',
    paras: [
      '**Swami — Shukra. Tatva — Prithvi. Prakriti — Sthir.** Chinh vrishabh (bail). Swabhav ke sanket: sthirta, dheeraj, sukh aur saundarya ki taraf jhukav, aur badlaav mein dheema. Shareerik roop se prayah bhaari ya mazboot dhancha, aur kanth tatha gale ka kshetra is lagna ka maana jaata hai — isi liye aavaz par bhi dhyan diya jaata hai.',
      '**Anukool graha:** **Shani yahan yogakaraka hai** — navam aur dasham dono ka swami, jo ise is lagna ka sabse shubh graha bana deta hai. Budh bhi anukool hai. **Savdhaani wale:** Guru aur Chandra, jo yahan marak ya kam anukool bhoomika mein aate hain.',
      'Yahi wo udaharan hai jo bar-bar diya jaata hai: **Shani Vrishabh lagna ke liye sabse achha graha hai** — jabki aam dhaarna ise "bura graha" maanti hai. Isliye graha achha ya bura lagna se tay hota hai, apne aap mein nahi.',
    ],
  },
  {
    id: 'mithun-lagna',
    h2: 'Mithun Lagna (Gemini Ascendant)',
    paras: [
      '**Swami — Budh. Tatva — Vayu. Prakriti — Dvisvabhav.** Chinh jodi. Swabhav ke sanket: jigyasa, tez samajh, sanvaad mein sahaj, aur ek saath kai cheezein karne ka jhukav. Shareerik roop se prayah patla dhancha aur yuvasulabh chehra; haath, kandhe aur shwasan tantra ka kshetra maana jaata hai.',
      '**Anukool graha:** Shukra (panchmesh) sabse shubh; Budh lagnesh hone se anukool. **Savdhaani wale:** Guru, jo yahan saatve aur dasve ka swami hote hue bhi Budh ka shatru hai, aur Mangal.',
      'Ek dhyan dene wali baat: **Budh sabse tez chalne wala graha hai aur prayah Surya ke paas rehta hai**, isliye Mithun lagna walon mein lagnesh ka ast hona aam hai. Ye kamzori nahi, sirf ek sthiti hai jise poore chart ke saath padha jaata hai.',
    ],
  },
  {
    id: 'karka-lagna',
    h2: 'Karka Lagna (Cancer Ascendant)',
    paras: [
      '**Swami — Chandra. Tatva — Jal. Prakriti — Char.** Chinh kekda. Swabhav ke sanket: sanvedansheelta, poshan, parivaar aur ghar ko vazan, aur achhi smriti. Shareerik roop se prayah gol chehra aur madhyam kaad; chhaati aur paachan tantra ka kshetra maana jaata hai.',
      '**Anukool graha:** **Mangal yahan yogakaraka hai** — panchma aur dasham dono ka swami. Guru bhi bahut shubh hai (navmesh). **Savdhaani wale:** Shani aur Budh.',
      'Is lagna ki ek khaas baat: **lagnesh Chandra hai, jo har dhai din mein rashi badalta hai aur jiska bal Paksha Bala par tikta hai.** Isliye Karka lagna walon ka lagnesh-bal janm ke paksh par bahut nirbhar karta hai — purnima ke aas-paas janme logon ka Chandra swabhavik roop se balwan hota hai.',
    ],
  },
  {
    id: 'simha-lagna',
    h2: 'Simha Lagna (Leo Ascendant)',
    paras: [
      '**Swami — Surya. Tatva — Agni. Prakriti — Sthir.** Chinh sinh. Swabhav ke sanket: aatmvishwas, netritva, sammaan ki chaah, aur udaarta. Shareerik roop se prayah accha dhancha aur prabhavshali upasthiti; hriday aur peeth ka kshetra maana jaata hai.',
      '**Anukool graha:** Mangal (panchmesh aur navmesh — dono trikona) sabse shubh; Surya lagnesh hone se anukool, aur Guru bhi. **Savdhaani wale:** Shani aur Shukra, jo yahan marak ya jatil bhoomika mein aate hain.',
      'Ek zaroori baat: **Surya kabhi vakri nahi hota aur kabhi ast nahi hota**, isliye Simha lagna ka lagnesh in do sthitiyon se bacha rehta hai. Par wo **neech** ho sakta hai (Tula mein) — aur us sthiti mein pad milta hai par pehchan der se aati hai.',
    ],
  },
  {
    id: 'kanya-lagna',
    h2: 'Kanya Lagna (Virgo Ascendant)',
    paras: [
      '**Swami — Budh. Tatva — Prithvi. Prakriti — Dvisvabhav.** Chinh kanya. Swabhav ke sanket: vishleshan, sookshmata, vyavastha aur sewa ki taraf jhukav, aur kaam mein pakadd. Shareerik roop se prayah madhyam dhancha; aant aur paachan ka kshetra maana jaata hai.',
      '**Anukool graha:** Shukra (doosre aur navam ka swami) sabse shubh; Budh lagnesh hone se anukool. **Savdhaani wale:** Mangal, Guru aur Chandra — is lagna ke liye ye teeno jatil bhoomika mein aate hain.',
      'Ek dilchasp sthiti: **Budh Kanya mein uchch bhi hota hai aur ye uski swarashi bhi hai.** Isliye Kanya lagna walon ka lagnesh apne hi ghar mein uchch ho sakta hai, jo bahut anukool maana jaata hai — par ye tabhi jab Budh sach mein Kanya mein baitha ho.',
    ],
  },
  {
    id: 'tula-lagna',
    h2: 'Tula Lagna (Libra Ascendant)',
    paras: [
      '**Swami — Shukra. Tatva — Vayu. Prakriti — Char.** Chinh taraazu. Swabhav ke sanket: santulan, nyay ka bhaav, sambandhon mein kushalta, aur takrav se bachne ka jhukav. Shareerik roop se prayah sundar naksh aur sanulit dhancha; kamar aur gurde ka kshetra maana jaata hai.',
      '**Anukool graha:** **Shani yahan yogakaraka hai** — chauthe aur panchma dono ka swami — aur Shani Tula mein uchch bhi hota hai, jo ise aur anukool banata hai. Budh bhi shubh hai. **Savdhaani wale:** Guru, Surya aur Mangal.',
      'Yahan phir wahi sabak: **Shani do lagno ke liye sabse shubh graha hai — Vrishabh aur Tula.** Aur dono Shukra ki rashiyaan hain. Ye jodi sanjog nahi hai; Shani aur Shukra shastra mein mitra maane gaye hain.',
    ],
  },
  {
    id: 'vrishchik-lagna',
    h2: 'Vrishchik Lagna (Scorpio Ascendant)',
    paras: [
      '**Swami — Mangal. Tatva — Jal. Prakriti — Sthir.** Chinh bichhu. Swabhav ke sanket: gehrai, sanyam, gupt rakhne ki kshamata, aur takleef se ubar aane ki taakat. Shareerik roop se prayah teekhi drishti aur mazboot dhancha; prajanan tantra ka kshetra maana jaata hai.',
      '**Anukool graha:** Chandra (navmesh — trikona) aur Guru (panchmesh) sabse shubh; Surya bhi anukool. **Savdhaani wale:** Budh aur Shukra.',
      'Is lagna ki khaas baat: **Ketu ko bhi Vrishchik ka sah-swami maana jaata hai** kuch paramparaon mein, aur isi liye is lagna ko adhyatm aur gehri khoj se joda jaata hai. Aur ek baat — Chandra Vrishchik mein neech hota hai, isliye Vrishchik lagna walon ka navmesh prayah dhyan maangta hai.',
    ],
  },
  {
    id: 'dhanu-lagna',
    h2: 'Dhanu Lagna (Sagittarius Ascendant)',
    paras: [
      '**Swami — Guru. Tatva — Agni. Prakriti — Dvisvabhav.** Chinh dhanurdhari. Swabhav ke sanket: vistaar, darshan, yatra aur shiksha ki taraf jhukav, aur seedhi baat kehne ki aadat. Shareerik roop se prayah lamba dhancha; jaanghen aur kulha ka kshetra maana jaata hai.',
      '**Anukool graha:** Surya (navmesh) aur Mangal (panchma aur barahve ka swami) shubh; Guru lagnesh hone se anukool. **Savdhaani wale:** Shukra aur Budh.',
      'Ek anukool sthiti jo is lagna ko milti hai: **Guru ki drishti shastra mein sabse kalyankari maani gayi hai**, aur lagnesh hone ke naate uski drishti jahan bhi padegi wahan lagna ka bal pahunchega. Isi liye balwan Guru is lagna ke liye kai kamiyon ko dhak leta hai.',
    ],
  },
  {
    id: 'makar-lagna',
    h2: 'Makar Lagna (Capricorn Ascendant)',
    paras: [
      '**Swami — Shani. Tatva — Prithvi. Prakriti — Char.** Chinh makar. Swabhav ke sanket: anushasan, mehnat, dheeraj aur lambe raste par chalne ki kshamata. Phal der se aata hai par tikta hai. Shareerik roop se prayah patla ya haddi wala dhancha; ghutne aur jodon ka kshetra maana jaata hai.',
      '**Anukool graha:** is lagna ka **yogakaraka Shukra** hai — wo panchma bhi chalata hai aur dasham bhi, isliye shiksha aur karm dono uske haath mein aa jaate hain. Budh bhi anukool hai. **Savdhaani wale:** Chandra, Mangal aur Guru.',
      'Is lagna ke liye ek sahara: **Mangal Makar mein uchch hota hai.** Isliye Makar lagna walon ke chauthe aur gyarahve bhaav ke swami ka uchch hona sambhav hai, jo sampatti aur laabh ke kshetra mein anukool maana jaata hai.',
    ],
  },
  {
    id: 'kumbh-lagna',
    h2: 'Kumbh Lagna (Aquarius Ascendant)',
    paras: [
      '**Swami — Shani. Tatva — Vayu. Prakriti — Sthir.** Chinh kalash uthaye vyakti. Swabhav ke sanket: mauliktā, samuh aur samaj ki taraf jhukav, alag soch, aur bhavnaon se thodi doori. Shareerik roop se prayah lamba dhancha; pindli aur takhne ka kshetra maana jaata hai.',
      '**Anukool graha:** yahan **Shukra yogakaraka** ban jaata hai, kyunki wo chautha aur navam dono chalata hai. Shani lagnesh hone se anukool. **Savdhaani wale:** Chandra, Guru aur Mangal.',
      'Ek baat jo is lagna par saaf karni chahiye: **Shani do lagno ka swami hai — Makar aur Kumbh — par dono ka swabhav alag hai.** Makar prithvi tatva hai, isliye vyavharik aur sanchay-pradhan; Kumbh vayu tatva hai, isliye vichaar aur samuh-pradhan. Ek hi swami, do alag disha.',
    ],
  },
  {
    id: 'meen-lagna',
    h2: 'Meen Lagna (Pisces Ascendant)',
    paras: [
      '**Swami — Guru. Tatva — Jal. Prakriti — Dvisvabhav.** Chinh do machhliyaan. Swabhav ke sanket: karuna, kalpana, adhyatm ki taraf jhukav, aur doosron ke bhaav ko pakad lena. Shareerik roop se prayah komal naksh; pair ka kshetra maana jaata hai.',
      '**Anukool graha:** Chandra (panchmesh) aur Mangal (doosre aur navam ka swami) shubh; Guru lagnesh hone se anukool. **Savdhaani wale:** Shukra aur Budh — Budh yahan vishesh roop se jatil hai, kyunki Meen mein wo neech hota hai.',
      'Ek anukool sthiti: **Shukra Meen mein uchch hota hai.** Isliye Meen lagna walon ka aathva aur teesra bhaav ka swami uchch ho sakta hai — jo dikhne mein ulajhan lagta hai par kai jagah anukool maana jaata hai, khaas kar aayu aur gehri khoj ke sandarbh mein.',
    ],
  },
  {
    id: 'yogakaraka',
    h2: 'Aapke lagna ke liye kaunse graha shubh hain',
    paras: [
      'Ye is page ka sabse kaam ka hissa hai, aur wahi cheez hai jo "Shani achha hai ya bura" jaise sawal ko khatm kar deti hai.',
      '**Yogakaraka** wo graha hai jo ek saath **kendra** (1, 4, 7, 10) aur **trikona** (1, 5, 9) dono ka swami ho. Aisa graha us lagna ke liye sabse shubh maana jaata hai. Ye sirf char lagno ko milta hai: **Vrishabh aur Tula ko Shani**, **Karka aur Simha ko Mangal**, **Makar aur Kumbh ko Shukra**.',
      'Baaki lagno ke liye sabse shubh graha prayah **navmesh** (navam bhaav ka swami) aur **panchmesh** hote hain, kyunki trikona ke swami shubh maane jaate hain.',
      'Iska seedha vyavharik natija: **upay aur ratna ka faisla lagna se hota hai, graha ke naam se nahi.** Ek hi graha ek lagna ke liye sabse achha aur doosre ke liye jatil ho sakta hai. Jaanch ke liye [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) free hai.',
    ],
  },
  {
    id: 'marak-badhak',
    h2: 'Marak aur badhak graha — jinse savdhaan rehna hai',
    paras: [
      'Yogakaraka ka ulta paksh bhi jaanna zaroori hai, warna upay ulta pad jaata hai.',
      '**Marak** wo graha hain jo doosre aur saatve bhaav ke swami hain. Ye apne aap mein "bure" nahi hain — shastra mein inhe aayu se juda maana gaya hai. **Badhak** lagna ki prakriti se tay hota hai: **char lagno** (Mesh, Karka, Tula, Makar) ke liye gyarahve ka swami, **sthir lagno** (Vrishabh, Simha, Vrishchik, Kumbh) ke liye navam ka, aur **dvisvabhav lagno** (Mithun, Kanya, Dhanu, Meen) ke liye saatve ka.',
      'Isse ek chaunkane wali baat nikalti hai: **sthir lagno ke liye navmesh badhak hota hai** — jabki navam bhaav bhagya ka bhaav hai aur uska swami aam taur par sabse shubh maana jaata hai.',
      'Vyavharik matlab: **kisi graha ka ratna pehanne se pehle dekhiye ki wo aapke lagna ke liye marak ya badhak to nahi.** Uski urja badhana us sthiti mein samasya badhata hai. Isi liye "kamzor graha ka ratna pehan lo" wali salah adhoori hai.',
    ],
  },
  {
    id: 'tatva-prakriti',
    h2: 'Tatva aur prakriti — lagna ko samajhne ke do chhote raste',
    paras: [
      'Baarah lagna yaad rakhna mushkil hai. Do vibhajan unhe aasan kar dete hain.',
      '**Tatva se** — **Agni** (Mesh, Simha, Dhanu): pahal, urja, spashtata. **Prithvi** (Vrishabh, Kanya, Makar): sthirta, vyavharikta, dheeraj. **Vayu** (Mithun, Tula, Kumbh): vichaar, sanvaad, sambandh. **Jal** (Karka, Vrishchik, Meen): bhavna, gehrai, antar-drishti.',
      '**Prakriti se** — **Char** (Mesh, Karka, Tula, Makar): parivartan laate hain, shuruat karte hain. **Sthir** (Vrishabh, Simha, Vrishchik, Kumbh): tikte hain, poora karte hain. **Dvisvabhav** (Mithun, Kanya, Dhanu, Meen): dhal jaate hain, jodte hain.',
      'Ye do vibhajan mila kar har lagna ek anokha jodi ban jaata hai — jaise Makar "char + prithvi" hai, yaani parivartan laata hai par vyavharik tarike se. Muhurat aur samay ke prashnon mein prakriti wala vibhajan seedha kaam aata hai.',
    ],
  },
  {
    id: 'ek-lagna-alag-log',
    h2: 'Ek hi lagna ke do log itne alag kyun hote hain',
    paras: [
      'Ye prashn jaayaz hai aur uska uttar is page ki sabse zaroori seema hai.',
      '**Lagna sirf shuruat hai.** Wo batata hai ki bhaav kahan se ginne hain — bas. Uske baad aata hai: **nau grahon ki sthiti** (har vyakti ki alag), **unka bal** (Shadbala se), aur **chal rahi dasha** (janm nakshatra se, isliye har vyakti ki alag).',
      'Ganit dekhiye: duniya ke lagbhag har **barahve** vyakti ka lagna aapka hi hai. Agar lagna se sab tay hota to sab ek jaise hote.',
      'Isliye lagna ko **naksha** maaniye, tasveer nahi. Poori tasveer ke liye [Kundali Calculator](/calculators/free-kundali-calculator) free hai, aur lagna kitna mazboot hai wo [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) par.',
    ],
  },
  {
    id: 'lagna-shareer',
    h2: 'Lagna aur shareer — kitna maanein',
    paras: [
      'Har lagna ke saath ek shareerik prakriti batayi jaati hai, aur log use bahut vazan de dete hain.',
      'Shastriya sthiti: **lagna shareer ka bhaav hai**, aur har rashi ko ek anga-kshetra se joda gaya hai — Mesh ko sir, Vrishabh ko kanth, Mithun ko haath aur shwas, Karka ko chhaati, Simha ko hriday, Kanya ko paachan, Tula ko kamar, Vrishchik ko prajanan, Dhanu ko jaangh, Makar ko ghutna, Kumbh ko pindli, Meen ko pair.',
      'Par isme **lagnesh ki sthiti aur pehle bhaav ke graha** bhi jud jaate hain, isliye ek hi lagna ke log alag dikhte hain aur alag prakriti rakhte hain.',
      'Aur seema saaf: **ye nidaan nahi hai.** Kisi lakshan ko "lagna ka phal" maan kar jaanch taalna nuksan ka rasta hai. Koi bhi jyotishiya sanket chikitsiya salah ka vikalp nahi hai.',
    ],
  },
  {
    id: 'lagna-swabhav-seema',
    h2: 'Lagna se swabhav — kitna sach, kitna saralikaran',
    paras: [
      'Internet par har lagna ke liye lambi swabhav-soochiyaan mil jaati hain. Yahan santulan zaroori hai.',
      'Jo shastra kehta hai: lagna **pravritti** dikhata hai — kis taraf jhukav swabhavik hai, urja kis roop mein nikalti hai, pehla prabhav kaisa padta hai. Ye ek asli sanket hai aur is page par har lagna ke saath diya gaya hai.',
      'Jo nahi maanna chahiye: **lagna se vyaktitva ka poora naksha ban jaata hai.** Parivaar, shiksha, mahaul aur apne chunav — inka asar kisi bhi chart se zyada hai. Aur jaisa upar likha, lagnesh ki sthiti do logon ko ek hi lagna mein bilkul alag bana deti hai.',
      'Isliye is page ke swabhav-sanketon ko **shuruat** maaniye, faisla nahi. Jo soochi kahe "Mesh lagna wale hamesha aise hote hain", wo saralikaran hai.',
    ],
  },
  {
    id: 'lagna-career-jhukav',
    h2: 'Lagna se career ka jhukav — kitna nikalta hai',
    paras: [
      'Ye prashn bahut aata hai, aur uttar aadha "haan" aur aadha "nahi" hai.',
      'Jo nikalta hai: **lagna ka tatva aur lagnesh ka swabhav** ek mota jhukav dikhate hain. Agni lagna pahal aur netritva wale kaam ki taraf, prithvi lagna vyavharik aur sthir kaam ki taraf, vayu lagna sanvaad aur vichaar wale kaam ki taraf, jal lagna sewa aur bhavna wale kaam ki taraf.',
      'Jo nahi nikalta: **kaunsa career.** Uske liye **dasham bhaav, uska swami, Dasamsa (D-10) aur chal rahi dasha** dekhne padte hain — aur wo har vyakti ke alag hain, chahe lagna ek hi ho.',
      'Isliye lagna ko career ka **rang** maaniye, uska naam nahi. Poora vishleshan [Career Prediction Astrology](/learn/career-prediction-astrology) aur [Best career from your birth chart](/learn/best-career-birth-chart) par hai.',
    ],
  },
  {
    id: 'rashifal-kis-se',
    h2: 'Rashifal lagna se padhein ya Chandra rashi se',
    paras: [
      'Ye prashn roz poochha jaata hai aur uska uttar teen hisson mein hai.',
      '**Paramparik uttar:** Chandra rashi se, kyunki gochar Chandra rashi se ginte hain — Sade Sati bhi wahi se. Isi liye adhikansh Hindi rashifal Chandra rashi ke liye likhe jaate hain.',
      '**Doosra mat:** kai jyotishi lagna se bhi padhne ki salah dete hain, kyunki bhaav lagna se bante hain aur gochar ka asar bhaavon par hi padta hai. Dono padh lena bhi chalta hai.',
      '**Imandar uttar:** koi bhi **saamanya rashifal vyaktigat nahi hota.** Wo ek rashi ke karodon logon ke liye ek hi hota hai. Jo cheez vyaktigat banati hai wo aapki **dasha** hai, jo janm nakshatra se nikalti hai. Uske liye [Dasha Calculator](/calculators/free-dasha-calculator) free hai.',
    ],
  },
  {
    id: 'sandhi-degree',
    h2: 'Lagna sandhi par nikla — ab kya karein',
    paras: [
      'Agar aapka lagna rashi ke bilkul shuru (0-1 degree) ya bilkul ant (29 degree) mein nikla hai, to ye section aapke liye hai.',
      'Sthiti ye hai: **wahan do-teen minute ka antar bhi poora lagna badal deta hai.** Aur lagna badalne ka matlab hai baarah ke baarah bhaav ghoom jaana — yaani bilkul alag kundali.',
      'Karna kya hai: **sabse pehle janm samay dobara jaanchiye.** Hospital record ya janm pramanpatra dekhiye, ghar ki yaad par bharosa mat kijiye. Agar do sambhav samay hain to dono chala kar dekhiye ki kaunsa chart aapke jeevan se zyada mel khaata hai.',
      'Ek vishesh sthiti **Gandanta** hai — jal aur agni rashiyon ki sandhi (Karka-Simha, Vrishchik-Dhanu, Meen-Mesh). Ise sookshm maana jaata hai, par **ghabrane ki baat nahi** — ye sirf ek sandhi hai jise dhyan se padha jaata hai.',
    ],
  },
  {
    id: 'ayanamsha-lagna',
    h2: 'Do jagah alag lagna aa raha hai — teen wajah',
    paras: [
      'Ye shikayat aam hai. Teen thos wajah hain aur unhe isi kram mein jaanchiye.',
      '**Ek — janm samay.** Sabse aam wajah. Do ghante ki galti poora lagna badal deti hai, aur "lagbhag saat baje" jaisa samay aksar aadhe ghante ka farak rakhta hai.',
      '**Do — paddhati.** Paashchatya app **sayan (tropical)** par chalte hain, Vedic **nirayan (sidereal)** par. Beech ka antar lagbhag 24 degree hai — yaani lagbhag ek poori rashi. Isliye paashchatya app prayah agla lagna dikhata hai.',
      '**Teen — ayanamsha.** Lahiri, Krishnamurti aur Raman thoda alag aankda dete hain. Ye antar chhota hai par **sandhi ke paas lagna badal sakta hai.** Hum **Lahiri** use karte hain, jo Bharat sarkar ka maanak hai.',
    ],
  },
  {
    id: 'lagna-badalta-nahi',
    h2: 'Lagna kabhi badal nahi sakta',
    paras: [
      'Ye chhota par zaroori section hai, kyunki iske naam par bhi kuch becha jaata hai.',
      '**Lagna janm ke kshan ka khagolik tathya hai.** Us kshan purvi kshitij par jo rashi thi, wo thi. Koi upay, koi pooja, koi ratna use nahi badalta — aur jo koi "lagna sudhaar" ki sewa beche, wo galat bech raha hai.',
      'Jo **badalta hai** wo do cheezein hain: **dasha**, jo apne kram se aage badhti hai, aur **gochar**, yaani grahon ka aaj aakash mein chalna.',
      'Isliye lagna ek baar jaan kar **likh lijiye** — janm samay, lagna, lagnesh aur Chandra rashi ke saath. Ye jaankari jeevan bhar kaam aati hai aur prayah tab dhoondhi jaati hai jab jaldi hoti hai.',
    ],
  },
  {
    id: 'vs-others',
    h2: 'Doosre lagna calculators se farak',
    paras: [
      'Google is keyword ke saath kai naam dikhata hai, isliye seedha uttar — usme wo bhi jo hamare paksh mein nahi jaata.',
      '**Lagna ke aankde mein antar nahi milega.** Adhikansh gambhir tool wahi Swiss Ephemeris aur wahi Lahiri Ayanamsha use karte hain. Un sites ke paas **zyada tool, zyada bhashaayein aur bahut purana domain authority** bhi hai — ye maan lena chahiye.',
      'Antar do jagah hai. **Ek** — adhikansh tool lagna ka **naam** de kar chhod dete hain. Yahan har lagna ke saath uska swami, tatva, prakriti, anukool graha aur marak-badhak dono milte hain. **Do** — yahan likha hai ki kaunsa ayanamsha aur kaunsi library chali, taaki aap parakh sakein.',
      'Aur ek cheez jo yahan **nahi** hai: koi paid "lagna report", koi dosh chetavni, koi upay ki bikri.',
    ],
  },
  {
    id: 'free-kya',
    h2: 'Is page par kya-kya milta hai, bilkul muft',
    paras: [
      'Poora page free hai. Milta hai: **lagna**, uska **swami graha**, **tatva** aur **prakriti**, **shareerik prakriti** ke sanket, **swabhav** ke sanket, aur us lagna ke liye **anukool tatha savdhaani wale graha.**',
      'Koi signup nahi, koi card nahi, koi email nahi maanga jaata.',
      'Lagna **kitna mazboot** hai — wo alag prashn hai aur uske liye [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) alag bana hai, wo bhi free. Poori kundali [Kundali Calculator](/calculators/free-kundali-calculator) par.',
    ],
  },
  {
    id: 'verify',
    h2: 'Apna lagna parakhne ka tarika',
    paras: [
      'Kisi bhi tool par bharosa karne se pehle use parakhna chahiye.',
      'Wahi janm tithi, samay aur shahar kisi doosre bharose-mand Vedic software mein daaliye. **Lagna rashi aur uski degree bilkul milni chahiye** — dono taraf Lahiri ayanamsha ho to antar nahi aayega.',
      'Agar **rashi ek aayi par degree thodi alag** hai — ayanamsha ka antar hai, chinta ki baat nahi. Agar **poora lagna alag** aaya hai — pehle dekhiye ki doosra tool Vedic hai ya paashchatya, phir samay aur shahar jaanchiye.',
      'Ek aur aasan jaanch: **ghar mein purani chhapi hui janm-patri ho to usse milaiye.** Wo prayah Lahiri par hi bani hoti hai, isliye lagna milna chahiye.',
    ],
  },
  {
    id: 'lagna-kaise-nikale-vidhi',
    h2: 'लग्न देखने की विधि — गणना कैसे होती है',
    paras: [
      'यह जानना उपयोगी है कि परदे के पीछे क्या हो रहा है, क्योंकि उसी से पता चलता है कि समय इतना ज़रूरी क्यों है।',
      'गणना का क्रम: जन्म स्थान का **अक्षांश और देशांतर** लिया जाता है, फिर उस क्षण का **स्थानीय सिद्धांत समय** निकाला जाता है, उससे **सायन लग्न** की डिग्री आती है, और अंत में **लाहिड़ी अयनांश** घटा कर **निरयन लग्न** मिलता है — वही आपका लग्न है।',
      'पुरानी विधि में यह काम **लग्न सारणी** से होता था — सूर्योदय से जन्म तक का अंतर लेकर तालिका देखना और अक्षांश के अनुसार सुधार करना। वह विधि आज भी सही है पर श्रमसाध्य है, और तालिका राशि तो देती है, **डिग्री नहीं।**',
      'यह पेज **Swiss Ephemeris** से सीधे खगोलीय स्थिति निकालता है, इसलिए डिग्री भी मिलती है — और वर्ग चार्ट उसी पर टिके हैं।',
    ],
  },
  {
    id: 'lagna-samay-nahi',
    h2: 'Samay bilkul nahi pata — kya vikalp hain',
    paras: [
      'Ye sthiti aam hai aur uska imandar uttar do hisson mein hai.',
      '**Lagna nikalna sambhav nahi hai.** Ye kah dena zaroori hai. Din bhar mein baarah lagna udit hote hain; bina samay ke unme se ek chunna sanjog hai. Jo tool "sirf tareekh se lagna" de, wo andaaza de raha hai.',
      '**Jo phir bhi mil jaayega:** Chandra rashi (prayah), Surya rashi (pakka), nakshatra (prayah, par pada nahi), aur grahon ki rashi. Yaani kundali ka aadha hissa — bas bhaav-aadhaarit hissa nahi.',
      'Do vyavharik raste: **ek** — janm pramanpatra, hospital record ya nagar nigam ka record dhoondhiye; **do** — kuch jyotishi "birth time rectification" karte hain, jisme jeevan ki badi ghatnaon se ulta chal kar samay nikala jaata hai. Wo ek vishesheshgya ka kaam hai, kisi calculator ka nahi.',
    ],
  },
  {
    id: 'lagna-vivah',
    h2: 'Lagna aur vivah — saptam bhaav kaise banta hai',
    paras: [
      'Vivah ka bhaav saptam hai, aur wo seedha lagna se nikalta hai — isliye lagna jaane bina vivah ka koi vishleshan sambhav nahi.',
      'Niyam saral hai: **saptam bhaav wo rashi hai jo aapke lagna se theek saatvin hai.** Mesh lagna ka saptam Tula, Vrishabh ka Vrishchik, Mithun ka Dhanu — aur isi kram mein. Uska swami hi aapka **saptamesh** hai, jo jeevansaathi aur vivah ke prashn chalata hai.',
      'Iska ek dilchasp natija: **saptam hamesha lagna ki virodhi rashi hoti hai** — agni ke saamne vayu, prithvi ke saamne jal. Shastra ise sanketik maanta hai: jeevansaathi prayah wo gun laata hai jo apne mein kam hain.',
      'Vivah ke asli prashn — kab hoga, kya rukavat hai — [Shadi Kab Hogi Calculator](/calculators/free-shadi-kab-hogi-calculator) aur [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator) par hain, dono free.',
    ],
  },
  {
    id: 'lagna-aur-upay',
    h2: 'Upay lagna dekh kar hi chunna chahiye',
    paras: [
      'Ye is page ka sabse vyavharik natija hai, aur wahi cheez hai jo galat upayon se bachaati hai.',
      'Aam salah hoti hai: "aapka Shani kamzor hai, Shani ka upay kijiye." Par **upay ka faisla sirf bal se nahi hota** — pehle dekhna padta hai ki wo graha aapke lagna ke liye **shubh hai ya marak.**',
      'Udaharan se saaf hoga. **Vrishabh lagna** ke liye Shani yogakaraka hai — uska balvardhan bahut faayde ka hai. **Mesh lagna** ke liye Shani dasham aur gyarahve ka swami hai — bhoomika alag hai. Aur kuch lagno ke liye wahi graha marak ban jaata hai, jahan uski urja badhana ulta padta hai.',
      'Isliye kram ye rakhiye: **pehle lagna, phir graha ka bhaav-swamitva, phir uska bal, tab upay.** Ratna ke liye [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) free hai aur wo yahi jaanch karta hai.',
    ],
  },
  {
    id: 'lagna-kya-nahi',
    h2: 'Lagna kya nahi bata sakta',
    paras: [
      'Ye seema is page ke apne traffic ke khilaf jaati hai, par likhni chahiye.',
      'Lagna **nahi** bata sakta: koi ghatna kab hogi, aapka bhavishya kya hai, aap safal honge ya nahi, ya kisi prashn ka nishchit uttar. Lagna sirf **aadhaar-bindu** hai — wo batata hai ki bhaav kahan se ginne hain.',
      'Poori tasveer teen aur cheezon se banti hai: **grahon ki sthiti**, **unka bal**, aur **chal rahi dasha.** Teeno lagna ke baad aate hain aur teeno har vyakti ke alag hote hain.',
      'Isliye lagna jaan lena **shuruat** hai, uttar nahi. Aur jo koi sirf lagna dekh kar bhavishya bata de, wo saralikaran bech raha hai. Agla kadam [Kundali Calculator](/calculators/free-kundali-calculator) hai, jo poora chart banata hai — free.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Lagna jaan liya — ab kya',
    paras: [
      '**Lagna kitna mazboot hai** — [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) par lagnesh ka bhaav, uski Shadbala aur pehle bhaav ke graha milte hain.',
      '**Poori kundali** — [Kundali Calculator](/calculators/free-kundali-calculator) par lagna ke saath nau graha degree ke saath, bhaav, nakshatra aur dasha. Chandra rashi [Rashi Calculator](/calculators/free-rashi-calculator) par aur nakshatra [Nakshatra Calculator](/calculators/free-nakshatra-calculator) par.',
      '**Sidhant** — [Planets in Astrology](/learn/planets-in-astrology) mein har graha, [Planetary dignity](/learn/planetary-dignity-exaltation-debilitation) mein uchch-neech, [Raj Yoga](/learn/raj-yoga) mein yog, aur [Mahadasha explained](/learn/mahadasha-explained) mein samay ka kram.',
    ],
  },
];

type LcLink = { href: string; label: string; note: string };

const HUB_CALC: LcLink[] = [
  { href: '/calculators/free-lagna-bal-calculator', label: 'Lagna Bal Calculator', note: 'Lagna kitna mazboot hai' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-rashi-calculator', label: 'Rashi Calculator', note: 'Chandra rashi alag hai' },
  { href: '/calculators/free-nakshatra-calculator', label: 'Nakshatra Calculator', note: 'Nakshatra aur pada' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Vyaktigat samay' },
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Har graha ka bal' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Poora chitra' },
  { href: '/calculators/free-gemstone-suitability-calculator', label: 'Gemstone Suitability', note: 'Ratna lagna se tay hota hai' },
  { href: '/calculators/free-sade-sati-calculator', label: 'Sade Sati Calculator', note: 'Chandra rashi se chalti hai' },
];

const HUB_LEARN: LcLink[] = [
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Lagnesh ka kaarakattva' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Dignity — uchch aur neech', note: 'Graha ki sthiti' },
  { href: '/learn/shadbala-planetary-strength-vedic-astrology', label: 'Shadbala', note: 'Bal naapne ka tarika' },
  { href: '/learn/mahadasha-explained', label: 'Mahadasha explained', note: 'Lagnesh ki dasha' },
  { href: '/learn/raj-yoga', label: 'Raj Yoga', note: 'Kendra aur trikona' },
  { href: '/learn/vipreet-raj-yoga', label: 'Vipreet Raj Yoga', note: '6, 8, 12 ka yog' },
  { href: '/learn/neech-bhang-raj-yoga', label: 'Neech Bhang Raj Yoga', note: 'Neech ka dosh kat jaana' },
  { href: '/learn/career-prediction-astrology', label: 'Career Prediction', note: 'Dasham bhaav ka prashn' },
  { href: '/learn/how-to-wear-gemstone-vedic', label: 'Ratna pehanne ki vidhi', note: 'Faisle ke baad' },
];

function LcRich({ text, k }: { text: string; k: string }) {
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

function LcHub({ items }: { items: LcLink[] }) {
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

export default function FreeLagnaCalculatorPage() {
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

  // ─── LAGNA extraction ─── Ascendant = lagna.sign ────────────
  const lagnaSign = result?.kundali?.lagna?.sign ?? null;
  const lagnaSignEn = result?.kundali?.lagna?.sign_en ?? null;
  const lagnaLord = result?.kundali?.lagna?.sign_lord ?? null;
  const lagnaDegree = result?.kundali?.lagna?.degree_in_sign ?? null;
  const lagnaNakshatra = result?.kundali?.lagna?.nakshatra ?? null;
  const lagnaPada = result?.kundali?.lagna?.pada ?? null;

  const lagnaDetails = lagnaSign ? LAGNA_DATA[lagnaSign] || {} : {};

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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-lagna-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Lagna Calculator — Find Your Ascendant (Rising Sign) Online',
    description:
      'Find your Lagna (Ascendant / Rising Sign) from your birth chart — Lagna lord, element, body type, personality traits, favorable careers and 3 free Parashar remedies. Free Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Lagna Calculator',
    aboutEntities: ['Lagna', 'Ascendant', 'First House', 'Lagna Lord'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Lagna', 'Ascendant'],
    howToName: 'How to find your Lagna (Ascendant)',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth (exact time is critical for Lagna).' },
      { name: 'Compute the Ascendant', text: 'The calculator finds the rising sign on the eastern horizon at birth using Swiss Ephemeris with Lahiri Ayanamsha.' },
      { name: 'Get your result', text: 'See your Lagna, lord planet, element, body type, personality, favorable careers and 3 free Parashar remedies.' },
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
            <span style={{ color: GOLD }}>Free Lagna Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Lagna Calculator — Find Your Ascendant (Rising Sign) Online
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Lagna Calculator</strong> aapka Ascendant (Lagna Rashi) Swiss Ephemeris se calculate karta hai — janm samay east horizon par udit Rashi se. Date, exact birth time, aur place daalo — Lagna, lord planet, element, body type, personality traits, favorable careers, aur 3 free Parashar remedies (Mantra, Ratna, Daan) turant milte hain. 100% free, BPHS classical rules.
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
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Lagna / Ascendant (Free)</h2>
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
                  {form.unknownTime ? '⚠️ Lagna changes every 2 hours. Without exact time, Lagna will be approximate (noon solar chart).' : '⏰ Exact birth time is CRITICAL for accurate Lagna. Even 15 min difference can change result.'}
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
                {loading ? '⟳ Finding Lagna...' : '⬆️ Find My Lagna'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Shadbala · Bhrigu Nandi</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* LAGNA HERO */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                  {form.name ? `${form.name}'s ` : ''}Lagna (Ascendant)
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: GOLD }}>
                  ⬆️ {lagnaSign || '—'}
                </div>
                {lagnaSignEn && (
                  <div className="text-base text-slate-300">
                    ({lagnaSignEn}) <span style={{ color: GOLD }} className="mx-2">·</span> Lagna Lord: <span style={{ color: GOLD }} className="font-bold">{lagnaLord}</span>
                  </div>
                )}
                {lagnaDegree !== null && (
                  <div className="text-sm text-slate-400 mt-2">
                    Lagna Degree: <span style={{ color: GOLD }}>{lagnaDegree.toFixed(2)}°</span> in {lagnaSign}
                  </div>
                )}
                {lagnaNakshatra && (
                  <div className="text-sm text-slate-400 mt-1">
                    Lagna Nakshatra: <span style={{ color: GOLD }}>{lagnaNakshatra}</span> {lagnaPada && `(Pada ${lagnaPada})`}
                  </div>
                )}
                {lagnaDetails.personality && (
                  <div className="text-sm text-slate-300 mt-4 italic max-w-2xl mx-auto">"{lagnaDetails.personality}"</div>
                )}
              </div>

              {/* BODY + PERSONALITY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>🧍 Body Type (Sharir Lakshana)</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{lagnaDetails.body || '—'}</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>💼 Favorable Careers</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{lagnaDetails.career || '—'}</p>
                </div>
              </div>

              {/* LAGNA DETAILS */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>Lagna Details (Parashar BPHS)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DetailCell icon="🪐" label="Lagna Lord (Ruler)" value={lagnaLord} />
                  <DetailCell icon="🔥" label="Element (Tatva)" value={lagnaDetails.element} />
                  <DetailCell icon="📐" label="Lagna Degree" value={lagnaDegree !== null ? `${lagnaDegree.toFixed(2)}°` : null} />
                  <DetailCell icon="⭐" label="Lagna Nakshatra" value={lagnaNakshatra} />
                  <DetailCell icon="🎯" label="Pada" value={lagnaPada ? `${lagnaPada} of 4` : null} />
                  <DetailCell icon="🌍" label="English Name" value={lagnaSignEn} />
                </div>
                <p className="text-xs text-slate-500 mt-4 italic">
                  Lagna changes every ~2 hours. Lagna lord's house position determines major life themes per Parashar BPHS.
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
                    <LcRich text={p} k={`s${si}-p${pi}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* ── v2.0: the lagna cluster ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Lagna ke aage — baaki free calculators</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Ye page batata hai kaunsa lagna. Wo kitna mazboot hai — wo agla prashn hai, aur uske liye alag page hai. Sab free.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Aur bhi free calculators</h3>
                <LcHub items={HUB_CALC} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Sidhant samjhiye</h3>
                <LcHub items={HUB_LEARN} />
              </div>
            </div>
          </section>

          {/* comparison table — kept from v1.x, unchanged */}
          <section className="mt-4 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk Lagna Calculator</h2>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lagna Degree + Nakshatra</td><td className="p-3" style={{ color: GOLD }}>✓ Precise</td><td className="p-3 text-slate-500">✗ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Body Type + Personality</td><td className="p-3" style={{ color: GOLD }}>✓ Detailed</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Favorable Careers</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Mantra+Ratna+Daan</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Lagna Calculator</h2>
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
