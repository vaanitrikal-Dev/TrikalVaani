'use client';

// ============================================================
// File: components/calculators/StoneScoreboard.tsx
// Version: v2.0 — 📖 GRANTH SE dabba (21 Sep 2026)
// Shared result UI: the ranked 9-stone suitability scoreboard
// (signature element) + DetailCell. Reused by all gemstone pages.
//
// ⭐ v2.0 — Rohiit ka faisla (21 Sep): ratna par GRANTH ka dabba.
//   * "ye ratna is grah ka hai" — Jataka Parijata 2.21 (jyon ka tyon)
//   * "granth ka upay" — BPHS 84.17: mantra, jaap-sankhya, samidha
// ⚠️ ZAROORI SACH: granth batata hai KIS GRAH ka kaunsa ratna hai, par
// ye NAHI batata ki AAP kaunsa pehnein. Grah ki peeda par granth ka upay
// RATNA nahi, MANTRA-JAAP aur HAVAN hai (BPHS Ch.84). Ratna pehnne ka
// faisla parampara se hai — aur wo gemstone.ts ke score se aata hai.
// Dakshina (BPHS 84.17 mein pashu-daan tak hai) JAAN-BOOJH KAR nahi
// dikhaya — Rohiit ne mantra + jaap + samidha manzoor kiya tha.
// ============================================================

import { VERDICT_COLOR, type StoneResult } from '@/lib/jyotish/gemstone';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ⭐ 21 Sep — ratna_phala (Supabase) se seedha. Ratna ka naam JP 2.21 jaisa.
// ⚠️ JP 2.21 SHUKRA ka ratna "गारुत्मक" kehta hai, "हीरा" nahi — granth
// jaisa hi rakha gaya.
export const GRANTH_RATNA: Record<string, {
  ratna: string; mantra: string; jaap: string; samidha: string;
}> = {
  Sun:     { ratna: 'माणिक्य',              mantra: 'आकृष्णेन',          jaap: 'सात हज़ार',     samidha: 'अर्क' },
  Moon:    { ratna: 'मुक्ता-फल (मोती)',      mantra: 'इमं देवा',          jaap: 'ग्यारह हज़ार',  samidha: 'पलाश' },
  Mars:    { ratna: 'विद्रुम (मूँगा)',       mantra: 'अग्निर्मूर्धा',     jaap: 'दस हज़ार',      samidha: 'खदिर' },
  Mercury: { ratna: 'मरकत (पन्ना)',         mantra: 'उद्बुध्यस्व',       jaap: 'नौ हज़ार',      samidha: 'अपामार्ग' },
  Jupiter: { ratna: 'पुष्पराग (पुखराज)',    mantra: 'बृहस्पते',          jaap: 'उन्नीस हज़ार',  samidha: 'पीपल' },
  Venus:   { ratna: 'गारुत्मक',             mantra: 'अन्नात् परिस्रुतः', jaap: 'सोलह हज़ार',    samidha: 'गूलर' },
  Saturn:  { ratna: 'नील (नीलम)',           mantra: 'शन्नो देवीः',       jaap: 'तेईस हज़ार',    samidha: 'शमी' },
  Rahu:    { ratna: 'गोमेद',                mantra: 'कया नश्चित्र',      jaap: 'अठारह हज़ार',   samidha: 'दूर्वा' },
  Ketu:    { ratna: 'वैडूर्य (लहसुनिया)',   mantra: 'केतुं कृण्वन्',     jaap: 'सत्रह हज़ार',   samidha: 'कुश' },
};

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चन्द्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
  Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

/* 📖 GRANTH SE — ek grah ka ratna aur uska granth-upay */
export function GranthRatnaBox({ graha }: { graha?: string | null }) {
  const g = graha ? GRANTH_RATNA[graha] : undefined;
  if (!g) return null;
  const hi = PLANET_HI[graha as string] ?? graha;
  return (
    <div className="rounded-2xl p-4 md:p-5 mt-4"
      style={{ background: 'rgba(212,175,55,0.05)', border: `1px solid ${GOLD_RGBA(0.22)}` }}>
      <p className="text-xs font-bold uppercase m-0 mb-3" style={{ color: GOLD, letterSpacing: '0.12em' }}>
        📖 Granth se
      </p>
      <p className="text-sm m-0 mb-3 leading-relaxed" style={{ color: '#cbd5e1' }}>
        <strong style={{ color: '#fff' }}>{g.ratna}</strong> — {hi} ka ratna
        <span className="text-slate-500 text-xs"> (Jataka Parijata 2.21)</span>
      </p>
      <p className="text-sm m-0 mb-1 font-semibold" style={{ color: '#e2e8f0' }}>
        Granth ka upay — {hi} ki shanti:
      </p>
      <p className="text-sm m-0 leading-relaxed" style={{ color: '#cbd5e1' }}>
        &ldquo;{g.mantra}&rdquo; mantra · <strong style={{ color: '#fff' }}>{g.jaap}</strong> jaap
        <br />
        {g.samidha} ki samidha se havan
        <span className="text-slate-500 text-xs"> (BPHS 84.17)</span>
      </p>
    </div>
  );
}

export function StoneScoreboard({ stones, highlight }: { stones: StoneResult[]; highlight?: string }) {
  return (
    <div className="rounded-2xl p-4 md:p-6" style={{ background: 'rgba(13,17,30,0.7)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
      <h3 className="text-lg font-serif font-bold mb-4" style={{ color: GOLD }}>Saare 9 Ratna — Suitability Ranking</h3>
      <div className="space-y-2.5">
        {stones.map((s) => {
          const vc = VERDICT_COLOR[s.verdictKey];
          const isHi = highlight && s.graha === highlight;
          return (
            <div key={s.graha} className="rounded-xl p-3 md:p-4"
              style={{ background: isHi ? GOLD_RGBA(0.08) : 'rgba(2,8,23,0.5)', border: `1px solid ${isHi ? GOLD_RGBA(0.5) : vc.c + '33'}` }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <span className="font-semibold" style={{ color: '#e2e8f0' }}>{s.stone_en}</span>
                  <span className="text-slate-500 text-sm ml-1">({s.stone_hi})</span>
                  <span className="text-xs text-slate-500 ml-2">{s.graha}</span>
                  {isHi && <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded" style={{ background: GOLD, color: '#080B12' }}>YEH</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: s.risk >= 15 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)', color: s.risk >= 15 ? '#FCA5A5' : '#94a3b8' }}>Risk: {s.riskLabel}</span>
                  <span className="text-lg font-bold tabular-nums" style={{ color: vc.c }}>{s.score}</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: vc.c }} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: vc.bg, color: vc.c }}>{s.verdictLabel}</span>
                {s.flags.length > 0 && <span className="text-[11px] text-slate-500">{s.flags.join(' · ')}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-600 mt-3">Score = functional benefic + Shadbala + dignity + bhaav + dasha − affliction − risk. Strong ratna (Neelam/Gomed/Lehsunia) ka verdict suraksha ke liye "Expert Review" tak seemit hai.</p>
      {/* ⭐ 21 Sep — GRANTH SE: jis ratna ka page hai uska (highlight),
          warna sabse upar wala (suitability page par). Score ko nahi chhoota. */}
      <GranthRatnaBox graha={highlight || stones[0]?.graha} />
    </div>
  );
}

export function DetailCell({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="font-bold text-sm" style={{ color: GOLD }}>{value ?? '—'}</div>
    </div>
  );
}
