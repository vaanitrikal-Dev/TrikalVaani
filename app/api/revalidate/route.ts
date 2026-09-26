/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/api/revalidate/route.ts          (NEW FILE)
 * Version:     v1.0 — 26 Sep 2026
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Ship with:   app/sitemap.ts v9.4 (same commit, ONE deploy)
 *
 * PURPOSE
 *   When a content row changes in Supabase, make the live page show it
 *   IMMEDIATELY instead of after the 24 h page cache, and tell Bing /
 *   ChatGPT search / Copilot (IndexNow) that the URL changed.
 *     1. revalidatePath() for every URL that row feeds (EN, HI, all 10 city
 *        copies for festivals) + its hub page + /sitemap.xml
 *     2. IndexNow ping for the same public URLs (published rows only)
 *   Google does NOT use IndexNow. For Google the signal is the honest
 *   <lastmod> in sitemap v9.4 + a fresh page when Googlebot arrives.
 *
 * WHO CALLS IT
 *   A) Supabase Database Webhooks (INSERT / UPDATE / DELETE) on:
 *        blog_posts, seo_pillar_pages, compatibility_pages,
 *        festival_content, festivals_master, dream_symbols, domain_pages
 *      Supabase sends: { type, table, schema, record, old_record }
 *      NOT panchang_daily — its cron rewrites many rows every night and
 *      already pings IndexNow itself (app/api/cron/panchang-generate).
 *   B) Manual / scripts:  { "paths": ["/events/pitru-paksha-2026", ...] }
 *      Optional: "indexnow": false to skip the IndexNow ping.
 *
 * AUTH
 *   Header  Authorization: Bearer <REVALIDATE_SECRET>   (new Vercel env var,
 *   used by the Supabase webhooks). The existing CRON_SECRET is also
 *   accepted, so the crons can call it too. 401 otherwise.
 *
 * WHY NEXT 13.5 CAN DO THIS
 *   Next 13.5.1 revalidatePath(path) clears the page's full-route cache AND
 *   every fetch() made while rendering it (implicit tag _N_T_<path>) —
 *   checked in node_modules/next/dist/server/lib/patch-fetch.js
 *   (addImplicitTags). Concrete paths are used, never "[slug]" patterns, so
 *   one edit re-renders only the pages it really touches.
 *
 * SAFETY
 *   • Read-only on Supabase except one anon SELECT (festivals_master rows
 *     need their Hindi slug from festival_content).
 *   • Never throws to the caller: a bad payload returns 400, an IndexNow
 *     failure is reported in the JSON but the revalidation still stands.
 *   • Max 200 paths per call.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import citiesData from '../../data/cities.json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const SITE_URL = (process.env.SITE_URL || 'https://trikalvaani.com').replace(/\/$/, '');
const HOST = SITE_URL.replace(/^https?:\/\//, '');
const CRON_SECRET = process.env.CRON_SECRET;
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;
const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_PATHS = 200;

type Row = Record<string, unknown> | null | undefined;
type WebhookBody = {
  type?: 'INSERT' | 'UPDATE' | 'DELETE';
  table?: string;
  schema?: string;
  record?: Row;
  old_record?: Row;
};
type ManualBody = { paths?: unknown; indexnow?: boolean };

const CITY_SLUGS: string[] = (() => {
  try {
    const arr = (citiesData as { cities?: { slug?: string }[] }).cities ?? [];
    return arr.map((c) => c.slug).filter((s): s is string => typeof s === 'string' && s.length > 0);
  } catch {
    return [];
  }
})();

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
const baseSlugOf = (s: string) => s.replace(/-20\d\d$/, '');

function anon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Is this row live on the site? Unpublished rows are still revalidated
 *  (so a takedown shows at once) but never sent to IndexNow. */
function isLive(table: string, r: Row): boolean {
  if (!r) return false;
  switch (table) {
    case 'blog_posts':
    case 'festival_content':
      return r.is_published === true;
    case 'seo_pillar_pages':
      return r.published === true;
    case 'festivals_master':
      return r.is_indexed === true;
    default:
      return true; // compatibility_pages, dream_symbols, domain_pages have no flag
  }
}

/** Every public path one row feeds. Hubs are included; the sitemap is added later. */
async function pathsForRow(table: string, r: Row): Promise<string[]> {
  if (!r) return [];
  const out: string[] = [];
  switch (table) {
    case 'blog_posts': {
      const slug = str(r.slug);
      const alt = str(r.alt_lang_slug);
      if (slug) out.push(`/blog/${slug}`);
      if (alt) out.push(`/blog/${alt}`); // its hreflang partner links back to it
      out.push('/blog');
      break;
    }
    case 'seo_pillar_pages': {
      const slug = str(r.slug);
      if (slug) out.push(`/learn/${slug}`);
      out.push('/learn');
      break;
    }
    case 'compatibility_pages': {
      const slug = str(r.slug);
      if (slug) out.push(`/compatibility/${slug}`, `/hi/compatibility/${slug}`);
      break;
    }
    case 'festival_content': {
      // lang 'en': page_slug = pitru-paksha-2026  → /events/… + /<city>/events/…
      // lang 'hi': page_slug = pitru-paksha-kab-hai → /hi/… + /hi/<city>/…
      const lang = str(r.lang);
      const slug = str(r.page_slug);
      const alt = str(r.alt_lang_slug);
      const en = lang === 'hi' ? alt : slug;
      const hi = lang === 'hi' ? slug : alt;
      if (en) {
        out.push(`/events/${en}`);
        for (const c of CITY_SLUGS) out.push(`/${c}/events/${en}`);
      }
      if (hi) {
        out.push(`/hi/${hi}`);
        for (const c of CITY_SLUGS) out.push(`/hi/${c}/${hi}`);
      }
      break;
    }
    case 'festivals_master': {
      const slug = str(r.festival_slug);
      if (!slug) break;
      out.push(`/events/${slug}`);
      for (const c of CITY_SLUGS) out.push(`/${c}/events/${slug}`);
      // The Hindi slug lives in festival_content, not here.
      try {
        const { data } = await anon()
          .from('festival_content')
          .select('page_slug')
          .eq('base_slug', baseSlugOf(slug))
          .eq('lang', 'hi')
          .limit(1);
        const hi = str((data?.[0] as { page_slug?: string } | undefined)?.page_slug);
        if (hi) {
          out.push(`/hi/${hi}`);
          for (const c of CITY_SLUGS) out.push(`/hi/${c}/${hi}`);
        }
      } catch {
        /* EN + city copies are still revalidated */
      }
      break;
    }
    case 'dream_symbols': {
      const key = str(r.symbol_key);
      const cat = str(r.category);
      if (key) out.push(`/swapna/${key}`);
      if (cat) out.push(`/swapna/category/${cat}`);
      out.push('/swapna');
      break;
    }
    case 'domain_pages': {
      const slug = str(r.slug);
      if (slug) out.push(`/${slug}`);
      break;
    }
    default:
      break;
  }
  return out;
}

function cleanPath(p: unknown): string | null {
  if (typeof p !== 'string') return null;
  let s = p.trim();
  if (s.startsWith(SITE_URL)) s = s.slice(SITE_URL.length);
  if (!s.startsWith('/') || s.includes('..') || s.includes('[')) return null; // concrete paths only
  s = s.split('#')[0].split('?')[0];
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);
  return s || '/';
}

async function pingIndexNow(paths: string[]): Promise<{ sent: number; status: number | string }> {
  if (!INDEXNOW_KEY) return { sent: 0, status: 'skipped: INDEXNOW_KEY not set' };
  const urlList = paths.filter((p) => p !== '/sitemap.xml').map((p) => `${SITE_URL}${p === '/' ? '' : p}`);
  if (urlList.length === 0) return { sent: 0, status: 'nothing to send' };
  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      cache: 'no-store',
    });
    // 200 / 202 = accepted. 429 = too many, 422 = URL not on host.
    return { sent: urlList.length, status: res.status };
  } catch (e) {
    return { sent: 0, status: `error: ${(e as Error).message}` };
  }
}

export async function POST(req: NextRequest) {
  // ── auth ──
  const auth = req.headers.get('authorization') || '';
  const okSecret =
    (REVALIDATE_SECRET && auth === `Bearer ${REVALIDATE_SECRET}`) ||
    (CRON_SECRET && auth === `Bearer ${CRON_SECRET}`);
  if (!okSecret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: WebhookBody & ManualBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'body must be JSON' }, { status: 400 });
  }

  const paths = new Set<string>();
  let sendIndexNow = body.indexnow !== false;
  let source = 'manual';
  const table = str(body.table);

  if (table) {
    // ── A) Supabase database webhook ──
    source = `webhook:${table}:${body.type ?? '?'}`;
    for (const p of await pathsForRow(table, body.record)) paths.add(p);
    // slug renamed or row deleted → clear the old URL too
    for (const p of await pathsForRow(table, body.old_record)) paths.add(p);
    if (body.type === 'DELETE' || !isLive(table, body.record)) sendIndexNow = false;
    if (table === 'seo_pillar_pages') {
      try { revalidateTag('seo-pages'); } catch { /* path revalidation still runs */ }
    }
  } else if (Array.isArray(body.paths)) {
    // ── B) manual list ──
    for (const p of body.paths) {
      const c = cleanPath(p);
      if (c) paths.add(c);
    }
  } else {
    return NextResponse.json(
      { ok: false, error: 'send a Supabase webhook payload or { "paths": [...] }' },
      { status: 400 }
    );
  }

  if (paths.size === 0) {
    return NextResponse.json({ ok: true, source, revalidated: [], note: 'no paths for this row' });
  }
  paths.add('/sitemap.xml'); // so the new <lastmod> shows at once

  const list = Array.from(paths).slice(0, MAX_PATHS);
  const failed: string[] = [];
  for (const p of list) {
    try {
      revalidatePath(p);
    } catch {
      failed.push(p);
    }
  }

  const indexnow = sendIndexNow
    ? await pingIndexNow(list.filter((p) => !failed.includes(p)))
    : { sent: 0, status: 'skipped (unpublished, deleted or indexnow:false)' };

  console.log(
    `[revalidate] ${source} → ${list.length - failed.length}/${list.length} paths, indexnow ${indexnow.status}`
  );

  return NextResponse.json({
    ok: failed.length === 0,
    source,
    revalidated: list.filter((p) => !failed.includes(p)),
    failed,
    truncated: paths.size > MAX_PATHS,
    indexnow,
  });
}
