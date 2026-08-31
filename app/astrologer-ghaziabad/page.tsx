/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/astrologer-ghaziabad/page.tsx
 * Version:     v1.1
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Created:     2026-07-17
 * Updated:     2026-08-31
 *
 * PURPOSE:
 *   Local SEO satellite page for Ghaziabad (Delhi NCR). Companion to the flagship
 *   /astrologer-delhi. Re-introduces /astrologer-{city} after IR-20 (the old
 *   "global not local" ban) was SUPERSEDED by CEO order, July 2026, following
 *   Google Business Profile approval.
 *
 * SCHEMA DECISION — READ BEFORE EDITING:
 *   This page carries a **Service** schema with areaServed: Ghaziabad.
 *   It deliberately does NOT carry a LocalBusiness schema.
 *   Reason: Trikaal Vaani has ONE physical location (Dwarka, New Delhi) and one
 *   Google Business Profile. Repeating a LocalBusiness block with the same NAP
 *   across four city pages reads as manipulation to Google and risks the entire
 *   local presence. The single LocalBusiness entity lives on /astrologer-delhi,
 *   which is the real GBP city. Every other city page inherits authority from it
 *   via areaServed + provider @id references. Do not "helpfully" add a
 *   LocalBusiness block here.
 *   v1.1 REAFFIRMS THIS. It was questioned on 31 Aug 2026 on the grounds that
 *   "LocalBusiness is missing on three of four city pages"; that reading was
 *   wrong. The absence is the design. The provider reference below now carries
 *   an explicit @id pointer to the one LocalBusiness entity so the relationship
 *   is machine-readable rather than merely implied.
 *
 * ── CHANGES v1.0 -> v1.1 (2026-08-31) ──────────────────────────────────────
 *   1. DELHI-NCR DAMAGE REPAIRED (two places, both inside the Service schema).
 *      brand-guard.yml v5 ran s/Delhi NCR/India/g on every push and rewrote:
 *        schema description : "clients in Ghaziabad and India"
 *                             -> "clients in Ghaziabad and Delhi NCR"
 *        areaServed         : { Place: 'India' } sitting next to
 *                             { Country: 'India' } — the same value twice,
 *                             which is what the rule left behind.
 *                             The Place node is now 'Delhi NCR' again.
 *      Prose in the JSX was untouched by the bot on this page; only the schema
 *      strings were hit. Comment lines were always skipped, which is why the
 *      PURPOSE block above still says "Delhi NCR" and gave the game away.
 *      REQUIRES brand-guard.yml v6 (rule retired) TO BE DEPLOYED FIRST, or the
 *      bot will undo both again within seconds of the push.
 *   2. TITLE DUPLICATION FIXED. Live <title> read
 *      "... | Trikaal Vaani | Trikaal Vaani" because metadata.title already
 *      carries the brand AND the root layout re-applies its title template.
 *      Now uses title: { absolute: ... }, the same fix app/blog/[slug]/page.tsx
 *      took in its v2.3. This page was one of the 43 Radar flagged on 30 Aug.
 *   3. FEE CATALOG CORRECTED against the live /pricing page (verified
 *      31 Aug 2026). v1.0 was missing the Rs151 Kundali Milan tier, the
 *      Rs101/Rs151 Child Birth Muhurat tiers and the Rs499 On-Call
 *      Consultation.
 *      ⚠️ OPEN ITEM FOR CEO: the Rs499 On-Call Consultation does NOT appear
 *      anywhere on /pricing. It is in this catalog because you confirmed it is
 *      a real product — but a visitor who reads the offer and clicks through
 *      will not find it. Either add it to /pricing or tell me to remove it.
 *   4. WhatsApp SURFACED. GBP has WhatsApp set as the PRIMARY chat channel, and
 *      Radar found "whatsapp par free jyotish paramarsh", "jyotishi se baat
 *      free" and "free jyotish number" recurring in NCR PASF. A tel: link alone
 *      was not catching that intent. Added to the contact line, the schema
 *      ServiceChannel and the closing CTA.
 *   5. CROSS-LINKS ADDED — to the two sibling NCR city pages, and to the
 *      /blog/astrologer-near-me-ghaziabad guide. The blog page is SUPPORTING
 *      content ("near me + fees + free chat" informational intent); THIS page
 *      is the primary local landing page for "astrologer in Ghaziabad". They are
 *      deliberately not redirected or canonicalised into each other — they
 *      answer different questions and now link to each other to say so.
 *
 * NAP HONESTY:
 *   We state the ONE real address (Dwarka) even on non-Delhi pages, and say
 *   plainly that there is no local office. Inventing a Ghaziabad address would be
 *   both dishonest and self-defeating: fabricated NAPs are the fastest known way
 *   to destroy local ranking.
 *
 * PATTERN SOURCE: app/kundali-milan/page.tsx v1.3 + app/astrologer-delhi/page.tsx v1.1
 * SITEMAP: /astrologer-ghaziabad is listed in LOCAL_ROUTES in app/sitemap.ts v8.2+.
 * ============================================================================
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'

export const metadata: Metadata = {
  // v1.1: `absolute` stops the root layout title template appending the brand a
  // second time. The brand stays inside this string on purpose — once, in the
  // SERP title, is correct.
  title: {
    absolute: 'Astrologer in Ghaziabad — Rohiit Gupta, Chief Vedic Architect | Trikaal Vaani',
  },
  description:
    'Looking for an astrologer in Ghaziabad? Rohiit Gupta, Chief Vedic Architect at Trikaal Vaani, offers Vedic astrology readings online — kundli, Kundali Milan, Mangal Dosh, Sade Sati. Swiss Ephemeris + BPHS classical rules. Free tools, readings from Rs11.',
  keywords:
    'astrologer in ghaziabad, best astrologer in ghaziabad, vedic astrologer ghaziabad, astrologer near me ghaziabad, jyotish in ghaziabad, kundli in ghaziabad, kundali milan ghaziabad, pandit ji ghaziabad online, astrologer in indirapuram, astrologer in vaishali ghaziabad',
  alternates: {
    canonical: 'https://trikalvaani.com/astrologer-ghaziabad',
  },
  openGraph: {
    title: 'Astrologer in Ghaziabad — Rohiit Gupta, Chief Vedic Architect | Trikaal Vaani',
    description:
      'Looking for an astrologer in Ghaziabad? Rohiit Gupta, Chief Vedic Architect at Trikaal Vaani, offers Vedic astrology readings online — kundli, Kundali Milan, Mangal Dosh, Sade Sati. Swiss Ephemeris + BPHS classical rules. Free tools, readings from Rs11.',
    url: 'https://trikalvaani.com/astrologer-ghaziabad',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikaal Vaani',
    images: [{
      url: 'https://trikalvaani.com/og-default.jpg',
      width: 1200, height: 630,
      alt: 'Trikaal Vaani — Astrologer for Ghaziabad, Rohiit Gupta',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrologer in Ghaziabad — Rohiit Gupta | Trikaal Vaani',
    description: 'Vedic astrology online for Ghaziabad. Swiss Ephemeris + BPHS. Free tools, readings from Rs11.',
    images: ['https://trikalvaani.com/og-default.jpg'],
  },
}

const GOLD = '#D4AF37'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`

// ── Service schema (NOT LocalBusiness — see header) ──────────────────────────
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://trikalvaani.com/astrologer-ghaziabad#service',
  name: 'Vedic Astrology Readings for Ghaziabad — Trikaal Vaani',
  serviceType: 'Vedic Astrology Reading',
  url: 'https://trikalvaani.com/astrologer-ghaziabad',
  description:
    'Online Vedic astrology readings for clients in Ghaziabad and Delhi NCR — kundli, Kundali Milan, Mangal Dosh and Sade Sati analysis — computed on a self-hosted Swiss Ephemeris engine using Brihat Parashara Hora Shastra classical rules, under Rohiit Gupta, Chief Vedic Architect.',
  provider: {
    '@type': 'Organization',
    '@id': 'https://trikalvaani.com/#organization',
    name: 'Trikaal Vaani',
    url: 'https://trikalvaani.com',
    telephone: '+91-9211804111',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '724, Pocket 3, Sector 19, Dwarka',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      postalCode: '110075',
      addressCountry: 'IN',
    },
  },
  // v1.1: explicit machine-readable pointer to the ONE LocalBusiness entity,
  // which lives on /astrologer-delhi. This page still does not declare one.
  isRelatedTo: { '@id': 'https://trikalvaani.com/#localbusiness' },
  areaServed: [
    { '@type': 'City', name: 'Ghaziabad' },
    { '@type': 'Place', name: 'Delhi NCR' },
    { '@type': 'Country', name: 'India' },
  ],
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://trikalvaani.com',
    servicePhone: '+91-9211804111',
    availableLanguage: [
      { '@type': 'Language', name: 'Hindi' },
      { '@type': 'Language', name: 'English' },
    ],
  },
  // v1.1: rebuilt against the live /pricing page, verified 31 Aug 2026.
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Vedic Astrology Services — Ghaziabad',
    itemListElement: [
      { '@type': 'Offer', name: 'Free Kundli, all calculators & Trikaal Ka Sandesh', price: '0', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Trikaal Ki Awaaz — Voice Reading (1 question)', price: '11', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Deep Reading — one life domain', price: '51', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Kundali Milan — Basic, full 36-Guna Ashtakoot', price: '51', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Kundali Milan — Deep, 1000-word with 10 remedies', price: '101', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Child Birth Muhurat — full report', price: '101', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Kundali Milan — Both, Couple + Parent narratives', price: '151', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Child Birth Muhurat — report with 10 remedies', price: '151', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Karmic Background Reading — career, wealth and relationships', price: '251', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'On-Call Consultation with Rohiit Gupta', price: '499', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
    ],
  },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['.geo-direct-answer', '.faq-speakable', 'h1', 'h2'],
  },
}

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
    { '@type': 'ListItem', position: 2, name: 'Astrologer in Delhi', item: 'https://trikalvaani.com/astrologer-delhi' },
    { '@type': 'ListItem', position: 3, name: 'Astrologer in Ghaziabad', item: 'https://trikalvaani.com/astrologer-ghaziabad' },
  ],
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you have an office in Ghaziabad?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. The practice is registered at 724, Pocket 3, Sector 19, Dwarka, New Delhi 110075. Readings are delivered online from your birth details, so a Ghaziabad client gets exactly the same computation as anyone else. We prefer to state our one genuine address plainly rather than list a local one that does not exist.' },
    },
    {
      '@type': 'Question',
      name: 'Who is the astrologer behind Trikaal Vaani?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rohiit Gupta, Chief Vedic Architect of Trikaal Vaani, with sixteen years of personal practice in the Parashara BPHS tradition. Every reading is computed on a self-hosted Swiss Ephemeris engine using Lahiri ayanamsa — no third-party API — and interpreted under his supervision.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can the whole family see the Kundali Milan report?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, and we would encourage it. The Kundali Milan report is written to be read by the family, not just the couple — full 36 Guna Ashtakoot breakdown, Mangal Dosh graded with its cancellations, Nadi and Bhakoot checked, and a plain verdict. It can be downloaded as a PDF and shared on WhatsApp, so the discussion happens over facts rather than over a remembered remark.' },
    },
    {
      '@type': 'Question',
      name: 'How much does a reading cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free kundli and all calculators cost nothing. A voice reading starts at Rs11, a Deep Reading is Rs51, Kundali Milan runs Rs51 Basic, Rs101 Deep or Rs151 for both narratives, a Child Birth Muhurat report is Rs101 or Rs151 with remedies, and a Karmic Background Reading is Rs251. Anything that is a computation — your kundli, your Mangal Dosh status, your Sade Sati phase — is free, permanently. You pay only for interpretation, and the price is the same in Ghaziabad as anywhere else in India.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I talk to an astrologer free before paying?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Message +91 92118 04111 on WhatsApp and ask your question at no cost before any payment is discussed. Every calculator on the site is separately free and returns a real computed result, not a teaser. What free does not cover is a full written personalised reading or a scheduled call, because those take real time.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Trikaal Vaani a registered business?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Trikaal Vaani is a Government of India MSME registered enterprise under Udyam registration UDYAM-DL-10-0119070, and holds a verified Google Business Profile as an astrologer in Delhi. Both can be checked publicly before you trust anything said here.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I get a reading in Hindi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Readings, voice messages and the entire blog are available in both Hindi and English. The Trikaal Ki Awaaz voice reading is delivered in Hindi or Hinglish, whichever you prefer.',
      },
    },
  ],
}

const SERVICES = [
  { name: 'Free Kundli', desc: 'Full birth chart, planetary positions, Vimshottari dasha — computed on Swiss Ephemeris.', href: '/calculators/free-kundali-calculator', price: 'Free' },
  { name: 'Kundali Milan', desc: '36 Guna Ashtakoot, Mangal Dosh, Nadi Dosh and Bhakoot check across both charts.', href: '/kundali-milan', price: 'From Rs51' },
  { name: 'Mangal Dosh Check', desc: 'Is the dosh present, how strong, and is it already cancelled — graded honestly.', href: '/calculators/free-manglik-dosh-calculator', price: 'Free' },
  { name: 'Sade Sati Check', desc: 'Which phase of Shani Sade Sati you are in, and what it actually means.', href: '/calculators/free-sade-sati-calculator', price: 'Free' },
  { name: 'Deep Reading', desc: '900-word analysis with five personalised upay and action windows.', href: '/pricing', price: 'Rs51' },
  { name: 'Karmic Background Reading', desc: 'Bhrigu Nadi karmic pattern analysis — past-life debt and current dharma path.', href: '/karmic-background-reading', price: 'Rs251' },
]

const AREAS = ['Indirapuram', 'Vaishali', 'Raj Nagar', 'Kaushambi', 'Vasundhara', 'Delhi', 'Noida', 'Greater Noida', 'All India']

export default function AstrologerGhaziabadPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      <div className="min-h-screen bg-[#080B12]">
        <SiteNav />
        <main>

          {/* SECTION 1 — GEO DIRECT ANSWER (speakable) */}
          <section className="pt-24 pb-8 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.25)}`,
                color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '16px',
              }}>
                Astrologer for Ghaziabad · Online
              </span>
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
                Astrologer in <span style={{ color: GOLD }}>Ghaziabad</span>
              </h1>
              <p className="geo-direct-answer" style={{
                color: '#94a3b8', fontSize: '15px', lineHeight: 1.7,
                maxWidth: '720px', margin: '0 auto',
              }}>
                <strong style={{ color: '#cbd5e1' }}>Trikaal Vaani</strong> serves Ghaziabad, Indirapuram and Vaishali entirely online, led by <strong style={{ color: '#cbd5e1' }}>Rohiit Gupta, Chief Vedic Architect</strong>, with sixteen years in the Parashara BPHS tradition. Kundli, Kundali Milan, Mangal Dosh and Sade Sati readings are computed on a self-hosted Swiss Ephemeris engine, in Hindi or English.
              </p>
            </div>
          </section>

          {/* SECTION 2 — HONEST LOCATION BLOCK */}
          <section className="pb-12 px-4">
            <div className="max-w-3xl mx-auto">
              <div style={{
                background: 'rgba(13,17,30,0.6)', border: `1px solid ${GOLD_RGBA(0.18)}`,
                borderRadius: '14px', padding: '24px', textAlign: 'center',
              }}>
                <p style={{ color: GOLD, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  No Ghaziabad Office — And We Will Say So
                </p>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.8, margin: '0 auto', maxWidth: '620px' }}>
                  Trikaal Vaani has one registered address:{' '}
                  <strong style={{ color: '#cbd5e1' }}>724, Pocket 3, Sector 19, Dwarka, New Delhi 110075</strong>.
                  There is no Ghaziabad branch, and we are not going to pretend there is. Every reading is computed from your
                  birth details and delivered online, so a Ghaziabad client receives the identical result from the identical
                  engine. Proximity is convenience — never accuracy. Read more on{' '}
                  <Link href="/blog/astrologer-near-me-online-vedic-consultation" style={{ color: GOLD, textDecoration: 'underline' }}>
                    why &ldquo;astrologer near me&rdquo; actually means online, not local
                  </Link>.
                </p>
                <p style={{ margin: '14px 0 0', color: '#64748b', fontSize: '12px' }}>
                  <a href="tel:+919211804111" style={{ color: GOLD, textDecoration: 'none' }}>+91 92118 04111</a>
                  {' · '}
                  {/* v1.1: WhatsApp is the PRIMARY chat channel on the GBP and the
                      channel NCR searchers actually ask for. */}
                  <a href="https://wa.me/919211804111" target="_blank" rel="noopener noreferrer" style={{ color: GOLD, textDecoration: 'none' }}>
                    Ask free on WhatsApp
                  </a>
                  {' '}· MSME UDYAM-DL-10-0119070 ·{' '}
                  <Link href="/astrologer-delhi" style={{ color: '#94a3b8', textDecoration: 'underline' }}>Delhi practice →</Link>
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3 — CITY-SPECIFIC ANGLE */}
          <section className="py-16 px-4" style={{ background: 'rgba(13,17,30,0.4)' }}>
            <div className="max-w-3xl mx-auto">
              <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>
                Ghaziabad
              </p>
              <h2 className="text-white text-3xl font-serif font-bold mb-5 text-center">
                What Ghaziabad Actually Asks About
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.9, margin: 0 }}>
                Ghaziabad&rsquo;s questions arrive most often through families rather than individuals, and they are usually about matchmaking. A rishta is being considered, a pandit ji has mentioned Mangal Dosh or Nadi Dosh, and the family now has to decide something serious on the strength of a single word. This is exactly where honest grading matters most, and where it is most often absent. A dosha reported without its strength and without a cancellation check is not a finding — it is a headline. Many matches are broken every year in homes like these on a label nobody ever examined, and a proper Kundali Milan frequently ends the worry rather than deepening it.
              </p>
            </div>
          </section>

          {/* SECTION 4 — WHY (E-E-A-T) */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Why Trikaal Vaani
                </p>
                <h2 className="text-white text-3xl font-serif font-bold mb-3">
                  Honest Grading, Not Fear-Selling
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { h: 'Sixteen Years, One Tradition', p: 'Rohiit Gupta practises within the Parashara BPHS lineage — not a mixture of borrowed systems. Every judgement traces back to a classical rule that can be named and checked.' },
                  { h: 'Computation Is Free, Permanently', p: 'Your kundli, your Mangal Dosh status, your Sade Sati phase — these are computations, not revelations. Charging for them exploits fear. They are free here, and always will be.' },
                  { h: 'Self-Hosted Swiss Ephemeris', p: 'Planetary positions are computed on our own Swiss Ephemeris engine using Lahiri ayanamsa. No third-party API, no shortcuts, no rounding someone else did for us.' },
                  { h: 'Graded, Never Absolute', p: 'A dosha is reported with its strength and its cancellations, not as a verdict. Most turn out mild, partial or already cancelled — and you will be told so, even though it sells nothing.' },
                  { h: 'No Expensive Removal Rituals', p: 'No ritual permanently erases a birth placement, so none is sold. Remedies here are the traditional ones — worship, mantra, fasting, charity — and they cost almost nothing.' },
                  { h: 'Registered and Verifiable', p: 'Government of India MSME registered (UDYAM-DL-10-0119070) with a verified Google Business Profile. You can check both before you trust anything said here.' },
                ].map((c) => (
                  <div key={c.h} style={{
                    background: 'rgba(13,17,30,0.6)', border: '1px solid rgba(148,163,184,0.12)',
                    borderRadius: '12px', padding: '20px',
                  }}>
                    <h3 style={{ color: GOLD, fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>{c.h}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{c.p}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 5 — SERVICES */}
          <section className="py-16 px-4" style={{ background: 'rgba(13,17,30,0.4)' }}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Services
                </p>
                <h2 className="text-white text-3xl font-serif font-bold mb-3">
                  What You Can Get, and What It Costs
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                  Every price is published here rather than quoted after you call, and it is the same price in
                  Ghaziabad as in Dwarka or anywhere else in India. There is no location markup.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SERVICES.map((s) => (
                  <Link key={s.name} href={s.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'rgba(8,11,18,0.6)', border: '1px solid rgba(148,163,184,0.12)',
                      borderRadius: '12px', padding: '20px', height: '100%',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: 0 }}>{s.name}</h3>
                        <span style={{ color: GOLD, fontSize: '12px', fontWeight: 700 }}>{s.price}</span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.8, marginTop: '20px', textAlign: 'center' }}>
                A full fee table, and an honest answer to what an astrologer normally charges in Ghaziabad, is on the{' '}
                <Link href="/blog/astrologer-near-me-ghaziabad" style={{ color: GOLD, textDecoration: 'underline' }}>
                  astrologer near me in Ghaziabad guide
                </Link>
                {' — '}or see every option on the{' '}
                <Link href="/pricing" style={{ color: GOLD, textDecoration: 'underline' }}>pricing page</Link>.
              </p>
            </div>
          </section>

          {/* SECTION 6 — AREAS */}
          <section className="py-16 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Areas Served
              </p>
              <h2 className="text-white text-3xl font-serif font-bold mb-6">
                Ghaziabad and Beyond
              </h2>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {AREAS.map((c) => (
                  <span key={c} style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                    background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.18)}`, color: '#cbd5e1',
                  }}>{c}</span>
                ))}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto' }}>
                Dedicated pages for the rest of Delhi NCR: <Link href="/astrologer-delhi" style={{ color: GOLD, textDecoration: 'underline' }}>Delhi</Link>{', '}<Link href="/astrologer-noida" style={{ color: GOLD, textDecoration: 'underline' }}>Noida</Link>{' and '}<Link href="/astrologer-gurgaon" style={{ color: GOLD, textDecoration: 'underline' }}>Gurgaon</Link>.
              </p>
            </div>
          </section>

          {/* SECTION 7 — FAQ (AEO, speakable) */}
          <section className="py-16 px-4" style={{ background: 'rgba(13,17,30,0.4)' }}>
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Questions
                </p>
                <h2 className="text-white text-3xl font-serif font-bold">Frequently Asked</h2>
              </div>

              <div className="space-y-3">
                {FAQ_SCHEMA.mainEntity.map((f) => (
                  <div key={f.name} className="faq-speakable" style={{
                    background: 'rgba(8,11,18,0.6)', border: '1px solid rgba(148,163,184,0.12)',
                    borderRadius: '12px', padding: '20px',
                  }}>
                    <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>{f.name}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{f.acceptedAnswer.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 8 — CTA */}
          <section className="py-16 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-white text-3xl font-serif font-bold mb-4">
                Start With Something Free
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
                Build your kundli, check a dosha, see your dasha — no payment, no account, no consultation call.
                Or just message on WhatsApp and ask. Decide afterwards whether you want anything more.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/" style={{
                  display: 'inline-block', padding: '14px 32px', borderRadius: '10px',
                  background: GOLD, color: '#080B12', fontSize: '15px', fontWeight: 700,
                  textDecoration: 'none', boxShadow: `0 0 30px ${GOLD_RGBA(0.4)}`,
                }}>
                  🔱 Free Kundli Shuru Karein
                </Link>
                <a
                  href="https://wa.me/919211804111"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block', padding: '14px 32px', borderRadius: '10px',
                    background: 'transparent', color: GOLD, fontSize: '15px', fontWeight: 700,
                    textDecoration: 'none', border: `1px solid ${GOLD_RGBA(0.5)}`,
                  }}
                >
                  WhatsApp par Poochein
                </a>
              </div>
              <p style={{ margin: '12px 0 0', color: '#475569', fontSize: '11px' }}>
                Free · No card required · Swiss Ephemeris + BPHS · Serving Ghaziabad
              </p>
            </div>
          </section>

        </main>
        <SiteFooter />
      </div>
    </>
  )
}

// END app/astrologer-ghaziabad/page.tsx v1.1
