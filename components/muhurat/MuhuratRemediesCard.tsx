/**
 * ============================================================
 * TRIKAL VAANI — Muhurat Remedies Card Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/muhurat/MuhuratRemediesCard.tsx
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Renders the 10 personalised remedies from the muhurat reading's
 * remedies_data (VM build_master_remedies output). Premium design
 * mirroring the Milan remedies card, adapted to the muhurat data
 * structure:
 *   remedies_data = {
 *     total, lang, note, weak_planet, strong_planet,
 *     systems: { Parashar, Bhrigu, Shadbala },
 *     remedies: [ { number, title, detail, type, system, effort, planet? } ]
 *   }
 *
 * Grouped into 3 system sections: Parashar · Bhrigu Nadi · Shadbala.
 * Shown ONLY on the remedies_151 tier (the Rs151 differentiator).
 * ============================================================
 */

'use client';

// ── Types ─────────────────────────────────────────────────────
interface MuhuratRemedy {
  number: number;
  title:  string;
  detail: string;
  type:   string;
  system: string;            // "Parashar" | "Bhrigu" | "Shadbala"
  effort?: string;           // "easy" | "medium" | "premium"
  planet?: string;
}

interface MuhuratRemediesData {
  total?:         number;
  lang?:          string;
  note?:          string;
  weak_planet?:   string;
  strong_planet?: string;
  systems?:       Record<string, number>;
  remedies?:      MuhuratRemedy[];
}

interface Props {
  remediesData: MuhuratRemediesData | null;
}

// ── Icon by remedy type ───────────────────────────────────────
function typeIcon(type: string): string {
  const t = (type || '').toLowerCase();
  if (t.includes('mantra'))         return '🕉️';
  if (t.includes('daan'))           return '🌾';
  if (t.includes('vrat'))           return '🌙';
  if (t.includes('pooja'))          return '🪔';
  if (t.includes('gemstone'))       return '💎';
  if (t.includes('guru'))           return '✨';
  if (t.includes('karmic'))         return '🔄';
  if (t.includes('navamsa'))        return '💫';
  if (t.includes('rahu'))           return '☄️';
  if (t.includes('strengthen'))     return '🪯';
  if (t.includes('channel'))        return '⚡';
  return '🔱';
}

// ── Effort chip styling ───────────────────────────────────────
function effortChip(effort?: string): { label: string; cls: string } | null {
  const e = (effort || '').toLowerCase();
  if (e === 'easy')    return { label: 'Aasaan',  cls: 'text-emerald-300 bg-emerald-900/25 border-emerald-500/25' };
  if (e === 'medium')  return { label: 'Madhyam', cls: 'text-amber-300 bg-amber-900/25 border-amber-500/25' };
  if (e === 'premium') return { label: 'Premium', cls: 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30' };
  return null;
}

// ── Single remedy card ────────────────────────────────────────
function RemedyCard({ r }: { r: MuhuratRemedy }) {
  const chip = effortChip(r.effort);
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-[#080B12]/60 border border-[#D4AF37]/10 hover:border-[#D4AF37]/25 transition">
      {/* Number + icon */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
        <div className="w-7 h-7 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
          {r.number}
        </div>
        <span className="text-base">{typeIcon(r.type)}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold text-white">{r.title}</span>
          {r.planet && (
            <span className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
              {r.planet}
            </span>
          )}
          {chip && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${chip.cls}`}>
              {chip.label}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-300 leading-relaxed">{r.detail}</div>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function RemedySection({
  title, title_hi, subtitle, count, color, children,
}: {
  title: string; title_hi: string; subtitle: string;
  count: number; color: string; children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${color}`} />
        <div className="text-center px-2">
          <div className={`text-xs font-bold tracking-[0.25em] uppercase ${color.replace('to-', 'text-').replace('/40', '')}`}>
            {title}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">{title_hi} · {count} remedies</div>
        </div>
        <div className={`h-px flex-1 bg-gradient-to-l from-transparent ${color}`} />
      </div>
      <div className="text-[10px] text-gray-500 text-center mb-3 tracking-wide">{subtitle}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function MuhuratRemediesCard({ remediesData }: Props) {
  if (!remediesData || !Array.isArray(remediesData.remedies) || remediesData.remedies.length === 0) {
    return null;
  }

  const all = remediesData.remedies;
  const parashar = all.filter((r) => (r.system || '').toLowerCase() === 'parashar');
  const bhrigu   = all.filter((r) => (r.system || '').toLowerCase() === 'bhrigu');
  const shadbala = all.filter((r) => (r.system || '').toLowerCase() === 'shadbala');

  return (
    <section className="max-w-3xl mx-auto px-5 mb-10">
      <div className="bg-gradient-to-br from-[#0d1120] to-[#1a1a2e] border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8 shadow-xl">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="text-2xl mb-2">🪔</div>
          <div className="text-[10px] sm:text-xs text-[#D4AF37] tracking-[0.4em] uppercase mb-1">
            10 Vishesh Upay
          </div>
          <div className="text-[10px] text-gray-500 tracking-widest">
            विशेष उपाय · Aapke bachche ke shubh bhavishya ke liye
          </div>
          <div className="mt-3 inline-flex items-center gap-4 text-[10px] text-gray-500">
            <span>4 Parashar</span>
            <span className="text-[#D4AF37]/40">·</span>
            <span>4 Bhrigu Nadi</span>
            <span className="text-[#D4AF37]/40">·</span>
            <span>2 Shadbala</span>
          </div>
        </div>

        {/* ── Maharishi Parashar ── */}
        {parashar.length > 0 && (
          <RemedySection
            title="Maharishi Parashar"
            title_hi="महर्षि पाराशर · BPHS"
            subtitle="Classical remedies from Brihat Parashara Hora Shastra"
            count={parashar.length}
            color="to-amber-500/40"
          >
            {parashar.map((r, i) => <RemedyCard key={`p-${i}`} r={r} />)}
          </RemedySection>
        )}

        {/* ── Bhrigu Nandi Nadi ── */}
        {bhrigu.length > 0 && (
          <RemedySection
            title="Bhrigu Nandi Nadi"
            title_hi="भृगु नन्दी नाड़ी"
            subtitle="Karmic corrections from the Bhrigu tradition"
            count={bhrigu.length}
            color="to-purple-500/40"
          >
            {bhrigu.map((r, i) => <RemedyCard key={`b-${i}`} r={r} />)}
          </RemedySection>
        )}

        {/* ── Shadbala ── */}
        {shadbala.length > 0 && (
          <RemedySection
            title="Shadbala"
            title_hi="षड्बल · 6-Fold Strength"
            subtitle="Planetary strength activations based on Shadbala analysis"
            count={shadbala.length}
            color="to-emerald-500/40"
          >
            {shadbala.map((r, i) => <RemedyCard key={`s-${i}`} r={r} />)}
          </RemedySection>
        )}

        {/* Footer note */}
        <div className="mt-6 pt-5 border-t border-[#D4AF37]/10 text-center">
          {remediesData.note && (
            <p className="text-xs text-gray-500 leading-relaxed">{remediesData.note}</p>
          )}
          {(remediesData.weak_planet || remediesData.strong_planet) && (
            <p className="text-[10px] text-gray-600 mt-2">
              {remediesData.strong_planet && <>Sabse balwan: <span className="text-[#D4AF37]/80">{remediesData.strong_planet}</span></>}
              {remediesData.weak_planet && <> · Sabse kamzor: <span className="text-gray-400">{remediesData.weak_planet}</span></>}
            </p>
          )}
          <p className="text-[10px] text-gray-600 mt-1">
            Source: Brihat Parashara Hora Shastra · Bhrigu Nandi Nadi · Shadbala (Parashari 6-fold)
          </p>
        </div>

      </div>
    </section>
  );
}
