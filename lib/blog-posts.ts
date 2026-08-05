// ============================================================
// TRIKAL VAANI — BLOG POSTS — SUPABASE VERSION
// CEO: Rohiit Gupta | Chief Vedic Architect
// Version: 3.5 (BODY PARSER — adds embedded YouTube video blocks)
// Date: 2026-08-05
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

// ============================================================
// SUPABASE CLIENT — Server-side only (no client JS leak)
// ============================================================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[TV-Blog] getAllPosts error:', error.message);
    return [];
  }
  return (data ?? []).map(mapRow);
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

export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('is_published', true);

  if (error) return [];
  return (data ?? []).map((r) => r.slug as string);
}

export async function getRelatedPosts(slugs: string[]): Promise<BlogPost[]> {
  if (!slugs.length) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .in('slug', slugs)
    .eq('is_published', true);

  if (error) return [];
  return (data ?? []).map(mapRow);
}
