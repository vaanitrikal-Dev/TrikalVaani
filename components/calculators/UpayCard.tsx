// ============================================================
// File: components/calculators/UpayCard.tsx   (NEW FILE)
// Version: v1.0 — 10 Oct 2026
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// EK UPAY KA CARD — Upay Calculator (free) aur /upay/[slug] report dono mein.
// ROHIIT KA NIYAM (3 Oct + 10 Oct 2026):
//   * Heading (Sanskrit mantra + granth) — GOLDEN + BOLD
//   * Baaki sab (Bolne ka mantra, vidhi) — BOLD, safed
//   * Kharcha, sasta vikalp aur srot neeche, chhote
// Data VM granth_api v4.2 upay_calculator() ke `upay[]` se aata hai.
// ============================================================

const GOLD = '#D4AF37';

export interface UpayItem {
  id?: number;
  heading?: string;
  upay?: string;
  kism?: string;
  granth?: string;
  srot?: string;
  kya_chahiye?: string | null;
  sasta_vikalp?: string | null;
  grah?: string | null;
  kyun?: string;
}

const KISM_NAAM: Record<string, string> = {
  'jap': 'Mantra jap', 'jap-diya': 'Jap + diya', 'havan-diya': 'Havan / diya', 'snaan': 'Snaan',
  'jal-arpan': 'Jal', 'surya-jal': 'Surya ko jal', 'raksha-dhaaga': 'Raksha dhaaga', 'daan': 'Daan',
  'seva': 'Seva', 'aradhana': 'Aaradhana', 'vriksharopan': 'Ped lagaana', 'prasad': 'Prasad',
  'dasha-shanti': 'Dasha shanti', 'vrat': 'Vrat', 'path': 'Paath', 'mantra-vidhi': 'Mantra vidhi',
};

const clean = (s: string) => s.replace(/\*\*/g, '').trim();

export default function UpayCard({ u, n }: { u: UpayItem; n: number }) {
  const lines = String(u.upay ?? '').split('\n').map(clean).filter(Boolean);
  const heading = clean(u.heading || lines[0] || '');
  const rest = lines.slice(1);
  const mantra = rest.find((l) => l.startsWith('Bolne ka mantra'));
  const body = rest.filter((l) => l !== mantra);

  return (
    <article
      className="rounded-xl p-4 md:p-5 mb-4 break-inside-avoid"
      style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.25)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
          Upay {n}{u.kism ? ` · ${KISM_NAAM[u.kism] ?? u.kism}` : ''}
        </span>
        {u.grah ? <span className="text-xs" style={{ color: '#94a3b8' }}>{u.grah}</span> : null}
      </div>

      <h3 className="text-base md:text-lg font-bold leading-snug m-0 mb-2" style={{ color: GOLD }}>
        {heading}
      </h3>

      {mantra ? (
        <p className="text-sm md:text-base font-bold leading-relaxed m-0 mb-2" style={{ color: '#F1F5F9' }}>
          {mantra}
        </p>
      ) : null}

      {body.map((l, i) => (
        <p key={i} className="text-sm md:text-base font-bold leading-relaxed m-0 mb-2" style={{ color: '#E5E7EB' }}>
          {l}
        </p>
      ))}

      {u.kya_chahiye ? (
        <p className="text-xs m-0 mt-2" style={{ color: '#cbd5e1' }}>🧺 Kya chahiye: {u.kya_chahiye}</p>
      ) : null}
      {u.sasta_vikalp ? (
        <p className="text-xs m-0 mt-1 font-semibold" style={{ color: '#FCD34D' }}>💰 Sasta vikalp: {u.sasta_vikalp}</p>
      ) : null}
      {u.kyun ? (
        <p className="text-xs m-0 mt-1" style={{ color: '#94a3b8' }}>🎯 Kyun: {u.kyun}</p>
      ) : null}
      {u.srot ? (
        <p className="text-xs m-0 mt-1" style={{ color: '#64748b' }}>📖 Srot: {u.srot}</p>
      ) : null}
    </article>
  );
}
// END — components/calculators/UpayCard.tsx v1.0
