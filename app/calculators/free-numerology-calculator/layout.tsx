// ============================================================
// File: app/calculators/free-numerology-calculator/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Numerology Calculator — Mulank, Bhagyank & Lucky Number by Date of Birth | Trikaal Vaani',
  description:
    'Free Numerology Calculator. Find your Mulank (root number), Bhagyank (destiny number) & Naamank from your date of birth and name — with ruling planet, lucky numbers, lucky colors & lucky days. By Rohiit Gupta.',
  keywords: [
    'numerology calculator',
    'lucky number by date of birth',
    'mulank calculator',
    'bhagyank calculator',
    'mulank bhagyank',
    'numerology by date of birth',
    'lucky number calculator',
    'destiny number calculator',
    'root number numerology',
    'naamank calculator',
    'name number numerology',
    'free numerology',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-numerology-calculator' },
  openGraph: {
    title: 'Free Numerology Calculator — Mulank, Bhagyank & Lucky Number',
    description: 'Mulank, Bhagyank & Naamank with ruling planet, lucky number, color & day — free, instant.',
    url: 'https://trikalvaani.com/calculators/free-numerology-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Numerology Calculator | Trikaal Vaani',
    description: 'Find your Mulank, Bhagyank & lucky number by date of birth — free.',
  },
  robots: { index: true, follow: true },
};

export default function NumerologyCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
