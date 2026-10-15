'use client'

/**
 * components/report/theme.tsx — v1.2 — 15 October 2026
 *
 * v1.2 — grah / rashi / nakshatra ke naam teen bhasha (grahL, rashiL, nakL),
 *        bhav ki ginti (bhavN), Ch.34 ka chhota label (ch34L), Shani ke daur
 *        (shaniL, charanL) aur Ateet ka 'kyun' (kyunL). Rohiit ki asli paid
 *        Hindi report par 'Rahu महादशा · Saturn अन्तर्दशा', 'Kumbha लग्न',
 *        'DHAIYA', 'Ch.34: maarak' jaise mishran pakde gaye the.
 *
 * v1.1 — VISHAY aur FAISLA ka Hindi/English (Rohiit: Hindi report mein ghar
 *        ka naam Hinglish aa raha tha). Dict saar.py ke _VISHAY_HI/_VISHAY_EN
 *        se liya — wahi 12 naam, wahi shabd.
 *
 * Report v12.0 ke naye components ka saajha saaman: rang, bhasha ka type,
 * **bold** helper, aur chhote labels. ReportPublicClient.tsx ke GOLD/G se
 * MILTE-JULTE rakhe hain (wahi hex), taaki purane aur naye card ek jaise
 * dikhein. Yahan koi data-logic nahi — sirf look.
 */

import React from 'react'

export type Lang = 'hinglish' | 'hindi' | 'english'

export const GOLD = '#D4AF37'
export const G = (a: number) => `rgba(212,175,55,${a})`
export const CARD_BG = 'rgba(10,15,30,0.5)'

export const HAAL_COLOR = (h: string) =>
  h === 'MAZBOOT' ? '#86efac' : h === 'KAMZOR' ? '#fca5a5' : '#fbbf24'
export const HAAL_BG = (h: string) =>
  h === 'MAZBOOT' ? 'rgba(34,197,94,0.10)' : h === 'KAMZOR' ? 'rgba(239,68,68,0.10)' : 'rgba(251,191,36,0.10)'

export function s(v: unknown, fb = '—'): string {
  if (v === null || v === undefined) return fb
  const t = String(v).trim()
  return t ? t : fb
}

/** Teen bhasha ka ek label. */
export function L(lang: Lang, hinglish: string, hindi: string, english: string): string {
  return lang === 'hindi' ? hindi : lang === 'english' ? english : hinglish
}

/** "**text**" ko asli bold banata hai — wahi helper jo ReportPublicClient mein hai. */
export function Bold({ t }: { t: string }) {
  const parts = String(t ?? '').split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') && p.length > 4
          ? <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>)}
    </>
  )
}

/** Card ka bahar ka dabba — ek jaisa har jagah. */
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ margin: '14px 0', border: `1px solid ${G(0.16)}`, borderRadius: '12px',
                  background: CARD_BG, overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

/** Section ka chhota gold heading. */
export function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ margin: '22px 0 8px' }}>
      <div style={{ color: GOLD, fontWeight: 700, fontSize: '13px', letterSpacing: '0.06em',
                    textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>{title}</div>
      {sub && <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px' }}>{sub}</div>}
    </div>
  )
}

/** Engine ke 12 vishay (Hinglish) → Hindi / English. saar.py ke dict se. */
const VISHAY: Record<string, [string, string]> = {
  'aap khud':              ['स्वयं — शरीर और स्वभाव', 'Yourself — health and nature'],
  'paisa aur parivar':     ['धन, संचय और कुटुम्ब', 'Wealth, savings and family'],
  'bhai-behen aur himmat': ['भाई-बहन और पराक्रम', 'Siblings and courage'],
  'ghar aur maa':          ['घर, भूमि और माता', 'Home, land and mother'],
  'santan aur padhai':     ['सन्तान, विद्या और बुद्धि', 'Children, study and judgement'],
  'mehnat aur rukavat':    ['परिश्रम, विरोध और रोग', 'Effort, obstacles and health'],
  'shaadi aur saathi':     ['विवाह और जीवनसाथी', 'Marriage and partnership'],
  'achanak badlaav':       ['आकस्मिक परिवर्तन और गुप्त बातें', 'Sudden change and hidden things'],
  'bhagya aur pita':       ['भाग्य, पिता और धर्म', 'Fortune, father and dharma'],
  'kaam aur pehchaan':     ['कर्म, पद और प्रतिष्ठा', 'Work, position and reputation'],
  'kamai aur laabh':       ['आय और लाभ', 'Income and gains'],
  'kharch aur videsh':     ['व्यय, दूर देश और एकान्त', 'Expense, distant places and solitude'],
}
export function vishayL(v: unknown, lang: Lang): string {
  const k = String(v ?? '').trim().toLowerCase()
  const t = VISHAY[k]
  if (!t) return String(v ?? '')
  return lang === 'hindi' ? t[0] : lang === 'english' ? t[1] : String(v)
}

const FAISLA: Record<string, [string, string]> = {
  'HAAN': ['हाँ', 'YES'], 'HO SAKTA HAI': ['हो सकता है', 'POSSIBLE'], 'NAHI': ['नहीं', 'NO'],
  'ABHI KATHIN': ['अभी कठिन', 'DIFFICULT FOR NOW'],
}
export function faislaL(f: unknown, lang: Lang): string {
  const k = String(f ?? '').trim().toUpperCase()
  const t = FAISLA[k]
  if (!t) return String(f ?? '')
  return lang === 'hindi' ? t[0] : lang === 'english' ? t[1] : k
}

/* ═══ v1.2 — naam teen bhasha ═══════════════════════════════════════════ */
const norm = (v: unknown) => String(v ?? '').toLowerCase().replace(/[^a-z]/g, '')

const GRAH: Record<string, [string, string, string]> = {
  surya: ['Surya', 'सूर्य', 'Sun'], chandra: ['Chandra', 'चन्द्र', 'Moon'], mangal: ['Mangal', 'मंगल', 'Mars'],
  budh: ['Budh', 'बुध', 'Mercury'], guru: ['Guru', 'गुरु', 'Jupiter'], shukra: ['Shukra', 'शुक्र', 'Venus'],
  shani: ['Shani', 'शनि', 'Saturn'], rahu: ['Rahu', 'राहु', 'Rahu'], ketu: ['Ketu', 'केतु', 'Ketu'],
}
const GRAH_ALIAS: Record<string, string> = {
  sun: 'surya', surya: 'surya', moon: 'chandra', chandra: 'chandra', mars: 'mangal', mangal: 'mangal',
  mercury: 'budh', budh: 'budh', budha: 'budh', jupiter: 'guru', guru: 'guru', brihaspati: 'guru',
  venus: 'shukra', shukra: 'shukra', saturn: 'shani', shani: 'shani', rahu: 'rahu', ketu: 'ketu',
}
/** "Saturn" / "Shani" → Shani · शनि · Saturn. Anjaan naam waisa hi. */
export function grahL(v: unknown, lang: Lang): string {
  const k = GRAH_ALIAS[norm(v)]
  if (!k) return String(v ?? '')
  const t = GRAH[k]
  return lang === 'hindi' ? t[1] : lang === 'english' ? t[2] : t[0]
}

const RASHI: Record<string, [string, string]> = {
  mesha: ['मेष', 'Aries'], vrishabha: ['वृषभ', 'Taurus'], mithuna: ['मिथुन', 'Gemini'], karka: ['कर्क', 'Cancer'],
  simha: ['सिंह', 'Leo'], kanya: ['कन्या', 'Virgo'], tula: ['तुला', 'Libra'], vrishchika: ['वृश्चिक', 'Scorpio'],
  dhanu: ['धनु', 'Sagittarius'], makara: ['मकर', 'Capricorn'], kumbha: ['कुम्भ', 'Aquarius'], meena: ['मीन', 'Pisces'],
}
const RASHI_ALIAS: Record<string, string> = {
  mesh: 'mesha', aries: 'mesha', vrishabh: 'vrishabha', vrishab: 'vrishabha', taurus: 'vrishabha',
  mithun: 'mithuna', gemini: 'mithuna', kark: 'karka', cancer: 'karka', simh: 'simha', leo: 'simha',
  virgo: 'kanya', libra: 'tula', vrishchik: 'vrishchika', vrischika: 'vrishchika', scorpio: 'vrishchika',
  dhanus: 'dhanu', sagittarius: 'dhanu', makar: 'makara', capricorn: 'makara', kumbh: 'kumbha',
  aquarius: 'kumbha', meen: 'meena', mina: 'meena', pisces: 'meena',
}
/** Rashi: Hindi report par Devanagari; English par naam waisa hi (Kumbha) — 'Aquarius' nahi, kyunki Vedic report hai. */
export function rashiL(v: unknown, lang: Lang): string {
  const n = norm(v); const k = RASHI[n] ? n : RASHI_ALIAS[n]
  if (!k || lang !== 'hindi') return String(v ?? '')
  return RASHI[k][0]
}

const NAK: Record<string, string> = {
  ashwini: 'अश्विनी', bharani: 'भरणी', krittika: 'कृत्तिका', rohini: 'रोहिणी', mrigashira: 'मृगशिरा',
  ardra: 'आर्द्रा', punarvasu: 'पुनर्वसु', pushya: 'पुष्य', ashlesha: 'आश्लेषा', magha: 'मघा',
  purvaphalguni: 'पूर्वा फाल्गुनी', uttaraphalguni: 'उत्तरा फाल्गुनी', hasta: 'हस्त', chitra: 'चित्रा',
  swati: 'स्वाति', vishakha: 'विशाखा', anuradha: 'अनुराधा', jyeshtha: 'ज्येष्ठा', mula: 'मूल',
  purvaashadha: 'पूर्वाषाढ़ा', uttaraashadha: 'उत्तराषाढ़ा', shravana: 'श्रवण', dhanishtha: 'धनिष्ठा',
  shatabhisha: 'शतभिषा', purvabhadrapada: 'पूर्वा भाद्रपद', uttarabhadrapada: 'उत्तरा भाद्रपद', revati: 'रेवती',
}
const NAK_ALIAS: Record<string, string> = {
  aswini: 'ashwini', mrigasira: 'mrigashira', mrigshira: 'mrigashira', aridra: 'ardra', pushyami: 'pushya',
  aslesha: 'ashlesha', ashlesa: 'ashlesha', purvaphalgun: 'purvaphalguni', poorvaphalguni: 'purvaphalguni',
  uttaraphalgun: 'uttaraphalguni', uttaraphalguna: 'uttaraphalguni', chitta: 'chitra', svati: 'swati',
  visakha: 'vishakha', jyeshta: 'jyeshtha', jyestha: 'jyeshtha', moola: 'mula', mool: 'mula',
  purvashadha: 'purvaashadha', poorvashadha: 'purvaashadha', uttarashadha: 'uttaraashadha',
  shravan: 'shravana', sravana: 'shravana', dhanishta: 'dhanishtha', shatabhishaj: 'shatabhisha',
  satabhisha: 'shatabhisha', purvabhadra: 'purvabhadrapada', poorvabhadrapada: 'purvabhadrapada',
  uttarabhadra: 'uttarabhadrapada', revathi: 'revati',
}
export function nakL(v: unknown, lang: Lang): string {
  const n = norm(v); const k = NAK[n] ? n : NAK_ALIAS[n]
  if (!k || lang !== 'hindi') return String(v ?? '')
  return NAK[k]
}

/** Bhav ki ginti: 4 → "4थे" / "4th" / "4the". Wahi roop jo saar.py likhta hai. */
export function bhavN(n: number, lang: Lang): string {
  if (lang === 'hindi') return n + (n === 1 ? 'ले' : n === 2 || n === 3 ? 'रे' : n === 4 ? 'थे' : n === 6 ? 'ठे' : 'वें')
  if (lang === 'english') return n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th')
  return n + (n === 1 ? 'le' : n === 2 || n === 3 ? 're' : n === 4 ? 'the' : n === 6 ? 'the' : 've')
}

/** Ateet table ka chhota Ch.34 label. Vedic arth wahi, sirf bhasha. */
const CH34: Record<string, [string, string]> = {
  yogakaraka: ['योगकारक', 'yogakaraka'], shubh: ['शुभ', 'benefic'], sama: ['सम', 'neutral'],
  sam: ['सम', 'neutral'], paap: ['पाप', 'malefic'], maarak: ['मारक', 'maraka'],
}
export function ch34L(v: unknown, lang: Lang): string {
  const raw = String(v ?? '')
  const t = CH34[raw.trim().toLowerCase()]
  if (lang === 'hindi') return 'अ.34: ' + (t ? t[0] : raw)
  if (lang === 'english') return 'Ch.34: ' + (t ? t[1] : raw)
  return 'Ch.34: ' + raw
}

/** Shani ke daur ka naam. */
const SHANI: Record<string, [string, string, string]> = {
  'SADE SATI': ['Sade Sati', 'साढ़े साती', 'Sade Sati'], 'DHAIYA': ['Dhaiya', 'ढैया', 'Dhaiya (2.5-yr Saturn)'],
  'KANTAK': ['Kantak Shani', 'कंटक शनि', 'Kantak Shani'],
}
export function shaniL(v: unknown, lang: Lang): string {
  const k = String(v ?? '').trim().toUpperCase().replace(/[_-]/g, ' ')
  const t = SHANI[k]
  if (!t) return String(v ?? '')
  return lang === 'hindi' ? t[1] : lang === 'english' ? t[2] : t[0]
}

/** Sade Sati ke charan / Dhaiya ki jagah — engine ke fixed vaakya. */
export function charanL(v: unknown, lang: Lang): string {
  const x = String(v ?? '').trim()
  if (lang === 'hinglish') return x
  const H = lang === 'hindi'
  const fixed: Record<string, [string, string]> = {
    'PEHLA charan (uthaav)':        ['पहला चरण (उठाव)', 'first phase (rising)'],
    'DOOSRA charan (sabse bhaari)': ['दूसरा चरण (सबसे भारी)', 'second phase (heaviest)'],
    'TEESRA charan (utaar)':        ['तीसरा चरण (उतार)', 'third phase (easing)'],
  }
  if (fixed[x]) return H ? fixed[x][0] : fixed[x][1]
  const m = /^Chandra se (\d+)\w*$/i.exec(x)
  if (m) return H ? `चन्द्र से ${bhavN(+m[1], 'hindi').replace(/थे$/, 'था').replace(/वें$/, 'वाँ')}` : `${bhavN(+m[1], 'english')} from the Moon`
  return x
}

/** Ateet ke "khule vishay" ka kyun — granth_reading ke teen fixed roop. */
export function kyunL(v: unknown, lang: Lang): string {
  const x = String(v ?? '').trim()
  if (lang === 'hinglish' || !x) return x
  const H = lang === 'hindi'
  let m = /^(\w+) khud (\d+)\w* ghar mein baitha hai$/i.exec(x)
  if (m) return H ? `${grahL(m[1], lang)} स्वयं ${bhavN(+m[2], lang)} भाव में बैठा है`
                  : `${grahL(m[1], lang)} itself sits in the ${bhavN(+m[2], lang)} house`
  m = /^(\w+) (\d+)\w* ghar ka MALIK hai$/i.exec(x)
  if (m) return H ? `${grahL(m[1], lang)} ${bhavN(+m[2], lang)} भाव का स्वामी है`
                  : `${grahL(m[1], lang)} is the lord of the ${bhavN(+m[2], lang)} house`
  m = /^(\w+) (.+) ka MUKHYA GRAH hai$/i.exec(x)
  if (m) return H ? `${grahL(m[1], lang)} "${vishayL(m[2], lang)}" का मुख्य (कारक) ग्रह है`
                  : `${grahL(m[1], lang)} is the main significator of "${vishayL(m[2], lang)}"`
  return x
}
