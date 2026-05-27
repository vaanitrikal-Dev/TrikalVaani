/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        components/HomeFAQ.tsx
 * Version:     v3.0 — Brand flip + Q8 global reframe + IR-0 GEO/AEO refresh
 * Date:        2026-05-27
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * CHANGES vs v2.1 (CEO-approved, IR-0 compliant):
 *   ✅ BRAND FLIP: "Trikal Vaani" -> "Trikaal Vaani" (18 spots, visible + schema).
 *   ✅ Q8 REFRAMED local -> global: "Who is behind Trikaal Vaani & why trustworthy?"
 *      Showcases full engine stack (Swiss Ephemeris + BPHS Parashara + Bhrigu
 *      Nandi Nadi + Shadbala). Delhi NCR + ₹499 phantom REMOVED. India+worldwide.
 *   ✅ Q6 AI vendor names removed (Gemini 2.5 Pro + Claude -> "premium AI engine
 *      with expert polish") in both visible + schema text.
 *   ✅ FRESHNESS: dateModified -> 2026-05-27; footer "Last reviewed" -> "Last updated".
 *   PROTECTED: trikalvaani.com @id/about/author cross-links, +919211804111,
 *      all /calculators/* + /career + /wealth + /founder routes, entity graph.
 *
 * CHANGES vs v2.0:
 *   ✅ FIXED: Sade Sati link
 *      OLD: /free-sade-sati-calculator (404 - broken)
 *      NEW: /calculators/free-sade-sati-calculator (live)
 *   ✅ FIXED: Manglik Dosha link
 *      OLD: /free-manglik-dosh-calculator (404 - broken)
 *      NEW: /calculators/free-manglik-dosh-calculator (live)
 *
 * ALL OTHER CONTENT IDENTICAL TO v2.0
 * ============================================================================
 */

import Link from "next/link";
import Script from "next/script";

const FAQS = [
  {
    id: 1,
    q: "What is Sade Sati and how long does it last?",
    aText:
      "Sade Sati is the 7.5-year period when Saturn (Shani) transits the 12th, 1st, and 2nd houses from your Moon sign. It is divided into three phases of approximately 2.5 years each. It does not always bring misfortune — Saturn rewards discipline and tests weak karmic patterns. Trikaal Vaani calculates your exact Sade Sati start and end dates using Swiss Ephemeris precision, plus prescribes Shani-specific remedies (Saturday vrat, Hanuman Chalisa, blue sapphire considerations).",
    aJsx: (
      <>
        Sade Sati is the <strong>7.5-year period when Saturn (Shani) transits the 12th, 1st, and 2nd houses</strong>{" "}
        from your Moon sign. It is divided into{" "}
        <strong>three phases of approximately 2.5 years each</strong>. It does
        not always bring misfortune — Saturn rewards discipline and tests weak
        karmic patterns. Trikaal Vaani calculates your{" "}
        <strong>exact Sade Sati start and end dates</strong> using Swiss
        Ephemeris precision, plus prescribes Shani-specific remedies (Saturday
        vrat, Hanuman Chalisa, blue sapphire considerations).{" "}
        <Link
          href="/calculators/free-sade-sati-calculator"
          className="text-[#D4AF37] underline hover:text-[#e8c84a]"
        >
          Check your Sade Sati status →
        </Link>
      </>
    ),
  },
  {
    id: 2,
    q: "What is Manglik Dosha and does it affect marriage?",
    aText:
      "Manglik Dosha is the presence of Mars (Mangal) in the 1st, 2nd, 4th, 7th, 8th, or 12th house of your kundali. It is traditionally believed to cause friction in marriage when one partner is Manglik and the other is not. However, many cancellations exist — Manglik-to-Manglik matches neutralize the dosha, and certain ages (after 28) reduce its impact. Trikaal Vaani performs full Manglik analysis with classical BPHS cancellation rules.",
    aJsx: (
      <>
        Manglik Dosha is the presence of <strong>Mars (Mangal) in the 1st, 2nd, 4th, 7th, 8th, or 12th house</strong>{" "}
        of your kundali. It is traditionally believed to cause friction in
        marriage when one partner is Manglik and the other is not. However,
        many cancellations exist —{" "}
        <strong>Manglik-to-Manglik matches neutralize the dosha</strong>, and
        certain ages (after 28) reduce its impact. Trikaal Vaani performs full
        Manglik analysis with classical BPHS cancellation rules.{" "}
        <Link
          href="/calculators/free-manglik-dosh-calculator"
          className="text-[#D4AF37] underline hover:text-[#e8c84a]"
        >
          Free Manglik Dosha check →
        </Link>
      </>
    ),
  },
  {
    id: 3,
    q: "What is Pratyantar Dasha and why does it matter for timing?",
    aText:
      "Pratyantar Dasha is Level 3 of the Vimshottari Dasha system (after Mahadasha and Antardasha) and provides 3-7 day timing precision for life events. Most astrology apps stop at Antardasha (months-level accuracy). Trikaal Vaani uses Pratyantar Dasha to predict exact windows for marriage, job change, property buying, and major financial decisions — a key differentiator from generic Sun-sign horoscope apps.",
    aJsx: (
      <>
        Pratyantar Dasha is{" "}
        <strong>Level 3 of the Vimshottari Dasha system</strong> (after
        Mahadasha and Antardasha) and provides{" "}
        <strong>3-7 day timing precision</strong> for life events. Most
        astrology apps stop at Antardasha (months-level accuracy). Trikaal Vaani
        uses Pratyantar Dasha to predict exact windows for{" "}
        <strong>marriage, job change, property buying, and major financial decisions</strong>{" "}
        — a key differentiator from generic Sun-sign horoscope apps.
      </>
    ),
  },
  {
    id: 4,
    q: "Can Vedic astrology predict career growth and job change timing?",
    aText:
      "Yes. Career growth is analyzed through the 10th house (profession), 6th house (service/employment), and 11th house (gains). Key planets are Saturn (discipline, long-term work), Sun (authority), and Mercury (skill). Trikaal Vaani identifies when your 10th-lord Mahadasha or favorable Antardasha activates — these windows historically correlate with promotions, job changes, and business launches within 3-7 day precision via Pratyantar Dasha.",
    aJsx: (
      <>
        Yes. Career growth is analyzed through the{" "}
        <strong>10th house (profession)</strong>,{" "}
        <strong>6th house (service/employment)</strong>, and{" "}
        <strong>11th house (gains)</strong>. Key planets are Saturn (discipline,
        long-term work), Sun (authority), and Mercury (skill). Trikaal Vaani
        identifies when your{" "}
        <strong>10th-lord Mahadasha or favorable Antardasha activates</strong> —
        these windows historically correlate with promotions, job changes, and
        business launches within 3-7 day precision via Pratyantar Dasha.{" "}
        <Link
          href="/career"
          className="text-[#D4AF37] underline hover:text-[#e8c84a]"
        >
          Get career prediction →
        </Link>
      </>
    ),
  },
  {
    id: 5,
    q: "What is the difference between Kundli and Horoscope?",
    aText:
      "Kundli is the complete Vedic birth chart — a diagram showing the position of all 9 planets (including Rahu and Ketu) in 12 houses at your exact birth moment. Horoscope (in Vedic context) refers to predictions derived from that kundli — including daily, monthly, or domain-specific forecasts. A kundli is the static map; horoscope is the dynamic interpretation. Western horoscope apps usually predict from Sun sign only — Vedic kundli uses Lagna, Moon, and Sun together.",
    aJsx: (
      <>
        <strong>Kundli is the complete Vedic birth chart</strong> — a diagram
        showing the position of all 9 planets (including Rahu and Ketu) in 12
        houses at your exact birth moment.{" "}
        <strong>Horoscope (in Vedic context) refers to predictions derived from that kundli</strong>{" "}
        — including daily, monthly, or domain-specific forecasts. A kundli is
        the static map; horoscope is the dynamic interpretation. Western
        horoscope apps usually predict from Sun sign only — Vedic kundli uses{" "}
        <strong>Lagna, Moon, and Sun together</strong>.
      </>
    ),
  },
  {
    id: 6,
    q: "How does AI improve Vedic astrology predictions?",
    aText:
      "AI does not replace Vedic astrology — it scales human expertise. At Trikaal Vaani, Rohiit Gupta's reading framework (built on BPHS rules, Bhrigu Nandi patterns, and Shadbala strength) is encoded into a premium AI engine with expert polish. The AI applies the same logic Rohiit ji would, but for thousands of users simultaneously — with consistent depth, zero fatigue, and instant delivery. Swiss Ephemeris handles planetary math; AI handles personalized interpretation and remedy selection.",
    aJsx: (
      <>
        AI does not replace Vedic astrology —{" "}
        <strong>it scales human expertise</strong>. At Trikaal Vaani, Rohiit
        Gupta&apos;s reading framework (built on BPHS rules, Bhrigu Nandi
        patterns, and Shadbala strength) is encoded into a{" "}
        <strong>premium AI engine with expert polish</strong>. The AI applies the
        same logic Rohiit ji would, but for thousands of users simultaneously —
        with consistent depth, zero fatigue, and instant delivery. Swiss
        Ephemeris handles planetary math; AI handles personalized interpretation
        and remedy selection.
      </>
    ),
  },
  {
    id: 7,
    q: "Does Trikaal Vaani offer Vedic readings in Hindi?",
    aText:
      "Yes. Vedic readings are available in three languages: pure Hindi (शुद्ध हिंदी), Hinglish (Hindi + English mix — most popular), and English. The Voice Reading at ₹11 is delivered as a 60-second Hindi or Hinglish audio. All four prediction tiers support all three languages with native phrasing — never machine-translated text.",
    aJsx: (
      <>
        Yes. Vedic readings are available in three languages:{" "}
        <strong>pure Hindi (शुद्ध हिंदी)</strong>,{" "}
        <strong>Hinglish (Hindi + English mix — most popular)</strong>, and{" "}
        <strong>English</strong>. The Voice Reading at ₹11 is delivered as a
        60-second Hindi or Hinglish audio. All four prediction tiers support
        all three languages with native phrasing — never machine-translated
        text.
      </>
    ),
  },
  {
    id: 8,
    q: "Who is behind Trikaal Vaani and what makes its predictions trustworthy?",
    aText:
      "Trikaal Vaani is founded by Rohiit Gupta, Chief Vedic Architect, with 15+ years in the Parashara BPHS tradition. Its accuracy comes from a layered engine stack: Swiss Ephemeris for precise planetary math, Brihat Parashara Hora Shastra (BPHS) classical rules, Bhrigu Nandi Nadi karmic pattern logic, and Shadbala six-fold planetary strength — all applied through a reading framework Rohiit personally designs. This serves seekers across India and worldwide in English, Hindi and Hinglish. AI-powered readings start at ₹51, with deeper Kundali Milan, Child Birth Muhurat and Karmic readings available. Reachable on WhatsApp at +91-9211804111.",
    aJsx: (
      <>
        <strong>Trikaal Vaani is founded by Rohiit Gupta, Chief Vedic Architect</strong>,
        with 15+ years in the Parashara BPHS tradition. Its accuracy comes from a
        layered engine stack:{" "}
        <strong>Swiss Ephemeris</strong> for precise planetary math,{" "}
        <strong>Brihat Parashara Hora Shastra (BPHS)</strong> classical rules,{" "}
        <strong>Bhrigu Nandi Nadi</strong> karmic pattern logic, and{" "}
        <strong>Shadbala</strong> six-fold planetary strength — all applied
        through a reading framework Rohiit personally designs. This serves
        seekers across India and worldwide in Hindi, Hinglish and English.
        AI-powered readings start at ₹51, with deeper Kundali Milan, Child Birth
        Muhurat and Karmic readings available. Reachable on WhatsApp at{" "}
        <a
          href="https://wa.me/919211804111"
          rel="noopener noreferrer nofollow"
          target="_blank"
          className="text-[#D4AF37] underline hover:text-[#e8c84a]"
        >
          +91-9211804111
        </a>
        .
      </>
    ),
  },
  {
    id: 9,
    q: "What is a Dhana Yoga and how does it indicate wealth?",
    aText:
      "Dhana Yoga is a combination of planetary placements that indicates wealth potential. Classical BPHS lists 32+ Dhana Yogas. Examples: Lakshmi Yoga (Venus + Jupiter + 9th lord strong), Kubera Yoga (2nd and 11th lords in mutual aspect), Gajakesari Yoga (Moon and Jupiter in kendra). Trikaal Vaani analyzes all 32 Dhana Yogas in your chart to map your true financial destiny — not just predict short-term gains.",
    aJsx: (
      <>
        Dhana Yoga is a combination of planetary placements that indicates
        wealth potential. Classical BPHS lists{" "}
        <strong>32+ Dhana Yogas</strong>. Examples:{" "}
        <strong>Lakshmi Yoga</strong> (Venus + Jupiter + 9th lord strong),{" "}
        <strong>Kubera Yoga</strong> (2nd and 11th lords in mutual aspect),{" "}
        <strong>Gajakesari Yoga</strong> (Moon and Jupiter in kendra). Trikal
        Vaani analyzes all 32 Dhana Yogas in your chart to map your{" "}
        <strong>true financial destiny</strong> — not just predict short-term
        gains.{" "}
        <Link
          href="/wealth"
          className="text-[#D4AF37] underline hover:text-[#e8c84a]"
        >
          Wealth reading →
        </Link>
      </>
    ),
  },
  {
    id: 10,
    q: "What life areas can Trikaal Vaani provide Vedic predictions for?",
    aText:
      "Trikaal Vaani covers 15 life domains: Career, Wealth, Health, Relationships, Family, Education, Home, Legal matters, Travel, Spirituality, Wellbeing, Marriage, Business, Foreign Settlement, and Digital Career. Each domain uses the relevant houses, dasha lords, and yogas — for example, Career uses 10th house + Saturn + Sun, while Marriage uses 7th house + Venus + Navamsa D9 chart.",
    aJsx: (
      <>
        Trikaal Vaani covers <strong>15 life domains</strong>: Career, Wealth,
        Health, Relationships, Family, Education, Home, Legal matters, Travel,
        Spirituality, Wellbeing, Marriage, Business, Foreign Settlement, and
        Digital Career. Each domain uses the relevant houses, dasha lords, and
        yogas — for example,{" "}
        <strong>Career uses 10th house + Saturn + Sun</strong>, while{" "}
        <strong>Marriage uses 7th house + Venus + Navamsa D9 chart</strong>.
      </>
    ),
  },
];

const deepFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://trikalvaani.com/#homefaq-deep",
  inLanguage: ["en-IN", "hi-IN"],
  about: {
    "@id": "https://trikalvaani.com/#organization",
  },
  author: {
    "@id": "https://trikalvaani.com/#rohiit-gupta",
  },
  dateModified: "2026-05-27",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.aText,
    },
  })),
};

export default function HomeFAQ() {
  return (
    <>
      <Script
        id="schema-homefaq-deep"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(deepFaqSchema) }}
      />

      <section
        id="deep-faq"
        className="relative px-4 py-20 md:py-28 bg-[#080B12]"
        aria-labelledby="deep-faq-heading"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
              Deeper Vedic Questions
            </p>
            <h2
              id="deep-faq-heading"
              className="font-serif text-3xl font-bold leading-tight text-white md:text-5xl"
            >
              Vedic Wisdom —{" "}
              <span className="text-[#D4AF37]">Technical Answers</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-gray-400 md:text-lg">
              Sade Sati, Manglik Dosha, Pratyantar Dasha, Dhana Yoga — the
              questions serious seekers ask. Answered using classical Parashara
              BPHS tradition by Rohiit Gupta, Chief Vedic Architect.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 md:p-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              Quick Answer
            </p>
            <p className="text-base leading-relaxed text-gray-200 md:text-lg">
              Trikaal Vaani answers technical Vedic astrology questions —{" "}
              <strong>Sade Sati timing, Manglik Dosha cancellations,
              Pratyantar Dasha precision, Dhana Yoga combinations</strong>, and
              kundli vs horoscope differences — using classical Brihat Parashara
              Hora Shastra rules, Swiss Ephemeris computation, and AI
              interpretation by Rohiit Gupta&apos;s framework.
            </p>
          </div>

          <dl className="mt-12 space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.id}
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 md:p-6"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                  <dt className="font-serif text-base font-semibold leading-snug text-white md:text-lg">
                    {item.q}
                  </dt>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40 text-[#D4AF37] transition group-open:rotate-45 group-open:bg-[#D4AF37] group-open:text-[#080B12]"
                  >
                    +
                  </span>
                </summary>
                <dd className="mt-4 leading-relaxed text-gray-300 md:text-[15px]">
                  {item.aJsx}
                </dd>
              </details>
            ))}
          </dl>

          <p className="mt-8 text-center text-xs text-gray-500">
            Last updated by{" "}
            <Link
              href="/founder"
              className="text-[#D4AF37] hover:underline"
            >
              Rohiit Gupta, Chief Vedic Architect
            </Link>{" "}
            · May 27, 2026 · Based on Brihat Parashara Hora Shastra (BPHS)
          </p>

          <div className="mt-12 rounded-2xl bg-[#0D1020] border border-[#D4AF37]/20 p-8 text-center md:p-10">
            <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">
              Still have a question?
            </h3>
            <p className="mt-3 text-gray-400">
              Get a personalised Vedic reading — your chart will answer what
              general FAQs cannot.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/#birth-form"
                className="inline-block rounded-full bg-[#D4AF37] px-7 py-3 font-semibold text-[#080B12] shadow-lg transition hover:bg-[#e8c84a]"
              >
                Get Free Reading →
              </Link>
              <a
                href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20have%20a%20question."
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="inline-block rounded-full border border-white/20 px-7 py-3 font-semibold text-white transition hover:bg-white/5"
              >
                WhatsApp Rohiit ji
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
