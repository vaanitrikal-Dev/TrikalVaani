// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     components/festival/FestivalPillar.tsx
// Version:  v1.0 (28 Aug 2026)
// Owner:    Rohiit Gupta, Chief Vedic Architect
//
// ── WHAT THIS IS ───────────────────────────────────────────────────────────
//
// The whole festival pillar page, written once, used by all four routes:
//
//     /events/{slug}                     English · national
//     /{city}/events/{slug}              English · city
//     /hi/{slug}                         Hindi   · national
//     /hi/{city}/{slug}                  Hindi   · city
//
// Those four route files are a dozen lines each. They decide the language and
// the city and hand both to this component. Everything else lives here.
//
// The alternative was four 700-line files that are 95% identical. The first
// time a section changed it would have to change in four places, and the day
// someone forgets the fourth is the day the Hindi Hyderabad page quietly
// diverges from the rest. One file cannot drift from itself.
//
// ── LANGUAGE ───────────────────────────────────────────────────────────────
//
// Two things are language-dependent and they come from different places:
//
//   prose   from festival_content, generated separately per language. The
//           Hindi row is NOT a translation — it is written from its own prompt
//           for Hindi search intent, because "करवा चौथ में क्या खाएं" is a
//           different query from "Karva Chauth fasting rules", not a
//           translation of it.
//   labels  from L below, written by hand. "Rahu Kaal" must read "राहुकाल" on
//           the Hindi page and no generator supplies that.
//
// ── URLS ───────────────────────────────────────────────────────────────────
//
// English keeps the year in the slug. Those URLs carry 27,000 impressions a
// quarter and there is no reason to break them for a theoretical gain.
//
// Hindi is new, so it gets the authority slug — no year, one URL that
// accumulates rather than restarting every January:
//
//     /hi/ganesh-chaturthi-kab-hai          not  ...-2026-kab-hai
//
// "kab-hai" is itself the query. The Hindi slug is written for how Hindi is
// searched, never the English slug with a suffix.
// ════════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { callVM } from "@/lib/callVM";
import CalculatorLinks from "@/components/seo/CalculatorLinks";
import citiesData from "@/app/data/cities.json";

export type Lang = "en" | "hi";

export type City = {
  slug: string; name: string; name_hindi: string; state: string;
  latitude: number; longitude: number; description: string;
  famous_temples: string[]; language: string;
};

export type DbFestival = {
  festival_slug: string; festival_name: string; festival_type: string | null;
  planet_ruler: string | null; date: string; year: number | null;
  geo_answer: string | null; dos: string[] | null; donts: string[] | null;
  name_hindi: string | null; muhurat: string | null; regional_note: string | null;
  deity: string | null; mantra: string | null; color: string | null;
  dosha_relief: string | null; festival_scope: string | null;
  home_states: string[] | null;
};

export type Content = {
  base_slug: string; page_slug: string; alt_lang_slug: string | null;
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

export type LocalTerm = { local_name: string; script_name: string | null; note: string | null };

export type Panchang = {
  weekday: string;
  tithi: { name: string; paksha: string; ends: string | null };
  nakshatra: { name: string; pada: number; ends: string | null };
  yoga: { name: string; ends: string | null };
  karana: { name: string; ends: string | null };
  sunrise: string; sunset: string;
  rahu_kaal: string; yamaganda: string; gulika_kaal: string;
  abhijit_muhurat: string;
};

export const SITE_URL = "https://trikalvaani.com";
export const AUTHOR_NAME = "Rohiit Gupta";
export const AUTHOR_TITLE = "Chief Vedic Architect, Trikaal Vaani";
export const OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export const CITY_SLUGS = new Set([
  "delhi", "mumbai", "noida", "gurgaon", "bangalore",
  "hyderabad", "pune", "kolkata", "chennai", "ahmedabad",
]);

export const ALL_CITIES = (citiesData as { cities: City[] }).cities;

// ── Labels ──────────────────────────────────────────────────────────────────
// Written by hand, not generated. A Hindi page whose headings say "Rahu Kaal"
// in Latin script is a translated English page, and reads like one.
const L = {
  en: {
    in: (f: string, c: string) => `${f} in ${c}`,
    readOther: "हिंदी में पढ़ें →",
    timings: (f: string, c: string) => `${f} Timings for ${c}`,
    tithi: "Tithi", nakshatra: "Nakshatra", yogaKarana: "Yoga · Karana",
    abhijit: "Abhijit Muhurat", rahu: "Rahu Kaal",
    yamGulika: "Yamaganda · Gulika", sunriseSunset: "Sunrise · Sunset",
    upto: "upto", pada: "Pada",
    computedFor: (c: string, la: number, lo: number) =>
      `Computed for ${c} (${la}, ${lo}) with Swiss Ephemeris, Lahiri ayanamsha. All five angas read at local sunrise.`,
    freeCta: "Free Kundli — no payment, no signup →",
    whatToDo: (f: string) => `What to do on ${f}`,
    shortLink: "Short of time? → 5-minute puja vidhi",
    howDate: "How this date was determined",
    howDateFoot:
      "Computed by Trikaal Vaani from Swiss Ephemeris and the classical nirnaya rules — Nirnaya Sindhu, Dharma Sindhu, and the Report of the Calendar Reform Committee. Not copied from another calendar.",
    acrossIndia: (f: string) => `${f} timings across India`,
    city: "City", sunrise: "Sunrise",
    whyObserved: (f: string) => `Why ${f} is observed`,
    pujaVidhi: (f: string) => `${f} Puja Vidhi`,
    fiveMin: "5-minute version",
    samagri: (f: string) => `${f} Puja Samagri`,
    essential: "Essential", optional: "Optional",
    substitutes: "If something is unavailable",
    vrat: (f: string) => `${f} Vrat Vidhi`,
    beginsAt: "When it begins", mayEat: "May be eaten", avoid: "To be avoided",
    paran: "Paran", whoNot: "Who traditionally does not fast",
    allowed: (f: string) => `${f}: what is allowed and what is not`,
    dos: "Do's", donts: "Don'ts",
    mistakes: "Common mistakes",
    mantra: "Mantra", katha: (f: string) => `${f} Katha`, aarti: "Aarti",
    upay: (f: string) => `${f} upay, by what you are facing`,
    personal: (f: string) => `Is ${f} significant for you personally?`,
    kundli: "Personal Kundli — ₹51", milan: "Kundali Milan",
    hastrekha: "Hastrekha", swapna: "Swapna Shastra",
    faqHead: (f: string, c: string) => `${f} in ${c} — frequently asked`,
    comingUp: (c: string) => `Coming up in ${c}`,
    explore: "Explore More",
    panchangFor: (c: string) => `Panchang for ${c}`,
    allIndia: (f: string) => `${f} (All-India)`,
    panchangDay: "Panchang for this day", allFestivals: "All festivals",
    footer: `Dates and timings computed by Trikaal Vaani's own engine. Reviewed by ${AUTHOR_NAME}, ${AUTHOR_TITLE}.`,
    knownAs: (st: string, f: string) => `In ${st}, ${f} is known as`,
  },
  hi: {
    in: (f: string, c: string) => `${c} में ${f}`,
    readOther: "Read in English →",
    timings: (f: string, c: string) => `${c} के लिए ${f} का समय`,
    tithi: "तिथि", nakshatra: "नक्षत्र", yogaKarana: "योग · करण",
    abhijit: "अभिजित मुहूर्त", rahu: "राहुकाल",
    yamGulika: "यमगंड · गुलिक", sunriseSunset: "सूर्योदय · सूर्यास्त",
    upto: "तक", pada: "पाद",
    computedFor: (c: string, la: number, lo: number) =>
      `${c} (${la}, ${lo}) के लिए स्विस एफ़ेमेरिस और लाहिड़ी अयनांश से गणना। पाँचों अंग स्थानीय सूर्योदय पर।`,
    freeCta: "मुफ़्त कुंडली — कोई भुगतान नहीं, कोई साइनअप नहीं →",
    whatToDo: (f: string) => `${f} पर क्या करें`,
    shortLink: "समय कम है? → 5-मिनट पूजा विधि",
    howDate: "यह तारीख कैसे तय हुई",
    howDateFoot:
      "त्रिकाल वाणी द्वारा स्विस एफ़ेमेरिस और शास्त्रीय निर्णय नियमों से गणना — निर्णय सिंधु, धर्म सिंधु, और कैलेंडर रिफ़ॉर्म कमेटी की रिपोर्ट। किसी अन्य पंचांग से नकल नहीं।",
    acrossIndia: (f: string) => `भारत भर में ${f} का समय`,
    city: "शहर", sunrise: "सूर्योदय",
    whyObserved: (f: string) => `${f} क्यों मनाया जाता है`,
    pujaVidhi: (f: string) => `${f} पूजा विधि`,
    fiveMin: "5-मिनट विधि",
    samagri: (f: string) => `${f} पूजा सामग्री`,
    essential: "आवश्यक", optional: "वैकल्पिक",
    substitutes: "अगर कुछ उपलब्ध न हो",
    vrat: (f: string) => `${f} व्रत विधि`,
    beginsAt: "व्रत कब शुरू करें", mayEat: "क्या खा सकते हैं",
    avoid: "क्या नहीं खाना चाहिए",
    paran: "पारण", whoNot: "किन्हें परंपरागत रूप से व्रत नहीं रखना चाहिए",
    allowed: (f: string) => `${f}: क्या करें और क्या न करें`,
    dos: "क्या करें", donts: "क्या न करें",
    mistakes: "आम गलतियाँ",
    mantra: "मंत्र", katha: (f: string) => `${f} कथा`, aarti: "आरती",
    upay: (f: string) => `आपकी समस्या के अनुसार ${f} के उपाय`,
    personal: (f: string) => `क्या ${f} आपके लिए विशेष है?`,
    kundli: "व्यक्तिगत कुंडली — ₹51", milan: "कुंडली मिलान",
    hastrekha: "हस्तरेखा", swapna: "स्वप्न शास्त्र",
    faqHead: (f: string, c: string) => `${c} में ${f} — अक्सर पूछे जाने वाले सवाल`,
    comingUp: (c: string) => `${c} में आने वाले त्योहार`,
    explore: "और देखें",
    panchangFor: (c: string) => `${c} का पंचांग`,
    allIndia: (f: string) => `${f} (पूरे भारत)`,
    panchangDay: "इस दिन का पंचांग", allFestivals: "सभी त्योहार",
    footer: `तारीख और समय की गणना त्रिकाल वाणी के अपने इंजन से। समीक्षा: ${AUTHOR_NAME}, ${AUTHOR_TITLE}।`,
    knownAs: (st: string, f: string) => `${st} में ${f} को कहा जाता है`,
  },
} as const;

export const labels = (lang: Lang) => L[lang];

// ── Data ────────────────────────────────────────────────────────────────────

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const FESTIVAL_COLUMNS =
  "festival_slug,festival_name,festival_type,planet_ruler,date,year,geo_answer," +
  "dos,donts,name_hindi,muhurat,regional_note,deity,mantra,color,dosha_relief," +
  "festival_scope,home_states";

export const baseSlug = (s: string) => s.replace(/-20\d\d$/, "");

/** English routes carry the year; Hindi routes carry an authority slug. Both
 *  resolve through festival_content, which stores each side's page_slug. */
export async function resolveFestival(slug: string, lang: Lang) {
  const db = supa();

  if (lang === "en") {
    const { data } = await db.from("festivals_master")
      .select(FESTIVAL_COLUMNS).eq("festival_slug", slug).single();
    return (data as DbFestival) || null;
  }

  // Hindi slug has no year. Find the content row, then the NEXT occurrence of
  // that festival — so /hi/ganesh-chaturthi-kab-hai answers with September 2026
  // today and September 2027 once this year's has passed. The URL never ages.
  const { data: c } = await db.from("festival_content")
    .select("base_slug").eq("page_slug", slug).eq("lang", "hi").single();
  if (!c) return null;
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await db.from("festivals_master")
    .select(FESTIVAL_COLUMNS)
    .like("festival_slug", `${c.base_slug}-%`)
    .gte("date", today).order("date").limit(1);
  return ((data && data[0]) as DbFestival) || null;
}

export async function getContent(base: string, lang: Lang): Promise<Content | null> {
  try {
    const { data } = await supa().from("festival_content").select("*")
      .eq("base_slug", base).eq("lang", lang).eq("is_published", true).single();
    return (data as Content) || null;
  } catch { return null; }
}

/**
 * The local name in this state — Vinayaka Chavithi, Dasara.
 *
 * verified = true is required and that filter is the whole point. A wrong
 * religious term costs more authority than a missing one wins traffic, so
 * unverified rows sit in the table and never reach a page. Three rows are
 * deliberately held back today, each with its reason recorded on the row.
 */
export async function getLocalTerm(base: string, state: string): Promise<LocalTerm | null> {
  try {
    const { data } = await supa().from("festival_local_terms")
      .select("local_name,script_name,note")
      .eq("base_slug", base).eq("state", state).eq("verified", true).limit(1);
    return (data && (data[0] as LocalTerm)) || null;
  } catch { return null; }
}

/**
 * Every clock time on the page, for THIS city's coordinates.
 *
 * Null on any failure, and the caller renders nothing rather than something.
 * Between 4 June and 28 Aug 2026 ten city panchang pages served Delhi's
 * numbers under their own name, because a fallback looked better than a gap.
 * It is not better. A missing table is a gap; a wrong muhurat is somebody
 * doing their puja at the wrong hour.
 */
export async function getPanchang(
  date: string, lat: number, lon: number, city: string
): Promise<Panchang | null> {
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

export async function getUpcoming(exclude: string, limit = 8) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supa().from("festivals_master")
      .select("festival_slug,festival_name,date,festival_scope,home_states")
      .gte("date", today).neq("festival_slug", exclude).order("date").limit(limit);
    return (data ?? []) as Pick<DbFestival,
      "festival_slug" | "festival_name" | "date" | "festival_scope" | "home_states">[];
  } catch { return []; }
}

/** Where a festival lives, in either language. One place, so the four routes
 *  and the hreflang tags can never disagree about it. */
export function festivalHref(
  lang: Lang, citySlug: string | null, enSlug: string, hiSlug: string | null
) {
  if (lang === "en") {
    return citySlug ? `/${citySlug}/events/${enSlug}` : `/events/${enSlug}`;
  }
  const s = hiSlug ?? enSlug;
  return citySlug ? `/hi/${citySlug}/${s}` : `/hi/${s}`;
}

// ── The page ────────────────────────────────────────────────────────────────

export default async function FestivalPillar(
  { festival, city, lang }: { festival: DbFestival; city: City | null; lang: Lang }
) {
  const t = labels(lang);
  const f = festival;
  const base = baseSlug(f.festival_slug);

  const [content, local, panchang, upcoming] = await Promise.all([
    getContent(base, lang),
    city ? getLocalTerm(base, city.state) : Promise.resolve(null),
    city ? getPanchang(f.date, city.latitude, city.longitude, city.name)
         : getPanchang(f.date, 28.6139, 77.209, "New Delhi"),
    getUpcoming(f.festival_slug),
  ]);

  // Other cities where this festival is in scope, each with its own timings.
  const inScope = ALL_CITIES.filter(x =>
    x.slug !== city?.slug &&
    !(f.festival_scope === "regional" && f.home_states?.length &&
      !f.home_states.includes(x.state)));
  const others = (await Promise.all(
    inScope.map(async x => ({ city: x, p: await getPanchang(f.date, x.latitude, x.longitude, x.name) }))
  )).filter(r => r.p) as { city: City; p: Panchang }[];

  const name = lang === "hi" && f.name_hindi ? f.name_hindi : f.festival_name;
  const placeName = city ? (lang === "hi" ? city.name_hindi : city.name) : (lang === "hi" ? "भारत" : "India");
  const pretty = new Date(f.date + "T00:00:00").toLocaleDateString(
    lang === "hi" ? "hi-IN" : "en-IN",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const altHref = content?.alt_lang_slug
    ? festivalHref(lang === "en" ? "hi" : "en", city?.slug ?? null,
        lang === "en" ? content.alt_lang_slug : f.festival_slug,
        lang === "en" ? content.alt_lang_slug : null)
    : null;

  const faqs = content?.faqs ?? [];
  const H2 = "mb-3 text-xl font-bold text-gray-900";
  const CARD = "mb-8 rounded-xl border border-amber-200 bg-white p-5";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {city && <p className="text-sm text-amber-700">{placeName} · {city.state}</p>}
      <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gray-900">
        {city ? t.in(name, placeName) : name}
      </h1>
      <p className="mt-2 text-lg text-gray-700">{pretty}</p>

      {altHref && (
        <p className="mt-2 text-sm">
          <Link href={altHref} className="text-amber-700 underline">{t.readOther}</Link>
        </p>
      )}

      {/* DIRECT ANSWER — what AI search and the answer box lift */}
      {(content?.direct_answer || f.geo_answer) && (
        <section className="mt-6 mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-gray-900">{content?.direct_answer ?? f.geo_answer}</p>
        </section>
      )}

      {/* LOCAL NAME — verified rows only, silent otherwise */}
      {local && city && (
        <section className="mb-8 rounded-xl border border-amber-300 bg-amber-50/60 p-4">
          <p className="text-gray-900">
            {t.knownAs(city.state, name)} <strong>{local.local_name}</strong>
            {local.script_name ? <> ({local.script_name})</> : null}.
            {local.note ? <> {local.note}</> : null}
          </p>
        </section>
      )}

      {/* TIMINGS — computed for this city. Absent, never approximated. */}
      {panchang && (
        <section className={CARD}>
          <h2 className={H2}>🕐 {t.timings(name, placeName)}</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-amber-100">
              <tr><td className="py-2 text-gray-600">{t.tithi}</td>
                  <td className="py-2 text-right font-medium">
                    {panchang.tithi.name} ({panchang.tithi.paksha})
                    {panchang.tithi.ends && <> — {panchang.tithi.ends} {t.upto}</>}
                  </td></tr>
              <tr><td className="py-2 text-gray-600">{t.nakshatra}</td>
                  <td className="py-2 text-right font-medium">
                    {panchang.nakshatra.name}, {t.pada} {panchang.nakshatra.pada}
                    {panchang.nakshatra.ends && <> — {panchang.nakshatra.ends} {t.upto}</>}
                  </td></tr>
              <tr><td className="py-2 text-gray-600">{t.yogaKarana}</td>
                  <td className="py-2 text-right font-medium">{panchang.yoga.name} · {panchang.karana.name}</td></tr>
              <tr><td className="py-2 text-gray-600">{t.abhijit}</td>
                  <td className="py-2 text-right font-medium text-green-800">{panchang.abhijit_muhurat}</td></tr>
              <tr><td className="py-2 text-gray-600">{t.rahu}</td>
                  <td className="py-2 text-right font-medium text-red-700">{panchang.rahu_kaal}</td></tr>
              <tr><td className="py-2 text-gray-600">{t.yamGulika}</td>
                  <td className="py-2 text-right font-medium text-red-700">{panchang.yamaganda} · {panchang.gulika_kaal}</td></tr>
              <tr><td className="py-2 text-gray-600">{t.sunriseSunset}</td>
                  <td className="py-2 text-right font-medium">{panchang.sunrise} · {panchang.sunset}</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-gray-500">
            {t.computedFor(placeName, city?.latitude ?? 28.6139, city?.longitude ?? 77.209)}
          </p>
        </section>
      )}

      <Link href="/#birth-form"
            className="mb-8 block rounded-lg border border-amber-300 bg-white p-3 text-center text-sm text-amber-800 hover:bg-amber-50">
        {t.freeCta}
      </Link>

      {content?.quick_actions?.length ? (
        <section className={CARD}>
          <h2 className={H2}>✅ {t.whatToDo(name)}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-gray-800">
            {content.quick_actions.map((a, i) => <li key={i}>{a}</li>)}
          </ol>
          {content.puja_vidhi_short?.length ? (
            <p className="mt-3 text-sm">
              <a href="#short-vidhi" className="text-amber-700 underline">{t.shortLink}</a>
            </p>
          ) : null}
        </section>
      ) : null}

      {/* HOW THIS DATE WAS DETERMINED — the section nobody else has */}
      {f.regional_note && (
        <section className="mb-8 rounded-xl border-2 border-amber-400 bg-amber-50 p-5">
          <h2 className={H2}>📜 {t.howDate}</h2>
          <p className="whitespace-pre-line text-gray-800">{f.regional_note}</p>
          <p className="mt-3 text-xs text-gray-600">{t.howDateFoot}</p>
        </section>
      )}

      {others.length > 0 && (
        <section className={CARD}>
          <h2 className={H2}>🕐 {t.acrossIndia(name)}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr><th className="py-1">{t.city}</th><th>{t.sunrise}</th><th>{t.abhijit}</th><th>{t.rahu}</th></tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {city && panchang && (
                  <tr className="bg-amber-50">
                    <td className="py-2 font-semibold">{placeName}</td>
                    <td>{panchang.sunrise}</td><td>{panchang.abhijit_muhurat}</td><td>{panchang.rahu_kaal}</td>
                  </tr>
                )}
                {others.map(({ city: x, p }) => (
                  <tr key={x.slug}>
                    <td className="py-2">
                      <Link href={festivalHref(lang, x.slug, f.festival_slug, content?.page_slug ?? null)}
                            className="text-amber-700 hover:underline">
                        {lang === "hi" ? x.name_hindi : x.name}
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

      {content?.significance && (
        <section className="mb-8 prose prose-amber max-w-none">
          <h2 className="text-2xl font-semibold">{t.whyObserved(name)}</h2>
          <div className="whitespace-pre-line text-gray-800">{content.significance}</div>
        </section>
      )}

      {content?.puja_vidhi?.length ? (
        <section className={CARD}>
          <h2 className={H2}>🪔 {t.pujaVidhi(name)}</h2>
          <ol className="list-decimal space-y-3 pl-5 text-gray-800">
            {content.puja_vidhi.map((s, i) => <li key={i}><strong>{s.step}</strong> — {s.detail}</li>)}
          </ol>
        </section>
      ) : null}

      {content?.puja_vidhi_short?.length ? (
        <section id="short-vidhi" className="mb-8 rounded-xl border border-green-300 bg-green-50 p-5">
          <h2 className={H2}>⚡ {t.fiveMin}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-gray-800">
            {content.puja_vidhi_short.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>
      ) : null}

      {content?.samagri && (
        <section className={CARD}>
          <h2 className={H2}>🛒 {t.samagri(name)}</h2>
          {content.samagri.essential?.length ? (
            <><h3 className="mt-2 font-semibold text-gray-800">{t.essential}</h3>
              <ul className="list-disc pl-5 text-gray-700">
                {content.samagri.essential.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
          {content.samagri.optional?.length ? (
            <><h3 className="mt-3 font-semibold text-gray-800">{t.optional}</h3>
              <ul className="list-disc pl-5 text-gray-700">
                {content.samagri.optional.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
          {content.samagri.substitutes?.length ? (
            <><h3 className="mt-3 font-semibold text-gray-800">{t.substitutes}</h3>
              <ul className="list-disc pl-5 text-gray-700">
                {content.samagri.substitutes.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
        </section>
      )}

      {content?.vrat_vidhi && (
        <section className={CARD}>
          <h2 className={H2}>🌙 {t.vrat(name)}</h2>
          {content.vrat_vidhi.start && <p className="text-gray-800"><strong>{t.beginsAt}:</strong> {content.vrat_vidhi.start}</p>}
          {content.vrat_vidhi.may_eat?.length ? (
            <><p className="mt-3 font-semibold text-green-800">{t.mayEat}</p>
              <ul className="list-disc pl-5 text-gray-700">{content.vrat_vidhi.may_eat.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
          {content.vrat_vidhi.avoid?.length ? (
            <><p className="mt-3 font-semibold text-red-800">{t.avoid}</p>
              <ul className="list-disc pl-5 text-gray-700">{content.vrat_vidhi.avoid.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
          {content.vrat_vidhi.paran && <p className="mt-3 text-gray-800"><strong>{t.paran}:</strong> {content.vrat_vidhi.paran}</p>}
          {content.vrat_vidhi.who_should_not && <p className="mt-2 text-gray-800"><strong>{t.whoNot}:</strong> {content.vrat_vidhi.who_should_not}</p>}
          {content.vrat_vidhi.health_note && (
            <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{content.vrat_vidhi.health_note}</p>
          )}
        </section>
      )}

      {content?.dos_donts?.length ? (
        <section className={CARD}>
          <h2 className={H2}>❓ {t.allowed(name)}</h2>
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

      {(f.dos?.length || f.donts?.length) && (
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {f.dos?.length ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <h2 className="mb-3 text-xl font-bold text-green-800">✓ {t.dos}</h2>
              <ul className="list-disc space-y-1 pl-5 text-gray-800">{f.dos.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
          ) : null}
          {f.donts?.length ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h2 className="mb-3 text-xl font-bold text-red-800">✗ {t.donts}</h2>
              <ul className="list-disc space-y-1 pl-5 text-gray-800">{f.donts.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
          ) : null}
        </section>
      )}

      {content?.common_mistakes?.length ? (
        <section className={CARD}>
          <h2 className={H2}>⚠️ {t.mistakes}</h2>
          <ul className="list-disc space-y-2 pl-5 text-gray-800">
            {content.common_mistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </section>
      ) : null}

      {content?.mantra_block?.mantra && (
        <section className={CARD}>
          <h2 className={H2}>📿 {t.mantra}</h2>
          <p className="text-xl text-amber-900">{content.mantra_block.mantra}</p>
          {content.mantra_block.meaning && <p className="mt-2 text-gray-700">{content.mantra_block.meaning}</p>}
          <p className="mt-2 text-sm text-gray-600">{content.mantra_block.count} {content.mantra_block.when}</p>
        </section>
      )}

      {content?.katha && (
        <section className={CARD}>
          <h2 className={H2}>📖 {t.katha(name)}</h2>
          <div className="whitespace-pre-line text-gray-800">{content.katha}</div>
        </section>
      )}

      {content?.aarti && (
        <section className={CARD}>
          <h2 className={H2}>🪔 {t.aarti}</h2>
          <p className="text-gray-800">{content.aarti}</p>
        </section>
      )}

      {content?.upay_by_problem?.length ? (
        <section className="mb-8 rounded-xl border border-amber-300 bg-amber-50/60 p-5">
          <h2 className={H2}>🔮 {t.upay(name)}</h2>
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

      {content?.solution_bridge && (
        <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
          <h2 className="text-xl font-bold">{t.personal(name)}</h2>
          <div className="mt-2 whitespace-pre-line text-amber-50">{content.solution_bridge}</div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link href="/#birth-form" className="rounded-lg bg-white px-4 py-2 text-center font-semibold text-amber-800">{t.kundli}</Link>
            <Link href="/kundali-milan" className="rounded-lg border border-white px-4 py-2 text-center font-semibold text-white">{t.milan}</Link>
            <Link href="/calculators" className="rounded-lg border border-white px-4 py-2 text-center font-semibold text-white">{t.hastrekha}</Link>
            <Link href="/swapna" className="rounded-lg border border-white px-4 py-2 text-center font-semibold text-white">{t.swapna}</Link>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t.faqHead(name, placeName)}</h2>
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

      {upcoming.length > 0 && (
        <section className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">{t.comingUp(placeName)}</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {upcoming
              .filter(o => !(o.festival_scope === "regional" && o.home_states?.length &&
                             city && !o.home_states.includes(city.state)))
              .map(o => (
                <li key={o.festival_slug}>
                  <Link href={festivalHref("en", city?.slug ?? null, o.festival_slug, null)}
                        className="text-amber-700 hover:underline">{o.festival_name}</Link>
                  <span className="ml-2 text-sm text-gray-500">{o.date}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="mt-6 border-t border-gray-200 pt-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{t.explore}</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-amber-700">
          {city && <li><Link href={`/${city.slug}/panchang`} className="hover:underline">{t.panchangFor(placeName)}</Link></li>}
          {city && <li><Link href={festivalHref(lang, null, f.festival_slug, content?.page_slug ?? null)} className="hover:underline">{t.allIndia(name)}</Link></li>}
          <li><Link href={`/panchang/${f.date}`} className="hover:underline">{t.panchangDay}</Link></li>
          <li><Link href="/upcoming-events" className="hover:underline">{t.allFestivals}</Link></li>
        </ul>
      </section>

      <CalculatorLinks />

      <p className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">{t.footer}</p>
    </main>
  );
}

// END — components/festival/FestivalPillar.tsx v1.0 | Trikaal Vaani | Rohiit Gupta
