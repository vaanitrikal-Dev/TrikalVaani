// ============================================================
// File: components/calculators/UpayCard.tsx
// Version: v2.0 — 11 Oct 2026
//   v2.0 (Rohiit ka 11 Oct ka design — mockup approve):
//     * हिंदी / Hinglish — `lang` prop ('hi' | 'en'). Hindi mein upay_hindi,
//       heading_hi, saral_vidhi.*_hi; Hinglish mein purana text.
//     * Har card: heading (Sanskrit mantra + granth, GOLDEN BOLD) → 🔤 बोलने में →
//       💡 मतलब → ✅ कैसे करें (1-2-3) → 🧺 क्या चाहिए → सस्ता विकल्प →
//       🎯 क्यों · 📖 स्रोत. Upar kism ka naam aur "ग्रंथ" / "पारंपरिक" label.
//     * KOI DAAM NAHI (Rohiit 11 Oct). Daan card mein 3 star (daan_star).
//     * Lambe srot ke hawale — pehle 2, baaki "+N और" button.
//     * saral_vidhi na ho (purani report) to v1.0 jaisa poora text.
//   v1.0: pehla version (10 Oct).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Data: VM granth_api v5.1 upay_calculator() → upay[].
// ============================================================
'use client';

import { useState } from 'react';

const GOLD = '#D4AF37';

export type UpayLang = 'hi' | 'en';

export interface SaralVidhi {
  bolne_hi?: string; bolne_en?: string;
  matlab_hi?: string; matlab_en?: string; matlab_prakar?: 'arth' | 'uddeshya';
  kaise_hi?: string[]; kaise_en?: string[];
  chahiye_hi?: string; chahiye_en?: string;
}
export interface DaanStar {
  poorna_hi?: string; poorna_en?: string;
  madhyam_hi?: string | null; madhyam_en?: string | null;
  saral_hi?: string; saral_en?: string;
}
export interface UpayItem {
  id?: number | string;
  heading?: string; heading_hi?: string | null;
  upay?: string; upay_hindi?: string | null;
  saral_vidhi?: SaralVidhi | null;
  kism?: string;
  granth?: string; granth_hi?: string;
  srot?: string; srot_hi?: string;
  kya_chahiye?: string | null;
  sasta_vikalp?: string | null;
  grah?: string | null;
  label?: 'granth' | 'paramparik';
  kyun?: string; kyun_hi?: string;
  daan_star?: DaanStar | null;
}

const KISM: Record<string, [string, string]> = {
  'jap': ['🕉️ मंत्र जप', '🕉️ Mantra jap'], 'jap-diya': ['🪔 जप + दीया', '🪔 Jap + diya'],
  'havan-diya': ['🔥 हवन / दीया', '🔥 Havan / diya'], 'snaan': ['💧 स्नान', '💧 Snaan'],
  'jal-arpan': ['💧 जल', '💧 Jal'], 'surya-jal': ['☀️ सूर्य को जल', '☀️ Surya ko jal'],
  'raksha-dhaaga': ['🧿 रक्षा धागा', '🧿 Raksha dhaaga'], 'daan': ['🌾 दान', '🌾 Daan'],
  'seva': ['🙏 सेवा', '🙏 Seva'], 'aradhana': ['🙏 आराधना', '🙏 Aaradhana'],
  'vriksharopan': ['🌳 पेड़ लगाना', '🌳 Ped lagaana'], 'prasad': ['🍚 प्रसाद', '🍚 Prasad'],
  'dasha-shanti': ['⏳ दशा-शांति', '⏳ Dasha shanti'], 'vrat': ['🪔 व्रत', '🪔 Vrat'],
};

const T = {
  upay: ['उपाय', 'Upay'], granth: ['ग्रंथ', 'Granth'], parampara: ['पारंपरिक', 'Paramparik'],
  bolne: ['बोलने में', 'Bolne mein'], matlab: ['मतलब', 'Matlab'], uddeshya: ['उद्देश्य', 'Uddeshya'],
  kaise: ['कैसे करें', 'Kaise karein'], chahiye: ['क्या चाहिए', 'Kya chahiye'],
  sasta: ['सस्ता विकल्प', 'Sasta vikalp'], kyun: ['क्यों', 'Kyun'],
  daan: ['दान — अपनी शक्ति से चुनें', 'Daan — apni shakti se chunein'],
  poorna: ['पूर्ण (ग्रंथ)', 'Poorna (granth)'], madhyam: ['मध्यम (व्यावहारिक)', 'Madhyam (vyavaharik)'],
  saral: ['सरल', 'Saral'], aur: ['और', 'aur'],
} as const;
const t = (k: keyof typeof T, lang: UpayLang) => T[k][lang === 'hi' ? 0 : 1];
const clean = (s: string) => String(s ?? '').replace(/\*\*/g, '').trim();

/** "Kaushika Sutra 1.1.36, 12.10-12.14, 22.14" → pehle 2 hawale + baaki ki ginti */
function shortSrot(s: string): { short: string; more: number } {
  const m = s.match(/^(.*?)(\d[\d.\-–]*(?:[,;]\s*\d[\d.\-–]*)*)\s*$/);
  if (!m) return { short: s, more: 0 };
  const refs = m[2].split(/[,;]\s*/).filter(Boolean);
  if (refs.length <= 2) return { short: s, more: 0 };
  return { short: `${m[1]}${refs.slice(0, 2).join(', ')}`, more: refs.length - 2 };
}

export default function UpayCard({ u, n, lang = 'hi' }: { u: UpayItem; n: number; lang?: UpayLang }) {
  const [srotKhula, setSrotKhula] = useState(false);
  const hi = lang === 'hi';
  const sv = u.saral_vidhi || null;
  const fullText = clean(hi ? (u.upay_hindi || u.upay || '') : (u.upay || ''));
  const lines = fullText.split('\n').map(clean).filter(Boolean);
  const heading = clean((hi ? u.heading_hi : u.heading) || u.heading || lines[0] || '');
  const kism = u.kism ? (KISM[u.kism]?.[hi ? 0 : 1] ?? u.kism) : '';
  const paramparik = u.label === 'paramparik';
  const srot = (hi ? u.srot_hi : u.srot) || u.srot || '';
  const ss = shortSrot(srot);
  const kyun = (hi ? u.kyun_hi : u.kyun) || u.kyun || '';
  const bolne = sv ? (hi ? sv.bolne_hi : sv.bolne_en) : null;
  const matlab = sv ? (hi ? sv.matlab_hi : sv.matlab_en) : null;
  const kaise = sv ? ((hi ? sv.kaise_hi : sv.kaise_en) || []) : [];
  const chahiye = sv ? (hi ? sv.chahiye_hi : sv.chahiye_en) : null;
  const ds = u.daan_star || null;
  const dsMadhyam = ds ? (hi ? ds.madhyam_hi : ds.madhyam_en) : null;

  return (
    <article className="rounded-xl p-4 md:p-5 mb-4 break-inside-avoid"
      style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.25)' }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
          {t('upay', lang)} {n}{kism ? ` · ${kism}` : ''}
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
          style={paramparik
            ? { background: 'rgba(251,191,36,0.14)', color: '#fbbf24' }
            : { background: 'rgba(34,197,94,0.15)', color: '#86efac' }}>
          {paramparik ? t('parampara', lang) : t('granth', lang)}
        </span>
      </div>

      <h3 className="text-base md:text-lg font-bold leading-snug m-0 mb-2" style={{ color: GOLD }}>{heading}</h3>

      {sv ? (
        <>
          {bolne ? (
            <p className="text-sm md:text-base leading-relaxed m-0 mb-1.5" style={{ color: '#F1F5F9' }}>
              🔤 <b>{t('bolne', lang)}:</b> {bolne}
            </p>
          ) : null}
          {matlab ? (
            <p className="text-sm md:text-base leading-relaxed m-0 mb-1.5" style={{ color: '#E5E7EB' }}>
              💡 <b>{sv.matlab_prakar === 'uddeshya' ? t('uddeshya', lang) : t('matlab', lang)}:</b> {matlab}
            </p>
          ) : null}
          {ds ? (
            <div className="text-sm m-0 mb-1.5" style={{ color: '#E5E7EB' }}>
              <b>🌾 {t('daan', lang)}</b>
              <div className="grid gap-x-3 gap-y-1 mt-1" style={{ gridTemplateColumns: 'auto 1fr' }}>
                <b style={{ color: GOLD }}>{t('poorna', lang)}</b><span>{hi ? ds.poorna_hi : ds.poorna_en}</span>
                {dsMadhyam ? (<><b style={{ color: GOLD }}>{t('madhyam', lang)}</b><span>{dsMadhyam}</span></>) : null}
                <b style={{ color: GOLD }}>{t('saral', lang)}</b><span>{hi ? ds.saral_hi : ds.saral_en}</span>
              </div>
            </div>
          ) : kaise.length ? (
            <div className="text-sm md:text-base m-0 mb-1.5" style={{ color: '#E5E7EB' }}>
              ✅ <b>{t('kaise', lang)}:</b>
              <ol className="m-0 mt-1 pl-6 leading-relaxed">{kaise.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </div>
          ) : null}
          {chahiye ? (
            <p className="text-xs md:text-sm m-0 mt-1" style={{ color: '#cbd5e1' }}>🧺 {t('chahiye', lang)}: {chahiye}</p>
          ) : null}
        </>
      ) : (
        lines.slice(1).map((l, i) => (
          <p key={i} className="text-sm md:text-base font-bold leading-relaxed m-0 mb-2"
            style={{ color: i === 0 ? '#F1F5F9' : '#E5E7EB' }}>{l}</p>
        ))
      )}

      {u.sasta_vikalp ? (
        <p className="text-xs m-0 mt-1 font-semibold" style={{ color: '#FCD34D' }}>🌾 {t('sasta', lang)}: {u.sasta_vikalp}</p>
      ) : null}

      {(kyun || srot) ? (
        <p className="text-xs m-0 mt-2" style={{ color: '#64748b' }}>
          {kyun ? <>🎯 {t('kyun', lang)}: {kyun}</> : null}
          {kyun && srot ? ' · ' : ''}
          {srot ? (
            <>📖 {srotKhula || !ss.more ? srot : ss.short}
              {ss.more && !srotKhula ? (
                <button type="button" onClick={() => setSrotKhula(true)} className="ml-1 underline no-print"
                  style={{ color: '#94a3b8', background: 'none', border: 0, cursor: 'pointer', fontSize: 'inherit' }}>
                  +{ss.more} {t('aur', lang)}
                </button>
              ) : null}
            </>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}
// END — components/calculators/UpayCard.tsx v2.0
