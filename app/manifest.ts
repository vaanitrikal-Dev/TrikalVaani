// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: app/manifest.ts   (NEW FILE — repo mein pehle nahi tha)
// VERSION: 1.0 (11 Oct 2026)
// PURPOSE: Web App Manifest — Play Store app (TWA) ki pehli zaroorat.
//   Next.js 13.5 isse apne aap /manifest.webmanifest par serve karta hai
//   aur har page ke <head> mein <link rel="manifest"> khud jod deta hai.
//   isliye app/layout.tsx ko CHHUNA NAHI gaya.
// NOTE (service worker): naya service worker JAAN-BOOJH KAR nahi banaya.
//   public/OneSignalSDKWorker.js pehle se root scope par chal raha hai
//   (Web Push). Ek doosra worker usi scope par lagane se OneSignal
//   push notifications toot jaate. Play app (TWA) ka offline page
//   Android wrapper khud deta hai.
// ============================================================

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Trikaal Vaani — Kundli & Vedic Astrology",
    short_name: "Trikaal Vaani",
    description:
      "Free Kundli, Kundali Milan, Panchang aur Vedic astrology predictions — Swiss Ephemeris + BPHS. Rooted in Granth · Verified by Rohiit · Powered by AI.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#080B12",
    theme_color: "#080B12",
    lang: "en-IN",
    dir: "ltr",
    categories: ["lifestyle", "education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
