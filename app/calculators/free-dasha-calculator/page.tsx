'use client';

// ============================================================
// File: app/calculators/free-dasha-calculator/page.tsx
// Purpose: Free Dasha Calculator — working form + result + content
// Version: v1.0
// Engine: Swiss Ephemeris + Parashar BPHS + Shadbala + Bhrigu
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';

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
    current_dasha: string | null;
    current_antardasha: string | null;
    [key: string]: any;
  };
  kundali: any;
  template: any;
}

const FAQS_DISPLAY = [
  { q: 'Dasha calculator kya hai?', a: 'Dasha calculator aapki janm kundali ke aadhar par Vimshottari Dasha system se aapke jeevan ke grah-periods calculate karta hai. Swiss Ephemeris engine se current Mahadasha, Antardasha, aur 120 saal ka full dasha cycle exact dates ke saath milta hai.' },
  { q: 'Vimshottari Dasha kya hai?', a: 'Vimshottari Dasha Maharishi Parashar dwara BPHS Chapter 46-49 mein varnit 120 saal ka grah-period cycle hai. 9 grah baari-baari rule karte hain — Surya 6, Chandra 10, Mangal 7, Rahu 18, Guru 16, Shani 19, Budh 17, Ketu 7, Shukra 20 saal.' },
  { q: 'Mahadasha aur Antardasha mein kya antar hai?', a: 'Mahadasha bada grah-period (jaise Shani 19 saal). Antardasha (Bhukti) Mahadasha ke andar ka sub-period. Har Mahadasha mein 9 Antardashas hoti hain. Combined prediction inhi se hoti hai.' },
  { q: 'Apni current Dasha kaise pata karein?', a: 'Date of Birth, exact Time of Birth, aur Place of Birth daalo. Calculator 5 second mein current Mahadasha, Antardasha, aur next 5 dasha periods deta hai.' },
  { q: 'Kya Dasha calculator bilkul free hai?', a: 'Haan. 100% free. Current Mahadasha + Antardasha, next 5 Mahadasha timeline, 3 Parashar Dos, 3 Donts, aur 3 remedies (Mantra, Ratna, Daan) — sab free.' },
  { q: 'Dasha ke result kitne accurate hain?', a: 'Swiss Ephemeris (NASA-grade) + Lahiri Ayanamsha + BPHS classical formulas — 99.9% astronomical accuracy.' },
];

export default function FreeDashaCalculatorPage() {
  const [form, setForm] = useState<FormData>({
    name: '', gender: '', date: '', time: '', place: '',
    latitude: null, longitude: null, timezone: 5.5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  const placeInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const apiKeyRef = useRef<string>('');
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (w.google?.maps?.places) { setMapsReady(true); return; }

    fetch('/api/maps-key')
      .then((r) => r.json())
      .then((data) => {
        if (!data.key) { setMapsError('Maps service unavailable'); return; }
        apiKeyRef.current = data.key;
        const existing = document.querySelector('script[data-gmaps]');
        if (existing) { existing.addEventListener('load', () => setMapsReady(true)); return; }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.key}&libraries=places&loading=async`;
        script.async = true; script.defer = true;
        script.setAttribute('data-gmaps', 'true');
        script.onload = () => setMapsReady(true);
        script.onerror = () => setMapsError('Google Maps failed to load');
        document.head.appendChild(script);
      })
      .catch(() => setMapsError('Failed to load map service'));
  }, []);

  useEffect(() => {
    if (!mapsReady || !placeInputRef.current) return;
    if (autocompleteRef.current) return;
    const w = window as any;
    if (!w.google?.maps?.places) return;

    try {
      const ac = new w.google.maps.places.Autocomplete(placeInputRef.current, {
        types: ['(cities)'],
        fields: ['formatted_address', 'name', 'geometry'],
      });
      autocompleteRef.current = ac;

      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const placeName = place.formatted_address || place.name || '';
        const ts = Math.floor(Date.now() / 1000);
        fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}&key=${apiKeyRef.current}`)
          .then((r) => r.json())
          .then((tz) => {
            let tzHours = 5.5;
            if (tz?.rawOffset != null) tzHours = ((tz.rawOffset || 0) + (tz.dstOffset || 0)) / 3600;
            setForm((f) => ({ ...f, place: placeName, latitude: lat, longitude: lng, timezone: tzHours }));
          })
          .catch(() => setForm((f) => ({ ...f, place: placeName, latitude: lat, longitude: lng, timezone: 5.5 })));
      });
    } catch (e) {
      console.error('[autocomplete init]', e);
      setMapsError('Place search failed to initialize');
    }
  }, [mapsReady]);

  const handleSubmit = async () => {
    setError(null);
    if (!form.date || !form.time || form.latitude == null || form.longitude == null) {
      setError('Please fill date, time, and place of birth — all three are required.');
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
          latitude: form.latitude, longitude: form.longitude, timezone: form.timezone,
          name: form.name || null, gender: form.gender || null,
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
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dashaObj = result?.kundali?.dasha;
  const currentMahadasha = result?.instant?.current_dasha
    || dashaObj?.current?.mahadasha?.lord || dashaObj?.current_mahadasha?.lord
    || dashaObj?.mahadasha?.current?.lord || dashaObj?.mahadasha?.lord
    || (Array.isArray(dashaObj?.mahadashas) && dashaObj.mahadashas.find((d: any) => d.active)?.lord) || null;
  const currentAntardasha = result?.instant?.current_antardasha
    || dashaObj?.current?.antardasha?.lord || dashaObj?.current_antardasha?.lord
    || dashaObj?.antardasha?.current?.lord || null;
  const mahaStart = dashaObj?.current?.mahadasha?.start || dashaObj?.current_mahadasha?.start || dashaObj?.mahadasha?.current?.start || null;
  const mahaEnd = dashaObj?.current?.mahadasha?.end || dashaObj?.current_mahadasha?.end || dashaObj?.mahadasha?.current?.end || null;
  const antarStart = dashaObj?.current?.antardasha?.start || dashaObj?.current_antardasha?.start || null;
  const antarEnd = dashaObj?.current?.antardasha?.end || dashaObj?.current_antardasha?.end || null;

  const allMahadashas: any[] = dashaObj?.mahadashas || dashaObj?.sequence || dashaObj?.timeline || [];
  let nextFive: any[] = [];
  if (Array.isArray(allMahadashas) && allMahadashas.length > 0) {
    const currentIdx = allMahadashas.findIndex((d: any) => d.active || d.lord === currentMahadasha);
    if (currentIdx >= 0) nextFive = allMahadashas.slice(currentIdx + 1, currentIdx + 6);
    else nextFive = allMahadashas.slice(0, 5);
  }

  const template = result?.template;
  const dos: string[] = template?.dos || template?.do_list || template?.do || [];
  const donts: string[] = template?.donts || template?.dont_list || template?.dont || template?.donot || [];
  const remedies = template?.remedies || template?.remedy || {};
  const mantra = remedies?.mantra || remedies?.mantras || template?.mantra;
  const ratna = remedies?.ratna || remedies?.gemstone || template?.ratna;
  const daan = remedies?.daan || remedies?.charity || template?.daan;

  return (
    <>
      <SiteNav />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Free Dasha Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Dasha Calculator — Vimshottari Mahadasha & Antardasha Online
          </h1>

          <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikal Vaani ka Free Dasha Calculator</strong> aapki current Vimshottari Mahadasha aur Antardasha Swiss Ephemeris se calculate karta hai. Date of birth, time, aur place daalo — current dasha lord, next 5 mahadasha periods exact dates ke saath, Parashar Dos/Donts, aur 3 free remedies (Mantra, Ratna, Daan) turant milte hain. 100% free, BPHS classical rules ke according.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS Ch.46-49 · Lahiri Ayanamsha · Shadbala · Bhrigu Nandi</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}`, boxShadow: `0 0 30px ${GOLD_RGBA(0.08)}` }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Calculate Your Vimshottari Dasha (Free)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Name <span className="text-slate-500">(optional)</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name" className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={{ background: 'rgba(2,8,23,0.6)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#E5E7EB' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Gender <span className="text-slate-500">(optional)</span></label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={{ background: 'rgba(2,8,23,0.6)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#E5E7EB' }}>
                  <option value="">Select</option><option value="male">Male</option>
                  <option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Date of Birth <span className="text-red-400">*</span></label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={{ background: 'rgba(2,8,23,0.6)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#E5E7EB', colorScheme: 'dark' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Time of Birth <span className="text-red-400">*</span></label>
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={{ background: 'rgba(2,8,23,0.6)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#E5E7EB', colorScheme: 'dark' }} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-slate-300">Place of Birth <span className="text-red-400">*</span></label>
                <input ref={placeInputRef} type="text"
                  placeholder={mapsReady ? 'Start typing city name (e.g. Delhi, Mumbai, New York)' : mapsError ? `Error: ${mapsError}` : 'Loading location service...'}
                  autoComplete="off" className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={{ background: 'rgba(2,8,23,0.6)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#E5E7EB' }} />
                {form.latitude != null && form.longitude != null && (
                  <p className="text-xs text-green-400 mt-1">✓ Location captured: {form.place} (TZ {form.timezone > 0 ? '+' : ''}{form.timezone})</p>
                )}
                {!mapsReady && !mapsError && <p className="text-xs text-slate-500 mt-1">Loading Google location search...</p>}
                {mapsError && <p className="text-xs text-red-400 mt-1">⚠️ {mapsError}. Please refresh the page.</p>}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>{error}</div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="mt-5 w-full md:w-auto px-8 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }}>
              {loading ? 'Calculating Dasha...' : '🪐 Calculate Free Dasha'}
            </button>

            <p className="text-xs text-slate-500 mt-3">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Shadbala · Bhrigu Nandi</p>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">
              <div className="rounded-2xl p-5 md:p-7" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <h3 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪐 {form.name ? `${form.name}'s ` : ''}Current Dasha</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DashaCard label="Mahadasha (Major Period)" lord={currentMahadasha} start={mahaStart} end={mahaEnd} icon="🌟" />
                  <DashaCard label="Antardasha (Sub Period)" lord={currentAntardasha} start={antarStart} end={antarEnd} icon="✨" />
                </div>
                <p className="text-xs text-slate-400 mt-4 italic">Vimshottari Dasha system — 120 saal ka cycle, Parashar BPHS Chapter 46-49 ke aadhar par.</p>
              </div>

              {nextFive.length > 0 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>📅 Next 5 Mahadasha Periods</h3>
                  <div className="space-y-3">
                    {nextFive.map((d: any, i: number) => (
                      <TimelineRow key={i} index={i + 1} lord={d.lord || d.planet || d.name} start={d.start || d.start_date} end={d.end || d.end_date} years={d.years || d.duration_years || d.duration} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-4 italic">Surya 6 · Chandra 10 · Mangal 7 · Rahu 18 · Guru 16 · Shani 19 · Budh 17 · Ketu 7 · Shukra 20 (saal)</p>
                </div>
              )}

              {(dos.length > 0 || donts.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ 3 Dos (Parashar Niyam)</h4>
                    {dos.length > 0 ? (
                      <ul className="space-y-2 text-sm text-slate-300">
                        {dos.slice(0, 3).map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{d}</span></li>)}
                      </ul>
                    ) : <p className="text-sm text-slate-500">Loading...</p>}
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#FCA5A5' }}>❌ 3 Donts (Parashar Vivarjan)</h4>
                    {donts.length > 0 ? (
                      <ul className="space-y-2 text-sm text-slate-300">
                        {donts.slice(0, 3).map((d, i) => <li key={i} className="flex gap-2"><span className="text-red-400">•</span><span>{d}</span></li>)}
                      </ul>
                    ) : <p className="text-sm text-slate-500">Loading...</p>}
                  </div>
                </div>
              )}

              {(mantra || ratna || daan) && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>🪔 Your 3 Free Remedies (Parashar)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mantra && <Remedy icon="🔱" title="Mantra" content={typeof mantra === 'string' ? mantra : JSON.stringify(mantra)} />}
                    {ratna && <Remedy icon="💎" title="Ratna" content={typeof ratna === 'string' ? ratna : JSON.stringify(ratna)} />}
                    {daan && <Remedy icon="🙏" title="Daan" content={typeof daan === 'string' ? daan : JSON.stringify(daan)} />}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PILLAR CONTENT */}
          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Vimshottari Dasha Kya Hai? — Parashar Ka 120 Saal Ka Chakra</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vimshottari Dasha Vedic Jyotish ka sabse precise predictive system hai. Maharishi Parashar ne <em>BPHS Chapter 46-49</em> mein iska poora vivran diya hai. "Vimshottari" ka arth hai "120" — yeh dasha cycle 120 saal ka hota hai, jismein 9 grah baari-baari aapke jeevan par rule karte hain.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Janm samay Chandra jis Nakshatra mein hota hai — uska lord aapki <strong style={{ color: GOLD }}>pehli Mahadasha</strong> banta hai. Phir Vimshottari sequence ke according agle grahon ki dashayein chalti hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>9 Grahon Ki Mahadasha Period</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 not-prose">
              {[
                { p: 'Ketu', y: 7, desc: 'Spiritual, vairagya' },
                { p: 'Shukra', y: 20, desc: 'Love, luxury, marriage' },
                { p: 'Surya', y: 6, desc: 'Authority, govt' },
                { p: 'Chandra', y: 10, desc: 'Mann, mother, emotions' },
                { p: 'Mangal', y: 7, desc: 'Energy, property' },
                { p: 'Rahu', y: 18, desc: 'Foreign, sudden rise' },
                { p: 'Guru', y: 16, desc: 'Wisdom, children, dharma' },
                { p: 'Shani', y: 19, desc: 'Karma, discipline' },
                { p: 'Budh', y: 17, desc: 'Intellect, business' },
              ].map((g) => (
                <div key={g.p} className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.5)', border: `1px solid ${GOLD}33` }}>
                  <div className="font-bold" style={{ color: GOLD }}>{g.p} <span className="text-slate-400 font-normal">— {g.y} saal</span></div>
                  <div className="text-xs text-slate-400 mt-1">{g.desc}</div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Mahadasha vs Antardasha vs Pratyantar — 3 Levels</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Mahadasha (L1):</strong> Sabse bada period. Overall life direction.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Antardasha / Bhukti (L2):</strong> Mahadasha ke andar sub-period. Year-by-year prediction.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Pratyantar (L3):</strong> Antardasha ke andar sub-sub-period. Month-level precision.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikal Vaani vs AstroSage vs AstroTalk Dasha Calculator</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Feature</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Trikal Vaani</th>
                    <th className="p-3 text-left text-slate-400">Others</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Parashar Dos/Donts</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Mantra+Ratna+Daan</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Next 5 Dasha Timeline</td><td className="p-3" style={{ color: GOLD }}>✓ With dates</td><td className="p-3 text-slate-500">Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Shadbala Strength</td><td className="p-3" style={{ color: GOLD }}>✓ Included</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Dasha Calculator</h2>
            <div className="space-y-3">
              {FAQS_DISPLAY.map((faq, i) => (
                <details key={i} className="p-4 rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra Finder' },
                { slug: 'free-rashi-calculator', name: 'Rashi Calculator' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Check' },
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh' },
              ].map((c) => (
                <Link key={c.slug} href={`/calculators/${c.slug}`}
                  className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: GOLD }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

function DashaCard({ icon, label, lord, start, end }: { icon: string; label: string; lord: any; start: any; end: any }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="text-2xl font-bold mb-2" style={{ color: GOLD }}>{lord || '—'}</div>
      {(start || end) && (
        <div className="text-xs text-slate-400 space-y-0.5">
          {start && <div>Start: <span className="text-slate-300">{formatDate(start)}</span></div>}
          {end && <div>End: <span className="text-slate-300">{formatDate(end)}</span></div>}
        </div>
      )}
    </div>
  );
}

function TimelineRow({ index, lord, start, end, years }: { index: number; lord: any; start: any; end: any; years: any }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: GOLD_RGBA(0.2), color: GOLD, border: `1px solid ${GOLD_RGBA(0.4)}` }}>{index}</div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm" style={{ color: GOLD }}>{lord || '—'} Mahadasha</div>
        <div className="text-xs text-slate-400 mt-0.5">
          {start && <span>{formatDate(start)}</span>}
          {start && end && <span> → </span>}
          {end && <span>{formatDate(end)}</span>}
          {years && <span className="ml-2 text-slate-500">({years} saal)</span>}
        </div>
      </div>
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

function formatDate(d: any): string {
  if (!d) return '';
  if (typeof d === 'string') {
    try {
      const dt = new Date(d);
      if (!isNaN(dt.getTime())) return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      return d;
    } catch { return d; }
  }
  return String(d);
}
