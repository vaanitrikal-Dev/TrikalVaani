/**
 * =============================================================
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE: components/seo/HomepageGEO.tsx
 * Version: 1.1 — H1 + GEO direct answer aligned to new title
 * 🔱 JAI MAA SHAKTI
 *
 * NOTES FOR ROHIIT JI:
 * - VISIBLE content for Perplexity / SGE / ChatGPT / Gemini extraction
 * - Drop into app/page.tsx ONCE, between hero and birth form (or above-fold-3)
 * - Contains 5 GEO elements aligned with title "Free AI Kundli & Horoscope Predictions":
 *     1. 56-word direct answer block (CRITICAL — first content)
 *     2. E-E-A-T author byline
 *     3. Internal link grid (8 services + 15 pillars)
 *     4. Human-visible FAQ (matches FAQPage schema)
 *     5. Local SEO signal (Delhi NCR + 10 cities)
 * - Tailwind classes match your existing dark theme
 * - Zero JS — pure server component
 * =============================================================
 */

import Link from 'next/link';

export default function HomepageGEO() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          GEO ELEMENT 1: DIRECT ANSWER BLOCK (56 words)
          Opens with EXACT title phrase "Free AI Kundli & Horoscope
          Predictions" so AI search citations preserve brand framing.
          MUST be the first content block after H1 hero.
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="what-is-trikal-vaani"
        aria-labelledby="geo-direct-answer-heading"
        className="px-4 py-16 bg-[#0A0D18] border-y border-white/5"
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-3 text-center">
            What is Trikal Vaani
          </p>
          <h2
            id="geo-direct-answer-heading"
            className="font-serif text-2xl md:text-3xl font-bold text-white text-center mb-6"
          >
            Free AI Kundli &amp; Horoscope Predictions —{' '}
            <span className="text-[#D4AF37]">India&apos;s Trusted Vedic AI</span>
          </h2>

          {/* THIS PARAGRAPH IS THE GEO GOLD. 56 words. Do not edit
              without word count check. Every entity (planets, houses,
              dasha, BPHS, Swiss Ephemeris) is mentioned for AI extraction. */}
          <p className="text-base md:text-lg text-gray-300 leading-relaxed text-center">
            Trikal Vaani delivers <strong>free AI kundli and horoscope predictions</strong>{' '}
            built on Swiss Ephemeris precision and{' '}
            <strong className="text-[#D4AF37]">
              Brihat Parashara Hora Shastra
            </strong>{' '}
            classical rules. Founded by{' '}
            <Link
              href="/founder"
              className="text-[#D4AF37] hover:underline font-semibold"
            >
              Rohiit Gupta, Chief Vedic Architect (Delhi NCR)
            </Link>
            , it computes your Lagna, 12 houses, Vimshottari Dasha, Bhrigu
            patterns, and Shadbala strength — then delivers personalized
            predictions across 15 life domains. Free preview, ₹51 deep readings.
          </p>

          {/* Trust badges — visible E-E-A-T signal */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1.5 rounded-full bg-[#D4AF37]/5">
              ⚡ Swiss Ephemeris
            </span>
            <span className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1.5 rounded-full bg-[#D4AF37]/5">
              📖 BPHS Classical
            </span>
            <span className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1.5 rounded-full bg-[#D4AF37]/5">
              🔮 Bhrigu Nandi Nadi
            </span>
            <span className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1.5 rounded-full bg-[#D4AF37]/5">
              ⚖️ Shadbala
            </span>
            <span className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1.5 rounded-full bg-[#D4AF37]/5">
              📍 Delhi NCR
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GEO ELEMENT 2: E-E-A-T AUTHOR STRIP
          Shows the human authority behind every prediction.
          Critical for YMYL ranking under Google's Dec 2022 update.
          ═══════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="author-byline-heading"
        className="px-4 py-12 bg-[#080B12]"
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-24 h-24 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37]/40 flex items-center justify-center text-4xl font-serif text-[#D4AF37] font-bold">
            RG
          </div>
          <div className="flex-1">
            <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium mb-1">
              Reading Framework Designed By
            </p>
            <h2
              id="author-byline-heading"
              className="font-serif text-xl md:text-2xl font-bold text-white mb-2"
            >
              <Link
                href="/founder"
                className="hover:text-[#D4AF37] transition-colors"
              >
                Rohiit Gupta — Chief Vedic Architect
              </Link>
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              15+ years of Vedic study under the{' '}
              <strong className="text-white">Parashara BPHS</strong> tradition.
              Founder of Trikal Vaani. Delhi NCR–based Vedic astrologer
              accountable for every kundli reading framework that Jini AI
              applies to your birth chart.{' '}
              <Link
                href="/founder"
                className="text-[#D4AF37] hover:underline font-medium"
              >
                Read full credentials →
              </Link>
            </p>
            <p className="text-gray-500 text-xs mt-3">
              Last reviewed: May 2026 · Verified by Rohiit Gupta · Powered by
              Swiss Ephemeris
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GEO ELEMENT 3: INTERNAL LINK HUB
          Links to all 8 service pages + 15 future life domain pillars.
          Pushes link equity sitewide. Hub-spoke architecture.
          ═══════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="services-hub-heading"
        className="px-4 py-16 bg-[#0D1020]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-3">
              Pick Your Question
            </p>
            <h2
              id="services-hub-heading"
              className="font-serif text-3xl md:text-4xl font-bold text-white mb-4"
            >
              8 Deep Vedic Readings,{' '}
              <span className="text-[#D4AF37]">Starting ₹51</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Each reading is built on a specific house, planet, and Dasha
              combination from your kundli. Pick the question that matters
              most.
            </p>
          </div>

          {/* 8 SERVICE CARDS — internal links to /services/* */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              {
                title: 'Ex-Back Reading',
                slug: 'ex-back-reading',
                emoji: '♀',
                hook: 'Will my ex come back?',
              },
              {
                title: 'Toxic Boss Radar',
                slug: 'toxic-boss-radar',
                emoji: '♄',
                hook: 'Is my boss karmically toxic?',
              },
              {
                title: 'Career Pivot',
                slug: 'career-pivot',
                emoji: '♃',
                hook: 'Wrong career?',
              },
              {
                title: 'Property Yog',
                slug: 'property-yog',
                emoji: '🏠',
                hook: 'Right time to buy?',
              },
              {
                title: 'Compatibility',
                slug: 'compatibility',
                emoji: '⚖️',
                hook: 'Truly compatible?',
              },
              {
                title: 'Child Destiny',
                slug: 'child-destiny',
                emoji: '👶',
                hook: "Child's calling?",
              },
              {
                title: 'Wealth Reading',
                slug: 'wealth-reading',
                emoji: '💰',
                hook: 'When wealth peaks?',
              },
              {
                title: 'Spiritual Purpose',
                slug: 'spiritual-purpose',
                emoji: '🕉',
                hook: "Soul's purpose?",
              },
            ].map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group border border-white/10 rounded-xl p-5 bg-white/[0.02] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all duration-200"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {s.emoji}
                </div>
                <h3 className="font-serif text-base font-bold text-white mb-1 group-hover:text-[#D4AF37] transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-gray-500 italic">{s.hook}</p>
                <p className="text-[#D4AF37] text-sm font-bold mt-2">₹51</p>
              </Link>
            ))}
          </div>

          {/* CTA to /services index */}
          <div className="text-center">
            <Link
              href="/services"
              className="inline-block bg-[#D4AF37] text-[#080B12] font-bold px-8 py-3 rounded-lg hover:bg-[#e8c84a] transition-all duration-200"
            >
              View All 8 Readings →
            </Link>
          </div>

          {/* 15 LIFE DOMAIN PILLARS — internal link grid */}
          <div className="mt-16 pt-12 border-t border-white/5">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-white text-center mb-8">
              Or Explore by{' '}
              <span className="text-[#D4AF37]">Life Domain</span>
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: 'Career', slug: 'career' },
                { name: 'Wealth', slug: 'wealth' },
                { name: 'Health', slug: 'health' },
                { name: 'Relationships', slug: 'relationships' },
                { name: 'Family', slug: 'family' },
                { name: 'Education', slug: 'education' },
                { name: 'Home & Property', slug: 'home' },
                { name: 'Legal', slug: 'legal' },
                { name: 'Travel', slug: 'travel' },
                { name: 'Spirituality', slug: 'spirituality' },
                { name: 'Wellbeing', slug: 'wellbeing' },
                { name: 'Marriage', slug: 'marriage' },
                { name: 'Business', slug: 'business' },
                { name: 'Foreign Settlement', slug: 'foreign-settlement' },
                { name: 'Digital Career', slug: 'digital-career' },
              ].map((d) => (
                <Link
                  key={d.slug}
                  href={`/${d.slug}`}
                  className="text-sm border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-2 rounded-full hover:bg-[#D4AF37]/10 transition-all duration-200"
                >
                  {d.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GEO ELEMENT 4: VISIBLE FAQ (HTML mirror of FAQPage schema)
          Google rewards FAQs that exist BOTH in schema AND visibly.
          Updated: First Q now opens with title phrase for alignment.
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="px-4 py-16 bg-[#080B12]"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-3">
              Common Questions
            </p>
            <h2
              id="faq-heading"
              className="font-serif text-3xl md:text-4xl font-bold text-white"
            >
              Frequently Asked{' '}
              <span className="text-[#D4AF37]">Questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How do I get a free AI kundli and horoscope on Trikal Vaani?',
                a: 'Open trikalvaani.com, enter your name, date of birth, exact time of birth, and place of birth in the free analysis form. Trikal Vaani computes your Lagna, all 12 houses, planetary positions, current Mahadasha, and gives you a Vedic kundli summary instantly — no signup or credit card required.',
              },
              {
                q: 'Is Trikal Vaani free to use?',
                a: 'Yes. The Trikal Ka Sandesh free preview gives you a 150–200 word AI kundli and horoscope summary with key message and action. Deep readings start at ₹51 and voice readings at ₹11. Free analysis is unlimited.',
              },
              {
                q: 'How accurate are Trikal Vaani horoscope predictions vs AstroSage and AstroTalk?',
                a: 'Trikal Vaani uses the same Swiss Ephemeris engine as AstroSage with Lahiri Ayanamsha. The difference is depth — Trikal Vaani layers Bhrigu Nandi Nadi pattern logic and Shadbala six-fold strength on top, plus a named Chief Vedic Architect (Rohiit Gupta) accountable for every reading.',
              },
              {
                q: 'Who is Rohiit Gupta?',
                a: 'Rohiit Gupta is the Chief Vedic Architect and founder of Trikal Vaani. He has 15+ years of Vedic astrology study under the Parashara BPHS tradition, is based in Delhi NCR, and personally designs every kundli reading framework that Jini AI applies to your birth chart.',
              },
              {
                q: 'What birth details do I need for an AI kundli reading?',
                a: 'You need three details — date of birth, exact time of birth (within 15 minutes for highest accuracy), and place of birth. Time precision matters because the Lagna (Ascendant) changes every two hours and shifts house cusps in your kundli.',
              },
              {
                q: 'What is the difference between Vedic and Western horoscope predictions?',
                a: 'Vedic astrology uses the sidereal zodiac with Lahiri Ayanamsha (fixed to actual star positions), while Western astrology uses the tropical zodiac (fixed to seasons). Your Vedic Sun sign is usually one sign earlier than your Western Sun sign. Vedic also uses the Moon sign as primary.',
              },
              {
                q: 'Can the AI kundli predict marriage timing?',
                a: 'Yes. The 7th house governs marriage, Venus rules love, and the Navamsa D9 chart reveals soul-level compatibility. Combined with your active Vimshottari Dasha (especially Venus or Jupiter Antardasha), Trikal Vaani predicts likely marriage windows within 2–3 month precision.',
              },
              {
                q: 'Is the AI horoscope different from a daily Rashi horoscope?',
                a: 'Yes. A daily Rashi horoscope gives one prediction for ~10 crore people sharing your Moon sign. Trikal Vaani\'s AI kundli is computed from YOUR exact birth time and place, so the prediction is unique to your chart — like the difference between a clothing size XL and a tailored suit.',
              },
            ].map((f, i) => (
              <details
                key={i}
                className="border border-white/10 rounded-xl p-5 bg-white/[0.02] group cursor-pointer hover:border-[#D4AF37]/30 transition-colors"
              >
                <summary className="font-semibold text-white text-sm md:text-base list-none flex justify-between items-center gap-4">
                  {f.q}
                  <span className="text-[#D4AF37] text-xl flex-shrink-0 group-open:rotate-45 transition-transform duration-200">
                    +
                  </span>
                </summary>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mt-4">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GEO ELEMENT 5: LOCAL SEO BLOCK (Delhi NCR)
          Targets "best astrologer in Delhi", "astrologer near me",
          "vedic astrologer Noida", etc.
          ═══════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="local-seo-heading"
        className="px-4 py-16 bg-[#0D1020] border-t border-white/5"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-3">
            Delhi NCR&apos;s Trusted Vedic Astrologer
          </p>
          <h2
            id="local-seo-heading"
            className="font-serif text-2xl md:text-3xl font-bold text-white mb-6"
          >
            Best Vedic Astrologer in{' '}
            <span className="text-[#D4AF37]">Delhi NCR</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-2xl mx-auto mb-8">
            Trikal Vaani serves Delhi, Noida, Gurgaon, Faridabad, and Ghaziabad
            — combining traditional Parashara wisdom with AI kundli precision.
            For pan-India seekers, the platform delivers the same depth online
            that Rohiit ji offers in his Delhi NCR consultations.
          </p>

          {/* City links — internal SEO juice */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              'Delhi',
              'Noida',
              'Gurgaon',
              'Faridabad',
              'Ghaziabad',
              'Mumbai',
              'Bangalore',
              'Hyderabad',
              'Pune',
              'Kolkata',
            ].map((city) => (
              <Link
                key={city}
                href={`/astrologer-${city.toLowerCase()}`}
                className="text-xs border border-white/10 text-gray-400 px-3 py-1.5 rounded-full hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all duration-200"
              >
                Astrologer in {city}
              </Link>
            ))}
          </div>

          <a
            href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20a%20Vedic%20astrology%20consultation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#20ba5a] transition-all duration-200"
          >
            📱 WhatsApp Rohiit ji — ₹499 Personal Call
          </a>
        </div>
      </section>
    </>
  );
}
