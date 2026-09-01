'use client';

// ============================================================
// File: app/calculators/free-nakshatra-calculator/page.tsx
// Version: v4.0 — Free Nakshatra Calculator (Radar E3 content build)
// VM structure: grahas[Moon].nakshatra, .pada, .nakshatra_lord
// Janma Nakshatra = Moon's nakshatra per Parashar BPHS
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v4.0 (2026-08-31) — CONTENT + FUNCTIONALITY REBUILD.
//        Sixth page in this series. Driven by the Radar E3 PAA/PASF brief
//        (31 Aug 2026). This one differs from the previous five: the
//        cluster behind it is thin (only ~12 linkable articles vs 44–67
//        for gemstone/pitra/sade-sati), so instead of leaning on internal
//        links alone this build adds REAL COMPUTED FEATURES.
//        • Word count 502 → 3,300+. It was the thinnest page on the site.
//          Live baseline 31 Aug: 502 words, 5 H2, 24 links — the 24 being
//          header/footer nav only.
//        • 9 new H2 sections, one per brief keyword, seen_count order.
//        • TWO NEW COMPUTED RESULT CARDS, not article text:
//            1. NAMAKARAN SYLLABLE — the classical 108-syllable chart is now
//               in NAKSHATRA_DATA, so the page returns the actual naming
//               letter for the user's nakshatra+pada. This is the single
//               most-searched keyword on the page ("जन्म तारीख से नाम",
//               seen 4x) and it was previously not answered at all.
//            2. GANDMOOL CHECK — the six Gandmool nakshatras with PADA-WISE
//               severity. Most tools return a bare yes/no; this returns
//               "yes, but your pada is not the sensitive one", which is the
//               true classical position and defuses most of the fear.
//               Covers two brief keywords ("गंडमूल नक्षत्र कैलकुलेटर" and
//               "Mool nakshatra kaise pata kare").
//        • NAKSHATRA_DATA extended with hi / tamil / malayalam / syllables.
//          The 27-row master table it feeds answers three brief keywords at
//          once: the 27-name list, "birth star in English", and the
//          Tamil/Malayalam finder.
//        • FAQS expanded 5 → 14 (all feed the existing FAQPage schema).
//
//        HONESTY CALLS, deliberate:
//          – "नाम से नक्षत्र कैसे जाने" (seen 2x): answered by saying this is
//            an inference, not a calculation — several syllables map to more
//            than one nakshatra, and for a modern name not chosen by
//            nakshatra the method is meaningless.
//          – Tamil/Malayalam names: stated plainly that transliteration
//            varies by region, almanac and family, and that the spellings
//            given are the most common forms rather than the only correct
//            ones.
//          – "birth star in English": explained that a nakshatra is a
//            13°20\' segment, not a star, and has NO Western zodiac
//            equivalent — rather than inventing a correspondence table.
//          – Gandmool: the 27th-day Shanti is the classical remedy, and
//            charging thousands for it is market, not tradition.
//        • FORM, VALIDATION, API CALL (/api/calc/kundali), Moon-graha
//          extraction, template Dos/Donts/Remedies, DetailCell, Remedy and
//          buildCalcJsonLd() ARE UNCHANGED from v3.1.
//   v3.1 (2026-06-02) — Gold-standard JSON-LD ADDED (page had none):
//        buildCalcJsonLd() helper emits 8 @id-linked nodes. Added
//        `.tv-aeo-answer` class to above-fold answer for speakable.
//   v3.0 — Fixed: Moon nakshatra (not Lagna nakshatra).
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface PlaceSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface FormData {
  name: string;
  gender: 'male' | 'female' | 'other' | '';
  date: string;
  time: string;
  unknownTime: boolean;
  placeQuery: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  timezone: number;
}


// ─── 27 Nakshatra reference table (BPHS) ────────────────────
// v2.0 adds four fields per nakshatra, all of which the page now uses:
//   hi         — Devanagari name (for the master table)
//   tamil      — Tamil name  ┐ regional transliterations vary by region and
//   malayalam  — Malayalam   ┘ almanac; the page says so rather than pretending
//                             one spelling is canonical
//   syllables  — the four classical Namakaran syllables, one per pada.
//                This is what turns "जन्म तारीख से नाम" (the single most
//                searched keyword on this page) into an actual computed
//                answer instead of an article.
const NAKSHATRA_DATA: Record<string, any> = {
  'Ashwini':            { hi: 'अश्विनी',       tamil: 'Aswini',        malayalam: 'Ashwathi',      syllables: ['Chu', 'Che', 'Cho', 'La'],  lord: 'Ketu',    deity: 'Ashwini Kumaras', symbol: 'Horse head',      gana: 'Deva',     yoni: 'Horse',    nadi: 'Aadi',   trait: 'Healer, swift, pioneering' },
  'Bharani':            { hi: 'भरणी',          tamil: 'Barani',        malayalam: 'Bharani',       syllables: ['Li', 'Lu', 'Le', 'Lo'],     lord: 'Shukra',  deity: 'Yama',            symbol: 'Yoni',            gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya', trait: 'Bearer, transformative, intense' },
  'Krittika':           { hi: 'कृत्तिका',       tamil: 'Kaarthigai',    malayalam: 'Karthika',      syllables: ['A', 'I', 'U', 'E'],         lord: 'Surya',   deity: 'Agni',            symbol: 'Razor/Flame',     gana: 'Rakshasa', yoni: 'Sheep',    nadi: 'Antya',  trait: 'Sharp, purifying, leader' },
  'Rohini':             { hi: 'रोहिणी',        tamil: 'Rohini',        malayalam: 'Rohini',        syllables: ['O', 'Va', 'Vi', 'Vu'],      lord: 'Chandra', deity: 'Brahma',          symbol: 'Chariot',         gana: 'Manushya', yoni: 'Serpent',  nadi: 'Antya',  trait: 'Beautiful, creative, magnetic' },
  'Mrigashira':         { hi: 'मृगशिरा',       tamil: 'Mirugasiridam', malayalam: 'Makayiram',     syllables: ['Ve', 'Vo', 'Ka', 'Ki'],     lord: 'Mangal',  deity: 'Soma',            symbol: 'Deer head',       gana: 'Deva',     yoni: 'Serpent',  nadi: 'Madhya', trait: 'Seeker, curious, gentle' },
  'Ardra':              { hi: 'आर्द्रा',        tamil: 'Thiruvathirai', malayalam: 'Thiruvathira',  syllables: ['Ku', 'Gha', 'Ang', 'Chha'], lord: 'Rahu',    deity: 'Rudra',           symbol: 'Teardrop',        gana: 'Manushya', yoni: 'Dog',      nadi: 'Aadi',   trait: 'Stormy, transformative, intense' },
  'Punarvasu':          { hi: 'पुनर्वसु',       tamil: 'Punarpoosam',   malayalam: 'Punartham',     syllables: ['Ke', 'Ko', 'Ha', 'Hi'],     lord: 'Guru',    deity: 'Aditi',           symbol: 'Bow & quiver',    gana: 'Deva',     yoni: 'Cat',      nadi: 'Aadi',   trait: 'Renewer, optimistic, philosophical' },
  'Pushya':             { hi: 'पुष्य',         tamil: 'Poosam',        malayalam: 'Pooyam',        syllables: ['Hu', 'He', 'Ho', 'Da'],     lord: 'Shani',   deity: 'Brihaspati',      symbol: 'Cow udder',       gana: 'Deva',     yoni: 'Sheep',    nadi: 'Madhya', trait: 'Nurturing, scholarly, most auspicious' },
  'Ashlesha':           { hi: 'आश्लेषा',        tamil: 'Ayilyam',       malayalam: 'Ayilyam',       syllables: ['Di', 'Du', 'De', 'Do'],     lord: 'Budh',    deity: 'Nagas',           symbol: 'Coiled snake',    gana: 'Rakshasa', yoni: 'Cat',      nadi: 'Antya',  trait: 'Mystical, hypnotic, deep wisdom' },
  'Magha':              { hi: 'मघा',           tamil: 'Magam',         malayalam: 'Makam',         syllables: ['Ma', 'Mi', 'Mu', 'Me'],     lord: 'Ketu',    deity: 'Pitru',           symbol: 'Throne',          gana: 'Rakshasa', yoni: 'Rat',      nadi: 'Antya',  trait: 'Royal, ancestral, authoritative' },
  'Purva Phalguni':     { hi: 'पूर्वा फाल्गुनी', tamil: 'Pooram',        malayalam: 'Pooram',        syllables: ['Mo', 'Ta', 'Ti', 'Tu'],     lord: 'Shukra',  deity: 'Bhaga',           symbol: 'Hammock',         gana: 'Manushya', yoni: 'Rat',      nadi: 'Madhya', trait: 'Pleasure-loving, creative, charming' },
  'Uttara Phalguni':    { hi: 'उत्तरा फाल्गुनी', tamil: 'Uthiram',       malayalam: 'Uthram',        syllables: ['Te', 'To', 'Pa', 'Pi'],     lord: 'Surya',   deity: 'Aryaman',         symbol: 'Bed',             gana: 'Manushya', yoni: 'Cow',      nadi: 'Aadi',   trait: 'Generous, helpful, leader' },
  'Hasta':              { hi: 'हस्त',          tamil: 'Astham',        malayalam: 'Atham',         syllables: ['Pu', 'Sha', 'Na', 'Tha'],   lord: 'Chandra', deity: 'Savitar',         symbol: 'Hand/Fist',       gana: 'Deva',     yoni: 'Buffalo',  nadi: 'Aadi',   trait: 'Skilled, dexterous, witty' },
  'Chitra':             { hi: 'चित्रा',         tamil: 'Chithirai',     malayalam: 'Chithira',      syllables: ['Pe', 'Po', 'Ra', 'Ri'],     lord: 'Mangal',  deity: 'Vishwakarma',     symbol: 'Pearl/Jewel',     gana: 'Rakshasa', yoni: 'Tiger',    nadi: 'Madhya', trait: 'Artistic, brilliant, attractive' },
  'Swati':              { hi: 'स्वाति',         tamil: 'Swathi',        malayalam: 'Chothi',        syllables: ['Ru', 'Re', 'Ro', 'Ta'],     lord: 'Rahu',    deity: 'Vayu',            symbol: 'Sword/Coral',     gana: 'Deva',     yoni: 'Buffalo',  nadi: 'Antya',  trait: 'Independent, diplomatic, restless' },
  'Vishakha':           { hi: 'विशाखा',        tamil: 'Visakam',       malayalam: 'Vishakham',     syllables: ['Ti', 'Tu', 'Te', 'To'],     lord: 'Guru',    deity: 'Indra-Agni',      symbol: 'Triumphal arch',  gana: 'Rakshasa', yoni: 'Tiger',    nadi: 'Antya',  trait: 'Ambitious, goal-driven, determined' },
  'Anuradha':           { hi: 'अनुराधा',       tamil: 'Anusham',       malayalam: 'Anizham',       syllables: ['Na', 'Ni', 'Nu', 'Ne'],     lord: 'Shani',   deity: 'Mitra',           symbol: 'Lotus',           gana: 'Deva',     yoni: 'Deer',     nadi: 'Madhya', trait: 'Devoted, friendly, balanced' },
  'Jyeshtha':           { hi: 'ज्येष्ठा',       tamil: 'Kettai',        malayalam: 'Thrikketta',    syllables: ['No', 'Ya', 'Yi', 'Yu'],     lord: 'Budh',    deity: 'Indra',           symbol: 'Earring',         gana: 'Rakshasa', yoni: 'Deer',     nadi: 'Aadi',   trait: 'Eldest, protective, occult-inclined' },
  'Mula':               { hi: 'मूल',           tamil: 'Moolam',        malayalam: 'Moolam',        syllables: ['Ye', 'Yo', 'Bha', 'Bhi'],   lord: 'Ketu',    deity: 'Nirriti',         symbol: 'Bundle of roots', gana: 'Rakshasa', yoni: 'Dog',      nadi: 'Aadi',   trait: 'Investigator, root-seeker, intense' },
  'Purva Ashadha':      { hi: 'पूर्वाषाढ़ा',     tamil: 'Pooradam',      malayalam: 'Pooradam',      syllables: ['Bhu', 'Dha', 'Pha', 'Dha'],lord: 'Shukra',  deity: 'Apah',            symbol: 'Fan/Tusk',        gana: 'Manushya', yoni: 'Monkey',   nadi: 'Madhya', trait: 'Invincible, persuasive, fearless' },
  'Uttara Ashadha':     { hi: 'उत्तराषाढ़ा',     tamil: 'Uthiradam',     malayalam: 'Uthradam',      syllables: ['Bhe', 'Bho', 'Ja', 'Ji'],   lord: 'Surya',   deity: 'Vishvedevas',     symbol: 'Elephant tusk',   gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya',  trait: 'Universal leader, righteous, victorious' },
  'Shravana':           { hi: 'श्रवण',         tamil: 'Thiruvonam',    malayalam: 'Thiruvonam',    syllables: ['Ju', 'Je', 'Jo', 'Gha'],    lord: 'Chandra', deity: 'Vishnu',          symbol: 'Ear',             gana: 'Deva',     yoni: 'Monkey',   nadi: 'Antya',  trait: 'Listener, learned, fame-oriented' },
  'Dhanishta':          { hi: 'धनिष्ठा',       tamil: 'Avittam',       malayalam: 'Avittam',       syllables: ['Ga', 'Gi', 'Gu', 'Ge'],     lord: 'Mangal',  deity: 'Vasus',           symbol: 'Drum/Flute',      gana: 'Rakshasa', yoni: 'Lion',     nadi: 'Madhya', trait: 'Musical, wealthy, rhythmic' },
  'Shatabhisha':        { hi: 'शतभिषा',        tamil: 'Sadayam',       malayalam: 'Chathayam',     syllables: ['Go', 'Sa', 'Si', 'Su'],     lord: 'Rahu',    deity: 'Varuna',          symbol: 'Empty circle',    gana: 'Rakshasa', yoni: 'Horse',    nadi: 'Aadi',   trait: 'Healer, mystic, hundred-physicians' },
  'Purva Bhadrapada':   { hi: 'पूर्वा भाद्रपद',  tamil: 'Poorattathi',   malayalam: 'Pooruruttathi', syllables: ['Se', 'So', 'Da', 'Di'],     lord: 'Guru',    deity: 'Aja Ekapada',     symbol: 'Two-faced man',   gana: 'Manushya', yoni: 'Lion',     nadi: 'Aadi',   trait: 'Transformative, fiery, dualistic' },
  'Uttara Bhadrapada':  { hi: 'उत्तरा भाद्रपद',  tamil: 'Uthirattathi',  malayalam: 'Uthrattathi',   syllables: ['Du', 'Tha', 'Jha', 'Tra'],  lord: 'Shani',   deity: 'Ahirbudhnya',     symbol: 'Serpent in deep', gana: 'Manushya', yoni: 'Cow',      nadi: 'Madhya', trait: 'Deep wisdom, mystical, kundalini' },
  'Revati':             { hi: 'रेवती',         tamil: 'Revathi',       malayalam: 'Revathi',       syllables: ['De', 'Do', 'Cha', 'Chi'],   lord: 'Budh',    deity: 'Pushan',          symbol: 'Fish',            gana: 'Deva',     yoni: 'Elephant', nadi: 'Antya',  trait: 'Wealthy, kind, protector' },
};

// ─── Nakshatra order, used for the master table and Gandmool logic ──
const NAK_ORDER = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

// ─── GANDMOOL (v2.0) ────────────────────────────────────────
// The six Gandmool nakshatras are the ones ruled by Ketu and Budh, which sit
// at the junctions (sandhi) between a fire sign and the next sign. They are:
// Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati.
//
// `severePada` holds the pada traditionally regarded as the most sensitive —
// the one that falls exactly on the rashi junction. This is a graded reading,
// not a verdict, and the UI says so: most Gandmool births are unremarkable and
// the classical remedy is a simple 27th-day Shanti, not anything expensive.
const GANDMOOL: Record<string, { severePada: number; junction: string }> = {
  'Ashwini':  { severePada: 1, junction: 'मीन–मेष संधि' },
  'Ashlesha': { severePada: 4, junction: 'कर्क–सिंह संधि' },
  'Magha':    { severePada: 1, junction: 'कर्क–सिंह संधि' },
  'Jyeshtha': { severePada: 4, junction: 'वृश्चिक–धनु संधि' },
  'Mula':     { severePada: 1, junction: 'वृश्चिक–धनु संधि' },
  'Revati':   { severePada: 4, junction: 'मीन–मेष संधि' },
};
// ─── Google Maps via /api/maps-proxy ──────────────────────────
async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `/api/maps-proxy?url=${encodeURIComponent('https://places.googleapis.com/v1/places:autocomplete')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: query,
          includedPrimaryTypes: ['locality', 'administrative_area_level_3'],
          languageCode: 'en',
        }),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? [])
      .filter((s: any) => s.placePrediction)
      .map((s: any) => ({
        place_id: s.placePrediction.placeId ?? '',
        description: s.placePrediction.text?.text ?? '',
        main_text: s.placePrediction.structuredFormat?.mainText?.text ?? s.placePrediction.text?.text ?? '',
        secondary_text: s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
      }));
  } catch { return []; }
}

async function fetchPlaceDetails(placeId: string): Promise<{ lat: number; lng: number; city: string } | null> {
  if (!placeId) return null;
  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=location,displayName`;
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const lat = data.location?.latitude ?? null;
    const lng = data.location?.longitude ?? null;
    if (lat === null || lng === null) return null;
    return { lat, lng, city: data.displayName?.text ?? '' };
  } catch { return null; }
}

async function fetchTimezone(lat: number, lng: number): Promise<number> {
  try {
    const ts = Math.floor(Date.now() / 1000);
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}`;
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) return 5.5;
    const data = await res.json();
    if (data.status !== 'OK') return 5.5;
    return Math.round(((data.rawOffset + data.dstOffset) / 3600) * 4) / 4;
  } catch { return 5.5; }
}

function CityInput({ id, value, onSelect, error }: {
  id: string; value: string;
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void;
  error?: string;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  const handleChange = (val: string) => {
    setQuery(val); setSelected(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSuggestions(await fetchPlaceSuggestions(val));
      setLoading(false);
    }, 400);
  };

  const handleSelect = async (s: PlaceSuggestion) => {
    setQuery(s.main_text); setSuggestions([]); setSelected(true); setLoading(true);
    const details = await fetchPlaceDetails(s.place_id);
    if (details) {
      const tz = await fetchTimezone(details.lat, details.lng);
      onSelect(details.city || s.main_text, details.lat, details.lng, tz);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input id={id} type="search" autoComplete="off" placeholder="Type city of birth..."
          value={query} onChange={e => handleChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-10"
          style={{ background: '#0d1120', border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          {loading ? <span style={{ color: GOLD }}>⟳</span> : selected ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#475569' }}>📍</span>}
        </span>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
          style={{ background: '#0d1120', border: '1px solid rgba(212,175,55,0.2)', maxHeight: '200px', overflowY: 'auto' }}>
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => handleSelect(s)} className="px-4 py-3 text-sm cursor-pointer"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = GOLD_RGBA(0.08))}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 600 }}>{s.main_text}</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>{s.secondary_text}</p>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}


// ============================================================
// v2.0 — MARKDOWN-LITE RENDERER
// ============================================================
function renderRich(text: string, keyBase: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <Link key={`${keyBase}-l-${i}`} href={link[2]} style={{ color: GOLD }}
          className="font-semibold underline underline-offset-2 hover:opacity-80 transition">
          {link[1]}
        </Link>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyBase}-b-${i}`} style={{ color: GOLD }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyBase}-s-${i}`}>{part}</span>;
  });
}

// ============================================================
// v2.0 — PILLAR CONTENT
// Every h2 is a keyword Google itself surfaced in PAA/PASF for this
// page's SERPs (Radar E3, 31 Aug 2026), ordered by seen_count (4 → 2).
// ============================================================
type PillarSection = { id: string; h2: string; paras: string[] };

const PILLAR: PillarSection[] = [
  {
    id: 'naam-aur-rashi',
    h2: 'जन्म तारीख से नाम और राशि — ऑनलाइन कैसे निकालें',
    paras: [
      'यह इस पेज का सबसे ज्यादा खोजा जाने वाला सवाल है, और इसका जवाब ऊपर वाला कैलकुलेटर **गणना करके** देता है, लेख पढ़ाकर नहीं। जन्म तिथि, सटीक समय और स्थान डालिए — और तीनों चीजें एक साथ मिलती हैं: **चंद्र राशि**, **जन्म नक्षत्र**, और **नामकरण का शुभ अक्षर**।',
      'नामकरण अक्षर कैसे निकलता है, यह जान लेना उपयोगी है क्योंकि यही सबसे कम समझा जाता है। हर नक्षत्र **चार पादों** में बँटा है, और **हर पाद का अपना एक निश्चित अक्षर** होता है — 27 × 4 = कुल **108 अक्षर**। जन्म के समय चंद्रमा जिस नक्षत्र के जिस पाद में था, वही अक्षर बच्चे के नाम का पहला अक्षर माना जाता है। यह परंपरा नहीं, गणना है — इसीलिए दो अलग पंडित एक ही अक्षर बताते हैं, बशर्ते जन्म समय एक हो।',
      'एक जरूरी चेतावनी: **यह सब जन्म समय पर टिका है।** चंद्रमा एक नक्षत्र लगभग सवा दिन में पार करता है और एक पाद लगभग छह घंटे में — इसलिए कुछ घंटों की गलती पाद बदल देती है, और पाद बदलते ही अक्षर बदल जाता है। जन्म समय अस्पताल के रिकॉर्ड से लीजिए। पूरी अक्षर-सूची [नक्षत्र अनुसार शुभ नाम अक्षर](/blog/lucky-baby-name-letter-by-nakshatra-hindi) में है, और नाम चुनने में मदद के लिए [नक्षत्र से शिशु नाम कैलकुलेटर](/calculators/free-baby-name-by-nakshatra) अलग से है।',
      'एक और बात जो अक्सर टकराव पैदा करती है: **घर का नाम और राशि-नाम अलग हो सकते हैं, और यह बिल्कुल सामान्य है।** परंपरा में बहुत से परिवार दो नाम रखते हैं — एक वह जो नक्षत्र-अक्षर से शुरू होता है और संस्कारों व कुंडली में इस्तेमाल होता है, और दूसरा वह जिससे बच्चा रोज बुलाया जाता है। दोनों में से किसी को छोड़ना नहीं पड़ता। अगर बच्चे का नाम पहले ही रखा जा चुका है और वह नक्षत्र-अक्षर से नहीं है, तो कुछ बिगड़ता नहीं — शास्त्र में नाम शुभ संकेत है, बंधन नहीं।',
      'और अगर आप अपना खुद का नक्षत्र देख रहे हैं, न कि बच्चे का, तो यह अक्षर आपके लिए भी काम का है — परंपरा में इसी अक्षर से शुरू होने वाले मंत्र, संकल्प और शुभ कार्य के नाम चुने जाते हैं। पर सबसे ज्यादा उपयोग नामकरण संस्कार में ही होता है, और वहीं इसकी मांग सबसे ज्यादा है।',
    ],
  },
  {
    id: 'naam-se-nakshatra',
    h2: 'नाम से नक्षत्र कैसे जानें?',
    paras: [
      'यहाँ ईमानदारी जरूरी है, क्योंकि यह सवाल अक्सर उल्टी दिशा से पूछा जाता है: **नाम से नक्षत्र निकालना गणना नहीं, अनुमान है।** नक्षत्र जन्म के समय चंद्रमा की स्थिति से बनता है — नाम से नहीं। नाम अगर परंपरा के अनुसार रखा गया हो, तो उसका पहला अक्षर नक्षत्र-पाद की ओर **इशारा** कर सकता है, पर यह उल्टी दिशा में चलना है और भरोसेमंद नहीं।',
      'फिर भी अगर जन्म समय बिल्कुल उपलब्ध नहीं है और नाम परंपरा से रखा गया है, तो तरीका यह है: ऊपर बताए 108 अक्षरों में अपने नाम का पहला अक्षर ढूँढिए — वह अक्षर एक विशेष नक्षत्र-पाद की ओर ले जाएगा। समस्या यह है कि **कई अक्षर एक से अधिक नक्षत्रों में आते हैं** (उदाहरण के लिए "Ta" स्वाति और पूर्वा फाल्गुनी दोनों में मिलता है), इसलिए उत्तर एक नहीं, कई संभावनाएँ होंगी।',
      'व्यावहारिक सलाह: **अगर जन्म तिथि भी पता है तो नाम वाला रास्ता छोड़ दीजिए।** केवल तिथि से भी चंद्र राशि लगभग सही निकल आती है, और वह नाम-अनुमान से कहीं बेहतर है। और अगर आधुनिक नाम है जो नक्षत्र देखकर नहीं रखा गया — जो आज बहुत आम है — तो नाम से नक्षत्र निकालने का कोई अर्थ ही नहीं रह जाता।',
      'एक और स्थिति जिसमें यह सवाल आता है: **कुंडली मिलान के समय सामने वाले पक्ष का नक्षत्र चाहिए और उनका जन्म समय नहीं मिल रहा।** ऐसे में नाम से अनुमान लगाने के बजाय सीधा उनसे जन्म तिथि माँग लीजिए — केवल तिथि से भी चंद्र राशि और अक्सर नक्षत्र भी लगभग सही निकल आता है, क्योंकि चंद्रमा एक नक्षत्र में लगभग सवा दिन रहता है। नाम का रास्ता तब भी आखिरी विकल्प ही रहना चाहिए।',
    ],
  },
  {
    id: '27-nakshatra-list',
    h2: 'जन्म नक्षत्र के नाम — पूरी 27 की सूची',
    paras: [
      'नीचे की तालिका में **सभी 27 नक्षत्र** हैं — देवनागरी नाम, अंग्रेज़ी वर्तनी, तमिल और मलयालम नाम, स्वामी ग्रह, और चारों पादों के **नामकरण अक्षर**। यही एक तालिका इस पेज पर पूछे जाने वाले तीन अलग सवालों का जवाब देती है, इसलिए इसे एक जगह रखा गया है।',
      'क्रम भी अपने आप में जानकारी है: सूची **अश्विनी से शुरू होकर रेवती पर खत्म** होती है, और यह क्रम राशिचक्र में 0° मेष से 360° तक चलता है। हर नक्षत्र **13°20\'** का होता है, और हर पाद **3°20\'** का। नौ नक्षत्र के बाद क्रम दोहराता है — यही कारण है कि स्वामी ग्रहों का क्रम (केतु, शुक्र, सूर्य, चंद्र, मंगल, राहु, गुरु, शनि, बुध) तीन बार आता है, और यही विंशोत्तरी दशा का आधार भी है।',
      'तालिका में एक और चीज़ छिपी है जो काम की है: **स्वामी ग्रह का क्रम ही आपकी विंशोत्तरी दशा तय करता है।** जिस नक्षत्र में जन्म हुआ, उसी नक्षत्र के स्वामी की महादशा से जीवन शुरू होता है — यानी अश्विनी, मघा या मूल में जन्मे व्यक्ति की पहली महादशा केतु की होगी; रोहिणी, हस्त या श्रवण वालों की चंद्र की। यही कारण है कि दशा जानने के लिए नक्षत्र जानना पहली शर्त है, और [दशा कैलकुलेटर](/calculators/free-dasha-calculator) भी अंदर से यही गणना करता है।',
      'क्षेत्रीय नामों पर एक ईमानदार नोट: **तमिल और मलयालम वर्तनी क्षेत्र और पंचांग के हिसाब से बदलती है।** नीचे जो दिया गया है वह सबसे प्रचलित रूप है, पर आपके स्थानीय पंचांग में थोड़ी अलग वर्तनी मिल सकती है — नक्षत्र वही रहेगा, सिर्फ लिखने का तरीका अलग होगा।',
    ],
  },
  {
    id: 'gandmool',
    h2: 'गंडमूल नक्षत्र कैलकुलेटर — क्या आपका जन्म गंडमूल में है?',
    paras: [
      '**ऊपर वाला कैलकुलेटर यह अपने आप जाँच लेता है** — अगर आपका जन्म नक्षत्र गंडमूल है तो परिणाम में अलग से कार्ड दिखता है, पाद सहित। अलग से कोई गंडमूल कैलकुलेटर चलाने की जरूरत नहीं।',
      'गंडमूल कहलाते हैं वे **छह नक्षत्र** जो **केतु और बुध** के स्वामित्व में आते हैं और राशियों की **संधि** पर पड़ते हैं — **अश्विनी, आश्लेषा, मघा, ज्येष्ठा, मूल और रेवती।** "गंड" का अर्थ है गाँठ या संधि, और "मूल" जड़। परंपरा में माना जाता है कि संधि-बिंदु पर जन्म लेने वाले बच्चे का आरंभिक जीवन थोड़ा संवेदनशील होता है, विशेषकर पिता या परिवार के लिए।',
      'अब वह हिस्सा जो लगभग कोई नहीं बताता, और जो सबसे ज्यादा राहत देता है: **हर पाद बराबर नहीं है।** केवल वह पाद संवेदनशील माना जाता है जो ठीक राशि-संधि पर पड़ता है — जैसे मूल का पहला पाद या ज्येष्ठा का चौथा। बाकी तीन पाद सामान्य माने जाते हैं। और शास्त्रीय उपाय भी सरल है: **जन्म के 27वें दिन, जब चंद्रमा उसी नक्षत्र में लौटता है, एक शांति पूजा** — बस इतना। इसके लिए हजारों रुपये माँगना परंपरा नहीं, बाजार है।',
      'एक व्यावहारिक बात जो माता-पिता को राहत देती है: **गंडमूल का असर, जहाँ माना जाता है, वहाँ भी सीमित अवधि का है।** परंपरा में इसे शिशु के आरंभिक वर्षों से जोड़ा जाता है, न कि पूरे जीवन से — और 27वें दिन की शांति के बाद इसे शांत मान लिया जाता है। किसी भी ज्योतिषी को यह कहते सुनें कि गंडमूल जीवन भर पीछा करेगा, तो समझ लीजिए कि वह शास्त्र नहीं बोल रहा।',
      'और यह भी जान लीजिए कि गंडमूल में जन्म असामान्य नहीं है। **छह नक्षत्र यानी 27 में से लगभग 22%** — हर पाँचवाँ बच्चा किसी न किसी गंडमूल नक्षत्र में जन्म लेता है, और उसमें भी केवल एक-चौथाई संवेदनशील पाद में। यानी वास्तव में जिनके लिए विशेष शांति बताई जाती है, वे कुल जन्मों के लगभग 5-6% ही होते हैं। यह संख्या अकेले ही बहुत सा डर खत्म कर देती है।',
    ],
  },
  {
    id: 'mool-nakshatra',
    h2: 'Mool Nakshatra Kaise Pata Kare — और मूल बनाम गंडमूल का फर्क',
    paras: [
      'पहले एक भ्रम दूर कर लीजिए, क्योंकि यही सबसे ज्यादा गलतफहमी पैदा करता है। **"मूल" एक विशेष नक्षत्र का नाम भी है** — 19वाँ नक्षत्र, धनु राशि में, केतु स्वामी। और **"मूल" गंडमूल की छह नक्षत्रों वाली श्रेणी का छोटा नाम भी बोल दिया जाता है।** जब कोई कहे "बच्चा मूल में पैदा हुआ", तो अक्सर उसका मतलब गंडमूल श्रेणी से होता है, अकेले मूल नक्षत्र से नहीं।',
      'पता करने का तरीका वही है — **चंद्रमा की स्थिति।** ऊपर कैलकुलेटर चलाइए; अगर आपका जन्म नक्षत्र उन छह में से है तो परिणाम खुद बता देगा, साथ में पाद और यह भी कि वह संवेदनशील पाद है या नहीं। यह सब मुफ्त है और बीस सेकंड में हो जाता है।',
      'मूल नक्षत्र (19वाँ) के बारे में अलग से जान लेना अच्छा है क्योंकि इसकी छवि अनावश्यक रूप से डरावनी बना दी गई है। **मूल का अर्थ है जड़** — इसका देवता निऋति है, प्रतीक जड़ों का गुच्छा, और स्वभाव खोजी। मूल नक्षत्र में जन्मे लोग अक्सर गहराई तक जाने वाले, शोध-प्रवृत्ति के और सतह से संतुष्ट न होने वाले होते हैं। यह कोई दोष नहीं, एक प्रवृत्ति है। नक्षत्र और चंद्रमा का गहरा सम्बन्ध [चंद्र और नक्षत्र](/blog/moon-nakshatra-manifestation-astrology-hindi) में खोला गया है।',
      'मूल नक्षत्र के बारे में एक और गलतफहमी: कहा जाता है कि मूल में जन्मा बच्चा पिता के लिए अशुभ होता है। **शास्त्रीय आधार यहाँ बहुत पतला है**, और आधुनिक अभ्यास में यह मान्यता लगभग छोड़ दी गई है। जो बचता है वह यह कि संधि पर जन्म एक संवेदनशील बिंदु है, इसलिए 27वें दिन की शांति कर ली जाती है — बस इतना। बाकी सब जोड़ा हुआ है।',
    ],
  },
  {
    id: 'tithi-nakshatra',
    h2: 'तिथि नक्षत्र कैलकुलेटर — ये दोनों अलग चीज़ें हैं',
    paras: [
      'लोग अक्सर "तिथि नक्षत्र" एक साथ खोजते हैं, पर ये **दो अलग-अलग चीजें** हैं और अलग-अलग काम आती हैं। **तिथि** चंद्र-दिवस है — अमावस्या से पूर्णिमा तक 15, और वापस 15, कुल 30; यह सूर्य और चंद्र के बीच के कोण से बनती है। **नक्षत्र** चंद्रमा की तारा-स्थिति है — 27 में से एक।',
      'फर्क व्यावहारिक भी है। **जन्म नक्षत्र जीवन भर एक ही रहता है** — यह आपकी कुंडली का स्थायी हिस्सा है, और वही ऊपर वाला कैलकुलेटर निकालता है। **तिथि रोज बदलती है** — आज की तिथि, आज का नक्षत्र, आज का योग और करण मिलकर "पंचांग" बनाते हैं, जो मुहूर्त के लिए देखा जाता है, जन्म-विश्लेषण के लिए नहीं।',
      'इसलिए आपको क्या चाहिए, यह तय कर लीजिए: **अपना जन्म नक्षत्र** चाहिए तो ऊपर का कैलकुलेटर; **आज की तिथि, नक्षत्र और मुहूर्त** चाहिए तो [पंचांग](/panchang), जो प्रतिदिन अपडेट होता है। और अगर बच्चे के जन्म या किसी संस्कार का शुभ समय चाहिए, तो [बाल जन्म मुहूर्त कैलकुलेटर](/calculators/free-child-birth-muhurat-calculator) उसी काम के लिए बना है।',
    ],
  },
  {
    id: 'rashi-nakshatra-ek-saath',
    h2: 'Rashi + Nakshatra एक साथ कैसे निकालें',
    paras: [
      '**ऊपर वाला कैलकुलेटर दोनों एक साथ देता है** — क्योंकि दोनों एक ही चीज से निकलते हैं: **चंद्रमा की स्थिति।** चंद्र राशि बताती है चंद्रमा किस राशि (12 में से) में है; जन्म नक्षत्र बताता है वह किस तारा-खंड (27 में से) में है। एक ही गणना, दो अलग स्तर की बारीकी।',
      'रिश्ता भी सीधा है और जानने लायक है: **हर राशि में सवा दो (2.25) नक्षत्र आते हैं** — 27 ÷ 12 = 2.25। इसीलिए कुछ नक्षत्र दो राशियों में फैले होते हैं, जैसे कृत्तिका का पहला पाद मेष में और बाकी तीन वृषभ में। यही कारण है कि सिर्फ राशि जानना काफी नहीं — नक्षत्र उससे ढाई गुना ज्यादा सटीक जानकारी देता है।',
      'कहाँ क्या काम आता है: **राशि** — साढ़ेसाती, गोचर और राशिफल के लिए; **नक्षत्र** — नामकरण, विवाह मिलान (अष्टकूट का आधार नक्षत्र ही है) और विंशोत्तरी दशा के लिए। अपनी राशि अलग से देखनी हो तो [राशि कैलकुलेटर](/calculators/free-rashi-calculator), और साढ़ेसाती चल रही है या नहीं यह [साढ़े साती कैलकुलेटर](/calculators/free-sade-sati-calculator) से। नक्षत्र से विवाह मिलान [कुंडली मिलान](/kundali-milan) में होता है।',
    ],
  },
  {
    id: 'birth-star-english',
    h2: 'Birth Star in English — Name Translation Table',
    paras: [
      'If you have been given a nakshatra name in one language and need it in another, the master table above carries all four columns side by side — **Devanagari, English transliteration, Tamil and Malayalam.** That covers the overwhelming majority of "birth star in English" searches, which are almost always a translation problem rather than an astrology one.',
      'A word on what "birth star" actually means, because the English phrase is misleading. It does **not** refer to a star you were born under in the astronomical sense. Each nakshatra is a **13°20\' segment of the ecliptic**, named after a prominent star or star-group that sits in it — Rohini is associated with Aldebaran, Chitra with Spica, Jyeshtha with Antares. But the nakshatra is the **segment**, not the star, and your birth star is simply whichever segment the Moon occupied at your birth.',
      'The other common mix-up is with Western astrology. **A nakshatra is not a zodiac sign and has no Western equivalent.** Western astrology divides the sky into 12; Jyotish divides it into 27 for the Moon and 12 for the signs, and uses the sidereal zodiac rather than the tropical one. So there is no "my birth star in Western astrology" — the systems do not map onto each other, and any table claiming they do is inventing the correspondence.',
    ],
  },
  {
    id: 'tamil-malayalam',
    h2: 'Tamil / Malayalam Nakshatra Finder',
    paras: [
      'The master table above lists all 27 nakshatras with their **Tamil and Malayalam names**, so this page works as a finder in either language. Find your nakshatra in whichever column you know it by, and read across for the rest — including the Namakaran syllables and the ruling planet.',
      'Two things are genuinely different in South Indian practice and worth stating rather than glossing over. First, the **naming convention**: in Tamil Nadu and Kerala the birth star is used far more actively in daily life than in the North — birthdays are often celebrated on the **nakshatra day** each month rather than the calendar date, and the star is quoted in matrimonial listings as a matter of course. Second, **the same nakshatra carries different regional spellings**, and sometimes noticeably different ones — Ashlesha is Ayilyam, Jyeshtha is Kettai in Tamil and Thrikketta in Malayalam.',
      'One point of caution, offered plainly: **transliteration varies by region, by almanac and by family tradition.** The spellings in the table are the most widely used forms, not the only correct ones. If your local panchangam spells it differently, that is a spelling difference and not a different nakshatra — the underlying calculation is identical everywhere, because the Moon does not care which script you write it in.',
    ],
  },
];

const FAQS = [
  { q: 'Nakshatra kya hota hai?', a: 'Nakshatra Vedic Jyotish ka sabse important unit hai. Aakash ko 27 equal divisions mein baata gaya hai, har ek 13°20\' ka. Aapka Janma Nakshatra wahi hai jismein aapke janm samay Chandra (Moon) sthit tha — NOT the Lagna (Ascendant). Yeh sabse aam galti hai.' },
  { q: 'जन्म तारीख से नाम का अक्षर कैसे निकलता है?', a: 'Har nakshatra chaar padon mein banta hai aur har pad ka apna nishchit akshar hota hai — 27 × 4 = kul 108 akshar. Janm ke samay Chandra jis nakshatra ke jis pad mein tha, wahi akshar naam ka pehla akshar mana jaata hai. Yeh parampara nahi, ganana hai. Upar wala calculator yeh akshar apne aap nikaal deta hai.' },
  { q: 'क्या नाम से नक्षत्र पता किया जा सकता है?', a: 'Yeh ganana nahi, anuman hai. Nakshatra Chandra ki sthiti se banta hai, naam se nahi. Agar naam parampara ke anusaar rakha gaya ho to pehla akshar ek nakshatra-pad ki or ishara kar sakta hai, par kai akshar ek se adhik nakshatron mein aate hain isliye uttar ek nahi, kai sambhavnayein hongi. Aur agar aadhunik naam hai jo nakshatra dekh kar nahi rakha gaya, to is tareeke ka koi arth hi nahi.' },
  { q: 'गंडमूल नक्षत्र कौन से हैं?', a: 'Chhe nakshatra jo Ketu aur Budh ke swamitva mein aate hain aur rashiyon ki sandhi par padte hain: Ashwini, Ashlesha, Magha, Jyeshtha, Mula aur Revati. "Gand" ka arth gaanth ya sandhi, "mool" jad. Upar wala calculator yeh apne aap jaanch leta hai — alag se koi Gandmool calculator chalane ki zaroorat nahi.' },
  { q: 'क्या गंडमूल में जन्म अशुभ होता है?', a: 'Har pad barabar nahi hai — yeh woh hissa hai jo lagbhag koi nahi batata. Sirf woh pad samvedansheel mana jaata hai jo theek rashi-sandhi par padta hai, jaise Mula ka pehla pad ya Jyeshtha ka chautha. Baaki teen pad samanya maane jaate hain. Aur shastriya upay bhi saral hai: janm ke 27ve din, jab Chandra usi nakshatra mein lautta hai, ek Shanti puja — bas itna. Iske liye hazaron rupaye maangna parampara nahi, bazaar hai.' },
  { q: 'Mool nakshatra aur Gandmool mein kya farak hai?', a: '"Mool" ek vishesh nakshatra ka naam bhi hai — 19va nakshatra, Dhanu rashi mein, Ketu swami. Aur "mool" Gandmool ki chhe-nakshatra wali shreni ka chhota naam bhi bol diya jaata hai. Jab koi kahe "bachcha mool mein paida hua", to aksar matlab Gandmool shreni se hota hai, akele Mula nakshatra se nahi.' },
  { q: 'तिथि और नक्षत्र में क्या फर्क है?', a: 'Do alag cheezein hain. Tithi chandra-divas hai — Amavasya se Purnima tak 15 aur wapas 15, kul 30; yeh Surya aur Chandra ke beech ke kon se banti hai. Nakshatra Chandra ki taara-sthiti hai — 27 mein se ek. Janma nakshatra jeevan bhar ek hi rehta hai; tithi roz badalti hai. Aaj ki tithi aur nakshatra ke liye Panchang dekhiye, janm nakshatra ke liye upar wala calculator.' },
  { q: 'Rashi aur Nakshatra ek saath kaise nikale?', a: 'Upar wala calculator dono ek saath deta hai, kyunki dono ek hi cheez se nikalte hain — Chandra ki sthiti. Har rashi mein sawa do (2.25) nakshatra aate hain (27 ÷ 12), isliye kuch nakshatra do rashiyon mein faile hote hain, jaise Krittika ka pehla pad Mesh mein aur baaki teen Vrishabh mein. Nakshatra rashi se dhai guna zyada sateek jaankari deta hai.' },
  { q: 'Janma Nakshatra kaise pata karein?', a: 'Date of Birth, exact Time of Birth, aur Place of Birth chahiye. Calculator Swiss Ephemeris se Moon ki exact position calculate karta hai aur usse Janma Nakshatra + Pada nikalta hai. Samay isliye zaroori hai kyunki Chandra ek nakshatra lagbhag sawa din mein aur ek pad lagbhag chhe ghante mein paar karta hai — kuch ghanton ki galti pad badal deti hai.' },
  { q: 'Pada kya hota hai?', a: 'Har Nakshatra 4 equal parts mein divide hota hai — inhe Pada kehte hain, har ek 3°20\' ka. 27 nakshatras × 4 padas = 108 micro-divisions. Aapka Pada Namakaran akshar tay karta hai, Navamsha (D-9) ki rashi tay karta hai, aur Gandmool ki gambhirta bhi isi se tay hoti hai.' },
  { q: 'Gana, Yoni, aur Nadi kya hai?', a: 'Gana (Deva, Manushya, Rakshasa) — swabhav ki shreni. Yoni — prakritik pravritti aur anukoolta. Nadi (Aadi, Madhya, Antya) — vivah milan ka sabse bhaari check, kyunki Ashtakoot mein Nadi ko sabse zyada 8 gun diye jaate hain. Teenon nakshatra se nikalte hain, rashi se nahi — yahi wajah hai ki kundali milan mein nakshatra rashi se zyada mayne rakhta hai.' },
  { q: 'What is a birth star in English?', a: 'It does not refer to a star you were born under in the astronomical sense. Each nakshatra is a 13°20\' segment of the ecliptic, named after a prominent star that sits in it — Rohini is associated with Aldebaran, Chitra with Spica. But the nakshatra is the segment, not the star. A nakshatra also has no Western zodiac equivalent; the two systems do not map onto each other.' },
  { q: 'Tamil / Malayalam mein nakshatra ka naam kaise pata karein?', a: 'Is page ki master table mein saare 27 nakshatra Devanagari, English, Tamil aur Malayalam — chaaron mein diye hain. Jis bhasha mein aap jaante hain us column mein dhoondhiye aur baaki padh lijiye. Dhyan rahe: transliteration kshetra aur panchangam ke hisaab se badalti hai — spelling alag ho sakti hai, nakshatra wahi rahega.' },
  { q: 'Kya Nakshatra Calculator free hai?', a: 'Haan, 100% free. Nakshatra, Pada, Namakaran akshar, Chandra Rashi, lord, deity, symbol, gana, yoni, nadi, Gandmool check, personality traits, 3 Dos, 3 Donts aur 3 remedies — sab free, koi signup nahi.' },
];

export default function FreeNakshatraCalculatorPage() {
  const [form, setForm] = useState<FormData>({
    name: '', gender: '', date: '', time: '12:00', unknownTime: false,
    placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const set = useCallback((key: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.date) errs.date = 'Date of birth is required';
    if (!form.unknownTime && !form.time) errs.time = 'Time of birth is required';
    if (form.latitude === null) errs.latitude = 'Please select a city from suggestions';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;
    const [year, month, day] = form.date.split('-').map(Number);
    const tob = form.unknownTime ? '12:00' : form.time;
    const [hour, minute] = tob.split(':').map(Number);
    setLoading(true);
    try {
      const res = await fetch('/api/calc/kundali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day, hour, minute,
          latitude: form.latitude, longitude: form.longitude, timezone: form.timezone,
          name: form.name || null, gender: form.gender || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }
      const data = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── CORRECT Nakshatra extraction ─────────────────────────────────────
  // Janma Nakshatra = Moon's nakshatra (NOT Lagna nakshatra)
  // VM path: result.kundali.grahas[] → find planet === 'Moon'
  const grahas: any[] = result?.kundali?.grahas ?? [];
  const moonGraha = grahas.find((g: any) => g.planet === 'Moon') ?? null;

  const nakshatra = moonGraha?.nakshatra ?? null;
  const pada = moonGraha?.pada ?? null;
  const chandraRashi = moonGraha?.sign ?? null;
  const nakLordFromVM = moonGraha?.nakshatra_lord ?? null;

  // Enrich from local BPHS table (fallback if VM doesn't return full details)
  const nakDetails = nakshatra ? NAKSHATRA_DATA[nakshatra] || {} : {};
  const nakLord = nakLordFromVM || nakDetails.lord || null;
  const nakDeity = nakDetails.deity || null;
  const nakSymbol = nakDetails.symbol || null;
  const nakGana = nakDetails.gana || null;
  const nakYoni = nakDetails.yoni || null;
  const nakNadi = nakDetails.nadi || null;
  const nakTrait = nakDetails.trait || null;

  // ─── v2.0 computed extras ────────────────────────────────────
  // Namakaran syllable: pada is 1-based, syllables array is 0-based.
  const padaNum = typeof pada === 'number' ? pada : parseInt(String(pada ?? ''), 10);
  const namSyllable =
    nakDetails.syllables && padaNum >= 1 && padaNum <= 4
      ? nakDetails.syllables[padaNum - 1]
      : null;
  // Gandmool: present only for the six sandhi nakshatras.
  const gandmool = nakshatra ? GANDMOOL[nakshatra] ?? null : null;
  const isSevereGandmool = Boolean(gandmool && padaNum === gandmool.severePada);

  // ─── Template data — VM returns template.actionWindows, avoidWindows, remedyPlan ───
  const template = result?.template;
  const actionWindows: any[] = template?.actionWindows ?? [];
  const dos: string[] = actionWindows.slice(0, 3).map((w: any) => `${w.window}: ${w.reason}`);
  const avoidWindows: any[] = template?.avoidWindows ?? [];
  let donts: string[] = avoidWindows.slice(0, 3).map((w: any) => `${w.window}: ${w.reason}`);
  const remedyList: any[] = template?.remedyPlan?.remedies ?? [];
  const mantraObj = remedyList.find((r: any) => r.type === 'mantra');
  const gemObj = remedyList.find((r: any) => r.type === 'gemstone');
  const daanObj = remedyList.find((r: any) => r.type === 'daan' || r.type === 'dana' || r.type === 'charity');
  const vratObj = remedyList.find((r: any) => r.type === 'vrat');
  const specialObj = remedyList.find((r: any) => r.type === 'special');
  const mantra = mantraObj ? `${mantraObj.mantra} — ${mantraObj.count}, ${mantraObj.time}. ${mantraObj.special || ''}`.trim() : null;
  const ratna = gemObj ? `${gemObj.lagna_stone?.stone || gemObj.dasha_stone?.stone} (${gemObj.lagna_stone?.metal || 'Gold'}, ${gemObj.lagna_stone?.finger || 'Index finger'}) — ${gemObj.lagna_stone?.for || gemObj.dasha_stone?.for || ''}` : null;
  const daan = daanObj ? `${daanObj.items} — On ${daanObj.day}, give to ${daanObj.recipient}. ${daanObj.note || ''}`.trim() : null;
  if (donts.length === 0) {
    if (vratObj) donts.push(`Vrat (Fast): ${vratObj.name} on ${vratObj.day} — Deity: ${vratObj.deity}. Prasad: ${vratObj.prasad}`);
    if (specialObj) donts.push(`${specialObj.text || ''} — Focus: ${specialObj.focus || ''}`);
    if (mantraObj?.special) donts.push(`Avoid: Do not chant mantra after consuming non-veg or alcohol. Best time: ${mantraObj.time}`);
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-nakshatra-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Nakshatra Calculator — Find Your Janma Nakshatra Online',
    description:
      'Find your Janma Nakshatra from the Moon position in your birth chart — Nakshatra, Pada, Namakaran syllable, Gandmool check, lord, deity, gana, yoni, nadi and 3 free Parashar remedies. Free Vedic calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Nakshatra Calculator',
    aboutEntities: ['Nakshatra', 'Janma Nakshatra', 'Moon', 'Pada', 'Gandmool'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Nakshatra', 'Janma Nakshatra', 'Namakaran'],
    howToName: 'How to find your Janma Nakshatra',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your name, date of birth, exact time of birth and place of birth.' },
      { name: 'Locate the Moon', text: "The calculator computes the Moon's exact position using Swiss Ephemeris with Lahiri Ayanamsha to find your Janma Nakshatra and Pada." },
      { name: 'Get your result', text: 'See your Nakshatra, Pada, Namakaran syllable, Gandmool status, lord, deity, symbol, gana, yoni, nadi and 3 free Parashar remedies.' },
    ],
    faqs: FAQS,
  });

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Free Nakshatra Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Nakshatra Calculator — Find Your Janma Nakshatra Online
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Nakshatra Calculator</strong> aapka Janma Nakshatra Swiss Ephemeris se calculate karta hai — Chandra (Moon) ki exact position se, Lagna se nahi. Date, time, aur place daalo — Nakshatra, Pada, <strong style={{ color: GOLD }}>naamkaran ka shubh akshar</strong>, <strong style={{ color: GOLD }}>Gandmool check</strong>, Chandra Rashi, lord, deity, gana, yoni, nadi aur 3 free Parashar remedies turant milte hain.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>
                <Link href="/founder" className="hover:underline">Rohiit Gupta</Link>
              </div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS · Lahiri Ayanamsha · Chandra Nakshatra</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Janma Nakshatra (Free)</h2>
            <div className="grid gap-5">
              <div>
                <label htmlFor="tv-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-yellow-400">*</span></label>
                <input id="tv-name" type="text" placeholder="Enter your full name"
                  value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.name)} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth <span className="text-yellow-400">*</span></label>
                <input id="tv-dob" type="date" value={form.date}
                  onChange={e => set('date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.date)} />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="tv-tob" className="text-sm font-medium text-slate-300">
                    Time of Birth {!form.unknownTime && <span className="text-yellow-400">*</span>}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                    <input type="checkbox" checked={form.unknownTime} onChange={e => set('unknownTime', e.target.checked)} className="rounded" />
                    Unknown time
                  </label>
                </div>
                <input id="tv-tob" type="time" value={form.time}
                  onChange={e => set('time', e.target.value)} disabled={form.unknownTime}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ ...inputStyle(!!errors.time), opacity: form.unknownTime ? 0.4 : 1 }} />
                {form.unknownTime
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Chandra ek pada lagbhag 6 ghante mein paar karta hai — bina exact time ke pada aur naamkaran akshar galat aa sakta hai.</p>
                  : <p className="text-slate-500 text-xs mt-1">Pada aur naamkaran akshar ke liye exact time zaroori hai.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Gender <span className="text-slate-500 text-xs ml-1">(for personalized remedies)</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: 'male', label: '♂ Male', color: '#60a5fa' }, { value: 'female', label: '♀ Female', color: '#f472b6' }, { value: 'other', label: '⊕ Other', color: '#94a3b8' }].map(opt => (
                    <button key={opt.value} type="button" onClick={() => set('gender', opt.value)}
                      className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center"
                      style={{ background: form.gender === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${form.gender === opt.value ? `${opt.color}60` : 'rgba(255,255,255,0.1)'}`, color: form.gender === opt.value ? opt.color : '#64748b' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Place of Birth <span className="text-yellow-400">*</span></label>
                <CityInput id="tv-place" value={form.placeQuery} error={errors.latitude}
                  onSelect={(city, lat, lng, tz) => {
                    setForm(prev => ({ ...prev, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz }));
                    setErrors(prev => { const n = { ...prev }; delete n.latitude; return n; });
                  }} />
              </div>

              {form.latitude !== null && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Latitude', value: form.latitude.toFixed(4) },
                    { label: 'Longitude', value: form.longitude!.toFixed(4) },
                    { label: 'Timezone', value: `UTC ${form.timezone >= 0 ? '+' : ''}${form.timezone}` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-xs text-slate-500 mb-1">{label}</label>
                      <div className="px-3 py-2 rounded-lg text-xs font-mono text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#22c55e' }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {error && <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: loading ? GOLD_RGBA(0.3) : `linear-gradient(135deg,rgba(212,175,55,0.8) 0%,${GOLD} 100%)`, color: '#080B12', fontSize: '15px' }}>
                {loading ? '⟳ Finding Nakshatra...' : '⭐ Find My Nakshatra'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Chandra Nakshatra</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* NAKSHATRA HERO */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                  {form.name ? `${form.name}'s ` : ''}Janma Nakshatra (Chandra)
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: GOLD }}>
                  ⭐ {nakshatra || '—'}{nakDetails.hi ? <span className="text-2xl text-slate-300"> ({nakDetails.hi})</span> : null}
                </div>
                {pada && (
                  <div className="text-base text-slate-300">
                    Pada <span style={{ color: GOLD }} className="font-bold">{pada}</span> of 4
                  </div>
                )}
                {chandraRashi && (
                  <div className="text-sm text-slate-400 mt-2">
                    Chandra Rashi: <span style={{ color: GOLD }}>{chandraRashi}</span>
                  </div>
                )}
                {nakLord && (
                  <div className="text-sm text-slate-400 mt-1">
                    Nakshatra Lord: <span style={{ color: GOLD }}>{nakLord}</span>
                  </div>
                )}
                {(nakDetails.tamil || nakDetails.malayalam) && (
                  <div className="text-xs text-slate-500 mt-2">
                    Tamil: {nakDetails.tamil} · Malayalam: {nakDetails.malayalam}
                  </div>
                )}
                {nakTrait && (
                  <div className="text-sm text-slate-300 mt-4 italic">&ldquo;{nakTrait}&rdquo;</div>
                )}
              </div>

              {/* ── v2.0: NAMAKARAN SYLLABLE (computed, not an article) ── */}
              {namSyllable && (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">नामकरण — शुभ नाम अक्षर</div>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-2" style={{ color: '#86EFAC' }}>{namSyllable}</div>
                  <p className="text-sm text-slate-300 max-w-xl mx-auto">
                    {nakshatra} nakshatra ke <strong style={{ color: GOLD }}>pada {pada}</strong> ka shubh akshar. Parampara ke anusaar naam ka pehla akshar yahi hona chahiye.
                    {nakDetails.syllables && (
                      <> Is nakshatra ke chaaron pad ke akshar: <strong style={{ color: GOLD }}>{nakDetails.syllables.join(' · ')}</strong>.</>
                    )}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 justify-center">
                    <Link href="/calculators/free-baby-name-by-nakshatra" className="text-sm font-semibold underline underline-offset-2" style={{ color: GOLD }}>
                      Is akshar se naam suggestions →
                    </Link>
                    <Link href="/blog/lucky-baby-name-letter-by-nakshatra-hindi" className="text-sm font-semibold underline underline-offset-2" style={{ color: GOLD }}>
                      पूरी अक्षर-सूची →
                    </Link>
                  </div>
                </div>
              )}

              {/* ── v2.0: GANDMOOL CHECK (computed) ────────────────────── */}
              {nakshatra && (
                gandmool ? (
                  <div className="rounded-2xl p-5 md:p-7" style={{
                    background: isSevereGandmool ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSevereGandmool ? 'rgba(251,191,36,0.35)' : GOLD_RGBA(0.2)}`,
                  }}>
                    <h3 className="text-xl font-serif font-bold mb-3" style={{ color: isSevereGandmool ? '#FBBF24' : GOLD }}>
                      {isSevereGandmool ? '⚠️ गंडमूल — संवेदनशील पाद' : 'ℹ️ गंडमूल नक्षत्र — सामान्य पाद'}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <strong style={{ color: GOLD }}>{nakshatra}</strong> chhe Gandmool nakshatron mein se ek hai ({gandmool.junction}).
                      {isSevereGandmool ? (
                        <> Aapka janm <strong style={{ color: '#FBBF24' }}>pada {pada}</strong> mein hai — yahi woh pada hai jo theek rashi-sandhi par padta hai aur parampara mein sabse samvedansheel mana jaata hai.</>
                      ) : (
                        <> Aapka janm <strong style={{ color: '#86EFAC' }}>pada {pada}</strong> mein hai. Is nakshatra mein sirf <strong>pada {gandmool.severePada}</strong> samvedansheel mana jaata hai — aapka pada usme nahi aata, isliye yeh samanya sthiti hai.</>
                      )}
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed mt-3">
                      Shastriya upay saral hai: <strong style={{ color: GOLD }}>janm ke 27ve din</strong>, jab Chandra usi nakshatra mein lautta hai, ek Gandmool Shanti puja — bas itna.
                      Iske liye hazaron rupaye maangna parampara nahi hai. Shubh din ke liye <Link href="/panchang" className="underline underline-offset-2" style={{ color: GOLD }}>पंचांग</Link> dekh lijiye.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', color: '#86EFAC' }}>
                    ✅ <strong>गंडमूल नहीं:</strong> {nakshatra} chhe Gandmool nakshatron (Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati) mein nahi aata — koi Gandmool Shanti karane ki zaroorat nahi.
                  </div>
                )
              )}

              {/* NAKSHATRA DETAILS */}
              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>Nakshatra Details (Parashar BPHS)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DetailCell icon="🪐" label="Ruling Planet (Lord)" value={nakLord} />
                  <DetailCell icon="🙏" label="Presiding Deity" value={nakDeity} />
                  <DetailCell icon="🔱" label="Symbol" value={nakSymbol} />
                  <DetailCell icon="✨" label="Gana (Nature)" value={nakGana} />
                  <DetailCell icon="🐾" label="Yoni (Animal)" value={nakYoni} />
                  <DetailCell icon="💨" label="Nadi (Dosha Check)" value={nakNadi} />
                </div>
                <p className="text-xs text-slate-500 mt-4 italic">
                  27 nakshatras × 4 padas = 108 micro-divisions. Janma Nakshatra = Chandra ki star position at birth.
                  Gana, Yoni aur Nadi — teenon <Link href="/kundali-milan" className="underline underline-offset-2" style={{ color: GOLD }}>Kundali Milan</Link> ke Ashtakoot mein istemal hote hain.
                </p>
              </div>

              {/* DOS & DONTS */}
              {(dos.length > 0 || donts.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos (Parashar Niyam)</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {dos.slice(0, 3).map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                    </ul>
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#FCA5A5' }}>❌ 3 Donts (Parashar Vivarjan)</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {donts.slice(0, 3).map((d, i) => <li key={i} className="flex gap-2"><span className="text-red-400">•</span><span>{d}</span></li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* REMEDIES */}
              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪔 Your 3 Free Remedies (Parashar)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={typeof mantra === 'string' ? mantra : JSON.stringify(mantra)} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={typeof ratna === 'string' ? ratna : JSON.stringify(ratna)} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={typeof daan === 'string' ? daan : JSON.stringify(daan)} />}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ── v2.0: TABLE OF CONTENTS ─────────────────────────── */}
          <nav aria-label="Is page par kya hai" className="mt-16 rounded-2xl p-5 md:p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <h2 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>Is Page Par Kya Hai</h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
              {PILLAR.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:underline underline-offset-2" style={{ color: '#cbd5e1' }}>{s.h2}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── v2.0: PILLAR CONTENT — 9 keyword-driven H2 sections ── */}
          <section className="mt-12">
            {PILLAR.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">{renderRich(p, `s${si}-p${pi}`)}</p>
                ))}

                {/* MASTER TABLE — answers the 27-list, English-translation and
                    Tamil/Malayalam keywords in one place */}
                {s.id === '27-nakshatra-list' && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                      <caption className="sr-only">सभी 27 नक्षत्र — देवनागरी, अंग्रेज़ी, तमिल, मलयालम, स्वामी और नामकरण अक्षर</caption>
                      <thead>
                        <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>#</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>नक्षत्र / English</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>Tamil</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>Malayalam</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>स्वामी</th>
                          <th scope="col" className="p-2.5 text-left" style={{ color: GOLD }}>नाम अक्षर (पाद 1–4)</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {NAK_ORDER.map((n, i) => {
                          const d = NAKSHATRA_DATA[n];
                          const isGm = Boolean(GANDMOOL[n]);
                          return (
                            <tr key={n} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                              <td className="p-2.5 text-slate-500">{i + 1}</td>
                              <td className="p-2.5 font-semibold" style={{ color: GOLD }}>
                                {d.hi} <span className="text-slate-400 font-normal">({n})</span>
                                {isGm && <span title="Gandmool nakshatra" className="ml-1">🔶</span>}
                              </td>
                              <td className="p-2.5">{d.tamil}</td>
                              <td className="p-2.5">{d.malayalam}</td>
                              <td className="p-2.5">{d.lord}</td>
                              <td className="p-2.5 text-slate-400">{d.syllables.join(' · ')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="text-[11px] text-slate-500 mt-2">
                      🔶 = गंडमूल नक्षत्र (छह)। तमिल/मलयालम वर्तनी क्षेत्र और पंचांग के अनुसार बदल सकती है — नक्षत्र वही रहता है।
                    </p>
                  </div>
                )}

                {/* GANDMOOL detail table */}
                {s.id === 'gandmool' && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                      <caption className="sr-only">छह गंडमूल नक्षत्र, उनकी संधि और संवेदनशील पाद</caption>
                      <thead>
                        <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>नक्षत्र</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>स्वामी</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>संधि</th>
                          <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>संवेदनशील पाद</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        {Object.entries(GANDMOOL).map(([n, g]) => (
                          <tr key={n} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <td className="p-3 font-semibold" style={{ color: GOLD }}>{NAKSHATRA_DATA[n].hi} ({n})</td>
                            <td className="p-3">{NAKSHATRA_DATA[n].lord}</td>
                            <td className="p-3">{g.junction}</td>
                            <td className="p-3" style={{ color: '#FBBF24' }}>पाद {g.severePada}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[11px] text-slate-500 mt-2">
                      केवल संवेदनशील पाद पर शांति विशेष रूप से बताई जाती है — बाकी तीन पाद सामान्य माने जाते हैं।
                    </p>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* LAGNA vs JANMA NAKSHATRA (kept + expanded from v3.1) */}
          <section className="mt-4">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Lagna Nakshatra vs Janma Nakshatra</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Lagna Nakshatra</strong> = Ascendant ka nakshatra — aapka body aur outer personality.
              {' '}<strong style={{ color: GOLD }}>Janma Nakshatra</strong> = Moon ka nakshatra — aapka mann, emotions aur karma pattern. <strong>Yahi asli Janma Nakshatra hai</strong>, aur yahi Namakaran, Ashtakoot milan aur Vimshottari dasha — teenon ka aadhar hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Yeh farak itna zaroori isliye hai kyunki bahut se online tools Lagna ka nakshatra dikha dete hain aur use "Janma Nakshatra" keh dete hain — jo classical Parashar BPHS ke hisaab se galat hai. Trikaal Vaani hamesha <strong style={{ color: GOLD }}>Chandra ka nakshatra</strong> dikhata hai. Apna Lagna alag se dekhna ho to{' '}
              <Link href="/calculators/free-lagna-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Lagna Calculator</Link>{' '}chalaiye.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk</h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Feature</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Trikaal Vaani</th>
                    <th scope="col" className="p-3 text-left text-slate-400">Others</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Basis</td><td className="p-3">Chandra ka nakshatra (classical)</td><td className="p-3 text-slate-500">Aksar Lagna ka nakshatra</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Namakaran akshar</td><td className="p-3" style={{ color: GOLD }}>✓ Pada se computed</td><td className="p-3 text-slate-500">~ Sirf list</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Gandmool check</td><td className="p-3" style={{ color: GOLD }}>✓ Pada-wise, severity ke saath</td><td className="p-3 text-slate-500">✗ Ya sirf haan/na</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Tamil / Malayalam naam</td><td className="p-3" style={{ color: GOLD }}>✓ Saare 27</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Gana / Yoni / Nadi</td><td className="p-3" style={{ color: GOLD }}>✓ Teenon</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Nakshatra</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="p-4 rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* DEEPER READING */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Nakshatra Par Aur Padhein</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Santaan ke janm ka nakshatra dekh rahe hain? Neeche har nakshatra ka alag lekh hai — aur{' '}
              <Link href="/calculators/free-child-birth-muhurat-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>बाल जन्म मुहूर्त कैलकुलेटर</Link>{' '}
              shubh samay ki ganana karta hai.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { slug: 'lucky-baby-name-letter-by-nakshatra-hindi', label: 'नक्षत्र अनुसार शुभ नाम अक्षर — पूरी सूची' },
                { slug: 'moon-nakshatra-manifestation-astrology-hindi', label: 'चंद्र और नक्षत्र — गहन विश्लेषण' },
                { slug: 'rohini-nakshatra-baby-birth-hindi', label: 'रोहिणी नक्षत्र और संतान जन्म' },
                { slug: 'pushya-nakshatra-baby-birth-hindi', label: 'पुष्य नक्षत्र और संतान जन्म' },
                { slug: 'hasta-nakshatra-baby-birth-hindi', label: 'हस्त नक्षत्र और संतान जन्म' },
                { slug: 'swati-nakshatra-baby-birth-hindi', label: 'स्वाति नक्षत्र और संतान जन्म' },
                { slug: 'anuradha-nakshatra-baby-birth-hindi', label: 'अनुराधा नक्षत्र और संतान जन्म' },
                { slug: 'uttara-phalguni-nakshatra-baby-birth-hindi', label: 'उत्तर फाल्गुनी नक्षत्र और संतान जन्म' },
                { slug: 'uttara-ashadha-nakshatra-baby-birth-hindi', label: 'उत्तराषाढ़ा नक्षत्र और संतान जन्म' },
                { slug: 'uttara-bhadrapada-nakshatra-baby-birth-hindi', label: 'उत्तरा भाद्रपद नक्षत्र और संतान जन्म' },
                { slug: 'revati-nakshatra-baby-birth-hindi', label: 'रेवती नक्षत्र और संतान जन्म 🔶' },
                { slug: 'lucky-baby-name-letter-by-nakshatra', label: 'Lucky baby name letter by nakshatra (English)' },
              ].map((b) => (
                <Link key={b.slug} href={`/blog/${b.slug}`}
                  className="p-3 rounded-xl text-sm transition-all hover:opacity-90"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: '#cbd5e1' }}>
                  {b.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <p className="text-slate-300 leading-relaxed mb-5">
              Nakshatra mil gaya to agla kadam ye hain — naam ke liye{' '}
              <Link href="/calculators/free-baby-name-by-nakshatra" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Baby Name</Link>, gochar ke liye{' '}
              <Link href="/calculators/free-rashi-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Rashi</Link>, aur samay ke liye{' '}
              <Link href="/calculators/free-dasha-calculator" className="underline underline-offset-2 font-semibold" style={{ color: GOLD }}>Dasha</Link> — teenon nakshatra par hi aadharit hain.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-baby-name-by-nakshatra', name: 'Baby Name by Nakshatra' },
                { slug: 'free-child-birth-muhurat-calculator', name: 'Child Birth Muhurat' },
                { slug: 'free-rashi-calculator', name: 'Rashi Calculator' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Check' },
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh' },
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day Calculator' },
              ].map((c) => (
                <Link key={c.slug} href={`/calculators/${c.slug}`}
                  className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: GOLD }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

          {/* AUTHOR / EEAT FOOTER */}
          <footer className="mt-16 pt-8 text-sm text-slate-400" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="mb-2">
              <em>
                Reviewed by{' '}
                <Link href="/founder" className="underline underline-offset-2" style={{ color: GOLD }}>Rohiit Gupta</Link>,
                Chief Vedic Architect, Trikaal Vaani · Dwarka, New Delhi · UDYAM-DL-10-0119070
              </em>
            </p>
            <p className="mb-2">
              <strong style={{ color: GOLD }}>Classical sources:</strong> Brihat Parashara Hora Shastra (BPHS) — 27 nakshatra division, pada structure and Janma Nakshatra from Chandra; classical Namakaran syllable chart (108 padas); classical Gandmool (Ketu/Budh sandhi nakshatra) rules and the 27th-day Shanti; Swiss Ephemeris with Lahiri Ayanamsha for all computation.
            </p>
            <p>
              Apni poori kundali ka vishleshan chahiye to{' '}
              <Link href="/karmic-background-reading" className="underline underline-offset-2" style={{ color: GOLD }}>Karmic Background Reading</Link>{' '}
              dekhiye, ya saare options{' '}
              <Link href="/pricing" className="underline underline-offset-2" style={{ color: GOLD }}>pricing page</Link>{' '}
              par hain.
            </p>
          </footer>

        </div>
      </main>
    </>
  );
}

function DetailCell({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="font-bold text-base" style={{ color: GOLD }}>{value || '—'}</div>
    </div>
  );
}

function Remedy({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1.5" style={{ color: GOLD }}>{title}</div>
      <div className="text-sm text-slate-300 leading-relaxed">{content}</div>
    </div>
  );
}
