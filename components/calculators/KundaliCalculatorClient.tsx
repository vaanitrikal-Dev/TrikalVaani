'use client';

// ============================================================
// File: components/calculators/KundaliCalculatorClient.tsx
// Version: v1.0 FINAL
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// Uses Google Maps JS library — key fetched securely from /api/maps-key
// ============================================================

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface FormData {
  name: string;
  gender: 'male' | 'female' | 'other' | '';
  date: string;
  time: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
  timezone: number;
}

interface ApiResult {
  success: boolean;
  sessionId: string;
  instant: {
    lagna: string | null;
    lagna_lord: string | null;
    nakshatra: string | null;
    pada: number | null;
    chandra_rashi: string | null;
    surya_rashi: string | null;
    current_dasha: string | null;
    current_antardasha: string | null;
  };
  kundali: any;
  template: any;
}

export default function KundaliCalculatorClient() {
  const [form, setForm] = useState<FormData>({
    name: '',
    gender: '',
    date: '',
    time: '',
    place: '',
    latitude: null,
    longitude: null,
    timezone: 5.5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapsReady, setMapsReady] = useState(false);

  const placeInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const apiKeyRef = useRef<string>('');

  // Load Google Maps JS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;

    if (w.google?.maps?.places) {
      setMapsReady(true);
      return;
    }

    fetch('/api/maps-key')
      .then((r) => r.json())
      .then((data) => {
        if (!data.key) return;
        apiKeyRef.current = data.key;

        const existing = document.querySelector('script[data-gmaps]');
        if (existing) {
          existing.addEventListener('load', () => setMapsReady(true));
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.key}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.setAttribute('data-gmaps', 'true');
        script.onload = () => setMapsReady(true);
        document.head.appendChild(script);
      })
      .catch((e) => console.error('[maps-key]', e));
  }, []);

  // Init autocomplete
  useEffect(() => {
    if (!mapsReady || !placeInputRef.current) return;
    const w = window as any;
    if (!w.google?.maps?.places) return;

    const ac = new w.google.maps.places.Autocomplete(placeInputRef.current, {
      types: ['(cities)'],
    });

    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const placeName = place.formatted_address || place.name || '';
      const ts = Math.floor(Date.now() / 1000);
      const apiKey = apiKeyRef.current;

      fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}&key=${apiKey}`
      )
        .then((r) => r.json())
        .then((tz) => {
          let tzHours = 5.5;
          if (tz?.rawOffset != null) {
            tzHours = ((tz.rawOffset || 0) + (tz.dstOffset || 0)) / 3600;
          }
          setForm((f) => ({ ...f, place: placeName, latitude: lat, longitude: lng, timezone: tzHours }));
        })
        .catch(() => {
          setForm((f) => ({ ...f, place: placeName, latitude: lat, longitude: lng, timezone: 5.5 }));
        });
    });

    return () => {
      if (w.google?.maps?.event) {
        w.google.maps.event.removeListener(listener);
      }
    };
  }, [mapsReady]);

  const handleSubmit = async () => {
    setError(null);
    if (!form.date || !form.time || form.latitude == null || form.longitude == null) {
      setError('Kripya date, time, aur birth place — teeno fill karein.');
      return;
    }

    const [year, month, day] = form.date.split('-').map(Number);
    const [hour, minute] = form.time.split(':').map(Number);

    setLoading(true);
    try {
      const res = await fetch('/api/calc/kundali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day, hour, minute,
          latitude: form.latitude,
          longitude: form.longitude,
          timezone: form.timezone,
          name: form.name || null,
          gender: form.gender || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }

      const data: ApiResult = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: any) {
      setError(e?.message || 'Kuch galat hua. Phir se try karein.');
    } finally {
      setLoading(false);
    }
  };

  const lagna = result?.instant?.lagna || result?.kundali?.lagna?.sign;
  const lagnaLord = result?.instant?.lagna_lord || result?.kundali?.lagna?.sign_lord;
  const nakshatra = result?.instant?.nakshatra || result?.kundali?.lagna?.nakshatra;
  const pada = result?.instant?.pada || result?.kundali?.lagna?.pada;
  const chandraRashi = result?.instant?.chandra_rashi || result?.kundali?.grahas?.find((g: any) => g.planet === 'Moon')?.sign;
  const suryaRashi = result?.instant?.surya_rashi || result?.kundali?.grahas?.find((g: any) => g.planet === 'Sun')?.sign;

  const dashaObj = result?.kundali?.dasha;
  const currentMahadasha = result?.instant?.current_dasha
    || dashaObj?.current?.mahadasha?.lord
    || dashaObj?.current_mahadasha?.lord
    || dashaObj?.mahadasha?.current?.lord
    || dashaObj?.mahadasha?.lord
    || (Array.isArray(dashaObj?.mahadashas) && dashaObj.mahadashas.find((d: any) => d.active)?.lord)
    || null;
  const currentAntardasha = result?.instant?.current_antardasha
    || dashaObj?.current?.antardasha?.lord
    || dashaObj?.current_antardasha?.lord
    || dashaObj?.antardasha?.current?.lord
    || null;

  const template = result?.template;
  const dos: string[] = template?.dos || template?.do_list || template?.do || [];
  const donts: string[] = template?.donts || template?.dont_list || template?.dont || template?.donot || [];
  const remedies = template?.remedies || template?.remedy || {};
  const mantra = remedies?.mantra || remedies?.mantras || template?.mantra;
  const ratna = remedies?.ratna || remedies?.gemstone || template?.ratna;
  const daan = remedies?.daan || remedies?.charity || template?.daan;

  return (
    <div className="w-full">
      {/* FORM */}
      <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}`, boxShadow: `0 0 30px ${GOLD_RGBA(0.08)}` }}>
        <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>
          Apni Janm Kundali Banao — Free
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Naam <span className="text-slate-500">(optional)</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Aapka naam"
              className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
              style={{ background: 'rgba(2,8,23,0.6)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#E5E7EB' }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Gender <span className="text-slate-500">(optional)</span></label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
              style={{ background: 'rgba(2,8,23,0.6)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#E5E7EB' }}>
              <option value="">Select</option>
              <option value="male">Purush / Male</option>
              <option value="female">Stri / Female</option>
              <option value="other">Anya / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Janm Tareeq <span className="text-red-400">*</span></label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
              style={{ background: 'rgba(2,8,23,0.6)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#E5E7EB', colorScheme: 'dark' }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Janm Samay <span className="text-red-400">*</span></label>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
              style={{ background: 'rgba(2,8,23,0.6)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#E5E7EB', colorScheme: 'dark' }} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Janm Sthan <span className="text-red-400">*</span></label>
            <input ref={placeInputRef} type="text" value={form.place}
              onChange={(e) => setForm({ ...form, place: e.target.value, latitude: null, longitude: null })}
              placeholder={mapsReady ? 'Sheher ka naam likhein — auto-suggest milega' : 'Loading...'}
              disabled={!mapsReady}
              className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
              style={{ background: 'rgba(2,8,23,0.6)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#E5E7EB' }} />
            {form.latitude != null && form.longitude != null && (
              <p className="text-xs text-slate-500 mt-1">
                ✓ Location captured ({form.latitude.toFixed(2)}, {form.longitude.toFixed(2)}, TZ {form.timezone})
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="mt-5 w-full md:w-auto px-8 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }}>
          {loading ? 'Calculating...' : '🔮 Free Kundli Banao'}
        </button>

        <p className="text-xs text-slate-500 mt-3">
          🔒 100% free · Swiss Ephemeris · BPHS Classical Rules · Lahiri Ayanamsha
        </p>
      </div>

      {result && (
        <div ref={resultRef} className="mt-8 space-y-6">
          <div className="rounded-2xl p-5 md:p-7" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.1)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
            <h3 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>
              {form.name ? `${form.name} ki ` : ''}Janm Kundali — Saar
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Cell icon="⬆️" label="Lagna" value={lagna} sub={lagnaLord ? `Swami: ${lagnaLord}` : null} />
              <Cell icon="⭐" label="Nakshatra" value={nakshatra} sub={pada ? `Pada ${pada}` : null} />
              <Cell icon="🌙" label="Chandra Rashi" value={chandraRashi} />
              <Cell icon="☀️" label="Surya Rashi" value={suryaRashi} />
              <Cell icon="🪐" label="Mahadasha" value={currentMahadasha} />
              <Cell icon="🌀" label="Antardasha" value={currentAntardasha} />
            </div>
          </div>

          {(dos.length > 0 || donts.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ Karo (Parashar Niyam)</h4>
                {dos.length > 0 ? (
                  <ul className="space-y-2 text-sm text-slate-300">
                    {dos.slice(0, 5).map((d, i) => (
                      <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-500">Loading...</p>}
              </div>
              <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#FCA5A5' }}>❌ Mat Karo (Parashar Vivarjan)</h4>
                {donts.length > 0 ? (
                  <ul className="space-y-2 text-sm text-slate-300">
                    {donts.slice(0, 5).map((d, i) => (
                      <li key={i} className="flex gap-2"><span className="text-red-400">•</span><span>{d}</span></li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-slate-500">Loading...</p>}
              </div>
            </div>
          )}

          {(mantra || ratna || daan) && (
            <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
              <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪔 Aapke Liye 3 Free Upay</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mantra && <Remedy icon="🔱" title="Mantra" content={typeof mantra === 'string' ? mantra : JSON.stringify(mantra)} />}
                {ratna && <Remedy icon="💎" title="Ratna" content={typeof ratna === 'string' ? ratna : JSON.stringify(ratna)} />}
                {daan && <Remedy icon="🙏" title="Daan" content={typeof daan === 'string' ? daan : JSON.stringify(daan)} />}
              </div>
            </div>
          )}

          <div className="rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.15)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.4)}` }}>
            <p className="text-base mb-3 text-slate-200">
              Yeh toh saar tha. <strong style={{ color: GOLD }}>Puri jeevan bhavishyavani ₹51 mein dekho.</strong>
            </p>
            <Link href="/#birth-form" className="inline-block px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }}>
              ₹51 Mein Full Prediction Le →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Cell({ icon, label, value, sub }: { icon: string; label: string; value: any; sub?: string | null }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
        <span>{icon}</span><span>{label}</span>
      </div>
      <div className="font-bold text-base" style={{ color: GOLD }}>{value || '—'}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function Remedy({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold mb-1.5" style={{ color: GOLD }}>{title}</div>
      <div className="text-sm text-slate-300 leading-relaxed">{content}</div>
    </div>
  );
}
