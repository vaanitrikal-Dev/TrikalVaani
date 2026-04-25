'use client';

// @trikal-v9.0 — cache-bust: 2026-04-18T00:00:00Z
import { useState, useCallback } from 'react';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import Hero from '@/components/landing/Hero';
import BirthForm from '@/components/landing/BirthForm';
import DardEngineShowcase from '@/components/landing/DardEngineShowcase';
import BlogCard from '@/components/blog/BlogCard';
import { blogPosts } from '@/lib/blog-data';

// ── TEMPORARILY COMMENTED OUT — finding broken component ──
// import PillarsGrid from '@/components/landing/PillarsGrid';
// import SocialProofTicker from '@/components/landing/SocialProofTicker';
// import InnerCircleWaitlist from '@/components/landing/InnerCircleWaitlist';
// import AIManifesto from '@/components/landing/AIManifesto';
// import DailyPanchang from '@/components/landing/DailyPanchang';
// import DailyRashifal from '@/components/landing/DailyRashifal';
// import PricingSection from '@/components/landing/PricingSection';
// import LiveTrustBar from '@/components/landing/LiveTrustBar';

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
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />

      <main>
        {/* 1. Hero */}
        <Hero />

        {/* 2. Live Trust Bar + Social Proof — COMMENTED OUT */}
        {/* <LiveTrustBar /> */}
        {/* <SocialProofTicker /> */}

        {/* 3. Dard Engine */}
        <DardEngineShowcase
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* 4. Birth Form */}
        <BirthForm selectedCategory={selectedCategory} />

        {/* 5. Daily Panchang — COMMENTED OUT */}
        {/* <DailyPanchang /> */}

        {/* 6. Daily Rashifal — COMMENTED OUT */}
        {/* <DailyRashifal /> */}

        {/* 7. Life Pillars — COMMENTED OUT */}
        {/* <PillarsGrid /> */}

        {/* 8. AI Manifesto — COMMENTED OUT */}
        {/* <AIManifesto /> */}

        {/* 9. Pricing Section — COMMENTED OUT */}
        {/* <PricingSection /> */}

        {/* 10. Inner Circle Waitlist — COMMENTED OUT */}
        {/* <InnerCircleWaitlist /> */}

        {/* 11. Blog */}
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}