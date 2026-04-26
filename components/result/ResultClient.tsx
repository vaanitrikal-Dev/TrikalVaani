/**
 * ============================================================
 * TRIKAL VAANI — Result Client Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/result/ResultClient.tsx
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   Client component — reads URL params, fetches prediction
 *   from Supabase, renders PredictionDisplay.
 *
 *   URL params accepted:
 *     ?predictionId=xxx         — fetch by ID (preferred)
 *     ?sessionId=xxx&domainId=xxx — fallback fetch
 *
 *   Also accepts inline data params (from BirthForm redirect):
 *     ?data=base64encodedJSON   — full prediction inline
 * ============================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import PredictionDisplay from '@/components/result/PredictionDisplay';
import {
  getPredictionById,
  getPredictionBySession,
} from '@/lib/supabase';
import type { PredictionRecord } from '@/lib/supabase';

const GOLD      = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function ResultClient() {
  const params = useSearchParams();

  const predictionId = params.get('predictionId') ?? '';
  const sessionId    = params.get('sessionId')    ?? '';
  const domainId     = params.get('domainId')     ?? '';
  const inlineData   = params.get('data')         ?? '';

  const [record, setRecord]   = useState<PredictionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Option 1 — inline data (fastest, no Supabase call)
        if (inlineData) {
          const decoded = JSON.parse(atob(inlineData));
          setRecord(decoded);
          setLoading(false);
          return;
        }

        // Option 2 — fetch by predictionId
        if (predictionId) {
          const data = await getPredictionById(predictionId);
          if (data) { setRecord(data); setLoading(false); return; }
        }

        // Option 3 — fetch by sessionId + domainId
        if (sessionId && domainId) {
          const data = await getPredictionBySession(sessionId, domainId);
          if (data) { setRecord(data); setLoading(false); return; }
        }

        setError('Prediction not found. Please submit the form again.');
      } catch (e) {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [predictionId, sessionId, domainId, inlineData]);

  if (loading) return <LoadingScreen />;
  if (error || !record) return <ErrorScreen error={error} />;

  // Extract prediction data from record
  const prediction = record.prediction as any;
  const meta       = prediction?._meta ?? {};

  // Extract grahas from raw Swiss API data stored in prediction
  const grahas = prediction?._rawChart?.grahas
    ?? prediction?._rawGrahas
    ?? [];

  const birthData = {
    name:     record.person_name ?? 'User',
    dob:      record.dob         ?? '',
    cityName: record.birth_city  ?? 'India',
    tob:      record.birth_time  ?? '12:00',
  };

  return (
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-yellow-400/70 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              New Analysis
            </Link>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600">
              {record.person_name}
              {record.birth_city && ` · ${record.birth_city}`}
              {record.dob && ` · ${new Date(record.dob).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}`}
            </span>
          </div>

          {/* Hero greeting */}
          <div
            className="text-center mb-8 py-6 px-4 rounded-2xl"
            style={{
              background: 'rgba(4,8,20,0.75)',
              border: `1px solid ${GOLD_RGBA(0.1)}`,
            }}
          >
            <p className="text-xs font-medium tracking-widest uppercase mb-2"
              style={{ color: GOLD_RGBA(0.55) }}>
              Your Cosmic Report · {record.domain_label ?? record.domain_id}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: 'Georgia, serif' }}>
              <span className="text-white">Namaste, </span>
              <span style={{ color: GOLD }}>
                {record.person_name?.split(' ')[0] ?? 'Friend'}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric',
                month: 'long', year: 'numeric',
              })}
            </p>

            {/* Domain badge */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
              <span className="text-xs font-semibold" style={{ color: GOLD }}>
                {record.domain_label ?? domainId}
              </span>
            </div>
          </div>

          {/* Main prediction display */}
          <PredictionDisplay
            prediction={prediction}
            grahas={grahas}
            birthData={birthData}
          />

          {/* New analysis CTA */}
          <div className="text-center mt-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium text-slate-500 hover:text-yellow-400/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Analyse another domain
            </Link>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

// ── Loading ────────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#080B12] flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-full border-2 animate-spin mx-auto mb-5"
          style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }}
        />
        <p className="text-sm font-medium" style={{ color: '#D4AF37' }}>
          Jini padhh rahi hai aapke grahe...
        </p>
        <p className="text-xs text-slate-600 mt-2">Swiss Ephemeris · Parashara BPHS</p>
      </div>
    </div>
  );
}

// ── Error ──────────────────────────────────────────────────────────────────────

function ErrorScreen({ error }: { error: string | null }) {
  return (
    <div className="min-h-screen bg-[#080B12] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Cosmic Disturbance</h2>
        <p className="text-sm text-slate-400 mb-6">
          {error ?? 'Unable to load your reading. Please try again.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
