/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 5.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: RESULT PAGE — KUNDALI + PERSONALIZED PREDICTION + ALL PHASES
 * v5.0 CHANGES:
 *   - PratayantarDasha component wired into Phase 2
 *   - pratyantar URL params extracted and passed to KundaliPhase
 *   - 4-level dasha chain now displayed below VimshottariDashaTable
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, CalendarDays, LayoutGrid, Brain } from 'lucide-react';
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
import PricingLadder, { type PricingSelection } from '@/components/result/PricingLadder';
import UnlockButton from '@/components/result/UnlockButton';
import LagnaChart, { derivePlanetsFromDob } from '@/components/result/LagnaChart';
import VimshottariDashaTable from '@/components/result/VimshottariDashaTable';
import KundaliDisplay from '@/components/result/KundaliDisplay';
import AutoPrediction from '@/components/result/AutoPrediction';
import PersonalizedPrediction from '@/components/result/PersonalizedPrediction'; // ✅ NEW
import PratayantarDasha from '@/components/result/PratayantarDasha'; // ✅ v5.0
import type { DashaPeriod, LifeTimelineEvent } from '@/lib/vedic-astro';
import type { PredictiveTabsData } from '@/components/result/PredictiveModules';
import type { MonthForecast } from '@/components/result/FutureTimeline';
import type { LifeSegment, SegmentAnalysis } from '@/components/result/DardEngine';
import type { PartnerData, CompatibilityResult } from '@/components/result/CompatibilityMeter';
import type { PartnerFormData } from '@/components/result/DualPartnerForm';

const GOLD      = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function callEdge(body: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/trikal-predict`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Edge function error');
  return res.json();
}

const PHASE_LABELS = [
  { icon: CalendarDays, label: '3-Month Summary',   sub: 'Immediate cosmic window' },
  { icon: LayoutGrid,   label: 'Kundali & Dasha',   sub: 'Chart + planetary periods' },
  { icon: Brain,        label: 'Deep Guru Analysis', sub: 'Dard Engine + predictions' },
];

// ─── PHASE HEADER BUTTON ──────────────────────────────────────────────────────
function PhaseHeader({
  phase, activePhase, onClick,
}: { phase: number; activePhase: number; onClick: () => void }) {
  const { icon: Icon, label, sub } = PHASE_LABELS[phase]!;
  const isActive = phase === activePhase;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all duration-300 text-center flex-1"
      style={{
        background: isActive ? GOLD_RGBA(0.1) : 'rgba(255,255,255,0.02)',
        border:     `1px solid ${isActive ? GOLD_RGBA(0.35) : GOLD_RGBA(0.08)}`,
        boxShadow:  isActive ? `0 0 18px ${GOLD_RGBA(0.15)}` : 'none',
      }}
    >
      <Icon className="w-4 h-4" style={{ color: isActive ? GOLD : 'rgba(148,163,184,0.5)' }} />
      <span className="text-xs font-semibold" style={{ color: isActive ? GOLD : 'rgba(148,163,184,0.6)' }}>
        {label}
      </span>
      <span className="text-xs hidden sm:block" style={{ color: 'rgba(100,116,139,0.7)' }}>
        {sub}
      </span>
    </button>
  );
}

// ─── THREE MONTH SUMMARY PHASE ────────────────────────────────────────────────
function ThreeMonthSummary({
  name, dob, city, score, insight, remedy, practicalTip, rashi,
  luckyColor, luckyNumber, pillarScores, aiData, aiLoading,
  varshphalFocus, ashtakvargaWealth, monthlyTimeline,
  unlockedTiers, onUnlock,
  lagna, lagnaLord, nakshatra, nakshatraLord, mahadasha, antardasha,
  dashaBalance, choghadiya, choghadiyaType, tithi, vara, yoga,
  rahuStart, rahuEnd, abhijeetStart, abhijeetEnd, planets,
  autoSegment, autoSegmentLabel,
  // ✅ NEW props
  lang,
  partnerName, partnerDob, partnerLagna,
  partnerMahadasha, partnerNakshatra, partnerPlanets,
  isPredictionPaid, onPredictionUnlock,
}: {
  name: string; dob: string; city: string;
  score: number; insight: string; remedy: string; practicalTip: string;
  rashi: string; luckyColor: string; luckyNumber: number;
  pillarScores: Record<string, number>;
  aiData: PredictiveTabsData | null; aiLoading: boolean;
  varshphalFocus: string; ashtakvargaWealth: number;
  monthlyTimeline: MonthForecast[];
  unlockedTiers: Set<string>; onUnlock: (id: string) => void;
  lagna: string; lagnaLord: string; nakshatra: string; nakshatraLord: string;
  mahadasha: string; antardasha: string; dashaBalance: string;
  choghadiya: string; choghadiyaType: string; tithi: string; vara: string; yoga: string;
  rahuStart: string; rahuEnd: string; abhijeetStart: string; abhijeetEnd: string;
  planets: Array<{
    name: string; rashi: string; house: number; strength: number;
    isRetrograde: boolean; nakshatra: string; degree: number;
  }>;
  autoSegment: string;
  autoSegmentLabel: string;
  // NEW
  lang: 'hindi' | 'hinglish' | 'english';
  partnerName?: string;
  partnerDob?: string;
  partnerLagna?: string;
  partnerMahadasha?: string;
  partnerNakshatra?: string;
  partnerPlanets?: Array<{
    name: string; rashi: string; house: number; strength: number;
    isRetrograde: boolean; nakshatra: string; degree: number;
  }>;
  isPredictionPaid: boolean;
  onPredictionUnlock: () => void;
}) {
  return (
    <div className="space-y-6">

      {/* ── 1. KUNDALI DISPLAY ── */}
      {lagna && planets.length > 0 && (
        <KundaliDisplay
          name={name} dob={dob} city={city}
          lagna={lagna} lagnaLord={lagnaLord}
          nakshatra={nakshatra} nakshatraLord={nakshatraLord}
          mahadasha={mahadasha} antardasha={antardasha}
          dashaBalance={dashaBalance}
          choghadiya={choghadiya} choghadiyaType={choghadiyaType}
          tithi={tithi} vara={vara} yoga={yoga}
          rahuStart={rahuStart} rahuEnd={rahuEnd}
          abhijeetStart={abhijeetStart} abhijeetEnd={abhijeetEnd}
          planets={planets}
        />
      )}

      {/* ── 2. PERSONALIZED PREDICTION — 3-Layer Trikal Intelligence Engine ── */}
      {/* ✅ YELLOW ARROW LOCATION — replaces old AutoPrediction */}
      {lagna && (
        <PersonalizedPrediction
          name={name}
          lagna={lagna}
          mahadasha={mahadasha}
          antardasha={antardasha}
          nakshatra={nakshatra}
          planets={planets}
          dob={dob}
          autoSegment={autoSegment || 'default'}
          autoSegmentLabel={autoSegmentLabel}
          lang={lang}
          // Dual chart props
          partnerName={partnerName}
          partnerDob={partnerDob}
          partnerLagna={partnerLagna}
          partnerMahadasha={partnerMahadasha}
          partnerNakshatra={partnerNakshatra}
          partnerPlanets={partnerPlanets}
          // Unlock — demo mode (Option C): free for now, Razorpay in Phase 3
          isPaid={isPredictionPaid}
          onUnlockClick={onPredictionUnlock}
        />
      )}

      {/* ── 3. 3-MONTH SUMMARY CARD ── */}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background:     'rgba(4,8,20,0.85)',
          border:         `1px solid ${GOLD_RGBA(0.12)}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.45) }}>
          Your Next 3 Months at a Glance
        </p>
        <p className="font-serif text-xl sm:text-2xl font-bold leading-snug mb-4" style={{ color: GOLD }}>
          {varshphalFocus}
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {(['Month 1', 'Month 2', 'Month 3'] as const).map((m, i) => {
            const intensity = ['High Energy', 'Karmic Flow', 'Expansion'][i];
            const colors    = [GOLD, '#60A5FA', '#4ADE80'];
            return (
              <div
                key={m}
                className="rounded-xl p-3 text-center"
                style={{ background: `${colors[i]}0a`, border: `1px solid ${colors[i]}20` }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: colors[i] }}>{m}</p>
                <p className="text-xs text-slate-400">{intensity}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. ENERGY METER + INSIGHT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-6 sm:p-8 flex flex-col items-center"
          style={{
            background:     'rgba(4,8,20,0.85)',
            border:         `1px solid ${GOLD_RGBA(0.12)}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="mb-4 text-center">
            <h2 className="text-sm font-semibold text-white mb-1">Daily Energy Score</h2>
            <p className="text-xs text-slate-500">
              Calculated from your birth data + today&apos;s Gochar
            </p>
          </div>
          <EnergyMeter score={score} name={name} />
        </div>
        <div className="space-y-5">
          <TrikalInsight
            insight={insight} remedy={remedy} practicalTip={practicalTip}
            rashi={rashi} luckyColor={luckyColor} luckyNumber={luckyNumber} name={name}
          />
        </div>
      </div>

      {/* ── 5. PILLAR SCORES ── */}
      <PillarScoreGrid scores={pillarScores} />

      {/* ── 6. FUTURE TIMELINE ── */}
      {monthlyTimeline.length > 0 && (
        <div>
          <FutureTimeline forecasts={monthlyTimeline} name={name} />
          {!unlockedTiers.has('addon_timeline') && (
            <div className="mt-3">
              <UnlockButton
                label="Unlock Secret Timeline — Exact Dates for Major Events"
                price={11} contentId="addon_timeline" onUnlock={onUnlock}
              />
            </div>
          )}
        </div>
      )}

      {!unlockedTiers.has('base') && (
        <UnlockButton
          label="Unlock Full Vibe Score + Compatibility Heatmap"
          price={21} contentId="base" onUnlock={onUnlock}
        />
      )}
    </div>
  );
}

// ─── KUNDALI PHASE ────────────────────────────────────────────────────────────
function KundaliPhase({
  name, dob, rashi, dashaPeriods, lifeTimeline, unlockedTiers, onUnlock,
  mahadasha, antardasha, pratyantar, currentPratyantar, currentSookshma, lang,
}: {
  name: string; dob: string; rashi: string;
  dashaPeriods: DashaPeriod[]; lifeTimeline: LifeTimelineEvent[];
  unlockedTiers: Set<string>; onUnlock: (id: string) => void;
  // ✅ v5.0 — Pratyantar props
  mahadasha: string;
  antardasha: string;
  pratyantar: any[];
  currentPratyantar: any;
  currentSookshma: any;
  lang: 'hindi' | 'hinglish' | 'english';
}) {
  const currentYear = new Date().getFullYear();
  const planets     = derivePlanetsFromDob(dob);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LagnaChart ascendant={rashi} planets={planets} name={name} />
        <VimshottariDashaTable
          dashaPeriods={dashaPeriods} currentYear={currentYear} name={name}
        />
      </div>
      {lifeTimeline.length > 0 && (
        <LifeTimeline
          events={lifeTimeline} dashaPeriods={dashaPeriods} name={name}
        />
      )}
      {/* ✅ v5.0 — PRATYANTAR + SOOKSHMA DASHA — below Vimshottari table */}
      {currentPratyantar && pratyantar?.length > 0 && (
        <PratayantarDasha
          name={name}
          mahadasha={mahadasha}
          antardasha={antardasha}
          pratyantar={pratyantar}
          currentPratyantar={currentPratyantar}
          currentSookshma={currentSookshma}
          lang={lang}
        />
      )}
    </div>
  );
}

// ─── GURU ANALYSIS PHASE ──────────────────────────────────────────────────────
function GuruAnalysisPhase({
  name, generation, segmentAnalysis, segmentLoading, onSegmentAnalyze,
  aiData, aiLoading, varshphalFocus, ashtakvargaWealth, dob, userDob,
  compatResult, compatLoading, onCompatCheck, unlockedTiers, onUnlock,
  latestWhatsapp, score,
}: {
  name: string; generation: 'genz' | 'millennial' | 'genx';
  segmentAnalysis: SegmentAnalysis | null; segmentLoading: boolean;
  onSegmentAnalyze: (seg: LifeSegment, partnerData?: PartnerFormData) => Promise<void>;
  aiData: PredictiveTabsData | null; aiLoading: boolean;
  varshphalFocus: string; ashtakvargaWealth: number;
  dob: string; userDob: string;
  compatResult: CompatibilityResult | null; compatLoading: boolean;
  onCompatCheck: (partner: PartnerData) => Promise<void>;
  unlockedTiers: Set<string>; onUnlock: (id: string) => void;
  latestWhatsapp: string | undefined; score: number;
}) {
  return (
    <div className="space-y-6">
      <DardEngine
        generation={generation} name={name} onAnalyze={onSegmentAnalyze}
        analysis={segmentAnalysis} loading={segmentLoading}
        unlockedTiers={unlockedTiers} onUnlock={onUnlock}
      />
      <PredictiveModules
        data={aiData} loading={aiLoading} varshphalFocus={varshphalFocus}
        ashtakvargaWealth={ashtakvargaWealth} name={name}
      />
      <CompatibilityMeter
        userName={name} userDob={userDob} onCheck={onCompatCheck}
        result={compatResult} loading={compatLoading}
        unlockedTiers={unlockedTiers} onUnlock={onUnlock}
      />
      {compatResult && !unlockedTiers.has('addon_redflag') && (
        <UnlockButton
          label="Unlock Red Flag Alert — Deep Planetary Clash Analysis"
          price={11} contentId="addon_redflag" onUnlock={onUnlock}
        />
      )}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background:     'rgba(4,8,20,0.8)',
          border:         '1px solid rgba(34,197,94,0.15)',
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
    </div>
  );
}

// ─── RESULT CONTENT ───────────────────────────────────────────────────────────
function ResultContent() {
  const params = useSearchParams();

  // ── Core params
  const name         = params.get('name')     || 'Friend';
  const dob          = params.get('dob')      || '';
  const city         = params.get('city')     || '';
  const score        = parseInt(params.get('score')   || '72', 10);
  const rashi        = params.get('rashi')    || 'Mesha';
  const luckyColor   = params.get('color')    || 'Golden';
  const luckyNumber  = parseInt(params.get('number')  || '7', 10);
  const insight      = params.get('insight')  || 'The stars illuminate your path today.';
  const remedy       = params.get('remedy')   || 'Chant the Gayatri Mantra 21 times at sunrise.';
  const practicalTip = params.get('tip')      || 'Avoid major decisions under time pressure today.';
  const generation   = (params.get('gen')     || 'millennial') as 'genz' | 'millennial' | 'genx';
  const varshphalFocus    = params.get('varshphal') || 'Jupiter rules your Varshphal year.';
  const ashtakvargaWealth = parseInt(params.get('avwealth') || '24', 10);

  // ── Kundali params
  const lagna          = params.get('lagna')          || '';
  const lagnaLord      = params.get('lagnaLord')      || '';
  const nakshatra      = params.get('nakshatra')      || '';
  const nakshatraLord  = params.get('nakshatraLord')  || '';
  const mahadasha      = params.get('mahadasha')      || '';
  const antardasha     = params.get('antardasha')     || '';
  const dashaBalance   = params.get('dashaBalance')   || '';
  const choghadiya     = params.get('choghadiya')     || '';
  const choghadiyaType = params.get('choghadiyaType') || 'Neutral';
  const tithi          = params.get('tithi')          || '';
  const vara           = params.get('vara')           || '';
  const yoga           = params.get('yoga')           || '';
  const rahuStart      = params.get('rahuStart')      || '';
  const rahuEnd        = params.get('rahuEnd')        || '';
  const abhijeetStart  = params.get('abhijeetStart')  || '';
  const abhijeetEnd    = params.get('abhijeetEnd')    || '';
  const autoSegment      = params.get('autoSegment')      || 'default';
  const autoSegmentLabel = params.get('autoSegmentLabel') || '';

  // ✅ v5.0 — Pratyantar Dasha params
  const pratayantarLord    = params.get('pratayantarLord')    || '';
  const pratayantarStart   = params.get('pratayantarStart')   || '';
  const pratayantarEnd     = params.get('pratayantarEnd')     || '';
  const pratayantarDays    = parseInt(params.get('pratayantarDays')   || '7', 10);
  const pratayantarQuality = (params.get('pratayantarQuality') || 'Madhyam') as 'Shubh' | 'Ashubh' | 'Madhyam';
  const pratayantarRemDays = parseInt(params.get('pratayantarRemDays') || '0', 10);
  const sookshmaLord       = params.get('sookshmaLord')    || '';
  const sookshmaStart      = params.get('sookshmaStart')   || '';
  const sookshmaEnd        = params.get('sookshmaEnd')     || '';
  const sookshmaDays       = parseFloat(params.get('sookshmaDays') || '1');
  const sookshmaQuality    = (params.get('sookshmaQuality') || 'Madhyam') as 'Shubh' | 'Ashubh' | 'Madhyam';

  // Build structured pratyantar objects for PratayantarDasha component
  const currentPratyantar = pratayantarLord ? {
    lord:          pratayantarLord,
    startDate:     pratayantarStart,
    endDate:       pratayantarEnd,
    durationDays:  pratayantarDays,
    quality:       pratayantarQuality,
    remainingDays: pratayantarRemDays,
  } : null;

  const currentSookshma = sookshmaLord ? {
    lord:          sookshmaLord,
    startDate:     sookshmaStart,
    endDate:       sookshmaEnd,
    durationDays:  sookshmaDays,
    quality:       sookshmaQuality,
    remainingDays: 0,
  } : null;

  // Full pratyantar list
  let pratayantarList: any[] = [];
  try {
    const raw = params.get('pratayantarList');
    if (raw) pratayantarList = JSON.parse(raw);
  } catch { /* fallback */ }

  // ✅ NEW — Language param
  const lang = (params.get('lang') || 'hinglish') as 'hindi' | 'hinglish' | 'english';

  // ✅ NEW — Partner/dual chart params
  const partnerName      = params.get('partnerName')   || '';
  const partnerDob       = params.get('partnerDob')    || '';
  const partnerCity      = params.get('partnerCity')   || '';
  const partnerLagna     = params.get('partnerLagna')  || '';
  const partnerMahadasha = params.get('partnerMahadasha') || '';
  const partnerNakshatra = params.get('partnerNakshatra') || '';

  // ── Planets
  let planets: Array<{
    name: string; rashi: string; house: number; strength: number;
    isRetrograde: boolean; nakshatra: string; degree: number;
  }> = [];
  try {
    const raw = params.get('planets');
    if (raw) planets = JSON.parse(raw);
  } catch { /* fallback */ }

  // ✅ Partner planets (future — when dual Prokerala is wired)
  let partnerPlanets: typeof planets = [];
  try {
    const raw = params.get('partnerPlanets');
    if (raw) partnerPlanets = JSON.parse(raw);
  } catch { /* fallback */ }

  // ── Pillar scores
  const pillarScores = {
    wealth:   parseInt(params.get('wealth')   || '72', 10),
    career:   parseInt(params.get('career')   || '68', 10),
    love:     parseInt(params.get('love')     || '75', 10),
    health:   parseInt(params.get('health')   || '70', 10),
    students: parseInt(params.get('students') || '73', 10),
    peace:    parseInt(params.get('peace')    || '69', 10),
  };

  // ── Dasha + timeline
  let dashaPeriods: DashaPeriod[]         = [];
  let lifeTimeline: LifeTimelineEvent[]   = [];
  try {
    const dashaRaw    = params.get('dasha');
    if (dashaRaw)    dashaPeriods = JSON.parse(dashaRaw);
    const timelineRaw = params.get('timeline');
    if (timelineRaw) lifeTimeline = JSON.parse(timelineRaw);
  } catch { /* fallback */ }

  // ── State
  const [activePhase, setActivePhase]         = useState(0);
  const [aiData, setAiData]                   = useState<PredictiveTabsData | null>(null);
  const [monthlyTimeline, setMonthlyTimeline] = useState<MonthForecast[]>([]);
  const [aiLoading, setAiLoading]             = useState(true);
  const [segmentAnalysis, setSegmentAnalysis] = useState<SegmentAnalysis | null>(null);
  const [segmentLoading, setSegmentLoading]   = useState(false);
  const [latestWhatsapp, setLatestWhatsapp]   = useState<string | undefined>(undefined);
  const [compatResult, setCompatResult]       = useState<CompatibilityResult | null>(null);
  const [compatLoading, setCompatLoading]     = useState(false);
  const [unlockedTiers, setUnlockedTiers]     = useState<Set<string>>(new Set());

  // ✅ NEW — Prediction unlock state
  // Option C: demo mode — unlocks immediately on click (no payment)
  // Phase 3: swap this for Razorpay payment check
  const [isPredictionPaid, setIsPredictionPaid] = useState(false);
  const [unlockLoading, setUnlockLoading]       = useState(false);

  // ✅ DEMO UNLOCK HANDLER — replace with Razorpay in Phase 3
  const handlePredictionUnlock = useCallback(() => {
    setUnlockLoading(true);
    // Simulate brief loading for UX — feels real even in demo
    setTimeout(() => {
      setIsPredictionPaid(true);
      setUnlockLoading(false);
    }, 1200);
  }, []);

  const basePayload = {
    name, dob, city, generation, rashi,
    dashaPeriods, pillarScores, ashtakvargaWealth, varshphalFocus,
  };

  // ── AI data fetch
  useEffect(() => {
    if (!dob || !SUPABASE_URL) { setAiLoading(false); return; }
    callEdge({ ...basePayload, mode: 'predict' })
      .then((json) => {
        const { career, love, wealth, guruMessage, monthlyTimeline: mt } = json;
        if (career && love && wealth)
          setAiData({ career, love, wealth, guruMessage: guruMessage || '' });
        if (Array.isArray(mt) && mt.length > 0) setMonthlyTimeline(mt);
      })
      .catch(() => {})
      .finally(() => setAiLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dob]);

  // ── Auto segment edge call
  useEffect(() => {
    if (!autoSegment || autoSegment === 'default' || !dob || !SUPABASE_URL) return;
    setSegmentLoading(true);
    callEdge({
      ...basePayload,
      mode: 'segment',
      segmentId: autoSegment,
      segmentLabel: autoSegmentLabel || autoSegment,
    })
      .then((json) => {
        setSegmentAnalysis(json as SegmentAnalysis);
        if (json.whatsappText) setLatestWhatsapp(json.whatsappText);
      })
      .catch(() => {})
      .finally(() => setSegmentLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dob, autoSegment]);

  const handleSegmentAnalyze = useCallback(async (
    segment: LifeSegment,
    partnerData?: PartnerFormData
  ) => {
    setSegmentLoading(true);
    setSegmentAnalysis(null);
    try {
      const payload: Record<string, unknown> = {
        ...basePayload, mode: 'segment',
        segmentId: segment.id, segmentLabel: segment.label,
      };
      if (partnerData) {
        payload.partner = {
          name:       partnerData.name,
          dob:        partnerData.dob,
          birth_time: partnerData.birth_time,
          city:       partnerData.city,
          gender:     partnerData.gender,
        };
      }
      const json = await callEdge(payload);
      setSegmentAnalysis(json as SegmentAnalysis);
      if (json.whatsappText) setLatestWhatsapp(json.whatsappText);
    } catch { /* fallback */ }
    finally { setSegmentLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dob]);

  const handlePricingSelect = useCallback((selection: PricingSelection) => {
    setUnlockedTiers(prev => new Set([...prev, selection.tier]));
  }, []);

  const handleUnlockContent = useCallback((contentId: string) => {
    setUnlockedTiers(prev => new Set([...prev, contentId]));
  }, []);

  const handleCompatCheck = useCallback(async (partner: PartnerData) => {
    setCompatLoading(true);
    setCompatResult(null);
    try {
      const json = await callEdge({ ...basePayload, mode: 'compatibility', partner });
      setCompatResult(json as CompatibilityResult);
    } catch { /* silent */ }
    finally { setCompatLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dob]);

  return (
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Back + name breadcrumb */}
          <div className="mb-6 flex items-center gap-3">
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
              {dob && ` · Born ${new Date(dob).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}`}
            </span>
          </div>

          {/* Hero greeting */}
          <div
            className="text-center mb-8 py-6 px-4 rounded-2xl"
            style={{ background: 'rgba(4,8,20,0.75)', border: `1px solid ${GOLD_RGBA(0.1)}` }}
          >
            <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.55) }}>
              Your Cosmic Report
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">
              <span className="text-white">Namaste, </span>
              <span className="text-gradient-gold">{name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Your Trikal Analysis for{' '}
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>

          {/* Phase tabs */}
          <div className="flex gap-2 sm:gap-3 mb-8">
            {PHASE_LABELS.map((_, i) => (
              <PhaseHeader
                key={i} phase={i}
                activePhase={activePhase}
                onClick={() => setActivePhase(i)}
              />
            ))}
          </div>

          {/* Phase label */}
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-5 flex items-center gap-2"
            style={{ color: GOLD_RGBA(0.45) }}
          >
            <div className="w-4 h-px" style={{ background: GOLD_RGBA(0.3) }} />
            Phase {activePhase + 1} — {PHASE_LABELS[activePhase]!.label}
          </div>

          {/* ── PHASE 1 ── */}
          {activePhase === 0 && (
            <ThreeMonthSummary
              name={name} dob={dob} city={city}
              score={score} insight={insight} remedy={remedy}
              practicalTip={practicalTip} rashi={rashi}
              luckyColor={luckyColor} luckyNumber={luckyNumber}
              pillarScores={pillarScores}
              aiData={aiData} aiLoading={aiLoading}
              varshphalFocus={varshphalFocus}
              ashtakvargaWealth={ashtakvargaWealth}
              monthlyTimeline={monthlyTimeline}
              unlockedTiers={unlockedTiers} onUnlock={handleUnlockContent}
              lagna={lagna} lagnaLord={lagnaLord}
              nakshatra={nakshatra} nakshatraLord={nakshatraLord}
              mahadasha={mahadasha} antardasha={antardasha}
              dashaBalance={dashaBalance}
              choghadiya={choghadiya} choghadiyaType={choghadiyaType}
              tithi={tithi} vara={vara} yoga={yoga}
              rahuStart={rahuStart} rahuEnd={rahuEnd}
              abhijeetStart={abhijeetStart} abhijeetEnd={abhijeetEnd}
              planets={planets}
              autoSegment={autoSegment}
              autoSegmentLabel={autoSegmentLabel}
              // ✅ NEW
              lang={lang}
              partnerName={partnerName || undefined}
              partnerDob={partnerDob || undefined}
              partnerLagna={partnerLagna || undefined}
              partnerMahadasha={partnerMahadasha || undefined}
              partnerNakshatra={partnerNakshatra || undefined}
              partnerPlanets={partnerPlanets.length > 0 ? partnerPlanets : undefined}
              isPredictionPaid={isPredictionPaid}
              onPredictionUnlock={handlePredictionUnlock}
            />
          )}

          {/* ── PHASE 2 ── */}
          {activePhase === 1 && (
            <KundaliPhase
              name={name} dob={dob} rashi={rashi}
              dashaPeriods={dashaPeriods} lifeTimeline={lifeTimeline}
              unlockedTiers={unlockedTiers} onUnlock={handleUnlockContent}
              mahadasha={mahadasha}
              antardasha={antardasha}
              pratyantar={pratayantarList}
              currentPratyantar={currentPratyantar}
              currentSookshma={currentSookshma}
              lang={lang}
            />
          )}

          {/* ── PHASE 3 ── */}
          {activePhase === 2 && (
            <GuruAnalysisPhase
              name={name} generation={generation}
              segmentAnalysis={segmentAnalysis} segmentLoading={segmentLoading}
              onSegmentAnalyze={handleSegmentAnalyze}
              aiData={aiData} aiLoading={aiLoading}
              varshphalFocus={varshphalFocus}
              ashtakvargaWealth={ashtakvargaWealth}
              dob={dob} userDob={dob}
              compatResult={compatResult} compatLoading={compatLoading}
              onCompatCheck={handleCompatCheck}
              unlockedTiers={unlockedTiers} onUnlock={handleUnlockContent}
              latestWhatsapp={latestWhatsapp} score={score}
            />
          )}

          {/* Pricing section */}
          <div id="pricing" className="mt-8 mb-6">
            <PricingLadder
              name={name}
              onSelect={handlePricingSelect}
              unlockedTiers={Array.from(unlockedTiers) as any[]}
            />
          </div>

          {/* New analysis CTA */}
          <div className="text-center">
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

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────
export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B12] flex items-center justify-center">
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
