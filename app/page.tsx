'use client';

// @trikal-v9.1 — cache-bust: 2026-04-18T00:00:00Z
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
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />
      <main>
        <Hero />
        <LiveTrustBar />
        <SocialProofTicker />
        <DardEngineShowcase
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
        <BirthForm selectedCategory={selectedCategory} />
        <DailyPanchang />
        <DailyRashifal />
        <PillarsGrid />
        <AIManifesto />
        <PricingSection />
        <InnerCircleWaitlist />
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
  );
}
