// ============================================================
// File: app/hast-rekha-calculator/page.tsx
// Purpose: AI Hast Rekha Calculator — PAID ₹51 money page + SEO/GEO pillar
// Version: v2.0
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Date: 2026-07-12
// ============================================================
// CHANGES vs v1.0:
//   ✅ PILLAR CONTENT NOW LIVES IN SUPABASE. Row: seo_pillar_pages
//      slug='hast-rekha-calculator', category='palmistry', cluster='samudrika',
//      page_type='pillar', published=FALSE (deliberate — see note below).
//      3,187-word body + 87 keywords + 8 FAQs, editable without a redeploy.
//   ✅ published=FALSE is INTENTIONAL: /learn/[slug] and app/sitemap.ts both
//      filter on published=true. Keeping this row unpublished means it can
//      NEVER render at /learn/hast-rekha-calculator and cannibalise this page.
//      It is fetched here via getPillarContent(), which skips that filter.
//   ✅ metadata → generateMetadata(): title, description and keywords are now
//      pulled from the Supabase row (single source of truth).
//   ✅ TITLE FIX: removed the word "Free". The product costs ₹51. Advertising
//      "Free Palm Reading" on a paid page is a trust gap and AI engines were
//      quoting "free".
//   ✅ Added HowTo schema (palm photo steps) — task/action + voice intent.
//   ✅ FAQPage schema now merges the product FAQs (Hinglish, in the client
//      accordion) with the DB FAQs (English, deep). Both are visible on page.
//   ✅ revalidate = 86400 — content updates from Supabase without redeploy.
//   ✅ HastRekhaClient.tsx: NOT TOUCHED. Same FAQS prop, same behaviour.
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import HastRekhaClient from './HastRekhaClient';
import PillarBody from '@/components/seo/PillarBody';
import { getPillarContent } from '@/lib/seo-content';

export const revalidate = 86400; // 24h — Supabase edits go live without redeploy

const PILLAR_SLUG = 'hast-rekha-calculator';
const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const ORG_ID = 'https://trikalvaani.com/#organization';
const REAL_SAMEAS = [
  'https://www.instagram.com/thetrikalvaani',
  'https://www.youtube.com/@TheTrikalVaani',
  'https://www.facebook.com/people/Trikal-Vaani-Voice',
];

// ── Fallbacks: used only if Supabase is unreachable at build/revalidate time.
const FALLBACK_TITLE =
  'AI Hast Rekha Calculator — Palm Reading by Samudrika Shastra | Trikaal Vaani';
const FALLBACK_DESC =
  'Upload one palm photo. Get a Samudrika Shastra reading — life, head, heart, fate and marriage lines, 7 mounts, 8 life scores, remedies and a PDF report for ₹51. No birth time needed.';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPillarContent(PILLAR_SLUG);

  const title = page?.title_en ?? FALLBACK_TITLE;
  const description = page?.meta_description ?? FALLBACK_DESC;
  const keywords = page
    ? [page.primary_keyword, ...(page.secondary_keywords ?? []), ...(page.lsi_keywords ?? [])]
    : ['hast rekha calculator', 'ai palm reading', 'samudrika shastra', 'palm reading by photo'];

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: 'https://trikalvaani.com/hast-rekha-calculator' },
    openGraph: {
      title: 'AI Hast Rekha Calculator — Samudrika Shastra Reading | Trikaal Vaani',
      description:
        'Photo upload karein. Complete palm reading — 6 lines, 8 mounts, 8 life scores, remedies & PDF. ₹51.',
      url: 'https://trikalvaani.com/hast-rekha-calculator',
      type: 'website',
      images: [
        {
          url: 'https://trikalvaani.com/og-default.jpg',
          width: 1200,
          height: 630,
          alt: 'AI Hast Rekha Calculator — Trikaal Vaani',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AI Hast Rekha Calculator | Trikaal Vaani',
      description: 'Upload palm photo → Samudrika Shastra reading in Hindi. PDF report ₹51.',
      images: ['https://trikalvaani.com/og-default.jpg'],
    },
    robots: { index: true, follow: true },
  };
}

// ── Product FAQs (Hinglish) — shown in the client accordion. UNCHANGED from v1.
const FAQS = [
  {
    q: 'Samudrika Shastra kya hota hai?',
    a: 'Samudrika Shastra bharat ki prachin vidya hai jisme haath ki rekhaon, parvaton, unglion aur haath ke aakar se vyakti ke jeevan ka vishleshan hota hai. Iska ullekh Brihat Samhita aur Hasta Sanjivani jaise shastriya granthon mein milta hai.',
  },
  {
    q: 'Hast Rekha Calculator kaun si rekhaen analyze karta hai?',
    a: 'Trikaal Vaani ka AI calculator 6 mukhya rekhaen — Jeevan Rekha, Mastishk Rekha, Hriday Rekha, Bhagya Rekha, Surya Rekha aur Budh Rekha — aur 8 parvat (Guru, Shani, Surya, Budh, Shukra, Mangal, Chandra) ka vishleshan karta hai.',
  },
  {
    q: 'AI palm reading kitni accurate hoti hai?',
    a: 'Achhi lighting aur clear palm photo ke saath hamara AI engine 90%+ accuracy se haath ke 21 landmarks detect karta hai, rekhaen aur parvat scan karta hai, aur Samudrika Shastra ke 40+ classical niyamon se report banata hai. Yeh ek AI-assisted reading hai — final nirnay hamesha aapka.',
  },
  {
    q: 'Hast Rekha report mein kya milega?',
    a: '8 dimension scores (career, wealth, health, relationships, vitality, leadership, creativity, spirituality), haath ka Samudrika parichay, 6 rekhaon ka vishleshan, vyaktitva, career-dhan-vivah-swasthya analysis, 4 Samudrika upay, shubh ratna suggestion, aur ek downloadable PDF report.',
  },
  {
    q: 'Seedha haath ya ulta haath upload karein?',
    a: 'Seedha haath (right hand) primary analysis ke liye zaruri hai — yeh active/future haath maana jaata hai. Ulta haath optional hai lekin dono se behtar analysis milti hai.',
  },
  {
    q: 'Kya meri palm image save hoti hai?',
    a: 'Nahi. Palm images hamare server par store nahi hoti — woh aapke browser session mein rehti hain aur analysis ke baad delete ho jaati hain. Sirf analysis ka result data save hota hai, koi image nahi.',
  },
];

// ── HowTo steps (task/action + voice intent). Kept in code: they describe the
//    product flow, not editorial content.
const HOWTO_STEPS = [
  { name: 'Use daylight, no flash', text: 'Stand near a window. Camera flash washes out the fine palm lines completely.' },
  { name: 'Open the palm flat', text: 'Fingers slightly apart. Do not tense or cup the hand.' },
  { name: 'Shoot straight down', text: 'Hold the camera directly above the palm. An angled shot distorts mount elevation.' },
  { name: 'Fill the frame', text: 'The hand should fill the photo from wrist to fingertips.' },
  { name: 'Upload your dominant hand', text: 'Upload the photo on this page and get your Samudrika Shastra reading for ₹51.' },
];

export default async function HastRekhaPage() {
  const page = await getPillarContent(PILLAR_SLUG);

  // Merge product FAQs (Hinglish) + editorial FAQs (English, from Supabase)
  const dbFaqs = page?.faq_block ?? [];
  const allFaqs = [...FAQS, ...dbFaqs];

  return (
    <>
      {/* ── SoftwareApplication Schema ── */}
      <Script id="hastrekha-app-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'AI Hast Rekha Calculator',
          alternateName: ['AI Palmistry Calculator India', 'Samudrika Shastra AI Tool'],
          description: 'AI-powered Indian palmistry calculator using computer vision for hand landmark detection, palm line extraction, and Samudrika Shastra rule-based analysis. Personalised Hast Rekha reports in Hindi, English, and Hinglish.',
          url: 'https://trikalvaani.com/hast-rekha-calculator',
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Web, iOS, Android',
          inLanguage: ['hi-IN', 'en-IN'],
          offers: {
            '@type': 'Offer',
            price: '51',
            priceCurrency: 'INR',
            description: 'Full Samudrika Shastra Hast Rekha Report with PDF — 8 dimension scores, 6 line + 8 mount analysis, remedies, gemstone, downloadable PDF',
            eligibleRegion: { '@type': 'Place', name: 'Worldwide' },
          },
          featureList: [
            'AI 21-point hand landmark detection',
            'Advanced palm line enhancement',
            'AI vision palm line extraction (6 lines + 8 mounts)',
            'Samudrika Shastra rule engine (40+ niyam)',
            'AI-powered personalised report generation',
            '8 life dimension scores',
            'PDF report download',
            'Hindi, English, Hinglish support',
          ],
          author: {
            '@type': 'Person',
            '@id': 'https://trikalvaani.com/#rohiit-gupta',
            name: 'Rohiit Gupta',
            jobTitle: 'Chief Vedic Architect',
            url: 'https://trikalvaani.com/founder',
            image: 'https://trikalvaani.com/Rohiit-Gupta.jpg',
            knowsAbout: ['Samudrika Shastra', 'Vedic Astrology', 'Jyotish Shastra', 'Indian Palmistry'],
          },
          publisher: {
            '@type': 'Organization',
            '@id': ORG_ID,
            name: 'Trikaal Vaani',
            legalName: 'Trikal Vaani',
            url: 'https://trikalvaani.com',
            logo: 'https://trikalvaani.com/Trikal_Logo.png',
            sameAs: REAL_SAMEAS,
          },
        }) }} />

      {/* ── FAQPage Schema (product FAQs + Supabase editorial FAQs) ── */}
      <Script id="hastrekha-faq-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: allFaqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }) }} />

      {/* ── HowTo Schema — "how to take a palm photo" (task + voice intent) ── */}
      <Script id="hastrekha-howto-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to take a palm photo for an AI Hast Rekha reading',
          description: 'Detection quality decides reading quality. Five rules for a palm photo the AI can actually read.',
          totalTime: 'PT2M',
          supply: [{ '@type': 'HowToSupply', name: 'A smartphone camera' }],
          step: HOWTO_STEPS.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.name,
            text: s.text,
            url: `https://trikalvaani.com/hast-rekha-calculator#step-${i + 1}`,
          })),
        }) }} />

      {/* ── Article Schema (E-E-A-T on the 3,187-word pillar body) ── */}
      {page?.body_content && (
        <Script id="hastrekha-article-schema" type="application/ld+json" strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: page.title_en,
            description: page.meta_description,
            wordCount: page.word_count,
            inLanguage: 'en-IN',
            mainEntityOfPage: 'https://trikalvaani.com/hast-rekha-calculator',
            dateModified: new Date().toISOString().split('T')[0],
            citation: page.classical_ref ?? undefined,
            author: {
              '@type': 'Person',
              '@id': 'https://trikalvaani.com/#rohiit-gupta',
              name: 'Rohiit Gupta',
              jobTitle: 'Chief Vedic Architect',
              url: 'https://trikalvaani.com/founder',
            },
            publisher: { '@type': 'Organization', '@id': ORG_ID, name: 'Trikaal Vaani' },
          }) }} />
      )}

      {/* ── BreadcrumbList Schema ── */}
      <Script id="hastrekha-breadcrumb-schema" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
            { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
            { '@type': 'ListItem', position: 3, name: 'AI Hast Rekha Calculator', item: 'https://trikalvaani.com/hast-rekha-calculator' },
          ],
        }) }} />

      {/* ── THE TOOL (untouched) ── */}
      <HastRekhaClient faqs={FAQS} />

      {/* ── THE PILLAR (from Supabase) ── */}
      {page?.body_content && (
        <section className="px-4 pb-20" style={{ background: '#080B12', color: '#E5E7EB' }}>
          <div className="max-w-3xl mx-auto">

            {/* GEO direct answer — the block AI engines lift */}
            <div
              className="rounded-xl p-5 mb-10"
              style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}
            >
              <p className="text-base md:text-lg leading-relaxed">{page.geo_answer}</p>
            </div>

            <PillarBody markdown={page.body_content} />

            {/* Deep FAQ — the Supabase editorial block (matches FAQPage schema) */}
            {dbFaqs.length > 0 && (
              <div className="mt-14">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6" style={{ color: GOLD }}>
                  Hast Rekha — Detailed FAQ
                </h2>
                <div className="space-y-3">
                  {dbFaqs.map((f, i) => (
                    <details
                      key={i}
                      className="p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <summary className="font-semibold cursor-pointer" style={{ color: GOLD }}>{f.q}</summary>
                      <p className="mt-3 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* E-E-A-T block */}
            <div
              className="mt-12 flex items-center gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                style={{ background: GOLD, color: '#080B12' }}
              >
                RG
              </div>
              <div className="text-sm">
                <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
                <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani</div>
                {page.classical_ref && (
                  <div className="text-xs text-slate-500 mt-0.5">Sources: {page.classical_ref}</div>
                )}
              </div>
            </div>

            {/* Conversion CTA */}
            <div
              className="mt-10 p-6 md:p-8 rounded-2xl text-center"
              style={{
                background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`,
                border: `1px solid ${GOLD_RGBA(0.35)}`,
              }}
            >
              <h3 className="text-xl md:text-2xl font-serif font-bold mb-3" style={{ color: GOLD }}>
                {page.cta_text}
              </h3>
              <Link
                href="#hast-rekha-upload"
                className="inline-block px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }}
              >
                🖐️ Read My Palm — ₹51 →
              </Link>
            </div>

            {/* Internal links (hub-spoke) */}
            {page.internal_links?.length > 0 && (
              <div className="mt-10 text-sm text-slate-400">
                <span className="font-semibold" style={{ color: GOLD }}>Explore further: </span>
                {page.internal_links.map((href, i) => (
                  <span key={href}>
                    <Link href={href} className="hover:text-[#D4AF37] underline underline-offset-4">
                      {href}
                    </Link>
                    {i < page.internal_links.length - 1 && <span className="mx-1.5">·</span>}
                  </span>
                ))}
              </div>
            )}

          </div>
        </section>
      )}
    </>
  );
}
