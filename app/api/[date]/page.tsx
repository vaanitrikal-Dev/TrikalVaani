// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/panchang/[date]/page.tsx
// Version:     v1.0
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
// Purpose:     Phase B1 — Daily Panchang Archive (dynamic route)
//              URL: /panchang/2026-05-09
//              Target: 365 URLs Year 1
// Stack:       Next.js 13.5 App Router + ISR (24h)
// SEO:         FAQPage + BreadcrumbList + Article schema
//              GEO: 50-word direct answer block at top
// E-E-A-T:     Author = Rohiit Gupta, Chief Vedic Architect
// Lock Status: gemini-prompt.ts = PERMANENTLY LOCKED (do not touch)
// Last Update: 2026-05-09 (Phase B1)
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

// ── ISR: regenerate every 24 hours ───────────────────────────────────
export const revalidate = 86400;
export const dynamicParams = true;

// ── Types ────────────────────────────────────────────────────────────
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
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikal Vaani";

// ── Validation ───────────────────────────────────────────────────────
function isValidDateFormat(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  if (isNaN(d.getTime())) return false;
  const y = d.getUTCFullYear();
  return y >= 1950 && y <= 2100;
}

// ── Data fetch ───────────────────────────────────────────────────────
async function fetchPanchang(date: string): Promise<Panchang | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : SITE_URL;

  try {
    const res = await fetch(`${baseUrl}/api/panchang/today?date=${date}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return (await res.json()) as Panchang;
  } catch {
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────
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

// ── Metadata (dynamic) ───────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { date: string } },
): Promise<Metadata> {
  const { date } = params;
  if (!isValidDateFormat(date)) {
    return { title: "Panchang Not Found | Trikal Vaani" };
  }

  const human = formatHumanDate(date);
  const title = `Aaj Ka Panchang ${human} | Tithi, Nakshatra, Rahu Kaal | Trikal Vaani`;
  const description =
    `Authentic Vedic Panchang for ${human}. Get accurate Tithi, Nakshatra, ` +
    `Yoga, Karana, Sunrise, Sunset & Rahu Kaal calculated using Swiss ` +
    `Ephemeris with Lahiri Ayanamsha. By Rohiit Gupta, Chief Vedic Architect.`;

  const url = `${SITE_URL}/panchang/${date}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Trikal Vaani",
      type: "article",
      locale: "en_IN",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

// ── JSON-LD builders ─────────────────────────────────────────────────
function buildArticleSchema(p: Panchang, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Aaj Ka Panchang ${formatHumanDate(p.date)}`,
    description: `Vedic Panchang for ${p.date}: Tithi ${p.tithi.name}, Nakshatra ${p.nakshatra.name}, Yoga ${p.yoga.name}.`,
    datePublished: p.date,
    dateModified: p.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      jobTitle: AUTHOR_TITLE,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Trikal Vaani",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

function buildBreadcrumbSchema(date: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Panchang", item: `${SITE_URL}/panchang` },
      { "@type": "ListItem", position: 3, name: date, item: `${SITE_URL}/panchang/${date}` },
    ],
  };
}

function buildFAQSchema(p: Panchang) {
  const human = formatHumanDate(p.date);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the Tithi on ${human}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The Tithi on ${human} is ${p.tithi.name} of ${p.tithi.paksha}, calculated using Swiss Ephemeris with Lahiri Ayanamsha.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the Nakshatra on ${human}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The Nakshatra on ${human} is ${p.nakshatra.name}, Pada ${p.nakshatra.pada}.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the Rahu Kaal on ${human}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Rahu Kaal on ${human} is ${p.rahu_kaal} (Delhi NCR). Avoid starting auspicious work during this period.`,
        },
      },
      {
        "@type": "Question",
        name: `What time is sunrise on ${human}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Sunrise on ${human} is at ${p.sunrise} IST and sunset at ${p.sunset} IST (Delhi NCR coordinates).`,
        },
      },
    ],
  };
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function PanchangDatePage(
  { params }: { params: { date: string } },
) {
  const { date } = params;

  if (!isValidDateFormat(date)) notFound();

  const p = await fetchPanchang(date);
  if (!p) notFound();

  const url = `${SITE_URL}/panchang/${date}`;
  const human = formatHumanDate(date);

  // GEO direct-answer block (50 words)
  const geoAnswer =
    `On ${human}, the Tithi is ${p.tithi.name} (${p.tithi.paksha}), ` +
    `Nakshatra is ${p.nakshatra.name} Pada ${p.nakshatra.pada}, Yoga is ` +
    `${p.yoga.name}, and Karana is ${p.karana.name}. Sunrise: ${p.sunrise}, ` +
    `Sunset: ${p.sunset}, Rahu Kaal: ${p.rahu_kaal} (Delhi NCR). ` +
    `Calculated with Swiss Ephemeris, Lahiri Ayanamsha.`;

  return (
    <>
      {/* JSON-LD schema injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleSchema(p, url)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(date)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQSchema(p)) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">

          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-700">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/upcoming-events" className="hover:text-amber-700">Panchang</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{date}</span>
          </nav>

          {/* H1 */}
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Aaj Ka Panchang — {human}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              By <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} ·{" "}
              <span className="text-amber-700">Swiss Ephemeris · Lahiri Ayanamsha</span>
            </p>
          </header>

          {/* GEO direct-answer block */}
          <section
            className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5"
            aria-label="Quick answer"
          >
            <p className="text-base leading-relaxed text-gray-800">{geoAnswer}</p>
          </section>

          {/* Panchang grid */}
          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card label="Tithi" value={p.tithi.name} sub={p.tithi.paksha} />
            <Card label="Nakshatra" value={p.nakshatra.name} sub={`Pada ${p.nakshatra.pada}`} />
            <Card label="Yoga" value={p.yoga.name} />
            <Card label="Karana" value={p.karana.name} />
            <Card label="Sunrise" value={p.sunrise} sub="IST" />
            <Card label="Sunset" value={p.sunset} sub="IST" />
            <Card label="Rahu Kaal" value={p.rahu_kaal} sub="Avoid auspicious work" />
            <Card label="Weekday" value={p.weekday} />
          </section>

          {/* Educational Vedic content */}
          <section className="mb-8 prose prose-amber max-w-none">
            <h2 className="text-2xl font-semibold">Understanding Today's Panchang</h2>
            <p>
              The Panchang is the traditional Vedic almanac that records five key
              limbs (paňca-aṅga) of cosmic time: Tithi, Nakshatra, Yoga, Karana,
              and Vaar (weekday). Together they reveal the planetary mood of the
              day and guide auspicious timing (Muhurta) for important decisions.
            </p>
            <p>
              On <strong>{human}</strong>, the Moon resides in{" "}
              <strong>{p.nakshatra.name}</strong> Nakshatra and the Tithi is{" "}
              <strong>{p.tithi.name}</strong> of <strong>{p.tithi.paksha}</strong>.
              All calculations on Trikal Vaani use the Swiss Ephemeris engine —
              the same precision system used by professional astrologers worldwide
              — anchored to the Lahiri Ayanamsha standard accepted by the
              Government of India.
            </p>
          </section>

          {/* CTA — personal prediction */}
          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">Want a personal reading for today?</h2>
            <p className="mt-2 text-sm opacity-95">
              Get your personalised Vedic prediction based on your birth chart and
              today's planetary positions. Free Tithi insight, ₹51 for full prediction.
            </p>
            <Link
              href="/predict"
              className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50"
            >
              Get My Prediction →
            </Link>
          </section>

          {/* FAQ — visible to humans, also schema'd */}
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>
            <FAQ q={`What is the Tithi on ${human}?`}
                 a={`The Tithi is ${p.tithi.name} of ${p.tithi.paksha}, calculated using Swiss Ephemeris with Lahiri Ayanamsha.`} />
            <FAQ q={`What is the Nakshatra on ${human}?`}
                 a={`The Nakshatra is ${p.nakshatra.name}, Pada ${p.nakshatra.pada}.`} />
            <FAQ q={`What is the Rahu Kaal on ${human}?`}
                 a={`Rahu Kaal is ${p.rahu_kaal} (Delhi NCR). Avoid starting auspicious work during this window.`} />
            <FAQ q={`What time is sunrise on ${human}?`}
                 a={`Sunrise: ${p.sunrise} IST, Sunset: ${p.sunset} IST (Delhi NCR).`} />
          </section>

          {/* Internal link cluster */}
          <section className="border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href="/upcoming-events" className="text-amber-700 hover:underline">Upcoming Events</Link></li>
              <li><Link href="/career" className="text-amber-700 hover:underline">Career Astrology</Link></li>
              <li><Link href="/wealth" className="text-amber-700 hover:underline">Wealth Astrology</Link></li>
              <li><Link href="/marriage" className="text-amber-700 hover:underline">Marriage Astrology</Link></li>
              <li><Link href="/health" className="text-amber-700 hover:underline">Health Astrology</Link></li>
              <li><Link href="/spirituality" className="text-amber-700 hover:underline">Spirituality</Link></li>
            </ul>
          </section>

          {/* Trust footer */}
          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>
              🔱 Calculated by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE}.
              Engine: {p.engine} · Ayanamsha: {p.ayanamsha} · Version: {p.version}
            </p>
            <p className="mt-1 italic">
              "Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye."
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────────
function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-gray-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-600">{sub}</div>}
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
      <summary className="cursor-pointer font-medium text-gray-900">{q}</summary>
      <p className="mt-2 text-sm text-gray-700">{a}</p>
    </details>
  );
}
