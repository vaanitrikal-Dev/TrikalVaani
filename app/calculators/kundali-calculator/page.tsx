// ============================================================
// File: app/calculators/kundali-calculator/page.tsx
// Purpose: Free AI Kundli Calculator — SEO/GEO/AEO/E-E-A-T page
// Version: v1.0
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import SiteNav from '@/components/layout/SiteNav';
import KundaliCalculatorClient from '@/components/calculators/KundaliCalculatorClient';

const GOLD = '#D4AF37';

// ─────────────────────────────────────────────────────────────
// METADATA (SEO)
// ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Free AI Kundli Calculator — Janm Kundali Online | Trikal Vaani',
  description:
    'Free AI Kundli calculator powered by Swiss Ephemeris. Get your accurate Janm Kundali, Lagna, Nakshatra, Chandra Rashi, Mahadasha, and Parashar remedies online instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'free kundli calculator',
    'janm kundali online',
    'birth chart calculator',
    'free kundali',
    'kundli analysis',
    'vedic birth chart',
    'lagna calculator',
    'nakshatra calculator',
    'AI kundli',
    'kundli by date of birth',
  ],
  alternates: {
    canonical: 'https://trikalvaani.com/calculators/kundali-calculator',
  },
  openGraph: {
    title: 'Free AI Kundli Calculator — Janm Kundali Online',
    description:
      'Free, accurate Janm Kundali with Lagna, Nakshatra, Dasha, and Parashar remedies. Powered by Swiss Ephemeris.',
    url: 'https://trikalvaani.com/calculators/kundali-calculator',
    type: 'website',
  },
};

// ─────────────────────────────────────────────────────────────
// FAQs (AEO / GEO optimized)
// ─────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Kundli kya hoti hai?',
    a: 'Kundli (Janm Kundali) ek Vedic birth chart hai jo aapke janm samay grahon aur nakshatron ki position dikhata hai. Iska use Vedic astrology mein future predictions, character analysis, aur remedies ke liye hota hai.',
  },
  {
    q: 'Free Kundli Calculator kaise kaam karta hai?',
    a: 'Aap apni date of birth, time of birth, aur birth place enter karte ho. Trikal Vaani ka Swiss Ephemeris engine sab grahon ki exact position calculate karta hai aur aapko Lagna, Nakshatra, Chandra Rashi, Mahadasha, aur Parashar-based remedies turant dikhata hai.',
  },
  {
    q: 'Kya yeh kundli accurate hai?',
    a: 'Haan. Trikal Vaani Swiss Ephemeris use karta hai — wahi astronomical library jo NASA aur world-class astrology software use karte hain. Calculations Lahiri Ayanamsha pe based hain, BPHS (Brihat Parashara Hora Shastra) ke classical rules ke according.',
  },
  {
    q: 'Mujhe apna exact birth time nahi pata, kya phir bhi kundli ban sakti hai?',
    a: 'Approximate time se bhi kundli ban sakti hai, lekin Lagna aur Bhava positions ke liye exact time important hai. Agar time galat hai toh Moon sign aur grahon ki houses change ho sakti hain. Best — birth certificate ya parents se confirm karein.',
  },
  {
    q: 'Kundli ke baad kya milta hai?',
    a: 'Aapko milta hai: (1) Lagna aur Nakshatra, (2) Chandra Rashi aur Surya Rashi, (3) Current Mahadasha + Antardasha, (4) Sab 9 grahon ki position aur Shadbala, (5) Parashar-based Dos & Donts, (6) 3 personalized remedies — Mantra, Ratna, Daan.',
  },
  {
    q: 'Yeh service kya free hai?',
    a: 'Haan. Basic kundli calculation, Lagna, Nakshatra, Dasha, aur Parashar remedies bilkul free hain. Detailed life prediction (career, marriage, health timing) ₹51 mein available hai.',
  },
  {
    q: 'Kya gender mention karna zaroori hai?',
    a: 'Optional hai. Lekin gender se kuch remedies (jaise vrat, mantra) personalize hote hain. Recommended hai mention karna.',
  },
  {
    q: 'Kya yeh kundli online save ho sakti hai?',
    a: 'Haan. Agar aap ₹51 ka detailed prediction lete ho toh aapki kundli aapke account mein permanently save ho jati hai — "My Vault" mein.',
  },
];

// ─────────────────────────────────────────────────────────────
// HowTo Steps (AEO)
// ─────────────────────────────────────────────────────────────
const HOWTO_STEPS = [
  {
    name: 'Apni Date of Birth daalo',
    text: 'Apne janm ki tareeq select karein — din, mahina, saal.',
  },
  {
    name: 'Time of Birth daalo',
    text: 'Janm samay enter karein — ghante aur minute. Jitna exact, utna accurate result.',
  },
  {
    name: 'Birth Place daalo',
    text: 'Apne janm sthan ka naam likho. Google Places se auto-suggest milega.',
  },
  {
    name: 'Gender select karo (optional)',
    text: 'Male / Female / Other — taaki remedies personalize ho sakein.',
  },
  {
    name: 'Calculate button dabao',
    text: 'Aapki Janm Kundali, Lagna, Dasha, aur remedies 5 second mein ready ho jayegi.',
  },
];

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function KundaliCalculatorPage() {
  return (
    <>
      <SiteNav />

      {/* ── JSON-LD: SoftwareApplication ── */}
      <Script
        id="kundali-calc-software-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Trikal Vaani Free AI Kundli Calculator',
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'INR',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              ratingCount: '247',
            },
            creator: {
              '@type': 'Person',
              name: 'Rohiit Gupta',
              jobTitle: 'Chief Vedic Architect',
              url: 'https://trikalvaani.com/founder',
            },
          }),
        }}
      />

      {/* ── JSON-LD: FAQPage ── */}
      <Script
        id="kundali-calc-faq-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.a,
              },
            })),
          }),
        }}
      />

      {/* ── JSON-LD: HowTo ── */}
      <Script
        id="kundali-calc-howto-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'Free AI Kundli Kaise Banayein',
            description: 'Trikal Vaani ke free AI Kundli Calculator se apni Janm Kundali kaise banayein — step by step.',
            step: HOWTO_STEPS.map((s, i) => ({
              '@type': 'HowToStep',
              position: i + 1,
              name: s.name,
              text: s.text,
            })),
          }),
        }}
      />

      {/* ── JSON-LD: BreadcrumbList ── */}
      <Script
        id="kundali-calc-breadcrumb-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
              { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
              { '@type': 'ListItem', position: 3, name: 'Kundli Calculator', item: 'https://trikalvaani.com/calculators/kundali-calculator' },
            ],
          }),
        }}
      />

      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          {/* ── BREADCRUMB ── */}
          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Kundli Calculator</span>
          </nav>

          {/* ── H1 ── */}
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free AI Kundli Calculator — Janm Kundali Online
          </h1>

          {/* ── GEO DIRECT ANSWER (40-60 words) ── */}
          <div
            className="rounded-xl p-5 mb-6"
            style={{
              background: 'rgba(212,175,55,0.06)',
              border: `1px solid rgba(212,175,55,0.2)`,
            }}
          >
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikal Vaani ka Free AI Kundli Calculator</strong> aapki Janm Kundali Swiss Ephemeris se calculate karta hai. Sirf date of birth, time, aur place daalo — Lagna, Nakshatra, Chandra Rashi, current Mahadasha, aur Parashar-based remedies (Mantra, Ratna, Daan) turant free milte hain.
            </p>
          </div>

          {/* ── E-E-A-T AUTHOR STRIP ── */}
          <div
            className="flex items-center gap-3 mb-8 p-4 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ background: GOLD, color: '#080B12' }}
            >
              RG
            </div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Engine: Swiss Ephemeris · Lahiri Ayanamsha · BPHS Classical Rules
              </div>
            </div>
          </div>

          {/* ── CALCULATOR CLIENT COMPONENT ── */}
          <KundaliCalculatorClient />

          {/* ── EDUCATIONAL CONTENT (800-1200 words) ── */}
          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>
              Janm Kundali Kya Hoti Hai?
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Janm Kundali (Birth Chart) Vedic Jyotish ka sabse important tool hai. Jab aapka janm hota hai, us samay aakash mein 9 grah (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) aur 27 nakshatron ki specific position hoti hai. Yahi position aapki kundli mein dikhti hai — aur isi se aapke jeevan ka blueprint banta hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Maharishi Parashar ne <em>Brihat Parashara Hora Shastra (BPHS)</em> mein likha hai ki kundli ke 12 bhava (houses) aapke jeevan ke 12 alag-alag kshetra dikhate hain — janm se lekar moksha tak. Pehla bhav (Lagna) aapka vyaktitva dikhata hai, doosra dhan, saatva vivah, dasvan karma — aur isi tarah har bhav ka apna mahatva hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>
              Lagna, Nakshatra aur Rashi — Kya Antar Hai?
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Lagna (Ascendant):</strong> Janm samay purvi kshitij pe jo rashi udit ho rahi thi — woh aapka Lagna hai. Yeh aapka physical body, personality, aur jeevan ki disha dikhata hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Chandra Rashi (Moon Sign):</strong> Janm samay Chandra jis rashi mein the, woh aapki Chandra Rashi hai. Yeh aapka mann, emotions, aur mata se sambandh dikhata hai. Indian astrology mein predictions zyadatar Chandra Rashi pe based hoti hain — isliye "Rashi" ka matlab aksar Chandra Rashi hota hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Nakshatra:</strong> 27 nakshatron mein se ek — jis nakshatra mein Chandra ho. Yeh aapka karma pattern aur emotional makeup decide karta hai. Har nakshatra ka apna devta, swami grah, aur 4 padas hote hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>
              Vimshottari Dasha — Jeevan Ke Phase
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vimshottari Dasha system 120 saal ka cycle hai, jismein har grah ek specific period ke liye aapke jeevan pe rule karta hai. Jaise Surya ka 6 saal, Chandra ka 10, Mangal ka 7, Rahu ka 18, Guru ka 16, Shani ka 19, Budh ka 17, Ketu ka 7, aur Shukra ka 20.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Aapki current Mahadasha aur Antardasha decide karti hai ki <strong>abhi aapke jeevan mein kya chal raha hai</strong> — career boom hai ya struggle, marriage timing kab hai, financial peak kab aayega. Trikal Vaani ka detailed ₹51 prediction iss timing ko unlock karta hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>
              Parashar Remedies — Mantra, Ratna, Daan
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Maharishi Parashar ne kundli ke har dosh ke liye remedy bhi di hai. Trikal Vaani aapko 3 main categories mein remedies deta hai — bilkul free:
            </p>
            <ul className="text-slate-300 space-y-2 mb-4 list-disc pl-6">
              <li><strong style={{ color: GOLD }}>Mantra:</strong> Aapke ishta grah ka 108 baar daily japa.</li>
              <li><strong style={{ color: GOLD }}>Ratna:</strong> Aapke favorable grah ka gemstone — carat aur dhatu sahit.</li>
              <li><strong style={{ color: GOLD }}>Daan:</strong> Aapke weak grah ko strengthen karne ke liye specific daan — kis din, kya cheez.</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>
              Trikal Vaani vs Doosre Calculators — Antar Kya Hai?
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Doosre kundli calculator sirf chart dikhate hain — Trikal Vaani <strong>Parashar ke Dos &amp; Donts</strong> aur <strong>3 personalized remedies</strong> bhi free deta hai. Hamara engine Swiss Ephemeris pe chalta hai (NASA-grade accuracy), Lahiri Ayanamsha use karta hai (Government of India standard), aur Shadbala (6-component planet strength) bhi calculate karta hai.
            </p>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>
              Yeh Calculator Kaise Kaam Karta Hai
            </h2>
            <div className="space-y-3">
              {HOWTO_STEPS.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                    style={{ background: GOLD, color: '#080B12' }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold mb-1" style={{ color: GOLD }}>{step.name}</div>
                    <div className="text-sm text-slate-400">{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQs ── */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details
                  key={i}
                  className="p-4 rounded-xl cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── RELATED CALCULATORS ── */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>
              Aur Bhi Free Calculators
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'dasha-calculator', name: 'Dasha Calculator' },
                { slug: 'nakshatra-calculator', name: 'Nakshatra Finder' },
                { slug: 'rashi-calculator', name: 'Rashi Calculator' },
                { slug: 'lagna-calculator', name: 'Lagna Calculator' },
                { slug: 'sade-sati-calculator', name: 'Sade Sati Check' },
                { slug: 'manglik-dosh-calculator', name: 'Manglik Dosh' },
              ].map((c) => (
                <Link
                  key={c.slug}
                  href={`/calculators/${c.slug}`}
                  className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
                  style={{
                    background: 'rgba(212,175,55,0.06)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    color: GOLD,
                  }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

          {/* ── CTA: ₹51 PREDICTION ── */}
          <section
            className="mt-12 p-6 md:p-8 rounded-2xl text-center"
            style={{
              background: `linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(2,8,23,0.6) 100%)`,
              border: `1px solid rgba(212,175,55,0.35)`,
            }}
          >
            <h3 className="text-xl md:text-2xl font-serif font-bold mb-2" style={{ color: GOLD }}>
              Free Kundli toh dekh li.
            </h3>
            <p className="text-slate-300 mb-1">Ab apni puri <strong>Jeevan Bhavishyavani</strong> dekhni hai?</p>
            <ul className="text-sm text-slate-400 my-4 space-y-1">
              <li>✓ 9 Planets ka full analysis</li>
              <li>✓ Mahadasha + Antardasha + Action Windows</li>
              <li>✓ Career / Marriage / Health timing</li>
              <li>✓ 50+ Personalized Remedies</li>
            </ul>
            <Link
              href="/#birth-form"
              className="inline-block mt-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
              }}
            >
              ₹51 Mein Prediction Le →
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}
