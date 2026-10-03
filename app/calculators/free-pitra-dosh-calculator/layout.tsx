// ============================================================
// File: app/calculators/free-pitra-dosh-calculator/layout.tsx
// Version: v1.1 (03 Oct 2026) — metadata only. Previous: v1.0 — metadata only
//   v1.1 (2026-10-03) — title + description rewritten for CTR (keyword first, 50-58 / 140-155).
//        Old title: "Free Pitra Dosh Calculator — Causes & Upay".
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Pitra Dosh Calculator — Free Check, Lakshan & Upay' },
  description:
    "Free Pitra Dosh calculator: checks Sun and 9th house affliction by Rahu, Ketu or Saturn, shows severity, and gives simple tarpan remedies. Check now.",
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
