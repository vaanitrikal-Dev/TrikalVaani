'use client'

/**
 * components/report/TeenBaatein.tsx — v1.0 — 15 October 2026
 *
 * "3 baatein jo aapke liye sabse zaroori hain" — hero ke theek neeche.
 * ROHIIT (15 Oct): grahak ko pehli screen par JAWAB chahiye, granth nahi.
 * Teeno line usi saar se aati hain jo saar.py (VM) ne likha — koi AI nahi,
 * koi nayi ginti nahi. Chunav ka niyam saaf hai:
 *   1. pehla MAZBOOT ghar jiske paas prediction hai   → ✅
 *   2. pehla KAMZOR ghar jiske paas prediction hai    → ⚠️
 *   3. sabse paas ki ⭐ (hari) khidki, kisi bhi ghar ki → ⭐
 * Jo na mile wo line nahi aati — khaali jagah nahi bharte.
 */

import React from 'react'
import { Lang, GOLD, G, s, L } from './theme'
import { parseSaar, GharParsed } from './GharCards'

const MON: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }
function firstStarMonth(d: string): number {
  // "⭐ Dec 2027 – Mar 2028 · ⭐ Aug 2029 – Sep 2029" → 2027*12+12
  const m = /⭐\s*([A-Za-z]{3})\w*\s+(\d{4})/.exec(d)
  if (!m) return Infinity
  return Number(m[2]) * 12 + (MON[m[1].toLowerCase()] ?? 0)
}
function starRange(d: string): string {
  const m = /⭐\s*([A-Za-z]{3,}\s+\d{4}\s*[–-]\s*[A-Za-z]{3,}\s+\d{4})/.exec(d)
  return m ? m[1] : d.replace(/⭐/g, '').trim()
}

export default function TeenBaatein({ saar, mukhya, lang }: { saar: string; mukhya: any[]; lang: Lang }) {
  const P = parseSaar(saar)
  if (!P.ghar.length) return null
  const haalOf = (g: GharParsed) =>
    String((Array.isArray(mukhya) ? mukhya : []).find(m => Number(m?.bhav) === g.bhav)?.haal
      || (/\*\*(.+?)\*\*/.exec(g.haalLine)?.[1] ?? '')).toUpperCase()
  const vishayOf = (g: GharParsed) =>
    s((Array.isArray(mukhya) ? mukhya : []).find(m => Number(m?.bhav) === g.bhav)?.vishay, '')

  const items: { icon: string; text: string; sub: string }[] = []
  const strong = P.ghar.find(g => haalOf(g) === 'MAZBOOT' && g.prediction)
  if (strong) items.push({ icon: '✅', text: strong.prediction, sub: strong.dates.replace(/⭐/g, '').trim() })
  const weak = P.ghar.find(g => haalOf(g) === 'KAMZOR' && g.prediction)
  if (weak) items.push({ icon: '⚠️', text: weak.prediction, sub: weak.dates.replace(/⭐/g, '').trim() })
  const star = P.ghar.filter(g => g.hari).sort((a, b) => firstStarMonth(a.dates) - firstStarMonth(b.dates))[0]
  if (star && star !== strong && star !== weak) {
    items.push({ icon: '⭐', text: L(lang, 'Sabse paas ka shubh samay', 'सबसे पास का शुभ समय', 'Nearest favourable window')
                 + ': ' + starRange(star.dates), sub: vishayOf(star) || star.prediction })
  } else if (star) {
    items.push({ icon: '⭐', text: L(lang, 'Sabse achha samay', 'सबसे अच्छा समय', 'Best window') + ': ' + starRange(star.dates),
                 sub: vishayOf(star) })
  }
  if (!items.length) return null

  return (
    <div style={{ margin: '14px 0', padding: '14px 16px', borderRadius: '12px',
                  background: 'linear-gradient(180deg,rgba(212,175,55,0.10),rgba(212,175,55,0.03))',
                  border: `1px solid ${G(0.28)}` }}>
      <div style={{ color: GOLD, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
        {L(lang, `${items.length} baatein jo aapke liye sabse zaroori hain`,
                 `${items.length} बातें जो आपके लिए सबसे ज़रूरी हैं`,
                 `The ${items.length} things that matter most for you`)}
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '7px 0',
                              borderTop: i ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <span style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>{it.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', lineHeight: 1.5 }}>{it.text}</div>
            {it.sub && <div style={{ color: '#cbd5e1', fontSize: '12.5px', marginTop: '2px' }}>{it.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
