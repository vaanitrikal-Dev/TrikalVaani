// ============================================================
// File: app/calculators/free-life-span-calculator/layout.tsx
// Version: v1.0 (22 Sep 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// WHY THIS FILE EXISTS
//   page.tsx is a client component ('use client') and cannot export
//   `metadata`. This layout carries the title and meta for the route.
//   `absolute` bypasses app/layout.tsx's "%s | Trikaal Vaani" template.
//
// TITLE — Rohiit ka chunav (22 Sep 2026, work_log 82), 53 akshar, brand nahi
//   (5 Sep ka niyam: jagah tang ho to keyword + differentiator brand se pehle):
//   "Life Span Calculator by Date of Birth - BPHS Ayurdaya"
// META — Rohiit ka chunav, 155 akshar.
// "death calculator" JAAN-BOOJH KAR nahi — hum death date nahi dete.
//
// TARGET KEYWORD  : life span calculator by date of birth
// AUDIENCE CONCERN: Kundali ke hisaab se meri aayu kaisi hai, kab dhyan rakhun?
// PAGE OFFER      : BPHS 43 band + BPHS 44 maraka daur + upay, poora muft, koi saal nahi
// ============================================================

import type { Metadata } from 'next';

const TITLE = 'Life Span Calculator by Date of Birth - BPHS Ayurdaya';
const DESC =
  'Free life span calculator by date of birth: BPHS 43 ke teen jode se Alpayu, Madhyayu ya Deerghayu, maraka ke saavdhaani daur aur upay. Koi death date nahi.';
const URL = 'https://trikalvaani.com/calculators/free-life-span-calculator';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: [
    'life span calculator by date of birth',
    'lifespan calculator astrology',
    'longevity calculator astrology',
    'life span prediction by date of birth',
    'ayushya calculator',
    'ayurdaya bphs',
    'alpayu madhyayu deerghayu',
    'maraka dasha',
    'आयु गणना कुंडली से',
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

export default function LifeSpanCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
