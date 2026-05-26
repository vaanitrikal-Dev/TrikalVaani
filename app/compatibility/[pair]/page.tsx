/**
 * ============================================================
 * TRIKAL VAANI — Compatibility Page (Programmatic SEO/GEO)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/compatibility/[pair]/page.tsx
 * VERSION: 1.2 — Karmic Background Reading CTA block (all 288 pages)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * CHANGE LOG (v1.1 → v1.2):
 *   Added a Karmic Background Reading CTA block after the Milan CTA,
 *   before the FAQ. Language-aware (Hindi on ?lang=hi). Real <Link> to
 *   /karmic-background-reading → interlinks ALL 288 compatibility pages
 *   to the Karmic pillar (SEO mesh + revenue funnel). One edit = 288 pages.
 *   NOTHING ELSE CHANGED — all v1.1 logic/schemas/related-pairs/hreflang
 *   identical.
 *
 * CHANGE LOG (v1.0 → v1.1):
 *   Activated the "Related Rashi Pairs" interlinking section.
 * ============================================================
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// ── ISR: regenerate pages periodically, cache aggressively ───
export const revalidate = 86400; // 24h

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE = 'https://trikalvaani.com';

interface CompatRow {
  slug:          string;
  lang:          string;
  rashi1_en:     string;
  rashi2_en:     string;
  rashi1_hi:     string;
  rashi2_hi:     string;
  score:         number;
  score_percent: number;
  verdict:       string;
  geo_answer:    string;
  emotional:     string;
  communication: string;
  strengths:     string;
  challenges:    string;
  remedies:      string;
  faq:           { q: string; a: string }[];
  meta_title:    string;
  meta_desc:     string;
}

// ── Minimal shape for related-pair links ─────────────────────
interface RelatedPair {
  slug:      string;
  rashi1_en: string;
  rashi2_en: string;
  rashi1_hi: string;
  rashi2_hi: string;
  score:     number;
  verdict:   string;
}

// ── Fetch a page row by slug + lang ──────────────────────────
async function getPage(slug: string, lang: string): Promise<CompatRow | null> {
  const { data, error } = await supabase
    .from('compatibility_pages')
    .select('*')
    .eq('slug', slug)
    .eq('lang', lang)
    .single();

  if (error || !data) return null;
  return data as CompatRow;
}

// ── Fetch related pairs (same first rashi, same lang) ────────
async function getRelatedPairs(
  rashi1_en: string,
  lang: string,
  excludeSlug: string,
): Promise<RelatedPair[]> {
  const { data, error } = await supabase
    .from('compatibility_pages')
    .select('slug, rashi1_en, rashi2_en, rashi1_hi, rashi2_hi, score, verdict')
    .eq('lang', lang)
    .eq('rashi1_en', rashi1_en)
    .neq('slug', excludeSlug)
    .order('score', { ascending: false })
    .limit(6);

  if (error || !data) return [];
  return data as RelatedPair[];
}

// ── Resolve lang from searchParams ───────────────────────────
function resolveLang(searchParams: { [k: string]: string | string[] | undefined }): string {
  const l = searchParams?.lang;
  const val = Array.isArray(l) ? l[0] : l;
  return val === 'hi' ? 'hi' : 'en';
}

// ── Metadata (dynamic SEO) ───────────────────────────────────
export async function generateMetadata(
  { params, searchParams }: { params: { pair: string }; searchParams: { [k: string]: string | string[] | undefined } }
): Promise<Metadata> {
  const lang = resolveLang(searchParams);
  const page = await getPage(params.pair, lang);

  if (!page) {
    return { title: 'Compatibility — Trikaal Vaani', robots: { index: false } };
  }

  const canonical = `${SITE}/compatibility/${page.slug}${lang === 'hi' ? '?lang=hi' : ''}`;

  return {
    title:       page.meta_title,
    description: page.meta_desc,
    alternates: {
      canonical,
      languages: {
        'en': `${SITE}/compatibility/${page.slug}`,
        'hi': `${SITE}/compatibility/${page.slug}?lang=hi`,
      },
    },
    openGraph: {
      title:       page.meta_title,
      description: page.meta_desc,
      url:         canonical,
      siteName:    'Trikaal Vaani',
      type:        'article',
    },
    robots: { index: true, follow: true },
  };
}

// ── Score band color ─────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 28) return '#22c55e';
  if (score >= 24) return '#84cc16';
  if (score >= 18) return '#D4AF37';
  if (score >= 13) return '#f97316';
  return '#ef4444';
}

// ── PAGE ─────────────────────────────────────────────────────
export default async function CompatibilityPage(
  { params, searchParams }: { params: { pair: string }; searchParams: { [k: string]: string | string[] | undefined } }
) {
  const lang = resolveLang(searchParams);
  const page = await getPage(params.pair, lang);

  if (!page) notFound();

  const isHi = lang === 'hi';
  const r1 = isHi ? page.rashi1_hi : page.rashi1_en;
  const r2 = isHi ? page.rashi2_hi : page.rashi2_en;
  const canonical = `${SITE}/compatibility/${page.slug}${isHi ? '?lang=hi' : ''}`;

  // v1.1: fetch related pairs for the interlinking mesh
  const relatedPairs = await getRelatedPairs(page.rashi1_en, lang, page.slug);

  // ── Labels by language ─────────────────────────────────────
  const L = isHi ? {
    compatibility:  'राशि अनुकूलता',
    ashtakootScore: 'अष्टकूट मिलान',
    outOf:          'में से',
    emotional:      'भावनात्मक अनुकूलता',
    communication:  'संवाद शैली',
    strengths:      'इस जोड़ी की शक्तियाँ',
    challenges:     'चुनौतियाँ',
    remedies:       'वैदिक उपाय',
    faqTitle:       'अक्सर पूछे जाने वाले प्रश्न',
    ctaTitle:       'अपना सटीक कुंडली मिलान पाएं',
    ctaText:        'यह सामान्य राशि अनुकूलता है। आपकी सटीक जन्म कुंडली के आधार पर पूर्ण मिलान — मांगलिक, नाड़ी, सभी 8 कूट और 10 उपाय — मात्र ₹51 में।',
    ctaButton:      'कुंडली मिलान करें ₹51 →',
    authorRole:     'मुख्य वैदिक आर्किटेक्ट',
    authorBio:      'रोहित गुप्ता त्रिकाल वाणी के संस्थापक एवं मुख्य वैदिक आर्किटेक्ट हैं। उनकी भविष्यवाणियाँ बृहत् पाराशर होरा शास्त्र (BPHS), भृगु नाड़ी और षड्बल पर आधारित हैं।',
    relatedTitle:   'संबंधित राशि जोड़ियाँ',
    pillarLink:     'कुंडली मिलान के बारे में जानें',
    homeCrumb:      'होम',
    karmicTitle:    'अनुकूलता से आगे — वह इंसान असल में कैसा है?',
    karmicText:     'राशि अनुकूलता दो राशियों का मेल दिखाती है। पर विवाह दो इंसानों का रिश्ता है। किसी की कुंडली से उनके 6 कार्मिक पैटर्न — स्वभाव, निष्ठा, धन, परिवार का सम्मान, छुपी प्रवृत्ति और विवाह का भविष्य — भृगु नाड़ी के आधार पर जानें। किसी पर निर्णय नहीं, केवल समझ।',
    karmicButton:   'कार्मिक बैकग्राउंड रीडिंग ₹251 →',
  } : {
    compatibility:  'Compatibility',
    ashtakootScore: 'Ashtakoot Milan',
    outOf:          'out of',
    emotional:      'Emotional Compatibility',
    communication:  'Communication Style',
    strengths:      'Strengths of This Pairing',
    challenges:     'Challenges',
    remedies:       'Vedic Remedies',
    faqTitle:       'Frequently Asked Questions',
    ctaTitle:       'Get Your Exact Kundali Milan',
    ctaText:        'This is general rashi compatibility. Your complete matching based on exact birth charts — Manglik, Nadi, all 8 koots, and 10 remedies — for just ₹51.',
    ctaButton:      'Get Kundali Milan ₹51 →',
    authorRole:     'Chief Vedic Architect',
    authorBio:      'Rohiit Gupta is the founder and Chief Vedic Architect of Trikaal Vaani. His predictions are grounded in Brihat Parashara Hora Shastra (BPHS), Bhrigu Nadi, and Shadbala.',
    relatedTitle:   'Related Rashi Pairs',
    pillarLink:     'Learn about Kundali Milan',
    homeCrumb:      'Home',
    karmicTitle:    'Beyond Compatibility — Who Is This Person Really?',
    karmicText:     'Rashi compatibility shows how two signs match. But marriage is a bond between two people. A Karmic Background Reading reveals a person\'s 6 karmic patterns — personality, fidelity, money, family respect, hidden tendencies, and marriage outlook — read from their birth chart via Bhrigu Nandi Nadi. Patterns, not verdicts.',
    karmicButton:   'Karmic Background Reading ₹251 →',
  };

  // ── JSON-LD: FAQPage + Article + BreadcrumbList ────────────
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.meta_title,
    description: page.meta_desc,
    author: {
      '@type': 'Person',
      name: 'Rohiit Gupta',
      jobTitle: 'Chief Vedic Architect',
      url: SITE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Trikaal Vaani',
      url: SITE,
    },
    mainEntityOfPage: canonical,
    inLanguage: isHi ? 'hi-IN' : 'en-IN',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: L.homeCrumb, item: SITE },
      { '@type': 'ListItem', position: 2, name: L.compatibility, item: `${SITE}/compatibility` },
      { '@type': 'ListItem', position: 3, name: `${r1} & ${r2}`, item: canonical },
    ],
  };

  const sColor = scoreColor(page.score);

  return (
    <div className="min-h-screen bg-[#080B12] text-[#f5f5f5]">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Language toggle */}
      <div className="max-w-3xl mx-auto px-5 pt-5 flex justify-end gap-2 text-xs">
        <Link
          href={`/compatibility/${page.slug}`}
          className={`px-3 py-1 rounded-full border ${!isHi ? 'bg-[#D4AF37] text-[#080B12] border-[#D4AF37]' : 'border-[#D4AF37]/30 text-gray-400'}`}
        >English</Link>
        <Link
          href={`/compatibility/${page.slug}?lang=hi`}
          className={`px-3 py-1 rounded-full border ${isHi ? 'bg-[#D4AF37] text-[#080B12] border-[#D4AF37]' : 'border-[#D4AF37]/30 text-gray-400'}`}
        >हिन्दी</Link>
      </div>

      {/* HERO */}
      <header className="max-w-3xl mx-auto px-5 pt-8 pb-6 text-center">
        <div className="inline-block mb-4 px-4 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] tracking-[0.25em] uppercase">
          Trikaal Vaani · {L.compatibility}
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">
          {r1} <span className="text-[#D4AF37]">&amp;</span> {r2}
        </h1>
        <p className="mt-3 text-gray-400 text-sm">{L.compatibility}</p>
      </header>

      {/* SCORE BADGE */}
      <section className="max-w-3xl mx-auto px-5 mb-8">
        <div className="bg-gradient-to-br from-[#0d1120] to-[#1a1a2e] border rounded-2xl p-6 sm:p-8 text-center"
             style={{ borderColor: `${sColor}55` }}>
          <div className="text-[10px] text-[#D4AF37] tracking-[0.4em] uppercase mb-2">{L.ashtakootScore}</div>
          <div className="text-5xl sm:text-6xl font-bold" style={{ color: sColor }}>
            {page.score}<span className="text-2xl text-gray-500 font-normal"> / 36</span>
          </div>
          <div className="mt-2 text-lg font-medium" style={{ color: sColor }}>{page.score_percent}% · {page.verdict}</div>
        </div>
      </section>

      {/* GEO DIRECT ANSWER */}
      <section className="max-w-3xl mx-auto px-5 mb-10">
        <div className="bg-[#0d1120]/60 border-l-4 border-[#D4AF37] rounded-r-xl p-5 sm:p-6">
          <p className="text-base sm:text-lg leading-relaxed text-gray-100">{page.geo_answer}</p>
        </div>
      </section>

      {/* EDUCATIONAL CONTENT */}
      <section className="max-w-3xl mx-auto px-5 space-y-8">
        {[
          { title: L.emotional,     body: page.emotional },
          { title: L.communication, body: page.communication },
          { title: L.strengths,     body: page.strengths },
          { title: L.challenges,    body: page.challenges },
          { title: L.remedies,      body: page.remedies },
        ].map((block, i) => (
          <div key={i}>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#D4AF37] mb-3 border-l-3 border-[#D4AF37] pl-3">
              {block.title}
            </h2>
            <p className="text-gray-200 leading-relaxed text-[15px] sm:text-base">{block.body}</p>
          </div>
        ))}
      </section>

      {/* CTA → PAID MILAN */}
      <section className="max-w-3xl mx-auto px-5 my-12">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d1120] border border-[#D4AF37]/40 rounded-2xl p-7 sm:p-9 text-center">
          <div className="text-3xl mb-3">🔱</div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white">{L.ctaTitle}</h2>
          <p className="mt-3 text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">{L.ctaText}</p>
          <Link
            href="/kundali-milan"
            className="inline-block mt-6 px-8 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] text-[#080B12] font-semibold tracking-wide transition shadow-lg"
          >
            {L.ctaButton}
          </Link>
        </div>
      </section>

      {/* KARMIC UPSELL — v1.2 (all 288 pages → Karmic pillar) */}
      <section className="max-w-3xl mx-auto px-5 mb-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1326] via-[#0d1120] to-[#080B12] border border-[#D4AF37]/30 rounded-2xl p-7 sm:p-9">
          <div className="absolute top-0 right-0 text-[110px] opacity-[0.04] leading-none select-none pointer-events-none">🔱</div>
          <div className="relative text-center">
            <div className="inline-block mb-3 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] tracking-[0.25em] uppercase">
              Bhrigu Nandi Nadi
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white leading-snug">{L.karmicTitle}</h2>
            <p className="mt-3 text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">{L.karmicText}</p>
            <Link
              href="/karmic-background-reading"
              className="inline-block mt-6 px-8 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] text-[#080B12] font-semibold tracking-wide transition shadow-lg"
            >
              {L.karmicButton}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-5 mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#D4AF37] mb-5">{L.faqTitle}</h2>
        <div className="space-y-4">
          {page.faq.map((f, i) => (
            <details key={i} className="bg-[#0d1120]/60 border border-[#D4AF37]/15 rounded-xl p-4 group">
              <summary className="cursor-pointer font-medium text-gray-100 list-none flex justify-between items-center">
                {f.q}
                <span className="text-[#D4AF37] group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-gray-300 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* RELATED RASHI PAIRS — v1.1 interlinking mesh */}
      {relatedPairs.length > 0 && (
        <section className="max-w-3xl mx-auto px-5 mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#D4AF37] mb-5">{L.relatedTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedPairs.map((rp) => {
              const rpR1 = isHi ? rp.rashi1_hi : rp.rashi1_en;
              const rpR2 = isHi ? rp.rashi2_hi : rp.rashi2_en;
              const rpColor = scoreColor(rp.score);
              return (
                <Link
                  key={rp.slug}
                  href={`/compatibility/${rp.slug}${isHi ? '?lang=hi' : ''}`}
                  className="flex items-center justify-between bg-[#0d1120]/60 border border-[#D4AF37]/15 rounded-xl px-4 py-3 hover:border-[#D4AF37]/40 transition"
                >
                  <span className="text-gray-100 text-sm font-medium">
                    {rpR1} <span className="text-[#D4AF37]">&amp;</span> {rpR2}
                  </span>
                  <span className="text-sm font-semibold shrink-0 ml-3" style={{ color: rpColor }}>
                    {rp.score}/36
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* E-E-A-T AUTHOR BLOCK */}
      <section className="max-w-3xl mx-auto px-5 mb-12">
        <div className="bg-[#0d1120]/40 border border-[#D4AF37]/15 rounded-xl p-5 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-lg shrink-0">
            RG
          </div>
          <div>
            <div className="font-semibold text-white">Rohiit Gupta</div>
            <div className="text-[#D4AF37] text-xs mb-2">{L.authorRole}</div>
            <p className="text-gray-400 text-sm leading-relaxed">{L.authorBio}</p>
          </div>
        </div>
      </section>

      {/* PILLAR LINK */}
      <section className="max-w-3xl mx-auto px-5 mb-12 text-center">
        <Link href="/kundali-milan" className="text-[#D4AF37] hover:underline text-sm">
          → {L.pillarLink}
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#D4AF37]/10">
        <div className="max-w-3xl mx-auto px-5 py-8 text-center text-xs text-gray-500">
          <p className="text-[#D4AF37] tracking-[0.3em] uppercase">Trikaal Vaani</p>
          <p className="mt-2">AI-Powered Vedic Astrology · Rohiit Gupta, {L.authorRole}</p>
          <p className="mt-1">MSME · UDYAM-DL-10-0119070 · trikalvaani.com</p>
        </div>
      </footer>
    </div>
  );
}
