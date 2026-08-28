// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:    app/hi/[...path]/page.tsx
// Version: v1.1 (28 Aug 2026)
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// Hindi festival pages, national and city, from one file.
//
//     /hi/ganesh-chaturthi-kab-hai              one segment  → national
//     /hi/hyderabad/ganesh-chaturthi-kab-hai    two segments → city
//
// ── WHY A CATCH-ALL AND NOT TWO ROUTES ─────────────────────────────────────
//
// v1.0 shipped these as app/hi/[slug]/page.tsx and
// app/hi/[domain]/[slug]/page.tsx and the build failed:
//
//     Error: You cannot use different slug names for the same dynamic path
//            ('domain' !== 'slug')
//
// Next.js requires that the dynamic segment in a given position carry ONE
// name across the whole tree. Both of those routes put a dynamic segment
// immediately under /hi/, one called [domain] and one called [slug], and that
// is not allowed. The mistake was mine: [domain] was copied from the English
// route without checking what it would collide with under /hi/.
//
// A single catch-all cannot have that conflict, and it is one file rather than
// two nearly identical ones.
//
// ── PRECEDENCE, AND THE COMPATIBILITY PAGES ────────────────────────────────
//
// A catch-all matches everything under /hi/, so it is worth being explicit
// about what that does and does not affect.
//
// It does not shadow a static route: Next.js resolves static segments before
// dynamic ones and dynamic before catch-alls. If app/hi/compatibility/... is
// ever added it wins on its own path, untouched by this file.
//
// Checked on 28 Aug 2026: there is no app/hi directory in the repo at all, and
// /hi/compatibility/dhanu-kanya returns 404 live even though 144 such URLs sit
// in the sitemap. Those pages are already broken and this route neither
// created nor worsens that — but it is worth fixing separately.
//
// Anything this route cannot resolve to a festival calls notFound(), so the
// worst case here is a 404, never a wrong page served under a Hindi URL.
// ════════════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import FestivalPillar, {
  ALL_CITIES, CITY_SLUGS, SITE_URL, OG_IMAGE, AUTHOR_NAME, AUTHOR_TITLE,
  resolveFestival, getContent, baseSlug,
} from "@/components/festival/FestivalPillar";

export const revalidate = 86400;
export const dynamicParams = true;

type Params = { params: { path: string[] } };

/**
 * Split the path into a city (optional) and a festival slug.
 *
 * One segment  → national.  Two → city first, festival second, matching the
 * English order so the two languages read the same way round.
 * Anything else, or an unknown city, resolves to null and the caller 404s.
 */
function parse(path: string[]) {
  if (!path?.length || path.length > 2) return null;
  if (path.length === 1) return { citySlug: null, slug: path[0] };
  const [citySlug, slug] = path;
  if (!CITY_SLUGS.has(citySlug)) return null;
  return { citySlug, slug };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = parse(params.path);
  if (!p) return {};
  const city = p.citySlug ? ALL_CITIES.find(c => c.slug === p.citySlug) : null;
  if (p.citySlug && !city) return {};

  const f = await resolveFestival(p.slug, "hi");
  if (!f) return {};
  const content = await getContent(baseSlug(f.festival_slug), "hi");
  const name = f.name_hindi || f.festival_name;
  const place = city ? city.name_hindi : null;

  const url = city
    ? `${SITE_URL}/hi/${city.slug}/${p.slug}`
    : `${SITE_URL}/hi/${p.slug}`;

  const title = content?.seo_title
    ? (place ? `${content.seo_title} — ${place}` : content.seo_title)
    : (place
        ? `${place} में ${name} कब है — तारीख, मुहूर्त और पूजा विधि`
        : `${name} कब है — तारीख, शुभ मुहूर्त और पूजा विधि`);

  const description = content?.seo_description
    ?? (place
        ? `${place} के लिए ${name} की तिथि, पूजा मुहूर्त, राहुकाल और सूर्योदय — स्विस एफ़ेमेरिस से गणना।`
        : `${name} की सही तारीख, पूजा मुहूर्त, व्रत विधि और शहरवार समय — त्रिकाल वाणी के अपने इंजन से गणना।`);

  // hreflang from alt_lang_slug. The English side keeps the year in its slug,
  // so it is stored per row rather than derived.
  const languages: Record<string, string> = { "hi-IN": url };
  if (content?.alt_lang_slug) {
    languages["en-IN"] = city
      ? `${SITE_URL}/${city.slug}/events/${content.alt_lang_slug}`
      : `${SITE_URL}/events/${content.alt_lang_slug}`;
  }

  return {
    title, description,
    alternates: { canonical: url, languages },
    authors: [{ name: `${AUTHOR_NAME}, ${AUTHOR_TITLE}` }],
    openGraph: { title, description, url, images: [OG_IMAGE], type: "article", locale: "hi_IN" },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function Page({ params }: Params) {
  const p = parse(params.path);
  if (!p) notFound();

  const city = p.citySlug ? ALL_CITIES.find(c => c.slug === p.citySlug) ?? null : null;
  if (p.citySlug && !city) notFound();

  const festival = await resolveFestival(p.slug, "hi");
  if (!festival) notFound();

  // A regional festival renders only where it is observed.
  if (city && festival.festival_scope === "regional" && festival.home_states?.length &&
      !festival.home_states.includes(city.state)) notFound();

  return <FestivalPillar festival={festival} city={city} lang="hi" />;
}

// END — app/hi/[...path]/page.tsx v1.1 | Trikaal Vaani | Rohiit Gupta
