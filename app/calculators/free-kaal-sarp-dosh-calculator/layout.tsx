// ============================================================
// File: app/calculators/free-kaal-sarp-dosh-calculator/layout.tsx
// Version: v1.1 (03 Oct 2026) — metadata only. Previous: v1.0 — metadata only
//   v1.1 (2026-10-03) — title + description rewritten for CTR (keyword first, 50-58 / 140-155).
//        Old title: "Free Kaal Sarp Dosh Calculator — Type & Upay".
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Kaal Sarp Dosh Calculator — Free Check, Type & Upay' },
  description:
    "Free Kaal Sarp Dosh calculator: checks all seven planets by exact degree and finds the type (Anant to Sheshnag) by Rahu's house, with safe home remedies.",
  keywords: [
    'kaal sarp dosh calculator',
    'kaal sarp dosh',
    'kalsarp dosh calculator',
    'kaal sarp yog',
    'do i have kaal sarp dosh',
    'kaal sarp dosh by date of birth',
    'kaal sarp types',
    'anant kaal sarp',
    'kaal sarp dosh remedies',
    'kaal sarp dosh check',
    'rahu ketu dosh',
    'kaal sarp nivaran',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-kaal-sarp-dosh-calculator' },
  openGraph: {
    title: 'Free Kaal Sarp Dosh Calculator — Check, Type & Remedies',
    description: 'Exact-longitude Kaal Sarp check, type (Anant–Sheshnag) & free Naag-puja remedies.',
    url: 'https://trikalvaani.com/calculators/free-kaal-sarp-dosh-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Kaal Sarp Dosh Calculator | Trikaal Vaani',
    description: 'Check Kaal Sarp Dosh accurately + type + free remedies.',
  },
  robots: { index: true, follow: true },
};

export default function KaalSarpDoshCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
