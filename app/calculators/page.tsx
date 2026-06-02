// ============================================================
// File: app/calculators/page.tsx
// Purpose: Calculators Hub — SEO/GEO/AEO landing page
// Version: v3.3 — 10 NEW calculators added (total 18) + brand + EEAT
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Date: 2026-06-02
// ============================================================
// CHANGES vs v3.2:
//   ✅ Added 10 new calculators to CALCULATORS array:
//      Lucky Day, Weak Planet Finder, Graha Bal, Kundali Strength,
//      Lagna Bal, Kaal Sarp Dosh, Gemstone, Pitra Dosh, Numerology,
//      Baby Name by Nakshatra. (Count/GEO/FAQ auto-update — dynamic.)
//   ✅ BRAND FIX: visible text + schema name/title/OG now "Trikaal Vaani"
//      (double-a). Per CEO-locked rule — legalName stays "Trikal Vaani".
//   ✅ EEAT: CollectionPage creator now @id-linked to #organization +
//      worksFor; added publisher Organization with REAL sameAs
//      (Instagram / YouTube / Facebook — verified from homepage).
//   ✅ ALL OTHER LOGIC: identical to v3.2.
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import SiteNav from '@/components/layout/SiteNav';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// Real, verified brand entities (from homepage JSON-LD)
const ORG_ID = 'https://trikalvaani.com/#organization';
const REAL_SAMEAS = [
  'https://www.instagram.com/thetrikalvaani',
  'https://www.youtube.com/@TheTrikalVaani',
  'https://www.facebook.com/people/Trikal-Vaani-Voice',
];

export const metadata: Metadata = {
  title: {
    absolute: 'Free Vedic Astrology Calculators — Kundli, Dasha, Nakshatra, Dosha & More | Trikaal Vaani',
  },
  description:
    'Free Vedic astrology calculators powered by Swiss Ephemeris. Get accurate Kundli, Dasha, Nakshatra, Rashi, Lagna, Sade Sati, Manglik & Kaal Sarp Dosh, Gemstone, Numerology and Baby Name results instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'vedic astrology calculator', 'free kundli calculator', 'dasha calculator',
    'nakshatra calculator', 'rashi calculator', 'lagna calculator',
    'sade sati calculator', 'manglik dosh calculator', 'kaal sarp dosh calculator',
    'pitra dosh calculator', 'gemstone calculator', 'numerology calculator',
    'baby name by nakshatra', 'kundali strength', 'graha bal calculator',
    'jyotish calculator', 'birth chart calculator',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators' },
  openGraph: {
    title: 'Free Vedic Astrology Calculators | Trikaal Vaani',
    description: 'Free Vedic astrology calculators powered by Swiss Ephemeris. Accurate, instant, 100% free.',
    url: 'https://trikalvaani.com/calculators',
    type: 'website',
  },
};

// ── Single source of truth. Add a calculator = add ONE entry here. ──
const CALCULATORS = [
  {
    slug: 'free-kundali-calculator',
    emoji: '🔮',
    name: 'Free Kundli Calculator',
    desc: 'Get your complete Janm Kundali — Lagna, Nakshatra, all 9 planets, Dasha, and Parashar remedies.',
    badge: 'Most Popular',
    live: true,
  },
  {
    slug: 'free-child-birth-muhurat-calculator',
    emoji: '🍼',
    name: 'Free Child Birth Muhurat Calculator',
    desc: 'Find the most auspicious C-section or delivery time within your doctor-approved window — Lagna, Nakshatra & lucky name letter.',
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-dasha-calculator',
    emoji: '🪐',
    name: 'Free Dasha Calculator',
    desc: 'Find your current Mahadasha, Antardasha — with next 5 dasha periods, Parashar Dos/Donts & 3 remedies.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-nakshatra-calculator',
    emoji: '⭐',
    name: 'Free Nakshatra Calculator',
    desc: 'Discover your Janma Nakshatra, Pada, lord planet, deity, gana, yoni, nadi & 3 Parashar remedies.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-rashi-calculator',
    emoji: '🌙',
    name: 'Free Rashi Calculator',
    desc: 'Find your Moon Sign (Chandra Rashi) — the foundation of all Vedic astrology predictions.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-lagna-calculator',
    emoji: '⬆️',
    name: 'Free Lagna Calculator',
    desc: 'Calculate your Ascendant (Lagna) — your outer personality, body, and life direction.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-sade-sati-calculator',
    emoji: '🕉️',
    name: 'Free Sade Sati Calculator',
    desc: "Check if Saturn's 7.5 year Sade Sati is active for you — Rising, Peak, or Setting phase.",
    badge: 'Trending',
    live: true,
  },
  {
    slug: 'free-manglik-dosh-calculator',
    emoji: '🔴',
    name: 'Free Manglik Dosh Calculator',
    desc: 'Check Mangal Dosha status — severity level, cancellation rules, and Parashar remedies.',
    badge: null,
    live: true,
  },
  // ── 10 NEW calculators (v3.3) ──
  {
    slug: 'free-kaal-sarp-dosh-calculator',
    emoji: '🐍',
    name: 'Free Kaal Sarp Dosh Calculator',
    desc: 'Check Kaal Sarp Dosh by exact Rahu-Ketu axis, find its type (Anant–Sheshnag) & free Naag-puja remedies.',
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-pitra-dosh-calculator',
    emoji: '🪔',
    name: 'Free Pitra Dosh Calculator',
    desc: 'Check Pitra Dosh from your birth chart (Sun / 9th house affliction) with causes, signs & Pitru-Tarpan remedies.',
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-gemstone-calculator',
    emoji: '💎',
    name: 'Free Gemstone Calculator',
    desc: 'Find your lucky life gemstone (ratna) by ascendant lord — with metal, finger, day, mantra & safety caution.',
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-numerology-calculator',
    emoji: '🔢',
    name: 'Free Numerology Calculator',
    desc: 'Find your Mulank, Bhagyank & Naamank — with ruling planet, lucky number, color, day & friendly numbers.',
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-baby-name-by-nakshatra',
    emoji: '👶',
    name: 'Free Baby Name by Nakshatra',
    desc: "Find baby's lucky starting letter by nakshatra & pada — with name suggestions and meanings (boy/girl).",
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-lucky-day-calculator',
    emoji: '🍀',
    name: 'Free Lucky Day Calculator',
    desc: 'Discover your luckiest day, color, number, metal & direction based on your strongest planet.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-weak-planet-finder',
    emoji: '📉',
    name: 'Free Weak Planet Finder',
    desc: 'Identify your weakest planet (Shadbala), the life areas it affects, and targeted strengthening remedies.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-graha-bal-calculator',
    emoji: '⚖️',
    name: 'Free Graha Bal Calculator',
    desc: 'See the Shadbala strength of all 9 planets with an interactive 6-fold bala breakdown.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-kundali-strength-calculator',
    emoji: '💪',
    name: 'Free Kundali Strength Calculator',
    desc: 'Get your overall birth-chart strength score with strongest & weakest planets and lagna/dasha strength.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-lagna-bal-calculator',
    emoji: '🛡️',
    name: 'Free Lagna Bal Calculator',
    desc: "Check your Ascendant lord's placement & strength, and the planets sitting in your 1st house.",
    badge: null,
    live: true,
  },
];

// ── Dynamic helpers (auto-update when CALCULATORS changes) ──
const CALC_COUNT = CALCULATORS.length;
// Short names for GEO/FAQ prose, e.g. "Kundli, Dasha, ... and Child Birth Muhurat"
const CALC_SHORT_NAMES = CALCULATORS.map((c) =>
  c.name.replace(/^Free\s+/, '').replace(/\s+Calculator$/, '')
);
const CALC_LIST_TEXT =
  CALC_SHORT_NAMES.slice(0, -1).join(', ') + ', and ' + CALC_SHORT_NAMES[CALC_SHORT_NAMES.length - 1];

const FAQS = [
  {
    q: 'Are these calculators really free?',
    a: `Yes, 100% free. All ${CALC_COUNT} calculators give complete results without any payment, signup, or hidden charges.`,
  },
  {
    q: 'How accurate are Trikaal Vaani calculators?',
    a: 'All calculators use Swiss Ephemeris — the same astronomical library used by NASA and world-class astrology software. Calculations are based on Lahiri Ayanamsha (Government of India standard) and BPHS classical rules.',
  },
  {
    q: 'What information do I need?',
    a: 'Date of birth, Time of birth (as exact as possible), and Place of birth (city name — auto-suggested via Google Maps). Numerology needs only your date of birth.',
  },
  {
    q: 'Why is birth time so important?',
    a: 'Birth time determines your Lagna (Ascendant), which changes every 2 hours. Even a 15-minute difference can shift your Lagna and house positions.',
  },
  {
    q: 'Do these calculators work for non-Indian birth places?',
    a: 'Yes. Google Maps integration supports any city worldwide — New York, London, Dubai, Singapore. Timezone is automatically calculated.',
  },
];

export default function CalculatorsHubPage() {
  return (
    <>
      <SiteNav />

      <Script id="calculators-collection-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'CollectionPage',
          name: 'Free Vedic Astrology Calculators',
          description: `${CALC_COUNT} free Vedic astrology calculators powered by Swiss Ephemeris`,
          url: 'https://trikalvaani.com/calculators',
          publisher: {
            '@type': 'Organization', '@id': ORG_ID,
            name: 'Trikaal Vaani', legalName: 'Trikal Vaani',
            url: 'https://trikalvaani.com', sameAs: REAL_SAMEAS,
          },
          creator: {
            '@type': 'Person', name: 'Rohiit Gupta', jobTitle: 'Chief Vedic Architect',
            url: 'https://trikalvaani.com/founder', worksFor: { '@id': ORG_ID },
          },
          hasPart: CALCULATORS.map((c) => ({
            '@type': 'SoftwareApplication', name: c.name, applicationCategory: 'LifestyleApplication',
            url: `https://trikalvaani.com/calculators/${c.slug}`,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          })),
        }) }} />

      <Script id="calculators-faq-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }) }} />

      <Script id="calculators-breadcrumb-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
            { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
          ],
        }) }} />

      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-5xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Calculators</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Vedic Astrology Calculators
          </h1>

          <p className="text-base md:text-lg text-slate-300 mb-6">
            {CALC_COUNT} free calculators · Swiss Ephemeris accuracy · BPHS classical rules · 100% free, forever.
          </p>

          <div className="rounded-xl p-5 mb-8" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani offers {CALC_COUNT} free Vedic astrology calculators</strong> — {CALC_LIST_TEXT}. All powered by Swiss Ephemeris (NASA-grade accuracy), Lahiri Ayanamsha, and BPHS classical rules. No signup. No payment. Instant results.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-10 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Lahiri Ayanamsha · BPHS Classical Rules</div>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Choose Your Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CALCULATORS.map((calc) => (
                <Link key={calc.slug} href={`/calculators/${calc.slug}`}
                  className="group relative p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${calc.live ? GOLD_RGBA(0.3) : 'rgba(255,255,255,0.08)'}` }}>

                  {calc.badge && (
                    <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: GOLD, color: '#080B12' }}>
                      {calc.badge}
                    </span>
                  )}

                  <div className="text-3xl mb-3">{calc.emoji}</div>
                  <h3 className="text-lg font-serif font-bold mb-2" style={{ color: GOLD }}>{calc.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">{calc.desc}</p>
                  <div className="text-sm font-medium inline-flex items-center gap-1.5" style={{ color: GOLD_RGBA(0.85) }}>
                    <span>Use Calculator</span><span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Why Trikaal Vaani Calculators?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Pillar emoji="🎯" title="NASA-Grade Accuracy" desc="Swiss Ephemeris engine — the same astronomical library used by professional astrology software worldwide." />
              <Pillar emoji="📚" title="BPHS Classical Rules" desc="Every calculation follows Brihat Parashara Hora Shastra — the foundation text of Vedic astrology by Maharishi Parashar." />
              <Pillar emoji="🆓" title="100% Free Forever" desc="No signup. No payment. No hidden charges. Instant results." />
            </div>
          </section>

          <section className="mb-12">
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

          <section className="p-6 md:p-8 rounded-2xl text-center" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
            <h3 className="text-xl md:text-2xl font-serif font-bold mb-2" style={{ color: GOLD }}>Want More Than Just Calculations?</h3>
            <p className="text-slate-300 mb-1">Get your complete <strong>Jeevan Bhavishyavani</strong> with timing predictions.</p>
            <ul className="text-sm text-slate-400 my-4 space-y-1">
              <li>✓ Full life prediction with action windows</li>
              <li>✓ Career, Marriage, Health timing</li>
              <li>✓ 50+ personalized remedies</li>
              <li>✓ Voice prediction in Hinglish</li>
            </ul>
            <Link href="/#birth-form" className="inline-block mt-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }}>
              🔮 Trikaal Ka Sandesh — Sirf Aapke Liye — ₹51 →
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}

function Pillar({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="text-2xl mb-2">{emoji}</div>
      <h3 className="font-serif font-bold mb-2" style={{ color: GOLD }}>{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
