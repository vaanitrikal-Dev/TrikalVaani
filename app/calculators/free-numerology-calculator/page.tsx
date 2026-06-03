'use client';

// ============================================================
// File: app/calculators/free-numerology-calculator/page.tsx
// Version: v1.1 — Free Numerology Calculator (Mulank / Bhagyank / Naamank)
// NO VM, NO API — pure client-side date/name math (Cheiro / Vedic numerology)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.1 (2026-06-02) — Gold-standard JSON-LD: swapped inline 4-node
//        @graph for buildCalcJsonLd() helper (8 @id-linked nodes:
//        Organization+real sameAs, WebSite, linkable Person /founder,
//        WebPage isPartOf #website [no longer dangling], BreadcrumbList,
//        WebApplication, HowTo, FAQPage). HowTo uses name+DOB only (no
//        time/place). No logic/UI/form change.
//   v1.0 — initial build.
// ============================================================

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface NumInfo {
  planet: string;
  planet_hi: string;
  traits: string;
  colors: string;
  days: string;
  lucky: string;
  friends: number[];
}

// Number → planet + lucky data (Cheiro / Indian numerology)
const NUM_DATA: Record<number, NumInfo> = {
  1: { planet: 'Sun',     planet_hi: 'सूर्य', traits: 'Leadership, independence, confidence, ambition', colors: 'Gold, Orange, Yellow', days: 'Sunday, Monday', lucky: '1, 10, 19, 28', friends: [1, 2, 3, 9] },
  2: { planet: 'Moon',    planet_hi: 'चंद्र', traits: 'Sensitive, intuitive, caring, diplomatic',        colors: 'White, Cream, Light Green', days: 'Monday, Friday', lucky: '2, 11, 20, 29', friends: [1, 2, 4, 7] },
  3: { planet: 'Jupiter', planet_hi: 'गुरु',  traits: 'Wisdom, optimism, creativity, discipline',         colors: 'Yellow, Golden',          days: 'Thursday',         lucky: '3, 12, 21, 30', friends: [3, 6, 9] },
  4: { planet: 'Rahu',    planet_hi: 'राहु',  traits: 'Unconventional, hard-working, practical, rebel',    colors: 'Blue, Grey, Khaki',       days: 'Sunday, Saturday', lucky: '4, 13, 22, 31', friends: [1, 5, 7, 8] },
  5: { planet: 'Mercury', planet_hi: 'बुध',   traits: 'Communicative, adaptable, witty, business-minded',  colors: 'Green, Light tones',      days: 'Wednesday, Friday', lucky: '5, 14, 23',     friends: [1, 3, 5, 6, 9] },
  6: { planet: 'Venus',   planet_hi: 'शुक्र', traits: 'Loving, artistic, luxurious, harmonious',           colors: 'White, Pink, Pastels',    days: 'Friday, Wednesday', lucky: '6, 15, 24',     friends: [3, 6, 9] },
  7: { planet: 'Ketu',    planet_hi: 'केतु',  traits: 'Spiritual, intuitive, researcher, mystical',        colors: 'White, Light Green, Smoke', days: 'Sunday, Monday', lucky: '7, 16, 25',     friends: [1, 2, 4, 7] },
  8: { planet: 'Saturn',  planet_hi: 'शनि',   traits: 'Disciplined, karmic, persistent, just',             colors: 'Black, Dark Blue, Purple', days: 'Saturday',        lucky: '8, 17, 26',     friends: [4, 5, 8] },
  9: { planet: 'Mars',    planet_hi: 'मंगल',  traits: 'Energetic, courageous, determined, protective',     colors: 'Red, Crimson',            days: 'Tuesday',          lucky: '9, 18, 27',     friends: [3, 6, 9] },
};

// Chaldean letter values (no 9 in Chaldean)
const CHALDEAN: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

function reduceToSingle(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

function calcMulank(day: number): number {
  return reduceToSingle(day);
}

function calcBhagyank(y: number, m: number, d: number): number {
  const allDigits = `${y}${m}${d}`.split('').reduce((s, ch) => s + Number(ch), 0);
  return reduceToSingle(allDigits);
}

function calcNaamank(name: string): number | null {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters) return null;
  const sum = letters.split('').reduce((s, ch) => s + (CHALDEAN[ch] || 0), 0);
  if (sum === 0) return null;
  return reduceToSingle(sum);
}

const FAQS = [
  { q: 'Mulank (Root Number) kya hota hai?', a: 'Mulank aapki birth date (sirf tareekh, 1-31) ko ek single digit (1-9) mein reduce karke milta hai. Jaise 23 ko born ho → 2+3 = 5, to Mulank 5. Yeh aapke core nature aur day-to-day vyaktitva ko represent karta hai. Indian numerology mein ise "Driver" number bhi kehte hain.' },
  { q: 'Bhagyank (Destiny Number) kya hota hai?', a: 'Bhagyank aapki poori date of birth (DD + MM + YYYY) ke saare digits jodkar single digit mein reduce karne se milta hai. Yeh aapke life-path, destiny aur long-term direction ko darshaata hai. Ise "Conductor" ya "Life Path" number bhi kehte hain.' },
  { q: 'Lucky number kaise pata chalta hai?', a: 'Aapke Mulank ke aadhar par lucky numbers, lucky days aur lucky colors fix hote hain. Calculator aapke Mulank ka ruling planet (jaise Mulank 1 = Sun) aur uske shubh numbers/colors/days turant batata hai.' },
  { q: 'Naamank (Name Number) kya hai?', a: 'Naamank aapke naam ke akshar ko Chaldean numerology values se jodkar nikalta hai. Yeh batata hai ki aapka naam kis energy ke saath resonate karta hai. Mulank aur Naamank ka tālmel (harmony) achha ho to results behtar mane jaate hain.' },
  { q: 'Mulank aur Bhagyank mein konsa zyada important hai?', a: 'Dono important hain — Mulank rozmarra ke swabhav ko, aur Bhagyank life-path ko dikhata hai. Jab dono numbers friendly hon to jeevan mein flow aur tālmel achha rehta hai. Conflict ho to remedies aur awareness se balance kiya jaata hai.' },
  { q: 'Har number ka apna planet kyun hota hai?', a: 'Indian/Cheiro numerology mein har ank (1-9) ek graha se juda hai: 1-Sun, 2-Moon, 3-Jupiter, 4-Rahu, 5-Mercury, 6-Venus, 7-Ketu, 8-Saturn, 9-Mars. Isi se number ke traits, lucky colors aur days nikalte hain — yeh numerology aur jyotish ko jodta hai.' },
  { q: 'Kya ye Numerology Calculator free hai?', a: 'Haan, 100% free. Mulank, Bhagyank, Naamank (naam se), ruling planet, lucky numbers, lucky colors, lucky days aur friendly numbers — sab bilkul free, turant.' },
  { q: 'Numerology kitna accurate hai?', a: 'Numerology ek paramparik (traditional) vidya hai jo numbers aur unke planetary associations par aadharit hai — yeh astronomical calculation nahi, balki ek symbolic system hai. Trikaal Vaani classical Cheiro/Vedic numerology rules follow karta hai. Ise guidance ki tarah lein, aur important faisle apne vivek se karein.' },
];

export default function FreeNumerologyCalculatorPage() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = 'Date of birth is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const [y, m, d] = date.split('-').map(Number);
    const mulank = calcMulank(d);
    const bhagyank = calcBhagyank(y, m, d);
    const naamank = name.trim() ? calcNaamank(name) : null;

    setResult({ mulank, bhagyank, naamank, name: name.trim() });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [name, date]);

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  const mulank = result?.mulank as number | undefined;
  const bhagyank = result?.bhagyank as number | undefined;
  const naamank = result?.naamank as number | null | undefined;
  const mInfo = mulank ? NUM_DATA[mulank] : null;
  const bInfo = bhagyank ? NUM_DATA[bhagyank] : null;
  const harmony = (mulank && bhagyank)
    ? (mulank === bhagyank
        ? { txt: 'Mulank aur Bhagyank same hain — strong, focused energy.', color: '#86EFAC' }
        : (NUM_DATA[mulank].friends.includes(bhagyank)
            ? { txt: 'Mulank aur Bhagyank friendly hain — achha tālmel aur natural flow.', color: '#86EFAC' }
            : { txt: 'Mulank aur Bhagyank thode different hain — awareness aur balance se behtar results.', color: GOLD }))
    : null;

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-numerology-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Numerology Calculator — Mulank, Bhagyank & Lucky Number',
    description:
      'Find your Mulank (root number), Bhagyank (destiny number) and Naamank from your date of birth & name, with ruling planet, lucky numbers, colors & days. Free numerology calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Numerology Calculator',
    aboutEntities: ['Numerology', 'Mulank', 'Bhagyank', 'Naamank'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Numerology', 'Cheiro Numerology'],
    howToName: 'How to find your Mulank, Bhagyank and lucky number',
    howToSteps: [
      { name: 'Enter name and date of birth', text: 'Enter your full name (optional, for Naamank) and your date of birth.' },
      { name: 'Calculate the numbers', text: 'The calculator reduces your date of birth and name using classical Cheiro / Vedic numerology rules.' },
      { name: 'Get your result', text: 'See your Mulank, Bhagyank and Naamank with ruling planet, lucky numbers, colors and days.' },
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
            <span style={{ color: GOLD }}>Free Numerology Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Numerology Calculator — Mulank, Bhagyank &amp; Lucky Number
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Numerology</strong> mein aapka <strong style={{ color: GOLD }}>Mulank</strong> (birth date se) aur <strong style={{ color: GOLD }}>Bhagyank</strong> (poori DOB se) aapke swabhav aur life-path ko darshaate hain. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Numerology Calculator</strong> date of birth se Mulank, Bhagyank, ruling planet, lucky number, lucky color aur lucky day turant batata hai — naam se Naamank bhi.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Method: Cheiro / Vedic Numerology · Number-Planet System</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Calculate Your Numbers (Free)</h2>
            <div className="grid gap-5">
              <div>
                <label htmlFor="tv-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-slate-500 text-xs">(optional — for Naamank)</span></label>
                <input id="tv-name" type="text" placeholder="Enter your full name"
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(false)} />
              </div>

              <div>
                <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth <span className="text-yellow-400">*</span></label>
                <input id="tv-dob" type="date" value={date}
                  onChange={e => { setDate(e.target.value); setErrors({}); }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.date)} />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                <p className="text-slate-500 text-xs mt-1">Sirf date of birth chahiye — time/place ki zaroorat nahi.</p>
              </div>

              <button onClick={handleSubmit}
                className="w-full py-4 rounded-xl font-bold transition-all duration-300"
                style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.8) 0%,${GOLD} 100%)`, color: '#080B12', fontSize: '15px' }}>
                🔢 Calculate My Numbers
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Cheiro / Vedic Numerology</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* CORE NUMBERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mInfo && (
                  <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Mulank (Root Number)</div>
                    <div className="text-6xl font-serif font-bold mb-1" style={{ color: GOLD }}>{mulank}</div>
                    <div className="text-sm text-slate-300">Ruling Planet: <span style={{ color: GOLD }} className="font-bold">{mInfo.planet} ({mInfo.planet_hi})</span></div>
                  </div>
                )}
                {bInfo && (
                  <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: `linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid rgba(96,165,250,0.35)` }}>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Bhagyank (Destiny Number)</div>
                    <div className="text-6xl font-serif font-bold mb-1" style={{ color: '#93C5FD' }}>{bhagyank}</div>
                    <div className="text-sm text-slate-300">Ruling Planet: <span style={{ color: '#93C5FD' }} className="font-bold">{bInfo.planet} ({bInfo.planet_hi})</span></div>
                  </div>
                )}
              </div>

              {/* HARMONY */}
              {harmony && (
                <div className="rounded-xl p-4 text-center text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}`, color: harmony.color }}>
                  {harmony.txt}
                </div>
              )}

              {/* NAAMANK */}
              {naamank && (
                <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Naamank (Name Number) — {result.name}</div>
                  <div className="text-4xl font-serif font-bold mb-1" style={{ color: GOLD }}>{naamank}</div>
                  <div className="text-sm text-slate-400">Ruling Planet: {NUM_DATA[naamank].planet} ({NUM_DATA[naamank].planet_hi}) · Chaldean method</div>
                </div>
              )}

              {/* MULANK DETAIL */}
              {mInfo && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-4" style={{ color: GOLD }}>Mulank {mulank} — Aapke Lucky Factors</h3>
                  <p className="text-sm text-slate-300 mb-4 italic">{mInfo.traits}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <DetailCell icon="🔢" label="Lucky Numbers" value={mInfo.lucky} />
                    <DetailCell icon="🎨" label="Lucky Colors" value={mInfo.colors} />
                    <DetailCell icon="📅" label="Lucky Days" value={mInfo.days} />
                    <DetailCell icon="🤝" label="Friendly Numbers" value={mInfo.friends.join(', ')} />
                  </div>
                </div>
              )}

              {/* BHAGYANK DETAIL */}
              {bInfo && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(96,165,250,0.2)` }}>
                  <h3 className="text-xl font-serif font-bold mb-4" style={{ color: '#93C5FD' }}>Bhagyank {bhagyank} — Aapka Life-Path</h3>
                  <p className="text-sm text-slate-300 mb-4 italic">{bInfo.traits}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <DetailCell icon="🔢" label="Lucky Numbers" value={bInfo.lucky} />
                    <DetailCell icon="🎨" label="Lucky Colors" value={bInfo.colors} />
                    <DetailCell icon="📅" label="Lucky Days" value={bInfo.days} />
                    <DetailCell icon="🤝" label="Friendly Numbers" value={bInfo.friends.join(', ')} />
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Apni janma-kundali ke planets se gehri jaankari chahiye?</p>
                <Link href="/calculators/free-lucky-day-calculator"
                  className="inline-block px-6 py-3 rounded-xl font-bold text-sm"
                  style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.85) 0%,${GOLD} 100%)`, color: '#080B12' }}>
                  Lucky Day Calculator try karein →
                </Link>
              </div>

            </div>
          )}

          {/* PILLAR CONTENT */}
          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Mulank Aur Bhagyank Kya Hote Hain?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Mulank (Root Number)</strong> aapki birth date (1-31) ko single digit mein reduce karke milta hai — yeh aapke core swabhav ko darshaata hai. <strong style={{ color: GOLD }}>Bhagyank (Destiny Number)</strong> poori date of birth (din + maah + varsh) ke digits jodkar nikalta hai — yeh aapke life-path aur destiny ko represent karta hai. Numerology mein in dono ka apna ruling planet hota hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Number → Planet Mapping</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Number</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Planet</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Lucky Colors</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Traits</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <tr key={n} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td className="p-3 font-semibold" style={{ color: GOLD }}>{n}</td>
                      <td className="p-3">{NUM_DATA[n].planet} ({NUM_DATA[n].planet_hi})</td>
                      <td className="p-3">{NUM_DATA[n].colors}</td>
                      <td className="p-3">{NUM_DATA[n].traits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Apne Numbers Ka Upyog Kaise Karein</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Important kaam apne lucky number, lucky day aur lucky color ke saath plan karein. Apne Mulank ke friendly numbers wale logon ke saath partnership achhi chalti hai. Naamank ko Mulank ke saath harmony mein laane ke liye kabhi-kabhi naam ki spelling adjust ki jaati hai (numerologist ki salaah se).
            </p>
            <p className="text-slate-400 leading-relaxed mb-4 text-sm">
              <strong>Note:</strong> Numerology ek paramparik symbolic vidya hai, astronomical calculation nahi. Ise guidance ki tarah lein.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Numerology</h2>
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
                { slug: 'free-kundali-strength-calculator', name: 'Kundali Strength' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-kaal-sarp-dosh-calculator', name: 'Kaal Sarp Dosh' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Calculator' },
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
