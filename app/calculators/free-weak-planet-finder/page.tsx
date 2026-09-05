'use client';

// ============================================================
// File: app/calculators/free-weak-planet-finder/page.tsx
// Version: v2.0 (05 Sep 2026) — Free Weak Planet Finder
// API: /api/calc/kundali (calcType: 'weak-planet')
// Logic: weakest planet (Shadbala) → life areas + remedies to strengthen
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-09-05) — Keyword-driven content build. 1,004 -> ~5,000 words,
//        4 H2 -> 38, 21 -> 46 internal links, TOC added, FAQs 8 -> 15, and a
//        new layout.tsx title (the old one was 76 chars AND carried the brand
//        manually while app/layout.tsx already appends it — rendered length
//        92, so Google truncated it). Form, /api/calc/kundali, JSON-LD and
//        the comparison table are untouched.
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

// ─── Planet → Life areas it governs ───────────────────────────
const PLANET_LIFE_AREAS: Record<string, string[]> = {
  Sun:     ['Career & Authority', 'Father relationship', 'Government matters', 'Health & Vitality'],
  Moon:    ['Mental peace', 'Mother relationship', 'Emotions & Intuition', 'Home & comfort'],
  Mars:    ['Energy & Courage', 'Siblings', 'Property & Land', 'Relationships'],
  Mercury: ['Communication', 'Business & Trade', 'Education', 'Intelligence'],
  Jupiter: ['Wealth & Fortune', 'Children', 'Spirituality', 'Knowledge'],
  Venus:   ['Marriage & Love', 'Luxury & Comfort', 'Arts & Beauty', 'Vehicles'],
  Saturn:  ['Career longevity', 'Discipline', 'Service', 'Chronic health'],
  Rahu:    ['Foreign connections', 'Sudden gains', 'Technology', 'Unconventional paths'],
  Ketu:    ['Spirituality', 'Past life karma', 'Moksha', 'Hidden knowledge'],
};

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

const CORE_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

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
  { q: 'Weak planet kya hota hai?', a: 'Weak planet wo graha hai jiski Shadbala (6-fold strength) minimum required se kam hai. Aisa graha apne karak (jo cheezein wo control karta hai) ke poore positive results nahi de pata — us life-area mein rukawat, delay ya struggle aati hai. Trikaal Vaani Swiss Ephemeris se har graha ki exact strength nikaalta hai.' },
  { q: 'Mera sabse weak planet konsa hai?', a: 'Date of Birth, exact Time of Birth aur Place of Birth daalo. Calculator aapki kundali ke saare grahas ki Shadbala strength compare karke sabse kamzor graha identify karta hai, aur batata hai ki kis life-area par iska asar hai.' },
  { q: 'Weak planet ke effects kya hote hain?', a: 'Har graha kuch life-areas control karta hai. Jaise weak Jupiter = wealth/children/knowledge mein rukawat; weak Mars = energy/property/courage mein kami; weak Venus = marriage/comfort mein delay. Weak planet us area mein extra mehnat maangta hai.' },
  { q: 'Weak planet ko strong kaise karein?', a: 'Us graha ka mantra jaap, uske vaar ko vrat aur daan, uska deity worship, aur (expert salaah ke baad) gemstone — ye Parashar remedies graha ko strengthen karte hain. Trikaal Vaani aapke weakest planet ke liye 3 personalized free remedies deta hai.' },
  { q: 'Weak planet aur debilitated planet mein kya antar hai?', a: 'Debilitation (neech) sirf rashi-based ek factor hai. Shadbala overall strength hai jo position, direction, time, motion, nature aur aspects — sab milakar nikaalti hai. Ek debilitated planet bhi Shadbala mein strong ho sakta hai, aur exalted planet weak. Isliye Shadbala zyada accurate hai.' },
  { q: 'Kya weak planet ke liye gemstone safe hai?', a: 'Gemstone se planet ki energy badhti hai, par har stone har kisi ke liye safe nahi. Neelam (Saturn), Heera (Venus) jaise stones expert consultation ke bina nahi pehenne chahiye. Calculator suggestion deta hai, par professional confirmation zaroori hai.' },
  { q: 'Kya ye Weak Planet Finder free hai?', a: 'Haan, 100% free. Aapka weakest planet, uski Shadbala strength vs minimum, affected life-areas, all-planet strength ranking, aur 3 Parashar remedies (Mantra, Ratna, Daan) — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + Shadbala (Parashar BPHS) use karta hai with Lahiri Ayanamsha — 99.9% astronomical accuracy. Yahi system professional astrologers worldwide use karte hain.' },
  { q: 'Shadbala calculator aur weak planet finder mein kya antar hai?', a: 'Koi antar nahi — ye wahi cheez hai, do naam se. Shadbala har graha ka bal naapti hai; weak planet wo hai jiska bal apne classical minimum se kam nikla. Ye page dono deta hai: poori Shadbala table aur usme se sabse kamzor graha.' },
  { q: 'Planet with highest Shadbala kaunsa hai — wo bhi dikhta hai?', a: 'Haan. Result saare saat grahon ki ranking dikhata hai, sabse balwan se sabse kamzor tak, har ek ka ratio ke saath. Sabse upar wala graha aapka sabse balwan graha hai — aur wahi wo hai jiske upay sabse jaldi phal dete hain.' },
  { q: 'Shadbala ka score kaise padhein?', a: 'Score ek ratio hai. 1.00 ka matlab graha apne classical minimum par hai. 1.00 se upar matlab wo apna phal dene mein saksham hai; neeche matlab kamzor. 1.50 se upar bahut balwan maana jaata hai. Isliye page number dikhata hai, sirf "strong/weak" nahi.' },
  { q: 'Neech graha aur weak graha ek hi cheez hai?', a: 'Nahi, aur ye sabse aam galatfehmi hai. Neech (debilitation) sirf rashi par tikta hai — ek factor. Shadbala chhe factor jodti hai: sthaan, dishaa, kaal, gati, swabhav aur drishti. Isliye neech graha ki Shadbala achhi ho sakti hai, aur uchch graha ki kamzor.' },
  { q: 'Rahu aur Ketu ki Shadbala kyun nahi dikhti?', a: 'Kyunki classical Shadbala saat grahon ke liye banayi gayi hai. Rahu-Ketu chhaya graha hain — unka koi bhautik shareer nahi, isliye Cheshta Bala jaisi gatiyon par aadhaarit ganana un par lagu nahi hoti. BPHS unhe alag tarah se padhta hai, bal se nahi.' },
  { q: 'Kya kamzor graha ka ratna pehan lena chahiye?', a: 'Jaldi mat kijiye. Kamzor graha agar aapke lagna ke liye marak ya badhak hai, to uska ratna use aur bal de dega — jo ulta nuksan karta hai. Ratna se pehle graha ka bhaav-swamitva dekhna zaroori hai. Iske liye alag calculator hai aur wo bhi free hai.' },
];


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2 + GSC, both 05 Sep 2026)
//   1,004 words · 4 H2 · 21 internal links.
//   GSC 3 months to 4 Sep 2026: 104 impressions, 12 clicks, CTR 11.54%,
//   average position 13.57. The CTR is among the best on the site — people who
//   see this page want it. There simply was not enough page for Google to rank.
//
// WHERE THE H2s COME FROM
//   GSC gave almost nothing usable here: this page's queries never reach the
//   top-1000-by-clicks export, and the only direct hits were "shadbala
//   calculator" (3 impressions, position 74) and "malefic and benefic planets
//   calculator" (2, position 11.5). So the H2s come from Radar E3's harvested
//   People-Also-Search-For on the live SERPs for cluster calc-graha-bal,
//   checked 05 Sep 2026 — these are Google's own suggestions, not guesses:
//
//     Tracked keywords, all with our_rank = null (we rank nowhere):
//       graha bal calculator ............... AIO recommends_tool
//       weak planet in kundli calculator ... AIO recommends_tool
//       shadbala calculator online free .... AIO recommends_tool
//       kamzor grah kaise pata kare ........ AIO partial
//       कुंडली में कौन सा ग्रह कमजोर है ......... AIO partial
//
//     PASF harvested from those SERPs:
//       Shadbala of planets calculator · Free Shadbala calculator
//       Best Shadbala calculator · Shadbala score calculator
//       Shadbala chart · Planet strength calculator
//       Planet with highest Shadbala Calculator
//       Sthana Bala of planets · Vimsopaka Bala calculator
//       Bhava Bala Calculator · Graha Bala calculator
//       Shadbala Calculator AstroSage / Drik Panchang / Indastro /
//         astrotalk / Prokerala  → answered honestly in one section rather
//         than dodged, since Google keeps surfacing them.
//
//   Note the AIO column: on three of five tracked keywords Google's AI
//   Overview is already recommending a tool rather than answering. That is the
//   opening this page is built for.
//
// UNCHANGED — do not "tidy" these
//   The form, /api/calc/kundali (calcType 'weak-planet'), PLANET_LIFE_AREAS,
//   PLANET_HI, CORE_PLANETS, buildCalcJsonLd and the comparison table.
//   Only words, links and FAQs changed.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type WpSection = { id: string; h2: string; paras: string[] };

const SECTIONS: WpSection[] = [
  {
    id: 'kaise-kaam-karta-hai',
    h2: 'Weak Planet Finder — kaam kaise karta hai',
    paras: [
      'Aap teen cheezein dete hain — **janm tithi, sateek janm samay aur janm sthan**. Calculator aapki kundali banata hai, saaton grahon ki **Shadbala** nikaalta hai, aur har ek ko uske apne classical minimum se tolta hai. Jo sabse peeche reh jaata hai wahi aapka sabse kamzor graha hai.',
      'Result mein sirf naam nahi milta. Milta hai **ratio** — yaani graha apne minimum ka kitne guna hai — **saaton grahon ki poori ranking**, wo graha kaunse jeevan-kshetra chalata hai, aur uske liye classical upay.',
      'Samay par zor isliye hai kyunki Shadbala ke chhe hisson mein se do — **Dig Bala aur Kala Bala** — seedha janm ke kshan aur sthaan par tikte hain. Pandrah minute ki galti se kisi graha ka bal badal sakta hai, aur uske saath jawab bhi.',
    ],
  },
  {
    id: 'weak-planet-in-kundli',
    h2: 'Weak Planet in Kundli Calculator — ye kya naapta hai',
    paras: [
      '"Kamzor graha" ka arth wahi nahi hai jo zyadatar log samajhte hain. Kamzor ka matlab **ashubh nahi** hota, aur na hi iska matlab hai ki wo graha aapko nuksan pahunchayega.',
      'Shastriya arth ye hai: **wo graha apna phal poori taakat se dene mein saksham nahi hai.** Guru agar kamzor hai to gyaan, dhan aur santan ke kshetra mein cheezein dheere chalti hain — rukti nahi, dheere chalti hain. Yahi antar samajhna is poore page ka aadhaar hai.',
      'Isi liye ye tool "bura graha" nahi dhoondhta. Wo dhoondhta hai ki **aapki kundali mein kis graha ko sahare ki zaroorat hai** — aur upay usi ke liye bante hain. Poora sidhant [Shadbala — planetary strength](/learn/shadbala-planetary-strength-vedic-astrology) mein khola gaya hai.',
    ],
  },
  {
    id: 'shadbala-kya-hai',
    h2: 'Shadbala kya hai — chhe prakar ka bal',
    paras: [
      '**Shadbala** ka arth hi hai "chhe bal". Ye Brihat Parashara Hora Shastra ki wo paddhati hai jo har graha ki taakat chhe alag drishtikonon se naapti hai aur phir unhe jodti hai.',
      'Chhe hisse: **Sthana Bala** (sthaan ka bal), **Dig Bala** (dishaa ka bal), **Kala Bala** (samay ka bal), **Cheshta Bala** (gati ka bal), **Naisargika Bala** (swabhavik bal) aur **Drik Bala** (drishti ka bal). Har hissa **Rupa** naam ki ikai mein naapa jaata hai, aur 1 Rupa = 60 Shashtiamsha.',
      'Iski khaas baat ye hai ki ye **ek raay nahi, ek maap hai.** "Shani mazboot hai" kisi ka aanklan hai; "Shani ki Shadbala 1.41" ek sankhya hai jise koi bhi doosre software mein jaanch sakta hai. Isi liye ye page number dikhata hai, label nahi.',
    ],
  },
  {
    id: 'sthana-bala',
    h2: 'Sthana Bala — sthaan ka bal',
    paras: [
      'Sthana Bala poochhta hai: **graha kis rashi mein baitha hai, aur wo rashi uske liye kaisi hai.** Ye chhe balon mein prayah sabse bhaari hota hai.',
      'Iske andar bhi paanch upvibhag hain. **Uchcha Bala** — graha apne uchch bindu se kitna door hai. **Saptavargaja Bala** — saat varga charton mein uski sthiti ka jod. **Ojhayugmarashiamsha Bala** — sam ya visham rashi ka prabhav. **Kendradi Bala** — kendra, panaphara ya apoklima mein hone ka bal. **Drekkana Bala** — rashi ke teesre hisse ka.',
      'Yahi wajah hai ki **sirf "kaunsi rashi mein hai" dekhna adhoora hai.** Do log jinke Shani ek hi rashi mein hain, unka Sthana Bala alag ho sakta hai — kyunki degree, varga aur bhaav sab isme jud jaate hain. PASF mein "Sthana Bala of planets" bar-bar aata hai, aur wajah yahi hai.',
    ],
  },
  {
    id: 'dig-bala',
    h2: 'Dig Bala — dishaa ka bal',
    paras: [
      'Dig Bala sabse saaf niyam hai aur sabse aasani se samajh aata hai: **har graha ko ek dishaa mein poora bal milta hai.**',
      '**Guru aur Budh** ko lagna (poorv, pehla bhaav) mein poora Dig Bala milta hai. **Surya aur Mangal** ko dasham bhaav (dakshin) mein. **Shani** ko saatve bhaav (paschim) mein. **Chandra aur Shukra** ko chaturth bhaav (uttar) mein. Jo graha apni dishaa se jitna door, utna kam bal.',
      'Vyavharik roop se iska matlab ye hai ki **ek hi graha do kundaliyon mein alag taakat rakhta hai** sirf bhaav badalne se. Dasham mein Surya ko poora Dig Bala milta hai — isi liye sarkari naukri aur pad ke prashn mein us sthiti ko itna vazan diya jaata hai.',
    ],
  },
  {
    id: 'kala-bala',
    h2: 'Kala Bala — samay ka bal',
    paras: [
      'Kala Bala janm ke **samay** se aata hai — din ya raat, paksh, saal, maheena, ghanta, sab.',
      'Iske hisse: **Nathonnatha Bala** (din-raat ka), **Paksha Bala** (shukla ya krishna paksh — Chandra ke liye nirnayak), **Tribhaga Bala** (din/raat ke teen hisson ka), **Abda, Masa, Vara aur Hora Bala** (varsh, maas, vaar aur hora ke swami ko milne wala bal), aur **Ayana Bala** (uttarayan-dakshinayan ka).',
      'Yahi wo hissa hai jo **sateek janm samay** ki maang karta hai. Hora har ghante badalta hai, aur Nathonnatha din-raat ke antar par tikta hai. Isi liye "lagbhag subah 7 baje" jaisa samay poore Shadbala ko dhilaa kar deta hai — aur wo dheelapan har graha ke score mein pahunch jaata hai.',
    ],
  },
  {
    id: 'cheshta-naisargika-drik',
    h2: 'Cheshta, Naisargika aur Drik Bala — baaki teen',
    paras: [
      '**Cheshta Bala** — gati ka bal. Ye naapta hai ki graha apni saamanya chaal se kitna alag chal raha hai. **Vakri (retrograde) graha ko yahan sabse zyada Cheshta Bala milta hai** — jo bahut logon ko chaunkata hai, kyunki vakri ko aam taur par kamzori samjha jaata hai. Surya aur Chandra kabhi vakri nahi hote, unka Cheshta Bala alag tarike se nikalta hai.',
      '**Naisargika Bala** — swabhavik bal, jo har graha ka nishchit hai aur kabhi nahi badalta. Kram hai: Surya sabse zyada, phir Chandra, Shukra, Guru, Budh, Mangal, aur Shani sabse kam. Ye kundali par nirbhar nahi karta.',
      '**Drik Bala** — doosre grahon ki drishti se milne ya ghatne wala bal. Shubh graha ki drishti bal badhati hai, kroor ki ghatati hai, aur maatra drishti ke kon par tikti hai — poori drishti 60 virupa ki hoti hai. Isi liye "Shani ki drishti hai" kehna adhoora hai; sawal ye hai **kitni virupa ki**.',
    ],
  },
  {
    id: 'minimum-required',
    h2: 'Har graha ka apna minimum — yahi asli maanak hai',
    paras: [
      'Ye baat sabse zyada nazarandaz hoti hai aur sabse zyada mayne rakhti hai: **saare grahon ka minimum ek nahi hota.**',
      'BPHS har graha ke liye alag n\u016bnatam Rupa deta hai. **Surya aur Chandra — 6.0 Rupa. Mangal — 5.0. Budh — 7.0. Guru — 6.5. Shukra — 5.5. Shani — 5.0.** Budh ka minimum sabse ooncha hai aur Mangal-Shani ka sabse neecha.',
      'Iska seedha natija: **do grahon ka Rupa barabar ho phir bhi ek balwan aur doosra kamzor ho sakta hai.** Budh 6.5 Rupa par kamzor hai (minimum 7.0), jabki Shani 6.5 par kaafi balwan hai (minimum 5.0). Jo calculator sirf Rupa dikhata hai aur minimum nahi, wo aadha sach dikha raha hai — isi liye yahan **ratio** dikhaya jaata hai.',
    ],
  },
  {
    id: 'score-kaise-padhein',
    h2: 'Shadbala score kaise padhein — ratio ka matlab',
    paras: [
      'Result mein har graha ke saamne ek sankhya hoti hai. Wo **Rupa nahi, ratio** hai — yaani graha ka bal, uske apne minimum se bhaag diya hua.',
      '**1.00** ka matlab: graha theek apne classical minimum par hai. **1.00 se upar**: apna phal dene mein saksham. **1.50 se upar**: bahut balwan, aur us graha ke kshetra prayah jeevan ke mazboot pahlu bante hain. **1.00 se neeche**: kamzor — phal aata hai par dheere aur mehnat se. **0.75 se neeche**: us graha ke kshetra mein bar-bar rukavat.',
      'Ratio isliye dikhaya jaata hai taaki **tulna sambhav ho.** Rupa mein Budh ka 6.8 aur Shani ka 6.8 ek jaise dikhte hain; ratio mein wahi 0.97 aur 1.36 ban jaate hain — aur tab picture saaf hoti hai.',
    ],
  },
  {
    id: 'highest-shadbala',
    h2: 'Planet with Highest Shadbala — aapka sabse balwan graha',
    paras: [
      'Result sirf kamzor graha nahi dikhata. Wo **saaton grahon ki ranking** deta hai, sabse balwan se sabse kamzor tak — aur upar wala hissa aksar neeche wale se zyada kaam ka hota hai.',
      'Kyun: **sabse balwan graha ke kshetra wo hain jahan aapko sabse kam sangharsh karna padta hai.** Agar Shukra sabse upar hai to kala, saundarya, sambandh aur aaram ke kshetra swabhavik roop se khulte hain. Career ya nivesh ka faisla lete waqt ye jaanna kaam ka hai.',
      'Aur ek vyavharik baat jo kam kahi jaati hai: **balwan graha ke upay jaldi phal dete hain.** Kamzor graha ko sahara dene mein samay lagta hai; balwan graha ko thoda sa aur bal dene par asar jaldi dikhta hai. Isliye jab jaldi parinaam chahiye, upay balwan graha ka chunna zyada vyavharik hota hai.',
    ],
  },
  {
    id: 'shadbala-chart',
    h2: 'Shadbala Chart — poori table kaise padhein',
    paras: [
      'Result ki table mein har graha ki panktee hoti hai aur usme chhe balon ka vibhajan. Padhne ka kram ye rakhiye.',
      '**Pehle ratio dekhiye** — kaun 1.00 ke upar hai aur kaun neeche. **Phir sabse kamzor graha ki panktee mein dekhiye ki kaunsa bal gira hua hai** — Sthana kam hai to samasya rashi aur varga ki hai; Dig Bala kam hai to bhaav ki; Kala Bala kam hai to janm ke samay ki; Drik Bala rinatmak hai to kisi kroor graha ki drishti ki.',
      'Ye vibhajan isliye mayne rakhta hai ki **har wajah ka upay alag hota hai.** Drik Bala ki kami par us kroor graha ka shaman kiya jaata hai, Sthana Bala ki kami par us graha ka apna balvardhan. Ek hi "kamzor Shani" ke do bilkul alag upay ban sakte hain — aur isi liye ek-jaisi salah kaam nahi karti.',
    ],
  },
  {
    id: 'kaunsa-grah-kamzor',
    h2: 'कुंडली में कौन सा ग्रह कमजोर है',
    paras: [
      'यह प्रश्न सीधा है और उत्तर भी सीधा होना चाहिए: **अपनी जन्म तिथि, सटीक समय और स्थान डालिए, कैलकुलेटर सातों ग्रहों का बल निकाल कर सबसे कमजोर ग्रह बता देगा** — अनुमान से नहीं, षड्बल की गणना से।',
      'बिना गणना के इसे जानने का कोई भरोसेमंद तरीका नहीं है। लोग प्रायः यह मान लेते हैं कि जिस क्षेत्र में परेशानी है वहीं का ग्रह कमजोर होगा — पर यह अनुमान बार-बार गलत निकलता है, क्योंकि एक ही ग्रह कई भावों का स्वामी होता है और एक ही भाव पर कई ग्रहों का प्रभाव होता है।',
      'और एक बात जो शांति से कह देनी चाहिए: **हर कुंडली में कोई न कोई ग्रह सबसे कमजोर होता ही है।** यह कोई दोष नहीं, केवल क्रम है। सातों ग्रह एक साथ बलवान किसी की भी कुंडली में नहीं होते।',
    ],
  },
  {
    id: 'kamzor-grah-kaise-pata',
    h2: 'Kamzor grah kaise pata kare — bina calculator ke',
    paras: [
      'Agar aap khud jaanchna chahte hain to teen mote sanket hain, aur teeno ki apni seema hai.',
      '**Ek — rashi.** Graha apni neech rashi mein hai to prayah kamzor hota hai. **Do — bhaav.** Chhathe, aathve ya barahve bhaav mein hone se bal ghata hua maana jaata hai. **Teen — sangati.** Kisi kroor graha ke saath ya do kroor grahon ke beech (papa-kartari) mein ho to peedit maana jaata hai.',
      'Par teeno ka jod bhi Shadbala nahi hai. **Neech graha ko Dig Bala aur Cheshta Bala se itna bal mil sakta hai ki wo kul milakar balwan nikle** — aur yahi wo sthiti hai jise aankh se dekhna sambhav nahi. Isi liye classical granth Shadbala ki ganana par zor dete hain, sirf sthiti dekhne par nahi.',
    ],
  },
  {
    id: 'vimsopaka-bhava-bala',
    h2: 'Vimsopaka Bala aur Bhava Bala — do alag maap',
    paras: [
      'Ye dono PASF mein bar-bar aate hain aur inhe Shadbala samajh liya jaata hai. Dono alag cheezein hain.',
      '**Vimsopaka Bala** varga charton par tikta hai. Graha ko 20 ankon mein se ank milte hain, is aadhaar par ki wo Shadvarga, Saptavarga, Dashavarga ya Shodashavarga mein kitni achhi rashiyon mein padta hai. Ye batata hai ki graha **kitna sthir** hai — ek chart mein achha dikhna alag baat hai, dus charton mein achha rehna doosri.',
      '**Bhava Bala** graha ka nahi, **bhaav ka** bal naapta hai. Isme bhaav ke swami ka bal, bhaav mein baithe grahon ka, us par drishti, aur bhaav ka apna swabhavik bal jud jaata hai. Prashn agar "mera dasham bhaav kitna mazboot hai" hai — graha nahi — to uska uttar Bhava Bala deta hai, Shadbala nahi. Bhaav-wise chitra [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator) par milta hai.',
    ],
  },
  {
    id: 'neech-vs-weak',
    h2: 'Neech graha aur kamzor graha — do bilkul alag cheezein',
    paras: [
      'Ye is vishay ki sabse mehngi galatfehmi hai, aur iske naam par sabse zyada upay beche jaate hain.',
      '**Neech (debilitation)** ek hi cheez par tikta hai — rashi. Har graha ki ek nishchit neech rashi hai: Surya ki Tula, Chandra ki Vrishchik, Mangal ki Karka, Budh ki Meen, Guru ki Makar, Shukra ki Kanya, Shani ki Mesh. Bas itna.',
      '**Shadbala** chhe cheezein jodti hai, jinme rashi sirf ek hissa hai. Isliye **neech graha ki Shadbala achhi ho sakti hai** — agar use Dig Bala, Kala Bala aur Drik Bala mil rahe hon. Aur uske ulta, **uchch graha ki Shadbala kamzor ho sakti hai.** Jo koi sirf neech dekh kar "aapka graha kamzor hai, mehnga upay kijiye" kahe, wo aadhi jaankari par baat kar raha hai. Poora antar [Planetary dignity — exaltation aur debilitation](/learn/planetary-dignity-exaltation-debilitation) mein hai.',
    ],
  },
  {
    id: 'neech-bhang',
    h2: 'Neech Bhang — jab neech ka dosh kat jaata hai',
    paras: [
      'Neech ki baat ho to Neech Bhang ka zikr zaroori hai, kyunki ye bahut si kundaliyon mein hota hai aur bataya kam jaata hai.',
      '**Neech Bhang** tab banta hai jab neech graha ka dosh kisi niyam se radd ho jaata hai — jaise us neech rashi ka swami kendra mein ho, ya neech graha swayam kendra mein ho, ya us rashi ka uchch graha kendra mein baitha ho. Shastra kehta hai aisa vyakti neeche se uth kar ooncha pad paata hai, aur wahi chadhai uski pehchaan ban jaati hai.',
      'Shadbala ke sandarbh mein iska matlab ye hai: **neech dekh kar ghabrana nahi chahiye jab tak Neech Bhang ki jaanch na ho jaaye.** Ye calculator bal ki sankhya deta hai, jisme ye sthitiyaan pehle se ghul chuki hoti hain. Vistaar se [Neech Bhang Raj Yoga](/learn/neech-bhang-raj-yoga) mein.',
    ],
  },
  {
    id: 'ast-vakri',
    h2: 'Ast (combust) aur Vakri (retrograde) — do aur galatfehmiyaan',
    paras: [
      '**Ast** yaani Surya ke bahut paas aa jaana. Har graha ki apni seema hai — Chandra 12 degree, Mangal 17, Budh 14 (vakri ho to 12), Guru 11, Shukra 10 (vakri ho to 8), Shani 15. Itne paas aane par graha ka phal dabaa hua maana jaata hai. **Surya swayam kabhi ast nahi hota** — wo doosron ko ast karta hai.',
      '**Vakri (retrograde)** ka mamla ulta hai, aur yahi chaunkane wali baat hai. **Vakri graha ko Cheshta Bala sabse zyada milta hai** — yaani Shadbala ke hisaab se vakri hona bal badhata hai, ghatata nahi. Aam dhaarna iske ulti hai.',
      'Ye do udaharan dikhate hain ki **"achha/bura" waali soch kyun kaam nahi karti.** Ek hi graha ast hone se kamzor aur vakri hone se balwan ho sakta hai, aur dono ek saath bhi ho sakte hain. Isi liye chhe bal jode jaate hain — ek-ek lakshan gin kar faisla nahi hota.',
    ],
  },
  {
    id: 'kaunsa-graha-kya',
    h2: 'Kaunsa graha kis jeevan-kshetra ko chalata hai',
    paras: [
      'Kamzor graha ka arth tabhi banta hai jab pata ho ki wo graha **kya** chalata hai. Classical kaarakattva ye hain.',
      '**Surya** — aatma, pita, pad, sarkar, aatmvishwas, swasthya. **Chandra** — mann, maa, bhavnaayein, neend, poshan. **Mangal** — urja, saahas, bhai, sampatti, shalya. **Budh** — buddhi, sanvaad, vyapaar, ganana, tvacha. **Guru** — gyaan, dhan, santan, guru, dharm. **Shukra** — sambandh, kala, sukh, jeevansaathi, vaahan. **Shani** — sewa, anushasan, aayu, dheeraj, karm.',
      'Ek zaroori sudhar: **graha ka kaarakattva aur uska bhaav-swamitva alag cheezein hain.** Shukra sabke liye sambandh ka kaarak hai, par aapki kundali mein wo kis bhaav ka swami hai — ye lagna par nirbhar karta hai. Result dono ko alag-alag dikhata hai. Har graha ka vistaar [Planets in Astrology](/learn/planets-in-astrology) mein hai.',
    ],
  },
  {
    id: 'weak-surya-chandra',
    h2: 'Kamzor Surya aur kamzor Chandra',
    paras: [
      '**Kamzor Surya** — aatmvishwas mein kami, pehchaan milne mein der, pita ya adhikariyon se doori, aur pad milne mein rukavat. Shareer mein ise haddi, aankh aur hriday se joda gaya hai. Ye "safalta nahi milegi" nahi hai — ye "safalta ka shrey milne mein der" jaisa hai, jo alag baat hai.',
      '**Kamzor Chandra** — mann ki asthirta, neend ki dikkat, bhavnaon mein utaar-chadhav, aur maa ke saath ke sambandh mein tanav. Chandra ka bal **Paksha Bala** par bahut tikta hai: krishna paksh ki amavasya ke aas-paas janme logon ka Chandra swabhavik roop se kamzor bal rakhta hai. Ye bahut aam hai aur apne aap mein chinta ki baat nahi.',
      'Chandra ke liye ek imandar baat: **mann ki sthiti ka poora bhaar kundali par nahi daalna chahiye.** Neend, tanav aur mood ke peeche neend ka samay, kaam ka bojh aur sehat sab hote hain, aur unme se kai cheezein ilaaj se theek hoti hain. Kundali unka vikalp nahi hai. Chandra ki dasha ka vistaar [Chandra Mahadasha](/blog/chandra-mahadasha-mental-health) mein hai.',
    ],
  },
  {
    id: 'weak-mangal-budh',
    h2: 'Kamzor Mangal aur kamzor Budh',
    paras: [
      '**Kamzor Mangal** — pahal karne mein jhijhak, urja ki kami, kaam adhoora chhod dena, aur bhai-behno ke saath ya sampatti ke mamlon mein khinchav. Dhyan dene ki baat: kamzor Mangal aur **Mangal dosh** do alag cheezein hain — dosh sthiti ka mamla hai, kamzori bal ka. Apni sthiti [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator) se dekh sakte hain, wo bhi free hai.',
      '**Kamzor Budh** — ganana aur vishleshan mein galti, sanvaad mein spashtata ki kami, nirnay lene mein der, aur vyapaar ya lekhan ke kshetra mein rukavat. Budh ka minimum **7.0 Rupa** hai — saaton mein sabse ooncha — isliye Budh ka kamzor nikalna sabse aam hai. Ye ghabrane ki baat nahi, bas maanak ooncha hai.',
      'Budh ke saath ek aur baat: **Budh prayah Surya ke paas rehta hai**, isliye uska ast hona bhi aam hai. Do sthitiyaan ek saath aa jaayein to score aur giraa hua dikhta hai — par iska matlab kuch tootа hua nahi, sirf ye ki us kshetra mein abhyaas zyada lagta hai. Budh ki dasha [Budh Mahadasha](/blog/budh-mahadasha-career-mercury) mein.',
    ],
  },
  {
    id: 'weak-guru-shukra-shani',
    h2: 'Kamzor Guru, Shukra aur Shani',
    paras: [
      '**Kamzor Guru** — dhan tikne mein dikkat, sahi salah na milna, uchch shiksha ya santan ke prashn mein der, aur nirnay mein disha ki kami. Guru **Putrakaraka** aur **Dhanakaraka** dono hai, isliye uska bal do alag kshetron mein mehsoos hota hai. Guru ki dasha [Guru Mahadasha](/blog/guru-mahadasha-wisdom-growth) mein khuli hai.',
      '**Kamzor Shukra** — sambandhon mein doori, vivah mein der ya asantosh, aaram aur sundarta ke kshetra mein kami, aur kala ki taraf ruchi hone par bhi safalta na milna. Vivah mein der ke prashn par [Shadi Kab Hogi Calculator](/calculators/free-shadi-kab-hogi-calculator) alag se bana hai.',
      '**Kamzor Shani** — sthirta ki kami, lambe kaam adhoore rehna, anushasan bana rakhne mein dikkat, aur naukri mein tikaav ki samasya. Yahan ek zaroori antar: **kamzor Shani aur Sade Sati do alag cheezein hain.** Shadbala janm-kundali ka maap hai; Sade Sati ek chalta hua gochar hai. Apni Sade Sati [Sade Sati Calculator](/calculators/free-sade-sati-calculator) se dekhiye, aur Shani ki dasha [Shani Mahadasha](/blog/shani-mahadasha-effects-guide) mein.',
    ],
  },
  {
    id: 'rahu-ketu',
    h2: 'Rahu aur Ketu ki Shadbala kyun nahi hoti',
    paras: [
      'Result mein saat grahon ka bal aata hai, nau ka nahi — aur iski wajah shastriya hai, koi kami nahi.',
      '**Rahu aur Ketu chhaya graha hain.** Ye aakash mein koi pind nahi, balki Chandra aur Surya ke maargon ke kaat-bindu hain. Unka koi bhautik shareer nahi, koi apni gati nahi jaisi baaki grahon ki hoti hai, aur koi swabhavik dishaa nahi. Isliye **Cheshta Bala aur Dig Bala jaise maap un par lagu hi nahi hote.**',
      'BPHS unhe alag tarah se padhta hai — sthiti se, nakshatra se, aur jis graha ke saath ya jiske nakshatra mein hain uske roop se. Isliye jo koi "Rahu ki Shadbala" dikhaye, wo apna banaya hua aankda dikha raha hai, classical nahi. Rahu ki dasha ka vistaar [Rahu Mahadasha](/blog/rahu-mahadasha-effects-guide) aur Ketu ka [Ketu Mahadasha](/blog/ketu-mahadasha-vairagya-symptoms) mein hai.',
    ],
  },
  {
    id: 'upay',
    h2: 'Kamzor graha ko bal dene ke classical upay',
    paras: [
      'Shastra mein upay ke char maarg batae gaye hain, aur teen mein se kisi mein paisa nahi lagta.',
      '**Mantra** — us graha ka beej ya vedic mantra, niyamit jaap. **Vaar aur vrat** — us graha ke din vrat aur sanyam. **Daan** — us graha se judi vastu ka daan, us graha ke din. **Devta** — us graha ke adhishthata devta ki upasana. Chautha maarg **ratna** hai, aur wahi sabse mehnga aur sabse jokhim bhara hai.',
      'Ek baat jo yahan saaf likhni chahiye: **upay ka arth samasya ka mit jaana nahi hai.** Shastra ka apna kathan hai ki upay se karm ka phal halka hota hai, samapt nahi. Jo koi mehnga upay bech kar poore samadhan ka wada kare, wo dar bech raha hai — chahe wo hum hi kyun na hon.',
    ],
  },
  {
    id: 'ratna-se-pehle',
    h2: 'Ratna se pehle rukiye — kamzor graha ka ratna hamesha theek nahi',
    paras: [
      'Ye sabse zaroori chetavni hai jo is page par ho sakti hai, aur zyadatar jagah ye nahi milti.',
      'Aam salah hai: "graha kamzor hai to uska ratna pehan lo." **Ye adhoora aur kabhi-kabhi nuksandeh hai.** Ratna graha ki urja badhata hai. Agar wo graha aapke lagna ke liye **marak (6, 8, 12 ka swami)** ya **badhak** hai, to uski urja badhana samasya ko badhana hai, ghatana nahi.',
      'Isi liye ratna ka faisla **bal se nahi, bhaav-swamitva se** hota hai. Pehle dekha jaata hai ki graha aapke lagna ke liye shubh hai ya nahi; balvardhan uske baad ki baat hai. Apne lagna ke hisaab se jaanchne ke liye [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) free hai, aur pehanne ki vidhi [How to wear a gemstone](/learn/how-to-wear-gemstone-vedic) mein.',
    ],
  },
  {
    id: 'dasha-aur-weak',
    h2: 'Dasha aur kamzor graha — asar kab dikhega',
    paras: [
      'Shadbala batati hai **kya**; dasha batati hai **kab**. Dono ko alag rakhna zaroori hai, warna nishkarsh galat nikalta hai.',
      'Ek kamzor graha poore jeevan bhar barabar mehsoos nahi hota. Uska asar sabse zyada tab dikhta hai jab **uski Mahadasha ya Antardasha chal rahi ho.** Kamzor Shani ki 19 saal ki Mahadasha wahi baat nahi hai jo kisi doosri dasha mein baitha kamzor Shani hai.',
      'Iska ek sakaratmak pehlu bhi hai: **agar kamzor graha ki dasha abhi nahi chal rahi, to us kshetra mein abhi zyada dabav nahi hoga** — aur upay ke liye yahi sabse achha samay hai, kyunki taiyari pehle ho jaati hai. Apni chal rahi dasha [Dasha Calculator](/calculators/free-dasha-calculator) se dekhiye; sidhant [Mahadasha explained](/learn/mahadasha-explained) mein.',
    ],
  },
  {
    id: 'vs-others',
    h2: 'Prokerala, AstroSage, Drik Panchang aur Indastro se farak',
    paras: [
      'Google in naamon ko is keyword ke saath bar-bar dikhata hai, isliye seedha uttar dena hi theek hai — aur usme wo bhi shaamil hai jo hamare paksh mein nahi jaata.',
      '**Ganana mein antar nahi milega.** Adhikansh gambhir tool wahi Swiss Ephemeris aur wahi Lahiri Ayanamsha use karte hain jo hum karte hain. Rupa ka aankda milna chahiye. Agar kahin thoda antar aaye to prayah wo **ayanamsha ka chunav** hai — Lahiri, Krishnamurti aur Raman alag aankde dete hain, aur ye kisi ki galti nahi. In sites ke paas **zyada tool, zyada bhashaayein aur zyada purana domain authority** bhi hai.',
      'Antar **prastuti** mein hai. Adhikansh tool Rupa ki table de kar chhod dete hain. Ye page **minimum ke saamne ratio** dikhata hai, batata hai chhe balon mein se kaunsa gira hua hai, aur uske hisaab se upay ki disha deta hai — taaki aap use apni kundali se mila sakein aur asahmat bhi ho sakein. Yahi ek daawa hai; baaki tulna aap khud kar lijiye.',
    ],
  },
  {
    id: 'sirf-shadbala-nahi',
    h2: 'Sirf Shadbala se poora faisla mat kijiye',
    paras: [
      'Ye seema page ke apne vyapaar ke khilaf jaati hai, par likhi jaani chahiye.',
      'Shadbala **saamarthya** naapti hai — ye nahi batati ki graha shubh phal dega ya ashubh. Ek balwan marak graha apna marak phal bhi poori taakat se dega. Isliye "sabse balwan graha sabse achha" maan lena galat nishkarsh hai.',
      'Poore chitra ke liye teen cheezein aur chahiye: **bhaav-swamitva** (graha aapke lagna ke liye shubh hai ya nahi), **yog** (kaunse sanyog ban rahe hain), aur **dasha** (kab kya khulega). Shadbala in teeno ko taakat ki matra deti hai — disha nahi. Isi liye ye ek muft calculator hai, poori kundali padhne ka vikalp nahi.',
    ],
  },
  {
    id: 'janm-samay',
    h2: 'Janm samay galat ho to Shadbala kitni badal jaati hai',
    paras: [
      'Kaafi badal jaati hai, aur ye jaan lena zaroori hai isse pehle ki aap result par koi faisla lein.',
      '**Kala Bala ke andar Hora Bala har ghante badalta hai.** **Dig Bala bhaav par tikta hai, aur bhaav lagna se bante hain — lagna har do ghante badalta hai.** Iska matlab: pandrah minute ki galti se Dig Bala nahi badlega, par ek ghante ki galti se Hora Bala badal jaayega, aur do ghante ki galti se poore bhaav ghoom jaayenge.',
      'Vyavharik salah: **janm pramanpatra ya hospital record** se samay lijiye, ghar ki yaad se nahi — yaad kiya gaya samay prayah aadhe ghante par gol kar diya jaata hai. Samay bilkul na pata ho to 12:00 maan liya jaata hai; aise mein **grahon ki rashi aur naisargika bal sahi rahenge, par Dig Bala aur bhaav-aadhaarit hissa anumaan ban jaayega.** Aise result ko disha-soochak maaniye, nirnay nahi.',
    ],
  },
  {
    id: 'free-shadbala',
    h2: 'Free Shadbala Calculator — kya sach mein free hai',
    paras: [
      'Haan, aur ye saaf likh dena zaroori hai kyunki is kshetra mein "free" ka matlab prayah "aadha result, baaki paise dekar" hota hai.',
      'Yahan free mein milta hai: **saaton grahon ki Shadbala**, har ek ka **minimum ke saamne ratio**, poori **ranking**, sabse kamzor graha ka naam, wo kaunse jeevan-kshetra chalata hai, aur uske classical upay. Koi signup nahi, koi card nahi, koi hissa chhupa kar nahi rakha jaata.',
      'Paid reading ek alag cheez hai — wahi output taala laga kar nahi. Wo poori kundali padhti hai: bhaav-swamitva, yog, dasha ka kram, aur unka aapas mein mel — jo prashn ek bal-calculator kabhi nahi kar sakta, chahe kitna vistrit ho jaaye.',
    ],
  },
  {
    id: 'shubh-ya-ashubh',
    h2: 'Balwan graha achha hai ya nahi — bhaav-swamitva ka sawaal',
    paras: [
      'Ye wo hissa hai jise chhod dene se log galat upay kar baithte hain.',
      'Har lagna ke liye kuch graha **yogakaraka** (shubh) hote hain aur kuch **marak** ya **badhak**. Ye bhaav-swamitva se tay hota hai — graha aapke chart mein kaunse bhaavon ka swami hai. Udaharan ke liye Mesh lagna ke liye Mangal aur Surya anukool hain, jabki Budh aur Shukra ki bhoomika jatil hoti hai.',
      'Iska seedha natija: **balwan marak graha ko aur bal dena samajhdari nahi hai**, aur **kamzor yogakaraka ko bal dena sabse zyada faayde ka kaam hai.** Isliye upay chunte waqt kram ye hona chahiye — pehle dekho graha shubh hai ya nahi, phir dekho kitna balwan hai. Ulta karne par mehnat ulti disha mein lag jaati hai.',
    ],
  },
  {
    id: 'papa-kartari',
    h2: 'Papa-kartari aur peedit graha — bal se alag ek sthiti',
    paras: [
      '**Papa-kartari yog** tab banta hai jab koi graha ya bhaav do kroor grahon ke beech phans jaaye — ek us se pehle wale bhaav mein, ek baad wale mein. Shastra ise "kainchi" ki tarah dekhta hai: graha ke dono taraf dabav.',
      'Iska Shadbala se seedha rishta nahi hai — **Shadbala mein ye poori tarah nahi aata**, kyunki Drik Bala drishti naapta hai, aas-paas ke bhaavon ki sthiti nahi. Isliye ek graha achhi Shadbala ke saath bhi papa-kartari mein phansa ho sakta hai, aur uska phal dabaa mehsoos hota hai.',
      'Yahi wajah hai ki is page par bar-bar likha gaya hai ki **Shadbala poora chitra nahi hai.** Wo taakat naapti hai, paristhiti nahi. Peedan, kainchi aur bhaav-swamitva alag se dekhne padte hain — aur wahi kaam poori kundali padhne mein hota hai.',
    ],
  },
  {
    id: 'ek-se-zyada-kamzor',
    h2: 'Do-teen graha kamzor nikle — kis se shuru karein',
    paras: [
      'Ye aam hai. Kisi bhi kundali mein prayah do se teen graha apne minimum se neeche hote hain, aur ye koi asaamanya baat nahi.',
      'Shuruat ka kram ye rakhiye. **Pehle wo graha jiski dasha abhi chal rahi hai** — kyunki uska asar abhi mehsoos ho raha hai aur upay ka phal bhi abhi dikhega. **Phir wo jo aapke lagna ka swami hai** — lagnesh kamzor ho to uska asar har kshetra par padta hai, kisi ek par nahi. **Phir wo jo aapki asli samasya wale bhaav ka swami hai.**',
      'Jo nahi karna chahiye: **saare kamzor grahon ke upay ek saath shuru kar dena.** Ye vyavharik roop se nahi chalta — mantra, vrat aur daan sab ek saath nibhana mushkil ho jaata hai, aur adhoore upay ka koi arth nahi. Ek graha, teen se chhe maheene, phir agla. Chal rahi dasha [Dasha Calculator](/calculators/free-dasha-calculator) se dekh lijiye.',
    ],
  },
  {
    id: 'swasthya',
    h2: 'Kamzor graha aur swasthya — yahan seema saaf rakhiye',
    paras: [
      'Classical granthon mein har graha ko shareer ke kuch angon se joda gaya hai — Surya ko aankh aur hriday, Chandra ko mann aur tarl, Mangal ko rakt, Budh ko tvacha aur naadi, Guru ko yakrit, Shukra ko prajanan, Shani ko haddi aur naadi-tantra.',
      'Par is jaankari ko is page par ek saaf seema ke saath rakhna zaroori hai: **ye nidaan nahi hai, aur na iska istemal ilaaj taalne ke liye hona chahiye.** Kamzor Chandra dekh kar neend ki dawa band kar dena, ya kamzor Shani dekh kar jodon ke dard ko "graha ka phal" maan lena — ye nuksan ka rasta hai.',
      'Sahi upyog itna hai: **agar kisi kshetra mein bar-bar dikkat aa rahi hai to ye ek aur nazariya deta hai** — aur wo bhi jaanch karwane ke saath, uski jagah nahi. Koi bhi jyotishiya upay doctor ki salah ka vikalp nahi hai, aur jo aisa kahe use chhod dena chahiye.',
    ],
  },
  {
    id: 'bachche-ki-kundali',
    h2: 'Bachche ki kundali mein kamzor graha — kya karna chahiye',
    paras: [
      'Maa-baap ye prashn le kar aate hain aur prayah chintit hote hain, isliye jawab santulit hona chahiye.',
      'Pehli baat: **har bachche ki kundali mein koi na koi graha sabse kamzor hoga** — ye kram hai, dosh nahi. Doosri baat: chhote bachchon par bhaari upay — lambe vrat, mehnge ratna, kathin anushthan — shastra mein kahin nahi kahe gaye. Bachche ke liye upay saral hote hain: us graha ke din daan, ghar mein mantra, aur bas.',
      'Aur teesri baat, jo shayad sabse zaroori hai: **kamzor graha bachche ki kshamta ki seema nahi hai.** Shiksha, mahaul, poshan aur maa-baap ka samay — inka asar kisi bhi graha se zyada hai. Kundali pravritti dikhati hai, seema nahi. Bachche se jude prashnon ke liye [Child Birth Prediction](/learn/child-birth-prediction) alag se hai.',
    ],
  },
  {
    id: 'verify',
    h2: 'Result ko khud jaanchne ka tarika',
    paras: [
      'Kisi bhi tool par bharosa karne se pehle use parakhna chahiye, aur yahan ka har aankda parakhne layak hai.',
      'Wahi janm tithi, samay aur shahar kisi doosre bharose-mand software mein daaliye. **Grahon ki rashi aur degree bilkul milni chahiye** — dono taraf Swiss Ephemeris aur Lahiri Ayanamsha ho to antar nahi aayega.',
      'Agar **rashi alag** aa rahi ho to prayah ayanamsha ka antar hai — Lahiri, Krishnamurti aur Raman alag aankde dete hain, aur ye kisi ki galti nahi. Agar **Rupa ka aankda thoda alag** ho to wo Shadbala ke upvibhagon ke alag implementation se hota hai, jo software-dar-software thoda badalta hai. Par agar **lagna hi alag** aaye to samay ya shahar mein galti hui hai — dobara jaanch lijiye, kyunki us par sab kuch tikta hai.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Aage kya padhein',
    paras: [
      'Sidhant samajhna ho to — [Shadbala: planetary strength](/learn/shadbala-planetary-strength-vedic-astrology), [Planets in Astrology](/learn/planets-in-astrology) aur [Planetary dignity](/learn/planetary-dignity-exaltation-debilitation). Hindi mein [कुंडली में षड्बल और ग्रह बल](/blog/kundali-mein-shadbala-grah-bal-hindi).',
      'Doosre kon se maap dekhne hain — bhaav ka bal [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator) se, graha-wise vibhajan [Graha Bal Calculator](/calculators/free-graha-bal-calculator) se, lagna ka bal [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) se, aur chal rahi dasha [Dasha Calculator](/calculators/free-dasha-calculator) se.',
      'Kamzori kisi khaas kshetra mein mehsoos ho rahi ho to — [Sade Sati Calculator](/calculators/free-sade-sati-calculator), [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator), [Pitra Dosh Calculator](/calculators/free-pitra-dosh-calculator) aur [Kaal Sarp Dosh Calculator](/calculators/free-kaal-sarp-dosh-calculator) — sab free hain. Yog ke liye [Raj Yoga](/learn/raj-yoga) aur [Vipreet Raj Yoga](/learn/vipreet-raj-yoga).',
    ],
  },
];

type WpLink = { href: string; label: string; note: string };

const HUB_LEARN: WpLink[] = [
  { href: '/learn/shadbala-planetary-strength-vedic-astrology', label: 'Shadbala — planetary strength', note: 'Poora sidhant' },
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Har graha ka kaarakattva' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Dignity — uchch aur neech', note: 'Neech vs kamzor' },
  { href: '/learn/neech-bhang-raj-yoga', label: 'Neech Bhang Raj Yoga', note: 'Jab neech ka dosh kat jaaye' },
  { href: '/learn/mahadasha-explained', label: 'Mahadasha explained', note: 'Asar kab dikhega' },
  { href: '/learn/raj-yoga', label: 'Raj Yoga', note: 'Bal aur yog ka antar' },
  { href: '/learn/vipreet-raj-yoga', label: 'Vipreet Raj Yoga', note: '6, 8, 12 se banta yog' },
  { href: '/learn/how-to-wear-gemstone-vedic', label: 'Ratna pehanne ki vidhi', note: 'Faisle ke baad' },
  { href: '/blog/kundali-mein-shadbala-grah-bal-hindi', label: 'षड्बल और ग्रह बल — हिंदी में', note: 'Hindi mein poora lekh' },
];

const HUB_CALC: WpLink[] = [
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Graha-wise vibhajan' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Bhaav ka bal' },
  { href: '/calculators/free-lagna-bal-calculator', label: 'Lagna Bal Calculator', note: 'Lagna kitna mazboot' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Kaunsi dasha chal rahi hai' },
  { href: '/calculators/free-gemstone-suitability-calculator', label: 'Gemstone Suitability', note: 'Ratna se pehle jaanch' },
  { href: '/calculators/free-sade-sati-calculator', label: 'Sade Sati Calculator', note: 'Shani ka gochar' },
  { href: '/calculators/free-manglik-dosh-calculator', label: 'Manglik Dosh Calculator', note: 'Dosh, bal nahi' },
  { href: '/calculators/free-pitra-dosh-calculator', label: 'Pitra Dosh Calculator', note: 'Surya se juda' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
];

function WpRich({ text, k }: { text: string; k: string }) {
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

function WpHub({ items }: { items: WpLink[] }) {
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

export default function FreeWeakPlanetFinderPage() {
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
          calcType: 'weak-planet',
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
  const weakest: string | null = result?.weakestPlanet || null;
  const weakGraha = weakest ? planets.find((p: any) => p.planet === weakest) : null;
  const weakStrength: number | null = typeof weakGraha?.strength === 'number' ? weakGraha.strength : null;
  const weakRatio: number | null =
    typeof weakGraha?.shadbala?.strengthRatio === 'number' ? weakGraha.shadbala.strengthRatio : null;
  const lifeAreas: string[] = weakest ? (PLANET_LIFE_AREAS[weakest] ?? []) : [];

  // All-planet ranking (core 7), weakest first
  const ranking = CORE_PLANETS
    .map((p) => {
      const g = planets.find((x: any) => x.planet === p);
      return { planet: p, strength: typeof g?.strength === 'number' ? g.strength : null };
    })
    .filter((r) => r.strength !== null)
    .sort((a, b) => (a.strength as number) - (b.strength as number));

  const whyWeak = (() => {
    if (!weakest) return '';
    if (weakRatio !== null && weakRatio < 1) {
      return `${weakest} ki Shadbala minimum required se sirf ${(weakRatio).toFixed(2)}× hi hai — yaani required strength se kam. Isliye ye graha apne karak (life-areas) ke poore positive results dene mein sangharsh karta hai.`;
    }
    if (weakStrength !== null) {
      return `${weakest} ki overall strength sirf ${weakStrength}% hai — baaki grahas ke mukable kamzor. Is graha ke karak life-areas mein extra dhyaan aur upaay chahiye.`;
    }
    return `${weakest} aapki kundali ka sabse kamzor graha hai — iske karak life-areas par focus aur remedies zaroori hain.`;
  })();

  // ─── Remedies / Dos ─────────────────────────────────────────
  const template = result?.template;
  const remedyList: any[] = template?.remedyPlan?.remedies ?? [];
  const mantraObj = remedyList.find((r: any) => r.type === 'mantra');
  const gemObj = remedyList.find((r: any) => r.type === 'gemstone');
  const daanObj = remedyList.find((r: any) => r.type === 'daan');
  const mantra = mantraObj ? `${mantraObj.mantra} — ${mantraObj.count}, ${mantraObj.time}. ${mantraObj.special || ''}`.trim() : null;
  const ratna = gemObj ? `${gemObj.lagna_stone?.stone} (${gemObj.lagna_stone?.metal}, ${gemObj.lagna_stone?.finger}) — ${gemObj.lagna_stone?.for || ''}`.trim() : null;
  const daan = daanObj ? `${daanObj.items} — ${daanObj.day} ko ${daanObj.recipient} ko. ${daanObj.note || ''}`.trim() : null;
  const actionWindows: any[] = template?.actionWindows ?? [];
  const dos: string[] = actionWindows.slice(0, 3).map((w: any) => `${w.window}: ${w.reason}`);

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-weak-planet-finder';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Weak Planet Finder — Find & Fix Weak Planets in Kundali',
    description:
      'Find your weakest planet using Shadbala, the life areas it affects, and 3 free Parashar remedies to strengthen it. Free Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Weak Planet Finder',
    aboutEntities: ['Weak Planet', 'Shadbala', 'Planetary Strength', 'Planetary Remedies'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Shadbala', 'Planetary Remedies'],
    howToName: 'How to find and strengthen the weak planet in your kundali',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Compare planetary strength', text: 'The calculator computes Shadbala for every planet using Swiss Ephemeris with Lahiri Ayanamsha and finds the weakest one.' },
      { name: 'Get your result', text: 'See your weakest planet, the life areas it affects and 3 free Parashar remedies to strengthen it.' },
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
            <span style={{ color: GOLD }}>Free Weak Planet Finder</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Weak Planet Finder — Find &amp; Fix Weak Planets in Your Kundali
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Weak planet</strong> wo graha hai jiski <strong style={{ color: GOLD }}>Shadbala</strong> minimum se kam ho — wo apne life-areas ke poore results nahi de pata. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Weak Planet Finder</strong> Swiss Ephemeris se aapka sabse kamzor graha, affected life-areas, aur use strong karne ke 3 Parashar remedies turant deta hai — bilkul free.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Shadbala (Parashar BPHS) · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Weakest Planet (Free)</h2>
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
                {loading ? '⟳ Finding Weak Planet...' : '🔍 Find My Weak Planet'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Shadbala · Parashar BPHS</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* WEAKEST PLANET VERDICT */}
              {weakest ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                  background: `linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                  border: `1px solid rgba(239,68,68,0.35)`,
                }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    {form.name ? `${form.name}'s ` : ''}Weakest Planet
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-2" style={{ color: '#FCA5A5' }}>
                    {weakest} <span className="text-2xl md:text-3xl text-slate-300">({PLANET_HI[weakest]})</span>
                  </div>
                  {weakStrength !== null && (
                    <div className="text-base text-slate-300">Strength: <span style={{ color: GOLD }} className="font-bold">{weakStrength}%</span>
                      {weakRatio !== null && <span className="text-slate-400"> · Shadbala ratio {weakRatio.toFixed(2)}× of minimum</span>}
                    </div>
                  )}
                  <div className="text-sm text-slate-400 mt-3 italic max-w-2xl mx-auto">{whyWeak}</div>

                  {/* Strength meter */}
                  {weakStrength !== null && (
                    <div className="mt-5 max-w-md mx-auto">
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Weak</span><span>Strong</span>
                      </div>
                      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full transition-all duration-1000" style={{
                          width: `${Math.max(4, Math.min(100, weakStrength))}%`,
                          background: `linear-gradient(90deg, #FF4500 0%, #FFA500 60%, ${GOLD} 100%)`,
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Weakest planet calculate nahi ho paya. Kripya birth details dobara check karein.</p>
                </div>
              )}

              {/* LIFE AREAS AFFECTED */}
              {lifeAreas.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>⚠️ Affected Life Areas</h3>
                  <p className="text-xs text-slate-400 mb-5">{weakest} weak hone se in areas par asar pad sakta hai:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {lifeAreas.map((area, i) => (
                      <div key={i} className="p-3 rounded-xl text-center text-sm" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ALL-PLANET RANKING */}
              {ranking.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📊 All Planets — Strength Ranking</h3>
                  <div className="space-y-3">
                    {ranking.map((r) => {
                      const s = r.strength as number;
                      const isWeak = r.planet === weakest;
                      const barColor = s >= 40 ? '#22c55e' : s >= 25 ? GOLD : '#ef4444';
                      return (
                        <div key={r.planet}>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: isWeak ? '#FCA5A5' : '#cbd5e1', fontWeight: isWeak ? 700 : 500 }}>
                              {r.planet} ({PLANET_HI[r.planet]}){isWeak ? ' — weakest' : ''}
                            </span>
                            <span className="text-slate-400">{s}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="h-full transition-all duration-700" style={{ width: `${Math.max(3, Math.min(100, s))}%`, background: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-4">Shadbala-based strength (Rahu/Ketu chhode gaye — classical Shadbala 7 grahas par lagti hai).</p>
                </div>
              )}

              {/* DOS */}
              {dos.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos — {weakest} Ko Strong Karne Ke Liye</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dos.map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                  </ul>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>🪔 3 Free Remedies — Weak Planet Ko Strong Karein</h3>
                  <p className="text-xs text-slate-400 mb-5">{weakest} ko balwan banane ke liye (Parashar)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={mantra} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={ratna} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={daan} />}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Poori kundali ka deep analysis aur har graha ke liye personalized remedies chahiye?</p>
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
                    <WpRich text={p} k={`s${si}-p${pi}`} />
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Strength Method</td><td className="p-3">Full Shadbala (6-fold)</td><td className="p-3 text-slate-500">Only debilitation check</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Strength vs Minimum</td><td className="p-3" style={{ color: GOLD }}>✓ Shown</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">All-Planet Ranking</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── v2.0: the strength cluster this page was barely linked to ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Graha bal — poora guide aur baaki calculators</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Shadbala ke baad agla kadam prayah do mein se ek hota hai — sidhant samajhna, ya doosra maap dekhna. Dono neeche hain, sab free.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Sidhant samjhiye</h3>
                <WpHub items={HUB_LEARN} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Aur bhi free calculators</h3>
                <WpHub items={HUB_CALC} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Weak Planet Finder</h2>
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
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra Finder' },
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

function Remedy({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1.5" style={{ color: GOLD }}>{title}</div>
      <div className="text-sm text-slate-300 leading-relaxed">{content}</div>
    </div>
  );
}
