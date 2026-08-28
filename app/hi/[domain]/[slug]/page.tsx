// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// File:    app/hi/[domain]/[slug]/page.tsx
// Version: v1.0 (28 Aug 2026)
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// Hindi, city.  /hi/hyderabad/ganesh-chaturthi-kab-hai
//
// No "/events/" in the path — an English word in a Hindi URL earns nothing and
// costs length. No year either: the Hindi pages are new, so they start on the
// authority slug, one URL that accumulates rather than restarting each January.
// resolveFestival() answers with the NEXT occurrence, so the page is never
// stale and the URL never ages.
//
// "kab-hai" is not decoration — it is the query people actually type.
//
// The Hindi content is NOT a translation of the English row. It is generated
// from its own prompt for Hindi search intent, because "करवा चौथ में क्या खाएं"
// is a different question from "Karva Chauth fasting rules".
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
  const f = city ? await resolveFestival(params.slug, "hi") : null;
  if (!city || !f) return {};
  const content = await getContent(baseSlug(f.festival_slug), "hi");
  const name = f.name_hindi || f.festival_name;

  const url = `${SITE_URL}/hi/${city.slug}/${params.slug}`;
  const title = content?.seo_title
    ? `${content.seo_title} — ${city.name_hindi}`
    : `${city.name_hindi} में ${name} कब है — तारीख, मुहूर्त और पूजा विधि`;
  const description = content?.seo_description
    ?? `${city.name_hindi} के लिए ${name} की तिथि, पूजा मुहूर्त, राहुकाल और सूर्योदय — स्विस एफ़ेमेरिस से गणना।`;

  const languages: Record<string, string> = { "hi-IN": url };
  if (content?.alt_lang_slug) {
    languages["en-IN"] = `${SITE_URL}/${city.slug}/events/${content.alt_lang_slug}`;
  }

  return {
    title, description,
    alternates: { canonical: url, languages },
    authors: [{ name: `${AUTHOR_NAME}, ${AUTHOR_TITLE}` }],
    openGraph: { title, description, url, images: [OG_IMAGE], type: "article", locale: "hi_IN" },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
    robots: { index: true, follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

export default async function Page({ params }: Params) {
  if (!CITY_SLUGS.has(params.domain)) notFound();
  const city = ALL_CITIES.find(c => c.slug === params.domain);
  if (!city) notFound();

  const festival = await resolveFestival(params.slug, "hi");
  if (!festival) notFound();

  if (festival.festival_scope === "regional" && festival.home_states?.length &&
      !festival.home_states.includes(city.state)) notFound();

  return <FestivalPillar festival={festival} city={city} lang="hi" />;
}
