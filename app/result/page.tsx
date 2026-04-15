'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import EnergyMeter from '@/components/result/EnergyMeter';
import TrikalInsight from '@/components/result/TrikalInsight';
import ShareButtons from '@/components/result/ShareButtons';
import PillarScoreGrid from '@/components/result/PillarScoreGrid';

function ResultContent() {
  const params = useSearchParams();

  const name = params.get('name') || 'Friend';
  const score = parseInt(params.get('score') || '72', 10);
  const rashi = params.get('rashi') || 'Mesha';
  const luckyColor = params.get('color') || 'Golden';
  const luckyNumber = parseInt(params.get('number') || '7', 10);
  const insight = params.get('insight') || 'The stars illuminate your path today with clarity and purpose.';
  const dob = params.get('dob') || '';
  const city = params.get('city') || '';

  const pillarScores = {
    wealth: parseInt(params.get('wealth') || '72', 10),
    career: parseInt(params.get('career') || '68', 10),
    love: parseInt(params.get('love') || '75', 10),
    health: parseInt(params.get('health') || '70', 10),
    students: parseInt(params.get('students') || '73', 10),
    peace: parseInt(params.get('peace') || '69', 10),
  };

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
            style={{
              background: 'rgba(10,15,30,0.6)',
              border: '1px solid rgba(250,204,21,0.1)',
            }}
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

          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: 'rgba(10,15,30,0.8)',
              border: '1px solid rgba(34,197,94,0.15)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="mb-6">
              <h3 className="text-base font-semibold text-white mb-1">Share & Connect</h3>
              <p className="text-xs text-slate-500">
                Share your energy score with friends and join our cosmic community for daily updates.
              </p>
            </div>
            <ShareButtons score={score} name={name} />
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
            <div
              className="w-12 h-12 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin mx-auto mb-4"
            />
            <p className="text-sm text-slate-500">Reading the stars...</p>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
