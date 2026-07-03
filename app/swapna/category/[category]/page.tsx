// 🔱 TRIKAAL VAANI | app/swapna/category/[category]/page.tsx | v1.0
// Owner: Rohiit Gupta, Chief Vedic Architect
// SWAPNA REALM PAGE — one page per dream family (12 pages), served entirely
// from the dream_symbols Supabase table. Zero Gemini cost. ISR 1h.
// Hub-spoke: /swapna (hub) ↔ /swapna/category/[category] ↔ /swapna/[symbol].
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

const REALMS: Record<string, { emoji: string; en: string; hi: string; blurb: string }> = {
  snake: { emoji: '🐍', en: 'Serpent Dreams', hi: 'सर्प स्वप्न', blurb: 'Snakes are among the most powerful dream symbols in Swapna Shastra — carriers of Rahu-Ketu energy, hidden matters, kundalini and the Naga devta. Bites, colours and actions each change the meaning.' },
  death: { emoji: '🕯️', en: 'Death & Ancestor Dreams', hi: 'मृत्यु स्वप्न', blurb: 'In the classical tradition, death dreams rarely mean death — one\'s own death signals long life, and ancestors appear with blessings or with a request (Pitra signals).' },
  deity: { emoji: '🛕', en: 'Deity Dreams', hi: 'देव स्वप्न', blurb: 'Darshan of a deity is among the most auspicious dreams in Swapna Shastra — the Bṛhat Jātaka counts receiving prasad among the finest omens. Each deity blesses a different life-area.' },
  water: { emoji: '🌊', en: 'Water Dreams', hi: 'जल स्वप्न', blurb: 'Water is Chandra — the mind and emotions. Clean water calms, turbulent water warns; rivers, floods, the sea and Ganga-snan each carry their own classical reading.' },
  body: { emoji: '🧍', en: 'Body Dreams', hi: 'शरीर स्वप्न', blurb: 'Teeth falling, hair, flying, falling, being chased — the body\'s dream language is the most commonly searched of all. Classical readings differ sharply by detail.' },
  bodily_function: { emoji: '💧', en: 'Body-Sign Dreams', hi: 'शारीरिक संकेत', blurb: 'Some of the most surprising inversions in Swapna Shastra live here — including the famous reading of faeces as incoming wealth (dhan-laabh).' },
  sexual: { emoji: '❤️', en: 'Intimacy Dreams', hi: 'निकटता स्वप्न', blurb: 'The tradition reads these dreams symbolically — desire, longing and connection — never literally, and always with dignity.' },
  conflict: { emoji: '⚔️', en: 'Conflict Dreams', hi: 'संघर्ष स्वप्न', blurb: 'Fights, attacks, weapons and war carry Mangal\'s energy. Victory, defeat and who you fight each change the classical meaning.' },
  animal: { emoji: '🦌', en: 'Animal Dreams', hi: 'पशु स्वप्न', blurb: 'Gau Mata, the elephant of Ganesha, the crow of the ancestors, the owl of Lakshmi — animals are the richest symbol family in the tradition.' },
  life_event: { emoji: '✨', en: 'Life-Event Dreams', hi: 'जीवन-घटना स्वप्न', blurb: 'Weddings, exams, gold, money, journeys, pregnancy — dreams of life\'s milestones, where the classical readings often invert what you\'d expect.' },
  celestial: { emoji: '☀️', en: 'Sky & Element Dreams', hi: 'आकाश स्वप्न', blurb: 'Sun, moon, eclipse, fire, storms and stars — the Atharvaveda\'s own dream territory, where the grahas appear in their raw form.' },
  food: { emoji: '🍚', en: 'Food Dreams', hi: 'भोजन स्वप्न', blurb: 'What you eat, where, and at whose table — in Swapna Shastra the setting changes everything: prasad at a temple and food at an enemy\'s house read very differently.' },
};

interface Row { symbol_key: string; symbol_en: string; symbol_hi: string; meaning_en: string; updated_at: string | null }

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getCategorySymbols(category: string): Promise<Row[]> {
  try {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from('dream_symbols')
      .select('symbol_key,symbol_en,symbol_hi,meaning_en,updated_at')
      .eq('category', category)
      .order('id', { ascending: true });
    if (error || !data) return [];
    const seen = new Set<string>(); const out: Row[] = [];
    for (const r of data as Row[]) {
      if (!seen.has(r.symbol_key)) { seen.add(r.symbol_key); out.push(r); }
    }
    return out;
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const realm = REALMS[params.category];
  if (!realm) return { title: 'Dream Meanings | Swapna Shastra — Trikaal Vaani' };
  const title = `${realm.en} (${realm.hi}) — Meanings in Vedic Swapna Shastra | Trikaal Vaani`;
  const description = `${realm.blurb.slice(0, 140)}… Every ${realm.en.toLowerCase().replace(' dreams', '')} dream decoded from classical texts, free at Trikaal Vaani.`;
  const url = `${BASE}/swapna/category/${params.category}`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', locale: 'en_IN', siteName: 'Trikaal Vaani' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function SwapnaCategoryPage({ params }: { params: { category: string } }) {
  const realm = REALMS[params.category];
  if (!realm) notFound();

  const symbols = await getCategorySymbols(params.category);
  if (symbols.length === 0) notFound();

  const siblings = Object.entries(REALMS).filter(([k]) => k !== params.category);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${realm.en} (${realm.hi}) — Vedic Swapna Shastra`,
        url: `${BASE}/swapna/category/${params.category}`,
        inLanguage: ['en-IN', 'hi-IN'],
        about: { '@type': 'Thing', name: `${realm.en} interpretation (Swapna Shastra)` },
        isPartOf: { '@type': 'WebSite', name: 'Trikaal Vaani', url: BASE },
        hasPart: symbols.map((s) => ({ '@type': 'WebPage', name: `${s.symbol_en} Dream Meaning`, url: `${BASE}/swapna/${s.symbol_key}` })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Swapna Shastra', item: `${BASE}/swapna` },
          { '@type': 'ListItem', position: 3, name: realm.en, item: `${BASE}/swapna/category/${params.category}` },
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
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen" style={{ background: C.night, color: '#fff' }}>
        <SiteNav />
        <main className="px-4 pt-14 pb-20">
          <div className="max-w-4xl mx-auto">

            {/* breadcrumb */}
            <nav className="text-[12.5px]" style={{ color: C.s5 }}>
              <a href="/" className="hover:underline">Home</a> <span>›</span>{' '}
              <a href="/swapna" className="hover:underline">Swapna Shastra</a> <span>›</span>{' '}
              <span style={{ color: C.goldSoft }}>{realm.en}</span>
            </nav>

            {/* hero */}
            <div className="text-center mt-8">
              <div className="text-[58px]" style={{ filter: 'drop-shadow(0 0 22px rgba(240,214,138,0.5))' }}>{realm.emoji}</div>
              <h1 className="font-serif font-medium leading-tight text-white mt-3" style={{ fontSize: 'clamp(2rem,5.4vw,3.2rem)' }}>{realm.en}</h1>
              <p className="font-serif mt-1" style={{ fontSize: 'clamp(1.1rem,3vw,1.5rem)', color: C.goldSoft }} lang="hi">{realm.hi}</p>
            </div>

            {/* GEO intro */}
            <p className="mt-6 text-[1.03rem] leading-relaxed text-center max-w-2xl mx-auto" style={{ color: C.s3 }}>
              {realm.blurb} Every meaning below is traced to classical Swapna Shastra and validated by Rohiit Gupta, Chief Vedic Architect — decode your own dream free at Trikaal Vaani.
            </p>

            <div className="text-center mt-7">
              <a href="/swapna#try" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-transform duration-300 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, color: '#100B02', boxShadow: '0 10px 28px rgba(168,130,10,0.35)' }}>
                Decode YOUR dream — free →
              </a>
            </div>

            {/* symbol cards */}
            <h2 className="font-serif font-medium text-white mt-12" style={{ fontSize: 'clamp(1.5rem,3.6vw,2.1rem)' }}>
              Every symbol in this realm
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
              {symbols.map((s) => (
                <a key={s.symbol_key} href={`/swapna/${s.symbol_key}`}
                  className="rounded-[16px] p-5 transition-transform duration-200 hover:-translate-y-1"
                  style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[30px]">{EMOJI[s.symbol_key] || realm.emoji}</span>
                    <div>
                      <div className="font-serif text-lg text-white">{s.symbol_en}</div>
                      <div className="font-serif text-[0.9rem]" style={{ color: C.goldSoft }} lang="hi">{s.symbol_hi}</div>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[0.9rem]" style={{ color: C.s4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.meaning_en}
                  </p>
                  <div className="mt-2 text-[0.85rem] font-semibold" style={{ color: C.gold }}>Full meaning →</div>
                </a>
              ))}
            </div>

            {/* sibling realms */}
            <h2 className="font-serif font-medium text-white mt-12" style={{ fontSize: '1.4rem' }}>Other realms of dreams</h2>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {siblings.map(([k, v]) => (
                <a key={k} href={`/swapna/category/${k}`} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.9rem]"
                  style={{ background: C.panel, border: `1px solid ${C.line}`, color: C.s3 }}>
                  {v.emoji} {v.en} <span className="font-serif text-[0.85rem]" style={{ color: C.goldSoft }} lang="hi">{v.hi}</span>
                </a>
              ))}
            </div>

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
// END — app/swapna/category/[category]/page.tsx v1.0 · 🔱 Trikaal Vaani
// ============================================================================
