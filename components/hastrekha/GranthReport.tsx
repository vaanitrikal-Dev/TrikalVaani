'use client';

// ============================================================
// File: components/hastrekha/GranthReport.tsx
// Version: 1.3 (28 Oct 2026) — "जीवन के सवाल" khula + "खुद गिनिए" widget | 1.2 (27 Oct 2026) — '### ' heading wale dabbe (एक दुर्लभ बात) ka khaali header theek | 1.1 (27 Oct 2026) — 'varsh_phal' (शुभ वर्ष) hissa pehle se khula | 1.0 (27 Oct 2026) — NAYA
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Hast Rekha v3 result screen ka granth-aadharit hissa. VM engine v2.0.0
// report.granth_report bhejta hai: summary_md + sections[{id, md}].
// Yeh file us chhote markdown ko React mein badalti hai — koi
// dangerouslySetInnerHTML nahi (report text kabhi HTML nahi banta).
//   ## heading · ### sub-heading · **bold** · *shlok* (danda wali line) ·
//   | table | · khaali line = naya paragraph.
// v1.3 (28 Oct 2026): VM engine 2.3 report.granth_report.ginti bhejta hai (granth 1.3.0).
//   'sawaal' hissa ab pehle se khula; uske neeche "खुद गिनिए" dabba — customer apne haath
//   par shaadi ki rekha (3.6.19–20), santaan ki rekha (3.6.4) gin kar aur anamika (3.2.9)
//   dekh kar button dabata hai → granth ka phal wahin. Kuch save / bheja nahi jaata.
//   Santaan mein ling ka koi button NAHI (PC-PNDT suraksha — sirf report ka paramparik vachan).
// Design: Rohiit approved mockup (27 Oct 2026) — saar dabba khula, baaki
// hisse band dabbe (tap karke khulte), upay ka alag card.
// ============================================================

import { useState, type ReactNode } from 'react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;
const SHLOK = /^\*([^*]+)\*\s*(\([^)]*\))?$/;

export interface GranthSection { id: string; md: string; }
export interface GranthGinti {
  vivah?: { haath?: string; shlok?: string; phal?: Record<string, string> };
  santaan?: { shlok?: string; phal_0?: string; phal_n?: string; max?: number };
  padhai?: { shlok?: string; phal?: Record<string, string> };
}
export interface GranthReportData {
  summary_md: string;
  sections: GranthSection[];
  lang?: string;
  ginti?: GranthGinti | null;
  meta?: { kam?: number; sahayak_graha?: string; faisle?: Record<string, unknown> };
}

// ── v1.3: "खुद गिनिए" — customer ki apni ginti par granth ka phal ──────────────
function Choice({ opts, value, onPick }: { opts: { k: string; label: string }[]; value: string | null; onPick: (k: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map(o => (
        <button key={o.k} type="button" onClick={() => onPick(o.k)} aria-pressed={value === o.k}
          className="min-h-[44px] min-w-[48px] px-3 rounded-lg text-sm font-semibold"
          style={value === o.k
            ? { background: GOLD, color: '#080B12' }
            : { border: `1px solid ${GOLD_RGBA(0.45)}`, color: '#F3F4F6', background: 'rgba(255,255,255,0.03)' }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Phal({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="text-sm leading-relaxed rounded-lg px-3 py-2" style={{ background: GOLD_RGBA(0.10), color: '#F0E2A8', margin: 0 }} aria-live="polite">
      {text}
    </p>
  );
}

export function GintiWidget({ g }: { g: GranthGinti }) {
  const [vivah, setVivah] = useState<string | null>(null);
  const [santaan, setSantaan] = useState<string | null>(null);
  const [padhai, setPadhai] = useState<string | null>(null);
  const sMax = Math.min(Math.max(Number(g.santaan?.max ?? 6), 1), 9);
  const santaanPhal = santaan === null ? null
    : santaan === '0' ? (g.santaan?.phal_0 ?? null)
    : (g.santaan?.phal_n ?? '').replace('{n}', santaan === String(sMax) ? `${sMax}+` : santaan);
  return (
    <div className="rounded-xl p-4 flex flex-col gap-4 mt-1" style={{ border: `1px dashed ${GOLD_RGBA(0.5)}`, background: 'rgba(255,255,255,0.02)' }}>
      <div>
        <p className="font-semibold text-[15px]" style={{ color: GOLD, margin: 0 }}>✋ खुद गिनिए — आपकी गिनती, ग्रंथ का फल</p>
        <p className="text-xs text-slate-400 mt-1" style={{ margin: 0 }}>अपना हाथ रोशनी में देखकर बटन दबाइए। यह कहीं सेव नहीं होता।</p>
      </div>
      {g.vivah?.phal && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-200" style={{ margin: 0 }}>💍 बाएँ हाथ में छोटी उँगली के नीचे, किनारे से आती आड़ी रेखाएँ ({g.vivah.shlok}):</p>
          <Choice value={vivah} onPick={setVivah}
            opts={[{ k: '0', label: 'कोई नहीं' }, { k: '1', label: '1' }, { k: '2', label: '2' }, { k: '3', label: '3+' }]} />
          <Phal text={vivah === null ? null : g.vivah.phal[vivah] ?? null} />
        </div>
      )}
      {g.santaan?.phal_n && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-200" style={{ margin: 0 }}>👶 अँगूठे की जड़ से कलाई की ओर जाती रेखाएँ ({g.santaan.shlok}):</p>
          <Choice value={santaan} onPick={setSantaan}
            opts={Array.from({ length: sMax + 1 }, (_, i) => ({ k: String(i), label: i === 0 ? 'कोई नहीं' : i === sMax ? `${i}+` : String(i) }))} />
          <Phal text={santaanPhal} />
        </div>
      )}
      {g.padhai?.phal && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-200" style={{ margin: 0 }}>📚 उँगलियाँ मिलाकर — अनामिका का सिरा तर्जनी से ऊपर है? ({g.padhai.shlok})</p>
          <Choice value={padhai} onPick={setPadhai} opts={[{ k: 'haan', label: 'हाँ' }, { k: 'nahi', label: 'नहीं' }]} />
          <Phal text={padhai === null ? null : g.padhai.phal[padhai] ?? null} />
        </div>
      )}
    </div>
  );
}

// ── inline: **bold** aur *italic* ─────────────────────────────────────────────
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<b key={`${keyBase}b${i}`} style={{ color: '#F3F4F6' }}>{m[1]}</b>);
    else out.push(<i key={`${keyBase}i${i}`}>{m[2]}</i>);
    last = re.lastIndex;
    i += 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function isShlok(line: string) {
  return SHLOK.test(line) && (line.includes('।') || line.includes('॥'));
}

// ── block markdown → React ───────────────────────────────────────────────────
export function GranthMarkdown({ md, hideFirstHeading = false }: { md: string; hideFirstHeading?: boolean }) {
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let table: string[] = [];
  let k = 0;
  let headingSkipped = !hideFirstHeading;

  const flushPara = () => {
    if (!para.length) return;
    const key = `p${k++}`;
    blocks.push(
      <p key={key} className="text-sm leading-relaxed" style={{ color: '#D1D5DB', margin: 0 }}>
        {para.map((ln, j) => (
          <span key={`${key}-${j}`}>{j > 0 && <br />}{inline(ln, `${key}-${j}`)}</span>
        ))}
      </p>,
    );
    para = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter(r => !/^[\s|:-]+$/.test(r));
    const key = `t${k++}`;
    blocks.push(
      <div key={key} className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map((r, ri) => {
              const cells = r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
              return (
                <tr key={`${key}-${ri}`}>
                  {cells.map((c, ci) => ri === 0
                    ? <th key={ci} className="text-left py-1.5 pr-3" style={{ color: GOLD, borderBottom: `1px solid ${GOLD_RGBA(0.35)}` }}>{c}</th>
                    : <td key={ci} className="py-1.5 pr-3" style={{ color: '#CBD5E1', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{inline(c, `${key}-${ri}-${ci}`)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>,
    );
    table = [];
  };

  for (const raw of md.split('\n')) {
    const s = raw.trim();
    if (s.startsWith('|')) { flushPara(); table.push(s); continue; }
    flushTable();
    if (!s) { flushPara(); continue; }
    if (s.startsWith('## ')) {
      flushPara();
      if (!headingSkipped) { headingSkipped = true; continue; }
      blocks.push(<h3 key={`h${k++}`} className="font-serif font-bold text-lg" style={{ color: GOLD, margin: 0 }}>{inline(s.slice(3), `h${k}`)}</h3>);
      continue;
    }
    if (s.startsWith('### ')) {
      flushPara();
      if (!headingSkipped) { headingSkipped = true; continue; }   // v1.2 — dabbe ke header mein ja chuka
      blocks.push(<h4 key={`h${k++}`} className="font-semibold text-base" style={{ color: GOLD, margin: 0 }}>{inline(s.slice(4), `h${k}`)}</h4>);
      continue;
    }
    if (isShlok(s)) {
      flushPara();
      const m = s.match(SHLOK)!;
      blocks.push(
        <div key={`s${k++}`} className="rounded-lg px-3 py-2.5" style={{ background: GOLD_RGBA(0.10) }}>
          <div className="font-serif text-[15px] leading-loose" style={{ color: '#F0CF5A' }} lang="sa">{m[1].trim()}</div>
          {m[2] && <div className="text-xs mt-0.5" style={{ color: '#C9A635' }}>हस्तसंजीवनम् {m[2].replace(/[()]/g, '')}</div>}
        </div>,
      );
      continue;
    }
    para.push(s.startsWith('- ') ? '• ' + s.slice(2) : s);   // v1.1 shubh varsh ki suchi
  }
  flushTable();
  flushPara();
  return <div className="flex flex-col gap-3">{blocks}</div>;
}

function headingOf(md: string): string {
  // v1.2 — pehli '## ' ya '### ' line (teeno_akhand '### एक दुर्लभ बात' se shuru hota hai)
  const line = md.split('\n').map(l => l.trim()).find(l => l.startsWith('## ') || l.startsWith('### '));
  return line ? line.replace(/^#+\s*/, '').replace(/\*\*/g, '') : '';
}

// ── Poora granth report: saar + band dabbe + upay card ───────────────────────
export function GranthReportView({ data }: { data: GranthReportData }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ bhavishya: true, varsh_phal: true, sawaal: true });   // v1.3
  const sections = data.sections || [];
  const upay = sections.find(s => s.id === 'upay');
  const samapan = sections.find(s => s.id === 'samapan');
  const tip = sections.find(s => s.id === 'photo_tip');
  const fold = sections.filter(s => !['upay', 'samapan', 'photo_tip'].includes(s.id));

  return (
    <div className="flex flex-col gap-4">
      {/* Saar — hamesha khula */}
      <section className="rounded-2xl p-5"
        style={{ background: `linear-gradient(160deg, ${GOLD_RGBA(0.16)}, rgba(8,11,18,0.9))`, border: `1px solid ${GOLD_RGBA(0.45)}` }}>
        <GranthMarkdown md={data.summary_md} />
      </section>

      <p className="text-xs font-semibold tracking-wider text-slate-400 mt-1">पूरी रिपोर्ट — हर हिस्सा खोलकर पढ़ें</p>

      {fold.map(s => {
        const isOpen = !!open[s.id];
        const title = headingOf(s.md);
        return (
          <section key={s.id} className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isOpen ? GOLD_RGBA(0.4) : 'rgba(255,255,255,0.10)'}` }}>
            <button type="button" onClick={() => setOpen(p => ({ ...p, [s.id]: !isOpen }))}
              aria-expanded={isOpen}
              className="w-full min-h-[56px] px-4 flex items-center justify-between text-left font-semibold text-[15px]"
              style={{ color: isOpen ? GOLD : '#E5E7EB' }}>
              <span>{title}</span>
              <span className="text-xl ml-3" style={{ color: GOLD }} aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 flex flex-col gap-3">
                <GranthMarkdown md={s.md} hideFirstHeading />
                {s.id === 'sawaal' && data.ginti && <GintiWidget g={data.ginti} />}
              </div>
            )}
          </section>
        );
      })}

      {upay && (
        <section className="rounded-2xl p-5" style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(129,140,248,0.40)' }}>
          <GranthMarkdown md={upay.md} />
        </section>
      )}

      {tip && (
        <section className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)' }}>
          <GranthMarkdown md={tip.md} />
        </section>
      )}

      {samapan && (
        <section className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <GranthMarkdown md={samapan.md} />
        </section>
      )}
    </div>
  );
}
