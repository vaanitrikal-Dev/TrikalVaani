import { MetadataRoute } from 'next'
import { getAllPublishedSlugs } from '@/lib/seo-content'

/**
 * Generates sitemap entries for all /learn/[slug] pages.
 * Merge this into your main sitemap.ts using the spread operator.
 *
 * Usage in app/sitemap.ts:
 *   import { getSeoPagesSitemap } from './sitemap-seo'
 *   export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 *     const seoEntries = await getSeoPagesSitemap()
 *     return [
 *       { url: 'https://trikalvaani.com', ... },
 *       ...seoEntries,
 *     ]
 *   }
 */
export async function getSeoPagesSitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllPublishedSlugs()

  return slugs.map(({ slug, category }) => ({
    url: `https://trikalvaani.com/learn/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: category === 'transit' ? 'weekly' : 'monthly',
    priority: category === 'prediction' ? 0.85 : 0.75,
  }))
}

/**
 * Also export the /learn index page entry
 */
export const learnIndexEntry: MetadataRoute.Sitemap[0] = {
  url: 'https://trikalvaani.com/learn',
  lastModified: new Date().toISOString(),
  changeFrequency: 'weekly',
  priority: 0.9,
}
