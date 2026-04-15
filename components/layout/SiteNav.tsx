import Link from 'next/link';
import { Star } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function SiteNav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-4"
      style={{
        background: 'rgba(2,8,23,0.82)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${GOLD_RGBA(0.1)}`,
      }}
    >
      <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${GOLD_RGBA(0.2)} 0%, rgba(76,29,149,0.2) 100%)`,
              border: `1px solid ${GOLD_RGBA(0.32)}`,
            }}
          >
            <Star className="w-4 h-4" style={{ color: GOLD }} />
          </div>
          <span className="font-serif font-bold text-lg text-gradient-gold">
            Trikal Vaani
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/#pillars"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200"
          >
            Life Pillars
          </Link>
          <Link
            href="/blog"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200"
          >
            Vedic Blog
          </Link>
          <Link
            href="/#birth-form"
            className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-300"
            style={{
              background: GOLD_RGBA(0.1),
              border: `1px solid ${GOLD_RGBA(0.28)}`,
              color: GOLD,
            }}
          >
            Free Analysis
          </Link>
        </nav>

        <Link
          href="/#birth-form"
          className="sm:hidden text-sm font-medium px-4 py-2 rounded-full transition-all duration-300"
          style={{
            background: GOLD_RGBA(0.1),
            border: `1px solid ${GOLD_RGBA(0.28)}`,
            color: GOLD,
          }}
        >
          Start
        </Link>
      </div>
    </header>
  );
}
