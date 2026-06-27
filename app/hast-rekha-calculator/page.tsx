// app/hast-rekha-calculator/page.tsx
// Version: 2.0.0 — SEO + GEO + AEO + EEAT compliant
import type { Metadata } from 'next';
import HastRekhaClient from './HastRekhaClient';

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'AI Hast Rekha Calculator | Free Palm Reading India | Samudrika Shastra Analysis | Trikaal Vaani',
  description:
    'Upload your palm photo and get AI-powered Samudrika Shastra analysis in Hindi. Jeevan Rekha, Mastishk Rekha, Hriday Rekha, Bhagya Rekha, mount analysis + 8 life scores. Full PDF report ₹51.',
  keywords: [
    'hast rekha calculator', 'AI palmistry India', 'palm reading by photo', 'Samudrika Shastra online',
    'hast rekha gyan Hindi', 'free palm reading', 'AI hast rekha vishleshan', 'hastrekha online',
    'jeevan rekha kya bolta hai', 'palm line analysis AI', 'Indian palmistry online',
  ],
  alternates: { canonical: 'https://trikalvaani.com/hast-rekha-calculator' },
  openGraph: {
    title: 'AI Hast Rekha Calculator — Samudrika Shastra Analysis | Trikaal Vaani',
    description: 'Photo upload karein. 6 palm lines + 8 mounts ka AI analysis. Complete PDF report ₹51. Rohiit Gupta, Chief Vedic Architect.',
    url:      'https://trikalvaani.com/hast-rekha-calculator',
    siteName: 'Trikaal Vaani',
    type:     'website',
    images:   [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'AI Hast Rekha Calculator — Trikaal Vaani' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'AI Hast Rekha Calculator | Trikaal Vaani',
    description: 'Upload palm photo → get Samudrika Shastra analysis in Hindi. PDF report ₹51.',
    images:      ['/og-default.jpg'],
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
};

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

const softwareSchema = {
  '@context':        'https://schema.org',
  '@type':           'SoftwareApplication',
  name:              'AI Hast Rekha Calculator',
  alternateName:     ['AI Palmistry Calculator India', 'Samudrika Shastra AI Tool'],
  description:       'AI-powered Indian palmistry calculator using advanced computer vision for hand landmark detection, palm line extraction, and Samudrika Shastra rule-based analysis. Personalized Hast Rekha reports in Hindi, English, and Hinglish.',
  url:               'https://trikalvaani.com/hast-rekha-calculator',
  applicationCategory: 'LifestyleApplication',
  operatingSystem:   'Web Browser',
  offers: {
    '@type':       'Offer',
    price:         '51',
    priceCurrency: 'INR',
    description:   'Full Samudrika Shastra Hast Rekha Report with PDF — 8 dimension scores, 7 analysis sections, remedies, gemstone, PDF download',
    availability:  'https://schema.org/InStock',
  },
  featureList: [
    'AI 21-point hand landmark detection',
    'Advanced palm line enhancement',
    'AI vision palm line extraction (6 lines + 8 mounts)',
    'Samudrika Shastra rule engine (40+ niyam)',
    'AI-powered personalized report generation',
    '8 life dimension scores',
    'PDF report download',
    'Hindi, English, Hinglish support',
  ],
  author: {
    '@type': 'Person',
    name:    'Rohiit Gupta',
    jobTitle: 'Chief Vedic Architect',
    url:     'https://trikalvaani.com',
    image:   'https://trikalvaani.com/Rohiit-Gupta.jpg',
    knowsAbout: ['Samudrika Shastra', 'Vedic Astrology', 'Parashara BPHS', 'Indian Palmistry'],
    hasCredential: '16+ years Vedic Astrology practice, Parashara BPHS tradition',
  },
  publisher: {
    '@type': 'Organization',
    name:    'Trikaal Vaani',
    url:     'https://trikalvaani.com',
    logo:    'https://trikalvaani.com/Trikal_Vaani_Logo.svg',
  },
  inLanguage:    ['hi', 'en'],
  datePublished: '2026-06-27',
  screenshot:    'https://trikalvaani.com/og-default.jpg',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type':    'FAQPage',
  mainEntity: [
    {
      '@type':          'Question',
      name:             'Samudrika Shastra kya hota hai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    'Samudrika Shastra bharat ki prachin vidya hai jisme haath ki rekhaon, parvaton, unglion aur haath ke aakar se vyakti ke jeevan ka vishleshan hota hai. Iska ullekh Brihat Samhita, Hasta Sanjivani aur Samudra Manjari jaise shastriya granthon mein milta hai. Yeh Jyotish Shastra ki sahyogi vidya hai.',
      },
    },
    {
      '@type':          'Question',
      name:             'Hast Rekha Calculator mein kaun si rekhaen analyze hoti hain?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    'Trikaal Vaani ka AI calculator 6 mukhya rekhaen analyze karta hai: Jeevan Rekha (Life Line), Mastishk Rekha (Head Line), Hriday Rekha (Heart Line), Bhagya Rekha (Fate Line), Surya Rekha (Sun Line), aur Budh Rekha (Mercury Line). Saath hi 8 parvat (Jupiter, Saturn, Apollo, Mercury, Venus, Mars, Moon) ka bhi vishleshan hota hai.',
      },
    },
    {
      '@type':          'Question',
      name:             'AI palm reading kitni accurate hoti hai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    'Achhi lighting aur clear palm photo ke saath hamara AI engine 90%+ accuracy se haath ke 21 landmarks detect karta hai, palm lines aur mounts extract karta hai, aur Samudrika Shastra ke 40+ classical niyamon se final report banata hai. Yeh ek AI-assisted reading hai jo traditional palmistry principles par based hai.',
      },
    },
    {
      '@type':          'Question',
      name:             'Hast Rekha report mein kya milega?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    '8 dimension scores (career, wealth, health, relationships, vitality, leadership, creativity, spirituality), haath ka Samudrika parichay, 6 rekhaon ka vishleshan, vyaktitva analysis, career aur dhan sanket, prem aur vivah tendencies, swasthya, adhyatma, 4 Samudrika upay, shubh ratna suggestion, Trikaal AI ka personal sandesh, aur downloadable PDF report.',
      },
    },
    {
      '@type':          'Question',
      name:             'Seedha haath ya ulta haath upload karein?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    'Seedha haath (right hand) primary analysis ke liye zaruri hai — yeh active aur future haath maana jaata hai. Ulta haath (left hand) optional hai lekin dono haath upload karne se better analysis milti hai. Samudrika Shastra mein seedha haath vyakti ka prapat aur ulta haath potential batata hai.',
      },
    },
    {
      '@type':          'Question',
      name:             'Kya palm images save hoti hain?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    'Nahi. Palm images hamare server par kabhi store nahi hoti. Images strictly aapke browser session mein rehti hain aur analysis ke baad delete ho jaati hain. Sirf analysis results (JSON data) Supabase mein save hota hai, koi image nahi.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type':    'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://trikalvaani.com' },
    { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
    { '@type': 'ListItem', position: 3, name: 'AI Hast Rekha Calculator', item: 'https://trikalvaani.com/hast-rekha-calculator' },
  ],
};

const webPageSchema = {
  '@context':    'https://schema.org',
  '@type':       'WebPage',
  name:          'AI Hast Rekha Calculator | Samudrika Shastra Analysis',
  url:           'https://trikalvaani.com/hast-rekha-calculator',
  description:   'AI-powered Indian palmistry calculator based on Samudrika Shastra. Upload palm photo, get 8-dimension scores, full report in Hindi/English, and downloadable PDF.',
  inLanguage:    'hi',
  isPartOf:      { '@type': 'WebSite', name: 'Trikaal Vaani', url: 'https://trikalvaani.com' },
  author: {
    '@type':    'Person',
    name:       'Rohiit Gupta',
    jobTitle:   'Chief Vedic Architect',
    url:        'https://trikalvaani.com',
    image:      'https://trikalvaani.com/Rohiit-Gupta.jpg',
    sameAs:     ['https://www.instagram.com/thetrikalvaani'],
    knowsAbout: ['Samudrika Shastra', 'Vedic Astrology', 'Jyotish Shastra', 'Indian Palmistry'],
  },
  datePublished: '2026-06-27',
  dateModified:  new Date().toISOString().split('T')[0],
  speakable: {
    '@type':    'SpeakableSpecification',
    cssSelector: ['h1', '.geo-answer', '.section-content'],
  },
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function HastRekhaPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <HastRekhaClient />
    </>
  );
}
