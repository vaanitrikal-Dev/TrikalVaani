'use client';

// ============================================================
// File: app/calculators/free-kaal-sarp-dosh-calculator/page.tsx
// Version: v2.0 — Free Kaal Sarp Dosh Calculator (Radar E3 content build)
// API: /api/calc/doshas (VM /doshas — exact longitude arc logic)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-08-31) — CONTENT + INTERNAL LINKING REBUILD.
//        Driven by the Radar E3 PAA/PASF keyword brief (31 Aug 2026).
//        • Word count ~900 → 3,600+. Competitor tool-page average is
//          1,573, so this page is now deliberately above the field.
//        • 19 new H2 sections, each answering one keyword Google itself
//          suggested, ordered by seen_count (5 → 2). Hindi keywords get
//          Hindi answers, not translations.
//        • Inline internal links: 40+ contextual links into the existing
//          Kaal Sarp blog cluster and sibling calculators. Every single
//          href in this file was verified against the live sitemap and
//          Supabase blog_posts on 31 Aug 2026 — none are guessed.
//          This directly attacks the internal_links = 21 gap Radar found
//          (that number counts links ON this page, not links TO it).
//        • Added renderRich() — a tiny markdown-lite renderer so section
//          copy lives in plain strings with [label](/url) links, keeping
//          the file readable and the links easy to maintain.
//        • Added a sticky-free table of contents so a 3,600-word page
//          stays usable, and so Google can build sitelinks/jump-links.
//        • FAQS expanded 8 → 14 (all feed the existing FAQPage schema).
//        • FORM, VALIDATION, API CALL, RESULT RENDERING AND
//          buildCalcJsonLd() USAGE ARE UNCHANGED from v1.1. The
//          calculator itself was never the problem; visibility was.
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

// 12 Kaal Sarp types by Rahu's house.
// `slug` links each type to its dedicated cluster article (verified
// against Supabase blog_posts on 31 Aug 2026).
const KAAL_SARP_TYPES: Record<
  number,
  { name: string; hi: string; theme: string; slug: string; slugHi: string }
> = {
  1:  { name: 'Anant',       hi: 'अनंत',     theme: 'Self, personality, struggles in early life',            slug: 'anant-kaal-sarp-yog',        slugHi: 'anant-kaal-sarp-yog-hindi' },
  2:  { name: 'Kulik',       hi: 'कुलिक',    theme: 'Wealth, family, speech',                                slug: 'kulik-kaal-sarp-yog',        slugHi: 'kulik-kaal-sarp-yog-hindi' },
  3:  { name: 'Vasuki',      hi: 'वासुकि',   theme: 'Courage, siblings, efforts',                            slug: 'vasuki-kaal-sarp-yog',       slugHi: 'vasuki-kaal-sarp-yog-hindi' },
  4:  { name: 'Shankhpal',   hi: 'शंखपाल',   theme: 'Home, mother, property, peace',                         slug: 'shankhpal-kaal-sarp-yog',    slugHi: 'shankhpal-kaal-sarp-yog-hindi' },
  5:  { name: 'Padma',       hi: 'पद्म',     theme: 'Children, education, intellect',                        slug: 'padma-kaal-sarp-yog',        slugHi: 'padma-kaal-sarp-yog-hindi' },
  6:  { name: 'Mahapadma',   hi: 'महापद्म',  theme: 'Enemies, health, debts (often improves with effort)',   slug: 'mahapadma-kaal-sarp-yog',    slugHi: 'mahapadma-kaal-sarp-yog-hindi' },
  7:  { name: 'Takshak',     hi: 'तक्षक',    theme: 'Marriage, partnerships, business',                      slug: 'takshak-kaal-sarp-yog',      slugHi: 'takshak-kaal-sarp-yog-hindi' },
  8:  { name: 'Karkotak',    hi: 'कर्कोटक',  theme: 'Sudden events, longevity, transformation',              slug: 'karkotak-kaal-sarp-yog',     slugHi: 'karkotak-kaal-sarp-yog-hindi' },
  9:  { name: 'Shankhachur', hi: 'शंखचूड़',  theme: 'Fortune, father, dharma',                               slug: 'shankhachood-kaal-sarp-yog', slugHi: 'shankhachood-kaal-sarp-yog-hindi' },
  10: { name: 'Ghatak',      hi: 'घातक',     theme: 'Career, status, authority',                             slug: 'ghatak-kaal-sarp-yog',       slugHi: 'ghatak-kaal-sarp-yog-hindi' },
  11: { name: 'Vishdhar',    hi: 'विषधर',    theme: 'Gains, income, network',                                slug: 'vishdhar-kaal-sarp-yog',     slugHi: 'vishdhar-kaal-sarp-yog-hindi' },
  12: { name: 'Sheshnag',    hi: 'शेषनाग',   theme: 'Expenses, foreign, moksha, sleep',                      slug: 'sheshnag-kaal-sarp-yog',     slugHi: 'sheshnag-kaal-sarp-yog-hindi' },
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

// match a dosha by keyword(s) in its name (works for hi/en)
function findDosha(doshas: any[], keywords: string[]): any | null {
  for (const d of doshas) {
    const nm = String(d?.name || '').toLowerCase();
    if (keywords.some((k) => nm.includes(k.toLowerCase()))) return d;
  }
  return null;
}

const OTHER_DOSHA_LINKS: { keywords: string[]; label: string; slug?: string }[] = [
  { keywords: ['पितृ', 'pitra'], label: 'Pitra Dosh', slug: 'free-pitra-dosh-calculator' },
  { keywords: ['मंगल', 'manglik', 'mangal'], label: 'Manglik Dosh', slug: 'free-manglik-dosh-calculator' },
  { keywords: ['चांडाल', 'chandal'], label: 'Guru Chandal Dosh' },
  { keywords: ['ग्रहण', 'grahan'], label: 'Grahan Dosh' },
];

// ============================================================
// v2.0 — MARKDOWN-LITE RENDERER
// Lets long-form copy live as plain strings with **bold** and
// [label](/internal-url) links. Keeps the 19 content sections
// readable and makes internal links trivial to audit and update.
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
      return (
        <strong key={`${keyBase}-b-${i}`} style={{ color: GOLD }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyBase}-s-${i}`}>{part}</span>;
  });
}

// ============================================================
// v2.0 — PILLAR CONTENT
// Every h2 below is a keyword Google itself surfaced in PAA/PASF
// for this page's SERPs (Radar E3, 31 Aug 2026). Ordered by how
// often Google suggested it. Hindi questions get Hindi answers.
// ============================================================
type PillarSection = { id: string; h2: string; paras: string[] };

const PILLAR: PillarSection[] = [
  {
    id: 'sabse-khatarnak',
    h2: 'सबसे खतरनाक कौन सा कालसर्प दोष होता है?',
    paras: [
      'सीधा जवाब: **कोई भी कालसर्प दोष "सबसे खतरनाक" नहीं होता** — यह सवाल ही डर बेचने वालों का बनाया हुआ है। शास्त्र में बारह प्रकारों की कोई खतरे की सूची नहीं दी गई है। हर प्रकार अलग जीवन-क्षेत्र को छूता है, और जो आपके लिए भारी है वह किसी और के लिए मामूली हो सकता है।',
      'फिर भी व्यवहार में जो प्रकार सबसे ज्यादा तकलीफ की शिकायत लाते हैं वे हैं [कर्कोटक (अष्टम भाव में राहु)](/blog/karkotak-kaal-sarp-yog-hindi), क्योंकि अष्टम भाव अचानक उतार-चढ़ाव का है; [तक्षक (सप्तम भाव)](/blog/takshak-kaal-sarp-yog-hindi), क्योंकि यह विवाह और साझेदारी पर पड़ता है; और [घातक (दशम भाव)](/blog/ghatak-kaal-sarp-yog-hindi), जो करियर की गति धीमी करता है। नाम "घातक" सुनकर डरने की जरूरत नहीं — यह सिर्फ एक शास्त्रीय नाम है, कोई मृत्यु-सूचक नहीं।',
      'असली गंभीरता प्रकार से नहीं, तीन चीजों से तय होती है: राहु की **डिग्री-स्थिति**, कुंडली में **भंग (cancellation)** है या नहीं, और इस समय **कौन सी दशा चल रही है**। भंग के पूरे नियम [काल सर्प दोष भंग गाइड](/blog/kaal-sarp-dosh-cancellation-hindi) में हैं, और अपनी चल रही दशा [मुफ्त दशा कैलकुलेटर](/calculators/free-dasha-calculator) से देख लीजिए। जिस व्यक्ति का दोष भंग है, उसके लिए "सबसे खतरनाक" प्रकार भी लगभग निष्क्रिय रहता है।',
    ],
  },
  {
    id: 'mahilaon-mein',
    h2: 'महिलाओं में कालसर्प दोष — Kalasarpa Dosha in Females',
    paras: [
      'गणित के स्तर पर **महिलाओं और पुरुषों के कालसर्प दोष में कोई अंतर नहीं है।** नियम एक ही है — सातों मुख्य ग्रह राहु-केतु अक्ष के एक ही तरफ। न कोई अलग गणना, न कोई अलग प्रकार, न कोई अलग गंभीरता। जो भी वेबसाइट "स्त्री कालसर्प" को अलग दोष बताती है, वह शास्त्र नहीं, बाजार बोल रहा है।',
      'फिर भी यह सवाल इतना खोजा क्यों जाता है? क्योंकि भारत में विवाह-मिलान के समय लड़की की कुंडली ज्यादा कड़ाई से देखी जाती है, और वहीं यह शब्द पहली बार सुनने को मिलता है — अक्सर डर के साथ। सच यह है कि कालसर्प दोष अपने आप विवाह रोकता नहीं, और यह [मंगल दोष](/calculators/free-manglik-dosh-calculator) जैसा मिलान-अवरोध भी नहीं है। पूरी बात [काल सर्प दोष और विवाह](/blog/kaal-sarp-dosh-marriage-hindi) में विस्तार से है।',
      'व्यावहारिक सलाह: अगर रिश्ते की बात चल रही है तो सिर्फ कालसर्प पर मत अटकिए। [कुंडली मिलान](/kundali-milan) से पूरा 36-गुण अष्टकूट, नाड़ी और मंगल — तीनों एक साथ देखिए, और [मंगल बनाम काल सर्प बनाम पितृ दोष](/blog/mangal-dosh-vs-kaal-sarp-vs-pitra-dosh-hindi) पढ़िए ताकि पता चले कि असल में कौन सा दोष विवाह पर भार डालता है और कौन सा नहीं।',
    ],
  },
  {
    id: 'lakshan-aur-upay',
    h2: 'कालसर्प दोष के लक्षण और उपाय',
    paras: [
      'लक्षण पहले, और ईमानदारी से: कालसर्प दोष का कोई **निश्चित शारीरिक लक्षण नहीं** होता। जो पैटर्न बार-बार सामने आते हैं वे हैं — बार-बार सपने में साँप दिखना, काम लगभग पूरा होकर आखिरी क्षण में अटक जाना, मेहनत के अनुपात में फल देर से मिलना, और एक लगातार बनी रहने वाली बेचैनी जिसका कोई साफ कारण न हो।',
      'लेकिन यहीं सबसे बड़ी गलती होती है। ये तीनों-चारों लक्षण उतनी ही आसानी से [शनि की साढ़े साती](/calculators/free-sade-sati-calculator), [राहु महादशा](/blog/rahu-mahadasha-effects-guide), या साधारण थकान और नींद की कमी से भी आ सकते हैं। लक्षण देखकर खुद पर कालसर्प का लेबल लगा लेना गलत निदान है — इसीलिए ऊपर का कैलकुलेटर चलाना जरूरी है, अंदाजा नहीं। पूरा विश्लेषण [काल सर्प दोष के लक्षण](/blog/kaal-sarp-dosh-signs-symptoms-hindi) में है।',
      'उपाय तीन स्तर पर काम करते हैं: **मंत्र** (महामृत्युंजय और "ॐ राहवे नमः"), **पूजा** (नाग पंचमी पर नाग-नागिन जोड़े का बहते जल में विसर्जन), और **दान** (शनिवार को नारियल, नीला-काला वस्त्र, उड़द)। कौन सा उपाय किस स्थिति में असल में असर करता है, यह [काल सर्प दोष के उपाय](/blog/kaal-sarp-dosh-remedies-hindi) में बिना अतिशयोक्ति के लिखा है।',
    ],
  },
  {
    id: 'prakar',
    h2: 'काल सर्प दोष के प्रकार — 12 प्रकार और उनका असर',
    paras: [
      'कालसर्प दोष के **बारह प्रकार होते हैं, और प्रकार तय करता है राहु किस भाव में बैठा है** — केतु की स्थिति से नहीं, राशि से नहीं, सिर्फ राहु के भाव से। यही वजह है कि सही जन्म समय जरूरी है: भाव जन्म समय से बनते हैं, और पंद्रह मिनट का फर्क लग्न बदलकर पूरा प्रकार बदल सकता है।',
      'नीचे दी गई तालिका में बारहों प्रकार, उनके संस्कृत नाम और प्रभाव-क्षेत्र हैं, और हर नाम अपने विस्तृत लेख से जुड़ा है। एक साथ पूरी सूची पढ़नी हो तो [काल सर्प दोष के 12 प्रकार](/blog/types-of-kaal-sarp-dosh-hindi) देखिए।',
      'ध्यान रखने की बात: प्रकार का नाम उसकी गंभीरता नहीं बताता। "महापद्म" सुनने में भारी लगता है पर षष्ठ भाव में राहु अक्सर शत्रु और प्रतिस्पर्धा पर विजय देता है, और "अनंत" सुनने में शुभ लगता है पर लग्न में राहु आत्म-छवि पर लंबा संघर्ष ला सकता है। नाम से नहीं, भाव से पढ़िए।',
    ],
  },
  {
    id: 'anant-se-sheshnag',
    h2: 'Anant Kaal Sarp Dosh से Sheshnag तक — हर प्रकार अलग से',
    paras: [
      '[अनंत काल सर्प (लग्न में राहु)](/blog/anant-kaal-sarp-yog-hindi) — आत्म-पहचान, आत्मविश्वास और शुरुआती जीवन का संघर्ष। [कुलिक (द्वितीय भाव)](/blog/kulik-kaal-sarp-yog-hindi) — धन-संचय, कुटुंब और वाणी। [वासुकि (तृतीय भाव)](/blog/vasuki-kaal-sarp-yog-hindi) — साहस, भाई-बहन और प्रयासों में रुकावट। [शंखपाल (चतुर्थ भाव)](/blog/shankhpal-kaal-sarp-yog-hindi) — घर, माता, संपत्ति और मानसिक शांति।',
      '[पद्म (पंचम भाव)](/blog/padma-kaal-sarp-yog-hindi) — संतान, शिक्षा और बुद्धि। [महापद्म (षष्ठ भाव)](/blog/mahapadma-kaal-sarp-yog-hindi) — शत्रु, रोग और ऋण, जो प्रयास से अक्सर सुधरता है। [तक्षक (सप्तम भाव)](/blog/takshak-kaal-sarp-yog-hindi) — विवाह और साझेदारी। [कर्कोटक (अष्टम भाव)](/blog/karkotak-kaal-sarp-yog-hindi) — आकस्मिक घटनाएँ और गहरा रूपांतरण।',
      '[शंखचूड़ (नवम भाव)](/blog/shankhachood-kaal-sarp-yog-hindi) — भाग्य, पिता और धर्म। [घातक (दशम भाव)](/blog/ghatak-kaal-sarp-yog-hindi) — करियर, पद और अधिकार। [विषधर (एकादश भाव)](/blog/vishdhar-kaal-sarp-yog-hindi) — आय, लाभ और सामाजिक नेटवर्क। [शेषनाग (द्वादश भाव)](/blog/sheshnag-kaal-sarp-yog-hindi) — व्यय, विदेश, नींद और मोक्ष। ऊपर कैलकुलेटर चलाने पर आपका प्रकार अपने आप निकल आएगा, अनुमान लगाने की जरूरत नहीं।',
    ],
  },
  {
    id: 'partial',
    h2: 'Partial / आंशिक कालसर्प दोष क्या होता है?',
    paras: [
      'आंशिक या "partial" कालसर्प वह स्थिति कही जाती है जब **छह ग्रह तो राहु-केतु अक्ष के एक तरफ हों पर एक ग्रह अक्ष के बाहर निकल जाए** — या कोई ग्रह ठीक राहु/केतु की डिग्री के आसपास हो और यह तय करना कठिन हो जाए कि वह किस तरफ गिना जाए।',
      'यहाँ Trikaal Vaani का रुख साफ है और यह जानबूझकर सख्त है: हम **classical full-arc नियम** मानते हैं — सातों ग्रह एक तरफ, तभी कालसर्प। एक भी ग्रह बाहर है तो हमारा उत्तर "नहीं" आएगा। कई साइटें ऐसी स्थिति को "आंशिक कालसर्प" बताकर डर पैदा करती हैं और फिर महँगी पूजा बेचती हैं, जबकि शास्त्र में आंशिक कालसर्प की कोई मान्य श्रेणी है ही नहीं।',
      'अगर आपका परिणाम "नहीं" आया पर आपको लगता है कि आपके ग्रह लगभग एक तरफ हैं, तो असल सवाल कालसर्प नहीं बल्कि राहु-केतु की सामान्य स्थिति है। उसके लिए [राहु क्या है](/blog/what-is-rahu) और [केतु क्या है](/blog/what-is-ketu) पढ़िए, और [ग्रह बल कैलकुलेटर](/calculators/free-graha-bal-calculator) से देखिए कि आपके ग्रह वास्तव में कितने मजबूत हैं।',
    ],
  },
  {
    id: 'rambaan-upay',
    h2: 'कालसर्प दोष दूर करने का 1 रामबाण उपाय',
    paras: [
      'अगर सिर्फ **एक** उपाय चुनना हो तो वह है **महामृत्युंजय मंत्र का नियमित जाप, सोमवार को शिव अभिषेक के साथ।** कारण शास्त्रीय है, विज्ञापन नहीं — राहु छाया ग्रह है और उसका शमन किसी रत्न या ग्रह-देवता से नहीं, बल्कि शिव-उपासना से माना जाता है, क्योंकि शिव ही कालातीत हैं और कालसर्प का पूरा नाम ही "काल" से जुड़ा है।',
      'व्यावहारिक विधि: सोमवार से शुरू कीजिए, प्रतिदिन 108 बार महामृत्युंजय, और साथ में "ॐ राहवे नमः" 108 बार। शिवलिंग पर जल या कच्चा दूध चढ़ाइए। इसे कम से कम **चालीस दिन** लगातार कीजिए — बीच में छोड़कर दोबारा शुरू करना असर तोड़ देता है। यही अनुशासन असली उपाय है, मंत्र की संख्या नहीं।',
      'एक ईमानदार चेतावनी: **किसी भी एक उपाय से कालसर्प "मिट" नहीं जाता।** जो कोई एक पूजा से स्थायी मुक्ति का वादा करे, वह बेच रहा है। उपाय दबाव घटाते हैं, कुंडली नहीं बदलते। बाकी सिद्ध उपाय और उनकी सही विधि [काल सर्प दोष के उपाय](/blog/kaal-sarp-dosh-remedies-hindi) में हैं, और [नाग पंचमी 2026 का विशेष संयोग](/blog/nag-panchami-2026-kaal-sarp-dosh-remedy-hindi) अलग से समझाया गया है।',
    ],
  },
  {
    id: 'shankhpal',
    h2: 'शंखपाल कालसर्प दोष — चतुर्थ भाव में राहु',
    paras: [
      'शंखपाल कालसर्प तब बनता है जब **राहु चतुर्थ भाव में** हो और शेष ग्रह राहु-केतु अक्ष के उसी तरफ। चतुर्थ भाव माता, घर, संपत्ति, वाहन और मन की शांति का है — इसलिए इस प्रकार की शिकायतें अक्सर घर से जुड़ी होती हैं: बार-बार निवास बदलना, अपने मकान में देरी, माता के स्वास्थ्य की चिंता, या घर में रहते हुए भी मन का न लगना।',
      'यह प्रकार इतना खोजा जाता है क्योंकि भारत में मकान खरीदना सबसे बड़ा पारिवारिक निर्णय होता है और लोग खरीद से पहले कुंडली देखना चाहते हैं। अगर यही आपकी स्थिति है तो कालसर्प अकेला मापदंड मत बनाइए — [प्रॉपर्टी योग](/services/property-yog) चतुर्थ भाव, उसके स्वामी और चल रही दशा तीनों को एक साथ पढ़ता है, जो अकेले दोष-जाँच से कहीं ज्यादा उपयोगी है।',
      'पूरा विश्लेषण — किन दशाओं में यह सक्रिय होता है, कब स्वतः शांत होता है, और कौन से उपाय चतुर्थ भाव पर विशेष रूप से लागू होते हैं — [शंखपाल काल सर्प योग](/blog/shankhpal-kaal-sarp-yog-hindi) में विस्तार से दिया गया है।',
    ],
  },
  {
    id: 'dates-2026',
    h2: 'Kaal Sarp Dosh Dates 2026 — क्या ऐसी कोई तारीख होती है?',
    paras: [
      'यह सवाल बहुत खोजा जाता है, और इसका ईमानदार जवाब चौंकाने वाला है: **कालसर्प दोष की कोई तारीख नहीं होती।** यह जन्म कुंडली का योग है, कोई गोचर या कैलेंडर घटना नहीं। जिस दिन आप जन्मे, उसी क्षण की ग्रह-स्थिति से यह बना या नहीं बना — 2026 में कोई "कालसर्प काल" शुरू या खत्म नहीं होता।',
      'लोग असल में जो खोज रहे होते हैं वह है **उपाय और पूजा की शुभ तिथि**। वह जरूर मायने रखती है: नाग पंचमी, सोमवार, शिवरात्रि, अमावस्या और पंचमी तिथि — ये उपाय के लिए पारंपरिक रूप से उपयुक्त मानी जाती हैं। चूँकि ये तिथियाँ हर साल बदलती हैं, यहाँ कोई स्थिर तारीख लिखना गलत होगा; [पंचांग](/panchang) प्रतिदिन अपडेट होता है और उसी दिन की सही तिथि, नक्षत्र और मुहूर्त दिखाता है।',
      'दूसरी चीज जो सचमुच समय से जुड़ी है वह है **दशा** — कालसर्प का असर तब उभरता है जब राहु या केतु की महादशा/अंतर्दशा चल रही हो। अपनी चल रही दशा और वह कब बदलेगी, यह [मुफ्त दशा कैलकुलेटर](/calculators/free-dasha-calculator) से देखिए। यही असली "तारीख" है जिसे आपको जानना चाहिए।',
    ],
  },
  {
    id: 'kitne-saal',
    h2: 'काल सर्प दोष कितने साल का होता है?',
    paras: [
      'तकनीकी रूप से **जन्म कुंडली का कालसर्प योग जीवन भर रहता है** — यह कोई अवधि नहीं जो समाप्त हो जाए, क्योंकि जन्म के समय की ग्रह-स्थिति कभी नहीं बदलती। इसलिए "कालसर्प 42 साल का होता है" या "36 की उम्र में उतर जाता है" जैसी बातें शास्त्र से नहीं आतीं।',
      'लेकिन जो लोग सचमुच अनुभव करते हैं, वह अलग है: **असर की तीव्रता दशा के साथ घटती-बढ़ती है।** राहु महादशा (18 वर्ष) या केतु महादशा (7 वर्ष) के दौरान दबाव सबसे ज्यादा महसूस होता है; गुरु या शुक्र की दशा में वही कुंडली अपेक्षाकृत हल्की लगती है। यही कारण है कि एक ही व्यक्ति को कुछ वर्ष "शापित" लगते हैं और कुछ वर्ष सामान्य।',
      'इसलिए सही सवाल "कितने साल" नहीं बल्कि "अभी कौन सी दशा चल रही है और अगली कब आएगी" है। [राहु महादशा गाइड](/blog/rahu-mahadasha-effects-guide) और [केतु महादशा के लक्षण](/blog/ketu-mahadasha-vairagya-symptoms) इसे समझाते हैं, और पूरा समय-चक्र [दशा कैलकुलेटर](/calculators/free-dasha-calculator) मुफ्त दिखा देता है।',
    ],
  },
  {
    id: 'fayde',
    h2: 'कालसर्प योग के फायदे — जो कोई नहीं बताता',
    paras: [
      'यह वह पक्ष है जिस पर लगभग कोई नहीं लिखता, क्योंकि डर बेचना आसान है और संतुलन बेचना कठिन। सच यह है कि **कालसर्प योग वाले बहुत से लोग असाधारण रूप से सफल होते हैं** — शास्त्रीय दृष्टि से भी यह योग असामान्य एकाग्रता, गहरी महत्वाकांक्षा और साधारण रास्तों से हटकर सोचने की क्षमता देता है।',
      'तीन ठोस फायदे जो व्यवहार में दिखते हैं: पहला, **देर से पर टिकाऊ सफलता** — शुरुआती संघर्ष लोगों को अनुशासन सिखा देता है, इसलिए जो मिलता है वह टिकता है। दूसरा, **असाधारण मानसिक दृढ़ता** — जिसने बार-बार आखिरी क्षण की असफलता देखी हो, वह हार से जल्दी नहीं टूटता। तीसरा, **विदेश और अपरंपरागत क्षेत्रों में लाभ**, खासकर [शेषनाग प्रकार](/blog/sheshnag-kaal-sarp-yog-hindi) में, क्योंकि राहु विदेश और नई तकनीक का कारक है — यही कड़ी [राहु-केतु और विदेश बसना](/blog/rahu-ketu-foreign-settlement-astrology-hindi) में खुलती है।',
      'यह सांत्वना नहीं है। यह वही बात है जो [काल सर्प दोष: 10 मिथक और सच](/blog/kaal-sarp-dosh-myths-facts-hindi) में प्रमाण सहित लिखी गई है — कालसर्प एक कर्मिक पैटर्न है, शाप नहीं, और पैटर्न के साथ काम किया जा सकता है।',
    ],
  },
  {
    id: 'nuksan',
    h2: 'काल सर्प दोष के नुकसान — असली और बढ़ा-चढ़ाकर बताए गए',
    paras: [
      'असली नुकसान जो लगातार दिखते हैं: **परिणाम में देरी** — मेहनत ठीक होती है पर फल देर से आता है; **बार-बार की रुकावट** — काम अंतिम चरण में अटक जाना; **मानसिक अशांति** — बिना कारण की बेचैनी और निर्णय में असमंजस; और **लोगों पर अति-निर्भरता या धोखा**, विशेषकर [कुलिक](/blog/kulik-kaal-sarp-yog-hindi) और [विषधर](/blog/vishdhar-kaal-sarp-yog-hindi) प्रकारों में।',
      'अब बढ़ा-चढ़ाकर बताई जाने वाली बातें, जिन्हें शास्त्र समर्थन नहीं देता: कालसर्प से "विवाह नहीं होता" — गलत; "संतान नहीं होती" — गलत; "अकाल मृत्यु होती है" — पूरी तरह गलत और यह डर बेचने की सबसे पुरानी तरकीब है। इनका खंडन [काल सर्प दोष: 10 मिथक और सच](/blog/kaal-sarp-dosh-myths-facts-hindi) में एक-एक करके किया गया है।',
      'और एक बात जो कोई नहीं कहता: जिन नुकसानों का दोष कालसर्प पर मढ़ा जाता है, उनमें से आधे असल में [शनि की साढ़े साती](/calculators/free-sade-sati-calculator) या कमजोर ग्रह-बल के कारण होते हैं। किसे क्या कहना है, यह [कमजोर ग्रह खोजें](/calculators/free-weak-planet-finder) चलाकर देखिए — सही निदान के बिना उपाय बेकार जाते हैं।',
    ],
  },
  {
    id: 'kaise-banta-hai',
    h2: 'कुंडली में कालसर्प दोष कैसे बनता है?',
    paras: [
      'बनने की शर्त एक ही है और वह गणितीय है: **सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र और शनि — सातों ग्रह राहु और केतु के बीच बने अक्ष के एक ही अर्ध-भाग में हों।** राहु और केतु हमेशा एक-दूसरे से ठीक 180° पर रहते हैं, इसलिए वे आकाश को दो हिस्सों में बाँट देते हैं। सारे ग्रह एक ही हिस्से में आ जाएँ तो कालसर्प।',
      'यहीं पर ज्यादातर मुफ्त कैलकुलेटर गलती करते हैं। वे सिर्फ **राशि या भाव** देखकर तय कर लेते हैं कि ग्रह किस तरफ है। पर अगर कोई ग्रह राहु या केतु की उसी राशि में है, तो राशि से यह पता ही नहीं चलता कि वह अक्ष के पहले है या बाद में — इसके लिए **सटीक देशांतर (longitude) की डिग्री** चाहिए। ऊपर वाला कैलकुलेटर Swiss Ephemeris से हर ग्रह की exact डिग्री लेकर लाहिड़ी अयनांश के साथ तुलना करता है, इसीलिए इसका उत्तर सीमावर्ती मामलों में भी बदलता नहीं।',
      'खुद कदम-दर-कदम जाँचने की विधि [कुंडली में काल सर्प दोष कैसे चेक करें](/blog/how-to-check-kaal-sarp-dosh-hindi) में दी गई है, और पूरी कुंडली भाव सहित देखनी हो तो [मुफ्त कुंडली कैलकुलेटर](/calculators/free-kundali-calculator) से बना लीजिए।',
    ],
  },
  {
    id: 'nivaran-kahan',
    h2: 'कालसर्प दोष का निवारण कहां होता है?',
    paras: [
      'सबसे प्रसिद्ध स्थान **त्र्यंबकेश्वर (नासिक, महाराष्ट्र)** है, जो बारह ज्योतिर्लिंगों में से एक है और जहाँ कालसर्प शांति पूजा की सुदृढ़ परंपरा है। इसके अलावा **उज्जैन (महाकालेश्वर)**, **प्रयागराज (त्रिवेणी संगम)**, और **कालहस्ती (आंध्र प्रदेश)** — जहाँ राहु-केतु पूजा विशेष रूप से होती है — भी पारंपरिक रूप से बताए जाते हैं।',
      'अब वह बात जो आपको वहाँ पहुँचने से पहले जाननी चाहिए। **तीर्थ जाना अनिवार्य नहीं है।** शास्त्र में कहीं नहीं लिखा कि कालसर्प शांति केवल किसी एक स्थान पर संभव है। घर पर नियमित महामृत्युंजय जाप, सोमवार का शिव अभिषेक और नाग पंचमी की पूजा — यह उतनी ही मान्य विधि है, और चालीस दिन की निरंतरता एक दिन की यात्रा से अधिक असरदार है।',
      'एक व्यावहारिक चेतावनी: त्र्यंबकेश्वर और उज्जैन दोनों जगह पूजा के नाम पर दस हजार से लाख रुपये तक की माँग सामान्य हो चुकी है, और अक्सर बिना यह जाँचे कि आपकी कुंडली में दोष है भी या नहीं। **पहले ऊपर का कैलकुलेटर चलाइए।** अगर उत्तर "नहीं" है, तो कोई पूजा करानी ही नहीं है — और यह जानना ही आपके हजारों रुपये बचा देता है।',
    ],
  },
  {
    id: 'pareshaniyan',
    h2: 'कालसर्प दोष से क्या परेशानियां होती हैं?',
    paras: [
      'सबसे आम शिकायत **करियर की धीमी गति** है — योग्यता के बावजूद पदोन्नति में देरी, नौकरी में बार-बार बदलाव, या व्यापार में लगातार अड़चन। यह विशेष रूप से [घातक प्रकार](/blog/ghatak-kaal-sarp-yog-hindi) में उभरता है, और पूरा विश्लेषण [काल सर्प दोष: करियर और व्यापार](/blog/kaal-sarp-dosh-career-business-hindi) में है।',
      'दूसरी बड़ी श्रेणी **रिश्ते** हैं — विवाह में देरी, वैवाहिक जीवन में तनाव, या साझेदारी में विश्वासघात, खासकर [तक्षक प्रकार](/blog/takshak-kaal-sarp-yog-hindi) में। तीसरी है **आर्थिक अस्थिरता** — पैसा आता है पर टिकता नहीं, अनपेक्षित खर्च बार-बार आते हैं। चौथी है **नींद और मानसिक स्थिति** — बुरे सपने, विशेषकर साँप के सपने, जिनका अर्थ [स्वप्न शास्त्र](/swapna) में अलग से देखा जा सकता है।',
      'लेकिन सबसे जरूरी बात अंत में: **इनमें से कोई भी परेशानी अकेले कालसर्प का प्रमाण नहीं है।** ये सारे लक्षण साढ़े साती, कमजोर दशा, या [पितृ दोष](/calculators/free-pitra-dosh-calculator) से भी आते हैं। दोनों में फर्क कैसे करें, यह [काल सर्प दोष बनाम पितृ दोष](/blog/kaal-sarp-dosh-vs-pitra-dosh-hindi) में साफ-साफ बताया गया है। गलत निदान पर किया गया उपाय समय और पैसा दोनों बर्बाद करता है।',
    ],
  },
  {
    id: 'chart-example',
    h2: 'Kaal Sarp Dosh Chart Example — एक असली कुंडली से समझिए',
    paras: [
      'मान लीजिए एक कुंडली में **राहु मिथुन राशि में 12° पर, तृतीय भाव में** है। तब केतु स्वतः धनु राशि में 12° पर, नवम भाव में होगा। अब अक्ष बन गया — मिथुन 12° से धनु 12° तक की एक रेखा जो कुंडली को दो हिस्सों में काटती है।',
      'अब सातों ग्रह देखिए। मान लीजिए सूर्य, बुध और शुक्र वृषभ में हैं; चंद्र और मंगल मेष में; गुरु मीन में; शनि कुंभ में। ये सातों राहु से केतु की ओर **घड़ी की उल्टी दिशा** में एक ही अर्ध-भाग में पड़ रहे हैं — इसलिए कालसर्प **बनता है**, और राहु तृतीय भाव में होने से यह **वासुकि प्रकार** हुआ, जिसका पूरा विवरण [वासुकी काल सर्प योग](/blog/vasuki-kaal-sarp-yog-hindi) में है।',
      'अब एक छोटा सा बदलाव: यदि शनि कुंभ के बजाय **तुला राशि में** होता, तो वह अक्ष के दूसरी तरफ चला जाता और **कालसर्प टूट जाता** — एक ग्रह की स्थिति से पूरा उत्तर पलट जाता है। यही कारण है कि डिग्री-स्तर की गणना जरूरी है और अंदाजा खतरनाक है। अपनी असली कुंडली इसी तरह भाव और डिग्री सहित देखने के लिए [कुंडली कैलकुलेटर](/calculators/free-kundali-calculator) और [लग्न कैलकुलेटर](/calculators/free-lagna-calculator) चलाइए।',
    ],
  },
  {
    id: 'hamesha-ke-liye',
    h2: 'क्या कालसर्प दोष हमेशा के लिए दूर हो सकता है?',
    paras: [
      'गणितीय उत्तर: **नहीं।** जन्म कुंडली स्थायी है, इसलिए योग भी स्थायी है। कोई पूजा, कोई रत्न, कोई मंत्र आपकी जन्म-कुंडली की ग्रह-स्थिति नहीं बदल सकता, और जो कोई ऐसा दावा करे उससे दूर रहिए।',
      'व्यावहारिक उत्तर: **हाँ, इसका असर लगभग समाप्त हो सकता है — और अक्सर होता है।** दो रास्तों से। पहला, **भंग (cancellation)** — यदि कुंडली में शास्त्र-सम्मत भंग की स्थिति मौजूद है, तो दोष जन्म से ही निष्क्रिय है और आपको कुछ करना ही नहीं। पूरे नियम [काल सर्प दोष भंग](/blog/kaal-sarp-dosh-cancellation-hindi) में हैं, और यह लेख सबसे पहले पढ़ने लायक है — बहुत से लोग जिन्हें वर्षों से डराया गया, उनका दोष असल में भंग निकलता है।',
      'दूसरा रास्ता **दशा-परिवर्तन** है। राहु-केतु की दशा बीत जाने पर वही कुंडली स्पष्ट रूप से हल्की महसूस होती है। इसलिए सही रणनीति "दोष मिटाना" नहीं, बल्कि यह जानना है कि दबाव कब तक है और उस अवधि में क्या न करें। यह [दशा कैलकुलेटर](/calculators/free-dasha-calculator) से पता चलता है, और गहरा व्यक्तिगत विश्लेषण चाहिए तो [कार्मिक बैकग्राउंड रीडिंग](/karmic-background-reading) उसी काम के लिए है।',
    ],
  },
  {
    id: 'vyakti-kaise',
    h2: 'कालसर्प दोष वाले व्यक्ति कैसे होते हैं?',
    paras: [
      'व्यवहार में जो व्यक्तित्व-पैटर्न बार-बार दिखता है: **तीव्र महत्वाकांक्षा के साथ भीतर एक बेचैनी।** ये लोग आमतौर पर मेहनती होते हैं, जल्दी हार नहीं मानते, और अक्सर पारंपरिक रास्तों के बजाय अपना रास्ता बनाते हैं। साथ ही इन्हें बार-बार यह अनुभव होता है कि सफलता हाथ के पास आकर फिसल गई — और यही अनुभव इन्हें असामान्य रूप से दृढ़ बना देता है।',
      'दूसरा सामान्य लक्षण **एकांत-प्रियता और गहरी आंतरिक दुनिया** है। भीड़ में रहते हुए भी अकेलापन, और अध्यात्म, रहस्य या असामान्य विषयों की ओर स्वाभाविक झुकाव — यह [शेषनाग](/blog/sheshnag-kaal-sarp-yog-hindi) और [कर्कोटक](/blog/karkotak-kaal-sarp-yog-hindi) प्रकारों में सबसे स्पष्ट है।',
      'पर एक सावधानी जरूरी है, और यह ईमानदारी से कही जा रही है: **यह व्यक्तित्व-विवरण इतना सामान्य है कि लगभग किसी पर भी फिट बैठ जाता है।** ज्योतिष में इसे बार्नम प्रभाव कहते हैं और अधिकांश साइटें इसी का फायदा उठाती हैं। इसीलिए व्यक्तित्व मिलाकर निष्कर्ष मत निकालिए — गणना से जाँचिए। ऊपर का कैलकुलेटर बीस सेकंड लेता है और सटीक उत्तर देता है।',
    ],
  },
  {
    id: 'nivaran-mantra',
    h2: 'कालसर्प दोष निवारण मंत्र — पूरी विधि',
    paras: [
      '**मुख्य मंत्र (महामृत्युंजय):** "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥" — यह कालसर्प शांति का सबसे प्रामाणिक मंत्र है, क्योंकि यह शिव से जुड़ा है और काल पर शिव का ही अधिकार माना गया है।',
      '**राहु बीज मंत्र:** "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः" और **केतु बीज मंत्र:** "ॐ स्रां स्रीं स्रौं सः केतवे नमः" — दोनों 108 बार। **सरल विकल्प**, यदि उच्चारण कठिन लगे: "ॐ नमः शिवाय" — यह भी पूर्णतः मान्य है और गलत उच्चारण के जोखिम से बचाता है।',
      '**विधि:** सोमवार या शनिवार से आरंभ, प्रातः स्नान के बाद, पूर्व या उत्तर दिशा की ओर मुख, रुद्राक्ष माला से 108 बार, लगातार **चालीस दिन**। संख्या से ज्यादा निरंतरता मायने रखती है। किस उपाय की क्या शास्त्रीय पृष्ठभूमि है और कौन सा किस प्रकार के लिए विशेष है, यह [काल सर्प दोष के उपाय](/blog/kaal-sarp-dosh-remedies-hindi) में विस्तार से है। सही मुहूर्त के लिए [पंचांग](/panchang) देख लीजिए, जो प्रतिदिन अपडेट होता है।',
    ],
  },
];

const FAQS = [
  { q: 'Kaal Sarp Dosh kya hota hai?', a: 'Kaal Sarp Dosh tab banta hai jab kundali ke saaton mukhya grahas (Sun se Saturn) Rahu aur Ketu ke beech ek hi taraf aa jaate hain — yaani saare grahas Rahu-Ketu axis ke ek hi ardh-bhag mein. Trikaal Vaani exact graha longitudes (Swiss Ephemeris) se ise calculate karta hai, sirf andaaze se nahi.' },
  { q: 'Mujhe Kaal Sarp Dosh hai ya nahi, kaise pata karein?', a: 'Date of Birth, exact Time of Birth aur Place of Birth daalo. Calculator har graha ki exact position Rahu-Ketu axis ke against check karke Yes/No verdict deta hai, aur agar dosh hai to uska prakaar (12 types mein se) bhi batata hai.' },
  { q: 'Kaal Sarp Dosh ke 12 prakaar konse hain?', a: 'Rahu jis bhaav (house) mein hota hai, uske hisaab se 12 naam hain: Anant, Kulik, Vasuki, Shankhpal, Padma, Mahapadma, Takshak, Karkotak, Shankhachur, Ghatak, Vishdhar aur Sheshnag. Har prakaar alag life-area ko prabhavit karta hai.' },
  { q: 'सबसे खतरनाक कौन सा कालसर्प दोष होता है?', a: 'Shastra mein koi "sabse khatarnak" prakaar nahi hai — yeh vargikaran dar bechne ke liye banaya gaya hai. Gambhirta prakaar se nahi, teen cheezon se tay hoti hai: Rahu ki degree, kundali mein bhang (cancellation) hai ya nahi, aur abhi kaun si dasha chal rahi hai. Bhang hone par sabse "khatarnak" kaha jaane wala prakaar bhi lagbhag nishkriya rehta hai.' },
  { q: 'क्या महिलाओं में कालसर्प दोष अलग होता है?', a: 'Nahi. Ganit ke star par mahilaon aur purushon ke kaal sarp dosh mein koi antar nahi — wahi niyam, wahi 12 prakaar, wahi gambhirta. "Stri kaal sarp" naam ka koi alag dosh shastra mein nahi hai. Yeh sawal isliye zyada khoja jaata hai kyunki vivah-milan ke samay ladki ki kundali zyada kadai se dekhi jaati hai.' },
  { q: 'Kya Kaal Sarp Dosh hamesha bura hota hai?', a: 'Nahi. Kaal Sarp Dosh sangharsh aur mehnat-bhara samay la sakta hai, par yeh "shraap" nahi hai. Bahut se safal log Kaal Sarp ke saath hain — yeh discipline, asadharan maansik dridhta aur late-but-strong success bhi deta hai. Naag puja aur upayon se iska negative asar kaafi shaant ho jaata hai.' },
  { q: 'Kaal Sarp Dosh ke upay kya hain?', a: '(1) Maha Mrityunjaya / Rahu mantra ka jaap, somvar se shuru karke 40 din. (2) Naag Panchami par Naag devta ki puja, chandi/tambe ke naag-naagin behte jal mein visarjan. (3) Shanivar ko Rahu daan (nariyal, neela/kala vastra, urad). (4) Shiv abhishek. Trikaal Vaani aapko 3 personalized free upay deta hai.' },
  { q: 'कालसर्प दोष दूर करने का 1 रामबाण उपाय कौन सा है?', a: 'Agar sirf ek chunna ho to — Maha Mrityunjaya mantra ka niyamit jaap ke saath somvar ko Shiv abhishek, lagatar 40 din. Kaaran shastriya hai: Rahu chhaya graha hai aur uska shaman Shiv-upasana se mana gaya hai. Par yaad rakhein, koi bhi ek upay dosh ko "mita" nahi deta — upay dabav ghatate hain, kundali nahi badalte.' },
  { q: 'Partial Kaal Sarp Dosh kya hota hai?', a: 'Jab koi ek graha axis ke thoda bahar ho to kuch astrologer ise "partial/aanshik" Kaal Sarp kehte hain. Shastra mein aanshik kaal sarp ki koi manya shreni hai hi nahi. Trikaal Vaani classical full-arc rule follow karta hai (saare 7 grahas ek taraf), taaki verdict accurate aur consistent rahe — galat dar paida na ho.' },
  { q: 'काल सर्प दोष कितने साल का होता है?', a: 'Janma kundali ka yog jeevan bhar rehta hai — yeh koi avadhi nahi jo samapt ho jaaye. Par asar ki tivrata dasha ke saath ghatti-badhti hai: Rahu Mahadasha (18 saal) ya Ketu Mahadasha (7 saal) mein dabav sabse zyada, Guru ya Shukra ki dasha mein wahi kundali halki lagti hai. Isliye sahi sawal "kitne saal" nahi, "abhi kaun si dasha chal rahi hai" hai.' },
  { q: 'कालसर्प दोष का निवारण कहां होता है?', a: 'Sabse prasiddh sthan Trimbakeshwar (Nashik) hai, iske alawa Ujjain, Prayagraj aur Kalahasti. Par teerth jaana anivarya nahi hai — shastra mein kahin nahi likha ki shanti sirf kisi ek sthan par sambhav hai. Ghar par 40 din ka niyamit jaap utna hi manya hai. Sabse zaroori: pehle calculator chalayein, kyunki dosh hai hi nahi to koi puja karani hi nahi.' },
  { q: 'Kya Kaal Sarp Dosh hamesha ke liye door ho sakta hai?', a: 'Ganitiya roop se nahi — janma kundali sthayi hai. Par asar lagbhag samapt ho sakta hai, do raaston se: (1) Bhang/cancellation — agar shastra-sammat bhang maujood hai to dosh janma se hi nishkriya hai. (2) Dasha parivartan — Rahu-Ketu ki dasha beetne par wahi kundali spasht roop se halki lagti hai.' },
  { q: 'Kya ye Kaal Sarp Calculator bilkul free hai?', a: 'Haan, 100% free. Yes/No verdict, dosh ka prakaar (Rahu house se), Rahu-Ketu houses, 3 Naag-puja remedies, aur baaki doshas ka quick check — sab bilkul free. Na signup, na card.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) se har graha ki exact longitude nikaalta hai aur Rahu-Ketu axis ke against check karta hai with Lahiri Ayanamsha — 99.9% astronomical accuracy. Zyadatar free calculators sirf rashi ya house dekhte hain, jo tab galat hota hai jab koi graha Rahu/Ketu ki hi rashi mein ho. Yahi reason hai ki yahan ke result borderline cases mein bhi badalte nahi.' },
];

export default function FreeKaalSarpDoshCalculatorPage() {
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
      const res = await fetch('/api/calc/doshas', {
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

  // ─── Result extraction ──────────────────────────────────────
  const doshas: any[] = result?.doshas ?? [];
  const kaalSarp = findDosha(doshas, ['सर्प', 'sarp', 'kaal']);
  const present: boolean = kaalSarp?.present === true;
  const detail: string | null = kaalSarp?.detail ?? null;
  const rahuHouse: number | null = result?.rahu_house ?? null;
  const ketuHouse: number | null = result?.ketu_house ?? null;
  const sarpType = present && rahuHouse ? KAAL_SARP_TYPES[rahuHouse] : null;

  // other present doshas (exclude kaal sarp)
  const otherPresent = doshas.filter((d: any) => d?.present && !(['सर्प', 'sarp', 'kaal'].some(k => String(d?.name || '').toLowerCase().includes(k))));

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-kaal-sarp-dosh-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Kaal Sarp Dosh Calculator — Check & Remedies',
    description:
      'Check if you have Kaal Sarp Dosh using exact planetary longitudes, find its type (Anant to Sheshnag) by Rahu house, and get free Naag-puja remedies. Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Kaal Sarp Dosh Calculator',
    aboutEntities: ['Kaal Sarp Dosh', 'Rahu', 'Ketu', 'Rahu-Ketu Axis'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Kaal Sarp Dosh', 'Dosha Remedies'],
    howToName: 'How to check Kaal Sarp Dosh in your kundali',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Check the Rahu-Ketu axis', text: "The calculator checks every planet's exact longitude against the Rahu-Ketu axis using Swiss Ephemeris with Lahiri Ayanamsha." },
      { name: 'Get your result', text: 'See a Yes/No Kaal Sarp verdict, its type (Anant to Sheshnag) by Rahu house, and free Naag-puja remedies.' },
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
            <span style={{ color: GOLD }}>Free Kaal Sarp Dosh Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Kaal Sarp Dosh Calculator — Check &amp; Remedies
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Kaal Sarp Dosh</strong> tab banta hai jab saaton mukhya grahas Rahu-Ketu axis ke ek hi taraf aa jaayein. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Kaal Sarp Calculator</strong> har graha ki exact longitude (Swiss Ephemeris) se Yes/No verdict, dosh ka prakaar (Anant se Sheshnag), aur Naag-puja remedies turant deta hai — bilkul free, andaaze se nahi.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>
                <Link href="/founder" className="hover:underline">Rohiit Gupta</Link>
              </div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Exact Rahu-Ketu Axis · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Kaal Sarp Dosh (Free)</h2>
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
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Dosh type Rahu ke house se nikalta hai — house ke liye exact time best hai.</p>
                  : <p className="text-slate-500 text-xs mt-1">Exact time se dosh ka prakaar (house) accurate aata hai.</p>}
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
                {loading ? '⟳ Checking Kaal Sarp...' : '🐍 Check My Kaal Sarp Dosh'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Exact Rahu-Ketu Axis</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* VERDICT */}
              {kaalSarp ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                  background: present
                    ? `linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(2,8,23,0.6) 100%)`
                    : `linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                  border: `1px solid ${present ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'}`,
                }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    {form.name ? `${form.name}'s ` : ''}Kaal Sarp Dosh Status
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: present ? '#FCA5A5' : '#86EFAC' }}>
                    {present ? '🐍 YES — Present' : '✅ NO — Not Present'}
                  </div>
                  {present && sarpType && (
                    <div className="text-base text-slate-300">
                      Type: <span style={{ color: GOLD }} className="font-bold">{sarpType.name} Kaal Sarp ({sarpType.hi})</span>
                    </div>
                  )}
                  {(rahuHouse || ketuHouse) && (
                    <div className="text-xs text-slate-500 mt-2">
                      Rahu: House {rahuHouse ?? '—'} · Ketu: House {ketuHouse ?? '—'}
                    </div>
                  )}
                  {detail && <div className="text-sm text-slate-300 mt-3 italic max-w-2xl mx-auto">{detail}</div>}
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Result calculate nahi ho paya. Kripya birth details dobara check karein.</p>
                </div>
              )}

              {/* TYPE DETAIL */}
              {present && sarpType && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-3" style={{ color: GOLD }}>🐍 {sarpType.name} Kaal Sarp ({sarpType.hi})</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Aapka Rahu <strong style={{ color: GOLD }}>House {rahuHouse}</strong> mein hai, isliye yeh <strong>{sarpType.name}</strong> prakaar ka Kaal Sarp hai. Iska mukhya prabhav-kshetra: <strong style={{ color: GOLD }}>{sarpType.theme}</strong>. Yaad rakhein — yeh shraap nahi, ek karmic pattern hai jo upayon aur discipline se shaant hota hai.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href={`/blog/${sarpType.slug}`} className="text-sm font-semibold underline underline-offset-2" style={{ color: GOLD }}>
                      {sarpType.name} Kaal Sarp — full guide →
                    </Link>
                    <Link href={`/blog/${sarpType.slugHi}`} className="text-sm font-semibold underline underline-offset-2" style={{ color: GOLD }}>
                      हिंदी में पढ़ें →
                    </Link>
                    <Link href="/blog/kaal-sarp-dosh-cancellation" className="text-sm font-semibold underline underline-offset-2" style={{ color: GOLD }}>
                      Check if it is cancelled (Bhang) →
                    </Link>
                  </div>
                </div>
              )}

              {/* REMEDIES (Kaal Sarp specific) */}
              {present && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪔 3 Free Remedies — Kaal Sarp Shanti</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Remedy icon="🔱" title="Mantra" content="Maha Mrityunjaya Mantra aur 'ॐ राहवे नमः' ka jaap — somvar/shanivar ko 108 baar, 40 din lagatar. Shiv ji ki upasana sabse prabhavi." />
                    <Remedy icon="🐍" title="Naag Puja" content="Naag Panchami par Naag devta ki puja. Chandi ya tambe ke naag-naagin jode ka behte jal (nadi) mein visarjan." />
                    <Remedy icon="🙏" title="Daan" content="Shanivar ko Rahu daan — nariyal, neela/kala vastra, urad dal. Shiv mandir mein jal-abhishek aur seva." />
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Har upay ki poori vidhi aur shastriya aadhaar:{' '}
                    <Link href="/blog/kaal-sarp-dosh-effects-remedies" className="underline underline-offset-2" style={{ color: GOLD }}>Kaal Sarp remedies guide</Link>
                    {' · '}
                    <Link href="/blog/kaal-sarp-dosh-remedies-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>हिंदी उपाय गाइड</Link>
                  </p>
                </div>
              )}

              {/* WHEN NOT PRESENT — reassurance + CTA */}
              {kaalSarp && !present && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h3 className="text-lg font-serif font-bold mb-2" style={{ color: '#86EFAC' }}>✅ Aapki kundali mein Kaal Sarp Dosh nahi hai</h3>
                  <p className="text-sm text-slate-300">
                    Aapke grahas Rahu-Ketu axis ke dono taraf bante hue hain — yaani koi Kaal Sarp shanti puja karane ki zaroorat nahi hai. Agar phir bhi rukavatein mehsoos ho rahi hain, to wajah kahin aur hai:{' '}
                    <Link href="/calculators/free-sade-sati-calculator" className="underline underline-offset-2" style={{ color: GOLD }}>Sade Sati</Link>,{' '}
                    <Link href="/calculators/free-pitra-dosh-calculator" className="underline underline-offset-2" style={{ color: GOLD }}>Pitra Dosh</Link>, ya{' '}
                    <Link href="/calculators/free-weak-planet-finder" className="underline underline-offset-2" style={{ color: GOLD }}>kamzor graha</Link> — teenon free check kar lijiye.
                  </p>
                </div>
              )}

              {/* OTHER DOSHAS STRIP */}
              {otherPresent.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>⚠️ Aapki kundali ke anya doshas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherPresent.map((d: any, i: number) => {
                      const link = OTHER_DOSHA_LINKS.find((o) => o.keywords.some((k) => String(d?.name || '').toLowerCase().includes(k.toLowerCase())));
                      const inner = (
                        <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <div className="font-semibold text-sm" style={{ color: '#FCA5A5' }}>{d?.name} — present</div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2">{d?.detail}</div>
                          {link?.slug && <div className="text-xs mt-1" style={{ color: GOLD }}>Detail dekhein →</div>}
                        </div>
                      );
                      return link?.slug
                        ? <Link key={i} href={`/calculators/${link.slug}`}>{inner}</Link>
                        : <div key={i}>{inner}</div>;
                    })}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Poori kundali ka deep analysis aur personalized remedies chahiye?</p>
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
                  <a href={`#${s.id}`} className="hover:underline underline-offset-2" style={{ color: '#cbd5e1' }}>
                    {s.h2}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── v2.0: PILLAR CONTENT — 19 keyword-driven H2 sections ── */}
          <section className="mt-12">
            {PILLAR.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">
                    {renderRich(p, `s${si}-p${pi}`)}
                  </p>
                ))}

                {/* the 12-type table sits inside the "prakar" section */}
                {s.id === 'prakar' && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                      <caption className="sr-only">काल सर्प दोष के 12 प्रकार — राहु के भाव अनुसार</caption>
                      <thead>
                        <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>राहु का भाव</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>प्रकार</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>प्रभाव-क्षेत्र</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {Object.entries(KAAL_SARP_TYPES).map(([h, t]) => (
                          <tr key={h} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <td className="p-3">House {h}</td>
                            <td className="p-3 font-semibold">
                              <Link href={`/blog/${t.slugHi}`} className="underline underline-offset-2" style={{ color: GOLD }}>
                                {t.name} ({t.hi})
                              </Link>
                            </td>
                            <td className="p-3">{t.theme}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* COMPARISON TABLE */}
          <section className="mt-4">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sabse bada farak detection method ka hai. Zyadatar free tools graha ki <strong style={{ color: GOLD }}>rashi ya house</strong> dekh kar faisla karte hain, jo tab galat ho jaata hai jab koi graha Rahu ya Ketu ki hi rashi mein baitha ho. Trikaal Vaani <strong style={{ color: GOLD }}>exact longitude arc</strong> par chalta hai, isliye borderline kundali mein bhi verdict badalta nahi.
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Detection Method</td><td className="p-3">Exact longitude arc (Rahu-Ketu)</td><td className="p-3 text-slate-500">Sign/house only</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Type (Anant–Sheshnag)</td><td className="p-3" style={{ color: GOLD }}>✓ Auto from Rahu house</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Bhang / cancellation guidance</td><td className="p-3" style={{ color: GOLD }}>✓ Explained free</td><td className="p-3 text-slate-500">✗ Rarely mentioned</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Other Doshas Check</td><td className="p-3" style={{ color: GOLD }}>✓ Included</td><td className="p-3 text-slate-500">✗ Separate/paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Kaal Sarp Dosh</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="p-4 rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* DEEPER READING — cluster hub */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Kaal Sarp Par Poora Guide Padhein</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Yeh calculator verdict deta hai. Uske peeche ka poora shastra in guides mein hai — sabse pehle{' '}
              <Link href="/blog/kaal-sarp-dosh-cancellation-hindi" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>bhang wala lekh</Link>{' '}
              padhiye, kyunki bahut logon ka dosh asal mein cancel nikalta hai.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { slug: 'kaal-sarp-dosh', label: 'Kaal Sarp Dosh — what it is, what it isn’t' },
                { slug: 'kaal-sarp-dosh-hindi', label: 'काल सर्प दोष: क्या है और क्या नहीं' },
                { slug: 'kaal-sarp-dosh-cancellation', label: 'Kaal Sarp Bhang — cancellation rules' },
                { slug: 'types-of-kaal-sarp-dosh', label: '12 Types of Kaal Sarp Dosh' },
                { slug: 'kaal-sarp-dosh-signs-symptoms', label: 'Signs & symptoms — honest guide' },
                { slug: 'kaal-sarp-dosh-effects-remedies', label: 'Remedies that actually work' },
                { slug: 'kaal-sarp-dosh-myths-facts', label: '10 myths vs facts' },
                { slug: 'kaal-sarp-dosh-marriage', label: 'Kaal Sarp Dosh and marriage' },
                { slug: 'kaal-sarp-dosh-career-business', label: 'Career and business effects' },
                { slug: 'kaal-sarp-dosh-vs-pitra-dosh', label: 'Kaal Sarp vs Pitra Dosh — which is it?' },
                { slug: 'how-to-check-kaal-sarp-dosh', label: 'How to check it yourself, step by step' },
                { slug: 'nag-panchami-2026-kaal-sarp-dosh-remedy', label: 'Nag Panchami 2026 remedy' },
              ].map((b) => (
                <Link key={b.slug} href={`/blog/${b.slug}`}
                  className="p-3 rounded-xl text-sm transition-all hover:opacity-90"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: '#cbd5e1' }}>
                  {b.label}
                </Link>
              ))}
            </div>
          </section>

          {/* SIBLING CALCULATORS */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Kaal Sarp ka result aa gaya hai to agla step yeh hai — dekhiye ki jo rukavat aap mehsoos kar rahe hain uski asli wajah kya hai. Sabse pehle{' '}
              <Link href="/calculators/free-dasha-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Dasha</Link>{' '}
              aur{' '}
              <Link href="/calculators/free-sade-sati-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Sade Sati</Link>{' '}
              — inhi do ka asar sabse zyada galti se Kaal Sarp par mad diya jaata hai.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Calculator' },
                { slug: 'free-pitra-dosh-calculator', name: 'Pitra Dosh Calculator' },
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-kundali-strength-calculator', name: 'Kundali Strength' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
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
              <strong style={{ color: GOLD }}>Classical sources:</strong> Brihat Parashara Hora Shastra (BPHS) — graha, bhaav aur dasha siddhant; classical Kaal Sarp bhang (cancellation) rules; Swiss Ephemeris with Lahiri Ayanamsha for all planetary computation.
            </p>
            <p>
              Yeh page general shastriya framework hai. Apni kundali ka personalised analysis chahiye to{' '}
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

function Remedy({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1.5" style={{ color: GOLD }}>{title}</div>
      <div className="text-sm text-slate-300 leading-relaxed">{content}</div>
    </div>
  );
}
