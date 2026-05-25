/**
 * ============================================================
 * TRIKAL VAANI — Karmic Background Reading — Result Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/karmic/[slug]/page.tsx
 * VERSION: 1.1
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * CHANGE v1.1:
 *   Replaced static "taiyaar ho rahi hai" with KarmicResultClient —
 *   a full client component with animated waiting screen, auto-polling
 *   every 12s, progress bar, rotating mystical lines, and PDF download.
 *   Server page just loads the DB row and passes it down.
 *   All metadata/noindex unchanged from v1.0.
 * ============================================================
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import KarmicResultClient from '@/components/karmic/KarmicResultClient';

export const dynamic    = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:  'Karmic Background Reading · Trikal Vaani',
    description: 'Your private Karmic Background Reading by Trikal Vaani.',
    robots: { index: false, follow: false },
  };
}

export default async function KarmicResultPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: reading, error } = await supabase
    .from('karmic_readings')
    .select('slug, language, person_data, gemini_narrative, pdf_url')
    .eq('slug', slug)
    .single();

  if (error || !reading) notFound();

  return <KarmicResultClient initialRow={reading as any} />;
}
