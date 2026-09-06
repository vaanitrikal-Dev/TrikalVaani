'use client';

// ============================================================
// File: app/calculators/free-graha-bal-calculator/page.tsx
// Version: v2.0 (05 Sep 2026) — Free Graha Bal Calculator (Shadbala showcase)
// API: /api/calc/kundali (calcType: 'graha-bal')  [route v1.7+]
// Logic: strongest + weakest planet, full Shadbala 6-bala breakdown
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-09-05) — Keyword-driven content build from Radar E3 PASF.
//        ~1,000 -> ~5,200 words, 4 H2 -> 36, TOC added, FAQs 8 -> 15,
//        21 -> ~25 verified internal links, new layout.tsx title.
//        Form, /api/calc/kundali (calcType 'graha-bal'), JSON-LD and the
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

const PLANET_LIFE_AREAS: Record<string, string[]> = {
  Sun:     ['Career & Authority', 'Father', 'Government', 'Vitality'],
  Moon:    ['Mental peace', 'Mother', 'Emotions', 'Home'],
  Mars:    ['Energy & Courage', 'Siblings', 'Property', 'Drive'],
  Mercury: ['Communication', 'Business', 'Education', 'Intellect'],
  Jupiter: ['Wealth & Fortune', 'Children', 'Wisdom', 'Spirituality'],
  Venus:   ['Marriage & Love', 'Luxury', 'Arts', 'Vehicles'],
  Saturn:  ['Career longevity', 'Discipline', 'Service', 'Endurance'],
  Rahu:    ['Foreign', 'Sudden gains', 'Technology', 'Ambition'],
  Ketu:    ['Spirituality', 'Past karma', 'Moksha', 'Detachment'],
};

const CORE_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const BALA_LABELS: Record<string, string> = {
  sthanaBala: 'Sthana Bala — स्थान (Positional)',
  digBala: 'Dig Bala — दिग् (Directional)',
  kalaBala: 'Kala Bala — काल (Temporal)',
  cheshtaBala: 'Cheshta Bala — चेष्टा (Motional)',
  naisargikaBala: 'Naisargika Bala — नैसर्गिक (Natural)',
  drikBala: 'Drik Bala — दृक् (Aspectual)',
};
const BALA_ORDER = ['sthanaBala', 'digBala', 'kalaBala', 'cheshtaBala', 'naisargikaBala', 'drikBala'];

// Normalize top-level shadbala (array OR object OR {planets:{...}}) → keyed map
function shadbalaMap(raw: any): Record<string, any> {
  const map: Record<string, any> = {};
  if (!raw) return map;
  if (Array.isArray(raw)) {
    raw.forEach((e) => { if (e?.planet) map[e.planet] = e; });
    return map;
  }
  const obj = raw.planets ?? raw;
  if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([k, v]: any) => {
      const planet = v?.planet ?? k;
      if (planet) map[planet] = v;
    });
  }
  return map;
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

const FAQS = [
  { q: 'Graha Bal kya hota hai?', a: 'Graha Bal yaani graha ki shakti — kisi planet ki kundali mein kitni strength hai. Maharishi Parashar ki Shadbala system isse 6 prakaar se naapti hai: Sthana, Dig, Kala, Cheshta, Naisargika aur Drik Bal. Inka yog batata hai ki graha apne results dene mein kitna samarth hai.' },
  { q: 'Mera sabse strong planet konsa hai?', a: 'Date, time aur place of birth daalo. Calculator aapke saare grahas ki Shadbala calculate karke unki ranking deta hai — sabse strong se sabse weak tak — aur har graha ka 6-fold breakdown bhi.' },
  { q: 'Shadbala ke 6 bal konse hain?', a: 'Sthana Bala (positional strength), Dig Bala (directional), Kala Bala (time-based), Cheshta Bala (motion), Naisargika Bala (natural/inherent) aur Drik Bala (aspect-based). Sabka yog = total Shadbala, jise minimum required se compare karte hain.' },
  { q: 'Strong planet ka kya fayda hai?', a: 'Strong graha apne karak life-areas (jaise Jupiter = wealth/knowledge, Venus = relationships) mein achhe aur poore results deta hai. Strongest planet aapki natural strength aur success ka area dikhata hai.' },
  { q: 'Graha kab strong mana jaata hai?', a: 'Jab graha ki total Shadbala uski minimum required strength se zyada ho (ratio 1.0 se upar), tab wo strong (balwan) mana jaata hai. Ratio 1.0 se kam = weak. Calculator ye ratio aur "isStrong" status dono dikhata hai.' },
  { q: 'Weak planet ko strong kaise karein?', a: 'Weak graha ke liye uska mantra jaap, uske vaar ko vrat-daan, deity worship aur expert salaah ke baad gemstone. Calculator aapke sabse weak planet ke liye 3 personalized free remedies deta hai.' },
  { q: 'Kya ye Graha Bal Calculator free hai?', a: 'Haan, 100% free. Strongest + weakest planet, all-planet strength ranking, har graha ka Shadbala 6-bala breakdown, total vs minimum, aur 3 Parashar remedies — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + complete Shadbala (Parashar BPHS) use karta hai with Lahiri Ayanamsha — 99.9% astronomical accuracy. Yahi method professional astrologers use karte hain.' },
  { q: 'Graha Bal Calculator aur Weak Planet Finder mein kya antar hai?', a: 'Ek hi Shadbala ganana, do alag prashn. Ye page maap ka page hai — saaton grahon ka poora bal, chhe balon ka vibhajan, aur unki aapsi tulna. Weak Planet Finder nidaan ka page hai — kaunsa graha peeche hai, wo kya rok raha hai, aur uske upay kya hain. Ganana dekhni ho to yahan rukiye; samasya dhoondhni ho to wahan jaiye.' },
  { q: 'Sabse balwan graha ka kya matlab hai?', a: 'Wo graha jiska Shadbala ratio sabse ooncha hai. Uske kaarak kshetra aapke jeevan mein swabhavik roop se khulte hain — kam sangharsh, jaldi phal. Vyavharik faayda ye hai ki balwan graha ke upay sabse jaldi asar dikhate hain, isliye jab jaldi parinaam chahiye to wahi chunna samajhdari hai.' },
  { q: 'Ishta aur Kashta Phala kya hote hain?', a: 'Ye Shadbala ke aage ki ganana hai. Uchcha Bala aur Cheshta Bala ke jod se nikalta hai ki graha shubh phal (Ishta) dene ki taraf jhuka hai ya kasht dene ki (Kashta). Dono ka jod hamesha 60 hota hai. Isliye ek graha balwan hote hue bhi Kashta pradhan ho sakta hai — bal aur shubhata do alag baatein hain.' },
  { q: 'Bhava Bala kya hai — Shadbala se alag hai?', a: 'Haan. Shadbala graha ka bal naapti hai; Bhava Bala bhaav ka. Isme bhaav ke swami ka bal, bhaav mein baithe graha, us par drishti, aur bhaav ka apna swabhavik bal jud jaate hain. Prashn agar "mera dasham bhaav kitna mazboot hai" hai — graha nahi — to uttar Bhava Bala deta hai.' },
  { q: 'Rupa aur Shashtiamsha kya hain?', a: 'Ye Shadbala ki ikaiyan hain. 1 Rupa = 60 Shashtiamsha. Har bal Shashtiamsha mein naapa jaata hai aur phir Rupa mein badla jaata hai. Isi liye result mein 6.42 Rupa jaise aankde dikhte hain — wo koi manmani sankhya nahi, ek maap hai jise koi bhi doosre software mein jaanch sakta hai.' },
  { q: 'Saare grahon ka bal ek jaisa kyun nahi hota?', a: 'Kyunki har graha ka apna classical minimum alag hai — Surya aur Chandra 6.0 Rupa, Mangal 5.0, Budh 7.0, Guru 6.5, Shukra 5.5, Shani 5.0. Isliye barabar Rupa hone par bhi ek balwan aur doosra kamzor nikal sakta hai. Ye page isi liye Rupa ke saath ratio bhi dikhata hai.' },
  { q: 'Kya har kundali mein koi na koi graha kamzor hota hai?', a: 'Lagbhag hamesha. Saat grahon ka ek saath apne minimum se upar hona bahut durlabh hai. Isliye kisi graha ka kamzor nikalna dosh nahi, kram hai. Asli sawal ye hai ki wo graha aapke lagna ke liye kitna mahatvapurn hai — aur wo bhaav-swamitva se tay hota hai, bal se nahi.' },
];


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2 + GSC, both 05 Sep 2026)
//   ~1,000 words · 4 H2 · 21 internal links.
//   GSC 3 months to 4 Sep 2026: 190 impressions, 11 clicks, CTR 5.79%,
//   average position 32.79.
//
// ── THE SPLIT WITH free-weak-planet-finder — READ THIS FIRST ───────────────
//   These two pages run the SAME engine (/api/calc/kundali) on the SAME
//   measure (Shadbala), and Radar files them in ONE cluster, calc-graha-bal.
//   Their PASF overlaps almost completely — "Planet with highest Shadbala
//   Calculator" appears under the weak-planet keyword too. Left alone they
//   would compete for the same SERP.
//
//   Rohiit chose on 05 Sep 2026 to keep both pages rather than merge and
//   redirect. That choice only works if the two pages answer different
//   questions, so the split is enforced in content:
//
//     free-weak-planet-finder  = DIAGNOSIS. Which planet is behind the
//       trouble, what it blocks, what to do about it. It owns: the six balas
//       as concepts, minimum vs ratio, neech vs weak, ast and vakri, weak
//       Sun/Moon/Mars/…, Rahu-Ketu, remedies, the gemstone warning, dasha.
//
//     THIS PAGE = MEASUREMENT. The number itself and how to read it. It owns:
//       Rupa and Shashtiamsha, the arithmetic inside each bala, Ishta and
//       Kashta Phala, Bhava Bala, Vimsopaka in depth, the strongest planet and
//       what to do with that, comparing planets against each other, how the
//       classical minimums were derived, and verification against other
//       software.
//
//   No H2 on this page repeats an H2 on the other. Anyone editing either page
//   should check the other's SECTIONS list before adding a heading.
//
// WHERE THE H2s COME FROM — Radar E3, live SERP PASF, cluster calc-graha-bal,
// checked 05 Sep 2026. All tracked keywords have our_rank = null:
//     graha bal calculator ............... AIO recommends_tool
//     shadbala calculator online free .... AIO recommends_tool
//     weak planet in kundli calculator ... AIO recommends_tool
//     kamzor grah kaise pata kare ........ AIO partial
//     कुंडली में कौन सा ग्रह कमजोर है ......... AIO partial
//
//   PASF answered on THIS page (measurement side):
//     Shadbala of planets calculator · Free Shadbala calculator
//     Best Shadbala calculator · Shadbala score calculator · Shadbala chart
//     Planet strength calculator · Planet with highest Shadbala Calculator
//     Sthana Bala of planets · Vimsopaka Bala calculator · Bhava Bala Calculator
//     Shadbala Calculator AstroSage / Drik Panchang / Indastro / astrotalk /
//       Prokerala → answered directly rather than dodged.
//
// UNCHANGED — do not "tidy" these
//   The form, /api/calc/kundali, buildCalcJsonLd and the comparison table.
//   Only words, links and FAQs changed.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type GbSection = { id: string; h2: string; paras: string[] };

const SECTIONS: GbSection[] = [
  {
    id: 'kaise-kaam',
    h2: 'Graha Bal Calculator — kaam kaise karta hai',
    paras: [
      'Aap **janm tithi, sateek samay aur sthan** dete hain. Calculator aapki kundali banata hai aur **saaton grahon ka poora Shadbala** nikaalta hai — har graha ke liye chhe alag bal, unka jod, aur us graha ke apne classical minimum ke saamne uska ratio.',
      'Result ek **table** hai, ek vaakya nahi. Har panktee mein graha, uske chhe bal alag-alag, kul Rupa, minimum, aur ratio. Sabse upar sabse balwan graha, sabse neeche sabse kamzor.',
      'Ganana **Swiss Ephemeris** aur **Lahiri Ayanamsha** par hoti hai. Ye page **maap** ka page hai — agar aapka prashn "kya rok raha hai aur kya karun" hai, to [Weak Planet Finder](/calculators/free-weak-planet-finder) uske liye bana hai.',
    ],
  },
  {
    id: 'rupa-shashtiamsha',
    h2: 'Rupa aur Shashtiamsha — Shadbala ki ikaiyan',
    paras: [
      'Shadbala ki apni ikaai hai, aur use jaane bina result ke aankde bemaani lagte hain.',
      'Mool ikaai **Shashtiamsha** hai — yaani saathvaan hissa. **60 Shashtiamsha = 1 Rupa.** Har bal pehle Shashtiamsha mein naapa jaata hai, phir sab jod kar Rupa mein badal diya jaata hai. Isi liye result mein 6.42 Rupa jaise aankde aate hain, poore ank nahi.',
      'Ye jaan lena isliye zaroori hai ki **ye koi manmani sankhya nahi hai.** 6.42 Rupa ek maap hai, ek raay nahi — aur wahi aankda kisi bhi doosre gambhir software mein bhi nikalna chahiye. Yahi is page ka poora aadhaar hai: sankhya dikhana, label nahi.',
    ],
  },
  {
    id: 'sthana-bala-ganit',
    h2: 'Sthana Bala ka ganit — paanch hisse',
    paras: [
      'Sthana Bala chhe balon mein sabse bhaari hai, aur uske andar hi **paanch alag ganana** chalti hain. Inhe alag-alag dekhna hi asli samajh deta hai.',
      '**Uchcha Bala** — graha apne uchch bindu se kitni degree door hai. Theek uchch par 60 Shashtiamsha, theek neech par 0, aur beech mein anupaat se. **Saptavargaja Bala** — saat varga charton mein graha ki sthiti ka jod; apni rashi, mitra rashi ya shatru rashi hone par alag ank. **Ojhayugmarashiamsha Bala** — sam aur visham rashi ka prabhav, jo streeling aur pulling grahon ke liye ulta chalta hai.',
      '**Kendradi Bala** — kendra (1,4,7,10) mein 60, panaphara (2,5,8,11) mein 30, apoklima (3,6,9,12) mein 15 Shashtiamsha. **Drekkana Bala** — rashi ke teen hisson mein se kis hisse mein graha hai. Ye paanchon jod kar Sthana Bala banti hai — isi liye "graha achhi rashi mein hai" kehna is ganana ka sirf ek hissa hai.',
    ],
  },
  {
    id: 'dig-bala-ganit',
    h2: 'Dig Bala ka ganit — degree se kaise nikalta hai',
    paras: [
      'Dig Bala ka niyam sunne mein saral hai — har graha ki ek anukool dishaa hai — par uski ganana anupaat se hoti hai, "haan/na" se nahi.',
      'Har graha ke liye ek **poori-bal bindu** hai: Guru aur Budh ke liye lagna, Surya aur Mangal ke liye dasham, Shani ke liye saatva, Chandra aur Shukra ke liye chaturth. Us bindu par 60 Shashtiamsha milte hain. Uske **theek saamne wale bindu** par 0. Beech mein jitni degree door, utna anupaat se kam.',
      'Vyavharik matlab: **ek hi bhaav mein do graha alag Dig Bala pa sakte hain**, kyunki unki degree alag hai aur unka poori-bal bindu bhi alag. Isi liye "dasham ka Surya balwan hai" ek mota kathan hai — asli aankda degree se nikalta hai, aur wahi result mein dikhta hai.',
    ],
  },
  {
    id: 'kala-bala-ganit',
    h2: 'Kala Bala ke saat hisse',
    paras: [
      'Kala Bala samay se aata hai aur ye chhe balon mein sabse bikhra hua hai — iske **saat upvibhag** hain.',
      '**Nathonnatha Bala** — din-raat ka. Chandra, Mangal aur Shani ko raat mein poora bal, Surya, Guru aur Shukra ko din mein; Budh ko dono mein poora. **Paksha Bala** — shukla paksh mein shubh grahon ko, krishna paksh mein kroor grahon ko; Chandra ke liye ye nirnayak hai. **Tribhaga Bala** — din aur raat ke teen-teen hisson ka, jisme Budh, Surya aur Shani ko din ke teen hisse aur Chandra, Shukra, Mangal ko raat ke.',
      '**Abda Bala** (varsh ke swami ko 15), **Masa Bala** (maas ke swami ko 30), **Vara Bala** (vaar ke swami ko 45), **Hora Bala** (hora ke swami ko 60), aur **Ayana Bala** — uttarayan aur dakshinayan ke hisaab se kranti par aadhaarit. Yahi wo hissa hai jo **sateek janm samay** maangta hai, kyunki Hora har ghante badalta hai.',
    ],
  },
  {
    id: 'cheshta-bala-ganit',
    h2: 'Cheshta Bala — gati ka ganit',
    paras: [
      'Cheshta Bala naapta hai ki graha apni **saamanya chaal** se kitna alag chal raha hai, aur iska ganit baaki sab se alag hai.',
      'Graha ki gati ki aath awasthaayein maani gayi hain — vakri (retrograde), anuvakri, manda, mandatara, sama, chara, atichara aur vakra-samapti. **Vakri graha ko sabse zyada Cheshta Bala milta hai — poore 60 Shashtiamsha.** Ye bahut logon ko chaunkata hai, kyunki vakri hona aam taur par kamzori samjha jaata hai.',
      '**Surya aur Chandra kabhi vakri nahi hote**, isliye unka Cheshta Bala alag tarike se nikalta hai — Surya ka Ayana Bala se aur Chandra ka Paksha Bala se joda jaata hai. Yahi wajah hai ki inke aankde baaki paanch grahon se alag pattern mein chalte hain.',
    ],
  },
  {
    id: 'naisargika-drik-ganit',
    h2: 'Naisargika aur Drik Bala — sthir aur badalta hissa',
    paras: [
      '**Naisargika Bala** chhe balon mein akela aisa hai jo **kundali par nirbhar hi nahi karta.** Ye har graha ke liye sthir hai aur uski chamak ke kram se nikala gaya hai: Surya 60, Chandra 51.43, Shukra 42.85, Guru 34.28, Budh 25.70, Mangal 17.14, Shani 8.57 Shashtiamsha.',
      'Iska matlab: **Shani ko swabhavik roop se sabse kam bal milta hai aur Surya ko sabse zyada** — har kundali mein, hamesha. Isi ki bharpai uske kam minimum se hoti hai (Shani ka 5.0 Rupa, Surya ka 6.0). Do niyam mil kar santulan banate hain.',
      '**Drik Bala** iske ulta poori tarah kundali par tikta hai. Ye doosre grahon ki drishti se milne ya ghatne wala bal hai, aur **rinatmak bhi ho sakta hai** — akela aisa bal jo minus mein ja sakta hai. Shubh graha ki drishti jodti hai, kroor ki ghatati hai, aur maatra drishti ke kon par tikti hai.',
    ],
  },
  {
    id: 'minimum-kahan-se',
    h2: 'Classical minimum kahan se aaye — 5.0 se 7.0 tak kyun',
    paras: [
      'Result mein har graha ka ek **minimum required** dikhta hai, aur ye sankhyaayein manmani nahi hain.',
      'BPHS mein diye gaye maanak: **Surya 6.5, Chandra 6.0, Mangal 5.0, Budh 7.0, Guru 6.5, Shukra 5.5, Shani 5.0 Rupa** (kuch paramparaein Surya ke liye 6.0 leti hain, aur yahi antar do software ke aankdon mein thoda farak la sakta hai).',
      'Kram par gaur kijiye: **Budh ka minimum sabse ooncha hai (7.0), Mangal aur Shani ka sabse neecha (5.0).** Iska matlab shastra Budh se zyada maang karta hai — use "balwan" kehlane ke liye zyada bal chahiye. Isi liye **Budh ka kamzor nikalna sabse aam hai**, aur wo apne aap mein chinta ki baat nahi. Bina minimum ke sirf Rupa dikhana aadha sach hai.',
    ],
  },
  {
    id: 'sabse-balwan',
    h2: 'Sabse balwan graha — aur uska vyavharik upyog',
    paras: [
      'Adhikansh log kamzor graha dhoondhne aate hain. Balwan graha ki jaankari prayah usse zyada kaam ki nikalti hai.',
      'Sabse balwan graha wo hai jiska **ratio sabse ooncha** hai. Uske kaarak kshetra aapke jeevan mein swabhavik roop se khulte hain — wahan sangharsh kam lagta hai aur phal jaldi aata hai. Career ki disha chunte waqt, ya ye tay karte waqt ki urja kahan lagayein, ye jaankari seedha kaam aati hai.',
      'Aur ek vyavharik baat jo kam kahi jaati hai: **balwan graha ke upay sabse jaldi phal dete hain.** Kamzor graha ko sahara dene mein samay lagta hai; balwan graha ko thoda aur bal dene par asar jaldi dikhta hai. Isliye jab jaldi parinaam chahiye, upay balwan graha ka chunna zyada vyavharik hai.',
    ],
  },
  {
    id: 'ishta-kashta',
    h2: 'Ishta aur Kashta Phala — bal ke aage ka maap',
    paras: [
      'Ye Shadbala ke aage ki ganana hai aur bahut kam calculator ise dikhate hain — par yahi wo cheez hai jo "balwan matlab achha" wali galatfehmi todti hai.',
      'Ganit ye hai: **Uchcha Bala aur Cheshta Bala ke varg-mool ke gunanfal** se Ishta Phala nikalta hai, aur 60 mein se ghata kar Kashta Phala. **Dono ka jod hamesha 60 hota hai.** Ishta ka arth hai graha shubh phal dene ki taraf jhuka hai, Kashta ka arth hai kasht dene ki taraf.',
      'Iska seedha natija: **ek graha balwan hote hue bhi Kashta pradhan ho sakta hai.** Yaani wo apna phal poori taakat se dega — par wo phal sukhad hoga ya kathin, ye alag prashn hai. Isi liye Shadbala akeli "achha/bura" nahi bata sakti, aur jo tool sirf bal dikha kar nishkarsh de de wo aadha kaam kar raha hai.',
    ],
  },
  {
    id: 'bhava-bala',
    h2: 'Bhava Bala — bhaav ka bal, graha ka nahi',
    paras: [
      'Shadbala graha naapti hai. **Bhava Bala bhaav naapti hai** — aur bahut se prashn asal mein bhaav ke hote hain, graha ke nahi.',
      'Bhava Bala teen hisson se banti hai. **Bhavadhipati Bala** — us bhaav ke swami ka apna Shadbala, seedha bhaav ko mil jaata hai. **Bhava Digbala** — bhaav ki apni dishaa ke hisaab se bal; jaise pehla, panchma, navam bhaav Brahmin grahon se bal paate hain. **Bhava Drishti Bala** — us bhaav par padne wali drishtiyon ka jod, jo rinatmak bhi ho sakta hai.',
      'Kab kaunsa dekhein: **"mera Guru kitna balwan hai" — Shadbala. "Mera dasham bhaav kitna mazboot hai" — Bhava Bala.** Bhaav-wise chitra ke liye [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator) alag se bana hai aur free hai.',
    ],
  },
  {
    id: 'vimsopaka',
    h2: 'Vimsopaka Bala — sthirta ka maap',
    paras: [
      'Vimsopaka Shadbala se poori tarah alag paddhati hai, aur wo ek doosra prashn poochhti hai: **graha kitna sthir hai.**',
      'Ganit: graha ko **20 ankon** mein se ank die jaate hain, is aadhaar par ki wo varga charton mein kitni achhi rashiyon mein padta hai. Char paddhatiyaan hain — **Shadvarga** (6 charts), **Saptavarga** (7), **Dashavarga** (10) aur **Shodashavarga** (16). Jitne zyada chart, utni kadi jaanch.',
      'Antar samajhne layak hai: **Shadbala kehti hai graha kitni taakat rakhta hai; Vimsopaka kehti hai wo taakat kitni bharose ki hai.** Ek chart mein achha dikhna alag baat hai, sola charton mein achha rehna doosri. Isi liye 15 se upar Vimsopaka ko bahut anukool maana jaata hai, chahe Shadbala saamanya ho.',
    ],
  },
  {
    id: 'saat-graha-tulna',
    h2: 'Saaton grahon ki aapsi tulna — table kaise padhein',
    paras: [
      'Ye page ek table deta hai, aur uska poora faayda tabhi milta hai jab padhne ka kram pata ho.',
      '**Pehle ratio ka column dekhiye** — kaun 1.00 ke upar hai, kaun neeche. **Phir sabse ooncha aur sabse neecha graha note kijiye** — wahi do aapke jeevan ke sabse khule aur sabse tang kshetra batate hain. **Phir kisi ek graha ki panktee mein chhe balon ka vibhajan dekhiye** — kaunsa hissa uthaa hua hai aur kaunsa gira hua.',
      'Ye vibhajan isliye mayne rakhta hai ki **wajah alag hone par arth bhi alag hota hai.** Ooncha Sthana Bala par gira Dig Bala matlab graha achhi rashi mein hai par galat bhaav mein. Ooncha Naisargika par rinatmak Drik Bala matlab graha swabhavik roop se mazboot hai par kisi kroor graha ki drishti use daba rahi hai. Ek jaisa kul aankda, do bilkul alag kahaniyaan.',
    ],
  },
  {
    id: 'sthana-vs-kala',
    h2: 'Kaunsa bal kitna mayne rakhta hai',
    paras: [
      'Chhe bal barabar vazan nahi rakhte, aur ye jaanna table padhte waqt seedha kaam aata hai.',
      '**Sthana Bala** prayah sabse bada hissa deti hai, kyunki uske andar paanch upvibhag hain — akela wahi kul bal ka bada hissa ban jaata hai. **Kala Bala** doosre number par, kyunki uske saat hisse hain. **Dig Bala** ek hi ganana hai par 60 Shashtiamsha tak ja sakti hai, isliye uska asar dikhta hai.',
      '**Naisargika Bala** sthir hai aur uspar aapka koi niyantran nahi — wo har kundali mein wahi rehta hai. **Cheshta Bala** paanch grahon par lagu hota hai. **Drik Bala** sabse chhota par akela aisa jo **rinatmak** ho sakta hai, isliye wo ghata bhi sakta hai.',
      'Vyavharik nateeja: jab do graha ka ratio kareeb ho, to **Drik Bala aksar faisla karta hai** — kyunki wahi ek hai jo minus mein ja sakta hai. Isi liye result usko alag column mein dikhata hai.',
    ],
  },
  {
    id: 'shadbala-chart-padhna',
    h2: 'Shadbala Chart — jo aankda kahin nahi milta',
    paras: [
      'PASF mein "Shadbala chart" aur "Shadbala score calculator" bar-bar aate hain, aur log prayah nirash lautte hain — kyunki adhikansh tool sirf ek label dete hain.',
      'Yahan poora chart milta hai: **saat panktee (graha), chhe column (bal), aur teen aur column — kul Rupa, minimum, ratio.** Yahi wo naksha hai jo peshevar software dikhate hain, aur jise dekh kar hi koi bhi gambhir vishleshan shuru hota hai.',
      'Chart ka sabse bada faayda **tulna** hai. Ek graha ka aankda akela kuch nahi kehta; saat ka saath dekhna batata hai ki aapki kundali ka jhukav kis taraf hai — kaunse do graha aage hain, kaunse do peeche, aur beech mein kitna faasla hai.',
    ],
  },
  {
    id: 'ratio-vs-rupa',
    h2: 'Rupa dekhein ya ratio — kaunsa aankda sahi hai',
    paras: [
      'Dono sahi hain par unka kaam alag hai, aur inhe mila dena galat nishkarsh deta hai.',
      '**Rupa absolute maap hai** — graha ka kul bal. **Ratio saapeksh maap hai** — wo bal, us graha ke apne minimum se bhaag diya hua. Tulna ke liye hamesha **ratio** dekhiye.',
      'Udaharan se saaf hoga. Budh 6.8 Rupa aur Shani 6.8 Rupa — Rupa mein barabar. Par Budh ka minimum 7.0 hai aur Shani ka 5.0, to ratio hua **Budh 0.97** aur **Shani 1.36**. Yaani Shani mazboot hai aur Budh apne maanak se thoda neeche. Sirf Rupa dekhne wala insaan yahan galat nishkarsh nikaal lega.',
    ],
  },
  {
    id: 'har-graha-ka-kshetra',
    h2: 'Kis graha ka bal kis kshetra mein dikhta hai',
    paras: [
      'Bal ka aankda tabhi arth rakhta hai jab pata ho ki wo graha **kya chalata hai.** Ye classical kaarakattva hain.',
      '**Surya** — aatma, pita, pad, sarkar. **Chandra** — mann, maa, neend, poshan. **Mangal** — urja, saahas, bhai, sampatti. **Budh** — buddhi, sanvaad, vyapaar, ganana. **Guru** — gyaan, dhan, santan, guru. **Shukra** — sambandh, kala, sukh, vaahan. **Shani** — sewa, anushasan, aayu, karm.',
      'Ek zaroori sudhar jo aksar chhoot jaata hai: **kaarakattva sabke liye ek hai, par bhaav-swamitva har lagna ke liye alag.** Shukra sabke liye sambandh ka kaarak hai — par aapki kundali mein wo kaunse bhaavon ka swami hai, ye aapke lagna par tikta hai. Result dono dikhata hai, alag-alag. Har graha ka vistaar [Planets in Astrology](/learn/planets-in-astrology) mein hai.',
    ],
  },
  {
    id: 'balwan-graha-ke-kshetra',
    h2: 'Balwan Surya, Chandra aur Mangal — kya khulta hai',
    paras: [
      '**Balwan Surya** — pehchan aur pad swabhavik roop se aate hain, adhikariyon ke saath sahaj sambandh, aur nirnay lene mein sthirta. Sarkari sewa aur netritva ke prashn mein iska bal seedha vazan rakhta hai; wahan Dig Bala bhi jud jaata hai, kyunki Surya ko dasham bhaav mein poora Dig Bala milta hai.',
      '**Balwan Chandra** — mann ki sthirta, achhi neend, logon se sahaj judav, aur bhavnaon ko sambhal lene ki kshamata. Chandra ka bal **Paksha Bala** par bahut tikta hai, isliye purnima ke aas-paas janme logon ka Chandra swabhavik roop se ooncha aankda leta hai.',
      '**Balwan Mangal** — pahal, saahas, shareerik urja aur kaam poora karne ki kshamata. Sampatti aur bhai-behno ke kshetra bhi Mangal ke hain. Mangal ka minimum sabse neecha (5.0 Rupa) hai, isliye uska ratio prayah ooncha dikhta hai — ye kundali ki khoobi nahi, maanak ka farak hai.',
    ],
  },
  {
    id: 'balwan-budh-guru-shukra-shani',
    h2: 'Balwan Budh, Guru, Shukra aur Shani — kya khulta hai',
    paras: [
      '**Balwan Budh** — spasht sanvaad, tez ganana, vishleshan aur vyapaar mein kushalta. Yaad rakhiye Budh ka minimum sabse ooncha (7.0 Rupa) hai, isliye Budh ka 1.00 se upar aana apne aap mein khaas baat hai.',
      '**Balwan Guru** — gyaan, sahi salah milna, dhan ka tikna, aur santan ke kshetra mein sahajta. Guru ki drishti shastra mein sabse kalyankari maani gayi hai, isliye balwan Guru ka asar sirf apne bhaav tak nahi rehta — jin bhaavon par uski drishti hai wahan bhi pahunchta hai.',
      '**Balwan Shukra** — sambandh, kala, saundarya aur jeevan ke aaram wale pahlu. **Balwan Shani** — dheeraj, anushasan, lambe kaam poore karna, aur sewa ke kshetra mein tikaav. Shani ka Naisargika Bala sabse kam hai par minimum bhi sabse kam, isliye uska ratio sahi tasveer deta hai — Rupa nahi.',
    ],
  },
  {
    id: 'do-graha-barabar',
    h2: 'Do graha ka ratio barabar aa jaaye to',
    paras: [
      'Ye aksar hota hai aur tab table ko thoda gehrai se padhna padta hai.',
      'Teen cheezein dekhiye. **Ek — kis bal se aankda aaya.** Sthana Bala se aaya bal zyada sthir hota hai kyunki wo rashi aur varga par tikta hai; Kala Bala se aaya bal janm ke samay par tikta hai. **Do — Drik Bala rinatmak to nahi.** Agar hai to us graha par kisi kroor ki drishti hai, aur uska phal daba hua rahega.',
      '**Teen — Ishta aur Kashta.** Barabar bal wale do grahon mein se ek Ishta pradhan ho sakta hai aur doosra Kashta pradhan. Aise mein pehla apna phal sukhad roop mein dega aur doosra kathin roop mein — bal barabar hote hue bhi.',
      'Aur aakhir mein **bhaav-swamitva** — wo graha aapke lagna ke liye shubh hai ya marak. Ye Shadbala se bahar ki baat hai par nirnay mein sabse bhaari padti hai.',
    ],
  },
  {
    id: 'kundali-ka-jhukav',
    h2: 'Poori kundali ka jhukav — saat aankdon se kya dikhta hai',
    paras: [
      'Ek graha ka bal ek jaankari hai. **Saaton ka pattern ek tasveer hai** — aur wo tasveer prayah zyada kaam ki hoti hai.',
      'Teen pattern aam hain. **Sapaat** — saare graha 0.90 se 1.20 ke beech; aisi kundali mein koi bhi kshetra na bahut khula na bahut tang, aur jeevan santulit par bina teekhe mod ke chalta hai. **Do dhruv** — do graha bahut ooncha aur do bahut neeche; yahan kuch kshetra bahut mazboot aur kuch bar-bar dikkat wale.',
      '**Ek shikhar** — ek graha sabse aage, baaki saamanya. Aisi kundali mein us ek graha ke kshetra pehchan ban jaate hain, aur karier ya jeevan-disha prayah usi taraf mudti hai.',
      'Ye pattern dekhna aankdon ko yaad karne se zyada upyogi hai — kyunki faisla prayah "kahan zor lagayein" ka hota hai, aur uska uttar isi tasveer mein hai.',
    ],
  },
  {
    id: 'bal-badal-sakta',
    h2: 'Kya graha ka bal badal sakta hai',
    paras: [
      'Ye prashn saaf uttar maangta hai kyunki iske naam par bahut kuch becha jaata hai.',
      '**Janm ka Shadbala kabhi nahi badalta.** Wo janm ke kshan ki khagolik sthiti se nikla ek sthir aankda hai. Koi upay, koi ratna, koi pooja us sankhya ko nahi badalti — aur jo koi "aapka Shani ka bal badha denge" kahe, wo galat keh raha hai.',
      'Jo badalta hai wo **anubhav** hai. Upay ka shastriya arth ye hai ki us graha ke phal ko sambhalna aasan ho jaata hai, karm ka bojh halka hota hai. Aur **gochar** badalta rehta hai — grah aakash mein chalte rehte hain aur unka chalta hua asar alag hota hai janm ke bal se.',
      'Isliye do cheezein alag rakhiye: **janm ka bal (sthir)** aur **chalta hua gochar (badalta hua)**. Gochar ke liye [Sade Sati Calculator](/calculators/free-sade-sati-calculator) aur samay ke liye [Dasha Calculator](/calculators/free-dasha-calculator) alag se hain.',
    ],
  },
  {
    id: 'ayanamsha-antar',
    h2: 'Ayanamsha aur software ka antar — aankde alag kyun aate hain',
    paras: [
      'Do tool alag Rupa dikha rahe hain — ye shikayat aam hai aur iski teen thos wajah hain.',
      '**Ek — ayanamsha.** Lahiri, Krishnamurti aur Raman alag hain. Isse grahon ki degree badalti hai, aur degree badalne se Uchcha Bala aur Dig Bala dono badal jaate hain. **Do — minimum ka chunav.** Kuch paramparaein Surya ke liye 6.5 Rupa lete hain, kuch 6.0 — isse ratio badal jaata hai chahe Rupa same ho.',
      '**Teen — upvibhagon ka implementation.** Saptavargaja aur Tribhaga Bala ki ganana software-dar-software thoda alag hoti hai, kyunki granth mein kuch jagah vyakhya ki gunjaish hai.',
      'Isliye **thoda antar aana saamanya hai aur kisi ki galti nahi.** Par agar antar bada ho — jaise ek tool 4.2 aur doosra 7.8 dikhaye — to pehle **janm samay aur shahar** jaanchiye. Wahin se prayah galti aati hai.',
    ],
  },
  {
    id: 'vs-others',
    h2: 'Best Shadbala Calculator kaunsa hai — imandar tulna',
    paras: [
      'Google in naamon ko is keyword ke saath bar-bar dikhata hai, isliye seedha uttar — usme wo bhi jo hamare paksh mein nahi jaata.',
      '**Aankda lagbhag milna chahiye.** Adhikansh gambhir tool wahi Swiss Ephemeris aur wahi Lahiri Ayanamsha use karte hain. Thoda antar upar wale teen kaarnon se aa sakta hai. Un sites ke paas **zyada tool, zyada bhashaayein aur zyada purana domain authority** bhi hai — ye maan lena chahiye.',
      'Antar do jagah hai. **Ek** — adhikansh tool kul Rupa de kar chhod dete hain; yahan **chhe balon ka vibhajan, minimum, aur ratio teeno** ek saath dikhte hain. **Do** — yahan likha hai ki har aankda kahan se aaya, taaki aap use parakh sakein aur asahmat bhi ho sakein. Yahi ek daawa hai; baaki tulna aap khud kar lijiye.',
    ],
  },
  {
    id: 'kab-kaam-nahi',
    h2: 'Shadbala kab kaam nahi aati',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par likhni chahiye.',
      'Shadbala **saamarthya** naapti hai — na disha, na shubhata, na samay. Wo ye nahi batati ki graha achha phal dega ya bura (uske liye Ishta-Kashta aur bhaav-swamitva chahiye), na ye ki phal kab aayega (uske liye dasha chahiye), aur na ye ki kaunsa bhaav mazboot hai (uske liye Bhava Bala chahiye).',
      'Aur ek aur seema: **Rahu aur Ketu ki Shadbala hoti hi nahi**, kyunki wo chhaya graha hain aur unki koi apni gati ya dishaa nahi. Jo tool "Rahu ka Shadbala" dikhaye, wo apna banaya hua aankda dikha raha hai.',
      'Isliye ye page ek **maap** hai, poora vishleshan nahi. Nidaan ke liye [Weak Planet Finder](/calculators/free-weak-planet-finder), bhaav ke liye [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator), aur samay ke liye [Dasha Calculator](/calculators/free-dasha-calculator).',
    ],
  },
  {
    id: 'janm-samay-asar',
    h2: 'Janm samay ki galti kis bal ko sabse zyada badalti hai',
    paras: [
      'Sab bal barabar sanvedansheel nahi hain, aur ye jaan lena vyavharik roop se kaam ka hai.',
      '**Sabse zyada sanvedansheel — Dig Bala.** Wo bhaav par tikta hai aur bhaav lagna se bante hain; lagna har do ghante badalta hai. Do ghante ki galti Dig Bala poori tarah badal deti hai. **Uske baad Kala Bala** — Hora har ghante badalta hai, isliye ek ghante ki galti bhi ise hilati hai.',
      '**Sabse kam sanvedansheel — Naisargika Bala** (wo badalta hi nahi) aur **Sthana Bala** (rashi din bhar prayah wahi rehti hai, sirf degree thodi khiskti hai).',
      'Vyavharik matlab: **agar samay anumaan se hai to ratio ko disha-soochak maaniye, nirnay nahi** — khaas kar tab jab do grahon ke aankde kareeb hon. Sateek samay janm pramanpatra ya hospital record se lijiye; ghar ki yaad prayah aadhe ghante par gol kar di jaati hai.',
    ],
  },
  {
    id: 'free-kya',
    h2: 'Free mein kya milta hai',
    paras: [
      'Poora page free hai, aur ye saaf likh dena zaroori hai kyunki is kshetra mein "free" ka matlab prayah "aadha result" hota hai.',
      'Free mein milta hai: **saaton grahon ka poora Shadbala**, **chhe balon ka vibhajan har graha ke liye**, **kul Rupa**, **classical minimum**, **ratio**, aur **ranking** sabse balwan se sabse kamzor tak. Koi signup nahi, koi card nahi, koi hissa chhupa kar nahi rakha jaata.',
      'Paid reading wahi table taala laga kar nahi hai. Wo poori kundali padhti hai — bhaav-swamitva, yog, dasha ka kram, aur inka aapas mein mel — yaani wo prashn jo bal ka aankda kabhi nahi bata sakta.',
    ],
  },
  {
    id: 'verify',
    h2: 'Aankdon ko doosre software se milane ka tarika',
    paras: [
      'Kisi bhi tool par bharosa karne se pehle use parakhna chahiye, aur ye page isi liye har aankda dikhata hai.',
      'Wahi janm tithi, samay aur shahar kisi doosre bharose-mand software mein daaliye. **Sabse pehle grahon ki rashi aur degree milaiye** — wo bilkul milni chahiye. Uske baad Rupa dekhiye; **thoda antar saamanya hai**, kyunki upvibhagon ka implementation alag ho sakta hai.',
      'Agar **degree hi alag** aa rahi ho to wajah ayanamsha hai ya samay. Agar **degree milti hai par Rupa bahut alag hai**, to doosre tool ka minimum ya bal-ganana alag hai — dono galat nahi, bas alag maanak hain.',
      'Aur agar **lagna hi alag** aaye to samay ya shahar mein galti hui hai. Wahi pehle jaanchiye, kyunki us par Dig Bala aur poora bhaav-dhancha tikta hai.',
    ],
  },
  {
    id: 'shadbala-kyun-bani',
    h2: 'Shadbala banayi hi kyun gayi — mool samasya kya thi',
    paras: [
      'Ye samajh lena poore page ka aadhaar hai, aur ye baat kahin nahi milti.',
      'Samasya ye thi ki **graha ki sthiti ke bahut se alag-alag sanket ek doosre se ulta bolte hain.** Ek graha uchch rashi mein ho par galat bhaav mein; doosra apni rashi mein ho par kroor grahon ki drishti mein; teesra vakri ho aur ast bhi. Har niyam apne aap mein sahi hai, par unka jod kaise nikale?',
      'Shadbala isi ka uttar hai. Wo har sanket ko **ek hi ikaai (Shashtiamsha) mein badal deti hai**, taaki unhe joda ja sake. Uchch hona, bhaav, dishaa, samay, gati aur drishti — sab ek hi paimane par. Isi liye Shadbala ek raay nahi, ek **hisaab** hai, aur isi liye do alag log ek hi kundali dekh kar ek hi aankde par pahunchte hain.',
    ],
  },
  {
    id: 'saptavargaja',
    h2: 'Saptavargaja Bala — saat charton ka jod',
    paras: [
      'Sthana Bala ke paanch hisson mein ye sabse mehnat wala hai, aur sabse zyada bolta bhi hai.',
      'Saat varga chart liye jaate hain: **Rasi (D-1), Hora (D-2), Drekkana (D-3), Saptamsa (D-7), Navamsa (D-9), Dwadasamsa (D-12) aur Trimsamsa (D-30).** Har chart mein dekha jaata hai ki graha kis tarah ki rashi mein pada — apni rashi, mool-trikona, uchch, mitra, sam, shatru ya neech.',
      'Har sthiti ke apne ank hain — mool-trikona sabse zyada, neech sabse kam — aur saaton charton ke ank jod diye jaate hain. Iska matlab: **ek chart mein achha dikhna kaafi nahi.** Jo graha saaton mein tikta hai wahi yahan ooncha aankda paata hai, aur yahi Saptavargaja ko baaki upvibhagon se zyada bharose ka banata hai.',
    ],
  },
  {
    id: 'kendradi-drekkana',
    h2: 'Kendradi aur Drekkana Bala — bhaav aur rashi ke teen hisse',
    paras: [
      'Ye do upvibhag chhote hain par inka niyam saaf hai aur inhe khud jaancha ja sakta hai.',
      '**Kendradi Bala** sirf bhaav dekhta hai. Kendra (1, 4, 7, 10) mein graha ko **60 Shashtiamsha**, panaphara (2, 5, 8, 11) mein **30**, aur apoklima (3, 6, 9, 12) mein **15**. Bas itna. Isi liye kendra ke grahon ka bal swabhavik roop se ooncha nikalta hai, aur yahi wajah hai ki Pancha Mahapurusha yog bhi kendra maangte hain.',
      '**Drekkana Bala** rashi ko teen barabar hisson (10-10 degree) mein baant kar dekhta hai. Pehle drekkana mein pulling graha (Surya, Mangal, Guru) ko bal, doosre mein streeling (Chandra, Shukra), teesre mein napunsak (Budh, Shani). Har mile hue graha ko 15 Shashtiamsha.',
      'Vyavharik matlab: **do graha ek hi bhaav aur ek hi rashi mein ho sakte hain par alag Drekkana Bala paa sakte hain**, kyunki unki degree alag hai. Ye chhoti baat lagti hai par kareeb ke aankdon mein faisla karti hai.',
    ],
  },
  {
    id: 'yuddha-bala',
    h2: 'Graha Yuddha — jab do graha bhid jaate hain',
    paras: [
      'Ye ek vishesh sthiti hai jo Shadbala ke aakhir mein lagti hai aur bahut kam calculator ise dikhate hain.',
      '**Graha Yuddha (planetary war)** tab maana jaata hai jab do graha ek doosre ke **ek degree ke andar** aa jaayein. Surya aur Chandra isme nahi ginte. Shastra kehta hai jo graha uttar ki taraf ho ya jiska bal zyada ho wo **jeet** jaata hai, aur haarne wale ka bal ghata diya jaata hai.',
      'Ghatane ka tarika bhi tay hai: dono ke Shadbala ka antar nikala jaata hai aur wo jeetne wale mein joda, haarne wale se ghataya jaata hai. Iska asar bada ho sakta hai — **ek graha jo akela balwan dikhta, yuddha ke baad kaafi neeche aa sakta hai.**',
      'Ye sthiti durlabh hai — do graha ka ek degree ke andar aana kabhi-kabhi hi hota hai. Par jab hoti hai to aankda badal deti hai, aur isi liye ise ginana zaroori hai.',
    ],
  },
  {
    id: 'bal-aur-yog',
    h2: 'Bal aur yog — dono ek saath kyun dekhne padte hain',
    paras: [
      'Ye is page ka sabse bada vyavharik sabak hai, aur ise chhod dene se bahut galat nishkarsh nikalte hain.',
      '**Yog batata hai kya ban raha hai; bal batata hai wo ban paayega ya nahi.** Raj Yoga ka hona ek baat hai; use banane wale grahon ka apne minimum se upar hona bilkul doosri. Bahut si kundaliyon mein "Raj Yoga" milta hai aur kuch hota nahi — kyunki yog banane wale graha 0.7 ratio par baithe hain.',
      'Isi ka ulta bhi sach hai: **saamanya dikhne wali kundali mein agar do-teen graha 1.4 se upar hon**, to unke kshetra bina kisi naamdaar yog ke bhi khul jaate hain. Naam wale yog aakarshak lagte hain, par phal bal se aata hai.',
      'Isliye kram ye rakhiye: **pehle yog dekhiye, phir un grahon ka bal.** Yog ke liye [Raj Yoga](/learn/raj-yoga) aur [Vipreet Raj Yoga](/learn/vipreet-raj-yoga), aur bal yahan.',
    ],
  },
  {
    id: 'bal-kitna-hona-chahiye',
    h2: 'Kitna bal "kaafi" hai — ratio ki shreniyan',
    paras: [
      'Ratio ka aankda tabhi kaam ka hai jab pata ho ki kaunsa aankda kis shreni mein aata hai.',
      '**1.50 se upar** — bahut balwan; us graha ke kshetra jeevan ke mazboot pahlu bante hain. **1.20 se 1.50** — achha bal; graha apna phal theek se deta hai. **1.00 se 1.20** — kaam chalau; phal aata hai par sthiti ke saath badalta hai.',
      '**0.85 se 1.00** — thoda kamzor; phal aata hai par prayaas maangta hai. **0.85 se neeche** — kamzor; us kshetra mein bar-bar rukavat mehsoos hoti hai aur upay ka sabse zyada arth wahin banta hai.',
      'Ek zaroori chetavni: **ye shreniyan disha-soochak hain, nirnay nahi.** 0.98 aur 1.02 ke beech koi jaadui rekha nahi hai — wo lagbhag ek hi sthiti hai. Aankde ko range ki tarah padhiye, thermometer ki tarah nahi.',
    ],
  },
  {
    id: 'ek-graha-do-bhaav',
    h2: 'Ek graha, do bhaav — bal ka asar kahan-kahan padta hai',
    paras: [
      'Paanch graha do-do rashiyon ke swami hain, isliye adhikansh grahon ka bal **do bhaavon** par ek saath asar dalta hai. Ye baat table padhte waqt aksar chhoot jaati hai.',
      'Udaharan: **Mesh lagna** mein Mangal lagnesh bhi hai aur aathve bhaav ka swami bhi. Uska ooncha bal dono jagah kaam karega — shareer aur urja mein bhi, aur aathve bhaav ke vishayon mein bhi. **Vrishabh lagna** mein Shukra lagnesh aur chhathe ka swami. Har lagna ke liye ye jodi alag hai.',
      'Iska vyavharik matlab: **kisi graha ka bal "achha" ya "bura" akela nahi hota** — wo is par nirbhar karta hai ki wo aapke lagna ke liye kaunse bhaav chala raha hai. Isi liye ye page bal dikhata hai aur bhaav-swamitva alag se — dono mila kar hi nishkarsh banta hai.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Is aankde ke baad agla kadam',
    paras: [
      'Prashn "kya rok raha hai aur kya karun" ho — [Weak Planet Finder](/calculators/free-weak-planet-finder) uske liye bana hai: kamzor graha, uske kshetra aur classical upay.',
      'Doosre maap dekhne hon — bhaav ka bal [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator), lagna ka bal [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator), poori kundali [Kundali Calculator](/calculators/free-kundali-calculator), aur samay [Dasha Calculator](/calculators/free-dasha-calculator).',
      'Sidhant samajhna ho — [Shadbala](/learn/shadbala-planetary-strength-vedic-astrology), [Planets in Astrology](/learn/planets-in-astrology), [Planetary dignity](/learn/planetary-dignity-exaltation-debilitation), aur Hindi mein [कुंडली में षड्बल और ग्रह बल](/blog/kundali-mein-shadbala-grah-bal-hindi). Yog ke liye [Raj Yoga](/learn/raj-yoga) aur [Vipreet Raj Yoga](/learn/vipreet-raj-yoga).',
    ],
  },
];

type GbLink = { href: string; label: string; note: string };

const HUB_CALC: GbLink[] = [
  { href: '/calculators/free-weak-planet-finder', label: 'Weak Planet Finder', note: 'Nidaan aur upay' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Bhava Bala' },
  { href: '/calculators/free-lagna-bal-calculator', label: 'Lagna Bal Calculator', note: 'Lagnesh ka bal' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Bal kab khulega' },
  { href: '/calculators/free-rashi-calculator', label: 'Rashi Calculator', note: 'Chandra rashi' },
  { href: '/calculators/free-sade-sati-calculator', label: 'Sade Sati Calculator', note: 'Gochar, janm bal nahi' },
  { href: '/calculators/free-gemstone-suitability-calculator', label: 'Gemstone Suitability', note: 'Ratna se pehle jaanch' },
  { href: '/calculators/free-nakshatra-calculator', label: 'Nakshatra Calculator', note: 'Nakshatra aur pada' },
];

const HUB_LEARN: GbLink[] = [
  { href: '/learn/shadbala-planetary-strength-vedic-astrology', label: 'Shadbala — poora sidhant', note: 'Maap ka aadhaar' },
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Har graha ka kaarakattva' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Dignity — uchch aur neech', note: 'Uchcha Bala ka aadhaar' },
  { href: '/learn/mahadasha-explained', label: 'Mahadasha explained', note: 'Bal aur samay' },
  { href: '/learn/raj-yoga', label: 'Raj Yoga', note: 'Bal aur yog ka antar' },
  { href: '/learn/vipreet-raj-yoga', label: 'Vipreet Raj Yoga', note: '6, 8, 12 se banta yog' },
  { href: '/learn/neech-bhang-raj-yoga', label: 'Neech Bhang Raj Yoga', note: 'Neech ka dosh kat jaana' },
  { href: '/learn/how-to-wear-gemstone-vedic', label: 'Ratna pehanne ki vidhi', note: 'Faisle ke baad' },
  { href: '/blog/kundali-mein-shadbala-grah-bal-hindi', label: 'षड्बल और ग्रह बल — हिंदी', note: 'Hindi mein poora lekh' },
];

function GbRich({ text, k }: { text: string; k: string }) {
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

function GbHub({ items }: { items: GbLink[] }) {
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

export default function FreeGrahaBalCalculatorPage() {
  const [form, setForm] = useState<FormData>({
    name: '', gender: '', date: '', time: '12:00', unknownTime: false,
    placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const set = useCallback((key: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  useEffect(() => {
    if (result?.strongestPlanet) setSelectedPlanet(result.strongestPlanet);
  }, [result]);

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
          calcType: 'graha-bal',
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
  const strongest: string | null = result?.strongestPlanet || null;
  const weakest: string | null = result?.weakestPlanet || null;
  const sbMap = shadbalaMap(result?.shadbala);

  const strengthOf = (planet: string): number | null => {
    const p = planets.find((x: any) => x.planet === planet);
    return typeof p?.strength === 'number' ? p.strength : null;
  };

  const ranking = CORE_PLANETS
    .map((p) => ({ planet: p, strength: strengthOf(p) }))
    .filter((r) => r.strength !== null)
    .sort((a, b) => (b.strength as number) - (a.strength as number));

  // Selected planet Shadbala detail (prefer top-level for breakdown)
  const selTop = selectedPlanet ? sbMap[selectedPlanet] : null;
  const selPlanetObj = selectedPlanet ? planets.find((p: any) => p.planet === selectedPlanet) : null;
  const selSb = selPlanetObj?.shadbala ?? null;
  const breakdown: Record<string, number> | null = selTop?.breakdown ?? null;
  const selTotal = selTop?.totalShadbala ?? selSb?.total ?? null;
  const selMin = selTop?.minimumRequired ?? selSb?.minimum ?? null;
  const selRatio = selTop?.strengthRatio ?? selSb?.ratio ?? null;
  const selClass = selTop?.classification ?? selSb?.classification ?? null;
  const selIsStrong = (selTop?.isStrong ?? selSb?.isStrong) ?? null;
  const breakdownMax = breakdown ? Math.max(...Object.values(breakdown).map((v) => Number(v) || 0), 1) : 1;

  // ─── Remedies / Dos (for weakest planet via route v1.7) ─────
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
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-graha-bal-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Graha Bal Calculator — Find Your Strongest & Weakest Planet (Shadbala)',
    description:
      'Find your strongest and weakest planet with full Shadbala 6-fold breakdown (Sthana, Dig, Kala, Cheshta, Naisargika, Drik Bal) and free remedies. Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Graha Bal Calculator',
    aboutEntities: ['Shadbala', 'Sthana Bala', 'Dig Bala', 'Graha Bala', 'Planetary Strength'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Shadbala', 'Planetary Strength Analysis'],
    howToName: 'How to find your strongest and weakest planet using Shadbala',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Calculate Shadbala', text: 'The calculator computes full Shadbala for every planet using Swiss Ephemeris with Lahiri Ayanamsha.' },
      { name: 'Get your result', text: 'See your strongest and weakest planet, all-planet strength ranking and the 6-fold Shadbala breakdown with free remedies.' },
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
            <span style={{ color: GOLD }}>Free Graha Bal Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Graha Bal Calculator — Strongest &amp; Weakest Planet (Shadbala)
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Graha Bal</strong> har planet ki kundali mein shakti hai, jise <strong style={{ color: GOLD }}>Shadbala</strong> (6-fold strength) se naapa jaata hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Graha Bal Calculator</strong> Swiss Ephemeris se aapke strongest aur weakest planet, sabhi grahas ki strength ranking, aur har graha ka poora Sthana–Dig–Kala–Cheshta–Naisargika–Drik breakdown turant deta hai — bilkul free.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Complete Shadbala (Parashar BPHS) · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Check Your Graha Bal (Free)</h2>
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
                {form.unknownTime && <p className="text-slate-500 text-xs mt-1">Solar chart will be used (12:00 noon). Note: Dig & Kala Bal time-based hote hain — accurate result ke liye exact time best hai.</p>}
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
                {loading ? '⟳ Calculating Graha Bal...' : '🪐 Check My Graha Bal'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Complete Shadbala · Parashar BPHS</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* STRONGEST + WEAKEST */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strongest && (
                  <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: `linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid rgba(34,197,94,0.35)` }}>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Strongest Planet 💪</div>
                    <div className="text-3xl md:text-4xl font-serif font-bold mb-1" style={{ color: '#86EFAC' }}>
                      {strongest} <span className="text-xl text-slate-300">({PLANET_HI[strongest]})</span>
                    </div>
                    {strengthOf(strongest) !== null && <div className="text-sm text-slate-300 mb-2">Strength: <span style={{ color: GOLD }} className="font-bold">{strengthOf(strongest)}%</span></div>}
                    <div className="text-xs text-slate-400">{(PLANET_LIFE_AREAS[strongest] ?? []).join(' · ')}</div>
                    <div className="text-[11px] text-slate-500 mt-2 italic">In areas mein aapki natural strength hai.</div>
                  </div>
                )}
                {weakest && (
                  <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: `linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid rgba(239,68,68,0.35)` }}>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Weakest Planet ⚠️</div>
                    <div className="text-3xl md:text-4xl font-serif font-bold mb-1" style={{ color: '#FCA5A5' }}>
                      {weakest} <span className="text-xl text-slate-300">({PLANET_HI[weakest]})</span>
                    </div>
                    {strengthOf(weakest) !== null && <div className="text-sm text-slate-300 mb-2">Strength: <span style={{ color: GOLD }} className="font-bold">{strengthOf(weakest)}%</span></div>}
                    <div className="text-xs text-slate-400">{(PLANET_LIFE_AREAS[weakest] ?? []).join(' · ')}</div>
                    <div className="text-[11px] text-slate-500 mt-2 italic">In areas par dhyaan aur remedies chahiye.</div>
                  </div>
                )}
              </div>

              {/* RANKING */}
              {ranking.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📊 Planet Strength Ranking</h3>
                  <div className="space-y-3">
                    {ranking.map((r) => {
                      const s = r.strength as number;
                      const barColor = s >= 40 ? '#22c55e' : s >= 25 ? GOLD : '#ef4444';
                      return (
                        <div key={r.planet}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-200 font-medium">{r.planet} ({PLANET_HI[r.planet]})</span>
                            <span className="text-slate-400">{s}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="h-full transition-all duration-700" style={{ width: `${Math.max(3, Math.min(100, s))}%`, background: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SHADBALA BREAKDOWN — interactive */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                <h3 className="text-xl font-serif font-bold mb-1" style={{ color: GOLD }}>🔬 Shadbala Breakdown</h3>
                <p className="text-xs text-slate-400 mb-4">Kisi bhi graha ko select karke uska 6-fold strength breakdown dekhein:</p>

                {/* selector */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {CORE_PLANETS.map((p) => {
                    const active = selectedPlanet === p;
                    return (
                      <button key={p} type="button" onClick={() => setSelectedPlanet(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: active ? GOLD : 'rgba(255,255,255,0.04)', color: active ? '#080B12' : '#cbd5e1', border: `1px solid ${active ? GOLD : 'rgba(255,255,255,0.1)'}` }}>
                        {p}
                      </button>
                    );
                  })}
                </div>

                {selectedPlanet && (
                  <>
                    {/* summary row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      <SbCell label="Total Shadbala" value={selTotal !== null ? `${Number(selTotal).toFixed(1)}` : '—'} />
                      <SbCell label="Minimum Req." value={selMin !== null ? `${Number(selMin).toFixed(0)}` : '—'} />
                      <SbCell label="Ratio" value={selRatio !== null ? `${Number(selRatio).toFixed(2)}×` : '—'} />
                      <SbCell label="Status" value={selIsStrong === null ? (selClass || '—') : (selIsStrong ? 'Strong ✓' : 'Weak')} highlight={selIsStrong} />
                    </div>

                    {/* breakdown bars */}
                    {breakdown ? (
                      <div className="space-y-3">
                        {BALA_ORDER.filter((k) => breakdown[k] !== undefined).map((k) => {
                          const v = Number(breakdown[k]) || 0;
                          return (
                            <div key={k}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300">{BALA_LABELS[k] ?? k}</span>
                                <span className="text-slate-400">{v.toFixed(1)}</span>
                              </div>
                              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <div className="h-full transition-all duration-700" style={{ width: `${Math.max(3, (v / breakdownMax) * 100)}%`, background: `linear-gradient(90deg, ${GOLD} 0%, #FFA500 100%)` }} />
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-[11px] text-slate-500 mt-3">Values Shashtiamsa (Rupas) mein. Sabka yog = Total Shadbala. {selClass ? `Dignity: ${selClass}.` : ''}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Is graha ka detailed breakdown abhi available nahi — summary stats upar dikhaye gaye hain.</p>
                    )}
                  </>
                )}
              </div>

              {/* DOS */}
              {dos.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos — {weakest} (Weakest) Ko Strong Karne Ke Liye</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dos.map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                  </ul>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>🪔 3 Free Remedies — Weakest Planet Ke Liye</h3>
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
                    <GbRich text={p} k={`s${si}-p${pi}`} />
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Full 6-Bala Breakdown</td><td className="p-3" style={{ color: GOLD }}>✓ Interactive</td><td className="p-3 text-slate-500">✗ / paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Total vs Minimum + Ratio</td><td className="p-3" style={{ color: GOLD }}>✓ Shown</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Strongest + Weakest</td><td className="p-3" style={{ color: GOLD }}>✓ Both</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Personalized</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── v2.0: the strength cluster, split by question ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Bal ke aage — baaki free calculators aur guide</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Ye page maap ka hai. Nidaan aur upay ke liye Weak Planet Finder, bhaav ke bal ke liye Kundali Strength Calculator. Sab free.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Aur bhi free calculators</h3>
                <GbHub items={HUB_CALC} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Sidhant samjhiye</h3>
                <GbHub items={HUB_LEARN} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Graha Bal Calculator</h2>
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
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
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

function SbCell({ label, value, highlight }: { label: string; value: any; highlight?: boolean | null }) {
  const color = highlight === true ? '#86EFAC' : highlight === false ? '#FCA5A5' : GOLD;
  return (
    <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-[11px] text-slate-400 mb-1">{label}</div>
      <div className="font-bold text-sm" style={{ color }}>{value}</div>
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
