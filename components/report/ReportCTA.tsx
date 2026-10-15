'use client'

/**
 * components/report/ReportCTA.tsx — v1.0 — 15 October 2026
 *
 * Report ke ant mein ek hi CTA: Rohiit se seedhi baat, WhatsApp Business
 * (+91 92118 04111 — grahak ka message BUSINESS number par hi jaaye).
 * ROHIIT (15 Oct): "Personal Reading is for 15 mins at 499/- not 1 hr".
 * Message mein report ka link pehle se bhara hai, taaki Rohiit ko chart
 * dhoondhna na pade.
 */

import React from 'react'
import { Lang, GOLD, G, L } from './theme'

export default function ReportCTA({ slug, lang, personName }: { slug: string; lang: Lang; personName?: string }) {
  const url = `https://trikalvaani.com/report/${slug}`
  const msg = L(lang,
    `Pranam Rohiit ji, meri kundali report dekhi (${url}). 15 minute ki personal reading (₹499) book karni hai.`,
    `प्रणाम रोहित जी, मेरी कुण्डली रिपोर्ट देखी (${url})। 15 मिनट की पर्सनल रीडिंग (₹499) बुक करनी है।`,
    `Pranam Rohiit ji, I have read my kundali report (${url}). I would like to book the 15-minute personal reading (₹499).`)
  const href = `https://wa.me/919211804111?text=${encodeURIComponent(msg)}`
  return (
    <div style={{ margin: '22px 0 14px', padding: '18px 16px', borderRadius: '14px', textAlign: 'center',
                  background: `linear-gradient(135deg,${G(0.14)},rgba(8,11,18,0.95))`, border: `1px solid ${G(0.35)}` }}>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px', fontFamily: 'Georgia,serif' }}>
        {L(lang, 'Rohiit se seedhi baat', 'रोहित से सीधी बात', 'Talk to Rohiit directly')}
      </div>
      <div style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '4px', lineHeight: 1.6 }}>
        {L(lang, 'Is report par 15 minute ki personal reading — aapke sawaal, aapka chart, seedha jawab.',
                 'इस रिपोर्ट पर 15 मिनट की पर्सनल रीडिंग — आपके सवाल, आपका चार्ट, सीधा जवाब।',
                 'A 15-minute personal reading on this report — your questions, your chart, straight answers.')}
      </div>
      <a href={href} target="_blank" rel="noopener noreferrer"
         style={{ display: 'inline-block', marginTop: '12px', padding: '12px 22px', borderRadius: '10px',
                  background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.4)',
                  color: '#25D366', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
        📱 {L(lang, 'WhatsApp par book karein — ₹499', 'WhatsApp पर बुक करें — ₹499', 'Book on WhatsApp — ₹499')}
      </a>
      <div style={{ color: '#64748b', fontSize: '11px', marginTop: '8px' }}>
        {L(lang, 'Rohiit Gupta · Chief Vedic Architect · 16+ saal Parashara BPHS', 'रोहित गुप्ता · Chief Vedic Architect · 16+ साल पराशर BPHS', 'Rohiit Gupta · Chief Vedic Architect · 16+ years Parashara BPHS')}
      </div>
    </div>
  )
}
