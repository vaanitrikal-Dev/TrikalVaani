// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: app/layout.tsx
// VERSION: v2.7 — Title + Description + OG/Twitter aligned to "Free Kundli & Accurate AI Vedic Astrology"
// DATE: 2026-05-18
// CHANGES vs v2.6:
//   ✅ Title rewritten: leads with brand, then "Free Kundli & Accurate AI Vedic Astrology" (57 chars, CTR-optimized)
//   ✅ Description rewritten: leads with "Free AI Kundli" hook, retains EEAT (Rohiit Gupta, Chief Vedic Architect, MSME)
//   ✅ Keywords array refreshed: removed weak "kundali analysis online"; added high-volume "free kundli online", "free janam kundli", "AI astrology free", "horoscope Hindi", "kundli Hindi free"
//   ✅ OpenGraph title + description aligned to new master title (consistent social shares)
//   ✅ Twitter card title + description aligned (consistent X/Twitter shares)
//   ✅ Organization schema: knowsLanguage ["Hindi","English"] added — AEO signal for Hindi queries on Perplexity/SGE
//   ✅ All schemas, MSME ID, geo signals, Razorpay preloads — UNCHANGED (working, don't touch)
//   ✅ Analytics, TrikalVoice, SchemaScript wiring — UNCHANGED
// ============================================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SchemaScript from "@/components/SchemaScript";
import TrikalVoice from "@/components/Trikal/TrikalVoice";
import { Analytics } from "@vercel/analytics/next";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://trikalvaani.com"),
  title: {
    default: "Trikal Vaani | Free Kundli & Accurate AI Vedic Astrology",
    template: "%s | Trikal Vaani",
  },
  description:
    "Get your free AI kundli & accurate Vedic astrology predictions instantly. Personalised readings for career, wealth, marriage, health & legal matters by Rohiit Gupta, Chief Vedic Architect (Delhi NCR). Powered by Swiss Ephemeris. Voice & text readings from ₹11.",
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  creator: "Rohiit Gupta",
  publisher: "Trikal Vaani",
  keywords: [
    "free kundli online",
    "free janam kundli",
    "AI astrology free",
    "free AI kundli",
    "Vedic astrology India",
    "AI Vedic astrology",
    "Trikal Vaani",
    "Rohiit Gupta astrologer",
    "voice astrology Hindi",
    "horoscope Hindi",
    "kundli Hindi free",
    "best astrologer Delhi NCR",
    "astrologer near me",
    "Mahadasha prediction",
    "Vimshottari Dasha reading",
    "accurate astrology prediction",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/Trikal_Vaani_Logo.svg",
  },
  category: "Vedic Astrology",
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
    url: "https://trikalvaani.com/",
    siteName: "Trikal Vaani",
    title: "Trikal Vaani | Free Kundli & Accurate AI Vedic Astrology",
    description:
      "Free AI kundli & accurate Vedic astrology predictions. Personalised readings by Rohiit Gupta, Chief Vedic Architect. Voice & text from ₹11.",
    images: [
      {
        url: "https://trikalvaani.com/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Trikal Vaani — Free Kundli & Accurate AI Vedic Astrology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@TrikalVaani",
    title: "Trikal Vaani | Free Kundli & Accurate AI Vedic Astrology",
    description:
      "Free AI kundli & accurate Vedic astrology predictions. Voice & text readings from ₹11.",
    images: ["https://trikalvaani.com/og-default.jpg"],
  },
  verification: {
    google: "rr3Smkv1DQzSM1vq0lmmHNOhys-nXKyDBiXyv3tS9lY",
  },
  alternates: {
    canonical: "https://trikalvaani.com/",
    languages: {
      "en-IN": "https://trikalvaani.com/",
      "hi-IN": "https://trikalvaani.com/hi",
    },
  },
  other: {
    "geo.region": "IN-DL",
    "geo.placename": "New Delhi",
    "geo.position": "28.6139;77.2090",
    "ICBM": "28.6139, 77.2090",
    "meta-author": "Rohiit Gupta",
    "meta-category": "Vedic Astrology",
    "meta-creator": "Rohiit Gupta",
    "meta-publisher": "Trikal Vaani",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* ── Organization Schema ── */}
        <Script
          id="org-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://trikalvaani.com/#organization",
              name: "Trikal Vaani",
              alternateName: [
                "Trikaal Vaani",
                "Trikaalvaani",
                "Trikalvaani",
                "Trikal Vaani AI",
                "TrikalVaani",
                "त्रिकाल वाणी",
                "त्रिकाळ वाणी",
              ],
              legalName: "Trikal Vaani Global",
              url: "https://trikalvaani.com",
              logo: {
                "@type": "ImageObject",
                url: "https://trikalvaani.com/logo.png",
                width: 512,
                height: 512,
              },
              description:
                "India's most accurate AI-powered Vedic astrology platform offering free kundli and personalised predictions. Powered by Swiss Ephemeris, BPHS classical rules, Bhrigu Nandi Nadi, and Shadbala. Government of India MSME registered enterprise (UDYAM-DL-10-0119070). Founded by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.",
              foundingDate: "2026",
              knowsLanguage: ["Hindi", "English"],
              founder: {
                "@type": "Person",
                "@id": "https://trikalvaani.com/#rohiit-gupta",
                name: "Rohiit Gupta",
                jobTitle: "Chief Vedic Architect",
                url: "https://trikalvaani.com/founder",
                worksFor: { "@id": "https://trikalvaani.com/#organization" },
                knowsAbout: [
                  "Vedic Astrology",
                  "Jyotish Shastra",
                  "Vimshottari Dasha",
                  "Brihat Parashara Hora Shastra",
                  "Pratyantar Dasha",
                  "Bhrigu Nandi Nadi",
                  "Shadbala",
                ],
                knowsLanguage: ["Hindi", "English"],
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-9211804111",
                contactType: "Customer Service",
                areaServed: "IN",
                availableLanguage: ["Hindi", "English"],
              },
              identifier: [
                {
                  "@type": "PropertyValue",
                  propertyID: "Udyam Registration Number",
                  name: "MSME Udyam Registration",
                  value: "UDYAM-DL-10-0119070",
                  url: "https://udyamregistration.gov.in/Udyam_Verify.aspx",
                },
              ],
              areaServed: { "@type": "Country", name: "India" },
              sameAs: [
                "https://www.instagram.com/trikalvaani",
                "https://www.youtube.com/@trikalvaani",
                "https://twitter.com/trikalvaani",
                "https://udyamregistration.gov.in/Udyam_Verify.aspx",
              ],
              paymentAccepted: [
                "UPI",
                "Credit Card",
                "Debit Card",
                "Net Banking",
                "Wallet",
                "RuPay",
              ],
              currenciesAccepted: "INR",
            }),
          }}
        />

        {/* ── WebApplication Schema ── */}
        <Script
          id="webapp-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "@id": "https://trikalvaani.com/#webapp",
              name: "Trikal Vaani — Free Kundli & AI Vedic Astrology",
              alternateName: ["Trikaal Vaani", "Trikalvaani AI"],
              url: "https://trikalvaani.com",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web, iOS, Android",
              inLanguage: ["en-IN", "hi-IN"],
              offers: [
                {
                  "@type": "Offer",
                  name: "Free Kundli & Trikal Ka Sandesh",
                  price: "0",
                  priceCurrency: "INR",
                  description:
                    "Free AI kundli with 150-200 word Vedic astrology summary, key message and action step",
                },
                {
                  "@type": "Offer",
                  name: "Voice Reading",
                  price: "11",
                  priceCurrency: "INR",
                  description:
                    "60-second Hindi/Hinglish voice reading by Trikal AI",
                },
                {
                  "@type": "Offer",
                  name: "Deep Reading",
                  price: "51",
                  priceCurrency: "INR",
                  description:
                    "900-word full analysis with 5 personalised upay and action windows",
                },
                {
                  "@type": "Offer",
                  name: "Personal Consultation",
                  price: "499",
                  priceCurrency: "INR",
                  description:
                    "1:1 WhatsApp consultation with Rohiit Gupta, Chief Vedic Architect",
                },
              ],
              provider: { "@id": "https://trikalvaani.com/#organization" },
            }),
          }}
        />

        {/* ── LocalBusiness / ProfessionalService Schema ── */}
        <Script
          id="localbusiness-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "@id": "https://trikalvaani.com/#localbusiness",
              name: "Trikal Vaani — Free Kundli & AI Vedic Astrology by Rohiit Gupta",
              alternateName: ["Trikaal Vaani", "Trikaalvaani"],
              image: "https://trikalvaani.com/og-image.jpg",
              url: "https://trikalvaani.com",
              telephone: "+91-9211804111",
              priceRange: "₹0 - ₹499",
              identifier: {
                "@type": "PropertyValue",
                propertyID: "Udyam Registration Number",
                value: "UDYAM-DL-10-0119070",
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "New Delhi",
                addressRegion: "Delhi",
                postalCode: "110001",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 28.6139,
                longitude: 77.209,
              },
              areaServed: [
                { "@type": "City", name: "New Delhi" },
                { "@type": "City", name: "Gurugram" },
                { "@type": "City", name: "Noida" },
                { "@type": "City", name: "Faridabad" },
                { "@type": "City", name: "Ghaziabad" },
                { "@type": "Country", name: "India" },
              ],
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "00:00",
                closes: "23:59",
              },
              founder: { "@id": "https://trikalvaani.com/#rohiit-gupta" },
            }),
          }}
        />

        {/* Razorpay preload */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

        {/* Performance hints */}
        <link rel="preconnect" href="https://api.razorpay.com" />
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className={`${inter.className} bg-[#080B12] text-white antialiased`}>
        {children}
        {/* SchemaScript: WebSite, Person, FAQPage, Service, Product + aggregateRating */}
        <SchemaScript />
        {/* TrikalVoice: floating mic — appears on ALL pages globally */}
        <TrikalVoice />
        <Analytics />

      </body>
    </html>
  );
}
