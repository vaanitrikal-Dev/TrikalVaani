import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, Share2 } from 'lucide-react';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import BlogCard from '@/components/blog/BlogCard';
import { blogPosts, getBlogPost } from '@/lib/blog-data';

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  if (!post) return { title: 'Post Not Found | Trikal Vaani' };

  return {
    title: `${post.title} | Trikal Vaani`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

function renderContent(content: string) {
  const lines = content.trim().split('\n');
  const elements: ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={key++} className="h-4" />);
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={key++}
          className="font-serif text-xl sm:text-2xl font-bold text-white mt-8 mb-4"
          style={{ borderBottom: '1px solid rgba(250,204,21,0.1)', paddingBottom: '8px' }}
        >
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={key++} className="text-sm font-semibold text-yellow-400/80 mb-2">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else if (trimmed.startsWith('**')) {
      const boldEnd = trimmed.indexOf('**', 2);
      if (boldEnd > 2) {
        const boldText = trimmed.slice(2, boldEnd);
        const rest = trimmed.slice(boldEnd + 2);
        elements.push(
          <p key={key++} className="text-sm text-slate-300 leading-relaxed mb-3">
            <strong className="text-yellow-400/80 font-semibold">{boldText}</strong>
            {rest}
          </p>
        );
      } else {
        elements.push(
          <p key={key++} className="text-sm text-slate-300 leading-relaxed mb-3">
            {trimmed}
          </p>
        );
      }
    } else {
      elements.push(
        <p key={key++} className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    }
  }

  return elements;
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#030712]">
      <SiteNav />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-yellow-400/70 transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Blog
            </Link>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-yellow-400/50" />
                <span className="text-xs font-medium text-yellow-400/60 uppercase tracking-wider">
                  {post.category}
                </span>
              </div>
              <span className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Clock className="w-3 h-3" />
                {post.readTime} read
              </div>
              <span className="text-slate-700">·</span>
              <time className="text-xs text-slate-600">
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
              {post.title}
            </h1>

            <p className="text-base text-slate-400 leading-relaxed mb-8">
              {post.excerpt}
            </p>

            <div
              className="h-px mb-8"
              style={{ background: 'linear-gradient(90deg, rgba(250,204,21,0.3) 0%, transparent 100%)' }}
            />
          </div>

          <article
            className="rounded-2xl p-6 sm:p-8 mb-10"
            style={{
              background: 'rgba(10,15,30,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {renderContent(post.content)}
          </article>

          <div className="flex flex-wrap gap-2 mb-10">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  background: 'rgba(250,204,21,0.06)',
                  border: '1px solid rgba(250,204,21,0.15)',
                  color: 'rgba(250,204,21,0.6)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div
            className="rounded-2xl p-6 mb-10 flex items-center justify-between flex-wrap gap-4"
            style={{
              background: 'rgba(10,15,30,0.8)',
              border: '1px solid rgba(34,197,94,0.15)',
            }}
          >
            <div>
              <p className="text-sm font-medium text-white mb-1">Found this useful?</p>
              <p className="text-xs text-slate-500">Share with your friends on WhatsApp</p>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — Read this amazing Vedic astrology article! https://trikalvaani.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300"
              style={{
                background: '#22C55E',
                color: '#fff',
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share on WhatsApp
            </a>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h3 className="font-serif text-xl font-bold text-white mb-6">
              More Vedic Wisdom
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedPosts.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
