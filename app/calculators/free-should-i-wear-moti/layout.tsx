// ============================================================
// File: app/calculators/free-should-i-wear-moti/layout.tsx
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
//   "Should I Wear Moti? 60-Sec Kundli Jaanch | Trikaal Vaani"
//   56 characters. Angle chosen per the site standard, which maps
//   calculator pages to Frictionless/Speed.
//   Four alternates are in the chat handoff doc of 05 Sep 2026; swapping to
//   one of them means replacing the two strings below and nothing else.
//
// TARGET KEYWORD  : should i wear moti
// AUDIENCE CONCERN: Someone advised Moti and they are not sure it is safe for their chart
// PAGE OFFER      : Chandra ka bal, ast sthiti aur bhaav-swamitva lagna ke against jaanche jaate hain
//
// META DESCRIPTION: 146 characters, inside the 140-155 standard, opens by
//   confirming the search intent and closes on a CTA.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Should I Wear Moti? 60-Sec Kundli Jaanch | Trikaal Vaani' },
  description:
    'Moti aapke lagna ke anukool hai ya nahi — Chandra ka bal, uski ast sthiti aur bhaav-swamitva dekhkar. Free jaanch. Kharidne se pehle check karein.',
  keywords: [
    'should i wear moti',
    'moti pehnein ya nahi',
    'moti kis rashi ko pehnna chahiye',
    'moti benefits astrology',
    'moti suitability calculator',
    'moti kundli check',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-should-i-wear-moti' },
  openGraph: {
    title: 'Should I Wear Moti? 60-Sec Kundli Jaanch | Trikaal Vaani',
    description: 'Moti aapke lagna ke anukool hai ya nahi — Chandra ka bal, uski ast sthiti aur bhaav-swamitva dekhkar. Free jaanch. Kharidne se pehle check karein.',
    url: 'https://trikalvaani.com/calculators/free-should-i-wear-moti',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Should I Wear Moti? 60-Sec Kundli Jaanch | Trikaal Vaani',
    description: 'Moti aapke lagna ke anukool hai ya nahi — Chandra ka bal, uski ast sthiti aur bhaav-swamitva dekhkar. Free.',
  },
  robots: { index: true, follow: true },
};

export default function ShouldIWearMotiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
