/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 9.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: BIRTH FORM — PROKERALA SERVER API (100% ACCURATE)
 * v5.0: Language selector added
 * v6.0: Pratyantar + Sookshma Dasha params added to URL
 * v7.0: Employment + Sector profiling
 * v8.0: Mobile number capture + numerology preview added
 *        pratyantar list + currentPratyantar passed to result page
 * WARNING: DO NOT CHANGE handleSubmit — BREAKS KUNDALI CALCULATION
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader as Loader2, Star, MapPin, Clock, Calendar, User,
  HeartCrack, TriangleAlert as AlertTriangle, Sparkles, TrendingUp,
  Chrome as Home, Banknote, Baby, Users, Sunset, Crown, MoonStar,
  ChevronRight, Briefcase, Heart, Languages, Phone,
} from 'lucide-react';
import { saveSubmission } from '@/lib/supabase';
import type { SelectedCategory } from '@/app/page';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;
const PINK = '#F472B6';
const PINK_RGBA = (a: number) => `rgba(244,114,182,${a})`;
const ORANGE = '#FB923C';
const ORANGE_RGBA = (a: number) => `rgba(251,146,60,${a})`;

// ─── LANGUAGE OPTIONS ─────────────────────────────────────────────────────────
type Lang = 'hindi' | 'hinglish' | 'english';

const LANG_OPTIONS: { id: Lang; label: string; sublabel: string; flag: string }[] = [
  { id: 'hindi',    label: 'हिंदी',    sublabel: 'Shudh Hindi mein',   flag: '🇮🇳' },
  { id: 'hinglish', label: 'Hinglish', sublabel: 'Hindi + English mix', flag: '✨' },
  { id: 'english',  label: 'English',  sublabel: 'Full English',        flag: '🌐' },
];

type FormData = { name: string; dob: string; birth_time: string; city: string };

type LifeQuestion = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  gen: 'genz' | 'millennial' | 'genx';
};

const GENZ_QUESTIONS: LifeQuestion[] = [
  { id: 'ex_back',       label: 'Will my Ex come back?',  icon: HeartCrack,    color: '#F472B6', gen: 'genz' },
  { id: 'toxic_boss',    label: 'Is my Boss Toxic?',       icon: AlertTriangle, color: '#FB923C', gen: 'genz' },
  { id: 'manifestation', label: 'Manifestation Luck',      icon: Sparkles,      color: '#FACC15', gen: 'genz' },
  { id: 'dream_career',  label: 'Sudden Wealth / Trading', icon: TrendingUp,    color: '#60A5FA', gen: 'genz' },
];

const MILLENNIAL_QUESTIONS: LifeQuestion[] = [
  { id: 'property_yog',     label: 'Property Purchase Window',    icon: Home,     color: '#34D399', gen: 'millennial' },
  { id: 'karz_mukti',       label: 'Debt Clearance (Karz Mukti)', icon: Banknote, color: '#FACC15', gen: 'millennial' },
  { id: 'child_destiny',    label: "Child's Future Path",         icon: Baby,     color: '#F472B6', gen: 'millennial' },
  { id: 'parents_wellness', label: "Parents' Wellness",           icon: Users,    color: '#60A5FA', gen: 'millennial' },
];

const GENX_QUESTIONS: LifeQuestion[] = [
  { id: 'retirement_peace',   label: 'Retirement Peace & Timing', icon: Sunset,   color: '#FB923C', gen: 'genx' },
  { id: 'legacy_inheritance', label: 'Inheritance Clarity',       icon: Crown,    color: '#FACC15', gen: 'genx' },
  { id: 'spiritual_innings',  label: 'Spiritual Purpose',         icon: MoonStar, color: GOLD,      gen: 'genx' },
];

const FIELD_META = [
  { key: 'name' as const,       label: 'Full Name',     placeholder: 'Enter your full name',          type: 'text', icon: User },
  { key: 'dob' as const,        label: 'Date of Birth', placeholder: '',                              type: 'date', icon: Calendar },
  { key: 'birth_time' as const, label: 'Birth Time',    placeholder: '',                              type: 'time', icon: Clock },
  { key: 'city' as const,       label: 'Birth City',    placeholder: 'e.g. Mumbai, Delhi, Bangalore', type: 'text', icon: MapPin },
];

const DUAL_IDS = new Set(['ex_back', 'compatibility', 'toxic_boss']);

function getGenerationFromDob(dob: string): 'genz' | 'millennial' | 'genx' | null {
  if (!dob) return null;
  const year = parseInt(dob.split('-')[0], 10);
  if (isNaN(year)) return null;
  if (year >= 1995) return 'genz';
  if (year >= 1980) return 'millennial';
  if (year >= 1970) return 'genx';
  return null;
}



// ─── MOBILE NUMEROLOGY CAPTURE ────────────────────────────────────────────────
// v8.0: Optional mobile number field with instant numerology preview
// Use Case 1 (Client): Lucky number analysis + call prediction
// Use Case 2 (CEO): Master data for ₹499 premium consultation

// Numerology calculation — Pythagorean method
function calcLifePath(mobile: string): number {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length < 10) return 0;
  let sum = digits.split('').reduce((a, d) => a + parseInt(d, 10), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((a, d) => a + parseInt(d, 10), 0);
  }
  return sum;
}

const LIFE_PATH_DATA: Record<number, {
  planet: string; emoji: string;
  lucky: string; challenge: string;
  callPrediction: string;
}> = {
  1:  { planet: 'Sun',     emoji: '☀️', lucky: 'Sunday, 1st/10th/19th/28th', challenge: 'Ego clashes', callPrediction: 'Leadership calls — job offers, promotions, authority figures calling soon' },
  2:  { planet: 'Moon',    emoji: '🌙', lucky: 'Monday, 2nd/11th/20th/29th', challenge: 'Indecision',  callPrediction: 'Emotional calls — GF/BF/family reconnecting, partnership conversations coming' },
  3:  { planet: 'Jupiter', emoji: '♃',  lucky: 'Thursday, 3rd/12th/21st/30th', challenge: 'Scatter', callPrediction: 'Opportunity calls — business offers, guru/mentor reaching out, good news calls' },
  4:  { planet: 'Rahu',    emoji: '☊',  lucky: 'Saturday, 4th/13th/22nd/31st', challenge: 'Obstacles', callPrediction: 'Unexpected calls — sudden job change, ex reaching out after long gap, surprise news' },
  5:  { planet: 'Mercury', emoji: '☿',  lucky: 'Wednesday, 5th/14th/23rd', challenge: 'Restlessness', callPrediction: 'Multiple calls — interview calls, business negotiations, communication-heavy phase' },
  6:  { planet: 'Venus',   emoji: '♀️', lucky: 'Friday, 6th/15th/24th', challenge: 'Over-giving', callPrediction: 'Love calls — romantic reconnections, marriage proposals, family harmony calls' },
  7:  { planet: 'Ketu',    emoji: '☋',  lucky: 'Monday, 7th/16th/25th', challenge: 'Isolation', callPrediction: 'Spiritual calls — hidden opportunities, research/study offers, introspective conversations' },
  8:  { planet: 'Saturn',  emoji: '♄',  lucky: 'Saturday, 8th/17th/26th', challenge: 'Karma delays', callPrediction: 'Karmic calls — old debts resolving, long-pending matters clearing, authority calling' },
  9:  { planet: 'Mars',    emoji: '♂️', lucky: 'Tuesday, 9th/18th/27th', challenge: 'Aggression', callPrediction: 'Action calls — urgent job offers, confrontational conversations, competitive wins' },
  11: { planet: 'Moon+Sun', emoji: '✨', lucky: 'Master Number — 11th/29th', challenge: 'Sensitivity', callPrediction: 'Intuitive calls — psychic connections, spiritual mentors reaching out, life-changing conversations' },
  22: { planet: 'Sat+Ura', emoji: '🌟', lucky: 'Master Number — 22nd', challenge: 'Overwhelm', callPrediction: 'Legacy calls — major business deals, empire-building conversations, powerful mentors contacting' },
};

function MobileNumerologyCapture({
  mobile, onMobileChange, name, lang,
}: {
  mobile: string;
  onMobileChange: (v: string) => void;
  name: string;
  lang: Lang;
}) {
  const [countryCode, setCountryCode] = useState('+91');
  const lifePath  = calcLifePath(mobile);
  const data      = LIFE_PATH_DATA[lifePath];
  // Valid if at least 6 digits (international numbers vary in length)
  const isValid   = mobile.replace(/\D/g, '').length >= 6;
  const firstName = name.split(' ')[0] || 'aap';

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(6,10,24,0.7)', border: `1px solid ${GOLD_RGBA(0.14)}` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Phone className="w-3.5 h-3.5" style={{ color: GOLD }} />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: `${GOLD}80` }}>
          Mobile Numerology
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full ml-1"
          style={{ background: GOLD_RGBA(0.08), color: GOLD_RGBA(0.6), border: `1px solid ${GOLD_RGBA(0.15)}` }}
        >
          Free Bonus
        </span>
      </div>

      {/* Teaser lines */}
      <div className="mb-4 space-y-1">
        <p className="text-xs text-slate-400 leading-relaxed">
          📱 <span style={{ color: GOLD_RGBA(0.8) }}>Kya aapka mobile number lucky hai?</span>
        </p>
        <p className="text-xs text-slate-500">
          Kya aapko jald koi important call aane wali hai —{' '}
          <span style={{ color: 'rgba(244,114,182,0.8)' }}>GF/BF/Ex</span> ·{' '}
          <span style={{ color: '#60A5FA' }}>Job/Interview</span> ·{' '}
          <span style={{ color: '#34D399' }}>Business</span> ·{' '}
          <span style={{ color: '#FACC15' }}>Parents/Kids</span>?
        </p>
        <p className="text-xs text-slate-600">
          Apna mobile number daalo — Jini aapka numerology reading degi
        </p>
      </div>

      {/* Country Code + Input */}
      <div className="flex gap-2 mb-4">
        {/* Country code selector */}
        <select
          value={countryCode}
          onChange={e => setCountryCode(e.target.value)}
          className="input-cosmic rounded-xl text-sm px-2"
          style={{
            colorScheme: 'dark',
            width: 110, flexShrink: 0,
            color: GOLD,
            fontWeight: 600,
            background: 'rgba(6,12,28,0.9)',
            border: `1px solid ${GOLD_RGBA(0.25)}`,
          }}
        >
          <option value="+91">🇮🇳 +91</option>
          <option value="+1">🇺🇸 +1</option>
          <option value="+44">🇬🇧 +44</option>
          <option value="+61">🇦🇺 +61</option>
          <option value="+971">🇦🇪 +971</option>
          <option value="+65">🇸🇬 +65</option>
          <option value="+60">🇲🇾 +60</option>
          <option value="+64">🇳🇿 +64</option>
          <option value="+49">🇩🇪 +49</option>
          <option value="+33">🇫🇷 +33</option>
          <option value="+81">🇯🇵 +81</option>
          <option value="+86">🇨🇳 +86</option>
          <option value="+1-CA">🇨🇦 +1</option>
          <option value="+27">🇿🇦 +27</option>
          <option value="+94">🇱🇰 +94</option>
          <option value="+977">🇳🇵 +977</option>
          <option value="+880">🇧🇩 +880</option>
          <option value="+92">🇵🇰 +92</option>
          <option value="+966">🇸🇦 +966</option>
          <option value="+974">🇶🇦 +974</option>
          <option value="+973">🇧🇭 +973</option>
          <option value="+968">🇴🇲 +968</option>
          <option value="+31">🇳🇱 +31</option>
          <option value="+41">🇨🇭 +41</option>
          <option value="+7">🇷🇺 +7</option>
        </select>

        {/* Number input */}
        <div className="relative flex-1">
          <input
            type="tel"
            placeholder="Number"
            value={mobile}
            onChange={e => {
              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 15);
              onMobileChange(val);
            }}
            className="input-cosmic w-full h-12 px-4 rounded-xl text-sm"
            style={{ colorScheme: 'dark' }}
            maxLength={15}
          />
          {isValid && (
            <div
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }}
            />
          )}
        </div>
      </div>

      {/* Numerology Preview — shows after valid number */}
      {isValid && data && (
        <div
          style={{
            padding: '14px 16px',
            background: `linear-gradient(135deg, ${GOLD_RGBA(0.08)}, rgba(6,12,28,0.95))`,
            border: `1px solid ${GOLD_RGBA(0.25)}`,
            borderRadius: 12,
            animation: 'fadeIn 0.4s ease',
          }}
        >
          {/* Life path number */}
          <div className="flex items-center gap-10 mb-12" style={{ gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: GOLD_RGBA(0.12),
              border: `2px solid ${GOLD_RGBA(0.4)}`,
              display: 'flex', flexDirection: 'column' as const,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: GOLD, lineHeight: 1 }}>{lifePath}</span>
              <span style={{ fontSize: 8, color: GOLD_RGBA(0.6) }}>PATH</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 2 }}>
                {data.emoji} Life Path {lifePath} · {data.planet} Number
              </div>
              <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)' }}>
                Lucky days: {data.lucky}
              </div>
            </div>
          </div>

          {/* Call prediction — the hook */}
          <div style={{
            padding: '10px 12px',
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 8, marginBottom: 10,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#C4B5FD', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 5 }}>
              📞 Upcoming Call Prediction
            </div>
            <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.85)', lineHeight: 1.65, margin: 0 }}>
              {firstName} ji — {data.callPrediction}
            </p>
          </div>

          {/* Suspense hook */}
          <p style={{ fontSize: 11, color: GOLD_RGBA(0.6), fontStyle: 'italic', margin: 0 }}>
            🔮 Exact date aur caller kaun hoga — yeh sirf deep reading mein reveal hoga...
          </p>
        </div>
      )}

      {/* Privacy note */}
      <p className="text-xs text-slate-600 mt-3 text-center">
        🔒 Number sirf aapki reading ke liye — kabhi share nahi hoga
      </p>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── EMPLOYMENT + SECTOR SELECTOR ────────────────────────────────────────────
// v7.0: Added between City field and Life Question picker
// Data passed to Gemini for sector-specific predictions

const EMPLOYMENT_OPTIONS = [
  { id: 'salaried',    label: 'Salaried',         emoji: '💼', sublabel: 'Job / Service' },
  { id: 'self',        label: 'Self-Employed',     emoji: '🛠️', sublabel: 'Freelance / Consulting' },
  { id: 'business',    label: 'Business Owner',    emoji: '🏢', sublabel: 'Own company' },
  { id: 'student',     label: 'Student',           emoji: '📚', sublabel: 'College / School' },
  { id: 'homemaker',   label: 'Homemaker',         emoji: '🏠', sublabel: 'Family focus' },
  { id: 'retired',     label: 'Retired',           emoji: '🌅', sublabel: 'Post-career' },
];

const SECTOR_OPTIONS = [
  { id: 'it',          label: 'IT / Tech',         emoji: '💻' },
  { id: 'finance',     label: 'Finance / Banking', emoji: '💰' },
  { id: 'realestate',  label: 'Real Estate',       emoji: '🏠' },
  { id: 'healthcare',  label: 'Healthcare',        emoji: '🏥' },
  { id: 'govt',        label: 'Government / PSU',  emoji: '🏛️' },
  { id: 'education',   label: 'Education',         emoji: '📖' },
  { id: 'media',       label: 'Media / Creative',  emoji: '🎨' },
  { id: 'telecom',     label: 'Telecom',            emoji: '📡' },
  { id: 'legal',       label: 'Legal',              emoji: '⚖️' },
  { id: 'trading',     label: 'Trading / Markets', emoji: '📈' },
  { id: 'other',       label: 'Other',              emoji: '✨' },
];

function ProfileSelector({
  employment, sector, onEmploymentChange, onSectorChange,
}: {
  employment: string;
  sector: string;
  onEmploymentChange: (v: string) => void;
  onSectorChange: (v: string) => void;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(6,10,24,0.7)', border: `1px solid ${GOLD_RGBA(0.14)}` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span style={{ fontSize: 14 }}>👤</span>
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: `${GOLD}80` }}
        >
          Your Profile
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full ml-1"
          style={{ background: GOLD_RGBA(0.08), color: GOLD_RGBA(0.6), border: `1px solid ${GOLD_RGBA(0.15)}` }}
        >
          Optional
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Aapka profession batayein — predictions 10x more specific ho jaayengi
      </p>

      {/* Employment pills */}
      <div className="mb-4">
        <p className="text-xs font-medium mb-2" style={{ color: GOLD_RGBA(0.55) }}>
          Employment Type
        </p>
        <div className="grid grid-cols-3 gap-2">
          {EMPLOYMENT_OPTIONS.map(opt => {
            const isSelected = employment === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onEmploymentChange(isSelected ? '' : opt.id)}
                className="flex flex-col items-center gap-1 rounded-xl p-2.5 transition-all duration-200"
                style={{
                  background: isSelected ? GOLD_RGBA(0.12) : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSelected ? GOLD_RGBA(0.4) : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isSelected ? `0 2px 12px ${GOLD_RGBA(0.15)}` : 'none',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{opt.emoji}</span>
                <span className="text-xs font-semibold" style={{ color: isSelected ? GOLD : 'rgba(226,232,240,0.65)' }}>
                  {opt.label}
                </span>
                <span className="text-xs text-center leading-tight" style={{ color: 'rgba(100,116,139,0.6)', fontSize: 9 }}>
                  {opt.sublabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sector pills — only show if employment selected and relevant */}
      {employment && !['student', 'homemaker', 'retired'].includes(employment) && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: GOLD_RGBA(0.55) }}>
            Your Sector / Industry
          </p>
          <div className="flex flex-wrap gap-2">
            {SECTOR_OPTIONS.map(opt => {
              const isSelected = sector === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSectorChange(isSelected ? '' : opt.id)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200"
                  style={{
                    background: isSelected ? GOLD_RGBA(0.12) : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? GOLD_RGBA(0.35) : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isSelected ? `0 0 10px ${GOLD_RGBA(0.15)}` : 'none',
                  }}
                >
                  <span style={{ fontSize: 12 }}>{opt.emoji}</span>
                  <span className="text-xs font-medium" style={{ color: isSelected ? GOLD : 'rgba(226,232,240,0.65)' }}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected summary */}
      {(employment || sector) && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${GOLD_RGBA(0.08)}` }}>
          <p className="text-xs" style={{ color: GOLD_RGBA(0.5) }}>
            ✅ Profile set:{' '}
            <span style={{ color: GOLD }}>
              {EMPLOYMENT_OPTIONS.find(e => e.id === employment)?.label ?? ''}
              {sector ? ` · ${SECTOR_OPTIONS.find(s => s.id === sector)?.label ?? ''}` : ''}
            </span>
            {' '}— predictions will be tailored for you
          </p>
        </div>
      )}
    </div>
  );
}

// ─── LANGUAGE SELECTOR COMPONENT ─────────────────────────────────────────────
function LanguageSelector({
  selected,
  onSelect,
}: {
  selected: Lang;
  onSelect: (lang: Lang) => void;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(6,10,24,0.7)', border: `1px solid ${GOLD_RGBA(0.14)}` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Languages className="w-3.5 h-3.5" style={{ color: GOLD }} />
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: `${GOLD}80` }}
        >
          Reading Language
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Apni reading kis bhasha mein chahte hain? Choose your prediction language
      </p>

      {/* Language Pills */}
      <div className="grid grid-cols-3 gap-2.5">
        {LANG_OPTIONS.map((lang) => {
          const isSelected = selected === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => onSelect(lang.id)}
              className="relative flex flex-col items-center gap-1.5 rounded-xl p-3.5 transition-all duration-200"
              style={{
                background: isSelected ? GOLD_RGBA(0.12) : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? GOLD_RGBA(0.45) : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isSelected ? `0 4px 20px ${GOLD_RGBA(0.2)}` : 'none',
              }}
            >
              {/* Selected glow dot */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                  style={{ background: GOLD, boxShadow: `0 0 6px ${GOLD}` }}
                />
              )}
              <span style={{ fontSize: 20, lineHeight: 1 }}>{lang.flag}</span>
              <span
                className="text-sm font-bold"
                style={{ color: isSelected ? GOLD : 'rgba(226,232,240,0.7)' }}
              >
                {lang.label}
              </span>
              <span
                className="text-xs text-center leading-tight"
                style={{ color: isSelected ? GOLD_RGBA(0.6) : 'rgba(100,116,139,0.7)' }}
              >
                {lang.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Default note */}
      <p className="text-xs text-center text-slate-600 mt-3">
        Default: Hinglish · Aap baad mein bhi change kar sakte hain
      </p>
    </div>
  );
}

// ─── QUESTION PICKER ─────────────────────────────────────────────────────────
function QuestionPicker({
  gen, selected, onSelect,
}: {
  gen: 'genz' | 'millennial' | 'genx';
  selected: string | null;
  onSelect: (q: LifeQuestion) => void;
}) {
  const questions =
    gen === 'genz' ? GENZ_QUESTIONS
    : gen === 'millennial' ? MILLENNIAL_QUESTIONS
    : GENX_QUESTIONS;

  const genLabel =
    gen === 'genz' ? 'Gen Z · Seekers (born 1995+)'
    : gen === 'millennial' ? 'Millennials · Builders (1980–1994)'
    : 'Gen X · Elders (1970–1979)';

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(6,10,24,0.7)', border: `1px solid ${GOLD_RGBA(0.14)}` }}
    >
      <div className="flex items-center flex-wrap gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#DC2626' }} />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: `${GOLD}80` }}>
          Choose Your Life Question
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: GOLD_RGBA(0.08), color: GOLD, border: `1px solid ${GOLD_RGBA(0.2)}` }}
        >
          {genLabel}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Tap the question on your mind — your analysis will be laser-focused on it
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {questions.map((q) => {
          const Icon = q.icon;
          const isSelected = selected === q.id;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(q)}
              className="relative text-left rounded-xl p-3.5 transition-all duration-200 group"
              style={{
                background: isSelected ? `${q.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? q.color + '40' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isSelected ? `0 4px 16px ${q.color}18` : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${q.color}15`, border: `1px solid ${q.color}30` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: q.color }} />
                </div>
                <span className="text-sm font-medium text-white leading-tight flex-1">{q.label}</span>
                <ChevronRight
                  className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ color: isSelected ? q.color : 'rgba(148,163,184,0.3)' }}
                />
              </div>
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ background: q.color, boxShadow: `0 0 8px ${q.color}` }}
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-center text-slate-600 mt-3">
        Optional — skip to receive a full general analysis
      </p>
    </div>
  );
}

// ─── PARTNER MINI FORM ────────────────────────────────────────────────────────
function PartnerMiniForm({
  label, sublabel, accent, accentRgba, HeaderIcon, data, errors, onChange,
}: {
  label: string;
  sublabel: string;
  accent: string;
  accentRgba: (a: number) => string;
  HeaderIcon: React.ElementType;
  data: FormData;
  errors: Partial<FormData>;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: accentRgba(0.04), border: `1px solid ${accentRgba(0.2)}` }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accentRgba(0.12), border: `1px solid ${accentRgba(0.3)}` }}
        >
          <HeaderIcon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>{label}</p>
          <p className="text-xs" style={{ color: accentRgba(0.5) }}>{sublabel}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELD_META.map((field) => {
          const Icon  = field.icon;
          const error = errors[field.key];
          return (
            <div key={field.key}>
              <label
                htmlFor={`partner-${field.key}`}
                className="block text-xs font-medium tracking-wide mb-2 uppercase"
                style={{ color: accentRgba(0.65) }}
              >
                {field.label}
                {field.key !== 'birth_time' && <span className="text-rose-400 ml-1">*</span>}
              </label>
              <div className="relative">
                <Icon
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: accentRgba(0.35) }}
                />
                <input
                  id={`partner-${field.key}`}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={data[field.key]}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className="input-cosmic w-full h-12 pl-10 pr-4 rounded-xl text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
type Props = { selectedCategory?: SelectedCategory };
const EMPTY_FORM: FormData = { name: '', dob: '', birth_time: '', city: '' };

export default function BirthForm({ selectedCategory }: Props) {
  const router = useRouter();
  const [form, setForm]                   = useState<FormData>(EMPTY_FORM);
  const [partnerForm, setPartnerForm]     = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading]             = useState(false);
  const [errors, setErrors]               = useState<Partial<FormData>>({});
  const [partnerErrors, setPartnerErrors] = useState<Partial<FormData>>({});
  const [selectedQuestion, setSelectedQuestion] = useState<LifeQuestion | null>(null);
  const [gender, setGender]               = useState<'him' | 'her'>('her');
  const [selectedLang, setSelectedLang]   = useState<Lang>('hinglish'); // ✅ NEW
  const [employment, setEmployment]       = useState<string>('');          // ✅ v7.0
  const [sector, setSector]               = useState<string>('');          // ✅ v7.0
  const [mobile, setMobile]               = useState<string>('');          // ✅ v8.0

  const detectedGen      = getGenerationFromDob(form.dob);
  const activeCategoryId = selectedCategory?.id ?? selectedQuestion?.id ?? null;
  const isDualMode       = activeCategoryId !== null && DUAL_IDS.has(activeCategoryId);
  const isExBack         = activeCategoryId === 'ex_back';
  const isToxicBoss      = activeCategoryId === 'toxic_boss';
  const accentColor      = isExBack ? PINK : isToxicBoss ? ORANGE : GOLD;
  const accentRgba       = isExBack ? PINK_RGBA : isToxicBoss ? ORANGE_RGBA : GOLD_RGBA;

  const dualHeading    = isToxicBoss
    ? 'Power Struggle Analysis: You vs Boss'
    : 'Karmic Bond Analysis: Enter Both Details';
  const dualSubheading = isToxicBoss
    ? 'Trikal Guru will analyze the Sun–Saturn authority axis and workplace karma.'
    : isExBack
    ? 'Both birth charts will be analyzed for Venus-Ketu axis and 7th house karma.'
    : 'Both birth charts will be compared using Ashta-Koota Vedic matching.';

  const PartnerIcon         = isToxicBoss ? Briefcase : isExBack ? HeartCrack : Heart;
  const partnerSectionLabel = isToxicBoss ? 'Boss Details' : isExBack ? "Ex-Partner's Details" : "Partner's Details";
  const partnerSublabel     = isToxicBoss ? 'Sun vs Saturn authority axis' : isExBack ? 'Venus-Ketu axis & 7th house' : 'Ashta-Koota compatibility';
  const singleFormLabel     = selectedCategory
    ? `Getting insights for: ${selectedCategory.label}`
    : selectedQuestion
    ? `Getting insights for: ${selectedQuestion.label}`
    : null;

  function validateForm(f: FormData, setE: (e: Partial<FormData>) => void): boolean {
    const e: Partial<FormData> = {};
    if (!f.name.trim()) e.name = 'Name is required';
    if (!f.dob)         e.dob  = 'Date of birth is required';
    if (!f.city.trim()) e.city = 'City is required';
    setE(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const userValid  = validateForm(form, setErrors);
    let partnerValid = true;
    if (isDualMode) partnerValid = validateForm(partnerForm, setPartnerErrors);
    if (!userValid || !partnerValid) return;

    setLoading(true);
    try {
      // Step 1 — Get lat/lng from city
      let lat = 28.6139;
      let lng = 77.2090;
      try {
        const geoRes  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.city)}&format=json&limit=1`
        );
        const geoData = await geoRes.json();
        if (geoData[0]) {
          lat = parseFloat(geoData[0].lat);
          lng = parseFloat(geoData[0].lon);
        }
      } catch {
        console.warn('[Trikal] Geocoding failed — using Delhi default');
      }

      // Step 2 — Build birth data
      const birthData = {
        name:     form.name.trim(),
        dob:      form.dob,
        tob:      form.birth_time || '12:00',
        lat,
        lng,
        cityName: form.city.trim(),
      };

      // Step 3 — Call server API route (Prokerala runs server-side only)
      const kundaliRes = await fetch('/api/kundali', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(birthData),
      });

      if (!kundaliRes.ok) {
        throw new Error('Kundali API failed');
      }

      const { kundali } = await kundaliRes.json();

      // Step 4 — Save to Supabase
      await saveSubmission({
        name:         form.name.trim(),
        dob:          form.dob,
        birth_time:   form.birth_time,
        city:         form.city.trim(),
        energy_score: kundali.planets['Sun']?.strength ?? 75,
        pillar_scores: {
          wealth:   kundali.planets['Jupiter']?.strength ?? 70,
          career:   kundali.planets['Saturn']?.strength  ?? 70,
          love:     kundali.planets['Venus']?.strength   ?? 70,
          health:   kundali.planets['Sun']?.strength     ?? 70,
          students: kundali.planets['Mercury']?.strength ?? 70,
          peace:    kundali.planets['Moon']?.strength    ?? 70,
        },
      });

      // Step 5 — Navigate to result page
      // ✅ NEW: lang param added to URL
      const effectiveQuestion = selectedCategory ?? selectedQuestion;
      const params = new URLSearchParams({
        name:           form.name.trim(),
        dob:            form.dob,
        city:           form.city.trim(),
        tob:            form.birth_time || '12:00',
        lat:            String(lat),
        lng:            String(lng),
        lang:           selectedLang,               // ✅ NEW — language preference
        employment:     employment,                        // ✅ v7.0
        sector:         sector,                            // ✅ v7.0
        mobile:         mobile,                            // ✅ v8.0 — for numerology
        lagna:          kundali.lagna,
        lagnaLord:      kundali.lagnaLord,
        nakshatra:      kundali.nakshatra,
        nakshatraLord:  kundali.nakshatraLord,
        mahadasha:      kundali.currentMahadasha.lord,
        antardasha:     kundali.currentAntardasha.lord,
        dashaBalance:   kundali.dashaBalance,
        choghadiya:     kundali.panchang.choghadiya.name,
        choghadiyaType: kundali.panchang.choghadiya.type,
        tithi:          kundali.panchang.tithi,
        vara:           kundali.panchang.vara,
        yoga:           kundali.panchang.yoga,
        rahuStart:      kundali.panchang.rahuKaal.start,
        rahuEnd:        kundali.panchang.rahuKaal.end,
        abhijeetStart:  kundali.panchang.abhijeetMuhurta.start,
        abhijeetEnd:    kundali.panchang.abhijeetMuhurta.end,
        planets: JSON.stringify(
          Object.values(kundali.planets).map((p: any) => ({
            name:         p.name,
            rashi:        p.rashi,
            house:        p.house,
            strength:     p.strength,
            isRetrograde: p.isRetrograde,
            nakshatra:    p.nakshatra,
            degree:       p.degree,
          }))
        ),
        // ✅ v6.0 — Pratyantar + Sookshma Dasha (Level 3 + 4)
        ...(kundali.currentPratyantar ? {
          pratayantarLord:     kundali.currentPratyantar.lord,
          pratayantarStart:    kundali.currentPratyantar.startDate instanceof Date
            ? kundali.currentPratyantar.startDate.toISOString()
            : String(kundali.currentPratyantar.startDate),
          pratayantarEnd:      kundali.currentPratyantar.endDate instanceof Date
            ? kundali.currentPratyantar.endDate.toISOString()
            : String(kundali.currentPratyantar.endDate),
          pratayantarDays:     String(kundali.currentPratyantar.durationDays),
          pratayantarQuality:  kundali.currentPratyantar.quality,
          pratayantarRemDays:  String(kundali.currentPratyantar.remainingDays),
        } : {}),
        ...(kundali.currentSookshma ? {
          sookshmaLord:        kundali.currentSookshma.lord,
          sookshmaStart:       kundali.currentSookshma.startDate instanceof Date
            ? kundali.currentSookshma.startDate.toISOString()
            : String(kundali.currentSookshma.startDate),
          sookshmaEnd:         kundali.currentSookshma.endDate instanceof Date
            ? kundali.currentSookshma.endDate.toISOString()
            : String(kundali.currentSookshma.endDate),
          sookshmaDays:        String(kundali.currentSookshma.durationDays),
          sookshmaQuality:     kundali.currentSookshma.quality,
        } : {}),
        // Full Pratyantar list — for PratayantarDasha component
        ...(kundali.pratyantar?.length ? {
          pratayantarList: JSON.stringify(
            kundali.pratyantar.map((p: any) => ({
              lord:          p.lord,
              startDate:     p.startDate instanceof Date ? p.startDate.toISOString() : p.startDate,
              endDate:       p.endDate instanceof Date ? p.endDate.toISOString() : p.endDate,
              durationDays:  p.durationDays,
              quality:       p.quality,
              remainingDays: p.remainingDays,
            }))
          ),
        } : {}),
        ...(effectiveQuestion ? {
          autoSegment:      effectiveQuestion.id,
          autoSegmentLabel: effectiveQuestion.label,
        } : {}),
        ...(isDualMode && partnerForm.name.trim() ? {
          partnerName:   partnerForm.name.trim(),
          partnerDob:    partnerForm.dob,
          partnerCity:   partnerForm.city.trim(),
          partnerTime:   partnerForm.birth_time,
          partnerGender: gender,
        } : {}),
      });

      router.push(`/result?${params.toString()}`);

    } catch (err) {
      console.error('[Trikal] Form submit error:', err);
      setLoading(false);
    }
  }

  return (
    <section id="birth-form" className="relative py-24 px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${GOLD_RGBA(0.04)} 0%, transparent 70%)`,
        }}
      />

      <div className={`max-w-2xl mx-auto transition-all duration-500 ${isDualMode ? 'max-w-4xl' : ''}`}>
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.22)}` }}
          >
            <Star className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: `${GOLD}cc` }}>
              Free Analysis
            </span>
          </div>

          {isDualMode ? (
            <>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                style={{ background: accentRgba(0.08), border: `1px solid ${accentRgba(0.28)}` }}
              >
                <PartnerIcon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: accentColor }}>
                  {isToxicBoss ? 'Dual Chart — Boss Mode' : 'Dual Chart — Relationship Mode'}
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
                <span style={{ color: accentColor }}>{dualHeading}</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">{dualSubheading}</p>
            </>
          ) : (
            <>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                <span className="text-white">Begin Your</span>{' '}
                <span className="text-gradient-gold">Cosmic Journey</span>
              </h2>
              {singleFormLabel && (
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                  style={{
                    background: `${selectedCategory?.color ?? GOLD}0d`,
                    border:     `1px solid ${selectedCategory?.color ?? GOLD}35`,
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: selectedCategory?.color ?? GOLD }}>
                    {singleFormLabel}
                  </span>
                </div>
              )}
              <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed mb-6">
                Enter your birth details. Your personalized Trikal analysis will be ready instantly — no login required.
              </p>
              <div
                className="inline-block rounded-2xl px-6 py-4 max-w-lg mx-auto"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_RGBA(0.07)} 0%, rgba(6,10,24,0.9) 100%)`,
                  border:     `1px solid ${GOLD_RGBA(0.2)}`,
                }}
              >
                <p className="font-serif text-base sm:text-lg italic leading-relaxed" style={{ color: `${GOLD}cc` }}>
                  &ldquo;Pranam. Provide your birth details and the one question on your mind — the Guru will answer both.&rdquo;
                </p>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {isDualMode ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: `${accentColor}18` }} />
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: accentRgba(0.08), border: `1px solid ${accentRgba(0.22)}`, color: accentColor }}
                >
                  <Users className="w-3 h-3" />
                  Dual Chart Reading
                </div>
                <div className="flex-1 h-px" style={{ background: `${accentColor}18` }} />
              </div>

              <PartnerMiniForm
                label={isToxicBoss ? 'Your Details (Employee)' : 'Your Details'}
                sublabel="Your birth chart — already being read by the Guru"
                accent={GOLD} accentRgba={GOLD_RGBA} HeaderIcon={User}
                data={form} errors={errors}
                onChange={(field, value) => {
                  setForm(f => ({ ...f, [field]: value }));
                  if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
                }}
              />

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <span className="text-base font-black" style={{ color: accentRgba(0.55) }}>
                  {isToxicBoss ? 'vs' : '♥'}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>

              <PartnerMiniForm
                label={partnerSectionLabel} sublabel={partnerSublabel}
                accent={accentColor} accentRgba={accentRgba} HeaderIcon={PartnerIcon}
                data={partnerForm} errors={partnerErrors}
                onChange={(field, value) => {
                  setPartnerForm(f => ({ ...f, [field]: value }));
                  if (partnerErrors[field]) setPartnerErrors(e => ({ ...e, [field]: undefined }));
                }}
              />

              {/* Partner mobile for ex-back / compatibility */}
              {isExBack && (
                <div
                  className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(244,114,182,0.05)', border: '1px solid rgba(244,114,182,0.15)' }}
                >
                  <span style={{ fontSize: 13 }}>📱</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: '#F472B6' }}>
                      Ex-Partner ka mobile number (Optional)
                    </p>
                    <p className="text-xs text-slate-500">
                      Numerology cross-match — kya aapke numbers compatible hain?
                    </p>
                  </div>
                </div>
              )}

              {!isToxicBoss && (
                <div className="flex items-center gap-3 px-1">
                  <span className="text-xs text-slate-500">Their gender:</span>
                  <div className="flex items-center gap-2">
                    {(['her', 'him'] as const).map((g) => {
                      const isActive = gender === g;
                      return (
                        <button
                          key={g} type="button" onClick={() => setGender(g)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                          style={{
                            background: isActive ? PINK_RGBA(0.14) : 'rgba(255,255,255,0.03)',
                            border:     `1px solid ${isActive ? PINK_RGBA(0.4) : 'rgba(255,255,255,0.08)'}`,
                            color:      isActive ? PINK : 'rgba(148,163,184,0.55)',
                          }}
                        >
                          <span style={{ fontSize: '14px', lineHeight: 1 }}>{g === 'her' ? '♀' : '♂'}</span>
                          {g === 'her' ? 'Her' : 'Him'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ✅ v9.0 — Profile + Mobile in Dual Mode */}
              <ProfileSelector
                employment={employment}
                sector={sector}
                onEmploymentChange={setEmployment}
                onSectorChange={setSector}
              />

              <MobileNumerologyCapture
                mobile={mobile}
                onMobileChange={setMobile}
                name={form.name}
                lang={selectedLang}
              />

              {/* ✅ Language Selector — Dual Mode */}
              <LanguageSelector selected={selectedLang} onSelect={setSelectedLang} />

              <PrivacyNote />
              <SubmitButton
                loading={loading} accentColor={accentColor} accentRgba={accentRgba}
                label={
                  loading
                    ? isToxicBoss ? 'Analyzing Boss–Employee Charts...'
                      : isExBack  ? 'Running Karmic Closure Algorithm...'
                      : 'Comparing Both Charts...'
                    : isToxicBoss ? 'Reveal Boss Karma Radar — Free'
                      : isExBack  ? 'Reveal Karmic Closure Status — Free'
                      : 'Reveal Our Compatibility — Free'
                }
                IconEl={PartnerIcon}
              />
            </div>
          ) : (
            <div
              className="rounded-3xl p-8 sm:p-10"
              style={{
                background:     'rgba(6,12,28,0.85)',
                border:         `1px solid ${GOLD_RGBA(0.16)}`,
                backdropFilter: 'blur(16px)',
                boxShadow:      `0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 ${GOLD_RGBA(0.06)}`,
              }}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {FIELD_META.map((field) => {
                    const Icon  = field.icon;
                    const error = errors[field.key];
                    return (
                      <div key={field.key}>
                        <label
                          htmlFor={field.key}
                          className="block text-xs font-medium tracking-wide mb-2 uppercase"
                          style={{ color: `${GOLD}99` }}
                        >
                          {field.label}
                          {field.key !== 'birth_time' && <span className="text-rose-400 ml-1">*</span>}
                        </label>
                        <div className="relative">
                          <Icon
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                            style={{ color: GOLD_RGBA(0.4) }}
                          />
                          <input
                            id={field.key}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={form[field.key]}
                            onChange={(e) => {
                              setForm(f => ({ ...f, [field.key]: e.target.value }));
                              if (errors[field.key]) setErrors(er => ({ ...er, [field.key]: undefined }));
                              if (field.key === 'dob') setSelectedQuestion(null);
                            }}
                            className="input-cosmic w-full h-12 pl-10 pr-4 rounded-xl text-sm"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>
                        {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
                      </div>
                    );
                  })}
                </div>

                {/* ✅ v7.0 — Employment + Sector Profiling — always visible */}
                <ProfileSelector
                  employment={employment}
                  sector={sector}
                  onEmploymentChange={setEmployment}
                  onSectorChange={setSector}
                />

                {detectedGen && !selectedCategory && (
                  <QuestionPicker
                    gen={detectedGen}
                    selected={selectedQuestion?.id ?? null}
                    onSelect={setSelectedQuestion}
                  />
                )}

                {/* ✅ Language Selector — Single Mode */}
                <LanguageSelector selected={selectedLang} onSelect={setSelectedLang} />

                {/* ✅ v8.0 — Mobile Number + Numerology Preview */}
                <MobileNumerologyCapture
                  mobile={mobile}
                  onMobileChange={setMobile}
                  name={form.name}
                  lang={selectedLang}
                />

                <PrivacyNote />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background: loading
                      ? GOLD_RGBA(0.25)
                      : `linear-gradient(135deg, ${GOLD} 0%, #A8862A 100%)`,
                    color:     '#020817',
                    boxShadow: loading ? 'none' : `0 0 32px ${GOLD_RGBA(0.38)}`,
                  }}
                >
                  {!loading && (
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(135deg, #E8CC6A 0%, #D4AF37 100%)' }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Reading the stars...
                      </>
                    ) : (selectedCategory ?? selectedQuestion) ? (
                      `Reveal My ${(selectedCategory ?? selectedQuestion)!.label} Reading — Free`
                    ) : (
                      'Reveal My Trikal Score — Free'
                    )}
                  </span>
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Join 10,000+ seekers who have discovered their cosmic blueprint
        </p>
      </div>
    </section>
  );
}

// ─── PRIVACY NOTE ─────────────────────────────────────────────────────────────
function PrivacyNote() {
  return (
    <div
      className="rounded-xl p-4 flex items-start gap-3"
      style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.14)}` }}
    >
      <Star className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: GOLD_RGBA(0.5) }} />
      <p className="text-xs text-slate-400 leading-relaxed">
        Your birth data is used solely to calculate your cosmic energy profile.
        We never share or sell your personal information.
      </p>
    </div>
  );
}

// ─── SUBMIT BUTTON ────────────────────────────────────────────────────────────
function SubmitButton({
  loading, accentColor, accentRgba, label, IconEl,
}: {
  loading: boolean;
  accentColor: string;
  accentRgba: (a: number) => string;
  label: string;
  IconEl: React.ElementType;
}) {
  return (
    <button
      type="submit" disabled={loading}
      className="w-full h-14 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden group flex items-center justify-center gap-2"
      style={{
        background: loading
          ? accentRgba(0.2)
          : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
        color:     loading ? accentColor : '#fff',
        boxShadow: loading ? 'none' : `0 0 32px ${accentRgba(0.35)}`,
      }}
    >
      {!loading && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(135deg, ${accentColor}dd 0%, ${accentColor}aa 100%)` }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />{label}</>
        ) : (
          <><IconEl className="w-4 h-4" />{label}</>
        )}
      </span>
    </button>
  );
}
