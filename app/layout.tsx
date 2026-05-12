// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: app/layout.tsx
// VERSION: v2.4 — TrikalVoice globally mounted on ALL pages
// DATE: 2026-05-12
// CHANGES:
//   v2.4: TrikalVoice imported and mounted in body globally
//         Now appears on every page: homepage, blog, report, domain
//         JiniChat not touched — separate decision
//         voice-debug route DELETED (security fix done)
// ============================================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SchemaScript from "@/components/SchemaScript";
import TrikalVoice from "@/components/Trikal/TrikalVoice";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://trikalvaani.com"),
  title: {
    default: "Trikal Vaani — AI Vedic Astrology by Rohiit Gupta | Delhi NCR",
    template: "%s | Trikal Vaani",
  },
  description:
    "Trikal Vaani is India's most accurate AI Vedic astrology platform. Get personalised predictions for career, wealth, marriage, health, and legal matters from Chief Vedic Architect Rohiit Gupta. Voice and text readings starting at ₹11.",
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  creator: "Rohiit Gupta",
  publisher: "Trikal Vaani",
  keywords: [
    "Vedic astrology India",
    "AI astrology prediction",
    "Trikal Vaani",
    "Rohiit Gupta astrologer",
    "voice astrology Hindi",
    "best astrologer Delhi NCR",
    "astrology near me",
    "kundali analysis online",
    "Mahadasha prediction",
    "Vimshottari Dasha reading",
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
  category: "Vedic Astrology",
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
    url: "https://trikalvaani.com/",
    siteName: "Trikal Vaani",
    title: "Trikal Vaani — AI Vedic Astrology by Rohiit Gupta",
    description:
      "India's most accurate AI Vedic astrology. Voice & text predictions from ₹11. Powered by Swiss Ephemeris.",
    images: [
      {
        url: "https://trikalvaani.com/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Trikal Vaani — AI Vedic Astrology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@TrikalVaani",
    title: "Trikal Vaani — AI Vedic Astrology",
    description: "India's most accurate AI Vedic astrology. From ₹11.",
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
                "India's most accurate AI-powered Vedic astrology platform. Powered by Swiss Ephemeris, BPHS classical rules, Bhrigu Nandi Nadi, and Shadbala. Government of India MSME registered enterprise (UDYAM-DL-10-0119070). Founded by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.",
              foundingDate: "2026",
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

        {/* ── WebApplication Schema ──
            NOTE: aggregateRating lives ONLY in SchemaScript.tsx -> Product schema ── */}
        <Script
          id="webapp-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "@id": "https://trikalvaani.com/#webapp",
              name: "Trikal Vaani — AI Vedic Astrology",
              alternateName: ["Trikaal Vaani", "Trikalvaani AI"],
              url: "https://trikalvaani.com",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web, iOS, Android",
              inLanguage: ["en-IN", "hi-IN"],
              offers: [
                {
                  "@type": "Offer",
                  name: "Trikal Ka Sandesh — Free Preview",
                  price: "0",
                  priceCurrency: "INR",
                  description:
                    "150-200 word free AI Vedic astrology summary with key message and action step",
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
              name: "Trikal Vaani — AI Vedic Astrology by Rohiit Gupta",
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

        {/* Performance */}
        <link rel="preconnect" href="https://api.razorpay.com" />
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className={`${inter.className} bg-[#080B12] text-white antialiased`}>
        {children}
        {/* SchemaScript injects: WebSite, Person, FAQPage, Service, Product (with aggregateRating) */}
        <SchemaScript />
        {/* ── TrikalVoice: Floating widget — appears on ALL pages globally ── */}
        <TrikalVoice />
      </body>
    </html>
  );
}
