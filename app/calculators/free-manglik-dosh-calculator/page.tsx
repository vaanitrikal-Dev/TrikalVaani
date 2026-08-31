'use client';

// ============================================================
// File: app/calculators/free-manglik-dosh-calculator/page.tsx
// Version: v2.0 — Free Manglik Dosh Calculator (Radar E3 content build)
// VM endpoint: /manglik-dosh (dedicated, 100% accurate)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-08-31) — CONTENT + INTERNAL LINKING REBUILD.
//        Fourth page in this series, after kaal-sarp v2.0, pitra-dosh v2.0
//        and sade-sati v2.0. Driven by the Radar E3 PAA/PASF keyword brief
//        (31 Aug 2026).
//        • Word count 1,072 → 3,700+. Competitor tool-page average is 1,573.
//          Live baseline 31 Aug: 1,072 words, 8 H2, 24 links — the 24 being
//          header/footer nav only, i.e. zero contextual links in the body.
//        • 11 new H2 sections, each answering one keyword Google itself
//          suggested, ordered by seen_count (3 → 2).
//        • Inline links into the 53-post Mangal Dosh cluster already in
//          Supabase: all six house articles, marriage compatibility, the
//          28-years question, myths, remedies, signs, is-it-real, Manglik
//          vivah muhurat, Mangal Mahadasha and 36-Guna Milan. EVERY href
//          verified against the live sitemap on 31 Aug 2026. None guessed.
//        • Added renderRich() and HOUSE_ARTICLES — a six-row table giving
//          each Manglik house its severity and its own linked article. The
//          severity column matters: 2nd and 12th are LOW and are routinely
//          sold with the same fear as the 7th, which is simply wrong.
//        • FAQS expanded 8 → 16 (all feed the existing FAQPage schema).
//        • Added a Kundali Milan CTA block. This is the most commercial of
//          the four calculators — Manglik is a MATCHING question, not a
//          personal one, and the most common cancellation is that both
//          sides are Manglik. Checking one chart alone is half the job, so
//          the page says that and routes to the Rs51 paid matching.
//        • TWO HONESTY CALLS, both deliberate and both costing volume:
//            – "मांगलिक लड़की की पहचान" (seen 2x): answered by stating that
//              no physical, facial or temperamental identification exists —
//              it is purely chart mathematics — and by naming plainly that
//              this search is almost always run for the bride and not the
//              groom, though the mathematics is identical for both.
//            – "मांगलिक दोष का प्रभाव कितनी आयु तक" (seen 2x): the 28-year
//              belief is reported as a widely held traditional view found
//              in several commentaries, NOT asserted as a rule, because it
//              is not one. The page explains the reasoning behind it and
//              then says the practical move is to check bhanga today rather
//              than wait for an age.
//        • FORM, VALIDATION, API CALL (/api/calc/manglik-dosh), RESULT
//          RENDERING, MANGLIK_HOUSES, DetailCell / Remedy and
//          buildCalcJsonLd() ARE UNCHANGED from v1.1.
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


// ─── Manglik House Reference (Parashar BPHS) ──────────────────
const MANGLIK_HOUSES: Record<number, { name: string; sanskrit: string; effect: string }> = {
  1: { name: '1st House', sanskrit: 'Lagna (Self)',     effect: 'Aggressive personality, dominant nature, leadership but irritability' },
  2: { name: '2nd House', sanskrit: 'Dhana (Wealth)',   effect: 'Harsh speech, family discord, financial volatility' },
  4: { name: '4th House', sanskrit: 'Sukha (Home)',     effect: 'Domestic tensions, mother health, peace disturbed' },
  7: { name: '7th House', sanskrit: 'Kalatra (Spouse)', effect: 'Marital conflict, spouse health issues, partnership tension (STRONGEST Manglik)' },
  8: { name: '8th House', sanskrit: 'Ayur (Longevity)', effect: 'Sudden challenges, accident risk to spouse, in-laws issues' },
  12:{ name: '12th House',sanskrit: 'Vyaya (Loss)',     effect: 'Marital intimacy issues, expenses, foreign travel separations' },
};

// ============================================================
// v2.0 — MARKDOWN-LITE RENDERER
// Section copy lives as plain strings with **bold** and
// [label](/url) links, so all 11 sections stay readable and every
// internal link can be audited in one place.
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

// ── Each of the six Manglik houses linked to its own cluster article.
//    Verified against Supabase blog_posts and the live sitemap, 31 Aug 2026.
const HOUSE_ARTICLES: { house: number; hi: string; severity: string; theme: string; slug: string }[] = [
  { house: 1,  hi: 'प्रथम (लग्न)', severity: 'मध्यम', theme: 'व्यक्तित्व, आक्रामकता, रिश्ते में नियंत्रण की खींचतान', slug: 'mangal-dosh-1st-house-effects-hindi' },
  { house: 2,  hi: 'द्वितीय',      severity: 'कम',    theme: 'वाणी की कठोरता, कुटुंब में मतभेद, धन की अस्थिरता',   slug: 'mangal-dosh-2nd-house-effects-hindi' },
  { house: 4,  hi: 'चतुर्थ',       severity: 'मध्यम', theme: 'घर की शांति, माता का स्वास्थ्य, गृह-कलह',            slug: 'mangal-dosh-4th-house-effects-hindi' },
  { house: 7,  hi: 'सप्तम',        severity: 'उच्च',  theme: 'विवाह और साझेदारी — सबसे प्रबल मांगलिक स्थिति',      slug: 'mangal-dosh-7th-house-effects-hindi' },
  { house: 8,  hi: 'अष्टम',        severity: 'उच्च',  theme: 'आकस्मिक घटनाएँ, ससुराल पक्ष — दीर्घायु का मिथक यहीं', slug: 'mangal-dosh-8th-house-effects-hindi' },
  { house: 12, hi: 'द्वादश',       severity: 'कम',    theme: 'व्यय, विदेश, वैवाहिक निकटता में दूरी',               slug: 'mangal-dosh-12th-house-effects-hindi' },
];

// ============================================================
// v2.0 — PILLAR CONTENT
// Every h2 is a keyword Google itself surfaced in PAA/PASF for this
// page's SERPs (Radar E3, 31 Aug 2026), ordered by seen_count (3 → 2).
// ============================================================
type PillarSection = { id: string; h2: string; paras: string[] };

const PILLAR: PillarSection[] = [
  {
    id: 'dosh-ki-kaat',
    h2: 'मांगलिक दोष की काट — Cancellation कब लगती है?',
    paras: [
      'यह इस पूरे पेज की सबसे जरूरी बात है, इसलिए पहले: **जिन लोगों को मांगलिक बताया जाता है, उनमें से बहुत बड़ी संख्या में शास्त्र-सम्मत भंग (cancellation) पहले से मौजूद होता है — और किसी ने उन्हें बताया ही नहीं होता।** भंग कोई उपाय नहीं है जो करना पड़े; यह कुंडली में जन्म से ही होता है या नहीं होता।',
      'शास्त्रीय भंग की मुख्य स्थितियाँ छह हैं। **दोनों पक्ष मांगलिक हों** — दोष आपस में कट जाता है, और यही सबसे आम भंग है। **मंगल अपनी राशि में हों** (मेष या वृश्चिक) — दोष क्षीण हो जाता है। **मंगल उच्च के हों** (मकर) — दोष लगभग निष्प्रभावी। **गुरु या चंद्र की दृष्टि मंगल पर** — दोष घटता है। **मंगल किसी शुभ ग्रह के साथ** शुभ भाव में हों। और **कुछ लग्नों में मंगल स्वयं योगकारक** होते हैं, जहाँ वे दोष देते ही नहीं।',
      'ऊपर वाला कैलकुलेटर ये स्थितियाँ **अपने आप जाँचता है** और सक्रिय भंग अलग से दिखाता है — यही वह हिस्सा है जो अधिकांश मुफ्त टूल में होता ही नहीं, और जिसकी कमी से बेवजह डर पैदा होता है। पूरा शास्त्रीय आधार [मंगल दोष और विवाह: मिलान, भंग और उपाय](/blog/mangal-dosh-marriage-compatibility-hindi) में है, और [मांगलिक और ग़ैर-मांगलिक का विवाह](/blog/manglik-non-manglik-marriage-hindi) में यह भी कि जब भंग न हो तब क्या करें।',
      'एक व्यावहारिक बात जो बहुत काम आती है: **भंग की जाँच रिश्ता तय होने से पहले करा लीजिए, बाद में नहीं।** अधिकतर परिवारों में क्रम उल्टा होता है — पहले किसी ने "मांगलिक है" कह दिया, घबराहट फैल गई, रिश्ता लगभग टूट गया, और तब कोई भंग देखने की सोचता है। तब तक नुकसान हो चुका होता है। बीस सेकंड की मुफ्त जाँच वह पूरी स्थिति बदल देती है, और यही इस कैलकुलेटर का असली उपयोग है।',
      'और अंत में वह बात जो कोई दुकान नहीं कहेगी: **भंग हो जाने के बाद कोई पूजा, कोई रत्न, कोई परिहार करने की जरूरत नहीं रहती।** दोष कटा हुआ है तो कटा हुआ है। जो ज्योतिषी भंग मिलने के बावजूद महँगा उपाय बताए, वह शास्त्र नहीं, बिक्री कर रहा है — और यही अंतर [क्या मंगल दोष असली है या नकली](/blog/is-mangal-dosh-real-or-fake-hindi) में खोला गया है।',
    ],
  },
  {
    id: 'kitne-din-tak',
    h2: 'मंगल दोष कितने दिन तक रहता है?',
    paras: [
      'सीधा गणितीय उत्तर: **जन्म कुंडली का मंगल दोष जीवन भर रहता है।** मंगल जिस भाव में जन्म के समय थे, वहीं रहेंगे — यह कोई अवधि नहीं जो पूरी हो जाए, न कोई गोचर जो बीत जाए। इसलिए "मंगल दोष तीन साल का होता है" जैसी बातें शास्त्र से नहीं आतीं।',
      'लेकिन जो व्यवहार में महसूस होता है वह अलग है, और यही असली जवाब है: **दोष का दबाव तब सबसे तीव्र होता है जब मंगल की महादशा या अंतर्दशा चल रही हो।** मंगल महादशा सात वर्ष की होती है, और उसी दौरान वे मुद्दे उभरते हैं जिनके लिए मंगल कारक हैं — क्रोध, टकराव, जल्दबाजी के निर्णय। बाकी समय वही कुंडली अपेक्षाकृत शांत रहती है। मंगल महादशा का पूरा स्वरूप [मंगल महादशा: ऊर्जा, क्रोध और 7 वर्ष](/blog/mangal-mahadasha-energy-anger-hindi) में है।',
      'इसलिए सही सवाल "कितने दिन" नहीं, बल्कि "अभी कौन सी दशा चल रही है और अगली कब आएगी" है — और वह [मुफ्त दशा कैलकुलेटर](/calculators/free-dasha-calculator) से एक मिनट में पता चल जाता है। यही जानकारी विवाह के समय पर निर्णय लेने में असल में काम आती है।',
    ],
  },
  {
    id: 'prakar',
    h2: 'मंगल दोष के प्रकार — छह भाव, छह अलग असर',
    paras: [
      'मंगल दोष का "प्रकार" इस बात से तय होता है कि **मंगल किस भाव में बैठे हैं** — और शास्त्र में केवल **छह भाव** मांगलिक माने गए हैं: पहला, दूसरा, चौथा, सातवाँ, आठवाँ और बारहवाँ। बाकी छह भावों में मंगल हों तो मांगलिक दोष बनता ही नहीं, चाहे कोई कुछ भी कहे।',
      'और सभी छह बराबर नहीं हैं — यह वह बात है जो सबसे ज्यादा छिपाई जाती है। **सातवाँ भाव** सबसे प्रबल है, क्योंकि वही विवाह और जीवनसाथी का भाव है। **आठवाँ** भी उच्च माना जाता है। पर **दूसरा और बारहवाँ भाव कम गंभीरता** के हैं, और इन्हें भी उसी डर के साथ बेचा जाता है जिस डर के साथ सातवाँ — जो सीधा-सीधा गलत है।',
      'नीचे की तालिका में छहों भाव, उनकी गंभीरता और प्रभाव-क्षेत्र हैं, और हर भाव अपने विस्तृत लेख से जुड़ा है। एक बात विशेष रूप से पढ़िए — [आठवें भाव में मंगल दोष: दीर्घायु का मिथक](/blog/mangal-dosh-8th-house-effects-hindi), क्योंकि "मांगलिक से शादी करने पर जीवनसाथी की मृत्यु" वाला डर यहीं से पैदा किया जाता है, और उसका शास्त्रीय आधार उतना नहीं है जितना बताया जाता है।',
      'एक और वर्गीकरण है जिसे अधिकतर टूल छोड़ देते हैं: **किस संदर्भ-बिंदु से भाव गिने जा रहे हैं।** शास्त्र में मंगल को मुख्यतः **लग्न से** देखा जाता है, पर कई परंपराएँ **चंद्र से** और **शुक्र से** भी जाँचती हैं। जब मंगल लग्न से मांगलिक भाव में हों पर चंद्र से न हों, तो दोष अपेक्षाकृत हल्का माना जाता है — यह बारीकी अधिकांश मुफ्त कैलकुलेटर में होती ही नहीं, और इसी वजह से अलग-अलग वेबसाइट अलग-अलग जवाब देती हैं।',
    ],
  },
  {
    id: 'online-check-hindi',
    h2: 'मांगलिक दोष चेक ऑनलाइन — हिंदी में, मुफ्त',
    paras: [
      'ऊपर वाला कैलकुलेटर यही काम करता है, और इसके लिए **तीन चीजें** चाहिए: जन्म तिथि, **सटीक जन्म समय**, और जन्म स्थान। बस इतना — न साइनअप, न कार्ड, न फोन नंबर।',
      'जन्म समय पर जोर क्यों है, यह समझ लीजिए क्योंकि यहीं ज्यादातर ऑनलाइन टूल गलत होते हैं: **मांगलिक दोष भाव से तय होता है, राशि से नहीं।** और भाव जन्म समय से बनते हैं। पंद्रह मिनट की गलती लग्न बदल सकती है, और लग्न बदलते ही मंगल छठे भाव से सातवें में जा सकते हैं — यानी "मांगलिक नहीं" से "मांगलिक" हो जाना। इसीलिए अस्पताल का रिकॉर्ड या जन्म प्रमाणपत्र देखिए, घर की याददाश्त नहीं।',
      'परिणाम में आपको मिलेगा: **हाँ/नहीं का फैसला, गंभीरता (उच्च/मध्यम/कम), मंगल का भाव, राशि और डिग्री, छहों मांगलिक भाव, सक्रिय भंग की स्थितियाँ, और तीन उपाय** — सब मुफ्त। हिंदी में पूरी विधि [मंगल दोष कैलकुलेटर गाइड](/blog/mangal-dosh-calculator-hindi) में है, और जोड़े का मिलान करना हो तो [कुंडली मिलान](/kundali-milan) दोनों कुंडलियों में मंगल एक साथ जाँचता है।',
    ],
  },
  {
    id: 'lakshan-pehchan',
    h2: 'मांगलिक होने के लक्षण — और "मांगलिक लड़की की पहचान" वाला सवाल',
    paras: [
      'यह सवाल बहुत खोजा जाता है, और इसका ईमानदार जवाब असहज करने वाला है: **मांगलिक होने की कोई शारीरिक, चेहरे की या स्वभाव की पहचान नहीं होती।** न रंग से, न चाल से, न बोलने के ढंग से। यह पूरी तरह **कुंडली का गणित** है — मंगल किस भाव में हैं, बस इतना। जो कोई कहे कि वह देखकर बता सकता है, वह अनुमान लगा रहा है।',
      'और यह भी कहना जरूरी है: यह खोज लगभग हमेशा **लड़की** के लिए की जाती है, लड़के के लिए नहीं। जबकि मांगलिक दोष का गणित दोनों के लिए बिल्कुल एक जैसा है, और आँकड़ों में यह पुरुषों और स्त्रियों में समान रूप से मिलता है। इसी असंतुलन के कारण हर साल बहुत से अच्छे रिश्ते सिर्फ एक शब्द पर टूट जाते हैं — बिना गंभीरता जाँचे, बिना भंग देखे।',
      'जो संकेत सचमुच कुंडली से जुड़े हैं — जैसे स्वभाव में तेजी, जल्दी क्रोध, निर्णय में जल्दबाजी — वे **मंगल की सामान्य प्रवृत्ति** हैं, न कि मांगलिक दोष का प्रमाण। सात असली शास्त्रीय संकेत [कुंडली में मंगल दोष के 7 संकेत](/blog/signs-of-mangal-dosh-in-kundli-hindi) में हैं, और जो मिथक इस विषय के इर्द-गिर्द बने हैं वे [मांगलिक के 10 मिथक](/blog/manglik-myths-hindi) में एक-एक करके तोड़े गए हैं। लक्षण देखकर नहीं — **कैलकुलेटर से जाँचिए।**',
    ],
  },
  {
    id: 'fayde',
    h2: 'मंगल दोष के फायदे — जो कोई नहीं बताता',
    paras: [
      'यह पक्ष लगभग कहीं नहीं मिलता, क्योंकि डर बेचना आसान है। पर शास्त्रीय दृष्टि से सच यह है: **मंगल पराक्रम, साहस और ऊर्जा के कारक हैं** — और जिस कुंडली में वे बलवान होकर बैठे हैं, वहाँ ये गुण भी उतने ही मजबूत होते हैं। "दोष" शब्द यहाँ धोखा देता है; मंगल का अर्थ ही शुभ है।',
      'चार लाभ जो व्यवहार में दिखते हैं। पहला, **असाधारण कार्य-क्षमता और पहल** — मांगलिक जातक आमतौर पर टालते नहीं, कर डालते हैं। दूसरा, **साहस और डटे रहने की शक्ति**, खासकर प्रतिस्पर्धा और संघर्ष में। तीसरा, **नेतृत्व**, विशेषकर [लग्न में मंगल](/blog/mangal-dosh-1st-house-effects-hindi) वाले जातकों में। चौथा, **संपत्ति और भूमि से लाभ**, क्योंकि मंगल भूमि कारक हैं — यह [मंगल भूमि कारक](/blog/mars-bhoomi-karaka-property-astrology-hindi) में विस्तार से है।',
      'सेना, पुलिस, शल्य-चिकित्सा, इंजीनियरिंग, खेल, रियल एस्टेट — इन क्षेत्रों में असाधारण सफलता पाने वालों की कुंडलियों में मंगल का प्रबल होना बहुत आम है। यह सांत्वना नहीं, प्रवृत्ति है। और यही तर्क [क्या मंगल दोष असली है या नकली](/blog/is-mangal-dosh-real-or-fake-hindi) में खोला गया है।',
    ],
  },
  {
    id: 'vivah-mein-kya-karein',
    h2: 'मांगलिक दोष में विवाह — क्या करें, किस क्रम में',
    paras: [
      'पहला कदम: **भंग जाँचिए, उपाय नहीं।** बहुत से लोग सीधे पूजा और रत्न पर पहुँच जाते हैं, जबकि आधे मामलों में दोष पहले से भंग होता है और कुछ करने की जरूरत ही नहीं। ऊपर का कैलकुलेटर यह मुफ्त बता देता है।',
      'दूसरा कदम: **दोनों कुंडलियाँ एक साथ देखिए, अकेली नहीं।** मांगलिक दोष मिलान का विषय है, व्यक्तिगत दोष का नहीं। अगर दोनों मांगलिक हैं तो दोष कट जाता है — यह सबसे आम और सबसे कम बताई जाने वाली स्थिति है। [कुंडली मिलान](/kundali-milan) ₹51 में दोनों चार्ट पर 36-गुण अष्टकूट, नाड़ी और मंगल — तीनों एक साथ जाँचता है, और यही वह चीज है जो परिवार को दिखाई जा सकती है। गुण-अंकों का असल मतलब [36 गुण मिलान](/blog/36-guna-milan-explained) में समझाया गया है।',
      'तीसरा कदम, यदि भंग न हो: **कुंभ विवाह** जैसा शास्त्रीय परिहार, और नियमित उपाय। पूरी सूची [मांगलिक दोष: शादी की समस्या और 11 उपाय](/blog/manglik-dosh-shaadi-mein-problem-upay-hindi) में है, और शुभ तिथियाँ [मांगलिक विवाह 2026 मुहूर्त](/blog/manglik-vivah-muhurat-2026-hindi) में। और एक बात साफ: **मांगलिक होना विवाह न होने का कारण नहीं है** — [क्या मांगलिक विवाह खतरनाक है](/blog/manglik-marriage-dangerous-hindi) में यह डर प्रमाण सहित तोड़ा गया है।',
      'चौथा कदम, और यह सबसे कम बोला जाता है: **कुंडली के बाहर भी देखिए।** मंगल दोष का जो असर वैवाहिक जीवन पर सचमुच पड़ता है वह क्रोध, जल्दबाजी और टकराव के रूप में आता है — यानी व्यवहार के रूप में, भाग्य के रूप में नहीं। इसीलिए सबसे प्रभावी उपाय अक्सर वही होता है जिसे कोई उपाय नहीं मानता: गुस्से पर काम करना, बात बढ़ने से पहले रुक जाना, और बड़ा निर्णय एक दिन टालकर लेना। मंगल की यही प्रवृत्ति [मंगल महादशा: ऊर्जा, क्रोध और 7 वर्ष](/blog/mangal-mahadasha-energy-anger-hindi) में विस्तार से खुलती है।',
      'और अगर आप स्वयं मांगलिक हैं और यह सब पढ़कर भारी लग रहा है, तो [मैं मांगलिक हूँ — अब क्या करूँ?](/blog/i-am-manglik-what-to-do-hindi) सीधे उसी स्थिति के लिए लिखा गया है — बिना डराए, कदम-दर-कदम।',
    ],
  },
  {
    id: 'kitni-aayu-tak',
    h2: 'मांगलिक दोष का प्रभाव कितनी आयु तक होता है?',
    paras: [
      'परंपरा में सबसे ज्यादा दोहराई जाने वाली बात है कि **28 वर्ष के बाद मंगल दोष का प्रभाव लगभग समाप्त हो जाता है।** यह मान्यता व्यापक है और कई शास्त्रीय टीकाओं में इसका उल्लेख मिलता है — पर इसे "नियम" की तरह मान लेना सही नहीं होगा, और हम वैसा दावा नहीं करेंगे।',
      'तर्क जो इसके पीछे दिया जाता है वह समझने लायक है: 28 वर्ष तक व्यक्ति की मंगल-प्रवृत्ति — जल्दबाजी, क्रोध, टकराव — स्वाभाविक रूप से परिपक्व हो चुकी होती है, और यही प्रवृत्तियाँ वैवाहिक जीवन में असल जोखिम थीं। यानी उम्र दोष को नहीं, **दोष के व्यवहारिक असर को** घटाती है। यह अंतर महत्वपूर्ण है और अक्सर छूट जाता है।',
      'पूरा विश्लेषण — यह मान्यता कहाँ से आई, कितनी टिकती है, और किन मामलों में लागू नहीं होती — [क्या मंगल दोष 28 की उम्र में खत्म होता है?](/blog/does-mangal-dosh-end-after-28-hindi) में अलग से किया गया है। व्यावहारिक निष्कर्ष: **28 का इंतजार करने के बजाय भंग जाँचिए** — वह आज ही उत्तर दे देता है।',
    ],
  },
  {
    id: 'kaise-calculate-hota-hai',
    h2: 'How Is Manglik Dosh Calculated? — The Actual Method',
    paras: [
      'The rule itself is short: **Manglik Dosh exists when Mars occupies the 1st, 2nd, 4th, 7th, 8th or 12th house of the birth chart.** Six houses, nothing else. If Mars sits in any of the other six, there is no Manglik Dosh, regardless of what a sign-based tool tells you.',
      'The part that separates an accurate calculation from a guess is **which reference point the houses are counted from**. Classically, Mars is checked from the **Lagna (ascendant)**, and many traditions also check it from the **Moon** and from **Venus**, with Lagna carrying the most weight. This page computes from the Lagna, which is why an exact birth time is non-negotiable — the Lagna changes roughly every two hours, and with it every house boundary in the chart.',
      'The mechanics here: Swiss Ephemeris gives the exact sidereal longitude of Mars with Lahiri Ayanamsha, the house cusps are computed from your birth time and coordinates, Mars is placed in its house, that house is checked against the six, and then the classical cancellation conditions are tested. That last step is what most free tools skip. If you want to see the chart itself, house by house, build it free with the [Kundli Calculator](/calculators/free-kundali-calculator) or check your ascendant with the [Lagna Calculator](/calculators/free-lagna-calculator).',
      'One thing worth knowing before you compare tools: **different websites will give you different Manglik answers for the same birth details, and it is usually not a bug.** Three things vary between implementations — whether houses are counted from the Lagna, the Moon or Venus; whether the ayanamsha is Lahiri or something else; and whether cancellations are tested at all. A tool that checks only the Lagna and skips bhanga will report far more people as Manglik than a tool that does the full classical procedure. Neither is lying; one is simply incomplete.',
      'That is also why the birth time you supply matters more than the tool you choose. A chart built on a remembered time is a guess dressed up as a calculation, however good the engine behind it. Get the time from a hospital record or birth certificate if you possibly can, and if it is genuinely unknown, treat any Manglik verdict — including this one — as provisional rather than final.',
    ],
  },
  {
    id: 'kaise-pata-karein',
    h2: 'कैसे पता करें कि मंगल दोष है?',
    paras: [
      'सबसे तेज तरीका ऊपर वाला कैलकुलेटर है — बीस सेकंड, मुफ्त, और भंग सहित। पर अगर आप **खुद जाँचना** चाहते हैं तो विधि यह है, और यह सीखने लायक है।',
      '**पहला कदम:** अपनी कुंडली बनाइए — [मुफ्त कुंडली कैलकुलेटर](/calculators/free-kundali-calculator) से, भाव सहित। **दूसरा कदम:** देखिए मंगल किस **भाव** में हैं, राशि में नहीं। भाव की गिनती लग्न से शुरू होती है — लग्न पहला भाव, उससे अगला दूसरा, और इसी तरह। **तीसरा कदम:** अगर वह भाव 1, 2, 4, 7, 8 या 12 में से है, तो मांगलिक दोष है। **चौथा कदम, और यही सबसे जरूरी है:** भंग जाँचिए — क्या मंगल मेष, वृश्चिक या मकर में हैं, क्या गुरु या चंद्र की दृष्टि उन पर है।',
      'सबसे आम गलती जो लोग करते हैं: **राशि और भाव को एक मान लेना।** "मेरा मंगल तुला में है" यह भाव नहीं बताता — तुला राशि किसी के लिए सातवाँ भाव हो सकती है और किसी के लिए तीसरा, यह लग्न पर निर्भर है। इसीलिए बिना सटीक जन्म समय के कोई भी मांगलिक जाँच अनुमान से ज्यादा नहीं है।',
    ],
  },
  {
    id: 'kaun-se-devta',
    h2: 'Which God Removes Mangal Dosha?',
    paras: [
      '**Hanuman ji** is the answer given in every classical remedial tradition, and the reasoning is direct rather than mystical: Hanuman is regarded as the deity who governs Mars, and Mars-related affliction is therefore addressed through his worship. In practice this means the **Hanuman Chalisa, read daily, and especially on Tuesdays** — the day Mars rules.',
      'Two others are named alongside. **Lord Kartikeya (Murugan)**, who in classical texts is himself associated with Mars — Mangal is called his graha in several traditions, and his worship is prescribed particularly in South India. And **Lord Shiva**, through the Mangalnath temple at Ujjain, which is traditionally held to be the birthplace of Mars and where the Bhaat Puja for Mangal Dosh is performed.',
      'One honest note before you travel anywhere. **No deity, temple or ritual deletes a planetary placement from a birth chart** — anyone promising permanent removal is selling something that does not exist. What remedies genuinely do is reduce the behavioural expression of Mars: the anger, the haste, the confrontation that actually damage a marriage. That is not a small thing, and it is achievable at home for nothing. The full remedy set, with what each is actually for, is in [Mangal Dosh Remedies](/blog/mangal-dosh-remedies) and, in Hindi, [मंगल दोष के उपाय](/blog/mangal-dosh-remedies-hindi).',
    ],
  },
];

const FAQS = [
  { q: 'Manglik Dosh kya hota hai?', a: 'Manglik Dosh (Mangal Dosha / Kuja Dosha / Bhauma Dosha) tab banta hai jab Mangal (Mars) janm kundali ke 1st, 2nd, 4th, 7th, 8th, ya 12th bhaav mein sthit ho. Sirf yeh chhe bhaav — baaki chhe mein Mangal hon to Manglik Dosh banta hi nahi. Yeh dosha mukhya roop se marriage compatibility ko affect karta hai per Parashar BPHS.' },
  { q: 'मांगलिक दोष की काट क्या है?', a: 'Bhang (cancellation) koi upay nahi jo karna pade — yeh kundali mein janm se hi hota hai ya nahi hota. Mukhya sthitiyan: dono paksh Manglik hon (sabse aam bhang), Mangal apni rashi mein (Mesh/Vrishchik), Mangal uchch ke (Makar), Guru ya Chandra ki drishti Mangal par, Mangal shubh graha ke saath shubh bhaav mein, aur kuch lagnon mein Mangal swayam yogkarak. Upar wala calculator ye sab apne aap jaanchta hai.' },
  { q: 'मंगल दोष कितने दिन तक रहता है?', a: 'Janm kundali ka Mangal dosh jeevan bhar rehta hai — Mangal jis bhaav mein janm ke samay the, wahin rahenge. Par dabav sabse teevra tab hota hai jab Mangal ki mahadasha ya antardasha chal rahi ho (Mangal mahadasha 7 saal ki hoti hai). Baaki samay wahi kundali apekshakrit shaant rehti hai. Isliye sahi sawal "kitne din" nahi, "abhi kaun si dasha chal rahi hai" hai.' },
  { q: 'मंगल दोष के कितने प्रकार होते हैं?', a: 'Prakar Mangal ke bhaav se tay hota hai — shastra mein sirf chhe bhaav Manglik maane gaye hain: 1, 2, 4, 7, 8 aur 12. Aur sab barabar nahi hain: 7th sabse prabal (vivah ka bhaav), 8th bhi uchch, 1st aur 4th madhyam, jabki 2nd aur 12th kam gambhirta ke hain. In do ko bhi usi dar ke saath becha jaata hai jo seedha galat hai.' },
  { q: 'मांगलिक दोष ऑनलाइन कैसे चेक करें?', a: 'Teen cheezein chahiye: janm tithi, sateek janm samay, aur janm sthan. Janm samay par zor isliye hai kyunki Manglik dosh bhaav se tay hota hai, rashi se nahi — aur bhaav janm samay se bante hain. Pandrah minute ki galti lagna badal sakti hai, aur Mangal chhathe bhaav se saatve mein ja sakte hain, yaani "nahi" se "haan" ho jaana.' },
  { q: 'मांगलिक लड़की की पहचान कैसे होती है?', a: 'Manglik hone ki koi shaaririk, chehre ki ya swabhav ki pehchan hoti hi nahi. Yeh poori tarah kundali ka ganit hai — Mangal kis bhaav mein hain, bas itna. Jo koi kahe ki woh dekh kar bata sakta hai, woh anuman laga raha hai. Aur yeh khoj lagbhag hamesha ladki ke liye ki jaati hai jabki ganit dono ke liye bilkul ek jaisa hai.' },
  { q: 'Manglik Dosh ki severity kya hoti hai?', a: 'Uchch — Mangal 7th bhaav mein (vivah par sabse zyada asar) ya 8th mein. Madhyam — 1st ya 4th bhaav. Kam — 2nd ya 12th bhaav. Severity zyada ho to bhang check aur upay dono zaroori hain; kam ho to aksar kuch karne ki zaroorat hi nahi hoti. Calculator severity apne aap batata hai.' },
  { q: 'मंगल दोष के फायदे क्या हैं?', a: 'Mangal parakram, saahas aur urja ke karak hain — "dosh" shabd yahan dhokha deta hai. Chaar laabh vyavhaar mein dikhte hain: asadharan karya-kshamta aur pehal, saahas aur date rehne ki shakti, netritva (khaaskar lagna mein Mangal), aur bhoomi-sampatti se laabh kyunki Mangal bhoomi karak hain. Sena, police, surgery, engineering, khel aur real estate mein prabal Mangal bahut aam hai.' },
  { q: 'मांगलिक दोष में विवाह के लिए क्या करें?', a: 'Kram yeh hai: (1) Pehle bhang jaanchiye, upay nahi — aadhe maamlon mein dosh pehle se bhang hota hai. (2) Dono kundaliyan ek saath dekhiye, akeli nahi — agar dono Manglik hain to dosh kat jaata hai. (3) Bhang na ho to Kumbh Vivah jaisa shastriya parihar aur niyamit upay. Manglik hona vivah na hone ka kaaran nahi hai.' },
  { q: 'मांगलिक दोष का प्रभाव कितनी आयु तक होता है?', a: 'Parampara mein sabse zyada dohrayi jaane wali baat yeh hai ki 28 varsh ke baad prabhav lagbhag samapt ho jaata hai, aur kai shastriya tikaon mein iska ullekh milta hai. Par ise "niyam" maan lena sahi nahi hoga. Tark yeh hai ki 28 tak Mangal-pravritti — jaldbaazi, krodh, takrav — swabhavik roop se paripakv ho chuki hoti hai. Yaani umra dosh ko nahi, dosh ke vyavhaarik asar ko ghatati hai.' },
  { q: 'How is Manglik Dosh calculated?', a: 'Mars must occupy the 1st, 2nd, 4th, 7th, 8th or 12th house. What separates an accurate calculation from a guess is the reference point: classically Mars is checked from the Lagna, and many traditions also check from the Moon and Venus, with Lagna carrying most weight. This page computes from the Lagna, which is why exact birth time is non-negotiable — the Lagna changes roughly every two hours.' },
  { q: 'कैसे पता करें कि मंगल दोष है?', a: 'Khud jaanchne ki vidhi: (1) Bhaav sahit kundali banaiye. (2) Dekhiye Mangal kis BHAAV mein hain, rashi mein nahi — bhaav ki ginti lagna se shuru hoti hai. (3) Agar woh bhaav 1, 2, 4, 7, 8 ya 12 mein se hai to dosh hai. (4) Bhang jaanchiye. Sabse aam galti: rashi aur bhaav ko ek maan lena — "mera Mangal Tula mein hai" bhaav nahi batata.' },
  { q: 'Kya Manglik aur non-Manglik ki shadi ho sakti hai?', a: 'Haan. Bashart ki bhang laagu ho, ya shastriya parihar (jaise Kumbh Vivah) kiya jaaye. Sabse aam bhang yahi hai ki dono paksh Manglik hon — us sthiti mein dosh aapas mein kat jaata hai. Aur yaad rakhiye: Manglik hona vivah na hone ka kaaran nahi hai, chahe kitna bhi dar dikhaya jaaye.' },
  { q: 'Which god removes Mangal Dosha?', a: 'Hanuman ji, in every classical remedial tradition — the Hanuman Chalisa daily, especially on Tuesdays. Lord Kartikeya (Murugan) is named alongside, particularly in South India, and Lord Shiva through the Mangalnath temple at Ujjain. But no deity or ritual deletes a planetary placement. What remedies genuinely reduce is the behavioural expression of Mars — the anger and haste that actually damage a marriage.' },
  { q: 'Manglik Dosh ke remedies kya hain?', a: '(1) Mangal Mantra "Om Mangalaya Namah" 108 baar, Mangalvaar. (2) Hanuman Chalisa nitya. (3) Moonga (Red Coral) — sirf expert consultation ke baad, kabhi apne aap nahi. (4) Mangalvaar ko masoor dal, gud, laal vastra, tambe ke bartan ka daan. (5) Kumbh Vivah, agar bhang na ho. (6) Krodh par sanyam — Mangal aakramakta ke karak hain, aur yahi asal upay hai.' },
  { q: 'Kya Manglik Calculator bilkul free hai?', a: 'Haan. 100% free. Manglik Yes/No verdict, severity (High/Medium/Low), Mars house + sign + degree, saare 6 affected bhaav, cancellation conditions, aur 3 Parashar remedies — sab free, koi signup nahi. Cancellation check hi woh hissa hai jo zyadatar muft tools mein hota hi nahi.' },
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
  const houseArticle = marsHouse ? HOUSE_ARTICLES.find((h) => h.house === marsHouse) : undefined;

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
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Manglik Dosh Calculator</strong> aapki Manglik status Swiss Ephemeris se calculate karta hai. Date, time, place daalo — Yes/No verdict, severity (High/Medium/Low), Mars house + sign, all 6 affected houses, <strong style={{ color: GOLD }}>cancellation (bhang) conditions</strong>, aur 3 Parashar remedies turant milte hain. 100% free, BPHS classical rules ke according.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>
                <Link href="/founder" className="hover:underline">Rohiit Gupta</Link>
              </div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
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
                  <>
                    <p className="text-sm text-slate-300 mt-3 italic">&ldquo;Mars is favorably placed in your chart. No Manglik Dosh active.&rdquo;</p>
                    <p className="text-sm text-slate-300 mt-4 max-w-2xl mx-auto">
                      Phir bhi vivah mein vilamb ho raha hai? Wajah kahin aur hai —{' '}
                      <Link href="/calculators/free-sade-sati-calculator" className="underline underline-offset-2" style={{ color: GOLD }}>Sade Sati</Link>,{' '}
                      <Link href="/calculators/free-dasha-calculator" className="underline underline-offset-2" style={{ color: GOLD }}>chal rahi dasha</Link>, ya{' '}
                      <Link href="/blog/mangal-dosh-vs-kaal-sarp-vs-pitra-dosh-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>koi doosra dosh</Link> — teenon free check kar lijiye.
                    </p>
                  </>
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
                      {houseArticle && (
                        <Link href={`/blog/${houseArticle.slug}`} className="inline-block mt-3 text-sm font-semibold underline underline-offset-2" style={{ color: GOLD }}>
                          {houseArticle.hi} भाव में मंगल दोष — पूरा विश्लेषण →
                        </Link>
                      )}
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
                    const art = HOUSE_ARTICLES.find((h) => h.house === houseNum);
                    const inner = (
                      <div className="p-3 rounded-xl h-full" style={{
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
                    return art
                      ? <Link key={houseNum} href={`/blog/${art.slug}`}>{inner}</Link>
                      : <div key={houseNum}>{inner}</div>;
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-3">Har bhaav par click karke uska poora vishleshan padh sakte hain.</p>
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
                  <p className="text-xs text-slate-400 mt-4">
                    Bhang ke poore shastriya niyam:{' '}
                    <Link href="/blog/mangal-dosh-marriage-compatibility-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>मंगल दोष और विवाह — मिलान, भंग और उपाय</Link>
                  </p>
                </div>
              )}

              {isManglik && cancellations.length === 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)' }}>
                  <h3 className="text-xl font-serif font-bold mb-3" style={{ color: '#FBBF24' }}>⚠️ No Automatic Cancellation</h3>
                  <p className="text-sm text-slate-300">Aapke chart mein automatic Manglik cancellation rules apply nahi ho rahe. Marriage compatibility ke liye:</p>
                  <ul className="space-y-2 mt-3 text-sm text-slate-300">
                    <li className="flex gap-2"><span className="text-yellow-400">•</span><span>Partner ka chart bhi check karein — agar partner bhi Manglik ho toh dosh cancel ho jata hai. <Link href="/kundali-milan" className="underline underline-offset-2" style={{ color: GOLD }}>Kundali Milan</Link> dono ek saath dekhta hai.</span></li>
                    <li className="flex gap-2"><span className="text-yellow-400">•</span><span>Kumbh Vivah ritual perform karein before marriage — <Link href="/blog/manglik-dosh-shaadi-mein-problem-upay-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>11 उपाय</Link></span></li>
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
                  <p className="text-xs text-slate-400 mt-4">
                    Poori upay soochi:{' '}
                    <Link href="/blog/mangal-dosh-remedies-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>मंगल दोष के उपाय</Link>
                    {' · '}
                    <Link href="/blog/manglik-vivah-muhurat-2026-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>मांगलिक विवाह 2026 मुहूर्त</Link>
                  </p>
                </div>
              )}

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

          {/* ── v2.0: PILLAR CONTENT — 11 keyword-driven H2 sections ── */}
          <section className="mt-12">
            {PILLAR.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">
                    {renderRich(p, `s${si}-p${pi}`)}
                  </p>
                ))}

                {/* the six-house table sits inside the "prakar" section */}
                {s.id === 'prakar' && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                      <caption className="sr-only">छह मांगलिक भाव, उनकी गंभीरता और प्रभाव-क्षेत्र</caption>
                      <thead>
                        <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>भाव</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>गंभीरता</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>प्रभाव-क्षेत्र</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {HOUSE_ARTICLES.map((h) => (
                          <tr key={h.house} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <td className="p-3 font-semibold">
                              <Link href={`/blog/${h.slug}`} className="underline underline-offset-2" style={{ color: GOLD }}>
                                {h.hi} भाव
                              </Link>
                            </td>
                            <td className="p-3" style={{
                              color: h.severity === 'उच्च' ? '#FCA5A5' : h.severity === 'मध्यम' ? '#FCD34D' : '#86EFAC',
                              fontWeight: 600,
                            }}>
                              {h.severity}
                            </td>
                            <td className="p-3">{h.theme}</td>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk Manglik Calculator</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sabse bada farak <strong style={{ color: GOLD }}>cancellation check</strong> ka hai. Zyadatar muft tools sirf itna batate hain ki Mangal chhe bhaavon mein se kisi ek mein hai ya nahi, aur wahin ruk jaate hain — jo aadha jawab hai. <strong style={{ color: GOLD }}>Bhang (parihar)</strong> jaanche bina yeh nahi pata chalta ki dosh sakriya bhi hai ya janm se hi kata hua hai. Yahi ek gap hai jisse sabse zyada bevajah dar paida hota hai.
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Cancellation (Bhang) auto-check</td><td className="p-3" style={{ color: GOLD }}>✓ Free, sabse zaroori hissa</td><td className="p-3 text-slate-500">✗ Missing ya paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Severity (High/Med/Low)</td><td className="p-3" style={{ color: GOLD }}>✓ Auto-detected</td><td className="p-3 text-slate-500">✗ Sab ek jaisa</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Mars House + Sign + Degree</td><td className="p-3" style={{ color: GOLD }}>✓ Teenon</td><td className="p-3 text-slate-500">✗ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">House-wise effect explained</td><td className="p-3" style={{ color: GOLD }}>✓ Chheh alag lekh</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
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

          {/* DEEPER READING — cluster hub */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Mangal Dosh Par Poora Guide Padhein</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Yeh calculator verdict aur bhang deta hai. Uske peeche ka poora shastra in guides mein hai — sabse pehle{' '}
              <Link href="/blog/manglik-myths-hindi" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>मांगलिक के 10 मिथक</Link>{' '}
              padhiye, kyunki is ek vishay par jitna dar becha jaata hai utna shayad kisi aur par nahi.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { slug: 'what-is-mangal-dosha-hindi', label: 'मंगल दोष क्या है? पूरी जानकारी' },
                { slug: 'mangal-dosh-marriage-compatibility-hindi', label: 'मंगल दोष और विवाह: मिलान, भंग और उपाय' },
                { slug: 'manglik-non-manglik-marriage-hindi', label: 'मांगलिक और ग़ैर-मांगलिक का विवाह' },
                { slug: 'manglik-marriage-dangerous-hindi', label: 'क्या मांगलिक विवाह खतरनाक है?' },
                { slug: 'i-am-manglik-what-to-do-hindi', label: 'मैं मांगलिक हूँ — अब क्या करूँ?' },
                { slug: 'does-mangal-dosh-end-after-28-hindi', label: 'क्या मंगल दोष 28 की उम्र में खत्म होता है?' },
                { slug: 'signs-of-mangal-dosh-in-kundli-hindi', label: 'कुंडली में मंगल दोष के 7 संकेत' },
                { slug: 'manglik-dosh-shaadi-mein-problem-upay-hindi', label: 'शादी की समस्या और 11 उपाय' },
                { slug: 'is-mangal-dosh-real-or-fake-hindi', label: 'क्या मंगल दोष असली है या नकली?' },
                { slug: 'manglik-vivah-muhurat-2026-hindi', label: 'मांगलिक विवाह 2026: शुभ मुहूर्त' },
                { slug: 'mangal-dosh-vs-kaal-sarp-vs-pitra-dosh-hindi', label: 'मंगल बनाम काल सर्प बनाम पितृ दोष' },
                { slug: 'mangal-mahadasha-energy-anger-hindi', label: 'मंगल महादशा: ऊर्जा, क्रोध और 7 वर्ष' },
                { slug: 'manglik-myths', label: '10 Manglik myths, debunked' },
                { slug: '36-guna-milan-explained', label: '36 Guna Milan — what the score actually means' },
              ].map((b) => (
                <Link key={b.slug} href={`/blog/${b.slug}`}
                  className="p-3 rounded-xl text-sm transition-all hover:opacity-90"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: '#cbd5e1' }}>
                  {b.label}
                </Link>
              ))}
            </div>
          </section>

          {/* KUNDALI MILAN CTA — the commercial next step for this page */}
          <section className="mt-12">
            <div className="rounded-2xl p-6 md:p-8" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
              <h2 className="text-2xl font-serif font-bold mb-3" style={{ color: GOLD }}>Rishta Saamne Hai? Dono Kundaliyan Ek Saath Dekhiye</h2>
              <p className="text-slate-300 leading-relaxed mb-5">
                Manglik dosh akeli kundali ka nahi, <strong style={{ color: GOLD }}>milan ka vishay</strong> hai — aur sabse aam bhang yahi hai ki dono paksh Manglik hon.
                Isliye agar rishta vichaaradheen hai to sirf apni kundali dekhna aadha kaam hai.{' '}
                <Link href="/kundali-milan" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Kundali Milan</Link>{' '}
                dono charts par poora 36-Guna Ashtakoot, Nadi Dosha aur Mangal — teenon bhang sahit — ek report mein deta hai,
                jo parivar ko dikhayi ja sakti hai. Sirf ek number nahi, poora tark.
              </p>
              <Link href="/kundali-milan"
                className="inline-block px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.85) 0%,${GOLD} 100%)`, color: '#080B12' }}>
                Kundali Milan — ₹51 se →
              </Link>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Agar result &ldquo;Manglik nahi&rdquo; aaya par vivah mein vilamb ho raha hai, to wajah kahin aur hai. Sabse pehle{' '}
              <Link href="/calculators/free-sade-sati-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Sade Sati</Link>{' '}
              aur{' '}
              <Link href="/calculators/free-dasha-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Dasha</Link>{' '}
              dekhiye — vivah vilamb ka dosh aksar galti se Mangal par mad diya jaata hai.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Check' },
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
                { slug: 'free-kaal-sarp-dosh-calculator', name: 'Kaal Sarp Dosh' },
                { slug: 'free-pitra-dosh-calculator', name: 'Pitra Dosh' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
                { slug: 'free-rashi-calculator', name: 'Rashi Calculator' },
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
              <strong style={{ color: GOLD }}>Classical sources:</strong> Brihat Parashara Hora Shastra (BPHS) — Mangal bhaav placement and the six Manglik houses; classical Mangal Dosha bhanga (cancellation) conditions including own-sign, exaltation, mutual-Manglik and Guru/Chandra drishti rules; Swiss Ephemeris with Lahiri Ayanamsha for all planetary computation.
            </p>
            <p>
              Yeh page general shastriya framework hai. Rishta saamne ho to{' '}
              <Link href="/kundali-milan" className="underline underline-offset-2" style={{ color: GOLD }}>Kundali Milan</Link>{' '}
              dono kundaliyan ek saath dekhta hai, aur saare options{' '}
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
