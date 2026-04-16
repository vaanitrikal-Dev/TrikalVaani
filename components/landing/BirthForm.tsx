'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader as Loader2, Star, MapPin, Clock, Calendar, User, HeartCrack, TriangleAlert as AlertTriangle, Sparkles, TrendingUp, Chrome as Home, Banknote, Baby, Users, Sunset, Crown, MoonStar, ChevronRight } from 'lucide-react';
import { saveSubmission } from '@/lib/supabase';
import { getVedicAnalysis } from '@/lib/vedic-astro';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type FormData = { name: string; dob: string; birth_time: string; city: string };

type LifeQuestion = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  gen: 'genz' | 'millennial' | 'genx';
};

const GENZ_QUESTIONS: LifeQuestion[] = [
  { id: 'ex_back',       label: 'Will my Ex come back?',   icon: HeartCrack,    color: '#F472B6', gen: 'genz' },
  { id: 'toxic_boss',    label: 'Is my Boss Toxic?',       icon: AlertTriangle, color: '#FB923C', gen: 'genz' },
  { id: 'manifestation', label: 'Manifestation Luck',      icon: Sparkles,      color: '#FACC15', gen: 'genz' },
  { id: 'dream_career',  label: 'Sudden Wealth / Trading', icon: TrendingUp,    color: '#60A5FA', gen: 'genz' },
];

const MILLENNIAL_QUESTIONS: LifeQuestion[] = [
  { id: 'property_yog',     label: 'Property Purchase Window',  icon: Home,    color: '#34D399', gen: 'millennial' },
  { id: 'karz_mukti',       label: 'Debt Clearance (Karz Mukti)', icon: Banknote, color: '#FACC15', gen: 'millennial' },
  { id: 'child_destiny',    label: "Child's Future Path",        icon: Baby,    color: '#F472B6', gen: 'millennial' },
  { id: 'parents_wellness', label: "Parents' Wellness",          icon: Users,   color: '#60A5FA', gen: 'millennial' },
];

const GENX_QUESTIONS: LifeQuestion[] = [
  { id: 'retirement_peace',   label: 'Retirement Peace & Timing', icon: Sunset,   color: '#FB923C', gen: 'genx' },
  { id: 'legacy_inheritance', label: 'Inheritance Clarity',       icon: Crown,    color: '#FACC15', gen: 'genx' },
  { id: 'spiritual_innings',  label: 'Spiritual Purpose',         icon: MoonStar, color: '#D4AF37', gen: 'genx' },
];

const FIELD_META = [
  { key: 'name' as const,       label: 'Full Name',     placeholder: 'Enter your full name',          type: 'text', icon: User },
  { key: 'dob' as const,        label: 'Date of Birth', placeholder: '',                              type: 'date', icon: Calendar },
  { key: 'birth_time' as const, label: 'Birth Time',    placeholder: '',                              type: 'time', icon: Clock },
  { key: 'city' as const,       label: 'Birth City',    placeholder: 'e.g. Mumbai, Delhi, Bangalore', type: 'text', icon: MapPin },
];

function getGenerationFromDob(dob: string): 'genz' | 'millennial' | 'genx' | null {
  if (!dob) return null;
  const year = parseInt(dob.split('-')[0], 10);
  if (isNaN(year)) return null;
  if (year >= 1995) return 'genz';
  if (year >= 1980) return 'millennial';
  if (year >= 1970) return 'genx';
  return null;
}

function QuestionPicker({
  gen,
  selected,
  onSelect,
}: {
  gen: 'genz' | 'millennial' | 'genx';
  selected: string | null;
  onSelect: (q: LifeQuestion) => void;
}) {
  const questions =
    gen === 'genz' ? GENZ_QUESTIONS
    : gen === 'millennial' ? MILLENNIAL_QUESTIONS
    : GENX_QUESTIONS;

  const genLabel =
    gen === 'genz' ? 'Gen Z · Seekers (born 1995+)'
    : gen === 'millennial' ? 'Millennials · Builders (1980–1994)'
    : 'Gen X · Elders (1970–1979)';

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(6,10,24,0.7)',
        border: `1px solid ${GOLD_RGBA(0.14)}`,
      }}
    >
      <div className="flex items-center flex-wrap gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#DC2626' }} />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: `${GOLD}80` }}>
          Choose Your Life Question
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: GOLD_RGBA(0.08), color: GOLD, border: `1px solid ${GOLD_RGBA(0.2)}` }}
        >
          {genLabel}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Tap the question on your mind — your analysis will be laser-focused on it
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {questions.map((q) => {
          const Icon = q.icon;
          const isSelected = selected === q.id;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(q)}
              className="relative text-left rounded-xl p-3.5 transition-all duration-200 group"
              style={{
                background: isSelected ? `${q.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? q.color + '40' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isSelected ? `0 4px 16px ${q.color}18` : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${q.color}15`, border: `1px solid ${q.color}30` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: q.color }} />
                </div>
                <span className="text-sm font-medium text-white leading-tight flex-1">{q.label}</span>
                <ChevronRight
                  className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ color: isSelected ? q.color : 'rgba(148,163,184,0.3)' }}
                />
              </div>
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ background: q.color, boxShadow: `0 0 8px ${q.color}` }}
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-center text-slate-600 mt-3">
        Optional — skip to receive a full general analysis
      </p>
    </div>
  );
}

export default function BirthForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ name: '', dob: '', birth_time: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [selectedQuestion, setSelectedQuestion] = useState<LifeQuestion | null>(null);

  const detectedGen = getGenerationFromDob(form.dob);

  function validate(): boolean {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.dob) newErrors.dob = 'Date of birth is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const analysis = await getVedicAnalysis(form);

      await saveSubmission({
        name: form.name.trim(),
        dob: form.dob,
        birth_time: form.birth_time,
        city: form.city.trim(),
        energy_score: analysis.energyScore,
        pillar_scores: analysis.pillarScores,
      });

      const params = new URLSearchParams({
        name: form.name.trim(),
        dob: form.dob,
        city: form.city.trim(),
        score: String(analysis.energyScore),
        rashi: analysis.dailyRashi,
        color: analysis.luckyColor,
        number: String(analysis.luckyNumber),
        insight: analysis.insight,
        remedy: analysis.remedy,
        tip: analysis.practicalTip,
        wealth: String(analysis.pillarScores.wealth),
        career: String(analysis.pillarScores.career),
        love: String(analysis.pillarScores.love),
        health: String(analysis.pillarScores.health),
        students: String(analysis.pillarScores.students),
        peace: String(analysis.pillarScores.peace),
        gen: analysis.generationLabel,
        avwealth: String(analysis.ashtakvargaWealth),
        varshphal: analysis.varshphalFocus,
        dasha: JSON.stringify(analysis.dashaPeriods),
        timeline: JSON.stringify(analysis.lifeTimeline),
        modules: JSON.stringify(analysis.predictiveModules),
        ...(selectedQuestion
          ? { autoSegment: selectedQuestion.id, autoSegmentLabel: selectedQuestion.label }
          : {}),
      });

      router.push(`/result?${params.toString()}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <section id="birth-form" className="relative py-24 px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${GOLD_RGBA(0.04)} 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.22)}` }}
          >
            <Star className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: `${GOLD}cc` }}>
              Free Analysis
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Begin Your</span>{' '}
            <span className="text-gradient-gold">Cosmic Journey</span>
          </h2>

          <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed mb-6">
            Enter your birth details. Your personalized Trikal analysis will be ready
            instantly — no login required.
          </p>

          <div
            className="inline-block rounded-2xl px-6 py-4 max-w-lg mx-auto"
            style={{
              background: `linear-gradient(135deg, ${GOLD_RGBA(0.07)} 0%, rgba(6,10,24,0.9) 100%)`,
              border: `1px solid ${GOLD_RGBA(0.2)}`,
            }}
          >
            <p className="font-serif text-base sm:text-lg italic leading-relaxed" style={{ color: `${GOLD}cc` }}>
              &ldquo;Pranam. Provide your birth details and the one question on your mind — the Guru will answer both.&rdquo;
            </p>
          </div>
        </div>

        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{
            background: 'rgba(6,12,28,0.85)',
            border: `1px solid ${GOLD_RGBA(0.16)}`,
            backdropFilter: 'blur(16px)',
            boxShadow: `0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 ${GOLD_RGBA(0.06)}`,
          }}
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FIELD_META.map((field) => {
                const Icon = field.icon;
                const error = errors[field.key];
                return (
                  <div key={field.key}>
                    <label
                      htmlFor={field.key}
                      className="block text-xs font-medium tracking-wide mb-2 uppercase"
                      style={{ color: `${GOLD}99` }}
                    >
                      {field.label}
                      {field.key !== 'birth_time' && (
                        <span className="text-rose-400 ml-1">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <Icon
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: GOLD_RGBA(0.4) }}
                      />
                      <input
                        id={field.key}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, [field.key]: e.target.value }));
                          if (errors[field.key]) setErrors((er) => ({ ...er, [field.key]: undefined }));
                          if (field.key === 'dob') setSelectedQuestion(null);
                        }}
                        className="input-cosmic w-full h-12 pl-10 pr-4 rounded-xl text-sm"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                    {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
                  </div>
                );
              })}
            </div>

            {detectedGen && (
              <QuestionPicker
                gen={detectedGen}
                selected={selectedQuestion?.id ?? null}
                onSelect={setSelectedQuestion}
              />
            )}

            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                background: GOLD_RGBA(0.05),
                border: `1px solid ${GOLD_RGBA(0.14)}`,
              }}
            >
              <Star className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: GOLD_RGBA(0.5) }} />
              <p className="text-xs text-slate-400 leading-relaxed">
                Your birth data is used solely to calculate your cosmic energy profile.
                We never share or sell your personal information.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden group"
              style={{
                background: loading
                  ? GOLD_RGBA(0.25)
                  : `linear-gradient(135deg, ${GOLD} 0%, #A8862A 100%)`,
                color: '#020817',
                boxShadow: loading ? 'none' : `0 0 32px ${GOLD_RGBA(0.38)}`,
              }}
            >
              {!loading && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, #E8CC6A 0%, #D4AF37 100%)' }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reading the stars...
                  </>
                ) : selectedQuestion ? (
                  `Reveal My ${selectedQuestion.label} Reading — Free`
                ) : (
                  'Reveal My Trikal Score — Free'
                )}
              </span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Join 10,000+ seekers who have discovered their cosmic blueprint
        </p>
      </div>
    </section>
  );
}
