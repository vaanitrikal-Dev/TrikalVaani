'use client';
// @trikal-v9.3 — cache-bust: 2026-05-09T12:00:00Z
// 🔱 TRIKAL VAANI | app/page.tsx | v9.3
// Owner: Rohiit Gupta, Chief Vedic Architect
// Changes from v9.2:
//   - Mounted <HomepageSchema /> — activates Person, WebApp, FAQPage, HowTo, BreadcrumbList, OfferCatalog schemas
//   - Mounted <HomepageGEO /> — activates GEO direct answer block, E-E-A-T author strip,
//     internal link hub (8 services + 15 pillars), visible FAQ, Local SEO block
//   - Position: HomepageSchema at top (before SchemaScript), HomepageGEO after BirthForm
// LOCKED: gemini-prompt.ts, verifiedTier — NOT TOUCHED

import HomepageSchema from '@/components/seo/HomepageSchema';
import HomepageGEO from '@/components/seo/HomepageGEO';
import SchemaScript from '../components/SchemaScript';
import HomeFAQ from '../components/HomeFAQ';
import { useState, useCallback } from 'react';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import Hero from '@/components/landing/Hero';
import PillarsGrid from '@/components/landing/PillarsGrid';
import BirthForm from '@/components/landing/BirthForm';
import SocialProofTicker from '@/components/landing/SocialProofTicker';
import InnerCircleWaitlist from '@/components/landing/InnerCircleWaitlist';
import AIManifesto from '@/components/landing/AIManifesto';
import BlogCard from '@/components/blog/BlogCard';
import DardEngineShowcase from '@/components/landing/DardEngineShowcase';
import DailyPanchang from '@/components/landing/DailyPanchang';
import DailyRashifal from '@/components/landing/DailyRashifal';
import PricingSection from '@/components/landing/PricingSection';
import LiveTrustBar from '@/components/landing/LiveTrustBar';
import { blogPosts } from '@/lib/blog-data';

export type SelectedCategory = {
  id: string;
  label: string;
  color: string;
} | null;

export default function HomePage() {
  const latestPosts = blogPosts.slice(0, 3);
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>(null);

  const handleSelectCategory = useCallback((cat: SelectedCategory) => {
    setSelectedCategory(cat);
    setTimeout(() => {
      const el = document.getElementById('birth-form');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, []);

  return (
    <>
      {/* ── SEO SCHEMAS (invisible, inject into <head>) ──────────────────────
          HomepageSchema: Person (Rohiit ji E-E-A-T) + WebApplication +
          FAQPage + HowTo + BreadcrumbList + OfferCatalog — 6 schemas
          SchemaScript: your existing 7 homepage schemas (Phase C)
          Combined = 13 schema blocks total on homepage
      ──────────────────────────────────────────────────────────────────── */}
      <HomepageSchema />
      <SchemaScript />

      <div className="min-h-screen bg-[#080B12]">
        <SiteNav />
        <main>

          {/* ── EXISTING SECTIONS — 100% UNTOUCHED ─────────────────────── */}
          <Hero />
          <LiveTrustBar />
          <SocialProofTicker />
          <DardEngineShowcase
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
          <BirthForm selectedCategory={selectedCategory} />

          {/* ── GEO CONTENT BLOCK ──────────────────────────────────────────
              HomepageGEO adds (in order):
              1. 56-word direct answer block → Perplexity/SGE/ChatGPT extraction
              2. E-E-A-T author strip (Rohiit ji) → YMYL trust signal
              3. Internal link hub → 8 services + 15 pillars + 10 city pages
              4. Visible FAQ (8 Q&As) → Featured snippets + AI Overview
              5. Local SEO block → "Astrologer in Delhi/Noida/Gurgaon"
              Position: after BirthForm, before DailyPanchang
          ──────────────────────────────────────────────────────────────── */}
          <HomepageGEO />

          {/* ── EXISTING SECTIONS — 100% UNTOUCHED ─────────────────────── */}
          <DailyPanchang />
          <DailyRashifal />
          <PillarsGrid />
          <AIManifesto />
          <PricingSection />
          <InnerCircleWaitlist />
          <HomeFAQ />

          {/* ── BLOG SECTION — 100% UNTOUCHED ──────────────────────────── */}
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
