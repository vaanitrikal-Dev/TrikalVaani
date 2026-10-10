'use client';

// ============================================================
// File: app/upay/[slug]/UpayReportClient.tsx   (NEW FILE)
// Version: v1.0 — 10 Oct 2026
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Upay Report (₹51) — Janam Kundali report (app/report/[slug]/ReportPublicClient)
// ka hi dhaancha: SiteNav → hero card → sections → founder card →
// WhatsApp Share + PDF Download (browser print, wahi PDFBtn tareeka) → SiteFooter.
// Upay heading GOLDEN BOLD (print mein bhi gehra sunehra), baaki BOLD.
// Grahak ko koi ank nahi (_shadbala kabhi nahi dikhaya jaata).
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import UpayCard, { type UpayItem } from '@/components/calculators/UpayCard';

const GOLD = '#D4AF37';
const G = (a: number) => `rgba(212,175,55,${a})`;
const SITE = 'https://trikalvaani.com';

const GRAH: { id: string; hi: string }[] = [
  { id: 'Surya', hi: 'सूर्य' }, { id: 'Chandra', hi: 'चन्द्र' }, { id: 'Mangal', hi: 'मंगल' },
  { id: 'Budh', hi: 'बुध' }, { id: 'Guru', hi: 'गुरु' }, { id: 'Shukra', hi: 'शुक्र' },
  { id: 'Shani', hi: 'शनि' }, { id: 'Rahu', hi: 'राहु' }, { id: 'Ketu', hi: 'केतु' },
];

const pad = (n: number) => String(n).padStart(2, '0');

function PDFBtn() {
  const handle = () => {
    const st = document.createElement('style'); st.id = 'tv-print';
    st.textContent = `@media print {nav,footer,.site-nav,.site-footer,.no-print{display:none!important}body{background:#fff!important}*{color:#000!important;border-color:#ccc!important;background:transparent!important}h3{color:#7a5c00!important}article{page-break-inside:avoid}}`;
    document.head.appendChild(st); window.print();
    setTimeout(() => { const e = document.getElementById('tv-print'); if (e) e.remove(); }, 1500);
  };
  return (
    <button onClick={handle} className="no-print"
      style={{ padding: '11px 20px', borderRadius: '10px', background: G(0.08), border: `1px solid ${G(0.25)}`, color: GOLD, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
      📄 PDF Download
    </button>
  );
}

export default function UpayReportClient({ report, slug }: { report: any; slug: string }) {
  const res = report.result ?? {};
  const b = report.birth ?? {};
  const upay: UpayItem[] = Array.isArray(res.upay) ? res.upay : [];
  const name = (report.person_name || b.name || '').trim();
  const birthLine = [
    b.day && b.month && b.year ? `${pad(b.day)}-${pad(b.month)}-${b.year}` : null,
    b.hour != null ? `${pad(b.hour)}:${pad(b.minute ?? 0)}${b.time_assumed ? ' (maana hua)' : ''}` : null,
    b.city || null,
  ].filter(Boolean).join(' · ');
  const samasya: { slug: string; naam_hi?: string }[] = Array.isArray(res.samasya) ? res.samasya : [];
  const kamzor: string[] = (res.kamzor_grah ?? []).filter((g: string) => g);
  const url = `${SITE}/upay/${slug}`;
  const waShare = `https://wa.me/?text=${encodeURIComponent(`Meri Trikaal Vaani Upay Report — granth ke 10 upay: ${url}`)}`;

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
            <span style={{ color: '#94a3b8' }}>Aapki Report</span>
          </nav>

          {/* ── HERO ── */}
          <section style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(8,14,28,0.95))', border: `1px solid ${G(0.3)}`, borderRadius: '16px', padding: '22px', marginBottom: '18px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', color: GOLD, fontSize: '12px', letterSpacing: '2px' }}>🔱 MAHAKAAL KA ASHIRWAD 🔱</p>
            <h1 style={{ margin: '0 0 6px', color: GOLD, fontSize: '24px', fontWeight: 800 }}>
              {name ? `${name} ji — ` : ''}Aapke Granth Upay
            </h1>
            {birthLine ? <p style={{ margin: '0 0 8px', color: '#cbd5e1', fontSize: '13px' }}>{birthLine}</p> : null}
            {samasya.length ? (
              <p style={{ margin: '0 0 6px', color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>
                Samasya: {samasya.map((s) => s.naam_hi || s.slug).join(' · ')}
              </p>
            ) : null}
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
              {kamzor.length ? `Kamzor grah (Shadbala, BPHS 27): ${kamzor.join(', ')}` : ''}
              {res?.dasha?.md ? ` · Chalti dasha: ${res.dasha.md} – ${res.dasha.ad}` : ''}
            </p>
          </section>

          {/* ── kaise karein ── */}
          <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px' }}>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#cbd5e1' }}>
              <strong style={{ color: GOLD }}>Kaise karein:</strong> har upay ek alag kism ka hai aur alag granth se. Sabse aasaan 2-3 se shuru karein,
              roz ek hi samay par. Mantra Sanskrit mein jaisa likha hai waisa padhein. Jahan granth ka bada daan hai, wahan neeche sasta vikalp diya hai.
              Rog ke upay doctor ke ilaaj ke saath karein, uski jagah nahi.
            </p>
          </section>

          {/* ── 10 UPAY ── */}
          <h2 style={{ color: GOLD, fontSize: '20px', fontWeight: 800, margin: '0 0 12px' }}>Aapke {upay.length} Upay</h2>
          {upay.map((u, i) => <UpayCard key={u.id ?? i} u={u} n={i + 1} />)}

          {/* ── grah wise ── */}
          <section className="no-print" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', margin: '20px 0' }}>
            <h2 style={{ color: GOLD, fontSize: '17px', fontWeight: 800, margin: '0 0 10px' }}>Kisi bhi grah ke saare upay</h2>
            <div className="flex flex-wrap gap-2">
              {GRAH.map((g) => (
                <button key={g.id} type="button" onClick={() => grahDekho(g.id)}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={grah === g.id ? { background: GOLD, color: '#080B12' } : { background: 'transparent', color: '#e2e8f0', border: `1px solid ${G(0.35)}` }}>
                  {g.hi} {g.id}
                </button>
              ))}
            </div>
            {busy ? <p className="text-sm mt-3" style={{ color: GOLD }}>Upay aa rahe hain…</p> : null}
            {grah && grahUpay ? (
              <div className="mt-4">
                {grahUpay.length === 0
                  ? <p className="text-sm text-slate-400">Abhi upay nahi mil paaye — thodi der baad try karein.</p>
                  : grahUpay.map((u, i) => <UpayCard key={u.id ?? i} u={u} n={i + 1} />)}
              </div>
            ) : null}
          </section>

          {/* ── srot ── */}
          {res.srot_ki_baat ? (
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 18px' }}>📖 {res.srot_ki_baat}</p>
          ) : null}

          {/* ── ₹499 ── */}
          <section className="no-print" style={{ background: G(0.06), border: `1px solid ${G(0.25)}`, borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
            <p style={{ margin: '0 0 8px', color: '#e2e8f0', fontSize: '14px', fontWeight: 700 }}>Upay kaun sa pehle karein, kab tak karein — Rohiit Gupta se seedhi baat</p>
            <a href="https://wa.me/919211804111?text=Namaste%2C%20mujhe%20Upay%20Report%20par%20consultation%20chahiye" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '10px 18px', borderRadius: '10px', background: GOLD, color: '#080B12', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
              ₹499 Consultation — WhatsApp
            </a>
          </section>

          {/* ── founder ── */}
          <div style={{ background: 'rgba(8,14,28,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `1px solid ${G(0.35)}`, background: G(0.1) }}>
                <img src="/images/founder.png" alt="Rohiit Gupta — Chief Vedic Architect" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 700 }}>Rohiit Gupta</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Chief Vedic Architect · Trikaal Vaani</p>
              </div>
            </div>
            <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '13px', lineHeight: 1.6 }}>
              Har upay granth se hai — Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana, Grihya Sutra), Brihat Parashara Hora Shastra,
              Phaladeepika aur Jataka Parijata. Kamzor grah Swiss Ephemeris par Shadbala (BPHS 27) se nikala gaya. Koi AI nahi.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['16+ Years Vedic Study', 'Parashara BPHS', 'Atharvaveda', 'Swiss Ephemeris'].map((t) => (
                <span key={t} style={{ padding: '4px 9px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '11px' }}>{t}</span>
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
                Kisi aur ke upay
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
// END — app/upay/[slug]/UpayReportClient.tsx v1.0
