// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    app/panchang/page.tsx
// Version: v2.2
// Owner:   Rohiit Gupta, Chief Vedic Architect
// Changes vs v2.1:
//   1. UI text + metadata converted to DEVANAGARI (Hindi) — Hindi-first test.
//   2. og:locale en_IN → hi_IN. Date formatters en-IN → hi-IN so weekday/
//      month render in Hindi (e.g. सोम, 16 मई).
//   3. Schema name/description now Hindi. AUTHOR ENTITY (Rohiit Gupta /
//      Chief Vedic Architect), BRAND (Trikaal Vaani) and ALL URLs are
//      kept UNCHANGED for entity consistency across the site.
//   4. ZERO logic change — Supabase queries, callVM VM fallback, ISR
//      (revalidate 3600), 8s timeout, types, and full JSX structure are
//      identical to v2.1. Only human-visible strings translated.
// Changes vs v2.0:
//   1. VM fallback fetch routed through lib/callVM.ts so the X-Trikal-Key
//      auth header is injected automatically.
//   2. ISR caching (next: { revalidate: 3600 }) and the 8s timeout are
//      preserved exactly. All Supabase queries, schema, and JSX unchanged.
// Changes vs v1.0:
//   1. FESTIVALS_2026 hardcoded array REMOVED
//   2. Upcoming festivals fetched DYNAMICALLY from festivals_master table
//   3. Works for any year automatically — 2026, 2027, 2028 forever
//   4. Today's panchang from panchang_daily (falls back to VM)
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { callVM } from "@/lib/callVM";

export const revalidate = 3600;

const SITE_URL = "https://trikalvaani.com";
const VM_URL = "http://34.47.182.227:8001";

export const metadata: Metadata = {
  title: "आज का पंचांग 2026 | आज की तिथि, नक्षत्र, राहु काल और शुभ मुहूर्त | Trikaal Vaani",
  description:
    "रोज़ का वैदिक पंचांग। आज की तिथि, नक्षत्र, योग, करण, राहु काल, सूर्योदय और दिवाली, नवरात्रि, जन्माष्टमी जैसे आने वाले त्योहार। Swiss Ephemeris और लाहिरी अयनांश पर आधारित। Rohiit Gupta द्वारा।",
  alternates: { canonical: `${SITE_URL}/panchang` },
  openGraph: {
    title: "आज का पंचांग | Trikaal Vaani",
    description: "आज की तिथि, नक्षत्र, राहु काल और आने वाले वैदिक त्योहार। Swiss Ephemeris पर आधारित।",
    url: `${SITE_URL}/panchang`,
    siteName: "Trikaal Vaani",
    locale: "hi_IN",
    type: "website",
  },
  robots: { index: true, follow: true },
};

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
};

type FestivalRow = {
  date: string;
  festival_name: string;
  festival_slug: string;
  festival_type: string;
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

function getISTToday(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split("T")[0];
}

function getISTDate60DaysAhead(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000 + 60 * 86400 * 1000);
  return ist.toISOString().split("T")[0];
}

function formatShort(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("hi-IN", {
    weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
  });
}

function formatFull(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("hi-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

function daysFromToday(dateStr: string, today: string): number {
  return Math.round(
    (new Date(dateStr + "T00:00:00Z").getTime() - new Date(today + "T00:00:00Z").getTime()) / 86400000
  );
}

function getLast7Days(today: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    return d.toISOString().split("T")[0];
  });
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function PanchangHubPage() {
  const today = getISTToday();
  const ahead = getISTDate60DaysAhead();
  const supabase = getSupabase();

  // 1. Today's panchang from Supabase
  let todayRow: PanchangRow | null = null;
  try {
    const { data } = await supabase
      .from("panchang_daily")
      .select("date,tithi,nakshatra,yoga,karana,vara,sunrise,sunset,rahu_kaal,geo_answer")
      .eq("date", today)
      .eq("city", "delhi")
      .single();
    todayRow = data as PanchangRow | null;
  } catch {}

  // Fallback to VM if not in DB
  if (!todayRow) {
    try {
      const res = await callVM(`${VM_URL}/panchang?date=${today}`, {
        method: "GET",
        next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000)
      } as RequestInit);
      if (res.ok) {
        const vm = (await res.json()) as VMPanchang;
        todayRow = {
          date: today,
          tithi: `${vm.tithi.name} (${vm.tithi.paksha})`,
          nakshatra: `${vm.nakshatra.name} पाद ${vm.nakshatra.pada}`,
          yoga: vm.yoga.name, karana: vm.karana.name,
          vara: vm.weekday ?? vm.vara ?? "",
          sunrise: vm.sunrise, sunset: vm.sunset, rahu_kaal: vm.rahu_kaal,
          geo_answer: null,
        };
      }
    } catch {}
  }

  // 2. Upcoming festivals — DYNAMIC from festivals_master
  let upcomingFestivals: FestivalRow[] = [];
  try {
    const { data } = await supabase
      .from("festivals_master")
      .select("date,festival_name,festival_slug,festival_type")
      .gte("date", today)
      .lte("date", ahead)
      .order("date", { ascending: true })
      .limit(12);
    upcomingFestivals = (data ?? []) as FestivalRow[];
  } catch {}

  const last7 = getLast7Days(today);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "आज का पंचांग | रोज़ का वैदिक पंचांग | Trikaal Vaani",
    url: `${SITE_URL}/panchang`,
    description: "आज की तिथि, नक्षत्र, योग, करण, राहु काल और आने वाले त्योहारों के साथ रोज़ का वैदिक पंचांग।",
    inLanguage: "hi-IN",
    author: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: `${SITE_URL}/founder` },
    publisher: { "@type": "Organization", name: "Trikaal Vaani", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-20">
        <div className="mx-auto max-w-4xl px-4 py-8">

          {/* Header */}
          <header className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-2">
              Swiss Ephemeris · लाहिरी अयनांश
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              आज का पंचांग
            </h1>
            <p className="text-gray-500 text-sm">
              {formatFull(today)} · लेखक —{" "}
              <Link href="/founder" className="text-amber-700 hover:underline">
                Rohiit Gupta, मुख्य वैदिक आर्किटेक्ट
              </Link>
            </p>
          </header>

          {/* Today's Panchang */}
          {todayRow ? (
            <section className="mb-8 rounded-2xl border border-amber-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-4">
                <h2 className="text-white font-bold text-lg">
                  आज का पंचांग — {formatShort(today)}
                </h2>
                {todayRow.geo_answer && (
                  <p className="text-amber-100 text-sm mt-1 leading-relaxed">{todayRow.geo_answer}</p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-100">
                <PCard label="तिथि"      value={todayRow.tithi} />
                <PCard label="नक्षत्र"    value={todayRow.nakshatra} />
                <PCard label="योग"       value={todayRow.yoga} />
                <PCard label="करण"       value={todayRow.karana} />
                <PCard label="सूर्योदय"   value={todayRow.sunrise + " IST"} />
                <PCard label="सूर्यास्त"  value={todayRow.sunset + " IST"} />
                <PCard label="राहु काल"   value={todayRow.rahu_kaal} />
                <PCard label="वार"        value={todayRow.vara} />
              </div>
              <div className="px-6 py-4 bg-amber-50">
                <Link
                  href={`/panchang/${today}`}
                  className="inline-block rounded-lg bg-amber-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-amber-700 transition-colors"
                >
                  पूरी जानकारी + व्यक्तिगत भविष्यवाणी →
                </Link>
              </div>
            </section>
          ) : (
            <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="text-amber-800 font-medium">आज का पंचांग तैयार हो रहा है...</p>
              <p className="text-amber-600 text-sm mt-1">कुछ मिनटों में फिर देखें।</p>
            </section>
          )}

          <div className="grid md:grid-cols-2 gap-6">

            {/* Upcoming Festivals — Dynamic from Supabase */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🪔 आने वाले त्योहार और शुभ अवसर
              </h2>
              <div className="space-y-2">
                {upcomingFestivals.length === 0 ? (
                  <p className="text-gray-500 text-sm">कोई आने वाला त्योहार नहीं मिला।</p>
                ) : (
                  upcomingFestivals.map((f) => {
                    const diff = daysFromToday(f.date, today);
                    const label = diff === 0 ? "आज" : diff === 1 ? "कल" : `${diff} दिन बाद`;
                    return (
                      <Link
                        key={`${f.date}-${f.festival_slug}`}
                        href={`/panchang/${f.date}/${f.festival_slug}`}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-amber-200 hover:bg-amber-50 transition-colors group"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-amber-700">
                            {f.festival_name}
                          </p>
                          <p className="text-xs text-gray-500">{formatShort(f.date)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            f.festival_type === "major"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {label}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>

            {/* Recent Panchang Archive */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">📅 पिछले दिनों का पंचांग</h2>
              <div className="space-y-2">
                {last7.map((d) => (
                  <Link
                    key={d}
                    href={`/panchang/${d}`}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-amber-200 hover:bg-amber-50 transition-colors group"
                  >
                    <span className="font-medium text-gray-800 text-sm group-hover:text-amber-700">
                      {formatShort(d)}
                    </span>
                    {d === today && (
                      <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-1 rounded-full">
                        आज
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-5 text-white">
                <h3 className="font-bold text-base">अपनी व्यक्तिगत भविष्यवाणी पाएं</h3>
                <p className="text-amber-100 text-sm mt-1">
                  आपकी जन्म कुंडली और आज की ग्रह स्थिति के आधार पर।
                </p>
                <Link
                  href="/predict"
                  className="mt-3 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  मुफ़्त शुरू करें →
                </Link>
              </div>
            </section>
          </div>

          {/* SEO Content */}
          <section className="mt-8 prose prose-amber max-w-none">
            <h2 className="text-xl font-semibold text-gray-900">पंचांग क्या है?</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              पंचांग (पंचांग) पाँच मुख्य तत्वों पर आधारित पारंपरिक वैदिक कैलेंडर है —
              तिथि (चंद्र दिवस), नक्षत्र (चंद्रमा का तारा), योग (सूर्य-चंद्र संयोग), करण
              (आधा तिथि), और वार (सप्ताह का दिन)। ये पाँचों मिलकर हर दिन की ऊर्जा बताते हैं
              और विवाह, व्यापार आरंभ, यात्रा तथा धार्मिक कार्यों के लिए शुभ मुहूर्त तय करने में
              मार्गदर्शन करते हैं। Trikaal Vaani पर सभी गणनाएँ Swiss Ephemeris और लाहिरी
              अयनांश से की जाती हैं — जो भारत सरकार द्वारा मान्य मानक है।
            </p>
          </section>

          {/* Internal Links */}
          <section className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              जीवन के क्षेत्र देखें
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                ["करियर", "/career"], ["धन", "/wealth"], ["विवाह", "/marriage"],
                ["स्वास्थ्य", "/health"], ["अध्यात्म", "/spirituality"], ["कानूनी", "/legal"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs px-3 py-1.5 rounded-full border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  {label} ज्योतिष
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

function PCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
