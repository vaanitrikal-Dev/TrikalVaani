// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     components/festival/FestivalPillar.tsx
// Version:  v2.1 (28 Aug 2026) — dark design, plus the researched city block
//
// ── WHY v2.0 ───────────────────────────────────────────────────────────────
//
// v1.x was built as a white page with grey text. The rest of trikalvaani.com
// is dark — bg-[#080B12], white body text, amber-300 headings, slate-900/40
// cards — and has been since the blog was built. A festival page dropped into
// that site read as though it came from somewhere else, and at 4,000 words of
// unbroken light-grey prose it was hard to read on its own terms too.
//
// Nothing about the data changed here. Every class in this file now comes from
// app/blog/[slug]/page.tsx, so the two are the same product:
//
//     shell      min-h-screen bg-[#080B12] text-white
//     column     mx-auto max-w-4xl px-4 py-12 md:py-16
//     h1         text-3xl md:text-4xl lg:text-5xl font-bold leading-tight
//     h2         mt-12 mb-4 text-2xl md:text-3xl font-bold text-amber-300
//     card       rounded-xl border border-amber-900/40 bg-slate-900/40 p-5
//     answer     border-amber-700/40 bg-gradient-to-br from-amber-950/50
//     cta        border-amber-700/50 bg-gradient-to-r from-amber-900/30
//     faq        collapsible rows with the + that rotates on open
//     body       text-slate-200 leading-relaxed
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
  puja_kaal: string | null;
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

export type LocalTerm = {
  local_name: string; script_name: string | null; note: string | null;
  visarjan_name: string | null;
};

/** What the festival actually looks like in one city — the researched block. */
export type CityNote = {
  heading: string | null;
  body: string;
  highlights: string[] | null;
  sources: { uri?: string; title?: string; query?: string }[] | null;
};

/** The immersion, when it falls on a day of its own. */
export type Visarjan = {
  label: string; note: string | null; kaal: string | null;
  date: string; slug: string; muhurat: string | null;
};

export type Panchang = {
  weekday: string;
  tithi: { name: string; paksha: string; ends: string | null };
  nakshatra: { name: string; pada: number; ends: string | null };
  yoga: { name: string; ends: string | null };
  karana: { name: string; ends: string | null };
  sunrise: string; sunset: string;
  rahu_kaal: string; yamaganda: string; gulika_kaal: string;
  abhijit_muhurat: string;
  /** All seven windows, returned by /panchang v2.1. Which one this festival
   *  uses is named by festivals_catalog.puja_kaal — the same mapping the
   *  engine uses to DECIDE the date, so the muhurat shown can never disagree
   *  with the reasoning printed further down the page. */
  kaal?: Record<string, string>;
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
    pujaMuhurat: "Puja Muhurat",
    visarjanHead: (l: string) => l,
    visarjanOn: "Immersion day",
    visarjanMuhurat: "Immersion muhurat",
    calledHere: (st: string) => `In ${st} this is called`,
    inThisCity: (f: string, c: string) => `${f} in ${c}`,
    localSources: "Researched from published sources",
    kaalName: {
      pratah: "Pratah", sangava: "Sangava", madhyahna: "Madhyahna",
      aparahna: "Aparahna", sayahna: "Sayahna", pradosh: "Pradosh",
      nishita: "Nishita",
    } as Record<string, string>,
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
    pujaMuhurat: "पूजा मुहूर्त",
    visarjanHead: (l: string) => l,
    visarjanOn: "विसर्जन का दिन",
    visarjanMuhurat: "विसर्जन मुहूर्त",
    calledHere: (st: string) => `${st} में इसे कहते हैं`,
    inThisCity: (f: string, c: string) => `${c} में ${f}`,
    localSources: "प्रकाशित स्रोतों से",
    kaalName: {
      pratah: "प्रातः", sangava: "संगव", madhyahna: "मध्याह्न",
      aparahna: "अपराह्न", sayahna: "सायाह्न", pradosh: "प्रदोष",
      nishita: "निशीथ",
    } as Record<string, string>,
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

/** festivals_master has no puja_kaal — it lives on the catalog, once, because
 *  it does not change between years. Fetched alongside. */
/**
 * The immersion day, its date and its muhurat.
 *
 * Ganesh Chaturthi is installed on one day and immersed ten days later on
 * Anant Chaturdashi; Durga Puja is immersed on Vijayadashami. Both dates come
 * from festivals_master, so the immersion is computed by the same engine as
 * the festival and cannot drift from it.
 *
 * The concept was absent from the schema, the prompt and the page until
 * 28 Aug 2026, while Search Console showed 810 impressions and zero clicks on
 * nimajjanam and visarjan queries for Ganesh Chaturthi alone. The page ranked
 * for every one of them without containing the word.
 */
export async function getVisarjan(
  base: string, lat: number, lon: number, cityName: string
): Promise<Visarjan | null> {
  try {
    const { data: cat } = await supa().from("festivals_catalog")
      .select("visarjan_slug,visarjan_kaal,visarjan_note,visarjan_label")
      .eq("base_slug", base).single();
    if (!cat?.visarjan_slug) return null;

    const today = new Date().toISOString().slice(0, 10);
    const { data: rows } = await supa().from("festivals_master")
      .select("festival_slug,date")
      .like("festival_slug", `${cat.visarjan_slug}-%`)
      .gte("date", today).order("date").limit(1);
    const row = rows?.[0];
    if (!row) return null;

    // Its muhurat, in the city being viewed — not the festival's own.
    const p = await getPanchang(row.date, lat, lon, cityName);
    const muhurat = (cat.visarjan_kaal && p?.kaal?.[cat.visarjan_kaal]) || null;

    return {
      label: cat.visarjan_label || "Visarjan",
      note: cat.visarjan_note ?? null,
      kaal: cat.visarjan_kaal ?? null,
      date: row.date, slug: row.festival_slug, muhurat,
    };
  } catch { return null; }
}

/**
 * The city block: Khairatabad and Tank Bund for Hyderabad, Lalbaugcha Raja for
 * Mumbai, Golu for Chennai.
 *
 * Written with Google Search grounding — the one place in this codebase that
 * uses it. Every other generated field comes from the engine, which is more
 * reliable than the festival web. This is the opposite case: "what happens in
 * Hyderabad on Ganesh Chaturthi" is not in any ephemeris, and a model asked to
 * recall it unaided will put a real temple in the wrong city.
 *
 * is_published gates rendering and defaults false. A grounded claim is better
 * sourced than a recalled one, but the web is wrong too, and this is the
 * section whose entire value is being right about a place.
 */
export async function getCityNote(
  base: string, citySlug: string, lang: Lang
): Promise<CityNote | null> {
  try {
    const { data } = await supa().from("festival_city_notes")
      .select("heading,body,highlights,sources")
      .eq("base_slug", base).eq("city_slug", citySlug).eq("lang", lang)
      .eq("is_published", true).limit(1);
    return (data && (data[0] as CityNote)) || null;
  } catch { return null; }
}

async function getPujaKaal(base: string): Promise<string | null> {
  try {
    const { data } = await supa().from("festivals_catalog")
      .select("puja_kaal").eq("base_slug", base).single();
    return (data?.puja_kaal as string) ?? null;
  } catch { return null; }
}

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
      .select("local_name,script_name,note,visarjan_name")
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

/**
 * Title, description and keyword set for one city page.
 *
 * ── WHY THIS IS COMPOSED HERE AND NOT GENERATED ────────────────────────────
 *
 * Gemini writes ONE prose row per festival per language, which is correct — the
 * puja vidhi does not differ between Mumbai and Hyderabad, and generating it
 * eleven times would cost eleven times as much to produce eleven near-identical
 * pages.
 *
 * But I treated the SEO title and description as prose and let them come from
 * that same city-agnostic row. They are not prose. Measured on the live
 * Hyderabad page, 28 Aug 2026:
 *
 *     title        "...Ganesh Chaturthi 2026 ... — Hyderabad"   city, no state
 *     description  "Find the exact date and computed local
 *                   muhurat for Ganesh Chaturthi 2026..."       neither
 *
 * Against Search Console for that one festival:
 *
 *     ganesh chaturthi 2026 in telangana          112 impressions, 0 clicks
 *     vinayaka chavithi 2026 in telangana         106
 *     vinayaka chavithi 2026 hyderabad             82
 *     when is ganesh chaturthi in 2026 in telangana 78
 *
 * The page ranks for those and the description it shows them contains neither
 * the state nor the name they used. Composing costs nothing, cannot drift from
 * the truth, and needs no model call — the city, the state and the verified
 * local term are all already in hand at render time.
 */
export function buildMeta(opts: {
  lang: Lang; festival: DbFestival; city: City | null;
  content: Content | null; local: LocalTerm | null; visarjan?: Visarjan | null;
}) {
  const { lang, festival: f, city, content, local, visarjan } = opts;
  const name = lang === "hi" && f.name_hindi ? f.name_hindi : f.festival_name;
  const place = city ? (lang === "hi" ? city.name_hindi : city.name) : null;
  const alsoCalled = local?.local_name ?? null;

  // TITLE — festival, local name where one is verified, then the city.
  const titleCore = content?.seo_title ?? (lang === "hi"
    ? `${name} कब है — तारीख, मुहूर्त और पूजा विधि`
    : `${name}: Date, Puja Muhurat & Vidhi`);
  const title = place
    ? (alsoCalled && !titleCore.includes(alsoCalled)
        ? `${titleCore} — ${alsoCalled}, ${place}`
        : `${titleCore} — ${place}`)
    : titleCore;

  // DESCRIPTION — always names the city AND the state, because "in telangana"
  // is how the query is typed, and the local name when there is a verified one.
  let description: string;
  if (place && city) {
    const also = alsoCalled ? (lang === "hi" ? `${city.state} में ${alsoCalled}। ` : `Known in ${city.state} as ${alsoCalled}. `) : "";
    const imm = local?.visarjan_name
      ? (lang === "hi" ? `${local.visarjan_name} का समय भी। ` : `${local.visarjan_name} timing too. `)
      : "";
    description = lang === "hi"
      ? `${place} (${city.state}) में ${name} — तिथि, पूजा मुहूर्त, राहुकाल और सूर्योदय, ${place} के लिए गणना। ${also}${imm}पूजा विधि और व्रत नियम।`
      : `${name} in ${place}, ${city.state} — tithi, puja muhurat, Rahu Kaal and sunrise computed for ${place}. ${also}${imm}Puja vidhi and vrat rules.`;
  } else {
    description = content?.seo_description ?? (lang === "hi"
      ? `${name} की सही तारीख, पूजा मुहूर्त, व्रत विधि और शहरवार समय।`
      : `${name}: exact date, puja muhurat, vidhi and city-wise timings.`);
  }
  if (description.length > 158) description = description.slice(0, 155).trimEnd() + "…";

  // KEYWORDS — the base set from the content row, crossed with this city and
  // state, plus the local name. Mechanical, so it cannot be wrong.
  const base = content?.keywords ?? [];
  const keywords = new Set(base);
  if (city) {
    const cityForms = [city.name, city.slug, city.state];
    for (const k of base.slice(0, 12)) {
      for (const cf of cityForms) keywords.add(`${k} ${cf}`);
    }
    for (const cf of cityForms) {
      keywords.add(`${f.festival_name} ${cf}`);
      keywords.add(`${f.festival_name} ${f.year ?? ""} ${cf}`.replace(/\s+/g, " ").trim());
      if (alsoCalled) {
        keywords.add(`${alsoCalled} ${cf}`);
        keywords.add(`${alsoCalled} ${f.year ?? ""} ${cf}`.replace(/\s+/g, " ").trim());
      }
    }
  }
  if (alsoCalled) keywords.add(alsoCalled);

  return { title, description, keywords: Array.from(keywords).slice(0, 60) };
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

  const [content, local, panchang, upcoming, pujaKaal, visarjan, cityNote] = await Promise.all([
    getContent(base, lang),
    city ? getLocalTerm(base, city.state) : Promise.resolve(null),
    city ? getPanchang(f.date, city.latitude, city.longitude, city.name)
         : getPanchang(f.date, 28.6139, 77.209, "New Delhi"),
    getUpcoming(f.festival_slug),
    getPujaKaal(base),
    getVisarjan(base, city?.latitude ?? 28.6139, city?.longitude ?? 77.209,
                city?.name ?? "New Delhi"),
    city ? getCityNote(base, city.slug, lang) : Promise.resolve(null),
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
  // Design tokens lifted verbatim from app/blog/[slug]/page.tsx so a festival
  // page and a blog post are visibly the same site.
  const H2   = "mt-12 mb-4 text-2xl md:text-3xl font-bold text-amber-300";
  const CARD = "my-8 rounded-xl border border-amber-900/40 bg-slate-900/40 p-5 md:p-6";
  const BODY = "text-slate-200 leading-relaxed";
  const LABEL = "text-slate-400";
  const VALUE = "font-semibold text-amber-100";

  return (
    <article className="min-h-screen bg-[#080B12] text-white">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">

        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-400">
          <Link href="/" className="hover:text-amber-300 transition">Home</Link>
          {city && <> · <Link href={`/${city.slug}/panchang`} className="hover:text-amber-300 transition">{placeName}</Link></>}
          <> · <span className="text-slate-300">{name}</span></>
        </nav>

        {city && (
          <span className="inline-block rounded-full bg-amber-900/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
            {placeName} · {city.state}
          </span>
        )}
        <h1 className="mb-4 mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
          {city ? t.in(name, placeName) : name}
        </h1>
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span className="text-amber-200">{pretty}</span>
          {altHref && (
            <>· <Link href={altHref} className="hover:text-amber-300 transition">{t.readOther}</Link></>
          )}
        </div>

      {/* DIRECT ANSWER — what AI search and the answer box lift */}
        {(content?.direct_answer || f.geo_answer) && (
          <section className="mb-12 rounded-xl border border-amber-700/40 bg-gradient-to-br from-amber-950/50 to-slate-900/50 p-6 md:p-8">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-lg font-bold text-amber-300">
                {lang === "hi" ? "त्रिकाल संदेश — सीधा उत्तर" : "Trikaal Sandesh — Direct Answer"}
              </h2>
            </div>
            <p className="text-base md:text-lg leading-relaxed text-amber-50">
              {content?.direct_answer ?? f.geo_answer}
            </p>
          </section>
        )}

      {/* LOCAL NAME — verified rows only, silent otherwise */}
        {local && city && (
          <aside className="my-6 rounded-lg border-l-4 border-amber-500 bg-amber-950/30 px-5 py-4">
            <p className={BODY}>
              {t.knownAs(city.state, name)} <strong className="text-amber-200">{local.local_name}</strong>
            {local.script_name ? <> ({local.script_name})</> : null}.
              {local.note ? <> {local.note}</> : null}
            </p>
          </aside>
        )}

      {/* TIMINGS — computed for this city. Absent, never approximated. */}
      {panchang && (
        <section className={CARD}>
          <h2 className={H2}>🕐 {t.timings(name, placeName)}</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-amber-900/30">
              <tr><td className="py-2 text-slate-400">{t.tithi}</td>
                  <td className="py-2 text-right font-semibold text-amber-100">
                    {panchang.tithi.name} ({panchang.tithi.paksha})
                    {panchang.tithi.ends && <> — {panchang.tithi.ends} {t.upto}</>}
                  </td></tr>
              <tr><td className="py-2 text-slate-400">{t.nakshatra}</td>
                  <td className="py-2 text-right font-semibold text-amber-100">
                    {panchang.nakshatra.name}, {t.pada} {panchang.nakshatra.pada}
                    {panchang.nakshatra.ends && <> — {panchang.nakshatra.ends} {t.upto}</>}
                  </td></tr>
              <tr><td className="py-2 text-slate-400">{t.yogaKarana}</td>
                  <td className="py-2 text-right font-semibold text-amber-100">{panchang.yoga.name} · {panchang.karana.name}</td></tr>
              {/* The window the rite is actually performed in. This is the
                  number people search for; before v3.1 the page showed Rahu
                  Kaal and a generic Abhijit and never named it. */}
              {pujaKaal && panchang.kaal?.[pujaKaal] && (
                <tr className="bg-amber-50">
                  <td className="py-2 font-semibold text-amber-200">{t.pujaMuhurat}</td>
                  <td className="py-2 text-right font-bold text-amber-300">
                    {panchang.kaal[pujaKaal]}
                    <span className="ml-1 font-normal text-xs text-slate-400">
                      ({t.kaalName[pujaKaal] ?? pujaKaal})
                    </span>
                  </td>
                </tr>
              )}
              <tr><td className="py-2 text-slate-400">{t.abhijit}</td>
                  <td className="py-2 text-right font-semibold text-emerald-300">{panchang.abhijit_muhurat}</td></tr>
              <tr><td className="py-2 text-slate-400">{t.rahu}</td>
                  <td className="py-2 text-right font-semibold text-rose-300">{panchang.rahu_kaal}</td></tr>
              <tr><td className="py-2 text-slate-400">{t.yamGulika}</td>
                  <td className="py-2 text-right font-semibold text-rose-300">{panchang.yamaganda} · {panchang.gulika_kaal}</td></tr>
              <tr><td className="py-2 text-slate-400">{t.sunriseSunset}</td>
                  <td className="py-2 text-right font-semibold text-amber-100">{panchang.sunrise} · {panchang.sunset}</td></tr>
            </tbody>
          </table>
          <p className="mt-4 text-xs text-slate-500">
            {t.computedFor(placeName, city?.latitude ?? 28.6139, city?.longitude ?? 77.209)}
          </p>
        </section>
      )}

      {/* IMMERSION — its own day, its own muhurat, and the local word for it.
          810 impressions a quarter arrived on nimajjanam and visarjan queries
          before this section existed, every one of them at zero clicks. */}
      {visarjan && (
        <section className="my-10 rounded-xl border border-sky-800/50 bg-sky-950/30 p-6">
          <h2 className={H2}>
            🌊 {t.visarjanHead(local?.visarjan_name || visarjan.label)}
          </h2>
          {local?.visarjan_name && city && (
            <p className="mb-2 text-sm text-slate-300">
              {t.calledHere(city.state)} <strong>{local.visarjan_name}</strong>.
            </p>
          )}
          <table className="w-full text-sm">
            <tbody className="divide-y divide-sky-900/40">
              <tr>
                <td className="py-2 text-slate-400">{t.visarjanOn}</td>
                <td className="py-2 text-right font-semibold text-amber-100">
                  <Link href={festivalHref(lang, city?.slug ?? null, visarjan.slug, null)}
                        className="text-amber-300 hover:text-amber-200 transition">
                    {new Date(visarjan.date + "T00:00:00").toLocaleDateString(
                      lang === "hi" ? "hi-IN" : "en-IN",
                      { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </Link>
                </td>
              </tr>
              {visarjan.muhurat && (
                <tr>
                  <td className="py-2 text-slate-400">{t.visarjanMuhurat}</td>
                  <td className="py-2 text-right font-bold text-blue-900">
                    {visarjan.muhurat}
                    {visarjan.kaal && (
                      <span className="ml-1 font-normal text-xs text-slate-400">
                        ({t.kaalName[visarjan.kaal] ?? visarjan.kaal})
                      </span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {visarjan.note && <p className="mt-4 text-sm text-slate-300">{visarjan.note}</p>}
        </section>
      )}

        {/* WHAT THIS FESTIVAL LOOKS LIKE HERE.
            Placed high, because it is the only thing on this page that the
            national page cannot also say — and the reason a reader in
            Hyderabad should be on the Hyderabad URL. */}
        {cityNote && city && (
          <section className="my-10 rounded-xl border border-amber-800/50 bg-amber-950/25 p-6 md:p-8">
            <h2 className="mb-4 text-2xl md:text-3xl font-bold text-amber-300">
              {cityNote.heading || t.inThisCity(name, placeName)}
            </h2>
            <div className="space-y-4">
              {cityNote.body.split(/\n\s*\n/).map((para, i) => (
                <p key={i} className="text-slate-200 leading-relaxed">{para}</p>
              ))}
            </div>
            {cityNote.highlights?.length ? (
              <ul className="mt-6 space-y-2">
                {cityNote.highlights.map((h, i) => (
                  <li key={i} className="flex gap-3 text-slate-200 leading-relaxed">
                    <span className="text-amber-400" aria-hidden>◆</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {cityNote.sources?.some(x => x.uri) && (
              <p className="mt-5 text-xs text-slate-500">
                {t.localSources}
                {" · "}
                {cityNote.sources.filter(x => x.uri).length}
              </p>
            )}
          </section>
        )}

        <Link href="/#birth-form"
              className="my-8 block rounded-lg border border-amber-700/50 bg-amber-950/30 p-4 text-center text-sm font-semibold text-amber-300 hover:bg-amber-900/30 transition">
          {t.freeCta}
        </Link>

      {content?.quick_actions?.length ? (
        <section className={CARD}>
          <h2 className={H2}>✅ {t.whatToDo(name)}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-slate-200 leading-relaxed marker:text-amber-400">
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
        <section className="my-10 rounded-xl border border-amber-700/50 bg-gradient-to-br from-amber-950/50 to-slate-900/50 p-6 md:p-8">
          <h2 className={H2}>📜 {t.howDate}</h2>
          <p className="whitespace-pre-line text-slate-200 leading-relaxed">{f.regional_note}</p>
          <p className="mt-4 text-xs text-slate-500">{t.howDateFoot}</p>
        </section>
      )}

      {others.length > 0 && (
        <section className={CARD}>
          <h2 className={H2}>🕐 {t.acrossIndia(name)}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr><th className="py-1">{t.city}</th><th>{t.sunrise}</th><th>{t.abhijit}</th><th>{t.rahu}</th></tr>
              </thead>
              <tbody className="divide-y divide-amber-900/30">
                {city && panchang && (
                  <tr className="bg-amber-50">
                    <td className="py-2 font-semibold text-amber-200">{placeName}</td>
                    <td>{panchang.sunrise}</td><td>{panchang.abhijit_muhurat}</td><td>{panchang.rahu_kaal}</td>
                  </tr>
                )}
                {others.map(({ city: x, p }) => (
                  <tr key={x.slug}>
                    <td className="py-2">
                      <Link href={festivalHref(lang, x.slug, f.festival_slug, content?.page_slug ?? null)}
                            className="text-amber-300 hover:text-amber-200 transition">
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
        <section className="my-10">
          <h2 className="mt-12 mb-4 text-2xl md:text-3xl font-bold text-amber-300">{t.whyObserved(name)}</h2>
          <div className="whitespace-pre-line text-slate-200 leading-relaxed">{content.significance}</div>
        </section>
      )}

      {content?.puja_vidhi?.length ? (
        <section className={CARD}>
          <h2 className={H2}>🪔 {t.pujaVidhi(name)}</h2>
          <ol className="list-decimal space-y-3 pl-5 text-slate-200 leading-relaxed marker:text-amber-400">
            {content.puja_vidhi.map((s, i) => <li key={i}><strong className="text-amber-200">{s.step}</strong> — {s.detail}</li>)}
          </ol>
        </section>
      ) : null}

      {content?.puja_vidhi_short?.length ? (
        <section id="short-vidhi" className="my-10 rounded-xl border border-emerald-800/50 bg-emerald-950/25 p-6">
          <h2 className={H2}>⚡ {t.fiveMin}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-slate-200 leading-relaxed marker:text-amber-400">
            {content.puja_vidhi_short.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>
      ) : null}

      {content?.samagri && (
        <section className={CARD}>
          <h2 className={H2}>🛒 {t.samagri(name)}</h2>
          {content.samagri.essential?.length ? (
            <><h3 className="mt-4 mb-1 font-semibold text-amber-200">{t.essential}</h3>
              <ul className="list-disc pl-5 text-slate-200 leading-relaxed marker:text-amber-400">
                {content.samagri.essential.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
          {content.samagri.optional?.length ? (
            <><h3 className="mt-4 mb-1 font-semibold text-amber-200">{t.optional}</h3>
              <ul className="list-disc pl-5 text-slate-200 leading-relaxed marker:text-amber-400">
                {content.samagri.optional.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
          {content.samagri.substitutes?.length ? (
            <><h3 className="mt-4 mb-1 font-semibold text-amber-200">{t.substitutes}</h3>
              <ul className="list-disc pl-5 text-slate-200 leading-relaxed marker:text-amber-400">
                {content.samagri.substitutes.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
        </section>
      )}

      {content?.vrat_vidhi && (
        <section className={CARD}>
          <h2 className={H2}>🌙 {t.vrat(name)}</h2>
          {content.vrat_vidhi.start && <p className="text-slate-200 leading-relaxed"><strong className="text-amber-200">{t.beginsAt}:</strong> {content.vrat_vidhi.start}</p>}
          {content.vrat_vidhi.may_eat?.length ? (
            <><p className="mt-4 mb-1 font-semibold text-emerald-300">{t.mayEat}</p>
              <ul className="list-disc pl-5 text-slate-200 leading-relaxed marker:text-amber-400">{content.vrat_vidhi.may_eat.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
          {content.vrat_vidhi.avoid?.length ? (
            <><p className="mt-4 mb-1 font-semibold text-rose-300">{t.avoid}</p>
              <ul className="list-disc pl-5 text-slate-200 leading-relaxed marker:text-amber-400">{content.vrat_vidhi.avoid.map((s, i) => <li key={i}>{s}</li>)}</ul></>
          ) : null}
          {content.vrat_vidhi.paran && <p className="mt-4 text-slate-200 leading-relaxed"><strong className="text-amber-200">{t.paran}:</strong> {content.vrat_vidhi.paran}</p>}
          {content.vrat_vidhi.who_should_not && <p className="mt-3 text-slate-200 leading-relaxed"><strong className="text-amber-200">{t.whoNot}:</strong> {content.vrat_vidhi.who_should_not}</p>}
          {content.vrat_vidhi.health_note && (
            <p className="mt-5 rounded-lg border border-sky-800/50 bg-sky-950/40 p-4 text-sm text-sky-200">{content.vrat_vidhi.health_note}</p>
          )}
        </section>
      )}

      {content?.dos_donts?.length ? (
        <section className={CARD}>
          <h2 className={H2}>❓ {t.allowed(name)}</h2>
          <div className="space-y-3">
            {content.dos_donts.map((d, i) => (
              <div key={i}>
                <p className="font-semibold text-amber-200">{d.q}</p>
                <p className="text-slate-200 leading-relaxed">{d.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {(f.dos?.length || f.donts?.length) && (
        <section className="my-10 grid gap-4 md:grid-cols-2">
          {f.dos?.length ? (
            <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/25 p-5">
              <h2 className="mb-3 text-xl font-bold text-emerald-300">✓ {t.dos}</h2>
              <ul className="list-disc space-y-1 pl-5 text-slate-200 leading-relaxed marker:text-amber-400">{f.dos.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
          ) : null}
          {f.donts?.length ? (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/25 p-5">
              <h2 className="mb-3 text-xl font-bold text-rose-300">✗ {t.donts}</h2>
              <ul className="list-disc space-y-1 pl-5 text-slate-200 leading-relaxed marker:text-amber-400">{f.donts.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
          ) : null}
        </section>
      )}

      {content?.common_mistakes?.length ? (
        <section className={CARD}>
          <h2 className={H2}>⚠️ {t.mistakes}</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-200 leading-relaxed marker:text-amber-400">
            {content.common_mistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </section>
      ) : null}

      {content?.mantra_block?.mantra && (
        <section className={CARD}>
          <h2 className={H2}>📿 {t.mantra}</h2>
          <p className="text-2xl text-amber-200">{content.mantra_block.mantra}</p>
          {content.mantra_block.meaning && <p className="mt-2 text-slate-200 leading-relaxed">{content.mantra_block.meaning}</p>}
          <p className="mt-3 text-sm text-slate-400">{content.mantra_block.count} {content.mantra_block.when}</p>
        </section>
      )}

      {content?.katha && (
        <section className={CARD}>
          <h2 className={H2}>📖 {t.katha(name)}</h2>
          <div className="whitespace-pre-line text-slate-200 leading-relaxed">{content.katha}</div>
        </section>
      )}

      {content?.aarti && (
        <section className={CARD}>
          <h2 className={H2}>🪔 {t.aarti}</h2>
          <p className="text-slate-200 leading-relaxed">{content.aarti}</p>
        </section>
      )}

      {content?.upay_by_problem?.length ? (
        <section className="my-10 rounded-xl border border-amber-800/50 bg-amber-950/25 p-6">
          <h2 className={H2}>🔮 {t.upay(name)}</h2>
          <div className="space-y-3">
            {content.upay_by_problem.map((u, i) => (
              <div key={i}>
                <p className="font-semibold text-amber-200">{u.problem}</p>
                <p className="text-slate-200 leading-relaxed">{u.upay}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {content?.solution_bridge && (
        <section className="my-12 rounded-xl border border-amber-700/50 bg-gradient-to-r from-amber-900/30 to-amber-950/30 p-6 md:p-8">
          <h3 className="mb-3 text-xl md:text-2xl font-bold text-amber-300">{t.personal(name)}</h3>
          <div className="mb-6 whitespace-pre-line text-slate-200 leading-relaxed">
            {content.solution_bridge}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/#birth-form"
                  className="rounded-lg bg-amber-600 px-6 py-3 text-center font-semibold text-slate-900 hover:bg-amber-500 transition">
              {t.kundli}
            </Link>
            <Link href="/kundali-milan"
                  className="rounded-lg border-2 border-amber-500 px-6 py-3 text-center font-semibold text-amber-300 hover:bg-amber-500/10 transition">
              {t.milan}
            </Link>
            <Link href="/calculators"
                  className="rounded-lg border-2 border-amber-500 px-6 py-3 text-center font-semibold text-amber-300 hover:bg-amber-500/10 transition">
              {t.hastrekha}
            </Link>
            <Link href="/swapna"
                  className="rounded-lg border-2 border-amber-500 px-6 py-3 text-center font-semibold text-amber-300 hover:bg-amber-500/10 transition">
              {t.swapna}
            </Link>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-6 text-2xl md:text-3xl font-bold text-amber-300">{t.faqHead(name, placeName)}</h2>
          <div className="space-y-4">
            {faqs.map((q, i) => (
              <details key={i}
                className="group rounded-lg border border-amber-900/40 bg-slate-900/40 p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-amber-200">
                  <span>{q.q}</span>
                  <span className="text-amber-400 transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-slate-200 leading-relaxed">{q.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="my-12 border-t border-amber-900/40 pt-8">
          <h2 className="mb-6 text-2xl md:text-3xl font-bold text-amber-300">{t.comingUp(placeName)}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {upcoming
              .filter(o => !(o.festival_scope === "regional" && o.home_states?.length &&
                             city && !o.home_states.includes(city.state)))
              .map(o => (
                <li key={o.festival_slug}>
                  <Link href={festivalHref("en", city?.slug ?? null, o.festival_slug, null)}
                        className="text-amber-300 hover:text-amber-200 transition">{o.festival_name}</Link>
                  <span className="ml-2 text-sm text-slate-500">{o.date}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="my-12 border-t border-amber-900/40 pt-8">
        <h2 className="mb-6 text-2xl md:text-3xl font-bold text-amber-300">{t.explore}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 text-amber-300">
          {city && <li><Link href={`/${city.slug}/panchang`} className="hover:text-amber-300 transition">{t.panchangFor(placeName)}</Link></li>}
          {city && <li><Link href={festivalHref(lang, null, f.festival_slug, content?.page_slug ?? null)} className="hover:text-amber-300 transition">{t.allIndia(name)}</Link></li>}
          <li><Link href={`/panchang/${f.date}`} className="hover:text-amber-300 transition">{t.panchangDay}</Link></li>
          <li><Link href="/upcoming-events" className="hover:text-amber-300 transition">{t.allFestivals}</Link></li>
        </ul>
      </section>

        <CalculatorLinks />

        <footer className="mt-16 border-t border-amber-900/40 pt-8 text-sm text-slate-400">
          {t.footer}
        </footer>
      </div>
    </article>
  );
}

// END — components/festival/FestivalPillar.tsx v1.0 | Trikaal Vaani | Rohiit Gupta
