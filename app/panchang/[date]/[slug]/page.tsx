// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    app/panchang/[date]/[slug]/page.tsx
// Version: v1.0
// Owner:   Rohiit Gupta, Chief Vedic Architect
// Purpose: Festival panchang page — /panchang/2026-05-16/shani-jayanti-2026
//          100% dynamic. All content from Supabase + Gemini Flash.
//          No hardcoded festival data.
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0; // Always fresh — content generated dynamically
export const dynamicParams = true;

const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikal Vaani";
const VM_URL = "http://34.14.164.105:8001";

// ── Types ─────────────────────────────────────────────────────────────
type FestivalRow = {
  id: number;
  date: string;
  festival_name: string;
  festival_slug: string;
  festival_type: string;
  planet_ruler: string | null;
  gemini_content: GeminiContent | null;
  geo_answer: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

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
  gemini_content: string | null;
};

type GeminiContent = {
  geo_answer?: string;
  intro_paragraph?: string;
  spiritual_significance?: string;
  dos_and_donts?: { dos: string[]; donts: string[] };
  remedies?: string[];
  faq?: { question: string; answer: string }[];
  meta_title?: string;
  meta_description?: string;
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
  const y = d.getUTCFullYear();
  return y >= 2020 && y <= 2100;
}

function formatHuman(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

async function getFestival(date: string, slug: string): Promise<FestivalRow | null> {
  try {
    const { data, error } = await getSupabase()
      .from("festivals_master")
      .select("id,date,festival_name,festival_slug,festival_type,planet_ruler,gemini_content,geo_answer,seo_title,seo_description")
      .eq("date", date)
      .eq("festival_slug", slug)
      .single();
    if (error || !data) return null;
    return data as FestivalRow;
  } catch { return null; }
}

async function getPanchang(date: string): Promise<PanchangRow | null> {
  try {
    const { data } = await getSupabase()
      .from("panchang_daily")
      .select("date,tithi,nakshatra,yoga,karana,vara,sunrise,sunset,rahu_kaal,gemini_content")
      .eq("date", date).eq("city", "delhi").single();
    if (data) return data as PanchangRow;
  } catch {}
  // Fallback to VM
  try {
    const res = await fetch(`${VM_URL}/panchang?date=${date}`, {
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return null;
    const vm = (await res.json()) as VMPanchang;
    return {
      date, tithi: `${vm.tithi.name} (${vm.tithi.paksha})`,
      nakshatra: `${vm.nakshatra.name} Pada ${vm.nakshatra.pada}`,
      yoga: vm.yoga.name, karana: vm.karana.name,
      vara: vm.weekday ?? vm.vara ?? "",
      sunrise: vm.sunrise, sunset: vm.sunset, rahu_kaal: vm.rahu_kaal,
      gemini_content: null,
    };
  } catch { return null; }
}

// ── Metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { date: string; slug: string } }
): Promise<Metadata> {
  const { date, slug } = params;
  if (!isValidDate(date)) return { title: "Not Found" };

  const festival = await getFestival(date, slug);
  if (!festival) return { title: "Festival Not Found" };

  const gc = festival.gemini_content;
  const human = formatHuman(date);
  const url = `${SITE_URL}/panchang/${date}/${slug}`;

  const title = gc?.meta_title
    ?? festival.seo_title
    ?? `${festival.festival_name} — Date, Muhurat, Puja Vidhi | Trikal Vaani`;

  const description = gc?.meta_description
    ?? festival.geo_answer
    ?? `${festival.festival_name} falls on ${human}. Tithi, Nakshatra, Rahu Kaal, Puja Muhurat, Do's & Don'ts by Rohiit Gupta, Chief Vedic Architect.`;

  return {
    title, description,
    authors: [{ name: AUTHOR_NAME, url: `${SITE_URL}/founder` }],
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Trikal Vaani`, description, url,
      siteName: "Trikal Vaani", type: "article", locale: "en_IN",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

// ── Schemas ───────────────────────────────────────────────────────────
function buildSchemas(
  festival: FestivalRow,
  panchang: PanchangRow | null,
  date: string,
  url: string
) {
  const human = formatHuman(date);
  const gc = festival.gemini_content;
  const faqItems = gc?.faq?.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })) ?? [
    {
      "@type": "Question",
      name: `When is ${festival.festival_name}?`,
      acceptedAnswer: { "@type": "Answer", text: `${festival.festival_name} falls on ${human}.` },
    },
  ];

  return [
    {
      "@context": "https://schema.org", "@type": "Article",
      headline: festival.festival_name,
      description: festival.geo_answer ?? `${festival.festival_name} on ${human}`,
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
        { "@type": "ListItem", position: 3, name: formatHuman(date), item: `${SITE_URL}/panchang/${date}` },
        { "@type": "ListItem", position: 4, name: festival.festival_name, item: url },
      ],
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems },
    {
      "@context": "https://schema.org", "@type": "Event",
      name: festival.festival_name,
      startDate: date, endDate: date,
      description: gc?.spiritual_significance ?? festival.geo_answer ?? festival.festival_name,
      location: { "@type": "Place", name: "India", address: { "@type": "PostalAddress", addressCountry: "IN" } },
      organizer: { "@type": "Organization", name: "Trikal Vaani", url: SITE_URL },
    },
  ];
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function FestivalPage(
  { params }: { params: { date: string; slug: string } }
) {
  const { date, slug } = params;
  if (!isValidDate(date)) notFound();

  const [festival, panchang] = await Promise.all([
    getFestival(date, slug),
    getPanchang(date),
  ]);

  if (!festival) notFound();

  const url = `${SITE_URL}/panchang/${date}/${slug}`;
  const human = formatHuman(date);
  const gc = festival.gemini_content;
  const schemas = buildSchemas(festival, panchang, date, url);

  const geoAnswer = gc?.geo_answer
    ?? festival.geo_answer
    ?? `${festival.festival_name} falls on ${human}. ${festival.planet_ruler ? `Planetary Ruler: ${festival.planet_ruler}.` : ""} Swiss Ephemeris, Lahiri Ayanamsha. By Rohiit Gupta, Chief Vedic Architect.`;

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">

          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-700">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/panchang" className="hover:text-amber-700">Panchang</Link>
            <span className="mx-2">›</span>
            <Link href={`/panchang/${date}`} className="hover:text-amber-700">{human}</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{festival.festival_name}</span>
          </nav>

          {/* Header */}
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {festival.festival_name}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {human} · By <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} ·{" "}
              <span className="text-amber-700">Swiss Ephemeris · Lahiri Ayanamsha</span>
            </p>
            {festival.planet_ruler && (
              <p className="mt-1 text-sm text-amber-700 font-medium">
                Planetary Ruler: {festival.planet_ruler}
              </p>
            )}
          </header>

          {/* GEO Answer Block */}
          <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Quick answer">
            <p className="text-base leading-relaxed text-gray-800">{geoAnswer}</p>
          </section>

          {/* Gemini Content — Significance */}
          {gc?.spiritual_significance ? (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Significance</h2>
              <p className="text-gray-700 leading-relaxed">{gc.spiritual_significance}</p>
            </section>
          ) : gc?.intro_paragraph ? (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">About {festival.festival_name}</h2>
              <p className="text-gray-700 leading-relaxed">{gc.intro_paragraph}</p>
            </section>
          ) : (
            <section className="mb-8 rounded-xl border border-amber-100 bg-white p-5">
              <p className="text-amber-700 text-sm font-medium">
                🔱 Detailed content for {festival.festival_name} is being generated by our AI engine.
                Check back in a few minutes or{" "}
                <Link href="/#birthform" className="underline">get a personal reading</Link>.
              </p>
            </section>
          )}

          {/* Do's & Don'ts */}
          {gc?.dos_and_donts && (
            <div className="mb-8 grid md:grid-cols-2 gap-6">
              <section className="rounded-xl bg-emerald-50 border border-emerald-200 p-5">
                <h2 className="text-lg font-bold text-emerald-900 mb-3">✅ Do&apos;s — क्या करें</h2>
                <ul className="space-y-2">
                  {gc.dos_and_donts.dos.map((d, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-emerald-600 mt-0.5 shrink-0">✓</span>{d}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-xl bg-rose-50 border border-rose-200 p-5">
                <h2 className="text-lg font-bold text-rose-900 mb-3">❌ Don&apos;ts — क्या न करें</h2>
                <ul className="space-y-2">
                  {gc.dos_and_donts.donts.map((d, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-rose-500 mt-0.5 shrink-0">✕</span>{d}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {/* Remedies */}
          {gc?.remedies && gc.remedies.length > 0 && (
            <section className="mb-8 rounded-xl bg-purple-50 border border-purple-200 p-5">
              <h2 className="text-lg font-bold text-purple-900 mb-3">🔮 Vedic Remedies</h2>
              <ul className="space-y-2">
                {gc.remedies.map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-purple-600 mt-0.5 shrink-0">◆</span>{r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Panchang Grid */}
          {panchang && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Panchang on {festival.festival_name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card label="Tithi"     value={panchang.tithi} />
                <Card label="Nakshatra" value={panchang.nakshatra} />
                <Card label="Yoga"      value={panchang.yoga} />
                <Card label="Karana"    value={panchang.karana} />
                <Card label="Sunrise"   value={panchang.sunrise + " IST"} />
                <Card label="Sunset"    value={panchang.sunset + " IST"} />
                <Card label="Rahu Kaal" value={panchang.rahu_kaal} sub="Avoid auspicious work" />
                <Card label="Weekday"   value={panchang.vara} />
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">
              How does {festival.festival_name} affect YOUR kundali?
            </h2>
            <p className="mt-2 text-sm opacity-95">
              Get a personalised reading based on your birth chart and today&apos;s planetary positions.
            </p>
            <Link
              href="/#birthform"
              className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50"
            >
              Start Free Reading →
            </Link>
          </section>

          {/* FAQ */}
          {gc?.faq && gc.faq.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
              {gc.faq.map((f, i) => (
                <FAQ key={i} q={f.question} a={f.answer} />
              ))}
            </section>
          )}

          {/* Explore More */}
          <section className="border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href="/panchang" className="text-amber-700 hover:underline">Panchang Archive</Link></li>
              <li><Link href={`/panchang/${date}`} className="text-amber-700 hover:underline">Full Panchang {human}</Link></li>
              <li><Link href="/career" className="text-amber-700 hover:underline">Career Astrology</Link></li>
              <li><Link href="/wealth" className="text-amber-700 hover:underline">Wealth Astrology</Link></li>
              <li><Link href="/marriage" className="text-amber-700 hover:underline">Marriage Astrology</Link></li>
              <li><Link href="/spirituality" className="text-amber-700 hover:underline">Spirituality</Link></li>
            </ul>
          </section>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>🔱 By <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE}. Engine: Swiss Ephemeris · Ayanamsha: Lahiri · Version: v1.0</p>
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
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
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
