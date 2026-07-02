// 🔱 TRIKAAL VAANI | app/swapna/page.tsx | v1.0
// Owner: Rohiit Gupta, Chief Vedic Architect
// Swapna Shastra — Vedic Dream Decoding hub (server component / SEO body)
// ----------------------------------------------------------------------------
// Pattern matches app/page.tsx: server component owns metadata + JSON-LD + all
// static SEO/GEO/AEO/EEAT content; the interactive funnel lives in the client
// component <SwapnaClient/> (app/swapna/SwapnaClient.tsx).
// Free reading = table meaning (Flash). Paid ₹51 = chart overlay (Component 6).
// ----------------------------------------------------------------------------

import type { Metadata } from 'next';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import SwapnaClient from './SwapnaClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Swapna Shastra | Free Vedic Dream Meaning & Interpretation — Trikaal Vaani',
  description:
    "Free Vedic dream interpretation (Swapna Shastra). Decode your dream's symbol instantly, then unlock a personal reading against your birth chart & dasha. By Rohiit Gupta, Chief Vedic Architect.",
  keywords: [
    'swapna shastra', 'dream meaning in hindi', 'vedic dream interpretation',
    'sapne ka matlab', 'saap ka sapna', 'dream astrology', 'swapna phal',
  ],
  alternates: {
    canonical: 'https://trikalvaani.com/swapna',
    languages: {
      'en-IN': 'https://trikalvaani.com/swapna',
      'hi-IN': 'https://trikalvaani.com/hi/swapna',
    },
  },
  openGraph: {
    title: 'Swapna Shastra | Free Vedic Dream Meaning & Interpretation — Trikaal Vaani',
    description:
      "Decode your dream's classical meaning free, then read it against your own birth chart & planetary period. Guided by Rohiit Gupta, Chief Vedic Architect.",
    url: 'https://trikalvaani.com/swapna',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikaal Vaani',
    images: [
      {
        url: 'https://trikalvaani.com/og-swapna.jpg',
        width: 1200,
        height: 630,
        alt: 'Swapna Shastra — Vedic Dream Decoding by Trikaal Vaani',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swapna Shastra | Free Vedic Dream Meaning — Trikaal Vaani',
    description:
      "Decode your dream's classical meaning free, then read it against your own chart & dasha.",
    images: ['https://trikalvaani.com/og-swapna.jpg'],
  },
};

// ── brand palette (matches app/page.tsx) ────────────────────────────────────
const C = {
  night: '#080B12',
  panel: 'rgba(11,16,26,0.7)',
  panel2: '#0E141F',
  gold: '#D4AF37',
  goldDeep: '#A8820A',
  goldLite: '#F0D68A',
  goldSoft: 'rgba(212,175,55,0.55)',
  line: 'rgba(212,175,55,0.14)',
  line2: 'rgba(212,175,55,0.26)',
  s3: '#CBD5E1',
  s4: '#94A3B8',
  s5: '#64748B',
};

// ── data ────────────────────────────────────────────────────────────────────
const COMMON_DREAMS = [
  { href: '/swapna/snake', ic: '🐍', en: 'Snake', hn: 'साँप का सपना' },
  { href: '/swapna/water', ic: '🌊', en: 'Water', hn: 'पानी का सपना' },
  { href: '/swapna/teeth', ic: '🦷', en: 'Teeth falling', hn: 'दाँत टूटना' },
  { href: '/swapna/own_death', ic: '🕯️', en: 'Death', hn: 'मृत्यु का सपना' },
  { href: '/swapna/deceased_relative', ic: '👤', en: 'A deceased loved one', hn: 'मृत स्वजन' },
  { href: '/swapna/falling', ic: '🌀', en: 'Falling', hn: 'गिरना' },
  { href: '/swapna/gold', ic: '🪙', en: 'Gold', hn: 'सोना' },
  { href: '/swapna/deity_general', ic: '🛕', en: 'A deity', hn: 'भगवान के दर्शन' },
  { href: '/swapna/wedding', ic: '💍', en: 'A wedding', hn: 'शादी का सपना' },
  { href: '/swapna/flying', ic: '🕊️', en: 'Flying', hn: 'उड़ना' },
  { href: '/swapna/pregnancy', ic: '🤰', en: 'Pregnancy', hn: 'गर्भ का सपना' },
  { href: '/swapna/fire', ic: '🔥', en: 'Fire', hn: 'आग का सपना' },
];

const REALMS = [
  { href: '/swapna/category/snake', label: '🐍 Serpents', hn: 'सर्प' },
  { href: '/swapna/category/death', label: '🕯️ Death & ancestors', hn: 'मृत्यु' },
  { href: '/swapna/category/deity', label: '🛕 Deities', hn: 'देवता' },
  { href: '/swapna/category/water', label: '🌊 Water', hn: 'जल' },
  { href: '/swapna/category/body', label: '🧍 The body', hn: 'शरीर' },
  { href: '/swapna/category/animal', label: '🦌 Animals', hn: 'पशु' },
  { href: '/swapna/category/conflict', label: '⚔️ Conflict', hn: 'संघर्ष' },
  { href: '/swapna/category/life_event', label: '💍 Life events', hn: 'जीवन-घटनाएँ' },
  { href: '/swapna/category/celestial', label: '☀️ Sky & elements', hn: 'आकाश' },
  { href: '/swapna/category/food', label: '🍚 Food', hn: 'भोजन' },
  { href: '/swapna/category/sexual', label: '❤️ Intimacy', hn: 'निकटता' },
  { href: '/swapna/category/bodily_function', label: '💧 Body signs', hn: 'शारीरिक' },
];

const SOURCES = [
  { t: 'Svapna Cintāmaṇi', d: 'Jagaddeva — the canonical treatise on dream interpretation.' },
  { t: 'Bṛhat Jātaka', d: 'Varāhamihira — dreams read against the individual\'s chart & dasha.' },
  { t: 'Agni & Matsya Purāṇa', d: 'Classical svapna-adhyāyas on auspicious & inauspicious dreams.' },
  { t: 'Atharvaveda · Sushruta', d: 'Vedic dream hymns and the Āyurvedic classification of dreams.' },
];

const FAQS = [
  { q: 'Are dreams really meaningful in Vedic astrology?', a: 'Yes. Texts like the Svapna Cintāmaṇi and passages in the Agni and Matsya Purāṇas treat dreams as symbolic signals, with meaning further shaped by the dreamer\'s own chart and planetary period.' },
  { q: 'Is the free dream meaning accurate?', a: 'The free reading gives the authentic classical meaning of your dream\'s symbol, straight from the tradition — the universal meaning, true for anyone who dreams it.' },
  { q: 'What does the ₹51 personal reading add?', a: 'It reads your dream against your own birth chart — your running dasha, any linked yoga or dosha, and the exact life-area it touches — with a remedy shaped to you. That is the part no free tool can give.' },
  { q: 'Do I need my birth details for the free reading?', a: 'No. The free dream meaning needs only your dream. Birth details (name, date, time, place) are asked only if you choose the ₹51 personal reading.' },
  { q: 'What does it mean to see a snake in a dream?', a: 'In Swapna Shastra a snake often signals a hidden matter or concealed adversary, though a bite can be auspicious and a snake entering the home can point to wealth. The exact reading depends on colour, action and your chart.' },
  { q: 'Why do some dreams come true and others don\'t?', a: 'The tradition weighs the hour of the dream. A dream in the Brahma-muhurta before dawn is considered the most telling; a dream in the early night is held to be lighter.' },
  { q: 'Is my dream and my data private?', a: 'Yes. Your dream is read instantly and privately, with no sign-up required for the free meaning.' },
  { q: 'Who interprets the dreams on Trikaal Vaani?', a: 'Every meaning is traced to a classical source and validated by Rohiit Gupta, Chief Vedic Architect, with sixteen years in the Parashara BPHS tradition — then read against a Swiss Ephemeris chart.' },
];

// ── JSON-LD ──────────────────────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Swapna Shastra — Vedic Dream Meaning & Interpretation',
      url: 'https://trikalvaani.com/swapna',
      inLanguage: ['en-IN', 'hi-IN'],
      about: { '@type': 'Thing', name: 'Vedic dream interpretation (Swapna Shastra)' },
      isPartOf: { '@type': 'WebSite', name: 'Trikaal Vaani', url: 'https://trikalvaani.com' },
    },
    {
      '@type': 'Person',
      name: 'Rohiit Gupta',
      jobTitle: 'Chief Vedic Architect',
      knowsAbout: ['Vedic Astrology', 'Swapna Shastra', 'Parashara BPHS', 'Jyotish'],
      worksFor: { '@type': 'Organization', name: 'Trikaal Vaani' },
    },
    { '@type': 'Organization', name: 'Trikaal Vaani', url: 'https://trikalvaani.com' },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
        { '@type': 'ListItem', position: 2, name: 'Swapna Shastra', item: 'https://trikalvaani.com/swapna' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

// ── page ─────────────────────────────────────────────────────────────────────
export default function SwapnaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen" style={{ background: C.night, color: '#fff' }}>
        <SiteNav />
        <main>

          {/* ── HERO + interactive funnel ─────────────────────────────── */}
          <section className="px-4 pt-14 pb-6">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[11.5px] font-bold uppercase mb-6" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>
                स्वप्न शास्त्र <span style={{ color: C.s5 }}>✦</span> Vedic Dream Decoding
              </p>
              <h1 className="font-serif font-medium leading-[1.06] text-white" style={{ fontSize: 'clamp(2.4rem,6vw,4.2rem)' }}>
                Every night, your mind writes in{' '}
                <em className="not-italic" style={{ fontStyle: 'italic', color: C.gold }}>symbols</em>.
                Tonight, let it be read.
              </h1>
              <p className="mt-4 font-serif" style={{ fontSize: 'clamp(1.05rem,3vw,1.5rem)', color: C.s4 }} lang="hi">
                हर रात आपका मन प्रतीकों में लिखता है — आज उसे पढ़ा जाए।
              </p>
              {/* GEO 40–60 word direct answer */}
              <p className="mt-6 max-w-2xl mx-auto text-[1.02rem] leading-relaxed" style={{ color: C.s3 }}>
                In Vedic tradition, a dream is never noise — every symbol carries meaning refined across millennia in
                texts like the <b className="text-white font-medium">Svapna Cintāmaṇi</b> and the Purāṇas. Trikaal Vaani
                decodes your dream&apos;s symbol instantly and <b className="text-white font-medium">free</b>, then reads
                it against your own birth chart and planetary period — decoded under Rohiit Gupta, Chief Vedic Architect.
              </p>
            </div>

            {/* interactive dream box → result → paywall */}
            <div id="try">
              <SwapnaClient />
            </div>
          </section>

          {/* ── HOW IT WORKS (authority / GEO / EEAT) ─────────────────── */}
          <section className="px-4 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>The Method</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>
                How a dream is read in the Vedic way
              </h2>
              <p className="text-center mx-auto mt-3 max-w-xl text-[1rem]" style={{ color: C.s4 }}>
                Not a dictionary. Three forces decide what your dream means — this is why a personal reading differs from a generic one.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-9">
                {[
                  { n: '01 · The Symbol', h: 'The image', p: 'Every dream image holds a fixed classical meaning, recorded over millennia in the Svapna Cintāmaṇi and Purāṇas.', hi: 'हर प्रतीक का एक शास्त्रीय अर्थ है।' },
                  { n: '02 · The Chart', h: 'Your sky', p: 'That universal meaning bends to your birth chart and the Mahadasha you are walking — the same dream means different things to different people.', hi: 'वह अर्थ आपकी कुंडली और दशा से आकार लेता है।' },
                  { n: '03 · The Hour', h: 'The prahar', p: 'When you dreamt it matters. A dream in the Brahma-muhurta, the hour before dawn, speaks with the clearest voice.', hi: 'स्वप्न का समय भी मायने रखता है।' },
                ].map((x) => (
                  <div key={x.n} className="rounded-[18px] p-6" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                    <p className="text-[11px] font-semibold uppercase mb-3" style={{ letterSpacing: '0.2em', color: C.gold }}>{x.n}</p>
                    <h3 className="font-serif text-2xl text-white mb-2">{x.h}</h3>
                    <p className="text-[0.95rem]" style={{ color: C.s4 }}>{x.p}</p>
                    <span className="block mt-2 font-serif text-[0.9rem]" style={{ color: C.s5 }} lang="hi">{x.hi}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── COMMON DREAMS (internal-link hub) ─────────────────────── */}
          <section className="px-4 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>Most-Searched</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>Common dreams, decoded</h2>
              <p className="text-center mx-auto mt-3 max-w-xl text-[1rem]" style={{ color: C.s4 }}>
                Tap any dream for its classical meaning — then read it against your own chart.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-9">
                {COMMON_DREAMS.map((d) => (
                  <a key={d.href} href={d.href} className="rounded-2xl p-5 text-center transition-transform duration-200 hover:-translate-y-1"
                    style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                    <div className="text-[34px]">{d.ic}</div>
                    <div className="font-serif text-lg text-white mt-2.5">{d.en}</div>
                    <div className="font-serif text-[0.92rem] mt-0.5" style={{ color: C.goldSoft }} lang="hi">{d.hn}</div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ── 12 REALMS ─────────────────────────────────────────────── */}
          <section className="px-4 pb-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>The Full Map</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>The twelve realms of dreams</h2>
              <p className="text-center mx-auto mt-3 max-w-xl text-[1rem]" style={{ color: C.s4 }}>
                Every dream lives in one of these families — 192 symbols and counting, each traced to a classical source.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5 mt-8">
                {REALMS.map((r) => (
                  <a key={r.href} href={r.href} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.9rem]"
                    style={{ background: C.panel, border: `1px solid ${C.line}`, color: C.s3 }}>
                    {r.label} <span className="font-serif text-[0.85rem]" style={{ color: C.goldSoft }} lang="hi">{r.hn}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ── EEAT: author + sources ────────────────────────────────── */}
          <section className="px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>Authority</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>Read by a real tradition, not a generator</h2>

              <div className="flex flex-col md:flex-row gap-6 items-center mt-9 rounded-[20px] p-7" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                <div className="w-[88px] h-[88px] rounded-full flex-shrink-0 flex items-center justify-center text-[34px]"
                  style={{ border: `2px solid ${C.line2}`, background: 'radial-gradient(circle at 50% 35%, #1a2230, #0b101a)', color: C.gold }}>🔱</div>
                <div className="text-center md:text-left">
                  <div className="font-serif text-2xl text-white">Rohiit Gupta</div>
                  <div className="text-[12px] uppercase my-1.5" style={{ letterSpacing: '0.15em', color: C.goldSoft }}>Chief Vedic Architect · Trikaal Vaani</div>
                  <p className="text-[0.96rem]" style={{ color: C.s4 }}>
                    Sixteen years of personal practice in the Parashara BPHS tradition. Every dream meaning on Trikaal Vaani
                    is traced to a classical source and validated by hand — never invented, never auto-generated. Charts are
                    computed on astronomical-grade Swiss Ephemeris.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                {SOURCES.map((s) => (
                  <div key={s.t} className="rounded-[14px] p-4" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
                    <div className="font-serif text-lg" style={{ color: C.gold }}>{s.t}</div>
                    <div className="text-[0.86rem] mt-0.5" style={{ color: C.s5 }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── POSITIONING ───────────────────────────────────────────── */}
          <section className="px-4 pb-16">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>Why Trikaal</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>A dictionary vs your own sky</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-9">
                <div className="rounded-[18px] p-6" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                  <h4 className="font-serif text-xl mb-3.5" style={{ color: C.s3 }}>A generic dream app or chatbot</h4>
                  <ul className="space-y-1.5">
                    {['One meaning, the same for everyone', 'No idea who you are or when you were born', 'Guesses, often invented, no source', 'No remedy that fits your life'].map((t) => (
                      <li key={t} className="text-[0.94rem] pl-6 relative" style={{ color: C.s4 }}>
                        <span className="absolute left-0" style={{ color: C.s5 }}>—</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[18px] p-6" style={{ background: 'linear-gradient(180deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))', border: `1px solid ${C.line2}` }}>
                  <h4 className="font-serif text-xl mb-3.5" style={{ color: C.gold }}>Trikaal Vaani</h4>
                  <ul className="space-y-1.5">
                    {['Classical meaning traced to a named text', 'Read against your birth chart & running dasha', 'Validated by a practising astrologer', 'A remedy shaped to your own chart'].map((t) => (
                      <li key={t} className="text-[0.94rem] pl-6 relative text-white">
                        <span className="absolute left-0" style={{ color: C.gold }}>✦</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── FAQ (AEO) ─────────────────────────────────────────────── */}
          <section className="px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>Questions, Answered</p>
              <h2 className="font-serif font-medium text-center text-white mt-3 mb-8" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>Swapna Shastra FAQ</h2>
              <div>
                {FAQS.map((f, i) => (
                  <div key={i} className="py-5" style={{ borderTop: `1px solid ${C.line}`, borderBottom: i === FAQS.length - 1 ? `1px solid ${C.line}` : undefined }}>
                    <div className="font-serif text-xl" style={{ color: C.gold }}>{f.q}</div>
                    <div className="mt-2 text-[0.97rem]" style={{ color: C.s4 }}>{f.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA BAND ──────────────────────────────────────────────── */}
          <section className="px-4 pb-20">
            <div className="max-w-4xl mx-auto text-center rounded-[24px] px-8 py-11"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.03))', border: `1px solid ${C.line2}` }}>
              <h2 className="font-serif font-medium text-white" style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)' }}>Your dream is still speaking.</h2>
              <p className="mx-auto mt-3 max-w-lg" style={{ color: C.s4 }}>Decode its meaning free — then see what it means in your own stars.</p>
              <a href="#try" className="inline-flex items-center gap-2 mt-6 px-8 py-4 rounded-full text-sm font-bold transition-transform duration-300 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, color: '#100B02', boxShadow: '0 10px 30px rgba(168,130,10,0.35)' }}>
                Read my dream →
              </a>
            </div>
          </section>

        </main>
        <SiteFooter />
      </div>
    </>
  );
}

// ============================================================================
// END — app/swapna/page.tsx v1.0 · 🔱 Trikaal Vaani
// ============================================================================
