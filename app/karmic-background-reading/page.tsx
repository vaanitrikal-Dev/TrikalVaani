/**
 * ============================================================
 * TRIKAL VAANI — Karmic Background Reading — SEO Landing Pillar
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/karmic-background-reading/page.tsx
 * v2.0 (1 Oct 2026) — ₹101 / $11 (pehle ₹251/$19). Report ab GRANTH se (AI band):
 *   BPHS, Phaladipika, Jataka Parijata ke vachan + 2 naye hisse (Prediction, Upay)
 *   + purva janm (Phaladipika 14.24-25) + BPHS 83 (purva janm ke shaap).
 *   Copy mein wahi likha jo report sach mein deti hai — "Bhrigu Nandi Nadi",
 *   "Navamsa D9", "Rahu-Ketu axis" ke waade hataye (naya engine ye nahi padhta).
 * VERSION: 2.0 (1 Oct 2026) — ₹101/$11 + granth saar copy
 * v1.1 — 27 Sep 2026 — delivery text sach kiya (CEO Option A): WhatsApp/Email auto-delivery ka koi system nahi hai, isliye 'PDF on/via WhatsApp + Email' → 'PDF download + WhatsApp share'.
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Server component (SEO). Renders <KarmicForm/> (client).
 * Per Plan §4 + §5: GEO direct answer 40-60w, 6 dimensions explained,
 * FAQPage + Service + Person schema triple-stack, E-E-A-T, legal-safe framing.
 * INDEXED (public landing — the reading pages themselves stay private).
 * ============================================================
 */

import { Metadata } from 'next';
import KarmicForm from '@/components/karmic/KarmicForm';

const SITE = 'https://trikalvaani.com';
const URL  = `${SITE}/karmic-background-reading`;

export const metadata: Metadata = {
  title: { absolute: 'Karmic Background Reading — Personality Patterns' },
  description:
    'Reveal a person\'s karmic patterns — personality, fidelity tendencies, financial behaviour, family conduct, hidden tendencies and marriage outlook — from their birth chart alone. Granth-based analysis (BPHS, Phaladipika) by Rohiit Gupta, with prediction and classical remedies. ₹101.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Karmic Background Reading — Trikaal Vaani',
    description: 'Granth-based reading of 6 karmic dimensions, past-life karma, prediction and remedies from the birth chart. ₹101.',
    url: URL, siteName: 'Trikaal Vaani', type: 'website',
  },
  robots: { index: true, follow: true },
};

const GOLD = '#D4AF37';

// ── 6 dimensions content (entity-rich, EEAT) ──────────────────
const DIMENSIONS = [
  { icon: '🪔', title: 'Core Personality', houses: '1st house (Lagna) · its lord · Ashtakavarga',
    desc: 'The core nature — temperament, strengths and shadows — read from the Ascendant house, where its lord sits, and what BPHS and Jataka Parijata say of that placement.' },
  { icon: '💗', title: 'Fidelity & Relationship Conduct', houses: '7th house · 7th lord · Venus',
    desc: 'Tendencies in love and loyalty, shown as inclinations — never accusations — through the 7th house, its lord and Venus, the karaka of marriage.' },
  { icon: '🪙', title: 'Financial Behaviour', houses: '2nd house · 11th house · their lords · Jupiter',
    desc: 'The relationship with money — saving, spending, gains — read from the house of wealth, the house of gains, their lords and Jupiter.' },
  { icon: '🏠', title: 'Family & Parental Respect', houses: '4th house · 9th house · their lords',
    desc: 'Patterns of respect, duty and bonds toward family and elders, seen through the houses of mother and father and where their lords sit.' },
  { icon: '🌑', title: 'Hidden Tendencies & Karmic Baggage', houses: '8th · 12th · Phaladipika 14.24 · BPHS 83',
    desc: 'The karmic load from past births — the 8th and 12th houses, the past and next birth from the 9th and 5th lords (Phaladipika 14.24-25), and the past-life curses of BPHS chapter 83, each with its shloka.' },
  { icon: '🔱', title: 'Marriage Outlook & Longevity', houses: '7th & 8th house · their dasha periods',
    desc: 'The outlook for married life and its endurance, read from the 7th and 8th houses and what the texts say will unfold in their dasha periods.' },
  { icon: '⏳', title: 'Prediction — Kab Kya Khulega', houses: 'Vimshottari dasha · next 12 years',
    desc: 'Which periods open which houses, from now through the next twelve years, with what the texts say of each period.' },
  { icon: '🕉️', title: 'Granth ke Upay', houses: 'BPHS 84 · Phaladipika 2.28',
    desc: 'Remedies only for the planets that sit in difficult houses (BPHS 84.26) — their mantra, japa count, samidha, dakshina and grain — plus the shanti BPHS 83 prescribes.' },
];

const FAQS = [
  { q: 'Is a Vedic karmic background reading legal?',
    a: 'Yes. It reads only the birth chart — planetary positions and karmic patterns — and uses no private or personal data about any individual. It is a Vedic astrological analysis, not an investigation or background check.' },
  { q: 'Can a kundali really show personality and fidelity tendencies?',
    a: 'Classical Vedic texts (BPHS, Phaladipika, Jataka Parijata) map planets and houses to character traits and life tendencies. Trikaal reads these as karmic patterns and inclinations — never as verdicts about a person.' },
  { q: 'How is this different from a detective or background check?',
    a: 'A detective gathers private real-world data. A Karmic Background Reading interprets only the birth chart using Vedic principles. It reveals karmic patterns to help you understand and prepare — it never judges or verifies facts about a person.' },
  { q: 'What do I need to get a reading?',
    a: 'Only the person\'s date of birth, time of birth, and place of birth. From this, Trikaal computes the chart (Swiss Ephemeris) and reads the six karmic dimensions.' },
  { q: 'What are the 6 dimensions covered?',
    a: 'Core Personality, Fidelity & Relationship Conduct, Financial Behaviour, Family & Parental Respect, Hidden Tendencies & Karmic Baggage, and Marriage Outlook & Longevity — plus a dasha-based prediction and classical remedies.' },
  { q: 'How much does it cost and how is it delivered?',
    a: 'A complete Karmic Background Reading is ₹101. It is delivered as an on-screen reading plus a downloadable PDF you can share on WhatsApp, usually within 60 seconds of payment.' },
];

export default function KarmicLandingPage() {
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  const serviceSchema = {
    '@context': 'https://schema.org', '@type': 'Service',
    '@id': `${URL}#service`,
    name: 'Karmic Background Reading — Vedic Character & Patterns Analysis',
    serviceType: 'Vedic Astrology Reading (BPHS, Phaladipika)',
    provider: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Trikaal Vaani', url: SITE },
    areaServed: { '@type': 'Country', name: 'India' },
    description: 'A granth-based reading of six karmic dimensions from a person\'s birth chart: personality, fidelity tendencies, financial behaviour, family respect, hidden tendencies, and marriage outlook.',
    offers: { '@type': 'Offer', price: '101', priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: URL },
  };
  const personSchema = {
    '@context': 'https://schema.org', '@type': 'Person',
    name: 'Rohiit Gupta', jobTitle: 'Chief Vedic Architect', url: SITE,
    worksFor: { '@type': 'Organization', name: 'Trikaal Vaani', url: SITE },
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-[#f5f5f5]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      {/* HERO */}
      <header className="relative overflow-hidden border-b border-[#D4AF37]/20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1120] via-[#080B12] to-[#080B12] opacity-90" />
        <div className="relative max-w-3xl mx-auto px-5 py-14 sm:py-20 text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] tracking-[0.25em] uppercase">
            Trikaal Vaani · BPHS · Phaladipika
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">
            Karmic Background <span style={{ color: GOLD }}>Reading</span>
          </h1>
          <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Understand a person’s karmic patterns — personality, loyalty, money, family and marriage outlook —
            from the birth chart alone. By Rohiit Gupta, Chief Vedic Architect.
          </p>
        </div>
      </header>

      {/* GEO DIRECT ANSWER (40-60w) */}
      <section className="max-w-3xl mx-auto px-5 pt-10">
        <div className="bg-[#0d1120]/60 border-l-4 border-[#D4AF37] rounded-r-xl p-5 sm:p-6">
          <p className="text-base sm:text-lg leading-relaxed text-gray-100">
            A Karmic Background Reading is a granth-based analysis that reveals a person’s personality,
            fidelity tendencies, financial behaviour, family conduct, hidden tendencies and marriage outlook —
            read entirely from their birth chart. It uses no personal data; it reveals karmic patterns so you can
            prepare, never verdicts about the person.
          </p>
        </div>
      </section>

      {/* THE FORM */}
      <KarmicForm />

      {/* 6 DIMENSIONS EXPLAINED (EEAT depth) */}
      <section className="max-w-3xl mx-auto px-5 py-10">
        <h2 className="text-2xl font-semibold text-center mb-2">The 6 Karmic Dimensions</h2>
        <p className="text-center text-gray-400 text-sm mb-8">Each dimension is read from specific houses and planets, per BPHS, Phaladipika and Jataka Parijata.</p>
        <div className="space-y-4">
          {DIMENSIONS.map((d, i) => (
            <div key={i} className="bg-[#0d1120]/60 border border-[#D4AF37]/15 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{d.icon}</span>
                <h3 className="text-lg font-semibold text-[#D4AF37]"><span className="text-gray-500 mr-2">{i + 1}.</span>{d.title}</h3>
              </div>
              <p className="text-gray-200 leading-relaxed text-[15px]">{d.desc}</p>
              <p className="text-xs text-gray-500 mt-2 italic">Read from: {d.houses}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEGAL-SAFE FRAMING (trust + EEAT) */}
      <section className="max-w-3xl mx-auto px-5 py-6">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d1120] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-3">Patterns, Not Verdicts</h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Trikaal does not judge — Trikaal reveals patterns so you can prepare. Every finding is a karmic
            tendency drawn from the birth chart, with guidance on how to work with it. This reading uses no
            private data and makes no claim about a person’s real-world conduct.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-5 py-10">
        <h2 className="text-2xl font-semibold text-[#D4AF37] mb-5">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((f, i) => (
            <details key={i} className="bg-[#0d1120]/60 border border-[#D4AF37]/15 rounded-xl p-4 group">
              <summary className="cursor-pointer font-medium text-gray-100 list-none flex justify-between items-center">
                {f.q}<span className="text-[#D4AF37] group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-gray-300 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* E-E-A-T AUTHOR */}
      <section className="max-w-3xl mx-auto px-5 pb-12">
        <div className="bg-[#0d1120]/40 border border-[#D4AF37]/15 rounded-xl p-5 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-lg shrink-0">RG</div>
          <div>
            <div className="font-semibold text-white">Rohiit Gupta</div>
            <div className="text-[#D4AF37] text-xs mb-2">Chief Vedic Architect</div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Rohiit Gupta is the founder and Chief Vedic Architect of Trikaal Vaani. Karmic readings are grounded
              in Brihat Parashara Hora Shastra (BPHS), Phaladipika and Jataka Parijata, computed with Swiss Ephemeris precision.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#D4AF37]/10">
        <div className="max-w-3xl mx-auto px-5 py-8 text-center text-xs text-gray-500">
          <p className="text-[#D4AF37] tracking-[0.3em] uppercase">Trikaal Vaani</p>
          <p className="mt-2">AI-Powered Vedic Astrology · Rohiit Gupta, Chief Vedic Architect</p>
          <p className="mt-1">MSME · UDYAM-DL-10-0119070 · trikalvaani.com</p>
        </div>
      </footer>
    </div>
  );
}
