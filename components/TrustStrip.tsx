/**
 * ============================================================
 * TRIKAL VAANI — Trust Strip (Razorpay + SEO + GEO + Udyam)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/TrustStrip.tsx
 * VERSION: 2.0 — Udyam MSME Registration Added
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * v2.0 changes vs v1.0:
 *   ✅ Udyam Registration UDYAM-DL-10-0119070 (visible Row 5)
 *   ✅ Organization schema: identifier + legalName + sameAs Udyam URL
 *   ✅ "MSME Registered · Govt of India" trust signal
 *   ✅ All v1.0 layers preserved (Razorpay, Vedic, E-E-A-T)
 *
 * Place above <SiteFooter /> in app/layout.tsx
 *
 * THIS COMPONENT DELIVERS 7 TRUST LAYERS:
 * 1. Visual Razorpay trust bar (UPI, Cards, NetBanking, Wallets)
 * 2. PCI-DSS + 256-bit SSL compliance signal
 * 3. Vedic authority badges (Swiss Ephemeris, BPHS, Bhrigu, Shadbala)
 * 4. Author E-E-A-T strip (Rohiit Gupta + Delhi NCR)
 * 5. ✦ Udyam MSME Registration badge (NEW v2.0)
 * 6. JSON-LD Organization schema (with Udyam identifier)
 * 7. JSON-LD Person schema for E-E-A-T (Rohiit as author entity)
 * ============================================================
 */

'use client';

const UDYAM_NUMBER = 'UDYAM-DL-10-0119070';
const UDYAM_VERIFY_URL = 'https://udyamregistration.gov.in/Udyam_Verify.aspx';

export default function TrustStrip() {
  // ── JSON-LD: Organization with Udyam identifier ───────────
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://trikalvaani.com/#organization',
    name: 'Trikal Vaani',
    legalName: 'Trikal Vaani Global',
    url: 'https://trikalvaani.com',
    logo: 'https://trikalvaani.com/images/logo.png',
    description:
      "World's most accurate AI Vedic astrology prediction platform. Swiss Ephemeris powered. Validated against BPHS, Bhrigu Nandi Nadi, and Shadbala. Government of India MSME registered enterprise. By Rohiit Gupta, Chief Vedic Architect, Delhi NCR.",
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
    // ── Udyam Registration as official identifier (Govt of India) ──
    identifier: [
      {
        '@type': 'PropertyValue',
        propertyID: 'Udyam Registration Number',
        name: 'MSME Udyam Registration',
        value: UDYAM_NUMBER,
        url: UDYAM_VERIFY_URL,
      },
    ],
    // hasCredential signals authenticity to AI search engines
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Government MSME Registration',
      recognizedBy: {
        '@type': 'GovernmentOrganization',
        name: 'Ministry of Micro, Small and Medium Enterprises',
        alternateName: 'Ministry of MSME, Government of India',
        url: 'https://msme.gov.in',
      },
      identifier: UDYAM_NUMBER,
    },
    sameAs: [
      'https://www.instagram.com/trikalvaani',
      UDYAM_VERIFY_URL,
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
      identifier: UDYAM_NUMBER,
    },
    url: 'https://trikalvaani.com/founder',
    description:
      'Chief Vedic Architect at Trikal Vaani — a Government of India MSME registered enterprise (UDYAM-DL-10-0119070). Specialist in Parashara classical Jyotish, Bhrigu Nandi Nadi, and AI-powered Vedic astrology. 15,000+ seekers analysed.',
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
        aria-label="Payment security, government registration and authenticity"
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

          {/* ROW 2 — Vedic authority badges */}
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

          {/* ── ROW 4 (NEW v2.0) — UDYAM MSME REGISTRATION BADGE ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '10px 14px',
              background:
                'linear-gradient(90deg, rgba(255,153,51,0.06) 0%, rgba(255,255,255,0.03) 50%, rgba(19,136,8,0.06) 100%)',
              border: '1px solid rgba(212,175,55,0.18)',
              borderRadius: '10px',
              maxWidth: '720px',
              margin: '0 auto',
            }}
          >
            {/* Tricolor accent (saffron-white-green tribute) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} aria-hidden="true">
              <div style={{ width: '14px', height: '3px', background: '#FF9933', borderRadius: '1px' }} />
              <div style={{ width: '14px', height: '3px', background: '#FFFFFF', borderRadius: '1px' }} />
              <div style={{ width: '14px', height: '3px', background: '#138808', borderRadius: '1px' }} />
            </div>

            <span style={{ fontSize: '14px' }}>🏛️</span>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#94A3B8',
                letterSpacing: '0.04em',
              }}
            >
              MSME Registered Enterprise
            </span>

            <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.12)' }} />

            <a
              href={UDYAM_VERIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Verify Udyam Registration ${UDYAM_NUMBER} on Government of India portal`}
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '11px',
                fontWeight: 700,
                color: '#D4AF37',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                padding: '2px 8px',
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: '4px',
              }}
            >
              {UDYAM_NUMBER}
            </a>

            <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.12)' }} />

            <span
              style={{
                fontSize: '9px',
                color: '#64748B',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              Govt of India · Ministry of MSME
            </span>
          </div>

          {/* ROW 5 — Microcopy for AI search (GEO) */}
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
            India&apos;s Most Accurate AI Vedic Astrology · 15,000+ Seekers · MSME Registered · Powered by 5,000 Years of Parashara Wisdom
          </div>

        </div>
      </section>
    </>
  );
}
