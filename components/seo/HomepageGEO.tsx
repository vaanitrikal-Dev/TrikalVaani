/**
 * =============================================================
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE: components/seo/HomepageGEO.tsx
 * Version: 2.3 — Speakable classes + author photo (Claude audit June 2026)
 * Date: 2026-06-10
 * 🔱 JAI MAA SHAKTI
 *
 * CHANGES vs v2.2 (CEO-approved):
 *   ✅ FIX-1: className="geo-direct-answer" added to direct answer section.
 *      layout.tsx speakable selector targets '.geo-direct-answer' — without
 *      this class, Google SGE / voice search cannot extract the direct answer.
 *   ✅ FIX-2: className="faq-speakable" added to FAQ section.
 *      layout.tsx speakable selector targets '.faq-speakable' — without this,
 *      Google SGE cannot extract FAQ answers for voice / AI overviews.
 *   ✅ FIX-3: Author strip 'RG' text placeholder replaced with actual
 *      Rohiit Gupta photo (Next/Image, same src as SiteFooter).
 *      Real author photo = stronger E-E-A-T signal for Google.
 *   PROTECTED (untouched): all content, FAQ Q&A, internal links, global
 *      reach block, all IDs, routes, CTAs, brand spelling, gold palette.
 * =============================================================
 */

import Link from 'next/link';
import Image from 'next/image';

export default function HomepageGEO() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          GEO ELEMENT 1: DIRECT ANSWER BLOCK
          v2.3 FIX-1: className="geo-direct-answer" added for speakable.
          layout.tsx speakable cssSelector: [".geo-direct-answer", "h1", "h2"]
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="what-is-trikaal-vaani"
        aria-labelledby="geo-direct-answer-heading"
        className="geo-direct-answer px-4 py-16 bg-[#0A0D18] border-y border-white/5"
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-3 text-center">
            What is Trikaal Vaani
          </p>
          <h2
            id="geo-direct-answer-heading"
            className="font-serif text-2xl md:text-3xl font-bold text-white text-center mb-6"
          >
            Free Kundli &amp; Accurate AI Vedic Astrology —{' '}
            <span className="text-[#D4AF37]">Trusted Worldwide</span>
          </h2>
          <p className="text-base md:text-lg text-gray-300 leading-relaxed text-center">
            <strong className="text-white">
              Trikaal Vaani is an AI-powered Vedic astrology platform
            </strong>{' '}
            that generates a <strong>free kundli</strong> and accurate,
            personalised predictions from your exact birth details. It is built
            on <strong>Swiss Ephemeris</strong> precision and classical{' '}
            <strong className="text-[#D4AF37]">
              Brihat Parashara Hora Shastra
            </strong>{' '}
            rules, and founded by{' '}
            <Link
              href="/founder"
              className="text-[#D4AF37] hover:underline font-semibold"
            >
              Rohiit Gupta, Chief Vedic Architect
            </Link>
            .
          </p>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed text-center mt-4">
            It computes your Lagna, all 12 houses, 9 grahas, 27 nakshatras,
            Vimshottari Dasha, Bhrigu Nandi patterns and Shadbala strength, then
            delivers personalised predictions across 15 life domains — in
            English, Hindi and Hinglish, for seekers across India and worldwide.
            Free preview; deep readings from ₹51.
          </p>
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
              🌍 India &amp; Worldwide
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GEO ELEMENT 2: E-E-A-T AUTHOR STRIP
          v2.3 FIX-3: 'RG' text replaced with actual author photo.
          Real photo = stronger E-E-A-T signal. Same src as SiteFooter.
          ═══════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="author-byline-heading"
        className="px-4 py-12 bg-[#080B12]"
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* v2.3: Real photo replaces 'RG' text placeholder */}
          <div
            className="flex-shrink-0 relative w-24 h-24 rounded-full overflow-hidden"
            style={{
              border: '2px solid rgba(212,175,55,0.4)',
              boxShadow: '0 0 24px rgba(212,175,55,0.2)',
            }}
          >
            <Image
              src="/Rohiit-Gupta.jpg"
              alt="Rohiit Gupta, Chief Vedic Architect, Trikaal Vaani"
              fill
              className="object-cover object-top"
              loading="lazy"
            />
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
              Founder of Trikaal Vaani — the named Vedic astrologer
              accountable for every kundli reading framework that Trikaal AI
              applies to your birth chart.{' '}
              <Link
                href="/founder"
                className="text-[#D4AF37] hover:underline font-medium"
              >
                Read full credentials →
              </Link>
            </p>
            <p className="text-gray-500 text-xs mt-3">
              Last updated: June 2026 · Verified by Rohiit Gupta · Powered by
              Swiss Ephemeris
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GEO ELEMENT 3: INTERNAL LINK HUB
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { title: 'Ex-Back Reading', slug: 'ex-back-reading', emoji: '♀', hook: 'Will my ex come back?' },
              { title: 'Toxic Boss Radar', slug: 'toxic-boss-radar', emoji: '♄', hook: 'Is my boss karmically toxic?' },
              { title: 'Career Pivot', slug: 'career-pivot', emoji: '♃', hook: 'Wrong career?' },
              { title: 'Property Yog', slug: 'property-yog', emoji: '🏠', hook: 'Right time to buy?' },
              { title: 'Compatibility', slug: 'compatibility', emoji: '⚖️', hook: 'Truly compatible?' },
              { title: 'Child Destiny', slug: 'child-destiny', emoji: '👶', hook: "Child's calling?" },
              { title: 'Wealth Reading', slug: 'wealth-reading', emoji: '💰', hook: 'When wealth peaks?' },
              { title: 'Spiritual Purpose', slug: 'spiritual-purpose', emoji: '🕉', hook: "Soul's purpose?" },
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

          <div className="text-center">
            <Link
              href="/services"
              className="inline-block bg-[#D4AF37] text-[#080B12] font-bold px-8 py-3 rounded-lg hover:bg-[#e8c84a] transition-all duration-200"
            >
              View All 8 Readings →
            </Link>
          </div>

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
          GEO ELEMENT 4: VISIBLE FAQ
          v2.3 FIX-2: className="faq-speakable" added for speakable.
          layout.tsx speakable cssSelector: [".faq-speakable"]
          ═══════════════════════════════════════════════════════════ */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="faq-speakable px-4 py-16 bg-[#080B12]"
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
                q: 'How do I get a free AI kundli and horoscope on Trikaal Vaani?',
                a: 'Open trikalvaani.com, enter your name, date of birth, exact time of birth, and place of birth in the free analysis form. Trikaal Vaani computes your Lagna, all 12 houses, planetary positions, current Mahadasha, and gives you a Vedic kundli summary instantly — no signup or credit card required.',
              },
              {
                q: 'Is Trikaal Vaani free to use?',
                a: 'Yes. The Trikaal Ka Sandesh free preview gives you a 150–200 word AI kundli and horoscope summary with key message and action. Deep readings start at ₹51 and voice readings at ₹11. Free analysis is unlimited.',
              },
              {
                q: "How accurate are Trikaal Vaani's AI horoscope predictions?",
                a: 'Trikaal Vaani computes your chart with the Swiss Ephemeris engine and Lahiri Ayanamsha — the astronomical standard for sidereal Vedic calculation. Accuracy comes from depth: it layers Bhrigu Nandi Nadi pattern logic and Shadbala six-fold planetary strength on top of classical BPHS rules, and every reading framework is designed by a named Chief Vedic Architect, Rohiit Gupta, who is accountable for it.',
              },
              {
                q: 'Who is Rohiit Gupta?',
                a: 'Rohiit Gupta is the Chief Vedic Architect and founder of Trikaal Vaani. He has 15+ years of Vedic astrology study under the Parashara BPHS tradition, and personally designs every kundli reading framework that Trikaal AI applies to your birth chart.',
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
                a: 'Yes. The 7th house governs marriage, Venus rules love, and the Navamsa D9 chart reveals soul-level compatibility. Combined with your active Vimshottari Dasha (especially Venus or Jupiter Antardasha), Trikaal Vaani predicts likely marriage windows within 2-3 month precision.',
              },
              {
                q: 'Is the AI horoscope different from a daily Rashi horoscope?',
                a: "A daily Rashi horoscope gives one prediction for ~10 crore people sharing your Moon sign. Trikaal Vaani's AI kundli is computed from YOUR exact birth time and place, so the prediction is unique to your chart — like the difference between a clothing size XL and a tailored suit.",
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
          GEO ELEMENT 5: GLOBAL REACH BLOCK
          ═══════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="global-reach-heading"
        className="px-4 py-16 bg-[#0D1020] border-t border-white/5"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-3">
            Vedic Astrology, Anywhere You Are
          </p>
          <h2
            id="global-reach-heading"
            className="font-serif text-2xl md:text-3xl font-bold text-white mb-6"
          >
            One Platform for{' '}
            <span className="text-[#D4AF37]">India &amp; the World</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-2xl mx-auto mb-8">
            Trikaal Vaani is a fully online Vedic astrology platform. Your kundli
            is computed from your exact birth coordinates and time zone, so the
            reading is identical in depth whether you are in India or anywhere
            across the global diaspora. Birth places are supported worldwide with
            automatic time-zone and latitude–longitude resolution — the same
            Swiss Ephemeris precision and Parashara BPHS framework for every
            seeker, in English, Hindi or Hinglish.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              'Any birth place worldwide',
              'Auto time-zone resolution',
              'NRI &amp; global diaspora',
              'English · Hindi · Hinglish',
              'PDF on WhatsApp &amp; Email',
              '15 life domains',
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs border border-[#D4AF37]/20 text-gray-300 px-3 py-1.5 rounded-full bg-[#D4AF37]/[0.03]"
                dangerouslySetInnerHTML={{ __html: tag }}
              />
            ))}
          </div>

          <a
            href="/#birth-form"
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#080B12] font-bold px-8 py-3 rounded-lg hover:bg-[#e8c84a] transition-all duration-200"
          >
            Start Your Free Kundli Analysis →
          </a>
        </div>
      </section>
    </>
  );
}

// =============================================================
// END — components/seo/HomepageGEO.tsx v2.3
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// =============================================================
