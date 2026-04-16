'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import EnergyMeter from '@/components/result/EnergyMeter';
import TrikalInsight from '@/components/result/TrikalInsight';
import ShareButtons from '@/components/result/ShareButtons';
import PillarScoreGrid from '@/components/result/PillarScoreGrid';
import LifeTimeline from '@/components/result/LifeTimeline';
import PredictiveModules from '@/components/result/PredictiveModules';
import FutureTimeline from '@/components/result/FutureTimeline';
import DardEngine from '@/components/result/DardEngine';
import CompatibilityMeter from '@/components/result/CompatibilityMeter';
import type { DashaPeriod, LifeTimelineEvent } from '@/lib/vedic-astro';
import type { PredictiveTabsData } from '@/components/result/PredictiveModules';
import type { MonthForecast } from '@/components/result/FutureTimeline';
import type { LifeSegment, SegmentAnalysis } from '@/components/result/DardEngine';
import type { PartnerData, CompatibilityResult } from '@/components/result/CompatibilityMeter';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function callEdge(body: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/trikal-predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Edge function error');
  return res.json();
}

function ResultContent() {
  const params = useSearchParams();

  const name = params.get('name') || 'Friend';
  const score = parseInt(params.get('score') || '72', 10);
  const rashi = params.get('rashi') || 'Mesha';
  const luckyColor = params.get('color') || 'Golden';
  const luckyNumber = parseInt(params.get('number') || '7', 10);
  const insight = params.get('insight') || 'The stars illuminate your path today with clarity and purpose.';
  const remedy = params.get('remedy') || 'Chant the Gayatri Mantra 21 times at sunrise to align with the cosmic rhythm.';
  const practicalTip = params.get('tip') || 'Avoid making major decisions under time pressure today.';
  const dob = params.get('dob') || '';
  const city = params.get('city') || '';
  const generation = (params.get('gen') || 'millennial') as 'genz' | 'millennial' | 'genx';
  const varshphalFocus = params.get('varshphal') || 'Jupiter rules your Varshphal year, signaling exceptional expansion in wisdom, family, wealth, and spiritual depth.';
  const ashtakvargaWealth = parseInt(params.get('avwealth') || '24', 10);

  const pillarScores = {
    wealth: parseInt(params.get('wealth') || '72', 10),
    career: parseInt(params.get('career') || '68', 10),
    love: parseInt(params.get('love') || '75', 10),
    health: parseInt(params.get('health') || '70', 10),
    students: parseInt(params.get('students') || '73', 10),
    peace: parseInt(params.get('peace') || '69', 10),
  };

  let dashaPeriods: DashaPeriod[] = [];
  let lifeTimeline: LifeTimelineEvent[] = [];

  try {
    const dashaRaw = params.get('dasha');
    if (dashaRaw) dashaPeriods = JSON.parse(dashaRaw);
    const timelineRaw = params.get('timeline');
    if (timelineRaw) lifeTimeline = JSON.parse(timelineRaw);
  } catch {
    /* fallback */
  }

  const [aiData, setAiData] = useState<PredictiveTabsData | null>(null);
  const [monthlyTimeline, setMonthlyTimeline] = useState<MonthForecast[]>([]);
  const [aiLoading, setAiLoading] = useState(true);

  const [segmentAnalysis, setSegmentAnalysis] = useState<SegmentAnalysis | null>(null);
  const [segmentLoading, setSegmentLoading] = useState(false);
  const [latestWhatsapp, setLatestWhatsapp] = useState<string | undefined>(undefined);

  const [compatResult, setCompatResult] = useState<CompatibilityResult | null>(null);
  const [compatLoading, setCompatLoading] = useState(false);

  const basePayload = {
    name,
    dob,
    city,
    generation,
    rashi,
    dashaPeriods,
    pillarScores,
    ashtakvargaWealth,
    varshphalFocus,
  };

  useEffect(() => {
    if (!dob || !SUPABASE_URL) {
      setAiLoading(false);
      return;
    }

    callEdge({ ...basePayload, mode: 'predict' })
      .then((json) => {
        const { career, love, wealth, guruMessage, monthlyTimeline: mt } = json;
        if (career && love && wealth) {
          setAiData({ career, love, wealth, guruMessage: guruMessage || '' });
        }
        if (Array.isArray(mt) && mt.length > 0) {
          setMonthlyTimeline(mt);
        }
      })
      .catch(() => {})
      .finally(() => setAiLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dob]);

  const handleSegmentAnalyze = useCallback(async (segment: LifeSegment) => {
    setSegmentLoading(true);
    setSegmentAnalysis(null);
    try {
      const json = await callEdge({
        ...basePayload,
        mode: 'segment',
        segmentId: segment.id,
        segmentLabel: segment.label,
      });
      setSegmentAnalysis(json as SegmentAnalysis);
      if (json.whatsappText) setLatestWhatsapp(json.whatsappText);
    } catch {
      /* fallback handled in component */
    } finally {
      setSegmentLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dob]);

  const handleCompatCheck = useCallback(async (partner: PartnerData) => {
    setCompatLoading(true);
    setCompatResult(null);
    try {
      const json = await callEdge({
        ...basePayload,
        mode: 'compatibility',
        partner,
      });
      setCompatResult(json as CompatibilityResult);
    } catch {
      /* silent */
    } finally {
      setCompatLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dob]);

  return (
    <div className="min-h-screen bg-[#030712]">
      <SiteNav />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          <div className="mb-8 flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-yellow-400/70 transition-colors duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              New Analysis
            </Link>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600">
              Results for <span className="text-yellow-400/60">{name}</span>
              {city && ` · ${city}`}
              {dob && ` · Born ${new Date(dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </span>
          </div>

          <div
            className="text-center mb-10 py-6 px-4 rounded-2xl"
            style={{ background: 'rgba(10,15,30,0.6)', border: '1px solid rgba(250,204,21,0.1)' }}
          >
            <p className="text-xs font-medium tracking-widest uppercase text-yellow-400/60 mb-2">
              Your Cosmic Report
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">
              <span className="text-white">Namaste, </span>
              <span className="text-gradient-gold">{name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Your Trikal Analysis for{' '}
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div
              className="rounded-2xl p-8 flex flex-col items-center"
              style={{
                background: 'rgba(10,15,30,0.8)',
                border: '1px solid rgba(250,204,21,0.12)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
              }}
            >
              <div className="mb-4 text-center">
                <h2 className="text-sm font-semibold text-white mb-1">Daily Energy Score</h2>
                <p className="text-xs text-slate-500">Calculated from your birth data + today&apos;s Gochar</p>
              </div>
              <EnergyMeter score={score} name={name} />
            </div>

            <div className="space-y-5">
              <TrikalInsight
                insight={insight}
                remedy={remedy}
                practicalTip={practicalTip}
                rashi={rashi}
                luckyColor={luckyColor}
                luckyNumber={luckyNumber}
                name={name}
              />
            </div>
          </div>

          <div className="mb-6">
            <PillarScoreGrid scores={pillarScores} />
          </div>

          <div className="mb-6">
            <DardEngine
              generation={generation}
              name={name}
              onAnalyze={handleSegmentAnalyze}
              analysis={segmentAnalysis}
              loading={segmentLoading}
            />
          </div>

          <div className="mb-6">
            <PredictiveModules
              data={aiData}
              loading={aiLoading}
              varshphalFocus={varshphalFocus}
              ashtakvargaWealth={ashtakvargaWealth}
              name={name}
            />
          </div>

          {monthlyTimeline.length > 0 && (
            <div className="mb-6">
              <FutureTimeline forecasts={monthlyTimeline} name={name} />
            </div>
          )}

          <div className="mb-6">
            <CompatibilityMeter
              userName={name}
              userDob={dob}
              onCheck={handleCompatCheck}
              result={compatResult}
              loading={compatLoading}
            />
          </div>

          {lifeTimeline.length > 0 && (
            <div className="mb-6">
              <LifeTimeline
                events={lifeTimeline}
                dashaPeriods={dashaPeriods}
                name={name}
              />
            </div>
          )}

          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: 'rgba(10,15,30,0.8)',
              border: '1px solid rgba(34,197,94,0.15)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="mb-5">
              <h3 className="text-base font-semibold text-white mb-1">Share & Connect</h3>
              <p className="text-xs text-slate-500">
                {latestWhatsapp
                  ? 'Share your Guru reading — already customized from your Dard Engine result.'
                  : 'Share your energy score and join our cosmic community for daily updates.'}
              </p>
            </div>
            <ShareButtons score={score} name={name} segmentWhatsapp={latestWhatsapp} />
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium text-slate-500 hover:text-yellow-400/70 transition-colors duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Analyse another person
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030712] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Reading the stars...</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
