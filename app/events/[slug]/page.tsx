// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// File:    app/events/[slug]/page.tsx
// Version: v4.3 (11 Nov 2026) — a festival page dated more than 400 days ahead (the
//          2028–2030 copies) now redirects (307, temporary) to the NEXT occurrence of the
//          same festival and carries robots noindex; it comes back on its own when its
//          date is within range. Google thin-content recovery, approved by Rohiit 11 Nov 2026.
// Previous: v4.2 (16 Oct 2026) — og/twitter image = festivalOgImage(content) (editorial_rulings #20)
// Previous: v4.1 (28 Aug 2026) — thin route over components/festival/FestivalPillar
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// English, national. Same body as the city route; timings fall back to New
// Delhi coordinates and the page says so rather than implying they are
// nationwide. Panchang timings are not nationwide and never were.
// ════════════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { isFestivalFarFuture } from "@/lib/city-index-keep";
import FestivalPillar, {
  SITE_URL, AUTHOR_NAME, AUTHOR_TITLE,
  resolveFestival, getContent, festivalOgImage, baseSlug, buildMeta,
} from "@/components/festival/FestivalPillar";

export const revalidate = 86400;
export const dynamicParams = true;

type Params = { params: { slug: string } };

/** v4.3 — slug of the next upcoming occurrence of this festival, or null. */
async function nextOccurrenceSlug(base: string): Promise<string | null> {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await db.from("festivals_master")
      .select("festival_slug,date")
      .like("festival_slug", `${base}-%`)
      .gte("date", today).order("date").limit(40);
    const hit = ((data ?? []) as { festival_slug: string; date: string }[])
      .find((r) => baseSlug(r.festival_slug) === base);
    return hit?.festival_slug ?? null;
  } catch { return null; }
}

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

  // v4.2 (16 Oct 2026): featured image of this festival row (editorial_rulings #20),
  // else /og-default.jpg exactly as before.
  const ogImage = festivalOgImage(content);
  const indexable = !isFestivalFarFuture(f.date); // v4.3

  return {
    // absolute — app/layout.tsx sets template "%s | Trikaal Vaani".
    // buildMeta already spends the full 58-char budget, so letting the
    // template append would push the city past Google's cut-off.
    title: { absolute: title }, description, keywords,
    alternates: { canonical: url, languages },
    authors: [{ name: `${AUTHOR_NAME}, ${AUTHOR_TITLE}` }],
    openGraph: { title, description, url, images: [ogImage], type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    robots: { index: indexable, follow: true,
      googleBot: { index: indexable, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

export default async function Page({ params }: Params) {
  const festival = await resolveFestival(params.slug, "en");
  if (!festival) notFound();

  // v4.3 — far-future year copy → the next occurrence of the same festival
  if (isFestivalFarFuture(festival.date)) {
    const next = await nextOccurrenceSlug(baseSlug(festival.festival_slug));
    if (next && next !== festival.festival_slug) redirect(`/events/${next}`);
  }

  return <FestivalPillar festival={festival} city={null} lang="en" />;
}
