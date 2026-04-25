'use client';

import { useState, useCallback } from 'react';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import Hero from '@/components/landing/Hero';
import { blogPosts } from '@/lib/blog-data';

// ── COMMENTED OUT FOR DIAGNOSIS ──
// import BirthForm from '@/components/landing/BirthForm';
// import DardEngineShowcase from '@/components/landing/DardEngineShowcase';
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
  }, []);

  return (
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />
      <main>
        <Hero />
        <p className="text-white text-center py-10">Diagnosis mode — checking broken component</p>
      </main>
      <SiteFooter />
    </div>
  );
}