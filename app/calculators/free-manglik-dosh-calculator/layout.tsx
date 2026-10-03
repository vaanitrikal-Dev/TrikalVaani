// ============================================================
// File: app/calculators/free-manglik-dosh-calculator/layout.tsx
// Version: v1.2 — metadata only (3 Oct 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.2 (2026-10-03) — title + meta description rewritten for CTR
//        (Google title standard: keyword first, 50-58 chars; meta 140-155).
//        Old title: "Free Manglik Dosh Calculator — Check Online".
//   v1.1 (2026-06-02) — Brand fix: visible brand normalised to the
//        double-a spelling in page <title> and openGraph siteName.
//        No other change.
//   v1.0 — metadata only.
// ============================================================
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: { absolute: 'Mangal Dosha Calculator — Free Manglik Check Online' },
  description:
    "Free Mangal Dosha calculator: Manglik yes/no, severity, Mars house and bhang (cancellation) check from your birth chart. No signup. Check now.",
  keywords: [
    'manglik dosh calculator',
    'free manglik dosh calculator',
    'mangal dosha calculator',
    'manglik check',
    'am i manglik',
    'manglik dosha by date of birth',
    'mangal dosh remedies',
    'manglik severity',
    'manglik cancellation',
    'mars dosh calculator',
    'kuja dosha calculator',
    'bhauma dosha',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-manglik-dosh-calculator' },
  openGraph: {
    title: 'Free Manglik Dosh Calculator — Check Mangal Dosha Online',
    description: 'Find Manglik status, severity, Mars position & 3 Parashar remedies — free.',
    url: 'https://trikalvaani.com/calculators/free-manglik-dosh-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Manglik Dosh Calculator',
    description: 'Mangal Dosha check with severity & Parashar remedies.',
  },
  robots: { index: true, follow: true },
};
export default function ManglikDoshCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
