// ============================================================
// File: app/calculators/page.tsx
// Purpose: Calculators Hub — SEO/GEO/AEO landing page
// Version: v4.0 — Vivah Yog calculator added (3 Sep 2026)
// CHANGES vs v3.9:
//   ✅ Added 1 FREE card: Vivah Yog ("Shadi kab hogi"). Free verdict + summary,
//      so the "100% free hub" rule still holds — the ₹51 unlock sits inside
//      the tool, exactly like the other four yog calculators listed here.
//   ✅ Placed FIRST in the yog block, ahead of Santan. Reason from data, not
//      taste: GSC (3 Sep 2026) shows this site ALREADY ranking with no tool —
//      marriage yoga in kundali 14 impressions at position 9.93, marriage yoga
//      in astrology 12, marriage yog in astrology 11, vivah yog 6, vivaha yoga
//      4. Of the five yog calculators this is the only one with an existing
//      position to defend.
//      NOTE the slug/name split, which is deliberate: the URL is
//      free-shadi-kab-hogi-calculator (Radar's most frequent question in the
//      whole marriage set) while the card name says Vivah Yog (the phrase
//      already ranking). One page earns both.
//   ✅ Added its queries to metadata keywords.
//   ✅ CALC_COUNT, prose list, schema hasPart and FAQ counts all derive from
//      the CALCULATORS array, so 33 → 34 updates itself. Nothing else touched.
// Version: v3.9 — Santan Yog calculator added (2 Sep 2026)
// CHANGES vs v3.8:
//   ✅ Added 1 FREE card: Santan Yog. Free basic result, so the "100% free
//      hub" rule still holds — the Rs 51 unlock sits inside the tool, exactly
//      like the other three yog calculators already listed here.
//   ✅ Placed FIRST in the yog block, ahead of IAS. Reason, from data rather
//      than taste: the Radar run of 30 Aug 2026 ranked Santan Yog the number
//      one calculator to build (2 open tool SERPs), and the existing
//      /learn/number-of-children-prediction page already earns 3,815
//      impressions and 155 clicks at position 5.23 with no tool behind it.
//   ✅ Added its queries to metadata keywords.
//   ✅ CALC_COUNT, prose list, schema hasPart and FAQ counts all derive from
//      the CALCULATORS array, so 32 → 33 updates itself. Nothing else touched.
// Version: v3.8 — three yog calculators added (IAS, Videsh, Foreign Spouse)
// CHANGES vs v3.7:
//   ✅ Added 3 FREE cards: IAS Astrology, Foreign Settlement, Foreign Spouse.
//      All three are free, so the "100% free hub" rule of v3.7 still holds.
//      Placed directly after the Kundli card because Search Console shows
//      real demand already landing on /learn/ pages with no tool behind it.
//   ✅ Added their queries to metadata keywords.
//   ✅ CALC_COUNT, prose list, schema hasPart and FAQ counts all derive from
//      the CALCULATORS array, so 29 → 32 updates itself. Nothing else touched.
// Version: v3.7 — AI Hast Rekha REMOVED from hub (paid ₹51 product)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Date: 2026-07-12
// ============================================================
// CHANGES vs v3.6:
//   ✅ REMOVED the "AI Hast Rekha Calculator" card. This hub is now a
//      100% FREE-tools hub. Hast Rekha is a paid ₹51 product and now lives
//      in SiteNav (v3.0) next to Vivah Muhurat, funnelling straight to
//      /hast-rekha-calculator as a sales page. Count 30 → 29 (dynamic).
//   ✅ Removed 'hast rekha calculator' from metadata keywords (it was
//      cannibalising the pillar page /hast-rekha-calculator).
//   ✅ FAQ #1, sub-heading, 3rd Pillar card and schema Offer restored to
//      clean "100% free" messaging (no ₹51 mention on a free hub).
//   ✅ ALL OTHER LOGIC: identical to v3.6.
// CHANGES vs v3.5:
//   ✅ Added AI Hast Rekha card (now reverted in v3.7).
// CHANGES vs v3.4:
//   ✅ Added "Free Vivah Muhurat" card (href → /vivah-muhurat).
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
    absolute: 'Free Vedic Astrology Calculators — Kundli, Dasha, Nakshatra, Dosha, Gemstone & More | Trikaal Vaani',
  },
  description:
    'Free Vedic astrology calculators powered by Swiss Ephemeris. Get accurate Kundli, Dasha, Nakshatra, Rashi, Lagna, Sade Sati, Manglik & Kaal Sarp Dosh, Gemstone Suitability, Numerology and Baby Name results instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'vedic astrology calculator', 'free kundli calculator', 'dasha calculator',
    'nakshatra calculator', 'rashi calculator', 'lagna calculator',
    'sade sati calculator', 'manglik dosh calculator', 'kaal sarp dosh calculator',
    'pitra dosh calculator', 'gemstone calculator', 'gemstone suitability calculator',
    'should i wear neelam', 'should i wear pukhraj', 'numerology calculator',
    'baby name by nakshatra', 'kundali strength', 'graha bal calculator',
    'jyotish calculator', 'birth chart calculator',
    'ias astrology calculator', 'government job calculator',
    'sarkari naukri yog', 'upsc astrology',
    'foreign settlement astrology', 'foreign spouse calculator',
    'videsh yog calculator', 'nri marriage astrology',
    'santan yog calculator', 'santan yog kundali', 'putra yog calculator',
    'child yog calculator', 'putrakaraka', 'saptamsa d7 calculator',
    'shadi kab hogi', 'shadi kab hogi calculator', 'vivah yog calculator',
    'vivah yog by date of birth', 'marriage yog in kundali',
    'marriage age prediction by date of birth', 'meri shadi kab hogi',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators' },
  openGraph: {
    title: 'Free Vedic Astrology Calculators | Trikaal Vaani',
    description: 'Free Vedic astrology calculators powered by Swiss Ephemeris. Accurate, instant, 100% free.',
    url: 'https://trikalvaani.com/calculators',
    type: 'website',
  },
};

// Calculator card shape. `href` (optional) overrides the default
// /calculators/{slug} link — used by tools that live elsewhere (e.g. Vivah).
type CalcEntry = {
  slug: string;
  emoji: string;
  name: string;
  desc: string;
  badge: string | null;
  live: boolean;
  href?: string;
};

// ── Single source of truth. Add a calculator = add ONE entry here. ──
// v3.7 RULE: only FREE tools belong here. Paid products (Hast Rekha ₹51,
// Karmic ₹251, Kundali Milan) live in SiteNav / Services, never in this hub.
const CALCULATORS: CalcEntry[] = [
  {
    slug: 'free-kundali-calculator',
    emoji: '🔮',
    name: 'Free Kundli Calculator',
    desc: 'Get your complete Janm Kundali — Lagna, Nakshatra, all 9 planets, Dasha, and Parashar remedies.',
    badge: 'Most Popular',
    live: true,
  },
  // ── Yog calculators (v3.8, extended v3.9). Placed high on purpose:
  // Search Console shows "ias astrology calculator" and "foreign settlement
  // astrology" already earning clicks on /learn/ pages, with no tool behind
  // them until now. Santan leads the block because Radar ranked it the
  // strongest open opportunity of the four.
  {
    slug: 'free-shadi-kab-hogi-calculator',
    emoji: '\u{1F48D}',
    name: 'Free Vivah Yog Calculator',
    desc: 'Shadi kab hogi \u2014 saptam bhava, Navamsa D-9, kalatra karak aur Darakaraka se. Asli tareekhon ki dasha khidkiyan aur umar ka range, har ank ki wajah ke saath.',
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-santan-yog-calculator',
    emoji: '\u{1F476}',
    name: 'Free Santan Yog Calculator',
    desc: 'Santan yog ka bal \u2014 panchma bhava, Saptamsa D-7, Guru aur Putrakaraka se. BPHS santan ka nirnay D-7 se karne ko kehta hai, aur wahi is score ke 24 ank uthata hai.',
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-ias-astrology-calculator',
    emoji: '\u{1F3DB}\u{FE0F}',
    name: 'Free IAS Astrology Calculator',
    desc: 'Sarkari Naukri Yog score for UPSC, SSC, Banking, Railway & Police \u2014 with the reason behind every point, not just a number.',
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-foreign-settlement-calculator',
    emoji: '\u2708\u{FE0F}',
    name: 'Free Foreign Settlement Calculator',
    desc: 'Videsh Yog score from your 12th house, Rahu, 9th house and Dasha \u2014 every point explained with its actual Shadbala figure.',
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-foreign-spouse-calculator',
    emoji: '\u{1F491}',
    name: 'Free Foreign Spouse Calculator',
    desc: 'NRI / foreign spouse yog from your 7th house, Navamsa D-9, Rahu and Darakaraka \u2014 judged where marriage is actually judged.',
    badge: 'New',
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
    slug: 'vivah-muhurat',
    href: '/vivah-muhurat',
    emoji: '💍',
    name: 'Free Vivah Muhurat',
    desc: 'Strict-classical shubh marriage dates for the year — exact muhurat time, nakshatra, tithi & lagna. Excludes Kharmas, Adhik Maas & Chaturmas.',
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
  // ── 10 calculators (v3.3) ──
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
  // ── Gemstone Suitability ecosystem (v3.4) ──
  {
    slug: 'free-gemstone-suitability-calculator',
    emoji: '💠',
    name: 'Free Gemstone Suitability Calculator',
    desc: 'Score all 9 gemstones 0–100 for your exact chart — functional benefic, Shadbala, dignity & afflictions — with a clear should-you-wear-it verdict.',
    badge: 'New',
    live: true,
  },
  {
    slug: 'free-should-i-wear-neelam',
    emoji: '🔵',
    name: 'Should I Wear Neelam? (Blue Sapphire)',
    desc: 'Free Vedic check for Blue Sapphire (Shani) — suitability score, risk level & verdict based on your Lagna.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-should-i-wear-cats-eye',
    emoji: '🐈',
    name: "Should I Wear Cat's Eye? (Lehsunia)",
    desc: "Free Vedic check for Cat's Eye (Ketu) — node-based suitability, very-high-risk caution & expert verdict.",
    badge: null,
    live: true,
  },
  {
    slug: 'free-should-i-wear-pukhraj',
    emoji: '🟡',
    name: 'Should I Wear Pukhraj? (Yellow Sapphire)',
    desc: 'Free Vedic check for Yellow Sapphire (Guru) — is Jupiter a benefic for your Lagna? Score, risk & verdict.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-should-i-wear-gomed',
    emoji: '🟠',
    name: 'Should I Wear Gomed? (Hessonite)',
    desc: 'Free Vedic check for Hessonite (Rahu) — node-based suitability, very-high-risk caution & verdict.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-should-i-wear-moonga',
    emoji: '🔴',
    name: 'Should I Wear Moonga? (Red Coral)',
    desc: 'Free Vedic check for Red Coral (Mangal) — Mars suitability by your Lagna, with score, risk & verdict.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-should-i-wear-panna',
    emoji: '🟢',
    name: 'Should I Wear Panna? (Emerald)',
    desc: 'Free Vedic check for Emerald (Budh) — Mercury suitability by your Lagna, with score & verdict.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-should-i-wear-moti',
    emoji: '⚪',
    name: 'Should I Wear Moti? (Pearl)',
    desc: 'Free Vedic check for Pearl (Chandra) — Moon suitability by your Lagna, with score & verdict.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-should-i-wear-manik',
    emoji: '❤️',
    name: 'Should I Wear Manik? (Ruby)',
    desc: 'Free Vedic check for Ruby (Surya) — Sun suitability by your Lagna, with score & verdict.',
    badge: null,
    live: true,
  },
  {
    slug: 'free-should-i-wear-heera',
    emoji: '💍',
    name: 'Should I Wear Heera? (Diamond)',
    desc: 'Free Vedic check for Diamond (Shukra) — Venus suitability by your Lagna, with score & verdict.',
    badge: null,
    live: true,
  },
  // ────────────────────────────────────────────
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
// Prose list excludes the granular "Should I Wear X" pages so the GEO intro
// stays clean. They still render as cards + appear in schema + count.
const PROSE_CALCULATORS = CALCULATORS.filter((c) => !c.slug.startsWith('free-should-i-wear-'));
const CALC_SHORT_NAMES = PROSE_CALCULATORS.map((c) =>
  c.name.replace(/^Free\s+/, '').replace(/\s+Calculator$/, '')
);
const CALC_LIST_TEXT =
  CALC_SHORT_NAMES.slice(0, -1).join(', ') + ', and ' + CALC_SHORT_NAMES[CALC_SHORT_NAMES.length - 1];

const FAQS = [
  {
    q: 'Are these calculators really free?',
    a: `Yes, 100% free. All ${CALC_COUNT} tools cover Kundli, Dasha, Nakshatra, Dosha, Gemstone, Numerology and more — no payment, no signup.`,
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
    q: 'What if I do not know my birth time?',
    a: 'You can still get an accurate reading. Trikaal Vaani\'s AI Hast Rekha palm reading needs only a photo of your palm — no birth time, no birth chart. It is a premium Samudrika Shastra report for ₹51.',
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
            url: c.href ? `https://trikalvaani.com${c.href}` : `https://trikalvaani.com/calculators/${c.slug}`,
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
            {CALC_COUNT} calculators · Swiss Ephemeris accuracy · BPHS classical rules · 100% free.
          </p>

          <div className="rounded-xl p-5 mb-8" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani offers {CALC_COUNT} free Vedic astrology calculators</strong> — {CALC_LIST_TEXT}, plus dedicated "Should I Wear" suitability checks for all 9 gemstones. All powered by Swiss Ephemeris (NASA-grade accuracy), Lahiri Ayanamsha, and BPHS classical rules. No signup. No payment. Instant results.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-10 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Lahiri Ayanamsha · BPHS Classical Rules</div>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Choose Your Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CALCULATORS.map((calc) => (
                <Link key={calc.slug} href={calc.href ?? `/calculators/${calc.slug}`}
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

          {/* No birth time? → funnel to the paid AI Hast Rekha product (₹51). */}
          <section className="mb-12 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">🖐️</div>
              <div>
                <h2 className="text-xl font-serif font-bold mb-2" style={{ color: GOLD }}>
                  Don't know your birth time?
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Every calculator above needs your date, time and place of birth. If your birth time is unknown, your palm still carries the record. Upload one photo and the <strong>AI Hast Rekha</strong> engine reads your lines and mounts by classical Samudrika Shastra — 8 life scores, line &amp; mount analysis, remedies and a full PDF report. Premium reading, <strong style={{ color: GOLD }}>₹51</strong>.
                </p>
                <Link href="/hast-rekha-calculator"
                  className="inline-block px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }}>
                  🖐️ Read My Palm — ₹51 →
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Why Trikaal Vaani Calculators?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Pillar emoji="🎯" title="NASA-Grade Accuracy" desc="Swiss Ephemeris engine — the same astronomical library used by professional astrology software worldwide." />
              <Pillar emoji="📚" title="BPHS Classical Rules" desc="Every calculation follows Brihat Parashara Hora Shastra — the foundation text of Vedic astrology by Maharishi Parashar." />
              <Pillar emoji="🆓" title="100% Free" desc="Every calculator on this page is free — no payment, no signup, no hidden gate. Instant results." />
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
