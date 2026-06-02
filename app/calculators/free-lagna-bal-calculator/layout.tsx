// ============================================================
// File: app/calculators/free-lagna-bal-calculator/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Lagna Bal Calculator — Ascendant & Lagna Lord Strength | Trikaal Vaani',
  description:
    'Free Lagna Bal Calculator powered by Swiss Ephemeris + Shadbala. Find your lagna (ascendant), lagna lord, its house placement & strength, 1st-house planets and 3 free remedies. By Rohiit Gupta.',
  keywords: [
    'lagna bal calculator',
    'ascendant strength',
    'lagna lord calculator',
    'rising sign strength',
    'lagna shakti',
    'lagna lord strength',
    'ascendant lord calculator',
    'my lagna calculator',
    'lagna bala',
    'lagna lord house',
    'personality strength astrology',
    'vedic ascendant calculator',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-lagna-bal-calculator' },
  openGraph: {
    title: 'Free Lagna Bal Calculator — Ascendant & Lagna Lord Strength',
    description: 'Find your lagna, lagna lord, its house & strength + 1st-house planets and free remedies.',
    url: 'https://trikalvaani.com/calculators/free-lagna-bal-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Lagna Bal Calculator | Trikaal Vaani',
    description: 'Ascendant & lagna lord strength with free remedies — Vedic calculator.',
  },
  robots: { index: true, follow: true },
};

export default function LagnaBalCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
