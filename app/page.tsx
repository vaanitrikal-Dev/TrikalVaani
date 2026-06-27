// 🔱 TRIKAL VAANI | app/page.tsx | v11.5
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-06-27
// ============================================================================
// v11.4 → v11.5 — "8 DEEP VEDIC READINGS" MOVED ABOVE PRICING (CEO-approved):
//   ✅ ADD: <DeepReadingsGrid /> imported and rendered as a new TRUST +
//      COMMERCIAL TIER slot, placed DIRECTLY ABOVE <PricingSection />.
//      This is the "8 Deep Vedic Readings, Starting ₹51" question-menu that
//      was previously buried inside HomepageGEO (slot #11), between the
//      founder strip and the FAQ — so most visitors never reached it.
//   ✅ Buying-psychology flow is now: free birth form → Kundali Milan → trust
//      → SEE THE 8 READINGS (what you can ask) → THEN the price ladder.
//   ✅ PAIRED CHANGE: HomepageGEO bumped to v2.4 — Element 3 (the same menu)
//      removed there so there is NO duplicate. Content moved, not copied.
//   IR-12 PRESERVED: new slot lives in the earning/commercial tier, above
//      the mobile fold. No locked component (HomeClient) touched.
//   PROTECTED (untouched): all metadata, blog ISR fetch, schemas, canonical,
//      every other slot + component, HomeBlogCard, Voice teaser.
// ----------------------------------------------------------------------------
// v11.3 → v11.4 — VOICE ASTROLOGY TEASER (CEO-approved, promotion):
//   ✅ ADD: inline "Trikaal Voice" teaser between SocialProofTicker and
//      DailyPanchang → kills the /voice-pricing orphan-page problem.
// v11.2 → v11.3 — DYNAMIC BLOG SECTION (Supabase blog_posts, ISR 1h).
// v11.1 → v11.2 — META DESCRIPTION REWRITE (metadata only).
// v11.0 → v11.1 — BRAND FLIP + IR-0 CLEANUP (metadata only).
// ============================================================================

import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import HomepageSchema from '@/components/seo/HomepageSchema';
import HomepageGEO from '@/components/seo/HomepageGEO';
import SchemaScript from '../components/SchemaScript';
import HomeFAQ from '../components/HomeFAQ';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import Hero from '@/components/landing/Hero';
import PillarsGrid from '@/components/landing/PillarsGrid';
import DeepReadingsGrid from '@/components/landing/DeepReadingsGrid';
import SocialProofTicker from '@/components/landing/SocialProofTicker';
import InnerCircleWaitlist from '@/components/landing/InnerCircleWaitlist';
import AIManifesto from '@/components/landing/AIManifesto';
import DailyPanchang from '@/components/landing/DailyPanchang';
import DailyRashifal from '@/components/landing/DailyRashifal';
import PricingSection from '@/components/landing/PricingSection';
import LiveTrustBar from '@/components/landing/LiveTrustBar';
import KundaliMilanTeaser from '@/components/landing/KundaliMilanTeaser';
import HomeClient from './HomeClient';

// ── v11.3: ISR — homepage (incl. blog section) revalidates every hour ──
export const revalidate = 3600;

// ─────────────────────────────────────────────────────────────
// PAGE-SPECIFIC METADATA — overrides layout.tsx v3.0+ defaults
// v11.2: description tightened to 136 chars. v11.1: brand flipped.
// ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Trikaal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
  description:
    "Free AI kundli, Kundali Milan & accurate Vedic predictions for career, marriage, wealth & health by Rohiit Gupta, Chief Vedic Architect.",
  alternates: {
    canonical: 'https://trikalvaani.com/',
    languages: {
      'en-IN': 'https://trikalvaani.com/',
      'hi-IN': 'https://trikalvaani.com/hi',
    },
  },
  openGraph: {
    title: 'Trikaal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
    description:
      "Free AI kundli, Kundali Milan & accurate Vedic astrology predictions. Personalised readings by Rohiit Gupta, Chief Vedic Architect. Voice & text from ₹11.",
    url: 'https://trikalvaani.com/',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikaal Vaani',
    images: [
      {
        url: 'https://trikalvaani.com/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Trikaal Vaani — Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trikaal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
    description:
      'Free AI kundli, Kundali Milan & accurate Vedic astrology predictions. Voice & text readings from ₹11.',
    images: ['https://trikalvaani.com/og-default.jpg'],
  },
};

// ─────────────────────────────────────────────────────────────
// v11.3: HOMEPAGE BLOG — Supabase fetch + local card
// ─────────────────────────────────────────────────────────────

interface HomeBlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  published_at: string;
  read_time_minutes: number;
}

// Safe fallback — renders only if Supabase query fails/empty (never blank)
const FALLBACK_POSTS: HomeBlogPost[] = [
  {
    slug: 'shani-gochar-2026-saturn-transit',
    title: "Shani Gochar 2026: What Saturn's Transit Through Aquarius Means for Your Rashi",
    description: 'Saturn — the great teacher of karma — continues its powerful 2.5-year transit through Aquarius. Understand how this Gochar affects all 12 Rashis in 2026.',
    category: 'Gochar / Transits',
    published_at: '2026-01-15',
    read_time_minutes: 8,
  },
  {
    slug: 'rahu-ketu-axis-2026-karmic-shift',
    title: 'Rahu-Ketu Axis 2026: The Pisces-Virgo Karmic Shift and What It Means for India',
    description: 'The shadow planets Rahu and Ketu are now deeply embedded in the Pisces-Virgo axis — the most spiritually significant transit of the decade.',
    category: 'Gochar / Transits',
    published_at: '2026-02-20',
    read_time_minutes: 10,
  },
  {
    slug: 'guru-gochar-taurus-2026-wealth-growth',
    title: "Guru Gochar 2026: Jupiter's Promise of Wealth, Property & Spiritual Abundance",
    description: 'Jupiter — Brihaspati, the cosmic guru — continues its journey through Taurus in early 2026 before moving to Gemini. A rare window for wealth building.',
    category: 'Gochar / Transits',
    published_at: '2026-03-10',
    read_time_minutes: 7,
  },
];

async function getLatestPosts(): Promise<HomeBlogPost[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, title, description, category, published_at, read_time_minutes')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3);
    if (error || !data || data.length === 0) return FALLBACK_POSTS;
    return data as HomeBlogPost[];
  } catch {
    return FALLBACK_POSTS;
  }
}

function formatPostDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function HomeBlogCard({ post }: { post: HomeBlogPost }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"
      style={{
        background: 'rgba(11,16,26,0.7)',
        border: '1px solid rgba(212,175,55,0.12)',
      }}
    >
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#D4AF37' }}>
        🏷 {post.category}
      </p>
      <h3 className="font-serif text-lg font-bold text-white leading-snug mb-3 group-hover:text-yellow-200 transition-colors">
        {post.title}
      </h3>
      <p
        className="text-sm text-slate-400 leading-relaxed mb-4"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {post.description}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          🕐 {post.read_time_minutes} min read &nbsp;·&nbsp; {formatPostDate(post.published_at)}
        </span>
        <span className="font-semibold" style={{ color: '#D4AF37' }}>
          Read &rarr;
        </span>
      </div>
    </a>
  );
}

export default async function HomePage() {
  // v11.3: latest 3 published posts from Supabase (ISR-cached 1h)
  const latestPosts = await getLatestPosts();

  return (
    <>
      {/* ── SEO SCHEMAS — server-rendered into initial HTML ──────────────────
          HomepageSchema v1.1: Person (Rohiit ji E-E-A-T) + FAQPage +
            BreadcrumbList + HowTo + OfferCatalog (5 schemas)
          SchemaScript: existing WebSite/Service/Product schemas (Phase C)
          NO duplicate @id values — Session A audit cleaned all collisions.
      ──────────────────────────────────────────────────────────────────── */}
      <HomepageSchema />
      <SchemaScript />

      <div className="min-h-screen bg-[#080B12]">
        <SiteNav />
        <main>

          {/* ═══════════════════════════════════════════════════════════════
              EARNING TIER — slots #1 to #3 — TIERED LOCK (IR-12)
              Mobile users see ALL earning slots before any informational
              content. This is the revenue zone.
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 1. HERO ────────────────────────────────────────────────────
              Brand recall + single CTA. Compressed for mobile (40vh target).
              EDITABLE per IR-12. */}
          <Hero />

          {/* ── 2. HOMECLIENT — MAHAKAAL + DARD ENGINE ─────────────────────
              🔒 EARNING LOCKED (IR-12)
              The primary conversion surface. DardEngine selector pre-fills
              the BirthForm category via shared useState<SelectedCategory>.
              DO NOT split these two components — the funnel depends on
              their glued state.
              Order inside: DardEngine card grid → Mahakaal BirthForm. */}
          <HomeClient />

          {/* ── 3. KUNDALI MILAN TEASER ────────────────────────────────────
              🔒 EARNING LOCKED (IR-12)
              Pre-launch waitlist + SEO/GEO indexing window for Kundali Milan. */}
          <KundaliMilanTeaser />

          {/* ═══════════════════════════════════════════════════════════════
              TRUST + COMMERCIAL TIER — slots #4 to #6
              Reinforce trust signals immediately after earning surfaces.
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 4. LIVE TRUST BAR ──────────────────────────────────────── */}
          <LiveTrustBar />

          {/* ── 4.5 DEEP READINGS GRID — v11.5 — "8 Deep Vedic Readings" ────
              Moved UP from inside HomepageGEO (was slot #11, buried below the
              founder strip + FAQ). Now sits directly above the price ladder so
              visitors see WHAT they can ask before they see the prices.
              Content unchanged — HomepageGEO v2.4 had this block removed to
              avoid any duplicate. Server component → all links crawlable. */}
          <DeepReadingsGrid />

          {/* ── 5. PRICING SECTION ─────────────────────────────────────────
              After the 8-readings menu, the visitor is ready for the full
              price ladder. */}
          <PricingSection />

          {/* ── 6. SOCIAL PROOF TICKER ─────────────────────────────────── */}
          <SocialProofTicker />

          {/* ── 6.5 VOICE ASTROLOGY TEASER — v11.4 — links to /voice-pricing ──
              Gives the voice product a home-page entry point: kills the
              /voice-pricing orphan-page problem (passes internal-link
              authority) and surfaces voice to visitors who would otherwise
              only notice the floating widget. Pure inline JSX — no imports,
              no locked component touched. Single CTA → /voice-pricing. */}
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div
                className="rounded-3xl px-6 py-12 sm:px-12 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.03))',
                  border: '1px solid rgba(212,175,55,0.25)',
                }}
              >
                <p className="text-xs font-medium tracking-widest uppercase text-yellow-400/60 mb-4">
                  Trikaal Voice • असली आवाज़ में उत्तर
                </p>

                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-snug mb-4">
                  अपनी आवाज़ में पूछें —{' '}
                  <span className="text-gradient-gold">₹11 में</span>
                </h2>

                <p className="text-slate-300 max-w-xl mx-auto text-base leading-relaxed mb-3">
                  टाइप करने की ज़रूरत नहीं। Mic दबाकर अपना सवाल बोलिए, और
                  Rohiit Gupta की अपनी आवाज़ में Vedic उत्तर सुनिए — Swiss
                  Ephemeris पर आधारित, सिर्फ़ 60 सेकंड में।
                </p>

                <p className="text-slate-500 text-sm mb-8">
                  Hindi • Hinglish • English &nbsp;·&nbsp; Press &amp; hold to speak
                  &nbsp;·&nbsp; Razorpay secure
                </p>

                <a
                  href="/voice-pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #A8820A, #D4AF37)',
                    color: '#080B12',
                    boxShadow: '0 8px 32px rgba(168,130,10,0.35)',
                  }}
                >
                  🎙️ Voice Astrology शुरू करें &rarr;
                </a>

                <p className="text-slate-500 text-xs mt-5">
                  1 question ₹11 &nbsp;·&nbsp; 5 questions ₹51 &nbsp;·&nbsp; 12 questions ₹101
                </p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              ENGAGEMENT + RETENTION TIER — slots #7 to #10
              Daily-return hooks + brand depth content.
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 7. DAILY PANCHANG ──────────────────────────────────────── */}
          <DailyPanchang />

          {/* ── 8. DAILY RASHIFAL ──────────────────────────────────────── */}
          <DailyRashifal />

          {/* ── 9. PILLARS GRID — life domains ─────────────────────────── */}
          <PillarsGrid />

          {/* ── 10. AI MANIFESTO — brand philosophy ────────────────────── */}
          <AIManifesto />

          {/* ═══════════════════════════════════════════════════════════════
              SEO/GEO/AEO/E-E-A-T TIER — slots #11 to #14
              These sections exist primarily for Google, Perplexity, SGE,
              ChatGPT, and Gemini crawlers. Human users may scroll here
              for deep info, but the earning conversion already happened
              above. Crawlers parse position-independent — moving these
              down has ZERO impact on search rankings or AI citations.
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 11. HOMEPAGE GEO — v2.4 (8-readings block extracted out) ────
              Direct answer + author E-E-A-T + Tier 1 FAQ + global reach.
              The "8 Deep Vedic Readings" hub that used to live inside this
              component now renders above PricingSection (slot #4.5). */}
          <HomepageGEO />

          {/* ── 12. HOME FAQ v2.0 — TIER 2 DEEP TECHNICAL FAQ ──────────────
              Unique schema @id="#homefaq-deep" — no collision with Tier 1.
              Covers Sade Sati, Manglik Dosha, Pratyantar Dasha, Dhana Yoga. */}
          <HomeFAQ />

          {/* ── 13. INNER CIRCLE WAITLIST ──────────────────────────────── */}
          <InnerCircleWaitlist />

          {/* ── 14. BLOG SECTION — v11.3 DYNAMIC (Supabase blog_posts) ─────
              Latest 3 is_published=true posts, published_at DESC.
              ISR revalidate=3600 → new articles appear within 1 hour.
              Falls back to FALLBACK_POSTS if query fails (never blank). */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs font-medium tracking-widest uppercase text-yellow-400/60 mb-4">
                  Vedic Knowledge Base
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                  Latest from the{' '}
                  <span className="text-gradient-gold">Trikaal Blog</span>
                </h2>
                <p className="text-slate-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">
                  Deep dives into Gochar transits, Kundali analysis, and the timeless
                  science of Jyotish — written for the modern seeker.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {latestPosts.map((post) => (
                  <HomeBlogCard key={post.slug} post={post} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <a
                  href="/blog"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-all duration-300"
                  style={{
                    border: '1px solid rgba(212,175,55,0.2)',
                    color: '#D4AF37',
                    background: 'rgba(212,175,55,0.04)',
                  }}
                >
                  View All Articles &rarr;
                </a>
              </div>
            </div>
          </section>

        </main>
        <SiteFooter />
      </div>
    </>
  );
}

// ============================================================================
// END — app/page.tsx v11.5
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// CEO LOCKED: TIERED LAYOUT — earning sections above mobile fold
// ============================================================================
