/**
 * ============================================================
 * TRIKAL VAANI — Result Page (Server Component)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/result/[id]/page.tsx
 * VERSION: 2.0 — Correct Supabase field mapping + props to ResultClient
 * SIGNED: ROHIIT GUPTA, CEO
 * 🔒 LOCKED — DO NOT EDIT WITHOUT CEO APPROVAL
 * ============================================================
 */

import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ResultClient from '@/components/result/ResultClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('predictions')
    .select('person_name, domain_label, lagna, nakshatra, tier')
    .eq('id', params.id)
    .single();

  if (!data) return { title: 'Trikal Vaani Prediction' };

  return {
    title: `${data.person_name}'s ${data.domain_label} Reading — Trikal Vaani`,
    description: `Personalized Vedic astrology prediction. Lagna: ${data.lagna ?? '—'}, Nakshatra: ${data.nakshatra ?? '—'}. Powered by Swiss Ephemeris + BPHS.`,
    robots: { index: false, follow: false },
    openGraph: {
      title:       `${data.person_name}'s Vedic Prediction — Trikal Vaani`,
      description: `AI-powered Vedic astrology reading by Rohiit Gupta, Chief Vedic Architect.`,
      url:         `https://trikalvaani.com/result/${params.id}`,
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { data: row, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !row) notFound();

  // Full prediction JSON
  const predictionData: Record<string, any> =
    row.prediction_json ?? row.prediction ?? {};

  // Extract kundali fields — priority: Supabase columns → _meta.kundali
  const metaKundali = predictionData?._meta?.kundali ?? {};

  const lagna      = row.lagna      ?? metaKundali.lagna      ?? '—';
  const nakshatra  = row.nakshatra  ?? metaKundali.nakshatra  ?? '—';
  const mahadasha  = row.mahadasha  ?? metaKundali.mahadasha  ?? '—';
  const antardasha = row.antardasha ?? metaKundali.antardasha ?? '—';

  // Tier — read directly from DB row (this is what determines unlock/blur)
  const tier = (row.tier ?? 'free') as 'free' | 'basic' | 'standard' | 'premium';

  const confidenceLabel =
    predictionData?._meta?.synthesis?.confidence?.label ??
    predictionData?._meta?.confidenceLabel ??
    undefined;

  const primaryYoga =
    predictionData?._meta?.synthesis?.synthesis?.primary_yoga ??
    predictionData?._meta?.primaryYoga ??
    undefined;

  return (
    <ResultClient
      predictionId={params.id}
      predictionData={predictionData}
      meta={{
        personName:     row.person_name   ?? 'Friend',
        domainId:       row.domain_id     ?? '',
        domainLabel:    row.domain_label  ?? 'Vedic Reading',
        tier,
        lagna,
        nakshatra,
        mahadasha,
        antardasha,
        language:       row.language      ?? 'hinglish',
        confidenceLabel,
        primaryYoga,
        processingMs:   row.processing_ms ?? predictionData?._meta?.processingMs,
        analysisDate:   row.created_at    ?? undefined,
      }}
    />
  );
}
