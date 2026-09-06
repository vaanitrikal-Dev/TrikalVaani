// ============================================================
// File: app/calculators/free-baby-name-by-nakshatra/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Changelog:
//   v2.0 (2026-09-05) — Title rewritten and switched to title.absolute.
//        The v1.0 title was 76 characters AND carried "| Trikaal Vaani"
//        manually, while app/layout.tsx already sets
//        title.template = "%s | Trikaal Vaani" — so the rendered title ran to
//        92 characters with the brand twice, and Google cut it at roughly 58.
//        Description rewritten to the 140-155 standard.
//   v1.0 — metadata only.
//
// TITLE IN USE — Option 4, Direct Action/Benefit
//   "Baby Name by Nakshatra — Lucky Letter Free | Trikaal Vaani"  (58 chars)
//
//   Why not Frictionless: the sibling /calculators/free-nakshatra-calculator
//   sits in the same Radar cluster (calc-nakshatra) and answers a different
//   question — which nakshatra, not which name. Leading here with the OUTCOME
//   the parent came for ("lucky letter") keeps the two titles distinct in the
//   SERP and matches the intent split the two pages are built on.
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : baby name by nakshatra / naamakshar by nakshatra
// AUDIENCE CONCERN: a baby has just arrived, the naming ceremony is days
//                   away, and most sites give one letter per nakshatra when
//                   there are actually four — one per pada
// PAGE OFFER      : free, no signup; nakshatra, pada, the exact syllable for
//                   that pada, and name suggestions with meanings
//
// THREE THINGS THIS METADATA MUST NEVER DO
//   (1) Frighten. Gandmool is a ceremony, never a defect. New parents are the
//       easiest people in this market to scare, and the page refuses to.
//   (2) Sell. No paid name correction, no Gandmool remedy, no "lucky name"
//       list. All three are declined in the body copy.
//   (3) Overstate. A name is an auspicious marker, not a control over the
//       child's future, and the copy says so plainly.
//
// GSC 3 months to 4 Sep 2026: no data — this page does not appear in the
// top-1000-by-clicks export, so it earns close to zero impressions. Radar E3,
// 05 Sep 2026: every tracked keyword in cluster calc-nakshatra has an AI
// Overview recommending a tool, and we rank on none of them.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Baby Name by Nakshatra — Lucky Letter Free | Trikaal Vaani' },
  description:
    'Bachche ka nakshatra, pada aur shubh naamakshar — pada tak sateek, kyunki ek nakshatra ke char akshar hote hain. Naam ki soochi ke saath, free.',
  keywords: [
    'baby name by nakshatra',
    'naamakshar by nakshatra',
    'nakshatra se naam',
    'lucky letter for baby name',
    'nakshatra pada calculator by date of birth',
    'जन्म तारीख से नाम और राशि online',
    'जन्म राशि नाम अक्षर',
    'baby name letter by birth star',
    'naamkaran nakshatra',
    'rashi naam by date of birth',
    'gandmool nakshatra naam',
    'baby name as per birth star',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-baby-name-by-nakshatra' },
  openGraph: {
    title: 'Baby Name by Nakshatra — Lucky Letter Free | Trikaal Vaani',
    description:
      'Nakshatra aur pada dono se sahi naamakshar, aur us akshar se shuru hone wale naam arth ke saath — ladke aur ladki dono ke liye. Bilkul free.',
    url: 'https://trikalvaani.com/calculators/free-baby-name-by-nakshatra',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baby Name by Nakshatra — Lucky Letter Free | Trikaal Vaani',
    description: 'Pada tak sateek naamakshar aur naam ki soochi — free.',
  },
  robots: { index: true, follow: true },
};

export default function BabyNameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
