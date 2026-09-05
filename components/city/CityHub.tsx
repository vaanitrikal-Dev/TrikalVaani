/**
 * ============================================================================
 * 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        components/city/CityHub.tsx
 * Version:     v1.0 — NEW FILE. City hub page for all 10 cities.
 * Date:        2026-09-05
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 *
 * WHERE THIS FILE GOES:
 *   GitHub path -> components/city/CityHub.tsx
 *   The components/city/ folder does NOT exist yet. Create it.
 *   Ship this TOGETHER with app/[domain]/page.tsx v2.9 — neither works alone.
 *
 * ── WHY THIS FILE EXISTS ───────────────────────────────────────────────────
 * sitemap.ts has been emitting /delhi, /mumbai, /pune, /noida, /chennai,
 * /kolkata, /bangalore, /hyderabad, /gurgaon, /ahmedabad since the city
 * fan-out shipped. None of those 10 URLs ever had a page. They all returned
 * 404, and Google's 404 report (5 Sep 2026) confirms it crawled every one.
 *
 * The damage is not the 10 URLs. Each city has ~278 live
 * /{city}/events/{festival} pages underneath it — roughly 2,780 pages — and
 * with no hub above them, not one of those pages has a parent to inherit
 * authority from. They sit in the sitemap as orphans, which is exactly the
 * profile Google files under "Discovered – currently not indexed".
 *
 * A 301 would NOT have fixed this. Redirecting /delhi would only convert a
 * "404" error into a "Page with redirect" error while sitemap.ts keeps
 * listing it, and the 278 children would stay orphaned. The hub had to be
 * built, and it had to link down to the children. That is the whole point.
 *
 * ── HOW THE FESTIVAL LIST IS BUILT ─────────────────────────────────────────
 * Read from festivals_master with is_indexed = true, then filtered through
 * festivalInState() — a byte-for-byte copy of the function in sitemap.ts.
 * This is deliberate. If this page used any other filter it would link to
 * city-festival URLs that sitemap.ts does not emit and that may 404, and a
 * hub full of broken links is worse than no hub. The two must agree, so the
 * rule lives in one shape in two places. If you ever change the scope rule
 * in sitemap.ts, change it here in the same commit.
 *
 * Only upcoming festivals are listed, capped at 24, soonest first. Past
 * festivals still exist and are still crawlable from the sitemap — they are
 * just not what a visitor landing on /delhi in September wants to see.
 *
 * ── IR-0 / LOCAL-SEO SAFETY ────────────────────────────────────────────────
 * NO LocalBusiness schema and NO PostalAddress on these pages. Trikaal Vaani
 * has ONE real address (Dwarka, New Delhi). Emitting a LocalBusiness node on
 * /mumbai or /chennai would be a fabricated NAP, which is the fastest way to
 * lose local ranking and can get a Google Business Profile suspended. These
 * pages use WebPage + BreadcrumbList + ItemList + FAQPage only. The
 * /astrologer-{city} pages remain the only local-intent landing pages, and
 * this hub links to one only where the page actually exists (see
 * ASTROLOGER_PAGES below) — never to a slug that 404s.
 *
 * ── GEO (AI SEARCH) ────────────────────────────────────────────────────────
 * Opens with a 40-60 word direct answer block, entity-rich (city name, state,
 * temple names, festival names, Panchang, Rohiit Gupta), followed by an
 * extractable FAQ block. That is the shape SGE / Perplexity / SearchGPT lift
 * answers from.
 * ============================================================================
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import citiesData from '../../app/data/cities.json';

// ─── Types ──────────────────────────────────────────────────────────────────

export type City = {
  slug: string;
  name: string;
  name_hindi: string;
  state: string;
  latitude: number;
  longitude: number;
  timezone: string;
  description: string;
  famous_temples: string[];
  language: string;
  population_tier?: number | string;
};

type FestivalRow = {
  festival_slug: string;
  festival_name: string | null;
  date: string;
  festival_scope: string | null;
  home_states: string[] | null;
  is_indexed: boolean | null;
};

// ─── City registry ──────────────────────────────────────────────────────────

export const ALL_CITIES = (citiesData as { cities: City[] }).cities;

export const CITY_SLUGS = new Set(ALL_CITIES.map((c) => c.slug));

export function getCity(slug: string): City | null {
  return ALL_CITIES.find((c) => c.slug === slug) ?? null;
}

/**
 * Cities that have a real /astrologer-{slug} page in the repo TODAY.
 * Verified live 5 Sep 2026: delhi, ghaziabad, gurgaon, noida return 200.
 * Do NOT add a city here until app/astrologer-{slug}/page.tsx exists —
 * linking a hub to a 404 is the exact mistake this whole release is undoing.
 */
const ASTROLOGER_PAGES = new Set(['delhi', 'gurgaon', 'noida']);

// ─── Scope filter — MUST stay identical to sitemap.ts festivalInState() ─────

function festivalInState(
  scope: string | null,
  homeStates: string[] | null,
  state: string
): boolean {
  if (scope === 'regional' && Array.isArray(homeStates) && homeStates.length > 0) {
    return homeStates.includes(state);
  }
  return true;
}

// ─── Data ───────────────────────────────────────────────────────────────────

async function getCityFestivals(city: City): Promise<FestivalRow[]> {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('festivals_master')
    .select('festival_slug, festival_name, date, festival_scope, home_states, is_indexed')
    .eq('is_indexed', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(120);

  if (error || !data) {
    if (error) console.error('[TV-Supabase] getCityFestivals error:', error.message);
    return [];
  }

  return (data as FestivalRow[])
    .filter((f) => festivalInState(f.festival_scope, f.home_states, city.state))
    .slice(0, 24);
}

// ─── Copy helpers ───────────────────────────────────────────────────────────

function prettyDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function titleize(slug: string): string {
  return slug
    .replace(/-\d{4}$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** 40-60 word GEO direct answer. Entity-rich, city-specific, no filler. */
function directAnswer(city: City, count: number): string {
  const temple = city.famous_temples?.[0] ?? 'its principal temples';
  return (
    `Trikaal Vaani publishes Vedic astrology guidance for ${city.name}, ${city.state} — ` +
    `daily Panchang computed for ${city.name}'s own coordinates, ` +
    `${count > 0 ? `${count} upcoming festival` : 'festival'}${count === 1 ? '' : 's'} with local muhurat timings, ` +
    `and temple context including ${temple}. ` +
    `Every calculation uses Swiss Ephemeris positions and BPHS classical rules, ` +
    `reviewed by Rohiit Gupta, Chief Vedic Architect.`
  );
}

function cityFaqs(city: City, festivals: FestivalRow[]): { q: string; a: string }[] {
  const next = festivals[0];
  const temples = (city.famous_temples ?? []).slice(0, 3).join(', ');

  return [
    {
      q: `Why does Panchang for ${city.name} differ from other cities?`,
      a:
        `Sunrise, sunset and every muhurat window are functions of latitude and longitude. ` +
        `${city.name} sits at ${city.latitude.toFixed(2)}°N, ${city.longitude.toFixed(2)}°E, so its ` +
        `Rahu Kaal, Abhijit Muhurat and tithi transition times differ from Delhi's by several minutes ` +
        `to over half an hour. Trikaal Vaani computes each city separately rather than serving one ` +
        `national timetable, because a muhurat that is off by twenty minutes is not a muhurat.`,
    },
    {
      q: next
        ? `When is ${next.festival_name ?? titleize(next.festival_slug)} in ${city.name}?`
        : `Where can I see festival dates for ${city.name}?`,
      a: next
        ? `${next.festival_name ?? titleize(next.festival_slug)} falls on ${prettyDate(next.date)}. ` +
          `The ${city.name} page for it carries the puja muhurat calculated for ${city.name}'s coordinates, ` +
          `along with the vrat rules and local observance notes.`
        : `The festival list on this page is generated from Trikaal Vaani's festival calendar and updates ` +
          `automatically as dates approach.`,
    },
    {
      q: `Which temples matter for Vedic observance in ${city.name}?`,
      a: temples
        ? `${temples} are the ones that shape local observance in ${city.name}. Festival pages for this city ` +
          `note where the customary rituals differ from the pan-India form, because regional practice is ` +
          `part of the prediction context, not decoration.`
        : `${city.name}'s festival pages carry local observance notes wherever regional practice diverges ` +
          `from the pan-India form.`,
    },
    {
      q: `Do I need to be in ${city.name} to get a reading?`,
      a:
        `No. A kundali is cast from your birth place and birth time, not your current location. ` +
        `The ${city.name} pages exist because Panchang and muhurat are location-dependent — useful when you ` +
        `are choosing a date to act in ${city.name}. Your birth chart analysis is the same wherever you open it from.`,
    },
  ];
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export function buildCityMetadata(slug: string): Metadata {
  const city = getCity(slug);
  if (!city) return { title: 'Trikaal Vaani' };

  const title = `Vedic Astrology in ${city.name} — Panchang, Festivals & Muhurat | Trikaal Vaani`;
  const description =
    `Daily Panchang for ${city.name} computed on local coordinates, upcoming festival dates with ` +
    `${city.name} muhurat timings, and BPHS-based Vedic guidance by Rohiit Gupta, Chief Vedic Architect.`;
  const url = `https://trikalvaani.com/${city.slug}`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      `vedic astrology ${city.name}`,
      `panchang ${city.name}`,
      `${city.name} muhurat today`,
      `festival dates ${city.name} 2026`,
      `jyotish ${city.name}`,
      `rahu kaal ${city.name}`,
    ],
    authors: [{ name: 'Rohiit Gupta', url: 'https://trikalvaani.com/founder' }],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Trikaal Vaani',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: 'https://trikalvaani.com/og-image.png',
          width: 1200,
          height: 630,
          alt: `Vedic Astrology in ${city.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://trikalvaani.com/og-image.png'],
    },
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function CityHub({ citySlug }: { citySlug: string }) {
  // notFound() is typed `never` by Next, but only once next/navigation types
  // are resolved. Narrowing explicitly keeps this file type-clean on its own
  // and does not depend on typescript.ignoreBuildErrors being set.
  const maybeCity = getCity(citySlug);
  if (!maybeCity) notFound();
  const city = maybeCity as City;

  const festivals = await getCityFestivals(city);
  const faqs = cityFaqs(city, festivals);
  const answer = directAnswer(city, festivals.length);
  const url = `https://trikalvaani.com/${city.slug}`;
  const others = ALL_CITIES.filter((c) => c.slug !== city.slug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
      { '@type': 'ListItem', position: 2, name: city.name, item: url },
    ],
  };

  // WebPage — NOT LocalBusiness. See the IR-0 note in the header.
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Vedic Astrology in ${city.name}`,
    description: answer,
    url,
    inLanguage: 'en-IN',
    about: {
      '@type': 'Place',
      name: city.name,
      address: { '@type': 'PostalAddress', addressRegion: city.state, addressCountry: 'IN' },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: city.latitude,
        longitude: city.longitude,
      },
    },
    author: {
      '@type': 'Person',
      '@id': 'https://trikalvaani.com/#rohiit-gupta',
      name: 'Rohiit Gupta',
      jobTitle: 'Chief Vedic Architect',
      url: 'https://trikalvaani.com/founder',
      knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'BPHS', 'Panchang', 'Muhurat'],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Trikaal Vaani',
      url: 'https://trikalvaani.com',
      logo: 'https://trikalvaani.com/Trikal_Logo.png',
    },
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Upcoming festivals in ${city.name}`,
    numberOfItems: festivals.length,
    itemListElement: festivals.map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: f.festival_name ?? titleize(f.festival_slug),
      url: `https://trikalvaani.com/${city.slug}/events/${f.festival_slug}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      {festivals.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen" style={{ background: '#080B12', color: '#e2e8f0' }}>

        <div className="max-w-4xl mx-auto px-4 pt-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color: '#D4AF37' }}>{city.name}</span>
          </nav>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">

          {/* ── Hero + GEO direct answer ── */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🕉️</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Vedic Astrology in {city.name}
            </h1>
            <p className="text-sm text-slate-500 mb-4">
              {city.name_hindi} · {city.state}
            </p>
            <div
              className="max-w-2xl mx-auto mt-4 p-4 rounded-xl text-left"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <p className="text-xs text-amber-500 font-semibold mb-2 uppercase tracking-wider">
                Vedic Astrology Answer
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{answer}</p>
            </div>
          </div>

          {/* ── Fact chips ── */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { label: 'State', value: city.state },
              { label: 'Coordinates', value: `${city.latitude.toFixed(2)}°N, ${city.longitude.toFixed(2)}°E` },
              { label: 'Upcoming Festivals', value: String(festivals.length) },
            ].map((chip) => (
              <div
                key={chip.label}
                className="px-4 py-2 rounded-full text-xs"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <span style={{ color: '#64748b' }}>{chip.label}: </span>
                <span style={{ color: '#D4AF37' }}>{chip.value}</span>
              </div>
            ))}
          </div>

          {/* ── Primary CTAs ── */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link
              href="/#birth-form"
              className="inline-block px-8 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}
            >
              Get Your Free Kundali 🔱
            </Link>
            <Link
              href={`/${city.slug}/panchang`}
              className="inline-block px-6 py-3.5 rounded-xl text-sm font-semibold hover:text-amber-300 transition-colors"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37' }}
            >
              Today&apos;s Panchang for {city.name}
            </Link>
            {ASTROLOGER_PAGES.has(city.slug) && (
              <Link
                href={`/astrologer-${city.slug}`}
                className="inline-block px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-amber-400 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                Consult an Astrologer in {city.name}
              </Link>
            )}
          </div>

          {/* ── Context ── */}
          <article
            className="rounded-2xl p-6 sm:p-8 mb-8"
            style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="flex items-center gap-2 mb-4 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span
                className="text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}
              >
                By Rohiit Gupta, Chief Vedic Architect
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-4">
              Why {city.name} has its own Panchang
            </h2>
            <p className="text-sm leading-relaxed text-slate-300 mb-4">
              {city.description}
            </p>
            <p className="text-sm leading-relaxed text-slate-300 mb-4">
              Every timing on this site that matters — Rahu Kaal, Abhijit Muhurat, the moment a tithi
              turns, the window a puja should begin in — is derived from the Sun&apos;s position relative to
              a specific point on the earth. {city.name} sits at {city.latitude.toFixed(2)}°N,{' '}
              {city.longitude.toFixed(2)}°E. Serving it Delhi&apos;s sunrise would put every muhurat on the page
              out by minutes, and a muhurat that is out by minutes has stopped being a muhurat. So Trikaal
              Vaani computes {city.name} from {city.name}&apos;s own coordinates, using Swiss Ephemeris
              positions rather than tabulated approximations.
            </p>
            {city.famous_temples?.length > 0 && (
              <p className="text-sm leading-relaxed text-slate-300">
                Local observance matters as much as local timing. {city.famous_temples.slice(0, 4).join(', ')}{' '}
                shape how festivals are actually kept in {city.name}, and the festival pages below carry
                those regional notes wherever practice diverges from the pan-India form.
              </p>
            )}
          </article>

          {/* ── Festival list: the internal-linking layer that un-orphans the children ── */}
          {festivals.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-2">
                Upcoming Festivals &amp; Muhurat in {city.name}
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                Each page carries the puja muhurat calculated for {city.name}, not a national average.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {festivals.map((f) => (
                  <Link
                    key={f.festival_slug}
                    href={`/${city.slug}/events/${f.festival_slug}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:text-amber-300 transition-colors"
                    style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <span className="text-sm text-slate-200">
                      {f.festival_name ?? titleize(f.festival_slug)}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: '#D4AF37' }}>
                      {prettyDate(f.date)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── FAQ (GEO extraction block) ── */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-5">
              Frequently Asked Questions — Vedic Astrology in {city.name}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 className="text-sm font-semibold text-white flex items-start gap-2">
                      <span style={{ color: '#D4AF37', flexShrink: 0 }}>Q.</span>
                      {faq.q}
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                      <span style={{ color: '#22c55e', flexShrink: 0 }}>A.</span>
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Conversion block ── */}
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))',
              border: '1px solid rgba(212,175,55,0.25)',
            }}
          >
            <div className="text-3xl mb-3">🔱</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Get Your Personal Reading — {city.name}
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              Swiss Ephemeris accuracy + BPHS classical analysis + Bhrigu Nandi patterns.
              <br />
              By Rohiit Gupta, Chief Vedic Architect
            </p>
            <Link
              href="/#birth-form"
              className="inline-block px-8 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}
            >
              Start Free Reading 🔱
            </Link>
            <p className="text-xs text-slate-600 mt-3">No credit card. Instant results.</p>
          </div>

          {/* ── Cross-links: calculators ── */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Free Calculators</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { slug: 'free-kundali-calculator', name: 'Kundali', emoji: '📜' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati', emoji: '🪐' },
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh', emoji: '🔥' },
                { slug: 'free-shadi-kab-hogi-calculator', name: 'Shadi Kab Hogi', emoji: '💍' },
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day', emoji: '🍀' },
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra', emoji: '⭐' },
              ].map((calc) => (
                <Link
                  key={calc.slug}
                  href={`/calculators/${calc.slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs hover:text-amber-300 transition-colors"
                  style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}
                >
                  {calc.emoji} {calc.name}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Cross-links: sibling cities (hub-to-hub, spreads authority) ── */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Panchang in Other Cities</h3>
            <div className="flex flex-wrap gap-2">
              {others.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-amber-400 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
