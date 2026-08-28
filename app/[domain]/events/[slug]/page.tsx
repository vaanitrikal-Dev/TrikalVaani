// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// File:    app/[domain]/events/[slug]/page.tsx
// Version: v4.0 (28 Aug 2026) — thin route over components/festival/FestivalPillar
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// English, city. The whole page body lives in FestivalPillar, shared with the
// three other routes, so a change to any section reaches all four at once.
// Four separate copies would have drifted the first time one was edited.
//
// English slugs keep the year. Those URLs carry roughly 27,000 impressions a
// quarter and there is no reason to break them.
// ════════════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import FestivalPillar, {
  ALL_CITIES, CITY_SLUGS, SITE_URL, OG_IMAGE, AUTHOR_NAME, AUTHOR_TITLE,
  resolveFestival, getContent, baseSlug,
} from "@/components/festival/FestivalPillar";

export const revalidate = 86400;
export const dynamicParams = true;

type Params = { params: { domain: string; slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const city = ALL_CITIES.find(c => c.slug === params.domain);
  const f = city ? await resolveFestival(params.slug, "en") : null;
  if (!city || !f) return {};
  const content = await getContent(baseSlug(f.festival_slug), "en");

  const url = `${SITE_URL}/${city.slug}/events/${f.festival_slug}`;
  const title = content?.seo_title
    ? `${content.seo_title} — ${city.name}`
    : `${f.festival_name} in ${city.name}: Date, Muhurat & Puja Vidhi`;
  const description = content?.seo_description
    ?? `${f.festival_name} ${f.date} in ${city.name}. Tithi, puja muhurat, Rahu Kaal and sunrise computed for ${city.name}.`;

  // hreflang from alt_lang_slug. The site had none anywhere before v4.0, which
  // left the Hindi and English pages competing instead of covering two searches.
  const languages: Record<string, string> = { "en-IN": url };
  if (content?.alt_lang_slug) {
    languages["hi-IN"] = `${SITE_URL}/hi/${city.slug}/${content.alt_lang_slug}`;
  }

  return {
    title, description,
    alternates: { canonical: url, languages },
    authors: [{ name: `${AUTHOR_NAME}, ${AUTHOR_TITLE}` }],
    openGraph: { title, description, url, images: [OG_IMAGE], type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
    robots: { index: true, follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

export default async function Page({ params }: Params) {
  if (!CITY_SLUGS.has(params.domain)) notFound();
  const city = ALL_CITIES.find(c => c.slug === params.domain);
  if (!city) notFound();

  const festival = await resolveFestival(params.slug, "en");
  if (!festival) notFound();

  // A regional festival renders only where it is observed. Kept from v2.6.
  if (festival.festival_scope === "regional" && festival.home_states?.length &&
      !festival.home_states.includes(city.state)) notFound();

  return <FestivalPillar festival={festival} city={city} lang="en" />;
}
