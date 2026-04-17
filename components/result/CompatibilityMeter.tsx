'use client';

import { useState } from 'react';
import { Heart, User, Calendar, MapPin, Loader as Loader2, Flag, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react';

export type PartnerData = {
  name: string;
  dob: string;
  birth_time?: string;
  city: string;
};

export type CompatibilityResult = {
  score: number;
  vibeMeters: {
    energy: number;
    loyalty: number;
    passion: number;
  };
  flags: Array<{ type: 'red' | 'green'; label: string; explanation: string }>;
  vibe: string;
  verdict: string;
  whatsappText: string;
};

type Props = {
  userName: string;
  userDob: string;
  onCheck: (partner: PartnerData) => Promise<void>;
  result: CompatibilityResult | null;
  loading: boolean;
};

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;
const CRIMSON = '#DC2626';

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 70 ? '#22C55E' : score >= 45 ? '#FACC15' : CRIMSON;
  const label = score >= 70 ? 'Highly Compatible' : score >= 45 ? 'Moderately Compatible' : 'Needs Work';

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative w-32 h-32 mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
            style={{ transition: 'stroke-dashoffset 1.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
      >
        {label}
      </span>
    </div>
  );
}

function VibeMeterBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-16">{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
          }}
        />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function CompatibilityMeter({ userName, userDob, onCheck, result, loading }: Props) {
  const [partner, setPartner] = useState<PartnerData>({ name: '', dob: '', birth_time: '', city: '' });
  const [errors, setErrors] = useState<Partial<PartnerData>>({});
  const [open, setOpen] = useState(false);

  function validate() {
    const e: Partial<PartnerData> = {};
    if (!partner.name.trim()) e.name = 'Required';
    if (!partner.dob) e.dob = 'Required';
    if (!partner.city.trim()) e.city = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onCheck(partner);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(6,10,24,0.95)',
        border: `1px solid rgba(244,114,182,0.18)`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full p-5 text-left flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4" style={{ color: '#F472B6' }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(244,114,182,0.7)' }}>
              Red Flag / Green Flag
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(244,114,182,0.1)', color: '#F472B6', border: '1px solid rgba(244,114,182,0.25)' }}
            >
              NEW
            </span>
          </div>
          <h3 className="text-base font-semibold text-white">Partner Compatibility Check</h3>
          <p className="text-xs text-slate-500 mt-0.5">Ashta-Koota Vedic compatibility with AI vibe analysis</p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.25)' }}
        >
          <span style={{ color: '#F472B6', fontSize: '18px', lineHeight: 1 }}>{open ? '−' : '+'}</span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                className="rounded-xl p-3 mb-2"
                style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.15)}` }}
              >
                <p className="text-xs text-slate-400">
                  Analyzing compatibility between <span className="font-semibold" style={{ color: GOLD }}>{userName.split(' ')[0]}</span> and your partner using Vedic Ashta-Koota matching.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'rgba(244,114,182,0.7)' }}>
                    Partner&apos;s Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(244,114,182,0.4)' }} />
                    <input
                      type="text"
                      placeholder="Their name"
                      value={partner.name}
                      onChange={(e) => setPartner((p) => ({ ...p, name: e.target.value }))}
                      className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'rgba(244,114,182,0.7)' }}>
                    Date of Birth <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(244,114,182,0.4)' }} />
                    <input
                      type="date"
                      value={partner.dob}
                      onChange={(e) => setPartner((p) => ({ ...p, dob: e.target.value }))}
                      className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  {errors.dob && <p className="text-xs text-rose-400 mt-1">{errors.dob}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'rgba(244,114,182,0.7)' }}>
                    Birth City <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(244,114,182,0.4)' }} />
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={partner.city}
                      onChange={(e) => setPartner((p) => ({ ...p, city: e.target.value }))}
                      className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
                    />
                  </div>
                  {errors.city && <p className="text-xs text-rose-400 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'rgba(244,114,182,0.5)' }}>
                    Birth Time <span className="text-slate-600">(optional)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(244,114,182,0.3)' }} />
                    <input
                      type="time"
                      value={partner.birth_time}
                      onChange={(e) => setPartner((p) => ({ ...p, birth_time: e.target.value }))}
                      className="input-cosmic w-full h-11 pl-9 pr-3 rounded-xl text-sm"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: loading ? 'rgba(244,114,182,0.2)' : 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
                  color: loading ? '#F472B6' : '#fff',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(244,114,182,0.3)',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating Ashta-Koota...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Check Our Compatibility
                  </>
                )}
              </button>
            </form>
          ) : (
            <CompatibilityResult result={result} userName={userName} partnerName={partner.name} onReset={() => { setPartner({ name: '', dob: '', birth_time: '', city: '' }); }} />
          )}
        </div>
      )}
    </div>
  );
}

function CompatibilityResult({ result, userName, partnerName, onReset }: { result: CompatibilityResult; userName: string; partnerName: string; onReset: () => void }) {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(result.whatsappText)}`;
  const reds = result.flags.filter((f) => f.type === 'red');
  const greens = result.flags.filter((f) => f.type === 'green');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1" style={{ background: GOLD_RGBA(0.1), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <User className="w-4 h-4" style={{ color: GOLD }} />
          </div>
          <p className="text-xs font-medium text-white">{userName.split(' ')[0]}</p>
        </div>
        <Heart className="w-5 h-5" style={{ color: '#F472B6' }} />
        <div className="text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1" style={{ background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)' }}>
            <User className="w-4 h-4" style={{ color: '#F472B6' }} />
          </div>
          <p className="text-xs font-medium text-white">{partnerName.split(' ')[0]}</p>
        </div>
      </div>

      <ScoreMeter score={result.score} />

      <div className="rounded-xl p-4" style={{ background: 'rgba(244,114,182,0.04)', border: '1px solid rgba(244,114,182,0.15)' }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(244,114,182,0.7)' }}>Vibe Meters</p>
        <div className="space-y-2.5">
          <VibeMeterBar label="Energy" score={result.vibeMeters?.energy || 70} color="#F472B6" />
          <VibeMeterBar label="Loyalty" score={result.vibeMeters?.loyalty || 75} color="#22C55E" />
          <VibeMeterBar label="Passion" score={result.vibeMeters?.passion || 68} color="#F59E0B" />
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.2)' }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(244,114,182,0.7)' }}>The Vibe</p>
        <p className="text-sm text-slate-200 leading-relaxed italic">&ldquo;{result.vibe}&rdquo;</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {greens.length > 0 && (
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p className="text-xs font-semibold text-emerald-400/70 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Green Flags
            </p>
            <ul className="space-y-2">
              {greens.map((f, i) => (
                <li key={i}>
                  <p className="text-xs font-semibold text-emerald-300">{f.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {reds.length > 0 && (
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <p className="text-xs font-semibold text-red-400/70 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Red Flags
            </p>
            <ul className="space-y-2">
              {reds.map((f, i) => (
                <li key={i}>
                  <p className="text-xs font-semibold text-red-300">{f.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-xl p-4" style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.18)}` }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: `${GOLD}70` }}>Guru Verdict</p>
        <p className="text-sm leading-relaxed" style={{ color: `${GOLD}cc` }}>{result.verdict}</p>
      </div>

      <div className="flex gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(34,197,94,0.25)' }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Share on WhatsApp
        </a>
        <button
          onClick={onReset}
          className="px-4 h-12 rounded-xl text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-white"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Try Another
        </button>
      </div>
    </div>
  );
}

