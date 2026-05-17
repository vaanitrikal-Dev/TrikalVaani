// ============================================================
// File: app/calculators/free-nakshatra-calculator/layout.tsx
// Version: v2.1 — metadata only, clean passthrough
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Nakshatra Calculator — Find Your Janma Nakshatra Online | Trikal Vaani',
  description:
    'Free Nakshatra Calculator powered by Swiss Ephemeris. Discover your Janma Nakshatra, Pada, ruling planet, deity, gana, yoni, nadi & 3 Parashar remedies instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'nakshatra calculator', 'free nakshatra calculator', 'janma nakshatra calculator',
    'birth star calculator', 'nakshatra finder', 'nakshatra by date of birth',
    'my nakshatra', '27 nakshatras', 'nakshatra pada calculator',
    'nakshatra lord calculator', 'vedic nakshatra online', 'janam nakshatra free',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-nakshatra-calculator' },
  openGraph: {
    title: 'Free Nakshatra Calculator — Find Your Janma Nakshatra Online',
    description: 'Find your Janma Nakshatra, Pada, lord, deity, gana, yoni, nadi & 3 Parashar remedies — free.',
    url: 'https://trikalvaani.com/calculators/free-nakshatra-calculator',
    type: 'website', siteName: 'Trikal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Nakshatra Calculator — Janma Nakshatra Online',
    description: 'Free Nakshatra finder with Pada, lord, deity & Parashar remedies.',
  },
  robots: { index: true, follow: true },
};

export default function NakshatraCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
