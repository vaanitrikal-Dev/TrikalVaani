// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/[city]/panchang/page.tsx
// Version:     v1.0
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
// Purpose:     Phase B3 — City-specific Panchang Pages (dynamic route)
//              URL: /delhi/panchang, /mumbai/panchang
//              Target: 10 city URLs Year 1
//              Data Source: app/data/cities.json
// Stack:       Next.js 13.5 App Router + ISR (24h)
//              City-specific lat/lon for sunrise/sunset/Rahu Kaal
// SEO:         WebPage + FAQPage + BreadcrumbList schema
//              Local SEO: "aaj ka panchang [city]" keywords
//              GEO: 50-word direct answer block at top
// E-E-A-T:     Author = Rohiit Gupta, Chief Vedic Architect
// Lock Status: gemini-prompt.ts = PERMANENTLY LOCKED (do not touch)
// Last Update: 2026-05-09 (Phase B3)
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import citiesData from "../data/cities.json";

// ── ISR ──────────────────────────────────────────────────────────────
export const revalidate = 86400;
export const dynamicParams = true;

// ── Types ────────────────────────────────────────────────────────────
type City = {
  slug: string;
  name: string;
  name_hindi: string;
  state: string;
  latitude: number;
  longitude: number;
  timezone: string;
  description: string;
  famous_temples: string[];
  language: string;
  population_tier: string;
};

type Panchang = {
  date: string;
  weekday: string;
  tithi: { name: string; index: number; paksha: string };
  nakshatra: { name: string; pada: number };
  yoga: { name: string };
  karana: { name: string };
  sunrise: string;
  sunset: string;
  rahu_kaal: string;
  location: { lat: number; lon: number; city: string };
  ayanamsha: string;
  engine: string;
  version: string;
};

// ── Site config ──────────────────────────────────────────────────────
const SITE_URL = "https://trikalvaani.com";
const VM_BASE = "http://34.14.164.105:8001";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikal Vaani";

// ── Reserved slugs (avoid catch-all collisions) ──────────────────────
const RESERVED_SLUGS = new Set([
  "api", "app", "data", "events", "panchang", "predict", "upcoming-events",
  "career", "wealth", "health", "relationships", "family", "education",
  "home", "legal", "travel", "spirituality", "wellbeing", "marriage",
  "business", "foreign-settlement", "digital-career", "about", "contact",
  "privacy", "terms", "refund", "blog", "sitemap.xml", "robots.txt",
]);

// ── Static params ────────────────────────────────────────────────────
export async function generateStaticParams() {
  const cities = citiesData.cities as City[];
  return cities.map((c) => ({ city: c.slug }));
}

// ── Helpers ──────────────────────────────────────────────────────────
function findCity(slug: string): City | null {
  if (RESERVED_SLUGS.has(slug)) return null;
  const cities = citiesData.cities as City[];
  return cities.find((c) => c.slug === slug) || null;
}

async function fetchPanchang(city: City): Promise<Panchang | null> {
  try {
    const url = `${VM_BASE}/panchang/today?lat=${city.latitude}&lon=${city.longitude}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return (await res.json()) as Panchang;
  } catch {
    return null;
  }
}

function formatHumanDate(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ── Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { city: string } }
): Promise<Metadata> {
  const c = findCity(params.city);
  if (!c) return { title: "City Not Found | Trikal Vaani" };

  const title = `Aaj Ka Panchang ${c.name} | Tithi, Nakshatra, Sunrise, Rahu Kaal Today | Trikal Vaani`;
  const description =
    `Today's Vedic Panchang for ${c.name} (${c.name_hindi}). Get accurate ` +
    `Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset & Rahu Kaal for ` +
    `${c.name}, ${c.state}. Calculated using Swiss Ephemeris with Lahiri ` +
    `Ayanamsha. By Rohiit Gupta, Chief Vedic Architect.`;
  const url = `${SITE_URL}/${c.slug}/panchang`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Trikal Vaani", type: "article", locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

// ── JSON-LD ───────────────────────────────────────────────────────────
function buildWebPageSchema(c: City, p: Panchang | null, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Aaj Ka Panchang ${c.name}`,
    description: `Daily Vedic Panchang for ${c.name}, ${c.state}.`,
    url,
    inLanguage: "en-IN",
    isPartOf: { "@type": "WebSite", name: "Trikal Vaani", url: SITE_URL },
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      jobTitle: AUTHOR_TITLE,
      url: `${SITE_URL}/about`,
    },
    publisher: { "@type": "Organization", name: "Trikal Vaani", url: SITE_URL },
    about: {
      "@type": "Place",
      name: c.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: c.name,
        addressRegion: c.state,
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: c.latitude,
        longitude: c.longitude,
      },
    },
  };
}

function buildBreadcrumbSchema(c: City) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: c.name, item: `${SITE_URL}/${c.slug}` },
      { "@type": "ListItem", position: 3, name: "Panchang", item: `${SITE_URL}/${c.slug}/panchang` },
    ],
  };
}

function buildFAQSchema(c: City, p: Panchang | null) {
  if (!p) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the Tithi today in ${c.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The Tithi today in ${c.name} is ${p.tithi.name} of ${p.tithi.paksha}.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the Nakshatra today in ${c.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The Nakshatra today in ${c.name} is ${p.nakshatra.name}, Pada ${p.nakshatra.pada}.`,
        },
      },
      {
        "@type": "Question",
        name: `What is sunrise time in ${c.name} today?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Sunrise in ${c.name} today is at ${p.sunrise} IST and sunset at ${p.sunset} IST.`,
        },
      },
      {
        "@type": "Question",
        name: `What is Rahu Kaal in ${c.name} today?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Rahu Kaal in ${c.name} today is ${p.rahu_kaal}. Avoid auspicious work during this period.`,
        },
      },
    ],
  };
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function CityPanchangPage(
  { params }: { params: { city: string } }
) {
  const c = findCity(params.city);
  if (!c) notFound();

  const p = await fetchPanchang(c);
  const url = `${SITE_URL}/${c.slug}/panchang`;
  const human = p ? formatHumanDate(p.date) : "today";

  // GEO direct-answer block
  const geoAnswer = p
    ? `On ${human}, ${c.name} (${c.name_hindi}) panchang shows: Tithi ` +
      `${p.tithi.name} (${p.tithi.paksha}), Nakshatra ${p.nakshatra.name} ` +
      `Pada ${p.nakshatra.pada}, Yoga ${p.yoga.name}. Sunrise: ${p.sunrise}, ` +
      `Sunset: ${p.sunset}, Rahu Kaal: ${p.rahu_kaal}. Calculated for ` +
      `${c.name} coordinates with Swiss Ephemeris and Lahiri Ayanamsha.`
    : `Daily Vedic Panchang for ${c.name} (${c.name_hindi}), ${c.state}. ` +
      `Calculated using Swiss Ephemeris with city-specific coordinates ` +
      `(${c.latitude}°N, ${c.longitude}°E) for accurate sunrise, sunset, ` +
      `and Rahu Kaal timings.`;

  const faqSchema = buildFAQSchema(c, p);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebPageSchema(c, p, url)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(c)) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">

          <nav className="mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-700">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{c.name}</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Panchang</span>
          </nav>

          <header className="mb-6">
            <div className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              {c.state} · {c.language}
            </div>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gray-900">
              Aaj Ka Panchang — {c.name}
            </h1>
            <p className="mt-1 text-2xl text-gray-700">{c.name_hindi}</p>
            <p className="mt-3 text-sm text-gray-600">
              By <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} ·{" "}
              <span className="text-amber-700">Swiss Ephemeris · Lahiri Ayanamsha</span>
            </p>
          </header>

          <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Quick answer">
            <p className="text-base leading-relaxed text-gray-800">{geoAnswer}</p>
          </section>

          {p ? (
            <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">Tithi</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{p.tithi.name}</div>
                <div className="mt-1 text-xs text-gray-600">{p.tithi.paksha}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">Nakshatra</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{p.nakshatra.name}</div>
                <div className="mt-1 text-xs text-gray-600">Pada {p.nakshatra.pada}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">Yoga</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{p.yoga.name}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">Karana</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{p.karana.name}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">Sunrise</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{p.sunrise}</div>
                <div className="mt-1 text-xs text-gray-600">IST · {c.name}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">Sunset</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{p.sunset}</div>
                <div className="mt-1 text-xs text-gray-600">IST · {c.name}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:col-span-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Rahu Kaal</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{p.rahu_kaal}</div>
                <div className="mt-1 text-xs text-gray-600">Avoid auspicious work during this period</div>
              </div>
            </section>
          ) : (
            <section className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm text-gray-700">
                Live panchang data is loading. Please refresh in a moment.
              </p>
            </section>
          )}

          <section className="mb-8 prose prose-amber max-w-none">
            <h2 className="text-2xl font-semibold">About {c.name}</h2>
            <p>{c.description}</p>

            <h3 className="text-xl font-semibold">Famous Temples in {c.name}</h3>
            <ul>
              {c.famous_temples.map((temple, i) => (
                <li key={i}>{temple}</li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold">Why Local Panchang Matters</h3>
            <p>
              Sunrise, sunset, and Rahu Kaal timings vary by city based on
              latitude and longitude. Our panchang for {c.name} uses the city's
              precise coordinates ({c.latitude}°N, {c.longitude}°E) to calculate
              accurate timings with Swiss Ephemeris — the same engine used by
              professional astrologers worldwide. Anchored to the Lahiri
              Ayanamsha standard accepted by the Government of India.
            </p>
          </section>

          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">Get a personal Vedic reading in {c.name}</h2>
            <p className="mt-2 text-sm opacity-95">
              How will today's planetary positions affect YOUR birth chart? Get
              personalised Vedic predictions calibrated to your birth city. Free
              Tithi insight, ₹51 for full prediction.
            </p>
            <Link href="/predict" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Get My Prediction →
            </Link>
          </section>

          {p && (
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                Frequently Asked Questions
              </h2>
              <details className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">What is the Tithi today in {c.name}?</summary>
                <p className="mt-2 text-sm text-gray-700">The Tithi today in {c.name} is {p.tithi.name} of {p.tithi.paksha}.</p>
              </details>
              <details className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">What is the Nakshatra today in {c.name}?</summary>
                <p className="mt-2 text-sm text-gray-700">The Nakshatra today in {c.name} is {p.nakshatra.name}, Pada {p.nakshatra.pada}.</p>
              </details>
              <details className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">What is sunrise time in {c.name} today?</summary>
                <p className="mt-2 text-sm text-gray-700">Sunrise: {p.sunrise} IST, Sunset: {p.sunset} IST in {c.name}.</p>
              </details>
              <details className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">What is Rahu Kaal in {c.name} today?</summary>
                <p className="mt-2 text-sm text-gray-700">Rahu Kaal in {c.name} today is {p.rahu_kaal}. Avoid auspicious work during this period.</p>
              </details>
            </section>
          )}

          <section className="border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Panchang for Other Cities
            </h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              {(citiesData.cities as City[])
                .filter((other) => other.slug !== c.slug)
                .slice(0, 9)
                .map((other) => (
                  <li key={other.slug}>
                    <Link href={`/${other.slug}/panchang`} className="text-amber-700 hover:underline">
                      Panchang {other.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>

          <section className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href="/upcoming-events" className="text-amber-700 hover:underline">Upcoming Festivals</Link></li>
              <li>{p && <Link href={`/panchang/${p.date}`} className="text-amber-700 hover:underline">Panchang Archive</Link>}</li>
              <li><Link href="/career" className="text-amber-700 hover:underline">Career Astrology</Link></li>
              <li><Link href="/wealth" className="text-amber-700 hover:underline">Wealth Astrology</Link></li>
              <li><Link href="/marriage" className="text-amber-700 hover:underline">Marriage</Link></li>
              <li><Link href="/spirituality" className="text-amber-700 hover:underline">Spirituality</Link></li>
            </ul>
          </section>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>
              🔱 Calculated by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} for {c.name}.
              Engine: Swiss Ephemeris · Ayanamsha: Lahiri · Coordinates: {c.latitude}°N, {c.longitude}°E
            </p>
            <p className="mt-1 italic">
              &quot;Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye.&quot;
            </p>
          </footer>

        </div>
      </main>
    </>
  );
}
