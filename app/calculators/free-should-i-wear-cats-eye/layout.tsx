// ============================================================
// File: app/calculators/free-should-i-wear-cats-eye/layout.tsx
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
//   "Should I Wear Lehsunia? 60-Sec Free Jaanch | Trikaal Vaani"
//   58 characters. Angle chosen per the site standard, which maps
//   calculator pages to Frictionless/Speed.
//   Four alternates are in the chat handoff doc of 05 Sep 2026; swapping to
//   one of them means replacing the two strings below and nothing else.
//
// TARGET KEYWORD  : should i wear lehsunia
// AUDIENCE CONCERN: Someone advised Lehsunia and they are not sure it is safe for their chart
// PAGE OFFER      : Ketu ka bal, ast sthiti aur bhaav-swamitva lagna ke against jaanche jaate hain
//
// META DESCRIPTION: 151 characters, inside the 140-155 standard, opens by
//   confirming the search intent and closes on a CTA.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Should I Wear Lehsunia? 60-Sec Free Jaanch | Trikaal Vaani' },
  description:
    'Lehsunia (Cat\'s Eye) aapke lagna ke anukool hai ya nahi — Ketu ka bal aur ast sthiti dekhkar. Free jaanch, bina signup. Kharidne se pehle check karein.',
  keywords: [
    'should i wear lehsunia',
    'lehsunia pehnein ya nahi',
    'lehsunia kis rashi ko pehnna chahiye',
    'lehsunia benefits astrology',
    'lehsunia suitability calculator',
    'lehsunia kundli check',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-should-i-wear-cats-eye' },
  openGraph: {
    title: 'Should I Wear Lehsunia? 60-Sec Free Jaanch | Trikaal Vaani',
    description: 'Lehsunia (Cat\'s Eye) aapke lagna ke anukool hai ya nahi — Ketu ka bal aur ast sthiti dekhkar. Free jaanch, bina signup. Kharidne se pehle check karein.',
    url: 'https://trikalvaani.com/calculators/free-should-i-wear-cats-eye',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Should I Wear Lehsunia? 60-Sec Free Jaanch | Trikaal Vaani',
    description: 'Lehsunia (Cat\'s Eye) aapke lagna ke anukool hai ya nahi — Ketu ka bal aur ast sthiti dekhkar. Free jaanch,.',
  },
  robots: { index: true, follow: true },
};

export default function ShouldIWearCatsEyeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
