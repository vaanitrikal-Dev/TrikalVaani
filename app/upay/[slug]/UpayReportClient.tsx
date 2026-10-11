'use client';

// ============================================================
// File: app/upay/[slug]/UpayReportClient.tsx
// Version: v2.1 — 11 Oct 2026
//   v2.1: ratna ki line ab bhasha mein — Hindi: "धातु: चाँदी · उँगली: मध्यमा…",
//         Hinglish: Heera (Shukra) jaise desi naam (pehle English "Diamond (Venus)").
//   v2.0 (Rohiit ka 11 Oct ka design — mockup "upay_report_v2" approve):
//     * हिंदी / Hinglish tab (default हिंदी; grahak ki language 'hinglish'/'english'
//       ho to Hinglish). Sab labels dono bhasha mein.
//     * "आपकी कुंडली क्या कहती है" — VM v5.1 ka kundali_kyun (bhaav, swami, dasha).
//     * 7-12 upay — naya UpayCard v2.0 (बोलने में / मतलब / कैसे करें / क्या चाहिए).
//     * 💎 रत्न — grahak ke browser mein /api/calc/kundali (calcType gemstone) +
//       lib/jyotish/gemstone runEngine — wahi jo Gemstone calculator chalata hai.
//     * 🪐 ग्रह शांति — grah_shanti[] (Rahu/Ketu/Shani + chuna grah); har grah tap
//       karke khulta hai: kundali, jap, havan, daan 3 star, seva, vrat, dasha.
//       "Sirf ek grah" report mein ye section nahi aata (VM bhejta hi nahi).
//     * KOI DAAM NAHI. Purani (v4.x) reports bhi chalengi — naye fields na hon to
//       card purana text dikhata hai.
//   v1.2: sankat (aatmhatya) par helpline card, ₹499 hata.
//   v1.1: "Aapki baat" (vishesh), "Aapne chuna".
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Grahak ko koi ank nahi (_shadbala kabhi nahi dikhaya jaata).
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import UpayCard, { type UpayItem, type UpayLang } from '@/components/calculators/UpayCard';
import { isCrisisText, CRISIS_HELP } from '@/lib/upay-flags';
import { runEngine, type EngineResult, type StoneResult } from '@/lib/jyotish/gemstone';

const GOLD = '#D4AF37';
const G = (a: number) => `rgba(212,175,55,${a})`;
const SITE = 'https://trikalvaani.com';

const GRAH: { id: string; hi: string }[] = [
  { id: 'Surya', hi: 'सूर्य' }, { id: 'Chandra', hi: 'चंद्र' }, { id: 'Mangal', hi: 'मंगल' },
  { id: 'Budh', hi: 'बुध' }, { id: 'Guru', hi: 'गुरु' }, { id: 'Shukra', hi: 'शुक्र' },
  { id: 'Shani', hi: 'शनि' }, { id: 'Rahu', hi: 'राहु' }, { id: 'Ketu', hi: 'केतु' },
];
const GRAH_HI: Record<string, string> = Object.fromEntries(GRAH.map((g) => [g.id, g.hi]));

const L = {
  title: ['आपके ग्रंथ उपाय', 'Aapke Granth Upay'],
  chuna: ['आपने चुना', 'Aapne chuna'],
  kundali: ['आपकी कुंडली क्या कहती है', 'Aapki kundali kya kehti hai'],
  baat: ['आपकी बात', 'Aapki baat'],
  baatNote: ['उपाय आपकी कुंडली और चुनी समस्या के हिसाब से ग्रंथ से चुने गए हैं। इस बात पर सीधी सलाह के लिए नीचे ₹499 consultation है।',
             'Upay aapki kundali aur chuni samasya ke hisaab se granth se chune gaye hain. Is baat par seedhi salaah ke liye neeche ₹499 consultation hai.'],
  baatNoteCrisis: ['उपाय ग्रंथ से हैं और इलाज के साथ किए जा सकते हैं। ऊपर दी गई हेल्पलाइन पर आज ही बात करें।',
                   'Upay granth se hain aur ilaaj ke saath kiye ja sakte hain. Upar di gayi helpline par aaj hi baat karein.'],
  upayN: ['आपके {n} उपाय', 'Aapke {n} Upay'],
  upayTip: ['सबसे आसान 2-3 से शुरू करें, रोज़ एक ही समय पर। रोग के उपाय डॉक्टर के इलाज के साथ, उसकी जगह नहीं।',
            'Sabse aasaan 2-3 se shuru karein, roz ek hi samay par. Rog ke upay doctor ke ilaaj ke saath, uski jagah nahi.'],
  ratna: ['💎 रत्न — आपकी कुंडली के अनुसार', '💎 Ratna — aapki kundali ke anusaar'],
  ratnaLoad: ['रत्न देखा जा रहा है…', 'Ratna dekha ja raha hai…'],
  ratnaErr: ['रत्न अभी नहीं दिख पाया — पेज दोबारा खोलें।', 'Ratna abhi nahi dikh paaya — page dobara kholein.'],
  ratnaSrot: ['📖 BPHS 34 (लग्न अनुसार शुभ-अशुभ ग्रह) · Trikaal Vaani रत्न इंजन', '📖 BPHS 34 (lagna anusaar shubh-ashubh grah) · Trikaal Vaani ratna engine'],
  upratna: ['उपरत्न', 'Upratna'],
  shanti: ['🪐 ग्रह शांति', '🪐 Grah Shanti'],
  shantiTip: ['हर ग्रह पर टैप करके खोलें।', 'Har grah par tap karke kholein.'],
  shantiOf: ['शांति', 'shanti'],
  dashaTag: ['दशा चल रही है', 'Dasha chal rahi hai'],
  dashaLine: ['⏳ अभी इसकी दशा चल रही है — इसकी शांति सबसे ज़रूरी है।', '⏳ Abhi iski dasha chal rahi hai — iski shanti sabse zaroori hai.'],
  jap: ['जप', 'Jap'], kul: ['कुल', 'kul'], roz: ['रोज़ 108', 'roz 108'],
  havan: ['हवन', 'Havan'], samidha: ['की समिधा (हवन की लकड़ी)', 'ki samidha (havan ki lakdi)'],
  daan: ['दान — अपनी शक्ति से चुनें', 'Daan — apni shakti se chunein'],
  poorna: ['पूर्ण (ग्रंथ)', 'Poorna (granth)'], madhyam: ['मध्यम (व्यावहारिक)', 'Madhyam (vyavaharik)'], saral: ['सरल', 'Saral'],
  seva: ['सेवा / आराधना', 'Seva / aaradhana'], vrat: ['व्रत', 'Vrat'], parampara: ['पारंपरिक', 'Paramparik'],
  grahSab: ['किसी भी एक ग्रह के सारे उपाय', 'Kisi bhi ek grah ke saare upay'],
  grahLoad: ['उपाय आ रहे हैं…', 'Upay aa rahe hain…'],
  grahErr: ['अभी उपाय नहीं मिल पाए — थोड़ी देर बाद कोशिश करें।', 'Abhi upay nahi mil paaye — thodi der baad try karein.'],
  cta: ['उपाय कौन सा पहले करें, कब तक करें — रोहित गुप्ता से सीधी बात', 'Upay kaun sa pehle karein, kab tak karein — Rohiit Gupta se seedhi baat'],
  founder: ['हर उपाय ग्रंथ से है — अथर्ववेद (कौशिक सूत्र), ऋग्वेद (ऋग्विधान, गृह्य सूत्र), बृहत् पाराशर होरा शास्त्र, फलदीपिका और जातक पारिजात। व्रत और मध्यम दान "पारंपरिक/व्यावहारिक" हैं — यह साफ़ लिखा है। कमज़ोर ग्रह Swiss Ephemeris पर षड्बल (BPHS 27) से। कोई AI नहीं।',
            'Har upay granth se hai — Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana, Grihya Sutra), Brihat Parashara Hora Shastra, Phaladeepika aur Jataka Parijata. Vrat aur madhyam daan "paramparik/vyavaharik" hain — ye saaf likha hai. Kamzor grah Swiss Ephemeris par Shadbala (BPHS 27) se. Koi AI nahi.'],
  kisiAur: ['किसी और के उपाय', 'Kisi aur ke upay'],
  share: ['मेरी त्रिकाल वाणी उपाय रिपोर्ट — ग्रंथ के उपाय', 'Meri Trikaal Vaani Upay Report — granth ke upay'],
  safety1: ['सबसे पहले सुरक्षा', 'Pehle suraksha'],
  safety2: ['आपने जो लिखा है, वह गंभीर है। इस समय सबसे ज़रूरी है डॉक्टर या मनोचिकित्सक की देख-रेख, और परिवार का साथ। उपाय इसके साथ किए जा सकते हैं — इसकी जगह कभी नहीं।',
            'Aapne jo likha hai, wo gambhir hai. Is samay sabse zaroori hai doctor ya psychiatrist ki dekh-rekh, aur parivar ka saath. Upay iske saath kiye ja sakte hain — iski jagah kabhi nahi.'],
  safety3: ['24 घंटे · मुफ़्त · भारत सरकार', '24 ghante · muft · Bharat sarkar'],
  safety4: ['तुरंत खतरा हो तो', 'Turant khatra ho to'],
} as const;
type LKey = keyof typeof L;

const VERDICT_HI: Record<string, [string, string]> = {
  recommended: ['शुभ — पहन सकते हैं', 'Shubh — pehen sakte hain'],
  trial: ['पहले 3 दिन पहनकर देखें', 'Pehle 3 din pehen kar dekhein'],
  caution: ['विशेषज्ञ से पूछकर ही', 'Visheshagya se poochh kar hi'],
  neutral: ['ज़रूरी नहीं', 'Zaroori nahi'],
  avoid: ['न पहनें — कुंडली के विरुद्ध', 'Na pehnein — kundali ke viruddh'],
  reject: ['आपके लग्न के लिए नहीं', 'Aapke lagna ke liye nahi'],
};
const VCOL: Record<string, string> = { recommended: '#86efac', trial: '#86efac', caution: '#fbbf24', neutral: '#94a3b8', avoid: '#fca5a5', reject: '#fca5a5' };
const VORDER: Record<string, number> = { recommended: 0, trial: 1, caution: 2, neutral: 3, avoid: 4, reject: 5 };

const pad = (n: number) => String(n).padStart(2, '0');

// ratna engine (lib/jyotish/gemstone) English deta hai — grahak ki bhasha mein
const STONE_HL: Record<string, [string, string]> = {
  Sun: ['Manik', 'Surya'], Moon: ['Moti', 'Chandra'], Mars: ['Moonga', 'Mangal'], Mercury: ['Panna', 'Budh'],
  Jupiter: ['Pukhraj', 'Guru'], Venus: ['Heera', 'Shukra'], Saturn: ['Neelam', 'Shani'], Rahu: ['Gomed', 'Rahu'], Ketu: ['Lehsuniya', 'Ketu'],
};
const GEM_WORD: [RegExp, string, string][] = [
  [/Gold/g, 'सोना', 'Sona'], [/Silver/g, 'चाँदी', 'Chaandi'], [/Copper/g, 'तांबा', 'Taamba'],
  [/Platinum/g, 'प्लैटिनम', 'Platinum'], [/Panchdhatu/g, 'पंचधातु', 'Panchdhatu'],
  [/Ring finger/g, 'अनामिका (तीसरी उँगली)', 'Anamika (teesri ungli)'], [/Little finger/g, 'कनिष्ठा (छोटी उँगली)', 'Kanishtha (chhoti ungli)'],
  [/Middle finger/g, 'मध्यमा (बीच की उँगली)', 'Madhyama (beech ki ungli)'], [/Index finger/g, 'तर्जनी (पहली उँगली)', 'Tarjani (pehli ungli)'],
  [/Sunday/g, 'रविवार', 'Ravivaar'], [/Monday/g, 'सोमवार', 'Somvaar'], [/Tuesday/g, 'मंगलवार', 'Mangalvaar'],
  [/Wednesday/g, 'बुधवार', 'Budhvaar'], [/Thursday/g, 'गुरुवार', 'Guruvaar'], [/Friday/g, 'शुक्रवार', 'Shukravaar'], [/Saturday/g, 'शनिवार', 'Shanivaar'],
];
const gemTr = (t: string, hi: boolean) => GEM_WORD.reduce((a, [re, h, e]) => a.replace(re, hi ? h : e), String(t || ''));
const GEM_LBL = { metal: ['धातु', 'Dhaatu'], finger: ['उँगली', 'Ungli'], day: ['दिन', 'Din'] } as const;

function PDFBtn() {
  const handle = () => {
    const st = document.createElement('style'); st.id = 'tv-print';
    st.textContent = `@media print {nav,footer,.site-nav,.site-footer,.no-print{display:none!important}body{background:#fff!important}*{color:#000!important;border-color:#ccc!important;background:transparent!important}h3{color:#7a5c00!important}article{page-break-inside:avoid}details>*{display:block!important}}`;
    document.head.appendChild(st);
    document.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''));
    window.print();
    setTimeout(() => { const e = document.getElementById('tv-print'); if (e) e.remove(); }, 1500);
  };
  return (
    <button onClick={handle} className="no-print"
      style={{ padding: '11px 20px', borderRadius: '10px', background: G(0.08), border: `1px solid ${G(0.25)}`, color: GOLD, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
      📄 PDF Download
    </button>
  );
}

function ShantiBox({ s, lang, open }: { s: any; lang: UpayLang; open: boolean }) {
  const hi = lang === 'hi';
  const l = (k: LKey) => L[k][hi ? 0 : 1];
  const d = s?.daan || {};
  const madhyam = hi ? d.madhyam_hi : d.madhyam_en;
  return (
    <details open={open} className="mb-3 rounded-xl"
      style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.35)', padding: '12px 14px' }}>
      <summary className="cursor-pointer flex items-center justify-between gap-2" style={{ listStyle: 'none' }}>
        <span className="font-bold" style={{ color: GOLD, fontSize: '15px' }}>
          {hi ? (s.naam_hi || GRAH_HI[s.graha]) : s.graha} {l('shantiOf')}
        </span>
        {s.dasha_chal_rahi ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>{l('dashaTag')}</span>
        ) : null}
      </summary>
      <div className="mt-2 text-sm leading-relaxed" style={{ color: '#E5E7EB' }}>
        {s.kundali ? <p className="m-0 mb-1 text-[13px]" style={{ color: '#cbd5e1' }}>{hi ? s.kundali.hi : s.kundali.en}</p> : null}
        {s.dasha_chal_rahi ? <p className="m-0 mb-1" style={{ color: '#fbbf24' }}>{l('dashaLine')}</p> : null}
        <p className="m-0 mb-1">🕉️ <b>{l('jap')}:</b> «{s.jap?.mantra}» — {l('kul')} {Number(s.jap?.ginti || 0).toLocaleString('en-IN')}, {l('roz')}</p>
        <p className="m-0 mb-1">🔥 <b>{l('havan')}:</b> {hi ? s.havan?.samidha_hi : s.havan?.samidha_en} {l('samidha')}</p>
        <div className="m-0 mb-1">🌾 <b>{l('daan')}:</b>
          <div className="grid gap-x-3 gap-y-1 mt-1 text-[13px]" style={{ gridTemplateColumns: 'auto 1fr' }}>
            <b style={{ color: GOLD }}>{l('poorna')}</b><span>{hi ? d.poorna_hi : d.poorna_en}</span>
            {madhyam ? (<><b style={{ color: GOLD }}>{l('madhyam')}</b><span>{madhyam}</span></>) : null}
            <b style={{ color: GOLD }}>{l('saral')}</b><span>{hi ? d.saral_hi : d.saral_en}</span>
          </div>
        </div>
        {(s.seva || []).map((x: UpayItem, i: number) => {
          const steps = (hi ? x.saral_vidhi?.kaise_hi : x.saral_vidhi?.kaise_en) || [];
          return (
            <div key={i} className="m-0 mb-1">🙏 <b>{l('seva')}:</b> {steps.join(' ')}
              <span className="text-[11px]" style={{ color: '#64748b' }}> 📖 {hi ? x.srot_hi : x.srot}</span>
            </div>
          );
        })}
        <p className="m-0 mb-1">🪔 <b>{l('vrat')}:</b> {hi ? s.vrat?.din_hi : s.vrat?.din_en} — {hi ? s.vrat?.hi : s.vrat?.en}{' '}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.14)', color: '#fbbf24' }}>{l('parampara')}</span>
        </p>
        {s.dasha_shanti ? <div className="mt-2"><UpayCard u={s.dasha_shanti} n={0} lang={lang} /></div> : null}
        <p className="m-0 mt-1 text-[11px]" style={{ color: '#64748b' }}>📖 {s.jap?.srot}</p>
      </div>
    </details>
  );
}

export default function UpayReportClient({ report, slug }: { report: any; slug: string }) {
  const res = report.result ?? {};
  const b = report.birth ?? {};
  const [lang, setLang] = useState<UpayLang>(report.language === 'hindi' || !report.language ? 'hi' : 'en');
  const hi = lang === 'hi';
  const l = (k: LKey) => L[k][hi ? 0 : 1];

  const upay: UpayItem[] = Array.isArray(res.upay) ? res.upay : [];
  const shanti: any[] = Array.isArray(res.grah_shanti) ? res.grah_shanti.filter(Boolean) : [];
  const kyun: { hi: string; en: string }[] = Array.isArray(res.kundali_kyun) ? res.kundali_kyun : [];
  const name = (report.person_name || b.name || '').trim();
  const birthLine = [
    b.day && b.month && b.year ? `${pad(b.day)}-${pad(b.month)}-${b.year}` : null,
    b.hour != null ? `${pad(b.hour)}:${pad(b.minute ?? 0)}${b.time_assumed ? (hi ? ' (माना हुआ)' : ' (maana hua)') : ''}` : null,
    b.city || null,
    res?.kundali ? `${hi ? (res.kundali.lagna_hi + ' लग्न') : (res.kundali.lagna + ' lagna')}` : null,
  ].filter(Boolean).join(' · ');
  const samasya: { slug: string; naam_hi?: string; naam_en?: string }[] = Array.isArray(res.samasya) ? res.samasya : [];
  const kamzor: string[] = (res.kamzor_grah ?? []).filter((g: string) => g);
  const url = `${SITE}/upay/${slug}`;
  const waShare = `https://wa.me/?text=${encodeURIComponent(`${l('share')}: ${url}`)}`;
  const crisis = isCrisisText(report.vishesh);

  // ── ratna (grahak ke browser mein — Gemstone calculator wala hi engine)
  const [ratna, setRatna] = useState<EngineResult | null>(null);
  const [ratnaState, setRatnaState] = useState<'load' | 'ok' | 'err'>('load');
  useEffect(() => {
    if (!(b.year && b.latitude != null)) { setRatnaState('err'); return; }
    fetch('/api/calc/kundali', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year: b.year, month: b.month, day: b.day, hour: b.hour, minute: b.minute,
        latitude: b.latitude, longitude: b.longitude, timezone: b.timezone ?? 5.5, calcType: 'gemstone' }),
    }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { const e = runEngine(d); setRatna(e); setRatnaState(e ? 'ok' : 'err'); })
      .catch(() => setRatnaState('err'));
  }, [b.year, b.month, b.day, b.hour, b.minute, b.latitude, b.longitude, b.timezone]);
  const stones: StoneResult[] = ratna ? [...ratna.stones].sort((x, y) => (VORDER[x.verdictKey] ?? 9) - (VORDER[y.verdictKey] ?? 9)) : [];

  // ── kisi bhi ek grah ke saare upay (paid — VM v5.1 grah report, 7-12)
  const [grah, setGrah] = useState<string | null>(null);
  const [grahUpay, setGrahUpay] = useState<UpayItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  async function grahDekho(g: string) {
    setGrah(g); setGrahUpay(null); setBusy(true);
    try {
      const r = await fetch('/api/calc/upay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, grah: g }) });
      const d = await r.json();
      setGrahUpay(r.ok && Array.isArray(d?.upay) ? d.upay : []);
    } catch { setGrahUpay([]); } finally { setBusy(false); }
  }

  return (
    <>
      <SiteNav />
      <main className="min-h-screen" style={{ background: '#080B12', color: '#E5E7EB', padding: '96px 16px 48px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>

          <nav className="text-xs text-slate-500 mb-4 no-print">
            <Link href="/" className="hover:text-slate-300">Home</Link><span className="mx-2">›</span>
            <Link href="/calculators/free-upay-calculator" className="hover:text-slate-300">Upay Calculator</Link><span className="mx-2">›</span>
            <span style={{ color: '#94a3b8' }}>{hi ? 'आपकी रिपोर्ट' : 'Aapki Report'}</span>
          </nav>

          {crisis ? (
            <section style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.5)', borderRadius: '16px', padding: '18px 20px', marginBottom: '18px' }}>
              <p style={{ margin: '0 0 8px', color: '#fca5a5', fontSize: '16px', fontWeight: 800 }}>{l('safety1')}</p>
              <p style={{ margin: '0 0 10px', color: '#f1f5f9', fontSize: '14px', lineHeight: 1.65 }}>{l('safety2')}</p>
              <p style={{ margin: '0 0 4px', color: '#fff', fontSize: '15px', fontWeight: 700 }}>
                📞 Tele-MANAS: <a href={`tel:${CRISIS_HELP.teleManas}`} style={{ color: '#fff' }}>{CRISIS_HELP.teleManas}</a>
                {' '}<span style={{ fontWeight: 400, fontSize: '13px', color: '#cbd5e1' }}>({CRISIS_HELP.teleManasAlt}) · {l('safety3')}</span>
              </p>
              <p style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: 700 }}>
                🚨 {l('safety4')}: <a href={`tel:${CRISIS_HELP.emergency}`} style={{ color: '#fff' }}>{CRISIS_HELP.emergency}</a>
              </p>
            </section>
          ) : null}

          {/* ── HERO ── */}
          <section style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(8,14,28,0.95))', border: `1px solid ${G(0.3)}`, borderRadius: '16px', padding: '22px', marginBottom: '14px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', color: GOLD, fontSize: '12px', letterSpacing: '2px' }}>🔱 {hi ? 'त्रिकाल वाणी · उपाय रिपोर्ट' : 'TRIKAAL VAANI · UPAY REPORT'} 🔱</p>
            <h1 style={{ margin: '0 0 6px', color: GOLD, fontSize: '24px', fontWeight: 800 }}>
              {name ? `${name} ${hi ? 'जी' : 'ji'} — ` : ''}{l('title')}
            </h1>
            {birthLine ? <p style={{ margin: '0 0 8px', color: '#cbd5e1', fontSize: '13px' }}>{birthLine}</p> : null}
            {samasya.length ? (
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>
                {l('chuna')}: {samasya.map((s) => (hi ? s.naam_hi : (s.naam_en || s.naam_hi)) || s.slug).join(' · ')}
              </p>
            ) : null}
          </section>

          {/* ── bhasha ── */}
          <div className="flex justify-center gap-2 mb-4 no-print">
            {(['hi', 'en'] as UpayLang[]).map((x) => (
              <button key={x} type="button" onClick={() => setLang(x)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold"
                style={lang === x ? { background: GOLD, color: '#080B12' } : { background: 'transparent', color: '#e2e8f0', border: `1px solid ${G(0.4)}` }}>
                {x === 'hi' ? 'हिंदी' : 'Hinglish'}
              </button>
            ))}
          </div>

          {report.vishesh ? (
            <section style={{ background: G(0.05), border: `1px solid ${G(0.2)}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
              <p style={{ margin: '0 0 4px', color: GOLD, fontSize: '13px', fontWeight: 700 }}>{l('baat')}</p>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{String(report.vishesh)}</p>
              <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '11px' }}>{crisis ? l('baatNoteCrisis') : l('baatNote')}</p>
            </section>
          ) : null}

          {/* ── kundali kya kehti hai ── */}
          {kyun.length || kamzor.length ? (
            <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px' }}>
              <p style={{ margin: '0 0 6px', color: GOLD, fontSize: '14px', fontWeight: 700 }}>{l('kundali')}</p>
              {kyun.length
                ? kyun.map((x, i) => <p key={i} style={{ margin: '0 0 4px', fontSize: '14px', lineHeight: 1.7, color: '#e2e8f0' }}>{hi ? x.hi : x.en}</p>)
                : <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0' }}>{hi ? 'कमज़ोर ग्रह (षड्बल, BPHS 27): ' : 'Kamzor grah (Shadbala, BPHS 27): '}{kamzor.map((g) => (hi ? GRAH_HI[g] || g : g)).join(', ')}</p>}
            </section>
          ) : null}

          {/* ── UPAY ── */}
          <h2 style={{ color: GOLD, fontSize: '20px', fontWeight: 800, margin: '0 0 4px' }}>{l('upayN').replace('{n}', String(upay.length))}</h2>
          <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '12px' }}>{l('upayTip')}</p>
          {upay.map((u, i) => <UpayCard key={String(u.id ?? i)} u={u} n={i + 1} lang={lang} />)}

          {/* ── RATNA ── */}
          <h2 style={{ color: GOLD, fontSize: '18px', fontWeight: 800, margin: '22px 0 8px' }}>{l('ratna')}</h2>
          <section style={{ background: 'rgba(244,114,182,0.05)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px' }}>
            {ratnaState === 'load' ? <p className="m-0 text-sm" style={{ color: GOLD }}>{l('ratnaLoad')}</p> : null}
            {ratnaState === 'err' ? <p className="m-0 text-sm" style={{ color: '#94a3b8' }}>{l('ratnaErr')}</p> : null}
            {ratnaState === 'ok' && stones.map((s) => (
              <div key={s.graha} className="py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between gap-2 text-[13px]">
                  <span><b>{hi ? s.stone_hi : (STONE_HL[s.graha]?.[0] ?? s.stone_en)}</b> ({hi ? s.planet_hi : (STONE_HL[s.graha]?.[1] ?? s.graha)})</span>
                  <span style={{ color: VCOL[s.verdictKey] || '#94a3b8', textAlign: 'right' }}>{(VERDICT_HI[s.verdictKey] || [s.verdictLabel, s.verdictLabel])[hi ? 0 : 1]}</span>
                </div>
                {(s.verdictKey === 'recommended' || s.verdictKey === 'trial') && s.info ? (
                  <p className="m-0 mt-1 text-[12px]" style={{ color: '#cbd5e1' }}>
                    {GEM_LBL.metal[hi ? 0 : 1]}: {gemTr(s.info.metal, hi)} · {GEM_LBL.finger[hi ? 0 : 1]}: {gemTr(s.info.finger, hi)} · {GEM_LBL.day[hi ? 0 : 1]}: {gemTr(s.info.day, hi)}{s.info.upratna ? ` · ${l('upratna')}: ${s.info.upratna}` : ''}
                  </p>
                ) : null}
              </div>
            ))}
            {ratnaState === 'ok' ? <p className="m-0 mt-2 text-[11px]" style={{ color: '#64748b' }}>{l('ratnaSrot')}</p> : null}
          </section>

          {/* ── GRAH SHANTI ── */}
          {shanti.length ? (
            <>
              <h2 style={{ color: GOLD, fontSize: '18px', fontWeight: 800, margin: '22px 0 4px' }}>
                {l('shanti')} — {shanti.map((s) => (hi ? s.naam_hi || GRAH_HI[s.graha] : s.graha)).join(', ')}
              </h2>
              <p className="no-print" style={{ margin: '0 0 10px', color: '#94a3b8', fontSize: '12px' }}>{l('shantiTip')}</p>
              {shanti.map((s, i) => <ShantiBox key={s.graha} s={s} lang={lang} open={i === 0} />)}
            </>
          ) : null}

          {/* ── kisi bhi grah ke saare upay ── */}
          <section className="no-print" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', margin: '20px 0' }}>
            <h2 style={{ color: GOLD, fontSize: '17px', fontWeight: 800, margin: '0 0 10px' }}>{l('grahSab')}</h2>
            <div className="flex flex-wrap gap-2">
              {GRAH.map((g) => (
                <button key={g.id} type="button" onClick={() => grahDekho(g.id)}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={grah === g.id ? { background: GOLD, color: '#080B12' } : { background: 'transparent', color: '#e2e8f0', border: `1px solid ${G(0.35)}` }}>
                  {g.hi} {g.id}
                </button>
              ))}
            </div>
            {busy ? <p className="text-sm mt-3" style={{ color: GOLD }}>{l('grahLoad')}</p> : null}
            {grah && grahUpay ? (
              <div className="mt-4">
                {grahUpay.length === 0
                  ? <p className="text-sm text-slate-400">{l('grahErr')}</p>
                  : grahUpay.map((u, i) => <UpayCard key={String(u.id ?? i)} u={u} n={i + 1} lang={lang} />)}
              </div>
            ) : null}
          </section>

          {res.srot_ki_baat ? (
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 18px' }}>📖 {hi ? (res.srot_ki_baat_hi || res.srot_ki_baat) : res.srot_ki_baat}</p>
          ) : null}

          {/* ── ₹499 — sankat wale grahak ko bechne ka message NAHI ── */}
          {!crisis ? (
            <section className="no-print" style={{ background: G(0.06), border: `1px solid ${G(0.25)}`, borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <p style={{ margin: '0 0 8px', color: '#e2e8f0', fontSize: '14px', fontWeight: 700 }}>{l('cta')}</p>
              <a href="https://wa.me/919211804111?text=Namaste%2C%20mujhe%20Upay%20Report%20par%20consultation%20chahiye" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', padding: '10px 18px', borderRadius: '10px', background: GOLD, color: '#080B12', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                ₹499 Consultation — WhatsApp
              </a>
            </section>
          ) : null}

          {/* ── founder ── */}
          <div style={{ background: 'rgba(8,14,28,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `1px solid ${G(0.35)}`, background: G(0.1) }}>
                <img src="/images/founder.png" alt="Rohiit Gupta — Chief Vedic Architect" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 700 }}>{hi ? 'रोहित गुप्ता' : 'Rohiit Gupta'}</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Chief Vedic Architect · Trikaal Vaani</p>
              </div>
            </div>
            <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '13px', lineHeight: 1.6 }}>{l('founder')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['16+ Years Vedic Study', 'Parashara BPHS', 'Atharvaveda', 'Swiss Ephemeris'].map((x) => (
                <span key={x} style={{ padding: '4px 9px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '11px' }}>{x}</span>
              ))}
            </div>
          </div>

          {/* ── share / pdf ── */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className="no-print" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
              <a href={waShare} target="_blank" rel="noopener noreferrer"
                style={{ padding: '11px 20px', borderRadius: '10px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                📱 WhatsApp Share
              </a>
              <PDFBtn />
              <Link href="/calculators/free-upay-calculator"
                style={{ padding: '11px 20px', borderRadius: '10px', background: G(0.08), border: `1px solid ${G(0.25)}`, color: GOLD, fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                {l('kisiAur')}
              </Link>
            </div>
            <p style={{ margin: 0, color: '#475569', fontSize: '11px', lineHeight: 1.5 }}>
              🔱 Trikaal Vaani — Kaal bada balwan hai, sabko nach nachaye<br />trikalvaani.com/upay/{slug} · Rohiit Gupta, Chief Vedic Architect
            </p>
          </div>

        </div>
      </main>
      <SiteFooter />
    </>
  );
}
// END — app/upay/[slug]/UpayReportClient.tsx v2.1
