'use client';

// ============================================================
// File: components/calculators/FreeKundaliCalculator.tsx
// Version: v1.0 (05 Sep 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// WHY THIS FILE EXISTS
//   /calculators/free-kundali-calculator carried NO calculator. The page and
//   KundaliCalculatorClient.tsx together held 382 lines and not one <input>:
//   the only action was a link to the homepage #birth-form. Radar E2 read the
//   page on 05 Sep 2026 and classified it page_format = "article", which was
//   correct — and the Radar report shows cluster calc-kundali with 4 SERPs
//   where Google wants a tool and trikalvaani.com does not rank.
//
//   The page's own FAQ already promised Lagna, Chandra/Surya Rashi, Mahadasha
//   and all nine grahas. This component finally delivers that promise.
//
// SCOPE — deliberately the SMALL version (Rohiit's call, 05 Sep 2026)
//   Shows: Lagna + lord, Chandra Rashi, Surya Rashi, Nakshatra + pada,
//          running Mahadasha/Antardasha, and the nine-graha table.
//   Does NOT show: D-1 visual chart, Shadbala figures, remedies. Those stay
//          behind the paid reading, and the CTA hands off to #birth-form.
//
// ENGINE
//   POST /api/calc/kundali  { year, month, day, hour, minute,
//                             latitude, longitude, timezone, name, gender }
//   Reads back response.instant and response.planets. Nothing new was added
//   to the route — it already returned both fields.
//
// CITY LOOKUP
//   Reuses components/calculators/CityInput.tsx as-is, the same one the
//   gemstone calculators use. It returns (city, lat, lng, timezone) and the
//   API needs exactly those three numbers, so nothing is remapped.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import CityInput from '@/components/calculators/CityInput';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type Planet = {
  planet: string;
  sign: string | null;
  house: number | null;
  nakshatra: string | null;
  is_retrograde: boolean;
  dignity: string | null;
};

type Instant = {
  lagna: string | null;
  lagna_lord: string | null;
  nakshatra: string | null;
  nakshatra_lord: string | null;
  pada: number | null;
  chandra_rashi: string | null;
  surya_rashi: string | null;
  current_dasha: string | null;
  current_antardasha: string | null;
};

type Result = { instant: Instant; planets: Planet[] };

type Form = {
  name: string;
  gender: 'male' | 'female' | 'other';
  date: string;
  time: string;
  unknownTime: boolean;
  placeQuery: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  timezone: number;
};

const EMPTY: Form = {
  name: '', gender: 'male', date: '', time: '', unknownTime: false,
  placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
};

// Hindi labels, because the cluster this page sits in is majority Hindi.
const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
  Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

function Field({ label, hint, children }:
  { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#cbd5e1' }}>
        {label}
        {hint && <span className="font-normal ml-1" style={{ color: '#64748b' }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: '#0d1120',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#e2e8f0',
  colorScheme: 'dark' as const,
};

function Stat({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className="text-[11px] m-0 mb-0.5" style={{ color: '#64748b' }}>{label}</p>
      <p className="text-sm font-semibold m-0" style={{ color: GOLD }}>{value}</p>
    </div>
  );
}

export default function FreeKundaliCalculator() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Janm tithi chunein';
    if (!form.unknownTime && !form.time) e.time = 'Janm samay daalein, ya "samay nahi pata" chunein';
    if (form.latitude === null || form.longitude === null) {
      e.city = 'List mein se apna janm sthan chunein';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setApiError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const [year, month, day] = form.date.split('-').map(Number);
      // Time unknown -> noon. The chart is still right for the Moon, the
      // Nakshatra and the grahas; only the Lagna and the houses move. The
      // result block says so plainly rather than hiding it.
      const [hour, minute] = (form.unknownTime ? '12:00' : form.time).split(':').map(Number);

      const res = await fetch('/api/calc/kundali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calcType: 'kundali',
          year, month, day, hour, minute,
          latitude: form.latitude,
          longitude: form.longitude,
          timezone: form.timezone,
          name: form.name || undefined,
          gender: form.gender,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setApiError(data?.error || 'Kundali nahi ban paayi. Thodi der baad koshish karein.');
        setResult(null);
      } else {
        setResult({ instant: data.instant || {}, planets: data.planets || [] });
      }
    } catch {
      setApiError('Network problem. Internet check karke dobara koshish karein.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">

      {/* ───────────────────────────── FORM ───────────────────────────── */}
      <div className="rounded-2xl p-5 md:p-6"
        style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.25)}` }}>

        <h2 className="text-lg md:text-xl font-bold m-0 mb-1" style={{ color: GOLD }}>
          Apni Janm Kundali Banayein — Free
        </h2>
        <p className="text-xs m-0 mb-5" style={{ color: '#94a3b8' }}>
          Swiss Ephemeris aur Lahiri Ayanamsha par. Na signup, na payment.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Naam" hint="(optional)">
            <input id="tvk-name" type="text" value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Aapka naam"
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle} />
          </Field>

          <Field label="Ling">
            <select id="tvk-gender" value={form.gender}
              onChange={e => set('gender', e.target.value as Form['gender'])}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle}>
              <option value="male">Purush</option>
              <option value="female">Stri</option>
              <option value="other">Anya</option>
            </select>
          </Field>

          <Field label="Janm Tithi">
            <input id="tvk-dob" type="date" value={form.date}
              onChange={e => set('date', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ ...inputStyle, border: `1px solid ${errors.date ? '#ef4444' : 'rgba(255,255,255,0.1)'}` }} />
            {errors.date && <p className="text-[11px] mt-1 mb-0" style={{ color: '#ef4444' }}>{errors.date}</p>}
          </Field>

          <Field label="Janm Samay">
            <input id="tvk-tob" type="time" value={form.time}
              disabled={form.unknownTime}
              onChange={e => set('time', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none disabled:opacity-40"
              style={{ ...inputStyle, border: `1px solid ${errors.time ? '#ef4444' : 'rgba(255,255,255,0.1)'}` }} />
            <label className="flex items-center gap-2 mt-2 text-[11px] cursor-pointer" style={{ color: '#94a3b8' }}>
              <input type="checkbox" checked={form.unknownTime}
                onChange={e => set('unknownTime', e.target.checked)} className="rounded" />
              Janm samay nahi pata
            </label>
            {errors.time && <p className="text-[11px] mt-1 mb-0" style={{ color: '#ef4444' }}>{errors.time}</p>}
          </Field>

          <div className="sm:col-span-2">
            <Field label="Janm Sthan">
              <CityInput id="tvk-city" value={form.placeQuery} error={errors.city}
                onSelect={(city, lat, lng, tz) =>
                  setForm(p => ({ ...p, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz }))} />
              {errors.city && <p className="text-[11px] mt-1 mb-0" style={{ color: '#ef4444' }}>{errors.city}</p>}
            </Field>
          </div>
        </div>

        {form.unknownTime && (
          <p className="text-[11px] leading-relaxed mt-4 mb-0 rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(212,175,55,0.07)', color: '#cbd5e1' }}>
            Samay ke bina dopahar 12:00 maan liya jaayega. <strong style={{ color: GOLD }}>Chandra Rashi,
            Nakshatra aur grahon ki rashi phir bhi sahi rahengi</strong> — par <strong style={{ color: GOLD }}>Lagna
            aur bhaav galat ho sakte hain</strong>, kyunki Lagna har do ghante mein badal jaata hai. Janm
            pramanpatra se samay mil jaaye to dobara chala lijiye.
          </p>
        )}

        <button onClick={submit} disabled={loading}
          className="w-full mt-5 py-3 rounded-lg text-sm font-bold transition disabled:opacity-50"
          style={{ background: GOLD, color: '#0B0F1A' }}>
          {loading ? 'Kundali ban rahi hai…' : 'Meri Kundali Banayein'}
        </button>

        {apiError && (
          <p className="text-xs mt-3 mb-0 rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{apiError}</p>
        )}
      </div>

      {/* ──────────────────────────── RESULT ──────────────────────────── */}
      {result && (
        <div className="rounded-2xl p-5 md:p-6"
          style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.25)}` }}>

          <h2 className="text-lg md:text-xl font-bold m-0 mb-4" style={{ color: GOLD }}>
            {form.name ? `${form.name} ki Kundali` : 'Aapki Kundali'}
          </h2>

          <div className="grid gap-2.5 grid-cols-2 md:grid-cols-3 mb-6">
            <Stat label="Lagna" value={result.instant.lagna} />
            <Stat label="Lagna Swami" value={result.instant.lagna_lord} />
            <Stat label="Chandra Rashi" value={result.instant.chandra_rashi} />
            <Stat label="Surya Rashi" value={result.instant.surya_rashi} />
            <Stat label="Nakshatra"
              value={result.instant.nakshatra
                ? `${result.instant.nakshatra}${result.instant.pada ? ` — pada ${result.instant.pada}` : ''}`
                : null} />
            <Stat label="Nakshatra Swami" value={result.instant.nakshatra_lord} />
            <Stat label="Chal rahi Mahadasha" value={result.instant.current_dasha} />
            <Stat label="Antardasha" value={result.instant.current_antardasha} />
          </div>

          {result.planets.length > 0 && (
            <>
              <h3 className="text-sm font-bold m-0 mb-3" style={{ color: '#e2e8f0' }}>
                Nau grahon ki sthiti
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${GOLD_RGBA(0.25)}` }}>
                      {['Graha', 'Rashi', 'Bhaav', 'Nakshatra', 'Sthiti'].map(h => (
                        <th key={h} className="text-left py-2 px-2 font-semibold"
                          style={{ color: '#94a3b8' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.planets.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td className="py-2 px-2 font-semibold" style={{ color: GOLD }}>
                          {PLANET_HI[p.planet] || p.planet}
                          {p.is_retrograde && (
                            <span className="ml-1 text-[10px]" style={{ color: '#f87171' }}
                              title="Vakri">℞</span>
                          )}
                        </td>
                        <td className="py-2 px-2" style={{ color: '#cbd5e1' }}>{p.sign || '—'}</td>
                        <td className="py-2 px-2" style={{ color: '#cbd5e1' }}>{p.house ?? '—'}</td>
                        <td className="py-2 px-2" style={{ color: '#cbd5e1' }}>{p.nakshatra || '—'}</td>
                        <td className="py-2 px-2" style={{ color: '#94a3b8' }}>{p.dignity || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] mt-2 mb-0" style={{ color: '#64748b' }}>
                ℞ = vakri (retrograde)
              </p>
            </>
          )}

          {/* Handoff to the paid reading. The free chart answers "kya hai";
              the paid one answers "kab" and "kyun", which is the real ask. */}
          <div className="mt-6 rounded-xl p-4"
            style={{ background: 'rgba(212,175,55,0.07)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
            <p className="text-sm font-semibold m-0 mb-1.5" style={{ color: GOLD }}>
              Kundali ban gayi — ab isme likha kya hai?
            </p>
            <p className="text-xs leading-relaxed m-0 mb-3" style={{ color: '#cbd5e1' }}>
              Upar wali table batati hai <strong>kya</strong> hai. Wo ye nahi batati ki
              aapki Mahadasha kab badlegi, saatve bhaav ke yog shaadi ke liye kya keh rahe
              hain, ya aane wale mahinon mein kya khulega. Uske liye poora vishleshan chahiye.
            </p>
            <Link href="/#birth-form"
              className="inline-block px-5 py-2.5 rounded-lg text-xs font-bold"
              style={{ background: GOLD, color: '#0B0F1A' }}>
              Detailed Kundali Prediction — ₹51 se
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
