'use client';

// ============================================================
// File: app/calculators/free-lagna-bal-calculator/page.tsx
// Version: v2.0 (05 Sep 2026) — Free Lagna Bal Calculator
// API: /api/calc/kundali (calcType: 'lagna-bal')  [route v1.6+]
// Logic: lagna lord placement + strength (= personality strength)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-09-05) — Keyword-driven content build from Radar E3 PASF.
//        1,024 -> ~5,300 words, 4 H2 -> 36, TOC added, FAQs 8 -> 15,
//        21 -> 30 verified internal links, new layout.tsx title.
//        Form, /api/calc/kundali (calcType 'lagna-bal'), JSON-LD and the
//        comparison table are untouched.
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

// Natural benefic / malefic (simplified classical)
const NATURAL_BENEFIC = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const NATURAL_MALEFIC = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

const HOUSE_MEANING: Record<number, string> = {
  1: 'Self & personality', 2: 'Wealth & family', 3: 'Courage & siblings',
  4: 'Home & mother', 5: 'Children & intellect', 6: 'Enemies & health',
  7: 'Marriage & partners', 8: 'Transformation & longevity', 9: 'Fortune & dharma',
  10: 'Career & status', 11: 'Gains & network', 12: 'Loss & moksha',
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
  { q: 'Lagna Bal kya hota hai?', a: 'Lagna (ascendant) aapki janma-kundali ka pehla bhaav hai — jo birth ke samay purab mein udit rashi se banta hai. Lagna Bal yaani lagna aur uske swami (lagna lord) ki shakti, jo aapke vyaktitva, sharir, aatm-vishwas aur jeevan ki disha ko represent karti hai. Strong lagna = mazboot foundation.' },
  { q: 'Mera lagna lord kaise pata chalega?', a: 'Lagna lord aapki lagna-rashi ka swami graha hai (jaise Mesh lagna ka Mars, Vrishabha ka Venus). Calculator aapki birth details se lagna nikaalta hai, uska swami batata hai, aur us graha ki strength aur house placement dikhata hai.' },
  { q: 'Strong lagna lord ke kya fayde hain?', a: 'Strong lagna lord = mazboot personality, achhi health & vitality, leadership, aatm-vishwas, aur jeevan mein clear direction. Aap challenges ka achha samna karte hain aur apni identity strong rehti hai.' },
  { q: 'Weak lagna lord ke effects?', a: 'Weak lagna lord se aatm-vishwas mein kami, health par dhyaan dena padta hai, identity/direction mein confusion, aur shuruaat mein zyada mehnat. Remedies (lagna lord ka mantra, daan, deity worship) se ise strengthen kiya jaata hai.' },
  { q: 'Lagna (1st house) mein planets ka kya asar?', a: 'Pehle bhaav mein baithe grahas seedhe aapke vyaktitva aur sharir ko prabhavit karte hain. Benefic grahas (Jupiter, Venus, Mercury, Moon) achha asar dete hain; malefic grahas (Sun, Mars, Saturn, Rahu, Ketu) intensity ya challenges la sakte hain — par house aur strength par depend karta hai.' },
  { q: 'Lagna ko strong kaise karein?', a: 'Lagna lord ka mantra jaap, uske vaar ko vrat-daan, deity ki upasana, aur (expert salaah ke baad) gemstone. Calculator aapke lagna lord ke liye 3 personalized free remedies deta hai.' },
  { q: 'Kya ye Lagna Bal Calculator free hai?', a: 'Haan, 100% free. Lagna sign, lagna lord + house placement + strength, 1st-house planets, strong/weak effects aur 3 Parashar remedies — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + Shadbala (Parashar BPHS) use karta hai with Lahiri Ayanamsha. Lagna time-sensitive hai — har ~2 ghante mein badalta hai — isliye exact time of birth bahut zaroori hai accurate result ke liye.' },
  { q: 'Lagna bal aur lagna calculator mein kya antar hai?', a: 'Lagna calculator batata hai ki aapka lagna KAUNSA hai — Mesh, Vrishabh ya koi aur. Ye page batata hai ki wo lagna KITNA MAZBOOT hai — lagna swami kahan baitha hai, uska bal kya hai, aur pehle bhaav mein kaun hai. Pehla pehchan ka prashn hai, doosra taakat ka.' },
  { q: 'Ascendant lord calculator — lagna swami kaise nikalta hai?', a: 'Lagna swami wo graha hai jo aapki lagna rashi ka swami hai — Mesh ka Mangal, Vrishabh ka Shukra, Mithun ka Budh, Karka ka Chandra, Simha ka Surya, Kanya ka Budh, Tula ka Shukra, Vrishchik ka Mangal, Dhanu ka Guru, Makar ka Shani, Kumbh ka Shani, Meen ka Guru. Calculator use apne aap nikaal kar uska bal bhi bata deta hai.' },
  { q: 'How to calculate lagna manually?', a: 'Haath se nikaalne ke liye janm ka sthaniya sooryodaya, janm se sooryodaya tak ka antar, aur us din ki lagna sarani chahiye — phir sthaan ke akshansh ke hisaab se sudhar karna padta hai. Ye sambhav hai par shramsadhya, aur ek chhoti si galti poora lagna badal deti hai. Swiss Ephemeris yahi ganana seedhe khagolik sthiti se karta hai.' },
  { q: 'Lagna calculator without birth time — samay ke bina chal sakta hai?', a: 'Imandari se: nahi. Lagna har do ghante mein badalta hai, isliye samay ke bina lagna anumaan bhi nahi ban sakta. Samay bilkul na ho to 12:00 maan liya jaata hai — us sthiti mein Chandra rashi, nakshatra aur grahon ki rashiyan sahi rahengi, par lagna aur bhaav anumaan hi honge.' },
  { q: 'Indu Lagna aur Tara Lagna kya hote hain?', a: 'Ye vishesh lagna hain, saamanya janm lagna se alag. Indu Lagna dhan ke vishleshan ke liye nikala jaata hai — navam aur ekadash ke swamiyon ke kala ank jod kar Chandra se ginti karke. Tara Lagna nakshatra-aadhaarit ek anya paddhati hai. Dono vishesh prayog ke liye hain; janm lagna ka vikalp nahi.' },
  { q: 'Marriage Lagna calculator alag hota hai?', a: 'Haan, aur ye alag prashn hai. Vivah lagna ka arth hai vivah ke muhurat ka lagna — yaani pheron ke samay kaunsa lagna udit ho. Uska aapki janm-kundali ke lagna se koi seedha sambandh nahi. Ye page janm lagna ka bal naapta hai, muhurat ka lagna nahi.' },
  { q: 'Lagna bal kam aaye to kya karein?', a: 'Sabse pehle ye samajh lijiye ki kam bal ka matlab kamzor jeevan nahi hai — iska matlab hai ki lagna swami ko sahara chahiye. Uska mantra, uske vaar ka vrat aur daan classical upay hain, aur teeno muft hain. Ratna ka faisla bal se nahi, bhaav-swamitva se hota hai — isliye usse pehle jaanch zaroori hai.' },
];


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2 + GSC, both 05 Sep 2026)
//   1,024 words · 4 H2 · 21 internal links.
//   GSC 3 months to 4 Sep 2026: 38 impressions, 7 clicks, CTR 18.42% —
//   the HIGHEST CTR of any calculator on the site — average position 19.11.
//   People who see this page click it. Google barely shows it.
//
// WHERE THE H2s COME FROM — Radar E3, live SERP PASF, cluster calc-lagna,
// checked 05 Sep 2026. Six tracked keywords; AI Overview recommends a tool on
// ALL SIX; we rank on exactly one.
//     lagna bal calculator ....................... our_rank 5   AIO recommends_tool
//     lagna calculator by date of birth .......... our_rank —   AIO recommends_tool
//     ascendant calculator vedic astrology free .. our_rank —   AIO recommends_tool
//     mera lagna kya hai ......................... our_rank —   AIO recommends_tool
//     लग्न कैलकुलेटर ................................ our_rank —   AIO recommends_tool
//     लग्न कैसे पता करें ............................. our_rank —   AIO recommends_tool
//
//   PASF harvested from those SERPs and answered below:
//     Ascendant lord calculator · Lagna rashi finder · Lagna rashi chart
//     How to calculate Lagna manually · How to calculate Lagna for a day
//     Lagna Calculator without birth time · Indu Lagna Calculator
//     Tara Lagna Calculator · Marriage Lagna Calculator · Lagna chart calculator
//     12 Ascendant in astrology · How to find ascendant sign in kundli
//     लग्न कुंडली चार्ट · लग्न देखने की विधि · लग्न सारणी pdf · लग्न का अर्थ
//     Lagna Calculator AstroSage / prokerala → answered honestly in one section
//
// CANNIBALISATION — deliberate split, do not undo it
//   The site has TWO pages in this cluster:
//     /calculators/free-lagna-calculator      — WHICH lagna you have (the finder)
//     /calculators/free-lagna-bal-calculator  — HOW STRONG it is (this page)
//   The head "what is my lagna" terms are therefore left to the finder page and
//   handed to it by link, while this page owns everything about STRENGTH:
//   lagna lord, its house, its Shadbala, first-house planets, strong vs weak.
//   Putting both keyword sets on both pages would make them compete, which is
//   exactly the mistake the Radar report warns about.
//
// UNCHANGED — do not "tidy" these
//   The form, /api/calc/kundali (calcType 'lagna-bal'), buildCalcJsonLd and the
//   comparison table. Only words, links and FAQs changed.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type LbSection = { id: string; h2: string; paras: string[] };

const SECTIONS: LbSection[] = [
  {
    id: 'kaise-kaam-karta-hai',
    h2: 'Lagna Bal Calculator — kaam kaise karta hai',
    paras: [
      'Aap **janm tithi, sateek janm samay aur janm sthan** dete hain. Calculator aapki kundali banata hai aur char cheezein nikaalta hai: **aapka lagna**, **uska swami graha**, wo swami **kis bhaav mein** baitha hai aur **uski Shadbala** kitni hai, aur **pehle bhaav mein kaun se graha** hain.',
      'Inhe jod kar ek chitra banta hai — lagna mazboot hai, saamanya hai, ya use sahare ki zaroorat hai. Har point ke saath uski wajah bhi likhi hoti hai: kaunsa graha, kaunsa bhaav, kitna bal.',
      'Ganana **Swiss Ephemeris** aur **Lahiri Ayanamsha** par hoti hai. Sthan isliye maanga jaata hai ki lagna akshansh ke saath badalta hai — ek hi kshan par Delhi aur Chennai ka lagna alag ho sakta hai.',
    ],
  },
  {
    id: 'lagna-bal-kya-hai',
    h2: 'Lagna Bal kya hota hai — aur ye lagna se alag kyun hai',
    paras: [
      'Do prashn alag hain aur unhe alag rakhna zaroori hai. **"Mera lagna kya hai"** pehchan ka prashn hai — Mesh, Vrishabh, Mithun. **"Mera lagna kitna balwan hai"** taakat ka prashn hai.',
      'Doosre ka uttar teen cheezon se banta hai: **lagna swami ka bal**, **uska bhaav**, aur **pehle bhaav mein baithe graha**. Ye teeno mil kar batate hain ki aapka lagna apna phal kitni takat se de paayega.',
      'Agar aapko abhi tak apna lagna hi nahi pata, to pehla kadam wo hai — [Lagna Calculator](/calculators/free-lagna-calculator) us prashn ke liye bana hai aur wo bhi free hai. Uske baad is page par wapas aaiye.',
    ],
  },
  {
    id: 'ascendant-lord',
    h2: 'Ascendant Lord Calculator — lagna swami kaise nikalta hai',
    paras: [
      'Lagna swami wo graha hai jo aapki lagna rashi ka swami hai. Ye nishchit hai aur kabhi nahi badalta — sirf yaad rakhne ki baat hai.',
      '**Mesh — Mangal. Vrishabh — Shukra. Mithun — Budh. Karka — Chandra. Simha — Surya. Kanya — Budh. Tula — Shukra. Vrishchik — Mangal. Dhanu — Guru. Makar — Shani. Kumbh — Shani. Meen — Guru.**',
      'Dhyan dene ki baat: **paanch graha do-do rashiyon ke swami hain** — Mangal, Shukra, Budh, Guru aur Shani. Sirf Surya aur Chandra ek-ek rashi ke swami hain. Iska matlab ye hai ki aapka lagna swami prayah kisi doosre bhaav ka bhi swami hoga, aur uska bal dono bhaavon par asar daalega. Calculator ye dohra swamitva bhi dikhata hai.',
    ],
  },
  {
    id: 'lagna-swami-ka-bhaav',
    h2: 'Lagna swami kis bhaav mein — sabse bada sanket',
    paras: [
      'Lagna swami ka bhaav is poore vishleshan ka sabse zyada bolne wala hissa hai, kyunki wo batata hai ki **aapki urja kis disha mein lagti hai.**',
      '**Kendra (1, 4, 7, 10)** — bal aur sthirta. **Trikona (1, 5, 9)** — bhagya aur srijan. **Ekadash (11)** — laabh aur poorti. Ye sab anukool maane jaate hain, aur lagna swami yahan ho to lagna mazboot maana jaata hai.',
      '**Chhathe, aathve ya barahve bhaav** mein lagna swami ho to arth badal jaata hai — sangharsh, parivartan, ya vairagya aur videsh ki taraf jhukav. Par yahan ek zaroori sudhar: **ye ashubh nahi hai.** Chhathe mein lagna swami pratiyogita mein tikne ki kshamata deta hai, barahve mein videsh aur adhyatm ki taraf. Bahut si safal kundaliyaan aisi hi hoti hain.',
    ],
  },
  {
    id: 'shadbala-lagna-swami',
    h2: 'Lagna swami ki Shadbala — sankhya mein taakat',
    paras: [
      '"Lagna swami mazboot hai" ek raay hai. **Shadbala ek maap hai** — chhe alag drishtikonon se graha ka bal, aur usi graha ke apne classical minimum ke saamne tola hua.',
      'Chhe bal hain **Sthana** (sthaan), **Dig** (dishaa), **Kala** (samay), **Cheshta** (gati), **Naisargika** (swabhavik) aur **Drik** (drishti). Result inka ratio dikhata hai — **1.00 se upar matlab graha apna phal dene mein saksham hai**, neeche matlab sahara chahiye.',
      'Ye antar isliye mayne rakhta hai ki **har graha ka minimum alag hai** — Budh ka 7.0 Rupa, Shani ka 5.0. Isliye barabar Rupa hone par bhi ek balwan aur doosra kamzor ho sakta hai. Poora sidhant [Shadbala — planetary strength](/learn/shadbala-planetary-strength-vedic-astrology) mein hai, aur saaton grahon ka bal ek saath dekhna ho to [Weak Planet Finder](/calculators/free-weak-planet-finder) free hai.',
    ],
  },
  {
    id: 'strong-weak-lagna',
    h2: 'Strong aur Weak Lagna Lord — farak kya padta hai',
    paras: [
      '**Balwan lagna swami** ka arth hai: shareer aur urja ka sath dena, apni pehchan par pakad, faisle mein sthirta, aur mushkil daur mein wapas khada ho jaana. Ye sab lagna ke apne kshetra hain — shareer, vyaktitva, jeevan-disha.',
      '**Kamzor lagna swami** ka arth ye nahi hai ki kuch bura hoga. Iska arth hai ki **wahi cheezein zyada prayaas maangti hain** — swasthya par dhyan dena padta hai, aatm-vishwas mehnat se banta hai, aur disha spasht hone mein samay lagta hai.',
      'Aur wo baat jo saaf kah deni chahiye: **kamzor lagna swami wali bahut si kundaliyaan bahut safal logon ki hain.** Bal pravritti batata hai, seema nahi. Jo koi kam bal dikha kar mehnga upay beche, wo dar bech raha hai.',
    ],
  },
  {
    id: 'pehla-bhaav-graha',
    h2: 'Pehle bhaav mein baithe graha — seedha asar',
    paras: [
      'Lagna swami ke baad doosra sabse bada asar un grahon ka hota hai jo **pehle bhaav mein hi baithe** hain. Ye seedhe shareer, chehre aur swabhav par lagte hain.',
      '**Guru** pehle bhaav mein — udaarta, vistaar, sammaan; shastra ise sabse anukool maanta hai. **Shukra** — saundarya, sauhard, kala. **Budh** — vaakpatuta, yuvasulabh chehra, buddhi. **Surya** — adhikaar, aatm-kendrit urja. **Chandra** — bhavukta, badalta mann. **Mangal** — urja, garmi, kabhi ugrata. **Shani** — gambhirta, dheeraj, kabhi ekaanth.',
      'Ek vyavharik baat: **khaali pehla bhaav kamzori nahi hai.** Bhaav ka phal uske **swami** se chalta hai, grahon ki bheed se nahi. Khaali lagna aur balwan lagnesh wali kundali prayah bhare lagna aur peedit lagnesh wali se behtar hoti hai.',
    ],
  },
  {
    id: 'barah-lagna',
    h2: '12 Ascendant in astrology — har lagna ka swabhav',
    paras: [
      'Barah lagna, barah alag aadhaar. Har ek ka apna swami, tatva aur swabhav hai, aur wahi baaki poori kundali ka dhancha tay karta hai.',
      '**Agni** — Mesh, Simha, Dhanu: pahal, urja, disha. **Prithvi** — Vrishabh, Kanya, Makar: sthirta, vyavharikta, dheeraj. **Vayu** — Mithun, Tula, Kumbh: vichaar, sanvaad, sambandh. **Jal** — Karka, Vrishchik, Meen: bhavna, gehrai, antar-drishti.',
      'Ye vibhajan kyun kaam ka hai: **ek hi graha do lagna ke liye alag arth rakhta hai.** Shani Vrishabh lagna ke liye anukool ho sakta hai aur Karka lagna ke liye jatil — kyunki dono mein wo alag bhaavon ka swami banta hai. Isi liye "Shani achha hai ya bura" ka koi ek uttar nahi hai. Har lagna ka vistaar [Lagna Calculator](/calculators/free-lagna-calculator) par milta hai.',
    ],
  },
  {
    id: 'lagna-rashi-finder',
    h2: 'Lagna Rashi aur Chandra Rashi — do alag cheezein',
    paras: [
      'Ye galatfehmi is cluster mein sabse aam hai, aur isse bahut si galat padhaiyaan hoti hain.',
      '**Lagna Rashi** wo rashi hai jo aapke janm ke kshan **purvi kshitij par udit** ho rahi thi. **Chandra Rashi** wo rashi hai jisme us kshan **Chandra** baitha tha. Dono prayah alag hoti hain. Uttar Bharat mein "rashi" kaha jaaye to prayah Chandra rashi ka matlab hota hai, aur wahi naam rakhne ke liye istemaal hoti hai.',
      'Padhne mein kya farak: **bhaav lagna se bante hain** — dasham bhaav, saatva bhaav, sab. Isliye kundali ka dhancha lagna par tikta hai. **Gochar aur dasha ka anubhav prayah Chandra rashi se dekha jaata hai** — Sade Sati bhi Chandra rashi se hi ginte hain. Apni Chandra rashi [Rashi Calculator](/calculators/free-rashi-calculator) se aur Sade Sati [Sade Sati Calculator](/calculators/free-sade-sati-calculator) se dekh sakte hain.',
    ],
  },
  {
    id: 'lagna-chart',
    h2: 'Lagna Chart — लग्न कुंडली चार्ट कैसे पढ़ें',
    paras: [
      'लग्न कुंडली वह चार्ट है जिसमें **पहला खाना आपका लग्न होता है** और वहीं से बारह भाव गिने जाते हैं। यही मूल चार्ट है — बाकी सब इसी पर टिका है।',
      'उत्तर भारतीय शैली में खाने स्थिर होते हैं और राशियाँ बदलती हैं; दक्षिण भारतीय शैली में राशियाँ स्थिर होती हैं और लग्न पर निशान लगता है। **दोनों एक ही जानकारी दिखाते हैं**, केवल प्रस्तुति अलग है — इसलिए दो चार्ट अलग दिखने पर घबराने की ज़रूरत नहीं।',
      'पढ़ने का क्रम यह रखिए: **पहले लग्न, फिर लग्नेश कहाँ है, फिर पहले भाव में कौन है, फिर लग्नेश का बल।** यही क्रम यह पेज अनुसरण करता है। पूरी कुंडली मुफ्त देखनी हो तो [Kundali Calculator](/calculators/free-kundali-calculator) पर बन जाती है।',
    ],
  },
  {
    id: 'lagna-kaise-nikale',
    h2: 'जन्म लग्न कैसे निकाले — विधि क्या है',
    paras: [
      'शास्त्रीय विधि यह है: जन्म स्थान का **स्थानीय सूर्योदय** निकालिए, जन्म समय से सूर्योदय तक का अंतर लीजिए, उस दिन की **लग्न सारणी** से उस अंतर के अनुसार लग्न देखिए, और फिर स्थान के **अक्षांश** के अनुसार सुधार कीजिए।',
      'यह विधि काम करती है पर श्रमसाध्य है, और तीन जगह गलती की गुंजाइश है — सूर्योदय का समय, सारणी का चुनाव, और अक्षांश सुधार। एक छोटी सी चूक पूरा लग्न बदल देती है, क्योंकि **लग्न लगभग हर दो घंटे में बदलता है।**',
      'यह कैलकुलेटर सारणी का रास्ता नहीं लेता — यह **Swiss Ephemeris** से सीधे उस क्षण की खगोलीय स्थिति निकालता है और लाहिड़ी अयनांश लगाता है। इसलिए परिणाम सारणी से थोड़ा अलग आ सकता है, और ऐसी स्थिति में गणना अधिक विश्वसनीय है।',
    ],
  },
  {
    id: 'bina-samay',
    h2: 'Lagna Calculator without birth time — samay ke bina kya hota hai',
    paras: [
      'Imandar uttar: **samay ke bina lagna nikalna sambhav nahi hai**, aur jo tool ye daawa kare wo anumaan bech raha hai.',
      'Wajah ganitiya hai. **Lagna 24 ghante mein baarah baar badalta hai** — lagbhag har do ghante mein ek nayi rashi udit hoti hai. Sirf tareekh se ye pata nahi chalta ki us din ke baarah lagno mein se kaunsa aapka hai. Ye anumaan nahi, sheer sanjog hoga.',
      'Samay bilkul na ho to do raste hain. **Ek** — 12:00 maan kar chalayiye; tab **Chandra rashi, nakshatra aur grahon ki rashiyaan sahi rahengi**, par lagna aur bhaav anumaan honge. **Do** — janm pramanpatra ya hospital record dhoondhiye; ye das minute ka kaam hai jo agle chalis saal ki har padhai sateek bana deta hai.',
    ],
  },
  {
    id: 'indu-tara-lagna',
    h2: 'Indu Lagna aur Tara Lagna — vishesh lagna',
    paras: [
      'Ye PASF mein bar-bar aate hain aur inhe janm lagna samajh liya jaata hai. Dono alag prayog ke liye hain.',
      '**Indu Lagna** dhan ke vishleshan ke liye nikala jaata hai. Navam aur ekadash bhaavon ke swamiyon ko unke nishchit kala ank die jaate hain, unka jod bara se bhaag kar shesh Chandra se gina jaata hai. Jo rashi aati hai wahi Indu Lagna. Ise dhan-sthiti ka ek sahayak sanket maana jaata hai.',
      '**Tara Lagna** nakshatra-aadhaarit ek anya paddhati hai, jo kuch paramparaon mein prayog hoti hai. Dono ke baare mein saaf rakhna zaroori hai: **ye janm lagna ka vikalp nahi hain.** Kundali ka dhancha janm lagna se hi banta hai; ye vishesh lagna uske upar ek atirikt parat hain. Dhan ke prashn ke liye [Dhan Yoga Analysis](/learn/dhan-yoga-analysis) zyada seedha page hai.',
    ],
  },
  {
    id: 'marriage-lagna',
    h2: 'Marriage Lagna Calculator — ye is page ka vishay nahi hai',
    paras: [
      'Ye PASF mein aata hai aur log ise yahan dhoondhte hain, isliye antar saaf kar dena zaroori hai.',
      '**Vivah lagna** ka arth hai vivah ke muhurat ka lagna — yaani pheron ke samay purvi kshitij par kaunsi rashi udit ho. Ye ek **muhurat** ka prashn hai, janm-kundali ka nahi. Iska aapke apne janm lagna se koi seedha sambandh nahi.',
      'Aur ye prashn bhi alag hai ki **shaadi kab hogi** — wo saatve bhaav, Navamsa, Shukra aur chal rahi dasha se dekha jaata hai. Uske liye [Shadi Kab Hogi Calculator](/calculators/free-shadi-kab-hogi-calculator) alag se bana hai aur free hai. Ye page sirf janm lagna ka bal naapta hai.',
    ],
  },
  {
    id: 'lagna-aur-swasthya',
    h2: 'Lagna aur shareer — seema ke saath',
    paras: [
      'Lagna ko shastra mein **shareer, roop aur jeevani-shakti** ka bhaav kaha gaya hai, aur isi kaaran log yahan swasthya ka prashn le kar aate hain.',
      'Classical sanket ye hain: balwan lagnesh ko rog se ubarne ki kshamata se joda gaya hai, aur pehle bhaav par kroor grahon ki drishti ko shareer par dabav se. Har lagna ke apne shareer-lakshan bhi batae gaye hain — Mesh mein sir, Vrishabh mein kanth, aur aage isi kram mein.',
      'Par seema saaf rahni chahiye: **ye nidaan nahi hai.** Kamzor lagnesh dekh kar jaanch taalna ya ilaaj chhodna nuksan ka rasta hai. Sahi upyog itna hai ki kisi kshetra mein bar-bar dikkat ho to ek aur nazariya milta hai — jaanch ke saath, uski jagah nahi.',
    ],
  },
  {
    id: 'lagna-aur-career',
    h2: 'Lagna ka bal aur career — kya rishta hai',
    paras: [
      'Career ka bhaav dasham hai, lagna nahi — par lagna ka bal wahan bhi pahunchta hai, aur wajah samajhne layak hai.',
      '**Lagna aapki apni kshamta hai** — wo urja jo aap kisi bhi kshetra mein laga sakte hain. Dasham bhaav wo kshetra batata hai. Balwan lagnesh ke saath saamanya dasham bhi kaam de jaata hai, kyunki vyakti mein tikne aur laut kar khade hone ki taakat hoti hai. Kamzor lagnesh ke saath achha dasham bhi poora phal nahi de paata, kyunki avsar aane par urja saath nahi deti.',
      'Isliye career ke prashn mein **dono dekhne chahiye** — lagna ka bal aur dasham ki sthiti. Career ka poora vishleshan [Career Prediction Astrology](/learn/career-prediction-astrology) aur [Best career from your birth chart](/learn/best-career-birth-chart) par hai; sarkari sewa ka prashn ho to [Government Job & UPSC](/learn/government-job-chances).',
    ],
  },
  {
    id: 'lagna-kitna-badal-sakta',
    h2: 'Janm samay mein galti se lagna kitna badal jaata hai',
    paras: [
      'Ye is page ka sabse vyavharik hissa hai, kyunki adhikansh galat parinaam yahin se aate hain.',
      '**Lagna lagbhag har do ghante mein badalta hai** — isliye ek ghante ki galti se lagna prayah wahi rahega, par **do ghante ki galti se poora lagna badal jaayega** aur uske saath baarah ke baarah bhaav ghoom jaayenge. Chhoti galtiyon ka asar lagna ki **degree** par padta hai, jo Navamsa aur Dasamsa jaise varga charton ko badal deta hai — aur wahi charton par career aur vivah ke nishkarsh tikte hain.',
      'Vyavharik salah: **hospital record ya janm pramanpatra se samay lijiye**, ghar ki yaad se nahi. Yaad rakha gaya samay prayah aadhe ghante par gol kar diya jaata hai — "subah lagbhag saat baje" — aur wahi dheelapan poore vishleshan mein pahunch jaata hai.',
    ],
  },
  {
    id: 'vs-others',
    h2: 'AstroSage, Prokerala aur doosre lagna calculators se farak',
    paras: [
      'Google in naamon ko is keyword ke saath bar-bar dikhata hai, isliye seedha uttar — aur usme wo bhi jo hamare paksh mein nahi jaata.',
      '**Lagna ke aankde mein antar nahi milega.** Adhikansh gambhir tool wahi Swiss Ephemeris aur wahi Lahiri Ayanamsha use karte hain. Lagna rashi aur degree milni chahiye. Antar aaye to prayah **ayanamsha ka chunav** hai — Lahiri, Krishnamurti aur Raman alag aankde dete hain, aur ye kisi ki galti nahi. Un sites ke paas **zyada tool, zyada bhashaayein aur zyada purana domain authority** bhi hai.',
      'Antar **prastuti** mein hai. Adhikansh lagna calculator lagna ka **naam** de kar chhod dete hain. Ye page uske aage jaata hai — lagna swami kahan hai, uski Shadbala kya hai, pehle bhaav mein kaun hai, aur ye sab mila kar lagna kitna mazboot hai. Yahi ek daawa hai; baaki tulna aap khud kar lijiye.',
    ],
  },
  {
    id: 'upay',
    h2: 'Lagna ko bal dene ke classical upay',
    paras: [
      'Upay lagna ke liye nahi, **lagna swami** ke liye hote hain — kyunki bhaav ka phal uske swami se chalta hai. Ye antar zaroori hai, warna upay galat graha par lag jaata hai.',
      'Char maarg hain, aur teen mein paisa nahi lagta. **Mantra** — lagna swami ka beej ya vedic mantra, niyamit jaap. **Vaar aur vrat** — us graha ke din sanyam. **Daan** — us graha se judi vastu ka daan, usi din. **Devta** — us graha ke adhishthata devta ki upasana.',
      'Chautha maarg **ratna** hai, aur yahan ek zaroori chetavni hai. Lagna swami ka ratna prayah anukool maana jaata hai kyunki lagnesh kabhi marak nahi hota — par uska dohra swamitva dekhna zaroori hai, kyunki wo kisi doosre bhaav ka bhi swami hoga. Jaanch ke liye [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) free hai, aur vidhi [How to wear a gemstone](/learn/how-to-wear-gemstone-vedic) mein.',
    ],
  },
  {
    id: 'dasha',
    h2: 'Lagna swami ki dasha — jeevan ka sabse khaas daur',
    paras: [
      'Ek baat jo kam kahi jaati hai par bahut kaam ki hai: **lagna swami ki Mahadasha prayah jeevan ka sabse pehchan-nirdharak daur hoti hai.**',
      'Wajah saaf hai — lagna aapki apni pehchan, shareer aur disha hai. Jab uska swami dasha chalata hai, to wahi kshetra saamne aate hain: aap kaun hain, kya karna chahte hain, aur duniya aapko kaise dekhti hai. Balwan lagnesh ki dasha mein ye daur khulta hua lagta hai; kamzor lagnesh ki dasha mein yahi daur khud ko dhoondhne wala.',
      'Isliye ye jaanna kaam ka hai ki wo dasha kab aa rahi hai — ya aa chuki hai. Apni chal rahi dasha [Dasha Calculator](/calculators/free-dasha-calculator) se dekhiye; kram ka sidhant [Mahadasha explained](/learn/mahadasha-explained) mein hai.',
    ],
  },
  {
    id: 'lagna-ke-yog',
    h2: 'Lagna se bante yog — Raj Yoga aur Vipreet Raj Yoga',
    paras: [
      'Lagna swami sirf ek graha nahi, **kendra ka swami** bhi hai — aur isi kaaran wo kai yogon mein hissa leta hai.',
      '**Raj Yoga** tab banta hai jab kisi kendra (1, 4, 7, 10) ka swami kisi trikona (1, 5, 9) ke swami se sambandh banaye. Lagna dono shreniyon mein aata hai, isliye lagna swami Raj Yoga banane mein sabse aage rehta hai. Par ek imandar baat: **Raj Yoga bahut aam hai** jab har kendra-trikona sambandh gina jaaye, aur uska hona apne aap mein kuch tay nahi karta — asli sawal ye hai ki wo graha itne balwan hain ya nahi ki phal de sakein.',
      '**Vipreet Raj Yoga** chhathe, aathve aur barahve bhaavon ke swamiyon ke aapsi sambandh se banta hai — yaani kathinai hi unnati ka maadhyam ban jaati hai. Dono ka vistaar [Raj Yoga](/learn/raj-yoga) aur [Vipreet Raj Yoga](/learn/vipreet-raj-yoga) mein hai, aur neech ka dosh kat jaane ki sthiti [Neech Bhang Raj Yoga](/learn/neech-bhang-raj-yoga) mein.',
    ],
  },
  {
    id: 'free-kya',
    h2: 'Free mein kya milta hai',
    paras: [
      'Poora page free hai, aur ye saaf likh dena zaroori hai kyunki is kshetra mein "free" ka matlab prayah "aadha result" hota hai.',
      'Free mein milta hai: **lagna rashi**, **lagna swami**, uska **bhaav**, uska **bal ratio ke saath**, **pehle bhaav ke graha**, kul milakar lagna mazboot hai ya nahi, aur classical upay. Har point ke saath uski wajah. Koi signup nahi, koi card nahi, koi hissa chhupa kar nahi rakha jaata.',
      'Paid reading wahi output taala laga kar nahi hai — wo alag cheez hai. Wo poori kundali padhti hai: saare bhaav, yog, dasha ka kram aur unka aapas mein mel — jo ek lagna-kendrit calculator kabhi nahi kar sakta, chahe kitna vistrit ho jaaye.',
    ],
  },
  {
    id: 'verify',
    h2: 'Result ko khud jaanchne ka tarika',
    paras: [
      'Kisi bhi tool par bharosa karne se pehle use parakhna chahiye. Yahan ka har aankda parakhne layak hai.',
      'Wahi janm tithi, samay aur shahar kisi doosre bharose-mand software mein daaliye. **Lagna rashi aur uski degree bilkul milni chahiye** — dono taraf Swiss Ephemeris aur Lahiri Ayanamsha ho to antar nahi aayega.',
      'Agar **lagna rashi alag** aa rahi ho to do hi sambhavnaayein hain: ya to samay/sthaan mein galti hai, ya doosra software alag **ayanamsha** use kar raha hai (Krishnamurti aur Raman thoda alag aankda dete hain). Sabse pehle samay aur shahar dobara jaanchiye — us par sab kuch tikta hai.',
    ],
  },
  {
    id: 'lagna-degree',
    h2: 'Lagna ki degree — Gandanta aur sandhi ka mamla',
    paras: [
      'Lagna rashi ke saath uski **degree** bhi mayne rakhti hai, aur ye baat prayah chhod di jaati hai.',
      'Do sthitiyaan khaas hain. **Rashi sandhi** — lagna rashi ke bilkul shuru (0 degree) ya bilkul ant (29 degree) mein ho. Aise mein janm samay mein chand minute ki galti bhi poora lagna badal deti hai, isliye samay ki jaanch aur zaroori ho jaati hai. **Gandanta** — jal aur agni rashiyon ki sandhi (Karka-Simha, Vrishchik-Dhanu, Meen-Mesh) ka jod, jise sookshm sthiti maana gaya hai.',
      'Vyavharik matlab: **agar aapka lagna 29 degree par nikla hai to sabse pehle janm samay dobara jaanchiye.** Hospital record dekhiye. Do minute ka antar wahan poora chart badal sakta hai — aur usi par sab tikta hai.',
    ],
  },
  {
    id: 'lagna-varga',
    h2: 'Varga charton mein lagna — Navamsa aur Dasamsa',
    paras: [
      'Janm lagna ek hi nahi hai. **Har varga chart ka apna lagna hota hai**, aur wo alag rashi ho sakti hai.',
      '**Navamsa (D-9)** vivah aur bhagya ka chart hai; uska lagna alag se dekha jaata hai. **Dasamsa (D-10)** career ka chart hai. Ek graha jo janm chart mein achhi sthiti mein ho par Navamsa mein kamzor pade, uska phal vaade se kam nikalta hai — aur yahi antar jaanchne ke liye varga chart bane hain.',
      '**Vargottama** us sthiti ko kehte hain jab koi graha ya lagna janm chart aur Navamsa dono mein ek hi rashi mein pade. Ise bahut anukool maana jaata hai, kyunki wahan vaada aur pushti dono ek disha mein hote hain. Poore varga charton ke liye [Kundali Calculator](/calculators/free-kundali-calculator) free hai.',
    ],
  },
  {
    id: 'lagna-swami-doosra-bhaav',
    h2: 'Lagnesh ka dohra swamitva — ek graha, do bhaav',
    paras: [
      'Paanch graha do-do rashiyon ke swami hain, isliye adhikansh logon ka lagna swami kisi **doosre bhaav ka bhi swami** hota hai. Ye baat upay chunte waqt nirnayak ban jaati hai.',
      'Udaharan: **Mesh lagna** mein Mangal lagnesh hai aur saath hi aathve bhaav ka swami. **Vrishabh lagna** mein Shukra lagnesh hai aur chhathe bhaav ka bhi. **Mithun lagna** mein Budh lagnesh hai aur chaturth ka. Har lagna ke liye ye jodi alag hai.',
      'Iska matlab: **lagnesh ko bal dene par uska doosra bhaav bhi sakriy hota hai.** Isi liye "lagnesh ka ratna hamesha surakshit hai" waali baat adhoori hai — dekhna padta hai ki wo graha aur kis bhaav ko chala raha hai. Jaanch [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) par free hai.',
    ],
  },
  {
    id: 'lagna-aur-gochar',
    h2: 'Gochar aur lagna — Shani-Guru kab lagna ko chhoote hain',
    paras: [
      'Janm ka bal sthir hai; **gochar chalta rehta hai.** Dono ka mel hi asli anubhav banata hai.',
      'Do gochar sabse zyada mehsoos hote hain. **Shani** jab lagna ya lagnesh par se guzarta hai — us daur mein zimmedari, dheerapan aur sanyam ki maang badh jaati hai. **Guru** jab lagna par ya lagnesh par drishti daalta hai — us daur mein vistaar aur avsar aate hain, aur Guru ki drishti shastra mein sabse kalyankari maani gayi hai.',
      'Ek zaroori sudhar jo bar-bar karna padta hai: **Sade Sati lagna se nahi, Chandra rashi se ginte hain.** Log dono ko mila dete hain aur galat nishkarsh nikaal lete hain. Apni sthiti [Sade Sati Calculator](/calculators/free-sade-sati-calculator) se dekhiye — wo Chandra rashi par chalti hai, lagna par nahi.',
    ],
  },
  {
    id: 'do-page-antar',
    h2: 'Lagna Calculator ya Lagna Bal Calculator — kaunsa chalayein',
    paras: [
      'Site par do alag page hain aur dono ka kaam alag hai. Ye antar saaf hona chahiye taaki aap sahi jagah se shuru karein.',
      '**[Lagna Calculator](/calculators/free-lagna-calculator)** batata hai ki **aapka lagna kaunsa hai** — Mesh, Vrishabh, Mithun — uske saath us lagna ka swabhav, shareer, tatva aur anukool kshetra. Agar aapko apna lagna abhi tak nahi pata, to shuruat wahin se hai.',
      '**Ye page** maan kar chalta hai ki lagna pata hai, aur aage ka prashn uthata hai — **wo lagna kitna balwan hai.** Lagnesh kahan hai, uska bal kya hai, pehle bhaav mein kaun hai. Kram yahi rakhiye: pehle pehchan, phir taakat.',
    ],
  },
  {
    id: 'seema',
    h2: 'Sirf lagna bal se poora faisla mat kijiye',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par likhi jaani chahiye.',
      'Lagna bal batata hai ki **aap kitni taakat se apna phal le sakte hain** — ye nahi batata ki **kya** milega ya **kab** milega. Wo prashn baaki bhaavon, yogon aur dasha se jude hain.',
      'Poore chitra ke liye teen cheezein aur chahiye: **baaki bhaavon ka bal** ([Kundali Strength Calculator](/calculators/free-kundali-strength-calculator)), **yog** ([Raj Yoga](/learn/raj-yoga)), aur **dasha ka kram** ([Dasha Calculator](/calculators/free-dasha-calculator)). Lagna bal in sabko taakat ki matra deta hai — disha nahi.',
    ],
  },
  {
    id: 'kaal-purush',
    h2: 'Kaal Purush Kundali — lagna ka mool vichaar',
    paras: [
      'Ye samajhne ke liye ki lagna itna nirnayak kyun hai, ek mool vichaar dekhna zaroori hai. Shastra mein **Kaal Purush** wo aadi kundali hai jisme Mesh pehla bhaav hai, Vrishabh doosra, aur isi kram mein Meen barahvaan.',
      'Har bhaav ka **swabhavik kaarak** wahi se aata hai. Mesh pehla hai isliye pehla bhaav shareer aur pahal ka hai; Vrishabh doosra hai isliye doosra bhaav dhan aur vaani ka; Simha panchma hai isliye panchma bhaav santan aur srijan ka. Ye arth kisi ek kundali ke nahi, sabke liye ek hi hain.',
      'Aapki kundali is chakre ko **ghuma deti hai** — aapka lagna jo bhi ho, wahi pehla khana ban jaata hai. Isi liye ek hi graha do logon ke liye alag arth rakhta hai: uska bhaav badal jaata hai. Yahi wajah hai ki lagna jaane bina koi bhi padhai adhoori hai.',
    ],
  },
  {
    id: 'lagna-par-drishti',
    h2: 'Lagna par kroor grahon ki drishti — kitna vazan dein',
    paras: [
      'Lagnesh ke bal ke saath ye bhi dekha jaata hai ki **pehle bhaav par kiski drishti hai**, kyunki drishti bhi bhaav ka phal badalti hai.',
      '**Guru ki drishti** lagna par sabse kalyankari maani gayi hai — wo raksha aur vistaar deti hai, aur bahut si kamiyon ko dhak leti hai. **Shukra aur Budh** ki drishti bhi anukool hai. **Shani ki drishti** gambhirta aur der laati hai, **Mangal ki** urja aur kabhi ugrata, **Rahu ki** uljhan ya asaamanya jhukav.',
      'Par ek zaroori maap: **drishti "hai ya nahi" nahi hoti, uski matra hoti hai** — poori drishti 60 virupa ki. Shani ki 48 virupa drishti aur 12 virupa drishti ka arth ek nahi hai. Isi liye ye calculator drishti ko ginta nahi, naapta hai — aur wahi Drik Bala mein jud jaata hai.',
    ],
  },
  {
    id: 'lagnesh-ast-vakri',
    h2: 'Lagnesh ast ya vakri ho to kya matlab',
    paras: [
      'Do sthitiyaan aisi hain jo lagnesh ke bal ko badal deti hain aur dono aksar galat samjhi jaati hain.',
      '**Ast (combust)** — lagnesh Surya ke bahut paas aa jaaye. Har graha ki apni seema hai: Chandra 12 degree, Mangal 17, Budh 14, Guru 11, Shukra 10, Shani 15. Ast lagnesh ka arth prayah ye lagaya jaata hai ki vyakti apni pehchan doosron ki chhaya mein banata hai — pita, sanstha ya adhikari ke — aur apni alag pehchan der se banti hai.',
      '**Vakri (retrograde)** ka mamla ulta hai. Shadbala ke hisaab se **vakri graha ko Cheshta Bala sabse zyada milta hai** — yaani vakri hona bal badhata hai. Arth ke star par ise andar ki taraf mudi hui urja se joda jaata hai: vyakti apne hi tareeke se chalta hai. Dono ka vistaar [Planetary dignity](/learn/planetary-dignity-exaltation-debilitation) mein hai.',
    ],
  },
  {
    id: 'twins-lagna',
    h2: 'Twins ka lagna — kuch minute ka antar kya karta hai',
    paras: [
      'Ye prashn parivaaron mein aata hai aur uska uttar seedha hai.',
      'Twins prayah **kuch minute ke antar** se paida hote hain. Adhikansh sthitiyon mein utne se **lagna rashi nahi badalti** — dono ka lagna ek hi hota hai, aur bhaav bhi wahi. Farak sirf lagna ki **degree** mein aata hai, jo chhota lagta hai par varga charton mein dikh jaata hai.',
      'Antar tab bada ho jaata hai jab wo kuch minute **rashi sandhi** par pad jaayein — yaani jab lagna badalne hi wala ho. Aise mein do bhai-behnon ka poora chart alag ban jaata hai. Isi liye twins mein **dono ka sateek samay alag-alag likhna** aur bhi zaroori hai, aur "lagbhag ek hi samay" likh dena baad mein dono ki padhai kharab kar deta hai.',
    ],
  },
  {
    id: 'vyaktitva',
    h2: 'Lagna se vyaktitva — kitna maanein, kitna nahi',
    paras: [
      'Lagna ko vyaktitva ka bhaav kaha jaata hai, aur internet par har lagna ke liye lambi swabhav-soochiyaan mil jaati hain. Yahan santulan zaroori hai.',
      'Jo shastra kehta hai: lagna **pravritti** dikhata hai — kis taraf jhukav swabhavik hai, urja kis roop mein nikalti hai, aur pehla prabhav kaisa padta hai. Isme lagnesh ki sthiti aur pehle bhaav ke graha bhi jud jaate hain, isliye **do log ek hi lagna ke hote hue bilkul alag ho sakte hain.**',
      'Jo nahi maanna chahiye: **lagna se vyaktitva ka poora naksha ban jaata hai.** Parivar, shiksha, mahaul aur apne chunav — inka asar kisi bhi chart se zyada hai. Jo soochi kahe "Mesh lagna wale hamesha aise hote hain", wo saralikaran hai, shastra nahi.',
    ],
  },
  {
    id: 'lagna-sarani',
    h2: 'लग्न सारणी और पुराने तरीके — अब भी काम के हैं?',
    paras: [
      'लग्न सारणी (lagna table) वह पुरानी विधि है जिसमें अक्षांश के अनुसार बनी तालिका से लग्न निकाला जाता था। यह आज भी काम करती है और सीखने लायक है।',
      'इसकी सीमा दो जगह है। **एक** — सारणी प्रायः किसी एक अक्षांश के लिए बनी होती है, इसलिए दूसरे शहर के लिए सुधार करना पड़ता है और वहीं चूक होती है। **दो** — सारणी लग्न राशि तो दे देती है पर **डिग्री नहीं**, और वर्ग चार्ट डिग्री पर टिके होते हैं।',
      'इसलिए यहाँ सारणी का रास्ता नहीं लिया गया। यह पेज **Swiss Ephemeris** से उस क्षण की खगोलीय स्थिति सीधे निकालता है और लाहिड़ी अयनांश लगाता है — वही पुस्तकालय जो पेशेवर सॉफ़्टवेयर उपयोग करते हैं। परिणाम सारणी से थोड़ा अलग आए तो गणना अधिक विश्वसनीय है।',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Aage kya padhein',
    paras: [
      'Apna lagna hi nahi pata — [Lagna Calculator](/calculators/free-lagna-calculator) se shuru kijiye, phir yahan wapas aaiye. Poori kundali free banani ho to [Kundali Calculator](/calculators/free-kundali-calculator).',
      'Bal ka vishay aage badhana ho — saaton grahon ka bal [Weak Planet Finder](/calculators/free-weak-planet-finder), graha-wise vibhajan [Graha Bal Calculator](/calculators/free-graha-bal-calculator), bhaav ka bal [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator), aur sidhant [Shadbala](/learn/shadbala-planetary-strength-vedic-astrology).',
      'Kisi khaas kshetra ka prashn ho — vivah ke liye [Shadi Kab Hogi](/calculators/free-shadi-kab-hogi-calculator), career ke liye [Career Prediction](/learn/career-prediction-astrology), aur chal rahi dasha ke liye [Dasha Calculator](/calculators/free-dasha-calculator).',
    ],
  },
];

type LbLink = { href: string; label: string; note: string };

const HUB_LEARN: LbLink[] = [
  { href: '/learn/shadbala-planetary-strength-vedic-astrology', label: 'Shadbala — planetary strength', note: 'Bal naapne ka sidhant' },
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Har graha ka kaarakattva' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Dignity — uchch aur neech', note: 'Neech vs kamzor' },
  { href: '/learn/mahadasha-explained', label: 'Mahadasha explained', note: 'Lagnesh ki dasha' },
  { href: '/learn/raj-yoga', label: 'Raj Yoga', note: 'Lagnesh ki bhoomika' },
  { href: '/learn/vipreet-raj-yoga', label: 'Vipreet Raj Yoga', note: '6, 8, 12 se banta yog' },
  { href: '/learn/neech-bhang-raj-yoga', label: 'Neech Bhang Raj Yoga', note: 'Jab neech ka dosh kate' },
  { href: '/learn/career-prediction-astrology', label: 'Career Prediction Astrology', note: 'Lagna aur dasham' },
  { href: '/learn/how-to-wear-gemstone-vedic', label: 'Ratna pehanne ki vidhi', note: 'Faisle ke baad' },
];

const HUB_CALC: LbLink[] = [
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Pehle lagna pata kijiye' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-weak-planet-finder', label: 'Weak Planet Finder', note: 'Saaton grahon ka bal' },
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Graha-wise vibhajan' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Bhaav ka bal' },
  { href: '/calculators/free-rashi-calculator', label: 'Rashi Calculator', note: 'Chandra rashi alag hai' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Kaunsi dasha chal rahi hai' },
  { href: '/calculators/free-gemstone-suitability-calculator', label: 'Gemstone Suitability', note: 'Ratna se pehle jaanch' },
  { href: '/calculators/free-shadi-kab-hogi-calculator', label: 'Shadi Kab Hogi', note: 'Vivah ka samay' },
];

function LbRich({ text, k }: { text: string; k: string }) {
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

function LbHub({ items }: { items: LbLink[] }) {
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

export default function FreeLagnaBalCalculatorPage() {
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
          calcType: 'lagna-bal',
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
  const lagnaSign: string | null = result?.instant?.lagna || null;
  const lagnaEn: string | null = result?.instant?.lagna_en || null;
  const lagnaLord: string | null = result?.instant?.lagna_lord || null;
  const janmaNakshatra: string | null = result?.instant?.nakshatra || null;
  const janmaPada: number | null = result?.instant?.pada ?? null;

  const lordObj = lagnaLord ? planets.find((p: any) => p.planet === lagnaLord) : null;
  const lordHouse: number | null = lordObj?.house ?? null;
  const lordStrength: number | null = typeof lordObj?.strength === 'number' ? lordObj.strength : null;
  const lordIsStrong: boolean = lordObj?.shadbala?.isStrong === true;
  const lordRatio: number | null = typeof lordObj?.shadbala?.ratio === 'number' ? lordObj.shadbala.ratio : null;

  const firstHousePlanets = planets.filter((p: any) => p.house === 1);

  const strengthLabel = (() => {
    if (lordStrength === null) return null;
    if (lordIsStrong || lordStrength >= 45) return { label: 'Strong', color: '#86EFAC' };
    if (lordStrength >= 30) return { label: 'Moderate', color: GOLD };
    return { label: 'Weak', color: '#FCA5A5' };
  })();

  const effectText = (() => {
    if (!lagnaLord || lordStrength === null) return '';
    if (lordIsStrong || lordStrength >= 45) {
      return `Aapka lagna lord ${lagnaLord} balwan hai — mazboot personality, achhi vitality, aatm-vishwas aur jeevan mein clear direction. Challenges ka aap achha samna karte hain.`;
    }
    if (lordStrength >= 30) {
      return `Aapka lagna lord ${lagnaLord} moderate strength rakhta hai — personality balanced hai, par kuch areas mein remedies se aur mazbooti aa sakti hai.`;
    }
    return `Aapka lagna lord ${lagnaLord} kamzor hai — aatm-vishwas aur health par dhyaan dena, aur lagna lord ki remedies karna faydemand rahega. Mehnat se ye improve hota hai.`;
  })();

  // ─── Remedies / Dos (lagna lord via route) ──────────────────
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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-lagna-bal-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Lagna Bal Calculator — Ascendant & Lagna Lord Strength',
    description:
      'Find your lagna (ascendant), lagna lord, its house placement & strength, and the planets in your 1st house — with free remedies. Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Lagna Bal Calculator',
    aboutEntities: ['Ascendant', 'Lagna Lord', 'First House', 'Shadbala'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Lagna Analysis', 'Shadbala'],
    howToName: 'How to find your lagna lord placement and strength',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Calculate the lagna', text: 'The calculator finds your ascendant and lagna lord with Shadbala using Swiss Ephemeris with Lahiri Ayanamsha.' },
      { name: 'Get your result', text: "See your lagna, the lagna lord's house placement and strength, 1st-house planets and free remedies." },
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
            <span style={{ color: GOLD }}>Free Lagna Bal Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Lagna Bal Calculator — Ascendant &amp; Lagna Lord Strength
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Lagna Bal</strong> aapki lagna (ascendant) aur uske swami graha ki shakti hai, jo aapke vyaktitva, health aur jeevan ki disha ko represent karti hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Lagna Bal Calculator</strong> Swiss Ephemeris se aapki lagna, lagna lord, uska house & strength, aur pehle bhaav ke grahas turant batata hai — free remedies ke saath.
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
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Lagna Bal (Free)</h2>
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
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Lagna har ~2 ghante mein badalti hai — exact time ke bina lagna galat ho sakti hai. Time daalna best hai.</p>
                  : <p className="text-slate-500 text-xs mt-1">Lagna time-sensitive hai — exact time of birth zaroori.</p>}
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
                {loading ? '⟳ Calculating Lagna Bal...' : '🜂 Check My Lagna Bal'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Shadbala · Parashar BPHS</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* LAGNA VERDICT */}
              {lagnaSign ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                  background: `linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
                  border: `1px solid ${GOLD_RGBA(0.35)}`,
                }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                    {form.name ? `${form.name}'s ` : ''}Lagna (Ascendant)
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-2" style={{ color: GOLD }}>
                    {lagnaSign}{lagnaEn ? <span className="text-2xl text-slate-300"> ({lagnaEn})</span> : null}
                  </div>
                  {lagnaLord && (
                    <div className="text-base text-slate-300">
                      Lagna Lord: <span style={{ color: GOLD }} className="font-bold">{lagnaLord} ({PLANET_HI[lagnaLord]})</span>
                      {strengthLabel && <span style={{ color: strengthLabel.color }} className="font-semibold"> · {strengthLabel.label}</span>}
                    </div>
                  )}
                  {janmaNakshatra && (
                    <div className="text-xs text-slate-500 mt-2">Janma Nakshatra (Moon): {janmaNakshatra}{janmaPada ? ` · Pada ${janmaPada}` : ''}</div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <p className="text-slate-300">Lagna calculate nahi ho payi. Exact time of birth ke saath dobara try karein.</p>
                </div>
              )}

              {/* LAGNA LORD DETAIL */}
              {lagnaLord && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🜂 Lagna Lord — {lagnaLord} ki Sthiti</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                    <DetailCell icon="🏠" label="House Placement" value={lordHouse ? `House ${lordHouse}` : '—'} />
                    <DetailCell icon="📜" label="House Meaning" value={lordHouse ? (HOUSE_MEANING[lordHouse] || '—') : '—'} />
                    <DetailCell icon="💪" label="Strength" value={lordStrength !== null ? `${lordStrength}%` : '—'} />
                  </div>
                  {lordStrength !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Lagna Lord Strength</span>
                        <span>{lordRatio !== null ? `Ratio ${lordRatio.toFixed(2)}×` : ''}</span>
                      </div>
                      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full transition-all duration-1000" style={{ width: `${Math.max(4, Math.min(100, lordStrength))}%`, background: `linear-gradient(90deg, #ef4444 0%, ${GOLD} 55%, #22c55e 100%)` }} />
                      </div>
                    </div>
                  )}
                  {effectText && <p className="text-sm text-slate-300 leading-relaxed italic">{effectText}</p>}
                </div>
              )}

              {/* 1ST HOUSE PLANETS */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-xl font-serif font-bold mb-4" style={{ color: GOLD }}>🪐 Planets in Lagna (1st House)</h3>
                {firstHousePlanets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {firstHousePlanets.map((p: any) => {
                      const benefic = NATURAL_BENEFIC.includes(p.planet);
                      const malefic = NATURAL_MALEFIC.includes(p.planet);
                      const c = benefic ? '#86EFAC' : malefic ? '#FCA5A5' : GOLD;
                      const tag = benefic ? 'Benefic 🌼' : malefic ? 'Malefic 🔥' : 'Neutral';
                      return (
                        <div key={p.planet} className="p-3 rounded-xl flex items-center justify-between"
                          style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${c}33` }}>
                          <div>
                            <div className="font-semibold" style={{ color: c }}>{p.planet} ({PLANET_HI[p.planet]})</div>
                            <div className="text-xs text-slate-400">{p.sign}{typeof p.strength === 'number' ? ` · ${p.strength}%` : ''}</div>
                          </div>
                          <span className="text-xs font-medium" style={{ color: c }}>{tag}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Pehle bhaav (lagna) mein koi graha nahi — aapka vyaktitva mukhya roop se lagna lord ({lagnaLord || '—'}) se shape hota hai.</p>
                )}
              </div>

              {/* DOS */}
              {dos.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos — Lagna Lord ({lagnaLord}) Ko Strong Karein</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dos.map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                  </ul>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>🪔 3 Free Remedies — Lagna Lord {lagnaLord ? `(${lagnaLord})` : ''}</h3>
                  <p className="text-xs text-slate-400 mb-5">Lagna ko balwan banane ke liye (Parashar)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={mantra} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={ratna} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={daan} />}
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
                    <LbRich text={p} k={`s${si}-p${pi}`} />
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lagna Lord Strength (Shadbala)</td><td className="p-3" style={{ color: GOLD }}>✓ Shown</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lagna Lord House Placement</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">1st-House Planets (benefic/malefic)</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── v2.0: the lagna cluster this page was barely linked to ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Lagna aur bal — poora guide</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Apna lagna hi nahi pata to pehle Lagna Calculator chalayiye. Bal ka vishay aage badhana ho to Weak Planet Finder agla kadam hai. Sab free.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Sidhant samjhiye</h3>
                <LbHub items={HUB_LEARN} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Aur bhi free calculators</h3>
                <LbHub items={HUB_CALC} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Lagna Bal Calculator</h2>
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
                { slug: 'free-kundali-strength-calculator', name: 'Kundali Strength' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day Calculator' },
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

function Remedy({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1.5" style={{ color: GOLD }}>{title}</div>
      <div className="text-sm text-slate-300 leading-relaxed">{content}</div>
    </div>
  );
}
