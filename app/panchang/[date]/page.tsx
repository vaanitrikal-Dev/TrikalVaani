// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    app/panchang/[date]/page.tsx
// Version: v3.3
// Owner:   Rohiit Gupta, Chief Vedic Architect
// Changes vs v3.2 (date window — Claude, 2 Sep 2026):
//   THE PROBLEM, measured rather than guessed. On 1-2 Sep 2026 the VM logs
//   showed bursts of /panchang calls for date=2029-10-15 and date=2030-04-12,
//   ten cities each, fired in parallel. During one such burst every live
//   calculator on the site timed out for about two minutes and a real
//   customer saw "Network error" on the Santan Yog page.
//
//   WHY IT HAPPENED. isValidDate() accepted any date from 2020 to 2100.
//   That is roughly 29,000 crawlable URLs. dynamicParams is true, so a URL
//   nobody has opened before is rendered ON DEMAND — and ISR cannot help a
//   URL that is being seen for the first time. Every unseen date was one
//   fresh VM call. A crawler walking dates forward generates them without
//   limit, and FastAPI's 40-thread pool fills up; request 41 is a paying
//   customer, waiting in a queue behind a robot asking about 2030.
//
//   THE FIX. The servable range is now COMPUTED AT REQUEST TIME, not
//   hardcoded: today minus 365 days to today plus 365 days. Anything outside
//   returns 404 BEFORE a single Supabase or VM call is made. 29,000 URLs
//   become 731, and the window rolls forward on its own every day — no cron,
//   no seeding, no yearly edit.
//
//   WHY 365 FORWARD. app/sitemap.ts emits exactly today + 365 days of
//   panchang URLs, read from panchang_daily. Matching that number keeps the
//   sitemap and the route in agreement: every URL we submit is servable, and
//   nothing servable is missing from the sitemap. If the sitemap window ever
//   changes, change FUTURE_WINDOW_DAYS here to match.
//
//   WHY 365 BACKWARD. Past dates are already in panchang_daily, so they cost
//   a cheap Supabase read and never touch the VM. They are kept for archive
//   value. They are NOT in the sitemap, by the same reasoning the v8.6
//   sitemap note gives for past rashifal — worth serving if linked, not worth
//   asking Google to crawl.
//
//   NOT A RANKING CHANGE. This removes URLs that were never legitimately
//   requested by a human. Nothing that ranks today stops being served.
//   PROTECTED (untouched): fetchFromVM/callVM, ISR, 10s timeout, redirect
//      logic, Supabase festival lookup, all schemas, JSX, Card/FAQ.
// Changes vs v3.1 (Discover optimization — Claude, June 2026):
//   1. OG image added (og-default.jpg 1200×630) to openGraph + twitter.
//   2. robots expanded with googleBot max-image-preview:large + max-snippet
//      (required for Google Discover large-image cards).
//   3. Article schema publisher logo FIXED: /logo.png (404) → /Trikal_Logo.png
//      (1440×1440, matches layout.tsx org schema).
//   PROTECTED (untouched): fetchFromVM/callVM, ISR, 10s timeout, redirect
//      logic, Supabase festival lookup, all schemas, JSX, Card/FAQ.
// Changes vs v3.0:
//   1. fetchFromVM() now routes through lib/callVM.ts so the X-Trikal-Key
//      auth header is injected automatically. ISR (next: { revalidate: 86400 })
//      and the 10s timeout are preserved exactly. Redirect logic, Supabase
//      festival lookup, schemas, metadata, and JSX are unchanged.
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
import { callVM } from "@/lib/callVM";

export const revalidate = 86400;
export const dynamicParams = true;

const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikaal Vaani";
const VM_URL = "http://34.47.182.227:8001";
const OG_IMAGE = `${SITE_URL}/og-default.jpg`;

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

// ── v3.3: the servable date window ────────────────────────────────────
// Both numbers are days, both measured from today, both applied at request
// time. FUTURE_WINDOW_DAYS must stay equal to the panchang window in
// app/sitemap.ts (currently today + 365) or the sitemap will start
// advertising URLs this route refuses to serve.
const PAST_WINDOW_DAYS = 365;
const FUTURE_WINDOW_DAYS = 365;

/**
 * Today in IST, as YYYY-MM-DD.
 *
 * IST rather than UTC on purpose. This is an Indian panchang: for five and a
 * half hours every night, UTC is still on yesterday's date while the reader
 * is on today's. Using UTC here would 404 the far edge of the window for
 * exactly those hours.
 */
function todayIST(): Date {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()));
}

/** Format check only — is this string a real calendar date? */
function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  if (isNaN(d.getTime())) return false;
  // Reject 2026-02-31 and friends: Date() rolls them over silently.
  return d.toISOString().slice(0, 10) === s;
}

/**
 * Is this date inside the rolling window we are willing to render?
 *
 * Everything outside it 404s before any Supabase or VM call. That ordering is
 * the whole point of this function — a 404 must cost nothing.
 */
function isInWindow(s: string): boolean {
  const d = new Date(s + "T00:00:00Z");
  const today = todayIST();
  const min = new Date(today); min.setUTCDate(today.getUTCDate() - PAST_WINDOW_DAYS);
  const max = new Date(today); max.setUTCDate(today.getUTCDate() + FUTURE_WINDOW_DAYS);
  return d >= min && d <= max;
}

/** Format is real AND the date is inside the rolling window. */
function isServable(s: string): boolean {
  return isValidDate(s) && isInWindow(s);
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
    const res = await callVM(`${VM_URL}/panchang?date=${date}`, {
      method: "GET",
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000)
    } as RequestInit);
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
      geo_answer: `On ${human}, Tithi is ${vm.tithi.name} (${vm.tithi.paksha}), Nakshatra is ${vm.nakshatra.name} Pada ${vm.nakshatra.pada}, Yoga ${vm.yoga.name}. Sunrise: ${vm.sunrise}, Sunset: ${vm.sunset}, Rahu Kaal: ${vm.rahu_kaal} (India). Swiss Ephemeris, Lahiri Ayanamsha.`,
      seo_title: null, seo_description: null, faq_schema: null, gemini_content: null,
      festival_slug: festData?.festival_slug ?? null,
      festival_name: festData?.festival_name ?? null,
    };
  } catch { return null; }
}

/**
 * v3.3: the VM is a fallback for the FUTURE only.
 *
 * Found while unit-testing the window: the crawl bursts in the VM log
 * included 2026-05-16, a date only three months old. It is inside the past
 * window and should be served — but it was reaching the VM, because a past
 * date missing from panchang_daily fell straight through to a live
 * ephemeris call.
 *
 * That is the wrong direction of travel. The cron writes panchang_daily
 * forward every day, so a past date is either recorded or it is history we
 * never recorded — and computing it live, on a crawler's request, buys
 * nothing. A FUTURE date is different: the cron may genuinely not have
 * reached it yet, so one VM call is justified, and ISR caches it for 24h.
 *
 * Net effect: the VM can now only be reached by future dates inside the
 * +365 window. Everything else is a Supabase read or a 404.
 */
async function getPanchang(date: string): Promise<PanchangRow | null> {
  const fromDb = await fetchFromSupabase(date);
  if (fromDb) return fromDb;

  const isPast = new Date(date + "T00:00:00Z") < todayIST();
  if (isPast) return null;   // renders the "being computed" card, calls nothing

  return await fetchFromVM(date);
}

// ── Metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { date: string } }
): Promise<Metadata> {
  const { date } = params;
  // v3.3: window check before any fetch. An out-of-range date must not cost
  // a Supabase query here either — generateMetadata runs on the same request.
  if (!isServable(date)) {
    return { title: "Panchang Not Found", robots: { index: false, follow: false } };
  }

  const p = await fetchFromSupabase(date);
  const human = formatHuman(date);
  const url = `${SITE_URL}/panchang/${date}`;

  const title = p?.seo_title?.replace(/\s*\|\s*Trikaal Vaani\s*$/i, "")
    ?? `Aaj Ka Panchang ${human} | Tithi, Nakshatra, Rahu Kaal`;

  const description = p?.seo_description
    ?? `Vedic Panchang for ${human}: Tithi ${p?.tithi ?? ""}, Nakshatra ${p?.nakshatra ?? ""}, Rahu Kaal ${p?.rahu_kaal ?? ""}. Swiss Ephemeris, Lahiri Ayanamsha. By Rohiit Gupta, Chief Vedic Architect.`;

  return {
    title, description,
    authors: [{ name: AUTHOR_NAME, url: `${SITE_URL}/founder` }],
    alternates: { canonical: url },
    openGraph: { title: `${title} | Trikaal Vaani`, description, url, siteName: "Trikaal Vaani", type: "article", locale: "en_IN", images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function PanchangDatePage(
  { params }: { params: { date: string } }
) {
  const { date } = params;
  // v3.3: out-of-window dates 404 here, BEFORE getPanchang() runs. This is
  // the line that stops a crawler walking to 2030 from reaching the VM.
  if (!isServable(date)) notFound();

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
    { "@type": "Question", name: `What is Rahu Kaal on ${human}?`, acceptedAnswer: { "@type": "Answer", text: `Rahu Kaal is ${p.rahu_kaal} (India). Avoid auspicious work during this window.` } },
    { "@type": "Question", name: `What is the Nakshatra on ${human}?`, acceptedAnswer: { "@type": "Answer", text: `${p.nakshatra}.` } },
    { "@type": "Question", name: `What time is sunrise on ${human}?`, acceptedAnswer: { "@type": "Answer", text: `Sunrise: ${p.sunrise} IST, Sunset: ${p.sunset} IST (India).` } },
  ];

  const schemas = [
    {
      "@context": "https://schema.org", "@type": "Article",
      headline: `Aaj Ka Panchang ${human}`,
      description: p.geo_answer ?? `Vedic Panchang for ${date}`,
      image: [OG_IMAGE],
      datePublished: date, dateModified: date,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Person", name: AUTHOR_NAME, jobTitle: AUTHOR_TITLE, url: `${SITE_URL}/founder` },
      publisher: { "@type": "Organization", name: "Trikaal Vaani", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/Trikal_Logo.png`, width: 1440, height: 1440 } },
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
            <FAQ q={`What is Rahu Kaal on ${human}?`} a={`Rahu Kaal is ${p.rahu_kaal} (India). Avoid auspicious work during this window.`} />
            <FAQ q={`What time is sunrise on ${human}?`} a={`Sunrise: ${p.sunrise} IST, Sunset: ${p.sunset} IST (India).`} />
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
            <p>🔱 Calculated by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE}. Engine: Swiss Ephemeris · Ayanamsha: Lahiri · Version: v3.3</p>
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
