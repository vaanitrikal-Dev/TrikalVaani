// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    app/rashifal/[date]/page.tsx
// Version: v1.0
// Owner:   Rohiit Gupta, Chief Vedic Architect
// Purpose: Discover-optimized daily Rashifal page. READ-ONLY display
//          layer over daily_rashifal_cache (NO generation — the panchang
//          cron already produces this data nightly).
//
// SEO/GEO/AEO/EEAT stack (mirrors panchang/[date]/page.tsx v3.1):
//   • Article + ItemList + FAQPage + BreadcrumbList JSON-LD
//   • geo_answer direct-answer block (40–60 words, AI-extractable)
//   • speakable-friendly H1/H2 + .geo-direct-answer class
//   • Author entity: Rohiit Gupta (EEAT) + publisher logo (1440²)
//   • OG image (1200×630 og-default.jpg) + max-image-preview:large
//   • ISR revalidate 86400; /rashifal → today's date
//
// NOTE: DB `hindi` field in daily_rashifal_cache is currently garbled,
//       so correct Devanagari names are hardcoded in RASHI_HI below.
//       Body text uses the English `prediction` field as-is (CEO choice).
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 86400;
export const dynamicParams = true;

const SITE_URL = "https://trikalvaani.com";
const OG_IMAGE = `${SITE_URL}/og-default.jpg`;
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikaal Vaani";

// ── Correct Devanagari names (DB `hindi` field is garbled) ────────────
const RASHI_HI: Record<string, string> = {
  mesh: "मेष", vrishabh: "वृषभ", mithun: "मिथुन", kark: "कर्क",
  simha: "सिंह", kanya: "कन्या", tula: "तुला", vrischik: "वृश्चिक",
  dhanu: "धनु", makar: "मकर", kumbh: "कुंभ", meen: "मीन",
};

// ── Types ─────────────────────────────────────────────────────────────
type Rashi = {
  id: string;
  name: string;
  sign: string;
  lord: string;
  symbol: string;
  element: string;
  color: string;
  tip: string;
  prediction: string;
};

type RashifalRow = {
  date: string;
  rashis: Rashi[];
  generated_at: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function todayIST(): string {
  // IST = UTC+5:30
  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return now.toISOString().split("T")[0];
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

function hiName(r: Rashi): string {
  return RASHI_HI[r.id?.toLowerCase()] ?? r.name;
}

async function getRashifal(date: string): Promise<RashifalRow | null> {
  try {
    const { data, error } = await getSupabase()
      .from("daily_rashifal_cache")
      .select("date,rashis,generated_at")
      .eq("date", date)
      .single();
    if (error || !data) return null;
    const row = data as RashifalRow;
    if (!Array.isArray(row.rashis) || row.rashis.length === 0) return null;
    return row;
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { date: string } }
): Promise<Metadata> {
  const { date } = params;
  if (!isValidDate(date)) return { title: "Rashifal Not Found | Trikaal Vaani" };

  const human = formatHuman(date);
  const url = `${SITE_URL}/rashifal/${date}`;
  const title = `Aaj Ka Rashifal ${human} | Daily Horoscope All 12 Signs`;
  const description =
    `Aaj ka rashifal for ${human} — daily Vedic horoscope predictions for all 12 zodiac signs ` +
    `(Mesh to Meen). Career, wealth, love & health guidance by Rohiit Gupta, Chief Vedic Architect. ` +
    `Swiss Ephemeris, Lahiri Ayanamsha.`;

  return {
    title,
    description,
    authors: [{ name: AUTHOR_NAME, url: `${SITE_URL}/founder` }],
    creator: AUTHOR_NAME,
    publisher: "Trikaal Vaani",
    category: "Vedic Astrology",
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Trikaal Vaani`,
      description,
      url,
      siteName: "Trikaal Vaani",
      type: "article",
      locale: "en_IN",
      publishedTime: `${date}T00:00:00+05:30`,
      modifiedTime: `${date}T00:00:00+05:30`,
      authors: [AUTHOR_NAME],
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@TrikalVaani",
      creator: "@TrikalVaani",
      title,
      description,
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function RashifalDatePage(
  { params }: { params: { date: string } }
) {
  const { date } = params;
  if (!isValidDate(date)) notFound();

  const data = await getRashifal(date);
  const url = `${SITE_URL}/rashifal/${date}`;
  const human = formatHuman(date);

  // No data yet for this date
  if (!data) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-20">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="text-5xl mb-6">🔱</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Rashifal for {human}</h1>
          <p className="text-gray-600 mb-2">
            This day&apos;s rashifal is being computed by our Vedic engine.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Daily rashifal is generated every morning. Please check back shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/rashifal/${todayIST()}`} className="rounded-lg bg-amber-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-amber-700">
              ← Today&apos;s Rashifal
            </Link>
            <Link href="/predict" className="rounded-lg border border-amber-300 text-amber-700 px-5 py-2.5 text-sm font-semibold hover:bg-amber-50">
              Get Personal Reading →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const rashis = data.rashis;

  // ── GEO direct answer (40–60 words, AI-extractable) ────────────────
  const geoAnswer =
    `Aaj ka rashifal for ${human}: daily Vedic horoscope predictions for all 12 zodiac signs ` +
    `— Mesh (Aries), Vrishabh (Taurus), Mithun (Gemini), Kark (Cancer), Simha (Leo), Kanya (Virgo), ` +
    `Tula (Libra), Vrischik (Scorpio), Dhanu (Sagittarius), Makar (Capricorn), Kumbh (Aquarius) and ` +
    `Meen (Pisces). Based on current planetary transits, Swiss Ephemeris with Lahiri Ayanamsha.`;

  // ── Schemas ────────────────────────────────────────────────────────
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Aaj Ka Rashifal ${human} — Daily Horoscope`,
    description: geoAnswer,
    image: [OG_IMAGE],
    datePublished: `${date}T00:00:00+05:30`,
    dateModified: data.generated_at ?? `${date}T00:00:00+05:30`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#rohiit-gupta`,
      name: AUTHOR_NAME,
      jobTitle: "Chief Vedic Architect",
      url: `${SITE_URL}/founder`,
      worksFor: { "@id": `${SITE_URL}/#organization` },
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Trikaal Vaani",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/Trikal_Logo.png`, width: 1440, height: 1440 },
    },
    inLanguage: "en-IN",
    articleSection: "Horoscope",
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Daily Rashifal ${human}`,
    itemListElement: rashis.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${r.name} (${r.sign}) Rashifal`,
      description: r.prediction,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Rashifal", item: `${SITE_URL}/rashifal/${todayIST()}` },
      { "@type": "ListItem", position: 3, name: human, item: url },
    ],
  };

  const faqItems = [
    {
      q: `What is the rashifal for ${human}?`,
      a: `On ${human}, all 12 zodiac signs (Mesh to Meen) have individual Vedic predictions based on current planetary transits, calculated using Swiss Ephemeris with Lahiri Ayanamsha.`,
    },
    {
      q: `Which sign has the best day on ${human}?`,
      a: `Each sign has its own favourable and challenging areas. Read your specific Moon sign (Rashi) prediction above for career, wealth, love and health guidance for ${human}.`,
    },
    {
      q: `Is this rashifal based on Moon sign or Sun sign?`,
      a: `Vedic rashifal is based on your Moon sign (Janma Rashi), not the Sun sign used in Western astrology. For your exact Moon sign, generate a free kundli at Trikaal Vaani.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const schemas = [articleSchema, itemListSchema, breadcrumbSchema, faqSchema];

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
            <Link href={`/rashifal/${todayIST()}`} className="hover:text-amber-700">Rashifal</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{human}</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Aaj Ka Rashifal — {human}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              By <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} ·{" "}
              <span className="text-amber-700">Swiss Ephemeris · Lahiri Ayanamsha</span>
            </p>
          </header>

          <section className="geo-direct-answer mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Quick answer">
            <p className="text-base leading-relaxed text-gray-800">{geoAnswer}</p>
          </section>

          {/* 12 Rashi cards */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All 12 Rashi Predictions</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {rashis.map((r) => (
                <article
                  key={r.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  style={{ borderLeftColor: r.color || "#F59E0B", borderLeftWidth: 4 }}
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-bold text-gray-900">
                      {r.name} <span className="text-gray-500 font-normal">({r.sign})</span>
                    </h3>
                    <span className="text-xl" aria-hidden style={{ color: r.color || "#F59E0B" }}>{r.symbol}</span>
                  </div>
                  <div className="mt-1 text-2xl text-gray-700">{hiName(r)}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                    Lord: {r.lord} · Element: {r.element}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-800">{r.prediction}</p>
                  {r.tip && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      💡 {r.tip}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="mb-8 prose prose-amber max-w-none">
            <h2 className="text-2xl font-semibold">How This Rashifal Is Calculated</h2>
            <p>
              Vedic rashifal is based on your <strong>Moon sign (Janma Rashi)</strong>, not the
              Sun sign used in Western astrology. Each day&apos;s predictions reflect the current
              transit (gochar) of planets against your natal Moon. All positions are computed
              using Swiss Ephemeris anchored to Lahiri Ayanamsha — the standard accepted by the
              Government of India.
            </p>
          </section>

          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">Want your personal prediction?</h2>
            <p className="mt-2 text-sm opacity-95">
              General rashifal is for your Moon sign. For predictions based on YOUR full birth
              chart — career, wealth, marriage timing and remedies — get a personalised reading.
              Free preview, ₹51 for full analysis.
            </p>
            <Link href="/predict" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Start Free Reading →
            </Link>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            {faqItems.map((item) => (
              <details key={item.q} className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-gray-900">{item.q}</summary>
                <p className="mt-2 text-sm text-gray-700">{item.a}</p>
              </details>
            ))}
          </section>

          <section className="border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href={`/panchang/${date}`} className="text-amber-700 hover:underline">Panchang for this Day</Link></li>
              <li><Link href="/career" className="text-amber-700 hover:underline">Career Astrology</Link></li>
              <li><Link href="/wealth" className="text-amber-700 hover:underline">Wealth Astrology</Link></li>
              <li><Link href="/marriage" className="text-amber-700 hover:underline">Marriage Astrology</Link></li>
              <li><Link href="/health" className="text-amber-700 hover:underline">Health Astrology</Link></li>
              <li><Link href="/spirituality" className="text-amber-700 hover:underline">Spirituality</Link></li>
            </ul>
          </section>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>🔱 Prepared by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE}. Engine: Swiss Ephemeris · Ayanamsha: Lahiri · Version: v1.0</p>
            <p className="mt-1 italic">&quot;Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye.&quot;</p>
          </footer>

        </div>
      </main>
    </>
  );
}
