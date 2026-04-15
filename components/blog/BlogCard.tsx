import Link from 'next/link';
import { Clock, Tag } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-data';

type Props = { post: BlogPost; featured?: boolean };

export default function BlogCard({ post, featured = false }: Props) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article
        className="h-full rounded-2xl p-6 transition-all duration-300 group-hover:-translate-y-1"
        style={{
          background: 'rgba(10,15,30,0.7)',
          border: '1px solid rgba(250,204,21,0.1)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-3 h-3 text-yellow-400/50" />
          <span className="text-xs font-medium text-yellow-400/60 uppercase tracking-wider">
            {post.category}
          </span>
        </div>

        <h2
          className={`font-serif font-bold text-white mb-3 leading-snug group-hover:text-yellow-400/90 transition-colors duration-200 ${
            featured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
          }`}
        >
          {post.title}
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed mb-5 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Clock className="w-3 h-3" />
              {post.readTime} read
            </div>
            <span className="text-slate-700">·</span>
            <time className="text-xs text-slate-600">
              {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </time>
          </div>

          <span
            className="text-xs font-medium text-yellow-400/60 group-hover:text-yellow-400 transition-colors duration-200"
          >
            Read &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
}
