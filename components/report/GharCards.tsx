'use client'

/**
 * components/report/GharCards.tsx — v1.0 — 15 October 2026
 *
 * ROHIIT KA FAISLA (15 Oct, mockup approve): har mukhya ghar ek CARD —
 *   Layer 1 (sabko)      : prediction BOLD + saari dates (⭐ = hari khidki)
 *   Layer 2 ("Kyun?")    : ghar ka haal, bindu, malik kahan, wajah, ph20
 *   Layer 3 ("Granth ke shlok") : BhavParat — har line apne shlok ke saath
 * Ye GranthSaar (prose) aur GranthAbhi (5-column table) DONO ki jagah leta
 * hai — par data WAHI do khaane hain: granth.abhi.saar (saar.py v1.5 ka
 * text) aur granth.abhi.mukhya (rows). Koi naya engine nahi, koi AI nahi.
 *
 * SAAR KA PARSE — saar.py v1.4+ har ghar ko apne paragraph mein likhta hai:
 *   line 0 : "Aapka 4tha ghar — ghar aur maa — **KAMZOR** hai, ... bindu 27 ..."
 *   line 1 : "**<prediction>** — ⭐ Dec 2027 – Mar 2028 · Aug 2029 – Sep 2029."
 *   line 2 : "(Guru 4the ghar ko DEKH raha hai, ...)"          (wajah)
 *   line 3 : "Granth — <phal> (BPHS 24.57) ..."               (granth)
 * Pehla paragraph "kul" (0 sahara, 2 kathin...) aur aakhri "chup" line hai.
 * Teeno bhasha mein ghar ka NUMBER line 0 ke shuru mein hota hai — usi se
 * mukhya row (m.bhav) se jodte hain. Jo paragraph parse na ho, wo NEECHE
 * jaise ka taisa chhapta hai — kuch chhupta nahi.
 */

import React from 'react'
import { Lang, GOLD, G, CARD_BG, HAAL_COLOR, HAAL_BG, s, L, Bold } from './theme'

export interface GharParsed {
  bhav: number
  haalLine: string          // line 0 (poori)
  prediction: string        // bold text, bina **
  dates: string             // "⭐ Dec 2027 – Mar 2028 · Aug 2029 – Sep 2029"
  hari: boolean             // koi ⭐ window hai
  wajah: string             // bracket ke andar
  granth: string            // "Granth — ..." ke baad
  raw: string
}
export interface SaarParsed {
  kul: string
  ghar: GharParsed[]
  chup: string
  baaki: string[]           // jo paragraph samajh nahi aaye
}

const RX_GHAR = /^(?:Aapka|आपका|Your)\s+(\d+)/i
const RX_PRED = /^\*\*(.+?)\*\*\s*[—-]\s*(.+?)\s*[।.]?\s*$/
// Agar ** na ho (purani row / PDF se copy) — "text — Mon YYYY ..." bhi prediction hai
const RX_PRED2 = /^(.+?)\s+[—-]\s+((?:⭐\s*)?[A-Za-z]{3}[a-z]*\s+\d{4}\b.+?)\s*[।.]?\s*$/
const RX_GRANTH = /^(?:Granth|ग्रन्थ|The granth)\s*[—-]\s*(.*)$/i

export function parseSaar(saar: string): SaarParsed {
  const out: SaarParsed = { kul: '', ghar: [], chup: '', baaki: [] }
  const paras = String(saar || '').trim().split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  paras.forEach((p, i) => {
    const lines = p.split('\n').map(x => x.trim()).filter(Boolean)
    const m = RX_GHAR.exec(lines[0] || '')
    if (m) {
      const g: GharParsed = { bhav: Number(m[1]), haalLine: lines[0], prediction: '', dates: '',
                              hari: false, wajah: '', granth: '', raw: p }
      for (const ln of lines.slice(1)) {
        const pm = RX_PRED.exec(ln) || (!ln.startsWith('(') && !RX_GRANTH.test(ln) ? RX_PRED2.exec(ln) : null)
        if (pm && !g.prediction) { g.prediction = pm[1].replace(/\*\*/g, '').trim(); g.dates = pm[2].trim(); g.hari = /⭐/.test(pm[2]); continue }
        if (ln.startsWith('(') && ln.endsWith(')') && !g.wajah) { g.wajah = ln.slice(1, -1); continue }
        const gm = RX_GRANTH.exec(ln)
        if (gm) { g.granth = (g.granth ? g.granth + ' ' : '') + gm[1].trim(); continue }
        // koi aur line — granth ke saath jod do, kho na jaaye
        g.granth = (g.granth ? g.granth + ' ' : '') + ln
      }
      out.ghar.push(g)
      return
    }
    if (i === 0 && /(मुख्य भाव|mukhya ghar|main houses)/i.test(p)) { out.kul = p; return }
    if (i === paras.length - 1 && /(चुप|chup|silent)/i.test(p)) { out.chup = p; return }
    out.baaki.push(p)
  })
  return out
}

/* ── ek card ─────────────────────────────────────────────────────────── */
function GharCard({ g, m, lang, parat }: {
  g: GharParsed; m: any; lang: Lang
  parat?: (m: any) => React.ReactNode
}) {
  const haal = String(m?.haal || (/\*\*(.+?)\*\*/.exec(g.haalLine)?.[1] ?? '')).toUpperCase()
  const haalTxt = L(lang,
    haal === 'MAZBOOT' ? 'Mazboot' : haal === 'KAMZOR' ? 'Kamzor' : 'Mila-jula',
    haal === 'MAZBOOT' ? 'मज़बूत' : haal === 'KAMZOR' ? 'कमज़ोर' : 'मिला-जुला',
    haal === 'MAZBOOT' ? 'Strong' : haal === 'KAMZOR' ? 'Weak' : 'Mixed')
  const vishay = s(m?.vishay, '')
  const kya = s(m?.kya, '')
  const bindu = m?.bindu
  const wajahList: string[] = Array.isArray(m?.wajah) ? m.wajah : []
  const nShlok = ['apne_chart_se', 'dasha_mein_aayega', 'is_ghar_ke_baare_mein']
    .reduce((n, k) => n + (Array.isArray(m?.parat?.[k]) ? m.parat[k].length : 0), 0)
  const faisla = m?.faisla?.faisla ? String(m.faisla.faisla) : ''
  const fC = faisla === 'HAAN' ? '#86efac' : faisla === 'NAHI' ? '#fca5a5' : '#fbbf24'
  const ghar = L(lang, `${g.bhav}va ghar`, `${g.bhav}वाँ भाव`, `${g.bhav}${g.bhav === 1 ? 'st' : g.bhav === 2 ? 'nd' : g.bhav === 3 ? 'rd' : 'th'} house`)

  return (
    <div style={{ margin: '10px 0', border: `1px solid ${G(0.16)}`, borderRadius: '12px',
                  background: CARD_BG, padding: '14px 14px 10px' }}>
      {/* sar — vishay + haal */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', fontFamily: 'Georgia,serif' }}>
            {vishay ? vishay.charAt(0).toUpperCase() + vishay.slice(1) : ghar}
            <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 400, marginLeft: '6px' }}>{vishay ? ghar : ''}</span>
          </div>
          {kya && <div style={{ color: '#64748b', fontSize: '11px', marginTop: '1px' }}>{kya}</div>}
        </div>
        <span style={{ flexShrink: 0, padding: '3px 9px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                       background: HAAL_BG(haal), color: HAAL_COLOR(haal), whiteSpace: 'nowrap' }}>
          {haalTxt}{typeof bindu === 'number' ? ` · ${bindu}` : ''}
          {m?.abhi_khula && <span style={{ marginLeft: '5px', color: '#22c55e' }}>★</span>}
        </span>
      </div>

      {/* LAYER 1 — prediction + dates */}
      {g.prediction ? (
        <div style={{ marginTop: '10px' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '14.5px', lineHeight: 1.55 }}>{g.prediction}</div>
          <div style={{ color: g.hari ? '#86efac' : '#cbd5e1', fontSize: '13px', marginTop: '4px', fontWeight: 600 }}>
            {g.dates}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '10px', color: '#94a3b8', fontSize: '12.5px', lineHeight: 1.6 }}>
          {L(lang, 'Agle 18 mahine mein is ghar par gochar ki koi khidki nahi — jo hai wo neeche "Kyun?" mein.',
                   'अगले 18 महीनों में इस भाव पर गोचर की कोई खिड़की नहीं — जो है वह नीचे "क्यों?" में।',
                   'No transit window on this house in the next 18 months — what the chart holds is under "Why?".')}
        </div>
      )}
      {faisla && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
          {L(lang, 'Hamara faisla', 'हमारा फ़ैसला', 'Our reading')}:
          <span style={{ color: fC, fontWeight: 800, marginLeft: '6px', fontSize: '12px' }}>{faisla}</span>
        </div>
      )}

      {/* LAYER 2 — Kyun? */}
      <details style={{ marginTop: '10px' }}>
        <summary style={{ listStyle: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '6px 12px', borderRadius: '8px', border: `1px solid ${G(0.3)}`,
                          color: GOLD, fontSize: '12px', fontWeight: 600, WebkitTapHighlightColor: 'transparent' }}>
          {L(lang, 'Kyun?', 'क्यों?', 'Why?')} <span aria-hidden="true">▾</span>
        </summary>
        <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)',
                      fontSize: '12.5px', lineHeight: 1.7, color: '#cbd5e1' }}>
          <div><Bold t={g.haalLine}/></div>
          {g.wajah && <div style={{ color: '#94a3b8', marginTop: '6px' }}>
            {L(lang, 'Gochar', 'गोचर', 'Transit')}: {g.wajah}</div>}
          {wajahList.length > 0 && (
            <div style={{ marginTop: '6px' }}>
              {wajahList.map((w, i) => <div key={i} style={{ color: '#cbd5e1' }}>· {s(w)}</div>)}
            </div>
          )}
          {m?.khinchav && <div style={{ color: '#fbbf24', marginTop: '6px' }}>⚠️ {s(m.khinchav)}</div>}
          {m?.ph20_phal && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {L(lang, `Is ghar ke malik (${s(m.ph20_swami)}) par — ${s(m.ph20_haalat)}`,
                         `इस भाव के स्वामी (${s(m.ph20_swami)}) पर — ${s(m.ph20_haalat)}`,
                         `On the lord of this house (${s(m.ph20_swami)}) — ${s(m.ph20_haalat)}`)}
                {Array.isArray(m.ph20_wajah) && m.ph20_wajah.length > 0 && <span> — {m.ph20_wajah.join('; ')}</span>}
              </div>
              <div style={{ fontStyle: 'italic', marginTop: '2px' }}><Bold t={s(m.ph20_phal)}/>
                <span style={{ color: '#64748b', fontSize: '11px' }}> ({s(m.ph20_srot)})</span></div>
            </div>
          )}
        </div>
      </details>

      {/* LAYER 3 — Granth ke shlok */}
      {(g.granth || nShlok > 0) && (
        <details style={{ marginTop: '8px' }}>
          <summary style={{ listStyle: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
                            color: '#94a3b8', fontSize: '12px', fontWeight: 600, WebkitTapHighlightColor: 'transparent' }}>
            {L(lang, 'Granth ke shlok', 'ग्रन्थ के श्लोक', 'Verses from the granth')}
            {nShlok > 0 && <span style={{ color: '#64748b' }}>({nShlok})</span>} <span aria-hidden="true">▾</span>
          </summary>
          <div style={{ marginTop: '10px', padding: '4px 12px 8px', fontSize: '12.5px', lineHeight: 1.7, color: '#cbd5e1' }}>
            {g.granth && <div style={{ color: '#e2e8f0' }}><Bold t={g.granth}/></div>}
            {parat ? parat(m) : null}
          </div>
        </details>
      )}
      <style>{`details > summary::-webkit-details-marker{display:none}`}</style>
    </div>
  )
}

/* ── poora section ───────────────────────────────────────────────────── */
export default function GharCards({ saar, mukhya, gaun, lang, parat }: {
  saar: string; mukhya: any[]; gaun?: any[]; lang: Lang
  parat?: (m: any) => React.ReactNode
}) {
  const P = parseSaar(saar)
  const rows: any[] = [...(Array.isArray(mukhya) ? mukhya : []), ...(Array.isArray(gaun) ? gaun : [])]
  const byBhav = new Map<number, any>()
  rows.forEach(r => { const b = Number(r?.bhav); if (b && !byBhav.has(b)) byBhav.set(b, r) })
  if (!P.ghar.length && !rows.length) return null

  // Saar ke ghar pehle (usi kram mein jo saar.py ne diya), phir jo rows bachi
  const seen = new Set<number>()
  const cards: { g: GharParsed; m: any }[] = []
  P.ghar.forEach(g => { seen.add(g.bhav); cards.push({ g, m: byBhav.get(g.bhav) }) })
  rows.forEach(r => {
    const b = Number(r?.bhav)
    if (b && !seen.has(b)) {
      seen.add(b)
      cards.push({ g: { bhav: b, haalLine: '', prediction: '', dates: '', hari: false, wajah: '', granth: '', raw: '' }, m: r })
    }
  })

  return (
    <div>
      <div style={{ margin: '22px 0 6px', color: GOLD, fontSize: '11px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.13em' }}>
        {L(lang, '🔱 Granth se aapka saar', '🔱 ग्रन्थ से आपका सार', '🔱 Your reading from the granth')}
      </div>
      {P.kul && <p style={{ margin: '0 0 6px', color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.8 }}><Bold t={P.kul}/></p>}
      {cards.map(({ g, m }) => <GharCard key={g.bhav} g={g} m={m} lang={lang} parat={parat}/>)}
      {P.baaki.map((p, i) => (
        <p key={i} style={{ margin: '10px 0 0', color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
          <Bold t={p}/></p>
      ))}
      {P.chup && <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: '12px' }}>{P.chup}</p>}
    </div>
  )
}
