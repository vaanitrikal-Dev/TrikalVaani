// ============================================================
// File: app/calculators/free-graha-bal-calculator/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Graha Bal Calculator — Find Your Strongest Planet (Shadbala) | Trikaal Vaani',
  description:
    'Free Graha Bal Calculator powered by Swiss Ephemeris. Find your strongest & weakest planet with full Shadbala 6-fold breakdown (Sthana, Dig, Kala, Cheshta, Naisargika, Drik Bal), strength ranking & 3 free remedies. By Rohiit Gupta.',
  keywords: [
    'graha bal calculator',
    'planet strength calculator',
    'strongest planet in kundali',
    'graha shakti',
    'which planet is strong in my horoscope',
    'shadbala calculator',
    'shadbala breakdown',
    'graha bal',
    'planet bala calculator',
    'sthana dig kala bala',
    'vedic planet strength',
    'graha strength ranking',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-graha-bal-calculator' },
  openGraph: {
    title: 'Free Graha Bal Calculator — Strongest & Weakest Planet (Shadbala)',
    description: 'Full Shadbala 6-fold breakdown, planet strength ranking & free remedies — instant.',
    url: 'https://trikalvaani.com/calculators/free-graha-bal-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Graha Bal Calculator | Trikaal Vaani',
    description: 'Find your strongest & weakest planet with full Shadbala breakdown — free.',
  },
  robots: { index: true, follow: true },
};

export default function GrahaBalCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
