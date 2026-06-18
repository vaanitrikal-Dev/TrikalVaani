// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/events/[slug]/page.tsx
// Version:     v2.0 — SUPABASE MIGRATION (festival 404 root-cause fix, Jun 2026)
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
//
// ── Why v2.0 (the real fix) ────────────────────────────────────────
//   v1.1 read festivals from the STATIC app/data/festivals.json file.
//   The sitemap AND the city route (app/[domain]/events/[slug]) read from
//   the Supabase festivals_master table. The two drifted out of sync:
//   festivals added/renamed in the DB (devshayani-ekadashi-2026,
//   ashadha-amavasya-2026, janmashtami-2026, the renamed rath-yatra slug…)
//   were NOT in the JSON, so this all-India route returned 404 for them —
//   while the sitemap kept listing them. That fed Google dead URLs.
//
//   v2.0 reads the SAME source as the sitemap + city route:
//   festivals_master (Supabase). Every is_indexed festival in the DB now
//   renders here automatically — no JSON drift, no 404s.
//
//   ALSO: CTA → /#birth-form (was /predict, which 404'd); OG image added
//   (og-default.jpg) for Google Discover; only is_indexed=true festivals
//   render (others → notFound, which keeps this in lockstep with the sitemap).
//
// SEO: Event + FAQPage + BreadcrumbList schema, GEO answer block.
// Lock: gemini-prompt.ts PERMANENTLY LOCKED (untouched).
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 86400;
export const dynamicParams = true;

// ── Types ────────────────────────────────────────────────────────────
type DbFestival = {
  festival_slug: string;
  festival_name: string;
  festival_type: string | null;
  planet_ruler: string | null;
  date: string;
  year: number | null;
  geo_answer: string | null;
  dos: string[] | null;
  donts: string[] | null;
  puja_vidhi: string[] | null;
  gemini_content: Record<string, unknown> | null;
  name_hindi: string | null;
  muhurat: string | null;
  is_indexed: boolean | null;
};

const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikaal Vaani";
const OG_IMAGE = `${SITE_URL}/og-default.jpg`;

const FESTIVAL_COLUMNS =
  "festival_slug,festival_name,festival_type,planet_ruler,date,year,geo_answer,dos,donts,puja_vidhi,gemini_content,name_hindi,muhurat,is_indexed";

// ── Supabase ─────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getFestival(slug: string): Promise<DbFestival | null> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("festivals_master")
      .select(FESTIVAL_COLUMNS)
      .eq("festival_slug", slug)
      .single();
    return (data as DbFestival) || null;
  } catch {
    return null;
  }
}

async function getRelatedFestivals(currentSlug: string): Promise<DbFestival[]> {
  try {
    const supabase = getSupabase();
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("festivals_master")
      .select(FESTIVAL_COLUMNS)
      .eq("is_indexed", true)
      .neq("festival_slug", currentSlug)
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(3);
    return (data as DbFestival[]) ?? [];
  } catch {
    return [];
  }
}

// ── Helpers ──────────────────────────────────────────────────────────
function cleanName(name: string): string {
  return name.replace(/\s*(?:19|20)\d{2}\s*$/, "").trim();
}

function festYear(f: DbFestival): number {
  return f.year ?? Number(f.date.slice(0, 4));
}

function formatDate(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

function gc(f: DbFestival, key: string): string | null {
  const v = f.gemini_content?.[key];
  return typeof v === "string" && v.trim() ? v : null;
}

// ── Static params: next 15 upcoming indexed festivals (from DB) ──────
export async function generateStaticParams() {
  try {
    const supabase = getSupabase();
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("festivals_master")
      .select("festival_slug")
      .eq("is_indexed", true)
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(15);
    return ((data as { festival_slug: string }[]) ?? []).map((f) => ({ slug: f.festival_slug }));
  } catch {
    // DB unreachable at build → everything renders on-demand via ISR
    return [];
  }
}

// ── Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const f = await getFestival(params.slug);
  if (!f || !f.is_indexed) return { title: "Festival Not Found | Trikaal Vaani" };

  const name = cleanName(f.festival_name);
  const yr = festYear(f);
  const human = formatDate(f.date);
  const title = `${name} ${yr} | ${human} | Date, Muhurat & Puja Vidhi | Trikaal Vaani`;
  const description =
    `${name} ${yr}${f.name_hindi ? ` (${f.name_hindi})` : ""} falls on ${human}.` +
    `${f.planet_ruler ? ` Ruling planet: ${f.planet_ruler}.` : ""}` +
    ` Puja vidhi, do's & don'ts and remedies by Rohiit Gupta, Chief Vedic Architect.`;
  const url = `${SITE_URL}/events/${f.festival_slug}`;

  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Trikaal Vaani", type: "article", locale: "en_IN", images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function EventDetailPage(
  { params }: { params: { slug: string } }
) {
  const f = await getFestival(params.slug);
  if (!f || !f.is_indexed) notFound();

  const url = `${SITE_URL}/events/${f.festival_slug}`;
  const human = formatDate(f.date);
  const name = cleanName(f.festival_name);
  const yr = festYear(f);
  const ruler = f.planet_ruler || "";
  const category = f.festival_type || "festival";
  const festivalHindi = f.name_hindi;

  const dos = f.dos ?? [];
  const donts = f.donts ?? [];
  const pujaVidhi = f.puja_vidhi ?? [];
  const significance = gc(f, "spiritual_significance") || "";
  const muhurat = f.muhurat;

  const geoAnswer = f.geo_answer
    ? f.geo_answer
    : `${name} ${yr}${festivalHindi ? ` (${festivalHindi})` : ""} falls on ${human}.${ruler ? ` Ruling planet: ${ruler}.` : ""}`;

  // FAQ — generated festival FAQs + safe defaults
  const genFaq = Array.isArray(f.gemini_content?.faq)
    ? (f.gemini_content!.faq as Array<{ question?: string; answer?: string }>)
        .filter((x) => x?.question && x?.answer)
        .map((x) => ({ q: x.question as string, a: x.answer as string }))
    : [];
  const faqItems: { q: string; a: string }[] = [
    { q: `When is ${name} ${yr}?`, a: `${name} ${yr} falls on ${human}.` },
    ...(muhurat ? [{ q: `What is the muhurat for ${name} ${yr}?`, a: muhurat }] : []),
    ...(ruler ? [{ q: `Who is the planetary ruler of ${name}?`, a: `The planetary ruler of ${name} is ${ruler}.` }] : []),
    ...genFaq,
  ];

  // ── Schema ──
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${name} ${yr}`,
    ...(festivalHindi ? { alternateName: festivalHindi } : {}),
    startDate: f.date,
    endDate: f.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    description: significance || f.geo_answer || `${name} ${yr}.`,
    image: [OG_IMAGE],
    location: { "@type": "Place", name: "Pan-India", address: { "@type": "PostalAddress", addressCountry: "IN" } },
    organizer: { "@type": "Organization", name: "Trikaal Vaani", url: SITE_URL },
    url,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Festivals", item: `${SITE_URL}/panchang` },
      { "@type": "ListItem", position: 3, name: name, item: url },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const related = await getRelatedFestivals(f.festival_slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">

          <nav className="mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-700">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/panchang" className="hover:text-amber-700">Festivals</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{name}</span>
          </nav>

          <header className="mb-6">
            <div className="text-sm font-semibold uppercase tracking-wide text-amber-700 capitalize">{category}</div>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gray-900">{name} {yr}</h1>
            {festivalHindi && <p className="mt-1 text-2xl text-gray-700">{festivalHindi}</p>}
            <p className="mt-3 text-sm text-gray-600">By <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE}</p>
          </header>

          <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Quick answer">
            <p className="text-base leading-relaxed text-gray-800">{geoAnswer}</p>
          </section>

          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">Date</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{human}</div>
            </div>
            {ruler && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">Planetary Ruler</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{ruler}</div>
              </div>
            )}
            {muhurat && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:col-span-2">
                <div className="text-xs uppercase tracking-wide text-gray-500">Muhurat</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{muhurat}</div>
              </div>
            )}
          </section>

          {significance && (
            <section className="mb-8 prose prose-amber max-w-none">
              <h2 className="text-2xl font-semibold">Significance of {name}</h2>
              <p>{significance}</p>
            </section>
          )}

          {pujaVidhi.length > 0 && (
            <section className="mb-8 rounded-xl border border-amber-200 bg-white p-5">
              <h2 className="mb-3 text-xl font-bold text-gray-900">🪔 {name} Puja Vidhi</h2>
              <ol className="ml-5 list-decimal space-y-2 text-sm text-gray-800">
                {pujaVidhi.map((step, i) => (<li key={i}>{step}</li>))}
              </ol>
            </section>
          )}

          {(dos.length > 0 || donts.length > 0) && (
            <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {dos.length > 0 && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                  <h2 className="mb-3 text-xl font-bold text-green-800">✓ Do&apos;s</h2>
                  <ul className="space-y-2">
                    {dos.map((item, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-800">
                        <span className="mr-2 text-green-600">●</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {donts.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <h2 className="mb-3 text-xl font-bold text-red-800">✗ Don&apos;ts</h2>
                  <ul className="space-y-2">
                    {donts.map((item, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-800">
                        <span className="mr-2 text-red-600">●</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">Get a personal {name} reading</h2>
            <p className="mt-2 text-sm opacity-95">
              How will {name} affect YOUR birth chart? Free Tithi insight, ₹51 for full prediction.
            </p>
            <Link href="/#birth-form" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Get My {name} Prediction →
            </Link>
          </section>

          {faqItems.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
              {faqItems.map((item, i) => (
                <details key={i} className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
                  <summary className="cursor-pointer font-medium text-gray-900">{item.q}</summary>
                  <p className="mt-2 text-sm text-gray-700">{item.a}</p>
                </details>
              ))}
            </section>
          )}

          {related.length > 0 && (
            <section className="border-t border-gray-200 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Related Festivals</h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={r.festival_slug}>
                    <Link href={`/events/${r.festival_slug}`} className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-amber-300 hover:bg-amber-50">
                      <div className="font-semibold text-gray-900">{cleanName(r.festival_name)}</div>
                      <div className="text-xs text-gray-600">{formatDate(r.date)}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href="/panchang" className="text-amber-700 hover:underline">Daily Panchang</Link></li>
              <li><Link href={`/panchang/${f.date}`} className="text-amber-700 hover:underline">Panchang for this Day</Link></li>
              <li><Link href="/spirituality" className="text-amber-700 hover:underline">Spirituality</Link></li>
              <li><Link href="/marriage" className="text-amber-700 hover:underline">Marriage</Link></li>
              <li><Link href="/wealth" className="text-amber-700 hover:underline">Wealth</Link></li>
              <li><Link href="/career" className="text-amber-700 hover:underline">Career</Link></li>
            </ul>
          </section>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>🔱 Curated by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE}. Source: Vedic shastras (BPHS, Surya Siddhanta) · Swiss Ephemeris.</p>
            <p className="mt-1 italic">&quot;Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye.&quot;</p>
          </footer>

        </div>
      </main>
    </>
  );
}
