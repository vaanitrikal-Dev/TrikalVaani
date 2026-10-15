'use client'

/**
 * components/report/theme.tsx — v1.0 — 15 October 2026
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
