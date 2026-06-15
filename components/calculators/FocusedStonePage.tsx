'use client';

// ============================================================
// File: components/calculators/FocusedStonePage.tsx
// Reusable template for single-stone "Should I Wear X?" calculators.
// Each stone page (Neelam, Cat's Eye, ...) is just a config passed here.
// Uses the shared engine: lib/jyotish/gemstone.ts
// ============================================================

import { useState, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import GemstoneForm from '@/components/calculators/GemstoneForm';
import { StoneScoreboard, DetailCell } from '@/components/calculators/StoneScoreboard';
import { runEngine, reasonHi, STONE, VERDICT_COLOR, type EngineResult } from '@/lib/jyotish/gemstone';

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

export interface FocusedStoneConfig {
  graha: string;        // e.g. 'Saturn'
  slug: string;         // e.g. 'free-should-i-wear-neelam'
  h1: string;           // visible H1
  schemaName: string;   // schema/title name
  description: string;  // meta description
  directAnswer: ReactNode;
  guidance: ReactNode;  // "kisko pehnna chahiye" static content block
  faqs: { q: string; a: string }[];
}

export default function FocusedStonePage({ config }: { config: FocusedStoneConfig }) {
  const [result, setResult] = useState<EngineResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const PAGE_URL = `https://trikalvaani.com/calculators/${config.slug}`;
  const stoneInfo = STONE[config.graha];

  const handleData = (data: any) => {
    setResult(runEngine(data));
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const target = result ? result.stones.find((s) => s.graha === config.graha) ?? null : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': ORG_ID, name: 'Trikaal Vaani', legalName: 'Trikal Vaani', url: 'https://trikalvaani.com', sameAs: REAL_SAMEAS },
      { '@type': 'WebSite', '@id': WEBSITE_ID, name: 'Trikaal Vaani', url: 'https://trikalvaani.com', publisher: { '@id': ORG_ID }, inLanguage: 'en-IN' },
      { '@type': 'Person', '@id': AUTHOR_ID, name: 'Rohiit Gupta', url: 'https://trikalvaani.com', jobTitle: 'Chief Vedic Architect', worksFor: { '@id': ORG_ID },
        knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Gemstone Astrology (Ratna Vigyan)', 'Functional Benefic Analysis', 'Shadbala'] },
      { '@type': 'WebPage', '@id': `${PAGE_URL}#webpage`, url: PAGE_URL, name: config.schemaName, description: config.description,
        inLanguage: 'en-IN', dateModified: '2026-06-15', isPartOf: { '@id': WEBSITE_ID }, author: { '@id': AUTHOR_ID }, publisher: { '@id': ORG_ID },
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
        about: [{ '@type': 'Thing', name: `${stoneInfo.en} (${config.graha})` }, { '@type': 'Thing', name: 'Functional Benefic' }],
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.tv-aeo-answer'] } },
      { '@type': 'BreadcrumbList', '@id': `${PAGE_URL}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
        { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
        { '@type': 'ListItem', position: 3, name: config.schemaName, item: PAGE_URL },
      ] },
      { '@type': 'WebApplication', '@id': `${PAGE_URL}#app`, name: config.schemaName, url: PAGE_URL,
        applicationCategory: 'LifestyleApplication', operatingSystem: 'All', browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, provider: { '@id': ORG_ID } },
      { '@type': 'FAQPage', '@id': `${PAGE_URL}#faq`, mainEntity: config.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
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
            <span style={{ color: GOLD }}>{config.h1}</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>{config.h1}</h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">{config.directAnswer}</p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Functional Benefic + Shadbala · Lahiri Ayanamsha</div>
            </div>
          </div>

          <GemstoneForm
            heading={`Check If ${stoneInfo.en} (${stoneInfo.hi}) Suits You — Free`}
            submitLabel={`💎 Check If ${stoneInfo.hi} Suits Me`}
            onData={handleData}
          />

          {result && target && (
            <div ref={resultRef} className="mt-8 space-y-6">
              <div className="rounded-xl p-4 text-center text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <span className="text-slate-400">Lagna: </span><span style={{ color: GOLD }} className="font-semibold">{result.lagna}</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-slate-400">Lagna Swami: </span><span style={{ color: GOLD }} className="font-semibold">{result.lagnaLord}</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-slate-400">Mahadasha: </span><span style={{ color: GOLD }} className="font-semibold">{result.MD || '—'}</span>
              </div>

              {/* TARGET VERDICT */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, ${VERDICT_COLOR[target.verdictKey].bg} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${VERDICT_COLOR[target.verdictKey].c}66` }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Aapke liye {target.stone_hi}</div>
                <div className="text-5xl mb-2">💎</div>
                <div className="text-3xl md:text-4xl font-serif font-bold mb-1" style={{ color: GOLD }}>{target.stone_en} <span className="text-2xl text-slate-300">({target.stone_hi})</span></div>
                <div className="text-4xl font-bold my-2" style={{ color: VERDICT_COLOR[target.verdictKey].c }}>{target.score}<span className="text-xl text-slate-400">/100</span></div>
                <div className="inline-block text-sm font-semibold px-3 py-1.5 rounded-lg mb-4" style={{ background: VERDICT_COLOR[target.verdictKey].bg, color: VERDICT_COLOR[target.verdictKey].c }}>
                  Verdict: {target.verdictLabel}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed text-left max-w-2xl mx-auto mb-4">{reasonHi(target, result.lagna)}</p>
                {target.gate !== 'M' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                    <DetailCell icon="🔗" label="Metal" value={target.info.metal} />
                    <DetailCell icon="✋" label="Finger" value={target.info.finger} />
                    <DetailCell icon="📅" label="Day" value={target.info.day} />
                    <DetailCell icon="🕉️" label="Mantra" value={target.info.mantra} />
                  </div>
                )}
                {target.risk >= 15 && (
                  <div className="mt-4 text-xs rounded-lg p-3 text-left" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                    ⚠️ Yeh ek strong ratna hai. Score chahe jo ho, ise bina jaankaar astrologer ki salaah aur 3-din trial ke NA pehnein.
                  </div>
                )}
              </div>

              {/* full ranking for context, target highlighted */}
              <StoneScoreboard stones={result.stones} highlight={config.graha} />

              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-1 font-semibold">Faisla poori kundali maangta hai.</p>
                <p className="text-sm text-slate-400 mb-3">Combust, yoga aur poore bhaav-vishleshan ke saath apni complete kundali banayein — phir hi dharan karein.</p>
                <Link href="/calculators/free-kundali-calculator" className="inline-block px-6 py-3 rounded-xl font-bold text-sm" style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.85) 0%,${GOLD} 100%)`, color: '#080B12' }}>
                  Free Poori Kundali Banayein →
                </Link>
              </div>
            </div>
          )}

          {/* STATIC GUIDANCE */}
          <section className="mt-16 prose prose-invert max-w-none">{config.guidance}</section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions</h2>
            <div className="space-y-3">
              {config.faqs.map((faq, i) => (
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
                { slug: 'free-gemstone-suitability-calculator', name: 'Gemstone Suitability (All 9)' },
                { slug: 'free-should-i-wear-neelam', name: 'Should I Wear Neelam?' },
                { slug: 'free-should-i-wear-cats-eye', name: "Should I Wear Cat's Eye?" },
                { slug: 'free-gemstone-calculator', name: 'Lucky Gemstone' },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
              ].filter((c) => c.slug !== config.slug).map((c) => (
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
