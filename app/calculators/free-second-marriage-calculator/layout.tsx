// ============================================================
// File: app/calculators/free-second-marriage-calculator/layout.tsx
// Version: v1.0 (21 Sep 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// WHY THIS FILE EXISTS
//   page.tsx is a client component ('use client') and cannot export
//   `metadata`. This layout carries the title and meta for the route.
//
// WHY `absolute`
//   app/layout.tsx sets title.template = "%s | Trikaal Vaani". `absolute`
//   bypasses it so the string below is exactly what Google renders — no
//   double brand suffix.
//
// TITLE — Rohiit ka apna chunav (21 Sep 2026)
//   "Second Marriage Calculator by Date of Birth | Trikal Vaani"  — 58 akshar
//   Ye theek wahi shabd hai jis par sabse bada competitor (AnytimeAstro)
//   rank karta hai, aur "Calculator" bhi hai. "| Trikaal Vaani" (double-a)
//   se 59 ho jaata — isliye "Trikal Vaani" (single-a, site standard mein
//   manzoor vikalp).
//
// META — Vikalp B, 154 akshar. Title se hubahu mel ("Second Marriage
//   Calculator by date of birth") aur BPHS 18.19 hamara farq dikhata hai.
//
// TARGET KEYWORD  : second marriage calculator by date of birth
// AUDIENCE CONCERN: Kya meri kundali mein doosre vivah ka yog hai?
// PAGE OFFER      : BPHS 18.19 + Bhrigu + Phaladipika — har ank ke saath shlok
// ============================================================

import type { Metadata } from 'next';

const TITLE = 'Second Marriage Calculator by Date of Birth | Trikaal Vaani';
const DESC =
  'Free Second Marriage Calculator by date of birth. Parashar ke BPHS 18.19 niyam se doosre vivah ka yog, samay aur classical upay — generic nahi, granth se.';
const URL = 'https://trikalvaani.com/calculators/free-second-marriage-calculator';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: [
    'second marriage calculator',
    'second marriage calculator by date of birth',
    'second marriage prediction by date of birth',
    'doosri shadi ka yog',
    'dusri shadi kab hogi',
    'second marriage yoga in kundli',
    'remarriage astrology',
    'दूसरी शादी का योग',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL,
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
  },
  robots: { index: true, follow: true },
};

export default function SecondMarriageCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
