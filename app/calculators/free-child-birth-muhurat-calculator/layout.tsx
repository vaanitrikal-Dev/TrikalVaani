// ============================================================
// File: app/calculators/free-child-birth-muhurat-calculator/layout.tsx
// Version: v1.1 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.1 (2026-06-02) — Brand fix: visible brand normalised to the
//        double-a spelling in page <title> and openGraph siteName.
//        No other change.
//   v1.0 — metadata only.
// ============================================================
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Free Child Birth Muhurat Calculator — Auspicious C-Section & Delivery Time by Date | Trikaal Vaani',
  description:
    'Free Child Birth Muhurat Calculator powered by Swiss Ephemeris. Find the most auspicious time for C-section or planned delivery WITHIN your doctor-approved window. Master-grade analysis of Lagna, Nakshatra, Tithi, 8th house & lucky name letter (Naamakshar). By Rohiit Gupta.',
  keywords: [
    'child birth muhurat calculator',
    'c-section muhurat',
    'auspicious time for c-section',
    'shubh muhurat for child birth',
    'shubh muhurat for baby birth 2026',
    'cesarean delivery muhurat',
    'best time for delivery astrology',
    'auspicious time for baby birth',
    'santan janam muhurat',
    'planned delivery muhurat',
    'baby birth time astrology',
    'ivf delivery muhurat',
    'naamakshar by nakshatra',
    'lucky time for child birth',
  ],
  alternates: {
    canonical: 'https://trikalvaani.com/calculators/free-child-birth-muhurat-calculator',
  },
  openGraph: {
    title: 'Free Child Birth Muhurat Calculator — Auspicious C-Section & Delivery Time',
    description:
      'Find the most auspicious delivery time within your doctor-approved window. Master-grade Vedic muhurat analysis — free.',
    url: 'https://trikalvaani.com/calculators/free-child-birth-muhurat-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Child Birth Muhurat Calculator',
    description: 'Auspicious C-section & delivery time within your doctor-approved window.',
  },
  robots: { index: true, follow: true },
};
export default function MuhuratCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
