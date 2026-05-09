/**
 * ============================================================
 * TRIKAL VAANI — Dynamic Sitemap
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/sitemap.ts
 * VERSION: 2.1 — Added /upcoming-events + /panchang
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://trikalvaani.com'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                          lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/founder`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/services`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/blog`,                lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/contact`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy-policy`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/terms`,               lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/refund-policy`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/upcoming-events`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/panchang`,            lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  ]

  const domainPages: MetadataRoute.Sitemap = [
    '/career', '/wealth', '/health', '/relationships',
    '/family', '/education', '/home', '/legal',
    '/travel', '/spirituality', '/wellbeing',
  ].map(path => ({
    url:             `${BASE_URL}${path}`,
    lastModified:    new Date(),
    changeFrequency: 'weekly' as const,
    priority:        0.9,
  }))

  const calculatorPages: MetadataRoute.Sitemap = [
    '/kundali-calculator', '/dasha-calculator', '/nakshatra-calculator',
    '/rashi-calculator', '/lagna-calculator', '/sade-sati-calculator',
    '/manglik-dosh-calculator', '/kundali-matching',
  ].map(path => ({
    url:             `${BASE_URL}${path}`,
    lastModified:    new Date(),
    changeFrequency: 'monthly' as const,
    priority:        0.8,
  }))

  const locationPages: MetadataRoute.Sitemap = [
    '/astrologer-delhi', '/astrologer-noida', '/astrologer-gurugram',
    '/astrologer-ghaziabad', '/astrologer-faridabad',
  ].map(path => ({
    url:             `${BASE_URL}${path}`,
    lastModified:    new Date(),
    changeFrequency: 'weekly' as const,
    priority:        0.85,
  }))

  let reportPages: MetadataRoute.Sitemap = []
  try {
    const { data } = await supabase()
      .from('predictions')
      .select('public_slug, created_at')
      .eq('is_public', true)
      .not('public_slug', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000)

    if (data) {
      reportPages = data.map(row => ({
        url:             `${BASE_URL}/report/${row.public_slug}`,
        lastModified:    new Date(row.created_at),
        changeFrequency: 'yearly' as const,
        priority:        0.7,
      }))
    }
  } catch (err) {
    console.warn('[TV-Sitemap] Could not fetch report slugs:', err)
  }

  console.log(`[TV-Sitemap] Generated: ${staticPages.length} static + ${domainPages.length} domain + ${calculatorPages.length} calculators + ${locationPages.length} location + ${reportPages.length} reports`)

  return [
    ...staticPages,
    ...domainPages,
    ...calculatorPages,
    ...locationPages,
    ...reportPages,
  ]
}
