// ============================================================
// File: app/calculators/free-graha-bal-calculator/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Changelog:
//   v2.0 (2026-09-05) — Title rewritten and switched to title.absolute.
//        The v1.0 title was 82 characters AND carried "| Trikaal Vaani"
//        manually, while app/layout.tsx already sets
//        title.template = "%s | Trikaal Vaani" — so the rendered title ran to
//        98 characters with the brand twice, and Google cut it at roughly 58.
//        Description rewritten to the 140-155 standard.
//   v1.0 — metadata only.
//
// TITLE IN USE — Option 2, Classical Authority
//   "Graha Bal Calculator — Full Shadbala | Trikaal Vaani"  (52 chars)
//
//   NOTE the angle choice. The site standard maps calculator pages to
//   Frictionless/Speed, and every other calculator in this batch uses it. This
//   page is the deliberate exception: its sibling
//   /calculators/free-weak-planet-finder already runs the Frictionless title
//   ("Weak Planet Finder — Free Shadbala Check"). Two pages in ONE Radar
//   cluster with near-identical titles would compete in the same SERP, which
//   is the exact risk Rohiit accepted when he chose to keep both pages rather
//   than merge them on 05 Sep 2026. Splitting the angle — diagnosis there,
//   measurement here — is what makes that choice workable.
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : graha bal calculator / shadbala calculator online free
// AUDIENCE CONCERN: they want the actual Shadbala numbers for all seven
//                   planets, not a one-word verdict
// PAGE OFFER      : free, no signup; full six-fold breakdown per planet in
//                   Rupa, each planet's classical minimum, and the ratio
//
// GSC 3 months to 4 Sep 2026: 190 impressions, 11 clicks, CTR 5.79%,
// average position 32.79. Radar E3, 05 Sep 2026: every tracked keyword in
// cluster calc-graha-bal has an AI Overview recommending a tool, and we rank
// on none of them.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Graha Bal Calculator — Full Shadbala | Trikaal Vaani' },
  description:
    'Saaton grahon ka poora Shadbala — chhe balon ka vibhajan, Rupa, classical minimum aur ratio, ek table mein. Free, bina signup, har aankda khula.',
  keywords: [
    'graha bal calculator',
    'shadbala calculator',
    'shadbala calculator online free',
    'free shadbala calculator',
    'best shadbala calculator',
    'shadbala of planets calculator',
    'shadbala score calculator',
    'shadbala chart',
    'planet strength calculator',
    'planet with highest shadbala calculator',
    'sthana bala of planets',
    'vimsopaka bala calculator',
    'bhava bala calculator',
    'ishta kashta phala',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-graha-bal-calculator' },
  openGraph: {
    title: 'Graha Bal Calculator — Full Shadbala | Trikaal Vaani',
    description:
      'Saaton grahon ka Shadbala ek table mein — Sthana, Dig, Kala, Cheshta, Naisargika aur Drik Bala, minimum ke saamne ratio ke saath. Free.',
    url: 'https://trikalvaani.com/calculators/free-graha-bal-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Graha Bal Calculator — Full Shadbala | Trikaal Vaani',
    description: 'Saaton grahon ka poora Shadbala, chhe balon ke vibhajan ke saath — free.',
  },
  robots: { index: true, follow: true },
};

export default function GrahaBalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
