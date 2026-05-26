/**
 * ============================================================
 * TRIKAL VAANI - Kundali Milan Result Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/milan/[slug]/page.tsx
 * VERSION: 1.3
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * CHANGE LOG (v1.2 → v1.3):
 *   - Added Karmic Background Reading UPSELL block after the reading
 *     (narrative/remedies), BEFORE Maa Shakti. Shown on ALL tiers.
 *     Catches the buyer mid-emotion: "compatibility dekh li, par woh
 *     asliyat mein kaise insaan hain?" → CTA to /karmic-background-reading.
 *   - Pure addition. All existing logic/layout/styles UNCHANGED.
 *
 * CHANGE LOG (v1.1 → v1.2):
 *   - Added MilanRemediesCard after narrative section (PAID tiers only).
 * ============================================================
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import MilanShareButtons   from '@/components/milan/MilanShareButtons';
import MilanManglikBadge   from '@/components/milan/MilanManglikBadge';
import MilanRemediesCard   from '@/components/milan/MilanRemediesCard';

export const dynamic   = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Types ─────────────────────────────────────────────────────
interface PersonManglik {
  is_manglik: boolean;
  strength:   string;
}
interface CombinedManglik {
  status:         string;
  verdict:        string;
  verdict_hi:     string;
  recommendation: string;
}
interface ManglikData {
  bride:    PersonManglik | null;
  groom:    PersonManglik | null;
  combined: CombinedManglik | null;
}

interface RemediesData {
  parashar:       unknown[];
  bhrigu:         unknown[];
  shadbala:       unknown[];
  total_remedies: number;
}

interface MilanRow {
  slug:             string;
  tier:             string;
  audience:         string;
  language:         string;
  bride_data:       { name: string; place: string; dob: string; tob: string };
  groom_data:       { name: string; place: string; dob: string; tob: string };
  ashtakoot_score:  number | null;
  ashtakoot_data:   unknown;
  manglik_data:     ManglikData | null;
  remedies_data:    RemediesData | null;
  gemini_narrative: string | null;
  pdf_url:          string | null;
  created_at:       string;
}

// ── Helpers ───────────────────────────────────────────────────
function tierLabel(tier: string): string {
  return {
    free:            'Free Preview',
    basic_51:        'Basic Milan',
    deep_101_couple: 'Deep Reading — Couple',
    deep_101_parent: 'Deep Reading — Parent',
    both_151:        'Both Versions — Couple + Parent',
  }[tier] ?? tier;
}

function tierPrice(tier: string): string {
  return {
    free:            'Free',
    basic_51:        '₹51',
    deep_101_couple: '₹101',
    deep_101_parent: '₹101',
    both_151:        '₹151',
  }[tier] ?? '';
}

function isFreeTier(tier: string): boolean {
  return tier === 'free';
}

// basic_51 shows score + narrative tease of remedies only — no remedy cards
function showRemedies(tier: string): boolean {
  return ['deep_101_couple', 'deep_101_parent', 'both_151'].includes(tier);
}

function scoreBand(score: number | null): string {
  if (score === null) return '';
  if (score >= 28) return 'Excellent · उत्तम';
  if (score >= 24) return 'Very Good · बहुत अच्छा';
  if (score >= 18) return 'Acceptable · स्वीकार्य';
  if (score >= 13) return 'Needs Remedies · उपाय आवश्यक';
  return 'Serious Doshas · गंभीर';
}

// ── Trigger narrative generation if missing ───────────────────
async function ensureNarrative(slug: string, currentNarrative: string | null): Promise<string | null> {
  if (currentNarrative && currentNarrative.length > 200) return currentNarrative;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trikalvaani.com';
    const res = await fetch(`${baseUrl}/api/milan-narrative`, {
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

// ── Render narrative HTML ─────────────────────────────────────
function renderNarrative(narrative: string, audience: string) {
  if (audience === 'both' && narrative.includes('═══ COUPLE VERSION ═══')) {
    const [, restA] = narrative.split('═══ COUPLE VERSION ═══');
    const [coupleBlock, parentBlock] = restA.split('═══ PARENT VERSION ═══');
    return (
      <>
        <div className="narrative-version-label">For The Couple · Hinglish</div>
        {coupleBlock.trim().split('\n\n').filter(Boolean).map((p, i) => (
          <p key={`c-${i}`} className="narrative-para">{p.trim()}</p>
        ))}
        <div className="narrative-version-divider" />
        <div className="narrative-version-label">माता-पिता के लिए · शुद्ध हिन्दी</div>
        {(parentBlock ?? '').trim().split('\n\n').filter(Boolean).map((p, i) => (
          <p key={`p-${i}`} className="narrative-para">{p.trim()}</p>
        ))}
      </>
    );
  }
  return (
    <>
      {narrative.split('\n\n').filter(Boolean).map((p, i) => (
        <p key={i} className="narrative-para">{p.trim()}</p>
      ))}
    </>
  );
}

// ── Metadata ──────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title:       'Kundali Milan · Trikaal Vaani',
    description: 'Your personal Kundali Milan reading by Trikaal Vaani.',
    robots:      { index: false, follow: false },
  };
}

// ── PAGE ──────────────────────────────────────────────────────
export default async function MilanResultPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: milan, error } = await supabase
    .from('kundali_milan')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !milan) notFound();

  const m    = milan as MilanRow;
  const free = isFreeTier(m.tier);

  const narrative = free ? null : await ensureNarrative(m.slug, m.gemini_narrative);

  const bride     = m.bride_data;
  const groom     = m.groom_data;
  const score     = m.ashtakoot_score;
  const resultUrl = `https://trikalvaani.com/milan/${m.slug}`;

  return (
    <div className="min-h-screen bg-[#080B12] text-[#f5f5f5]">

      {/* ─────────── HERO ─────────── */}
      <header className="relative overflow-hidden border-b border-[#D4AF37]/20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1120] via-[#080B12] to-[#080B12] opacity-90" />
        <div className="relative max-w-4xl mx-auto px-5 py-12 sm:py-16 text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs tracking-[0.25em] uppercase">
            Trikaal Vaani · Kundali Milan
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">
            <span className="block">{bride.name}</span>
            <span className="block text-[#D4AF37] italic text-xl sm:text-3xl my-2">×</span>
            <span className="block">{groom.name}</span>
          </h1>
          <p className="mt-5 text-sm text-gray-400 tracking-wide">
            {bride.place} &nbsp;·&nbsp; {groom.place}
          </p>
          <p className="mt-1 text-xs text-gray-500 tracking-widest uppercase">
            {tierLabel(m.tier)} &nbsp;·&nbsp; {tierPrice(m.tier)}
          </p>
        </div>
      </header>

      {/* ─────────── SCORE BADGE ─────────── */}
      {score !== null && (
        <section className="max-w-4xl mx-auto px-5 -mt-6 sm:-mt-8 mb-10">
          <div className="bg-gradient-to-br from-[#0d1120] to-[#1a1a2e] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center">
              <div className="text-[10px] sm:text-xs text-[#D4AF37] tracking-[0.4em] uppercase mb-3">
                Ashtakoot Milan
              </div>
              <div className="text-5xl sm:text-7xl font-bold text-white">
                {score}<span className="text-[#D4AF37] text-3xl sm:text-4xl font-normal"> / 36</span>
              </div>
              <div className="mt-3 text-sm sm:text-base text-gray-300">
                {scoreBand(score)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─────────── MANGLIK BADGE (ALL TIERS) ─────────── */}
      <MilanManglikBadge
        manglikData={m.manglik_data}
        brideName={bride.name}
        groomName={groom.name}
      />

      {/* ─────────── NARRATIVE (paid) OR UPGRADE BLOCK (free) ─────────── */}
      {free ? (
        <section className="max-w-3xl mx-auto px-5 py-8 sm:py-12">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d1120] border border-[#D4AF37]/40 rounded-2xl p-7 sm:p-10 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">
              Yeh sirf jhalak hai
            </h2>
            <p className="mt-2 text-[#D4AF37] text-sm tracking-wide">
              This is just a glimpse — the full truth awaits
            </p>
            <p className="mt-5 text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Aapne dekha {bride.name} aur {groom.name} ka Ashtakoot score
              {score !== null ? ` (${score}/36)` : ''} aur Mangal Dosh status.
              Lekin poori sachhai — har dosha ki gehrai, aur 10 vishesh
              upaay jo aapki shaadi safal banayenge — woh Deep Reading mein khulti hai.
            </p>
            <div className="mt-7 grid sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
              {[
                { p: '₹51',  t: 'Basic Milan',  d: 'Full 8 koots + all doshas' },
                { p: '₹101', t: 'Deep Reading',  d: '1000-word + 10 remedies' },
                { p: '₹151', t: 'Both Versions', d: 'Couple + Parent narratives' },
              ].map((tier, i) => (
                <div key={i} className="bg-[#080B12]/60 border border-[#D4AF37]/20 rounded-xl p-4">
                  <div className="text-[#D4AF37] font-bold text-xl">{tier.p}</div>
                  <div className="text-white text-sm font-medium mt-1">{tier.t}</div>
                  <div className="text-gray-400 text-xs mt-1">{tier.d}</div>
                </div>
              ))}
            </div>
            <a
              href="/kundali-milan#kundali-milan-form"
              className="inline-block mt-8 px-8 py-3.5 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] text-[#080B12] font-semibold tracking-wide transition shadow-lg"
            >
              Poori Sachhai Dekhein — Deep Reading Kholiye →
            </a>
            <p className="mt-3 text-xs text-gray-500">
              No refund · PDF delivered on WhatsApp + Email · 60 seconds
            </p>
          </div>
        </section>
      ) : (
        <section className="max-w-3xl mx-auto px-5 py-8 sm:py-12">
          <div className="mb-6 text-center">
            <h2 className="text-xs sm:text-sm text-[#D4AF37] tracking-[0.3em] uppercase">
              Aapka Milan Vishleshan
            </h2>
          </div>
          <article className="milan-narrative bg-[#0d1120]/60 border border-[#D4AF37]/15 rounded-2xl p-6 sm:p-10">
            {!narrative ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg mb-2">🔱</p>
                <p>Aapki reading taiyaar ho rahi hai...</p>
                <p className="text-sm mt-2 text-gray-500">Please refresh in 30 seconds.</p>
              </div>
            ) : (
              renderNarrative(narrative, m.audience)
            )}
          </article>
        </section>
      )}

      {/* ─────────── REMEDIES CARDS (deep_101 + both_151 only) ─────────── */}
      {!free && showRemedies(m.tier) && (
        <MilanRemediesCard
          remediesData={m.remedies_data as any}
          tier={m.tier}
        />
      )}

      {/* ─────────── KARMIC UPSELL (ALL TIERS — v1.3) ─────────── */}
      {/* Catches the buyer mid-emotion: compatibility dekh li, par woh
          asliyat mein kaise insaan hain? → /karmic-background-reading */}
      <section className="max-w-3xl mx-auto px-5 py-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1326] via-[#0d1120] to-[#080B12] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-10">
          <div className="absolute top-0 right-0 text-[120px] opacity-[0.04] leading-none select-none pointer-events-none">🔱</div>
          <div className="relative">
            <div className="inline-block mb-3 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] tracking-[0.25em] uppercase">
              Ek aur gehra sawaal
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white leading-snug">
              Compatibility toh aap dekh chuke...
              <span className="block text-[#D4AF37] mt-1">par woh asliyat mein kaise insaan hain?</span>
            </h3>
            <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed">
              Shaadi sirf do kundaliyon ka milan nahi — do insaano ka milan hai.
              {' '}{bride.name} ya {groom.name} ki kundali unke andar ke 6 karmic patterns kholti hai:
              unka swabhav, nibhaane ki aadat, paison se rishta, parivaar ka samman,
              chhupi pravritti, aur vivah ka asli bhavishya.
            </p>

            {/* 6 dimension chips */}
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              {[
                '🪔 Core Personality',
                '💗 Fidelity & Conduct',
                '🪙 Financial Behaviour',
                '🏠 Family & Respect',
                '🌑 Hidden Tendencies',
                '🔱 Marriage Outlook',
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#080B12]/50 border border-[#D4AF37]/10 text-gray-300">
                  {d}
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs text-gray-400 italic">
              Bhrigu Nandi Nadi se padhe gaye karmic patterns — kisi par faisla nahi,
              sirf samajh taaki aap taiyaar reh sakein.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="/karmic-background-reading"
                className="inline-block px-7 py-3.5 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] text-[#080B12] font-semibold tracking-wide transition shadow-lg w-full sm:w-auto text-center"
              >
                Karmic Background Reading Kholiye — ₹251 →
              </a>
              <span className="text-xs text-gray-500">
                Free Lagna &amp; Moon jhalak · PDF on WhatsApp
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── MAA SHAKTI PERMANENT SECTION ─────────── */}
      <section className="max-w-3xl mx-auto px-5 py-8">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d1120] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-10 text-center">
          <div className="text-3xl sm:text-4xl mb-3">🔱</div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white">
            Maa Shakti Ki Kripa Banee Rahe
          </h3>
          <p className="text-[#D4AF37] mt-1 text-sm sm:text-base">
            माँ शक्ति की कृपा बनी रहे
          </p>
          <p className="mt-5 text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl mx-auto">
            Shaadi se pehle Maa ki <strong className="text-white">Arzi</strong> karein —
            apne rishtedari ki raksha ke liye.
            Aur jab vivah saanand sampann ho, tab wapas aaiye Trikaal Vaani —
            Maa ke charano mein <strong className="text-white">Dhanyawad</strong> arpit karne.
            Yahi sanatan parampara hai.
          </p>
          <div className="mt-6">
            <a
              href={`/maa-shakti?ref=milan-${m.slug}`}
              className="inline-block px-7 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] text-[#080B12] font-semibold tracking-wide transition shadow-lg"
            >
              Maa ko Arzi karein →
            </a>
          </div>
        </div>
      </section>

      {/* ─────────── SHARE + PDF (paid only) ─────────── */}
      {!free && (
        <section className="max-w-3xl mx-auto px-5 py-10">
          <div className="text-center mb-5">
            <h3 className="text-xs sm:text-sm text-[#D4AF37] tracking-[0.3em] uppercase">
              Share &amp; Download
            </h3>
          </div>
          <MilanShareButtons
            slug={m.slug}
            brideName={bride.name}
            groomName={groom.name}
            ashtakoot={score}
            resultUrl={resultUrl}
            pdfUrl={m.pdf_url}
          />
        </section>
      )}

      {/* ─────────── FOOTER ─────────── */}
      <footer className="border-t border-[#D4AF37]/10 mt-8">
        <div className="max-w-4xl mx-auto px-5 py-8 text-center text-xs text-gray-500">
          <p className="text-[#D4AF37] tracking-[0.3em] uppercase">Trikaal Vaani</p>
          <p className="mt-2">AI-Powered Vedic Astrology · Rohiit Gupta, Chief Vedic Architect</p>
          <p className="mt-1">MSME · UDYAM-DL-10-0119070 · trikalvaani.com</p>
        </div>
      </footer>

      {/* ─────────── INLINE STYLES ─────────── */}
      <style>{`
        .milan-narrative .narrative-para {
          font-size: 1.05rem;
          line-height: 1.95;
          color: #e8e8e8;
          margin: 0 0 1.4rem 0;
          text-align: justify;
          font-weight: 400;
        }
        .milan-narrative .narrative-para:last-child { margin-bottom: 0; }
        .milan-narrative .narrative-version-label {
          display: inline-block;
          color: #D4AF37;
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          padding: 0.4rem 1rem;
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 999px;
          margin: 0.5rem 0 1.5rem 0;
        }
        .milan-narrative .narrative-version-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(212, 175, 55, 0.4), transparent);
          margin: 2.5rem 0;
        }
        @media (max-width: 640px) {
          .milan-narrative .narrative-para {
            font-size: 1rem;
            line-height: 1.85;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}
