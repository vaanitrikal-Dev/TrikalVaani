// ============================================================
//  Trikaal Vaani — Vivah Muhurat 2026 (Shubh Marriage Dates)
//  File: app/vivah-muhurat-2026/page.tsx
//  Author: Rohiit Gupta, Chief Vedic Architect
//  Type:  Server Component (SSR + ISR) — SEO + GEO optimised
//  Data:  Supabase muhurat_windows (forbidden) + VM /vivah-muhurat
//  v1.0
// ============================================================

import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { createClient } from '@supabase/supabase-js';
import { callVM } from '@/lib/callVM';
import type { Metadata } from 'next';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;
const BG = '#080B12';
const YEAR = 2026;
const VM_URL = process.env.VM_ENGINE_URL || 'http://34.47.182.227:8001';
const SITE = 'https://trikalvaani.com';

// refresh once a day (dates are fixed for the year, panchang is stable)
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Vivah Muhurat 2026 — Shubh Marriage Dates with Time, Nakshatra & Lagna | Trikaal Vaani',
  description:
    'Authentic strict-classical Vivah Muhurat 2026 — exact shubh marriage dates with muhurat time, nakshatra, tithi and lagna. Computed by Parashara BPHS rules, excluding Kharmas, Adhik Maas, Shukra Ast and Chaturmas. By Rohiit Gupta, Chief Vedic Architect.',
  alternates: { canonical: `${SITE}/vivah-muhurat-2026` },
  openGraph: {
    title: 'Vivah Muhurat 2026 — Shubh Marriage Dates | Trikaal Vaani',
    description:
      'Strict-classical Vivah Muhurat 2026 dates with exact time, nakshatra, tithi and lagna. Parashara BPHS based.',
    url: `${SITE}/vivah-muhurat-2026`,
    type: 'article',
    images: [`${SITE}/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

interface Muhurat {
  date: string;
  weekday: string;
  nakshatra: string;
  tithi: string;
  muhurat_start: string;
  muhurat_end: string;
  lagna: string;
  lagna_quality: string;
}
interface WindowRow {
  start_date: string;
  end_date: string;
  window_type: string;
  label: string;
  applies_to: string[] | null;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

async function getData(): Promise<{ muhurats: Muhurat[]; windows: WindowRow[] }> {
  let windows: WindowRow[] = [];
  let forbidden_ranges: string[][] = [];

  // 1 — forbidden windows from Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data } = await supabase
      .from('muhurat_windows')
      .select('start_date,end_date,window_type,label,applies_to')
      .eq('year', YEAR)
      .order('start_date', { ascending: true });
    windows = (data as WindowRow[]) ?? [];
    forbidden_ranges = windows
      .filter((w) => !w.applies_to || w.applies_to.includes('vivah'))
      .map((w) => [w.start_date, w.end_date]);
  } catch {
    /* proceed with no windows rather than fail the page */
  }

  // 2 — strict muhurat dates from the VM engine
  let muhurats: Muhurat[] = [];
  try {
    const res = await callVM(`${VM_URL}/vivah-muhurat`, {
      method: 'POST',
      body: JSON.stringify({ year: YEAR, month: 0, forbidden_ranges }),
      signal: AbortSignal.timeout(30000),
    });
    if (res.ok) {
      const json = await res.json();
      muhurats = (json?.muhurats as Muhurat[]) ?? [];
    }
  } catch {
    /* VM unreachable — page still renders content + windows */
  }

  return { muhurats, windows };
}

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return { day: d.getDate(), month: d.getMonth(), monthName: MONTHS[d.getMonth()] };
}
function crossesMidnight(start: string, end: string) {
  return /PM/i.test(start) && /AM/i.test(end);
}
function qualityColor(q: string) {
  if (q.startsWith('Sthira')) return '#4ADE80';
  if (q.startsWith('Dwiswabhava')) return GOLD;
  return '#94A3B8';
}

export default async function VivahMuhurat2026Page() {
  const { muhurats, windows } = await getData();

  // group muhurats by month index
  const byMonth: Record<number, Muhurat[]> = {};
  for (const m of muhurats) {
    const { month } = fmtDate(m.date);
    (byMonth[month] ||= []).push(m);
  }
  const activeMonths = Object.keys(byMonth).map(Number).sort((a, b) => a - b);
  const total = muhurats.length;
  const sthiraCount = muhurats.filter((m) => m.lagna_quality.startsWith('Sthira')).length;

  // ── FAQ + JSON-LD (entity-rich, brand-consistent) ──────────
  const faqs = [
    {
      q: 'What are the best marriage (vivah) dates in 2026?',
      a: `In 2026 there are ${total} strictly auspicious vivah muhurats, spread across February to December. Marriage seasons open after February 17 and pause during Adhik Maas (May 17 to June 15) and Chaturmas (July 25 to November 20), resuming after Devuthani Ekadashi on November 20.`,
    },
    {
      q: 'Why are there no vivah dates in August, September and October 2026?',
      a: 'These months fall inside Chaturmas — the four-month sleep period of Lord Vishnu (Devshayani to Devuthani Ekadashi). By classical Sanatan tradition no Hindu marriage is solemnised during Chaturmas, so Trikaal Vaani shows zero vivah dates in this window.',
    },
    {
      q: 'What is Kharmas and why are those dates excluded?',
      a: 'Kharmas (Malmas) is the period when the Sun transits Dhanu (Sagittarius) or Meen (Pisces). All auspicious sanskars including vivah are paused. In 2026 Kharmas runs Jan 1 to 14, Mar 15 to Apr 14 and Dec 17 to 31.',
    },
    {
      q: 'Are these vivah muhurat dates personalised to my kundli?',
      a: 'No — these are the general shuddha (clean) muhurats valid for everyone, based on panchang. For a personalised muhurat that also harmonises with both partners janma rashi, nakshatra and dosha, an individual consultation is recommended.',
    },
    {
      q: 'What makes a Vivah Muhurat auspicious in Vedic astrology?',
      a: 'A true vivah muhurat needs an auspicious nakshatra (Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Mula, Uttara Ashadha, Uttara Bhadrapada or Revati), a favourable tithi and vaar, absence of Bhadra and forbidden yogas, and a clean lagna — ideally a fixed (sthira) sign.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'Trikaal Vaani',
        legalName: 'Trikal Vaani',
        url: SITE,
        logo: `${SITE}/og-default.jpg`,
        founder: { '@id': `${SITE}/#rohiit` },
        sameAs: [
          'https://www.instagram.com/trikaalvaani',
          'https://www.youtube.com/@TrikaalVaani',
          'https://www.facebook.com/trikaalvaani',
        ],
      },
      {
        '@type': 'Person',
        '@id': `${SITE}/#rohiit`,
        name: 'Rohiit Gupta',
        jobTitle: 'Chief Vedic Architect',
        worksFor: { '@id': `${SITE}/#organization` },
        knowsAbout: ['Vedic Astrology', 'Jyotish', 'Muhurat', 'Parashara BPHS', 'Vivah Muhurat'],
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE}/vivah-muhurat-2026`,
        url: `${SITE}/vivah-muhurat-2026`,
        name: 'Vivah Muhurat 2026 — Shubh Marriage Dates with Time, Nakshatra & Lagna',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#organization` },
        author: { '@id': `${SITE}/#rohiit` },
        publisher: { '@id': `${SITE}/#organization` },
        inLanguage: 'en-IN',
        description:
          'Strict-classical Vivah Muhurat 2026 dates with exact time, nakshatra, tithi and lagna, computed by Parashara BPHS rules.',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: 'Trikaal Vaani',
        publisher: { '@id': `${SITE}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Vivah Muhurat 2026', item: `${SITE}/vivah-muhurat-2026` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <main style={{ background: BG, color: '#E2E8F0', minHeight: '100vh' }}>
      <SiteNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: GOLD_RGBA(0.7), marginBottom: 24 }}>
          <Link href="/" style={{ color: GOLD_RGBA(0.7), textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#94A3B8' }}>Vivah Muhurat 2026</span>
        </nav>

        {/* Hero */}
        <header style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 13, letterSpacing: 2, color: GOLD, textTransform: 'uppercase', marginBottom: 12 }}>
            🔱 Shubh Vivah Muhurat
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(30px,5vw,46px)', color: '#F8FAFC', margin: '0 0 14px', lineHeight: 1.15 }}>
            Vivah Muhurat 2026
          </h1>
          <p style={{ fontSize: 17, color: '#94A3B8', maxWidth: 640, margin: '0 auto' }}>
            Authentic strict-classical marriage muhurats — with exact time, nakshatra, tithi &amp; lagna.
          </p>
        </header>

        {/* GEO direct answer (speakable) */}
        <section
          className="tv-aeo-answer"
          style={{
            background: `linear-gradient(135deg, ${GOLD_RGBA(0.08)}, ${GOLD_RGBA(0.02)})`,
            border: `1px solid ${GOLD_RGBA(0.25)}`,
            borderRadius: 16,
            padding: '24px 26px',
            marginBottom: 40,
          }}
        >
          <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.7, color: '#E2E8F0' }}>
            The most auspicious <strong style={{ color: GOLD }}>Vivah Muhurat 2026</strong> dates fall between
            <strong> February 18</strong> and <strong>December 16</strong>, excluding the forbidden periods of
            <strong> Kharmas</strong>, <strong>Adhik Maas</strong> (May 17–June 15) and <strong>Chaturmas</strong> (July 25–November 20).
            Trikaal Vaani lists <strong style={{ color: GOLD }}>{total} strictly shubh muhurats</strong> for the year — each computed by
            Parashara BPHS rules (auspicious nakshatra, tithi, vaar, Bhadra-free window) with exact muhurat timing and lagna.
          </p>
        </section>

        {/* Quick stats */}
        <section style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
          {[
            { n: total, l: 'Total Shubh Dates' },
            { n: sthiraCount, l: 'With Best (Sthira) Lagna' },
            { n: activeMonths.length, l: 'Active Months' },
            { n: '11', l: 'Allowed Nakshatras' },
          ].map((s, i) => (
            <div key={i} style={{ flex: '1 1 140px', background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.15)}`, borderRadius: 14, padding: '18px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 30, color: GOLD }}>{s.n}</div>
              <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </section>

        {/* Month-wise dates */}
        {total === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, border: `1px dashed ${GOLD_RGBA(0.25)}`, borderRadius: 14, color: '#94A3B8', marginBottom: 44 }}>
            Muhurat dates are being refreshed. Please check back shortly.
          </div>
        ) : (
          activeMonths.map((mi) => (
            <section key={mi} style={{ marginBottom: 38 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: '#F8FAFC', borderBottom: `1px solid ${GOLD_RGBA(0.2)}`, paddingBottom: 10, marginBottom: 18 }}>
                {MONTHS[mi]} 2026
                <span style={{ fontSize: 14, color: GOLD, marginLeft: 10 }}>
                  ({byMonth[mi].length} {byMonth[mi].length === 1 ? 'date' : 'dates'})
                </span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
                {byMonth[mi].map((m, idx) => {
                  const { day } = fmtDate(m.date);
                  return (
                    <div key={idx} style={{ background: GOLD_RGBA(0.04), border: `1px solid ${GOLD_RGBA(0.16)}`, borderRadius: 14, padding: '18px 18px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: 34, color: GOLD, lineHeight: 1 }}>{day}</span>
                        <div>
                          <div style={{ fontSize: 15, color: '#F8FAFC', fontWeight: 600 }}>{MONTHS[mi]}</div>
                          <div style={{ fontSize: 12.5, color: '#94A3B8' }}>{m.weekday}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13.5 }}>
                        <Row label="Muhurat">
                          <span style={{ color: '#F8FAFC' }}>
                            {m.muhurat_start} – {m.muhurat_end}
                            {crossesMidnight(m.muhurat_start, m.muhurat_end) && (
                              <span style={{ color: '#94A3B8', fontSize: 11 }}> (+1 day)</span>
                            )}
                          </span>
                        </Row>
                        <Row label="Nakshatra"><span style={{ color: '#E2E8F0' }}>{m.nakshatra}</span></Row>
                        <Row label="Tithi"><span style={{ color: '#E2E8F0' }}>{m.tithi}</span></Row>
                        <Row label="Lagna">
                          <span style={{ color: '#E2E8F0' }}>
                            {m.lagna}{' '}
                            <span style={{ color: qualityColor(m.lagna_quality), fontSize: 11.5 }}>
                              • {m.lagna_quality}
                            </span>
                          </span>
                        </Row>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}

        {/* Personalised CTA */}
        <section style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)}, ${GOLD_RGBA(0.03)})`, border: `1px solid ${GOLD_RGBA(0.3)}`, borderRadius: 16, padding: '28px 26px', textAlign: 'center', margin: '12px 0 48px' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#F8FAFC', margin: '0 0 10px' }}>
            Want the perfect date for <em>your</em> wedding?
          </h3>
          <p style={{ color: '#94A3B8', maxWidth: 560, margin: '0 auto 18px', fontSize: 15 }}>
            These are the general shuddha muhurats. For a date that also harmonises with both partners janma rashi,
            nakshatra and Manglik status, start with a Kundali Milan.
          </p>
          <Link href="/kundali-milan" style={{ display: 'inline-block', background: GOLD, color: '#1A1206', fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}>
            Check Kundali Milan →
          </Link>
        </section>

        {/* Forbidden periods */}
        {windows.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#F8FAFC', marginBottom: 8 }}>
              Forbidden Periods for Vivah in 2026
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 15, marginBottom: 20 }}>
              No marriage muhurat is given during these windows — by strict Sanatan and Parashara tradition.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {windows.map((w, i) => (
                <div key={i} style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 14.5, color: '#F8FAFC', fontWeight: 600, marginBottom: 4 }}>{w.label}</div>
                  <div style={{ fontSize: 13, color: '#94A3B8' }}>
                    {fmtDate(w.start_date).day} {fmtDate(w.start_date).monthName} – {fmtDate(w.end_date).day} {fmtDate(w.end_date).monthName}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pillar content */}
        <article style={{ fontSize: 15.5, lineHeight: 1.8, color: '#CBD5E1', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#F8FAFC', marginBottom: 14 }}>
            What is a Vivah Muhurat?
          </h2>
          <p style={{ marginBottom: 18 }}>
            In Vedic astrology a <strong style={{ color: '#F8FAFC' }}>vivah muhurat</strong> is the precise, astrologically pure
            moment at which a marriage is solemnised. Sanatan tradition holds that the planetary configuration at the time of
            vivah shapes the harmony, longevity and prosperity of the union — so the muhurat is chosen with great care, not convenience.
          </p>
          <p style={{ marginBottom: 18 }}>
            A genuine muhurat must satisfy several conditions at once: an auspicious <strong style={{ color: '#F8FAFC' }}>nakshatra</strong> (the
            Moon in Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Mula, Uttara Ashadha, Uttara Bhadrapada or Revati),
            a favourable <strong style={{ color: '#F8FAFC' }}>tithi</strong> and <strong style={{ color: '#F8FAFC' }}>vaar</strong> (weekday),
            the absence of <strong style={{ color: '#F8FAFC' }}>Bhadra</strong> (Vishti karana) and forbidden yogas, and a clean rising
            <strong style={{ color: '#F8FAFC' }}> lagna</strong> — ideally a fixed (sthira) sign such as Vrishabh, Simha, Vrischik or Kumbh.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#F8FAFC', margin: '30px 0 14px' }}>
            Why our list is shorter — and more trustworthy
          </h2>
          <p style={{ marginBottom: 18 }}>
            Many sites publish 60+ marriage dates a year by relaxing the rules — ignoring Shukra Ast (Venus combustion),
            permitting rikta tithis, or overlooking Bhadra. Trikaal Vaani follows the <strong style={{ color: '#F8FAFC' }}>strict Parashara
            standard</strong>. We exclude every Kharmas, Adhik Maas, Chaturmas and combustion window, and we reject any day where the
            auspicious nakshatra and tithi do not actually overlap during clean hours. The result is a deliberately smaller,
            <strong style={{ color: GOLD }}> defensible</strong> set of {total} muhurats — the ones a careful family astrologer would actually approve.
          </p>
        </article>

        {/* FAQ */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#F8FAFC', marginBottom: 18 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ background: GOLD_RGBA(0.04), border: `1px solid ${GOLD_RGBA(0.14)}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 15.5, color: '#F8FAFC', fontWeight: 600, marginBottom: 7 }}>{f.q}</div>
                <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* EEAT author */}
        <section style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.18)}`, borderRadius: 14, padding: '20px 22px', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: GOLD_RGBA(0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🔱</div>
          <div>
            <div style={{ fontSize: 16, color: '#F8FAFC', fontWeight: 700 }}>Rohiit Gupta</div>
            <div style={{ fontSize: 13, color: GOLD, marginBottom: 8 }}>Chief Vedic Architect, Trikaal Vaani</div>
            <p style={{ fontSize: 13.5, color: '#94A3B8', margin: 0, lineHeight: 1.7 }}>
              16+ years of personal Vedic astrology practice in the Parashara BPHS tradition. Every muhurat on this page is
              computed on a self-hosted Swiss Ephemeris engine using Lahiri ayanamsa — no third-party API, no shortcuts.
            </p>
          </div>
        </section>

        {/* Internal links */}
        <section>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#F8FAFC', marginBottom: 14 }}>
            Related Free Tools
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { href: '/kundali-milan', t: 'Kundali Milan', d: 'Guna Milan + Manglik + Dosha' },
              { href: '/calculators/free-child-birth-muhurat-calculator', t: 'Child Birth Muhurat', d: 'Auspicious delivery time' },
              { href: '/manglik-dosh', t: 'Manglik Dosh Check', d: 'Mangal dosha analysis' },
              { href: '/kundli', t: 'Free Kundli', d: 'Full birth chart + dasha' },
            ].map((l, i) => (
              <Link key={i} href={l.href} style={{ background: GOLD_RGBA(0.04), border: `1px solid ${GOLD_RGBA(0.14)}`, borderRadius: 12, padding: '14px 16px', textDecoration: 'none', display: 'block' }}>
                <div style={{ fontSize: 14.5, color: GOLD, fontWeight: 600 }}>{l.t} →</div>
                <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 3 }}>{l.d}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      {children}
    </div>
  );
}
