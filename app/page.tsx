// 🔱 TRIKAL VAANI | app/page.tsx | v11.7
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-06-29
// ============================================================================
// v11.6 → v11.7 — SALES ORIENTATION PASS + CALCSTRIP MOVED TO #1.5:
//   ✅ CalcStrip moved from slot #3.5 → slot #1.5 (after Hero, before
//      HomeClient). Maximum early discovery — users who miss the birth form
//      hit 6 high-curiosity free tools immediately.
//   ✅ DardEngine Sales Bridge added (slot #1.8): one-line sales pitch above
//      HomeClient explaining what DardEngine does — without touching the
//      🔒 LOCKED HomeClient component.
//   ✅ Voice Teaser inline JSX — full sales rewrite: urgency copy, social
//      proof number, "most personal" angle added.
//   ✅ Blog section heading — repositioned as lead-gen hook, not just content.
//   ✅ CalcStrip removed from slot #3.5 (was v11.6) — zero duplicate.
//   ✅ Version bump: v11.6 → v11.7.
// ----------------------------------------------------------------------------
// v11.5 → v11.6 — CalcStrip added slot #3.5 (now moved to #1.5 in v11.7).
// v11.4 → v11.5 — DeepReadingsGrid moved above PricingSection.
// v11.3 → v11.4 — Voice Astrology teaser added.
// v11.2 → v11.3 — Dynamic blog section (Supabase ISR).
// v11.1 → v11.2 — Meta description rewrite.
// v11.0 → v11.1 — Brand flip + IR-0 cleanup.
// ============================================================================

import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import HomepageSchema from '@/components/seo/HomepageSchema';
import HomepageGEO from '@/components/seo/HomepageGEO';
import SchemaScript from '../components/SchemaScript';
import HomeFAQ from '../components/HomeFAQ';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import CalcStrip from '@/components/layout/CalcStrip';
import Hero from '@/components/landing/Hero';
import PillarsGrid from '@/components/landing/PillarsGrid';
import DeepReadingsGrid from '@/components/landing/DeepReadingsGrid';
import SocialProofTicker from '@/components/landing/SocialProofTicker';
import InnerCircleWaitlist from '@/components/landing/InnerCircleWaitlist';
import AIManifesto from '@/components/landing/AIManifesto';
import DailyPanchang from '@/components/landing/DailyPanchang';
import DailyRashifal from '@/components/landing/DailyRashifal';
import PricingSection from '@/components/landing/PricingSection';
import LiveTrustBar from '@/components/landing/LiveTrustBar';
import KundaliMilanTeaser from '@/components/landing/KundaliMilanTeaser';
import HomeClient from './HomeClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Trikaal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
  description:
    "Free AI kundli, Kundali Milan & accurate Vedic predictions for career, marriage, wealth & health by Rohiit Gupta, Chief Vedic Architect.",
  alternates: {
    canonical: 'https://trikalvaani.com/',
    languages: {
      'en-IN': 'https://trikalvaani.com/',
      'hi-IN': 'https://trikalvaani.com/hi',
    },
  },
  openGraph: {
    title: 'Trikaal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
    description:
      "Free AI kundli, Kundali Milan & accurate Vedic astrology predictions. Personalised readings by Rohiit Gupta, Chief Vedic Architect. Voice & text from ₹11.",
    url: 'https://trikalvaani.com/',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikaal Vaani',
    images: [
      {
        url: 'https://trikalvaani.com/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Trikaal Vaani — Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trikaal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',
    description:
      'Free AI kundli, Kundali Milan & accurate Vedic astrology predictions. Voice & text readings from ₹11.',
    images: ['https://trikalvaani.com/og-default.jpg'],
  },
};

// ─────────────────────────────────────────────────────────────
// HOMEPAGE BLOG — Supabase fetch + local card
// ─────────────────────────────────────────────────────────────
interface HomeBlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  published_at: string;
  read_time_minutes: number;
}

const FALLBACK_POSTS: HomeBlogPost[] = [
  {
    slug: 'shani-gochar-2026-saturn-transit',
    title: "Shani Gochar 2026: What Saturn's Transit Through Aquarius Means for Your Rashi",
    description: 'Saturn — the great teacher of karma — continues its powerful 2.5-year transit through Aquarius. Understand how this Gochar affects all 12 Rashis in 2026.',
    category: 'Gochar / Transits',
    published_at: '2026-01-15',
    read_time_minutes: 8,
  },
  {
    slug: 'rahu-ketu-axis-2026-karmic-shift',
    title: 'Rahu-Ketu Axis 2026: The Pisces-Virgo Karmic Shift and What It Means for India',
    description: 'The shadow planets Rahu and Ketu are now deeply embedded in the Pisces-Virgo axis — the most spiritually significant transit of the decade.',
    category: 'Gochar / Transits',
    published_at: '2026-02-20',
    read_time_minutes: 10,
  },
  {
    slug: 'guru-gochar-taurus-2026-wealth-growth',
    title: "Guru Gochar 2026: Jupiter's Promise of Wealth, Property & Spiritual Abundance",
    description: 'Jupiter — Brihaspati, the cosmic guru — continues its journey through Taurus in early 2026 before moving to Gemini. A rare window for wealth building.',
    category: 'Gochar / Transits',
    published_at: '2026-03-10',
    read_time_minutes: 7,
  },
];

async function getLatestPosts(): Promise<HomeBlogPost[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, title, description, category, published_at, read_time_minutes')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3);
    if (error || !data || data.length === 0) return FALLBACK_POSTS;
    return data as HomeBlogPost[];
  } catch {
    return FALLBACK_POSTS;
  }
}

function formatPostDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return ''; }
}

function HomeBlogCard({ post }: { post: HomeBlogPost }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      className="block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group"
      style={{ background: 'rgba(11,16,26,0.7)', border: '1px solid rgba(212,175,55,0.12)' }}
    >
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#D4AF37' }}>
        🏷 {post.category}
      </p>
      <h3 className="font-serif text-lg font-bold text-white leading-snug mb-3 group-hover:text-yellow-200 transition-colors">
        {post.title}
      </h3>
      <p
        className="text-sm text-slate-400 leading-relaxed mb-4"
        style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {post.description}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>🕐 {post.read_time_minutes} min read &nbsp;·&nbsp; {formatPostDate(post.published_at)}</span>
        <span className="font-semibold" style={{ color: '#D4AF37' }}>Read &rarr;</span>
      </div>
    </a>
  );
}

export default async function HomePage() {
  const latestPosts = await getLatestPosts();

  return (
    <>
      <HomepageSchema />
      <SchemaScript />

      <div className="min-h-screen bg-[#080B12]">
        <SiteNav />
        <main>

          {/* ═══════════════════════════════════════════════════════════════
              EARNING TIER — slots #1 to #3 — TIERED LOCK (IR-12)
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 1. HERO ─────────────────────────────────────────────────── */}
          <Hero />

          {/* ── 1.5 CALC STRIP — v11.7 ──────────────────────────────────────
              MOVED HERE from slot #3.5. Sits immediately after hero so
              users who are not yet ready to fill birth details can engage
              with a free tool first — builds trust + Pixel audience.
              File: components/layout/CalcStrip.tsx v1.1 */}
          <CalcStrip />

          {/* ── 1.8 DARD ENGINE SALES BRIDGE — v11.7 ────────────────────────
              One-line pitch directly above HomeClient/DardEngine.
              Explains the value prop WITHOUT touching the locked component.
              Copy: personalised chart read for YOUR exact problem. */}
          <div className="w-full px-4 pt-6 pb-0">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xs font-bold tracking-[0.18em] uppercase mb-2"
                style={{ color: 'rgba(212,175,55,0.55)' }}>
                ✦ Not a Generic Horoscope
              </p>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Select your concern below →{' '}
                <span style={{ color: '#D4AF37' }} className="font-semibold">
                  we read your chart specifically for that problem,
                </span>{' '}
                not a one-size-fits-all prediction.
              </p>
            </div>
          </div>

          {/* ── 2. HOMECLIENT — MAHAKAAL + DARD ENGINE ─────────────────────
              🔒 EARNING LOCKED (IR-12) */}
          <HomeClient />

          {/* ── 3. KUNDALI MILAN TEASER ────────────────────────────────────
              🔒 EARNING LOCKED (IR-12) */}
          <KundaliMilanTeaser />

          {/* ═══════════════════════════════════════════════════════════════
              TRUST + COMMERCIAL TIER — slots #4 to #6
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 4. LIVE TRUST BAR ──────────────────────────────────────── */}
          <LiveTrustBar />

          {/* ── 4.5 DEEP READINGS GRID ─────────────────────────────────── */}
          <DeepReadingsGrid />

          {/* ── 5. PRICING SECTION ─────────────────────────────────────── */}
          <PricingSection />

          {/* ── 6. SOCIAL PROOF TICKER ─────────────────────────────────── */}
          <SocialProofTicker />

          {/* ── 6.5 VOICE ASTROLOGY TEASER — v11.7 SALES REWRITE ────────────
              Stronger urgency copy. Added "most personal prediction" angle.
              Added social proof mention. CTA sharpened. */}
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div
                className="rounded-3xl px-6 py-12 sm:px-12 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.03))',
                  border: '1px solid rgba(212,175,55,0.25)',
                }}
              >
                <p className="text-xs font-bold tracking-widest uppercase mb-4"
                  style={{ color: 'rgba(212,175,55,0.65)' }}>
                  🎙️ Trikaal Voice · The Most Personal Astrology Experience
                </p>

                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-snug mb-4">
                  आपकी आवाज़ में सवाल —{' '}
                  <span className="text-gradient-gold">Rohiit Gupta की आवाज़ में जवाब</span>
                </h2>

                <p className="text-slate-300 max-w-xl mx-auto text-base leading-relaxed mb-2">
                  सिर्फ mic दबाइए, अपना सवाल बोलिए। Swiss Ephemeris से
                  आपकी real-time kundali पढ़कर — <strong className="text-white">60 seconds में</strong>{' '}
                  personalized Vedic जवाब सुनिए। टाइपिंग बिल्कुल ज़रूरी नहीं।
                </p>

                <p className="text-slate-500 text-sm mb-2">
                  Hindi · Hinglish · English &nbsp;·&nbsp; Razorpay secure payments
                </p>

                <p className="text-xs mb-8" style={{ color: 'rgba(212,175,55,0.5)' }}>
                  ⚡ Instant access · No waiting · No booking required
                </p>

                <a
                  href="/voice-pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #A8820A, #D4AF37)',
                    color: '#080B12',
                    boxShadow: '0 8px 32px rgba(168,130,10,0.35)',
                  }}
                >
                  🎙️ अभी शुरू करें — सिर्फ ₹11 से &rarr;
                </a>

                <p className="text-slate-500 text-xs mt-5">
                  1 सवाल ₹11 &nbsp;·&nbsp; 5 सवाल ₹51 &nbsp;·&nbsp; 12 सवाल ₹101 &nbsp;·&nbsp;
                  <span style={{ color: 'rgba(212,175,55,0.5)' }}>सबसे सस्ता Vedic voice platform in India</span>
                </p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════
              ENGAGEMENT + RETENTION TIER — slots #7 to #10
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 7. DAILY PANCHANG ──────────────────────────────────────── */}
          <DailyPanchang />

          {/* ── 8. DAILY RASHIFAL ──────────────────────────────────────── */}
          <DailyRashifal />

          {/* ── 9. PILLARS GRID ─────────────────────────────────────────── */}
          <PillarsGrid />

          {/* ── 10. AI MANIFESTO ────────────────────────────────────────── */}
          <AIManifesto />

          {/* ═══════════════════════════════════════════════════════════════
              SEO/GEO/AEO/E-E-A-T TIER — slots #11 to #14
          ═══════════════════════════════════════════════════════════════ */}

          {/* ── 11. HOMEPAGE GEO ─────────────────────────────────────────── */}
          <HomepageGEO />

          {/* ── 12. HOME FAQ ─────────────────────────────────────────────── */}
          <HomeFAQ />

          {/* ── 13. INNER CIRCLE WAITLIST ───────────────────────────────── */}
          <InnerCircleWaitlist />

          {/* ── 14. BLOG SECTION — v11.7 SALES REWRITE ──────────────────────
              Repositioned as a trust/authority signal with lead-gen angle.
              Sub-heading drives urgency: "Know before others do." */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs font-bold tracking-widest uppercase mb-4"
                  style={{ color: 'rgba(212,175,55,0.6)' }}>
                  ✦ Vedic Intelligence — Free to Read
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                  Graha jo kar rahe hain —{' '}
                  <span className="text-gradient-gold">aap pehle janein</span>
                </h2>
                <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
                  Jupiter, Saturn, Rahu — har transit aapki zindagi pe asar karta hai.
                  Rohiit Gupta ke deep-dive articles mein jaanein kab, kaise, aur kya karna chahiye.
                  <span className="block mt-1" style={{ color: 'rgba(212,175,55,0.6)' }}>
                    Knowledge is your first remedy — always free.
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {latestPosts.map((post) => (
                  <HomeBlogCard key={post.slug} post={post} />
                ))}
              </div>

              <div className="mt-10 text-center">
                <a
                  href="/blog"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    border: '1px solid rgba(212,175,55,0.25)',
                    color: '#D4AF37',
                    background: 'rgba(212,175,55,0.05)',
                  }}
                >
                  Saare Articles Padhein — Free &rarr;
                </a>
              </div>
            </div>
          </section>

        </main>
        <SiteFooter />
      </div>
    </>
  );
}

// ============================================================================
// END — app/page.tsx v11.7
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// CEO LOCKED: TIERED LAYOUT — earning sections above mobile fold
// ============================================================================
