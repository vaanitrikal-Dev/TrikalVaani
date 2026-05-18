// ============================================================
// File: app/calculators/free-lagna-calculator/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: {
    absolute: 'Free Lagna Calculator — Find Your Ascendant (Rising Sign) Online | Trikal Vaani',
  },
  description:
    'Free Lagna Calculator powered by Swiss Ephemeris. Discover your Ascendant (Lagna Rashi), Lagna lord, body type, personality, element & 3 Parashar remedies instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'lagna calculator',
    'free lagna calculator',
    'ascendant calculator',
    'rising sign calculator',
    'lagna by date of birth',
    'my lagna',
    'janam lagna calculator',
    'vedic ascendant',
    'lagna rashi calculator',
    'ascendant by birth time',
    '12 lagna',
    'lagna chart calculator',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-lagna-calculator' },
  openGraph: {
    title: 'Free Lagna Calculator — Find Your Ascendant (Rising Sign) Online',
    description: 'Find your Lagna (Ascendant), lord planet, body type, personality & 3 Parashar remedies — free.',
    url: 'https://trikalvaani.com/calculators/free-lagna-calculator',
    type: 'website',
    siteName: 'Trikal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Lagna Calculator — Ascendant Online',
    description: 'Free Lagna finder with personality, body type & Parashar remedies.',
  },
  robots: { index: true, follow: true },
};
export default function LagnaCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
