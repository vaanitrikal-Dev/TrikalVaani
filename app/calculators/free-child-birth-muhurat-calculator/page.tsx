'use client';

// ============================================================
// File: app/calculators/free-child-birth-muhurat-calculator/page.tsx
// Version: v1.6 (29 Aug 2026) — INTERNATIONAL PAYMENT
//   Visitors outside India pay through PayPal ($12 report / $15 with remedies)
//   because Razorpay on this account rejects foreign cards. PayPal's order is
//   created by /api/create-muhurat-order rather than the generic endpoint,
//   since that route stores the chosen muhurat slot which verify reads back.
//   Everything after payment now lives in finishAfterPayment(), shared by both
//   paths, so a dollar buyer's report is computed from the same slot as a
//   rupee buyer's. handleBuyReport and its Razorpay call are unchanged.
// Version: v1.5 — full_day OFF on main scan (timeout fix) + v1.4 time-parse fix
// VM endpoint: /muhurat-finder (free) | paid via /api/create-muhurat-order
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.5 (2026-06-24) — PERF/BUGFIX: the main muhurat scan no longer
//        requests full_day. The VM was scanning the chosen window PLUS a
//        full 24h (~144 extra slots) on every submit, just to populate the
//        collapsed "whole day" educational block — ~7x heavier, which
//        intermittently exceeded the 45s timeout ("Calculation timed
//        out"). Window-only scan now. The educational block won't render
//        until we wire it as a lazy on-open second call. (Builds on v1.4.)
//   v1.4 (2026-06-24) — BUGFIX (paid flow): the chosen muhurat time was
//        parsed via best.time.split(':') + parseInt, which silently
//        dropped the AM/PM suffix. The VM returns a 12-hour string
//        ("9:30 AM" / "2:35 PM"), so every PM muhurat was sent to the
//        paid report API as its AM equivalent (2:35 PM -> hour 2 = 02:35).
//        Added parseTimeTo24h() which correctly converts BOTH 12-hour
//        ("h:mm AM/PM") and 24-hour ("HH:mm") strings to 24-hour numbers.
//        Only the paid-order time parse changed; no UI/payment/free-calc
//        logic touched.
//   v1.3 (2026-06-02) — Replaced standalone 1-node FAQPage script with
//        buildCalcJsonLd() helper (8 @id-linked nodes: Organization+real
//        sameAs, WebSite, linkable Person /founder, WebPage isPartOf
//        #website, BreadcrumbList, WebApplication price 0, HowTo,
//        FAQPage). Added `.tv-aeo-answer` class to above-fold answer for
//        speakable. Brand fix: visible/schema brand normalised to the
//        double-a spelling (incl. Razorpay checkout display name); legal
//        single-a kept inside helper only. No payment/logic/UI change.
//   v1.2 — Added post-payment progress wait-screen (anti-anxiety UX).
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay-helper';
import PayPalCheckout from '@/components/payment/PayPalCheckout';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';

const GOLD = '#D4AF37';
// ── v2.0 (05 Sep 2026) — see the SECTIONS block below for where every H2 came from.
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface PlaceSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
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
        body: JSON.stringify({ input: query, languageCode: 'en' }),
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

function PlaceInput({ id, placeholder, onSelect, error }: {
  id: string; placeholder: string;
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        <input id={id} type="search" autoComplete="off" placeholder={placeholder}
          value={query} onChange={e => handleChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-10"
          style={{ background: '#0d1120', border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          {loading ? <span style={{ color: GOLD }}>⟳</span> : selected ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#475569' }}>🏥</span>}
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

// ─── Robust 12h / 24h time parser ─────────────────────────────
// The VM returns the display time as a 12-hour string e.g. "9:30 AM"
// or "2:35 PM". Splitting on ":" and parseInt() silently dropped the
// AM/PM, so every PM muhurat was sent to the paid report as its AM
// twin. This converts BOTH "h:mm AM/PM" and 24-hour "HH:mm" strings
// to correct 24-hour numbers (handles 12 AM -> 0 and 12 PM -> 12).
function parseTimeTo24h(timeStr: string | undefined | null): { hour: number; minute: number } {
  const m = (timeStr || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return { hour: 0, minute: 0 };
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const ampm = (m[3] || '').toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
}

const FAQS = [
  { q: 'C-section ke liye shubh muhurat kaise nikalta hai?', a: 'C-section ya planned delivery ka muhurat aapke doctor dwara di gayi safe time window ke ANDAR nikala jaata hai. Trikaal Vaani har 10 minute ka Lagna, Nakshatra, Tithi, Yoga, aur 8th house check karke sabse auspicious slot batata hai — sirf us window mein jo doctor ne approve ki hai. Medical safety pehle, muhurat uske andar.' },
  { q: 'Kya yeh tool doctor ki advice replace karta hai?', a: 'Bilkul nahi. Delivery date aur safe time window 100% aapke doctor decide karte hain — maa aur bachche ki health ke according. Yeh tool sirf us approved window ke andar sabse shubh moment dhoondta hai. Yeh medical advice nahi hai.' },
  { q: 'Best nakshatra for baby birth kaunse hain?', a: 'Classical Jyotish ke according Pushya, Rohini, Hasta, Anuradha, aur Swati nakshatra child birth ke liye sabse auspicious mane jaate hain. Trikaal Vaani in sabhi ko score karta hai aur strong Lagna lord + clean 8th house ko bhi check karta hai.' },
  { q: 'Naamakshar (lucky name letter) kya hota hai?', a: 'Jis nakshatra aur pada mein bachcha paida hota hai, uske according ek shubh starting syllable (Naamakshar) milta hai — jaise "Cho", "La", "Mi". Iss syllable se shuru hone wala naam bachche ke liye auspicious mana jaata hai. Paid report mein hum boy + girl naam suggestions bhi dete hain.' },
  { q: 'Kya yeh IVF delivery ke liye bhi kaam karta hai?', a: 'Haan. Chahe C-section ho ya IVF embryo transfer/planned delivery — jab bhi date aur time pehle se decide ho sakti ho, yeh tool us window mein sabse shubh moment batata hai.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + Lahiri Ayanamsha use karta hai, aur master-grade Muhurta logic se 9 factors check karta hai: Lagna nakshatra, Lagna lord ka house + dignity, 8th house affliction, kendra/trikona benefics, Moon strength, Yoga, Tithi, Karana, aur Rahu Kaal. Yeh wahi method hai jo experienced astrologers use karte hain.' },
  { q: 'Is Rohini nakshatra good for birth?', a: 'Haan, Rohini ko shreshth nakshatron mein gina jaata hai. Uska swami Chandra hai aur devta Brahma, aur classical granthon mein ise saundarya, samriddhi aur sthirta se joda gaya hai. Ye Gandmool nakshatra nahi hai, isliye koi shanti-vidhi ki avashyakta nahi hoti. Par yaad rahe — akela nakshatra achha hona kaafi nahi. Us samay ka Lagna, Lagna swami ki sthiti aur aathva bhaav bhi dekhe jaate hain.' },
  { q: 'Is Anuradha nakshatra good for child birth?', a: 'Haan. Anuradha ka swami Shani hai aur devta Mitra — mitrata, nishtha aur sangathan-kshamata ka nakshatra. Sadhana aur dheeraj ke liye ise bahut shubh maana gaya hai, aur ye Gandmool bhi nahi hai. Anuradha mein janme bachche ke liye naamakshar Na, Ni, Nu, Ne mein se aata hai, pada ke anusaar.' },
  { q: 'Best tithi for child birth kaunsi hai?', a: 'Shubh maani jaane wali tithiyan hain Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, Trayodashi aur Purnima. Bachni chahiye — Chaturthi, Navami aur Chaturdashi, jinhe Rikta tithi kehte hain, aur Amavasya. Par tithi nau kaarkon mein se sirf ek hai; akeli tithi par faisla nahi hota.' },
  { q: 'Abhijit muhurat kya hai aur kya delivery ke liye theek hai?', a: 'Abhijit sthaniya dopahar ke aas-paas ka lagbhag 48-minute ka samay hai — din ka aathvaan muhurat. Ise lagbhag har shubh kaary ke liye anukool maana jaata hai. Par Budhwar ko Abhijit ko chhod dene ka niyam hai. Agar aapki doctor-window mein Abhijit aata hai to calculator use uchit sthaan par gin leta hai.' },
  { q: 'Gandmool nakshatra kya hota hai?', a: 'Chhe nakshatra Gandmool kehlate hain — Ashwini, Ashlesha, Magha, Jyeshtha, Mula aur Revati. Inme janm hone par 27 din baad Mool Shanti vidhi ki paramapara hai. Ye ashubh janm nahi hai — bahut se safal log Gandmool mein paida hue hain. Ye sirf ek vidhi ka sanket hai, koi shrap nahi. Calculator inhe alag se flag karta hai taaki aap jaan sakein.' },
  { q: 'Muhurat mil gaya par doctor ne date badal di — ab kya?', a: 'Doctor ki baat hi antim hai. Nayi date daal kar calculator dobara chala lijiye — wo us nayi window ke andar ka sabse achha samay nikaal dega. Muhurat ke liye medical salah ke khilaf jaana Jyotish mein bhi galat maana gaya hai, kyunki maa aur bachche ki suraksha se bada koi yog nahi hota.' },
  { q: 'Kitne bacche honge — ye calculator wo bata sakta hai?', a: 'Nahi, ye alag prashn hai aur alag chart maangta hai. Ye calculator ek nishchit window mein sabse shubh samay dhoondhta hai. Santan-sankhya ke liye panchma bhaav, Saptamsa D-7 aur Guru dekhe jaate hain — uske liye alag page hai.' },
  { q: 'Kya ye tool sirf C-section ke liye hai?', a: 'Nahi. Ye kisi bhi planned delivery ke liye kaam karta hai — C-section, induction, ya IVF ke baad ki scheduled delivery. Shart ek hi hai: aapke paas doctor ki di hui ek samay-window honi chahiye, jiske andar chunav sambhav ho. Natural labour mein samay aapke haath mein nahi hota, isliye wahan ye lagu nahi.' },
];

interface SlotData {
  score: number;
  time: string;
  lagna_sign: string;
  lagna_lord: string;
  lagna_lord_house: number;
  lagna_lord_dignity: string;
  lagna_nakshatra: string;
  naamakshar: string;
  moon_nakshatra: string;
  tithi: string;
  yoga: string;
  karana: string;
  eighth_house_malefics: string[];
  reasons: string[];
  cautions: string[];
}


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE BEFORE THIS BUILD (Radar E2 + GSC, both 05 Sep 2026)
//   888 words · 4 H2 · 21 internal links.
//   GSC 3 months to 4 Sep 2026: 632 impressions, 52 clicks, CTR 8.23%,
//   average position 6.76 — the strongest of the thirteen thin calculators.
//   Position was never the problem here; there was simply almost no page.
//
// WHERE THE H2s COME FROM — Google Search Console, same window
//   is rohini nakshatra good for birth ......... 107 impressions, pos 4.2, 0 clicks
//   is anuradha nakshatra good for child birth .. 82, pos 2.7
//   rohini nakshatra for baby birth ............. 30, pos 2.3
//   is anuradha nakshatra good for birth ........ 30, pos 3.1
//   best tithi for child birth .................. 17, pos 4.6
//   child birth prediction calculator astrology . 14, pos 9.2
//   best date for baby birth .................... 13, pos 8.1
//   rohini nakshatra for child birth ............ 12, pos 2.4
//   anuradha nakshatra is good for baby birth ... 12, pos 3.4
//   c section delivery shubh muhurat ............. 8, pos 7.0
//   shubh nakshatra for baby birth ............... 8, pos 7.9
//   most auspicious time today for baby birth .... 7, pos 5.4
//   shubh muhurat for child birth tomorrow ....... 6, pos 1.0
//   good time for baby delivery tomorrow ......... 5, pos 4.4
//   abhijit muhurat .............................. 5, pos 1.6
//
//   The nakshatra-quality questions are the loudest signal on the page and the
//   worst served: "is rohini nakshatra good for birth" sat at position 4.2 for
//   107 impressions and earned ZERO clicks, because nothing on this page
//   answered it. Sections 12-17 answer each one directly, in its own H2.
//
// SAFETY POSITION — non-negotiable, and it runs through the whole page
//   This is a medical subject. Every section that touches scheduling repeats
//   the same line: the doctor's window comes first, the muhurat is chosen only
//   INSIDE it, and no chart is a reason to argue with medical advice. A page
//   that nudged a family to move a delivery for astrological reasons would be
//   dangerous, whatever it did for the ranking.
//
// UNCHANGED — do not "tidy" these
//   The form, /api/calc/muhurat, /api/create-muhurat-order,
//   /api/verify-muhurat-payment, the paid flow, REPORT_STEPS, buildCalcJsonLd
//   and the comparison table. Only words, links and FAQs changed.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type MuhuratSection = { id: string; h2: string; paras: string[] };

const SECTIONS: MuhuratSection[] = [
  {
    id: 'kaise-kaam-karta-hai',
    h2: 'Child Birth Muhurat Calculator — kaam kaise karta hai',
    paras: [
      'Aap teen cheezein dete hain — **delivery ki date, doctor ki di hui samay-window, aur shahar**. Calculator us window ke andar har sambhav samay ka poora chart banata hai aur unhe score deta hai. Aapko sabse achha slot milta hai, uske saath ye bhi ki wo kyun achha hai.',
      'Har slot par nau cheezein naapi jaati hain: **Lagna aur uska swami**, **Lagna Nakshatra**, **Chandra Nakshatra**, **Tithi**, **Vaar**, **Yoga**, **Karana**, **aathve bhaav ki sthiti**, aur **Gandmool** ka flag. Iske saath us slot ka **naamakshar** bhi nikal aata hai — bachche ke naam ka shubh pehla akshar.',
      'Ganana **Swiss Ephemeris** aur **Lahiri Ayanamsha** par hoti hai — wahi library jo peshevar software use karte hain. Shahar isliye zaroori hai kyunki Lagna sthaan ke saath badalta hai: Delhi aur Chennai mein ek hi samay par Lagna alag ho sakta hai.',
    ],
  },
  {
    id: 'doctor-pehle',
    h2: 'Sabse pehle — doctor ki window, phir muhurat',
    paras: [
      'Ye baat is poore page par sabse zaroori hai, isliye shuru mein hi likhi hai. **Delivery ki date aur surakshit samay sirf aapke doctor tay karte hain.** Ye calculator us faisle mein koi bhoomika nahi rakhta.',
      'Iska kaam sirf itna hai: **jo window doctor pehle hi de chuke hain, uske andar** sabse anukool samay dhoondhna. Agar doctor kehte hain subah 9 se dopahar 1 ke beech, to calculator un char ghanton ke andar hi dekhta hai — ek minute bahar nahi.',
      'Aur ek baat saaf: **muhurat ke liye medical salah ke khilaf jaana Jyotish mein bhi galat maana gaya hai.** Shastra ka apna niyam hai ki jeevan-raksha sabse upar hai. Agar koi jyotishi kahe ki delivery aage-peeche karwa lijiye kisi yog ke liye, to wo salah shastra-sammat nahi hai. Ye antar [Doctor ki safe window vs Muhurat](/blog/doctor-safe-window-vs-child-birth-muhurat) mein vistaar se rakha gaya hai.',
    ],
  },
  {
    id: 'muhurat-tomorrow',
    h2: 'Shubh Muhurat for Child Birth Tomorrow — kal ki delivery ke liye',
    paras: [
      'Bahut se log ye page delivery se ek din pehle khol rahe hote hain, aur unke paas padhne ka waqt nahi hota. Unke liye seedha tarika: **kal ki date daalein, doctor ki batayi window daalein, shahar daalein, chala dein.** Result kuch hi second mein aa jaata hai.',
      'Result mein sabse upar sabse achha slot hota hai, uske neeche **kyun** — kaunsa Lagna, uska swami kis bhaav mein, nakshatra kaunsa, aathva bhaav saaf hai ya nahi. Neeche do-teen aur slot bhi milte hain, taaki agar pehla slot doctor ke liye vyavharik na ho to doosra vikalp saamne ho.',
      'Ek chhoti par kaam ki baat: **result print ya screenshot kar ke rakh lein.** Hospital mein network aksar kamzor hota hai, aur us waqt page dobara khulne ka intezaar karna theek nahi. Jaldi mein padhne ke liye [Last-minute quick check](/blog/child-birth-muhurat-last-minute-quick-check) chhota page hai.',
    ],
  },
  {
    id: 'auspicious-today',
    h2: 'Most Auspicious Time Today for Baby Birth — aaj ke liye',
    paras: [
      'Aaj hi ki delivery ke liye tarika wahi hai — aaj ki date aur doctor ki window. Par ek baat samajh lena zaroori hai: **"aaj ka sabse shubh samay" har shahar aur har din alag hota hai.** Koi ek fixed samay nahi hota jo sabke liye achha ho.',
      'Iski wajah Lagna hai. Lagna lagbhag har do ghante mein badalta hai, aur uske saath saare bhaav ghoom jaate hain. Isliye jo samay ek din shubh tha wo agle din usi shahar mein saamanya ho sakta hai — kyunki us din tithi, nakshatra aur vaar sab badal chuke hote hain.',
      'Isi wajah se ye page koi "aaj ka shubh samay" ki tayyar list nahi dikhata. Aisi list jo har kisi ke liye ek hi ho, wo aapke doctor ki window se koi lena-dena nahi rakhti — aur wahi to asli seema hai.',
    ],
  },
  {
    id: 'c-section-muhurat',
    h2: 'C-Section Delivery Shubh Muhurat',
    paras: [
      'Planned C-section wo sthiti hai jahan muhurat ka sabse zyada arth banta hai, kyunki yahan samay sach mein chuna ja sakta hai — doctor ki di hui seema ke andar.',
      'Yahan do cheezein sabse bhaari padti hain. **Lagna aur uska swami** — Lagna bachche ka shareer, swabhav aur jeevan-disha darshata hai, aur uska swami kendra ya trikona mein ho to bal milta hai. **Aathva bhaav** — us samay aathve bhaav mein koi kroor graha na ho, ye classical dhyan ki baat hai. Calculator dono ko alag-alag ginta hai aur reason mein likhta hai.',
      'Aur ek vyavharik baat: **operation ka nishchit samay minute-bhar sateek nahi hota.** Doctor ka scheduled samay aage-peeche hota hai. Isliye calculator ek band (band-width) deta hai, ek minute nahi — taaki thodi der-sawer se poora chunav bekaar na ho jaaye. Vistaar se [Best muhurat for C-section](/blog/best-muhurat-for-c-section) aur Hindi mein [सी-सेक्शन का शुभ मुहूर्त](/blog/best-muhurat-for-c-section-hindi) mein.',
    ],
  },
  {
    id: 'normal-vs-csection',
    h2: 'Normal Delivery aur C-Section — muhurat mein kya farak hai',
    paras: [
      'Farak seedha hai: **normal delivery mein samay aapke haath mein nahi hota.** Labour apne samay par shuru hoti hai, isliye wahan muhurat chunne ka prashn hi nahi uthta.',
      'Aise mein ye page kis kaam ka hai? Do tarah se. Ek, agar doctor ne **induction** ki salah di hai to samay ek hadd tak chuna ja sakta hai. Do, janm ho jaane ke **baad** aap sateek samay daal kar dekh sakte hain ki bachche ka Lagna, nakshatra aur naamakshar kya bana — jo naamkaran ke liye seedha kaam aata hai.',
      'Aur wo baat jo shastra mein bhi hai aur jise log bhool jaate hain: **jo samay prakriti ne chuna, wo bhi ek muhurat hi hai.** Natural delivery ke samay ko kamtar maanna kahin nahi likha. Dono ka antar [Normal delivery vs C-section muhurat](/blog/normal-delivery-vs-c-section-muhurat) mein rakha gaya hai.',
    ],
  },
  {
    id: 'ivf-muhurat',
    h2: 'IVF Delivery Muhurat — aur embryo transfer ka samay',
    paras: [
      'IVF ke baad ki planned delivery ke liye tarika bilkul wahi hai jo C-section ka hai — doctor ki window, uske andar sabse achha slot. Koi alag niyam nahi.',
      'Par IVF ke saath ek doosra prashn bhi aata hai: **embryo transfer ka samay.** Ye alag cheez hai aur alag tarah se dekhi jaati hai — wahan panchma bhaav, Guru ki sthiti aur maa ke chart ki chal rahi dasha zyada mayne rakhti hai, kyunki prashn "janm kab" nahi balki "sthapana kab" hai.',
      'Imandari se ek seema bhi bata deni chahiye: **IVF ki safalta chikitsiya kaarnon par nirbhar hai** — embryo ki gunvatta, hormonal sthiti, chikitsak ka anubhav. Muhurat inme se kisi ko nahi badalta. Jo dava aur samay dono ka wada kare, wo dar bech raha hai. Poora vishleshan [IVF delivery muhurat guide](/blog/ivf-delivery-muhurat-guide) mein.',
    ],
  },
  {
    id: 'nau-kaarak',
    h2: 'Nau kaarak — muhurat kis-kis cheez par tikta hai',
    paras: [
      'Ek muhurat ek cheez se nahi banta. Nau alag kaarak dekhe jaate hain, aur inme aapas mein tolmol hota hai — koi slot nakshatra mein shreshth ho sakta hai par Lagna mein kamzor.',
      '**(1) Lagna** — bachche ka shareer aur jeevan-disha. **(2) Lagna ka swami** — uska bhaav aur dignity. **(3) Lagna Nakshatra**. **(4) Chandra Nakshatra** — jisse naamakshar bhi nikalta hai. **(5) Tithi**. **(6) Vaar**. **(7) Yoga**. **(8) Karana**. **(9) Aathva bhaav** — usme koi kroor graha to nahi.',
      'Inke alawa **Rahu Kaal, Yamaganda, Gulika aur Bhadra** ko alag se dekha jaata hai — ye "achha kitna hai" nahi balki "bachna chahiye ya nahi" waale khaane mein aate hain. Har kaarak alag se [9 factors explained](/blog/child-birth-muhurat-9-factors-explained) mein khola gaya hai, Hindi mein [9 कारक](/blog/child-birth-muhurat-9-factors-explained-hindi).',
    ],
  },
  {
    id: 'lagna-aur-swami',
    h2: 'Lagna aur Lagna ka swami — sabse bhaari kaarak',
    paras: [
      'Nau kaarkon mein sabse zyada vazan Lagna par hai, aur iski wajah saaf hai: **Lagna bachche ki janm-kundali ka aadhaar ban jaata hai.** Nakshatra aur tithi din bhar mein ek-do baar badalte hain; Lagna har do ghante mein badalta hai, aur uske saath poora chart ghoom jaata hai.',
      'Do baatein dekhi jaati hain. **Lagna swayam** — sthir rashi (Vrishabh, Simha, Vrishchik, Kumbh) sthirta ke liye anukool maani jaati hain, aur ye chunav bachche ke swabhav se juda hai. **Lagna ka swami** — wo kis bhaav mein hai aur kis dignity mein. Kendra (1, 4, 7, 10) ya trikona (1, 5, 9) mein ho to bal, aur uchch ya swarashi ho to aur bhi.',
      'Jo bachna chahiye: **Lagna swami ka aathve ya barahve bhaav mein hona**, ya uska nichch hona. Calculator har slot ke liye ye sthiti alag se likhta hai — sirf "achha/bura" nahi, balki kaunsa graha kahan hai.',
    ],
  },
  {
    id: 'shubh-nakshatra',
    h2: 'Shubh Nakshatra for Baby Birth — poori soochi',
    paras: [
      'Classical granthon mein janm ke liye anukool maane gaye nakshatra ye hain: **Rohini, Mrigashira, Pushya, Punarvasu, Uttara Phalguni, Hasta, Chitra, Swati, Anuradha, Uttara Ashadha, Shravana, Dhanishtha, Uttara Bhadrapada aur Revati.**',
      'Inme se **Pushya** ko prayah sarvashreshth kaha jaata hai, aur **Rohini, Hasta aur Anuradha** uske turant baad aate hain. Har nakshatra ka apna swami graha aur devta hota hai, aur wahi uske gun tay karta hai — Pushya ka swami Shani aur devta Brihaspati, Rohini ka swami Chandra aur devta Brahma.',
      'Ek zaroori chetavni jo aksar nahi di jaati: **akela shubh nakshatra kaafi nahi hai.** Shubh nakshatra mein bhi agar Lagna ka swami nichch ho aur aathve bhaav mein Mangal baitha ho, to slot achha nahi rehta. Isi liye calculator nau kaarak ginta hai, ek nahi.',
    ],
  },
  {
    id: 'rohini-nakshatra',
    h2: 'Is Rohini Nakshatra Good for Birth?',
    paras: [
      'Haan — **Rohini ko janm ke liye shreshth nakshatron mein gina jaata hai**, aur ye is prashn ka seedha uttar hai.',
      'Uska swami **Chandra** hai aur devta **Brahma**. Classical granth ise saundarya, samriddhi, srijan aur sthirta se jodte hain. Ye **Gandmool nahi** hai, isliye Mool Shanti jaisi koi vidhi is nakshatra ke liye nahi kehni padti. Vrishabh rashi mein padne ke kaaran Chandra yahan uchch ke aas-paas hota hai, jo ise aur bal deta hai — aur yahi wajah hai ki Krishna janm ka nakshatra Rohini hai.',
      'Par wahi seema yahan bhi lagu hai: **Rohini hone se slot apne aap achha nahi ho jaata.** Us samay ka Lagna, uske swami ki sthiti aur aathva bhaav bhi dekhne padte hain. Calculator ye teeno alag se ginta hai. Nakshatra-wise vistaar [Rohini nakshatra baby birth](/blog/rohini-nakshatra-baby-birth) aur Hindi mein [रोहिणी नक्षत्र](/blog/rohini-nakshatra-baby-birth-hindi) mein.',
    ],
  },
  {
    id: 'anuradha-nakshatra',
    h2: 'Is Anuradha Nakshatra Good for Child Birth?',
    paras: [
      'Haan, **Anuradha bhi anukool nakshatron mein aata hai** — aur ye Rohini se thoda alag prakriti ka hai.',
      'Uska swami **Shani** hai aur devta **Mitra**. Isliye ise mitrata, nishtha, sangathan-kshamata aur lambe samay tak tik kar kaam karne se joda jaata hai. Shani ke prabhav ke kaaran yahan phal thoda der se aata hai par sthir rehta hai — jo bachche ke swabhav mein dheeraj ke roop mein dekha jaata hai. Ye bhi **Gandmool nahi** hai.',
      'Anuradha mein janme bachche ka **naamakshar Na, Ni, Nu, Ne** mein se ek hota hai, pada ke anusaar. Calculator batata hai ki kaunsa pada chal raha hai aur usse kaunsa akshar banta hai. Vistaar se [Anuradha nakshatra baby birth](/blog/anuradha-nakshatra-baby-birth), Hindi mein [अनुराधा नक्षत्र](/blog/anuradha-nakshatra-baby-birth-hindi).',
    ],
  },
  {
    id: 'pushya-nakshatra',
    h2: 'Pushya Nakshatra — sabse shubh maana jaane wala',
    paras: [
      'Pushya ko granthon mein **nakshatron ka raja** kaha gaya hai, aur bachche ke janm ke liye ise prayah sabse upar rakha jaata hai.',
      'Swami **Shani**, devta **Brihaspati** — Shani ka anushasan aur Guru ka gyaan, dono ek saath. Karka rashi mein padne ke kaaran isme paalan-poshan ka bhaav bhi jud jaata hai. Yahi karan hai ki Pushya ko poshan, vidya aur samriddhi se joda jaata hai, aur isi liye kharidari se lekar naye kaam tak har cheez ke liye ise chuna jaata hai.',
      'Ek vyavharik baat: **Pushya har 27 din mein ek baar hi aata hai** aur lagbhag ek din chalta hai. Aapki doctor-window mein wo aa hi jaaye, aisa zaroori nahi — aur na aana koi kami nahi hai. Uplabdh window mein jo sabse achha hai wahi sahi chunav hai. Aur padhein [Pushya nakshatra baby birth](/blog/pushya-nakshatra-baby-birth).',
    ],
  },
  {
    id: 'hasta-revati',
    h2: 'Hasta aur Revati Nakshatra — dono anukool, par Revati mein ek shart',
    paras: [
      '**Hasta** ka swami Chandra hai aur devta Savitar (Surya ka ek roop). Ise kaushal, hasth-kaushal aur kaary-kushalta se joda jaata hai — haath se kiye jaane wale nipun kaam iska kshetra hai. Ye Gandmool nahi hai aur janm ke liye poori tarah anukool maana gaya hai. Vistaar [Hasta nakshatra baby birth](/blog/hasta-nakshatra-baby-birth) mein.',
      '**Revati** apne gun mein bahut shubh hai — swami Budh, devta Pushan, aur ise poornata, daya aur suraksha se joda jaata hai. Ye 27 nakshatron mein antim hai, isliye ise ek chakra ke poora hone ka sanket bhi maana jaata hai.',
      'Par Revati ke saath ek shart hai: **ye Gandmool nakshatra hai.** Iska matlab ashubh nahi — iska matlab itna hai ki paramapara ke anusaar 27 din baad Mool Shanti vidhi ki jaati hai. Calculator ise flag kar deta hai taaki aap pehle se jaan lein aur baad mein koi aapko chaunka na sake. Aur padhein [Revati nakshatra baby birth](/blog/revati-nakshatra-baby-birth).',
    ],
  },
  {
    id: 'gandmool',
    h2: 'Gandmool Nakshatra — ye shrap nahi, ek vidhi ka sanket hai',
    paras: [
      'Chhe nakshatra Gandmool kehlate hain: **Ashwini, Ashlesha, Magha, Jyeshtha, Mula aur Revati.** Ye wo nakshatra hain jo rashi ki sandhi par padte hain — jahan ek rashi khatm hoti hai aur doosri shuru hoti hai.',
      'Paramapara ke anusaar Gandmool mein janm hone par **27 din baad Mool Shanti** ki vidhi ki jaati hai. Bas itni si baat hai. Par is baat ko is tarah bech diya jaata hai jaise koi aapda aa gayi ho — aur bahut se parivaar isi dar mein mehnge upay kharid lete hain.',
      'Saaf baat: **Gandmool ashubh janm nahi hai.** Bahut se safal aur sukhi log in nakshatron mein paida hue hain, aur Revati to swayam shubh nakshatron ki soochi mein bhi hai. Calculator ise isliye flag karta hai taaki aap **jaan** sakein aur chaho to vidhi kara lein — na ki isliye ki aap ghabra jaayein. Hamare paas is baat par koi paid upay nahi becha jaata.',
    ],
  },
  {
    id: 'best-tithi',
    h2: 'Best Tithi for Child Birth',
    paras: [
      'Tithi chandra-din hai — Surya aur Chandra ke beech ke kon se banti hai, aur ek chandra maas mein 30 tithiyan hoti hain.',
      'Janm ke liye **anukool tithiyan**: Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, Trayodashi aur Purnima. **Bachne yogya**: Chaturthi, Navami aur Chaturdashi — inhe **Rikta tithi** kehte hain aur naye kaam ke liye ye tali jaati hain. Amavasya ko bhi prayah chhod diya jaata hai.',
      'Par yahan bhi wahi tolmol hai. Tithi nau kaarkon mein se **ek** hai. Rikta tithi par bhi agar Lagna mazboot ho, Lagna swami kendra mein ho aur nakshatra shubh ho, to slot kul milakar achha ho sakta hai. Calculator har kaarak alag dikhata hai — isiliye ki aap ye tolmol khud dekh sakein, sirf ek "haan/na" na milе.',
    ],
  },
  {
    id: 'vaar-yoga-karana',
    h2: 'Vaar, Yoga aur Karana — teen kam charchit kaarak',
    paras: [
      '**Vaar** yaani saptah ka din. Somwar, Budhwar, Guruwar aur Shukrawar ko saumya (kalyankari) maana jaata hai; Mangalwar aur Shanivar ko kroor. Ravivar beech mein aata hai — kuch kaamon ke liye theek, kuch ke liye nahi. Ye vibhajan grahon ke swabhav se aata hai, kisi anddhvishwas se nahi.',
      '**Yoga** — Surya aur Chandra ke sanyukt bhog se bante 27 yog. Inme se **Vyatipata, Vaidhriti, Parigha, Vyaghata, Vajra, Shoola, Ganda aur Atiganda** ko ashubh maana gaya hai. Baaki anukool ya tatasth hain.',
      '**Karana** — aadhi tithi. Gyarah karana hote hain, jinme char sthir hain: Shakuni, Chatushpada, Naga aur Kimstughna. Inme se pehle teen ko shubh kaamon ke liye tala jaata hai. Ye teeno kaarak apne aap mein nirnayak nahi hain, par jab do-teen slot barabar lag rahe hon to yahi antar tay karte hain.',
    ],
  },
  {
    id: 'abhijit',
    h2: 'Abhijit Muhurat — din ka sabse anukool samay',
    paras: [
      'Din ko pandrah barabar bhaagon mein baanta jaata hai; unme se **aathvaan bhaag Abhijit** kehlata hai. Ye sthaniya madhyanh (local noon) ke aas-paas aata hai aur lagbhag **48 minute** ka hota hai.',
      'Abhijit ki khaas baat ye hai ki ise **lagbhag har shubh kaary ke liye anukool** maana jaata hai — yahan tak ki jab baaki kaarak kamzor hon tab bhi. Isliye jab aapki doctor-window mein Abhijit aa raha ho, to wo slot swabhavik roop se upar aa jaata hai.',
      'Do baatein dhyan mein: **Budhwar ko Abhijit ko chhod dene ka niyam** hai, aur Abhijit ka samay **har shahar aur har din alag** hota hai kyunki wo sthaniya sooryodaya-sooryast par tikta hai — isiliye calculator shahar maangta hai. Koi ek fixed "12 baje ka Abhijit" nahi hota.',
    ],
  },
  {
    id: 'rahu-kaal-bhadra',
    h2: 'Rahu Kaal, Yamaganda, Gulika aur Bhadra — kya sach mein bachna chahiye',
    paras: [
      'Ye char alag khaane mein aate hain — inhe "kitna achha" nahi balki "talna chahiye ya nahi" ke roop mein dekha jaata hai.',
      '**Rahu Kaal** har din ka lagbhag 90-minute ka ek hissa hai jo din ke anusaar badalta hai. **Yamaganda** aur **Gulika** isi tarah ke aur khand hain. **Bhadra (Vishti Karana)** ek karana hai jise shubh kaamon ke liye tala jaata hai — aur uska niyam thoda sookshm hai, kyunki Bhadra ka nivas swarg, patal ya prithvi mein hone se uska prabhav badal jaata hai.',
      'Imandari se ek baat: **in par vidwanon mein matbhed hai.** Kuch paramparaein Rahu Kaal ko bahut vazan deti hain, kuch ise sthaniya reeti maanti hain aur classical muhurat granthon mein iski jagah simit maanti hain. Calculator inhe **chetavni** ke roop mein dikhata hai, slot ko kaat nahi deta — kyunki chikitsiya window mein pehle hi kam vikalp bache hote hain, aur ek matbhed wale niyam par poora chunav girana theek nahi.',
    ],
  },
  {
    id: 'aathva-bhaav',
    h2: 'Aathva bhaav — jise zyadatar muft tool dekhte hi nahi',
    paras: [
      'Aathva bhaav aayu, sankat aur achanak ghatnaon ka bhaav hai. Janm-muhurat ke sandarbh mein iski jaanch classical hai — **us samay aathve bhaav mein koi kroor graha na ho.**',
      'Kroor grah kaun: **Mangal, Shani, Rahu, Ketu**, aur peedit Surya. Inme se koi aathve bhaav mein ho to us slot ko utar diya jaata hai, chahe nakshatra aur tithi dono shreshth hon. Yahi wo jaanch hai jo aksar chhoot jaati hai, kyunki iske liye poora chart banana padta hai — sirf panchang dekhne se ye nahi milti.',
      'Yahi is calculator aur ek saadharan panchang lookup ke beech ka asli antar hai. Panchang aapko tithi, nakshatra aur Rahu Kaal de dega. Aathve bhaav ki sthiti ke liye us **kshan ka chart** chahiye — aur wahi yahan har slot ke liye banta hai.',
    ],
  },
  {
    id: 'chandra-guru',
    h2: 'Chandra aur Guru — mann aur santan ke kaarak',
    paras: [
      '**Chandra** mann aur poshan ka kaarak hai, aur muhurat mein uska sthaan do wajah se mayne rakhta hai. Ek, Chandra ka nakshatra hi **naamakshar** tay karta hai. Do, Chandra ki rashi bachche ki **Chandra Rashi** ban jaati hai, jo aage chal kar dasha aur gochar dono mein kaam aati hai.',
      '**Guru (Brihaspati)** ko **Putrakaraka** kaha gaya hai — santan ka kaarak. Muhurat mein Guru ki drishti Lagna par ya panchma bhaav par ho to use bahut anukool maana jaata hai, kyunki Guru ki drishti shastra mein sabse kalyankari maani gayi hai.',
      'Ek vyavharik seema: **Guru ek rashi mein lagbhag ek saal rehta hai.** Iska matlab uski sthiti aapke chunav se nahi badlegi — wo us saal jaisi hai waisi hi rahegi. Isliye Guru is calculator mein ek sthir paristhiti hai, chunav ka aadhaar nahi. Guru aur santan ka poora sambandh [Jupiter, Putrakaraka aur santan](/blog/jupiter-putrakaraka-child-destiny-astrology) mein.',
    ],
  },
  {
    id: 'naamakshar',
    h2: 'Naamakshar — bachche ke naam ka shubh pehla akshar',
    paras: [
      'Ye us cheez ka naam hai jo bahut se parivaar dhoondhte hain par jiska naam nahi jaante. **Har nakshatra ke char pada hote hain, aur har pada ka ek nirdharit shubh syllable hota hai.** Jis pada mein bachcha paida hota hai, uska akshar bachche ke naam ka pehla akshar maana jaata hai.',
      'Udaharan: **Pushya** ke char pada se **Hu, He, Ho, Da** aate hain. **Anuradha** se **Na, Ni, Nu, Ne**. **Rohini** se **O, Va, Vi, Vu**. Calculator har slot ke saath uska naamakshar dikha deta hai — matlab aap muhurat chunne ke saath hi naam ka akshar bhi jaan jaate hain.',
      'Ek chhota par kaam ka nuqta: **nakshatra ka pada Chandra ki gati se badalta hai**, aur ek pada lagbhag ek ghanta chalta hai. Isliye ek hi nakshatra ke andar do slot alag naamakshar de sakte hain. Agar aapko koi vishesh akshar chahiye, to us hisaab se slot chuna ja sakta hai — bina baaki kaarkon se samjhaute ke. Poori soochi [Lucky baby name letter by nakshatra](/blog/lucky-baby-name-letter-by-nakshatra), Hindi mein [नक्षत्र से नामाक्षर](/blog/lucky-baby-name-letter-by-nakshatra-hindi).',
    ],
  },
  {
    id: 'best-date',
    h2: 'Best Date for Baby Birth — date chunne ka sahi kram',
    paras: [
      'Bahut se log ulta kram chalte hain — pehle "shubh date" dhoondhte hain, phir doctor se kehte hain ki isi din kar dijiye. **Ye kram galat hai aur khatarnak bhi.**',
      'Sahi kram ye hai. **Pehle doctor se poochhiye** ki chikitsiya roop se kaunsi dates surakshit hain — prayah ek-do din ki chhoot hoti hai, kabhi zyada. **Phir un dates ko yahan chalayiye** aur dekhiye kis din ki window mein sabse achha slot ban raha hai. **Phir doctor ko wahi din aur samay batayiye**, aur unka faisla maaniye.',
      'Is kram mein muhurat apni sahi jagah par rehta hai — chikitsiya seema ke **andar** ek behtar chunav, uske **upar** koi maang nahi. Jab bhi ye kram ulta hota hai, jokhim badhta hai aur shastra ka apna niyam bhi tootta hai.',
    ],
  },
  {
    id: 'prediction-calculator-limits',
    h2: 'Child Birth Prediction Calculator — ye kya nahi bata sakta',
    paras: [
      'Ye seema saaf likhna zaroori hai, kyunki ye page vyapaar ke liye nahi likha ja raha.',
      'Ye calculator **nahi** bata sakta: bachche ka ling — aur koi jyotishiya tool nahi bata sakta, aur Bharat mein ling-jaanch **kanooni roop se varjit** hai; delivery mein koi jatilta hogi ya nahi; bachcha swasth hoga ya nahi; ya delivery natural hogi ya operation se. Ye sab chikitsiya prashn hain aur inka uttar sirf aapke doctor ke paas hai.',
      'Jo ye bata sakta hai: **di gayi window ke andar kaunsa samay classical niyamon ke hisaab se sabse anukool hai**, uske peeche kya wajah hai, aur us samay ka naamakshar kya banta hai. Bas. Jo site isse zyada ka wada kare, wo aapki chinta bech rahi hai.',
    ],
  },
  {
    id: 'kitne-bacche',
    h2: 'Kitne bacche honge — ye alag prashn hai',
    paras: [
      'Ye prashn is page par bahut aata hai, par iska is calculator se koi sambandh nahi — aur do alag cheezon ko mila dena hi galtiyon ki jad hai.',
      '**Muhurat calculator** ek nishchit window mein sabse achha samay dhoondhta hai. **Santan-sankhya** maa ya pita ke apne chart se padhi jaati hai: **panchma bhaav aur uska swami, Saptamsa (D-7) — santan ka varga chart, aur Guru ki sthiti.** Ye teeno cheezein us kshan se nahi, janm-kundali se aati hain.',
      'Agar aapka prashn wahi hai, to [Number of Children Prediction](/learn/number-of-children-prediction) aur [Child Birth Prediction](/learn/child-birth-prediction) uske liye bane hain, aur [Santan Yog Calculator](/calculators/free-santan-yog-calculator) muft hai. Santan mein der ke prashn par [संतान प्राप्ति में देरी](/blog/santan-prapti-mein-deri-astrology-upay) alag se likha gaya hai.',
    ],
  },
  {
    id: 'maa-ka-chart',
    h2: 'Maa ke chart mein Sade Sati ya Mangal dosh — kya ye muhurat ko badalta hai',
    paras: [
      'Chhota aur imandar uttar: **nahi, muhurat ke chunav ko nahi badalta.**',
      'Muhurat us kshan ka chart dekhta hai jis kshan bachcha janm lega. Maa ke apne chart ki chal rahi dasha ya gochar us kshan ke Lagna, nakshatra ya aathve bhaav ko nahi badalte. Ye do alag chart hain aur do alag prashn.',
      'Haan, ek anya sandarbh mein maa ka chart mayne rakhta hai — samay ke chunav mein nahi, balki us dauran ki paristhiti samajhne mein. Par yahan bhi wahi baat: **Sade Sati ya Mangal dosh delivery ko "ashubh" nahi banate**, aur is naam par dar bechne wale bahut hain. Apni sthiti dekhni ho to [Sade Sati Calculator](/calculators/free-sade-sati-calculator) aur [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator) dono muft hain.',
    ],
  },
  {
    id: 'pitra-dosh-santan',
    h2: 'Pitra Dosh aur santan — kya sambandh batayajata hai',
    paras: [
      'Ye prashn bhi is page par pahunchta hai, prayah tab jab kisi ne ye keh diya ho ki "aapki kundali mein pitra dosh hai, isliye santan mein badha hai".',
      'Shastriya sthiti itni hai: **Pitra Dosh purvajon se jude rin ka sanket maana jaata hai**, aur Surya se uska sambandh hone ke kaaran ise pita-paksh aur vansh se joda jaata hai. Isi kaaran santan ke prashn mein iski charcha hoti hai.',
      'Santulit baat: **ye sanket badha ki maatra badha sakta hai, par akela kisi ki santan nahi rokta**, aur na hi ye janm-muhurat ke chunav mein koi bhoomika rakhta hai. Jo vyakti dosh ke naam par hazaron ki pooja maange, wo dar bech raha hai. Apni sthiti khud dekhni ho to [Pitra Dosh Calculator](/calculators/free-pitra-dosh-calculator) muft hai, aur santan se uska sambandh [Pitra dosh aur santan](/blog/pitra-dosh-childbirth) mein khola gaya hai.',
    ],
  },
  {
    id: 'date-badal-gayi',
    h2: 'Doctor ne date badal di — ab kya karein',
    paras: [
      'Ye hota hai, aur aksar hota hai. Ma ki sthiti badal jaati hai, hospital ka schedule badal jaata hai, ya doctor pehle bulaa lete hain.',
      'Karna sirf itna hai: **nayi date aur nayi window daal kar calculator dobara chala lijiye.** Poora vishleshan naye sire se ban jaayega — naye slot, naye reason, naya naamakshar. Isme koi kami nahi hai; muhurat ek nishchit samay ka gun hai, koi aisa aashirwad nahi jo "kho" jaaye.',
      'Aur wo baat jo shayad sabse zaroori hai: **agar nayi window mein koi bhi slot bahut achha na aaye, to bhi chinta ki baat nahi.** Har din har kshan koi na koi janm hota hai, aur unme se adhikansh saadharan muhurat mein hote hain. Muhurat ek anukoolta hai, koi shart nahi — aur kisi bhi haal mein ye maa aur bachche ki suraksha se upar nahi.',
    ],
  },
  {
    id: 'free-vs-paid',
    h2: 'Free mein kya milta hai, aur paid report mein kya',
    paras: [
      '**Free mein** — aapki window ke andar sabse achha slot, uske saath doosre-teesre vikalp, har slot ke liye Lagna, Lagna swami aur uski dignity, Lagna nakshatra, Chandra nakshatra, tithi, yoga, karana, aathve bhaav ki sthiti, Gandmool ka flag aur naamakshar. Har point ke saath uski wajah. Koi signup nahi, koi card nahi, koi hissa chhupa kar nahi rakha jaata.',
      '**Paid report mein** — us chune hue kshan ki poori janm-kundali: saare bhaav, Shadbala, Vimshottari dasha ka poora kram, aur bachche ke liye aage ka vishleshan. Yaani free version **samay chunne** ke liye hai, paid version us samay ko **samajhne** ke liye.',
      'Jo yahan jaanbujh kar nahi hai: koi countdown, koi "aapki kundali mein bhaari dosh hai" wali chetavni, koi jaldi machane wala tareeka. Agar slot saadharan hai to result saadharan hi likhega. Antar vistaar se [Free vs paid report](/blog/child-birth-muhurat-free-vs-paid-report) mein.',
    ],
  },
  {
    id: 'janm-samay-note',
    h2: 'Janm ke baad — sateek samay note karna sabse zaroori kaam hai',
    paras: [
      'Ye salah is page par sabse kam glamorous hai aur shayad sabse zyada kaam ki. **Janm ke turant baad ghadi dekhkar sateek samay likh lijiye — ghanta aur minute dono.**',
      'Wajah wahi hai jo poore page par hai: **Lagna har do ghante mein badalta hai.** Pandrah minute ki galti Lagna badal sakti hai, aur uske saath poora chart. Ghar mein yaad rakha gaya samay prayah aadhe ghante par gol kar diya jaata hai — "subah lagbhag saat baje" — aur yahi aage chal kar har vishleshan ko kamzor kar deta hai.',
      'Sabse vishwasneeya srot **janm pramanpatra ya hospital ka record** hai. Ho sake to nurse se poochh kar likh lijiye aur phone mein bhi save kar lijiye. Ye ek minute ka kaam hai jo agle chalis saal tak har kundali padhne ko sateek banata hai.',
    ],
  },
  {
    id: 'panchang-se-antar',
    h2: 'Panchang dekh lein ya calculator — antar kya hai',
    paras: [
      'Vajib prashn hai, aur uska uttar iss page ke apne haq mein nahi jaata. **Bahut se kaamon ke liye saadharan panchang kaafi hai** — vrat ki tithi, tyohar ka din, ya Rahu Kaal jaanna ho to panchang se kaam chal jaata hai aur wo muft milta hai.',
      'Antar tab shuru hota hai jab prashn **ek kshan** ka ho. Panchang aapko batata hai ki us din ki tithi kya hai, nakshatra kya hai, Rahu Kaal kab hai — ye poore din ke aankde hain. Wo ye nahi bata sakta ki subah 10:14 par **Lagna** kaunsa hoga, uska swami kis bhaav mein hoga, ya us kshan **aathve bhaav** mein koi kroor graha to nahi.',
      'Aur delivery-window prayah **do-teen ghante** ki hoti hai, jiske andar Lagna badal bhi sakta hai. Isi liye yahan har slot ka poora chart banta hai. Agar aapka prashn sirf "aaj kaunsi tithi hai" hai, to [Panchang](/panchang) dekh lijiye — wo bhi muft hai.',
    ],
  },
  {
    id: 'twins-multiple',
    h2: 'Twins ya multiple birth — muhurat kaise dekha jaata hai',
    paras: [
      'Tarika wahi rehta hai — doctor ki window, uske andar sabse achha slot — par ek vyavharik baat samajh leni chahiye.',
      'Twins mein dono bachche prayah **kuch minute ke antar** se paida hote hain. Adhikansh sthitiyon mein utne se **Lagna nahi badalta**, isliye dono ka Lagna aur nakshatra ek hi hota hai. Par agar antar Lagna-sandhi par pad jaaye — yaani jab Lagna badalne wala ho — to do bhai-behnon ka poora chart alag ban jaata hai.',
      'Isi wajah se twins mein **dono ka sateek samay alag-alag note karna** aur bhi zaroori ho jaata hai. Aur naamakshar bhi alag ho sakta hai, kyunki Chandra ka pada beech mein badal sakta hai. Calculator slot chunte waqt aisi sandhi se door wala samay upar rakhta hai, taaki chunav sthir rahe.',
    ],
  },
  {
    id: 'videsh-delivery',
    h2: 'Videsh mein delivery — shahar aur timezone',
    paras: [
      'Calculator kisi bhi shahar ke liye kaam karta hai, sirf Bharat ke liye nahi. Shahar chunte hi uska **akshansh, deshantar aur timezone** apne aap lag jaate hain, aur ganana wahin ke sthaniya samay par hoti hai.',
      'Ye zaroori isliye hai ki **Lagna sthaan ke saath badalta hai.** Ek hi kshan par Dubai, London aur Toronto mein Lagna alag hoga. Isliye agar delivery videsh mein hai to wahi shahar daaliye jahan hospital hai — apna Bharat ka shahar nahi, chahe parivaar wahan ho.',
      'Ek aur baat: **samay hamesha sthaniya samay mein daalein** — yaani jo ghadi us hospital mein lagi hai. IST mein badal kar daalne ki koshish mat kijiye; calculator ye khud sambhal leta hai, aur haath se badalne par galti hone ka khatra hai.',
    ],
  },
  {
    id: 'samay-aur-bhagya',
    h2: 'Kya janm ka samay bachche ka bhagya tay karta hai',
    paras: [
      'Ye prashn dabi zubaan mein poochha jaata hai, aur iska imandar uttar dena zaroori hai — kyunki isi dar par bahut kuch becha jaata hai.',
      'Shastriya sthiti: kundali **pravritti** dikhati hai, **niyati** nahi. Janm ka kshan chart ka aarambh-bindu tay karta hai — Lagna, bhaav, dasha ka kram. Par usme jo likha hai wo sambhavnaon ka naksha hai, koi bandh-patra nahi. Karm, parivar, shiksha aur paristhiti — sab utne hi asar daalte hain.',
      'Isliye ye baat saaf rakhni chahiye: **shubh muhurat ek anukoolta hai, koi guarantee nahi**, aur saadharan muhurat mein janm koi kami nahi hai. Duniya ke adhikansh log bina kisi muhurat ke paida hue hain aur achha jeevan jee rahe hain. Jo koi kahe ki galat samay par janm se bachche ka bhavishya bigad jaayega, wo shastra nahi, dar bech raha hai.',
    ],
  },
  {
    id: 'verify-result',
    h2: 'Result ko khud jaanchne ka tarika',
    paras: [
      'Aap kisi bhi tool par bharosa karne se pehle use parakh sakte hain, aur karna bhi chahiye. Yahan ka har point **jaanche jaane layak** banaya gaya hai.',
      'Result mein har slot ke saath likha hota hai: **kaunsa Lagna**, **Lagna ka swami kis bhaav mein aur kis dignity mein**, **kaunsa nakshatra aur pada**, **tithi, yoga, karana**, aur **aathve bhaav mein kya hai**. Ye sab objective aankde hain. Kisi bhi doosre bharose-mand jyotish software mein wahi date, time, shahar daaliye — Lagna aur nakshatra bilkul milne chahiye.',
      'Agar kahin nakshatra ya rashi alag aa rahi ho, to prayah wo **ayanamsha ka antar** hota hai — hum Lahiri use karte hain, jo Bharat sarkar ka maanak hai; kuch videshi software Krishnamurti ya Raman use karte hain. Ye kisi ki galti nahi, sirf alag maanak hai. Par agar **Lagna** hi alag aaye to shahar ya samay mein kahin galti hui hai — dobara jaanch lijiye.',
    ],
  },
  {
    id: 'aage-kya-padhein',
    h2: 'Aage kya padhein',
    paras: [
      'Agar delivery **kal ya aaj** hai — [Last-minute quick check](/blog/child-birth-muhurat-last-minute-quick-check) sabse chhota aur seedha page hai, aur Hindi mein [तुरंत जांच](/blog/child-birth-muhurat-last-minute-quick-check-hindi).',
      'Agar aap **method samajhna** chahte hain — [9 factors explained](/blog/child-birth-muhurat-9-factors-explained), [Doctor safe window vs muhurat](/blog/doctor-safe-window-vs-child-birth-muhurat) aur [Child birth muhurat FAQ](/blog/child-birth-muhurat-faq).',
      'Agar prashn **bachche ke bhavishya** ka hai, muhurat ka nahi — [Child ki destiny aur bhavishya](/blog/childs-destiny-future-astrology), [Panchmesh aur bachche ki pratibha](/blog/fifth-lord-child-aptitude-astrology), [Saraswati yog aur shiksha](/blog/saraswati-yoga-child-education-astrology) aur [Dasha timing aur bachche ka vikas](/blog/dasha-timing-child-development-astrology). Nakshatra ka poora parichay [Nakshatra Guide](/learn/nakshatra-guide) mein hai.',
    ],
  },
];

type MuhuratLink = { href: string; label: string; note: string };

const HUB_HI: MuhuratLink[] = [
  { href: '/blog/child-birth-muhurat-hindi', label: 'चाइल्ड बर्थ मुहूर्त — पूरी गाइड', note: 'शुरुआत यहाँ से' },
  { href: '/blog/best-muhurat-for-c-section-hindi', label: 'सी-सेक्शन का शुभ मुहूर्त', note: 'नियोजित ऑपरेशन के लिए' },
  { href: '/blog/child-birth-muhurat-9-factors-explained-hindi', label: '9 कारक — विस्तार से', note: 'तरीका समझने के लिए' },
  { href: '/blog/doctor-safe-window-vs-child-birth-muhurat-hindi', label: 'डॉक्टर की विंडो vs मुहूर्त', note: 'क्रम क्या होना चाहिए' },
  { href: '/blog/lucky-baby-name-letter-by-nakshatra-hindi', label: 'नक्षत्र से नामाक्षर', note: 'नाम का पहला अक्षर' },
  { href: '/blog/rohini-nakshatra-baby-birth-hindi', label: 'रोहिणी नक्षत्र में जन्म', note: 'चंद्र का नक्षत्र' },
  { href: '/blog/anuradha-nakshatra-baby-birth-hindi', label: 'अनुराधा नक्षत्र में जन्म', note: 'शनि का नक्षत्र' },
  { href: '/blog/ivf-delivery-muhurat-guide-hindi', label: 'IVF डिलीवरी मुहूर्त', note: 'IVF के बाद की डिलीवरी' },
  { href: '/blog/santan-prapti-mein-deri-astrology-upay', label: 'संतान प्राप्ति में देरी', note: 'अलग प्रश्न, अलग चार्ट' },
];

const HUB_EN: MuhuratLink[] = [
  { href: '/blog/child-birth-muhurat', label: 'Child Birth Muhurat — full guide', note: 'Start here' },
  { href: '/blog/best-muhurat-for-c-section', label: 'Best muhurat for C-section', note: 'Planned operation' },
  { href: '/blog/normal-delivery-vs-c-section-muhurat', label: 'Normal delivery vs C-section', note: 'When choice exists' },
  { href: '/blog/child-birth-muhurat-last-minute-quick-check', label: 'Last-minute quick check', note: 'Delivery is today' },
  { href: '/blog/pushya-nakshatra-baby-birth', label: 'Pushya nakshatra', note: 'The most auspicious' },
  { href: '/blog/hasta-nakshatra-baby-birth', label: 'Hasta nakshatra', note: 'Skill and dexterity' },
  { href: '/blog/revati-nakshatra-baby-birth', label: 'Revati nakshatra', note: 'Auspicious, but Gandmool' },
  { href: '/learn/number-of-children-prediction', label: 'Number of Children Prediction', note: 'A different question' },
  { href: '/learn/nakshatra-guide', label: 'Nakshatra Guide', note: 'All 27, explained' },
];

function MuhuratRich({ text, k }: { text: string; k: string }) {
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

function MuhuratHub({ items }: { items: MuhuratLink[] }) {
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

// ─── Post-payment progress steps (anti-anxiety wait-screen) ───
const REPORT_STEPS = [
  '✓ Payment safal — dhanyawad 🙏',
  '🪐 Grahon ki sookshma ganana ho rahi hai...',
  '🌙 Lagna aur Nakshatra nikaale ja rahe hain...',
  '📜 Trikaal aapke bachche ki kundli padh rahe hain...',
  '🔱 Maa Shakti ka aashirwad jod rahe hain...',
  '✨ Aapki report taiyaar ho rahi hai...',
];

export default function FreeChildBirthMuhuratPage() {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [timezone, setTimezone] = useState(5.5);
  // Hospital (optional) — overrides city coords when provided
  const [hospital, setHospital] = useState('');
  const [hospLat, setHospLat] = useState<number | null>(null);
  const [hospLng, setHospLng] = useState<number | null>(null);
  const [hospTz, setHospTz] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFullDay, setShowFullDay] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // ── Paid flow state ──
  const [payLang, setPayLang] = useState<'hinglish' | 'hindi' | 'english'>('hinglish');
  const [payTier, setPayTier] = useState<'report_101' | 'remedies_151'>('report_101');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  // ── Post-payment "generating report" overlay ──
  const [generating, setGenerating] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  // Rotate progress messages while the report is being generated
  useEffect(() => {
    if (!generating) { setStepIdx(0); return; }
    const t = setInterval(() => {
      setStepIdx((i) => (i < REPORT_STEPS.length - 1 ? i + 1 : i));
    }, 3500);
    return () => clearInterval(t);
  }, [generating]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!date) e.date = 'Delivery date is required';
    if (!startTime) e.start = 'Window start time required';
    if (!endTime) e.end = 'Window end time required';
    if (lat === null) e.place = 'Please select hospital/city from suggestions';
    if (startTime && endTime && endTime <= startTime) e.end = 'End time must be after start time';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;
    const [year, month, day] = date.split('-').map(Number);
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const useLat = hospLat ?? lat;
    const useLng = hospLng ?? lng;
    const useTz = hospTz ?? timezone;
    setLoading(true);
    try {
      const res = await fetch('/api/calc/muhurat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day,
          window_start_hour: sh, window_start_minute: sm,
          window_end_hour: eh, window_end_minute: em,
          latitude: useLat, longitude: useLng, timezone: useTz,
          // full_day OFF on the main scan. The VM was also scanning a full
          // 24h day (~144 extra slots) on every submit just to populate the
          // collapsed "whole day" educational block — that ~7x heavier load
          // intermittently exceeded the 45s timeout. Window-only scan now.
          full_day: false,
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

  // v1.6 — international. Razorpay on this account rejects foreign cards, so a
  // visitor outside India pays through PayPal. `?intl=1` forces the PayPal view
  // for testing from India; one-way, rupees to dollars only.
  const [isIndia, setIsIndia] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    const forced = typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('intl') === '1';
    if (forced) { setIsIndia(false); return; }
    fetch('/api/geo').then(r => r.json())
      .then(g => { if (!cancelled) setIsIndia(g?.isIndia !== false); })
      .catch(() => { if (!cancelled) setIsIndia(true); });
    return () => { cancelled = true; };
  }, []);

  /**
   * The muhurat payload the order route stores. Shared by both payment paths
   * so a dollar buyer's report is computed from exactly the same slot as a
   * rupee buyer's. Returns null when the slot or location is not ready.
   */
  const buildMuhuratOrderBody = () => {
    if (!result || !best) return null;
    const [year, month, day] = date.split('-').map(Number);
    const { hour: bh, minute: bm } = parseTimeTo24h(best.time);
    const useLat = hospLat ?? lat;
    const useLng = hospLng ?? lng;
    const useTz  = hospTz ?? timezone;
    if (useLat === null || useLng === null) return null;
    return {
      tier: payTier,
      language: payLang,
      muhurat: {
        year, month, day,
        hour: bh, minute: bm,
        latitude: useLat, longitude: useLng, timezone: useTz,
        city, hospital,
      },
    };
  };

  /** Everything after the money is taken — shared by both payment paths. */
  const finishAfterPayment = async (proof: Record<string, string>) => {
    setPayLoading(false);
    setGenerating(true);
    try {
      const verifyRes = await fetch('/api/verify-muhurat-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proof),
      });
      const vd = await verifyRes.json();
      if (vd.success && vd.slug) {
        window.location.href = `/muhurat/${vd.slug}`;
      } else {
        setGenerating(false);
        setPayError(vd.error || 'Payment verified but report could not be created. Please contact us on WhatsApp.');
      }
    } catch {
      setGenerating(false);
      setPayError('Payment done, but verification failed. Please contact us on WhatsApp — your payment is safe.');
    }
  };

  /** PayPal has taken the money. The verify route re-confirms with PayPal. */
  const handlePayPalPaid = async (proof: { paypal_order_id: string }) => {
    setPayError(null);
    await finishAfterPayment({ paypal_order_id: proof.paypal_order_id });
  };

  // ── Paid report: create order → Razorpay → verify → redirect ──
  const handleBuyReport = async () => {
    setPayError(null);
    if (!result || !best) return;

    const [year, month, day] = date.split('-').map(Number);
    // Use the best slot's time as the parent's CHOSEN delivery moment
    // (parseTimeTo24h handles the VM's 12-hour "h:mm AM/PM" format)
    const { hour: bh, minute: bm } = parseTimeTo24h(best.time);
    const useLat = hospLat ?? lat;
    const useLng = hospLng ?? lng;
    const useTz = hospTz ?? timezone;

    if (useLat === null || useLng === null) {
      setPayError('Location missing. Please re-run the calculator.');
      return;
    }

    setPayLoading(true);
    try {
      // 1) Load Razorpay script
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Could not load payment gateway. Please try again.');

      // 2) Create order
      const orderRes = await fetch('/api/create-muhurat-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: payTier,
          language: payLang,
          muhurat: {
            year, month, day,
            hour: bh, minute: bm,
            latitude: useLat, longitude: useLng, timezone: useTz,
            city, hospital,
          },
        }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err.error || 'Could not create order.');
      }
      const order = await orderRes.json();

      // 3) Open Razorpay popup
      openRazorpayCheckout({
        keyId:       order.keyId,
        orderId:     order.orderId,
        amount:      order.amount,
        currency:    order.currency,
        name:        'Trikaal Vaani',
        description: order.label,
        themeColor:  GOLD,
        onSuccess: async (resp) => {
          // Shared with the PayPal path — see finishAfterPayment.
          await finishAfterPayment({
            razorpay_order_id:   resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature:  resp.razorpay_signature,
          });
        },
        onDismiss: () => setPayLoading(false),
      });
    } catch (e: any) {
      setPayError(e?.message || 'Payment could not start. Please try again.');
      setPayLoading(false);
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0', colorScheme: 'dark' as const,
  });

  const best: SlotData | null = result?.best_slot || null;
  const topSlots: SlotData[] = result?.top_slots || [];
  const fullDay = result?.full_day || null;

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-child-birth-muhurat-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Child Birth Muhurat Calculator — Auspicious C-Section & Delivery Time by Date',
    description:
      "Find the most auspicious delivery moment within your doctor's safe window — strong Lagna, favourable Nakshatra & Tithi, clean 8th house and lucky name letter. Free Vedic muhurat calculator by Trikaal Vaani.",
    breadcrumbName: 'Child Birth Muhurat Calculator',
    aboutEntities: ['Muhurta', 'Lagna', 'Nakshatra', 'Child Birth'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Muhurta', 'Electional Astrology'],
    howToName: 'How to find an auspicious child birth muhurat',
    howToSteps: [
      { name: 'Enter the doctor-approved window', text: "Enter the planned delivery date and the safe time window your doctor has approved, plus the city or hospital location." },
      { name: 'Analyse each slot', text: 'The calculator scores every slot in the window on Lagna, Nakshatra, Tithi, Yoga and 8th house using Swiss Ephemeris with Lahiri Ayanamsha.' },
      { name: 'Get your result', text: 'See the most auspicious moment inside the window, alternative good slots, the lucky name letter and favourable factors.' },
    ],
    faqs: FAQS,
  });

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── POST-PAYMENT GENERATING OVERLAY (anti-anxiety) ─── */}
      {generating && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
          style={{ background: 'rgba(8,11,18,0.94)', backdropFilter: 'blur(8px)' }}
        >
          {/* Spinning halo ring */}
          <div
            style={{
              width: 92, height: 92, borderRadius: '50%',
              border: `3px solid ${GOLD_RGBA(0.15)}`,
              borderTopColor: GOLD,
              animation: 'tvspin 1s linear infinite',
            }}
          />
          <div className="text-2xl mt-6 mb-2" style={{ color: GOLD }}>🔱</div>
          <p className="text-lg md:text-xl font-serif text-center" style={{ color: GOLD, minHeight: '2.4em' }}>
            {REPORT_STEPS[stepIdx]}
          </p>
          <p className="text-xs text-slate-400 mt-3 text-center max-w-xs">
            Aapka payment safe hai. Kripya yeh page band na karein — report 1–2 minute mein khul jayegi.
          </p>

          {/* Step dots */}
          <div className="flex gap-2 mt-6">
            {REPORT_STEPS.map((_, i) => (
              <span key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: i <= stepIdx ? GOLD : GOLD_RGBA(0.2),
                transition: 'background 0.4s',
              }} />
            ))}
          </div>

          <style>{`@keyframes tvspin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Child Birth Muhurat Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Child Birth Muhurat Calculator — Auspicious C-Section & Delivery Time by Date
          </h1>

          {/* GEO DIRECT ANSWER (40-60w) */}
          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              A <strong style={{ color: GOLD }}>child birth muhurat</strong> is the most auspicious moment to deliver a baby, chosen using Vedic astrology. For a planned C-section or IVF delivery, the muhurat is selected <strong>within the safe time window your doctor approves</strong> — based on a strong Lagna (ascendant), favourable Nakshatra and Tithi, and a clean 8th house. Trikaal Vaani finds the best slot inside that window using Swiss Ephemeris and BPHS classical rules.
            </p>
          </div>

          {/* SAFETY BANNER — EEAT trust signal */}
          <div className="rounded-xl p-4 mb-6 flex gap-3" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.3)' }}>
            <span className="text-xl">🩺</span>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong style={{ color: '#93c5fd' }}>Medical safety comes first.</strong> Your doctor decides the delivery date and the safe time window based on the mother's and baby's health. This tool only finds the most auspicious moment <em>inside</em> that doctor-approved window. It is guidance to discuss with your doctor — not medical advice.
            </p>
          </div>

          {/* AUTHOR CARD — EEAT */}
          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · BPHS Muhurta · Lahiri Ayanamsha · 9-Factor Master Analysis</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Auspicious Delivery Time (Free)</h2>
            <div className="grid gap-5">

              <div>
                <label htmlFor="m-date" className="block text-sm font-medium text-slate-300 mb-1.5">Delivery Date <span className="text-yellow-400">*</span> <span className="text-slate-500 text-xs">(as planned with your doctor)</span></label>
                <input id="m-date" type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.date)} />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="m-start" className="block text-sm font-medium text-slate-300 mb-1.5">Window Start <span className="text-yellow-400">*</span></label>
                  <input id="m-start" type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.start)} />
                </div>
                <div>
                  <label htmlFor="m-end" className="block text-sm font-medium text-slate-300 mb-1.5">Window End <span className="text-yellow-400">*</span></label>
                  <input id="m-end" type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.end)} />
                  {errors.end && <p className="text-red-400 text-xs mt-1">{errors.end}</p>}
                </div>
              </div>
              <p className="text-xs text-slate-500 -mt-3">⏱️ Enter the time window your doctor has cleared as safe (e.g. 9:00 AM to 1:00 PM).</p>

              {/* WHY WE ASK — trust + accuracy explainer */}
              <div className="rounded-lg p-3" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <p className="text-xs text-slate-400 leading-relaxed">
                  📍 <strong style={{ color: GOLD }}>Why we ask for location:</strong> The ascendant (Lagna) — the most important factor in the muhurat — changes with exact birth coordinates. A precise hospital location gives the most accurate result. City alone works too.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">City of Birth <span className="text-yellow-400">*</span></label>
                <PlaceInput id="m-city" placeholder="Type city name..." error={errors.place}
                  onSelect={(c, la, ln, tz) => {
                    setCity(c); setLat(la); setLng(ln); setTimezone(tz);
                    setErrors(prev => { const n = { ...prev }; delete n.place; return n; });
                  }} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Hospital / Clinic <span className="text-slate-500 text-xs">(optional — for pinpoint accuracy)</span>
                </label>
                <PlaceInput id="m-hospital" placeholder="Type hospital or clinic name..."
                  onSelect={(c, la, ln, tz) => {
                    setHospital(c); setHospLat(la); setHospLng(ln); setHospTz(tz);
                  }} />
                {hospLat !== null && (
                  <p className="text-xs mt-1" style={{ color: '#22c55e' }}>✓ Using exact hospital location for maximum precision</p>
                )}
              </div>

              {lat !== null && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Latitude', value: (hospLat ?? lat).toFixed(4) },
                    { label: 'Longitude', value: (hospLng ?? lng!).toFixed(4) },
                    { label: 'Timezone', value: `UTC ${(hospTz ?? timezone) >= 0 ? '+' : ''}${hospTz ?? timezone}` },
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
                {loading ? '⟳ Finding auspicious time...' : '🕉️ Find Auspicious Muhurat'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · BPHS Muhurta · Within your doctor's window</p>
            </div>
          </div>

          {/* RESULT */}
          {result && best && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* BEST SLOT — primary recommendation */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                background: `linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(2,8,23,0.6) 100%)`,
                border: `1px solid ${GOLD_RGBA(0.4)}`
              }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Most Auspicious Time (within your window)</div>
                <div className="text-5xl font-serif font-bold mb-2" style={{ color: GOLD }}>{best.time}</div>
                <div className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4"
                  style={{ background: GOLD_RGBA(0.15), color: GOLD, border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                  {result.best_band} · {best.score}/100
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-left">
                  <Cell label="Lagna" value={best.lagna_sign} />
                  <Cell label="Nakshatra" value={best.lagna_nakshatra} />
                  <Cell label="Tithi" value={best.tithi} />
                  <Cell label="Lucky Letter" value={best.naamakshar} highlight />
                </div>
              </div>

              {/* WHY THIS TIME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ Favourable Factors</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {best.reasons.map((r, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{r}</span></li>)}
                  </ul>
                </div>
                {best.cautions.length > 0 && (
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#FCA5A5' }}>⚠️ Points of Caution</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {best.cautions.map((c, i) => <li key={i} className="flex gap-2"><span className="text-red-400">•</span><span>{c}</span></li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* TOP ALTERNATIVE SLOTS */}
              {topSlots.length > 1 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-4" style={{ color: GOLD }}>🕐 Other Good Times in Your Window</h3>
                  <div className="space-y-2">
                    {topSlots.slice(1, 5).map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.12)}` }}>
                        <div>
                          <span className="font-bold text-base" style={{ color: GOLD }}>{s.time}</span>
                          <span className="text-xs text-slate-500 ml-3">{s.lagna_sign} Lagna · {s.lagna_nakshatra}</span>
                        </div>
                        <span className="text-sm font-mono" style={{ color: s.score >= 60 ? '#86EFAC' : s.score >= 45 ? GOLD : '#FCA5A5' }}>{s.score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PAID CTA — ₹101 / ₹151 with Razorpay */}
              <div className="rounded-2xl p-6" style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.12), rgba(2,8,23,0.5))`, border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <h3 className="text-xl font-serif font-bold mb-2 text-center" style={{ color: GOLD }}>🔮 Unlock the Full Muhurat Report</h3>
                <p className="text-sm text-slate-300 mb-5 max-w-xl mx-auto text-center">
                  A detailed life prediction for a child born at <strong style={{ color: GOLD }}>{best.time}</strong>, the lucky name letter with boy &amp; girl name suggestions, doshas to be aware of, and a downloadable report to share with your family.
                </p>

                {/* Tier selector */}
                <div className="grid grid-cols-2 gap-3 mb-4 max-w-md mx-auto">
                  <button onClick={() => setPayTier('report_101')}
                    className="rounded-xl p-4 text-left transition"
                    style={{
                      background: payTier === 'report_101' ? GOLD_RGBA(0.15) : 'rgba(2,8,23,0.4)',
                      border: `1px solid ${payTier === 'report_101' ? GOLD : GOLD_RGBA(0.2)}`,
                    }}>
                    <div className="font-bold text-lg" style={{ color: GOLD }}>{isIndia === false ? '$12' : '₹101'}</div>
                    <div className="text-xs text-slate-400 mt-1">Full report + prediction + boy/girl names</div>
                  </button>
                  <button onClick={() => setPayTier('remedies_151')}
                    className="rounded-xl p-4 text-left transition relative"
                    style={{
                      background: payTier === 'remedies_151' ? GOLD_RGBA(0.15) : 'rgba(2,8,23,0.4)',
                      border: `1px solid ${payTier === 'remedies_151' ? GOLD : GOLD_RGBA(0.2)}`,
                    }}>
                    <div className="font-bold text-lg" style={{ color: GOLD }}>{isIndia === false ? '$15' : '₹151'}</div>
                    <div className="text-xs text-slate-400 mt-1">Everything + all 10 personalised remedies</div>
                  </button>
                </div>

                {/* Language selector */}
                <div className="flex justify-center gap-2 mb-5">
                  {(['hinglish', 'hindi', 'english'] as const).map((l) => (
                    <button key={l} onClick={() => setPayLang(l)}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition"
                      style={{
                        background: payLang === l ? GOLD : 'rgba(255,255,255,0.05)',
                        color: payLang === l ? '#080B12' : '#94a3b8',
                        border: `1px solid ${payLang === l ? GOLD : 'rgba(255,255,255,0.1)'}`,
                      }}>
                      {l}
                    </button>
                  ))}
                </div>

                {payError && (
                  <div className="px-4 py-3 rounded-lg text-sm text-red-300 mb-4 max-w-md mx-auto" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{payError}</div>
                )}

                <div className="text-center">
                  {isIndia === false ? (
                    // The order route stores the chosen muhurat slot, so
                    // PayPal's order must be created THERE — otherwise the row
                    // would not exist when the money arrived and the buyer
                    // would receive nothing.
                    <div className="max-w-md mx-auto">
                      <PayPalCheckout
                        productKey={payTier === 'remedies_151' ? 'muhurat_remedies' : 'muhurat_report'}
                        createOrderUrl="/api/create-muhurat-order"
                        createOrderBody={buildMuhuratOrderBody() ?? {}}
                        onPaid={(proof) => handlePayPalPaid({ paypal_order_id: proof.paypal_order_id })}
                        onError={(m) => setPayError(m)}
                        disabled={payLoading || generating}
                        onBeforeCreate={() => {
                          if (!buildMuhuratOrderBody()) {
                            setPayError('Location missing. Please re-run the calculator.');
                            return false;
                          }
                          return true;
                        }}
                      />
                      <p className="text-center text-xs text-slate-600 mt-3">🔒 Secure payment via PayPal — or pay by card without a PayPal account · No refund policy</p>
                    </div>
                  ) : (
                    <>
                      <button onClick={handleBuyReport} disabled={payLoading || generating}
                        className="px-8 py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: GOLD, color: '#080B12' }}>
                        {payLoading ? '⟳ Opening payment...' : `Get Full Report · ${payTier === 'remedies_151' ? '₹151' : '₹101'}`}
                      </button>
                      <p className="text-center text-xs text-slate-600 mt-3">🔒 Secure payment via Razorpay · No refund policy</p>
                    </>
                  )}
                </div>
              </div>

              {/* FULL DAY — EDUCATIONAL, collapsed by default */}
              {fullDay && fullDay.best_slot && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => setShowFullDay(!showFullDay)} className="w-full flex items-center justify-between text-left">
                    <span className="text-sm font-semibold text-slate-400">📚 Educational: most auspicious time across the whole day</span>
                    <span style={{ color: GOLD }}>{showFullDay ? '−' : '+'}</span>
                  </button>
                  {showFullDay && (
                    <div className="mt-4">
                      <div className="rounded-lg p-4 mb-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <p className="text-xs text-red-200 leading-relaxed">{fullDay.note}</p>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(2,8,23,0.4)' }}>
                        <span className="font-bold" style={{ color: GOLD }}>{fullDay.best_slot.time}</span>
                        <span className="text-xs text-slate-500">{fullDay.best_slot.lagna_sign} · {fullDay.best_slot.lagna_nakshatra}</span>
                        <span className="text-sm font-mono text-slate-400">{fullDay.best_slot.score}/100</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DISCLAIMER */}
              {result.disclaimer && (
                <p className="text-xs text-slate-500 leading-relaxed p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {result.disclaimer}
                </p>
              )}
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
                    <MuhuratRich text={p} k={`s${si}-p${pi}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* comparison table — kept from v1.x, unchanged */}
          <section className="mt-4 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs Other Muhurat Sites</h2>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Personalised to your window</td><td className="p-3" style={{ color: GOLD }}>✓ Exact</td><td className="p-3 text-slate-500">✗ Generic date lists</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">8th house affliction check</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Instant result</td><td className="p-3" style={{ color: GOLD }}>✓ Seconds</td><td className="p-3 text-slate-500">✗ Manual consult</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Doctor-safety first</td><td className="p-3" style={{ color: GOLD }}>✓ Built-in</td><td className="p-3 text-slate-500">✗ Footnote</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lucky name letter</td><td className="p-3" style={{ color: GOLD }}>✓ Naamakshar</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── v2.0: the muhurat cluster this page was barely linked to ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Child birth muhurat — poora guide</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Har vishay par alag vistrit lekh — hindi aur angrezi dono mein. Delivery kal hai to sabse pehle &ldquo;Last-minute quick check&rdquo; padhiye.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>हिंदी में</h3>
                <MuhuratHub items={HUB_HI} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>In English</h3>
                <MuhuratHub items={HUB_EN} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions</h2>
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
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra Finder' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati' },
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
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

function Cell({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${highlight ? GOLD : GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="font-bold text-base" style={{ color: GOLD }}>{value || '—'}</div>
    </div>
  );
}
