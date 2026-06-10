'use client';

// ============================================================
// FILE: components/landing/StickyMobileCTA.tsx
// VERSION: v1.0 — Phase 2 UX fix (Claude audit June 2026)
// PURPOSE: Mobile-only sticky bottom CTA bar.
//   - Shows only on mobile (sm:hidden) — desktop unaffected
//   - Hides automatically when hero #birth-form is visible
//     (user already sees the CTA — no need to show bar)
//   - Positioned bottom-left to avoid TrikalVoice (bottom-right)
//   - Gold gradient, Trikaal Vaani brand, ₹0 free hook
//   - Dismissible with X — respects user intent
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (typeof window !== 'undefined') {
      const d = sessionStorage.getItem('trikal-sticky-dismissed');
      if (d) { setDismissed(true); return; }
    }

    // IntersectionObserver — hide when birth-form is visible
    const target = document.querySelector('#birth-form');
    if (!target) {
      // No birth form on this page — show after scroll
      const onScroll = () => setVisible(window.scrollY > 300);
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show bar when birth-form is NOT visible
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(target);

    // Also show after 300px scroll on initial load
    const onScroll = () => {
      if (window.scrollY > 300) setVisible(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true, once: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem('trikal-sticky-dismissed', '1');
  }

  if (dismissed || !visible) return null;

  return (
    // sm:hidden — desktop pe bilkul nahi dikhega
    // bottom-4 left-4 — left side, TrikalVoice right side pe hai
    <div
      className="sm:hidden fixed bottom-6 left-4 z-40 flex items-center gap-2"
      style={{ maxWidth: 'calc(100vw - 80px)' }} // right mein TrikalVoice ke liye 80px space
    >
      <Link
        href="/#birth-form"
        className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all duration-200 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${GOLD} 0%, #A8862A 100%)`,
          color: '#080B12',
          boxShadow: `0 4px 24px ${GOLD_RGBA(0.45)}, 0 0 0 1px ${GOLD_RGBA(0.3)}`,
        }}
      >
        <span className="text-base leading-none">🔮</span>
        <span className="leading-tight">
          Free Kundali Dekho
          <span className="block text-xs font-medium opacity-75">Swiss Ephemeris · ₹0</span>
        </span>
      </Link>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
        style={{
          background: 'rgba(6,10,24,0.85)',
          border: `1px solid ${GOLD_RGBA(0.25)}`,
          color: GOLD_RGBA(0.7),
        }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
