/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/astrologer-gurgaon/page.tsx
 * Version:     v1.0
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Created:     2026-07-12
 *
 * PURPOSE:
 *   Local SEO satellite page for Gurgaon (Delhi NCR). Companion to the flagship
 *   /astrologer-delhi. Re-introduces /astrologer-{city} after IR-20 (the old
 *   "global not local" ban) was SUPERSEDED by CEO order, July 2026, following
 *   Google Business Profile approval.
 *
 * SCHEMA DECISION — READ BEFORE EDITING:
 *   This page carries a **Service** schema with areaServed: Gurgaon.
 *   It deliberately does NOT carry a LocalBusiness schema.
 *   Reason: Trikaal Vaani has ONE physical location (Dwarka, New Delhi) and one
 *   Google Business Profile. Repeating a LocalBusiness block with the same NAP
 *   across four city pages reads as manipulation to Google and risks the entire
 *   local presence. The single LocalBusiness entity lives on /astrologer-delhi,
 *   which is the real GBP city. Every other city page inherits authority from it
 *   via areaServed + provider @id references. Do not "helpfully" add a
 *   LocalBusiness block here.
 *
 * NAP HONESTY:
 *   We state the ONE real address (Dwarka) even on non-Delhi pages, and say
 *   plainly that there is no local office. Inventing a Gurgaon address would be
 *   both dishonest and self-defeating: fabricated NAPs are the fastest known way
 *   to destroy local ranking.
 *
 * PATTERN SOURCE: app/kundali-milan/page.tsx v1.3 + app/astrologer-delhi/page.tsx v1.0
 * SITEMAP: /astrologer-gurgaon is listed in LOCAL_ROUTES in app/sitemap.ts v8.2.
 * ============================================================================
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'

export const metadata: Metadata = {
  title: 'Astrologer in Gurgaon — Rohiit Gupta, Chief Vedic Architect | Trikaal Vaani',
  description:
    'Looking for an astrologer in Gurgaon (Gurugram)? Rohiit Gupta, Chief Vedic Architect at Trikaal Vaani, offers Vedic astrology readings online — kundli, Kundali Milan, Mangal Dosh, Sade Sati. Swiss Ephemeris + BPHS. Free tools, readings from Rs11.',
  keywords:
    'astrologer in gurgaon, astrologer in gurugram, best astrologer in gurgaon, vedic astrologer gurugram, astrologer near me gurgaon, kundli in gurgaon, kundali milan gurgaon, online astrologer gurugram',
  alternates: {
    canonical: 'https://trikalvaani.com/astrologer-gurgaon',
  },
  openGraph: {
    title: 'Astrologer in Gurgaon — Rohiit Gupta, Chief Vedic Architect | Trikaal Vaani',
    description:
      'Looking for an astrologer in Gurgaon (Gurugram)? Rohiit Gupta, Chief Vedic Architect at Trikaal Vaani, offers Vedic astrology readings online — kundli, Kundali Milan, Mangal Dosh, Sade Sati. Swiss Ephemeris + BPHS. Free tools, readings from Rs11.',
    url: 'https://trikalvaani.com/astrologer-gurgaon',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikaal Vaani',
    images: [{
      url: 'https://trikalvaani.com/og-default.jpg',
      width: 1200, height: 630,
      alt: 'Trikaal Vaani — Astrologer for Gurgaon, Rohiit Gupta',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrologer in Gurgaon — Rohiit Gupta | Trikaal Vaani',
    description: 'Vedic astrology online for Gurgaon. Swiss Ephemeris + BPHS. Free tools, readings from Rs11.',
    images: ['https://trikalvaani.com/og-default.jpg'],
  },
}

const GOLD = '#D4AF37'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`

// ── Service schema (NOT LocalBusiness — see header) ──────────────────────────
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://trikalvaani.com/astrologer-gurgaon#service',
  name: 'Vedic Astrology Readings for Gurgaon — Trikaal Vaani',
  serviceType: 'Vedic Astrology Reading',
  url: 'https://trikalvaani.com/astrologer-gurgaon',
  description:
    'Online Vedic astrology readings for clients in Gurgaon and India — kundli, Kundali Milan, Mangal Dosh and Sade Sati analysis — computed on a self-hosted Swiss Ephemeris engine using Brihat Parashara Hora Shastra classical rules, under Rohiit Gupta, Chief Vedic Architect.',
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
  areaServed: [
    { '@type': 'City', name: 'Gurgaon' },
    { '@type': 'Place', name: 'India' },
    { '@type': 'Country', name: 'India' },
  ],
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://trikalvaani.com',
    availableLanguage: [
      { '@type': 'Language', name: 'Hindi' },
      { '@type': 'Language', name: 'English' },
    ],
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Vedic Astrology Services — Gurgaon',
    itemListElement: [
      { '@type': 'Offer', name: 'Free Kundli & Trikaal Ka Sandesh', price: '0', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Trikaal Ki Awaaz — Voice Reading', price: '11', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Deep Reading', price: '51', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Kundali Milan — Basic', price: '51', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Kundali Milan — Deep', price: '101', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: 'Karmic Background Reading', price: '251', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
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
    { '@type': 'ListItem', position: 3, name: 'Astrologer in Gurgaon', item: 'https://trikalvaani.com/astrologer-gurgaon' },
  ],
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you have an office in Gurgaon?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. The practice is registered at 724, Pocket 3, Sector 19, Dwarka, New Delhi 110075 — about half an hour from Gurgaon. Readings are delivered online, so a Gurgaon client receives the identical computation from the identical engine. We list our one real address rather than inventing a local one, because a fabricated address is both dishonest and, for local search, self-defeating.' },
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
      name: 'Is an online reading as reliable as visiting an astrologer in Gurgaon?',
      acceptedAnswer: { '@type': 'Answer', text: 'For the computation, it is identical — planetary positions come from your birth details and the ephemeris, not from the room you are sitting in. For the interpretation, a written reading is arguably better: it is considered rather than improvised, and you keep it. What you lose is the theatre of a consultation, which is usually the part that costs the most and helps the least.' },
    },
    {
      '@type': 'Question',
      name: 'How much does a reading cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free kundli and all calculators cost nothing. A voice reading is Rs11, a Deep Reading Rs51, Kundali Milan starts at Rs51, and a Karmic Background Reading is Rs251. Anything that is a computation — your kundli, your Mangal Dosh status, your Sade Sati phase — is free, permanently. You pay only for interpretation.',
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

const AREAS = ['Cyber City', 'Sector 29', 'Golf Course Road', 'Sohna Road', 'Manesar', 'Delhi', 'Noida', 'Faridabad', 'All India']

export default function AstrologerGurgaonPage() {
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
                Astrologer for Gurgaon · Gurugram
              </span>
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
                Astrologer in <span style={{ color: GOLD }}>Gurgaon</span>
              </h1>
              <p className="geo-direct-answer" style={{
                color: '#94a3b8', fontSize: '15px', lineHeight: 1.7,
                maxWidth: '720px', margin: '0 auto',
              }}>
                <strong style={{ color: '#cbd5e1' }}>Trikaal Vaani</strong> serves Gurgaon and Gurugram entirely online, led by <strong style={{ color: '#cbd5e1' }}>Rohiit Gupta, Chief Vedic Architect</strong>, with sixteen years in the Parashara BPHS tradition. Kundli, Kundali Milan, Mangal Dosh and Sade Sati readings are computed on a self-hosted Swiss Ephemeris engine. The practice is registered in Dwarka, New Delhi, roughly half an hour away — though distance changes nothing about a reading.
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
                  No Gurgaon Office — And We Will Say So
                </p>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.8, margin: '0 auto', maxWidth: '620px' }}>
                  Trikaal Vaani has one registered address:{' '}
                  <strong style={{ color: '#cbd5e1' }}>724, Pocket 3, Sector 19, Dwarka, New Delhi 110075</strong>.
                  There is no Gurgaon branch, and we are not going to pretend there is. Every reading is computed from your
                  birth details and delivered online, so a Gurgaon client receives the identical result from the identical
                  engine. Proximity is convenience — never accuracy. Read more on{' '}
                  <Link href="/blog/astrologer-near-me-online-vedic-consultation" style={{ color: GOLD, textDecoration: 'underline' }}>
                    why &ldquo;astrologer near me&rdquo; actually means online, not local
                  </Link>.
                </p>
                <p style={{ margin: '14px 0 0', color: '#64748b', fontSize: '12px' }}>
                  <a href="tel:+919211804111" style={{ color: GOLD, textDecoration: 'none' }}>+91 92118 04111</a>
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
                Gurgaon
              </p>
              <h2 className="text-white text-3xl font-serif font-bold mb-5 text-center">
                What Gurgaon Actually Asks About
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.9, margin: 0 }}>
                Gurgaon brings a distinct pattern of questions, and it is worth naming honestly: high-pressure corporate careers, wealth and investment timing, and the particular strain of a marriage where both partners work long hours. A recurring one is the professional in their thirties whose career has gone well and whose personal life has quietly stalled — and who is now being told, often for the first time, that a dosha is to blame. It usually is not. In a great many of those charts, the dosha turns out mild, partial or already cancelled, and the delay has ordinary causes. That answer sells nothing, which is precisely why it is worth hearing.
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
            </div>
          </section>

          {/* SECTION 6 — AREAS */}
          <section className="py-16 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Areas Served
              </p>
              <h2 className="text-white text-3xl font-serif font-bold mb-6">
                Gurgaon and Beyond
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                {AREAS.map((c) => (
                  <span key={c} style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                    background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.18)}`, color: '#cbd5e1',
                  }}>{c}</span>
                ))}
              </div>
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
                Decide afterwards whether you want anything more.
              </p>
              <Link href="/" style={{
                display: 'inline-block', padding: '14px 32px', borderRadius: '10px',
                background: GOLD, color: '#080B12', fontSize: '15px', fontWeight: 700,
                textDecoration: 'none', boxShadow: `0 0 30px ${GOLD_RGBA(0.4)}`,
              }}>
                🔱 Free Kundli Shuru Karein
              </Link>
              <p style={{ margin: '12px 0 0', color: '#475569', fontSize: '11px' }}>
                Free · No card required · Swiss Ephemeris + BPHS · Serving Gurgaon
              </p>
            </div>
          </section>

        </main>
        <SiteFooter />
      </div>
    </>
  )
}

// END app/astrologer-gurgaon/page.tsx v1.0
