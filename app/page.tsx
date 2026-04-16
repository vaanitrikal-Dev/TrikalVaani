import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import Hero from '@/components/landing/Hero';
import PillarsGrid from '@/components/landing/PillarsGrid';
import BirthForm from '@/components/landing/BirthForm';
import SocialProofTicker from '@/components/landing/SocialProofTicker';
import InnerCircleWaitlist from '@/components/landing/InnerCircleWaitlist';
import BlogCard from '@/components/blog/BlogCard';
import { blogPosts } from '@/lib/blog-data';

export default function HomePage() {
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#030712]">
      <SiteNav />

      <main>
        <Hero />
        <SocialProofTicker />
        <PillarsGrid />
        <BirthForm />
        <InnerCircleWaitlist />

        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-medium tracking-widest uppercase text-yellow-400/60 mb-4">
                Vedic Knowledge Base
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Latest from the{' '}
                <span className="text-gradient-gold">Trikal Blog</span>
              </h2>
              <p className="text-slate-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">
                Deep dives into Gochar transits, Kundali analysis, and the timeless
                science of Jyotish — written for the modern seeker.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="/blog"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  border: '1px solid rgba(250,204,21,0.2)',
                  color: '#FACC15',
                  background: 'rgba(250,204,21,0.04)',
                }}
              >
                View All Articles &rarr;
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
