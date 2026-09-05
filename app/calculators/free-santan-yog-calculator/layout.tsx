// ============================================================
// File: app/calculators/free-santan-yog-calculator/layout.tsx
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
//   "Santan Yog Calculator — Instant Check | Trikaal Vaani"
//   53 characters. Angle chosen per the site standard, which maps
//   calculator pages to Frictionless/Speed.
//   Four alternates are in the chat handoff doc of 05 Sep 2026; swapping to
//   one of them means replacing the two strings below and nothing else.
//
// TARGET KEYWORD  : santan yog calculator
// AUDIENCE CONCERN: Delay in having children, and the fear and blame that come with it
// PAGE OFFER      : 5th house, Saptamsa D-7 and Jupiter — plain language, no fear, no costly puja upsell
//
// META DESCRIPTION: 142 characters, inside the 140-155 standard, opens by
//   confirming the search intent and closes on a CTA.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Santan Yog Calculator — Instant Check | Trikaal Vaani' },
  description:
    'Santan yog aapki kundali se — panchma bhaav, Saptamsa D-7 aur Guru ki sthiti, har point ki wajah ke saath. Free jaanch, bina dar ki bhasha ke.',
  keywords: [
    'santan yog calculator',
    'santan yog kundli mein',
    'kitne bacche honge kundli mein',
    'saptamsa d7 children',
    'progeny astrology calculator',
    'child birth prediction astrology',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-santan-yog-calculator' },
  openGraph: {
    title: 'Santan Yog Calculator — Instant Check | Trikaal Vaani',
    description: 'Santan yog aapki kundali se — panchma bhaav, Saptamsa D-7 aur Guru ki sthiti, har point ki wajah ke saath. Free jaanch, bina dar ki bhasha ke.',
    url: 'https://trikalvaani.com/calculators/free-santan-yog-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Santan Yog Calculator — Instant Check | Trikaal Vaani',
    description: 'Santan yog aapki kundali se — panchma bhaav, Saptamsa D-7 aur Guru ki sthiti, har point ki wajah ke saath..',
  },
  robots: { index: true, follow: true },
};

export default function SantanYogCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
