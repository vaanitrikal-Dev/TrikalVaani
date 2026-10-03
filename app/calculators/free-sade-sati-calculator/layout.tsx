// ============================================================
// File: app/calculators/free-sade-sati-calculator/layout.tsx
// Version: v1.2 — metadata only (3 Oct 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.2 (2026-10-03) — title + meta description rewritten for CTR
//        (Google title standard: keyword first, 50-58 chars; meta 140-155).
//        Old title: "Free Sade Sati Calculator — Saturn 7.5 Year Check".
//   v1.1 (2026-06-02) — Brand fix: visible brand normalised to the
//        double-a spelling in page <title> and openGraph siteName.
//        No other change.
//   v1.0 — metadata only.
// ============================================================
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: { absolute: 'Sade Sati Calculator by Date of Birth — Free & Instant' },
  description:
    "Sade Sati calculator by date of birth: Yes/No, current phase, exact start-end dates and days left \u2014 Swiss Ephemeris. Free, no signup. Check now.",
  keywords: [
    'sade sati calculator',
    'free sade sati calculator',
    'shani sade sati calculator',
    'sade sati check',
    'sade sati by date of birth',
    'am i in sade sati',
    'saturn 7.5 years',
    'sade sati phase calculator',
    'sade sati end date',
    'sade sati remedies',
    'shani dasha calculator',
    'sade sati timing',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-sade-sati-calculator' },
  openGraph: {
    title: 'Free Sade Sati Calculator — Check Your Saturn 7.5 Year Period',
    description: 'Find Sade Sati status, phase, dates & 3 Parashar remedies — free.',
    url: 'https://trikalvaani.com/calculators/free-sade-sati-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Sade Sati Calculator',
    description: 'Saturn 7.5 year period check with remedies.',
  },
  robots: { index: true, follow: true },
};
export default function SadeSatiCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
