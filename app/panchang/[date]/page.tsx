// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    app/panchang/[date]/page.tsx
// Version: v3.0
// Owner:   Rohiit Gupta, Chief Vedic Architect
// Changes vs v2.1:
//   1. If date has a festival → 301 redirect to /panchang/[date]/[slug]
//   2. All FESTIVALS hardcoded record REMOVED — fully dynamic from Supabase
//   3. On-demand VM fetch for future dates not in DB
//   4. Clean panchang-only page for non-festival dates
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 86400;
export const dynamicParams = true;

const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikal Vaani";
const VM_URL = "http://34.14.164.105:8001";

// ── Types ─────────────────────────────────────────────────────────────
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
  festival_slug: string | null;
  festival_name: string | null;
};

type VMPanchang = {
  date: string;
  weekday?: string;
  vara?: string;
  tithi: { name: string; paksha: string };
  nakshatra: { name: string; pada: number };
  yoga: { name: string };
  karana: { name: string };
  sunrise: string;
  sunset: string;
  rahu_kaal: string;
};

// ── Helpers ───────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  if (isNaN(d.getTime())) return false;
  return d.getUTCFullYear() >= 2020 && d.getUTCFullYear() <= 2100;
}

function formatHuman(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

async function fetchFromSupabase(date: string): Promise<PanchangRow | null> {
  try {
    const { data, error } = await getSupabase()
      .from("panchang_daily")
      .select("date,tithi,nakshatra,yoga,karana,vara,sunrise,sunset,rahu_kaal,geo_answer,seo_title,seo_description,faq_schema,gemini_content,festival_slug,festival_name")
      .eq("date", date).eq("city", "delhi").single();
    if (error || !data) return null;
    return data as PanchangRow;
  } catch { return null; }
}

async function fetchFromVM(date: string): Promise<PanchangRow | null> {
  try {
    const res = await fetch(`${VM_URL}/panchang?date=${date}`, {
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const vm = (await res.json()) as VMPanchang;

    // Also check festivals_master for this date
    const { data: festData } = await getSupabase()
      .from("festivals_master")
      .select("festival_name,festival_slug")
      .eq("date", date)
      .eq("festival_type", "major")
      .order("id", { ascending: true })
      .limit(1)
      .single();

    const human = formatHuman(date);
    return {
      date,
      tithi: `${vm.tithi.name} (${vm.tithi.paksha})`,
      nakshatra: `${vm.nakshatra.name} Pada ${vm.nakshatra.pada}`,
      yoga: vm.yoga.name, karana: vm.karana.name,
      vara: vm.weekday ?? vm.vara ?? "",
      sunrise: vm.sunrise, sunset: vm.sunset, rahu_kaal: vm.rahu_kaal,
      geo_answer: `On ${human}, Tithi is ${vm.tithi.name} (${vm.tithi.paksha}), Nakshatra is ${vm.nakshatra.name} Pada ${vm.nakshatra.pada}, Yoga ${vm.yoga.name}. Sunrise: ${vm.sunrise}, Sunset: ${vm.sunset}, Rahu Kaal: ${vm.rahu_kaal} (Delhi NCR). Swiss Ephemeris, Lahiri Ayanamsha.`,
      seo_title: null, seo_description: null, faq_schema: null, gemini_content: null,
      festival_slug: festData?.festival_slug ?? null,
      festival_name: festData?.festival_name ?? null,
    };
  } catch { return null; }
}

async function getPanchang(date: string): Promise<PanchangRow | null> {
  return (await fetchFromSupabase(date)) ?? (await fetchFromVM(date));
}

// ── Metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { date: string } }
): Promise<Metadata> {
  const { date } = params;
  if (!isValidDate(date)) return { title: "Panchang Not Found" };

  const p = await fetchFromSupabase(date);
  const human = formatHuman(date);
  const url = `${SITE_URL}/panchang/${date}`;

  const title = p?.seo_title?.replace(/\s*\|\s*Trikal Vaani\s*$/i, "")
    ?? `Aaj Ka Panchang ${human} | Tithi, Nakshatra, Rahu Kaal`;

  const description = p?.seo_description
    ?? `Vedic Panchang for ${human}: Tithi ${p?.tithi ?? ""}, Nakshatra ${p?.nakshatra ?? ""}, Rahu Kaal ${p?.rahu_kaal ?? ""}. Swiss Ephemeris, Lahiri Ayanamsha. By Rohiit Gupta, Chief Vedic Architect.`;

  return {
    title, description,
    authors: [{ name: AUTHOR_NAME, url: `${SITE_URL}/founder` }],
    alternates: { canonical: url },
    openGraph: { title: `${title} | Trikal Vaani`, description, url, siteName: "Trikal Vaani", type: "article", locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function PanchangDatePage(
  { params }: { params: { date: string } }
) {
  const { date } = params;
  if (!isValidDate(date)) notFound();

  const p = await getPanchang(date);

  // ── REDIRECT: If festival exists → go to slug page (301) ──────────
  if (p?.festival_slug) {
    redirect(`/panchang/${date}/${p.festival_slug}`);
  }

  const url = `${SITE_URL}/panchang/${date}`;
  const human = formatHuman(date);

  // No data + no festival
  if (!p) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-20">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="text-5xl mb-6">🔱</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Panchang for {human}</h1>
          <p className="text-gray-600 mb-2">
            This date&apos;s panchang is being computed by our Swiss Ephemeris engine.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Daily panchang is generated at 4:00 AM IST. Please check back shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/panchang" className="rounded-lg bg-amber-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-amber-700">
              ← View Today&apos;s Panchang
            </Link>
            <Link href="/predict" className="rounded-lg border border-amber-300 text-amber-700 px-5 py-2.5 text-sm font-semibold hover:bg-amber-50">
              Get Personal Reading →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Schemas ───────────────────────────────────────────────────────
  const faqItems = p.faq_schema?.length ? p.faq_schema : [
    { "@type": "Question", name: `What is the Tithi on ${human}?`, acceptedAnswer: { "@type": "Answer", text: `${p.tithi}, Swiss Ephemeris, Lahiri Ayanamsha.` } },
    { "@type": "Question", name: `What is Rahu Kaal on ${human}?`, acceptedAnswer: { "@type": "Answer", text: `Rahu Kaal is ${p.rahu_kaal} (Delhi NCR). Avoid auspicious work during this window.` } },
    { "@type": "Question", name: `What is the Nakshatra on ${human}?`, acceptedAnswer: { "@type": "Answer", text: `${p.nakshatra}.` } },
    { "@type": "Question", name: `What time is sunrise on ${human}?`, acceptedAnswer: { "@type": "Answer", text: `Sunrise: ${p.sunrise} IST, Sunset: ${p.sunset} IST (Delhi NCR).` } },
  ];

  const schemas = [
    {
      "@context": "https://schema.org", "@type": "Article",
      headline: `Aaj Ka Panchang ${human}`,
      description: p.geo_answer ?? `Vedic Panchang for ${date}`,
      datePublished: date, dateModified: date,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Person", name: AUTHOR_NAME, jobTitle: AUTHOR_TITLE, url: `${SITE_URL}/founder` },
      publisher: { "@type": "Organization", name: "Trikal Vaani", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Panchang", item: `${SITE_URL}/panchang` },
        { "@type": "ListItem", position: 3, name: human, item: url },
      ],
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems },
  ];

  const geoAnswer = p.geo_answer ?? `Vedic Panchang for ${human}. Tithi: ${p.tithi}. Nakshatra: ${p.nakshatra}. Rahu Kaal: ${p.rahu_kaal}. Swiss Ephemeris, Lahiri Ayanamsha.`;

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">

          <nav className="mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-700">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/panchang" className="hover:text-amber-700">Panchang</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{human}</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Aaj Ka Panchang — {human}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              By <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} ·{" "}
              <span className="text-amber-700">Swiss Ephemeris · Lahiri Ayanamsha</span>
            </p>
          </header>

          <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Quick answer">
            <p className="text-base leading-relaxed text-gray-800">{geoAnswer}</p>
          </section>

          {/* Panchang Grid */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Panchang Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card label="Tithi"     value={p.tithi} />
              <Card label="Nakshatra" value={p.nakshatra} />
              <Card label="Yoga"      value={p.yoga} />
              <Card label="Karana"    value={p.karana} />
              <Card label="Sunrise"   value={p.sunrise} sub="IST" />
              <Card label="Sunset"    value={p.sunset} sub="IST" />
              <Card label="Rahu Kaal" value={p.rahu_kaal} sub="Avoid auspicious work" />
              <Card label="Weekday"   value={p.vara} />
            </div>
          </section>

          {p.gemini_content && (
            <section className="mb-8 prose prose-amber max-w-none">
              <h2 className="text-2xl font-semibold">Vedic Insight for This Day</h2>
              <p>{p.gemini_content}</p>
            </section>
          )}

          <section className="mb-8 prose prose-amber max-w-none">
            <h2 className="text-2xl font-semibold">Understanding This Day&apos;s Panchang</h2>
            <p>
              The Panchang records five cosmic elements — Tithi, Nakshatra, Yoga, Karana, and Vara.
              On <strong>{human}</strong>, the Moon is in <strong>{p.nakshatra}</strong> and the Tithi
              is <strong>{p.tithi}</strong>. All calculations use Swiss Ephemeris anchored to Lahiri
              Ayanamsha — the standard accepted by the Government of India.
            </p>
          </section>

          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">Want a personal reading for this day?</h2>
            <p className="mt-2 text-sm opacity-95">
              Based on your birth chart and today&apos;s planetary positions. Free preview, ₹51 for full analysis.
            </p>
            <Link href="/predict" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Start Free Reading →
            </Link>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            <FAQ q={`What is the Tithi on ${human}?`} a={`${p.tithi}, calculated using Swiss Ephemeris with Lahiri Ayanamsha.`} />
            <FAQ q={`What is the Nakshatra on ${human}?`} a={`${p.nakshatra}.`} />
            <FAQ q={`What is Rahu Kaal on ${human}?`} a={`Rahu Kaal is ${p.rahu_kaal} (Delhi NCR). Avoid auspicious work during this window.`} />
            <FAQ q={`What time is sunrise on ${human}?`} a={`Sunrise: ${p.sunrise} IST, Sunset: ${p.sunset} IST (Delhi NCR).`} />
          </section>

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

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>🔱 Calculated by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE}. Engine: Swiss Ephemeris · Ayanamsha: Lahiri · Version: v3.0</p>
            <p className="mt-1 italic">&quot;Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye.&quot;</p>
          </footer>

        </div>
      </main>
    </>
  );
}

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
