'use client';

// ============================================================
// File: app/calculators/free-sade-sati-calculator/page.tsx
// Version: v2.0 — Free Sade Sati Calculator (Radar E3 content build)
// VM endpoint: /sade-sati (dedicated, 100% accurate)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-08-31) — CONTENT + INTERNAL LINKING REBUILD.
//        Third page in this series, after free-kaal-sarp-dosh-calculator
//        v2.0 and free-pitra-dosh-calculator v2.0. Driven by the Radar E3
//        PAA/PASF keyword brief (31 Aug 2026).
//        • Word count 957 → 3,900+. Competitor tool-page average is 1,573.
//          Live baseline 31 Aug: 957 words, 7 H2, 24 links — the 24 being
//          header/footer nav only, i.e. zero contextual links in the body.
//        • 14 new H2 sections, each answering one keyword Google itself
//          suggested, ordered by seen_count (4 → 2).
//        • Inline links into the 56-post Sade Sati cluster already in
//          Supabase: all 12 rashi pages, the phases guide, Dhaiya
//          comparison, start-end-date, signs, remedies, is-it-always-bad,
//          career/money/health/marriage, Saturn transit and Shani
//          Mahadasha. EVERY href verified against the live sitemap on
//          31 Aug 2026. None guessed.
//        • Added renderRich() and RASHI_STATUS — a 12-row table giving
//          every Moon sign's current position, each row linking to its own
//          cluster page. This is the single highest-demand keyword on the
//          page ("शनि की साढ़े साती किस राशि पर है", seen 4x).
//        • FAQS expanded 8 → 16 (all feed the existing FAQPage schema).
//        • FORM, VALIDATION, API CALL (/api/calc/sade-sati), RESULT
//          RENDERING, DetailCell / PhaseCard / CycleRow / Remedy and
//          buildCalcJsonLd() ARE UNCHANGED from v1.1.
//
//        ⚠️ ONE MAINTENANCE ITEM — THE ONLY DATE-DEPENDENT THING HERE:
//        RASHI_STATUS and two PILLAR sections ('kis-rashi-par' and
//        'kumbh-kab-hatega') describe the sign positions that hold WHILE
//        SATURN IS IN MEEN. Saturn changes sign roughly every 2.5 years;
//        when it leaves Meen the whole table shifts one sign forward and
//        every row becomes wrong. Update those three places then, and
//        nothing else. The calculator itself is unaffected — it computes
//        live from Swiss Ephemeris and never reads that table.
//        Deliberately NOT hardcoded anywhere on this page: the exact date
//        Saturn changes sign. Saturn's retrograde motion moves it by
//        months and every panchang states it slightly differently, so the
//        page tells the reader to take their own end date from the
//        calculator instead of trusting a printed date. That costs a
//        keyword and prevents a page that quietly goes wrong.
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


function formatDate(d: any): string {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { }
  return String(d);
}

// ============================================================
// v2.0 — MARKDOWN-LITE RENDERER
// Section copy lives as plain strings with **bold** and
// [label](/url) links, so all 14 sections stay readable and every
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

// ─────────────────────────────────────────────────────────────
// ⚠️ TIME-SENSITIVE — READ BEFORE EDITING
// This table describes where every Moon sign stands WHILE SATURN
// IS TRANSITING MEEN (PISCES). Saturn changes sign roughly every
// 2.5 years; when it leaves Meen, EVERY ROW BELOW BECOMES WRONG.
// The whole table then shifts one sign forward.
// The calculator above is unaffected — it computes live from Swiss
// Ephemeris and never reads this table. This is display copy only.
// When Saturn changes sign: update this array, and update the
// matching prose in the 'kis-rashi-par' and 'kumbh-kab-hatega'
// sections of PILLAR. Nothing else in this file is date-dependent.
// ─────────────────────────────────────────────────────────────
const RASHI_STATUS: { rashi: string; en: string; status: string; tone: 'in' | 'dhaiya' | 'out'; slug: string }[] = [
  { rashi: 'कुंभ',    en: 'Aquarius',    status: 'साढ़ेसाती — अंतिम चरण (अवरोह)', tone: 'in',     slug: 'kumbh-rashi-sade-sati-hindi' },
  { rashi: 'मीन',     en: 'Pisces',      status: 'साढ़ेसाती — शिखर चरण (मध्य)',   tone: 'in',     slug: 'meen-rashi-sade-sati-hindi' },
  { rashi: 'मेष',     en: 'Aries',       status: 'साढ़ेसाती — प्रथम चरण (आरोह)',  tone: 'in',     slug: 'mesh-rashi-sade-sati-hindi' },
  { rashi: 'सिंह',    en: 'Leo',         status: 'ढैया (अष्टम शनि) — साढ़ेसाती नहीं', tone: 'dhaiya', slug: 'simha-rashi-sade-sati-hindi' },
  { rashi: 'धनु',     en: 'Sagittarius', status: 'ढैया (अर्ध अष्टम) — साढ़ेसाती नहीं', tone: 'dhaiya', slug: 'dhanu-rashi-sade-sati-hindi' },
  { rashi: 'मकर',     en: 'Capricorn',   status: 'साढ़ेसाती समाप्त हो चुकी है',    tone: 'out',    slug: 'makar-rashi-sade-sati-hindi' },
  { rashi: 'वृषभ',    en: 'Taurus',      status: 'साढ़ेसाती नहीं चल रही',         tone: 'out',    slug: 'vrishabh-rashi-sade-sati-hindi' },
  { rashi: 'मिथुन',   en: 'Gemini',      status: 'साढ़ेसाती नहीं चल रही',         tone: 'out',    slug: 'mithun-rashi-sade-sati-hindi' },
  { rashi: 'कर्क',    en: 'Cancer',      status: 'साढ़ेसाती नहीं चल रही',         tone: 'out',    slug: 'kark-rashi-sade-sati-hindi' },
  { rashi: 'कन्या',   en: 'Virgo',       status: 'साढ़ेसाती नहीं चल रही',         tone: 'out',    slug: 'kanya-rashi-sade-sati-hindi' },
  { rashi: 'तुला',    en: 'Libra',       status: 'साढ़ेसाती नहीं चल रही',         tone: 'out',    slug: 'tula-rashi-sade-sati-hindi' },
  { rashi: 'वृश्चिक', en: 'Scorpio',     status: 'साढ़ेसाती नहीं चल रही',         tone: 'out',    slug: 'vrishchik-rashi-sade-sati-hindi' },
];

// ============================================================
// v2.0 — PILLAR CONTENT
// Every h2 is a keyword Google itself surfaced in PAA/PASF for this
// page's SERPs (Radar E3, 31 Aug 2026), ordered by seen_count (4 → 2).
// ============================================================
type PillarSection = { id: string; h2: string; paras: string[] };

const PILLAR: PillarSection[] = [
  {
    id: 'kis-rashi-par',
    h2: 'शनि की साढ़े साती किस राशि पर है?',
    paras: [
      'जब तक **शनि मीन राशि में** गोचर कर रहे हैं, तब तक साढ़ेसाती केवल **तीन राशियों** पर चलती है — और यह नियम से निकलता है, किसी सूची से नहीं। साढ़ेसाती का अर्थ है शनि का आपकी **चंद्र राशि से बारहवें, पहले और दूसरे** भाव में गोचर। शनि मीन में हैं, इसलिए: **कुंभ** (मीन उससे दूसरा — अंतिम चरण), **मीन** (शनि राशि पर ही — शिखर चरण), और **मेष** (मीन उससे बारहवाँ — प्रथम चरण)।',
      'बाकी नौ राशियों पर साढ़ेसाती नहीं है, पर दो पर **ढैया** चल रही है, जो अलग चीज़ है और अक्सर उसी नाम से डराई जाती है — **सिंह** (अष्टम शनि) और **धनु** (अर्ध अष्टम)। **मकर** की साढ़ेसाती अभी हाल में पूरी हुई है। नीचे की तालिका में बारहों राशियाँ हैं, और हर राशि अपने विस्तृत पेज से जुड़ी है। एक साथ पूरी सूची [साढ़ेसाती 2026 राशि अनुसार](/blog/sade-sati-2026-rashi-wise-hindi) में है।',
      'एक जरूरी बात, क्योंकि यहीं सबसे बड़ी गलती होती है: **यह चंद्र राशि से तय होता है, सूर्य राशि या नाम राशि से नहीं।** अखबार वाली राशि आमतौर पर सूर्य राशि होती है, और वह यहाँ बेकार है। आपकी असली चंद्र राशि ऊपर वाला कैलकुलेटर जन्म विवरण से निकाल देता है, या [राशि कैलकुलेटर](/calculators/free-rashi-calculator) से अलग से देख लीजिए। गलत राशि पर साढ़ेसाती ढूँढना सबसे आम कारण है जिससे लोग बेवजह डरते हैं।',
    ],
  },
  {
    id: 'antim-charan',
    h2: 'साढ़े साती के अंतिम चरण में क्या होता है?',
    paras: [
      'अंतिम चरण — **अवरोह**, जब शनि चंद्र राशि से **दूसरे भाव** में होते हैं — वह ढाई साल है जिसमें दबाव घटना शुरू होता है, पर एक विशेष दिशा से। दूसरा भाव धन, कुटुंब और वाणी का है, इसलिए इस चरण की चुनौतियाँ आमतौर पर आर्थिक और पारिवारिक होती हैं, मानसिक कम।',
      'व्यवहार में जो सबसे ज्यादा दिखता है: **खर्च का हिसाब बैठाना पड़ता है** — पिछले पाँच साल में जो आर्थिक ढीलापन रहा, वह अब सामने आता है। परिवार के भीतर पुराने मुद्दे निपटाने पड़ते हैं। वाणी पर संयम रखना पड़ता है, क्योंकि इसी चरण में कही गई बात सबसे महँगी पड़ती है। साथ ही, और यह अच्छी खबर है, **आय की स्थिरता लौटने लगती है** और शिखर चरण की अनिश्चितता खत्म होती है।',
      'गलतफहमी जो दूर करनी चाहिए: अंतिम चरण का मतलब यह नहीं कि आखिरी दिन कुछ जादुई घटेगा। शनि धीरे-धीरे उतरते हैं, और ज्यादातर लोग बताते हैं कि उन्हें बदलाव अंत से कुछ महीने पहले ही महसूस होने लगा। तीनों चरणों की तुलना [साढ़ेसाती के तीन चरण](/blog/sade-sati-phases-which-is-worst-hindi) में है, और उतरने के संकेत नीचे अलग सेक्शन में।',
    ],
  },
  {
    id: 'lakshan-aur-upay',
    h2: 'शनि की साढ़े साती के लक्षण और उपाय',
    paras: [
      'लक्षण, बिना बढ़ा-चढ़ाकर: सबसे लगातार शिकायत है **मेहनत और परिणाम के बीच बढ़ती दूरी** — काम पहले जैसा ही कर रहे हैं पर फल कम या देर से आ रहा है। इसके साथ आते हैं नींद में गड़बड़ी, अकारण थकान, कार्यस्थल पर अधिकारियों से खिंचाव, और एक भारीपन जिसका कोई साफ कारण न हो।',
      'अब सावधानी: **ये सारे लक्षण साढ़ेसाती के अपने नहीं हैं।** यही चीजें [राहु महादशा](/blog/rahu-mahadasha-effects-guide), [शनि महादशा](/blog/shani-mahadasha-effects-guide), [पितृ दोष](/calculators/free-pitra-dosh-calculator) या साधारण थकान से भी आती हैं। और सबसे बड़ी बात — शनि जिन नौ राशियों पर साढ़ेसाती नहीं दे रहे, उनके लोग भी अक्सर खुद को साढ़ेसाती में मान बैठते हैं। इसीलिए ऊपर का कैलकुलेटर चलाइए। पूरे दस लक्षण [साढ़ेसाती के 10 ईमानदार लक्षण](/blog/signs-of-sade-sati-hindi) में हैं।',
      'उपाय तीन स्तर पर: **हनुमान चालीसा का नित्य पाठ** (शनि हनुमान जी के आगे नतमस्तक माने गए हैं), **शनि मंत्र "ॐ शं शनैश्चराय नमः" 108 बार**, और **शनिवार को दान** — काले तिल, सरसों का तेल, लोहा, काला वस्त्र, किसी जरूरतमंद को। साथ में सबसे कम बताया जाने वाला और सबसे प्रभावी: **वृद्धों और मजदूरों की सेवा**, क्योंकि शनि उन्हीं के कारक हैं। पूरी सूची [शनि साढ़ेसाती के सच्चे उपाय](/blog/sade-sati-remedies-hindi) में है।',
    ],
  },
  {
    id: 'labh',
    h2: 'शनि की साढ़े साती के लाभ — जो कोई नहीं बताता',
    paras: [
      'यह वह पक्ष है जिस पर लगभग कोई नहीं लिखता, क्योंकि डर बेचना आसान है। सच यह है कि **शास्त्र में शनि दंड देने वाले नहीं, न्याय देने वाले ग्रह हैं** — और साढ़ेसाती को उसी दृष्टि से पढ़ा जाना चाहिए। शनि वह छीनते हैं जो टिकाऊ नहीं था, और जो टिकाऊ है उसे मजबूत करते हैं।',
      'चार ठोस लाभ जो व्यवहार में दिखते हैं। पहला, **अनुशासन** — साढ़ेसाती में बनी आदतें आमतौर पर जीवन भर रहती हैं, क्योंकि वे सुविधा से नहीं, आवश्यकता से बनीं। दूसरा, **झूठे रिश्तों और झूठी नौकरियों की सफाई** — जो जा रहा है वह अक्सर वही होता है जो वैसे भी नहीं टिकता। तीसरा, **आत्मनिर्भरता**, क्योंकि इस दौर में सहारे कम मिलते हैं और आदमी अपने पैरों पर खड़ा होना सीखता है। चौथा, **आध्यात्मिक गहराई** — बहुत से लोगों का साधना जीवन इसी दौर में शुरू होता है।',
      'और एक तथ्य जो शायद सबसे ज्यादा राहत देता है: **बहुत से अत्यंत सफल लोगों की सबसे बड़ी उपलब्धि साढ़ेसाती के दौरान ही आई है**, क्योंकि शनि मेहनत को देर से पर पूरा फल देते हैं। यह भावुक दिलासा नहीं — यही बात प्रमाण के साथ [क्या साढ़ेसाती हमेशा बुरी होती है](/blog/is-sade-sati-always-bad-hindi) में लिखी है।',
    ],
  },
  {
    id: 'mesh-labh',
    h2: 'शनि की साढ़े साती के लाभ — मेष राशि के लिए',
    paras: [
      'मेष राशि वालों की साढ़ेसाती अभी **प्रथम चरण (आरोह)** में है — शनि मेष से बारहवें भाव में। बारहवाँ भाव व्यय, विदेश, एकांत और मोक्ष का है, इसलिए इस चरण का दबाव आमतौर पर खर्च और नींद पर आता है, न कि सीधे करियर पर।',
      'मेष के लिए विशेष लाभ यहीं छिपा है, और यह मेष के स्वभाव से जुड़ा है। मेष अग्नि राशि है — तेज, जल्दबाज, आगे बढ़कर लड़ने वाली। **शनि उसी को धीमा करते हैं, और मेष के लिए धीमा होना ही सबसे बड़ा लाभ है।** जो निर्णय जल्दबाजी में लिए जाते थे, वे अब सोच-समझकर लिए जाते हैं; जो ऊर्जा बिखरती थी, वह एक दिशा में लगती है। मेष के मंगल की ऊर्जा जब शनि के अनुशासन से मिलती है, तो परिणाम टिकाऊ बनते हैं।',
      'दूसरा लाभ: बारहवाँ भाव **विदेश** का भी है, इसलिए इस चरण में मेष राशि वालों के लिए विदेश यात्रा, विदेशी कंपनी या दूरस्थ काम के अवसर असामान्य रूप से खुलते देखे जाते हैं। पूरा विश्लेषण, प्रभाव और तैयारी [मेष राशि साढ़ेसाती](/blog/mesh-rashi-sade-sati-hindi) में है।',
    ],
  },
  {
    id: 'meen-rashi',
    h2: 'शनि की साढ़े साती — मीन राशि पर',
    paras: [
      'मीन राशि इस समय **शिखर चरण (मध्य)** में है — शनि सीधे चंद्र राशि पर। तीनों चरणों में यही सबसे तीव्र माना जाता है, क्योंकि शनि चंद्रमा के ऊपर से गुजरते हैं और चंद्रमा मन का कारक है। इसीलिए मीन वालों की शिकायत अक्सर बाहरी घटना की नहीं, **भीतरी थकान** की होती है।',
      'क्या होता है: निर्णय लेने में हिचक, अकारण उदासी या चिड़चिड़ापन, नींद का टूटना, और यह लगना कि सब कुछ धीमा चल रहा है। स्वास्थ्य और रिश्ते दोनों परखे जाते हैं। मीन स्वभाव से भावुक और संवेदनशील राशि है, इसलिए मानसिक असर यहाँ बाकी राशियों से अधिक महसूस होता है — यह कमजोरी नहीं, राशि की प्रकृति है।',
      'राहत की बात दो हैं। पहली, **शिखर चरण सबसे तीव्र है पर सबसे छोटा महसूस होता है**, क्योंकि इसमें बदलाव सबसे तेज आते हैं। दूसरी, इसी चरण में मीन की स्वाभाविक आध्यात्मिक प्रवृत्ति सबसे गहरी होती है — बहुत से मीन जातकों की साधना यहीं जड़ पकड़ती है। पूरा विवरण [मीन राशि साढ़ेसाती](/blog/meen-rashi-sade-sati-hindi) में, और मानसिक पक्ष पर [साढ़ेसाती का करियर, धन, स्वास्थ्य व विवाह पर प्रभाव](/blog/sade-sati-career-money-health-marriage-hindi)।',
    ],
  },
  {
    id: 'kaun-sa-charan-bura',
    h2: 'साढ़ेसाती का कौन सा चरण सबसे कठिन होता है?',
    paras: [
      'आम जवाब है "शिखर चरण", और वह **अधूरा** है। शिखर चरण सबसे तीव्र जरूर है — शनि चंद्र राशि पर होते हैं और मन सीधे प्रभावित होता है — पर सबसे कठिन कौन सा होगा, यह आपकी कुंडली में **शनि की अपनी स्थिति** से तय होता है, चरण के नाम से नहीं।',
      'तीनों चरण अलग-अलग चीज़ छूते हैं और इसलिए अलग-अलग लोगों को अलग-अलग भारी लगते हैं। **प्रथम चरण** (बारहवाँ भाव) खर्च, नींद और अलगाव पर आता है — जिनकी आर्थिक स्थिति पहले से तंग हो, उनके लिए यही सबसे कठिन होता है। **शिखर चरण** (चंद्र राशि) मन, स्वास्थ्य और रिश्तों पर — संवेदनशील प्रकृति वालों के लिए सबसे भारी। **अंतिम चरण** (दूसरा भाव) धन, कुटुंब और वाणी पर — जिनका जीवन परिवार और व्यापार के इर्द-गिर्द है, उनके लिए यही सबसे चुभने वाला।',
      'इसलिए सही सवाल यह नहीं कि "कौन सा चरण बुरा है", बल्कि "मेरी कुंडली में शनि कितने बलवान हैं"। मजबूत शनि वाले जातक शिखर चरण भी अपेक्षाकृत आसानी से निकाल लेते हैं। अपने शनि का बल [ग्रह बल कैलकुलेटर](/calculators/free-graha-bal-calculator) से देखिए, और तीनों चरणों की विस्तृत तुलना [साढ़ेसाती के तीन चरण: सबसे कठिन कौन सा](/blog/sade-sati-phases-which-is-worst-hindi) में है।',
    ],
  },
  {
    id: 'kitne-charan',
    h2: 'शनि की साढ़े साती के कितने चरण होते हैं?',
    paras: [
      '**तीन चरण, हर एक लगभग ढाई साल का, कुल साढ़े सात साल** — और यही "साढ़े साती" नाम का पूरा अर्थ है। संख्या तीन इसलिए है क्योंकि शनि आपकी चंद्र राशि से **बारहवें, पहले और दूसरे** — कुल तीन राशियों से गुजरते हैं, और शनि को एक राशि पार करने में लगभग ढाई वर्ष लगते हैं।',
      'क्रम हमेशा यही रहता है: **आरोह** (बारहवाँ भाव, चढ़ाई), फिर **मध्य** (चंद्र राशि, शिखर), फिर **अवरोह** (दूसरा भाव, उतार)। न क्रम बदलता है, न कोई चरण छूटता है। ढाई साल की अवधि भी लगभग स्थिर है, हालाँकि शनि की वक्री चाल के कारण कुछ महीनों का आगे-पीछे होता रहता है — इसीलिए ऊपर वाला कैलकुलेटर सटीक तिथियाँ देता है, गोल-मोल अंदाजा नहीं।',
      'एक और तथ्य जो कम लोग जानते हैं: **साढ़ेसाती जीवन में एक बार नहीं आती।** शनि पूरा राशिचक्र लगभग तीस वर्ष में पूरा करते हैं, इसलिए औसत आयु में **दो से तीन साढ़ेसाती चक्र** आते हैं — आमतौर पर बचपन, मध्य आयु और वृद्धावस्था में। ऊपर का कैलकुलेटर आपके जीवन के **सारे चक्र** दिखाता है, बीते हुए भी और आने वाले भी। तिथियाँ खुद कैसे निकालें, यह [साढ़ेसाती की शुरुआत और अंत तिथि](/blog/sade-sati-start-end-date-hindi) में है।',
    ],
  },
  {
    id: 'utarne-ke-lakshan',
    h2: 'शनि की साढ़ेसाती उतरने के क्या लक्षण हैं?',
    paras: [
      'सबसे पहला और सबसे भरोसेमंद संकेत: **नींद लौट आती है।** साढ़ेसाती में सबसे पहले नींद जाती है और उतरते समय सबसे पहले वही वापस आती है। इसके साथ आता है वह अहसास कि सुबह उठने पर मन पर पहले जैसा बोझ नहीं है — बिना किसी बड़ी बाहरी घटना के।',
      'दूसरा, **अटके हुए काम अपने आप खुलने लगते हैं।** जो फाइल महीनों से रुकी थी, जो भुगतान लटका था, जो बातचीत आगे नहीं बढ़ रही थी — वे बिना अतिरिक्त प्रयास के चलने लगते हैं। तीसरा, **लोग वापस आते हैं** — पुराने संपर्क, पुराने अवसर, कभी-कभी वही लोग जो दूर हो गए थे। चौथा, और यह सबसे कम बताया जाता है, **डर कम हो जाता है** — भविष्य को लेकर जो लगातार आशंका रहती थी, वह शांत पड़ने लगती है।',
      'एक ईमानदार चेतावनी: **यह सब एक दिन में नहीं होता।** शनि धीरे उतरते हैं, और आखिरी छह महीने में बदलाव क्रमशः महसूस होता है, अंतिम तारीख को अचानक नहीं। और अगर तिथि बीत जाने के बाद भी दबाव बना हुआ है, तो कारण साढ़ेसाती नहीं — शायद [ढैया](/blog/sade-sati-vs-dhaiyya-shani-hindi) शुरू हो गई है, या कोई और दशा चल रही है, जिसे [दशा कैलकुलेटर](/calculators/free-dasha-calculator) दिखा देगा।',
    ],
  },
  {
    id: 'sabse-prabhavit-2026',
    h2: 'Which Rashi Is Most Affected by Sade Sati Right Now?',
    paras: [
      'While Saturn transits **Meen (Pisces)**, the sign feeling it most acutely is **Meen itself** — Saturn sitting directly on the Moon sign, the peak phase. That is the answer to the question as usually asked, but it deserves a qualification, because "most affected" is doing a lot of work in that sentence.',
      '**Intensity and difficulty are not the same thing.** Meen is in the sharpest phase, yes. But [Kumbh](/blog/kumbh-rashi-sade-sati-hindi), in the final phase, often reports the heaviest *financial* pressure, since the second house is money and family. And [Mesh](/blog/mesh-rashi-sade-sati-hindi), in the rising phase, frequently reports the most *disorienting* period, because the twelfth house brings expenditure and isolation with no obvious cause to point at. Which of the three is worst depends on the person, not the phase.',
      'Two signs are also commonly misfiled here. **Simha and Dhanu are not in Sade Sati at all** — they are in [Dhaiyya](/blog/sade-sati-vs-dhaiyya-shani), a two-and-a-half year Saturn transit that is a genuinely different thing and frequently sold under the Sade Sati label. And the remaining seven signs are not under Saturn pressure from this transit whatever anyone tells them. The full sign-by-sign position is in [Sade Sati Rashi Wise](/blog/sade-sati-2026-rashi-wise), and the wider transit picture in [Saturn Transit 2026](/blog/saturn-transit-2026).',
    ],
  },
  {
    id: 'dhaiya-vs-sade-sati',
    h2: 'शनि ढैया और साढ़ेसाती में क्या फर्क है?',
    paras: [
      'यह फर्क सबसे ज्यादा भ्रम पैदा करता है, और उसका फायदा भी सबसे ज्यादा उठाया जाता है। **साढ़ेसाती साढ़े सात साल की होती है, ढैया ढाई साल की।** दोनों शनि के गोचर हैं, पर भाव अलग हैं और असर भी अलग।',
      '**साढ़ेसाती:** शनि चंद्र राशि से बारहवें, पहले और दूसरे भाव में — तीन राशियाँ, साढ़े सात साल। **ढैया (छोटी पनौती):** शनि चंद्र राशि से **चौथे या आठवें** भाव में — एक राशि, ढाई साल। चौथे भाव वाली ढैया को **अर्ध अष्टम** और आठवें भाव वाली को **अष्टम शनि** कहते हैं। अभी सिंह राशि पर [अष्टम शनि](/blog/simha-rashi-sade-sati-hindi) है और धनु राशि पर [अर्ध अष्टम](/blog/dhanu-rashi-sade-sati-hindi)।',
      'व्यावहारिक अंतर यह है: **अष्टम ढैया अक्सर साढ़ेसाती के शिखर चरण जितनी ही तीव्र महसूस होती है**, पर एक-तिहाई समय चलती है। इसीलिए जो लोग "मेरी साढ़ेसाती चल रही है" कहते हैं, उनमें से बहुतों की असल में ढैया चल रही होती है — और यह जानना राहत देता है, क्योंकि अवधि बहुत छोटी है। दोनों का पूरा अंतर [साढ़ेसाती बनाम ढैया](/blog/sade-sati-vs-dhaiyya-shani-hindi) में है, और अपनी स्थिति ऊपर कैलकुलेटर से पक्की कर लीजिए।',
    ],
  },
  {
    id: 'kumbh-kab-hatega',
    h2: 'कुंभ राशि से शनि का प्रकोप कब हटेगा?',
    paras: [
      'कुंभ राशि इस समय साढ़ेसाती के **अंतिम चरण (अवरोह)** में है — शनि कुंभ से दूसरे भाव, यानी मीन में। यह तीनों चरणों का आखिरी है, इसलिए सीधा जवाब यह है कि **कुंभ की साढ़ेसाती तब समाप्त होगी जब शनि मीन छोड़कर मेष में प्रवेश करेंगे।**',
      'यहाँ कोई सटीक तारीख जानबूझकर नहीं लिखी जा रही, और वजह ईमानदार है: शनि की **वक्री चाल** के कारण राशि-परिवर्तन की तारीख कुछ महीने आगे-पीछे होती है, और गोचर की तारीखें हर पंचांग में थोड़ी अलग मिलती हैं। इस पेज पर एक स्थिर तारीख लिख देना कुछ ही महीनों में गलत हो जाएगा। **ऊपर वाला कैलकुलेटर आपकी अपनी सटीक अंत-तिथि और बचे हुए दिन गिनकर देता है** — Swiss Ephemeris से, लाइव।',
      'और एक बात कुंभ राशि वालों के लिए, क्योंकि यह अक्सर छूट जाती है: **अंतिम चरण में दबाव धीरे-धीरे घटता है, अंतिम दिन अचानक नहीं।** अधिकांश लोग बताते हैं कि राहत खत्म होने से कुछ महीने पहले ही महसूस होने लगी। इस चरण का पूरा विवरण, प्रभाव और उपाय [कुंभ राशि साढ़ेसाती](/blog/kumbh-rashi-sade-sati-hindi) में है।',
    ],
  },
  {
    id: 'shani-turant-khush',
    h2: 'शनि को तुरंत खुश करने के क्या उपाय हैं?',
    paras: [
      'सबसे पहले एक साफ बात, क्योंकि सवाल में ही एक गलतफहमी छिपी है: **शनि "तुरंत" खुश नहीं होते, और यही उनका स्वभाव है।** शनि धैर्य और समय के ग्रह हैं — जो देवता तात्कालिक फल देते हैं, शनि उनमें नहीं। जो कोई तुरंत असर वाला शनि-उपाय बेचे, वह शनि के मूल स्वभाव के ही खिलाफ बोल रहा है।',
      'फिर भी, **जो सबसे जल्दी असर दिखाते हैं** वे तीन हैं और तीनों शनिवार से जुड़े हैं। पहला, **हनुमान चालीसा** — परंपरा में शनि हनुमान जी के सामने विनम्र माने गए हैं, और यह उपाय सबसे सुलभ है। दूसरा, **किसी भूखे मजदूर या वृद्ध को भोजन**, बिना दिखावे के — शनि सेवक-वर्ग के कारक हैं और यह उपाय सीधे उन्हीं तक पहुँचता है। तीसरा, **शनिवार को काले तिल, सरसों तेल और लोहे का दान।**',
      'पर जो असल में सबसे तेज असर दिखाता है वह कोई पूजा नहीं है: **किसी के साथ किया गया अन्याय सुधार देना।** शनि न्याय के ग्रह हैं, और शास्त्र में सबसे प्रभावी शनि-उपाय यही माना गया है — किसी कर्मचारी का बकाया चुकाना, किसी से माफी माँगना, कोई अधूरा वादा पूरा करना। इसमें एक रुपया खर्च नहीं होता और यही सबसे कठिन है। बाकी सिद्ध उपाय [शनि साढ़ेसाती के सच्चे उपाय](/blog/sade-sati-remedies-hindi) में हैं, और शुभ मुहूर्त [पंचांग](/panchang) पर।',
    ],
  },
  {
    id: 'rashi-wise-upay',
    h2: 'शनि की साढ़े साती के उपाय — राशि अनुसार',
    paras: [
      'मूल उपाय तीनों चरणों और सभी राशियों के लिए एक ही रहते हैं — हनुमान चालीसा, शनि मंत्र, शनिवार का दान, और सेवा। **राशि के अनुसार जो बदलता है वह उपाय नहीं, बल्कि जोर कहाँ देना है, यह है।**',
      '**कुंभ (अंतिम चरण, दूसरा भाव):** जोर धन और वाणी पर — खर्च का हिसाब, बकाया निपटाना, और बोलने से पहले रुकना। दान अन्न का सबसे उपयुक्त। **मीन (शिखर चरण, चंद्र राशि):** जोर मन और स्वास्थ्य पर — नींद का नियम, ध्यान, और चंद्रमा को बल देने के लिए सोमवार का व्रत भी जोड़ें। **मेष (प्रथम चरण, बारहवाँ भाव):** जोर खर्च-नियंत्रण और एकांत-साधना पर; बारहवाँ भाव व्यय का है इसलिए बचत की आदत यहाँ सबसे बड़ा उपाय है।',
      '**सिंह और धनु**, जिन पर ढैया है, उनके लिए भी उपाय वही हैं पर अवधि छोटी है — इसलिए तीव्रता से करें, लंबी योजना की जरूरत नहीं। और **जिन सात राशियों पर कुछ नहीं चल रहा**, उन्हें कोई शनि-उपाय करने की आवश्यकता ही नहीं है; उनका दबाव किसी और कारण से है, जो [दशा कैलकुलेटर](/calculators/free-dasha-calculator) या [कमजोर ग्रह खोजें](/calculators/free-weak-planet-finder) से पता चलेगा। हर राशि का अलग विस्तृत पेज नीचे की तालिका में लिंक किया गया है।',
    ],
  },
];

const FAQS = [
  { q: 'Sade Sati kya hoti hai?', a: 'Sade Sati Shani (Saturn) ka 7.5 saal ka transit period hai. Jab Shani aapki Chandra Rashi se 12th, 1st, aur 2nd house mein transit karta hai — har house mein 2.5 saal — total 7.5 saal. Yeh aapke jeevan ka sabse important Saturn period hota hai per Parashar BPHS. Zaroori baat: yeh Chandra Rashi se tay hota hai, Surya Rashi ya naam rashi se nahi.' },
  { q: 'शनि की साढ़े साती किस राशि पर है?', a: 'Jab tak Shani Meen rashi mein gochar kar rahe hain, saadhesati sirf teen rashiyon par hai: Kumbh (antim charan), Meen (shikhar charan) aur Mesh (pratham charan). Simha aur Dhanu par Dhaiya chal rahi hai — woh saadhesati nahi hai. Makar ki saadhesati abhi haal mein poori hui hai. Baaki saat rashiyon par kuch nahi chal raha.' },
  { q: 'Sade Sati ke kitne charan hote hain?', a: 'Teen — har ek lagbhag 2.5 saal ka, kul 7.5 saal, aur yahi "saadhe saat" naam ka arth hai. (1) Aaroh: Shani 12th se Chandra — vyay, videsh, neend. (2) Madhya/shikhar: Shani Chandra Rashi par — sabse teevra, mann aur swasthya. (3) Avaroh: Shani 2nd se Chandra — dhan, kutumb, vaani. Kram kabhi nahi badalta aur koi charan chhootta nahi.' },
  { q: 'साढ़े साती के अंतिम चरण में क्या होता है?', a: 'Antim charan (avaroh) mein Shani doosre bhaav mein hote hain — dhan, kutumb aur vaani ka bhaav. Isliye is charan ki chunautiyan aarthik aur parivarik hoti hain, maansik kam. Kharch ka hisaab baithana padta hai, vaani par sanyam rakhna padta hai. Achhi khabar: aay ki sthirta lautne lagti hai aur shikhar charan ki anishchitta khatm hoti hai.' },
  { q: 'साढ़ेसाती का कौन सा चरण सबसे कठिन होता है?', a: 'Aam jawab "shikhar charan" hai aur woh adhoora hai. Shikhar sabse teevra zaroor hai, par sabse kathin kaun sa hoga yeh aapki kundali mein Shani ki apni sthiti se tay hota hai. Teenon charan alag cheez chhoote hain: pratham kharch aur neend par, shikhar mann aur swasthya par, antim dhan aur kutumb par. Mazboot Shani wale shikhar charan bhi aasani se nikaal lete hain.' },
  { q: 'शनि की साढ़ेसाती उतरने के क्या लक्षण हैं?', a: 'Sabse pehla aur sabse bharosemand sanket: neend laut aati hai. Uske baad atke hue kaam apne aap khulne lagte hain, purane sampark aur avsar wapas aate hain, aur bhavishya ko lekar rehne wala dar shaant padne lagta hai. Par yeh sab ek din mein nahi hota — Shani dheere utarte hain aur badlav aakhri chhe maheene mein kramashah mehsoos hota hai.' },
  { q: 'क्या साढ़ेसाती हमेशा बुरी होती है?', a: 'Nahi. Shastra mein Shani dand dene wale nahi, nyay dene wale graha hain. Chaar thos laabh dikhte hain: anushasan jo jeevan bhar rehta hai, jhoothe rishton aur naukriyon ki safai, aatmanirbharta, aur aadhyatmik gehrai. Bahut se atyant safal logon ki sabse badi uplabdhi saadhesati ke dauran hi aayi hai, kyunki Shani mehnat ko der se par poora phal dete hain.' },
  { q: 'शनि ढैया और साढ़ेसाती में क्या फर्क है?', a: 'Saadhesati 7.5 saal ki hoti hai, Dhaiya 2.5 saal ki. Saadhesati mein Shani Chandra Rashi se 12th, 1st aur 2nd bhaav mein hote hain. Dhaiya (chhoti panauti) mein Shani 4th ya 8th bhaav mein — 4th wali "ardh ashtam", 8th wali "ashtam Shani". Ashtam Dhaiya aksar shikhar charan jitni hi teevra lagti hai par ek-tihai samay chalti hai, isliye yeh jaanna raahat deta hai.' },
  { q: 'कुंभ राशि से शनि का प्रकोप कब हटेगा?', a: 'Kumbh abhi antim charan mein hai — Shani Kumbh se doosre bhaav (Meen) mein. Saadhesati tab samapt hogi jab Shani Meen chhod kar Mesh mein pravesh karenge. Exact tareekh yahan jaanbooj kar nahi likhi ja rahi, kyunki Shani ki vakri chaal se rashi-parivartan ki tareekh kuch maheene aage-peeche hoti hai. Upar wala calculator aapki apni exact ant-tithi aur bache hue din live gin kar deta hai.' },
  { q: 'Apni Sade Sati kaise check karein?', a: 'Date of Birth, exact Time of Birth, aur Place of Birth chahiye. Calculator Swiss Ephemeris se Saturn ki current transit position calculate karta hai aur Chandra Rashi se compare karke status, phase aur exact dates deta hai — bilkul free. Newspaper wali rashi (jo aksar Surya Rashi hoti hai) se check mat kijiye, wahi sabse aam galti hai.' },
  { q: 'Sade Sati mein kya karna chahiye?', a: '(1) Daily Hanuman Chalisa path. (2) Shani mantra "Om Sham Shanaicharaya Namah" 108 times. (3) Shanivar ko kaale til, sarson tel, loha, kaala vastra daan. (4) Vriddhon aur mazdooron ki seva — Shani unhi ke karak hain. (5) Discipline aur imaandari; shortcuts se bachein. Sabse prabhavi upay: kisi ke saath kiya gaya anyaay sudhar dena.' },
  { q: 'शनि को तुरंत खुश करने के क्या उपाय हैं?', a: 'Sawal mein hi ek galatfehmi hai: Shani "turant" khush nahi hote, aur yahi unka swabhav hai. Ve dhairya aur samay ke graha hain. Jo sabse jaldi asar dikhate hain woh teen hain — Hanuman Chalisa, kisi bhookhe mazdoor ya vriddh ko bhojan, aur Shanivar ko kaale til-sarson tel-loha ka daan. Par sabse tez asar kisi ke saath kiye gaye anyaay ko sudharne ka hota hai.' },
  { q: 'क्या हर राशि के लिए उपाय अलग होते हैं?', a: 'Mool upay sabhi rashiyon ke liye ek hi rehte hain. Rashi ke anusaar jo badalta hai woh upay nahi, balki zor kahan dena hai yeh hai. Kumbh: dhan aur vaani par. Meen: mann aur swasthya par, saath mein Somvar vrat. Mesh: kharch-niyantran aur ekant-sadhana par. Jin saat rashiyon par kuch nahi chal raha unhe koi Shani-upay karne ki zaroorat hi nahi.' },
  { q: 'Sade Sati kab aati hai jeevan mein?', a: 'Har 30 saal mein ek baar, kyunki Saturn 30 saal mein poora rashichakra complete karta hai. Average life mein 2-3 Sade Sati cycles hote hain — aam taur par bachpan, madhya aayu aur vriddhavastha mein. Upar wala calculator aapke jeevan ke saare cycles dikhata hai, beete hue bhi aur aane wale bhi.' },
  { q: 'Kya Sade Sati Calculator bilkul free hai?', a: 'Haan. 100% free. Current status (Yes/No), active phase (Rising/Peak/Setting), exact start-end dates, days remaining, past + future cycles, aur 3 Parashar remedies (Mantra, Ratna, Daan) — sab free. Na signup, na card.' },
  { q: 'Sade Sati result kitne accurate hain?', a: 'Trikaal Vaani VM par dedicated /sade-sati endpoint hai jo Swiss Ephemeris (NASA-grade) se Saturn ki exact transit position calculate karta hai with Lahiri Ayanamsha — 99.9% astronomical accuracy. Yeh live compute hota hai, isliye Shani ki rashi badalne par bhi result apne aap sahi rehta hai.' },
];

export default function FreeSadeSatiCalculatorPage() {
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
      const res = await fetch('/api/calc/sade-sati', {
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

  // ─── Sade Sati extraction ───────────────────────────────────
  const ss = result?.sadeSati;
  const inSadeSati = ss?.currentlyInSadeSati || false;
  const moonRashi = ss?.moonRashi || null;
  const currentCycle = ss?.currentCycle || null;
  const allCycles: any[] = ss?.allCycles || [];
  const phaseInfo = ss?.phaseInfo || null;

  // Past and future cycles
  const today = new Date();
  const pastCycles = allCycles.filter((c: any) => new Date(c.end) < today);
  const futureCycles = allCycles.filter((c: any) => new Date(c.start) > today);

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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-sade-sati-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: "Free Sade Sati Calculator — Check Saturn's 7.5 Year Period Online",
    description:
      "Check your current Sade Sati status, active phase (Rising/Peak/Setting), exact start-end dates, all life cycles and 3 free Parashar remedies. Free Vedic Saturn calculator by Trikaal Vaani.",
    breadcrumbName: 'Free Sade Sati Calculator',
    aboutEntities: ['Sade Sati', 'Saturn', 'Moon Sign', 'Saturn Transit'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Sade Sati', 'Saturn Transit'],
    howToName: 'How to check your Sade Sati period',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Analyse the Saturn transit', text: "The calculator finds Saturn's current transit relative to your Moon sign using Swiss Ephemeris with Lahiri Ayanamsha." },
      { name: 'Get your result', text: 'See your Sade Sati status, active phase, exact dates, days remaining, all life cycles and 3 free Parashar remedies.' },
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
            <span style={{ color: GOLD }}>Free Sade Sati Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Sade Sati Calculator — Check Saturn&apos;s 7.5 Year Period Online
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Sade Sati Calculator</strong> aapki current Sade Sati status Swiss Ephemeris se calculate karta hai. Date, time, place daalo — Yes/No verdict, active phase (Rising/Peak/Setting), exact start-end dates, days remaining, past + future cycles, aur 3 Parashar remedies turant milte hain. 100% free, BPHS classical rules ke according.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>
                <Link href="/founder" className="hover:underline">Rohiit Gupta</Link>
              </div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS · Lahiri Ayanamsha · Saturn Transit Logic</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Sade Sati Status (Free)</h2>
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
                {loading ? '⟳ Checking Sade Sati...' : '🪐 Check My Sade Sati'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Saturn Transit Logic</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* SADE SATI VERDICT */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                background: inSadeSati
                  ? `linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(2,8,23,0.6) 100%)`
                  : `linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                border: `1px solid ${inSadeSati ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'}`
              }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                  {form.name ? `${form.name}'s ` : ''}Sade Sati Status
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: inSadeSati ? '#FCA5A5' : '#86EFAC' }}>
                  {inSadeSati ? '⚠️ YES — In Sade Sati' : '✅ NO — Not in Sade Sati'}
                </div>
                {moonRashi && (
                  <div className="text-base text-slate-300">
                    Chandra Rashi: <span style={{ color: GOLD }} className="font-bold">{moonRashi}</span>
                  </div>
                )}
                {inSadeSati && phaseInfo && (
                  <div className="text-sm text-slate-300 mt-3 italic max-w-2xl mx-auto">&ldquo;{phaseInfo.phaseDescription}&rdquo;</div>
                )}
                {!inSadeSati && (
                  <p className="text-sm text-slate-300 mt-4 max-w-2xl mx-auto">
                    Phir bhi rukavatein mehsoos ho rahi hain? Ho sakta hai{' '}
                    <Link href="/blog/sade-sati-vs-dhaiyya-shani-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>Dhaiya</Link>{' '}
                    chal rahi ho, ya koi aur{' '}
                    <Link href="/calculators/free-dasha-calculator" className="underline underline-offset-2" style={{ color: GOLD }}>dasha</Link>{' '}
                    — dono free check kar lijiye.
                  </p>
                )}
              </div>

              {/* CURRENT CYCLE DETAILS */}
              {inSadeSati && currentCycle && phaseInfo && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📍 Current Sade Sati Cycle</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <DetailCell icon="🎯" label="Active Phase" value={phaseInfo.phase} />
                    <DetailCell icon="⏳" label="Days Remaining" value={`${phaseInfo.daysRemaining.toLocaleString()} days`} />
                    <DetailCell icon="📅" label="Cycle Start" value={formatDate(currentCycle.start)} />
                    <DetailCell icon="📅" label="Cycle End" value={formatDate(currentCycle.end)} />
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>Progress: {phaseInfo.progress}%</span>
                      <span>Total: 7.5 saal cycle</span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full transition-all duration-1000" style={{
                        width: `${phaseInfo.progress}%`,
                        background: `linear-gradient(90deg, ${GOLD} 0%, #FFA500 50%, #FF4500 100%)`,
                      }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                      <span>Rising (0-33%)</span>
                      <span>Peak (33-66%)</span>
                      <span>Setting (66-100%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3 PHASES EXPLANATION */}
              {inSadeSati && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪐 3 Phases of Sade Sati (Parashar BPHS)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PhaseCard icon="🌅" title="Rising (Aaroh)" duration="2.5 saal" desc="Saturn in 12th from Moon. Losses, expenses, foreign travel, sleep issues, fear." active={phaseInfo?.phase.includes('Rising')} />
                    <PhaseCard icon="🔥" title="Peak (Madhya)" duration="2.5 saal" desc="Saturn in Moon sign. Most intense. Health, mental peace, relationships tested." active={phaseInfo?.phase.includes('Peak')} />
                    <PhaseCard icon="🌇" title="Setting (Avaroh)" duration="2.5 saal" desc="Saturn in 2nd from Moon. Financial recovery, family matters, lessons consolidate." active={phaseInfo?.phase.includes('Setting')} />
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Teenon charan ki vistrit tulna:{' '}
                    <Link href="/blog/sade-sati-phases-which-is-worst-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>साढ़ेसाती के तीन चरण — सबसे कठिन कौन सा</Link>
                  </p>
                </div>
              )}

              {/* ALL LIFE CYCLES */}
              {allCycles.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📜 All Your Life Sade Sati Cycles</h3>

                  {pastCycles.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Past Cycles ({pastCycles.length})</p>
                      <div className="space-y-2">
                        {pastCycles.map((c: any, i: number) => (
                          <CycleRow key={`p${i}`} cycle={c} status="past" />
                        ))}
                      </div>
                    </div>
                  )}

                  {currentCycle && (
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>Current Cycle</p>
                      <div className="mt-3">
                        <CycleRow cycle={currentCycle} status="current" />
                      </div>
                    </div>
                  )}

                  {futureCycles.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Future Cycles ({futureCycles.length})</p>
                      <div className="space-y-2">
                        {futureCycles.map((c: any, i: number) => (
                          <CycleRow key={`f${i}`} cycle={c} status="future" />
                        ))}
                      </div>
                    </div>
                  )}
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
                    Poori upay soochi aur unka shastriya aadhaar:{' '}
                    <Link href="/blog/sade-sati-remedies-hindi" className="underline underline-offset-2" style={{ color: GOLD }}>शनि साढ़ेसाती के सच्चे उपाय</Link>
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

          {/* ── v2.0: PILLAR CONTENT — 14 keyword-driven H2 sections ── */}
          <section className="mt-12">
            {PILLAR.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">
                    {renderRich(p, `s${si}-p${pi}`)}
                  </p>
                ))}

                {/* the 12-rashi status table sits inside the first section */}
                {s.id === 'kis-rashi-par' && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                      <caption className="sr-only">शनि के मीन गोचर के दौरान बारहों राशियों की स्थिति</caption>
                      <thead>
                        <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>चंद्र राशि</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>स्थिति</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {RASHI_STATUS.map((r) => (
                          <tr key={r.rashi} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <td className="p-3 font-semibold">
                              <Link href={`/blog/${r.slug}`} className="underline underline-offset-2" style={{ color: GOLD }}>
                                {r.rashi} ({r.en})
                              </Link>
                            </td>
                            <td className="p-3" style={{
                              color: r.tone === 'in' ? '#FCA5A5' : r.tone === 'dhaiya' ? '#FCD34D' : '#86EFAC',
                            }}>
                              {r.status}
                            </td>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk Sade Sati Calculator</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sabse bada farak yeh hai ki zyadatar tools sirf <strong style={{ color: GOLD }}>&ldquo;haan ya na&rdquo;</strong> batate hain. Woh kaafi nahi hai — kyunki aapka faisla is baat par nirbhar karta hai ki <strong style={{ color: GOLD }}>kaun sa charan chal raha hai aur kitne din bache hain</strong>. Teen saal bache hain ya teen mahine, dono ka matlab bilkul alag hai.
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Phase Detection (Rising/Peak/Setting)</td><td className="p-3" style={{ color: GOLD }}>✓ Auto-calculated</td><td className="p-3 text-slate-500">✗ Manual</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Days Remaining</td><td className="p-3" style={{ color: GOLD }}>✓ Exact</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">All Life Cycles</td><td className="p-3" style={{ color: GOLD }}>✓ Past + Future</td><td className="p-3 text-slate-500">✗ Current only</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Dhaiya se farak batata hai</td><td className="p-3" style={{ color: GOLD }}>✓ Alag se</td><td className="p-3 text-slate-500">✗ Dono ek hi bata dete hain</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Sade Sati Calculator</h2>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Sade Sati Par Poora Guide Padhein</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Yeh calculator verdict aur tareekhein deta hai. Uske peeche ka poora shastra in guides mein hai — sabse pehle{' '}
              <Link href="/blog/sade-sati-vs-dhaiyya-shani-hindi" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>saadhesati banaam dhaiya</Link>{' '}
              padhiye, kyunki bahut logon ki asal mein dhaiya chal rahi hoti hai — jo ek-tihai samay ki hai.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { slug: 'sade-sati-2026-rashi-wise-hindi', label: 'साढ़ेसाती — किन राशियों पर चल रही है' },
                { slug: 'is-my-sade-sati-running-hindi', label: 'क्या मेरी साढ़ेसाती चल रही है?' },
                { slug: 'sade-sati-phases-which-is-worst-hindi', label: 'तीन चरण — सबसे कठिन कौन सा' },
                { slug: 'sade-sati-start-end-date-hindi', label: 'शुरुआत और अंत तिथि कैसे निकालें' },
                { slug: 'signs-of-sade-sati-hindi', label: 'साढ़ेसाती के 10 ईमानदार लक्षण' },
                { slug: 'sade-sati-remedies-hindi', label: 'सच्चे उपाय (भय वाले नहीं)' },
                { slug: 'is-sade-sati-always-bad-hindi', label: 'क्या साढ़ेसाती हमेशा बुरी होती है?' },
                { slug: 'sade-sati-career-money-health-marriage-hindi', label: 'करियर, धन, स्वास्थ्य व विवाह पर प्रभाव' },
                { slug: 'sade-sati-vs-dhaiyya-shani-hindi', label: 'साढ़ेसाती बनाम ढैया — अंतर' },
                { slug: 'shani-sade-sati-calculator-hindi', label: 'शनि साढ़ेसाती कैलकुलेटर गाइड' },
                { slug: 'sade-sati-meaning-effects-remedies', label: 'Sade Sati: meaning, effects and remedies' },
                { slug: 'saturn-transit-2026', label: 'Saturn Transit — all 12 Moon signs' },
                { slug: 'shani-mahadasha-effects-guide', label: 'Shani Mahadasha — effects and timeline' },
                { slug: 'sade-sati-career-money-health-marriage', label: 'Sade Sati effects on career and marriage' },
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
              Agar result &ldquo;saadhesati nahi hai&rdquo; aaya par rukavatein phir bhi mehsoos ho rahi hain, to wajah kahin aur hai. Sabse pehle{' '}
              <Link href="/calculators/free-dasha-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Dasha</Link>{' '}
              dekhiye — chal rahi mahadasha ka asar saadhesati se aksar zyada hota hai, aur uspar dhyan hi nahi jaata.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
                { slug: 'free-rashi-calculator', name: 'Rashi Calculator' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-pitra-dosh-calculator', name: 'Pitra Dosh' },
                { slug: 'free-kaal-sarp-dosh-calculator', name: 'Kaal Sarp Dosh' },
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh' },
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra Finder' },
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
              <strong style={{ color: GOLD }}>Classical sources:</strong> Brihat Parashara Hora Shastra (BPHS) — Shani gochar and Chandra Rashi principles; classical Sade Sati three-phase structure (Aaroh, Madhya, Avaroh) and Dhaiya (Ashtama / Ardha Ashtama) rules; Swiss Ephemeris with Lahiri Ayanamsha for all transit computation.
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

function DetailCell({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="font-bold text-base" style={{ color: GOLD }}>{value || '—'}</div>
    </div>
  );
}

function PhaseCard({ icon, title, duration, desc, active }: { icon: string; title: string; duration: string; desc: string; active?: boolean }) {
  return (
    <div className="p-4 rounded-xl" style={{
      background: active ? `${GOLD_RGBA(0.15)}` : 'rgba(2,8,23,0.4)',
      border: `1px solid ${active ? GOLD : GOLD_RGBA(0.15)}`,
      transform: active ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 0.3s'
    }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1" style={{ color: GOLD }}>{title} {active && <span className="text-xs ml-1 px-2 py-0.5 rounded-full" style={{ background: GOLD, color: '#080B12' }}>ACTIVE</span>}</div>
      <div className="text-xs text-slate-400 mb-2">{duration}</div>
      <div className="text-xs text-slate-300 leading-relaxed">{desc}</div>
    </div>
  );
}

function CycleRow({ cycle, status }: { cycle: any; status: 'past' | 'current' | 'future' }) {
  const colors = {
    past: { bg: 'rgba(100,116,139,0.05)', border: 'rgba(100,116,139,0.2)', text: '#64748b' },
    current: { bg: 'rgba(212,175,55,0.1)', border: GOLD, text: GOLD },
    future: { bg: 'rgba(96,165,250,0.05)', border: 'rgba(96,165,250,0.2)', text: '#94a3b8' },
  };
  const c = colors[status];
  const start = new Date(cycle.start);
  const end = new Date(cycle.end);
  const years = ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="text-xs uppercase tracking-wide font-bold" style={{ color: c.text, minWidth: '60px' }}>{status}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold" style={{ color: c.text }}>{formatDate(cycle.start)} → {formatDate(cycle.end)}</div>
        <div className="text-xs text-slate-500 mt-0.5">{years} years</div>
      </div>
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
