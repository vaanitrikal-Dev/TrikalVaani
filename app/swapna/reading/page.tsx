// 🔱 TRIKAAL VAANI | app/swapna/reading/page.tsx | v1.0
// Paid dream-reading checkout page. Hosts the isolated SwapnaReadingForm.
// Noindexed — it is a transactional step, not an SEO page.

import type { Metadata } from 'next';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import SwapnaReadingForm from './SwapnaReadingForm';

export const metadata: Metadata = {
  title: 'Your Personal Dream Reading — Trikaal Vaani',
  description: 'Unlock your ₹51 personal Vedic dream reading, read against your own birth chart and running dasha.',
  robots: { index: false, follow: false },
};

const C = { night: '#080B12', gold: '#D4AF37', goldSoft: 'rgba(212,175,55,0.55)', s4: '#94A3B8' };

export default function SwapnaReadingPage() {
  return (
    <div className="min-h-screen" style={{ background: C.night, color: '#fff' }}>
      <SiteNav />
      <main className="px-4 pt-14 pb-20">
        <div className="max-w-xl mx-auto text-center mb-9">
          <p className="text-[11px] font-bold uppercase mb-4" style={{ letterSpacing: '0.35em', color: C.goldSoft }}>
            ✦ Personal Dream Reading
          </p>
          <h1 className="font-serif font-medium leading-tight text-white" style={{ fontSize: 'clamp(1.8rem,4.8vw,2.8rem)' }}>
            Read your dream against your own stars
          </h1>
          <p className="mt-3 text-[1rem]" style={{ color: C.s4 }}>
            Your birth details stay private — used only to compute your chart and running dasha.
          </p>
        </div>
        <SwapnaReadingForm />
      </main>
      <SiteFooter />
    </div>
  );
}
