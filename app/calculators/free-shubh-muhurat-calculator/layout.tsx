// ============================================================
// File: app/calculators/free-shubh-muhurat-calculator/layout.tsx
// Version: v1.0 (23 Sep 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// YE FILE KYUN HAI
//   page.tsx client component hai ('use client') aur `metadata` export
//   nahi kar sakta. Route ka title aur meta yahan se jaata hai.
//   `absolute` app/layout.tsx ke "%s | Trikaal Vaani" template ko hata deta hai.
//
// TITLE — Rohiit ka chunav (23 Sep 2026, work_log 96), 54 akshar:
//   "Shubh Muhurat Calculator - Vivah, Griha Pravesh, Exams"
//   Rohiit ne "Vahan" ki jagah "Exams" chuna kyunki site par IAS/UPSC ke
//   liye log aate hain. "Calculator" shabd jaan-boojh kar hai — SERP par
//   log usi se pehchante hain ki ye tool hai, lekh nahi.
// META — Rohiit ka chunav, 156 akshar. "by date of birth" pehle 60 akshar
//   ke andar hai, kyunki Google wahi bold karta hai aur wahi hamara
//   ekmaatra asli farak hai: baaki har muhurat site tareekh maangti hai,
//   hum janm-tithi.
//
// TARGET KEYWORD  : shubh muhurat calculator, muhurat by date of birth
// AUDIENCE CONCERN: mera kaam kis din aur kis samay shuru karun?
// PAGE OFFER      : 40 kaam, har tareekh par samay, granth ka shlok, muft 3 mahine
// ============================================================

import type { Metadata } from 'next';

const TITLE = 'Shubh Muhurat Calculator - Vivah, Griha Pravesh, Exams';
const DESC =
  'Shubh muhurat by date of birth: har tareekh ke saath samay bhi. Vivah, griha pravesh, vahan, business - 40 kaam, Brihat Samhita ke niyam se. Muft, 2027 tak.';
const URL = 'https://trikalvaani.com/calculators/free-shubh-muhurat-calculator';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: [
    'shubh muhurat calculator',
    'muhurat by date of birth',
    'griha pravesh muhurat 2027',
    'vivah muhurat 2027',
    'vehicle purchase muhurat',
    'business start muhurat',
    'exam form shubh muhurat',
    'mundan muhurat',
    'shubh din aur samay',
    'शुभ मुहूर्त कैलकुलेटर',
    'गृह प्रवेश मुहूर्त',
  ],
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESC, url: URL, type: 'website', siteName: 'Trikaal Vaani' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC },
  robots: { index: true, follow: true },
};

export default function ShubhMuhuratCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
