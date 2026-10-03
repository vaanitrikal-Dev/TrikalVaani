// ============================================================
// File: app/calculators/free-dasha-calculator/layout.tsx
// Version: v2.3 — metadata only, clean passthrough (3 Oct 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.3 (2026-10-03) — title + meta description rewritten for CTR
//        (Google title standard: keyword first, 50-58 chars; meta 140-155).
//        Old title: "Free Dasha Calculator — Vimshottari Mahadasha".
//   v2.2 (2026-06-02) — Brand fix: visible brand normalised to the
//        double-a spelling in page <title> and openGraph siteName.
//        No other change.
//   v2.1 — metadata only, clean passthrough.
// ============================================================
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: {
  absolute: 'Vimshottari Dasha Calculator — Free Mahadasha in 60 Sec',
},
  description:
    "Free Vimshottari Dasha calculator: current Mahadasha, Antardasha and Pratyantar with exact dates, next 5 dashas and safe remedies. Check yours now.",
  keywords: [
    'dasha calculator', 'free dasha calculator', 'vimshottari dasha calculator',
    'mahadasha calculator', 'antardasha calculator', 'current dasha calculator',
    'dasha periods online', 'mahadasha by date of birth', 'vedic dasha calculation',
    'planetary period calculator', 'vimshottari mahadasha online', 'dasha bhukti calculator',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-dasha-calculator' },
  openGraph: {
    title: 'Free Dasha Calculator — Vimshottari Mahadasha & Antardasha Online',
    description: 'Accurate Mahadasha, Antardasha, next 5 dasha periods, Parashar Dos/Donts & 3 free remedies.',
    url: 'https://trikalvaani.com/calculators/free-dasha-calculator',
    type: 'website', siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Dasha Calculator — Vimshottari Online',
    description: 'Free Vimshottari Dasha calculator with Mahadasha, Antardasha & Parashar remedies.',
  },
  robots: { index: true, follow: true },
};
export default function DashaCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
