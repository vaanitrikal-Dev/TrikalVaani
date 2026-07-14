// ═══════════════════════════════════════════════════════════════
// app/hast-rekha-calculator/page.tsx
// AI HAST REKHA CALCULATOR — money page (server component)
// Version: v1.3
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// CHANGE v1.3 (2026-07-14) — SEO / GEO / AEO / E-E-A-T REBUILD
//
//   WHAT v1.2 DID NOT SOLVE:
//   v1.2 fixed the JSON-LD so crawlers could see it. But schema is a
//   LABEL on content, not content. Measured on the live page:
//     • 654 visible words
//     • ZERO links to any of the 17 Hast Rekha hub pages
//     • no 40–60 word direct answer (IR-0b requires one)
//     • E-E-A-T existed only in markup, never on screen
//     • the anti-fear promise — our single biggest differentiator —
//       lived only on the blog, and NOT on the page where the money
//       decision is actually made
//   The hub sends ~170 internal links INTO this page. This page sent
//   nothing back. It was an authority dead end, and to an AI crawler
//   it was a form with no evidence that we know anything.
//
//   WHAT v1.3 DOES:
//   1. Adds a 2,000+ word SSR content block below the tool, covering all
//      27 keyword types + Local (Delhi NCR / Noida / Gurgaon / Ghaziabad).
//   2. Opens that block with a 40–60 word direct answer for AEO/GEO.
//   3. Links out to ALL 17 hub pages, grouped — this page becomes the
//      HEART of the hub instead of its dead end.
//   4. Visible E-E-A-T: Rohiit Gupta, 16 years, Parashara BPHS lineage,
//      MSME reg, Dwarka address, classical sources named, /founder link.
//      Google's quality raters read the page, not the JSON-LD.
//   5. Puts the ANTI-FEAR promise where the wallet is. It is the whole
//      reason someone picks us over a ₹2,000 palmist who sells a puja
//      afterwards.
//
//   LIVE INCONSISTENCIES CORRECTED (all were shipping):
//   • "8 mounts" → "7 mounts" everywhere. The 17-page hub and all 22
//     diagrams say SEVEN (Mangal = one parvat with two zones). CEO
//     decision: standardise on SEVEN. One site, one answer. A
//     contradiction across our own domain damages the entity
//     consistency the entire GEO plan depends on.
//   • FAQ said "8 parvat" and then listed SEVEN names. Fixed.
//   • FAQ told users to upload the RIGHT hand. The hub says the
//     DOMINANT hand. A left-handed user following the old FAQ would
//     have received a reading of the wrong hand. Fixed.
//   • FAQ claimed "90%+ accuracy". Unverifiable, and IR forbids fake
//     stats — our own accuracy page explicitly refuses that claim.
//     Removed and replaced with the honest answer.
//   • Added FAQs for the two questions that actually decide the sale:
//     "can you tell me when I'll marry / how long I'll live" and
//     "will you sell me a puja afterwards". Both answered: no.
//
//   SCHEMA (retained from v1.2): plain <script type="application/ld+json">
//   rendered from this SERVER component so it lands in the SSR HTML.
//   DO NOT convert back to next/script — strategy="beforeInteractive" is
//   ignored outside the root layout, the schema becomes JS-injected, and
//   AI crawlers (Perplexity, GPTBot) do not execute JS. Verified before
//   the fix: the raw HTML contained ZERO "@type" strings.
//   next/script is for executable JS. JSON-LD is data.
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import HastRekhaClient from './HastRekhaClient';

const ORG_ID = 'https://trikalvaani.com/#organization';
const PERSON_ID = 'https://trikalvaani.com/#rohiit-gupta';
const PAGE_URL = 'https://trikalvaani.com/hast-rekha-calculator';
const GOLD = '#D4AF37';

const REAL_SAMEAS = [
  'https://www.instagram.com/thetrikalvaani',
  'https://www.facebook.com/people/Trikal-Vaani-Voice/61576946646141/',
  'https://www.linkedin.com/company/trikaal-vaani/',
];

export const metadata: Metadata = {
  title: {
    absolute: 'AI Hast Rekha Calculator — Palm Reading by Samudrika Shastra (₹51) | Trikaal Vaani',
  },
  description:
    'Upload one palm photo and get a classical Samudrika Shastra reading — all 6 lines and all 7 mounts, 8 life scores, personalised remedies and a PDF report. ₹51. No birth time needed. We will not tell you when you will die, and there is no puja to buy afterwards.',
  keywords: [
    // head + body
    'hast rekha', 'palmistry', 'hast rekha calculator', 'palm reading online',
    // long-tail + transactional
    'ai palm reading online india', 'palm reading by photo india', 'buy palm reading report india',
    'palm reading report pdf download', 'palm reading 51 rupees', 'hast rekha calculator online',
    // commercial
    'best ai palmistry app india', 'accurate online palm reading', 'trusted palm reader online',
    // informational
    'samudrika shastra online', 'hast rekha gyan hindi', 'jeevan rekha analysis', 'bhagya rekha meaning',
    // question / 5W1H
    'how to read palm lines', 'which hand to read in palmistry', 'what does my life line mean',
    'why do i have no fate line', 'who reads palms online in india',
    // vernacular / Hinglish
    'hath ki rekha', 'hatheli ki rekha kaise padhe', 'haath dekhna online', 'hast rekha vishleshan',
    'hatheli mein machli ka nishan', 'hatheli ke parvat',
    // entity / Jyotish
    'guru parvat', 'shukra parvat', 'chandra parvat', 'brihat samhita', 'hasta sanjeevani', 'ravan samhita',
    // problem / symptom
    'career not growing palm reading', 'no promotion palm reading', 'marriage delay palm reading',
    'why is my hard work not recognised',
    // comparative
    'ai palm reading vs palmist', 'palmistry vs kundali', 'hast rekha vs jyotish',
    // verification / skeptic
    'is palm reading accurate', 'is palmistry real', 'does palm reading work',
    // definition
    'what is samudrika shastra', 'what is hast rekha',
    // task / action
    'scan my palm', 'upload palm photo for reading', 'check my palm lines online',
    // list
    'types of palm lines', 'seven mounts of the palm', 'lucky signs on palm',
    // emotional / reassurance
    'palm reading without fear', 'honest palm reading', 'no gemstone upsell palm reading',
    // multi-constraint
    'ai palm reading in hindi from mobile photo without birth time',
    // voice
    'ok google read my palm', 'hey google what does my fate line mean',
    // seasonal
    'palm reading 2026', 'hast rekha 2026',
    // misspellings
    'hasth rekha', 'hast rekha calculater', 'palmestry online', 'samudrik shastra',
    // brand
    'trikaal vaani hast rekha', 'trikal vaani palm reading', 'rohiit gupta palmist',
    // price
    'palm reading price in india', 'hast rekha kitne rupaye', 'cheap palm reading online',
    // privacy
    'is my palm photo safe', 'palm reading data privacy',
    // persona
    'palm reading for women', 'palm reading for men', 'palm reading for students',
    // LOCAL (IR-0b)
    'palmist in delhi', 'palm reader near me', 'astrologer in dwarka delhi',
    'hast rekha expert noida', 'palmist gurgaon', 'palmist ghaziabad', 'palm reading delhi ncr',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'AI Hast Rekha Calculator — Samudrika Shastra Reading | Trikaal Vaani',
    description:
      'One palm photo. 6 lines, 7 mounts, 8 life scores, remedies and a PDF report. ₹51. No birth time. No puja to buy afterwards.',
    url: PAGE_URL,
    type: 'website',
    images: [
      {
        url: 'https://trikalvaani.com/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Hast Rekha Calculator — Trikaal Vaani',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Hast Rekha Calculator | Trikaal Vaani',
    description: 'Upload a palm photo → classical Samudrika Shastra reading. PDF report ₹51. No birth time needed.',
    images: ['https://trikalvaani.com/og-default.jpg'],
  },
  robots: { index: true, follow: true },
};

// ── FAQ data (shared by JSON-LD + the visible accordion in the client) ──
const FAQS = [
  {
    q: 'Samudrika Shastra kya hota hai?',
    a: 'Samudrika Shastra bharat ki prachin vidya hai jisme haath ki rekhaon, parvaton, unglion aur haath ke aakar se vyakti ke swabhav aur pravritti ka vishleshan hota hai. Iska ullekh Brihat Samhita, Hasta Sanjeevani aur Ravan Samhita jaise shastriya granthon mein milta hai.',
  },
  {
    q: 'Hast Rekha Calculator kaun si rekhaen aur parvat analyze karta hai?',
    a: 'Trikaal Vaani ka AI calculator 6 mukhya rekhaen — Jeevan Rekha, Mastishk Rekha, Hriday Rekha, Bhagya Rekha, Surya Rekha aur Vivah Rekha — aur 7 parvat (Guru, Shani, Surya, Budh, Shukra, Mangal, Chandra) ka vishleshan karta hai. Mangal ke do kshetra hote hain, lekin parvat ek hi mana jaata hai.',
  },
  {
    q: 'AI palm reading kitni accurate hoti hai?',
    a: 'Hum koi accuracy percentage ka daava nahi karte — jo bhi aisa daava kare, wo aapko sach nahi bata raha. Hamara engine sirf wahi padhta hai jo photo mein dikhta hai, aur us par Samudrika Shastra ke shastriya niyam lagata hai. Achhi daylight photo se reading behtar hoti hai, dhundhli photo se kamzor. Hum rekhaen bana nahi dete jo hain hi nahi. Aur ek cheez engine insaan se behtar karta hai: wo aapka chehra dekh hi nahi sakta, isliye aapko khush karne ke liye reading badal nahi sakta.',
  },
  {
    q: 'Hast Rekha report mein kya milega?',
    a: '8 dimension scores (career, dhan, swasthya, rishtey, urja, netritva, srijanshakti, adhyatma), haath ka Samudrika parichay, 6 rekhaon aur 7 parvaton ka vishleshan, har nishan uske parvat ke sandarbh mein, vyaktigat Samudrika upay, aur ek downloadable PDF report — Hindi, English ya Hinglish mein.',
  },
  {
    q: 'Kaun sa haath upload karein — seedha ya ulta?',
    a: 'Apna DOMINANT haath upload karein — yaani jis haath se aap likhte hain. Agar aap left-handed hain toh baaya haath, chahe purani "purush ka daya haath" wali reet kuch bhi kahe. Dominant haath dikhata hai jo aapne banaya; non-dominant dikhata hai jo aapko mila. Dono upload karein toh unke beech ka farak bhi padha jaata hai — aur asli reading wahi hai.',
  },
  {
    q: 'Kya meri palm image save hoti hai?',
    a: 'Nahi. Palm images hamare server par store nahi hoti — woh aapke browser session mein rehti hain aur analysis ke baad hata di jaati hain. Sirf analysis ka result save hota hai, koi image nahi.',
  },
  {
    q: 'Kya aap bata sakte hain ki meri shaadi kab hogi, ya main kitne saal jiyunga?',
    a: 'Nahi — aur koi imaandaar reader bhi nahi bata sakta. Hatheli par koi tareekh nahi likhi hoti. Chaalis saal ki zindagi ko ek centimetre chamdi par map karke saal batana maapna nahi, natak hai. Chhoti Jeevan Rekha ka matlab chhoti umr bilkul nahi hota — ye jhooth bharat mein sabse zyada bikta hai aur sabse zyada darr failata hai. Timing ka sahi auzaar Kundali hai, hatheli nahi.',
  },
  {
    q: 'Report ke baad koi puja, ratna ya doosri sitting bechoge?',
    a: 'Nahi. ₹51 ke baad kuch nahi hai — na puja, na ratna, na dhaaga, na follow-up sitting. Jis mandi mein darr dikha kar upay becha jaata hai, usi ki wajah se ye platform bana. Aur ratna kabhi hatheli ke nishan se nahi pehne jaate — wo Kundali se tay hote hain.',
  },
];

// ── Hub interlinking: this page is the HEART of the Hast Rekha hub ──
type HubItem = { href: string; label: string; note: string };

const HUB_LINES: HubItem[] = [
  { href: '/blog/life-line-jeevan-rekha-meaning', label: 'Jeevan Rekha — Life Line', note: 'It is not your lifespan' },
  { href: '/blog/fate-line-bhagya-rekha-meaning', label: 'Bhagya Rekha — Fate Line', note: 'No fate line = self-made' },
  { href: '/blog/heart-line-hriday-rekha-meaning', label: 'Hriday Rekha — Heart Line', note: 'How you attach' },
  { href: '/blog/head-line-mastishk-rekha-meaning', label: 'Mastishk Rekha — Head Line', note: 'Why your job may not fit' },
  { href: '/blog/marriage-line-vivah-rekha-meaning', label: 'Vivah Rekha — Marriage Line', note: 'Two lines ≠ two marriages' },
  { href: '/blog/sun-line-surya-rekha-meaning', label: 'Surya Rekha — Sun Line', note: 'The invisible workhorse' },
];

const HUB_SIGNS: HubItem[] = [
  { href: '/blog/fish-sign-machli-on-palm-meaning', label: 'Machli — Fish Sign', note: 'Most people have an island' },
  { href: '/blog/m-sign-on-palm-meaning', label: 'The M Sign', note: 'It is not rare' },
  { href: '/blog/trishul-sign-on-palm-meaning', label: 'Trishul Sign', note: 'An amplifier, not a promise' },
  { href: '/blog/star-triangle-square-on-palm-meaning', label: 'Star, Triangle, Square', note: 'A square forms over damage' },
  { href: '/blog/island-cross-grille-on-palm-meaning', label: 'Island, Cross, Grille', note: 'The marks you are sold fear about' },
  { href: '/blog/rare-auspicious-signs-on-palm', label: 'Swastik, Shankh, Chakra', note: 'The rarity paradox' },
];

const HUB_STRUCTURE: HubItem[] = [
  { href: '/blog/hast-rekha-gyan-samudrika-shastra-guide', label: 'The Complete Hast Rekha Guide', note: 'Start here — the pillar' },
  { href: '/blog/mounts-on-palm-parvat-meaning', label: 'The Seven Mounts (Parvat)', note: 'Lines are verbs, mounts are nouns' },
  { href: '/blog/which-hand-to-read-palmistry-hand-shapes', label: 'Which Hand? Hand Shapes', note: 'The reading is the difference' },
  { href: '/blog/is-palm-reading-accurate-ai-palmistry', label: 'Is Palm Reading Accurate?', note: 'The honest answer' },
  { href: '/blog/ai-palm-reading-online-hast-rekha', label: 'How the AI Reads a Palm', note: 'What the machine actually sees' },
];

function HubList({ items }: { items: HubItem[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="group block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold text-amber-300 group-hover:text-amber-200">{i.label}</span>
            <span className="block text-xs text-slate-400">{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function HastRekhaPage() {
  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          JSON-LD — plain <script> from a SERVER component so it lands
          in the SSR HTML. Do NOT convert to next/script. See header.
      ─────────────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                '@id': `${PAGE_URL}#app`,
                name: 'AI Hast Rekha Calculator',
                alternateName: ['AI Palmistry Calculator India', 'Samudrika Shastra AI Tool'],
                description:
                  'AI-powered Indian palmistry calculator using computer vision for hand landmark detection, palm line extraction and Samudrika Shastra rule-based analysis. Personalised Hast Rekha reports in Hindi, English and Hinglish.',
                url: PAGE_URL,
                applicationCategory: 'LifestyleApplication',
                operatingSystem: 'Web, iOS, Android',
                inLanguage: ['hi-IN', 'en-IN'],
                isPartOf: { '@id': 'https://trikalvaani.com/#website' },
                offers: { '@id': `${PAGE_URL}#offer` },
                featureList: [
                  'AI 21-point hand landmark detection',
                  'Palm line extraction — 6 lines and 7 mounts',
                  'Samudrika Shastra rule engine (40+ niyam)',
                  'Every sign read against the mount that carries it',
                  '8 life dimension scores',
                  'Personalised classical remedies',
                  'Downloadable PDF report',
                  'No birth time, birth date or birth place required',
                  'Palm image never stored on our servers',
                  'Hindi, English and Hinglish support',
                ],
                author: { '@id': PERSON_ID },
                publisher: { '@id': ORG_ID },
              },
              {
                '@type': 'Service',
                '@id': `${PAGE_URL}#service`,
                name: 'AI Hast Rekha (Palm Reading) Report',
                serviceType: 'Palmistry Reading',
                description:
                  'A classical Samudrika Shastra palm reading generated from a single palm photograph — 6 lines, 7 mounts, 8 life scores, personalised remedies and a downloadable PDF report. No birth time required.',
                url: PAGE_URL,
                provider: { '@id': ORG_ID },
                areaServed: [
                  { '@type': 'Country', name: 'India' },
                  { '@type': 'City', name: 'Delhi' },
                  { '@type': 'City', name: 'Noida' },
                  { '@type': 'City', name: 'Gurgaon' },
                  { '@type': 'City', name: 'Ghaziabad' },
                  { '@type': 'Place', name: 'Worldwide' },
                ],
                audience: { '@type': 'Audience', audienceType: 'People seeking Vedic palmistry guidance' },
                offers: { '@id': `${PAGE_URL}#offer` },
              },
              {
                '@type': 'Offer',
                '@id': `${PAGE_URL}#offer`,
                price: '51',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                priceValidUntil: '2027-03-31',
                url: PAGE_URL,
                description:
                  'Full Samudrika Shastra Hast Rekha report with PDF — 8 life dimension scores, 6 line and 7 mount analysis, personalised remedies. One photo. No birth time. No puja, gemstone or follow-up sitting sold afterwards.',
                eligibleRegion: { '@type': 'Place', name: 'Worldwide' },
                seller: { '@id': ORG_ID },
              },
              {
                '@type': 'Person',
                '@id': PERSON_ID,
                name: 'Rohiit Gupta',
                jobTitle: 'Chief Vedic Architect',
                url: 'https://trikalvaani.com/founder',
                image: 'https://trikalvaani.com/Rohiit-Gupta.jpg',
                description:
                  'Founder of Trikaal Vaani. Sixteen years of personal practice in Vedic astrology in the Parashara tradition (Brihat Parashara Hora Shastra), and in Samudrika Shastra.',
                knowsAbout: [
                  'Samudrika Shastra',
                  'Vedic Astrology',
                  'Jyotish Shastra',
                  'Indian Palmistry',
                  'Brihat Parashara Hora Shastra',
                ],
                worksFor: { '@id': ORG_ID },
              },
              {
                '@type': 'Organization',
                '@id': ORG_ID,
                name: 'Trikaal Vaani',
                legalName: 'Trikal Vaani',
                url: 'https://trikalvaani.com',
                logo: 'https://trikalvaani.com/Trikal_Logo.png',
                sameAs: REAL_SAMEAS,
              },
              {
                '@type': 'FAQPage',
                '@id': `${PAGE_URL}#faq`,
                mainEntity: FAQS.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${PAGE_URL}#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
                  { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
                  { '@type': 'ListItem', position: 3, name: 'AI Hast Rekha Calculator', item: PAGE_URL },
                ],
              },
            ],
          }),
        }}
      />

      <HastRekhaClient faqs={FAQS} />

      {/* ══════════════════════════════════════════════════════════
          SEO / GEO / AEO / E-E-A-T CONTENT BLOCK — server rendered.
          This is what a crawler and an AI answer engine actually read.
          Never move this into a client-only component.
      ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-5 pb-24 pt-6 text-slate-300">

        {/* ── 40–60 WORD DIRECT ANSWER (AEO / GEO extraction target) ── */}
        <div
          className="rounded-2xl border p-6 md:p-7"
          style={{ borderColor: 'rgba(212,175,55,0.35)', background: 'rgba(13,17,30,0.85)' }}
        >
          <h2 className="mb-3 font-serif text-xl font-bold" style={{ color: GOLD }}>
            What is the AI Hast Rekha Calculator?
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-200">
            The AI Hast Rekha Calculator reads your palm from a single photograph and applies classical
            Samudrika Shastra rules to what it finds — all six major lines and all seven mounts. You receive
            eight life scores, a full classical interpretation, personalised remedies and a downloadable PDF
            report, for ₹51. No birth time, no birth date and no birth place are required.
          </p>
        </div>

        {/* ── WHAT YOU ACTUALLY GET ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          What the ₹51 report actually contains
        </h2>
        <p className="mb-4 leading-relaxed">
          A palmist in Delhi, Noida or Gurgaon charges between ₹500 and ₹2,000 to hold your hand for twenty
          minutes and tell you something you have no way to verify. What you are buying here is the same
          classical tradition, applied by a system that cannot see your face — and that has nothing to sell you
          when it finishes.
        </p>
        <ul className="mb-4 space-y-3 text-[15px]">
          <li>
            <strong className="text-amber-300">All six major lines.</strong> Jeevan Rekha (life line), Mastishk
            Rekha (head line), Hriday Rekha (heart line), Bhagya Rekha (fate line), Surya Rekha (sun line) and
            the Vivah Rekha (marriage lines) — each read against the others, never in isolation. A fate line
            means one thing beside a strong sun line and something completely different without one.
          </li>
          <li>
            <strong className="text-amber-300">All seven mounts.</strong> Guru (Jupiter), Shani (Saturn), Surya
            (Sun), Budh (Mercury), Shukra (Venus), Mangal (Mars) and Chandra (Moon). The mounts supply the
            qualities; the lines only describe what is being done with them. Most readings skip the mounts
            entirely — which is precisely why most readings tell you nothing you can use.
          </li>
          <li>
            <strong className="text-amber-300">Every sign, read against the mount that carries it.</strong> A
            star on the Surya Parvat indicates sudden elevation. The same star on the Shani Parvat is
            classically read as a shock. Same symbol, opposite meaning. Placement decides everything, and any
            reading that names a symbol without naming the mount has deleted the shastra.
          </li>
          <li>
            <strong className="text-amber-300">Eight life dimension scores</strong> — career, wealth, health,
            relationships, vitality, leadership, creativity and spirituality.
          </li>
          <li>
            <strong className="text-amber-300">Personalised classical remedies</strong> drawn from the
            Samudrika corpus. Not a generic list. Not a shopping list.
          </li>
          <li>
            <strong className="text-amber-300">A downloadable PDF report</strong> that is yours to keep, in
            Hindi, English or Hinglish.
          </li>
        </ul>

        <div className="my-10 text-center">
          <Link
            href="#top"
            className="inline-block rounded-xl px-8 py-3.5 text-base font-bold text-slate-950 shadow-lg transition hover:brightness-110"
            style={{ background: GOLD }}
          >
            Read my palm — ₹51 →
          </Link>
          <p className="mt-2 text-xs text-slate-500">One photo · No birth time · No subscription</p>
        </div>

        {/* ── ANTI-FEAR: the differentiator, placed where the wallet is ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          What we will never tell you
        </h2>
        <p className="mb-4 leading-relaxed">
          Most of the Indian palmistry market runs on a single mechanism, and it is worth naming plainly.
          <strong> Find a mark. Name a disaster. Sell the remedy.</strong> Every adult hand carries islands,
          crosses and grilles somewhere — they are the ordinary texture of a lived life — so a reader searching
          for something frightening on your palm will always find it. Then a date gets attached, vague enough
          to survive and specific enough to grip. And then the ₹500 consultation becomes ₹15,000.
        </p>
        <p className="mb-4 leading-relaxed">
          The money is the smaller loss. People make genuinely bad decisions under that pressure — they refuse
          good matches, decline jobs, delay medical care, and carry a dread that shapes years of their life.
        </p>
        <ul className="mb-4 space-y-3 text-[15px]">
          <li>
            <strong className="text-rose-300">We will never tell you when you will die.</strong> No mark on
            your hand predicts lifespan. A short life line does not mean a short life — it never did, and the
            people who told you otherwise frightened you for money.
          </li>
          <li>
            <strong className="text-rose-300">We will never diagnose an illness.</strong> Palmistry cannot do
            this and no honest practitioner claims it can. For any health concern, consult a doctor. If you are
            struggling with your mental health, please speak to a qualified professional — a palm reading is
            not an assessment and not a treatment.
          </li>
          <li>
            <strong className="text-rose-300">We will never predict your divorce.</strong> A downward-curving
            marriage line means the bond cost you something — which describes an enormous number of marriages
            that are still standing. Your hand does not contain a decree.
          </li>
          <li>
            <strong className="text-rose-300">We will never give you a date.</strong> Not a wedding date, not a
            job date. You cannot map forty years of adult life onto a centimetre of skin. Timing is a birth
            chart question — the 7th house, its lord, the Dasha sequence. That is what Jyotish is for, and we
            would rather send you there than sell you a number.
          </li>
          <li>
            <strong className="text-rose-300">We will never promise you money.</strong> Not from a fish sign,
            not from a Swastik, not from a sun line. Nothing on your hand delivers a sum. When every symbol
            produces the same prediction, the symbols have stopped meaning anything.
          </li>
          <li>
            <strong className="text-rose-300">We will never sell you a remedy for a fear we manufactured.</strong>{' '}
            There is nothing after the ₹51. No puja. No gemstone. No thread. No follow-up sitting. That entire
            business model is the reason this platform exists.
          </li>
        </ul>
        <p className="mb-4 leading-relaxed">
          And a word on gemstones, since that is where most of the money in this industry actually sits:{' '}
          <strong>never wear a stone on the strength of a palm mark.</strong> Remedial stones are prescribed
          from the birth chart, not the hand, and the wrong stone does real harm. Check suitability against your
          actual chart with the{' '}
          <Link href="/calculators/free-gemstone-suitability-calculator" className="text-amber-300 underline underline-offset-4">
            gemstone suitability calculator
          </Link>{' '}
          before spending a rupee.
        </p>

        {/* ── WHY AI — INCLUDING WHERE IT IS WORSE ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          Why an AI reading — and where it is genuinely worse
        </h2>
        <p className="mb-4 leading-relaxed">We will make the case against ourselves first, because you deserve that.</p>
        <p className="mb-4 leading-relaxed">
          A skilled palmist has one real advantage over any photograph: they can <strong>press your mounts</strong>.
          A mount cannot be assessed by looking at it — it has to be touched. A full <em>spongy</em> Shukra
          Parvat and a full <em>firm</em> one mean opposite things: indulgence versus warmth. Elevation
          photographs well; firmness does not. Skin texture and palm flexibility photograph poorly too. If you
          have access to a genuinely skilled, non-commercial palmist, use them.
        </p>
        <p className="mb-4 leading-relaxed">
          Most people in this country do not. What they have access to is a market with a powerful incentive to
          frighten them.
        </p>
        <p className="mb-4 leading-relaxed">
          And here is the one thing an engine does that a human reader structurally cannot:{' '}
          <strong>cold reading requires a reader.</strong> A palmist watches your face. They see you flinch at
          &ldquo;career trouble&rdquo; and lean in. They see you brighten at &ldquo;creative&rdquo; and expand
          on it. Most do it without any conscious intent to deceive — it is simply what one human does across a
          table from another human who is hoping.
        </p>
        <p className="mb-6 leading-relaxed">
          An engine reading a photograph does none of that. It does not see your face. It does not know your
          age, your job, your anxieties, or which answer would please you. It returns the same reading to
          anyone with the same hand.{' '}
          <strong className="text-amber-300">It is not rooting for you.</strong> That is not a marketing line —
          it is the entire product.
        </p>

        {/* ── HOW IT WORKS + PHOTO GUIDE ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          How to get your reading — and how to take the photo
        </h2>
        <ol className="mb-4 space-y-3 text-[15px]">
          <li>
            <strong className="text-amber-300">1. Photograph your dominant hand.</strong> The hand you write
            with — if you are left-handed, that is your left hand, regardless of the old
            &ldquo;right-for-men&rdquo; convention, which is a reading-order tradition and not a difference in
            meaning. The dominant hand shows what you built. The non-dominant shows what you were given. Upload
            both if you can: <strong>the difference between them is the reading</strong>, and almost nobody
            performs it.
          </li>
          <li>
            <strong className="text-amber-300">2. Daylight. No flash.</strong> Flash floods the palm and erases
            the fine lines completely — including every marriage line and every small sign. Stand near a
            window. Keep the palm flat and open, fingers slightly apart, camera straight above rather than
            angled, frame filled from wrist to fingertips. Then zoom in and check: if <em>you</em> cannot see
            the fine lines, neither can the engine.
          </li>
          <li>
            <strong className="text-amber-300">3. Upload and pay ₹51.</strong> The engine detects the lines,
            mounts and signs, applies the classical rules, and returns your report with a downloadable PDF.
            Your palm image is never stored on our servers — it stays in your browser session and is removed
            after the analysis.
          </li>
        </ol>
        <p className="mb-4 leading-relaxed">
          Photo quality is the single largest variable in the accuracy of your reading. Not the engine —{' '}
          <strong>the photo</strong>. That one sentence will improve your result more than anything else on
          this page.
        </p>

        {/* ── E-E-A-T: VISIBLE, NOT JUST MARKUP ── */}
        <div
          className="my-12 rounded-2xl border p-6 md:p-7"
          style={{ borderColor: 'rgba(212,175,55,0.35)', background: 'rgba(13,17,30,0.85)' }}
        >
          <h2 className="mb-3 font-serif text-xl font-bold" style={{ color: GOLD }}>
            Who is behind this reading
          </h2>
          <p className="mb-3 text-[15px] leading-relaxed">
            <strong className="text-amber-300">Rohiit Gupta</strong> — Founder and Chief Vedic Architect of
            Trikaal Vaani. Sixteen years of personal practice in Vedic astrology in the{' '}
            <strong>Parashara tradition</strong> (Brihat Parashara Hora Shastra), and in Samudrika Shastra.
            Trikaal Vaani is a registered MSME (UDYAM-DL-10-0119070), based in Dwarka, New Delhi 110075, serving
            clients across Delhi NCR — Delhi, Noida, Gurgaon and Ghaziabad — and worldwide.
          </p>
          <p className="mb-3 text-[15px] leading-relaxed">
            The rules this engine applies are not invented. They are drawn from the classical corpus:{' '}
            <strong>Samudrika Shastra</strong>, the <strong>Hasta Sanjeevani</strong>, the Hast Rekha khand of
            the <strong>Ravan Samhita</strong>, and the body-lakshana chapters of Varahamihira&rsquo;s{' '}
            <strong>Brihat Samhita</strong>. Where the tradition is silent — on dates, on lifespan, on disease —{' '}
            <strong>we are silent too.</strong>
          </p>
          <Link href="/founder" className="text-sm font-semibold text-amber-300 underline underline-offset-4">
            More about Rohiit Gupta →
          </Link>
        </div>

        {/* ── HUB INTERLINKING — this page becomes the heart, not a dead end ── */}
        <h2 className="mb-2 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          Learn what your hand is actually saying
        </h2>
        <p className="mb-6 leading-relaxed">
          We have written the most complete honest palmistry library in India — seventeen guides, and not one of
          them will frighten you into buying anything. Read before you decide, or read afterwards to understand
          your report. Both are fine.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3
              className="mb-3 border-b pb-2 font-serif text-base font-bold text-slate-200"
              style={{ borderColor: 'rgba(212,175,55,0.25)' }}
            >
              The six lines
            </h3>
            <HubList items={HUB_LINES} />
          </div>
          <div>
            <h3
              className="mb-3 border-b pb-2 font-serif text-base font-bold text-slate-200"
              style={{ borderColor: 'rgba(212,175,55,0.25)' }}
            >
              The signs
            </h3>
            <HubList items={HUB_SIGNS} />
          </div>
          <div>
            <h3
              className="mb-3 border-b pb-2 font-serif text-base font-bold text-slate-200"
              style={{ borderColor: 'rgba(212,175,55,0.25)' }}
            >
              Structure &amp; truth
            </h3>
            <HubList items={HUB_STRUCTURE} />
          </div>
        </div>

        {/* ── WHEN THE PALM IS THE WRONG TOOL ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          When the palm is the wrong instrument
        </h2>
        <p className="mb-4 leading-relaxed">
          We would rather tell you this than take your money for the wrong thing. If your question is{' '}
          <em>when</em> — when will I marry, when will the job come, when does this phase end — the palm cannot
          answer it, and neither can we. That is a birth chart question and it needs your birth time.
        </p>
        <ul className="mb-4 space-y-2 text-[15px]">
          <li>
            <Link href="/calculators/free-kundali-calculator" className="text-amber-300 underline underline-offset-4">
              Free Kundali Calculator
            </Link>{' '}
            — for timing, Dasha and the actual structure of your chart.
          </li>
          <li>
            <Link href="/kundali-milan" className="text-amber-300 underline underline-offset-4">
              Kundali Milan
            </Link>{' '}
            — for assessing a specific match. Palmistry reads one hand; it cannot compare two people.
          </li>
          <li>
            <Link href="/calculators/free-gemstone-suitability-calculator" className="text-amber-300 underline underline-offset-4">
              Gemstone Suitability Calculator
            </Link>{' '}
            — before you ever wear a stone, and never on the strength of a palm mark.
          </li>
          <li>
            <Link href="/calculators" className="text-amber-300 underline underline-offset-4">
              All free calculators
            </Link>
          </li>
        </ul>

        {/* ── LOCAL (IR-0b) ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          Palm reading in Delhi NCR — and everywhere else
        </h2>
        <p className="mb-4 leading-relaxed">
          Trikaal Vaani is based in <strong>Dwarka, New Delhi</strong>, and a large share of the people who use
          this calculator arrive searching for a <em>palmist near me</em> in Delhi, Noida, Gurgaon or Ghaziabad
          — usually late at night, usually after seeing something on their hand that worried them.
        </p>
        <p className="mb-4 leading-relaxed">
          You do not need to travel, book a slot, or sit across a table from someone quietly deciding how much
          you can afford. The reading is the same classical Samudrika Shastra whether you are in Dwarka, Noida
          Sector 62, Gurgaon, Ghaziabad, Mumbai, Bengaluru or Dubai. One photograph, ₹51, and a report you keep.
        </p>
        <p className="mb-6 leading-relaxed">
          And if your report says something you do not like, read it as a description of{' '}
          <strong>current conditions</strong>, not a sentence passed on your life. The secondary lines of the
          hand change measurably over a lifetime. Yours have already changed. They will change again.{' '}
          <strong>A mark that can vanish was never a fate.</strong>
        </p>

        <div className="mt-10 text-center">
          <Link
            href="#top"
            className="inline-block rounded-xl px-8 py-3.5 text-base font-bold text-slate-950 shadow-lg transition hover:brightness-110"
            style={{ background: GOLD }}
          >
            Read my palm — ₹51 →
          </Link>
          <p className="mt-2 text-xs text-slate-500">
            One photo · No birth time · Palm image never stored · No puja, no gemstone, no second sitting
          </p>
        </div>
      </section>
    </>
  );
}
