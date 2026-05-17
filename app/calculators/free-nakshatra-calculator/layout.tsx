// ============================================================
// File: app/calculators/free-nakshatra-calculator/layout.tsx
// Purpose: SEO/GEO/AEO/E-E-A-T metadata + JSON-LD schemas
// Version: v1.0
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Free Nakshatra Calculator — Find Your Janma Nakshatra Online | Trikal Vaani',
  description:
    'Free Nakshatra Calculator powered by Swiss Ephemeris. Discover your Janma Nakshatra, Pada, ruling planet, deity, gana, yoni, nadi & 3 Parashar remedies instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'nakshatra calculator',
    'free nakshatra calculator',
    'janma nakshatra calculator',
    'birth star calculator',
    'nakshatra finder',
    'nakshatra by date of birth',
    'my nakshatra',
    '27 nakshatras',
    'nakshatra pada calculator',
    'nakshatra lord calculator',
    'vedic nakshatra online',
    'janam nakshatra free',
  ],
  alternates: {
    canonical: 'https://trikalvaani.com/calculators/free-nakshatra-calculator',
  },
  openGraph: {
    title: 'Free Nakshatra Calculator — Find Your Janma Nakshatra Online',
    description:
      'Find your Janma Nakshatra, Pada, lord, deity, gana, yoni, nadi & 3 Parashar remedies — free. Swiss Ephemeris + BPHS classical rules.',
    url: 'https://trikalvaani.com/calculators/free-nakshatra-calculator',
    type: 'website',
    siteName: 'Trikal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Nakshatra Calculator — Janma Nakshatra Online',
    description: 'Free Nakshatra finder with Pada, lord, deity & Parashar remedies.',
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  { q: 'Nakshatra kya hota hai?', a: 'Nakshatra Vedic Jyotish ka sabse important unit hai. Aakash ko 27 equal divisions mein baata gaya hai, har division ko Nakshatra kehte hain. Aapka Janma Nakshatra wahi hai jismein aapke janm samay Chandra (Moon) sthit tha. Yeh aapka karma pattern, swabhav aur jeevan ki direction decide karta hai.' },
  { q: 'Janma Nakshatra kaise pata karein?', a: 'Janma Nakshatra jaanne ke liye 3 cheezein chahiye — Date of Birth, exact Time of Birth, aur Place of Birth. Trikal Vaani Nakshatra Calculator mein yeh details daalo, aur 5 second mein aapko apna Nakshatra, Pada, ruling planet, deity, gana, yoni, aur nadi mil jayega — bilkul free.' },
  { q: 'Pada kya hota hai?', a: 'Har Nakshatra ko 4 equal parts mein divide kiya gaya hai — inhe Pada kehte hain. 27 nakshatras × 4 padas = 108 micro-divisions. Aapka Nakshatra Pada aapke vyaktitva ka aur bhi exact blueprint deta hai. Jaise Rohini Nakshatra ka Pada 1 alag hota hai aur Pada 4 alag.' },
  { q: 'Gana, Yoni, aur Nadi kya hai?', a: 'Gana 3 prakar ka hota hai — Deva (divine), Manushya (human), aur Rakshasa (demonic) — aapka swabhav dikhata hai. Yoni 14 prakar ki hoti hai (Horse, Elephant, Cow, etc.) — aapki primitive nature aur compatibility batati hai. Nadi 3 hai — Aadi, Madhya, Antya — yeh marriage compatibility ke liye sabse zaroori hai.' },
  { q: 'Kya Nakshatra Calculator bilkul free hai?', a: 'Haan. Trikal Vaani ka Nakshatra Calculator 100% free hai. Aapko milta hai — Janma Nakshatra ka naam, Pada, ruling planet (lord), presiding deity, symbol, gana, yoni, nadi, personality traits, 3 Parashar Dos, 3 Donts, aur 3 free remedies (Mantra, Ratna, Daan). Koi signup nahi, koi hidden charge nahi.' },
  { q: '27 Nakshatras kaun se hain?', a: 'Vedic Jyotish ke 27 Nakshatras hain — Ashwini, Bharani, Krittika, Rohini, Mrigashira, Ardra, Punarvasu, Pushya, Ashlesha, Magha, Purva Phalguni, Uttara Phalguni, Hasta, Chitra, Swati, Vishakha, Anuradha, Jyeshtha, Mula, Purva Ashadha, Uttara Ashadha, Shravana, Dhanishta, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, aur Revati. Har Nakshatra ka apna lord planet, deity, symbol, gana, yoni, aur nadi hai.' },
  { q: 'Nakshatra ka kya prabhav padta hai?', a: 'Maharishi Parashar ke according aapka Janma Nakshatra aapke jeevan ke 5 mahatvapurn aspects decide karta hai — (1) Swabhav aur emotional patterns, (2) Career inclination, (3) Marriage compatibility (Ashtakoot matching), (4) Vimshottari Mahadasha sequence, aur (5) Auspicious muhurta. Nakshatra Vedic astrology ka foundation hai.' },
  { q: 'Kya NRI bhi yeh calculator use kar sakte hain?', a: 'Haan. Trikal Vaani Google Places integration use karta hai — duniya ke kisi bhi shahar (New York, London, Dubai, Singapore) ka data automatically lat-long aur timezone ke saath leta hai. NRI aur foreign-born log same accuracy ke saath apna Janma Nakshatra calculate kar sakte hain.' },
];

const HOWTO_STEPS = [
  { name: 'Apna naam daalo (optional)', text: 'Personalized result ke liye apna naam likho. Skip bhi kar sakte ho.' },
  { name: 'Date of Birth select karo', text: 'Apni janm tareeq — din, mahina, saal.' },
  { name: 'Exact Time of Birth daalo', text: 'Janm samay — ghante aur minute. Jitna exact, utna accurate Nakshatra Pada.' },
  { name: 'Place of Birth type karo', text: 'Google auto-suggest se apna janm sthan select karo. Timezone automatic.' },
  { name: 'Gender select karo (optional)', text: 'Male, Female ya Other — taaki remedies personalize ho.' },
  { name: 'Find Nakshatra button dabao', text: 'Aapka Janma Nakshatra + Pada + Lord + Deity + Gana + Yoni + Nadi + 3 remedies 5 second mein.' },
];

export default function NakshatraCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="nakshatra-calc-software-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Trikal Vaani Free Nakshatra Calculator',
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web',
            description: 'Free Janma Nakshatra calculator with Pada, ruling planet, deity, gana, yoni, nadi, Parashar Dos/Donts and 3 personalized remedies.',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
            aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', ratingCount: '203' },
            creator: {
              '@type': 'Person',
              name: 'Rohiit Gupta',
              jobTitle: 'Chief Vedic Architect',
              url: 'https://trikalvaani.com/founder',
            },
          }),
        }}
      />
      <Script
        id="nakshatra-calc-faq-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <Script
        id="nakshatra-calc-howto-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'Apna Janma Nakshatra Kaise Pata Karein',
            description: 'Trikal Vaani Free Nakshatra Calculator se Janma Nakshatra kaise nikalein — step by step.',
            step: HOWTO_STEPS.map((s, i) => ({
              '@type': 'HowToStep',
              position: i + 1,
              name: s.name,
              text: s.text,
            })),
          }),
        }}
      />
      <Script
        id="nakshatra-calc-breadcrumb-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
              { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
              { '@type': 'ListItem', position: 3, name: 'Free Nakshatra Calculator', item: 'https://trikalvaani.com/calculators/free-nakshatra-calculator' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
