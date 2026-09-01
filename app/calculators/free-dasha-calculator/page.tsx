'use client';

// ============================================================
// File: app/calculators/free-dasha-calculator/page.tsx
// Version: v4.0 — three-level dasha (Pratyantar) + content rebuild
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// v4.0 (2026-09-01)
//   CONTEXT — this page was BROKEN, not merely thin. It reads
//   result.kundali.dasha.maha_dasha, and until route.ts v2.1 the API
//   returned no `kundali` key at all and only two resolved names under
//   `dasha`. So both date cards rendered "—", the "Next 5 Mahadasha"
//   section never appeared, and `template` was null so Dos, Don'ts and
//   Remedies all vanished. Verified by calling the endpoint directly on
//   1 Sep 2026 with two different births — identical empty shape both times.
//   route.ts v2.1 now passes the full cycle through raw, and the live
//   response was re-checked before this page was written:
//     maha_dasha 9 periods -> antar[] 9 -> pratyantar[] 9, each with
//     start, end and is_current.
//
//   1. THIRD LEVEL, AS A REAL FEATURE (not just prose). The Radar E3 brief
//      lists "Pratyantar Dasha calculator (teesra level — competitors nahi
//      dete)". That data was on the VM the whole time and was being dropped
//      in the route. findCurrentDasha() now resolves all three levels and
//      the result block shows:
//        • three current-period cards — Mahadasha / Antardasha / Pratyantar
//        • a 9-row Pratyantar table for the current Antardasha, with the
//          running period highlighted
//        • a 9-row Antardasha table for the current Mahadasha
//        • the existing Next-5 Mahadasha list, which now actually renders
//      Current period is found by DATE COMPARISON, not the is_current flag.
//      The flag is correct today (the v3.1 header note saying it is always
//      false is out of date), but a date comparison cannot go stale behind
//      a cache and it is what the previous version already used.
//   2. CONTENT — 16 new H2 sections, 0 -> ~5,900 Devanagari characters.
//      Four are the Radar E3 brief keywords: "अभी कौन सी दशा चल रही है",
//      "Free Mahadasha and Antardasha analysis", "Pratyantar Dasha
//      calculator" and "दशा kab badlegi — timeline table".
//   3. LINKS 5 -> 34. Supabase holds a 35-post dasha cluster including
//      dasha-pratyantar-timing-manifestation-astrology in both languages —
//      the exact pratyantar match — and not one was linked from here.
//      Every href verified against the live sitemap on 1 Sep 2026.
//   4. FAQS 5 -> 12, feeding the same buildCalcJsonLd FAQPage.
//   5. UNCHANGED: the form, validation, the /api/calc/kundali call, the
//      template Dos/Donts/Remedies extraction, buildCalcJsonLd and the
//      plain <script> JSON-LD emission (already correct on this page).
//
// v3.1 (2026-06-02) — Gold-standard JSON-LD ADDED (page had none).
// v3.0 — Fixed VM response paths.
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



// ─── v4.0: Find current Mahadasha, Antardasha AND Pratyantar ────────────
// Verified against the live endpoint on 1 Sep 2026. The VM returns three
// nested levels: maha_dasha[] → antar[] → pratyantar[], nine entries at
// each level, every one carrying start, end and is_current.
// The route dropped all of it until route.ts v2.1; it now passes the array
// through raw, so the third level is available here for the first time.
// Date comparison is used rather than the is_current flag. is_current is
// computed on the VM at response time and is correct today, but a date
// comparison cannot go stale behind a cache, and it is what the previous
// version already relied on.
function findCurrentDasha(mahaList: any[]): {
  current: any; antardasha: any; pratyantar: any;
  nextFive: any[]; antarList: any[]; pratyantarList: any[];
} {
  const empty = { current: null, antardasha: null, pratyantar: null, nextFive: [], antarList: [], pratyantarList: [] };
  if (!Array.isArray(mahaList) || mahaList.length === 0) return empty;
  const today = new Date();

  const inWindow = (x: any) => {
    const s = new Date(x?.start); const e = new Date(x?.end);
    return !isNaN(s.getTime()) && !isNaN(e.getTime()) && today >= s && today <= e;
  };

  let currentIdx = mahaList.findIndex(inWindow);
  if (currentIdx === -1) currentIdx = mahaList.length - 1;
  const current = mahaList[currentIdx];

  const antarList: any[] = current?.antar ?? [];
  const antardasha = antarList.find(inWindow) ?? (antarList.length ? antarList[0] : null);

  const pratyantarList: any[] = antardasha?.pratyantar ?? [];
  const pratyantar = pratyantarList.find(inWindow) ?? (pratyantarList.length ? pratyantarList[0] : null);

  const nextFive = mahaList.slice(currentIdx + 1, currentIdx + 6);
  return { current, antardasha, pratyantar, nextFive, antarList, pratyantarList };
}

// Days left in a period — used to make "kab badlegi" a real number
// rather than a date the reader has to subtract in their head.
function daysLeft(end: any): number | null {
  if (!end) return null;
  const e = new Date(end);
  if (isNaN(e.getTime())) return null;
  const diff = Math.ceil((e.getTime() - Date.now()) / 86400000);
  return diff > 0 ? diff : null;
}

function humanLeft(end: any): string | null {
  const d = daysLeft(end);
  if (d === null) return null;
  if (d < 45) return `${d} din baaki`;
  const months = Math.round(d / 30.44);
  if (months < 24) return `~${months} mahine baaki`;
  return `~${(d / 365.25).toFixed(1)} saal baaki`;
}

function formatDate(d: any): string {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { }
  return String(d);
}

// ── v4.0 PILLAR CONTENT ──────────────────────────────────────────────────
// Sixteen H2 sections. Four come straight from the Radar E3 content brief:
//   • अभी कौन सी दशा चल रही है?            • Free Mahadasha and Antardasha analysis
//   • Pratyantar Dasha calculator          • दशा kab badlegi — timeline table
// The brief flagged Pratyantar as the one competitors do not give. As of
// route.ts v2.1 the VM's third level reaches this page, so it is now a real
// computed feature above, not just an explanation down here.
type DzSection = { id: string; h2: string; paras: string[] };

const PILLAR: DzSection[] = [
  {
    id: 'abhi-kaun-si-dasha',
    h2: 'अभी कौन सी दशा चल रही है — तीनों स्तर एक साथ',
    paras: [
      'ऊपर वाला कैलकुलेटर इसका जवाब **तीन स्तरों पर** देता है, और यही इसे बाकी मुफ्त टूल्स से अलग करता है। **महादशा** बताती है कि जीवन का बड़ा दौर कौन सा ग्रह चला रहा है। **अंतर्दशा** उसके अंदर का उप-काल है और साल का रंग तय करती है। **प्रत्यंतर दशा** तीसरा स्तर है — अगले कुछ महीनों का असली मूड।',
      'फर्क समझने के लिए एक तरीका: महादशा **मौसम** है, अंतर्दशा **महीना**, और प्रत्यंतर **इस हफ्ते का मौसम**। शनि की महादशा में भी गुरु की अंतर्दशा राहत देती है, और उसी के अंदर राहु का प्रत्यंतर कुछ हफ्तों के लिए उलझन ला सकता है। **तीनों एक साथ देखे बिना तस्वीर अधूरी है** — और यही वह गलती है जो सिर्फ महादशा देखकर की जाती है।',
      'गणना के लिए तीन चीजें चाहिए: जन्म तिथि, **सटीक जन्म समय**, और जन्म स्थान। समय इसलिए जरूरी है क्योंकि दशा **चंद्रमा के नक्षत्र** से शुरू होती है, और चंद्रमा एक नक्षत्र लगभग सवा दिन में पार करता है। कुछ घंटों की गलती पूरा दशा-क्रम बदल देती है।',
    ],
  },
  {
    id: 'mahadasha-antardasha-farak',
    h2: 'Mahadasha और Antardasha — फर्क क्या है',
    paras: [
      '**महादशा** एक ग्रह का बड़ा काल है — शनि की 19 साल, शुक्र की 20, सूर्य की सिर्फ 6। इस दौरान वह ग्रह जीवन की मुख्य दिशा तय करता है: किस क्षेत्र में मेहनत लगेगी, कहाँ फल मिलेगा, और कौन से विषय बार-बार सामने आएँगे।',
      '**अंतर्दशा (भुक्ति)** महादशा के अंदर का उप-काल है। हर महादशा में **नौ अंतर्दशाएँ** होती हैं — नौ ग्रहों की, उसी विंशोत्तरी क्रम में, और हर एक की लंबाई दोनों ग्रहों की अवधि के अनुपात से निकलती है। इसीलिए शनि की महादशा में शुक्र की अंतर्दशा सबसे लंबी होती है और सूर्य की सबसे छोटी।',
      'असली भविष्यवाणी **दोनों के मेल** से बनती है, अकेले किसी एक से नहीं। शास्त्रीय नियम यह है कि **महादशा का स्वामी क्षेत्र तय करता है और अंतर्दशा का स्वामी घटना**। शनि/शुक्र और शनि/मंगल — दोनों शनि की ही महादशा हैं, पर अनुभव लगभग उल्टा होता है। पूरा ढाँचा [महादशा समझाया गया](/learn/mahadasha-explained) में है।',
    ],
  },
  {
    id: 'pratyantar-dasha',
    h2: 'Pratyantar Dasha — तीसरा स्तर, जो ज़्यादातर टूल नहीं देते',
    paras: [
      '**प्रत्यंतर दशा अंतर्दशा के अंदर का काल है** — विंशोत्तरी का तीसरा स्तर। हर अंतर्दशा में फिर नौ प्रत्यंतर होते हैं, उसी क्रम में। ऊपर वाला कैलकुलेटर आपकी वर्तमान अंतर्दशा के **सभी नौ प्रत्यंतर तिथि सहित** दिखाता है, और यह बताता है कि अभी कौन सा चल रहा है।',
      'यह क्यों मायने रखता है, इसका एक व्यावहारिक कारण है। महादशा वर्षों तक चलती है और अंतर्दशा महीनों-सालों तक — दोनों बहुत बड़े खंड हैं। जब कोई पूछता है *"यह महीना ऐसा क्यों जा रहा है"*, तो जवाब अक्सर महादशा में नहीं, **प्रत्यंतर में** मिलता है। शनि/गुरु जैसी शुभ अंतर्दशा में भी राहु का प्रत्यंतर कुछ हफ्तों के लिए भ्रम ला सकता है, और वह हफ्ते बीत जाते हैं।',
      'यही बात उल्टी दिशा में भी काम करती है, और यही इसका सबसे बड़ा उपयोग है: **कठिन महादशा में भी अनुकूल प्रत्यंतर की खिड़कियाँ होती हैं।** अगर कोई बड़ा काम करना है और दौर भारी चल रहा है, तो प्रत्यंतर देखकर कुछ महीने आगे-पीछे करना अक्सर संभव होता है — और यह अनुमान नहीं, तिथि से निकलता है। इसका विस्तार [दशा, प्रत्यंतर और समय](/blog/dasha-pratyantar-timing-manifestation-astrology-hindi) में है।',
    ],
  },
  {
    id: 'dasha-kab-badlegi',
    h2: 'दशा कब बदलेगी — पूरी टाइमलाइन',
    paras: [
      'ऊपर परिणाम में **तीन टाइमलाइन** मिलती हैं, और तीनों तिथि के साथ। **अगली 5 महादशाएँ** — यानी अगले कई दशकों का ढाँचा। **वर्तमान महादशा की पूरी नौ अंतर्दशाएँ** — कौन सी कब शुरू और कब खत्म। और **वर्तमान अंतर्दशा के नौ प्रत्यंतर** — अगले कुछ महीनों की बारीक तस्वीर।',
      'दशा-परिवर्तन की गणना अनुमान से नहीं होती। हर ग्रह की अवधि निश्चित है और शास्त्र में तय है: **केतु 7, शुक्र 20, सूर्य 6, चंद्र 10, मंगल 7, राहु 18, गुरु 16, शनि 19, बुध 17** — कुल 120 वर्ष। क्रम भी निश्चित है, और आपका जन्म नक्षत्र तय करता है कि चक्र **कहाँ से** शुरू हुआ और पहली दशा का कितना हिस्सा जन्म से पहले ही बीत चुका था।',
      'एक व्यावहारिक बात: **दशा तिथि पर स्विच की तरह नहीं बदलती।** बदलाव का असर आमतौर पर कुछ महीने पहले दिखने लगता है और कुछ महीने बाद तक रहता है। इसीलिए अगला खंड — दशा संधि — जानने लायक है।',
    ],
  },
  {
    id: 'dasha-kaise-nikalti-hai',
    h2: 'दशा की गणना कैसे होती है — जन्म नक्षत्र से',
    paras: [
      'यह वह हिस्सा है जो शायद ही कोई समझाता है, और समझ लेने पर बाकी सब साफ हो जाता है। **विंशोत्तरी दशा जन्म कुंडली से नहीं, जन्म नक्षत्र से शुरू होती है।**',
      'तरीका तीन कदम का है। **एक** — जन्म के समय चंद्रमा किस नक्षत्र में था, यह निकाला जाता है। **दो** — उस नक्षत्र का स्वामी ग्रह ही **पहली महादशा** का स्वामी होता है; अश्विनी, मघा या मूल में जन्म हुआ तो जीवन केतु की महादशा से शुरू होगा, रोहिणी या हस्त में तो चंद्र की। **तीन** — चंद्रमा उस नक्षत्र में कितना आगे बढ़ चुका था, उसी अनुपात में पहली महादशा का उतना हिस्सा **जन्म से पहले ही बीत चुका** माना जाता है।',
      'तीसरा कदम ही वह है जिसकी वजह से जन्म समय इतना जरूरी है। एक ही दिन जन्मे दो बच्चों की पहली महादशा एक ही ग्रह की हो सकती है, पर उसका **बचा हुआ हिस्सा अलग** होगा — और वह अंतर पूरे जीवन की टाइमलाइन को आगे-पीछे खिसका देता है। अपना जन्म नक्षत्र [नक्षत्र कैलकुलेटर](/calculators/free-nakshatra-calculator) से मुफ्त देख सकते हैं, और पूरी गणना विधि [विंशोत्तरी दशा कैसे कैलकुलेट करें](/blog/vimshottari-dasha-kaise-calculate-karein) में है।',
    ],
  },
  {
    id: 'achhi-buri-dasha',
    h2: 'कौन सी दशा अच्छी और कौन सी बुरी — और यह सवाल गलत क्यों है',
    paras: [
      'सीधा जवाब: **कोई भी दशा अपने आप में अच्छी या बुरी नहीं होती।** यह इस विषय की सबसे बड़ी गलतफहमी है, और सबसे ज्यादा डर इसी से बेचा जाता है।',
      'एक ही ग्रह की महादशा दो लोगों के लिए बिल्कुल उल्टा फल दे सकती है, और वजह तीन हैं। **पहली — वह ग्रह आपके लग्न के लिए शुभ है या नहीं।** शनि मकर और कुंभ लग्न के लिए योगकारक तक माने जाते हैं, जबकि मेष लग्न के लिए वही शनि कठिन। **दूसरी — वह ग्रह कुंडली में कहाँ बैठा है**, किस भाव में और किस अवस्था में। **तीसरी — वह किन भावों का स्वामी है।**',
      'इसीलिए *"शनि की महादशा आ रही है, अब क्या होगा"* का कोई एक जवाब नहीं है — और जो कोई बिना कुंडली देखे जवाब दे दे, वह अनुमान बेच रहा है। **19 साल किसी के जीवन के सबसे अच्छे भी हो सकते हैं।**',
    ],
  },
  {
    id: 'shani-mahadasha',
    h2: 'शनि की महादशा — 19 साल, सबसे ज़्यादा डराया जाने वाला दौर',
    paras: [
      'शनि की महादशा सबसे लंबी दूसरी है — **19 साल** — और सबसे ज्यादा बदनाम भी। शास्त्रीय स्थिति इससे कहीं संतुलित है: शनि **कर्म, अनुशासन और देरी** के कारक हैं। वे फल रोकते नहीं, **टालते** हैं — और जो मिलता है वह टिकाऊ होता है।',
      'व्यवहार में जो सबसे ज्यादा दिखता है: मेहनत का फल देर से मिलना, वरिष्ठों से खिंचाव, जिम्मेदारियों का बढ़ना, और अकेलेपन का अहसास। पर यही दौर बहुत से लोगों में **स्थायी ढाँचा** भी बनाता है — नौकरी में जड़ें, संपत्ति, और वह अनुशासन जो बाद में काम आता है।',
      'और वह बात जो साफ कहनी चाहिए: **शनि मकर, कुंभ और तुला लग्न के लिए शुभ, यहाँ तक कि योगकारक माने जाते हैं।** इन लग्नों में शनि की महादशा अक्सर जीवन का सबसे अच्छा दौर होती है। विस्तार [शनि महादशा — पूरी गाइड](/blog/shani-mahadasha-effects-guide) में है, और नौकरी से जुड़ा सवाल [शनि महादशा में नौकरी क्यों नहीं मिलती](/blog/shani-mahadasha-mein-job-kyon-nahi-milti) में। ध्यान रहे — **शनि की महादशा और साढ़े साती अलग चीजें हैं**; साढ़े साती गोचर है, महादशा नहीं। अपनी साढ़े साती अलग से [यहाँ](/calculators/free-sade-sati-calculator) देखिए।',
    ],
  },
  {
    id: 'rahu-mahadasha',
    h2: 'राहु की महादशा — 18 साल, सबसे अप्रत्याशित',
    paras: [
      '**राहु की महादशा 18 साल की होती है** और इसका स्वभाव सबसे कम अनुमान लगाने योग्य है। राहु छाया ग्रह हैं — उनका कोई राशि-स्वामित्व नहीं, इसलिए उनका फल इस पर निर्भर करता है कि वे **किस भाव में, किसके साथ, और किसकी राशि में** बैठे हैं।',
      'जो लक्षण सबसे आम हैं: अचानक उन्नति या अचानक गिरावट, विदेश या परंपरा से बाहर के अवसर, तकनीक और नए क्षेत्रों की ओर झुकाव, और साथ ही **भ्रम** — यह लगना कि जो दिख रहा है वह वास्तविकता से बड़ा है। राहु बढ़ा-चढ़ा कर दिखाते हैं, और यही उनका सबसे बड़ा जोखिम है।',
      'व्यावहारिक सलाह: राहु के दौर में **बड़े फैसले लिखकर, समय लेकर** लेने चाहिए — क्योंकि तात्कालिकता का अहसास अक्सर राहु का ही बनाया हुआ होता है। विस्तार [राहु महादशा](/blog/rahu-mahadasha-effects-guide) में, और भ्रम के लक्षण [राहु अंतर्दशा](/blog/rahu-antardasha-confusion-symptoms) में।',
    ],
  },
  {
    id: 'baaki-mahadasha',
    h2: 'बाकी ग्रहों की महादशा — एक नज़र में',
    paras: [
      'नीचे हर ग्रह की अवधि और उसका मुख्य स्वभाव है। याद रखिए — यह **सामान्य प्रवृत्ति** है; आपके लिए फल आपके लग्न और उस ग्रह की स्थिति से बदलेगा।',
      '**गुरु (16 साल)** — विस्तार, ज्ञान, संतान, धर्म; आमतौर पर सबसे शुभ माना जाता है: [गुरु महादशा](/blog/guru-mahadasha-wisdom-growth)। **शुक्र (20 साल)** — सबसे लंबी; प्रेम, विवाह, सुख-सुविधा, कला। **बुध (17 साल)** — बुद्धि, संवाद, व्यापार, लेखन: [बुध महादशा](/blog/budh-mahadasha-career-mercury)। **चंद्र (10 साल)** — मन, माता, भावनाएँ; मानसिक उतार-चढ़ाव का दौर: [चंद्र महादशा](/blog/chandra-mahadasha-mental-health)।',
      '**मंगल (7 साल)** — ऊर्जा, साहस, भूमि, पर क्रोध भी: [मंगल महादशा](/blog/mangal-mahadasha-energy-anger-hindi)। **सूर्य (6 साल)** — सबसे छोटी; अधिकार, पहचान, सरकारी क्षेत्र: [सूर्य महादशा](/blog/surya-mahadasha-government-job)। **केतु (7 साल)** — वैराग्य, अध्यात्म, अचानक अलगाव: [केतु महादशा](/blog/ketu-mahadasha-vairagya-symptoms)। और विवाह से जुड़ी सबसे महत्वपूर्ण अंतर्दशा [शुक्र अंतर्दशा और विवाह योग](/blog/shukra-antardasha-vivah-yog) में है।',
    ],
  },
  {
    id: 'dasha-sandhi',
    h2: 'दशा संधि — दो दशाओं के बीच का समय',
    paras: [
      '**दशा संधि उस अवधि को कहते हैं जब एक दशा खत्म हो रही हो और दूसरी शुरू।** परंपरा में इसे संवेदनशील माना जाता है, और व्यवहार में यह सबसे ज्यादा महसूस होने वाला हिस्सा है।',
      'कारण सीधा है: दो अलग स्वभाव वाले ग्रह एक साथ प्रभाव डाल रहे होते हैं, और उनकी दिशाएँ अक्सर एक जैसी नहीं होतीं। इसलिए इस दौर में **अनिश्चितता, दिशाहीनता या बार-बार योजना बदलना** आम है। यह अशुभ नहीं — यह संक्रमण है।',
      'व्यावहारिक नियम: **संधि के आसपास बहुत बड़े और अपरिवर्तनीय फैसले टाल देना बेहतर है** — घर खरीदना, नौकरी छोड़ना, बड़ा निवेश। कुछ महीने रुकने पर नई दशा का स्वभाव साफ दिखने लगता है और फैसला बेहतर बैठता है। ऊपर की टाइमलाइन में तिथियाँ दी हैं, इसलिए आप खुद देख सकते हैं कि आपकी अगली संधि कब है।',
    ],
  },
  {
    id: 'dasha-vs-gochar',
    h2: 'दशा और गोचर — कौन ज़्यादा भारी पड़ता है',
    paras: [
      'यह सवाल अक्सर उलझन पैदा करता है, और इसका शास्त्रीय जवाब स्पष्ट है। **दशा यह तय करती है कि क्या संभव है; गोचर यह तय करता है कि वह कब घटित होगा।**',
      'दोनों में **दशा प्रधान** मानी जाती है। अगर कुंडली और चल रही दशा किसी फल का वादा नहीं करतीं, तो कितना भी अनुकूल गोचर उसे नहीं ला सकता। और अगर दशा वादा करती है, तो प्रतिकूल गोचर उसे टाल सकता है — रोक नहीं सकता।',
      'इसका सबसे उपयोगी प्रयोग यही है: लोग अक्सर [साढ़े साती](/calculators/free-sade-sati-calculator) को हर परेशानी का कारण मान लेते हैं, जबकि वह **गोचर** है। अगर आपकी चंद्र राशि पर साढ़े साती चल ही नहीं रही, तो दबाव का कारण कहीं और है — और अक्सर वह चल रही महादशा होती है, जो ऊपर दिख रही है। सही निदान बदल देता है कि आपको क्या करना चाहिए।',
    ],
  },
  {
    id: 'dasha-upay',
    h2: 'दशा के अनुसार उपाय — और क्या ज़रूरी नहीं है',
    paras: [
      'शास्त्रीय तर्क सरल है: **जो ग्रह इस समय चला रहा है, उसे संतुलित कीजिए।** इसीलिए ऊपर परिणाम में जो तीन उपाय मिलते हैं — मंत्र, रत्न और दान — वे आपकी **चल रही दशा के स्वामी** पर आधारित होते हैं, किसी सामान्य सूची पर नहीं।',
      'तीनों की भूमिका अलग है। **मंत्र** सबसे सुरक्षित है — किसी भी ग्रह के लिए, बिना किसी जोखिम के, और मुफ्त। **दान** उस ग्रह की वस्तुओं का, उसी के दिन। **रत्न** सबसे शक्तिशाली और सबसे जोखिम भरा — क्योंकि वह उस ग्रह की ऊर्जा **बढ़ाता** है, और अगर वह ग्रह आपके लिए कष्टकारी है तो आप कष्ट बढ़ा रहे हैं।',
      'इसलिए एक साफ नियम: **दशा के आधार पर रत्न मत पहनिए।** रत्न लग्न और ग्रह की शुभता से तय होता है, अकेली दशा से नहीं। पहले [रत्न उपयुक्तता](/calculators/free-gemstone-suitability-calculator) जाँचिए। और अगर कोई कहे कि *"यह दशा भारी है, यह पूजा करवा लीजिए"* और सामने बड़ी राशि रख दे — तो रुक जाइए। **कठिन दशा का शास्त्रीय उपाय मंत्र, दान और धैर्य है, महँगा अनुष्ठान नहीं।**',
    ],
  },
  {
    id: 'dasha-timing-kaam',
    h2: 'दशा से समय कैसे तय करें — किस काम के लिए कौन सी खिड़की',
    paras: [
      'दशा का सबसे व्यावहारिक उपयोग भविष्य जानना नहीं, **समय चुनना** है। जब आपके पास तीनों स्तर की तिथियाँ हों, तो बड़े कामों को अनुकूल खिड़कियों में रखा जा सकता है।',
      'क्षेत्र के अनुसार अलग-अलग लेख हैं, और हर एक में यह बताया गया है कि कौन सी दशा उस काम को सहारा देती है: [करियर और नौकरी बदलने की खिड़की](/blog/dasha-timing-career-window-skills-astrology-hindi) · [संपत्ति खरीदने का समय](/blog/dasha-timing-property-buy-window-astrology-hindi) · [कर्ज़ से मुक्ति](/blog/dasha-timing-debt-free-window-astrology-hindi) · [संतान और बच्चे का विकास](/blog/dasha-timing-child-development-astrology-hindi)।',
      'और भी: [रिश्ते सुधरने का समय](/blog/dasha-timing-reconnection-astrology-hindi) · [ट्रांसफर और कार्यस्थल टकराव](/blog/dasha-timing-transfer-conflict-peak-astrology-hindi) · [विदेश बसने का समय](/blog/dasha-transit-foreign-settlement-astrology-hindi) · [परीक्षा में सफलता का वर्ष](/blog/best-year-dasha-exam-success-astrology-hindi)। सरकारी नौकरी का समय अलग से [Government job dasha timing](/learn/government-job-dasha-timing) में, और धन-वृद्धि का [Wealth growth timing](/learn/wealth-growth-timing) में।',
    ],
  },
  {
    id: 'janm-samay-nahi',
    h2: 'जन्म समय पता न हो तो क्या करें',
    paras: [
      'यहाँ ईमानदार रहना जरूरी है, क्योंकि यह सबसे आम स्थिति है। **जन्म समय के बिना विंशोत्तरी दशा भरोसेमंद नहीं निकलती।**',
      'कारण ऊपर बताया गया है: दशा चंद्रमा के नक्षत्र और उसमें चंद्रमा की **सटीक स्थिति** से शुरू होती है। चंद्रमा एक नक्षत्र लगभग सवा दिन में पार करता है — इसलिए बिना समय के नक्षत्र भी बदल सकता है, और अगर नक्षत्र सही भी निकले तो **पहली दशा का बचा हुआ हिस्सा** गलत होगा, जिससे पूरी टाइमलाइन कई साल खिसक जाएगी।',
      'समय कहाँ मिलेगा: **जन्म प्रमाणपत्र** (1990 के बाद के अधिकांश शहरी जन्मों में समय दर्ज होता है), **अस्पताल की डिस्चार्ज समरी**, **परिवार की पुरानी जन्मपत्री** — और अगर कुछ न मिले तो घर की याददाश्त से एक-दो घंटे की खिड़की भी काम की है। हम अनुमान लगाकर तिथियाँ नहीं बना देते; अगर आधार कमजोर है तो हम यह कह देते हैं।',
    ],
  },
  {
    id: 'dasha-kya-nahi',
    h2: 'दशा से क्या पता नहीं चलता',
    paras: [
      'यह सूची इसलिए है क्योंकि यहीं सबसे ज्यादा डर बेचा जाता है। दशा से **नहीं** निकाला जा सकता: **मृत्यु का समय**, किसी बीमारी का निदान, परीक्षा का परिणाम, या कोई सटीक घटना और उसकी तारीख।',
      'मृत्यु पर विशेष रूप से साफ रहना जरूरी है। **कोई भी ईमानदार ज्योतिषी दशा देखकर मृत्यु की भविष्यवाणी नहीं करता**, और शास्त्र में भी इस पर स्पष्ट संयम बरतने को कहा गया है। जो कोई ऐसा करे, वह आपको डराकर कुछ बेच रहा है।',
      'दशा जो **सचमुच** बताती है वह है **प्रवृत्ति और समय** — किस क्षेत्र में ऊर्जा जा रही है, कब दबाव बढ़ेगा, और कब खिड़की खुलेगी। यह कम नाटकीय है और कहीं ज्यादा काम का, क्योंकि इसी पर आप योजना बना सकते हैं।',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'दशा मिल गई — अब आगे क्या',
    paras: [
      '**पहले तीनों स्तर नोट कर लीजिए** — महादशा, अंतर्दशा और प्रत्यंतर, तिथि सहित। अगली संधि कब है, वह भी ऊपर की टाइमलाइन से देख लीजिए। यह जानकारी अगले कई साल काम आएगी।',
      '**फिर बाकी मुफ्त जाँचें कर लीजिए**, क्योंकि दशा अकेली पूरी तस्वीर नहीं देती: [मुफ्त कुंडली](/calculators/free-kundali-calculator) से लग्न और भाव, [नक्षत्र](/calculators/free-nakshatra-calculator) से दशा का आधार, और [साढ़े साती](/calculators/free-sade-sati-calculator) से गोचर का दबाव — तीनों अलग-अलग चीजें बताते हैं।',
      'और अगर सामने कोई ठोस फैसला है — नौकरी छोड़नी है, घर खरीदना है, या शादी का समय तय करना है — तो सामान्य लेख उसे तय नहीं कर सकता। विवाह के लिए [कुंडली मिलान](/kundali-milan) है, और पूरे जीवन-पथ के लिए [कार्मिक बैकग्राउंड रीडिंग](/karmic-background-reading)। सारे विकल्प [प्राइसिंग पेज](/pricing) पर हैं।',
    ],
  },
];

function DzRich({ text, k }: { text: string; k: string }) {
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

const FAQS = [
  { q: 'अभी कौन सी दशा चल रही है — कैसे पता करें?', a: 'Upar wala calculator teenon star ek saath deta hai: Mahadasha, Antardasha aur Pratyantar, tareekh ke saath. Iske liye janm tithi, sateek janm samay aur janm sthan chahiye. Samay isliye zaroori hai kyunki dasha Chandra ke nakshatra se shuru hoti hai, aur Chandra ek nakshatra lagbhag sawa din mein paar karta hai.' },
  { q: 'Pratyantar Dasha kya hoti hai?', a: 'Pratyantar Antardasha ke andar ka kaal hai — Vimshottari ka teesra star. Har Antardasha mein phir nau Pratyantar hote hain, usi kram mein. Mahadasha mausam hai, Antardasha mahina, aur Pratyantar is hafte ka mausam. Jab koi puchhta hai "yeh mahina aisa kyun jaa raha hai", jawab aksar Mahadasha mein nahi, Pratyantar mein milta hai.' },
  { q: 'Kya yeh calculator Pratyantar bhi dikhata hai?', a: 'Haan. Zyadatar muft tools sirf Mahadasha aur Antardasha tak jaate hain. Yeh page aapki vartaman Antardasha ke saare NAU Pratyantar tareekh ke saath dikhata hai, aur batata hai ki abhi kaun sa chal raha hai. Saath mein vartaman Mahadasha ki poori nau Antardasha ki timeline bhi.' },
  { q: 'Vimshottari Dasha kya hai?', a: 'Maharishi Parashar dwara BPHS Chapter 46-49 mein varnit 120 saal ka grah-period chakra. Nau grah baari-baari rule karte hain — Ketu 7, Shukra 20, Surya 6, Chandra 10, Mangal 7, Rahu 18, Guru 16, Shani 19, Budh 17 saal.' },
  { q: 'Mahadasha aur Antardasha mein kya antar hai?', a: 'Mahadasha bada grah-period hai (jaise Shani 19 saal). Antardasha (Bhukti) uske andar ka up-kaal hai; har Mahadasha mein nau Antardasha hoti hain. Shastriya niyam yeh hai ki Mahadasha ka swami kshetra tay karta hai aur Antardasha ka swami ghatna — isliye asli bhavishyavani dono ke mel se banti hai, akele kisi ek se nahi.' },
  { q: 'दशा कब बदलेगी?', a: 'Result mein teen timeline milti hain, teenon tareekh ke saath: agli 5 Mahadasha, vartaman Mahadasha ki nau Antardasha, aur vartaman Antardasha ke nau Pratyantar. Har grah ki avadhi nishchit hai, isliye yeh anuman nahi — ganana hai. Dhyan rahe, dasha tareekh par switch ki tarah nahi badalti; asar kuch mahine pehle dikhne lagta hai.' },
  { q: 'दशा की गणना किससे शुरू होती है?', a: 'Janm kundali se nahi, JANM NAKSHATRA se. Janm ke samay Chandra jis nakshatra mein tha, us nakshatra ka swami hi pehli Mahadasha ka swami hota hai. Aur Chandra us nakshatra mein kitna aage badh chuka tha, usi anupat mein pehli Mahadasha ka utna hissa janm se pehle hi beet chuka mana jaata hai — yahi wajah hai ki janm samay itna zaroori hai.' },
  { q: 'कौन सी दशा सबसे अच्छी होती है?', a: 'Koi bhi dasha apne aap mein achhi ya buri nahi hoti — yeh sabse badi galatfehmi hai. Ek hi grah ki Mahadasha do logon ke liye ulta phal de sakti hai, teen wajah se: wo grah aapke lagna ke liye shubh hai ya nahi, kundali mein kahan baitha hai, aur kin bhaavon ka swami hai. Shani Makar aur Kumbh lagna ke liye yogkarak tak maane jaate hain.' },
  { q: 'Shani ki Mahadasha aur Sade Sati mein kya farak hai?', a: 'Dono bilkul alag hain. Sade Sati GOCHAR hai — Shani ka aapki Chandra rashi aur uske aas-paas se guzarna, saade saat saal. Shani ki Mahadasha 19 saal ka dasha-kaal hai, jo janm nakshatra se tay hota hai. Ek chal sakti hai aur doosri nahi. Apni Sade Sati alag se check kijiye.' },
  { q: 'दशा और गोचर में कौन ज़्यादा भारी है?', a: 'Dasha pradhan mani jaati hai. Dasha tay karti hai ki KYA sambhav hai; gochar tay karta hai ki wo KAB ghatit hoga. Agar kundali aur chal rahi dasha kisi phal ka vaada nahi karti, to kitna bhi anukool gochar use nahi la sakta. Aur agar dasha vaada karti hai, to pratikool gochar use taal sakta hai — rok nahi sakta.' },
  { q: 'दशा के अनुसार रत्न पहन सकते हैं?', a: 'Nahi, sirf dasha ke aadhar par ratna nahi pehnna chahiye. Ratna lagna aur grah ki shubhta se tay hota hai, akeli dasha se nahi. Ratna us grah ki urja BADHATA hai — agar wo grah aapke liye kashtkari hai to aap kasht badha rahe hain. Pehle Ratna Upyuktata check kijiye. Dasha ke liye sabse surakshit upay mantra aur daan hain.' },
  { q: 'Kya Dasha calculator bilkul free hai?', a: 'Haan, 100% free. Teenon star (Mahadasha, Antardasha, Pratyantar), agli 5 Mahadasha, poori Antardasha timeline, saare nau Pratyantar tareekh ke saath, 3 Parashar Dos, 3 Donts aur 3 remedies — sab muft, koi signup nahi.' },
];

export default function FreeDashaCalculatorPage() {
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

  // ─── Dasha extraction ───────────────────────────────────────────────
  // route.ts v2.1 returns the full cycle at result.kundali.dasha.maha_dasha
  // (raw VM passthrough) and also mirrors it at result.dasha.maha_dasha.
  // Both are read so this page works whichever one is present.
  const mahaList: any[] =
    result?.kundali?.dasha?.maha_dasha ?? result?.dasha?.maha_dasha ?? [];
  const {
    current: currentMaha,
    antardasha: currentAntar,
    pratyantar: currentPraty,
    nextFive,
    antarList,
    pratyantarList,
  } = findCurrentDasha(mahaList);

  // ─── Template data — VM returns template.actionWindows, avoidWindows, remedyPlan ───
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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-dasha-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Dasha Calculator — Mahadasha, Antardasha & Pratyantar Online',
    description:
      'Calculate your current Vimshottari Mahadasha, Antardasha AND Pratyantar dasha from your birth chart, with full timelines on exact dates and 3 free Parashar remedies. Free Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Dasha Calculator',
    aboutEntities: ['Vimshottari Dasha', 'Mahadasha', 'Antardasha', 'Pratyantar Dasha'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Vimshottari Dasha', 'Mahadasha', 'Pratyantar Dasha'],
    howToName: 'How to find your current Mahadasha, Antardasha and Pratyantar',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Compute the dasha cycle', text: "The calculator finds the Moon's Nakshatra using Swiss Ephemeris with Lahiri Ayanamsha and builds the 120-year Vimshottari cycle per BPHS." },
      { name: 'Read all three levels', text: 'See your current Mahadasha, Antardasha and Pratyantar with exact dates, the full antardasha and pratyantar timelines, and 3 free Parashar remedies.' },
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
            <span style={{ color: GOLD }}>Free Dasha Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Dasha Calculator — Mahadasha, Antardasha &amp; Pratyantar
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Dasha Calculator</strong> aapki chal rahi dasha <strong style={{ color: GOLD }}>teenon star par</strong> nikalta hai — Mahadasha, Antardasha aur <strong style={{ color: GOLD }}>Pratyantar</strong>, sateek tareekh ke saath. Zyadatar muft tools teesre star tak nahi jaate. Date, time aur place daaliye — teenon current periods, agli 5 Mahadasha, poori Antardasha timeline, saare 9 Pratyantar, aur 3 free Parashar remedies turant milte hain.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>
                <Link href="/founder" className="hover:underline">Rohiit Gupta</Link>
              </div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS Ch.46-49 · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Apni Dasha Nikaaliye (Free)</h2>
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
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Dasha Chandra ke nakshatra se shuru hoti hai. Bina sateek time ke poori timeline kai saal khisak sakti hai.</p>
                  : <p className="text-slate-500 text-xs mt-1">Sateek time se hi dasha ki tareekhein sahi aati hain.</p>}
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
                {loading ? '⟳ Calculating Dasha...' : '🪐 Calculate Free Dasha'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Teenon star</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* ── v4.0: THREE-LEVEL CURRENT DASHA ─────────────────── */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <h3 className="text-xl md:text-2xl font-serif font-bold mb-1" style={{ color: GOLD }}>
                  🪐 {form.name ? `${form.name} ki ` : ''}Abhi Kaun Si Dasha Chal Rahi Hai
                </h3>
                <p className="text-xs text-slate-400 mb-5">Teenon star ek saath — Mahadasha, Antardasha aur Pratyantar.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DashaCard icon="🌟" label="Mahadasha (मुख्य)"
                    planet={currentMaha?.planet} start={currentMaha?.start} end={currentMaha?.end} years={currentMaha?.years} />
                  <DashaCard icon="✨" label="Antardasha (उप-दशा)"
                    planet={currentAntar?.planet} start={currentAntar?.start} end={currentAntar?.end} />
                  <DashaCard icon="⚡" label="Pratyantar (तीसरा स्तर)"
                    planet={currentPraty?.planet} start={currentPraty?.start} end={currentPraty?.end} highlight />
                </div>
                {currentMaha && currentAntar && currentPraty && (
                  <p className="text-sm text-slate-300 mt-5 leading-relaxed">
                    Abhi aap <strong style={{ color: GOLD }}>{currentMaha.planet}</strong> ki Mahadasha mein,
                    uske andar <strong style={{ color: GOLD }}>{currentAntar.planet}</strong> ki Antardasha mein,
                    aur uske andar <strong style={{ color: GOLD }}>{currentPraty.planet}</strong> ke Pratyantar mein hain.
                    Iska matlab: bada daur {currentMaha.planet} tay karta hai, saal ka rang {currentAntar.planet} deta hai,
                    aur <strong>agle kuch mahine ka asli mood {currentPraty.planet}</strong> ka hai.
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-4 italic">
                  Vimshottari Dasha — 120 saal ka chakra, Parashar BPHS Chapter 46-49 ke aadhar par.
                </p>
              </div>

              {/* ── v4.0: PRATYANTAR TABLE — the third level ─────────── */}
              {pratyantarList.length > 0 && currentAntar && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-1" style={{ color: GOLD }}>
                    ⚡ Pratyantar Dasha — {currentMaha?.planet} / {currentAntar.planet} ke andar
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Teesra star. Zyadatar free tools yahan tak nahi jaate — aur mahine-bhar ka farak yahin dikhta hai.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <caption className="sr-only">वर्तमान अंतर्दशा के नौ प्रत्यंतर, तिथि सहित</caption>
                      <thead>
                        <tr style={{ background: GOLD_RGBA(0.1) }}>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>Pratyantar</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>Se</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>Tak</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {pratyantarList.map((p: any, i: number) => {
                          const isNow = currentPraty && p.start === currentPraty.start && p.planet === currentPraty.planet;
                          return (
                            <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: isNow ? GOLD_RGBA(0.1) : undefined }}>
                              <td className="p-2.5 font-semibold" style={{ color: isNow ? GOLD : '#cbd5e1' }}>
                                {p.planet}{isNow && <span className="ml-2 text-xs" style={{ color: GOLD }}>← अभी</span>}
                              </td>
                              <td className="p-2.5">{formatDate(p.start)}</td>
                              <td className="p-2.5">{formatDate(p.end)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── v4.0: FULL ANTARDASHA TIMELINE ──────────────────── */}
              {antarList.length > 0 && currentMaha && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-1" style={{ color: GOLD }}>
                    📋 {currentMaha.planet} Mahadasha ki poori Antardasha timeline
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Nau antardasha — dasha kab badlegi, saaf tareekh ke saath.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <caption className="sr-only">वर्तमान महादशा की नौ अंतर्दशा, तिथि सहित</caption>
                      <thead>
                        <tr style={{ background: GOLD_RGBA(0.1) }}>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>Antardasha</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>Se</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>Tak</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {antarList.map((a: any, i: number) => {
                          const isNow = currentAntar && a.start === currentAntar.start && a.planet === currentAntar.planet;
                          return (
                            <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: isNow ? GOLD_RGBA(0.1) : undefined }}>
                              <td className="p-2.5 font-semibold" style={{ color: isNow ? GOLD : '#cbd5e1' }}>
                                {currentMaha.planet}/{a.planet}{isNow && <span className="ml-2 text-xs" style={{ color: GOLD }}>← अभी</span>}
                              </td>
                              <td className="p-2.5">{formatDate(a.start)}</td>
                              <td className="p-2.5">{formatDate(a.end)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* NEXT 5 MAHADASHAS */}
              {nextFive.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📅 Agli {nextFive.length} Mahadasha</h3>
                  <div className="space-y-3">
                    {nextFive.map((d: any, i: number) => (
                      <TimelineRow key={i} index={i + 1} planet={d.planet} start={d.start} end={d.end} years={d.years} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-4 italic">Ketu 7 · Shukra 20 · Surya 6 · Chandra 10 · Mangal 7 · Rahu 18 · Guru 16 · Shani 19 · Budh 17 (saal)</p>
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
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪔 Aapki Dasha ke 3 Free Upay (Parashar)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={typeof mantra === 'string' ? mantra : JSON.stringify(mantra)} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={typeof ratna === 'string' ? ratna : JSON.stringify(ratna)} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={typeof daan === 'string' ? daan : JSON.stringify(daan)} />}
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Ye upay aapki <strong style={{ color: GOLD }}>chal rahi dasha ke swami</strong> par aadharit hain. Ratna sabse shaktishali aur sabse jokhim bhara hai — pehle{' '}
                    <Link href="/calculators/free-gemstone-suitability-calculator" className="underline underline-offset-2" style={{ color: GOLD }}>Ratna Upyuktata</Link> jaanch lijiye.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* ── v4.0: TABLE OF CONTENTS ─────────────────────────── */}
          <nav aria-label="Is page par kya hai" className="mt-16 rounded-2xl p-5 md:p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <h2 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>Is Page Par Kya Hai</h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
              {PILLAR.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="hover:underline underline-offset-2" style={{ color: '#cbd5e1' }}>{s.h2}</a></li>
              ))}
            </ol>
          </nav>

          {/* ── v4.0: PILLAR CONTENT — 16 keyword-driven H2 sections ── */}
          <section className="mt-12">
            {PILLAR.map((s) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, i) => (
                  <p key={i} className="text-slate-300 leading-relaxed mb-4">
                    <DzRich text={p} k={`${s.id}-${i}`} />
                  </p>
                ))}

                {s.id === 'dasha-kab-badlegi' && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                      <caption className="sr-only">नौ ग्रहों की महादशा अवधि और मुख्य स्वभाव</caption>
                      <thead>
                        <tr style={{ background: GOLD_RGBA(0.1) }}>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>ग्रह</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>अवधि</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>मुख्य स्वभाव</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {[
                          { p: 'केतु (Ketu)', y: '7 साल', d: 'वैराग्य, अध्यात्म, अचानक अलगाव' },
                          { p: 'शुक्र (Venus)', y: '20 साल', d: 'प्रेम, विवाह, सुख-सुविधा, कला' },
                          { p: 'सूर्य (Sun)', y: '6 साल', d: 'अधिकार, पहचान, सरकारी क्षेत्र' },
                          { p: 'चंद्र (Moon)', y: '10 साल', d: 'मन, माता, भावनाएँ' },
                          { p: 'मंगल (Mars)', y: '7 साल', d: 'ऊर्जा, साहस, भूमि, क्रोध' },
                          { p: 'राहु (Rahu)', y: '18 साल', d: 'अचानक उन्नति, विदेश, भ्रम' },
                          { p: 'गुरु (Jupiter)', y: '16 साल', d: 'ज्ञान, विस्तार, संतान, धर्म' },
                          { p: 'शनि (Saturn)', y: '19 साल', d: 'कर्म, अनुशासन, देरी, स्थायित्व' },
                          { p: 'बुध (Mercury)', y: '17 साल', d: 'बुद्धि, संवाद, व्यापार' },
                        ].map((g) => (
                          <tr key={g.p} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <td className="p-2.5 font-semibold" style={{ color: GOLD }}>{g.p}</td>
                            <td className="p-2.5">{g.y}</td>
                            <td className="p-2.5 text-slate-400">{g.d}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[11px] text-slate-500 mt-2">कुल 120 वर्ष। क्रम निश्चित है; आपका जन्म नक्षत्र तय करता है कि चक्र कहाँ से शुरू हुआ।</p>
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Dasha</h2>
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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Dasha Par Aur Padhein</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Har grah ki Mahadasha par alag vistrit lekh, aur kaam ke hisaab se timing guides.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { s: '/blog/dasha-pratyantar-timing-manifestation-astrology-hindi', l: 'दशा, प्रत्यंतर और समय', n: 'तीसरा स्तर विस्तार से' },
                { s: '/blog/vimshottari-dasha-kaise-calculate-karein', l: 'विंशोत्तरी दशा कैसे निकालें', n: 'पूरी गणना विधि' },
                { s: '/learn/mahadasha-explained', l: 'Mahadasha explained', n: 'The full reference' },
                { s: '/blog/shani-mahadasha-effects-guide', l: 'शनि महादशा — 19 साल', n: 'सबसे बदनाम, सबसे गलत समझा' },
                { s: '/blog/rahu-mahadasha-effects-guide', l: 'राहु महादशा — 18 साल', n: 'सबसे अप्रत्याशित' },
                { s: '/blog/guru-mahadasha-wisdom-growth', l: 'गुरु महादशा — 16 साल', n: 'विस्तार और ज्ञान' },
                { s: '/blog/budh-mahadasha-career-mercury', l: 'बुध महादशा — 17 साल', n: 'व्यापार और संवाद' },
                { s: '/blog/chandra-mahadasha-mental-health', l: 'चंद्र महादशा — 10 साल', n: 'मन और भावनाएँ' },
                { s: '/blog/mangal-mahadasha-energy-anger-hindi', l: 'मंगल महादशा — 7 साल', n: 'ऊर्जा और क्रोध' },
                { s: '/blog/surya-mahadasha-government-job', l: 'सूर्य महादशा — 6 साल', n: 'अधिकार और सरकारी क्षेत्र' },
                { s: '/blog/ketu-mahadasha-vairagya-symptoms', l: 'केतु महादशा — 7 साल', n: 'वैराग्य के लक्षण' },
                { s: '/blog/shukra-antardasha-vivah-yog', l: 'शुक्र अंतर्दशा और विवाह', n: 'शादी कब — दशा से' },
                { s: '/blog/rahu-antardasha-confusion-symptoms', l: 'राहु अंतर्दशा — भ्रम के लक्षण', n: 'क्या असली है, क्या नहीं' },
                { s: '/blog/shani-mahadasha-mein-job-kyon-nahi-milti', l: 'शनि महादशा में नौकरी क्यों नहीं मिलती', n: 'देरी बनाम इनकार' },
              ].map((b) => (
                <Link key={b.s} href={b.s} className="block rounded-xl px-4 py-3 transition hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="block text-sm font-semibold" style={{ color: GOLD }}>{b.l}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{b.n}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Dasha ka aadhar nakshatra hai, aur gochar ka dabav alag cheez hai — dono alag se dekh lijiye.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra (दशा का आधार)' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati (गोचर)' },
                { slug: 'free-rashi-calculator', name: 'Rashi Calculator' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
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

          <footer className="mt-16 pt-8 text-sm text-slate-400" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="mb-2">
              <em>Reviewed by <Link href="/founder" className="underline underline-offset-2" style={{ color: GOLD }}>Rohiit Gupta</Link>, Chief Vedic Architect, Trikaal Vaani · Dwarka, New Delhi · UDYAM-DL-10-0119070</em>
            </p>
            <p className="mb-2">
              <strong style={{ color: GOLD }}>Classical sources:</strong> Brihat Parashara Hora Shastra Ch.46-49 (Vimshottari Dasha, Antardasha and Pratyantar computation), Phaladeepika, Saravali. Swiss Ephemeris with Lahiri Ayanamsha for all computation.
            </p>
            <p>
              Poori kundali ka vishleshan chahiye to <Link href="/karmic-background-reading" className="underline underline-offset-2" style={{ color: GOLD }}>Karmic Background Reading</Link> dekhiye, ya saare options <Link href="/pricing" className="underline underline-offset-2" style={{ color: GOLD }}>pricing page</Link> par hain.
            </p>
          </footer>

        </div>
      </main>
    </>
  );
}

function DashaCard({ icon, label, planet, start, end, years, highlight }: any) {
  return (
    <div className="p-4 rounded-xl" style={{
      background: highlight ? GOLD_RGBA(0.1) : 'rgba(2,8,23,0.4)',
      border: `1px solid ${highlight ? GOLD_RGBA(0.45) : GOLD_RGBA(0.2)}`,
    }}>
      <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="text-2xl font-bold mb-2" style={{ color: GOLD }}>{planet || '—'}</div>
      {(start || end) && (
        <div className="text-xs text-slate-400 space-y-0.5">
          {start && <div>Se: <span className="text-slate-300">{formatDate(start)}</span></div>}
          {end && <div>Tak: <span className="text-slate-300">{formatDate(end)}</span></div>}
          {years && <div>Avadhi: <span className="text-slate-300">{years} saal</span></div>}
          {humanLeft(end) && <div style={{ color: GOLD }}>{humanLeft(end)}</div>}
        </div>
      )}
    </div>
  );
}

function TimelineRow({ index, planet, start, end, years }: any) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ background: GOLD_RGBA(0.2), color: GOLD, border: `1px solid ${GOLD_RGBA(0.4)}` }}>{index}</div>
      <div className="flex-1">
        <div className="font-bold text-sm" style={{ color: GOLD }}>{planet || '—'} Mahadasha</div>
        <div className="text-xs text-slate-400 mt-0.5">
          {start && <span>{formatDate(start)}</span>}
          {start && end && <span> → </span>}
          {end && <span>{formatDate(end)}</span>}
          {years && <span className="ml-2 text-slate-500">({years} saal)</span>}
        </div>
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
