// ============================================================
// File: app/calculators/free-sade-sati-calculator/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Free Sade Sati Calculator — Check Your Saturn 7.5 Year Period Online | Trikaal Vaani',
  description:
    'Free Sade Sati Calculator powered by Swiss Ephemeris. Find out if you are in Sade Sati, current phase (Rising/Peak/Setting), exact start-end dates, all life cycles & 3 Parashar remedies. By Rohiit Gupta.',
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
