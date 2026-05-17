'use client';

// ============================================================
// File: app/calculators/free-nakshatra-calculator/page.tsx
// Purpose: Free Nakshatra Calculator — working form + result + content
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
    nakshatra: string | null;
    pada: number | null;
    [key: string]: any;
  };
  kundali: any;
  template: any;
}

// 27 Nakshatra reference (Parashar BPHS) — fallback enrichment
const NAKSHATRA_DATA: Record<string, any> = {
  'Ashwini':       { lord: 'Ketu',    deity: 'Ashwini Kumaras', symbol: 'Horse head',     gana: 'Deva',     yoni: 'Horse',    nadi: 'Aadi',   trait: 'Healer, swift, pioneering' },
  'Bharani':       { lord: 'Shukra',  deity: 'Yama',            symbol: 'Yoni',           gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya', trait: 'Bearer, transformative, intense' },
  'Krittika':      { lord: 'Surya',   deity: 'Agni',            symbol: 'Razor/Flame',    gana: 'Rakshasa', yoni: 'Sheep',    nadi: 'Antya',  trait: 'Sharp, purifying, leader' },
  'Rohini':        { lord: 'Chandra', deity: 'Brahma',          symbol: 'Chariot',        gana: 'Manushya', yoni: 'Serpent',  nadi: 'Antya',  trait: 'Beautiful, creative, magnetic' },
  'Mrigashira':    { lord: 'Mangal',  deity: 'Soma',            symbol: 'Deer head',      gana: 'Deva',     yoni: 'Serpent',  nadi: 'Madhya', trait: 'Seeker, curious, gentle' },
  'Ardra':         { lord: 'Rahu',    deity: 'Rudra',           symbol: 'Teardrop',       gana: 'Manushya', yoni: 'Dog',      nadi: 'Aadi',   trait: 'Stormy, transformative, intense' },
  'Punarvasu':     { lord: 'Guru',    deity: 'Aditi',           symbol: 'Bow & quiver',   gana: 'Deva',     yoni: 'Cat',      nadi: 'Aadi',   trait: 'Renewer, optimistic, philosophical' },
  'Pushya':        { lord: 'Shani',   deity: 'Brihaspati',      symbol: 'Cow udder',      gana: 'Deva',     yoni: 'Sheep',    nadi: 'Madhya', trait: 'Nurturing, scholarly, most auspicious' },
  'Ashlesha':      { lord: 'Budh',    deity: 'Nagas',           symbol: 'Coiled snake',   gana: 'Rakshasa', yoni: 'Cat',      nadi: 'Antya',  trait: 'Mystical, hypnotic, deep wisdom' },
  'Magha':         { lord: 'Ketu',    deity: 'Pitru',           symbol: 'Throne',         gana: 'Rakshasa', yoni: 'Rat',      nadi: 'Antya',  trait: 'Royal, ancestral, authoritative' },
  'Purva Phalguni':{ lord: 'Shukra',  deity: 'Bhaga',           symbol: 'Hammock',        gana: 'Manushya', yoni: 'Rat',      nadi: 'Madhya', trait: 'Pleasure-loving, creative, charming' },
  'Uttara Phalguni':{ lord:'Surya',   deity: 'Aryaman',         symbol: 'Bed',            gana: 'Manushya', yoni: 'Cow',      nadi: 'Aadi',   trait: 'Generous, helpful, leader' },
  'Hasta':         { lord: 'Chandra', deity: 'Savitar',         symbol: 'Hand/Fist',      gana: 'Deva',     yoni: 'Buffalo',  nadi: 'Aadi',   trait: 'Skilled, dexterous, witty' },
  'Chitra':        { lord: 'Mangal',  deity: 'Vishwakarma',     symbol: 'Pearl/Jewel',    gana: 'Rakshasa', yoni: 'Tiger',    nadi: 'Madhya', trait: 'Artistic, brilliant, attractive' },
  'Swati':         { lord: 'Rahu',    deity: 'Vayu',            symbol: 'Sword/Coral',    gana: 'Deva',     yoni: 'Buffalo',  nadi: 'Antya',  trait: 'Independent, diplomatic, restless' },
  'Vishakha':      { lord: 'Guru',    deity: 'Indra-Agni',      symbol: 'Triumphal arch', gana: 'Rakshasa', yoni: 'Tiger',    nadi: 'Antya',  trait: 'Ambitious, goal-driven, determined' },
  'Anuradha':      { lord: 'Shani',   deity: 'Mitra',           symbol: 'Lotus',          gana: 'Deva',     yoni: 'Deer',     nadi: 'Madhya', trait: 'Devoted, friendly, balanced' },
  'Jyeshtha':      { lord: 'Budh',    deity: 'Indra',           symbol: 'Earring',        gana: 'Rakshasa', yoni: 'Deer',     nadi: 'Aadi',   trait: 'Eldest, protective, occult-inclined' },
  'Mula':          { lord: 'Ketu',    deity: 'Nirriti',         symbol: 'Bundle of roots', gana: 'Rakshasa', yoni: 'Dog',     nadi: 'Aadi',   trait: 'Investigator, root-seeker, intense' },
  'Purva Ashadha': { lord: 'Shukra',  deity: 'Apah',            symbol: 'Fan/Tusk',       gana: 'Manushya', yoni: 'Monkey',   nadi: 'Madhya', trait: 'Invincible, persuasive, fearless' },
  'Uttara Ashadha':{ lord: 'Surya',   deity: 'Vishvedevas',     symbol: 'Elephant tusk',  gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya',  trait: 'Universal leader, righteous, victorious' },
  'Shravana':      { lord: 'Chandra', deity: 'Vishnu',          symbol: 'Ear',            gana: 'Deva',     yoni: 'Monkey',   nadi: 'Antya',  trait: 'Listener, learned, fame-oriented' },
  'Dhanishta':     { lord: 'Mangal',  deity: 'Vasus',           symbol: 'Drum/Flute',     gana: 'Rakshasa', yoni: 'Lion',     nadi: 'Madhya', trait: 'Musical, wealthy, rhythmic' },
  'Shatabhisha':   { lord: 'Rahu',    deity: 'Varuna',          symbol: 'Empty circle',   gana: 'Rakshasa', yoni: 'Horse',    nadi: 'Aadi',   trait: 'Healer, mystic, hundred-physicians' },
  'Purva Bhadrapada':{lord:'Guru',    deity: 'Aja Ekapada',     symbol: 'Two-faced man',  gana: 'Manushya', yoni: 'Lion',     nadi: 'Aadi',   trait: 'Transformative, fiery, dualistic' },
  'Uttara Bhadrapada':{lord:'Shani',  deity: 'Ahirbudhnya',     symbol: 'Serpent in deep', gana: 'Manushya', yoni: 'Cow',     nadi: 'Madhya', trait: 'Deep wisdom, mystical, kundalini' },
  'Revati':        { lord: 'Budh',    deity: 'Pushan',          symbol: 'Fish',           gana: 'Deva',     yoni: 'Elephant', nadi: 'Antya',  trait: 'Wealthy, kind, protector' },
};

const FAQS_DISPLAY = [
  { q: 'Nakshatra kya hota hai?', a: 'Nakshatra Vedic Jyotish ka sabse important unit hai. Aakash ko 27 equal divisions mein baata gaya hai. Aapka Janma Nakshatra wahi hai jismein aapke janm samay Chandra (Moon) sthit tha.' },
  { q: 'Janma Nakshatra kaise pata karein?', a: 'Date of Birth, exact Time of Birth, aur Place of Birth chahiye. Trikal Vaani Calculator mein details daalo aur 5 second mein result milega — bilkul free.' },
  { q: 'Pada kya hota hai?', a: 'Har Nakshatra ko 4 equal parts mein divide kiya gaya hai — inhe Pada kehte hain. 27 nakshatras × 4 padas = 108 micro-divisions.' },
  { q: 'Gana, Yoni, aur Nadi kya hai?', a: 'Gana 3 prakar ka (Deva, Manushya, Rakshasa) — swabhav. Yoni 14 prakar ki — primitive nature. Nadi 3 (Aadi, Madhya, Antya) — marriage compatibility ke liye.' },
  { q: 'Kya Nakshatra Calculator bilkul free hai?', a: 'Haan. 100% free. Nakshatra naam, Pada, lord, deity, symbol, gana, yoni, nadi, 3 Dos, 3 Donts, aur 3 remedies — sab free.' },
  { q: 'Nakshatra ka kya prabhav padta hai?', a: 'Aapka swabhav, career, marriage compatibility, Vimshottari Mahadasha sequence, aur auspicious muhurta — sab Janma Nakshatra se decide hote hain.' },
];

export default function FreeNakshatraCalculatorPage() {
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

  const nakshatra = result?.instant?.nakshatra
    || result?.kundali?.lagna?.nakshatra
    || result?.kundali?.grahas?.find((g: any) => g.planet === 'Moon')?.nakshatra
    || null;
  const pada = result?.instant?.pada
    || result?.kundali?.lagna?.pada
    || result?.kundali?.grahas?.find((g: any) => g.planet === 'Moon')?.pada
    || null;
  const nakDetails = nakshatra ? NAKSHATRA_DATA[nakshatra] || {} : {};
  const nakLord = result?.kundali?.nakshatra_details?.lord || result?.kundali?.lagna?.nakshatra_lord || nakDetails.lord || null;
  const nakDeity = result?.kundali?.nakshatra_details?.deity || nakDetails.deity || null;
  const nakSymbol = result?.kundali?.nakshatra_details?.symbol || nakDetails.symbol || null;
  const nakGana = result?.kundali?.nakshatra_details?.gana || nakDetails.gana || null;
  const nakYoni = result?.kundali?.nakshatra_details?.yoni || nakDetails.yoni || null;
  const nakNadi = result?.kundali?.nakshatra_details?.nadi || nakDetails.nadi || null;
  const nakTrait = result?.kundali?.nakshatra_details?.trait || nakDetails.trait || null;
  const chandraRashi = result?.instant?.chandra_rashi || result?.kundali?.grahas?.find((g: any) => g.planet === 'Moon')?.sign || null;

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
            <span style={{ color: GOLD }}>Free Nakshatra Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Nakshatra Calculator — Find Your Janma Nakshatra Online
          </h1>

          <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikal Vaani ka Free Nakshatra Calculator</strong> aapka Janma Nakshatra Swiss Ephemeris se calculate karta hai. Sirf date, time, aur place daalo — Nakshatra, Pada, ruling planet (lord), presiding deity, symbol, gana, yoni, nadi, personality traits, aur 3 free Parashar remedies (Mantra, Ratna, Daan) turant milte hain. 100% free, BPHS classical rules ke according.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS · Lahiri Ayanamsha · Shadbala · Bhrigu Nandi</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}`, boxShadow: `0 0 30px ${GOLD_RGBA(0.08)}` }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Janma Nakshatra (Free)</h2>

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
              {loading ? 'Finding Nakshatra...' : '⭐ Find My Nakshatra'}
            </button>

            <p className="text-xs text-slate-500 mt-3">🔒 100% Free · Swiss Ephemeris · Parashar BPHS · Shadbala · Bhrigu Nandi</p>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)} 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">{form.name ? `${form.name}'s ` : ''}Janma Nakshatra</div>
                <div className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: GOLD }}>⭐ {nakshatra || '—'}</div>
                {pada && <div className="text-base text-slate-300">Pada <span style={{ color: GOLD }} className="font-bold">{pada}</span> of 4</div>}
                {chandraRashi && <div className="text-sm text-slate-400 mt-2">Chandra Rashi: <span style={{ color: GOLD }}>{chandraRashi}</span></div>}
                {nakTrait && <div className="text-sm text-slate-300 mt-4 italic">"{nakTrait}"</div>}
              </div>

              <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h3 className="text-xl font-serif font-bold mb-5" style={{ color: GOLD }}>Nakshatra Details (Parashar BPHS)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <DetailCell icon="🪐" label="Ruling Planet (Lord)" value={nakLord} />
                  <DetailCell icon="🙏" label="Presiding Deity" value={nakDeity} />
                  <DetailCell icon="🔱" label="Symbol" value={nakSymbol} />
                  <DetailCell icon="✨" label="Gana (Nature)" value={nakGana} />
                  <DetailCell icon="🐾" label="Yoni (Animal)" value={nakYoni} />
                  <DetailCell icon="💨" label="Nadi (Dosha Check)" value={nakNadi} />
                </div>
                <p className="text-xs text-slate-500 mt-4 italic">27 nakshatras × 4 padas = 108 micro-divisions. Aapki Pada se aapka exact karma blueprint banta hai.</p>
              </div>

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
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Janma Nakshatra Kya Hota Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic Jyotish mein aakash ko 360 degree mein 27 equal divisions mein baata gaya hai — har division 13°20' ka hota hai. In 27 divisions ko Nakshatra kehte hain. Aapka <strong style={{ color: GOLD }}>Janma Nakshatra</strong> wahi hai jismein aapke janm samay Chandra (Moon) sthit tha. Maharishi Parashar ne <em>Brihat Parashara Hora Shastra (BPHS)</em> mein Nakshatra ko Vedic astrology ka <strong>foundation unit</strong> bataya hai — Rashi se bhi zyada important.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Nakshatra Ke 7 Mahatvapurn Attributes</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Har Nakshatra ke 7 important attributes hote hain:
            </p>
            <ul className="text-slate-300 space-y-2 mb-4 list-disc pl-6">
              <li><strong style={{ color: GOLD }}>Lord (Ruling Planet):</strong> 9 grahon mein se ek — Vimshottari Dasha decide karta hai.</li>
              <li><strong style={{ color: GOLD }}>Deity:</strong> Presiding devata — meditation aur worship ke liye.</li>
              <li><strong style={{ color: GOLD }}>Symbol:</strong> Visual identity — jaise Ashwini ka horse head, Pushya ka cow udder.</li>
              <li><strong style={{ color: GOLD }}>Gana:</strong> Deva, Manushya ya Rakshasa — swabhav aur compatibility.</li>
              <li><strong style={{ color: GOLD }}>Yoni:</strong> 14 animal categories — primitive nature aur sexual compatibility.</li>
              <li><strong style={{ color: GOLD }}>Nadi:</strong> Aadi, Madhya, Antya — marriage compatibility ka sabse zaroori check.</li>
              <li><strong style={{ color: GOLD }}>Pada:</strong> Har Nakshatra ka 1 of 4 quarters — micro-personality.</li>
            </ul>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>27 Nakshatras Ki List</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic astrology ke 27 Nakshatras hain — Ashwini, Bharani, Krittika, Rohini, Mrigashira, Ardra, Punarvasu, Pushya, Ashlesha, Magha, Purva Phalguni, Uttara Phalguni, Hasta, Chitra, Swati, Vishakha, Anuradha, Jyeshtha, Mula, Purva Ashadha, Uttara Ashadha, Shravana, Dhanishta, Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, aur Revati. Har Nakshatra ka apna unique blueprint hai — aur har Pada ke 4 alag-alag micro-personalities hote hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Nakshatra vs Rashi — Antar Kya Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Rashi (Zodiac Sign):</strong> Aakash ka 12-division system — har Rashi 30° ki hoti hai. Chandra Rashi sirf 12 options deti hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Nakshatra:</strong> Aakash ka 27-division system — har Nakshatra 13°20' ki hoti hai. Nakshatra Pada ke saath 108 micro-divisions deta hai — Rashi se 9 guna zyada precise.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Yahi reason hai ki Vedic astrology mein Nakshatra-based predictions Rashi-based predictions se zyada accurate maani jaati hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikal Vaani vs AstroSage vs AstroTalk Nakshatra Calculator</h2>
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
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">All 7 Attributes</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Paid</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Pada Calculation</td><td className="p-3" style={{ color: GOLD }}>✓ Precise</td><td className="p-3 text-slate-500">Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Parashar Dos/Donts</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">3 Free Remedies</td><td className="p-3" style={{ color: GOLD }}>✓ Mantra+Ratna+Daan</td><td className="p-3 text-slate-500">✗ Generic</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Nakshatra Calculator</h2>
            <div className="space-y-3">
              {FAQS_DISPLAY.map((faq, i) => (
                <details key={i} className="p-4 rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* INTERNAL LINKS */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
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

function DetailCell({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="font-bold text-base" style={{ color: GOLD }}>{value || '—'}</div>
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
