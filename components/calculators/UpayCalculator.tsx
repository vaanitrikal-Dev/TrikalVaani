'use client';

// ============================================================
// File: components/calculators/UpayCalculator.tsx   (NEW FILE)
// Version: v1.0 — 10 Oct 2026
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// ROHIIT KA DESIGN (10 Oct 2026, AskUserQuestion se pakka):
//   Ek page, 3 kadam:
//     1. Janm-vivran → FREE: Shadbala ka kamzor grah + 3 BPHS upay
//     2. "Kisi grah ke upay dekhein" — 9 grah chips, free mein us grah ke 3
//     3. ₹51 box — 2 samasya chuno (27 mein se) → Razorpay → /upay/<slug>
//        (10 alag upay, PDF download, WhatsApp share — Janam Kundali report jaisa)
//   Upay card: heading GOLDEN BOLD, baaki BOLD safed (UpayCard.tsx).
//   Grahak ko koi ANK nahi dikhta — sirf "kamzor" aur wajah.
// API: /api/calc/upay (free/grah) · /api/calc/upay/order · callback (redirect mode)
// ============================================================

import { useEffect, useState } from 'react';
import CityInput from '@/components/calculators/CityInput';
import UpayCard, { type UpayItem } from '@/components/calculators/UpayCard';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay-helper';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const GRAH: { id: string; hi: string }[] = [
  { id: 'Surya', hi: 'सूर्य' }, { id: 'Chandra', hi: 'चन्द्र' }, { id: 'Mangal', hi: 'मंगल' },
  { id: 'Budh', hi: 'बुध' }, { id: 'Guru', hi: 'गुरु' }, { id: 'Shukra', hi: 'शुक्र' },
  { id: 'Shani', hi: 'शनि' }, { id: 'Rahu', hi: 'राहु' }, { id: 'Ketu', hi: 'केतु' },
];

interface Samasya { slug: string; naam_hi?: string; naam_en?: string }

const inputStyle: React.CSSProperties = {
  background: '#0d1120', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', colorScheme: 'dark',
};

export default function UpayCalculator() {
  // ── form ──
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [noTime, setNoTime] = useState(false);
  const [city, setCity] = useState('');
  const [geo, setGeo] = useState<{ lat: number; lng: number; tz: number } | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // ── free result ──
  const [free, setFree] = useState<any>(null);
  const [grah, setGrah] = useState<string | null>(null);
  const [grahRes, setGrahRes] = useState<any>(null);
  const [grahLoading, setGrahLoading] = useState(false);

  // ── paid ──
  const [samasyaList, setSamasyaList] = useState<Samasya[]>([]);
  const [chuni, setChuni] = useState<string[]>([]);
  const [mobile, setMobile] = useState('');
  const [payErr, setPayErr] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetch('/api/calc/upay').then((r) => r.json()).then((d) => {
      if (Array.isArray(d?.samasya)) setSamasyaList(d.samasya);
    }).catch(() => {});
  }, []);

  function birth() {
    if (!date || (!time && !noTime) || !geo) return null;
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = (noTime ? '12:00' : time).split(':').map(Number);
    return {
      name: name.trim() || null, year: y, month: m, day: d, hour: hh, minute: mm,
      latitude: geo.lat, longitude: geo.lng, timezone: geo.tz, city, time_assumed: noTime,
    };
  }

  async function dekho(e?: React.FormEvent) {
    e?.preventDefault();
    setErr('');
    const b = birth();
    if (!b) { setErr('Janm ki tareekh, samay aur shehar (list se chun kar) bharein.'); return; }
    setLoading(true); setFree(null); setGrah(null); setGrahRes(null);
    try {
      const r = await fetch('/api/calc/upay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || 'Upay nahi mil paaye.');
      setFree(d);
      setTimeout(() => document.getElementById('upay-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (e: any) {
      setErr(e?.message || 'Kuch galat hua — dobara try karein.');
    } finally { setLoading(false); }
  }

  async function grahDekho(g: string) {
    const b = birth();
    if (!b) return;
    setGrah(g); setGrahRes(null); setGrahLoading(true);
    try {
      const r = await fetch('/api/calc/upay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...b, grah: g }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error);
      setGrahRes(d);
    } catch { setGrahRes({ upay: [], error: true }); } finally { setGrahLoading(false); }
  }

  function toggle(slug: string) {
    setChuni((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : c.length >= 2 ? [c[1], slug] : [...c, slug]));
  }

  async function pay() {
    setPayErr('');
    const b = birth();
    if (!b) { setPayErr('Pehle upar janm-vivran bharein.'); return; }
    if (chuni.length === 0) { setPayErr('Kam se kam ek samasya chuniye.'); return; }
    const mob = mobile.replace(/\D/g, '');
    if (mob.length < 10) { setPayErr('WhatsApp number (10 ank) bharein — report wahi bheji jaayegi.'); return; }
    setPaying(true);
    try {
      const r = await fetch('/api/calc/upay/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birth: b, samasya: chuni, mobile: mob, language: 'hinglish' }),
      });
      const o = await r.json();
      if (!r.ok) throw new Error(o?.error || 'Order nahi bana.');
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Payment page load nahi hua — internet check karein.');
      openRazorpayCheckout({
        keyId: o.keyId, orderId: o.orderId, amount: o.amount, currency: o.currency,
        name: 'Trikaal Vaani', description: o.description,
        prefillName: name || undefined, prefillContact: mob,
        themeColor: GOLD,
        // redirect mode — mobile UPI par tab band ho jaaye tab bhi report banti hai
        callbackUrl: `${window.location.origin}/api/calc/upay/callback`,
        onSuccess: () => {},
        onDismiss: () => setPaying(false),
      });
    } catch (e: any) {
      setPayErr(e?.message || 'Payment shuru nahi hua.');
      setPaying(false);
    }
  }

  const freeUpay: UpayItem[] = Array.isArray(free?.upay) ? free.upay : [];
  const grahUpay: UpayItem[] = Array.isArray(grahRes?.upay) ? grahRes.upay : [];

  return (
    <div className="mt-2">
      {/* ── KADAM 1: form ───────────────────────────────────────── */}
      <form onSubmit={dekho} className="rounded-2xl p-5 md:p-6"
        style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
        <h2 className="text-xl font-serif font-bold m-0 mb-4" style={{ color: GOLD }}>🔱 Apne Upay Dekhein — Muft</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm text-slate-300">Naam (optional)
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80}
              className="w-full mt-1 px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Aapka naam" />
          </label>
          <label className="text-sm text-slate-300">Janm tareekh *
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
              className="w-full mt-1 px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </label>
          <label className="text-sm text-slate-300">Janm samay *
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={noTime}
              className="w-full mt-1 px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            <span className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <input type="checkbox" checked={noTime} onChange={(e) => setNoTime(e.target.checked)} />
              Samay nahi pata (12:00 maana jaayega — lagna badal sakta hai)
            </span>
          </label>
          <div className="text-sm text-slate-300">Janm sthan *
            <div className="mt-1">
              <CityInput id="upay-city" value={city}
                onSelect={(c, lat, lng, tz) => { setCity(c); setGeo({ lat, lng, tz }); }} />
            </div>
          </div>
        </div>
        {err ? <p className="text-red-400 text-sm mt-3 mb-0">{err}</p> : null}
        <button type="submit" disabled={loading}
          className="mt-5 w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-sm"
          style={{ background: GOLD, color: '#080B12', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Kundali ban rahi hai…' : 'Mere Upay Dekhein'}
        </button>
      </form>

      {/* ── KADAM 2: free result ────────────────────────────────── */}
      {free ? (
        <section id="upay-result" className="mt-8 scroll-mt-24">
          <div className="rounded-xl p-4 mb-5" style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="m-0 text-base font-bold" style={{ color: GOLD }}>
              Aapka kamzor grah: {(free.kamzor_grah ?? []).filter((g: string) => !['Rahu', 'Ketu'].includes(g)).join(', ') || '—'}
            </p>
            <p className="m-0 mt-1 text-xs" style={{ color: '#94a3b8' }}>
              Shadbala (BPHS adhyay 27) se. {free?.dasha?.md ? `Abhi ${free.dasha.md} mahadasha mein ${free.dasha.ad} antardasha chal rahi hai.` : ''}
              {' '}Ye 3 upay Maharshi Parashar ke BPHS se hain.
            </p>
          </div>
          {freeUpay.map((u, i) => <UpayCard key={u.id ?? i} u={u} n={i + 1} />)}

          {/* grah chips */}
          <div className="rounded-xl p-4 mt-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>Kisi grah ke upay dekhein</h3>
            <div className="flex flex-wrap gap-2">
              {GRAH.map((g) => (
                <button key={g.id} type="button" onClick={() => grahDekho(g.id)}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={grah === g.id
                    ? { background: GOLD, color: '#080B12' }
                    : { background: 'transparent', color: '#e2e8f0', border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                  {g.hi} {g.id}
                </button>
              ))}
            </div>
            {grahLoading ? <p className="text-sm mt-3" style={{ color: GOLD }}>Upay aa rahe hain…</p> : null}
            {grah && grahRes ? (
              <div className="mt-4">
                {grahUpay.length === 0
                  ? <p className="text-sm text-slate-400">Abhi upay nahi mil paaye — thodi der baad try karein.</p>
                  : grahUpay.map((u, i) => <UpayCard key={u.id ?? i} u={u} n={i + 1} />)}
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>₹51 report mein is grah ke saare granth-upay khulte hain.</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── KADAM 3: ₹51 ─────────────────────────────────────────── */}
      <section className="mt-8 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: `2px solid ${GOLD_RGBA(0.45)}` }}>
        <h2 className="text-xl font-serif font-bold m-0 mb-1" style={{ color: GOLD }}>₹51 — Aapki 2 samasya ke 10 alag upay</h2>
        <p className="text-sm m-0 mb-4" style={{ color: '#cbd5e1' }}>
          Har upay alag: mantra, daan, seva, snaan, raksha-dhaaga… — Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana),
          BPHS aur Phaladeepika se. Aasaan, ghar par, kam kharche mein. Website par report + PDF download + WhatsApp share.
        </p>
        <p className="text-sm font-semibold m-0 mb-2 text-slate-200">Apni 2 samasya chuniye:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {samasyaList.length === 0 ? <span className="text-xs text-slate-500">Soochi aa rahi hai…</span> : null}
          {samasyaList.map((s) => {
            const on = chuni.includes(s.slug);
            return (
              <button key={s.slug} type="button" onClick={() => toggle(s.slug)}
                className="px-3 py-1.5 rounded-full text-sm"
                style={on
                  ? { background: GOLD, color: '#080B12', fontWeight: 700 }
                  : { background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)' }}>
                {on ? '✓ ' : ''}{s.naam_hi || s.slug}
              </button>
            );
          })}
        </div>
        <label className="text-sm text-slate-300 block mb-3">WhatsApp number (report ka link isi par)
          <input value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="numeric" maxLength={14}
            className="w-full sm:w-72 mt-1 px-4 py-2.5 rounded-lg text-sm outline-none block" style={inputStyle} placeholder="98XXXXXXXX" />
        </label>
        {payErr ? <p className="text-red-400 text-sm mt-1 mb-2">{payErr}</p> : null}
        <button type="button" onClick={pay} disabled={paying}
          className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-base"
          style={{ background: GOLD, color: '#080B12', opacity: paying ? 0.6 : 1 }}>
          {paying ? 'Payment khul raha hai…' : '₹51 Pay karein — 10 Upay Paayein'}
        </button>
        <p className="text-xs mt-2 mb-0" style={{ color: '#64748b' }}>
          🔒 Razorpay secured · UPI / Card / Netbanking · Upar janm-vivran zaroori hai
        </p>
      </section>
    </div>
  );
}
// END — components/calculators/UpayCalculator.tsx v1.0
