// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/sitemap.ts
// Version:     v2.0
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
// Purpose:     Complete sitemap — all 925 SEO URLs
//              Phase B1: 365 panchang dates
//              Phase B2: 50 festival pages
//              Phase B3: 10 city panchang pages
//              Phase B4: 500 city+festival combo pages
//              Core: 15 domain pages + static pages
// Stack:       Next.js 13.5 App Router MetadataRoute.Sitemap
// Lock Status: gemini-prompt.ts = PERMANENTLY LOCKED (do not touch)
// Last Update: 2026-05-09 (Phase B complete)
// ════════════════════════════════════════════════════════════════════

import { MetadataRoute } from "next";

const SITE_URL = "https://trikalvaani.com";

// ── City slugs (B3 + B4) ────────────────────────────────────────────
const CITY_SLUGS = [
  "delhi", "mumbai", "noida", "gurgaon", "bangalore",
  "hyderabad", "pune", "kolkata", "chennai", "ahmedabad",
];

// ── Festival slugs (B2 + B4) ────────────────────────────────────────
const FESTIVAL_SLUGS = [
  "makar-sankranti-2026",
  "republic-day-panchang-2026",
  "vasant-panchami-2026",
  "maha-shivratri-2026",
  "holika-dahan-2026",
  "holi-2026",
  "chaitra-navratri-2026",
  "ram-navami-2026",
  "hanuman-jayanti-2026",
  "akshaya-tritiya-2026",
  "buddha-purnima-2026",
  "ganga-saptami-2026",
  "vat-savitri-vrat-2026",
  "rath-yatra-2026",
  "guru-purnima-2026",
  "hariyali-teej-2026",
  "raksha-bandhan-2026",
  "krishna-janmashtami-2026",
  "ganesh-chaturthi-2026",
  "pitru-paksha-2026",
  "sharad-navratri-2026",
  "durga-ashtami-2026",
  "vijayadashami-2026",
  "karwa-chauth-2026",
  "dhanteras-2026",
  "diwali-2026",
  "govardhan-puja-2026",
  "bhai-dooj-2026",
  "tulsi-vivah-2026",
  "kartik-purnima-2026",
  "vivah-panchami-2026",
  "geeta-jayanti-2026",
  "amavasya-monthly-2026",
  "purnima-monthly-2026",
  "ekadashi-monthly-2026",
  "pradosh-vrat-2026",
  "shravan-somvar-2026",
  "naga-panchami-2026",
  "chhath-puja-2026",
  "shivratri-monthly-2026",
  "jaya-ekadashi-2026",
  "putrada-ekadashi-2026",
  "nirjala-ekadashi-2026",
  "guru-pradosh-2026",
  "shani-jayanti-2026",
  "hartalika-teej-2026",
  "anant-chaturdashi-2026",
  "dev-uthani-ekadashi-2026",
  "mauni-amavasya-2026",
  "varuthini-ekadashi-2026",
];

// ── Domain pages (15 prediction domains) ────────────────────────────
const DOMAIN_SLUGS = [
  "career", "wealth", "health", "relationships", "family",
  "education", "home", "legal", "travel", "spirituality",
  "wellbeing", "marriage", "business", "foreign-settlement", "digital-career",
];

// ── Helper: generate panchang dates for full year ───────────────────
function generatePanchangDates(): string[] {
  const dates: string[] = [];
  const start = new Date("2026-01-01");
  const end = new Date("2026-12-31");
  const current = new Date(start);
  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const urls: MetadataRoute.Sitemap = [];

  // ── 1. Homepage ──────────────────────────────────────────────────
  urls.push({
    url: SITE_URL,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1.0,
  });

  // ── 2. Static pages ──────────────────────────────────────────────
  const staticPages = [
    { path: "/predict", priority: 0.9 },
    { path: "/upcoming-events", priority: 0.8 },
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    { path: "/privacy", priority: 0.4 },
    { path: "/terms", priority: 0.4 },
    { path: "/refund", priority: 0.4 },
  ];
  for (const p of staticPages) {
    urls.push({
      url: `${SITE_URL}${p.path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: p.priority,
    });
  }

  // ── 3. Domain prediction pages (15) ─────────────────────────────
  for (const domain of DOMAIN_SLUGS) {
    urls.push({
      url: `${SITE_URL}/${domain}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  // ── 4. Phase B1 — /panchang/[date] (365 URLs) ────────────────────
  const panchangDates = generatePanchangDates();
  for (const date of panchangDates) {
    urls.push({
      url: `${SITE_URL}/panchang/${date}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // ── 5. Phase B2 — /events/[slug] (50 URLs) ───────────────────────
  for (const slug of FESTIVAL_SLUGS) {
    urls.push({
      url: `${SITE_URL}/events/${slug}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    });
  }

  // ── 6. Phase B3 — /[city]/panchang (10 URLs) ─────────────────────
  for (const city of CITY_SLUGS) {
    urls.push({
      url: `${SITE_URL}/${city}/panchang`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75,
    });
  }

  // ── 7. Phase B4 — /[city]/events/[slug] (500 URLs) ───────────────
  for (const city of CITY_SLUGS) {
    for (const slug of FESTIVAL_SLUGS) {
      urls.push({
        url: `${SITE_URL}/${city}/events/${slug}`,
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.7,
      });
    }
  }

  return urls;
}
