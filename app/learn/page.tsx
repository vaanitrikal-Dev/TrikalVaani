import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = {
  title: 'Vedic Astrology Knowledge Hub | Trikaal Vaani',
  description: 'India\'s most comprehensive Vedic astrology guide — 90+ expert articles on predictions, yogas, doshas, transits, and festivals. Written by Rohiit Gupta, Chief Vedic Architect.',
  alternates: { canonical: 'https://trikalvaani.com/learn' },
  openGraph: {
    title: 'Vedic Astrology Knowledge Hub | Trikaal Vaani',
    description: 'India\'s most comprehensive Vedic astrology guide — 90+ expert articles.',
    url: 'https://trikalvaani.com/learn',
    siteName: 'Trikaal Vaani',
  },
}

type IndexPage = {
  slug: string
  title_en: string
  meta_description: string
  cluster: string
  category: string
  page_type: string
  priority: number
  /* Path A bilingual pairing (added 4 Sep 2026). Slug of this page's Hindi twin,
     which is a separate lang='hi' row in blog_posts rendering at
     /blog/<hindi_slug>. NULL for the ~75 /learn pages that have no Hindi
     version yet — those cards simply render without the Hindi link. */
  hindi_slug: string | null
}

const CATEGORY_CONFIG = {
  prediction: {
    label: '🔮 Prediction Guides',
    description: 'Career, marriage, wealth, property, and life predictions from your Kundli',
    colour: '#C8902D',
  },
  knowledge: {
    label: '📚 Vedic Knowledge',
    description: 'Beginner to advanced Jyotish — houses, planets, yogas, doshas, and more',
    colour: '#2D7A9A',
  },
  festival: {
    label: '🪔 Festival Astrology',
    description: 'Navratri, Diwali, Purnima, eclipses — astrological significance and rituals',
    colour: '#8B2D8B',
  },
  transit: {
    label: '🪐 Planetary Transits',
    description: 'Jupiter, Saturn, Rahu-Ketu, Mars, and Venus transit effects for 2026',
    colour: '#2D6B2D',
  },
  trending: {
    label: '🔥 Trending Topics',
    description: 'AI vs astrologers, Gen Z & Jyotish, startup astrology, and modern applications',
    colour: '#A0340F',
  },
}

async function fetchIndexPages(): Promise<IndexPage[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('seo_pillar_pages')
    .select('slug, title_en, meta_description, cluster, category, page_type, priority, hindi_slug')
    .eq('published', true)
    .order('priority', { ascending: false })
    .order('title_en')
  return (data as IndexPage[]) || []
}

export default async function LearnIndexPage() {
  const pages = await fetchIndexPages()

  // Group by category → cluster → pages
  const grouped: Record<string, Record<string, IndexPage[]>> = {}
  for (const p of pages) {
    if (!grouped[p.category]) grouped[p.category] = {}
    if (!grouped[p.category][p.cluster]) grouped[p.category][p.cluster] = []
    grouped[p.category][p.cluster].push(p)
  }

  const categoryOrder = ['prediction', 'knowledge', 'festival', 'transit', 'trending']

  return (
    <>
      <style>{`
        .learn-root {
          min-height: 100vh;
          background: #0D0A06;
          color: #F5EDD8;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        .learn-hero {
          background: radial-gradient(ellipse 100% 60% at 50% 0%, rgba(200,144,45,0.12) 0%, transparent 70%);
          border-bottom: 1px solid rgba(200,144,45,0.15);
          padding: 3rem 1.5rem 2.5rem;
          text-align: center;
        }
        .learn-hero h1 {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 700; margin: 0 0 0.75rem;
          letter-spacing: -0.01em;
        }
        .learn-hero h1 em {
          font-style: normal; color: #C8902D;
        }
        .learn-hero p {
          font-size: 1rem; color: #8C7B60;
          margin: 0 auto; max-width: 560px; line-height: 1.7;
        }
        .learn-stats {
          display: flex; justify-content: center; gap: 2rem;
          margin-top: 1.5rem; flex-wrap: wrap;
        }
        .learn-stat {
          text-align: center;
        }
        .learn-stat .num {
          font-size: 1.5rem; font-weight: 700; color: #C8902D; display: block;
        }
        .learn-stat .label {
          font-size: 0.75rem; color: #7A6A50; text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .learn-body {
          max-width: 1100px; margin: 0 auto;
          padding: 2.5rem 1.5rem 4rem;
        }
        .learn-category-section { margin-bottom: 3rem; }
        .learn-category-header {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(200,144,45,0.18);
        }
        .learn-category-header h2 {
          font-size: 1.3rem; font-weight: 700; margin: 0;
        }
        .learn-category-header p {
          font-size: 0.82rem; color: #7A6A50; margin: 0.2rem 0 0;
        }
        .learn-clusters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        .learn-cluster-card {
          background: rgba(200,144,45,0.04);
          border: 1px solid rgba(200,144,45,0.13);
          border-radius: 5px; padding: 1.1rem;
          transition: all 0.15s;
        }
        .learn-cluster-card:hover {
          border-color: rgba(200,144,45,0.3);
          background: rgba(200,144,45,0.08);
        }
        .learn-cluster-name {
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #C8902D; margin-bottom: 0.6rem;
        }
        .learn-cluster-links { list-style: none; padding: 0; margin: 0; }
        .learn-cluster-links li { margin-bottom: 0.25rem; }
        .learn-cluster-links a {
          font-size: 0.84rem; color: #9A8568; text-decoration: none;
          line-height: 1.4; display: block; padding: 0.15rem 0;
          transition: color 0.12s;
        }
        .learn-cluster-links a:hover { color: #C8902D; }
        .learn-cluster-links a.is-pillar {
          font-weight: 700; color: #C9B48A;
        }
        .learn-cluster-links a.is-pillar:hover { color: #C8902D; }
        /* Hindi twin link (Path A pairing, added 4 Sep 2026). Sits under the
           English title, deliberately smaller and dimmer so it reads as a
           secondary option rather than competing with the main link. */
        .learn-cluster-links a.hi-link {
          display: inline-block;
          font-size: 0.74rem;
          color: #8A6A2F;
          padding: 0 0 0.2rem;
          font-family: 'Noto Sans Devanagari', 'Nirmala UI', system-ui, sans-serif;
        }
        .learn-cluster-links a.hi-link:hover {
          color: #C8902D; text-decoration: underline;
        }
        .learn-view-all {
          display: inline-block; margin-top: 0.6rem;
          font-size: 0.76rem; color: #C8902D; text-decoration: none;
          letter-spacing: 0.04em;
        }
        .learn-view-all:hover { text-decoration: underline; }
        .learn-bottom-cta {
          text-align: center; margin-top: 3rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(200,144,45,0.1), rgba(200,144,45,0.04));
          border: 1px solid rgba(200,144,45,0.25);
          border-radius: 6px;
        }
        .learn-bottom-cta h2 {
          font-size: 1.4rem; margin: 0 0 0.6rem;
        }
        .learn-bottom-cta p {
          color: #8C7B60; font-size: 0.9rem; margin: 0 auto 1.25rem;
          max-width: 480px; line-height: 1.65;
        }
        .cta-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: linear-gradient(135deg, #C8902D, #A0700F);
          color: #fff; font-weight: 700; padding: 0.7rem 1.5rem;
          border-radius: 3px; text-decoration: none;
          font-size: 0.9rem; font-family: 'Georgia', serif;
          box-shadow: 0 4px 18px rgba(200,144,45,0.3);
          transition: all 0.2s;
        }
        .cta-btn:hover {
          background: linear-gradient(135deg, #D9A040, #B07A1F);
          transform: translateY(-1px);
          box-shadow: 0 6px 26px rgba(200,144,45,0.4);
        }
      `}</style>

      <div className="learn-root">
        {/* Hero */}
        <div className="learn-hero">
          <h1>Vedic Astrology <em>Knowledge Hub</em></h1>
          <p>
            India&apos;s most comprehensive Jyotish guide — written by Rohiit Gupta,
            Chief Vedic Architect. Classical authority. Modern clarity. Zero fabrication.
          </p>
          <div className="learn-stats">
            <div className="learn-stat">
              <span className="num">90+</span>
              <span className="label">Expert Articles</span>
            </div>
            <div className="learn-stat">
              <span className="num">5</span>
              <span className="label">Topic Categories</span>
            </div>
            <div className="learn-stat">
              <span className="num">1000+</span>
              <span className="label">Words Per Page</span>
            </div>
            <div className="learn-stat">
              <span className="num">5000</span>
              <span className="label">Years of Jyotish</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="learn-body">
          {categoryOrder.map(category => {
            const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
            const clusters = grouped[category] || {}
            if (!Object.keys(clusters).length) return null

            return (
              <div key={category} className="learn-category-section">
                <div className="learn-category-header">
                  <div>
                    <h2 style={{ color: config.colour }}>{config.label}</h2>
                    <p>{config.description}</p>
                  </div>
                </div>
                <div className="learn-clusters-grid">
                  {Object.entries(clusters).map(([cluster, clusterPages]) => {
                    const pillar = clusterPages.find(p => p.page_type === 'pillar')
                    const others = clusterPages.filter(p => p.page_type === 'cluster').slice(0, 6)
                    return (
                      <div key={cluster} className="learn-cluster-card">
                        <div className="learn-cluster-name">
                          {cluster.replace(/-/g, ' ')}
                        </div>
                        <ul className="learn-cluster-links">
                          {pillar && (
                            <li>
                              <Link href={`/learn/${pillar.slug}`} className="is-pillar">
                                ★ {pillar.title_en.split(' — ')[0]}
                              </Link>
                              {pillar.hindi_slug && (
                                <Link href={`/blog/${pillar.hindi_slug}`} className="hi-link" hrefLang="hi">
                                  हिंदी में पढ़ें →
                                </Link>
                              )}
                            </li>
                          )}
                          {others.map(p => (
                            <li key={p.slug}>
                              <Link href={`/learn/${p.slug}`}>
                                {p.title_en.split(' — ')[0]}
                              </Link>
                              {p.hindi_slug && (
                                <Link href={`/blog/${p.hindi_slug}`} className="hi-link" hrefLang="hi">
                                  हिंदी में पढ़ें →
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                        {clusterPages.length > 7 && (
                          <Link href={`/learn?cluster=${cluster}`} className="learn-view-all">
                            View all {clusterPages.length} articles →
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Bottom CTA */}
          <div className="learn-bottom-cta">
            <h2>Ready for Your Personal Reading?</h2>
            <p>
              All this knowledge is the foundation. Your Kundli is the application.
              Get a personalised analysis from Rohiit Gupta, Chief Vedic Architect.
            </p>
            <Link href="/birth-form" className="cta-btn">
              ✦ Get My Reading — ₹251
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
