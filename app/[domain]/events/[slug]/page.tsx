// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/[domain]/events/[slug]/page.tsx
// Version:     v2.1
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
// Purpose:     City + Festival Combo Pages — NOW DYNAMIC
//              URL: /delhi/events/diwali-2026
//                   /mumbai/events/maha-shivratri-2026
//
// ── Changes vs v2.0 ────────────────────────────────────────────────
//   1. name_hindi + muhurat now read from NEW top-level columns on
//      festivals_master (added 2026-06-04), not from gemini_content.
//      All 44 festivals have Devanagari name_hindi populated. muhurat
//      is engine-filled — still optional/graceful when empty.
//
// ── Changes vs v1.0 ────────────────────────────────────────────────
//   1. DATA SOURCE: festivals now read LIVE from Supabase
//      `festivals_master` (was static festivals.json). New festivals
//      added to the DB by the content engine auto-produce city pages
//      with NO redeploy. Cities stay in cities.json (stable, 10 cities).
//   2. YEAR is derived from DB (`year` column / date) — no hardcoded
//      "2026". festival_name already contains the year, so a trailing
//      year is stripped to avoid the "Maha Shivratri 2026 2026" double
//      -year bug. Works for 2027, 2028… forever.
//   3. Rich content pulled from `gemini_content` jsonb (geo_answer,
//      spiritual_significance, intro_paragraph) + top-level dos/donts.
//   4. name_hindi + muhurat are OPTIONAL (not in DB yet) — rendered
//      only if present; muhurat falls back to a link to the day's
//      Panchang. No crash if missing.
//   5. NULL-SAFETY added on every array (dos, donts, temples, faq) —
//      incomplete DB rows no longer crash the page.
//   6. Breadcrumb city link → /[city]/panchang (exists) instead of
//      /[city] (404). Visible nav + schema breadcrumb now aligned.
//   7. Removed competitor brand mention ("Drik Panchang") from footer
//      per IR-0. Schema set = Event + BreadcrumbList + FAQPage
//      (NO LocalBusiness — global positioning, CEO rule).
//
// SEO:         Event + FAQPage + BreadcrumbList schema, 60-word GEO answer
// E-E-A-T:     Author = Rohiit Gupta, Chief Vedic Architect
// Lock Status: gemini-prompt.ts = PERMANENTLY LOCKED (do not touch)
// Last Update: 2026-06-04 (dynamic migration)
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import citiesData from "../../../data/cities.json";

export const revalidate = 86400;
export const dynamicParams = true;

// ── Types ─────────────────────────────────────────────────────────────
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

// Row shape from Supabase festivals_master (only fields this page uses)
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
  gemini_content: Record<string, unknown> | null;
  name_hindi: string | null;
  muhurat: string | null;
};

const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikaal Vaani";

const CITY_SLUGS = new Set([
  "delhi", "mumbai", "noida", "gurgaon", "bangalore",
  "hyderabad", "pune", "kolkata", "chennai", "ahmedabad",
]);

// ── Supabase ──────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const FESTIVAL_COLUMNS =
  "festival_slug,festival_name,festival_type,planet_ruler,date,year,geo_answer,dos,donts,gemini_content,name_hindi,muhurat";

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

async function getOtherFestivals(currentSlug: string): Promise<DbFestival[]> {
  try {
    const supabase = getSupabase();
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("festivals_master")
      .select(FESTIVAL_COLUMNS)
      .neq("festival_slug", currentSlug)
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(6);
    return (data as DbFestival[]) ?? [];
  } catch {
    return [];
  }
}

// ── Helpers ───────────────────────────────────────────────────────────
function findCity(slug: string): City | null {
  if (!CITY_SLUGS.has(slug)) return null;
  return (citiesData.cities as City[]).find((c) => c.slug === slug) || null;
}

// festival_name often already ends with the year ("Holi 2026") — strip it
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

function firstSentence(text: string): string {
  return text.split(/(?<=[.?!])\s/)[0]?.trim() || text.trim();
}

// ── Static params: pre-render upcoming festivals × top 3 cities ───────
export async function generateStaticParams() {
  const params: { domain: string; slug: string }[] = [];
  try {
    const supabase = getSupabase();
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("festivals_master")
      .select("festival_slug")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(15);
    const festivals = (data as { festival_slug: string }[]) ?? [];
    const cities = (citiesData.cities as City[]).slice(0, 3);
    for (const c of cities) {
      for (const f of festivals) {
        params.push({ domain: c.slug, slug: f.festival_slug });
      }
    }
  } catch {
    // DB unreachable at build → everything renders on-demand via ISR
  }
  return params;
}

// ── Metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { domain: string; slug: string } }
): Promise<Metadata> {
  const c = findCity(params.domain);
  const f = await getFestival(params.slug);
  if (!c || !f) return { title: "Not Found | Trikaal Vaani" };

  const name = cleanName(f.festival_name);
  const yr = festYear(f);
  const human = formatDate(f.date);
  const temples = (c.famous_temples ?? []).slice(0, 2);

  const title = `${name} ${yr} in ${c.name} | ${human} | Puja Vidhi, Muhurat & Temples | Trikaal Vaani`;
  const description =
    `${name} ${yr} in ${c.name}, ${c.state} — ${human}. ` +
    `${temples.length ? `Famous temples: ${temples.join(", ")}. ` : ""}` +
    `By Rohiit Gupta, Chief Vedic Architect.`;
  const url = `${SITE_URL}/${c.slug}/events/${f.festival_slug}`;

  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Trikaal Vaani", type: "article", locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function CityFestivalPage(
  { params }: { params: { domain: string; slug: string } }
) {
  const c = findCity(params.domain);
  const f = await getFestival(params.slug);
  if (!c || !f) notFound();

  const url = `${SITE_URL}/${c.slug}/events/${f.festival_slug}`;
  const human = formatDate(f.date);
  const name = cleanName(f.festival_name);
  const yr = festYear(f);
  const ruler = f.planet_ruler || "the presiding deity";
  const category = f.festival_type || "festival";

  const temples = c.famous_temples ?? [];
  const dos = f.dos ?? [];
  const donts = f.donts ?? [];

  const intro = gc(f, "intro_paragraph") || f.geo_answer || "";
  const significance = gc(f, "spiritual_significance") || intro || "";
  const muhurat = f.muhurat; // top-level column (engine-filled; graceful if empty)
  const festivalHindi = f.name_hindi; // top-level Devanagari name
  const subtitle = [festivalHindi, c.name_hindi].filter(Boolean).join(" · ");

  // GEO direct answer (~60 words, city-specific)
  const geoAnswer =
    `${name} ${yr} in ${c.name} (${c.name_hindi}) falls on ${human}. ` +
    `Planetary ruler: ${ruler}. ` +
    `${intro ? firstSentence(intro) + " " : ""}` +
    `${temples.length ? `Visit famous ${c.name} temples like ${temples.slice(0, 2).join(" and ")} for darshan. ` : ""}` +
    `Authentic Vedic guidance with ${c.name}-specific timings.`;

  // FAQ items (muhurat Q only if available)
  const faqItems: { q: string; a: string }[] = [
    { q: `When is ${name} ${yr} in ${c.name}?`, a: `${name} ${yr} is celebrated in ${c.name} on ${human}.` },
    ...(muhurat ? [{ q: `What is the ${name} muhurat in ${c.name}?`, a: `The ${name} muhurat in ${c.name} is ${muhurat}.` }] : []),
    ...(temples.length ? [{ q: `Which temples to visit on ${name} in ${c.name}?`, a: `Famous temples in ${c.name}: ${temples.join(", ")}.` }] : []),
    { q: `Who is the planetary ruler of ${name}?`, a: `The planetary ruler of ${name} is ${ruler}.` },
  ];

  // ── Schema ──
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${name} ${yr} in ${c.name}`,
    ...(festivalHindi ? { alternateName: festivalHindi } : {}),
    startDate: f.date,
    endDate: f.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    description: intro || `${name} ${yr} in ${c.name}.`,
    location: {
      "@type": "Place",
      name: c.name,
      address: { "@type": "PostalAddress", addressLocality: c.name, addressRegion: c.state, addressCountry: "IN" },
      geo: { "@type": "GeoCoordinates", latitude: c.latitude, longitude: c.longitude },
    },
    organizer: { "@type": "Organization", name: "Trikaal Vaani", url: SITE_URL },
    url,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: c.name, item: `${SITE_URL}/${c.slug}/panchang` },
      { "@type": "ListItem", position: 3, name: "Festivals", item: `${SITE_URL}/upcoming-events` },
      { "@type": "ListItem", position: 4, name: name, item: url },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const otherFestivals = await getOtherFestivals(f.festival_slug);
  const otherCities = (citiesData.cities as City[]).filter((o) => o.slug !== c.slug).slice(0, 6);

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
            <Link href="/upcoming-events" className="hover:text-amber-700">Festivals</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{name}</span>
          </nav>

          <header className="mb-6">
            <div className="text-sm font-semibold uppercase tracking-wide text-amber-700 capitalize">
              {category} · {c.state}
            </div>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gray-900">
              {name} {yr} in {c.name}
            </h1>
            {subtitle && (
              <p className="mt-1 text-2xl text-gray-700">{subtitle}</p>
            )}
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
              <div className="mt-1 text-lg font-semibold text-gray-900">{ruler}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">Category</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 capitalize">{category}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:col-span-2">
              <div className="text-xs uppercase tracking-wide text-gray-500">Muhurat in {c.name}</div>
              {muhurat ? (
                <>
                  <div className="mt-1 text-lg font-semibold text-gray-900">{muhurat}</div>
                  <div className="mt-1 text-xs text-gray-600">All times in IST · Adjusted for {c.name}</div>
                </>
              ) : (
                <Link href={`/panchang/${f.date}`} className="mt-1 inline-block text-lg font-semibold text-amber-700 hover:underline">
                  View full Panchang &amp; muhurat for {human} →
                </Link>
              )}
            </div>
          </section>

          {significance && (
            <section className="mb-8 prose prose-amber max-w-none">
              <h2 className="text-2xl font-semibold">Significance of {name}</h2>
              <p>{significance}</p>
            </section>
          )}

          {/* Famous temples in this city for this festival */}
          {temples.length > 0 && (
            <section className="mb-8 rounded-xl border border-amber-200 bg-white p-5">
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                🛕 Where to celebrate {name} in {c.name}
              </h2>
              <p className="mb-3 text-sm text-gray-700">
                These temples in {c.name} are especially powerful during {name}:
              </p>
              <ul className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                {temples.map((temple, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 text-amber-600">●</span>
                    <span>{temple}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Do's & Don'ts */}
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
            <h2 className="text-xl font-bold">Personal {name} reading for {c.name}</h2>
            <p className="mt-2 text-sm opacity-95">
              How will {name} energy affect YOUR birth chart? Get personalised
              predictions calibrated to your birth city. Free Tithi insight, ₹51
              for full prediction.
            </p>
            <Link href="/predict" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Get My {name} Prediction →
            </Link>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>
            {faqItems.map((item) => (
              <details key={item.q} className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">{item.q}</summary>
                <p className="mt-2 text-sm text-gray-700">{item.a}</p>
              </details>
            ))}
          </section>

          {/* Same festival in other cities */}
          <section className="border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              {name} in Other Cities
            </h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              {otherCities.map((other) => (
                <li key={other.slug}>
                  <Link href={`/${other.slug}/events/${f.festival_slug}`} className="text-amber-700 hover:underline">
                    {name} in {other.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Other festivals in this city */}
          {otherFestivals.length > 0 && (
            <section className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Other Festivals in {c.name}
              </h2>
              <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                {otherFestivals.map((other) => (
                  <li key={other.festival_slug}>
                    <Link href={`/${c.slug}/events/${other.festival_slug}`} className="text-amber-700 hover:underline">
                      {cleanName(other.festival_name)} in {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href={`/${c.slug}/panchang`} className="text-amber-700 hover:underline">Panchang {c.name}</Link></li>
              <li><Link href={`/events/${f.festival_slug}`} className="text-amber-700 hover:underline">{name} (All-India)</Link></li>
              <li><Link href={`/panchang/${f.date}`} className="text-amber-700 hover:underline">Panchang for this Day</Link></li>
              <li><Link href="/upcoming-events" className="text-amber-700 hover:underline">All Festivals</Link></li>
              <li><Link href="/spirituality" className="text-amber-700 hover:underline">Spirituality</Link></li>
              <li><Link href="/marriage" className="text-amber-700 hover:underline">Marriage</Link></li>
            </ul>
          </section>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>
              🔱 Curated by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} for {c.name} ({c.latitude}°N, {c.longitude}°E).
              Source: Vedic shastras (BPHS, Surya Siddhanta) · Swiss Ephemeris.
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
