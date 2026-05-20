/**
 * ============================================================
 * TRIKAL VAANI — Milan Manglik Dosh Badge
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/milan/MilanManglikBadge.tsx
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Displays per-person Manglik status (bride + groom separately)
 * followed by the combined compatibility verdict.
 * Shown on ALL tiers (free + paid) — pure engine data, no Gemini.
 * ============================================================
 */

'use client';

interface PersonManglik {
  is_manglik: boolean;
  strength:   string; // 'Strong (confirmed from both Lagna and Moon)' | 'Moderate (from Lagna only)' | 'Mild (from Moon only)' | 'Not Manglik'
}

interface CombinedManglik {
  status:         string; // 'CANCELLED' | 'BRIDE_ONLY' | 'GROOM_ONLY' | 'NONE'
  verdict:        string;
  verdict_hi:     string;
  recommendation: string;
}

interface ManglikData {
  bride:    PersonManglik | null;
  groom:    PersonManglik | null;
  combined: CombinedManglik | null;
}

interface Props {
  manglikData: ManglikData | null;
  brideName:   string;
  groomName:   string;
}

// Strength → short label for pill
function strengthLabel(strength: string): string {
  if (strength.startsWith('Strong'))   return 'High';
  if (strength.startsWith('Moderate')) return 'Moderate';
  if (strength.startsWith('Mild'))     return 'Mild';
  return 'None';
}

// Status → display config
function combinedConfig(status: string) {
  switch (status) {
    case 'CANCELLED':
      return {
        icon:  '✅',
        label: 'Dosha Cancelled',
        label_hi: 'दोष निष्क्रिय',
        color: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bg:    'from-emerald-900/20 to-[#0d1120]',
      };
    case 'BRIDE_ONLY':
    case 'GROOM_ONLY':
      return {
        icon:  '⚠️',
        label: 'Dosha Active',
        label_hi: 'दोष सक्रिय',
        color: 'text-amber-400',
        border: 'border-amber-500/30',
        bg:    'from-amber-900/20 to-[#0d1120]',
      };
    case 'NONE':
      return {
        icon:  '✅',
        label: 'No Manglik Concern',
        label_hi: 'कोई मांगलिक दोष नहीं',
        color: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bg:    'from-emerald-900/20 to-[#0d1120]',
      };
    default:
      return {
        icon:  '🔱',
        label: 'Evaluating',
        label_hi: '',
        color: 'text-gray-400',
        border: 'border-gray-500/30',
        bg:    'from-gray-900/20 to-[#0d1120]',
      };
  }
}

function PersonCard({
  name,
  data,
  role,
}: {
  name: string;
  data: PersonManglik | null;
  role: 'bride' | 'groom';
}) {
  const isManglik = data?.is_manglik ?? false;
  const strength  = data?.strength   ?? 'Not Manglik';
  const label     = strengthLabel(strength);

  return (
    <div className={`
      flex-1 rounded-xl border p-5 text-center
      ${isManglik
        ? 'bg-gradient-to-br from-rose-900/25 to-[#0d1120] border-rose-500/30'
        : 'bg-gradient-to-br from-emerald-900/20 to-[#0d1120] border-emerald-500/20'
      }
    `}>
      {/* Role pill */}
      <div className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-2">
        {role === 'bride' ? 'Bride · वधु' : 'Groom · वर'}
      </div>

      {/* Name */}
      <div className="text-sm font-medium text-gray-200 mb-3 truncate">
        {name}
      </div>

      {/* Manglik verdict */}
      <div className={`text-2xl font-bold mb-1 ${isManglik ? 'text-rose-400' : 'text-emerald-400'}`}>
        {isManglik ? '⚠️ Manglik' : '✅ Not Manglik'}
      </div>

      {/* Severity pill — only if Manglik */}
      {isManglik && (
        <div className={`
          inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border
          ${label === 'High'
            ? 'bg-rose-900/40 border-rose-500/50 text-rose-300'
            : label === 'Moderate'
            ? 'bg-amber-900/40 border-amber-500/50 text-amber-300'
            : 'bg-yellow-900/40 border-yellow-500/50 text-yellow-300'
          }
        `}>
          Severity: {label}
        </div>
      )}

      {/* Strength detail */}
      {data && (
        <div className="mt-3 text-[11px] text-gray-500 leading-snug">
          {strength}
        </div>
      )}
    </div>
  );
}

export default function MilanManglikBadge({ manglikData, brideName, groomName }: Props) {
  if (!manglikData) return null;

  const combined = manglikData.combined;
  const cfg      = combined ? combinedConfig(combined.status) : null;

  return (
    <section className="max-w-4xl mx-auto px-5 mb-10">
      <div className="bg-gradient-to-br from-[#0d1120] to-[#1a1a2e] border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8 shadow-xl">

        {/* Section header */}
        <div className="text-center mb-6">
          <div className="text-[10px] sm:text-xs text-[#D4AF37] tracking-[0.4em] uppercase mb-1">
            Mangal Dosh Evaluation
          </div>
          <div className="text-[10px] text-gray-500 tracking-widest">
            मांगलिक दोष विश्लेषण · Per Parashar BPHS
          </div>
        </div>

        {/* Per-person cards */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <PersonCard name={brideName} data={manglikData.bride} role="bride" />
          <PersonCard name={groomName} data={manglikData.groom} role="groom" />
        </div>

        {/* Combined verdict */}
        {combined && cfg && (
          <div className={`
            rounded-xl border p-5 text-center
            bg-gradient-to-br ${cfg.bg} ${cfg.border}
          `}>
            <div className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-2">
              Combined Verdict · संयुक्त निर्णय
            </div>

            <div className={`text-xl sm:text-2xl font-bold mb-1 ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </div>

            {cfg.label_hi && (
              <div className={`text-sm mb-3 ${cfg.color} opacity-80`}>
                {cfg.label_hi}
              </div>
            )}

            <p className="text-sm text-gray-300 leading-relaxed mb-1">
              {combined.verdict}
            </p>

            {combined.verdict_hi && (
              <p className="text-sm text-gray-400 leading-relaxed mb-3">
                {combined.verdict_hi}
              </p>
            )}

            {combined.recommendation && (
              <div className="mt-3 inline-block px-4 py-2 rounded-lg bg-[#080B12]/60 border border-[#D4AF37]/15 text-xs text-gray-300">
                💡 {combined.recommendation}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
