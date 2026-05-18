'use client';
/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/HomeClient.tsx
 * Version:     v1.0 — NEW FILE (Client island for category selection state)
 * Date:        2026-05-18
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com
 *
 * PURPOSE:
 *   This is the ONLY 'use client' component on the homepage now.
 *   It wraps DardEngineShowcase + BirthForm together so they can share
 *   the `selectedCategory` useState — exactly as before in page.tsx v9.3.
 *
 * WHY THIS FILE EXISTS:
 *   Previous page.tsx v9.3 was entirely 'use client' to support useState.
 *   That meant ALL homepage content was client-rendered → bad for SEO/GEO.
 *
 *   New architecture (v10.0):
 *     - app/page.tsx = SERVER component (schemas + content in initial HTML)
 *     - app/HomeClient.tsx = CLIENT island (just the interactive piece)
 *
 *   AI crawlers (Perplexity, SGE, ChatGPT) and Googlebot now see the full
 *   page in initial HTML response. State-based interaction still works.
 *
 * LOGIC PRESERVED — 100% IDENTICAL TO v9.3:
 *   - useState<SelectedCategory>
 *   - handleSelectCategory callback
 *   - smooth scroll to #birth-form on category click
 *   - selectedCategory prop passed to both children
 * ============================================================================
 */

import { useState, useCallback } from 'react';
import DardEngineShowcase from '@/components/landing/DardEngineShowcase';
import BirthForm from '@/components/landing/BirthForm';

export type SelectedCategory = {
  id: string;
  label: string;
  color: string;
} | null;

export default function HomeClient() {
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
      <DardEngineShowcase
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />
      <BirthForm selectedCategory={selectedCategory} />
    </>
  );
}

// ============================================================================
// END — app/HomeClient.tsx v1.0
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
