// 🔱 TRIKAAL VAANI | components/landing/DeepReadingsGrid.tsx | v1.0
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-06-27
// ============================================================================
// PURPOSE: The "8 Deep Vedic Readings" question-menu, extracted verbatim from
//   HomepageGEO v2.3 (GEO Element 3) into its own component so it can be placed
//   HIGH on the homepage — directly above the Services & Pricing section —
//   instead of being buried at the bottom inside the SEO/E-E-A-T block.
//
//   WHY: Buying psychology — visitors should see WHAT they can ask (the 8
//   readings menu) right before they see the price ladder. Previously this
//   menu sat below the founder strip + FAQ, so most users never reached it.
//
//   CONTENT IS UNCHANGED from HomepageGEO v2.3 Element 3 — same 8 service
//   cards, same "Explore by Life Domain" 15-link block, same routes, same
//   gold palette. Only its LOCATION on the page changes (via page.tsx v11.5).
//
// NOTE: Server Component (no "use client") — pure <Link> + static markup, so
//   all 8 reading links + 15 domain links land in the initial server-rendered
//   HTML and stay fully crawlable by Google / Perplexity / SGE.
// ============================================================================

import Link from "next/link";

const READINGS = [
  { title: "Ex-Back Reading",   slug: "ex-back-reading",   emoji: "♀",  hook: "Will my ex come back?" },
  { title: "Toxic Boss Radar",  slug: "toxic-boss-radar",  emoji: "♄",  hook: "Is my boss karmically toxic?" },
  { title: "Career Pivot",      slug: "career-pivot",      emoji: "♃",  hook: "Wrong career?" },
  { title: "Property Yog",      slug: "property-yog",      emoji: "🏠", hook: "Right time to buy?" },
  { title: "Compatibility",     slug: "compatibility",     emoji: "⚖️", hook: "Truly compatible?" },
  { title: "Child Destiny",     slug: "child-destiny",     emoji: "👶", hook: "Child's calling?" },
  { title: "Wealth Reading",    slug: "wealth-reading",    emoji: "💰", hook: "When wealth peaks?" },
  { title: "Spiritual Purpose", slug: "spiritual-purpose", emoji: "🕉", hook: "Soul's purpose?" },
];

const DOMAINS = [
  { name: "Career", slug: "career" },
  { name: "Wealth", slug: "wealth" },
  { name: "Health", slug: "health" },
  { name: "Relationships", slug: "relationships" },
  { name: "Family", slug: "family" },
  { name: "Education", slug: "education" },
  { name: "Home & Property", slug: "home" },
  { name: "Legal", slug: "legal" },
  { name: "Travel", slug: "travel" },
  { name: "Spirituality", slug: "spirituality" },
  { name: "Wellbeing", slug: "wellbeing" },
  { name: "Marriage", slug: "marriage" },
  { name: "Business", slug: "business" },
  { name: "Foreign Settlement", slug: "foreign-settlement" },
  { name: "Digital Career", slug: "digital-career" },
];

export default function DeepReadingsGrid() {
  return (
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
            8 Deep Vedic Readings,{" "}
            <span className="text-[#D4AF37]">Starting ₹51</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Each reading is built on a specific house, planet, and Dasha
            combination from your kundli. Pick the question that matters most.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {READINGS.map((s) => (
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
            Or Explore by <span className="text-[#D4AF37]">Life Domain</span>
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {DOMAINS.map((d) => (
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
  );
}

// ============================================================================
// END — components/landing/DeepReadingsGrid.tsx v1.0
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
