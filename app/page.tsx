// 🔱 TRIKAAL VAANI | app/page.tsx | v12.2
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-05-27
// ============================================================================
// CHANGE LOG (v12.1 → v12.2):
//
// ❌ REMOVED: InnerCircleWaitlist (was slot #11)
//    - Removed import:  import InnerCircleWaitlist from '@/components/landing/InnerCircleWaitlist';
//    - Removed render:  <InnerCircleWaitlist />
//    - Reason: CEO decision (May 27 2026) — static, non-working waitlist with
//      hardcoded fake scarcity (SPOTS_TAKEN = 8247) + "Live" badge. Pulled until
//      a real Supabase-backed waitlist count is wired. No fake scarcity on the
//      homepage — accuracy & trust is the brand promise.
//    - Blog section renumbered #12 -> #11.
//
// CHANGE LOG (v12.0 → v12.1):
//
// ❌ REMOVED: DailyRashifal (was slot #7)
//    - Removed import:  import DailyRashifal from '@/components/landing/DailyRashifal';
//    - Removed render:  <DailyRashifal />
//    - Reason: CEO decision (May 27 2026) — homepage rashifal showed the same
//      static predictions every day while claiming "Daily / Verified". Pulled
//      until a real Moon-transit (Gochar) rashifal engine is wired. Accuracy
//      is the brand promise — no fake "daily" content on the homepage.
//    - Following slots renumbered (#8->#7, ... #13->#12).
//
// 🧹 Removed "Delhi NCR" location credential from page metadata description
//    (online/worldwide positioning — no location credential).
//
// CHANGE LOG (v11.0 → v12.0):
//
// ❌ REMOVED: PricingSection (was slot #5)
//    - Removed import:  import PricingSection from '@/components/landing/PricingSection';
//    - Removed render:  <PricingSection />
//    - Reason: CEO decision (May 25 2026) — pricing section pulled from homepage.
//    - All following slots renumbered (#6->#5, #7->#6, ... #14->#13).
//
// NOTE: The "INAUGURAL OFFER: 100% FREE FOR 30 DAYS" banner is NOT in this
//       file. It lives inside a child component (likely Hero or PricingSection).
//       If it was inside PricingSection, it is now gone with this removal.
//       If it was inside Hero, it still needs separate removal in Hero.tsx.
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
import AIManifesto from '@/components/landing/AIManifesto';
import BlogCard from '@/components/blog/BlogCard';
import DailyPanchang from '@/components/landing/DailyPanchang';
import LiveTrustBar from '@/components/landing/LiveTrustBar';
import KundaliMilanTeaser from '@/components/landing/KundaliMilanTeaser';
import HomeClient from './HomeClient';
import { blogPosts } from '@/lib/blog-data';

// ─────────────────────────────────────────────────────────────
// PAGE-SPECIFIC METADATA — overrides layout.tsx v2.7 defaults
// ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Trikaal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
  description:
    "Get your free AI kundli, Kundali Milan & accurate Vedic astrology predictions. Personalised readings for career, wealth, marriage, health & legal matters by Rohiit Gupta, Chief Vedic Architect. Powered by Swiss Ephemeris. Voice & text readings from ₹11.",
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
};

export default function HomePage() {
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <>
      {/* ── SEO SCHEMAS — server-rendered into initial HTML ──────────────── */}
      <HomepageSchema />
      <SchemaScript />

      <div className="min-h-screen bg-[#080B12]">
        <SiteNav />
        <main>

          {/* ═══════════════════════════════════════════════════════════════
              EARNING TIER — slots #1 to #3 — TIERED LOCK (IR-12)
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 1. HERO ──────────────────────────────────────────────────── */}
          <Hero />

          {/* ── 2. HOMECLIENT — MAHAKAAL + DARD ENGINE — 🔒 EARNING LOCKED ── */}
          <HomeClient />

          {/* ── 3. KUNDALI MILAN TEASER — 🔒 EARNING LOCKED ───────────────── */}
          <KundaliMilanTeaser />

          {/* ═══════════════════════════════════════════════════════════════
              TRUST + ENGAGEMENT TIER
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 4. LIVE TRUST BAR ──────────────────────────────────────── */}
          <LiveTrustBar />

          {/* ── 5. SOCIAL PROOF TICKER ─────────────────────────────────── */}
          <SocialProofTicker />

          {/* ── 6. DAILY PANCHANG (real Swiss Ephemeris via /api/panchang/today) ── */}
          <DailyPanchang />

          {/* ── 7. PILLARS GRID — life domains ─────────────────────────── */}
          <PillarsGrid />

          {/* ── 8. AI MANIFESTO — brand philosophy ─────────────────────── */}
          <AIManifesto />

          {/* ═══════════════════════════════════════════════════════════════
              SEO/GEO/AEO/E-E-A-T TIER — crawler-facing, position-independent
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 9. HOMEPAGE GEO ────────────────────────────────────────── */}
          <HomepageGEO />

          {/* ── 10. HOME FAQ v2.0 — TIER 2 DEEP TECHNICAL FAQ ──────────── */}
          <HomeFAQ />

          {/* ── 11. BLOG SECTION ───────────────────────────────────────── */}
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
// END — app/page.tsx v12.2
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// CEO LOCKED: PricingSection removed (v12.0); DailyRashifal removed (v12.1);
//             InnerCircleWaitlist removed (v12.2).
// ============================================================================
