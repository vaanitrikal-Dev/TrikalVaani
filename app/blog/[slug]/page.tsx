// ============================================================
// TRIKAL VAANI — DYNAMIC BLOG ARTICLE PAGE (SSR)
// CEO: Rohiit Gupta | Chief Vedic Architect
// Version: 2.8
// Date: 2026-08-05
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

// ============================================================
// STATIC PARAMS
// ============================================================
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 86400;

// ============================================================
// METADATA
// ============================================================
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

// ============================================================
// JSON-LD SCHEMA — Article + FAQ + BreadcrumbList
// ============================================================
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
      '@id': 'https://trikalvaani.com/#rohiit-gupta',
      name: 'Rohiit Gupta',
      url: 'https://trikalvaani.com/founder',
      jobTitle: 'Chief Vedic Architect',
      worksFor: { '@id': 'https://trikalvaani.com/#organization' },
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://trikalvaani.com/#organization',
      name: 'Trikaal Vaani',
      logo: {
        '@type': 'ImageObject',
        url: 'https://trikalvaani.com/logo.png',
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

  // ── v2.8: VideoObject — only emitted when the post has a video section ──
  const videoSection = (post.sections as Array<Record<string, unknown>>).find(
    (s) => s.type === 'video'
  ) as { videoId: string; title?: string } | undefined;

  const videoSchema = videoSection
    ? {
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
        publisher: { '@id': 'https://trikalvaani.com/#organization' },
      }
    : null;

  return videoSchema
    ? [articleSchema, faqSchema, breadcrumbSchema, videoSchema]
    : [articleSchema, faqSchema, breadcrumbSchema];
}

// ============================================================
// MARKDOWN-LITE PARSER — bold, italic, links (v2.1 unchanged)
// ============================================================
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

// ============================================================
// SECTION RENDERER (unchanged from v2.1)
// ============================================================
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

// ============================================================
// v2.2: PLAYBOOK BODY SECTION RENDERER
// Renders emotional / communication / strengths / challenges / remedies
// Only renders if the field is non-empty (safe for old rows).
// ============================================================
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

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
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
