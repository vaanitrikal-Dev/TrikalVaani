// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: app/layout.tsx
// VERSION: v3.1 — Favicon fix + Organization logo URL corrected
// DATE: 2026-06-01
// CHANGES vs v3.0 (CEO-approved):
//   ✅ FAVICON FIX (root cause of grey-globe in Google): the single
//      icon: "/Trikal_Vaani_Logo.svg" (a RECTANGULAR wordmark — non-square,
//      so Google rejected it and fell back to the default globe) is REPLACED
//      with a proper SQUARE icon set served from /public:
//        - /favicon.ico  (multi-size 16/32/48/64)
//        - /icon-192.png, /icon-512.png
//        - /apple-touch-icon.png (180)
//      Source art = cropped owl + third-eye mark from Trikal_Logo.png.
//   ✅ ORG LOGO URL FIXED: schema logo pointed to /logo.png (404 — file does
//      not exist in /public). Now points to the real /Trikal_Logo.png
//      (1440x1440 square). Helps brand/knowledge-panel signals.
//   NOTE: Trikal_Vaani_Logo.svg stays in /public (still referenced elsewhere);
//      it is simply no longer used as the favicon.
//   PROTECTED (untouched): all metadata copy, titles, OG/twitter, keywords,
//      verification token, canonical/languages, Organization + WebApplication
//      schema bodies, Razorpay preloads, SchemaScript/TrikalVoice/Analytics.
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
    default: "Trikaal Vaani | Free Kundli & Accurate AI Vedic Astrology",
    template: "%s | Trikaal Vaani",
  },
  description:
    "Get your free AI kundli & accurate Vedic astrology predictions instantly. Personalised readings for career, wealth, marriage, health & legal matters by Rohiit Gupta, Chief Vedic Architect. Powered by Swiss Ephemeris. Voice & text readings from ₹11.",
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  creator: "Rohiit Gupta",
  publisher: "Trikaal Vaani",
  keywords: [
    "free kundli online",
    "free janam kundli",
    "AI astrology free",
    "free AI kundli",
    "Vedic astrology India",
    "AI Vedic astrology",
    "Trikaal Vaani",
    "Trikaal Vaani",
    "Rohiit Gupta astrologer",
    "voice astrology Hindi",
    "horoscope Hindi",
    "kundli Hindi free",
    "online astrology consultation",
    "kundli matching online",
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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  category: "Vedic Astrology",
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
    url: "https://trikalvaani.com/",
    siteName: "Trikaal Vaani",
    title: "Trikaal Vaani | Free Kundli & Accurate AI Vedic Astrology",
    description:
      "Free AI kundli & accurate Vedic astrology predictions. Personalised readings by Rohiit Gupta, Chief Vedic Architect. Voice & text from ₹11.",
    images: [
      {
        url: "https://trikalvaani.com/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Trikaal Vaani — Free Kundli & Accurate AI Vedic Astrology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trikaal Vaani | Free Kundli & Accurate AI Vedic Astrology",
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
    "meta-author": "Rohiit Gupta",
    "meta-category": "Vedic Astrology",
    "meta-creator": "Rohiit Gupta",
    "meta-publisher": "Trikaal Vaani",
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
              name: "Trikaal Vaani",
              alternateName: [
                "Trikaal Vaani",
                "Trikaalvaani",
                "Trikalvaani",
                "Trikaal Vaani AI",
                "TrikalVaani",
                "त्रिकाल वाणी",
                "त्रिकाळ वाणी",
              ],
              legalName: "Trikal Vaani Global",
              url: "https://trikalvaani.com",
              logo: {
                "@type": "ImageObject",
                url: "https://trikalvaani.com/Trikal_Logo.png",
                width: 1440,
                height: 1440,
              },
              description:
                "AI-powered Vedic astrology platform offering free kundli and personalised predictions across India and worldwide. Powered by Swiss Ephemeris, BPHS Parashara classical rules, Bhrigu Nandi Nadi, and Shadbala. Government of India MSME registered enterprise (UDYAM-DL-10-0119070). Founded by Rohiit Gupta, Chief Vedic Architect.",
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
              areaServed: [
                { "@type": "Country", name: "India" },
                { "@type": "Place", name: "Worldwide" },
              ],
              sameAs: [
                "https://www.instagram.com/thetrikalvaani",
                "https://www.youtube.com/@TheTrikalVaani",
                "https://www.facebook.com/people/Trikal-Vaani-Voice",
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
              name: "Trikaal Vaani — Free Kundli & AI Vedic Astrology",
              alternateName: ["Trikaal Vaani", "Trikaalvaani AI"],
              url: "https://trikalvaani.com",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web, iOS, Android",
              inLanguage: ["en-IN", "hi-IN"],
              offers: [
                {
                  "@type": "Offer",
                  name: "Free Kundli & Trikaal Ka Sandesh",
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
                    "60-second Hindi/Hinglish voice reading by Trikaal AI",
                },
                {
                  "@type": "Offer",
                  name: "Deep Reading",
                  price: "51",
                  priceCurrency: "INR",
                  description:
                    "900-word full analysis with 5 personalised upay and action windows",
                },
              ],
              provider: { "@id": "https://trikalvaani.com/#organization" },
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
