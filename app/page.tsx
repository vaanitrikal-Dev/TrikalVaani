// 🔱 TRIKAL VAANI | app/page.tsx | v10.0
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-05-18
// ============================================================================
// MAJOR ARCHITECTURE CHANGE vs v9.3:
//   ❌ REMOVED: 'use client' directive
//      → Homepage is now a SERVER COMPONENT
//      → All schemas + GEO content render in initial HTML
//      → Googlebot, Perplexity, SGE, ChatGPT crawlers see EVERYTHING instantly
//   ❌ REMOVED: useState + handleSelectCategory (moved to app/HomeClient.tsx)
//   ❌ REMOVED: <HomeFAQ /> import & render in old position
//      → HomeFAQ v2.0 is now repositioned as DEEP FAQ tier (kept, not killed)
//   ✅ ADDED: export const metadata — page-specific SEO override
//      → Overrides layout.tsx v2.7 default with even stronger homepage title
//   ✅ ADDED: <HomeClient /> import — the ONLY client island on this page
//   ✅ MOVED: <HomepageGEO /> from middle-of-page to RIGHT AFTER <Hero />
//      → 56-word direct answer block now in first viewport
//      → AI crawlers extract brand framing immediately
//   ✅ KEPT: <HomeFAQ /> as TIER 2 deep FAQ (positioned after Tier 1 HomepageGEO FAQ)
//
// PAGE FLOW (top to bottom):
//   1. Hero                    (H1 + visual hook)
//   2. HomepageGEO             (GEO direct answer + Tier 1 FAQ + E-E-A-T + local SEO)
//   3. LiveTrustBar            (social proof)
//   4. SocialProofTicker       (live ticker)
//   5. HomeClient              (DardEngine + BirthForm — client island)
//   6. DailyPanchang
//   7. DailyRashifal
//   8. PillarsGrid
//   9. AIManifesto
//   10. PricingSection
//   11. HomeFAQ v2.0           (Tier 2 deep technical FAQ)
//   12. InnerCircleWaitlist
//   13. Blog section
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
import HomeClient from './HomeClient';
import { blogPosts } from '@/lib/blog-data';

// ─────────────────────────────────────────────────────────────
// PAGE-SPECIFIC METADATA — overrides layout.tsx v2.7 defaults
// Homepage is the most important page; deserves its own optimized SEO.
// ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Trikal Vaani | Free Kundli & Accurate AI Vedic Astrology',
  description:
    "Get your free AI kundli & accurate Vedic astrology predictions instantly. Personalised readings for career, wealth, marriage, health & legal matters by Rohiit Gupta, Chief Vedic Architect (Delhi NCR). Powered by Swiss Ephemeris. Voice & text readings from ₹11.",
  alternates: {
    canonical: 'https://trikalvaani.com/',
    languages: {
      'en-IN': 'https://trikalvaani.com/',
      'hi-IN': 'https://trikalvaani.com/hi',
    },
  },
  openGraph: {
    title: 'Trikal Vaani | Free Kundli & Accurate AI Vedic Astrology',
    description:
      "Free AI kundli & accurate Vedic astrology predictions. Personalised readings by Rohiit Gupta, Chief Vedic Architect. Voice & text from ₹11.",
    url: 'https://trikalvaani.com/',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikal Vaani',
    images: [
      {
        url: 'https://trikalvaani.com/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Trikal Vaani — Free Kundli & Accurate AI Vedic Astrology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trikal Vaani | Free Kundli & Accurate AI Vedic Astrology',
    description:
      'Free AI kundli & accurate Vedic astrology predictions. Voice & text readings from ₹11.',
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

          {/* ── 1. HERO ─────────────────────────────────────────────────── */}
          <Hero />

          {/* ── 2. HOMEPAGE GEO — moved to ABOVE-THE-FOLD ─────────────────
              Critical: 56-word direct answer + E-E-A-T author + visible FAQ
              must hit AI crawlers in the first viewport for brand citation. */}
          <HomepageGEO />

          {/* ── 3. LIVE TRUST BAR ───────────────────────────────────────── */}
          <LiveTrustBar />

          {/* ── 4. SOCIAL PROOF TICKER ──────────────────────────────────── */}
          <SocialProofTicker />

          {/* ── 5. CLIENT ISLAND — DardEngine + BirthForm with shared state
              This is the ONLY client component on the homepage.
              Holds useState<SelectedCategory> and handleSelectCategory. */}
          <HomeClient />

          {/* ── 6. DAILY PANCHANG ───────────────────────────────────────── */}
          <DailyPanchang />

          {/* ── 7. DAILY RASHIFAL ───────────────────────────────────────── */}
          <DailyRashifal />

          {/* ── 8. PILLARS GRID ─────────────────────────────────────────── */}
          <PillarsGrid />

          {/* ── 9. AI MANIFESTO ─────────────────────────────────────────── */}
          <AIManifesto />

          {/* ── 10. PRICING SECTION ─────────────────────────────────────── */}
          <PricingSection />

          {/* ── 11. HOME FAQ v2.0 — TIER 2 DEEP TECHNICAL FAQ ────────────
              Different from Tier 1 FAQ inside HomepageGEO.
              Unique schema @id="#homefaq-deep" — no collision.
              Covers Sade Sati, Manglik Dosha, Pratyantar Dasha, Dhana Yoga. */}
          <HomeFAQ />

          {/* ── 12. INNER CIRCLE WAITLIST ───────────────────────────────── */}
          <InnerCircleWaitlist />

          {/* ── 13. BLOG SECTION ────────────────────────────────────────── */}
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
// END — app/page.tsx v10.0
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
