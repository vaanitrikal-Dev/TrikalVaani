// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/panchang/[date]/page.tsx
// Version:     v2.0
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
//
// FIXES vs v1.0:
//   1. Reads from Supabase panchang_daily first (primary source)
//   2. Falls back to GCP VM only if Supabase has no row for that date
//   3. Title NO LONGER ends with "| Trikal Vaani"
//      (layout.tsx template adds it automatically → was causing duplication)
//   4. VM endpoint corrected: /panchang?date= (not /panchang/today?date=)
//   5. Article schema datePublished uses actual date param (not hardcoded)
//   6. author url fixed: /founder (not /about)
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// ── ISR: regenerate every 24 hours ───────────────────────────────────
export const revalidate = 86400;
export const dynamicParams = true;

// ── Site config ──────────────────────────────────────────────────────
const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikal Vaani";
const VM_URL = "http://34.14.164.105:8001";

// ── Supabase client (anon — panchang_daily has public read RLS) ──────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Normalised shape used by the page ────────────────────────────────
type PanchangRow = {
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  vara: string;
  sunrise: string;
  sunset: string;
  rahu_kaal: string;
  geo_answer: string | null;
  seo_title: string | null;
  seo_description: string | null;
  faq_schema: object[] | null;
  gemini_content: string | null;
};

// ── VM response shape ────────────────────────────────────────────────
type VMPanchang = {
  date: string;
  weekday?: string;
  vara?: string;
  tithi: { name: string; paksha: string; index?: number };
  nakshatra: { name: string; pada: number };
  yoga: { name: string };
  karana: { name: string };
  sunrise: string;
  sunset: string;
  rahu_kaal: string;
  ayanamsha?: string;
  engine?: string;
  version?: string;
};

// ── Validation ───────────────────────────────────────────────────────
function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  if (isNaN(d.getTime())) return false;
  const y = d.getUTCFullYear();
  return y >= 2020 && y <= 2100;
}

// ── Format date for display ───────────────────────────────────────────
function formatHuman(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ── PRIMARY: fetch from Supabase ──────────────────────────────────────
async function fetchFromSupabase(date: string): Promise<PanchangRow | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("panchang_daily")
      .select("date,tithi,nakshatra,yoga,karana,vara,sunrise,sunset,rahu_kaal,geo_answer,seo_title,seo_description,faq_schema,gemini_content")
      .eq("date", date)
      .eq("city", "delhi")
      .single();

    if (error || !data) return null;
    return data as PanchangRow;
  } catch {
    return null;
  }
}

// ── FALLBACK: fetch from GCP VM ───────────────────────────────────────
async function fetchFromVM(date: string): Promise<PanchangRow | null> {
  try {
    const res = await fetch(`${VM_URL}/panchang?date=${date}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const vm = (await res.json()) as VMPanchang;

    const human = formatHuman(date);
    return {
      date,
      tithi: `${vm.tithi.name} (${vm.tithi.paksha})`,
      nakshatra: `${vm.nakshatra.name} Pada ${vm.nakshatra.pada}`,
      yoga: vm.yoga.name,
      karana: vm.karana.name,
      vara: vm.weekday ?? vm.vara ?? "",
      sunrise: vm.sunrise,
      sunset: vm.sunset,
      rahu_kaal: vm.rahu_kaal,
      geo_answer: `On ${human}, Tithi is ${vm.tithi.name} (${vm.tithi.paksha}), Nakshatra is ${vm.nakshatra.name} Pada ${vm.nakshatra.pada}, Yoga ${vm.yoga.name}, Karana ${vm.karana.name}. Sunrise: ${vm.sunrise}, Sunset: ${vm.sunset}, Rahu Kaal: ${vm.rahu_kaal} (Delhi NCR).`,
      seo_title: null,
      seo_description: null,
      faq_schema: null,
      gemini_content: null,
    };
  } catch {
    return null;
  }
}

// ── Main data fetcher (Supabase first, VM fallback) ───────────────────
async function getPanchang(date: string): Promise<PanchangRow | null> {
  const dbRow = await fetchFromSupabase(date);
  if (dbRow) return dbRow;
  return fetchFromVM(date);
}

// ── Metadata ─────────────────────────────────────────────────────────
// FIX: title does NOT end with "| Trikal Vaani"
// layout.tsx template "%s | Trikal Vaani" adds it automatically
export async function generateMetadata(
  { params }: { params: { date: string } }
): Promise<Metadata> {
  const { date } = params;
  if (!isValidDate(date)) return { title: "Panchang Not Found" };

  const human = formatHuman(date);
  const url = `${SITE_URL}/panchang/${date}`;

  // Use DB seo_title/description if available
  const db = await fetchFromSupabase(date);

  // FIX: no "| Trikal Vaani" at end — layout template adds it
  const title = db?.seo_title
    ? db.seo_title.replace(/\s*\|\s*Trikal Vaani\s*$/i, "")
    : `Aaj Ka Panchang ${human} | Tithi, Nakshatra, Rahu Kaal`;

  const description = db?.seo_description
    ?? `Vedic Panchang for ${human}: Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset & Rahu Kaal by Swiss Ephemeris Lahiri Ayanamsha. By Rohiit Gupta, Chief Vedic Architect.`;

  return {
    title,
    description,
    authors: [{ name: AUTHOR_NAME, url: `${SITE_URL}/founder` }],
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Trikal Vaani`,
      description,
      url,
      siteName: "Trikal Vaani",
      type: "article",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Trikal Vaani`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

// ── Schema builders ───────────────────────────────────────────────────
function articleSchema(p: PanchangRow, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Aaj Ka Panchang ${formatHuman(p.date)}`,
    description: `Vedic Panchang for ${p.date}: Tithi ${p.tithi}, Nakshatra ${p.nakshatra}, Yoga ${p.yoga}.`,
    datePublished: p.date,
    dateModified: p.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      jobTitle: AUTHOR_TITLE,
      url: `${SITE_URL}/founder`,
    },
    publisher: {
      "@type": "Organization",
      name: "Trikal Vaani",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
  };
}

function breadcrumbSchema(date: string) {
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

function faqSchema(p: PanchangRow) {
  // Use DB faq_schema if available
  if (p.faq_schema && p.faq_schema.length > 0) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faq_schema,
    };
  }
  // Build from fields
  const human = formatHuman(p.date);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the Tithi on ${human}?`,
        acceptedAnswer: { "@type": "Answer", text: `${p.tithi}, calculated using Swiss Ephemeris with Lahiri Ayanamsha.` },
      },
      {
        "@type": "Question",
        name: `What is the Nakshatra on ${human}?`,
        acceptedAnswer: { "@type": "Answer", text: `${p.nakshatra}.` },
      },
      {
        "@type": "Question",
        name: `What is Rahu Kaal on ${human}?`,
        acceptedAnswer: { "@type": "Answer", text: `Rahu Kaal is ${p.rahu_kaal} (Delhi NCR). Avoid auspicious work during this window.` },
      },
      {
        "@type": "Question",
        name: `What time is sunrise on ${human}?`,
        acceptedAnswer: { "@type": "Answer", text: `Sunrise: ${p.sunrise} IST, Sunset: ${p.sunset} IST (Delhi NCR).` },
      },
    ],
  };
}

// ── Page component ────────────────────────────────────────────────────
export default async function PanchangDatePage(
  { params }: { params: { date: string } }
) {
  const { date } = params;
  if (!isValidDate(date)) notFound();

  const p = await getPanchang(date);
  if (!p) notFound();

  const url = `${SITE_URL}/panchang/${date}`;
  const human = formatHuman(date);
  const geoAnswer = p.geo_answer
    ?? `On ${human}, Tithi is ${p.tithi}, Nakshatra is ${p.nakshatra}, Yoga ${p.yoga}, Karana ${p.karana}. Sunrise: ${p.sunrise}, Sunset: ${p.sunset}, Rahu Kaal: ${p.rahu_kaal} (Delhi NCR). Swiss Ephemeris, Lahiri Ayanamsha.`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(p, url)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(date)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(p)) }} />

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">

          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-700">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/panchang" className="hover:text-amber-700">Panchang</Link>
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

          {/* GEO direct-answer */}
          <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Quick answer">
            <p className="text-base leading-relaxed text-gray-800">{geoAnswer}</p>
          </section>

          {/* Panchang grid */}
          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card label="Tithi"     value={p.tithi} />
            <Card label="Nakshatra" value={p.nakshatra} />
            <Card label="Yoga"      value={p.yoga} />
            <Card label="Karana"    value={p.karana} />
            <Card label="Sunrise"   value={p.sunrise}   sub="IST" />
            <Card label="Sunset"    value={p.sunset}    sub="IST" />
            <Card label="Rahu Kaal" value={p.rahu_kaal} sub="Avoid auspicious work" />
            <Card label="Weekday"   value={p.vara} />
          </section>

          {/* Gemini content if available */}
          {p.gemini_content && (
            <section className="mb-8 prose prose-amber max-w-none">
              <h2 className="text-2xl font-semibold">Today's Vedic Insight</h2>
              <p>{p.gemini_content}</p>
            </section>
          )}

          {/* Static educational content */}
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
              <strong>{p.nakshatra}</strong> and the Tithi is{" "}
              <strong>{p.tithi}</strong>. All calculations on Trikal Vaani use
              the Swiss Ephemeris engine anchored to the Lahiri Ayanamsha
              standard accepted by the Government of India.
            </p>
          </section>

          {/* CTA */}
          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">Want a personal reading for today?</h2>
            <p className="mt-2 text-sm opacity-95">
              Get your personalised Vedic prediction based on your birth chart and
              today's planetary positions. Free Tithi insight, ₹51 for full prediction.
            </p>
            <Link href="/predict" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Get My Prediction →
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            <FAQ q={`What is the Tithi on ${human}?`}
                 a={`${p.tithi}, calculated using Swiss Ephemeris with Lahiri Ayanamsha.`} />
            <FAQ q={`What is the Nakshatra on ${human}?`}
                 a={`${p.nakshatra}.`} />
            <FAQ q={`What is Rahu Kaal on ${human}?`}
                 a={`Rahu Kaal is ${p.rahu_kaal} (Delhi NCR). Avoid starting auspicious work during this window.`} />
            <FAQ q={`What time is sunrise on ${human}?`}
                 a={`Sunrise: ${p.sunrise} IST, Sunset: ${p.sunset} IST (Delhi NCR).`} />
          </section>

          {/* Internal links */}
          <section className="border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href="/panchang" className="text-amber-700 hover:underline">Panchang Archive</Link></li>
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
              Engine: Swiss Ephemeris · Ayanamsha: Lahiri · Version: v2.0
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

// ── Sub-components ────────────────────────────────────────────────────
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
