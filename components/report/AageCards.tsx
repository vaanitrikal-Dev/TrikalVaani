'use client'

/**
 * components/report/AageCards.tsx — v1.2 — 15 October 2026
 *
 * v1.2 — grah ke naam teen bhasha ("Rahu / Shani" → "राहु / शनि"), aur
 *        shaniL ab theme.tsx se (Ateet table bhi wahi use karta hai).
 * v1.1 — Shani ke daur ka naam (SADE SATI / DHAIYA / KANTAK) Hindi/English.
 *
 * AAGE KA DAUR — table ki jagah CARDS (mobile par 4-column table scroll
 * hoti thi). Data WAHI: granth.aage (granth_api.py aage()). Har antardasha
 * ek card: naam + tareekh, granth ki line shlok ke saath, grah ki jagah,
 * aur PAID par gochar ki khidkiyan chips mein (⭐ = hari, do+ wajah).
 * Jargon ki jagah 1 line: "SD Budh" → "Sookshma: Budh", "Ch.34: shubh" →
 * "is lagna ke liye shubh grah", rajayoga ka darja saadi bhasha mein.
 * Sade Sati/Dhaiya ⚠️ ke bina — "Shani ka chakkar" label (Rohiit, 15 Oct):
 * chetavni ka WORDING wahi, sirf bar-bar ka ⚠️ emoji hata.
 */

import React from 'react'
import { Lang, GOLD, G, CARD_BG, s, L, Bold, grahL, shaniL } from './theme'

function ch34(x: unknown, lang: Lang): string {
  const d = s(x)
  if (d === '—' || d === 'GRANTH-CHUP') return L(lang, 'is grah par granth chup hai', 'इस ग्रह पर ग्रन्थ चुप है', 'the granth is silent on this planet')
  const map: Record<string, [string, string, string]> = {
    yogakaraka: ['is lagna ka yogakaraka grah', 'इस लग्न का योगकारक ग्रह', 'a yogakaraka for this ascendant'],
    shubh:      ['is lagna ke liye shubh grah', 'इस लग्न के लिए शुभ ग्रह', 'benefic for this ascendant'],
    sama:       ['is lagna ke liye sam grah', 'इस लग्न के लिए सम ग्रह', 'neutral for this ascendant'],
    paap:       ['is lagna ke liye paap grah', 'इस लग्न के लिए पाप ग्रह', 'malefic for this ascendant'],
    maarak:     ['is lagna ke liye kathin grah', 'इस लग्न के लिए कठिन ग्रह', 'a difficult planet for this ascendant'],
  }
  const t = map[d.toLowerCase()]
  return t ? L(lang, ...t) + ' (BPHS Ch.34)' : `Ch.34: ${d}`
}

export default function AageCards({ a, isPaid, lang, slug }: { a: any; isPaid: boolean; lang: Lang; slug: string }) {
  const daur: any[] = Array.isArray(a?.daur) ? a.daur : []
  if (!daur.length) return null
  const shani: any[] = Array.isArray(a?.shani_ke_daur) ? a.shani_ke_daur : []
  const ry: any[] = Array.isArray(a?.rajayoga) ? a.rajayoga : []
  const d = Number(a?.dikh_raha_saal ?? a?.saal ?? 0)
  const mah = Math.round(d * 12)
  const sub = !d ? '' : mah < 18 ? L(lang, `${mah} mahine aage`, `${mah} महीने आगे`, `${mah} months ahead`)
                                 : L(lang, `${d} saal aage`, `${d} साल आगे`, `${d} years ahead`)

  return (
    <div>
      <div style={{ margin: '22px 0 8px' }}>
        <div style={{ color: GOLD, fontWeight: 700, fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
          {L(lang, 'Aage ka daur', 'आगे का दौर', 'The road ahead')}
        </div>
        {sub && <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px' }}>{sub}</div>}
      </div>

      {daur.map((x: any, i: number) => {
        const lines: any[] = (Array.isArray(x.granth) ? x.granth : []).filter((g: any) => g?.phal && String(g.phal).trim())
        const kh: any[] = Array.isArray(x.gochar_khidkiyan) ? x.gochar_khidkiyan : []
        return (
          <div key={i} style={{ margin: '10px 0', border: `1px solid ${x.abhi ? G(0.35) : G(0.16)}`, borderRadius: '12px',
                                background: CARD_BG, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ color: GOLD, fontWeight: 700, fontSize: '14px', fontFamily: 'Georgia,serif' }}>
                {grahL(s(x.md), lang)} / {grahL(s(x.ad), lang)}
                {x.abhi && <span style={{ marginLeft: '8px', color: '#22c55e', fontSize: '10px', fontWeight: 700 }}>
                  {L(lang, '← ABHI', '← अभी', '← NOW')}</span>}
              </div>
              <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{s(x.se)} – {s(x.tak)}</div>
            </div>
            {x.sd && <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
              {L(lang, 'Sookshma dasha', 'सूक्ष्म दशा', 'Sookshma')}: {grahL(s(x.sd), lang)}</div>}

            <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.7 }}>
              {lines.length ? lines.map((g: any, gi: number) => (
                <div key={gi} style={{ marginBottom: '5px',
                      color: g.kind === 'shubh' ? '#86efac' : g.kind === 'kathin' || g.kind === 'maraka' ? '#fca5a5' : '#cbd5e1' }}>
                  <Bold t={s(g.phal)}/> <span style={{ color: '#64748b', fontSize: '11px' }}>({s(g.srot)})</span>
                </div>
              )) : <span style={{ color: '#64748b' }}>{L(lang, 'granth yahan chup hai', 'ग्रन्थ यहाँ चुप है', 'the granth is silent here')}</span>}
            </div>
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>{s(x.graha_ki_jagah)} · {ch34(x.ch34, lang)}</div>

            {isPaid && kh.length > 0 && (
              <div style={{ marginTop: '9px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {kh.map((k: any, ki: number) => {
                  const hari = k?.darja === 'hari'
                  const why = (Array.isArray(k.kyun) ? k.kyun : [k.kyun]).filter(Boolean).join('; ')
                  return (
                    <span key={ki} title={why} style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                        background: hari ? 'rgba(34,197,94,0.12)' : 'rgba(167,139,250,0.12)',
                        color: hari ? '#86efac' : '#c4b5fd', border: `1px solid ${hari ? 'rgba(34,197,94,0.3)' : 'rgba(167,139,250,0.3)'}` }}>
                      {hari ? '⭐ ' : ''}{s(k.se)} – {s(k.tak)}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {isPaid && shani.length > 0 && (
        <div style={{ margin: '10px 0', padding: '10px 14px', borderRadius: '12px', border: `1px solid ${G(0.16)}`, background: CARD_BG }}>
          <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {L(lang, 'Shani ka chakkar — aage', 'शनि का चक्कर — आगे', "Saturn's long cycle — ahead")}
          </div>
          {shani.map((x: any, i: number) => (
            <div key={i} style={{ color: '#e2e8f0', fontSize: '13px', marginTop: '5px' }}>
              <span style={{ fontWeight: 700 }}>{shaniL(x.kya, lang)}</span> <span style={{ color: '#94a3b8' }}>{s(x.se)} – {s(x.tak)}</span>
            </div>
          ))}
        </div>
      )}

      {isPaid && ry.length > 0 && (
        <div style={{ margin: '10px 0', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${G(0.16)}`, background: 'rgba(134,239,172,0.04)' }}>
          <div style={{ color: GOLD, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            {L(lang, 'Rajayoga — BPHS Ch.39', 'राजयोग — BPHS अ.39', 'Rajayoga — BPHS Ch.39')}
          </div>
          {ry.map((y: any, i: number) => {
            const dj = String(y.darja || '').toLowerCase()
            const plain = dj === 'poora' ? L(lang, 'Poora rajayoga — pad, samman aur adhikaar ka poora yog', 'पूरा राजयोग — पद, सम्मान और अधिकार का पूरा योग', 'Full rajayoga — full promise of position, honour and authority')
                        : dj === 'aadha' ? L(lang, 'Aadha rajayoga — pad aur samman mein sahara milega, poora nahi', 'आधा राजयोग — पद और सम्मान में सहारा मिलेगा, पूरा नहीं', 'Half rajayoga — support in position and honour, not the full measure')
                        : L(lang, 'Chauthai rajayoga — halka sahara', 'चौथाई राजयोग — हल्का सहारा', 'Quarter rajayoga — a light support')
            return (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{plain}</div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>{s(y.kaunsa)} — {s(y.baat)}
                  <span style={{ color: '#64748b', fontSize: '11px' }}> ({s(y.srot)})</span></div>
              </div>
            )
          })}
        </div>
      )}

      {!isPaid && Array.isArray(a?.paid_mein_kya_milega) && (
        <div style={{ margin: '10px 0', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${G(0.25)}`, background: 'rgba(212,175,55,0.05)' }}>
          <div style={{ color: GOLD, fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
            {L(lang, 'Poori reading mein:', 'पूरी रीडिंग में:', 'In the full reading:')}</div>
          {a.paid_mein_kya_milega.map((x: string, i: number) => (
            <div key={i} style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '3px' }}>· {s(x)}</div>))}
          <a href={`/report/${slug}?upgrade=1`} style={{ display: 'inline-block', marginTop: '10px', padding: '9px 16px',
              border: `1px solid ${G(0.4)}`, borderRadius: '8px', color: GOLD, fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>
            {L(lang, 'Poori reading lijiye — ₹51', 'पूरी रीडिंग लीजिए — ₹51', 'Get the full reading — ₹51')}
          </a>
        </div>
      )}
    </div>
  )
}
