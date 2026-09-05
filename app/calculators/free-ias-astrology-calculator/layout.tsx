// ============================================================
// File: app/calculators/free-ias-astrology-calculator/layout.tsx
// Version: v1.0 (05 Sep 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// WHY THIS FILE EXISTS
//   page.tsx is a client component ('use client'), and a client component
//   cannot export `metadata`. This route therefore had NO title tag and NO
//   meta description of its own — Google fell back to the root layout default
//   ("Trikaal Vaani | Free Kundli & Accurate AI Vedic Astrology") which is
//   shared by every other title-less page on the site. GSC, 3 months to
//   4 Sep 2026: this page took 11 impressions total while the cluster's
//   calculator-intent queries ("ias astrology calculator", 109 impressions;
//   "government job yog in kundali", 107) went elsewhere.
//
//   Fourteen more calculator routes are in the same state. They are listed in
//   the chat thread of 5 Sep 2026 and are NOT fixed here — one route at a time.
//
// BRAND SUFFIX — READ BEFORE EDITING
//   app/layout.tsx sets `title: { template: "%s | Trikaal Vaani" }`. Next.js
//   applies that template to any plain-string title in a child segment, so the
//   brand is added automatically. The title below therefore does NOT contain
//   the brand. Adding it here would render "… | Trikaal Vaani | Trikaal Vaani"
//   — which is exactly what free-nakshatra-calculator/layout.tsx does today.
//
//   Rendered length check:
//     "IAS Astrology Calculator — Free & Instant"  = 41 chars
//     + " | Trikaal Vaani"                         = 16 chars
//     = 57 chars, inside Google's 50-58 display window.
//
//   Angle is Frictionless/Speed, which the site standard assigns to calculator
//   pages. Primary keyword is front-loaded because that is the phrase carrying
//   the impressions.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IAS Astrology Calculator — Free & Instant',
  description:
    'Sarkari naukri aur UPSC ka yog apni kundali se — 10th house, Dasamsa D-10, Shani aur Surya ki Shadbala, har point ki wajah ke saath. Free check karein.',
  keywords: [
    'ias astrology calculator', 'ias astrology calculator free',
    'government job yog in kundali', 'govt job prediction by kundali',
    'ias yog in kundli calculator', 'sarkari naukri yog', 'ias kundli',
    'upsc astrology', 'government job kundli calculator',
    'yoga for government job in astrology', 'timing of government job in astrology',
    'career prediction by date of birth',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-ias-astrology-calculator' },
  openGraph: {
    title: 'IAS Astrology Calculator — Free & Instant',
    description:
      'Sarkari naukri aur UPSC ka yog aapki kundali se. 10th house, Dasamsa D-10, Shadbala aur Dasha — har point ki wajah ke saath, bilkul free.',
    url: 'https://trikalvaani.com/calculators/free-ias-astrology-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IAS Astrology Calculator — Free & Instant',
    description: 'Sarkari naukri ka yog aapki kundali se — Dasamsa D-10 aur Shadbala ke saath, free.',
  },
  robots: { index: true, follow: true },
};

export default function IasCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
