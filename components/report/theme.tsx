'use client'

/**
 * components/report/theme.tsx — v1.1 — 15 October 2026
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
