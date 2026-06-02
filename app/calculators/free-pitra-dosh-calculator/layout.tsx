// ============================================================
// File: app/calculators/free-pitra-dosh-calculator/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Pitra Dosh Calculator — Check, Causes & Remedies | Trikaal Vaani',
  description:
    'Free Pitra Dosh Calculator powered by Swiss Ephemeris. Check if you have Pitra Dosh (Sun / 9th house affliction by Rahu, Ketu or Saturn), its causes & signs, and free Pitru-Tarpan remedies. By Rohiit Gupta.',
  keywords: [
    'pitra dosh calculator',
    'pitru dosh calculator',
    'pitra dosh',
    'pitra dosh check',
    'do i have pitra dosh',
    'pitra dosh by date of birth',
    'pitra dosh remedies',
    'pitru paksha remedies',
    'pitra dosh nivaran',
    'ancestral dosha',
    'sun affliction kundali',
    'pitra dosh upay',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-pitra-dosh-calculator' },
  openGraph: {
    title: 'Free Pitra Dosh Calculator — Check, Causes & Remedies',
    description: 'Check Pitra Dosh from your birth chart + causes, signs & free Pitru-Tarpan remedies.',
    url: 'https://trikalvaani.com/calculators/free-pitra-dosh-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Pitra Dosh Calculator | Trikaal Vaani',
    description: 'Check Pitra Dosh accurately + causes, signs & free remedies.',
  },
  robots: { index: true, follow: true },
};

export default function PitraDoshCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
