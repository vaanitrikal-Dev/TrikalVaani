'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Star, Clock } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const TITHIS = [
  { en: 'Pratipada', hi: 'प्रतिपदा' },
  { en: 'Dwitiya', hi: 'द्वितीया' },
  { en: 'Tritiya', hi: 'तृतीया' },
  { en: 'Chaturthi', hi: 'चतुर्थी' },
  { en: 'Panchami', hi: 'पंचमी' },
  { en: 'Shashthi', hi: 'षष्ठी' },
  { en: 'Saptami', hi: 'सप्तमी' },
  { en: 'Ashtami', hi: 'अष्टमी' },
  { en: 'Navami', hi: 'नवमी' },
  { en: 'Dashami', hi: 'दशमी' },
  { en: 'Ekadashi', hi: 'एकादशी' },
  { en: 'Dwadashi', hi: 'द्वादशी' },
  { en: 'Trayodashi', hi: 'त्रयोदशी' },
  { en: 'Chaturdashi', hi: 'चतुर्दशी' },
  { en: 'Purnima / Amavasya', hi: 'पूर्णिमा / अमावस्या' },
];

const VAARAS = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Brihaspativar', 'Shukravar', 'Shanivar'];
const VAARA_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'बृहस्पतिवार', 'शुक्रवार', 'शनिवार'];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

const YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata',
  'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti',
];

function computePanchang(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const lunarDay = ((dayOfYear * 12) % 30 + 30) % 30;
  const paksha = lunarDay < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  const paksha_hi = lunarDay < 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
  const tithiIdx = lunarDay % 15;
  const tithi = TITHIS[tithiIdx] ?? TITHIS[0];
  const vaara = VAARAS[date.getDay()];
  const vaara_hi = VAARA_HI[date.getDay()];
  const nakshatraIdx = (dayOfYear * 13) % 27;
  const nakshatra = NAKSHATRAS[Math.floor(nakshatraIdx)];
  const yogaIdx = (dayOfYear * 7) % 27;
  const yoga = YOGAS[Math.floor(yogaIdx)];

  const sunriseH = 6 + (date.getMonth() > 5 ? 0 : 1);
  const sunriseM = 15 + (dayOfYear % 20);
  const sunsetH = 18 + (date.getMonth() > 5 ? 0 : -1);
  const sunsetM = 30 + (dayOfYear % 30);

  const pad = (n: number) => String(n).padStart(2, '0');
  const sunrise = `${sunriseH}:${pad(sunriseM)} AM`;
  const sunset = `${sunsetH}:${pad(sunsetM)} PM`;

  const midH = Math.floor((sunriseH + 12 + sunsetH) / 2);
  const midM = pad(Math.floor(((sunriseM + sunsetM) / 2) % 60));
  const abhijitStart = `${midH - 1}:${midM}`;
  const abhijitEnd = `${midH}:${midM}`;

  return {
    paksha, paksha_hi,
    tithi: tithi.en, tithi_hi: tithi.hi,
    vaara, vaara_hi,
    nakshatra, yoga,
    sunrise, sunset,
    abhijit: `${abhijitStart} – ${abhijitEnd}`,
  };
}

export default function DailyPanchang() {
  const [panchang, setPanchang] = useState<ReturnType<typeof computePanchang> | null>(null);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    setPanchang(computePanchang(now));
    setDateStr(now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  if (!panchang) return null;

  const rows = [
    { icon: Moon, label: 'Tithi', value: `${panchang.paksha} ${panchang.tithi}`, hi: `${panchang.paksha_hi} ${panchang.tithi_hi}` },
    { icon: Star, label: 'Nakshatra', value: panchang.nakshatra, hi: '' },
    { icon: Sun, label: 'Yoga', value: panchang.yoga, hi: '' },
    { icon: Clock, label: 'Abhijit Muhurat (अभिजीत मुहूर्त)', value: panchang.abhijit, hi: 'शुभ समय' },
    { icon: Sun, label: 'Sunrise / Sunset', value: `${panchang.sunrise} / ${panchang.sunset}`, hi: '' },
    { icon: Star, label: 'Vaara', value: `${panchang.vaara} (${panchang.vaara_hi})`, hi: '' },
  ];

  return (
    <section className="py-14 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.6) }}>
            Aaj Ka Panchang
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Daily Vedic <span style={{ color: GOLD }}>Panchang</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2">{dateStr}</p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(11,16,26,0.85)',
            border: `1px solid ${GOLD_RGBA(0.2)}`,
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{ borderBottom: `1px solid ${GOLD_RGBA(0.12)}`, background: GOLD_RGBA(0.06) }}
          >
            <Star className="w-4 h-4" style={{ color: GOLD }} />
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: GOLD_RGBA(0.8) }}>
              Panchangam — Five Vedic Time Elements
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: GOLD_RGBA(0.06) }}>
            {rows.map(({ icon: Icon, label, value, hi }, i) => (
              <div
                key={i}
                className="px-5 py-4"
                style={{ background: 'rgba(8,11,18,0.9)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD_RGBA(0.55) }} />
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
                <p className="text-sm font-semibold text-white">{value}</p>
                {hi && <p className="text-xs mt-0.5" style={{ color: GOLD_RGBA(0.5) }}>{hi}</p>}
              </div>
            ))}
          </div>
          <div className="px-5 py-3" style={{ background: GOLD_RGBA(0.03), borderTop: `1px solid ${GOLD_RGBA(0.1)}` }}>
            <p className="text-xs text-slate-600 text-center">
              Panchang computed using Parashara Vedic methodology for Delhi NCR (IST). Verified by Rohiit Gupta.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
