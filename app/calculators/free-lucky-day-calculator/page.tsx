'use client';

// ============================================================
// File: app/calculators/free-lucky-day-calculator/page.tsx
// Version: v2.0 (05 Sep 2026) — Free Lucky Day Calculator
// API: /api/calc/kundali (calcType: 'lucky-day')
// Logic: strongest planet (Shadbala) → lucky day/color/number/metal/direction
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-09-05) — Keyword-driven content build from Radar E3 PASF.
//        ~1,000 -> ~5,200 words, 4 H2 -> 36, TOC added, FAQs 8 -> 15,
//        new layout.tsx title. Form, /api/calc/kundali (calcType 'lucky-day'),
//        the graha->day/colour/number table and the JSON-LD are untouched.
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

// ─── Planet → Lucky attributes ────────────────────────────────
const LUCKY_DATA: Record<string, { day: string; day_hi: string; color: string; number: number; metal: string; direction: string; deity: string }> = {
  Sun:     { day: 'Sunday',    day_hi: 'रविवार',   color: 'Red / Orange',   number: 1, metal: 'Gold',   direction: 'East',       deity: 'Surya Dev'   },
  Moon:    { day: 'Monday',    day_hi: 'सोमवार',   color: 'White / Silver', number: 2, metal: 'Silver', direction: 'North-West', deity: 'Lord Shiva'  },
  Mars:    { day: 'Tuesday',   day_hi: 'मंगलवार',  color: 'Red',            number: 9, metal: 'Copper', direction: 'South',      deity: 'Hanuman ji'  },
  Mercury: { day: 'Wednesday', day_hi: 'बुधवार',   color: 'Green',          number: 5, metal: 'Bronze', direction: 'North',      deity: 'Ganesh ji'   },
  Jupiter: { day: 'Thursday',  day_hi: 'गुरुवार',  color: 'Yellow',         number: 3, metal: 'Gold',   direction: 'North-East', deity: 'Lord Vishnu' },
  Venus:   { day: 'Friday',    day_hi: 'शुक्रवार', color: 'White / Pink',   number: 6, metal: 'Silver', direction: 'South-East', deity: 'Maa Lakshmi' },
  Saturn:  { day: 'Saturday',  day_hi: 'शनिवार',   color: 'Black / Blue',   number: 8, metal: 'Iron',   direction: 'West',       deity: 'Shani Dev'   },
  Rahu:    { day: 'Saturday',  day_hi: 'शनिवार',   color: 'Blue / Smoke',   number: 4, metal: 'Lead',   direction: 'South-West', deity: 'Maa Durga'   },
  Ketu:    { day: 'Tuesday',   day_hi: 'मंगलवार',  color: 'Grey / Multi',   number: 7, metal: 'Iron',   direction: 'South',      deity: 'Ganesh ji'   },
};

const WEEKDAYS: { day: string; day_hi: string; planet: string }[] = [
  { day: 'Sunday',    day_hi: 'रविवार',   planet: 'Sun'     },
  { day: 'Monday',    day_hi: 'सोमवार',   planet: 'Moon'    },
  { day: 'Tuesday',   day_hi: 'मंगलवार',  planet: 'Mars'    },
  { day: 'Wednesday', day_hi: 'बुधवार',   planet: 'Mercury' },
  { day: 'Thursday',  day_hi: 'गुरुवार',  planet: 'Jupiter' },
  { day: 'Friday',    day_hi: 'शुक्रवार', planet: 'Venus'   },
  { day: 'Saturday',  day_hi: 'शनिवार',   planet: 'Saturn'  },
];

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
  { q: 'Lucky day kaise pata chalta hai?', a: 'Aapka lucky day aapki kundali ke sabse strong graha (Shadbala) se decide hota hai. Har planet ek weekday ka swami hai — Sun ka Sunday, Moon ka Monday, Mars ka Tuesday, etc. Jis planet ki strength sabse zyada, uska vaar aapka lucky day banta hai. Trikaal Vaani Swiss Ephemeris se ye calculate karta hai.' },
  { q: 'Mera lucky day konsa hai?', a: 'Date of Birth, exact Time of Birth aur Place of Birth daalo. Calculator aapki kundali banakar Shadbala se strongest planet nikaalta hai, aur uske swami-vaar ko aapka lucky day declare karta hai — saath mein lucky color, number, metal aur direction bhi.' },
  { q: 'Lucky color aur lucky number kaise nikalte hain?', a: 'Strongest planet se. Jaise Mars strong ho to lucky color Red, number 9, metal Copper. Sun strong ho to color Red/Orange, number 1, metal Gold. Har planet ke apne shubh rang, ank aur dhaatu Jyotish mein fixed hain.' },
  { q: 'Kya lucky day har kaam ke liye shubh hai?', a: 'Lucky day important decisions ke liye best hota hai — interview, business deal, naya kaam shuru karna, shopping, ya koi shubh aarambh. Roz-marra ke kaam kisi bhi din ho sakte hain, par bade decisions lucky day pe lene se shubh phal milte hain.' },
  { q: 'Lucky day by date of birth kaise nikalein?', a: 'Sirf DOB se approximate andaaza lagta hai, par accurate result ke liye time aur place of birth bhi chahiye — kyunki strongest planet exact birth chart (Shadbala) se hi nikalta hai. Trikaal Vaani teeno leke 99.9% astronomical accuracy deta hai.' },
  { q: 'Weekly calendar kya batata hai?', a: 'Calculator har weekday ko uske swami-graha ki strength ke hisaab se mark karta hai — Lucky (strong graha), Neutral, ya Challenging (weak graha). Isse aapko pata chalta hai ki hafte ke kis din kaam aasan rahega aur kis din careful rehna hai.' },
  { q: 'Kya ye Lucky Day Calculator free hai?', a: 'Haan, 100% free. Strongest planet, lucky day, lucky color, lucky number, lucky metal, lucky direction, weekly lucky/neutral/challenging calendar aur 3 Parashar remedies (Mantra, Ratna, Daan) — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + Shadbala (Parashar BPHS ki 6-fold planetary strength system) use karta hai with Lahiri Ayanamsha. Yahi system professional astrologers worldwide use karte hain — 99.9% astronomical accuracy.' },
  { q: 'Is it my lucky day today — aaj ka din mere liye kaisa hai?', a: 'Result mein saat dinon ka calendar aata hai, jisme har din ko us din ke swami graha ke bal ke hisaab se ank mila hota hai. Aaj kaunsa vaar hai, wo dekh kar aap turant jaan sakte hain. Par yaad rahiye ye saptah ka sthir chakra hai — har Somwar aapke liye ek jaisa hai, kyunki wo aapki janm-kundali se nikalta hai, aaj ke aakash se nahi.' },
  { q: 'Lucky day by date of birth — sirf tareekh se nikal sakta hai?', a: 'Adhoora nikalta hai. Sirf tareekh se Chandra rashi aur uska swami mil jaata hai, aur us aadhaar par ek mota andaaza lagta hai. Par asli lucky day aapke sabse balwan graha se nikalta hai, aur uska bal Shadbala se aata hai — jisme Dig Bala aur Kala Bala dono janm samay par tikte hain. Isi liye ye page samay maangta hai.' },
  { q: 'Lucky day aur shubh muhurat mein kya antar hai?', a: 'Bahut bada antar hai. Lucky day aapki apni kundali se nikalta hai aur wo saptah bhar mein ek sthir din hai. Muhurat kisi khaas kaam ke liye kisi khaas kshan ka chunav hai, aur wo us din ke panchang par tikta hai — tithi, nakshatra, yoga, karana. Shaadi ya griha pravesh jaise kaam ke liye muhurat chahiye, lucky day kaafi nahi.' },
  { q: 'Kya lucky day par har kaam safal ho jaata hai?', a: 'Nahi, aur jo tool aisa kahe usse door rahiye. Lucky day ka arth itna hai ki us din aapke sabse balwan graha ka vaar hai, aur paramapara mein use anukool maana jaata hai. Taiyari, kaushal aur paristhiti apni jagah rehte hain. Din chunna madad kar sakta hai; kaam wahi karega jo kaam karega.' },
  { q: 'Do calculator alag lucky day kyun bata rahe hain?', a: 'Teen wajah hain. Ek — kuch tool sirf Chandra rashi se nikalte hain, kuch poori Shadbala se; dono alag jawab denge. Do — ayanamsha ka antar (Lahiri, Krishnamurti, Raman) grahon ki degree badal deta hai. Teen — janm samay galat ho to Dig Bala aur Kala Bala badal jaate hain aur sabse balwan graha hi badal sakta hai.' },
  { q: 'Lucky number aur lucky colour ka aadhaar kya hai?', a: 'Dono aapke sabse balwan graha se aate hain — us graha ka paramparik ank aur uska rang. Ye ank-shastra se nahi aate; ye graha ka classical sambandh hai. Isi liye yahan nikla lucky number kisi numerology site ke ank se alag ho sakta hai, aur dono galat nahi — aadhaar alag hai.' },
  { q: 'Kya lucky day badal sakta hai?', a: 'Janm-aadhaarit lucky day nahi badalta, kyunki wo aapke janm ke kshan ke bal par tikta hai. Jo badalta hai wo gochar hai — grah aakash mein chalte rehte hain aur kisi daur mein koi aur din behtar lag sakta hai. Par ye page janm ka sthir aankda deta hai, roz ka mausam nahi.' },
];


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2, 05 Sep 2026)
//   ~1,000 words · 4 H2 · 21 internal links.
//   GSC 3 months to 4 Sep 2026: NO DATA AT ALL — this page did not appear in
//   the top-1000-by-clicks export, meaning it earns close to zero impressions.
//   Along with free-baby-name-by-nakshatra it is the least visible page in the
//   thin-calculator batch.
//
// WHERE THE H2s COME FROM — Radar E3, live SERP PASF, checked 05 Sep 2026,
// cluster calc-rashi-numerology:
//     lucky day calculator astrology ...... our_rank —  AIO recommends_tool
//
//   PASF harvested and answered below:
//     Is it my lucky day today · Lucky Calendar today
//     What are my lucky days this month · What is my lucky day of the week
//     Lucky days astrology · Lucky days of the week
//     Lucky dates by date of birth · Lucky date of birth number
//     Lucky Year calculator by date of birth
//     Luckiest birthday date astrology · Top 10 luckiest birthday date
//     What are my lucky days to gamble  → refused, see the note below.
//
// TWO REFUSALS THAT MUST SURVIVE ANY REWRITE
//   (1) GAMBLING. "What are my lucky days to gamble" is a real PASF entry on
//       this SERP and it is deliberately NOT courted. The page says plainly
//       that no chart picks winning bets and that treating a lucky day as
//       permission to gamble is how people lose money. Ranking for that query
//       is not worth what it would cost the reader.
//   (2) "LUCKIEST BIRTHDAY DATE". The PASF wants a ranked list of lucky birth
//       dates. There is no such list in the classical texts — luck is not a
//       property of a calendar date, it is a property of a whole chart. The
//       page says so instead of inventing a top-ten.
//
// KEYWORD SPLIT — deliberate, do not undo
//   Radar files rashi, numerology and lucky-day in ONE cluster; the site has
//   separate pages. This page owns lucky DAY, colour, number, metal and
//   direction — all derived from the strongest planet.
//     /calculators/free-numerology-calculator — mulank, bhagyank, naamank
//     /calculators/free-rashi-calculator      — Chandra Rashi
//     /calculators/free-child-birth-muhurat-calculator — muhurat, a different
//       question entirely (a chosen moment, not a recurring weekday)
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type LdSection = { id: string; h2: string; paras: string[] };

const SECTIONS: LdSection[] = [
  {
    id: 'kaise-kaam',
    h2: 'Lucky Day Calculator — kaam kaise karta hai',
    paras: [
      'Aap **janm tithi, sateek samay aur sthan** dete hain. Calculator aapki kundali banata hai, saaton grahon ka **Shadbala** nikaalta hai, aur dekhta hai kaunsa graha sabse balwan hai. **Us graha ka vaar hi aapka lucky day hai.**',
      'Uske saath aata hai us graha ka **rang**, **ank**, **dhatu** aur **dishaa** — sab classical sambandh se. Aur ek **saptah ka calendar**, jisme saaton dinon ko unke swami grahon ke bal ke hisaab se ank mila hota hai.',
      'Ganana Swiss Ephemeris aur Lahiri Ayanamsha par hoti hai. Samay par zor isliye hai ki Shadbala ke do hisse — **Dig Bala aur Kala Bala** — seedha janm ke kshan par tikte hain, aur unke badalne se sabse balwan graha hi badal sakta hai.',
    ],
  },
  {
    id: 'kyun-balwan-graha',
    h2: 'Lucky day sabse balwan graha se kyun nikalta hai',
    paras: [
      'Ye tarika kuch logon ko chaunkata hai — wo maante hain ki lucky day rashi se ya mulank se aata hai. Wajah samajh leni chahiye.',
      'Har vaar ka ek **swami graha** hai: Ravivar Surya, Somwar Chandra, Mangalwar Mangal, Budhwar Budh, Guruwar Guru, Shukrawar Shukra, Shanivar Shani. Us din us graha ka prabhav prabal maana jaata hai.',
      'Ab tark seedha hai: **agar aapki kundali mein Guru sabse balwan hai, to Guruwar wo din hai jab aapka sabse mazboot graha aur din ka swami ek hi hai.** Do cheezein ek disha mein. Isi liye ye tarika mulank se behtar maana jaata hai — mulank sirf tareekh se banta hai aur duniya ke har nauve vyakti ka wahi hai, jabki Shadbala aapki apni kundali se nikalti hai.',
    ],
  },
  {
    id: 'lucky-day-of-week',
    h2: 'What is my lucky day of the week — seedha jawab',
    paras: [
      'Seedha uttar: **apni janm tithi, samay aur sthan daaliye — din turant mil jaayega, bilkul free.**',
      'Par ek baat jaan lena zaroori hai. Kuch site aapko rashi ke aadhaar par din bata deti hain — jaise "Simha rashi walon ka Ravivar". **Wo poore Bharat ke lagbhag har barahve vyakti ke liye ek hi uttar hai.** Ye page uske bajaye aapki apni kundali dekhta hai, isliye do Simha rashi walon ka lucky day alag aa sakta hai.',
      'Aur ek imandar baat: **agar do grahon ka bal lagbhag barabar hai to do din bhi anukool ho sakte hain.** Aise mein result dono dikhata hai, kyunki ek chunna banaawat hoti.',
    ],
  },
  {
    id: 'saptah-ka-calendar',
    h2: 'Saptah ka calendar — saaton din ka ank',
    paras: [
      'Sirf ek "lucky day" jaan lena aadhi jaankari hai. Asli kaam ka hissa **poora saptah** hai.',
      'Result har vaar ko ank deta hai, us din ke swami graha ke Shadbala ratio ke aadhaar par. Isse teen cheezein saaf hoti hain: **kaunsa din sabse achha**, **kaunsa sabse kam anukool**, aur **beech ke din kaunse hain** — jo prayah saptah ke adhikansh din hote hain.',
      'Vyavharik upyog isi mein hai. Sabse achha din har hafte ek hi baar aata hai aur har kaam us din nahi ho sakta. **Beech ke dinon ka pata hona zyada kaam ka hai** — kyunki asli chunav prayah "aaj ya kal" ka hota hai, "is hafte ya agle" ka nahi.',
    ],
  },
  {
    id: 'saat-vaar-swami',
    h2: 'Saat vaar aur unke swami — poora naksha',
    paras: [
      'Ye jodi sthir hai aur yaad rakhne layak, kyunki isi par poora hisaab khada hai.',
      '**Ravivar — Surya.** Adhikaar, pehchan, sarkari kaam. **Somwar — Chandra.** Mann, ghar, maa, jal se jude kaam. **Mangalwar — Mangal.** Urja, saahas, sampatti, shalya. **Budhwar — Budh.** Sanvaad, vyapaar, likhat-padhat, ganana.',
      '**Guruwar — Guru.** Gyaan, salah, dhan, shubh aarambh. **Shukrawar — Shukra.** Sambandh, kala, saundarya, kharidari. **Shanivar — Shani.** Sewa, anushasan, lambe kaam, mehnat.',
      'Ek baat jo aksar galat samjhi jaati hai: **Shanivar ko "ashubh din" maanna galat hai.** Agar aapki kundali mein Shani sabse balwan hai to Shanivar aapka sabse anukool din hai. Din ka swabhav aapke graha ke bal se badalta hai, sabke liye ek jaisa nahi hota.',
    ],
  },
  {
    id: 'lucky-colour',
    h2: 'Lucky colour — kahan se aata hai',
    paras: [
      'Rang bhi usi sabse balwan graha se aata hai, kisi alag paddhati se nahi.',
      '**Surya** — laal aur narangi. **Chandra** — safed aur chandi jaisa. **Mangal** — laal aur gehra laal. **Budh** — hara. **Guru** — peela aur sunehra. **Shukra** — safed, gulabi aur halke rang. **Shani** — neela, kaala aur gehra rang.',
      'Kitna vazan dena chahiye — imandari se, **bahut zyada nahi.** Ye ek sahayak sanket hai, niyam nahi. Anukool rang pehanne se kisi graha ka bal nahi badalta; wo mantra, vrat aur daan jaise classical upayon se hota hai. Rang ko ek chhota sa sahara maaniye.',
      'Aur ek baat: **agar aapko wo rang pasand nahi hai to mat pehniye.** Aatm-vishwas se pehna hua rang kisi "lucky" rang se zyada kaam karta hai — aur ye baat kisi shastra ke khilaf nahi jaati.',
    ],
  },
  {
    id: 'lucky-number-dhatu',
    h2: 'Lucky number, dhatu aur dishaa',
    paras: [
      'Teen aur cheezein usi graha se nikalti hain, aur teeno ka aadhaar classical hai.',
      '**Ank** — Surya 1, Chandra 2, Guru 3, Rahu 4, Budh 5, Shukra 6, Ketu 7, Shani 8, Mangal 9. **Dhatu** — Surya taamba, Chandra chandi, Mangal taamba, Budh kaansa, Guru sona, Shukra chandi, Shani loha. **Dishaa** — Surya poorv, Chandra uttar-paschim, Mangal dakshin, Budh uttar, Guru uttar-poorv, Shukra dakshin-poorv, Shani paschim.',
      'Ek zaroori antar: **yahan ka lucky number numerology ke mulank se alag hai.** Yahan wo graha ka classical ank hai; wahan wo janm tareekh ka jod hai. Do alag aadhaar, isliye do alag ank — aur koi galat nahi. Mulank dekhna ho to [Numerology Calculator](/calculators/free-numerology-calculator) alag se hai.',
    ],
  },
  {
    id: 'gambling-nahi',
    h2: 'Jua, satta aur "lucky day" — yahan saaf mana',
    paras: [
      'Ye sawal is vishay ke saath sabse zyada dhoondha jaata hai, isliye uska uttar saaf aur bina lagi-lipti hona chahiye.',
      '**Koi kundali ye nahi bata sakti ki kaunsi baazi jeetegi.** Na Shadbala, na dasha, na koi lucky day. Jo koi jyotish ke naam par jua, satta, lottery ya trading ki "shubh tareekh" beche, wo galat bech raha hai — aur uska nuksaan seedha aapki jeb par padta hai.',
      'Aur ek gehri baat: **"lucky day" ko jua khelne ki ijaazat maan lena hi wo tarika hai jisse log paisa haarte hain.** Jokhim din badalne se kam nahi hota; sirf aatm-vishwas badhta hai, aur wahi sabse mehnga hota hai.',
      'Is page ka lucky day **faisle, shuruat, baatcheet aur zaroori kaam** ke liye hai — kismat aazmane ke liye nahi. Ye baat hum na chhupate hain na is query par khade hone ki koshish karte hain.',
    ],
  },
  {
    id: 'luckiest-birthday',
    h2: 'Sabse lucky janm tareekh kaunsi hai — imandar uttar',
    paras: [
      'Ye khoj bahut hoti hai — "top 10 luckiest birthday date" jaisi soochiyaan bhi bahut milti hain. Uttar seedha hai.',
      '**Aisi koi soochi shastra mein nahi hai.** Kismat kisi tareekh ka gun nahi hai — wo poori kundali ka mel hai. Ek hi din paida hue do log bilkul alag jeevan jeete hain, kyunki unka lagna, bhaav aur dasha alag hain. Sirf tareekh se kuch tay nahi hota.',
      'Jo tareekh ke baare mein sach hai wo itna hai ki **us din Chandra kis rashi mein tha aur kaunsa nakshatra chal raha tha** — aur wo bhi poore din ek jaisa nahi rehta.',
      'To agar kahin "sabse bhagyashali janm tareekhon ki soochi" mile, to wo content banaya gaya hai, ganana nahi. Apni asli sthiti dekhni ho to [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator) free hai — wo tareekh nahi, poora chart dekhta hai.',
    ],
  },
  {
    id: 'lucky-dates',
    h2: 'Lucky dates by date of birth — mahine ki kaunsi tareekhein',
    paras: [
      'Din ke saath log tareekhein bhi dhoondhte hain, aur is par do alag paramparaein hain — dono jaan leni chahiye.',
      '**Jyotish wali** — mahine ki wo tareekhein jo aapke lucky vaar par padti hain. Yaani agar aapka din Guruwar hai to us mahine ke saare Guruwar. Iska aadhaar wahi Shadbala hai jo upar samjhaya gaya.',
      '**Ank-shastra wali** — wo tareekhein jinka ank aapke mulank se mel khaata hai. Ye alag paddhati hai aur uska aadhaar symbolic hai, khagolik nahi.',
      'Dono ko mila kar padhna galat nishkarsh deta hai, kyunki unke aadhaar alag hain. **Ek paddhati chuniye aur usi par rahiye.** Ank wali paddhati ke liye [Numerology Calculator](/calculators/free-numerology-calculator) hai; ye page jyotish wali deta hai.',
    ],
  },
  {
    id: 'lucky-day-vs-muhurat',
    h2: 'Lucky day aur shubh muhurat — bilkul alag cheezein',
    paras: [
      'Ye antar sabse zyada mayne rakhta hai aur sabse kam samjha jaata hai.',
      '**Lucky day aapki kundali se nikalta hai.** Wo saptah bhar mein ek sthir din hai aur zindagi bhar wahi rehta hai, kyunki wo aapke janm ke bal par tikta hai. **Muhurat us din ke aakash se nikalta hai** — us kshan ki tithi, nakshatra, yoga, karana aur lagna. Wo har din, har ghante badalta hai.',
      'Kab kaunsa: **rozmarra ke faisle, baatcheet, shuruat aur zaroori kaam** — lucky day kaafi hai. **Shaadi, griha pravesh, naye vyapaar ka aarambh, ya planned delivery** — wahan muhurat chahiye, aur sirf lucky day dekh lena galti hai.',
      'Dono ek saath sabse achhe hain — wo din jo aapka lucky day bhi ho aur us din ka panchang bhi anukool ho. Muhurat ke liye [Panchang](/panchang) aur delivery ke prashn par [Child Birth Muhurat Calculator](/calculators/free-child-birth-muhurat-calculator) alag hain.',
    ],
  },
  {
    id: 'do-graha-barabar',
    h2: 'Do din anukool nikle to kaunsa chunein',
    paras: [
      'Ye aam hai — jab do grahon ka bal lagbhag barabar ho, do din anukool nikalte hain. Chunne ka tarika hai.',
      '**Kaam ke swabhav se chuniye.** Guruwar salah, shiksha, dhan aur shubh aarambh ke liye. Budhwar likhat-padhat, sanvaad, vyapaar aur ganana ke liye. Shukrawar sambandh, kala aur kharidari ke liye. Shanivar lambe, dheeraj wale kaam ke liye. Mangalwar wo kaam jinme takkar chahiye.',
      'Yaani agar aapke do din Guruwar aur Mangalwar hain, to **baatcheet Guruwar par rakhiye aur muqabla Mangalwar par.** Ye chunav aankde se nahi, kaam se hota hai.',
      'Aur agar dono barabar lagen to **jo pehle aa raha hai wahi le lijiye.** Do din ke chakkar mein hafta gawa dena kisi shastra mein nahi likha.',
    ],
  },
  {
    id: 'kis-kaam-ke-liye',
    h2: 'Lucky day kis kaam ke liye sach mein kaam ka hai',
    paras: [
      'Har cheez ke liye din chunna vyavharik nahi hai. Kuch jagah iska arth banta hai aur kuch jagah nahi.',
      '**Arth banta hai:** naukri ke liye interview ya baatcheet, bade faisle ki meeting, kisi ko manaana, naya kaam shuru karna, zaroori aavedan bhejna, pehli mulaqat. Yaani wahan jahan **aapki apni urja aur aatm-vishwas** farak daalte hain.',
      '**Arth nahi banta:** rozmarra ke kaam, wo kaam jinki tareekh doosre tay karte hain, aur emergency. Doctor ke paas jaana, jaanch karana ya ilaaj shuru karna kabhi lucky day ke liye nahi taalna chahiye — wo nuksan ka rasta hai.',
      'Aur ek imandar baat: **agar din tay karna aapke haath mein nahi hai to iski chinta chhod dijiye.** Adhikansh zindagi anukool din par nahi chalti, aur wo theek hai.',
    ],
  },
  {
    id: 'lucky-year',
    h2: 'Lucky year — saal bhi nikal sakta hai?',
    paras: [
      'Ye PASF mein aata hai — "Lucky Year calculator by date of birth" — aur uska uttar dono paddhatiyon mein alag hai.',
      '**Numerology ka uttar** personal year hai — janm tareekh, mahina aur chalta saal jod kar ek ank. Wo saral hai par ek hi din paida hue sab logon ka ek hoga.',
      '**Jyotish ka uttar zyada gehra hai — dasha.** Aapke jeevan ka har daur kisi graha ki Mahadasha mein chalta hai, aur wo daur saalon lamba hota hai. Jo saal aapke **balwan graha ki dasha** mein aate hain, wahi asli anukool saal hain — aur wo har vyakti ke alag hain, kyunki dasha janm nakshatra se shuru hoti hai.',
      'Isliye "lucky year" ka sahi uttar is page par nahi, [Dasha Calculator](/calculators/free-dasha-calculator) par hai — aur wo bhi free hai. Sidhant [Mahadasha explained](/learn/mahadasha-explained) mein.',
    ],
  },
  {
    id: 'kamzor-din',
    h2: 'Sabse kam anukool din — usse darne ki zaroorat nahi',
    paras: [
      'Calendar mein ek din sabse neeche bhi hoga, aur log usse ghabra jaate hain. Wo ghabrahat bemaani hai.',
      '**Har kundali mein koi na koi graha sabse kamzor hota hai** — ye kram hai, dosh nahi. Uska vaar sabse kam anukool nikalta hai. Iska matlab ye bilkul nahi ki us din kuch bura hoga.',
      'Iska vyavharik arth itna hai ki **us din bade naye faisle taalna behtar maana jaata hai** — agar taalna sambhav ho. Rozmarra ka kaam waise hi chalta rahega.',
      'Aur jo saaf kehna chahiye: **us din yatra na karna, kaam par na jaana, ya kisi se na milna — aisi koi salah shastra mein nahi hai.** Jo koi kisi din ko "manhoos" bataye aur uska upay beche, wo dar bech raha hai.',
    ],
  },
  {
    id: 'lucky-day-badalta',
    h2: 'Ye din zindagi bhar wahi rahega?',
    paras: [
      'Do hisse hain aur unhe alag rakhna zaroori hai.',
      '**Janm-aadhaarit lucky day nahi badalta.** Wo aapke janm ke kshan ki Shadbala par tikta hai, aur wo sankhya jeevan bhar wahi rehti hai. Koi upay, koi ratna use nahi badalta — aur jo koi "aapka lucky day badal denge" kahe, wo galat keh raha hai.',
      '**Gochar badalta rehta hai.** Grah aakash mein chalte rehte hain, aur kisi daur mein koi doosra din behtar lag sakta hai — khaas kar jab us graha ki dasha chal rahi ho. Ye anubhav ka badalna hai, janm-bal ka nahi.',
      'Isliye is page ka aankda **ek baar nikaal kar rakh lene** wali cheez hai. Har hafte chalane se wahi aayega, aur wahi aana chahiye.',
    ],
  },
  {
    id: 'rashi-se-alag',
    h2: 'Rashi ke lucky day se ye alag kyun aata hai',
    paras: [
      'Aapne kahin padha hoga ki "Mesh rashi ka lucky day Mangalwar hai". Yahan wo alag nikal sakta hai, aur wajah samajh leni chahiye.',
      '**Rashi wala tarika** seedha hai: aapki Chandra rashi ka jo swami graha hai, uska vaar. Mesh ka swami Mangal, isliye Mangalwar. Ye saral hai par **duniya ke har barahve vyakti ke liye ek hi uttar hai.**',
      '**Yahan wala tarika** aapke sabse balwan graha se chalta hai, jo Shadbala se nikalta hai. Do Mesh rashi walon ka sabse balwan graha alag ho sakta hai, isliye unka lucky day bhi alag.',
      'Kaunsa behtar hai — imandari se, **jo aapki apni kundali se nikle wahi.** Par agar aapke paas janm samay nahi hai to rashi wala tarika bhi ek mota andaaza de deta hai. Apni Chandra rashi [Rashi Calculator](/calculators/free-rashi-calculator) se dekh sakte hain.',
    ],
  },
  {
    id: 'samay-ka-asar',
    h2: 'Samay mein galti ho to din badal sakta hai',
    paras: [
      'Ho sakta hai, aur ye jaan lena zaroori hai isse pehle ki aap kisi din par bharosa karein.',
      'Wajah: **sabse balwan graha Shadbala se tay hota hai, aur Shadbala ke do hisse janm samay par tikte hain** — Dig Bala (jo bhaav par chalta hai, aur bhaav lagna se bante hain) aur Kala Bala (jisme Hora har ghante badalta hai).',
      'Iska matlab: **do ghante ki galti se bhaav ghoom jaate hain, aur agar do grahon ka bal kareeb tha to sabse balwan graha hi badal sakta hai** — yaani lucky day bhi. Chhoti galti prayah kuch nahi badalti.',
      'Vyavharik salah: **janm pramanpatra ya hospital record se samay lijiye.** Samay bilkul na ho to result ko disha-soochak maaniye — khaas kar tab jab do din ke ank kareeb hon.',
    ],
  },
  {
    id: 'balwan-graha-ka-din',
    h2: 'Har graha ka din kis tarah ke kaam ke liye',
    paras: [
      'Agar aapka lucky day pata chal gaya hai, to agla kaam ka prashn ye hai ki **us din kya karein.** Graha ke swabhav se chuniye.',
      '**Surya (Ravivar)** — sarkari kaam, adhikariyon se milna, pehchan aur pad se jude prayaas. **Chandra (Somwar)** — ghar, parivaar, maa se jude kaam, aur wo baatcheet jisme bhavna shaamil hai. **Mangal (Mangalwar)** — sampatti, muqabla, sharirik mehnat, saahas maangne wale kaam.',
      '**Budh (Budhwar)** — likhat-padhat, contract, vyapaar, ganana, sanvaad aur padhai. **Guru (Guruwar)** — salah lena ya dena, shiksha, dhan se jude faisle, aur koi bhi shubh aarambh.',
      '**Shukra (Shukrawar)** — sambandh, kala, saundarya, kharidari aur samajhauta. **Shani (Shanivar)** — lambe kaam, sewa, anushasan aur wo kaam jinme dheeraj chahiye. Har graha ka poora kaarakattva [Planets in Astrology](/learn/planets-in-astrology) mein hai.',
    ],
  },
  {
    id: 'hora',
    h2: 'Hora — din ke andar ka ghanta',
    paras: [
      'Ye ek qadam aage ki cheez hai aur bahut kam log jaante hain, par vyavharik roop se kaam ki hai.',
      'Har din ko **24 hora** mein baanta jaata hai aur har hora ka ek swami graha hota hai. Kram sthir hai aur din ke swami se shuru hota hai — Ravivar ki pehli hora Surya ki, phir Shukra, Budh, Chandra, Shani, Guru, Mangal, aur phir wapas Surya.',
      'Iska matlab: **har din mein aapke balwan graha ki hora bhi aati hai** — teen se chaar baar. Yaani agar aapka lucky day Guruwar hai par kaam Somwar ko karna hi hai, to Somwar ki Guru hora chun lena ek vyavharik beech ka rasta hai.',
      'Ye jaankari paramparik panchang mein milti hai. Roz ka panchang [yahan](/panchang) free hai.',
    ],
  },
  {
    id: 'kitna-bharosa',
    h2: 'Lucky day par kitna bharosa karein — imandar seema',
    paras: [
      'Ye seema is page ke apne traffic ke khilaf jaati hai, par likhni chahiye.',
      'Lucky day **koi guarantee nahi hai.** Uska shastriya arth itna hai ki us din aapke sabse balwan graha ka prabhav prabal maana jaata hai — aur paramapara mein use anukool sthiti kaha gaya hai. Bas.',
      'Jo asal mein farak daalta hai wo hai **taiyari, kaushal, samay par pahunchna aur saamne wale ki sthiti.** Din chunna in mein se kisi ki jagah nahi le sakta. Sabse achha upyog ye hai ki **taiyari poori ho, aur phir din chun liya jaaye** — ulta nahi.',
      'Aur wo baat jo dohrayi jaani chahiye: **kisi kaam ko sirf isliye taalna ki "aaj mera din nahi hai" nuksan ka rasta hai.** Mauka roz nahi aata; din har hafte aata hai.',
    ],
  },
  {
    id: 'free-kya',
    h2: 'Yahan free kya milta hai',
    paras: [
      'Poora page free hai. Milta hai: **sabse balwan graha**, **lucky day**, **rang, ank, dhatu aur dishaa**, aur **saat dinon ka poora calendar** ank ke saath.',
      'Koi signup nahi, koi card nahi, koi hissa chhupa kar nahi rakha jaata.',
      'Aur jo yahan jaanbujh kar **nahi** hai: koi "lucky date" ki bikri, koi jua ya satta ki salah, aur koi paid lucky-number sewa. Upar likhi wajahon se hum unhe sahi nahi maante.',
    ],
  },
  {
    id: 'lucky-calendar-today',
    h2: 'Lucky Calendar today — roz ka calendar yahan kyun nahi hai',
    paras: [
      'Log "aaj ka lucky calendar" dhoondhte hain aur is page par saptah ka calendar milta hai, roz ka nahi. Wajah jaan leni chahiye.',
      'Is page ka calendar **aapki janm-kundali** se nikalta hai. Wo sthir hai — har Somwar aapke liye ek jaisa hai, kyunki aapka Chandra ka bal nahi badalta. Isliye saat dinon ka calendar kaafi hai; use roz banane ka koi arth nahi.',
      'Jo cheez **roz badalti hai** wo panchang hai — tithi, nakshatra, yoga, karana, Rahu Kaal. Wo aakash se aata hai, aapki kundali se nahi. Dono ko mila kar dekhna sabse achha hai: apna anukool vaar yahan se, aur us din ka panchang [yahan](/panchang) se — dono free.',
    ],
  },
  {
    id: 'mahine-ke-din',
    h2: 'What are my lucky days this month — mahine bhar ke din',
    paras: [
      'Ek din pata chal jaane ke baad agla swabhavik prashn yahi hota hai.',
      'Seedha tarika: **apne lucky vaar ki us mahine ki saari tareekhein.** Agar aapka din Guruwar hai to us mahine ke chaar ya paanch Guruwar. Ye saral hai aur iska aadhaar wahi Shadbala hai.',
      'Ek qadam aage: **doosra sabse achha din bhi jod lijiye.** Calendar mein wo dikh jaata hai. Do din mila kar mahine mein aath-nau tareekhein ban jaati hain, jo vyavharik roop se kaafi hai — kyunki har kaam ek hi din par nahi rakha ja sakta.',
      'Aur wahi purani chetavni: **agar kisi tareekh par kaam karna zaroori hai to kar lijiye.** Anukool din ka intezaar karke mauka gawa dena kisi shastra mein nahi likha.',
    ],
  },
  {
    id: 'interview-din',
    h2: 'Interview aur baatcheet ke liye din',
    paras: [
      'Ye wo jagah hai jahan din chunne ka sabse zyada arth banta hai, kyunki yahan **aapki apni urja** seedha farak daalti hai.',
      'Agar din aapke haath mein hai to **apna lucky day chuniye.** Agar nahi hai — aur prayah nahi hota — to do cheezein ki ja sakti hain: us din ki **apne balwan graha ki hora** chun lijiye (har din mein teen-chaar baar aati hai), aur us graha ka **rang** pehan lijiye.',
      'Graha ke swabhav se bhi madad milti hai. **Budh** ki hora ya Budhwar baatcheet aur contract ke liye anukool maana jaata hai. **Guru** salah aur bade faisle ke liye. **Surya** adhikariyon se milne ke liye.',
      'Aur wo baat jo sabse zaroori hai: **taiyari pehle, din baad mein.** Kisi anukool din par bina taiyari ke jaana kisi kaam ka nahi.',
    ],
  },
  {
    id: 'kharidari-din',
    h2: 'Kharidari, gaadi aur ghar ke liye din',
    paras: [
      'Yahan do alag paimane hain aur log unhe mila dete hain.',
      '**Chhoti kharidari** — kapde, gehne, saamaan — ke liye lucky day kaafi hai, aur paramapara mein **Shukrawar** ko is kaam ke liye anukool maana jaata hai (Shukra sukh aur saundarya ka kaarak hai), chahe wo aapka lucky day na ho.',
      '**Badi kharidari** — ghar, gaadi, zameen — ke liye lucky day kaafi nahi hai. Wahan **muhurat** dekha jaata hai: us din ki tithi, nakshatra, aur us kaam ke liye tay niyam. Griha pravesh aur vahan kharid ke apne muhurat hote hain aur unke liye panchang chahiye.',
      'Seedhi salah: **kapde Shukrawar, ghar muhurat par.** [Panchang](/panchang) roz ka free hai aur usme tithi, nakshatra aur Rahu Kaal sab dikhta hai.',
    ],
  },
  {
    id: 'naya-kaam',
    h2: 'Naya kaam ya vyapaar shuru karne ke liye din',
    paras: [
      'Aarambh ke liye paramapara mein alag niyam hain, aur lucky day unme se ek hissa hai.',
      'Anukool maana jaata hai: **Guruwar** (Guru — shubh aarambh ka kaarak), **Budhwar** (Budh — vyapaar aur ganana), aur aapka apna **lucky day**. Teeno ek saath mil jaayein to sabse achha, par ye har mahine nahi hota.',
      'Bachne ke liye kaha jaata hai: **Rikta tithi** (Chaturthi, Navami, Chaturdashi), **Amavasya**, aur din ka **Rahu Kaal**. Ye teeno panchang se dikhte hain, kundali se nahi.',
      'Aur ek imandar baat: **vyapaar din se nahi chalta.** Product, keemat, sewa aur mehnat se chalta hai. Achha din chun lena mann ko sthir karta hai — wo apne aap mein ek faayda hai, par usse zyada nahi.',
    ],
  },
  {
    id: 'yatra-din',
    h2: 'Yatra ke liye din — aur "dishaa shool" ka sach',
    paras: [
      'Yatra ke liye paramapara mein ek alag niyam hai jise **dishaa shool** kehte hain, aur uske naam par bahut si yatraayein taal di jaati hain.',
      'Niyam ye hai ki har din ek dishaa mein yatra taalne ki salah di jaati hai — jaise Somwar aur Shanivar poorv, Mangalwar uttar, Budhwar aur Guruwar dakshin, Shukrawar aur Ravivar paschim. Iske liye chhote paramparik upay bhi batae jaate hain.',
      'Santulit sthiti: **ye sthaniya reet hai, aur is par vidwanon mein mat-bhed hai.** Classical muhurat granthon mein iski jagah simit hai. Aur aaj ke jeevan mein — jab ticket pehle se bane hote hain aur naukri ka schedule apna hota hai — iske liye yatra badalna vyavharik bhi nahi.',
      'Seedhi salah: **agar aapke haath mein hai to apna anukool din chun lijiye. Agar nahi hai to chinta chhod dijiye** — is naam par kisi upay par paisa kharch karne ki zaroorat bilkul nahi.',
    ],
  },
  {
    id: 'rahu-kaal',
    h2: 'Rahu Kaal aur lucky day ek saath — kya karein',
    paras: [
      'Ye sthiti aksar aati hai: aapka lucky day hai par us waqt Rahu Kaal chal raha hai. Do niyam takra rahe hain.',
      'Pehle antar samajh lijiye. **Lucky day aapki kundali se aata hai** — wo sthir hai. **Rahu Kaal us din ke sooryodaya se nikalta hai** — wo har din alag samay par hota hai, lagbhag 90 minute ka, aur har shahar mein alag.',
      'Vyavharik hal saral hai: **din wahi rakhiye, samay badal lijiye.** Rahu Kaal 90 minute ka hai; din 12 ghante ka. Us window se bahar ka koi bhi samay chun lijiye.',
      'Aur ek imandar baat: **Rahu Kaal par vidwanon mein mat-bhed hai.** Kuch paramparaein ise bahut vazan deti hain, kuch ise sthaniya reet maanti hain. Isse darne ki zaroorat nahi — bas taal dena aasan hai to taal dijiye. Roz ka Rahu Kaal [Panchang](/panchang) par free hai.',
    ],
  },
  {
    id: 'vaar-vrat',
    h2: 'Vaar ka vrat — lucky day se kya rishta hai',
    paras: [
      'Vrat aur lucky day dono vaar par tikte hain, par unka maqsad ulta hai — aur yahi log galat samajhte hain.',
      '**Lucky day** wo din hai jab aapka **sabse balwan** graha ka vaar hai. Us din kaam karna anukool maana jaata hai.',
      '**Vrat** us graha ke liye kiya jaata hai jo **kamzor** hai — use sahara dene ke liye. Yaani vrat ka din prayah aapke lucky day se **alag** hoga.',
      'Isliye ye galti mat kijiye ki apne lucky day ka vrat rakh lein. Wo graha pehle se balwan hai; use aur sahare ki zaroorat nahi. Kaunsa graha kamzor hai — yaani kis vaar ka vrat arth rakhta hai — ye [Weak Planet Finder](/calculators/free-weak-planet-finder) bata deta hai, aur wo bhi free hai.',
    ],
  },
  {
    id: 'parivaar-alag-din',
    h2: 'Ghar mein sabka lucky day alag hai — kaunsa maanein',
    paras: [
      'Ye vyavharik prashn hai aur ghar mein bahas ka kaaran ban jaata hai.',
      'Pehli baat: **alag hona bilkul saamanya hai.** Har vyakti ki kundali alag hai, isliye sabka sabse balwan graha alag hoga. Ek hi parivaar mein paanch alag lucky day ho sakte hain.',
      'Faisla kaise: **jiska kaam hai, uska din.** Agar beta interview de raha hai to uska lucky day, pita ka nahi. Agar ghar ke naam se kharidari ho rahi hai to jo kharid raha hai uska.',
      'Aur jab kaam **saanjha** ho — jaise poore parivaar ka koi aayojan — to wahan lucky day chhod kar **muhurat** dekhna chahiye. Muhurat kisi ek ki kundali se nahi, us kshan ke panchang se nikalta hai, aur isi liye wo saanjhe kaamon ke liye bana hai.',
    ],
  },
  {
    id: 'bachche-ka-din',
    h2: 'Bachche ka lucky day — kaise nikaalein',
    paras: [
      'Tarika bilkul wahi hai — bachche ki janm tithi, samay aur sthan daaliye.',
      'Vyavharik upyog kya ho sakta hai: **pariksha ya pratiyogita ka din** agar chunav mein ho, **naya kaam ya class shuru karna**, ya bas anukool rang ka istemaal.',
      'Jo **nahi** karna chahiye: bachche ke rozmarra ko din ke hisaab se baandh dena, ya kisi din ko "kharab" bata dena. Bachche ke mann par uska asar padta hai, aur wo kisi bhi jyotishiya faayde se bada nuksan hai.',
      'Aur ek baat jo maa-baap ko raahat degi: **kisi bhi bachche ka lucky day uski kshamata ki seema nahi hai.** Ye ek chhota sa sanket hai, bas.',
    ],
  },
  {
    id: 'rang-dhatu-upyog',
    h2: 'Rang aur dhatu ka vyavharik upyog',
    paras: [
      'Result rang aur dhatu deta hai; unka kya karein, ye saaf hona chahiye.',
      '**Rang** — apne lucky day par us rang ka kuch pehan lena kaafi maana jaata hai; poora kapda usi rang ka hona zaroori nahi. Kaam ke din wo rang kisi bade prastuti ya baatcheet mein bhi istemaal kiya jaata hai.',
      '**Dhatu** — us graha se judi dhatu ki koi chhoti cheez rakhna paramapara mein batayi jaati hai. Par yahan ek saaf chetavni: **dhatu aur ratna alag cheezein hain.** Dhatu saamanya roop se surakshit maani jaati hai; ratna nahi — kyunki ratna us graha ki urja badhata hai, aur agar wo graha aapke lagna ke liye marak hai to nuksan karta hai.',
      'Isliye ratna ka faisla kabhi lucky day se mat lijiye. Uske liye lagna ke hisaab se jaanch chahiye — [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) us kaam ke liye free hai.',
    ],
  },
  {
    id: 'do-tool-alag',
    h2: 'Doosri site alag lucky day bata rahi hai — kya karein',
    paras: [
      'Ye aam hai aur teen thos wajah hain. Unhe isi kram mein jaanchiye.',
      '**Ek — tarika alag.** Kuch site sirf Chandra rashi ke swami se din nikalti hain, kuch mulank se, aur ye page poori Shadbala se. Teen alag aadhaar, teen alag jawab — aur koi galat nahi.',
      '**Do — ayanamsha.** Lahiri, Krishnamurti aur Raman grahon ki degree thodi alag dete hain, aur us se bal badal sakta hai.',
      '**Teen — janm samay.** Agar samay galat ya anumaan se hai to Dig Bala aur Kala Bala badal jaate hain, aur sabse balwan graha hi badal sakta hai.',
      'Kaunsa maanein: **jo aapki poori kundali se nikla ho.** Rashi ya mulank se nikla din saral hai par wo karodon logon ke liye ek jaisa hai.',
    ],
  },
  {
    id: 'kis-liye-nahi',
    h2: 'Ye page kis liye nahi hai',
    paras: [
      'Ye likh dena zaroori hai taaki koi galat umeed le kar na jaaye.',
      'Ye page **nahi** batata: kab kya hoga, kaunsa faisla sahi hai, kaunsi baazi jeetegi, ya kis din paisa aayega. Isme samay ki koi ganana hai hi nahi — na dasha, na gochar. Sirf ek sthir saptahik chakra hai.',
      'Aur ye page **nahi bechta**: koi "lucky date" ki sewa, koi jua ya satta ki salah, koi lucky number, aur koi paid remedy.',
      'Jo ye deta hai: **aapka sabse balwan graha, uska vaar, uska rang aur ank, aur saat dinon ka ek imandar calendar** — is saaf soochna ke saath ki inka kitna vazan hai aur kitna nahi.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Din ke baad — kahan jaayein',
    paras: [
      'Agar prashn **samay** ka hai — kab hoga, kaunsa saal anukool hai — to uska asli uttar dasha mein hai: [Dasha Calculator](/calculators/free-dasha-calculator) aur [Mahadasha explained](/learn/mahadasha-explained).',
      'Agar prashn **kisi khaas kaam ke muhurat** ka hai — shaadi, griha pravesh, delivery — to [Panchang](/panchang) aur [Child Birth Muhurat Calculator](/calculators/free-child-birth-muhurat-calculator) us kaam ke liye bane hain.',
      'Agar aap **apna balwan aur kamzor graha** gehrai se dekhna chahte hain — [Graha Bal Calculator](/calculators/free-graha-bal-calculator), [Weak Planet Finder](/calculators/free-weak-planet-finder) aur [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator). Aur ank wali paddhati ke liye [Numerology Calculator](/calculators/free-numerology-calculator).',
    ],
  },
];

type LdLink = { href: string; label: string; note: string };

const HUB_CALC: LdLink[] = [
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Sabse balwan graha ka aankda' },
  { href: '/calculators/free-weak-planet-finder', label: 'Weak Planet Finder', note: 'Kaunsa graha peeche hai' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Poora chitra' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Anukool saal ka asli uttar' },
  { href: '/calculators/free-rashi-calculator', label: 'Rashi Calculator', note: 'Rashi wala tarika' },
  { href: '/calculators/free-numerology-calculator', label: 'Numerology Calculator', note: 'Ank wali paddhati' },
  { href: '/calculators/free-child-birth-muhurat-calculator', label: 'Child Birth Muhurat', note: 'Muhurat alag prashn hai' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Aapka lagna' },
];

const HUB_LEARN: LdLink[] = [
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Har graha ka swabhav' },
  { href: '/learn/shadbala-planetary-strength-vedic-astrology', label: 'Shadbala', note: 'Bal kaise naapa jaata hai' },
  { href: '/learn/mahadasha-explained', label: 'Mahadasha explained', note: 'Samay ka asli paimana' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Dignity — uchch aur neech', note: 'Graha ki sthiti' },
  { href: '/learn/nakshatra-guide', label: 'Nakshatra Guide', note: 'Panchang ka aadhaar' },
  { href: '/learn/raj-yoga', label: 'Raj Yoga', note: 'Yog ka sidhant' },
  { href: '/learn/gemstone-astrology-vedic', label: 'Gemstone Astrology', note: 'Rang se aage' },
  { href: '/learn/how-to-wear-gemstone-vedic', label: 'Ratna pehanne ki vidhi', note: 'Faisle ke baad' },
  { href: '/panchang', label: 'Panchang', note: 'Roz ka tithi aur hora' },
];

function LdRich({ text, k }: { text: string; k: string }) {
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

function LdHub({ items }: { items: LdLink[] }) {
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

export default function FreeLuckyDayCalculatorPage() {
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
          calcType: 'lucky-day',
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
  const strongest: string | null = result?.strongestPlanet || null;
  const lucky = strongest ? LUCKY_DATA[strongest] : null;
  const planets: any[] = result?.planets ?? [];
  const strengthOf = (planet: string): number | null => {
    const p = planets.find((x: any) => x.planet === planet);
    return typeof p?.strength === 'number' ? p.strength : null;
  };
  const classifyDay = (planet: string): 'lucky' | 'neutral' | 'challenging' => {
    const s = strengthOf(planet);
    if (s === null) return 'neutral';
    if (s >= 40) return 'lucky';
    if (s >= 25) return 'neutral';
    return 'challenging';
  };

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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-lucky-day-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Lucky Day Calculator — Find Your Luckiest Day of the Week',
    description:
      'Find your lucky day, lucky color, lucky number, lucky metal & direction based on your strongest planet (Shadbala). Free Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Lucky Day Calculator',
    aboutEntities: ['Lucky Day', 'Strongest Planet', 'Shadbala', 'Vaar-Swami'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Shadbala', 'Planetary Strength'],
    howToName: 'How to find your lucky day, color, number and metal',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Find the strongest planet', text: 'The calculator computes Shadbala for every planet using Swiss Ephemeris with Lahiri Ayanamsha and picks the strongest.' },
      { name: 'Get your result', text: 'See your lucky day, color, number, metal and direction, a weekly luck calendar and free remedies.' },
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
            <span style={{ color: GOLD }}>Free Lucky Day Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Lucky Day Calculator — Find Your Luckiest Day of the Week
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              Aapka <strong style={{ color: GOLD }}>Lucky Day</strong> aapki kundali ke sabse strong graha (Shadbala) se decide hota hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Lucky Day Calculator</strong> Swiss Ephemeris se aapke strongest planet ko nikaalta hai aur uske hisaab se aapka lucky day, lucky color, lucky number, lucky metal aur direction batata hai — bilkul free, turant.
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
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Lucky Day (Free)</h2>
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
                {loading ? '⟳ Finding Your Lucky Day...' : '🍀 Find My Lucky Day'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Shadbala · Parashar BPHS</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* LUCKY DAY VERDICT */}
              {lucky ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                  background: `linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                  border: `1px solid rgba(34,197,94,0.35)`,
                }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    {form.name ? `${form.name}'s ` : ''}Lucky Day
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-2" style={{ color: '#86EFAC' }}>
                    🍀 {lucky.day} <span className="text-2xl md:text-3xl text-slate-300">({lucky.day_hi})</span>
                  </div>
                  <div className="text-base text-slate-300">
                    Strongest Planet: <span style={{ color: GOLD }} className="font-bold">{strongest}</span>
                    {strengthOf(strongest!) !== null && <span className="text-slate-400"> · Strength {strengthOf(strongest!)}%</span>}
                  </div>
                  <div className="text-sm text-slate-400 mt-2 italic max-w-2xl mx-auto">
                    {lucky.deity} ka aashirvaad — {lucky.day} ko important kaam, naye aarambh aur shubh decisions ke liye best.
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Strongest planet calculate nahi ho paya. Kripya birth details dobara check karein.</p>
                </div>
              )}

              {/* LUCKY ATTRIBUTES GRID */}
              {lucky && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>✨ Your Lucky Attributes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DetailCell icon="🎨" label="Lucky Color" value={lucky.color} />
                    <DetailCell icon="🔢" label="Lucky Number" value={lucky.number} />
                    <DetailCell icon="🪙" label="Lucky Metal" value={lucky.metal} />
                    <DetailCell icon="🧭" label="Lucky Direction" value={lucky.direction} />
                    <DetailCell icon="🛕" label="Lucky Deity" value={lucky.deity} />
                    <DetailCell icon="⏰" label="Best Time" value={`${lucky.day} morning (sunrise)`} />
                  </div>
                </div>
              )}

              {/* WEEKLY CALENDAR */}
              {planets.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📅 Your Weekly Luck Calendar</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {WEEKDAYS.map((wd) => {
                      const cls = classifyDay(wd.planet);
                      const s = strengthOf(wd.planet);
                      const colors = {
                        lucky:       { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.4)',  text: '#86EFAC', tag: 'Lucky' },
                        neutral:     { bg: 'rgba(212,175,55,0.08)', border: GOLD_RGBA(0.3),          text: GOLD,      tag: 'Neutral' },
                        challenging: { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.35)', text: '#FCA5A5', tag: 'Care' },
                      }[cls];
                      const isLuckyDay = lucky && wd.day === lucky.day;
                      return (
                        <div key={wd.day} className="p-3 rounded-xl text-center" style={{ background: colors.bg, border: `1px solid ${isLuckyDay ? GOLD : colors.border}` }}>
                          <div className="text-xs text-slate-400">{wd.day_hi}</div>
                          <div className="text-sm font-bold mt-0.5" style={{ color: colors.text }}>{wd.day.slice(0, 3)}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{wd.planet}{s !== null ? ` ${s}%` : ''}</div>
                          <div className="text-[10px] font-semibold mt-1" style={{ color: colors.text }}>{isLuckyDay ? '⭐ Best' : colors.tag}</div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">Har din ka swami-graha aur uski Shadbala strength ke aadhar par — strong graha = lucky din.</p>
                </div>
              )}

              {/* DOS */}
              {dos.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos — Luck Badhane Ke Liye</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dos.map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                  </ul>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>🪔 3 Free Remedies — Strongest Planet Ko Aur Strong Karein</h3>
                  <p className="text-xs text-slate-400 mb-5">{strongest} ki kripa banaye rakhne ke liye (Parashar)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={mantra} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={ratna} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={daan} />}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Apni poori kundali ka deep analysis aur personalized remedies chahiye?</p>
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
                    <LdRich text={p} k={`s${si}-p${pi}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* graha -> day/colour/number table — kept from v1.x, unchanged */}
          <section className="mt-4 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Graha → Lucky Day, Color, Number Mapping</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Strongest Planet</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Lucky Day</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Color</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Number</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Metal</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].map((p) => (
                    <tr key={p} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td className="p-3 font-semibold" style={{ color: GOLD }}>{p}</td>
                      <td className="p-3">{LUCKY_DATA[p].day} ({LUCKY_DATA[p].day_hi})</td>
                      <td className="p-3">{LUCKY_DATA[p].color}</td>
                      <td className="p-3">{LUCKY_DATA[p].number}</td>
                      <td className="p-3">{LUCKY_DATA[p].metal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Apna Lucky Day Kaise Use Karein</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Lucky day par important decisions lein — naya business, job interview, property deal, ya koi shubh aarambh. Us din apna lucky color pehnein, lucky direction mein mukh karke kaam shuru karein, aur strongest planet ke mantra ka jaap karein. Yeh chhote upaay aapki natural planetary strength ko aur badhate hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk Lucky Day Calculator</h2>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Method</td><td className="p-3">Shadbala (6-fold strength)</td><td className="p-3 text-slate-500">Sun-sign / generic</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Weekly Luck Calendar</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lucky Color + Number + Metal</td><td className="p-3" style={{ color: GOLD }}>✓ All</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── v2.0: hand-off to the rest of the cluster ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Din ke aage — baaki free calculators aur guide</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Lucky day ek sthir din hai. Agar prashn samay ka hai — kab hoga — to uska uttar dasha mein hai, aur kisi khaas kaam ke liye muhurat mein. Sab free.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Aur bhi free calculators</h3>
                <LdHub items={HUB_CALC} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Sidhant samjhiye</h3>
                <LdHub items={HUB_LEARN} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Lucky Day Calculator</h2>
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
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
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

function DetailCell({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="font-bold text-base" style={{ color: GOLD }}>{value ?? '—'}</div>
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
