// ============================================================
// File: app/calculators/free-dasha-calculator/layout.tsx
// Version: v2.1 — metadata only, clean passthrough
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Dasha Calculator — Vimshottari Mahadasha & Antardasha Online | Trikal Vaani',
  description:
    'Free Dasha Calculator powered by Swiss Ephemeris. Get accurate Vimshottari Mahadasha, Antardasha, next 5 dasha periods, Parashar Dos/Donts & 3 remedies instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'dasha calculator', 'free dasha calculator', 'vimshottari dasha calculator',
    'mahadasha calculator', 'antardasha calculator', 'current dasha calculator',
    'dasha periods online', 'mahadasha by date of birth', 'vedic dasha calculation',
    'planetary period calculator', 'vimshottari mahadasha online', 'dasha bhukti calculator',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-dasha-calculator' },
  openGraph: {
    title: 'Free Dasha Calculator — Vimshottari Mahadasha & Antardasha Online',
    description: 'Accurate Mahadasha, Antardasha, next 5 dasha periods, Parashar Dos/Donts & 3 free remedies.',
    url: 'https://trikalvaani.com/calculators/free-dasha-calculator',
    type: 'website', siteName: 'Trikal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Dasha Calculator — Vimshottari Online',
    description: 'Free Vimshottari Dasha calculator with Mahadasha, Antardasha & Parashar remedies.',
  },
  robots: { index: true, follow: true },
};

export default function DashaCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
