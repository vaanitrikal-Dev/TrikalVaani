// ============================================================
// TRIKAAL VAANI — lib/wiki.ts
// Version: 1.2 (03 Oct 2026) — NO granth is restricted any more (Rohiit's ruling, 3 Oct 2026)
//   v1.2: RESTRICTED_WORKS is now EMPTY. Rohiit, 3 Oct 2026: "BPHS ke Sanskrit
//         slokas dikhao ... changed the rule ... we also have our PDF in our
//         library" and then "aur bhi koi restriction hai toh wo bhi hatado".
//         So the Sanskrit mool shlok of every granth (bphs, phaladipika,
//         brihajjataka, jatakaparijata, chamatkarachintamani, bhrigusutram
//         included) is shown wherever the citation's sanskrit field is filled.
//         The Set is kept (empty) so existing imports keep compiling.
//         canShowSanskrit() still needs a non-empty sanskrit field, so old
//         citations saved with sanskrit = null show no text until filled.
//         (v1.1, never deployed, removed only 'bphs'; v1.2 replaces it.)
//   v1.0 (27 Sep 2026) — ONE source for the Wikipedia-style format
// Owner: Rohiit Gupta, Chief Vedic Architect
//
// editorial_rulings #8 section G: this format is the Trikaal Vaani standard for
// EVERY pillar and cluster on /blog, /learn and /events. Everything that must
// behave identically on all three lives here, so it is fixed in one place:
//   • data types + normalizers: citations, infobox, glossary, hub group
//   • headingAnchor(): the one slug rule for H2 ids
//   • GRANTH_META, RESTRICTED_WORKS (empty from v1.2), canShowSanskrit()
//   • citationRef() / citationSchema() (Chapter + Quotation JSON-LD)
//   • ENTITY_LINKS (verified Wikipedia/Wikidata URLs only) + entity matching
//   • glossarySchema() (DefinedTermSet), citeSplit() for [^n] markers
// No React, no Supabase client — safe to import from server AND client
// components ('use client' SeoPageLayout imports it).
// ============================================================

// ── Types ───────────────────────────────────────────────────
export interface WikiCitation {
  work: string | null;        // public.bphs_slokas.work key, null = open-source Granth
  granth: string;             // display name, e.g. "Brihat Parashara Hora Shastra"
  adhyaya: number | null;
  shlok: string | null;       // "8" or "19-44"; null when only the Granth is cited
  edition: string | null;
  rule_en: string | null;
  rule_hi: string | null;
  // ── v3.11 ──
  adhyaya_name: string | null; // e.g. "Nakshatra Prakaranam" / "नक्षत्रप्रकरणम्"
  sanskrit: string | null;     // mool shlok (Devanagari); shown for every granth from v1.2
}

export interface WikiInfoboxRow {
  label: string;
  value: string; // may contain [^n] citation markers and [label](/url) links
}

export interface WikiGlossaryTerm {
  term: string;
  definition: string;
  same_as: string | null; // verified Wikipedia/Wikidata URL only
}

export interface WikiHubGroup {
  label: string;  // e.g. "Aaj Samuh" / "आज समूह"
  anchor: string; // headingAnchor() of the pillar H2 for this group
}

// ── Normalizers (drop malformed rows, never crash a page) ───
export function normalizeCitations(raw: unknown): WikiCitation[] {
  if (!Array.isArray(raw)) return [];
  const out: WikiCitation[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    const granth = typeof o.granth === 'string' ? o.granth.trim() : '';
    if (!granth) continue;
    const adh = Number(o.adhyaya);
    const shlok = o.shlok === null || o.shlok === undefined || o.shlok === '' ? null : String(o.shlok).trim();
    const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
    out.push({
      work: str(o.work),
      granth,
      adhyaya: Number.isFinite(adh) && adh > 0 ? adh : null,
      shlok,
      edition: str(o.edition),
      rule_en: str(o.rule_en),
      rule_hi: str(o.rule_hi),
      adhyaya_name: str(o.adhyaya_name),
      sanskrit: str(o.sanskrit),
    });
  }
  return out;
}

export function headingAnchor(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[\s\u2013\u2014:;,.!?'"\u201c\u201d\u2018\u2019()\[\]{}\/\\|\u00b7\u0964\u0965&+*#%@=<>~^`$]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'section';
}

export function normalizeHubGroup(raw: unknown): WikiHubGroup | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const label = typeof o.label === 'string' ? o.label.trim() : '';
  const anchor = typeof o.anchor === 'string' ? o.anchor.trim() : '';
  return label && anchor ? { label, anchor } : null;
}

export function normalizeInfobox(raw: unknown): WikiInfoboxRow[] {
  if (!Array.isArray(raw)) return [];
  const out: WikiInfoboxRow[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    const label = typeof o.label === 'string' ? o.label.trim() : '';
    const value = typeof o.value === 'string' ? o.value.trim() : '';
    if (label && value) out.push({ label, value });
  }
  return out;
}

export function normalizeGlossary(raw: unknown): WikiGlossaryTerm[] {
  if (!Array.isArray(raw)) return [];
  const out: WikiGlossaryTerm[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    const term = typeof o.term === 'string' ? o.term.trim() : '';
    const definition = typeof o.definition === 'string' ? o.definition.trim() : '';
    const sa = typeof o.same_as === 'string' && /^https:\/\//.test(o.same_as.trim()) ? o.same_as.trim() : null;
    if (term && definition) out.push({ term, definition, same_as: sa });
  }
  return out;
}

// ── Granth metadata + licence rule ──────────────────────────
// same_as = a VERIFIED Wikipedia/Wikidata URL for the Book entity.
// Leave it out rather than guess (editorial_rulings #8 G.5).
export const GRANTH_META: Record<string, { sa: string; author: string | null; same_as?: string }> = {
  bphs:                  { sa: 'बृहत्पाराशरहोराशास्त्रम्', author: 'Maharishi Parashara' },
  phaladipika:           { sa: 'फलदीपिका', author: 'Mantreshwara' },
  jatakaparijata:        { sa: 'जातकपारिजातः', author: 'Vaidyanatha Dikshita' },
  brihajjataka:          { sa: 'बृहज्जातकम्', author: 'Varahamihira' },
  laghujataka:           { sa: 'लघुजातकम्', author: 'Varahamihira' },
  brihatsamhita:         { sa: 'बृहत्संहिता', author: 'Varahamihira' },
  bhrigusutram:          { sa: 'भृगुसूत्रम्', author: 'Maharishi Bhrigu' },
  chamatkarachintamani:  { sa: 'चमत्कारचिन्तामणि', author: 'Bhatta Narayana' },
  saravali:              { sa: 'सारावली', author: 'Kalyanavarma' },
  jaiminisutra:          { sa: 'जैमिनिसूत्रम्', author: 'Maharishi Jaimini' },
  jaiminiyaupadesasutra: { sa: 'जैमिनीयोपदेशसूत्रम्', author: 'Maharishi Jaimini' },
  uttarakalamrita:       { sa: 'उत्तरकालामृतम्', author: 'Kalidasa' },
  sarvarthachintamani:   { sa: 'सर्वार्थचिन्तामणि', author: 'Venkatesha Daivajna' },
  jatakatattva:          { sa: 'जातकतत्त्वम्', author: 'Mahadeva' },
  muhurtachintamani:     { sa: 'मुहूर्तचिन्तामणि', author: 'Rama Daivajna' },
  vriddhayavanajataka:   { sa: 'वृद्धयवनजातकम्', author: 'Minaraja' },
  minarajayavanajataka:  { sa: 'वृद्धयवनजातकम्', author: 'Minaraja' },
  gargahora:             { sa: 'गर्गहोरा', author: null },
  daivajnavallabha:      { sa: 'दैवज्ञवल्लभा', author: null },
  shatpanchashika:       { sa: 'षट्पञ्चाशिका', author: null },
};

// v1.2 (3 Oct 2026): NO restricted granth. Rohiit removed every restriction —
// all 6 earlier names (bhrigusutram, bphs, brihajjataka, chamatkarachintamani,
// jatakaparijata, phaladipika) are now allowed. Kept as an empty Set so any
// future restriction is a one-line change here (editorial_rulings #8 B.2C).
export const RESTRICTED_WORKS = new Set<string>([]);

export function canShowSanskrit(c: WikiCitation): boolean {
  return Boolean(c.sanskrit && c.work && !RESTRICTED_WORKS.has(c.work));
}

export function citationRef(c: WikiCitation, hi: boolean): string {
  const parts: string[] = [];
  if (c.adhyaya) {
    parts.push(`${hi ? 'अध्याय' : 'Adhyaya'} ${c.adhyaya}${c.adhyaya_name ? ` — ${c.adhyaya_name}` : ''}`);
  }
  if (c.shlok) parts.push(`${hi ? 'श्लोक' : 'Shlok'} ${c.shlok}`);
  if (c.edition) parts.push(c.edition);
  return parts.join(' · ');
}

export function citationSchema(c: WikiCitation, hi: boolean): Record<string, unknown> {
  const meta = c.work ? GRANTH_META[c.work] : undefined;
  const book: Record<string, unknown> = {
    '@type': 'Book',
    name: c.granth,
    inLanguage: 'sa',
  };
  if (meta?.sa) book.alternateName = meta.sa;
  if (meta?.author) book.author = { '@type': 'Person', name: meta.author };
  if (meta?.same_as) book.sameAs = meta.same_as;
  if (c.edition) book.bookEdition = c.edition;
  const rule = (hi ? c.rule_hi || c.rule_en : c.rule_en || c.rule_hi) ?? undefined;
  if (!c.adhyaya) {
    return rule ? { ...book, description: rule } : book;
  }
  const chapter: Record<string, unknown> = {
    '@type': 'Chapter',
    name: `${c.granth} — ${hi ? 'अध्याय' : 'Adhyaya'} ${c.adhyaya}${c.adhyaya_name ? ` (${c.adhyaya_name})` : ''}`,
    isPartOf: book,
  };
  if (c.shlok) chapter.pagination = `${hi ? 'श्लोक' : 'Shloka'} ${c.shlok}`;
  if (rule) chapter.description = rule;
  // v3.4: the mool shlok as a Quotation — only where it may be shown
  if (canShowSanskrit(c)) {
    chapter.hasPart = { '@type': 'Quotation', text: c.sanskrit, inLanguage: 'sa' };
  }
  return chapter;
}

// ── Entity linking — VERIFIED URLs only (27 Sep 2026) ───────
// Every URL below was seen on Wikipedia/Wikidata itself. Never add a guessed
// URL. aliases are matched against page text (Latin: whole word,
// case-sensitive; Devanagari: substring). Ambiguous Hindi words (मूल = root,
// हस्त = hand) are deliberately not aliases. Muhurta Chintamani has NO
// verified Wikipedia/Wikidata page — deliberately absent.
const WP = 'https://en.wikipedia.org/wiki/';
export const ENTITY_LINKS: { name: string; aliases: string[]; sameAs: string[] }[] = [
  { name: 'Nakshatra', aliases: ['Nakshatra', 'नक्षत्र'], sameAs: [`${WP}Nakshatra`, 'https://www.wikidata.org/wiki/Q1125935'] },
  { name: 'Hindu astrology', aliases: ['Hindu astrology', 'Jyotish', 'ज्योतिष'], sameAs: [`${WP}Hindu_astrology`] },
  { name: 'Anuradha', aliases: ['Anuradha', 'अनुराधा'], sameAs: [`${WP}Anuradha_(nakshatra)`, 'https://www.wikidata.org/wiki/Q2606414'] },
  { name: 'Rohini', aliases: ['Rohini', 'रोहिणी'], sameAs: [`${WP}Rohini_(nakshatra)`] },
  { name: 'Hasta', aliases: ['Hasta'], sameAs: [`${WP}Hasta_(nakshatra)`] },
  { name: 'Mula', aliases: ['Mula'], sameAs: [`${WP}Mula_(nakshatra)`] },
  { name: 'Jyeshtha', aliases: ['Jyeshtha', 'ज्येष्ठा'], sameAs: [`${WP}Jyeshtha_(nakshatra)`] },
  { name: 'Ardra', aliases: ['Ardra', 'आर्द्रा'], sameAs: [`${WP}Ardra_(nakshatra)`] },
  { name: 'Purva Phalguni', aliases: ['Purva Phalguni', 'पूर्वा फाल्गुनी'], sameAs: [`${WP}P%C5%ABrva_Phalgun%C4%AB`] },
  { name: 'Uttara Phalguni', aliases: ['Uttara Phalguni', 'उत्तरा फाल्गुनी'], sameAs: [`${WP}Uttara_Phalgun%C4%AB`] },
  { name: 'Uttara Ashadha', aliases: ['Uttara Ashadha', 'उत्तराषाढ़ा'], sameAs: [`${WP}Uttara_Ashadha`] },
  { name: 'Purva Ashadha', aliases: ['Purva Ashadha', 'पूर्वाषाढ़ा'], sameAs: [`${WP}Purva_Ashadha`] },
  { name: 'Purva Bhadrapada', aliases: ['Purva Bhadrapada', 'पूर्वा भाद्रपद'], sameAs: [`${WP}Purva_Bhadrapada`] },
  { name: 'Uttara Bhadrapada', aliases: ['Uttara Bhadrapada', 'उत्तरा भाद्रपद'], sameAs: [`${WP}Uttara_Bhadrapada`] },
  { name: 'Revati', aliases: ['Revati', 'रेवती'], sameAs: [`${WP}Revati_(nakshatra)`] },
  { name: 'Abhijit', aliases: ['Abhijit', 'अभिजित्'], sameAs: [`${WP}Abhijit_(nakshatra)`] },
  { name: 'Swati', aliases: ['Swati', 'Svati', 'स्वाति'], sameAs: [`${WP}Svati`] },
  { name: 'Shravana', aliases: ['Shravana', 'श्रवण'], sameAs: [`${WP}Shravana_(nakshatra)`] },
  { name: 'Dhanishtha', aliases: ['Dhanishtha', 'धनिष्ठा'], sameAs: [`${WP}Dhanishtha`] },
  { name: 'Ashwini', aliases: ['Ashwini', 'Ashvini', 'अश्विनी'], sameAs: [`${WP}Ashvini`] },
  { name: 'Bharani', aliases: ['Bharani', 'भरणी'], sameAs: [`${WP}Bharani`] },
  { name: 'Pushya', aliases: ['Pushya', 'पुष्य'], sameAs: [`${WP}Pushya`] },
  { name: 'Magha', aliases: ['Magha', 'मघा'], sameAs: [`${WP}Magha_(nakshatra)`] },
  { name: 'Ashlesha', aliases: ['Ashlesha', 'आश्लेषा'], sameAs: [`${WP}Ashlesha`] },
  { name: 'Chitra', aliases: ['Chitra', 'चित्रा'], sameAs: [`${WP}Chitra_(nakshatra)`] },
];

export function entityFor(term: string) {
  const t = term.trim().toLowerCase();
  return ENTITY_LINKS.find((e) => e.aliases.some((a) => a.toLowerCase() === t));
}

export type WikiEntity = (typeof ENTITY_LINKS)[number];

export function matchEntities(text: string): WikiEntity[] {
  return ENTITY_LINKS.filter((e) =>
    e.aliases.some((a) =>
      /[a-zA-Z]/.test(a)
        ? new RegExp(`(^|[^A-Za-z])${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z]|$)`).test(text)
        : text.indexOf(a) !== -1,
    ),
  );
}

/** Article.about (glossary terms with verified URLs) + Article.mentions */
export function entitySchema(glossary: WikiGlossaryTerm[], text: string): Record<string, unknown> {
  const about = glossary
    .map((g) => {
      const e = entityFor(g.term);
      const sameAs = e ? e.sameAs : g.same_as ? [g.same_as] : [];
      return sameAs.length ? { '@type': 'Thing', name: e ? e.name : g.term, sameAs } : null;
    })
    .filter((x): x is { '@type': string; name: string; sameAs: string[] } => x !== null);
  const aboutNames = new Set(about.map((a) => a.name));
  const mentions = matchEntities(text)
    .filter((e) => !aboutNames.has(e.name))
    .slice(0, 25)
    .map((e) => ({ '@type': 'Thing', name: e.name, sameAs: e.sameAs }));
  return {
    ...(about.length ? { about } : {}),
    ...(mentions.length ? { mentions } : {}),
  };
}

/** DefinedTermSet JSON-LD, or null when there is no glossary */
export function glossarySchema(url: string, hi: boolean, glossary: WikiGlossaryTerm[]): Record<string, unknown> | null {
  if (!glossary.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${url}#glossary`,
    name: hi ? 'शब्दावली' : 'Glossary',
    inLanguage: hi ? 'hi-IN' : 'en-IN',
    hasDefinedTerm: glossary.map((g) => {
      const e = entityFor(g.term);
      const sameAs = e ? e.sameAs : g.same_as ? [g.same_as] : null;
      return {
        '@type': 'DefinedTerm',
        name: g.term,
        description: g.definition,
        inDefinedTermSet: `${url}#glossary`,
        ...(sameAs ? { sameAs } : {}),
      };
    }),
  };
}

// ── [^n] citation markers ───────────────────────────────────
export const CITE_SPLIT_RE = /(\[\^\d+\])/g;
/** Splits text into plain parts and marker numbers, in order. */
export function citeSplit(text: string): (string | number)[] {
  return text
    .split(CITE_SPLIT_RE)
    .filter((p) => p !== '')
    .map((p) => {
      const m = p.match(/^\[\^(\d+)\]$/);
      return m ? Number(m[1]) : p;
    });
}
/** Removes [^n] markers (for word counts, plain-text schema fields). */
export function stripCites(text: string): string {
  return text.replace(/\[\^\d+\]/g, '');
}

// ── Back-link anchors for [^n] (plain-text surfaces: infobox, festival) ──
// Anchor id = cite-ref-{n}-{loc}-{occ}. Computed from the text itself, so it
// never depends on React render order. firstCiteAnchors() returns, for each n,
// the anchor of its FIRST occurrence across the given texts (in order).
export function citeAnchor(n: number, loc: string, occ: number): string {
  return `cite-ref-${n}-${loc}-${occ}`;
}
export function firstCiteAnchors(texts: { text: string; loc: string }[], max: number): Map<number, string> {
  const first = new Map<number, string>();
  for (const { text, loc } of texts) {
    let occ = 0;
    for (const part of citeSplit(text)) {
      if (typeof part === 'number') {
        if (part >= 1 && part <= max && !first.has(part)) first.set(part, citeAnchor(part, loc, occ));
        occ += 1;
      }
    }
  }
  return first;
}
