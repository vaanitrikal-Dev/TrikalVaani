// TRIKAL VAANI | app/kundali-milan/page.tsx | v1.1
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-05-20
// ============================================================================
// v1.1 CHANGE: Reordered sections so "What's Included" (tier cards) appears
//   directly after the form, BEFORE "The Eight Koots" educational section.
//   New order: GEO -> Form -> What's Included -> Eight Koots -> FAQ -> EEAT.
//   Note: tier SELECTION happens in the form's audience picker (Section 2).
//   The "What's Included" cards are an informational comparison, not clickable.
//   NOTHING ELSE CHANGED.
//
// IRON RULES OBSERVED:
//   - IR-13: KundaliMilanForm v1.0 LOCKED
//   - IR-19: Pricing locked Free/Rs51/Rs101/Rs151
//   - IR-22: PDF + WA/Email/Link sharing as first-class
// ============================================================================

import type { Metadata } from 'next'
import KundaliMilanForm from '@/components/landing/KundaliMilanForm'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'

export const metadata: Metadata = {
  title: 'Kundali Milan - Free 36 Guna Matching & Vedic Compatibility | Trikal Vaani',
  description:
    'Free Kundali Milan with 36 Guna Ashtakoot, Mangal Dosh, Nadi Dosh check. Rs51 Basic Milan, Rs101 Deep Milan with Dos, Donts & 6 personalized remedies. By Rohiit Gupta, Chief Vedic Architect, Delhi NCR. Swiss Ephemeris + BPHS classical rules.',
  keywords: 'kundali matching, kundli milan, 36 guna milan, free kundali matching, ashtakoot, mangal dosh, nadi dosh, vedic compatibility, marriage matching, jyotish milan',
  alternates: {
    canonical: 'https://trikalvaani.com/kundali-milan',
    languages: {
      'en-IN': 'https://trikalvaani.com/kundali-milan',
      'hi-IN': 'https://trikalvaani.com/hi/kundali-milan',
    },
  },
  openGraph: {
    title: 'Kundali Milan - Free 36 Guna Matching & Vedic Compatibility | Trikal Vaani',
    description:
      'Free Kundali Milan with 36 Guna Ashtakoot, Mangal Dosh, Nadi Dosh check. Deep Rs101 readings with personalized remedies by Rohiit Gupta.',
    url: 'https://trikalvaani.com/kundali-milan',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikal Vaani',
    images: [{
      url: 'https://trikalvaani.com/og-kundali-milan.jpg',
      width: 1200, height: 630,
      alt: 'Trikal Vaani Kundali Milan - Free 36 Guna Matching',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kundali Milan - Free 36 Guna Matching | Trikal Vaani',
    description: 'Free Kundali Milan with 36 Guna, Mangal Dosh, Nadi Dosh. Deep Rs101 readings with remedies.',
    images: ['https://trikalvaani.com/og-kundali-milan.jpg'],
  },
}

const GOLD = '#D4AF37'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://trikalvaani.com/kundali-milan#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Kundali Milan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kundali Milan is the Vedic compatibility analysis between two birth charts using the 36 Guna Ashtakoot system. It computes all 8 koots - Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi - plus Mangal Dosh, Nadi Dosh, and Bhakoot Dosh to determine marriage compatibility.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a good Guna score for marriage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Guna score of 18 or above out of 36 is traditionally considered acceptable for marriage. Scores of 24-36 indicate excellent compatibility. Below 18 suggests significant differences but does not necessarily mean the marriage will fail - many couples with low scores have successful marriages with proper remedies.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can we marry with Mangal Dosh?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Mangal Dosh marriages are common and successful. The dosh is neutralized when both partners are Manglik, or when classical exception rules apply (Mars in own sign, certain aspects, after age 28). Trikal Vaani applies all BPHS cancellation rules during analysis.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if Nadi Dosh is present?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nadi Dosh occurs when both partners share the same Nadi (Aadi, Madhya, or Antya). It traditionally indicates health and progeny concerns. However, multiple cancellation rules exist - same rashi but different nakshatra, same nakshatra but different padas. Personalized remedies are provided in the Rs101 Deep Milan tier.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Trikal Vaani Kundali Milan work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enter both partners birth details (date, time, place). Trikal computes both kundalis using Swiss Ephemeris precision, then matches all 8 Ashtakoot koots, checks Mangal, Nadi, and Bhakoot Dosh, and generates a personalized report. Choose Couple, Parent, or Both narrative styles for Rs101-151.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Basic Rs51 and Deep Rs101 Milan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Basic Rs51 Milan includes full 36 Guna breakdown, all dosha analysis, and compatibility verdict. Deep Rs101 Milan adds personalized Dos and Donts, 6 ritual remedies (mantra, daan, vrat, ratna, pooja, muhurat), Dashakoot analysis, Navamsa D9 chart comparison, and audience-specific narrative (Couple or Parent version).',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I get the Kundali Milan report in Hindi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Trikal Vaani offers three language options - Hinglish (Hindi-English mix, default for couples), Pure Hindi (for parent/family version, Sanskrit shloka references included), and English. Choose during the form fill before payment.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is online Kundali Milan reliable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trikal Vaani uses the same Swiss Ephemeris engine used by professional astrologers worldwide, validated against Brihat Parashara Hora Shastra (BPHS) classical sutras. Every reading framework is designed by Rohiit Gupta, Chief Vedic Architect with 15+ years of Vedic study under the Parashara tradition.',
      },
    },
    {
      '@type': 'Question',
      name: 'What remedies are provided for low Guna score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Rs101 Deep Milan tier provides 6 personalized remedies based on detected doshas - specific mantras with count and timing, daan items and recipients, fast days (vrat), gemstones with metal and finger guidance, pujas with location, and exact auspicious muhurat windows for marriage, engagement, and griha pravesh.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is Rohiit Gupta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rohiit Gupta is the Chief Vedic Architect and founder of Trikal Vaani. He has 15+ years of Vedic astrology study under the Parashara BPHS tradition, is based in Delhi NCR, and personally designs every Kundali Milan reading framework that Trikal AI applies to your charts.',
      },
    },
  ],
}

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://trikalvaani.com/services' },
    { '@type': 'ListItem', position: 3, name: 'Kundali Milan', item: 'https://trikalvaani.com/kundali-milan' },
  ],
}

export default function KundaliMilanPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />

      <div className="min-h-screen bg-[#080B12]">
        <SiteNav />
        <main>

          {/* SECTION 1 - GEO DIRECT ANSWER BLOCK */}
          <section className="pt-24 pb-8 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.25)}`,
                color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '16px',
              }}>
                Vedic Compatibility Matching
              </span>
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
                Kundali Milan - Free 36 Guna Matching & <span style={{ color: GOLD }}>Vedic Compatibility</span>
              </h1>
              <p style={{
                color: '#94a3b8', fontSize: '15px', lineHeight: 1.7,
                maxWidth: '720px', margin: '0 auto',
              }}>
                <strong style={{ color: '#cbd5e1' }}>Kundali Milan</strong> is the Vedic compatibility analysis between two birth charts using the{' '}
                <strong style={{ color: '#cbd5e1' }}>36 Guna Ashtakoot system</strong>. Trikal Vaani computes all 8 koots -
                Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi - plus{' '}
                <strong style={{ color: '#cbd5e1' }}>Mangal Dosh, Nadi Dosh, and Bhakoot Dosh</strong> using{' '}
                Swiss Ephemeris precision and BPHS classical rules. Free preview, Rs51 deep analysis, Rs101 with personalized remedies.
              </p>
            </div>
          </section>

          {/* SECTION 2 - THE FORM (conversion surface + tier SELECTION happens here) */}
          <KundaliMilanForm />

          {/* SECTION 3 - WHAT'S INCLUDED (tier comparison) - MOVED UP per v1.1 */}
          <section className="py-16 px-4" style={{ background: 'rgba(13,17,30,0.4)' }}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Tier Comparison
                </p>
                <h2 className="text-white text-3xl font-serif font-bold mb-3">
                  What's Included
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                  Pick your tier inside the form above. Here's what each tier delivers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Free Preview */}
                <div style={{
                  padding: '24px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                    Free Preview
                  </p>
                  <p style={{ color: '#fff', fontSize: '32px', fontWeight: 800, fontFamily: 'Georgia, serif', margin: '8px 0' }}>
                    Rs0
                  </p>
                  <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
                    {['36 Guna score (numeric)', 'Dosha flags (yes/no)', 'Emotional teaser', 'No PDF download'].map(f => (
                      <li key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', color: '#cbd5e1', fontSize: '13px' }}>
                        <span style={{ color: '#94a3b8', flexShrink: 0 }}>+</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Basic Rs51 */}
                <div style={{
                  padding: '24px', borderRadius: '16px',
                  background: GOLD_RGBA(0.06),
                  border: `1px solid ${GOLD_RGBA(0.3)}`,
                }}>
                  <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                    Basic Milan
                  </p>
                  <p style={{ color: GOLD, fontSize: '32px', fontWeight: 800, fontFamily: 'Georgia, serif', margin: '8px 0' }}>
                    Rs51
                  </p>
                  <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
                    {[
                      'Full 36 Guna breakdown',
                      'Mangal + Nadi + Bhakoot analysis',
                      'Compatibility verdict',
                      'PDF download',
                      'WhatsApp + Email share',
                    ].map(f => (
                      <li key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', color: '#e2e8f0', fontSize: '13px' }}>
                        <span style={{ color: GOLD, flexShrink: 0 }}>+</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deep Rs101 */}
                <div style={{
                  padding: '24px', borderRadius: '16px',
                  background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)}, ${GOLD_RGBA(0.04)})`,
                  border: `2px solid ${GOLD}`,
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                    background: GOLD, color: '#080B12',
                    fontSize: '10px', fontWeight: 700,
                    padding: '3px 12px', borderRadius: '12px', whiteSpace: 'nowrap',
                  }}>
                    MOST POPULAR
                  </div>
                  <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                    Deep Milan
                  </p>
                  <p style={{ color: '#fff', fontSize: '32px', fontWeight: 800, fontFamily: 'Georgia, serif', margin: '8px 0' }}>
                    Rs101 <span style={{ color: '#94a3b8', fontSize: '14px' }}>/ Rs151 both</span>
                  </p>
                  <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
                    {[
                      'Everything in Basic',
                      'Couple OR Parent narrative',
                      'Personalized Dos & Donts',
                      '6 Ritual remedies',
                      'Navamsa D9 + Dashakoot',
                      'Auspicious muhurat windows',
                    ].map(f => (
                      <li key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', color: '#fff', fontSize: '13px' }}>
                        <span style={{ color: GOLD, flexShrink: 0 }}>+</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </section>

          {/* SECTION 4 - EDUCATIONAL CONTENT (36 Guna explained) */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  The Eight Koots
                </p>
                <h2 className="text-white text-3xl font-serif font-bold mb-3">
                  36 Guna Ashtakoot Explained
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                  The classical Ashtakoot system from Brihat Parashara Hora Shastra. Each koot measures one dimension of marriage compatibility. Maximum score: 36.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Varna',        max: 1, desc: 'Spiritual evolution compatibility' },
                  { name: 'Vashya',       max: 2, desc: 'Mutual attraction and natural influence' },
                  { name: 'Tara',         max: 3, desc: 'Birth-star (nakshatra) compatibility - health & well-being' },
                  { name: 'Yoni',         max: 4, desc: 'Sexual and intimate compatibility' },
                  { name: 'Graha Maitri', max: 5, desc: 'Mental and intellectual compatibility' },
                  { name: 'Gana',         max: 6, desc: 'Temperament - Deva, Manushya, Rakshasa' },
                  { name: 'Bhakoot',      max: 7, desc: 'Wealth, family, and progeny' },
                  { name: 'Nadi',         max: 8, desc: 'Health, progeny, and genetic compatibility' },
                ].map((k, i) => (
                  <div key={k.name}
                    style={{
                      padding: '16px 18px', borderRadius: '12px',
                      background: 'rgba(13,17,30,0.6)',
                      border: `1px solid ${GOLD_RGBA(0.15)}`,
                    }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 style={{ color: GOLD, fontSize: '15px', fontWeight: 700, margin: 0 }}>
                        {i + 1}. {k.name}
                      </h3>
                      <span style={{
                        color: '#080B12', background: GOLD, padding: '2px 10px',
                        borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                      }}>
                        {k.max} {k.max === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                      {k.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: GOLD_RGBA(0.04), borderRadius: '12px', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
                <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
                  Beyond the 36 Guna, Trikal also checks <strong style={{ color: GOLD }}>Mangal Dosh, Nadi Dosh, Bhakoot Dosh, Rajju Dosh, and Vedha Dosh</strong> with full BPHS classical cancellation rules applied.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 5 - FAQ */}
          <section className="py-16 px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Common Questions
                </p>
                <h2 className="text-white text-3xl font-serif font-bold">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-3">
                {FAQ_SCHEMA.mainEntity.map((q, i) => (
                  <details key={i}
                    style={{
                      padding: '16px 20px', borderRadius: '12px',
                      background: 'rgba(13,17,30,0.6)',
                      border: `1px solid ${GOLD_RGBA(0.15)}`,
                    }}>
                    <summary style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, cursor: 'pointer', listStyle: 'none' }}>
                      {q.name}
                    </summary>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, marginTop: '12px', marginBottom: 0 }}>
                      {q.acceptedAnswer.text}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 6 - E-E-A-T AUTHOR BLOCK */}
          <section className="py-12 px-4">
            <div className="max-w-3xl mx-auto">
              <div style={{
                display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap',
                padding: '24px', borderRadius: '16px',
                background: `linear-gradient(135deg, ${GOLD_RGBA(0.06)}, transparent)`,
                border: `1px solid ${GOLD_RGBA(0.2)}`,
              }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: GOLD_RGBA(0.15),
                  border: `2px solid ${GOLD_RGBA(0.4)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: GOLD, fontSize: '24px', fontWeight: 800, fontFamily: 'Georgia, serif',
                  flexShrink: 0,
                }}>
                  RG
                </div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                    Reading Framework Designed By
                  </p>
                  <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
                    Rohiit Gupta - Chief Vedic Architect
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                    15+ years of Vedic study under the <strong style={{ color: '#cbd5e1' }}>Parashara BPHS</strong> tradition.
                    Founder of Trikal Vaani. Delhi NCR-based Vedic astrologer accountable for every
                    Kundali Milan reading framework that Trikal AI applies to your charts.{' '}
                    <a href="/founder" style={{ color: GOLD, textDecoration: 'none' }}>Read full credentials -&gt;</a>
                  </p>
                </div>
              </div>
            </div>
          </section>

        </main>
        <SiteFooter />
      </div>
    </>
  )
}

// END app/kundali-milan/page.tsx v1.1
