/**
 * ============================================================
 * TRIKAL VAANI — Milan Remedies Card Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/milan/MilanRemediesCard.tsx
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Renders 10 remedies from remedies_data in 3 clean sections:
 *   • Maharishi Parashar (4 remedies)
 *   • Bhrigu Nandi Nadi (4 remedies)
 *   • Shadbala (2 remedies)
 *
 * Shown on PAID tiers only (basic_51, deep_101, both_151).
 * Reads directly from engine data — no Gemini involved.
 * ============================================================
 */

'use client';

// ── Types ─────────────────────────────────────────────────────
interface ParasharRemedy {
  name:                  string;
  type:                  string;
  source:                string;
  description:           string;
  description_hi:        string;
  mantra_sanskrit?:      string;
  mantra_transliterated?: string;
  duration?:             string;
  day?:                  string;
  time?:                 string;
  count?:                string;
  items?:                string;
  recipient?:            string;
  quantity?:             string;
  rules?:                string;
  prasad?:               string;
  location?:             string;
  requirements?:         string;
}

interface BhriguRemedy {
  name:              string;
  type:              string;
  source:            string;
  description:       string;
  description_hi:    string;
  duration?:         string;
  offering?:         string;
  practice?:         string;
  why_personalized?: string;
}

interface ShadbalRemedy {
  name:                          string;
  type:                          string;
  source:                        string;
  description:                   string;
  description_hi:                string;
  gem?:                          string;
  metal?:                        string;
  finger?:                       string;
  day_to_wear?:                  string;
  time_to_wear?:                 string;
  direction?:                    string;
  duration?:                     string;
  practice?:                     string;
  caveat?:                       string;
  why_personalized?:             string;
  expert_consultation_required?: boolean;
}

interface RemediesData {
  parashar:      ParasharRemedy[];
  bhrigu:        BhriguRemedy[];
  shadbala:      ShadbalRemedy[];
  total_remedies: number;
}

interface Props {
  remediesData: RemediesData | null;
  tier:         string;
}

// ── Type icon by remedy type ──────────────────────────────────
function typeIcon(type: string): string {
  if (type.includes('mantra'))   return '🕉️';
  if (type.includes('daan'))     return '🌾';
  if (type.includes('vrat'))     return '🌙';
  if (type.includes('pooja'))    return '🪔';
  if (type.includes('jupiter') || type.includes('guru')) return '✨';
  if (type.includes('karmic'))   return '🔄';
  if (type.includes('navamsa'))  return '💫';
  if (type.includes('event'))    return '⭐';
  if (type.includes('sthana'))   return '💎';
  if (type.includes('dig'))      return '🧭';
  return '🔱';
}

// ── Single remedy bullet card ─────────────────────────────────
function RemedyCard({
  number,
  name,
  type,
  description,
  description_hi,
  detail,
  caveat,
}: {
  number:         number;
  name:           string;
  type:           string;
  description:    string;
  description_hi: string;
  detail?:        string;
  caveat?:        string;
}) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-[#080B12]/60 border border-[#D4AF37]/10 hover:border-[#D4AF37]/25 transition">
      {/* Number + icon */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
        <div className="w-7 h-7 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
          {number}
        </div>
        <span className="text-base">{typeIcon(type)}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white mb-1">{name}</div>
        <div className="text-xs text-gray-300 leading-relaxed mb-1">{description}</div>
        {description_hi && (
          <div className="text-xs text-gray-500 leading-relaxed mb-1">{description_hi}</div>
        )}
        {detail && (
          <div className="text-xs text-[#D4AF37]/80 mt-1 leading-relaxed">{detail}</div>
        )}
        {caveat && (
          <div className="mt-2 text-[10px] text-amber-400/80 bg-amber-900/20 border border-amber-500/20 rounded-lg px-2 py-1">
            ⚠️ {caveat}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function RemedySection({
  title,
  title_hi,
  subtitle,
  count,
  color,
  children,
}: {
  title:    string;
  title_hi: string;
  subtitle: string;
  count:    number;
  color:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${color}`} />
        <div className="text-center px-2">
          <div className={`text-xs font-bold tracking-[0.25em] uppercase ${color.replace('to-', 'text-').replace('/40','')}`}>
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
export default function MilanRemediesCard({ remediesData, tier }: Props) {
  if (!remediesData) return null;

  const { parashar, bhrigu, shadbala } = remediesData;

  // Build detail string for Parashar remedies
  function parasharDetail(r: ParasharRemedy): string {
    const parts: string[] = [];
    if (r.duration) parts.push(`Duration: ${r.duration}`);
    if (r.day)      parts.push(`Day: ${r.day}`);
    if (r.time)     parts.push(`Time: ${r.time}`);
    if (r.count)    parts.push(`Count: ${r.count}`);
    if (r.mantra_transliterated) parts.push(`Mantra: ${r.mantra_transliterated}`);
    if (r.items && r.quantity)   parts.push(`Daan: ${r.quantity} — ${r.items}`);
    if (r.recipient) parts.push(`To: ${r.recipient}`);
    if (r.rules)    parts.push(`Rules: ${r.rules}`);
    return parts.join(' · ');
  }

  function bhriguDetail(r: BhriguRemedy): string {
    const parts: string[] = [];
    if (r.duration) parts.push(`Duration: ${r.duration}`);
    if (r.practice) parts.push(r.practice);
    return parts.join(' · ');
  }

  function shadbalDetail(r: ShadbalRemedy): string {
    const parts: string[] = [];
    if (r.gem)       parts.push(`Gemstone: ${r.gem}`);
    if (r.metal)     parts.push(`Metal: ${r.metal}`);
    if (r.finger)    parts.push(`Finger: ${r.finger}`);
    if (r.day_to_wear) parts.push(`Wear on: ${r.day_to_wear}`);
    if (r.direction) parts.push(`Direction: ${r.direction}`);
    if (r.practice)  parts.push(r.practice);
    return parts.join(' · ');
  }

  return (
    <section className="max-w-3xl mx-auto px-5 mb-10">
      <div className="bg-gradient-to-br from-[#0d1120] to-[#1a1a2e] border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8 shadow-xl">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="text-[10px] sm:text-xs text-[#D4AF37] tracking-[0.4em] uppercase mb-1">
            10 Vishesh Remedies
          </div>
          <div className="text-[10px] text-gray-500 tracking-widest">
            विशेष उपाय · Personalized for your charts only
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
        {parashar?.length > 0 && (
          <RemedySection
            title="Maharishi Parashar"
            title_hi="महर्षि पाराशर · BPHS"
            subtitle="Classical remedies from Brihat Parashara Hora Shastra"
            count={parashar.length}
            color="to-amber-500/40"
          >
            {parashar.map((r, i) => (
              <RemedyCard
                key={i}
                number={i + 1}
                name={r.name}
                type={r.type}
                description={r.description}
                description_hi={r.description_hi}
                detail={parasharDetail(r)}
              />
            ))}
          </RemedySection>
        )}

        {/* ── Bhrigu Nandi Nadi ── */}
        {bhrigu?.length > 0 && (
          <RemedySection
            title="Bhrigu Nandi Nadi"
            title_hi="भृगु नन्दी नाड़ी"
            subtitle="Karmic corrections from the Bhrigu tradition"
            count={bhrigu.length}
            color="to-purple-500/40"
          >
            {bhrigu.map((r, i) => (
              <RemedyCard
                key={i}
                number={parashar.length + i + 1}
                name={r.name}
                type={r.type}
                description={r.description}
                description_hi={r.description_hi}
                detail={bhriguDetail(r)}
              />
            ))}
          </RemedySection>
        )}

        {/* ── Shadbala ── */}
        {shadbala?.length > 0 && (
          <RemedySection
            title="Shadbala"
            title_hi="षड्बल · 6-Fold Strength"
            subtitle="Planetary strength activations based on Shadbala analysis"
            count={shadbala.length}
            color="to-emerald-500/40"
          >
            {shadbala.map((r, i) => (
              <RemedyCard
                key={i}
                number={parashar.length + bhrigu.length + i + 1}
                name={r.name}
                type={r.type}
                description={r.description}
                description_hi={r.description_hi}
                detail={shadbalDetail(r)}
                caveat={r.expert_consultation_required ? r.caveat : undefined}
              />
            ))}
          </RemedySection>
        )}

        {/* Footer note */}
        <div className="mt-6 pt-5 border-t border-[#D4AF37]/10 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Yeh remedies sirf <span className="text-white">{tier === 'basic_51' ? 'Basic Milan' : tier === 'deep_101_couple' ? 'Deep Reading' : 'Both Versions'}</span> ke liye hain.
            Aapki kundali ke hisaab se personally compute ki gayi hain — general advice nahi hai.
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            Source: Brihat Parashara Hora Shastra · Bhrigu Nandi Nadi · Shadbala (Parashari 6-fold)
          </p>
        </div>

      </div>
    </section>
  );
}
