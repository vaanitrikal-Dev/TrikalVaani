/**
 * ============================================================
 * TRIKAL VAANI — Blog Index Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/blog/page.tsx
 * VERSION: 2.0 — Supabase Dynamic (auto-loads all published posts)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Reads all published blogs from Supabase via getAllPosts().
 * Add new blogs in Supabase → they appear here instantly. Zero redeploy.
 * ============================================================
 */
import type { Metadata } from 'next';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import BlogCard from '@/components/blog/BlogCard';
import { getAllPosts } from '@/lib/blog-posts';

// ISR — revalidate every 5 min so new Supabase rows go live fast
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Vedic Astrology Blog — Gochar, Kundali & Jyotish | Trikal Vaani',
  description:
    'Expert articles on Vedic astrology — planetary transits (Gochar), Kundali analysis, Dashas, and the science of Jyotish explained for the modern seeker.',
  keywords: [
    'Vedic astrology blog',
    'Gochar transits',
    'Kundali',
    'Jyotish',
    'Saturn transit',
    'Rahu Ketu',
    'Jupiter transit',
    'Mahadasha',
    'Antardasha',
    'Manglik Dosha',
    'Sade Sati',
  ],
  alternates: { canonical: 'https://trikalvaani.com/blog' },
  openGraph: {
    title: 'Vedic Astrology Blog | Trikal Vaani',
    description: 'Planetary transits, Kundali secrets, and Jyotish decoded.',
    url: 'https://trikalvaani.com/blog',
    type: 'website',
  },
};

export default async function BlogPage() {
  const allPosts = await getAllPosts();
  const featuredPost = allPosts[0];
  const restPosts = allPosts.slice(1);

  // Build dynamic category list from live data
  const categories = Array.from(new Set(allPosts.map((p) => p.category))).slice(0, 12);

  return (
    <div className="min-h-screen bg-[#030712]">
      <SiteNav />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium tracking-widest uppercase text-yellow-400/60 mb-4">
              Vedic Knowledge Base
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <span className="text-gradient-gold">Trikal Blog</span>
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-base leading-relaxed">
              Planetary transits, Kundali secrets, and the eternal wisdom of Jyotish —
              decoded for the modern age.
            </p>
          </div>

          {/* GEO direct-answer block — helps Google SGE / Perplexity / Gemini */}
          <div
            className="mb-10 rounded-2xl p-6 text-sm leading-relaxed text-slate-300"
            style={{
              background: 'rgba(10,15,30,0.6)',
              border: '1px solid rgba(250,204,21,0.10)',
            }}
          >
            <strong className="text-yellow-400">Trikal Vaani Blog</strong> publishes
            classical Vedic astrology guides authored by{' '}
            <strong>Rohiit Gupta, Chief Vedic Architect</strong>. Topics include
            Vimshottari Dasha, Mahadasha–Antardasha effects, Manglik Dosh, Sade Sati,
            Pitru Dosh, and planetary transits (Gochar) — every article rooted in BPHS
            and Parashara tradition.
          </div>

          {featuredPost && (
            <div className="mb-10">
              <p className="text-xs font-medium tracking-widest uppercase text-yellow-400/50 mb-4">
                Featured Article
              </p>
              <BlogCard post={featuredPost} featured />
            </div>
          )}

          {categories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="px-4 py-1.5 rounded-full text-xs font-medium cursor-default transition-all"
                  style={{
                    background: 'rgba(250,204,21,0.06)',
                    border: '1px solid rgba(250,204,21,0.15)',
                    color: 'rgba(250,204,21,0.7)',
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {restPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {restPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No more articles yet.</p>
          )}

          <div
            className="mt-16 rounded-2xl p-8 text-center"
            style={{
              background: 'rgba(10,15,30,0.8)',
              border: '1px solid rgba(250,204,21,0.12)',
            }}
          >
            <h3 className="font-serif text-2xl font-bold text-white mb-2">
              Get Free Daily Vedic Insights
            </h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Join 10,000+ seekers receiving daily Gochar alerts, energy scores, and
              Jyotish wisdom.
            </p>
            
              href="/#birth-form"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #FACC15 0%, #D97706 100%)',
                color: '#030712',
                boxShadow: '0 0 20px rgba(250,204,21,0.3)',
              }}
            >
              Get My Free Analysis &rarr;
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
