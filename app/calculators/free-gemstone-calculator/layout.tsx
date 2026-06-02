// ============================================================
// File: app/calculators/free-gemstone-calculator/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Gemstone Calculator — Your Lucky Ratna by Date of Birth | Trikaal Vaani',
  description:
    'Free Gemstone (Ratna) Calculator powered by Swiss Ephemeris. Find your lucky life gemstone from your ascendant lord, plus the mahadasha stone — with metal, finger, day, mantra and safety caution. By Rohiit Gupta.',
  keywords: [
    'gemstone calculator',
    'lucky gemstone by date of birth',
    'ratna calculator',
    'which gemstone should i wear',
    'life stone astrology',
    'lagna gemstone',
    'gemstone by ascendant',
    'yellow sapphire pukhraj',
    'blue sapphire neelam',
    'navagraha gemstone',
    'gemstone recommendation vedic',
    'birthstone by kundali',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-gemstone-calculator' },
  openGraph: {
    title: 'Free Gemstone Calculator — Your Lucky Ratna by Date of Birth',
    description: 'Find your life gemstone by ascendant lord + how to wear it (metal, finger, day, mantra). Free.',
    url: 'https://trikalvaani.com/calculators/free-gemstone-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Gemstone Calculator | Trikaal Vaani',
    description: 'Find your lucky gemstone (ratna) by date of birth — free, with wearing method.',
  },
  robots: { index: true, follow: true },
};

export default function GemstoneCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
