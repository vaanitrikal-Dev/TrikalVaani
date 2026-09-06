// ============================================================
// File: app/calculators/free-kundali-strength-calculator/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Changelog:
//   v2.0 (2026-09-05) — Title rewritten and switched to title.absolute.
//        The v1.0 title was 74 characters AND carried "| Trikaal Vaani"
//        manually, while app/layout.tsx already sets
//        title.template = "%s | Trikaal Vaani" — so the rendered title ran to
//        90 characters with the brand twice, and Google cut it at roughly 58.
//        Description rewritten to the 140-155 standard.
//   v1.0 — metadata only.
//
// TITLE IN USE — Option 5, Bilingual/Hinglish
//   "Kundli Kitni Majboot Hai — Free Score | Trikaal Vaani"  (52 chars)
//
//   Why not the usual Frictionless angle: THREE of our pages sit in this
//   strength space and they must not look alike in the SERP.
//     free-weak-planet-finder    → "Weak Planet Finder — Free Shadbala Check"
//     free-graha-bal-calculator  → "Graha Bal Calculator — Full Shadbala"
//     THIS PAGE                  → the Hinglish question form
//   "kundli kitni majboot hai" is a tracked Radar keyword in its own right
//   (AIO partial, we rank nowhere), so leading with the question both
//   separates this title from its siblings and matches how the search is
//   actually typed.
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : kundali strength calculator / kundli kitni majboot hai
// AUDIENCE CONCERN: they want one overall read on the chart rather than seven
//                   separate planet numbers
// PAGE OFFER      : free, no signup; overall score plus the four parts it is
//                   built from — Shadbala, Bhava Bala, lagna strength and the
//                   running dasha — with the honest note that the 0-100 scale
//                   is presentation, not scripture
//
// GSC 3 months to 4 Sep 2026: 55 impressions, 7 clicks, CTR 12.73%,
// average position 46.04. Radar E3, 05 Sep 2026: both tracked keywords show
// AI Overview "partial" rather than "recommends_tool" — Google is
// half-answering these itself, which leaves room for a page that answers well.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Kundli Kitni Majboot Hai — Free Score | Trikaal Vaani' },
  description:
    'Poori kundali ka bal ek score mein — saat grahon ki Shadbala, baarah bhaavon ka Bhava Bala, lagna aur chal rahi dasha. Free, poore vibhajan ke saath.',
  keywords: [
    'kundali strength calculator',
    'kundli kitni majboot hai',
    'horoscope strength score',
    'kundali score calculator',
    'bhava bala calculator',
    'bhav bal kundali',
    'lagna strength calculator',
    'dasha strength',
    'janam kundali strength',
    'कुंडली कितनी मजबूत है',
    'कुंडली का बल',
    'भाव बल',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-kundali-strength-calculator' },
  openGraph: {
    title: 'Kundli Kitni Majboot Hai — Free Score | Trikaal Vaani',
    description:
      'Shadbala, Bhava Bala, lagna aur chal rahi dasha — chaaron ka jod ek score mein, poore vibhajan ke saath. Bilkul free.',
    url: 'https://trikalvaani.com/calculators/free-kundali-strength-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kundli Kitni Majboot Hai — Free Score | Trikaal Vaani',
    description: 'Graha, bhaav, lagna aur dasha ka jod — ek score mein, free.',
  },
  robots: { index: true, follow: true },
};

export default function KundaliStrengthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
