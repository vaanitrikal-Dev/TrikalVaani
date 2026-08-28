// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     app/[domain]/events/[slug]/page.tsx
// Version:  v3.0 (28 Aug 2026) — pillar rebuild
// Owner:    Rohiit Gupta, Chief Vedic Architect
//
// ── WHY v3.0 ───────────────────────────────────────────────────────────────
//
// v2.6 was a national template with the city name substituted into it twice.
// Measured against Search Console for the quarter to 28 Aug 2026:
//
//     regional queries      118 queries   5,512 impressions   0.3% CTR
//     hindi / devanagari    141 queries   7,638 impressions   0.5% CTR
//     visarjan/nimajjanam     8 queries     881 impressions   0.0% CTR
//     rahu kaal               3 queries     229 impressions   0.0% CTR
//
// The Hyderabad page said "Hyderabad" twice, contained the word "Rahu" zero
// times, "nimajjanam" zero times, and computed nothing for the city at all.
// Those impressions were not lost to competition; they were lost to a page
// that did not answer the question it ranked for.
//
// ── WHAT IS ACTUALLY DIFFERENT PER CITY NOW ────────────────────────────────
//
// Everything in the timing panel, computed live from the city's own
// coordinates through the VM engine: tithi with its end time, nakshatra, yoga,
// karana, sunrise, sunset, Rahu Kaal, Yamaganda, Gulika, Abhijit. Kolkata
// rises at 05:21 where Mumbai rises at 06:26, and the page now says so.
//
// If the engine is unreachable the timing panel does not render. It never
// approximates, and it never repeats another city's numbers — which is what
// the /mumbai/panchang page was silently doing with Delhi's data for three
// months before 28 Aug 2026.
//
// ── THE SECTION NO COMPETITOR HAS ──────────────────────────────────────────
//
// "How this date was determined" renders festivals_master.regional_note: the
// tithi span to the minute, the kaal that decides this festival, the tie-break
// when two days qualify, and the Sanskrit line it rests on. Trikaal Vaani
// computes its dates; the rest of the category copies them. On the years when
// a festival date is disputed — and one is every year — this is the page that
// settles it.
//
// ── DATA SOURCES, AND WHICH IS WHICH ───────────────────────────────────────
//
//   festivals_master        date, regional_note, dos, donts, muhurat        DB
//   festivals_catalog       deity, mantra, offerings, planet, colour        DB
//   festival_content        all prose, per language                     Gemini
//   festival_local_terms    nimajjanam, dasara — verified rows only     manual
//   VM /panchang            every clock time on the page                engine
//
// Gemini writes prose ONCE per festival per language, never per city. City
// difference comes from the engine, free. Per-city generation would be 726
// calls instead of 66 and would publish eleven near-identical pages.
//
// ── PRESERVED FROM v2.6 ────────────────────────────────────────────────────
// Scope logic (regional festivals only render on home_states cities),
// CalculatorLinks, Event/FAQPage/BreadcrumbList schema, the ₹51 funnel.
// ════════════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import citiesData from "../../../data/cities.json";
import CalculatorLinks from "@/components/seo/CalculatorLinks";
import { callVM } from "@/lib/callVM";

export const revalidate = 86400;
export const dynamicParams = true;

// ── Types ───────────────────────────────────────────────────────────────────
type City = {
  slug: string; name: string; name_hindi: string; state: string;
  latitude: number; longitude: number; description: string;
  famous_temples: string[]; language: string;
};

type DbFestival = {
  festival_slug: string; festival_name: string; festival_type: string | null;
  planet_ruler: string | null; date: string; year: number | null;
  geo_answer: string | null; dos: string[] | null; donts: string[] | null;
  puja_vidhi: string[] | null; name_hindi: string | null; muhurat: string | null;
  regional_note: string | null; deity: string | null; mantra: string | null;
  offerings: string[] | null; color: string | null; dosha_relief: string | null;
  festival_scope: string | null; home_states: string[] | null;
};

type Content = {
  page_slug: string; alt_lang_slug: string | null;
  seo_title: string | null; seo_description: string | null;
  direct_answer: string | null; quick_actions: string[] | null;
  significance: string | null;
  puja_vidhi: { step: string; detail: string }[] | null;
  puja_vidhi_short: string[] | null;
  samagri: { essential?: string[]; optional?: string[]; substitutes?: string[] } | null;
  vrat_vidhi: {
    start?: string; may_eat?: string[]; avoid?: string[]; paran?: string;
    who_should_not?: string; health_note?: string;
  } | null;
  dos_donts: { q: string; a: string }[] | null;
  common_mistakes: string[] | null;
  mantra_block: { mantra?: string; meaning?: string; count?: string; when?: string } | null;
  katha: string | null; aarti: string | null;
  upay_by_problem: { problem: string; upay: string }[] | null;
  solution_bridge: string | null;
  faqs: { q: string; a: string }[] | null;
  keywords: string[] | null;
};

type LocalTerm = { local_name: string; script_name: string | null; note: string | null };

/** What the VM returns from /panchang. Every clock time on the page. */
type Panchang = {
  weekday: string;
  tithi: { name: string; paksha: string; ends: string | null };
  nakshatra: { name: string; pada: number; ends: string | null };
  yoga: { name: string; ends: string | null };
  karana: { name: string; ends: string | null };
  sunrise: string; sunset: string;
  rahu_kaal: string; yamaganda: string; gulika_kaal: string;
  abhijit_muhurat: string;
};

const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikaal Vaani";
const OG_IMAGE = `${SITE_URL}/og-default.jpg`;

const CITY_SLUGS = new Set([
  "delhi", "mumbai", "noida", "gurgaon", "bangalore",
  "hyderabad", "pune", "kolkata", "chennai", "ahmedabad",
]);

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const FESTIVAL_COLUMNS =
  "festival_slug,festival_name,festival_type,planet_ruler,date,year,geo_answer," +
  "dos,donts,puja_vidhi,name_hindi,muhurat,regional_note,deity,mantra,offerings," +
  "color,dosha_relief,festival_scope,home_states";

const baseSlug = (s: string) => s.replace(/-20\d\d$/, "");

// ── Data ────────────────────────────────────────────────────────────────────

async function getFestival(slug: string): Promise<DbFestival | null> {
  try {
    const { data } = await getSupabase()
      .from("festivals_master").select(FESTIVAL_COLUMNS)
      .eq("festival_slug", slug).single();
    return (data as DbFestival) || null;
  } catch { return null; }
}

async function getContent(base: string, lang: "en" | "hi"): Promise<Content | null> {
  try {
    const { data } = await getSupabase()
      .from("festival_content").select("*")
      .eq("base_slug", base).eq("lang", lang)
      .eq("is_published", true).single();
    return (data as Content) || null;
  } catch { return null; }
}

/**
 * The local name for this festival in this state — nimajjanam, dasara.
 *
 * verified = true is required, and that filter is the point. A wrong religious
 * term costs more authority than a missing one wins traffic, so unverified
 * rows sit in the table and do not reach the page. An empty section is honest.
 */
async function getLocalTerm(base: string, state: string): Promise<LocalTerm | null> {
  try {
    const { data } = await getSupabase()
      .from("festival_local_terms").select("local_name,script_name,note")
      .eq("base_slug", base).eq("state", state).eq("verified", true).limit(1);
    return (data && data[0] as LocalTerm) || null;
  } catch { return null; }
}

/**
 * Every clock time on this page, computed for THIS city's coordinates.
 *
 * Returns null on any failure, and the caller renders nothing rather than
 * something. Between 4 June and 28 Aug 2026 ten city panchang pages served
 * Delhi's numbers under their own name because a fallback looked better than
 * a gap. It is not better. A missing table is a gap; a wrong muhurat is a
 * person doing their puja at the wrong hour.
 */
async function getPanchang(date: string, lat: number, lon: number, city: string): Promise<Panchang | null> {
  try {
    const q = new URLSearchParams({ date, lat: String(lat), lon: String(lon), city });
    const res = await callVM(`/panchang?${q.toString()}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Panchang;
  } catch { return null; }
}

async function getOtherCityTimings(f: DbFestival, cities: City[]) {
  const out = await Promise.all(
    cities.map(async c => ({ city: c, p: await getPanchang(f.date, c.latitude, c.longitude, c.name) }))
  );
  return out.filter(r => r.p) as { city: City; p: Panchang }[];
}

async function getOtherFestivals(citySlug: string, exclude: string) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await getSupabase()
      .from("festivals_master")
      .select("festival_slug,festival_name,date,festival_scope,home_states")
      .gte("date", today).neq("festival_slug", exclude)
      .order("date").limit(8);
    return (data ?? []) as Pick<DbFestival,
      "festival_slug" | "festival_name" | "date" | "festival_scope" | "home_states">[];
  } catch { return []; }
}

// ── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { domain: string; slug: string } }
): Promise<Metadata> {
  const cities = (citiesData as { cities: City[] }).cities;
  const c = cities.find(x => x.slug === params.domain);
  if (!c) return {};
  const f = await getFestival(params.slug);
  if (!f) return {};
  const content = await getContent(baseSlug(params.slug), "en");

  const name = f.festival_name;
  const url = `${SITE_URL}/${c.slug}/events/${f.festival_slug}`;
  const title = content?.seo_title
    ? `${content.seo_title} — ${c.name}`
    : `${name} in ${c.name}: Date, Muhurat & Puja Vidhi`;
  const description = content?.seo_description
    ?? `${name} ${f.date} in ${c.name}. Tithi, puja muhurat, Rahu Kaal and sunrise computed for ${c.name}, with the classical rule behind the date.`;

  // hreflang, built from alt_lang_slug — the convention blog_posts already
  // uses. The site had no hreflang anywhere before v3.0, which left the Hindi
  // and English pages competing with each other instead of covering two
  // different searches.
  const languages: Record<string, string> = { "en-IN": url };
  if (content?.alt_lang_slug) {
    languages["hi-IN"] = `${SITE_URL}/hi/${c.slug}/events/${content.alt_lang_slug}`;
  }

  return {
    title, description,
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, images: [OG_IMAGE], type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function CityFestivalPage(
  { params }: { params: { domain: string; slug: string } }
) {
  if (!CITY_SLUGS.has(params.domain)) notFound();
  const cities = (citiesData as { cities: City[] }).cities;
  const c = cities.find(x => x.slug === params.domain);
  if (!c) notFound();

  const f = await getFestival(params.slug);
  if (!f) notFound();

  // Regional festivals render only where they are observed — kept from v2.6.
  if (f.festival_scope === "regional" && f.home_states?.length &&
      !f.home_states.includes(c.state)) notFound();

  const base = baseSlug(params.slug);
  const [content, local, panchang, otherFestivals] = await Promise.all([
    getContent(base, "en"),
    getLocalTerm(base, c.state),
    getPanchang(f.date, c.latitude, c.longitude, c.name),
    getOtherFestivals(c.slug, f.festival_slug),
  ]);

  const inScope = cities.filter(x =>
    x.slug !== c.slug &&
    !(f.festival_scope === "regional" && f.home_states?.length &&
      !f.home_states.includes(x.state)));
  const cityTimings = await getOtherCityTimings(f, inScope);

  const name = f.festival_name;
  const pretty = new Date(f.date + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const url = `${SITE_URL}/${c.slug}/events/${f.festival_slug}`;

  const faqs = content?.faqs ?? [];
  const eventSchema = {
    "@context": "https://schema.org", "@type": "Event",
    name: `${name} in ${c.name}`,
    startDate: f.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: [OG_IMAGE], url,
    description: content?.direct_answer ?? f.geo_answer ?? undefined,
    location: {
      "@type": "Place", name: c.name,
      address: { "@type": "PostalAddress", addressLocality: c.name, addressRegion: c.state, addressCountry: "IN" },
      geo: { "@type": "GeoCoordinates", latitude: c.latitude, longitude: c.longitude },
    },
    author: { "@type": "Person", name: AUTHOR_NAME, jobTitle: AUTHOR_TITLE },
    organizer: { "@type": "Organization", name: "Trikaal Vaani", url: SITE_URL },
  };
  const faqSchema = faqs.length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(q => ({
      "@type": "Question", name: q.q,
      acceptedAnswer: { "@type": "Answer", text: q.a },
    })),
  } : null;
  const crumbs = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: c.name, item: `${SITE_URL}/${c.slug}/panchang` },
      { "@type": "ListItem", position: 3, name: name, item: url },
    ],
  };

  const H2 = "mb-3 text-xl font-bold text-gray-900";
  const CARD = "mb-8 rounded-xl border border-amber-200 bg-white p-5";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />

      <p className="text-sm text-amber-700">{c.name} · {c.state}</p>
      <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gray-900">
        {name} in {c.name}
      </h1>
      <p className="mt-2 text-lg text-gray-700">{pretty}</p>

      {content?.alt_lang_slug && (
        <p className="mt-2 text-sm">
          <Link href={`/hi/${c.slug}/events/${content.alt_lang_slug}`} className="text-amber-700 underline">
            हिंदी में पढ़ें →
          </Link>
        </p>
      )}

      {/* 1 · DIRECT ANSWER — what AI search and the answer box will lift */}
      {(content?.direct_answer || f.geo_answer) && (
        <section className="mt-6 mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Quick answer">
          <p className="text-gray-900">{content?.direct_answer ?? f.geo_answer}</p>
        </section>
      )}

      {/* 2 · LOCAL NAME — renders only when a verified term exists for this state */}
      {local && (
        <section className="mb-8 rounded-xl border border-amber-300 bg-amber-50/60 p-4">
          <p className="text-gray-900">
            In {c.state}, {name} is known as <strong>{local.local_name}</strong>
            {local.script_name ? <> ({local.script_name})</> : null}.
            {local.note ? <> {local.note}</> : null}
          </p>
        </section>
      )}

      {/* 3 · TIMING PANEL — every value computed for THIS city.
          Absent, never approximated, if the engine is unreachable. */}
      {panchang ? (
        <section className={CARD} aria-label={`${name} timings for ${c.name}`}>
          <h2 className={H2}>🕐 {name} Timings for {c.name}</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-amber-100">
              <tr><td className="py-2 text-gray-600">Tithi</td>
                  <td className="py-2 text-right font-medium">
                    {panchang.tithi.name} ({panchang.tithi.paksha})
                    {panchang.tithi.ends && <> — upto {panchang.tithi.ends}</>}
                  </td></tr>
              <tr><td className="py-2 text-gray-600">Nakshatra</td>
                  <td className="py-2 text-right font-medium">
                    {panchang.nakshatra.name}, Pada {panchang.nakshatra.pada}
                    {panchang.nakshatra.ends && <> — upto {panchang.nakshatra.ends}</>}
                  </td></tr>
              <tr><td className="py-2 text-gray-600">Yoga · Karana</td>
                  <td className="py-2 text-right font-medium">{panchang.yoga.name} · {panchang.karana.name}</td></tr>
              <tr><td className="py-2 text-gray-600">Abhijit Muhurat</td>
                  <td className="py-2 text-right font-medium text-green-800">{panchang.abhijit_muhurat}</td></tr>
              <tr><td className="py-2 text-gray-600">Rahu Kaal</td>
                  <td className="py-2 text-right font-medium text-red-700">{panchang.rahu_kaal}</td></tr>
              <tr><td className="py-2 text-gray-600">Yamaganda · Gulika</td>
                  <td className="py-2 text-right font-medium text-red-700">{panchang.yamaganda} · {panchang.gulika_kaal}</td></tr>
              <tr><td className="py-2 text-gray-600">Sunrise · Sunset</td>
                  <td className="py-2 text-right font-medium">{panchang.sunrise} · {panchang.sunset}</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-gray-500">
            Computed for {c.name} ({c.latitude}, {c.longitude}) with Swiss Ephemeris,
            Lahiri ayanamsha. All five angas read at local sunrise.
          </p>
        </section>
      ) : null}

      {/* Soft CTA — free, early, no friction. Kept from v2.5. */}
      <Link href="/#birth-form"
            className="mb-8 block rounded-lg border border-amber-300 bg-white p-3 text-center text-sm text-amber-800 hover:bg-amber-50">
        Free Kundli — no payment, no signup →
      </Link>

      {/* 4 · QUICK ACTIONS — for the reader standing at the thali */}
      {content?.quick_actions?.length ? (
        <section className={CARD}>
          <h2 className={H2}>✅ What to do on {name}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-gray-800">
            {content.quick_actions.map((a, i) => <li key={i}>{a}</li>)}
          </ol>
          {content.puja_vidhi_short?.length ? (
            <p className="mt-3 text-sm">
              <a href="#short-vidhi" className="text-amber-700 underline">
                Short of time? → 5-minute puja vidhi
              </a>
            </p>
          ) : null}
        </section>
      ) : null}

      {/* 5 · HOW THIS DATE WAS DETERMINED — the section nobody else has */}
      {f.regional_note && (
        <section className="mb-8 rounded-xl border-2 border-amber-400 bg-amber-50 p-5">
          <h2 className={H2}>📜 How this date was determined</h2>
          <p className="whitespace-pre-line text-gray-800">{f.regional_note}</p>
          <p className="mt-3 text-xs text-gray-600">
            Computed by Trikaal Vaani from Swiss Ephemeris and the classical nirnaya
            rules — Nirnaya Sindhu, Dharma Sindhu, and the Report of the Calendar
            Reform Committee. Not copied from another calendar.
          </p>
        </section>
      )}

      {/* 6 · CITY-WISE TIMINGS — genuinely different per row */}
      {cityTimings.length > 0 && (
        <section className={CARD}>
          <h2 className={H2}>🕐 {name} timings across India</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr><th className="py-1">City</th><th>Sunrise</th><th>Abhijit</th><th>Rahu Kaal</th></tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                <tr className="bg-amber-50">
                  <td className="py-2 font-semibold">{c.name}</td>
                  <td>{panchang?.sunrise ?? "—"}</td>
                  <td>{panchang?.abhijit_muhurat ?? "—"}</td>
                  <td>{panchang?.rahu_kaal ?? "—"}</td>
                </tr>
                {cityTimings.map(({ city, p }) => (
                  <tr key={city.slug}>
                    <td className="py-2">
                      <Link href={`/${city.slug}/events/${f.festival_slug}`} className="text-amber-700 hover:underline">
                        {city.name}
                      </Link>
                    </td>
                    <td>{p.sunrise}</td><td>{p.abhijit_muhurat}</td><td>{p.rahu_kaal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 7 · SIGNIFICANCE */}
      {content?.significance && (
        <section className="mb-8 prose prose-amber max-w-none">
          <h2 className="text-2xl font-semibold">Why {name} is observed</h2>
          <div className="whitespace-pre-line text-gray-800">{content.significance}</div>
        </section>
      )}

      {/* 8 · PUJA VIDHI */}
      {content?.puja_vidhi?.length ? (
        <section className={CARD}>
          <h2 className={H2}>🪔 {name} Puja Vidhi</h2>
          <ol className="list-decimal space-y-3 pl-5 text-gray-800">
            {content.puja_vidhi.map((s, i) => (
              <li key={i}><strong>{s.step}</strong> — {s.detail}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {content?.puja_vidhi_short?.length ? (
        <section id="short-vidhi" className="mb-8 rounded-xl border border-green-300 bg-green-50 p-5">
          <h2 className={H2}>⚡ 5-minute version</h2>
          <ol className="list-decimal space-y-2 pl-5 text-gray-800">
            {content.puja_vidhi_short.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>
      ) : null}

      {/* 9 · SAMAGRI — with the substitutes column nobody writes */}
      {content?.samagri && (
        <section className={CARD}>
          <h2 className={H2}>🛒 {name} Puja Samagri</h2>
          {content.samagri.essential?.length ? (
            <><h3 className="mt-2 font-semibold text-gray-800">Essential</h3>
              <ul className="list-disc pl-5 text-gray-700">
                {content.samagri.essential.map((s, i) => <li key={i}>{s}</li>)}
              </ul></>
          ) : null}
          {content.samagri.optional?.length ? (
            <><h3 className="mt-3 font-semibold text-gray-800">Optional</h3>
              <ul className="list-disc pl-5 text-gray-700">
                {content.samagri.optional.map((s, i) => <li key={i}>{s}</li>)}
              </ul></>
          ) : null}
          {content.samagri.substitutes?.length ? (
            <><h3 className="mt-3 font-semibold text-gray-800">If something is unavailable</h3>
              <ul className="list-disc pl-5 text-gray-700">
                {content.samagri.substitutes.map((s, i) => <li key={i}>{s}</li>)}
              </ul></>
          ) : null}
        </section>
      )}

      {/* 10 · VRAT — the health line is required, not decorative */}
      {content?.vrat_vidhi && (
        <section className={CARD}>
          <h2 className={H2}>🌙 {name} Vrat Vidhi</h2>
          {content.vrat_vidhi.start && <p className="text-gray-800"><strong>When it begins:</strong> {content.vrat_vidhi.start}</p>}
          {content.vrat_vidhi.may_eat?.length ? (
            <><p className="mt-3 font-semibold text-green-800">May be eaten</p>
              <ul className="list-disc pl-5 text-gray-700">{content.vrat_vidhi.may_eat.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
          {content.vrat_vidhi.avoid?.length ? (
            <><p className="mt-3 font-semibold text-red-800">To be avoided</p>
              <ul className="list-disc pl-5 text-gray-700">{content.vrat_vidhi.avoid.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
          {content.vrat_vidhi.paran && <p className="mt-3 text-gray-800"><strong>Paran:</strong> {content.vrat_vidhi.paran}</p>}
          {content.vrat_vidhi.who_should_not && <p className="mt-2 text-gray-800"><strong>Who traditionally does not fast:</strong> {content.vrat_vidhi.who_should_not}</p>}
          {content.vrat_vidhi.health_note && (
            <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              {content.vrat_vidhi.health_note}
            </p>
          )}
        </section>
      )}

      {/* 11 · THE ACTUAL QUESTIONS PEOPLE ASK */}
      {content?.dos_donts?.length ? (
        <section className={CARD}>
          <h2 className={H2}>❓ {name}: what is allowed and what is not</h2>
          <div className="space-y-3">
            {content.dos_donts.map((d, i) => (
              <div key={i}>
                <p className="font-medium text-gray-900">{d.q}</p>
                <p className="text-gray-700">{d.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Do's / Don'ts from the catalog — Rohiit's own, kept from v2.6 */}
      {(f.dos?.length || f.donts?.length) && (
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {f.dos?.length ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <h2 className="mb-3 text-xl font-bold text-green-800">✓ Do&apos;s</h2>
              <ul className="list-disc space-y-1 pl-5 text-gray-800">{f.dos.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
          ) : null}
          {f.donts?.length ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h2 className="mb-3 text-xl font-bold text-red-800">✗ Don&apos;ts</h2>
              <ul className="list-disc space-y-1 pl-5 text-gray-800">{f.donts.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
          ) : null}
        </section>
      )}

      {/* 12 · COMMON MISTAKES */}
      {content?.common_mistakes?.length ? (
        <section className={CARD}>
          <h2 className={H2}>⚠️ Common mistakes</h2>
          <ul className="list-disc space-y-2 pl-5 text-gray-800">
            {content.common_mistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </section>
      ) : null}

      {/* 13 · MANTRA · KATHA · AARTI */}
      {content?.mantra_block?.mantra && (
        <section className={CARD}>
          <h2 className={H2}>📿 Mantra</h2>
          <p className="text-xl text-amber-900">{content.mantra_block.mantra}</p>
          {content.mantra_block.meaning && <p className="mt-2 text-gray-700">{content.mantra_block.meaning}</p>}
          <p className="mt-2 text-sm text-gray-600">
            {content.mantra_block.count} {content.mantra_block.when}
          </p>
        </section>
      )}
      {content?.katha && (
        <section className={CARD}>
          <h2 className={H2}>📖 {name} Katha</h2>
          <div className="whitespace-pre-line text-gray-800">{content.katha}</div>
        </section>
      )}
      {content?.aarti && (
        <section className={CARD}>
          <h2 className={H2}>🪔 Aarti</h2>
          <p className="text-gray-800">{content.aarti}</p>
        </section>
      )}

      {/* 14 · UPAY BY PROBLEM — not by rashi, by decision */}
      {content?.upay_by_problem?.length ? (
        <section className="mb-8 rounded-xl border border-amber-300 bg-amber-50/60 p-5">
          <h2 className={H2}>🔮 {name} upay, by what you are facing</h2>
          <div className="space-y-3">
            {content.upay_by_problem.map((u, i) => (
              <div key={i}>
                <p className="font-medium text-gray-900">{u.problem}</p>
                <p className="text-gray-700">{u.upay}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* 15 · SOLUTION BRIDGE — the honest limit, then the services */}
      {content?.solution_bridge && (
        <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
          <h2 className="text-xl font-bold">Is {name} significant for you personally?</h2>
          <div className="mt-2 whitespace-pre-line text-amber-50">{content.solution_bridge}</div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link href="/#birth-form" className="rounded-lg bg-white px-4 py-2 text-center font-semibold text-amber-800">
              Personal Kundli — ₹51
            </Link>
            <Link href="/kundali-milan" className="rounded-lg border border-white px-4 py-2 text-center font-semibold text-white">
              Kundali Milan
            </Link>
            <Link href="/calculators" className="rounded-lg border border-white px-4 py-2 text-center font-semibold text-white">
              Hastrekha
            </Link>
            <Link href="/swapna" className="rounded-lg border border-white px-4 py-2 text-center font-semibold text-white">
              Swapna Shastra
            </Link>
          </div>
        </section>
      )}

      {/* 16 · FAQ */}
      {faqs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            {name} in {c.name} — frequently asked
          </h2>
          <div className="space-y-4">
            {faqs.map((q, i) => (
              <details key={i} className="rounded-lg border border-gray-200 p-4">
                <summary className="cursor-pointer font-medium text-gray-900">{q.q}</summary>
                <p className="mt-2 text-gray-700">{q.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 17 · RELATED */}
      {otherFestivals.length > 0 && (
        <section className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Coming up in {c.name}</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {otherFestivals
              .filter(o => !(o.festival_scope === "regional" && o.home_states?.length && !o.home_states.includes(c.state)))
              .map(o => (
                <li key={o.festival_slug}>
                  <Link href={`/${c.slug}/events/${o.festival_slug}`} className="text-amber-700 hover:underline">
                    {o.festival_name}
                  </Link>
                  <span className="ml-2 text-sm text-gray-500">{o.date}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="mt-6 border-t border-gray-200 pt-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-amber-700">
          <li><Link href={`/${c.slug}/panchang`} className="hover:underline">Panchang for {c.name}</Link></li>
          <li><Link href={`/events/${f.festival_slug}`} className="hover:underline">{name} (All-India)</Link></li>
          <li><Link href={`/panchang/${f.date}`} className="hover:underline">Panchang for this day</Link></li>
          <li><Link href="/upcoming-events" className="hover:underline">All festivals</Link></li>
        </ul>
      </section>

      <CalculatorLinks />

      <p className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
        Dates and timings computed by Trikaal Vaani&apos;s own engine. Reviewed by{" "}
        {AUTHOR_NAME}, {AUTHOR_TITLE}.
      </p>
    </main>
  );
}

// END — app/[domain]/events/[slug]/page.tsx v3.0 | Trikaal Vaani | Rohiit Gupta
