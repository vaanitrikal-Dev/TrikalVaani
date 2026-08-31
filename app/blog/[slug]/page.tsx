// ============================================================
// TRIKAL VAANI — DYNAMIC BLOG ARTICLE PAGE (SSR)
// CEO: Rohiit Gupta | Chief Vedic Architect
// Version: 3.0
// CHANGE v3.0 — LOCALBUSINESS REMOVED FROM THESE PAGES (2026-08-31):
//   • v2.9 emitted a full LocalBusiness block on all eight NCR city blog
//     pages, same NAP, same @id. That was a mistake, and it broke a
//     decision this codebase had already made and documented.
//     app/astrologer-noida|gurgaon|ghaziabad/page.tsx each carry a header
//     stating: ONE physical location, ONE Google Business Profile, therefore
//     exactly ONE LocalBusiness entity, declared on /astrologer-delhi and
//     referenced everywhere else — "Do not 'helpfully' add a LocalBusiness
//     block here." v2.9 added one on eight more pages.
//     v3.0 emits Service only, with provider/isRelatedTo pointing at
//     https://trikalvaani.com/#localbusiness. A referenced entity carries the
//     same weight as a repeated one; repetition is the part that reads as
//     manipulation to Google.
//   • areaServed reshaped to City / Delhi NCR / India, matching
//     app/astrologer-{city}/page.tsx v1.1 exactly, so the four service pages
//     and these eight describe the same geography in the same words.
//     ("Delhi NCR" survives only because brand-guard.yml v6 retired the
//     s/Delhi NCR/India/g auto-fix. On v5 the bot rewrote it in 12 seconds.)
//   • FEE_LADDER and the visible fee table expanded 4 tiers -> 7, verified
//     line by line against the live /pricing page on 31 Aug 2026. v2.9 was
//     missing Rs11 voice, Rs101 Kundali Milan Deep and the Rs151 tier, which
//     mattered because app/astrologer-{city}/page.tsx v1.1 sends readers here
//     for "the full fee table".
//     ⚠️ OPEN ITEM FOR CEO, unchanged from v2.9: Rs499 On-Call Consultation
//     is NOT listed on /pricing. It is here because you confirmed it is real.
//     Either add it to /pricing or say the word and it comes out.
//   • Added PRIMARY_LOCAL_PAGE + a visible "official practice page" link, so
//     each city blog page points at /astrologer-{city}. These pages are
//     SUPPORTING content ("near me + fees + free chat"); the service page is
//     primary. Neither is redirected or canonicalised away — they answer
//     different questions and now say so.
//   • The visible NAP block and fee table are UNCHANGED in principle and
//     stay. They were never the problem; a human reads them and they are
//     true. Only the schema was wrong.
//   • No change to metadata, hreflang, Article/FAQ/Breadcrumb/Video schema,
//     rendering, or any non-city page.
// CHANGE v2.9 — LOCAL SEO SCHEMA (NCR city landing pages):
//   • Added NAP constant block (BUSINESS) holding the exact,
//     Google-Business-Profile-verified name, address, phone, WhatsApp,
//     website and map link. THIS IS THE SINGLE SOURCE OF TRUTH.
//   • Added LOCAL_PAGES — the only slugs that receive local schema.
//   • Added the visible NAP + fee block.
//   • [superseded by v3.0] emitted LocalBusiness on those pages.
// CHANGE v2.8:
//   • SectionBlock now renders the new `video` BlogSection variant
//     (lib/blog-posts.ts v3.5+) — a responsive embedded YouTube iframe,
//     autoplay+muted (browsers block unmuted autoplay; user can unmute
//     via the player controls), portrait 9:16 box for Shorts, 16:9 for
//     regular videos.
//   • generateJsonLd now emits a VideoObject schema when a post contains
//     a video section (name/description/thumbnailUrl/embedUrl/contentUrl
//     populated automatically; uploadDate defaults to the post's own
//     publishedAt as a proxy — replace with the video's true upload date
//     if it differs, for full Video SEO accuracy).
//   • No other logic/layout/schema changed from v2.7.
// CHANGE v2.7:
//   • BUG FIX: the v2.6 BRAND_SUFFIX regex only matched the Latin
//     "Trikaal Vaani", so the 61 Hindi posts whose titles end in
//     "| त्रिकाल वाणी" kept the brand in their <h1> and in Related
//     Reading anchor text. The pattern now also matches the Devanagari
//     brand (and the fullwidth pipe ｜), so displayTitle() works for
//     both languages. <title>/og:title/twitter:title still keep the brand.
// CHANGE v2.6:
//   • SEO FIX: added displayTitle() which strips the trailing
//     " | Trikaal Vaani" brand suffix. Applied to the <h1>, to the
//     Related Reading card headings (internal-link anchor text) and to
//     JSON-LD `headline`. The <title>, og:title and twitter:title keep
//     the brand suffix on purpose — brand belongs in the SERP/preview
//     title, not in the H1 or in internal anchor text.
//   • SCHEMA FIX: wordCount previously counted only sections carrying
//     `text`/`items` and ignored the `body` variant, under-reporting the
//     article length (e.g. 1657 vs ~2100 actual). It now counts
//     directAnswer + every section variant + all FAQ Q&A text.
//   • No layout, styling or data-fetching changes.
// CHANGE v2.5:
//   • SectionBlock now renders the new `img` BlogSection variant introduced
//     in lib/blog-posts.ts v3.4 — inline diagrams inside article bodies.
//     Authored in Supabase as:  ![alt text](/diagrams/x.svg "Optional caption")
//     on its own line (blank line above and below).
//   • Rendered as <figure><img …/><figcaption/></figure>, lazy-loaded,
//     with explicit dimensions to avoid CLS. Plain <img> (not next/image)
//     because these are local SVGs in /public — no next.config change needed.
//   • Requires lib/blog-posts.ts v3.4+ (body parser). Nothing else changed.
// CHANGE v2.4:
//   • BILINGUAL EN/HI: hreflang alternates now built from post.lang +
//     post.altLangSlug (both languages live under /blog/{slug}). Fixes the
//     old hardcoded /hi/blog/{slug} alternate that pointed to a 404.
//   • Added a visible "हिंदी में पढ़ें ↔ Read in English" cross-language link.
//   • openGraph.locale and JSON-LD inLanguage are now language-aware.
// CHANGE v2.3:
//   • REMOVED the green WhatsApp consultation CTA button site-wide (service not offered).
//   • FIXED doubled <title> ("| Trikaal Vaani | Trikaal Vaani") by using
//     title:{ absolute: post.title } so the root layout's title template is
//     NOT re-applied (post.title already carries the brand suffix). OG and
//     Twitter titles were already correct and are left unchanged.
//   • No other logic / layout / schema changed from v2.2.
// CHANGE v2.2: Renders 5 new Playbook body columns —
//   emotional, communication, strengths, challenges, remedies —
//   as structured prose sections between directAnswer and sections[].
//   Each renders only if non-empty (safe for older blog rows).
//   All other logic/layout/schema UNCHANGED from v2.1.
// CHANGE v2.1: renderText() now also parses Markdown-style links
//   [label](url) → internal <Link> or external <a>.
// ============================================================

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getPostBySlug,
  getAllSlugs,
  getRelatedPosts,
  type BlogPost,
  type BlogSection,
} from '@/lib/blog-posts';


// ------------------------------------------------------------------
// Brand suffix is stored inside post.title so that <title> and the OG /
// Twitter preview titles carry the brand. It must NOT appear in the H1
// or in internal-link anchor text, where it dilutes keyword relevance.
// ------------------------------------------------------------------
const BRAND_SUFFIX = /\s*[|｜]\s*(?:Trikaal?\s+Vaani|त्रिकाल\s*वाणी|त्रिकल\s*वाणी)\s*$/i;
const displayTitle = (t: string): string => (t ? t.replace(BRAND_SUFFIX, '').trim() : t);

// ==================================================================
// v2.9 — CANONICAL NAP (Name, Address, Phone)
// ------------------------------------------------------------------
// Copied verbatim from the verified Google Business Profile on
// 31 Aug 2026. Local ranking depends on this matching the GBP, the
// visible page text and every directory listing EXACTLY — one extra
// space, a "New Delhi" vs "Delhi", or 92118-04111 vs 9211804111
// counts as a mismatch. If the GBP changes, change this first.
// ==================================================================
const BUSINESS = {
  name: 'Trikaal Vaani',
  legalName: 'Trikal Vaani',
  streetAddress: '724, Pocket 3, Sector 19, Dwarka',
  addressLocality: 'New Delhi',
  addressRegion: 'Delhi',
  postalCode: '110075',
  addressCountry: 'IN',
  telephone: '+91-92118-04111',
  whatsapp: 'https://wa.me/919211804111',
  url: 'https://trikalvaani.com/',
  logo: 'https://trikalvaani.com/logo.png',
  // Real short link to the verified GBP listing on Google Maps.
  hasMap: 'https://maps.app.goo.gl/GYbBXLHygYdGLdvW8',
  priceRange: '₹0–₹499',
  founderId: 'https://trikalvaani.com/#rohiit-gupta',
  orgId: 'https://trikalvaani.com/#organization',
} as const;

// ------------------------------------------------------------------
// The ONLY slugs that get LocalBusiness schema. These are genuine local
// landing pages. Do not add ordinary articles here — LocalBusiness on
// every post is schema spam and dilutes the entity.
// Value = the city this page targets (used as areaServed only; the
// postal address always remains the real Dwarka one).
// ------------------------------------------------------------------
const LOCAL_PAGES: Record<string, string> = {
  'astrologer-near-me-delhi': 'Delhi',
  'astrologer-near-me-delhi-hindi': 'Delhi',
  'astrologer-near-me-noida': 'Noida',
  'astrologer-near-me-noida-hindi': 'Noida',
  'astrologer-near-me-gurgaon': 'Gurugram',
  'astrologer-near-me-gurgaon-hindi': 'Gurugram',
  'astrologer-near-me-ghaziabad': 'Ghaziabad',
  'astrologer-near-me-ghaziabad-hindi': 'Ghaziabad',
};

// ------------------------------------------------------------------
// v3.0 — the PRIMARY local landing page each of these blog pages
// supports. /astrologer-{city} is the service page the verified GBP
// points at and the one carrying the LocalBusiness entity; these blog
// pages are the supporting "near me + fees + free chat" answer. Each
// now links to its primary so the pair reads as a hierarchy rather
// than as two pages fighting over one query.
// ------------------------------------------------------------------
const PRIMARY_LOCAL_PAGE: Record<string, string> = {
  'astrologer-near-me-delhi': '/astrologer-delhi',
  'astrologer-near-me-delhi-hindi': '/astrologer-delhi',
  'astrologer-near-me-noida': '/astrologer-noida',
  'astrologer-near-me-noida-hindi': '/astrologer-noida',
  'astrologer-near-me-gurgaon': '/astrologer-gurgaon',
  'astrologer-near-me-gurgaon-hindi': '/astrologer-gurgaon',
  'astrologer-near-me-ghaziabad': '/astrologer-ghaziabad',
  'astrologer-near-me-ghaziabad-hindi': '/astrologer-ghaziabad',
};

// ------------------------------------------------------------------
// The published fee ladder. Kept here (not in Supabase) so that the
// schema and the page text can never silently drift apart — if a price
// changes, it changes in one place and in the blog copy together.
// ------------------------------------------------------------------
const FEE_LADDER: { name: string; price: string; description: string }[] = [
  {
    name: 'Free Vedic Calculators (Kundli, Dasha, Manglik, Kaal Sarp, Sade Sati, Gemstone)',
    price: '0',
    description:
      'Complete birth chart, running Dasha, dosha severity with cancellation status and gemstone suitability. No signup, no card.',
  },
  {
    name: 'Trikaal Ki Awaaz — spoken answer to one question',
    price: '11',
    description:
      'A 60-second spoken reply in Hindi or Hinglish. Larger question packs are on the pricing page.',
  },
  {
    name: 'Deep Reading — one life domain',
    price: '51',
    description:
      'In-depth reading of a single domain with five personalised remedies and action windows, reviewed by Rohiit Gupta.',
  },
  {
    name: 'Kundali Milan — Basic, full 36-Guna Ashtakoot',
    price: '51',
    description:
      'All eight Kootas scored, plus Nadi Dosha and Mangal Dosha with cancellation checked on both charts.',
  },
  {
    name: 'Kundali Milan — Deep, 1000-word with 10 remedies',
    price: '101',
    description:
      'The full Basic analysis expanded into a written narrative with ten remedies. Rs151 adds separate Couple and Parent narratives.',
  },
  {
    name: 'Karmic Background Reading',
    price: '251',
    description:
      'Career, wealth and relationships analysed together in one consolidated report.',
  },
  {
    name: 'On-Call Consultation',
    price: '499',
    description:
      'A spoken consultation with Rohiit Gupta instead of a written report, for live decisions with a deadline attached.',
  },
];

// ==================================================================
// STATIC PARAMS
// ==================================================================
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 86400;

// ==================================================================
// METADATA
// ==================================================================
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found | Trikaal Vaani',
      description: 'The requested article could not be found.',
    };
  }

  const canonicalUrl = `https://trikalvaani.com/blog/${post.slug}`;

  // ── v2.4: hreflang pairing via alt_lang_slug (both live under /blog/) ──
  const selfUrl = canonicalUrl;
  const altUrl  = post.altLangSlug
    ? `https://trikalvaani.com/blog/${post.altLangSlug}`
    : null;
  const enUrl = post.lang === 'hi' ? altUrl : selfUrl;
  const hiUrl = post.lang === 'hi' ? selfUrl : altUrl;
  const languages: Record<string, string> = {};
  if (enUrl) { languages['en-IN'] = enUrl; languages['x-default'] = enUrl; }
  if (hiUrl) { languages['hi-IN'] = hiUrl; }

  return {
    // absolute → bypasses the root layout title template so the brand suffix
    // (already present in post.title) is not duplicated in the <title> tag.
    title: { absolute: post.title },
    description: post.description,
    keywords: post.keywords.join(', '),
    authors: [{ name: 'Rohiit Gupta', url: 'https://trikalvaani.com/founder' }],
    creator: 'Rohiit Gupta',
    publisher: 'Trikaal Vaani',
    category: post.category,
    alternates: {
      canonical: selfUrl,
      languages,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      siteName: 'Trikaal Vaani',
      locale: post.lang === 'hi' ? 'hi_IN' : 'en_IN',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: ['Rohiit Gupta'],
      images: [
        {
          url: `https://trikalvaani.com${post.ogImage}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@TrikalVaani',
      creator: '@TrikalVaani',
      title: post.title,
      description: post.description,
      images: [`https://trikalvaani.com${post.ogImage}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// ==================================================================
// JSON-LD SCHEMA — Article + FAQ + BreadcrumbList (+ Video, + Local)
// ==================================================================
function generateJsonLd(post: BlogPost) {
  const canonicalUrl = `https://trikalvaani.com/blog/${post.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    headline: displayTitle(post.title),
    description: post.description,
    image: [`https://trikalvaani.com${post.ogImage}`],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      '@id': BUSINESS.founderId,
      name: 'Rohiit Gupta',
      url: 'https://trikalvaani.com/founder',
      jobTitle: 'Chief Vedic Architect',
      worksFor: { '@id': BUSINESS.orgId },
    },
    publisher: {
      '@type': 'Organization',
      '@id': BUSINESS.orgId,
      name: BUSINESS.name,
      logo: {
        '@type': 'ImageObject',
        url: BUSINESS.logo,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    inLanguage: post.lang === 'hi' ? 'hi-IN' : 'en-IN',
    articleSection: post.category,
    keywords: post.keywords.join(', '),
    citation: post.classicalSources,
    wordCount: (() => {
      const count = (v?: string) => (v ? v.trim().split(/\s+/).filter(Boolean).length : 0);
      let total = count(post.directAnswer);
      for (const s of post.sections as Array<Record<string, unknown>>) {
        total += count(s.title as string | undefined);
        if (typeof s.text === 'string') total += count(s.text);
        if (typeof s.body === 'string') total += count(s.body);
        if (Array.isArray(s.items)) total += count((s.items as string[]).join(' '));
      }
      for (const f of post.faqs ?? []) total += count(f.q) + count(f.a);
      return total;
    })(),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    mainEntity: post.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://trikalvaani.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  const schemas: Record<string, unknown>[] = [articleSchema, faqSchema, breadcrumbSchema];

  // ── v2.8: VideoObject — only when the post has a video section ──
  const videoSection = (post.sections as Array<Record<string, unknown>>).find(
    (s) => s.type === 'video'
  ) as { videoId: string; title?: string } | undefined;

  if (videoSection) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      '@id': `${canonicalUrl}#video`,
      name: videoSection.title || displayTitle(post.title),
      description: post.description,
      thumbnailUrl: [`https://i.ytimg.com/vi/${videoSection.videoId}/hqdefault.jpg`],
      // Proxy: the post's own publish date, since the true video upload
      // date isn't stored yet. Swap in the exact upload date if known.
      uploadDate: post.publishedAt,
      embedUrl: `https://www.youtube.com/embed/${videoSection.videoId}`,
      contentUrl: `https://www.youtube.com/watch?v=${videoSection.videoId}`,
      publisher: { '@id': BUSINESS.orgId },
    });
  }

  // ── v3.0: Service ONLY. NO LocalBusiness. City landing pages only. ──
  //
  // v2.9 emitted a full LocalBusiness block here, on all eight city blog
  // pages, with the same NAP and the same @id. That was wrong, and it was
  // wrong against a decision this codebase had already made and written down.
  // app/astrologer-noida|gurgaon|ghaziabad/page.tsx each carry a header that
  // says, in as many words: ONE physical location, ONE Google Business
  // Profile, therefore exactly ONE LocalBusiness entity, and it lives on
  // /astrologer-delhi. "Do not 'helpfully' add a LocalBusiness block here."
  // v2.9 did precisely that, eight times over.
  //
  // v3.0 removes it. These pages now declare a Service and POINT at the one
  // LocalBusiness entity via provider @id. Google resolves the reference to
  // the entity declared on /astrologer-delhi, which is the page the verified
  // GBP actually points at. Nothing is lost: a referenced entity carries the
  // same weight as a repeated one, and repetition is the part that reads as
  // manipulation.
  //
  // The VISIBLE NAP block and fee table stay. Those are content a human
  // reads, they are true, and they are what the "astrologer near me + fees"
  // query is asking for. It was never the visible text that was the problem.
  const targetCity = LOCAL_PAGES[post.slug];

  if (targetCity) {
    const isHindi = post.lang === 'hi';

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${canonicalUrl}#service`,
      serviceType: isHindi ? 'वैदिक ज्योतिष परामर्श' : 'Vedic Astrology Consultation',
      name: displayTitle(post.title),
      description: post.directAnswer,
      url: canonicalUrl,
      // The single LocalBusiness entity, declared on /astrologer-delhi.
      // Referenced here, never redeclared.
      provider: { '@id': 'https://trikalvaani.com/#localbusiness' },
      isRelatedTo: { '@id': 'https://trikalvaani.com/#localbusiness' },
      brand: { '@id': BUSINESS.orgId },
      // Matches the areaServed shape used by app/astrologer-{city}/page.tsx
      // v1.1, so the four service pages and these eight describe the same
      // geography the same way.
      areaServed: [
        { '@type': 'City', name: targetCity },
        { '@type': 'Place', name: 'Delhi NCR' },
        { '@type': 'Country', name: 'India' },
      ],
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: 'https://trikalvaani.com/#birth-form',
        servicePhone: BUSINESS.telephone,
        availableLanguage: ['English', 'Hindi'],
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isHindi ? 'ज्योतिष परामर्श शुल्क' : 'Vedic Astrology Consultation Fees',
        itemListElement: FEE_LADDER.map((f) => ({
          '@type': 'Offer',
          name: f.name,
          description: f.description,
          price: f.price,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: canonicalUrl,
          seller: { '@id': 'https://trikalvaani.com/#localbusiness' },
        })),
      },
      // NOTE (v3.0): aggregateRating stays absent, here and on the
      // LocalBusiness entity itself, until real reviews exist. geo and
      // openingHours belong on that entity, not on a Service, so they are
      // not a gap here at all.
    });
  }

  return schemas;
}

// ==================================================================
// MARKDOWN-LITE PARSER — bold, italic, links (v2.1 unchanged)
// ==================================================================
function renderText(text: string): React.ReactNode {
  const linkRegex = /(\[[^\]]+\]\([^)]+\))/g;
  const linkParts = text.split(linkRegex);

  return linkParts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const url   = linkMatch[2];
      if (url.startsWith('/')) {
        return (
          <Link key={`l-${i}`} href={url} className="text-amber-300 font-semibold underline underline-offset-2 hover:text-amber-200 transition">
            {label}
          </Link>
        );
      }
      return (
        <a key={`l-${i}`} href={url} target="_blank" rel="noopener noreferrer" className="text-amber-300 font-semibold underline underline-offset-2 hover:text-amber-200 transition">
          {label}
        </a>
      );
    }
    return renderEmphasis(part, i);
  });
}

function renderEmphasis(text: string, keyBase: number): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyBase}-b-${i}`} className="text-amber-300 font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={`${keyBase}-i-${i}`} className="italic text-amber-200">{part.slice(1, -1)}</em>;
    }
    return <span key={`${keyBase}-s-${i}`}>{part}</span>;
  });
}

// ==================================================================
// SECTION RENDERER (unchanged from v2.8)
// ==================================================================
function SectionBlock({ section, index }: { section: BlogSection; index: number }) {
  switch (section.type) {
    case 'h2':
      return (
        <h2 id={`section-${index}`} className="mt-12 mb-4 text-2xl md:text-3xl font-bold text-amber-300 scroll-mt-24">
          {section.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 className="mt-8 mb-3 text-xl md:text-2xl font-semibold text-amber-200">
          {section.text}
        </h3>
      );
    case 'p':
      return (
        <p className="my-4 text-base md:text-lg leading-relaxed text-slate-200">
          {renderText(section.text)}
        </p>
      );
    case 'ul':
      return (
        <ul className="my-4 ml-6 space-y-2 list-disc text-slate-200">
          {section.items.map((item, i) => (
            <li key={i} className="text-base md:text-lg leading-relaxed">
              {renderText(item)}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="my-4 ml-6 space-y-2 list-decimal text-slate-200">
          {section.items.map((item, i) => (
            <li key={i} className="text-base md:text-lg leading-relaxed pl-2">
              {renderText(item)}
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="my-6 overflow-x-auto rounded-lg border border-amber-900/40">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-amber-950/40">
              <tr>
                {section.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold text-amber-300 border-b border-amber-900/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-amber-900/20 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-slate-200">
                      {renderText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'callout': {
      const variantStyles = {
        tip:     'bg-emerald-950/40 border-emerald-700/50 text-emerald-100',
        warn:    'bg-rose-950/40 border-rose-700/50 text-rose-100',
        verdict: 'bg-amber-950/40 border-amber-700/50 text-amber-100',
      };
      const variantLabels = {
        tip:     '💡 Tip',
        warn:    '⚠️ Caution',
        verdict: '🔱 Trikaal Vaani Verdict',
      };
      return (
        <aside className={`my-6 rounded-lg border-l-4 px-5 py-4 ${variantStyles[section.variant]}`}>
          <div className="mb-2 font-semibold">{variantLabels[section.variant]}</div>
          <p className="leading-relaxed">{renderText(section.text)}</p>
        </aside>
      );
    }
    case 'quote':
      return (
        <blockquote className="my-6 border-l-4 border-amber-700 pl-4 italic text-amber-100">
          {renderText(section.text)}
        </blockquote>
      );
    // ── v2.5: inline diagram / illustration ──────────────────
    case 'img':
      return (
        <figure className="my-8">
          <div className="overflow-hidden rounded-xl border border-amber-900/40 bg-slate-950/60 p-3 md:p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.src}
              alt={section.alt}
              width={800}
              height={500}
              loading="lazy"
              decoding="async"
              className="mx-auto h-auto w-full max-w-2xl"
            />
          </div>
          {section.caption && (
            <figcaption className="mt-3 text-center text-sm italic text-slate-400">
              {section.caption}
            </figcaption>
          )}
        </figure>
      );
    // ── v2.8: embedded YouTube video (Shorts get a portrait box) ──
    case 'video':
      return (
        <figure className="my-8 mx-auto">
          <div
            className={
              'mx-auto overflow-hidden rounded-xl border border-amber-900/40 bg-slate-950/60 ' +
              (section.isShort ? 'aspect-[9/16] max-w-xs md:max-w-sm' : 'aspect-video max-w-2xl')
            }
          >
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${section.videoId}?autoplay=1&mute=1&playsinline=1&rel=0`}
              title={section.title || 'Trikaal Vaani video'}
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          {section.title && (
            <figcaption className="mt-3 text-center text-sm italic text-slate-400">
              {section.title}
            </figcaption>
          )}
        </figure>
      );
  }
}

// ==================================================================
// v2.2: PLAYBOOK BODY SECTION RENDERER
// Renders emotional / communication / strengths / challenges / remedies
// Only renders if the field is non-empty (safe for old rows).
// ==================================================================
const BODY_SECTIONS: {
  key: keyof Pick<BlogPost, 'emotional' | 'communication' | 'strengths' | 'challenges' | 'remedies'>;
  heading: string;
  icon: string;
}[] = [
  { key: 'emotional',      heading: 'The Emotional Dimension',        icon: '🌕' },
  { key: 'communication',  heading: 'Communication & Relationships',   icon: '🪐' },
  { key: 'strengths',      heading: 'Strengths This Period Builds',    icon: '✨' },
  { key: 'challenges',     heading: 'Real Challenges to Anticipate',   icon: '⚖️' },
  { key: 'remedies',       heading: 'Remedies — What Actually Works',  icon: '🔱' },
];

function PlaybookBodySection({
  heading,
  icon,
  text,
}: {
  heading: string;
  icon: string;
  text: string;
}) {
  if (!text || !text.trim()) return null;
  return (
    <section className="my-10">
      <h2 className="mt-12 mb-4 text-2xl md:text-3xl font-bold text-amber-300 scroll-mt-24 flex items-center gap-2">
        <span aria-hidden>{icon}</span>
        {heading}
      </h2>
      <p className="text-base md:text-lg leading-relaxed text-slate-200">
        {renderText(text)}
      </p>
    </section>
  );
}

// ==================================================================
// v2.9: VISIBLE NAP BLOCK — city landing pages only
// ------------------------------------------------------------------
// Google cross-checks the schema against text a human can actually see.
// A LocalBusiness schema whose address appears nowhere on the rendered
// page is weak-to-ignored, so the same NAP is printed here.
// ==================================================================
function LocalNapBlock({ lang, primaryHref }: { lang: string; primaryHref?: string }) {
  const hi = lang === 'hi';
  return (
    <section
      aria-label={hi ? 'संपर्क और पता' : 'Contact and address'}
      className="my-12 rounded-xl border border-amber-700/40 bg-slate-900/50 p-6 md:p-8"
    >
      <h2 className="mb-4 text-xl md:text-2xl font-bold text-amber-300">
        {hi ? 'त्रिकाल वाणी — संपर्क और पता' : 'Trikaal Vaani — Contact and Address'}
      </h2>

      <address className="not-italic space-y-2 text-slate-200 text-base leading-relaxed">
        <div className="font-semibold text-amber-200">Trikaal Vaani</div>
        <div>724, Pocket 3, Sector 19, Dwarka, New Delhi, Delhi 110075</div>
        <div>
          <span className="text-slate-400">{hi ? 'फोन: ' : 'Phone: '}</span>
          <a href="tel:+919211804111" className="text-amber-300 font-semibold hover:underline">
            +91 92118 04111
          </a>
        </div>
        <div>
          <span className="text-slate-400">WhatsApp: </span>
          <a
            href={BUSINESS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 font-semibold hover:underline"
          >
            +91 92118 04111
          </a>
        </div>
        <div>
          <a
            href={BUSINESS.hasMap}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 font-semibold hover:underline"
          >
            {hi ? 'गूगल मैप्स पर देखें →' : 'View on Google Maps →'}
          </a>
        </div>
      </address>

      <div className="mt-6 overflow-x-auto rounded-lg border border-amber-900/40">
        <table className="w-full text-sm md:text-base">
          <caption className="sr-only">
            {hi ? 'त्रिकाल वाणी परामर्श शुल्क' : 'Trikaal Vaani consultation fees'}
          </caption>
          <thead className="bg-amber-950/40">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-amber-300 border-b border-amber-900/40">
                {hi ? 'सेवा' : 'Service'}
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-amber-300 border-b border-amber-900/40">
                {hi ? 'शुल्क' : 'Fee'}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-amber-900/20">
              <td className="px-4 py-3 text-slate-200">
                {hi ? 'सभी कैलकुलेटर (कुंडली, दशा, मांगलिक, कालसर्प, साढ़े साती, रत्न)' : 'All calculators (Kundli, Dasha, Manglik, Kaal Sarp, Sade Sati, Gemstone)'}
              </td>
              <td className="px-4 py-3 font-semibold text-amber-200">{hi ? 'मुफ्त' : 'Free'}</td>
            </tr>
            <tr className="border-b border-amber-900/20">
              <td className="px-4 py-3 text-slate-200">
                {hi ? 'त्रिकाल की आवाज़ — एक सवाल का बोला हुआ जवाब' : 'Trikaal Ki Awaaz — spoken answer to one question'}
              </td>
              <td className="px-4 py-3 font-semibold text-amber-200">₹11</td>
            </tr>
            <tr className="border-b border-amber-900/20">
              <td className="px-4 py-3 text-slate-200">
                {hi ? 'डीप रीडिंग — एक जीवन-क्षेत्र (करियर, वेल्थ, प्रॉपर्टी, स्वप्न, हस्त रेखा)' : 'Deep Reading — one life domain (career, wealth, property, Swapna, Hast Rekha)'}
              </td>
              <td className="px-4 py-3 font-semibold text-amber-200">₹51</td>
            </tr>
            <tr className="border-b border-amber-900/20">
              <td className="px-4 py-3 text-slate-200">
                {hi ? 'कुंडली मिलान — बेसिक, पूरा 36-गुण अष्टकूट' : 'Kundali Milan — Basic, full 36-Guna Ashtakoot'}
              </td>
              <td className="px-4 py-3 font-semibold text-amber-200">₹51</td>
            </tr>
            <tr className="border-b border-amber-900/20">
              <td className="px-4 py-3 text-slate-200">
                {hi ? 'कुंडली मिलान — डीप (₹151 में कपल + पैरेंट दोनों नैरेटिव)' : 'Kundali Milan — Deep (₹151 for both Couple and Parent narratives)'}
              </td>
              <td className="px-4 py-3 font-semibold text-amber-200">₹101</td>
            </tr>
            <tr className="border-b border-amber-900/20">
              <td className="px-4 py-3 text-slate-200">
                {hi ? 'कार्मिक बैकग्राउंड रीडिंग (करियर + धन + रिश्ते)' : 'Karmic Background Reading (career + wealth + relationships)'}
              </td>
              <td className="px-4 py-3 font-semibold text-amber-200">₹251</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-slate-200">
                {hi ? 'ऑन-कॉल परामर्श' : 'On-Call Consultation'}
              </td>
              <td className="px-4 py-3 font-semibold text-amber-200">₹499</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        {hi
          ? 'कोई छिपा शुल्क नहीं, प्रति-मिनट बिलिंग नहीं, और उपाय रीडिंग में शामिल हैं। कीमत पूरे भारत में एक जैसी है।'
          : 'No hidden charges, no per-minute billing, and remedies are included in the reading. Pricing is identical across India.'}
      </p>

      {/* v3.0: point at the primary local service page. This guide answers
          "near me, what does it cost, can I talk free"; that page is the
          practice's own local landing page. Saying so out loud keeps the two
          from competing for the same query. */}
      {primaryHref && (
        <p className="mt-3 text-sm">
          <Link href={primaryHref} className="font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200 transition">
            {hi ? 'त्रिकाल वाणी का आधिकारिक पेज देखें →' : 'See the official practice page →'}
          </Link>
        </p>
      )}
    </section>
  );
}

// ==================================================================
// MAIN PAGE COMPONENT
// ==================================================================
export default async function BlogArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts  = await getRelatedPosts(post.relatedSlugs);
  const jsonLdSchemas = generateJsonLd(post);
  const isLocalPage   = Boolean(LOCAL_PAGES[post.slug]);

  return (
    <>
      {jsonLdSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="min-h-screen bg-[#080B12] text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">

          {/* BREADCRUMB */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-400">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-amber-300 transition">Home</Link></li>
              <li aria-hidden>›</li>
              <li><Link href="/blog" className="hover:text-amber-300 transition">Blog</Link></li>
              <li aria-hidden>›</li>
              <li className="text-amber-300 truncate">{post.category}</li>
            </ol>
          </nav>

          {/* ── v2.4: CROSS-LANGUAGE LINK (hreflang pair) ── */}
          {post.altLangSlug && (
            <div className="mb-6">
              <Link
                href={`/blog/${post.altLangSlug}`}
                className="inline-flex items-center gap-2 rounded-full border border-amber-700/40 bg-amber-950/30 px-4 py-1.5 text-sm font-semibold text-amber-300 hover:bg-amber-900/30 transition"
              >
                {post.lang === 'hi' ? 'Read in English →' : 'हिंदी में पढ़ें →'}
              </Link>
            </div>
          )}

          {/* CATEGORY BADGE */}
          <div className="mb-4">
            <span className="inline-block rounded-full bg-amber-900/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
              {post.category}
            </span>
          </div>

          {/* H1 */}
          <h1 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            {displayTitle(post.title)}
          </h1>

          {/* META */}
          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <Link href="/founder" className="flex items-center gap-2 hover:text-amber-300 transition">
              <span className="font-semibold text-amber-200">Rohiit Gupta</span>
              <span className="text-slate-500">· Chief Vedic Architect</span>
            </Link>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </time>
            <span aria-hidden>·</span>
            <span>{post.readTimeMinutes} min read</span>
          </div>

          {/* DIRECT ANSWER — GEO/AEO */}
          <section
            aria-label="Direct Answer"
            className="mb-12 rounded-xl border border-amber-700/40 bg-gradient-to-br from-amber-950/50 to-slate-900/50 p-6 md:p-8"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl" aria-hidden>🎯</span>
              <h2 className="text-lg font-bold text-amber-300">Trikaal Sandesh — Direct Answer</h2>
            </div>
            <p className="text-base md:text-lg leading-relaxed text-amber-50">
              {post.directAnswer}
            </p>
          </section>

          {/* ── v2.9: VISIBLE NAP + FEE TABLE (city landing pages only) ── */}
          {isLocalPage && <LocalNapBlock lang={post.lang} primaryHref={PRIMARY_LOCAL_PAGE[post.slug]} />}

          {/* ── v2.2: PLAYBOOK BODY SECTIONS ── */}
          {BODY_SECTIONS.map(({ key, heading, icon }) => (
            <PlaybookBodySection
              key={key}
              heading={heading}
              icon={icon}
              text={post[key]}
            />
          ))}

          {/* DEEP-DIVE SECTIONS (sections[] JSONB) */}
          {post.sections.length > 0 && (
            <div className="prose-content mt-10">
              <h2 className="mt-12 mb-6 text-2xl md:text-3xl font-bold text-amber-300">
                Deep Dive Analysis
              </h2>
              {post.sections.map((section, i) => (
                <SectionBlock key={i} section={section} index={i} />
              ))}
            </div>
          )}

          {/* PRIMARY CTA */}
          <section className="my-12 rounded-xl border border-amber-700/50 bg-gradient-to-r from-amber-900/30 to-amber-950/30 p-6 md:p-8 text-center">
            <h3 className="mb-3 text-xl md:text-2xl font-bold text-amber-300">
              Apna Personalized Analysis Lein
            </h3>
            <p className="mb-6 text-slate-200">
              Yeh article general framework hai. Aapke specific chart ke according detailed analysis ke liye:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#birth-form"
                className="rounded-lg bg-amber-600 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-500 transition"
              >
                Free Trikaal Sandesh
              </Link>
              <Link
                href={post.ctaService.href}
                className="rounded-lg border-2 border-amber-500 px-6 py-3 font-semibold text-amber-300 hover:bg-amber-500/10 transition"
              >
                {post.ctaService.label}
              </Link>
            </div>
          </section>

          {/* FAQ SECTION */}
          <section aria-label="Frequently Asked Questions" className="my-12">
            <h2 className="mb-6 text-2xl md:text-3xl font-bold text-amber-300">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {post.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-amber-900/40 bg-slate-900/40 p-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-amber-200">
                    <span>{faq.q}</span>
                    <span className="text-amber-400 transition group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3 text-slate-200 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* RELATED POSTS */}
          {relatedPosts.length > 0 && (
            <section aria-label="Related Reading" className="my-12">
              <h2 className="mb-6 text-2xl md:text-3xl font-bold text-amber-300">
                Related Reading
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group rounded-lg border border-amber-900/40 bg-slate-900/40 p-5 hover:border-amber-600/60 hover:bg-slate-900/60 transition"
                  >
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-amber-400">
                      {related.category}
                    </span>
                    <h3 className="font-semibold text-amber-100 group-hover:text-amber-300 transition leading-snug">
                      {displayTitle(related.title)}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FOOTER */}
          <footer className="mt-16 border-t border-amber-900/40 pt-8 text-sm text-slate-400">
            <p className="mb-2">
              <em>Last reviewed by{' '}
                <Link href="/founder" className="text-amber-300 hover:underline">Rohiit Gupta</Link>,
                Chief Vedic Architect, Trikaal Vaani · India · UDYAM-DL-10-0119070
              </em>
            </p>
            <p>
              <strong className="text-amber-200">Classical sources:</strong> {post.classicalSources}
            </p>
          </footer>

        </div>
      </article>
    </>
  );
}
