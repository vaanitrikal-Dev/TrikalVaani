// ============================================================
// File: app/calculators/free-kundali-strength-calculator/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Kundali Strength Calculator — Overall Horoscope Score | Trikaal Vaani',
  description:
    'Free Kundali Strength Calculator powered by Swiss Ephemeris + Shadbala. Get your overall horoscope score (0-100%), grade, planet-wise strength ranking, lagna & dasha strength and 3 free remedies. By Rohiit Gupta.',
  keywords: [
    'kundali strength calculator',
    'horoscope strength score',
    'kundali score',
    'chart strength astrology',
    'strong kundali check',
    'kundli strength',
    'how strong is my kundali',
    'shadbala score',
    'lagna strength',
    'dasha strength',
    'overall horoscope score',
    'kundali power score',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-kundali-strength-calculator' },
  openGraph: {
    title: 'Free Kundali Strength Calculator — Overall Horoscope Score',
    description: 'Overall Kundali score (0-100%), grade, planet ranking, lagna & dasha strength + free remedies.',
    url: 'https://trikalvaani.com/calculators/free-kundali-strength-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Kundali Strength Calculator | Trikaal Vaani',
    description: 'How strong is your kundali? Overall Shadbala score + free remedies.',
  },
  robots: { index: true, follow: true },
};

export default function KundaliStrengthCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
