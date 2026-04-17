'use client';

import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Lock, Heart, Briefcase } from 'lucide-react';

const GREEN  = '#00E676';
const RED    = '#FF4D4D';
const PINK   = '#F472B6';
const ORANGE = '#FB923C';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export type FlagItem = {
  type: 'red' | 'green';
  label: string;
  explanation: string;
};

export type DualMode = 'ex_back' | 'toxic_boss' | 'compatibility' | null;

export function generateDualFlags(
  userDob: string,
  partnerDob: string,
  mode: DualMode,
): FlagItem[] {
  if (!userDob || !partnerDob || !mode) return [];

  const uSeed = userDob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const pSeed = partnerDob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const diff  = Math.abs(uSeed - pSeed);

  if (mode === 'ex_back' || mode === 'compatibility') {
    const sevenHouseSync  = (uSeed % 12) === (pSeed % 12);
    const venusMoonSync   = (uSeed % 9)  === (pSeed % 9);
    const ketuAxisOverlap = (uSeed % 7)  === (pSeed % 7);
    const karmaDebtClear  = diff % 5     === 0;
    const moonSignCompat  = diff % 3     === 0;
    const jupiterBlessing = (uSeed + pSeed) % 4 === 0;

    const greens: FlagItem[] = [];
    const reds: FlagItem[]   = [];

    if (sevenHouseSync) {
      greens.push({ type: 'green', label: '7th House Lords in Sync',
        explanation: 'Both your 7th house lords occupy compatible Rashis — a strong indicator of karmic partnership magnetism and potential reunion.' });
    } else {
      reds.push({ type: 'red', label: '7th House Lord Tension',
        explanation: 'Your 7th house lords are in a challenging axis. Venus needs to complete her retrograde cycle before a stable reunion window opens.' });
    }

    if (venusMoonSync) {
      greens.push({ type: 'green', label: 'Venus-Moon Axis Aligned',
        explanation: 'Your Venus and their Moon are in harmonic Nakshatra padas. Emotional attunement is still active — a powerful signal for emotional re-bonding.' });
    } else {
      reds.push({ type: 'red', label: 'Venus-Moon Disconnect',
        explanation: 'Venus and Moon are in a friction axis (6-8 placement). Emotional needs are currently misaligned, requiring a Shukra graha shanti.' });
    }

    if (ketuAxisOverlap) {
      greens.push({ type: 'green', label: 'Ketu Axis: Karmic Debt Active',
        explanation: "Ketu's placement shows an incomplete karmic cycle between you — the universe has not yet closed this bond. Reunion is still written in your charts." });
    } else {
      reds.push({ type: 'red', label: 'Ketu Has Released the Bond',
        explanation: "Ketu's position indicates the karmic debt between you may be settling. This cycle could be in its final phase — prioritize personal healing." });
    }

    if (karmaDebtClear) {
      greens.push({ type: 'green', label: 'Karma Account: Net Positive',
        explanation: 'Your combined birth chart numerology shows a net positive karma account — past-life obligations have been more fulfilled than incurred.' });
    } else {
      reds.push({ type: 'red', label: 'Unresolved Karma Pattern',
        explanation: 'There is an unresolved karmic pattern (likely 3rd and 9th house exchange) that keeps pulling you into repeating emotional cycles.' });
    }

    if (moonSignCompat) {
      greens.push({ type: 'green', label: 'Moon Sign Harmony',
        explanation: 'Your Moon signs are in a trine (120°) relationship — emotional wavelengths are naturally in sync even during periods of physical separation.' });
    } else {
      reds.push({ type: 'red', label: 'Moon Sign Friction',
        explanation: 'Moon signs in a 2-12 or 6-8 axis create emotional misunderstandings that escalate quickly. Communication timing is critical right now.' });
    }

    if (jupiterBlessing) {
      greens.push({ type: 'green', label: 'Jupiter Transit Favorable',
        explanation: 'Jupiter is currently transiting a house that activates both your 7th houses. This is a 12-month window of maximum reunion potential.' });
    } else {
      reds.push({ type: 'red', label: 'Jupiter Not Yet In Position',
        explanation: 'Jupiter has not yet transited into the optimal activation house for your pairing. The powerful reunion window opens in the next 7–11 months.' });
    }

    return [...greens.slice(0, 3), ...reds.slice(0, 3)];
  }

  if (mode === 'toxic_boss') {
    const saturnSunClash   = (uSeed % 8)  !== (pSeed % 8);
    const sunDominance     = pSeed > uSeed;
    const marsAuthority    = (pSeed % 6)  === 0;
    const rahuAmbitionConf = diff % 4     === 0;
    const mercuryAlliance  = (uSeed % 10) === (pSeed % 10);
    const tenthHouseConf   = (uSeed % 3)  !== (pSeed % 3);

    const greens: FlagItem[] = [];
    const reds: FlagItem[]   = [];

    if (!saturnSunClash) {
      greens.push({ type: 'green', label: 'Saturn-Sun Axis: Manageable',
        explanation: "Saturn (discipline authority) and Sun (ego authority) are not in direct conflict. Your boss's control style is firm but navigable through consistent performance." });
    } else {
      reds.push({ type: 'red', label: 'Saturn-Sun Direct Clash',
        explanation: "Your Saturn is in direct friction with your boss's Sun — a classic authority oppression pattern. Every independent decision you make is perceived as a threat." });
    }

    if (mercuryAlliance) {
      greens.push({ type: 'green', label: 'Mercury Communication Bridge',
        explanation: 'Mercury positions are harmonious — intellectual rapport is possible. Use written communication and data to build credibility with this authority figure.' });
    } else {
      reds.push({ type: 'red', label: 'Mercury Communication Block',
        explanation: 'Mercury creates a communication fog in this relationship. Your words are consistently misinterpreted — document everything in writing for protection.' });
    }

    if (!marsAuthority) {
      greens.push({ type: 'green', label: 'Mars Authority: Controlled',
        explanation: "The Mars aggression factor in your boss's chart is not dominant in your karma bhava. Conflict, while present, stays within professional boundaries." });
    } else {
      reds.push({ type: 'red', label: 'Mars Authority: Unchecked',
        explanation: "Your boss's Mars is highly activated in their 10th house. Expect sudden outbursts, boundary violations, and competitive undermining behavior." });
    }

    if (!rahuAmbitionConf) {
      greens.push({ type: 'green', label: "Rahu Ambition: Aligned",
        explanation: "Rahu's ambition axis is not in direct competition — there is room for you to grow within this structure without triggering your boss's insecurity." });
    } else {
      reds.push({ type: 'red', label: 'Rahu Ambition Conflict',
        explanation: "Rahu shows a direct ambition overlap — your boss perceives your growth as a threat to their own position. This is the root of micro-management behavior." });
    }

    if (!sunDominance) {
      greens.push({ type: 'green', label: 'Power Dynamic: Navigable',
        explanation: 'The Sun-to-Sun comparison shows a relatively balanced power dynamic. This authority relationship responds to structured, results-based communication.' });
    } else {
      reds.push({ type: 'red', label: 'Ego Dominance Pattern',
        explanation: "Your boss's Sun is in a dominant position over your chart's 6th house — a classic subordination pattern. Recognition will require external advocacy." });
    }

    if (!tenthHouseConf) {
      greens.push({ type: 'green', label: '10th House: Career Path Clear',
        explanation: 'Your 10th house (career karma) is not blocked by this authority figure. Your professional destiny is larger than this role — use it as a stepping stone.' });
    } else {
      reds.push({ type: 'red', label: '10th House Activation Blocked',
        explanation: "Your boss's planetary position is temporarily suppressing your 10th house karma activation. The block lifts when Saturn completes its current transit." });
    }

    return [...greens.slice(0, 3), ...reds.slice(0, 3)];
  }

  return [];
}

type Props = {
  flags: FlagItem[];
  showUnlockTeaser?: boolean;
  onUnlock?: () => void;
  userName: string;
  partnerName: string;
  mode?: DualMode;
  isExBack?: boolean;
};

export default function FlagDashboard({
  flags, showUnlockTeaser, onUnlock, userName, partnerName, mode, isExBack,
}: Props) {
  const greens = flags.filter(f => f.type === 'green').slice(0, 3);
  const reds   = flags.filter(f => f.type === 'red').slice(0, 3);

  const effectiveMode = mode ?? (isExBack ? 'ex_back' : null);
  const isBossMode    = effectiveMode === 'toxic_boss';
  const accentColor   = isBossMode ? ORANGE : PINK;

  const dashboardTitle = isBossMode
    ? `Power Struggle: ${userName.split(' ')[0]} vs ${partnerName.split(' ')[0]}`
    : `Karmic Bond: ${userName.split(' ')[0]} & ${partnerName.split(' ')[0]}`;

  const dashboardSub = isBossMode
    ? 'Saturn-Sun authority axis + Mars aggression pattern'
    : '7th house lord sync + Venus-Moon karmic resonance';

  const DashIcon = isBossMode ? Briefcase : Heart;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: `${accentColor}0d`, border: `1px solid ${accentColor}30` }}
        >
          <DashIcon className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: accentColor }}>
            {isBossMode ? 'Boss Karma Radar' : 'Karmic Flag Dashboard'}
          </span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Context strip */}
      <div
        className="rounded-2xl px-4 py-3"
        style={{ background: `${accentColor}07`, border: `1px solid ${accentColor}20` }}
      >
        <p className="text-sm font-bold text-white leading-tight">{dashboardTitle}</p>
        <p className="text-xs mt-0.5" style={{ color: `${accentColor}80` }}>{dashboardSub}</p>
      </div>

      {/* Flag grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(0,230,118,0.04)', border: '1px solid rgba(0,230,118,0.15)' }}>
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: GREEN }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${GREEN}99` }}>
              {isBossMode ? 'Manageable Factors' : 'Green Flags'}
            </p>
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,230,118,0.1)', color: GREEN, border: '1px solid rgba(0,230,118,0.22)' }}>
              {greens.length}
            </span>
          </div>
          <div className="px-4 pb-4 space-y-3">
            {greens.map((flag, i) => (
              <div key={i} className="rounded-xl p-3 transition-all duration-200"
                style={{ background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.1)' }}>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(0,230,118,0.15)' }}>
                    <CheckCircle2 className="w-3 h-3" style={{ color: GREEN }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight mb-1" style={{ color: GREEN }}>{flag.label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>{flag.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
            {greens.length === 0 && (
              <p className="text-xs text-slate-600 italic px-1">No favorable factors detected yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,77,77,0.04)', border: '1px solid rgba(255,77,77,0.15)' }}>
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: RED }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `${RED}99` }}>
              {isBossMode ? 'Warning Patterns' : 'Red Flags'}
            </p>
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,77,77,0.1)', color: RED, border: '1px solid rgba(255,77,77,0.22)' }}>
              {reds.length}
            </span>
          </div>
          <div className="px-4 pb-4 space-y-3">
            {reds.map((flag, i) => (
              <div key={i} className="rounded-xl p-3 transition-all duration-200"
                style={{ background: 'rgba(255,77,77,0.05)', border: '1px solid rgba(255,77,77,0.1)' }}>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,77,77,0.15)' }}>
                    <AlertTriangle className="w-3 h-3" style={{ color: RED }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight mb-1" style={{ color: RED }}>{flag.label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>{flag.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
            {reds.length === 0 && (
              <p className="text-xs text-slate-600 italic px-1">No warning patterns detected.</p>
            )}
          </div>
        </div>
      </div>

      {/* Vedic credit */}
      <p className="text-xs text-center" style={{ color: GOLD_RGBA(0.32) }}>
        Vedic insight verified by{' '}
        <span className="font-semibold" style={{ color: GOLD_RGBA(0.60) }}>Rohiit Gupta</span>
        , Chief Vedic Architect.
      </p>

      {/* Ex-Back unlock teaser */}
      {showUnlockTeaser && (effectiveMode === 'ex_back' || effectiveMode === 'compatibility') && (
        <div className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: 'rgba(255,77,77,0.06)', border: '1px solid rgba(255,77,77,0.2)' }}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
            style={{ background: RED, filter: 'blur(24px)', transform: 'translate(30%,-30%)' }} />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.25)' }}>
              <Lock className="w-4 h-4" style={{ color: RED }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold mb-1" style={{ color: RED }}>
                Hidden Flag Detected in {partnerName.split(' ')[0]}&apos;s 8th House
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                A secret in {partnerName.split(' ')[0]}&apos;s 8th house may change the reunion
                probability entirely. The Truth Shield reveals the hidden planetary debt.
              </p>
              <button onClick={onUnlock}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
                style={{ background: `linear-gradient(135deg, ${RED} 0%, #CC0000 100%)`, color: '#fff',
                  boxShadow: `0 4px 16px rgba(255,77,77,0.35)` }}>
                <Lock className="w-3 h-3" />
                Unlock Truth Shield — ₹11
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toxic Boss unlock teaser */}
      {showUnlockTeaser && effectiveMode === 'toxic_boss' && (
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.2)' }}>
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 flex-shrink-0" style={{ color: ORANGE }} />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-0.5" style={{ color: ORANGE }}>
                Full Saturn Suppression Report Locked
              </p>
              <p className="text-xs text-slate-500">
                Exact trigger dates, escape window timing, and graha shanti remedies.
              </p>
            </div>
            <button onClick={onUnlock}
              className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all duration-200"
              style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #C4701E 100%)`, color: '#fff',
                boxShadow: `0 2px 12px rgba(251,146,60,0.3)` }}>
              ₹11
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
