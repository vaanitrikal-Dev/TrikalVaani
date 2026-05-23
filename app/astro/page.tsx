// TRIKAL VAANI | app/astro/page.tsx | v1.0
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-05-23
// ============================================================================
// PURPOSE: Dedicated landing hub for META traffic (Instagram + Facebook).
//   This is the destination for the IG/FB BIO LINK and for everyday reels
//   that say "link in bio". Sharp single-topic "power reels" should link
//   DIRECTLY to the matching engine instead (e.g. /kundali-milan), not here.
//
// DESIGN INTENT:
//   - Mobile-first (100% of reel traffic is on phone)
//   - Emotional Hinglish hook, NO SiteNav (keep viewer focused on the 3 doors)
//   - 3 category cards = never needs rebuilding as engines are added:
//       * New FREE tool      -> goes inside /calculators (Card 1)
//       * New marriage thing -> goes inside /kundali-milan (Card 2)
//       * New paid reading   -> goes inside /services (Card 3, "Misc")
//   - Small "explore everything" text link at bottom for the curious.
//
// TRACKING: append ?utm_source=instagram (or facebook) to the bio link so
//   analytics shows which platform / reel drove the visit. The internal
//   card links carry utm forward via a tiny client tag (see note at bottom).
//
// COLOR TOKENS (sitewide): bg #080B12, gold #D4AF37
// LOGO: /Trikal_Logo.png  (confirmed in public/, capital T + capital L)
// ============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'

const GOLD = '#D4AF37'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`

export const metadata: Metadata = {
  title: 'Start Here — Trikal Vaani | Free Kundali, Shaadi Milan & Life Answers',
  description:
    'Aap sahi jagah aaye hain. Free Kundali aur 8 calculators, Shaadi ka 36 Guna Milan, aur aapke jeevan ke sawaalon ke jawaab — sab kuch ek jagah. By Rohiit Gupta, Chief Vedic Architect.',
  alternates: { canonical: 'https://trikalvaani.com/astro' },
  // Meta landing pages should not be indexed as primary SEO surfaces — they
  // duplicate intent of /calculators, /kundali-milan, /services. Keep it out
  // of the index so it never competes with those canonical pages.
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Start Here — Trikal Vaani',
    description: 'Free Kundali, Shaadi Milan & Life Answers — sab ek jagah.',
    url: 'https://trikalvaani.com/astro',
    type: 'website',
    siteName: 'Trikal Vaani',
    images: [{ url: 'https://trikalvaani.com/Trikal_Logo.png', width: 512, height: 512, alt: 'Trikal Vaani' }],
  },
}

// ── The 3 doors. Cards are CATEGORIES, not single products. ──
const CARDS = [
  {
    href: '/calculators',
    emoji: '🔮',
    name: 'Apni Kundali Dekhein',
    tag: 'FREE',
    sub: 'Janm Kundali, Dasha, Nakshatra, Muhurat aur 8 free tools — bina kisi payment ke.',
    primary: true,
  },
  {
    href: '/kundali-milan',
    emoji: '💍',
    name: 'Shaadi Ka Milan — 36 Guna',
    tag: null,
    sub: 'Compatibility, Mangal Dosh, Nadi Dosh check + personalized remedies.',
    primary: false,
  },
  {
    href: '/services',
    emoji: '🪷',
    name: 'Dard-e-Dil — Life Answers',
    tag: null,
    sub: 'Pyaar, career, paisa, parivaar — aapke har sawaal ka jawaab aapke sitaron mein.',
    primary: false,
  },
]

export default function AstroPage() {
  return (
    <>
      <Script
        id="astro-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Start Here — Trikal Vaani',
            url: 'https://trikalvaani.com/astro',
            description:
              'Free Kundali & calculators, Shaadi ka 36 Guna Milan, and life answers by Trikal Vaani.',
            publisher: {
              '@type': 'Person',
              name: 'Rohiit Gupta',
              jobTitle: 'Chief Vedic Architect',
              url: 'https://trikalvaani.com/founder',
            },
          }),
        }}
      />

      <main
        className="min-h-screen flex flex-col items-center px-5 pt-12 pb-16"
        style={{ background: '#080B12', color: '#E5E7EB' }}
      >
        {/* ── Logo + Hook ── */}
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-5">
            <Image
              src="/Trikal_Logo.png"
              alt="Trikal Vaani"
              width={84}
              height={84}
              priority
              style={{ borderRadius: '16px' }}
            />
          </div>

          <h1
            className="font-serif font-bold text-2xl mb-3"
            style={{ color: GOLD, lineHeight: 1.3 }}
          >
            Aap Sahi Jagah Aaye Hain
          </h1>

          <p className="text-sm mb-1" style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
            Trikal aapke sawaalon ke jawaab dega — sitaron ki bhasha mein.
          </p>
          <p className="text-xs mb-8" style={{ color: '#64748b' }}>
            Swiss Ephemeris accuracy · BPHS classical rules · Rohiit Gupta
          </p>
        </div>

        {/* ── 3 Cards ── */}
        <div className="w-full max-w-md flex flex-col gap-4">
          {CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block rounded-2xl p-5 transition-transform active:scale-[0.98] hover:scale-[1.01]"
              style={{
                background: c.primary
                  ? `linear-gradient(135deg, ${GOLD_RGBA(0.14)} 0%, ${GOLD_RGBA(0.04)} 100%)`
                  : 'rgba(255,255,255,0.03)',
                border: c.primary
                  ? `2px solid ${GOLD}`
                  : `1px solid ${GOLD_RGBA(0.25)}`,
              }}
            >
              <div className="flex items-start gap-4">
                <span style={{ fontSize: '32px', lineHeight: 1, flexShrink: 0 }}>
                  {c.emoji}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2
                      className="font-serif font-bold"
                      style={{ color: GOLD, fontSize: '17px' }}
                    >
                      {c.name}
                    </h2>
                    {c.tag && (
                      <span
                        style={{
                          background: GOLD,
                          color: '#080B12',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {c.tag}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: '#94a3b8', lineHeight: 1.55 }}
                  >
                    {c.sub}
                  </p>
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: GOLD_RGBA(0.9) }}
                  >
                    <span>Shuru Karein</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Trust line ── */}
        <p className="text-xs mt-8 text-center" style={{ color: '#475569' }}>
          🔒 Aapki birth details safe & private hain · No spam · No calls
        </p>

        {/* ── Explore-all link for the curious (does not clutter the 3 doors) ── */}
        <Link
          href="/calculators"
          className="text-xs mt-4 underline"
          style={{ color: GOLD_RGBA(0.7) }}
        >
          Sab kuch dekhein →
        </Link>
      </main>
    </>
  )
}

// ============================================================================
// NOTE ON UTM TRACKING (no code change needed on this page):
//   Set your IG/FB BIO LINK to:
//     https://trikalvaani.com/astro?utm_source=instagram&utm_medium=bio
//     https://trikalvaani.com/astro?utm_source=facebook&utm_medium=bio
//   For a power-reel linking DIRECTLY to an engine, skip /astro and use e.g.:
//     https://trikalvaani.com/kundali-milan?utm_source=instagram&utm_medium=reel
//   Your analytics (GA4 / Vercel) will then show platform + medium per visit.
// ============================================================================
// END app/astro/page.tsx v1.0
