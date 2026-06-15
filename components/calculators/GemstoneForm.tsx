'use client';

// ============================================================
// File: components/calculators/GemstoneForm.tsx
// Shared birth-details form for all gemstone calculators.
// Validates input, calls /api/calc/kundali (calcType: 'gemstone'),
// and returns the raw chart data via onData(). The page runs the engine.
// ============================================================

import { useState, useCallback } from 'react';
import CityInput from './CityInput';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface FormData {
  name: string; gender: 'male' | 'female' | 'other' | '';
  date: string; time: string; unknownTime: boolean;
  placeQuery: string; city: string; latitude: number | null; longitude: number | null; timezone: number;
}

export default function GemstoneForm({
  heading = 'Check Your Gemstone Suitability (Free)',
  submitLabel = '💎 Check My Gemstone Suitability',
  onData,
}: {
  heading?: string; submitLabel?: string; onData: (data: any) => void;
}) {
  const [form, setForm] = useState<FormData>({
    name: '', gender: '', date: '', time: '12:00', unknownTime: false,
    placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = useCallback((key: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.date) errs.date = 'Date of birth is required';
    if (!form.unknownTime && !form.time) errs.time = 'Time of birth is required';
    if (form.latitude === null) errs.latitude = 'Please select a city from suggestions';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;
    const [year, month, day] = form.date.split('-').map(Number);
    const tob = form.unknownTime ? '12:00' : form.time;
    const [hour, minute] = tob.split(':').map(Number);
    setLoading(true);
    try {
      const res = await fetch('/api/calc/kundali', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour, minute, latitude: form.latitude, longitude: form.longitude, timezone: form.timezone, calcType: 'gemstone' }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Server error'); }
      onData(await res.json());
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120', border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark',
  });

  return (
    <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
      <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>{heading}</h2>
      <div className="grid gap-5">
        <div>
          <label htmlFor="tv-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-yellow-400">*</span></label>
          <input id="tv-name" type="text" placeholder="Enter your full name" value={form.name} onChange={(e) => set('name', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.name)} />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth <span className="text-yellow-400">*</span></label>
          <input id="tv-dob" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.date)} />
          {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="tv-tob" className="text-sm font-medium text-slate-300">Time of Birth {!form.unknownTime && <span className="text-yellow-400">*</span>}</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
              <input type="checkbox" checked={form.unknownTime} onChange={(e) => set('unknownTime', e.target.checked)} className="rounded" /> Unknown time
            </label>
          </div>
          <input id="tv-tob" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} disabled={form.unknownTime}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ ...inputStyle(!!errors.time), opacity: form.unknownTime ? 0.4 : 1 }} />
          {form.unknownTime
            ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Suitability poori tarah Lagna par nirbhar hai — exact birth time ke bina result bharosemand nahi.</p>
            : <p className="text-slate-500 text-xs mt-1">Lagna (ascendant) ke liye exact time zaroori hai.</p>}
          {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Gender <span className="text-slate-500 text-xs ml-1">(optional)</span></label>
          <div className="grid grid-cols-3 gap-2">
            {[{ value: 'male', label: '♂ Male', color: '#60a5fa' }, { value: 'female', label: '♀ Female', color: '#f472b6' }, { value: 'other', label: '⊕ Other', color: '#94a3b8' }].map((opt) => (
              <button key={opt.value} type="button" onClick={() => set('gender', opt.value)}
                className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center"
                style={{ background: form.gender === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${form.gender === opt.value ? `${opt.color}60` : 'rgba(255,255,255,0.1)'}`, color: form.gender === opt.value ? opt.color : '#64748b' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Place of Birth <span className="text-yellow-400">*</span></label>
          <CityInput id="tv-place" value={form.placeQuery} error={errors.latitude}
            onSelect={(city, lat, lng, tz) => {
              setForm((prev) => ({ ...prev, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz }));
              setErrors((prev) => { const n = { ...prev }; delete n.latitude; return n; });
            }} />
        </div>
        {form.latitude !== null && (
          <div className="grid grid-cols-3 gap-2">
            {[{ label: 'Latitude', value: form.latitude.toFixed(4) }, { label: 'Longitude', value: form.longitude!.toFixed(4) }, { label: 'Timezone', value: `UTC ${form.timezone >= 0 ? '+' : ''}${form.timezone}` }].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-xs text-slate-500 mb-1">{label}</label>
                <div className="px-3 py-2 rounded-lg text-xs font-mono text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#22c55e' }}>{value}</div>
              </div>
            ))}
          </div>
        )}
        {error && <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: loading ? GOLD_RGBA(0.3) : `linear-gradient(135deg,rgba(212,175,55,0.8) 0%,${GOLD} 100%)`, color: '#080B12', fontSize: '15px' }}>
          {loading ? '⟳ Analysing Your Chart...' : submitLabel}
        </button>
        <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Functional Benefic + Shadbala</p>
      </div>
    </div>
  );
}
