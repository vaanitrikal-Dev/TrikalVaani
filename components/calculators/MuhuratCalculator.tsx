'use client';

// ============================================================
// File: components/calculators/MuhuratCalculator.tsx
// Version: v1.5 — 23 September 2026 (BEST sabse upar, thappa bada aur bharwa)
// Rohiit, live dekhne ke baad: "Best date top par aaye, chahe tareekh koi
// bhi ho" — grahak sabse prabal din pehle dekhe, kyunki wahi bechne wali
// cheez hai. Aur thappa: bharwa rang, KAALA text, bada box aur bade akshar —
// pehle wo sunehri lakeer par halka sa dikhta tha aur nazar hi nahi aata tha.
//
// v1.4 — 23 September 2026 (raat ki khidki + "kab se kab tak")
// v1.4 — teen cheezein: (1) raat wali khidki par 🌙 ka nishan, kyunki vivah
// ka lagn aksar raat ka hota hai aur grahak ko farak dikhna chahiye;
// (2) grahak apni seema de sakta hai — "meri shaadi May mein hai" wala
// maamla; (3) samay ki khidkiyan ab teen se zyada bhi aa sakti hain.
//
// v1.3 — 23 September 2026 (form ke label SITE ke standard par)
// Do baar galti ki: v1.1 ke label Devanagari the, v1.2 mein Hinglish kar
// diye. Site ka asli standard YogCalculator.tsx mein hai aur wo teesra hai —
// LABEL ANGREZI ("Date of Birth *", "Place of Birth *") aur madad ki line
// HINGLISH ("Time pata nahi (12:00 PM maan lenge)"). Ab wahi laga hai,
// shabd-dar-shabd. Nateeje ke card Hinglish hi rahenge — wo padhne ki cheez
// hai, bharne ki nahi — aur darja ka thappa dono bhasha mein.
//
// GENDER JAAN-BOOJH KAR NAHI HAI (Rohiit ka faisla, 23 Sep): is engine mein
// gender kahin use hi nahi hota — Tara bala, Chandra bala, tithi, nakshatra,
// karan, koi bhi niyam gender nahi dekhta. Jo cheez use nahi karte, wo
// grahak se poochhna uska samay lena hai.
//
// v1.1 — DARK theme — site ke baaki calculator jaisa
// v1.0 safed/cream tha; site ka page #080B12 par hai aur YogCalculator ke card
// #0B0F1A par — safed card wahan chipka hua dikhta. Rang badle, dhaancha wahi.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
//
// SHUBH MUHURAT CALCULATOR ka poora UI. ALAG FILE, jaan-boojh kar:
// YogCalculator.tsx 1,534 line ka hai aur NAU chalte hue calculator chala
// raha hai. Muhurat ka nateeja bilkul alag shakal ka hai — 40 ka dropdown,
// doosra shehar, tareekhon ke card, samay ki khidkiyan. Usme thoosne se nau
// chalti hui cheezein khatre mein aatin.
//
// PAYMENT ka rasta purana hi: lib/razorpay-helper + /api/calc/yog/order
// (product 'muhurat', Rs 51 / $7) — naya payment code ek line bhi nahi.
//
// KOI NIYAM YAHAN NAHI HAI. Kaam ki soochi VM se (/api/calc/muhurat-shubh
// GET), tareekhein VM se (POST). Free/paid ki hadd bhi VM ke engine mein —
// is file mein sirf dikhana hai.
//
// DESIGN (Rohiit ne 23 Sep ko pakka kiya):
//   * thappa dono bhasha mein — SHRESHTH·BEST sunehra, ACHHA·GOOD hara,
//     THEEK·OK slate
//   * card par samay ki khidkiyan sabse bade akshar mein (yahi grahak
//     WhatsApp par bhejta hai)
//   * "yeh din kyun shubh hai" khol kar dekhne wala hissa, har wajah ke
//     saath uska SHLOK; parampara wali baat par saaf "parampara" label
//   * muft ke 6 card ke baad baaki DHUNDHLE + tala — Rohiit: "compel him
//     to pay for all dates"
//   * upar patti par grahak ka naam
// ============================================================

import { useState, useEffect, useRef } from 'react';
import CityInput from './CityInput';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay-helper';

// ── Rang ─────────────────────────────────────────────────────────────────────
const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;
const INK = '#E5E7EB';            // gehre par halka text
const CARD = '#0B0F1A';           // card ka background
const FIELD = '#0d1120';          // input ka background
const MUTED = '#94a3b8';          // halka text

const DARJA: Record<string, { hi: string; en: string; bg: string; fg: string; br: string }> = {
  // Bharwa rang + KAALA text (Rohiit, 23 Sep). Teeno par text #101010 —
  // teeno background itne halke hain ki kaala text 4.5:1 se upar rehta hai.
  shreshth: { hi: 'श्रेष्ठ', en: 'BEST', bg: GOLD,      fg: '#101010', br: '#F0CB58' },
  achha:    { hi: 'अच्छा',  en: 'GOOD', bg: '#6EE7A0',  fg: '#101010', br: '#8FF0BA' },
  theek:    { hi: 'ठीक',   en: 'OK',   bg: '#CBD5E1',  fg: '#101010', br: '#E2E8F0' },
};

const MAHINA_HI = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July',
  'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const VAAR_HI: Record<string, string> = {
  Ravivar: 'Ravivar', Somvar: 'Somvar', Mangalvar: 'Mangalvar', Budhvar: 'Budhvar',
  Guruvar: 'Guruvar', Shukravar: 'Shukravar', Shanivar: 'Shanivar',
};

interface Karma { slug: string; naam_hi: string; naam_en: string; samuh: string; srot_kism?: string; chetavni?: string | null; }
interface Khidki { se: string; tak: string; minute: number; kab?: 'din' | 'raat'; }
interface Wajah { kya: string; kyun?: string; granth?: string | null; srot: string; }
interface Tareekh {
  tareekh: string; vaar: string; darja: 'shreshth' | 'achha' | 'theek';
  tithi: string; nakshatra: string; karan: string; yoga: string;
  samay: { khirkiyan: Khidki[]; abhijit: { se: string; tak: string; saaf: boolean };
           bachein: Record<string, { se: string; tak: string }> };
  wajah: Wajah[]; dhyan: Wajah[];
}
interface Result {
  kaam: { slug: string; naam_hi: string; naam_en: string; chetavni?: string | null; srot?: string; srot_kism?: string };
  janma: { nakshatra: string; rashi: string };
  tareekhein: Tareekh[];
  darje: Record<string, number>;
  chhupi?: Record<string, number>; chhupi_kul?: number;
  kul_shubh?: number; mahine?: number; paid?: boolean;
}

// Dikhane ka kram — BEST sabse upar (Rohiit, 23 Sep)
const KRAM_UI: Record<string, number> = { shreshth: 0, achha: 1, theek: 2 };

const SAMUH_HI: Record<string, string> = {
  vivah: 'Vivah aur rishte', ghar: 'Ghar aur property', paisa: 'Paisa aur kaam-dhandha',
  vahan: 'Vahan', students: 'Padhai aur pariksha', naukri: 'Naukri',
  sanskar: 'Bachchon ke sanskar', yatra: 'Yatra', aaj: 'Aaj ke kaam', anya: 'Anya',
};

export default function MuhuratCalculator() {
  const [karmas, setKarmas] = useState<Karma[]>([]);
  const [form, setForm] = useState({
    name: '', karma: '', dob: '', tob: '', timeUnknown: false,
    placeQuery: '', city: '', latitude: null as number | null, longitude: null as number | null, timezone: 5.5,
    kaamQuery: '', kaamCity: '', kaamLat: null as number | null, kaamLon: null as number | null, kaamTz: null as number | null,
    kaamWahi: true,
    se: '', tak: '',          // grahak ki apni seema (optional)
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [data, setData] = useState<Result | null>(null);
  const [khula, setKhula] = useState<Record<string, boolean>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  // Kaam ki soochi — VM se, taaki naya kaam jodna sirf ek DB row ho
  useEffect(() => {
    fetch('/api/calc/muhurat-shubh')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.karma)) setKarmas(d.karma); })
      .catch(() => { /* soochi na aaye to dropdown khaali — error neeche dikh jayega */ });
  }, []);

  const chuna = karmas.find(k => k.slug === form.karma);

  const jaancho = () => {
    const e: Record<string, string> = {};
    if (!form.karma) e.karma = 'Kaunsa kaam hai, ye chuniye';
    if (!form.dob) e.dob = 'Janm tithi zaroori hai';
    if (!form.timeUnknown && !form.tob) e.tob = 'Janm samay daaliye, ya "samay nahi pata" chuniye';
    if (!form.city || form.latitude === null) e.city = 'Janm sthan soochi mein se chuniye';
    if (!form.kaamWahi && (form.kaamLat === null)) e.kaam = 'Kaam ka shehar soochi mein se chuniye';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const payload = (proof?: Record<string, string>) => {
    const [y, m, d] = form.dob.split('-').map(Number);
    const [hh, mm] = (form.timeUnknown ? '12:00' : form.tob).split(':').map(Number);
    return {
      karma: form.karma,
      year: y, month: m, day: d, hour: hh, minute: mm,
      latitude: form.latitude, longitude: form.longitude, timezone: form.timezone,
      kaam_lat: form.kaamWahi ? null : form.kaamLat,
      kaam_lon: form.kaamWahi ? null : form.kaamLon,
      kaam_tz: form.kaamWahi ? null : form.kaamTz,
      kaam_sthan: form.kaamWahi ? form.city : form.kaamCity,
      name: form.name || null,
      shuru: form.se || null,
      ant: form.tak || null,
      ...(proof ?? {}),
    };
  };

  const chalao = async (proof?: Record<string, string>) => {
    if (!proof && !jaancho()) return;
    setLoading(true); setApiError(null);
    try {
      const res = await fetch('/api/calc/muhurat-shubh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload(proof)),
      });
      const d = await res.json();
      if (!res.ok) { setApiError(d?.error || 'Kuch gadbad hui. Dobara koshish kijiye.'); return; }
      setData(d);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    } catch {
      setApiError('Jud nahi paye. Internet dekhiye aur dobara koshish kijiye.');
    } finally { setLoading(false); }
  };

  const payKarein = async () => {
    setApiError(null); setPaying(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) { setApiError('Payment window load nahi hui. Refresh karke dobara try karein.'); setPaying(false); return; }
      const oRes = await fetch('/api/calc/yog/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'muhurat' }),
      });
      const order = await oRes.json();
      if (!oRes.ok || !order.orderId) { setApiError(order.error || 'Order nahi ban paya.'); setPaying(false); return; }
      openRazorpayCheckout({
        keyId: order.keyId, orderId: order.orderId, amount: order.amount,
        currency: order.currency, name: 'Trikaal Vaani', description: order.description,
        prefillName: form.name || undefined,
        onSuccess: async (r: any) => {
          await chalao({
            razorpay_order_id: r.razorpay_order_id,
            razorpay_payment_id: r.razorpay_payment_id,
            razorpay_signature: r.razorpay_signature,
          });
          setPaying(false);
        },
        onDismiss: () => setPaying(false),
      });
    } catch { setApiError('Payment mein dikkat aayi. Dobara try karein.'); setPaying(false); }
  };

  const tareekhHi = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MAHINA_HI[m - 1]} ${y}`;
  };

  const whatsapp = (t: Tareekh) => {
    const k = data?.kaam.naam_hi ?? '';
    const w = t.samay.khirkiyan.map(x => `${x.se}–${x.tak}`).join(' , ');
    const txt = `🔱 ${k} ka shubh muhurat\n\n📅 ${tareekhHi(t.tareekh)} (${VAAR_HI[t.vaar] ?? t.vaar})\n⏰ Shubh samay: ${w}\n✨ Abhijit: ${t.samay.abhijit.se}–${t.samay.abhijit.tak}\n\n${t.nakshatra} · ${t.tithi} · ${t.karan} karan\nBrihat Samhita ke niyam se — trikalvaani.com/calculators/free-shubh-muhurat-calculator`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
  };

  const copy = (t: Tareekh) => {
    const w = t.samay.khirkiyan.map(x => `${x.se}–${x.tak}`).join(' , ');
    navigator.clipboard?.writeText(`${tareekhHi(t.tareekh)} — ${w}`);
  };

  // ── Ek tareekh ka card ─────────────────────────────────────────────────────
  const Card = ({ t, dhundhla }: { t: Tareekh; dhundhla?: boolean }) => {
    const D = DARJA[t.darja];
    const open = !!khula[t.tareekh];
    return (
      <div style={{
        border: `1px solid ${dhundhla ? 'rgba(255,255,255,0.07)' : D.br}`, borderRadius: 16, background: CARD,
        padding: '18px 18px 16px', marginBottom: 14,
        filter: dhundhla ? 'blur(5px)' : undefined,
        userSelect: dhundhla ? 'none' : undefined,
        pointerEvents: dhundhla ? 'none' : undefined,
      }} aria-hidden={dhundhla || undefined}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 2 }}>{VAAR_HI[t.vaar] ?? t.vaar}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: INK, lineHeight: 1.2 }}>{tareekhHi(t.tareekh)}</div>
          </div>
          <span style={{
            background: D.bg, color: D.fg, border: `1px solid ${D.br}`, borderRadius: 12,
            padding: '10px 18px', fontSize: 17, fontWeight: 800, whiteSpace: 'nowrap',
            letterSpacing: 0.3, boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
          }}>{D.hi} · {D.en}</span>
        </div>

        <div style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>
          {t.nakshatra} · {t.tithi} · {t.karan} karan
        </div>

        <div style={{ marginTop: 14, background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.18)}`, borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>⏰ Shubh samay</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
            {t.samay.khirkiyan.map((k, i) => (
              <span key={i} style={{ fontSize: 20, fontWeight: 700, color: INK, letterSpacing: 0.3 }}>
                {k.kab === 'raat' && <span style={{ fontSize: 14, marginRight: 4 }} title="raat ka samay">🌙</span>}
                {k.se} – {k.tak}
              </span>
            ))}
          </div>
          {t.samay.abhijit.saaf && (
            <div style={{ fontSize: 13, color: '#E9C862', marginTop: 8 }}>
              ✨ Abhijit muhurat: {t.samay.abhijit.se} – {t.samay.abhijit.tak}
            </div>
          )}
        </div>

        <button type="button" onClick={() => setKhula(p => ({ ...p, [t.tareekh]: !open }))}
          style={{
            marginTop: 12, background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer',
            color: '#E9C862', fontSize: 14, fontWeight: 600, minHeight: 44,
          }} aria-expanded={open}>
          {open ? '▾' : '▸'} Ye din kyun shubh hai
        </button>

        {open && (
          <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, paddingLeft: 2 }}>
            {t.wajah.map((w, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                • <strong>{w.kya}</strong>{w.kyun ? ` — ${w.kyun}` : ''}
                {w.granth && <span style={{ color: '#E9C862' }}> · बृहत्संहिता {String(w.granth).replace('brihatsamhita ', '')}</span>}
                {w.srot === 'parampara' && <span style={{ color: MUTED }}> · (parampara)</span>}
                {w.srot === 'granth-tarjuma' && <span style={{ color: MUTED }}> · (angrezi tarjume se)</span>}
              </div>
            ))}
            {t.dhyan.length > 0 && t.dhyan.map((w, i) => (
              <div key={`d${i}`} style={{ marginTop: 6, color: '#E9C862' }}>
                ⚠ {w.kya} <span style={{ color: MUTED }}>(parampara — granth ka niyam nahi)</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => whatsapp(t)} style={{
            background: '#25D366', color: '#fff', border: 'none', borderRadius: 10,
            padding: '11px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44,
          }}>WhatsApp par bhejein</button>
          <button type="button" onClick={() => copy(t)} style={{
            background: 'rgba(255,255,255,0.04)', color: INK, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10,
            padding: '11px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44,
          }}>Samay copy karein</button>
        </div>
      </div>
    );
  };

  // ── Form + nateeja ─────────────────────────────────────────────────────────
  const samuhWise = karmas.reduce<Record<string, Karma[]>>((a, k) => {
    (a[k.samuh] ||= []).push(k); return a;
  }, {});

  const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#E5E7EB', marginBottom: 6 };
  const input: React.CSSProperties = {
    width: '100%', padding: '12px 14px', fontSize: 16, borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.10)', background: FIELD, color: '#e2e8f0', minHeight: 46, colorScheme: 'dark',
  };
  const errText = (m?: string) => m ? <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 4 }}>{m}</div> : null;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* ── FORM ─────────────────────────────────────────────────────────── */}
      <div style={{ background: CARD, border: `1px solid ${GOLD_RGBA(0.25)}`, borderRadius: 18, padding: 22 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={label} htmlFor="mu-karma">Which work do you need a muhurat for? *</label>
          <select id="mu-karma" style={input} value={form.karma}
            onChange={e => setForm(p => ({ ...p, karma: e.target.value }))}>
            <option value="">Select the work</option>
            {Object.keys(SAMUH_HI).filter(s => samuhWise[s]?.length).map(s => (
              <optgroup key={s} label={SAMUH_HI[s]}>
                {samuhWise[s].map(k => <option key={k.slug} value={k.slug}>{k.naam_hi}</option>)}
              </optgroup>
            ))}
          </select>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 5 }}>
            Har kaam ka apna nakshatra, tithi aur karan hai — granth se.
          </div>
          {errText(errors.karma)}
          {chuna?.chetavni && (
            <div style={{
              marginTop: 10, background: 'rgba(212,175,55,0.10)', border: `1px solid ${GOLD}55`,
              borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#E9C862', lineHeight: 1.6,
            }}>⚠ {chuna.chetavni}</div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={label} htmlFor="mu-name">Naam (optional)</label>
          <input id="mu-name" style={input} value={form.name} autoComplete="name"
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={label} htmlFor="mu-dob">Date of Birth *</label>
            <input id="mu-dob" type="date" style={input} value={form.dob}
              onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} />
            {errText(errors.dob)}
          </div>
          <div>
            <label style={label} htmlFor="mu-tob">Time of Birth *</label>
            <input id="mu-tob" type="time" style={input} value={form.tob} disabled={form.timeUnknown}
              onChange={e => setForm(p => ({ ...p, tob: e.target.value }))} />
            {errText(errors.tob)}
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 5 }}>
              Samay se Chandra ki sthiti pakki hoti hai — usi par Tara aur Chandra bala tikti hai.
            </div>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1', marginBottom: 16, minHeight: 44 }}>
          <input type="checkbox" checked={form.timeUnknown}
            onChange={e => setForm(p => ({ ...p, timeUnknown: e.target.checked }))} />
          Time pata nahi (12:00 PM maan lenge)
        </label>

        <div style={{ marginBottom: 16 }}>
          <label style={label} htmlFor="mu-city">Place of Birth *</label>
          <CityInput id="mu-city" value={form.placeQuery} error={errors.city}
            onSelect={(city, lat, lng, tz) =>
              setForm(p => ({ ...p, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz }))} />
        </div>

        {/* काम कहाँ होगा — शुभ समय शहर से बदलता है */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#E5E7EB', fontWeight: 600, minHeight: 44 }}>
            <input type="checkbox" checked={form.kaamWahi}
              onChange={e => setForm(p => ({ ...p, kaamWahi: e.target.checked }))} />
            Work is in the same city as birth
          </label>
          {!form.kaamWahi && (
            <div style={{ marginTop: 10 }}>
              <label style={label} htmlFor="mu-kaam-city">Place of the Event *</label>
              <CityInput id="mu-kaam-city" value={form.kaamQuery} error={errors.kaam}
                onSelect={(city, lat, lng, tz) =>
                  setForm(p => ({ ...p, kaamQuery: city, kaamCity: city, kaamLat: lat, kaamLon: lng, kaamTz: tz }))} />
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                Shubh samay suryoday se banta hai, aur suryoday har shehar mein alag hota hai.
              </div>
            </div>
          )}
        </div>

        {/* Kab se kab tak — optional. "Meri shaadi May mein hai" wala maamla. */}
        <div style={{ marginBottom: 18 }}>
          <label style={label}>Date range (optional)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <input type="date" style={input} value={form.se} aria-label="From date"
              onChange={e => setForm(p => ({ ...p, se: e.target.value }))} />
            <input type="date" style={input} value={form.tak} aria-label="To date"
              onChange={e => setForm(p => ({ ...p, tak: e.target.value }))} />
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 5 }}>
            Khaali chhod dein to aaj se agle {'{'}3{'}'} mahine. Kisi khaas mahine ki tareekhein
            chahiye to yahan seema daal dijiye.
          </div>
        </div>

        <button type="button" onClick={() => chalao()} disabled={loading}
          style={{
            width: '100%', background: loading ? '#c9b46a' : GOLD, color: '#2a2118', border: 'none',
            borderRadius: 12, padding: '16px 20px', fontSize: 17, fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer', minHeight: 52,
          }}>
          {loading ? 'Granth ke niyam lagaye ja rahe hain…' : 'Shubh Muhurat Dekhein'}
        </button>

        <div style={{ fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 10 }}>
          Muft · koi login nahi · niyam Brihat Samhita adhyay 97-99 se
        </div>

        {apiError && (
          <div style={{ marginTop: 14, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#fca5a5' }}>
            {apiError}
          </div>
        )}
      </div>

      {/* ── NATEEJA ──────────────────────────────────────────────────────── */}
      {data && (
        <div ref={resultRef} style={{ marginTop: 30 }}>

          <div style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.25)}`, borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 15, color: INK, fontWeight: 700 }}>
              {form.name ? `${form.name} ji, ` : ''}{data.kaam.naam_hi} ke liye
              agle {data.mahine ?? 3} mahine mein {data.tareekhein.length} shubh tareekhein
            </div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>
              {(['shreshth', 'achha', 'theek'] as const)
                .map(d => `${data.tareekhein.filter(t => t.darja === d).length} ${DARJA[d].en}`)
                .join(' · ')} — aapka janm nakshatra {data.janma.nakshatra}, raashi {data.janma.rashi}
            </div>
            {data.kaam.chetavni && (
              <div style={{ fontSize: 13, color: '#E9C862', marginTop: 10, lineHeight: 1.6 }}>⚠ {data.kaam.chetavni}</div>
            )}
          </div>

          {/* ⭐ v1.5 — BEST pehle, phir GOOD, phir OK; har darje ke andar
              tareekh ke kram se. Engine tareekh ke kram se bhejta hai;
              badalna yahan hai, kyunki ye dikhane ki baat hai. */}
          {[...data.tareekhein]
            .sort((a, b) => (KRAM_UI[a.darja] - KRAM_UI[b.darja])
                          || a.tareekh.localeCompare(b.tareekh))
            .map(t => <Card key={t.tareekh} t={t} />)}

          {!data.paid && (data.chhupi_kul ?? 0) > 0 && (
            <div style={{ position: 'relative', marginTop: 4 }}>
              {/* dhundhle card — grahak ko dikhta hai ki sach mein aur tareekhein hain */}
              <div>
                {[...data.tareekhein]
                  .sort((a, b) => (KRAM_UI[a.darja] - KRAM_UI[b.darja])
                                || a.tareekh.localeCompare(b.tareekh))
                  .slice(0, 3).map((t, i) => (
                  <Card key={`blur${i}`} t={t} dhundhla />
                ))}
              </div>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: 16,
              }}>
                <div style={{
                  background: '#0B0F1A', border: `1px solid ${GOLD}`, borderRadius: 18,
                  padding: '22px 22px 20px', maxWidth: 460, textAlign: 'center',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.55)',
                }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>🔒</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: INK, lineHeight: 1.4 }}>
                    Aapki kundali mein agle 12 mahine ki aur tareekhein hain
                  </div>
                  <div style={{ fontSize: 14, color: '#cbd5e1', marginTop: 10, lineHeight: 1.7 }}>
                    Har tareekh par shubh samay, har niyam ke saath granth ka shlok,
                    aur aapke liye graha-shanti ke upay.
                  </div>
                  <button type="button" onClick={payKarein} disabled={paying}
                    style={{
                      marginTop: 16, width: '100%', background: paying ? '#c9b46a' : GOLD,
                      color: '#2a2118', border: 'none', borderRadius: 12, padding: '15px 18px',
                      fontSize: 17, fontWeight: 700, cursor: paying ? 'wait' : 'pointer', minHeight: 52,
                    }}>
                    {paying ? 'Payment khul rahi hai…' : 'Poori soochi dekhein — ₹51'}
                  </button>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 10 }}>
                    Ek baar ka bhugtaan · Razorpay se surakshit · turant khul jayega
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.paid && (
            <div style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: 12, padding: '14px 16px', fontSize: 14, color: '#86efac', marginTop: 6 }}>
              ✓ Poori soochi khul gayi — agle 12 mahine ki saari shubh tareekhein upar hain.
            </div>
          )}

          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.8, marginTop: 22, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14 }}>
            Niyam Brihat Samhita adhyay 97 (nakshatra), 98 (tithi) aur 99 (karan) se; jo niyam
            granth mein nahi hai uspar &ldquo;parampara&rdquo; likha jaata hai. Ye shubh samay ka
            chunav hai, bhavishyavani nahi.
          </div>
        </div>
      )}
    </div>
  );
}
