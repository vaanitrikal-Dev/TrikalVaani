// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    app/panchang/page.tsx
// Version: v2.0
// Owner:   Rohiit Gupta, Chief Vedic Architect
// Changes vs v1.0:
//   1. FESTIVALS_2026 hardcoded array REMOVED
//   2. Upcoming festivals fetched DYNAMICALLY from festivals_master table
//   3. Works for any year automatically — 2026, 2027, 2028 forever
//   4. Today's panchang from panchang_daily (falls back to VM)
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const SITE_URL = "https://trikalvaani.com";
const VM_URL = "http://34.14.164.105:8001";

export const metadata: Metadata = {
  title: "Aaj Ka Panchang 2026 | Daily Tithi Nakshatra Rahu Kaal | Trikal Vaani",
  description:
    "Daily Vedic Panchang. Today's Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Sunrise & upcoming festivals including Diwali, Navratri, Janmashtami. Swiss Ephemeris, Lahiri Ayanamsha. By Rohiit Gupta.",
  alternates: { canonical: `${SITE_URL}/panchang` },
  openGraph: {
    title: "Aaj Ka Panchang | Trikal Vaani",
    description: "Daily Tithi, Nakshatra, Rahu Kaal & upcoming Vedic festivals. Swiss Ephemeris.",
    url: `${SITE_URL}/panchang`,
    siteName: "Trikal Vaani",
    locale: "en_IN",
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
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
  });
}

function formatFull(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
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
      const res = await fetch(`${VM_URL}/panchang?date=${today}`, {
        next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const vm = (await res.json()) as VMPanchang;
        todayRow = {
          date: today,
          tithi: `${vm.tithi.name} (${vm.tithi.paksha})`,
          nakshatra: `${vm.nakshatra.name} Pada ${vm.nakshatra.pada}`,
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
    name: "Aaj Ka Panchang | Daily Vedic Panchang | Trikal Vaani",
    url: `${SITE_URL}/panchang`,
    description: "Daily Vedic Panchang with Tithi, Nakshatra, Yoga, Karana, Rahu Kaal and upcoming festivals.",
    author: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: `${SITE_URL}/founder` },
    publisher: { "@type": "Organization", name: "Trikal Vaani", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-20">
        <div className="mx-auto max-w-4xl px-4 py-8">

          {/* Header */}
          <header className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-2">
              Swiss Ephemeris · Lahiri Ayanamsha
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Aaj Ka Panchang
            </h1>
            <p className="text-gray-500 text-sm">
              {formatFull(today)} · By{" "}
              <Link href="/founder" className="text-amber-700 hover:underline">
                Rohiit Gupta, Chief Vedic Architect
              </Link>
            </p>
          </header>

          {/* Today's Panchang */}
          {todayRow ? (
            <section className="mb-8 rounded-2xl border border-amber-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-4">
                <h2 className="text-white font-bold text-lg">
                  Today&apos;s Panchang — {formatShort(today)}
                </h2>
                {todayRow.geo_answer && (
                  <p className="text-amber-100 text-sm mt-1 leading-relaxed">{todayRow.geo_answer}</p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-100">
                <PCard label="Tithi"     value={todayRow.tithi} />
                <PCard label="Nakshatra" value={todayRow.nakshatra} />
                <PCard label="Yoga"      value={todayRow.yoga} />
                <PCard label="Karana"    value={todayRow.karana} />
                <PCard label="Sunrise"   value={todayRow.sunrise + " IST"} />
                <PCard label="Sunset"    value={todayRow.sunset + " IST"} />
                <PCard label="Rahu Kaal" value={todayRow.rahu_kaal} />
                <PCard label="Weekday"   value={todayRow.vara} />
              </div>
              <div className="px-6 py-4 bg-amber-50">
                <Link
                  href={`/panchang/${today}`}
                  className="inline-block rounded-lg bg-amber-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-amber-700 transition-colors"
                >
                  Full Details + Personal Reading →
                </Link>
              </div>
            </section>
          ) : (
            <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="text-amber-800 font-medium">Today&apos;s panchang is being computed...</p>
              <p className="text-amber-600 text-sm mt-1">Check back in a few minutes.</p>
            </section>
          )}

          <div className="grid md:grid-cols-2 gap-6">

            {/* Upcoming Festivals — Dynamic from Supabase */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🪔 Upcoming Festivals & Occasions
              </h2>
              <div className="space-y-2">
                {upcomingFestivals.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming festivals found.</p>
                ) : (
                  upcomingFestivals.map((f) => {
                    const diff = daysFromToday(f.date, today);
                    const label = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : `In ${diff} days`;
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Recent Panchang</h2>
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
                        Today
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-5 text-white">
                <h3 className="font-bold text-base">Get Personal Reading</h3>
                <p className="text-amber-100 text-sm mt-1">
                  Based on your birth chart + today&apos;s planetary positions.
                </p>
                <Link
                  href="/predict"
                  className="mt-3 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  Start Free →
                </Link>
              </div>
            </section>
          </div>

          {/* SEO Content */}
          <section className="mt-8 prose prose-amber max-w-none">
            <h2 className="text-xl font-semibold text-gray-900">What is Panchang?</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Panchang (पंचांग) is the traditional Vedic almanac tracking five cosmic elements —
              Tithi (lunar day), Nakshatra (moon&apos;s star), Yoga (sun-moon combination), Karana
              (half-day), and Vara (weekday). Together they reveal the energetic quality of each
              day and guide auspicious timing (Muhurta) for marriages, business launches, travel,
              and spiritual practices. All calculations on Trikal Vaani use Swiss Ephemeris with
              Lahiri Ayanamsha — the standard accepted by the Government of India.
            </p>
          </section>

          {/* Internal Links */}
          <section className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Explore Life Domains
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                ["Career", "/career"], ["Wealth", "/wealth"], ["Marriage", "/marriage"],
                ["Health", "/health"], ["Spirituality", "/spirituality"], ["Legal", "/legal"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs px-3 py-1.5 rounded-full border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  {label} Astrology
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
