/**
 * ============================================================================
 * FILE   : app/api/catalog/route.ts
 * VERSION: v1.0
 * DATE   : 18 September 2026
 * ============================================================================
 *
 * WHAT THIS DOES
 *   Reads the repo's own folders at BUILD TIME and returns every Trikaal Vaani
 *   product as JSON, so the picker never needs a hand-written list.
 *
 *   Add app/calculators/free-new-thing/  →  next deploy  →  it is in the picker.
 *   No file to edit. That is the whole point of this route.
 *
 * WHY force-static MATTERS
 *   `export const dynamic = 'force-static'` makes Next run this once during
 *   `next build`, when the source folders are on disk, and then serve the
 *   result as a plain static JSON file. At runtime nothing touches the disk, so
 *   there is no per-request cost and no serverless filesystem problem.
 *
 * WHY A BLOCKLIST AND NOT AN ALLOWLIST
 *   An allowlist would mean naming every product — the same manual list this
 *   route exists to kill. So instead the KNOWN NON-PRODUCT folders are excluded
 *   and everything else counts as a product. A new product folder is therefore
 *   included automatically; only a new NON-product folder would ever need a
 *   line added to SKIP_TOP_LEVEL below.
 *
 * WHERE NAMES COME FROM
 *   Each page's own `title: { absolute: '...' }` metadata, cut at the first
 *   em-dash or pipe. So the picker calls every product exactly what Google
 *   calls it. If a page has no title, the slug is prettified as a fallback and
 *   the product still appears.
 *
 * HOW TO CHECK IT WORKED
 *   After deploy, open https://trikalvaani.com/api/catalog — it should return a
 *   JSON list with `count` around 48 and every calculator present.
 *
 * FAILURE BEHAVIOUR
 *   If the scan throws, it returns an empty list plus an `error` field instead
 *   of breaking the build. The picker then still shows its categories and the
 *   WhatsApp option, so the widget degrades rather than dies.
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  classifyBySlug,
  deriveKeywords,
  OVERRIDES,
  type CatalogProduct,
} from '@/lib/product-catalog';

export const dynamic = 'force-static';

/**
 * Top-level app/ folders that are NOT products.
 * Everything else under app/ is treated as a product page.
 */
const SKIP_TOP_LEVEL = new Set([
  'api', 'blog', 'learn', 'events', 'compatibility', 'data', 'hi',
  'contact', 'privacy', 'terms', 'refund', 'founder', 'pricing',
  'voice-pricing', 'report', 'result', 'upgrade', 'my-cosmic-records',
  'astro', 'astrologer-delhi', 'astrologer-noida', 'astrologer-gurgaon',
  'astrologer-ghaziabad', 'milan', 'karmic', 'services', 'calculators',
]);

/** Sub-folders of app/services/ that are not sellable readings. */
const SKIP_SERVICES = new Set(['ephemeris']);

function readTitle(dir: string): string | null {
  for (const fn of ['layout.tsx', 'page.tsx']) {
    const f = path.join(dir, fn);
    if (!fs.existsSync(f)) continue;
    try {
      const src = fs.readFileSync(f, 'utf8');
      const m = src.match(/absolute:\s*['"]([^'"]+)['"]/);
      if (m) return m[1];
    } catch {
      /* unreadable file — fall through to the next one */
    }
  }
  return null;
}

/** "Sade Sati Calculator — Free ... | Trikaal Vaani"  ->  "Sade Sati Calculator" */
function cleanTitle(raw: string): string {
  return raw.split('—')[0].split('|')[0].split('?')[0].trim();
}

/** "free-sade-sati-calculator" -> "Sade Sati Calculator" */
function prettifySlug(slug: string): string {
  return slug
    .replace(/^free-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function isPageFolder(dir: string): boolean {
  return (
    fs.existsSync(path.join(dir, 'page.tsx')) ||
    fs.existsSync(path.join(dir, 'page.ts'))
  );
}

function buildProduct(href: string, slug: string, dir: string): CatalogProduct {
  const raw  = readTitle(dir);
  const auto = raw ? cleanTitle(raw) : prettifySlug(slug);

  const ov = OVERRIDES[href] ?? {};
  const name = ov.name ?? auto;

  return {
    href,
    name,
    category: ov.category ?? classifyBySlug(slug),
    keywords: [deriveKeywords(slug, name), ov.extraKeywords ?? '']
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim(),
  };
}

function scan(): CatalogProduct[] {
  const appDir = path.join(process.cwd(), 'app');
  const found: CatalogProduct[] = [];

  // 1. every calculator — app/calculators/*
  const calcDir = path.join(appDir, 'calculators');
  if (fs.existsSync(calcDir)) {
    for (const slug of fs.readdirSync(calcDir)) {
      const dir = path.join(calcDir, slug);
      if (!fs.statSync(dir).isDirectory() || !isPageFolder(dir)) continue;
      found.push(buildProduct(`/calculators/${slug}`, slug, dir));
    }
  }

  // 2. every service reading — app/services/*
  const svcDir = path.join(appDir, 'services');
  if (fs.existsSync(svcDir)) {
    for (const slug of fs.readdirSync(svcDir)) {
      if (SKIP_SERVICES.has(slug)) continue;
      const dir = path.join(svcDir, slug);
      if (!fs.statSync(dir).isDirectory() || !isPageFolder(dir)) continue;
      found.push(buildProduct(`/services/${slug}`, slug, dir));
    }
  }

  // 3. top-level product pages — everything under app/ that is not blocklisted
  for (const slug of fs.readdirSync(appDir)) {
    if (SKIP_TOP_LEVEL.has(slug) || slug.startsWith('_') || slug.startsWith('[')) continue;
    const dir = path.join(appDir, slug);
    if (!fs.statSync(dir).isDirectory() || !isPageFolder(dir)) continue;
    found.push(buildProduct(`/${slug}`, slug, dir));
  }

  // de-dupe by href, keep catalog order
  const seen = new Set<string>();
  return found.filter((p) => (seen.has(p.href) ? false : (seen.add(p.href), true)));
}

export async function GET() {
  try {
    const products = scan();
    return NextResponse.json({
      version: '1.0',
      generatedAt: new Date().toISOString(),
      count: products.length,
      products,
    });
  } catch (err) {
    console.error('[api/catalog] scan failed:', err);
    return NextResponse.json({
      version: '1.0',
      generatedAt: new Date().toISOString(),
      count: 0,
      products: [],
      error: 'scan-failed',
    });
  }
}
