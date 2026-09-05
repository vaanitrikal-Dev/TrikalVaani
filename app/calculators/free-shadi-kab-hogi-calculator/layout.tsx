// ============================================================
// File: app/calculators/free-shadi-kab-hogi-calculator/layout.tsx
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
//   "Shadi Kab Hogi Calculator — Instant | Trikaal Vaani"
//   51 characters. Angle chosen per the site standard, which maps
//   calculator pages to Frictionless/Speed.
//   Four alternates are in the chat handoff doc of 05 Sep 2026; swapping to
//   one of them means replacing the two strings below and nothing else.
//
// TARGET KEYWORD  : shadi kab hogi
// AUDIENCE CONCERN: Marriage keeps getting delayed and nobody gives a straight answer
// PAGE OFFER      : 7th house, Navamsa, Venus and running Dasha — returns a window, never a fake date
//
// META DESCRIPTION: 143 characters, inside the 140-155 standard, opens by
//   confirming the search intent and closes on a CTA.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Shadi Kab Hogi Calculator — Instant | Trikaal Vaani' },
  description:
    'Vivah ka samay aapki kundali se — saatva bhaav, Navamsa, Shukra aur chal rahi Dasha. Window milti hai, jhoothi tareekh nahi. Free check karein.',
  keywords: [
    'shadi kab hogi',
    'shadi kab hogi calculator',
    'vivah yog kundli',
    'marriage timing astrology',
    'date of birth se kaise jaane shadi kab hogi',
    'marriage prediction by date of birth',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-shadi-kab-hogi-calculator' },
  openGraph: {
    title: 'Shadi Kab Hogi Calculator — Instant | Trikaal Vaani',
    description: 'Vivah ka samay aapki kundali se — saatva bhaav, Navamsa, Shukra aur chal rahi Dasha. Window milti hai, jhoothi tareekh nahi. Free check karein.',
    url: 'https://trikalvaani.com/calculators/free-shadi-kab-hogi-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shadi Kab Hogi Calculator — Instant | Trikaal Vaani',
    description: 'Vivah ka samay aapki kundali se — saatva bhaav, Navamsa, Shukra aur chal rahi Dasha. Window milti hai,.',
  },
  robots: { index: true, follow: true },
};

export default function ShadiKabHogiCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
