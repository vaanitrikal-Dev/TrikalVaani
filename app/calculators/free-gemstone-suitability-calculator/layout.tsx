// ============================================================
// File: app/calculators/free-gemstone-suitability-calculator/layout.tsx
// Version: v1.0 (05 Sep 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// WHY THIS FILE EXISTS
//   page.tsx is a client component ('use client') and a client component
//   cannot export `metadata`. This route therefore had NO title tag and NO
//   meta description — Google fell back to the root default
//   ("Trikaal Vaani | Free Kundli & Accurate AI Vedic Astrology"), shared
//   with every other title-less page on the site. Fifteen calculator routes
//   were in that state on 05 Sep 2026.
//
// WHY `absolute`
//   app/layout.tsx sets title.template = "%s | Trikaal Vaani", which appends
//   the brand to any plain-string title in a child segment. The site standard
//   requires the title to be 50-58 characters INCLUDING the brand, so the
//   brand has to be inside the counted string. `absolute` bypasses the parent
//   template, making the field below exactly what Google renders — and it
//   avoids the double-suffix bug that free-nakshatra-calculator/layout.tsx
//   has today ("... | Trikaal Vaani | Trikaal Vaani").
//
// TITLE IN USE — Option 1, Frictionless/Speed
//   "Gemstone Suitability — 60-Sec Free Check | Trikaal Vaani"
//   56 characters. Angle chosen per the site standard, which maps
//   calculator pages to Frictionless/Speed.
//   Four alternates are in the chat handoff doc of 05 Sep 2026; swapping to
//   one of them means replacing the two strings below and nothing else.
//
// TARGET KEYWORD  : gemstone suitability calculator
// AUDIENCE CONCERN: Fear of wearing the wrong stone and making life worse
// PAGE OFFER      : Lagna, planet strength and combustion checked before any stone is recommended
//
// META DESCRIPTION: 143 characters, inside the 140-155 standard, opens by
//   confirming the search intent and closes on a CTA.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Gemstone Suitability — 60-Sec Free Check | Trikaal Vaani' },
  description:
    'Kaunsa ratna aapke lagna ke anukool hai aur kaunsa nuksan kar sakta hai — graha ka bal aur ast sthiti dekhkar. Free jaanch karein, bina signup.',
  keywords: [
    'gemstone suitability calculator',
    'kaunsa ratna pehnein',
    'lucky stone calculator by date of birth',
    'gemstone by lagna',
    'ratna suitability kundli',
    'accurate gemstone calculator free',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-gemstone-suitability-calculator' },
  openGraph: {
    title: 'Gemstone Suitability — 60-Sec Free Check | Trikaal Vaani',
    description: 'Kaunsa ratna aapke lagna ke anukool hai aur kaunsa nuksan kar sakta hai — graha ka bal aur ast sthiti dekhkar. Free jaanch karein, bina signup.',
    url: 'https://trikalvaani.com/calculators/free-gemstone-suitability-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gemstone Suitability — 60-Sec Free Check | Trikaal Vaani',
    description: 'Kaunsa ratna aapke lagna ke anukool hai aur kaunsa nuksan kar sakta hai — graha ka bal aur ast sthiti.',
  },
  robots: { index: true, follow: true },
};

export default function GemstoneSuitabilityCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
