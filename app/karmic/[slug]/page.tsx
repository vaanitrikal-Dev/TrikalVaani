/**
 * ============================================================
 * TRIKAL VAANI — Karmic Background Reading — Result Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/karmic/[slug]/page.tsx
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Per Strategic Plan v2.0 §4. Renders the 6 karmic dimensions
 * from the marker-delimited narrative produced by /api/karmic-reading.
 *
 * Private page (noindex). Mirrors Milan result page pattern:
 *   force-dynamic, ensure-generation-on-load, Maa Shakti block, share.
 * ============================================================
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export const dynamic    = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface KarmicRow {
  slug:             string;
  language:         string;
  person_data:      { name?: string; place?: string; cityName?: string; dob?: string; tob?: string };
  gemini_narrative: string | null;
  geo_answer:       string | null;
  source_milan_slug: string | null;
  pdf_url:          string | null;
  created_at:       string;
}

// ── Dimension marker headings (must match the prompt EXACTLY) ──
const DIMENSION_MARKERS: { marker: string; title: string; icon: string }[] = [
  { marker: '═══ 1. CORE PERSONALITY ═══',                title: 'Core Personality',                 icon: '🪔' },
  { marker: '═══ 2. FIDELITY & RELATIONSHIP CONDUCT ═══',  title: 'Fidelity & Relationship Conduct',  icon: '💗' },
  { marker: '═══ 3. FINANCIAL BEHAVIOUR ═══',              title: 'Financial Behaviour',              icon: '🪙' },
  { marker: '═══ 4. FAMILY & PARENTAL RESPECT ═══',        title: 'Family & Parental Respect',        icon: '🏠' },
  { marker: '═══ 5. HIDDEN TENDENCIES & KARMIC BAGGAGE ═══', title: 'Hidden Tendencies & Karmic Baggage', icon: '🌑' },
  { marker: '═══ 6. MARRIAGE OUTLOOK & LONGEVITY ═══',     title: 'Marriage Outlook & Longevity',     icon: '🔱' },
];
const MAA_SHAKTI_MARKER = '═══ MAA SHAKTI ═══';

// ── Trigger generation if missing ─────────────────────────────
async function ensureReading(slug: string, current: string | null): Promise<string | null> {
  if (current && current.length > 200) return current;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trikalvaani.com';
    const res = await fetch(`${baseUrl}/api/karmic-reading`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ slug }),
      cache:   'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.narrative ?? null;
  } catch {
    return null;
  }
}

// ── Split the narrative into 6 dimensions + opening + Maa Shakti ──
function parseReading(narrative: string): {
  opening: string;
  dimensions: { title: string; icon: string; body: string }[];
  maaShakti: string;
} {
  let working = narrative;
  let maaShakti = '';

  // Pull Maa Shakti tail first
  if (working.includes(MAA_SHAKTI_MARKER)) {
    const [before, after] = working.split(MAA_SHAKTI_MARKER);
    working   = before;
    maaShakti = (after ?? '').trim();
  }

  // Opening = text before the first dimension marker
  let opening = '';
  const firstMarker = DIMENSION_MARKERS[0].marker;
  if (working.includes(firstMarker)) {
    const [op, rest] = working.split(firstMarker);
    opening = op.trim();
    working = firstMarker + rest;
  }

  // Split each dimension
  const dimensions: { title: string; icon: string; body: string }[] = [];
  for (let i = 0; i < DIMENSION_MARKERS.length; i++) {
    const cur  = DIMENSION_MARKERS[i].marker;
    const next = DIMENSION_MARKERS[i + 1]?.marker;
    if (!working.includes(cur)) continue;
    const afterCur = working.split(cur)[1] ?? '';
    const body = next && afterCur.includes(next)
      ? afterCur.split(next)[0]
      : afterCur;
    dimensions.push({
      title: DIMENSION_MARKERS[i].title,
      icon:  DIMENSION_MARKERS[i].icon,
      body:  body.trim(),
    });
  }

  return { opening, dimensions, maaShakti };
}

function paras(text: string) {
  return text.split('\n\n').map((p) => p.trim()).filter(Boolean);
}

// ── Metadata (private — noindex) ──────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  return {
    title:       'Karmic Background Reading · Trikal Vaani',
    description: 'Your private Karmic Background Reading by Trikal Vaani.',
    robots:      { index: false, follow: false },
  };
}

// ── PAGE ──────────────────────────────────────────────────────
export default async function KarmicResultPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: reading, error } = await supabase
    .from('karmic_readings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !reading) notFound();

  const r = reading as KarmicRow;
  const personName  = r.person_data?.name ?? 'This Soul';
  const personPlace = r.person_data?.place ?? r.person_data?.cityName ?? '';

  const narrative = await ensureReading(r.slug, r.gemini_narrative);
  const parsed = narrative ? parseReading(narrative) : null;

  const resultUrl = `https://trikalvaani.com/karmic/${r.slug}`;
  const waText = encodeURIComponent(
    `Jai Mahakaal! Meri Karmic Background Reading dekho — Trikal Vaani.\n${resultUrl}\n\nJai Maa Shakti!`
  );

  return (
    <div className="min-h-screen bg-[#080B12] text-[#f5f5f5]">

      {/* ─────────── HERO ─────────── */}
      <header className="relative overflow-hidden border-b border-[#D4AF37]/20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1120] via-[#080B12] to-[#080B12] opacity-90" />
        <div className="relative max-w-4xl mx-auto px-5 py-12 sm:py-16 text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs tracking-[0.25em] uppercase">
            Trikal Vaani · Karmic Background Reading
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">
            {personName}
          </h1>
          {personPlace && (
            <p className="mt-4 text-sm text-gray-400 tracking-wide">{personPlace}</p>
          )}
          <p className="mt-2 text-xs text-gray-500 tracking-widest uppercase">
            Bhrigu Nandi Nadi · 6 Karmic Dimensions · ₹251
          </p>
        </div>
      </header>

      {/* ─────────── OPENING / GEO ─────────── */}
      {parsed?.opening && (
        <section className="max-w-3xl mx-auto px-5 pt-8">
          <div className="bg-[#0d1120]/60 border-l-4 border-[#D4AF37] rounded-r-xl p-5 sm:p-6">
            {paras(parsed.opening).map((p, i) => (
              <p key={i} className="text-base sm:text-lg leading-relaxed text-gray-100 mb-3 last:mb-0">{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* ─────────── GENERATING STATE ─────────── */}
      {!narrative && (
        <section className="max-w-3xl mx-auto px-5 py-16">
          <div className="text-center text-gray-400">
            <p className="text-3xl mb-3">🔱</p>
            <p className="text-lg">Aapki Karmic Reading taiyaar ho rahi hai...</p>
            <p className="text-sm mt-2 text-gray-500">Trikal aapki kundali ke 6 karmic aayam padh raha hai. Please refresh in 30-40 seconds.</p>
          </div>
        </section>
      )}

      {/* ─────────── 6 DIMENSIONS ─────────── */}
      {parsed && parsed.dimensions.length > 0 && (
        <section className="max-w-3xl mx-auto px-5 py-8 sm:py-10 space-y-6">
          {parsed.dimensions.map((dim, i) => (
            <article
              key={i}
              className="karmic-dim bg-[#0d1120]/60 border border-[#D4AF37]/15 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{dim.icon}</span>
                <h2 className="text-lg sm:text-xl font-semibold text-[#D4AF37]">
                  <span className="text-gray-500 mr-2">{i + 1}.</span>{dim.title}
                </h2>
              </div>
              {paras(dim.body).map((p, j) => (
                <p key={j} className="karmic-para">{p}</p>
              ))}
            </article>
          ))}
        </section>
      )}

      {/* ─────────── MAA SHAKTI (from narrative + permanent CTA) ─────────── */}
      <section className="max-w-3xl mx-auto px-5 py-8">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d1120] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-10 text-center">
          <div className="text-3xl sm:text-4xl mb-3">🔱</div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white">
            Maa Shakti Ki Kripa Banee Rahe
          </h3>
          <p className="text-[#D4AF37] mt-1 text-sm sm:text-base">माँ शक्ति की कृपा बनी रहे</p>
          {parsed?.maaShakti ? (
            <div className="mt-5 text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl mx-auto text-left sm:text-center">
              {paras(parsed.maaShakti).map((p, i) => (
                <p key={i} className="mb-3 last:mb-0">{p}</p>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl mx-auto">
              Is reading ke baad Maa ki <strong className="text-white">Arzi</strong> karein.
              Aur jab samay sahi ho, wapas aaiye <strong className="text-white">Dhanyawad</strong> arpit karne.
            </p>
          )}
          <div className="mt-6">
            <a
              href={`/maa-shakti?ref=karmic-${r.slug}`}
              className="inline-block px-7 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] text-[#080B12] font-semibold tracking-wide transition shadow-lg"
            >
              Maa ko Arzi karein →
            </a>
          </div>
        </div>
      </section>

      {/* ─────────── SHARE + PDF ─────────── */}
      {narrative && (
        <section className="max-w-3xl mx-auto px-5 py-8">
          <div className="text-center mb-5">
            <h3 className="text-xs sm:text-sm text-[#D4AF37] tracking-[0.3em] uppercase">Share &amp; Download</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-[#25D366] text-[#080B12] font-semibold tracking-wide transition hover:opacity-90"
            >
              WhatsApp par share karein
            </a>
            {r.pdf_url && (
              <a
                href={r.pdf_url}
                target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] text-[#080B12] font-semibold tracking-wide transition"
              >
                Download PDF
              </a>
            )}
          </div>
        </section>
      )}

      {/* ─────────── FOOTER ─────────── */}
      <footer className="border-t border-[#D4AF37]/10 mt-8">
        <div className="max-w-4xl mx-auto px-5 py-8 text-center text-xs text-gray-500">
          <p className="text-[#D4AF37] tracking-[0.3em] uppercase">Trikal Vaani</p>
          <p className="mt-2">AI-Powered Vedic Astrology · Rohiit Gupta, Chief Vedic Architect</p>
          <p className="mt-1">MSME · UDYAM-DL-10-0119070 · trikalvaani.com</p>
          <p className="mt-3 text-[10px] text-gray-600 max-w-lg mx-auto leading-relaxed">
            This reading reveals karmic patterns from the birth chart for self-understanding and preparation.
            Trikal reveals patterns — it does not pass judgement on any person.
          </p>
        </div>
      </footer>

      {/* ─────────── INLINE STYLES ─────────── */}
      <style>{`
        .karmic-dim .karmic-para {
          font-size: 1.03rem;
          line-height: 1.9;
          color: #e8e8e8;
          margin: 0 0 1.2rem 0;
          text-align: justify;
        }
        .karmic-dim .karmic-para:last-child { margin-bottom: 0; }
        @media (max-width: 640px) {
          .karmic-dim .karmic-para { font-size: 0.98rem; line-height: 1.8; text-align: left; }
        }
      `}</style>
    </div>
  );
}
