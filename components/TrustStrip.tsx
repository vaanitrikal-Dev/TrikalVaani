/**
 * ============================================================
 * TRIKAL VAANI — Trust Strip (Visible-Only)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/TrustStrip.tsx
 * VERSION: 3.0 — Schemas removed (owned by layout.tsx) + IR-0 cleanup
 * SIGNED: ROHIIT GUPTA, CEO
 * DATE: 2026-05-27
 * ============================================================
 * v3.0 changes vs v2.0 (CEO-approved, IR-0 compliant):
 *   ✅ ALL 3 JSON-LD SCHEMAS REMOVED. Organization, Person, and WebSite
 *      schemas are owned by layout.tsx (#organization, #rohiit-gupta nested)
 *      and SchemaScript (WebSite). TrustStrip was duplicating + splitting
 *      the entity graph (mismatched Person @id `/founder#rohiit-gupta` vs
 *      layout's `/#rohiit-gupta`). Now a pure visible component.
 *   ✅ BRAND FLIP: "Trikal Vaani" -> "Trikaal Vaani" in visible aria-label.
 *   ✅ FAKE STATS REMOVED (IR-0): no "World's most accurate", no
 *      "15,000+ seekers", no "India's Most Accurate". Kept "5,000 Years
 *      of Parashara Wisdom" — true tradition claim, not fabricated stat.
 *   ✅ DELHI NCR REMOVED (CEO Decision #6): visible "Delhi NCR, India"
 *      gone from Row 3 author strip.
 *   ✅ Microcopy rebuilt for global positioning: India + Worldwide.
 *
 * VISIBLE TRUST LAYERS (5 rows):
 * 1. Razorpay payment trust bar (UPI, Cards, NetBanking, Wallets, RuPay)
 *    + PCI-DSS + 256-bit SSL
 * 2. Vedic authority badges (Swiss Ephemeris, BPHS, Bhrigu Nandi Nadi,
 *    Shadbala, Lahiri Ayanamsha)
 * 3. Author E-E-A-T strip (Rohiit Gupta, Chief Vedic Architect, WhatsApp)
 * 4. Udyam MSME Registration badge (UDYAM-DL-10-0119070, Govt of India)
 * 5. Microcopy line (IR-0 global, honest, no fake stats)
 *
 * Place above <SiteFooter /> in app/layout.tsx
 * ============================================================
 */

'use client';

const UDYAM_NUMBER = 'UDYAM-DL-10-0119070';
const UDYAM_VERIFY_URL = 'https://udyamregistration.gov.in/Udyam_Verify.aspx';

export default function TrustStrip() {
  return (
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
          <a
            href="https://wa.me/919211804111"
            style={{ color: '#22C55E', fontWeight: 600, textDecoration: 'none' }}
            aria-label="WhatsApp Trikaal Vaani"
          >
            WhatsApp +91 92118 04111
          </a>
        </div>

        {/* ROW 4 — UDYAM MSME REGISTRATION BADGE */}
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

        {/* ROW 5 — Honest microcopy (IR-0: global, no fake stats) */}
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
          AI Vedic Astrology · Swiss Ephemeris Precision · MSME Registered · 5,000 Years of Parashara Wisdom · India &amp; Worldwide
        </div>

      </div>
    </section>
  );
}
