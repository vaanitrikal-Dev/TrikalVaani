// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// File:    app/events/page.tsx
// Version: v1.0 (18 Oct 2026) — NEW: Festival Calendar hub (cards grid)
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// WHY: /events had no hub page (it returned 404, noted in next.config.js
// v1.9 "NOT FIXED HERE #2"). The 45 festivals x EN+HI pages could only be
// reached from search. Rohiit (18 Oct 2026): "add these festival pages on
// site under panchang so I can see these festival pages whenever I want".
// Design he approved: Panchang menu dropdown -> "त्योहार कैलेंडर" -> this
// page, laid out as a CARDS GRID (hero image, name, date, EN | हिंदी).
//
// DATA (no hardcoding, nothing to maintain):
//   festival_content  (is_published)  -> which festivals have pages, the
//                                        Hindi page_slug, the hero image
//   festivals_master  (date >= today) -> each festival's NEXT date and the
//                                        English URL slug (karva-chauth-2026)
//   A new festival written by the Sunday scheduled task appears here on
//   its own within an hour (revalidate 3600). When a festival passes, its
//   card moves to next year's date automatically.
//
// URLS: English /events/{festival_slug}, Hindi /hi/{page_slug} — the same
// rule as festivalHref() in components/festival/FestivalPillar.tsx.
// ════════════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { normalizeHeroImage, type WikiHeroImage } from "@/lib/wiki";
import SiteNav from "@/components/layout/SiteNav";

export const revalidate = 3600;

const SITE_URL = "https://trikalvaani.com";
const PAGE_URL = `${SITE_URL}/events`;
const TITLE = "Hindu Festival Calendar — Tyohar Dates & Puja Guides";
const DESCRIPTION =
  "Every upcoming Hindu festival with its next date, puja muhurat logic, katha and classical references — in English and Hindi, by Trikaal Vaani.";

export const metadata: Metadata = {
  // absolute — app/layout.tsx appends "| Trikaal Vaani" via its template.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: "website" },
  robots: { index: true, follow: true },
};

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

type ContentRow = { base_slug: string; lang: string; page_slug: string; hero_image: unknown };
type MasterRow = { festival_slug: string; festival_name: string; name_hindi: string | null; date: string };

type Card = {
  base: string;
  name: string;
  nameHi: string | null;
  date: string;
  enHref: string;
  hiHref: string | null;
  hero: WikiHeroImage | null;
};

const baseOf = (s: string) => s.replace(/-20\d\d$/, "");

/** Today's date in India, YYYY-MM-DD. */
function todayIST(): string {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
}

function formatDate(d: string): string {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

function monthKey(d: string): string {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("hi-IN", {
    month: "long", year: "numeric", timeZone: "UTC",
  });
}

async function getCards(): Promise<Card[]> {
  const today = todayIST();
  try {
    const db = supa();
    const [{ data: content }, { data: master }] = await Promise.all([
      db.from("festival_content")
        .select("base_slug,lang,page_slug,hero_image")
        .eq("is_published", true),
      db.from("festivals_master")
        .select("festival_slug,festival_name,name_hindi,date")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(2000),
    ]);
    const rows = (content ?? []) as ContentRow[];
    const future = (master ?? []) as MasterRow[];

    // First (= next) occurrence of each festival.
    const next = new Map<string, MasterRow>();
    for (const m of future) {
      if (typeof m.festival_slug !== "string") continue;
      const b = baseOf(m.festival_slug);
      if (!next.has(b)) next.set(b, m);
    }

    const en = new Map<string, ContentRow>();
    const hi = new Map<string, ContentRow>();
    for (const r of rows) (r.lang === "hi" ? hi : en).set(r.base_slug, r);

    const cards: Card[] = [];
    for (const [base, row] of Array.from(en.entries())) {
      const m = next.get(base);
      if (!m) continue; // no future date in festivals_master -> no working EN URL to link
      const h = hi.get(base);
      cards.push({
        base,
        name: m.festival_name,
        nameHi: m.name_hindi,
        date: m.date,
        enHref: `/events/${m.festival_slug}`,
        hiHref: h?.page_slug ? `/hi/${h.page_slug}` : null,
        hero: normalizeHeroImage(row.hero_image) ?? normalizeHeroImage(h?.hero_image),
      });
    }
    cards.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
    return cards;
  } catch {
    return [];
  }
}

export default async function EventsHub() {
  const today = todayIST();
  const cards = await getCards();

  // Group by month, keeping date order.
  const groups: { label: string; items: Card[] }[] = [];
  for (const c of cards) {
    const label = monthKey(c.date);
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(c);
    else groups.push({ label, items: [c] });
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Panchang", item: `${SITE_URL}/panchang` },
          { "@type": "ListItem", position: 3, name: "Festival Calendar", item: PAGE_URL },
        ],
      },
      {
        "@type": "ItemList",
        name: "Hindu Festival Calendar",
        url: PAGE_URL,
        numberOfItems: cards.length,
        itemListElement: cards.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          url: `${SITE_URL}${c.enHref}`,
        })),
      },
    ],
  };

  return (
    <>
    <SiteNav />
    <main className="min-h-screen bg-[#080B12] pt-16 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">

        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-400">
          <Link href="/" className="hover:text-amber-300 transition">Home</Link>
          {" · "}
          <Link href="/panchang" className="hover:text-amber-300 transition">Panchang</Link>
          {" · "}
          <span className="text-slate-300">त्योहार कैलेंडर</span>
        </nav>

        <h1 className="font-serif text-3xl font-bold text-amber-300 md:text-4xl">
          त्योहार कैलेंडर — Hindu Festival Calendar
        </h1>

        {/* 40-60 word direct answer (GEO) */}
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
          This calendar lists {cards.length > 0 ? cards.length : "every"} Hindu festivals
          with their next date, calculated from the tithi on Swiss Ephemeris and decided by
          classical nirnaya rules. Each festival has a full English and Hindi guide covering
          significance, katha, puja vidhi, muhurat logic and, where the classical texts
          support it, shastra references, prepared under Rohiit Gupta, Chief Vedic Architect.
        </p>

        {cards.length === 0 ? (
          <p className="mt-10 rounded-xl border border-amber-800/40 bg-slate-900/60 p-6 text-slate-300">
            त्योहारों की सूची अभी लोड नहीं हो सकी। कुछ देर बाद फिर देखें, या{" "}
            <Link href="/panchang" className="text-amber-300 underline">आज का पंचांग</Link> देखें।
          </p>
        ) : (
          groups.map((g) => (
            <section key={g.label} className="mt-12">
              <h2 className="mb-5 border-b border-amber-900/40 pb-2 text-xl font-bold text-amber-200">
                {g.label}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((c) => {
                  const diff = daysBetween(today, c.date);
                  const when = diff <= 0 ? "आज" : diff === 1 ? "कल" : `${diff} दिन बाद`;
                  return (
                    <article
                      key={c.base}
                      className="group overflow-hidden rounded-2xl border border-amber-900/40 bg-slate-900/60 transition hover:border-amber-500/60"
                    >
                      <Link href={c.enHref} className="block" aria-label={c.name}>
                        {c.hero ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.hero.url}
                            alt={c.hero.alt}
                            width={c.hero.width}
                            height={c.hero.height}
                            loading="lazy"
                            decoding="async"
                            className="block aspect-video h-auto w-full bg-slate-950 object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-amber-950 via-slate-900 to-[#080B12]">
                            <span className="font-serif text-2xl font-bold text-amber-300/80">
                              {c.nameHi || c.name}
                            </span>
                          </div>
                        )}
                      </Link>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link href={c.enHref} className="text-lg font-semibold text-white hover:text-amber-300">
                              {c.name}
                            </Link>
                            {c.nameHi && <p className="text-sm text-slate-400">{c.nameHi}</p>}
                          </div>
                          <span className="shrink-0 rounded-full bg-amber-900/40 px-2.5 py-1 text-xs font-semibold text-amber-300">
                            {when}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">{formatDate(c.date)}</p>
                        <div className="mt-4 flex gap-2">
                          <Link
                            href={c.enHref}
                            className="flex-1 rounded-lg border border-amber-700/50 px-3 py-2 text-center text-sm font-medium text-amber-200 transition hover:bg-amber-900/30"
                          >
                            English
                          </Link>
                          {c.hiHref && (
                            <Link
                              href={c.hiHref}
                              lang="hi"
                              className="flex-1 rounded-lg border border-amber-700/50 px-3 py-2 text-center text-sm font-medium text-amber-200 transition hover:bg-amber-900/30"
                            >
                              हिंदी
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}

        <div className="mt-14 rounded-2xl border border-amber-800/50 bg-amber-950/30 p-6 text-center">
          <p className="text-lg font-semibold text-amber-200">
            त्योहार सबके लिए एक, पर उसका असर हर कुंडली पर अलग।
          </p>
          <p className="mt-1 text-sm text-slate-400">
            See what the coming festivals and transits mean for your own chart.
          </p>
          <Link
            href="/#birth-form"
            className="mt-4 inline-block rounded-full bg-gradient-to-br from-[#D4AF37] to-[#A8820A] px-6 py-2.5 text-sm font-semibold text-[#080B12] transition hover:scale-105"
          >
            Free Kundali Analysis
          </Link>
        </div>
      </div>
    </main>
    </>
  );
}
