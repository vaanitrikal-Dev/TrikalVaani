// ============================================================
// File: app/calculators/free-lucky-day-calculator/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Changelog:
//   v2.0 (2026-09-05) — Title rewritten and switched to title.absolute.
//        The v1.0 title was 78 characters AND carried "| Trikaal Vaani"
//        manually, while app/layout.tsx already sets
//        title.template = "%s | Trikaal Vaani" — so the rendered title ran to
//        94 characters with the brand twice, and Google cut it at roughly 58.
//        Description rewritten to the 140-155 standard.
//   v1.0 — metadata only.
//
// TITLE IN USE — Option 1, Frictionless/Speed
//   "Lucky Day Calculator — Free Instant Check | Trikaal Vaani"  (57 chars)
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : lucky day calculator astrology / what is my lucky day of
//                   the week
// AUDIENCE CONCERN: they want to know which day of the week actually suits
//                   them, and most sites answer it from their sun sign
// PAGE OFFER      : free, no signup; the day derived from the strongest
//                   planet by Shadbala rather than from a zodiac sign, with a
//                   scored seven-day calendar and the colour, number, metal
//                   and direction that go with it
//
// TWO THINGS THIS METADATA MUST NEVER DO
//   (1) Court gambling. "What are my lucky days to gamble" is a live PASF
//       entry on this SERP. The page refuses it in plain language and the
//       title and description must not undercut that by hinting at luck with
//       money.
//   (2) Promise outcomes. A lucky day is a favourable condition in the
//       tradition, not a guarantee, and the copy says so.
//
// GSC 3 months to 4 Sep 2026: no data — this page does not appear in the
// top-1000-by-clicks export at all, so it earns close to zero impressions.
// Radar E3, 05 Sep 2026: "lucky day calculator astrology" has an AI Overview
// recommending a tool, and we rank nowhere on it.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Lucky Day Calculator — Free Instant Check | Trikaal Vaani' },
  description:
    'Aapka anukool din kundali ke sabse balwan graha se — rashi se nahi. Saat dinon ka calendar, rang, ank aur dishaa ke saath. Free, bina signup.',
  keywords: [
    'lucky day calculator',
    'lucky day calculator astrology',
    'what is my lucky day of the week',
    'is it my lucky day today',
    'lucky days astrology',
    'lucky days of the week',
    'lucky dates by date of birth',
    'lucky day by date of birth',
    'what are my lucky days this month',
    'lucky colour by date of birth',
    'mera lucky day kaunsa hai',
    'shubh din kaise pata kare',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-lucky-day-calculator' },
  openGraph: {
    title: 'Lucky Day Calculator — Free Instant Check | Trikaal Vaani',
    description:
      'Sabse balwan graha se nikla aapka anukool din, saat dinon ke scored calendar ke saath — rang, ank, dhatu aur dishaa bhi. Bilkul free.',
    url: 'https://trikalvaani.com/calculators/free-lucky-day-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lucky Day Calculator — Free Instant Check | Trikaal Vaani',
    description: 'Anukool din kundali se, rashi se nahi — saat dinon ka calendar, free.',
  },
  robots: { index: true, follow: true },
};

export default function LuckyDayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
