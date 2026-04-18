'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const RASHIS = [
  {
    id: 'mesh', name: 'Mesh', hindi: 'मेष', symbol: '♈', sign: 'Aries',
    lord: 'Mars', element: 'Fire',
    color: '#EF4444',
    prediction: 'Mangal bestows energy and drive today. A bold decision you have been postponing will find clarity in the afternoon hours. Your Mars-Rahu axis is activated — ideal for competitive pursuits.',
    tip: 'Aaj bold raho, overthinking mat karo. Ek kaam seedha karo — results aayenge.',
  },
  {
    id: 'vrishabh', name: 'Vrishabh', hindi: 'वृषभ', symbol: '♉', sign: 'Taurus',
    lord: 'Venus', element: 'Earth',
    color: '#10B981',
    prediction: 'Shukra (Venus) activates your 2nd house of wealth today. Financial conversations go in your favour. A long-pending payment or appreciation arrives before sunset. Relationships receive warmth.',
    tip: 'Paise ki baat aaj karo — Venus tumhara saath de raha hai. Rishte mein thoda softness dikhao.',
  },
  {
    id: 'mithun', name: 'Mithun', hindi: 'मिथुन', symbol: '♊', sign: 'Gemini',
    lord: 'Mercury', element: 'Air',
    color: '#3B82F6',
    prediction: 'Budh in your communication house gives you extraordinary verbal intelligence today. Presentations, negotiations, and creative writing are powerfully supported. Avoid signing legal documents after 6 PM.',
    tip: 'Bol ke kaam nikalte hain aaj. Apni baat clearly express karo — Mercury tumhare saath hai.',
  },
  {
    id: 'kark', name: 'Kark', hindi: 'कर्क', symbol: '♋', sign: 'Cancer',
    lord: 'Moon', element: 'Water',
    color: '#8B5CF6',
    prediction: 'Chandra activates deep emotional wisdom today. Intuition is sharper than logic — trust your gut feeling in decisions. Family matters require your attention and your patience will be rewarded.',
    tip: 'Dil ki baat suno aaj. Ghar waalon ke liye time nikalo — Chandra ki kripa milegi.',
  },
  {
    id: 'simha', name: 'Simha', hindi: 'सिंह', symbol: '♌', sign: 'Leo',
    lord: 'Sun', element: 'Fire',
    color: '#F59E0B',
    prediction: 'Surya blazes in your 10th house sector today — career recognition and authority are highlighted. A senior figure acknowledges your efforts. Your natural leadership magnetism is at its peak.',
    tip: 'Aaj leadership lo — log sun rahe hain. Surya ka tej hai tumhare saath, shine karo.',
  },
  {
    id: 'kanya', name: 'Kanya', hindi: 'कन्या', symbol: '♍', sign: 'Virgo',
    lord: 'Mercury', element: 'Earth',
    color: '#06B6D4',
    prediction: 'Budh in earth alignment brings precise analytical clarity today. Problem-solving, research, and detailed work flow effortlessly. Health matters receive positive planetary support — a great day to begin a wellness routine.',
    tip: 'Detail mein jao aaj — chhoti si improvement bada result degi. Health pe dhyan do.',
  },
  {
    id: 'tula', name: 'Tula', hindi: 'तुला', symbol: '♎', sign: 'Libra',
    lord: 'Venus', element: 'Air',
    color: '#EC4899',
    prediction: 'Shukra in your relationship house creates magnetic social energy today. New partnerships, collaborations, and romantic connections are heavily favoured. Balance is your superpower — use it in negotiations.',
    tip: 'Balance banao, connections banao. Venus ke din mein pyaar aur partnership dono milti hain.',
  },
  {
    id: 'vrischik', name: 'Vrischik', hindi: 'वृश्चिक', symbol: '♏', sign: 'Scorpio',
    lord: 'Mars + Ketu', element: 'Water',
    color: '#DC2626',
    prediction: 'Mars-Ketu combination intensifies your investigative instincts today. Hidden information surfaces. Transformation is the theme — what you release today creates space for something more powerful to arrive.',
    tip: 'Jo purana hai usse chhodo aaj. Transformation mein power hai — Mars-Ketu ka gift hai.',
  },
  {
    id: 'dhanu', name: 'Dhanu', hindi: 'धनु', symbol: '♐', sign: 'Sagittarius',
    lord: 'Jupiter', element: 'Fire',
    color: '#7C3AED',
    prediction: 'Guru (Jupiter) expands your horizons today. Higher learning, philosophy, travel, and international connections are all activated. A mentor or elder brings wisdom you have been seeking. Optimism is magnetic.',
    tip: 'Seekho, badho, travel karo — Guru ki kripa aaj fully on hai. Enthusiasm contagious hai.',
  },
  {
    id: 'makar', name: 'Makar', hindi: 'मकर', symbol: '♑', sign: 'Capricorn',
    lord: 'Saturn', element: 'Earth',
    color: '#64748B',
    prediction: 'Shani activates your karma house today with discipline and reward energy. Hard work from the past months receives tangible results. Avoid shortcuts — the straight path is the fastest today.',
    tip: 'Mehnat ka phal aaj milega. Shani ka niyam hai — jo kiya woh aayega. Patience rakho.',
  },
  {
    id: 'kumbh', name: 'Kumbh', hindi: 'कुम्भ', symbol: '♒', sign: 'Aquarius',
    lord: 'Saturn + Rahu', element: 'Air',
    color: '#0EA5E9',
    prediction: 'Saturn-Rahu energy makes you the most innovative thinker in any room today. Unconventional ideas that seemed impractical suddenly have clarity of execution. Technology and social networks amplify your reach.',
    tip: 'Out-of-the-box socho aaj. Log tumhara perspective sunna chahte hain — share karo.',
  },
  {
    id: 'meen', name: 'Meen', hindi: 'मीन', symbol: '♓', sign: 'Pisces',
    lord: 'Jupiter + Ketu', element: 'Water',
    color: '#2DD4BF',
    prediction: 'Guru-Ketu spiritual axis brings profound inner clarity today. Intuitive insights arrive in meditation or quiet moments. Creative and artistic work flows with divine inspiration. Trust the invisible guidance.',
    tip: 'Aaj andar jao — meditation mein kuch reveal hoga. Creative work mein Guru ki kripa bahegi.',
  },
];

export default function DailyRashifal() {
  const [active, setActive] = useState(0);
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);

  const rashi = RASHIS[active];

  const prev = () => setActive((a) => (a - 1 + RASHIS.length) % RASHIS.length);
  const next = () => setActive((a) => (a + 1) % RASHIS.length);

  return (
    <section className="py-14 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.6) }}>
            Aaj Ka Rashifal
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Daily <span style={{ color: GOLD }}>Horoscope</span> — 12 Rashis
          </h2>
          {today && <p className="text-slate-500 text-sm mt-2">{today}</p>}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {RASHIS.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setActive(i)}
              className="flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: active === i ? `${r.color}22` : 'rgba(11,16,26,0.7)',
                border: `1px solid ${active === i ? r.color : GOLD_RGBA(0.1)}`,
                minWidth: '52px',
              }}
            >
              <span className="text-base leading-none">{r.symbol}</span>
              <span className="text-xs font-medium" style={{ color: active === i ? r.color : '#94a3b8' }}>
                {r.name}
              </span>
            </button>
          ))}
        </div>

        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: 'rgba(11,16,26,0.9)',
            border: `1px solid ${rashi.color}33`,
            boxShadow: `0 0 40px ${rashi.color}11`,
          }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${rashi.color}22`, background: `${rashi.color}0a` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{rashi.symbol}</span>
              <div>
                <p className="font-serif font-bold text-lg text-white">{rashi.name} <span className="text-base font-normal text-slate-400">({rashi.hindi})</span></p>
                <p className="text-xs text-slate-500">{rashi.sign} · Lord: {rashi.lord} · {rashi.element}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}
              >
                <ChevronLeft className="w-4 h-4" style={{ color: GOLD }} />
              </button>
              <button
                onClick={next}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: GOLD }} />
              </button>
            </div>
          </div>

          <div className="px-6 py-5">
            <p className="text-slate-300 text-sm leading-relaxed mb-5">{rashi.prediction}</p>
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: `${rashi.color}0d`, border: `1px solid ${rashi.color}33` }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: rashi.color }}>
                Jini Tip (जिनी टिप)
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{rashi.tip}</p>
            </div>
          </div>

          <div className="px-6 pb-4 flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Rashi {active + 1} of 12
            </p>
            <p className="text-xs text-slate-600">
              Verified by Rohiit Gupta, Chief Vedic Architect
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
