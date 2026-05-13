// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    app/panchang/page.tsx
// Version: v1.0 — NEW FILE
// Owner:   Rohiit Gupta, Chief Vedic Architect
// Purpose: Panchang hub page — /panchang
//          Shows: today's panchang + upcoming festivals + recent dates
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const SITE_URL = "https://trikalvaani.com";

export const metadata: Metadata = {
  title: "Aaj Ka Panchang 2026 | Daily Tithi Nakshatra Rahu Kaal",
  description:
    "Daily Vedic Panchang for 2026. Today's Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Sunrise & upcoming festivals including Shani Jayanti, Ekadashi, Purnima, Diwali. Swiss Ephemeris, Lahiri Ayanamsha. By Rohiit Gupta.",
  alternates: { canonical: `${SITE_URL}/panchang` },
  openGraph: {
    title: "Aaj Ka Panchang 2026 | Trikal Vaani",
    description:
      "Daily Tithi, Nakshatra, Rahu Kaal & upcoming Vedic festivals. Shani Jayanti, Ekadashi, Purnima and all major occasions.",
    url: `${SITE_URL}/panchang`,
    siteName: "Trikal Vaani",
    locale: "en_IN",
    type: "website",
  },
  robots: { index: true, follow: true },
};

// ── All major + minor Vedic festivals 2026 ───────────────────────────
// No manual update needed — filtered automatically by today's date
const FESTIVALS_2026 = [
  { date: "2026-05-16", name: "Shani Jayanti", type: "major" },
  { date: "2026-05-23", name: "Apara Ekadashi", type: "minor" },
  { date: "2026-05-27", name: "Vat Savitri Vrat", type: "major" },
  { date: "2026-05-29", name: "Purnima", type: "minor" },
  { date: "2026-06-01", name: "Ganga Dussehra", type: "major" },
  { date: "2026-06-07", name: "Nirjala Ekadashi", type: "major" },
  { date: "2026-06-14", name: "Amavasya", type: "minor" },
  { date: "2026-06-20", name: "Jagannath Rath Yatra", type: "major" },
  { date: "2026-06-22", name: "Yogini Ekadashi", type: "minor" },
  { date: "2026-06-28", name: "Purnima", type: "minor" },
  { date: "2026-07-03", name: "Guru Purnima", type: "major" },
  { date: "2026-07-07", name: "Devshayani Ekadashi", type: "major" },
  { date: "2026-07-14", name: "Amavasya / Hariyali Amavasya", type: "major" },
  { date: "2026-07-22", name: "Kamika Ekadashi", type: "minor" },
  { date: "2026-07-29", name: "Purnima / Nag Panchami", type: "minor" },
  { date: "2026-08-05", name: "Putrada Ekadashi", type: "minor" },
  { date: "2026-08-12", name: "Amavasya", type: "minor" },
  { date: "2026-08-17", name: "Raksha Bandhan", type: "major" },
  { date: "2026-08-20", name: "Aja Ekadashi", type: "minor" },
  { date: "2026-08-22", name: "Janmashtami", type: "major" },
  { date: "2026-08-27", name: "Purnima", type: "minor" },
  { date: "2026-09-01", name: "Hartalika Teej", type: "major" },
  { date: "2026-09-02", name: "Ganesh Chaturthi", type: "major" },
  { date: "2026-09-04", name: "Parivartini Ekadashi", type: "minor" },
  { date: "2026-09-11", name: "Amavasya", type: "minor" },
  { date: "2026-09-17", name: "Anant Chaturdashi", type: "major" },
  { date: "2026-09-18", name: "Indira Ekadashi", type: "minor" },
  { date: "2026-09-25", name: "Sharad Navratri Begins", type: "major" },
  { date: "2026-09-26", name: "Purnima", type: "minor" },
  { date: "2026-10-02", name: "Navratri Ends / Dussehra", type: "major" },
  { date: "2026-10-03", name: "Papankusha Ekadashi", type: "minor" },
  { date: "2026-10-10", name: "Karva Chauth", type: "major" },
  { date: "2026-10-11", name: "Amavasya", type: "minor" },
  { date: "2026-10-17", name: "Rama Ekadashi", type: "minor" },
  { date: "2026-10-20", name: "Dhanteras", type: "major" },
  { date: "2026-10-21", name: "Diwali", type: "major" },
  { date: "2026-10-23", name: "Govardhan Puja", type: "major" },
  { date: "2026-10-24", name: "Bhai Dooj", type: "major" },
  { date: "2026-10-25", name: "Purnima", type: "minor" },
  { date: "2026-11-01", name: "Devutthana Ekadashi", type: "major" },
  { date: "2026-11-05", name: "Chhath Puja", type: "major" },
  { date: "2026-11-09", name: "Amavasya", type: "minor" },
  { date: "2026-11-16", name: "Utpanna Ekadashi", type: "minor" },
  { date: "2026-11-24", name: "Purnima", type: "minor" },
  { date: "2026-12-01", name: "Mokshada Ekadashi", type: "minor" },
  { date: "2026-12-08", name: "Amavasya", type: "minor" },
  { date: "2026-12-16", name: "Saphala Ekadashi", type: "minor" },
  { date: "2026-12-23", name: "Purnima", type: "minor" },
];

// ── Helpers ──────────────────────────────────────────────────────────
function getISTToday(): string {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
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

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function PanchangHubPage() {
  const today = getISTToday();
  const supabase = getSupabase();

  // Fetch today's panchang from Supabase
  const { data: todayRow } = await supabase
    .from("panchang_daily")
    .select("date,tithi,nakshatra,yoga,karana,vara,sunrise,sunset,rahu_kaal,geo_answer")
    .eq("date", today)
    .eq("city", "delhi")
    .single();

  // Upcoming festivals — next 60 days only
  const upcomingFestivals = FESTIVALS_2026
    .filter((f) => {
      const diff = daysFromToday(f.date, today);
      return diff >= 0 && diff <= 60;
    })
    .slice(0, 12);

  // Last 7 days for archive
  const last7 = getLast7Days(today);

  // Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Aaj Ka Panchang 2026 | Daily Vedic Panchang",
    url: `${SITE_URL}/panchang`,
    description: "Daily Vedic Panchang with Tithi, Nakshatra, Yoga, Karana, Rahu Kaal and upcoming festivals.",
    author: {
      "@type": "Person",
      name: "Rohiit Gupta",
      jobTitle: "Chief Vedic Architect",
      url: `${SITE_URL}/founder`,
    },
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
                <h2 className="text-white font-bold text-lg">Today's Panchang — {formatShort(today)}</h2>
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
              <p className="text-amber-800 font-medium">Today's panchang is being computed...</p>
              <p className="text-amber-600 text-sm mt-1">Check back in a few minutes or view yesterday's panchang below.</p>
            </section>
          )}

          <div className="grid md:grid-cols-2 gap-6">

            {/* Upcoming Festivals */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🪔 Upcoming Festivals & Occasions
              </h2>
              <div className="space-y-2">
                {upcomingFestivals.length === 0 ? (
                  <p className="text-gray-500 text-sm">No festivals in next 60 days.</p>
                ) : (
                  upcomingFestivals.map((f) => {
                    const diff = daysFromToday(f.date, today);
                    const label = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : `In ${diff} days`;
                    return (
                      <Link
                        key={f.date}
                        href={`/panchang/${f.date}`}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-amber-200 hover:bg-amber-50 transition-colors group"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-amber-700">
                            {f.name}
                          </p>
                          <p className="text-xs text-gray-500">{formatShort(f.date)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            f.type === "major"
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📅 Recent Panchang
              </h2>
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

              {/* CTA */}
              <div className="mt-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-5 text-white">
                <h3 className="font-bold text-base">Get Personal Reading</h3>
                <p className="text-amber-100 text-sm mt-1">
                  Based on your birth chart + today's planetary positions.
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

          {/* SEO educational content */}
          <section className="mt-8 prose prose-amber max-w-none">
            <h2 className="text-xl font-semibold text-gray-900">What is Panchang?</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Panchang (पंचांग) is the traditional Vedic almanac that tracks five cosmic elements —
              Tithi (lunar day), Nakshatra (moon's star), Yoga (sun-moon combination), Karana (half-day),
              and Vara (weekday). Together they reveal the energetic quality of each day and guide
              auspicious timing (Muhurta) for marriages, business launches, travel, and spiritual practices.
              All calculations on Trikal Vaani use the Swiss Ephemeris engine with Lahiri Ayanamsha —
              the standard accepted by the Government of India.
            </p>
          </section>

          {/* Internal links */}
          <section className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Explore Life Domains</p>
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
