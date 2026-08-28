// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// File:    app/events/[slug]/page.tsx
// Version: v4.1 (28 Aug 2026) — thin route over components/festival/FestivalPillar
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// English, national. Same body as the city route; timings fall back to New
// Delhi coordinates and the page says so rather than implying they are
// nationwide. Panchang timings are not nationwide and never were.
// ════════════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import FestivalPillar, {
  SITE_URL, OG_IMAGE, AUTHOR_NAME, AUTHOR_TITLE,
  resolveFestival, getContent, baseSlug, buildMeta,
} from "@/components/festival/FestivalPillar";

export const revalidate = 86400;
export const dynamicParams = true;

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const f = await resolveFestival(params.slug, "en");
  if (!f) return {};
  const content = await getContent(baseSlug(f.festival_slug), "en");
  const { title, description, keywords } =
    buildMeta({ lang: "en", festival: f, city: null, content, local: null });

  const url = `${SITE_URL}/events/${f.festival_slug}`;

  const languages: Record<string, string> = { "en-IN": url };
  if (content?.alt_lang_slug) {
    languages["hi-IN"] = `${SITE_URL}/hi/${content.alt_lang_slug}`;
  }

  return {
    title, description, keywords,
    alternates: { canonical: url, languages },
    authors: [{ name: `${AUTHOR_NAME}, ${AUTHOR_TITLE}` }],
    openGraph: { title, description, url, images: [OG_IMAGE], type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
    robots: { index: true, follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

export default async function Page({ params }: Params) {
  const festival = await resolveFestival(params.slug, "en");
  if (!festival) notFound();
  return <FestivalPillar festival={festival} city={null} lang="en" />;
}
