// ============================================================
// File: app/calculators/free-foreign-settlement-calculator/layout.tsx
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
//   "Foreign Settlement Calculator — Instant | Trikaal Vaani"
//   55 characters. Angle chosen per the site standard, which maps
//   calculator pages to Frictionless/Speed.
//   Four alternates are in the chat handoff doc of 05 Sep 2026; swapping to
//   one of them means replacing the two strings below and nothing else.
//
// TARGET KEYWORD  : foreign settlement calculator
// AUDIENCE CONCERN: Will I ever settle abroad — and if yes, when
// PAGE OFFER      : 12th/9th/4th houses, Rahu-Ketu and Dasha timing, every point with its reason, free
//
// META DESCRIPTION: 148 characters, inside the 140-155 standard, opens by
//   confirming the search intent and closes on a CTA.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Foreign Settlement Calculator — Instant | Trikaal Vaani' },
  description:
    'Videsh basne ka yog aapki kundali se — 12vaan, navam aur chaturth bhaav, Rahu-Ketu aur Dasha timing, har point ki wajah ke saath. Free check karein.',
  keywords: [
    'foreign settlement calculator',
    'videsh settlement calculator',
    'foreign settlement astrology',
    'will i settle abroad astrology',
    'foreign settlement yoga in astrology',
    'abroad settlement by date of birth',
    '12th house foreign settlement',
    'videsh yog kundli',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-foreign-settlement-calculator' },
  openGraph: {
    title: 'Foreign Settlement Calculator — Instant | Trikaal Vaani',
    description: 'Videsh basne ka yog aapki kundali se — 12vaan, navam aur chaturth bhaav, Rahu-Ketu aur Dasha timing, har point ki wajah ke saath. Free check karein.',
    url: 'https://trikalvaani.com/calculators/free-foreign-settlement-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foreign Settlement Calculator — Instant | Trikaal Vaani',
    description: 'Videsh basne ka yog aapki kundali se — 12vaan, navam aur chaturth bhaav, Rahu-Ketu aur Dasha timing, har.',
  },
  robots: { index: true, follow: true },
};

export default function ForeignSettlementCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
