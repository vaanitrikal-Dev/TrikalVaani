/**
 * ============================================================
 * TRIKAL VAANI — Result Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/result/[id]/page.tsx
 * VERSION: 1.0 — Clean URL Result Page
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import ResultClient from '@/components/result/ResultClient';
import { notFound } from 'next/navigation';

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
    .select('person_name, domain_label, lagna, nakshatra')
    .eq('id', params.id)
    .single();

  if (!data) return { title: 'Trikal Vaani Prediction' };

  return {
    title: `${data.person_name}'s ${data.domain_label} Reading — Trikal Vaani`,
    description: `Personalized Vedic astrology prediction for ${data.person_name}. Lagna: ${data.lagna}, Nakshatra: ${data.nakshatra}. Powered by Swiss Ephemeris + BPHS.`,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${data.person_name}'s Vedic Prediction — Trikal Vaani`,
      description: `AI-powered Vedic astrology reading by Rohiit Gupta, Chief Vedic Architect.`,
      url: `https://trikalvaani.com/result/${params.id}`,
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { data: prediction, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !prediction) notFound();

  return (
    <ResultClient
      predictionId={params.id}
      predictionData={prediction.prediction_json}
      meta={{
        personName:    prediction.person_name,
        domainId:      prediction.domain_id,
        domainLabel:   prediction.domain_label,
        tier:          prediction.tier,
        lagna:         prediction.lagna,
        nakshatra:     prediction.nakshatra,
        mahadasha:     prediction.mahadasha,
        antardasha:    prediction.antardasha,
        language:      prediction.language,
        confidenceLabel: prediction.confidence_label,
        primaryYoga:   prediction.primary_yoga,
        processingMs:  prediction.processing_ms,
        analysisDate:  prediction.created_at,
      }}
    />
  );
}
