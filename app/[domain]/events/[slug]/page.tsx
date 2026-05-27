// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/[domain]/events/[slug]/page.tsx
// Version:     v1.0
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
// Purpose:     Phase B4 — City + Festival Combo Pages
//              URL: /delhi/events/diwali-2026
//                   /mumbai/events/maha-shivratri-2026
//              Target: 10 cities × 50 festivals = 500 URLs
// Data:        cities.json + festivals.json (both already deployed)
// SEO:         Event + LocalBusiness + FAQPage + BreadcrumbList schema
//              GEO: 60-word direct answer block
//              Local intent: "diwali 2026 [city]", "muhurat in [city]"
// E-E-A-T:     Author = Rohiit Gupta, Chief Vedic Architect
// Lock Status: gemini-prompt.ts = PERMANENTLY LOCKED (do not touch)
// Last Update: 2026-05-09 (Phase B4)
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import citiesData from "../../../data/cities.json";
import festivalsData from "../../../data/festivals.json";

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

type Festival = {
  slug: string;
  name: string;
  name_hindi: string;
  date: string;
  category: string;
  planetary_ruler: string;
  description: string;
  significance: string;
  muhurat: string;
  dos: string[];
  donts: string[];
};

const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikal Vaani";

const CITY_SLUGS = new Set([
  "delhi", "mumbai", "noida", "gurgaon", "bangalore",
  "hyderabad", "pune", "kolkata", "chennai", "ahmedabad",
]);

// Pre-render top combos at build (top 3 cities × top 5 festivals = 15)
export async function generateStaticParams() {
  const cities = (citiesData.cities as City[]).slice(0, 3);
  const festivals = (festivalsData.festivals as Festival[]).slice(0, 5);
  const params: { domain: string; slug: string }[] = [];
  for (const c of cities) {
    for (const f of festivals) {
      params.push({ domain: c.slug, slug: f.slug });
    }
  }
  return params;
}

function findCity(slug: string): City | null {
  if (!CITY_SLUGS.has(slug)) return null;
  return (citiesData.cities as City[]).find((c) => c.slug === slug) || null;
}

function findFestival(slug: string): Festival | null {
  return (festivalsData.festivals as Festival[]).find((f) => f.slug === slug) || null;
}

function formatDate(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

export async function generateMetadata(
  { params }: { params: { domain: string; slug: string } }
): Promise<Metadata> {
  const c = findCity(params.domain);
  const f = findFestival(params.slug);
  if (!c || !f) return { title: "Not Found | Trikal Vaani" };

  const human = formatDate(f.date);
  const title = `${f.name} 2026 in ${c.name} | ${human} | Muhurat, Puja Vidhi, Temples | Trikal Vaani`;
  const description =
    `${f.name} (${f.name_hindi}) 2026 in ${c.name}, ${c.state} — ${human}. ` +
    `Muhurat: ${f.muhurat}. Famous temples: ${c.famous_temples.slice(0, 2).join(", ")}. ` +
    `By Rohiit Gupta, Chief Vedic Architect.`;
  const url = `${SITE_URL}/${c.slug}/events/${f.slug}`;

  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Trikal Vaani", type: "article", locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function CityFestivalPage(
  { params }: { params: { domain: string; slug: string } }
) {
  const c = findCity(params.domain);
  const f = findFestival(params.slug);
  if (!c || !f) notFound();

  const url = `${SITE_URL}/${c.slug}/events/${f.slug}`;
  const human = formatDate(f.date);

  // GEO direct answer (~60 words)
  const geoAnswer =
    `${f.name} 2026 in ${c.name} (${c.name_hindi}) falls on ${human}. ` +
    `Planetary ruler: ${f.planetary_ruler}. Auspicious muhurat: ${f.muhurat}. ` +
    `${f.description} Visit famous ${c.name} temples like ${c.famous_temples.slice(0, 2).join(" and ")} ` +
    `for darshan. Authentic Vedic guidance with ${c.name}-specific timings.`;

  // Schema: Event with location
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${f.name} 2026 in ${c.name}`,
    alternateName: f.name_hindi,
    startDate: f.date,
    endDate: f.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    description: f.description,
    location: {
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
    organizer: { "@type": "Organization", name: "Trikal Vaani", url: SITE_URL },
    url,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: c.name, item: `${SITE_URL}/${c.slug}` },
      { "@type": "ListItem", position: 3, name: "Events", item: `${SITE_URL}/${c.slug}/events` },
      { "@type": "ListItem", position: 4, name: f.name, item: url },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `When is ${f.name} 2026 in ${c.name}?`,
        acceptedAnswer: { "@type": "Answer", text: `${f.name} 2026 is celebrated in ${c.name} on ${human}.` },
      },
      {
        "@type": "Question",
        name: `What is the ${f.name} muhurat in ${c.name}?`,
        acceptedAnswer: { "@type": "Answer", text: `The ${f.name} muhurat in ${c.name} is ${f.muhurat}.` },
      },
      {
        "@type": "Question",
        name: `Which temples to visit on ${f.name} in ${c.name}?`,
        acceptedAnswer: { "@type": "Answer", text: `Famous temples to visit in ${c.name} on ${f.name}: ${c.famous_temples.join(", ")}.` },
      },
      {
        "@type": "Question",
        name: `Who is the planetary ruler of ${f.name}?`,
        acceptedAnswer: { "@type": "Answer", text: `The planetary ruler of ${f.name} is ${f.planetary_ruler}.` },
      },
    ],
  };

  // Other festivals in this city (cross-link)
  const otherFestivals = (festivalsData.festivals as Festival[])
    .filter((other) => other.slug !== f.slug)
    .slice(0, 6);

  // Same festival in other cities
  const otherCities = (citiesData.cities as City[])
    .filter((other) => other.slug !== c.slug)
    .slice(0, 6);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">

          <nav className="mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-700">Home</Link>
            <span className="mx-2">›</span>
            <Link href={`/${c.slug}/panchang`} className="hover:text-amber-700">{c.name}</Link>
            <span className="mx-2">›</span>
            <Link href="/upcoming-events" className="hover:text-amber-700">Events</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{f.name}</span>
          </nav>

          <header className="mb-6">
            <div className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              {f.category} · {c.state}
            </div>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gray-900">
              {f.name} 2026 in {c.name}
            </h1>
            <p className="mt-1 text-2xl text-gray-700">
              {f.name_hindi} · {c.name_hindi}
            </p>
            <p className="mt-3 text-sm text-gray-600">
              By <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE}
            </p>
          </header>

          <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Quick answer">
            <p className="text-base leading-relaxed text-gray-800">{geoAnswer}</p>
          </section>

          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">Date</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{human}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">City</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{c.name}, {c.state}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">Planetary Ruler</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{f.planetary_ruler}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">Category</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 capitalize">{f.category}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:col-span-2">
              <div className="text-xs uppercase tracking-wide text-gray-500">Muhurat in {c.name}</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{f.muhurat}</div>
              <div className="mt-1 text-xs text-gray-600">All times in IST · Adjusted for {c.name}</div>
            </div>
          </section>

          <section className="mb-8 prose prose-amber max-w-none">
            <h2 className="text-2xl font-semibold">Significance of {f.name}</h2>
            <p>{f.significance}</p>
          </section>

          {/* Famous temples in this city for this festival */}
          <section className="mb-8 rounded-xl border border-amber-200 bg-white p-5">
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              🛕 Where to celebrate {f.name} in {c.name}
            </h2>
            <p className="mb-3 text-sm text-gray-700">
              These temples in {c.name} are especially powerful during {f.name}:
            </p>
            <ul className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              {c.famous_temples.map((temple, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 text-amber-600">●</span>
                  <span>{temple}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Do's & Don'ts */}
          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <h2 className="mb-3 text-xl font-bold text-green-800">✓ Do&apos;s</h2>
              <ul className="space-y-2">
                {f.dos.map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-800">
                    <span className="mr-2 text-green-600">●</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h2 className="mb-3 text-xl font-bold text-red-800">✗ Don&apos;ts</h2>
              <ul className="space-y-2">
                {f.donts.map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-800">
                    <span className="mr-2 text-red-600">●</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">Personal {f.name} reading for {c.name}</h2>
            <p className="mt-2 text-sm opacity-95">
              How will {f.name} energy affect YOUR birth chart? Get personalised
              predictions calibrated to your birth city. Free Tithi insight, ₹51
              for full prediction.
            </p>
            <Link href="/predict" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Get My {f.name} Prediction →
            </Link>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>
            {[
              { q: `When is ${f.name} 2026 in ${c.name}?`, a: `${f.name} 2026 is celebrated in ${c.name} on ${human}.` },
              { q: `What is the ${f.name} muhurat in ${c.name}?`, a: `The ${f.name} muhurat in ${c.name} is ${f.muhurat}.` },
              { q: `Which temples to visit on ${f.name} in ${c.name}?`, a: `Famous temples in ${c.name}: ${c.famous_temples.join(", ")}.` },
              { q: `Who is the planetary ruler of ${f.name}?`, a: `The planetary ruler of ${f.name} is ${f.planetary_ruler}.` },
            ].map((item) => (
              <details key={item.q} className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">{item.q}</summary>
                <p className="mt-2 text-sm text-gray-700">{item.a}</p>
              </details>
            ))}
          </section>

          {/* Same festival in other cities */}
          <section className="border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              {f.name} in Other Cities
            </h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              {otherCities.map((other) => (
                <li key={other.slug}>
                  <Link href={`/${other.slug}/events/${f.slug}`} className="text-amber-700 hover:underline">
                    {f.name} in {other.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Other festivals in this city */}
          <section className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Other Festivals in {c.name}
            </h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              {otherFestivals.map((other) => (
                <li key={other.slug}>
                  <Link href={`/${c.slug}/events/${other.slug}`} className="text-amber-700 hover:underline">
                    {other.name} in {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href={`/${c.slug}/panchang`} className="text-amber-700 hover:underline">Panchang {c.name}</Link></li>
              <li><Link href={`/events/${f.slug}`} className="text-amber-700 hover:underline">{f.name} (All-India)</Link></li>
              <li><Link href={`/panchang/${f.date}`} className="text-amber-700 hover:underline">Panchang for this Day</Link></li>
              <li><Link href="/upcoming-events" className="text-amber-700 hover:underline">All Festivals</Link></li>
              <li><Link href="/spirituality" className="text-amber-700 hover:underline">Spirituality</Link></li>
              <li><Link href="/marriage" className="text-amber-700 hover:underline">Marriage</Link></li>
            </ul>
          </section>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>
              🔱 Curated by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} for {c.name} ({c.latitude}°N, {c.longitude}°E).
              Source: Vedic shastras, Drik Panchang, BPHS.
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
