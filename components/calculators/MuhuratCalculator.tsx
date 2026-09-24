'use client';

// ============================================================
// File: components/calculators/MuhuratCalculator.tsx
// Version: v2.1 — 23 September 2026 (POORI SOOCHI WhatsApp par + space fix)
// Rohiit ne live dekh kar do baatein kahin:
//   1. Banner mein shabd chipke the — "vivah ke liyeagle 45 din mein". JSX
//      mein nayi line ke baad {IIFE} aaya to beech ka space gir gaya.
//   2. "Hum ek-ek date WhatsApp karne ka option de rahe hain — POORI LIST
//      bhejne ka option do, aur ise marketing feature ki tarah likho."
//      Sahi baat: muhurat ki tareekh ghar mein sab milkar chunte hain, aur
//      jo soochi pariwar ke group mein chali jaati hai wo hamara naam bhi
//      saath le jaati hai. Ab nateeje ke sabse upar ek bada button hai jo
//      saari tareekhein ek sandesh mein bhej deta hai, aur uske neeche ek
//      line jo saaf kehti hai ki ye ghar walon ko bheja ja sakta hai.
//      Sandesh ki hadd: 20 tareekh tak (WhatsApp ka URL bahut lamba ho to
//      kuch phone use kaat dete hain) — usse zyada par "aur X tareekhein"
//      likh kar link chala jaata hai.
//
// v2.0 — seema 45 din / 6 mahine
// Rohiit: "bahut lambi list ho jayegi, abhi bhi bahut lambi hai." Ab muft
// 45 din ki soochi aur paid 180 din (6 mahine) ki — paid mein lagbhag 30
// tareekhein, pehle 63 tak chali jaati thi. Banner ab engine ka seema_din
// padhta hai, apna andaza nahi lagata: pehle wo "agle 3 mahine" likh deta
// tha jabki khidki 45 din ki hoti.
//
// v1.9 — UPAY ka block, Hinglish, sach ka label
//
// v1.9 — karak grah ka label sudhra. Card par likha tha "Karak grah BPHS ke
//   karakatva se" — par library kholkar dekha: BPHS adhyay 32 CHARA karak
//   ka hai (Atmakarak, Jaimini paddhati), aur naisargik karak ki saaf soochi
//   (Shukra = kalatra, Mangal = bhoomi) BPHS e-text mein kahin nahi hai.
//   Bina shlok ke granth ka dawa nahi karte, isliye ab saaf "parampara".
//   Upay ka text bhi ab Hinglish mein aata hai (engine v1.9 + planet_remedies
//   ke naye Hinglish khaane) — pehle beech mein angrezi aa jaati thi.
//
// v1.8 — UPAY ka block juda (sirf paid; engine muft jawab mein upay ki key
//   bhejta hi nahi) aur "(agli subah)" ka bug theek: pehle wo sirf tab lagta
//   tha jab khidki ka ant shuruaat se chhota ho, isliye 00:18-01:16 jaisi
//   khidki chhut jaati thi. Ab engine har khidki par se_agli/tak_agli bhejta
//   hai aur UI usi par chalta hai.
//   (Ye header us waqt likha nahi ja saka — script beech mein ruk gayi thi,
//    aur aakhri audit mein pakda gaya.)
//
// v1.7 — CityInput bilkul nahi chhua
// Rohiit: "agar A doosre calculator ko affect kar sakta hai to B" — yani
// sajha CityInput.tsx mein ek optional placeholder tak nahi jodna. Wo file
// paanch chalte hue calculator (Gemstone, Kundali, Yog…) chala rahi hai, aur
// unka risk lene layak ye chhoti si baat nahi thi. Event wale box par
// placeholder "Type city of birth…" hi rahega; uske neeche ki line saaf
// batati hai ki box kis cheez ke liye hai.
//
// v1.6 — 23 September 2026 (event location khula, date range HATAYA)
// Rohiit ne live dekh kar teen baatein pakdin, teeno sahi:
//   1. "Work is in the same city as birth" wala checkbox tick tha, isliye
//      event ka shehar CHHUPA rehta tha — grahak ko uncheck karna padta.
//      Ab checkbox hai hi nahi: "Event / Program / Exam Location" HAMESHA
//      dikhta hai aur janm-sthan chunte hi apne aap bhar jaata hai.
//   2. DATE RANGE hataya. Rohiit: "iska koi usage nahi". Aur usse bhi badi
//      baat — wo MUFT KI DEEWAR TOD DETA tha: grahak shuru=May 2027 dal kar
//      muft mein teen mahine dekhta, phir Aug se teen, phir Nov se — yani
//      poora saal muft. Engine mein seema ka sahara bana rahega (route bhi
//      bhejta hai), par form se wo khaana hataya gaya.
//   3. RAAT ka sach: raat ki khidki DIN ke panchang par nahi, raat ke apne
//      panchang par milti hai — card ab ye saaf likhta hai. Aur jo khidki
//      aadhi raat ke paar jaati hai (22:26-02:17) uspar "agli subah" likha
//      aata hai, warna grahak usi din 2 baje samajh leta.
//
// v1.5 — 23 September 2026 (BEST sabse upar, thappa bada aur bharwa)
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
interface Khidki {
  se: string; tak: string; minute: number;
  kab?: 'din' | 'raat';
  se_agli?: boolean;   // khidki aadhi raat ke BAAD shuru hoti hai
  tak_agli?: boolean;  // khidki aadhi raat ke BAAD khatam hoti hai
}

interface Upay {
  grah: string; grah_hi: string; kyun: string;
  din: string; mantra: string; daan: string; rang: string;
  upay: string[]; srot_kism: string; upay_srot_kism: string;
}
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
  seema_din?: number;     // engine kitne din jaanche (45 muft / 180 paid)
  upay?: Upay[];          // sirf paid mein aata hai (engine v1.8)
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
    if (form.kaamLat === null) e.kaam = 'Event ka shehar soochi mein se chuniye';
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
      kaam_lat: form.kaamLat,
      kaam_lon: form.kaamLon,
      kaam_tz: form.kaamTz,
      kaam_sthan: form.kaamCity || form.city,
      name: form.name || null,
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

  // ⭐ v2.1 — POORI SOOCHI ek sandesh mein. Muhurat ka faisla ghar mein
  // milkar hota hai, isliye soochi ka pariwar ke group tak pahunchna hi
  // asli kaam hai — aur wahan hamara naam bhi saath jaata hai.
  const SANDESH_HADD = 20;   // isse zyada par link; bahut lamba URL kuch phone kaat dete hain
  const whatsappSab = () => {
    if (!data) return;
    const din = data.seema_din ?? 45;
    const kitna = din >= 150 ? `${Math.round(din / 30)} mahine` : `${din} din`;
    const soochi = [...data.tareekhein]
      .sort((a, b) => a.tareekh.localeCompare(b.tareekh))
      .slice(0, SANDESH_HADD)
      .map(t => {
        const D = DARJA[t.darja];
        const w = t.samay.khirkiyan
          .map(x => `${x.kab === 'raat' ? '🌙' : ''}${x.se}–${x.tak}`)
          .join(', ');
        return `📅 ${tareekhHi(t.tareekh)} (${VAAR_HI[t.vaar] ?? t.vaar}) — ${D.hi} · ${D.en}\n⏰ ${w}`;
      })
      .join('\n\n');
    const bacha = data.tareekhein.length - SANDESH_HADD;
    const txt =
      `🔱 *${data.kaam.naam_hi}* ke shubh muhurat — agle ${kitna}\n` +
      `(janm nakshatra ${data.janma.nakshatra}, raashi ${data.janma.rashi})\n\n` +
      `${soochi}\n\n` +
      (bacha > 0 ? `…aur ${bacha} tareekhein — poori soochi neeche wale link par.\n\n` : '') +
      `Ye tareekhein kisi aam soochi se nahi — isi kundali se chuni gayi hain, ` +
      `Brihat Samhita (adhyay 97-99) ke niyam se.\n` +
      `Apni kundali se apni tareekhein: trikalvaani.com/calculators/free-shubh-muhurat-calculator`;
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
            {t.samay.khirkiyan.map((k, i) => {
              // Aadhi raat ke paar (22:26 – 02:17) — tareekh badal chuki hai.
              // Bina likhe grahak usi din dopahar/raat 2 baje samajh leta.
              // Engine hi batata hai ki khidki agle din mein girti hai.
              // Pehle yahan samay ki string ki tulna thi (k.tak < k.se) — usse
              // 00:18-01:16 jaisi khidki, jo POORI ki poori aadhi raat ke baad
              // hai, chhut jaati thi aur grahak use usi din ki raat samajhta.
              // (Ye sudhaar v1.8 mein likha gaya tha par script beech mein ruk
              //  gayi thi; aakhri audit mein pakda gaya.)
              const paar = k.tak_agli ?? (k.kab === 'raat' && k.tak < k.se);
              return (
                <span key={i} style={{ fontSize: 20, fontWeight: 700, color: INK, letterSpacing: 0.3 }}>
                  {k.kab === 'raat' && <span style={{ fontSize: 14, marginRight: 4 }} title="raat ka samay">🌙</span>}
                  {k.se} – {k.tak}
                  {paar && <span style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginLeft: 4 }}>
                    (agli subah)
                  </span>}
                </span>
              );
            })}
          </div>
          {t.samay.abhijit.saaf && (
            <div style={{ fontSize: 13, color: '#E9C862', marginTop: 8 }}>
              ✨ Abhijit muhurat: {t.samay.abhijit.se} – {t.samay.abhijit.tak}
            </div>
          )}
          {t.samay.khirkiyan.some(k => k.kab === 'raat') && (
            // Imaandari: upar jo nakshatra/tithi/karan likhe hain wo DIN ke
            // hain. Raat tak wo badal chuke hote hain, aur raat ki khidki
            // raat ke APNE panchang par mili hai — engine ne use alag se
            // jaancha hai. Bina likhe ye baat chhup jaati.
            <div style={{ fontSize: 12, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>
              🌙 Raat ka nakshatra, tithi aur karan din se alag hote hain — raat ki khidki
              unhi par alag se jaanchi gayi hai.
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
              // Event ka shehar bhi yahin bhar jaata hai — zyadatar log usi
              // shehar mein kaam karte hain, aur jise badalna ho wo neeche
              // wale box mein badal deta hai. Pehle wo box CHECKBOX ke peeche
              // chhupa tha, jo Rohiit ne live par pakda.
              setForm(p => ({
                ...p, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz,
                ...(p.kaamLat === null
                  ? { kaamQuery: city, kaamCity: city, kaamLat: lat, kaamLon: lng, kaamTz: tz }
                  : {}),
              }))} />
        </div>

        {/* Event ki jagah — HAMESHA khula. Shubh samay suryoday se banta hai. */}
        <div style={{ marginBottom: 18 }}>
          <label style={label} htmlFor="mu-kaam-city">Event / Program / Exam Location *</label>
          {/* ⭐ Rohiit ka faisla (23 Sep): CityInput.tsx CHHUNA NAHI — wo sajha
              file hai aur paanch chalte hue calculator uspar tike hain.
              Isliye placeholder wahi purana ("Type city of birth…") rahega.
              Uski bharpayi neeche ki line se: wahan saaf likha hai ki ye box
              kis cheez ke liye hai. */}
          <CityInput id="mu-kaam-city" value={form.kaamQuery} error={errors.kaam}
            onSelect={(city, lat, lng, tz) =>
              setForm(p => ({ ...p, kaamQuery: city, kaamCity: city, kaamLat: lat, kaamLon: lng, kaamTz: tz }))} />
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            <strong style={{ color: '#94a3b8' }}>Yahan wo shehar likhiye jahan ye kaam hoga.</strong>{' '}
            Janm-sthan chunte hi ye apne aap bhar jaata hai; alag shehar ho to badal dijiye —
            shubh samay suryoday se banta hai, aur suryoday har shehar mein alag hota hai.
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
              {form.name ? `${form.name} ji, ` : ''}{data.kaam.naam_hi} ke liye{' '}
              {(() => {
                // Engine se seedha — 45 din, ya 180 ko "6 mahine" mein
                const dn = data.seema_din ?? 45;
                return dn >= 150 ? `agle ${Math.round(dn / 30)} mahine mein` : `agle ${dn} din mein`;
              })()} {data.tareekhein.length} shubh tareekhein
            </div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>
              {(['shreshth', 'achha', 'theek'] as const)
                .map(d => `${data.tareekhein.filter(t => t.darja === d).length} ${DARJA[d].en}`)
                .join(' · ')} — aapka janm nakshatra {data.janma.nakshatra}, raashi {data.janma.rashi}
            </div>
            {data.kaam.chetavni && (
              <div style={{ fontSize: 13, color: '#E9C862', marginTop: 10, lineHeight: 1.6 }}>⚠ {data.kaam.chetavni}</div>
            )}

            {/* ⭐ v2.1 — POORI SOOCHI bhejein. Tareekh ghar mein milkar chuni
                jaati hai, isliye sabse kaam ka button yahi hai — aur jo soochi
                pariwar ke group mein jaati hai, wo hamein bhi saath le jaati hai. */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${GOLD_RGBA(0.22)}` }}>
              <button type="button" onClick={whatsappSab} style={{
                width: '100%', background: '#25D366', color: '#fff', border: 'none',
                borderRadius: 12, padding: '14px 18px', fontSize: 16, fontWeight: 800,
                cursor: 'pointer', minHeight: 52,
              }}>
                📲 Poori soochi WhatsApp par bhejein
              </button>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 8, lineHeight: 1.7 }}>
                Ek dabane par saari tareekhein aur samay <strong style={{ color: '#cbd5e1' }}>ghar
                walon, rishtedaron ya pandit ji</strong> ko seedha chali jayengi — muhurat akele
                nahi, milkar chuna jaata hai. Koi app nahi, koi login nahi.
              </div>
            </div>
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
                    Aapki kundali mein agle 6 mahine ki aur tareekhein hain
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
              ✓ Poori soochi khul gayi — agle 6 mahine (180 din) ki saari shubh tareekhein upar hain.
            </div>
          )}

          {/* ⭐ v1.8 — UPAY. Sirf paid mein, kyunki engine muft jawab mein ye
              key bhejta hi nahi. Karak grah, mantra aur daan — sab parampara
              se; granth ka naam kisi par nahi. */}
          {data.paid && (data.upay?.length ?? 0) > 0 && (
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: GOLD, marginBottom: 4 }}>
                ग्रह-शान्ति के उपाय
              </div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 14, lineHeight: 1.7 }}>
                Ye upay is kaam ke <strong style={{ color: '#cbd5e1' }}>karak grah</strong> ke hain —
                jyotish parampara se, granth se nahi. Upar chuni tareekh se pehle ya usi din kar lijiye.
              </div>

              {data.upay!.map((u, i) => (
                <div key={i} style={{
                  background: CARD, border: `1px solid ${GOLD_RGBA(0.22)}`, borderRadius: 16,
                  padding: '16px 18px', marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      background: GOLD, color: '#101010', borderRadius: 12,
                      padding: '7px 14px', fontSize: 16, fontWeight: 800,
                    }}>{u.grah_hi}</span>
                    <span style={{ fontSize: 13, color: MUTED }}>{u.kyun}</span>
                  </div>

                  <div style={{ display: 'grid', gap: 8, marginTop: 14, fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 }}>
                    <div>🕉️ <strong style={{ color: '#E9C862' }}>Mantra:</strong> {u.mantra}</div>
                    <div>📅 <strong style={{ color: '#E9C862' }}>Din:</strong> {u.din}</div>
                    <div>🎁 <strong style={{ color: '#E9C862' }}>Daan:</strong> {u.daan}</div>
                    {u.rang && <div>🎨 <strong style={{ color: '#E9C862' }}>Rang:</strong> {u.rang}</div>}
                  </div>

                  {u.upay?.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      {u.upay.map((x: string, j: number) => (
                        <div key={j} style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8 }}>• {x}</div>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: 12, color: MUTED, marginTop: 10 }}>
                    Karak grah, mantra aur daan — <strong style={{ color: '#94a3b8' }}>parampara</strong> se.
                    Brihat Samhita in par kuch nahi kehti, isliye hum granth ka naam nahi lagate.
                  </div>
                </div>
              ))}

              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.7 }}>
                Upay shraddha ka vishay hai. Ye kisi ilaaj, vakeel ya peshewar salaah ki jagah nahi lete.
              </div>
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
