// ============================================================
// TRIKAL VAANI — DYNAMIC BLOG ARTICLE PAGE (SSR)
// CEO: Rohiit Gupta | Chief Vedic Architect
// Version: 3.6
// Date: 2026-09-27
// CHANGE v3.6 — no visible change. GRANTH_META, the 6 restricted granth,
//   canShowSanskrit, citationRef/citationSchema, ENTITY_LINKS and the
//   about/mentions + DefinedTermSet builders moved to lib/wiki.ts (v1.0), the
//   one source now shared by /blog, /learn and /events. pageText() stays here
//   (it knows the blog's section shape).
// ------------------------------------------------------------
// PREVIOUS: Version 3.5
// Date: 2026-09-27
// CHANGE v3.5 — completes the 6 Wikipedia-style items (Rohiit, 27 Sep 2026):
//   • Descriptive H2 anchors: id = headingAnchor(heading), e.g.
//     #aaj-samuh-modern-life-events (unique per page). The old
//     #section-N anchor still works via an empty span, so no old link breaks.
//     Contents box links to the new anchors.
//   • Entity linking: ENTITY_LINKS holds ONLY verified Wikipedia/Wikidata URLs
//     (Nakshatra = Wikidata Q1125935 + Wikipedia; Anuradha = Q2606414; 20
//     nakshatra Wikipedia pages; Hindu astrology). Article.about gets matching
//     glossary terms (full sameAs list); Article.mentions gets every listed
//     entity found in the page text. Muhurta Chintamani has NO verified
//     Wikipedia/Wikidata page (checked 27 Sep 2026) — deliberately absent.
//   • Hub hierarchy Pillar → Samuh → Cluster (lib v3.12 hub_group):
//     breadcrumb shows Home › Blog › Pillar › Samuh › …; "See also" links the
//     Samuh section of the pillar; the PILLAR page lists every child page
//     grouped by Samuh, in the pillar's own heading order, plus an ItemList
//     JSON-LD. Samuh is NOT added to BreadcrumbList schema (its URL would be
//     pillar#anchor — same page as the pillar item; Google ignores fragments).
//   Requires lib/blog-posts.ts v3.12 and column hub_group (27 Sep 2026).
// ------------------------------------------------------------
// PREVIOUS: Version 3.4
// Date: 2026-09-27
// CHANGE v3.4 — WIKIPEDIA-STYLE PAGE, approved by Rohiit 27 Sep 2026
//   (editorial_rulings #8 — B.2, B.8, B.9, G):
//   • Inline citations: [^n] in section text / infobox renders as a
//     superscript [n] linking to reference n; each reference has a ↑ link
//     back to the first place it is cited. A marker whose n has no citation
//     is dropped (never a dangling [n]). Anchor ids are computed from the
//     text itself, so they never depend on render order.
//   • Granth Sandarbh box is now a numbered reference list: mool Sanskrit
//     shlok (lang="sa", Devanagari) then an italic Wikipedia-style reference
//     line, then the meaning. Sanskrit is shown ONLY for works in the Trikaal
//     Library that are NOT one of the 6 restricted granth (sanskritdocuments.org
//     licence): bhrigusutram, bphs, brihajjataka, chamatkarachintamani,
//     jatakaparijata, phaladipika. Enforced here even if the data has it.
//   • Infobox ("मुख्य तथ्य · Key Facts") from blog_posts.infobox — right side
//     on desktop, full width on mobile.
//   • Contents (TOC) built from the page's own H2s (+ Glossary, References,
//     FAQ). Shown when there are 3+ H2s. No data needed — every blog page.
//   • Glossary ("शब्दावली · Glossary") from blog_posts.glossary, with a
//     DefinedTermSet JSON-LD block; verified same_as URLs also go into
//     Article.about.
//   • Hub pillar (blog_posts.pillar_slug): breadcrumb (visible + schema)
//     becomes Home › Blog › Pillar › …, and "See also" shows the pillar.
//   • JSON-LD citation Chapter gains hasPart Quotation (inLanguage "sa")
//     when the shlok may be shown; Book gains sameAs when GRANTH_META has a
//     verified URL (none added yet — never guessed).
//   Requires lib/blog-posts.ts v3.11 and columns infobox / glossary /
//   pillar_slug (added 27 Sep 2026). Pages without these fields look as
//   before plus the automatic Contents box.
// ------------------------------------------------------------
// PREVIOUS: Version 3.3
// Date: 2026-09-25
// CHANGE v3.3 — DATED HUMAN REVIEW, approved by Rohiit 25 Sep 2026:
//   • Footer now reads "Last reviewed by Rohiit Gupta · 25 Sep 2026, 2:30 PM IST"
//     when public.blog_posts.reviewed_at is set (Rohiit's own review time).
//     With reviewed_at NULL the footer is exactly as before (no date) — a
//     time is never invented.
//   • JSON-LD: Article.mainEntityOfPage (WebPage) gains lastReviewed +
//     reviewedBy (the founder Person @id) only when reviewed_at is set.
//   Requires lib/blog-posts.ts v3.10. Nothing else changed.
// ------------------------------------------------------------
// PREVIOUS: Version 3.2
// Date: 2026-09-25
// CHANGE v3.2 — GRANTH SANDARBH (classical citations), approved by Rohiit 25 Sep 2026:
//   • Visible "ग्रंथ सन्दर्भ · Classical Sources" box, placed just BEFORE the
//     FAQ section (Option A of the approved mockup, site amber/dark palette).
//     Renders ONLY when post.citations has rows. Pages without citations
//     look exactly as before and keep the footer "Classical sources:" line.
//   • JSON-LD Article.citation: when citations exist it is now an array of
//     schema.org Chapter objects (isPartOf -> Book with Devanagari
//     alternateName + author), so Google/AI read Granth + Adhyaya + Shlok as
//     structured data. With no citations it falls back to the old
//     classicalSources string — no page loses its citation.
//   • Only the Granth NAME is shown in Devanagari. The Sanskrit mool paath is
//     never rendered (licence rule, editorial_rulings 25 Sep 2026) — superseded by v3.4.
//   • Authors come from GRANTH_META below; an unknown work gets no author
//     rather than a guessed one.
//   Requires lib/blog-posts.ts v3.9. No change to metadata, routing, ISR,
//   generateStaticParams, other schemas or the CTA.
// ------------------------------------------------------------
// PREVIOUS: Version 3.1
// Date: 2026-09-06
// CHANGE v3.1 — BUILD COST (the only change in this file):
//   generateStaticParams() pre-rendered all 741 published posts on EVERY
//   deployment. Vercel build log:
//     Generating static pages (0/1029) -> (1029/1029)   = 2m59s of a 3m20s build
//   353 deployments this billing cycle => Build CPU $40.80 of a $45.70 bill.
//
//   v3.1 pre-renders the 60 NEWEST posts. The other ~680 are NOT deleted and
//   NOT hidden: Next.js App Router has dynamicParams = true by default, so any
//   slug not in this list is rendered on its first request and then served
//   from the ISR cache (revalidate = 86400, unchanged below). Google gets
//   byte-identical HTML either way; all 741 URLs stay in the sitemap.
//
//   Why the 60 newest: fresh posts are the ones Google has not crawled yet and
//   the ones with no cache entry anywhere. Older posts are steady-traffic and
//   warm quickly after a deploy.
//
//   TRADE-OFF, stated honestly: after each deployment the ISR cache starts
//   empty, so the FIRST visitor to an older post pays one server render
//   (~300-500ms with the v3.7 narrow query) instead of getting a pre-built
//   file. Every visitor after that is served from cache. Nothing 404s, nothing
//   drops out of the index.
//
//   To go back to pre-rendering everything: change getAllSlugs(60) to
//   getAllSlugs() on the line marked below. That is the entire rollback.
//
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
  getHubChildren,
  headingAnchor,
  type HubChild,
  type BlogPost,
  type BlogSection,
  type BlogCitation,
  type BlogInfoboxRow,
  type BlogGlossaryTerm,
} from '@/lib/blog-posts';
// v3.6: citation / entity / glossary rules shared with /learn and /events
import {
  GRANTH_META,
  canShowSanskrit,
  citationRef,
  citationSchema,
  entitySchema,
  glossarySchema,
  matchEntities,
} from '@/lib/wiki';


// ------------------------------------------------------------------
// Brand suffix is stored inside post.title so that <title> and the OG /
// Twitter preview titles carry the brand. It must NOT appear in the H1
// or in internal-link anchor text, where it dilutes keyword relevance.
// ------------------------------------------------------------------
const BRAND_SUFFIX = /\s*[|｜]\s*(?:Trikaal?\s+Vaani|त्रिकाल\s*वाणी|त्रिकल\s*वाणी)\s*$/i;
const displayTitle = (t: string): string => (t ? t.replace(BRAND_SUFFIX, '').trim() : t);

// ==================================================================
// v3.3 — IST review timestamp, e.g. "25 Sep 2026, 2:30 PM IST"
// ==================================================================
function formatReviewedIST(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  // en-IN prints "Sept"; use a fixed 3-letter month so it reads "25 Sep 2026".
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', month: 'numeric' }).format(d)
  ) - 1;
  const ampm = get('dayPeriod').toUpperCase();
  return `${get('day')} ${MONTHS[monthIdx]} ${get('year')}, ${get('hour')}:${get('minute')} ${ampm} IST`;
}

// ==================================================================
// v3.2 — GRANTH META (Devanagari title + author) for citations
// ------------------------------------------------------------------
// Keyed by public.bphs_slokas.work. Author left null where the
// attribution is disputed — better no author than a wrong one.
// ==================================================================



function pageText(post: BlogPost): string {
  const parts: string[] = [post.directAnswer ?? ''];
  post.infobox.forEach((r) => parts.push(r.value));
  post.sections.forEach((sec) => {
    if (sec.type === 'h2' || sec.type === 'h3' || sec.type === 'p' || sec.type === 'quote' || sec.type === 'callout') parts.push(sec.text);
    else if (sec.type === 'ul' || sec.type === 'ol') parts.push(sec.items.join(' '));
  });
  return parts.join(' \n ');
}


// v3.5 — descriptive, unique H2 anchors for the whole page
function computeAnchors(sections: BlogSection[]): Map<number, string> {
  const map = new Map<number, string>();
  const used = new Set<string>();
  sections.forEach((sec, i) => {
    if (sec.type !== 'h2') return;
    const base = headingAnchor(sec.text);
    let a = base;
    let k = 2;
    while (used.has(a)) a = `${base}-${k++}`;
    used.add(a);
    map.set(i, a);
  });
  return map;
}




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
// v3.1 — pre-render the newest 60 only. Rollback = remove the number.
const PRERENDER_COUNT = 60;

export async function generateStaticParams() {
  const slugs = await getAllSlugs(PRERENDER_COUNT); // <-- getAllSlugs() = all 741
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
function generateJsonLd(
  post: BlogPost,
  pillar: { slug: string; title: string } | null = null,
  hubChildren: HubChild[] = [],
) {
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
      // v3.3: only when Rohiit has actually reviewed the page
      ...(post.reviewedAt
        ? { lastReviewed: post.reviewedAt, reviewedBy: { '@id': BUSINESS.founderId } }
        : {}),
    },
    inLanguage: post.lang === 'hi' ? 'hi-IN' : 'en-IN',
    articleSection: post.category,
    keywords: post.keywords.join(', '),
    // v3.2: structured Chapter/Book list when verified citations exist,
    // otherwise the legacy classicalSources string.
    // v3.4: verified entities (glossary same_as) for knowledge-graph linking
    // v3.5/v3.6: Article.about + Article.mentions (lib/wiki entitySchema)
    ...entitySchema(post.glossary, pageText(post)),
    citation: post.citations.length > 0
      ? post.citations.map((c) => citationSchema(c, post.lang === 'hi'))
      : post.classicalSources,
    wordCount: (() => {
      const count = (v?: string) => (v ? v.replace(/\[\^\d+\]/g, '').trim().split(/\s+/).filter(Boolean).length : 0);
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
      // v3.4: hub pillar level when the post belongs to a hub
      ...(pillar
        ? [{ '@type': 'ListItem', position: 3, name: pillar.title, item: `https://trikalvaani.com/blog/${pillar.slug}` }]
        : []),
      { '@type': 'ListItem', position: pillar ? 4 : 3, name: displayTitle(post.title), item: canonicalUrl },
    ],
  };

  const schemas: Record<string, unknown>[] = [articleSchema, faqSchema, breadcrumbSchema];

  // ── v3.5: ItemList of the hub's pages (pillar page only) ──
  if (hubChildren.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${canonicalUrl}#hub`,
      name: displayTitle(post.title),
      numberOfItems: hubChildren.length,
      itemListElement: hubChildren.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://trikalvaani.com/blog/${c.slug}`,
        name: displayTitle(c.title),
      })),
    });
  }

  // ── v3.4/v3.6: DefinedTermSet (lib/wiki glossarySchema) ──
  const gls = glossarySchema(canonicalUrl, post.lang === 'hi', post.glossary);
  if (gls) schemas.push(gls);

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
// ==================================================================
// v3.4 — WIKIPEDIA-STYLE INLINE CITATIONS
// ------------------------------------------------------------------
// [^n] in text = "see reference n". Each marker gets a unique anchor id
// built from WHERE it sits (loc) and its occurrence number inside that
// text, so ids never depend on React render order. scanCitations() runs
// once per request over the same texts, in the same way, to find the first
// anchor of every n (used by the ↑ back-link in the reference list).
// ==================================================================
type CiteCtx = { max: number; firstRef: Map<number, string> };
type CiteArg = { ctx: CiteCtx; loc: string };

const LINK_STRIP_RE = /\[[^\]]+\]\([^)]+\)/g;
const CITE_SPLIT_RE = /(\[\^\d+\])/g;

function citeAnchor(n: number, loc: string, occ: number): string {
  return `cite-ref-${n}-${loc}-${occ}`;
}

function scanText(text: string, loc: string, ctx: CiteCtx): void {
  const re = /\[\^(\d+)\]/g;
  const plain = text.replace(LINK_STRIP_RE, '');
  let m: RegExpExecArray | null;
  let occ = 0;
  while ((m = re.exec(plain)) !== null) {
    const n = Number(m[1]);
    if (n >= 1 && n <= ctx.max && !ctx.firstRef.has(n)) ctx.firstRef.set(n, citeAnchor(n, loc, occ));
    occ += 1;
  }
}

function scanCitations(post: BlogPost): CiteCtx {
  const ctx: CiteCtx = { max: post.citations.length, firstRef: new Map() };
  if (!ctx.max) return ctx;
  post.infobox.forEach((r, i) => scanText(r.value, `ib${i}`, ctx));
  post.sections.forEach((sec, i) => {
    if (sec.type === 'p' || sec.type === 'quote' || sec.type === 'callout') scanText(sec.text, `s${i}`, ctx);
    else if (sec.type === 'ul' || sec.type === 'ol') sec.items.forEach((it, j) => scanText(it, `s${i}-${j}`, ctx));
    else if (sec.type === 'table') sec.rows.forEach((row, ri) => row.forEach((cell, ci) => scanText(cell, `s${i}-${ri}-${ci}`, ctx)));
  });
  return ctx;
}

function renderText(text: string, cite?: CiteArg): React.ReactNode {
  const linkRegex = /(\[[^\]]+\]\([^)]+\))/g;
  const linkParts = text.split(linkRegex);
  let occ = 0; // counts [^n] markers across the whole text, like scanText()

  const renderPlain = (plain: string, i: number): React.ReactNode => {
    const bits = plain.split(CITE_SPLIT_RE);
    return bits.map((bit, j) => {
      const cm = bit.match(/^\[\^(\d+)\]$/);
      if (cm) {
        const n = Number(cm[1]);
        const thisOcc = occ;
        occ += 1;
        // No context, or no such reference: drop the marker (never dangling)
        if (!cite || n < 1 || n > cite.ctx.max) return null;
        return (
          <sup key={`c-${i}-${j}`} id={citeAnchor(n, cite.loc, thisOcc)} className="ml-0.5 text-xs font-semibold leading-none">
            <a href={`#cite-${n}`} aria-label={`Source ${n}`} className="text-amber-400 no-underline hover:text-amber-200">
              [{n}]
            </a>
          </sup>
        );
      }
      if (!bit) return null;
      return <span key={`t-${i}-${j}`}>{renderEmphasis(bit, i * 100 + j)}</span>;
    });
  };

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
    return <span key={`p-${i}`}>{renderPlain(part, i)}</span>;
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
function SectionBlock({
  section,
  index,
  ctx,
  anchor,
}: {
  section: BlogSection;
  index: number;
  ctx?: CiteCtx;
  anchor?: string;
}) {
  const at = (loc: string): CiteArg | undefined => (ctx ? { ctx, loc } : undefined);
  switch (section.type) {
    case 'h2':
      return (
        <h2 id={anchor ?? `section-${index}`} className="mt-12 mb-4 text-2xl md:text-3xl font-bold text-amber-300 scroll-mt-24">
          {/* v3.5: legacy #section-N anchor kept so old links still land here */}
          {anchor && <span id={`section-${index}`} aria-hidden="true" className="block scroll-mt-24" />}
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
          {renderText(section.text, at(`s${index}`))}
        </p>
      );
    case 'ul':
      return (
        <ul className="my-4 ml-6 space-y-2 list-disc text-slate-200">
          {section.items.map((item, i) => (
            <li key={i} className="text-base md:text-lg leading-relaxed">
              {renderText(item, at(`s${index}-${i}`))}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="my-4 ml-6 space-y-2 list-decimal text-slate-200">
          {section.items.map((item, i) => (
            <li key={i} className="text-base md:text-lg leading-relaxed pl-2">
              {renderText(item, at(`s${index}-${i}`))}
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
                      {renderText(cell, at(`s${index}-${ri}-${ci}`))}
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
          <p className="leading-relaxed">{renderText(section.text, at(`s${index}`))}</p>
        </aside>
      );
    }
    case 'quote':
      return (
        <blockquote className="my-6 border-l-4 border-amber-700 pl-4 italic text-amber-100">
          {renderText(section.text, at(`s${index}`))}
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
// v3.4 — WIKIPEDIA-STYLE COMPONENTS (Infobox · Contents · Glossary)
// ==================================================================
function Infobox({ rows, ctx }: { rows: BlogInfoboxRow[]; ctx: CiteCtx }) {
  if (!rows.length) return null;
  return (
    <aside
      aria-label="Key facts"
      className="mb-8 overflow-hidden rounded-xl border border-amber-800/50 bg-slate-900/70 text-sm md:float-right md:mb-6 md:ml-8 md:w-80"
    >
      <div className="bg-amber-950/70 px-4 py-2 text-center font-bold text-amber-300">
        मुख्य तथ्य · Key Facts
      </div>
      <table className="w-full">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-amber-900/30 align-top">
              <th scope="row" className="w-2/5 px-3 py-2 text-left font-semibold text-amber-200">
                {r.label}
              </th>
              <td className="px-3 py-2 leading-relaxed text-slate-200">
                {renderText(r.value, { ctx, loc: `ib${i}` })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  );
}

function TableOfContents({
  sections,
  anchors,
  hasGlossary,
  hasReferences,
  hasFaq,
  hi,
}: {
  sections: BlogSection[];
  anchors: Map<number, string>;
  hasGlossary: boolean;
  hasReferences: boolean;
  hasFaq: boolean;
  hi: boolean;
}) {
  const heads: { text: string; href: string }[] = [];
  sections.forEach((sec, i) => {
    if (sec.type === 'h2') heads.push({ text: sec.text, href: `#${anchors.get(i) ?? `section-${i}`}` });
  });
  if (heads.length < 3) return null;
  if (hasGlossary) heads.push({ text: hi ? 'शब्दावली' : 'Glossary', href: '#glossary' });
  if (hasReferences) heads.push({ text: hi ? 'ग्रंथ सन्दर्भ' : 'Classical Sources', href: '#granth-sandarbh' });
  if (hasFaq) heads.push({ text: hi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'FAQ', href: '#faq' });
  return (
    <nav aria-label="Contents" className="mb-10 rounded-xl border border-amber-900/40 bg-slate-900/40 p-4 md:max-w-md">
      <details open>
        <summary className="cursor-pointer select-none font-bold text-amber-300">
          विषय सूची · Contents <span className="text-xs font-normal text-slate-400">({heads.length})</span>
        </summary>
        <ol className="mt-3 ml-5 list-decimal space-y-1 text-sm text-slate-300">
          {heads.map((h, k) => (
            <li key={k}>
              <a href={h.href} className="hover:text-amber-300 transition">
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}

function Glossary({ terms }: { terms: BlogGlossaryTerm[] }) {
  if (!terms.length) return null;
  return (
    <section
      id="glossary"
      aria-label="Glossary"
      className="my-12 scroll-mt-24 rounded-xl border border-amber-900/40 bg-slate-900/40 p-5 md:p-6"
    >
      <h2 className="mb-4 text-2xl md:text-3xl font-bold text-amber-300">शब्दावली · Glossary</h2>
      <dl className="space-y-4">
        {terms.map((t, i) => (
          <div key={i}>
            <dt className="font-semibold text-amber-200">
              {t.same_as ? (
                <a href={t.same_as} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {t.term}
                </a>
              ) : (
                t.term
              )}
            </dt>
            <dd className="mt-1 leading-relaxed text-slate-300">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
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

  // v3.4: fetch the hub pillar in the SAME query as related posts
  const fetchSlugs    = post.pillarSlug && post.pillarSlug !== post.slug
    ? Array.from(new Set([...post.relatedSlugs, post.pillarSlug]))
    : post.relatedSlugs;
  const fetched       = await getRelatedPosts(fetchSlugs);
  const pillarPost    = post.pillarSlug ? fetched.find((p) => p.slug === post.pillarSlug) ?? null : null;
  const relatedPosts  = fetched.filter((p) => p.slug !== post.pillarSlug);
  const pillarRef     = pillarPost ? { slug: pillarPost.slug, title: displayTitle(pillarPost.title) } : null;
  // v3.5: a page with no pillar of its own may BE a pillar — list its children
  const hubChildren   = post.pillarSlug ? [] : await getHubChildren(post.slug);
  const anchors       = computeAnchors(post.sections);
  const jsonLdSchemas = generateJsonLd(post, pillarRef, hubChildren);
  const hubGroupHref  = pillarRef && post.hubGroup ? `/blog/${pillarRef.slug}#${post.hubGroup.anchor}` : null;
  // v3.5: hub children grouped by Samuh, in the pillar's own heading order
  const anchorOrder   = new Map<string, number>();
  anchors.forEach((a, i) => anchorOrder.set(a, i));
  const hubGroups: { label: string; anchor: string | null; items: HubChild[] }[] = [];
  hubChildren.forEach((c) => {
    const key = c.hubGroup ? c.hubGroup.anchor : null;
    let g = hubGroups.find((x) => x.anchor === key);
    if (!g) {
      g = { label: c.hubGroup ? c.hubGroup.label : (post.lang === 'hi' ? 'अन्य' : 'More'), anchor: key, items: [] };
      hubGroups.push(g);
    }
    g.items.push(c);
  });
  hubGroups.sort((a, b) => (anchorOrder.get(a.anchor ?? '') ?? 1e9) - (anchorOrder.get(b.anchor ?? '') ?? 1e9));
  const citeCtx       = scanCitations(post);
  const isHi          = post.lang === 'hi';
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
              {pillarRef && (
                <>
                  <li><Link href={`/blog/${pillarRef.slug}`} className="hover:text-amber-300 transition">{pillarRef.title}</Link></li>
                  <li aria-hidden>›</li>
                </>
              )}
              {hubGroupHref && post.hubGroup && (
                <>
                  <li><Link href={hubGroupHref} className="hover:text-amber-300 transition">{post.hubGroup.label}</Link></li>
                  <li aria-hidden>›</li>
                </>
              )}
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

          {/* ── v3.4: INFOBOX + CONTENTS (Wikipedia-style) ── */}
          <Infobox rows={post.infobox} ctx={citeCtx} />
          <TableOfContents
            sections={post.sections}
            anchors={anchors}
            hasGlossary={post.glossary.length > 0}
            hasReferences={post.citations.length > 0}
            hasFaq={post.faqs.length > 0}
            hi={isHi}
          />

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
                <SectionBlock key={i} section={section} index={i} ctx={citeCtx} anchor={anchors.get(i)} />
              ))}
            </div>
          )}
          {/* v3.4: end the infobox float before full-width blocks */}
          <div className="clear-both" />

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

          {/* v3.4: GLOSSARY (before references, Wikipedia order) */}
          <Glossary terms={post.glossary} />

          {/* v3.2/v3.4: GRANTH SANDARBH — numbered reference list */}
          {post.citations.length > 0 && (
            <section
              id="granth-sandarbh"
              aria-label="Granth Sandarbh — Classical Sources"
              className="my-12 scroll-mt-24 rounded-xl border border-amber-900/40 bg-slate-900/40 p-5 md:p-6"
            >
              <h2 className="mb-1 text-2xl md:text-3xl font-bold text-amber-300">
                ग्रंथ सन्दर्भ · Classical Sources
              </h2>
              <p className="mb-5 text-sm text-slate-400">
                {post.lang === 'hi'
                  ? 'इस लेख के हर नियम का मूल स्रोत — ग्रंथ, अध्याय और श्लोक संख्या के साथ।'
                  : 'The classical source behind every rule in this article — Granth, Adhyaya and Shlok number.'}
              </p>
              <ol className="divide-y divide-amber-900/30">
                {post.citations.map((c, i) => {
                  const hi = post.lang === 'hi';
                  const n = i + 1;
                  const meta = c.work ? GRANTH_META[c.work] : undefined;
                  const main = hi ? c.rule_hi || c.rule_en : c.rule_en || c.rule_hi;
                  const second = hi ? (c.rule_hi ? c.rule_en : null) : (c.rule_en ? c.rule_hi : null);
                  const ref = citationRef(c, hi);
                  const back = citeCtx.firstRef.get(n);
                  const showSa = canShowSanskrit(c);
                  return (
                    <li key={i} id={`cite-${n}`} className="scroll-mt-24 py-4 first:pt-0 last:pb-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-amber-400">[{n}]</span>
                        {back && (
                          <a href={`#${back}`} aria-label={hi ? 'लेख में वापस' : 'Back to text'} className="text-amber-500 no-underline hover:text-amber-200">
                            ↑
                          </a>
                        )}
                        <span className="font-semibold text-amber-200">
                          {c.granth}
                          {meta && (
                            <span className="ml-2 text-sm font-normal text-slate-400">
                              {meta.sa}{meta.author ? ` · ${meta.author}` : ''}
                            </span>
                          )}
                        </span>
                      </div>
                      {showSa && (
                        <blockquote
                          lang="sa"
                          className="mt-3 whitespace-pre-line border-l-2 border-amber-600 pl-4 text-base italic leading-relaxed text-amber-100"
                        >
                          {c.sanskrit}
                        </blockquote>
                      )}
                      {ref && (
                        <div className="mt-1.5 text-sm italic text-amber-400">
                          — {c.granth}, {ref}
                        </div>
                      )}
                      {main && <p className="mt-2 text-slate-200 leading-relaxed">{main}</p>}
                      {second && <p className="mt-1 text-sm text-slate-400 leading-relaxed">{second}</p>}
                    </li>
                  );
                })}
              </ol>
              <p className="mt-5 border-t border-amber-900/30 pt-4 text-xs text-slate-400">
                {post.lang === 'hi'
                  ? 'हर सन्दर्भ त्रिकाल वाणी ग्रंथ-पुस्तकालय या प्रतिष्ठित मुक्त स्रोत से मिलाया गया · व्याख्या: '
                  : 'Each reference checked against the Trikaal Vaani Granth library or a reputable open source · Interpretation: '}
                <Link href="/founder" className="text-amber-300 hover:underline">Rohiit Gupta</Link>
                , Chief Vedic Architect
              </p>
            </section>
          )}

          {/* FAQ SECTION */}
          <section id="faq" aria-label="Frequently Asked Questions" className="my-12 scroll-mt-24">
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

          {/* RELATED POSTS — v3.4: "See also" with hub pillar + categories */}
          {/* v3.5: PILLAR → SAMUH → CLUSTER — every page of this hub */}
          {hubGroups.length > 0 && (
            <section id="hub-pages" aria-label="All pages in this hub" className="my-12 scroll-mt-24">
              <h2 className="mb-6 text-2xl md:text-3xl font-bold text-amber-300">
                {isHi ? 'इस हब के सभी पेज' : 'All pages in this hub'}
              </h2>
              <div className="space-y-6">
                {hubGroups.map((g, gi) => (
                  <div key={gi}>
                    <h3 className="mb-3 text-lg font-semibold text-amber-200">
                      {g.anchor ? (
                        <a href={`#${g.anchor}`} className="hover:text-amber-300 transition">{g.label}</a>
                      ) : (
                        g.label
                      )}
                    </h3>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {g.items.map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={`/blog/${c.slug}`}
                            className="block rounded-md border border-amber-900/40 bg-slate-900/40 px-4 py-2 text-sm text-amber-100 hover:border-amber-600/60 hover:text-amber-300 transition"
                          >
                            {displayTitle(c.title)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(relatedPosts.length > 0 || pillarRef) && (
            <section aria-label="See also" className="my-12">
              <h2 className="mb-6 text-2xl md:text-3xl font-bold text-amber-300">
                {isHi ? 'यह भी देखें · See also' : 'See also · यह भी देखें'}
              </h2>
              {pillarRef && (
                <Link
                  href={`/blog/${pillarRef.slug}`}
                  className="mb-4 block rounded-lg border border-amber-600/60 bg-amber-950/30 p-5 hover:bg-amber-900/30 transition"
                >
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-amber-400">
                    {isHi ? 'इस हब का मुख्य पेज' : 'Part of the hub'}
                  </span>
                  <span className="font-semibold text-amber-100">{pillarRef.title}</span>
                </Link>
              )}
              {hubGroupHref && post.hubGroup && (
                <p className="mb-4 text-sm text-slate-300">
                  {isHi ? 'समूह' : 'Group'}:{' '}
                  <Link href={hubGroupHref} className="font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200">
                    {post.hubGroup.label}
                  </Link>
                </p>
              )}
              {relatedPosts.length > 0 && (
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
              )}
              <p className="mt-5 text-xs text-slate-400">
                {isHi ? 'श्रेणी' : 'Categories'}: <span className="text-slate-300">{post.category}</span>
                {post.domain && post.domain !== post.category && (
                  <> · <span className="text-slate-300">{post.domain}</span></>
                )}
              </p>
            </section>
          )}

          {/* FOOTER */}
          <footer className="mt-16 border-t border-amber-900/40 pt-8 text-sm text-slate-400">
            <p className="mb-2">
              <em>Last reviewed by{' '}
                <Link href="/founder" className="text-amber-300 hover:underline">Rohiit Gupta</Link>
                {formatReviewedIST(post.reviewedAt) && (
                  <>
                    {' · '}
                    <time dateTime={post.reviewedAt ?? undefined}>{formatReviewedIST(post.reviewedAt)}</time>
                  </>
                )}
                , Chief Vedic Architect, Trikaal Vaani · India · UDYAM-DL-10-0119070
              </em>
            </p>
            {/* v3.2: legacy line only when the Granth Sandarbh box is absent */}
            {post.citations.length === 0 && post.classicalSources && (
              <p>
                <strong className="text-amber-200">Classical sources:</strong> {post.classicalSources}
              </p>
            )}
          </footer>

        </div>
      </article>
    </>
  );
}
