/**
 * ============================================================
 * TRIKAL VAANI — Upay Report Page (₹51)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/upay/[slug]/page.tsx
 * VERSION: 1.1 (10 Oct 2026)
 *   v1.1: 'vishesh' (grahak ki apni baat) bhi select — report mein dikhti hai.
 * ============================================================
 * Rohiit ka niyam: report Janam Kundali report jaisi — website par, PDF
 * download (browser print) aur WhatsApp share. Access = slug (unlisted link,
 * /report/[slug] jaisa). noindex — paid report Google mein nahi jaati.
 * ============================================================
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { upayAdmin } from '@/lib/upay-report';
import UpayReportClient from './UpayReportClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SLUG_RE = /^upay-[a-z0-9-]{6,80}$/;

export const metadata: Metadata = {
  title: { absolute: 'Aapki Upay Report — Trikaal Vaani' },
  robots: { index: false, follow: false },
};

export default async function UpayReportPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  if (!SLUG_RE.test(slug)) notFound();
  const supa = upayAdmin();
  const { data: r } = await supa.from('upay_reports')
    .select('slug, person_name, birth, samasya, result, status, public_views, ready_at, language, vishesh')
    .eq('slug', slug).maybeSingle();
  if (!r || r.status !== 'ready' || !r.result) notFound();

  // views — fail ho to bhi page chale
  supa.from('upay_reports').update({ public_views: (r.public_views ?? 0) + 1 }).eq('slug', slug)
    .then(() => {}, () => {});

  return <UpayReportClient report={r} slug={slug} />;
}
// END — app/upay/[slug]/page.tsx v1.1
