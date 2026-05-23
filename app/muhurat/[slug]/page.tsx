/**
 * ============================================================
 * TRIKAL VAANI — Child Birth Muhurat — Paid Result Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/muhurat/[slug]/page.tsx
 * VERSION: 1.0
 * ============================================================
 * Renders the muhurat report from the marker-delimited narrative
 * produced by /api/muhurat-paid. Display-only (payment already done).
 *
 * Private page (noindex). Mirrors Karmic result page pattern:
 *   force-dynamic, ensure-generation-on-load, Maa Shakti block, share.
 *
 * Tiers:  report_101 (no remedy section) | remedies_151 (10 remedies)
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

interface MuhuratRow {
  slug:             string;
  tier:             string;
  language:         string;
  muhurat_data:     { year?: number; month?: number; day?: number; hour?: number; minute?: number; city?: string; hospital?: string };
  vm_data:          any;
  gemini_narrative: string | null;
  geo_answer:       string | null;
  pdf_url:          string | null;
  created_at:       string;
}

// ── Section marker headings (must match the prompt EXACTLY) ──
const SECTION_MARKERS: { marker: string; title: string; icon: string }[] = [
  { marker: '═══ SHUBH MUHURAT ═══',                                         title: 'Shubh Muhurat',                 icon: '🕉️' },
  { marker: "═══ BACHCHE KA SWABHAV (Child's Nature & Potential) ═══",        title: "Child's Nature & Potential",    icon: '🌟' },
  { marker: '═══ JEEVAN KE YOG (Life Path Indications) ═══',                  title: 'Life Path Indications',         icon: '🛤️' },
  { marker: '═══ NAAMAKSHAR & SHUBH NAAM (Lucky Letter & Name Suggestions) ═══', title: 'Lucky Letter & Name Suggestions', icon: '🔤' },
  { marker: '═══ DHYAN DENE YOGYA (Points of Awareness) ═══',                 title: 'Points of Awareness',           icon: '⚠️' },
  { marker: '═══ UPAY (10 Remedies) ═══',                                     title: '10 Remedies',                   icon: '🪔' },
];
const MAA_SHAKTI_MARKER = '═══ MAA SHAKTI ═══';

// ── Trigger generation if missing ─────────────────────────────
async function ensureReport(slug: string, current: string | null): Promise<string | null> {
  if (current && current.length > 200) return current;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trikalvaani.com';
    const res = await fetch(`${baseUrl}/api/muhurat-paid`, {
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

// ── Split narrative into sections + opening + Maa Shakti ──
function parseReport(narrative: string): {
  opening: string;
  sections: { title: string; icon: string; body: string }[];
  maaShakti: string;
} {
  let working = narrative;
  let maaShakti = '';

  if (working.includes(MAA_SHAKTI_MARKER)) {
    const [before, after] = working.split(MAA_SHAKTI_MARKER);
    working   = before;
    maaShakti = (after ?? '').trim();
  }

  // Opening = text before the first section marker
  let opening = '';
  const firstMarker = SECTION_MARKERS[0].marker;
  if (working.includes(firstMarker)) {
    const [op, rest] = working.split(firstMarker);
    opening = op.trim();
    working = firstMarker + rest;
  }

  const sections: { title: string; icon: string; body: string }[] = [];
  for (let i = 0; i < SECTION_MARKERS.length; i++) {
    const cur  = SECTION_MARKERS[i].marker;
    const next = SECTION_MARKERS[i + 1]?.marker;
    if (!working.includes(cur)) continue;
    const afterCur = working.split(cur)[1] ?? '';
    const body = next && afterCur.includes(next)
      ? afterCur.split(next)[0]
      : afterCur;
    sections.push({
      title: SECTION_MARKERS[i].title,
      icon:  SECTION_MARKERS[i].icon,
      body:  body.trim(),
    });
  }

  return { opening, sections, maaShakti };
}

function paras(text: string) {
  return text.split('\n\n').map((p) => p.trim()).filter(Boolean);
}

// ── Metadata (private — noindex) ──────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  return {
    title:       'Child Birth Muhurat Report · Trikal Vaani',
    description: 'Your private Child Birth Muhurat report by Trikal Vaani.',
    robots:      { index: false, follow: false },
  };
}

// ── PAGE ──────────────────────────────────────────────────────
export default async function MuhuratResultPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: reading, error } = await supabase
    .from('muhurat_readings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !reading) notFound();

  const r = reading as MuhuratRow;
  const md = r.muhurat_data ?? {};
  const dateStr = (md.year && md.month && md.day)
    ? `${String(md.day).padStart(2, '0')}-${String(md.month).padStart(2, '0')}-${md.year}`
    : '';
  const timeStr = (md.hour !== undefined && md.minute !== undefined)
    ? `${String(md.hour).padStart(2, '0')}:${String(md.minute).padStart(2, '0')}`
    : '';
  const place = md.hospital || md.city || '';

  const vm = r.vm_data ?? {};
  const score       = vm.score ?? '';
  const band        = vm.band ?? '';
  const lagna       = vm.lagna_sign ?? '';
  const nakshatra   = vm.lagna_nakshatra ?? '';
  const naamakshar  = vm.naamakshar ?? '';

  const tierLabel = r.tier === 'remedies_151'
    ? 'Full Report + 10 Remedies · ₹151'
    : 'Full Muhurat Report · ₹101';

  const narrative = await ensureReport(r.slug, r.gemini_narrative);
  const parsed = narrative ? parseReport(narrative) : null;

  const resultUrl = `https://trikalvaani.com/muhurat/${r.slug}`;
  const waText = encodeURIComponent(
    `Jai Mahakaal! Mera Child Birth Muhurat Report dekho — Trikal Vaani.\n${resultUrl}\n\nJai Maa Shakti!`
  );

  return (
    <div className="min-h-screen bg-[#080B12] text-[#f5f5f5]">

      {/* ─────────── HERO ─────────── */}
      <header className="relative overflow-hidden border-b border-[#D4AF37]/20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1120] via-[#080B12] to-[#080B12] opacity-90" />
        <div className="relative max-w-4xl mx-auto px-5 py-12 sm:py-16 text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs tracking-[0.25em] uppercase">
            Trikal Vaani · Child Birth Muhurat
          </div>
          {timeStr && (
            <h1 className="text-4xl sm:text-6xl font-semibold leading-tight text-[#D4AF37]">
              {timeStr}
            </h1>
          )}
          <p className="mt-3 text-sm text-gray-300">
            {dateStr}{place ? ` · ${place}` : ''}
          </p>
          {(lagna || nakshatra) && (
            <p className="mt-2 text-sm text-gray-400 tracking-wide">
              {lagna && <>Lagna: <span className="text-gray-200">{lagna}</span></>}
              {nakshatra && <> · Nakshatra: <span className="text-gray-200">{nakshatra}</span></>}
              {score && <> · <span className="text-[#D4AF37]">{score}/100 {band}</span></>}
            </p>
          )}
          <p className="mt-3 text-xs text-gray-500 tracking-widest uppercase">
            {tierLabel}
          </p>
        </div>
      </header>

      {/* ─────────── DOCTOR SAFETY ─────────── */}
      <section className="max-w-3xl mx-auto px-5 pt-6">
        <div className="rounded-xl p-4 flex gap-3 bg-[#60a5fa]/8 border border-[#60a5fa]/30">
          <span className="text-xl">🩺</span>
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong className="text-[#93c5fd]">Medical safety comes first.</strong> This muhurat is chosen
            <em> within the safe delivery window your doctor approved</em>. It is guidance to discuss with your
            doctor — never medical advice.
          </p>
        </div>
      </section>

      {/* ─────────── OPENING / GEO ─────────── */}
      {parsed?.opening && (
        <section className="max-w-3xl mx-auto px-5 pt-6">
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
            <p className="text-3xl mb-3">🕉️</p>
            <p className="text-lg">Aapka Muhurat Report taiyaar ho raha hai...</p>
            <p className="text-sm mt-2 text-gray-500">Trikal aapke chune hue shubh muhurat ki kundali padh raha hai. Please refresh in 30-40 seconds.</p>
          </div>
        </section>
      )}

      {/* ─────────── SECTIONS ─────────── */}
      {parsed && parsed.sections.length > 0 && (
        <section className="max-w-3xl mx-auto px-5 py-8 sm:py-10 space-y-6">
          {parsed.sections.map((sec, i) => (
            <article
              key={i}
              className="muhurat-sec bg-[#0d1120]/60 border border-[#D4AF37]/15 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{sec.icon}</span>
                <h2 className="text-lg sm:text-xl font-semibold text-[#D4AF37]">{sec.title}</h2>
              </div>
              {paras(sec.body).map((p, j) => (
                <p key={j} className="muhurat-para">{p}</p>
              ))}
            </article>
          ))}
        </section>
      )}

      {/* ─────────── MAA SHAKTI ─────────── */}
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
              Apne aane wale bachche ke liye Maa ki <strong className="text-white">Arzi</strong> karein.
              Aur jab khushi ka pal aaye, wapas aaiye <strong className="text-white">Dhanyawad</strong> arpit karne.
            </p>
          )}
          <div className="mt-6">
            <a
              href={`/maa-shakti?ref=muhurat-${r.slug}`}
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
            This report describes the life potential indicated by the birth chart of a child born at the chosen
            muhurat, within the doctor-approved window. It is Vedic guidance — not medical advice, and not a guarantee.
          </p>
        </div>
      </footer>

      {/* ─────────── INLINE STYLES ─────────── */}
      <style>{`
        .muhurat-sec .muhurat-para {
          font-size: 1.03rem;
          line-height: 1.9;
          color: #e8e8e8;
          margin: 0 0 1.2rem 0;
          text-align: justify;
        }
        .muhurat-sec .muhurat-para:last-child { margin-bottom: 0; }
        @media (max-width: 640px) {
          .muhurat-sec .muhurat-para { font-size: 0.98rem; line-height: 1.8; text-align: left; }
        }
      `}</style>
    </div>
  );
}
