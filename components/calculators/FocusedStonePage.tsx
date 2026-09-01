'use client';

// ============================================================
// File: components/calculators/FocusedStonePage.tsx
// Reusable template for single-stone "Should I Wear X?" calculators.
// Each stone page (Neelam, Cat's Eye, ...) is just a config passed here.
// Uses the shared engine: lib/jyotish/gemstone.ts
//
// Version: v2.0 (31 Aug 2026) — shared keyword content for all nine stones
//   BASELINE, measured live 31 Aug across all nine pages: 480-654 words,
//   4 H2, and 24 links each — the 24 being header/footer nav only, i.e. ZERO
//   outbound content links. These were the thinnest pages on the site.
//   Supabase holds a 51-post gemstone cluster including a dedicated Hindi
//   "benefits + side effects" article for EVERY one of these nine stones,
//   plus 12 lagna-wise gemstone guides and 7 /learn/ references. Not one was
//   linked from here.
//   WHAT v2.0 ADDS, all in this one file so nine pages move together:
//     • RATNA_TABLE — the nine stones with finger, metal, day and upratna,
//       each linking to its own Hindi article. Answers "किस उंगली में पहने"
//       once instead of nine times.
//     • Five shared H2 sections covering the Radar E3 brief keywords, which
//       are identical for Pukhraj, Moti and Moonga and therefore for all
//       nine: pehnne ke niyam · nuksan · price · kise nahi pehnna · lagna-wise.
//     • LAGNA_GEM — 12 lagna-wise gemstone guides.
//     • A 10-link gemstone cluster block.
//     • SHARED_FAQS — 5 FAQs appended to every stone's own config.faqs, so
//       they also flow into the existing FAQPage schema with no config edits.
//   BACKWARD COMPATIBLE: FocusedStoneConfig is unchanged, so all nine
//   existing config files keep working untouched.
//   DELIBERATE OMISSION — no price numbers. A single figure would be
//   invented: the same stone varies up to fiftyfold on quality, weight,
//   origin and treatment. The pricing section explains the four drivers and
//   the certificate/synthetic scam instead, which is the honest answer and
//   also the one no competitor gives.
//   UNCHANGED: the engine call, GemstoneForm, StoneScoreboard, the result
//   block, the JSON-LD graph and its plain <script> emission (already
//   correct here — no next/script bug on these pages).
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

// ── v2.0 SHARED CONTENT ──────────────────────────────────────────────────────
// Everything below renders on ALL NINE stone pages from this one file. The nine
// pages measured 480–654 words with 4 H2 and zero outbound content links on
// 31 Aug 2026 — the 24 links each page reported were header/footer nav only.
// Supabase meanwhile holds a 51-post gemstone cluster, including a dedicated
// Hindi "benefits + side effects" article for every one of these nine stones,
// and not one was linked from here. Same orphaned-cluster pattern as the
// palmistry, property, foreign-spouse, swapna and kundali-milan pages.
//
// Keywords come from the Radar E3 content brief, which lists the same five
// questions for Pukhraj, Moti and Moonga and therefore for all nine:
//   • किन लोगों को नहीं पहनना चाहिए   • पहनने के नियम
//   • नुकसान                          • रत्न price
//   • किस उंगली में पहने
// These are answered ONCE here rather than nine times in the configs, so the
// per-stone configs stay small and the nine pages cannot drift apart.

type RatnaRow = {
  graha: string; hi: string; en: string;
  finger: string; metal: string; day: string; upratna: string;
  blogHi: string;
};

// Classical dharan data. Finger/metal/day follow the standard Parashari
// assignment; upratna are the conventional substitutes. Deliberately NO price
// column — see the pricing section for why a number would be dishonest here.
const RATNA_TABLE: RatnaRow[] = [
  { graha: 'Sun',     hi: 'माणिक्य',  en: 'Ruby',            finger: 'अनामिका', metal: 'सोना',        day: 'रविवार',    upratna: 'तामड़ा, लाल स्फटिक', blogHi: 'manik-ruby-benefits-side-effects-hindi' },
  { graha: 'Moon',    hi: 'मोती',     en: 'Pearl',           finger: 'कनिष्ठा', metal: 'चाँदी',       day: 'सोमवार',    upratna: 'चंद्रकांत, ओपल',      blogHi: 'moti-pearl-benefits-side-effects-hindi' },
  { graha: 'Mars',    hi: 'मूंगा',    en: 'Red Coral',       finger: 'अनामिका', metal: 'सोना/ताँबा',  day: 'मंगलवार',   upratna: 'लाल हकीक',            blogHi: 'moonga-red-coral-benefits-side-effects-hindi' },
  { graha: 'Mercury', hi: 'पन्ना',    en: 'Emerald',         finger: 'कनिष्ठा', metal: 'सोना/चाँदी',  day: 'बुधवार',    upratna: 'हरा गोमेद, ओनेक्स',   blogHi: 'panna-emerald-benefits-side-effects-hindi' },
  { graha: 'Jupiter', hi: 'पुखराज',   en: 'Yellow Sapphire', finger: 'तर्जनी',  metal: 'सोना',        day: 'गुरुवार',   upratna: 'सुनहला, पीला पुखराज', blogHi: 'pukhraj-yellow-sapphire-benefits-side-effects-hindi' },
  { graha: 'Venus',   hi: 'हीरा',     en: 'Diamond',         finger: 'मध्यमा',  metal: 'चाँदी/प्लैटिनम', day: 'शुक्रवार', upratna: 'सफेद पुखराज, जरकन',  blogHi: 'heera-diamond-benefits-side-effects-hindi' },
  { graha: 'Saturn',  hi: 'नीलम',     en: 'Blue Sapphire',   finger: 'मध्यमा',  metal: 'चाँदी/पंचधातु', day: 'शनिवार',  upratna: 'लाजवर्त, नीली',       blogHi: 'neelam-blue-sapphire-benefits-side-effects-hindi' },
  { graha: 'Rahu',    hi: 'गोमेद',    en: 'Hessonite',       finger: 'मध्यमा',  metal: 'चाँदी',       day: 'शनिवार',    upratna: 'साफी, तुरसावा',       blogHi: 'gomed-hessonite-benefits-side-effects-hindi' },
  { graha: 'Ketu',    hi: 'लहसुनिया', en: "Cat's Eye",       finger: 'मध्यमा',  metal: 'चाँदी',       day: 'शनिवार',    upratna: 'गोदंती, सिंदूरिया',   blogHi: 'lehsunia-cats-eye-benefits-side-effects-hindi' },
];

const LAGNA_GEM = [
  { r: 'aries', hi: 'मेष' }, { r: 'taurus', hi: 'वृषभ' }, { r: 'gemini', hi: 'मिथुन' },
  { r: 'cancer', hi: 'कर्क' }, { r: 'leo', hi: 'सिंह' }, { r: 'virgo', hi: 'कन्या' },
  { r: 'libra', hi: 'तुला' }, { r: 'scorpio', hi: 'वृश्चिक' }, { r: 'sagittarius', hi: 'धनु' },
  { r: 'capricorn', hi: 'मकर' }, { r: 'aquarius', hi: 'कुंभ' }, { r: 'pisces', hi: 'मीन' },
];

// FAQs appended to every stone's own config.faqs. They also feed the FAQPage
// schema, so the nine pages gain these five entries without touching configs.
const SHARED_FAQS = [
  {
    q: 'रत्न किस उंगली में पहनना चाहिए?',
    a: 'ग्रह के अनुसार: माणिक्य और मूंगा अनामिका में, मोती और पन्ना कनिष्ठा में, पुखराज तर्जनी में, और हीरा, नीलम, गोमेद व लहसुनिया मध्यमा में। धातु भी ग्रह से तय होती है। पूरी तालिका इसी पेज पर ऊपर दी गई है। पर याद रखिए — सही उंगली तभी मायने रखती है जब रत्न आपकी कुंडली के लिए सही हो; गलत रत्न सही उंगली में भी गलत ही रहता है।',
  },
  {
    q: 'रत्न पहनने के नियम क्या हैं?',
    a: 'पाँच नियम: सही ग्रह का रत्न कुंडली से तय हो; कम से कम वज़न (आमतौर पर 3 रत्ती से ऊपर, पर यह कुंडली और रत्न पर निर्भर) हो; रत्न त्वचा से स्पर्श करे, इसलिए नीचे से खुली अंगूठी बनवाई जाती है; उस ग्रह के दिन, शुक्ल पक्ष में, सूर्योदय के बाद धारण करें; और दूध, गंगाजल या पंचामृत से शुद्ध करके मंत्र जाप के बाद पहनें। सबसे ज़रूरी नियम इनमें से कोई नहीं — वह है तीन दिन का ट्रायल।',
  },
  {
    q: 'रत्न के नुकसान क्या हो सकते हैं?',
    a: 'गलत रत्न असली नुकसान करता है, और यह अंधविश्वास नहीं — तर्क सीधा है। रत्न उस ग्रह की ऊर्जा बढ़ाता है। अगर वह ग्रह आपकी कुंडली में कष्टकारी है, तो आप कष्ट ही बढ़ा रहे हैं। सबसे आम शिकायतें: नींद न आना, चिड़चिड़ापन, बेचैनी, और उसी क्षेत्र में अचानक समस्याएँ जिसका वह ग्रह कारक है। इसीलिए तीन दिन का ट्रायल अनिवार्य है — और अगर परेशानी हो तो तुरंत उतार दें।',
  },
  {
    q: 'रत्न की कीमत कितनी होती है?',
    a: 'हम कोई एक कीमत नहीं बताते, और यह जानबूझकर है। एक ही रत्न की कीमत गुणवत्ता, वज़न, खान और प्रमाणन के हिसाब से पचास गुना तक बदलती है — इसलिए जो कोई एक नंबर बता दे, वह बेच रहा है। कीमत चार चीजों से तय होती है: रत्ती (वज़न), रंग और चमक, खान (जैसे बर्मा, श्रीलंका, कश्मीर), और उपचार हुआ है या नहीं। सबसे ज़रूरी बात: लैब सर्टिफिकेट के बिना कभी मत खरीदिए, और त्रिकाल वाणी रत्न बेचता ही नहीं।',
  },
  {
    q: 'क्या उपरत्न पहन सकते हैं?',
    a: 'हाँ, और यह अक्सर बेहतर शुरुआत होती है। हर मुख्य रत्न का एक उपरत्न होता है जो सस्ता और असर में हल्का होता है — जैसे पुखराज की जगह सुनहला, नीलम की जगह लाजवर्त। हल्का असर एक कमी नहीं, एक सुरक्षा है: अगर रत्न आपको सूट नहीं करता तो नुकसान भी कम होगा। महँगा रत्न खरीदने से पहले कुछ महीने उपरत्न आज़माना व्यावहारिक तरीका है।',
  },
];

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

  // v2.0 — stone-specific FAQs first, then the five shared ones. Used by the
  // FAQPage schema AND the visible accordion, so both stay in sync.
  const allFaqs = [...config.faqs, ...SHARED_FAQS];

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
      { '@type': 'FAQPage', '@id': `${PAGE_URL}#faq`, mainEntity: allFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
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
                {target.gate !== 'M' && target.info.upratna && (
                  <p className="mt-3 text-xs text-slate-400 text-left">
                    💠 <strong style={{ color: GOLD }}>Upratna (sasta / milder vikalp):</strong> {target.info.upratna}
                  </p>
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

          {/* ═══ v2.0: SHARED KEYWORD SECTIONS — all nine stone pages ═══ */}
          <section className="mt-14">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>
              कौन सा रत्न किस उंगली में पहनें — पूरी तालिका
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              उंगली, धातु और दिन — तीनों ग्रह से तय होते हैं, आपकी पसंद से नहीं। नीचे नौ रत्नों की
              पूरी शास्त्रीय तालिका है, साथ में हर रत्न का <strong style={{ color: GOLD }}>उपरत्न</strong> भी,
              जो सस्ता और असर में हल्का विकल्प होता है।
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}`, borderRadius: '12px' }}>
                <caption className="sr-only">नौ रत्न — ग्रह, उंगली, धातु, दिन और उपरत्न</caption>
                <thead>
                  <tr style={{ background: GOLD_RGBA(0.1) }}>
                    <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>रत्न</th>
                    <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>ग्रह</th>
                    <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>उंगली</th>
                    <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>धातु</th>
                    <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>दिन</th>
                    <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>उपरत्न</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {RATNA_TABLE.map((r) => {
                    const me = r.graha === config.graha;
                    return (
                      <tr key={r.graha} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: me ? GOLD_RGBA(0.07) : undefined }}>
                        <td className="p-2.5 font-semibold" style={{ color: GOLD }}>
                          <Link href={`/blog/${r.blogHi}`} className="underline underline-offset-2 hover:opacity-80">{r.hi}</Link>
                          <span className="text-slate-500 font-normal"> ({r.en})</span>
                          {me && <span className="ml-1" title="यह पेज">←</span>}
                        </td>
                        <td className="p-2.5">{r.graha}</td>
                        <td className="p-2.5">{r.finger}</td>
                        <td className="p-2.5">{r.metal}</td>
                        <td className="p-2.5">{r.day}</td>
                        <td className="p-2.5 text-slate-400">{r.upratna}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500">
              रत्न के नाम पर क्लिक करके उसके फायदे और नुकसान का पूरा लेख पढ़ सकते हैं।
              सही उंगली तभी मायने रखती है जब रत्न आपकी कुंडली के लिए सही हो — गलत रत्न सही उंगली में भी गलत ही रहता है।
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-12" style={{ color: GOLD }}>
              रत्न पहनने के नियम — धारण विधि
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              शास्त्रीय विधि पाँच नियमों की है, और वे क्रम से हैं:
            </p>
            <ol className="mb-4 space-y-2.5 text-[15px] text-slate-300 list-decimal pl-5">
              <li><strong style={{ color: GOLD }}>सही ग्रह का रत्न</strong> — यह कुंडली से तय होता है, राशि से नहीं और हथेली से बिल्कुल नहीं।</li>
              <li><strong style={{ color: GOLD }}>पर्याप्त वज़न</strong> — बहुत हल्का रत्न असर नहीं करता। न्यूनतम वज़न रत्न और कुंडली दोनों पर निर्भर है, इसलिए कोई एक संख्या सबके लिए सही नहीं।</li>
              <li><strong style={{ color: GOLD }}>त्वचा से स्पर्श</strong> — अंगूठी नीचे से खुली बनवाई जाती है ताकि रत्न त्वचा को छुए।</li>
              <li><strong style={{ color: GOLD }}>सही दिन और समय</strong> — उस ग्रह के दिन, शुक्ल पक्ष में, सूर्योदय के बाद।</li>
              <li><strong style={{ color: GOLD }}>शुद्धिकरण</strong> — दूध, गंगाजल या पंचामृत में रखकर, ग्रह के मंत्र जाप के बाद धारण।</li>
            </ol>
            <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <p className="text-sm text-slate-300 m-0">
                <strong style={{ color: '#FCA5A5' }}>और छठा नियम, जो सबसे ज़रूरी है और सबसे कम बताया जाता है — तीन दिन का ट्रायल।</strong>{' '}
                कोई भी रत्न पहले तीन दिन आज़मा कर देखिए। अगर नींद बिगड़े, बेचैनी हो, चिड़चिड़ापन बढ़े या उसी क्षेत्र में
                अचानक दिक्कतें आएँ जिसका वह ग्रह कारक है — <strong>तुरंत उतार दीजिए।</strong> यह नियम इसलिए
                महत्वपूर्ण है क्योंकि यह इकलौता ऐसा है जिसे आप खुद जाँच सकते हैं, किसी पर भरोसा किए बिना।
              </p>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              पूरी विधि, मंत्र सहित, <Link href="/blog/gemstone-wearing-rules-practical-guide-hindi" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>रत्न धारण के नियम</Link> में है,
              और अंग्रेज़ी में <Link href="/learn/how-to-wear-gemstone-vedic" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>How to wear a gemstone</Link> पर।
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-12" style={{ color: GOLD }}>
              रत्न के नुकसान — और वे किसे होते हैं
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              यह हिस्सा सबसे ज़रूरी है, क्योंकि रत्न बेचने वाला इसे कभी नहीं बताता।{' '}
              <strong style={{ color: GOLD }}>गलत रत्न सचमुच नुकसान करता है</strong>, और इसका तर्क अंधविश्वास नहीं —
              बिल्कुल सीधा है: रत्न उस ग्रह की ऊर्जा <em>बढ़ाता</em> है। अगर वह ग्रह आपकी कुंडली में कष्टकारी है,
              तो आप कष्ट ही बढ़ा रहे हैं। दवा सही हो तो ठीक करती है; गलत हो तो बीमार करती है — रत्न उससे अलग नहीं।
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              सबसे आम शिकायतें जो लोग बताते हैं: <strong>नींद न आना, बेचैनी, चिड़चिड़ापन</strong>, और
              उसी क्षेत्र में अचानक समस्याएँ जिसका वह ग्रह कारक है। ये आमतौर पर पहले कुछ दिनों में ही दिखने लगती हैं —
              इसीलिए तीन दिन का ट्रायल इतना काम का है।
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              और एक बात जो लगभग कोई नहीं कहता: <strong style={{ color: GOLD }}>मज़बूत ग्रह को रत्न की ज़रूरत ही नहीं होती।</strong>{' '}
              रत्न कमज़ोर पर शुभ ग्रह को सहारा देने के लिए है। जो ग्रह पहले से बलवान है, उसे और बढ़ाना
              संतुलन बिगाड़ सकता है। पूरा तर्क{' '}
              <Link href="/learn/strong-planets-dont-need-gemstones" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Strong planets don&apos;t need gemstones</Link>{' '}
              में है, और नुकसान का विस्तार{' '}
              <Link href="/blog/why-wrong-gemstone-can-harm-you-hindi" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>गलत रत्न कैसे नुकसान करता है</Link> में।
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-12" style={{ color: GOLD }}>
              रत्न की कीमत — और हम एक नंबर क्यों नहीं बताते
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              यहाँ हम जानबूझकर कोई कीमत नहीं दे रहे, और वजह बता देना ही सबसे उपयोगी जवाब है।{' '}
              <strong style={{ color: GOLD }}>एक ही रत्न की कीमत पचास गुना तक बदल सकती है</strong> —
              इसलिए जो कोई एक नंबर बता दे, वह जानकारी नहीं दे रहा, वह बेच रहा है।
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">कीमत चार चीजों से तय होती है:</p>
            <ul className="mb-4 space-y-2 text-[15px] text-slate-300 list-disc pl-5">
              <li><strong style={{ color: GOLD }}>रत्ती (वज़न)</strong> — और कीमत सीधी रेखा में नहीं बढ़ती; बड़े पत्थर अनुपात से कहीं ज़्यादा महँगे होते हैं।</li>
              <li><strong style={{ color: GOLD }}>रंग, चमक और साफ़ता</strong> — यही सबसे बड़ा अंतर पैदा करता है।</li>
              <li><strong style={{ color: GOLD }}>खान</strong> — बर्मा, श्रीलंका या कश्मीर जैसे मूल की कीमत कई गुना ज़्यादा होती है।</li>
              <li><strong style={{ color: GOLD }}>उपचार (treatment)</strong> — गर्म किया हुआ या भरा हुआ पत्थर बहुत सस्ता होता है, और यह सर्टिफिकेट में लिखा होना चाहिए।</li>
            </ul>
            <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(212,175,55,0.07)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
              <p className="text-sm text-slate-300 m-0">
                <strong style={{ color: GOLD }}>खरीदने से पहले तीन बातें।</strong>{' '}
                एक — <strong>लैब सर्टिफिकेट के बिना कभी मत खरीदिए</strong>; काँच और सिंथेटिक पत्थर असली बताकर बेचना
                इस बाज़ार की सबसे आम ठगी है। दो — <strong>&ldquo;अभिमंत्रित&rdquo; या &ldquo;सिद्ध&rdquo; कहकर लगाया गया अतिरिक्त दाम
                शास्त्र में कहीं नहीं है</strong>; मंत्र जाप आप स्वयं कर सकते हैं। तीन — पहले{' '}
                <Link href="/blog/upratna-substitute-gemstone-guide-hindi" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>उपरत्न</Link>{' '}
                आज़मा लीजिए, जो सस्ता है और असर में हल्का — यानी गलत निकले तो नुकसान भी कम।
              </p>
              <p className="text-sm text-slate-400 mt-3 mb-0">
                और साफ कह दें: <strong>त्रिकाल वाणी रत्न बेचता नहीं है।</strong> इस पेज पर आपको जो सलाह मिल रही है,
                उसमें हमारा कोई आर्थिक हित नहीं है।
              </p>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-12" style={{ color: GOLD }}>
              किन लोगों को रत्न नहीं पहनना चाहिए
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              कुछ स्थितियाँ ऐसी हैं जिनमें कोई भी रत्न पहनने से पहले रुक जाना चाहिए — चाहे ऊपर आपका स्कोर कितना भी अच्छा हो:
            </p>
            <ul className="mb-4 space-y-2.5 text-[15px] text-slate-300 list-disc pl-5">
              <li><strong style={{ color: GOLD }}>जब जन्म समय पता न हो</strong> — लग्न ही तय नहीं होगा, और लग्न के बिना कौन सा ग्रह शुभ है यह तय नहीं हो सकता। पहले जन्म समय खोजिए।</li>
              <li><strong style={{ color: GOLD }}>जब वह ग्रह आपके लग्न के लिए कष्टकारी हो</strong> — यही सबसे आम गलती है। हर ग्रह हर लग्न के लिए शुभ नहीं होता।</li>
              <li><strong style={{ color: GOLD }}>जब ग्रह पहले से बलवान हो</strong> — सहारे की ज़रूरत ही नहीं है।</li>
              <li><strong style={{ color: GOLD }}>एक साथ कई रत्न</strong> — विरोधी ग्रहों के रत्न साथ पहनना आम गलती है, और असर एक-दूसरे को काट देता है।</li>
              <li><strong style={{ color: GOLD }}>किसी और की सलाह पर</strong> — पिता या भाई को जो रत्न सूट करता है, वह आपको सूट करे यह ज़रूरी नहीं; लग्न अलग तो रत्न अलग।</li>
              <li><strong style={{ color: GOLD }}>डर में आकर</strong> — अगर कोई कह रहा है &ldquo;यह नहीं पहना तो नुकसान होगा&rdquo;, तो वह शास्त्र नहीं, बिक्री है।</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mb-4">
              कौन सा ग्रह आपके लग्न के लिए शुभ है, यह{' '}
              <Link href="/learn/functional-benefic-malefic-gemstone" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>functional benefic</Link>{' '}
              सिद्धांत से तय होता है — और वही ऊपर वाला कैलकुलेटर इस्तेमाल करता है।
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-12" style={{ color: GOLD }}>
              अपने लग्न के अनुसार रत्न देखें
            </h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              हर लग्न के लिए कौन से रत्न शुभ हैं और कौन से वर्जित — बारहों लग्न पर अलग लेख:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-4">
              {LAGNA_GEM.map((l) => (
                <Link key={l.r} href={`/blog/best-gemstones-for-${l.r}-lagna-hindi`}
                  className="p-2.5 rounded-xl text-center text-sm transition-all hover:opacity-90"
                  style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}`, color: GOLD }}>
                  {l.hi} लग्न
                </Link>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              अपना लग्न नहीं पता? <Link href="/calculators/free-kundali-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>मुफ्त कुंडली</Link>{' '}
              बनाइए — लग्न, ग्रह और दशा तीनों मिल जाएँगे।
            </p>
          </section>

          {/* ═══ v2.0: the 51-post gemstone cluster ═══ */}
          <section className="mt-14">
            <h2 className="text-2xl font-serif font-bold mb-3" style={{ color: GOLD }}>रत्न ज्योतिष — पूरा गाइड</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              खरीदने से पहले कम से कम पहले दो लेख पढ़ लीजिए — वे सबसे ज़्यादा पैसा बचाते हैं।
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                { href: '/blog/why-wrong-gemstone-can-harm-you-hindi', label: 'गलत रत्न कैसे नुकसान करता है', note: 'पहले यही पढ़िए' },
                { href: '/learn/strong-planets-dont-need-gemstones', label: 'मज़बूत ग्रह को रत्न नहीं चाहिए', note: 'सबसे कम बताई जाने वाली बात' },
                { href: '/blog/which-gemstone-should-i-wear-hindi', label: 'मुझे कौन सा रत्न पहनना चाहिए?', note: 'पूरी विधि' },
                { href: '/blog/gemstone-wearing-rules-practical-guide-hindi', label: 'रत्न धारण के नियम', note: 'दिन, धातु, मंत्र, ट्रायल' },
                { href: '/blog/upratna-substitute-gemstone-guide-hindi', label: 'उपरत्न — सस्ता विकल्प', note: 'शुरुआत यहाँ से करें' },
                { href: '/blog/gemstone-faq-vedic-astrology-hindi', label: 'रत्न — सामान्य प्रश्न', note: 'बाकी सब सवाल' },
                { href: '/learn/functional-benefic-malefic-gemstone', label: 'Functional benefic aur malefic', note: 'कौन सा ग्रह आपके लिए शुभ' },
                { href: '/learn/life-stone-lagna-ratna', label: 'जीवन रत्न (लग्न रत्न)', note: 'सबसे सुरक्षित रत्न' },
                { href: '/learn/lab-grown-synthetic-gemstone-vedic-astrology', label: 'Lab-grown aur synthetic ratna', note: 'क्या वे काम करते हैं?' },
                { href: '/learn/gemstone-astrology-vedic', label: 'Gemstone astrology — reference', note: 'पूरा शास्त्रीय आधार' },
              ].map((i) => (
                <Link key={i.href} href={i.href} className="block rounded-xl px-4 py-3 transition hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="block text-sm font-semibold" style={{ color: GOLD }}>{i.label}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{i.note}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions</h2>
            <div className="space-y-3">
              {allFaqs.map((faq, i) => (
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
