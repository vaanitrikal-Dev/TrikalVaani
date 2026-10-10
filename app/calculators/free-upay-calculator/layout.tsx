// ============================================================
// File: app/calculators/free-upay-calculator/layout.tsx   (NEW FILE)
// Version: v1.0 (10 Oct 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// page.tsx client component hai — metadata yahan.
// TITLE 56 akshar (Google niyam 50-58): keyword aage, brand jagah ki kami se nahi.
// META 153 akshar.
// TARGET KEYWORD  : upay calculator by date of birth / remedies by date of birth
// AUDIENCE CONCERN: Meri samasya (naukri, karz, vivah…) ka granth wala upay kya hai?
// PAGE OFFER      : free 3 BPHS upay + kamzor grah; ₹51 mein 2 samasya ke 10 alag upay
// ============================================================

import type { Metadata } from 'next';

const TITLE = 'Upay Calculator by Date of Birth - Vedic Granth Remedies';
const DESC =
  'Free upay calculator by date of birth: Shadbala se kamzor grah aur BPHS ke 3 upay muft. Rs 51 mein 2 samasya ke 10 upay Atharvaveda, Rigveda aur BPHS se.';
const URL = 'https://trikalvaani.com/calculators/free-upay-calculator';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: [
    'upay calculator',
    'upay by date of birth',
    'remedies by date of birth',
    'astrology remedies calculator',
    'weak planet remedies',
    'atharvaveda upay',
    'bphs remedies',
    'graha shanti upay',
    'जन्म तिथि से उपाय',
    'ग्रह शांति उपाय',
  ],
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESC, url: URL, type: 'website', siteName: 'Trikaal Vaani' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC },
  robots: { index: true, follow: true },
};

export default function UpayCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
