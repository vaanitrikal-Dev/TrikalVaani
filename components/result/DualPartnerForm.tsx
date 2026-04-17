'use client';

import { useState } from 'react';
import { User, Calendar, MapPin, Clock, Loader as Loader2, Heart, HeartCrack, Briefcase, Users } from 'lucide-react';

const PINK      = '#F472B6';
const PINK_RGBA = (a: number) => `rgba(244,114,182,${a})`;
const GOLD      = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;
const ORANGE    = '#FB923C';
const ORANGE_RGBA = (a: number) => `rgba(251,146,60,${a})`;

export type PartnerFormData = {
  name: string;
  dob: string;
  birth_time: string;
  city: string;
  gender: 'him' | 'her';
};

type Props = {
  userName: string;
  userDob?: string;
  userBirthTime?: string;
  userCity?: string;
  mode: 'ex_back' | 'compatibility' | 'toxic_boss';
  loading: boolean;
  onSubmit: (data: PartnerFormData) => Promise<void>;
};

type PersonFields = { name: string; dob: string; birth_time: string; city: string };

function PersonForm({
  prefix,
  label,
  sublabel,
  accent,
  accentRgba,
  icon: HeaderIcon,
  data,
  errors,
  onChange,
}: {
  prefix: string;
  label: string;
  sublabel: string;
  accent: string;
  accentRgba: (a: number) => string;
  icon: React.ElementType;
  data: PersonFields;
  errors: Partial<PersonFields>;
  onChange: (field: keyof PersonFields, value: string) => void;
}) {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: accentRgba(0.04),
        border: `1px solid ${accentRgba(0.18)}`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accentRgba(0.12), border: `1px solid ${accentRgba(0.3)}` }}
        >
          <HeaderIcon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>{label}</p>
          <p className="text-xs" style={{ color: accentRgba(0.5) }}>{sublabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: accentRgba(0.65) }}>
            Full Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: accentRgba(0.4) }} />
            <input
              type="text"
              id={`${prefix}-name`}
              placeholder="Enter name"
              value={data.name}
              onChange={e => onChange('name', e.target.value)}
              className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
            />
          </div>
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: accentRgba(0.65) }}>
            Date of Birth <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: accentRgba(0.4) }} />
            <input
              type="date"
              id={`${prefix}-dob`}
              value={data.dob}
              onChange={e => onChange('dob', e.target.value)}
              className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          {errors.dob && <p className="text-xs text-rose-400 mt-1">{errors.dob}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: accentRgba(0.65) }}>
            Birth City <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: accentRgba(0.4) }} />
            <input
              type="text"
              id={`${prefix}-city`}
              placeholder="e.g. Mumbai"
              value={data.city}
              onChange={e => onChange('city', e.target.value)}
              className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
            />
          </div>
          {errors.city && <p className="text-xs text-rose-400 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: accentRgba(0.4) }}>
            Birth Time <span className="text-slate-600">(optional)</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: accentRgba(0.3) }} />
            <input
              type="time"
              id={`${prefix}-time`}
              value={data.birth_time}
              onChange={e => onChange('birth_time', e.target.value)}
              className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DualPartnerForm({ userName, userDob = '', userBirthTime = '', userCity = '', mode, loading, onSubmit }: Props) {
  const isExBack     = mode === 'ex_back';
  const isCompat     = mode === 'compatibility';
  const isToxicBoss  = mode === 'toxic_boss';

  const [gender, setGender] = useState<'him' | 'her'>('her');

  const [partnerData, setPartnerData] = useState<PersonFields>({
    name: '', dob: '', birth_time: '', city: '',
  });
  const [partnerErrors, setPartnerErrors] = useState<Partial<PersonFields>>({});

  const accentColor = isExBack ? PINK : isToxicBoss ? ORANGE : GOLD;
  const accentRgba  = isExBack ? PINK_RGBA : isToxicBoss ? ORANGE_RGBA : GOLD_RGBA;

  const partnerLabel    = isToxicBoss ? "Boss Details" : isExBack ? "Ex-Partner's Details" : "Partner's Details";
  const partnerSublabel = isToxicBoss
    ? "Sun vs Saturn authority axis analysis"
    : isExBack
    ? "Venus-Ketu axis & 7th house karma"
    : "Ashta-Koota Vedic matching";

  const PartnerHeaderIcon = isToxicBoss ? Briefcase : isExBack ? HeartCrack : Heart;

  const dividerLabel = isToxicBoss ? "vs" : "♥";

  function validatePartner(): boolean {
    const e: Partial<PersonFields> = {};
    if (!partnerData.name.trim()) e.name = 'Required';
    if (!partnerData.dob) e.dob = 'Required';
    if (!partnerData.city.trim()) e.city = 'Required';
    setPartnerErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validatePartner()) return;
    await onSubmit({ ...partnerData, gender });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-3">
      {/* Mode description banner */}
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: accentRgba(0.06), border: `1px solid ${accentRgba(0.18)}` }}
      >
        <PartnerHeaderIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
        <p className="text-xs text-slate-400 leading-relaxed">
          {isToxicBoss
            ? `Enter your Boss's details. Trikal Guru will analyze the Sun–Saturn authority axis, career karma, and workplace power dynamics between both charts.`
            : isExBack
            ? `Enter their details below. Trikal Guru will analyze the Venus-Ketu axis, 7th house karma, and your Karmic Closure path.`
            : `Enter your partner's details. Both charts will be compared using Ashta-Koota Vedic matching.`}
        </p>
      </div>

      {/* Gender toggle — only for relationship modes */}
      {!isToxicBoss && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Their gender:</span>
          <div className="flex items-center gap-2">
            {(['her', 'him'] as const).map((g) => {
              const isActive = gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{
                    background: isActive ? accentRgba(0.14) : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? accentRgba(0.4) : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? accentColor : 'rgba(148,163,184,0.55)',
                    boxShadow: isActive ? `0 0 12px ${accentRgba(0.15)}` : 'none',
                  }}
                >
                  <span style={{ fontSize: '14px', lineHeight: 1 }}>{g === 'her' ? '♀' : '♂'}</span>
                  {g === 'her' ? 'Her' : 'Him'}
                </button>
              );
            })}
          </div>
          <span className="text-xs" style={{ color: accentRgba(0.4) }}>
            ({gender === 'her' ? 'feminine' : 'masculine'} energy analysis)
          </span>
        </div>
      )}

      {/* Dual section visual divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ background: `${accentColor}15` }} />
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: accentRgba(0.08), border: `1px solid ${accentRgba(0.22)}`, color: accentColor }}
        >
          <Users className="w-3 h-3" />
          Dual Chart Reading
        </div>
        <div className="flex-1 h-px" style={{ background: `${accentColor}15` }} />
      </div>

      {/* Section A: User info (read-only / display) */}
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          background: GOLD_RGBA(0.04),
          border: `1px solid ${GOLD_RGBA(0.14)}`,
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.28)}` }}
        >
          <User className="w-4 h-4" style={{ color: GOLD }} />
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GOLD }}>
            {isToxicBoss ? "Your Details (Employee)" : "Your Details"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: GOLD_RGBA(0.5) }}>
            {userName} — already on file from your birth form
          </p>
        </div>
        <div className="ml-auto">
          <span
            className="text-xs px-2 py-1 rounded-full font-semibold"
            style={{ background: GOLD_RGBA(0.1), color: GOLD, border: `1px solid ${GOLD_RGBA(0.22)}` }}
          >
            ✓ Saved
          </span>
        </div>
      </div>

      {/* Visual divider with label */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <span
          className="text-base font-black"
          style={{ color: accentRgba(0.55) }}
        >
          {dividerLabel}
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>

      {/* Section B: Partner / Boss form */}
      <PersonForm
        prefix="partner"
        label={partnerLabel}
        sublabel={partnerSublabel}
        accent={accentColor}
        accentRgba={accentRgba}
        icon={PartnerHeaderIcon}
        data={partnerData}
        errors={partnerErrors}
        onChange={(field, value) => {
          setPartnerData(d => ({ ...d, [field]: value }));
          if (partnerErrors[field]) setPartnerErrors(e => ({ ...e, [field]: undefined }));
        }}
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
        style={{
          background: loading
            ? accentRgba(0.15)
            : `linear-gradient(135deg, ${accentColor} 0%, ${isExBack ? '#EC4899' : isToxicBoss ? '#EA580C' : '#A8862A'} 100%)`,
          color: loading ? accentColor : isToxicBoss ? '#fff' : isExBack ? '#fff' : '#0B0E14',
          boxShadow: loading ? 'none' : `0 4px 20px ${accentRgba(0.3)}`,
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isExBack
              ? 'Analyzing Karmic Closure...'
              : isToxicBoss
              ? 'Analyzing Sun–Saturn Axis...'
              : 'Calculating Ashta-Koota...'}
          </>
        ) : (
          <>
            <PartnerHeaderIcon className="w-4 h-4" />
            {isExBack
              ? `Reveal Closure Reading for ${userName.split(' ')[0]}`
              : isToxicBoss
              ? `Reveal Boss Karma Radar`
              : `Check Our Compatibility`}
          </>
        )}
      </button>
    </form>
  );
}
