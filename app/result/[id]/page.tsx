/**
 * ============================================================
 * TRIKAL VAANI — Result Page (Server Component)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/result/[id]/page.tsx
 * VERSION: 2.0 — Correct Supabase field mapping + props to ResultClient
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * FIXES in v2.0:
 *   - Fetches prediction_json column correctly
 *   - Extracts lagna, nakshatra, mahadasha, antardasha from
 *     BOTH Supabase columns AND prediction_json._meta.kundali
 *   - Passes complete meta + predictionData to ResultClient
 *   - Handles missing columns gracefully with fallbacks
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

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('predictions')
    .select('person_name, domain_label, lagna, nakshatra')
    .eq('id', params.id)
    .single();

  if (!data) return { title: 'Trikal Vaani Prediction' };

  // Fallback: lagna/nakshatra may be in prediction_json._meta.kundali
  const lagna     = data.lagna     ?? '—';
  const nakshatra = data.nakshatra ?? '—';

  return {
    title: `${data.person_name}'s ${data.domain_label} Reading — Trikal Vaani`,
    description: `Personalized Vedic astrology prediction for ${data.person_name}. Lagna: ${lagna}, Nakshatra: ${nakshatra}. Powered by Swiss Ephemeris + BPHS.`,
    robots: { index: false, follow: false },
    openGraph: {
      title:       `${data.person_name}'s Vedic Prediction — Trikal Vaani`,
      description: `AI-powered Vedic astrology reading by Rohiit Gupta, Chief Vedic Architect.`,
      url:         `https://trikalvaani.com/result/${params.id}`,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ResultPage({ params }: Props) {
  const { data: row, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !row) notFound();

  // prediction_json is the full Gemini output + _meta block
  // Column name may be 'prediction_json' or 'prediction' depending on your schema
  const predictionData: Record<string, any> =
    row.prediction_json ?? row.prediction ?? {};

  // ── Extract kundali fields ─────────────────────────────────────────────────
  // Priority 1: Dedicated Supabase columns (lagna, nakshatra, mahadasha, antardasha)
  // Priority 2: predictionData._meta.kundali (set by route.ts)
  const metaKundali = predictionData?._meta?.kundali ?? {};

  const lagna      = row.lagna      ?? metaKundali.lagna      ?? '—';
  const nakshatra  = row.nakshatra  ?? metaKundali.nakshatra  ?? '—';
  // BUG 4 FIX: mahadasha is a single string (lord name), never joined array
  const mahadasha  = row.mahadasha  ?? metaKundali.mahadasha  ?? '—';
  const antardasha = row.antardasha ?? metaKundali.antardasha ?? '—';

  // ── Confidence + Yoga ──────────────────────────────────────────────────────
  const confidenceLabel =
    row.confidence_label ??
    predictionData?._meta?.confidenceLabel ??
    predictionData?.confidence_label ??
    undefined;

  const primaryYoga =
    row.primary_yoga ??
    predictionData?._meta?.primaryYoga ??
    predictionData?.primary_yoga ??
    undefined;

  return (
    <ResultClient
      predictionId={params.id}
      predictionData={predictionData}
      meta={{
        personName:     row.person_name   ?? 'Friend',
        domainId:       row.domain_id     ?? '',
        domainLabel:    row.domain_label  ?? 'Vedic Reading',
        tier:           row.tier          ?? 'free',
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
