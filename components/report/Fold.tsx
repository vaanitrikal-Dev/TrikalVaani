'use client'

/**
 * components/report/Fold.tsx — v1.0 — 15 October 2026
 *
 * Tap-se-khulne wala section (mobile ke liye). Native <details>/<summary>
 * — koi JS state nahi, SSR mein bhi theek, PDF print mein `open` se khula.
 * Rohiit ka faisla (15 Oct): Ateet, Upay, Chakra aur "Gehraai mein" default
 * BAND; grahak tap kare to khule. Andar ka content JAISA THA waisa hi — sirf
 * dabba badla, cards nahi.
 */

import React from 'react'
import { GOLD, G, CARD_BG } from './theme'

export default function Fold({ title, sub, count, open, children, id }: {
  title: string; sub?: string; count?: number | string; open?: boolean
  children: React.ReactNode; id?: string
}) {
  return (
    <details id={id} open={open}
      style={{ margin: '10px 0', border: `1px solid ${G(0.16)}`, borderRadius: '12px',
               background: CARD_BG, overflow: 'hidden' }}>
      <summary style={{ listStyle: 'none', cursor: 'pointer', padding: '14px 16px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        WebkitTapHighlightColor: 'transparent' }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ color: GOLD, fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em',
                         textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>{title}</span>
          {sub && <span style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>{sub}</span>}
        </span>
        {count !== undefined && count !== '' && (
          <span style={{ color: '#64748b', fontSize: '11px', whiteSpace: 'nowrap' }}>{count}</span>
        )}
        <span aria-hidden="true" style={{ color: GOLD, fontSize: '14px', transition: 'transform .15s' }}
              className="tv-fold-chev">▾</span>
      </summary>
      <div style={{ padding: '0 10px 10px' }}>{children}</div>
      <style>{`
        details > summary::-webkit-details-marker { display:none }
        details[open] > summary .tv-fold-chev { transform: rotate(180deg) }
        details[open] > summary { border-bottom: 1px solid ${G(0.1)} }
      `}</style>
    </details>
  )
}
