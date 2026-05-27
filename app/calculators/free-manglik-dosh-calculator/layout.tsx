// ============================================================
// File: app/calculators/free-manglik-dosh-calculator/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Manglik Dosh Calculator — Check Mangal Dosha Online | Trikal Vaani',
  description:
    'Free Manglik Dosh Calculator powered by Swiss Ephemeris. Find out if you are Manglik, severity (High/Medium/Low), Mars house position, cancellation rules & 3 Parashar remedies. By Rohiit Gupta, Chief Vedic Architect.',
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
    siteName: 'Trikal Vaani',
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
