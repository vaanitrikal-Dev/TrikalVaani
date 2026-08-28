// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:    app/hi/compatibility/[pair]/page.tsx
// Version: v1.0 (28 Aug 2026)
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// ── WHY THIS FILE EXISTS ───────────────────────────────────────────────────
//
// The sitemap has been publishing 144 URLs of the form
//
//     https://trikalvaani.com/hi/compatibility/dhanu-kanya
//
// since June 2026 — the change is in its own header as "WIN 1: Compatibility
// Hindi clean /hi/compatibility/[slug] URLs". The route was never built. Every
// one of those 144 URLs has returned 404 for two months while sitting in the
// sitemap, which is the worst combination available: Google is invited to
// crawl them, spends budget doing so, and finds nothing.
//
// The Hindi CONTENT was never missing. app/compatibility/[pair]/page.tsx has
// read a ?lang=hi query parameter all along, and /compatibility/dhanu-kanya
// ?lang=hi renders 52,343 Devanagari characters today. Only the clean path was
// absent — which is presumably exactly what whoever wrote that sitemap line
// intended, and then did not finish.
//
// ── WHY A PATH AND NOT THE QUERY PARAMETER ─────────────────────────────────
//
// ?lang=hi works for a reader and is weak for search. Query strings are
// treated as the same URL with a parameter rather than a distinct page, they
// make hreflang pairs awkward, and they are easy for a crawler to drop. A path
// is a page. That is why the sitemap asks for one.
//
// ── HOW IT WORKS ───────────────────────────────────────────────────────────
//
// This is a thin wrapper. It calls the existing page with lang forced to 'hi',
// so there is one implementation of compatibility and it cannot drift between
// the two languages. Nothing here duplicates that page's logic.
// ════════════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import CompatibilityPage, {
  generateMetadata as baseMetadata,
} from "@/app/compatibility/[pair]/page";

export const revalidate = 86400;
export const dynamicParams = true;

const SITE = "https://trikalvaani.com";

type Params = { params: { pair: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const meta = await baseMetadata({ params, searchParams: { lang: "hi" } });

  // The base page canonicalises to /compatibility/{pair}?lang=hi, because until
  // now that was the only Hindi URL there was. This path is the canonical one,
  // and the pair points both ways so neither side outranks the other by
  // accident.
  const hiUrl = `${SITE}/hi/compatibility/${params.pair}`;
  const enUrl = `${SITE}/compatibility/${params.pair}`;

  return {
    ...meta,
    alternates: {
      canonical: hiUrl,
      languages: { "en-IN": enUrl, "hi-IN": hiUrl },
    },
    openGraph: { ...(meta.openGraph ?? {}), url: hiUrl, locale: "hi_IN" },
  };
}

export default async function Page({ params }: Params) {
  return CompatibilityPage({ params, searchParams: { lang: "hi" } });
}

// END — app/hi/compatibility/[pair]/page.tsx v1.0 | Trikaal Vaani | Rohiit Gupta
