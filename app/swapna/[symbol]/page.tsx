// 🔱 TRIKAAL VAANI | app/swapna/[symbol]/page.tsx | v1.0
// Owner: Rohiit Gupta, Chief Vedic Architect
// SWAPNA SPOKE PAGE — one SEO page per dream symbol (~100 pages), served
// entirely from the dream_symbols Supabase table. Zero Gemini cost. ISR 1h.
// Hub-spoke: /swapna (hub) ↔ /swapna/[symbol] (spokes) ↔ /swapna/category/[category].
// ----------------------------------------------------------------------------

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';

export const revalidate = 3600;

const BASE = 'https://trikalvaani.com';

const C = {
  night: '#080B12', panel: 'rgba(11,16,26,0.7)', panel2: '#0E141F',
  gold: '#D4AF37', goldDeep: '#A8820A', goldSoft: 'rgba(212,175,55,0.55)',
  line: 'rgba(212,175,55,0.14)', line2: 'rgba(212,175,55,0.26)',
  s3: '#CBD5E1', s4: '#94A3B8', s5: '#64748B',
};

const EMOJI: Record<string, string> = {
  snake: '🐍', teeth: '🦷', flying: '🕊️', falling: '🌀', hair: '💇', blood: '🩸', naked: '🧍', chased: '🏃',
  cow: '🐄', elephant: '🐘', lion: '🦁', horse: '🐎', dog: '🐕', cat: '🐈', fish: '🐟', crow: '🐦',
  peacock: '🦚', owl: '🦉', monkey: '🐒', scorpion: '🦂', insects: '🐜',
  fire: '🔥', sun: '☀️', moon: '🌙', star: '⭐', stars: '⭐', sky: '🌌', tree: '🌳', mountain: '⛰️',
  rain: '🌧️', storm: '⛈️', rainbow: '🌈', earthquake: '🌍', eclipse: '🌑', land: '🏞️',
  gold: '🪙', money: '💰', marriage: '💍', wedding: '💍', pregnancy: '🤰', birth_omen: '👶',
  vehicle: '🚗', house: '🏠', journey: '🧳', pilgrimage: '🛕', foreign: '✈️', exam: '📜',
  makeup: '💄', exercise: '🧘', dancing: '💃', loss: '🕳️', lost: '🧭',
  water: '🌊', drowning: '🌊', river: '🏞️', flood: '🌊', sea: '🌊', well: '🪣', ganga: '🕉️',
  sweets: '🍬', sweet_food: '🍬', bitter_food: '🌿', feast: '🍽️', eating: '🍚', cooking: '🍳',
  feeding: '🤲', hunger: '🍽️', meat: '🍖', alcohol: '🍷', milk: '🥛', rotten_served: '🤢', overeating: '🍽️',
  prasad: '🪔', vishnu: '🙏', shiva: '🔱', lakshmi: '🪔', durga: '🗡️', hanuman: '🐒', ganesha: '🐘',
  saraswati: '🎵', surya: '☀️', temple: '🛕', deity_general: '🛕', deity_blessing: '🙏',
  deity_angry: '⚡', idol_broken: '🗿',
  own_death: '🕯️', living_person_death: '🕯️', deceased_relative: '👤', funeral: '⚱️', corpse: '⚰️', cremation: '🔥',
  fight: '⚔️', attacked: '🛡️', wounded: '🩸', weapon: '🗡️', war: '⚔️', argument: '💬', police: '🚔',
  intimacy: '❤️', nude_desire: '❤️', romantic: '💕', faeces: '💩', toilet: '🚽', urine: '💧',
};
const CATEG_EMOJI: Record<string, string> = {
  snake: '🐍', death: '🕯️', deity: '🛕', water: '🌊', body: '🧍', bodily_function: '💧',
  sexual: '❤️', conflict: '⚔️', animal: '🦌', life_event: '✨', celestial: '☀️', food: '🍚',
};
const CATEG_LABEL: Record<string, { en: string; hi: string }> = {
  snake: { en: 'Serpent dreams', hi: 'सर्प स्वप्न' },
  death: { en: 'Death & ancestor dreams', hi: 'मृत्यु स्वप्न' },
  deity: { en: 'Deity dreams', hi: 'देव स्वप्न' },
  water: { en: 'Water dreams', hi: 'जल स्वप्न' },
  body: { en: 'Body dreams', hi: 'शरीर स्वप्न' },
  bodily_function: { en: 'Body-sign dreams', hi: 'शारीरिक संकेत' },
  sexual: { en: 'Intimacy dreams', hi: 'निकटता स्वप्न' },
  conflict: { en: 'Conflict dreams', hi: 'संघर्ष स्वप्न' },
  animal: { en: 'Animal dreams', hi: 'पशु स्वप्न' },
  life_event: { en: 'Life-event dreams', hi: 'जीवन-घटना स्वप्न' },
  celestial: { en: 'Sky & element dreams', hi: 'आकाश स्वप्न' },
  food: { en: 'Food dreams', hi: 'भोजन स्वप्न' },
};

// Symbol-matched cross-links (funnel → his real free tools / pages)
const HOOK_LINKS: Record<string, { href: string; label: string }> = {
  kaal_sarp: { href: '/calculators/free-kaal-sarp-dosh-calculator', label: 'Check Kaal Sarp Dosh in your kundali — free calculator' },
  pitra_dosha: { href: '/calculators/free-pitra-dosh-calculator', label: 'Check Pitra Dosh in your kundali — free calculator' },
  mangal_shanti: { href: '/calculators/free-manglik-dosh-calculator', label: 'Check Manglik / Mangal Dosh — free calculator' },
  chandra_shanti: { href: '/calculators/free-rashi-calculator', label: 'Know your Rashi (Moon sign) — free calculator' },
  dasha_overlay: { href: '/calculators/free-dasha-calculator', label: 'Which Mahadasha are you running? — free calculator' },
  wealth_reading: { href: '/hast-rekha-calculator', label: 'AI Hast Rekha — read your wealth lines' },
  career_reading: { href: '/career', label: 'Career astrology — deep reading' },
};

interface Row {
  symbol_key: string; symbol_en: string; symbol_hi: string; category: string;
  sub_type: string; dreamer_context: string; setting_occasion: string;
  base_tendency: string; meaning_en: string; meaning_hi: string;
  graha: string | null; life_area: string | null; remedy_free: string | null;
  paid_hook: string; recurrence_target: string | null; public_citation: string | null;
  updated_at: string | null;
}

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getSymbolRows(symbol: string): Promise<Row[]> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('dream_symbols')
      .select('symbol_key,symbol_en,symbol_hi,category,sub_type,dreamer_context,setting_occasion,base_tendency,meaning_en,meaning_hi,graha,life_area,remedy_free,paid_hook,recurrence_target,public_citation,updated_at')
      .eq('symbol_key', symbol)
      .order('id', { ascending: true });
    if (error || !data) return [];
    return data as Row[];
  } catch { return []; }
}

async function getRelatedSymbols(category: string, exclude: string): Promise<{ symbol_key: string; symbol_en: string; symbol_hi: string }[]> {
  try {
    const supabase = anonClient();
    const { data } = await supabase
      .from('dream_symbols')
      .select('symbol_key,symbol_en,symbol_hi')
      .eq('category', category)
      .neq('symbol_key', exclude)
      .order('id', { ascending: true });
    if (!data) return [];
    const seen = new Set<string>(); const out: { symbol_key: string; symbol_en: string; symbol_hi: string }[] = [];
    for (const r of data as Row[]) {
      if (!seen.has(r.symbol_key)) { seen.add(r.symbol_key); out.push({ symbol_key: r.symbol_key, symbol_en: r.symbol_en, symbol_hi: r.symbol_hi }); }
      if (out.length >= 8) break;
    }
    return out;
  } catch { return []; }
}

const TEND_BADGE: Record<string, { label: string; hi: string }> = {
  auspicious: { label: 'Auspicious', hi: 'शुभ' },
  inauspicious: { label: 'Read carefully', hi: 'सावधानी' },
  context_dependent: { label: 'Depends on context', hi: 'संदर्भ-आधारित' },
};

function tendencySummary(rows: Row[]): string {
  const a = rows.filter((r) => r.base_tendency === 'auspicious').length;
  const i = rows.filter((r) => r.base_tendency === 'inauspicious').length;
  if (a > 0 && i === 0) return 'In classical Swapna Shastra this dream leans auspicious in most of its forms.';
  if (i > 0 && a === 0) return 'In classical Swapna Shastra this dream calls for care in most of its forms.';
  return 'In classical Swapna Shastra this dream can be auspicious or cautionary — the details of the dream decide.';
}

// ── metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { symbol: string } }): Promise<Metadata> {
  const rows = await getSymbolRows(params.symbol);
  if (rows.length === 0) return { title: 'Dream Meaning | Swapna Shastra — Trikaal Vaani' };
  const r = rows[0];
  const title = `${r.symbol_en} Dream Meaning (${r.symbol_hi}) | Vedic Swapna Shastra — Trikaal Vaani`;
  const description = `${r.symbol_en} dream in Vedic Swapna Shastra: ${r.meaning_en.slice(0, 120)}… Classical meaning, remedy & what it means for YOUR chart. Free decode by Trikaal Vaani.`;
  const url = `${BASE}/swapna/${r.symbol_key}`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article', locale: 'en_IN', siteName: 'Trikaal Vaani' },
    twitter: { card: 'summary', title, description },
  };
}

// ── page ────────────────────────────────────────────────────────────────────
export default async function SwapnaSymbolPage({ params }: { params: { symbol: string } }) {
  const rows = await getSymbolRows(params.symbol);
  if (rows.length === 0) notFound();

  const r0 = rows[0];
  const emoji = EMOJI[r0.symbol_key] || CATEG_EMOJI[r0.category] || '✦';
  const cat = CATEG_LABEL[r0.category] ?? { en: r0.category, hi: '' };
  const related = await getRelatedSymbols(r0.category, r0.symbol_key);

  const remedies = Array.from(new Set(rows.map((r) => r.remedy_free).filter(Boolean))) as string[];
  const citations = Array.from(new Set(rows.map((r) => r.public_citation).filter(Boolean))) as string[];
  const grahas = Array.from(new Set(rows.map((r) => r.graha).filter(Boolean))) as string[];
  const hooks = Array.from(new Set([...rows.map((r) => r.paid_hook), ...rows.map((r) => r.recurrence_target || '')]))
    .filter((h) => h && HOOK_LINKS[h]);
  const lastMod = rows.reduce<string | null>((acc, r) => (r.updated_at && (!acc || r.updated_at > acc) ? r.updated_at : acc), null);

  // GEO 40–60 word direct answer (entity-rich, above the fold)
  const geoAnswer =
    `In Vedic Swapna Shastra, dreaming of ${r0.symbol_en.toLowerCase()} (${r0.symbol_hi}) is traditionally read as: ` +
    `${r0.meaning_en} ${tendencySummary(rows)} The exact fruit depends on the dream's details and your own birth chart and running dasha — ` +
    `as classical texts like the Svapna Cintāmaṇi teach. Decode your own dream free at Trikaal Vaani.`;

  const faqs = [
    { q: `What does dreaming of ${r0.symbol_en.toLowerCase()} mean in Vedic astrology?`, a: `${r0.meaning_en} This is the classical Swapna Shastra reading; the precise message depends on the dream's details and the dreamer's own chart.` },
    { q: `Is a ${r0.symbol_en.toLowerCase()} dream auspicious or inauspicious?`, a: tendencySummary(rows) },
    { q: `${r0.symbol_hi} का सपना देखने का क्या अर्थ है?`, a: `${r0.meaning_hi} यह शास्त्रीय स्वप्न-अर्थ है; सटीक संदेश स्वप्न के विवरण और आपकी कुंडली पर निर्भर करता है।` },
    ...(remedies.length > 0 ? [{ q: `What is the remedy after a ${r0.symbol_en.toLowerCase()} dream?`, a: `${remedies[0]}. A remedy shaped to your own chart comes with the personal reading.` }] : []),
    { q: 'Does the same dream mean the same thing for everyone?', a: 'No. Classical tradition (Bṛhat Jātaka) holds that a dream\'s fruit is shaped by the dreamer\'s own birth chart and running planetary period (dasha). That is exactly what Trikaal Vaani\'s ₹51 personal reading computes.' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `${r0.symbol_en} Dream Meaning (${r0.symbol_hi}) — Vedic Swapna Shastra`,
        url: `${BASE}/swapna/${r0.symbol_key}`,
        inLanguage: ['en-IN', 'hi-IN'],
        dateModified: lastMod ?? new Date().toISOString(),
        about: { '@type': 'Thing', name: `${r0.symbol_en} dream interpretation (Swapna Shastra)` },
        isPartOf: { '@type': 'WebSite', name: 'Trikaal Vaani', url: BASE },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Swapna Shastra', item: `${BASE}/swapna` },
          { '@type': 'ListItem', position: 3, name: `${r0.symbol_en} Dream`, item: `${BASE}/swapna/${r0.symbol_key}` },
        ],
      },
      {
        '@type': 'Person',
        name: 'Rohiit Gupta',
        jobTitle: 'Chief Vedic Architect',
        knowsAbout: ['Vedic Astrology', 'Swapna Shastra', 'Parashara BPHS', 'Jyotish'],
        worksFor: { '@type': 'Organization', name: 'Trikaal Vaani' },
      },
      { '@type': 'Organization', name: 'Trikaal Vaani', url: BASE },
      { '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen" style={{ background: C.night, color: '#fff' }}>
        <SiteNav />
        <main className="px-4 pt-14 pb-20">
          <div className="max-w-3xl mx-auto">

            {/* breadcrumb */}
            <nav className="text-[12.5px]" style={{ color: C.s5 }}>
              <a href="/" className="hover:underline">Home</a> <span>›</span>{' '}
              <a href="/swapna" className="hover:underline">Swapna Shastra</a> <span>›</span>{' '}
              <a href={`/swapna/category/${r0.category}`} className="hover:underline">{cat.en}</a> <span>›</span>{' '}
              <span style={{ color: C.goldSoft }}>{r0.symbol_en}</span>
            </nav>

            {/* hero */}
            <div className="text-center mt-8">
              <div className="text-[64px]" style={{ filter: 'drop-shadow(0 0 22px rgba(240,214,138,0.5))' }}>{emoji}</div>
              <h1 className="font-serif font-medium leading-tight text-white mt-3" style={{ fontSize: 'clamp(2rem,5.4vw,3.2rem)' }}>
                {r0.symbol_en} Dream Meaning
              </h1>
              <p className="font-serif mt-1" style={{ fontSize: 'clamp(1.1rem,3vw,1.5rem)', color: C.goldSoft }} lang="hi">{r0.symbol_hi} का स्वप्न</p>
              {grahas.length > 0 && (
                <p className="mt-3 text-[13px] uppercase" style={{ letterSpacing: '0.18em', color: C.s5 }}>
                  Associated graha: <span style={{ color: C.gold }}>{grahas.join(' · ')}</span>
                </p>
              )}
            </div>

            {/* GEO direct answer */}
            <p className="mt-7 text-[1.03rem] leading-relaxed" style={{ color: C.s3 }}>{geoAnswer}</p>

            {/* CTA to hub */}
            <div className="text-center mt-7">
              <a href="/swapna#try" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-transform duration-300 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, color: '#100B02', boxShadow: '0 10px 28px rgba(168,130,10,0.35)' }}>
                Decode YOUR exact dream — free →
              </a>
            </div>

            {/* every variation from the table */}
            <h2 className="font-serif font-medium text-white mt-12" style={{ fontSize: 'clamp(1.5rem,3.6vw,2.1rem)' }}>
              Every form of this dream, decoded
            </h2>
            <div className="mt-5 grid gap-3.5">
              {rows.map((r, i) => {
                const t = TEND_BADGE[r.base_tendency] ?? TEND_BADGE.context_dependent;
                return (
                  <div key={i} className="rounded-[16px] p-5" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-serif text-lg text-white">{r.sub_type}</h3>
                      <span className="text-[11px] uppercase px-2.5 py-1 rounded-full" style={{ letterSpacing: '0.1em', color: C.gold, border: `1px solid ${C.line2}`, background: 'rgba(212,175,55,0.07)' }}>
                        {t.label} · <span lang="hi">{t.hi}</span>
                      </span>
                      {r.dreamer_context !== 'general' && (
                        <span className="text-[11px] uppercase px-2.5 py-1 rounded-full" style={{ letterSpacing: '0.08em', color: C.s4, border: `1px solid ${C.line}` }}>
                          for: {r.dreamer_context}
                        </span>
                      )}
                      {r.setting_occasion !== 'general' && (
                        <span className="text-[11px] uppercase px-2.5 py-1 rounded-full" style={{ letterSpacing: '0.08em', color: C.s4, border: `1px solid ${C.line}` }}>
                          setting: {r.setting_occasion.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="mt-2.5 text-[0.98rem]" style={{ color: C.s3 }}>{r.meaning_en}</p>
                    <p className="mt-1.5 text-[0.95rem]" style={{ color: C.s4 }} lang="hi">{r.meaning_hi}</p>
                  </div>
                );
              })}
            </div>

            {/* remedy */}
            {remedies.length > 0 && (
              <div className="mt-10 rounded-[18px] p-6 text-center" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
                <div className="text-[11px] uppercase mb-2.5" style={{ letterSpacing: '0.3em', color: C.goldSoft }}>Traditional remedy</div>
                {remedies.map((rm, i) => (<p key={i} className="text-[0.98rem]" style={{ color: C.s3 }}>{rm}</p>))}
              </div>
            )}

            {/* symbol-matched internal links */}
            {hooks.length > 0 && (
              <div className="mt-8">
                <h2 className="font-serif font-medium text-white" style={{ fontSize: '1.4rem' }}>Check this in your own kundali</h2>
                <div className="mt-3 grid gap-2.5">
                  {hooks.map((h) => (
                    <a key={h} href={HOOK_LINKS[h].href} className="rounded-[14px] px-5 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(180deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))', border: `1px solid ${C.line2}`, color: '#fff' }}>
                      <span style={{ color: C.gold }}>✦</span> {HOOK_LINKS[h].label} →
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* the ₹51 bridge */}
            <div className="mt-10 rounded-[20px] p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.03))', border: `1px solid ${C.line2}` }}>
              <h2 className="font-serif font-medium text-white" style={{ fontSize: 'clamp(1.5rem,3.4vw,2rem)' }}>
                This is the meaning for <em style={{ color: C.gold }}>everyone</em>. Yours is written in <em style={{ color: C.gold }}>your</em> chart.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[0.98rem]" style={{ color: C.s4 }}>
                Your running Mahadasha, your yogas, your life-areas — the ₹51 personal reading computes what this dream means for your own life, on a genuine Swiss Ephemeris chart.
              </p>
              <a href="/swapna#try" className="inline-flex items-center gap-2 mt-5 px-7 py-3.5 rounded-full text-sm font-bold transition-transform duration-300 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, color: '#100B02', boxShadow: '0 10px 28px rgba(168,130,10,0.35)' }}>
                Get my personal dream reading →
              </a>
            </div>

            {/* sources */}
            {citations.length > 0 && (
              <p className="mt-8 text-center text-[12.5px] italic font-serif" style={{ color: C.s5 }}>
                Sources: {citations.join(' · ')} — validated by Rohiit Gupta, Chief Vedic Architect (16 years, Parashara BPHS).
              </p>
            )}

            {/* FAQ */}
            <h2 className="font-serif font-medium text-white mt-12" style={{ fontSize: 'clamp(1.5rem,3.6vw,2.1rem)' }}>Questions, answered</h2>
            <div className="mt-4">
              {faqs.map((f, i) => (
                <div key={i} className="py-4" style={{ borderTop: `1px solid ${C.line}`, borderBottom: i === faqs.length - 1 ? `1px solid ${C.line}` : undefined }}>
                  <div className="font-serif text-lg" style={{ color: C.gold }}>{f.q}</div>
                  <div className="mt-1.5 text-[0.95rem]" style={{ color: C.s4 }}>{f.a}</div>
                </div>
              ))}
            </div>

            {/* related symbols */}
            {related.length > 0 && (
              <div className="mt-10">
                <h2 className="font-serif font-medium text-white" style={{ fontSize: '1.4rem' }}>More {cat.en.toLowerCase()} <span lang="hi" style={{ color: C.goldSoft }}>· {cat.hi}</span></h2>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {related.map((s) => (
                    <a key={s.symbol_key} href={`/swapna/${s.symbol_key}`} className="rounded-full px-4 py-2 text-[0.9rem]"
                      style={{ background: C.panel, border: `1px solid ${C.line}`, color: C.s3 }}>
                      {EMOJI[s.symbol_key] || '✦'} {s.symbol_en}
                    </a>
                  ))}
                  <a href={`/swapna/category/${r0.category}`} className="rounded-full px-4 py-2 text-[0.9rem]" style={{ border: `1px solid ${C.line2}`, color: C.gold }}>
                    All {cat.en.toLowerCase()} →
                  </a>
                </div>
              </div>
            )}

            {/* Rule 0 disclaimer */}
            <p className="mt-12 text-center text-[12px] leading-relaxed" style={{ color: C.s5 }}>
              Trikaal Vaani offers Vedic dream interpretation for reflection and guidance. It is not a substitute for professional medical, legal, or financial advice.
            </p>

          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}

// ============================================================================
// END — app/swapna/[symbol]/page.tsx v1.0 · 🔱 Trikaal Vaani
// ============================================================================
