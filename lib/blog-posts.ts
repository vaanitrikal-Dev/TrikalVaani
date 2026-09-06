// ============================================================
// TRIKAL VAANI — BLOG POSTS — SUPABASE VERSION
// CEO: Rohiit Gupta | Chief Vedic Architect
// Version: 3.8 (BUILD-COST FIX — getAllSlugs is now ordered + limitable)
// Date: 2026-09-06
//
// CHANGE v3.8 — WHY:
//   Vercel bill, cycle 26 Aug - 26 Sep: Build CPU = $40.80 of a $45.70 total.
//   Build log showed 2m59s of a 3m20s build spent here:
//     Generating static pages (0/1029) ... (1029/1029)
//   741 of those 1029 pages are /blog/[slug], pre-rendered on EVERY push —
//   353 pushes this cycle. A one-character code edit rebuilt all 741 posts.
//
//   getAllSlugs() returned every published slug with NO ordering, so it could
//   not be safely limited — slicing an unordered set gives arbitrary posts.
//   v3.8 adds `.order('published_at', desc)` and an optional `limit`, so
//   app/blog/[slug]/page.tsx can pre-render the newest N and let the rest
//   render on first request and then sit in the ISR cache.
//
//   NOTHING IS REMOVED FROM THE SITE. All 741 posts keep their URLs, their
//   full HTML, and their sitemap entries. The only change is WHEN the HTML is
//   produced — at build, or at first hit. Google receives identical markup.
//
//   Called with no argument, getAllSlugs() behaves exactly as in v3.7 (all
//   slugs, now ordered). Only the ordering is new for existing callers, and
//   blog page.tsx is the sole caller — verified with a repo-wide grep.
//
// Version: 3.7 (LIST-QUERY FIX — stops the nano DB outage)
// Date: 2026-09-05
//
// CHANGE v3.7 — WHY THIS EXISTS (DB OUTAGE ROOT CAUSE):
//   Postgres went Unhealthy on 2026-09-05. Logs showed, on repeat:
//     GET /blog_posts?select=*&is_published=eq.true&order=published_at.desc
//       -> 500  {"code":"57014","message":"canceling statement due to
//                statement timeout"}
//       -> "Warp server error: Thread killed by timeout manager" (x dozens)
//
//   That is getAllPosts() below. It did select('*') across 546 published
//   rows = ~5.9 MB, of which the `sections` JSONB alone is ~3.4 MB — and
//   /blog has `revalidate = 300`, so this fired every 5 minutes forever on
//   a 0.5 GB nano instance. Each run also regex-parsed all 546 bodies via
//   transformSections(). CPU 82%, Memory 82%, Disk IO 75%.
//
//   The punchline: /blog renders BlogCards. A BlogCard uses exactly six
//   fields. It never touched sections, faqs, remedies or classical_sources.
//   We were paying 5.9 MB to render ~60 KB of text.
//
//   FIX (this version):
//     • NEW const LIST_COLUMNS — the narrow column set the list views
//       actually read. No JSONB body columns.
//     • getAllPosts()     : select('*') -> LIST_COLUMNS, + .range()
//                           pagination so it can never silently truncate
//                           at Supabase's 1000-row cap as the blog grows.
//     • getRelatedPosts() : select('*') -> LIST_COLUMNS. The related-posts
//                           grid in app/blog/[slug]/page.tsx renders only
//                           slug, category and title.
//     • Both now use the anon client, same as getPostsForSitemap() — RLS
//       policy "Public can read published posts" already permits it, and
//       it removes the service-role-key-rotation failure mode described
//       in v3.6 below.
//
//   NOT CHANGED — deliberately:
//     • getPostBySlug() keeps select('*'). It fetches ONE row and the
//       article page genuinely needs sections/faqs/remedies. One row is
//       ~11 KB, not a problem.
//     • mapRow() is untouched and is null-safe for the columns the narrow
//       select omits: transformSections(undefined) -> [], and every other
//       optional field already has an `?? ''` / `?? []` / `?? null` guard.
//       So a narrow row maps to a BlogPost with empty body fields, which
//       is exactly what the list views want.
//     • Every export keeps its existing signature. Drop-in replacement.
//
// CHANGE v3.6 — WHY THIS EXISTS:
//   app/sitemap.ts emitted 4,979 URLs and ZERO /blog/ URLs, even though
//   /blog rendered 549 post links and 546 rows are is_published = true.
//   getAllPosts() never throws — on error it logs and `return []`, so the
//   sitemap's try/catch never fired and the failure was completely silent.
//
//   Two candidate causes were identified and NEITHER was provable remotely:
//     (A) select('*') pulls ~5.9 MB (the `sections` JSONB alone is 3.4 MB)
//         and is then regex-parsed for all 546 rows, inside the SAME
//         serverless invocation that already runs ~10 other Supabase
//         queries -> timeout.
//     (B) this file's client uses SUPABASE_SERVICE_ROLE_KEY, while every
//         loop in sitemap.ts that DOES work uses NEXT_PUBLIC_SUPABASE_ANON_KEY.
//         If the service role key was rotated in Supabase and not updated
//         in Vercel, every service-role query fails auth while every anon
//         query succeeds — exactly the observed symptom.
//
//   getPostsForSitemap() therefore defeats BOTH causes at once:
//     • narrow select (4 columns, ~50 KB instead of 5.9 MB — ~120x smaller)
//     • ANON key, the same key the working loops already use
//       (RLS policy "Public can read published posts" permits this)
//     • .range() pagination so the Supabase 1000-row cap can never
//       silently truncate the sitemap as the blog grows past 1,000 posts
//     • returns { rows, error } so sitemap.ts can log loudly instead of
//       failing silently ever again
//
//   getAllPosts() and every other export are UNCHANGED. /blog, /blog/[slug]
//   and related-posts keep using the service-role client exactly as before,
//   so this file is a safe drop-in.
//
// CHANGE v3.5:
//   • NEW BlogSection variant: { type:'video'; videoId; title?; isShort? }
//     Authored in Supabase as a standalone line:
//       !youtube[Optional Caption](https://www.youtube.com/shorts/VIDEO_ID)
//     Accepts youtube.com/shorts/, /watch?v=, youtu.be/, /embed/ URL forms.
//     isShort is auto-detected from the URL (shorts/ path) so the player
//     renders in portrait (9:16) instead of landscape (16:9).
//   • Requires app/blog/[slug]/page.tsx v2.8+ (adds the `video` case +
//     VideoObject JSON-LD). Fully backward compatible — old rows with
//     plain [label](url) links keep rendering as before.
// CHANGE v3.4:
//   • transformSections() no longer dumps the whole DB `body` into ONE <p>.
//     A 2,788-character single paragraph was being rendered per section.
//   • body is now split on blank lines and each chunk is typed:
//       "### Heading"        -> h3
//       "> quoted text"      -> quote
//       "- item" lines       -> ul
//       "1. item" lines      -> ol
//       "![alt](/img.svg)"   -> img   (optional "Caption" after the path)
//       anything else        -> p
//   • NEW BlogSection variant: { type:'img'; src; alt; caption? }
//     Requires app/blog/[slug]/page.tsx v2.5+ (adds the `img` case).
//   • Fully backward compatible: old rows with plain prose bodies still
//     render exactly as before, just correctly paragraphed.
// ============================================================
// HOW TO ADD NEW ARTICLES:
//   1. Go to Supabase dashboard → Table Editor → blog_posts
//   2. Click "Insert Row"
//   3. Fill slug, title, description, direct_answer, category,
//      domain, keywords, sections (JSON), faqs (JSON), etc.
//   4. Click Save — article is LIVE instantly, zero redeploy!
// ============================================================

import { createClient } from '@supabase/supabase-js';

// ============================================================
// TYPES — v3.2: sections now correctly typed + transformed
// ============================================================
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  directAnswer: string;
  category: string;
  domain: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  ogImage: string;
  ctaService: {
    label: string;
    href: string;
    price: string;
  };
  // ── v3.1: Playbook body columns ──────────────────────────
  emotional: string;
  communication: string;
  strengths: string;
  challenges: string;
  remedies: string;
  // ─────────────────────────────────────────────────────────
  sections: BlogSection[];
  faqs: { q: string; a: string }[];
  relatedSlugs: string[];
  classicalSources: string;
  // ── v3.3: bilingual (EN/HI) support ──────────────────────
  lang: string;               // 'en' | 'hi'
  altLangSlug: string | null; // counterpart slug in the other language (hreflang pairing)
}

export type BlogSection =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; variant: 'tip' | 'warn' | 'verdict'; text: string }
  | { type: 'quote'; text: string }
  // ── v3.4: inline diagram / illustration ──────────────────
  | { type: 'img'; src: string; alt: string; caption?: string }
  // ── v3.5: embedded YouTube video ──────────────────────────
  | { type: 'video'; videoId: string; title?: string; isShort?: boolean };

// ── v3.6: minimal shape the sitemap needs. Deliberately NOT BlogPost —
//    pulling BlogPost for the sitemap is what cost 5.9 MB per build.
export interface SitemapPost {
  slug: string;
  updatedAt: string | null;
  lang: string;
  altLangSlug: string | null;
}

// ============================================================
// SUPABASE CLIENTS
// ============================================================
// Service-role client — used by every page-rendering export below.
// UNCHANGED from v3.5.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── v3.6: anon client, used ONLY by getPostsForSitemap().
// Mirrors anonClient() in app/sitemap.ts, whose loops all succeed.
// RLS policy on blog_posts: "Public can read published posts [SELECT/public]".
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================
// v3.7 — NARROW COLUMN SET FOR LIST VIEWS
// ============================================================
// The only columns /blog cards and the related-posts grid read.
// Excludes the heavy body columns: sections (3.4 MB across the table),
// faqs, direct_answer, emotional, communication, strengths, challenges,
// remedies, classical_sources, related_slugs, keywords.
// Adding a column here is cheap. Adding `sections` here is what caused
// the 2026-09-05 outage — do not.
const LIST_COLUMNS =
  'slug, title, description, category, domain, published_at, updated_at, ' +
  'read_time_minutes, og_image, cta_label, cta_href, cta_price, ' +
  'lang, alt_lang_slug';

const LIST_PAGE_SIZE = 1000;
const LIST_MAX_PAGES = 20; // hard stop: 20,000 posts. Guards a runaway loop.

// ============================================================
// SECTIONS TRANSFORM — v3.4
// Supabase `sections` column: [{ title: string, body: string }]
//
// The body is Markdown-lite. It is split on blank lines and each
// chunk becomes a typed BlogSection block:
//
//   ### Sub heading          -> h3
//   > quoted line            -> quote
//   - bullet                 -> ul   (consecutive "- " lines)
//   1. step                  -> ol   (consecutive "1. " lines)
//   ![alt](/x.svg "Caption") -> img
//   plain prose              -> p
//
// Inline **bold**, *italic* and [label](/url) are handled downstream
// by renderText() in app/blog/[slug]/page.tsx — unchanged.
// ============================================================

const IMG_RE = /^!\[([^\]]*)\]\(\s*([^)\s"]+)(?:\s+"([^"]*)")?\s*\)$/;

// ── v3.5: !youtube[Caption](youtube-url) — standalone line ──
const YOUTUBE_RE = /^!youtube\[([^\]]*)\]\(\s*([^)\s]+)\s*\)$/;

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/shorts\/([\w-]{11})/,
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function parseBody(body: string): BlogSection[] {
  const blocks: BlogSection[] = [];

  // Normalise newlines, then split on one-or-more blank lines.
  const chunks = body
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    // ── image (standalone line) ──
    const img = lines[0].match(IMG_RE);
    if (img && lines.length === 1) {
      blocks.push({
        type: 'img',
        alt: (img[1] || '').trim(),
        src: img[2].trim(),
        ...(img[3] ? { caption: img[3].trim() } : {}),
      });
      continue;
    }

    // ── youtube video (standalone line) ──
    const yt = lines[0].match(YOUTUBE_RE);
    if (yt && lines.length === 1) {
      const rawUrl = yt[2].trim();
      const videoId = extractYouTubeId(rawUrl);
      if (videoId) {
        blocks.push({
          type: 'video',
          videoId,
          ...(yt[1]?.trim() ? { title: yt[1].trim() } : {}),
          isShort: /youtube\.com\/shorts\//.test(rawUrl),
        });
        continue;
      }
      // Unrecognised URL shape — fall through and render as plain paragraph
      // rather than silently dropping the line.
    }

    // ── h3 ──
    if (lines.length === 1 && lines[0].startsWith('### ')) {
      blocks.push({ type: 'h3', text: lines[0].slice(4).trim() });
      continue;
    }

    // ── quote ──
    if (lines.every((l) => l.startsWith('> '))) {
      blocks.push({ type: 'quote', text: lines.map((l) => l.slice(2).trim()).join(' ') });
      continue;
    }

    // ── unordered list ──
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      blocks.push({ type: 'ul', items: lines.map((l) => l.replace(/^[-*]\s+/, '').trim()) });
      continue;
    }

    // ── ordered list ──
    if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
      blocks.push({ type: 'ol', items: lines.map((l) => l.replace(/^\d+[.)]\s+/, '').trim()) });
      continue;
    }

    // ── paragraph (soft-wrapped lines rejoined) ──
    blocks.push({ type: 'p', text: lines.join(' ') });
  }

  return blocks;
}

function transformSections(raw: unknown): BlogSection[] {
  if (!Array.isArray(raw)) return [];
  return (raw as { title?: string; body?: string }[]).flatMap((s) => {
    const blocks: BlogSection[] = [];
    if (s.title?.trim()) {
      blocks.push({ type: 'h2', text: s.title.trim() });
    }
    if (s.body?.trim()) {
      blocks.push(...parseBody(s.body));
    }
    return blocks;
  });
}

// ============================================================
// ROW → BlogPost mapper — v3.4: sections parsed into typed blocks
// ============================================================
function mapRow(row: Record<string, unknown>): BlogPost {
  return {
    slug:             row.slug as string,
    title:            row.title as string,
    description:      row.description as string,
    directAnswer:     row.direct_answer as string,
    category:         row.category as string,
    domain:           row.domain as string,
    keywords:         (row.keywords as string[]) ?? [],
    publishedAt:      row.published_at as string,
    updatedAt:        row.updated_at as string,
    readTimeMinutes:  row.read_time_minutes as number,
    ogImage:          row.og_image as string,
    ctaService: {
      label: row.cta_label as string,
      href:  row.cta_href as string,
      price: row.cta_price as string,
    },
    // ── v3.1: Playbook body columns ──────────────────────────
    emotional:        (row.emotional as string) ?? '',
    communication:    (row.communication as string) ?? '',
    strengths:        (row.strengths as string) ?? '',
    challenges:       (row.challenges as string) ?? '',
    remedies:         (row.remedies as string) ?? '',
    // ─────────────────────────────────────────────────────────
    // ── v3.4: Transform {title,body}[] → BlogSection[] ───────
    sections:         transformSections(row.sections),
    // ─────────────────────────────────────────────────────────
    faqs:             (row.faqs as { q: string; a: string }[]) ?? [],
    relatedSlugs:     (row.related_slugs as string[]) ?? [],
    classicalSources: row.classical_sources as string,
    // ── v3.3: bilingual (EN/HI) support ──────────────────────
    lang:             (row.lang as string) ?? 'en',
    altLangSlug:      (row.alt_lang_slug as string) ?? null,
  };
}

// ============================================================
// PUBLIC API — Same function signatures, zero breaking changes
// ============================================================

// v3.7 — narrow select + pagination + anon client.
// Before: select('*') = 546 rows / ~5.9 MB / statement timeout on nano.
// After:  ~14 columns  = 546 rows / ~60 KB.
// Returned BlogPost objects have empty sections/faqs/remedies by design —
// the list views never read them. Use getPostBySlug() for a full article.
export async function getAllPosts(): Promise<BlogPost[]> {
  const rows: Record<string, unknown>[] = [];

  for (let page = 0; page < LIST_MAX_PAGES; page++) {
    const from = page * LIST_PAGE_SIZE;
    const to = from + LIST_PAGE_SIZE - 1;

    const { data, error } = await supabaseAnon
      .from('blog_posts')
      .select(LIST_COLUMNS)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error(
        `[TV-Blog] getAllPosts FAILED on page ${page}:`,
        error.message
      );
      // Return the partial set rather than nothing — a half-full /blog
      // beats an empty one, and the error is now loud in the logs.
      break;
    }

    const batch = (data ?? []) as unknown as Record<string, unknown>[];
    rows.push(...batch);

    if (batch.length < LIST_PAGE_SIZE) break;
  }

  return rows.map(mapRow);
}

// ============================================================
// v3.6 — SITEMAP READER
// Narrow columns + anon key + explicit pagination + surfaced error.
// Returns { rows, error } on purpose: the caller MUST be able to tell
// "zero posts" apart from "the query failed", which is precisely the
// distinction that hid 546 missing URLs.
// ============================================================
const SITEMAP_PAGE_SIZE = 1000;
const SITEMAP_MAX_PAGES = 20; // hard stop: 20,000 posts. Guards against a runaway loop.

export async function getPostsForSitemap(): Promise<{
  rows: SitemapPost[];
  error: string | null;
}> {
  const rows: SitemapPost[] = [];

  for (let page = 0; page < SITEMAP_MAX_PAGES; page++) {
    const from = page * SITEMAP_PAGE_SIZE;
    const to = from + SITEMAP_PAGE_SIZE - 1;

    const { data, error } = await supabaseAnon
      .from('blog_posts')
      .select('slug, updated_at, lang, alt_lang_slug')
      .eq('is_published', true)
      .order('slug', { ascending: true })
      .range(from, to);

    if (error) {
      console.error(
        `[TV-Blog] getPostsForSitemap FAILED on page ${page}:`,
        error.message
      );
      // Return whatever was already fetched plus the error, so a partial
      // sitemap is still better than an empty one — but the caller knows.
      return { rows, error: error.message };
    }

    const batch = (data ?? []) as Record<string, unknown>[];

    for (const r of batch) {
      const slug = r.slug as string | null;
      if (!slug) continue; // never emit /blog/null
      rows.push({
        slug,
        updatedAt: (r.updated_at as string) ?? null,
        lang: (r.lang as string) ?? 'en',
        altLangSlug: (r.alt_lang_slug as string) ?? null,
      });
    }

    // Short page means we've reached the end.
    if (batch.length < SITEMAP_PAGE_SIZE) break;
  }

  return { rows, error: null };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return undefined;
  return mapRow(data);
}

// v3.8 — ordered, and limitable.
//   getAllSlugs()    -> every published slug, newest first (old behaviour + order)
//   getAllSlugs(60)  -> the 60 newest published slugs, for generateStaticParams
// Uses the anon client and a single-column select, same as the rest of v3.7.
export async function getAllSlugs(limit?: number): Promise<string[]> {
  let query = supabaseAnon
    .from('blog_posts')
    .select('slug')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (typeof limit === 'number' && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[TV-Blog] getAllSlugs error:', error.message);
    return [];
  }
  return (data ?? []).map((r) => r.slug as string);
}

// v3.7 — narrow select + anon client.
// The related-posts grid in app/blog/[slug]/page.tsx renders only
// slug, category and title. It was pulling full article bodies for
// every related post on EVERY article page render.
export async function getRelatedPosts(slugs: string[]): Promise<BlogPost[]> {
  if (!slugs.length) return [];
  const { data, error } = await supabaseAnon
    .from('blog_posts')
    .select(LIST_COLUMNS)
    .in('slug', slugs)
    .eq('is_published', true);

  if (error) {
    console.error('[TV-Blog] getRelatedPosts error:', error.message);
    return [];
  }
  return ((data ?? []) as unknown as Record<string, unknown>[]).map(mapRow);
}
