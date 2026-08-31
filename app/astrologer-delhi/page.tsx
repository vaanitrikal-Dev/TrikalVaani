/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/astrologer-delhi/page.tsx
 * Version:     v1.1
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Created:     2026-07-12
 * Updated:     2026-08-31
 *
 * PURPOSE:
 *   Local SEO flagship page for Delhi. Re-introduces /astrologer-{city}
 *   after IR-20 (the old "global not local" ban) was SUPERSEDED by CEO order
 *   in July 2026 following Google Business Profile approval.
 *
 * ── CHANGES v1.0 -> v1.1 (2026-08-31) ──────────────────────────────────────
 *   1. DELHI-NCR DAMAGE REPAIRED (three places).
 *      brand-guard.yml v5 ran s/Delhi NCR/India/g on every push. It rewrote
 *      this file's copy and left sentences that read wrong:
 *        schema description : "Serving India, all of India and clients
 *                              worldwide"      -> "Serving Delhi NCR, ..."
 *        direct answer      : "across India, India and worldwide"
 *                                               -> "across Delhi NCR, India ..."
 *        section 5 heading  : "India — and Anywhere Else"
 *                                               -> "Delhi NCR — and Anywhere Else"
 *      REQUIRES brand-guard.yml v6 (rule retired) TO BE DEPLOYED FIRST, or the
 *      bot will simply undo all three again within seconds of the push.
 *   2. TITLE DUPLICATION FIXED.
 *      Live <title> read "... | Trikaal Vaani | Trikaal Vaani" because
 *      metadata.title already carries the brand AND the root layout re-applies
 *      its title template. Now uses title: { absolute: ... }, the same fix
 *      app/blog/[slug]/page.tsx took in its v2.3. This page was one of the 43
 *      Radar flagged on 30 Aug.
 *   3. FEE LADDER CORRECTED against the live /pricing page (verified
 *      31 Aug 2026). v1.0's catalog was missing the Rs151 Kundali Milan tier,
 *      the Rs101/Rs151 Birth Muhurat tiers and the Rs499 On-Call Consultation,
 *      and priceRange said Rs0-Rs251 when the real ceiling is Rs499.
 *      ⚠️ OPEN ITEM FOR CEO: the Rs499 On-Call Consultation does NOT appear
 *      anywhere on /pricing. It is in this schema because you confirmed it is
 *      a real product — but a visitor who reads the offer here and clicks
 *      through will not find it. Either add it to /pricing or tell me to
 *      remove it from schema. Schema that promises what the site cannot sell
 *      is a structured-data mismatch.
 *   4. hasMap ADDED — direct link to the verified GBP listing on Google Maps.
 *      A LocalBusiness with no map reference is a weaker local entity.
 *   5. WhatsApp SURFACED in the NAP block. GBP has WhatsApp set as the PRIMARY
 *      chat channel, and Radar found "whatsapp par free jyotish paramarsh" and
 *      "free jyotish number" recurring in Delhi PASF. tel: alone was leaving
 *      that intent uncaught.
 *   6. CANONICAL ROLE STATED, to stop this page and the new
 *      /blog/astrologer-near-me-delhi competing for the same query.
 *      THIS page is the primary local landing page — short URL, service page
 *      not an article, GBP website target, sitemap LOCAL_ROUTES priority 0.9.
 *      The blog page is SUPPORTING: "near me + fees + free chat" informational
 *      intent. A link now runs from here to there, and the blog page will link
 *      back. Neither is redirected or canonicalised away — they answer
 *      different questions.
 *
 * NAP CONSISTENCY (CRITICAL — must match GBP exactly, never edit casually):
 *   Name:    Trikaal Vaani
 *   Address: 724, Pocket 3, Sector 19, Dwarka, New Delhi, Delhi 110075
 *   Phone:   +91-9211804111
 *   A NAP mismatch between this schema and the Google Business Profile is the
 *   single fastest way to destroy local ranking. Do not "improve" these fields.
 *
 * DELIBERATE OMISSIONS (each one is a decision, not an oversight):
 *   ✗ aggregateRating — Google does not support self-serving review markup for
 *     LocalBusiness rich results. Including it risks a manual action for zero gain.
 *     Add nothing here until real GBP reviews exist, and even then only via GBP.
 *   ✗ openingHoursSpecification — CEO to supply exact opening time; GBP currently
 *     shows only "Closes 8 pm". Inventing hours = NAP mismatch. ADD LATER.
 *   ✗ geo lat/long — omitted rather than approximated. GBP pin is authoritative.
 *     CEO may add exact coordinates from GBP later.
 *   ✗ No fake local address for Noida/Gurgaon/Ghaziabad. One real NAP + areaServed.
 *
 * PATTERN SOURCE: app/kundali-milan/page.tsx v1.3 (imports, GOLD tokens, schema
 *   injection style, SiteNav/SiteFooter shell, .geo-direct-answer speakable class).
 *
 * SITEMAP: /astrologer-delhi is emitted from LOCAL_ROUTES in app/sitemap.ts
 *   (v8.2+, priority 0.9). Static routes are NOT auto-discovered.
 * ============================================================================
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'

export const metadata: Metadata = {
  // v1.1: `absolute` stops the root layout title template appending the brand a
  // second time. The brand stays inside this string on purpose — it belongs in
  // the SERP title, just once.
  title: {
    absolute: 'Astrologer in Delhi — Rohiit Gupta, Chief Vedic Architect | Trikaal Vaani',
  },
  description:
    'Looking for an astrologer in Delhi? Rohiit Gupta, Chief Vedic Architect at Trikaal Vaani, offers Vedic astrology readings from Dwarka, New Delhi — kundli, Kundali Milan, Mangal Dosh, Sade Sati. Swiss Ephemeris + BPHS. Free tools, readings from Rs11.',
  keywords:
    'astrologer in delhi, best astrologer in delhi, vedic astrologer delhi, astrologer near me, jyotish in delhi, kundli in delhi, astrologer dwarka, kundali milan delhi, mangal dosh astrologer delhi, delhi ncr astrologer, astrologer in delhi with fees, top 10 astrologer in delhi',
  alternates: {
    canonical: 'https://trikalvaani.com/astrologer-delhi',
  },
  openGraph: {
    title: 'Astrologer in Delhi — Rohiit Gupta, Chief Vedic Architect | Trikaal Vaani',
    description:
      'Vedic astrology readings from Dwarka, New Delhi. Kundli, Kundali Milan, Mangal Dosh, Sade Sati. Swiss Ephemeris + BPHS classical rules. Free tools, readings from Rs11.',
    url: 'https://trikalvaani.com/astrologer-delhi',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikaal Vaani',
    images: [{
      url: 'https://trikalvaani.com/og-default.jpg',
      width: 1200, height: 630,
      alt: 'Trikaal Vaani — Astrologer in Delhi, Rohiit Gupta',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrologer in Delhi — Rohiit Gupta | Trikaal Vaani',
    description: 'Vedic astrology from Dwarka, New Delhi. Swiss Ephemeris + BPHS. Free tools, readings from Rs11.',
    images: ['https://trikalvaani.com/og-default.jpg'],
  },
}

const GOLD = '#D4AF37'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`

// ── LocalBusiness schema — NAP must mirror Google Business Profile EXACTLY ────
const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://trikalvaani.com/#localbusiness',
  name: 'Trikaal Vaani',
  legalName: 'Trikal Vaani',
  alternateName: ['Trikaal Vaani Astrologer Delhi', 'त्रिकाल वाणी'],
  description:
    'Vedic astrology practice in Delhi led by Rohiit Gupta, Chief Vedic Architect, offering kundli readings, Kundali Milan, Mangal Dosh and Sade Sati analysis using Swiss Ephemeris computation and Brihat Parashara Hora Shastra classical rules. Serving Delhi NCR, all of India and clients worldwide.',
  url: 'https://trikalvaani.com/astrologer-delhi',
  telephone: '+91-9211804111',
  // v1.1: real ceiling is the Rs499 On-Call Consultation, not Rs251.
  priceRange: 'Rs0-Rs499',
  currenciesAccepted: 'INR',
  paymentAccepted: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'RuPay'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '724, Pocket 3, Sector 19, Dwarka',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    postalCode: '110075',
    addressCountry: 'IN',
  },
  // v1.1: direct pointer to the verified GBP listing on Google Maps.
  hasMap: 'https://maps.app.goo.gl/GYbBXLHygYdGLdvW8',
  areaServed: [
    { '@type': 'City', name: 'Delhi' },
    { '@type': 'City', name: 'New Delhi' },
    { '@type': 'City', name: 'Noida' },
    { '@type': 'City', name: 'Gurgaon' },
    { '@type': 'City', name: 'Ghaziabad' },
    { '@type': 'City', name: 'Faridabad' },
    { '@type': 'Country', name: 'India' },
    { '@type': 'Place', name: 'Worldwide' },
  ],
  knowsLanguage: ['Hindi', 'English'],
  founder: { '@id': 'https://trikalvaani.com/#rohiit-gupta' },
  parentOrganization: { '@id': 'https://trikalvaani.com/#organization' },
  contactPoint: [{
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: '+91-9211804111',
    url: 'https://wa.me/919211804111',
    availableLanguage: ['Hindi', 'English'],
    areaServed: 'IN',
  }],
  identifier: [{
    '@type': 'PropertyValue',
    propertyID: 'Udyam Registration Number',
    name: 'MSME Udyam Registration',
    value: 'UDYAM-DL-10-0119070',
    url: 'https://udyamregistration.gov.in/Udyam_Verify.aspx',
  }],
  sameAs: [
    'https://www.instagram.com/thetrikalvaani',
    'https://www.youtube.com/@TheTrikalVaani',
    'https://www.facebook.com/people/Trikal-Vaani-Voice',
    'https://share.google/y5RN5czzW2MOmrq3j',
    'https://maps.app.goo.gl/GYbBXLHygYdGLdvW8',
    'https://udyamregistration.gov.in/Udyam_Verify.aspx',
  ],
  // v1.1: catalog rebuilt against the live /pricing page, verified 31 Aug 2026.
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Vedic Astrology Services — Delhi',
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
  ],
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is the astrologer at Trikaal Vaani in Delhi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rohiit Gupta, Chief Vedic Architect of Trikaal Vaani, based in Dwarka, New Delhi. He has sixteen years of personal practice in the Parashara BPHS tradition. Every reading is computed on a self-hosted Swiss Ephemeris engine using Lahiri ayanamsa — no third-party API — and interpreted under his supervision.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is Trikaal Vaani located in Delhi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trikaal Vaani is at 724, Pocket 3, Sector 19, Dwarka, New Delhi, Delhi 110075, and the Google Business Profile is verified under the Astrologer category. Readings are delivered online, so you do not need to travel — clients across Delhi, Noida, Gurgaon, Ghaziabad, the rest of India and abroad are served the same way.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to visit in person for a consultation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Every Trikaal Vaani reading is delivered online from your birth details — date, exact time and place of birth. This is not a limitation but an advantage: the computation is identical whether you sit across a desk or across the world, and you keep a written record instead of a half-remembered conversation.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does an astrology consultation in Delhi cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free kundli and all calculators cost nothing. A voice reading starts at Rs11, a Deep Reading is Rs51, Kundali Milan runs Rs51 Basic, Rs101 Deep or Rs151 for both narratives, a Child Birth Muhurat report is Rs101 or Rs151 with remedies, and a Karmic Background Reading is Rs251. Anything that is a computation — your kundli, your Mangal Dosh status, your Sade Sati phase — is free, permanently. You pay only for interpretation.',
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
      name: 'Who is the best astrologer in Delhi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No neutral authority ranks astrologers in Delhi, so every "top 10" list is either paid advertising or self-promotion, including any that features Trikaal Vaani. Judge instead on five things you can actually verify: a real named practitioner, a Google-verified address and phone, fees published before you call, a stated calculation method, and whether the astrologer will ever tell you astrology is not the right tool for your problem.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Trikaal Vaani a registered business?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Trikaal Vaani is a Government of India MSME registered enterprise under Udyam registration UDYAM-DL-10-0119070, and holds a verified Google Business Profile as an astrologer in Delhi. The registration can be checked publicly on the Udyam verification portal.',
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

export default function AstrologerDelhiPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      <div className="min-h-screen bg-[#080B12]">
        <SiteNav />
        <main>

          {/* SECTION 1 — GEO DIRECT ANSWER (40-60w, speakable) */}
          <section className="pt-24 pb-8 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.25)}`,
                color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '16px',
              }}>
                Astrologer in Delhi · Dwarka
              </span>
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
                Astrologer in Delhi — <span style={{ color: GOLD }}>Rohiit Gupta</span>
              </h1>
              <p className="geo-direct-answer" style={{
                color: '#94a3b8', fontSize: '15px', lineHeight: 1.7,
                maxWidth: '720px', margin: '0 auto',
              }}>
                <strong style={{ color: '#cbd5e1' }}>Trikaal Vaani</strong> is a Vedic astrology practice in{' '}
                <strong style={{ color: '#cbd5e1' }}>Dwarka, New Delhi</strong>, led by{' '}
                <strong style={{ color: '#cbd5e1' }}>Rohiit Gupta, Chief Vedic Architect</strong>, with sixteen years in the
                Parashara BPHS tradition. Kundli, Kundali Milan, Mangal Dosh and Sade Sati readings are computed on a
                self-hosted Swiss Ephemeris engine and delivered online across Delhi NCR, India and worldwide.
                Free tools; readings from Rs11.
              </p>
            </div>
          </section>

          {/* SECTION 2 — NAP BLOCK (must mirror GBP) */}
          <section className="pb-12 px-4">
            <div className="max-w-3xl mx-auto">
              <div style={{
                background: 'rgba(13,17,30,0.6)', border: `1px solid ${GOLD_RGBA(0.18)}`,
                borderRadius: '14px', padding: '24px',
              }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
                  <div>
                    <p style={{ color: GOLD, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Visit</p>
                    <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                      724, Pocket 3, Sector 19,<br />Dwarka, New Delhi 110075
                    </p>
                    <a
                      href="https://maps.app.goo.gl/GYbBXLHygYdGLdvW8"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: GOLD, fontSize: '12px', textDecoration: 'underline', display: 'inline-block', marginTop: '6px' }}
                    >
                      View on Google Maps →
                    </a>
                  </div>
                  <div>
                    <p style={{ color: GOLD, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Call / WhatsApp</p>
                    <a href="tel:+919211804111" style={{ color: '#cbd5e1', fontSize: '13px', textDecoration: 'none', display: 'block' }}>
                      +91 92118 04111
                    </a>
                    {/* v1.1: WhatsApp is the PRIMARY chat channel on the GBP, and
                        Radar found strong "free jyotish on WhatsApp" intent in
                        Delhi PASF. A tel: link alone was not catching it. */}
                    <a
                      href="https://wa.me/919211804111"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: GOLD, fontSize: '12px', textDecoration: 'underline', display: 'inline-block', marginTop: '6px' }}
                    >
                      Ask free on WhatsApp →
                    </a>
                  </div>
                  <div>
                    <p style={{ color: GOLD, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Registered</p>
                    <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                      MSME Udyam<br />UDYAM-DL-10-0119070
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3 — WHY (E-E-A-T) */}
          <section className="py-16 px-4" style={{ background: 'rgba(13,17,30,0.4)' }}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Why Trikaal Vaani
                </p>
                <h2 className="text-white text-3xl font-serif font-bold mb-3">
                  Honest Grading, Not Fear-Selling
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                  Delhi has no shortage of astrologers. Here is exactly what is different here — stated plainly, so you can judge for yourself.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { h: 'Sixteen Years, One Tradition', p: 'Rohiit Gupta practises within the Parashara BPHS lineage — not a mixture of borrowed systems. Every judgement traces back to a classical rule that can be named and checked.' },
                  { h: 'Computation Is Free, Permanently', p: 'Your kundli, your Mangal Dosh status, your Sade Sati phase — these are computations, not revelations. Charging for them exploits fear. They are free here, and always will be. You pay only for interpretation.' },
                  { h: 'Self-Hosted Swiss Ephemeris', p: 'Planetary positions are computed on our own Swiss Ephemeris engine using Lahiri ayanamsa. No third-party API, no shortcuts, no rounding someone else did for us.' },
                  { h: 'Graded, Never Absolute', p: 'A dosha is reported with its strength and its cancellations, not as a verdict. Most turn out mild, partial or already cancelled — and you will be told so, even though it sells nothing.' },
                  { h: 'No Expensive Removal Rituals', p: 'No ritual permanently erases a birth placement, so none is sold. Remedies here are the traditional ones — worship, mantra, fasting, charity — and they cost almost nothing.' },
                  { h: 'Registered and Verifiable', p: 'Government of India MSME registered (UDYAM-DL-10-0119070) with a verified Google Business Profile. You can check both before you trust anything said here.' },
                ].map((c) => (
                  <div key={c.h} style={{
                    background: 'rgba(8,11,18,0.6)', border: '1px solid rgba(148,163,184,0.12)',
                    borderRadius: '12px', padding: '20px',
                  }}>
                    <h3 style={{ color: GOLD, fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>{c.h}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{c.p}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 4 — SERVICES */}
          <section className="py-16 px-4">
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
                  Dwarka, Noida, Gurgaon or anywhere else in India. There is no location markup.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SERVICES.map((s) => (
                  <Link key={s.name} href={s.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'rgba(13,17,30,0.6)', border: '1px solid rgba(148,163,184,0.12)',
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
                A full fee table, and an honest answer to what a Delhi astrologer normally charges, is on the{' '}
                <Link href="/blog/astrologer-near-me-delhi" style={{ color: GOLD, textDecoration: 'underline' }}>
                  astrologer near me in Delhi guide
                </Link>
                {' — '}or see every option on the{' '}
                <Link href="/pricing" style={{ color: GOLD, textDecoration: 'underline' }}>pricing page</Link>.
              </p>
            </div>
          </section>

          {/* SECTION 5 — AREAS SERVED (honest: one office, online delivery) */}
          <section className="py-16 px-4" style={{ background: 'rgba(13,17,30,0.4)' }}>
            <div className="max-w-3xl mx-auto text-center">
              <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Areas Served
              </p>
              <h2 className="text-white text-3xl font-serif font-bold mb-4">
                Delhi NCR — and Anywhere Else
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.8, maxWidth: '680px', margin: '0 auto 24px' }}>
                The practice is based in Dwarka, New Delhi, and clients come from across the capital region —{' '}
                <strong style={{ color: '#cbd5e1' }}>Delhi, Noida, Gurgaon, Ghaziabad, Faridabad</strong> and beyond.
                But it is worth being straightforward about something most local listings will not say: because every reading is
                computed from your birth details and delivered online, your distance from Dwarka changes nothing at all about the
                result. A client in Rohini, a client in Noida and a client in Toronto receive the same computation from the same
                engine. Proximity is convenience, never accuracy. Read more on{' '}
                <Link href="/blog/astrologer-near-me-online-vedic-consultation" style={{ color: GOLD, textDecoration: 'underline' }}>
                  why &ldquo;astrologer near me&rdquo; actually means online, not local
                </Link>.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {['Dwarka', 'New Delhi', 'Rohini', 'Noida', 'Gurgaon', 'Ghaziabad', 'Faridabad', 'All India', 'Worldwide'].map((c) => (
                  <span key={c} style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                    background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.18)}`, color: '#cbd5e1',
                  }}>{c}</span>
                ))}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.8, maxWidth: '680px', margin: '0 auto' }}>
                Dedicated pages for the rest of the capital region:{' '}
                <Link href="/astrologer-noida" style={{ color: GOLD, textDecoration: 'underline' }}>Noida</Link>{', '}
                <Link href="/astrologer-gurgaon" style={{ color: GOLD, textDecoration: 'underline' }}>Gurgaon</Link>{' and '}
                <Link href="/astrologer-ghaziabad" style={{ color: GOLD, textDecoration: 'underline' }}>Ghaziabad</Link>.
              </p>
            </div>
          </section>

          {/* SECTION 6 — FAQ (AEO, speakable) */}
          <section className="py-16 px-4">
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
                    background: 'rgba(13,17,30,0.6)', border: '1px solid rgba(148,163,184,0.12)',
                    borderRadius: '12px', padding: '20px',
                  }}>
                    <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>{f.name}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{f.acceptedAnswer.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 7 — CTA */}
          <section className="py-16 px-4" style={{ background: 'rgba(13,17,30,0.4)' }}>
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
                Free · No card required · Swiss Ephemeris + BPHS · Dwarka, New Delhi
              </p>
            </div>
          </section>

        </main>
        <SiteFooter />
      </div>
    </>
  )
}

// END app/astrologer-delhi/page.tsx v1.1
