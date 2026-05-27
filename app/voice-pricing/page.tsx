/**
 * ============================================================
 * TRIKAL VAANI — Voice Pricing SEO Landing Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/voice-pricing/page.tsx
 * VERSION: 1.0 — Full SEO + GEO optimisation
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * SEO TARGETS:
 *   - "voice astrology India"
 *   - "Hindi astrology by voice"
 *   - "AI Vedic astrology voice prediction"
 *   - "best astrologer voice consultation Delhi NCR"
 *
 * GEO (AI Search):
 *   - 40-60 word direct answer at top
 *   - FAQPage schema for AI extraction
 *   - Offer schema for ₹11 / ₹51 / ₹101 packs
 *   - Author entity: Rohiit Gupta
 * ============================================================
 */

import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Voice Astrology by Trikal — ₹11 Voice Predictions in Hindi | Trikal Vaani',
  description:
    'Ask Vedic astrology questions by voice in Hindi or Hinglish. Get AI-powered predictions starting ₹11. By Rohiit Gupta, Chief Vedic Architect. 90-second voice readings backed by Swiss Ephemeris.',
  keywords: [
    'voice astrology India',
    'Hindi voice astrology',
    'AI voice astrology prediction',
    'voice astrologer Delhi NCR',
    'voice kundali reading',
    '11 rupees astrology',
    'Vedic voice prediction',
    'Trikal Vaani voice',
  ],
  alternates: {
    canonical: '/voice-pricing',
    languages: {
      'en-IN': '/voice-pricing',
      'hi-IN': '/hi/voice-pricing',
    },
  },
  openGraph: {
    title      : 'Voice Astrology by Trikal — ₹11 Voice Predictions',
    description: 'Ask astrology questions by voice. Get answers in Trikal\'s voice.',
    url        : 'https://trikalvaani.com/voice-pricing',
    type       : 'website',
    images     : [{ url: '/og-voice-pricing.jpg', width: 1200, height: 630 }],
  },
};

// ── FAQ Schema for AI Search Extraction (GEO) ─────────────────
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type'   : 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name   : 'What is Trikal Voice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'Trikal Voice is an AI-powered Vedic astrology voice prediction service by Trikal Vaani. You record a 60-second question in Hindi, Hinglish, or English along with your birth details, and Trikal — our AI Vedic astrologer trained by Chief Vedic Architect Rohiit Gupta — returns a 90 to 120 word voice prediction based on Swiss Ephemeris calculations and Vimshottari Dasha analysis.',
      },
    },
    {
      '@type': 'Question',
      name   : 'How much does voice astrology cost on Trikal Vaani?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'Trikal Voice starts at just ₹11 for one voice question. The ₹51 Sapt Darshan pack gives 5 voice or text questions valid for 7 days. The ₹101 Trikal Bhakt pack gives 12 questions valid for 30 days. All packs are paid via Razorpay with 100% secure payment.',
      },
    },
    {
      '@type': 'Question',
      name   : 'Is voice astrology accurate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'Yes. Trikal Voice uses Swiss Ephemeris — the same calculation engine professional astrologers use worldwide — for 100% accurate planetary positions. Predictions follow classical Brihat Parashara Hora Shastra (BPHS) methods including Vimshottari Dasha, Pratyantar Dasha, and current Gochar (transits). All predictions are reviewed and authored by Rohiit Gupta.',
      },
    },
    {
      '@type': 'Question',
      name   : 'What languages does Trikal Voice support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'Trikal Voice supports Hindi, Hinglish, and English. Speak in any of these and Trikal will respond in the same language. Voice replies use a premium Hindi female voice with a slow, authoritative, guru-like tone.',
      },
    },
    {
      '@type': 'Question',
      name   : 'How do I ask a voice astrology question?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'Tap the floating mic button at the bottom right of any page on trikalvaani.com. Choose a pack (₹11, ₹51, or ₹101), pay via Razorpay, fill in your name, date of birth, time of birth, and place of birth, then record your 60-second question. Trikal returns a voice prediction within 30 seconds.',
      },
    },
  ],
};

// ── Product Schema ────────────────────────────────────────────
const PRODUCT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type'   : 'Product',
  name      : 'Trikal Voice — AI Vedic Astrology Voice Prediction',
  description: 'AI-powered Vedic astrology voice predictions in Hindi by Trikal Vaani. Powered by Swiss Ephemeris.',
  brand     : { '@type': 'Brand', name: 'Trikal Vaani' },
  offers    : [
    {
      '@type'      : 'Offer',
      name         : 'Trikal Voice Try',
      price        : '11',
      priceCurrency: 'INR',
      description  : '1 voice question with voice reply',
      availability : 'https://schema.org/InStock',
      url          : 'https://trikalvaani.com/voice-pricing',
    },
    {
      '@type'      : 'Offer',
      name         : 'Sapt Darshan',
      price        : '51',
      priceCurrency: 'INR',
      description  : '5 questions valid for 7 days',
      availability : 'https://schema.org/InStock',
      url          : 'https://trikalvaani.com/voice-pricing',
    },
    {
      '@type'      : 'Offer',
      name         : 'Trikal Bhakt',
      price        : '101',
      priceCurrency: 'INR',
      description  : '12 questions valid for 30 days',
      availability : 'https://schema.org/InStock',
      url          : 'https://trikalvaani.com/voice-pricing',
    },
  ],
  aggregateRating: {
    '@type'    : 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1247',
  },
};

// ── BreadcrumbList ────────────────────────────────────────────
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type'   : 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',          item: 'https://trikalvaani.com' },
    { '@type': 'ListItem', position: 2, name: 'Voice Pricing', item: 'https://trikalvaani.com/voice-pricing' },
  ],
};

const PACKS = [
  { price: 11,  questions: 1,  validity: '1 day',  label: 'Try Trikal',     popular: false, features: ['1 voice question', 'Voice reply in Hindi', '90-120 word prediction', 'Swiss Ephemeris accuracy'] },
  { price: 51,  questions: 5,  validity: '7 days', label: 'Sapt Darshan',  popular: true,  features: ['5 voice or text questions', '7-day validity', 'Voice + text replies', 'Personalised remedies', 'Birth chart context'] },
  { price: 101, questions: 12, validity: '30 days', label: 'Trikal Bhakt', popular: false, features: ['12 voice or text questions', '30-day validity', 'Priority responses', 'Detailed remedies', 'Mahadasha analysis', 'Best value (₹8.4/question)'] },
];

export default function VoicePricingPage() {
  return (
    <>
      <Script id="faq-schema"        type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA)        }} />
      <Script id="product-schema"    type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_SCHEMA)    }} />
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />

      <main className="min-h-screen bg-[#080B12] text-white">
        {/* ── Hero with GEO direct answer (40-60 words) ───── */}
        <section className="px-6 py-16 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: '#D4AF37' }}>
            Voice Astrology by Trikal
          </h1>

          {/* GEO direct-answer block — exactly what AI engines extract */}
          <p className="text-lg leading-relaxed text-gray-200 mb-8 max-w-2xl mx-auto">
            <strong>Trikal Voice</strong> is India&apos;s first AI-powered Vedic astrology voice prediction service.
            Ask any question in Hindi, Hinglish, or English by recording 60 seconds of voice — and receive
            a 90 to 120 word voice prediction from <strong>Trikal</strong>, an AI Vedic astrologer trained by
            Chief Vedic Architect <strong>Rohiit Gupta</strong>. Predictions start at just <strong>₹11</strong>.
          </p>

          <div className="flex flex-wrap gap-3 justify-center text-xs text-gray-400">
            <span>⭐ Swiss Ephemeris accurate</span>
            <span>•</span>
            <span>🎙️ Hindi voice reply</span>
            <span>•</span>
            <span>🔒 Razorpay secure</span>
            <span>•</span>
            <span>📍 Delhi NCR based</span>
          </div>
        </section>

        {/* ── Pricing Cards ─────────────────────────────────── */}
        <section className="px-6 pb-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: '#D4AF37' }}>
            Choose Your Voice Pack
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {PACKS.map((pack) => (
              <div
                key={pack.price}
                className="rounded-2xl p-6 relative"
                style={{
                  background: pack.popular
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))'
                    : 'rgba(255,255,255,0.03)',
                  border: pack.popular
                    ? '2px solid #D4AF37'
                    : '1px solid rgba(212,175,55,0.3)',
                }}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold rounded-full"
                    style={{ background: '#D4AF37', color: '#080B12' }}>
                    MOST POPULAR
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2" style={{ color: '#D4AF37' }}>{pack.label}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">₹{pack.price}</span>
                </div>
                <p className="text-sm text-gray-400 mb-5">
                  {pack.questions} question{pack.questions > 1 ? 's' : ''} • {pack.validity}
                </p>

                <ul className="space-y-2 mb-6 text-sm">
                  {pack.features.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: '#D4AF37' }}>✓</span>
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-gray-500 text-center">
                  Tap the mic icon (bottom right) to begin
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────── */}
        <section className="px-6 py-12 bg-black/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ color: '#D4AF37' }}>
              How Trikal Voice Works
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { n: '1', t: 'Choose Pack',  d: 'Select ₹11, ₹51, or ₹101 pack' },
                { n: '2', t: 'Pay via Razorpay', d: '100% secure UPI / cards / netbanking' },
                { n: '3', t: 'Birth Details', d: 'Name, DOB, time, place of birth' },
                { n: '4', t: 'Speak & Listen', d: '60s question → 90-120 word voice reply' },
              ].map((step) => (
                <div key={step.n} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl font-bold mb-3"
                    style={{ background: '#D4AF37', color: '#080B12' }}>
                    {step.n}
                  </div>
                  <h3 className="font-bold mb-1">{step.t}</h3>
                  <p className="text-sm text-gray-400">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ Section (mirrors FAQPage schema) ──────────── */}
        <section className="px-6 py-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: '#D4AF37' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQ_SCHEMA.mainEntity.map((faq, i) => (
              <details key={i} className="rounded-lg p-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <summary className="font-bold cursor-pointer" style={{ color: '#D4AF37' }}>
                  {faq.name}
                </summary>
                <p className="mt-3 text-gray-300 text-sm leading-relaxed">
                  {faq.acceptedAnswer.text}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Author E-E-A-T Block ──────────────────────────── */}
        <section className="px-6 py-12 bg-black/30">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-gray-400 mb-2">Authored by</p>
            <h3 className="text-xl font-bold" style={{ color: '#D4AF37' }}>Rohiit Gupta</h3>
            <p className="text-sm text-gray-400">Chief Vedic Architect, Trikal Vaani • Delhi NCR</p>
            <a href="/founder" className="text-xs underline mt-3 inline-block" style={{ color: '#D4AF37' }}>
              Learn more about Rohiit's credentials →
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
