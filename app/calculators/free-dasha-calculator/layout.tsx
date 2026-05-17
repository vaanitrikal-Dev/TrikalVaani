// ============================================================
// File: app/calculators/free-dasha-calculator/layout.tsx
// Purpose: SEO/GEO/AEO/E-E-A-T metadata + JSON-LD schemas
// Version: v1.0
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Free Dasha Calculator — Vimshottari Mahadasha & Antardasha Online | Trikal Vaani',
  description:
    'Free Dasha Calculator powered by Swiss Ephemeris. Get accurate Vimshottari Mahadasha, Antardasha, next 5 dasha periods, Parashar Dos/Donts & 3 remedies instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'dasha calculator',
    'free dasha calculator',
    'vimshottari dasha calculator',
    'mahadasha calculator',
    'antardasha calculator',
    'current dasha calculator',
    'dasha periods online',
    'mahadasha by date of birth',
    'vedic dasha calculation',
    'planetary period calculator',
    'vimshottari mahadasha online',
    'dasha bhukti calculator',
  ],
  alternates: {
    canonical: 'https://trikalvaani.com/calculators/free-dasha-calculator',
  },
  openGraph: {
    title: 'Free Dasha Calculator — Vimshottari Mahadasha & Antardasha Online',
    description: 'Accurate Mahadasha, Antardasha, next 5 dasha periods, Parashar Dos/Donts & 3 free remedies.',
    url: 'https://trikalvaani.com/calculators/free-dasha-calculator',
    type: 'website',
    siteName: 'Trikal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Dasha Calculator — Vimshottari Online',
    description: 'Free Vimshottari Dasha calculator with Mahadasha, Antardasha & Parashar remedies.',
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  { q: 'Dasha calculator kya hai aur kaise kaam karta hai?', a: 'Dasha calculator aapki janm kundali ke aadhar par Vimshottari Dasha system se aapke jeevan ke grah-periods calculate karta hai. Trikal Vaani ka calculator Swiss Ephemeris engine se aapke janm samay Chandra ki Nakshatra position dekh kar — aapki current Mahadasha, Antardasha, aur aane wale 120 saal ka dasha cycle exact dates ke saath nikalta hai.' },
  { q: 'Vimshottari Dasha kya hai?', a: 'Vimshottari Dasha Maharishi Parashar dwara BPHS Chapter 46-49 mein varnit 120 saal ka grah-period cycle hai. Isme 9 grah baari-baari aapke jeevan par rule karte hain — Surya 6 saal, Chandra 10, Mangal 7, Rahu 18, Guru 16, Shani 19, Budh 17, Ketu 7, aur Shukra 20 saal.' },
  { q: 'Mahadasha aur Antardasha mein kya antar hai?', a: 'Mahadasha ek bade grah-period ko kehte hain — jaise Shani Mahadasha 19 saal ki hoti hai. Antardasha (jise Bhukti bhi kehte hain) Mahadasha ke andar ka chhota sub-period hai. Har Mahadasha mein 9 Antardashas hoti hain.' },
  { q: 'Apni current Dasha kaise pata karein?', a: 'Date of Birth, exact Time of Birth, aur Place of Birth daalo. Trikal Vaani calculator 5 second mein current Mahadasha, Antardasha, aur next 5 dasha periods deta hai — saath mein Parashar Dos/Donts aur 3 free remedies.' },
  { q: 'Kya Dasha calculator bilkul free hai?', a: 'Haan. Trikal Vaani ka Dasha calculator 100% free hai. Current Mahadasha + Antardasha, next 5 Mahadasha timeline, 3 Parashar Dos, 3 Donts, aur 3 personalized remedies (Mantra, Ratna, Daan) — sab free.' },
  { q: 'Dasha ke result kitne accurate hain?', a: 'Trikal Vaani Swiss Ephemeris use karta hai — NASA-grade astronomical library. Calculations Lahiri Ayanamsha pe based hain (Government of India ka official standard). Dasha BPHS classical formulas ke according compute hoti hai.' },
  { q: 'Kya dasha change hone par jeevan badal jaata hai?', a: 'Haan. Maharishi Parashar ke according jab Mahadasha badalti hai — aapke jeevan ki disha hi badal jaati hai. Career, marriage, financial peak, health — sab Mahadasha-Antardasha se decide hote hain.' },
  { q: 'Kya yeh calculator NRI ke liye bhi kaam karta hai?', a: 'Haan. Google Places se duniya ke kisi bhi shahar ka data leta hai — automatic timezone aur coordinates ke saath. NRI same accuracy ke saath apni Dasha calculate kar sakte hain.' },
];

const HOWTO_STEPS = [
  { name: 'Apna naam daalo (optional)', text: 'Personalized greeting ke liye apna naam likho. Skip bhi kar sakte ho.' },
  { name: 'Date of Birth select karo', text: 'Apni janm tareeq — din, mahina, saal.' },
  { name: 'Exact Time of Birth daalo', text: 'Janm samay — ghante aur minute. Jitna exact, utni accurate Mahadasha.' },
  { name: 'Place of Birth type karo', text: 'Google auto-suggest se apna janm sthan select karo.' },
  { name: 'Gender select karo (optional)', text: 'Male, Female ya Other — remedies personalize ho.' },
  { name: 'Calculate button dabao', text: 'Current Mahadasha, Antardasha, next 5 dasha + Parashar remedies 5 second mein.' },
];

export default function DashaCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="dasha-calc-software-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'SoftwareApplication',
          name: 'Trikal Vaani Free Dasha Calculator', applicationCategory: 'LifestyleApplication', operatingSystem: 'Web',
          description: 'Free Vimshottari Dasha calculator with Mahadasha, Antardasha, next 5 dasha periods, Parashar Dos/Donts and 3 personalized remedies.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', ratingCount: '189' },
          creator: { '@type': 'Person', name: 'Rohiit Gupta', jobTitle: 'Chief Vedic Architect', url: 'https://trikalvaani.com/founder' },
        }) }} />
      <Script id="dasha-calc-faq-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }) }} />
      <Script id="dasha-calc-howto-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'HowTo',
          name: 'Free Dasha Kaise Calculate Karein',
          description: 'Trikal Vaani Free Dasha Calculator se Vimshottari Mahadasha aur Antardasha kaise nikalein — step by step.',
          step: HOWTO_STEPS.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
        }) }} />
      <Script id="dasha-calc-breadcrumb-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
            { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
            { '@type': 'ListItem', position: 3, name: 'Free Dasha Calculator', item: 'https://trikalvaani.com/calculators/free-dasha-calculator' },
          ],
        }) }} />
      {children}
    </>
  );
}
