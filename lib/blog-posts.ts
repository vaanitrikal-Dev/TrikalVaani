// ============================================================
// TRIKAL VAANI — BLOG POSTS — SUPABASE VERSION
// CEO: Rohiit Gupta | Chief Vedic Architect
// Version: 3.1 (Added body columns: emotional, communication,
//               strengths, challenges, remedies)
// Date: 2026-06-13
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
// TYPES — v3.1: 5 new body fields added
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
}

export type BlogSection =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; variant: 'tip' | 'warn' | 'verdict'; text: string }
  | { type: 'quote'; text: string };

// ============================================================
// SUPABASE CLIENT — Server-side only (no client JS leak)
// ============================================================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// ROW → BlogPost mapper — v3.1: 5 new fields mapped
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
    sections:         (row.sections as BlogSection[]) ?? [],
    faqs:             (row.faqs as { q: string; a: string }[]) ?? [],
    relatedSlugs:     (row.related_slugs as string[]) ?? [],
    classicalSources: row.classical_sources as string,
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
