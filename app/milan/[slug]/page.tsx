/**
 * v1.9 (1 Oct 2026) — Karmic cross-sell ₹251 -> ₹101 (Karmic ka daam isi deploy mein ₹101).
 * v1.8 (1 Oct 2026) — FREE PREVIEW ka upsell dabba ab bhi ₹51/₹101/₹151 aur
 *   "Deep Reading Kholiye" dikha raha tha (Rohiit ne free test mein pakda).
 *   v1.7 mein sirf upar ke helper badle the — ye dabba neeche alag likha tha
 *   aur poori file nahi padhi gayi thi. Ab ek dabba: Poora Milan ₹51.
 *   (Karmic cross-sell ka daam v1.9 mein badla.)
 * v1.7 (1 Oct 2026) — single tier milan_51 (₹51, couple + parent dono, granth
 *   saar + 10 upay). Label, daam aur upay-card milan_51 ke liye. Narrative ab
 *   granth se (api/milan-narrative v2.0) — wahi COUPLE/PARENT markers, isliye
 *   renderNarrative bina badle. Purane tier ki reports jaisi thi waisi.
 * v1.6 (27 Sep 2026) — 27 Sep 2026 — delivery text sach kiya (CEO Option A): WhatsApp/Email auto-delivery ka koi system nahi hai, isliye 'PDF on/via WhatsApp + Email' → 'PDF download + WhatsApp share'.
 * v1.5 (27 Sep 2026) — NARRATIVE AB PAGE KE ANDAR NAHI BANTA.
 *   Pehle page khud /api/milan-narrative ko await karta tha. Narrative ~34s
 *   leta hai, page ki limit 30s (vercel.json) — page timeout, generation
 *   beech mein kat jaati, aur 6 ke 6 paid Milan readings ka gemini_narrative
 *   NULL raha (May se). Grahak ko error / "refresh karein" hi milta tha.
 *   Ab: narrative DB mein hai to seedha dikhao; nahi hai to
 *   <MilanNarrativeLoader> browser se route call karta hai (route ki apni
 *   120s limit), bante hi page reload. Baaki layout/logic bilkul same.
 * v1.4 (21 Sep 2026) — GRANTH KA FAISLA 36 guna ke dabbe mein, sabse upar.
 *   HAAN / HO SAKTA HAI / NAHI — parihar ke BAAD (milan_engine v2.0).
 *   scoreBand() ab tabhi dikhta hai jab faisla NA ho — warna ek hi dabbe
 *   mein do ulte faisle dikhte (30/36 par 'Excellent' aur TEEVRA nadi par 'NAHI').
 * ============================================================
 * TRIKAL VAANI - Kundali Milan Result Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/milan/[slug]/page.tsx
 * VERSION: 1.6
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
import MilanNarrativeLoader from '@/components/milan/MilanNarrativeLoader';

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
    milan_51:        'Kundali Milan — Couple + Parent',
    basic_51:        'Basic Milan',
    deep_101_couple: 'Deep Reading — Couple',
    deep_101_parent: 'Deep Reading — Parent',
    both_151:        'Both Versions — Couple + Parent',
  }[tier] ?? tier;
}

function tierPrice(tier: string): string {
  return {
    free:            'Free',
    milan_51:        '₹51',
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
  return ['milan_51', 'deep_101_couple', 'deep_101_parent', 'both_151'].includes(tier);
}

function scoreBand(score: number | null): string {
  if (score === null) return '';
  if (score >= 28) return 'Excellent · उत्तम';
  if (score >= 24) return 'Very Good · बहुत अच्छा';
  if (score >= 18) return 'Acceptable · स्वीकार्य';
  if (score >= 13) return 'Needs Remedies · उपाय आवश्यक';
  return 'Serious Doshas · गंभीर';
}

// v1.5: ensureNarrative() hataya — narrative ab MilanNarrativeLoader (browser) banata hai.

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

  const narrative = free ? null
    : (m.gemini_narrative && m.gemini_narrative.length > 200 ? m.gemini_narrative : null);

  const bride     = m.bride_data;
  const groom     = m.groom_data;
  const score     = m.ashtakoot_score;
  // ⭐ 21 Sep — milan_engine v2.0 ka faisla. Purani reading mein ye khane
  // nahi hote, isliye sab optional — tab page purane jaisa dikhta hai.
  const ak           = (m.ashtakoot_data ?? {}) as Record<string, any>;
  const faisla       = typeof ak.faisla === 'string' ? ak.faisla : null;
  const faislaWajah  = Array.isArray(ak.faisla_wajah) ? ak.faisla_wajah.map(String) : [];
  const nadiTeevrata = ak.nadi_teevrata && typeof ak.nadi_teevrata === 'object' ? ak.nadi_teevrata : null;
  const daan         = Array.isArray(ak.daan) ? ak.daan.map(String) : [];
  const faislaColor  = faisla === 'HAAN' ? 'text-emerald-400'
                     : faisla === 'NAHI' ? 'text-red-400' : 'text-amber-400';
  const faislaBorder = faisla === 'HAAN' ? 'border-emerald-500/30'
                     : faisla === 'NAHI' ? 'border-red-500/30' : 'border-amber-500/30';
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
              {/* ⭐ 21 Sep 2026 — scoreBand() SIRF ANK se faisla deta tha:
                  30/36 par "Excellent" — chahe TEEVRA nadi-dosh ho. Aur ab
                  neeche GRANTH ka FAISLA bhi hai. Dono ek saath hote to grahak
                  ko ek hi dabbe mein DO ULTE faisle dikhte. Isliye jahan
                  faisla hai wahan scoreBand NAHI dikhta. Purani reading (jinme
                  faisla nahi) par scoreBand rehta hai. */}
              {!faisla && (
                <div className="mt-3 text-sm sm:text-base text-gray-300">
                  {scoreBand(score)}
                </div>
              )}
            </div>

            {/* ⭐⭐ GRANTH KA FAISLA — 21 September 2026
                Rohiit ka nirdesh: "HAAN / HO SAKTA HAI / NAHI — parihar ke BAAD",
                aur 36 guna ke ank ke SAATH, sabse upar.
                milan_engine v2.0 ise Muhurta Chintamani Vivaha sl.21-37 se
                nikalta hai. ⚠️ Faisla SIRF ank se nahi banta — granth NADI ko
                "aathon koot mein sabse pradhan" (sl.34) aur SHADASHTAK ko
                "mrityu" (sl.31) kehta hai; unke rehte ank kitna bhi ho, "HAAN"
                kehna granth ke khilaaf hota. */}
            {faisla && (
              <div className={`mt-6 pt-6 border-t text-center ${faislaBorder}`}>
                <div className="text-[10px] tracking-[0.35em] uppercase text-gray-500 mb-2">
                  Hamara Faisla · Granth ke Anusaar
                </div>
                <div className={`text-3xl sm:text-4xl font-bold ${faislaColor}`}>
                  {faisla}
                </div>
                {faislaWajah.length > 0 && (
                  <ul className="mt-4 space-y-1.5 text-left max-w-xl mx-auto">
                    {faislaWajah.map((w, i) => (
                      <li key={i} className="text-sm text-gray-300 leading-relaxed">· {w}</li>
                    ))}
                  </ul>
                )}
                {nadiTeevrata && (
                  <p className="mt-3 text-xs text-amber-300/90">
                    Nadi-dosh ki teevrata: <strong>{nadiTeevrata.teevrata}</strong>
                    {' '}— {nadiTeevrata.kispar} ({nadiTeevrata.sloka})
                  </p>
                )}
                {daan.length > 0 && (
                  <p className="mt-3 text-xs text-[#D4AF37]">
                    🔱 Granth ka upay (Muhurta Chintamani 6.34): {daan.join(' · ')}
                  </p>
                )}
                <p className="mt-4 text-[11px] text-gray-500 max-w-xl mx-auto leading-relaxed">
                  Ye faisla Muhurta Chintamani (Vivaha-prakarana sl.21-37) ke aathon
                  koot, unke parihar aur dosh dekh kar bana hai. Jahan granth chup
                  hai wahan ank anumaan hai, aur wo saaf likha gaya hai. Hum koi
                  guarantee nahi dete — hum wahi batate hain jo granth kehta hai.
                </p>
              </div>
            )}
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
              upaay — woh Poore Milan mein khulti hai: aathon koot ke granth-shlok,
              couple aur parent dono ke liye.
            </p>
            <div className="mt-7 text-left max-w-md mx-auto bg-[#080B12]/60 border border-[#D4AF37]/40 rounded-xl p-5">
              <div className="flex items-baseline justify-between">
                <div className="text-white text-base font-semibold">⭐ Poora Milan</div>
                <div className="text-[#D4AF37] font-bold text-2xl">₹51</div>
              </div>
              <ul className="mt-3 space-y-1.5 text-gray-300 text-sm">
                {[
                  'Aathon koot — Sanskrit shlok + Hindi arth (Muhurta Chintamani)',
                  'Nadi, Bhakoot, Gan dosh aur granth ka parihar',
                  'Couple (Hinglish) + Parent (Hindi) — dono version',
                  '10 upay · PDF download',
                ].map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-[#D4AF37]">+</span><span>{f}</span></li>
                ))}
              </ul>
            </div>
            <a
              href="/kundali-milan#kundali-milan-form"
              className="inline-block mt-8 px-8 py-3.5 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] text-[#080B12] font-semibold tracking-wide transition shadow-lg"
            >
              Poora Milan Kholiye — ₹51 →
            </a>
            <p className="mt-3 text-xs text-gray-500">
              No refund · PDF download + WhatsApp share · 60 seconds
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
              <MilanNarrativeLoader slug={m.slug} />
            ) : (
              renderNarrative(narrative, m.audience)
            )}
          </article>
        </section>
      )}

      {/* ─────────── REMEDIES CARDS (milan_51 + purane deep/both tiers) ─────────── */}
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
                Karmic Background Reading Kholiye — ₹101 →
              </a>
              <span className="text-xs text-gray-500">
                Free Lagna &amp; Moon jhalak · PDF download + WhatsApp share
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
