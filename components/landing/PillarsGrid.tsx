// 🔱 TRIKAAL VAANI | components/landing/PillarsGrid.tsx | v2.0
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-06-26
// ============================================================================
// v1.x → v2.0 — LIFE PILLARS NOW LINK TO ALL 15 DOMAIN PAGES (SEO + UX):
//   ✅ FIX-1 (SEO): The old 6 decorative cards ("Unlock with analysis") did
//      NOT link anywhere — they just sat on the page. The 15 real domain
//      pages (/career, /wealth … /digital-career) had ZERO homepage links
//      and were buried at SERP positions 78–95. Every card is now a crawlable
//      <Link> to its domain page — 15 internal links from the homepage,
//      passing authority straight to the commercial pages.
//   ✅ FIX-2 (COUNT BUG): Subhead said "six essential life domains" while the
//      rest of the site said 11 / 15. Now correctly states 15 — single source
//      of truth, matches sitemap domain_pages + services + layout schema.
//   ✅ FIX-3 (UX): Clients can now actually SEE and reach every life domain
//      from the homepage instead of only a generic 6-card teaser.
//   PROTECTED: Drop-in replacement — page.tsx slot #9 still renders
//      <PillarsGrid /> with no props. NO other file changes required.
//
// NOTE: Server Component (no "use client") — pure links + static markup.
//   Best for SEO: all 15 <a href> land in the initial server-rendered HTML,
//   so Google/Perplexity/SGE crawl them on first paint. No client JS shipped.
// ============================================================================

import Link from "next/link";

// ── 15 Life Domains — single source of truth for the homepage grid ──────────
// slug must match the live route /[slug] and the sitemap domain list.
type Domain = {
  slug: string;
  name: string;
  sanskrit: string;
  desc: string;
  glyph: string;
  accent: string; // icon-tile tint + hover glow
};

const DOMAINS: Domain[] = [
  { slug: "career",            name: "Career",            sanskrit: "Karma & Dharma",   desc: "Profession, promotions, and the right time to rise.", glyph: "💼", accent: "#5B8DEF" },
  { slug: "wealth",            name: "Wealth",            sanskrit: "Dhana & Lakshmi",  desc: "Money flow, savings, and your peak earning years.",   glyph: "💰", accent: "#D4AF37" },
  { slug: "health",            name: "Health",            sanskrit: "Aarogya & Prana",  desc: "Vitality, body cycles, and planetary rhythms.",       glyph: "🩺", accent: "#34D399" },
  { slug: "relationships",     name: "Relationships",     sanskrit: "Shukra & Chandra", desc: "Love, soulmate timing, and emotional harmony.",       glyph: "💞", accent: "#F472B6" },
  { slug: "family",            name: "Family",            sanskrit: "Kutumb & Pitru",   desc: "Home bonds, parents, and domestic peace.",            glyph: "👨‍👩‍👧", accent: "#FB923C" },
  { slug: "education",         name: "Education",         sanskrit: "Vidya & Budh",     desc: "Focus, exams, and the right field to study.",         glyph: "🎓", accent: "#A78BFA" },
  { slug: "home",             name: "Home & Property",   sanskrit: "Bhumi & Sukh",     desc: "When to buy, build, or move — your Property Yog.",     glyph: "🏠", accent: "#F59E0B" },
  { slug: "legal",             name: "Legal",             sanskrit: "Nyaya & Shani",    desc: "Disputes, court timing, and karmic justice.",         glyph: "⚖️", accent: "#94A3B8" },
  { slug: "travel",            name: "Travel",            sanskrit: "Yatra & Rahu",     desc: "Journeys, relocation, and movement windows.",         glyph: "✈️", accent: "#38BDF8" },
  { slug: "spirituality",      name: "Spirituality",      sanskrit: "Moksha & Ketu",    desc: "Your soul's path, dharma, and inner growth.",         glyph: "🕉️", accent: "#C084FC" },
  { slug: "wellbeing",         name: "Wellbeing",         sanskrit: "Shanti & Mana",    desc: "Mental calm, balance, and emotional clarity.",        glyph: "🧘", accent: "#2DD4BF" },
  { slug: "marriage",          name: "Marriage",          sanskrit: "Vivah & Guru",     desc: "Marriage timing, partner nature, and Navamsa truth.", glyph: "💍", accent: "#FB7185" },
  { slug: "business",          name: "Business",          sanskrit: "Vyapar & Lakshmi", desc: "Ventures, partnerships, and launch timing.",          glyph: "📈", accent: "#FBBF24" },
  { slug: "foreign-settlement", name: "Foreign Settlement", sanskrit: "Videsh & Rahu",  desc: "Settling abroad, visas, and NRI timing.",             glyph: "🌍", accent: "#60A5FA" },
  { slug: "digital-career",    name: "Digital Career",    sanskrit: "Naveen & Budh",    desc: "Tech, online income, and modern career paths.",       glyph: "💻", accent: "#818CF8" },
];

export default function PillarsGrid() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Heading ─────────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <p className="text-xs font-medium tracking-widest uppercase text-yellow-400/60 mb-4">
            The 15 Life Domains
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Life <span className="text-gradient-gold">Pillars</span>
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Vedic Jyotish maps your chart across 15 essential life domains.
            Tap any pillar to explore what your stars reveal.
          </p>
        </div>

        {/* ── 15 Domain Cards — each links to its /[slug] page ──────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DOMAINS.map((d) => (
            <Link
              key={d.slug}
              href={`/${d.slug}`}
              className="group relative rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(11,16,26,0.7)",
                border: "1px solid rgba(212,175,55,0.12)",
              }}
            >
              {/* Icon tile */}
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `${d.accent}1A`, // ~10% opacity tint
                  border: `1px solid ${d.accent}33`,
                }}
              >
                <span aria-hidden="true">{d.glyph}</span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-serif text-lg font-bold text-white leading-tight group-hover:text-yellow-200 transition-colors">
                    {d.name}
                  </h3>
                  <span className="text-[11px] italic text-slate-500">{d.sanskrit}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mt-1.5">
                  {d.desc}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold mt-3 opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#D4AF37" }}
                >
                  Explore {d.name} &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Bottom CTA → free birth form ──────────────────────────────── */}
        <div className="mt-12 text-center">
          <Link
            href="/#birth-form"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #A8820A, #D4AF37)",
              color: "#080B12",
              boxShadow: "0 8px 32px rgba(168,130,10,0.35)",
            }}
          >
            🔮 Unlock All 15 Pillar Scores — Free
          </Link>
          <p className="text-slate-500 text-xs mt-4">
            Free birth-data analysis · No card required · Instant results
          </p>
        </div>

      </div>
    </section>
  );
}

// ============================================================================
// END — components/landing/PillarsGrid.tsx v2.0
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
