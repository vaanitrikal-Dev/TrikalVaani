// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: app/layout.tsx
// VERSION: v3.8 — Google Ads Tag AW-7916189860 added
// CHANGES vs v3.6.2 (CEO-approved):
//   ✅ ADD: GoogleAdsTag AW-7916189860 — builds Google Display +
//      YouTube + Gmail remarketing audiences alongside Meta Pixel.
// CHANGES vs v3.7 (CEO-approved):
//   ✅ ADD: MetaPixel component imported + rendered as FIRST element
//      in <body>. Pixel ID: 2111897212873248 (Trikal Vaani Voice).
//      Fires PageView on every page automatically.
//      Custom events (Lead, Purchase, InitiateCheckout) fire from
//      BirthForm.tsx v10.3 via inline trackFB() helper.
//      Audience building starts immediately — no ad spend needed.
//   ✅ PROTECTED: ALL v3.6.2 content untouched — schemas, metadata,
//      Razorpay preload, Clarity, OneSignal, TrikalVoice, Analytics,
//      StickyMobileCTA, font, body className.
// ------------------------------------------------------------
// Prior — v3.6.2: + verified Google Business Profile in sameAs.
// Prior — v3.6.1: IR-safety comment cleanup.
// Prior — v3.5: Microsoft Clarity wired (project x5li8xd59b).
// Prior — v3.4: StickyMobileCTA added.
// Prior — v3.3: legalName fix + AstrologicalService schema.
// Prior — v3.2: OneSignalInit wired.
// Prior — v3.1: Favicon fix + Org logo URL corrected.
// ============================================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SchemaScript from "@/components/SchemaScript";
import TrikalVoice from "@/components/Trikal/TrikalVoice";
import OneSignalInit from "@/components/OneSignalInit";
import StickyMobileCTA from "@/components/landing/StickyMobileCTA";
import ClarityAnalytics from "@/components/analytics/ClarityAnalytics";
import MetaPixel from "@/components/analytics/MetaPixel";
import GoogleAdsTag from "@/components/analytics/GoogleAdsTag";
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

        {/* ── Organization Schema ────────────────────────────────────────── */}
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
              legalName: "Trikal Vaani",
              url: "https://trikalvaani.com",
              logo: {
                "@type": "ImageObject",
                url: "https://trikalvaani.com/Trikal_Logo.png",
                width: 1440,
                height: 1440,
              },
              description:
                "AI-powered Vedic astrology platform offering free kundli and personalised predictions across India and worldwide. Powered by Swiss Ephemeris, BPHS Parashara classical rules, Bhrigu Nandi Nadi, and Shadbala. Government of India MSME registered enterprise (UDYAM-DL-10-0119070). Founded by Rohiit Gupta, Chief Vedic Architect.",
              disambiguatingDescription:
                "AI-powered Vedic astrology platform founded by Rohiit Gupta, Chief Vedic Architect, operated solely at trikalvaani.com under Government of India MSME registration UDYAM-DL-10-0119070. An independent online astrology service, distinct from any other individual, pandit, or business with a similar-sounding name.",
              slogan:
                "Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye.",
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
                "https://share.google/y5RN5czzW2MOmrq3j",
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

        {/* ── WebApplication Schema ─────────────────────────────────────── */}
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

        {/* ── AstrologicalService Schema ────────────────────────────────── */}
        <Script
          id="astro-service-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "@id": "https://trikalvaani.com/#astro-service",
              name: "Trikaal Vaani — AI Vedic Astrology Predictions",
              alternateName: [
                "Free Kundli Online",
                "AI Jyotish Reading",
                "Vedic Astrology Prediction India",
                "Online Astrology Hindi",
              ],
              serviceType: "Vedic Astrology Reading",
              description:
                "Trikaal Vaani offers free AI-powered Vedic astrology predictions using Swiss Ephemeris, Brihat Parashara Hora Shastra (BPHS), Bhrigu Nandi Nadi, and Shadbala. Personalised kundli, Kundali Milan, Mahadasha readings, and life domain analysis across career, wealth, marriage, health, and legal matters — in Hindi and English.",
              url: "https://trikalvaani.com",
              inLanguage: ["en-IN", "hi-IN"],
              provider: {
                "@type": "Person",
                "@id": "https://trikalvaani.com/#rohiit-gupta",
                name: "Rohiit Gupta",
                jobTitle: "Chief Vedic Architect",
                url: "https://trikalvaani.com/founder",
              },
              brand: {
                "@id": "https://trikalvaani.com/#organization",
              },
              areaServed: [
                { "@type": "Country", name: "India" },
                { "@type": "Place", name: "Worldwide" },
              ],
              availableLanguage: [
                { "@type": "Language", name: "Hindi" },
                { "@type": "Language", name: "English" },
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Trikaal Vaani Reading Plans",
                itemListElement: [
                  {
                    "@type": "Offer",
                    "@id": "https://trikalvaani.com/#offer-free",
                    name: "Free Trikaal Ka Sandesh",
                    price: "0",
                    priceCurrency: "INR",
                    description:
                      "Free AI kundli with 150–200 word Vedic astrology preview, key planetary message and one action step. Powered by Swiss Ephemeris.",
                    eligibleRegion: { "@type": "Place", name: "Worldwide" },
                  },
                  {
                    "@type": "Offer",
                    "@id": "https://trikalvaani.com/#offer-voice",
                    name: "Trikaal Ki Awaaz — Voice Reading",
                    price: "11",
                    priceCurrency: "INR",
                    description:
                      "60-second personalised Hindi/Hinglish voice reading by Trikaal AI, cloned from Rohiit Gupta's voice.",
                    eligibleRegion: { "@type": "Place", name: "Worldwide" },
                  },
                  {
                    "@type": "Offer",
                    "@id": "https://trikalvaani.com/#offer-deep",
                    name: "Deep Reading",
                    price: "51",
                    priceCurrency: "INR",
                    description:
                      "900-word full Vedic analysis with 5 personalised upay, Pratyantar Dasha windows, and Shadbala strength scoring.",
                    eligibleRegion: { "@type": "Place", name: "Worldwide" },
                  },
                  {
                    "@type": "Offer",
                    "@id": "https://trikalvaani.com/#offer-karmic",
                    name: "Karmic Background Reading",
                    price: "251",
                    priceCurrency: "INR",
                    description:
                      "Deep Bhrigu Nadi karmic pattern analysis — past-life karmic debt, current-life dharma path, and Nadi-specific remedies.",
                    eligibleRegion: { "@type": "Place", name: "Worldwide" },
                  },
                ],
              },
              speakable: {
                "@type": "SpeakableSpecification",
                cssSelector: [
                  ".geo-direct-answer",
                  ".faq-speakable",
                  "h1",
                  "h2",
                ],
              },
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
        {/* v3.7: Meta Pixel preconnect */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
      </head>
      <body className={`${inter.className} bg-[#080B12] text-white antialiased`}>

        {/* ── v3.7: Meta Pixel — fires PageView on every page ──────────────
            Pixel ID: 2111897212873248 (Trikal Vaani Voice)
            Custom events (Lead, Purchase, InitiateCheckout) fire from
            BirthForm.tsx v10.3 via inline trackFB() helper — no extra
            imports needed on other pages.
        ─────────────────────────────────────────────────────────────────── */}
        <MetaPixel />
        <GoogleAdsTag />

        {children}

        {/* SchemaScript: WebSite + Person + Service + Product schemas */}
        <SchemaScript />
        {/* TrikalVoice: floating mic — appears on ALL pages globally */}
        <TrikalVoice />
        {/* OneSignalInit: loads OneSignal v16 Web Push SDK + init globally */}
        <OneSignalInit />
        {/* v3.4: StickyMobileCTA — mobile-only bottom-left bar */}
        <StickyMobileCTA />
        {/* v3.5: Microsoft Clarity — heatmaps + session recordings */}
        <ClarityAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
