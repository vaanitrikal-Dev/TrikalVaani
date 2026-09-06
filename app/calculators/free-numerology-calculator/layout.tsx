// ============================================================
// File: app/calculators/free-numerology-calculator/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Changelog:
//   v2.0 (2026-09-05) — Title rewritten and switched to title.absolute.
//        The v1.0 title was 93 characters AND carried "| Trikaal Vaani"
//        manually, while app/layout.tsx already sets
//        title.template = "%s | Trikaal Vaani" — so the rendered title ran to
//        109 characters with the brand twice, and Google cut it at roughly 58.
//        That is the longest truncation in the whole calculator batch.
//        Description rewritten to the 140-155 standard.
//   v1.0 — metadata only.
//
// TITLE IN USE — Option 5, Bilingual/Hinglish
//   "Mulank Kaise Nikale — Free Calculator | Trikaal Vaani"  (52 chars)
//
//   Why the Hinglish angle rather than the usual Frictionless one: Radar E3
//   (05 Sep 2026) tracks "मूलांक कैसे निकाले" with AI Overview state "partial",
//   and the PASF under it is almost entirely mulank/bhagyank phrasing —
//   "Mulank kaise nikale calculator", "29 ka mulank kaise nikale", "Mera
//   mulank kya hai", "जन्म मूलांक कैसे निकाले". The English word "numerology"
//   barely appears in how this is actually searched in India. Leading with the
//   question the searcher types is worth more here than leading with "Free".
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : mulank kaise nikale / numerology calculator by date of
//                   birth free
// AUDIENCE CONCERN: they want their number, and often cannot tell mulank,
//                   bhagyank and naamank apart
// PAGE OFFER      : free, no signup; all three numbers with the method shown
//                   so they can check it by hand — and a straight account of
//                   what numerology can and cannot do
//
// A NOTE THAT MUST SURVIVE ANY REWRITE
//   Nothing in this metadata may imply that numerology predicts events, or
//   that a paid name change, a "lucky" mobile number or a missing-number
//   remedy is worth buying. The page declines all three in plain language;
//   the title and description must not undercut that.
//
// GSC 3 months to 4 Sep 2026: 86 impressions, 1 click, CTR 1.16%,
// average position 33.93.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Mulank Kaise Nikale — Free Calculator | Trikaal Vaani' },
  description:
    'Mulank, bhagyank aur naamank — teeno janm tithi aur naam se, tarike ke saath taaki aap khud jaanch sakein. Free, bina signup, kuch becha nahi jaata.',
  keywords: [
    'mulank kaise nikale',
    'mulank kaise nikale calculator',
    'mera mulank kya hai',
    'mulank aur bhagyank',
    'मूलांक कैसे निकाले',
    'जन्म मूलांक कैसे निकाले',
    'नाम से मूलांक कैसे निकाले',
    'मूलांक और भाग्यांक में क्या अंतर है',
    'numerology calculator by date of birth free',
    'numerology calculator by name',
    'numerology chart by date of birth',
    'naamank calculator',
    'chaldean numerology calculator',
    'lo shu grid calculator',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-numerology-calculator' },
  openGraph: {
    title: 'Mulank Kaise Nikale — Free Calculator | Trikaal Vaani',
    description:
      'Mulank, bhagyank aur naamank ek saath — har ank ka graha, rang aur din ke saath, aur ganne ka tarika bhi. Bilkul free.',
    url: 'https://trikalvaani.com/calculators/free-numerology-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mulank Kaise Nikale — Free Calculator | Trikaal Vaani',
    description: 'Mulank, bhagyank aur naamank — teeno free, tarike ke saath.',
  },
  robots: { index: true, follow: true },
};

export default function NumerologyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
