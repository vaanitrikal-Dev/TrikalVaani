'use client';

import { useState } from 'react';
import { User, Calendar, MapPin, Clock, ToggleLeft, ToggleRight, Loader as Loader2, Heart, HeartCrack } from 'lucide-react';

const PINK = '#F472B6';
const PINK_RGBA = (a: number) => `rgba(244,114,182,${a})`;
const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export type PartnerFormData = {
  name: string;
  dob: string;
  birth_time: string;
  city: string;
  gender: 'him' | 'her';
};

type Props = {
  userName: string;
  mode: 'ex_back' | 'compatibility';
  loading: boolean;
  onSubmit: (data: PartnerFormData) => Promise<void>;
};

export default function DualPartnerForm({ userName, mode, loading, onSubmit }: Props) {
  const [data, setData] = useState<PartnerFormData>({
    name: '',
    dob: '',
    birth_time: '',
    city: '',
    gender: 'her',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerFormData, string>>>({});

  function validate() {
    const e: Partial<Record<keyof PartnerFormData, string>> = {};
    if (!data.name.trim()) e.name = 'Required';
    if (!data.dob) e.dob = 'Required';
    if (!data.city.trim()) e.city = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit(data);
  }

  const isExBack = mode === 'ex_back';
  const accentColor = isExBack ? PINK : GOLD;
  const accentRgba = isExBack ? PINK_RGBA : GOLD_RGBA;
  const Icon = isExBack ? HeartCrack : Heart;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: accentRgba(0.06), border: `1px solid ${accentRgba(0.18)}` }}
      >
        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
        <p className="text-xs text-slate-400 leading-relaxed">
          {isExBack
            ? `Enter ${data.gender === 'her' ? 'his' : 'her'} details below. Trikal Guru will analyze the Venus-Ketu axis, 7th house karma, and the reunion probability.`
            : `Enter your partner's details. Both charts will be compared using Ashta-Koota Vedic matching.`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">Analyzing for:</span>
        <button
          type="button"
          onClick={() => setData(d => ({ ...d, gender: d.gender === 'her' ? 'him' : 'her' }))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
          style={{
            background: accentRgba(0.1),
            border: `1px solid ${accentRgba(0.3)}`,
            color: accentColor,
          }}
        >
          {data.gender === 'her' ? (
            <ToggleLeft className="w-4 h-4" />
          ) : (
            <ToggleRight className="w-4 h-4" />
          )}
          Check for {data.gender === 'her' ? 'Him' : 'Her'}
        </button>
        <span className="text-xs" style={{ color: accentRgba(0.55) }}>
          ({data.gender === 'her' ? 'masculine' : 'feminine'} tone)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: accentRgba(0.7) }}>
            {isExBack ? "Ex-Partner's Name" : "Partner's Name"} <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: accentRgba(0.4) }} />
            <input
              type="text"
              placeholder={isExBack ? 'Their name' : 'Partner name'}
              value={data.name}
              onChange={e => setData(d => ({ ...d, name: e.target.value }))}
              className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
            />
          </div>
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: accentRgba(0.7) }}>
            Date of Birth <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: accentRgba(0.4) }} />
            <input
              type="date"
              value={data.dob}
              onChange={e => setData(d => ({ ...d, dob: e.target.value }))}
              className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          {errors.dob && <p className="text-xs text-rose-400 mt-1">{errors.dob}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: accentRgba(0.7) }}>
            Birth City <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: accentRgba(0.4) }} />
            <input
              type="text"
              placeholder="e.g. Delhi"
              value={data.city}
              onChange={e => setData(d => ({ ...d, city: e.target.value }))}
              className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
            />
          </div>
          {errors.city && <p className="text-xs text-rose-400 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: accentRgba(0.5) }}>
            Birth Time <span className="text-slate-600">(optional)</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: accentRgba(0.3) }} />
            <input
              type="time"
              value={data.birth_time}
              onChange={e => setData(d => ({ ...d, birth_time: e.target.value }))}
              className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
        style={{
          background: loading
            ? accentRgba(0.15)
            : `linear-gradient(135deg, ${accentColor} 0%, ${isExBack ? '#EC4899' : '#A8862A'} 100%)`,
          color: loading ? accentColor : isExBack ? '#fff' : '#0B0E14',
          boxShadow: loading ? 'none' : `0 4px 20px ${accentRgba(0.3)}`,
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isExBack ? 'Analyzing Venus-Ketu Axis...' : 'Calculating Ashta-Koota...'}
          </>
        ) : (
          <>
            <Icon className="w-4 h-4" />
            {isExBack
              ? `Reveal ${userName.split(' ')[0]}'s Reunion Probability`
              : `Check Our Compatibility`}
          </>
        )}
      </button>
    </form>
  );
}
