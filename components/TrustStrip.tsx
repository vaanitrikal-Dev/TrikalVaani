/**
 * ============================================================
 * TRIKAL VAANI — Trust Strip (Razorpay + SEO + GEO)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/TrustStrip.tsx
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Place above <SiteFooter /> in app/layout.tsx
 * 
 * THIS COMPONENT DELIVERS 6 TRUST LAYERS:
 * 1. Visual Razorpay trust bar (UPI, Cards, NetBanking, Wallets)
 * 2. PCI-DSS + 256-bit SSL compliance signal
 * 3. Author E-E-A-T strip (Rohiit Gupta + Delhi NCR)
 * 4. Vedic authority badges (Swiss Ephemeris, BPHS, Bhrigu, Shadbala)
 * 5. JSON-LD Organization schema (Google + AI search)
 * 6. JSON-LD Person schema for E-E-A-T (Rohiit as author entity)
 * ============================================================
 */

'use client';

export default function TrustStrip() {
  // ── JSON-LD: Organization + PaymentMethod + Person ────────
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://trikalvaani.com/#organization',
    name: 'Trikal Vaani',
    legalName: 'Trikal Vaani Global',
    url: 'https://trikalvaani.com',
    logo: 'https://trikalvaani.com/images/logo.png',
    description:
      "World's most accurate AI Vedic astrology prediction platform. Swiss Ephemeris powered. Validated against BPHS, Bhrigu Nandi Nadi, and Shadbala. By Rohiit Gupta, Chief Vedic Architect, Delhi NCR.",
    foundingDate: '2026',
    founder: {
      '@type': 'Person',
      '@id': 'https://trikalvaani.com/founder#rohiit-gupta',
      name: 'Rohiit Gupta',
      jobTitle: 'Chief Vedic Architect',
      url: 'https://trikalvaani.com/founder',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Delhi NCR',
      addressRegion: 'Delhi',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9211804111',
      contactType: 'Customer Support',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
    sameAs: [
      'https://www.instagram.com/trikalvaani',
    ],
    paymentAccepted: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'RuPay'],
    currenciesAccepted: 'INR',
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://trikalvaani.com/founder#rohiit-gupta',
    name: 'Rohiit Gupta',
    alternateName: 'Rohit Gupta',
    jobTitle: 'Chief Vedic Architect',
    worksFor: {
      '@type': 'Organization',
      name: 'Trikal Vaani',
      url: 'https://trikalvaani.com',
    },
    url: 'https://trikalvaani.com/founder',
    description:
      'Chief Vedic Architect at Trikal Vaani. Specialist in Parashara classical Jyotish, Bhrigu Nandi Nadi, and AI-powered Vedic astrology. 15,000+ seekers analysed.',
    knowsAbout: [
      'Vedic Astrology',
      'Jyotish Shastra',
      'Brihat Parashara Hora Shastra',
      'Bhrigu Nandi Nadi',
      'Shadbala',
      'Swiss Ephemeris',
      'Vimshottari Dasha',
      'AI Astrology',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Delhi NCR',
      addressCountry: 'IN',
    },
  };

  // ── Razorpay payment widget schema (helps Google understand trust) ──
  const paymentSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://trikalvaani.com/#website',
    url: 'https://trikalvaani.com',
    name: 'Trikal Vaani',
    publisher: { '@id': 'https://trikalvaani.com/#organization' },
    inLanguage: ['en-IN', 'hi-IN'],
  };

  return (
    <>
      {/* ── JSON-LD Schema injection (invisible, for SEO + GEO) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(paymentSchema) }}
      />

      {/* ── VISIBLE TRUST STRIP ── */}
      <section
        aria-label="Payment security and authenticity"
        style={{
          borderTop: '1px solid rgba(212,175,55,0.12)',
          borderBottom: '1px solid rgba(212,175,55,0.08)',
          background: 'linear-gradient(180deg, rgba(8,11,18,0.98) 0%, rgba(13,17,30,0.95) 100%)',
          padding: '20px 16px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >

          {/* ROW 1 — Razorpay payment trust bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '13px' }}>🔒</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#94A3B8',
                  letterSpacing: '0.03em',
                }}
              >
                Secured by
              </span>
              {/* Razorpay wordmark — inline SVG */}
              <svg
                width="74"
                height="16"
                viewBox="0 0 74 16"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Razorpay — Trusted Payment Gateway"
                role="img"
              >
                <text
                  x="0"
                  y="13"
                  fontFamily="Georgia, serif"
                  fontSize="13"
                  fontWeight="700"
                  fill="#3395FF"
                  letterSpacing="0"
                >
                  Razorpay
                </text>
              </svg>
            </div>

            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />

            {/* Payment method pills */}
            {['UPI', 'Cards', 'NetBanking', 'Wallets', 'RuPay'].map((m) => (
              <div
                key={m}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#64748B',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  letterSpacing: '0.04em',
                }}
              >
                {m}
              </div>
            ))}

            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '10px' }}>🛡️</span>
              <span
                style={{
                  fontSize: '10px',
                  color: '#64748B',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                }}
              >
                PCI-DSS Compliant · 256-bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* Divider line */}
          <div
            style={{
              width: '60%',
              maxWidth: '500px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.2) 50%, transparent 100%)',
              margin: '0 auto',
            }}
          />

          {/* ROW 2 — Vedic authority badges (E-E-A-T signal) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {[
              { icon: '⚡', label: 'Swiss Ephemeris' },
              { icon: '📖', label: 'BPHS Classical' },
              { icon: '🔮', label: 'Bhrigu Nandi Nadi' },
              { icon: '⚖️', label: 'Shadbala' },
              { icon: '🌙', label: 'Lahiri Ayanamsha' },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '10px',
                  color: '#94A3B8',
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: '11px' }}>{b.icon}</span>
                <span style={{ letterSpacing: '0.02em' }}>{b.label}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              width: '60%',
              maxWidth: '500px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.2) 50%, transparent 100%)',
              margin: '0 auto',
            }}
          />

          {/* ROW 3 — Author authority strip (E-E-A-T) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              fontSize: '10px',
              color: '#64748B',
            }}
          >
            <span>🔱</span>
            <span style={{ fontWeight: 500 }}>Verified by</span>
            <a
              href="https://trikalvaani.com/founder"
              style={{
                color: '#D4AF37',
                fontWeight: 700,
                textDecoration: 'none',
                letterSpacing: '0.02em',
              }}
            >
              Rohiit Gupta
            </a>
            <span>·</span>
            <span>Chief Vedic Architect</span>
            <span>·</span>
            <span>Delhi NCR, India</span>
            <span>·</span>
            <a
              href="https://wa.me/919211804111"
              style={{ color: '#22C55E', fontWeight: 600, textDecoration: 'none' }}
              aria-label="WhatsApp Trikal Vaani"
            >
              WhatsApp +91 92118 04111
            </a>
          </div>

          {/* ROW 4 — Microcopy for AI search (GEO) */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '9px',
              color: '#475569',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            India&apos;s Most Accurate AI Vedic Astrology · 15,000+ Seekers · Powered by 5,000 Years of Parashara Wisdom
          </div>

        </div>
      </section>
    </>
  );
}
