'use client';

// ============================================================
// File: app/calculators/free-pitra-dosh-calculator/page.tsx
// Version: v2.0 — Free Pitra Dosh Calculator (Radar E3 content build)
// API: /api/calc/doshas (VM /doshas — birth-chart dosha engine)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-08-31) — CONTENT + INTERNAL LINKING REBUILD.
//        Same treatment as free-kaal-sarp-dosh-calculator v2.0, driven by
//        the Radar E3 PAA/PASF keyword brief (31 Aug 2026).
//        • Word count 766 → 3,600+. Competitor tool-page average is 1,573.
//          Live baseline on 31 Aug: 766 words, 7 H2, 24 links — the 24 being
//          header/footer nav only, i.e. zero contextual links in the body.
//        • 16 new H2 sections, each answering one keyword Google itself
//          suggested, ordered by seen_count (4 → 2). Hindi keywords get
//          Hindi answers written as Hindi, not translated from English.
//        • Inline internal links into the 67-post Pitra Dosh cluster that
//          already exists in Supabase — 9 planet articles, 6 house articles,
//          and the causes / signs / types / remedies / tarpan / pind-daan /
//          Pitru Paksha / stri / myths / marriage / childbirth / career
//          guides. EVERY href in this file was verified against the live
//          sitemap on 31 Aug 2026. None are guessed.
//        • Added renderRich() so section copy lives in plain strings with
//          [label](/url) links, and two linked reference tables:
//          PLANET_ROLES (9 rows) and HOUSE_EFFECTS (6 rows).
//        • Added a table of contents — a 3,600-word page needs one, and it
//          gives Google jump-link candidates.
//        • FAQS expanded 8 → 17 (all feed the existing FAQPage schema).
//        • THREE HONESTY CALLS worth knowing about, because they cost
//          keyword volume and were made deliberately:
//            – "घातक पितृ दोष" (seen 4x): answered by saying no such
//              classical category exists. It is an internet coinage that
//              precedes an expensive puja.
//            – "पितृ दोष के प्रकार / 14 types" (seen 4x): no fabricated
//              list of 14. The texts contain no fixed enumeration, so the
//              page explains the three real classification axes instead and
//              says plainly that every "14 types" list online differs.
//            – "पितृ दोष के उपाय लाल किताब" (seen 2x): answered, but with
//              an explicit statement that Trikaal Vaani practises Parashara
//              BPHS and does NOT prescribe Lal Kitab remedies, plus advice
//              not to mix the two systems.
//        • FORM, VALIDATION, API CALL, RESULT RENDERING AND
//          buildCalcJsonLd() USAGE ARE UNCHANGED from v1.1. The calculator
//          was never the problem; visibility was.
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

function findDosha(doshas: any[], keywords: string[]): any | null {
  for (const d of doshas) {
    const nm = String(d?.name || '').toLowerCase();
    if (keywords.some((k) => nm.includes(k.toLowerCase()))) return d;
  }
  return null;
}

const OTHER_DOSHA_LINKS: { keywords: string[]; label: string; slug?: string }[] = [
  { keywords: ['सर्प', 'sarp', 'kaal'], label: 'Kaal Sarp Dosh', slug: 'free-kaal-sarp-dosh-calculator' },
  { keywords: ['मंगल', 'manglik', 'mangal'], label: 'Manglik Dosh', slug: 'free-manglik-dosh-calculator' },
  { keywords: ['चांडाल', 'chandal'], label: 'Guru Chandal Dosh' },
  { keywords: ['ग्रहण', 'grahan'], label: 'Grahan Dosh' },
];

const SIGNS = [
  'Baar-baar ek jaisi rukawatein — mehnat ke baad bhi kaam atak jaana',
  'Santaan se judi chinta — vivah ya santaan mein vilamb',
  'Ghar-parivaar mein anban, ashanti ya bemel',
  'Career/wealth mein lagatar delay ya unexpected loss',
  'Pitru-paksha ya shraadh ke samay vishesh bechaini',
];

// ============================================================
// v2.0 — MARKDOWN-LITE RENDERER
// Long-form copy lives as plain strings with **bold** and
// [label](/internal-url) links, so the 16 content sections stay
// readable and every internal link is easy to audit in one place.
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

// ── Which planet does what in a Pitra Dosh chart. Every row links to
//    its own cluster article (all verified against Supabase 31 Aug 2026).
const PLANET_ROLES: { en: string; hi: string; role: string; slug: string }[] = [
  { en: 'Sun',     hi: 'सूर्य',    role: 'पितृ कारक — पिता और पूर्वजों का मुख्य कारक; यही पीड़ित होता है',        slug: 'sun-and-pitra-dosh-hindi' },
  { en: 'Rahu',    hi: 'राहु',     role: 'सबसे आम पीड़क — सूर्य के साथ ग्रहण-सम योग बनाता है',                    slug: 'rahu-and-pitra-dosh-hindi' },
  { en: 'Ketu',    hi: 'केतु',     role: 'मोक्ष और अधूरे कर्म का कारक — नवम भाव में विशेष रूप से महत्वपूर्ण',      slug: 'ketu-and-pitra-dosh-hindi' },
  { en: 'Saturn',  hi: 'शनि',      role: 'कर्म-ऋण और विलंब — धीमा पर लंबा असर देता है',                          slug: 'saturn-and-pitra-dosh-hindi' },
  { en: 'Moon',    hi: 'चंद्र',    role: 'मातृ कारक — मातृ-पक्ष के पितरों और मानसिक बेचैनी से जुड़ा',              slug: 'moon-and-pitra-dosh-hindi' },
  { en: 'Mars',    hi: 'मंगल',     role: 'भाई-बंधु और रक्त-सम्बन्ध — मांगलिक दोष से बिल्कुल अलग',                slug: 'mars-and-pitra-dosh-hindi' },
  { en: 'Mercury', hi: 'बुध',      role: 'वंश-परंपरा और संवाद — बुधादित्य योग से भ्रमित नहीं होना',                slug: 'mercury-and-pitra-dosh-hindi' },
  { en: 'Jupiter', hi: 'गुरु',     role: 'दोहरी भूमिका — रक्षक भी, और नवम भाव का स्वाभाविक कारक भी',              slug: 'jupiter-and-pitra-dosh-hindi' },
  { en: 'Venus',   hi: 'शुक्र',    role: 'यहाँ सबसे शांत ग्रह — भूमिका सीमित है, और यह ईमानदारी से कहना जरूरी है', slug: 'venus-and-pitra-dosh-hindi' },
];

// ── Which house it sits in changes what it touches.
const HOUSE_EFFECTS: { house: string; theme: string; slug: string }[] = [
  { house: 'प्रथम (लग्न)', theme: 'आत्म-छवि, स्वास्थ्य, जीवन-दिशा में लगातार अस्पष्टता',           slug: 'pitra-dosh-in-1st-house-hindi' },
  { house: 'चतुर्थ',       theme: 'घर, माता, संपत्ति और मानसिक शांति',                              slug: 'pitra-dosh-in-4th-house-hindi' },
  { house: 'पंचम',        theme: 'संतान, शिक्षा और पूर्व-जन्म का कर्म — सबसे अधिक पूछा जाने वाला',   slug: 'pitra-dosh-in-5th-house-hindi' },
  { house: 'अष्टम',       theme: 'आकस्मिक घटनाएँ, विरासत और पारिवारिक रहस्य',                       slug: 'pitra-dosh-in-8th-house-hindi' },
  { house: 'नवम',         theme: 'पितृ स्थान स्वयं — भाग्य, पिता और धर्म; यहाँ दोष सबसे स्पष्ट',      slug: 'pitra-dosh-in-9th-house-hindi' },
  { house: 'द्वादश',      theme: 'व्यय, विदेश, नींद और मोक्ष — पूर्वजों की अतृप्ति का संकेत',        slug: 'pitra-dosh-in-12th-house-hindi' },
];

// ============================================================
// v2.0 — PILLAR CONTENT
// Every h2 is a keyword Google itself surfaced in PAA/PASF for this
// page's SERPs (Radar E3, 31 Aug 2026), ordered by seen_count (4 → 2).
// Hindi questions get Hindi answers, not translations of English ones.
// ============================================================
type PillarSection = { id: string; h2: string; paras: string[] };

const PILLAR: PillarSection[] = [
  {
    id: 'ghatak-pitra-dosh',
    h2: 'घातक पितृ दोष — क्या ऐसा कुछ सचमुच होता है?',
    paras: [
      'सीधा जवाब: **शास्त्र में "घातक पितृ दोष" नाम की कोई श्रेणी नहीं है।** यह शब्द इंटरनेट पर बना है, और लगभग हमेशा किसी महँगी पूजा से ठीक पहले इस्तेमाल होता है। पितृ दोष अपने आप में घातक नहीं होता — यह एक कर्मिक पैटर्न है, दंड नहीं।',
      'फिर भी कुछ स्थितियाँ व्यवहार में ज्यादा भारी पड़ती हैं, और उन्हें साफ नाम देना उचित है: जब **सूर्य पर राहु और शनि दोनों** का प्रभाव हो; जब दोष **नवम भाव में ही** बने, यानी [पितृ स्थान पर सीधा](/blog/pitra-dosh-in-9th-house-hindi); और जब साथ में **राहु या शनि की महादशा** चल रही हो। तीनों एक साथ हों तो असर लगातार महसूस होता है — पर तब भी यह "घातक" नहीं, बस सक्रिय है।',
      'जो असल में मायने रखता है वह तीव्रता है, नाम नहीं। ऊपर वाला कैलकुलेटर severity भी बताता है, और चल रही दशा [मुफ्त दशा कैलकुलेटर](/calculators/free-dasha-calculator) से देखी जा सकती है। जो ज्योतिषी पहले "घातक" कहकर डराए और फिर तुरंत लाख रुपये की पूजा बताए, वह शास्त्र नहीं, स्क्रिप्ट पढ़ रहा है — यही बात [पितृ दोष मिथक बनाम तथ्य](/blog/pitra-dosh-myths-facts-hindi) में प्रमाण सहित लिखी है।',
    ],
  },
  {
    id: 'prakar',
    h2: 'पितृ दोष के प्रकार — वर्गीकरण कैसे होता है',
    paras: [
      'यहाँ एक ईमानदार बात पहले: **शास्त्र में पितृ दोष के प्रकारों की कोई निश्चित गिनी-गिनाई सूची नहीं है।** आपको इंटरनेट पर "14 प्रकार", "7 प्रकार", "12 प्रकार" — सब मिलेंगे, और हर सूची अलग होगी, क्योंकि वे किसी एक ग्रंथ से नहीं आतीं। इसलिए हम कोई मनगढ़ंत संख्या नहीं देंगे।',
      'जो सचमुच शास्त्रीय है वह वर्गीकरण के **तीन आधार** हैं। पहला, **कौन सा ग्रह पीड़ा दे रहा है** — राहु, केतु या शनि, और हर एक का असर अलग होता है। दूसरा, **दोष किस भाव में बन रहा है** — नवम भाव का पितृ दोष और पंचम भाव का पितृ दोष एक जैसे बिल्कुल नहीं होते। तीसरा, **कर्मिक कारण** — पितृ ऋण, अधूरा श्राद्ध, या वंश में कोई अकाल मृत्यु; यह [पितृ दोष बनाम पितृ ऋण](/blog/pitra-dosh-vs-pitru-rin-hindi) में अलग से समझाया गया है।',
      'नीचे दी गई दोनों तालिकाएँ यही दो आधार खोलती हैं — ग्रह के अनुसार और भाव के अनुसार। पूरा वर्गीकरण एक साथ पढ़ना हो तो [पितृ दोष के प्रकार](/blog/types-of-pitra-dosh-hindi) देखिए।',
    ],
  },
  {
    id: 'lakshan-aur-upay',
    h2: 'पितृ दोष के लक्षण और उपाय',
    paras: [
      'लक्षण पहले, और बिना बढ़ा-चढ़ाकर: सबसे आम शिकायत है **बार-बार एक ही तरह की रुकावट** — काम बनते-बनते रुक जाना, वह भी बिना किसी साफ बाहरी कारण के। इसके बाद आते हैं संतान या विवाह में विलंब, घर-परिवार में लगातार अनबन, और पितृ पक्ष या अमावस्या के आसपास असामान्य बेचैनी या पूर्वजों से जुड़े सपने।',
      'अब सावधानी, क्योंकि यहीं सबसे ज्यादा गलत निदान होता है: **ये सारे लक्षण [शनि की साढ़े साती](/calculators/free-sade-sati-calculator), कमजोर ग्रह-बल, या [काल सर्प दोष](/calculators/free-kaal-sarp-dosh-calculator) से भी आ सकते हैं।** लक्षण देखकर खुद पर पितृ दोष का लेबल लगा लेना गलती है — इसीलिए ऊपर का कैलकुलेटर चलाइए, अनुमान नहीं। दोनों में फर्क कैसे करें, यह [काल सर्प दोष बनाम पितृ दोष](/blog/kaal-sarp-dosh-vs-pitra-dosh-hindi) साफ करता है। पूरे तेरह लक्षण [पितृ दोष के 10 लक्षण](/blog/signs-of-pitra-dosh-hindi) में दिए हैं।',
      'उपाय तीन स्तर पर चलते हैं और तीनों लगभग मुफ्त हैं: **तर्पण** (पितृ पक्ष और हर अमावस्या को जल-तर्पण), **दान** (ब्राह्मण, गरीब, गाय, कौआ और कुत्ते को भोजन), और **सेवा** (जीवित माता-पिता और बुजुर्गों का आदर — शास्त्र में यही सबसे बड़ा उपाय कहा गया है)। विस्तार से [सर्वोत्तम पितृ दोष उपाय](/blog/best-pitra-dosh-remedies-hindi) में है।',
    ],
  },
  {
    id: 'saral-upay',
    h2: 'पितृ दोष निवारण के सरल उपाय — जो आज घर पर हो सकते हैं',
    paras: [
      'सबसे सरल और सबसे कम बताया जाने वाला उपाय: **हर अमावस्या को दक्षिण दिशा की ओर मुख करके काले तिल मिले जल से तर्पण।** इसमें न पंडित चाहिए, न यात्रा, न खर्च — सिर्फ जल, काले तिल और पाँच मिनट। पूरी विधि चरण-दर-चरण [अमावस्या तर्पण विधि](/blog/amavasya-tarpan-remedies-hindi) में है।',
      'दूसरा, **कौए और कुत्ते को रोटी।** परंपरा में कौआ पितरों का दूत माना गया है, और यह उपाय इतना साधारण है कि लोग इसे गंभीरता से नहीं लेते — जबकि नियमितता ही इसकी शक्ति है। तीसरा, **पीपल के वृक्ष को जल और सरसों तेल का दीपक**, विशेषकर शनिवार और अमावस्या को। चौथा, **अन्नदान** — किसी भूखे को भोजन, बिना बताए, बिना फोटो।',
      'और पाँचवाँ, जो सबसे कम खर्चीला और सबसे कठिन है: **जीवित बुजुर्गों की सेवा।** शास्त्र इस पर स्पष्ट है — जो अपने जीवित माता-पिता का अनादर करता है, उसके मृत पूर्वजों के लिए किया गया तर्पण अधूरा रह जाता है। कोई भी पूजा इस एक बात की जगह नहीं ले सकती, और कोई भी दुकान इसे बेच नहीं सकती।',
    ],
  },
  {
    id: 'stri-pitra-dosh',
    h2: 'स्त्री पितृ दोष — महिलाओं की कुंडली में',
    paras: [
      'गणित के स्तर पर **महिलाओं और पुरुषों के पितृ दोष में कोई अंतर नहीं है।** वही नियम — सूर्य या नवम भाव पर राहु, केतु या शनि का प्रभाव। कोई अलग गणना नहीं, कोई अलग गंभीरता नहीं। जो कोई "स्त्री पितृ दोष" को एक अलग दोष बताकर अलग पूजा बेचे, वह शास्त्र नहीं बोल रहा।',
      'फिर भी एक वास्तविक सामाजिक अंतर है जिसे नकारना बेईमानी होगी: **श्राद्ध और तर्पण की परंपरा अधिकतर पुरुष वंश के इर्द-गिर्द बनी है**, और इसी वजह से महिलाओं के मन में यह सवाल उठता है कि क्या वे तर्पण कर सकती हैं। शास्त्रीय उत्तर हाँ है — पुत्र के अभाव में पुत्री, पत्नी या पौत्री द्वारा किया गया श्राद्ध मान्य है, और इसके शास्त्रीय संदर्भ [स्त्री पितृ दोष](/blog/stri-pitra-dosh-hindi) में दिए गए हैं।',
      'दूसरी बात जो अक्सर छूट जाती है: पितृ दोष केवल पिता-पक्ष का नहीं होता। **मातृ-पक्ष के पितर भी उतने ही मायने रखते हैं**, और उनका संकेत चंद्रमा से पढ़ा जाता है — यह [चंद्र व पितृ दोष](/blog/moon-and-pitra-dosh-hindi) में खोला गया है। विवाह में देरी को लेकर चिंता हो तो [पितृ दोष व विवाह विलंब](/blog/pitra-dosh-marriage-delay-hindi) पढ़िए, और संतान को लेकर हो तो [पितृ दोष व प्रसव](/blog/pitra-dosh-childbirth-hindi) — दोनों में डराया नहीं गया है।',
    ],
  },
  {
    id: 'kya-hota-hai',
    h2: 'पितृ दोष क्या होता है?',
    paras: [
      '**पितृ दोष तब बनता है जब कुंडली में सूर्य या नवम भाव पर राहु, केतु या शनि का प्रभाव पड़े।** सूर्य पितृ कारक है — पिता और पूर्वजों का प्रतिनिधि — और नवम भाव पितृ स्थान कहलाता है। इनमें से किसी पर छाया ग्रह या शनि की छाया पड़ना, शास्त्र में पूर्वजों से जुड़े अधूरे कर्म का संकेत माना गया है।',
      'शब्द का अर्थ भी यही बताता है: **पितृ** यानी पूर्वज, **दोष** यानी कमी — दंड नहीं, कमी। यह किसी पाप की सज़ा नहीं, बल्कि एक अधूरा हिसाब है जो पीढ़ी से पीढ़ी चला आ रहा है। यही कारण है कि इसके उपाय दंडात्मक नहीं बल्कि पूरक हैं — तर्पण, दान, सेवा। पूरा शास्त्रीय आधार [पितृ दोष: लक्षण, कारण, प्रभाव व उपाय](/blog/pitra-dosh-hindi) में है।',
      'एक भ्रम यहीं दूर कर देना चाहिए: पितृ दोष का यह अर्थ **नहीं** है कि आपके पूर्वज आपसे नाराज़ हैं या आपको श्राप दे रहे हैं। शास्त्र में पितर आशीर्वाद देने वाले माने गए हैं, दंड देने वाले नहीं। जो व्याख्या आपको डराए, वह व्याख्या ही संदिग्ध है।',
    ],
  },
  {
    id: 'nivaran-mantra',
    h2: 'पितृ दोष निवारण मंत्र — पूरी विधि',
    paras: [
      '**मुख्य मंत्र (पितृ गायत्री):** "ॐ देवताभ्यः पितृभ्यश्च महायोगिभ्य एव च। नमः स्वाहायै स्वधायै नित्यमेव नमो नमः॥" — यह पितरों के लिए सबसे प्रामाणिक और सबसे व्यापक रूप से प्रयुक्त मंत्र है, और इसे कोई भी, किसी भी दिन जप सकता है।',
      '**सूर्य के लिए:** "ॐ घृणिः सूर्याय नमः" — 108 बार, सूर्योदय के समय, जल अर्पित करते हुए। चूँकि पितृ दोष में पीड़ित ग्रह सूर्य ही है, इसका बल बढ़ाना सीधा उपाय है; सूर्य की भूमिका [सूर्य व पितृ दोष](/blog/sun-and-pitra-dosh-hindi) में विस्तार से है। **राहु के लिए** "ॐ रां राहवे नमः" और **शनि के लिए** "ॐ शं शनैश्चराय नमः", यदि कैलकुलेटर इन्हीं को पीड़क बताए।',
      '**विधि:** अमावस्या या पितृ पक्ष से आरंभ, प्रातः स्नान के बाद, दक्षिण दिशा की ओर मुख, 108 बार, लगातार। संख्या से ज्यादा **निरंतरता** मायने रखती है — बीच में छोड़कर दोबारा शुरू करना असर तोड़ देता है। सही तिथि के लिए [पंचांग](/panchang) देख लीजिए, जो प्रतिदिन अपडेट होता है और उसी दिन की अमावस्या, तिथि और मुहूर्त दिखाता है।',
    ],
  },
  {
    id: 'pitra-dosha-remedies-english',
    h2: 'Pitra Dosha Remedies — The Honest English Summary',
    paras: [
      'If you are reading in English, here is the whole remedy structure without the mysticism. **Three things work, and all three are nearly free.** First, **Tarpan** — offering water with black sesame to the ancestors, facing south, on every Amavasya and daily through Pitru Paksha. Second, **Daan** — feeding a Brahmin, a poor person, a cow, a crow or a dog, done quietly and repeatedly. Third, **Seva** — genuine care for living parents and elders, which the classical texts rank above every ritual.',
      'What does **not** work, whatever you are told: a single expensive puja that "removes" the dosha permanently, a gemstone marketed as a Pitra Dosh cure, or any ritual you pay for and never repeat. A birth chart placement cannot be deleted. What changes is how much pressure it exerts, and that responds to consistency, not to expenditure. The full reasoning, with what the texts actually say, is in [Best Pitra Dosh Remedies](/blog/best-pitra-dosh-remedies) and [Pitra Dosh Myths vs Facts](/blog/pitra-dosh-myths-facts).',
      'One practical sequence, if you want a place to start: run the calculator above to confirm the dosha actually exists; if it does, begin Amavasya tarpan this month and keep it going for a year; add Pitru Paksha shraddha when it falls; and consider [Pind Daan](/blog/pind-daan-pitra-dosh) only if a specific ancestral death was left without rites. That order costs almost nothing and skips every upsell.',
    ],
  },
  {
    id: 'puja-kahan',
    h2: 'पितृ दोष की पूजा कहां पर होती है?',
    paras: [
      'सबसे प्रसिद्ध स्थान **गया (बिहार)** है, जहाँ फल्गु नदी के तट पर पिंडदान की परंपरा सबसे पुरानी और सबसे मान्य है। इसके अलावा **हरिद्वार** (नारायणी शिला), **प्रयागराज** (त्रिवेणी संगम), **वाराणसी** (पिशाच मोचन), **त्र्यंबकेश्वर** (त्रिपिंडी श्राद्ध) और **रामेश्वरम** भी पारंपरिक रूप से बताए जाते हैं।',
      'अब वह बात जो वहाँ पहुँचने से पहले जाननी चाहिए: **तीर्थ जाना अनिवार्य नहीं है।** शास्त्र में कहीं यह नहीं लिखा कि पितृ शांति केवल किसी एक स्थान पर संभव है। घर पर नियमित अमावस्या तर्पण उतना ही मान्य है, और सालभर की निरंतरता एक दिन की यात्रा से अधिक असरदार मानी गई है। गया का पिंडदान किन विशेष परिस्थितियों में सचमुच जरूरी होता है, यह [पिंडदान — अर्थ, गया व यह कब आवश्यक है](/blog/pind-daan-pitra-dosh-hindi) में साफ लिखा है।',
      'एक व्यावहारिक चेतावनी: गया और त्र्यंबकेश्वर दोनों जगह पूजा के नाम पर दस हजार से लाख रुपये तक की माँग आम हो चुकी है, अक्सर बिना यह जाँचे कि आपकी कुंडली में दोष है भी या नहीं। **पहले ऊपर का कैलकुलेटर चलाइए।** उत्तर "नहीं" आया तो कोई पूजा करानी ही नहीं है — और यही जानकारी आपके हजारों रुपये बचा देती है।',
    ],
  },
  {
    id: 'kab-banta-hai',
    h2: 'कुंडली में पितृ दोष कब बनता है?',
    paras: [
      'बनने की शर्तें चार हैं, और चारों गणितीय हैं। पहली: **सूर्य के साथ राहु या केतु की युति** — इसे ग्रहण-सम योग कहते हैं, क्योंकि छाया ग्रह सूर्य के प्रकाश को ढक देता है। दूसरी: **सूर्य के साथ शनि की युति या दृष्टि** — शनि कर्म-ऋण का कारक है, इसलिए यह योग अधूरे हिसाब का संकेत देता है।',
      'तीसरी: **नवम भाव में राहु, केतु या शनि की उपस्थिति** — नवम भाव स्वयं पितृ स्थान है, इसलिए यहाँ बैठा पाप ग्रह सीधा प्रभाव डालता है। चौथी: **नवम भाव पर इन ग्रहों की दृष्टि**, भले वे वहाँ बैठे न हों। इनमें से कोई एक भी पूरी हो तो कैलकुलेटर "हाँ" कहेगा, और साथ में severity भी बताएगा।',
      'यहीं एक जरूरी तकनीकी बात: **नवम भाव जन्म समय से बनता है।** पंद्रह मिनट की गलती लग्न बदल सकती है, और उसके साथ पूरा भाव-चक्र घूम जाता है — यानी दोष है या नहीं, यह उत्तर ही पलट सकता है। इसलिए जन्म समय अस्पताल के रिकॉर्ड या जन्म प्रमाणपत्र से लीजिए। पूरी भाव-सहित कुंडली [मुफ्त कुंडली कैलकुलेटर](/calculators/free-kundali-calculator) से बनाइए, और कारणों का शास्त्रीय विस्तार [पितृ दोष क्यों होता है](/blog/what-causes-pitra-dosh-hindi) में है।',
    ],
  },
  {
    id: 'kin-karmon-se',
    h2: 'पितृ दोष किन कर्मों से लगता है?',
    paras: [
      'परंपरा में चार कारण बार-बार गिनाए जाते हैं। पहला, **श्राद्ध और तर्पण का छूट जाना** — किसी पीढ़ी में अंतिम संस्कार या वार्षिक श्राद्ध अधूरा रह गया हो। दूसरा, **वंश में अकाल मृत्यु** — जिसका विधिवत संस्कार न हुआ हो। तीसरा, **पूर्वजों द्वारा किया गया अन्याय** जिसका प्रायश्चित नहीं हुआ। चौथा, और सबसे कम बताया जाने वाला, **जीवित माता-पिता का अनादर** — शास्त्र इसे मृत पितरों की उपेक्षा से कम नहीं मानता।',
      'पर यहाँ एक बात साफ कहनी है, क्योंकि इसी जगह सबसे ज्यादा अपराध-बोध बेचा जाता है: **आपको यह जानने की जरूरत नहीं है कि कौन सा कर्म कारण बना।** कोई ज्योतिषी आपकी कुंडली देखकर यह नहीं बता सकता कि आपके परदादा ने क्या किया था — जो ऐसा दावा करे, वह कहानी सुना रहा है। कुंडली पैटर्न बताती है, इतिहास नहीं।',
      'व्यावहारिक रूप से इससे कोई फर्क भी नहीं पड़ता, क्योंकि **उपाय हर कारण के लिए एक ही हैं** — तर्पण, दान, सेवा। कारण जाने बिना भी वे उतने ही काम करते हैं। पितृ ऋण की अवधारणा और वह दोष से कैसे अलग है, यह [पितृ दोष बनाम पितृ ऋण](/blog/pitra-dosh-vs-pitru-rin-hindi) में खोला गया है।',
    ],
  },
  {
    id: 'kaun-se-devta',
    h2: 'कौन से देवता पितृ दोष को दूर करते हैं?',
    paras: [
      'शास्त्र में सबसे पहले **पितृ देवता स्वयं** आते हैं — पितर एक देव-श्रेणी माने गए हैं, और तर्पण सीधे उन्हीं को अर्पित होता है। किसी बिचौलिये की जरूरत नहीं; यही कारण है कि तर्पण घर पर, स्वयं किया जा सकता है।',
      'इसके बाद तीन देवता विशेष रूप से जुड़े हैं। **भगवान विष्णु** — गया का पिंडदान विष्णुपद मंदिर से जुड़ा है, और श्राद्ध कर्म में विष्णु का स्मरण अनिवार्य माना गया है। **यमराज** — पितृ लोक के अधिपति, जिनकी आराधना पितृ पक्ष में होती है। **भगवान शिव** — मृत्यु और मोक्ष के अधिष्ठाता; त्र्यंबकेश्वर का त्रिपिंडी श्राद्ध इसी आधार पर होता है।',
      'साथ ही **सूर्य देव**, क्योंकि पितृ दोष में पीड़ित ग्रह सूर्य ही है — प्रतिदिन सूर्य को जल अर्पित करना इसीलिए इतना बार बताया जाता है, और वह [सूर्य व पितृ दोष](/blog/sun-and-pitra-dosh-hindi) में समझाया गया है। अगर यह सब जटिल लगे तो सरल सत्य यह है: **पितृ गायत्री और सूर्य को जल — दोनों मिलकर पर्याप्त हैं।** बाकी सब विस्तार है, अनिवार्यता नहीं।',
    ],
  },
  {
    id: 'permanently-remove',
    h2: 'How to Remove Pitra Dosh Permanently?',
    paras: [
      'The honest answer has two halves, and most pages only give you the comfortable one. **Mathematically: you cannot.** Your birth chart is fixed. The Sun sat where it sat, Rahu sat where it sat, and no puja, gemstone or donation rewrites that. Anyone promising permanent removal is selling you something that does not exist.',
      '**Practically: the effect can go quiet, and usually does.** Two mechanisms do it. The first is sustained remedial practice — a year of Amavasya tarpan and Pitru Paksha shraddha changes what people actually report, and it costs almost nothing. The second is **Dasha change**: the pressure of Pitra Dosh is felt most sharply while Rahu, Ketu, Saturn or a weak Sun period is running, and it eases noticeably when a benefic period takes over. Check which period you are in with the [free Dasha Calculator](/calculators/free-dasha-calculator).',
      'So the useful question is not "how do I remove it" but "how long is this phase, and what should I not do inside it". That reframing is the entire practical value of the diagnosis, and it is why [Pitra Dosh Myths vs Facts](/blog/pitra-dosh-myths-facts) matters more than any remedy list. For a full personal reading of the karmic pattern, the [Karmic Background Reading](/karmic-background-reading) is built for exactly this.',
    ],
  },
  {
    id: 'pitru-dosha-effects',
    h2: 'Pitru Dosha Effects — Where It Actually Shows Up',
    paras: [
      'The effect most consistently reported is **repetition**: the same category of obstacle returning, in a way that starts to feel patterned rather than accidental. A deal collapses at signature stage; then another one does. That repeating quality, more than any single misfortune, is what classical texts associate with an ancestral pattern.',
      'Beyond that, effects cluster in four areas. **Children and lineage** — delay in conception or in marriage, which is why the [5th house placement](/blog/pitra-dosh-in-5th-house) is the most searched of all. **Career and money** — steady effort producing unsteady results, covered honestly in [Pitra Dosh, Career and Money](/blog/pitra-dosh-career-money). **Family harmony** — recurring friction with the paternal side specifically. And **health of the father or father-figure**, since the Sun is the karaka.',
      'The necessary caution, again: **none of these on its own proves Pitra Dosh.** Delay in marriage is far more often [Mangal Dosh](/calculators/free-manglik-dosh-calculator) or simply a Saturn period; career stagnation is very often [Sade Sati](/calculators/free-sade-sati-calculator). Which dosha is actually driving what is exactly what [Mangal vs Kaal Sarp vs Pitra Dosh](/blog/mangal-dosh-vs-kaal-sarp-vs-pitra-dosh) separates. A remedy aimed at the wrong dosha wastes both time and money.',
    ],
  },
  {
    id: 'lal-kitab',
    h2: 'पितृ दोष के उपाय लाल किताब के अनुसार',
    paras: [
      'पहले एक साफ घोषणा, क्योंकि यह ईमानदारी की बात है: **त्रिकाल वाणी पराशर BPHS परंपरा में काम करता है, लाल किताब में नहीं।** लाल किताब एक अलग पद्धति है — बीसवीं सदी की, अपने अलग नियमों और अलग तर्क वाली। हम उसके उपाय अपनी रीडिंग में नहीं देते, और यहाँ जो बताया जा रहा है वह सूचना है, हमारी सिफारिश नहीं।',
      'लाल किताब में पितृ ऋण के लिए जो टोटके सबसे अधिक बताए जाते हैं वे हैं: **बहते जल में काले तिल या नारियल प्रवाहित करना**, **मंदिर में मुफ्त जल की व्यवस्था**, **किसी वृद्ध या ब्राह्मण को कंबल और भोजन**, और **घर की दक्षिण दीवार पर पूर्वजों का चित्र रखना**। इनमें से कोई भी हानिकारक नहीं है, और कई शास्त्रीय दान-परंपरा से मेल भी खाते हैं।',
      'हमारी सलाह सीधी है: **अगर आप लाल किताब मानते हैं तो किसी लाल किताब के जानकार से ही परामर्श लीजिए**, दो पद्धतियों को मिलाइए मत — क्योंकि मिलाने पर न कोई नियम पूरा लागू होता है, न कोई परिणाम जाँचा जा सकता है। जो शास्त्रीय पराशर-आधारित उपाय हम देते हैं वे [सर्वोत्तम पितृ दोष उपाय](/blog/best-pitra-dosh-remedies-hindi) में हैं, और वे अपने आप में पूर्ण हैं।',
    ],
  },
  {
    id: 'puja-vidhi',
    h2: 'पितृ दोष निवारण पूजा विधि — घर पर, चरण-दर-चरण',
    paras: [
      '**सामग्री:** एक ताँबे या पीतल का पात्र, शुद्ध जल, काले तिल, कुश (यदि उपलब्ध हो), सफेद फूल, और एक दीपक। बस इतना। कोई महँगी सामग्री शास्त्र में अनिवार्य नहीं बताई गई।',
      '**विधि:** प्रातः स्नान के बाद, **दक्षिण दिशा** की ओर मुख करके बैठिए। जनेऊ हो तो उसे दाहिने कंधे पर करिए (अपसव्य)। पात्र में जल लेकर काले तिल मिलाइए। दोनों हाथों की **अनामिका और अंगूठे के बीच** से, हथेली के पितृ-तीर्थ भाग से जल गिराते हुए पितृ गायत्री का जप कीजिए और अपने ज्ञात पूर्वजों के नाम लेकर तर्पण अर्पित कीजिए। अंत में दीपक जलाकर पाँच मिनट मौन बैठिए।',
      '**कब:** हर अमावस्या को, और पितृ पक्ष के पंद्रह दिन प्रतिदिन। **कौन कर सकता है:** कोई भी — पुत्र, पुत्री, पत्नी या पौत्र; इस पर [स्त्री पितृ दोष](/blog/stri-pitra-dosh-hindi) में शास्त्रीय संदर्भ दिए हैं। पूरी विस्तृत विधि चित्रण सहित [अमावस्या तर्पण विधि](/blog/amavasya-tarpan-remedies-hindi) में है, और इस वर्ष की श्राद्ध तिथियाँ [पितृ पक्ष 2026](/blog/pitru-paksha-2026-hindi) में। अमावस्या की सही तारीख हर महीने [पंचांग](/panchang) पर अपडेट होती रहती है।',
    ],
  },
];
const FAQS = [
  { q: 'Pitra Dosh kya hota hai?', a: 'Pitra Dosh tab banta hai jab kundali mein Surya (Sun) ya navam bhaav (9th house — pitru sthan) par Rahu, Ketu ya Shani ka prabhav ho. Ise poorvajon ke adhoore karm ya unke prati shraddha ki kami ka karmic sanket mana jaata hai — dand nahi, ek adhoora hisaab. Trikaal Vaani ise computed birth-chart se accurately check karta hai.' },
  { q: 'Pitra Dosh kaise banta hai?', a: 'Chaar mukhya yog: (1) Surya ke saath Rahu ya Ketu ki yuti — grahan-sam yog. (2) Surya ke saath ya drishti mein Shani. (3) Navam bhaav mein Rahu/Ketu/Shani ki upasthiti. (4) Navam bhaav par in grahon ki drishti. Inme se koi ek bhi poori ho to calculator "haan" kahega, severity ke saath.' },
  { q: 'घातक पितृ दोष क्या होता है?', a: 'Shastra mein "ghatak pitra dosh" naam ki koi shreni hai hi nahi — yeh shabd internet par bana hai aur aksar mehngi puja se pehle istemal hota hai. Vyavhaar mein sabse bhaari sthiti woh hai jahan Surya par Rahu aur Shani dono ka prabhav ho, dosh navam bhaav mein hi bane, aur saath mein Rahu ya Shani ki mahadasha chal rahi ho. Tab bhi yeh "ghatak" nahi, sirf sakriya hai.' },
  { q: 'पितृ दोष के कितने प्रकार होते हैं?', a: 'Shastra mein prakaron ki koi nishchit gini-ginayi soochi nahi hai — internet par "14 prakar", "7 prakar", "12 prakar" sab milenge aur har soochi alag hogi, kyunki ve kisi ek granth se nahi aatin. Jo sachmuch shastriya hai woh teen vargikaran-aadhar hain: kaun sa graha peeda de raha hai, dosh kis bhaav mein ban raha hai, aur karmic kaaran kya hai.' },
  { q: 'क्या महिलाओं में पितृ दोष अलग होता है?', a: 'Nahi. Ganit ke star par koi antar nahi — wahi niyam, wahi severity. "Stri pitra dosh" naam ka alag dosh shastra mein nahi hai. Antar samajik hai: shraadh-tarpan ki parampara adhiktar purush vansh ke ird-gird bani hai. Shastriya uttar yeh hai ki putra ke abhaav mein putri, patni ya pautri dwara kiya gaya shraadh poorntah manya hai.' },
  { q: 'Pitra Dosh ke lakshan kya hain?', a: 'Sabse aam shikayat hai baar-baar ek hi tarah ki rukawat — kaam bante-bante ruk jaana bina kisi saaf bahari kaaran ke. Iske baad santaan ya vivah mein vilamb, ghar-parivaar mein anban, aur pitru paksha ya amavasya ke aaspaas asamanya bechaini. Par ye saare lakshan Sade Sati, kamzor graha-bal ya Kaal Sarp Dosh se bhi aa sakte hain — isliye lakshan dekh kar label mat lagaiye, calculator chalaiye.' },
  { q: 'पितृ दोष निवारण के सबसे सरल उपाय कौन से हैं?', a: 'Sabse saral: har amavasya ko dakshin disha ki or mukh karke kaale til mile jal se tarpan — na pandit chahiye, na yatra, na kharch. Uske baad kaue aur kutte ko roti, peepal ko jal aur sarson tel ka deepak, aur annadan. Aur sabse bada upay: jeevit maata-pita aur buzurgon ki seva. Koi bhi puja is ek baat ki jagah nahi le sakti.' },
  { q: 'पितृ दोष निवारण मंत्र कौन सा है?', a: 'Pitru Gayatri: "ॐ देवताभ्यः पितृभ्यश्च महायोगिभ्य एव च। नमः स्वाहायै स्वधायै नित्यमेव नमो नमः॥" Saath mein Surya ke liye "ॐ घृणिः सूर्याय नमः" 108 baar, suryoday par jal arpit karte hue. Amavasya ya Pitru Paksha se aarambh, dakshin disha ki or mukh, aur lagatar — sankhya se zyada nirantarta maayne rakhti hai.' },
  { q: 'पितृ दोष की पूजा कहां पर होती है?', a: 'Sabse prasiddh Gaya (Bihar) hai, iske alawa Haridwar, Prayagraj, Varanasi, Trimbakeshwar aur Rameshwaram. Par teerth jaana anivarya nahi hai — shastra mein kahin nahi likha ki pitru shanti sirf kisi ek sthan par sambhav hai. Ghar par niyamit amavasya tarpan utna hi manya hai. Sabse zaroori: pehle calculator chalayein, kyunki dosh hai hi nahi to koi puja karani hi nahi.' },
  { q: 'पितृ दोष किन कर्मों से लगता है?', a: 'Parampara mein chaar kaaran ginaye jaate hain: shraadh ya antim sanskar ka chhoot jaana, vansh mein akaal mrityu jiska vidhivat sanskar na hua ho, poorvajon dwara kiya gaya anyaay, aur jeevit maata-pita ka anaadar. Par yaad rakhiye — koi jyotishi kundali dekh kar yeh nahi bata sakta ki aapke pardada ne kya kiya tha. Kundali pattern batati hai, itihaas nahi. Vaise bhi upay har kaaran ke liye ek hi hain.' },
  { q: 'कौन से देवता पितृ दोष को दूर करते हैं?', a: 'Sabse pehle Pitru Devta swayam — pitar ek dev-shreni maane gaye hain aur tarpan seedhe unhi ko arpit hota hai, kisi bichauliye ki zaroorat nahi. Iske baad Bhagwan Vishnu (Gaya ka pind daan), Yamraj (pitru lok ke adhipati) aur Bhagwan Shiv (Tripindi Shraadh). Saath hi Surya Dev, kyunki peedit graha wahi hai. Saral satya: Pitru Gayatri aur Surya ko jal — dono milkar paryapt hain.' },
  { q: 'Kya Pitra Dosh hamesha ke liye door ho sakta hai?', a: 'Ganitiya roop se nahi — janma kundali sthayi hai, koi puja ya ratna use nahi badal sakta. Jo koi permanent removal ka vaada kare, woh kuch bech raha hai. Par asar lagbhag shaant ho sakta hai, do raaston se: saal bhar ki nirantar tarpan-shraadh practice, aur dasha parivartan — Rahu/Ketu/Shani ya kamzor Surya ki avadhi beetne par dabav spasht roop se ghatta hai.' },
  { q: 'Pitru Paksha mein kya karein?', a: 'Pitru Paksha (15 din, Bhadrapad/Ashwin) mein roz pitru-tarpan, Sarva Pitru Amavasya par shraadh, Brahmin-bhoj, aur gareebon ko anna-vastra daan karein. Yeh poorvajon ki tripti aur Pitra Dosh shanti ka sabse uttam samay hai. Is saal ki exact shraadh tithiyan har saal badalti hain, isliye Panchang par dekh lijiye.' },
  { q: 'Kya Pitra Dosh agli peedhi ko affect karta hai?', a: 'Paramparik manyata hai ki asar santaan-prapti aur vansh-vriddhi par padta hai. Par yeh "shraap" nahi — niyamit tarpan, shraadh aur poorvajon ke prati shraddha se prabhav kaafi shaant ho jaata hai. Aur yeh bhi yaad rakhiye ki vivah ya santaan mein vilamb ke kaaran aksar Pitra Dosh nahi, balki Mangal Dosh ya Shani ki avadhi hote hain.' },
  { q: 'क्या लाल किताब के उपाय आप देते हैं?', a: 'Nahi. Trikaal Vaani Parashar BPHS parampara mein kaam karta hai, Lal Kitab mein nahi — woh ek alag paddhati hai, apne alag niyamon ke saath. Agar aap Lal Kitab maante hain to kisi Lal Kitab ke jaankar se hi paramarsh lijiye; do paddhatiyon ko milaiye mat, kyunki milane par na koi niyam poora laagu hota hai na koi parinaam jaancha ja sakta hai.' },
  { q: 'Kya ye Pitra Dosh Calculator free hai?', a: 'Haan, 100% free. Yes/No verdict, severity, dosh ki vajah, sambhavit lakshan, 3 Pitru-Tarpan remedies, aur baaki doshas ka quick check — sab bilkul free. Na signup, na card.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) se kundali banakar Surya aur navam bhaav par Rahu/Ketu/Shani ke prabhav ko classical niyam se check karta hai with Lahiri Ayanamsha — 99.9% astronomical accuracy. Ek zaroori baat: navam bhaav janma samay se banta hai, isliye pandrah minute ki galti poora uttar palat sakti hai. Janma samay aspatal ke record se lijiye.' },
];

export default function FreePitraDoshCalculatorPage() {
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
  const pitra = findDosha(doshas, ['पितृ', 'pitra']);
  const present: boolean = pitra?.present === true;
  const detail: string | null = pitra?.detail ?? null;

  const otherPresent = doshas.filter((d: any) => d?.present && !(['पितृ', 'pitra'].some(k => String(d?.name || '').toLowerCase().includes(k.toLowerCase()))));

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-pitra-dosh-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Pitra Dosh Calculator — Check & Remedies',
    description:
      'Check if you have Pitra Dosh from your birth chart (Sun / 9th house affliction by Rahu, Ketu or Saturn) and get free Pitru-Tarpan remedies. Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Pitra Dosh Calculator',
    aboutEntities: ['Pitra Dosh', 'Sun', 'Ninth House', 'Pitru Tarpan'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Pitra Dosh', 'Dosha Remedies'],
    howToName: 'How to check Pitra Dosh in your kundali',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Analyse Sun and 9th house', text: 'The calculator checks the Sun and the ninth house for affliction by Rahu, Ketu or Saturn using Swiss Ephemeris with Lahiri Ayanamsha.' },
      { name: 'Get your result', text: 'See a Yes/No Pitra Dosh verdict, the cause, likely signs and free Pitru-Tarpan remedies.' },
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
            <span style={{ color: GOLD }}>Free Pitra Dosh Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Pitra Dosh Calculator — Check &amp; Remedies
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Pitra Dosh</strong> tab banta hai jab kundali mein <strong style={{ color: GOLD }}>Surya ya navam bhaav (pitru sthan)</strong> par Rahu, Ketu ya Shani ka prabhav ho — yeh poorvajon se juda karmic sanket hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Pitra Dosh Calculator</strong> Swiss Ephemeris se Yes/No verdict, vajah aur Pitru-Tarpan remedies turant deta hai — bilkul free.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>
                <Link href="/founder" className="hover:underline">Rohiit Gupta</Link>
              </div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Surya &amp; Navam Bhaav Analysis · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Pitra Dosh (Free)</h2>
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
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Navam bhaav (9th house) ke liye exact time best hai — house time se nikalta hai.</p>
                  : <p className="text-slate-500 text-xs mt-1">Exact time se navam-bhaav analysis accurate aati hai.</p>}
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
                {loading ? '⟳ Checking Pitra Dosh...' : '🕉️ Check My Pitra Dosh'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Surya &amp; Navam Bhaav · Parashar BPHS</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* VERDICT */}
              {pitra ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                  background: present
                    ? `linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(2,8,23,0.6) 100%)`
                    : `linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                  border: `1px solid ${present ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'}`,
                }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    {form.name ? `${form.name}'s ` : ''}Pitra Dosh Status
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: present ? '#FCA5A5' : '#86EFAC' }}>
                    {present ? '🕉️ YES — Present' : '✅ NO — Not Present'}
                  </div>
                  {present && pitra?.severity && pitra.severity !== 'none' && (
                    <div className="text-sm text-slate-300">Severity: <span style={{ color: GOLD }} className="font-bold capitalize">{pitra.severity}</span></div>
                  )}
                  {detail && <div className="text-sm text-slate-300 mt-3 italic max-w-2xl mx-auto">{detail}</div>}
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Result calculate nahi ho paya. Kripya birth details dobara check karein.</p>
                </div>
              )}

              {/* CAUSES (only if present) */}
              {present && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-3" style={{ color: GOLD }}>🔎 Pitra Dosh Kyun Bana</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Aapki kundali mein <strong style={{ color: GOLD }}>Surya (pita/poorvaj ka karak)</strong> ya <strong style={{ color: GOLD }}>navam bhaav (pitru sthan)</strong> par Rahu/Ketu/Shani ka prabhav hai — isi yog ko Pitra Dosh kaha jaata hai. Yeh poorvajon ke adhoore karm ya unke prati shraddha-tarpan ki kami ka sanket mana jaata hai. <strong>Yeh shraap nahi</strong> — tarpan aur seva se shaant hota hai.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/blog/what-causes-pitra-dosh-hindi" className="text-sm font-semibold underline underline-offset-2" style={{ color: GOLD }}>
                      पितृ दोष क्यों होता है →
                    </Link>
                    <Link href="/blog/types-of-pitra-dosh-hindi" className="text-sm font-semibold underline underline-offset-2" style={{ color: GOLD }}>
                      प्रकार व वर्गीकरण →
                    </Link>
                    <Link href="/blog/pitra-dosh-myths-facts-hindi" className="text-sm font-semibold underline underline-offset-2" style={{ color: GOLD }}>
                      मिथक बनाम तथ्य →
                    </Link>
                  </div>
                </div>
              )}

              {/* SIGNS (only if present) */}
              {present && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <h3 className="text-lg font-serif font-bold mb-3" style={{ color: '#FCA5A5' }}>⚠️ Sambhavit Lakshan</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {SIGNS.map((s, i) => <li key={i} className="flex gap-2"><span className="text-red-400">•</span><span>{s}</span></li>)}
                  </ul>
                  <p className="text-[11px] text-slate-500 mt-3">
                    Ye samanya sanket hain — pakka nirnay poori kundali se hota hai. Poori soochi{' '}
                    <Link href="/blog/signs-of-pitra-dosh-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>पितृ दोष के 10 लक्षण</Link>{' '}mein.
                  </p>
                </div>
              )}

              {/* REMEDIES (only if present) */}
              {present && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪔 3 Free Remedies — Pitra Dosh Shanti</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Remedy icon="🕉️" title="Pitru Tarpan" content="Pitru Paksha aur har Amavasya ko pitru-tarpan / shraadh karein. Gaya mein Pind Daan ya Tripindi Shraadh sabse uttam." />
                    <Remedy icon="🍚" title="Anna-Daan" content="Brahmin, gareeb, gau, kauwe aur kutte ko bhojan. Amavasya par anna-vastra daan poorvajon ki tripti deta hai." />
                    <Remedy icon="🌳" title="Peepal Seva" content="Peepal vriksha ko jal arpan + sarson tel ka deepak. Maa-baap aur buzurgon ka aadar — sabse saral upay." />
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Har upay ki poori vidhi:{' '}
                    <Link href="/blog/amavasya-tarpan-remedies-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>अमावस्या तर्पण विधि</Link>
                    {' · '}
                    <Link href="/blog/best-pitra-dosh-remedies-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>सर्वोत्तम उपाय</Link>
                    {' · '}
                    <Link href="/blog/pitru-paksha-2026-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>पितृ पक्ष 2026</Link>
                  </p>
                </div>
              )}

              {/* WHEN NOT PRESENT */}
              {pitra && !present && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h3 className="text-lg font-serif font-bold mb-2" style={{ color: '#86EFAC' }}>✅ Aapki kundali mein Pitra Dosh nahi hai</h3>
                  <p className="text-sm text-slate-300">
                    Aapka Surya aur navam bhaav pitru-peeda se mukt hain — yaani koi pitru shanti puja karane ki zaroorat nahi. Phir bhi rukavatein mehsoos ho rahi hain to wajah kahin aur hai:{' '}
                    <Link href="/calculators/free-sade-sati-calculator" className="underline underline-offset-2" style={{ color: GOLD }}>Sade Sati</Link>,{' '}
                    <Link href="/calculators/free-kaal-sarp-dosh-calculator" className="underline underline-offset-2" style={{ color: GOLD }}>Kaal Sarp Dosh</Link>, ya{' '}
                    <Link href="/calculators/free-weak-planet-finder" className="underline underline-offset-2" style={{ color: GOLD }}>kamzor graha</Link> — teenon free check kar lijiye. Poorvajon ka aadar aur Amavasya seva phir bhi sadaiv shubh hai.
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

          {/* ── v2.0: PILLAR CONTENT — 16 keyword-driven H2 sections ── */}
          <section className="mt-12">
            {PILLAR.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">
                    {renderRich(p, `s${si}-p${pi}`)}
                  </p>
                ))}

                {/* both classification tables live inside the "prakar" section */}
                {s.id === 'prakar' && (
                  <>
                    <h3 className="text-lg font-serif font-bold mb-3 mt-6" style={{ color: '#e2e8f0' }}>
                      ग्रह के अनुसार — कौन क्या करता है
                    </h3>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                        <caption className="sr-only">पितृ दोष में हर ग्रह की भूमिका</caption>
                        <thead>
                          <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                            <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>ग्रह</th>
                            <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>भूमिका</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300">
                          {PLANET_ROLES.map((p) => (
                            <tr key={p.en} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                              <td className="p-3 font-semibold">
                                <Link href={`/blog/${p.slug}`} className="underline underline-offset-2" style={{ color: GOLD }}>
                                  {p.hi} ({p.en})
                                </Link>
                              </td>
                              <td className="p-3">{p.role}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-lg font-serif font-bold mb-3" style={{ color: '#e2e8f0' }}>
                      भाव के अनुसार — दोष किसे छूता है
                    </h3>
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                        <caption className="sr-only">भाव के अनुसार पितृ दोष का प्रभाव</caption>
                        <thead>
                          <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                            <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>भाव</th>
                            <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>प्रभाव-क्षेत्र</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300">
                          {HOUSE_EFFECTS.map((h) => (
                            <tr key={h.house} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                              <td className="p-3 font-semibold">
                                <Link href={`/blog/${h.slug}`} className="underline underline-offset-2" style={{ color: GOLD }}>
                                  {h.house} भाव
                                </Link>
                              </td>
                              <td className="p-3">{h.theme}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            ))}
          </section>

          {/* COMPARISON TABLE */}
          <section className="mt-4">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sabse bada farak detection ka hai. Zyadatar free tools sirf <strong style={{ color: GOLD }}>Surya par Rahu ki yuti</strong> dekh kar faisla kar dete hain, jo aadha niyam hai — navam bhaav ki drishti chhoot jaati hai aur dosh detect hi nahi hota. Trikaal Vaani <strong style={{ color: GOLD }}>Surya aur navam bhaav dono</strong> par Rahu, Ketu aur Shani ka prabhav jaanchta hai, sthiti aur drishti dono se.
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Detection</td><td className="p-3">Sun + 9th house, sthiti aur drishti dono</td><td className="p-3 text-slate-500">Generic / Sun only</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Severity grading</td><td className="p-3" style={{ color: GOLD }}>✓ Diya jaata hai</td><td className="p-3 text-slate-500">✗ Sirf yes/no</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Causes + Signs</td><td className="p-3" style={{ color: GOLD }}>✓ Explained</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Other Doshas Check</td><td className="p-3" style={{ color: GOLD }}>✓ Included</td><td className="p-3 text-slate-500">✗ Separate/paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Free, upsell nahi</td><td className="p-3 text-slate-500">✗ Paid puja package</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Pitra Dosh</h2>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Pitra Dosh Par Poora Guide Padhein</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Yeh calculator verdict deta hai. Uske peeche ka poora shastra in guides mein hai — sabse pehle{' '}
              <Link href="/blog/pitra-dosh-myths-facts-hindi" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>mithak bनाम tathya wala lekh</Link>{' '}
              padhiye, kyunki Pitra Dosh ke naam par sabse zyada dar isi ek gap se becha jaata hai.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { slug: 'pitra-dosh', label: 'Pitra Dosh — signs, causes and remedies' },
                { slug: 'pitra-dosh-hindi', label: 'पितृ दोष: लक्षण, कारण, प्रभाव व उपाय' },
                { slug: 'what-causes-pitra-dosh-hindi', label: 'पितृ दोष क्यों होता है — ग्रह योग व कार्मिक कारण' },
                { slug: 'types-of-pitra-dosh-hindi', label: 'पितृ दोष के प्रकार — वर्गीकरण व अर्थ' },
                { slug: 'signs-of-pitra-dosh-hindi', label: 'पितृ दोष के 10 लक्षण' },
                { slug: 'best-pitra-dosh-remedies-hindi', label: 'सर्वोत्तम पितृ दोष उपाय' },
                { slug: 'amavasya-tarpan-remedies-hindi', label: 'अमावस्या तर्पण — घरेलू विधि' },
                { slug: 'pind-daan-pitra-dosh-hindi', label: 'पिंडदान — गया, और यह कब आवश्यक है' },
                { slug: 'pitru-paksha-2026-hindi', label: 'पितृ पक्ष 2026 — श्राद्ध तिथियाँ' },
                { slug: 'pitra-dosh-vs-pitru-rin-hindi', label: 'पितृ दोष बनाम पितृ ऋण' },
                { slug: 'stri-pitra-dosh-hindi', label: 'स्त्री पितृ दोष — मातृ रेखा सहित' },
                { slug: 'pitra-dosh-marriage-delay-hindi', label: 'पितृ दोष व विवाह विलंब' },
                { slug: 'pitra-dosh-childbirth-hindi', label: 'पितृ दोष व संतान' },
                { slug: 'pitra-dosh-career-money-hindi', label: 'पितृ दोष, करियर व धन' },
                { slug: 'kaal-sarp-dosh-vs-pitra-dosh-hindi', label: 'काल सर्प दोष बनाम पितृ दोष — कौन सा है?' },
                { slug: 'mangal-dosh-vs-kaal-sarp-vs-pitra-dosh-hindi', label: 'मंगल बनाम काल सर्प बनाम पितृ दोष' },
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
              Pitra Dosh ka result aa gaya hai to agla step yeh hai — dekhiye ki jo rukawat aap mehsoos kar rahe hain uski asli wajah kya hai. Sabse pehle{' '}
              <Link href="/calculators/free-dasha-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Dasha</Link>{' '}
              aur{' '}
              <Link href="/calculators/free-sade-sati-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Sade Sati</Link>{' '}
              — inhi do ka asar sabse zyada galti se Pitra Dosh par mad diya jaata hai.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Calculator' },
                { slug: 'free-kaal-sarp-dosh-calculator', name: 'Kaal Sarp Dosh' },
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
              <strong style={{ color: GOLD }}>Classical sources:</strong> Brihat Parashara Hora Shastra (BPHS) — Surya as Pitru Karaka, navam bhaav and graha drishti principles; classical Shraadh and Tarpan vidhi; Swiss Ephemeris with Lahiri Ayanamsha for all planetary computation.
            </p>
            <p>
              Yeh page general shastriya framework hai. Apni kundali ka personalised karmic analysis chahiye to{' '}
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
