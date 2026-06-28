// ============================================================
// File: app/hast-rekha-calculator/page.tsx
// Purpose: AI Hast Rekha Calculator — SEO/GEO/AEO landing + paid ₹51
// Version: v1.0
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================

import type { Metadata } from 'next';
import Script from 'next/script';
import HastRekhaClient from './HastRekhaClient';

const ORG_ID = 'https://trikalvaani.com/#organization';
const REAL_SAMEAS = [
  'https://www.instagram.com/thetrikalvaani',
  'https://www.youtube.com/@TheTrikalVaani',
  'https://www.facebook.com/people/Trikal-Vaani-Voice',
];

export const metadata: Metadata = {
  title: {
    absolute: 'AI Hast Rekha Calculator — Free Palm Reading by Samudrika Shastra | Trikaal Vaani',
  },
  description:
    'Upload your palm photo and get an AI-powered Samudrika Shastra reading. Analyse Jeevan Rekha, Mastishk Rekha, Hriday Rekha, Bhagya Rekha & all 8 mounts. 8 life scores, remedies & PDF report. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'hast rekha calculator', 'AI palmistry India', 'palm reading by photo',
    'samudrika shastra online', 'hast rekha gyan hindi', 'free palm reading',
    'AI hast rekha vishleshan', 'hastrekha online', 'jeevan rekha analysis',
    'palm line reading AI', 'indian palmistry online', 'hath ki rekha',
  ],
  alternates: { canonical: 'https://trikalvaani.com/hast-rekha-calculator' },
  openGraph: {
    title: 'AI Hast Rekha Calculator — Samudrika Shastra Reading | Trikaal Vaani',
    description: 'Photo upload karein. Complete palm reading — 6 lines, 8 mounts, 8 life scores, remedies & PDF. ₹51.',
    url: 'https://trikalvaani.com/hast-rekha-calculator',
    type: 'website',
    images: [{ url: 'https://trikalvaani.com/og-default.jpg', width: 1200, height: 630, alt: 'AI Hast Rekha Calculator — Trikaal Vaani' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Hast Rekha Calculator | Trikaal Vaani',
    description: 'Upload palm photo → Samudrika Shastra reading in Hindi. PDF report ₹51.',
    images: ['https://trikalvaani.com/og-default.jpg'],
  },
  robots: { index: true, follow: true },
};

// ── FAQ data (shared by schema + visible accordion in client) ──
const FAQS = [
  {
    q: 'Samudrika Shastra kya hota hai?',
    a: 'Samudrika Shastra bharat ki prachin vidya hai jisme haath ki rekhaon, parvaton, unglion aur haath ke aakar se vyakti ke jeevan ka vishleshan hota hai. Iska ullekh Brihat Samhita aur Hasta Sanjivani jaise shastriya granthon mein milta hai.',
  },
  {
    q: 'Hast Rekha Calculator kaun si rekhaen analyze karta hai?',
    a: 'Trikaal Vaani ka AI calculator 6 mukhya rekhaen — Jeevan Rekha, Mastishk Rekha, Hriday Rekha, Bhagya Rekha, Surya Rekha aur Budh Rekha — aur 8 parvat (Guru, Shani, Surya, Budh, Shukra, Mangal, Chandra) ka vishleshan karta hai.',
  },
  {
    q: 'AI palm reading kitni accurate hoti hai?',
    a: 'Achhi lighting aur clear palm photo ke saath hamara AI engine 90%+ accuracy se haath ke 21 landmarks detect karta hai, rekhaen aur parvat scan karta hai, aur Samudrika Shastra ke 40+ classical niyamon se report banata hai. Yeh ek AI-assisted reading hai — final nirnay hamesha aapka.',
  },
  {
    q: 'Hast Rekha report mein kya milega?',
    a: '8 dimension scores (career, wealth, health, relationships, vitality, leadership, creativity, spirituality), haath ka Samudrika parichay, 6 rekhaon ka vishleshan, vyaktitva, career-dhan-vivah-swasthya analysis, 4 Samudrika upay, shubh ratna suggestion, aur ek downloadable PDF report.',
  },
  {
    q: 'Seedha haath ya ulta haath upload karein?',
    a: 'Seedha haath (right hand) primary analysis ke liye zaruri hai — yeh active/future haath maana jaata hai. Ulta haath optional hai lekin dono se behtar analysis milti hai.',
  },
  {
    q: 'Kya meri palm image save hoti hai?',
    a: 'Nahi. Palm images hamare server par store nahi hoti — woh aapke browser session mein rehti hain aur analysis ke baad delete ho jaati hain. Sirf analysis ka result data save hota hai, koi image nahi.',
  },
];

export default function HastRekhaPage() {
  return (
    <>
      {/* ── SoftwareApplication Schema ── */}
      <Script id="hastrekha-app-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'AI Hast Rekha Calculator',
          alternateName: ['AI Palmistry Calculator India', 'Samudrika Shastra AI Tool'],
          description: 'AI-powered Indian palmistry calculator using advanced computer vision for hand landmark detection, palm line extraction, and Samudrika Shastra rule-based analysis. Personalised Hast Rekha reports in Hindi, English, and Hinglish.',
          url: 'https://trikalvaani.com/hast-rekha-calculator',
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Web, iOS, Android',
          inLanguage: ['hi-IN', 'en-IN'],
          offers: {
            '@type': 'Offer',
            price: '51',
            priceCurrency: 'INR',
            description: 'Full Samudrika Shastra Hast Rekha Report with PDF — 8 dimension scores, 6 line + 8 mount analysis, remedies, gemstone, downloadable PDF',
            eligibleRegion: { '@type': 'Place', name: 'Worldwide' },
          },
          featureList: [
            'AI 21-point hand landmark detection',
            'Advanced palm line enhancement',
            'AI vision palm line extraction (6 lines + 8 mounts)',
            'Samudrika Shastra rule engine (40+ niyam)',
            'AI-powered personalised report generation',
            '8 life dimension scores',
            'PDF report download',
            'Hindi, English, Hinglish support',
          ],
          author: {
            '@type': 'Person',
            '@id': 'https://trikalvaani.com/#rohiit-gupta',
            name: 'Rohiit Gupta',
            jobTitle: 'Chief Vedic Architect',
            url: 'https://trikalvaani.com/founder',
            image: 'https://trikalvaani.com/Rohiit-Gupta.jpg',
            knowsAbout: ['Samudrika Shastra', 'Vedic Astrology', 'Jyotish Shastra', 'Indian Palmistry'],
          },
          publisher: {
            '@type': 'Organization',
            '@id': ORG_ID,
            name: 'Trikaal Vaani',
            legalName: 'Trikal Vaani',
            url: 'https://trikalvaani.com',
            logo: 'https://trikalvaani.com/Trikal_Logo.png',
            sameAs: REAL_SAMEAS,
          },
        }) }} />

      {/* ── FAQPage Schema ── */}
      <Script id="hastrekha-faq-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }) }} />

      {/* ── BreadcrumbList Schema ── */}
      <Script id="hastrekha-breadcrumb-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
            { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
            { '@type': 'ListItem', position: 3, name: 'AI Hast Rekha Calculator', item: 'https://trikalvaani.com/hast-rekha-calculator' },
          ],
        }) }} />

      <HastRekhaClient faqs={FAQS} />
    </>
  );
}
