// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/[domain]/events/[slug]/page.tsx
// Version:     v2.5 — SOFT CTA + /predict cleanup (Claude, June 2026)
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
//
// ── Changes vs v2.4 ────────────────────────────────────────────────
//   1. SOFT CTA — slim value-first free-kundali bar under the quick-answer
//      block → /#birth-form (FREE, no payment/signup). The ₹51 HARD CTA
//      stays lower down. Free nudge early, paid ask late (honey-trap).
//   2. CLEANUP — the 2 remaining /predict links (remedies funnel + bottom
//      CTA) now point directly to /#birth-form (no redirect hop).
//   PROTECTED (untouched): all data fetching, scope logic, puja vidhi,
//      remedies content, regional customs, FAQ, schema, footer.
//
// ── Changes vs v2.3 (Discover optimization — Claude, June 2026) ────
//   1. OG image added (og-default.jpg 1200×630) to openGraph + twitter.
//   2. robots expanded with googleBot max-image-preview:large + max-snippet
//      (required for Google Discover large-image cards).
//   3. Event schema now carries image:[OG_IMAGE] for Rich Results.
//   PROTECTED (untouched): all data fetching, scope logic, puja vidhi,
//      remedies, regional customs, FAQ build, JSX, footer.
//
// ── Changes vs v2.2 ────────────────────────────────────────────────
//   1. REMOVED the "Where to celebrate {festival} in {city}" temples box
//      (CEO request — was rendering empty bullets for cities with no temple
//      data).
//   2. Temple data now filtered to non-empty strings (defensive), so the
//      geo line / temple FAQ never render broken empty entries.
//
// ── Changes vs v2.1 ────────────────────────────────────────────────
//   1. PUJA VIDHI box (Layer 1) — renders festivals_master.puja_vidhi.
//   2. REMEDIES box (Layer 2) — ruling-planet generic remedies from the
//      planet_remedies table + funnel CTA to the personalised (paid) reading.
//      Chart-specific Parashar/Bhrigu/Shadbala stays in the paid product.
//   3. REGIONAL CUSTOMS box (Layer 3) — renders regional_customs[state]
//      if present (graceful; empty until generated + verified).
//   4. SCOPE LOGIC — regional festivals (festival_scope='regional') only
//      render on their home_states cities; elsewhere → notFound(). The
//      "in Other Cities" links are filtered to home_states too (no 404 links).
//   5. GEO answer now uses the clean generated geo_answer; REMOVED the false
//      "city-specific timings" claim (we don't show timings).
//   6. FAQ = generated festival FAQs (gemini_content.faq) + city FAQs.
//   7. Dropped intro_paragraph dependency. Double-a brand throughout.
//
// SEO: Event + FAQPage + BreadcrumbList schema, GEO answer block.
// Lock: gemini-prompt.ts PERMANENTLY LOCKED (untouched).
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

type RegionalBlock = {
  regional_intro?: string;
  local_customs?: string[];
  local_special?: string;
};

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
  regional_customs: Record<string, RegionalBlock> | null;
  festival_scope: string | null;
  home_states: string[] | null;
};

type PlanetRemedy = {
  planet: string;
  day: string | null;
  mantra: string | null;
  daan: string | null;
  remedies: string[] | null;
  color: string | null;
};

const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikaal Vaani";
const OG_IMAGE = `${SITE_URL}/og-default.jpg`;

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
  "festival_slug,festival_name,festival_type,planet_ruler,date,year,geo_answer,dos,donts,puja_vidhi,gemini_content,name_hindi,muhurat,regional_customs,festival_scope,home_states";

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

async function getPlanetRemedies(planet: string | null): Promise<PlanetRemedy | null> {
  if (!planet) return null;
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("planet_remedies")
      .select("planet,day,mantra,daan,remedies,color")
      .eq("planet", planet)
      .single();
    return (data as PlanetRemedy) || null;
  } catch {
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────
function findCity(slug: string): City | null {
  if (!CITY_SLUGS.has(slug)) return null;
  return (citiesData.cities as City[]).find((c) => c.slug === slug) || null;
}

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

// regional festival is only valid in its home_states; pan_india valid everywhere
function stateInScope(f: DbFestival, state: string): boolean {
  if (f.festival_scope === "regional" && Array.isArray(f.home_states) && f.home_states.length > 0) {
    return f.home_states.includes(state);
  }
  return true;
}

// ── Static params: upcoming festivals × cities, respecting scope ──────
export async function generateStaticParams() {
  const params: { domain: string; slug: string }[] = [];
  try {
    const supabase = getSupabase();
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("festivals_master")
      .select("festival_slug,festival_scope,home_states")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(15);
    const festivals = (data as Pick<DbFestival, "festival_slug" | "festival_scope" | "home_states">[]) ?? [];
    const cities = (citiesData.cities as City[]).slice(0, 4);
    for (const c of cities) {
      for (const f of festivals) {
        if (stateInScope(f as DbFestival, c.state)) {
          params.push({ domain: c.slug, slug: f.festival_slug });
        }
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
  if (!c || !f || !stateInScope(f, c.state)) return { title: "Not Found | Trikaal Vaani" };

  const name = cleanName(f.festival_name);
  const yr = festYear(f);
  const human = formatDate(f.date);
  const temples = (c.famous_temples ?? []).slice(0, 2);

  const title = `${name} ${yr} in ${c.name} | ${human} | Puja Vidhi & Significance | Trikaal Vaani`;
  const description =
    `${name} ${yr} in ${c.name}, ${c.state} — ${human}. ` +
    `${temples.length ? `Temples: ${temples.join(", ")}. ` : ""}` +
    `Puja vidhi, do's & don'ts and remedies by Rohiit Gupta, Chief Vedic Architect.`;
  const url = `${SITE_URL}/${c.slug}/events/${f.festival_slug}`;

  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Trikaal Vaani", type: "article", locale: "en_IN", images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function CityFestivalPage(
  { params }: { params: { domain: string; slug: string } }
) {
  const c = findCity(params.domain);
  const f = await getFestival(params.slug);
  if (!c || !f || !stateInScope(f, c.state)) notFound();

  const url = `${SITE_URL}/${c.slug}/events/${f.festival_slug}`;
  const human = formatDate(f.date);
  const name = cleanName(f.festival_name);
  const yr = festYear(f);
  const ruler = f.planet_ruler || "";
  const category = f.festival_type || "festival";

  const temples = (c.famous_temples ?? []).filter((t) => typeof t === "string" && t.trim().length > 0);
  const dos = f.dos ?? [];
  const donts = f.donts ?? [];
  const pujaVidhi = f.puja_vidhi ?? [];
  const significance = gc(f, "spiritual_significance") || "";
  const muhurat = f.muhurat;
  const festivalHindi = f.name_hindi;
  const subtitle = [festivalHindi, c.name_hindi].filter(Boolean).join(" · ");

  // Layer 2 — ruling-planet generic remedies
  const remedy = await getPlanetRemedies(f.planet_ruler);

  // Layer 3 — regional customs for this city's state (graceful)
  const regional: RegionalBlock | null =
    (f.regional_customs && c.state && f.regional_customs[c.state]) || null;

  // GEO answer — clean generated geo_answer + a local temple line (NO false timings)
  const geoAnswer = f.geo_answer
    ? `${f.geo_answer}${temples.length ? ` In ${c.name}, devotees visit temples like ${temples.slice(0, 2).join(" and ")}.` : ""}`
    : `${name} ${yr} in ${c.name} (${c.name_hindi}) falls on ${human}.${ruler ? ` Ruling planet: ${ruler}.` : ""}${temples.length ? ` Visit ${c.name} temples like ${temples.slice(0, 2).join(" and ")} for darshan.` : ""}`;

  // FAQ — generated festival FAQs + city FAQs
  const genFaq = Array.isArray(f.gemini_content?.faq)
    ? (f.gemini_content!.faq as Array<{ question?: string; answer?: string }>)
        .filter((x) => x?.question && x?.answer)
        .map((x) => ({ q: x.question as string, a: x.answer as string }))
    : [];
  const faqItems: { q: string; a: string }[] = [
    { q: `When is ${name} ${yr} in ${c.name}?`, a: `${name} ${yr} is observed in ${c.name} on ${human}.` },
    ...(temples.length ? [{ q: `Which temples to visit on ${name} in ${c.name}?`, a: `Famous temples in ${c.name}: ${temples.join(", ")}.` }] : []),
    ...genFaq,
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
    description: significance || f.geo_answer || `${name} ${yr} in ${c.name}.`,
    image: [OG_IMAGE],
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const otherFestivals = await getOtherFestivals(f.festival_slug);
  const otherCities = (citiesData.cities as City[])
    .filter((o) => o.slug !== c.slug)
    .filter((o) => stateInScope(f, o.state)) // regional → only home-state cities (no 404 links)
    .slice(0, 6);

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

          {/* SOFT CTA (v2.5) — value-first free-kundali nudge, early in the page.
              The ₹51 HARD CTA stays lower down. Free now, paid later. */}
          <div className="mb-8 flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-100/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-amber-900">
              ✨ Curious what {name} means for YOUR chart?{" "}
              <span className="text-amber-700">Start free — no payment, no signup.</span>
            </p>
            <Link href="/#birth-form" className="inline-block shrink-0 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">
              See my free kundali →
            </Link>
          </div>

          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">Date</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{human}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">City</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{c.name}, {c.state}</div>
            </div>
            {ruler && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500">Planetary Ruler</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{ruler}</div>
              </div>
            )}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">Category</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 capitalize">{category}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:col-span-2">
              <div className="text-xs uppercase tracking-wide text-gray-500">Muhurat in {c.name}</div>
              {muhurat ? (
                <>
                  <div className="mt-1 text-lg font-semibold text-gray-900">{muhurat}</div>
                  <div className="mt-1 text-xs text-gray-600">All times in IST · {c.name}</div>
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

          {/* Puja Vidhi (Layer 1) */}
          {pujaVidhi.length > 0 && (
            <section className="mb-8 rounded-xl border border-amber-200 bg-white p-5">
              <h2 className="mb-3 text-xl font-bold text-gray-900">🪔 {name} Puja Vidhi</h2>
              <ol className="ml-5 list-decimal space-y-2 text-sm text-gray-800">
                {pujaVidhi.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
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

          {/* Remedies (Layer 2) — ruling-planet generic + funnel to paid personalised */}
          {remedy && Array.isArray(remedy.remedies) && remedy.remedies.length > 0 && (
            <section className="mb-8 rounded-xl border border-amber-300 bg-amber-50/60 p-5">
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                ✨ Remedies for {name}{ruler ? ` (ruled by ${ruler})` : ""}
              </h2>
              <ul className="space-y-2">
                {remedy.remedies.map((r, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-800">
                    <span className="mr-2 text-amber-600">●</span><span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-gray-600">
                {remedy.mantra && <span>Mantra: <em>{remedy.mantra}</em>. </span>}
                {remedy.daan && <span>Daan: {remedy.daan}{remedy.day ? ` (on ${remedy.day})` : ""}.</span>}
              </div>
              <p className="mt-3 text-sm text-gray-700">
                These are general {ruler || "planetary"} remedies. For remedies based on YOUR birth chart —{" "}
                <Link href="/#birth-form" className="font-semibold text-amber-700 hover:underline">
                  get your personalised reading →
                </Link>
              </p>
            </section>
          )}

          {/* Regional customs (Layer 3) — only if present + verified */}
          {regional && regional.regional_intro && (
            <section className="mb-8 rounded-xl border border-amber-200 bg-white p-5">
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                How {c.name} celebrates {name}
              </h2>
              <p className="text-sm leading-relaxed text-gray-800">{regional.regional_intro}</p>
              {Array.isArray(regional.local_customs) && regional.local_customs.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {regional.local_customs.map((cm, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-800">
                      <span className="mr-2 text-amber-600">●</span><span>{cm}</span>
                    </li>
                  ))}
                </ul>
              )}
              {regional.local_special && (
                <p className="mt-3 text-sm text-gray-700">Local special: {regional.local_special}</p>
              )}
            </section>
          )}

          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">Personal {name} reading for {c.name}</h2>
            <p className="mt-2 text-sm opacity-95">
              How will {name} affect YOUR birth chart? Get a personalised reading with
              remedies tailored to your kundali. Free Tithi insight, ₹51 for full prediction.
            </p>
            <Link href="/#birth-form" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Get My {name} Prediction →
            </Link>
          </section>

          {faqItems.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                Frequently Asked Questions
              </h2>
              {faqItems.map((item, i) => (
                <details key={i} className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
                  <summary className="cursor-pointer font-medium text-gray-900">{item.q}</summary>
                  <p className="mt-2 text-sm text-gray-700">{item.a}</p>
                </details>
              ))}
            </section>
          )}

          {/* Same festival in other (in-scope) cities */}
          {otherCities.length > 0 && (
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
          )}

          {/* Other festivals in this city */}
          {otherFestivals.length > 0 && (
            <section className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Other Festivals in {c.name}
              </h2>
              <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                {otherFestivals
                  .filter((o) => stateInScope(o, c.state))
                  .map((other) => (
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
