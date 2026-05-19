// 🔱 TRIKAL VAANI | app/page.tsx | v11.0
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-05-19
// ============================================================================
// CEO-APPROVED LAYOUT REORDER (v10.0 → v11.0):
//
// STRATEGIC GOAL: Move earning sections ABOVE the mobile fold.
// Current v10.0 order pushed Mahakaal form to slot #5, causing ~50-60% mobile
// drop-off before any earning component was visible. v11.0 fixes this.
//
// ❌ REMOVED from old positions:
//    - HomepageGEO was at slot #2 (right after Hero) — moved to slot #11
//    - LiveTrustBar was at slot #3 — moved to slot #4
//    - SocialProofTicker was at slot #4 — moved to slot #6
//    - PricingSection was at slot #10 — moved to slot #5
//
// ✅ NEW SLOT #3: KundaliMilanTeaser (NEW component, "Launching Soon" earning
//    placeholder with email capture to Supabase milan_waitlist table)
//
// ✅ CRITICAL DESIGN DECISION:
//    HomeClient (DardEngine + BirthForm) stays INTACT as one component.
//    Their shared useState<SelectedCategory> + handleSelectCategory flow is
//    a brilliant funnel — user picks Dard category, BirthForm pre-fills below.
//    Breaking this would hurt conversions more than reordering helps.
//
// ✅ TIERED LOCK POLICY (Iron Rule IR-12):
//    LOCKED sections (no edits without CEO approval):
//      #2 HomeClient (Mahakaal form + Dard Engine)
//      #3 KundaliMilanTeaser
//      (Maa Shakti lives inside prediction pages, not homepage)
//    EDITABLE sections:
//      #1 Hero, #4-13 (all others)
//
// ✅ SEO/GEO IMPACT: ZERO loss.
//    HomepageGEO HTML still renders in the document. Google, Perplexity, SGE,
//    and ChatGPT crawlers parse the full DOM regardless of visual position.
//    Schema markup (HomepageSchema + SchemaScript) remains in document head.
//    Position only affects HUMAN scroll order, not AI extraction.
//
// PAGE FLOW v11.0 (top to bottom):
//   1. Hero                    (H1 + visual hook — compressed)
//   2. HomeClient              (Mahakaal form + Dard Engine — EARNING LOCKED)
//   3. KundaliMilanTeaser      (NEW — Launching Soon earning placeholder LOCKED)
//   4. LiveTrustBar            (social proof — quick trust strip)
//   5. PricingSection          (commercial trust — show tiers)
//   6. SocialProofTicker       (live ticker)
//   7. DailyPanchang           (daily return-visit hook)
//   8. DailyRashifal           (daily return-visit hook)
//   9. PillarsGrid             (life domains)
//   10. AIManifesto            (brand philosophy)
//   11. HomepageGEO            (GEO direct answer + Tier 1 FAQ + E-E-A-T — CRAWLER ONLY)
//   12. HomeFAQ v2.0           (Tier 2 deep technical FAQ)
//   13. InnerCircleWaitlist    (VIP capture)
//   14. Blog section           (3 latest posts)
// ============================================================================

import type { Metadata } from 'next';
import HomepageSchema from '@/components/seo/HomepageSchema';
import HomepageGEO from '@/components/seo/HomepageGEO';
import SchemaScript from '../components/SchemaScript';
import HomeFAQ from '../components/HomeFAQ';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import Hero from '@/components/landing/Hero';
import PillarsGrid from '@/components/landing/PillarsGrid';
import SocialProofTicker from '@/components/landing/SocialProofTicker';
import InnerCircleWaitlist from '@/components/landing/InnerCircleWaitlist';
import AIManifesto from '@/components/landing/AIManifesto';
import BlogCard from '@/components/blog/BlogCard';
import DailyPanchang from '@/components/landing/DailyPanchang';
import DailyRashifal from '@/components/landing/DailyRashifal';
import PricingSection from '@/components/landing/PricingSection';
import LiveTrustBar from '@/components/landing/LiveTrustBar';
import KundaliMilanTeaser from '@/components/landing/KundaliMilanTeaser';
import HomeClient from './HomeClient';
import { blogPosts } from '@/lib/blog-data';

// ─────────────────────────────────────────────────────────────
// PAGE-SPECIFIC METADATA — overrides layout.tsx v2.7 defaults
// v11.0: Updated description to include Kundali Milan keyword
//        for early SEO indexing window before product launches.
// ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Trikal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
  description:
    "Get your free AI kundli, Kundali Milan & accurate Vedic astrology predictions. Personalised readings for career, wealth, marriage, health & legal matters by Rohiit Gupta, Chief Vedic Architect (Delhi NCR). Powered by Swiss Ephemeris. Voice & text readings from ₹11.",
  alternates: {
    canonical: 'https://trikalvaani.com/',
    languages: {
      'en-IN': 'https://trikalvaani.com/',
      'hi-IN': 'https://trikalvaani.com/hi',
    },
  },
  openGraph: {
    title: 'Trikal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
    description:
      "Free AI kundli, Kundali Milan & accurate Vedic astrology predictions. Personalised readings by Rohiit Gupta, Chief Vedic Architect. Voice & text from ₹11.",
    url: 'https://trikalvaani.com/',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikal Vaani',
    images: [
      {
        url: 'https://trikalvaani.com/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Trikal Vaani — Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trikal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
    description:
      'Free AI kundli, Kundali Milan & accurate Vedic astrology predictions. Voice & text readings from ₹11.',
    images: ['https://trikalvaani.com/og-default.jpg'],
  },
};

export default function HomePage() {
  const latestPosts = blogPosts.slice(0, 3);

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

          {/* ── 3. KUNDALI MILAN TEASER — NEW ──────────────────────────────
              🔒 EARNING LOCKED (IR-12)
              Day 1 ships "Launching Soon" placeholder with email capture
              to Supabase milan_waitlist table. Pre-launch waitlist building
              for Day 8 (Kundali Milan goes LIVE).
              SEO/GEO indexing window opens immediately so Google starts
              crawling Kundali Milan content before the product is live. */}
          <KundaliMilanTeaser />

          {/* ═══════════════════════════════════════════════════════════════
              TRUST + COMMERCIAL TIER — slots #4 to #6
              Reinforce trust signals immediately after earning surfaces.
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 4. LIVE TRUST BAR ──────────────────────────────────────── */}
          <LiveTrustBar />

          {/* ── 5. PRICING SECTION ─────────────────────────────────────────
              Moved up from slot #10. After someone sees Mahakaal form +
              Kundali Milan teaser, they want to know the full price ladder. */}
          <PricingSection />

          {/* ── 6. SOCIAL PROOF TICKER ─────────────────────────────────── */}
          <SocialProofTicker />

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

          {/* ── 11. HOMEPAGE GEO — moved from slot #2 ──────────────────────
              56-word direct answer + Tier 1 FAQ + author E-E-A-T + local SEO.
              CEO DECISION (May 19 2026): "Human will not read HomepageGEO,
              it's only for SEO/GEO/AEO/E-E-A-T — shift below earning sections."
              Crawlers extract this content regardless of DOM position. */}
          <HomepageGEO />

          {/* ── 12. HOME FAQ v2.0 — TIER 2 DEEP TECHNICAL FAQ ──────────────
              Unique schema @id="#homefaq-deep" — no collision with Tier 1.
              Covers Sade Sati, Manglik Dosha, Pratyantar Dasha, Dhana Yoga. */}
          <HomeFAQ />

          {/* ── 13. INNER CIRCLE WAITLIST ──────────────────────────────── */}
          <InnerCircleWaitlist />

          {/* ── 14. BLOG SECTION ───────────────────────────────────────── */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs font-medium tracking-widest uppercase text-yellow-400/60 mb-4">
                  Vedic Knowledge Base
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                  Latest from the{' '}
                  <span className="text-gradient-gold">Trikal Blog</span>
                </h2>
                <p className="text-slate-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">
                  Deep dives into Gochar transits, Kundali analysis, and the timeless
                  science of Jyotish — written for the modern seeker.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {latestPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
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
// END — app/page.tsx v11.0
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// CEO LOCKED: TIERED LAYOUT — earning sections above mobile fold
// ============================================================================
