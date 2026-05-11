// ============================================================
// TRIKAL VAANI — DYNAMIC BLOG ARTICLE PAGE (SSR)
// CEO: Rohiit Gupta | Chief Vedic Architect
// Version: 1.0
// Date: 2026-05-12
// ============================================================
// PURE SERVER COMPONENT — zero client JavaScript for content.
// Google's crawler receives full HTML on first byte.
// Uses Next.js 13 App Router features:
//   - generateStaticParams() → pre-renders all 10 pages at build
//   - generateMetadata() → per-article title, description, OG tags
//   - JSON-LD Article schema → injected server-side
//   - notFound() → returns proper 404 for invalid slugs
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

// ============================================================
// STATIC PARAMS — Pre-render all 10 pages at build time
// This is the fastest possible SSR (essentially SSG with on-demand fallback)
// ============================================================
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// Revalidate every 24 hours (ISR for future content updates)
export const revalidate = 86400;

// ============================================================
// METADATA — Dynamic <title>, <description>, OG tags per article
// Google reads these from the SSR HTML response
// ============================================================
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found | Trikal Vaani',
      description: 'The requested article could not be found.',
    };
  }

  const canonicalUrl = `https://trikalvaani.com/blog/${post.slug}`;

  return {
    title: `${post.title} | Trikal Vaani`,
    description: post.description,
    keywords: post.keywords.join(', '),
    authors: [{ name: 'Rohiit Gupta', url: 'https://trikalvaani.com/founder' }],
    creator: 'Rohiit Gupta',
    publisher: 'Trikal Vaani',
    category: post.category,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IN': canonicalUrl,
        'hi-IN': `https://trikalvaani.com/hi/blog/${post.slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      siteName: 'Trikal Vaani',
      locale: 'en_IN',
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
// Google rich results require these
// ============================================================
function generateJsonLd(post: BlogPost) {
  const canonicalUrl = `https://trikalvaani.com/blog/${post.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    headline: post.title,
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
      name: 'Trikal Vaani',
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
    inLanguage: 'en-IN',
    articleSection: post.category,
    keywords: post.keywords.join(', '),
    citation: post.classicalSources,
    wordCount: post.sections.reduce((acc, s) => {
      if ('text' in s) return acc + s.text.split(/\s+/).length;
      if ('items' in s) return acc + s.items.join(' ').split(/\s+/).length;
      return acc;
    }, 0),
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
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://trikalvaani.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://trikalvaani.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  return [articleSchema, faqSchema, breadcrumbSchema];
}

// ============================================================
// MARKDOWN-LITE BOLD PARSER — Renders **text** as <strong>
// Pure server-side string transform, no client JS
// ============================================================
function renderText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-amber-300 font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="italic text-amber-200">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ============================================================
// SECTION RENDERER — Renders each block type server-side
// ============================================================
function SectionBlock({ section, index }: { section: BlogSection; index: number }) {
  switch (section.type) {
    case 'h2':
      return (
        <h2
          id={`section-${index}`}
          className="mt-12 mb-4 text-2xl md:text-3xl font-bold text-amber-300 scroll-mt-24"
        >
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
        tip: 'bg-emerald-950/40 border-emerald-700/50 text-emerald-100',
        warn: 'bg-rose-950/40 border-rose-700/50 text-rose-100',
        verdict: 'bg-amber-950/40 border-amber-700/50 text-amber-100',
      };
      const variantLabels = {
        tip: '💡 Tip',
        warn: '⚠️ Caution',
        verdict: '🔱 Trikal Vaani Verdict',
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
  }
}

// ============================================================
// MAIN PAGE COMPONENT — SERVER COMPONENT (default in App Router)
// All content renders to HTML on Vercel's edge, then served to user
// ============================================================
export default function BlogArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.relatedSlugs);
  const jsonLdSchemas = generateJsonLd(post);
  const canonicalUrl = `https://trikalvaani.com/blog/${post.slug}`;

  return (
    <>
      {/* JSON-LD SCHEMA — Server-rendered in HTML head */}
      {jsonLdSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="min-h-screen bg-[#080B12] text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
          {/* BREADCRUMB — Visible to user + screen readers */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-400">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-amber-300 transition">Home</Link>
              </li>
              <li aria-hidden>›</li>
              <li>
                <Link href="/blog" className="hover:text-amber-300 transition">Blog</Link>
              </li>
              <li aria-hidden>›</li>
              <li className="text-amber-300 truncate">{post.category}</li>
            </ol>
          </nav>

          {/* CATEGORY BADGE */}
          <div className="mb-4">
            <span className="inline-block rounded-full bg-amber-900/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
              {post.category}
            </span>
          </div>

          {/* H1 — Primary SEO heading */}
          <h1 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            {post.title}
          </h1>

          {/* META — Author, date, read time */}
          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <Link href="/founder" className="flex items-center gap-2 hover:text-amber-300 transition">
              <span className="font-semibold text-amber-200">Rohiit Gupta</span>
              <span className="text-slate-500">· Chief Vedic Architect</span>
            </Link>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span aria-hidden>·</span>
            <span>{post.readTimeMinutes} min read</span>
          </div>

          {/* DIRECT ANSWER BLOCK — GEO/AEO optimized for AI summarization */}
          <section
            aria-label="Direct Answer"
            className="mb-12 rounded-xl border border-amber-700/40 bg-gradient-to-br from-amber-950/50 to-slate-900/50 p-6 md:p-8"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl" aria-hidden>🎯</span>
              <h2 className="text-lg font-bold text-amber-300">Trikal Sandesh — Direct Answer</h2>
            </div>
            <p className="text-base md:text-lg leading-relaxed text-amber-50">
              {post.directAnswer}
            </p>
          </section>

          {/* ARTICLE BODY — All sections rendered server-side */}
          <div className="prose-content">
            {post.sections.map((section, i) => (
              <SectionBlock key={i} section={section} index={i} />
            ))}
          </div>

          {/* PRIMARY CTA — Service link */}
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
                Free Trikal Sandesh
              </Link>
              <Link
                href={post.ctaService.href}
                className="rounded-lg border-2 border-amber-500 px-6 py-3 font-semibold text-amber-300 hover:bg-amber-500/10 transition"
              >
                {post.ctaService.label}
              </Link>
              <a
                href={`https://wa.me/919211804111?text=Pranam%20Rohiit%20ji,%20${encodeURIComponent(post.category)}%20analysis%20chahiye.`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-600 transition"
              >
                WhatsApp ₹499
              </a>
            </div>
          </section>

          {/* FAQ SECTION — Schema-ready Q&A */}
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
                      {related.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FOOTER — Authority signals */}
          <footer className="mt-16 border-t border-amber-900/40 pt-8 text-sm text-slate-400">
            <p className="mb-2">
              <em>Last reviewed by <Link href="/founder" className="text-amber-300 hover:underline">Rohiit Gupta</Link>, Chief Vedic Architect, Trikal Vaani · Delhi NCR · UDYAM-DL-10-0119070</em>
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
