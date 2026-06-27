// app/hast-rekha-calculator/page.tsx
import type { Metadata } from 'next';
import HastRekhaClient from './HastRekhaClient';

export const metadata: Metadata = {
  title: 'AI Hast Rekha Calculator | Free Palm Reading | Samudrika Shastra | Trikaal Vaani',
  description:
    'Upload your palm photo and get instant AI-powered Hast Rekha analysis based on Samudrika Shastra. Free Indian palmistry reading — career, wealth, love, health & remedies.',
  keywords: [
    'hast rekha calculator',
    'free palm reading online',
    'AI palmistry India',
    'Samudrika Shastra',
    'hast rekha gyan',
    'palm reading by photo',
    'AI hast rekha',
    'hastrekha vishleshan',
  ],
  alternates: {
    canonical: 'https://trikalvaani.com/hast-rekha-calculator',
  },
  openGraph: {
    title: 'Free AI Hast Rekha Calculator — Trikaal Vaani',
    description:
      'Upload palm photo. Get instant Samudrika Shastra analysis — career, wealth, love, health, remedies by Trikaal AI.',
    url: 'https://trikalvaani.com/hast-rekha-calculator',
    siteName: 'Trikaal Vaani',
    type: 'website',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function HastRekhaPage() {
  return <HastRekhaClient />;
}
