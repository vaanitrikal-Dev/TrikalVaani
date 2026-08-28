// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// File:    app/hi/[slug]/page.tsx
// Version: v1.0 (28 Aug 2026)
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// Hindi, national.  /hi/ganesh-chaturthi-kab-hai
//
// CAUTION — this route is greedy. It matches any single segment under /hi/,
// so it will also catch /hi/anything-else. It must NOT shadow the existing
// /hi/compatibility/... pages: those have TWO segments (/hi/compatibility/
// dhanu-kanya) and Next.js matches the more specific route first, so the 288
// compatibility pages are untouched.
//
// If a one-segment /hi/ page is ever added for something that is not a
// festival, resolveFestival returns null and this route calls notFound() —
// so the worst case is a 404, never a wrong page.
// ════════════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import FestivalPillar, {
  SITE_URL, OG_IMAGE, AUTHOR_NAME, AUTHOR_TITLE,
  resolveFestival, getContent, baseSlug,
} from "@/components/festival/FestivalPillar";

export const revalidate = 86400;
export const dynamicParams = true;

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const f = await resolveFestival(params.slug, "hi");
  if (!f) return {};
  const content = await getContent(baseSlug(f.festival_slug), "hi");
  const name = f.name_hindi || f.festival_name;

  const url = `${SITE_URL}/hi/${params.slug}`;
  const title = content?.seo_title ?? `${name} कब है — तारीख, शुभ मुहूर्त और पूजा विधि`;
  const description = content?.seo_description
    ?? `${name} की सही तारीख, पूजा मुहूर्त, व्रत विधि और शहरवार समय — त्रिकाल वाणी के अपने इंजन से गणना।`;

  const languages: Record<string, string> = { "hi-IN": url };
  if (content?.alt_lang_slug) {
    languages["en-IN"] = `${SITE_URL}/events/${content.alt_lang_slug}`;
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
  const festival = await resolveFestival(params.slug, "hi");
  if (!festival) notFound();
  return <FestivalPillar festival={festival} city={null} lang="hi" />;
}
