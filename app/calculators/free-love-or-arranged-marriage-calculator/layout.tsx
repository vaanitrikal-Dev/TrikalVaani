// ============================================================
// File: app/calculators/free-love-or-arranged-marriage-calculator/layout.tsx
// Version: v1.0 (22 Sep 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// page.tsx 'use client' hai, metadata export nahi kar sakta — isliye yahan.
// `absolute` app/layout.tsx ke "%s | Trikaal Vaani" template ko bypass karta hai.
//
// TITLE — Rohiit ka chunav (22 Sep 2026), 53 akshar:
//   "Love or Arranged Marriage Prediction by Date of Birth"
//   Radar (Google PAA) ka hubahu phrase. Brand 60 ki seema ke kaaran chhoda
//   (site standard iski ijaazat deta hai).
// META — Rohiit ka chunav (M2), 146 akshar.
// TAKRAAV NAHI: /learn/will-i-have-love-marriage aur
//   /learn/love-marriage-vs-arranged-marriage JAANKARI hain; ye TOOL hai.
// ============================================================

import type { Metadata } from 'next';

const TITLE = 'Love or Arranged Marriage Prediction by Date of Birth';
const DESC =
  'Love marriage hogi ya arranged? Janm-tithi se muft jaaniye — Shukra, Rahu aur 5ve-7ve swami ke sanket, aur shaadi kab hogi. Bina login, 60 second.';
const URL = 'https://trikalvaani.com/calculators/free-love-or-arranged-marriage-calculator';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: [
    'love or arranged marriage prediction by date of birth',
    'love or arranged marriage calculator',
    'love marriage yog in kundli',
    'love marriage yog in kundli by date of birth',
    'date of birth se kaise jane love marriage hogi ya arrange',
    'which planet gives love marriage',
    'लव मैरिज योग कुंडली',
    'प्रेम विवाह योग',
  ],
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESC, url: URL, type: 'website', siteName: 'Trikaal Vaani' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC },
  robots: { index: true, follow: true },
};

export default function LoveOrArrangedMarriageCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
