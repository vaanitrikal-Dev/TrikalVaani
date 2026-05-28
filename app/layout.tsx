// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: app/layout.tsx
// VERSION: v3.0 — Brand flip + LocalBusiness removed + global IR-0 cleanup
// DATE: 2026-05-27
// CHANGES vs v2.7 (CEO-approved, IR-0 compliant):
//   ✅ BRAND FLIP: visible "Trikal Vaani" -> "Trikaal Vaani" (titles, OG, twitter,
//      siteName, publisher, meta-publisher, OG image alt, all schema name fields).
//      legalName "Trikal Vaani Global" KEPT. alternateName arrays keep both spellings.
//   ✅ LOCALBUSINESS SCHEMA DELETED (CEO Decision #6): the entire
//      #localbusiness ProfessionalService block (New Delhi address, geo coords,
//      5 NCR cities, opening hours) removed. ProfessionalService is a
//      LocalBusiness subtype — banned. MSME ID retained in Organization schema.
//   ✅ ₹499 PHANTOM REMOVED: "Personal Consultation ₹499" offer deleted from
//      WebApplication offers. Free / ₹11 / ₹51 (real tiers) kept.
//   ✅ FAKE STAT REMOVED: Org description "India's most accurate" -> honest
//      global description. "Delhi NCR" removed.
//   ✅ GLOBAL (IR-0): Org areaServed -> [India, Worldwide].
//   ✅ GEO META REMOVED: geo.region, geo.placename, geo.position, ICBM (Delhi
//      targeting) deleted from `other`. "(Delhi NCR)" removed from description.
//   ✅ KEYWORDS: "best astrologer Delhi NCR" + "astrologer near me" removed;
//      added "online astrology consultation", "kundli matching online".
//   ✅ sameAs FIXED: real handles instagram.com/thetrikalvaani,
//      youtube.com/@TheTrikalVaani, facebook Trikal-Vaani-Voice. X/Twitter
//      dropped (master plan §5.3) — twitter.creator line also removed.
//   ✅ PERSONA: "Trikal Ka Sandesh" -> "Trikaal Ka Sandesh", "Trikal AI" -> "Trikaal AI".
//   PROTECTED (untouched): all trikalvaani.com URLs/@id (#organization +
//   #rohiit-gupta referenced by HomepageSchema + TrustStrip), /founder, /hi,
//   canonical, metadataBase, Google verification token, MSME number, phone,
//   Razorpay preloads, SchemaScript/TrikalVoice/Analytics wiring.
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
    "Trikal Vaani",
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
    icon: "/Trikal_Vaani_Logo.svg",
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
                url: "https://trikalvaani.com/logo.png",
                width: 512,
                height: 512,
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
