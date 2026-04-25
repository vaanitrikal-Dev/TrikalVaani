'use client';

import { useState, useCallback } from 'react';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import Hero from '@/components/landing/Hero';
import DardEngineShowcase from '@/components/landing/DardEngineShowcase';
import { blogPosts } from '@/lib/blog-data';

// ── STILL COMMENTED OUT ──
// import BirthForm from '@/components/landing/BirthForm';
// import BlogCard from '@/components/blog/BlogCard';

export type SelectedCategory = {
  id: string;
  label: string;
  color: string;
} | null;

export default function HomePage() {
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
        <DardEngineShowcase
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
        <p className="text-white text-center py-10">Testing DardEngineShowcase...</p>
      </main>
      <SiteFooter />
    </div>
  );
}