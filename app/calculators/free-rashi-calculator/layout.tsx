// ============================================================
// File: app/calculators/free-rashi-calculator/layout.tsx
// Version: v1.1 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.1 (2026-06-02) — Brand fix: visible brand normalised to the
//        double-a spelling in page <title> and openGraph siteName.
//        No other change.
//   v1.0 — metadata only.
// ============================================================
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Free Rashi Calculator — Find Your Moon Sign (Chandra Rashi) Online | Trikaal Vaani',
  description:
    'Free Rashi Calculator powered by Swiss Ephemeris. Discover your Chandra Rashi (Moon Sign), ruling planet, element, favorable colors, days & 3 Parashar remedies instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'rashi calculator',
    'free rashi calculator',
    'chandra rashi calculator',
    'moon sign calculator',
    'moon sign by date of birth',
    'my rashi',
    'vedic moon sign',
    'rashi finder',
    'janam rashi calculator',
    'chandra rashi by date of birth',
    '12 rashi',
    'rashi from birth date',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-rashi-calculator' },
  openGraph: {
    title: 'Free Rashi Calculator — Find Your Moon Sign (Chandra Rashi) Online',
    description: 'Find your Chandra Rashi, ruling planet, element, favorable colors, days & 3 Parashar remedies — free.',
    url: 'https://trikalvaani.com/calculators/free-rashi-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Rashi Calculator — Chandra Rashi Online',
    description: 'Free Moon Sign finder with traits, colors & Parashar remedies.',
  },
  robots: { index: true, follow: true },
};
export default function RashiCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
