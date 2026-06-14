/**
 * ============================================================
 * TRIKAL VAANI — Voice Pricing SEO Landing Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/voice-pricing/page.tsx
 * VERSION: 2.0 — Content synced to current product (Jun 14, 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * v2.0 CHANGES:
 *   - FIXED: "Tap the mic icon" → "press and hold the mic" (current PTT UX)
 *   - FIXED: "premium Hindi female voice" → "Rohiit Gupta's own voice"
 *     (ElevenLabs cloned voice — makes असली आवाज़ literally true)
 *   - ADDED: voice auto-fill (बोलकर भरें) described for non-typists
 *   - GEO: tighter 40-60 word direct answer, richer entity FAQ
 *   - SEO: internal links to /, /founder, /learn for hub-spoke
 *   - Schema updated to match (FAQ + Product offers + Breadcrumb)
 * ============================================================
 */

import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Voice Astrology by Trikaal — ₹11 Voice Predictions in Hindi | Trikaal Vaani',
  description:
    'Ask Vedic astrology questions by voice in Hindi or Hinglish — no typing needed. Get AI predictions in Rohiit Gupta\'s own voice, starting ₹11. Press, speak, and listen. Backed by Swiss Ephemeris.',
  keywords: [
    'voice astrology India',
    'Hindi voice astrology',
    'AI voice astrology prediction',
    'voice astrologer India',
    'voice kundali reading',
    '11 rupees astrology',
    'Vedic voice prediction',
    'bina type astrology Hindi',
    'Trikaal Vaani voice',
  ],
  alternates: {
    canonical: '/voice-pricing',
    languages: {
      'en-IN': '/voice-pricing',
      'hi-IN': '/hi/voice-pricing',
    },
  },
  openGraph: {
    title      : 'Voice Astrology by Trikaal — ₹11 Voice Predictions',
    description: 'Press, speak your question, and hear the answer in Trikaal\'s own voice. From ₹11.',
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
      name   : 'What is Trikaal Voice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'Trikaal Voice is an AI-powered Vedic astrology voice prediction service by Trikaal Vaani. You press and hold a microphone button, speak a 60-second question in Hindi, Hinglish, or English, and Trikaal returns a 90 to 120 word spoken prediction in the real cloned voice of Chief Vedic Architect Rohiit Gupta, based on Swiss Ephemeris calculations and Vimshottari Dasha analysis.',
      },
    },
    {
      '@type': 'Question',
      name   : 'How much does voice astrology cost on Trikaal Vaani?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'Trikaal Voice starts at just ₹11 for one voice question. The ₹51 Sapt Darshan pack gives 5 voice or text questions valid for 7 days. The ₹101 Trikaal Bhakt pack gives 12 questions valid for 30 days. All packs are paid via Razorpay with secure UPI, card, and netbanking.',
      },
    },
    {
      '@type': 'Question',
      name   : 'Can I use Trikaal Voice without typing in English?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'Yes. You can speak your birth details — name, date of birth, time of birth, and place of birth — and Trikaal fills the form for you automatically. You simply check the details and confirm. Nothing needs to be typed in English, which makes it easy for Hindi-first users.',
      },
    },
    {
      '@type': 'Question',
      name   : 'Whose voice answers my question?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'The prediction is spoken in the real cloned voice of Rohiit Gupta, Chief Vedic Architect of Trikaal Vaani. The tone is calm, slow, and authoritative — like a guru giving a personal consultation, not a robotic text-to-speech reading.',
      },
    },
    {
      '@type': 'Question',
      name   : 'Is voice astrology accurate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'Yes. Trikaal Voice uses Swiss Ephemeris — the same calculation engine professional astrologers use worldwide — for accurate planetary positions. Predictions follow classical Brihat Parashara Hora Shastra (BPHS) methods including Vimshottari Dasha, Pratyantar Dasha, and current Gochar (transits), and are authored by Rohiit Gupta.',
      },
    },
    {
      '@type': 'Question',
      name   : 'How do I ask a voice astrology question?',
      acceptedAnswer: {
        '@type': 'Answer',
        text   : 'Tap the floating mic button at the bottom right of any page on trikalvaani.com, choose a pack (₹11, ₹51, or ₹101), and pay via Razorpay. Add your birth details by typing or by speaking them. Then press and hold the mic, speak your question, and release to submit. Trikaal returns a spoken prediction within about 30 seconds.',
      },
    },
  ],
};

// ── Product Schema ────────────────────────────────────────────
const PRODUCT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type'   : 'Product',
  name      : 'Trikaal Voice — AI Vedic Astrology Voice Prediction',
  description: 'AI-powered Vedic astrology voice predictions in Hindi, answered in Rohiit Gupta\'s own cloned voice. Powered by Swiss Ephemeris.',
  brand     : { '@type': 'Brand', name: 'Trikaal Vaani' },
  offers    : [
    {
      '@type'      : 'Offer',
      name         : 'Trikaal Voice Try',
      price        : '11',
      priceCurrency: 'INR',
      description  : '1 voice question with spoken reply',
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
      name         : 'Trikaal Bhakt',
      price        : '101',
      priceCurrency: 'INR',
      description  : '12 questions valid for 30 days',
      availability : 'https://schema.org/InStock',
      url          : 'https://trikalvaani.com/voice-pricing',
    },
  ],
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
  { price: 11,  questions: 1,  validity: '1 day',  label: 'Try Trikaal',   popular: false, features: ['1 voice question', 'Reply in Rohiit Gupta\'s voice', '90-120 word prediction', 'Swiss Ephemeris accuracy'] },
  { price: 51,  questions: 5,  validity: '7 days', label: 'Sapt Darshan',  popular: true,  features: ['5 voice or text questions', '7-day validity', 'Voice + text replies', 'Personalised remedies', 'Birth chart context'] },
  { price: 101, questions: 12, validity: '30 days', label: 'Trikaal Bhakt', popular: false, features: ['12 voice or text questions', '30-day validity', 'Priority responses', 'Detailed remedies', 'Mahadasha analysis', 'Best value (₹8.4/question)'] },
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
            Voice Astrology by Trikaal
          </h1>

          {/* GEO direct-answer block — exactly what AI engines extract */}
          <p className="text-lg leading-relaxed text-gray-200 mb-8 max-w-2xl mx-auto">
            <strong>Trikaal Voice</strong> lets you ask any Vedic astrology question by voice — in Hindi,
            Hinglish, or English. Press and hold the mic, speak for up to 60 seconds, and hear a
            90–120 word prediction in the <strong>real cloned voice of Rohiit Gupta</strong>,
            Chief Vedic Architect. No typing needed. Predictions start at <strong>₹11</strong>.
          </p>

          <div className="flex flex-wrap gap-3 justify-center text-xs text-gray-400">
            <span>⭐ Swiss Ephemeris accurate</span>
            <span>•</span>
            <span>🎙️ Answered in Trikaal&apos;s own voice</span>
            <span>•</span>
            <span>🗣️ Speak — no typing</span>
            <span>•</span>
            <span>🔒 Razorpay secure</span>
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
                  Tap the mic icon (bottom right), then hold to speak
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────── */}
        <section className="px-6 py-12 bg-black/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ color: '#D4AF37' }}>
              How Trikaal Voice Works
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { n: '1', t: 'Choose a Pack',  d: 'Select ₹11, ₹51, or ₹101' },
                { n: '2', t: 'Pay via Razorpay', d: 'Secure UPI / cards / netbanking' },
                { n: '3', t: 'Add Birth Details', d: 'Type them, or just speak them' },
                { n: '4', t: 'Hold & Speak', d: 'Press the mic, speak, release to hear the reply' },
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

        {/* ── Speak, don't type (mass-market hook) ──────────── */}
        <section className="px-6 py-12 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>
            टाइप नहीं करना? बस बोलिए
          </h2>
          <p className="text-gray-300 leading-relaxed">
            English type karna zaroori nahi. Apna naam, janm tithi, samay aur sthan
            bolकर bharein — Trikaal khud form bhar deता hai. Aap sirf check karke
            confirm karein. Phir mic dabakar apna sawaal poochein, aur Trikaal ki
            apni aawaz mein uttar sunein.
          </p>
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

        {/* ── Author E-E-A-T Block + internal links ─────────── */}
        <section className="px-6 py-12 bg-black/30">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-gray-400 mb-2">Authored by</p>
            <h3 className="text-xl font-bold" style={{ color: '#D4AF37' }}>Rohiit Gupta</h3>
            <p className="text-sm text-gray-400">Chief Vedic Architect, Trikaal Vaani • India</p>
            <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs">
              <a href="/founder" className="underline" style={{ color: '#D4AF37' }}>
                About Rohiit Gupta →
              </a>
              <a href="/learn" className="underline" style={{ color: '#D4AF37' }}>
                Learn Vedic astrology →
              </a>
              <a href="/" className="underline" style={{ color: '#D4AF37' }}>
                Free Kundli &amp; calculators →
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
