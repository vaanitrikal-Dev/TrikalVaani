// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/[domain]/panchang/page.tsx
// Version:     v1.1
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
// Purpose:     Phase B3 — City Panchang Pages
//              URL: /delhi/panchang, /mumbai/panchang
//              Uses [domain] param (matches existing app/[domain] folder)
// Lock Status: gemini-prompt.ts = PERMANENTLY LOCKED (do not touch)
// Last Update: 2026-05-09 (Phase B3)
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import citiesData from "../data/cities.json";

export const revalidate = 86400;
export const dynamicParams = true;

type City = {
  slug: string;
  name: string;
  name_hindi: string;
  state: string;
  latitude: number;
  longitude: number;
  description: string;
  famous_temples: string[];
  language: string;
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
};

const SITE_URL = "https://trikalvaani.com";
const VM_BASE = "http://34.14.164.105:8001";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikal Vaani";

// Only match known city slugs — ignore all other [domain] routes
const CITY_SLUGS = new Set([
  "delhi", "mumbai", "noida", "gurgaon", "bangalore",
  "hyderabad", "pune", "kolkata", "chennai", "ahmedabad",
]);

export async function generateStaticParams() {
  return (citiesData.cities as City[]).map((c) => ({ domain: c.slug }));
}

function findCity(slug: string): City | null {
  if (!CITY_SLUGS.has(slug)) return null;
  return (citiesData.cities as City[]).find((c) => c.slug === slug) || null;
}

async function fetchPanchang(city: City): Promise<Panchang | null> {
  try {
    const res = await fetch(
      `${VM_BASE}/panchang/today?lat=${city.latitude}&lon=${city.longitude}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    return (await res.json()) as Panchang;
  } catch {
    return null;
  }
}

function formatDate(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

export async function generateMetadata(
  { params }: { params: { domain: string } }
): Promise<Metadata> {
  const c = findCity(params.domain);
  if (!c) return { title: "Not Found" };
  const title = `Aaj Ka Panchang ${c.name} | Tithi, Nakshatra, Rahu Kaal Today | Trikal Vaani`;
  const description = `Today's Vedic Panchang for ${c.name} (${c.name_hindi}), ${c.state}. Accurate Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset & Rahu Kaal. Swiss Ephemeris · Lahiri Ayanamsha. By Rohiit Gupta.`;
  const url = `${SITE_URL}/${c.slug}/panchang`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Trikal Vaani", type: "article", locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function CityPanchangPage(
  { params }: { params: { domain: string } }
) {
  const c = findCity(params.domain);
  if (!c) notFound();

  const p = await fetchPanchang(c);
  const url = `${SITE_URL}/${c.slug}/panchang`;
  const human = p ? formatDate(p.date) : "Today";

  const geoAnswer = p
    ? `${c.name} (${c.name_hindi}) panchang today: Tithi ${p.tithi.name} (${p.tithi.paksha}), Nakshatra ${p.nakshatra.name} Pada ${p.nakshatra.pada}, Yoga ${p.yoga.name}. Sunrise: ${p.sunrise}, Sunset: ${p.sunset}, Rahu Kaal: ${p.rahu_kaal}. Calculated for ${c.name} coordinates using Swiss Ephemeris, Lahiri Ayanamsha.`
    : `Daily Vedic Panchang for ${c.name} (${c.name_hindi}), ${c.state}. City-specific sunrise, sunset and Rahu Kaal timings using Swiss Ephemeris.`;

  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: c.name, item: `${SITE_URL}/${c.slug}` },
      { "@type": "ListItem", position: 3, name: "Panchang", item: url },
    ],
  };

  const faq = p ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `What is Tithi today in ${c.name}?`, acceptedAnswer: { "@type": "Answer", text: `Tithi today in ${c.name} is ${p.tithi.name} of ${p.tithi.paksha}.` } },
      { "@type": "Question", name: `What is Nakshatra today in ${c.name}?`, acceptedAnswer: { "@type": "Answer", text: `Nakshatra today in ${c.name} is ${p.nakshatra.name}, Pada ${p.nakshatra.pada}.` } },
      { "@type": "Question", name: `What is sunrise time in ${c.name} today?`, acceptedAnswer: { "@type": "Answer", text: `Sunrise in ${c.name} is ${p.sunrise} IST, sunset at ${p.sunset} IST.` } },
      { "@type": "Question", name: `What is Rahu Kaal in ${c.name} today?`, acceptedAnswer: { "@type": "Answer", text: `Rahu Kaal in ${c.name} today is ${p.rahu_kaal}. Avoid auspicious work during this time.` } },
    ],
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />}

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
            <div className="text-sm font-semibold uppercase tracking-wide text-amber-700">{c.state}</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gray-900">Aaj Ka Panchang — {c.name}</h1>
            <p className="mt-1 text-2xl text-gray-700">{c.name_hindi}</p>
            <p className="mt-3 text-sm text-gray-600">
              By <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} ·{" "}
              <span className="text-amber-700">Swiss Ephemeris · Lahiri Ayanamsha</span>
            </p>
          </header>

          <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-base leading-relaxed text-gray-800">{geoAnswer}</p>
          </section>

          {p ? (
            <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { label: "Tithi", value: p.tithi.name, sub: p.tithi.paksha },
                { label: "Nakshatra", value: p.nakshatra.name, sub: `Pada ${p.nakshatra.pada}` },
                { label: "Yoga", value: p.yoga.name },
                { label: "Karana", value: p.karana.name },
                { label: "Sunrise", value: p.sunrise, sub: `IST · ${c.name}` },
                { label: "Sunset", value: p.sunset, sub: `IST · ${c.name}` },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-gray-500">{item.label}</div>
                  <div className="mt-1 text-xl font-semibold text-gray-900">{item.value}</div>
                  {item.sub && <div className="mt-1 text-xs text-gray-600">{item.sub}</div>}
                </div>
              ))}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:col-span-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Rahu Kaal</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{p.rahu_kaal}</div>
                <div className="mt-1 text-xs text-gray-600">Avoid auspicious work during this period</div>
              </div>
            </section>
          ) : (
            <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700">
              Live data loading — please refresh.
            </div>
          )}

          <section className="mb-8 prose prose-amber max-w-none">
            <h2 className="text-2xl font-semibold">About {c.name}</h2>
            <p>{c.description}</p>
            <h3 className="text-xl font-semibold">Famous Temples in {c.name}</h3>
            <ul>{c.famous_temples.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </section>

          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">Get your personal Vedic reading — {c.name}</h2>
            <p className="mt-2 text-sm opacity-95">Personalised predictions based on today's planets + your birth chart. Free Tithi insight, ₹51 for full report.</p>
            <Link href="/predict" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Get My Prediction →
            </Link>
          </section>

          {p && (
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
              {[
                { q: `What is Tithi today in ${c.name}?`, a: `Tithi today is ${p.tithi.name} of ${p.tithi.paksha}.` },
                { q: `What is Nakshatra today in ${c.name}?`, a: `Nakshatra today is ${p.nakshatra.name}, Pada ${p.nakshatra.pada}.` },
                { q: `What is sunrise in ${c.name} today?`, a: `Sunrise: ${p.sunrise} IST, Sunset: ${p.sunset} IST.` },
                { q: `What is Rahu Kaal in ${c.name} today?`, a: `Rahu Kaal is ${p.rahu_kaal}. Avoid auspicious work.` },
              ].map((item) => (
                <details key={item.q} className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
                  <summary className="cursor-pointer font-medium text-gray-900">{item.q}</summary>
                  <p className="mt-2 text-sm text-gray-700">{item.a}</p>
                </details>
              ))}
            </section>
          )}

          <section className="border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Panchang for Other Cities</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              {(citiesData.cities as City[]).filter((o) => o.slug !== c.slug).map((o) => (
                <li key={o.slug}>
                  <Link href={`/${o.slug}/panchang`} className="text-amber-700 hover:underline">
                    {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href="/upcoming-events" className="text-amber-700 hover:underline">Upcoming Festivals</Link></li>
              <li><Link href="/career" className="text-amber-700 hover:underline">Career Astrology</Link></li>
              <li><Link href="/wealth" className="text-amber-700 hover:underline">Wealth Astrology</Link></li>
              <li><Link href="/marriage" className="text-amber-700 hover:underline">Marriage</Link></li>
              <li><Link href="/health" className="text-amber-700 hover:underline">Health</Link></li>
              <li><Link href="/spirituality" className="text-amber-700 hover:underline">Spirituality</Link></li>
            </ul>
          </section>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>🔱 Calculated by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} for {c.name} ({c.latitude}°N, {c.longitude}°E).</p>
            <p className="mt-1 italic">&quot;Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye.&quot;</p>
          </footer>

        </div>
      </main>
    </>
  );
}
