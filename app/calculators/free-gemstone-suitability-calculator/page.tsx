'use client';

// ============================================================
// File: app/calculators/free-gemstone-suitability-calculator/page.tsx
// Version: v1.1 — Gemstone Suitability (0–100, all 9 ratna)
// Now uses shared brain: lib/jyotish/gemstone.ts + GemstoneForm + StoneScoreboard.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================

import { useState, useRef } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import GemstoneForm from '@/components/calculators/GemstoneForm';
import { StoneScoreboard, DetailCell } from '@/components/calculators/StoneScoreboard';
import { runEngine, VERDICT_COLOR, type EngineResult } from '@/lib/jyotish/gemstone';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;
const ORG_ID = 'https://trikalvaani.com/#organization';
const WEBSITE_ID = 'https://trikalvaani.com/#website';
const AUTHOR_ID = 'https://trikalvaani.com/#rohiit-gupta';
const REAL_SAMEAS = [
  'https://www.instagram.com/thetrikalvaani',
  'https://www.youtube.com/@TheTrikalVaani',
  'https://www.facebook.com/people/Trikal-Vaani-Voice',
];
const PAGE_URL = 'https://trikalvaani.com/calculators/free-gemstone-suitability-calculator';

const FAQS = [
  { q: 'Gemstone suitability score kaise nikalta hai?', a: 'Trikaal Vaani har ratna ko 0–100 score deta hai. Sabse pehle dekha jaata hai ki uss graha ka aapke Lagna ke liye functional swabhav (benefic/malefic) kya hai — malefic graha ka ratna reject. Phir uski Shadbala strength, sign dignity, bhaav (house), dasha aur afflictions (Rahu/Ketu yuti, papi drishti) jod-ghata kar final score banta hai, saath mein risk aur verdict.' },
  { q: 'Mera Mahadasha planet ka ratna pehnna sahi hai?', a: 'Zaroori nahi. Aam dharna hai ki current Mahadasha ke graha ka ratna pehno — par yeh tabhi sahi hai jab wo graha aapke Lagna ke liye functional benefic ho. Agar wo functional malefic hai (jaise Virgo lagna ke liye Guru), toh Mahadasha hone par bhi uska ratna (Pukhraj) nuksaandeh ho sakta hai. Isiliye yeh calculator pehle gate check karta hai.' },
  { q: 'Exalted (uccha) planet ka ratna hamesha shubh hota hai?', a: 'Nahi. Exalted hona astronomical dignity hai, par ratna ke liye sabse pehle functional swabhav dekha jaata hai. Ek functional malefic agar exalted bhi ho, toh uska ratna phir bhi suit nahi karta — uska bal aapke jeevan ke galat kshetra ko mazboot kar sakta hai.' },
  { q: 'Kya mujhe Neelam (Blue Sapphire) pehnna chahiye?', a: 'Neelam (Shani) sabse strong ratna hai — yeh tabhi pehna jaata hai jab Shani aapke Lagna ke liye functional benefic ya yogakaraka ho (jaise Taurus, Libra, Capricorn, Aquarius lagna), wo balheen ho aur achhe bhaav mein ho. Galat kundali mein Neelam turant haani kar sakta hai. Isiliye iska verdict hamesha "Expert Review" tak hi seemit rakha gaya hai — 3 din trial zaroori.' },
  { q: 'Strong ratna (Neelam, Gomed, Lehsunia) kab pehnein?', a: 'Yeh teeno bahut shaktishaali hain aur inka asar tez. Inhe kabhi bhi sirf score dekh kar auto-approve nahi kiya jaata — chahe score ucha ho, verdict "Expert Review Zaroori" rehta hai. Poori kundali jaankaar astrologer se confirm karke, 3 din ka trial le kar hi dharan karein.' },
  { q: 'Pehle koi ratna pehna tha jisse nuksaan hua — ab kya?', a: 'Calculator mein aap har ratna ke liye apna purana anubhav bata sakte hain (Excellent / Some / No / Negative). Negative anubhav score ghata deta hai — kyunki aapka vyaktigat anubhav classical niyamon se bhi mahatvapurna hai.' },
  { q: 'Kya yeh Gemstone Suitability Calculator free hai?', a: 'Haan, 100% free. Saare 9 ratna ka suitability score, risk aur verdict bilkul muft — koi upsell nahi.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) se Lahiri Ayanamsha ke saath aapka lagna, graha positions aur Shadbala exact nikaalta hai. Suitability logic classical Jyotish niyamon (functional benefic, Shadbala, dignity, bhaav, dasha) par aadharit hai — sirf sun-sign ya Mahadasha guesswork nahi.' },
];

export default function GemstoneSuitabilityPage() {
  const [result, setResult] = useState<EngineResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleData = (data: any) => {
    const engine = runEngine(data);
    setResult(engine);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const eligible = result?.stones.filter((s) => ['YK', 'B', 'b'].includes(s.gate) && (s.verdictKey === 'recommended' || s.verdictKey === 'trial')) ?? [];
  const primary = eligible[0] ?? null;
  const lifeStone = result ? result.stones.find((s) => s.graha === result.lagnaLord) ?? null : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': ORG_ID, name: 'Trikaal Vaani', legalName: 'Trikal Vaani', url: 'https://trikalvaani.com', sameAs: REAL_SAMEAS },
      { '@type': 'WebSite', '@id': WEBSITE_ID, name: 'Trikaal Vaani', url: 'https://trikalvaani.com', publisher: { '@id': ORG_ID }, inLanguage: 'en-IN' },
      { '@type': 'Person', '@id': AUTHOR_ID, name: 'Rohiit Gupta', url: 'https://trikalvaani.com', jobTitle: 'Chief Vedic Architect', worksFor: { '@id': ORG_ID },
        knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Gemstone Astrology (Ratna Vigyan)', 'Functional Benefic Analysis', 'Shadbala', 'Kundali Analysis'] },
      { '@type': 'WebPage', '@id': `${PAGE_URL}#webpage`, url: PAGE_URL,
        name: 'Free Gemstone Suitability Calculator — Should You Wear It? (0–100 Score)',
        description: 'Free Vedic gemstone suitability calculator. Scores all 9 ratna 0–100 using your Lagna functional benefics, Shadbala strength, dignity, house, dasha and afflictions — with risk and verdict.',
        inLanguage: 'en-IN', dateModified: '2026-06-15', isPartOf: { '@id': WEBSITE_ID }, author: { '@id': AUTHOR_ID }, publisher: { '@id': ORG_ID },
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
        about: [{ '@type': 'Thing', name: 'Gemstone Astrology' }, { '@type': 'Thing', name: 'Functional Benefic' }, { '@type': 'Thing', name: 'Shadbala' }],
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.tv-aeo-answer'] } },
      { '@type': 'BreadcrumbList', '@id': `${PAGE_URL}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
        { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
        { '@type': 'ListItem', position: 3, name: 'Free Gemstone Suitability Calculator', item: PAGE_URL },
      ] },
      { '@type': 'WebApplication', '@id': `${PAGE_URL}#app`, name: 'Free Gemstone Suitability Calculator', url: PAGE_URL,
        applicationCategory: 'LifestyleApplication', operatingSystem: 'All', browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, provider: { '@id': ORG_ID },
        featureList: 'Functional benefic gate, Shadbala strength, dignity, house, dasha, affliction & risk scoring for all 9 gemstones' },
      { '@type': 'HowTo', '@id': `${PAGE_URL}#howto`, name: 'How to check if a gemstone suits you',
        description: 'Check the Vedic suitability of all 9 gemstones from your birth details.', totalTime: 'PT1M',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Enter birth details', text: 'Enter your name, date, exact time and place of birth.' },
          { '@type': 'HowToStep', position: 2, name: 'Compute chart', text: 'The engine computes your ascendant, planetary Shadbala and dignities using Swiss Ephemeris with Lahiri Ayanamsha.' },
          { '@type': 'HowToStep', position: 3, name: 'Read suitability scores', text: 'Each gemstone gets a 0–100 suitability score with a risk level and a clear verdict.' },
        ] },
      { '@type': 'FAQPage', '@id': `${PAGE_URL}#faq`, mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link><span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link><span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Free Gemstone Suitability Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Gemstone Suitability Calculator — Should You Wear It?
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              Har ratna har kisi ke liye shubh nahi hota. <strong style={{ color: GOLD }}>Trikaal Vaani ka Gemstone Suitability Calculator</strong> aapke <strong style={{ color: GOLD }}>Lagna ke functional benefic/malefic</strong>, graha ki <strong>Shadbala strength</strong>, dignity, bhaav, dasha aur afflictions check karke har ratna ko <strong style={{ color: GOLD }}>0–100 suitability score</strong> deta hai — saath mein risk aur saaf verdict. Bilkul free, Swiss Ephemeris based.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Functional Benefic + Shadbala + Dignity + Dasha · Lahiri Ayanamsha</div>
            </div>
          </div>

          <GemstoneForm onData={handleData} />

          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">
              <div className="rounded-xl p-4 text-center text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <span className="text-slate-400">Lagna: </span><span style={{ color: GOLD }} className="font-semibold">{result.lagna}</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-slate-400">Lagna Swami: </span><span style={{ color: GOLD }} className="font-semibold">{result.lagnaLord}</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-slate-400">Mahadasha: </span><span style={{ color: GOLD }} className="font-semibold">{result.MD || '—'}</span>
              </div>

              {primary ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.4)}` }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Sabse Suitable Ratna</div>
                  <div className="text-5xl mb-2">💎</div>
                  <div className="text-3xl md:text-4xl font-serif font-bold mb-1" style={{ color: GOLD }}>{primary.stone_en} <span className="text-2xl text-slate-300">({primary.stone_hi})</span></div>
                  <div className="text-sm text-slate-300 mb-3">{primary.graha} ({primary.planet_hi}) ka ratna · Suitability <strong style={{ color: GOLD }}>{primary.score}/100</strong> · Verdict: <strong style={{ color: VERDICT_COLOR[primary.verdictKey].c }}>{primary.verdictLabel}</strong></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-left">
                    <DetailCell icon="🔗" label="Metal" value={primary.info.metal} />
                    <DetailCell icon="✋" label="Finger" value={primary.info.finger} />
                    <DetailCell icon="📅" label="Day" value={primary.info.day} />
                    <DetailCell icon="🕉️" label="Mantra" value={primary.info.mantra} />
                  </div>
                  {primary.info.upratna && (
                    <p className="mt-3 text-xs text-slate-400 text-left">
                      💠 <strong style={{ color: GOLD }}>Upratna (sasta / milder vikalp):</strong> {primary.info.upratna}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <div className="text-3xl mb-2">🛡️</div>
                  <p className="text-slate-200 font-semibold mb-1">Abhi koi ratna strongly suitable nahi.</p>
                  <p className="text-sm text-slate-400">Yeh achhi baat hai — hum aapko galat ratna nahi bechte. Aapke functional benefics is samay balheen ya afflicted hain. Niche poori ranking dekhein, aur poori kundali ke aadhar par expert salaah lein.</p>
                </div>
              )}

              <StoneScoreboard stones={result.stones} />

              {lifeStone && (
                <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}`, color: '#cbd5e1' }}>
                  ℹ️ <strong style={{ color: GOLD }}>Life Stone (Lagna Ratna):</strong> Aapke Lagna swami {result.lagnaLord} ka ratna <strong style={{ color: GOLD }}>{lifeStone.stone_en} ({lifeStone.stone_hi})</strong> — score {lifeStone.score}/100, verdict <strong style={{ color: VERDICT_COLOR[lifeStone.verdictKey].c }}>{lifeStone.verdictLabel}</strong>. Lagna ratna aam taur par sabse surakshit jeevan-bhar ka ratna mana jaata hai.
                </div>
              )}

              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-1 font-semibold">Sahi ratna ka faisla poori kundali maangta hai.</p>
                <p className="text-sm text-slate-400 mb-3">Combust, yoga aur poore bhaav-vishleshan ke saath apni complete kundali banayein — phir hi koi strong ratna dharan karein.</p>
                <Link href="/calculators/free-kundali-calculator" className="inline-block px-6 py-3 rounded-xl font-bold text-sm" style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.85) 0%,${GOLD} 100%)`, color: '#080B12' }}>
                  Free Poori Kundali Banayein →
                </Link>
              </div>
            </div>
          )}

          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Ratna Suitability Kaise Tay Hoti Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Zyadातर astrology sites sirf <strong>Lagna swami</strong> ya <strong>current Mahadasha</strong> dekh kar ratna bata dete hain. Yeh adhoora aur kabhi-kabhi khatarnaak hai. Vedic Jyotish mein sabse pehla niyam hai <strong style={{ color: GOLD }}>functional benefic</strong> — har graha kisi bhi Lagna ke liye <em>shubh (benefic)</em> ya <em>ashubh (malefic)</em> hota hai, jo uski bhaav-swamitva (house lordship) se tay hota hai. Ek functional malefic graha ka ratna, chahe wo graha exalted ya Mahadasha mein hi kyun na ho, aapke jeevan ke galat kshetra ko balshali karke nuksaan kar sakta hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Isliye Trikaal Vaani ka engine pehle <strong style={{ color: GOLD }}>gate</strong> lagata hai: functional malefic ka ratna reject. Phir benefic graha ke liye uski <strong>Shadbala</strong> (asli bal), <strong>dignity</strong>, <strong>bhaav sthiti</strong>, chalti <strong>dasha</strong>, aur <strong>afflictions</strong> ko jod-ghata kar 0–100 score banta hai. Doctrine seedhi hai — <strong style={{ color: GOLD }}>ratna ek balheen shubh graha ko mazboot karta hai</strong>; jo graha pehle se balwan hai, use ratna ki zaroorat nahi.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Gemstone Suitability</h2>
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
                { slug: 'free-gemstone-calculator', name: 'Lucky Gemstone' },
                { slug: 'free-should-i-wear-neelam', name: 'Should I Wear Neelam?' },
                { slug: 'free-should-i-wear-cats-eye', name: "Should I Wear Cat's Eye?" },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
              ].map((c) => (
                <Link key={c.slug} href={`/calculators/${c.slug}`} className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
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
