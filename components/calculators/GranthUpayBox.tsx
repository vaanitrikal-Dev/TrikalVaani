/**
 * ============================================================
 * TRIKAL VAANI — Granth ke Upay (BPHS 84) — free calculators ka dabba
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/calculators/GranthUpayBox.tsx
 * VERSION: 1.0 (1 Oct 2026)
 * ============================================================
 * Rohiit ka manzoor design (1 Oct 2026): parampara ke 3 dabbon ke neeche ek
 * sunehra dabba — "📜 Granth ke Upay — BPHS 84", jo grah dukh-sthaan mein hai
 * usi ke 4 upay, har ek ka hawala. Data: route ka `granthUpay`
 * (lib/bphs84-upay.ts). Data na ho to kuch nahi dikhata.
 * ============================================================
 */
'use client';

import type { GranthUpay } from '@/lib/bphs84-upay';

const GOLD = '#D4AF37';

export default function GranthUpayBox({ data }: { data?: GranthUpay | null }) {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) return null;
  return (
    <div className="mt-5 rounded-xl p-4 md:p-5"
         style={{ background: 'rgba(212,175,55,0.08)', borderLeft: `4px solid ${GOLD}` }}>
      <div className="font-bold text-base" style={{ color: GOLD }}>📜 Granth ke Upay — BPHS 84</div>
      <div className="text-xs text-slate-400 mt-1 mb-3">
        {data.planet_hi} ({data.why_hi}) — जो ग्रह दुःस्थान में हो, उसी की शान्ति (BPHS 84.26)
      </div>
      <ul className="space-y-2">
        {data.items.map((it) => (
          <li key={it.n} className="text-sm leading-relaxed text-amber-100">
            <span className="font-semibold" style={{ color: GOLD }}>{it.title}:</span>{' '}
            {it.text}{' '}
            <span className="text-xs text-slate-400">({it.srot})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
