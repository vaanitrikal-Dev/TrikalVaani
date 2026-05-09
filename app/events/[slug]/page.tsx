// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/events/[slug]/page.tsx
// Version:     v1.1
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
// Purpose:     Phase B2 — Festival Detail Pages (dynamic route)
//              URL: /events/diwali-2026
//              Target: 50 festival URLs Year 1
//              Data Source: app/data/festivals.json
// Stack:       Next.js 13.5 App Router + ISR (24h)
// SEO:         Event + FAQPage + BreadcrumbList schema
//              GEO: 50-word direct answer block at top
// E-E-A-T:     Author = Rohiit Gupta, Chief Vedic Architect
// Lock Status: gemini-prompt.ts = PERMANENTLY LOCKED (do not touch)
// Last Update: 2026-05-09 (Phase B2)
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import festivalsData from "../data/festivals.json";

// ── ISR ──────────────────────────────────────────────────────────────
export const revalidate = 86400;
export const dynamicParams = true;

// ── Types ────────────────────────────────────────────────────────────
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

// ── Site config ──────────────────────────────────────────────────────
const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikal Vaani";

// ── Static params ────────────────────────────────────────────────────
export async function generateStaticParams() {
  const festivals = festivalsData.festivals as Festival[];
  return festivals.slice(0, 12).map((f) => ({ slug: f.slug }));
}

// ── Helpers ──────────────────────────────────────────────────────────
function findFestival(slug: string): Festival | null {
  const festivals = festivalsData.festivals as Festival[];
  return festivals.find((f) => f.slug === slug) || null;
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

function getRelatedFestivals(currentSlug: string, count: number = 3): Festival[] {
  const festivals = festivalsData.festivals as Festival[];
  return festivals.filter((f) => f.slug !== currentSlug).slice(0, count);
}

// ── Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const f = findFestival(params.slug);
  if (!f) return { title: "Festival Not Found | Trikal Vaani" };

  const human = formatHumanDate(f.date);
  const title = `${f.name} 2026 | ${human} | Date, Muhurat, Puja Vidhi | Trikal Vaani`;
  const description =
    `${f.name} (${f.name_hindi}) 2026 falls on ${human}. ` +
    `Planetary ruler: ${f.planetary_ruler}. ${f.description} ` +
    `Authentic Vedic guide by Rohiit Gupta, Chief Vedic Architect.`;
  const url = `${SITE_URL}/events/${f.slug}`;

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
function buildEventSchema(f: Festival, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${f.name} 2026`,
    alternateName: f.name_hindi,
    startDate: f.date,
    endDate: f.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    description: f.description,
    location: { "@type": "Place", name: "Pan-India", address: { "@type": "PostalAddress", addressCountry: "IN" } },
    organizer: { "@type": "Organization", name: "Trikal Vaani", url: SITE_URL },
    url,
  };
}

function buildBreadcrumbSchema(f: Festival) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Events", item: `${SITE_URL}/upcoming-events` },
      { "@type": "ListItem", position: 3, name: f.name, item: `${SITE_URL}/events/${f.slug}` },
    ],
  };
}

function buildFAQSchema(f: Festival) {
  const human = formatHumanDate(f.date);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `When is ${f.name} 2026?`, acceptedAnswer: { "@type": "Answer", text: `${f.name} 2026 falls on ${human}.` } },
      { "@type": "Question", name: `What is the muhurat for ${f.name} 2026?`, acceptedAnswer: { "@type": "Answer", text: f.muhurat } },
      { "@type": "Question", name: `Who is the planetary ruler of ${f.name}?`, acceptedAnswer: { "@type": "Answer", text: `The planetary ruler of ${f.name} is ${f.planetary_ruler}.` } },
      { "@type": "Question", name: `What is the significance of ${f.name}?`, acceptedAnswer: { "@type": "Answer", text: f.significance } },
    ],
  };
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function EventDetailPage(
  { params }: { params: { slug: string } }
) {
  const f = findFestival(params.slug);
  if (!f) notFound();

  const url = `${SITE_URL}/events/${f.slug}`;
  const human = formatHumanDate(f.date);
  const related = getRelatedFestivals(f.slug, 3);

  const geoAnswer =
    `${f.name} (${f.name_hindi}) 2026 falls on ${human}. Planetary ruler: ` +
    `${f.planetary_ruler}. Auspicious muhurat: ${f.muhurat}. ${f.description} ` +
    `Get authentic Vedic guidance, dos & don'ts, and personal predictions based on your birth chart.`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildEventSchema(f, url)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(f)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQSchema(f)) }} />

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">

          <nav className="mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-700">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/upcoming-events" className="hover:text-amber-700">Events</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{f.name}</span>
          </nav>

          <header className="mb-6">
            <div className="text-sm font-semibold uppercase tracking-wide text-amber-700">{f.category}</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gray-900">{f.name} 2026</h1>
            <p className="mt-1 text-2xl text-gray-700">{f.name_hindi}</p>
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
              <div className="text-xs uppercase tracking-wide text-gray-500">Planetary Ruler</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{f.planetary_ruler}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:col-span-2">
              <div className="text-xs uppercase tracking-wide text-gray-500">Muhurat</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{f.muhurat}</div>
            </div>
          </section>

          <section className="mb-8 prose prose-amber max-w-none">
            <h2 className="text-2xl font-semibold">Significance</h2>
            <p>{f.significance}</p>
          </section>

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
            <h2 className="text-xl font-bold">Get a personal {f.name} reading</h2>
            <p className="mt-2 text-sm opacity-95">
              How will {f.name} energy affect YOUR birth chart? Free Tithi insight, ₹51 for full prediction.
            </p>
            <Link href="/predict" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Get My {f.name} Prediction →
            </Link>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            <details className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">When is {f.name} 2026?</summary>
              <p className="mt-2 text-sm text-gray-700">{f.name} 2026 falls on {human}.</p>
            </details>
            <details className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">What is the muhurat for {f.name} 2026?</summary>
              <p className="mt-2 text-sm text-gray-700">{f.muhurat}</p>
            </details>
            <details className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">Who is the planetary ruler of {f.name}?</summary>
              <p className="mt-2 text-sm text-gray-700">The planetary ruler of {f.name} is {f.planetary_ruler}.</p>
            </details>
            <details className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">What is the significance of {f.name}?</summary>
              <p className="mt-2 text-sm text-gray-700">{f.significance}</p>
            </details>
          </section>

          {related.length > 0 && (
            <section className="border-t border-gray-200 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Related Festivals</h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/events/${r.slug}`} className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-amber-300 hover:bg-amber-50">
                      <div className="font-semibold text-gray-900">{r.name}</div>
                      <div className="text-xs text-gray-600">{formatHumanDate(r.date)}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href="/upcoming-events" className="text-amber-700 hover:underline">All Festivals</Link></li>
              <li><Link href={`/panchang/${f.date}`} className="text-amber-700 hover:underline">Panchang for this day</Link></li>
              <li><Link href="/spirituality" className="text-amber-700 hover:underline">Spirituality</Link></li>
              <li><Link href="/marriage" className="text-amber-700 hover:underline">Marriage</Link></li>
              <li><Link href="/wealth" className="text-amber-700 hover:underline">Wealth</Link></li>
              <li><Link href="/career" className="text-amber-700 hover:underline">Career</Link></li>
            </ul>
          </section>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>🔱 Curated by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE}. Source: Vedic shastras, Drik Panchang, BPHS.</p>
            <p className="mt-1 italic">&quot;Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye.&quot;</p>
          </footer>

        </div>
      </main>
    </>
  );
}
