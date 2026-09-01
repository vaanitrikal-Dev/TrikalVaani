'use client';

// ============================================================
// File: app/calculators/free-gemstone-calculator/page.tsx
// Version: v2.0 — Free Gemstone (Ratna) Calculator (Radar E3 content build)
// API: /api/calc/kundali (calcType: 'gemstone') — already live
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-08-31) — CONTENT + INTERNAL LINKING REBUILD.
//        Fifth page in this series, after kaal-sarp, pitra-dosh, sade-sati
//        and manglik. Driven by the Radar E3 PAA/PASF brief (31 Aug 2026).
//        • Word count 1,004 → 3,900+. Competitor tool-page average is 1,573.
//          Live baseline 31 Aug: 1,004 words, 7 H2, 24 links — the 24 being
//          header/footer nav only, i.e. zero contextual links in the body.
//        • 11 new H2 sections, each answering one keyword Google itself
//          suggested, ordered by seen_count (4 → 2).
//        • Inline links into the 44-post gemstone cluster already in
//          Supabase: all 12 lagna pages, all 9 stone pages, the upratna
//          guide, wearing rules, the full FAQ and why-wrong-gemstone-harms.
//          EVERY href verified against the live sitemap on 31 Aug 2026.
//        • Two new linked tables: RASHI_RATNA (12 Moon signs → sign lord →
//          stone) and UPRATNA (9 planets → main stone → documented
//          substitutes). Both were the direct ask in the brief.
//        • FAQS expanded 9 → 18 (all feed the existing FAQPage schema).
//        • Added a DISCLOSURE line in the footer: Trikaal Vaani does not
//          sell gemstones, has no affiliate links and takes no jeweller
//          commission. That is worth stating on this page specifically,
//          because it is the reason the page is able to tell a reader not
//          to buy anything — which almost no gemstone page can.
//
//        FOUR HONESTY CALLS, all deliberate, all costing keyword volume:
//          – "84 उपरत्न कौन से हैं" (seen 3x): no fabricated list of 84.
//            No authentic 84-item list exists; the number circulates with a
//            different list every time. The page says so and gives the nine
//            documented per-planet substitutes instead, plus the warning
//            that an upratna is NOT a "safe alternative" — if the main
//            stone is harmful the substitute is too, only slower.
//          – "उम्र के हिसाब से रत्न" (seen 3x): there is no classical
//            age-based gemstone rule. The page says that outright and
//            redirects to what actually changes with age — the Dasha.
//          – "12 birth stones" (seen 2x): answered as WESTERN tradition,
//            standardised by the American jewellery trade in 1912, with no
//            connection to Jyotish — rather than blending the two systems
//            the way most pages ranking for this term do.
//          – "KP astrology gemstone" (seen 2x): stated plainly that KP is a
//            different system (KP ayanamsha, sub-lords, ascendant sub-lord
//            rather than ascendant lord) and that we do NOT provide KP
//            recommendations and will not pass a Parashara result off as one.
//        Same treatment for "लाल किताब के अनुसार रत्न" as on the Pitra Dosh
//        page — reported, with an explicit statement that we practise
//        Parashara BPHS and do not prescribe Lal Kitab, plus the genuinely
//        interesting note that Lal Kitab is itself unusually cautious about
//        gemstones and treats them as a last resort.
//        • FORM, VALIDATION, API CALL, RESULT RENDERING, GEM map,
//          PLANET_ALIASES, resolvePlanet, CAUTION_TEXT, the Suitability
//          bridge banner, DetailCell and the inline JSON-LD @graph ARE
//          UNCHANGED from v1.1. (Note: this page builds its @graph inline
//          rather than via buildCalcJsonLd — left exactly as it was.)
//   v1.1: BRIDGE to the new Gemstone Suitability Calculator — result now
//        carries a prominent "is this safe?" banner + CTA, Life Stone
//        overclaim softened, related grid + 1 FAQ added. Resolves the
//        contradiction between this (Lagna-swami overview) and the deep
//        8-niyam suitability engine.
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


// ============================================================
// v2.0 — MARKDOWN-LITE RENDERER
// ============================================================
function renderRich(text: string, keyBase: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <Link
          key={`${keyBase}-l-${i}`}
          href={link[2]}
          style={{ color: GOLD }}
          className="font-semibold underline underline-offset-2 hover:opacity-80 transition"
        >
          {link[1]}
        </Link>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyBase}-b-${i}`} style={{ color: GOLD }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyBase}-s-${i}`}>{part}</span>;
  });
}

// ── Moon-sign (rashi) → sign lord → that lord's stone.
//    This is the "राशि अनुसार रत्न चार्ट" people search for. It is a valid
//    fallback ONLY when the birth time is unknown; with a birth time the
//    Lagna-based reading above is the correct one, and the page says so.
const RASHI_RATNA: { rashi: string; en: string; lord: string; stone: string; slug: string }[] = [
  { rashi: 'मेष',     en: 'Aries',       lord: 'मंगल',  stone: 'मूंगा (Red Coral)',        slug: 'best-gemstones-for-aries-lagna-hindi' },
  { rashi: 'वृषभ',    en: 'Taurus',      lord: 'शुक्र', stone: 'हीरा (Diamond)',           slug: 'best-gemstones-for-taurus-lagna-hindi' },
  { rashi: 'मिथुन',   en: 'Gemini',      lord: 'बुध',   stone: 'पन्ना (Emerald)',          slug: 'best-gemstones-for-gemini-lagna-hindi' },
  { rashi: 'कर्क',    en: 'Cancer',      lord: 'चंद्र', stone: 'मोती (Pearl)',             slug: 'best-gemstones-for-cancer-lagna-hindi' },
  { rashi: 'सिंह',    en: 'Leo',         lord: 'सूर्य', stone: 'माणिक (Ruby)',             slug: 'best-gemstones-for-leo-lagna-hindi' },
  { rashi: 'कन्या',   en: 'Virgo',       lord: 'बुध',   stone: 'पन्ना (Emerald)',          slug: 'best-gemstones-for-virgo-lagna-hindi' },
  { rashi: 'तुला',    en: 'Libra',       lord: 'शुक्र', stone: 'हीरा (Diamond)',           slug: 'best-gemstones-for-libra-lagna-hindi' },
  { rashi: 'वृश्चिक', en: 'Scorpio',     lord: 'मंगल',  stone: 'मूंगा (Red Coral)',        slug: 'best-gemstones-for-scorpio-lagna-hindi' },
  { rashi: 'धनु',     en: 'Sagittarius', lord: 'गुरु',  stone: 'पुखराज (Yellow Sapphire)', slug: 'best-gemstones-for-sagittarius-lagna-hindi' },
  { rashi: 'मकर',     en: 'Capricorn',   lord: 'शनि',   stone: 'नीलम (Blue Sapphire) ⚠️',  slug: 'best-gemstones-for-capricorn-lagna-hindi' },
  { rashi: 'कुंभ',    en: 'Aquarius',    lord: 'शनि',   stone: 'नीलम (Blue Sapphire) ⚠️',  slug: 'best-gemstones-for-aquarius-lagna-hindi' },
  { rashi: 'मीन',     en: 'Pisces',      lord: 'गुरु',  stone: 'पुखराज (Yellow Sapphire)', slug: 'best-gemstones-for-pisces-lagna-hindi' },
];

// ── The nine documented upratna (substitute) stones, one per graha.
//    NOT a list of 84 — see the 'upratna' PILLAR section for why we refuse
//    to publish that number.
const UPRATNA: { planet: string; main: string; sub: string; slug: string }[] = [
  { planet: 'सूर्य',  main: 'माणिक',   sub: 'गार्नेट (तामड़ा), रेड स्पिनेल, सनस्टोन', slug: 'manik-ruby-benefits-side-effects-hindi' },
  { planet: 'चंद्र',  main: 'मोती',    sub: 'मूनस्टोन (चंद्रकांत मणि)',              slug: 'moti-pearl-benefits-side-effects-hindi' },
  { planet: 'मंगल',   main: 'मूंगा',   sub: 'कार्नेलियन, रेड जैस्पर',                slug: 'moonga-red-coral-benefits-side-effects-hindi' },
  { planet: 'बुध',    main: 'पन्ना',   sub: 'पेरिडॉट, ग्रीन टूरमलाइन, ग्रीन ओनिक्स',  slug: 'panna-emerald-benefits-side-effects-hindi' },
  { planet: 'गुरु',   main: 'पुखराज',  sub: 'सुनहला (गोल्डन टोपाज़), सिट्रीन',        slug: 'pukhraj-yellow-sapphire-benefits-side-effects-hindi' },
  { planet: 'शुक्र',  main: 'हीरा',    sub: 'सफेद सफायर, ज़िरकॉन, ओपल',              slug: 'heera-diamond-benefits-side-effects-hindi' },
  { planet: 'शनि',    main: 'नीलम',    sub: 'नीली (ब्लू स्पिनेल), लाजवर्त, एमेथिस्ट',  slug: 'neelam-blue-sapphire-benefits-side-effects-hindi' },
  { planet: 'राहु',   main: 'गोमेद',   sub: 'हेसोनाइट गार्नेट का हल्का ग्रेड',        slug: 'gomed-hessonite-benefits-side-effects-hindi' },
  { planet: 'केतु',   main: 'लहसुनिया', sub: 'क्वार्ट्ज़ कैट्स आई, फाइबरग्लास कैट्स आई', slug: 'lehsunia-cats-eye-benefits-side-effects-hindi' },
];

// ============================================================
// v2.0 — PILLAR CONTENT
// Every h2 is a keyword Google itself surfaced in PAA/PASF for this
// page's SERPs (Radar E3, 31 Aug 2026), ordered by seen_count (4 → 2).
// ============================================================
type PillarSection = { id: string; h2: string; paras: string[] };

const PILLAR: PillarSection[] = [
  {
    id: 'kaise-kaam-karta-hai',
    h2: 'Accurate Gemstone Calculator — यह कैसे काम करता है',
    paras: [
      'यह पेज एक ही सवाल का उत्तर देता है, और वह सटीकता से: **आपका मुख्य रत्न कौन सा है।** तरीका तीन कदम का है। पहला, आपके जन्म समय और स्थान से **लग्न** निकाला जाता है। दूसरा, लग्न राशि का **स्वामी ग्रह** पहचाना जाता है। तीसरा, उस ग्रह का रत्न आपका **जीवन रत्न (Life Stone)** होता है — साथ में धातु, उंगली, दिन और मंत्र।',
      'अब वह बात जो अधिकांश "accurate gemstone calculator" नहीं बताते: **यह पूरा उत्तर नहीं है।** लग्न स्वामी का रत्न *कौन सा* है यह बताना आसान है; असली सवाल यह है कि *क्या वह आपके लिए सुरक्षित भी है*। इसके लिए चार और चीज़ें देखनी पड़ती हैं — वह ग्रह **फंक्शनल बेनेफिक है या मैलेफिक**, उसका **षड्बल** कितना है, वह कहीं **दुष्टस्थान (6/8/12) का स्वामी** तो नहीं, और कहीं **अस्त (combust)** तो नहीं।',
      'वही काम [रत्न सुटेबिलिटी कैलकुलेटर](/calculators/free-gemstone-suitability-calculator) करता है — हर रत्न को **0 से 100** का स्कोर देकर। इसलिए सही क्रम यह है: पहले यहाँ अपना जीवन रत्न जानिए, फिर वहाँ जाँचिए कि उसे पहनना चाहिए या नहीं। गलत रत्न से क्या होता है, यह [गलत रत्न आपको नुकसान क्यों पहुंचा सकता है](/blog/why-wrong-gemstone-can-harm-you-hindi) में साफ लिखा है — और यह पढ़ने लायक है, क्योंकि रत्न एकमात्र उपाय है जो सक्रिय रूप से नुकसान कर सकता है।',
    ],
  },
  {
    id: 'upratna',
    h2: '84 उपरत्न कौन से हैं?',
    paras: [
      'ईमानदार जवाब पहले: **"84 उपरत्न" की कोई प्रामाणिक, शास्त्र-सम्मत सूची मौजूद नहीं है।** यह संख्या इंटरनेट पर घूमती है और हर जगह अलग-अलग सूची के साथ मिलती है — कहीं 84, कहीं 64, कहीं 21। हम कोई मनगढ़ंत 84 की सूची नहीं देंगे, क्योंकि वह लिखते ही यह पेज उसी श्रेणी में चला जाएगा जिसकी आलोचना यह कर रहा है।',
      'जो **वास्तव में प्रामाणिक** है वह यह है: नवग्रह के नौ मुख्य रत्नों में से हर एक के लिए **कुछ मान्य विकल्प (उपरत्न)** शास्त्र और परंपरा दोनों में मिलते हैं। उपरत्न का उद्देश्य एक ही है — जब मुख्य रत्न बहुत महँगा हो, तो कम कीमत में उसी ग्रह की ऊर्जा का हल्का रूप मिल सके। नीचे की तालिका में नौ ग्रह और उनके मान्य उपरत्न दिए हैं।',
      'दो बातें जो उपरत्न खरीदने से पहले जान लेनी चाहिए। पहली, **उपरत्न हल्का होता है, इसलिए वजन अधिक लगता है** — आमतौर पर मुख्य रत्न से दो से तीन गुना, और सही वजन जानकार से ही तय कराइए। दूसरी, और यह ज्यादा जरूरी है: **उपरत्न "सुरक्षित विकल्प" नहीं है।** अगर मुख्य रत्न आपके लिए हानिकारक है, तो उसका उपरत्न भी हानिकारक रहेगा — बस असर धीमा होगा। पूरा विवरण [उपरत्न गाइड: हर ग्रह के लिए विकल्प रत्न](/blog/upratna-substitute-gemstone-guide-hindi) में है।',
    ],
  },
  {
    id: 'umar-ke-hisaab-se',
    h2: 'उम्र के हिसाब से रत्न धारण करना',
    paras: [
      'यह सवाल बहुत खोजा जाता है और इसका जवाब चौंकाने वाला है: **शास्त्र में उम्र के हिसाब से रत्न का कोई नियम नहीं है।** न "25 के बाद यह पहनें", न "40 के बाद वह उतार दें"। जो सूचियाँ ऐसा दावा करती हैं, वे पश्चिमी birthstone परंपरा और भारतीय ज्योतिष को मिलाकर बनाई गई हैं, और दोनों का आपस में कोई सम्बन्ध नहीं है।',
      'फिर भी सवाल के पीछे एक **असली बात** छिपी है, और वही असल उत्तर है: **उम्र के साथ जो बदलता है वह दशा है।** जीवन रत्न (लग्न स्वामी का) पूरे जीवन एक ही रहता है, पर आपकी चल रही **महादशा हर कुछ वर्ष में बदलती है** — और उसके साथ वह रत्न भी बदल सकता है जो इस समय के लिए उपयोगी है। यही कारण है कि ऊपर का परिणाम **दो** रत्न दिखाता है: जीवन रत्न और वर्तमान अवधि का रत्न।',
      'व्यावहारिक नियम इसलिए यह है: **उम्र मत देखिए, दशा देखिए।** अपनी चल रही महादशा और वह कब बदलेगी, यह [मुफ्त दशा कैलकुलेटर](/calculators/free-dasha-calculator) से देख लीजिए। एक अपवाद जरूर है और वह उम्र से जुड़ा है — **बच्चों को नीलम, गोमेद या लहसुनिया जैसे तीव्र रत्न नहीं पहनाए जाते**, और यह परंपरा में लगभग सर्वसम्मत है।',
    ],
  },
  {
    id: 'janm-aur-naam-se',
    h2: 'जन्म और नाम की तारीख के अनुसार रत्न',
    paras: [
      'तीन अलग-अलग तरीके प्रचलित हैं, और उनकी सटीकता एक जैसी बिल्कुल नहीं है। इन्हें अलग-अलग समझ लेना जरूरी है, क्योंकि तीनों को एक ही नाम से बेचा जाता है।',
      '**सबसे सटीक — जन्म तिथि + सटीक समय + स्थान:** इससे लग्न बनता है, और लग्न स्वामी का रत्न ही शास्त्रीय जीवन रत्न है। यही ऊपर वाला कैलकुलेटर करता है। **मध्यम — केवल जन्म तिथि (बिना समय):** लग्न नहीं बन सकता, इसलिए चंद्र राशि से काम चलाया जाता है — नीचे की राशि-रत्न तालिका इसी के लिए है। यह अनुमान है, गणना नहीं, पर बेकार नहीं। **सबसे कमजोर — नाम के अक्षर से:** यह अंक ज्योतिष या नाम-राशि से निकलता है, वैदिक कुंडली से नहीं। परंपरा में इसकी जगह है, पर इसे जन्म-कुंडली आधारित रत्न के बराबर मत मानिए।',
      'साफ सलाह: **अगर आपका जन्म समय उपलब्ध है तो नाम या केवल तारीख वाले तरीके इस्तेमाल करने की कोई वजह नहीं है।** जन्म समय अस्पताल के रिकॉर्ड या जन्म प्रमाणपत्र से लीजिए, और [मुफ्त कुंडली कैलकुलेटर](/calculators/free-kundali-calculator) से पूरी कुंडली बना लीजिए। समय सचमुच न हो तभी राशि वाला रास्ता लीजिए — और तब भी कोई महँगा रत्न खरीदने से पहले किसी जानकार से पुष्टि करा लीजिए।',
    ],
  },
  {
    id: 'kundali-ke-hisaab-se',
    h2: 'कुंडली के हिसाब से कौन सा रत्न पहनें?',
    paras: [
      'शास्त्रीय परंपरा में **तीन रत्न** बताए जाते हैं, और तीनों अलग काम के लिए हैं। **जीवन रत्न** — लग्न स्वामी का, जो आत्म-बल, स्वास्थ्य और समग्र जीवन को सहारा देता है; यही सबसे मुख्य है। **भाग्य रत्न** — नवम भाव के स्वामी का, क्योंकि नवम भाव भाग्य और पुण्य का स्थान है। **कार्य रत्न** — दशम भाव के स्वामी का, करियर और कर्म के लिए।',
      'पर यहीं वह बात है जो अधिकांश दुकानें नहीं बतातीं: **तीनों एक साथ पहनना अक्सर गलत होता है।** अगर तीनों में से कोई एक ग्रह आपकी कुंडली में फंक्शनल मैलेफिक है, तो उसका रत्न पहनना उस ग्रह को बल देकर नुकसान बढ़ा सकता है। रत्न ग्रह को *मजबूत* करता है — और कमजोर मैलेफिक को मजबूत करना कमजोर छोड़ देने से बुरा है।',
      'इसलिए सही क्रम: **पहले एक रत्न, वह भी सुटेबिलिटी जाँचने के बाद, और कम से कम तीन महीने पहनकर देखने के बाद ही दूसरे की सोचिए।** कौन सा ग्रह आपके लिए शुभ है यह लग्न पर निर्भर करता है, और हर लग्न के लिए अलग विश्लेषण [कौन सा रत्न पहनना चाहिए?](/blog/which-gemstone-should-i-wear-hindi) और अपने लग्न वाले पेज में है — नीचे की तालिका से सीधे पहुँच सकते हैं। ग्रह की असली शक्ति [ग्रह बल कैलकुलेटर](/calculators/free-graha-bal-calculator) से देखिए।',
    ],
  },
  {
    id: 'rashi-anusar-chart',
    h2: 'राशि अनुसार रत्न चार्ट — बारहों राशियाँ',
    paras: [
      'नीचे की तालिका **चंद्र राशि (जन्म राशि)** के आधार पर रत्न बताती है — हर राशि का स्वामी ग्रह, और उस ग्रह का रत्न। हर पंक्ति उस राशि/लग्न के विस्तृत पेज से जुड़ी है।',
      'इसे इस्तेमाल करने से पहले एक जरूरी शर्त: **यह तरीका तभी उपयोग करें जब आपका जन्म समय उपलब्ध न हो।** अगर समय मालूम है तो लग्न आधारित उत्तर ही सही है, और वह ऊपर वाला कैलकुलेटर देता है। राशि आधारित रत्न एक व्यावहारिक विकल्प है, शास्त्रीय आदर्श नहीं — और अखबार वाली "राशि" तो अक्सर सूर्य राशि होती है, जो यहाँ बिल्कुल काम नहीं आती। अपनी असली चंद्र राशि [राशि कैलकुलेटर](/calculators/free-rashi-calculator) से निकाल लीजिए।',
      'तालिका में दो जगह ⚠️ लगा है — **मकर और कुंभ, जिनका स्वामी शनि है और रत्न नीलम।** नीलम सबसे तीव्र रत्न माना जाता है, और यह अकेली ऐसी सिफारिश है जिसे बिना विशेषज्ञ परामर्श और बिना तीन दिन के ट्रायल के कभी नहीं अपनाना चाहिए। शनि की राशि होने भर से नीलम सुरक्षित नहीं हो जाता।',
    ],
  },
  {
    id: 'lal-kitab-ratna',
    h2: 'लाल किताब के अनुसार रत्न',
    paras: [
      'पहले एक साफ घोषणा, क्योंकि यह ईमानदारी की बात है: **त्रिकाल वाणी पराशर BPHS परंपरा में काम करता है, लाल किताब में नहीं।** लाल किताब बीसवीं सदी की एक अलग पद्धति है, अपने अलग नियमों और अलग तर्क के साथ। यहाँ जो बताया जा रहा है वह सूचना है, हमारी सिफारिश नहीं।',
      'लाल किताब का रत्न को लेकर रुख उल्लेखनीय रूप से **सतर्क** है, और यह जानने लायक है। लाल किताब में रत्न को अंतिम विकल्प माना गया है, पहला नहीं — वहाँ जोर **टोटकों** पर है: दान, बहते जल में वस्तु प्रवाहित करना, किसी को कुछ देना। तर्क यह है कि रत्न ग्रह की ऊर्जा **बढ़ाता** है, और अगर ग्रह पहले से गड़बड़ स्थिति में है तो बढ़ाना खतरनाक है। यह चेतावनी पराशर परंपरा की फंक्शनल-मैलेफिक चेतावनी से मेल खाती है, भले शब्द अलग हों।',
      'हमारी सलाह वही है जो पितृ दोष के मामले में है: **अगर आप लाल किताब मानते हैं तो किसी लाल किताब के जानकार से ही परामर्श लीजिए, दो पद्धतियों को मिलाइए मत।** मिलाने पर न कोई नियम पूरा लागू होता है, न परिणाम जाँचा जा सकता है। पराशर-आधारित पूरे नियम [रत्न धारण नियम: व्यावहारिक करें और न करें](/blog/gemstone-wearing-rules-practical-guide-hindi) में हैं।',
    ],
  },
  {
    id: '12-birth-stones',
    h2: 'What Are the 12 Birth Stones? (And Why They Are Not Vedic)',
    paras: [
      'The twelve birthstones — garnet for January, amethyst for February, aquamarine for March and so on — belong to the **Western birthstone tradition**, not to Jyotish. The modern list was standardised by the American jewellery trade in 1912 and revised since. It is a calendar-month system, and it has **no connection to Vedic gemstone astrology** whatsoever.',
      'The two systems disagree on almost everything that matters. Western birthstones are assigned by **calendar month**; Vedic stones are assigned by **planet**, and the planet is found from your ascendant lord or your Moon sign. Western birthstones carry **no risk framework** — every month gets a stone and nobody is warned off one. Vedic Jyotish explicitly holds that the **wrong stone can harm you**, which is why Neelam, Gomed and Lehsunia come with warnings and a trial period.',
      'So if you were born in September, the Western list gives you sapphire. Whether you should actually wear a blue sapphire depends on your Saturn — its functional nature, its Shadbala, whether it rules a dusthana, whether it is combust. Those are different questions with different answers, and only one of them is about your birth month. Wearing a birthstone as jewellery is entirely fine; treating it as a Vedic remedy is a category error. The full comparison is in [Gemstone Questions Answered](/blog/gemstone-faq-vedic-astrology).',
    ],
  },
  {
    id: 'kp-astrology',
    h2: 'Gemstone Recommendation as per KP Astrology',
    paras: [
      '**KP (Krishnamurti Paddhati) is a different system from the Parashara method this calculator uses**, and it is worth stating that plainly rather than blurring the two. KP was developed in the twentieth century by K.S. Krishnamurti and differs in three fundamental ways: it uses the **KP ayanamsha** rather than Lahiri, it divides each nakshatra into **sub-lords**, and it judges a planet by the houses its **star lord and sub lord** signify rather than by the house it sits in.',
      'For gemstones the practical consequence is real. In Parashara, the primary stone comes from the **ascendant lord**. In KP, the recommendation is usually built from the **sub-lord of the ascendant** and from which houses that sub-lord signifies — so the two methods can, and sometimes do, arrive at different stones from the same birth data. Neither is malfunctioning; they are answering the question with different machinery.',
      'This page and every calculator on Trikaal Vaani compute on **Swiss Ephemeris with Lahiri Ayanamsha under classical Parashara BPHS rules**. We do not offer KP recommendations, and we will not present a Parashara result as a KP one. If KP is what you follow, consult a KP practitioner — and, as with Lal Kitab, do not mix the two systems, because a stone chosen half by one method and half by another satisfies neither.',
    ],
  },
  {
    id: 'punya-ratna',
    h2: 'पुण्य रत्न क्या होता है?',
    paras: [
      '**पुण्य रत्न वह रत्न है जो नवम भाव के स्वामी ग्रह का होता है।** नाम की वजह सीधी है — नवम भाव को शास्त्र में **भाग्य स्थान, धर्म स्थान और पुण्य स्थान** कहा जाता है, इसलिए उसके स्वामी के रत्न को कुछ परंपराओं में पुण्य रत्न या भाग्य रत्न कहा जाता है।',
      'यहाँ पारिभाषिक ईमानदारी जरूरी है: **यह नाम हर परंपरा में एक जैसा नहीं है।** कुछ जगह "भाग्य रत्न" कहते हैं, कुछ जगह "पुण्य रत्न", और कुछ जगह यह शब्द किसी और अर्थ में इस्तेमाल होता है। जो सर्वमान्य है वह **तीन रत्नों की व्यवस्था** है — जीवन रत्न (लग्न स्वामी), भाग्य/पुण्य रत्न (नवम स्वामी), और कार्य रत्न (दशम स्वामी) — नाम भले बदल जाएँ, ढाँचा यही रहता है।',
      'व्यावहारिक बात: पुण्य रत्न तब विचार में आता है जब **भाग्य से जुड़ी रुकावट** महसूस हो — मेहनत के बावजूद अवसर न बनना, पिता या गुरु-पक्ष से सहयोग न मिलना, धार्मिक-आध्यात्मिक दिशा में अस्थिरता। पर वही चेतावनी यहाँ भी लागू है: **नवम स्वामी अगर आपके लग्न के लिए फंक्शनल मैलेफिक है, तो उसका रत्न मदद नहीं करेगा।** पहले [सुटेबिलिटी जाँचिए](/calculators/free-gemstone-suitability-calculator), फिर सोचिए।',
    ],
  },
  {
    id: 'sabse-lucky',
    h2: 'Which Stone Is Very Lucky?',
    paras: [
      'The honest answer is the one nobody selling stones will give you: **there is no universally lucky gemstone.** A stone is lucky for you only if the planet it strengthens is a benefic for your ascendant. The same stone that transforms one person\'s year can quietly work against the next person\'s, and both outcomes are consistent with the same classical rules.',
      'That said, two stones are **most often** recommended, and the reason is structural rather than mystical. **Pukhraj (Yellow Sapphire)** carries Jupiter, and Jupiter is the natural benefic of the chart — it also has the widest safety margin, which is why it is suggested more than any other stone. **Moti (Pearl)** carries the Moon, and the Moon rules the mind; a pearl is the gentlest of the nine and is very rarely harmful. If someone insists on a "generally safe" answer, those two are it — but generally safe is not the same as right for you.',
      'And the corollary, which matters more: **three stones are the least universally safe** — [Neelam](/blog/neelam-blue-sapphire-benefits-side-effects-hindi) (Saturn), [Gomed](/blog/gomed-hessonite-benefits-side-effects-hindi) (Rahu) and [Lehsunia](/blog/lehsunia-cats-eye-benefits-side-effects-hindi) (Ketu). Neelam in particular is famous for acting fast in both directions, which is exactly why classical practice demands a three-day trial before permanent wear. Never buy one on a shop\'s recommendation. Run the [suitability check](/calculators/free-gemstone-suitability-calculator) first, then trial it, then decide.',
    ],
  },
];

const FAQS = [
  { q: 'Mera lucky gemstone (ratna) kaunsa hai?', a: 'Aapka mukhya "Life Stone" aapke Lagna (ascendant) ke swami graha ka ratna hota hai. Trikaal Vaani Swiss Ephemeris se aapka lagna aur lagna-swami nikaalta hai, phir uska ratna (jaise Lagna swami Guru ho to Pukhraj) batata hai — saath mein metal, ungli, din aur mantra. Par pehnne se pehle suitability zaroor check karein.' },
  { q: 'Accurate gemstone calculator kaise kaam karta hai?', a: 'Teen kadam: (1) janm samay aur sthan se Lagna nikalta hai, (2) Lagna rashi ka swami graha pehchana jaata hai, (3) us graha ka ratna aapka Life Stone hota hai. Par yeh poora jawab nahi hai — yeh nahi batata ki woh ratna safe bhi hai. Uske liye functional benefic/malefic, Shadbala, dushthana swamitva aur combustion — chaaron dekhne padte hain, jo Suitability Calculator karta hai.' },
  { q: '84 उपरत्न कौन से हैं?', a: '"84 upratna" ki koi pramanik shastra-sammat soochi maujood nahi hai — yeh sankhya internet par ghoomti hai aur har jagah alag soochi ke saath milti hai. Jo vastav mein pramanik hai woh yeh ki navagraha ke nau mukhya ratnon mein se har ek ke liye kuch manya vikalp (upratna) hain, jaise Manik ke liye Garnet, Moti ke liye Moonstone, Pukhraj ke liye Sunehla. Yaad rakhiye: upratna "safe vikalp" nahi hai — agar mukhya ratna nuksandeh hai to upratna bhi rahega, bas asar dheema hoga.' },
  { q: 'क्या उम्र के हिसाब से रत्न बदलना चाहिए?', a: 'Shastra mein umar ke hisaab se ratna ka koi niyam nahi hai. Jo umar ke saath badalta hai woh dasha hai — Jeevan Ratna (lagna swami ka) poore jeevan ek hi rehta hai, par chal rahi Mahadasha har kuch varsh mein badalti hai aur uske saath period ka ratna bhi. Ek apvaad zaroor hai: bachchon ko Neelam, Gomed ya Lehsunia jaise teevra ratna nahi pehnaye jaate.' },
  { q: 'जन्म तारीख या नाम से रत्न कैसे चुनें?', a: 'Teen tareeke hain aur sateekta alag hai. Sabse sateek: janm tithi + sateek samay + sthan se Lagna, aur lagna swami ka ratna. Madhyam: sirf janm tithi se Chandra Rashi, aur rashi swami ka ratna — anuman hai, ganana nahi. Sabse kamzor: naam ke akshar se, jo ank jyotish se aata hai, vaidik kundali se nahi. Agar janm samay uplabdh hai to baaki do tareeke istemal karne ki koi wajah nahi.' },
  { q: 'कुंडली के हिसाब से कितने रत्न पहन सकते हैं?', a: 'Shastra mein teen bataye jaate hain: Jeevan Ratna (lagna swami), Bhagya/Punya Ratna (navam swami) aur Karya Ratna (dasham swami). Par teenon ek saath pehnna aksar galat hota hai — agar koi ek graha aapke lagna ke liye functional malefic hai to uska ratna nuksan badha sakta hai. Sahi kram: ek ratna, suitability jaanch ke baad, kam se kam teen maheene pehen kar dekhne ke baad hi doosre ki sochiye.' },
  { q: 'राशि अनुसार रत्न चार्ट कैसे padhein?', a: 'Chart Chandra Rashi ke aadhar par hai — har rashi ka swami graha, aur us graha ka ratna. Par shart yeh hai: ise tabhi istemal karein jab janm samay uplabdh na ho. Samay maalum ho to Lagna aadharit uttar hi sahi hai. Aur akhbar wali "rashi" aksar Surya Rashi hoti hai jo yahan bilkul kaam nahi aati — apni asli Chandra Rashi Rashi Calculator se nikaal lijiye.' },
  { q: 'क्या आप लाल किताब के अनुसार रत्न बताते हैं?', a: 'Nahi. Trikaal Vaani Parashar BPHS parampara mein kaam karta hai, Lal Kitab mein nahi. Dilchasp baat yeh hai ki Lal Kitab ka rukh ratna ko lekar bahut satark hai — wahan ratna antim vikalp mana gaya hai, pehla nahi, aur zor totkon par hai. Tark yeh ki ratna graha ki urja badhata hai, aur gadbad sthiti wale graha ko badhana khatarnak hai. Yeh chetavni Parashar ki functional-malefic chetavni se mel khati hai.' },
  { q: 'What are the 12 birth stones?', a: 'The twelve birthstones (garnet for January, amethyst for February and so on) belong to the Western birthstone tradition, standardised by the American jewellery trade in 1912. They have no connection to Vedic gemstone astrology. Western birthstones are assigned by calendar month and carry no risk framework; Vedic stones are assigned by planet, from your ascendant lord or Moon sign, and explicitly warn that the wrong stone can harm you. Wearing a birthstone as jewellery is fine; treating it as a Vedic remedy is a category error.' },
  { q: 'Do you give KP astrology gemstone recommendations?', a: 'No. KP (Krishnamurti Paddhati) is a different system — it uses the KP ayanamsha rather than Lahiri, divides nakshatras into sub-lords, and builds the recommendation from the ascendant sub-lord rather than the ascendant lord. The two methods can arrive at different stones from the same birth data. This site computes on Swiss Ephemeris with Lahiri Ayanamsha under classical Parashara rules, and we will not present a Parashara result as a KP one.' },
  { q: 'पुण्य रत्न क्या होता है?', a: 'Punya Ratna woh ratna hai jo navam bhaav ke swami graha ka hota hai — navam bhaav ko shastra mein bhagya, dharma aur punya sthan kaha jaata hai. Naam har parampara mein ek jaisa nahi hai; kahin "Bhagya Ratna" kehte hain. Jo sarvamanya hai woh teen ratnon ki vyavastha hai: Jeevan (lagna swami), Bhagya/Punya (navam swami), Karya (dasham swami). Chetavni wahi: navam swami agar functional malefic hai to uska ratna madad nahi karega.' },
  { q: 'Which stone is very lucky?', a: 'There is no universally lucky gemstone — a stone is lucky for you only if the planet it strengthens is a benefic for your ascendant. That said, two are most often recommended for structural reasons: Pukhraj (Jupiter, the natural benefic, widest safety margin) and Moti (Moon, the gentlest of the nine). The three least universally safe are Neelam, Gomed and Lehsunia. "Generally safe" is not the same as right for you.' },
  { q: 'Kya Neelam (Blue Sapphire) pehnana safe hai?', a: 'Neelam (Shani), Gomed (Rahu) aur Lehsunia (Ketu) bahut "strong" ratna hain — yeh bina jaankaar astrologer ki salaah ke nahi pehne jaate, aur 3 din ka trial zaroori hai. Neelam khaas taur par dono dishaon mein tezi se asar karta hai, aur yahi wajah hai ki shastriya vyavhaar trial maangta hai. Shani ki rashi hone bhar se Neelam safe nahi ho jaata.' },
  { q: 'Gemstone kaise pehnein — metal, ungli, din?', a: 'Har ratna ka apna metal (jaise Pukhraj-sona), ungli (Pukhraj-tarjani/index), aur din (Pukhraj-guruvar) hota hai. Shukla paksha mein, us graha ke din, subah snan ke baad, ratna ko kachche doodh/Gangajal se shuddh karke, mantra jaap ke saath dharan karte hain. Calculator aapko aapke ratna ke ye details deta hai.' },
  { q: 'Kitne carat / ratti ka ratna pehnein?', a: 'Aam taur par body-weight aur ratna ke hisaab se ~1 ratti per 10-12 kg (matbhed hai) sujhaya jaata hai, par sahi weight individual chart par nirbhar karta hai. Upratna ka weight aam taur par mukhya ratna se do se teen guna lagta hai kyunki woh halka hota hai. Original, certified (lab-tested), bina daag wala stone hi lein, aur weight expert se confirm karein.' },
  { q: 'Is calculator aur "Gemstone Suitability Calculator" mein kya farak hai?', a: 'Yeh calculator aapka mukhya Life Stone (Lagna-swami ka ratna) batata hai — ek quick overview. Suitability Calculator usse aage jaakar har ratna ko 0-100 score deta hai: functional benefic/malefic, Shadbala, dushthana (8th lord), combustion aur risk check karke batata hai ki konsa ratna safe hai ya avoid karein. Ratna pehnne se pehle suitability calculator zaroor use karein.' },
  { q: 'Kya ye Gemstone Calculator free hai?', a: 'Haan, 100% free. Aapka Lagna, Lagna swami, Life Stone, current mahadasha ka ratna, metal/ungli/din/mantra aur caution — sab bilkul free. Na signup, na card.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) se Lahiri Ayanamsha ke saath aapka lagna aur graha positions exact nikaalta hai — 99.9% astronomical accuracy. Yeh page Lagna-swami aadharit overview deta hai; deep suitability ke liye Gemstone Suitability Calculator use karein. Ek zaroori baat: Lagna janm samay se banta hai, isliye pandrah minute ki galti poora uttar badal sakti hai.' },
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
  const lifeStoneArticle = lifeGem ? UPRATNA.find((u) => u.main === lifeGem.hi) : undefined;

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
        inLanguage: 'en-IN', dateModified: '2026-08-31', isPartOf: { '@id': WEBSITE_ID }, author: { '@id': AUTHOR_ID }, publisher: { '@id': ORG_ID },
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
              Aapka mukhya <strong style={{ color: GOLD }}>&ldquo;Life Stone&rdquo;</strong> aapke <strong style={{ color: GOLD }}>Lagna (ascendant) ke swami graha</strong> ka ratna hota hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Gemstone Calculator</strong> Swiss Ephemeris se aapka lagna aur lagna-swami nikaalkar aapka lucky ratna batata hai — saath mein metal, ungli, din, mantra aur zaroori savdhaani. Bilkul free, aur hum ratna bechte nahi — isi liye yeh page aapko yeh bhi keh sakta hai ki koi ratna mat pehniye.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>
                <Link href="/founder" className="hover:underline">Rohiit Gupta</Link>
              </div>
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
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Life Stone Lagna par nirbhar hai — Lagna sahi tabhi aata hai jab exact birth time ho. Time na ho to neeche di gayi Rashi-Ratna table dekhiye.</p>
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
                  {lifeStoneArticle && (
                    <Link href={`/blog/${lifeStoneArticle.slug}`} className="inline-block mt-4 text-sm font-semibold underline underline-offset-2" style={{ color: GOLD }}>
                      {lifeGem.hi} किसे पहनना चाहिए — पूरा लेख →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Lagna swami resolve nahi ho paya — exact birth time ke saath try karein.</p>
                </div>
              )}

              {/* BRIDGE → Gemstone Suitability Calculator */}
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
                        Abhi aapki <strong style={{ color: GOLD }}>{mahadashaRaw} Mahadasha</strong> chal rahi hai. Iska sambandhit ratna <strong style={{ color: GOLD }}>{periodGem.stone} ({periodGem.hi})</strong> hai — yeh chalti dasha ke liye sujhaya jaata hai. Dasha kab badlegi, yeh{' '}
                        <Link href="/calculators/free-dasha-calculator" className="underline underline-offset-2" style={{ color: GOLD }}>Dasha Calculator</Link>{' '}se dekh lijiye.
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
                  ⚠️ <strong>Mahatvapurna:</strong> Aapke sujhav mein ek &ldquo;strong&rdquo; ratna (Neelam/Gomed/Lehsunia) hai. Aise ratna kabhi bhi bina jaankaar astrologer ki salaah aur 3-din trial ke nahi pehne jaate. Pehle{' '}
                  <Link href="/calculators/free-gemstone-suitability-calculator" className="underline underline-offset-2" style={{ color: GOLD }}>Gemstone Suitability Calculator</Link>{' '}se check karein, aur{' '}
                  <Link href="/blog/why-wrong-gemstone-can-harm-you-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>गलत रत्न का नुकसान</Link>{' '}zaroor padhein.
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

          {/* ── v2.0: TABLE OF CONTENTS ─────────────────────────── */}
          <nav aria-label="Is page par kya hai" className="mt-16 rounded-2xl p-5 md:p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <h2 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>Is Page Par Kya Hai</h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
              {PILLAR.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:underline underline-offset-2" style={{ color: '#cbd5e1' }}>{s.h2}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── v2.0: PILLAR CONTENT — 11 keyword-driven H2 sections ── */}
          <section className="mt-12">
            {PILLAR.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">{renderRich(p, `s${si}-p${pi}`)}</p>
                ))}

                {/* upratna table */}
                {s.id === 'upratna' && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                      <caption className="sr-only">नवग्रह के मुख्य रत्न और उनके मान्य उपरत्न</caption>
                      <thead>
                        <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>ग्रह</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>मुख्य रत्न</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>मान्य उपरत्न</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {UPRATNA.map((u) => (
                          <tr key={u.planet} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <td className="p-3">{u.planet}</td>
                            <td className="p-3 font-semibold">
                              <Link href={`/blog/${u.slug}`} className="underline underline-offset-2" style={{ color: GOLD }}>{u.main}</Link>
                            </td>
                            <td className="p-3">{u.sub}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 12-rashi table */}
                {s.id === 'rashi-anusar-chart' && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                      <caption className="sr-only">बारह राशियों के अनुसार रत्न — राशि स्वामी और उसका रत्न</caption>
                      <thead>
                        <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>राशि</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>स्वामी</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>रत्न</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {RASHI_RATNA.map((r) => (
                          <tr key={r.rashi} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <td className="p-3 font-semibold">
                              <Link href={`/blog/${r.slug}`} className="underline underline-offset-2" style={{ color: GOLD }}>
                                {r.rashi} ({r.en})
                              </Link>
                            </td>
                            <td className="p-3">{r.lord}</td>
                            <td className="p-3">{r.stone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[11px] text-slate-500 mt-2">⚠️ = तीव्र रत्न — विशेषज्ञ परामर्श और 3 दिन के ट्रायल के बिना न पहनें।</p>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* NAVAGRAHA TABLE (kept from v1.1) */}
          <section className="mt-4">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Navagraha — Ratna Table</h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Graha</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Ratna</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Metal</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Finger / Day</th>
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
              <li>Neelam, Gomed ya Lehsunia ho to pehle 3 din ka trial — ring ko takiye ke neeche rakh kar sona bhi ek paramparik tareeka hai.</li>
            </ol>
            <p className="text-slate-300 leading-relaxed mb-4">
              Poore niyam, aur woh galtiyan jo log sabse zyada karte hain, in do guides mein hain —{' '}
              <Link href="/blog/gemstone-wearing-rules-practical-guide-hindi" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>रत्न धारण नियम</Link>{' '}
              aur{' '}
              <Link href="/blog/gemstone-faq-vedic-astrology-hindi" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>रत्न FAQ</Link>.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Ratna ekmatra aisa upay hai jo <strong style={{ color: GOLD }}>sakriya roop se nuksan kar sakta hai</strong> — mantra ya daan galat ho to bas bekaar jaata hai, par galat ratna graha ko balshali karke sthiti bigaad sakta hai. Isliye sabse bada farak yeh hai ki calculator <strong style={{ color: GOLD }}>&ldquo;kaun sa ratna&rdquo;</strong> ke saath <strong style={{ color: GOLD }}>&ldquo;kya yeh safe hai&rdquo;</strong> bhi batata hai ya nahi.
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Feature</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Trikaal Vaani</th>
                    <th scope="col" className="p-3 text-left text-slate-400">Others</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Basis</td><td className="p-3">Lagna swami + 0–100 Suitability engine</td><td className="p-3 text-slate-500">Sun-sign / generic</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">&ldquo;Should I wear it?&rdquo; check</td><td className="p-3" style={{ color: GOLD }}>✓ Functional nature, Shadbala, dushthana, combustion</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Safety Caution</td><td className="p-3" style={{ color: GOLD }}>✓ Strong-stone warnings</td><td className="p-3 text-slate-500">✗ Often missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Upratna alternatives</td><td className="p-3" style={{ color: GOLD }}>✓ Diye jaate hain</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Sells stones?</td><td className="p-3" style={{ color: GOLD }}>✗ Nahi — koi conflict of interest nahi</td><td className="p-3 text-slate-500">✓ Aksar haan</td></tr>
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

          {/* DEEPER READING */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Ratna Par Poora Guide Padhein</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Sabse pehle{' '}
              <Link href="/blog/why-wrong-gemstone-can-harm-you-hindi" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>गलत रत्न नुकसान क्यों पहुंचाता है</Link>{' '}
              padhiye — ratna ekmatra upay hai jise galat pehnna khaali jeb se zyada mehnga pad sakta hai.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { slug: 'which-gemstone-should-i-wear-hindi', label: 'कौन सा रत्न पहनना चाहिए?' },
                { slug: 'why-wrong-gemstone-can-harm-you-hindi', label: 'गलत रत्न आपको नुकसान क्यों पहुंचा सकता है' },
                { slug: 'gemstone-wearing-rules-practical-guide-hindi', label: 'रत्न धारण नियम: करें और न करें' },
                { slug: 'upratna-substitute-gemstone-guide-hindi', label: 'उपरत्न गाइड: हर ग्रह के विकल्प रत्न' },
                { slug: 'gemstone-faq-vedic-astrology-hindi', label: 'रत्न से जुड़े सारे सवाल — पूरी FAQ' },
                { slug: 'pukhraj-yellow-sapphire-benefits-side-effects-hindi', label: 'पुखराज किसे पहनना चाहिए?' },
                { slug: 'neelam-blue-sapphire-benefits-side-effects-hindi', label: 'नीलम किसे पहनना चाहिए? ⚠️' },
                { slug: 'moti-pearl-benefits-side-effects-hindi', label: 'मोती किसे पहनना चाहिए?' },
                { slug: 'moonga-red-coral-benefits-side-effects-hindi', label: 'मूंगा किसे पहनना चाहिए?' },
                { slug: 'panna-emerald-benefits-side-effects-hindi', label: 'पन्ना किसे पहनना चाहिए?' },
                { slug: 'manik-ruby-benefits-side-effects-hindi', label: 'माणिक किसे पहनना चाहिए?' },
                { slug: 'heera-diamond-benefits-side-effects-hindi', label: 'हीरा किसे पहनना चाहिए?' },
                { slug: 'gomed-hessonite-benefits-side-effects-hindi', label: 'गोमेद किसे पहनना चाहिए? ⚠️' },
                { slug: 'lehsunia-cats-eye-benefits-side-effects-hindi', label: 'लहसुनिया किसे पहनना चाहिए? ⚠️' },
                { slug: 'which-gemstone-should-i-wear', label: 'Which gemstone should I wear? (English)' },
                { slug: 'upratna-substitute-gemstone-guide', label: 'Upratna guide — substitutes for every planet' },
              ].map((b) => (
                <Link key={b.slug} href={`/blog/${b.slug}`}
                  className="p-3 rounded-xl text-sm transition-all hover:opacity-90"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: '#cbd5e1' }}>
                  {b.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Ratna kharidne se pehle sabse zaroori kadam:{' '}
              <Link href="/calculators/free-gemstone-suitability-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Suitability Calculator</Link>{' '}
              — woh batata hai ki yeh ratna aapke liye safe hai ya nahi, 0–100 score ke saath. Har stone ke liye alag &ldquo;Should I wear&rdquo; check bhi hai.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-gemstone-suitability-calculator', name: 'Gemstone Suitability' },
                { slug: 'free-should-i-wear-pukhraj', name: 'Should I Wear Pukhraj?' },
                { slug: 'free-should-i-wear-neelam', name: 'Should I Wear Neelam?' },
                { slug: 'free-should-i-wear-moti', name: 'Should I Wear Moti?' },
                { slug: 'free-should-i-wear-moonga', name: 'Should I Wear Moonga?' },
                { slug: 'free-should-i-wear-panna', name: 'Should I Wear Panna?' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
                { slug: 'free-rashi-calculator', name: 'Rashi Calculator' },
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
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

          {/* AUTHOR / EEAT FOOTER */}
          <footer className="mt-16 pt-8 text-sm text-slate-400" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="mb-2">
              <em>
                Reviewed by{' '}
                <Link href="/founder" className="underline underline-offset-2" style={{ color: GOLD }}>Rohiit Gupta</Link>,
                Chief Vedic Architect, Trikaal Vaani · Dwarka, New Delhi · UDYAM-DL-10-0119070
              </em>
            </p>
            <p className="mb-2">
              <strong style={{ color: GOLD }}>Classical sources:</strong> Brihat Parashara Hora Shastra (BPHS) — Lagna lord, functional benefic/malefic and Shadbala principles; classical Ratna Vigyan for planet-stone correspondence, upratna substitution and dharan vidhi; Swiss Ephemeris with Lahiri Ayanamsha for all computation.
            </p>
            <p className="mb-2">
              <strong style={{ color: GOLD }}>Disclosure:</strong> Trikaal Vaani <strong>ratna nahi bechta</strong>. Yahan koi affiliate link nahi hai aur kisi jeweller se koi commission nahi liya jaata. Isi liye yeh page aapko yeh bhi keh sakta hai ki koi ratna mat pehniye.
            </p>
            <p>
              Apni kundali ka personalised vishleshan chahiye to{' '}
              <Link href="/karmic-background-reading" className="underline underline-offset-2" style={{ color: GOLD }}>Karmic Background Reading</Link>{' '}
              dekhiye, ya saare options{' '}
              <Link href="/pricing" className="underline underline-offset-2" style={{ color: GOLD }}>pricing page</Link>{' '}
              par hain.
            </p>
          </footer>

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
